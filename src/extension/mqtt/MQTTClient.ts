/**
 * MQTT客户端实现
 * 基于Serial-Studio MQTT::Client的TypeScript版本
 */

import { EventEmitter } from 'events';
import * as mqtt from 'mqtt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { 
  MQTTConfig, 
  MQTTConnectionState, 
  MQTTClientMode, 
  MQTTProtocolVersion,
  QoSLevel,
  SSLProtocol,
  PeerVerifyMode,
  MQTTMessage,
  MQTTStatistics,
  MQTTConnectionInfo,
  MQTTClientError,
  PublishOptions,
  SubscriptionOptions,
  BatchMessage,
  BatchPublishOptions,
  BatchPublishResult,
  IMQTTClient,
  MQTTClientEvents
} from './types';

export class MQTTClient extends EventEmitter implements IMQTTClient {
  private client: mqtt.MqttClient | null = null;
  private config: MQTTConfig;
  private connectionState: MQTTConnectionState = MQTTConnectionState.Disconnected;
  private statistics!: MQTTStatistics; // 在构造函数中通过initializeStatistics初始化
  private reconnectTimer: NodeJS.Timeout | null = null;
  private statisticsTimer: NodeJS.Timeout | null = null;
  
  // 性能监控
  private messageLatencies: number[] = [];
  private lastStatisticsUpdate = Date.now();
  
  // QoS消息跟踪
  private qos1Messages = new Map<number, { resolve: () => void; reject: (error: Error) => void; timestamp: number }>();
  private qos2Messages = new Map<number, { resolve: () => void; reject: (error: Error) => void; timestamp: number; state: 'PUBREC' | 'PUBCOMP' }>();
  private messageIdCounter = 1;
  private qosTimeoutMs = process.env.NODE_ENV === 'test' ? 1000 : 30000; // 测试环境1秒，生产环境30秒
  private qosCleanupTimer: NodeJS.Timeout | null = null;
  
  // 热路径批量发送缓冲区
  private hotpathBuffer: BatchMessage[] = [];
  private hotpathTimer: NodeJS.Timeout | null = null;
  private hotpathBatchSize = 50;
  private hotpathBatchTimeout = 100; // 100ms
  
  constructor(config: MQTTConfig) {
    super();
    this.config = { ...config };
    
    // 如果没有clientId，生成一个随机ID
    if (!this.config.clientId) {
      this.regenerateClientId();
    }
    
    this.initializeStatistics();
    this.startStatisticsTimer();
    this.startQosCleanupTimer();
  }

  // ============================================================================
  // 公共接口实现
  // ============================================================================

  async connect(): Promise<void> {
    if (this.connectionState === MQTTConnectionState.Connected) {
      return;
    }

    if (this.connectionState === MQTTConnectionState.Connecting) {
      throw new Error('Connection already in progress');
    }

    this.connectionState = MQTTConnectionState.Connecting;
    this.statistics.connectionInfo.state = MQTTConnectionState.Connecting;

    try {
      const connectOptions = this.buildConnectOptions();
      const brokerUrl = this.buildBrokerUrl();
      
      this.client = mqtt.connect(brokerUrl, connectOptions);
      
      this.setupClientEventHandlers();
      
      // 等待连接完成或失败
      await new Promise<void>((resolve, reject) => {
        const defaultTimeout = process.env.NODE_ENV === 'test' ? 2 : 30; // 测试环境2秒，生产环境30秒
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, (this.config.connectTimeout || defaultTimeout) * 1000); // 使用配置的超时时间

        this.client!.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.client!.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (error) {
      this.connectionState = MQTTConnectionState.Disconnected;
      this.statistics.connectionInfo.state = MQTTConnectionState.Disconnected;
      
      const mqttError: MQTTClientError = {
        code: 'CONNECTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown connection error',
        timestamp: new Date(),
        recoverable: true
      };
      
      this.statistics.errors.push(mqttError);
      this.emit('error', mqttError);
      throw error;
    }
  }

  async disconnect(force?: boolean): Promise<void> {
    if (this.connectionState === MQTTConnectionState.Disconnected) {
      return;
    }

    this.connectionState = MQTTConnectionState.Disconnecting;
    this.statistics.connectionInfo.state = MQTTConnectionState.Disconnecting;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      return new Promise<void>((resolve) => {
        this.client!.end(force || false, {}, () => {
          this.client = null;
          this.connectionState = MQTTConnectionState.Disconnected;
          this.statistics.connectionInfo.state = MQTTConnectionState.Disconnected;
          this.emit('disconnected');
          resolve();
        });
      });
    }
  }

  async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  isConnected(): boolean {
    return this.connectionState === MQTTConnectionState.Connected && 
           this.client?.connected === true;
  }

  async publish(topic: string, payload: Buffer, options: PublishOptions = {}): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('MQTT client is not connected');
    }

    if (this.config.mode !== MQTTClientMode.Publisher) {
      throw new Error('Client is not in publisher mode');
    }

    const qos = options.qos || QoSLevel.AtMostOnce;
    const publishOptions: mqtt.IClientPublishOptions = {
      qos,
      retain: options.retain || false,
      dup: options.dup || false
    };

    const startTime = Date.now();

    return new Promise<void>((resolve, reject) => {
      // 对于QoS 0，直接发布不需要额外处理
      if (qos === QoSLevel.AtMostOnce) {
        this.client!.publish(topic, payload, publishOptions, (error, packet) => {
          const latency = Date.now() - startTime;
          this.recordLatency(latency);
          
          if (error) {
            const mqttError: MQTTClientError = {
              code: 'PUBLISH_FAILED',
              message: error.message,
              timestamp: new Date(),
              recoverable: true
            };
            this.statistics.errors.push(mqttError);
            reject(error);
          } else {
            this.statistics.connectionInfo.messagesSent++;
            this.statistics.connectionInfo.bytesSent += payload.length;
            resolve();
          }
        });
      } else {
        // 对于QoS 1和2，需要等待确认
        const messageId = this.getNextMessageId();
        (publishOptions as any).messageId = messageId;

        this.client!.publish(topic, payload, publishOptions, (error, packet) => {
          const latency = Date.now() - startTime;
          this.recordLatency(latency);
          
          if (error) {
            const mqttError: MQTTClientError = {
              code: 'PUBLISH_FAILED',
              message: error.message,
              timestamp: new Date(),
              recoverable: true
            };
            this.statistics.errors.push(mqttError);
            reject(error);
            return;
          }

          this.statistics.connectionInfo.messagesSent++;
          this.statistics.connectionInfo.bytesSent += payload.length;

          if (qos === QoSLevel.AtLeastOnce) {
            // QoS 1：等待PUBACK
            this.qos1Messages.set(messageId, {
              resolve,
              reject,
              timestamp: Date.now()
            });
          } else if (qos === QoSLevel.ExactlyOnce) {
            // QoS 2：等待PUBREC
            this.qos2Messages.set(messageId, {
              resolve,
              reject,
              timestamp: Date.now(),
              state: 'PUBREC'
            });
          }
        });
      }
    });
  }

  async publishBatch(messages: BatchMessage[], options: BatchPublishOptions = {}): Promise<BatchPublishResult[]> {
    if (!this.isConnected()) {
      throw new Error('MQTT client is not connected');
    }

    if (this.config.mode !== MQTTClientMode.Publisher) {
      throw new Error('Client is not in publisher mode');
    }

    if (messages.length === 0) {
      return [];
    }

    const {
      maxBatchSize = 100,
      batchTimeout = 10000,
      maxConcurrency = 10,
      onBatchStart,
      onBatchProgress,
      onBatchComplete
    } = options;

    const results: BatchPublishResult[] = [];
    let completedCount = 0;

    // 通知批量开始
    if (onBatchStart) {
      onBatchStart(messages.length);
    }

    // 将消息分批处理
    const batches: BatchMessage[][] = [];
    for (let i = 0; i < messages.length; i += maxBatchSize) {
      batches.push(messages.slice(i, i + maxBatchSize));
    }

    for (const batch of batches) {
      // 使用并发控制处理每个批次
      const batchPromises = batch.map(async (message, index) => {
        const startTime = Date.now();
        
        try {
          await this.publish(message.topic, message.payload, message.options);
          const result: BatchPublishResult = {
            topic: message.topic,
            success: true,
            latency: Date.now() - startTime
          };
          
          completedCount++;
          if (onBatchProgress) {
            onBatchProgress(completedCount, messages.length);
          }
          
          return result;
        } catch (error) {
          const result: BatchPublishResult = {
            topic: message.topic,
            success: false,
            error: error as Error,
            latency: Date.now() - startTime
          };
          
          completedCount++;
          if (onBatchProgress) {
            onBatchProgress(completedCount, messages.length);
          }
          
          return result;
        }
      });

      // 控制并发数量
      const batchResults = await this.processConcurrently(batchPromises, maxConcurrency);
      results.push(...batchResults);

      // 如果不是最后一个批次，等待一小段时间避免过度占用资源
      if (batch !== batches[batches.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // 通知批量完成
    if (onBatchComplete) {
      onBatchComplete(results);
    }

    return results;
  }

  async subscribe(topic: string, options: SubscriptionOptions = { qos: QoSLevel.AtMostOnce }): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('MQTT client is not connected');
    }

    if (this.config.mode !== MQTTClientMode.Subscriber) {
      throw new Error('Client is not in subscriber mode');
    }

    return new Promise<void>((resolve, reject) => {
      this.client!.subscribe(topic, { qos: options.qos }, (error, granted) => {
        if (error) {
          const mqttError: MQTTClientError = {
            code: 'SUBSCRIBE_FAILED',
            message: error.message,
            timestamp: new Date(),
            recoverable: true
          };
          this.statistics.errors.push(mqttError);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise<void>((resolve, reject) => {
      this.client!.unsubscribe(topic, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  updateConfig(newConfig: Partial<MQTTConfig>): void {
    const wasConnected = this.isConnected();
    
    // 合并配置
    this.config = { ...this.config, ...newConfig };
    
    this.emit('configurationChanged');
    
    // 如果SSL配置改变，触发相应事件
    if (newConfig.ssl) {
      this.emit('sslConfigurationChanged');
    }
    
    // 如果连接中且配置发生了需要重连的变化，自动重连
    if (wasConnected && this.requiresReconnection(newConfig)) {
      this.reconnect().catch(error => {
        const mqttError: MQTTClientError = {
          code: 'RECONNECT_FAILED',
          message: error.message,
          timestamp: new Date(),
          recoverable: true
        };
        this.emit('error', mqttError);
      });
    }
  }

  getConfig(): MQTTConfig {
    return { ...this.config };
  }

  validateConfig(config: MQTTConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证主机名
    if (!config.hostname || config.hostname.trim() === '') {
      errors.push('Hostname is required');
    }

    // 验证端口
    if (config.port < 1 || config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    // 验证客户端ID
    if (!config.clientId || config.clientId.trim() === '') {
      errors.push('Client ID is required');
    }

    // 验证主题过滤器（如果设置了）
    if (config.topicFilter && !this.isValidTopicFilter(config.topicFilter)) {
      errors.push('Invalid topic filter format');
    }

    // 验证Keep Alive
    if (config.keepAlive < 0 || config.keepAlive > 65535) {
      errors.push('Keep alive must be between 0 and 65535');
    }

    // 验证SSL配置
    if (config.ssl.enabled) {
      if (config.ssl.peerVerifyDepth < 0) {
        errors.push('SSL peer verify depth must be non-negative');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getStatistics(): MQTTStatistics {
    this.updatePerformanceStatistics();
    return { ...this.statistics };
  }

  resetStatistics(): void {
    this.initializeStatistics();
    this.messageLatencies = [];
    this.emit('statisticsUpdated', this.statistics);
  }

  async hotpathTxFrame(data: Buffer): Promise<void> {
    if (!this.isConnected() || this.config.mode !== MQTTClientMode.Publisher) {
      return;
    }

    if (!this.config.topicFilter) {
      // 热路径中的错误不应该抛出，而是记录并继续
      const mqttError: MQTTClientError = {
        code: 'HOTPATH_TX_FAILED',
        message: 'No topic configured for publishing',
        timestamp: new Date(),
        recoverable: true
      };
      this.statistics.errors.push(mqttError);
      this.emit('error', mqttError);
      return;
    }

    // 热路径优化：使用批量缓冲区
    const message: BatchMessage = {
      topic: this.config.topicFilter,
      payload: data,
      options: { qos: QoSLevel.AtMostOnce }
    };

    this.hotpathBuffer.push(message);

    // 如果缓冲区满了，立即发送
    if (this.hotpathBuffer.length >= this.hotpathBatchSize) {
      this.flushHotpathBuffer();
    } else {
      // 否则设置定时器
      if (!this.hotpathTimer) {
        this.hotpathTimer = setTimeout(() => {
          this.flushHotpathBuffer();
        }, this.hotpathBatchTimeout);
      }
    }
  }
  
  private flushHotpathBuffer(): void {
    if (this.hotpathBuffer.length === 0) {
      return;
    }

    if (this.hotpathTimer) {
      clearTimeout(this.hotpathTimer);
      this.hotpathTimer = null;
    }

    const messagesToSend = [...this.hotpathBuffer];
    this.hotpathBuffer = [];

    // 批量发送，不等待结果（热路径优化）
    this.publishBatch(messagesToSend, {
      maxConcurrency: 20, // 高并发
      onBatchComplete: (results) => {
        // 统计错误
        const errors = results.filter(r => !r.success);
        if (errors.length > 0) {
          const mqttError: MQTTClientError = {
            code: 'HOTPATH_BATCH_PARTIAL_FAILURE',
            message: `${errors.length}/${results.length} messages failed in hotpath batch`,
            timestamp: new Date(),
            recoverable: true
          };
          this.statistics.errors.push(mqttError);
          this.emit('error', mqttError);
        }
      }
    }).catch(error => {
      const mqttError: MQTTClientError = {
        code: 'HOTPATH_BATCH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown hotpath batch error',
        timestamp: new Date(),
        recoverable: true
      };
      this.statistics.errors.push(mqttError);
      this.emit('error', mqttError);
    });
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  private buildBrokerUrl(): string {
    const protocol = this.config.ssl.enabled ? 'mqtts' : 'mqtt';
    return `${protocol}://${this.config.hostname}:${this.config.port}`;
  }

  private buildConnectOptions(): mqtt.IClientOptions {
    const options: mqtt.IClientOptions = {
      clientId: this.config.clientId,
      clean: this.config.cleanSession,
      keepalive: this.config.keepAlive,
      protocolVersion: this.config.protocolVersion,
      reconnectPeriod: 0, // 我们自己管理重连
      connectTimeout: 30000,
    };

    // 认证
    if (this.config.username) {
      options.username = this.config.username;
    }
    if (this.config.password) {
      options.password = this.config.password;
    }

    // Will消息
    if (this.config.willMessage) {
      options.will = {
        topic: this.config.willMessage.topic,
        payload: Buffer.from(this.config.willMessage.message),
        qos: this.config.willMessage.qos,
        retain: this.config.willMessage.retain
      };
    }

    // SSL配置
    if (this.config.ssl.enabled) {
      options.rejectUnauthorized = this.config.ssl.peerVerifyMode !== PeerVerifyMode.None;
      
      if (this.config.ssl.caCertificates && this.config.ssl.caCertificates.length > 0) {
        options.ca = this.config.ssl.caCertificates.map(cert => 
          fs.readFileSync(cert, 'utf8')
        );
      }
      
      if (this.config.ssl.clientCertificate) {
        options.cert = fs.readFileSync(this.config.ssl.clientCertificate, 'utf8');
      }
      
      if (this.config.ssl.privateKey) {
        options.key = fs.readFileSync(this.config.ssl.privateKey, 'utf8');
      }
    }

    return options;
  }

  private setupClientEventHandlers(): void {
    if (!this.client) {return;}

    this.client.on('connect', () => {
      this.connectionState = MQTTConnectionState.Connected;
      this.statistics.connectionInfo.state = MQTTConnectionState.Connected;
      this.statistics.connectionInfo.connectedAt = new Date();
      this.statistics.connectionInfo.reconnectAttempts = 0;
      
      this.emit('connected');
      
      // 如果是订阅者模式且有主题配置，自动订阅
      if (this.config.mode === MQTTClientMode.Subscriber && this.config.topicFilter) {
        this.subscribe(this.config.topicFilter).catch(error => {
          const mqttError: MQTTClientError = {
            code: 'AUTO_SUBSCRIBE_FAILED',
            message: error.message,
            timestamp: new Date(),
            recoverable: true
          };
          this.emit('error', mqttError);
        });
      }
    });

    this.client.on('message', (topic, payload, packet) => {
      if (this.config.mode === MQTTClientMode.Subscriber) {
        const message: MQTTMessage = {
          topic,
          payload,
          qos: packet.qos || QoSLevel.AtMostOnce,
          retain: packet.retain || false,
          dup: packet.dup || false,
          timestamp: new Date()
        };
        
        this.statistics.connectionInfo.messagesReceived++;
        this.statistics.connectionInfo.bytesReceived += payload.length;
        
        this.emit('message', message);
      }
    });

    this.client.on('error', (error) => {
      const mqttError: MQTTClientError = {
        code: 'CLIENT_ERROR',
        message: error.message,
        timestamp: new Date(),
        recoverable: true
      };
      
      this.statistics.errors.push(mqttError);
      this.emit('error', mqttError);
    });

    this.client.on('close', () => {
      if (this.connectionState !== MQTTConnectionState.Disconnecting) {
        // 意外断开，尝试重连
        this.handleUnexpectedDisconnection();
      }
    });
    
    // QoS确认处理
    (this.client as any).on('puback', (packet: any) => {
      this.handlePuback(packet);
    });
    
    (this.client as any).on('pubrec', (packet: any) => {
      this.handlePubrec(packet);
    });
    
    (this.client as any).on('pubcomp', (packet: any) => {
      this.handlePubcomp(packet);
    });

    this.client.on('offline', () => {
      this.connectionState = MQTTConnectionState.Disconnected;
      this.statistics.connectionInfo.state = MQTTConnectionState.Disconnected;
    });
  }

  private handleUnexpectedDisconnection(): void {
    this.connectionState = MQTTConnectionState.Disconnected;
    this.statistics.connectionInfo.state = MQTTConnectionState.Disconnected;
    this.statistics.connectionInfo.reconnectAttempts++;
    
    this.emit('disconnected');
    
    // 启动重连逻辑
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.statistics.connectionInfo.reconnectAttempts), 30000);
    
    this.reconnectTimer = setTimeout(() => {
      this.connectionState = MQTTConnectionState.Reconnecting;
      this.statistics.connectionInfo.state = MQTTConnectionState.Reconnecting;
      this.emit('reconnecting');
      
      this.connect().catch(error => {
        // 重连失败，继续调度下次重连
        if (this.statistics.connectionInfo.reconnectAttempts < 10) { // 最多重试10次
          this.scheduleReconnect();
        }
      });
    }, delay);
  }

  private requiresReconnection(newConfig: Partial<MQTTConfig>): boolean {
    const reconnectFields = [
      'hostname', 'port', 'clientId', 'username', 'password', 
      'protocolVersion', 'cleanSession', 'keepAlive', 'ssl'
    ];
    
    return reconnectFields.some(field => 
      newConfig.hasOwnProperty(field) && 
      JSON.stringify((newConfig as any)[field]) !== JSON.stringify((this.config as any)[field])
    );
  }

  private isValidTopic(topic: string): boolean {
    // MQTT主题验证的基本规则
    if (!topic || topic.length === 0 || topic.length > 65535) {
      return false;
    }
    
    // 不能包含null字符
    if (topic.includes('\0')) {
      return false;
    }
    
    // 普通主题不能包含通配符
    if (topic.includes('+') || topic.includes('#')) {
      return false;
    }
    
    return true;
  }

  private isValidTopicFilter(topicFilter: string): boolean {
    if (!topicFilter || topicFilter.length === 0 || topicFilter.length > 65535) {
      return false;
    }

    // Topic filter可以包含通配符
    // + 通配符只能占据一个完整的级别
    // # 通配符只能在末尾
    
    const levels = topicFilter.split('/');
    
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      
      if (level.includes('#')) {
        // # 只能在最后一级，且必须是单独的字符
        if (i !== levels.length - 1 || level !== '#') {
          return false;
        }
      }
      
      if (level.includes('+')) {
        // + 必须是单独的字符
        if (level !== '+') {
          return false;
        }
      }
    }

    return true;
  }

  private regenerateClientId(): void {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let clientId = 'vscode-serial-studio-';
    
    for (let i = 0; i < 16; i++) {
      clientId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    this.config.clientId = clientId;
  }

  private initializeStatistics(): void {
    this.statistics = {
      connectionInfo: {
        state: MQTTConnectionState.Disconnected,
        reconnectAttempts: 0,
        bytesReceived: 0,
        bytesSent: 0,
        messagesReceived: 0,
        messagesSent: 0
      },
      performance: {
        avgLatency: 0,
        maxLatency: 0,
        messageRate: 0,
        throughput: 0
      },
      errors: []
    };
  }

  private recordLatency(latency: number): void {
    this.messageLatencies.push(latency);
    
    // 只保留最近1000条记录
    if (this.messageLatencies.length > 1000) {
      this.messageLatencies = this.messageLatencies.slice(-1000);
    }
  }

  private updatePerformanceStatistics(): void {
    if (this.messageLatencies.length > 0) {
      this.statistics.performance.avgLatency = 
        this.messageLatencies.reduce((a, b) => a + b, 0) / this.messageLatencies.length;
      this.statistics.performance.maxLatency = Math.max(...this.messageLatencies);
    }

    const now = Date.now();
    const timeDiff = (now - this.lastStatisticsUpdate) / 1000; // 转换为秒
    
    if (timeDiff > 0) {
      this.statistics.performance.messageRate = 
        (this.statistics.connectionInfo.messagesReceived + this.statistics.connectionInfo.messagesSent) / timeDiff;
      this.statistics.performance.throughput = 
        (this.statistics.connectionInfo.bytesReceived + this.statistics.connectionInfo.bytesSent) / timeDiff;
    }
    
    this.lastStatisticsUpdate = now;
  }

  private startStatisticsTimer(): void {
    this.statisticsTimer = setInterval(() => {
      this.updatePerformanceStatistics();
      this.emit('statisticsUpdated', this.statistics);
    }, 5000); // 每5秒更新一次统计信息
  }
  
  private startQosCleanupTimer(): void {
    const cleanupInterval = process.env.NODE_ENV === 'test' ? 100 : 10000; // 测试环境100ms，生产环境10秒
    this.qosCleanupTimer = setInterval(() => {
      this.cleanupExpiredQosMessages();
    }, cleanupInterval);
  }
  
  private getNextMessageId(): number {
    const id = this.messageIdCounter;
    this.messageIdCounter = (this.messageIdCounter % 65535) + 1; // MQTT消息ID范围1-65535
    return id;
  }
  
  private handlePuback(packet: any): void {
    const messageId = packet.messageId;
    const pendingMessage = this.qos1Messages.get(messageId);
    
    if (pendingMessage) {
      this.qos1Messages.delete(messageId);
      pendingMessage.resolve();
    }
  }
  
  private handlePubrec(packet: any): void {
    const messageId = packet.messageId;
    const pendingMessage = this.qos2Messages.get(messageId);
    
    if (pendingMessage && pendingMessage.state === 'PUBREC') {
      // 发送PUBREL
      (this.client! as any).pubrel({ messageId }, (error: any) => {
        if (error) {
          this.qos2Messages.delete(messageId);
          pendingMessage.reject(error);
        } else {
          // 等待PUBCOMP
          pendingMessage.state = 'PUBCOMP';
        }
      });
    }
  }
  
  private handlePubcomp(packet: any): void {
    const messageId = packet.messageId;
    const pendingMessage = this.qos2Messages.get(messageId);
    
    if (pendingMessage && pendingMessage.state === 'PUBCOMP') {
      this.qos2Messages.delete(messageId);
      pendingMessage.resolve();
    }
  }
  
  private cleanupExpiredQosMessages(): void {
    const now = Date.now();
    
    // 清理QoS 1过期消息
    for (const [messageId, message] of this.qos1Messages.entries()) {
      if (now - message.timestamp > this.qosTimeoutMs) {
        this.qos1Messages.delete(messageId);
        message.reject(new Error(`QoS 1 message ${messageId} timeout`));
      }
    }
    
    // 清理QoS 2过期消息
    for (const [messageId, message] of this.qos2Messages.entries()) {
      if (now - message.timestamp > this.qosTimeoutMs) {
        this.qos2Messages.delete(messageId);
        message.reject(new Error(`QoS 2 message ${messageId} timeout`));
      }
    }
  }
  
  private async processConcurrently<T>(promises: Promise<T>[], maxConcurrency: number): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    
    for (const promise of promises) {
      const executePromise = promise.then(result => {
        results.push(result);
      });
      
      executing.push(executePromise);
      
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        // 移除已完成的promise
        for (let i = executing.length - 1; i >= 0; i--) {
          if (await Promise.allSettled([executing[i]]).then(([result]) => result.status === 'fulfilled')) {
            executing.splice(i, 1);
          }
        }
      }
    }
    
    // 等待所有剩余的promise完成
    await Promise.all(executing);
    
    return results;
  }

  // ============================================================================
  // 清理资源
  // ============================================================================

  public dispose(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.statisticsTimer) {
      clearInterval(this.statisticsTimer);
      this.statisticsTimer = null;
    }
    
    if (this.qosCleanupTimer) {
      clearInterval(this.qosCleanupTimer);
      this.qosCleanupTimer = null;
    }
    
    if (this.hotpathTimer) {
      clearTimeout(this.hotpathTimer);
      this.hotpathTimer = null;
    }
    
    // 清理热路径缓冲区
    this.hotpathBuffer = [];
    
    // 清理所有待处理的QoS消息
    for (const [messageId, message] of this.qos1Messages.entries()) {
      message.reject(new Error('Client disposed'));
    }
    this.qos1Messages.clear();
    
    for (const [messageId, message] of this.qos2Messages.entries()) {
      message.reject(new Error('Client disposed'));
    }
    this.qos2Messages.clear();
    
    if (this.client) {
      this.client.end(true);
      this.client = null;
    }
    
    this.removeAllListeners();
  }
}

// MQTTClient类已经继承了EventEmitter，支持标准的on/emit方法
// 具体的事件类型在MQTTClientEvents接口中定义
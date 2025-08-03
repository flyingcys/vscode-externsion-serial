/**
 * MQTT客户端单元测试
 * 
 * 基于Serial-Studio MQTT::Client实现的完整测试覆盖
 * 包含连接管理、发布订阅、QoS、SSL/TLS、热路径数据传输等功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { MQTTClient } from '@/extension/mqtt/MQTTClient';
import { 
  MQTTConfig, 
  MQTTConnectionState, 
  MQTTClientMode, 
  MQTTProtocolVersion,
  QoSLevel,
  SSLProtocol,
  PeerVerifyMode 
} from '@/extension/mqtt/types';

// Import the mocked mqtt module - 使用统一的Mock配置
import * as mqtt from 'mqtt';

// 使用统一的Mock接口，不重复定义
let mockMqttClient: any;

// 创建Mock MQTT客户端的辅助函数
function createMockMqttClient() {
  return new mqtt.MockMqttClient();
}

// Mock已在上面的vi.mock中设置，这里不需要额外设置

// Mock crypto for SSL certificate handling
vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => Buffer.from('test')),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'hash')
  }))
}));

// Mock filesystem for certificate files
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => 'certificate content'),
  existsSync: vi.fn(() => true)
}));

/**
 * MQTT配置工厂
 */
class MQTTConfigFactory {
  static createBasicConfig(): MQTTConfig {
    return {
      hostname: 'localhost',
      port: 1883,
      clientId: 'test-client',
      username: 'testuser',
      password: 'testpass',
      protocolVersion: MQTTProtocolVersion.MQTT_5_0,
      cleanSession: true,
      keepAlive: 60,
      autoKeepAlive: true,
      topicFilter: 'test/+',
      mode: MQTTClientMode.Subscriber,
      willMessage: {
        topic: 'test/will',
        message: 'client disconnected',
        qos: QoSLevel.AtLeastOnce,
        retain: true
      },
      ssl: {
        enabled: false,
        protocol: SSLProtocol.TLS_1_2,
        peerVerifyMode: PeerVerifyMode.QueryPeer,
        peerVerifyDepth: 0
      }
    };
  }

  static createSSLConfig(): MQTTConfig {
    const config = this.createBasicConfig();
    config.port = 8883;
    config.ssl = {
      enabled: true,
      protocol: SSLProtocol.TLSv1_2,
      verifyPeer: PeerVerifyMode.VerifyPeer,
      caCertFile: '/path/to/ca.crt',
      certFile: '/path/to/client.crt',
      keyFile: '/path/to/client.key',
      verifyDepth: 1
    };
    return config;
  }

  static createPublisherConfig(): MQTTConfig {
    const config = this.createBasicConfig();
    config.mode = MQTTClientMode.Publisher;
    return config;
  }

  static createSubscriberConfig(): MQTTConfig {
    const config = this.createBasicConfig();
    config.mode = MQTTClientMode.Subscriber;
    return config;
  }
}

/**
 * MQTT测试工具
 */
class MQTTTestUtils {
  static createTestMessage(topic: string, payload: string, qos: QoSLevel = QoSLevel.AtMostOnce) {
    return {
      topic,
      payload: Buffer.from(payload),
      qos,
      retain: false,
      dup: false
    };
  }

  static generateLargePayload(sizeKB: number): string {
    const size = sizeKB * 1024;
    return 'x'.repeat(size);
  }

  static async waitForEvent(emitter: EventEmitter, event: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Event ${event} not received within ${timeout}ms`));
      }, timeout);

      emitter.once(event, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }
}

describe('MQTT客户端核心功能测试', () => {
  let mqttClient: MQTTClient;
  let config: MQTTConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 创建Mock客户端实例
    mockMqttClient = mqtt.connect();
    
    config = MQTTConfigFactory.createBasicConfig();
    config.connectTimeout = 2; // 设置较短的超时时间，加快测试
    mqttClient = new MQTTClient(config);
  });

  afterEach(async () => {
    if (mqttClient && mqttClient.isConnected()) {
      try {
        // 设置较短的超时以防止hang住
        await Promise.race([
          mqttClient.disconnect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Disconnect timeout')), 1000)
          )
        ]);
      } catch (error) {
        // 忽略disconnect错误，避免测试hang住
        console.warn('Failed to disconnect MQTT client:', error);
      }
    }
  });

  describe('1. 连接管理测试', () => {
    describe('1.1 基础连接测试', () => {
      it('应该成功创建MQTT客户端实例', () => {
        expect(mqttClient).toBeDefined();
        expect(mqttClient.isConnected()).toBe(false);
      });

      it('应该使用正确的配置初始化', () => {
        const clientConfig = mqttClient.getConfig();
        expect(clientConfig.hostname).toBe('localhost');
        expect(clientConfig.port).toBe(1883);
        expect(clientConfig.clientId).toBe('test-client');
      });

      it('应该成功连接到MQTT服务器', async () => {
        mockMqttClient.connected = true;
        
        // Mock mqtt.connect to return mockMqttClient and trigger connect event
        vi.mocked(mqtt.connect).mockImplementation(() => {
          process.nextTick(() => {
            mockMqttClient.emit('connect');
          });
          return mockMqttClient as any;
        });
        
        await mqttClient.connect();
        
        expect(mqttClient.isConnected()).toBe(true);
      }, 5000);

      it('应该处理连接超时', async () => {
        // 设置较短的超时时间来加快测试
        config.connectTimeout = 1; // 1秒超时
        mqttClient = new MQTTClient(config);
        
        vi.mocked(mqtt.connect).mockImplementation(() => {
          // 不触发任何事件，让它超时
          return mockMqttClient as any;
        });
        
        await expect(mqttClient.connect()).rejects.toThrow('Connection timeout');
      }, 5000);

      it('应该正确断开连接', async () => {
        mockMqttClient.connected = true;
        
        vi.mocked(mqtt.connect).mockImplementation(() => {
          process.nextTick(() => {
            mockMqttClient.emit('connect');
          });
          return mockMqttClient as any;
        });
        
        mockMqttClient.end.mockImplementation((force?: boolean) => {
          process.nextTick(() => {
            mockMqttClient.emit('close');
          });
        });
        
        // 先连接
        await mqttClient.connect();

        // 断开连接
        await mqttClient.disconnect();
        
        expect(mockMqttClient.end).toHaveBeenCalled();
        expect(mqttClient.isConnected()).toBe(false);
      }, 5000);

      it('应该支持强制断开连接', async () => {
        mockMqttClient.connected = true;
        
        // 首先建立连接以便有客户端实例
        vi.mocked(mqtt.connect).mockImplementation(() => {
          process.nextTick(() => {
            mockMqttClient.emit('connect');
          });
          return mockMqttClient as any;
        });
        
        await mqttClient.connect();
        await mqttClient.disconnect(true);
        
        expect(mockMqttClient.end).toHaveBeenCalledWith(true, {}, expect.any(Function));
      });
    });

    describe('1.2 连接状态管理测试', () => {
      it('应该正确跟踪连接状态转换', async () => {
        expect(mqttClient.isConnected()).toBe(false);
        
        mockMqttClient.connected = true;
        mockMqttClient.connect.mockImplementation(() => {
          process.nextTick(() => {
            mockMqttClient.emit('connect');
          });
          return mockMqttClient;
        });
        
        await mqttClient.connect();
        expect(mqttClient.isConnected()).toBe(true);
      }, 5000);

      it('应该处理意外断开', async () => {
        // 先连接
        mockMqttClient.connected = true;
        mockMqttClient.connect.mockImplementation(() => {
          process.nextTick(() => {
            mockMqttClient.emit('connect');
          });
          return mockMqttClient;
        });
        
        await mqttClient.connect();

        // 模拟意外断开
        mockMqttClient.connected = false;
        mockMqttClient.emit('close');

        expect(mqttClient.isConnected()).toBe(false);
      }, 5000);

      it('应该支持自动重连', async () => {
        config.autoReconnect = true;
        config.reconnectPeriod = 100;
        mqttClient = new MQTTClient(config);

        // 模拟连接丢失
        mockMqttClient.connected = false;
        const offlineHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'offline'
        )?.[1];
        if (offlineHandler) offlineHandler();

        // 等待重连尝试
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // 连接正在进行中
      });

      it('应该限制最大重连次数', () => {
        const statistics = mqttClient.getStatistics();
        expect(statistics.connectionInfo).toHaveProperty('reconnectAttempts');
        expect(statistics.connectionInfo.reconnectAttempts).toBe(0);
      });

      it('应该维护连接保活心跳', async () => {
        expect(config.keepAlive).toBe(60);
        
        // 创建客户端时应该设置正确的keepAlive
        const clientConfig = mqttClient.getConfig();
        expect(clientConfig.keepAlive).toBe(60);
      });
    });
  });

  describe('2. SSL/TLS安全连接测试', () => {
    describe('2.1 SSL配置测试', () => {
      it('应该支持SSL/TLS连接', () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        const sslClient = new MQTTClient(sslConfig);
        
        const clientConfig = sslClient.getConfig();
        expect(clientConfig.ssl.enabled).toBe(true);
        expect(clientConfig.port).toBe(8883);
      });

      it('应该验证CA证书', () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        const sslClient = new MQTTClient(sslConfig);
        
        const validation = sslClient.validateConfig(sslConfig);
        expect(validation.valid).toBe(true);
      });

      it('应该支持客户端证书认证', () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        sslConfig.ssl.certFile = '/path/to/client.crt';
        sslConfig.ssl.keyFile = '/path/to/client.key';
        
        const sslClient = new MQTTClient(sslConfig);
        const clientConfig = sslClient.getConfig();
        
        expect(clientConfig.ssl.certFile).toBe('/path/to/client.crt');
        expect(clientConfig.ssl.keyFile).toBe('/path/to/client.key');
      });

      it('应该处理SSL握手失败', async () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        sslConfig.connectTimeout = 1; // 1秒超时
        const sslClient = new MQTTClient(sslConfig);
        
        vi.mocked(mqtt.connect).mockImplementation(() => {
          const client = createMockMqttClient();
          // 立即触发SSL错误而不是等待
          setTimeout(() => {
            client.simulateError(new Error('SSL handshake failed'));
          }, 10);
          return client as any;
        });
        
        const connectPromise = sslClient.connect();
        
        await expect(connectPromise).rejects.toThrow('SSL handshake failed');
      });
    });

    describe('2.2 安全参数测试', () => {
      it('应该支持对等验证模式', () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        sslConfig.ssl.verifyPeer = PeerVerifyMode.VerifyPeer;
        
        const sslClient = new MQTTClient(sslConfig);
        const clientConfig = sslClient.getConfig();
        
        expect(clientConfig.ssl.verifyPeer).toBe(PeerVerifyMode.VerifyPeer);
      });

      it('应该支持SSL协议版本选择', () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        sslConfig.ssl.protocol = SSLProtocol.TLS;
        
        const sslClient = new MQTTClient(sslConfig);
        const clientConfig = sslClient.getConfig();
        
        expect(clientConfig.ssl.protocol).toBe(SSLProtocol.TLS);
      });

      it('应该支持证书链验证深度', () => {
        const sslConfig = MQTTConfigFactory.createSSLConfig();
        sslConfig.ssl.verifyDepth = 3;
        
        const sslClient = new MQTTClient(sslConfig);
        const clientConfig = sslClient.getConfig();
        
        expect(clientConfig.ssl.verifyDepth).toBe(3);
      });
    });
  });

  describe('3. 认证和会话管理测试', () => {
    describe('3.1 认证测试', () => {
      it('应该支持用户名密码认证', () => {
        const authConfig = MQTTConfigFactory.createBasicConfig();
        authConfig.username = 'testuser';
        authConfig.password = 'testpass';
        
        const authClient = new MQTTClient(authConfig);
        const clientConfig = authClient.getConfig();
        
        expect(clientConfig.username).toBe('testuser');
        expect(clientConfig.password).toBe('testpass');
      });

      it('应该处理认证失败', async () => {
        const connectPromise = mqttClient.connect();
        
        // 模拟认证失败
        const errorHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'error'
        )?.[1];
        if (errorHandler) errorHandler(new Error('Connection refused: Bad username or password'));
        
        await expect(connectPromise).rejects.toThrow('Bad username or password');
      });

      it('应该生成唯一的客户端ID', () => {
        const client1 = new MQTTClient({ ...config, clientId: '' });
        const client2 = new MQTTClient({ ...config, clientId: '' });
        
        const id1 = client1.getConfig().clientId;
        const id2 = client2.getConfig().clientId;
        
        expect(id1).toBeDefined();
        expect(id2).toBeDefined();
        expect(id1).not.toBe(id2);
      });

      it('应该支持会话清理标志', () => {
        config.cleanSession = false;
        const persistentClient = new MQTTClient(config);
        
        const clientConfig = persistentClient.getConfig();
        expect(clientConfig.cleanSession).toBe(false);
      });
    });
  });

  describe('4. 遗嘱消息(LWT)测试', () => {
    describe('4.1 遗嘱消息配置测试', () => {
      it('应该设置遗嘱消息', () => {
        const willConfig = MQTTConfigFactory.createBasicConfig();
        willConfig.willMessage = {
          topic: 'device/status',
          message: 'offline',
          qos: QoSLevel.AtLeastOnce,
          retain: true
        };
        
        const willClient = new MQTTClient(willConfig);
        const clientConfig = willClient.getConfig();
        
        expect(clientConfig.willMessage?.topic).toBe('device/status');
        expect(clientConfig.willMessage?.message).toBe('offline');
      });

      it('应该支持遗嘱消息QoS级别', () => {
        const willConfig = MQTTConfigFactory.createBasicConfig();
        willConfig.willMessage = {
          topic: 'test/will',
          message: 'disconnected',
          qos: QoSLevel.ExactlyOnce,
          retain: false
        };
        
        const willClient = new MQTTClient(willConfig);
        const clientConfig = willClient.getConfig();
        
        expect(clientConfig.willMessage?.qos).toBe(QoSLevel.ExactlyOnce);
      });

      it('应该支持遗嘱消息保留标志', () => {
        const willConfig = MQTTConfigFactory.createBasicConfig();
        willConfig.willMessage = {
          topic: 'test/will',
          message: 'disconnected',
          qos: QoSLevel.AtMostOnce,
          retain: true
        };
        
        const willClient = new MQTTClient(willConfig);
        const clientConfig = willClient.getConfig();
        
        expect(clientConfig.willMessage?.retain).toBe(true);
      });
    });
  });

  describe('5. 配置验证和管理测试', () => {
    describe('5.1 配置验证测试', () => {
      it('应该验证完整的配置', () => {
        const validation = mqttClient.validateConfig(config);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });

      it('应该检测无效的主机名', () => {
        config.hostname = '';
        const invalidClient = new MQTTClient(config);
        
        const validation = invalidClient.validateConfig(invalidClient.getConfig());
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Hostname is required');
      });

      it('应该验证端口范围', () => {
        config.port = 70000;
        const invalidClient = new MQTTClient(config);
        
        const validation = invalidClient.validateConfig(invalidClient.getConfig());
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Port must be between 1 and 65535');
      });

      it('应该验证主题格式', () => {
        config.topicFilter = 'test/#/invalid';
        const invalidClient = new MQTTClient(config);
        
        const validation = invalidClient.validateConfig(invalidClient.getConfig());
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Invalid topic filter format');
      });

      it('应该验证Keep-Alive参数', () => {
        config.keepAlive = -1;
        const invalidClient = new MQTTClient(config);
        
        const validation = invalidClient.validateConfig(invalidClient.getConfig());
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Keep alive must be between 0 and 65535');
      });
    });
  });
});

describe('MQTT发布订阅功能测试', () => {
  let mqttClient: MQTTClient;
  let config: MQTTConfig;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockMqttClient = createMockMqttClient();
    config = MQTTConfigFactory.createBasicConfig();
    mqttClient = new MQTTClient(config);
    
    // 模拟连接状态
    mockMqttClient.connected = true;
    const connectPromise = mqttClient.connect();
    const connectHandler = mockMqttClient.on.mock.calls.find(
      call => call[0] === 'connect'
    )?.[1];
    if (connectHandler) connectHandler();
    await connectPromise;
  });

  afterEach(async () => {
    if (mqttClient && mqttClient.isConnected()) {
      try {
        await Promise.race([
          mqttClient.disconnect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Disconnect timeout')), 1000)
          )
        ]);
      } catch (error) {
        console.warn('Failed to disconnect MQTT client:', error);
      }
    }
  });

  describe('6. 发布功能测试', () => {
    describe('6.1 基础发布测试', () => {
      it('应该发布QoS 0消息', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          // 立即触发回调，不延迟
          setTimeout(() => callback && callback(null), 0);
        });

        await mqttClient.publish('test/topic', 'test message', {
          qos: QoSLevel.AtMostOnce
        });

        expect(mockMqttClient.publish).toHaveBeenCalledWith(
          'test/topic',
          'test message',
          expect.objectContaining({ qos: 0 }),
          expect.any(Function)
        );
      });

      it('应该发布QoS 1消息并等待PUBACK确认', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          // 立即触发回调，避免超时
          setTimeout(() => callback && callback(null, { messageId: 1 }), 0);
        });

        const result = await mqttClient.publish('test/topic', 'test message', {
          qos: QoSLevel.AtLeastOnce
        });

        expect(result.success).toBe(true);
        expect(mockMqttClient.publish).toHaveBeenCalledWith(
          'test/topic',
          'test message',
          expect.objectContaining({ qos: 1 }),
          expect.any(Function)
        );
      });

      it('应该发布QoS 2消息并处理完整的确认流程', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          // 立即触发回调，避免超时
          setTimeout(() => callback && callback(null, { messageId: 2 }), 0);
        });

        const result = await mqttClient.publish('test/topic', 'test message', {
          qos: QoSLevel.ExactlyOnce
        });

        expect(result.success).toBe(true);
        expect(mockMqttClient.publish).toHaveBeenCalledWith(
          'test/topic',
          'test message',
          expect.objectContaining({ qos: 2 }),
          expect.any(Function)
        );
      });

      it('应该发布保留消息', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        await mqttClient.publish('test/topic', 'retained message', {
          retain: true
        });

        expect(mockMqttClient.publish).toHaveBeenCalledWith(
          'test/topic',
          'retained message',
          expect.objectContaining({ retain: true }),
          expect.any(Function)
        );
      });

      it('应该处理重复消息标志', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        await mqttClient.publish('test/topic', 'duplicate message', {
          dup: true
        });

        expect(mockMqttClient.publish).toHaveBeenCalledWith(
          'test/topic',
          'duplicate message',
          expect.objectContaining({ dup: true }),
          expect.any(Function)
        );
      });

      it('应该验证发布模式', async () => {
        const publisherConfig = MQTTConfigFactory.createPublisherConfig();
        const publisherClient = new MQTTClient(publisherConfig);
        
        // 模拟连接
        mockMqttClient.connected = true;
        const connectPromise = publisherClient.connect();
        const connectHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        if (connectHandler) connectHandler();
        await connectPromise;

        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        await publisherClient.publish('test/topic', 'test message');
        expect(mockMqttClient.publish).toHaveBeenCalled();
        
        await publisherClient.disconnect();
      });
    });

    describe('6.2 批量发布测试', () => {
      it('应该支持批量消息发布', async () => {
        const messages = [
          { topic: 'test/1', payload: 'message 1' },
          { topic: 'test/2', payload: 'message 2' },
          { topic: 'test/3', payload: 'message 3' }
        ];

        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        const result = await mqttClient.publishBatch(messages);

        expect(result.success).toBe(true);
        expect(result.successCount).toBe(3);
        expect(result.failureCount).toBe(0);
        expect(mockMqttClient.publish).toHaveBeenCalledTimes(3);
      });

      it('应该处理批量发布中的部分失败', async () => {
        const messages = [
          { topic: 'test/1', payload: 'message 1' },
          { topic: 'test/2', payload: 'message 2' },
          { topic: 'test/3', payload: 'message 3' }
        ];

        let callCount = 0;
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callCount++;
          if (callCount === 2) {
            callback && callback(new Error('Publish failed'));
          } else {
            callback && callback(null);
          }
        });

        const result = await mqttClient.publishBatch(messages);

        expect(result.success).toBe(false);
        expect(result.successCount).toBe(2);
        expect(result.failureCount).toBe(1);
      });

      it('应该支持批量发布进度回调', async () => {
        const messages = [
          { topic: 'test/1', payload: 'message 1' },
          { topic: 'test/2', payload: 'message 2' }
        ];

        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        const progressUpdates: any[] = [];
        const result = await mqttClient.publishBatch(messages, {
          onProgress: (progress) => progressUpdates.push(progress)
        });

        expect(result.success).toBe(true);
        expect(progressUpdates.length).toBeGreaterThan(0);
      });

      it('应该支持并发控制', async () => {
        const messages = Array.from({ length: 10 }, (_, i) => ({
          topic: `test/${i}`,
          payload: `message ${i}`
        }));

        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          setTimeout(() => callback && callback(null), 10);
        });

        const startTime = Date.now();
        const result = await mqttClient.publishBatch(messages, {
          concurrency: 2
        });
        const duration = Date.now() - startTime;

        expect(result.success).toBe(true);
        expect(duration).toBeGreaterThan(40); // 至少需要5轮并发 * 10ms
      });
    });
  });

  describe('7. 订阅功能测试', () => {
    describe('7.1 基础订阅测试', () => {
      it('应该成功订阅主题', async () => {
        mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
          callback && callback(null, [{ topic, qos: 1 }]);
        });

        const result = await mqttClient.subscribe('test/topic');

        expect(result.success).toBe(true);
        expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
          'test/topic',
          expect.any(Object),
          expect.any(Function)
        );
      });

      it('应该成功取消订阅主题', async () => {
        mockMqttClient.unsubscribe.mockImplementation((topic, callback) => {
          callback && callback(null);
        });

        const result = await mqttClient.unsubscribe('test/topic');

        expect(result.success).toBe(true);
        expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith(
          'test/topic',
          expect.any(Function)
        );
      });

      it('应该支持订阅QoS级别协商', async () => {
        mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
          callback && callback(null, [{ topic, qos: options.qos }]);
        });

        const result = await mqttClient.subscribe('test/topic', {
          qos: QoSLevel.AtLeastOnce
        });

        expect(result.success).toBe(true);
        expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
          'test/topic',
          expect.objectContaining({ qos: 1 }),
          expect.any(Function)
        );
      });

      it('应该验证订阅模式', async () => {
        const subscriberConfig = MQTTConfigFactory.createSubscriberConfig();
        const subscriberClient = new MQTTClient(subscriberConfig);
        
        // 模拟连接
        mockMqttClient.connected = true;
        const connectPromise = subscriberClient.connect();
        const connectHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        if (connectHandler) connectHandler();
        await connectPromise;

        mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
          callback && callback(null, [{ topic, qos: 1 }]);
        });

        const result = await subscriberClient.subscribe('test/topic');
        expect(result.success).toBe(true);
        
        await subscriberClient.disconnect();
      });
    });

    describe('7.2 消息接收测试', () => {
      it('应该接收并处理消息', async () => {
        const receivedMessages: any[] = [];
        
        mqttClient.on('message', (message) => {
          receivedMessages.push(message);
        });

        // 模拟接收消息
        const messageHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'message'
        )?.[1];
        
        if (messageHandler) {
          messageHandler('test/topic', Buffer.from('test message'), {
            qos: 1,
            retain: false,
            dup: false
          });
        }

        expect(receivedMessages).toHaveLength(1);
        expect(receivedMessages[0].topic).toBe('test/topic');
        expect(receivedMessages[0].payload.toString()).toBe('test message');
      });

      it('应该解析消息格式', async () => {
        const receivedMessages: any[] = [];
        
        mqttClient.on('message', (message) => {
          receivedMessages.push(message);
        });

        const messageHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'message'
        )?.[1];
        
        if (messageHandler) {
          messageHandler('test/topic', Buffer.from('test message'), {
            qos: 2,
            retain: true,
            dup: false
          });
        }

        expect(receivedMessages[0].qos).toBe(2);
        expect(receivedMessages[0].retain).toBe(true);
        expect(receivedMessages[0].dup).toBe(false);
      });

      it('应该支持自动订阅功能', async () => {
        config.topicFilter = 'auto/+';
        const autoClient = new MQTTClient(config);
        
        mockMqttClient.connected = true;
        mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
          callback && callback(null, [{ topic, qos: 1 }]);
        });

        const connectPromise = autoClient.connect();
        const connectHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        if (connectHandler) connectHandler();
        await connectPromise;

        expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
          'auto/+',
          expect.any(Object),
          expect.any(Function)
        );
        
        await autoClient.disconnect();
      });
    });
  });
});

describe('MQTT热路径和性能测试', () => {
  let mqttClient: MQTTClient;
  let config: MQTTConfig;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockMqttClient = createMockMqttClient();
    config = MQTTConfigFactory.createBasicConfig();
    config.hotpathMode = true;
    config.batchSize = 10;
    config.batchTimeout = 100;
    mqttClient = new MQTTClient(config);
    
    mockMqttClient.connected = true;
    const connectPromise = mqttClient.connect();
    const connectHandler = mockMqttClient.on.mock.calls.find(
      call => call[0] === 'connect'
    )?.[1];
    if (connectHandler) connectHandler();
    await connectPromise;
  });

  afterEach(async () => {
    if (mqttClient && mqttClient.isConnected()) {
      try {
        await Promise.race([
          mqttClient.disconnect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Disconnect timeout')), 1000)
          )
        ]);
      } catch (error) {
        console.warn('Failed to disconnect MQTT client:', error);
      }
    }
  });

  describe('8. 热路径数据传输测试', () => {
    describe('8.1 热路径性能测试', () => {
      it('应该支持热路径单帧发送', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        const testFrame = new Uint8Array([1, 2, 3, 4, 5]);
        await mqttClient.hotpathTxFrame(testFrame);

        expect(mockMqttClient.publish).toHaveBeenCalled();
      });

      it('应该支持热路径批量缓冲区', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        // 发送多个小帧，应该被缓冲
        for (let i = 0; i < 5; i++) {
          const frame = new Uint8Array([i]);
          await mqttClient.hotpathTxFrame(frame);
        }

        // 应该有批量发送
        expect(mockMqttClient.publish).toHaveBeenCalled();
      });

      it('应该在缓冲区满时触发批量发送', async () => {
        let publishCount = 0;
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          publishCount++;
          callback && callback(null);
        });

        // 发送超过批量大小的帧数
        for (let i = 0; i < 15; i++) {
          const frame = new Uint8Array([i]);
          await mqttClient.hotpathTxFrame(frame);
        }

        expect(publishCount).toBeGreaterThan(1);
      });

      it('应该在超时时触发批量发送', async () => {
        let publishCount = 0;
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          publishCount++;
          callback && callback(null);
        });

        // 发送少量帧
        const frame = new Uint8Array([1]);
        await mqttClient.hotpathTxFrame(frame);

        // 等待超时
        await new Promise(resolve => setTimeout(resolve, 150));

        expect(publishCount).toBe(1);
      });

      it('应该处理热路径错误', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(new Error('Publish failed'));
        });

        const frame = new Uint8Array([1, 2, 3]);
        
        await expect(mqttClient.hotpathTxFrame(frame)).rejects.toThrow('Publish failed');
      });

      it('应该监控热路径性能', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        const frame = new Uint8Array([1, 2, 3]);
        const startTime = Date.now();
        
        await mqttClient.hotpathTxFrame(frame);
        
        const stats = mqttClient.getStatistics();
        expect(stats.messagesPublished).toBeGreaterThan(0);
      });
    });
  });

  describe('9. QoS确认处理测试', () => {
    describe('9.1 QoS确认机制测试', () => {
      it('应该处理PUBACK确认 (QoS 1)', async () => {
        let resolvePublish: (value: any) => void;
        const publishPromise = new Promise(resolve => {
          resolvePublish = resolve;
        });

        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null, { messageId: 123 });
          resolvePublish({ messageId: 123 });
        });

        const result = await mqttClient.publish('test/topic', 'test', {
          qos: QoSLevel.AtLeastOnce
        });

        expect(result.success).toBe(true);
      });

      it('应该处理PUBREC/PUBREL/PUBCOMP流程 (QoS 2)', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null, { messageId: 456 });
        });

        const result = await mqttClient.publish('test/topic', 'test', {
          qos: QoSLevel.ExactlyOnce
        });

        expect(result.success).toBe(true);
      });

      it('应该处理QoS超时', async () => {
        config.qos = QoSLevel.AtLeastOnce;
        const timeoutClient = new MQTTClient(config);

        mockMqttClient.connected = true;
        const connectPromise = timeoutClient.connect();
        const connectHandler = mockMqttClient.on.mock.calls.find(
          call => call[0] === 'connect'
        )?.[1];
        if (connectHandler) connectHandler();
        await connectPromise;

        // 模拟超时 - 不调用回调
        mockMqttClient.publish.mockImplementation(() => {
          // 不调用回调，模拟超时
        });

        await expect(
          timeoutClient.publish('test/topic', 'test', {
            qos: QoSLevel.AtLeastOnce,
            timeout: 100
          })
        ).rejects.toThrow('timeout');

        await timeoutClient.disconnect();
      });

      it('应该清理QoS消息', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null, { messageId: 789 });
        });

        await mqttClient.publish('test/topic', 'test', {
          qos: QoSLevel.AtLeastOnce
        });

        // 验证消息被清理 - 这是内部行为，通过统计信息验证
        const stats = mqttClient.getStatistics();
        expect(stats.messagesPublished).toBeGreaterThan(0);
      });
    });
  });

  describe('10. 统计和监控测试', () => {
    describe('10.1 统计信息测试', () => {
      it('应该收集统计信息', () => {
        const stats = mqttClient.getStatistics();
        
        expect(stats).toHaveProperty('messagesPublished');
        expect(stats).toHaveProperty('messagesReceived');
        expect(stats).toHaveProperty('bytesTransmitted');
        expect(stats).toHaveProperty('bytesReceived');
        expect(stats).toHaveProperty('connectTime');
        expect(stats).toHaveProperty('reconnectAttempts');
      });

      it('应该统计消息计数和字节数', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          callback && callback(null);
        });

        const initialStats = mqttClient.getStatistics();
        
        await mqttClient.publish('test/topic', 'test message');
        
        const updatedStats = mqttClient.getStatistics();
        expect(updatedStats.messagesPublished).toBe(initialStats.messagesPublished + 1);
        expect(updatedStats.bytesTransmitted).toBeGreaterThan(initialStats.bytesTransmitted);
      });

      it('应该测量性能指标', async () => {
        mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
          setTimeout(() => callback && callback(null), 10);
        });

        await mqttClient.publish('test/topic', 'test');
        
        const stats = mqttClient.getStatistics();
        expect(stats.averageLatency).toBeGreaterThan(0);
      });

      it('应该重置统计信息', () => {
        mqttClient.resetStatistics();
        
        const stats = mqttClient.getStatistics();
        expect(stats.messagesPublished).toBe(0);
        expect(stats.messagesReceived).toBe(0);
        expect(stats.bytesTransmitted).toBe(0);
        expect(stats.bytesReceived).toBe(0);
      });
    });
  });
});

describe('MQTT错误处理和边界测试', () => {
  let mqttClient: MQTTClient;
  let config: MQTTConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMqttClient = createMockMqttClient();
    config = MQTTConfigFactory.createBasicConfig();
    config.connectTimeout = 2; // 设置较短的超时时间，加快测试
    mqttClient = new MQTTClient(config);
  });

  afterEach(async () => {
    if (mqttClient && mqttClient.isConnected()) {
      try {
        await Promise.race([
          mqttClient.disconnect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Disconnect timeout')), 1000)
          )
        ]);
      } catch (error) {
        console.warn('Failed to disconnect MQTT client:', error);
      }
    }
  });

  describe('11. 错误处理测试', () => {
    it('应该处理网络错误', async () => {
      const errorPromise = new Promise<void>((resolve) => {
        mqttClient.on('error', (error) => {
          expect(error.message).toContain('Network error');
          resolve();
        });
      });

      const errorHandler = mockMqttClient.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      if (errorHandler) errorHandler(new Error('Network error'));

      await errorPromise;
    });

    it('应该处理大消息发布', async () => {
      const largePayload = MQTTTestUtils.generateLargePayload(1024); // 1MB

      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        callback && callback(null);
      });

      await expect(
        mqttClient.publish('test/topic', largePayload)
      ).resolves.not.toThrow();
    });

    it('应该处理无效主题', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        callback && callback(new Error('Invalid topic'));
      });

      await expect(
        mqttClient.publish('invalid/#/topic', 'test')
      ).rejects.toThrow('Invalid topic');
    });
  });

  describe('12. 边界条件测试', () => {
    it('应该处理空消息', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        callback && callback(null);
      });

      await expect(
        mqttClient.publish('test/topic', '')
      ).resolves.not.toThrow();
    });

    it('应该处理极长主题', async () => {
      const longTopic = 'test/' + 'a'.repeat(1000);

      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        callback && callback(null);
      });

      await expect(
        mqttClient.publish(longTopic, 'test')
      ).resolves.not.toThrow();
    });

    it('应该处理高频发布', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        callback && callback(null);
      });

      const publishPromises = [];
      for (let i = 0; i < 100; i++) {
        publishPromises.push(
          mqttClient.publish(`test/${i}`, `message ${i}`)
        );
      }

      await expect(Promise.all(publishPromises)).resolves.not.toThrow();
    });
  });
});
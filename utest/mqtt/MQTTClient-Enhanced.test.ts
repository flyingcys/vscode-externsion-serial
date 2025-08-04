/**
 * MQTT客户端增强测试 - 专门用于提升覆盖率
 * 
 * 这个测试文件专注于覆盖MQTTClient.ts中的核心功能和边界情况
 * 确保测试API与实际源码完全匹配
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
  PeerVerifyMode,
  MQTTMessage,
  BatchMessage,
  PublishOptions,
  SubscriptionOptions
} from '@/extension/mqtt/types';
import * as mqtt from 'mqtt';

// Mock文件系统
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => 'mock certificate content'),
  existsSync: vi.fn(() => true)
}));

vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => Buffer.from('test')),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'hash')
  }))
}));

describe('MQTT客户端增强测试 - 覆盖率提升', () => {
  let mqttClient: MQTTClient;
  let mockMqttClient: any;
  let config: MQTTConfig;

  // 创建基础配置
  const createBasicConfig = (): MQTTConfig => ({
    hostname: 'localhost',
    port: 1883,
    clientId: 'test-client',
    connectTimeout: 2,
    protocolVersion: MQTTProtocolVersion.MQTT_5_0,
    cleanSession: true,
    keepAlive: 60,
    autoKeepAlive: true,
    topicFilter: 'test/+',
    mode: MQTTClientMode.Subscriber,
    ssl: {
      enabled: false,
      protocol: SSLProtocol.TLS_1_2,
      peerVerifyMode: PeerVerifyMode.QueryPeer,
      peerVerifyDepth: 0
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    config = createBasicConfig();
    
    // 创建mock客户端 - 继承EventEmitter以支持真实的事件
    mockMqttClient = Object.assign(new EventEmitter(), {
      connected: false,
      reconnecting: false,
      connect: vi.fn().mockReturnThis(),
      publish: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      end: vi.fn(),
      removeAllListeners: vi.fn()
    });

    // 正确覆盖 on 和 once 方法，但保留事件功能
    const originalOn = mockMqttClient.on.bind(mockMqttClient);
    const originalOnce = mockMqttClient.once.bind(mockMqttClient);
    mockMqttClient.on = vi.fn((event, listener) => {
      originalOn(event, listener);
      return mockMqttClient;
    });
    mockMqttClient.once = vi.fn((event, listener) => {
      originalOnce(event, listener);
      return mockMqttClient;
    });

    vi.mocked(mqtt.connect).mockReturnValue(mockMqttClient as any);
    mqttClient = new MQTTClient(config);
  });

  afterEach(async () => {
    try {
      if (mqttClient) {
        mqttClient.dispose();
      }
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('1. 连接管理功能测试', () => {
    it('应该成功连接MQTT服务器', async () => {
      // 设置mock行为
      mockMqttClient.connected = true;
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      expect(mqttClient.isConnected()).toBe(true);
    });

    it('应该处理连接超时', async () => {
      config.connectTimeout = 1; // 1秒超时
      mqttClient = new MQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        // 不触发任何事件，让它超时
        return mockMqttClient as any;
      });

      await expect(mqttClient.connect()).rejects.toThrow('Connection timeout');
    });

    it('应该处理连接错误', async () => {
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('error', new Error('Connection failed'));
        }, 10);
        return mockMqttClient as any;
      });

      // 监听错误事件，避免未处理的错误
      mqttClient.on('error', () => {});

      await expect(mqttClient.connect()).rejects.toThrow('Connection failed');
    });

    it('应该处理重复连接请求', async () => {
      // 设置为连接中状态
      mockMqttClient.connected = true;
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      
      // 再次连接应该直接返回
      await mqttClient.connect();
      expect(vi.mocked(mqtt.connect)).toHaveBeenCalledTimes(1);
    });

    it('应该拒绝连接中时的新连接请求', async () => {
      // 模拟连接中状态
      const connectPromise1 = mqttClient.connect();
      
      await expect(mqttClient.connect()).rejects.toThrow('Connection already in progress');
      
      // 完成第一个连接
      setTimeout(() => {
        mockMqttClient.emit('connect');
      }, 10);
      
      await connectPromise1;
    });

    it('应该正确断开连接', async () => {
      // 先连接
      mockMqttClient.connected = true;
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();

      // 设置end的mock行为
      mockMqttClient.end.mockImplementation((force, opts, callback) => {
        setTimeout(() => {
          if (callback) callback();
        }, 10);
      });

      await mqttClient.disconnect();
      expect(mockMqttClient.end).toHaveBeenCalled();
      expect(mqttClient.isConnected()).toBe(false);
    });

    it('应该支持强制断开连接', async () => {
      // 先连接
      mockMqttClient.connected = true;
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();

      mockMqttClient.end.mockImplementation((force, opts, callback) => {
        setTimeout(() => {
          if (callback) callback();
        }, 10);
      });

      await mqttClient.disconnect(true);
      expect(mockMqttClient.end).toHaveBeenCalledWith(true, {}, expect.any(Function));
    });

    it('应该处理已断开连接的断开请求', async () => {
      // 确保客户端未连接
      expect(mqttClient.isConnected()).toBe(false);
      
      // 断开连接应该直接返回
      await mqttClient.disconnect();
      expect(mockMqttClient.end).not.toHaveBeenCalled();
    });

    it('应该支持重连功能', async () => {
      // 先连接
      mockMqttClient.connected = true;
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      mockMqttClient.end.mockImplementation((force, opts, callback) => {
        setTimeout(() => {
          if (callback) callback();
        }, 10);
      });

      await mqttClient.connect();
      await mqttClient.reconnect();
      
      expect(mqttClient.isConnected()).toBe(true);
    });
  });

  describe('2. 配置管理功能测试', () => {
    it('应该正确验证有效配置', () => {
      const result = mqttClient.validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测无效主机名', () => {
      const invalidConfig = { ...config, hostname: '' };
      const result = mqttClient.validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hostname is required');
    });

    it('应该检测无效端口', () => {
      const invalidConfig = { ...config, port: 0 };
      const result = mqttClient.validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Port must be between 1 and 65535');
    });

    it('应该检测无效Keep Alive', () => {
      const invalidConfig = { ...config, keepAlive: -1 };
      const result = mqttClient.validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Keep alive must be between 0 and 65535');
    });

    it('应该检测无效主题过滤器', () => {
      const invalidConfig = { ...config, topicFilter: 'test/#/invalid' };
      const result = mqttClient.validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid topic filter format');
    });

    it('应该检测SSL配置错误', () => {
      const invalidConfig = { 
        ...config, 
        ssl: { 
          ...config.ssl, 
          enabled: true,
          peerVerifyDepth: -1 
        }
      };
      const result = mqttClient.validateConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SSL peer verify depth must be non-negative');
    });

    it('应该自动生成客户端ID', () => {
      const configWithoutId = { ...config, clientId: '' };
      const client = new MQTTClient(configWithoutId);
      const resultConfig = client.getConfig();
      
      expect(resultConfig.clientId).toBeDefined();
      expect(resultConfig.clientId.length).toBeGreaterThan(0);
      expect(resultConfig.clientId).toContain('vscode-serial-studio-');
    });

    it('应该正确返回配置副本', () => {
      const returnedConfig = mqttClient.getConfig();
      expect(returnedConfig).toEqual(config);
      expect(returnedConfig).not.toBe(config); // 应该是副本，不是同一个对象
    });

    it('应该正确更新配置', () => {
      const oldConfig = mqttClient.getConfig();
      expect(oldConfig.hostname).toBe('localhost');

      mqttClient.updateConfig({ hostname: 'example.com' });
      const newConfig = mqttClient.getConfig();
      expect(newConfig.hostname).toBe('example.com');
    });
  });

  describe('3. 发布功能测试', () => {
    beforeEach(async () => {
      // 建立连接
      mockMqttClient.connected = true;
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      config.mode = MQTTClientMode.Publisher;
      mqttClient = new MQTTClient(config);
      await mqttClient.connect();
    });

    it('应该成功发布QoS 0消息', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      await mqttClient.publish('test/topic', Buffer.from('test message'));
      
      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        'test/topic',
        Buffer.from('test message'),
        expect.objectContaining({ qos: 0 }),
        expect.any(Function)
      );
    });

    it('应该成功发布QoS 1消息', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        const messageId = options.messageId || 1;
        setTimeout(() => {
          if (callback) callback(null, { messageId });
          // 模拟 PUBACK 响应
          mockMqttClient.emit('puback', { messageId });
        }, 10);
      });

      await mqttClient.publish('test/topic', Buffer.from('test message'), {
        qos: QoSLevel.AtLeastOnce
      });

      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        'test/topic',
        Buffer.from('test message'),
        expect.objectContaining({ qos: 1 }),
        expect.any(Function)
      );
    });

    it('应该成功发布QoS 2消息', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        const messageId = options.messageId || 1;
        setTimeout(() => {
          if (callback) callback(null, { messageId });
          // 模拟 PUBREC 响应
          mockMqttClient.emit('pubrec', { messageId });
        }, 10);
      });

      // 模拟 pubrel 方法
      mockMqttClient.pubrel = vi.fn().mockImplementation((packet, callback) => {
        setTimeout(() => {
          if (callback) callback();
          // 模拟 PUBCOMP 响应
          mockMqttClient.emit('pubcomp', { messageId: packet.messageId });
        }, 10);
      });

      await mqttClient.publish('test/topic', Buffer.from('test message'), {
        qos: QoSLevel.ExactlyOnce
      });

      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        'test/topic',
        Buffer.from('test message'),
        expect.objectContaining({ qos: 2 }),
        expect.any(Function)
      );
    });

    it('应该处理发布错误', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(new Error('Publish failed'));
        }, 10);
      });

      await expect(mqttClient.publish('test/topic', Buffer.from('test message')))
        .rejects.toThrow('Publish failed');
    });

    it('应该拒绝未连接时的发布', async () => {
      // 设置 end 的 mock 行为
      mockMqttClient.end.mockImplementation((force, opts, callback) => {
        mockMqttClient.connected = false;
        setTimeout(() => {
          if (callback) callback();
        }, 10);
      });

      await mqttClient.disconnect();
      
      await expect(mqttClient.publish('test/topic', Buffer.from('test message')))
        .rejects.toThrow('MQTT client is not connected');
    });

    it('应该拒绝非发布者模式的发布', async () => {
      config.mode = MQTTClientMode.Subscriber;
      const subscriberClient = new MQTTClient(config);
      
      // 先连接
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      await subscriberClient.connect();

      await expect(subscriberClient.publish('test/topic', Buffer.from('test message')))
        .rejects.toThrow('Client is not in publisher mode');
    });

    it('应该支持保留消息', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      await mqttClient.publish('test/topic', Buffer.from('retained message'), {
        retain: true
      });

      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        'test/topic',
        Buffer.from('retained message'),
        expect.objectContaining({ retain: true }),
        expect.any(Function)
      );
    });

    it('应该支持重复消息标志', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      await mqttClient.publish('test/topic', Buffer.from('dup message'), {
        dup: true
      });

      expect(mockMqttClient.publish).toHaveBeenCalledWith(
        'test/topic',
        Buffer.from('dup message'),
        expect.objectContaining({ dup: true }),
        expect.any(Function)
      );
    });
  });

  describe('4. 订阅功能测试', () => {
    beforeEach(async () => {
      // 建立连接
      mockMqttClient.connected = true;
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      config.mode = MQTTClientMode.Subscriber;
      mqttClient = new MQTTClient(config);
      await mqttClient.connect();
    });

    it('应该成功订阅主题', async () => {
      mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null, [{ topic, qos: 1 }]);
        }, 10);
      });

      await mqttClient.subscribe('test/topic');
      
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'test/topic',
        expect.objectContaining({ qos: 0 }),
        expect.any(Function)
      );
    });

    it('应该支持QoS级别订阅', async () => {
      mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null, [{ topic, qos: options.qos }]);
        }, 10);
      });

      await mqttClient.subscribe('test/topic', { qos: QoSLevel.AtLeastOnce });
      
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'test/topic',
        expect.objectContaining({ qos: 1 }),
        expect.any(Function)
      );
    });

    it('应该处理订阅错误', async () => {
      mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
        setTimeout(() => {
          if (callback) callback(new Error('Subscribe failed'));
        }, 10);
      });

      await expect(mqttClient.subscribe('test/topic'))
        .rejects.toThrow('Subscribe failed');
    });

    it('应该成功取消订阅', async () => {
      mockMqttClient.unsubscribe.mockImplementation((topic, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      await mqttClient.unsubscribe('test/topic');
      
      expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith(
        'test/topic',
        expect.any(Function)
      );
    });

    it('应该处理取消订阅错误', async () => {
      mockMqttClient.unsubscribe.mockImplementation((topic, callback) => {
        setTimeout(() => {
          if (callback) callback(new Error('Unsubscribe failed'));
        }, 10);
      });

      await expect(mqttClient.unsubscribe('test/topic'))
        .rejects.toThrow('Unsubscribe failed');
    });

    it('应该拒绝未连接时的订阅', async () => {
      // 设置 end 的 mock 行为
      mockMqttClient.end.mockImplementation((force, opts, callback) => {
        mockMqttClient.connected = false;
        setTimeout(() => {
          if (callback) callback();
        }, 10);
      });

      await mqttClient.disconnect();
      
      await expect(mqttClient.subscribe('test/topic'))
        .rejects.toThrow('MQTT client is not connected');
    });

    it('应该拒绝非订阅者模式的订阅', async () => {
      config.mode = MQTTClientMode.Publisher;
      const publisherClient = new MQTTClient(config);
      
      // 先连接
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      await publisherClient.connect();

      await expect(publisherClient.subscribe('test/topic'))
        .rejects.toThrow('Client is not in subscriber mode');
    });
  });

  describe('5. 热路径数据传输测试', () => {
    beforeEach(async () => {
      // 建立连接
      mockMqttClient.connected = true;
      config.mode = MQTTClientMode.Publisher;
      config.topicFilter = 'hotpath/data';
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      mqttClient = new MQTTClient(config);
      await mqttClient.connect();
    });

    it('应该支持热路径单帧发送', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      const testFrame = Buffer.from([1, 2, 3, 4, 5]);
      await mqttClient.hotpathTxFrame(testFrame);

      // 等待批量缓冲区刷新（默认100ms）
      await new Promise(resolve => setTimeout(resolve, 150));

      // 由于热路径可能有缓冲，我们检查最终是否有发布调用
      expect(mockMqttClient.publish).toHaveBeenCalled();
    });

    it('应该处理无主题配置的热路径', async () => {
      config.topicFilter = '';
      const clientWithoutTopic = new MQTTClient(config);
      
      // 监听错误事件，避免未处理的错误
      clientWithoutTopic.on('error', () => {});
      
      // 先连接
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      await clientWithoutTopic.connect();

      const testFrame = Buffer.from([1, 2, 3]);
      
      // 应该不抛出错误，但会记录到错误统计中
      await clientWithoutTopic.hotpathTxFrame(testFrame);
      
      const stats = clientWithoutTopic.getStatistics();
      expect(stats.errors.length).toBeGreaterThan(0);
      expect(stats.errors[stats.errors.length - 1].code).toBe('HOTPATH_TX_FAILED');
    });

    it('应该处理未连接时的热路径调用', async () => {
      // 设置 end 的 mock 行为
      mockMqttClient.end.mockImplementation((force, opts, callback) => {
        mockMqttClient.connected = false;
        setTimeout(() => {
          if (callback) callback();
        }, 10);
      });

      await mqttClient.disconnect();
      
      const testFrame = Buffer.from([1, 2, 3]);
      
      // 应该静默返回，不抛出错误
      await mqttClient.hotpathTxFrame(testFrame);
      expect(mockMqttClient.publish).not.toHaveBeenCalled();
    });
  });

  describe('6. 统计信息功能测试', () => {
    it('应该提供完整的统计信息', () => {
      const stats = mqttClient.getStatistics();
      
      expect(stats).toHaveProperty('connectionInfo');
      expect(stats).toHaveProperty('performance');
      expect(stats).toHaveProperty('errors');
      
      expect(stats.connectionInfo).toHaveProperty('state');
      expect(stats.connectionInfo).toHaveProperty('reconnectAttempts');
      expect(stats.connectionInfo).toHaveProperty('bytesReceived');
      expect(stats.connectionInfo).toHaveProperty('bytesSent');
      expect(stats.connectionInfo).toHaveProperty('messagesReceived');
      expect(stats.connectionInfo).toHaveProperty('messagesSent');
      
      expect(stats.performance).toHaveProperty('avgLatency');
      expect(stats.performance).toHaveProperty('maxLatency');
      expect(stats.performance).toHaveProperty('messageRate');
      expect(stats.performance).toHaveProperty('throughput');
      
      expect(Array.isArray(stats.errors)).toBe(true);
    });

    it('应该支持重置统计信息', () => {
      // 先获取初始统计
      const initialStats = mqttClient.getStatistics();
      
      // 重置统计
      mqttClient.resetStatistics();
      
      const resetStats = mqttClient.getStatistics();
      expect(resetStats.connectionInfo.bytesReceived).toBe(0);
      expect(resetStats.connectionInfo.bytesSent).toBe(0);
      expect(resetStats.connectionInfo.messagesReceived).toBe(0);
      expect(resetStats.connectionInfo.messagesSent).toBe(0);
      expect(resetStats.performance.avgLatency).toBe(0);
      expect(resetStats.performance.maxLatency).toBe(0);
    });

    it('应该正确跟踪连接状态', () => {
      const stats = mqttClient.getStatistics();
      expect(stats.connectionInfo.state).toBe(MQTTConnectionState.Disconnected);
    });
  });

  describe('7. SSL配置功能测试', () => {
    it('应该支持SSL连接配置', () => {
      const sslConfig: MQTTConfig = {
        ...config,
        port: 8883,
        ssl: {
          enabled: true,
          protocol: SSLProtocol.TLS_1_2,
          peerVerifyMode: PeerVerifyMode.VerifyPeer,
          peerVerifyDepth: 1,
          caCertificates: ['/path/to/ca.crt'],
          clientCertificate: '/path/to/client.crt',
          privateKey: '/path/to/client.key'
        }
      };

      const sslClient = new MQTTClient(sslConfig);
      const resultConfig = sslClient.getConfig();
      
      expect(resultConfig.ssl.enabled).toBe(true);
      expect(resultConfig.ssl.protocol).toBe(SSLProtocol.TLS_1_2);
      expect(resultConfig.ssl.peerVerifyMode).toBe(PeerVerifyMode.VerifyPeer);
      expect(resultConfig.ssl.caCertificates).toEqual(['/path/to/ca.crt']);
    });

    it('应该正确验证SSL配置', () => {
      const sslConfig: MQTTConfig = {
        ...config,
        ssl: {
          enabled: true,
          protocol: SSLProtocol.TLS_1_3,
          peerVerifyMode: PeerVerifyMode.VerifyPeer,
          peerVerifyDepth: 5
        }
      };

      const sslClient = new MQTTClient(sslConfig);
      const validation = sslClient.validateConfig(sslConfig);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('8. 遗嘱消息功能测试', () => {
    it('应该支持遗嘱消息配置', () => {
      const configWithWill: MQTTConfig = {
        ...config,
        willMessage: {
          topic: 'device/status',
          message: 'offline',
          qos: QoSLevel.AtLeastOnce,
          retain: true
        }
      };

      const clientWithWill = new MQTTClient(configWithWill);
      const resultConfig = clientWithWill.getConfig();
      
      expect(resultConfig.willMessage).toBeDefined();
      expect(resultConfig.willMessage?.topic).toBe('device/status');
      expect(resultConfig.willMessage?.message).toBe('offline');
      expect(resultConfig.willMessage?.qos).toBe(QoSLevel.AtLeastOnce);
      expect(resultConfig.willMessage?.retain).toBe(true);
    });
  });

  describe('9. 事件处理功能测试', () => {
    it('应该支持事件监听', () => {
      const events: string[] = [];
      
      mqttClient.on('connected', () => events.push('connected'));
      mqttClient.on('disconnected', () => events.push('disconnected'));
      mqttClient.on('error', () => events.push('error'));
      
      // 模拟事件
      mqttClient.emit('connected');
      mqttClient.emit('error', new Error('test'));
      
      expect(events).toContain('connected');
      expect(events).toContain('error');
    });
  });

  describe('10. 资源清理功能测试', () => {
    it('应该正确清理所有资源', () => {
      const spy = vi.spyOn(mqttClient, 'removeAllListeners');
      
      mqttClient.dispose();
      
      expect(spy).toHaveBeenCalled();
      expect(mqttClient.isConnected()).toBe(false);
    });

    it('应该多次调用dispose不出错', () => {
      expect(() => {
        mqttClient.dispose();
        mqttClient.dispose();
        mqttClient.dispose();
      }).not.toThrow();
    });
  });

  describe('11. 批量发布功能测试', () => {
    beforeEach(async () => {
      mockMqttClient.connected = true;
      config.mode = MQTTClientMode.Publisher;
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      mqttClient = new MQTTClient(config);
      await mqttClient.connect();
    });

    it('应该支持批量消息发布', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      const messages: BatchMessage[] = [
        { topic: 'test/1', payload: Buffer.from('message 1') },
        { topic: 'test/2', payload: Buffer.from('message 2') },
        { topic: 'test/3', payload: Buffer.from('message 3') }
      ];

      const results = await mqttClient.publishBatch(messages);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockMqttClient.publish).toHaveBeenCalledTimes(3);
    });

    it('应该处理空消息数组', async () => {
      const results = await mqttClient.publishBatch([]);
      expect(results).toHaveLength(0);
    });

    it('应该处理批量发布中的部分失败', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          // 基于主题来决定是否失败
          if (topic === 'test/2') {
            if (callback) callback(new Error('Publish failed'));
          } else {
            if (callback) callback(null);
          }
        }, 10);
      });

      const messages: BatchMessage[] = [
        { topic: 'test/1', payload: Buffer.from('message 1') },
        { topic: 'test/2', payload: Buffer.from('message 2') },
        { topic: 'test/3', payload: Buffer.from('message 3') }
      ];

      const results = await mqttClient.publishBatch(messages);
      
      expect(results).toHaveLength(3);
      expect(results.filter(r => r.success)).toHaveLength(2);
      expect(results.filter(r => !r.success)).toHaveLength(1);
      
      // 验证哪个失败了
      const failedResult = results.find(r => !r.success);
      expect(failedResult?.topic).toBe('test/2');
      expect(failedResult?.error?.message).toBe('Publish failed');
    });
  });
});
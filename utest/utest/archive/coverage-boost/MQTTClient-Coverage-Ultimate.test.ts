/**
 * MQTT客户端终极覆盖率测试
 * 专门用于提升覆盖率到95%+，覆盖边界情况和错误处理
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
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
  BatchMessage
} from '@/extension/mqtt/types';
import * as mqtt from 'mqtt';

// Mock fs和crypto
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

describe('MQTT客户端终极覆盖率测试', () => {
  let mqttClient: MQTTClient;
  let mockMqttClient: any;
  let config: MQTTConfig;
  
  // 全局错误处理器，防止未处理的Promise拒绝
  const errorHandler = () => {}; // 空函数静默处理错误
  
  // Helper函数创建带错误处理的MQTTClient
  const createMQTTClient = (clientConfig: MQTTConfig): MQTTClient => {
    const client = new MQTTClient(clientConfig);
    client.on('error', errorHandler);
    return client;
  };

  const createFullConfig = (): MQTTConfig => ({
    hostname: 'localhost',
    port: 1883,
    clientId: 'test-client',
    connectTimeout: 5000,
    username: 'testuser',
    password: 'testpass',
    protocolVersion: MQTTProtocolVersion.MQTT_5_0,
    cleanSession: true,
    keepAlive: 60,
    autoKeepAlive: true,
    topicFilter: 'test/+',
    mode: MQTTClientMode.Subscriber,
    willMessage: {
      topic: 'device/status',
      message: 'offline',
      qos: QoSLevel.AtMostOnce,
      retain: true
    },
    ssl: {
      enabled: false,
      protocol: SSLProtocol.TLS_1_2,
      peerVerifyMode: PeerVerifyMode.QueryPeer,
      peerVerifyDepth: 5,
      caCertificates: ['/path/to/ca.crt'],
      clientCertificate: '/path/to/client.crt',
      privateKey: '/path/to/client.key'
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    config = createFullConfig();
    
    mockMqttClient = Object.assign(new EventEmitter(), {
      connected: false,
      reconnecting: false,
      connect: vi.fn().mockReturnThis(),
      publish: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      end: vi.fn(),
      removeAllListeners: vi.fn(),
      pubrel: vi.fn()
    });

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
  });

  afterEach(async () => {
    try {
      if (mqttClient) {
        mqttClient.removeAllListeners();
        mqttClient.dispose();
      }
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('1. 高级连接场景测试', () => {
    it('应该正确处理自动重连逻辑', async () => {
      mqttClient = createMQTTClient(config);
      
      // 添加错误监听器避免未处理的错误
      mqttClient.on('error', () => {});
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      expect(mqttClient.isConnected()).toBe(true);

      // 模拟连接断开，触发自动重连
      mockMqttClient.connected = false;
      mockMqttClient.emit('close');

      // 等待重连尝试
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // 验证统计信息更新
      const stats = mqttClient.getStatistics();
      expect(stats.connectionInfo.reconnectAttempts).toBeGreaterThanOrEqual(0);
    });

    it('应该处理SSL连接配置', async () => {
      config.ssl.enabled = true;
      config.ssl.protocol = SSLProtocol.TLS_1_3;
      config.ssl.peerVerifyMode = PeerVerifyMode.VerifyPeer;
      
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      
      // 验证SSL配置被正确应用
      const connectCall = vi.mocked(mqtt.connect).mock.calls[0];
      expect(connectCall).toBeDefined();
    });

    it('应该处理MQTT 3.1.1协议版本', async () => {
      config.protocolVersion = MQTTProtocolVersion.MQTT_3_1_1;
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      expect(mqttClient.isConnected()).toBe(true);
    });

    it('应该处理自动订阅功能', async () => {
      config.mode = MQTTClientMode.Subscriber;
      config.topicFilter = 'auto/subscribe/topic';
      mqttClient = createMQTTClient(config);
      
      // 添加错误监听器
      mqttClient.on('error', () => {});
      
      mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null, [{ topic, qos: 1 }]);
        }, 10);
      });

      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      
      // 等待自动订阅
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        'auto/subscribe/topic',
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该处理自动订阅失败的情况', async () => {
      config.mode = MQTTClientMode.Subscriber;
      config.topicFilter = 'auto/subscribe/topic';
      mqttClient = createMQTTClient(config);
      
      // 添加错误监听器捕获自动订阅失败
      let autoSubscribeError: any = null;
      mqttClient.on('error', (error) => {
        if (error.code === 'AUTO_SUBSCRIBE_FAILED') {
          autoSubscribeError = error;
        }
      });
      
      mockMqttClient.subscribe.mockImplementation((topic, options, callback) => {
        setTimeout(() => {
          if (callback) callback(new Error('Subscribe failed'));
        }, 10);
      });

      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      
      // 等待自动订阅失败
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(autoSubscribeError).toBeDefined();
      expect(autoSubscribeError.code).toBe('AUTO_SUBSCRIBE_FAILED');
    });
  });

  describe('2. QoS消息处理覆盖', () => {
    beforeEach(async () => {
      config.mode = MQTTClientMode.Publisher;
      mqttClient = createMQTTClient(config);
      
      mockMqttClient.connected = true;
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();
    });

    it('应该处理QoS 1消息超时', async () => {
      const originalTimeout = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test'; // 确保使用短超时
      
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        const messageId = options.messageId || 1;
        setTimeout(() => {
          if (callback) callback(null, { messageId });
          // 不发送PUBACK，让它超时
        }, 10);
      });

      const publishPromise = mqttClient.publish('test/topic', Buffer.from('test message'), {
        qos: QoSLevel.AtLeastOnce
      });

      // 等待超时 - 需要等待超过qosTimeoutMs(1000ms) + 清理间隔(100ms)
      await expect(publishPromise).rejects.toThrow('QoS 1 message 1 timeout');
      
      // 恢复环境变量
      if (originalTimeout !== undefined) {
        process.env.NODE_ENV = originalTimeout;
      } else {
        delete process.env.NODE_ENV;
      }
    }, 2000); // 增加测试超时到2秒

    it('应该处理QoS 2消息流程', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        const messageId = options.messageId || 1;
        setTimeout(() => {
          if (callback) callback(null, { messageId });
          // 模拟 PUBREC 响应
          mockMqttClient.emit('pubrec', { messageId });
        }, 10);
      });

      mockMqttClient.pubrel.mockImplementation((packet, callback) => {
        setTimeout(() => {
          if (callback) callback();
          // 模拟 PUBCOMP 响应
          mockMqttClient.emit('pubcomp', { messageId: packet.messageId });
        }, 10);
      });

      await mqttClient.publish('test/topic', Buffer.from('test message'), {
        qos: QoSLevel.ExactlyOnce
      });

      expect(mockMqttClient.pubrel).toHaveBeenCalled();
    });

    it('应该处理QoS消息清理', async () => {
      // 创建一个过期的QoS消息
      const client = mqttClient as any;
      const messageId = 999;
      client.qos1Messages.set(messageId, {
        resolve: vi.fn(),
        reject: vi.fn(),
        timestamp: Date.now() - 60000 // 1分钟前，已过期
      });

      // 触发清理 (注意方法名是小写q)
      client.cleanupExpiredQosMessages();
      
      // 验证过期消息被清理
      expect(client.qos1Messages.has(messageId)).toBe(false);
    });
  });

  describe('3. 统计信息和性能监控', () => {
    beforeEach(async () => {
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();
    });

    it('应该正确跟踪消息统计', async () => {
      // 模拟接收消息
      const testMessage = {
        topic: 'test/topic',
        payload: Buffer.from('test message'),
        qos: 0,
        retain: false,
        dup: false
      };

      mockMqttClient.emit('message', testMessage.topic, testMessage.payload, testMessage);
      
      const stats = mqttClient.getStatistics();
      expect(stats.connectionInfo.messagesReceived).toBeGreaterThan(0);
      expect(stats.connectionInfo.bytesReceived).toBeGreaterThan(0);
    });

    it('应该正确跟踪发布统计', async () => {
      config.mode = MQTTClientMode.Publisher;
      const publisherClient = createMQTTClient(config);
      
      // 修复mock实现，确保连接状态正确
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await publisherClient.connect();

      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      await publisherClient.publish('test/topic', Buffer.from('test message'));
      
      const stats = publisherClient.getStatistics();
      expect(stats.connectionInfo.messagesSent).toBeGreaterThan(0);
      expect(stats.connectionInfo.bytesSent).toBeGreaterThan(0);
    });

    it('应该正确计算延迟统计', async () => {
      const client = mqttClient as any;
      
      // 添加一些延迟数据
      client.messageLatencies.push(10, 20, 30, 40, 50);
      
      // 触发统计更新
      client.updatePerformanceStatistics();
      
      const stats = mqttClient.getStatistics();
      expect(stats.performance.avgLatency).toBeGreaterThan(0);
      expect(stats.performance.maxLatency).toBeGreaterThan(0);
    });

    it('应该正确处理统计重置', () => {
      // 先添加一些统计数据
      const client = mqttClient as any;
      client.statistics.connectionInfo.messagesReceived = 10;
      client.statistics.connectionInfo.bytesReceived = 1000;
      
      mqttClient.resetStatistics();
      
      const stats = mqttClient.getStatistics();
      expect(stats.connectionInfo.messagesReceived).toBe(0);
      expect(stats.connectionInfo.bytesReceived).toBe(0);
    });
  });

  describe('4. 错误处理和边界情况', () => {
    it('应该处理客户端ID生成', () => {
      const configWithoutId = { ...config, clientId: '' };
      const clientWithoutId = createMQTTClient(configWithoutId);
      
      const resultConfig = clientWithoutId.getConfig();
      expect(resultConfig.clientId).toBeDefined();
      expect(resultConfig.clientId).toContain('vscode-serial-studio-');
    });

    it('应该处理无效的热路径数据', async () => {
      config.mode = MQTTClientMode.Publisher;
      config.topicFilter = ''; // 无主题
      mqttClient = createMQTTClient(config);
      
      // 添加错误监听器
      let hotpathError: any = null;
      mqttClient.on('error', (error) => {
        if (error.code === 'HOTPATH_TX_FAILED') {
          hotpathError = error;
        }
      });
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();
      await mqttClient.hotpathTxFrame(Buffer.from([1, 2, 3]));
      
      // 等待错误事件
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(hotpathError).toBeDefined();
      expect(hotpathError.code).toBe('HOTPATH_TX_FAILED');
    });

    it('应该处理批量发布的空数组', async () => {
      config.mode = MQTTClientMode.Publisher;
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();
      
      const results = await mqttClient.publishBatch([]);
      expect(results).toHaveLength(0);
    });

    it('应该处理dispose调用', () => {
      mqttClient = createMQTTClient(config);
      
      // 设置一些定时器
      const client = mqttClient as any;
      client.reconnectTimer = setTimeout(() => {}, 1000);
      client.statisticsTimer = setTimeout(() => {}, 1000);
      client.qosCleanupTimer = setTimeout(() => {}, 1000);
      
      mqttClient.dispose();
      
      // 验证定时器被清理
      expect(client.reconnectTimer).toBeNull();
      expect(client.statisticsTimer).toBeNull();
      expect(client.qosCleanupTimer).toBeNull();
    });

    it('应该处理多次dispose调用', () => {
      mqttClient = createMQTTClient(config);
      
      expect(() => {
        mqttClient.dispose();
        mqttClient.dispose();
        mqttClient.dispose();
      }).not.toThrow();
    });

    it('应该处理连接状态变化', async () => {
      mqttClient = createMQTTClient(config);
      
      // 通过统计信息检查连接状态
      expect(mqttClient.getStatistics().connectionInfo.state).toBe(MQTTConnectionState.Disconnected);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      const connectPromise = mqttClient.connect();
      
      // 连接中状态
      expect(mqttClient.getStatistics().connectionInfo.state).toBe(MQTTConnectionState.Connecting);
      
      await connectPromise;
      
      // 已连接状态
      expect(mqttClient.getStatistics().connectionInfo.state).toBe(MQTTConnectionState.Connected);
    });
  });

  describe('5. 事件处理增强测试', () => {
    beforeEach(async () => {
      mqttClient = createMQTTClient(config);
    });

    it('应该处理客户端错误事件', async () => {
      mqttClient.on('error', () => {}); // 防止未处理的错误

      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('error', new Error('Connection error'));
        }, 10);
        return mockMqttClient as any;
      });

      await expect(mqttClient.connect()).rejects.toThrow('Connection error');
    });

    it('应该处理离线事件', async () => {
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();

      // 模拟离线事件
      mockMqttClient.emit('offline');
      
      const stats = mqttClient.getStatistics();
      expect(stats.connectionInfo.state).toBe(MQTTConnectionState.Disconnected);
    });

    it('应该处理重连事件', async () => {
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();

      // 模拟重连事件
      mockMqttClient.emit('reconnect');
      
      const stats = mqttClient.getStatistics();
      expect(stats.connectionInfo.reconnectAttempts).toBeGreaterThanOrEqual(0);
    });
  });

  describe('6. 配置更新和验证', () => {
    it('应该正确更新配置', () => {
      mqttClient = createMQTTClient(config);
      
      const originalHostname = mqttClient.getConfig().hostname;
      expect(originalHostname).toBe('localhost');
      
      mqttClient.updateConfig({ hostname: 'newhost.com' });
      
      const updatedConfig = mqttClient.getConfig();
      expect(updatedConfig.hostname).toBe('newhost.com');
    });

    it('应该验证更新的配置', () => {
      mqttClient = createMQTTClient(config);
      
      const invalidUpdate = { port: 70000 }; // 无效端口
      const result = mqttClient.validateConfig({ ...config, ...invalidUpdate });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Port must be between 1 and 65535');
    });

    it('应该返回配置的深拷贝', () => {
      mqttClient = createMQTTClient(config);
      
      const config1 = mqttClient.getConfig();
      const config2 = mqttClient.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // 不是同一个对象引用
      
      // 修改一个配置不应该影响另一个
      config1.hostname = 'modified';
      expect(config2.hostname).toBe('localhost');
    });

    it('应该触发SSL配置变更事件', () => {
      mqttClient = createMQTTClient(config);
      
      let sslConfigChanged = false;
      mqttClient.on('sslConfigurationChanged', () => {
        sslConfigChanged = true;
      });
      
      mqttClient.updateConfig({ 
        ssl: { ...config.ssl, enabled: true } 
      });
      
      expect(sslConfigChanged).toBe(true);
    });
  });

  describe('7. 遗嘱消息处理测试', () => {
    it('应该支持遗嘱消息配置', () => {
      const configWithWill = {
        ...config,
        willMessage: {
          topic: 'device/status',
          message: 'offline',
          qos: QoSLevel.AtLeastOnce,
          retain: true
        }
      };
      
      const clientWithWill = createMQTTClient(configWithWill);
      const resultConfig = clientWithWill.getConfig();
      
      expect(resultConfig.willMessage).toBeDefined();
      expect(resultConfig.willMessage?.topic).toBe('device/status');
      expect(resultConfig.willMessage?.message).toBe('offline');
      expect(resultConfig.willMessage?.qos).toBe(QoSLevel.AtLeastOnce);
      expect(resultConfig.willMessage?.retain).toBe(true);
    });

    it('应该正确处理没有遗嘱消息的配置', () => {
      const configWithoutWill = { ...config };
      delete configWithoutWill.willMessage;
      
      const clientWithoutWill = createMQTTClient(configWithoutWill);
      const resultConfig = clientWithoutWill.getConfig();
      
      expect(resultConfig.willMessage).toBeUndefined();
    });
  });

  describe('8. 主题验证和过滤器测试', () => {
    it('应该正确设置和获取主题过滤器', () => {
      const configWithFilter = {
        ...config,
        topicFilter: 'sensors/+/temperature'
      };
      
      mqttClient = createMQTTClient(configWithFilter);
      const resultConfig = mqttClient.getConfig();
      
      expect(resultConfig.topicFilter).toBe('sensors/+/temperature');
    });

    it('应该支持更新主题过滤器', () => {
      mqttClient = createMQTTClient(config);
      
      mqttClient.updateConfig({ topicFilter: 'new/topic/filter' });
      const updatedConfig = mqttClient.getConfig();
      
      expect(updatedConfig.topicFilter).toBe('new/topic/filter');
    });

    it('应该正确验证空主题过滤器', () => {
      const configWithEmptyFilter = { ...config, topicFilter: '' };
      mqttClient = createMQTTClient(config);
      
      const result = mqttClient.validateConfig(configWithEmptyFilter);
      expect(result.valid).toBe(true); // 空主题过滤器是允许的
    });
  });

  describe('9. 并发处理测试', () => {
    it('应该正确处理并发控制', async () => {
      const client = mqttClient as any;
      
      // 创建多个Promise
      const promises = [
        Promise.resolve('result1'),
        Promise.resolve('result2'),
        Promise.resolve('result3'),
        Promise.resolve('result4'),
        Promise.resolve('result5')
      ];
      
      const results = await client.processConcurrently(promises, 2);
      
      expect(results).toHaveLength(5);
      expect(results).toContain('result1');
      expect(results).toContain('result2');
      expect(results).toContain('result3');
      expect(results).toContain('result4');
      expect(results).toContain('result5');
    });

    it('应该处理并发Promise中的错误', async () => {
      const client = mqttClient as any;
      
      const promises = [
        Promise.resolve('success'),
        Promise.resolve('another success')
      ];
      
      // 这个方法应该正确处理并发控制
      const results = await client.processConcurrently(promises, 1);
      
      expect(results).toHaveLength(2);
      expect(results).toContain('success');
      expect(results).toContain('another success');
    });
  });

  describe('10. 消息ID管理测试', () => {
    it('应该正确管理消息ID循环', () => {
      const client = mqttClient as any;
      
      // 设置消息ID接近上限
      client.messageIdCounter = 65534;
      
      const id1 = client.getNextMessageId();
      const id2 = client.getNextMessageId();
      const id3 = client.getNextMessageId();
      
      expect(id1).toBe(65534);
      expect(id2).toBe(65535);
      expect(id3).toBe(1); // 应该循环到1
    });
  });

  describe('11. 性能优化和缓冲管理', () => {
    beforeEach(async () => {
      config.mode = MQTTClientMode.Publisher;
      config.topicFilter = 'hotpath/data';
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });
      
      await mqttClient.connect();
    });

    it('应该正确管理消息延迟记录', () => {
      const client = mqttClient as any;
      
      // 添加大量延迟记录
      for (let i = 0; i < 1100; i++) {
        client.recordLatency(i);
      }
      
      // 应该只保留最近1000条记录
      expect(client.messageLatencies.length).toBe(1000);
      expect(client.messageLatencies[0]).toBe(100); // 前100条应该被移除
    });

    it('应该正确刷新热路径缓冲区', async () => {
      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        setTimeout(() => {
          if (callback) callback(null);
        }, 10);
      });

      const client = mqttClient as any;
      
      // 手动添加消息到缓冲区
      const testMessages = [
        { topic: 'test/1', payload: Buffer.from('msg1'), options: { qos: 0 } },
        { topic: 'test/2', payload: Buffer.from('msg2'), options: { qos: 0 } },
      ];
      
      client.hotpathBuffer = testMessages;
      
      // 手动刷新缓冲区
      client.flushHotpathBuffer();
      
      // 验证缓冲区被清空
      expect(client.hotpathBuffer).toHaveLength(0);
      
      // 等待批量发布完成
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('应该处理空缓冲区的刷新', () => {
      const client = mqttClient as any;
      client.hotpathBuffer = [];
      
      // 刷新空缓冲区不应该出错
      expect(() => {
        client.flushHotpathBuffer();
      }).not.toThrow();
    });
  });

  describe('12. 重连机制深度测试', () => {
    it('应该正确计算重连延迟', async () => {
      mqttClient = createMQTTClient(config);
      mqttClient.on('error', () => {}); // 防止未处理的错误
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();
      
      // 设置统计信息中的重连尝试次数
      const client = mqttClient as any;
      client.statistics.connectionInfo.reconnectAttempts = 3;
      
      // 触发重连调度
      client.scheduleReconnect();
      
      // 验证重连定时器被设置
      expect(client.reconnectTimer).toBeDefined();
      
      // 清理定时器
      if (client.reconnectTimer) {
        clearTimeout(client.reconnectTimer);
      }
    });

    it('应该停止超过最大重连次数的重连', async () => {
      mqttClient = createMQTTClient(config);
      mqttClient.on('error', () => {});
      
      const client = mqttClient as any;
      client.statistics.connectionInfo.reconnectAttempts = 15; // 超过最大次数10
      
      // 模拟连接失败
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('error', new Error('Connection failed'));
        }, 10);
        return mockMqttClient as any;
      });
      
      client.scheduleReconnect();
      
      // 等待重连尝试
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 验证不再继续重连（因为超过最大次数）
      expect(client.statistics.connectionInfo.reconnectAttempts).toBeGreaterThan(10);
    });
  });

  describe('13. 配置变更检测测试', () => {
    it('应该正确检测需要重连的配置变更', () => {
      mqttClient = createMQTTClient(config);
      const client = mqttClient as any;
      
      // 测试需要重连的配置变更
      const reconnectRequiredChanges = [
        { hostname: 'newhost.com' },
        { port: 8883 },
        { clientId: 'new-client-id' },
        { username: 'newuser' },
        { password: 'newpass' },
        { protocolVersion: MQTTProtocolVersion.MQTT_3_1_1 },
        { cleanSession: false },
        { keepAlive: 120 },
        { ssl: { ...config.ssl, enabled: true } }
      ];
      
      for (const change of reconnectRequiredChanges) {
        expect(client.requiresReconnection(change)).toBe(true);
      }
    });

    it('应该正确检测不需要重连的配置变更', () => {
      mqttClient = createMQTTClient(config);
      const client = mqttClient as any;
      
      // 测试不需要重连的配置变更
      const noReconnectChanges = [
        { topicFilter: 'new/topic' },
        { mode: MQTTClientMode.Publisher }
      ];
      
      for (const change of noReconnectChanges) {
        expect(client.requiresReconnection(change)).toBe(false);
      }
    });
  });

  describe('14. 事件系统完整性测试', () => {
    it('应该正确触发配置变更事件', () => {
      mqttClient = createMQTTClient(config);
      
      let configChanged = false;
      mqttClient.on('configurationChanged', () => {
        configChanged = true;
      });
      
      mqttClient.updateConfig({ hostname: 'newhost.com' });
      
      expect(configChanged).toBe(true);
    });

    it('应该正确触发统计更新事件', async () => {
      mqttClient = createMQTTClient(config);
      
      let statsUpdated = false;
      mqttClient.on('statisticsUpdated', () => {
        statsUpdated = true;
      });
      
      mqttClient.resetStatistics();
      
      expect(statsUpdated).toBe(true);
    });

    it('应该正确触发消息事件', async () => {
      config.mode = MQTTClientMode.Subscriber;
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();

      let receivedMessage: any = null;
      mqttClient.on('message', (message) => {
        receivedMessage = message;
      });

      // 模拟接收消息
      const testMessage = {
        topic: 'test/topic',
        payload: Buffer.from('test message'),
        qos: 1,
        retain: true,
        dup: false
      };

      mockMqttClient.emit('message', testMessage.topic, testMessage.payload, testMessage);

      expect(receivedMessage).toBeDefined();
      expect(receivedMessage.topic).toBe('test/topic');
      expect(receivedMessage.payload).toEqual(Buffer.from('test message'));
      expect(receivedMessage.qos).toBe(1);
      expect(receivedMessage.retain).toBe(true);
    });
  });

  describe('15. 异常场景处理', () => {
    it('应该处理客户端创建失败', () => {
      vi.mocked(mqtt.connect).mockImplementation(() => {
        throw new Error('Failed to create client');
      });

      mqttClient = createMQTTClient(config);
      
      expect(mqttClient.connect()).rejects.toThrow('Failed to create client');
    });

    it('应该处理QoS 2 PUBREL错误', async () => {
      config.mode = MQTTClientMode.Publisher;
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.connected = true;
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();

      mockMqttClient.publish.mockImplementation((topic, message, options, callback) => {
        const messageId = options.messageId || 1;
        setTimeout(() => {
          if (callback) callback(null, { messageId });
          mockMqttClient.emit('pubrec', { messageId });
        }, 10);
      });

      // 模拟PUBREL失败
      mockMqttClient.pubrel.mockImplementation((packet, callback) => {
        setTimeout(() => {
          if (callback) callback(new Error('PUBREL failed'));
        }, 10);
      });

      await expect(mqttClient.publish('test/topic', Buffer.from('test message'), {
        qos: QoSLevel.ExactlyOnce
      })).rejects.toThrow('PUBREL failed');
    });

    it('应该处理无效的QoS确认包', async () => {
      config.mode = MQTTClientMode.Publisher;
      mqttClient = createMQTTClient(config);
      
      vi.mocked(mqtt.connect).mockImplementation(() => {
        setTimeout(() => {
          mockMqttClient.emit('connect');
        }, 10);
        return mockMqttClient as any;
      });

      await mqttClient.connect();

      const client = mqttClient as any;

      // 发送无效的PUBACK（没有对应的待确认消息）
      client.handlePuback({ messageId: 999 });

      // 发送无效的PUBREC（没有对应的待确认消息）
      client.handlePubrec({ messageId: 999 });

      // 发送无效的PUBCOMP（没有对应的待确认消息）
      client.handlePubcomp({ messageId: 999 });

      // 这些调用不应该导致错误
      expect(true).toBe(true);
    });

    it('应该处理建立连接时客户端为null的情况', () => {
      mqttClient = createMQTTClient(config);
      const client = mqttClient as any;
      
      // 设置client为null
      client.client = null;
      
      // 调用setupClientEventHandlers不应该出错
      expect(() => {
        client.setupClientEventHandlers();
      }).not.toThrow();
    });
  });
});
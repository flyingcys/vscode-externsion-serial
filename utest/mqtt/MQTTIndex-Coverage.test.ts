/**
 * MQTT Index模块覆盖率测试
 * 测试index.ts中的工厂函数、配置模板和验证器
 */

import { describe, it, expect } from 'vitest';
import { 
  createDefaultMQTTConfig,
  MQTTConfigTemplates,
  MQTTConfigValidator
} from '@/extension/mqtt';
import { 
  MQTTClientMode, 
  MQTTProtocolVersion, 
  SSLProtocol,
  PeerVerifyMode,
  QoSLevel
} from '@/extension/mqtt/types';

describe('MQTT Index模块覆盖率测试', () => {
  
  describe('1. 默认配置工厂函数', () => {
    it('应该创建有效的默认配置', () => {
      const config = createDefaultMQTTConfig();
      
      expect(config).toBeDefined();
      expect(config.hostname).toBe('127.0.0.1');
      expect(config.port).toBe(1883);
      expect(config.clientId).toBe('');
      expect(config.protocolVersion).toBe(MQTTProtocolVersion.MQTT_5_0);
      expect(config.cleanSession).toBe(true);
      expect(config.keepAlive).toBe(60);
      expect(config.autoKeepAlive).toBe(true);
      expect(config.topicFilter).toBe('');
      expect(config.mode).toBe(MQTTClientMode.Subscriber);
      expect(config.ssl.enabled).toBe(false);
      expect(config.ssl.protocol).toBe(SSLProtocol.TLS_1_3);
      expect(config.ssl.peerVerifyMode).toBe(PeerVerifyMode.QueryPeer);
      expect(config.ssl.peerVerifyDepth).toBe(10);
    });

    it('应该创建独立的配置实例', () => {
      const config1 = createDefaultMQTTConfig();
      const config2 = createDefaultMQTTConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
      
      // 修改一个不应该影响另一个
      config1.hostname = 'modified';
      expect(config2.hostname).toBe('127.0.0.1');
    });
  });

  describe('2. 预定义配置模板', () => {
    it('应该创建本地开发配置', () => {
      const localConfig = MQTTConfigTemplates.local();
      
      expect(localConfig.hostname).toBe('localhost');
      expect(localConfig.port).toBe(1883);
      expect(localConfig.mode).toBe(MQTTClientMode.Subscriber);
      expect(localConfig.topicFilter).toBe('serial-studio/data');
      expect(localConfig.ssl.enabled).toBe(false);
    });

    it('应该创建生产环境配置', () => {
      const prodConfig = MQTTConfigTemplates.production();
      
      expect(prodConfig.hostname).toBe('mqtt.example.com');
      expect(prodConfig.port).toBe(8883);
      expect(prodConfig.ssl.enabled).toBe(true);
      expect(prodConfig.ssl.protocol).toBe(SSLProtocol.TLS_1_3);
      expect(prodConfig.ssl.peerVerifyMode).toBe(PeerVerifyMode.VerifyPeer);
      expect(prodConfig.ssl.peerVerifyDepth).toBe(10);
    });

    it('应该创建发布者配置', () => {
      const publisherConfig = MQTTConfigTemplates.publisher();
      
      expect(publisherConfig.mode).toBe(MQTTClientMode.Publisher);
      expect(publisherConfig.topicFilter).toBe('serial-studio/output');
    });

    it('应该创建AWS IoT配置', () => {
      const awsConfig = MQTTConfigTemplates.awsIot();
      
      expect(awsConfig.hostname).toBe('your-endpoint.iot.region.amazonaws.com');
      expect(awsConfig.port).toBe(8883);
      expect(awsConfig.protocolVersion).toBe(MQTTProtocolVersion.MQTT_3_1_1);
      expect(awsConfig.ssl.enabled).toBe(true);
      expect(awsConfig.ssl.protocol).toBe(SSLProtocol.TLS_1_2);
      expect(awsConfig.ssl.peerVerifyMode).toBe(PeerVerifyMode.VerifyPeer);
    });

    it('应该创建Azure IoT配置', () => {
      const azureConfig = MQTTConfigTemplates.azureIot();
      
      expect(azureConfig.hostname).toBe('your-hub.azure-devices.net');
      expect(azureConfig.port).toBe(8883);
      expect(azureConfig.protocolVersion).toBe(MQTTProtocolVersion.MQTT_3_1_1);
      expect(azureConfig.ssl.enabled).toBe(true);
      expect(azureConfig.ssl.protocol).toBe(SSLProtocol.TLS_1_2);
      expect(azureConfig.ssl.peerVerifyMode).toBe(PeerVerifyMode.VerifyPeer);
    });

    it('应该创建独立的模板实例', () => {
      const template1 = MQTTConfigTemplates.local();
      const template2 = MQTTConfigTemplates.local();
      
      expect(template1).toEqual(template2);
      expect(template1).not.toBe(template2);
      
      // 修改一个不应该影响另一个
      template1.hostname = 'modified';
      expect(template2.hostname).toBe('localhost');
    });
  });

  describe('3. 配置验证器深度测试', () => {
    it('应该验证完整的有效配置', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'valid-host.com';
      config.clientId = 'valid-client-id';
      config.port = 1883;
      config.keepAlive = 60;
      config.topicFilter = 'valid/topic/+';
      config.ssl.enabled = true;
      config.ssl.peerVerifyDepth = 5;
      config.willMessage = {
        topic: 'device/status',
        message: 'offline',
        qos: QoSLevel.AtMostOnce,
        retain: true
      };
      
      const result = MQTTConfigValidator.validate(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测所有类型的配置错误', () => {
      const invalidConfig = createDefaultMQTTConfig();
      invalidConfig.hostname = ''; // 无效主机名
      invalidConfig.port = 70000; // 无效端口
      invalidConfig.keepAlive = -1; // 无效Keep Alive
      invalidConfig.topicFilter = 'invalid/+/topic/#/more'; // 无效主题过滤器
      invalidConfig.ssl.enabled = true;
      invalidConfig.ssl.peerVerifyDepth = -1; // 无效SSL深度
      invalidConfig.willMessage = {
        topic: '', // 空Will主题
        message: 'offline',
        qos: QoSLevel.AtMostOnce,
        retain: true
      };
      
      const result = MQTTConfigValidator.validate(invalidConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(4);
      expect(result.errors).toContain('Hostname is required');
      expect(result.errors).toContain('Port must be between 1 and 65535');
      expect(result.errors).toContain('Keep alive must be between 0 and 65535');
      expect(result.errors).toContain('Invalid topic filter format');
      expect(result.errors).toContain('SSL peer verify depth must be between 0 and 100');
      expect(result.errors).toContain('Will message topic is required when will message is configured');
    });

    it('应该处理边界值验证', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      
      // 测试端口边界值
      config.port = 1;
      let result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      
      config.port = 65535;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      
      // 测试Keep Alive边界值
      config.keepAlive = 0;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      
      config.keepAlive = 65535;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      
      // 测试SSL深度边界值
      config.ssl.enabled = true;
      config.ssl.peerVerifyDepth = 0;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
      
      config.ssl.peerVerifyDepth = 100;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
    });
  });

  describe('4. 主题验证深度测试', () => {
    describe('isValidTopic', () => {
      it('应该验证各种有效主题', () => {
        const validTopics = [
          'simple',
          'with/slash',
          'with/multiple/slashes',
          'with-dashes',
          'with_underscores',
          'with123numbers',
          'MixedCase',
          'very/long/topic/with/many/levels/to/test/depth',
          '/', // 根主题
          'a', // 单字符主题
          '123', // 纯数字主题
          'topic.with.dots'
        ];

        validTopics.forEach(topic => {
          expect(MQTTConfigValidator.isValidTopic(topic))
            .toBe(true, `Topic "${topic}" should be valid`);
        });
      });

      it('应该拒绝各种无效主题', () => {
        const invalidTopics = [
          '', // 空主题
          'topic/with/+/wildcard',
          'topic/with/#/wildcard',
          'topic/with/+',
          'topic/#',
          '#',
          '+',
          '/leading/slash',
          'trailing/slash/',
          'topic\0with\0null',
          'a'.repeat(65536), // 超长主题
          null as any,
          undefined as any
        ];

        invalidTopics.forEach(topic => {
          expect(MQTTConfigValidator.isValidTopic(topic))
            .toBe(false, `Topic "${topic}" should be invalid`);
        });
      });
    });

    describe('isValidTopicFilter', () => {
      it('应该验证各种有效主题过滤器', () => {
        const validFilters = [
          'simple/topic',
          'topic/+/filter',
          'topic/#',
          '+/single/level',
          'multi/+/level/+/filter',
          '#', // 全通配
          '+', // 单级通配
          'topic/+/#',
          'device/+/sensor/+/data',
          'system/+/+/status',
          'a/+/b/+/c/#'
        ];

        validFilters.forEach(filter => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(true, `Filter "${filter}" should be valid`);
        });
      });

      it('应该拒绝各种无效主题过滤器', () => {
        const invalidFilters = [
          '', // 空过滤器
          'topic/+invalid',
          'topic/invalid+',
          'topic/+invalid/more',
          'topic/#/invalid',
          'topic#',
          'topic/temp#',
          '#/not/at/end',
          'topic/#/more/levels',
          'a'.repeat(65536), // 超长过滤器
          null as any,
          undefined as any
        ];

        invalidFilters.forEach(filter => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(false, `Filter "${filter}" should be invalid`);
        });
      });

      it('应该正确处理复杂的通配符组合', () => {
        const complexFilters = [
          { filter: 'home/+/+/temperature', valid: true },
          { filter: 'devices/+/sensors/+/data/#', valid: true },
          { filter: 'notifications/+/#', valid: true },
          { filter: 'system/+/+/+/status', valid: true },
          { filter: 'data/+/streams/+/+/#', valid: true },
          { filter: '+/+/+/+/+', valid: true },
          { filter: 'invalid/+invalid/topic', valid: false },
          { filter: 'invalid/topic#+', valid: false },
          { filter: 'invalid/#/middle', valid: false }
        ];

        complexFilters.forEach(({ filter, valid }) => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(valid, `Filter "${filter}" should be ${valid ? 'valid' : 'invalid'}`);
        });
      });
    });
  });

  describe('5. Will消息验证', () => {
    it('应该验证有效的Will消息配置', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      config.willMessage = {
        topic: 'device/status',
        message: 'Device went offline',
        qos: QoSLevel.AtLeastOnce,
        retain: true
      };
      
      const result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
    });

    it('应该拒绝空的Will主题', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      config.willMessage = {
        topic: '',
        message: 'Device went offline',
        qos: QoSLevel.AtLeastOnce,
        retain: true
      };
      
      const result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Will message topic is required when will message is configured');
    });

    it('应该拒绝包含通配符的Will主题', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      config.willMessage = {
        topic: 'device/+/status',
        message: 'Device went offline',
        qos: QoSLevel.AtLeastOnce,
        retain: true
      };
      
      const result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid will message topic format');
    });
  });

  describe('6. 类型安全和边界条件测试', () => {
    it('应该正确验证各种QoS级别', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      
      // 测试不同的QoS级别
      const qosLevels = [QoSLevel.AtMostOnce, QoSLevel.AtLeastOnce, QoSLevel.ExactlyOnce];
      
      for (const qos of qosLevels) {
        config.willMessage = {
          topic: 'device/status',
          message: 'offline',
          qos: qos,
          retain: true
        };
        
        const result = MQTTConfigValidator.validate(config);
        expect(result.valid).toBe(true, `QoS ${qos} should be valid`);
      }
    });

    it('应该正确处理协议版本验证', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      
      // 测试不同的协议版本
      const versions = [
        MQTTProtocolVersion.MQTT_3_1,
        MQTTProtocolVersion.MQTT_3_1_1,
        MQTTProtocolVersion.MQTT_5_0
      ];
      
      for (const version of versions) {
        config.protocolVersion = version;
        const result = MQTTConfigValidator.validate(config);
        expect(result.valid).toBe(true, `Protocol version ${version} should be valid`);
      }
    });

    it('应该正确验证SSL协议配置', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      config.ssl.enabled = true;
      
      // 测试不同的SSL协议
      const sslProtocols = [SSLProtocol.TLS_1_2, SSLProtocol.TLS_1_3, SSLProtocol.ANY_PROTOCOL];
      
      for (const protocol of sslProtocols) {
        config.ssl.protocol = protocol;
        const result = MQTTConfigValidator.validate(config);
        expect(result.valid).toBe(true, `SSL protocol ${protocol} should be valid`);
      }
    });

    it('应该正确验证对等验证模式', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      config.ssl.enabled = true;
      
      // 测试不同的对等验证模式
      const verifyModes = [
        PeerVerifyMode.None,
        PeerVerifyMode.QueryPeer,
        PeerVerifyMode.VerifyPeer,
        PeerVerifyMode.AutoVerifyPeer
      ];
      
      for (const mode of verifyModes) {
        config.ssl.peerVerifyMode = mode;
        const result = MQTTConfigValidator.validate(config);
        expect(result.valid).toBe(true, `Peer verify mode ${mode} should be valid`);
      }
    });

    it('应该正确验证客户端模式', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      
      // 测试不同的客户端模式
      const modes = [MQTTClientMode.Subscriber, MQTTClientMode.Publisher];
      
      for (const mode of modes) {
        config.mode = mode;
        const result = MQTTConfigValidator.validate(config);
        expect(result.valid).toBe(true, `Client mode ${mode} should be valid`);
      }
    });

    it('应该验证复杂的主题过滤器场景', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'test';
      config.clientId = 'test';
      
      // 测试复杂的主题过滤器场景
      const complexFilters = [
        'home/+/temperature',
        'devices/+/sensors/+/data',
        'system/monitoring/+/status',
        'notifications/+/+/alerts',
        'data/streams/+/+/+/metrics',
        'iot/+/device/+/telemetry/#'
      ];
      
      for (const filter of complexFilters) {
        config.topicFilter = filter;
        const result = MQTTConfigValidator.validate(config);
        expect(result.valid).toBe(true, `Complex filter "${filter}" should be valid`);
      }
    });
  });
});
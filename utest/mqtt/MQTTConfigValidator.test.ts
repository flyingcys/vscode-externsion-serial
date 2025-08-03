/**
 * MQTT配置验证器测试
 * 测试MQTT配置的验证逻辑和主题过滤器验证
 */

import { describe, it, expect } from 'vitest';
import { MQTTConfigValidator, createDefaultMQTTConfig } from '../../src/extension/mqtt';
import { MQTTClientMode, MQTTProtocolVersion, QoSLevel } from '../../src/extension/mqtt/types';

describe('MQTTConfigValidator', () => {
  
  describe('配置验证', () => {
    it('应该验证有效的默认配置', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'localhost';
      config.clientId = 'test-client';
      
      const result = MQTTConfigValidator.validate(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测空主机名', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = '';
      config.clientId = 'test-client';
      
      const result = MQTTConfigValidator.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hostname is required');
    });

    it('应该检测空白主机名', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = '   ';
      config.clientId = 'test-client';
      
      const result = MQTTConfigValidator.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hostname is required');
    });

    it('应该验证端口范围', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'localhost';  
      config.clientId = 'test-client';

      // 测试无效端口
      config.port = 0;
      let result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Port must be between 1 and 65535');

      config.port = 65536;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Port must be between 1 and 65535');

      // 测试有效端口
      config.port = 1;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);

      config.port = 65535;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);

      config.port = 1883;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
    });

    it('应该验证Keep Alive范围', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'localhost';
      config.clientId = 'test-client';

      // 测试无效Keep Alive
      config.keepAlive = -1;
      let result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Keep alive must be between 0 and 65535');

      config.keepAlive = 65536;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Keep alive must be between 0 and 65535');

      // 测试有效Keep Alive
      config.keepAlive = 0;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);

      config.keepAlive = 60;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);

      config.keepAlive = 65535;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
    });

    it('应该验证SSL配置', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'localhost';
      config.clientId = 'test-client';
      config.ssl.enabled = true;

      // 测试无效的peer verify depth
      config.ssl.peerVerifyDepth = -1;
      let result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SSL peer verify depth must be between 0 and 100');

      config.ssl.peerVerifyDepth = 101;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SSL peer verify depth must be between 0 and 100');

      // 测试有效的peer verify depth
      config.ssl.peerVerifyDepth = 0;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);

      config.ssl.peerVerifyDepth = 10;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);

      config.ssl.peerVerifyDepth = 100;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
    });

    it('应该验证Will消息配置', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = 'localhost';
      config.clientId = 'test-client';
      
      // 测试空的Will主题
      config.willMessage = {
        topic: '',
        message: 'Device offline',
        qos: QoSLevel.AtMostOnce,
        retain: true
      };
      
      let result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Will message topic is required when will message is configured');

      // 测试无效的Will主题
      config.willMessage.topic = 'invalid/+/topic';
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid will message topic format');

      // 测试有效的Will主题
      config.willMessage.topic = 'devices/sensor123/status';
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(true);
    });
  });

  describe('主题验证', () => {
    describe('isValidTopic', () => {
      it('应该验证有效的主题', () => {
        const validTopics = [
          'sensor/temperature',
          'home/living-room/temperature',
          'device123',
          'a/b/c/d/e',
          'sports/tennis/player1',
          'finance/stock/IBM',
          '/', // 根主题
          'topic'
        ];

        validTopics.forEach(topic => {
          expect(MQTTConfigValidator.isValidTopic(topic))
            .toBe(true, `Topic "${topic}" should be valid`);
        });
      });

      it('应该拒绝包含通配符的主题', () => {
        const invalidTopics = [
          'sensor/+',
          'sensor/+/temperature',
          'sensor/#',
          'sensor/temp/+/value',
          '+/temperature',
          '#'
        ];

        invalidTopics.forEach(topic => {
          expect(MQTTConfigValidator.isValidTopic(topic))
            .toBe(false, `Topic "${topic}" should be invalid (contains wildcards)`);
        });
      });

      it('应该拒绝空或过长的主题', () => {
        expect(MQTTConfigValidator.isValidTopic('')).toBe(false);
        expect(MQTTConfigValidator.isValidTopic('a'.repeat(65536))).toBe(false);
      });

      it('应该拒绝包含null字符的主题', () => {
        expect(MQTTConfigValidator.isValidTopic('topic\0with\0null')).toBe(false);
      });

      it('应该拒绝以/开头或结尾的主题（除根主题外）', () => {
        expect(MQTTConfigValidator.isValidTopic('/sensor/temp')).toBe(false);
        expect(MQTTConfigValidator.isValidTopic('sensor/temp/')).toBe(false);
        expect(MQTTConfigValidator.isValidTopic('/')).toBe(true); // 根主题是特例
      });
    });

    describe('isValidTopicFilter', () => {
      it('应该验证有效的主题过滤器', () => {
        const validFilters = [
          'sensor/temperature',
          'sensor/+/temperature',
          'sensor/#',
          '+/temperature', 
          '#',
          'home/+/+/temperature',
          'sensor/+/temperature/#',
          'sport/tennis/+',
          'finance/stock/+/+',
        ];

        validFilters.forEach(filter => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(true, `Filter "${filter}" should be valid`);
        });
      });

      it('应该拒绝无效的+通配符使用', () => {
        const invalidFilters = [
          'sensor/+temperature',   // + 不是单独的级别
          'sensor/temp+',          // + 不是单独的级别  
          'sensor/+temperature/value', // + 不是单独的级别
          'sen+sor/temperature'    // + 不是单独的级别
        ];

        invalidFilters.forEach(filter => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(false, `Filter "${filter}" should be invalid (invalid + usage)`);
        });
      });

      it('应该拒绝无效的#通配符使用', () => {
        const invalidFilters = [
          'sensor/#/temperature',  // # 不在末尾
          'sensor/temp#',          // # 不是单独的级别
          'sensor#',               // # 不是单独的级别
          '#/temperature',         // # 不在末尾
          'sensor/#/more'          // # 不在末尾
        ];

        invalidFilters.forEach(filter => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(false, `Filter "${filter}" should be invalid (invalid # usage)`);
        });
      });

      it('应该拒绝空或过长的主题过滤器', () => {
        expect(MQTTConfigValidator.isValidTopicFilter('')).toBe(false);
        expect(MQTTConfigValidator.isValidTopicFilter('a'.repeat(65536))).toBe(false);
      });

      it('应该验证复杂的有效过滤器', () => {
        const complexValidFilters = [
          'home/+/+/temperature',
          'devices/+/sensors/+/data',
          'notifications/+/#',
          'system/+/+/+/status',
          'data/+/streams/#'
        ];

        complexValidFilters.forEach(filter => {
          expect(MQTTConfigValidator.isValidTopicFilter(filter))
            .toBe(true, `Complex filter "${filter}" should be valid`);
        });
      });
    });
  });

  describe('边界情况测试', () => {
    it('应该处理undefined和null值', () => {
      const config = createDefaultMQTTConfig();
      
      // @ts-ignore - 故意测试运行时的边界情况
      config.hostname = null;
      let result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);

      // @ts-ignore - 故意测试运行时的边界情况
      config.hostname = undefined;
      result = MQTTConfigValidator.validate(config);
      expect(result.valid).toBe(false);
    });

    it('应该处理主题验证的边界情况', () => {
      // @ts-ignore - 测试运行时类型
      expect(MQTTConfigValidator.isValidTopic(null)).toBe(false);
      // @ts-ignore - 测试运行时类型
      expect(MQTTConfigValidator.isValidTopic(undefined)).toBe(false);
      // @ts-ignore - 测试运行时类型
      expect(MQTTConfigValidator.isValidTopicFilter(null)).toBe(false);
      // @ts-ignore - 测试运行时类型  
      expect(MQTTConfigValidator.isValidTopicFilter(undefined)).toBe(false);
    });

    it('应该正确处理多个验证错误', () => {
      const config = createDefaultMQTTConfig();
      config.hostname = '';
      config.port = 70000;
      config.keepAlive = -5;
      config.ssl.enabled = true;
      config.ssl.peerVerifyDepth = -10;
      
      const result = MQTTConfigValidator.validate(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
      expect(result.errors).toContain('Hostname is required');
      expect(result.errors).toContain('Port must be between 1 and 65535');
      expect(result.errors).toContain('Keep alive must be between 0 and 65535');
      expect(result.errors).toContain('SSL peer verify depth must be between 0 and 100');
    });
  });
});
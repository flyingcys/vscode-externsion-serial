/**
 * MQTT模块入口
 * 导出所有MQTT相关的类和类型
 */

export { MQTTClient } from './MQTTClient';
export * from './types';

// 默认配置工厂函数
import { 
  MQTTConfig, 
  MQTTClientMode, 
  MQTTProtocolVersion, 
  QoSLevel,
  SSLProtocol,
  PeerVerifyMode 
} from './types';

export function createDefaultMQTTConfig(): MQTTConfig {
  return {
    hostname: '127.0.0.1',
    port: 1883,
    clientId: '', // 将由MQTTClient自动生成
    protocolVersion: MQTTProtocolVersion.MQTT_5_0,
    cleanSession: true,
    keepAlive: 60,
    autoKeepAlive: true,
    topicFilter: '',
    mode: MQTTClientMode.Subscriber,
    ssl: {
      enabled: false,
      protocol: SSLProtocol.TLS_1_3,
      peerVerifyMode: PeerVerifyMode.QueryPeer,
      peerVerifyDepth: 10
    }
  };
}

// 预定义的配置模板
export const MQTTConfigTemplates = {
  // 本地开发用的基础配置
  local: (): MQTTConfig => ({
    ...createDefaultMQTTConfig(),
    hostname: 'localhost',
    port: 1883,
    mode: MQTTClientMode.Subscriber,
    topicFilter: 'serial-studio/data'
  }),

  // 生产环境SSL配置
  production: (): MQTTConfig => ({
    ...createDefaultMQTTConfig(),
    hostname: 'mqtt.example.com',
    port: 8883,
    ssl: {
      enabled: true,
      protocol: SSLProtocol.TLS_1_3,
      peerVerifyMode: PeerVerifyMode.VerifyPeer,
      peerVerifyDepth: 10
    }
  }),

  // 发布者配置
  publisher: (): MQTTConfig => ({
    ...createDefaultMQTTConfig(),
    mode: MQTTClientMode.Publisher,
    topicFilter: 'serial-studio/output'
  }),

  // IoT平台配置（如AWS IoT Core）
  awsIot: (): MQTTConfig => ({
    ...createDefaultMQTTConfig(),
    hostname: 'your-endpoint.iot.region.amazonaws.com',
    port: 8883,
    protocolVersion: MQTTProtocolVersion.MQTT_3_1_1,
    ssl: {
      enabled: true,
      protocol: SSLProtocol.TLS_1_2,
      peerVerifyMode: PeerVerifyMode.VerifyPeer,
      peerVerifyDepth: 10
    }
  }),

  // Azure IoT Hub配置
  azureIot: (): MQTTConfig => ({
    ...createDefaultMQTTConfig(),
    hostname: 'your-hub.azure-devices.net',
    port: 8883,
    protocolVersion: MQTTProtocolVersion.MQTT_3_1_1,
    ssl: {
      enabled: true,
      protocol: SSLProtocol.TLS_1_2,
      peerVerifyMode: PeerVerifyMode.VerifyPeer,
      peerVerifyDepth: 10
    }
  })
};

// 工具函数
export class MQTTConfigValidator {
  static validate(config: MQTTConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Host validation
    if (!config.hostname?.trim()) {
      errors.push('Hostname is required');
    }

    // Port validation  
    if (config.port < 1 || config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    // Client ID validation
    if (!config.clientId?.trim()) {
      // 这个可以自动生成，所以只是警告
      // errors.push('Client ID is recommended');
    }

    // Topic validation
    if (config.topicFilter && !MQTTConfigValidator.isValidTopicFilter(config.topicFilter)) {
      errors.push('Invalid topic filter format');
    }

    // Keep alive validation
    if (config.keepAlive < 0 || config.keepAlive > 65535) {
      errors.push('Keep alive must be between 0 and 65535');
    }

    // SSL validation
    if (config.ssl.enabled) {
      if (config.ssl.peerVerifyDepth < 0 || config.ssl.peerVerifyDepth > 100) {
        errors.push('SSL peer verify depth must be between 0 and 100');
      }
    }

    // Will message validation
    if (config.willMessage) {
      if (!config.willMessage.topic?.trim()) {
        errors.push('Will message topic is required when will message is configured');
      }
      if (!MQTTConfigValidator.isValidTopic(config.willMessage.topic)) {
        errors.push('Invalid will message topic format');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static isValidTopic(topic: string): boolean {
    if (!topic || topic.length === 0 || topic.length > 65535) {
      return false;
    }

    // MQTT主题不能包含通配符（发布时）
    if (topic.includes('+') || topic.includes('#')) {
      return false;
    }

    // 不能以/开头或结尾（除非是根主题）
    if (topic !== '/' && (topic.startsWith('/') || topic.endsWith('/'))) {
      return false;
    }

    // 不能包含null字符
    if (topic.includes('\0')) {
      return false;
    }

    return true;
  }

  static isValidTopicFilter(topicFilter: string): boolean {
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
}
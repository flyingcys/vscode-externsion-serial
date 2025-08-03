"use strict";
/**
 * MQTT模块入口
 * 导出所有MQTT相关的类和类型
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTConfigValidator = exports.MQTTConfigTemplates = exports.createDefaultMQTTConfig = exports.MQTTClient = void 0;
var MQTTClient_1 = require("./MQTTClient");
Object.defineProperty(exports, "MQTTClient", { enumerable: true, get: function () { return MQTTClient_1.MQTTClient; } });
__exportStar(require("./types"), exports);
// 默认配置工厂函数
const types_1 = require("./types");
function createDefaultMQTTConfig() {
    return {
        hostname: '127.0.0.1',
        port: 1883,
        clientId: '',
        protocolVersion: types_1.MQTTProtocolVersion.MQTT_5_0,
        cleanSession: true,
        keepAlive: 60,
        autoKeepAlive: true,
        topicFilter: '',
        mode: types_1.MQTTClientMode.Subscriber,
        ssl: {
            enabled: false,
            protocol: types_1.SSLProtocol.TLS_1_3,
            peerVerifyMode: types_1.PeerVerifyMode.QueryPeer,
            peerVerifyDepth: 10
        }
    };
}
exports.createDefaultMQTTConfig = createDefaultMQTTConfig;
// 预定义的配置模板
exports.MQTTConfigTemplates = {
    // 本地开发用的基础配置
    local: () => ({
        ...createDefaultMQTTConfig(),
        hostname: 'localhost',
        port: 1883,
        mode: types_1.MQTTClientMode.Subscriber,
        topicFilter: 'serial-studio/data'
    }),
    // 生产环境SSL配置
    production: () => ({
        ...createDefaultMQTTConfig(),
        hostname: 'mqtt.example.com',
        port: 8883,
        ssl: {
            enabled: true,
            protocol: types_1.SSLProtocol.TLS_1_3,
            peerVerifyMode: types_1.PeerVerifyMode.VerifyPeer,
            peerVerifyDepth: 10
        }
    }),
    // 发布者配置
    publisher: () => ({
        ...createDefaultMQTTConfig(),
        mode: types_1.MQTTClientMode.Publisher,
        topicFilter: 'serial-studio/output'
    }),
    // IoT平台配置（如AWS IoT Core）
    awsIot: () => ({
        ...createDefaultMQTTConfig(),
        hostname: 'your-endpoint.iot.region.amazonaws.com',
        port: 8883,
        protocolVersion: types_1.MQTTProtocolVersion.MQTT_3_1_1,
        ssl: {
            enabled: true,
            protocol: types_1.SSLProtocol.TLS_1_2,
            peerVerifyMode: types_1.PeerVerifyMode.VerifyPeer,
            peerVerifyDepth: 10
        }
    }),
    // Azure IoT Hub配置
    azureIot: () => ({
        ...createDefaultMQTTConfig(),
        hostname: 'your-hub.azure-devices.net',
        port: 8883,
        protocolVersion: types_1.MQTTProtocolVersion.MQTT_3_1_1,
        ssl: {
            enabled: true,
            protocol: types_1.SSLProtocol.TLS_1_2,
            peerVerifyMode: types_1.PeerVerifyMode.VerifyPeer,
            peerVerifyDepth: 10
        }
    })
};
// 工具函数
class MQTTConfigValidator {
    static validate(config) {
        const errors = [];
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
    static isValidTopic(topic) {
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
    static isValidTopicFilter(topicFilter) {
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
exports.MQTTConfigValidator = MQTTConfigValidator;
//# sourceMappingURL=index.js.map
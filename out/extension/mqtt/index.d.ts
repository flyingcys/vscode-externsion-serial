/**
 * MQTT模块入口
 * 导出所有MQTT相关的类和类型
 */
export { MQTTClient } from './MQTTClient';
export * from './types';
import { MQTTConfig } from './types';
export declare function createDefaultMQTTConfig(): MQTTConfig;
export declare const MQTTConfigTemplates: {
    local: () => MQTTConfig;
    production: () => MQTTConfig;
    publisher: () => MQTTConfig;
    awsIot: () => MQTTConfig;
    azureIot: () => MQTTConfig;
};
export declare class MQTTConfigValidator {
    static validate(config: MQTTConfig): {
        valid: boolean;
        errors: string[];
    };
    static isValidTopic(topic: string): boolean;
    static isValidTopicFilter(topicFilter: string): boolean;
}
//# sourceMappingURL=index.d.ts.map
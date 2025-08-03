/**
 * MQTT客户端实现
 * 基于Serial-Studio MQTT::Client的TypeScript版本
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { MQTTConfig, MQTTStatistics, PublishOptions, SubscriptionOptions, BatchMessage, BatchPublishOptions, BatchPublishResult, IMQTTClient } from './types';
export declare class MQTTClient extends EventEmitter implements IMQTTClient {
    private client;
    private config;
    private connectionState;
    private statistics;
    private reconnectTimer;
    private statisticsTimer;
    private messageLatencies;
    private lastStatisticsUpdate;
    private qos1Messages;
    private qos2Messages;
    private messageIdCounter;
    private qosTimeoutMs;
    private qosCleanupTimer;
    private hotpathBuffer;
    private hotpathTimer;
    private hotpathBatchSize;
    private hotpathBatchTimeout;
    constructor(config: MQTTConfig);
    connect(): Promise<void>;
    disconnect(force?: boolean): Promise<void>;
    reconnect(): Promise<void>;
    isConnected(): boolean;
    publish(topic: string, payload: Buffer, options?: PublishOptions): Promise<void>;
    publishBatch(messages: BatchMessage[], options?: BatchPublishOptions): Promise<BatchPublishResult[]>;
    subscribe(topic: string, options?: SubscriptionOptions): Promise<void>;
    unsubscribe(topic: string): Promise<void>;
    updateConfig(newConfig: Partial<MQTTConfig>): void;
    getConfig(): MQTTConfig;
    validateConfig(config: MQTTConfig): {
        valid: boolean;
        errors: string[];
    };
    getStatistics(): MQTTStatistics;
    resetStatistics(): void;
    hotpathTxFrame(data: Buffer): Promise<void>;
    private flushHotpathBuffer;
    private buildBrokerUrl;
    private buildConnectOptions;
    private setupClientEventHandlers;
    private handleUnexpectedDisconnection;
    private scheduleReconnect;
    private requiresReconnection;
    private isValidTopic;
    private isValidTopicFilter;
    private regenerateClientId;
    private initializeStatistics;
    private recordLatency;
    private updatePerformanceStatistics;
    private startStatisticsTimer;
    private startQosCleanupTimer;
    private getNextMessageId;
    private handlePuback;
    private handlePubrec;
    private handlePubcomp;
    private cleanupExpiredQosMessages;
    private processConcurrently;
    dispose(): void;
}
//# sourceMappingURL=MQTTClient.d.ts.map
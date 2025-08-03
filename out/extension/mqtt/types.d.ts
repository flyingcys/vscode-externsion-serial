/**
 * MQTT模块类型定义
 * 基于Serial-Studio MQTT::Client实现的TypeScript版本
 */
/// <reference types="node" />
/// <reference types="node" />
export declare enum MQTTConnectionState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2,
    Disconnecting = 3,
    Reconnecting = 4
}
export declare enum MQTTClientMode {
    Subscriber = 0,
    Publisher = 1
}
export declare enum MQTTProtocolVersion {
    MQTT_3_1 = 3,
    MQTT_3_1_1 = 4,
    MQTT_5_0 = 5
}
export declare enum QoSLevel {
    AtMostOnce = 0,
    AtLeastOnce = 1,
    ExactlyOnce = 2
}
export declare enum SSLProtocol {
    TLS_1_2 = "TLSv1.2",
    TLS_1_3 = "TLSv1.3",
    ANY_PROTOCOL = "any"
}
export declare enum PeerVerifyMode {
    None = "none",
    QueryPeer = "query",
    VerifyPeer = "verify",
    AutoVerifyPeer = "auto"
}
export interface SSLConfiguration {
    enabled: boolean;
    protocol: SSLProtocol;
    peerVerifyMode: PeerVerifyMode;
    peerVerifyDepth: number;
    caCertificates?: string[];
    clientCertificate?: string;
    privateKey?: string;
}
export interface WillMessage {
    topic: string;
    message: string;
    qos: QoSLevel;
    retain: boolean;
}
export interface MQTTConfig {
    hostname: string;
    port: number;
    clientId: string;
    connectTimeout?: number;
    username?: string;
    password?: string;
    protocolVersion: MQTTProtocolVersion;
    cleanSession: boolean;
    keepAlive: number;
    autoKeepAlive: boolean;
    topicFilter: string;
    mode: MQTTClientMode;
    willMessage?: WillMessage;
    ssl: SSLConfiguration;
}
export interface PublishOptions {
    qos?: QoSLevel;
    retain?: boolean;
    dup?: boolean;
    messageId?: number;
}
export interface BatchMessage {
    topic: string;
    payload: Buffer;
    options?: PublishOptions;
}
export interface BatchPublishOptions {
    maxBatchSize?: number;
    batchTimeout?: number;
    maxConcurrency?: number;
    onBatchStart?: (batchSize: number) => void;
    onBatchProgress?: (completed: number, total: number) => void;
    onBatchComplete?: (results: BatchPublishResult[]) => void;
}
export interface BatchPublishResult {
    topic: string;
    success: boolean;
    error?: Error;
    latency: number;
}
export interface SubscriptionOptions {
    qos: QoSLevel;
}
export interface MQTTMessage {
    topic: string;
    payload: Buffer;
    qos: QoSLevel;
    retain: boolean;
    dup: boolean;
    timestamp: Date;
}
export interface MQTTConnectionInfo {
    state: MQTTConnectionState;
    connectedAt?: Date;
    lastError?: string;
    reconnectAttempts: number;
    bytesReceived: number;
    bytesSent: number;
    messagesReceived: number;
    messagesSent: number;
}
export interface MQTTClientError {
    code: string;
    message: string;
    timestamp: Date;
    recoverable: boolean;
}
export interface MQTTStatistics {
    connectionInfo: MQTTConnectionInfo;
    performance: {
        avgLatency: number;
        maxLatency: number;
        messageRate: number;
        throughput: number;
    };
    errors: MQTTClientError[];
}
export interface MQTTClientEvents {
    'connected': () => void;
    'disconnected': (error?: MQTTClientError) => void;
    'reconnecting': () => void;
    'message': (message: MQTTMessage) => void;
    'error': (error: MQTTClientError) => void;
    'configurationChanged': () => void;
    'sslConfigurationChanged': () => void;
    'statisticsUpdated': (stats: MQTTStatistics) => void;
}
export interface IMQTTClient {
    connect(): Promise<void>;
    disconnect(force?: boolean): Promise<void>;
    reconnect(): Promise<void>;
    isConnected(): boolean;
    publish(topic: string, payload: Buffer, options?: PublishOptions): Promise<void>;
    publishBatch(messages: BatchMessage[], options?: BatchPublishOptions): Promise<BatchPublishResult[]>;
    subscribe(topic: string, options?: SubscriptionOptions): Promise<void>;
    unsubscribe(topic: string): Promise<void>;
    updateConfig(config: Partial<MQTTConfig>): void;
    getConfig(): MQTTConfig;
    validateConfig(config: MQTTConfig): {
        valid: boolean;
        errors: string[];
    };
    getStatistics(): MQTTStatistics;
    resetStatistics(): void;
    hotpathTxFrame(data: Buffer): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map
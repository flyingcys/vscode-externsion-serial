/**
 * Network Driver for TCP/UDP communication
 * Based on Serial Studio's IO::Drivers::Network design
 * Supports both TCP client/server and UDP communication modes
 */
/// <reference types="node" />
/// <reference types="node" />
import { HALDriver, ConfigValidationResult } from '../HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';
/**
 * Network socket types supported by the driver
 */
export declare enum NetworkSocketType {
    TCP_CLIENT = "tcp_client",
    TCP_SERVER = "tcp_server",
    UDP = "udp",
    UDP_MULTICAST = "udp_multicast"
}
/**
 * Network-specific configuration extending base ConnectionConfig
 */
export interface NetworkConfig extends ConnectionConfig {
    type: BusType.Network;
    host: string;
    tcpPort?: number;
    udpPort?: number;
    protocol: 'tcp' | 'udp';
    socketType?: NetworkSocketType;
    multicastAddress?: string;
    multicastTTL?: number;
    keepAlive?: boolean;
    noDelay?: boolean;
    connectTimeout?: number;
    reconnectInterval?: number;
}
/**
 * Network Driver Implementation
 *
 * Provides TCP and UDP communication capabilities following Serial Studio's
 * network driver architecture. Supports both client and server modes for TCP,
 * and unicast/multicast for UDP.
 *
 * Features:
 * - TCP client/server connections
 * - UDP unicast/multicast communication
 * - Automatic reconnection
 * - Connection pooling
 * - Error handling and recovery
 */
export declare class NetworkDriver extends HALDriver {
    private tcpSocket?;
    private tcpServer?;
    private udpSocket?;
    private reconnectTimer?;
    private connectionPromise?;
    private isConnecting;
    private static readonly DEFAULT_TCP_PORT;
    private static readonly DEFAULT_UDP_PORT;
    private static readonly DEFAULT_HOST;
    private static readonly DEFAULT_TIMEOUT;
    private static readonly DEFAULT_RECONNECT_INTERVAL;
    constructor(config: NetworkConfig);
    get busType(): BusType;
    get displayName(): string;
    /**
     * Open network connection based on configuration
     */
    open(): Promise<void>;
    /**
     * Establish connection based on protocol and socket type
     */
    private establishConnection;
    /**
     * Create TCP client connection
     */
    private createTcpClient;
    /**
     * Create TCP server
     */
    private createTcpServer;
    /**
     * Create UDP socket
     */
    private createUdpSocket;
    /**
     * Close network connection
     */
    close(): Promise<void>;
    /**
     * Check if connection is open
     */
    isOpen(): boolean;
    /**
     * Check if connection is readable
     */
    isReadable(): boolean;
    /**
     * Check if connection is writable
     */
    isWritable(): boolean;
    /**
     * Validate network configuration
     */
    validateConfiguration(): ConfigValidationResult;
    /**
     * Write data to network connection
     */
    write(data: Buffer): Promise<number>;
    /**
     * Schedule automatic reconnection if enabled
     */
    private scheduleReconnect;
    /**
     * Get network-specific status information
     */
    getNetworkStatus(): {
        protocol: string;
        host: string;
        port: number;
        socketType: string;
        connected: boolean;
        remoteAddress?: string;
        remotePort?: number;
    };
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=NetworkDriver.d.ts.map
/**
 * Hardware Abstraction Layer (HAL) Driver
 * Abstract base class for all communication drivers
 * Based on Serial Studio's IO::HAL_Driver design
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { ConnectionConfig, BusType } from '@shared/types';
/**
 * Driver configuration validation result
 */
export interface ConfigValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Driver statistics
 */
export interface DriverStats {
    bytesReceived: number;
    bytesSent: number;
    errors: number;
    uptime: number;
    lastActivity: number;
}
/**
 * Abstract Hardware Abstraction Layer Driver
 *
 * This class provides the core interface for all I/O drivers in the system.
 * It defines methods for opening, closing, and checking the state of devices,
 * as well as sending and receiving data.
 *
 * The class includes a high-efficiency buffered data processing mechanism
 * through processData(), which reduces signal overhead in high-frequency
 * environments by aggregating data until a configurable buffer threshold is
 * reached.
 *
 * Thread safety is ensured for buffer operations, making processData() safe
 * to call from multiple threads.
 */
export declare abstract class HALDriver extends EventEmitter {
    protected config: ConnectionConfig;
    protected stats: DriverStats;
    protected bufferSize: number;
    protected dataBuffer: Buffer;
    protected bufferPosition: number;
    private readonly bufferLock;
    constructor(config: ConnectionConfig);
    /**
     * Get the driver's bus type
     */
    abstract get busType(): BusType;
    /**
     * Get a human-readable name for this driver instance
     */
    abstract get displayName(): string;
    /**
     * Open the connection to the device
     * @returns Promise that resolves when connection is established
     */
    abstract open(): Promise<void>;
    /**
     * Close the connection to the device
     */
    abstract close(): Promise<void>;
    /**
     * Check if the device connection is open
     */
    abstract isOpen(): boolean;
    /**
     * Check if the device is readable
     */
    abstract isReadable(): boolean;
    /**
     * Check if the device is writable
     */
    abstract isWritable(): boolean;
    /**
     * Validate the current configuration
     */
    abstract validateConfiguration(): ConfigValidationResult;
    /**
     * Write data to the device
     * @param data The data to write
     * @returns Promise that resolves to the number of bytes written
     */
    abstract write(data: Buffer): Promise<number>;
    /**
     * Get the current configuration
     */
    getConfiguration(): ConnectionConfig;
    /**
     * Update the configuration (must call open() again to apply)
     * @param newConfig New configuration to apply
     */
    updateConfiguration(newConfig: Partial<ConnectionConfig>): void;
    /**
     * Check if the current configuration is valid
     */
    isConfigurationValid(): boolean;
    /**
     * Set the buffer size for data aggregation
     * @param size Buffer size in bytes
     */
    setBufferSize(size: number): void;
    /**
     * Process incoming data with buffering to reduce signal overhead
     * Thread-safe operation that aggregates data until buffer threshold is reached
     * @param data Incoming data to process
     */
    processData(data: Buffer): void;
    /**
     * Flush the current data buffer
     * Emits buffered data if any exists
     */
    flushBuffer(): void;
    /**
     * Get driver statistics
     */
    getStats(): DriverStats;
    /**
     * Reset driver statistics
     */
    resetStats(): void;
    /**
     * Handle driver errors
     * @param error The error that occurred
     */
    protected handleError(error: Error): void;
    /**
     * Update sent bytes statistics
     * @param bytes Number of bytes sent
     */
    protected updateSentStats(bytes: number): void;
    /**
     * Clean up resources when driver is destroyed
     */
    destroy(): void;
}
/**
 * Event types emitted by HAL drivers
 */
export interface HALDriverEvents {
    'dataReceived': (data: Buffer) => void;
    'dataSent': (bytes: number) => void;
    'error': (error: Error) => void;
    'connected': () => void;
    'disconnected': () => void;
    'configurationChanged': () => void;
}
export declare interface HALDriver {
    on<U extends keyof HALDriverEvents>(event: U, listener: HALDriverEvents[U]): this;
    emit<U extends keyof HALDriverEvents>(event: U, ...args: Parameters<HALDriverEvents[U]>): boolean;
}
//# sourceMappingURL=HALDriver.d.ts.map
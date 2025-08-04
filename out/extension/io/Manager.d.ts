/**
 * IO Manager - Central manager for I/O operations across multiple protocols
 * Based on Serial Studio's IO::Manager implementation
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { HALDriver } from './HALDriver';
import { ConnectionConfig, BusType, FrameConfig, RawFrame, CommunicationStats } from '@shared/types';
/**
 * Connection state enumeration
 */
export declare enum ConnectionState {
    Disconnected = "disconnected",
    Connecting = "connecting",
    Connected = "connected",
    Reconnecting = "reconnecting",
    Error = "error"
}
/**
 * IO Manager Events interface
 */
export interface IOManagerEvents {
    'stateChanged': (state: ConnectionState) => void;
    'frameReceived': (frame: RawFrame) => void;
    'rawDataReceived': (data: Buffer) => void;
    'error': (error: Error) => void;
    'warning': (message: string) => void;
    'statisticsUpdated': (stats: CommunicationStats) => void;
}
/**
 * Central manager for I/O operations across multiple protocols.
 *
 * Handles communication with devices over Serial, Network, and Bluetooth LE,
 * managing configuration, connection, and data transfer.
 *
 * Integrates with frame reading for parsing data streams and ensures
 * thread-safe operation.
 */
export declare class IOManager extends EventEmitter {
    private currentDriver;
    private currentState;
    private frameConfig;
    private paused;
    private statistics;
    private statisticsTimer;
    private driverFactory;
    private workerManager;
    private threadedFrameExtraction;
    private frameBuffer;
    private frameSequence;
    constructor();
    /**
     * 设置WorkerManager事件监听
     * 对应Serial-Studio的线程间通信
     */
    private setupWorkerEvents;
    /**
     * Get current connection state
     */
    get state(): ConnectionState;
    /**
     * Check if currently connected
     */
    get isConnected(): boolean;
    /**
     * Check if connection is read-only
     */
    get isReadOnly(): boolean;
    /**
     * Check if connection supports read/write
     */
    get isReadWrite(): boolean;
    /**
     * Get current driver instance
     */
    get driver(): HALDriver | null;
    /**
     * Get current frame configuration
     */
    get frameConfiguration(): FrameConfig;
    /**
     * Get communication statistics
     */
    get communicationStats(): CommunicationStats;
    /**
     * Check if data processing is paused
     */
    get isPaused(): boolean;
    /**
     * Set pause state for data processing
     */
    setPaused(paused: boolean): void;
    /**
     * Connect to a device using the specified configuration
     */
    connect(config: ConnectionConfig): Promise<void>;
    /**
     * Disconnect from the current device
     */
    disconnect(): Promise<void>;
    /**
     * Write data to the connected device
     */
    writeData(data: Buffer): Promise<number>;
    /**
     * Update frame configuration
     */
    updateFrameConfig(config: Partial<FrameConfig>): Promise<void>;
    /**
     * 转换操作模式到Worker格式
     */
    private convertToWorkerOperationMode;
    /**
     * 转换帧检测模式到Worker格式
     */
    private convertToWorkerFrameDetection;
    /**
     * Get list of available devices for a specific bus type
     */
    getAvailableDevices(busType: BusType): Promise<any[]>;
    /**
     * Get all available driver capabilities
     */
    getAvailableDrivers(): any[];
    /**
     * Get supported bus types
     */
    getSupportedBusTypes(): BusType[];
    /**
     * Get default configuration for a bus type
     */
    getDefaultConfig(busType: BusType): any;
    /**
     * Validate configuration for a specific bus type
     */
    validateConfig(config: ConnectionConfig): string[];
    /**
     * Check if a bus type is supported
     */
    isBusTypeSupported(busType: BusType): boolean;
    /**
     * Create appropriate driver instance based on configuration
     */
    private createDriver;
    /**
     * Set up event handlers for the current driver
     */
    private setupDriverEvents;
    /**
     * 处理传入数据并提取帧 - 多线程版本
     * 对应Serial-Studio的热路径数据处理
     */
    private processIncomingData;
    /**
     * 多线程数据处理
     * 对应Serial-Studio的moveToThread和线程化处理
     */
    private processDataMultiThreaded;
    /**
     * 单线程数据处理（回退模式）
     * 保持与原版Serial-Studio的兼容性
     */
    private processDataSingleThreaded;
    /**
     * Extract frames from the current buffer
     */
    private extractFrames;
    /**
     * Extract frames using end delimiter only
     */
    private extractEndDelimitedFrames;
    /**
     * Extract frames using start and end delimiters
     */
    private extractStartEndDelimitedFrames;
    /**
     * Extract frames using start delimiter only
     */
    private extractStartDelimitedFrames;
    /**
     * Process data without frame delimiters
     */
    private extractNoDelimiterFrames;
    /**
     * Emit a processed frame
     */
    private emitFrame;
    /**
     * Set connection state and emit event
     */
    private setState;
    /**
     * Handle errors
     */
    private handleError;
    /**
     * Start statistics update timer
     */
    private startStatisticsTimer;
    /**
     * Stop statistics timer
     */
    private stopStatisticsTimer;
    /**
     * 启用或禁用线程化帧提取
     * 对应Serial-Studio的m_threadedFrameExtraction设置
     */
    setThreadedFrameExtraction(enabled: boolean): void;
    /**
     * 获取线程化帧提取状态
     */
    get isThreadedFrameExtractionEnabled(): boolean;
    /**
     * 获取Worker统计信息
     * 对应Serial-Studio的线程性能监控
     */
    getWorkerStats(): {
        threadedExtraction: boolean;
        workerCount: number;
        idleWorkers: number;
        busyWorkers: number;
        errorWorkers: number;
        pendingRequests: number;
        totalRequests: number;
        completedRequests: number;
        errorRequests: number;
        averageProcessingTime: number;
        activeWorkers: number;
    } | null;
    /**
     * 重置Worker状态
     * 对应Serial-Studio的帧读取器重置
     */
    resetWorkers(): Promise<void>;
    /**
     * 获取扩展的通信统计信息，包括Worker统计
     */
    get extendedCommunicationStats(): {
        workers: {
            threadedExtraction: boolean;
            workerCount: number;
            idleWorkers: number;
            busyWorkers: number;
            errorWorkers: number;
            pendingRequests: number;
            totalRequests: number;
            completedRequests: number;
            errorRequests: number;
            averageProcessingTime: number;
            activeWorkers: number;
        } | {
            workerCount: number;
            threadedExtraction: boolean;
        };
        bytesReceived: number;
        bytesSent: number;
        framesReceived: number;
        framesSent: number;
        framesProcessed: number;
        errors: number;
        reconnections: number;
        uptime: number;
        memoryUsage?: number | undefined;
    };
    /**
     * Get connection state (alias for state getter)
     */
    getConnectionState(): ConnectionState;
    /**
     * Get statistics (alias for communicationStats getter)
     */
    getStatistics(): CommunicationStats;
    /**
     * Get current bus type
     */
    getCurrentBusType(): BusType | null;
    /**
     * Configure frame processing parameters
     */
    configureFrameProcessing(config: FrameConfig): void;
    /**
     * Get frame configuration
     */
    getFrameConfiguration(): FrameConfig;
    /**
     * Configure worker threads for data processing
     */
    configureWorkers(config: {
        maxWorkers?: number;
        threadedFrameExtraction?: boolean;
    }): void;
    /**
     * Update configuration dynamically
     */
    updateConfiguration(config: Partial<ConnectionConfig>): void;
    /**
     * Validate configuration (alias for validateConfig)
     */
    validateConfiguration(config: ConnectionConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Write data (alias for writeData)
     */
    write(data: Buffer): Promise<number>;
    /**
     * Clean up resources
     */
    destroy(): Promise<void>;
}
export declare interface IOManager {
    on<U extends keyof IOManagerEvents>(event: U, listener: IOManagerEvents[U]): this;
    emit<U extends keyof IOManagerEvents>(event: U, ...args: Parameters<IOManagerEvents[U]>): boolean;
}
//# sourceMappingURL=Manager.d.ts.map
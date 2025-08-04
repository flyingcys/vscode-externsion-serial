/**
 * MultiThreadProcessor - 多线程数据处理器
 * 基于Serial-Studio的多线程架构，用于高性能数据处理
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum FrameDetection {
    EndDelimiterOnly = 0,
    StartAndEndDelimiter = 1,
    NoDelimiters = 2,
    StartDelimiterOnly = 3
}
export declare enum OperationMode {
    ProjectFile = 0,
    DeviceSendsJSON = 1,
    QuickPlot = 2
}
export interface WorkerConfig {
    operationMode: OperationMode;
    frameDetectionMode: FrameDetection;
    startSequence: Uint8Array;
    finishSequence: Uint8Array;
    checksumAlgorithm: string;
    bufferCapacity?: number;
    maxWorkers?: number;
}
interface ProcessorStatistics {
    workersCreated: number;
    workersTerminated: number;
    tasksProcessed: number;
    totalProcessingTime: number;
    averageProcessingTime: number;
    activeWorkers: number;
    queuedTasks: number;
}
/**
 * 多线程处理器 - 管理Worker池进行高性能数据处理
 */
export declare class MultiThreadProcessor extends EventEmitter {
    private workers;
    private workerPool;
    private activeJobs;
    private config;
    private nextWorkerId;
    private isTerminated;
    private statistics;
    constructor(config: WorkerConfig);
    /**
     * 初始化Worker池
     */
    private initializeWorkerPool;
    /**
     * 创建单个Worker实例
     */
    private createWorker;
    /**
     * 设置Worker事件监听
     */
    private setupWorkerEvents;
    /**
     * 处理Worker消息
     */
    private handleWorkerMessage;
    /**
     * 处理Worker错误
     */
    private handleWorkerError;
    /**
     * 处理Worker退出
     */
    private handleWorkerExit;
    /**
     * 处理数据 - 主要的处理方法
     */
    processData(data: ArrayBuffer): Promise<any>;
    /**
     * 批量处理数据
     */
    processBatch(dataArray: ArrayBuffer[]): Promise<any[]>;
    /**
     * 获取统计信息
     */
    getStatistics(): ProcessorStatistics;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<WorkerConfig>): void;
    /**
     * 终止处理器
     */
    terminate(): Promise<void>;
    /**
     * 获取活跃Worker数量
     */
    getActiveWorkerCount(): number;
    /**
     * 获取排队任务数量
     */
    getQueuedTaskCount(): number;
    /**
     * 检查处理器健康状态
     */
    isHealthy(): boolean;
}
export default MultiThreadProcessor;
//# sourceMappingURL=MultiThreadProcessor.d.ts.map
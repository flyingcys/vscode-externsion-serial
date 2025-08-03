/**
 * WorkerManager - 管理多线程数据处理
 * 基于Serial-Studio的多线程架构设计
 * 对应Serial-Studio的QThread管理系统
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface WorkerMessage {
    type: 'configure' | 'processData' | 'processBatch' | 'reset' | 'getStats';
    data?: any;
    id?: string;
}
export interface WorkerResponse {
    type: 'configured' | 'frameProcessed' | 'batchProcessed' | 'reset' | 'stats' | 'error';
    data?: any;
    id?: string;
}
export interface RawFrame {
    data: Uint8Array;
    timestamp: number;
    sequence: number;
    checksumValid: boolean;
}
/**
 * Worker池配置
 */
export interface WorkerPoolConfig {
    maxWorkers: number;
    queueSize: number;
    threadedFrameExtraction: boolean;
}
/**
 * 多线程数据处理管理器
 * 实现与Serial-Studio相同的线程化帧提取
 */
export declare class WorkerManager extends EventEmitter {
    private workers;
    private config;
    private workerScript;
    private requestCounter;
    private isDestroyed;
    private loadBalanceIndex;
    private stats;
    constructor(config?: Partial<WorkerPoolConfig>);
    /**
     * 初始化Worker池
     * 对应Serial-Studio的startFrameReader逻辑
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
     * 处理Worker消息响应
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
     * 重启失败的Worker
     */
    private restartWorker;
    /**
     * 获取可用的Worker
     * 实现负载均衡算法
     */
    private getAvailableWorker;
    /**
     * 向Worker发送消息
     * 对应Serial-Studio的帧处理热路径
     */
    private sendWorkerMessage;
    /**
     * 配置所有Worker
     */
    configureWorkers(config: any): Promise<void>;
    /**
     * 处理数据 - 主要的热路径方法
     * 对应Serial-Studio的hotpathRxFrame
     */
    processData(data: ArrayBuffer): Promise<RawFrame[]>;
    /**
     * 批量处理数据
     */
    processBatch(dataList: ArrayBuffer[]): Promise<RawFrame[]>;
    /**
     * 分割数组为指定数量的块
     */
    private chunkArray;
    /**
     * 获取统计信息
     */
    getStats(): {
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
    };
    /**
     * 重置所有Worker状态
     */
    resetWorkers(): Promise<void>;
    /**
     * 销毁Worker池
     */
    destroy(): Promise<void>;
    /**
     * 检查是否启用了线程化帧提取
     * 对应Serial-Studio的m_threadedFrameExtraction
     */
    get threadedFrameExtraction(): boolean;
    /**
     * 设置线程化帧提取状态
     */
    setThreadedFrameExtraction(enabled: boolean): void;
}
export default WorkerManager;
//# sourceMappingURL=WorkerManager.d.ts.map
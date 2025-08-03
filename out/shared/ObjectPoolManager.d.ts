/**
 * ObjectPoolManager - 对象池统一管理器
 * 管理各种频繁分配对象的对象池，减少GC压力和内存碎片化
 */
import type { DataPoint, ProcessedFrame, Dataset, Group, RawFrame, CommunicationStats, PerformanceMetrics } from './types';
/**
 * 对象池管理器
 * 单例模式，统一管理所有对象池
 */
export declare class ObjectPoolManager {
    private static instance;
    private memoryManager;
    private pools;
    private initialized;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): ObjectPoolManager;
    /**
     * 初始化所有对象池
     */
    initialize(): void;
    /**
     * 创建对象池
     */
    private createPool;
    /**
     * 获取对象池
     */
    private getPool;
    /**
     * 获取DataPoint对象
     */
    acquireDataPoint(): DataPoint;
    /**
     * 释放DataPoint对象
     */
    releaseDataPoint(dataPoint: DataPoint): void;
    /**
     * 批量释放DataPoint对象
     */
    releaseDataPoints(dataPoints: DataPoint[]): void;
    /**
     * 获取Dataset对象
     */
    acquireDataset(): Dataset;
    /**
     * 释放Dataset对象
     */
    releaseDataset(dataset: Dataset): void;
    /**
     * 批量释放Dataset对象
     */
    releaseDatasets(datasets: Dataset[]): void;
    /**
     * 获取Group对象
     */
    acquireGroup(): Group;
    /**
     * 释放Group对象
     */
    releaseGroup(group: Group): void;
    /**
     * 批量释放Group对象
     */
    releaseGroups(groups: Group[]): void;
    /**
     * 获取RawFrame对象
     */
    acquireRawFrame(): RawFrame;
    /**
     * 释放RawFrame对象
     */
    releaseRawFrame(frame: RawFrame): void;
    /**
     * 获取ProcessedFrame对象
     */
    acquireProcessedFrame(): ProcessedFrame;
    /**
     * 释放ProcessedFrame对象
     */
    releaseProcessedFrame(frame: ProcessedFrame): void;
    /**
     * 获取CommunicationStats对象
     */
    acquireCommunicationStats(): CommunicationStats;
    /**
     * 释放CommunicationStats对象
     */
    releaseCommunicationStats(stats: CommunicationStats): void;
    /**
     * 获取PerformanceMetrics对象
     */
    acquirePerformanceMetrics(): PerformanceMetrics;
    /**
     * 释放PerformanceMetrics对象
     */
    releasePerformanceMetrics(metrics: PerformanceMetrics): void;
    /**
     * 获取所有池的统计信息
     */
    getAllPoolStats(): Record<string, any>;
    /**
     * 获取内存使用情况
     */
    getMemoryUsage(): {
        totalPools: number;
        totalObjects: number;
        totalMemory: number;
        poolDetails: Record<string, any>;
    };
    /**
     * 优化所有对象池
     */
    optimize(): void;
    /**
     * 清理所有对象池
     */
    clear(): void;
    /**
     * 销毁对象池管理器
     */
    destroy(): void;
}
export declare const objectPoolManager: ObjectPoolManager;
export declare const acquireDataPoint: () => DataPoint, releaseDataPoint: (dataPoint: DataPoint) => void, releaseDataPoints: (dataPoints: DataPoint[]) => void, acquireDataset: () => Dataset, releaseDataset: (dataset: Dataset) => void, releaseDatasets: (datasets: Dataset[]) => void, acquireGroup: () => Group, releaseGroup: (group: Group) => void, releaseGroups: (groups: Group[]) => void, acquireRawFrame: () => RawFrame, releaseRawFrame: (frame: RawFrame) => void, acquireProcessedFrame: () => ProcessedFrame, releaseProcessedFrame: (frame: ProcessedFrame) => void, acquireCommunicationStats: () => CommunicationStats, releaseCommunicationStats: (stats: CommunicationStats) => void, acquirePerformanceMetrics: () => PerformanceMetrics, releasePerformanceMetrics: (metrics: PerformanceMetrics) => void;
export default ObjectPoolManager;
//# sourceMappingURL=ObjectPoolManager.d.ts.map
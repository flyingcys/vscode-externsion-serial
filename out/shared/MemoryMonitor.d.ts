/**
 * MemoryMonitor - 内存使用监控和泄漏检测系统
 * 基于Serial-Studio的性能监控设计，提供实时内存分析和泄漏检测
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 内存使用快照
 */
export interface MemorySnapshot {
    timestamp: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    poolStats: Record<string, any>;
    cacheStats: Record<string, any>;
    customMetrics: Record<string, number>;
}
/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakReport {
    timestamp: number;
    leakSuspected: boolean;
    memoryGrowthRate: number;
    consecutiveGrowthPeriods: number;
    heapGrowthTrend: 'stable' | 'growing' | 'declining';
    recommendations: string[];
    criticalIssues: string[];
    poolAnalysis: {
        suspiciousPools: string[];
        lowEfficiencyPools: string[];
        overAllocatedPools: string[];
    };
}
/**
 * 内存性能阈值配置
 */
export interface MemoryThresholds {
    maxHeapUsagePercent: number;
    maxMemoryGrowthRate: number;
    maxConsecutiveGrowthPeriods: number;
    poolHitRateThreshold: number;
    poolUtilizationThreshold: number;
}
/**
 * 内存监控器事件接口
 */
export interface MemoryMonitorEvents {
    'memorySnapshot': (snapshot: MemorySnapshot) => void;
    'leakDetected': (report: MemoryLeakReport) => void;
    'memoryPressure': (level: 'low' | 'medium' | 'high' | 'critical') => void;
    'performanceIssue': (issue: string, details: any) => void;
}
/**
 * 内存监控器
 * 提供全面的内存使用监控和泄漏检测功能
 */
export declare class MemoryMonitor extends EventEmitter {
    private static instance;
    private memoryManager;
    private isMonitoring;
    private monitoringInterval;
    private leakDetectionInterval;
    private snapshots;
    private maxSnapshotHistory;
    private thresholds;
    private consecutiveGrowthCount;
    private lastLeakCheckTime;
    private baselineMemory;
    private customMetrics;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): MemoryMonitor;
    /**
     * 设置 Node.js 内存统计收集
     */
    private setupNodeJSMemoryCollection;
    /**
     * 开始内存监控
     * @param interval 监控间隔（毫秒），默认5秒
     * @param leakCheckInterval 泄漏检测间隔（毫秒），默认30秒
     */
    startMonitoring(interval?: number, leakCheckInterval?: number): void;
    /**
     * 停止内存监控
     */
    stopMonitoring(): void;
    /**
     * 收集内存快照
     */
    private collectMemorySnapshot;
    /**
     * 获取当前内存使用情况
     */
    private getCurrentMemoryUsage;
    /**
     * 获取浏览器内存信息
     */
    private getBrowserMemoryInfo;
    /**
     * 检查内存压力水平
     */
    private checkMemoryPressure;
    /**
     * 执行内存泄漏检测
     */
    private performLeakDetection;
    /**
     * 分析内存泄漏
     */
    private analyzeMemoryLeaks;
    /**
     * 计算内存增长率 (MB/min)
     */
    private calculateMemoryGrowthRate;
    /**
     * 分析对象池性能
     */
    private analyzePoolPerformance;
    /**
     * 添加自定义监控指标
     */
    addCustomMetric(name: string, value: number): void;
    /**
     * 移除自定义监控指标
     */
    removeCustomMetric(name: string): void;
    /**
     * 获取内存使用趋势
     */
    getMemoryTrend(minutes?: number): {
        timestamps: number[];
        heapUsed: number[];
        heapTotal: number[];
        trend: 'up' | 'down' | 'stable';
    };
    /**
     * 获取当前内存统计摘要
     */
    getCurrentStats(): {
        currentMemoryMB: number;
        memoryGrowthRate: number;
        poolEfficiency: number;
        leakRisk: 'low' | 'medium' | 'high';
    };
    /**
     * 强制执行内存优化
     */
    forceOptimization(): void;
    /**
     * 设置监控阈值
     */
    setThresholds(thresholds: Partial<MemoryThresholds>): void;
    /**
     * 获取监控状态
     */
    getMonitoringStatus(): {
        isMonitoring: boolean;
        snapshotCount: number;
        lastSnapshotTime: number;
        lastLeakCheckTime: number;
        thresholds: MemoryThresholds;
    };
    /**
     * 销毁监控器
     */
    destroy(): void;
}
export declare interface MemoryMonitor {
    on<U extends keyof MemoryMonitorEvents>(event: U, listener: MemoryMonitorEvents[U]): this;
    emit<U extends keyof MemoryMonitorEvents>(event: U, ...args: Parameters<MemoryMonitorEvents[U]>): boolean;
}
export declare const memoryMonitor: MemoryMonitor;
export default MemoryMonitor;
//# sourceMappingURL=MemoryMonitor.d.ts.map
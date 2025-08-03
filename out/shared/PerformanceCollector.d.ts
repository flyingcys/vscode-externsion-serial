/**
 * PerformanceCollector - 性能指标采集器
 * 实时收集和计算各种性能指标，为仪表板提供数据源
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 系统性能指标接口
 */
export interface SystemMetrics {
    cpu: {
        usage: number;
        loadAverage: number[];
        processUsage: number;
    };
    memory: {
        total: number;
        used: number;
        free: number;
        heap: {
            total: number;
            used: number;
            limit: number;
        };
        external: number;
        rss: number;
    };
    network: {
        bytesReceived: number;
        bytesSent: number;
        packetsReceived: number;
        packetsSent: number;
        throughput: number;
    };
    disk: {
        readBytes: number;
        writeBytes: number;
        readOps: number;
        writeOps: number;
    };
}
/**
 * 应用性能指标接口
 */
export interface ApplicationMetrics {
    rendering: {
        fps: number;
        frameTime: number;
        droppedFrames: number;
        renderCalls: number;
    };
    dataProcessing: {
        throughput: number;
        latency: number;
        queueSize: number;
        errorRate: number;
    };
    objectPool: {
        totalObjects: number;
        activeObjects: number;
        hitRate: number;
        allocations: number;
        deallocations: number;
    };
    virtualization: {
        totalItems: number;
        visibleItems: number;
        cacheHitRate: number;
        scrollFPS: number;
    };
}
/**
 * 性能快照接口
 */
export interface PerformanceSnapshot {
    timestamp: number;
    system: SystemMetrics;
    application: ApplicationMetrics;
    custom: Record<string, number>;
}
/**
 * 性能采集配置
 */
export interface CollectorConfig {
    systemMetricsInterval: number;
    applicationMetricsInterval: number;
    historySize: number;
    enableSystemMetrics: boolean;
    enableApplicationMetrics: boolean;
    cpuSampleInterval: number;
    memoryOptimizationThreshold: number;
}
/**
 * 性能指标采集器主类
 */
export declare class PerformanceCollector extends EventEmitter {
    private static instance;
    private config;
    private isCollecting;
    private systemTimer;
    private applicationTimer;
    private snapshots;
    private customMetrics;
    private cpuCalculator;
    private networkCollector;
    private renderingMetrics;
    private dataProcessingMetrics;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): PerformanceCollector;
    /**
     * 开始采集性能指标
     */
    startCollection(config?: Partial<CollectorConfig>): void;
    /**
     * 停止采集性能指标
     */
    stopCollection(): void;
    /**
     * 采集系统性能指标
     */
    private collectSystemMetrics;
    /**
     * 采集应用性能指标
     */
    private collectApplicationMetrics;
    /**
     * 获取系统负载
     */
    private getLoadAverage;
    /**
     * 获取内存指标
     */
    private getMemoryMetrics;
    /**
     * 获取渲染性能指标
     */
    private getRenderingMetrics;
    /**
     * 获取数据处理性能指标
     */
    private getDataProcessingMetrics;
    /**
     * 获取对象池指标
     */
    private getObjectPoolMetrics;
    /**
     * 获取虚拟化指标
     */
    private getVirtualizationMetrics;
    /**
     * 记录渲染帧
     */
    recordFrame(frameTime?: number): void;
    /**
     * 记录数据处理
     */
    recordDataProcessing(latency?: number, queueSize?: number): void;
    /**
     * 记录处理错误
     */
    recordProcessingError(): void;
    /**
     * 记录网络数据
     */
    recordNetworkData(bytesReceived: number, bytesSent?: number): void;
    /**
     * 设置自定义指标
     */
    setCustomMetric(name: string, value: number): void;
    /**
     * 获取自定义指标
     */
    getCustomMetric(name: string): number | undefined;
    /**
     * 获取当前性能快照
     */
    getCurrentSnapshot(): PerformanceSnapshot;
    /**
     * 获取历史快照
     */
    getHistorySnapshots(count?: number): PerformanceSnapshot[];
    /**
     * 清除历史数据
     */
    clearHistory(): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<CollectorConfig>): void;
    /**
     * 获取配置
     */
    getConfig(): CollectorConfig;
    /**
     * 销毁采集器
     */
    destroy(): void;
}
export declare const performanceCollector: PerformanceCollector;
export default PerformanceCollector;
//# sourceMappingURL=PerformanceCollector.d.ts.map
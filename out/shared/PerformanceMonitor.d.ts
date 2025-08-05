/**
 * PerformanceMonitor - 性能监控和基准测试系统
 * 实时监控系统性能，验证是否达到20Hz+更新性能目标
 */
/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
    dataProcessingRate: number;
    renderingFPS: number;
    updateFrequency: number;
    latency: number;
    cpuUsage: number;
    memoryUsage: number;
    memoryLeakRate: number;
    gcFrequency: number;
    throughput: number;
    bufferUtilization: number;
    droppedFrames: number;
    errorRate: number;
    timestamp: number;
}
/**
 * 性能基准线
 */
export interface PerformanceBaseline {
    name: string;
    targetDataProcessingRate: number;
    targetRenderingFPS: number;
    targetUpdateFrequency: number;
    targetLatency: number;
    targetMemoryUsage: number;
    targetThroughput: number;
}
/**
 * 性能测试结果
 */
export interface BenchmarkResult {
    testName: string;
    duration: number;
    iterations: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
    operationsPerSecond: number;
    memoryUsageBefore: number;
    memoryUsageAfter: number;
    memoryDelta: number;
    passed: boolean;
    details: any;
}
/**
 * 性能监控配置
 */
export interface MonitorConfig {
    sampleInterval: number;
    historySize: number;
    alertThreshold: number;
    enableRealTimeMonitoring: boolean;
    enableBenchmarking: boolean;
    baseline: PerformanceBaseline;
}
/**
 * 性能数据采集器
 */
export declare class PerformanceCollector {
    private metrics;
    private maxHistorySize;
    private lastGCCount;
    private lastMemoryUsage;
    private startTime;
    constructor(historySize?: number);
    /**
     * 采集当前性能数据
     */
    collect(): PerformanceMetrics;
    /**
     * 计算数据处理速度
     */
    private calculateDataProcessingRate;
    /**
     * 计算渲染帧率
     */
    private calculateRenderingFPS;
    /**
     * 计算更新频率
     */
    private calculateUpdateFrequency;
    /**
     * 计算延迟
     */
    private calculateLatency;
    /**
     * 估算CPU使用率
     */
    private estimateCPUUsage;
    /**
     * 获取内存使用量
     */
    private getMemoryUsage;
    /**
     * 计算内存泄漏率
     */
    private calculateMemoryLeakRate;
    /**
     * 计算GC频率
     */
    private calculateGCFrequency;
    /**
     * 计算吸纵量
     */
    private calculateThroughput;
    /**
     * 计算缓冲区利用率
     */
    private calculateBufferUtilization;
    /**
     * 获取丢帧数
     */
    private getDroppedFrames;
    /**
     * 计算错误率
     */
    private calculateErrorRate;
    /**
     * 添加到历史记录
     */
    private addToHistory;
    /**
     * 获取历史数据
     */
    getHistory(): PerformanceMetrics[];
    /**
     * 获取统计数据
     */
    getStatistics(): {
        dataProcessingRate: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
        renderingFPS: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
        updateFrequency: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
        memoryUsage: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
    } | null;
    /**
     * 清空历史数据
     */
    clear(): void;
}
/**
 * 性能基准测试器
 */
export declare class PerformanceBenchmark {
    private results;
    /**
     * 执行基准测试
     */
    benchmark(testName: string, testFunction: () => Promise<any> | any, iterations?: number, warmupIterations?: number): Promise<BenchmarkResult>;
    /**
     * 数据处理性能测试
     */
    benchmarkDataProcessing(): Promise<BenchmarkResult>;
    /**
     * 环形缓冲区性能测试
     */
    benchmarkCircularBuffer(): Promise<BenchmarkResult>;
    /**
     * 帧读取器性能测试
     */
    benchmarkFrameReader(): Promise<BenchmarkResult>;
    /**
     * 数据压缩性能测试
     */
    benchmarkDataCompression(): Promise<BenchmarkResult>;
    /**
     * 渲染性能测试
     */
    benchmarkRendering(): Promise<BenchmarkResult>;
    /**
     * 执行所有基准测试
     */
    runAllBenchmarks(): Promise<BenchmarkResult[]>;
    /**
     * 验证性能基准线
     */
    validateBaseline(baseline: PerformanceBaseline): {
        passed: boolean;
        failedTests: string[];
        results: BenchmarkResult[];
    };
    /**
     * 获取内存使用量
     */
    private getMemoryUsage;
    /**
     * 获取所有结果
     */
    getResults(): BenchmarkResult[];
    /**
     * 清空结果
     */
    clear(): void;
}
/**
 * 性能监控器主类
 */
export declare class PerformanceMonitor {
    private collector;
    private benchmark;
    private config;
    private monitoringInterval;
    private alertCallbacks;
    constructor(config?: Partial<MonitorConfig>);
    /**
     * 开始监控
     */
    startMonitoring(): void;
    /**
     * 停止监控
     */
    stopMonitoring(): void;
    /**
     * 检查报警
     */
    private checkAlerts;
    /**
     * 添加报警回调
     */
    onAlert(callback: (metrics: PerformanceMetrics) => void): void;
    /**
     * 执行性能测试
     */
    runBenchmark(): Promise<{
        passed: boolean;
        failedTests: string[];
        results: BenchmarkResult[];
    }>;
    /**
     * 获取当前性能数据
     */
    getCurrentMetrics(): PerformanceMetrics;
    /**
     * 获取性能统计
     */
    getStatistics(): {
        dataProcessingRate: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
        renderingFPS: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
        updateFrequency: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
        memoryUsage: {
            current: number;
            average: number;
            max: number;
            min: number;
        };
    } | null;
    /**
     * 获取历史数据
     */
    getHistory(): PerformanceMetrics[];
    /**
     * 生成性能报告
     */
    generateReport(): {
        summary: any;
        metrics: PerformanceMetrics[];
        benchmarks: BenchmarkResult[];
        recommendations: string[];
    };
    /**
     * 计算整体健康度 - 优化测试环境兼容性
     */
    private calculateOverallHealth;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<MonitorConfig>): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
export default PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map
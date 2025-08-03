/**
 * PerformanceBenchmarks - 性能基准管理系统
 * 建立和管理CPU、内存、帧率等关键性能指标的基准线
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 基准性能指标接口
 */
export interface BenchmarkMetrics {
    cpu: {
        idle: number;
        normal: number;
        peak: number;
        threshold: {
            warning: number;
            critical: number;
        };
    };
    memory: {
        baseline: number;
        perDataPoint: number;
        peak: number;
        threshold: {
            warning: number;
            critical: number;
        };
    };
    rendering: {
        targetFPS: number;
        minAcceptableFPS: number;
        maxFrameTime: number;
        threshold: {
            warning: number;
            critical: number;
        };
    };
    dataProcessing: {
        throughput: number;
        latency: number;
        maxQueueSize: number;
        threshold: {
            latencyWarning: number;
            latencyCritical: number;
        };
    };
    network: {
        maxBandwidth: number;
        averageLatency: number;
        packetLossRate: number;
        threshold: {
            bandwidthWarning: number;
            latencyWarning: number;
        };
    };
}
/**
 * 基准测试结果接口
 */
export interface BenchmarkResult {
    testName: string;
    timestamp: number;
    duration: number;
    metrics: {
        cpu: number;
        memory: number;
        fps: number;
        throughput: number;
        latency: number;
    };
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    passed: boolean;
    details: {
        cpuPassed: boolean;
        memoryPassed: boolean;
        fpsPassed: boolean;
        throughputPassed: boolean;
        latencyPassed: boolean;
    };
}
/**
 * 基准配置接口
 */
export interface BenchmarkConfig {
    serialStudioVersion: string;
    targetEnvironment: 'development' | 'production' | 'test';
    hardwareClass: 'low' | 'medium' | 'high' | 'enterprise';
    dataScenario: 'light' | 'normal' | 'heavy' | 'extreme';
}
/**
 * 性能基准管理器
 */
export declare class PerformanceBenchmarkManager extends EventEmitter {
    private static instance;
    private baselines;
    private results;
    private currentConfig;
    private hardwareClasses;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): PerformanceBenchmarkManager;
    /**
     * 初始化性能基准数据
     */
    private initializeBaselines;
    /**
     * 为不同硬件级别生成基准数据
     */
    private generateHardwareSpecificBaselines;
    /**
     * 根据硬件规格调整基准数据
     */
    private adjustBaselineForHardware;
    /**
     * 运行基准测试
     */
    runBenchmark(testName: string): Promise<BenchmarkResult>;
    /**
     * 执行具体的性能测试
     */
    private executeTest;
    /**
     * CPU性能测试
     */
    private testCPUPerformance;
    /**
     * 内存性能测试
     */
    private testMemoryPerformance;
    /**
     * 渲染性能测试
     */
    private testRenderingPerformance;
    /**
     * 数据处理性能测试
     */
    private testDataProcessingPerformance;
    /**
     * 模拟渲染工作
     */
    private simulateRenderWork;
    /**
     * 获取当前内存使用量
     */
    private getCurrentMemoryUsage;
    /**
     * 计算综合评分
     */
    private calculateScore;
    /**
     * 计算等级
     */
    private calculateGrade;
    /**
     * 评估详细指标
     */
    private evaluateDetails;
    /**
     * 获取基准键
     */
    private getBaselineKey;
    /**
     * 获取基准数据
     */
    getBaseline(key?: string): BenchmarkMetrics | null;
    /**
     * 获取所有基准数据
     */
    getAllBaselines(): Map<string, BenchmarkMetrics>;
    /**
     * 获取测试结果
     */
    getResults(testName?: string): BenchmarkResult[];
    /**
     * 获取最新结果
     */
    getLatestResult(testName: string): BenchmarkResult | null;
    /**
     * 生成性能报告
     */
    generateReport(): {
        summary: any;
        baselines: Map<string, BenchmarkMetrics>;
        results: BenchmarkResult[];
        recommendations: string[];
    };
    /**
     * 更新配置
     */
    updateConfig(config: Partial<BenchmarkConfig>): void;
    /**
     * 清除结果
     */
    clearResults(testName?: string): void;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
export declare const performanceBenchmarkManager: PerformanceBenchmarkManager;
export default PerformanceBenchmarkManager;
//# sourceMappingURL=PerformanceBenchmarks.d.ts.map
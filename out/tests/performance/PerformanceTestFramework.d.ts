/**
 * PerformanceTestFramework - 性能测试框架
 * 对标Serial-Studio性能指标，提供全面的性能测试和基准对比
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 性能测试配置
 */
export interface PerformanceTestConfig {
    name: string;
    description: string;
    iterations: number;
    warmupIterations: number;
    timeout: number;
    dataSize: number;
    concurrency?: number;
    targetFPS?: number;
    memoryLimit?: number;
}
/**
 * 性能测试结果
 */
export interface PerformanceTestResult {
    testName: string;
    success: boolean;
    executionTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
    fps: number;
    memoryUsage: number;
    cpuUsage: number;
    throughput: number;
    latency: number;
    baselineComparison?: {
        fpsRatio: number;
        memoryRatio: number;
        throughputRatio: number;
        latencyRatio: number;
    };
    iterations: number;
    timestamp: number;
    environment: {
        platform: string;
        nodeVersion: string;
        memoryLimit: number;
    };
}
/**
 * Serial-Studio基准性能指标
 */
export interface SerialStudioBaseline {
    dataProcessingRate: number;
    maxDataRate: number;
    plotUpdateRate: number;
    maxPlotPoints: number;
    renderFPS: number;
    baseMemoryUsage: number;
    memoryPerDataPoint: number;
    maxMemoryUsage: number;
    averageLatency: number;
    maxLatency: number;
    maxConcurrentConnections: number;
    threadPoolSize: number;
}
/**
 * 测试用例接口
 */
export interface TestCase {
    name: string;
    description: string;
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
    test: () => Promise<any>;
    validate?: (result: any) => boolean;
    config: PerformanceTestConfig;
}
/**
 * 性能测试套件
 */
export declare class PerformanceTestFramework extends EventEmitter {
    private testCases;
    private results;
    private baseline;
    private isRunning;
    private memoryMonitor;
    private performanceObserver;
    constructor();
    /**
     * 加载Serial-Studio基准性能数据
     */
    private loadSerialStudioBaseline;
    /**
     * 设置性能监控
     */
    private setupPerformanceMonitoring;
    /**
     * 注册测试用例
     */
    registerTest(testCase: TestCase): void;
    /**
     * 批量注册测试用例
     */
    registerTests(testCases: TestCase[]): void;
    /**
     * 运行单个测试
     */
    runTest(testName: string): Promise<PerformanceTestResult>;
    /**
     * 运行所有测试
     */
    runAllTests(): Promise<Map<string, PerformanceTestResult>>;
    /**
     * 执行测试用例
     */
    private executeTest;
    /**
     * 计算统计数据
     */
    private calculateStatistics;
    /**
     * 与基准数据对比
     */
    private compareWithBaseline;
    /**
     * 获取当前内存使用量
     */
    private getCurrentMemoryUsage;
    /**
     * 开始FPS计数器
     */
    private startFPSCounter;
    /**
     * 停止FPS计数器
     */
    private stopFPSCounter;
    /**
     * 获取内存限制
     */
    private getMemoryLimit;
    /**
     * 创建超时Promise
     */
    private createTimeoutPromise;
    /**
     * 生成性能报告
     */
    generateReport(): {
        summary: any;
        details: PerformanceTestResult[];
        baseline: SerialStudioBaseline | null;
        recommendations: string[];
    };
    /**
     * 计算综合评分
     */
    private calculateOverallScore;
    /**
     * 获取测试结果
     */
    getResults(): Map<string, PerformanceTestResult>;
    /**
     * 清理资源
     */
    destroy(): void;
}
export default PerformanceTestFramework;
//# sourceMappingURL=PerformanceTestFramework.d.ts.map
/**
 * 高级可视化组件性能基准测试
 * 验证性能指标：3D≥30FPS，地图响应≤100ms，FFT≥1000samples/s
 */
interface PerformanceMetrics {
    fps3D: number;
    gpsResponseTime: number;
    fftSamplesPerSecond: number;
    multiPlotUpdateRate: number;
    memoryUsage: number;
    cpuUsage: number;
}
export declare class PerformanceBenchmark {
    private metrics;
    private readonly targets;
    /**
     * 运行3D渲染性能测试
     */
    benchmark3DRendering(): Promise<number>;
    /**
     * 运行GPS响应时间测试
     */
    benchmarkGPSResponse(): Promise<number>;
    /**
     * 运行FFT处理性能测试
     */
    benchmarkFFTProcessing(): Promise<number>;
    /**
     * 运行多图表更新性能测试
     */
    benchmarkMultiPlotUpdates(): Promise<number>;
    /**
     * 监控系统资源使用
     */
    monitorSystemResources(): Promise<void>;
    /**
     * 运行完整的性能基准测试套件
     */
    runFullBenchmark(): Promise<{
        metrics: PerformanceMetrics;
        results: Array<{
            name: string;
            passed: boolean;
            detail: string;
        }>;
    }>;
    /**
     * 验证性能目标
     */
    private validatePerformanceTargets;
    /**
     * 模拟3D渲染工作负载
     */
    private simulate3DRenderWork;
    /**
     * 模拟GPS数据更新
     */
    private simulateGPSUpdate;
    /**
     * 模拟FFT计算
     */
    private simulateFFTCalculation;
    /**
     * 模拟多图表更新
     */
    private simulateMultiPlotUpdate;
    /**
     * 生成性能报告
     */
    generateReport(): string;
}
export declare const performanceBenchmark: PerformanceBenchmark;
export declare function runAutomatedBenchmark(): Promise<void>;
export {};
//# sourceMappingURL=performance-benchmark.d.ts.map
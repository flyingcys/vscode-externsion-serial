/**
 * 高级可视化组件集成测试运行器
 * 自动化执行所有集成测试并生成报告
 */
export declare class IntegrationTestRunner {
    private testResults;
    private startTime;
    /**
     * 定义所有集成测试用例
     */
    private getTestSuites;
    /**
     * 运行所有集成测试
     */
    runAllTests(): Promise<void>;
    /**
     * GPS组件测试实现
     */
    private testGPSInitialization;
    private testGPSPositionUpdate;
    private testGPSTrajectory;
    private testGPSLayers;
    private testGPSPerformance;
    /**
     * 3D组件测试实现
     */
    private test3DInitialization;
    private test3DDataRendering;
    private test3DCameraControls;
    private test3DStereoModes;
    private test3DPerformance;
    /**
     * FFT组件测试实现
     */
    private testFFTInitialization;
    private testFFTCalculation;
    private testFFTWindowFunctions;
    private testFFTRealTimeAnalysis;
    private testFFTPerformance;
    /**
     * 多图表组件测试实现
     */
    private testMultiPlotInitialization;
    private testMultiPlotSeries;
    private testMultiPlotLegend;
    private testMultiPlotInterpolation;
    private testMultiPlotPerformance;
    /**
     * 集成测试实现
     */
    private testDataTypeCompatibility;
    private testConcurrentRendering;
    private testMemoryLeaks;
    private testErrorRecovery;
    private testOverallPerformance;
    /**
     * 生成详细测试报告
     */
    private generateDetailedReport;
}
export declare const integrationTestRunner: IntegrationTestRunner;
export declare function runIntegrationTests(): Promise<void>;
//# sourceMappingURL=run-integration-tests.d.ts.map
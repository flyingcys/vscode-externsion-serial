import * as vscode from 'vscode';
/**
 * 测试结果接口
 */
interface TestResult {
    testName: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: any;
}
/**
 * 测试套件结果接口
 */
interface TestSuiteResult {
    suiteName: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
    tests: TestResult[];
}
/**
 * LicensingIntegrationTest - 许可证系统集成测试
 *
 * 执行完整的许可证系统集成测试，验证：
 * - 机器ID生成和一致性
 * - 数据加密和解密功能
 * - 许可证管理器核心功能
 * - 特性门控机制
 * - 配置管理和同步
 * - 系统集成和协作
 *
 * 对应第25周质量指标要求：
 * - 插件加载时间：≤2秒
 * - 扩展点注册成功率：100%
 * - 主题切换响应时间：≤500ms
 * - 多语言支持完整性：≥95%
 */
export declare class LicensingIntegrationTest {
    private context;
    private testResults;
    constructor(context: vscode.ExtensionContext);
    /**
     * 运行所有集成测试
     */
    runAllTests(): Promise<TestSuiteResult[]>;
    /**
     * MachineID测试套件
     */
    private runMachineIDTests;
    /**
     * SimpleCrypt测试套件
     */
    private runSimpleCryptTests;
    /**
     * LicenseManager测试套件
     */
    private runLicenseManagerTests;
    /**
     * FeatureGate测试套件
     */
    private runFeatureGateTests;
    /**
     * ConfigurationManager测试套件
     */
    private runConfigurationManagerTests;
    /**
     * 系统集成测试套件
     */
    private runSystemIntegrationTests;
    /**
     * 运行单个测试
     */
    private runTest;
    /**
     * 生成测试报告
     */
    private generateTestReport;
    /**
     * 检查质量指标
     */
    private checkQualityMetrics;
    /**
     * 获取测试结果
     */
    getTestResults(): TestSuiteResult[];
}
export {};
//# sourceMappingURL=LicensingIntegrationTest.d.ts.map
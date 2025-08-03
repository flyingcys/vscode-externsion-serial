/**
 * PerformanceTestSuites - 性能测试用例集合
 * 包含所有核心功能的性能测试，对标Serial-Studio的性能指标
 */
import PerformanceTestFramework, { TestCase } from './PerformanceTestFramework';
/**
 * 数据处理性能测试
 */
export declare class DataProcessingTests {
    static getTests(): TestCase[];
}
/**
 * 内存管理性能测试
 */
export declare class MemoryManagementTests {
    static getTests(): TestCase[];
}
/**
 * 渲染性能测试
 */
export declare class RenderingPerformanceTests {
    static getTests(): TestCase[];
}
/**
 * 虚拟化性能测试
 */
export declare class VirtualizationTests {
    static getTests(): TestCase[];
}
/**
 * 性能测试套件管理器
 */
export declare class PerformanceTestManager {
    private framework;
    constructor();
    /**
     * 注册所有测试用例
     */
    private registerAllTests;
    /**
     * 运行完整测试套件
     */
    runFullSuite(): Promise<void>;
    /**
     * 运行特定类别的测试
     */
    runCategory(category: 'data' | 'memory' | 'rendering' | 'virtualization'): Promise<void>;
    /**
     * 获取测试框架实例
     */
    getFramework(): PerformanceTestFramework;
    /**
     * 清理资源
     */
    destroy(): void;
}
export default PerformanceTestManager;
//# sourceMappingURL=PerformanceTestSuites.d.ts.map
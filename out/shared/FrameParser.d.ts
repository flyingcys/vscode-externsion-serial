/**
 * FrameParser - 基于Serial-Studio的FrameParser设计
 * 安全的JavaScript解析器，使用沙箱环境执行用户脚本
 */
/**
 * 解析结果接口
 */
export interface ParseResult {
    success: boolean;
    data?: any[];
    error?: string;
    executionTime?: number;
}
/**
 * 帧解析器主类
 * 模拟Serial-Studio的FrameParser类
 */
export declare class FrameParser {
    private sandbox;
    private isEnabled;
    private performanceMetrics;
    constructor();
    /**
     * 加载JavaScript解析脚本
     */
    loadScript(script: string): boolean;
    /**
     * 解析帧数据
     */
    parse(frameData: string | Uint8Array): any[];
    /**
     * 批量解析多个帧
     */
    parseMultiple(frames: (string | Uint8Array)[]): any[][];
    /**
     * 验证脚本语法是否正确
     */
    validateSyntax(script: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * 启用或禁用解析器
     */
    setEnabled(enabled: boolean): void;
    /**
     * 检查解析器是否启用
     */
    isParserEnabled(): boolean;
    /**
     * 获取当前加载的脚本
     */
    getScript(): string;
    /**
     * 检查是否已加载脚本
     */
    hasScript(): boolean;
    /**
     * 清空解析器
     */
    clear(): void;
    /**
     * 更新性能指标
     */
    private updatePerformanceMetrics;
    /**
     * 重置性能指标
     */
    private resetPerformanceMetrics;
    /**
     * 获取性能统计信息
     */
    getPerformanceMetrics(): {
        totalExecutions: number;
        totalTime: number;
        averageTime: number;
        lastExecutionTime: number;
    };
    /**
     * 创建示例脚本（用于教学和测试）
     */
    static createExampleScript(): string;
    /**
     * 创建高级示例脚本（JSON解析）
     */
    static createJsonExampleScript(): string;
}
export default FrameParser;
//# sourceMappingURL=FrameParser.d.ts.map
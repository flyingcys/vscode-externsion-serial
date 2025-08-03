/**
 * 统一错误处理系统
 * 提供用户友好的错误消息和自动恢复机制
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 错误严重性级别
 */
export declare enum ErrorSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical",
    FATAL = "fatal"
}
/**
 * 错误类别
 */
export declare enum ErrorCategory {
    NETWORK = "network",
    DATA_PROCESSING = "data",
    FILE_SYSTEM = "filesystem",
    DEVICE_CONNECTION = "device",
    USER_INPUT = "user_input",
    SYSTEM = "system",
    CONFIGURATION = "config",
    PERFORMANCE = "performance",
    SECURITY = "security",
    UNKNOWN = "unknown"
}
/**
 * 结构化错误信息
 */
export interface StructuredError {
    id: string;
    code: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    title: string;
    message: string;
    technicalDetails?: string;
    timestamp: number;
    context?: Record<string, any>;
    suggestions?: string[];
    autoRecoveryAttempted?: boolean;
    canRetry?: boolean;
    userAction?: string;
    relatedErrors?: string[];
}
/**
 * 错误处理选项
 */
export interface ErrorHandlingOptions {
    enableAutoRecovery?: boolean;
    enableUserNotification?: boolean;
    enableLogging?: boolean;
    maxRetryAttempts?: number;
    retryDelayMs?: number;
    suppressDuplicates?: boolean;
    duplicateTimeWindowMs?: number;
}
/**
 * 自动恢复策略接口
 */
export interface RecoveryStrategy {
    name: string;
    description: string;
    canHandle: (error: StructuredError) => boolean;
    recover: (error: StructuredError) => Promise<boolean>;
    priority: number;
}
/**
 * 错误处理统计
 */
export interface ErrorStats {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    autoRecoverySuccessRate: number;
    averageRecoveryTime: number;
    recentErrors: StructuredError[];
}
/**
 * 统一错误处理器
 */
export declare class ErrorHandler extends EventEmitter {
    private static instance;
    private errors;
    private recoveryStrategies;
    private options;
    private stats;
    private duplicateTracker;
    private constructor();
    /**
     * 获取全局错误处理器实例
     */
    static getInstance(options?: ErrorHandlingOptions): ErrorHandler;
    /**
     * 处理错误
     */
    handleError(error: Error | StructuredError, context?: Record<string, any>): Promise<StructuredError>;
    /**
     * 注册恢复策略
     */
    registerRecoveryStrategy(strategy: RecoveryStrategy): void;
    /**
     * 获取错误统计信息
     */
    getStats(): ErrorStats;
    /**
     * 获取最近的错误
     */
    getRecentErrors(limit?: number): StructuredError[];
    /**
     * 清除错误历史
     */
    clearErrorHistory(): void;
    /**
     * 将普通错误标准化为结构化错误
     */
    private normalizeError;
    /**
     * 分析错误并生成用户友好信息
     */
    private analyzeError;
    /**
     * 检查是否为重复错误
     */
    private isDuplicateError;
    /**
     * 记录错误到统计信息
     */
    private recordError;
    /**
     * 尝试自动恢复
     */
    private attemptAutoRecovery;
    /**
     * 发送错误通知
     */
    private emitErrorNotification;
    /**
     * 记录错误日志
     */
    private logError;
    /**
     * 获取日志级别
     */
    private getLogLevel;
    /**
     * 更新恢复统计信息
     */
    private updateRecoveryStats;
    /**
     * 设置默认恢复策略
     */
    private setupDefaultRecoveryStrategies;
    /**
     * 设置清理任务
     */
    private setupCleanupTasks;
    /**
     * 工具方法
     */
    private generateErrorId;
    private isStructuredError;
    private delay;
    /**
     * 销毁错误处理器
     */
    dispose(): void;
}
/**
 * 创建用户友好的错误信息
 */
export declare function createUserFriendlyError(code: string, title: string, message: string, options?: Partial<StructuredError>): StructuredError;
/**
 * 全局错误处理器实例
 */
export declare const globalErrorHandler: ErrorHandler;
//# sourceMappingURL=ErrorHandling.d.ts.map
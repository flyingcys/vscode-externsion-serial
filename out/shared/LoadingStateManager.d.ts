/**
 * 统一加载状态管理器
 * 提供全局的加载状态控制和进度反馈机制
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 加载状态类型
 */
export declare enum LoadingType {
    SPINNER = "spinner",
    PROGRESS = "progress",
    SKELETON = "skeleton",
    DOTS = "dots",
    PULSE = "pulse",
    WAVE = "wave"
}
/**
 * 加载优先级
 */
export declare enum LoadingPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * 加载状态
 */
export declare enum LoadingStatus {
    IDLE = "idle",
    LOADING = "loading",
    SUCCESS = "success",
    ERROR = "error",
    CANCELLED = "cancelled"
}
/**
 * 加载任务配置
 */
export interface LoadingTaskConfig {
    id: string;
    title: string;
    description?: string;
    type: LoadingType;
    priority: LoadingPriority;
    estimatedDuration?: number;
    showProgress?: boolean;
    cancellable?: boolean;
    autoHide?: boolean;
    autoHideDelay?: number;
    context?: Record<string, any>;
}
/**
 * 加载任务状态
 */
export interface LoadingTask extends LoadingTaskConfig {
    status: LoadingStatus;
    progress: number;
    startTime: number;
    endTime?: number;
    error?: Error;
    subTasks?: LoadingTask[];
    parentTaskId?: string;
}
/**
 * 进度更新信息
 */
export interface ProgressUpdate {
    taskId: string;
    progress: number;
    message?: string;
    subProgress?: {
        current: number;
        total: number;
        label?: string;
    };
}
/**
 * 加载状态统计
 */
export interface LoadingStats {
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    cancelledTasks: number;
    averageDuration: number;
    totalDataProcessed: number;
}
/**
 * 统一加载状态管理器
 */
export declare class LoadingStateManager extends EventEmitter {
    private static instance;
    private tasks;
    private taskHistory;
    private stats;
    private maxHistorySize;
    private constructor();
    /**
     * 获取全局加载状态管理器实例
     */
    static getInstance(): LoadingStateManager;
    /**
     * 开始加载任务
     */
    startTask(config: LoadingTaskConfig): LoadingTask;
    /**
     * 更新任务进度
     */
    updateProgress(update: ProgressUpdate): void;
    /**
     * 完成任务
     */
    completeTask(taskId: string, result?: any): void;
    /**
     * 任务失败
     */
    failTask(taskId: string, error: Error): void;
    /**
     * 取消任务
     */
    cancelTask(taskId: string): void;
    /**
     * 获取任务
     */
    getTask(taskId: string): LoadingTask | undefined;
    /**
     * 获取所有活跃任务
     */
    getActiveTasks(): LoadingTask[];
    /**
     * 获取按优先级排序的活跃任务
     */
    getActiveTasksByPriority(): LoadingTask[];
    /**
     * 获取全局加载状态
     */
    getState(): {
        isLoading: boolean;
        activeTasks: LoadingTask[];
        progress: number;
        message: string;
    };
    /**
     * 获取统计信息
     */
    getStats(): LoadingStats;
    /**
     * 批量操作任务
     */
    batchOperation<T>(operations: Array<() => Promise<T>>, config: Omit<LoadingTaskConfig, 'id'> & {
        batchId?: string;
    }): Promise<T[]>;
    /**
     * 创建数据处理任务
     */
    createDataProcessingTask(taskId: string, title: string, dataSize: number, processor: (chunk: any, progress: (processed: number) => void) => Promise<any>): (data: any[]) => Promise<any[]>;
    /**
     * 创建文件操作任务
     */
    createFileOperationTask(taskId: string, title: string, operation: (progress: (percent: number, message?: string) => void) => Promise<any>): Promise<any>;
    /**
     * 创建网络请求任务
     */
    createNetworkTask(taskId: string, title: string, requestFn: (abortSignal: AbortSignal) => Promise<any>): Promise<any>;
    /**
     * 清理已完成的任务
     */
    private scheduleTaskCleanup;
    /**
     * 移除任务
     */
    private removeTask;
    /**
     * 移动任务到历史记录
     */
    private moveToHistory;
    /**
     * 更新平均统计信息
     */
    private updateAverageStats;
    /**
     * 获取任务历史
     */
    getTaskHistory(limit?: number): LoadingTask[];
    /**
     * 清空所有任务
     */
    clearAllTasks(): void;
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 销毁管理器
     */
    dispose(): void;
}
/**
 * 加载状态装饰器
 */
export declare function withLoading(taskConfig: Omit<LoadingTaskConfig, 'id'> & {
    idPrefix?: string;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 全局加载状态管理器实例
 */
export declare const globalLoadingManager: LoadingStateManager;
//# sourceMappingURL=LoadingStateManager.d.ts.map
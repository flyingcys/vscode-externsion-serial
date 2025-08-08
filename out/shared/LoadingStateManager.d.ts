/**
 * 加载状态管理器
 * 提供全局的加载状态管理和任务跟踪
 */
export declare enum LoadingType {
    SPINNER = "spinner",
    PROGRESS = "progress",
    SKELETON = "skeleton",
    DOTS = "dots",
    PULSE = "pulse",
    WAVE = "wave"
}
export declare enum LoadingStatus {
    PENDING = "pending",
    LOADING = "loading",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface LoadingTask {
    id: string;
    status: LoadingStatus;
    type: LoadingType;
    title?: string;
    description?: string;
    progress?: number;
    cancellable?: boolean;
    startTime: number;
    endTime?: number;
    error?: string;
}
export declare class LoadingStateManager {
    private tasks;
    private listeners;
    createTask(id: string, options?: Partial<LoadingTask>): LoadingTask;
    startTask(id: string): void;
    updateTask(id: string, updates: Partial<LoadingTask>): void;
    completeTask(id: string): void;
    failTask(id: string, error: string): void;
    cancelTask(id: string): void;
    getTask(id: string): LoadingTask | null;
    getAllTasks(): LoadingTask[];
    getActiveTasks(): LoadingTask[];
    removeTask(id: string): void;
    clearCompletedTasks(): void;
    on(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    private emit;
}
export declare const globalLoadingManager: LoadingStateManager;
//# sourceMappingURL=LoadingStateManager.d.ts.map
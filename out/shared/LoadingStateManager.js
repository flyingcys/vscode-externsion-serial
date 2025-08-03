"use strict";
/**
 * 统一加载状态管理器
 * 提供全局的加载状态控制和进度反馈机制
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLoadingManager = exports.withLoading = exports.LoadingStateManager = exports.LoadingStatus = exports.LoadingPriority = exports.LoadingType = void 0;
const events_1 = require("events");
/**
 * 加载状态类型
 */
var LoadingType;
(function (LoadingType) {
    LoadingType["SPINNER"] = "spinner";
    LoadingType["PROGRESS"] = "progress";
    LoadingType["SKELETON"] = "skeleton";
    LoadingType["DOTS"] = "dots";
    LoadingType["PULSE"] = "pulse";
    LoadingType["WAVE"] = "wave"; // 波浪效果
})(LoadingType = exports.LoadingType || (exports.LoadingType = {}));
/**
 * 加载优先级
 */
var LoadingPriority;
(function (LoadingPriority) {
    LoadingPriority["LOW"] = "low";
    LoadingPriority["MEDIUM"] = "medium";
    LoadingPriority["HIGH"] = "high";
    LoadingPriority["CRITICAL"] = "critical";
})(LoadingPriority = exports.LoadingPriority || (exports.LoadingPriority = {}));
/**
 * 加载状态
 */
var LoadingStatus;
(function (LoadingStatus) {
    LoadingStatus["IDLE"] = "idle";
    LoadingStatus["LOADING"] = "loading";
    LoadingStatus["SUCCESS"] = "success";
    LoadingStatus["ERROR"] = "error";
    LoadingStatus["CANCELLED"] = "cancelled";
})(LoadingStatus = exports.LoadingStatus || (exports.LoadingStatus = {}));
/**
 * 统一加载状态管理器
 */
class LoadingStateManager extends events_1.EventEmitter {
    static instance = null;
    tasks = new Map();
    taskHistory = [];
    stats;
    maxHistorySize = 100;
    constructor() {
        super();
        this.stats = {
            activeTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            cancelledTasks: 0,
            averageDuration: 0,
            totalDataProcessed: 0
        };
    }
    /**
     * 获取全局加载状态管理器实例
     */
    static getInstance() {
        if (!LoadingStateManager.instance) {
            LoadingStateManager.instance = new LoadingStateManager();
        }
        return LoadingStateManager.instance;
    }
    /**
     * 开始加载任务
     */
    startTask(config) {
        const task = {
            ...config,
            status: LoadingStatus.LOADING,
            progress: 0,
            startTime: Date.now()
        };
        this.tasks.set(task.id, task);
        this.stats.activeTasks++;
        this.emit('task:started', task);
        this.emit('state:changed', this.getState());
        return task;
    }
    /**
     * 更新任务进度
     */
    updateProgress(update) {
        const task = this.tasks.get(update.taskId);
        if (!task || task.status !== LoadingStatus.LOADING) {
            return;
        }
        task.progress = Math.max(0, Math.min(100, update.progress));
        if (update.message) {
            task.description = update.message;
        }
        this.emit('task:progress', { task, update });
        this.emit('state:changed', this.getState());
    }
    /**
     * 完成任务
     */
    completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task) {
            return;
        }
        task.status = LoadingStatus.SUCCESS;
        task.progress = 100;
        task.endTime = Date.now();
        this.stats.activeTasks--;
        this.stats.completedTasks++;
        this.updateAverageStats(task);
        this.emit('task:completed', { task, result });
        this.emit('state:changed', this.getState());
        this.scheduleTaskCleanup(task);
    }
    /**
     * 任务失败
     */
    failTask(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task) {
            return;
        }
        task.status = LoadingStatus.ERROR;
        task.error = error;
        task.endTime = Date.now();
        this.stats.activeTasks--;
        this.stats.failedTasks++;
        this.updateAverageStats(task);
        this.emit('task:failed', { task, error });
        this.emit('state:changed', this.getState());
        this.scheduleTaskCleanup(task);
    }
    /**
     * 取消任务
     */
    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || !task.cancellable) {
            return;
        }
        task.status = LoadingStatus.CANCELLED;
        task.endTime = Date.now();
        this.stats.activeTasks--;
        this.stats.cancelledTasks++;
        this.emit('task:cancelled', task);
        this.emit('state:changed', this.getState());
        this.scheduleTaskCleanup(task);
    }
    /**
     * 获取任务
     */
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    /**
     * 获取所有活跃任务
     */
    getActiveTasks() {
        return Array.from(this.tasks.values()).filter(task => task.status === LoadingStatus.LOADING);
    }
    /**
     * 获取按优先级排序的活跃任务
     */
    getActiveTasksByPriority() {
        const priorityOrder = {
            [LoadingPriority.CRITICAL]: 0,
            [LoadingPriority.HIGH]: 1,
            [LoadingPriority.MEDIUM]: 2,
            [LoadingPriority.LOW]: 3
        };
        return this.getActiveTasks().sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    /**
     * 获取全局加载状态
     */
    getState() {
        const activeTasks = this.getActiveTasks();
        const isLoading = activeTasks.length > 0;
        let totalProgress = 0;
        let message = '';
        if (activeTasks.length > 0) {
            // 计算加权平均进度
            const priorityWeight = {
                [LoadingPriority.CRITICAL]: 4,
                [LoadingPriority.HIGH]: 3,
                [LoadingPriority.MEDIUM]: 2,
                [LoadingPriority.LOW]: 1
            };
            let weightedProgress = 0;
            let totalWeight = 0;
            for (const task of activeTasks) {
                const weight = priorityWeight[task.priority];
                weightedProgress += task.progress * weight;
                totalWeight += weight;
            }
            totalProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0;
            // 获取最高优先级任务的消息
            const highestPriorityTask = this.getActiveTasksByPriority()[0];
            message = highestPriorityTask?.title || '加载中...';
        }
        return {
            isLoading,
            activeTasks,
            progress: totalProgress,
            message
        };
    }
    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 批量操作任务
     */
    batchOperation(operations, config) {
        const batchId = config.batchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const batchTask = this.startTask({
            ...config,
            id: batchId,
            title: config.title || '批量操作'
        });
        const executeOperations = async () => {
            const results = [];
            for (let i = 0; i < operations.length; i++) {
                try {
                    this.updateProgress({
                        taskId: batchId,
                        progress: (i / operations.length) * 100,
                        message: `执行操作 ${i + 1}/${operations.length}`
                    });
                    const result = await operations[i]();
                    results.push(result);
                }
                catch (error) {
                    this.failTask(batchId, error);
                    throw error;
                }
            }
            this.completeTask(batchId, results);
            return results;
        };
        return executeOperations();
    }
    /**
     * 创建数据处理任务
     */
    createDataProcessingTask(taskId, title, dataSize, processor) {
        return async (data) => {
            const task = this.startTask({
                id: taskId,
                title,
                description: `处理 ${data.length} 项数据`,
                type: LoadingType.PROGRESS,
                priority: LoadingPriority.MEDIUM,
                showProgress: true,
                cancellable: true
            });
            const results = [];
            const chunkSize = Math.max(1, Math.floor(data.length / 100)); // 分成100个块
            try {
                for (let i = 0; i < data.length; i += chunkSize) {
                    if (task.status === LoadingStatus.CANCELLED) {
                        throw new Error('任务已取消');
                    }
                    const chunk = data.slice(i, i + chunkSize);
                    const chunkResults = await processor(chunk, (processed) => {
                        const totalProcessed = i + processed;
                        this.updateProgress({
                            taskId,
                            progress: (totalProcessed / data.length) * 100,
                            message: `已处理 ${totalProcessed}/${data.length} 项`
                        });
                    });
                    results.push(...chunkResults);
                    this.stats.totalDataProcessed += chunk.length;
                }
                this.completeTask(taskId, results);
                return results;
            }
            catch (error) {
                this.failTask(taskId, error);
                throw error;
            }
        };
    }
    /**
     * 创建文件操作任务
     */
    createFileOperationTask(taskId, title, operation) {
        const task = this.startTask({
            id: taskId,
            title,
            type: LoadingType.PROGRESS,
            priority: LoadingPriority.HIGH,
            showProgress: true,
            cancellable: false
        });
        return operation((percent, message) => {
            this.updateProgress({
                taskId,
                progress: percent,
                message
            });
        }).then((result) => {
            this.completeTask(taskId, result);
            return result;
        }, (error) => {
            this.failTask(taskId, error);
            throw error;
        });
    }
    /**
     * 创建网络请求任务
     */
    createNetworkTask(taskId, title, requestFn) {
        const abortController = new AbortController();
        const task = this.startTask({
            id: taskId,
            title,
            type: LoadingType.SPINNER,
            priority: LoadingPriority.MEDIUM,
            cancellable: true,
            estimatedDuration: 5000 // 5秒预估
        });
        // 监听取消事件
        this.once(`task:cancelled`, (cancelledTask) => {
            if (cancelledTask.id === taskId) {
                abortController.abort();
            }
        });
        return requestFn(abortController.signal).then((result) => {
            this.completeTask(taskId, result);
            return result;
        }, (error) => {
            if (error.name === 'AbortError') {
                // 任务已在 cancelTask 中标记为取消
            }
            else {
                this.failTask(taskId, error);
            }
            throw error;
        });
    }
    /**
     * 清理已完成的任务
     */
    scheduleTaskCleanup(task) {
        const cleanupDelay = task.autoHide && task.autoHideDelay
            ? task.autoHideDelay
            : (task.autoHide ? 3000 : 0);
        if (cleanupDelay > 0) {
            setTimeout(() => {
                this.removeTask(task.id);
            }, cleanupDelay);
        }
        else if (!task.autoHide && task.status !== LoadingStatus.LOADING) {
            // 立即移动到历史记录
            this.moveToHistory(task);
        }
    }
    /**
     * 移除任务
     */
    removeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            this.moveToHistory(task);
            this.tasks.delete(taskId);
            this.emit('task:removed', task);
            this.emit('state:changed', this.getState());
        }
    }
    /**
     * 移动任务到历史记录
     */
    moveToHistory(task) {
        this.taskHistory.unshift(task);
        // 限制历史记录大小
        if (this.taskHistory.length > this.maxHistorySize) {
            this.taskHistory = this.taskHistory.slice(0, this.maxHistorySize);
        }
    }
    /**
     * 更新平均统计信息
     */
    updateAverageStats(task) {
        if (task.endTime && task.startTime) {
            const duration = task.endTime - task.startTime;
            this.stats.averageDuration =
                (this.stats.averageDuration + duration) / 2;
        }
    }
    /**
     * 获取任务历史
     */
    getTaskHistory(limit) {
        return limit ? this.taskHistory.slice(0, limit) : [...this.taskHistory];
    }
    /**
     * 清空所有任务
     */
    clearAllTasks() {
        for (const task of this.tasks.values()) {
            if (task.cancellable && task.status === LoadingStatus.LOADING) {
                this.cancelTask(task.id);
            }
        }
        this.tasks.clear();
        this.emit('tasks:cleared');
        this.emit('state:changed', this.getState());
    }
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            activeTasks: this.getActiveTasks().length,
            completedTasks: 0,
            failedTasks: 0,
            cancelledTasks: 0,
            averageDuration: 0,
            totalDataProcessed: 0
        };
    }
    /**
     * 销毁管理器
     */
    dispose() {
        this.clearAllTasks();
        this.removeAllListeners();
        LoadingStateManager.instance = null;
    }
}
exports.LoadingStateManager = LoadingStateManager;
/**
 * 加载状态装饰器
 */
function withLoading(taskConfig) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const loadingManager = LoadingStateManager.getInstance();
            const taskId = `${taskConfig.idPrefix || propertyKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const task = loadingManager.startTask({
                ...taskConfig,
                id: taskId
            });
            try {
                const result = await originalMethod.apply(this, args);
                loadingManager.completeTask(taskId, result);
                return result;
            }
            catch (error) {
                loadingManager.failTask(taskId, error);
                throw error;
            }
        };
        return descriptor;
    };
}
exports.withLoading = withLoading;
/**
 * 全局加载状态管理器实例
 */
exports.globalLoadingManager = LoadingStateManager.getInstance();
//# sourceMappingURL=LoadingStateManager.js.map
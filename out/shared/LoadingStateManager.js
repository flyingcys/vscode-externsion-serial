"use strict";
/**
 * 加载状态管理器
 * 提供全局的加载状态管理和任务跟踪
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLoadingManager = exports.LoadingStateManager = exports.LoadingStatus = exports.LoadingType = void 0;
var LoadingType;
(function (LoadingType) {
    LoadingType["SPINNER"] = "spinner";
    LoadingType["PROGRESS"] = "progress";
    LoadingType["SKELETON"] = "skeleton";
    LoadingType["DOTS"] = "dots";
    LoadingType["PULSE"] = "pulse";
    LoadingType["WAVE"] = "wave";
})(LoadingType = exports.LoadingType || (exports.LoadingType = {}));
var LoadingStatus;
(function (LoadingStatus) {
    LoadingStatus["PENDING"] = "pending";
    LoadingStatus["LOADING"] = "loading";
    LoadingStatus["COMPLETED"] = "completed";
    LoadingStatus["FAILED"] = "failed";
    LoadingStatus["CANCELLED"] = "cancelled";
})(LoadingStatus = exports.LoadingStatus || (exports.LoadingStatus = {}));
class LoadingStateManager {
    tasks = new Map();
    listeners = new Map();
    createTask(id, options = {}) {
        const task = {
            id,
            status: LoadingStatus.PENDING,
            type: LoadingType.SPINNER,
            startTime: Date.now(),
            cancellable: false,
            ...options
        };
        this.tasks.set(id, task);
        this.emit('task:created', { task });
        return task;
    }
    startTask(id) {
        const task = this.tasks.get(id);
        if (task) {
            task.status = LoadingStatus.LOADING;
            this.emit('task:started', { task });
        }
    }
    updateTask(id, updates) {
        const task = this.tasks.get(id);
        if (task) {
            Object.assign(task, updates);
            this.emit('task:progress', { task });
        }
    }
    completeTask(id) {
        const task = this.tasks.get(id);
        if (task) {
            task.status = LoadingStatus.COMPLETED;
            task.endTime = Date.now();
            this.emit('task:completed', { task });
        }
    }
    failTask(id, error) {
        const task = this.tasks.get(id);
        if (task) {
            task.status = LoadingStatus.FAILED;
            task.error = error;
            task.endTime = Date.now();
            this.emit('task:failed', { task });
        }
    }
    cancelTask(id) {
        const task = this.tasks.get(id);
        if (task && task.cancellable) {
            task.status = LoadingStatus.CANCELLED;
            task.endTime = Date.now();
            this.emit('task:cancelled', { task });
        }
    }
    getTask(id) {
        return this.tasks.get(id) || null;
    }
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    getActiveTasks() {
        return this.getAllTasks().filter(task => task.status === LoadingStatus.PENDING || task.status === LoadingStatus.LOADING);
    }
    removeTask(id) {
        this.tasks.delete(id);
        this.emit('task:removed', { id });
    }
    clearCompletedTasks() {
        for (const [id, task] of this.tasks) {
            if (task.status === LoadingStatus.COMPLETED ||
                task.status === LoadingStatus.FAILED ||
                task.status === LoadingStatus.CANCELLED) {
                this.tasks.delete(id);
            }
        }
        this.emit('tasks:cleared');
    }
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(listener);
    }
    off(event, listener) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener);
        }
    }
    emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => {
                try {
                    listener(data);
                }
                catch (error) {
                    console.error(`Error in loading state listener for ${event}:`, error);
                }
            });
        }
    }
}
exports.LoadingStateManager = LoadingStateManager;
// 全局实例
exports.globalLoadingManager = new LoadingStateManager();
//# sourceMappingURL=LoadingStateManager.js.map
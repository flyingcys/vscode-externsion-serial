/**
 * 加载状态管理器
 * 提供全局的加载状态管理和任务跟踪
 */

export enum LoadingType {
  SPINNER = 'spinner',
  PROGRESS = 'progress',
  SKELETON = 'skeleton',
  DOTS = 'dots',
  PULSE = 'pulse',
  WAVE = 'wave'
}

export enum LoadingStatus {
  PENDING = 'pending',
  LOADING = 'loading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
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

export class LoadingStateManager {
  private tasks = new Map<string, LoadingTask>();
  private listeners = new Map<string, Set<Function>>();

  createTask(id: string, options: Partial<LoadingTask> = {}): LoadingTask {
    const task: LoadingTask = {
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

  startTask(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = LoadingStatus.LOADING;
      this.emit('task:started', { task });
    }
  }

  updateTask(id: string, updates: Partial<LoadingTask>): void {
    const task = this.tasks.get(id);
    if (task) {
      Object.assign(task, updates);
      this.emit('task:progress', { task });
    }
  }

  completeTask(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = LoadingStatus.COMPLETED;
      task.endTime = Date.now();
      this.emit('task:completed', { task });
    }
  }

  failTask(id: string, error: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = LoadingStatus.FAILED;
      task.error = error;
      task.endTime = Date.now();
      this.emit('task:failed', { task });
    }
  }

  cancelTask(id: string): void {
    const task = this.tasks.get(id);
    if (task && task.cancellable) {
      task.status = LoadingStatus.CANCELLED;
      task.endTime = Date.now();
      this.emit('task:cancelled', { task });
    }
  }

  getTask(id: string): LoadingTask | null {
    return this.tasks.get(id) || null;
  }

  getAllTasks(): LoadingTask[] {
    return Array.from(this.tasks.values());
  }

  getActiveTasks(): LoadingTask[] {
    return this.getAllTasks().filter(task => 
      task.status === LoadingStatus.PENDING || task.status === LoadingStatus.LOADING
    );
  }

  removeTask(id: string): void {
    this.tasks.delete(id);
    this.emit('task:removed', { id });
  }

  clearCompletedTasks(): void {
    for (const [id, task] of this.tasks) {
      if (task.status === LoadingStatus.COMPLETED || 
          task.status === LoadingStatus.FAILED ||
          task.status === LoadingStatus.CANCELLED) {
        this.tasks.delete(id);
      }
    }
    this.emit('tasks:cleared');
  }

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in loading state listener for ${event}:`, error);
        }
      });
    }
  }
}

// 全局实例
export const globalLoadingManager = new LoadingStateManager();
/**
 * MultiThreadProcessor - 多线程数据处理器
 * 基于Serial-Studio的多线程架构，用于高性能数据处理
 */

import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import * as path from 'path';

// 帧检测模式枚举
export enum FrameDetection {
  EndDelimiterOnly = 0,
  StartAndEndDelimiter = 1,
  NoDelimiters = 2,
  StartDelimiterOnly = 3
}

// 操作模式枚举
export enum OperationMode {
  ProjectFile = 0,
  DeviceSendsJSON = 1,
  QuickPlot = 2
}

// Worker配置接口
export interface WorkerConfig {
  operationMode: OperationMode;
  frameDetectionMode: FrameDetection;
  startSequence: Uint8Array;
  finishSequence: Uint8Array;
  checksumAlgorithm: string;
  bufferCapacity?: number;
  maxWorkers?: number;
}

// Worker实例接口
interface WorkerInstance {
  worker: Worker;
  id: string;
  state: 'idle' | 'busy' | 'error';
  lastUsed: number;
  pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>;
}

// 统计信息接口
interface ProcessorStatistics {
  workersCreated: number;
  workersTerminated: number;
  tasksProcessed: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  activeWorkers: number;
  queuedTasks: number;
}

/**
 * 多线程处理器 - 管理Worker池进行高性能数据处理
 */
export class MultiThreadProcessor extends EventEmitter {
  private workers: WorkerInstance[] = [];
  private workerPool: WorkerInstance[] = [];
  private activeJobs = new Map<string, any>();
  private config: WorkerConfig;
  private nextWorkerId = 0;
  private isTerminated = false;
  private statistics: ProcessorStatistics = {
    workersCreated: 0,
    workersTerminated: 0,
    tasksProcessed: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    activeWorkers: 0,
    queuedTasks: 0
  };

  constructor(config: WorkerConfig) {
    super();
    this.config = { maxWorkers: 4, ...config };
    this.initializeWorkerPool();
  }

  /**
   * 初始化Worker池
   */
  private initializeWorkerPool(): void {
    const maxWorkers = this.config.maxWorkers || 4;
    for (let i = 0; i < maxWorkers; i++) {
      this.createWorker();
    }
  }

  /**
   * 创建单个Worker实例
   */
  private createWorker(): WorkerInstance {
    const workerId = `worker_${this.nextWorkerId++}`;
    const workerScript = path.join(__dirname, '../workers/DataProcessor.js');
    
    const worker = new Worker(workerScript, {
      workerData: { workerId }
    });

    const workerInstance: WorkerInstance = {
      worker,
      id: workerId,
      state: 'idle',
      lastUsed: Date.now(),
      pendingRequests: new Map()
    };

    // 设置事件监听
    this.setupWorkerEvents(workerInstance);
    
    this.workers.push(workerInstance);
    this.statistics.workersCreated++;
    this.statistics.activeWorkers++;
    
    // 延迟添加到可用池，模拟Worker初始化时间
    setTimeout(() => {
      if (!this.isTerminated && workerInstance.state !== 'error') {
        this.workerPool.push(workerInstance);
        this.emit('workerOnline', workerInstance);
      }
    }, 10);

    return workerInstance;
  }

  /**
   * 设置Worker事件监听
   */
  private setupWorkerEvents(workerInstance: WorkerInstance): void {
    const { worker } = workerInstance;

    worker.on('message', (data) => {
      this.handleWorkerMessage(workerInstance, data);
    });

    worker.on('error', (error) => {
      this.handleWorkerError(workerInstance, error);
    });

    worker.on('exit', (code) => {
      this.handleWorkerExit(workerInstance, code);
    });
  }

  /**
   * 处理Worker消息
   */
  private handleWorkerMessage(workerInstance: WorkerInstance, data: any): void {
    const job = this.activeJobs.get(data.id);
    if (job) {
      job.endTime = Date.now();
      const processingTime = job.endTime - job.startTime;
      this.statistics.tasksProcessed++;
      this.statistics.totalProcessingTime += processingTime;
      this.statistics.averageProcessingTime = 
        this.statistics.totalProcessingTime / this.statistics.tasksProcessed;

      this.activeJobs.delete(data.id);
      
      // 将Worker返回到池中
      workerInstance.state = 'idle';
      workerInstance.lastUsed = Date.now();
      this.workerPool.push(workerInstance);
      
      if (job.resolve) {
        job.resolve(data);
      }
    }

    this.emit('taskCompleted', data);
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(workerInstance: WorkerInstance, error: Error): void {
    workerInstance.state = 'error';
    this.emit('workerError', { worker: workerInstance, error });
    
    // 拒绝所有待处理的请求
    workerInstance.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(error);
    });
    workerInstance.pendingRequests.clear();
    
    // 从池中移除错误的Worker
    const poolIndex = this.workerPool.indexOf(workerInstance);
    if (poolIndex !== -1) {
      this.workerPool.splice(poolIndex, 1);
    }
    
    const workerIndex = this.workers.indexOf(workerInstance);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
      this.statistics.activeWorkers = Math.max(0, this.statistics.activeWorkers - 1);
    }

    // 如果池中Worker不足，创建新的Worker
    if (!this.isTerminated && this.workers.length < (this.config.maxWorkers || 4)) {
      setTimeout(() => {
        this.createWorker();
      }, 10);
    }
  }

  /**
   * 处理Worker退出
   */
  private handleWorkerExit(workerInstance: WorkerInstance, code: number): void {
    this.statistics.workersTerminated++;
    this.statistics.activeWorkers = Math.max(0, this.statistics.activeWorkers - 1);
    
    const workerIndex = this.workers.indexOf(workerInstance);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
    }

    const poolIndex = this.workerPool.indexOf(workerInstance);
    if (poolIndex !== -1) {
      this.workerPool.splice(poolIndex, 1);
    }

    this.emit('workerExit', { worker: workerInstance, code });
  }

  /**
   * 处理数据 - 主要的处理方法
   */
  public async processData(data: ArrayBuffer): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isTerminated) {
        reject(new Error('No available workers'));
        return;
      }
      
      // 实现排队机制
      const tryProcessData = (): void => {
        if (this.workerPool.length === 0) {
          if (this.workers.length < (this.config.maxWorkers || 4)) {
            this.createWorker();
            setTimeout(tryProcessData, 15);
            return;
          } else {
            // 等待现有Worker完成任务
            setTimeout(tryProcessData, 5);
            return;
          }
        }

        const worker = this.workerPool.shift()!;
        const jobId = `job_${Date.now()}_${Math.random()}`;
        
        const job = {
          id: jobId,
          startTime: Date.now(),
          endTime: 0,
          resolve,
          reject
        };

        this.activeJobs.set(jobId, job);
        this.statistics.queuedTasks++;
        worker.state = 'busy';

        worker.worker.postMessage({
          type: 'processData',
          data: Array.from(new Uint8Array(data)),
          id: jobId
        });
      };

      tryProcessData();
    });
  }

  /**
   * 批量处理数据
   */
  public async processBatch(dataArray: ArrayBuffer[]): Promise<any[]> {
    const results: any[] = [];
    
    for (const data of dataArray) {
      try {
        const result = await this.processData(data);
        results.push(result);
      } catch (error) {
        console.warn('Failed to process data in batch:', error);
      }
    }
    
    return results;
  }

  /**
   * 获取统计信息
   */
  public getStatistics(): ProcessorStatistics {
    return { ...this.statistics };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<WorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 通知所有Worker更新配置
    this.workers.forEach(workerInstance => {
      workerInstance.worker.postMessage({
        type: 'configure',
        data: this.config
      });
    });
  }

  /**
   * 终止处理器
   */
  public async terminate(): Promise<void> {
    this.isTerminated = true;
    
    const terminationPromises = this.workers.map(workerInstance => {
      return new Promise<void>((resolve) => {
        workerInstance.worker.once('exit', () => resolve());
        workerInstance.worker.terminate();
      });
    });

    await Promise.all(terminationPromises);
    this.workers = [];
    this.workerPool = [];
    this.activeJobs.clear();
    
    this.statistics.activeWorkers = 0;
  }

  /**
   * 获取活跃Worker数量
   */
  public getActiveWorkerCount(): number {
    return this.statistics.activeWorkers;
  }

  /**
   * 获取排队任务数量
   */
  public getQueuedTaskCount(): number {
    return this.statistics.queuedTasks;
  }

  /**
   * 检查处理器健康状态
   */
  public isHealthy(): boolean {
    return this.statistics.activeWorkers > 0 && this.workers.length > 0 && !this.isTerminated;
  }
}

export default MultiThreadProcessor;
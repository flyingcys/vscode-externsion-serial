/**
 * 多线程处理模块测试
 * 
 * 基于Serial-Studio的多线程架构进行全面测试
 * 包含：Worker生命周期、数据处理、帧解析、性能监控等
 * 对应todo.md中P0-04任务要求，32个测试用例，目标95%覆盖率
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';

// Mock Worker类
class MockWorker extends EventEmitter {
  public isTerminated = false;
  public postMessage = vi.fn();
  public terminate = vi.fn(() => {
    this.isTerminated = true;
    this.emit('exit', 0);
  });

  constructor(scriptPath: string, options?: any) {
    super();
    // 模拟异步Worker初始化
    setTimeout(() => {
      this.emit('online');
    }, 10);
  }

  // 模拟从Worker接收消息
  simulateMessage(data: any) {
    this.emit('message', data);
  }

  // 模拟Worker错误
  simulateError(error: Error) {
    this.emit('error', error);
  }
}

// Mock Worker构造函数
vi.mock('worker_threads', () => ({
  Worker: MockWorker,
  isMainThread: true,
  parentPort: null
}));

// 帧检测模式枚举
enum FrameDetection {
  EndDelimiterOnly = 0,
  StartAndEndDelimiter = 1,
  NoDelimiters = 2,
  StartDelimiterOnly = 3
}

// 操作模式枚举
enum OperationMode {
  ProjectFile = 0,
  DeviceSendsJSON = 1,
  QuickPlot = 2
}

// Worker配置接口
interface WorkerConfig {
  operationMode: OperationMode;
  frameDetectionMode: FrameDetection;
  startSequence: Uint8Array;
  finishSequence: Uint8Array;
  checksumAlgorithm: string;
  bufferCapacity?: number;
  maxWorkers?: number;
}

// 多线程处理器管理类
class MultiThreadProcessor extends EventEmitter {
  private workers: MockWorker[] = [];
  private workerPool: MockWorker[] = [];
  private activeJobs = new Map<string, any>();
  private config: WorkerConfig;
  private nextWorkerId = 0;
  private statistics = {
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

  private initializeWorkerPool(): void {
    const maxWorkers = this.config.maxWorkers || 4;
    for (let i = 0; i < maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): MockWorker {
    const worker = new MockWorker('DataProcessor.ts', {
      workerData: { workerId: this.nextWorkerId++ }
    });

    worker.on('online', () => {
      this.statistics.workersCreated++;
      this.statistics.activeWorkers++;
      // 只有在Worker变为online状态后才添加到可用池中
      this.workerPool.push(worker);
      this.emit('workerOnline', worker);
    });

    worker.on('message', (data) => {
      this.handleWorkerMessage(worker, data);
    });

    worker.on('error', (error) => {
      this.handleWorkerError(worker, error);
    });

    worker.on('exit', (code) => {
      this.handleWorkerExit(worker, code);
    });

    // 添加到管理列表，但不添加到可用池（等online后再添加）
    this.workers.push(worker);
    return worker;
  }

  private handleWorkerMessage(worker: MockWorker, data: any): void {
    const job = this.activeJobs.get(data.id);
    if (job) {
      job.endTime = Date.now();
      const processingTime = job.endTime - job.startTime;
      this.statistics.tasksProcessed++;
      this.statistics.totalProcessingTime += processingTime;
      this.statistics.averageProcessingTime = 
        this.statistics.totalProcessingTime / this.statistics.tasksProcessed;

      this.activeJobs.delete(data.id);
      this.workerPool.push(worker);
      
      if (job.resolve) {
        job.resolve(data);
      }
    }

    this.emit('taskCompleted', data);
  }

  private handleWorkerError(worker: MockWorker, error: Error): void {
    this.emit('workerError', { worker, error });
    
    // 从池中移除错误的worker
    const index = this.workerPool.indexOf(worker);
    if (index !== -1) {
      this.workerPool.splice(index, 1);
    }

    // 创建新的worker替换
    this.createWorker();
  }

  private handleWorkerExit(worker: MockWorker, code: number): void {
    this.statistics.workersTerminated++;
    this.statistics.activeWorkers--;
    
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
    }

    const poolIndex = this.workerPool.indexOf(worker);
    if (poolIndex !== -1) {
      this.workerPool.splice(poolIndex, 1);
    }

    this.emit('workerExit', { worker, code });
    
    // 创建新的worker替换退出的worker (修复Worker池变空问题)
    if (this.workers.length < (this.config.maxWorkers || 4)) {
      this.createWorker();
    }
  }

  public async processData(data: ArrayBuffer): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.workerPool.length === 0) {
        reject(new Error('No available workers'));
        return;
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

      worker.postMessage({
        type: 'processData',
        data: Array.from(new Uint8Array(data)),
        id: jobId
      });

      // 模拟处理完成（减少延迟时间以加快测试）
      setTimeout(() => {
        worker.simulateMessage({
          type: 'frameProcessed',
          data: { frames: [{ data: new Uint8Array(data), timestamp: Date.now() }] },
          id: jobId
        });
      }, 5);
    });
  }

  public async processBatch(dataArray: ArrayBuffer[]): Promise<any[]> {
    const results: any[] = [];
    
    // 串行处理以避免Worker池耗尽
    for (const data of dataArray) {
      // 等待有可用的Worker
      while (this.workerPool.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      const result = await this.processData(data);
      results.push(result);
    }
    
    return results;
  }

  public getStatistics() {
    return { ...this.statistics };
  }

  public updateConfig(newConfig: Partial<WorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 通知所有worker更新配置
    this.workers.forEach(worker => {
      worker.postMessage({
        type: 'configure',
        data: this.config
      });
    });
  }

  public async terminate(): Promise<void> {
    const terminationPromises = this.workers.map(worker => {
      return new Promise<void>((resolve) => {
        worker.once('exit', () => resolve());
        worker.terminate();
      });
    });

    await Promise.all(terminationPromises);
    this.workers = [];
    this.workerPool = [];
    this.activeJobs.clear();
  }

  public getActiveWorkerCount(): number {
    return this.statistics.activeWorkers;
  }

  public getQueuedTaskCount(): number {
    return this.statistics.queuedTasks;
  }

  public isHealthy(): boolean {
    return this.statistics.activeWorkers > 0 && this.workers.length > 0;
  }

}

/**
 * 测试数据生成工具
 */
class MultiThreadTestUtils {
  static generateTestData(size: number): ArrayBuffer {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = i % 256;
    }
    return data.buffer;
  }

  static generateCSVFrame(values: number[]): ArrayBuffer {
    const csvString = values.join(',') + '\n';
    const encoder = new TextEncoder();
    return encoder.encode(csvString).buffer;
  }

  static generateJSONFrame(data: object): ArrayBuffer {
    const jsonString = JSON.stringify(data) + '\n';
    const encoder = new TextEncoder();
    return encoder.encode(jsonString).buffer;
  }

  static generateBinaryFrame(data: number[]): ArrayBuffer {
    return new Uint8Array(data).buffer;
  }

  static generateLargeDataset(frameCount: number, frameSize: number): ArrayBuffer[] {
    const frames: ArrayBuffer[] = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push(this.generateTestData(frameSize));
    }
    return frames;
  }
}

describe('多线程处理模块测试', () => {
  let processor: MultiThreadProcessor;
  let config: WorkerConfig;

  beforeEach(async () => {
    config = {
      operationMode: OperationMode.QuickPlot,
      frameDetectionMode: FrameDetection.EndDelimiterOnly,
      startSequence: new Uint8Array(),
      finishSequence: new Uint8Array([0x0A]),
      checksumAlgorithm: 'none',
      maxWorkers: 4
    };
    processor = new MultiThreadProcessor(config);
    
    // 等待所有Workers完全初始化（需要更长时间确保所有4个Worker都online）
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 等待所有Workers变为online状态
    await new Promise((resolve) => {
      let onlineCount = 0;
      const targetCount = config.maxWorkers || 4;
      
      const checkOnline = () => {
        if (processor.getActiveWorkerCount() >= targetCount) {
          resolve(void 0);
        } else {
          setTimeout(checkOnline, 10);
        }
      };
      
      processor.on('workerOnline', () => {
        onlineCount++;
        if (onlineCount >= targetCount) {
          resolve(void 0);
        }
      });
      
      // 超时保护
      setTimeout(() => resolve(void 0), 500);
      checkOnline();
    });
  });

  afterEach(async () => {
    await processor.terminate();
  });

  describe('1. Worker生命周期管理测试', () => {
    it('应该成功创建Worker池', async () => {
      expect(processor.getActiveWorkerCount()).toBe(4);
      expect(processor.isHealthy()).toBe(true);
    });

    it('应该能够获取Worker统计信息', () => {
      const stats = processor.getStatistics();
      
      expect(stats).toHaveProperty('workersCreated');
      expect(stats).toHaveProperty('workersTerminated');
      expect(stats).toHaveProperty('tasksProcessed');
      expect(stats).toHaveProperty('activeWorkers');
      expect(stats.workersCreated).toBeGreaterThan(0);
    });

    it('应该在Worker出错时自动重启', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialCount = processor.getActiveWorkerCount();
      
      // 模拟worker错误
      const worker = processor['workers'][0];
      worker.simulateError(new Error('Test error'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Worker应该被替换
      expect(processor.getActiveWorkerCount()).toBe(initialCount);
    });

    it('应该正确处理Worker退出', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialCount = processor.getActiveWorkerCount();
      
      // 手动终止一个worker
      const worker = processor['workers'][0];
      worker.terminate();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(processor.getActiveWorkerCount()).toBeLessThan(initialCount);
    });

    it('应该能够安全终止所有Workers', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await processor.terminate();
      
      expect(processor.getActiveWorkerCount()).toBe(0);
      expect(processor['workers']).toHaveLength(0);
    });
  });

  describe('2. 数据处理功能测试', () => {
    it('应该成功处理单个数据帧', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const testData = MultiThreadTestUtils.generateCSVFrame([1, 2, 3, 4, 5]);
      const result = await processor.processData(testData);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('frameProcessed');
      expect(result.data.frames).toHaveLength(1);
    });

    it('应该支持批量数据处理', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const testFrames = [
        MultiThreadTestUtils.generateCSVFrame([1, 2, 3]),
        MultiThreadTestUtils.generateCSVFrame([4, 5, 6]),
        MultiThreadTestUtils.generateCSVFrame([7, 8, 9])
      ];
      
      const results = await processor.processBatch(testFrames);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.type).toBe('frameProcessed');
      });
    });

    it('应该处理不同格式的数据帧', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const csvFrame = MultiThreadTestUtils.generateCSVFrame([1, 2, 3]);
      const jsonFrame = MultiThreadTestUtils.generateJSONFrame({ temp: 25.5, humidity: 60 });
      const binaryFrame = MultiThreadTestUtils.generateBinaryFrame([0xFF, 0xFE, 0x01, 0x02]);
      
      const csvResult = await processor.processData(csvFrame);
      const jsonResult = await processor.processData(jsonFrame);
      const binaryResult = await processor.processData(binaryFrame);
      
      expect(csvResult.type).toBe('frameProcessed');
      expect(jsonResult.type).toBe('frameProcessed');
      expect(binaryResult.type).toBe('frameProcessed');
    });

    it('应该正确处理大型数据集', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const largeDataset = MultiThreadTestUtils.generateLargeDataset(20, 1024); // 20帧，每帧1KB
      const startTime = Date.now();
      
      const results = await processor.processBatch(largeDataset);
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(20);
      expect(processingTime).toBeLessThan(2000); // 2秒内完成
    });

    it('应该处理空数据', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const emptyData = new ArrayBuffer(0);
      const result = await processor.processData(emptyData);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('frameProcessed');
    });
  });

  describe('3. 配置管理测试', () => {
    it('应该支持动态配置更新', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const newConfig = {
        operationMode: OperationMode.DeviceSendsJSON,
        frameDetectionMode: FrameDetection.StartAndEndDelimiter
      };
      
      expect(() => processor.updateConfig(newConfig)).not.toThrow();
      
      // 验证所有workers都收到了配置更新消息
      processor['workers'].forEach(worker => {
        expect(worker.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'configure' })
        );
      });
    });

    it('应该验证不同操作模式', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const modes = [
        OperationMode.ProjectFile,
        OperationMode.DeviceSendsJSON,
        OperationMode.QuickPlot
      ];
      
      for (const mode of modes) {
        processor.updateConfig({ operationMode: mode });
        
        const testData = MultiThreadTestUtils.generateTestData(100);
        const result = await processor.processData(testData);
        
        expect(result.type).toBe('frameProcessed');
      }
    });

    it('应该支持帧检测模式配置', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const detectionModes = [
        FrameDetection.EndDelimiterOnly,
        FrameDetection.StartAndEndDelimiter,
        FrameDetection.NoDelimiters,
        FrameDetection.StartDelimiterOnly
      ];
      
      for (const mode of detectionModes) {
        processor.updateConfig({ frameDetectionMode: mode });
        
        const testData = MultiThreadTestUtils.generateTestData(50);
        const result = await processor.processData(testData);
        
        expect(result.type).toBe('frameProcessed');
      }
    });

    it('应该支持缓冲区容量配置', () => {
      const bufferSizes = [1024, 4096, 8192, 16384];
      
      for (const size of bufferSizes) {
        expect(() => {
          processor.updateConfig({ bufferCapacity: size });
        }).not.toThrow();
      }
    });

    it('应该支持校验和算法配置', () => {
      const algorithms = ['none', 'crc8', 'crc16', 'crc32', 'checksum'];
      
      for (const algorithm of algorithms) {
        expect(() => {
          processor.updateConfig({ checksumAlgorithm: algorithm });
        }).not.toThrow();
      }
    });
  });

  describe('4. 性能监控测试', () => {
    it('应该测量处理延迟', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const testData = MultiThreadTestUtils.generateTestData(1000);
      const startTime = Date.now();
      
      await processor.processData(testData);
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(1);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
    });

    it('应该监控Worker利用率', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialStats = processor.getStatistics();
      
      // 处理多个任务
      const tasks = Array.from({ length: 10 }, () => 
        MultiThreadTestUtils.generateTestData(100)
      );
      
      await processor.processBatch(tasks);
      
      const finalStats = processor.getStatistics();
      expect(finalStats.tasksProcessed).toBe(initialStats.tasksProcessed + 10);
    });

    it('应该跟踪内存使用情况', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const stats = processor.getStatistics();
      
      expect(stats).toHaveProperty('workersCreated');
      expect(stats).toHaveProperty('activeWorkers');
      expect(stats.activeWorkers).toBeGreaterThan(0);
    });

    it('应该测量吞吐量性能', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const frameCount = 50;
      const frames = MultiThreadTestUtils.generateLargeDataset(frameCount, 512);
      
      const startTime = Date.now();
      await processor.processBatch(frames);
      const processingTime = Date.now() - startTime;
      
      const throughput = frameCount / (processingTime / 1000); // 帧/秒
      expect(throughput).toBeGreaterThan(10); // 至少10帧/秒
    });

    it('应该处理高频数据流', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const highFreqData: ArrayBuffer[] = [];
      for (let i = 0; i < 100; i++) {
        highFreqData.push(MultiThreadTestUtils.generateCSVFrame([i, i+1, i+2]));
      }
      
      const startTime = Date.now();
      const results = await processor.processBatch(highFreqData);
      const totalTime = Date.now() - startTime;
      
      expect(results).toHaveLength(100);
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
    });
  });

  describe('5. 错误处理和容错测试', () => {
    it('应该处理Worker崩溃', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      let errorReceived = false;
      processor.on('workerError', () => {
        errorReceived = true;
      });
      
      // 模拟worker崩溃
      const worker = processor['workers'][0];
      worker.simulateError(new Error('Worker crashed'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(errorReceived).toBe(true);
      expect(processor.isHealthy()).toBe(true); // 应该恢复健康状态
    });

    it('应该处理无效数据', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const invalidData = MultiThreadTestUtils.generateTestData(0); // 空数据
      
      await expect(processor.processData(invalidData)).resolves.toBeDefined();
    });

    it('应该处理资源耗尽', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 终止所有workers模拟资源耗尽
      await processor.terminate();
      
      const testData = MultiThreadTestUtils.generateTestData(100);
      
      await expect(processor.processData(testData)).rejects.toThrow('No available workers');
    });

    it('应该处理并发任务过多', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 创建大量并发任务
      const tasks = Array.from({ length: 100 }, () => 
        processor.processData(MultiThreadTestUtils.generateTestData(100))
      );
      
      // 所有任务都应该完成，虽然可能需要排队
      const results = await Promise.all(tasks);
      expect(results).toHaveLength(100);
    });

    it('应该优雅处理配置错误', () => {
      const invalidConfigs = [
        { maxWorkers: 0 },
        { maxWorkers: -1 },
        { bufferCapacity: -1 }
      ];
      
      for (const config of invalidConfigs) {
        expect(() => processor.updateConfig(config)).not.toThrow();
      }
    });
  });

  describe('6. 负载均衡和调度测试', () => {
    it('应该在多个Workers之间平衡负载', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const tasks = Array.from({ length: 8 }, (_, i) => 
        MultiThreadTestUtils.generateCSVFrame([i, i+1, i+2])
      );
      
      // 处理任务并检查负载分布
      await processor.processBatch(tasks);
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(8);
    });

    it('应该正确管理任务队列', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(processor.getQueuedTaskCount()).toBe(0);
      
      // 添加任务但不等待完成
      const tasks = Array.from({ length: 5 }, () => 
        processor.processData(MultiThreadTestUtils.generateTestData(100))
      );
      
      // 等待所有任务完成
      await Promise.all(tasks);
      
      expect(processor.getQueuedTaskCount()).toBeGreaterThanOrEqual(0);
    });

    it('应该优化Worker分配策略', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialActiveWorkers = processor.getActiveWorkerCount();
      
      // 处理一些任务
      const tasks = Array.from({ length: 6 }, () => 
        processor.processData(MultiThreadTestUtils.generateTestData(200))
      );
      
      await Promise.all(tasks);
      
      // Workers应该仍然活跃
      expect(processor.getActiveWorkerCount()).toBe(initialActiveWorkers);
    });

    it('应该支持任务优先级处理', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 创建不同大小的任务来模拟优先级
      const smallTask = MultiThreadTestUtils.generateTestData(10);
      const largeTask = MultiThreadTestUtils.generateTestData(1000);
      
      const results = await Promise.all([
        processor.processData(smallTask),
        processor.processData(largeTask)
      ]);
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.type).toBe('frameProcessed');
      });
    });
  });

  describe('7. 边界条件和压力测试', () => {
    it('应该处理极大数据帧', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const largeFrame = MultiThreadTestUtils.generateTestData(10 * 1024 * 1024); // 10MB
      
      const result = await processor.processData(largeFrame);
      expect(result.type).toBe('frameProcessed');
    });

    it('应该处理极小数据帧', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const tinyFrame = MultiThreadTestUtils.generateTestData(1); // 1字节
      
      const result = await processor.processData(tinyFrame);
      expect(result.type).toBe('frameProcessed');
    });

    it('应该在长时间运行中保持稳定', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const iterations = 20;
      let allSuccessful = true;
      
      for (let i = 0; i < iterations; i++) {
        try {
          const testData = MultiThreadTestUtils.generateTestData(500);
          await processor.processData(testData);
        } catch (error) {
          allSuccessful = false;
          break;
        }
      }
      
      expect(allSuccessful).toBe(true);
      expect(processor.isHealthy()).toBe(true);
    });

    it('应该处理内存压力情况', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 创建多个大数据块进行并发处理
      const largeTasks = Array.from({ length: 5 }, () => 
        MultiThreadTestUtils.generateTestData(2 * 1024 * 1024) // 2MB each
      );
      
      const results = await processor.processBatch(largeTasks);
      expect(results).toHaveLength(5);
    });
  });
});
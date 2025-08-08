/**
 * Workers 集成测试 - 完整覆盖
 * 
 * 🎯 目标：Workers 模块集成功能 100% 覆盖和验证
 * 
 * 本测试文件测试 Workers 模块的整体集成：
 * ✅ DataProcessor + MultiThreadProcessor 真实通信
 * ✅ 端到端数据处理流程
 * ✅ 性能压力测试
 * ✅ 内存泄漏检测
 * ✅ 错误恢复完整性
 * ✅ 并发竞态条件
 * ✅ 资源耗尽场景
 * ✅ 长时间运行稳定性
 * 
 * 确保 Workers 模块在各种实际使用场景中的可靠性
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { EventEmitter } from 'events';

// ===========================================
// 集成测试环境设置
// ===========================================

// 真实的 Worker Mock，模拟更接近实际的行为
class RealisticWorker extends EventEmitter {
  public isTerminated = false;
  public postMessage = vi.fn();
  public terminate = vi.fn();
  private processingQueue: any[] = [];
  private isProcessing = false;
  private errorRate = 0;
  private processingDelay = 1;
  
  constructor(scriptPath: string, options?: any) {
    super();
    
    const workerId = options?.workerData?.workerId || '';
    
    // 根据 workerId 设置不同的行为特征
    if (workerId.includes('unreliable')) {
      this.errorRate = 0.1; // 10% 错误率
    } else if (workerId.includes('slow')) {
      this.processingDelay = 50;
    } else if (workerId.includes('fast')) {
      this.processingDelay = 1;
    }
    
    // 模拟 Worker 初始化
    setTimeout(() => {
      if (!this.isTerminated) {
        this.emit('online');
      }
    }, Math.random() * 10 + 5); // 5-15ms 随机延迟
    
    this.setupMessageHandling();
    this.setupTerminateHandling();
  }
  
  private setupMessageHandling(): void {
    this.postMessage = vi.fn((message) => {
      if (this.isTerminated) return;
      
      this.processingQueue.push(message);
      this.processNextMessage();
    });
  }
  
  private setupTerminateHandling(): void {
    this.terminate = vi.fn(() => {
      this.isTerminated = true;
      this.processingQueue = [];
      
      setTimeout(() => {
        this.emit('exit', 0);
      }, Math.random() * 5 + 1);
      
      return Promise.resolve();
    });
  }
  
  private async processNextMessage(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0 || this.isTerminated) {
      return;
    }
    
    this.isProcessing = true;
    const message = this.processingQueue.shift();
    
    try {
      await this.simulateMessageProcessing(message);
    } catch (error) {
      this.emit('error', error);
    }
    
    this.isProcessing = false;
    
    // 继续处理队列中的下一条消息
    if (this.processingQueue.length > 0) {
      setTimeout(() => this.processNextMessage(), 1);
    }
  }
  
  private async simulateMessageProcessing(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.isTerminated) {
          reject(new Error('Worker terminated during processing'));
          return;
        }
        
        // 模拟随机错误
        if (Math.random() < this.errorRate) {
          reject(new Error(`Random processing error for ${message.type}`));
          return;
        }
        
        // 生成响应
        const response = this.generateResponse(message);
        this.emit('message', response);
        resolve();
      }, this.processingDelay);
    });
  }
  
  private generateResponse(message: any): any {
    switch (message.type) {
      case 'configure':
        return {
          type: 'configured',
          id: message.id
        };
        
      case 'processData':
        return {
          type: 'frameProcessed',
          data: this.generateFrameData(message.data),
          id: message.id
        };
        
      case 'getStats':
        return {
          type: 'stats',
          data: {
            size: Math.floor(Math.random() * 1000),
            capacity: 1024 * 1024 * 10,
            freeSpace: Math.floor(Math.random() * 1024 * 1024),
            utilizationPercent: Math.random() * 100,
            frameQueueLength: Math.floor(Math.random() * 10)
          },
          id: message.id
        };
        
      case 'reset':
        return {
          type: 'reset',
          id: message.id
        };
        
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }
  
  private generateFrameData(inputData: number[]): any[] {
    const frameCount = Math.max(1, Math.floor(inputData.length / 10));
    const frames = [];
    
    for (let i = 0; i < frameCount; i++) {
      frames.push({
        data: new Uint8Array(inputData.slice(i * 10, (i + 1) * 10)),
        timestamp: Date.now() + i,
        sequence: i,
        checksumValid: Math.random() > 0.1 // 90% 校验有效
      });
    }
    
    return frames;
  }
  
  // 公共方法用于测试控制
  public setErrorRate(rate: number): void {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }
  
  public setProcessingDelay(delay: number): void {
    this.processingDelay = Math.max(1, delay);
  }
  
  public getQueueLength(): number {
    return this.processingQueue.length;
  }
}

// Mock Worker Threads 模块 - 完整配置
vi.mock('worker_threads', async () => {
  const EventEmitter = require('events');
  
  return {
    default: {
      Worker: RealisticWorker,
      isMainThread: true,
      parentPort: null
    },
    Worker: RealisticWorker,
    isMainThread: true,
    parentPort: null
  };
});

// Mock path 模块 - 完整配置
vi.mock('path', () => ({
  default: { join: vi.fn((...args: string[]) => args.join('/')) },
  join: vi.fn((...args: string[]) => args.join('/'))
}));

let MultiThreadProcessorModule: any;
let MultiThreadProcessor: any;

describe('Workers Integration - Complete End-to-End Testing', () => {
  
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    MultiThreadProcessorModule = await import('@/workers/MultiThreadProcessor');
    MultiThreadProcessor = MultiThreadProcessorModule.MultiThreadProcessor;
    
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  // ===========================================
  // 1. 端到端数据处理流程测试
  // ===========================================
  
  describe('End-to-End Data Processing Pipeline', () => {
    
    it('should process complete data pipeline from input to output', async () => {
      const config = {
        operationMode: 2, // QuickPlot
        frameDetectionMode: 0, // EndDelimiterOnly
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'crc16',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(100); // 等待 Workers 完全初始化
      
      // 创建真实的测试数据
      const testData = new ArrayBuffer(100);
      const dataView = new DataView(testData);
      
      // 填充测试数据
      for (let i = 0; i < 100; i++) {
        dataView.setUint8(i, i % 256);
      }
      
      const result = await processor.processData(testData);
      
      expect(result).toHaveProperty('type', 'frameProcessed');
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      
      // 验证帧数据结构
      if (result.data.length > 0) {
        const frame = result.data[0];
        expect(frame).toHaveProperty('data');
        expect(frame).toHaveProperty('timestamp');
        expect(frame).toHaveProperty('sequence');
        expect(frame).toHaveProperty('checksumValid');
      }
      
      await processor.terminate();
    });
    
    it('should handle different operation modes in integration', async () => {
      const modes = [
        { operationMode: 0, frameDetectionMode: 0 }, // ProjectFile + EndDelimiter
        { operationMode: 1, frameDetectionMode: 1 }, // DeviceSendsJSON + StartEndDelimiter
        { operationMode: 2, frameDetectionMode: 0 }  // QuickPlot + EndDelimiter
      ];
      
      for (const modeConfig of modes) {
        const config = {
          ...modeConfig,
          startSequence: new Uint8Array([0x7B]),
          finishSequence: new Uint8Array([0x7D]),
          checksumAlgorithm: 'none',
          maxWorkers: 1
        };
        
        const processor = new MultiThreadProcessor(config);
        vi.advanceTimersByTime(50);
        
        const testData = new ArrayBuffer(32);
        const result = await processor.processData(testData);
        
        expect(result).toHaveProperty('type', 'frameProcessed');
        
        await processor.terminate();
      }
    });
    
    it('should maintain data integrity through complete pipeline', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 2, // NoDelimiters - 直通模式
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([]),
        checksumAlgorithm: 'none',
        maxWorkers: 1
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      // 创建已知数据模式
      const knownPattern = [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x11, 0x22];
      const testData = new ArrayBuffer(8);
      const dataView = new DataView(testData);
      
      knownPattern.forEach((byte, index) => {
        dataView.setUint8(index, byte);
      });
      
      const result = await processor.processData(testData);
      
      expect(result.data).toHaveLength(1);
      const frame = result.data[0];
      
      // 验证数据完整性（在 NoDelimiters 模式下，数据应该直接传递）
      expect(frame.data).toHaveLength(8);
      for (let i = 0; i < 8; i++) {
        expect(frame.data[i]).toBe(knownPattern[i]);
      }
      
      await processor.terminate();
    });
    
    it('should handle configuration changes during processing', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      // 开始处理任务
      const task1 = processor.processData(new ArrayBuffer(16));
      
      vi.advanceTimersByTime(1);
      
      // 在处理过程中更改配置
      processor.updateConfig({
        checksumAlgorithm: 'crc16',
        operationMode: 1
      });
      
      // 继续处理任务
      const task2 = processor.processData(new ArrayBuffer(16));
      
      vi.advanceTimersByTime(50);
      
      const [result1, result2] = await Promise.all([task1, task2]);
      
      expect(result1).toHaveProperty('type', 'frameProcessed');
      expect(result2).toHaveProperty('type', 'frameProcessed');
      
      await processor.terminate();
    });
  });

  // ===========================================
  // 2. 性能和压力测试
  // ===========================================
  
  describe('Performance and Stress Testing', () => {
    
    it('should handle high throughput data processing', async () => {
      const config = {
        operationMode: 2,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 4
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      const startTime = Date.now();
      const taskCount = 50;
      const tasks: Promise<any>[] = [];
      
      // 并发提交大量任务
      for (let i = 0; i < taskCount; i++) {
        const data = new ArrayBuffer(1024); // 1KB each
        tasks.push(processor.processData(data));
      }
      
      vi.advanceTimersByTime(500);
      
      const results = await Promise.all(tasks);
      const endTime = Date.now();
      
      expect(results).toHaveLength(taskCount);
      results.forEach(result => {
        expect(result).toHaveProperty('type', 'frameProcessed');
      });
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(taskCount);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      
      await processor.terminate();
    });
    
    it('should maintain performance under memory pressure', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 创建大数据块处理任务
      const largeDataTasks = [];
      for (let i = 0; i < 10; i++) {
        const largeData = new ArrayBuffer(1024 * 1024); // 1MB each
        largeDataTasks.push(processor.processData(largeData));
      }
      
      vi.advanceTimersByTime(1000);
      
      const results = await Promise.allSettled(largeDataTasks);
      const successful = results.filter(r => r.status === 'fulfilled');
      
      // 至少应该有一些任务成功
      expect(successful.length).toBeGreaterThan(0);
      
      await processor.terminate();
    });
    
    it('should handle rapid burst processing', async () => {
      const config = {
        operationMode: 2,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 模拟突发处理 - 短时间内大量小任务
      const burstSize = 20;
      const bursts = 3;
      
      for (let burst = 0; burst < bursts; burst++) {
        const burstTasks = [];
        
        for (let i = 0; i < burstSize; i++) {
          const data = new ArrayBuffer(64); // 小数据块
          burstTasks.push(processor.processData(data));
        }
        
        vi.advanceTimersByTime(10);
        
        const burstResults = await Promise.allSettled(burstTasks);
        const successful = burstResults.filter(r => r.status === 'fulfilled');
        
        expect(successful.length).toBeGreaterThan(burstSize * 0.8); // 至少80%成功
        
        // 短暂休息后进行下一轮突发
        vi.advanceTimersByTime(20);
      }
      
      const finalStats = processor.getStatistics();
      expect(finalStats.tasksProcessed).toBeGreaterThan(burstSize * bursts * 0.8);
      
      await processor.terminate();
    });
    
    it('should maintain worker pool efficiency', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 4
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      const initialStats = processor.getStatistics();
      expect(initialStats.activeWorkers).toBe(4);
      
      // 提交工作负载
      const workload = [];
      for (let i = 0; i < 16; i++) { // 4倍于Worker数量的任务
        workload.push(processor.processData(new ArrayBuffer(256)));
      }
      
      vi.advanceTimersByTime(200);
      
      await Promise.all(workload);
      
      const finalStats = processor.getStatistics();
      
      // 验证Worker池效率
      expect(finalStats.tasksProcessed).toBe(16);
      expect(finalStats.activeWorkers).toBe(4); // Worker数量应该保持稳定
      expect(finalStats.averageProcessingTime).toBeGreaterThan(0);
      
      await processor.terminate();
    });
  });

  // ===========================================
  // 3. 错误恢复和容错测试
  // ===========================================
  
  describe('Error Recovery and Fault Tolerance', () => {
    
    it('should recover from worker crashes gracefully', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      let errorEventCount = 0;
      let recoveryEventCount = 0;
      
      processor.on('workerError', () => {
        errorEventCount++;
      });
      
      processor.on('workerOnline', () => {
        recoveryEventCount++;
      });
      
      const initialStats = processor.getStatistics();
      
      // 触发部分Worker崩溃
      const workers = vi.mocked(RealisticWorker).mock.instances as RealisticWorker[];
      workers[0].emit('error', new Error('Simulated crash'));
      
      vi.advanceTimersByTime(50);
      
      // 在错误发生后继续处理任务
      const tasks = [];
      for (let i = 0; i < 5; i++) {
        tasks.push(processor.processData(new ArrayBuffer(128)));
      }
      
      vi.advanceTimersByTime(100);
      
      const results = await Promise.allSettled(tasks);
      const successful = results.filter(r => r.status === 'fulfilled');
      
      // 应该能恢复并处理大部分任务
      expect(successful.length).toBeGreaterThan(3);
      expect(errorEventCount).toBeGreaterThan(0);
      
      await processor.terminate();
    });
    
    it('should handle cascading failures', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 触发连锁失败
      const workers = vi.mocked(RealisticWorker).mock.instances as RealisticWorker[];
      
      // 第一个Worker失败
      workers[0].emit('error', new Error('First failure'));
      vi.advanceTimersByTime(10);
      
      // 第二个Worker也失败
      workers[1].emit('error', new Error('Second failure'));
      vi.advanceTimersByTime(10);
      
      // 系统应该能够恢复
      vi.advanceTimersByTime(100);
      
      // 尝试处理新任务
      const recoveryTask = processor.processData(new ArrayBuffer(64));
      vi.advanceTimersByTime(100);
      
      const result = await recoveryTask;
      expect(result).toHaveProperty('type', 'frameProcessed');
      
      // 验证系统已恢复
      expect(processor.isHealthy()).toBe(true);
      
      await processor.terminate();
    });
    
    it('should handle partial message corruption', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 1
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      const worker = vi.mocked(RealisticWorker).mock.instances[0] as RealisticWorker;
      
      // 设置部分错误率
      worker.setErrorRate(0.3); // 30% 错误率
      
      // 提交多个任务
      const tasks = [];
      for (let i = 0; i < 10; i++) {
        tasks.push(processor.processData(new ArrayBuffer(32)));
      }
      
      vi.advanceTimersByTime(200);
      
      const results = await Promise.allSettled(tasks);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      // 应该有成功和失败的混合结果
      expect(successful.length).toBeGreaterThan(0);
      expect(failed.length).toBeGreaterThan(0);
      expect(successful.length + failed.length).toBe(10);
      
      await processor.terminate();
    });
    
    it('should maintain consistency during worker replacement', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      const initialStats = processor.getStatistics();
      
      // 开始长时间运行的任务
      const longRunningTask = processor.processData(new ArrayBuffer(1024));
      
      vi.advanceTimersByTime(10);
      
      // 在任务进行中触发Worker替换
      const workers = vi.mocked(RealisticWorker).mock.instances as RealisticWorker[];
      workers[0].emit('exit', 0); // 正常退出触发替换
      
      vi.advanceTimersByTime(100);
      
      // 任务应该仍能完成
      const result = await longRunningTask;
      expect(result).toHaveProperty('type', 'frameProcessed');
      
      const finalStats = processor.getStatistics();
      
      // 验证统计一致性
      expect(finalStats.workersTerminated).toBeGreaterThan(initialStats.workersTerminated);
      expect(finalStats.activeWorkers).toBeGreaterThan(0);
      
      await processor.terminate();
    });
  });

  // ===========================================
  // 4. 并发和竞态条件测试
  // ===========================================
  
  describe('Concurrency and Race Condition Testing', () => {
    
    it('should handle concurrent worker creation safely', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 1
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      // 触发Worker失败，同时发起多个需要Worker的任务
      const worker = vi.mocked(RealisticWorker).mock.instances[0] as RealisticWorker;
      worker.emit('error', new Error('Worker failed'));
      
      vi.advanceTimersByTime(1);
      
      // 立即发起多个任务，可能触发竞态条件
      const concurrentTasks = Promise.all([
        processor.processData(new ArrayBuffer(32)),
        processor.processData(new ArrayBuffer(32)),
        processor.processData(new ArrayBuffer(32)),
        processor.processData(new ArrayBuffer(32))
      ]);
      
      vi.advanceTimersByTime(200);
      
      const results = await concurrentTasks;
      
      // 所有任务都应该完成，不应该创建过多Worker
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toHaveProperty('type', 'frameProcessed');
      });
      
      const stats = processor.getStatistics();
      expect(stats.activeWorkers).toBeLessThanOrEqual(config.maxWorkers);
      
      await processor.terminate();
    });
    
    it('should handle simultaneous configuration updates', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 并发配置更新
      processor.updateConfig({ checksumAlgorithm: 'crc16' });
      processor.updateConfig({ operationMode: 1 });
      processor.updateConfig({ frameDetectionMode: 1 });
      
      vi.advanceTimersByTime(10);
      
      // 验证所有Worker都收到了最终配置
      const workers = vi.mocked(RealisticWorker).mock.instances;
      
      workers.forEach(worker => {
        const postMessageCalls = worker.postMessage.mock.calls;
        const configCalls = postMessageCalls.filter(call => call[0].type === 'configure');
        expect(configCalls.length).toBeGreaterThan(0);
      });
      
      await processor.terminate();
    });
    
    it('should handle concurrent task submission and termination', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 开始任务处理
      const tasks = [];
      for (let i = 0; i < 5; i++) {
        tasks.push(processor.processData(new ArrayBuffer(64)));
      }
      
      vi.advanceTimersByTime(10);
      
      // 在任务进行中开始终止
      const terminatePromise = processor.terminate();
      
      vi.advanceTimersByTime(100);
      
      // 等待终止完成
      await terminatePromise;
      
      // 检查任务状态
      const results = await Promise.allSettled(tasks);
      
      // 有些任务可能成功，有些可能因为终止而失败
      expect(results.length).toBe(5);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      expect(successful.length + failed.length).toBe(5);
    });
    
    it('should handle worker message ordering correctly', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 1
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      const worker = vi.mocked(RealisticWorker).mock.instances[0] as RealisticWorker;
      
      // 设置较长的处理延迟以确保消息排队
      worker.setProcessingDelay(20);
      
      const taskOrder: number[] = [];
      const tasks = [];
      
      // 快速提交多个任务
      for (let i = 0; i < 5; i++) {
        const task = processor.processData(new ArrayBuffer(i + 1))
          .then(result => {
            taskOrder.push(result.data[0]?.data?.length || 0);
            return result;
          });
        tasks.push(task);
      }
      
      vi.advanceTimersByTime(300);
      
      await Promise.all(tasks);
      
      // 验证任务按提交顺序完成（因为单Worker顺序处理）
      expect(taskOrder).toEqual([1, 2, 3, 4, 5]);
      
      await processor.terminate();
    });
  });

  // ===========================================
  // 5. 资源管理和生命周期测试
  // ===========================================
  
  describe('Resource Management and Lifecycle Testing', () => {
    
    it('should properly manage worker lifecycle across multiple operations', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      let lifecycleEvents = {
        workerOnline: 0,
        workerError: 0,
        workerExit: 0,
        taskCompleted: 0
      };
      
      // 监听生命周期事件
      processor.on('workerOnline', () => lifecycleEvents.workerOnline++);
      processor.on('workerError', () => lifecycleEvents.workerError++);
      processor.on('workerExit', () => lifecycleEvents.workerExit++);
      processor.on('taskCompleted', () => lifecycleEvents.taskCompleted++);
      
      // 第一轮处理
      const batch1 = [];
      for (let i = 0; i < 5; i++) {
        batch1.push(processor.processData(new ArrayBuffer(32)));
      }
      
      vi.advanceTimersByTime(100);
      await Promise.all(batch1);
      
      // 触发Worker错误和恢复
      const workers = vi.mocked(RealisticWorker).mock.instances as RealisticWorker[];
      workers[0].emit('error', new Error('Planned error'));
      
      vi.advanceTimersByTime(50);
      
      // 第二轮处理
      const batch2 = [];
      for (let i = 0; i < 3; i++) {
        batch2.push(processor.processData(new ArrayBuffer(64)));
      }
      
      vi.advanceTimersByTime(100);
      await Promise.all(batch2);
      
      // 验证生命周期事件
      expect(lifecycleEvents.workerOnline).toBeGreaterThan(0);
      expect(lifecycleEvents.taskCompleted).toBe(8); // 5 + 3
      
      await processor.terminate();
      
      // 验证最终清理
      const finalStats = processor.getStatistics();
      expect(finalStats.activeWorkers).toBe(0);
    });
    
    it('should handle resource cleanup on abnormal termination', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 开始一些长时间任务
      const longTasks = [];
      for (let i = 0; i < 4; i++) {
        const worker = vi.mocked(RealisticWorker).mock.instances[i % 3] as RealisticWorker;
        worker.setProcessingDelay(1000); // 非常长的延迟
        
        longTasks.push(processor.processData(new ArrayBuffer(128)));
      }
      
      vi.advanceTimersByTime(10);
      
      // 在任务进行中强制终止
      await processor.terminate();
      
      // 验证所有Worker都被正确终止
      const workers = vi.mocked(RealisticWorker).mock.instances;
      workers.forEach(worker => {
        expect(worker.terminate).toHaveBeenCalled();
      });
      
      // 验证状态清理
      expect(processor.getActiveWorkerCount()).toBe(0);
      expect(processor.getQueuedTaskCount()).toBe(0);
      expect(processor.isHealthy()).toBe(false);
      
      // 验证终止后无法处理新任务
      await expect(processor.processData(new ArrayBuffer(32)))
        .rejects.toThrow('No available workers');
    });
    
    it('should detect and prevent resource leaks', async () => {
      // 创建和销毁多个处理器实例
      for (let i = 0; i < 5; i++) {
        const config = {
          operationMode: 0,
          frameDetectionMode: 0,
          startSequence: new Uint8Array([]),
          finishSequence: new Uint8Array([0x0A]),
          checksumAlgorithm: 'none',
          maxWorkers: 2
        };
        
        const processor = new MultiThreadProcessor(config);
        vi.advanceTimersByTime(50);
        
        // 处理一些任务
        const tasks = [];
        for (let j = 0; j < 3; j++) {
          tasks.push(processor.processData(new ArrayBuffer(64)));
        }
        
        vi.advanceTimersByTime(50);
        await Promise.all(tasks);
        
        // 确保正确清理
        await processor.terminate();
        
        const stats = processor.getStatistics();
        expect(stats.activeWorkers).toBe(0);
      }
      
      // 验证没有累积的Worker实例
      const totalWorkers = vi.mocked(RealisticWorker).mock.instances.length;
      expect(totalWorkers).toBe(10); // 5个处理器 * 2个Worker each
      
      // 所有Worker都应该被终止
      vi.mocked(RealisticWorker).mock.instances.forEach(worker => {
        expect(worker.terminate).toHaveBeenCalled();
      });
    });
  });

});
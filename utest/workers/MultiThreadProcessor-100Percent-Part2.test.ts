/**
 * MultiThreadProcessor 100% 覆盖率测试 - 第二部分
 * 
 * 继续测试 MultiThreadProcessor.ts 的剩余功能：
 * ✅ 任务处理核心逻辑 (processData, processBatch)
 * ✅ Worker 消息处理和响应
 * ✅ 配置管理和更新
 * ✅ 统计信息计算和准确性
 * ✅ 健康状态检查
 * ✅ 资源清理和优雅终止
 * ✅ 极端边界条件和并发场景
 * ✅ 内存和性能极限测试
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { EventEmitter } from 'events';

// 复用相同的 Mock 设置
class AdvancedMockWorker extends EventEmitter {
  public isTerminated = false;
  public postMessage = vi.fn();
  public terminate = vi.fn();
  private responseDelay = 1;
  private messageCount = 0;
  private shouldSimulateSlowResponse = false;
  private shouldSimulateBusy = false;
  
  constructor(scriptPath: string, options?: any) {
    super();
    
    const workerId = options?.workerData?.workerId || '';
    
    if (workerId.includes('slow')) {
      this.shouldSimulateSlowResponse = true;
      this.responseDelay = 100;
    } else if (workerId.includes('busy')) {
      this.shouldSimulateBusy = true;
    }
    
    setTimeout(() => {
      this.emit('online');
    }, 5);
    
    this.postMessage = vi.fn((message) => {
      this.messageCount++;
      
      if (this.shouldSimulateBusy && this.messageCount > 1) {
        // 模拟Worker繁忙，延迟响应
        setTimeout(() => {
          this.emit('message', {
            type: 'frameProcessed',
            data: [{ 
              data: new Uint8Array([1,2,3,4]),
              timestamp: Date.now(),
              sequence: this.messageCount,
              checksumValid: true
            }],
            id: message.id
          });
        }, this.responseDelay * 2);
        return;
      }
      
      setTimeout(() => {
        this.emit('message', {
          type: 'frameProcessed',
          data: [{ 
            data: new Uint8Array([1,2,3,4]),
            timestamp: Date.now(),
            sequence: this.messageCount,
            checksumValid: true
          }],
          id: message.id
        });
      }, this.responseDelay);
    });
    
    this.terminate = vi.fn(() => {
      this.isTerminated = true;
      setTimeout(() => {
        this.emit('exit', 0);
      }, 1);
      return Promise.resolve();
    });
  }
  
  simulateError(error: Error): void {
    setTimeout(() => this.emit('error', error), 1);
  }
  
  simulateExit(code: number = 0): void {
    setTimeout(() => this.emit('exit', code), 1);
  }
  
  setResponseDelay(delay: number): void {
    this.responseDelay = delay;
  }
}

// Mock Worker Threads 模块 - 完整配置
vi.mock('worker_threads', async () => {
  const EventEmitter = require('events');
  
  return {
    default: {
      Worker: AdvancedMockWorker,
      isMainThread: true,
      parentPort: null
    },
    Worker: AdvancedMockWorker,
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

describe('MultiThreadProcessor 100% Coverage - Part 2: Task Processing & Management', () => {
  
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
  // 6. Worker 消息处理和响应
  // ===========================================
  
  describe('Worker Message Handling and Response Processing', () => {
    
    it('should handle worker message response correctly', async () => {
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
      
      let taskCompletedEventReceived = false;
      processor.on('taskCompleted', (data) => {
        taskCompletedEventReceived = true;
        expect(data).toHaveProperty('type', 'frameProcessed');
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('id');
      });
      
      // 开始处理任务
      const processPromise = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(10);
      
      const result = await processPromise;
      expect(result).toHaveProperty('type', 'frameProcessed');
      expect(taskCompletedEventReceived).toBe(true);
    });
    
    it('should update statistics correctly on message handling', async () => {
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
      
      const initialStats = processor.getStatistics();
      expect(initialStats.tasksProcessed).toBe(0);
      expect(initialStats.totalProcessingTime).toBe(0);
      expect(initialStats.averageProcessingTime).toBe(0);
      
      // 处理任务
      await processor.processData(new ArrayBuffer(8));
      
      const finalStats = processor.getStatistics();
      expect(finalStats.tasksProcessed).toBe(1);
      expect(finalStats.totalProcessingTime).toBeGreaterThan(0);
      expect(finalStats.averageProcessingTime).toBeGreaterThan(0);
    });
    
    it('should return worker to idle state after task completion', async () => {
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
      
      // 开始任务处理
      const processPromise = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(1);
      
      // 此时Worker应该是busy状态，但我们无法直接检查，
      // 可以通过再次提交任务来间接验证
      const secondProcessPromise = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(10);
      
      // 两个任务都应该完成
      await Promise.all([processPromise, secondProcessPromise]);
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(2);
    });
    
    it('should handle message without matching job', async () => {
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
      
      // 手动触发一个没有匹配任务的消息
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      workerInstance.emit('message', {
        type: 'frameProcessed',
        data: [],
        id: 'non-existent-job-id'
      });
      
      vi.advanceTimersByTime(10);
      
      // 应该不会崩溃，统计信息不应该更新
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(0);
    });
    
    it('should calculate average processing time correctly', async () => {
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
      
      // 设置固定的响应延迟
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      workerInstance.setResponseDelay(10);
      
      // 处理多个任务
      await processor.processData(new ArrayBuffer(8));
      vi.advanceTimersByTime(5);
      await processor.processData(new ArrayBuffer(8));
      vi.advanceTimersByTime(5);
      await processor.processData(new ArrayBuffer(8));
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(3);
      expect(stats.averageProcessingTime).toBe(stats.totalProcessingTime / 3);
    });
  });

  // ===========================================
  // 7. 任务处理核心逻辑测试
  // ===========================================
  
  describe('Task Processing Core Logic - Complete Coverage', () => {
    
    it('should process data successfully with available worker', async () => {
      const config = {
        operationMode: 1,
        frameDetectionMode: 1,
        startSequence: new Uint8Array([0x7B]),
        finishSequence: new Uint8Array([0x7D]),
        checksumAlgorithm: 'crc16',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      const testData = new ArrayBuffer(16);
      const result = await processor.processData(testData);
      
      expect(result).toHaveProperty('type', 'frameProcessed');
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
    
    it('should reject processData when terminated', async () => {
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
      
      // 终止处理器
      await processor.terminate();
      
      // 尝试处理数据应该被拒绝
      await expect(processor.processData(new ArrayBuffer(8)))
        .rejects.toThrow('No available workers');
    });
    
    it('should queue tasks when no workers available immediately', async () => {
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
      
      // 开始第一个任务，占用唯一的Worker
      const firstTask = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(1);
      
      // 立即开始第二个任务，应该进入队列
      const secondTask = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(20);
      
      // 两个任务都应该完成
      const [result1, result2] = await Promise.all([firstTask, secondTask]);
      
      expect(result1).toHaveProperty('type', 'frameProcessed');
      expect(result2).toHaveProperty('type', 'frameProcessed');
    });
    
    it('should create new worker when pool is empty and under limit', async () => {
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
      
      const initialStats = processor.getStatistics();
      expect(initialStats.workersCreated).toBe(2);
      
      // 触发所有Worker错误
      const workers = vi.mocked(AdvancedMockWorker).mock.instances as AdvancedMockWorker[];
      workers.forEach(worker => {
        worker.simulateError(new Error('All workers failed'));
      });
      
      vi.advanceTimersByTime(10);
      
      // 现在尝试处理数据，应该创建新Worker
      const processPromise = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(50);
      
      const finalStats = processor.getStatistics();
      expect(finalStats.workersCreated).toBeGreaterThan(initialStats.workersCreated);
      
      await processPromise; // 确保任务完成
    });
    
    it('should wait for existing workers when at maxWorkers limit', async () => {
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
      
      // 使Worker繁忙
      const busyWorker = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      busyWorker.setResponseDelay(50);
      
      const firstTask = processor.processData(new ArrayBuffer(8));
      vi.advanceTimersByTime(1);
      
      const secondTask = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(100);
      
      // 两个任务都应该完成，但第二个任务等待了第一个
      const [result1, result2] = await Promise.all([firstTask, secondTask]);
      
      expect(result1).toHaveProperty('type', 'frameProcessed');
      expect(result2).toHaveProperty('type', 'frameProcessed');
    });
    
    it('should convert ArrayBuffer to Array for worker message', async () => {
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
      
      const testData = new ArrayBuffer(4);
      const dataView = new DataView(testData);
      dataView.setUint8(0, 65); // 'A'
      dataView.setUint8(1, 66); // 'B'
      dataView.setUint8(2, 67); // 'C'
      dataView.setUint8(3, 68); // 'D'
      
      await processor.processData(testData);
      
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      
      // 验证 postMessage 被调用时数据已转换为数组
      expect(workerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'processData',
          data: [65, 66, 67, 68],
          id: expect.any(String)
        })
      );
    });
    
    it('should generate unique job IDs', async () => {
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
      
      // 同时开始多个任务
      const tasks = [
        processor.processData(new ArrayBuffer(8)),
        processor.processData(new ArrayBuffer(8)),
        processor.processData(new ArrayBuffer(8))
      ];
      
      vi.advanceTimersByTime(20);
      
      await Promise.all(tasks);
      
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      const postMessageCalls = workerInstance.postMessage.mock.calls;
      
      // 获取所有job ID
      const jobIds = postMessageCalls.map(call => call[0].id);
      const uniqueIds = new Set(jobIds);
      
      expect(uniqueIds.size).toBe(jobIds.length); // 所有ID都应该是唯一的
    });
  });

  // ===========================================
  // 8. 批量处理测试
  // ===========================================
  
  describe('Batch Processing - Complete Coverage', () => {
    
    it('should process batch data successfully', async () => {
      const config = {
        operationMode: 2, // QuickPlot
        frameDetectionMode: 0, // EndDelimiterOnly
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      const batchData = [
        new ArrayBuffer(8),
        new ArrayBuffer(16),
        new ArrayBuffer(12)
      ];
      
      const results = await processor.processBatch(batchData);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('type', 'frameProcessed');
        expect(result).toHaveProperty('data');
      });
    });
    
    it('should handle empty batch', async () => {
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
      
      const results = await processor.processBatch([]);
      
      expect(results).toEqual([]);
    });
    
    it('should handle batch with some failures gracefully', async () => {
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
      
      // 模拟部分处理失败
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      let callCount = 0;
      const originalPostMessage = workerInstance.postMessage;
      
      workerInstance.postMessage = vi.fn((message) => {
        callCount++;
        if (callCount === 2) {
          // 第二次调用模拟错误
          setTimeout(() => {
            workerInstance.simulateError(new Error('Second task failed'));
          }, 1);
        } else {
          // 其他调用正常处理
          originalPostMessage.call(workerInstance, message);
        }
      });
      
      const batchData = [
        new ArrayBuffer(8),
        new ArrayBuffer(8), // 这个会失败
        new ArrayBuffer(8)
      ];
      
      const results = await processor.processBatch(batchData);
      
      // 应该只有2个成功结果（失败的被跳过）
      expect(results.length).toBeLessThan(3);
    });
    
    it('should process batch sequentially', async () => {
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
      
      // 记录处理顺序
      const processOrder: number[] = [];
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      
      workerInstance.postMessage = vi.fn((message) => {
        // 从消息数据中提取序号（简化实现）
        const dataLength = message.data.length;
        processOrder.push(dataLength);
        
        // 延迟响应以确保顺序
        setTimeout(() => {
          workerInstance.emit('message', {
            type: 'frameProcessed',
            data: [],
            id: message.id
          });
        }, 10);
      });
      
      const batchData = [
        new ArrayBuffer(4),
        new ArrayBuffer(8),
        new ArrayBuffer(12)
      ];
      
      await processor.processBatch(batchData);
      
      expect(processOrder).toEqual([4, 8, 12]); // 应该按顺序处理
    });
  });

  // ===========================================
  // 9. 配置管理和更新
  // ===========================================
  
  describe('Configuration Management and Updates', () => {
    
    it('should update configuration correctly', async () => {
      const initialConfig = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(initialConfig);
      
      vi.advanceTimersByTime(50);
      
      const updatedConfig = {
        operationMode: 1,
        checksumAlgorithm: 'crc16'
      };
      
      processor.updateConfig(updatedConfig);
      
      // 验证配置已合并
      const workers = vi.mocked(AdvancedMockWorker).mock.instances;
      
      workers.forEach(worker => {
        expect(worker.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'configure',
            data: expect.objectContaining({
              operationMode: 1,
              frameDetectionMode: 0, // 保持原值
              checksumAlgorithm: 'crc16'
            })
          })
        );
      });
    });
    
    it('should notify all workers of configuration changes', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      const newConfig = {
        frameDetectionMode: 2,
        checksumAlgorithm: 'md5'
      };
      
      processor.updateConfig(newConfig);
      
      const workers = vi.mocked(AdvancedMockWorker).mock.instances;
      expect(workers).toHaveLength(3);
      
      // 验证每个Worker都收到配置更新
      workers.forEach(worker => {
        expect(worker.postMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'configure',
            data: expect.objectContaining({
              frameDetectionMode: 2,
              checksumAlgorithm: 'md5'
            })
          })
        );
      });
    });
    
    it('should handle partial configuration updates', async () => {
      const config = {
        operationMode: 2,
        frameDetectionMode: 1,
        startSequence: new Uint8Array([0x7B]),
        finishSequence: new Uint8Array([0x7D]),
        checksumAlgorithm: 'crc32',
        maxWorkers: 1
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      // 只更新一个字段
      processor.updateConfig({
        operationMode: 0
      });
      
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0];
      
      expect(workerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'configure',
          data: expect.objectContaining({
            operationMode: 0,
            frameDetectionMode: 1, // 应该保持原值
            checksumAlgorithm: 'crc32' // 应该保持原值
          })
        })
      );
    });
  });

  // ===========================================
  // 10. 统计信息和状态管理
  // ===========================================
  
  describe('Statistics and Status Management - Complete Coverage', () => {
    
    it('should return deep copy of statistics', async () => {
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
      
      const stats1 = processor.getStatistics();
      const stats2 = processor.getStatistics();
      
      // 应该是不同的对象（深拷贝）
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
      
      // 修改一个统计对象不应该影响另一个
      stats1.tasksProcessed = 999;
      expect(stats2.tasksProcessed).not.toBe(999);
    });
    
    it('should track active worker count accurately', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      expect(processor.getActiveWorkerCount()).toBe(3);
      
      // 触发一个Worker错误
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      workerInstance.simulateError(new Error('Worker failed'));
      
      vi.advanceTimersByTime(10);
      
      expect(processor.getActiveWorkerCount()).toBe(2);
    });
    
    it('should track queued task count correctly', async () => {
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
      
      expect(processor.getQueuedTaskCount()).toBe(0);
      
      // 开始多个任务
      const task1 = processor.processData(new ArrayBuffer(8));
      const task2 = processor.processData(new ArrayBuffer(8));
      const task3 = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(1);
      
      // 应该有任务在排队
      expect(processor.getQueuedTaskCount()).toBeGreaterThan(0);
      
      vi.advanceTimersByTime(50);
      
      await Promise.all([task1, task2, task3]);
      
      // 所有任务完成后，排队数应该为0
      expect(processor.getQueuedTaskCount()).toBe(0);
    });
    
    it('should report healthy status correctly', async () => {
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
      
      // 初始状态应该是健康的
      expect(processor.isHealthy()).toBe(true);
      
      // 终止后应该不健康
      await processor.terminate();
      expect(processor.isHealthy()).toBe(false);
    });
    
    it('should report unhealthy when no active workers', async () => {
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
      
      expect(processor.isHealthy()).toBe(true);
      
      // 触发Worker退出
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      workerInstance.simulateExit(1);
      
      vi.advanceTimersByTime(10);
      
      // 没有活跃Worker时应该不健康
      expect(processor.isHealthy()).toBe(false);
    });
    
    it('should report unhealthy when no workers at all', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 0 // 不创建任何Worker
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      expect(processor.isHealthy()).toBe(false);
    });
  });

  // ===========================================
  // 11. 资源清理和优雅终止
  // ===========================================
  
  describe('Resource Cleanup and Graceful Termination', () => {
    
    it('should terminate all workers gracefully', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 3
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      const workers = vi.mocked(AdvancedMockWorker).mock.instances;
      expect(workers).toHaveLength(3);
      
      await processor.terminate();
      
      // 所有Worker都应该被终止
      workers.forEach(worker => {
        expect(worker.terminate).toHaveBeenCalled();
      });
    });
    
    it('should wait for all workers to exit', async () => {
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
      
      const terminatePromise = processor.terminate();
      
      vi.advanceTimersByTime(10);
      
      // 应该等待所有Worker退出
      await terminatePromise;
      
      const stats = processor.getStatistics();
      expect(stats.activeWorkers).toBe(0);
    });
    
    it('should clear all data structures after termination', async () => {
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
      
      // 开始一些任务
      const task = processor.processData(new ArrayBuffer(8));
      vi.advanceTimersByTime(1);
      
      await processor.terminate();
      
      const stats = processor.getStatistics();
      expect(stats.activeWorkers).toBe(0);
      expect(stats.queuedTasks).toBe(0);
      expect(processor.getActiveWorkerCount()).toBe(0);
      expect(processor.getQueuedTaskCount()).toBe(0);
    });
    
    it('should set terminated flag correctly', async () => {
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
      
      expect(processor.isHealthy()).toBe(true);
      
      await processor.terminate();
      
      expect(processor.isHealthy()).toBe(false);
      
      // 终止后的任何操作都应该被拒绝
      await expect(processor.processData(new ArrayBuffer(8)))
        .rejects.toThrow('No available workers');
    });
  });

  // ===========================================
  // 12. 极端边界条件和错误场景
  // ===========================================
  
  describe('Extreme Edge Cases and Error Scenarios', () => {
    
    it('should handle simultaneous worker creation requests', async () => {
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
      
      // 触发Worker错误，同时发起多个任务
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      workerInstance.simulateError(new Error('Worker failed'));
      
      vi.advanceTimersByTime(1);
      
      // 同时发起多个任务，应该触发多个Worker创建请求
      const tasks = Promise.all([
        processor.processData(new ArrayBuffer(8)),
        processor.processData(new ArrayBuffer(8)),
        processor.processData(new ArrayBuffer(8))
      ]);
      
      vi.advanceTimersByTime(100);
      
      await tasks;
      
      // 验证不会创建过多Worker
      const stats = processor.getStatistics();
      expect(stats.activeWorkers).toBeLessThanOrEqual(config.maxWorkers);
    });
    
    it('should handle worker error during active job processing', async () => {
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
      
      const workerInstance = vi.mocked(AdvancedMockWorker).mock.instances[0] as AdvancedMockWorker;
      
      // 开始任务但不立即响应
      workerInstance.postMessage = vi.fn(); // 阻止响应
      
      const taskPromise = processor.processData(new ArrayBuffer(8));
      
      vi.advanceTimersByTime(1);
      
      // 在任务进行中触发错误
      workerInstance.simulateError(new Error('Worker crashed during processing'));
      
      vi.advanceTimersByTime(10);
      
      // 任务应该被拒绝
      await expect(taskPromise).rejects.toThrow();
    });
    
    it('should handle memory pressure scenarios', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 4
      };
      
      const processor = new MultiThreadProcessor(config);
      
      vi.advanceTimersByTime(50);
      
      // 创建大量并发任务
      const largeBatch = Array.from({ length: 100 }, () => 
        processor.processData(new ArrayBuffer(1024 * 1024)) // 1MB each
      );
      
      vi.advanceTimersByTime(200);
      
      // 应该能处理完成而不崩溃
      const results = await Promise.allSettled(largeBatch);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });
    
    it('should handle rapid terminate and recreate cycles', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      let processor = new MultiThreadProcessor(config);
      
      // 快速终止和重建循环
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(20);
        await processor.terminate();
        
        processor = new MultiThreadProcessor(config);
      }
      
      vi.advanceTimersByTime(50);
      
      // 最后的处理器应该仍然正常工作
      expect(processor.isHealthy()).toBe(true);
      
      const result = await processor.processData(new ArrayBuffer(8));
      expect(result).toHaveProperty('type', 'frameProcessed');
      
      await processor.terminate();
    });
  });

});
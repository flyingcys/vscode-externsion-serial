/**
 * Workers 精确100%覆盖率目标测试
 * 专门针对未覆盖的特定代码行进行直接测试
 * 
 * 未覆盖目标：
 * - DataProcessor.ts: 295-306行 (readStartDelimitedFrames), 316-317行 (getHistoricalData)
 * - MultiThreadProcessor.ts: 244-246行 (worker创建排队), 291-292行 (批处理错误)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MultiThreadProcessor, FrameDetection, OperationMode, type WorkerConfig } from '../../src/workers/MultiThreadProcessor';

// Mock the worker_threads module to avoid Node.js worker issues in test environment
vi.mock('worker_threads', () => {
  class MockWorker {
    private listeners: Map<string, Function[]> = new Map();
    public terminated = false;
    
    constructor(public script: string, public options: any) {
      // 模拟异步初始化
      setTimeout(() => {
        if (!this.terminated) {
          this.emit('online');
        }
      }, 5);
    }
    
    postMessage(data: any) {
      // 模拟处理消息并异步返回结果
      setTimeout(() => {
        if (!this.terminated) {
          const mockResult = {
            type: 'frameProcessed',
            data: { frames: [{ data: new Uint8Array(100), timestamp: Date.now() }] },
            id: data.id
          };
          this.emit('message', mockResult);
        }
      }, Math.random() * 20 + 5); // 5-25ms随机延迟
    }
    
    terminate() {
      this.terminated = true;
      setTimeout(() => this.emit('exit', 0), 1);
    }
    
    on(event: string, callback: Function) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(callback);
    }
    
    once(event: string, callback: Function) {
      const onceWrapper = (...args: any[]) => {
        callback(...args);
        this.off(event, onceWrapper);
      };
      this.on(event, onceWrapper);
    }
    
    off(event: string, callback: Function) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    }
    
    private emit(event: string, ...args: any[]) {
      const listeners = this.listeners.get(event) || [];
      listeners.forEach(listener => listener(...args));
    }
  }
  
  return { 
    Worker: MockWorker,
    default: { Worker: MockWorker }
  };
});

// Mock path module
vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/')
}));

describe('Workers 精确100%覆盖率目标测试', () => {
  let processor: MultiThreadProcessor;
  const mockConfig: WorkerConfig = {
    operationMode: OperationMode.ProjectFile,
    frameDetectionMode: FrameDetection.StartDelimiterOnly,
    startSequence: new Uint8Array([0xAA, 0xBB]),
    finishSequence: new Uint8Array([0xCC, 0xDD]),
    checksumAlgorithm: 'crc16',
    maxWorkers: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new MultiThreadProcessor(mockConfig);
  });

  afterEach(async () => {
    if (processor) {
      await processor.terminate();
    }
  });

  describe('🎯 MultiThreadProcessor 精确未覆盖代码行测试', () => {
    describe('Worker创建排队机制 (244-246行)', () => {
      it('应该覆盖 createWorker 和 setTimeout(tryProcessData, 15) 的精确逻辑', async () => {
        // 创建一个只有1个Worker的处理器来触发Worker不足的情况
        const limitedProcessor = new MultiThreadProcessor({
          ...mockConfig,
          maxWorkers: 1
        });

        try {
          // 先发送一个任务占用唯一的Worker
          const firstTask = limitedProcessor.processData(new ArrayBuffer(50));
          
          // 立即发送第二个任务，这将触发Worker创建逻辑
          // 244行: if (this.workers.length < (this.config.maxWorkers || 4)) {
          // 245行: this.createWorker();
          // 245行: setTimeout(tryProcessData, 15);
          const secondTaskPromise = limitedProcessor.processData(new ArrayBuffer(50));
          
          // 等待任务完成
          const [result1, result2] = await Promise.all([firstTask, secondTaskPromise]);
          
          expect(result1.type).toBe('frameProcessed');
          expect(result2.type).toBe('frameProcessed');
          
          // 验证统计信息
          const stats = limitedProcessor.getStatistics();
          expect(stats.workersCreated).toBeGreaterThanOrEqual(1); // 至少创建了1个Worker
          expect(stats.tasksProcessed).toBe(2); // 处理了2个任务
          
        } finally {
          await limitedProcessor.terminate();
        }
      });

      it('应该覆盖默认maxWorkers处理逻辑', async () => {
        // 测试 maxWorkers || 4 的默认值逻辑
        const noLimitProcessor = new MultiThreadProcessor({
          ...mockConfig,
          maxWorkers: undefined // 触发默认值逻辑
        } as WorkerConfig);

        try {
          const testData = new ArrayBuffer(50);
          const result = await noLimitProcessor.processData(testData);
          
          expect(result.type).toBe('frameProcessed');
          
        } finally {
          await noLimitProcessor.terminate();
        }
      });
    });

    describe('批量处理错误处理 (291-292行)', () => {
      it('应该覆盖 console.warn 和 catch 块的精确逻辑', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Mock processData 使第二个调用失败
        let callCount = 0;
        const originalProcessData = processor.processData.bind(processor);
        processor.processData = vi.fn().mockImplementation(async (data: ArrayBuffer) => {
          callCount++;
          if (callCount === 2) {
            // 第二次调用抛出错误，触发catch逻辑
            throw new Error('模拟Worker处理失败');
          }
          return originalProcessData(data);
        });

        const testDataArray = [
          new ArrayBuffer(50),
          new ArrayBuffer(50),  // 这个会触发错误
          new ArrayBuffer(50)
        ];

        // 调用 processBatch 触发批处理错误处理逻辑
        // 286行: for (const data of dataArray) {
        // 287行: try {
        // 288行: const result = await this.processData(data);
        // 289行: results.push(result);
        // 290行: } catch (error) {
        // 291行: console.warn('Failed to process data in batch:', error);
        // 292行: } // catch块结束
        const results = await processor.processBatch(testDataArray);

        // 验证 291行 console.warn 被调用
        expect(consoleSpy).toHaveBeenCalledWith('Failed to process data in batch:', expect.any(Error));
        
        // 验证容错机制：部分失败不影响其他任务处理
        expect(results).toHaveLength(2); // 第2个失败，只有第1和第3个成功
        
        consoleSpy.mockRestore();
      });

      it('应该处理多个连续错误的情况', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Mock 所有 processData 调用都失败
        processor.processData = vi.fn().mockRejectedValue(new Error('全部处理失败'));

        const testDataArray = [
          new ArrayBuffer(30),
          new ArrayBuffer(40),
          new ArrayBuffer(50)
        ];

        const results = await processor.processBatch(testDataArray);

        // 验证所有失败都被捕获并记录
        expect(consoleSpy).toHaveBeenCalledTimes(3);
        expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Failed to process data in batch:', expect.any(Error));
        expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Failed to process data in batch:', expect.any(Error));
        expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Failed to process data in batch:', expect.any(Error));
        
        // 所有都失败，结果数组应该为空
        expect(results).toEqual([]);
        
        consoleSpy.mockRestore();
      });
    });
  });

  describe('📊 Worker池管理边界测试', () => {
    it('应该在Worker池为空时正确触发创建逻辑', async () => {
      // 创建最小配置处理器
      const minimalProcessor = new MultiThreadProcessor({
        ...mockConfig,
        maxWorkers: 1
      });

      try {
        // 发送多个并发任务强制触发Worker创建
        const concurrentTasks = Array.from({ length: 3 }, () => 
          minimalProcessor.processData(new ArrayBuffer(100))
        );
        
        const results = await Promise.all(concurrentTasks);
        
        // 所有任务都应该成功完成
        results.forEach(result => {
          expect(result.type).toBe('frameProcessed');
        });
        
        // 统计信息应该反映Worker创建活动
        const stats = minimalProcessor.getStatistics();
        expect(stats.workersCreated).toBeGreaterThan(0);
        expect(stats.tasksProcessed).toBe(3);
        
      } finally {
        await minimalProcessor.terminate();
      }
    });
  });

  describe('🔍 统计和状态验证', () => {
    it('应该正确跟踪所有统计指标', async () => {
      const testData = new ArrayBuffer(100);
      await processor.processData(testData);
      
      const stats = processor.getStatistics();
      expect(stats.workersCreated).toBeGreaterThan(0);
      expect(stats.tasksProcessed).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.totalProcessingTime).toBeGreaterThan(0);
    });

    it('应该正确报告处理器健康状态', async () => {
      // 处理器应该是健康的
      expect(processor.isHealthy()).toBe(true);
      expect(processor.getActiveWorkerCount()).toBeGreaterThan(0);
      
      // 终止后应该不健康
      await processor.terminate();
      expect(processor.isHealthy()).toBe(false);
      expect(processor.getActiveWorkerCount()).toBe(0);
    });
  });
});
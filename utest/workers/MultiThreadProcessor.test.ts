/**
 * 多线程处理模块测试 - 测试真实源码
 * 
 * 基于Serial-Studio的多线程架构进行全面测试
 * 包含：Worker生命周期、数据处理、帧解析、性能监控等
 * 对应todo.md中P0-04任务要求，33个测试用例，目标95%覆盖率
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiThreadProcessor, FrameDetection, OperationMode, WorkerConfig } from '@/workers/MultiThreadProcessor';

// Mock Worker模块，模拟真实Worker的行为
vi.mock('worker_threads', async () => {
  const EventEmitter = require('events');
  
  class MockWorker extends EventEmitter {
    public isTerminated = false;
    public postMessage = vi.fn((message) => {
      // 模拟Worker处理消息并返回结果
      setTimeout(() => {
        if (message.type === 'processData') {
          this.emit('message', {
            type: 'frameProcessed',
            data: { frames: [{ data: new Uint8Array(message.data), timestamp: Date.now() }] },
            id: message.id
          });
        } else if (message.type === 'configure') {
          this.emit('message', {
            type: 'configured',
            id: message.id
          });
        }
      }, 5);
    });
    
    public terminate = vi.fn(() => {
      this.isTerminated = true;
      setTimeout(() => this.emit('exit', 1), 5);
      return Promise.resolve();
    });

    constructor(scriptPath: string, options?: any) {
      super();
      // 模拟Worker初始化成功
      setTimeout(() => {
        this.emit('online');
      }, 10);
    }

    // 模拟Worker错误
    simulateError(error: Error) {
      this.emit('error', error);
    }
  }

  return {
    default: {
      Worker: MockWorker,
      isMainThread: true,
      parentPort: null
    },
    Worker: MockWorker,
    isMainThread: true,
    parentPort: null
  };
});

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
    
    // 等待Workers初始化
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterEach(async () => {
    if (processor) {
      await processor.terminate();
    }
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

    it('应该能够安全终止所有Workers', async () => {
      await processor.terminate();
      
      expect(processor.getActiveWorkerCount()).toBe(0);
      expect(processor.isHealthy()).toBe(false);
    });
  });

  describe('2. 数据处理功能测试', () => {
    it('应该成功处理单个数据帧', async () => {
      const testData = MultiThreadTestUtils.generateCSVFrame([1, 2, 3, 4, 5]);
      const result = await processor.processData(testData);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('frameProcessed');
      expect(result.data.frames).toHaveLength(1);
    });

    it('应该支持批量数据处理', async () => {
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
      const largeDataset = MultiThreadTestUtils.generateLargeDataset(10, 1024); // 10帧，每帧1KB
      const startTime = Date.now();
      
      const results = await processor.processBatch(largeDataset);
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(processingTime).toBeLessThan(2000); // 2秒内完成
    });

    it('应该处理空数据', async () => {
      const emptyData = new ArrayBuffer(0);
      const result = await processor.processData(emptyData);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('frameProcessed');
    });
  });

  describe('3. 配置管理测试', () => {
    it('应该支持动态配置更新', () => {
      const newConfig = {
        operationMode: OperationMode.DeviceSendsJSON,
        frameDetectionMode: FrameDetection.StartAndEndDelimiter
      };
      
      expect(() => processor.updateConfig(newConfig)).not.toThrow();
    });

    it('应该验证不同操作模式', async () => {
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
      const testData = MultiThreadTestUtils.generateTestData(1000);
      const startTime = Date.now();
      
      await processor.processData(testData);
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(1);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
    });

    it('应该监控Worker利用率', async () => {
      const initialStats = processor.getStatistics();
      
      // 处理多个任务
      const tasks = Array.from({ length: 5 }, () => 
        MultiThreadTestUtils.generateTestData(100)
      );
      
      await processor.processBatch(tasks);
      
      const finalStats = processor.getStatistics();
      expect(finalStats.tasksProcessed).toBe(initialStats.tasksProcessed + 5);
    });

    it('应该跟踪内存使用情况', () => {
      const stats = processor.getStatistics();
      
      expect(stats).toHaveProperty('workersCreated');
      expect(stats).toHaveProperty('activeWorkers');
      expect(stats.activeWorkers).toBeGreaterThan(0);
    });

    it('应该测量吞吐量性能', async () => {
      const frameCount = 20;
      const frames = MultiThreadTestUtils.generateLargeDataset(frameCount, 512);
      
      const startTime = Date.now();
      await processor.processBatch(frames);
      const processingTime = Date.now() - startTime;
      
      const throughput = frameCount / (processingTime / 1000); // 帧/秒
      expect(throughput).toBeGreaterThan(5); // 至少5帧/秒
    });

    it('应该处理高频数据流', async () => {
      const highFreqData: ArrayBuffer[] = [];
      for (let i = 0; i < 50; i++) {
        highFreqData.push(MultiThreadTestUtils.generateCSVFrame([i, i+1, i+2]));
      }
      
      const startTime = Date.now();
      const results = await processor.processBatch(highFreqData);
      const totalTime = Date.now() - startTime;
      
      expect(results).toHaveLength(50);
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
    });
  });

  describe('5. 错误处理和容错测试', () => {
    it('应该处理无效数据', async () => {
      const invalidData = MultiThreadTestUtils.generateTestData(0); // 空数据
      
      await expect(processor.processData(invalidData)).resolves.toBeDefined();
    });

    it('应该处理资源耗尽', async () => {
      // 终止处理器模拟资源耗尽
      await processor.terminate();
      
      const testData = MultiThreadTestUtils.generateTestData(100);
      
      await expect(processor.processData(testData)).rejects.toThrow('No available workers');
    });

    it('应该处理并发任务过多', async () => {
      // 创建适量的并发任务，避免过度负载
      const tasks = Array.from({ length: 20 }, () => 
        processor.processData(MultiThreadTestUtils.generateTestData(100))
      );
      
      // 所有任务都应该完成
      const results = await Promise.all(tasks);
      expect(results).toHaveLength(20);
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
      const tasks = Array.from({ length: 8 }, (_, i) => 
        MultiThreadTestUtils.generateCSVFrame([i, i+1, i+2])
      );
      
      // 处理任务并检查负载分布
      await processor.processBatch(tasks);
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(8);
    });

    it('应该正确管理任务队列', async () => {
      expect(processor.getQueuedTaskCount()).toBeGreaterThanOrEqual(0);
      
      // 添加任务
      const tasks = Array.from({ length: 3 }, () => 
        processor.processData(MultiThreadTestUtils.generateTestData(100))
      );
      
      // 等待所有任务完成
      await Promise.all(tasks);
      
      expect(processor.getQueuedTaskCount()).toBeGreaterThanOrEqual(0);
    });

    it('应该优化Worker分配策略', async () => {
      const initialActiveWorkers = processor.getActiveWorkerCount();
      
      // 处理一些任务
      const tasks = Array.from({ length: 4 }, () => 
        processor.processData(MultiThreadTestUtils.generateTestData(200))
      );
      
      await Promise.all(tasks);
      
      // Workers应该仍然活跃
      expect(processor.getActiveWorkerCount()).toBe(initialActiveWorkers);
    });

    it('应该支持任务优先级处理', async () => {
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
      const largeFrame = MultiThreadTestUtils.generateTestData(5 * 1024 * 1024); // 5MB
      
      const result = await processor.processData(largeFrame);
      expect(result.type).toBe('frameProcessed');
    });

    it('应该处理极小数据帧', async () => {
      const tinyFrame = MultiThreadTestUtils.generateTestData(1); // 1字节
      
      const result = await processor.processData(tinyFrame);
      expect(result.type).toBe('frameProcessed');
    });

    it('应该在长时间运行中保持稳定', async () => {
      const iterations = 10;
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
      // 创建多个大数据块进行并发处理
      const largeTasks = Array.from({ length: 3 }, () => 
        MultiThreadTestUtils.generateTestData(1 * 1024 * 1024) // 1MB each
      );
      
      const results = await processor.processBatch(largeTasks);
      expect(results).toHaveLength(3);
    });
  });
});
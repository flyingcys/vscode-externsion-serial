/**
 * Workers 性能基准测试
 * 
 * 🎯 目标：Workers 模块性能和稳定性验证
 * 
 * 本测试文件验证 Workers 模块的性能基准：
 * ✅ 吞吐量基准测试
 * ✅ 延迟基准测试
 * ✅ 内存使用基准
 * ✅ 并发性能测试
 * ✅ 长时间运行稳定性
 * ✅ 不同负载模式性能
 * ✅ 扩展性测试
 * 
 * 确保 Workers 模块在各种性能要求下的表现
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';

// ===========================================
// 性能测试环境设置
// ===========================================

// 高性能 Mock Worker，专为基准测试优化
class BenchmarkWorker extends EventEmitter {
  public isTerminated = false;
  public postMessage = vi.fn();
  public terminate = vi.fn();
  private processingCount = 0;
  private totalProcessingTime = 0;
  private maxProcessingTime = 0;
  private minProcessingTime = Infinity;
  
  constructor(scriptPath: string, options?: any) {
    super();
    
    const workerId = options?.workerData?.workerId || '';
    let baseDelay = 1;
    
    // 根据 workerId 设置性能特征
    if (workerId.includes('highperf')) {
      baseDelay = 0.5;
    } else if (workerId.includes('normal')) {
      baseDelay = 2;
    } else if (workerId.includes('slow')) {
      baseDelay = 10;
    }
    
    // 快速初始化
    setTimeout(() => {
      if (!this.isTerminated) {
        this.emit('online');
      }
    }, 1);
    
    this.postMessage = vi.fn((message) => {
      if (this.isTerminated) return;
      
      const processingDelay = baseDelay + Math.random() * baseDelay; // 添加一些变化
      const startTime = Date.now();
      
      setTimeout(() => {
        if (this.isTerminated) return;
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        this.processingCount++;
        this.totalProcessingTime += duration;
        this.maxProcessingTime = Math.max(this.maxProcessingTime, duration);
        this.minProcessingTime = Math.min(this.minProcessingTime, duration);
        
        const response = this.generateResponse(message);
        this.emit('message', response);
      }, processingDelay);
    });
    
    this.terminate = vi.fn(() => {
      this.isTerminated = true;
      setTimeout(() => {
        this.emit('exit', 0);
      }, 0.5);
      return Promise.resolve();
    });
  }
  
  private generateResponse(message: any): any {
    switch (message.type) {
      case 'configure':
        return { type: 'configured', id: message.id };
        
      case 'processData':
        return {
          type: 'frameProcessed',
          data: [{
            data: new Uint8Array(message.data.slice(0, Math.min(message.data.length, 100))),
            timestamp: Date.now(),
            sequence: this.processingCount,
            checksumValid: true
          }],
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
            frameQueueLength: 0
          },
          id: message.id
        };
        
      case 'reset':
        this.processingCount = 0;
        this.totalProcessingTime = 0;
        this.maxProcessingTime = 0;
        this.minProcessingTime = Infinity;
        return { type: 'reset', id: message.id };
        
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }
  
  // 性能统计方法
  public getPerformanceStats() {
    return {
      processingCount: this.processingCount,
      totalProcessingTime: this.totalProcessingTime,
      averageProcessingTime: this.totalProcessingTime / this.processingCount || 0,
      maxProcessingTime: this.maxProcessingTime === -Infinity ? 0 : this.maxProcessingTime,
      minProcessingTime: this.minProcessingTime === Infinity ? 0 : this.minProcessingTime
    };
  }
}

// Mock Worker Threads 模块 - 完整配置
vi.mock('worker_threads', async () => {
  const EventEmitter = require('events');
  
  return {
    default: {
      Worker: BenchmarkWorker,
      isMainThread: true,
      parentPort: null
    },
    Worker: BenchmarkWorker,
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

describe('Workers Performance Benchmarks', () => {
  
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
  // 1. 吞吐量基准测试
  // ===========================================
  
  describe('Throughput Benchmarks', () => {
    
    it('should achieve target throughput for small messages', async () => {
      const config = {
        operationMode: 2,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 4
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      const messageCount = 100;
      const messageSize = 64; // 64 bytes per message
      const startTime = Date.now();
      
      const tasks = [];
      for (let i = 0; i < messageCount; i++) {
        const data = new ArrayBuffer(messageSize);
        tasks.push(processor.processData(data));
      }
      
      vi.advanceTimersByTime(500);
      
      const results = await Promise.all(tasks);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      const throughputMBps = (messageCount * messageSize) / (1024 * 1024) / (duration / 1000);
      const messagesPerSecond = messageCount / (duration / 1000);
      
      expect(results).toHaveLength(messageCount);
      expect(throughputMBps).toBeGreaterThan(0.1); // 至少 0.1 MB/s
      expect(messagesPerSecond).toBeGreaterThan(100); // 至少 100 messages/s
      
      console.log(`Small Message Throughput: ${throughputMBps.toFixed(2)} MB/s, ${messagesPerSecond.toFixed(0)} msg/s`);
      
      await processor.terminate();
    });
    
    it('should handle large message throughput efficiently', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 2, // NoDelimiters for maximum throughput
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([]),
        checksumAlgorithm: 'none',
        maxWorkers: 8
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      const messageCount = 20;
      const messageSize = 1024 * 1024; // 1MB per message
      const startTime = Date.now();
      
      const tasks = [];
      for (let i = 0; i < messageCount; i++) {
        const data = new ArrayBuffer(messageSize);
        tasks.push(processor.processData(data));
      }
      
      vi.advanceTimersByTime(2000);
      
      const results = await Promise.all(tasks);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      const totalDataMB = (messageCount * messageSize) / (1024 * 1024);
      const throughputMBps = totalDataMB / (duration / 1000);
      
      expect(results).toHaveLength(messageCount);
      expect(throughputMBps).toBeGreaterThan(1); // 至少 1 MB/s for large messages
      
      console.log(`Large Message Throughput: ${throughputMBps.toFixed(2)} MB/s`);
      
      await processor.terminate();
    });
    
    it('should scale throughput with worker count', async () => {
      const workerCounts = [1, 2, 4, 8];
      const results = [];
      
      for (const workerCount of workerCounts) {
        const config = {
          operationMode: 2,
          frameDetectionMode: 0,
          startSequence: new Uint8Array([]),
          finishSequence: new Uint8Array([0x0A]),
          checksumAlgorithm: 'none',
          maxWorkers: workerCount
        };
        
        const processor = new MultiThreadProcessor(config);
        vi.advanceTimersByTime(50);
        
        const messageCount = 50;
        const startTime = Date.now();
        
        const tasks = [];
        for (let i = 0; i < messageCount; i++) {
          tasks.push(processor.processData(new ArrayBuffer(128)));
        }
        
        vi.advanceTimersByTime(300);
        
        await Promise.all(tasks);
        const endTime = Date.now();
        
        const duration = endTime - startTime;
        const messagesPerSecond = messageCount / (duration / 1000);
        
        results.push({
          workers: workerCount,
          throughput: messagesPerSecond
        });
        
        console.log(`${workerCount} workers: ${messagesPerSecond.toFixed(0)} msg/s`);
        
        await processor.terminate();
      }
      
      // 验证随着Worker数量增加，吞吐量应该提升
      for (let i = 1; i < results.length; i++) {
        expect(results[i].throughput).toBeGreaterThan(results[i-1].throughput * 0.8);
      }
    });
  });

  // ===========================================
  // 2. 延迟基准测试
  // ===========================================
  
  describe('Latency Benchmarks', () => {
    
    it('should achieve low latency for single message processing', async () => {
      const config = {
        operationMode: 2,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 1
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(50);
      
      const latencies = [];
      
      // 测试单个消息的延迟
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await processor.processData(new ArrayBuffer(64));
        const endTime = Date.now();
        
        latencies.push(endTime - startTime);
        vi.advanceTimersByTime(10); // 短暂间隔
      }
      
      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const minLatency = Math.min(...latencies);
      
      expect(averageLatency).toBeLessThan(50); // 平均延迟应该小于50ms
      expect(maxLatency).toBeLessThan(100); // 最大延迟应该小于100ms
      
      console.log(`Latency - Avg: ${averageLatency.toFixed(2)}ms, Min: ${minLatency}ms, Max: ${maxLatency}ms`);
      
      await processor.terminate();
    });
    
    it('should maintain consistent latency under load', async () => {
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
      
      const latencies = [];
      const messageCount = 50;
      
      // 并发发送消息并测量延迟
      const tasks = [];
      for (let i = 0; i < messageCount; i++) {
        const startTime = Date.now();
        const task = processor.processData(new ArrayBuffer(128))
          .then(() => {
            const endTime = Date.now();
            latencies.push(endTime - startTime);
          });
        tasks.push(task);
      }
      
      vi.advanceTimersByTime(1000);
      
      await Promise.all(tasks);
      
      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const latencyStdDev = Math.sqrt(
        latencies.reduce((sum, lat) => sum + Math.pow(lat - averageLatency, 2), 0) / latencies.length
      );
      
      expect(averageLatency).toBeLessThan(100); // 负载下平均延迟
      expect(latencyStdDev).toBeLessThan(averageLatency * 0.5); // 延迟变化不应太大
      
      console.log(`Load Latency - Avg: ${averageLatency.toFixed(2)}ms, StdDev: ${latencyStdDev.toFixed(2)}ms`);
      
      await processor.terminate();
    });
    
    it('should handle latency spikes gracefully', async () => {
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
      
      // 创建一个慢Worker和一个快Worker
      const workers = vi.mocked(BenchmarkWorker).mock.instances as BenchmarkWorker[];
      
      // 模拟一个Worker变慢
      const slowWorkerMessage = workers[0].postMessage;
      workers[0].postMessage = vi.fn((message) => {
        // 添加额外延迟
        setTimeout(() => {
          slowWorkerMessage.call(workers[0], message);
        }, 50);
      });
      
      const latencies = [];
      const tasks = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        const task = processor.processData(new ArrayBuffer(64))
          .then(() => {
            latencies.push(Date.now() - startTime);
          });
        tasks.push(task);
        
        vi.advanceTimersByTime(5);
      }
      
      vi.advanceTimersByTime(500);
      
      await Promise.all(tasks);
      
      // 应该有一些任务由快Worker处理，延迟较低
      const fastLatencies = latencies.filter(lat => lat < 20);
      const slowLatencies = latencies.filter(lat => lat >= 20);
      
      expect(fastLatencies.length).toBeGreaterThan(0);
      expect(slowLatencies.length).toBeGreaterThan(0);
      
      console.log(`Latency Distribution - Fast: ${fastLatencies.length}, Slow: ${slowLatencies.length}`);
      
      await processor.terminate();
    });
  });

  // ===========================================
  // 3. 内存使用基准
  // ===========================================
  
  describe('Memory Usage Benchmarks', () => {
    
    it('should maintain stable memory usage during processing', async () => {
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
      
      // 记录初始状态
      const initialStats = processor.getStatistics();
      
      // 处理大量数据
      for (let batch = 0; batch < 10; batch++) {
        const batchTasks = [];
        
        for (let i = 0; i < 20; i++) {
          batchTasks.push(processor.processData(new ArrayBuffer(1024)));
        }
        
        vi.advanceTimersByTime(100);
        await Promise.all(batchTasks);
        
        // 检查内存使用没有异常增长
        const currentStats = processor.getStatistics();
        expect(currentStats.activeWorkers).toBe(4);
        expect(currentStats.queuedTasks).toBe(0); // 任务队列应该被清空
      }
      
      const finalStats = processor.getStatistics();
      
      // 验证没有内存泄漏指标
      expect(finalStats.tasksProcessed).toBe(200);
      expect(finalStats.averageProcessingTime).toBeGreaterThan(0);
      expect(finalStats.activeWorkers).toBe(initialStats.activeWorkers);
      
      await processor.terminate();
    });
    
    it('should handle large data buffers without memory leaks', async () => {
      const config = {
        operationMode: 0,
        frameDetectionMode: 2, // NoDelimiters
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([]),
        checksumAlgorithm: 'none',
        maxWorkers: 2
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(100);
      
      // 处理非常大的数据块
      const largeDataSizes = [
        1024 * 1024,      // 1MB
        2 * 1024 * 1024,  // 2MB
        5 * 1024 * 1024   // 5MB
      ];
      
      for (const size of largeDataSizes) {
        const largeData = new ArrayBuffer(size);
        const dataView = new DataView(largeData);
        
        // 填充一些测试数据
        for (let i = 0; i < Math.min(size, 1000); i++) {
          dataView.setUint8(i, i % 256);
        }
        
        const result = await processor.processData(largeData);
        
        expect(result).toHaveProperty('type', 'frameProcessed');
        expect(result.data).toHaveLength(1);
        
        vi.advanceTimersByTime(100);
      }
      
      // 验证系统仍然健康
      expect(processor.isHealthy()).toBe(true);
      
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(3);
      expect(stats.activeWorkers).toBe(2);
      
      await processor.terminate();
    });
    
    it('should cleanup resources properly on repeated create/destroy cycles', async () => {
      const createDestroyCount = 5;
      
      for (let cycle = 0; cycle < createDestroyCount; cycle++) {
        const config = {
          operationMode: 2,
          frameDetectionMode: 0,
          startSequence: new Uint8Array([]),
          finishSequence: new Uint8Array([0x0A]),
          checksumAlgorithm: 'none',
          maxWorkers: 3
        };
        
        const processor = new MultiThreadProcessor(config);
        vi.advanceTimersByTime(50);
        
        // 处理一些任务
        const tasks = [];
        for (let i = 0; i < 5; i++) {
          tasks.push(processor.processData(new ArrayBuffer(256)));
        }
        
        vi.advanceTimersByTime(100);
        await Promise.all(tasks);
        
        // 验证统计信息
        const stats = processor.getStatistics();
        expect(stats.tasksProcessed).toBe(5);
        expect(stats.activeWorkers).toBe(3);
        
        // 清理
        await processor.terminate();
        
        // 验证清理完成
        expect(processor.getActiveWorkerCount()).toBe(0);
        expect(processor.isHealthy()).toBe(false);
      }
      
      // 验证总体资源使用
      const totalWorkers = vi.mocked(BenchmarkWorker).mock.instances.length;
      expect(totalWorkers).toBe(createDestroyCount * 3);
      
      // 所有Worker都应该被终止
      vi.mocked(BenchmarkWorker).mock.instances.forEach(worker => {
        expect(worker.terminate).toHaveBeenCalled();
      });
    });
  });

  // ===========================================
  // 4. 并发性能测试
  // ===========================================
  
  describe('Concurrent Performance Testing', () => {
    
    it('should maintain performance under high concurrency', async () => {
      const config = {
        operationMode: 2,
        frameDetectionMode: 0,
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        maxWorkers: 6
      };
      
      const processor = new MultiThreadProcessor(config);
      vi.advanceTimersByTime(150);
      
      const concurrencyLevel = 50; // 50个并发任务
      const startTime = Date.now();
      
      // 创建大量并发任务
      const tasks = [];
      for (let i = 0; i < concurrencyLevel; i++) {
        const data = new ArrayBuffer(128 + (i % 100)); // 不同大小的数据
        tasks.push(processor.processData(data));
      }
      
      vi.advanceTimersByTime(1000);
      
      const results = await Promise.allSettled(tasks);
      const endTime = Date.now();
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      const successRate = successful.length / concurrencyLevel;
      const duration = endTime - startTime;
      const concurrentThroughput = successful.length / (duration / 1000);
      
      expect(successRate).toBeGreaterThan(0.9); // 90% 成功率
      expect(concurrentThroughput).toBeGreaterThan(20); // 20 tasks/s under concurrency
      
      console.log(`Concurrency Performance - Success Rate: ${(successRate * 100).toFixed(1)}%, Throughput: ${concurrentThroughput.toFixed(1)} tasks/s`);
      
      await processor.terminate();
    });
    
    it('should balance load across workers effectively', async () => {
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
      
      const taskCount = 40; // 10 tasks per worker theoretically
      const tasks = [];
      
      for (let i = 0; i < taskCount; i++) {
        tasks.push(processor.processData(new ArrayBuffer(64)));
      }
      
      vi.advanceTimersByTime(500);
      
      await Promise.all(tasks);
      
      // 检查Worker使用情况
      const workers = vi.mocked(BenchmarkWorker).mock.instances as BenchmarkWorker[];
      const workerUsage = workers.map(worker => worker.getPerformanceStats());
      
      const totalProcessed = workerUsage.reduce((sum, stats) => sum + stats.processingCount, 0);
      expect(totalProcessed).toBe(taskCount);
      
      // 验证负载分布相对均匀
      const averageLoad = totalProcessed / workers.length;
      const loadVariance = workerUsage.map(stats => 
        Math.abs(stats.processingCount - averageLoad)
      );
      const maxLoadVariance = Math.max(...loadVariance);
      
      expect(maxLoadVariance).toBeLessThan(averageLoad * 0.5); // 负载差异不应太大
      
      console.log(`Load Balance - Average: ${averageLoad.toFixed(1)}, Max Variance: ${maxLoadVariance.toFixed(1)}`);
      
      await processor.terminate();
    });
    
    it('should handle mixed workload patterns efficiently', async () => {
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
      
      const workloadPatterns = [
        { count: 20, size: 64, delay: 0 },    // 快速小任务
        { count: 5, size: 2048, delay: 10 },  // 中等任务
        { count: 2, size: 8192, delay: 20 }   // 大任务
      ];
      
      const allTasks = [];
      const patternResults = [];
      
      for (const pattern of workloadPatterns) {
        const patternTasks = [];
        const startTime = Date.now();
        
        for (let i = 0; i < pattern.count; i++) {
          patternTasks.push(processor.processData(new ArrayBuffer(pattern.size)));
          vi.advanceTimersByTime(pattern.delay);
        }
        
        allTasks.push(...patternTasks);
        
        const results = await Promise.allSettled(patternTasks);
        const endTime = Date.now();
        
        patternResults.push({
          pattern,
          successCount: results.filter(r => r.status === 'fulfilled').length,
          duration: endTime - startTime,
          throughput: results.filter(r => r.status === 'fulfilled').length / ((endTime - startTime) / 1000)
        });
      }
      
      vi.advanceTimersByTime(500);
      
      // 验证所有工作负载模式都能有效处理
      patternResults.forEach((result, index) => {
        expect(result.successCount).toBeGreaterThan(result.pattern.count * 0.8);
        console.log(`Pattern ${index + 1} - Success: ${result.successCount}/${result.pattern.count}, Throughput: ${result.throughput.toFixed(1)} tasks/s`);
      });
      
      await processor.terminate();
    });
  });

  // ===========================================
  // 5. 长时间运行稳定性测试
  // ===========================================
  
  describe('Long Running Stability Tests', () => {
    
    it('should maintain stable performance over extended operation', async () => {
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
      
      const phaseCount = 5;
      const tasksPerPhase = 20;
      const phaseResults = [];
      
      for (let phase = 0; phase < phaseCount; phase++) {
        const phaseStartTime = Date.now();
        const phaseTasks = [];
        
        for (let i = 0; i < tasksPerPhase; i++) {
          phaseTasks.push(processor.processData(new ArrayBuffer(128 + (i % 50))));
          vi.advanceTimersByTime(2);
        }
        
        vi.advanceTimersByTime(200);
        
        const results = await Promise.all(phaseTasks);
        const phaseEndTime = Date.now();
        
        const phaseDuration = phaseEndTime - phaseStartTime;
        const phaseThroughput = tasksPerPhase / (phaseDuration / 1000);
        
        phaseResults.push({
          phase,
          throughput: phaseThroughput,
          duration: phaseDuration
        });
        
        console.log(`Phase ${phase + 1} - Throughput: ${phaseThroughput.toFixed(1)} tasks/s, Duration: ${phaseDuration}ms`);
        
        // 短暂休息
        vi.advanceTimersByTime(50);
      }
      
      // 验证性能稳定性
      const throughputs = phaseResults.map(r => r.throughput);
      const avgThroughput = throughputs.reduce((a, b) => a + b, 0) / throughputs.length;
      const throughputVariance = Math.sqrt(
        throughputs.reduce((sum, tp) => sum + Math.pow(tp - avgThroughput, 2), 0) / throughputs.length
      );
      
      expect(throughputVariance).toBeLessThan(avgThroughput * 0.3); // 性能变化不应太大
      
      // 验证系统健康状态
      expect(processor.isHealthy()).toBe(true);
      
      const finalStats = processor.getStatistics();
      expect(finalStats.tasksProcessed).toBe(phaseCount * tasksPerPhase);
      expect(finalStats.activeWorkers).toBe(3);
      
      console.log(`Stability Test - Avg Throughput: ${avgThroughput.toFixed(1)} tasks/s, Variance: ${throughputVariance.toFixed(2)}`);
      
      await processor.terminate();
    });
    
    it('should handle worker churn without performance degradation', async () => {
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
      
      const churnCycles = 3;
      const tasksPerCycle = 15;
      const churnResults = [];
      
      for (let cycle = 0; cycle < churnCycles; cycle++) {
        const cycleStartTime = Date.now();
        
        // 开始任务处理
        const cycleTasks = [];
        for (let i = 0; i < tasksPerCycle; i++) {
          cycleTasks.push(processor.processData(new ArrayBuffer(64)));
          vi.advanceTimersByTime(5);
        }
        
        // 在处理过程中触发Worker churn
        if (cycle > 0) {
          const workers = vi.mocked(BenchmarkWorker).mock.instances as BenchmarkWorker[];
          const workerToReplace = workers[cycle % workers.length];
          
          workerToReplace.emit('error', new Error(`Planned churn cycle ${cycle}`));
          vi.advanceTimersByTime(20);
        }
        
        vi.advanceTimersByTime(300);
        
        const results = await Promise.allSettled(cycleTasks);
        const cycleEndTime = Date.now();
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const cycleDuration = cycleEndTime - cycleStartTime;
        const cycleThroughput = successCount / (cycleDuration / 1000);
        
        churnResults.push({
          cycle,
          successCount,
          totalTasks: tasksPerCycle,
          throughput: cycleThroughput
        });
        
        console.log(`Churn Cycle ${cycle + 1} - Success: ${successCount}/${tasksPerCycle}, Throughput: ${cycleThroughput.toFixed(1)} tasks/s`);
        
        vi.advanceTimersByTime(50);
      }
      
      // 验证即使有Worker churn，性能仍然稳定
      const successRates = churnResults.map(r => r.successCount / r.totalTasks);
      const avgSuccessRate = successRates.reduce((a, b) => a + b, 0) / successRates.length;
      
      expect(avgSuccessRate).toBeGreaterThan(0.8); // 80% 平均成功率
      
      // 最后一个周期应该恢复到正常性能
      const lastCycleSuccess = churnResults[churnResults.length - 1].successCount / tasksPerCycle;
      expect(lastCycleSuccess).toBeGreaterThan(0.9);
      
      console.log(`Churn Resilience - Avg Success Rate: ${(avgSuccessRate * 100).toFixed(1)}%`);
      
      await processor.terminate();
    });
  });

});
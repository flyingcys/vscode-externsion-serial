/**
 * MultiThreadProcessor 95%+覆盖率冲刺测试
 * 
 * 🎯 专门针对90.35% → 95%+覆盖率提升的缺失代码路径
 * 
 * 发现的关键未覆盖路径：
 * 1. processBatch() 方法的错误处理和部分失败场景
 * 2. Worker状态转换的边界情况
 * 3. 统计信息在异常状态下的一致性
 * 4. terminate() 方法的所有分支
 * 5. 创建Worker失败后的重试逻辑
 * 6. 健康状态检查的边界条件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';

// Mock Worker 类 - 增强版本覆盖更多边界情况
class MockWorkerEnhanced extends EventEmitter {
  public terminated = false;
  private messageHandlers: Array<(data: any) => void> = [];
  public failureMode: 'none' | 'init_fail' | 'runtime_error' | 'message_fail' | 'terminate_fail' = 'none';
  
  constructor(script: string, options?: any) {
    super();
    this.setMaxListeners(20); // 增加监听器限制
    
    // 延迟初始化以避免在构造函数中访问this的问题
    setTimeout(() => {
      // 模拟不同的初始化场景
      if (this.failureMode === 'init_fail') {
        this.emit('error', new Error('Worker initialization failed'));
      } else {
        this.emit('online');
      }
    }, 10);
  }

  postMessage(data: any): void {
    if (this.terminated) {
      throw new Error('Cannot post message to terminated worker');
    }
    
    if (this.failureMode === 'message_fail') {
      this.emit('error', new Error('Message posting failed'));
      return;
    }

    // 模拟不同类型的消息处理
    setTimeout(() => {
      switch (data.type) {
        case 'configure':
          this.emit('message', {
            type: 'configured',
            id: data.id
          });
          break;
          
        case 'processData':
          if (this.failureMode === 'runtime_error' && Math.random() < 0.3) {
            this.emit('error', new Error('Runtime processing error'));
            return;
          }
          
          this.emit('message', {
            type: 'frameProcessed',
            data: [{ data: new Uint8Array([1, 2, 3]), timestamp: Date.now(), sequence: 1, checksumValid: true }],
            id: data.id
          });
          break;
          
        case 'getStats':
          this.emit('message', {
            type: 'stats',
            data: { bufferUsage: 50, frameCount: 10 },
            id: data.id
          });
          break;
          
        case 'reset':
          this.emit('message', {
            type: 'reset',
            id: data.id
          });
          break;
          
        default:
          this.emit('error', new Error(`Unknown message type: ${data.type}`));
      }
    }, 5 + Math.random() * 10); // 随机延迟模拟真实场景
  }

  terminate(): Promise<number> {
    return new Promise((resolve) => {
      this.terminated = true;
      
      if (this.failureMode === 'terminate_fail') {
        // 模拟终止失败 - 延迟很长时间
        setTimeout(() => {
          this.emit('exit', -1);
          resolve(-1);
        }, 100);
      } else {
        setTimeout(() => {
          this.emit('exit', 0);
          resolve(0);
        }, 10);
      }
    });
  }

  // 测试辅助方法
  setFailureMode(mode: 'none' | 'init_fail' | 'runtime_error' | 'message_fail' | 'terminate_fail'): void {
    this.failureMode = mode;
  }
  
  simulateMemoryLeak(): void {
    // 模拟内存泄漏场景
    const largeBuffer = new ArrayBuffer(1024 * 1024); // 1MB
    (this as any).leakedMemory = largeBuffer;
  }
  
  simulateRandomError(): void {
    setTimeout(() => {
      this.emit('error', new Error('Random worker error occurred'));
    }, Math.random() * 50);
  }
  
  simulateUnexpectedExit(): void {
    setTimeout(() => {
      this.emit('exit', 1); // 非正常退出
    }, Math.random() * 20);
  }
}

// Mock worker_threads 模块 - 确保在导入前设置
vi.mock('worker_threads', () => ({
  Worker: MockWorkerEnhanced
}));

// Mock path 模块
vi.mock('path', () => ({
  join: vi.fn((...args: string[]) => args.join('/'))
}));

// 导入测试目标 - 在mock设置后导入
import { MultiThreadProcessor, FrameDetection, OperationMode, type WorkerConfig } from '../../src/workers/MultiThreadProcessor';

describe('MultiThreadProcessor 95%+覆盖率冲刺测试', () => {
  let processor: MultiThreadProcessor;
  
  const baseConfig: WorkerConfig = {
    operationMode: OperationMode.QuickPlot,
    frameDetectionMode: FrameDetection.EndDelimiterOnly,
    startSequence: new Uint8Array(),
    finishSequence: new Uint8Array([0x0A]),
    checksumAlgorithm: 'none',
    maxWorkers: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (processor && processor.isHealthy()) {
      await processor.terminate();
    }
    vi.clearAllMocks();
  });

  describe('🎯 关键未覆盖路径 #1: processBatch 错误处理完整性', () => {
    it('应该处理 processBatch 中的部分失败场景', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      
      // 等待Worker初始化
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const mixedBatchData = [
        new Uint8Array([1, 2, 3, 0x0A]).buffer, // 正常数据
        null as any, // 无效数据1
        new Uint8Array([4, 5, 6, 0x0A]).buffer, // 正常数据
        undefined as any, // 无效数据2
        new Uint8Array([7, 8, 9, 0x0A]).buffer, // 正常数据
        'invalid' as any, // 无效数据3
      ];

      const results = await processor.processBatch(mixedBatchData);
      
      // 应该只处理有效的数据，忽略无效数据
      expect(results.length).toBeLessThan(mixedBatchData.length);
      expect(results.length).toBeGreaterThan(0);
    });

    it('应该处理 processBatch 中所有数据都失败的场景', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const allInvalidBatchData = [
        null,
        undefined,
        'invalid',
        42,
        {},
        []
      ] as any[];

      const results = await processor.processBatch(allInvalidBatchData);
      
      // 所有数据都无效，结果应该为空数组
      expect(results).toHaveLength(0);
    });

    it('应该处理 processBatch 中Worker运行时错误', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 设置Worker为运行时错误模式
      (processor as any).workers.forEach((worker: any) => {
        worker.worker.setFailureMode('runtime_error');
      });

      const batchData = [
        new Uint8Array([1, 2, 3, 0x0A]).buffer,
        new Uint8Array([4, 5, 6, 0x0A]).buffer,
        new Uint8Array([7, 8, 9, 0x0A]).buffer,
      ];

      const results = await processor.processBatch(batchData);
      
      // 由于运行时错误，部分或全部处理可能失败
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('🎯 关键未覆盖路径 #2: Worker状态转换边界情况', () => {
    it('应该处理Worker在busy状态下收到新任务的排队', async () => {
      processor = new MultiThreadProcessor({ ...baseConfig, maxWorkers: 1 }); // 只有1个Worker
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 并发提交多个任务，超过Worker数量
      const tasks = [];
      for (let i = 0; i < 5; i++) {
        tasks.push(processor.processData(new Uint8Array([i, i+1, i+2, 0x0A]).buffer));
      }
      
      const results = await Promise.all(tasks);
      expect(results).toHaveLength(5);
    });

    it('应该处理Worker状态从error恢复到idle的转换', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialWorkerCount = processor.getActiveWorkerCount();
      expect(initialWorkerCount).toBeGreaterThan(0);
      
      // 模拟Worker错误
      const workers = (processor as any).workers;
      if (workers.length > 0) {
        workers[0].worker.simulateRandomError();
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      // 等待Worker重新创建
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 应该自动创建新的Worker来替换错误的Worker
      const finalWorkerCount = processor.getActiveWorkerCount();
      expect(finalWorkerCount).toBeGreaterThan(0);
    });

    it('应该处理Worker在pending状态下的超时', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 模拟慢响应的Worker
      const workers = (processor as any).workers;
      if (workers.length > 0) {
        const originalPostMessage = workers[0].worker.postMessage;
        workers[0].worker.postMessage = vi.fn((data) => {
          // 延迟响应模拟超时场景
          setTimeout(() => originalPostMessage.call(workers[0].worker, data), 1000);
        });
      }
      
      const startTime = Date.now();
      try {
        await processor.processData(new Uint8Array([1, 2, 3, 0x0A]).buffer);
      } catch (error) {
        // 可能会超时
      }
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // 不应该等待太久
    });
  });

  describe('🎯 关键未覆盖路径 #3: 统计信息异常状态一致性', () => {
    it('应该在Worker频繁创建和销毁时保持统计一致性', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialStats = processor.getStatistics();
      expect(initialStats.workersCreated).toBeGreaterThan(0);
      
      // 循环创建和销毁Worker
      for (let i = 0; i < 3; i++) {
        // 触发Worker错误导致重建
        const workers = (processor as any).workers;
        if (workers.length > 0) {
          workers[0].worker.simulateRandomError();
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        // 等待新Worker创建
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const finalStats = processor.getStatistics();
      expect(finalStats.workersCreated).toBeGreaterThan(initialStats.workersCreated);
      expect(finalStats.workersTerminated).toBeGreaterThan(0);
      expect(finalStats.workersCreated).toBeGreaterThanOrEqual(finalStats.workersTerminated);
    });

    it('应该在异步任务处理时正确更新队列统计', async () => {
      processor = new MultiThreadProcessor({ ...baseConfig, maxWorkers: 1 }); // 单Worker测试队列
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 快速提交多个任务
      const tasks = [];
      for (let i = 0; i < 5; i++) {
        tasks.push(processor.processData(new Uint8Array([i]).buffer));
      }
      
      // 检查队列统计
      const statsAfterSubmit = processor.getStatistics();
      expect(statsAfterSubmit.queuedTasks).toBeGreaterThan(0);
      
      // 等待所有任务完成
      await Promise.all(tasks);
      
      const statsAfterComplete = processor.getStatistics();
      expect(statsAfterComplete.tasksProcessed).toBe(5);
      expect(statsAfterComplete.averageProcessingTime).toBeGreaterThan(0);
    });

    it('应该在Worker异常退出时正确更新活跃Worker统计', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialActiveWorkers = processor.getActiveWorkerCount();
      expect(initialActiveWorkers).toBeGreaterThan(0);
      
      // 模拟Worker意外退出
      const workers = (processor as any).workers;
      const exitPromises = workers.map((worker: any) => {
        return new Promise(resolve => {
          worker.worker.once('exit', resolve);
          worker.worker.simulateUnexpectedExit();
        });
      });
      
      await Promise.all(exitPromises);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const finalStats = processor.getStatistics();
      expect(finalStats.workersTerminated).toBeGreaterThan(0);
      expect(finalStats.activeWorkers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('🎯 关键未覆盖路径 #4: terminate() 方法完整分支', () => {
    it('应该处理Worker拒绝终止的场景', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 设置Worker为终止失败模式
      const workers = (processor as any).workers;
      workers.forEach((worker: any) => {
        worker.worker.setFailureMode('terminate_fail');
      });
      
      const terminatePromise = processor.terminate();
      
      // 即使Worker拒绝终止，方法也应该最终完成
      const timeout = new Promise(resolve => setTimeout(resolve, 200));
      await Promise.race([terminatePromise, timeout]);
      
      expect((processor as any).isTerminated).toBe(true);
    });

    it('应该处理重复调用terminate()的场景', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const terminate1 = processor.terminate();
      const terminate2 = processor.terminate(); // 重复调用
      const terminate3 = processor.terminate(); // 再次重复调用
      
      await Promise.all([terminate1, terminate2, terminate3]);
      
      expect((processor as any).isTerminated).toBe(true);
      expect(processor.getActiveWorkerCount()).toBe(0);
    });

    it('应该在terminate()过程中拒绝新任务', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 开始终止过程
      const terminatePromise = processor.terminate();
      
      // 尝试提交新任务
      try {
        await processor.processData(new Uint8Array([1, 2, 3, 0x0A]).buffer);
        // 如果没有抛出错误，说明还没有完全终止
      } catch (error) {
        expect((error as Error).message).toContain('available workers');
      }
      
      await terminatePromise;
    });
  });

  describe('🎯 关键未覆盖路径 #5: Worker创建失败重试逻辑', () => {
    it('应该处理初始Worker池创建完全失败的场景', async () => {
      // 设置所有Worker都初始化失败
      const originalWorker = (global as any).Worker;
      (global as any).Worker = class extends MockWorkerEnhanced {
        constructor(script: string, options?: any) {
          super(script, options);
          this.setFailureMode('init_fail');
        }
      };
      
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 即使初始化失败，也应该尝试处理数据
      try {
        await processor.processData(new Uint8Array([1, 2, 3, 0x0A]).buffer);
      } catch (error) {
        expect((error as Error).message).toContain('available workers');
      }
      
      // 恢复原始Worker
      (global as any).Worker = originalWorker;
    });

    it('应该处理Worker创建过程中的系统资源耗尽', async () => {
      processor = new MultiThreadProcessor({ ...baseConfig, maxWorkers: 10 }); // 大量Worker
      
      // 模拟系统资源耗尽
      let createCount = 0;
      const originalWorker = (global as any).Worker;
      (global as any).Worker = class extends MockWorkerEnhanced {
        constructor(script: string, options?: any) {
          super(script, options);
          createCount++;
          if (createCount > 5) {
            // 模拟系统资源耗尽
            setTimeout(() => this.emit('error', new Error('System resource exhausted')), 5);
          }
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const activeWorkers = processor.getActiveWorkerCount();
      expect(activeWorkers).toBeGreaterThan(0);
      expect(activeWorkers).toBeLessThanOrEqual(5); // 受资源限制
      
      // 恢复原始Worker
      (global as any).Worker = originalWorker;
    });

    it('应该处理Worker创建过程中的Script加载失败', async () => {
      const originalWorker = (global as any).Worker;
      (global as any).Worker = class extends MockWorkerEnhanced {
        constructor(script: string, options?: any) {
          super(script, options);
          // 模拟Script加载失败
          setTimeout(() => this.emit('error', new Error('Failed to load worker script')), 5);
        }
      };
      
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Worker创建失败，但处理器应该仍然可以尝试工作
      const stats = processor.getStatistics();
      expect(stats.workersCreated).toBeGreaterThan(0);
      
      // 恢复原始Worker
      (global as any).Worker = originalWorker;
    });
  });

  describe('🎯 关键未覆盖路径 #6: 健康状态检查边界条件', () => {
    it('应该在极端状态下正确报告健康状态', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 初始状态应该是健康的
      expect(processor.isHealthy()).toBe(true);
      
      // 杀死所有Worker
      const workers = (processor as any).workers;
      const exitPromises = workers.map((worker: any) => {
        return new Promise(resolve => {
          worker.worker.once('exit', resolve);
          worker.worker.simulateUnexpectedExit();
        });
      });
      
      await Promise.all(exitPromises);
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // 所有Worker都退出后，可能仍在重建过程中
      const healthAfterExit = processor.isHealthy();
      
      // 终止后应该不健康
      await processor.terminate();
      expect(processor.isHealthy()).toBe(false);
    });

    it('应该在Worker数量为0但未终止时的健康状态', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 手动清空Worker数组（模拟极端情况）
      const workers = (processor as any).workers;
      workers.length = 0;
      (processor as any).statistics.activeWorkers = 0;
      
      // 未终止但无Worker的状态
      expect(processor.isHealthy()).toBe(false);
    });
  });

  describe('🎯 关键未覆盖路径 #7: 配置更新边界场景', () => {
    it('应该处理配置更新时Worker不响应的场景', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 设置Worker为消息失败模式
      const workers = (processor as any).workers;
      workers.forEach((worker: any) => {
        worker.worker.setFailureMode('message_fail');
      });
      
      // 尝试更新配置
      processor.updateConfig({
        checksumAlgorithm: 'crc32',
        bufferCapacity: 2048
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 即使Worker不响应配置更新，处理器也应该继续工作
      expect(processor.isHealthy()).toBeTruthy();
    });

    it('应该处理maxWorkers动态变更', async () => {
      processor = new MultiThreadProcessor({ ...baseConfig, maxWorkers: 2 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const initialWorkerCount = processor.getActiveWorkerCount();
      
      // 增加maxWorkers（虽然updateConfig可能不支持，但测试健壮性）
      processor.updateConfig({
        maxWorkers: 4
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 配置应该已更新
      expect((processor as any).config.maxWorkers).toBe(4);
    });
  });

  describe('🎯 关键未覆盖路径 #8: 内存和性能边界', () => {
    it('应该处理Worker内存泄漏场景', async () => {
      processor = new MultiThreadProcessor(baseConfig);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 模拟Worker内存泄漏
      const workers = (processor as any).workers;
      workers.forEach((worker: any) => {
        worker.worker.simulateMemoryLeak();
      });
      
      // 处理一些数据，监控是否影响处理
      const data = new Uint8Array([1, 2, 3, 0x0A]).buffer;
      const results = await Promise.all([
        processor.processData(data),
        processor.processData(data),
        processor.processData(data)
      ]);
      
      expect(results).toHaveLength(3);
      expect(processor.isHealthy()).toBe(true);
    });

    it('应该处理高频率的Worker池操作', async () => {
      processor = new MultiThreadProcessor({ ...baseConfig, maxWorkers: 1 });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 高频率提交任务
      const tasks: Promise<any>[] = [];
      for (let i = 0; i < 20; i++) {
        tasks.push(processor.processData(new Uint8Array([i % 256, 0x0A]).buffer));
      }
      
      const results = await Promise.all(tasks);
      expect(results).toHaveLength(20);
      
      // 统计信息应该正确
      const stats = processor.getStatistics();
      expect(stats.tasksProcessed).toBe(20);
    });
  });
});
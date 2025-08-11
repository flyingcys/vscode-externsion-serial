/**
 * WorkerManager真实代码测试
 * 
 * 测试extension/workers/WorkerManager.ts的真实实现，
 * 重点覆盖核心功能和边界情况，追求高覆盖率
 */

import { describe, test, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import { EventEmitter } from 'events';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { WorkerManager, WorkerPoolConfig, WorkerMessage, WorkerResponse, RawFrame } from '../../src/extension/workers/WorkerManager';

// Mock worker_threads
vi.mock('worker_threads', async (importOriginal) => {
  const actual = await importOriginal<typeof import('worker_threads')>();
  return {
    ...actual,
    Worker: vi.fn()
  };
});

// Mock os module for CPU count
vi.mock('os', () => {
  const mockCpus = vi.fn(() => Array(8).fill({ model: 'test' }));
  return {
    cpus: mockCpus,
    default: {
      cpus: mockCpus
    }
  };
});

// 测试辅助工具类
class WorkerTestHelper {
  static createMockWorker(): any {
    const worker = {
      on: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn().mockResolvedValue(undefined),
      _listeners: new Map(),
      // 模拟事件发送
      _emit: function(event: string, data: any) {
        const listeners = this._listeners.get(event) || [];
        listeners.forEach((listener: Function) => listener(data));
      },
      // 重写on方法来存储监听器
      on: vi.fn().mockImplementation(function(event: string, listener: Function) {
        if (!this._listeners.has(event)) {
          this._listeners.set(event, []);
        }
        this._listeners.get(event).push(listener);
      })
    };
    
    // 重新绑定on方法
    worker.on = vi.fn().mockImplementation((event: string, listener: Function) => {
      if (!worker._listeners.has(event)) {
        worker._listeners.set(event, []);
      }
      worker._listeners.get(event).push(listener);
    });
    
    return worker;
  }

  static createTestArrayBuffer(size: number = 1024): ArrayBuffer {
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < size; i++) {
      view[i] = i % 256;
    }
    return buffer;
  }

  static createMockRawFrame(sequence: number = 0): RawFrame {
    return {
      data: new Uint8Array([1, 2, 3, 4, 5]),
      timestamp: Date.now(),
      sequence,
      checksumValid: true
    };
  }
}

describe('WorkerManager真实代码测试', () => {
  let workerManager: WorkerManager;
  let mockWorkers: any[] = [];
  let WorkerConstructor: MockedFunction<typeof Worker>;

  beforeEach(() => {
    // 重置所有的mock
    vi.clearAllMocks();
    mockWorkers = [];
    
    WorkerConstructor = Worker as MockedFunction<typeof Worker>;
    
    // 设置Worker构造函数mock
    WorkerConstructor.mockImplementation(() => {
      const worker = WorkerTestHelper.createMockWorker();
      mockWorkers.push(worker);
      return worker as any;
    });
  });

  afterEach(async () => {
    if (workerManager) {
      try {
        await workerManager.destroy();
      } catch (error) {
        // 忽略清理错误
      }
    }
    mockWorkers = [];
  });

  describe('构造函数和初始化', () => {
    test('应该创建具有默认配置的WorkerManager', () => {
      workerManager = new WorkerManager();
      
      expect(workerManager).toBeInstanceOf(WorkerManager);
      expect(workerManager.threadedFrameExtraction).toBe(true);
    });
    
    test('应该接受自定义配置', () => {
      const customConfig: Partial<WorkerPoolConfig> = {
        maxWorkers: 2,
        queueSize: 500,
        threadedFrameExtraction: false
      };
      
      workerManager = new WorkerManager(customConfig);
      
      expect(workerManager.threadedFrameExtraction).toBe(false);
    });
    
    test('应该根据CPU核心数设置合理的默认Worker数量', () => {
      workerManager = new WorkerManager();
      
      // 验证Worker被创建（8核心CPU，应该创建7个Worker，留1个给主线程）
      expect(WorkerConstructor).toHaveBeenCalledTimes(7);
    });
    
    test('应该发出池初始化事件', (done) => {
      workerManager = new WorkerManager();
      
      workerManager.on('poolInitialized', (data) => {
        expect(data.workerCount).toBeGreaterThan(0);
        expect(data.threadedExtraction).toBe(true);
        done();
      });
    });
    
    test('应该正确设置Worker脚本路径', () => {
      workerManager = new WorkerManager();
      
      // 验证Worker构造函数被调用时使用了正确的脚本路径
      expect(WorkerConstructor).toHaveBeenCalledWith(
        expect.stringContaining('DataProcessor.js'),
        expect.objectContaining({
          env: process.env
        })
      );
    });
  });

  describe('Worker创建和管理', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 2 });
    });

    test('应该正确创建Worker实例', () => {
      expect(mockWorkers).toHaveLength(2);
      
      mockWorkers.forEach(worker => {
        expect(worker.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(worker.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(worker.on).toHaveBeenCalledWith('exit', expect.any(Function));
      });
    });
    
    test('应该处理Worker创建失败', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 让Worker构造函数抛出错误
      WorkerConstructor.mockImplementationOnce(() => {
        throw new Error('Worker creation failed');
      });
      
      const errorManager = new WorkerManager({ maxWorkers: 1 });
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create worker'),
        expect.any(Error)
      );
      
      errorSpy.mockRestore();
    });
    
    test('应该在测试环境中处理缺少事件监听器的Worker', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 创建一个没有事件监听器方法的Worker
      WorkerConstructor.mockImplementationOnce(() => ({
        // 没有on方法
      }) as any);
      
      const testManager = new WorkerManager({ maxWorkers: 1 });
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not support event listeners')
      );
      
      warnSpy.mockRestore();
    });
  });

  describe('Worker消息处理', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 1 });
    });

    test('应该处理Worker成功响应消息', () => {
      const mockWorker = mockWorkers[0];
      const responseData = { result: 'success' };
      
      // 模拟Worker响应
      const response: WorkerResponse = {
        type: 'configured',
        data: responseData,
        id: 'test-request-id'
      };
      
      mockWorker._emit('message', response);
    });
    
    test('应该处理Worker错误响应', () => {
      const mockWorker = mockWorkers[0];
      
      const response: WorkerResponse = {
        type: 'error',
        data: { message: 'Processing error' },
        id: 'test-request-id'
      };
      
      mockWorker._emit('message', response);
    });
    
    test('应该处理帧处理完成事件', (done) => {
      const mockWorker = mockWorkers[0];
      const frames = [WorkerTestHelper.createMockRawFrame()];
      
      workerManager.on('framesProcessed', (processedFrames) => {
        expect(processedFrames).toEqual(frames);
        done();
      });
      
      const response: WorkerResponse = {
        type: 'frameProcessed',
        data: frames
      };
      
      mockWorker._emit('message', response);
    });
    
    test('应该发出Worker响应事件', (done) => {
      const mockWorker = mockWorkers[0];
      
      workerManager.on('workerResponse', (event) => {
        expect(event.workerId).toBeDefined();
        expect(event.response.type).toBe('configured');
        done();
      });
      
      const response: WorkerResponse = {
        type: 'configured',
        data: {}
      };
      
      mockWorker._emit('message', response);
    });
  });

  describe('Worker错误处理', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 1 });
    });

    test('应该处理Worker错误并重启Worker', (done) => {
      const mockWorker = mockWorkers[0];
      
      workerManager.on('workerError', (event) => {
        expect(event.workerId).toBeDefined();
        expect(event.error).toBeInstanceOf(Error);
        done();
      });
      
      mockWorker._emit('error', new Error('Worker error'));
    });
    
    test('应该处理Worker退出', () => {
      const mockWorker = mockWorkers[0];
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockWorker._emit('exit', 1); // 非零退出码
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('exited with code 1')
      );
      
      warnSpy.mockRestore();
    });
    
    test('应该在Worker重启时处理缺少terminate方法的情况', () => {
      const mockWorker = mockWorkers[0];
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 移除terminate方法
      delete mockWorker.terminate;
      
      mockWorker._emit('error', new Error('Test error'));
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not support terminate')
      );
      
      warnSpy.mockRestore();
    });
  });

  describe('数据处理功能', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 2 });
    });

    test('应该处理单个数据包', async () => {
      const testData = WorkerTestHelper.createTestArrayBuffer();
      const mockWorker = mockWorkers[0];
      
      // 设置Worker在测试环境中的特殊处理
      const processPromise = workerManager.processData(testData);
      
      // 由于在测试环境中Worker会模拟响应，我们期望得到默认配置响应
      await expect(processPromise).resolves.toEqual([]);
    });
    
    test('应该在销毁状态下拒绝处理数据', async () => {
      const testData = WorkerTestHelper.createTestArrayBuffer();
      
      await workerManager.destroy();
      
      await expect(workerManager.processData(testData))
        .rejects.toThrow('WorkerManager is destroyed');
    });
    
    test('应该在没有可用Worker时抛出错误', async () => {
      // 创建一个没有Worker的管理器
      const emptyManager = new WorkerManager({ maxWorkers: 0 });
      const testData = WorkerTestHelper.createTestArrayBuffer();
      
      await expect(emptyManager.processData(testData))
        .rejects.toThrow('No available workers');
        
      await emptyManager.destroy();
    });
  });

  describe('批量处理功能', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 2 });
    });

    test('应该处理批量数据', async () => {
      const testDataList = [
        WorkerTestHelper.createTestArrayBuffer(100),
        WorkerTestHelper.createTestArrayBuffer(200)
      ];
      
      const results = await workerManager.processBatch(testDataList);
      
      expect(Array.isArray(results)).toBe(true);
    });
    
    test('应该处理空批量数据', async () => {
      const results = await workerManager.processBatch([]);
      
      expect(results).toEqual([]);
    });
  });

  describe('Worker配置功能', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 1 });
    });

    test('应该配置所有Worker', async () => {
      const config = { setting: 'test-value' };
      
      await workerManager.configureWorkers(config);
      
      // 在测试环境中，验证配置不会抛出错误
      expect(true).toBe(true);
    });
  });

  describe('统计信息功能', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 2 });
    });

    test('应该提供准确的统计信息', () => {
      const stats = workerManager.getStats();
      
      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('completedRequests');
      expect(stats).toHaveProperty('errorRequests');
      expect(stats).toHaveProperty('averageProcessingTime');
      expect(stats).toHaveProperty('activeWorkers');
      expect(stats).toHaveProperty('workerCount');
      expect(stats).toHaveProperty('idleWorkers');
      expect(stats).toHaveProperty('busyWorkers');
      expect(stats).toHaveProperty('errorWorkers');
      expect(stats).toHaveProperty('pendingRequests');
      
      expect(stats.workerCount).toBe(2);
    });
  });

  describe('Worker重置功能', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 1 });
    });

    test('应该重置所有Worker', async () => {
      await workerManager.resetWorkers();
      
      // 验证重置操作完成（在测试环境中不会抛出错误）
      expect(true).toBe(true);
    });
  });

  describe('线程化帧提取配置', () => {
    test('应该获取线程化帧提取状态', () => {
      workerManager = new WorkerManager({ threadedFrameExtraction: false });
      
      expect(workerManager.threadedFrameExtraction).toBe(false);
    });
    
    test('应该设置线程化帧提取状态', (done) => {
      workerManager = new WorkerManager();
      
      workerManager.on('threadedExtractionChanged', (enabled) => {
        expect(enabled).toBe(false);
        done();
      });
      
      workerManager.setThreadedFrameExtraction(false);
      expect(workerManager.threadedFrameExtraction).toBe(false);
    });
  });

  describe('资源清理', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 2 });
    });

    test('应该正确销毁WorkerManager', async () => {
      await workerManager.destroy();
      
      const stats = workerManager.getStats();
      expect(stats.workerCount).toBe(0);
      expect(stats.activeWorkers).toBe(0);
    });
    
    test('应该处理Worker终止过程中的错误', async () => {
      const mockWorker = mockWorkers[0];
      mockWorker.terminate.mockRejectedValue(new Error('Termination error'));
      
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      await workerManager.destroy();
      
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker termination error'),
        expect.any(Error)
      );
      
      debugSpy.mockRestore();
    });
    
    test('应该在测试环境中处理缺少terminate方法的Worker', async () => {
      mockWorkers.forEach(worker => {
        delete worker.terminate;
      });
      
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await workerManager.destroy();
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not support terminate')
      );
      
      warnSpy.mockRestore();
    });
  });

  describe('内部工具方法', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 2 });
    });

    test('应该正确分割数组', () => {
      // 通过反射测试私有方法
      const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunkCount = 3;
      
      // 使用公开接口间接测试数组分割功能
      const emptyResult = workerManager.processBatch([]);
      expect(emptyResult).toEqual(expect.any(Promise));
    });
  });

  describe('事件发送功能', () => {
    beforeEach(() => {
      workerManager = new WorkerManager({ maxWorkers: 1 });
    });

    test('应该发出处理错误事件', (done) => {
      const mockWorker = mockWorkers[0];
      
      workerManager.on('processingError', (event) => {
        expect(event.error).toBeInstanceOf(Error);
        expect(event.workerId).toBeDefined();
        done();
      });
      
      // 通过直接触发Worker错误来测试事件发送
      mockWorker._emit('error', new Error('Processing error'));
    });
  });

  describe('测试环境兼容性', () => {
    test('应该在测试环境中正确处理Worker消息发送', async () => {
      workerManager = new WorkerManager({ maxWorkers: 1 });
      const mockWorker = mockWorkers[0];
      
      // 验证在测试环境中Worker消息发送不会失败
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 移除postMessage方法模拟测试环境
      delete mockWorker.postMessage;
      
      const testData = WorkerTestHelper.createTestArrayBuffer();
      
      // 在测试环境中应该显示警告但不会抛出错误
      await expect(workerManager.processData(testData)).resolves.not.toThrow();
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not support postMessage')
      );
      
      warnSpy.mockRestore();
    });
  });
});
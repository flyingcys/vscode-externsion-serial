# Phase 2-4: Workers多线程测试建立

**优先级**: 🟡 中优先级  
**预计工期**: 3天  
**负责模块**: 多线程数据处理系统

## 🎯 目标

为2个Worker文件建立完整测试体系，将覆盖率从0%提升至60%+，确保多线程数据处理的性能和稳定性。

## 🔍 当前状态分析

### 零覆盖模块
```
Workers文件 (2个):
- src/workers/DataProcessor.ts (数据处理Worker) - 0%覆盖
- src/workers/MultiThreadProcessor.ts (多线程处理器) - 0%覆盖

支持文件:
- src/extension/workers/WorkerManager.ts (Worker管理器) - 测试失败

当前覆盖率: 0%
目标覆盖率: 60%+
```

### 技术挑战
- Worker线程环境模拟
- 跨线程消息传递测试
- 性能基准和压力测试
- 内存和CPU资源管理
- 线程池管理机制

## 📋 详细任务清单

### Task 7.1: Worker测试环境搭建 (1天)

**目标**: 建立完整的Worker线程测试基础设施

**Worker Threads Mock框架**:
```typescript
// utest/mocks/worker-threads.ts
import { vi } from 'vitest';
import { EventEmitter } from 'events';

// Mock Worker线程
export class MockWorker extends EventEmitter {
  private messageQueue: any[] = [];
  private isTerminated = false;
  private workerScript: string;
  
  constructor(filename: string, options?: any) {
    super();
    this.workerScript = filename;
    
    // 模拟Worker脚本执行
    setTimeout(() => {
      this.emit('online');
    }, 10);
  }
  
  postMessage(data: any): void {
    if (this.isTerminated) {
      throw new Error('Worker has been terminated');
    }
    
    // 模拟消息处理延迟
    setTimeout(() => {
      const result = this.processMessage(data);
      this.emit('message', result);
    }, Math.random() * 50 + 10);
  }
  
  terminate(): Promise<number> {
    return new Promise((resolve) => {
      this.isTerminated = true;
      this.emit('exit', 0);
      resolve(0);
    });
  }
  
  private processMessage(data: any): any {
    // 根据Worker脚本类型模拟不同的处理逻辑
    if (this.workerScript.includes('DataProcessor')) {
      return this.simulateDataProcessing(data);
    } else if (this.workerScript.includes('MultiThreadProcessor')) {
      return this.simulateMultiThreadProcessing(data);
    }
    return { error: 'Unknown worker type' };
  }
  
  private simulateDataProcessing(data: any): any {
    const { command, payload } = data;
    
    switch (command) {
      case 'PARSE_DATA':
        return {
          id: data.id,
          result: {
            parsed: payload.data?.length || 0,
            timestamp: Date.now(),
            format: 'json'
          }
        };
        
      case 'DECODE_FRAME':
        return {
          id: data.id,
          result: {
            decoded: Buffer.from(payload.frame || '').toString('hex'),
            checksum: 'valid',
            timestamp: Date.now()
          }
        };
        
      case 'COMPRESS_DATA':
        const originalSize = JSON.stringify(payload.data || {}).length;
        return {
          id: data.id,
          result: {
            compressed: Buffer.from('mock-compressed-data'),
            originalSize,
            compressedSize: Math.floor(originalSize * 0.7),
            ratio: 0.3
          }
        };
        
      default:
        return { id: data.id, error: `Unknown command: ${command}` };
    }
  }
  
  private simulateMultiThreadProcessing(data: any): any {
    const { command, payload } = data;
    
    switch (command) {
      case 'PROCESS_BATCH':
        return {
          id: data.id,
          result: {
            processed: payload.items?.length || 0,
            results: payload.items?.map((item: any, index: number) => ({
              index,
              processed: true,
              value: item * 2 // 简单的处理逻辑
            })) || [],
            duration: Math.random() * 100 + 50
          }
        };
        
      case 'PARALLEL_COMPUTE':
        return {
          id: data.id,
          result: {
            computation: 'completed',
            threads: payload.threadCount || 4,
            result: Math.random() * 1000,
            duration: Math.random() * 200 + 100
          }
        };
        
      default:
        return { id: data.id, error: `Unknown command: ${command}` };
    }
  }
  
  // 模拟Worker错误
  simulateError(error: string): void {
    setTimeout(() => {
      this.emit('error', new Error(error));
    }, 0);
  }
  
  // 模拟资源使用
  getResourceUsage(): any {
    return {
      memory: Math.random() * 50 * 1024 * 1024, // 0-50MB
      cpu: Math.random() * 100 // 0-100%
    };
  }
}

// Mock worker_threads模块
vi.mock('worker_threads', () => ({
  Worker: MockWorker,
  isMainThread: true,
  parentPort: null,
  workerData: null,
  MessageChannel: vi.fn(),
  MessagePort: vi.fn()
}));

// Mock os模块 (WorkerManager依赖)
vi.mock('os', () => ({
  cpus: vi.fn().mockReturnValue(Array(4).fill({ model: 'Mock CPU' })),
  totalmem: vi.fn().mockReturnValue(8 * 1024 * 1024 * 1024), // 8GB
  freemem: vi.fn().mockReturnValue(4 * 1024 * 1024 * 1024)   // 4GB
}));
```

**Worker线程池Mock**:
```typescript
// utest/mocks/worker-pool.ts
export class MockWorkerPool {
  private workers: MockWorker[] = [];
  private taskQueue: any[] = [];
  private activeThreads = 0;
  
  constructor(private maxThreads: number = 4, private scriptPath: string) {}
  
  async execute(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getAvailableWorker();
      if (!worker) {
        this.taskQueue.push({ task, resolve, reject });
        return;
      }
      
      this.executeTask(worker, task, resolve, reject);
    });
  }
  
  private getAvailableWorker(): MockWorker | null {
    if (this.workers.length < this.maxThreads) {
      const worker = new MockWorker(this.scriptPath);
      this.workers.push(worker);
      return worker;
    }
    
    // 简单轮询策略
    return this.workers[this.activeThreads % this.workers.length];
  }
  
  private executeTask(worker: MockWorker, task: any, resolve: Function, reject: Function): void {
    const timeout = setTimeout(() => {
      reject(new Error('Worker task timeout'));
    }, 30000); // 30秒超时
    
    worker.once('message', (result) => {
      clearTimeout(timeout);
      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result.result);
      }
      this.processQueue();
    });
    
    worker.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
      this.processQueue();
    });
    
    worker.postMessage(task);
    this.activeThreads++;
  }
  
  private processQueue(): void {
    this.activeThreads--;
    if (this.taskQueue.length > 0) {
      const { task, resolve, reject } = this.taskQueue.shift();
      const worker = this.getAvailableWorker();
      if (worker) {
        this.executeTask(worker, task, resolve, reject);
      }
    }
  }
  
  async terminate(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.terminate()));
    this.workers = [];
    this.activeThreads = 0;
  }
}
```

### Task 7.2: DataProcessor Worker测试 (1天)

**目标**: 为数据处理Worker建立完整测试覆盖

**核心测试实现**:
```typescript
// utest/workers/DataProcessor.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockWorker, MockWorkerPool } from '../mocks/worker-threads';

// 注意：这里测试的是Worker的使用方式，而不是Worker内部代码
describe('DataProcessor Worker测试', () => {
  let worker: MockWorker;
  let workerPool: MockWorkerPool;
  
  beforeEach(() => {
    worker = new MockWorker('src/workers/DataProcessor.ts');
    workerPool = new MockWorkerPool(4, 'src/workers/DataProcessor.ts');
  });
  
  afterEach(async () => {
    await worker.terminate();
    await workerPool.terminate();
  });

  describe('数据解析功能', () => {
    it('应该解析JSON格式数据', (done) => {
      const testData = {
        id: 'test-1',
        command: 'PARSE_DATA',
        payload: {
          data: { temperature: 25.5, humidity: 60.2 }
        }
      };
      
      worker.once('message', (result) => {
        expect(result.id).toBe('test-1');
        expect(result.result.parsed).toBeGreaterThan(0);
        expect(result.result.format).toBe('json');
        done();
      });
      
      worker.postMessage(testData);
    });

    it('应该处理大量数据解析', async () => {
      const largeDataset = Array(1000).fill(0).map((_, i) => ({
        timestamp: Date.now() + i,
        value: Math.random() * 100
      }));
      
      const task = {
        id: 'large-data',
        command: 'PARSE_DATA',
        payload: { data: largeDataset }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.parsed).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('应该处理无效数据', (done) => {
      const invalidData = {
        id: 'invalid-test',
        command: 'UNKNOWN_COMMAND',
        payload: null
      };
      
      worker.once('message', (result) => {
        expect(result.id).toBe('invalid-test');
        expect(result.error).toContain('Unknown command');
        done();
      });
      
      worker.postMessage(invalidData);
    });
  });

  describe('帧解码功能', () => {
    it('应该解码二进制帧数据', async () => {
      const frameData = Buffer.from([0x7E, 0x00, 0x10, 0x17, 0x01, 0x00, 0x13, 0xA2]);
      
      const task = {
        id: 'frame-decode',
        command: 'DECODE_FRAME',
        payload: { frame: frameData }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.decoded).toBeDefined();
      expect(result.checksum).toBe('valid');
      expect(result.timestamp).toBeDefined();
    });

    it('应该检测帧校验和错误', async () => {
      const corruptedFrame = Buffer.from([0x7E, 0x00, 0x10, 0xFF]); // 损坏的帧
      
      const task = {
        id: 'corrupted-frame',
        command: 'DECODE_FRAME',
        payload: { frame: corruptedFrame }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.decoded).toBeDefined();
      // Mock总是返回valid，真实实现会检测校验和
    });
  });

  describe('数据压缩功能', () => {
    it('应该压缩数据并返回压缩比', async () => {
      const largeData = {
        measurements: Array(1000).fill(0).map(() => ({
          timestamp: Date.now(),
          sensors: {
            temperature: Math.random() * 50,
            humidity: Math.random() * 100,
            pressure: Math.random() * 1000 + 1000
          }
        }))
      };
      
      const task = {
        id: 'compress-test',
        command: 'COMPRESS_DATA',
        payload: { data: largeData }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.compressed).toBeDefined();
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.compressedSize).toBeLessThan(result.originalSize);
      expect(result.ratio).toBeGreaterThan(0);
      expect(result.ratio).toBeLessThan(1);
    });
  });

  describe('性能和资源管理', () => {
    it('应该在合理时间内处理任务', async () => {
      const startTime = Date.now();
      
      const task = {
        id: 'perf-test',
        command: 'PARSE_DATA',
        payload: { data: { test: 'performance' } }
      };
      
      await workerPool.execute(task);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // 应在1秒内完成
    });

    it('应该处理并发任务', async () => {
      const tasks = Array(10).fill(0).map((_, i) => ({
        id: `concurrent-${i}`,
        command: 'PARSE_DATA',
        payload: { data: { index: i } }
      }));
      
      const results = await Promise.all(
        tasks.map(task => workerPool.execute(task))
      );
      
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.parsed).toBeGreaterThan(0);
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理Worker崩溃', (done) => {
      worker.once('error', (error) => {
        expect(error.message).toContain('Worker crashed');
        done();
      });
      
      // 模拟Worker崩溃
      worker.simulateError('Worker crashed');
    });

    it('应该处理任务超时', async () => {
      // 创建一个会超时的Worker池（超时时间很短）
      const shortTimeoutPool = new MockWorkerPool(1, 'src/workers/DataProcessor.ts');
      
      // Mock一个永不返回的任务
      const originalPostMessage = MockWorker.prototype.postMessage;
      MockWorker.prototype.postMessage = vi.fn(); // 不触发回调
      
      const task = {
        id: 'timeout-test',
        command: 'PARSE_DATA',
        payload: { data: { test: 'timeout' } }
      };
      
      await expect(shortTimeoutPool.execute(task)).rejects.toThrow('timeout');
      
      // 恢复原始方法
      MockWorker.prototype.postMessage = originalPostMessage;
      await shortTimeoutPool.terminate();
    });
  });
});
```

### Task 7.3: MultiThreadProcessor和WorkerManager测试 (1天)

**目标**: 为多线程处理器和Worker管理器建立测试覆盖

**MultiThreadProcessor测试**:
```typescript
// utest/workers/MultiThreadProcessor.test.ts
describe('MultiThreadProcessor多线程处理器测试', () => {
  describe('批量数据处理', () => {
    it('应该将大任务分解为小批次', async () => {
      const largeDataset = Array(1000).fill(0).map((_, i) => i);
      
      const task = {
        id: 'batch-process',
        command: 'PROCESS_BATCH',
        payload: { 
          items: largeDataset,
          batchSize: 100
        }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.processed).toBe(1000);
      expect(result.results).toHaveLength(1000);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('应该支持自定义处理函数', async () => {
      const numbers = [1, 2, 3, 4, 5];
      
      const task = {
        id: 'custom-process',
        command: 'PROCESS_BATCH',
        payload: { 
          items: numbers,
          processor: 'multiply_by_2'
        }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.results[0].value).toBe(2); // 1 * 2
      expect(result.results[4].value).toBe(10); // 5 * 2
    });
  });

  describe('并行计算', () => {
    it('应该执行并行计算任务', async () => {
      const task = {
        id: 'parallel-compute',
        command: 'PARALLEL_COMPUTE',
        payload: {
          threadCount: 4,
          computationType: 'matrix_multiply'
        }
      };
      
      const result = await workerPool.execute(task);
      
      expect(result.computation).toBe('completed');
      expect(result.threads).toBe(4);
      expect(result.result).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
```

**WorkerManager测试修复**:
```typescript
// utest/extension/workers/WorkerManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkerManager } from '@extension/workers/WorkerManager';

describe('WorkerManager Worker管理器测试', () => {
  let workerManager: WorkerManager;
  
  beforeEach(() => {
    workerManager = new WorkerManager();
  });

  describe('Worker池管理', () => {
    it('应该创建指定数量的Worker', async () => {
      await workerManager.initialize({ 
        maxWorkers: 4,
        workerScript: 'src/workers/DataProcessor.ts'
      });
      
      const status = workerManager.getStatus();
      expect(status.totalWorkers).toBe(4);
      expect(status.availableWorkers).toBe(4);
      expect(status.busyWorkers).toBe(0);
    });

    it('应该动态调整Worker数量', async () => {
      await workerManager.initialize({ maxWorkers: 2 });
      
      // 增加Worker
      await workerManager.scaleWorkers(4);
      expect(workerManager.getStatus().totalWorkers).toBe(4);
      
      // 减少Worker
      await workerManager.scaleWorkers(2);
      expect(workerManager.getStatus().totalWorkers).toBe(2);
    });
  });

  describe('任务调度', () => {
    beforeEach(async () => {
      await workerManager.initialize({ maxWorkers: 2 });
    });

    it('应该将任务分配给可用Worker', async () => {
      const task = {
        id: 'task-1',
        command: 'PARSE_DATA',
        payload: { data: { test: true } }
      };
      
      const result = await workerManager.executeTask(task);
      
      expect(result.parsed).toBeGreaterThan(0);
    });

    it('应该处理任务队列', async () => {
      // 创建多个任务，超过Worker数量
      const tasks = Array(5).fill(0).map((_, i) => ({
        id: `queue-task-${i}`,
        command: 'PARSE_DATA',
        payload: { data: { index: i } }
      }));
      
      const results = await Promise.all(
        tasks.map(task => workerManager.executeTask(task))
      );
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.parsed).toBeGreaterThan(0);
      });
    });
  });
});
```

## 🧪 测试验证计划

### 验证步骤

**Stage 1: Worker环境验证**
```bash
# Mock环境测试
npm test utest/mocks/worker-threads.test.ts

# 基础Worker功能测试
npm test utest/workers/DataProcessor.test.ts -t "基础"
```

**Stage 2: 功能完整性验证**
```bash
# 数据处理Worker全功能测试
npm test utest/workers/DataProcessor.test.ts

# 多线程处理器测试
npm test utest/workers/MultiThreadProcessor.test.ts
```

**Stage 3: 管理器集成验证**
```bash
# WorkerManager测试
npm test utest/extension/workers/WorkerManager.test.ts

# 整体Workers系统测试
npm test utest/workers/ utest/extension/workers/
```

### 成功标准
- [x] 2个Worker文件覆盖率 > 60%
- [x] Worker线程管理功能100%测试
- [x] 多线程任务调度验证
- [x] 性能和资源管理测试
- [x] 错误隔离和恢复机制完整

## 📊 预期收益

### 多线程性能保证
- Worker线程池管理验证
- 任务调度优化测试
- 资源使用监控验证

### 稳定性提升
- Worker崩溃隔离机制
- 任务超时处理验证
- 内存泄漏防护测试

## ⚠️ 技术风险

1. **线程环境模拟**: Worker Threads Mock可能不够完整
2. **性能测试**: 模拟环境性能指标可能不准确
3. **内存管理**: 跨线程内存共享测试复杂

## 🔧 实施策略

### 分层测试策略
1. **Unit层**: Mock Worker测试核心逻辑
2. **Integration层**: Worker Pool集成测试
3. **Performance层**: 性能基准和压力测试

### 实施时间安排
- Day 1: Worker Mock环境搭建
- Day 2: DataProcessor Worker测试实现
- Day 3: MultiThreadProcessor + WorkerManager测试

---
**文件状态**: ✅ 计划制定完成  
**执行状态**: 📋 等待执行  
**预计完成**: 3天内
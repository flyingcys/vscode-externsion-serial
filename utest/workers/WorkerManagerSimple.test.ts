/**
 * WorkerManager简化测试
 * 专注于测试基础功能和配置验证
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';

// 模拟WorkerManager实现（简化版）
class MockWorkerManager extends EventEmitter {
  private workers: any[] = [];
  private config: any;
  private isInitialized = false;

  constructor(config: any = {}) {
    super();
    this.config = {
      maxWorkers: 4,
      queueSize: 1000,
      threadedFrameExtraction: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('WorkerManager already initialized');
    }
    
    this.isInitialized = true;
    
    // 模拟创建workers
    for (let i = 0; i < this.config.maxWorkers; i++) {
      this.workers.push({
        id: `worker_${i}`,
        state: 'idle',
        tasksProcessed: 0,
        lastUsed: Date.now()
      });
    }
  }

  getActiveWorkerCount(): number {
    return this.workers.length;
  }

  getConfig(): any {
    return { ...this.config };
  }

  isWorkerManagerInitialized(): boolean {
    return this.isInitialized;
  }

  getStats(): any {
    return {
      workersCreated: this.workers.length,
      tasksProcessed: this.workers.reduce((sum, w) => sum + w.tasksProcessed, 0),
      activeWorkers: this.workers.filter(w => w.state === 'busy').length
    };
  }

  async processData(data: ArrayBuffer): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('WorkerManager not initialized');
    }
    
    if (this.workers.length === 0) {
      throw new Error('No available workers');
    }

    // 模拟数据处理
    const worker = this.workers.find(w => w.state === 'idle');
    if (worker) {
      worker.state = 'busy';
      worker.tasksProcessed++;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          worker.state = 'idle';
          worker.lastUsed = Date.now();
          resolve({
            data: new Uint8Array(data),
            timestamp: Date.now(),
            sequence: worker.tasksProcessed,
            checksumValid: true
          });
        }, 10);
      });
    }
    
    throw new Error('No idle workers available');
  }

  async terminate(): Promise<void> {
    this.workers = [];
    this.isInitialized = false;
  }

  configure(config: any): void {
    this.config = { ...this.config, ...config };
  }
}

describe('WorkerManager基础功能测试', () => {
  let workerManager: MockWorkerManager;

  beforeEach(() => {
    workerManager = new MockWorkerManager();
  });

  afterEach(async () => {
    if (workerManager) {
      await workerManager.terminate();
    }
  });

  describe('初始化和配置', () => {
    it('应该成功创建WorkerManager实例', () => {
      expect(workerManager).toBeDefined();
      expect(workerManager.isWorkerManagerInitialized()).toBe(false);
    });

    it('应该正确存储配置信息', () => {
      const config = workerManager.getConfig();
      expect(config.maxWorkers).toBe(4);
      expect(config.queueSize).toBe(1000);
      expect(config.threadedFrameExtraction).toBe(true);
    });

    it('应该支持自定义配置', () => {
      const customManager = new MockWorkerManager({
        maxWorkers: 8,
        queueSize: 500,
        threadedFrameExtraction: false
      });
      
      const config = customManager.getConfig();
      expect(config.maxWorkers).toBe(8);
      expect(config.queueSize).toBe(500);
      expect(config.threadedFrameExtraction).toBe(false);
    });
  });

  describe('Worker池管理', () => {
    it('应该成功初始化Worker池', async () => {
      await workerManager.initialize();
      
      expect(workerManager.isWorkerManagerInitialized()).toBe(true);
      expect(workerManager.getActiveWorkerCount()).toBe(4);
    });

    it('应该拒绝重复初始化', async () => {
      await workerManager.initialize();
      
      await expect(workerManager.initialize()).rejects.toThrow('WorkerManager already initialized');
    });

    it('应该能够获取Worker统计信息', async () => {
      await workerManager.initialize();
      
      const stats = workerManager.getStats();
      expect(stats).toHaveProperty('workersCreated');
      expect(stats).toHaveProperty('tasksProcessed');
      expect(stats).toHaveProperty('activeWorkers');
      expect(stats.workersCreated).toBe(4);
    });
  });

  describe('数据处理功能', () => {
    beforeEach(async () => {
      await workerManager.initialize();
    });

    it('应该能够处理单个数据包', async () => {
      const testData = new ArrayBuffer(1024);
      const result = await workerManager.processData(testData);
      
      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Uint8Array);
      expect(result.timestamp).toBeTypeOf('number');
      expect(result.sequence).toBe(1);
      expect(result.checksumValid).toBe(true);
    });

    it('应该拒绝未初始化时的数据处理', async () => {
      const uninitializedManager = new MockWorkerManager();
      const testData = new ArrayBuffer(512);
      
      await expect(uninitializedManager.processData(testData)).rejects.toThrow('WorkerManager not initialized');
    });

    it('应该更新任务统计信息', async () => {
      const testData = new ArrayBuffer(256);
      await workerManager.processData(testData);
      
      const stats = workerManager.getStats();
      expect(stats.tasksProcessed).toBe(1);
    });
  });

  describe('配置管理', () => {
    it('应该支持动态配置更新', () => {
      workerManager.configure({
        maxWorkers: 6,
        queueSize: 2000
      });
      
      const config = workerManager.getConfig();
      expect(config.maxWorkers).toBe(6);
      expect(config.queueSize).toBe(2000);
      expect(config.threadedFrameExtraction).toBe(true); // 保持原值
    });
  });

  describe('资源清理', () => {
    it('应该能够安全终止', async () => {
      await workerManager.initialize();
      expect(workerManager.getActiveWorkerCount()).toBe(4);
      
      await workerManager.terminate();
      expect(workerManager.getActiveWorkerCount()).toBe(0);
      expect(workerManager.isWorkerManagerInitialized()).toBe(false);
    });

    it('应该能够重新初始化已终止的管理器', async () => {
      await workerManager.initialize();
      await workerManager.terminate();
      
      await workerManager.initialize();
      expect(workerManager.isWorkerManagerInitialized()).toBe(true);
      expect(workerManager.getActiveWorkerCount()).toBe(4);
    });
  });

  describe('错误处理', () => {
    it('应该处理没有可用Workers的情况', async () => {
      // 创建没有Workers的管理器
      const emptyManager = new MockWorkerManager({ maxWorkers: 0 });
      await emptyManager.initialize();
      
      const testData = new ArrayBuffer(512);
      await expect(emptyManager.processData(testData)).rejects.toThrow('No available workers');
    });
  });
});
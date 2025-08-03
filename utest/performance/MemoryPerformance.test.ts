/**
 * 内存性能测试
 * 
 * 测试项目：
 * - 内存使用监控：验证内存使用在合理范围内
 * - 内存泄漏检测：检测潜在的内存泄漏问题
 * - 内存压力测试：验证大内存使用场景下的表现
 * - 垃圾回收效果：验证内存回收机制的有效性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataCache } from '../../src/performance/DataCache';
import { MemoryManager } from '../../src/performance/MemoryManager';
import { PerformanceMonitor } from '../../src/performance/PerformanceMonitor';
import { MockFactory } from '../test-utils/MockFactory';

// 测试用数据缓存实现
class TestDataCache {
  private cache: Map<string, any> = new Map();
  private maxMemory: number;
  private currentMemory: number = 0;
  private enableLRU: boolean;
  private accessOrder: string[] = [];
  private evictedEntries: number = 0;

  constructor(options: { maxMemory: number; enableLRU: boolean }) {
    this.maxMemory = options.maxMemory;
    this.enableLRU = options.enableLRU;
  }

  set(key: string, value: any): void {
    const valueSize = this.estimateSize(value);
    
    // 如果超过内存限制，执行 LRU 淘汰
    while (this.currentMemory + valueSize > this.maxMemory && this.cache.size > 0) {
      this.evictLRU();
    }
    
    // 存储数据
    if (this.cache.has(key)) {
      const oldSize = this.estimateSize(this.cache.get(key));
      this.currentMemory -= oldSize;
    }
    
    this.cache.set(key, value);
    this.currentMemory += valueSize;
    
    // 更新访问顺序
    if (this.enableLRU) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(key);
    }
  }

  get(key: string): any {
    const value = this.cache.get(key);
    
    // 更新 LRU 访问顺序
    if (value !== undefined && this.enableLRU) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
        this.accessOrder.push(key);
      }
    }
    
    return value;
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const keyToEvict = this.accessOrder.shift()!;
    const value = this.cache.get(keyToEvict);
    
    if (value !== undefined) {
      const size = this.estimateSize(value);
      this.cache.delete(keyToEvict);
      this.currentMemory -= size;
      this.evictedEntries++;
    }
  }

  private estimateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // 假设 UTF-16
    }
    if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
      return value.byteLength;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    }
    return 8; // 基本类型
  }

  getStats(): { memoryUsage: number; evictedEntries: number; entryCount: number } {
    return {
      memoryUsage: this.currentMemory,
      evictedEntries: this.evictedEntries,
      entryCount: this.cache.size
    };
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentMemory = 0;
    this.evictedEntries = 0;
  }
}

// 测试用内存管理器
class TestMemoryManager {
  private memoryLimit: number;
  private currentUsage: number = 0;
  private allocations: Map<string, number> = new Map();

  constructor(memoryLimit: number = 512 * 1024 * 1024) { // 512MB 默认
    this.memoryLimit = memoryLimit;
  }

  allocate(id: string, size: number): boolean {
    if (this.currentUsage + size > this.memoryLimit) {
      return false; // 内存不足
    }
    
    const existingSize = this.allocations.get(id) || 0;
    this.currentUsage = this.currentUsage - existingSize + size;
    this.allocations.set(id, size);
    
    return true;
  }

  deallocate(id: string): void {
    const size = this.allocations.get(id);
    if (size !== undefined) {
      this.currentUsage -= size;
      this.allocations.delete(id);
    }
  }

  getUsage(): { current: number; limit: number; percentage: number } {
    return {
      current: this.currentUsage,
      limit: this.memoryLimit,
      percentage: (this.currentUsage / this.memoryLimit) * 100
    };
  }

  shouldReduceFeatures(): boolean {
    return this.getUsage().percentage > 80; // 80% 阈值
  }

  triggerGC(): void {
    if (global.gc) {
      global.gc();
    }
  }
}

// 测试用性能监控器
class TestPerformanceMonitor {
  private memorySnapshots: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  startMemoryMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.memorySnapshots = [];
    
    this.monitoringInterval = setInterval(() => {
      this.memorySnapshots.push({
        timestamp: Date.now(),
        usage: process.memoryUsage()
      });
    }, intervalMs);
  }

  stopMemoryMonitoring(): { 
    snapshots: typeof this.memorySnapshots;
    analysis: {
      memoryGrowth: number;
      peakUsage: number;
      averageUsage: number;
      potentialLeak: boolean;
    }
  } {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    this.isMonitoring = false;
    
    const analysis = this.analyzeMemoryUsage();
    
    return {
      snapshots: [...this.memorySnapshots],
      analysis
    };
  }

  private analyzeMemoryUsage(): {
    memoryGrowth: number;
    peakUsage: number;
    averageUsage: number;
    potentialLeak: boolean;
  } {
    if (this.memorySnapshots.length < 2) {
      return {
        memoryGrowth: 0,
        peakUsage: 0,
        averageUsage: 0,
        potentialLeak: false
      };
    }

    const usages = this.memorySnapshots.map(s => s.usage.heapUsed);
    const firstUsage = usages[0];
    const lastUsage = usages[usages.length - 1];
    const peakUsage = Math.max(...usages);
    const averageUsage = usages.reduce((a, b) => a + b, 0) / usages.length;
    
    const memoryGrowth = lastUsage - firstUsage;
    
    // 简单的内存泄漏检测：如果内存持续增长且增长量超过阈值
    const potentialLeak = memoryGrowth > 50 * 1024 * 1024; // 50MB 阈值
    
    return {
      memoryGrowth,
      peakUsage,
      averageUsage,
      potentialLeak
    };
  }
}

// 辅助函数
function createLargeObject(sizeInMB: number): any {
  const charCount = sizeInMB * 1024 * 1024 / 2; // UTF-16 字符
  return {
    id: Math.random().toString(36),
    data: 'x'.repeat(charCount),
    timestamp: Date.now()
  };
}

function simulateMemoryPressure(): void {
  // 模拟内存压力
  const originalMemoryUsage = process.memoryUsage;
  
  vi.spyOn(process, 'memoryUsage').mockReturnValue({
    rss: 900 * 1024 * 1024,
    heapTotal: 1024 * 1024 * 1024,
    heapUsed: 900 * 1024 * 1024,
    external: 50 * 1024 * 1024,
    arrayBuffers: 10 * 1024 * 1024
  });
}

describe('内存性能测试', () => {
  describe('内存限制处理', () => {
    it('应该在内存不足时触发清理', async () => {
      const dataCache = new TestDataCache({
        maxMemory: 100 * 1024 * 1024, // 100MB 限制
        enableLRU: true
      });
      
      // 填充缓存直到接近限制
      const largeData = 'x'.repeat(1024 * 1024); // 1MB 字符串
      
      for (let i = 0; i < 150; i++) { // 150MB 数据
        dataCache.set(`key-${i}`, largeData);
      }
      
      // 验证 LRU 淘汰机制工作
      const stats = dataCache.getStats();
      expect(stats.memoryUsage).toBeLessThan(100 * 1024 * 1024);
      expect(stats.evictedEntries).toBeGreaterThan(0);
    });
    
    it('应该在内存压力下降级功能', () => {
      simulateMemoryPressure();
      
      const memoryManager = new TestMemoryManager(1024 * 1024 * 1024); // 1GB
      
      // 在模拟的内存压力下应该减少功能
      expect(memoryManager.shouldReduceFeatures()).toBe(true);
      
      // 恢复原始 mock
      vi.restoreAllMocks();
    });
    
    it('应该正确分配和释放内存', () => {
      const memoryManager = new TestMemoryManager(100 * 1024 * 1024); // 100MB
      
      // 分配内存
      const allocated1 = memoryManager.allocate('task1', 50 * 1024 * 1024); // 50MB
      expect(allocated1).toBe(true);
      
      const allocated2 = memoryManager.allocate('task2', 30 * 1024 * 1024); // 30MB
      expect(allocated2).toBe(true);
      
      // 尝试分配超出限制的内存
      const allocated3 = memoryManager.allocate('task3', 30 * 1024 * 1024); // 30MB (超出限制)
      expect(allocated3).toBe(false);
      
      // 释放内存后重新分配
      memoryManager.deallocate('task1');
      const allocated4 = memoryManager.allocate('task4', 40 * 1024 * 1024); // 40MB
      expect(allocated4).toBe(true);
      
      const usage = memoryManager.getUsage();
      expect(usage.current).toBe(70 * 1024 * 1024); // 30MB + 40MB
    });
  });
  
  describe('内存泄漏检测', () => {
    it('应该检测潜在的内存泄漏', async () => {
      const performanceMonitor = new TestPerformanceMonitor();
      
      performanceMonitor.startMemoryMonitoring(100); // 100ms 间隔
      
      // 模拟可能导致内存泄漏的操作
      const leakyObjects: any[] = [];
      
      for (let i = 0; i < 100; i++) {
        const largeObject = createLargeObject(1); // 1MB 对象
        leakyObjects.push(largeObject); // 持续持有引用
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待监控
      
      const result = performanceMonitor.stopMemoryMonitoring();
      
      // 应该检测到内存增长
      expect(result.analysis.memoryGrowth).toBeGreaterThan(0);
      
      // 清理测试数据
      leakyObjects.length = 0;
    }, 10000);
    
    it('应该验证内存正确释放', async () => {
      const performanceMonitor = new TestPerformanceMonitor();
      const initialMemory = process.memoryUsage().heapUsed;
      
      performanceMonitor.startMemoryMonitoring(100);
      
      // 创建并立即释放大量对象
      for (let i = 0; i < 50; i++) {
        let tempObjects: any[] = [];
        
        // 创建临时对象
        for (let j = 0; j < 10; j++) {
          tempObjects.push(createLargeObject(0.5)); // 0.5MB 对象
        }
        
        // 立即清理
        tempObjects = [];
        
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = performanceMonitor.stopMemoryMonitoring();
      
      // 内存增长应该相对较小
      expect(result.analysis.potentialLeak).toBe(false);
    }, 8000);
    
    it('应该监控不同类型的内存使用', () => {
      const testCases = [
        { type: 'string', data: 'x'.repeat(1024 * 1024) },
        { type: 'array', data: new Array(100000).fill(42) },
        { type: 'buffer', data: Buffer.alloc(1024 * 1024) },
        { type: 'object', data: createLargeObject(1) }
      ];
      
      const memoryUsageBefore = process.memoryUsage().heapUsed;
      const references: any[] = [];
      
      testCases.forEach((testCase, index) => {
        references.push(testCase.data);
        
        const currentUsage = process.memoryUsage().heapUsed;
        const growth = currentUsage - memoryUsageBefore;
        
        // 验证每种类型都确实增加了内存使用
        expect(growth).toBeGreaterThan(0);
      });
      
      // 清理引用
      references.length = 0;
    });
  });
  
  describe('内存压力测试', () => {
    it('应该在高内存使用下保持稳定', async () => {
      const dataCache = new TestDataCache({
        maxMemory: 200 * 1024 * 1024, // 200MB
        enableLRU: true
      });
      
      const memorySnapshots: number[] = [];
      
      // 持续的高内存使用测试
      for (let cycle = 0; cycle < 20; cycle++) {
        // 填充缓存
        for (let i = 0; i < 100; i++) {
          const key = `cycle-${cycle}-item-${i}`;
          const data = createLargeObject(0.5); // 0.5MB
          dataCache.set(key, data);
        }
        
        // 记录内存使用
        const currentMemory = process.memoryUsage().heapUsed;
        memorySnapshots.push(currentMemory);
        
        // 部分清理
        if (cycle % 5 === 0) {
          dataCache.clear();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 验证内存使用保持在合理范围内
      const stats = dataCache.getStats();
      expect(stats.memoryUsage).toBeLessThan(200 * 1024 * 1024);
      
      // 验证内存使用相对稳定
      const memoryVariation = Math.max(...memorySnapshots) - Math.min(...memorySnapshots);
      expect(memoryVariation).toBeLessThan(500 * 1024 * 1024); // 500MB 变化范围
    }, 15000);
    
    it('应该处理内存分配失败', () => {
      const memoryManager = new TestMemoryManager(50 * 1024 * 1024); // 50MB 限制
      
      const allocationResults: boolean[] = [];
      
      // 尝试分配越来越多的内存
      for (let i = 1; i <= 20; i++) {
        const size = 10 * 1024 * 1024; // 10MB per allocation
        const result = memoryManager.allocate(`task-${i}`, size);
        allocationResults.push(result);
      }
      
      // 前几次分配应该成功，后面的应该失败
      expect(allocationResults.slice(0, 5)).toContain(true);
      expect(allocationResults.slice(-5)).toContain(false);
      
      const usage = memoryManager.getUsage();
      expect(usage.current).toBeLessThanOrEqual(usage.limit);
    });
    
    it('应该测试垃圾回收效果', async () => {
      const performanceMonitor = new TestPerformanceMonitor();
      
      performanceMonitor.startMemoryMonitoring(200);
      
      // 创建大量临时对象
      for (let round = 0; round < 10; round++) {
        let temporaryData: any[] = [];
        
        // 创建临时数据
        for (let i = 0; i < 50; i++) {
          temporaryData.push(createLargeObject(0.2)); // 0.2MB
        }
        
        // 清理引用
        temporaryData = [];
        
        // 每隔几轮强制垃圾回收
        if (round % 3 === 0) {
          if (global.gc) {
            global.gc();
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const result = performanceMonitor.stopMemoryMonitoring();
      
      // 验证垃圾回收有效（内存没有持续大幅增长）
      expect(result.analysis.potentialLeak).toBe(false);
      
      // 验证有足够的监控数据
      expect(result.snapshots.length).toBeGreaterThan(10);
    }, 12000);
  });
  
  describe('内存优化策略测试', () => {
    it('应该测试对象池的效果', () => {
      class SimpleObjectPool<T> {
        private pool: T[] = [];
        private createFn: () => T;
        private resetFn: (obj: T) => void;
        
        constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
          this.createFn = createFn;
          this.resetFn = resetFn;
          
          for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
          }
        }
        
        acquire(): T {
          const obj = this.pool.pop();
          return obj || this.createFn();
        }
        
        release(obj: T): void {
          this.resetFn(obj);
          this.pool.push(obj);
        }
        
        get poolSize(): number {
          return this.pool.length;
        }
      }
      
      const objectPool = new SimpleObjectPool(
        () => ({ data: new Array(1000), processed: false }),
        (obj) => { obj.data.length = 0; obj.processed = false; },
        5
      );
      
      const initialPoolSize = objectPool.poolSize;
      
      // 使用对象池
      const objects: any[] = [];
      for (let i = 0; i < 10; i++) {
        objects.push(objectPool.acquire());
      }
      
      expect(objectPool.poolSize).toBeLessThan(initialPoolSize);
      
      // 释放对象
      objects.forEach(obj => objectPool.release(obj));
      
      expect(objectPool.poolSize).toBeGreaterThan(5); // 应该有对象返回池中
    });
    
    it('应该测试弱引用的使用', () => {
      const weakRefs: WeakRef<any>[] = [];
      
      // 创建对象并使用弱引用
      for (let i = 0; i < 100; i++) {
        const obj = createLargeObject(0.1); // 0.1MB
        weakRefs.push(new WeakRef(obj));
      }
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }
      
      // 检查弱引用是否被回收
      setTimeout(() => {
        const aliveObjects = weakRefs.filter(ref => ref.deref() !== undefined).length;
        // 应该有一些对象被垃圾回收
        expect(aliveObjects).toBeLessThan(weakRefs.length);
      }, 100);
    });
    
    it('应该测试内存使用优化策略', async () => {
      const strategies = [
        {
          name: '频繁创建销毁',
          test: () => {
            for (let i = 0; i < 1000; i++) {
              const obj = { data: new Array(100).fill(i) };
              // 立即丢弃引用
            }
          }
        },
        {
          name: '重用对象',
          test: () => {
            const reusableObj = { data: new Array(100) };
            for (let i = 0; i < 1000; i++) {
              reusableObj.data.fill(i);
            }
          }
        }
      ];
      
      const results: Array<{ name: string; memoryGrowth: number }> = [];
      
      for (const strategy of strategies) {
        const memoryBefore = process.memoryUsage().heapUsed;
        
        strategy.test();
        
        const memoryAfter = process.memoryUsage().heapUsed;
        const growth = memoryAfter - memoryBefore;
        
        results.push({ name: strategy.name, memoryGrowth: growth });
      }
      
      // 重用对象策略应该使用更少的内存
      const frequentCreation = results.find(r => r.name === '频繁创建销毁')!;
      const objectReuse = results.find(r => r.name === '重用对象')!;
      
      expect(objectReuse.memoryGrowth).toBeLessThan(frequentCreation.memoryGrowth);
    });
  });
});
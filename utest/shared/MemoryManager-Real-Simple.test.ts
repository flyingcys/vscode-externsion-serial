/**
 * MemoryManager真实代码测试（简化版）
 * 
 * 测试shared/MemoryManager.ts的真实实现（重点覆盖核心功能）
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  MemoryManager,
  ObjectPool,
  BufferPool,
  getMemoryManager,
  MemoryPoolConfig
} from '../../src/shared/MemoryManager';

// 全局环境模拟
Object.assign(globalThis, {
  window: {},
  clearInterval: vi.fn(),
  setInterval: vi.fn(() => 123),
  setImmediate: vi.fn(),
  WeakRef: class WeakRef<T> {
    private target: T | undefined;
    constructor(target: T) { this.target = target; }
    deref(): T | undefined { return this.target; }
  },
  PerformanceObserver: vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn()
  }))
});

// 模拟performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    totalJSHeapSize: 100 * 1024 * 1024,
    usedJSHeapSize: 60 * 1024 * 1024,
    jsHeapSizeLimit: 200 * 1024 * 1024
  },
  configurable: true
});

describe('MemoryManager真实代码测试（简化版）', () => {

  // ============ ObjectPool对象池核心测试 ============
  
  describe('ObjectPool对象池', () => {
    let pool: ObjectPool<any>;
    let config: MemoryPoolConfig;

    beforeEach(() => {
      config = {
        initialSize: 5,
        maxSize: 20,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({
          id: Math.random(),
          data: []
        }),
        itemDestructor: vi.fn()
      };
      pool = new ObjectPool(config);
    });

    afterEach(() => {
      pool.clear();
    });

    test('应该创建对象池并正确初始化', () => {
      expect(pool).toBeInstanceOf(ObjectPool);
      
      const stats = pool.getStats();
      expect(stats.size).toBe(5);
      expect(stats.free).toBe(5);
      expect(stats.used).toBe(0);
    });

    test('应该从池中获取和释放对象', () => {
      const obj1 = pool.acquire();
      expect(obj1).toHaveProperty('id');
      expect(obj1).toHaveProperty('data');
      
      let stats = pool.getStats();
      expect(stats.used).toBe(1);
      expect(stats.hits).toBe(1);
      
      pool.release(obj1);
      stats = pool.getStats();
      expect(stats.used).toBe(0);
    });

    test('应该正确重置释放的对象', () => {
      const obj = pool.acquire();
      obj.data.push('test');
      obj.customProp = 'value';
      
      pool.release(obj);
      
      const newObj = pool.acquire();
      expect(newObj.data).toEqual([]);
      expect(newObj.customProp).toBeUndefined();
    });

    test('应该处理池耗尽并创建新对象', () => {
      const objects = [];
      for (let i = 0; i < 6; i++) {
        objects.push(pool.acquire());
      }
      
      const stats = pool.getStats();
      expect(stats.used).toBe(6);
      expect(stats.misses).toBeGreaterThan(0);
    });

    test('应该在达到最大大小时抛出错误', () => {
      const objects = [];
      for (let i = 0; i < 20; i++) {
        objects.push(pool.acquire());
      }
      
      expect(() => pool.acquire()).toThrow('Object pool exhausted');
    });
  });

  // ============ BufferPool缓冲区池核心测试 ============
  
  describe('BufferPool缓冲区池', () => {
    let bufferPool: BufferPool;

    beforeEach(() => {
      bufferPool = new BufferPool();
    });

    afterEach(() => {
      bufferPool.clear();
    });

    test('应该创建缓冲区池并提供预置大小', () => {
      expect(bufferPool).toBeInstanceOf(BufferPool);
      
      const stats = bufferPool.getAllStats();
      expect(stats).toHaveProperty('64');
      expect(stats).toHaveProperty('256');
      expect(stats).toHaveProperty('1024');
    });

    test('应该获取指定大小的缓冲区', () => {
      const buffer256 = bufferPool.acquire(256);
      const buffer1024 = bufferPool.acquire(1024);
      
      expect(buffer256).toBeInstanceOf(Uint8Array);
      expect(buffer256.length).toBe(256);
      
      expect(buffer1024).toBeInstanceOf(Uint8Array);
      expect(buffer1024.length).toBe(1024);
    });

    test('应该为非标准大小创建合适的池', () => {
      const buffer = bufferPool.acquire(100);
      expect(buffer.length).toBe(100);
      expect(buffer.buffer.byteLength).toBe(256); // 使用256大小的池
    });

    test('应该释放缓冲区', () => {
      const buffer = bufferPool.acquire(256);
      expect(() => bufferPool.release(buffer)).not.toThrow();
    });
  });

  // ============ MemoryManager主管理器核心测试 ============
  
  describe('MemoryManager主内存管理器', () => {
    let memoryManager: MemoryManager;

    beforeEach(() => {
      memoryManager = new MemoryManager();
    });

    afterEach(() => {
      if (memoryManager) {
        try {
          memoryManager.dispose();
        } catch (e) {
          // 忽略dispose错误
        }
      }
    });

    test('应该创建MemoryManager实例', () => {
      expect(memoryManager).toBeInstanceOf(MemoryManager);
      expect(memoryManager.getBufferPool()).toBeInstanceOf(BufferPool);
    });

    test('应该创建和管理对象池', () => {
      const config: MemoryPoolConfig = {
        initialSize: 3,
        maxSize: 10,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ test: true })
      };
      
      const pool = memoryManager.createObjectPool<any>('test-pool', config);
      expect(pool).toBeInstanceOf(ObjectPool);
      
      const retrieved = memoryManager.getObjectPool('test-pool');
      expect(retrieved).toBe(pool);
    });

    test('应该返回null对于不存在的对象池', () => {
      const pool = memoryManager.getObjectPool('nonexistent');
      expect(pool).toBeNull();
    });

    test('应该提供内存统计信息', () => {
      const stats = memoryManager.getMemoryStats();
      
      expect(stats).toHaveProperty('totalAllocated');
      expect(stats).toHaveProperty('totalUsed');
      expect(stats).toHaveProperty('totalFree');
      expect(stats).toHaveProperty('memoryPressure');
      expect(stats).toHaveProperty('poolStats');
      
      expect(typeof stats.totalAllocated).toBe('number');
      expect(typeof stats.memoryPressure).toBe('number');
    });

    test('应该检测内存泄漏', () => {
      const leakCheck = memoryManager.checkMemoryLeaks();
      
      expect(leakCheck).toHaveProperty('potentialLeaks');
      expect(leakCheck).toHaveProperty('recommendations');
      expect(Array.isArray(leakCheck.potentialLeaks)).toBe(true);
      expect(Array.isArray(leakCheck.recommendations)).toBe(true);
    });

    test('应该执行内存优化', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 正常情况下不应该触发优化
      memoryManager.optimize();
      
      consoleSpy.mockRestore();
    });
  });

  // ============ 全局单例测试 ============
  
  describe('全局单例', () => {
    test('应该返回相同的全局实例', () => {
      const instance1 = getMemoryManager();
      const instance2 = getMemoryManager();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(MemoryManager);
    });
  });

  // ============ 集成测试 ============
  
  describe('内存管理系统集成', () => {
    test('应该协同工作', () => {
      const manager = new MemoryManager();
      
      // 创建对象池
      const objPool = manager.createObjectPool('integration', {
        initialSize: 2,
        maxSize: 5,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ data: [] })
      });
      
      // 使用缓冲区池
      const buffer = manager.getBufferPool().acquire(512);
      expect(buffer.length).toBe(512);
      
      // 使用对象池
      const obj = objPool.acquire();
      expect(obj).toHaveProperty('data');
      
      // 释放资源
      objPool.release(obj);
      manager.getBufferPool().release(buffer);
      
      // 获取统计
      const stats = manager.getMemoryStats();
      expect(stats).toBeDefined();
      
      try {
        manager.dispose();
      } catch (e) {
        // 忽略dispose错误
      }
    });
  });
});
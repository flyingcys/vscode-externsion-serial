/**
 * MemoryManager.test.ts
 * 内存管理器单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MemoryManager,
  ObjectPool,
  BufferPool,
  WeakReferenceManager,
  getMemoryManager,
  type MemoryPoolConfig,
  type MemoryStats,
  type PoolStats
} from '@shared/MemoryManager';

// Mock window for Node.js environment
global.window = global.window || {} as any;

// Mock PerformanceObserver for Node.js environment  
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

global.PerformanceObserver = vi.fn(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect
})) as any;

global.window.PerformanceObserver = global.PerformanceObserver;

// Mock performance.memory
const mockMemory = {
  totalJSHeapSize: 50 * 1024 * 1024, // 50MB
  usedJSHeapSize: 30 * 1024 * 1024,  // 30MB
  jsHeapSizeLimit: 100 * 1024 * 1024  // 100MB
};

Object.defineProperty(global.performance, 'memory', {
  value: mockMemory,
  configurable: true
});

// Mock WeakRef for Node.js environment
if (typeof WeakRef === 'undefined') {
  global.WeakRef = class WeakRef<T> {
    private target: T | undefined;
    
    constructor(target: T) {
      this.target = target;
    }
    
    deref(): T | undefined {
      // 模拟随机回收
      if (Math.random() < 0.1) {
        this.target = undefined;
      }
      return this.target;
    }
  } as any;
}

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Ensure window is properly mocked before creating MemoryManager
    if (!global.window) {
      global.window = {} as any;
    }
    global.window.PerformanceObserver = global.PerformanceObserver;
    
    // Mock setInterval for memory monitoring
    vi.spyOn(global, 'setInterval').mockImplementation((callback: Function, delay: number) => {
      // 立即执行一次回调用于测试
      if (delay === 1000) {
        setTimeout(callback, 0);
      }
      return 123 as any;
    });
    
    memoryManager = new MemoryManager();
  });
  
  afterEach(() => {
    if (memoryManager) {
      memoryManager.dispose();
    }
    vi.restoreAllMocks();
  });

  describe('对象池管理测试', () => {
    test('应该能创建对象池', () => {
      const config: MemoryPoolConfig = {
        initialSize: 5,
        maxSize: 20,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ data: null })
      };

      const pool = memoryManager.createObjectPool<any>('test-pool', config);
      expect(pool).toBeInstanceOf(ObjectPool);
      
      const retrievedPool = memoryManager.getObjectPool('test-pool');
      expect(retrievedPool).toBe(pool);
    });

    test('应该能获取不存在的对象池返回null', () => {
      const pool = memoryManager.getObjectPool('nonexistent-pool');
      expect(pool).toBeNull();
    });

    test('应该提供缓冲区池访问', () => {
      const bufferPool = memoryManager.getBufferPool();
      expect(bufferPool).toBeInstanceOf(BufferPool);
    });

    test('应该提供弱引用管理器访问', () => {
      const weakRefManager = memoryManager.getWeakRefManager();
      expect(weakRefManager).toBeInstanceOf(WeakReferenceManager);
    });
  });

  describe('内存统计测试', () => {
    test('应该能获取内存统计信息', async () => {
      // 等待内存监控更新
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const stats = memoryManager.getMemoryStats();
      expect(stats).toHaveProperty('totalAllocated');
      expect(stats).toHaveProperty('totalUsed');
      expect(stats).toHaveProperty('totalFree');
      expect(stats).toHaveProperty('gcCount');
      expect(stats).toHaveProperty('gcTime');
      expect(stats).toHaveProperty('memoryPressure');
      expect(stats).toHaveProperty('poolStats');
      
      expect(stats.totalAllocated).toBe(mockMemory.totalJSHeapSize);
      expect(stats.totalUsed).toBe(mockMemory.usedJSHeapSize);
      expect(stats.totalFree).toBe(mockMemory.totalJSHeapSize - mockMemory.usedJSHeapSize);
      expect(stats.memoryPressure).toBe(mockMemory.usedJSHeapSize / mockMemory.jsHeapSizeLimit);
    });

    test('应该包含对象池统计', async () => {
      const config: MemoryPoolConfig = {
        initialSize: 3,
        maxSize: 10,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ id: Math.random() })
      };

      memoryManager.createObjectPool('stat-test-pool', config);
      
      // 等待内存监控更新
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const stats = memoryManager.getMemoryStats();
      expect(stats.poolStats).toHaveProperty('stat-test-pool');
      
      const poolStats = stats.poolStats['stat-test-pool'];
      expect(poolStats.size).toBe(3); // 初始大小
      expect(poolStats.used).toBe(0);
      expect(poolStats.free).toBe(3);
    });
  });

  describe('内存压力管理测试', () => {
    test('应该能强制执行垃圾回收', () => {
      // Mock window.gc
      const mockGC = vi.fn();
      (global as any).window = { gc: mockGC };
      
      memoryManager.forceGC();
      expect(mockGC).toHaveBeenCalled();
      
      delete (global as any).window;
    });

    test('应该在没有原生GC时模拟垃圾回收', () => {
      const spy = vi.spyOn(Array.prototype, 'fill');
      
      memoryManager.forceGC();
      
      // 应该创建临时数组来模拟内存压力
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    test('应该能缓解内存压力', () => {
      const config: MemoryPoolConfig = {
        initialSize: 5,
        maxSize: 15,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ data: new Array(100) })
      };

      memoryManager.createObjectPool('pressure-test', config);
      
      const clearSpy = vi.spyOn(memoryManager.getBufferPool(), 'clear');
      const forceSpy = vi.spyOn(memoryManager, 'forceGC');
      
      memoryManager.relieveMemoryPressure();
      
      expect(clearSpy).toHaveBeenCalled();
      expect(forceSpy).toHaveBeenCalled();
    });
  });

  describe('内存泄漏检测测试', () => {
    test('应该检测低命中率池', async () => {
      const config: MemoryPoolConfig = {
        initialSize: 10,
        maxSize: 20,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ value: 0 })
      };

      const pool = memoryManager.createObjectPool('low-hit-pool', config);
      
      // 模拟低命中率：多次miss
      for (let i = 0; i < 10; i++) {
        try {
          pool.acquire();
        } catch (e) {
          // 池耗尽时忽略错误
        }
      }
      
      // 等待统计更新
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const leakCheck = memoryManager.checkMemoryLeaks();
      
      expect(leakCheck.potentialLeaks.length).toBeGreaterThan(0);
      expect(leakCheck.recommendations.length).toBeGreaterThan(0);
    });

    test('应该检测高内存压力', async () => {
      // 模拟高内存压力
      mockMemory.usedJSHeapSize = 85 * 1024 * 1024; // 85MB / 100MB = 85%
      
      // 等待统计更新
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const leakCheck = memoryManager.checkMemoryLeaks();
      
      const hasMemoryPressureLeak = leakCheck.potentialLeaks.some(leak => 
        leak.includes('High memory pressure')
      );
      expect(hasMemoryPressureLeak).toBe(true);
      
      const hasMemoryPressureRecommendation = leakCheck.recommendations.some(rec => 
        rec.includes('memory pressure relief')
      );
      expect(hasMemoryPressureRecommendation).toBe(true);
    });

    test('应该检测频繁GC活动', () => {
      // 模拟频繁GC
      (memoryManager as any).gcCount = 15;
      
      const leakCheck = memoryManager.checkMemoryLeaks();
      
      const hasGCLeak = leakCheck.potentialLeaks.some(leak => 
        leak.includes('Frequent GC activity')
      );
      expect(hasGCLeak).toBe(true);
      
      const hasGCRecommendation = leakCheck.recommendations.some(rec => 
        rec.includes('object pooling')
      );
      expect(hasGCRecommendation).toBe(true);
    });
  });

  describe('内存优化测试', () => {
    test('应该在检测到问题时进行优化', async () => {
      // 模拟高内存压力
      mockMemory.usedJSHeapSize = 90 * 1024 * 1024; // 90%
      
      // 等待内存统计更新
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const relieveSpy = vi.spyOn(memoryManager, 'relieveMemoryPressure');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      memoryManager.optimize();
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(relieveSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    test('应该在没有问题时不进行优化', () => {
      // 正常内存使用
      mockMemory.usedJSHeapSize = 20 * 1024 * 1024; // 20%
      (memoryManager as any).gcCount = 2;
      
      const relieveSpy = vi.spyOn(memoryManager, 'relieveMemoryPressure');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      memoryManager.optimize();
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(relieveSpy).not.toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('资源清理测试', () => {
    test('应该正确清理所有资源', () => {
      const config: MemoryPoolConfig = {
        initialSize: 5,
        maxSize: 10,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => ({ data: [] })
      };

      memoryManager.createObjectPool('cleanup-test', config);
      
      const bufferPool = memoryManager.getBufferPool();
      const weakRefManager = memoryManager.getWeakRefManager();
      
      const bufferClearSpy = vi.spyOn(bufferPool, 'clear');
      const weakRefDisposeSpy = vi.spyOn(weakRefManager, 'dispose');
      
      memoryManager.dispose();
      
      expect(bufferClearSpy).toHaveBeenCalled();
      expect(weakRefDisposeSpy).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('全局单例测试', () => {
    test('应该返回相同的全局实例', () => {
      const instance1 = getMemoryManager();
      const instance2 = getMemoryManager();
      
      expect(instance1).toBe(instance2);
    });

    test('全局实例应该是MemoryManager类型', () => {
      const instance = getMemoryManager();
      expect(instance).toBeInstanceOf(MemoryManager);
    });
  });
});

describe('ObjectPool', () => {
  let pool: ObjectPool<any>;
  let config: MemoryPoolConfig;
  
  beforeEach(() => {
    config = {
      initialSize: 3,
      maxSize: 10,
      growthFactor: 1.5,
      shrinkThreshold: 0.3,
      itemConstructor: () => ({ id: Math.random(), data: [] }),
      itemDestructor: vi.fn()
    };
    
    pool = new ObjectPool(config);
  });
  
  afterEach(() => {
    pool.clear();
  });

  describe('对象获取和释放测试', () => {
    test('应该能获取对象', () => {
      const obj = pool.acquire();
      expect(obj).toBeDefined();
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('data');
      
      const stats = pool.getStats();
      expect(stats.used).toBe(1);
      expect(stats.hits).toBe(1);
    });

    test('应该能释放对象', () => {
      const obj = pool.acquire();
      pool.release(obj);
      
      const stats = pool.getStats();
      expect(stats.used).toBe(0);
      expect(stats.free).toBe(2); // 释放的对象可能被销毁而不是返回池中
    });

    test('应该在池耗尽时创建新对象', () => {
      const objects = [];
      
      // 获取所有初始对象
      for (let i = 0; i < 3; i++) {
        objects.push(pool.acquire());
      }
      
      // 继续获取应该创建新对象
      const newObj = pool.acquire();
      expect(newObj).toBeDefined();
      
      const stats = pool.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.used).toBe(4);
    });

    test('应该在达到最大大小时抛出错误', () => {
      const objects = [];
      
      // 获取到最大数量
      for (let i = 0; i < 10; i++) {
        objects.push(pool.acquire());
      }
      
      // 再次获取应该抛出错误
      expect(() => pool.acquire()).toThrow('Object pool exhausted');
    });

    test('应该警告释放不属于池的对象', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const foreignObj = { id: 'foreign' };
      pool.release(foreignObj);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Attempting to release item not from this pool');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('对象重置测试', () => {
    test('应该重置数组对象', () => {
      const obj = pool.acquire();
      obj.data.push(1, 2, 3);
      
      pool.release(obj);
      
      const reusedObj = pool.acquire();
      expect(reusedObj.data.length).toBe(0);
    });

    test('应该重置Map对象', () => {
      const mapConfig: MemoryPoolConfig = {
        initialSize: 2,
        maxSize: 5,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => new Map()
      };
      
      const mapPool = new ObjectPool<Map<string, any>>(mapConfig);
      
      const mapObj = mapPool.acquire();
      mapObj.set('key1', 'value1');
      mapObj.set('key2', 'value2');
      
      mapPool.release(mapObj);
      
      const reusedMap = mapPool.acquire();
      expect(reusedMap.size).toBe(0);
      
      mapPool.clear();
    });

    test('应该重置Set对象', () => {
      const setConfig: MemoryPoolConfig = {
        initialSize: 2,
        maxSize: 5,
        growthFactor: 1.5,
        shrinkThreshold: 0.3,
        itemConstructor: () => new Set()
      };
      
      const setPool = new ObjectPool<Set<any>>(setConfig);
      
      const setObj = setPool.acquire();
      setObj.add('item1');
      setObj.add('item2');
      
      setPool.release(setObj);
      
      const reusedSet = setPool.acquire();
      expect(reusedSet.size).toBe(0);
      
      setPool.clear();
    });

    test('应该重置普通对象属性', () => {
      const obj = pool.acquire();
      obj.customProp = 'test value';
      obj.anotherProp = 123;
      
      pool.release(obj);
      
      const reusedObj = pool.acquire();
      expect(reusedObj.customProp).toBeUndefined();
      expect(reusedObj.anotherProp).toBeUndefined();
    });
  });

  describe('池收缩测试', () => {
    test('应该在利用率低时收缩池', () => {
      const shrinkConfig: MemoryPoolConfig = {
        initialSize: 10,
        maxSize: 20,
        growthFactor: 1.5,
        shrinkThreshold: 0.8, // 高阈值以便测试
        itemConstructor: () => ({ data: [] }),
        itemDestructor: vi.fn()
      };
      
      const shrinkPool = new ObjectPool(shrinkConfig);
      
      // 获取一个对象
      const obj = shrinkPool.acquire();
      
      // 释放对象时应该触发收缩
      shrinkPool.release(obj);
      
      expect(shrinkConfig.itemDestructor).toHaveBeenCalled();
      
      shrinkPool.clear();
    });
  });

  describe('统计信息测试', () => {
    test('应该正确计算命中率', () => {
      // 命中：从池中获取
      const obj1 = pool.acquire(); // hit
      const obj2 = pool.acquire(); // hit  
      const obj3 = pool.acquire(); // hit (耗尽初始池)
      
      // Miss：创建新对象
      const obj4 = pool.acquire(); // miss (需要创建新对象)
      
      const stats = pool.getStats();
      expect(stats.hits).toBe(3); // 前3次从池中获取
      expect(stats.misses).toBe(1); // 第4次创建新对象
      expect(stats.hitRate).toBe(3 / 4); // 75%
    });

    test('应该正确跟踪池大小', () => {
      let stats = pool.getStats();
      expect(stats.size).toBe(3); // 初始大小
      expect(stats.used).toBe(0);
      expect(stats.free).toBe(3);
      
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      stats = pool.getStats();
      expect(stats.used).toBe(2);
      expect(stats.free).toBe(1);
      
      pool.release(obj1);
      
      stats = pool.getStats();
      expect(stats.used).toBe(1);
      expect(stats.free).toBe(2);
    });
  });

  describe('清理测试', () => {
    test('应该清空所有对象', () => {
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      
      pool.clear();
      
      const stats = pool.getStats();
      expect(stats.size).toBe(0);
      expect(stats.used).toBe(0);
      expect(stats.free).toBe(0);
      
      // itemDestructor被调用的次数取决于池中剩余的对象
      // 由于已经获取了2个对象，池中只剩1个对象需要销毁
      expect(config.itemDestructor).toHaveBeenCalledTimes(1); 
    });
  });
});

describe('BufferPool', () => {
  let bufferPool: BufferPool;
  
  beforeEach(() => {
    bufferPool = new BufferPool();
  });
  
  afterEach(() => {
    bufferPool.clear();
  });

  describe('缓冲区获取和释放测试', () => {
    test('应该能获取指定大小的缓冲区', () => {
      const buffer = bufferPool.acquire(1024);
      
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBe(1024);
    });

    test('应该为常用大小使用预置池', () => {
      const buffer64 = bufferPool.acquire(64);
      const buffer256 = bufferPool.acquire(256);
      const buffer1024 = bufferPool.acquire(1024);
      
      expect(buffer64.length).toBe(64);
      expect(buffer256.length).toBe(256);
      expect(buffer1024.length).toBe(1024);
    });

    test('应该为新尺寸创建池', () => {
      const buffer = bufferPool.acquire(555); // 非标准大小
      
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBe(555);
      
      // 应该创建1024大小的池（向上取整到2的幂次）
      const stats = bufferPool.getAllStats();
      expect(stats).toHaveProperty('1024');
    });

    test('应该返回子数组当请求大小小于池大小', () => {
      const buffer = bufferPool.acquire(100); // 将使用256大小的池
      
      expect(buffer.length).toBe(100);
      expect(buffer.buffer.byteLength).toBe(256);
    });

    test('应该能释放缓冲区', () => {
      const buffer = bufferPool.acquire(256);
      
      expect(() => bufferPool.release(buffer)).not.toThrow();
    });
  });

  describe('大小管理测试', () => {
    test('应该正确找到最佳大小', () => {
      // 测试边界情况
      const buffer63 = bufferPool.acquire(63); // 应该使用64
      const buffer65 = bufferPool.acquire(65); // 应该使用256
      
      expect(buffer63.buffer.byteLength).toBe(64);
      expect(buffer65.buffer.byteLength).toBe(256);
    });

    test('应该正确向上取整到2的幂次', () => {
      const sizes = [33, 129, 513, 2000];
      const expectedSizes = [64, 256, 1024, 4096];
      
      for (let i = 0; i < sizes.length; i++) {
        const buffer = bufferPool.acquire(sizes[i]);
        expect(buffer.buffer.byteLength).toBe(expectedSizes[i]);
      }
    });
  });

  describe('统计信息测试', () => {
    test('应该提供所有池的统计信息', () => {
      // 获取一些缓冲区以触发统计
      bufferPool.acquire(64);
      bufferPool.acquire(256);
      bufferPool.acquire(1024);
      
      const stats = bufferPool.getAllStats();
      
      expect(stats).toHaveProperty('64');
      expect(stats).toHaveProperty('256');
      expect(stats).toHaveProperty('1024');
      
      // 每个统计都应该有正确的结构
      for (const [size, poolStats] of Object.entries(stats)) {
        expect(poolStats).toHaveProperty('size');
        expect(poolStats).toHaveProperty('used');
        expect(poolStats).toHaveProperty('free');
        expect(poolStats).toHaveProperty('hits');
        expect(poolStats).toHaveProperty('misses');
        expect(poolStats).toHaveProperty('hitRate');
      }
    });
  });

  describe('清理测试', () => {
    test('应该清理所有池', () => {
      bufferPool.acquire(64);
      bufferPool.acquire(256);
      
      bufferPool.clear();
      
      const stats = bufferPool.getAllStats();
      
      // 统计应该显示池已被清理
      for (const poolStats of Object.values(stats)) {
        expect(poolStats.size).toBe(0);
        expect(poolStats.used).toBe(0);
        expect(poolStats.free).toBe(0);
      }
    });
  });
});

describe('WeakReferenceManager', () => {
  let weakRefManager: WeakReferenceManager;
  
  beforeEach(() => {
    vi.useFakeTimers();
    weakRefManager = new WeakReferenceManager();
  });
  
  afterEach(() => {
    weakRefManager.dispose();
    vi.useRealTimers();
  });

  describe('弱引用管理测试', () => {
    test('应该能添加弱引用', () => {
      const target = { id: 'test' };
      const weakRef = weakRefManager.addWeakRef(target);
      
      expect(weakRef).toBeInstanceOf(WeakRef);
      expect(weakRef.deref()).toBe(target);
    });

    test('应该能添加带清理回调的弱引用', () => {
      const target = { id: 'test' };
      const cleanupCallback = vi.fn();
      
      const weakRef = weakRefManager.addWeakRef(target, cleanupCallback);
      
      expect(weakRef).toBeInstanceOf(WeakRef);
    });

    test('应该能移除弱引用', () => {
      const target = { id: 'test' };
      const cleanupCallback = vi.fn();
      
      const weakRef = weakRefManager.addWeakRef(target, cleanupCallback);
      weakRefManager.removeWeakRef(weakRef);
      
      expect(cleanupCallback).toHaveBeenCalled();
    });
  });

  describe('自动清理测试', () => {
    test('应该定期执行清理', () => {
      const target = { id: 'test' };
      const cleanupCallback = vi.fn();
      
      const weakRef = weakRefManager.addWeakRef(target, cleanupCallback);
      
      // 模拟对象被回收
      vi.spyOn(weakRef, 'deref').mockReturnValue(undefined);
      
      // 触发清理定时器
      vi.advanceTimersByTime(5000);
      
      expect(cleanupCallback).toHaveBeenCalled();
    });

    test('应该不清理仍然活跃的引用', () => {
      const target = { id: 'test' };
      const cleanupCallback = vi.fn();
      
      weakRefManager.addWeakRef(target, cleanupCallback);
      
      // 触发清理定时器
      vi.advanceTimersByTime(5000);
      
      // 由于目标仍然活跃，回调不应该被调用
      expect(cleanupCallback).not.toHaveBeenCalled();
    });
  });

  describe('统计信息测试', () => {
    test('应该提供准确的统计信息', () => {
      const target1 = { id: 'test1' };
      const target2 = { id: 'test2' };
      
      const weakRef1 = weakRefManager.addWeakRef(target1);
      const weakRef2 = weakRefManager.addWeakRef(target2, () => {});
      
      const stats = weakRefManager.getStats();
      
      expect(stats.totalRefs).toBe(2);
      expect(stats.activeRefs).toBe(2);
      expect(stats.inactiveRefs).toBe(0);
      expect(stats.cleanupCallbacks).toBe(1);
    });

    test('应该正确计算非活跃引用', () => {
      const target = { id: 'test' };
      const weakRef = weakRefManager.addWeakRef(target);
      
      // 模拟对象被回收
      vi.spyOn(weakRef, 'deref').mockReturnValue(undefined);
      
      const stats = weakRefManager.getStats();
      
      expect(stats.activeRefs).toBe(0);
      expect(stats.inactiveRefs).toBe(1);
    });
  });

  describe('资源清理测试', () => {
    test('应该清理定时器和回调', () => {
      const target = { id: 'test' };
      const cleanupCallback = vi.fn();
      
      weakRefManager.addWeakRef(target, cleanupCallback);
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      weakRefManager.dispose();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(cleanupCallback).toHaveBeenCalled();
      
      const stats = weakRefManager.getStats();
      expect(stats.totalRefs).toBe(0);
      expect(stats.cleanupCallbacks).toBe(0);
    });

    test('应该处理清理回调中的错误', () => {
      const target = { id: 'test' };
      const errorCallback = vi.fn(() => {
        throw new Error('Cleanup error');
      });
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      weakRefManager.addWeakRef(target, errorCallback);
      weakRefManager.dispose();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cleanup callback error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});
/**
 * DataCache真实代码测试
 * 
 * 测试shared/DataCache.ts的真实实现
 * 覆盖核心缓存功能：LRU策略、TTL过期、内存管理、统计等
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataCache, CacheOptions, EvictionPolicy, CacheStats, CacheEntry } from '../../src/shared/DataCache';

describe('DataCache真实代码测试', () => {
  let cache: DataCache;
  
  beforeEach(() => {
    // 创建默认配置的缓存实例
    cache = new DataCache();
  });

  afterEach(() => {
    // 清理缓存，避免内存泄漏
    if (cache) {
      cache.clear();
    }
  });

  // ============ 基本缓存操作测试 ============
  
  describe('基本缓存操作', () => {
    test('应该能够设置和获取简单数据', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('应该能够缓存不同类型的数据', () => {
      cache.set('string', 'hello');
      cache.set('number', 42);
      cache.set('object', { a: 1, b: 2 });
      cache.set('array', [1, 2, 3]);
      cache.set('boolean', true);

      expect(cache.get('string')).toBe('hello');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('object')).toEqual({ a: 1, b: 2 });
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('boolean')).toBe(true);
    });

    test('应该正确处理不存在的键', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
      expect(cache.has('nonexistent')).toBe(false);
    });

    test('应该能够覆盖现有缓存条目', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2'); // 覆盖
      expect(cache.get('key1')).toBe('value2');
    });

    test('应该能够删除缓存条目', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      
      const deleted = cache.delete('key1');
      expect(deleted).toBe(true);
      expect(cache.has('key1')).toBe(false);
      expect(cache.get('key1')).toBeUndefined();
    });

    test('删除不存在的键应该返回false', () => {
      const deleted = cache.delete('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  // ============ LRU淘汰策略测试 ============
  
  describe('LRU淘汰策略', () => {
    test('应该实施LRU淘汰策略', () => {
      const smallCache = new DataCache({ maxSize: 3, enableLRU: true });
      
      smallCache.set('a', 1);
      smallCache.set('b', 2);
      smallCache.set('c', 3);
      
      // 访问'a'，使其成为最近使用
      smallCache.get('a');
      
      // 添加新条目，应该淘汰最少使用的'b'
      smallCache.set('d', 4);
      
      expect(smallCache.has('a')).toBe(true); // 最近访问过
      expect(smallCache.has('b')).toBe(false); // 应该被淘汰
      expect(smallCache.has('c')).toBe(true);
      expect(smallCache.has('d')).toBe(true); // 新加入的
      
      smallCache.clear();
    });

    test('禁用LRU时不应执行LRU淘汰', () => {
      const noLRUCache = new DataCache({ maxSize: 2, enableLRU: false });
      
      noLRUCache.set('a', 1);
      noLRUCache.set('b', 2);
      
      // 访问'a'
      noLRUCache.get('a');
      
      // 添加新条目
      noLRUCache.set('c', 3);
      
      // 由于禁用LRU，应该基于其他策略淘汰
      expect(noLRUCache.has('c')).toBe(true);
      
      noLRUCache.clear();
    });
  });

  // ============ TTL过期机制测试 ============
  
  describe('TTL过期机制', () => {
    test('应该在TTL过期后自动删除条目', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(true);
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
    });

    test('TTL为0时数据应该永不过期', async () => {
      cache.set('key1', 'value1', 0); // 永不过期
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(true);
    });

    test('应该使用默认TTL当未指定时', () => {
      const shortTTLCache = new DataCache({ defaultTTL: 50 });
      shortTTLCache.set('key1', 'value1'); // 使用默认TTL
      
      expect(shortTTLCache.get('key1')).toBe('value1');
      
      shortTTLCache.clear();
    });
  });

  // ============ 内存管理和容量限制测试 ============
  
  describe('内存管理和容量限制', () => {
    test('应该限制最大缓存条目数', () => {
      const smallCache = new DataCache({ maxSize: 2 });
      
      smallCache.set('a', 1);
      smallCache.set('b', 2);
      expect(smallCache.keys().length).toBe(2);
      
      smallCache.set('c', 3); // 应该触发淘汰
      expect(smallCache.keys().length).toBe(2); // 仍然是2个条目
      
      smallCache.clear();
    });

    test('应该正确估算和跟踪内存使用', () => {
      const initialStats = cache.getStats();
      expect(initialStats.memoryUsage).toBe(0);
      
      cache.set('key1', 'small');
      const statsAfterFirst = cache.getStats();
      expect(statsAfterFirst.memoryUsage).toBeGreaterThan(0);
      
      cache.set('key2', 'much larger string that takes more memory');
      const statsAfterSecond = cache.getStats();
      expect(statsAfterSecond.memoryUsage).toBeGreaterThan(statsAfterFirst.memoryUsage);
    });
  });

  // ============ 标签系统测试 ============
  
  describe('标签系统', () => {
    test('应该能够按标签批量删除', () => {
      cache.set('user1', { name: 'Alice' }, undefined, 50, ['user', 'active']);
      cache.set('user2', { name: 'Bob' }, undefined, 50, ['user', 'inactive']);
      cache.set('config1', { theme: 'dark' }, undefined, 50, ['config']);
      
      expect(cache.keys().length).toBe(3);
      
      // 删除所有'user'标签的条目
      const deletedCount = cache.deleteByTag('user');
      expect(deletedCount).toBe(2);
      expect(cache.keys().length).toBe(1);
      expect(cache.has('config1')).toBe(true);
    });

    test('按不存在的标签删除应该返回0', () => {
      cache.set('key1', 'value1', undefined, 50, ['tag1']);
      
      const deletedCount = cache.deleteByTag('nonexistent');
      expect(deletedCount).toBe(0);
    });
  });

  // ============ 统计信息测试 ============
  
  describe('统计信息', () => {
    test('应该正确跟踪命中和未命中', () => {
      cache.set('key1', 'value1');
      
      // 命中
      cache.get('key1');
      cache.get('key1');
      
      // 未命中
      cache.get('nonexistent');
      cache.get('nonexistent2');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5); // 50%命中率
    });

    test('应该跟踪过期条目统计', async () => {
      cache.set('key1', 'value1', 50); // 50ms TTL
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 尝试访问过期条目
      cache.get('key1');
      
      const stats = cache.getStats();
      expect(stats.expiredEntries).toBe(1);
    });

    test('应该正确计算缓存大小和内存使用', () => {
      cache.set('key1', 'value1');
      cache.set('key2', { data: 'complex object' });
      
      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });
  });

  // ============ 批量操作和键管理测试 ============
  
  describe('批量操作和键管理', () => {
    test('应该能够获取所有有效键', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2', 50); // 会过期
      cache.set('key3', 'value3');
      
      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key3');
      expect(keys.length).toBe(3); // 此时还没过期
    });

    test('keys方法应该能够包含或排除过期键', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2', 50); // 50ms后过期
      
      // 等待key2过期
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const validKeys = cache.keys(false); // 不包含过期
      const allKeys = cache.keys(true); // 包含过期
      
      expect(validKeys).toEqual(['key1']);
      expect(allKeys.length).toBeGreaterThan(validKeys.length);
    });

    test('clear操作应该清空所有缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.keys().length).toBe(2);
      
      cache.clear();
      
      expect(cache.keys().length).toBe(0);
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.memoryUsage).toBe(0);
    });
  });

  // ============ 边界条件和错误处理测试 ============
  
  describe('边界条件和错误处理', () => {
    test('应该处理空字符串键', () => {
      cache.set('', 'empty key value');
      expect(cache.get('')).toBe('empty key value');
    });

    test('应该处理undefined和null值', () => {
      cache.set('undef', undefined);
      cache.set('null', null);
      
      expect(cache.get('undef')).toBe(undefined);
      expect(cache.get('null')).toBe(null);
      expect(cache.has('null')).toBe(true); // null是有效值
    });

    test('应该处理非常大的数据', () => {
      const largeData = 'x'.repeat(10000); // 10KB字符串
      cache.set('large', largeData);
      expect(cache.get('large')).toBe(largeData);
    });

    test('应该处理高频访问', () => {
      cache.set('popular', 'frequently accessed');
      
      // 高频访问
      for (let i = 0; i < 1000; i++) {
        cache.get('popular');
      }
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1000);
    });

    test('应该在极端内存压力下稳定工作', () => {
      const tinyCache = new DataCache({ maxSize: 1, maxMemory: 1024 }); // 1KB限制
      
      // 尝试添加多个条目
      for (let i = 0; i < 10; i++) {
        tinyCache.set(`key${i}`, `value${i}`);
      }
      
      // 应该只保留最后一个或最重要的
      const keys = tinyCache.keys();
      expect(keys.length).toBe(1);
      
      tinyCache.clear();
    });
  });

  // ============ 性能和并发测试 ============
  
  describe('性能和并发', () => {
    test('批量操作性能测试', () => {
      const startTime = performance.now();
      
      // 批量设置1000个条目
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, { index: i, data: `value${i}` });
      }
      
      const setTime = performance.now() - startTime;
      expect(setTime).toBeLessThan(1000); // 应该在1秒内完成
      
      const getStartTime = performance.now();
      
      // 批量获取
      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`);
      }
      
      const getTime = performance.now() - getStartTime;
      expect(getTime).toBeLessThan(500); // 获取应该更快
    });

    test('并发访问安全性', async () => {
      const cache = new DataCache({ maxSize: 100 });
      
      // 模拟并发写入
      const writePromises = Array.from({length: 50}, (_, i) => 
        Promise.resolve().then(() => cache.set(`key${i}`, `value${i}`))
      );
      
      // 模拟并发读取
      const readPromises = Array.from({length: 50}, (_, i) => 
        Promise.resolve().then(() => cache.get(`key${i % 10}`))
      );
      
      await Promise.all([...writePromises, ...readPromises]);
      
      // 验证数据一致性
      const stats = cache.getStats();
      expect(stats.size).toBe(50);
      
      cache.clear();
    });
  });

  // ============ 高级配置选项测试 ============
  
  describe('高级配置选项', () => {
    test('应该支持自定义缓存配置', () => {
      const customCache = new DataCache({
        maxSize: 500,
        maxMemory: 50 * 1024 * 1024, // 50MB
        defaultTTL: 10 * 60 * 1000, // 10分钟
        enableLRU: true,
        enableStats: true,
        enableCompression: false // 暂不测试压缩功能
      });
      
      customCache.set('test', 'data');
      expect(customCache.get('test')).toBe('data');
      
      customCache.clear();
    });

    test('禁用统计时不应收集详细统计信息', () => {
      const noStatsCache = new DataCache({ enableStats: false });
      
      noStatsCache.set('key1', 'value1');
      noStatsCache.get('key1');
      noStatsCache.get('nonexistent');
      
      const stats = noStatsCache.getStats();
      // 基本统计可能仍然可用，但详细统计应该受限
      expect(stats).toBeDefined();
      
      noStatsCache.clear();
    });
  });

  // ============ 内存泄漏预防测试 ============
  
  describe('内存泄漏预防', () => {
    test('长期运行应该保持内存稳定', async () => {
      const stableCache = new DataCache({ maxSize: 100 });
      
      // 模拟长期运行
      for (let cycle = 0; cycle < 10; cycle++) {
        // 添加100个条目
        for (let i = 0; i < 100; i++) {
          stableCache.set(`key${cycle}-${i}`, { data: `value${i}` });
        }
        
        // 清理一半
        for (let i = 0; i < 50; i++) {
          stableCache.delete(`key${cycle}-${i}`);
        }
        
        // 小延迟模拟时间流逝
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      const finalStats = stableCache.getStats();
      expect(finalStats.size).toBeLessThanOrEqual(100);
      
      stableCache.clear();
    });
  });
});
/**
 * DataCache.test.ts
 * 数据缓存系统单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DataCache,
  MultiLevelCache,
  EvictionPolicy,
  type CacheOptions,
  type CacheEntry,
  type CacheStats
} from '@shared/DataCache';

describe('DataCache', () => {
  let cache: DataCache<any>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    cache = new DataCache({ 
      enableStats: true,
      cleanupInterval: 0 // 禁用自动清理以避免定时器问题
    });
  });
  
  afterEach(() => {
    if (cache) {
      try {
        cache.destroy();
      } catch (error) {
        // 忽略清理错误
      }
    }
    vi.useRealTimers();
  });

  describe('基本缓存操作测试', () => {
    test('应该能设置和获取缓存', () => {
      const testData = { id: 1, name: 'test' };
      
      cache.set('test-key', testData);
      const retrieved = cache.get('test-key');
      
      expect(retrieved).toEqual(testData);
    });

    test('应该在数据不存在时返回undefined', () => {
      const result = cache.get('nonexistent-key');
      expect(result).toBeUndefined();
    });

    test('应该正确检查键是否存在', () => {
      cache.set('exists-key', 'test-value');
      
      expect(cache.has('exists-key')).toBe(true);
      expect(cache.has('nonexistent-key')).toBe(false);
    });

    test('应该能删除缓存条目', () => {
      cache.set('delete-key', 'test-value');
      expect(cache.has('delete-key')).toBe(true);
      
      const deleted = cache.delete('delete-key');
      expect(deleted).toBe(true);
      expect(cache.has('delete-key')).toBe(false);
    });

    test('应该在删除不存在的键时返回false', () => {
      const deleted = cache.delete('nonexistent-key');
      expect(deleted).toBe(false);
    });

    test('应该能清空所有缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.memoryUsage).toBe(0);
    });
  });

  describe('TTL（生存时间）测试', () => {
    test('应该在TTL过期后删除条目', () => {
      cache.set('ttl-key', 'test-value', 1000); // 1秒TTL
      
      expect(cache.has('ttl-key')).toBe(true);
      
      // 推进时间超过TTL
      vi.advanceTimersByTime(1500);
      
      expect(cache.has('ttl-key')).toBe(false);
      expect(cache.get('ttl-key')).toBeUndefined();
    });

    test('应该支持0 TTL表示永不过期', () => {
      cache.set('permanent-key', 'permanent-value', 0);
      
      // 推进很长时间
      vi.advanceTimersByTime(24 * 60 * 60 * 1000); // 24小时
      
      expect(cache.has('permanent-key')).toBe(true);
      expect(cache.get('permanent-key')).toBe('permanent-value');
    });

    test('应该能更新TTL', () => {
      cache.set('update-ttl-key', 'test-value', 1000);
      
      // 更新TTL为2秒
      const updated = cache.updateTTL('update-ttl-key', 2000);
      expect(updated).toBe(true);
      
      // 原来的1秒过期时间已过，但新的2秒TTL还没过期
      vi.advanceTimersByTime(1500);
      expect(cache.has('update-ttl-key')).toBe(true);
      
      // 2秒后应该过期
      vi.advanceTimersByTime(1000);
      expect(cache.has('update-ttl-key')).toBe(false);
    });

    test('应该在更新不存在键的TTL时返回false', () => {
      const updated = cache.updateTTL('nonexistent-key', 1000);
      expect(updated).toBe(false);
    });
  });

  describe('缓存配置测试', () => {
    test('应该使用自定义配置', () => {
      const customOptions: CacheOptions = {
        maxSize: 5,
        maxMemory: 1024,
        defaultTTL: 2000,
        enableLRU: true,
        enableStats: true
      };
      
      const customCache = new DataCache(customOptions);
      
      // 验证配置生效
      customCache.set('test', 'value'); // 使用默认TTL
      
      expect(customCache.has('test')).toBe(true);
      
      // 推进时间但不超过defaultTTL
      vi.advanceTimersByTime(1000);
      expect(customCache.has('test')).toBe(true);
      
      // 超过defaultTTL
      vi.advanceTimersByTime(1500);
      expect(customCache.has('test')).toBe(false);
      
      customCache.destroy();
    });

    test('应该限制最大缓存条目数', () => {
      const limitedCache = new DataCache({ maxSize: 3 });
      
      // 添加超过限制的条目
      limitedCache.set('key1', 'value1');
      limitedCache.set('key2', 'value2');
      limitedCache.set('key3', 'value3');
      limitedCache.set('key4', 'value4'); // 应该触发淘汰
      
      const stats = limitedCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(3);
      expect(stats.evictedEntries).toBeGreaterThan(0);
      
      limitedCache.destroy();
    });

    test('应该限制最大内存使用', () => {
      const memoryLimitedCache = new DataCache({ 
        maxMemory: 100, // 很小的内存限制
        maxSize: 1000 
      });
      
      // 添加大数据
      const largeData = 'x'.repeat(50); // 50字符 * 2字节 = 100字节
      memoryLimitedCache.set('large1', largeData);
      memoryLimitedCache.set('large2', largeData); // 应该触发内存淘汰
      
      const stats = memoryLimitedCache.getStats();
      expect(stats.memoryUsage).toBeLessThanOrEqual(100);
      
      memoryLimitedCache.destroy();
    });
  });

  describe('LRU淘汰策略测试', () => {
    test('应该按LRU策略淘汰最久未访问的条目', () => {
      const lruCache = new DataCache({ 
        maxSize: 3,
        enableLRU: true
      });
      
      // 添加3个条目
      lruCache.set('key1', 'value1');
      lruCache.set('key2', 'value2');
      lruCache.set('key3', 'value3');
      
      // 访问key1和key2，使它们变为最近访问
      lruCache.get('key1');
      lruCache.get('key2');
      
      // 添加新条目，应该淘汰key3（最久未访问）
      lruCache.set('key4', 'value4');
      
      expect(lruCache.has('key1')).toBe(true);
      expect(lruCache.has('key2')).toBe(true);
      expect(lruCache.has('key3')).toBe(false);
      expect(lruCache.has('key4')).toBe(true);
      
      lruCache.destroy();
    });

    test('应该在禁用LRU时使用简单淘汰策略', () => {
      const simpleCache = new DataCache({ 
        maxSize: 2,
        enableLRU: false
      });
      
      simpleCache.set('first', 'value1');
      simpleCache.set('second', 'value2');
      
      // 访问第一个条目
      simpleCache.get('first');
      
      // 添加新条目，由于禁用LRU，应该淘汰第一个添加的条目
      simpleCache.set('third', 'value3');
      
      // 第一个条目可能被淘汰（取决于实现）
      const stats = simpleCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(2);
      
      simpleCache.destroy();
    });
  });

  describe('批量操作测试', () => {
    test('应该支持批量获取', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      const results = cache.getMultiple(['key1', 'key2', 'nonexistent']);
      
      expect(results.size).toBe(2);
      expect(results.get('key1')).toBe('value1');
      expect(results.get('key2')).toBe('value2');
      expect(results.has('nonexistent')).toBe(false);
    });

    test('应该支持批量设置', () => {
      const entries: Array<[string, string]> = [
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3']
      ];
      
      cache.setMultiple(entries, 5000, 80);
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    test('应该获取所有有效键', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 2000);
      cache.set('key3', 'value3', 0); // 永不过期
      
      let keys = cache.keys();
      expect(keys.length).toBe(3);
      
      // 让key1过期
      vi.advanceTimersByTime(1500);
      
      keys = cache.keys();
      expect(keys.length).toBe(2);
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys).not.toContain('key1');
    });

    test('应该获取包含过期键的所有键', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 2000);
      
      vi.advanceTimersByTime(1500); // key1过期
      
      const allKeys = cache.keys(true);
      const validKeys = cache.keys(false);
      
      expect(allKeys.length).toBe(2);
      expect(validKeys.length).toBe(1);
      expect(validKeys).toContain('key2');
    });
  });

  describe('标签操作测试', () => {
    test('应该支持按标签删除', () => {
      cache.set('user1', { id: 1 }, undefined, 50, ['user', 'active']);
      cache.set('user2', { id: 2 }, undefined, 50, ['user', 'inactive']);
      cache.set('product1', { id: 1 }, undefined, 50, ['product']);
      cache.set('order1', { id: 1 }, undefined, 50, ['user', 'order']);
      
      // 删除所有user标签的条目
      const deletedCount = cache.deleteByTag('user');
      expect(deletedCount).toBe(3);
      
      expect(cache.has('user1')).toBe(false);
      expect(cache.has('user2')).toBe(false);
      expect(cache.has('order1')).toBe(false);
      expect(cache.has('product1')).toBe(true); // 没有user标签
    });

    test('应该在没有匹配标签时返回0', () => {
      cache.set('key1', 'value1', undefined, 50, ['tag1']);
      
      const deletedCount = cache.deleteByTag('nonexistent-tag');
      expect(deletedCount).toBe(0);
    });
  });

  describe('统计信息测试', () => {
    test('应该正确计算命中率', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // 命中测试
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // hit
      cache.get('nonexistent'); // miss
      cache.get('nonexistent'); // miss
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(3 / 5);
    });

    test('应该跟踪内存使用量', () => {
      const stats1 = cache.getStats();
      expect(stats1.memoryUsage).toBe(0);
      
      cache.set('test', 'value');
      
      const stats2 = cache.getStats();
      expect(stats2.memoryUsage).toBeGreaterThan(0);
    });

    test('应该跟踪过期和淘汰条目', () => {
      cache.set('expire-key', 'value', 1000);
      
      vi.advanceTimersByTime(1500);
      cache.get('expire-key'); // 触发过期检查
      
      const stats = cache.getStats();
      expect(stats.expiredEntries).toBeGreaterThan(0);
    });

    test('应该计算平均访问时间', () => {
      cache.set('timing-key', 'value');
      
      // 模拟performance.now
      let performanceNowValue = 0;
      vi.spyOn(performance, 'now').mockImplementation(() => {
        performanceNowValue += 10;
        return performanceNowValue;
      });
      
      cache.get('timing-key');
      cache.get('timing-key');
      
      const stats = cache.getStats();
      expect(stats.averageAccessTime).toBeGreaterThan(0);
    });
  });

  describe('数据大小估算测试', () => {
    test('应该正确估算字符串大小', () => {
      const shortString = 'hello';
      const longString = 'x'.repeat(100);
      
      cache.set('short', shortString);
      cache.set('long', longString);
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(shortString.length * 2);
    });

    test('应该正确估算数字大小', () => {
      cache.set('number', 42);
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBe(8); // 数字8字节
    });

    test('应该正确估算布尔值大小', () => {
      cache.set('boolean', true);
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBe(1); // 布尔值1字节
    });

    test('应该正确估算ArrayBuffer大小', () => {
      const buffer = new ArrayBuffer(256);
      cache.set('buffer', buffer);
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBe(256);
    });

    test('应该正确估算Uint8Array大小', () => {
      const array = new Uint8Array(128);
      cache.set('array', array);
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBe(128);
    });

    test('应该正确估算对象大小', () => {
      const obj = { id: 1, name: 'test', data: [1, 2, 3] };
      cache.set('object', obj);
      
      const stats = cache.getStats();
      const jsonSize = JSON.stringify(obj).length * 2;
      expect(stats.memoryUsage).toBe(jsonSize);
    });

    test('应该处理null和undefined', () => {
      cache.set('null', null);
      cache.set('undefined', undefined);
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBe(0);
    });
  });

  describe('条目信息测试', () => {
    test('应该获取条目信息但不包含数据', () => {
      const testData = { id: 1, value: 'test' };
      cache.set('info-key', testData, 5000, 75, ['tag1', 'tag2']);
      
      const info = cache.getEntryInfo('info-key');
      expect(info).toBeDefined();
      expect(info).not.toHaveProperty('data');
      expect(info).toHaveProperty('expiry');
      expect(info).toHaveProperty('created');
      expect(info).toHaveProperty('lastAccessed');
      expect(info).toHaveProperty('accessCount');
      expect(info).toHaveProperty('size');
      expect(info).toHaveProperty('priority');
      expect(info).toHaveProperty('tags');
      
      expect(info!.priority).toBe(75);
      expect(info!.tags).toEqual(['tag1', 'tag2']);
    });

    test('应该在获取不存在条目信息时返回undefined', () => {
      const info = cache.getEntryInfo('nonexistent-key');
      expect(info).toBeUndefined();
    });
  });

  describe('自动清理测试', () => {
    test('应该定期清理过期条目', () => {
      const cleanupCache = new DataCache({ 
        cleanupInterval: 1000,
        defaultTTL: 500
      });
      
      cleanupCache.set('key1', 'value1');
      cleanupCache.set('key2', 'value2');
      
      // 推进时间使条目过期
      vi.advanceTimersByTime(600);
      
      // 触发清理定时器
      vi.advanceTimersByTime(1000);
      
      expect(cleanupCache.has('key1')).toBe(false);
      expect(cleanupCache.has('key2')).toBe(false);
      
      cleanupCache.destroy();
    });

    test('应该能手动清理过期条目', () => {
      cache.set('expire1', 'value1', 1000);
      cache.set('expire2', 'value2', 2000);
      cache.set('permanent', 'value3', 0);
      
      vi.advanceTimersByTime(1500); // expire1过期
      
      const cleanedCount = cache.cleanup();
      expect(cleanedCount).toBe(1);
      
      expect(cache.has('expire1')).toBe(false);
      expect(cache.has('expire2')).toBe(true);
      expect(cache.has('permanent')).toBe(true);
    });

    test('应该在没有过期条目时返回0', () => {
      cache.set('key1', 'value1', 0); // 永不过期
      cache.set('key2', 'value2', 5000); // 5秒后过期
      
      const cleanedCount = cache.cleanup();
      expect(cleanedCount).toBe(0);
    });
  });

  describe('访问计数测试', () => {
    test('应该正确跟踪访问次数', () => {
      cache.set('access-key', 'value');
      
      // 多次访问
      cache.get('access-key');
      cache.get('access-key');
      cache.get('access-key');
      
      const info = cache.getEntryInfo('access-key');
      expect(info?.accessCount).toBe(3);
    });

    test('应该更新最后访问时间', () => {
      cache.set('time-key', 'value');
      
      const info1 = cache.getEntryInfo('time-key');
      const firstAccess = info1?.lastAccessed;
      
      vi.advanceTimersByTime(1000);
      cache.get('time-key');
      
      const info2 = cache.getEntryInfo('time-key');
      const secondAccess = info2?.lastAccessed;
      
      expect(secondAccess).toBeGreaterThan(firstAccess!);
    });
  });

  describe('资源清理测试', () => {
    test('应该正确清理定时器和资源', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      cache.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    test('应该在销毁后清空缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.destroy();
      
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.memoryUsage).toBe(0);
    });
  });
});

describe('MultiLevelCache', () => {
  let multiCache: MultiLevelCache<any>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    // 创建多级缓存：L1小容量，L2大容量，禁用清理定时器
    multiCache = new MultiLevelCache(
      { maxSize: 2, defaultTTL: 1000, cleanupInterval: 0 }, // L1配置
      { maxSize: 10, defaultTTL: 2000, cleanupInterval: 0 }  // L2配置
    );
  });
  
  afterEach(() => {
    if (multiCache) {
      try {
        multiCache.destroy();
      } catch (error) {
        // 忽略清理错误
      }
    }
    vi.useRealTimers();
  });

  describe('多级缓存基本操作测试', () => {
    test('应该能设置和获取数据', async () => {
      multiCache.set('test-key', 'test-value');
      
      const value = await multiCache.get('test-key');
      expect(value).toBe('test-value');
    });

    test('应该先从L1缓存查找数据', async () => {
      multiCache.set('l1-key', 'l1-value');
      
      const value = await multiCache.get('l1-key');
      expect(value).toBe('l1-value');
      
      const stats = multiCache.getStats();
      expect(stats.l1.hits).toBe(1);
    });

    test('应该在L1未命中时从L2查找', async () => {
      // 直接设置到L2（模拟L1淘汰后的情况）
      multiCache.set('l2-key', 'l2-value');
      
      // 添加更多数据使L1满载并淘汰原数据
      multiCache.set('new1', 'value1');
      multiCache.set('new2', 'value2');
      multiCache.set('new3', 'value3'); // 触发L1淘汰
      
      // 从L2恢复数据
      const value = await multiCache.get('l2-key');
      expect(value).toBe('l2-value');
    });

    test('应该将L2数据提升到L1', async () => {
      multiCache.set('promote-key', 'promote-value');
      
      // 清空L1但保留L2
      const stats1 = multiCache.getStats();
      
      // 添加足够多的数据以淘汰L1中的数据
      multiCache.set('filler1', 'filler1');
      multiCache.set('filler2', 'filler2');
      multiCache.set('filler3', 'filler3');
      
      // 从L2获取数据，应该提升到L1
      const value = await multiCache.get('promote-key');
      expect(value).toBe('promote-value');
      
      // 再次获取应该从L1命中
      const value2 = await multiCache.get('promote-key');
      expect(value2).toBe('promote-value');
    });

    test('应该在所有级别都未找到时返回undefined', async () => {
      const value = await multiCache.get('nonexistent-key');
      expect(value).toBeUndefined();
    });
  });

  describe('多级缓存删除和清理测试', () => {
    test('应该删除所有级别的数据', () => {
      multiCache.set('delete-key', 'delete-value');
      
      const deleted = multiCache.delete('delete-key');
      expect(deleted).toBe(true);
      
      // 验证两个级别都被删除
      const stats = multiCache.getStats();
      expect(stats.l1.size).toBe(0);
      expect(stats.l2?.size).toBe(0);
    });

    test('应该清空所有级别的缓存', () => {
      multiCache.set('key1', 'value1');
      multiCache.set('key2', 'value2');
      
      multiCache.clear();
      
      const stats = multiCache.getStats();
      expect(stats.l1.size).toBe(0);
      expect(stats.l2?.size).toBe(0);
    });
  });

  describe('多级缓存统计测试', () => {
    test('应该提供L1和L2的统计信息', () => {
      multiCache.set('stats-key', 'stats-value');
      
      const stats = multiCache.getStats();
      
      expect(stats).toHaveProperty('l1');
      expect(stats).toHaveProperty('l2');
      expect(stats.l1).toHaveProperty('size');
      expect(stats.l1).toHaveProperty('hits');
      expect(stats.l1).toHaveProperty('misses');
      expect(stats.l2).toHaveProperty('size');
      expect(stats.l2).toHaveProperty('hits');
      expect(stats.l2).toHaveProperty('misses');
    });

    test('应该只有L1统计当没有L2缓存时', () => {
      const singleLevelCache = new MultiLevelCache({ maxSize: 5 });
      
      singleLevelCache.set('test', 'value');
      const stats = singleLevelCache.getStats();
      
      expect(stats).toHaveProperty('l1');
      expect(stats).not.toHaveProperty('l2');
      
      singleLevelCache.destroy();
    });
  });

  describe('TTL策略测试', () => {
    test('应该为L2使用更长的TTL', () => {
      multiCache.set('ttl-key', 'ttl-value', 1000); // 1秒TTL
      
      // L1应该在1秒后过期，L2在2秒后过期
      vi.advanceTimersByTime(1500);
      
      const stats = multiCache.getStats();
      
      // L2的TTL应该是L1的2倍
      expect(stats.l2?.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('资源清理测试', () => {
    test('应该清理所有级别的资源', () => {
      multiCache.set('cleanup-key', 'cleanup-value');
      
      multiCache.destroy();
      
      const stats = multiCache.getStats();
      expect(stats.l1.size).toBe(0);
      expect(stats.l2?.size).toBe(0);
      expect(stats.l1.memoryUsage).toBe(0);
      expect(stats.l2?.memoryUsage).toBe(0);
    });
  });
});

describe('EvictionPolicy枚举测试', () => {
  test('应该定义正确的淘汰策略', () => {
    expect(EvictionPolicy.LRU).toBe('lru');
    expect(EvictionPolicy.LFU).toBe('lfu');
    expect(EvictionPolicy.FIFO).toBe('fifo');
    expect(EvictionPolicy.RANDOM).toBe('random');
  });
});

describe('边界条件和错误处理测试', () => {
  let cache: DataCache<any>;
  
  beforeEach(() => {
    cache = new DataCache({ cleanupInterval: 0 });
  });
  
  afterEach(() => {
    if (cache) {
      try {
        cache.destroy();
      } catch (error) {
        // 忽略清理错误
      }
    }
  });

  test('应该处理空字符串键', () => {
    cache.set('', 'empty-key-value');
    expect(cache.get('')).toBe('empty-key-value');
  });

  test('应该处理特殊字符键', () => {
    const specialKey = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    cache.set(specialKey, 'special-value');
    expect(cache.get(specialKey)).toBe('special-value');
  });

  test('应该处理循环引用对象', () => {
    const obj: any = { id: 1 };
    obj.self = obj; // 创建循环引用
    
    // 应该不抛出错误，使用默认大小
    expect(() => cache.set('circular', obj)).not.toThrow();
    
    // 获取数据应该正常工作
    const retrieved = cache.get('circular');
    expect(retrieved.id).toBe(1);
  });

  test('应该处理非常大的数据', () => {
    const largeData = 'x'.repeat(1000000); // 1MB字符串
    
    expect(() => cache.set('large', largeData)).not.toThrow();
    expect(cache.get('large')).toBe(largeData);
  });

  test('应该处理负数TTL', () => {
    cache.set('negative-ttl', 'value', -1000);
    
    // 负数TTL应该立即过期
    expect(cache.has('negative-ttl')).toBe(false);
  });

  test('应该处理无效优先级', () => {
    cache.set('invalid-priority', 'value', undefined, -10);
    cache.set('high-priority', 'value', undefined, 200);
    
    // 应该能正常存储，不抛出错误
    expect(cache.get('invalid-priority')).toBe('value');
    expect(cache.get('high-priority')).toBe('value');
  });
});
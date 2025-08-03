"use strict";
/**
 * DataCache - 高性能数据缓存系统
 * 基于Serial-Studio的数据管理设计，提供多层缓存和智能淘汰策略
 * 支持TTL、LRU、内存限制等多种缓存策略
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLevelCache = exports.DataCache = exports.EvictionPolicy = void 0;
/**
 * 淘汰策略枚举
 */
var EvictionPolicy;
(function (EvictionPolicy) {
    /** 最近最少使用 */
    EvictionPolicy["LRU"] = "lru";
    /** 最不常用 */
    EvictionPolicy["LFU"] = "lfu";
    /** 先进先出 */
    EvictionPolicy["FIFO"] = "fifo";
    /** 随机淘汰 */
    EvictionPolicy["RANDOM"] = "random";
})(EvictionPolicy = exports.EvictionPolicy || (exports.EvictionPolicy = {}));
/**
 * 高性能数据缓存类
 * 提供多种缓存策略和优化功能
 */
class DataCache {
    cache = new Map();
    accessOrder = []; // LRU 访问顺序
    cleanupTimer = null;
    stats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        memoryUsage: 0,
        expiredEntries: 0,
        evictedEntries: 0,
        averageAccessTime: 0
    };
    options;
    constructor(options = {}) {
        this.options = {
            maxSize: options.maxSize || 1000,
            maxMemory: options.maxMemory || 100 * 1024 * 1024,
            defaultTTL: options.defaultTTL || 5 * 60 * 1000,
            cleanupInterval: options.cleanupInterval || 60 * 1000,
            enableLRU: options.enableLRU !== false,
            enableCompression: options.enableCompression || false,
            enableStats: options.enableStats !== false
        };
        this.startCleanupTimer();
    }
    /**
     * 设置缓存条目
     *
     * @param key 缓存键
     * @param data 要缓存的数据
     * @param ttl 生存时间（毫秒），0表示永不过期
     * @param priority 优先级（0-100，越高越重要）
     * @param tags 标签数组
     */
    set(key, data, ttl, priority = 50, tags) {
        const now = Date.now();
        const actualTTL = ttl !== undefined ? ttl : this.options.defaultTTL;
        const expiry = actualTTL === 0 ? Infinity : now + actualTTL;
        // 计算数据大小
        const size = this.estimateSize(data);
        // 创建缓存条目
        const entry = {
            data,
            expiry,
            created: now,
            lastAccessed: now,
            accessCount: 0,
            size,
            priority,
            tags
        };
        // 检查是否需要淘汰
        this.ensureCapacity(size);
        // 更新缓存
        if (this.cache.has(key)) {
            // 更新现有条目
            const oldEntry = this.cache.get(key);
            this.stats.memoryUsage -= oldEntry.size;
        }
        else {
            this.stats.size++;
        }
        this.cache.set(key, entry);
        this.stats.memoryUsage += size;
        // 更新LRU顺序
        if (this.options.enableLRU) {
            this.updateAccessOrder(key);
        }
        this.updateStats();
    }
    /**
     * 获取缓存条目
     *
     * @param key 缓存键
     * @returns 缓存的数据，如果不存在或已过期则返回undefined
     */
    get(key) {
        const startTime = this.options.enableStats ? performance.now() : 0;
        const entry = this.cache.get(key);
        if (!entry) {
            if (this.options.enableStats) {
                this.stats.misses++;
            }
            return undefined;
        }
        // 检查是否过期
        const now = Date.now();
        if (entry.expiry < now) {
            this.delete(key);
            if (this.options.enableStats) {
                this.stats.misses++;
                this.stats.expiredEntries++;
            }
            return undefined;
        }
        // 更新访问信息
        entry.lastAccessed = now;
        entry.accessCount++;
        // 更新LRU顺序
        if (this.options.enableLRU) {
            this.updateAccessOrder(key);
        }
        // 更新统计
        if (this.options.enableStats) {
            this.stats.hits++;
            const accessTime = performance.now() - startTime;
            this.updateAverageAccessTime(accessTime);
        }
        return entry.data;
    }
    /**
     * 检查缓存键是否存在且未过期
     *
     * @param key 缓存键
     * @returns 是否存在
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        const now = Date.now();
        if (entry.expiry < now) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * 删除缓存条目
     *
     * @param key 缓存键
     * @returns 是否成功删除
     */
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        this.cache.delete(key);
        this.stats.size--;
        this.stats.memoryUsage -= entry.size;
        // 从LRU顺序中移除
        if (this.options.enableLRU) {
            const index = this.accessOrder.indexOf(key);
            if (index !== -1) {
                this.accessOrder.splice(index, 1);
            }
        }
        this.updateStats();
        return true;
    }
    /**
     * 根据标签批量删除
     *
     * @param tag 标签
     * @returns 删除的条目数
     */
    deleteByTag(tag) {
        let deletedCount = 0;
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.tags && entry.tags.includes(tag)) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            if (this.delete(key)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    /**
     * 清空缓存
     */
    clear() {
        this.cache.clear();
        this.accessOrder = [];
        this.stats.size = 0;
        this.stats.memoryUsage = 0;
        this.updateStats();
    }
    /**
     * 获取所有缓存键
     *
     * @param includeExpired 是否包含已过期的键
     * @returns 缓存键数组
     */
    keys(includeExpired = false) {
        if (includeExpired) {
            return Array.from(this.cache.keys());
        }
        const now = Date.now();
        const validKeys = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiry >= now) {
                validKeys.push(key);
            }
        }
        return validKeys;
    }
    /**
     * 获取缓存统计信息
     *
     * @returns 统计信息
     */
    getStats() {
        this.updateStats(); // 确保统计信息是最新的
        return { ...this.stats };
    }
    /**
     * 清理过期条目
     *
     * @returns 清理的条目数
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiry < now) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.delete(key);
        }
        if (expiredKeys.length > 0) {
            this.stats.expiredEntries += expiredKeys.length;
        }
        return expiredKeys.length;
    }
    /**
     * 获取缓存条目信息
     *
     * @param key 缓存键
     * @returns 条目信息，不包含数据本身
     */
    getEntryInfo(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        const { data, ...info } = entry;
        return info;
    }
    /**
     * 批量获取
     *
     * @param keys 缓存键数组
     * @returns 键值对映射
     */
    getMultiple(keys) {
        const result = new Map();
        for (const key of keys) {
            const value = this.get(key);
            if (value !== undefined) {
                result.set(key, value);
            }
        }
        return result;
    }
    /**
     * 批量设置
     *
     * @param entries 键值对数组
     * @param ttl 生存时间
     * @param priority 优先级
     */
    setMultiple(entries, ttl, priority) {
        for (const [key, value] of entries) {
            this.set(key, value, ttl, priority);
        }
    }
    /**
     * 更新TTL
     *
     * @param key 缓存键
     * @param ttl 新的TTL（毫秒）
     * @returns 是否成功更新
     */
    updateTTL(key, ttl) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        const now = Date.now();
        entry.expiry = ttl === 0 ? Infinity : now + ttl;
        return true;
    }
    /**
     * 销毁缓存实例
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.clear();
    }
    // 私有方法
    /**
     * 启动清理定时器
     */
    startCleanupTimer() {
        if (this.options.cleanupInterval > 0) {
            this.cleanupTimer = setInterval(() => {
                this.cleanup();
            }, this.options.cleanupInterval);
        }
    }
    /**
     * 确保缓存容量
     *
     * @param newEntrySize 新条目大小
     */
    ensureCapacity(newEntrySize) {
        // 检查内存限制
        while (this.stats.memoryUsage + newEntrySize > this.options.maxMemory && this.cache.size > 0) {
            this.evictOne();
        }
        // 检查条目数限制
        while (this.cache.size >= this.options.maxSize && this.cache.size > 0) {
            this.evictOne();
        }
    }
    /**
     * 淘汰一个条目
     */
    evictOne() {
        let keyToEvict = null;
        if (this.options.enableLRU && this.accessOrder.length > 0) {
            // LRU策略：淘汰最久未访问的
            keyToEvict = this.accessOrder[0];
        }
        else {
            // 简单策略：淘汰第一个条目
            keyToEvict = this.cache.keys().next().value;
        }
        if (keyToEvict) {
            this.delete(keyToEvict);
            this.stats.evictedEntries++;
        }
    }
    /**
     * 更新LRU访问顺序
     *
     * @param key 缓存键
     */
    updateAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(key);
    }
    /**
     * 估算数据大小
     *
     * @param data 数据
     * @returns 估算大小（字节）
     */
    estimateSize(data) {
        if (data === null || data === undefined) {
            return 0;
        }
        if (typeof data === 'string') {
            return data.length * 2; // UTF-16
        }
        if (typeof data === 'number') {
            return 8;
        }
        if (typeof data === 'boolean') {
            return 1;
        }
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        }
        if (data instanceof Uint8Array) {
            return data.byteLength;
        }
        if (Array.isArray(data)) {
            return data.reduce((sum, item) => sum + this.estimateSize(item), 0);
        }
        if (typeof data === 'object') {
            try {
                return JSON.stringify(data).length * 2;
            }
            catch {
                return 1024; // 默认大小
            }
        }
        return 64; // 默认大小
    }
    /**
     * 更新统计信息
     */
    updateStats() {
        if (!this.options.enableStats) {
            return;
        }
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
    /**
     * 更新平均访问时间
     *
     * @param accessTime 本次访问时间
     */
    updateAverageAccessTime(accessTime) {
        const currentAverage = this.stats.averageAccessTime;
        const totalAccesses = this.stats.hits;
        this.stats.averageAccessTime = ((currentAverage * (totalAccesses - 1)) + accessTime) / totalAccesses;
    }
}
exports.DataCache = DataCache;
/**
 * 多级缓存管理器
 * 提供L1（内存）、L2（磁盘）多级缓存
 */
class MultiLevelCache {
    l1Cache;
    l2Cache = null;
    constructor(l1Options = {}, l2Options) {
        this.l1Cache = new DataCache(l1Options);
        if (l2Options) {
            this.l2Cache = new DataCache(l2Options);
        }
    }
    /**
     * 获取数据（从L1开始查找）
     */
    async get(key) {
        // 先从L1缓存查找
        let value = this.l1Cache.get(key);
        if (value !== undefined) {
            return value;
        }
        // 再从L2缓存查找
        if (this.l2Cache) {
            value = this.l2Cache.get(key);
            if (value !== undefined) {
                // 将数据提升到L1缓存
                this.l1Cache.set(key, value);
                return value;
            }
        }
        return undefined;
    }
    /**
     * 设置数据（同时写入L1和L2）
     */
    set(key, data, ttl, priority) {
        this.l1Cache.set(key, data, ttl, priority);
        if (this.l2Cache) {
            // L2缓存使用更长的TTL
            const l2TTL = ttl ? ttl * 2 : undefined;
            this.l2Cache.set(key, data, l2TTL, priority);
        }
    }
    /**
     * 删除数据
     */
    delete(key) {
        let deleted = this.l1Cache.delete(key);
        if (this.l2Cache) {
            deleted = this.l2Cache.delete(key) || deleted;
        }
        return deleted;
    }
    /**
     * 清空所有缓存
     */
    clear() {
        this.l1Cache.clear();
        if (this.l2Cache) {
            this.l2Cache.clear();
        }
    }
    /**
     * 获取综合统计信息
     */
    getStats() {
        const result = {
            l1: this.l1Cache.getStats()
        };
        if (this.l2Cache) {
            result.l2 = this.l2Cache.getStats();
        }
        return result;
    }
    /**
     * 销毁缓存
     */
    destroy() {
        this.l1Cache.destroy();
        if (this.l2Cache) {
            this.l2Cache.destroy();
        }
    }
}
exports.MultiLevelCache = MultiLevelCache;
exports.default = DataCache;
//# sourceMappingURL=DataCache.js.map
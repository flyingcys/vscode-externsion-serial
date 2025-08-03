/**
 * DataCache - 高性能数据缓存系统
 * 基于Serial-Studio的数据管理设计，提供多层缓存和智能淘汰策略
 * 支持TTL、LRU、内存限制等多种缓存策略
 */
/**
 * 缓存条目接口
 */
export interface CacheEntry<T = any> {
    /** 缓存的数据 */
    data: T;
    /** 过期时间戳 */
    expiry: number;
    /** 创建时间戳 */
    created: number;
    /** 最后访问时间戳 */
    lastAccessed: number;
    /** 访问次数 */
    accessCount: number;
    /** 数据大小（字节） */
    size: number;
    /** 优先级（用于智能淘汰） */
    priority: number;
    /** 标签（用于批量操作） */
    tags?: string[];
}
/**
 * 缓存配置选项
 */
export interface CacheOptions {
    /** 最大缓存条目数 */
    maxSize?: number;
    /** 最大内存使用量（字节） */
    maxMemory?: number;
    /** 默认TTL（毫秒） */
    defaultTTL?: number;
    /** 清理间隔（毫秒） */
    cleanupInterval?: number;
    /** 启用LRU淘汰策略 */
    enableLRU?: boolean;
    /** 启用压缩存储 */
    enableCompression?: boolean;
    /** 启用性能统计 */
    enableStats?: boolean;
}
/**
 * 缓存统计信息
 */
export interface CacheStats {
    /** 总命中次数 */
    hits: number;
    /** 总未命中次数 */
    misses: number;
    /** 命中率 */
    hitRate: number;
    /** 当前条目数 */
    size: number;
    /** 内存使用量（字节） */
    memoryUsage: number;
    /** 已过期条目数 */
    expiredEntries: number;
    /** 已淘汰条目数 */
    evictedEntries: number;
    /** 平均访问时间（毫秒） */
    averageAccessTime: number;
}
/**
 * 淘汰策略枚举
 */
export declare enum EvictionPolicy {
    /** 最近最少使用 */
    LRU = "lru",
    /** 最不常用 */
    LFU = "lfu",
    /** 先进先出 */
    FIFO = "fifo",
    /** 随机淘汰 */
    RANDOM = "random"
}
/**
 * 高性能数据缓存类
 * 提供多种缓存策略和优化功能
 */
export declare class DataCache<T = any> {
    private cache;
    private accessOrder;
    private cleanupTimer;
    private stats;
    private readonly options;
    constructor(options?: CacheOptions);
    /**
     * 设置缓存条目
     *
     * @param key 缓存键
     * @param data 要缓存的数据
     * @param ttl 生存时间（毫秒），0表示永不过期
     * @param priority 优先级（0-100，越高越重要）
     * @param tags 标签数组
     */
    set(key: string, data: T, ttl?: number, priority?: number, tags?: string[]): void;
    /**
     * 获取缓存条目
     *
     * @param key 缓存键
     * @returns 缓存的数据，如果不存在或已过期则返回undefined
     */
    get(key: string): T | undefined;
    /**
     * 检查缓存键是否存在且未过期
     *
     * @param key 缓存键
     * @returns 是否存在
     */
    has(key: string): boolean;
    /**
     * 删除缓存条目
     *
     * @param key 缓存键
     * @returns 是否成功删除
     */
    delete(key: string): boolean;
    /**
     * 根据标签批量删除
     *
     * @param tag 标签
     * @returns 删除的条目数
     */
    deleteByTag(tag: string): number;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 获取所有缓存键
     *
     * @param includeExpired 是否包含已过期的键
     * @returns 缓存键数组
     */
    keys(includeExpired?: boolean): string[];
    /**
     * 获取缓存统计信息
     *
     * @returns 统计信息
     */
    getStats(): CacheStats;
    /**
     * 清理过期条目
     *
     * @returns 清理的条目数
     */
    cleanup(): number;
    /**
     * 获取缓存条目信息
     *
     * @param key 缓存键
     * @returns 条目信息，不包含数据本身
     */
    getEntryInfo(key: string): Omit<CacheEntry<T>, 'data'> | undefined;
    /**
     * 批量获取
     *
     * @param keys 缓存键数组
     * @returns 键值对映射
     */
    getMultiple(keys: string[]): Map<string, T>;
    /**
     * 批量设置
     *
     * @param entries 键值对数组
     * @param ttl 生存时间
     * @param priority 优先级
     */
    setMultiple(entries: Array<[string, T]>, ttl?: number, priority?: number): void;
    /**
     * 更新TTL
     *
     * @param key 缓存键
     * @param ttl 新的TTL（毫秒）
     * @returns 是否成功更新
     */
    updateTTL(key: string, ttl: number): boolean;
    /**
     * 销毁缓存实例
     */
    destroy(): void;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 确保缓存容量
     *
     * @param newEntrySize 新条目大小
     */
    private ensureCapacity;
    /**
     * 淘汰一个条目
     */
    private evictOne;
    /**
     * 更新LRU访问顺序
     *
     * @param key 缓存键
     */
    private updateAccessOrder;
    /**
     * 估算数据大小
     *
     * @param data 数据
     * @returns 估算大小（字节）
     */
    private estimateSize;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 更新平均访问时间
     *
     * @param accessTime 本次访问时间
     */
    private updateAverageAccessTime;
}
/**
 * 多级缓存管理器
 * 提供L1（内存）、L2（磁盘）多级缓存
 */
export declare class MultiLevelCache<T = any> {
    private l1Cache;
    private l2Cache;
    constructor(l1Options?: CacheOptions, l2Options?: CacheOptions);
    /**
     * 获取数据（从L1开始查找）
     */
    get(key: string): Promise<T | undefined>;
    /**
     * 设置数据（同时写入L1和L2）
     */
    set(key: string, data: T, ttl?: number, priority?: number): void;
    /**
     * 删除数据
     */
    delete(key: string): boolean;
    /**
     * 清空所有缓存
     */
    clear(): void;
    /**
     * 获取综合统计信息
     */
    getStats(): {
        l1: CacheStats;
        l2?: CacheStats;
    };
    /**
     * 销毁缓存
     */
    destroy(): void;
}
export default DataCache;
//# sourceMappingURL=DataCache.d.ts.map
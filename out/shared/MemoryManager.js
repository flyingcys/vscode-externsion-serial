"use strict";
/**
 * MemoryManager - 内存管理优化系统
 * 防止内存泄漏和GC压力，基于Serial-Studio的高性能内存管理设计
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemoryManager = exports.MemoryManager = exports.WeakReferenceManager = exports.BufferPool = exports.ObjectPool = void 0;
/**
 * 对象池
 * 重用对象实例，减少GC压力
 */
class ObjectPool {
    pool = [];
    inUse = new Set();
    config;
    stats;
    constructor(config) {
        this.config = config;
        this.stats = {
            size: 0,
            used: 0,
            free: 0,
            hits: 0,
            misses: 0,
            hitRate: 0
        };
        // 初始化池
        this.initializePool();
    }
    /**
     * 初始化对象池
     */
    initializePool() {
        for (let i = 0; i < this.config.initialSize; i++) {
            const item = this.config.itemConstructor();
            this.pool.push(item);
        }
        this.updateStats();
    }
    /**
     * 获取对象
     */
    acquire() {
        let item;
        if (this.pool.length > 0) {
            // 从池中获取
            item = this.pool.pop();
            this.stats.hits++;
        }
        else {
            // 创建新对象
            if (this.inUse.size < this.config.maxSize) {
                item = this.config.itemConstructor();
                this.stats.misses++;
            }
            else {
                throw new Error('Object pool exhausted');
            }
        }
        this.inUse.add(item);
        this.updateStats();
        return item;
    }
    /**
     * 释放对象
     */
    release(item) {
        if (!this.inUse.has(item)) {
            console.warn('Attempting to release item not from this pool');
            return;
        }
        this.inUse.delete(item);
        // 重置对象状态
        this.resetItem(item);
        // 检查是否需要收缩池
        if (this.shouldShrink()) {
            // 销毁对象
            if (this.config.itemDestructor) {
                this.config.itemDestructor(item);
            }
        }
        else {
            // 返回池中
            this.pool.push(item);
        }
        this.updateStats();
    }
    /**
     * 重置对象状态
     */
    resetItem(item) {
        // 清理对象属性
        if (typeof item === 'object' && item !== null) {
            // 清理数组
            if (Array.isArray(item)) {
                item.length = 0;
            }
            // 清理Map和Set
            else if (item instanceof Map || item instanceof Set) {
                item.clear();
            }
            // 清理 TypedArray (包括 Uint8Array)
            else if (item instanceof Uint8Array ||
                item instanceof Int8Array ||
                item instanceof Uint16Array ||
                item instanceof Int16Array ||
                item instanceof Uint32Array ||
                item instanceof Int32Array ||
                item instanceof Float32Array ||
                item instanceof Float64Array) {
                // TypedArray 只需要填充零值，不能删除索引属性
                item.fill(0);
            }
            // 清理普通对象属性
            else {
                for (const key in item) {
                    if (item.hasOwnProperty(key) && typeof item[key] !== 'function') {
                        try {
                            delete item[key];
                        }
                        catch (error) {
                            // 如果属性不可删除，尝试设置为默认值
                            try {
                                item[key] = null;
                            }
                            catch (e) {
                                // 忽略无法设置的属性
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * 检查是否需要收缩
     */
    shouldShrink() {
        const totalSize = this.pool.length + this.inUse.size;
        const utilization = this.inUse.size / totalSize;
        return utilization < this.config.shrinkThreshold;
    }
    /**
     * 更新统计信息
     */
    updateStats() {
        this.stats.size = this.pool.length + this.inUse.size;
        this.stats.used = this.inUse.size;
        this.stats.free = this.pool.length;
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 清空池
     */
    clear() {
        // 释放所有在用对象
        this.inUse.clear();
        // 销毁池中对象
        if (this.config.itemDestructor) {
            for (const item of this.pool) {
                this.config.itemDestructor(item);
            }
        }
        this.pool = [];
        this.updateStats();
    }
}
exports.ObjectPool = ObjectPool;
/**
 * 缓冲区池
 * 专门管理字节数组的重用
 */
class BufferPool {
    pools = new Map();
    commonSizes = [64, 256, 1024, 4096, 16384, 65536]; // 常用大小
    bufferToOriginal = new WeakMap(); // 跟踪子数组到原始缓冲区的映射
    constructor() {
        // 初始化常用大小的池
        for (const size of this.commonSizes) {
            this.createPoolForSize(size);
        }
    }
    /**
     * 为指定大小创建池
     */
    createPoolForSize(size) {
        const pool = new ObjectPool({
            initialSize: 10,
            maxSize: 100,
            growthFactor: 1.5,
            shrinkThreshold: 0.3,
            itemConstructor: () => new Uint8Array(size),
            itemDestructor: () => { } // Uint8Array不需要特殊清理
        });
        this.pools.set(size, pool);
    }
    /**
     * 获取缓冲区
     */
    acquire(size) {
        // 查找最合适的池
        let bestSize = this.findBestSize(size);
        if (!bestSize) {
            // 为新尺寸创建池
            bestSize = this.roundUpToPowerOfTwo(size);
            this.createPoolForSize(bestSize);
        }
        const pool = this.pools.get(bestSize);
        const buffer = pool.acquire();
        // 如果需要的尺寸小于缓冲区，返回子数组并跟踪映射
        if (size < buffer.length) {
            const subarray = buffer.subarray(0, size);
            this.bufferToOriginal.set(subarray, buffer);
            return subarray;
        }
        return buffer;
    }
    /**
     * 释放缓冲区
     */
    release(buffer) {
        // 检查是否是子数组，如果是则获取原始缓冲区
        const originalBuffer = this.bufferToOriginal.get(buffer);
        const bufferToRelease = originalBuffer || buffer;
        const size = bufferToRelease.length;
        const pool = this.pools.get(size);
        if (pool) {
            pool.release(bufferToRelease);
            // 如果释放的是子数组，清理映射
            if (originalBuffer) {
                this.bufferToOriginal.delete(buffer);
            }
        }
        else {
            // 如果找不到对应的池，可能是外部创建的缓冲区，只记录警告
            console.warn(`Attempting to release buffer of size ${size} with no corresponding pool`);
        }
    }
    /**
     * 查找最合适的池尺寸
     */
    findBestSize(size) {
        for (const poolSize of this.pools.keys()) {
            if (poolSize >= size) {
                return poolSize;
            }
        }
        return null;
    }
    /**
     * 向上取整到二的幂次
     */
    roundUpToPowerOfTwo(size) {
        let power = 1;
        while (power < size) {
            power *= 2;
        }
        return power;
    }
    /**
     * 获取所有池的统计
     */
    getAllStats() {
        const stats = {};
        for (const [size, pool] of this.pools.entries()) {
            stats[size] = pool.getStats();
        }
        return stats;
    }
    /**
     * 清理所有池
     */
    clear() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
    }
}
exports.BufferPool = BufferPool;
/**
 * 弱引用管理器
 * 防止循环引用和内存泄漏
 */
class WeakReferenceManager {
    weakRefs = new Set();
    cleanupCallbacks = new Map();
    cleanupTimer = null;
    constructor() {
        this.startCleanupTimer();
    }
    /**
     * 添加弱引用
     */
    addWeakRef(target, cleanupCallback) {
        const weakRef = new WeakRef(target);
        this.weakRefs.add(weakRef);
        if (cleanupCallback) {
            this.cleanupCallbacks.set(weakRef, cleanupCallback);
        }
        return weakRef;
    }
    /**
     * 移除弱引用
     */
    removeWeakRef(weakRef) {
        this.weakRefs.delete(weakRef);
        const cleanupCallback = this.cleanupCallbacks.get(weakRef);
        if (cleanupCallback) {
            cleanupCallback();
            this.cleanupCallbacks.delete(weakRef);
        }
    }
    /**
     * 开始清理定时器
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 5000); // 每5秒清理一次
    }
    /**
     * 清理已被回收的引用
     */
    cleanup() {
        const toRemove = [];
        for (const weakRef of this.weakRefs) {
            if (weakRef.deref() === undefined) {
                toRemove.push(weakRef);
            }
        }
        for (const weakRef of toRemove) {
            this.removeWeakRef(weakRef);
        }
    }
    /**
     * 获取统计信息
     */
    getStats() {
        let active = 0;
        let inactive = 0;
        for (const weakRef of this.weakRefs) {
            if (weakRef.deref() !== undefined) {
                active++;
            }
            else {
                inactive++;
            }
        }
        return {
            totalRefs: this.weakRefs.size,
            activeRefs: active,
            inactiveRefs: inactive,
            cleanupCallbacks: this.cleanupCallbacks.size
        };
    }
    /**
     * 清理资源
     */
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        // 执行所有清理回调
        for (const callback of this.cleanupCallbacks.values()) {
            try {
                callback();
            }
            catch (error) {
                console.error('Cleanup callback error:', error);
            }
        }
        this.weakRefs.clear();
        this.cleanupCallbacks.clear();
    }
}
exports.WeakReferenceManager = WeakReferenceManager;
/**
 * 内存管理器主类
 * 统一管理所有内存优化组件
 */
class MemoryManager {
    objectPools = new Map();
    bufferPool;
    weakRefManager;
    gcObserver = null;
    memoryStats;
    lastGCTime = 0;
    gcCount = 0;
    constructor() {
        this.bufferPool = new BufferPool();
        this.weakRefManager = new WeakReferenceManager();
        this.memoryStats = {
            totalAllocated: 0,
            totalUsed: 0,
            totalFree: 0,
            gcCount: 0,
            gcTime: 0,
            memoryPressure: 0,
            poolStats: {}
        };
        this.initializeGCObserver();
        this.startMemoryMonitoring();
    }
    /**
     * 初始化GC观察器
     */
    initializeGCObserver() {
        if ('PerformanceObserver' in window) {
            try {
                this.gcObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'measure' && entry.name.includes('gc')) {
                            this.gcCount++;
                            this.lastGCTime = entry.duration;
                        }
                    }
                });
                this.gcObserver.observe({ entryTypes: ['measure'] });
            }
            catch (error) {
                console.warn('GC observer not supported:', error);
            }
        }
    }
    /**
     * 开始内存监控
     */
    startMemoryMonitoring() {
        setInterval(() => {
            this.updateMemoryStats();
        }, 1000); // 每秒更新
    }
    /**
     * 创建对象池
     */
    createObjectPool(name, config) {
        const pool = new ObjectPool(config);
        this.objectPools.set(name, pool);
        return pool;
    }
    /**
     * 获取对象池
     */
    getObjectPool(name) {
        return this.objectPools.get(name) || null;
    }
    /**
     * 获取缓冲区池
     */
    getBufferPool() {
        return this.bufferPool;
    }
    /**
     * 获取弱引用管理器
     */
    getWeakRefManager() {
        return this.weakRefManager;
    }
    /**
     * 更新内存统计
     */
    updateMemoryStats() {
        // 更新池统计
        this.memoryStats.poolStats = {};
        for (const [name, pool] of this.objectPools.entries()) {
            this.memoryStats.poolStats[name] = pool.getStats();
        }
        // 更新缓冲区池统计
        const bufferStats = this.bufferPool.getAllStats();
        for (const [size, stats] of Object.entries(bufferStats)) {
            this.memoryStats.poolStats[`buffer-${size}`] = stats;
        }
        // 更新内存使用情况
        if ('memory' in performance) {
            const memory = performance.memory;
            this.memoryStats.totalAllocated = memory.totalJSHeapSize;
            this.memoryStats.totalUsed = memory.usedJSHeapSize;
            this.memoryStats.totalFree = memory.totalJSHeapSize - memory.usedJSHeapSize;
            // 计算内存压力
            this.memoryStats.memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        // 更新GC统计
        this.memoryStats.gcCount = this.gcCount;
        this.memoryStats.gcTime = this.lastGCTime;
    }
    /**
     * 获取内存统计
     */
    getMemoryStats() {
        return { ...this.memoryStats };
    }
    /**
     * 强制进行垃圾回收
     */
    forceGC() {
        if ('gc' in window) {
            window.gc();
        }
        else {
            // 模拟垃圾回收：创建大量临时对象并立即释放
            const temp = [];
            for (let i = 0; i < 1000; i++) {
                temp.push(new Array(1000).fill(0));
            }
            temp.length = 0;
        }
    }
    /**
     * 内存压力缓解
     */
    relieveMemoryPressure() {
        // 清理所有池
        for (const pool of this.objectPools.values()) {
            // 对于对象池，清理部分空闲对象
            // 这里可以添加更精细的清理逻辑
        }
        this.bufferPool.clear();
        // 强制GC
        this.forceGC();
    }
    /**
     * 检查内存泄漏
     */
    checkMemoryLeaks() {
        const leaks = [];
        const recommendations = [];
        // 检查池利用率
        for (const [name, stats] of Object.entries(this.memoryStats.poolStats)) {
            if (stats.hitRate < 0.5) {
                leaks.push(`Pool '${name}' has low hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
                recommendations.push(`Consider reducing initial size of pool '${name}'`);
            }
            if (stats.size > stats.used * 3 && stats.used > 0) {
                leaks.push(`Pool '${name}' has excessive free objects`);
                recommendations.push(`Consider implementing dynamic shrinking for pool '${name}'`);
            }
        }
        // 检查内存压力
        if (this.memoryStats.memoryPressure > 0.8) {
            leaks.push(`High memory pressure: ${(this.memoryStats.memoryPressure * 100).toFixed(1)}%`);
            recommendations.push('Consider implementing memory pressure relief');
        }
        // 检查GC频率
        if (this.gcCount > 10) {
            leaks.push(`Frequent GC activity: ${this.gcCount} collections`);
            recommendations.push('Consider using object pooling for frequently allocated objects');
        }
        return { potentialLeaks: leaks, recommendations };
    }
    /**
     * 优化内存使用
     */
    optimize() {
        const leakCheck = this.checkMemoryLeaks();
        if (leakCheck.potentialLeaks.length > 0) {
            console.warn('Memory optimization needed:', leakCheck);
            // 自动优化措施
            if (this.memoryStats.memoryPressure > 0.8) {
                this.relieveMemoryPressure();
            }
        }
    }
    /**
     * 清理资源
     */
    dispose() {
        // 清理GC观察器
        if (this.gcObserver) {
            this.gcObserver.disconnect();
            this.gcObserver = null;
        }
        // 清理所有池
        for (const pool of this.objectPools.values()) {
            pool.clear();
        }
        this.objectPools.clear();
        this.bufferPool.clear();
        this.weakRefManager.dispose();
    }
}
exports.MemoryManager = MemoryManager;
// 全局单例
let globalMemoryManager = null;
/**
 * 获取全局内存管理器实例
 */
function getMemoryManager() {
    if (!globalMemoryManager) {
        globalMemoryManager = new MemoryManager();
    }
    return globalMemoryManager;
}
exports.getMemoryManager = getMemoryManager;
exports.default = MemoryManager;
//# sourceMappingURL=MemoryManager.js.map
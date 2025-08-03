"use strict";
/**
 * VirtualizationManager - 虚拟化渲染管理器
 * 协调虚拟列表和表格的性能优化，基于Serial-Studio的高性能列表渲染
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.virtualizationManager = exports.VirtualizationManager = void 0;
const events_1 = require("events");
const MemoryManager_1 = require("./MemoryManager");
const ObjectPoolManager_1 = require("./ObjectPoolManager");
/**
 * 虚拟化管理器
 * 提供全局的虚拟化性能优化和资源管理
 */
class VirtualizationManager extends events_1.EventEmitter {
    static instance = null;
    config;
    instances = new Map();
    itemCaches = new Map();
    renderTimers = new Map();
    scrollTimers = new Map();
    updateQueues = new Map();
    // 性能监控
    metrics = new Map();
    performanceObserver = null;
    isMonitoring = false;
    // 内存管理
    memoryManager = (0, MemoryManager_1.getMemoryManager)();
    lastMemoryOptimization = 0;
    memoryOptimizationInterval = 30000; // 30秒
    constructor() {
        super();
        // 默认配置
        this.config = {
            defaultItemHeight: 32,
            bufferSize: 5,
            overscan: 5,
            enableVirtualization: true,
            enableItemRecycling: true,
            enableBatchUpdates: true,
            enableSmartScrolling: true,
            maxCacheSize: 1000,
            cacheExpirationTime: 300000,
            enableMemoryOptimization: true,
            renderThreshold: 16.67,
            updateThrottleTime: 16,
            scrollThrottleTime: 8
        };
        this.setupPerformanceMonitoring();
        this.startMemoryOptimization();
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!VirtualizationManager.instance) {
            VirtualizationManager.instance = new VirtualizationManager();
        }
        return VirtualizationManager.instance;
    }
    /**
     * 注册虚拟化实例
     */
    registerInstance(id, type, config = {}) {
        const instance = {
            id,
            type,
            itemCount: 0,
            visibleRange: { start: 0, end: 0 },
            scrollTop: 0,
            containerHeight: 0,
            itemHeight: this.config.defaultItemHeight,
            isScrolling: false,
            lastUpdateTime: Date.now(),
            ...config
        };
        this.instances.set(id, instance);
        this.itemCaches.set(id, new Map());
        this.updateQueues.set(id, []);
        // 初始化性能指标
        this.metrics.set(id, {
            instanceId: id,
            totalItems: 0,
            visibleItems: 0,
            renderTime: 0,
            scrollFPS: 60,
            memoryUsage: 0,
            cacheHitRate: 0,
            updateFrequency: 0
        });
        console.log(`虚拟化实例已注册: ${id} (${type})`);
        return instance;
    }
    /**
     * 注销虚拟化实例
     */
    unregisterInstance(id) {
        const instance = this.instances.get(id);
        if (!instance) {
            return;
        }
        // 清理定时器
        const renderTimer = this.renderTimers.get(id);
        if (renderTimer) {
            clearTimeout(renderTimer);
            this.renderTimers.delete(id);
        }
        const scrollTimer = this.scrollTimers.get(id);
        if (scrollTimer) {
            clearTimeout(scrollTimer);
            this.scrollTimers.delete(id);
        }
        // 清理缓存
        this.clearInstanceCache(id);
        // 移除实例
        this.instances.delete(id);
        this.itemCaches.delete(id);
        this.updateQueues.delete(id);
        this.metrics.delete(id);
        console.log(`虚拟化实例已注销: ${id}`);
    }
    /**
     * 更新实例状态
     */
    updateInstance(id, updates) {
        const instance = this.instances.get(id);
        if (!instance) {
            return;
        }
        Object.assign(instance, updates, { lastUpdateTime: Date.now() });
        // 更新性能指标
        this.updateMetrics(id);
    }
    /**
     * 计算可见范围
     */
    calculateVisibleRange(id, scrollTop, containerHeight, itemCount) {
        const instance = this.instances.get(id);
        if (!instance) {
            return { start: 0, end: 0 };
        }
        const { bufferSize, overscan } = this.config;
        let start = 0;
        let end = 0;
        if (typeof instance.itemHeight === 'number') {
            // 固定高度计算
            const itemHeight = instance.itemHeight;
            start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
            end = Math.min(itemCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize);
        }
        else {
            // 动态高度计算
            const cache = this.itemCaches.get(id);
            if (cache) {
                start = this.findStartIndex(id, scrollTop);
                end = this.findEndIndex(id, scrollTop + containerHeight, start);
            }
        }
        // 应用超扫描
        start = Math.max(0, start - overscan);
        end = Math.min(itemCount - 1, end + overscan);
        return { start, end };
    }
    /**
     * 查找起始索引（动态高度）
     */
    findStartIndex(id, scrollTop) {
        const cache = this.itemCaches.get(id);
        if (!cache) {
            return 0;
        }
        let accumulatedHeight = 0;
        let index = 0;
        for (const [itemIndex, item] of cache.entries()) {
            if (accumulatedHeight + item.height > scrollTop) {
                index = itemIndex;
                break;
            }
            accumulatedHeight += item.height;
        }
        return index;
    }
    /**
     * 查找结束索引（动态高度）
     */
    findEndIndex(id, bottomBoundary, startIndex) {
        const cache = this.itemCaches.get(id);
        if (!cache) {
            return startIndex;
        }
        let accumulatedHeight = 0;
        let index = startIndex;
        // 计算起始位置的累积高度
        for (let i = 0; i < startIndex; i++) {
            const item = cache.get(i);
            if (item) {
                accumulatedHeight += item.height;
            }
        }
        // 查找结束位置
        for (const [itemIndex, item] of cache.entries()) {
            if (itemIndex < startIndex) {
                continue;
            }
            accumulatedHeight += item.height;
            if (accumulatedHeight >= bottomBoundary) {
                index = itemIndex;
                break;
            }
        }
        return index;
    }
    /**
     * 缓存项目数据
     */
    cacheItem(id, index, data, height) {
        if (!this.config.enableItemRecycling) {
            return;
        }
        const cache = this.itemCaches.get(id);
        if (!cache) {
            return;
        }
        // 检查缓存大小限制
        if (cache.size >= this.config.maxCacheSize) {
            this.evictOldestCacheItems(id, Math.floor(this.config.maxCacheSize * 0.2));
        }
        const existingItem = cache.get(index);
        cache.set(index, {
            data,
            height,
            timestamp: Date.now(),
            accessCount: existingItem ? existingItem.accessCount + 1 : 1
        });
    }
    /**
     * 获取缓存项目
     */
    getCachedItem(id, index) {
        const cache = this.itemCaches.get(id);
        if (!cache) {
            return null;
        }
        const item = cache.get(index);
        if (!item) {
            return null;
        }
        // 检查是否过期
        if (Date.now() - item.timestamp > this.config.cacheExpirationTime) {
            cache.delete(index);
            return null;
        }
        // 更新访问计数
        item.accessCount++;
        return item;
    }
    /**
     * 批量更新项目
     */
    batchUpdate(id, updates) {
        if (!this.config.enableBatchUpdates) {
            this.processUpdates(id, updates);
            return;
        }
        const queue = this.updateQueues.get(id) || [];
        queue.push(...updates);
        this.updateQueues.set(id, queue);
        // 设置批量处理定时器
        let timer = this.renderTimers.get(id);
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            const allUpdates = this.updateQueues.get(id) || [];
            this.updateQueues.set(id, []);
            this.processUpdates(id, allUpdates);
            this.renderTimers.delete(id);
        }, this.config.updateThrottleTime);
        this.renderTimers.set(id, timer);
    }
    /**
     * 处理更新
     */
    processUpdates(id, updates) {
        if (updates.length === 0) {
            return;
        }
        const startTime = performance.now();
        // 处理更新逻辑
        this.emit('batchUpdate', { instanceId: id, updates, count: updates.length });
        const processingTime = performance.now() - startTime;
        // 更新性能指标
        const metrics = this.metrics.get(id);
        if (metrics) {
            metrics.renderTime = processingTime;
            metrics.updateFrequency = updates.length / (processingTime / 1000);
        }
    }
    /**
     * 处理滚动事件
     */
    handleScroll(id, scrollTop, isScrolling) {
        const instance = this.instances.get(id);
        if (!instance) {
            return;
        }
        instance.scrollTop = scrollTop;
        instance.isScrolling = isScrolling;
        if (this.config.enableSmartScrolling) {
            this.throttledScrollUpdate(id);
        }
        else {
            this.updateScrollMetrics(id);
        }
    }
    /**
     * 节流滚动更新
     */
    throttledScrollUpdate(id) {
        let timer = this.scrollTimers.get(id);
        if (timer) {
            return;
        } // 已有定时器在运行
        timer = setTimeout(() => {
            this.updateScrollMetrics(id);
            this.scrollTimers.delete(id);
        }, this.config.scrollThrottleTime);
        this.scrollTimers.set(id, timer);
    }
    /**
     * 更新滚动指标
     */
    updateScrollMetrics(id) {
        const instance = this.instances.get(id);
        const metrics = this.metrics.get(id);
        if (!instance || !metrics) {
            return;
        }
        // 计算滚动FPS
        const now = Date.now();
        const timeDiff = now - instance.lastUpdateTime;
        if (timeDiff > 0) {
            metrics.scrollFPS = Math.round(1000 / timeDiff);
        }
        this.emit('scrollUpdate', { instanceId: id, scrollTop: instance.scrollTop });
    }
    /**
     * 更新性能指标
     */
    updateMetrics(id) {
        const instance = this.instances.get(id);
        const metrics = this.metrics.get(id);
        if (!instance || !metrics) {
            return;
        }
        metrics.totalItems = instance.itemCount;
        metrics.visibleItems = instance.visibleRange.end - instance.visibleRange.start + 1;
        // 计算缓存命中率
        const cache = this.itemCaches.get(id);
        if (cache) {
            const totalAccess = Array.from(cache.values()).reduce((sum, item) => sum + item.accessCount, 0);
            metrics.cacheHitRate = cache.size > 0 ? totalAccess / cache.size : 0;
        }
        // 估算内存使用
        metrics.memoryUsage = this.estimateInstanceMemoryUsage(id);
    }
    /**
     * 估算实例内存使用
     */
    estimateInstanceMemoryUsage(id) {
        const cache = this.itemCaches.get(id);
        if (!cache) {
            return 0;
        }
        let totalSize = 0;
        for (const item of cache.values()) {
            // 估算对象大小（简化计算）
            totalSize += JSON.stringify(item.data).length * 2; // Unicode字符
            totalSize += 32; // 其他属性开销
        }
        return totalSize;
    }
    /**
     * 清理实例缓存
     */
    clearInstanceCache(id) {
        const cache = this.itemCaches.get(id);
        if (cache) {
            cache.clear();
        }
    }
    /**
     * 驱逐最旧的缓存项
     */
    evictOldestCacheItems(id, count) {
        const cache = this.itemCaches.get(id);
        if (!cache) {
            return;
        }
        // 按时间戳排序，移除最旧的项目
        const sortedEntries = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
        for (let i = 0; i < Math.min(count, sortedEntries.length); i++) {
            cache.delete(sortedEntries[i][0]);
        }
    }
    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        if (typeof PerformanceObserver === 'undefined') {
            return;
        }
        try {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name.includes('virtual-list')) {
                        // 处理虚拟列表相关的性能数据
                        this.emit('performanceEntry', entry);
                    }
                }
            });
            this.performanceObserver.observe({
                entryTypes: ['measure', 'navigation', 'paint']
            });
            this.isMonitoring = true;
        }
        catch (error) {
            console.warn('性能监控初始化失败:', error);
        }
    }
    /**
     * 开始内存优化
     */
    startMemoryOptimization() {
        if (!this.config.enableMemoryOptimization) {
            return;
        }
        setInterval(() => {
            this.optimizeMemoryUsage();
        }, this.memoryOptimizationInterval);
    }
    /**
     * 优化内存使用
     */
    optimizeMemoryUsage() {
        const now = Date.now();
        // 清理过期缓存
        for (const [id, cache] of this.itemCaches.entries()) {
            const expiredKeys = [];
            for (const [index, item] of cache.entries()) {
                if (now - item.timestamp > this.config.cacheExpirationTime) {
                    expiredKeys.push(index);
                }
            }
            expiredKeys.forEach(key => cache.delete(key));
            if (expiredKeys.length > 0) {
                console.log(`清理实例 ${id} 的 ${expiredKeys.length} 个过期缓存项`);
            }
        }
        // 强制垃圾回收（如果可用）
        this.memoryManager.optimize();
        ObjectPoolManager_1.objectPoolManager.optimize();
        this.lastMemoryOptimization = now;
        this.emit('memoryOptimized', {
            timestamp: now,
            totalInstances: this.instances.size,
            totalCacheItems: Array.from(this.itemCaches.values()).reduce((sum, cache) => sum + cache.size, 0)
        });
    }
    /**
     * 获取实例状态
     */
    getInstanceState(id) {
        return this.instances.get(id) || null;
    }
    /**
     * 获取性能指标
     */
    getMetrics(id) {
        if (id) {
            return this.metrics.get(id) || null;
        }
        return Array.from(this.metrics.values());
    }
    /**
     * 获取全局统计
     */
    getGlobalStats() {
        const totalInstances = this.instances.size;
        const totalItems = Array.from(this.instances.values()).reduce((sum, instance) => sum + instance.itemCount, 0);
        const totalCacheItems = Array.from(this.itemCaches.values()).reduce((sum, cache) => sum + cache.size, 0);
        const totalMemoryUsage = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.memoryUsage, 0);
        return {
            totalInstances,
            totalItems,
            totalCacheItems,
            totalMemoryUsage,
            averageCacheHitRate: totalInstances > 0
                ? Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.cacheHitRate, 0) / totalInstances
                : 0,
            isMonitoring: this.isMonitoring,
            lastMemoryOptimization: this.lastMemoryOptimization
        };
    }
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configUpdated', this.config);
    }
    /**
     * 销毁管理器
     */
    destroy() {
        // 清理所有实例
        for (const id of this.instances.keys()) {
            this.unregisterInstance(id);
        }
        // 停止性能监控
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }
        // 清理事件监听器
        this.removeAllListeners();
        VirtualizationManager.instance = null;
    }
}
exports.VirtualizationManager = VirtualizationManager;
// 导出单例实例
exports.virtualizationManager = VirtualizationManager.getInstance();
exports.default = VirtualizationManager;
//# sourceMappingURL=VirtualizationManager.js.map
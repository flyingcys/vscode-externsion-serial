"use strict";
/**
 * ObjectPoolManager - 对象池统一管理器
 * 管理各种频繁分配对象的对象池，减少GC压力和内存碎片化
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.releasePerformanceMetrics = exports.acquirePerformanceMetrics = exports.releaseCommunicationStats = exports.acquireCommunicationStats = exports.releaseProcessedFrame = exports.acquireProcessedFrame = exports.releaseRawFrame = exports.acquireRawFrame = exports.releaseGroups = exports.releaseGroup = exports.acquireGroup = exports.releaseDatasets = exports.releaseDataset = exports.acquireDataset = exports.releaseDataPoints = exports.releaseDataPoint = exports.acquireDataPoint = exports.objectPoolManager = exports.ObjectPoolManager = void 0;
const MemoryManager_1 = require("./MemoryManager");
/**
 * 默认池配置
 */
const DEFAULT_POOL_CONFIGS = {
    // 高频对象 - 大容量池
    dataPoints: {
        initialSize: 200,
        maxSize: 2000,
        growthFactor: 1.5,
        shrinkThreshold: 0.3
    },
    // 中频对象 - 中等容量池
    datasets: {
        initialSize: 50,
        maxSize: 500,
        growthFactor: 1.4,
        shrinkThreshold: 0.4
    },
    groups: {
        initialSize: 20,
        maxSize: 200,
        growthFactor: 1.3,
        shrinkThreshold: 0.4
    },
    rawFrames: {
        initialSize: 30,
        maxSize: 300,
        growthFactor: 1.4,
        shrinkThreshold: 0.3
    },
    // 低频对象 - 小容量池
    processedFrames: {
        initialSize: 10,
        maxSize: 100,
        growthFactor: 1.2,
        shrinkThreshold: 0.5
    },
    stats: {
        initialSize: 5,
        maxSize: 50,
        growthFactor: 1.2,
        shrinkThreshold: 0.5
    }
};
/**
 * 对象池管理器
 * 单例模式，统一管理所有对象池
 */
class ObjectPoolManager {
    static instance = null;
    memoryManager = (0, MemoryManager_1.getMemoryManager)();
    pools = new Map();
    initialized = false;
    constructor() { }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!ObjectPoolManager.instance) {
            ObjectPoolManager.instance = new ObjectPoolManager();
        }
        return ObjectPoolManager.instance;
    }
    /**
     * 初始化所有对象池
     */
    initialize() {
        if (this.initialized) {
            return;
        }
        console.log('初始化对象池管理器...');
        // 创建DataPoint对象池
        this.createPool('dataPoints', {
            ...DEFAULT_POOL_CONFIGS.dataPoints,
            itemConstructor: () => ({ x: 0, y: 0, timestamp: 0 }),
            itemDestructor: (item) => {
                item.x = 0;
                item.y = 0;
                item.timestamp = 0;
            }
        });
        // 创建Dataset对象池
        this.createPool('datasets', {
            ...DEFAULT_POOL_CONFIGS.datasets,
            itemConstructor: () => ({
                id: '',
                title: '',
                value: null,
                widget: 'plot',
                alarm: false,
                led: false,
                log: false,
                graph: false,
                fft: false
            }),
            itemDestructor: (item) => {
                item.id = '';
                item.title = '';
                item.value = null;
                item.unit = undefined;
                item.alarm = false;
                item.led = false;
                item.log = false;
                item.graph = false;
                item.fft = false;
                item.min = undefined;
                item.max = undefined;
                item.units = undefined;
            }
        });
        // 创建Group对象池
        this.createPool('groups', {
            ...DEFAULT_POOL_CONFIGS.groups,
            itemConstructor: () => ({
                id: '',
                title: '',
                widget: 'plot',
                datasets: []
            }),
            itemDestructor: (item) => {
                item.id = '';
                item.title = '';
                item.datasets = [];
            }
        });
        // 创建RawFrame对象池
        this.createPool('rawFrames', {
            ...DEFAULT_POOL_CONFIGS.rawFrames,
            itemConstructor: () => ({
                data: new Uint8Array(0),
                timestamp: 0,
                sequence: 0
            }),
            itemDestructor: (item) => {
                item.data = new Uint8Array(0);
                item.timestamp = 0;
                item.sequence = 0;
                item.checksumValid = undefined;
            }
        });
        // 创建ProcessedFrame对象池
        this.createPool('processedFrames', {
            ...DEFAULT_POOL_CONFIGS.processedFrames,
            itemConstructor: () => ({
                groups: [],
                timestamp: 0,
                sequence: 0,
                frameId: ''
            }),
            itemDestructor: (item) => {
                // 释放groups中的对象回池
                for (const group of item.groups) {
                    this.releaseGroup(group);
                }
                item.groups = [];
                item.timestamp = 0;
                item.sequence = 0;
                item.frameId = '';
            }
        });
        // 创建统计对象池
        this.createPool('communicationStats', {
            ...DEFAULT_POOL_CONFIGS.stats,
            itemConstructor: () => ({
                bytesReceived: 0,
                bytesSent: 0,
                framesReceived: 0,
                framesSent: 0,
                errors: 0,
                reconnections: 0,
                uptime: 0
            }),
            itemDestructor: (item) => {
                item.bytesReceived = 0;
                item.bytesSent = 0;
                item.framesReceived = 0;
                item.framesSent = 0;
                item.errors = 0;
                item.reconnections = 0;
                item.uptime = 0;
            }
        });
        this.createPool('performanceMetrics', {
            ...DEFAULT_POOL_CONFIGS.stats,
            itemConstructor: () => ({
                updateFrequency: 0,
                processingLatency: 0,
                memoryUsage: 0,
                droppedFrames: 0
            }),
            itemDestructor: (item) => {
                item.updateFrequency = 0;
                item.processingLatency = 0;
                item.memoryUsage = 0;
                item.droppedFrames = 0;
                item.cpuUsage = undefined;
            }
        });
        this.initialized = true;
        console.log('对象池管理器初始化完成，创建了', this.pools.size, '个对象池');
    }
    /**
     * 创建对象池
     */
    createPool(name, config) {
        const pool = this.memoryManager.createObjectPool(name, config);
        this.pools.set(name, pool);
        return pool;
    }
    /**
     * 获取对象池
     */
    getPool(name) {
        const pool = this.pools.get(name);
        if (!pool) {
            console.warn(`对象池 '${name}' 不存在`);
            return null;
        }
        return pool;
    }
    // === DataPoint对象池操作 ===
    /**
     * 获取DataPoint对象
     */
    acquireDataPoint() {
        const pool = this.getPool('dataPoints');
        return pool ? pool.acquire() : { x: 0, y: 0, timestamp: 0 };
    }
    /**
     * 释放DataPoint对象
     */
    releaseDataPoint(dataPoint) {
        const pool = this.getPool('dataPoints');
        if (pool) {
            pool.release(dataPoint);
        }
    }
    /**
     * 批量释放DataPoint对象
     */
    releaseDataPoints(dataPoints) {
        for (const point of dataPoints) {
            this.releaseDataPoint(point);
        }
    }
    // === Dataset对象池操作 ===
    /**
     * 获取Dataset对象
     */
    acquireDataset() {
        const pool = this.getPool('datasets');
        return pool ? pool.acquire() : {
            id: '',
            title: '',
            value: null,
            widget: 'plot',
            alarm: false,
            led: false,
            log: false,
            graph: false,
            fft: false
        };
    }
    /**
     * 释放Dataset对象
     */
    releaseDataset(dataset) {
        const pool = this.getPool('datasets');
        if (pool) {
            pool.release(dataset);
        }
    }
    /**
     * 批量释放Dataset对象
     */
    releaseDatasets(datasets) {
        for (const dataset of datasets) {
            this.releaseDataset(dataset);
        }
    }
    // === Group对象池操作 ===
    /**
     * 获取Group对象
     */
    acquireGroup() {
        const pool = this.getPool('groups');
        return pool ? pool.acquire() : {
            id: '',
            title: '',
            widget: 'plot',
            datasets: []
        };
    }
    /**
     * 释放Group对象
     */
    releaseGroup(group) {
        // 先释放datasets
        this.releaseDatasets(group.datasets);
        group.datasets = [];
        const pool = this.getPool('groups');
        if (pool) {
            pool.release(group);
        }
    }
    /**
     * 批量释放Group对象
     */
    releaseGroups(groups) {
        for (const group of groups) {
            this.releaseGroup(group);
        }
    }
    // === RawFrame对象池操作 ===
    /**
     * 获取RawFrame对象
     */
    acquireRawFrame() {
        const pool = this.getPool('rawFrames');
        return pool ? pool.acquire() : {
            data: new Uint8Array(0),
            timestamp: 0,
            sequence: 0
        };
    }
    /**
     * 释放RawFrame对象
     */
    releaseRawFrame(frame) {
        const pool = this.getPool('rawFrames');
        if (pool) {
            pool.release(frame);
        }
    }
    // === ProcessedFrame对象池操作 ===
    /**
     * 获取ProcessedFrame对象
     */
    acquireProcessedFrame() {
        const pool = this.getPool('processedFrames');
        return pool ? pool.acquire() : {
            groups: [],
            timestamp: 0,
            sequence: 0,
            frameId: ''
        };
    }
    /**
     * 释放ProcessedFrame对象
     */
    releaseProcessedFrame(frame) {
        const pool = this.getPool('processedFrames');
        if (pool) {
            pool.release(frame);
        }
    }
    // === 统计对象池操作 ===
    /**
     * 获取CommunicationStats对象
     */
    acquireCommunicationStats() {
        const pool = this.getPool('communicationStats');
        return pool ? pool.acquire() : {
            bytesReceived: 0,
            bytesSent: 0,
            framesReceived: 0,
            framesSent: 0,
            framesProcessed: 0,
            errors: 0,
            reconnections: 0,
            uptime: 0,
            memoryUsage: 0
        };
    }
    /**
     * 释放CommunicationStats对象
     */
    releaseCommunicationStats(stats) {
        const pool = this.getPool('communicationStats');
        if (pool) {
            pool.release(stats);
        }
    }
    /**
     * 获取PerformanceMetrics对象
     */
    acquirePerformanceMetrics() {
        const pool = this.getPool('performanceMetrics');
        return pool ? pool.acquire() : {
            updateFrequency: 0,
            processingLatency: 0,
            memoryUsage: 0,
            droppedFrames: 0
        };
    }
    /**
     * 释放PerformanceMetrics对象
     */
    releasePerformanceMetrics(metrics) {
        const pool = this.getPool('performanceMetrics');
        if (pool) {
            pool.release(metrics);
        }
    }
    // === 管理操作 ===
    /**
     * 获取所有池的统计信息
     */
    getAllPoolStats() {
        const stats = {};
        for (const [name, pool] of this.pools.entries()) {
            stats[name] = pool.getStats();
        }
        return stats;
    }
    /**
     * 获取内存使用情况
     */
    getMemoryUsage() {
        const poolStats = this.getAllPoolStats();
        let totalObjects = 0;
        let totalMemory = 0;
        for (const stats of Object.values(poolStats)) {
            totalObjects += stats.size;
            // 估算内存使用 (每个对象约100字节)
            totalMemory += stats.size * 100;
        }
        return {
            totalPools: this.pools.size,
            totalObjects,
            totalMemory,
            poolDetails: poolStats
        };
    }
    /**
     * 优化所有对象池
     */
    optimize() {
        console.log('优化对象池...');
        // 获取统计信息进行分析
        const stats = this.getAllPoolStats();
        for (const [poolName, poolStats] of Object.entries(stats)) {
            // 如果命中率低于50%，建议减少初始大小
            if (poolStats.hitRate < 0.5) {
                console.warn(`池 '${poolName}' 命中率低: ${(poolStats.hitRate * 100).toFixed(1)}%`);
            }
            // 如果空闲对象过多，触发收缩
            if (poolStats.free > poolStats.used * 2 && poolStats.used > 0) {
                console.info(`池 '${poolName}' 空闲对象过多，建议收缩`);
            }
        }
    }
    /**
     * 清理所有对象池
     */
    clear() {
        console.log('清理所有对象池...');
        for (const pool of this.pools.values()) {
            pool.clear();
        }
    }
    /**
     * 销毁对象池管理器
     */
    destroy() {
        this.clear();
        this.pools.clear();
        this.initialized = false;
        ObjectPoolManager.instance = null;
    }
}
exports.ObjectPoolManager = ObjectPoolManager;
// 导出单例实例
exports.objectPoolManager = ObjectPoolManager.getInstance();
// 便捷函数导出
exports.acquireDataPoint = exports.objectPoolManager.acquireDataPoint, exports.releaseDataPoint = exports.objectPoolManager.releaseDataPoint, exports.releaseDataPoints = exports.objectPoolManager.releaseDataPoints, exports.acquireDataset = exports.objectPoolManager.acquireDataset, exports.releaseDataset = exports.objectPoolManager.releaseDataset, exports.releaseDatasets = exports.objectPoolManager.releaseDatasets, exports.acquireGroup = exports.objectPoolManager.acquireGroup, exports.releaseGroup = exports.objectPoolManager.releaseGroup, exports.releaseGroups = exports.objectPoolManager.releaseGroups, exports.acquireRawFrame = exports.objectPoolManager.acquireRawFrame, exports.releaseRawFrame = exports.objectPoolManager.releaseRawFrame, exports.acquireProcessedFrame = exports.objectPoolManager.acquireProcessedFrame, exports.releaseProcessedFrame = exports.objectPoolManager.releaseProcessedFrame, exports.acquireCommunicationStats = exports.objectPoolManager.acquireCommunicationStats, exports.releaseCommunicationStats = exports.objectPoolManager.releaseCommunicationStats, exports.acquirePerformanceMetrics = exports.objectPoolManager.acquirePerformanceMetrics, exports.releasePerformanceMetrics = exports.objectPoolManager.releasePerformanceMetrics;
exports.default = ObjectPoolManager;
//# sourceMappingURL=ObjectPoolManager.js.map
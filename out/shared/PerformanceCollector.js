"use strict";
/**
 * PerformanceCollector - 性能指标采集器
 * 实时收集和计算各种性能指标，为仪表板提供数据源
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceCollector = exports.PerformanceCollector = void 0;
const events_1 = require("events");
const perf_hooks_1 = require("perf_hooks");
/**
 * CPU 使用率计算器
 */
class CPUUsageCalculator {
    lastCpuInfo = null;
    lastSampleTime = 0;
    /**
     * 获取CPU使用率
     */
    async getCPUUsage() {
        try {
            // 在Node.js环境中获取CPU信息
            if (typeof process !== 'undefined' && process.cpuUsage) {
                const currentTime = Date.now();
                const currentCpuUsage = process.cpuUsage();
                if (this.lastCpuInfo && this.lastSampleTime > 0) {
                    const timeDiff = currentTime - this.lastSampleTime;
                    const userDiff = currentCpuUsage.user - this.lastCpuInfo.user;
                    const systemDiff = currentCpuUsage.system - this.lastCpuInfo.system;
                    // 计算CPU使用率百分比
                    const totalDiff = userDiff + systemDiff;
                    const usage = (totalDiff / (timeDiff * 1000)) * 100; // 转换为百分比
                    this.lastCpuInfo = currentCpuUsage;
                    this.lastSampleTime = currentTime;
                    return Math.min(100, Math.max(0, usage));
                }
                this.lastCpuInfo = currentCpuUsage;
                this.lastSampleTime = currentTime;
                return 0;
            }
            // 浏览器环境的简化实现
            return this.estimateCPUUsage();
        }
        catch (error) {
            console.warn('获取CPU使用率失败:', error);
            return 0;
        }
    }
    /**
     * 估算CPU使用率（浏览器环境）
     */
    estimateCPUUsage() {
        // 基于JavaScript执行时间来估算CPU使用率
        const start = perf_hooks_1.performance.now();
        // 执行一些计算密集型操作来测量性能
        let result = 0;
        for (let i = 0; i < 100000; i++) {
            result += Math.random();
        }
        const executionTime = perf_hooks_1.performance.now() - start;
        // 基于执行时间估算CPU使用率
        // 这是一个简化的估算，实际情况会更复杂
        const estimatedUsage = Math.min(100, executionTime * 2);
        return estimatedUsage;
    }
}
/**
 * 网络指标收集器
 */
class NetworkMetricsCollector {
    lastTimestamp = 0;
    lastBytesReceived = 0;
    lastBytesSent = 0;
    bytesReceived = 0;
    bytesSent = 0;
    packetsReceived = 0;
    packetsSent = 0;
    /**
     * 记录网络数据
     */
    recordNetworkData(bytesReceived, bytesSent = 0) {
        this.bytesReceived += bytesReceived;
        this.bytesSent += bytesSent;
        if (bytesReceived > 0) {
            this.packetsReceived++;
        }
        if (bytesSent > 0) {
            this.packetsSent++;
        }
    }
    /**
     * 获取网络指标
     */
    getNetworkMetrics() {
        const now = Date.now();
        const timeDiff = now - this.lastTimestamp;
        let throughput = 0;
        if (timeDiff > 0 && this.lastTimestamp > 0) {
            const totalBytes = (this.bytesReceived - this.lastBytesReceived) +
                (this.bytesSent - this.lastBytesSent);
            throughput = (totalBytes * 1000) / timeDiff; // bytes/s
        }
        this.lastTimestamp = now;
        this.lastBytesReceived = this.bytesReceived;
        this.lastBytesSent = this.bytesSent;
        return {
            bytesReceived: this.bytesReceived,
            bytesSent: this.bytesSent,
            packetsReceived: this.packetsReceived,
            packetsSent: this.packetsSent,
            throughput
        };
    }
    /**
     * 重置网络指标
     */
    reset() {
        this.bytesReceived = 0;
        this.bytesSent = 0;
        this.packetsReceived = 0;
        this.packetsSent = 0;
        this.lastBytesReceived = 0;
        this.lastBytesSent = 0;
        this.lastTimestamp = 0;
    }
}
/**
 * 性能指标采集器主类
 */
class PerformanceCollector extends events_1.EventEmitter {
    static instance = null;
    config;
    isCollecting = false;
    systemTimer = null;
    applicationTimer = null;
    // 数据存储
    snapshots = [];
    customMetrics = new Map();
    // 子采集器
    cpuCalculator = new CPUUsageCalculator();
    networkCollector = new NetworkMetricsCollector();
    // 应用指标计数器
    renderingMetrics = {
        fps: 0,
        frameTime: 0,
        droppedFrames: 0,
        renderCalls: 0,
        lastFrameTime: 0,
        frameCount: 0,
        lastFpsCalcTime: 0
    };
    dataProcessingMetrics = {
        throughput: 0,
        latency: 0,
        queueSize: 0,
        errorRate: 0,
        processedItems: 0,
        totalErrors: 0,
        lastThroughputCalcTime: 0
    };
    constructor() {
        super();
        // 默认配置
        this.config = {
            systemMetricsInterval: 2000,
            applicationMetricsInterval: 1000,
            historySize: 100,
            enableSystemMetrics: true,
            enableApplicationMetrics: true,
            cpuSampleInterval: 1000,
            memoryOptimizationThreshold: 500 // 500MB
        };
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!PerformanceCollector.instance) {
            PerformanceCollector.instance = new PerformanceCollector();
        }
        return PerformanceCollector.instance;
    }
    /**
     * 开始采集性能指标
     */
    startCollection(config) {
        if (this.isCollecting) {
            console.warn('性能采集器已在运行');
            return;
        }
        if (config) {
            this.config = { ...this.config, ...config };
        }
        this.isCollecting = true;
        // 启动系统指标采集
        if (this.config.enableSystemMetrics) {
            this.systemTimer = setInterval(() => {
                this.collectSystemMetrics();
            }, this.config.systemMetricsInterval);
        }
        // 启动应用指标采集
        if (this.config.enableApplicationMetrics) {
            this.applicationTimer = setInterval(() => {
                this.collectApplicationMetrics();
            }, this.config.applicationMetricsInterval);
        }
        console.log('性能指标采集器已启动', this.config);
        this.emit('collectionStarted');
    }
    /**
     * 停止采集性能指标
     */
    stopCollection() {
        if (!this.isCollecting) {
            return;
        }
        this.isCollecting = false;
        if (this.systemTimer) {
            clearInterval(this.systemTimer);
            this.systemTimer = null;
        }
        if (this.applicationTimer) {
            clearInterval(this.applicationTimer);
            this.applicationTimer = null;
        }
        console.log('性能指标采集器已停止');
        this.emit('collectionStopped');
    }
    /**
     * 采集系统性能指标
     */
    async collectSystemMetrics() {
        try {
            const systemMetrics = {
                cpu: {
                    usage: await this.cpuCalculator.getCPUUsage(),
                    loadAverage: this.getLoadAverage(),
                    processUsage: 0 // TODO: 实现进程CPU使用率
                },
                memory: this.getMemoryMetrics(),
                network: this.networkCollector.getNetworkMetrics(),
                disk: {
                    readBytes: 0,
                    writeBytes: 0,
                    readOps: 0,
                    writeOps: 0
                }
            };
            this.emit('systemMetrics', systemMetrics);
        }
        catch (error) {
            console.error('采集系统指标失败:', error);
        }
    }
    /**
     * 采集应用性能指标
     */
    collectApplicationMetrics() {
        try {
            const applicationMetrics = {
                rendering: this.getRenderingMetrics(),
                dataProcessing: this.getDataProcessingMetrics(),
                objectPool: this.getObjectPoolMetrics(),
                virtualization: this.getVirtualizationMetrics()
            };
            this.emit('applicationMetrics', applicationMetrics);
        }
        catch (error) {
            console.error('采集应用指标失败:', error);
        }
    }
    /**
     * 获取系统负载
     */
    getLoadAverage() {
        try {
            if (typeof process !== 'undefined' && process.loadavg) {
                return process.loadavg();
            }
            return [0, 0, 0];
        }
        catch (error) {
            return [0, 0, 0];
        }
    }
    /**
     * 获取内存指标
     */
    getMemoryMetrics() {
        let nodeMemory = null;
        let browserMemory = null;
        // Node.js环境
        if (typeof process !== 'undefined' && process.memoryUsage) {
            nodeMemory = process.memoryUsage();
        }
        // 浏览器环境
        if (typeof perf_hooks_1.performance !== 'undefined' && 'memory' in perf_hooks_1.performance) {
            browserMemory = perf_hooks_1.performance.memory;
        }
        return {
            total: 0,
            used: nodeMemory ? nodeMemory.heapUsed / (1024 * 1024) :
                browserMemory ? browserMemory.usedJSHeapSize / (1024 * 1024) : 0,
            free: 0,
            heap: {
                total: nodeMemory ? nodeMemory.heapTotal / (1024 * 1024) :
                    browserMemory ? browserMemory.totalJSHeapSize / (1024 * 1024) : 0,
                used: nodeMemory ? nodeMemory.heapUsed / (1024 * 1024) :
                    browserMemory ? browserMemory.usedJSHeapSize / (1024 * 1024) : 0,
                limit: browserMemory ? browserMemory.jsHeapSizeLimit / (1024 * 1024) : 0
            },
            external: nodeMemory ? nodeMemory.external / (1024 * 1024) : 0,
            rss: nodeMemory ? nodeMemory.rss / (1024 * 1024) : 0
        };
    }
    /**
     * 获取渲染性能指标
     */
    getRenderingMetrics() {
        const now = Date.now();
        // 计算FPS
        if (now - this.renderingMetrics.lastFpsCalcTime >= 1000) {
            this.renderingMetrics.fps = this.renderingMetrics.frameCount;
            this.renderingMetrics.frameCount = 0;
            this.renderingMetrics.lastFpsCalcTime = now;
        }
        return {
            fps: this.renderingMetrics.fps,
            frameTime: this.renderingMetrics.frameTime,
            droppedFrames: this.renderingMetrics.droppedFrames,
            renderCalls: this.renderingMetrics.renderCalls
        };
    }
    /**
     * 获取数据处理性能指标
     */
    getDataProcessingMetrics() {
        const now = Date.now();
        // 计算吞吐量
        if (now - this.dataProcessingMetrics.lastThroughputCalcTime >= 1000) {
            this.dataProcessingMetrics.throughput = this.dataProcessingMetrics.processedItems;
            this.dataProcessingMetrics.processedItems = 0;
            this.dataProcessingMetrics.lastThroughputCalcTime = now;
        }
        // 计算错误率
        const totalOperations = this.dataProcessingMetrics.processedItems + this.dataProcessingMetrics.totalErrors;
        const errorRate = totalOperations > 0 ? (this.dataProcessingMetrics.totalErrors / totalOperations) * 100 : 0;
        return {
            throughput: this.dataProcessingMetrics.throughput,
            latency: this.dataProcessingMetrics.latency,
            queueSize: this.dataProcessingMetrics.queueSize,
            errorRate
        };
    }
    /**
     * 获取对象池指标
     */
    getObjectPoolMetrics() {
        // TODO: 与ObjectPoolManager集成
        return {
            totalObjects: 0,
            activeObjects: 0,
            hitRate: 0,
            allocations: 0,
            deallocations: 0
        };
    }
    /**
     * 获取虚拟化指标
     */
    getVirtualizationMetrics() {
        // TODO: 与VirtualizationManager集成
        return {
            totalItems: 0,
            visibleItems: 0,
            cacheHitRate: 0,
            scrollFPS: 0
        };
    }
    /**
     * 记录渲染帧
     */
    recordFrame(frameTime) {
        const now = perf_hooks_1.performance.now();
        this.renderingMetrics.frameCount++;
        this.renderingMetrics.renderCalls++;
        if (frameTime !== undefined) {
            this.renderingMetrics.frameTime = frameTime;
        }
        else if (this.renderingMetrics.lastFrameTime > 0) {
            this.renderingMetrics.frameTime = now - this.renderingMetrics.lastFrameTime;
        }
        // 检查丢帧（超过33ms认为丢帧）
        if (this.renderingMetrics.frameTime > 33) {
            this.renderingMetrics.droppedFrames++;
        }
        this.renderingMetrics.lastFrameTime = now;
    }
    /**
     * 记录数据处理
     */
    recordDataProcessing(latency, queueSize) {
        this.dataProcessingMetrics.processedItems++;
        if (latency !== undefined) {
            this.dataProcessingMetrics.latency = latency;
        }
        if (queueSize !== undefined) {
            this.dataProcessingMetrics.queueSize = queueSize;
        }
    }
    /**
     * 记录处理错误
     */
    recordProcessingError() {
        this.dataProcessingMetrics.totalErrors++;
    }
    /**
     * 记录网络数据
     */
    recordNetworkData(bytesReceived, bytesSent) {
        this.networkCollector.recordNetworkData(bytesReceived, bytesSent);
    }
    /**
     * 设置自定义指标
     */
    setCustomMetric(name, value) {
        this.customMetrics.set(name, value);
    }
    /**
     * 获取自定义指标
     */
    getCustomMetric(name) {
        return this.customMetrics.get(name);
    }
    /**
     * 获取当前性能快照
     */
    getCurrentSnapshot() {
        return {
            timestamp: Date.now(),
            system: {
                cpu: {
                    usage: 0,
                    loadAverage: this.getLoadAverage(),
                    processUsage: 0
                },
                memory: this.getMemoryMetrics(),
                network: this.networkCollector.getNetworkMetrics(),
                disk: {
                    readBytes: 0,
                    writeBytes: 0,
                    readOps: 0,
                    writeOps: 0
                }
            },
            application: {
                rendering: this.getRenderingMetrics(),
                dataProcessing: this.getDataProcessingMetrics(),
                objectPool: this.getObjectPoolMetrics(),
                virtualization: this.getVirtualizationMetrics()
            },
            custom: Object.fromEntries(this.customMetrics)
        };
    }
    /**
     * 获取历史快照
     */
    getHistorySnapshots(count) {
        if (count) {
            return this.snapshots.slice(-count);
        }
        return [...this.snapshots];
    }
    /**
     * 清除历史数据
     */
    clearHistory() {
        this.snapshots = [];
        this.customMetrics.clear();
        this.networkCollector.reset();
        // 重置计数器
        this.renderingMetrics = {
            fps: 0,
            frameTime: 0,
            droppedFrames: 0,
            renderCalls: 0,
            lastFrameTime: 0,
            frameCount: 0,
            lastFpsCalcTime: 0
        };
        this.dataProcessingMetrics = {
            throughput: 0,
            latency: 0,
            queueSize: 0,
            errorRate: 0,
            processedItems: 0,
            totalErrors: 0,
            lastThroughputCalcTime: 0
        };
    }
    /**
     * 更新配置
     */
    updateConfig(config) {
        const wasCollecting = this.isCollecting;
        if (wasCollecting) {
            this.stopCollection();
        }
        this.config = { ...this.config, ...config };
        if (wasCollecting) {
            this.startCollection();
        }
    }
    /**
     * 获取配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 销毁采集器
     */
    destroy() {
        this.stopCollection();
        this.clearHistory();
        this.removeAllListeners();
        PerformanceCollector.instance = null;
    }
}
exports.PerformanceCollector = PerformanceCollector;
// 导出单例实例
exports.performanceCollector = PerformanceCollector.getInstance();
exports.default = PerformanceCollector;
//# sourceMappingURL=PerformanceCollector.js.map
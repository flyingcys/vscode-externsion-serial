"use strict";
/**
 * Data Store for Serial Studio VSCode Extension
 * 基于Serial Studio的数据管理架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDataStore = void 0;
const pinia_1 = require("pinia");
const vue_1 = require("vue");
const MemoryManager_1 = require("../../shared/MemoryManager");
const DataCache_1 = require("../../shared/DataCache");
const ObjectPoolManager_1 = require("../../shared/ObjectPoolManager");
exports.useDataStore = (0, pinia_1.defineStore)('data', () => {
    // === 内存管理和缓存系统 ===
    const memoryManager = (0, MemoryManager_1.getMemoryManager)();
    const frameCache = new DataCache_1.DataCache({
        maxSize: 1000,
        maxMemory: 50 * 1024 * 1024,
        defaultTTL: 10 * 60 * 1000,
        enableLRU: true,
        enableStats: true
    });
    // 初始化对象池管理器
    ObjectPoolManager_1.objectPoolManager.initialize();
    // === 状态 ===
    const state = (0, vue_1.reactive)({
        currentFrame: null,
        frames: [],
        widgets: new Map(),
        isPaused: false,
        isRecording: false,
        maxFrameHistory: 1000,
        totalFramesReceived: 0,
        totalBytesReceived: 0,
        lastFrameTime: 0,
        dataBuffer: new Map(),
        bufferSize: 10000
    });
    const performanceMetrics = (0, vue_1.reactive)({
        updateFrequency: 0,
        processingLatency: 0,
        memoryUsage: 0,
        droppedFrames: 0,
        cpuUsage: 0
    });
    // === 计算属性 ===
    const isConnected = (0, vue_1.computed)(() => state.currentFrame !== null);
    const activeWidgets = (0, vue_1.computed)(() => Array.from(state.widgets.values()).filter(widget => widget.isActive));
    const totalDataPoints = (0, vue_1.computed)(() => {
        let total = 0;
        for (const buffer of state.dataBuffer.values()) {
            total += buffer.totalPoints;
        }
        return total;
    });
    const averageUpdateRate = (0, vue_1.computed)(() => {
        if (state.frames.length < 2) {
            return 0;
        }
        const recentFrames = state.frames.slice(-10);
        if (recentFrames.length < 2) {
            return 0;
        }
        const timeSpan = recentFrames[recentFrames.length - 1].timestamp - recentFrames[0].timestamp;
        return Math.round((recentFrames.length - 1) * 1000 / timeSpan);
    });
    const memoryUsage = (0, vue_1.computed)(() => {
        // 估算内存使用情况（MB）
        const frameSize = state.frames.length * 1024; // 假设每帧1KB
        const widgetSize = state.widgets.size * 512; // 假设每个widget 512B
        const bufferSize = totalDataPoints.value * 32; // 假设每个数据点32B
        return Math.round((frameSize + widgetSize + bufferSize) / (1024 * 1024));
    });
    // === 辅助函数 ===
    /**
     * 创建优化的数据缓冲区
     * @param capacity 缓冲区容量
     * @returns 优化的数据缓冲区
     */
    const createOptimizedBuffer = (capacity = 10000) => {
        return {
            buffer: new Float32Array(capacity),
            timestamps: new Float64Array(capacity),
            size: 0,
            head: 0,
            tail: 0,
            capacity,
            isFull: false,
            totalPoints: 0
        };
    };
    /**
     * 向优化缓冲区添加数据点
     * @param buffer 优化缓冲区
     * @param point 数据点
     */
    const addToOptimizedBuffer = (buffer, point) => {
        // 将数据点添加到缓冲区
        buffer.buffer[buffer.tail] = point.y;
        buffer.timestamps[buffer.tail] = point.timestamp;
        // 更新指针
        buffer.tail = (buffer.tail + 1) % buffer.capacity;
        buffer.totalPoints++;
        // 检查是否已满
        if (buffer.tail === buffer.head) {
            buffer.isFull = true;
            // 如果已满，移动头指针（覆盖最旧的数据）
            buffer.head = (buffer.head + 1) % buffer.capacity;
        }
        else if (!buffer.isFull) {
            buffer.size++;
        }
    };
    /**
     * 从优化缓冲区获取数据点数组
     * @param buffer 优化缓冲区
     * @param maxPoints 最大点数
     * @returns 数据点数组
     */
    const getFromOptimizedBuffer = (buffer, maxPoints) => {
        const result = [];
        const actualSize = buffer.isFull ? buffer.capacity : buffer.size;
        const pointsToGet = maxPoints ? Math.min(maxPoints, actualSize) : actualSize;
        if (pointsToGet === 0) {
            return result;
        }
        // 计算起始位置
        let startIndex;
        if (maxPoints && pointsToGet < actualSize) {
            // 如果只需要最新的几个点，从尾部开始计算
            startIndex = buffer.isFull
                ? (buffer.tail - pointsToGet + buffer.capacity) % buffer.capacity
                : Math.max(0, buffer.tail - pointsToGet);
        }
        else {
            startIndex = buffer.head;
        }
        // 提取数据点，重用对象池中的对象
        for (let i = 0; i < pointsToGet; i++) {
            const index = (startIndex + i) % buffer.capacity;
            const dataPoint = ObjectPoolManager_1.objectPoolManager.acquireDataPoint();
            dataPoint.x = buffer.timestamps[index];
            dataPoint.y = buffer.buffer[index];
            dataPoint.timestamp = buffer.timestamps[index];
            result.push(dataPoint);
        }
        return result;
    };
    /**
     * 释放数据点数组中的对象回对象池
     * @param dataPoints 数据点数组
     */
    const releaseDataPoints = (dataPoints) => {
        ObjectPoolManager_1.objectPoolManager.releaseDataPoints(dataPoints);
    };
    /**
     * 清空优化缓冲区
     * @param buffer 优化缓冲区
     */
    const clearOptimizedBuffer = (buffer) => {
        buffer.size = 0;
        buffer.head = 0;
        buffer.tail = 0;
        buffer.isFull = false;
        buffer.totalPoints = 0;
        // 不需要清零TypedArray，因为会被覆盖
    };
    // === 动作 ===
    /**
     * 初始化数据存储
     */
    const initialize = () => {
        console.log('数据存储已初始化');
        // 定期清理过期数据
        setInterval(cleanupExpiredData, 30000); // 每30秒清理一次
        // 定期更新性能指标
        setInterval(updatePerformanceMetrics, 1000); // 每秒更新一次
    };
    /**
     * 处理新的数据帧
     * @param frame 处理过的数据帧
     */
    const processFrame = (frame) => {
        if (state.isPaused) {
            performanceMetrics.droppedFrames++;
            return;
        }
        const startTime = Date.now();
        try {
            // 更新当前帧
            state.currentFrame = frame;
            state.totalFramesReceived++;
            state.lastFrameTime = frame.timestamp;
            // 添加到历史记录
            state.frames.push(frame);
            // 限制历史记录大小
            if (state.frames.length > state.maxFrameHistory) {
                state.frames.shift();
            }
            // 处理每个组的数据
            for (const group of frame.groups) {
                processGroup(group, frame.timestamp);
            }
            // 更新性能指标
            performanceMetrics.processingLatency = Date.now() - startTime;
        }
        catch (error) {
            console.error('处理数据帧时出错:', error);
        }
    };
    /**
     * 处理数据组
     * @param group 数据组
     * @param timestamp 时间戳
     */
    const processGroup = (group, timestamp) => {
        // 更新或创建widget
        let widget = state.widgets.get(group.id);
        if (!widget) {
            widget = {
                id: group.id,
                type: group.widget,
                title: group.title,
                datasets: [],
                dataPoints: [],
                lastUpdate: timestamp,
                isActive: true
            };
            state.widgets.set(group.id, widget);
        }
        // 更新datasets
        widget.datasets = [...group.datasets];
        widget.lastUpdate = timestamp;
        // 处理每个dataset的数据点
        for (const dataset of group.datasets) {
            addDataPoint(dataset.id, {
                x: timestamp,
                y: parseFloat(String(dataset.value)) || 0,
                timestamp
            });
        }
    };
    /**
     * 添加数据点到缓冲区
     * @param datasetId 数据集ID
     * @param point 数据点
     */
    const addDataPoint = (datasetId, point) => {
        let buffer = state.dataBuffer.get(datasetId);
        if (!buffer) {
            buffer = createOptimizedBuffer(state.bufferSize);
            state.dataBuffer.set(datasetId, buffer);
        }
        addToOptimizedBuffer(buffer, point);
    };
    /**
     * 获取数据集的数据点
     * @param datasetId 数据集ID
     * @param maxPoints 最大点数
     * @returns 数据点数组
     */
    const getDataPoints = (datasetId, maxPoints) => {
        const buffer = state.dataBuffer.get(datasetId);
        if (!buffer) {
            return [];
        }
        return getFromOptimizedBuffer(buffer, maxPoints);
    };
    /**
     * 获取最新的数据点
     * @param datasetId 数据集ID
     * @param count 数量
     */
    const getLatestDataPoints = (datasetId, count = 100) => {
        const buffer = state.dataBuffer.get(datasetId);
        if (!buffer) {
            return [];
        }
        return getFromOptimizedBuffer(buffer, count);
    };
    /**
     * 获取时间范围内的数据点
     * @param datasetId 数据集ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     */
    const getDataPointsInRange = (datasetId, startTime, endTime) => {
        const buffer = state.dataBuffer.get(datasetId);
        if (!buffer) {
            return [];
        }
        const allPoints = getFromOptimizedBuffer(buffer);
        const filteredPoints = allPoints.filter(point => point.timestamp >= startTime && point.timestamp <= endTime);
        // 释放不需要的数据点回对象池
        const pointsToRelease = allPoints.filter(point => point.timestamp < startTime || point.timestamp > endTime);
        releaseDataPoints(pointsToRelease);
        return filteredPoints;
    };
    /**
     * 暂停/恢复数据处理
     */
    const togglePause = () => {
        state.isPaused = !state.isPaused;
    };
    /**
     * 开始/停止录制
     */
    const toggleRecording = () => {
        state.isRecording = !state.isRecording;
    };
    /**
     * 清除所有数据
     */
    const clearAllData = () => {
        state.currentFrame = null;
        state.frames = [];
        state.widgets.clear();
        state.dataBuffer.clear();
        state.totalFramesReceived = 0;
        state.totalBytesReceived = 0;
        state.lastFrameTime = 0;
        performanceMetrics.droppedFrames = 0;
    };
    /**
     * 清除特定数据集的数据
     * @param datasetId 数据集ID
     */
    const clearDataset = (datasetId) => {
        const buffer = state.dataBuffer.get(datasetId);
        if (buffer) {
            clearOptimizedBuffer(buffer);
        }
    };
    /**
     * 清理过期数据
     */
    const cleanupExpiredData = () => {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时
        // 清理过期的帧
        state.frames = state.frames.filter(frame => now - frame.timestamp < maxAge);
        // 清理缓存中的过期帧
        frameCache.cleanup();
        // 清理过期的数据点（对于优化缓冲区，我们创建新的缓冲区并只保留有效数据）
        for (const [datasetId, buffer] of state.dataBuffer.entries()) {
            const allPoints = getFromOptimizedBuffer(buffer);
            const validPoints = allPoints.filter(point => now - point.timestamp < maxAge);
            if (validPoints.length === 0) {
                state.dataBuffer.delete(datasetId);
            }
            else if (validPoints.length < allPoints.length) {
                // 重新创建缓冲区并添加有效数据
                const newBuffer = createOptimizedBuffer(buffer.capacity);
                for (const point of validPoints) {
                    addToOptimizedBuffer(newBuffer, point);
                }
                state.dataBuffer.set(datasetId, newBuffer);
            }
            // 释放所有临时数据点回对象池
            releaseDataPoints(allPoints);
        }
        // 清理非活跃的widgets
        for (const [widgetId, widget] of state.widgets.entries()) {
            if (now - widget.lastUpdate > maxAge) {
                state.widgets.delete(widgetId);
            }
        }
        // 进行内存优化
        memoryManager.optimize();
    };
    /**
     * 更新性能指标
     */
    const updatePerformanceMetrics = () => {
        performanceMetrics.updateFrequency = averageUpdateRate.value;
        performanceMetrics.memoryUsage = memoryUsage.value;
    };
    /**
     * 激活/停用widget
     * @param widgetId Widget ID
     * @param active 是否激活
     */
    const setWidgetActive = (widgetId, active) => {
        const widget = state.widgets.get(widgetId);
        if (widget) {
            widget.isActive = active;
        }
    };
    /**
     * 获取数据统计信息
     */
    const getStatistics = () => {
        return {
            totalFrames: state.totalFramesReceived,
            totalBytes: state.totalBytesReceived,
            activeWidgets: activeWidgets.value.length,
            totalDataPoints: totalDataPoints.value,
            memoryUsage: memoryUsage.value,
            updateRate: averageUpdateRate.value,
            droppedFrames: performanceMetrics.droppedFrames,
            isRecording: state.isRecording,
            isPaused: state.isPaused
        };
    };
    /**
     * 导出数据
     * @param options 导出选项
     */
    const exportData = (options) => {
        const data = {};
        const pointsToRelease = [];
        const datasetIds = options.datasetIds || Array.from(state.dataBuffer.keys());
        for (const datasetId of datasetIds) {
            const buffer = state.dataBuffer.get(datasetId);
            if (!buffer) {
                data[datasetId] = [];
                continue;
            }
            let points;
            if (options.timeRange) {
                points = getDataPointsInRange(datasetId, options.timeRange.start, options.timeRange.end);
            }
            else {
                points = getFromOptimizedBuffer(buffer);
            }
            // 创建数据副本以供导出，避免导出引用
            data[datasetId] = points.map(point => ({
                x: point.x,
                y: point.y,
                timestamp: point.timestamp
            }));
            // 标记需要释放的数据点
            pointsToRelease.push(...points);
        }
        // 异步释放数据点回对象池
        setTimeout(() => {
            releaseDataPoints(pointsToRelease);
        }, 0);
        return data;
    };
    // 返回store API
    return {
        // 状态
        currentFrame: (0, vue_1.computed)(() => state.currentFrame),
        frames: (0, vue_1.computed)(() => state.frames),
        widgets: (0, vue_1.computed)(() => state.widgets),
        isPaused: (0, vue_1.computed)(() => state.isPaused),
        isRecording: (0, vue_1.computed)(() => state.isRecording),
        performanceMetrics: (0, vue_1.computed)(() => performanceMetrics),
        // 计算属性
        isConnected,
        activeWidgets,
        totalDataPoints,
        averageUpdateRate,
        memoryUsage,
        // 方法
        initialize,
        processFrame,
        getDataPoints,
        getLatestDataPoints,
        getDataPointsInRange,
        togglePause,
        toggleRecording,
        clearAllData,
        clearDataset,
        setWidgetActive,
        getStatistics,
        exportData
    };
});
exports.default = exports.useDataStore;
//# sourceMappingURL=data.js.map
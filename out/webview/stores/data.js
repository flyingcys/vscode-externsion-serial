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
        rawData: [],
        datasets: [],
        groups: [],
        widgets: new Map(),
        isPaused: false,
        isRecording: false,
        isProcessing: false,
        maxFrameHistory: 1000,
        totalFrames: 0,
        droppedFrames: 0,
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
    // === 原始数据管理方法 ===
    /**
     * 添加原始数据
     * @param data 原始数据
     */
    const addRawData = (data) => {
        const entry = {
            data,
            timestamp: Date.now()
        };
        state.rawData.push(entry);
        // 限制原始数据缓存大小
        if (state.rawData.length > 1000) {
            state.rawData.shift();
        }
    };
    /**
     * 批量添加原始数据
     * @param dataArray 原始数据数组
     */
    const addRawDataBatch = (dataArray) => {
        const timestamp = Date.now();
        const entries = dataArray.map(data => ({ data, timestamp }));
        state.rawData.push(...entries);
        // 限制原始数据缓存大小
        while (state.rawData.length > 1000) {
            state.rawData.shift();
        }
    };
    /**
     * 清除原始数据
     */
    const clearRawData = () => {
        state.rawData = [];
    };
    // === 处理后的帧管理方法 ===
    /**
     * 添加处理后的帧
     * @param frame 处理后的帧
     */
    const addProcessedFrame = (frame) => {
        if (!frame.isValid) {
            state.droppedFrames++;
            return;
        }
        state.frames.push(frame);
        state.totalFrames++;
        // 限制帧历史记录大小
        if (state.frames.length > state.maxFrameHistory) {
            state.frames.shift();
        }
    };
    /**
     * 批量添加处理后的帧
     * @param frames 帧数组
     */
    const addProcessedFramesBatch = (frames) => {
        const validFrames = frames.filter(frame => {
            if (!frame.isValid) {
                state.droppedFrames++;
                return false;
            }
            return true;
        });
        state.frames.push(...validFrames);
        state.totalFrames += validFrames.length;
        // 限制帧历史记录大小
        while (state.frames.length > state.maxFrameHistory) {
            state.frames.shift();
        }
    };
    // === 数据集管理方法 ===
    /**
     * 添加数据集
     * @param dataset 数据集
     */
    const addDataset = (dataset) => {
        const existingIndex = state.datasets.findIndex(d => d.id === dataset.id);
        if (existingIndex >= 0) {
            state.datasets[existingIndex] = dataset;
        }
        else {
            state.datasets.push(dataset);
        }
    };
    /**
     * 更新数据集
     * @param id 数据集ID
     * @param dataset 更新的数据集
     */
    const updateDataset = (id, dataset) => {
        const index = state.datasets.findIndex(d => d.id === id);
        if (index >= 0) {
            state.datasets[index] = dataset;
        }
    };
    /**
     * 移除数据集
     * @param id 数据集ID
     */
    const removeDataset = (id) => {
        const index = state.datasets.findIndex(d => d.id === id);
        if (index >= 0) {
            state.datasets.splice(index, 1);
        }
    };
    // === 分组管理方法 ===
    /**
     * 添加组
     * @param group 组
     */
    const addGroup = (group) => {
        const existingIndex = state.groups.findIndex(g => g.id === group.id);
        if (existingIndex >= 0) {
            state.groups[existingIndex] = group;
        }
        else {
            state.groups.push(group);
        }
    };
    /**
     * 更新组
     * @param id 组ID
     * @param group 更新的组
     */
    const updateGroup = (id, group) => {
        const index = state.groups.findIndex(g => g.id === id);
        if (index >= 0) {
            state.groups[index] = group;
        }
    };
    // === Widget数据管理方法 ===
    /**
     * 设置Widget数据
     * @param id Widget ID
     * @param data Widget数据
     */
    const setWidgetData = (id, data) => {
        state.widgets.set(id, data);
    };
    /**
     * 更新Widget数据
     * @param id Widget ID
     * @param updates 更新的数据
     */
    const updateWidgetData = (id, updates) => {
        const existing = state.widgets.get(id);
        if (existing) {
            state.widgets.set(id, { ...existing, ...updates });
        }
    };
    /**
     * 移除Widget数据
     * @param id Widget ID
     */
    const removeWidgetData = (id) => {
        state.widgets.delete(id);
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
        setInterval(updatePerformanceMetricsInternal, 1000); // 每秒更新一次
    };
    /**
     * 处理新的数据帧
     * @param frame 处理过的数据帧
     */
    const processFrame = (frame) => {
        if (state.isPaused) {
            performanceMetrics.droppedFrames++;
            state.droppedFrames++;
            return;
        }
        const startTime = Date.now();
        state.isProcessing = true;
        try {
            // 更新当前帧
            state.currentFrame = frame;
            state.totalFrames++;
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
        finally {
            state.isProcessing = false;
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
        state.rawData = [];
        state.datasets = [];
        state.groups = [];
        state.widgets.clear();
        state.dataBuffer.clear();
        state.totalFrames = 0;
        state.droppedFrames = 0;
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
    // === 搜索和过滤方法 ===
    /**
     * 搜索数据集
     * @param query 搜索查询
     * @returns 匹配的数据集
     */
    const searchDatasets = (query) => {
        return state.datasets.filter(dataset => dataset.title?.toLowerCase().includes(query.toLowerCase()));
    };
    /**
     * 按Widget类型获取数据集
     * @param widget Widget类型
     * @returns 匹配的数据集
     */
    const getDatasetsByWidget = (widget) => {
        return state.datasets.filter(dataset => dataset.widget === widget);
    };
    /**
     * 获取时间范围内的数据
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @returns 时间范围内的数据集
     */
    const getDataInTimeRange = (startTime, endTime) => {
        return state.datasets.filter(dataset => dataset.timestamp !== undefined && dataset.timestamp >= startTime && dataset.timestamp <= endTime);
    };
    // === 性能监控方法 ===
    /**
     * 更新性能指标
     * @param metrics 性能指标
     */
    const updatePerformanceMetrics = (metrics) => {
        Object.assign(performanceMetrics, metrics);
    };
    /**
     * 计算处理速率
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param count 处理数量
     * @returns 处理速率（个/秒）
     */
    const calculateProcessingRate = (startTime, endTime, count) => {
        const duration = endTime - startTime;
        return duration > 0 ? (count * 1000) / duration : 0;
    };
    /**
     * 获取内存使用情况
     * @returns 内存使用情况
     */
    const getMemoryUsage = () => {
        try {
            const stats = memoryManager.getMemoryStats();
            return {
                used: stats.totalUsed || 0,
                available: stats.totalFree || 1000000
            };
        }
        catch (error) {
            console.warn('获取内存使用情况失败:', error);
            return { used: 0, available: 1000000 };
        }
    };
    /**
     * 检查内存使用情况
     */
    const checkMemoryUsage = () => {
        const usage = getMemoryUsage();
        const usageRatio = usage.used / (usage.used + usage.available);
        if (usageRatio > 0.9) {
            triggerMemoryCleanup();
        }
    };
    /**
     * 触发内存清理
     */
    const triggerMemoryCleanup = () => {
        cleanupExpiredData();
        // 清理较旧的数据
        if (state.rawData.length > 500) {
            state.rawData = state.rawData.slice(-500);
        }
        if (state.frames.length > 500) {
            state.frames = state.frames.slice(-500);
        }
    };
    /**
     * 清理过期数据
     * @param maxAge 最大保存时间（毫秒），默认1小时
     */
    const clearExpiredData = (maxAge = 3600000) => {
        const now = Date.now();
        // 清理过期的数据集
        state.datasets = state.datasets.filter(dataset => dataset.timestamp !== undefined && now - dataset.timestamp < maxAge);
        // 清理过期的原始数据
        state.rawData = state.rawData.filter(entry => now - entry.timestamp < maxAge);
    };
    /**
     * 清理过期数据（内部方法）
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
     * 更新性能指标（内部方法）
     */
    const updatePerformanceMetricsInternal = () => {
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
            totalFrames: state.totalFrames,
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
        // 状态（测试兼容属性）
        rawData: (0, vue_1.computed)(() => state.rawData),
        processedFrames: (0, vue_1.computed)(() => state.frames),
        datasets: (0, vue_1.computed)(() => state.datasets),
        groups: (0, vue_1.computed)(() => state.groups),
        widgetData: (0, vue_1.computed)(() => state.widgets),
        isProcessing: (0, vue_1.computed)(() => state.isProcessing),
        totalFrames: (0, vue_1.computed)(() => state.totalFrames),
        droppedFrames: (0, vue_1.computed)(() => state.droppedFrames),
        performanceMetrics: (0, vue_1.computed)(() => performanceMetrics),
        // 状态（原有属性）
        currentFrame: (0, vue_1.computed)(() => state.currentFrame),
        frames: (0, vue_1.computed)(() => state.frames),
        widgets: (0, vue_1.computed)(() => state.widgets),
        isPaused: (0, vue_1.computed)(() => state.isPaused),
        isRecording: (0, vue_1.computed)(() => state.isRecording),
        // 计算属性
        isConnected,
        activeWidgets,
        totalDataPoints,
        averageUpdateRate,
        memoryUsage,
        // 原始数据管理方法
        addRawData,
        addRawDataBatch,
        clearRawData,
        // 处理后的帧管理方法
        addProcessedFrame,
        addProcessedFramesBatch,
        // 数据集管理方法
        addDataset,
        updateDataset,
        removeDataset,
        // 分组管理方法
        addGroup,
        updateGroup,
        // Widget数据管理方法
        setWidgetData,
        updateWidgetData,
        removeWidgetData,
        // 搜索和过滤方法
        searchDatasets,
        getDatasetsByWidget,
        getDataInTimeRange,
        // 性能监控方法
        updatePerformanceMetrics,
        calculateProcessingRate,
        getMemoryUsage,
        checkMemoryUsage,
        triggerMemoryCleanup,
        clearExpiredData,
        // 原有方法
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
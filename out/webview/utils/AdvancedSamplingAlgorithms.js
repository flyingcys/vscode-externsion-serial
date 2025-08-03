"use strict";
/**
 * 高级采样算法模块
 * 基于Serial-Studio的数据处理逻辑，实现高频数据的智能采样和抽稀
 *
 * 参考Serial-Studio源码：
 * - UI/Dashboard.cpp的smartInterval算法
 * - IO/FixedQueue的循环缓冲区设计
 * - 24Hz更新频率控制机制
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrecisionSampler = exports.createHighFrequencySampler = exports.createDefaultSampler = exports.AdvancedSamplingAlgorithms = void 0;
/**
 * 高级采样算法类 - 模拟Serial-Studio的数据处理管道
 */
class AdvancedSamplingAlgorithms {
    config;
    stats;
    lastPoints = new Map();
    trendBuffer = new Map();
    noiseBuffer = new Map();
    constructor(config = {}) {
        this.config = {
            maxPointsPerSecond: 60,
            adaptiveSampling: true,
            noiseThreshold: 0.01,
            smoothingFactor: 0.1,
            compressionRatio: 0.5,
            enableLossyCompression: false,
            ...config
        };
        this.stats = {
            originalPoints: 0,
            sampledPoints: 0,
            compressionRatio: 0,
            averageInterval: 0,
            peakDetected: 0,
            noiseFiltered: 0
        };
    }
    /**
     * 智能间隔计算 - 基于Serial-Studio的smartInterval算法
     * @param timeSeries 时间序列数据
     * @param multiplier 倍数因子
     * @returns 计算的智能间隔
     */
    calculateSmartInterval(timeSeries, multiplier = 0.2) {
        if (timeSeries.length < 2) {
            return 1000;
        } // 默认1秒间隔
        const intervals = [];
        for (let i = 1; i < timeSeries.length; i++) {
            intervals.push(timeSeries[i] - timeSeries[i - 1]);
        }
        const minInterval = Math.min(...intervals);
        const maxInterval = Math.max(...intervals);
        const range = maxInterval - minInterval;
        if (range === 0) {
            return minInterval || 1000;
        }
        // 使用Serial-Studio的智能间隔算法
        const magnitude = Math.ceil(Math.log10(range));
        const scale = Math.pow(10, -magnitude) * 10;
        const normalizedRange = Math.ceil(range * scale) / scale;
        let step = Math.max(1, normalizedRange * multiplier);
        // 标准化步长
        if (step < 100) {
            if (step <= 10) {
                step = 10;
            }
            else if (step <= 20) {
                step = 20;
            }
            else if (step <= 50) {
                step = 50;
            }
            else {
                step = 100;
            }
        }
        else {
            const base = Math.pow(10, Math.floor(Math.log10(step)));
            const normalized = step / base;
            if (normalized <= 1.0) {
                step = base;
            }
            else if (normalized <= 2.0) {
                step = 2 * base;
            }
            else if (normalized <= 5.0) {
                step = 5 * base;
            }
            else {
                step = 10 * base;
            }
        }
        return Math.max(step, 16); // 最小16ms间隔（约60fps）
    }
    /**
     * 自适应采样算法
     * @param datasetId 数据集ID
     * @param points 输入数据点数组
     * @returns 采样后的数据点数组
     */
    adaptiveSampling(datasetId, points) {
        if (!points || points.length === 0) {
            return [];
        }
        this.stats.originalPoints += points.length;
        if (!this.config.adaptiveSampling) {
            // 简单固定间隔采样
            return this.fixedIntervalSampling(points);
        }
        const sampledPoints = [];
        const lastPoint = this.lastPoints.get(datasetId);
        for (const point of points) {
            if (this.shouldKeepPoint(datasetId, point, lastPoint)) {
                sampledPoints.push(point);
                this.lastPoints.set(datasetId, point);
            }
        }
        this.stats.sampledPoints += sampledPoints.length;
        this.updateCompressionRatio();
        return sampledPoints;
    }
    /**
     * 判断是否应该保留数据点
     * @param datasetId 数据集ID
     * @param point 当前数据点
     * @param lastPoint 上一个数据点
     * @returns 是否保留
     */
    shouldKeepPoint(datasetId, point, lastPoint) {
        if (!lastPoint) {
            return true;
        }
        const timeDiff = point.timestamp - lastPoint.timestamp;
        const valueDiff = Math.abs(point.y - lastPoint.y);
        const relativeChange = lastPoint.y !== 0 ? Math.abs(valueDiff / lastPoint.y) : valueDiff;
        // 时间间隔控制
        const minInterval = 1000 / this.config.maxPointsPerSecond;
        if (timeDiff < minInterval && relativeChange < this.config.noiseThreshold) {
            return false;
        }
        // 噪声过滤
        if (this.isNoise(datasetId, point)) {
            this.stats.noiseFiltered++;
            return false;
        }
        // 峰值检测
        if (this.isPeak(datasetId, point)) {
            this.stats.peakDetected++;
            return true;
        }
        // 趋势变化检测
        if (this.isTrendChange(datasetId, point)) {
            return true;
        }
        // 基于相对变化的决策
        return relativeChange >= this.config.noiseThreshold;
    }
    /**
     * 噪声检测算法
     * @param datasetId 数据集ID
     * @param point 数据点
     * @returns 是否为噪声
     */
    isNoise(datasetId, point) {
        if (!this.noiseBuffer.has(datasetId)) {
            this.noiseBuffer.set(datasetId, []);
        }
        const buffer = this.noiseBuffer.get(datasetId);
        buffer.push(point.y);
        // 保持滑动窗口大小
        if (buffer.length > 5) {
            buffer.shift();
        }
        if (buffer.length < 3) {
            return false;
        }
        // 计算标准差
        const mean = buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
        const variance = buffer.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / buffer.length;
        const stdDev = Math.sqrt(variance);
        // 如果当前值偏离均值超过2倍标准差，可能是噪声
        const deviation = Math.abs(point.y - mean);
        return stdDev > 0 && deviation > 2 * stdDev && stdDev < this.config.noiseThreshold * mean;
    }
    /**
     * 峰值检测算法
     * @param datasetId 数据集ID
     * @param point 数据点
     * @returns 是否为峰值
     */
    isPeak(datasetId, point) {
        if (!this.trendBuffer.has(datasetId)) {
            this.trendBuffer.set(datasetId, []);
        }
        const buffer = this.trendBuffer.get(datasetId);
        buffer.push(point.y);
        if (buffer.length > 3) {
            buffer.shift();
        }
        if (buffer.length < 3) {
            return false;
        }
        const [prev2, prev1, current] = buffer;
        // 检测局部极值
        const isLocalMax = current > prev1 && prev1 > prev2;
        const isLocalMin = current < prev1 && prev1 < prev2;
        return isLocalMax || isLocalMin;
    }
    /**
     * 趋势变化检测
     * @param datasetId 数据集ID
     * @param point 数据点
     * @returns 是否为趋势变化点
     */
    isTrendChange(datasetId, point) {
        const buffer = this.trendBuffer.get(datasetId);
        if (!buffer || buffer.length < 3) {
            return false;
        }
        const [prev2, prev1] = buffer.slice(-2);
        const current = point.y;
        // 计算趋势方向
        const trend1 = prev1 - prev2;
        const trend2 = current - prev1;
        // 趋势反转检测
        return (trend1 > 0 && trend2 < 0) || (trend1 < 0 && trend2 > 0);
    }
    /**
     * 固定间隔采样
     * @param points 输入数据点
     * @returns 采样后的数据点
     */
    fixedIntervalSampling(points) {
        if (points.length === 0) {
            return [];
        }
        const interval = 1000 / this.config.maxPointsPerSecond;
        const sampledPoints = [];
        let lastTime = 0;
        for (const point of points) {
            if (point.timestamp - lastTime >= interval) {
                sampledPoints.push(point);
                lastTime = point.timestamp;
            }
        }
        return sampledPoints;
    }
    /**
     * Douglas-Peucker抽稀算法 - 用于轨迹数据
     * @param points 输入点数组
     * @param epsilon 容差值
     * @returns 抽稀后的点数组
     */
    douglasPeuckerDecimation(points, epsilon = 1.0) {
        if (points.length <= 2) {
            return points;
        }
        return this.douglasPeuckerRecursive(points, epsilon);
    }
    douglasPeuckerRecursive(points, epsilon) {
        if (points.length <= 2) {
            return points;
        }
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        let maxDistance = 0;
        let maxIndex = 0;
        // 找到距离直线最远的点
        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.perpendicularDistance(points[i], firstPoint, lastPoint);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = i;
            }
        }
        // 如果最大距离大于阈值，递归处理
        if (maxDistance > epsilon) {
            const leftPoints = this.douglasPeuckerRecursive(points.slice(0, maxIndex + 1), epsilon);
            const rightPoints = this.douglasPeuckerRecursive(points.slice(maxIndex), epsilon);
            return [...leftPoints.slice(0, -1), ...rightPoints];
        }
        else {
            return [firstPoint, lastPoint];
        }
    }
    /**
     * 计算点到直线的垂直距离
     * @param point 目标点
     * @param lineStart 直线起点
     * @param lineEnd 直线终点
     * @returns 垂直距离
     */
    perpendicularDistance(point, lineStart, lineEnd) {
        const A = lineEnd.x - lineStart.x;
        const B = lineEnd.y - lineStart.y;
        const C = point.x - lineStart.x;
        const D = point.y - lineStart.y;
        const dot = A * C + B * D;
        const lenSq = A * A + B * B;
        if (lenSq === 0) {
            return Math.sqrt(C * C + D * D);
        }
        const param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        }
        else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        }
        else {
            xx = lineStart.x + param * A;
            yy = lineStart.y + param * B;
        }
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * 数据平滑算法 - 指数移动平均
     * @param datasetId 数据集ID
     * @param points 输入数据点
     * @returns 平滑后的数据点
     */
    exponentialSmoothing(datasetId, points) {
        if (points.length === 0 || this.config.smoothingFactor === 0) {
            return points;
        }
        const smoothedPoints = [];
        let smoothedValue = points[0].y;
        for (const point of points) {
            smoothedValue = this.config.smoothingFactor * point.y +
                (1 - this.config.smoothingFactor) * smoothedValue;
            smoothedPoints.push({
                ...point,
                y: smoothedValue
            });
        }
        return smoothedPoints;
    }
    /**
     * 获取采样统计信息
     * @returns 统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            originalPoints: 0,
            sampledPoints: 0,
            compressionRatio: 0,
            averageInterval: 0,
            peakDetected: 0,
            noiseFiltered: 0
        };
    }
    /**
     * 更新配置
     * @param newConfig 新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * 清理缓存数据
     * @param datasetId 数据集ID（可选，不指定则清理所有）
     */
    clearCache(datasetId) {
        if (datasetId) {
            this.lastPoints.delete(datasetId);
            this.trendBuffer.delete(datasetId);
            this.noiseBuffer.delete(datasetId);
        }
        else {
            this.lastPoints.clear();
            this.trendBuffer.clear();
            this.noiseBuffer.clear();
        }
    }
    /**
     * 更新压缩比统计
     */
    updateCompressionRatio() {
        if (this.stats.originalPoints > 0) {
            this.stats.compressionRatio = this.stats.sampledPoints / this.stats.originalPoints;
        }
    }
}
exports.AdvancedSamplingAlgorithms = AdvancedSamplingAlgorithms;
/**
 * 创建默认采样算法实例
 */
const createDefaultSampler = (config) => {
    return new AdvancedSamplingAlgorithms(config);
};
exports.createDefaultSampler = createDefaultSampler;
/**
 * 高频数据特化采样器
 */
const createHighFrequencySampler = () => {
    return new AdvancedSamplingAlgorithms({
        maxPointsPerSecond: 120,
        adaptiveSampling: true,
        noiseThreshold: 0.005,
        smoothingFactor: 0.05,
        compressionRatio: 0.3,
        enableLossyCompression: true
    });
};
exports.createHighFrequencySampler = createHighFrequencySampler;
/**
 * 精密数据采样器（保真度优先）
 */
const createPrecisionSampler = () => {
    return new AdvancedSamplingAlgorithms({
        maxPointsPerSecond: 30,
        adaptiveSampling: true,
        noiseThreshold: 0.001,
        smoothingFactor: 0.0,
        compressionRatio: 0.8,
        enableLossyCompression: false
    });
};
exports.createPrecisionSampler = createPrecisionSampler;
//# sourceMappingURL=AdvancedSamplingAlgorithms.js.map
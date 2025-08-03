"use strict";
/**
 * CanvasPlotRenderer - Canvas图表渲染器
 * 基于HighFrequencyRenderer实现高性能图表渲染，作为Chart.js的替代方案
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasPlotRenderer = void 0;
const HighFrequencyRenderer_1 = __importDefault(require("../../shared/HighFrequencyRenderer"));
/**
 * Canvas图表渲染器
 * 提供高性能的实时数据可视化
 */
class CanvasPlotRenderer {
    renderer;
    widgetId;
    context = null;
    config;
    chartConfig;
    // 数据管理
    datasets = [];
    dataHistory = new Map();
    lastRenderTime = 0;
    // 性能统计
    renderCount = 0;
    incrementalRenderCount = 0;
    fullRenderCount = 0;
    constructor(widgetId, config = {}) {
        this.widgetId = widgetId;
        // 默认配置
        this.config = {
            enableOffscreenRendering: true,
            enableIncrementalUpdates: true,
            targetFPS: 30,
            maxDataPoints: 1000,
            renderingOptimizations: {
                enableBatching: true,
                enableCaching: true,
                enableCulling: true
            },
            ...config
        };
        // 默认图表配置
        this.chartConfig = {
            width: 800,
            height: 400,
            xRange: { min: 0, max: 100 },
            yRange: { min: -50, max: 50 },
            backgroundColor: '#ffffff',
            gridColor: '#e4e7ed',
            lineColors: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
        };
        // 创建高频渲染器
        this.renderer = new HighFrequencyRenderer_1.default({
            targetFPS: this.config.targetFPS,
            enableBatching: this.config.renderingOptimizations.enableBatching,
            cullingEnabled: this.config.renderingOptimizations.enableCulling
        });
        // 监听渲染完成事件
        this.renderer.on('renderCompleted', this.handleRenderCompleted.bind(this));
    }
    /**
     * 初始化Canvas渲染上下文
     */
    initialize(canvas) {
        // 更新图表配置
        this.chartConfig.width = canvas.width;
        this.chartConfig.height = canvas.height;
        // 创建渲染上下文
        if (this.config.enableOffscreenRendering) {
            this.context = this.renderer.createRenderContext(this.widgetId, canvas);
        }
        console.log(`Canvas图表渲染器已初始化 - 离屏渲染: ${this.config.enableOffscreenRendering}`);
    }
    /**
     * 设置数据集
     */
    setDatasets(datasets) {
        this.datasets = [...datasets];
        // 初始化数据历史
        for (const dataset of datasets) {
            if (!this.dataHistory.has(dataset.title)) {
                this.dataHistory.set(dataset.title, []);
            }
        }
        // 触发完整重绘
        this.scheduleFullRender();
    }
    /**
     * 添加数据点
     */
    addDataPoint(datasetIndex, point) {
        if (datasetIndex >= this.datasets.length) {
            console.warn(`Invalid dataset index: ${datasetIndex}`);
            return;
        }
        const dataset = this.datasets[datasetIndex];
        const history = this.dataHistory.get(dataset.title) || [];
        // 转换为渲染数据点
        const renderPoint = {
            x: point.timestamp || Date.now(),
            y: point.y,
            value: point.y,
            timestamp: point.timestamp || Date.now()
        };
        // 添加到历史记录
        history.push(renderPoint);
        // 限制历史记录大小
        if (history.length > this.config.maxDataPoints) {
            history.shift();
        }
        this.dataHistory.set(dataset.title, history);
        // 调度增量渲染
        if (this.config.enableIncrementalUpdates) {
            this.scheduleIncrementalRender([renderPoint], datasetIndex);
        }
        else {
            this.scheduleFullRender();
        }
    }
    /**
     * 清除数据
     */
    clearData() {
        this.dataHistory.clear();
        // 初始化数据历史
        for (const dataset of this.datasets) {
            this.dataHistory.set(dataset.title, []);
        }
        // 调度清除渲染
        this.renderer.scheduleRender({
            type: 'clear',
            widgetId: this.widgetId,
            priority: 'high'
        });
    }
    /**
     * 调度增量渲染
     */
    scheduleIncrementalRender(newPoints, datasetIndex) {
        // 计算变化区域
        const changedAreas = this.calculateChangedAreas(newPoints);
        this.renderer.scheduleRender({
            type: 'update',
            widgetId: this.widgetId,
            data: {
                incrementalData: {
                    newPoints,
                    changedAreas,
                    datasetIndex
                }
            },
            priority: 'medium'
        });
        this.incrementalRenderCount++;
    }
    /**
     * 调度完整渲染
     */
    scheduleFullRender() {
        // 准备完整数据
        const fullData = {
            datasets: this.datasets.map((dataset, index) => ({
                ...dataset,
                data: this.dataHistory.get(dataset.title) || [],
                color: this.chartConfig.lineColors[index % this.chartConfig.lineColors.length]
            })),
            totalPoints: Array.from(this.dataHistory.values()).reduce((sum, points) => sum + points.length, 0),
            config: this.chartConfig
        };
        this.renderer.scheduleRender({
            type: 'redraw',
            widgetId: this.widgetId,
            data: { fullData },
            priority: 'low'
        });
        this.fullRenderCount++;
    }
    /**
     * 计算变化区域
     */
    calculateChangedAreas(newPoints) {
        if (newPoints.length === 0) {
            return [];
        }
        // 简化的区域计算 - 实际实现应该更精确
        const minX = Math.min(...newPoints.map(p => p.x));
        const maxX = Math.max(...newPoints.map(p => p.x));
        const minY = Math.min(...newPoints.map(p => p.y));
        const maxY = Math.max(...newPoints.map(p => p.y));
        // 转换到Canvas坐标
        const area = {
            x: this.transformXToCanvas(minX) - 10,
            y: this.transformYToCanvas(maxY) - 10,
            width: this.transformXToCanvas(maxX) - this.transformXToCanvas(minX) + 20,
            height: this.transformYToCanvas(minY) - this.transformYToCanvas(maxY) + 20
        };
        return [area];
    }
    /**
     * 转换X坐标到Canvas空间
     */
    transformXToCanvas(dataX) {
        const { xRange } = this.chartConfig;
        const canvasWidth = this.chartConfig.width;
        const normalizedX = (dataX - xRange.min) / (xRange.max - xRange.min);
        return normalizedX * canvasWidth;
    }
    /**
     * 转换Y坐标到Canvas空间
     */
    transformYToCanvas(dataY) {
        const { yRange } = this.chartConfig;
        const canvasHeight = this.chartConfig.height;
        const normalizedY = (dataY - yRange.min) / (yRange.max - yRange.min);
        return canvasHeight - (normalizedY * canvasHeight); // Y轴翻转
    }
    /**
     * 处理渲染完成事件
     */
    handleRenderCompleted(event) {
        if (event.widgetId !== this.widgetId) {
            return;
        }
        this.renderCount++;
        this.lastRenderTime = event.timestamp;
        // 发出性能事件
        this.emitPerformanceUpdate();
    }
    /**
     * 发出性能更新事件
     */
    emitPerformanceUpdate() {
        const stats = {
            widgetId: this.widgetId,
            totalRenders: this.renderCount,
            incrementalRenders: this.incrementalRenderCount,
            fullRenders: this.fullRenderCount,
            lastRenderTime: this.lastRenderTime,
            dataPointCount: Array.from(this.dataHistory.values()).reduce((sum, points) => sum + points.length, 0)
        };
        // 这里可以发送到性能监控系统
        console.debug('Canvas渲染性能统计:', stats);
    }
    /**
     * 更新配置
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        // 更新渲染器配置
        this.renderer.updateConfig({
            targetFPS: this.config.targetFPS,
            enableBatching: this.config.renderingOptimizations.enableBatching
        });
    }
    /**
     * 更新图表配置
     */
    updateChartConfig(config) {
        const oldConfig = { ...this.chartConfig };
        this.chartConfig = { ...this.chartConfig, ...config };
        // 如果尺寸发生变化，需要调整Canvas
        if (config.width !== undefined || config.height !== undefined) {
            if (this.context) {
                this.renderer.resizeCanvas(this.widgetId, this.chartConfig.width, this.chartConfig.height);
            }
        }
        // 触发重绘
        this.scheduleFullRender();
    }
    /**
     * 获取性能统计
     */
    getPerformanceStats() {
        const rendererStats = this.renderer.getRenderStats();
        const contextStats = this.renderer.getRenderContextStats();
        return {
            canvas: {
                totalRenders: this.renderCount,
                incrementalRenders: this.incrementalRenderCount,
                fullRenders: this.fullRenderCount,
                lastRenderTime: this.lastRenderTime,
                dataPointCount: Array.from(this.dataHistory.values()).reduce((sum, points) => sum + points.length, 0)
            },
            renderer: rendererStats,
            context: contextStats[this.widgetId] || null
        };
    }
    /**
     * 销毁渲染器
     */
    dispose() {
        // 移除渲染上下文
        this.renderer.removeRenderContext(this.widgetId);
        // 清理数据
        this.dataHistory.clear();
        this.datasets = [];
        console.log(`Canvas图表渲染器已销毁: ${this.widgetId}`);
    }
}
exports.CanvasPlotRenderer = CanvasPlotRenderer;
exports.default = CanvasPlotRenderer;
//# sourceMappingURL=CanvasPlotRenderer.js.map
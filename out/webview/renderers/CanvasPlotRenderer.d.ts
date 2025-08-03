/**
 * CanvasPlotRenderer - Canvas图表渲染器
 * 基于HighFrequencyRenderer实现高性能图表渲染，作为Chart.js的替代方案
 */
import { DataPoint, Dataset } from '../../shared/types';
/**
 * Canvas渲染配置
 */
export interface CanvasPlotConfig {
    enableOffscreenRendering: boolean;
    enableIncrementalUpdates: boolean;
    targetFPS: number;
    maxDataPoints: number;
    renderingOptimizations: {
        enableBatching: boolean;
        enableCaching: boolean;
        enableCulling: boolean;
    };
}
/**
 * 图表配置
 */
export interface ChartConfig {
    width: number;
    height: number;
    xRange: {
        min: number;
        max: number;
    };
    yRange: {
        min: number;
        max: number;
    };
    backgroundColor: string;
    gridColor: string;
    lineColors: string[];
}
/**
 * Canvas图表渲染器
 * 提供高性能的实时数据可视化
 */
export declare class CanvasPlotRenderer {
    private renderer;
    private widgetId;
    private context;
    private config;
    private chartConfig;
    private datasets;
    private dataHistory;
    private lastRenderTime;
    private renderCount;
    private incrementalRenderCount;
    private fullRenderCount;
    constructor(widgetId: string, config?: Partial<CanvasPlotConfig>);
    /**
     * 初始化Canvas渲染上下文
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * 设置数据集
     */
    setDatasets(datasets: Dataset[]): void;
    /**
     * 添加数据点
     */
    addDataPoint(datasetIndex: number, point: DataPoint): void;
    /**
     * 清除数据
     */
    clearData(): void;
    /**
     * 调度增量渲染
     */
    private scheduleIncrementalRender;
    /**
     * 调度完整渲染
     */
    private scheduleFullRender;
    /**
     * 计算变化区域
     */
    private calculateChangedAreas;
    /**
     * 转换X坐标到Canvas空间
     */
    private transformXToCanvas;
    /**
     * 转换Y坐标到Canvas空间
     */
    private transformYToCanvas;
    /**
     * 处理渲染完成事件
     */
    private handleRenderCompleted;
    /**
     * 发出性能更新事件
     */
    private emitPerformanceUpdate;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<CanvasPlotConfig>): void;
    /**
     * 更新图表配置
     */
    updateChartConfig(config: Partial<ChartConfig>): void;
    /**
     * 获取性能统计
     */
    getPerformanceStats(): any;
    /**
     * 销毁渲染器
     */
    dispose(): void;
}
export default CanvasPlotRenderer;
//# sourceMappingURL=CanvasPlotRenderer.d.ts.map
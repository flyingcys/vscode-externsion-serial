/**
 * MultiPlot批量更新优化器
 * 基于Serial-Studio的MultiLineSeries优化，实现多数据系列的同步批量更新
 *
 * 主要优化策略：
 * 1. 批量数据更新，减少Chart.js的update调用
 * 2. 数据压缩和去重算法
 * 3. 多系列同步渲染优化
 * 4. 内存使用优化
 */
import { Chart } from 'chart.js';
export interface MultiPlotDataPoint {
    x: number;
    y: number;
    timestamp: number;
    seriesIndex: number;
}
export interface SeriesConfig {
    id: string;
    label: string;
    color: string;
    visible: boolean;
    compression: boolean;
    samplingRate: number;
}
export interface BatchUpdateConfig {
    maxPointsPerSeries: number;
    batchUpdateInterval: number;
    enableCompression: boolean;
    enableDuplicateRemoval: boolean;
    synchronizedRendering: boolean;
}
export interface MultiPlotStats {
    totalSeries: number;
    totalPoints: number;
    compressedPoints: number;
    renderTime: number;
    batchSize: number;
    compressionRatio: number;
}
/**
 * MultiPlot批量更新优化器类
 */
export declare class MultiPlotBatchOptimizer {
    private chart;
    private config;
    private seriesConfigs;
    private dataSamplers;
    private updateQueue;
    private batchTimer;
    private stats;
    private lastDataHashes;
    constructor(chart: Chart, config?: Partial<BatchUpdateConfig>);
    /**
     * 添加数据系列配置
     * @param seriesConfig 系列配置
     */
    addSeries(seriesConfig: SeriesConfig): void;
    /**
     * 批量添加数据点
     * @param points 数据点数组
     */
    addDataPoints(points: MultiPlotDataPoint[]): void;
    /**
     * 处理单个系列的数据
     * @param seriesId 系列ID
     * @param points 数据点数组
     */
    private processSeriesData;
    /**
     * 压缩系列数据
     * @param seriesId 系列ID
     * @param points 原始数据点
     * @returns 压缩后的数据点
     */
    private compressSeriesData;
    /**
     * 去重处理
     * @param seriesId 系列ID
     * @param points 数据点数组
     * @returns 去重后的数据点
     */
    private removeDuplicates;
    /**
     * 计算数据哈希
     * @param points 数据点数组
     * @returns 哈希值
     */
    private calculateDataHash;
    /**
     * 启动批量更新定时器
     */
    private scheduleBatchUpdate;
    /**
     * 处理批量更新
     */
    private processBatchUpdate;
    /**
     * 同步批量更新所有系列
     */
    private synchronizedBatchUpdate;
    /**
     * 单独更新各个系列
     */
    private individualSeriesUpdate;
    /**
     * 更新单个系列
     * @param seriesId 系列ID
     * @param points 数据点队列
     */
    private updateSingleSeries;
    /**
     * 根据系列索引获取系列ID
     * @param seriesIndex 系列索引
     * @returns 系列ID
     */
    private getSeriesIdByIndex;
    /**
     * 根据系列ID获取数据集索引
     * @param seriesId 系列ID
     * @returns 数据集索引
     */
    private getDatasetIndexBySeriesId;
    /**
     * 获取总队列大小
     * @returns 总队列大小
     */
    private getTotalQueueSize;
    /**
     * 清空所有数据
     */
    clearAllData(): void;
    /**
     * 获取性能统计
     * @returns 统计信息
     */
    getStats(): MultiPlotStats;
    /**
     * 重置统计信息
     * @returns 重置后的统计信息
     */
    private resetStats;
    /**
     * 更新配置
     * @param newConfig 新配置
     */
    updateConfig(newConfig: Partial<BatchUpdateConfig>): void;
    /**
     * 销毁优化器
     */
    destroy(): void;
}
//# sourceMappingURL=MultiPlotBatchOptimizer.d.ts.map
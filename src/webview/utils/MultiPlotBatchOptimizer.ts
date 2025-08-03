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
import { AdvancedSamplingAlgorithms } from './AdvancedSamplingAlgorithms';

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
  batchUpdateInterval: number; // ms
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
export class MultiPlotBatchOptimizer {
  private chart: Chart;
  private config: BatchUpdateConfig;
  private seriesConfigs: Map<string, SeriesConfig> = new Map();
  private dataSamplers: Map<string, AdvancedSamplingAlgorithms> = new Map();
  private updateQueue: Map<string, MultiPlotDataPoint[]> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private stats: MultiPlotStats;
  private lastDataHashes: Map<string, string> = new Map();

  constructor(chart: Chart, config: Partial<BatchUpdateConfig> = {}) {
    this.chart = chart;
    this.config = {
      maxPointsPerSeries: 1000,
      batchUpdateInterval: 42, // 24Hz更新频率
      enableCompression: true,
      enableDuplicateRemoval: true,
      synchronizedRendering: true,
      ...config
    };

    this.stats = this.resetStats();
  }

  /**
   * 添加数据系列配置
   * @param seriesConfig 系列配置
   */
  public addSeries(seriesConfig: SeriesConfig): void {
    this.seriesConfigs.set(seriesConfig.id, seriesConfig);
    
    // 为每个系列创建采样器
    if (seriesConfig.compression) {
      const sampler = new AdvancedSamplingAlgorithms({
        maxPointsPerSecond: seriesConfig.samplingRate || 30,
        adaptiveSampling: true,
        noiseThreshold: 0.001,
        smoothingFactor: 0.05
      });
      this.dataSamplers.set(seriesConfig.id, sampler);
    }

    // 初始化更新队列
    this.updateQueue.set(seriesConfig.id, []);
  }

  /**
   * 批量添加数据点
   * @param points 数据点数组
   */
  public addDataPoints(points: MultiPlotDataPoint[]): void {
    if (points.length === 0) {return;}

    const startTime = performance.now();

    // 按系列分组数据点
    const pointsBySeries = new Map<string, MultiPlotDataPoint[]>();
    
    for (const point of points) {
      const seriesId = this.getSeriesIdByIndex(point.seriesIndex);
      if (!seriesId) {continue;}

      if (!pointsBySeries.has(seriesId)) {
        pointsBySeries.set(seriesId, []);
      }
      pointsBySeries.get(seriesId)!.push(point);
    }

    // 处理每个系列的数据
    for (const [seriesId, seriesPoints] of pointsBySeries) {
      this.processSeriesData(seriesId, seriesPoints);
    }

    // 启动批量更新定时器
    this.scheduleBatchUpdate();

    this.stats.totalPoints += points.length;
    this.stats.renderTime = performance.now() - startTime;
  }

  /**
   * 处理单个系列的数据
   * @param seriesId 系列ID
   * @param points 数据点数组
   */
  private processSeriesData(seriesId: string, points: MultiPlotDataPoint[]): void {
    const seriesConfig = this.seriesConfigs.get(seriesId);
    if (!seriesConfig || !seriesConfig.visible) {return;}

    let processedPoints = points;

    // 应用数据压缩
    if (this.config.enableCompression && seriesConfig.compression) {
      processedPoints = this.compressSeriesData(seriesId, points);
    }

    // 去重处理
    if (this.config.enableDuplicateRemoval) {
      processedPoints = this.removeDuplicates(seriesId, processedPoints);
    }

    // 添加到更新队列
    const queue = this.updateQueue.get(seriesId) || [];
    queue.push(...processedPoints);

    // 限制队列大小
    if (queue.length > this.config.maxPointsPerSeries) {
      queue.splice(0, queue.length - this.config.maxPointsPerSeries);
    }

    this.updateQueue.set(seriesId, queue);
  }

  /**
   * 压缩系列数据
   * @param seriesId 系列ID
   * @param points 原始数据点
   * @returns 压缩后的数据点
   */
  private compressSeriesData(seriesId: string, points: MultiPlotDataPoint[]): MultiPlotDataPoint[] {
    const sampler = this.dataSamplers.get(seriesId);
    if (!sampler) {return points;}

    // 转换为采样器格式
    const samplingPoints = points.map(p => ({
      x: p.x,
      y: p.y,
      timestamp: p.timestamp
    }));

    // 应用自适应采样
    const sampledPoints = sampler.adaptiveSampling(seriesId, samplingPoints);

    // 转换回MultiPlotDataPoint格式
    const compressedPoints = sampledPoints.map(sp => {
      const originalPoint = points.find(p => p.timestamp === sp.timestamp);
      return originalPoint || {
        x: sp.x,
        y: sp.y,
        timestamp: sp.timestamp,
        seriesIndex: points[0].seriesIndex
      };
    });

    this.stats.compressedPoints += compressedPoints.length;
    this.stats.compressionRatio = compressedPoints.length / points.length;

    return compressedPoints;
  }

  /**
   * 去重处理
   * @param seriesId 系列ID
   * @param points 数据点数组
   * @returns 去重后的数据点
   */
  private removeDuplicates(seriesId: string, points: MultiPlotDataPoint[]): MultiPlotDataPoint[] {
    if (points.length === 0) {return points;}

    // 计算当前数据哈希
    const currentHash = this.calculateDataHash(points);
    const lastHash = this.lastDataHashes.get(seriesId);

    // 如果数据没有变化，返回空数组
    if (currentHash === lastHash) {
      return [];
    }

    this.lastDataHashes.set(seriesId, currentHash);

    // 基于时间戳和值的去重
    const uniquePoints = new Map<string, MultiPlotDataPoint>();
    
    for (const point of points) {
      const key = `${point.timestamp}_${point.y.toFixed(6)}`;
      if (!uniquePoints.has(key)) {
        uniquePoints.set(key, point);
      }
    }

    return Array.from(uniquePoints.values());
  }

  /**
   * 计算数据哈希
   * @param points 数据点数组
   * @returns 哈希值
   */
  private calculateDataHash(points: MultiPlotDataPoint[]): string {
    if (points.length === 0) {return '';}
    
    // 使用最后几个点计算简化哈希
    const sampleSize = Math.min(5, points.length);
    const samples = points.slice(-sampleSize);
    
    let hash = '';
    for (const point of samples) {
      hash += `${point.x.toFixed(3)}_${point.y.toFixed(6)}_`;
    }
    
    return hash + points.length;
  }

  /**
   * 启动批量更新定时器
   */
  private scheduleBatchUpdate(): void {
    if (this.batchTimer) {return;}

    this.batchTimer = setTimeout(() => {
      this.processBatchUpdate();
      this.batchTimer = null;
    }, this.config.batchUpdateInterval);
  }

  /**
   * 处理批量更新
   */
  private processBatchUpdate(): void {
    const startTime = performance.now();

    if (this.config.synchronizedRendering) {
      this.synchronizedBatchUpdate();
    } else {
      this.individualSeriesUpdate();
    }

    this.stats.renderTime = performance.now() - startTime;
    this.stats.batchSize = this.getTotalQueueSize();
  }

  /**
   * 同步批量更新所有系列
   */
  private synchronizedBatchUpdate(): void {
    let hasUpdates = false;

    // 更新所有系列的数据
    for (const [seriesId, queue] of this.updateQueue) {
      if (queue.length === 0) {continue;}

      const datasetIndex = this.getDatasetIndexBySeriesId(seriesId);
      if (datasetIndex === -1) {continue;}

      const dataset = this.chart.data.datasets[datasetIndex];
      if (!dataset) {continue;}

      // 批量添加数据点
      for (const point of queue) {
        dataset.data.push({ x: point.x, y: point.y });
      }

      // 限制数据点数量
      const maxPoints = this.config.maxPointsPerSeries;
      if (dataset.data.length > maxPoints) {
        dataset.data.splice(0, dataset.data.length - maxPoints);
      }

      // 清空队列
      queue.length = 0;
      hasUpdates = true;
    }

    // 一次性更新图表
    if (hasUpdates) {
      this.chart.update('none'); // 无动画快速更新
    }
  }

  /**
   * 单独更新各个系列
   */
  private individualSeriesUpdate(): void {
    for (const [seriesId, queue] of this.updateQueue) {
      if (queue.length === 0) {continue;}

      this.updateSingleSeries(seriesId, queue);
      queue.length = 0;
    }
  }

  /**
   * 更新单个系列
   * @param seriesId 系列ID
   * @param points 数据点队列
   */
  private updateSingleSeries(seriesId: string, points: MultiPlotDataPoint[]): void {
    const datasetIndex = this.getDatasetIndexBySeriesId(seriesId);
    if (datasetIndex === -1) {return;}

    const dataset = this.chart.data.datasets[datasetIndex];
    if (!dataset) {return;}

    // 添加新数据点
    for (const point of points) {
      dataset.data.push({ x: point.x, y: point.y });
    }

    // 限制数据点数量
    const maxPoints = this.config.maxPointsPerSeries;
    if (dataset.data.length > maxPoints) {
      dataset.data.splice(0, dataset.data.length - maxPoints);
    }

    // 更新图表
    this.chart.update('none');
  }

  /**
   * 根据系列索引获取系列ID
   * @param seriesIndex 系列索引
   * @returns 系列ID
   */
  private getSeriesIdByIndex(seriesIndex: number): string | null {
    const configs = Array.from(this.seriesConfigs.values());
    return configs[seriesIndex]?.id || null;
  }

  /**
   * 根据系列ID获取数据集索引
   * @param seriesId 系列ID
   * @returns 数据集索引
   */
  private getDatasetIndexBySeriesId(seriesId: string): number {
    const configs = Array.from(this.seriesConfigs.entries());
    const index = configs.findIndex(([id]) => id === seriesId);
    return index;
  }

  /**
   * 获取总队列大小
   * @returns 总队列大小
   */
  private getTotalQueueSize(): number {
    let total = 0;
    for (const queue of this.updateQueue.values()) {
      total += queue.length;
    }
    return total;
  }

  /**
   * 清空所有数据
   */
  public clearAllData(): void {
    // 清空更新队列
    for (const queue of this.updateQueue.values()) {
      queue.length = 0;
    }

    // 清空采样器缓存
    for (const sampler of this.dataSamplers.values()) {
      sampler.clearCache();
    }

    // 清空哈希缓存
    this.lastDataHashes.clear();

    // 重置统计信息
    this.stats = this.resetStats();

    // 清空图表数据
    if (this.chart.data.datasets) {
      this.chart.data.datasets.forEach(dataset => {
        dataset.data.length = 0;
      });
      this.chart.update();
    }
  }

  /**
   * 获取性能统计
   * @returns 统计信息
   */
  public getStats(): MultiPlotStats {
    this.stats.totalSeries = this.seriesConfigs.size;
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   * @returns 重置后的统计信息
   */
  private resetStats(): MultiPlotStats {
    return {
      totalSeries: 0,
      totalPoints: 0,
      compressedPoints: 0,
      renderTime: 0,
      batchSize: 0,
      compressionRatio: 1.0
    };
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  public updateConfig(newConfig: Partial<BatchUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 销毁优化器
   */
  public destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.clearAllData();
    this.seriesConfigs.clear();
    this.dataSamplers.clear();
    this.updateQueue.clear();
    this.lastDataHashes.clear();
  }
}
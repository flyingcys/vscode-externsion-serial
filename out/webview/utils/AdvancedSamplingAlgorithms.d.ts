/**
 * 高级采样算法模块
 * 基于Serial-Studio的数据处理逻辑，实现高频数据的智能采样和抽稀
 *
 * 参考Serial-Studio源码：
 * - UI/Dashboard.cpp的smartInterval算法
 * - IO/FixedQueue的循环缓冲区设计
 * - 24Hz更新频率控制机制
 */
export interface DataPoint {
    x: number;
    y: number;
    timestamp: number;
}
export interface SamplingConfig {
    maxPointsPerSecond: number;
    adaptiveSampling: boolean;
    noiseThreshold: number;
    smoothingFactor: number;
    compressionRatio: number;
    enableLossyCompression: boolean;
}
export interface SamplingStats {
    originalPoints: number;
    sampledPoints: number;
    compressionRatio: number;
    averageInterval: number;
    peakDetected: number;
    noiseFiltered: number;
}
/**
 * 高级采样算法类 - 模拟Serial-Studio的数据处理管道
 */
export declare class AdvancedSamplingAlgorithms {
    private config;
    private stats;
    private lastPoints;
    private trendBuffer;
    private noiseBuffer;
    constructor(config?: Partial<SamplingConfig>);
    /**
     * 智能间隔计算 - 基于Serial-Studio的smartInterval算法
     * @param timeSeries 时间序列数据
     * @param multiplier 倍数因子
     * @returns 计算的智能间隔
     */
    calculateSmartInterval(timeSeries: number[], multiplier?: number): number;
    /**
     * 自适应采样算法
     * @param datasetId 数据集ID
     * @param points 输入数据点数组
     * @returns 采样后的数据点数组
     */
    adaptiveSampling(datasetId: string, points: DataPoint[]): DataPoint[];
    /**
     * 判断是否应该保留数据点
     * @param datasetId 数据集ID
     * @param point 当前数据点
     * @param lastPoint 上一个数据点
     * @returns 是否保留
     */
    private shouldKeepPoint;
    /**
     * 噪声检测算法
     * @param datasetId 数据集ID
     * @param point 数据点
     * @returns 是否为噪声
     */
    private isNoise;
    /**
     * 峰值检测算法
     * @param datasetId 数据集ID
     * @param point 数据点
     * @returns 是否为峰值
     */
    private isPeak;
    /**
     * 趋势变化检测
     * @param datasetId 数据集ID
     * @param point 数据点
     * @returns 是否为趋势变化点
     */
    private isTrendChange;
    /**
     * 固定间隔采样
     * @param points 输入数据点
     * @returns 采样后的数据点
     */
    private fixedIntervalSampling;
    /**
     * Douglas-Peucker抽稀算法 - 用于轨迹数据
     * @param points 输入点数组
     * @param epsilon 容差值
     * @returns 抽稀后的点数组
     */
    douglasPeuckerDecimation(points: DataPoint[], epsilon?: number): DataPoint[];
    private douglasPeuckerRecursive;
    /**
     * 计算点到直线的垂直距离
     * @param point 目标点
     * @param lineStart 直线起点
     * @param lineEnd 直线终点
     * @returns 垂直距离
     */
    private perpendicularDistance;
    /**
     * 数据平滑算法 - 指数移动平均
     * @param datasetId 数据集ID
     * @param points 输入数据点
     * @returns 平滑后的数据点
     */
    exponentialSmoothing(datasetId: string, points: DataPoint[]): DataPoint[];
    /**
     * 获取采样统计信息
     * @returns 统计信息
     */
    getStats(): SamplingStats;
    /**
     * 重置统计信息
     */
    resetStats(): void;
    /**
     * 更新配置
     * @param newConfig 新配置
     */
    updateConfig(newConfig: Partial<SamplingConfig>): void;
    /**
     * 清理缓存数据
     * @param datasetId 数据集ID（可选，不指定则清理所有）
     */
    clearCache(datasetId?: string): void;
    /**
     * 更新压缩比统计
     */
    private updateCompressionRatio;
}
/**
 * 创建默认采样算法实例
 */
export declare const createDefaultSampler: (config?: Partial<SamplingConfig>) => AdvancedSamplingAlgorithms;
/**
 * 高频数据特化采样器
 */
export declare const createHighFrequencySampler: () => AdvancedSamplingAlgorithms;
/**
 * 精密数据采样器（保真度优先）
 */
export declare const createPrecisionSampler: () => AdvancedSamplingAlgorithms;
//# sourceMappingURL=AdvancedSamplingAlgorithms.d.ts.map
/**
 * 批量导出管理器
 * 基于Serial Studio的批量导出功能设计
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { ExportConfig, ExportResult, ExportProgress, ExportError, StreamingExportConfig, StreamingExportHandle, DataPoint } from './types';
export interface BatchExportConfig {
    splitBy: 'time' | 'size' | 'count' | 'dataset';
    timeInterval?: string;
    maxSize?: number;
    maxRecords?: number;
    fileNamePattern?: string;
    outputDirectory: string;
    baseConfig: ExportConfig;
}
export interface BatchExportTask {
    id: string;
    config: BatchExportConfig;
    batches: BatchInfo[];
    currentBatch: number;
    totalBatches: number;
    startTime: number;
    completed: boolean;
    cancelled: boolean;
    results: BatchResult[];
}
export interface BatchInfo {
    id: string;
    name: string;
    filePath: string;
    dataRange: {
        startIndex: number;
        endIndex: number;
        startTime?: Date;
        endTime?: Date;
    };
    estimatedSize: number;
    recordCount: number;
}
export interface BatchResult {
    batchId: string;
    success: boolean;
    result?: ExportResult;
    error?: ExportError;
    duration: number;
}
export interface BatchExportProgress extends ExportProgress {
    batchId: string;
    batchName: string;
    currentBatch: number;
    totalBatches: number;
    completedBatches: number;
    failedBatches: number;
    overallPercentage: number;
}
/**
 * 批量导出管理器实现
 */
export declare class BatchExportManager extends EventEmitter {
    private activeTasks;
    private progressCallbacks;
    /**
     * 执行批量导出
     * @param config 批量导出配置
     * @returns 批量导出任务ID
     */
    startBatchExport(config: BatchExportConfig): Promise<string>;
    /**
     * 取消批量导出
     * @param taskId 任务ID
     */
    cancelBatchExport(taskId: string): Promise<void>;
    /**
     * 获取批量导出状态
     * @param taskId 任务ID
     * @returns 任务状态
     */
    getBatchExportStatus(taskId: string): BatchExportTask | null;
    /**
     * 注册进度回调
     * @param callback 进度回调函数
     */
    onProgress(callback: (progress: BatchExportProgress) => void): void;
    /**
     * 移除进度回调
     * @param callback 进度回调函数
     */
    offProgress(callback: (progress: BatchExportProgress) => void): void;
    /**
     * 执行批量导出任务
     * @param task 批量导出任务
     */
    private executeBatchExport;
    /**
     * 执行单个批次导出
     * @param config 导出配置
     * @param data 导出数据
     * @param batch 批次信息
     * @param task 批量导出任务
     * @returns 导出结果
     */
    private executeSingleBatch;
    /**
     * 创建批次
     * @param data 导出数据
     * @param config 批量导出配置
     * @returns 批次数组
     */
    private createBatches;
    /**
     * 按时间创建批次
     * @param data 导出数据
     * @param config 批量导出配置
     * @returns 批次数组
     */
    private createTimeBatches;
    /**
     * 按大小创建批次
     * @param data 导出数据
     * @param config 批量导出配置
     * @returns 批次数组
     */
    private createSizeBatches;
    /**
     * 按记录数创建批次
     * @param data 导出数据
     * @param config 批量导出配置
     * @returns 批次数组
     */
    private createCountBatches;
    /**
     * 按数据集创建批次
     * @param data 导出数据
     * @param config 批量导出配置
     * @returns 批次数组
     */
    private createDatasetBatches;
    /**
     * 创建批次信息
     * @param index 批次索引
     * @param records 记录数组
     * @param config 批量导出配置
     * @param timeRange 时间范围
     * @param customName 自定义名称
     * @returns 批次信息
     */
    private createBatchInfo;
    /**
     * 生成批次文件名
     * @param config 批量导出配置
     * @param index 批次索引
     * @param timeRange 时间范围
     * @param customName 自定义名称
     * @returns 文件名
     */
    private generateBatchFileName;
    /**
     * 解析时间间隔
     * @param interval 时间间隔字符串
     * @returns 毫秒数
     */
    private parseTimeInterval;
    /**
     * 估算记录大小
     * @param record 记录
     * @returns 字节数
     */
    private estimateRecordSize;
    /**
     * 估算批次大小
     * @param records 记录数组
     * @returns 字节数
     */
    private estimateBatchSize;
    /**
     * 提取数据集记录
     * @param data 导出数据
     * @param datasetId 数据集ID
     * @returns 记录数组
     */
    private extractDatasetRecords;
    /**
     * 准备导出数据
     * @param config 导出配置
     * @returns 导出数据
     */
    private prepareExportData;
    /**
     * 准备批次数据
     * @param config 导出配置
     * @param batch 批次信息
     * @returns 批次数据
     */
    private prepareBatchData;
    /**
     * 创建批次配置
     * @param baseConfig 基础配置
     * @param batch 批次信息
     * @returns 批次配置
     */
    private createBatchConfig;
    /**
     * 报告批次进度
     * @param task 批量导出任务
     * @param batch 当前批次
     * @param stage 阶段
     * @param percentage 百分比
     */
    private reportBatchProgress;
    /**
     * 计算批量导出预估时间
     * @param task 批量导出任务
     * @returns 预估剩余时间（毫秒）
     */
    private calculateBatchETA;
    /**
     * 生成批量导出报告
     * @param task 批量导出任务
     * @returns 导出报告
     */
    private generateBatchReport;
    /**
     * 验证批量导出配置
     * @param config 批量导出配置
     */
    private validateBatchConfig;
    /**
     * 生成模拟数据
     * @param count 记录数
     * @returns 记录数组
     */
    private generateMockData;
    /**
     * 生成任务ID
     * @returns 唯一任务ID
     */
    private generateTaskId;
    /**
     * 开始实时流式导出
     * 对应Serial-Studio的实时CSV导出功能
     * @param config 流式导出配置
     * @returns 导出句柄
     */
    startStreamingExport(config: StreamingExportConfig): Promise<StreamingExportHandle>;
    /**
     * 写入实时数据点
     * @param handle 导出句柄
     * @param dataPoint 数据点
     */
    writeRealtimeData(handle: StreamingExportHandle, dataPoint: DataPoint): Promise<void>;
    /**
     * 批量写入实时数据
     * @param handle 导出句柄
     * @param dataPoints 数据点数组
     */
    writeRealtimeDataBatch(handle: StreamingExportHandle, dataPoints: DataPoint[]): Promise<void>;
    /**
     * 暂停流式导出
     * @param handle 导出句柄
     */
    pauseStreamingExport(handle: StreamingExportHandle): void;
    /**
     * 恢复流式导出
     * @param handle 导出句柄
     */
    resumeStreamingExport(handle: StreamingExportHandle): void;
    /**
     * 取消流式导出
     * @param handle 导出句柄
     */
    cancelStreamingExport(handle: StreamingExportHandle): Promise<void>;
    /**
     * 完成流式导出
     * @param handle 导出句柄
     */
    finishStreamingExport(handle: StreamingExportHandle): Promise<void>;
    /**
     * 获取所有活跃的流式导出
     * @returns 活跃导出句柄数组
     */
    getActiveStreamingExports(): StreamingExportHandle[];
    /**
     * 监听流式导出进度
     * @param callback 进度回调
     */
    onStreamingProgress(callback: (handle: StreamingExportHandle) => void): void;
    /**
     * 监听流式导出事件
     * @param event 事件名称
     * @param callback 事件回调
     */
    onStreamingEvent(event: 'exportStarted' | 'exportPaused' | 'exportResumed' | 'exportCompleted' | 'exportCancelled' | 'exportError', callback: (handle: StreamingExportHandle, error?: Error) => void): void;
    /**
     * 创建增强的流式导出配置
     * 支持自定义格式和大数据处理
     * @param baseConfig 基础配置
     * @param customOptions 自定义选项
     * @param largeDataOptions 大数据处理选项
     * @returns 增强的流式导出配置
     */
    createEnhancedStreamingConfig(baseConfig: StreamingExportConfig, customOptions?: import('./types').CustomExportFormatOptions, largeDataOptions?: import('./types').LargeDataProcessingOptions): import('./types').EnhancedStreamingExportConfig;
}
/**
 * 获取批量导出管理器单例
 * @returns 批量导出管理器实例
 */
export declare function getBatchExportManager(): BatchExportManager;
//# sourceMappingURL=BatchExportManager.d.ts.map
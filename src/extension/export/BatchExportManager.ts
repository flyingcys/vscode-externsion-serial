/**
 * 批量导出管理器
 * 基于Serial Studio的批量导出功能设计
 */

import * as path from 'path';
import { EventEmitter } from 'events';
import {
  ExportConfig,
  ExportResult,
  ExportProgress,
  ExportData,
  ExportError,
  StreamingExportConfig,
  StreamingExportHandle,
  DataPoint
} from './types';
import { getExportManager } from './ExportManager';
import { getStreamingCSVExporter } from './StreamingCSVExporter';

// 批量导出配置
export interface BatchExportConfig {
  splitBy: 'time' | 'size' | 'count' | 'dataset';
  timeInterval?: string; // '1h', '6h', '12h', '1d'
  maxSize?: number; // MB
  maxRecords?: number;
  fileNamePattern?: string; // 文件名模式，支持占位符
  outputDirectory: string;
  baseConfig: ExportConfig;
}

// 批量导出任务
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

// 批次信息
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

// 批次结果
export interface BatchResult {
  batchId: string;
  success: boolean;
  result?: ExportResult;
  error?: ExportError;
  duration: number;
}

// 批量导出进度
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
export class BatchExportManager extends EventEmitter {
  private activeTasks: Map<string, BatchExportTask> = new Map();
  private progressCallbacks: Set<(progress: BatchExportProgress) => void> = new Set();

  /**
   * 执行批量导出
   * @param config 批量导出配置
   * @returns 批量导出任务ID
   */
  async startBatchExport(config: BatchExportConfig): Promise<string> {
    const taskId = this.generateTaskId();
    
    try {
      // 验证配置
      this.validateBatchConfig(config);
      
      // 准备导出数据
      const exportData = await this.prepareExportData(config.baseConfig);
      
      // 创建批次
      const batches = await this.createBatches(exportData, config);
      
      // 创建批量导出任务
      const task: BatchExportTask = {
        id: taskId,
        config,
        batches,
        currentBatch: 0,
        totalBatches: batches.length,
        startTime: Date.now(),
        completed: false,
        cancelled: false,
        results: []
      };
      
      this.activeTasks.set(taskId, task);
      
      // 开始执行批量导出
      this.executeBatchExport(task);
      
      return taskId;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ExportError(`Failed to start batch export: ${message}`);
    }
  }

  /**
   * 取消批量导出
   * @param taskId 任务ID
   */
  async cancelBatchExport(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.cancelled = true;
      this.emit('batchExportCancelled', taskId);
    }
  }

  /**
   * 获取批量导出状态
   * @param taskId 任务ID
   * @returns 任务状态
   */
  getBatchExportStatus(taskId: string): BatchExportTask | null {
    return this.activeTasks.get(taskId) || null;
  }

  /**
   * 注册进度回调
   * @param callback 进度回调函数
   */
  onProgress(callback: (progress: BatchExportProgress) => void): void {
    this.progressCallbacks.add(callback);
  }

  /**
   * 移除进度回调
   * @param callback 进度回调函数
   */
  offProgress(callback: (progress: BatchExportProgress) => void): void {
    this.progressCallbacks.delete(callback);
  }

  /**
   * 执行批量导出任务
   * @param task 批量导出任务
   */
  private async executeBatchExport(task: BatchExportTask): Promise<void> {
    const startTime = performance.now();
    
    try {
      for (let i = 0; i < task.batches.length; i++) {
        if (task.cancelled) {
          throw new ExportError('Batch export cancelled by user');
        }
        
        const batch = task.batches[i];
        task.currentBatch = i;
        
        // 报告批次开始
        this.reportBatchProgress(task, batch, 'preparing', 0);
        
        try {
          // 准备批次数据
          const batchData = await this.prepareBatchData(task.config.baseConfig, batch);
          
          // 创建批次配置
          const batchConfig = this.createBatchConfig(task.config.baseConfig, batch);
          
          // 执行批次导出
          const result = await this.executeSingleBatch(batchConfig, batchData, batch, task);
          
          // 记录成功结果
          task.results.push({
            batchId: batch.id,
            success: true,
            result,
            duration: performance.now() - startTime
          });
          
          this.reportBatchProgress(task, batch, 'finalizing', 100);
          
        } catch (error) {
          // 记录失败结果
          const message = error instanceof Error ? error.message : String(error);
          task.results.push({
            batchId: batch.id,
            success: false,
            error: error instanceof ExportError ? error : new ExportError(message),
            duration: performance.now() - startTime
          });
          
          // 根据配置决定是否继续
          if (task.config.baseConfig.processing?.stopOnError !== false) {
            throw error;
          }
        }
      }
      
      // 完成批量导出
      task.completed = true;
      this.activeTasks.delete(task.id);
      
      // 生成批量导出报告
      const report = this.generateBatchReport(task);
      
      this.emit('batchExportCompleted', {
        taskId: task.id,
        results: task.results,
        report
      });
      
    } catch (error) {
      task.cancelled = true;
      this.activeTasks.delete(task.id);
      
      const message = error instanceof Error ? error.message : String(error);
      this.emit('batchExportFailed', {
        taskId: task.id,
        error: error instanceof ExportError ? error : new ExportError(message),
        results: task.results
      });
    }
  }

  /**
   * 执行单个批次导出
   * @param config 导出配置
   * @param data 导出数据
   * @param batch 批次信息
   * @param task 批量导出任务
   * @returns 导出结果
   */
  private async executeSingleBatch(
    config: ExportConfig,
    data: ExportData,
    batch: BatchInfo,
    task: BatchExportTask
  ): Promise<ExportResult> {
    const exportManager = getExportManager();
    
    // 设置进度回调
    exportManager.onProgress((progress) => {
      this.reportBatchProgress(task, batch, progress.stage, progress.percentage);
    });
    
    try {
      const result = await exportManager.exportData(config);
      return result;
    } finally {
      // 清理进度回调
      exportManager.offProgress(() => {});
    }
  }

  /**
   * 创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private async createBatches(data: ExportData, config: BatchExportConfig): Promise<BatchInfo[]> {
    switch (config.splitBy) {
      case 'time':
        return this.createTimeBatches(data, config);
      
      case 'size':
        return this.createSizeBatches(data, config);
      
      case 'count':
        return this.createCountBatches(data, config);
      
      case 'dataset':
        return this.createDatasetBatches(data, config);
      
      default:
        throw new ExportError(`Unsupported split method: ${config.splitBy}`);
    }
  }

  /**
   * 按时间创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createTimeBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    const intervalMs = this.parseTimeInterval(config.timeInterval || '1h');
    
    // 假设第一列是时间戳
    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length === 0) {return batches;}
    
    let currentBatch: any[] = [];
    let currentStartTime: Date | null = null;
    let batchIndex = 0;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const timestamp = new Date(record[0]);
      
      if (!currentStartTime) {
        currentStartTime = timestamp;
      }
      
      // 检查是否需要创建新批次
      if (timestamp.getTime() - currentStartTime.getTime() >= intervalMs) {
        if (currentBatch.length > 0) {
          batches.push(this.createBatchInfo(
            batchIndex++,
            currentBatch,
            config,
            { startTime: currentStartTime, endTime: timestamp }
          ));
        }
        
        currentBatch = [];
        currentStartTime = timestamp;
      }
      
      currentBatch.push(record);
    }
    
    // 处理最后一个批次
    if (currentBatch.length > 0 && currentStartTime) {
      batches.push(this.createBatchInfo(
        batchIndex,
        currentBatch,
        config,
        { startTime: currentStartTime, endTime: new Date(currentBatch[currentBatch.length - 1][0]) }
      ));
    }
    
    return batches;
  }

  /**
   * 按大小创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createSizeBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    const maxSizeBytes = (config.maxSize || 50) * 1024 * 1024; // 转换为字节
    
    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length === 0) {return batches;}
    
    let currentBatch: any[] = [];
    let currentSize = 0;
    let batchIndex = 0;
    
    for (const record of records) {
      const recordSize = this.estimateRecordSize(record);
      
      // 检查是否需要创建新批次
      if (currentSize + recordSize > maxSizeBytes && currentBatch.length > 0) {
        batches.push(this.createBatchInfo(batchIndex++, currentBatch, config));
        currentBatch = [];
        currentSize = 0;
      }
      
      currentBatch.push(record);
      currentSize += recordSize;
    }
    
    // 处理最后一个批次
    if (currentBatch.length > 0) {
      batches.push(this.createBatchInfo(batchIndex, currentBatch, config));
    }
    
    return batches;
  }

  /**
   * 按记录数创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createCountBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    const maxRecords = config.maxRecords || 10000;
    
    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length === 0) {return batches;}
    
    let batchIndex = 0;
    
    for (let i = 0; i < records.length; i += maxRecords) {
      const batchRecords = records.slice(i, i + maxRecords);
      batches.push(this.createBatchInfo(batchIndex++, batchRecords, config));
    }
    
    return batches;
  }

  /**
   * 按数据集创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createDatasetBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    
    // 为每个数据集创建一个批次
    data.datasets.forEach((dataset, index) => {
      const batchRecords = this.extractDatasetRecords(data, dataset.id);
      if (batchRecords.length > 0) {
        batches.push(this.createBatchInfo(index, batchRecords, config, undefined, dataset.title));
      }
    });
    
    return batches;
  }

  /**
   * 创建批次信息
   * @param index 批次索引
   * @param records 记录数组
   * @param config 批量导出配置
   * @param timeRange 时间范围
   * @param customName 自定义名称
   * @returns 批次信息
   */
  private createBatchInfo(
    index: number,
    records: any[],
    config: BatchExportConfig,
    timeRange?: { startTime: Date; endTime: Date },
    customName?: string
  ): BatchInfo {
    const fileName = this.generateBatchFileName(config, index, timeRange, customName);
    const filePath = path.join(config.outputDirectory, fileName);
    
    return {
      id: `batch_${index}_${Date.now()}`,
      name: customName || `Batch ${index + 1}`,
      filePath,
      dataRange: {
        startIndex: 0,
        endIndex: records.length - 1,
        startTime: timeRange?.startTime,
        endTime: timeRange?.endTime
      },
      estimatedSize: this.estimateBatchSize(records),
      recordCount: records.length
    };
  }

  /**
   * 生成批次文件名
   * @param config 批量导出配置
   * @param index 批次索引
   * @param timeRange 时间范围
   * @param customName 自定义名称
   * @returns 文件名
   */
  private generateBatchFileName(
    config: BatchExportConfig,
    index: number,
    timeRange?: { startTime: Date; endTime: Date },
    customName?: string
  ): string {
    let pattern = config.fileNamePattern || '{base}_{index}';
    
    // 获取基础文件名（不含扩展名）
    const baseName = path.parse(config.baseConfig.file.name).name;
    const extension = path.parse(config.baseConfig.file.name).ext;
    
    // 替换占位符
    pattern = pattern
      .replace('{base}', baseName)
      .replace('{index}', String(index + 1).padStart(3, '0'))
      .replace('{name}', customName || `batch${index + 1}`)
      .replace('{timestamp}', new Date().toISOString().slice(0, 19).replace(/[:-]/g, ''));
    
    // 处理时间范围占位符
    if (timeRange) {
      pattern = pattern
        .replace('{startTime}', timeRange.startTime.toISOString().slice(0, 19).replace(/[:-]/g, ''))
        .replace('{endTime}', timeRange.endTime.toISOString().slice(0, 19).replace(/[:-]/g, ''))
        .replace('{startDate}', timeRange.startTime.toISOString().slice(0, 10))
        .replace('{endDate}', timeRange.endTime.toISOString().slice(0, 10));
    }
    
    return pattern + extension;
  }

  /**
   * 解析时间间隔
   * @param interval 时间间隔字符串
   * @returns 毫秒数
   */
  private parseTimeInterval(interval: string): number {
    const value = parseInt(interval);
    const unit = interval.slice(-1);
    
    switch (unit) {
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        throw new ExportError(`Invalid time interval: ${interval}`);
    }
  }

  /**
   * 估算记录大小
   * @param record 记录
   * @returns 字节数
   */
  private estimateRecordSize(record: any[]): number {
    return JSON.stringify(record).length * 2; // 粗略估算，UTF-8编码
  }

  /**
   * 估算批次大小
   * @param records 记录数组
   * @returns 字节数
   */
  private estimateBatchSize(records: any[]): number {
    if (records.length === 0) {return 0;}
    const sampleSize = Math.min(100, records.length);
    const sampleRecords = records.slice(0, sampleSize);
    const avgSize = sampleRecords.reduce((sum, record) => sum + this.estimateRecordSize(record), 0) / sampleSize;
    return Math.round(avgSize * records.length);
  }

  /**
   * 提取数据集记录
   * @param data 导出数据
   * @param datasetId 数据集ID
   * @returns 记录数组
   */
  private extractDatasetRecords(data: ExportData, _datasetId: string): any[] {
    // 这里需要根据实际数据结构来实现
    // 暂时返回所有记录的简化版本
    const records = Array.isArray(data.records) ? data.records : [];
    return records; // 实际应该过滤出特定数据集的记录
  }

  /**
   * 准备导出数据
   * @param config 导出配置
   * @returns 导出数据
   */
  private async prepareExportData(_config: ExportConfig): Promise<ExportData> {
    // 这里应该调用实际的数据获取逻辑
    // 暂时返回模拟数据
    return {
      headers: ['timestamp', 'dataset1', 'dataset2', 'dataset3'],
      records: this.generateMockData(10000),
      totalRecords: 10000,
      datasets: [
        { id: 'dataset1', title: 'Temperature', units: '°C', dataType: 'number', widget: 'gauge', group: 'sensors' },
        { id: 'dataset2', title: 'Humidity', units: '%', dataType: 'number', widget: 'gauge', group: 'sensors' },
        { id: 'dataset3', title: 'Pressure', units: 'hPa', dataType: 'number', widget: 'gauge', group: 'sensors' }
      ],
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        source: 'Serial-Studio VSCode Extension'
      }
    };
  }

  /**
   * 准备批次数据
   * @param config 导出配置
   * @param batch 批次信息
   * @returns 批次数据
   */
  private async prepareBatchData(config: ExportConfig, batch: BatchInfo): Promise<ExportData> {
    const fullData = await this.prepareExportData(config);
    
    // 提取批次范围内的数据
    const records = Array.isArray(fullData.records) ? fullData.records : [];
    const batchRecords = records.slice(batch.dataRange.startIndex, batch.dataRange.endIndex + 1);
    
    return {
      ...fullData,
      records: batchRecords,
      totalRecords: batchRecords.length
    };
  }

  /**
   * 创建批次配置
   * @param baseConfig 基础配置
   * @param batch 批次信息
   * @returns 批次配置
   */
  private createBatchConfig(baseConfig: ExportConfig, batch: BatchInfo): ExportConfig {
    return {
      ...baseConfig,
      file: {
        ...baseConfig.file,
        path: batch.filePath,
        name: path.basename(batch.filePath)
      }
    };
  }

  /**
   * 报告批次进度
   * @param task 批量导出任务
   * @param batch 当前批次
   * @param stage 阶段
   * @param percentage 百分比
   */
  private reportBatchProgress(
    task: BatchExportTask,
    batch: BatchInfo,
    stage: string,
    percentage: number
  ): void {
    const completedBatches = task.results.filter(r => r.success).length;
    const failedBatches = task.results.filter(r => !r.success).length;
    const overallPercentage = ((task.currentBatch + percentage / 100) / task.totalBatches) * 100;
    
    const progress: BatchExportProgress = {
      taskId: task.id,
      batchId: batch.id,
      batchName: batch.name,
      stage: stage as any,
      percentage,
      processedRecords: 0,
      totalRecords: batch.recordCount,
      estimatedTimeRemaining: this.calculateBatchETA(task),
      currentBatch: task.currentBatch + 1,
      totalBatches: task.totalBatches,
      completedBatches,
      failedBatches,
      overallPercentage,
      currentFile: batch.filePath
    };
    
    for (const callback of this.progressCallbacks) {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in batch progress callback:', error);
      }
    }
    
    this.emit('batchProgress', progress);
  }

  /**
   * 计算批量导出预估时间
   * @param task 批量导出任务
   * @returns 预估剩余时间（毫秒）
   */
  private calculateBatchETA(task: BatchExportTask): number {
    if (task.currentBatch === 0) {return 0;}
    
    const elapsed = Date.now() - task.startTime;
    const avgTimePerBatch = elapsed / (task.currentBatch + 1);
    const remainingBatches = task.totalBatches - task.currentBatch - 1;
    
    return Math.max(0, avgTimePerBatch * remainingBatches);
  }

  /**
   * 生成批量导出报告
   * @param task 批量导出任务
   * @returns 导出报告
   */
  private generateBatchReport(task: BatchExportTask): any {
    const successful = task.results.filter(r => r.success);
    const failed = task.results.filter(r => !r.success);
    const totalDuration = Date.now() - task.startTime;
    
    return {
      taskId: task.id,
      totalBatches: task.totalBatches,
      successfulBatches: successful.length,
      failedBatches: failed.length,
      totalDuration,
      averageBatchDuration: successful.length > 0 ? 
        successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0,
      results: task.results,
      generatedFiles: successful.map(r => r.result?.filePath).filter(Boolean),
      errors: failed.map(r => r.error)
    };
  }

  /**
   * 验证批量导出配置
   * @param config 批量导出配置
   */
  private validateBatchConfig(config: BatchExportConfig): void {
    if (!config.outputDirectory) {
      throw new ExportError('Output directory is required for batch export');
    }
    
    if (!config.splitBy) {
      throw new ExportError('Split method is required for batch export');
    }
    
    switch (config.splitBy) {
      case 'time':
        if (!config.timeInterval) {
          throw new ExportError('Time interval is required for time-based splitting');
        }
        break;
      
      case 'size':
        if (!config.maxSize || config.maxSize <= 0) {
          throw new ExportError('Max size must be greater than 0 for size-based splitting');
        }
        break;
      
      case 'count':
        if (!config.maxRecords || config.maxRecords <= 0) {
          throw new ExportError('Max records must be greater than 0 for count-based splitting');
        }
        break;
    }
  }

  /**
   * 生成模拟数据
   * @param count 记录数
   * @returns 记录数组
   */
  private generateMockData(count: number): any[][] {
    const records: any[][] = [];
    for (let i = 0; i < count; i++) {
      records.push([
        new Date(Date.now() - (count - i) * 1000).toISOString(),
        (20 + Math.random() * 10).toFixed(2),
        (40 + Math.random() * 20).toFixed(2),
        (1000 + Math.random() * 50).toFixed(2)
      ]);
    }
    return records;
  }

  /**
   * 生成任务ID
   * @returns 唯一任务ID
   */
  private generateTaskId(): string {
    return `batch_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // === 流式导出相关方法 ===

  /**
   * 开始实时流式导出
   * 对应Serial-Studio的实时CSV导出功能
   * @param config 流式导出配置
   * @returns 导出句柄
   */
  async startStreamingExport(config: StreamingExportConfig): Promise<StreamingExportHandle> {
    const streamingExporter = getStreamingCSVExporter();
    return await streamingExporter.startExport(config);
  }

  /**
   * 写入实时数据点
   * @param handle 导出句柄
   * @param dataPoint 数据点
   */
  async writeRealtimeData(handle: StreamingExportHandle, dataPoint: DataPoint): Promise<void> {
    const streamingExporter = getStreamingCSVExporter();
    await streamingExporter.writeDataPoint(handle, dataPoint);
  }

  /**
   * 批量写入实时数据
   * @param handle 导出句柄
   * @param dataPoints 数据点数组
   */
  async writeRealtimeDataBatch(handle: StreamingExportHandle, dataPoints: DataPoint[]): Promise<void> {
    const streamingExporter = getStreamingCSVExporter();
    await streamingExporter.writeDataBatch(handle, dataPoints);
  }

  /**
   * 暂停流式导出
   * @param handle 导出句柄
   */
  pauseStreamingExport(handle: StreamingExportHandle): void {
    const streamingExporter = getStreamingCSVExporter();
    streamingExporter.pauseExport(handle);
  }

  /**
   * 恢复流式导出
   * @param handle 导出句柄
   */
  resumeStreamingExport(handle: StreamingExportHandle): void {
    const streamingExporter = getStreamingCSVExporter();
    streamingExporter.resumeExport(handle);
  }

  /**
   * 取消流式导出
   * @param handle 导出句柄
   */
  async cancelStreamingExport(handle: StreamingExportHandle): Promise<void> {
    const streamingExporter = getStreamingCSVExporter();
    await streamingExporter.cancelExport(handle);
  }

  /**
   * 完成流式导出
   * @param handle 导出句柄
   */
  async finishStreamingExport(handle: StreamingExportHandle): Promise<void> {
    const streamingExporter = getStreamingCSVExporter();
    await streamingExporter.finishExport(handle);
  }

  /**
   * 获取所有活跃的流式导出
   * @returns 活跃导出句柄数组
   */
  getActiveStreamingExports(): StreamingExportHandle[] {
    const streamingExporter = getStreamingCSVExporter();
    return streamingExporter.getActiveExports();
  }

  /**
   * 监听流式导出进度
   * @param callback 进度回调
   */
  onStreamingProgress(callback: (handle: StreamingExportHandle) => void): void {
    const streamingExporter = getStreamingCSVExporter();
    streamingExporter.on('exportProgress', callback);
  }

  /**
   * 监听流式导出事件
   * @param event 事件名称
   * @param callback 事件回调
   */
  onStreamingEvent(
    event: 'exportStarted' | 'exportPaused' | 'exportResumed' | 'exportCompleted' | 'exportCancelled' | 'exportError',
    callback: (handle: StreamingExportHandle, error?: Error) => void
  ): void {
    const streamingExporter = getStreamingCSVExporter();
    streamingExporter.on(event, callback);
  }

  /**
   * 创建增强的流式导出配置
   * 支持自定义格式和大数据处理
   * @param baseConfig 基础配置
   * @param customOptions 自定义选项
   * @param largeDataOptions 大数据处理选项
   * @returns 增强的流式导出配置
   */
  createEnhancedStreamingConfig(
    baseConfig: StreamingExportConfig,
    customOptions?: import('./types').CustomExportFormatOptions,
    largeDataOptions?: import('./types').LargeDataProcessingOptions
  ): import('./types').EnhancedStreamingExportConfig {
    return {
      ...baseConfig,
      customFormatOptions: customOptions,
      largeDataProcessing: largeDataOptions
    };
  }
}

// 单例实例
let batchExportManagerInstance: BatchExportManager | null = null;

/**
 * 获取批量导出管理器单例
 * @returns 批量导出管理器实例
 */
export function getBatchExportManager(): BatchExportManager {
  if (!batchExportManagerInstance) {
    batchExportManagerInstance = new BatchExportManager();
  }
  return batchExportManagerInstance;
}
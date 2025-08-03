/**
 * 数据导出管理器
 * 基于Serial Studio的CSV导出架构设计
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import {
  ExportManager,
  ExportConfig,
  ExportResult,
  ExportProgress,
  ExportFormat,
  ExportFormatType,
  DataExporter,
  ExportTask,
  ExportData,
  ExportError,
  DataSourceType,
  FilterCondition,
  DataTransformation
} from './types';
import { DataFilter } from './DataFilter';
import { DataTransformer } from './DataTransformer';
import { CSVExporter } from './exporters/CSVExporter';
import { JSONExporter } from './exporters/JSONExporter';
import { ExcelExporter } from './exporters/ExcelExporter';
import { XMLExporter } from './exporters/XMLExporter';

/**
 * 导出管理器实现
 * 负责协调各种格式的导出器和数据处理
 */
export class ExportManagerImpl extends EventEmitter implements ExportManager {
  private formatRegistry: Map<ExportFormatType, DataExporter> = new Map();
  private activeExports: Map<string, ExportTask> = new Map();
  private progressCallbacks: Set<(progress: ExportProgress) => void> = new Set();
  
  constructor() {
    super();
    this.registerDefaultExporters();
  }

  /**
   * 注册默认的导出器
   */
  private registerDefaultExporters(): void {
    this.formatRegistry.set(ExportFormatType.CSV, new CSVExporter());
    this.formatRegistry.set(ExportFormatType.JSON, new JSONExporter());
    this.formatRegistry.set(ExportFormatType.EXCEL, new ExcelExporter());
    this.formatRegistry.set(ExportFormatType.XML, new XMLExporter());
  }

  /**
   * 执行数据导出
   * @param config 导出配置
   * @returns 导出结果
   */
  async exportData(config: ExportConfig): Promise<ExportResult> {
    const taskId = this.generateTaskId();
    const startTime = performance.now();
    
    try {
      // 验证配置
      this.validateConfig(config);
      
      // 创建导出任务
      const task: ExportTask = {
        id: taskId,
        config,
        startTime: Date.now(),
        cancelled: false
      };
      this.activeExports.set(taskId, task);
      
      // 获取导出器
      const exporter = this.getExporter(config.format.type);
      if (!exporter) {
        throw new ExportError(`Unsupported export format: ${config.format.type}`);
      }
      
      // 准备数据
      this.reportProgress(taskId, 'preparing', 0, 0, 0);
      const exportData = await this.prepareExportData(config);
      
      // 检查是否被取消
      if (this.isTaskCancelled(taskId)) {
        throw new ExportError('Export cancelled by user');
      }
      
      // 应用过滤和转换
      this.reportProgress(taskId, 'processing', 10, 0, exportData.totalRecords);
      const processedData = await this.processData(exportData, config, taskId);
      
      // 检查是否被取消
      if (this.isTaskCancelled(taskId)) {
        throw new ExportError('Export cancelled by user');
      }
      
      // 确保目录存在
      await this.ensureDirectoryExists(config.file.path);
      
      // 执行导出
      this.reportProgress(taskId, 'writing', 30, 0, processedData.totalRecords);
      
      // 为导出器设置进度回调
      const originalExporter = exporter as any;
      if (originalExporter.setProgressCallback) {
        originalExporter.setProgressCallback((percentage: number, processed: number) => {
          this.reportProgress(taskId, 'writing', 30 + percentage * 0.6, processed, processedData.totalRecords);
        });
      }
      
      const result = await exporter.exportData(processedData, config.file.path);
      
      // 完成处理
      this.reportProgress(taskId, 'finalizing', 100, result.recordCount, result.recordCount);
      
      // 清理任务
      this.activeExports.delete(taskId);
      
      // 计算总耗时
      const totalDuration = performance.now() - startTime;
      
      return {
        ...result,
        duration: totalDuration
      };
      
    } catch (error) {
      this.activeExports.delete(taskId);
      if (error instanceof ExportError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new ExportError(`Export failed: ${message}`);
    }
  }

  /**
   * 获取支持的导出格式
   * @returns 导出格式列表
   */
  getSupportedFormats(): ExportFormat[] {
    return Array.from(this.formatRegistry.keys()).map(type => ({
      type,
      name: this.getFormatName(type),
      extensions: this.getFormatExtensions(type),
      description: this.getFormatDescription(type),
      options: this.getFormatDefaultOptions(type)
    }));
  }

  /**
   * 注册进度回调
   * @param callback 进度回调函数
   */
  onProgress(callback: (progress: ExportProgress) => void): void {
    this.progressCallbacks.add(callback);
  }

  /**
   * 移除进度回调
   * @param callback 进度回调函数
   */
  offProgress(callback: (progress: ExportProgress) => void): void {
    this.progressCallbacks.delete(callback);
  }

  /**
   * 取消导出
   * @param taskId 任务ID
   */
  async cancelExport(taskId: string): Promise<void> {
    const task = this.activeExports.get(taskId);
    if (task) {
      task.cancelled = true;
      this.activeExports.delete(taskId);
      this.emit('exportCancelled', taskId);
    }
  }

  /**
   * 准备导出数据
   * @param config 导出配置
   * @returns 导出数据
   */
  private async prepareExportData(config: ExportConfig): Promise<ExportData> {
    // 这里需要从数据存储中获取数据
    // 暂时使用模拟数据，实际应该从 DataStore 获取
    const dataProvider = this.getDataProvider(config.dataSource.type);
    return await dataProvider.getData(config.dataSource);
  }

  /**
   * 获取数据提供者
   * @param sourceType 数据源类型
   * @returns 数据提供者
   */
  private getDataProvider(sourceType: DataSourceType): any {
    // 这里应该根据数据源类型返回相应的数据提供者
    // 暂时返回一个模拟的数据提供者
    return {
      async getData(source: any): Promise<ExportData> {
        // 模拟数据，实际应该从 DataStore 获取
        return {
          headers: ['timestamp', 'dataset1', 'dataset2', 'dataset3'],
          records: this.generateMockData(1000),
          totalRecords: 1000,
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
      },
      
      generateMockData: function*(count: number): Generator<any[], void, unknown> {
        for (let i = 0; i < count; i++) {
          yield [
            new Date(Date.now() - (count - i) * 1000).toISOString(),
            (20 + Math.random() * 10).toFixed(2),
            (40 + Math.random() * 20).toFixed(2),
            (1000 + Math.random() * 50).toFixed(2)
          ];
        }
      }
    };
  }

  /**
   * 处理数据（过滤和转换）
   * @param data 原始数据
   * @param config 导出配置
   * @param taskId 任务ID
   * @returns 处理后的数据
   */
  private async processData(data: ExportData, config: ExportConfig, taskId: string): Promise<ExportData> {
    let processedData = data;
    
    // 应用过滤器
    if (config.filters && Object.keys(config.filters).length > 0) {
      const filterConditions = this.buildFilterConditions(config.filters);
      if (filterConditions.length > 0) {
        const filter = new DataFilter(filterConditions);
        
        // 将异步迭代器转换为数组进行过滤
        const recordsArray = Array.isArray(processedData.records) 
          ? processedData.records 
          : await this.collectAsyncRecords(processedData.records);
        
        const filteredRecords = filter.filter(recordsArray);
        
        processedData = {
          ...processedData,
          records: filteredRecords,
          totalRecords: filteredRecords.length
        };
      }
    }
    
    // 应用数据转换
    if (config.processing) {
      const transformations = this.buildTransformations(config.processing);
      if (transformations.length > 0) {
        const transformer = new DataTransformer(transformations);
        
        // 确保我们有数组格式的记录
        const recordsArray = Array.isArray(processedData.records) 
          ? processedData.records 
          : await this.collectAsyncRecords(processedData.records);
        
        const transformedRecords = transformer.transform(recordsArray);
        
        processedData = {
          ...processedData,
          records: transformedRecords
        };
      }
    }
    
    return processedData;
  }

  /**
   * 收集异步记录为数组
   * @param asyncRecords 异步记录迭代器
   * @returns 记录数组
   */
  private async collectAsyncRecords(asyncRecords: AsyncIterable<any[]>): Promise<any[][]> {
    const records: any[][] = [];
    for await (const record of asyncRecords) {
      records.push(record);
    }
    return records;
  }

  /**
   * 构建过滤条件
   * @param filters 过滤配置
   * @returns 过滤条件数组
   */
  private buildFilterConditions(filters: any): FilterCondition[] {
    const conditions: FilterCondition[] = [];
    
    // 时间范围过滤
    if (filters.timeRange) {
      conditions.push({
        columnIndex: 0, // 假设第一列是时间戳
        operator: 'in_range',
        value: [filters.timeRange[0].getTime(), filters.timeRange[1].getTime()]
      });
    }
    
    // 数值范围过滤
    if (filters.valueRange) {
      conditions.push({
        columnIndex: 1, // 假设第二列是数值
        operator: 'in_range',
        value: filters.valueRange
      });
    }
    
    // 自定义条件
    if (filters.conditions) {
      conditions.push(...filters.conditions);
    }
    
    return conditions;
  }

  /**
   * 构建数据转换配置
   * @param processing 处理配置
   * @returns 转换配置数组
   */
  private buildTransformations(processing: any): DataTransformation[] {
    const transformations: DataTransformation[] = [];
    
    // 精度转换
    if (processing.precision !== undefined) {
      for (let i = 1; i < 4; i++) { // 假设列1-3是数值列
        transformations.push({
          type: 'precision_round',
          config: {
            columnIndex: i,
            precision: processing.precision
          }
        });
      }
    }
    
    return transformations;
  }

  /**
   * 获取导出器
   * @param formatType 格式类型
   * @returns 导出器实例
   */
  private getExporter(formatType: ExportFormatType): DataExporter | undefined {
    return this.formatRegistry.get(formatType);
  }

  /**
   * 报告进度
   * @param taskId 任务ID
   * @param stage 阶段
   * @param percentage 百分比
   * @param processedRecords 已处理记录数
   * @param totalRecords 总记录数
   */
  private reportProgress(
    taskId: string,
    stage: ExportProgress['stage'],
    percentage: number,
    processedRecords: number,
    totalRecords: number
  ): void {
    const task = this.activeExports.get(taskId);
    if (!task) {return;}
    
    const progress: ExportProgress = {
      taskId,
      stage,
      percentage: Math.min(100, Math.max(0, percentage)),
      processedRecords,
      totalRecords,
      estimatedTimeRemaining: this.calculateETA(percentage, task.startTime)
    };
    
    for (const callback of this.progressCallbacks) {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    }
    
    this.emit('progress', progress);
  }

  /**
   * 计算预估剩余时间
   * @param percentage 当前进度百分比
   * @param startTime 开始时间
   * @returns 预估剩余时间（毫秒）
   */
  private calculateETA(percentage: number, startTime: number): number {
    if (percentage <= 0) {return 0;}
    
    const elapsed = Date.now() - startTime;
    const totalEstimated = (elapsed / percentage) * 100;
    return Math.max(0, totalEstimated - elapsed);
  }

  /**
   * 生成任务ID
   * @returns 唯一任务ID
   */
  private generateTaskId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证导出配置
   * @param config 导出配置
   */
  private validateConfig(config: ExportConfig): void {
    if (!config.format.type) {
      throw new ExportError('Export format type is required');
    }
    
    if (!config.file.path) {
      throw new ExportError('Export file path is required');
    }
    
    if (!this.formatRegistry.has(config.format.type)) {
      throw new ExportError(`Unsupported format: ${config.format.type}`);
    }
    
    // 验证文件路径
    const directory = path.dirname(config.file.path);
    if (!fs.existsSync(directory)) {
      throw new ExportError(`Directory does not exist: ${directory}`);
    }
    
    // 检查文件是否已存在且不允许覆盖
    if (fs.existsSync(config.file.path) && !config.file.overwrite) {
      throw new ExportError(`File already exists: ${config.file.path}`);
    }
  }

  /**
   * 检查任务是否被取消
   * @param taskId 任务ID
   * @returns 是否被取消
   */
  private isTaskCancelled(taskId: string): boolean {
    const task = this.activeExports.get(taskId);
    return !task || task.cancelled;
  }

  /**
   * 确保目录存在
   * @param filePath 文件路径
   */
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const directory = path.dirname(filePath);
    try {
      await fs.promises.access(directory);
    } catch {
      await fs.promises.mkdir(directory, { recursive: true });
    }
  }

  /**
   * 获取格式名称
   * @param type 格式类型
   * @returns 格式名称
   */
  private getFormatName(type: ExportFormatType): string {
    const names = {
      [ExportFormatType.CSV]: 'CSV (Comma Separated Values)',
      [ExportFormatType.JSON]: 'JSON (JavaScript Object Notation)',
      [ExportFormatType.EXCEL]: 'Excel Workbook',
      [ExportFormatType.XML]: 'XML (eXtensible Markup Language)',
      [ExportFormatType.TXT]: 'Plain Text',
      [ExportFormatType.BINARY]: 'Binary Data'
    };
    return names[type] || type;
  }

  /**
   * 获取格式扩展名
   * @param type 格式类型
   * @returns 扩展名数组
   */
  private getFormatExtensions(type: ExportFormatType): string[] {
    const extensions = {
      [ExportFormatType.CSV]: ['.csv'],
      [ExportFormatType.JSON]: ['.json'],
      [ExportFormatType.EXCEL]: ['.xlsx', '.xls'],
      [ExportFormatType.XML]: ['.xml'],
      [ExportFormatType.TXT]: ['.txt'],
      [ExportFormatType.BINARY]: ['.bin', '.dat']
    };
    return extensions[type] || [];
  }

  /**
   * 获取格式描述
   * @param type 格式类型
   * @returns 格式描述
   */
  private getFormatDescription(type: ExportFormatType): string {
    const descriptions = {
      [ExportFormatType.CSV]: 'Comma-separated values format, compatible with Excel and most data analysis tools',
      [ExportFormatType.JSON]: 'JavaScript Object Notation, ideal for web applications and APIs',
      [ExportFormatType.EXCEL]: 'Microsoft Excel format with rich formatting and chart support',
      [ExportFormatType.XML]: 'Structured markup format for data exchange',
      [ExportFormatType.TXT]: 'Plain text format for simple data storage',
      [ExportFormatType.BINARY]: 'Binary format for efficient storage'
    };
    return descriptions[type] || 'Unknown format';
  }

  /**
   * 获取格式默认选项
   * @param type 格式类型
   * @returns 默认选项
   */
  private getFormatDefaultOptions(type: ExportFormatType): any {
    const defaultOptions = {
      [ExportFormatType.CSV]: {
        delimiter: ',',
        quote: '"',
        escape: '"',
        encoding: 'utf-8',
        includeHeader: true,
        lineEnding: '\n'
      },
      [ExportFormatType.JSON]: {
        pretty: true,
        indent: 2,
        encoding: 'utf-8',
        includeMetadata: true,
        arrayFormat: true
      },
      [ExportFormatType.EXCEL]: {
        sheetName: 'Data',
        includeChart: false,
        autoFitColumns: true,
        includeMetadata: true,
        dateFormat: 'yyyy-mm-dd hh:mm:ss'
      },
      [ExportFormatType.XML]: {
        rootElement: 'data',
        recordElement: 'record',
        includeAttributes: true,
        prettyPrint: true,
        encoding: 'utf-8'
      },
      [ExportFormatType.TXT]: {
        delimiter: '\t',
        encoding: 'utf-8',
        includeHeader: true,
        lineEnding: '\n'
      },
      [ExportFormatType.BINARY]: {
        encoding: 'binary',
        compression: false
      }
    };
    return defaultOptions[type] || {};
  }
}

// 单例实例
let exportManagerInstance: ExportManagerImpl | null = null;

/**
 * 获取导出管理器单例
 * @returns 导出管理器实例
 */
export function getExportManager(): ExportManagerImpl {
  if (!exportManagerInstance) {
    exportManagerInstance = new ExportManagerImpl();
  }
  return exportManagerInstance;
}
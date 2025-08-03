/**
 * 流式CSV导出器
 * 基于Serial-Studio的CSV::Export实现，支持实时流式导出
 * 
 * 主要特性：
 * - 后台异步处理，不阻塞主界面
 * - 高性能队列和批量写入
 * - 实时进度监控和取消功能
 * - 自定义导出格式和分隔符
 * - 大数据量分块处理
 * - 暂停和恢复功能
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import {
  StreamingExportConfig,
  StreamingExportHandle,
  StreamingExportProgress,
  StreamingExportState,
  DataPoint,
  TimestampFrame,
  CSVWriteOptions,
  ExportError
} from './types';

/**
 * 流式CSV导出句柄实现
 */
export class StreamingExportHandleImpl implements StreamingExportHandle {
  public readonly id: string;
  public readonly config: StreamingExportConfig;
  public readonly startTime: number;
  public state: StreamingExportState = StreamingExportState.PREPARING;
  public error: Error | null = null;
  public progress: StreamingExportProgress;
  public cancelled: boolean = false;
  public paused: boolean = false;

  constructor(id: string, config: StreamingExportConfig) {
    this.id = id;
    this.config = config;
    this.startTime = Date.now();
    this.progress = {
      handleId: id,
      state: StreamingExportState.PREPARING,
      percentage: 0,
      recordsWritten: 0,
      totalRecords: 0,
      bytesWritten: 0,
      estimatedTimeRemaining: 0,
      currentChunk: 0,
      totalChunks: 0
    };
  }

  updateProgress(progress: Partial<StreamingExportProgress>): void {
    this.progress = { ...this.progress, ...progress };
    this.state = progress.state || this.state;
  }
}

/**
 * 带时间戳的数据帧
 */
class TimestampFrameImpl implements TimestampFrame {
  public readonly data: DataPoint;
  public readonly rxDateTime: Date;

  constructor(dataPoint: DataPoint) {
    this.data = { ...dataPoint };
    this.rxDateTime = new Date();
  }
}

/**
 * 流式CSV导出器
 * 对应Serial-Studio的CSV::Export类
 */
export class StreamingCSVExporter extends EventEmitter {
  private static instance: StreamingCSVExporter | null = null;
  
  private activeExports: Map<string, StreamingExportHandleImpl> = new Map();
  private writeWorkers: Map<string, Worker> = new Map();
  private pendingFrames: Map<string, TimestampFrameImpl[]> = new Map();
  private writeTimers: Map<string, NodeJS.Timeout> = new Map();
  private fileStreams: Map<string, fs.WriteStream> = new Map();
  
  // 性能参数，对应Serial-Studio的实现
  private readonly QUEUE_MAX_CAPACITY = 8128;
  private readonly WRITE_INTERVAL_MS = 1000; // 1秒定时写入，对应Serial-Studio
  private readonly CHUNK_SIZE = 1000; // 每块处理的记录数
  private readonly BUFFER_PREALLOC_SIZE = 8128; // 预分配缓冲区大小

  private constructor() {
    super();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): StreamingCSVExporter {
    if (!StreamingCSVExporter.instance) {
      StreamingCSVExporter.instance = new StreamingCSVExporter();
    }
    return StreamingCSVExporter.instance;
  }

  /**
   * 开始流式导出
   * 对应Serial-Studio的hotpathTxFrame和创建文件逻辑
   */
  async startExport(config: StreamingExportConfig): Promise<StreamingExportHandle> {
    const handleId = this.generateHandleId();
    const handle = new StreamingExportHandleImpl(handleId, config);
    
    try {
      // 验证配置
      this.validateConfig(config);
      
      // 注册导出句柄
      this.activeExports.set(handleId, handle);
      this.pendingFrames.set(handleId, []);
      
      // 创建CSV文件并写入头部
      await this.createCSVFile(handle);
      
      // 启动后台写入定时器（对应Serial-Studio的QTimer）
      this.startWriteTimer(handle);
      
      // 更新状态
      handle.updateProgress({
        state: StreamingExportState.WRITING,
        percentage: 0
      });
      
      this.emit('exportStarted', handle);
      return handle;
      
    } catch (error) {
      this.activeExports.delete(handleId);
      this.pendingFrames.delete(handleId);
      handle.error = error as Error;
      handle.updateProgress({ state: StreamingExportState.ERROR });
      throw error;
    }
  }

  /**
   * 暂停导出
   */
  pauseExport(handle: StreamingExportHandle): void {
    const exportHandle = this.activeExports.get(handle.id);
    if (!exportHandle) {
      throw new ExportError(`Export handle not found: ${handle.id}`);
    }
    
    exportHandle.paused = true;
    exportHandle.updateProgress({ state: StreamingExportState.PAUSED });
    
    // 停止定时器
    const timer = this.writeTimers.get(handle.id);
    if (timer) {
      clearInterval(timer);
      this.writeTimers.delete(handle.id);
    }
    
    this.emit('exportPaused', exportHandle);
  }

  /**
   * 恢复导出
   */
  resumeExport(handle: StreamingExportHandle): void {
    const exportHandle = this.activeExports.get(handle.id);
    if (!exportHandle) {
      throw new ExportError(`Export handle not found: ${handle.id}`);
    }
    
    exportHandle.paused = false;
    exportHandle.updateProgress({ state: StreamingExportState.WRITING });
    
    // 重启定时器
    this.startWriteTimer(exportHandle);
    
    this.emit('exportResumed', exportHandle);
  }

  /**
   * 取消导出
   */
  async cancelExport(handle: StreamingExportHandle): Promise<void> {
    const exportHandle = this.activeExports.get(handle.id);
    if (!exportHandle) {
      return; // 已经被清理了
    }
    
    exportHandle.cancelled = true;
    exportHandle.updateProgress({ state: StreamingExportState.CANCELLED });
    
    // 清理资源
    await this.cleanupExport(handle.id);
    
    this.emit('exportCancelled', exportHandle);
  }

  /**
   * 写入数据点（对应Serial-Studio的hotpathTxFrame）
   */
  async writeDataPoint(handle: StreamingExportHandle, dataPoint: DataPoint): Promise<void> {
    const exportHandle = this.activeExports.get(handle.id);
    if (!exportHandle || exportHandle.cancelled || exportHandle.paused) {
      return;
    }
    
    // 创建时间戳帧
    const timestampFrame = new TimestampFrameImpl(dataPoint);
    
    // 添加到待写入队列
    const pendingQueue = this.pendingFrames.get(handle.id);
    if (pendingQueue) {
      if (pendingQueue.length >= this.QUEUE_MAX_CAPACITY) {
        // 队列满了，丢弃最旧的帧（对应Serial-Studio的行为）
        pendingQueue.shift();
        console.warn(`StreamingCSVExporter: Dropping frame (queue full) for handle ${handle.id}`);
      }
      pendingQueue.push(timestampFrame);
    }
  }

  /**
   * 批量写入数据点
   */
  async writeDataBatch(handle: StreamingExportHandle, batch: DataPoint[]): Promise<void> {
    for (const dataPoint of batch) {
      await this.writeDataPoint(handle, dataPoint);
    }
  }

  /**
   * 完成导出
   */
  async finishExport(handle: StreamingExportHandle): Promise<void> {
    const exportHandle = this.activeExports.get(handle.id);
    if (!exportHandle) {
      return;
    }
    
    // 写入所有剩余数据
    await this.writeAllPendingFrames(handle.id);
    
    // 更新状态
    exportHandle.updateProgress({
      state: StreamingExportState.COMPLETED,
      percentage: 100
    });
    
    // 清理资源
    await this.cleanupExport(handle.id);
    
    this.emit('exportCompleted', exportHandle);
  }

  /**
   * 获取所有活跃的导出句柄
   */
  getActiveExports(): StreamingExportHandle[] {
    return Array.from(this.activeExports.values());
  }

  /**
   * 创建CSV文件（对应Serial-Studio的createCsvFile）
   */
  private async createCSVFile(handle: StreamingExportHandleImpl): Promise<void> {
    const { config } = handle;
    
    // 生成文件名（基于时间戳，对应Serial-Studio）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const fileName = `${config.filePrefix || 'export'}_${timestamp}.csv`;
    
    // 确保目录存在
    const outputDir = config.outputDirectory || './exports';
    await fs.promises.mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, fileName);
    
    // 创建写入流
    const writeStream = fs.createWriteStream(filePath, {
      encoding: 'utf8',
      flags: 'w'
    });
    
    this.fileStreams.set(handle.id, writeStream);
    
    // 写入CSV头部
    await this.writeCSVHeader(handle, writeStream);
    
    // 更新配置中的实际文件路径
    handle.config.actualFilePath = filePath;
  }

  /**
   * 写入CSV头部（对应Serial-Studio的头部写入逻辑）
   */
  private async writeCSVHeader(handle: StreamingExportHandleImpl, writeStream: fs.WriteStream): Promise<void> {
    const { config } = handle;
    const options = config.csvOptions || this.getDefaultCSVOptions();
    
    let headerLine = '';
    
    // 时间戳列（对应Serial-Studio的"RX Date/Time"）
    if (config.includeTimestamp !== false) {
      headerLine += `"RX Date/Time"${options.delimiter}`;
    }
    
    // 数据列头部
    if (config.headers && config.headers.length > 0) {
      const headers = config.selectedFields && config.selectedFields.length > 0
        ? config.headers.filter((_, index) => config.selectedFields!.includes(index))
        : config.headers;
      
      headerLine += headers.map(header => 
        this.escapeCSVValue(header, options)
      ).join(options.delimiter);
    }
    
    headerLine += options.lineEnding || '\n';
    
    return new Promise((resolve, reject) => {
      writeStream.write(headerLine, 'utf8', (error) => {
        if (error) {reject(error);}
        else {resolve();}
      });
    });
  }

  /**
   * 启动写入定时器（对应Serial-Studio的QTimer）
   */
  private startWriteTimer(handle: StreamingExportHandleImpl): void {
    // 使用配置中的writeInterval，如果没有则使用默认值
    const interval = handle.config.writeInterval || this.WRITE_INTERVAL_MS;
    
    const timer = setInterval(() => {
      this.writeAllPendingFrames(handle.id).catch(error => {
        console.error(`Error writing pending frames for handle ${handle.id}:`, error);
        handle.error = error;
        handle.updateProgress({ state: StreamingExportState.ERROR });
        this.emit('exportError', handle, error);
      });
    }, interval);
    
    this.writeTimers.set(handle.id, timer);
  }

  /**
   * 写入所有待处理的帧（对应Serial-Studio的writeValues）
   */
  private async writeAllPendingFrames(handleId: string): Promise<void> {
    const handle = this.activeExports.get(handleId);
    const pendingQueue = this.pendingFrames.get(handleId);
    const writeStream = this.fileStreams.get(handleId);
    
    if (!handle || !pendingQueue || !writeStream || handle.cancelled || handle.paused) {
      return;
    }
    
    if (pendingQueue.length === 0) {
      return;
    }
    
    // 批量处理帧（移动到本地数组以避免并发问题）
    const framesToWrite = pendingQueue.splice(0, pendingQueue.length);
    
    try {
      // 分块写入以避免内存问题
      const chunkSize = handle.config.chunkSize || this.CHUNK_SIZE;
      const chunks = this.chunkArray(framesToWrite, chunkSize);
      
      for (let i = 0; i < chunks.length; i++) {
        if (handle.cancelled) {break;}
        
        const chunk = chunks[i];
        await this.writeFrameChunk(handle, writeStream, chunk);
        
        // 更新进度
        const progress = ((i + 1) / chunks.length) * 100;
        handle.updateProgress({
          percentage: Math.min(progress, 99), // 保留1%给完成状态
          recordsWritten: handle.progress.recordsWritten + chunk.length,
          currentChunk: i + 1,
          totalChunks: chunks.length,
          bytesWritten: handle.progress.bytesWritten + this.estimateChunkSize(chunk)
        });
        
        this.emit('exportProgress', handle);
      }
      
    } catch (error) {
      handle.error = error as Error;
      handle.updateProgress({ state: StreamingExportState.ERROR });
      this.emit('exportError', handle, error);
    }
  }

  /**
   * 写入帧块
   */
  private async writeFrameChunk(
    handle: StreamingExportHandleImpl, 
    writeStream: fs.WriteStream, 
    frames: TimestampFrameImpl[]
  ): Promise<void> {
    const { config } = handle;
    const options = config.csvOptions || this.getDefaultCSVOptions();
    
    let output = '';
    
    for (const frame of frames) {
      let line = '';
      
      // 写入时间戳（对应Serial-Studio的时间格式）
      if (config.includeTimestamp !== false) {
        const timestamp = frame.rxDateTime.toISOString().replace('T', ' ').replace('Z', '');
        line += `"${timestamp}"${options.delimiter}`;
      }
      
      // 写入数据字段
      const values = this.extractDataValues(frame.data, config);
      line += values.map(value => this.escapeCSVValue(value, options)).join(options.delimiter);
      line += options.lineEnding || '\n';
      
      output += line;
    }
    
    return new Promise((resolve, reject) => {
      writeStream.write(output, 'utf8', (error) => {
        if (error) {reject(error);}
        else {resolve();}
      });
    });
  }

  /**
   * 从数据点提取值
   */
  private extractDataValues(dataPoint: DataPoint, config: StreamingExportConfig): string[] {
    const values: string[] = [];
    
    if (dataPoint.values) {
      // 如果指定了字段选择
      if (config.selectedFields && config.selectedFields.length > 0) {
        for (const fieldIndex of config.selectedFields) {
          const value = dataPoint.values[fieldIndex];
          values.push(this.formatValue(value, config));
        }
      } else {
        // 使用所有字段
        for (const value of dataPoint.values) {
          values.push(this.formatValue(value, config));
        }
      }
    }
    
    return values;
  }

  /**
   * 格式化值
   */
  private formatValue(value: any, config: StreamingExportConfig): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'number') {
      // 应用精度设置
      if (config.precision !== undefined) {
        return value.toFixed(config.precision);
      }
    }
    
    return String(value);
  }

  /**
   * 转义CSV值
   */
  private escapeCSVValue(value: string, options: CSVWriteOptions): string {
    const str = String(value || '');
    const delimiter = options.delimiter || ',';
    const quote = options.quote || '"';
    const escape = options.escape || '"';
    
    // 如果包含分隔符、引号或换行符，需要转义
    if (str.includes(delimiter) || str.includes(quote) || str.includes('\n') || str.includes('\r')) {
      const escaped = str.replace(new RegExp(quote, 'g'), escape + quote);
      return quote + escaped + quote;
    }
    
    return str;
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 估算块大小（字节）
   */
  private estimateChunkSize(frames: TimestampFrameImpl[]): number {
    // 简单估算：平均每个字段10个字符
    return frames.length * 10 * (frames[0]?.data.values?.length || 1);
  }

  /**
   * 清理导出资源
   */
  private async cleanupExport(handleId: string): Promise<void> {
    // 停止定时器
    const timer = this.writeTimers.get(handleId);
    if (timer) {
      clearInterval(timer);
      this.writeTimers.delete(handleId);
    }
    
    // 关闭文件流
    const writeStream = this.fileStreams.get(handleId);
    if (writeStream) {
      return new Promise((resolve) => {
        writeStream.end(() => {
          this.fileStreams.delete(handleId);
          resolve();
        });
      });
    }
    
    // 清理其他资源
    this.activeExports.delete(handleId);
    this.pendingFrames.delete(handleId);
    this.writeWorkers.delete(handleId);
  }

  /**
   * 验证配置
   */
  private validateConfig(config: StreamingExportConfig): void {
    if (!config.outputDirectory) {
      throw new ExportError('Output directory is required');
    }
    
    if (config.selectedFields && config.headers) {
      const maxIndex = Math.max(...config.selectedFields);
      if (maxIndex >= config.headers.length) {
        throw new ExportError('Selected field index exceeds available headers');
      }
    }
  }

  /**
   * 生成句柄ID
   */
  private generateHandleId(): string {
    return `streaming_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取默认CSV选项
   */
  private getDefaultCSVOptions(): CSVWriteOptions {
    return {
      delimiter: ',',
      quote: '"',
      escape: '"',
      lineEnding: '\n',
      encoding: 'utf-8'
    };
  }
}

/**
 * 获取流式CSV导出器单例
 */
export function getStreamingCSVExporter(): StreamingCSVExporter {
  return StreamingCSVExporter.getInstance();
}
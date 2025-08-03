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
/// <reference types="node" />
import { EventEmitter } from 'events';
import { StreamingExportConfig, StreamingExportHandle, StreamingExportProgress, StreamingExportState, DataPoint } from './types';
/**
 * 流式CSV导出句柄实现
 */
export declare class StreamingExportHandleImpl implements StreamingExportHandle {
    readonly id: string;
    readonly config: StreamingExportConfig;
    readonly startTime: number;
    state: StreamingExportState;
    error: Error | null;
    progress: StreamingExportProgress;
    cancelled: boolean;
    paused: boolean;
    constructor(id: string, config: StreamingExportConfig);
    updateProgress(progress: Partial<StreamingExportProgress>): void;
}
/**
 * 流式CSV导出器
 * 对应Serial-Studio的CSV::Export类
 */
export declare class StreamingCSVExporter extends EventEmitter {
    private static instance;
    private activeExports;
    private writeWorkers;
    private pendingFrames;
    private writeTimers;
    private fileStreams;
    private readonly QUEUE_MAX_CAPACITY;
    private readonly WRITE_INTERVAL_MS;
    private readonly CHUNK_SIZE;
    private readonly BUFFER_PREALLOC_SIZE;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): StreamingCSVExporter;
    /**
     * 开始流式导出
     * 对应Serial-Studio的hotpathTxFrame和创建文件逻辑
     */
    startExport(config: StreamingExportConfig): Promise<StreamingExportHandle>;
    /**
     * 暂停导出
     */
    pauseExport(handle: StreamingExportHandle): void;
    /**
     * 恢复导出
     */
    resumeExport(handle: StreamingExportHandle): void;
    /**
     * 取消导出
     */
    cancelExport(handle: StreamingExportHandle): Promise<void>;
    /**
     * 写入数据点（对应Serial-Studio的hotpathTxFrame）
     */
    writeDataPoint(handle: StreamingExportHandle, dataPoint: DataPoint): Promise<void>;
    /**
     * 批量写入数据点
     */
    writeDataBatch(handle: StreamingExportHandle, batch: DataPoint[]): Promise<void>;
    /**
     * 完成导出
     */
    finishExport(handle: StreamingExportHandle): Promise<void>;
    /**
     * 获取所有活跃的导出句柄
     */
    getActiveExports(): StreamingExportHandle[];
    /**
     * 创建CSV文件（对应Serial-Studio的createCsvFile）
     */
    private createCSVFile;
    /**
     * 写入CSV头部（对应Serial-Studio的头部写入逻辑）
     */
    private writeCSVHeader;
    /**
     * 启动写入定时器（对应Serial-Studio的QTimer）
     */
    private startWriteTimer;
    /**
     * 写入所有待处理的帧（对应Serial-Studio的writeValues）
     */
    private writeAllPendingFrames;
    /**
     * 写入帧块
     */
    private writeFrameChunk;
    /**
     * 从数据点提取值
     */
    private extractDataValues;
    /**
     * 格式化值
     */
    private formatValue;
    /**
     * 转义CSV值
     */
    private escapeCSVValue;
    /**
     * 数组分块
     */
    private chunkArray;
    /**
     * 估算块大小（字节）
     */
    private estimateChunkSize;
    /**
     * 清理导出资源
     */
    private cleanupExport;
    /**
     * 验证配置
     */
    private validateConfig;
    /**
     * 生成句柄ID
     */
    private generateHandleId;
    /**
     * 获取默认CSV选项
     */
    private getDefaultCSVOptions;
}
/**
 * 获取流式CSV导出器单例
 */
export declare function getStreamingCSVExporter(): StreamingCSVExporter;
//# sourceMappingURL=StreamingCSVExporter.d.ts.map
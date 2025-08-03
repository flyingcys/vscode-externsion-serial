"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamingCSVExporter = exports.StreamingCSVExporter = exports.StreamingExportHandleImpl = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const types_1 = require("./types");
/**
 * 流式CSV导出句柄实现
 */
class StreamingExportHandleImpl {
    id;
    config;
    startTime;
    state = types_1.StreamingExportState.PREPARING;
    error = null;
    progress;
    cancelled = false;
    paused = false;
    constructor(id, config) {
        this.id = id;
        this.config = config;
        this.startTime = Date.now();
        this.progress = {
            handleId: id,
            state: types_1.StreamingExportState.PREPARING,
            percentage: 0,
            recordsWritten: 0,
            totalRecords: 0,
            bytesWritten: 0,
            estimatedTimeRemaining: 0,
            currentChunk: 0,
            totalChunks: 0
        };
    }
    updateProgress(progress) {
        this.progress = { ...this.progress, ...progress };
        this.state = progress.state || this.state;
    }
}
exports.StreamingExportHandleImpl = StreamingExportHandleImpl;
/**
 * 带时间戳的数据帧
 */
class TimestampFrameImpl {
    data;
    rxDateTime;
    constructor(dataPoint) {
        this.data = { ...dataPoint };
        this.rxDateTime = new Date();
    }
}
/**
 * 流式CSV导出器
 * 对应Serial-Studio的CSV::Export类
 */
class StreamingCSVExporter extends events_1.EventEmitter {
    static instance = null;
    activeExports = new Map();
    writeWorkers = new Map();
    pendingFrames = new Map();
    writeTimers = new Map();
    fileStreams = new Map();
    // 性能参数，对应Serial-Studio的实现
    QUEUE_MAX_CAPACITY = 8128;
    WRITE_INTERVAL_MS = 1000; // 1秒定时写入，对应Serial-Studio
    CHUNK_SIZE = 1000; // 每块处理的记录数
    BUFFER_PREALLOC_SIZE = 8128; // 预分配缓冲区大小
    constructor() {
        super();
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!StreamingCSVExporter.instance) {
            StreamingCSVExporter.instance = new StreamingCSVExporter();
        }
        return StreamingCSVExporter.instance;
    }
    /**
     * 开始流式导出
     * 对应Serial-Studio的hotpathTxFrame和创建文件逻辑
     */
    async startExport(config) {
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
                state: types_1.StreamingExportState.WRITING,
                percentage: 0
            });
            this.emit('exportStarted', handle);
            return handle;
        }
        catch (error) {
            this.activeExports.delete(handleId);
            this.pendingFrames.delete(handleId);
            handle.error = error;
            handle.updateProgress({ state: types_1.StreamingExportState.ERROR });
            throw error;
        }
    }
    /**
     * 暂停导出
     */
    pauseExport(handle) {
        const exportHandle = this.activeExports.get(handle.id);
        if (!exportHandle) {
            throw new types_1.ExportError(`Export handle not found: ${handle.id}`);
        }
        exportHandle.paused = true;
        exportHandle.updateProgress({ state: types_1.StreamingExportState.PAUSED });
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
    resumeExport(handle) {
        const exportHandle = this.activeExports.get(handle.id);
        if (!exportHandle) {
            throw new types_1.ExportError(`Export handle not found: ${handle.id}`);
        }
        exportHandle.paused = false;
        exportHandle.updateProgress({ state: types_1.StreamingExportState.WRITING });
        // 重启定时器
        this.startWriteTimer(exportHandle);
        this.emit('exportResumed', exportHandle);
    }
    /**
     * 取消导出
     */
    async cancelExport(handle) {
        const exportHandle = this.activeExports.get(handle.id);
        if (!exportHandle) {
            return; // 已经被清理了
        }
        exportHandle.cancelled = true;
        exportHandle.updateProgress({ state: types_1.StreamingExportState.CANCELLED });
        // 清理资源
        await this.cleanupExport(handle.id);
        this.emit('exportCancelled', exportHandle);
    }
    /**
     * 写入数据点（对应Serial-Studio的hotpathTxFrame）
     */
    async writeDataPoint(handle, dataPoint) {
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
    async writeDataBatch(handle, batch) {
        for (const dataPoint of batch) {
            await this.writeDataPoint(handle, dataPoint);
        }
    }
    /**
     * 完成导出
     */
    async finishExport(handle) {
        const exportHandle = this.activeExports.get(handle.id);
        if (!exportHandle) {
            return;
        }
        // 写入所有剩余数据
        await this.writeAllPendingFrames(handle.id);
        // 更新状态
        exportHandle.updateProgress({
            state: types_1.StreamingExportState.COMPLETED,
            percentage: 100
        });
        // 清理资源
        await this.cleanupExport(handle.id);
        this.emit('exportCompleted', exportHandle);
    }
    /**
     * 获取所有活跃的导出句柄
     */
    getActiveExports() {
        return Array.from(this.activeExports.values());
    }
    /**
     * 创建CSV文件（对应Serial-Studio的createCsvFile）
     */
    async createCSVFile(handle) {
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
    async writeCSVHeader(handle, writeStream) {
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
                ? config.headers.filter((_, index) => config.selectedFields.includes(index))
                : config.headers;
            headerLine += headers.map(header => this.escapeCSVValue(header, options)).join(options.delimiter);
        }
        headerLine += options.lineEnding || '\n';
        return new Promise((resolve, reject) => {
            writeStream.write(headerLine, 'utf8', (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * 启动写入定时器（对应Serial-Studio的QTimer）
     */
    startWriteTimer(handle) {
        // 使用配置中的writeInterval，如果没有则使用默认值
        const interval = handle.config.writeInterval || this.WRITE_INTERVAL_MS;
        const timer = setInterval(() => {
            this.writeAllPendingFrames(handle.id).catch(error => {
                console.error(`Error writing pending frames for handle ${handle.id}:`, error);
                handle.error = error;
                handle.updateProgress({ state: types_1.StreamingExportState.ERROR });
                this.emit('exportError', handle, error);
            });
        }, interval);
        this.writeTimers.set(handle.id, timer);
    }
    /**
     * 写入所有待处理的帧（对应Serial-Studio的writeValues）
     */
    async writeAllPendingFrames(handleId) {
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
                if (handle.cancelled) {
                    break;
                }
                const chunk = chunks[i];
                await this.writeFrameChunk(handle, writeStream, chunk);
                // 更新进度
                const progress = ((i + 1) / chunks.length) * 100;
                handle.updateProgress({
                    percentage: Math.min(progress, 99),
                    recordsWritten: handle.progress.recordsWritten + chunk.length,
                    currentChunk: i + 1,
                    totalChunks: chunks.length,
                    bytesWritten: handle.progress.bytesWritten + this.estimateChunkSize(chunk)
                });
                this.emit('exportProgress', handle);
            }
        }
        catch (error) {
            handle.error = error;
            handle.updateProgress({ state: types_1.StreamingExportState.ERROR });
            this.emit('exportError', handle, error);
        }
    }
    /**
     * 写入帧块
     */
    async writeFrameChunk(handle, writeStream, frames) {
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
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * 从数据点提取值
     */
    extractDataValues(dataPoint, config) {
        const values = [];
        if (dataPoint.values) {
            // 如果指定了字段选择
            if (config.selectedFields && config.selectedFields.length > 0) {
                for (const fieldIndex of config.selectedFields) {
                    const value = dataPoint.values[fieldIndex];
                    values.push(this.formatValue(value, config));
                }
            }
            else {
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
    formatValue(value, config) {
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
    escapeCSVValue(value, options) {
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
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * 估算块大小（字节）
     */
    estimateChunkSize(frames) {
        // 简单估算：平均每个字段10个字符
        return frames.length * 10 * (frames[0]?.data.values?.length || 1);
    }
    /**
     * 清理导出资源
     */
    async cleanupExport(handleId) {
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
    validateConfig(config) {
        if (!config.outputDirectory) {
            throw new types_1.ExportError('Output directory is required');
        }
        if (config.selectedFields && config.headers) {
            const maxIndex = Math.max(...config.selectedFields);
            if (maxIndex >= config.headers.length) {
                throw new types_1.ExportError('Selected field index exceeds available headers');
            }
        }
    }
    /**
     * 生成句柄ID
     */
    generateHandleId() {
        return `streaming_export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取默认CSV选项
     */
    getDefaultCSVOptions() {
        return {
            delimiter: ',',
            quote: '"',
            escape: '"',
            lineEnding: '\n',
            encoding: 'utf-8'
        };
    }
}
exports.StreamingCSVExporter = StreamingCSVExporter;
/**
 * 获取流式CSV导出器单例
 */
function getStreamingCSVExporter() {
    return StreamingCSVExporter.getInstance();
}
exports.getStreamingCSVExporter = getStreamingCSVExporter;
//# sourceMappingURL=StreamingCSVExporter.js.map
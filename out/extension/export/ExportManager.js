"use strict";
/**
 * 数据导出管理器
 * 基于Serial Studio的CSV导出架构设计
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
exports.getExportManager = exports.ExportManagerImpl = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const types_1 = require("./types");
const DataFilter_1 = require("./DataFilter");
const DataTransformer_1 = require("./DataTransformer");
const CSVExporter_1 = require("./exporters/CSVExporter");
const JSONExporter_1 = require("./exporters/JSONExporter");
const ExcelExporter_1 = require("./exporters/ExcelExporter");
const XMLExporter_1 = require("./exporters/XMLExporter");
/**
 * 导出管理器实现
 * 负责协调各种格式的导出器和数据处理
 */
class ExportManagerImpl extends events_1.EventEmitter {
    formatRegistry = new Map();
    activeExports = new Map();
    progressCallbacks = new Set();
    constructor() {
        super();
        this.registerDefaultExporters();
    }
    /**
     * 注册默认的导出器
     */
    registerDefaultExporters() {
        this.formatRegistry.set(types_1.ExportFormatType.CSV, new CSVExporter_1.CSVExporter());
        this.formatRegistry.set(types_1.ExportFormatType.JSON, new JSONExporter_1.JSONExporter());
        this.formatRegistry.set(types_1.ExportFormatType.EXCEL, new ExcelExporter_1.ExcelExporter());
        this.formatRegistry.set(types_1.ExportFormatType.XML, new XMLExporter_1.XMLExporter());
    }
    /**
     * 执行数据导出
     * @param config 导出配置
     * @returns 导出结果
     */
    async exportData(config) {
        const taskId = this.generateTaskId();
        const startTime = performance.now();
        try {
            // 验证配置
            this.validateConfig(config);
            // 创建导出任务
            const task = {
                id: taskId,
                config,
                startTime: Date.now(),
                cancelled: false
            };
            this.activeExports.set(taskId, task);
            // 获取导出器
            const exporter = this.getExporter(config.format.type);
            if (!exporter) {
                throw new types_1.ExportError(`Unsupported export format: ${config.format.type}`);
            }
            // 准备数据
            this.reportProgress(taskId, 'preparing', 0, 0, 0);
            const exportData = await this.prepareExportData(config);
            // 检查是否被取消
            if (this.isTaskCancelled(taskId)) {
                throw new types_1.ExportError('Export cancelled by user');
            }
            // 应用过滤和转换
            this.reportProgress(taskId, 'processing', 10, 0, exportData.totalRecords);
            const processedData = await this.processData(exportData, config, taskId);
            // 检查是否被取消
            if (this.isTaskCancelled(taskId)) {
                throw new types_1.ExportError('Export cancelled by user');
            }
            // 确保目录存在
            await this.ensureDirectoryExists(config.file.path);
            // 执行导出
            this.reportProgress(taskId, 'writing', 30, 0, processedData.totalRecords);
            // 为导出器设置进度回调
            const originalExporter = exporter;
            if (originalExporter.setProgressCallback) {
                originalExporter.setProgressCallback((percentage, processed) => {
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
        }
        catch (error) {
            this.activeExports.delete(taskId);
            if (error instanceof types_1.ExportError) {
                throw error;
            }
            const message = error instanceof Error ? error.message : String(error);
            throw new types_1.ExportError(`Export failed: ${message}`);
        }
    }
    /**
     * 获取支持的导出格式
     * @returns 导出格式列表
     */
    getSupportedFormats() {
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
    onProgress(callback) {
        this.progressCallbacks.add(callback);
    }
    /**
     * 移除进度回调
     * @param callback 进度回调函数
     */
    offProgress(callback) {
        this.progressCallbacks.delete(callback);
    }
    /**
     * 取消导出
     * @param taskId 任务ID
     */
    async cancelExport(taskId) {
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
    async prepareExportData(config) {
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
    getDataProvider(sourceType) {
        // 这里应该根据数据源类型返回相应的数据提供者
        // 暂时返回一个模拟的数据提供者
        return {
            async getData(source) {
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
            generateMockData: function* (count) {
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
    async processData(data, config, taskId) {
        let processedData = data;
        // 应用过滤器
        if (config.filters && Object.keys(config.filters).length > 0) {
            const filterConditions = this.buildFilterConditions(config.filters);
            if (filterConditions.length > 0) {
                const filter = new DataFilter_1.DataFilter(filterConditions);
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
                const transformer = new DataTransformer_1.DataTransformer(transformations);
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
    async collectAsyncRecords(asyncRecords) {
        const records = [];
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
    buildFilterConditions(filters) {
        const conditions = [];
        // 时间范围过滤
        if (filters.timeRange) {
            conditions.push({
                columnIndex: 0,
                operator: 'in_range',
                value: [filters.timeRange[0].getTime(), filters.timeRange[1].getTime()]
            });
        }
        // 数值范围过滤
        if (filters.valueRange) {
            conditions.push({
                columnIndex: 1,
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
    buildTransformations(processing) {
        const transformations = [];
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
    getExporter(formatType) {
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
    reportProgress(taskId, stage, percentage, processedRecords, totalRecords) {
        const task = this.activeExports.get(taskId);
        if (!task) {
            return;
        }
        const progress = {
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
            }
            catch (error) {
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
    calculateETA(percentage, startTime) {
        if (percentage <= 0) {
            return 0;
        }
        const elapsed = Date.now() - startTime;
        const totalEstimated = (elapsed / percentage) * 100;
        return Math.max(0, totalEstimated - elapsed);
    }
    /**
     * 生成任务ID
     * @returns 唯一任务ID
     */
    generateTaskId() {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 验证导出配置
     * @param config 导出配置
     */
    validateConfig(config) {
        if (!config.format.type) {
            throw new types_1.ExportError('Export format type is required');
        }
        if (!config.file.path) {
            throw new types_1.ExportError('Export file path is required');
        }
        if (!this.formatRegistry.has(config.format.type)) {
            throw new types_1.ExportError(`Unsupported format: ${config.format.type}`);
        }
        // 验证文件路径
        const directory = path.dirname(config.file.path);
        if (!fs.existsSync(directory)) {
            throw new types_1.ExportError(`Directory does not exist: ${directory}`);
        }
        // 检查文件是否已存在且不允许覆盖
        if (fs.existsSync(config.file.path) && !config.file.overwrite) {
            throw new types_1.ExportError(`File already exists: ${config.file.path}`);
        }
    }
    /**
     * 检查任务是否被取消
     * @param taskId 任务ID
     * @returns 是否被取消
     */
    isTaskCancelled(taskId) {
        const task = this.activeExports.get(taskId);
        return !task || task.cancelled;
    }
    /**
     * 确保目录存在
     * @param filePath 文件路径
     */
    async ensureDirectoryExists(filePath) {
        const directory = path.dirname(filePath);
        try {
            await fs.promises.access(directory);
        }
        catch {
            await fs.promises.mkdir(directory, { recursive: true });
        }
    }
    /**
     * 获取格式名称
     * @param type 格式类型
     * @returns 格式名称
     */
    getFormatName(type) {
        const names = {
            [types_1.ExportFormatType.CSV]: 'CSV (Comma Separated Values)',
            [types_1.ExportFormatType.JSON]: 'JSON (JavaScript Object Notation)',
            [types_1.ExportFormatType.EXCEL]: 'Excel Workbook',
            [types_1.ExportFormatType.XML]: 'XML (eXtensible Markup Language)',
            [types_1.ExportFormatType.TXT]: 'Plain Text',
            [types_1.ExportFormatType.BINARY]: 'Binary Data'
        };
        return names[type] || type;
    }
    /**
     * 获取格式扩展名
     * @param type 格式类型
     * @returns 扩展名数组
     */
    getFormatExtensions(type) {
        const extensions = {
            [types_1.ExportFormatType.CSV]: ['.csv'],
            [types_1.ExportFormatType.JSON]: ['.json'],
            [types_1.ExportFormatType.EXCEL]: ['.xlsx', '.xls'],
            [types_1.ExportFormatType.XML]: ['.xml'],
            [types_1.ExportFormatType.TXT]: ['.txt'],
            [types_1.ExportFormatType.BINARY]: ['.bin', '.dat']
        };
        return extensions[type] || [];
    }
    /**
     * 获取格式描述
     * @param type 格式类型
     * @returns 格式描述
     */
    getFormatDescription(type) {
        const descriptions = {
            [types_1.ExportFormatType.CSV]: 'Comma-separated values format, compatible with Excel and most data analysis tools',
            [types_1.ExportFormatType.JSON]: 'JavaScript Object Notation, ideal for web applications and APIs',
            [types_1.ExportFormatType.EXCEL]: 'Microsoft Excel format with rich formatting and chart support',
            [types_1.ExportFormatType.XML]: 'Structured markup format for data exchange',
            [types_1.ExportFormatType.TXT]: 'Plain text format for simple data storage',
            [types_1.ExportFormatType.BINARY]: 'Binary format for efficient storage'
        };
        return descriptions[type] || 'Unknown format';
    }
    /**
     * 获取格式默认选项
     * @param type 格式类型
     * @returns 默认选项
     */
    getFormatDefaultOptions(type) {
        const defaultOptions = {
            [types_1.ExportFormatType.CSV]: {
                delimiter: ',',
                quote: '"',
                escape: '"',
                encoding: 'utf-8',
                includeHeader: true,
                lineEnding: '\n'
            },
            [types_1.ExportFormatType.JSON]: {
                pretty: true,
                indent: 2,
                encoding: 'utf-8',
                includeMetadata: true,
                arrayFormat: true
            },
            [types_1.ExportFormatType.EXCEL]: {
                sheetName: 'Data',
                includeChart: false,
                autoFitColumns: true,
                includeMetadata: true,
                dateFormat: 'yyyy-mm-dd hh:mm:ss'
            },
            [types_1.ExportFormatType.XML]: {
                rootElement: 'data',
                recordElement: 'record',
                includeAttributes: true,
                prettyPrint: true,
                encoding: 'utf-8'
            },
            [types_1.ExportFormatType.TXT]: {
                delimiter: '\t',
                encoding: 'utf-8',
                includeHeader: true,
                lineEnding: '\n'
            },
            [types_1.ExportFormatType.BINARY]: {
                encoding: 'binary',
                compression: false
            }
        };
        return defaultOptions[type] || {};
    }
}
exports.ExportManagerImpl = ExportManagerImpl;
// 单例实例
let exportManagerInstance = null;
/**
 * 获取导出管理器单例
 * @returns 导出管理器实例
 */
function getExportManager() {
    if (!exportManagerInstance) {
        exportManagerInstance = new ExportManagerImpl();
    }
    return exportManagerInstance;
}
exports.getExportManager = getExportManager;
//# sourceMappingURL=ExportManager.js.map
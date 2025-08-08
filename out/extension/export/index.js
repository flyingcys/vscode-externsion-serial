"use strict";
/**
 * 数据导出模块入口文件
 * 导出所有数据导出相关的类和接口
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnhancedStreamingConfig = exports.finishStreamingExport = exports.writeStreamingData = exports.quickStreamingExport = exports.createStreamingCSVExport = exports.quickExportXML = exports.quickExportExcel = exports.quickExportJSON = exports.quickExportCSV = exports.createExportManager = exports.XMLExporter = exports.ExcelExporter = exports.JSONExporter = exports.CSVExporter = exports.DataTransformer = exports.DataFilter = exports.getStreamingCSVExporter = exports.StreamingCSVExporter = exports.getBatchExportManager = exports.BatchExportManager = exports.getExportManager = exports.ExportManagerImpl = void 0;
// 类型定义
__exportStar(require("./types"), exports);
// 核心管理器
var ExportManager_1 = require("./ExportManager");
Object.defineProperty(exports, "ExportManagerImpl", { enumerable: true, get: function () { return ExportManager_1.ExportManagerImpl; } });
Object.defineProperty(exports, "getExportManager", { enumerable: true, get: function () { return ExportManager_1.getExportManager; } });
// 批量导出管理器
var BatchExportManager_1 = require("./BatchExportManager");
Object.defineProperty(exports, "BatchExportManager", { enumerable: true, get: function () { return BatchExportManager_1.BatchExportManager; } });
var BatchExportManager_2 = require("./BatchExportManager");
Object.defineProperty(exports, "getBatchExportManager", { enumerable: true, get: function () { return BatchExportManager_2.getBatchExportManager; } });
// 流式导出管理器（对应Serial-Studio的CSV::Export）
var StreamingCSVExporter_1 = require("./StreamingCSVExporter");
Object.defineProperty(exports, "StreamingCSVExporter", { enumerable: true, get: function () { return StreamingCSVExporter_1.StreamingCSVExporter; } });
Object.defineProperty(exports, "getStreamingCSVExporter", { enumerable: true, get: function () { return StreamingCSVExporter_1.getStreamingCSVExporter; } });
// 数据处理器
var DataFilter_1 = require("./DataFilter");
Object.defineProperty(exports, "DataFilter", { enumerable: true, get: function () { return DataFilter_1.DataFilter; } });
var DataTransformer_1 = require("./DataTransformer");
Object.defineProperty(exports, "DataTransformer", { enumerable: true, get: function () { return DataTransformer_1.DataTransformer; } });
// 导出器
var CSVExporter_1 = require("./exporters/CSVExporter");
Object.defineProperty(exports, "CSVExporter", { enumerable: true, get: function () { return CSVExporter_1.CSVExporter; } });
var JSONExporter_1 = require("./exporters/JSONExporter");
Object.defineProperty(exports, "JSONExporter", { enumerable: true, get: function () { return JSONExporter_1.JSONExporter; } });
var ExcelExporter_1 = require("./exporters/ExcelExporter");
Object.defineProperty(exports, "ExcelExporter", { enumerable: true, get: function () { return ExcelExporter_1.ExcelExporter; } });
var XMLExporter_1 = require("./exporters/XMLExporter");
Object.defineProperty(exports, "XMLExporter", { enumerable: true, get: function () { return XMLExporter_1.XMLExporter; } });
// 便利函数
__exportStar(require("./utils"), exports);
/**
 * 创建默认配置的导出管理器
 * @returns 导出管理器实例
 */
async function createExportManager() {
    const { getExportManager } = await Promise.resolve().then(() => __importStar(require('./ExportManager')));
    return getExportManager();
}
exports.createExportManager = createExportManager;
/**
 * 快速导出数据到CSV
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
async function quickExportCSV(data, headers, filePath) {
    const { CSVExporter } = await Promise.resolve().then(() => __importStar(require('./exporters/CSVExporter')));
    const exporter = new CSVExporter();
    return await exporter.exportData({
        headers,
        records: data,
        totalRecords: data.length,
        datasets: []
    }, filePath);
}
exports.quickExportCSV = quickExportCSV;
/**
 * 快速导出数据到JSON
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
async function quickExportJSON(data, headers, filePath) {
    const { JSONExporter } = await Promise.resolve().then(() => __importStar(require('./exporters/JSONExporter')));
    const exporter = new JSONExporter();
    return await exporter.exportData({
        headers,
        records: data,
        totalRecords: data.length,
        datasets: []
    }, filePath);
}
exports.quickExportJSON = quickExportJSON;
/**
 * 快速导出数据到Excel
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
async function quickExportExcel(data, headers, filePath) {
    const { ExcelExporter } = await Promise.resolve().then(() => __importStar(require('./exporters/ExcelExporter')));
    const exporter = new ExcelExporter();
    return await exporter.exportData({
        headers,
        records: data,
        totalRecords: data.length,
        datasets: []
    }, filePath);
}
exports.quickExportExcel = quickExportExcel;
/**
 * 快速导出数据到XML
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
async function quickExportXML(data, headers, filePath) {
    const { XMLExporter } = await Promise.resolve().then(() => __importStar(require('./exporters/XMLExporter')));
    const exporter = new XMLExporter();
    return await exporter.exportData({
        headers,
        records: data,
        totalRecords: data.length,
        datasets: []
    }, filePath);
}
exports.quickExportXML = quickExportXML;
// === 流式导出快速功能（对应Serial-Studio的实时导出） ===
/**
 * 创建流式CSV导出
 * 对应Serial-Studio的实时CSV导出功能
 * @param config 流式导出配置
 * @returns 导出句柄
 */
async function createStreamingCSVExport(config) {
    const { getStreamingCSVExporter } = await Promise.resolve().then(() => __importStar(require('./StreamingCSVExporter')));
    const exporter = getStreamingCSVExporter();
    return await exporter.startExport(config);
}
exports.createStreamingCSVExport = createStreamingCSVExport;
/**
 * 快速启动实时数据流式导出
 * @param outputDirectory 输出目录
 * @param headers 数据字段头部
 * @param options 可选配置
 * @returns 导出句柄
 */
async function quickStreamingExport(outputDirectory, headers, options) {
    const config = {
        outputDirectory,
        headers,
        selectedFields: headers.map((_, index) => index),
        includeTimestamp: true,
        csvOptions: {
            delimiter: ',',
            quote: '"',
            escape: '"',
            lineEnding: '\n',
            encoding: 'utf-8'
        },
        bufferSize: 8192,
        writeInterval: 1000,
        chunkSize: 1000,
        ...options
    };
    return await createStreamingCSVExport(config);
}
exports.quickStreamingExport = quickStreamingExport;
/**
 * 写入实时数据到流式导出
 * @param handle 导出句柄
 * @param values 数据值数组
 * @param timestamp 时间戳（可选）
 */
async function writeStreamingData(handle, values, timestamp) {
    const { getStreamingCSVExporter } = await Promise.resolve().then(() => __importStar(require('./StreamingCSVExporter')));
    const exporter = getStreamingCSVExporter();
    const dataPoint = {
        timestamp,
        values,
        metadata: {}
    };
    await exporter.writeDataPoint(handle, dataPoint);
}
exports.writeStreamingData = writeStreamingData;
/**
 * 完成流式导出
 * @param handle 导出句柄
 */
async function finishStreamingExport(handle) {
    const { getStreamingCSVExporter } = await Promise.resolve().then(() => __importStar(require('./StreamingCSVExporter')));
    const exporter = getStreamingCSVExporter();
    await exporter.finishExport(handle);
}
exports.finishStreamingExport = finishStreamingExport;
/**
 * 创建增强的流式导出配置
 * 支持自定义格式和大数据处理优化
 * @param baseConfig 基础配置
 * @param options 增强选项
 * @returns 增强配置
 */
function createEnhancedStreamingConfig(baseConfig, options) {
    const enhancedConfig = {
        ...baseConfig,
        customFormatOptions: {
            fieldSelection: {
                enabled: true,
                selectedFields: baseConfig.selectedFields || [],
                fieldOrder: baseConfig.selectedFields || []
            },
            customDelimiter: {
                enabled: !!options?.customDelimiter,
                delimiter: options?.customDelimiter || baseConfig.csvOptions?.delimiter || ',',
                customQuote: baseConfig.csvOptions?.quote || '"',
                customEscape: baseConfig.csvOptions?.escape || '"'
            },
            dataFiltering: {
                enabled: false
            },
            dataTransformation: {
                enabled: false,
                transformations: []
            }
        },
        largeDataProcessing: {
            chunkExport: {
                enabled: true,
                chunkSize: baseConfig.chunkSize || 1000,
                maxMemoryUsage: options?.maxMemoryUsage || 100
            },
            compression: {
                enabled: options?.enableCompression || false,
                algorithm: 'gzip',
                level: 6
            },
            pauseResume: {
                enabled: options?.enablePauseResume !== false,
                autoSaveInterval: 5000
            }
        }
    };
    return enhancedConfig;
}
exports.createEnhancedStreamingConfig = createEnhancedStreamingConfig;
//# sourceMappingURL=index.js.map
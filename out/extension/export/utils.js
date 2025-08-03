"use strict";
/**
 * 导出工具函数
 * 提供各种导出相关的便利功能
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
exports.createExportSummary = exports.estimateExportSize = exports.validateDataIntegrity = exports.cleanupTempFile = exports.getTempFilePath = exports.fileExists = exports.createProgressReporter = exports.formatDuration = exports.formatFileSize = exports.ensureDirectoryExists = exports.validateFilePath = exports.getDefaultFormatOptions = exports.createDefaultExportConfig = exports.generateFileName = exports.inferFormatFromPath = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const types_1 = require("./types");
/**
 * 根据文件扩展名推断导出格式
 * @param filePath 文件路径
 * @returns 导出格式类型
 */
function inferFormatFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.csv':
            return types_1.ExportFormatType.CSV;
        case '.json':
            return types_1.ExportFormatType.JSON;
        case '.xlsx':
        case '.xls':
            return types_1.ExportFormatType.EXCEL;
        case '.xml':
            return types_1.ExportFormatType.XML;
        case '.txt':
            return types_1.ExportFormatType.TXT;
        case '.bin':
        case '.dat':
            return types_1.ExportFormatType.BINARY;
        default:
            return types_1.ExportFormatType.CSV; // 默认格式
    }
}
exports.inferFormatFromPath = inferFormatFromPath;
/**
 * 生成建议的文件名
 * @param formatType 格式类型
 * @param prefix 前缀
 * @returns 建议的文件名
 */
function generateFileName(formatType, prefix = 'export') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const extensions = {
        [types_1.ExportFormatType.CSV]: '.csv',
        [types_1.ExportFormatType.JSON]: '.json',
        [types_1.ExportFormatType.EXCEL]: '.xlsx',
        [types_1.ExportFormatType.XML]: '.xml',
        [types_1.ExportFormatType.TXT]: '.txt',
        [types_1.ExportFormatType.BINARY]: '.bin'
    };
    return `${prefix}_${timestamp}_${time}${extensions[formatType]}`;
}
exports.generateFileName = generateFileName;
/**
 * 创建默认导出配置
 * @param formatType 格式类型
 * @param filePath 文件路径
 * @returns 默认导出配置
 */
function createDefaultExportConfig(formatType, filePath) {
    return {
        dataSource: {
            type: types_1.DataSourceType.CURRENT,
            datasets: [],
            groups: []
        },
        format: {
            type: formatType,
            options: getDefaultFormatOptions(formatType)
        },
        file: {
            path: filePath,
            name: path.basename(filePath),
            overwrite: true
        },
        processing: {
            includeMetadata: true,
            includeTimestamps: true,
            compression: false,
            encoding: 'utf-8',
            precision: 3
        },
        filters: {}
    };
}
exports.createDefaultExportConfig = createDefaultExportConfig;
/**
 * 获取格式的默认选项
 * @param formatType 格式类型
 * @returns 默认选项
 */
function getDefaultFormatOptions(formatType) {
    switch (formatType) {
        case types_1.ExportFormatType.CSV:
            return {
                delimiter: ',',
                quote: '"',
                escape: '"',
                encoding: 'utf-8',
                includeHeader: true,
                lineEnding: '\n',
                precision: 3,
                dateFormat: 'YYYY-MM-DD HH:mm:ss'
            };
        case types_1.ExportFormatType.JSON:
            return {
                pretty: true,
                indent: 2,
                encoding: 'utf-8',
                includeMetadata: true,
                arrayFormat: true,
                compression: false
            };
        case types_1.ExportFormatType.EXCEL:
            return {
                sheetName: 'Data',
                includeChart: false,
                autoFitColumns: true,
                includeMetadata: true,
                dateFormat: 'yyyy-mm-dd hh:mm:ss',
                numberFormat: '#,##0.00'
            };
        case types_1.ExportFormatType.XML:
            return {
                rootElement: 'data',
                recordElement: 'record',
                includeAttributes: true,
                prettyPrint: true,
                encoding: 'utf-8'
            };
        default:
            return {};
    }
}
exports.getDefaultFormatOptions = getDefaultFormatOptions;
/**
 * 验证文件路径
 * @param filePath 文件路径
 * @returns 验证结果
 */
function validateFilePath(filePath) {
    if (!filePath || filePath.trim() === '') {
        return { valid: false, error: 'File path is required' };
    }
    const directory = path.dirname(filePath);
    // 检查目录是否存在
    try {
        if (!fs.existsSync(directory)) {
            return { valid: false, error: `Directory does not exist: ${directory}` };
        }
    }
    catch (error) {
        return { valid: false, error: `Invalid directory path: ${directory}` };
    }
    // 检查文件名是否有效
    const fileName = path.basename(filePath);
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(fileName)) {
        return { valid: false, error: 'File name contains invalid characters' };
    }
    return { valid: true };
}
exports.validateFilePath = validateFilePath;
/**
 * 确保目录存在
 * @param filePath 文件路径
 */
async function ensureDirectoryExists(filePath) {
    const directory = path.dirname(filePath);
    try {
        await fs.promises.access(directory);
    }
    catch {
        await fs.promises.mkdir(directory, { recursive: true });
    }
}
exports.ensureDirectoryExists = ensureDirectoryExists;
/**
 * 获取文件大小的人类可读格式
 * @param bytes 字节数
 * @returns 人类可读的大小
 */
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}
exports.formatFileSize = formatFileSize;
/**
 * 格式化持续时间
 * @param milliseconds 毫秒数
 * @returns 格式化的持续时间
 */
function formatDuration(milliseconds) {
    if (milliseconds < 1000) {
        return `${Math.round(milliseconds)}ms`;
    }
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}
exports.formatDuration = formatDuration;
/**
 * 创建进度报告器
 * @param callback 进度回调函数
 * @returns 进度报告函数
 */
function createProgressReporter(callback) {
    let lastReportTime = 0;
    const reportInterval = 100; // 最小报告间隔（毫秒）
    return (progress) => {
        const now = Date.now();
        if (now - lastReportTime >= reportInterval || progress >= 100) {
            lastReportTime = now;
            callback?.(Math.min(100, Math.max(0, progress)));
        }
    };
}
exports.createProgressReporter = createProgressReporter;
/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
async function fileExists(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
exports.fileExists = fileExists;
/**
 * 获取临时文件路径
 * @param extension 文件扩展名
 * @returns 临时文件路径
 */
function getTempFilePath(extension) {
    const tmpDir = require('os').tmpdir();
    const fileName = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
    return path.join(tmpDir, fileName);
}
exports.getTempFilePath = getTempFilePath;
/**
 * 清理临时文件
 * @param filePath 文件路径
 */
async function cleanupTempFile(filePath) {
    try {
        await fs.promises.unlink(filePath);
    }
    catch {
        // 忽略删除失败的错误
    }
}
exports.cleanupTempFile = cleanupTempFile;
/**
 * 验证数据完整性
 * @param data 数据数组
 * @returns 验证结果
 */
function validateDataIntegrity(data) {
    const issues = [];
    if (!Array.isArray(data)) {
        return { valid: false, issues: ['Data is not an array'] };
    }
    if (data.length === 0) {
        issues.push('Data array is empty');
    }
    // 检查列数一致性
    if (data.length > 0) {
        const firstRowLength = data[0]?.length || 0;
        for (let i = 1; i < data.length; i++) {
            if (data[i]?.length !== firstRowLength) {
                issues.push(`Row ${i} has ${data[i]?.length} columns, expected ${firstRowLength}`);
                break; // 只报告第一个不一致的行
            }
        }
    }
    // 检查数据类型
    let hasNullValues = false;
    let hasUndefinedValues = false;
    for (let i = 0; i < Math.min(data.length, 10); i++) { // 只检查前10行
        const row = data[i];
        if (Array.isArray(row)) {
            for (const value of row) {
                if (value === null) {
                    hasNullValues = true;
                }
                if (value === undefined) {
                    hasUndefinedValues = true;
                }
            }
        }
    }
    if (hasNullValues) {
        issues.push('Data contains null values');
    }
    if (hasUndefinedValues) {
        issues.push('Data contains undefined values');
    }
    return {
        valid: issues.length === 0,
        issues
    };
}
exports.validateDataIntegrity = validateDataIntegrity;
/**
 * 估算导出文件大小
 * @param recordCount 记录数
 * @param columnCount 列数
 * @param formatType 格式类型
 * @returns 估算的文件大小（字节）
 */
function estimateExportSize(recordCount, columnCount, formatType) {
    const avgCellSize = 10; // 平均每个单元格的字符数
    const avgRowSize = columnCount * avgCellSize;
    let multiplier = 1;
    switch (formatType) {
        case types_1.ExportFormatType.CSV:
            multiplier = 1.2; // CSV分隔符和引号的开销
            break;
        case types_1.ExportFormatType.JSON:
            multiplier = 2.5; // JSON结构的开销
            break;
        case types_1.ExportFormatType.EXCEL:
            multiplier = 3.0; // Excel二进制格式的开销
            break;
        case types_1.ExportFormatType.XML:
            multiplier = 4.0; // XML标签的开销
            break;
        default:
            multiplier = 1.5;
    }
    return Math.round(recordCount * avgRowSize * multiplier);
}
exports.estimateExportSize = estimateExportSize;
/**
 * 创建导出摘要
 * @param result 导出结果
 * @returns 导出摘要
 */
function createExportSummary(result) {
    return [
        `Export completed successfully!`,
        `File: ${result.filePath}`,
        `Size: ${formatFileSize(result.fileSize)}`,
        `Records: ${result.recordCount.toLocaleString()}`,
        `Duration: ${formatDuration(result.duration)}`
    ].join('\n');
}
exports.createExportSummary = createExportSummary;
//# sourceMappingURL=utils.js.map
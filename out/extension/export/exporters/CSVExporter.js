"use strict";
/**
 * CSV 格式导出器
 * 基于Serial Studio的CSV导出功能
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
exports.CSVExporter = void 0;
const fs = __importStar(require("fs"));
const types_1 = require("../types");
/**
 * CSV 导出器实现
 * 支持流式写入和高性能处理
 */
class CSVExporter {
    options;
    progressCallback;
    /**
     * 构造函数
     * @param options CSV导出选项
     */
    constructor(options = {}) {
        // 设置默认选项
        this.options = {
            delimiter: ',',
            quote: '"',
            escape: '"',
            encoding: 'utf-8',
            includeHeader: true,
            lineEnding: '\n',
            precision: 3,
            dateFormat: 'YYYY-MM-DD HH:mm:ss',
            ...options
        };
    }
    /**
     * 设置进度回调
     * @param callback 进度回调函数
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }
    /**
     * 导出数据到CSV文件
     * @param data 导出数据
     * @param filePath 文件路径
     * @returns 导出结果
     */
    async exportData(data, filePath) {
        const startTime = performance.now();
        let recordCount = 0;
        let fileSize = 0;
        try {
            // 创建写入流
            const writeStream = fs.createWriteStream(filePath, {
                encoding: this.options.encoding
            });
            // 写入表头
            if (this.options.includeHeader && data.headers && data.headers.length > 0) {
                const headerLine = this.formatCSVLine(data.headers);
                writeStream.write(headerLine + this.options.lineEnding);
                fileSize += Buffer.byteLength(headerLine + this.options.lineEnding, this.options.encoding);
            }
            // 流式写入数据
            if (Array.isArray(data.records)) {
                // 处理数组数据
                for (const record of data.records) {
                    const csvLine = this.formatCSVLine(record);
                    writeStream.write(csvLine + this.options.lineEnding);
                    fileSize += Buffer.byteLength(csvLine + this.options.lineEnding, this.options.encoding);
                    recordCount++;
                    // 报告进度
                    if (recordCount % 1000 === 0) {
                        this.reportProgress(recordCount, data.totalRecords);
                    }
                }
            }
            else {
                // 处理异步迭代器数据
                for await (const record of data.records) {
                    const csvLine = this.formatCSVLine(record);
                    writeStream.write(csvLine + this.options.lineEnding);
                    fileSize += Buffer.byteLength(csvLine + this.options.lineEnding, this.options.encoding);
                    recordCount++;
                    // 报告进度
                    if (recordCount % 1000 === 0) {
                        this.reportProgress(recordCount, data.totalRecords);
                    }
                }
            }
            // 关闭流
            await this.closeStream(writeStream);
            // 最终进度报告
            this.reportProgress(recordCount, recordCount);
            return {
                success: true,
                filePath,
                fileSize,
                recordCount,
                duration: performance.now() - startTime
            };
        }
        catch (error) {
            throw new types_1.ExportError(`CSV export failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 格式化CSV行
     * @param values 值数组
     * @returns 格式化的CSV行
     */
    formatCSVLine(values) {
        return values.map(value => this.formatCSVValue(value)).join(this.options.delimiter);
    }
    /**
     * 格式化CSV值
     * @param value 值
     * @returns 格式化的值
     */
    formatCSVValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        // 处理日期
        if (value instanceof Date) {
            return this.quote(this.formatDate(value));
        }
        // 处理数字
        if (typeof value === 'number') {
            if (isNaN(value)) {
                return '';
            }
            if (!Number.isInteger(value) && this.options.precision !== undefined) {
                return value.toFixed(this.options.precision);
            }
            return value.toString();
        }
        // 处理布尔值
        if (typeof value === 'boolean') {
            return value.toString();
        }
        // 处理字符串
        const stringValue = String(value);
        // 检查是否需要引号
        if (this.needsQuoting(stringValue)) {
            return this.quote(stringValue);
        }
        return stringValue;
    }
    /**
     * 检查值是否需要引号
     * @param value 字符串值
     * @returns 是否需要引号
     */
    needsQuoting(value) {
        return value.includes(this.options.delimiter) ||
            value.includes(this.options.quote) ||
            value.includes('\n') ||
            value.includes('\r') ||
            value.startsWith(' ') ||
            value.endsWith(' ');
    }
    /**
     * 为值添加引号并转义
     * @param value 字符串值
     * @returns 引号包围并转义的值
     */
    quote(value) {
        const escapedValue = value.replace(new RegExp(this.options.quote, 'g'), this.options.escape + this.options.quote);
        return this.options.quote + escapedValue + this.options.quote;
    }
    /**
     * 格式化日期
     * @param date 日期对象
     * @returns 格式化的日期字符串
     */
    formatDate(date) {
        if (!this.options.dateFormat) {
            return date.toISOString();
        }
        const formatMap = {
            'YYYY': date.getFullYear().toString(),
            'YY': date.getFullYear().toString().slice(-2),
            'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
            'M': (date.getMonth() + 1).toString(),
            'DD': date.getDate().toString().padStart(2, '0'),
            'D': date.getDate().toString(),
            'HH': date.getHours().toString().padStart(2, '0'),
            'H': date.getHours().toString(),
            'mm': date.getMinutes().toString().padStart(2, '0'),
            'm': date.getMinutes().toString(),
            'ss': date.getSeconds().toString().padStart(2, '0'),
            's': date.getSeconds().toString(),
            'SSS': date.getMilliseconds().toString().padStart(3, '0')
        };
        let formattedDate = this.options.dateFormat;
        // 按长度排序，避免替换冲突
        const tokens = Object.keys(formatMap).sort((a, b) => b.length - a.length);
        for (const token of tokens) {
            formattedDate = formattedDate.replace(new RegExp(token, 'g'), formatMap[token]);
        }
        return formattedDate;
    }
    /**
     * 关闭写入流
     * @param stream 写入流
     * @returns Promise
     */
    closeStream(stream) {
        return new Promise((resolve, reject) => {
            stream.end((error) => {
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
     * 报告导出进度
     * @param processed 已处理记录数
     * @param total 总记录数
     */
    reportProgress(processed, total) {
        if (this.progressCallback && total > 0) {
            const percentage = Math.min(100, (processed / total) * 100);
            this.progressCallback(percentage, processed);
        }
    }
    /**
     * 验证CSV选项
     * @param options CSV选项
     * @returns 是否有效
     */
    static validateOptions(options) {
        // 检查分隔符
        if (!options.delimiter || options.delimiter.length === 0) {
            return false;
        }
        // 检查引号字符
        if (!options.quote || options.quote.length !== 1) {
            return false;
        }
        // 检查转义字符
        if (!options.escape || options.escape.length !== 1) {
            return false;
        }
        // 检查编码
        const supportedEncodings = ['utf-8', 'utf-16le', 'latin1', 'ascii'];
        if (!supportedEncodings.includes(options.encoding)) {
            return false;
        }
        // 检查精度
        if (options.precision !== undefined && (options.precision < 0 || options.precision > 10)) {
            return false;
        }
        return true;
    }
    /**
     * 创建默认CSV选项
     * @returns 默认CSV选项
     */
    static createDefaultOptions() {
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
    }
    /**
     * 创建Excel兼容的CSV选项
     * @returns Excel兼容的CSV选项
     */
    static createExcelCompatibleOptions() {
        return {
            delimiter: ',',
            quote: '"',
            escape: '"',
            encoding: 'utf-8',
            includeHeader: true,
            lineEnding: '\r\n',
            precision: 2,
            dateFormat: 'YYYY-MM-DD HH:mm:ss'
        };
    }
    /**
     * 创建制表符分隔的选项
     * @returns 制表符分隔的选项
     */
    static createTabSeparatedOptions() {
        return {
            delimiter: '\t',
            quote: '"',
            escape: '"',
            encoding: 'utf-8',
            includeHeader: true,
            lineEnding: '\n',
            precision: 3,
            dateFormat: 'YYYY-MM-DD HH:mm:ss'
        };
    }
    /**
     * 转义CSV特殊字符
     * @param text 文本
     * @param delimiter 分隔符
     * @param quote 引号字符
     * @param escape 转义字符
     * @returns 转义后的文本
     */
    static escapeCSV(text, delimiter = ',', quote = '"', escape = '"') {
        if (!text) {
            return '';
        }
        const needsQuoting = text.includes(delimiter) ||
            text.includes(quote) ||
            text.includes('\n') ||
            text.includes('\r') ||
            text.startsWith(' ') ||
            text.endsWith(' ');
        if (needsQuoting) {
            const escapedText = text.replace(new RegExp(quote, 'g'), escape + quote);
            return quote + escapedText + quote;
        }
        return text;
    }
    /**
     * 解析CSV行
     * @param line CSV行
     * @param delimiter 分隔符
     * @param quote 引号字符
     * @returns 解析后的值数组
     */
    static parseCSVLine(line, delimiter = ',', quote = '"') {
        const values = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        while (i < line.length) {
            const char = line[i];
            if (char === quote) {
                if (inQuotes && line[i + 1] === quote) {
                    // 转义的引号
                    current += quote;
                    i += 2;
                }
                else {
                    // 引号开始或结束
                    inQuotes = !inQuotes;
                    i++;
                }
            }
            else if (char === delimiter && !inQuotes) {
                // 字段分隔符
                values.push(current);
                current = '';
                i++;
            }
            else {
                // 普通字符
                current += char;
                i++;
            }
        }
        // 添加最后一个字段
        values.push(current);
        return values;
    }
}
exports.CSVExporter = CSVExporter;
//# sourceMappingURL=CSVExporter.js.map
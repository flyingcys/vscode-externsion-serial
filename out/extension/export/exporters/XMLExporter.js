"use strict";
/**
 * XML 格式导出器
 * 基于Serial Studio的数据导出功能
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
exports.XMLExporter = void 0;
const fs = __importStar(require("fs"));
const types_1 = require("../types");
/**
 * XML 导出器实现
 * 支持结构化XML格式和自定义元素名称
 */
class XMLExporter {
    options;
    progressCallback;
    /**
     * 构造函数
     * @param options XML导出选项
     */
    constructor(options = {}) {
        // 设置默认选项
        this.options = {
            rootElement: 'data',
            recordElement: 'record',
            includeAttributes: true,
            prettyPrint: true,
            encoding: 'utf-8',
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
     * 导出数据到XML文件
     * @param data 导出数据
     * @param filePath 文件路径
     * @returns 导出结果
     */
    async exportData(data, filePath) {
        const startTime = performance.now();
        let recordCount = 0;
        try {
            // 报告开始进度
            this.reportProgress(5, 0);
            // 构建XML内容
            const xmlContent = await this.buildXMLContent(data);
            recordCount = data.totalRecords;
            this.reportProgress(80, recordCount);
            // 写入文件
            await fs.promises.writeFile(filePath, xmlContent, {
                encoding: this.options.encoding
            });
            this.reportProgress(95, recordCount);
            // 获取文件统计信息
            const fileStats = await fs.promises.stat(filePath);
            this.reportProgress(100, recordCount);
            return {
                success: true,
                filePath,
                fileSize: fileStats.size,
                recordCount,
                duration: performance.now() - startTime
            };
        }
        catch (error) {
            throw new types_1.ExportError(`XML export failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 构建XML内容
     * @param data 导出数据
     * @returns XML内容字符串
     */
    async buildXMLContent(data) {
        const indent = this.options.prettyPrint ? '  ' : '';
        const newline = this.options.prettyPrint ? '\n' : '';
        let xml = `<?xml version="1.0" encoding="${this.options.encoding}"?>${newline}`;
        // 根元素开始标签
        xml += `<${this.options.rootElement}`;
        // 添加根元素属性
        if (this.options.includeAttributes) {
            xml += ` recordCount="${data.totalRecords}"`;
            xml += ` exportTime="${new Date().toISOString()}"`;
            xml += ` source="Serial-Studio VSCode Extension"`;
        }
        xml += `>${newline}`;
        // 添加元数据
        if (this.options.includeAttributes && data.metadata) {
            xml += this.buildMetadataSection(data.metadata, indent, newline);
        }
        // 添加数据集信息
        if (this.options.includeAttributes && data.datasets && data.datasets.length > 0) {
            xml += this.buildDatasetsSection(data.datasets, indent, newline);
        }
        // 添加数据记录
        xml += await this.buildRecordsSection(data, indent, newline);
        // 根元素结束标签
        xml += `</${this.options.rootElement}>${newline}`;
        return xml;
    }
    /**
     * 构建元数据部分
     * @param metadata 元数据
     * @param indent 缩进
     * @param newline 换行符
     * @returns 元数据XML
     */
    buildMetadataSection(metadata, indent, newline) {
        let xml = `${indent}<metadata>${newline}`;
        xml += this.objectToXML(metadata, indent + indent, newline);
        xml += `${indent}</metadata>${newline}`;
        return xml;
    }
    /**
     * 构建数据集部分
     * @param datasets 数据集数组
     * @param indent 缩进
     * @param newline 换行符
     * @returns 数据集XML
     */
    buildDatasetsSection(datasets, indent, newline) {
        let xml = `${indent}<datasets>${newline}`;
        for (const dataset of datasets) {
            xml += `${indent}${indent}<dataset`;
            xml += ` id="${this.escapeXML(dataset.id)}"`;
            xml += ` title="${this.escapeXML(dataset.title)}"`;
            xml += ` units="${this.escapeXML(dataset.units)}"`;
            xml += ` type="${this.escapeXML(dataset.dataType)}"`;
            xml += ` widget="${this.escapeXML(dataset.widget)}"`;
            xml += ` group="${this.escapeXML(dataset.group)}"`;
            xml += `/>${newline}`;
        }
        xml += `${indent}</datasets>${newline}`;
        return xml;
    }
    /**
     * 构建记录部分
     * @param data 导出数据
     * @param indent 缩进
     * @param newline 换行符
     * @returns 记录XML
     */
    async buildRecordsSection(data, indent, newline) {
        let xml = `${indent}<records>${newline}`;
        let processedCount = 0;
        if (Array.isArray(data.records)) {
            // 处理数组数据
            for (const record of data.records) {
                xml += this.buildRecordXML(record, data.headers, indent + indent, newline);
                processedCount++;
                // 定期报告进度
                if (processedCount % 1000 === 0) {
                    this.reportProgress(10 + (processedCount / data.totalRecords) * 70, processedCount);
                }
            }
        }
        else {
            // 处理异步迭代器数据
            for await (const record of data.records) {
                xml += this.buildRecordXML(record, data.headers, indent + indent, newline);
                processedCount++;
                // 定期报告进度
                if (processedCount % 1000 === 0) {
                    this.reportProgress(10 + (processedCount / data.totalRecords) * 70, processedCount);
                }
            }
        }
        xml += `${indent}</records>${newline}`;
        return xml;
    }
    /**
     * 构建单条记录XML
     * @param record 记录数组
     * @param headers 标题数组
     * @param indent 缩进
     * @param newline 换行符
     * @returns 记录XML
     */
    buildRecordXML(record, headers, indent, newline) {
        let xml = `${indent}<${this.options.recordElement}`;
        // 添加记录属性（如果启用）
        if (this.options.includeAttributes && headers && headers.length > 0) {
            for (let i = 0; i < Math.min(record.length, headers.length); i++) {
                const header = this.sanitizeElementName(headers[i]);
                const value = this.escapeXML(String(record[i] ?? ''));
                xml += ` ${header}="${value}"`;
            }
            xml += `/>${newline}`;
        }
        else {
            // 使用子元素格式
            xml += `>${newline}`;
            if (headers && headers.length > 0) {
                for (let i = 0; i < Math.min(record.length, headers.length); i++) {
                    const header = this.sanitizeElementName(headers[i]);
                    const value = this.escapeXML(String(record[i] ?? ''));
                    xml += `${indent}  <${header}>${value}</${header}>${newline}`;
                }
            }
            else {
                // 没有标题时使用通用字段名
                for (let i = 0; i < record.length; i++) {
                    const value = this.escapeXML(String(record[i] ?? ''));
                    xml += `${indent}  <field${i}>${value}</field${i}>${newline}`;
                }
            }
            xml += `${indent}</${this.options.recordElement}>${newline}`;
        }
        return xml;
    }
    /**
     * 将对象转换为XML
     * @param obj 对象
     * @param indent 缩进
     * @param newline 换行符
     * @returns XML字符串
     */
    objectToXML(obj, indent, newline) {
        let xml = '';
        if (typeof obj !== 'object' || obj === null) {
            return this.escapeXML(String(obj));
        }
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                xml += `${indent}<item index="${i}">${newline}`;
                xml += this.objectToXML(obj[i], indent + '  ', newline);
                xml += `${indent}</item>${newline}`;
            }
        }
        else {
            for (const [key, value] of Object.entries(obj)) {
                const elementName = this.sanitizeElementName(key);
                if (typeof value === 'object' && value !== null) {
                    xml += `${indent}<${elementName}>${newline}`;
                    xml += this.objectToXML(value, indent + '  ', newline);
                    xml += `${indent}</${elementName}>${newline}`;
                }
                else {
                    const escapedValue = this.escapeXML(String(value ?? ''));
                    xml += `${indent}<${elementName}>${escapedValue}</${elementName}>${newline}`;
                }
            }
        }
        return xml;
    }
    /**
     * 转义XML特殊字符
     * @param text 文本
     * @returns 转义后的文本
     */
    escapeXML(text) {
        if (!text) {
            return '';
        }
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // 移除控制字符
    }
    /**
     * 清理元素名称，确保符合XML规范
     * @param name 原始名称
     * @returns 清理后的名称
     */
    sanitizeElementName(name) {
        if (!name) {
            return 'field';
        }
        // XML元素名称只能包含字母、数字、连字符、下划线和点
        // 且不能以数字开头
        let sanitized = name
            .replace(/[^a-zA-Z0-9\-_.]/g, '_')
            .replace(/^[0-9]/, '_$&');
        // 确保不为空
        if (!sanitized) {
            sanitized = 'field';
        }
        // 确保不是XML保留名称
        const reserved = ['xml', 'xmlns'];
        if (reserved.includes(sanitized.toLowerCase())) {
            sanitized = '_' + sanitized;
        }
        return sanitized;
    }
    /**
     * 报告导出进度
     * @param percentage 进度百分比
     * @param processed 已处理记录数
     */
    reportProgress(percentage, processed) {
        if (this.progressCallback) {
            this.progressCallback(Math.min(100, Math.max(0, percentage)), processed);
        }
    }
    /**
     * 验证XML选项
     * @param options XML选项
     * @returns 是否有效
     */
    static validateOptions(options) {
        // 检查根元素名称
        if (!XMLExporter.isValidElementName(options.rootElement)) {
            return false;
        }
        // 检查记录元素名称
        if (!XMLExporter.isValidElementName(options.recordElement)) {
            return false;
        }
        // 检查编码
        const supportedEncodings = ['utf-8', 'utf-16', 'iso-8859-1'];
        if (!supportedEncodings.includes(options.encoding.toLowerCase())) {
            return false;
        }
        return true;
    }
    /**
     * 检查是否为有效的XML元素名称
     * @param name 元素名称
     * @returns 是否有效
     */
    static isValidElementName(name) {
        if (!name) {
            return false;
        }
        // XML元素名称规则：
        // - 以字母或下划线开头
        // - 只包含字母、数字、连字符、下划线和点
        // - 不以"xml"开头（大小写不敏感）
        const xmlNameRegex = /^[a-zA-Z_][a-zA-Z0-9\-_.]*$/;
        if (!xmlNameRegex.test(name)) {
            return false;
        }
        if (name.toLowerCase().startsWith('xml')) {
            return false;
        }
        return true;
    }
    /**
     * 创建默认XML选项
     * @returns 默认XML选项
     */
    static createDefaultOptions() {
        return {
            rootElement: 'data',
            recordElement: 'record',
            includeAttributes: true,
            prettyPrint: true,
            encoding: 'utf-8'
        };
    }
    /**
     * 创建紧凑XML选项
     * @returns 紧凑XML选项
     */
    static createCompactOptions() {
        return {
            rootElement: 'data',
            recordElement: 'record',
            includeAttributes: true,
            prettyPrint: false,
            encoding: 'utf-8'
        };
    }
    /**
     * 创建属性格式XML选项
     * @returns 属性格式XML选项
     */
    static createAttributeFormatOptions() {
        return {
            rootElement: 'dataset',
            recordElement: 'measurement',
            includeAttributes: true,
            prettyPrint: true,
            encoding: 'utf-8'
        };
    }
    /**
     * 创建元素格式XML选项
     * @returns 元素格式XML选项
     */
    static createElementFormatOptions() {
        return {
            rootElement: 'data',
            recordElement: 'record',
            includeAttributes: false,
            prettyPrint: true,
            encoding: 'utf-8'
        };
    }
    /**
     * 格式化XML字符串
     * @param xmlString XML字符串
     * @param indent 缩进字符
     * @returns 格式化的XML字符串
     */
    static formatXML(xmlString, indent = '  ') {
        // 简单的XML格式化实现
        let formatted = '';
        let indentLevel = 0;
        const lines = xmlString.split(/>\s*</);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (i > 0) {
                line = '<' + line;
            }
            if (i < lines.length - 1) {
                line = line + '>';
            }
            // 处理自闭合标签
            if (line.match(/\/>/)) {
                formatted += indent.repeat(indentLevel) + line + '\n';
            }
            // 处理结束标签
            else if (line.match(/<\//)) {
                indentLevel--;
                formatted += indent.repeat(indentLevel) + line + '\n';
            }
            // 处理开始标签
            else if (line.match(/</)) {
                formatted += indent.repeat(indentLevel) + line + '\n';
                indentLevel++;
            }
            // 处理文本内容
            else {
                formatted += indent.repeat(indentLevel) + line + '\n';
            }
        }
        return formatted.trim();
    }
    /**
     * 验证XML格式
     * @param xmlString XML字符串
     * @returns 是否为有效XML
     */
    static isValidXML(xmlString) {
        try {
            // 简单的XML验证
            // 在实际项目中可能需要使用专门的XML解析器
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlString, 'text/xml');
            const parseError = doc.querySelector('parsererror');
            return !parseError;
        }
        catch {
            return false;
        }
    }
}
exports.XMLExporter = XMLExporter;
//# sourceMappingURL=XMLExporter.js.map
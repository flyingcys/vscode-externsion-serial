/**
 * CSV 格式导出器
 * 基于Serial Studio的CSV导出功能
 */
import { DataExporter, ExportData, ExportResult, CSVOptions } from '../types';
/**
 * CSV 导出器实现
 * 支持流式写入和高性能处理
 */
export declare class CSVExporter implements DataExporter {
    private options;
    private progressCallback?;
    /**
     * 构造函数
     * @param options CSV导出选项
     */
    constructor(options?: Partial<CSVOptions>);
    /**
     * 设置进度回调
     * @param callback 进度回调函数
     */
    setProgressCallback(callback: (percentage: number, processed: number) => void): void;
    /**
     * 导出数据到CSV文件
     * @param data 导出数据
     * @param filePath 文件路径
     * @returns 导出结果
     */
    exportData(data: ExportData, filePath: string): Promise<ExportResult>;
    /**
     * 格式化CSV行
     * @param values 值数组
     * @returns 格式化的CSV行
     */
    private formatCSVLine;
    /**
     * 格式化CSV值
     * @param value 值
     * @returns 格式化的值
     */
    private formatCSVValue;
    /**
     * 检查值是否需要引号
     * @param value 字符串值
     * @returns 是否需要引号
     */
    private needsQuoting;
    /**
     * 为值添加引号并转义
     * @param value 字符串值
     * @returns 引号包围并转义的值
     */
    private quote;
    /**
     * 格式化日期
     * @param date 日期对象
     * @returns 格式化的日期字符串
     */
    private formatDate;
    /**
     * 关闭写入流
     * @param stream 写入流
     * @returns Promise
     */
    private closeStream;
    /**
     * 报告导出进度
     * @param processed 已处理记录数
     * @param total 总记录数
     */
    private reportProgress;
    /**
     * 验证CSV选项
     * @param options CSV选项
     * @returns 是否有效
     */
    static validateOptions(options: CSVOptions): boolean;
    /**
     * 创建默认CSV选项
     * @returns 默认CSV选项
     */
    static createDefaultOptions(): CSVOptions;
    /**
     * 创建Excel兼容的CSV选项
     * @returns Excel兼容的CSV选项
     */
    static createExcelCompatibleOptions(): CSVOptions;
    /**
     * 创建制表符分隔的选项
     * @returns 制表符分隔的选项
     */
    static createTabSeparatedOptions(): CSVOptions;
    /**
     * 转义CSV特殊字符
     * @param text 文本
     * @param delimiter 分隔符
     * @param quote 引号字符
     * @param escape 转义字符
     * @returns 转义后的文本
     */
    static escapeCSV(text: string, delimiter?: string, quote?: string, escape?: string): string;
    /**
     * 解析CSV行
     * @param line CSV行
     * @param delimiter 分隔符
     * @param quote 引号字符
     * @returns 解析后的值数组
     */
    static parseCSVLine(line: string, delimiter?: string, quote?: string): string[];
}
//# sourceMappingURL=CSVExporter.d.ts.map
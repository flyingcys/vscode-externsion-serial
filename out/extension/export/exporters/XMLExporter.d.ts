/**
 * XML 格式导出器
 * 基于Serial Studio的数据导出功能
 */
import { DataExporter, ExportData, ExportResult, XMLOptions } from '../types';
/**
 * XML 导出器实现
 * 支持结构化XML格式和自定义元素名称
 */
export declare class XMLExporter implements DataExporter {
    private options;
    private progressCallback?;
    /**
     * 构造函数
     * @param options XML导出选项
     */
    constructor(options?: Partial<XMLOptions>);
    /**
     * 设置进度回调
     * @param callback 进度回调函数
     */
    setProgressCallback(callback: (percentage: number, processed: number) => void): void;
    /**
     * 导出数据到XML文件
     * @param data 导出数据
     * @param filePath 文件路径
     * @returns 导出结果
     */
    exportData(data: ExportData, filePath: string): Promise<ExportResult>;
    /**
     * 构建XML内容
     * @param data 导出数据
     * @returns XML内容字符串
     */
    private buildXMLContent;
    /**
     * 构建元数据部分
     * @param metadata 元数据
     * @param indent 缩进
     * @param newline 换行符
     * @returns 元数据XML
     */
    private buildMetadataSection;
    /**
     * 构建数据集部分
     * @param datasets 数据集数组
     * @param indent 缩进
     * @param newline 换行符
     * @returns 数据集XML
     */
    private buildDatasetsSection;
    /**
     * 构建记录部分
     * @param data 导出数据
     * @param indent 缩进
     * @param newline 换行符
     * @returns 记录XML
     */
    private buildRecordsSection;
    /**
     * 构建单条记录XML
     * @param record 记录数组
     * @param headers 标题数组
     * @param indent 缩进
     * @param newline 换行符
     * @returns 记录XML
     */
    private buildRecordXML;
    /**
     * 将对象转换为XML
     * @param obj 对象
     * @param indent 缩进
     * @param newline 换行符
     * @returns XML字符串
     */
    private objectToXML;
    /**
     * 转义XML特殊字符
     * @param text 文本
     * @returns 转义后的文本
     */
    private escapeXML;
    /**
     * 清理元素名称，确保符合XML规范
     * @param name 原始名称
     * @returns 清理后的名称
     */
    private sanitizeElementName;
    /**
     * 报告导出进度
     * @param percentage 进度百分比
     * @param processed 已处理记录数
     */
    private reportProgress;
    /**
     * 验证XML选项
     * @param options XML选项
     * @returns 是否有效
     */
    static validateOptions(options: XMLOptions): boolean;
    /**
     * 检查是否为有效的XML元素名称
     * @param name 元素名称
     * @returns 是否有效
     */
    static isValidElementName(name: string): boolean;
    /**
     * 创建默认XML选项
     * @returns 默认XML选项
     */
    static createDefaultOptions(): XMLOptions;
    /**
     * 创建紧凑XML选项
     * @returns 紧凑XML选项
     */
    static createCompactOptions(): XMLOptions;
    /**
     * 创建属性格式XML选项
     * @returns 属性格式XML选项
     */
    static createAttributeFormatOptions(): XMLOptions;
    /**
     * 创建元素格式XML选项
     * @returns 元素格式XML选项
     */
    static createElementFormatOptions(): XMLOptions;
    /**
     * 格式化XML字符串
     * @param xmlString XML字符串
     * @param indent 缩进字符
     * @returns 格式化的XML字符串
     */
    static formatXML(xmlString: string, indent?: string): string;
    /**
     * 验证XML格式
     * @param xmlString XML字符串
     * @returns 是否为有效XML
     */
    static isValidXML(xmlString: string): boolean;
}
//# sourceMappingURL=XMLExporter.d.ts.map
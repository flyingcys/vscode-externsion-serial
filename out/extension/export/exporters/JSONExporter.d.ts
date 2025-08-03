/**
 * JSON 格式导出器
 * 基于Serial Studio的数据导出功能
 */
import { DataExporter, ExportData, ExportResult, JSONOptions } from '../types';
/**
 * JSON 导出器实现
 * 支持多种JSON格式和结构
 */
export declare class JSONExporter implements DataExporter {
    private options;
    private progressCallback?;
    /**
     * 构造函数
     * @param options JSON导出选项
     */
    constructor(options?: Partial<JSONOptions>);
    /**
     * 设置进度回调
     * @param callback 进度回调函数
     */
    setProgressCallback(callback: (percentage: number, processed: number) => void): void;
    /**
     * 导出数据到JSON文件
     * @param data 导出数据
     * @param filePath 文件路径
     * @returns 导出结果
     */
    exportData(data: ExportData, filePath: string): Promise<ExportResult>;
    /**
     * 构建导出对象
     * @param data 导出数据
     * @returns 导出对象
     */
    private buildExportObject;
    /**
     * 构建元数据
     * @param data 导出数据
     * @returns 元数据对象
     */
    private buildMetadata;
    /**
     * 构建数组格式数据
     * @param data 导出数据
     * @returns 数组格式数据
     */
    private buildArrayFormat;
    /**
     * 构建数据集格式数据
     * @param data 导出数据
     * @returns 数据集格式数据
     */
    private buildDatasetFormat;
    /**
     * 格式化记录为对象
     * @param record 记录数组
     * @param headers 标题数组
     * @returns 记录对象
     */
    private formatRecord;
    /**
     * 将记录添加到数据集中
     * @param record 记录数组
     * @param headers 标题数组
     * @param datasets 数据集对象
     */
    private addRecordToDatasets;
    /**
     * 处理值，确保JSON兼容性
     * @param value 原始值
     * @returns 处理后的值
     */
    private processValue;
    /**
     * 推断列类型
     * @param data 导出数据
     * @param columnIndex 列索引
     * @returns 列类型
     */
    private inferColumnType;
    /**
     * 创建JSON序列化替换函数
     * @returns 替换函数
     */
    private createReplacer;
    /**
     * 报告导出进度
     * @param percentage 进度百分比
     * @param processed 已处理记录数
     */
    private reportProgress;
    /**
     * 验证JSON选项
     * @param options JSON选项
     * @returns 是否有效
     */
    static validateOptions(options: JSONOptions): boolean;
    /**
     * 创建默认JSON选项
     * @returns 默认JSON选项
     */
    static createDefaultOptions(): JSONOptions;
    /**
     * 创建紧凑JSON选项
     * @returns 紧凑JSON选项
     */
    static createCompactOptions(): JSONOptions;
    /**
     * 创建数据集格式选项
     * @returns 数据集格式选项
     */
    static createDatasetFormatOptions(): JSONOptions;
    /**
     * 格式化JSON字符串
     * @param obj 要格式化的对象
     * @param indent 缩进空格数
     * @returns 格式化的JSON字符串
     */
    static formatJSON(obj: any, indent?: number): string;
    /**
     * 压缩JSON对象（移除不必要的字段）
     * @param obj 原始对象
     * @returns 压缩后的对象
     */
    static compressJSON(obj: any): any;
    /**
     * 验证JSON格式
     * @param jsonString JSON字符串
     * @returns 是否为有效JSON
     */
    static isValidJSON(jsonString: string): boolean;
    /**
     * 计算JSON字符串大小
     * @param obj 对象
     * @returns 字节大小
     */
    static calculateSize(obj: any): number;
}
//# sourceMappingURL=JSONExporter.d.ts.map
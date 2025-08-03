/**
 * Excel 格式导出器
 * 基于Serial Studio的数据导出功能，使用ExcelJS库
 */
import { DataExporter, ExportData, ExportResult, ExcelOptions } from '../types';
/**
 * Excel 导出器实现
 * 支持丰富的Excel功能，包括格式化、图表和元数据
 */
export declare class ExcelExporter implements DataExporter {
    private options;
    private progressCallback?;
    /**
     * 构造函数
     * @param options Excel导出选项
     */
    constructor(options?: Partial<ExcelOptions>);
    /**
     * 设置进度回调
     * @param callback 进度回调函数
     */
    setProgressCallback(callback: (percentage: number, processed: number) => void): void;
    /**
     * 导出数据到Excel文件
     * @param data 导出数据
     * @param filePath 文件路径
     * @returns 导出结果
     */
    exportData(data: ExportData, filePath: string): Promise<ExportResult>;
    /**
     * 设置工作簿属性
     * @param workbook 工作簿
     */
    private setupWorkbookProperties;
    /**
     * 样式化标题行
     * @param row 标题行
     */
    private styleHeaderRow;
    /**
     * 添加数据行
     * @param worksheet 工作表
     * @param data 导出数据
     * @param startRow 起始行号
     * @returns 添加的记录数
     */
    private addDataRows;
    /**
     * 格式化Excel记录
     * @param record 原始记录
     * @returns 格式化的记录
     */
    private formatExcelRecord;
    /**
     * 样式化数据行
     * @param row 数据行
     * @param rowIndex 行索引
     */
    private styleDataRow;
    /**
     * 自动调整列宽
     * @param worksheet 工作表
     */
    private autoFitColumns;
    /**
     * 获取单元格显示长度
     * @param value 单元格值
     * @returns 显示长度
     */
    private getCellDisplayLength;
    /**
     * 添加图表
     * @param worksheet 工作表
     * @param chartConfig 图表配置
     * @param recordCount 记录数
     */
    private addChart;
    /**
     * 添加元数据工作表
     * @param workbook 工作簿
     * @param data 导出数据
     */
    private addMetadataSheet;
    /**
     * 将对象添加到工作表
     * @param sheet 工作表
     * @param obj 对象
     * @param depth 深度
     */
    private addObjectToSheet;
    /**
     * 样式化元数据工作表
     * @param sheet 元数据工作表
     */
    private styleMetadataSheet;
    /**
     * 报告导出进度
     * @param percentage 进度百分比
     * @param processed 已处理记录数
     */
    private reportProgress;
    /**
     * 验证Excel选项
     * @param options Excel选项
     * @returns 是否有效
     */
    static validateOptions(options: ExcelOptions): boolean;
    /**
     * 创建默认Excel选项
     * @returns 默认Excel选项
     */
    static createDefaultOptions(): ExcelOptions;
    /**
     * 创建带图表的Excel选项
     * @returns 带图表的Excel选项
     */
    static createChartOptions(): ExcelOptions;
    /**
     * 创建简单Excel选项
     * @returns 简单Excel选项
     */
    static createSimpleOptions(): ExcelOptions;
}
//# sourceMappingURL=ExcelExporter.d.ts.map
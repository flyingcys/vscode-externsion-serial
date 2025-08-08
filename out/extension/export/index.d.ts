/**
 * 数据导出模块入口文件
 * 导出所有数据导出相关的类和接口
 */
export * from './types';
export { ExportManagerImpl, getExportManager } from './ExportManager';
export { BatchExportManager } from './BatchExportManager';
export { getBatchExportManager } from './BatchExportManager';
export { StreamingCSVExporter, getStreamingCSVExporter } from './StreamingCSVExporter';
export { DataFilter } from './DataFilter';
export { DataTransformer } from './DataTransformer';
export { CSVExporter } from './exporters/CSVExporter';
export { JSONExporter } from './exporters/JSONExporter';
export { ExcelExporter } from './exporters/ExcelExporter';
export { XMLExporter } from './exporters/XMLExporter';
export * from './utils';
/**
 * 创建默认配置的导出管理器
 * @returns 导出管理器实例
 */
export declare function createExportManager(): Promise<import("./ExportManager").ExportManagerImpl>;
/**
 * 快速导出数据到CSV
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export declare function quickExportCSV(data: any[][], headers: string[], filePath: string): Promise<import("./types").ExportResult>;
/**
 * 快速导出数据到JSON
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export declare function quickExportJSON(data: any[][], headers: string[], filePath: string): Promise<import("./types").ExportResult>;
/**
 * 快速导出数据到Excel
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export declare function quickExportExcel(data: any[][], headers: string[], filePath: string): Promise<import("./types").ExportResult>;
/**
 * 快速导出数据到XML
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export declare function quickExportXML(data: any[][], headers: string[], filePath: string): Promise<import("./types").ExportResult>;
/**
 * 创建流式CSV导出
 * 对应Serial-Studio的实时CSV导出功能
 * @param config 流式导出配置
 * @returns 导出句柄
 */
export declare function createStreamingCSVExport(config: import('./types').StreamingExportConfig): Promise<import("./types").StreamingExportHandle>;
/**
 * 快速启动实时数据流式导出
 * @param outputDirectory 输出目录
 * @param headers 数据字段头部
 * @param options 可选配置
 * @returns 导出句柄
 */
export declare function quickStreamingExport(outputDirectory: string, headers: string[], options?: Partial<import('./types').StreamingExportConfig>): Promise<import("./types").StreamingExportHandle>;
/**
 * 写入实时数据到流式导出
 * @param handle 导出句柄
 * @param values 数据值数组
 * @param timestamp 时间戳（可选）
 */
export declare function writeStreamingData(handle: import('./types').StreamingExportHandle, values: any[], timestamp?: Date): Promise<void>;
/**
 * 完成流式导出
 * @param handle 导出句柄
 */
export declare function finishStreamingExport(handle: import('./types').StreamingExportHandle): Promise<void>;
/**
 * 创建增强的流式导出配置
 * 支持自定义格式和大数据处理优化
 * @param baseConfig 基础配置
 * @param options 增强选项
 * @returns 增强配置
 */
export declare function createEnhancedStreamingConfig(baseConfig: import('./types').StreamingExportConfig, options?: {
    customDelimiter?: string;
    enableCompression?: boolean;
    maxMemoryUsage?: number;
    enablePauseResume?: boolean;
}): import('./types').EnhancedStreamingExportConfig;
//# sourceMappingURL=index.d.ts.map
/**
 * 导出工具函数
 * 提供各种导出相关的便利功能
 */
import { ExportFormatType, ExportConfig } from './types';
/**
 * 根据文件扩展名推断导出格式
 * @param filePath 文件路径
 * @returns 导出格式类型
 */
export declare function inferFormatFromPath(filePath: string): ExportFormatType;
/**
 * 生成建议的文件名
 * @param formatType 格式类型
 * @param prefix 前缀
 * @returns 建议的文件名
 */
export declare function generateFileName(formatType: ExportFormatType, prefix?: string): string;
/**
 * 创建默认导出配置
 * @param formatType 格式类型
 * @param filePath 文件路径
 * @returns 默认导出配置
 */
export declare function createDefaultExportConfig(formatType: ExportFormatType, filePath: string): ExportConfig;
/**
 * 获取格式的默认选项
 * @param formatType 格式类型
 * @returns 默认选项
 */
export declare function getDefaultFormatOptions(formatType: ExportFormatType): any;
/**
 * 验证文件路径
 * @param filePath 文件路径
 * @returns 验证结果
 */
export declare function validateFilePath(filePath: string): {
    valid: boolean;
    error?: string;
};
/**
 * 确保目录存在
 * @param filePath 文件路径
 */
export declare function ensureDirectoryExists(filePath: string): Promise<void>;
/**
 * 获取文件大小的人类可读格式
 * @param bytes 字节数
 * @returns 人类可读的大小
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 格式化持续时间
 * @param milliseconds 毫秒数
 * @returns 格式化的持续时间
 */
export declare function formatDuration(milliseconds: number): string;
/**
 * 创建进度报告器
 * @param callback 进度回调函数
 * @returns 进度报告函数
 */
export declare function createProgressReporter(callback?: (progress: number) => void): (progress: number) => void;
/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * 获取临时文件路径
 * @param extension 文件扩展名
 * @returns 临时文件路径
 */
export declare function getTempFilePath(extension: string): string;
/**
 * 清理临时文件
 * @param filePath 文件路径
 */
export declare function cleanupTempFile(filePath: string): Promise<void>;
/**
 * 验证数据完整性
 * @param data 数据数组
 * @returns 验证结果
 */
export declare function validateDataIntegrity(data: any[][]): {
    valid: boolean;
    issues: string[];
};
/**
 * 估算导出文件大小
 * @param recordCount 记录数
 * @param columnCount 列数
 * @param formatType 格式类型
 * @returns 估算的文件大小（字节）
 */
export declare function estimateExportSize(recordCount: number, columnCount: number, formatType: ExportFormatType): number;
/**
 * 创建导出摘要
 * @param result 导出结果
 * @returns 导出摘要
 */
export declare function createExportSummary(result: any): string;
//# sourceMappingURL=utils.d.ts.map
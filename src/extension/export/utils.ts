/**
 * 导出工具函数
 * 提供各种导出相关的便利功能
 */

import * as path from 'path';
import * as fs from 'fs';
import { 
  ExportFormatType, 
  ExportConfig, 
  DataSourceType,
  CSVOptions,
  JSONOptions,
  ExcelOptions,
  XMLOptions
} from './types';

/**
 * 根据文件扩展名推断导出格式
 * @param filePath 文件路径
 * @returns 导出格式类型
 */
export function inferFormatFromPath(filePath: string): ExportFormatType {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.csv':
      return ExportFormatType.CSV;
    case '.json':
      return ExportFormatType.JSON;
    case '.xlsx':
    case '.xls':
      return ExportFormatType.EXCEL;
    case '.xml':
      return ExportFormatType.XML;
    case '.txt':
      return ExportFormatType.TXT;
    case '.bin':
    case '.dat':
      return ExportFormatType.BINARY;
    default:
      return ExportFormatType.CSV; // 默认格式
  }
}

/**
 * 生成建议的文件名
 * @param formatType 格式类型
 * @param prefix 前缀
 * @returns 建议的文件名
 */
export function generateFileName(formatType: ExportFormatType, prefix = 'export'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  
  const extensions = {
    [ExportFormatType.CSV]: '.csv',
    [ExportFormatType.JSON]: '.json',
    [ExportFormatType.EXCEL]: '.xlsx',
    [ExportFormatType.XML]: '.xml',
    [ExportFormatType.TXT]: '.txt',
    [ExportFormatType.BINARY]: '.bin'
  };
  
  return `${prefix}_${timestamp}_${time}${extensions[formatType]}`;
}

/**
 * 创建默认导出配置
 * @param formatType 格式类型
 * @param filePath 文件路径
 * @returns 默认导出配置
 */
export function createDefaultExportConfig(formatType: ExportFormatType, filePath: string): ExportConfig {
  return {
    dataSource: {
      type: DataSourceType.CURRENT,
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

/**
 * 获取格式的默认选项
 * @param formatType 格式类型
 * @returns 默认选项
 */
export function getDefaultFormatOptions(formatType: ExportFormatType): any {
  switch (formatType) {
    case ExportFormatType.CSV:
      return {
        delimiter: ',',
        quote: '"',
        escape: '"',
        encoding: 'utf-8',
        includeHeader: true,
        lineEnding: '\n',
        precision: 3,
        dateFormat: 'YYYY-MM-DD HH:mm:ss'
      } as CSVOptions;
      
    case ExportFormatType.JSON:
      return {
        pretty: true,
        indent: 2,
        encoding: 'utf-8',
        includeMetadata: true,
        arrayFormat: true,
        compression: false
      } as JSONOptions;
      
    case ExportFormatType.EXCEL:
      return {
        sheetName: 'Data',
        includeChart: false,
        autoFitColumns: true,
        includeMetadata: true,
        dateFormat: 'yyyy-mm-dd hh:mm:ss',
        numberFormat: '#,##0.00'
      } as ExcelOptions;
      
    case ExportFormatType.XML:
      return {
        rootElement: 'data',
        recordElement: 'record',
        includeAttributes: true,
        prettyPrint: true,
        encoding: 'utf-8'
      } as XMLOptions;
      
    default:
      return {};
  }
}

/**
 * 验证文件路径
 * @param filePath 文件路径
 * @returns 验证结果
 */
export function validateFilePath(filePath: string): { valid: boolean; error?: string } {
  if (!filePath || filePath.trim() === '') {
    return { valid: false, error: 'File path is required' };
  }
  
  const directory = path.dirname(filePath);
  
  // 检查目录是否存在
  try {
    if (!fs.existsSync(directory)) {
      return { valid: false, error: `Directory does not exist: ${directory}` };
    }
  } catch (error) {
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

/**
 * 确保目录存在
 * @param filePath 文件路径
 */
export async function ensureDirectoryExists(filePath: string): Promise<void> {
  const directory = path.dirname(filePath);
  
  try {
    await fs.promises.access(directory);
  } catch {
    await fs.promises.mkdir(directory, { recursive: true });
  }
}

/**
 * 获取文件大小的人类可读格式
 * @param bytes 字节数
 * @returns 人类可读的大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 格式化持续时间
 * @param milliseconds 毫秒数
 * @returns 格式化的持续时间
 */
export function formatDuration(milliseconds: number): string {
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

/**
 * 创建进度报告器
 * @param callback 进度回调函数
 * @returns 进度报告函数
 */
export function createProgressReporter(callback?: (progress: number) => void) {
  let lastReportTime = 0;
  const reportInterval = 100; // 最小报告间隔（毫秒）
  
  return (progress: number) => {
    const now = Date.now();
    if (now - lastReportTime >= reportInterval || progress >= 100) {
      lastReportTime = now;
      callback?.(Math.min(100, Math.max(0, progress)));
    }
  };
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取临时文件路径
 * @param extension 文件扩展名
 * @returns 临时文件路径
 */
export function getTempFilePath(extension: string): string {
  const tmpDir = require('os').tmpdir();
  const fileName = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
  return path.join(tmpDir, fileName);
}

/**
 * 清理临时文件
 * @param filePath 文件路径
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // 忽略删除失败的错误
  }
}

/**
 * 验证数据完整性
 * @param data 数据数组
 * @returns 验证结果
 */
export function validateDataIntegrity(data: any[][]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
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
        if (value === null) {hasNullValues = true;}
        if (value === undefined) {hasUndefinedValues = true;}
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

/**
 * 估算导出文件大小
 * @param recordCount 记录数
 * @param columnCount 列数
 * @param formatType 格式类型
 * @returns 估算的文件大小（字节）
 */
export function estimateExportSize(recordCount: number, columnCount: number, formatType: ExportFormatType): number {
  const avgCellSize = 10; // 平均每个单元格的字符数
  const avgRowSize = columnCount * avgCellSize;
  
  let multiplier = 1;
  
  switch (formatType) {
    case ExportFormatType.CSV:
      multiplier = 1.2; // CSV分隔符和引号的开销
      break;
    case ExportFormatType.JSON:
      multiplier = 2.5; // JSON结构的开销
      break;
    case ExportFormatType.EXCEL:
      multiplier = 3.0; // Excel二进制格式的开销
      break;
    case ExportFormatType.XML:
      multiplier = 4.0; // XML标签的开销
      break;
    default:
      multiplier = 1.5;
  }
  
  return Math.round(recordCount * avgRowSize * multiplier);
}

/**
 * 创建导出摘要
 * @param result 导出结果
 * @returns 导出摘要
 */
export function createExportSummary(result: any): string {
  return [
    `Export completed successfully!`,
    `File: ${result.filePath}`,
    `Size: ${formatFileSize(result.fileSize)}`,
    `Records: ${result.recordCount.toLocaleString()}`,
    `Duration: ${formatDuration(result.duration)}`
  ].join('\n');
}
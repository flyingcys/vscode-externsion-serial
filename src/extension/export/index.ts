/**
 * 数据导出模块入口文件
 * 导出所有数据导出相关的类和接口
 */

// 类型定义
export * from './types';

// 核心管理器
export { ExportManagerImpl, getExportManager } from './ExportManager';

// 批量导出管理器
export { BatchExportManager } from './BatchExportManager';
export { getBatchExportManager } from './BatchExportManager';

// 流式导出管理器（对应Serial-Studio的CSV::Export）
export { StreamingCSVExporter, getStreamingCSVExporter } from './StreamingCSVExporter';

// 数据处理器
export { DataFilter } from './DataFilter';
export { DataTransformer } from './DataTransformer';

// 导出器
export { CSVExporter } from './exporters/CSVExporter';
export { JSONExporter } from './exporters/JSONExporter';
export { ExcelExporter } from './exporters/ExcelExporter';
export { XMLExporter } from './exporters/XMLExporter';

// 便利函数
export * from './utils';

/**
 * 创建默认配置的导出管理器
 * @returns 导出管理器实例
 */
export function createExportManager() {
  const { getExportManager } = require('./ExportManager');
  return getExportManager();
}

/**
 * 快速导出数据到CSV
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export async function quickExportCSV(data: any[][], headers: string[], filePath: string) {
  const { CSVExporter } = await import('./exporters/CSVExporter');
  const exporter = new CSVExporter();
  return await exporter.exportData({
    headers,
    records: data,
    totalRecords: data.length,
    datasets: []
  }, filePath);
}

/**
 * 快速导出数据到JSON
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export async function quickExportJSON(data: any[][], headers: string[], filePath: string) {
  const { JSONExporter } = await import('./exporters/JSONExporter');
  const exporter = new JSONExporter();
  return await exporter.exportData({
    headers,
    records: data,
    totalRecords: data.length,
    datasets: []
  }, filePath);
}

/**
 * 快速导出数据到Excel
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export async function quickExportExcel(data: any[][], headers: string[], filePath: string) {
  const { ExcelExporter } = await import('./exporters/ExcelExporter');
  const exporter = new ExcelExporter();
  return await exporter.exportData({
    headers,
    records: data,
    totalRecords: data.length,
    datasets: []
  }, filePath);
}

/**
 * 快速导出数据到XML
 * @param data 导出数据
 * @param filePath 文件路径
 * @returns 导出结果
 */
export async function quickExportXML(data: any[][], headers: string[], filePath: string) {
  const { XMLExporter } = await import('./exporters/XMLExporter');
  const exporter = new XMLExporter();
  return await exporter.exportData({
    headers,
    records: data,
    totalRecords: data.length,
    datasets: []
  }, filePath);
}

// === 流式导出快速功能（对应Serial-Studio的实时导出） ===

/**
 * 创建流式CSV导出
 * 对应Serial-Studio的实时CSV导出功能
 * @param config 流式导出配置
 * @returns 导出句柄
 */
export async function createStreamingCSVExport(config: import('./types').StreamingExportConfig) {
  const { getStreamingCSVExporter } = await import('./StreamingCSVExporter');
  const exporter = getStreamingCSVExporter();
  return await exporter.startExport(config);
}

/**
 * 快速启动实时数据流式导出
 * @param outputDirectory 输出目录
 * @param headers 数据字段头部
 * @param options 可选配置
 * @returns 导出句柄
 */
export async function quickStreamingExport(
  outputDirectory: string,
  headers: string[],
  options?: Partial<import('./types').StreamingExportConfig>
) {
  const config: import('./types').StreamingExportConfig = {
    outputDirectory,
    headers,
    selectedFields: headers.map((_, index) => index),
    includeTimestamp: true,
    csvOptions: {
      delimiter: ',',
      quote: '"',
      escape: '"',
      lineEnding: '\n',
      encoding: 'utf-8'
    },
    bufferSize: 8192,
    writeInterval: 1000,
    chunkSize: 1000,
    ...options
  };
  
  return await createStreamingCSVExport(config);
}

/**
 * 写入实时数据到流式导出
 * @param handle 导出句柄
 * @param values 数据值数组
 * @param timestamp 时间戳（可选）
 */
export async function writeStreamingData(
  handle: import('./types').StreamingExportHandle,
  values: any[],
  timestamp?: Date
) {
  const { getStreamingCSVExporter } = await import('./StreamingCSVExporter');
  const exporter = getStreamingCSVExporter();
  const dataPoint: import('./types').DataPoint = {
    timestamp,
    values,
    metadata: {}
  };
  
  await exporter.writeDataPoint(handle, dataPoint);
}

/**
 * 完成流式导出
 * @param handle 导出句柄
 */
export async function finishStreamingExport(handle: import('./types').StreamingExportHandle) {
  const { getStreamingCSVExporter } = await import('./StreamingCSVExporter');
  const exporter = getStreamingCSVExporter();
  await exporter.finishExport(handle);
}

/**
 * 创建增强的流式导出配置
 * 支持自定义格式和大数据处理优化
 * @param baseConfig 基础配置
 * @param options 增强选项
 * @returns 增强配置
 */
export function createEnhancedStreamingConfig(
  baseConfig: import('./types').StreamingExportConfig,
  options?: {
    customDelimiter?: string;
    enableCompression?: boolean;
    maxMemoryUsage?: number;
    enablePauseResume?: boolean;
  }
): import('./types').EnhancedStreamingExportConfig {
  const enhancedConfig: import('./types').EnhancedStreamingExportConfig = {
    ...baseConfig,
    customFormatOptions: {
      fieldSelection: {
        enabled: true,
        selectedFields: baseConfig.selectedFields || [],
        fieldOrder: baseConfig.selectedFields || []
      },
      customDelimiter: {
        enabled: !!options?.customDelimiter,
        delimiter: options?.customDelimiter || baseConfig.csvOptions?.delimiter || ',',
        customQuote: baseConfig.csvOptions?.quote || '"',
        customEscape: baseConfig.csvOptions?.escape || '"'
      },
      dataFiltering: {
        enabled: false
      },
      dataTransformation: {
        enabled: false,
        transformations: []
      }
    },
    largeDataProcessing: {
      chunkExport: {
        enabled: true,
        chunkSize: baseConfig.chunkSize || 1000,
        maxMemoryUsage: options?.maxMemoryUsage || 100
      },
      compression: {
        enabled: options?.enableCompression || false,
        algorithm: 'gzip',
        level: 6
      },
      pauseResume: {
        enabled: options?.enablePauseResume !== false,
        autoSaveInterval: 5000
      }
    }
  };
  
  return enhancedConfig;
}
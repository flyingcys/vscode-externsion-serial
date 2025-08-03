/**
 * JSON 格式导出器
 * 基于Serial Studio的数据导出功能
 */

import * as fs from 'fs';
import { DataExporter, ExportData, ExportResult, ExportError, JSONOptions } from '../types';

/**
 * JSON 导出器实现
 * 支持多种JSON格式和结构
 */
export class JSONExporter implements DataExporter {
  private options: Required<JSONOptions>;
  private progressCallback?: (percentage: number, processed: number) => void;
  
  /**
   * 构造函数
   * @param options JSON导出选项
   */
  constructor(options: Partial<JSONOptions> = {}) {
    // 设置默认选项
    this.options = {
      pretty: true,
      indent: 2,
      encoding: 'utf-8',
      includeMetadata: true,
      arrayFormat: true,
      compression: false,
      ...options
    } as Required<JSONOptions>;
  }

  /**
   * 设置进度回调
   * @param callback 进度回调函数
   */
  setProgressCallback(callback: (percentage: number, processed: number) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 导出数据到JSON文件
   * @param data 导出数据
   * @param filePath 文件路径
   * @returns 导出结果
   */
  async exportData(data: ExportData, filePath: string): Promise<ExportResult> {
    const startTime = performance.now();
    
    try {
      // 报告开始进度
      this.reportProgress(0, 0);
      
      // 构建导出对象
      const exportObject = await this.buildExportObject(data);
      
      // 报告50%进度
      this.reportProgress(50, data.totalRecords);
      
      // 格式化 JSON
      const jsonString = this.options.pretty
        ? JSON.stringify(exportObject, this.createReplacer(), this.options.indent)
        : JSON.stringify(exportObject, this.createReplacer());
      
      // 报告75%进度
      this.reportProgress(75, data.totalRecords);
      
      // 写入文件
      await fs.promises.writeFile(filePath, jsonString, {
        encoding: this.options.encoding as BufferEncoding
      });
      
      // 获取文件统计信息
      const fileStats = await fs.promises.stat(filePath);
      
      // 报告完成进度
      this.reportProgress(100, data.totalRecords);
      
      return {
        success: true,
        filePath,
        fileSize: fileStats.size,
        recordCount: data.totalRecords,
        duration: performance.now() - startTime
      };
      
    } catch (error) {
      throw new ExportError(`JSON export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 构建导出对象
   * @param data 导出数据
   * @returns 导出对象
   */
  private async buildExportObject(data: ExportData): Promise<any> {
    const exportObject: any = {};
    
    // 添加元数据
    if (this.options.includeMetadata) {
      exportObject.metadata = this.buildMetadata(data);
    }
    
    // 添加数据
    if (this.options.arrayFormat) {
      exportObject.data = await this.buildArrayFormat(data);
    } else {
      exportObject.datasets = await this.buildDatasetFormat(data);
    }
    
    return exportObject;
  }

  /**
   * 构建元数据
   * @param data 导出数据
   * @returns 元数据对象
   */
  private buildMetadata(data: ExportData): any {
    const metadata: any = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      source: 'Serial-Studio VSCode Extension',
      recordCount: data.totalRecords,
      options: {
        pretty: this.options.pretty,
        arrayFormat: this.options.arrayFormat
      }
    };
    
    // 添加原始元数据
    if (data.metadata) {
      metadata.original = data.metadata;
    }
    
    // 添加数据集信息
    if (data.datasets && data.datasets.length > 0) {
      metadata.datasets = data.datasets.map(ds => ({
        id: ds.id,
        title: ds.title,
        units: ds.units,
        type: ds.dataType,
        widget: ds.widget,
        group: ds.group
      }));
    }
    
    // 添加列信息
    if (data.headers && data.headers.length > 0) {
      metadata.columns = data.headers.map((header, index) => ({
        index,
        name: header,
        type: this.inferColumnType(data, index)
      }));
    }
    
    return metadata;
  }

  /**
   * 构建数组格式数据
   * @param data 导出数据
   * @returns 数组格式数据
   */
  private async buildArrayFormat(data: ExportData): Promise<any[]> {
    const records: any[] = [];
    let processedCount = 0;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        const recordObject = this.formatRecord(record, data.headers);
        records.push(recordObject);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        const recordObject = this.formatRecord(record, data.headers);
        records.push(recordObject);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    }
    
    return records;
  }

  /**
   * 构建数据集格式数据
   * @param data 导出数据
   * @returns 数据集格式数据
   */
  private async buildDatasetFormat(data: ExportData): Promise<any> {
    const datasets: any = {};
    
    // 初始化数据集结构
    for (const dataset of data.datasets || []) {
      datasets[dataset.id] = {
        info: {
          title: dataset.title,
          units: dataset.units,
          type: dataset.dataType,
          widget: dataset.widget,
          group: dataset.group
        },
        values: []
      };
    }
    
    let processedCount = 0;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        this.addRecordToDatasets(record, data.headers, datasets);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        this.addRecordToDatasets(record, data.headers, datasets);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    }
    
    return datasets;
  }

  /**
   * 格式化记录为对象
   * @param record 记录数组
   * @param headers 标题数组
   * @returns 记录对象
   */
  private formatRecord(record: any[], headers: string[] | undefined): any {
    if (!headers || headers.length === 0) {
      return record;
    }
    
    const recordObject: any = {};
    
    for (let i = 0; i < Math.min(record.length, headers.length); i++) {
      const key = headers[i];
      let value = record[i];
      
      // 处理特殊值
      value = this.processValue(value);
      
      recordObject[key] = value;
    }
    
    return recordObject;
  }

  /**
   * 将记录添加到数据集中
   * @param record 记录数组
   * @param headers 标题数组
   * @param datasets 数据集对象
   */
  private addRecordToDatasets(record: any[], headers: string[] | undefined, datasets: any): void {
    if (!headers || headers.length === 0) {
      return;
    }
    
    // 假设第一列是时间戳
    const timestamp = record[0];
    
    for (let i = 1; i < Math.min(record.length, headers.length); i++) {
      const header = headers[i];
      const value = this.processValue(record[i]);
      
      // 查找对应的数据集
      const datasetKey = Object.keys(datasets).find(key => 
        datasets[key].info.title === header || key === header
      );
      
      if (datasetKey && datasets[datasetKey]) {
        datasets[datasetKey].values.push({
          timestamp,
          value
        });
      }
    }
  }

  /**
   * 处理值，确保JSON兼容性
   * @param value 原始值
   * @returns 处理后的值
   */
  private processValue(value: any): any {
    // 处理 null 和 undefined
    if (value == null) {
      return null;
    }
    
    // 处理 NaN 和 Infinity
    if (typeof value === 'number') {
      if (isNaN(value)) {
        return null;
      }
      if (!isFinite(value)) {
        return value > 0 ? 'Infinity' : '-Infinity';
      }
    }
    
    // 处理日期
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // 处理函数（不应该出现，但防御性编程）
    if (typeof value === 'function') {
      return '[Function]';
    }
    
    // 处理 Symbol（不应该出现，但防御性编程）
    if (typeof value === 'symbol') {
      return value.toString();
    }
    
    return value;
  }

  /**
   * 推断列类型
   * @param data 导出数据
   * @param columnIndex 列索引
   * @returns 列类型
   */
  private inferColumnType(data: ExportData, columnIndex: number): string {
    // 简单的类型推断逻辑
    // 实际应该基于数据集信息或采样数据
    if (columnIndex === 0) {
      return 'timestamp';
    }
    
    const dataset = data.datasets && data.datasets[columnIndex - 1];
    if (dataset) {
      return dataset.dataType;
    }
    
    return 'unknown';
  }

  /**
   * 创建JSON序列化替换函数
   * @returns 替换函数
   */
  private createReplacer(): ((key: string, value: any) => any) | undefined {
    return (key: string, value: any) => {
      // 处理特殊数字值
      if (typeof value === 'number') {
        if (isNaN(value)) {
          return null;
        }
        if (!isFinite(value)) {
          return value > 0 ? 'Infinity' : '-Infinity';
        }
      }
      
      return value;
    };
  }

  /**
   * 报告导出进度
   * @param percentage 进度百分比
   * @param processed 已处理记录数
   */
  private reportProgress(percentage: number, processed: number): void {
    if (this.progressCallback) {
      this.progressCallback(Math.min(100, Math.max(0, percentage)), processed);
    }
  }

  /**
   * 验证JSON选项
   * @param options JSON选项
   * @returns 是否有效
   */
  static validateOptions(options: JSONOptions): boolean {
    // 检查缩进
    if (options.indent !== undefined && (options.indent < 0 || options.indent > 10)) {
      return false;
    }
    
    // 检查编码
    const supportedEncodings = ['utf-8', 'utf-16le', 'latin1', 'ascii'];
    if (!supportedEncodings.includes(options.encoding)) {
      return false;
    }
    
    return true;
  }

  /**
   * 创建默认JSON选项
   * @returns 默认JSON选项
   */
  static createDefaultOptions(): JSONOptions {
    return {
      pretty: true,
      indent: 2,
      encoding: 'utf-8',
      includeMetadata: true,
      arrayFormat: true,
      compression: false
    };
  }

  /**
   * 创建紧凑JSON选项
   * @returns 紧凑JSON选项
   */
  static createCompactOptions(): JSONOptions {
    return {
      pretty: false,
      indent: 0,
      encoding: 'utf-8',
      includeMetadata: false,
      arrayFormat: true,
      compression: false
    };
  }

  /**
   * 创建数据集格式选项
   * @returns 数据集格式选项
   */
  static createDatasetFormatOptions(): JSONOptions {
    return {
      pretty: true,
      indent: 2,
      encoding: 'utf-8',
      includeMetadata: true,
      arrayFormat: false,
      compression: false
    };
  }

  /**
   * 格式化JSON字符串
   * @param obj 要格式化的对象
   * @param indent 缩进空格数
   * @returns 格式化的JSON字符串
   */
  static formatJSON(obj: any, indent = 2): string {
    return JSON.stringify(obj, (key, value) => {
      // 处理特殊数字值
      if (typeof value === 'number') {
        if (isNaN(value)) {return null;}
        if (!isFinite(value)) {return value > 0 ? 'Infinity' : '-Infinity';}
      }
      return value;
    }, indent);
  }

  /**
   * 压缩JSON对象（移除不必要的字段）
   * @param obj 原始对象
   * @returns 压缩后的对象
   */
  static compressJSON(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.compressJSON(item));
    }
    
    const compressed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // 跳过null、undefined和空字符串
      if (value != null && value !== '') {
        compressed[key] = this.compressJSON(value);
      }
    }
    
    return compressed;
  }

  /**
   * 验证JSON格式
   * @param jsonString JSON字符串
   * @returns 是否为有效JSON
   */
  static isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 计算JSON字符串大小
   * @param obj 对象
   * @returns 字节大小
   */
  static calculateSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return Buffer.byteLength(jsonString, 'utf-8');
  }
}
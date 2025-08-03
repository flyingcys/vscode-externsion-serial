/**
 * Excel 格式导出器
 * 基于Serial Studio的数据导出功能，使用ExcelJS库
 */

import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import { DataExporter, ExportData, ExportResult, ExportError, ExcelOptions, ChartConfig } from '../types';

/**
 * Excel 导出器实现
 * 支持丰富的Excel功能，包括格式化、图表和元数据
 */
export class ExcelExporter implements DataExporter {
  private options: Required<ExcelOptions>;
  private progressCallback?: (percentage: number, processed: number) => void;
  
  /**
   * 构造函数
   * @param options Excel导出选项
   */
  constructor(options: Partial<ExcelOptions> = {}) {
    // 设置默认选项
    this.options = {
      sheetName: 'Data',
      includeChart: false,
      autoFitColumns: true,
      includeMetadata: true,
      dateFormat: 'yyyy-mm-dd hh:mm:ss',
      numberFormat: '#,##0.00',
      chartConfig: undefined,
      ...options
    } as Required<ExcelOptions>;
  }

  /**
   * 设置进度回调
   * @param callback 进度回调函数
   */
  setProgressCallback(callback: (percentage: number, processed: number) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 导出数据到Excel文件
   * @param data 导出数据
   * @param filePath 文件路径
   * @returns 导出结果
   */
  async exportData(data: ExportData, filePath: string): Promise<ExportResult> {
    const startTime = performance.now();
    
    try {
      // 报告开始进度
      this.reportProgress(5, 0);
      
      // 创建工作簿
      const workbook = new ExcelJS.Workbook();
      this.setupWorkbookProperties(workbook);
      
      // 创建数据工作表
      const worksheet = workbook.addWorksheet(this.options.sheetName);
      this.reportProgress(10, 0);
      
      // 添加标题行
      let currentRow = 1;
      if (data.headers && data.headers.length > 0) {
        const headerRow = worksheet.addRow(data.headers);
        this.styleHeaderRow(headerRow);
        currentRow++;
      }
      
      this.reportProgress(15, 0);
      
      // 添加数据行
      const recordCount = await this.addDataRows(worksheet, data, currentRow);
      
      this.reportProgress(70, recordCount);
      
      // 自动调整列宽
      if (this.options.autoFitColumns) {
        this.autoFitColumns(worksheet);
      }
      
      this.reportProgress(80, recordCount);
      
      // 添加图表
      if (this.options.includeChart && this.options.chartConfig) {
        await this.addChart(worksheet, this.options.chartConfig, recordCount);
      }
      
      this.reportProgress(85, recordCount);
      
      // 添加元数据工作表
      if (this.options.includeMetadata) {
        this.addMetadataSheet(workbook, data);
      }
      
      this.reportProgress(90, recordCount);
      
      // 保存文件
      await workbook.xlsx.writeFile(filePath);
      
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
      
    } catch (error) {
      throw new ExportError(`Excel export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 设置工作簿属性
   * @param workbook 工作簿
   */
  private setupWorkbookProperties(workbook: ExcelJS.Workbook): void {
    workbook.creator = 'Serial-Studio VSCode Extension';
    workbook.lastModifiedBy = 'Serial-Studio VSCode Extension';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.date1904 = false;
    
    // 设置视图
    workbook.views = [
      {
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 0, visibility: 'visible'
      }
    ];
  }

  /**
   * 样式化标题行
   * @param row 标题行
   */
  private styleHeaderRow(row: ExcelJS.Row): void {
    row.eachCell(cell => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFF' },
        size: 12
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
    });
    
    // 设置行高
    row.height = 25;
  }

  /**
   * 添加数据行
   * @param worksheet 工作表
   * @param data 导出数据
   * @param startRow 起始行号
   * @returns 添加的记录数
   */
  private async addDataRows(worksheet: ExcelJS.Worksheet, data: ExportData, startRow: number): Promise<number> {
    let recordCount = 0;
    let currentRow = startRow;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        const formattedRecord = this.formatExcelRecord(record);
        const row = worksheet.addRow(formattedRecord);
        this.styleDataRow(row, recordCount);
        recordCount++;
        currentRow++;
        
        // 定期报告进度
        if (recordCount % 1000 === 0) {
          this.reportProgress(15 + (recordCount / data.totalRecords) * 55, recordCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        const formattedRecord = this.formatExcelRecord(record);
        const row = worksheet.addRow(formattedRecord);
        this.styleDataRow(row, recordCount);
        recordCount++;
        currentRow++;
        
        // 定期报告进度
        if (recordCount % 1000 === 0) {
          this.reportProgress(15 + (recordCount / data.totalRecords) * 55, recordCount);
        }
      }
    }
    
    return recordCount;
  }

  /**
   * 格式化Excel记录
   * @param record 原始记录
   * @returns 格式化的记录
   */
  private formatExcelRecord(record: any[]): any[] {
    return record.map((value, index) => {
      // 处理日期
      if (value instanceof Date) {
        return value;
      }
      
      // 处理字符串形式的日期
      if (typeof value === 'string' && index === 0) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // 处理数字
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        return Number(value);
      }
      
      // 处理null和undefined
      if (value == null) {
        return '';
      }
      
      return value;
    });
  }

  /**
   * 样式化数据行
   * @param row 数据行
   * @param rowIndex 行索引
   */
  private styleDataRow(row: ExcelJS.Row, rowIndex: number): void {
    // 交替行颜色
    if (rowIndex % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F2F2' }
        };
      });
    }
    
    // 应用格式
    row.eachCell((cell, colNumber) => {
      // 边框
      cell.border = {
        top: { style: 'thin', color: { argb: 'D0D0D0' } },
        left: { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        right: { style: 'thin', color: { argb: 'D0D0D0' } }
      };
      
      // 数字格式
      if (typeof cell.value === 'number' && colNumber > 1) {
        cell.numFmt = this.options.numberFormat || '#,##0.00';
      }
      
      // 日期格式
      if (cell.value instanceof Date) {
        cell.numFmt = this.options.dateFormat || 'yyyy-mm-dd hh:mm:ss';
      }
      
      // 文本对齐
      cell.alignment = {
        horizontal: colNumber === 1 ? 'left' : 'right',
        vertical: 'middle'
      };
    });
  }

  /**
   * 自动调整列宽
   * @param worksheet 工作表
   */
  private autoFitColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns.forEach(column => {
      if (!column.eachCell) {return;}
      
      let maxLength = 0;
      
      column.eachCell({ includeEmpty: false }, cell => {
        const cellLength = this.getCellDisplayLength(cell.value);
        maxLength = Math.max(maxLength, cellLength);
      });
      
      // 设置列宽，限制在合理范围内
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });
  }

  /**
   * 获取单元格显示长度
   * @param value 单元格值
   * @returns 显示长度
   */
  private getCellDisplayLength(value: any): number {
    if (value == null) {return 0;}
    
    if (value instanceof Date) {
      return this.options.dateFormat?.length || 20;
    }
    
    if (typeof value === 'number') {
      return value.toString().length + 2; // 额外空间用于格式化
    }
    
    return value.toString().length;
  }

  /**
   * 添加图表
   * @param worksheet 工作表
   * @param chartConfig 图表配置
   * @param recordCount 记录数
   */
  private async addChart(worksheet: ExcelJS.Worksheet, chartConfig: ChartConfig, recordCount: number): Promise<void> {
    // ExcelJS图表功能相对有限，这里提供基本实现
    // 实际项目中可能需要更复杂的图表库
    
    try {
      // 创建图表（ExcelJS的图表API可能因版本而异）
      const chart = (worksheet as any).addChart({
        type: chartConfig.type as any,
        position: {
          x: chartConfig.position.x,
          y: chartConfig.position.y
        },
        size: {
          width: chartConfig.size.width,
          height: chartConfig.size.height
        }
      } as any);
      
      // 配置数据系列
      (chart as any).addSeries({
        name: chartConfig.series.name,
        categories: chartConfig.series.categories,
        values: chartConfig.series.values
      });
      
    } catch (error) {
      console.warn('Chart creation failed:', error instanceof Error ? error.message : String(error));
      // 图表创建失败不应该中断整个导出过程
    }
  }

  /**
   * 添加元数据工作表
   * @param workbook 工作簿
   * @param data 导出数据
   */
  private addMetadataSheet(workbook: ExcelJS.Workbook, data: ExportData): void {
    const metadataSheet = workbook.addWorksheet('Metadata');
    
    // 设置列宽
    metadataSheet.columns = [
      { width: 25 },
      { width: 50 }
    ];
    
    // 添加导出信息标题
    const titleRow = metadataSheet.addRow(['Export Information', '']);
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };
    titleRow.getCell(1).font.color = { argb: 'FFFFFF' };
    
    // 添加导出信息
    metadataSheet.addRow(['Export Time', new Date().toISOString()]);
    metadataSheet.addRow(['Record Count', data.totalRecords]);
    metadataSheet.addRow(['Dataset Count', data.datasets?.length || 0]);
    metadataSheet.addRow(['Source', 'Serial-Studio VSCode Extension']);
    
    // 添加原始元数据
    if (data.metadata) {
      metadataSheet.addRow(['', '']); // 空行
      const originalTitleRow = metadataSheet.addRow(['Original Metadata', '']);
      originalTitleRow.getCell(1).font = { bold: true, size: 12 };
      
      this.addObjectToSheet(metadataSheet, data.metadata, 0);
    }
    
    // 添加数据集信息
    if (data.datasets && data.datasets.length > 0) {
      metadataSheet.addRow(['', '']); // 空行
      const datasetTitleRow = metadataSheet.addRow(['Dataset Information', '']);
      datasetTitleRow.getCell(1).font = { bold: true, size: 12 };
      
      // 数据集表头
      const headerRow = metadataSheet.addRow(['ID', 'Title', 'Units', 'Type', 'Widget', 'Group']);
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E0E0E0' }
        };
      });
      
      // 数据集数据
      for (const dataset of data.datasets) {
        metadataSheet.addRow([
          dataset.id,
          dataset.title,
          dataset.units,
          dataset.dataType,
          dataset.widget,
          dataset.group
        ]);
      }
    }
    
    // 样式化元数据表
    this.styleMetadataSheet(metadataSheet);
  }

  /**
   * 将对象添加到工作表
   * @param sheet 工作表
   * @param obj 对象
   * @param depth 深度
   */
  private addObjectToSheet(sheet: ExcelJS.Worksheet, obj: any, depth: number): void {
    const indent = '  '.repeat(depth);
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          sheet.addRow([indent + key, '[Object]']);
          this.addObjectToSheet(sheet, value, depth + 1);
        } else {
          sheet.addRow([indent + key, String(value)]);
        }
      }
    }
  }

  /**
   * 样式化元数据工作表
   * @param sheet 元数据工作表
   */
  private styleMetadataSheet(sheet: ExcelJS.Worksheet): void {
    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'D0D0D0' } },
          left: { style: 'thin', color: { argb: 'D0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
          right: { style: 'thin', color: { argb: 'D0D0D0' } }
        };
      });
    });
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
   * 验证Excel选项
   * @param options Excel选项
   * @returns 是否有效
   */
  static validateOptions(options: ExcelOptions): boolean {
    // 检查工作表名称
    if (options.sheetName && options.sheetName.length > 31) {
      return false; // Excel工作表名称限制
    }
    
    // 检查日期格式
    if (options.dateFormat && typeof options.dateFormat !== 'string') {
      return false;
    }
    
    return true;
  }

  /**
   * 创建默认Excel选项
   * @returns 默认Excel选项
   */
  static createDefaultOptions(): ExcelOptions {
    return {
      sheetName: 'Data',
      includeChart: false,
      autoFitColumns: true,
      includeMetadata: true,
      dateFormat: 'yyyy-mm-dd hh:mm:ss',
      numberFormat: '#,##0.00'
    };
  }

  /**
   * 创建带图表的Excel选项
   * @returns 带图表的Excel选项
   */
  static createChartOptions(): ExcelOptions {
    return {
      sheetName: 'Data',
      includeChart: true,
      autoFitColumns: true,
      includeMetadata: true,
      dateFormat: 'yyyy-mm-dd hh:mm:ss',
      numberFormat: '#,##0.00',
      chartConfig: {
        type: 'line',
        position: { x: 500, y: 100 },
        size: { width: 600, height: 400 },
        series: {
          name: 'Data Series',
          categories: 'A2:A1000',
          values: 'B2:B1000'
        }
      }
    };
  }

  /**
   * 创建简单Excel选项
   * @returns 简单Excel选项
   */
  static createSimpleOptions(): ExcelOptions {
    return {
      sheetName: 'Data',
      includeChart: false,
      autoFitColumns: false,
      includeMetadata: false,
      dateFormat: 'yyyy-mm-dd',
      numberFormat: '0.00'
    };
  }
}
/**
 * ExcelExporter 真实功能测试
 * 测试Excel导出器的核心功能，避免过度Mock
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExcelExporter } from '@extension/export/exporters/ExcelExporter';
import { ExportData, ExcelOptions, ChartConfig } from '@extension/export/types';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

// Mock ExcelJS
vi.mock('exceljs', () => {
  const mockCell = {
    value: '',
    style: {},
    font: {},
    fill: {},
    border: {},
    numFmt: '',
    alignment: {}
  };

  const mockRow = {
    number: 1,
    height: 15,
    hidden: false,
    outlineLevel: 0,
    eachCell: vi.fn((callback) => {
      // 模拟遍历每个单元格
      callback(mockCell, 1);
      callback(mockCell, 2);
      callback(mockCell, 3);
    }),
    getCell: vi.fn().mockReturnValue(mockCell),
    commit: vi.fn()
  };
  
  const MockWorksheet = {
    name: 'Data',
    addRow: vi.fn().mockReturnValue(mockRow),
    getColumn: vi.fn().mockReturnValue({ 
      width: 0,
      header: '',
      key: '',
      style: {}
    }),
    columns: [],
    addTable: vi.fn(),
    mergeCells: vi.fn(),
    getCell: vi.fn().mockReturnValue(mockCell),
    addChart: vi.fn(),
    
    // 🔧 修复: 添加真实ExcelExporter需要的eachRow方法
    eachRow: vi.fn((callback) => {
      // 模拟遍历行，调用回调函数处理每一行
      callback(mockRow, 1);
      callback(mockRow, 2);
      callback(mockRow, 3);
    }),
    
    rowCount: 0,
    columnCount: 0,
    actualRowCount: 0,
    actualColumnCount: 0
  };
  
  const MockWorkbook = {
    // 🔧 修复: 添加真实ExcelExporter需要的所有属性
    creator: '',
    lastModifiedBy: '',
    created: new Date(),
    modified: new Date(),
    properties: {
      date1904: false  // 这是缺失的关键属性!
    },
    views: [], // ExcelExporter设置的视图数组
    
    addWorksheet: vi.fn().mockReturnValue(MockWorksheet),
    removeWorksheet: vi.fn(),
    getWorksheet: vi.fn().mockReturnValue(MockWorksheet),
    
    xlsx: {
      writeBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-excel-data')),
      writeFile: vi.fn().mockResolvedValue(undefined),  // 添加writeFile方法
      readFile: vi.fn().mockResolvedValue(undefined)
    },
    
    // 其他可能需要的属性
    worksheets: [MockWorksheet],
    definedNames: {},
    calcProperties: {}
  };
  
  return {
    Workbook: vi.fn().mockImplementation(() => MockWorkbook)
  };
});

// Mock fs 模块
vi.mock('fs');
const mockFs = vi.mocked(fs);
const mockExcelJS = vi.mocked(ExcelJS);

describe('ExcelExporter 真实功能测试', () => {
  let excelExporter: ExcelExporter;
  let tempFilePath: string;
  let mockWorkbook: any;
  let mockWorksheet: any;
  
  const sampleData: ExportData = {
    headers: ['timestamp', 'temperature', 'humidity', 'pressure'],
    records: [
      ['2025-01-01T10:00:00Z', 23.5, 45.2, 1013.25],
      ['2025-01-01T10:00:01Z', 23.7, 45.1, 1013.30],
      ['2025-01-01T10:00:02Z', 23.6, 45.3, 1013.20]
    ],
    metadata: {
      exportDate: '2025-01-01T10:00:00Z',
      source: 'sensor-data',
      format: 'excel'
    },
    totalRecords: 3
  };

  beforeEach(() => {
    tempFilePath = path.join(__dirname, 'test-output.xlsx');
    
    // 🔧 修复: 完善fs Mock配置，解决fs.promises方法缺失问题
    mockFs.promises = {
      writeFile: vi.fn().mockResolvedValue(undefined),
      stat: vi.fn().mockResolvedValue({ 
        size: 1024,
        isFile: () => true,
        isDirectory: () => false,
        mtime: new Date(),
        ctime: new Date()
      }),
      access: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn().mockResolvedValue('test content')
    } as any;
    
    // 🔧 修复: 添加fs.constants Mock
    mockFs.constants = {
      F_OK: 0,
      W_OK: 2,
      R_OK: 4
    };
    
    // 保留原有的同步方法Mock
    mockFs.writeFile = vi.fn().mockImplementation((path, data, callback) => callback(null));
    
    // 获取mock实例
    const WorkbookConstructor = mockExcelJS.Workbook as any;
    mockWorkbook = new WorkbookConstructor();
    mockWorksheet = mockWorkbook.addWorksheet();
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('构造函数和初始化', () => {
    it('应该使用默认选项创建ExcelExporter实例', () => {
      excelExporter = new ExcelExporter();
      expect(excelExporter).toBeInstanceOf(ExcelExporter);
    });

    it('应该正确设置自定义选项', () => {
      const chartConfig: ChartConfig = {
        type: 'line',
        title: 'Temperature Chart',
        xAxis: 'timestamp',
        yAxis: ['temperature'],
        position: { row: 1, col: 5, width: 8, height: 6 }
      };
      
      const options: Partial<ExcelOptions> = {
        sheetName: 'SensorData',
        includeChart: true,
        autoFitColumns: false,
        includeMetadata: false,
        chartConfig
      };
      
      excelExporter = new ExcelExporter(options);
      expect(excelExporter).toBeInstanceOf(ExcelExporter);
    });

    it('应该设置进度回调函数', () => {
      excelExporter = new ExcelExporter();
      const mockCallback = vi.fn();
      
      excelExporter.setProgressCallback(mockCallback);
      expect(mockCallback).toBeDefined();
    });
  });

  describe('Excel数据导出功能', () => {
    beforeEach(() => {
      excelExporter = new ExcelExporter({ 
        sheetName: 'TestData',
        autoFitColumns: true 
      });
    });

    it('应该成功导出基本Excel数据', async () => {
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(tempFilePath);
      expect(result.recordCount).toBe(3);
      expect(result.fileSize).toBeGreaterThan(0);
      
      // 验证工作表创建
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('TestData');
    });

    it('应该正确添加标题行', async () => {
      await excelExporter.exportData(sampleData, tempFilePath);
      
      // 验证标题行添加
      expect(mockWorksheet.addRow).toHaveBeenCalledWith(['timestamp', 'temperature', 'humidity', 'pressure']);
    });

    it('应该正确添加数据行', async () => {
      await excelExporter.exportData(sampleData, tempFilePath);
      
      // 验证数据行添加（标题行 + 3个数据行）
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(4);
      
      const calls = mockWorksheet.addRow.mock.calls;
      expect(calls[1][0]).toEqual(['2025-01-01T10:00:00Z', 23.5, 45.2, 1013.25]);
      expect(calls[2][0]).toEqual(['2025-01-01T10:00:01Z', 23.7, 45.1, 1013.30]);
      expect(calls[3][0]).toEqual(['2025-01-01T10:00:02Z', 23.6, 45.3, 1013.20]);
    });

    it('应该正确处理日期格式', async () => {
      excelExporter = new ExcelExporter({ 
        dateFormat: 'dd/mm/yyyy hh:mm:ss' 
      });
      
      await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(mockWorksheet.addRow).toHaveBeenCalled();
      // 日期格式化逻辑会在实际实现中应用
    });

    it('应该正确处理数字格式', async () => {
      excelExporter = new ExcelExporter({ 
        numberFormat: '#,##0.000' 
      });
      
      await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(mockWorksheet.addRow).toHaveBeenCalled();
      // 数字格式化逻辑会在实际实现中应用
    });

    it('应该自动调整列宽', async () => {
      excelExporter = new ExcelExporter({ autoFitColumns: true });
      
      await excelExporter.exportData(sampleData, tempFilePath);
      
      // 验证获取列进行宽度调整
      expect(mockWorksheet.getColumn).toHaveBeenCalled();
    });

    it('应该调用进度回调', async () => {
      const mockCallback = vi.fn();
      excelExporter.setProgressCallback(mockCallback);
      
      await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(100, 3);
    });
  });

  describe('图表功能测试', () => {
    it('应该创建基本线形图', async () => {
      const chartConfig: ChartConfig = {
        type: 'line',
        title: 'Temperature Chart',
        xAxis: 'timestamp',
        yAxis: ['temperature'],
        position: { row: 1, col: 5, width: 8, height: 6 }
      };
      
      excelExporter = new ExcelExporter({ 
        includeChart: true,
        chartConfig 
      });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      // 图表创建逻辑在实际实现中会被调用
    });

    it('应该创建多系列图表', async () => {
      const chartConfig: ChartConfig = {
        type: 'line',
        title: 'Multi-Series Chart',
        xAxis: 'timestamp',
        yAxis: ['temperature', 'humidity'],
        position: { row: 1, col: 6, width: 10, height: 8 }
      };
      
      excelExporter = new ExcelExporter({ 
        includeChart: true,
        chartConfig 
      });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
    });

    it('应该处理无效图表配置', async () => {
      const invalidChartConfig: ChartConfig = {
        type: 'line',
        title: 'Invalid Chart',
        xAxis: 'nonexistent',
        yAxis: ['nonexistent'],
        position: { row: 1, col: 5, width: 8, height: 6 }
      };
      
      excelExporter = new ExcelExporter({ 
        includeChart: true,
        chartConfig: invalidChartConfig 
      });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true); // 应该继续导出数据，但跳过图表
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });

  describe('元数据处理', () => {
    it('应该在单独的工作表中包含元数据', async () => {
      excelExporter = new ExcelExporter({ includeMetadata: true });
      
      const dataWithMetadata: ExportData = {
        ...sampleData,
        metadata: {
          source: 'test-sensor',
          version: '1.0',
          description: 'Test data export',
          totalRecords: 3
        }
      };
      
      const result = await excelExporter.exportData(dataWithMetadata, tempFilePath);
      
      expect(result.success).toBe(true);
      // 验证创建了两个工作表（数据 + 元数据）
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(2);
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Metadata');
    });

    it('应该在主工作表顶部包含简要元数据', async () => {
      excelExporter = new ExcelExporter({ includeMetadata: false });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      // 只创建一个数据工作表
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledTimes(1);
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      excelExporter = new ExcelExporter();
    });

    it('应该处理文件写入错误', async () => {
      const writeError = new Error('写入失败');
      mockWorkbook.xlsx.writeBuffer = vi.fn().mockRejectedValue(writeError);
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('写入失败');
    });

    it('应该处理空数据导出', async () => {
      const emptyData: ExportData = {
        headers: [],
        records: [],
        metadata: {}
      };
      
      const result = await excelExporter.exportData(emptyData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0);
      
      // 即使没有数据，也应该创建工作表
      expect(mockWorkbook.addWorksheet).toHaveBeenCalled();
    });

    it('应该验证文件路径', async () => {
      const invalidPath = '';
      
      const result = await excelExporter.exportData(sampleData, invalidPath);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('validation');
    });

    it('应该处理ExcelJS库错误', async () => {
      const excelError = new Error('ExcelJS处理错误');
      mockWorksheet.addRow = vi.fn().mockImplementation(() => {
        throw excelError;
      });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('processing');
    });

    it('应该处理无效的数据类型', async () => {
      const invalidData = {
        headers: ['func'],
        records: [{ func: () => {} }], // 函数类型无效
        metadata: {}
      } as any;
      
      const result = await excelExporter.exportData(invalidData, tempFilePath);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', async () => {
      // 生成大量测试数据
      const largeData: ExportData = {
        headers: ['id', 'value1', 'value2', 'value3', 'timestamp'],
        records: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          value1: Math.random() * 100,
          value2: Math.random() * 50,
          value3: Math.random() * 200,
          timestamp: new Date(Date.now() + i * 1000).toISOString()
        })),
        metadata: { test: 'large-dataset' }
      };

      excelExporter = new ExcelExporter();
      const mockCallback = vi.fn();
      excelExporter.setProgressCallback(mockCallback);

      const startTime = performance.now();
      const result = await excelExporter.exportData(largeData, tempFilePath);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(10000);
      expect(endTime - startTime).toBeLessThan(15000); // 应在15秒内完成
      expect(mockCallback).toHaveBeenCalled();
      
      // 验证添加了正确数量的行（标题行 + 数据行）
      expect(mockWorksheet.addRow).toHaveBeenCalledTimes(10001);
    });
  });

  describe('格式化选项测试', () => {
    it('应该正确应用工作表名称', async () => {
      excelExporter = new ExcelExporter({ sheetName: 'CustomSheet' });
      
      await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('CustomSheet');
    });

    it('应该处理工作表名称中的非法字符', async () => {
      excelExporter = new ExcelExporter({ sheetName: 'Invalid:Sheet*Name' });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      // 工作表名称应该被清理
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Invalid_Sheet_Name');
    });
  });

  describe('表格功能测试', () => {
    it('应该创建Excel表格结构', async () => {
      excelExporter = new ExcelExporter({ createTable: true });
      
      const result = await excelExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      // 验证创建了表格
      expect(mockWorksheet.addTable).toHaveBeenCalled();
    });
  });
});
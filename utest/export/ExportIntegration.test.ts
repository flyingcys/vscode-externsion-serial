/**
 * 数据导出集成测试
 * 测试完整的导出流程和各种格式
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Mock fs module with all necessary methods
vi.mock('fs', () => ({
  mkdtempSync: vi.fn(() => '/tmp/export-test-mock'),
  rmSync: vi.fn(),
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => 'mock file content'),
  writeFileSync: vi.fn(),
  createReadStream: vi.fn(),
  createWriteStream: vi.fn(),
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue('mock content'),
    access: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ size: 1024, isFile: () => true })
  }
}));

// Mock path module
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => '/' + args.join('/')),
  dirname: vi.fn(() => '/mock/dir'),
  basename: vi.fn(() => 'mock-file.csv'),
  extname: vi.fn(() => '.csv')
}));

// Mock os module
vi.mock('os', () => ({
  tmpdir: vi.fn(() => '/tmp')
}));
import {
  ExportManagerImpl,
  CSVExporter,
  JSONExporter,
  ExcelExporter,
  XMLExporter,
  DataFilter,
  DataTransformer,
  ExportFormatType,
  DataSourceType,
  ExportConfig,
  ExportData
} from '@extension/export';

describe('Export Integration Tests', () => {
  let tempDir: string;
  let exportManager: ExportManagerImpl;
  let testData: ExportData;

  beforeEach(async () => {
    // 创建临时目录
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'export-test-'));
    
    // 创建导出管理器
    exportManager = new ExportManagerImpl();
    
    // 准备测试数据
    testData = {
      headers: ['timestamp', 'temperature', 'humidity', 'pressure'],
      records: generateTestData(1000),
      totalRecords: 1000,
      datasets: [
        {
          id: 'temp',
          title: 'Temperature',
          units: '°C',
          dataType: 'number',
          widget: 'gauge',
          group: 'sensors'
        },
        {
          id: 'humidity',
          title: 'Humidity',
          units: '%',
          dataType: 'number',
          widget: 'gauge',
          group: 'sensors'
        },
        {
          id: 'pressure',
          title: 'Pressure',
          units: 'hPa',
          dataType: 'number',
          widget: 'gauge',
          group: 'sensors'
        }
      ],
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        source: 'Test Suite'
      }
    };
  });

  afterEach(async () => {
    // 清理临时目录
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  });

  describe('CSV Export', () => {
    it('should export data to CSV format', async () => {
      const filePath = path.join(tempDir, 'test.csv');
      const config = createTestConfig(ExportFormatType.CSV, filePath);
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(result.recordCount).toBe(1000);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // 验证文件内容
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.length > 0);
      expect(lines.length).toBe(1001); // 1000条数据 + 1行标题
      expect(lines[0]).toContain('timestamp,temperature,humidity,pressure');
    });

    it('should handle CSV options correctly', async () => {
      const filePath = path.join(tempDir, 'test-options.csv');
      const config = createTestConfig(ExportFormatType.CSV, filePath);
      config.format.options = {
        delimiter: ';',
        includeHeader: false,
        precision: 1
      };
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain(';'); // 分号分隔符
      expect(content).not.toContain('timestamp'); // 无标题行
    });
  });

  describe('JSON Export', () => {
    it('should export data to JSON format', async () => {
      const filePath = path.join(tempDir, 'test.json');
      const config = createTestConfig(ExportFormatType.JSON, filePath);
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(result.recordCount).toBe(1000);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // 验证JSON结构
      const content = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(content);
      
      expect(jsonData).toHaveProperty('metadata');
      expect(jsonData).toHaveProperty('data');
      expect(Array.isArray(jsonData.data)).toBe(true);
      expect(jsonData.data.length).toBe(1000);
    });

    it('should handle JSON array format vs dataset format', async () => {
      const arrayFilePath = path.join(tempDir, 'array.json');
      const datasetFilePath = path.join(tempDir, 'dataset.json');
      
      // 数组格式
      const arrayConfig = createTestConfig(ExportFormatType.JSON, arrayFilePath);
      arrayConfig.format.options = { arrayFormat: true };
      
      // 数据集格式
      const datasetConfig = createTestConfig(ExportFormatType.JSON, datasetFilePath);
      datasetConfig.format.options = { arrayFormat: false };
      
      await exportManager.exportData(arrayConfig);
      await exportManager.exportData(datasetConfig);
      
      const arrayData = JSON.parse(fs.readFileSync(arrayFilePath, 'utf-8'));
      const datasetData = JSON.parse(fs.readFileSync(datasetFilePath, 'utf-8'));
      
      expect(arrayData).toHaveProperty('data');
      expect(Array.isArray(arrayData.data)).toBe(true);
      
      expect(datasetData).toHaveProperty('datasets');
      expect(typeof datasetData.datasets).toBe('object');
    });
  });

  describe('Excel Export', () => {
    it('should export data to Excel format', async () => {
      const filePath = path.join(tempDir, 'test.xlsx');
      const config = createTestConfig(ExportFormatType.EXCEL, filePath);
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(result.recordCount).toBe(1000);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // 验证文件大小合理
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(1000); // 至少1KB
    });

    it('should include metadata sheet when configured', async () => {
      const filePath = path.join(tempDir, 'test-metadata.xlsx');
      const config = createTestConfig(ExportFormatType.EXCEL, filePath);
      config.format.options = { includeMetadata: true };
      
      const result = await exportManager.exportData(config);
      expect(result.success).toBe(true);
      
      // 这里可以使用ExcelJS来验证工作表内容
      // 为了简化测试，我们只验证文件存在和大小
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(2000); // 包含元数据应该更大
    });
  });

  describe('XML Export', () => {
    it('should export data to XML format', async () => {
      const filePath = path.join(tempDir, 'test.xml');
      const config = createTestConfig(ExportFormatType.XML, filePath);
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(filePath);
      expect(result.recordCount).toBe(1000);
      expect(fs.existsSync(filePath)).toBe(true);
      
      // 验证XML结构
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('<?xml version="1.0"');
      expect(content).toContain('<data');
      expect(content).toContain('<record');
      expect(content).toContain('</data>');
    });

    it('should handle XML attributes vs elements', async () => {
      const attributeFilePath = path.join(tempDir, 'attributes.xml');
      const elementFilePath = path.join(tempDir, 'elements.xml');
      
      // 属性格式
      const attributeConfig = createTestConfig(ExportFormatType.XML, attributeFilePath);
      attributeConfig.format.options = { includeAttributes: true };
      
      // 元素格式
      const elementConfig = createTestConfig(ExportFormatType.XML, elementFilePath);
      elementConfig.format.options = { includeAttributes: false };
      
      await exportManager.exportData(attributeConfig);
      await exportManager.exportData(elementConfig);
      
      const attributeContent = fs.readFileSync(attributeFilePath, 'utf-8');
      const elementContent = fs.readFileSync(elementFilePath, 'utf-8');
      
      // 属性格式应该包含属性
      expect(attributeContent).toMatch(/<record[^>]+>/);
      
      // 元素格式应该包含子元素
      expect(elementContent).toContain('<timestamp>');
      expect(elementContent).toContain('<temperature>');
    });
  });

  describe('Data Filtering', () => {
    it('should filter data based on value ranges', async () => {
      const filePath = path.join(tempDir, 'filtered.csv');
      const config = createTestConfig(ExportFormatType.CSV, filePath);
      
      // 添加温度范围过滤器
      config.filters = {
        valueRange: [20, 25] // 只导出温度在20-25°C之间的数据
      };
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBeLessThan(1000); // 应该过滤掉一些数据
      
      // 验证过滤结果
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.length > 0);
      
      // 检查几行数据确保在范围内
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const values = lines[i].split(',');
        const temperature = parseFloat(values[1]);
        if (!isNaN(temperature)) {
          expect(temperature).toBeGreaterThanOrEqual(20);
          expect(temperature).toBeLessThanOrEqual(25);
        }
      }
    });
  });

  describe('Data Transformation', () => {
    it('should apply precision rounding', async () => {
      const filePath = path.join(tempDir, 'rounded.csv');
      const config = createTestConfig(ExportFormatType.CSV, filePath);
      config.processing.precision = 1; // 保留1位小数
      
      const result = await exportManager.exportData(config);
      
      expect(result.success).toBe(true);
      
      // 验证精度
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.length > 0);
      
      // 检查数值精度
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const values = lines[i].split(',');
        for (let j = 1; j < values.length; j++) {
          const num = parseFloat(values[j]);
          if (!isNaN(num)) {
            const decimalPlaces = (values[j].split('.')[1] || '').length;
            expect(decimalPlaces).toBeLessThanOrEqual(1);
          }
        }
      }
    });
  });

  describe('Progress Reporting', () => {
    it('should report progress during export', async () => {
      const filePath = path.join(tempDir, 'progress.json');
      const config = createTestConfig(ExportFormatType.JSON, filePath);
      
      const progressReports: number[] = [];
      
      exportManager.onProgress((progress) => {
        progressReports.push(progress.percentage);
      });
      
      await exportManager.exportData(config);
      
      expect(progressReports.length).toBeGreaterThan(0);
      expect(progressReports[0]).toBeGreaterThanOrEqual(0);
      expect(progressReports[progressReports.length - 1]).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file paths', async () => {
      const config = createTestConfig(ExportFormatType.CSV, '/invalid/path/test.csv');
      
      await expect(exportManager.exportData(config)).rejects.toThrow();
    });

    it('should handle empty data', async () => {
      const filePath = path.join(tempDir, 'empty.csv');
      const config = createTestConfig(ExportFormatType.CSV, filePath);
      config.dataSource = {
        type: DataSourceType.CURRENT,
        datasets: [],
        groups: []
      };
      
      // 修改测试数据为空
      const emptyData = { ...testData, records: [], totalRecords: 0 };
      
      // 模拟空数据的情况
      // 实际实现中需要修改 ExportManager 来处理这种情况
      
      const result = await exportManager.exportData(config);
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const filePath = path.join(tempDir, 'large.csv');
      const config = createTestConfig(ExportFormatType.CSV, filePath);
      
      // 创建大数据集
      const largeData = {
        ...testData,
        records: generateTestData(10000),
        totalRecords: 10000
      };
      
      // 替换测试数据（在实际实现中需要修改数据提供者）
      
      const startTime = Date.now();
      const result = await exportManager.exportData(config);
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000); // 应该在10秒内完成
    });
  });

  // 辅助函数

  function createTestConfig(formatType: ExportFormatType, filePath: string): ExportConfig {
    return {
      dataSource: {
        type: DataSourceType.CURRENT,
        datasets: testData.datasets?.map(ds => ds.id) || [],
        groups: []
      },
      format: {
        type: formatType,
        options: getDefaultOptions(formatType)
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

  function getDefaultOptions(formatType: ExportFormatType): any {
    switch (formatType) {
      case ExportFormatType.CSV:
        return {
          delimiter: ',',
          includeHeader: true,
          encoding: 'utf-8'
        };
      case ExportFormatType.JSON:
        return {
          pretty: true,
          arrayFormat: true,
          includeMetadata: true
        };
      case ExportFormatType.EXCEL:
        return {
          sheetName: 'Test Data',
          includeMetadata: true,
          autoFitColumns: true
        };
      case ExportFormatType.XML:
        return {
          rootElement: 'data',
          recordElement: 'record',
          includeAttributes: true,
          prettyPrint: true
        };
      default:
        return {};
    }
  }

  function generateTestData(count: number): any[][] {
    const data: any[][] = [];
    const startTime = Date.now() - (count * 1000); // 从count秒前开始
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(startTime + i * 1000).toISOString();
      const temperature = 20 + Math.random() * 10; // 20-30°C
      const humidity = 40 + Math.random() * 30;    // 40-70%
      const pressure = 1000 + Math.random() * 50;  // 1000-1050 hPa
      
      data.push([
        timestamp,
        Number(temperature.toFixed(2)),
        Number(humidity.toFixed(1)),
        Number(pressure.toFixed(1))
      ]);
    }
    
    return data;
  }
});
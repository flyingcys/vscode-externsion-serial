/**
 * ExportIndex.test.ts
 * Export模块入口文件测试
 * 专门测试index.ts中的所有导出函数
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// Mock modules
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn()
  },
  existsSync: vi.fn()
}));

vi.mock('path', () => ({
  extname: vi.fn(),
  basename: vi.fn(),
  dirname: vi.fn(),
  join: vi.fn()
}));

// Mock exporters - Create class constructors that return mock instances
class MockCSVExporter {
  exportData = vi.fn().mockResolvedValue({
    success: true,
    filePath: '/test/export.csv',
    fileSize: 1024,
    recordCount: 100,
    duration: 150
  });
}

class MockJSONExporter {
  exportData = vi.fn().mockResolvedValue({
    success: true,
    filePath: '/test/export.json',
    fileSize: 2048,
    recordCount: 100,
    duration: 200
  });
}

class MockExcelExporter {
  exportData = vi.fn().mockResolvedValue({
    success: true,
    filePath: '/test/export.xlsx',
    fileSize: 4096,
    recordCount: 100,
    duration: 300
  });
}

class MockXMLExporter {
  exportData = vi.fn().mockResolvedValue({
    success: true,
    filePath: '/test/export.xml',
    fileSize: 3072,
    recordCount: 100,
    duration: 250
  });
}

vi.mock('../../src/extension/export/exporters/CSVExporter', () => ({
  CSVExporter: MockCSVExporter
}));

vi.mock('../../src/extension/export/exporters/JSONExporter', () => ({
  JSONExporter: MockJSONExporter
}));

vi.mock('../../src/extension/export/exporters/ExcelExporter', () => ({
  ExcelExporter: MockExcelExporter
}));

vi.mock('../../src/extension/export/exporters/XMLExporter', () => ({
  XMLExporter: MockXMLExporter
}));

// Mock ExportManager
const mockExportManager = {
  exportData: vi.fn().mockResolvedValue({
    success: true,
    filePath: '/test/export.csv',
    fileSize: 1024,
    recordCount: 100,
    duration: 150
  })
};

vi.mock('../../src/extension/export/ExportManager', () => ({
  getExportManager: vi.fn().mockReturnValue(mockExportManager),
  ExportManagerImpl: vi.fn()
}));

// Mock StreamingCSVExporter
const mockStartExport = vi.fn().mockResolvedValue('streaming_handle_123');
const mockWriteDataPoint = vi.fn().mockResolvedValue(undefined);
const mockFinishExport = vi.fn().mockResolvedValue({
  success: true,
  filePath: '/test/streaming.csv',
  fileSize: 5120,
  recordCount: 500,
  duration: 1000
});

const mockStreamingExporter = {
  startExport: mockStartExport,
  writeDataPoint: mockWriteDataPoint,
  finishExport: mockFinishExport
};

// Create mock implementation that ensures the function returns the mock object
const mockGetStreamingCSVExporter = vi.fn().mockReturnValue(mockStreamingExporter);

vi.mock('../../src/extension/export/StreamingCSVExporter', () => ({
  getStreamingCSVExporter: mockGetStreamingCSVExporter,
  StreamingCSVExporter: vi.fn()
}));

describe('Export模块入口文件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup mocks to ensure they return correct values
    mockGetStreamingCSVExporter.mockReturnValue(mockStreamingExporter);
    mockStartExport.mockResolvedValue('streaming_handle_123');
    mockWriteDataPoint.mockResolvedValue(undefined);
    mockFinishExport.mockResolvedValue({
      success: true,
      filePath: '/test/streaming.csv',
      fileSize: 5120,
      recordCount: 500,
      duration: 1000
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('基础导出管理器创建', () => {
    test('应该创建默认配置的导出管理器', async () => {
      const { createExportManager } = await import('../../src/extension/export');
      
      const manager = await createExportManager();
      
      expect(manager).toBeDefined();
      expect(manager).toBe(mockExportManager);
    });
  });

  describe('快速导出功能测试', () => {
    const testData = [
      ['Name', 'Age', 'Score'],
      ['Alice', '25', '95.5'],
      ['Bob', '30', '87.2'],
      ['Charlie', '28', '92.1']
    ];
    const testHeaders = ['Name', 'Age', 'Score'];
    const testFilePath = '/test/quick_export.csv';

    test('应该快速导出CSV数据', async () => {
      const { quickExportCSV } = await import('../../src/extension/export');
      
      const result = await quickExportCSV(testData, testHeaders, testFilePath);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/export.csv');
    });

    test('应该快速导出JSON数据', async () => {
      const { quickExportJSON } = await import('../../src/extension/export');
      
      const result = await quickExportJSON(testData, testHeaders, '/test/quick_export.json');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/export.json');
    });

    test('应该快速导出Excel数据', async () => {
      const { quickExportExcel } = await import('../../src/extension/export');
      
      const result = await quickExportExcel(testData, testHeaders, '/test/quick_export.xlsx');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/export.xlsx');
    });

    test('应该快速导出XML数据', async () => {
      const { quickExportXML } = await import('../../src/extension/export');
      
      const result = await quickExportXML(testData, testHeaders, '/test/quick_export.xml');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/export.xml');
    });
  });

  describe('流式导出功能测试', () => {
    const testConfig = {
      outputDirectory: '/test/streaming',
      headers: ['timestamp', 'value1', 'value2'],
      selectedFields: [0, 1, 2],
      includeTimestamp: true,
      csvOptions: {
        delimiter: ',',
        quote: '"',
        escape: '"',
        lineEnding: '\n',
        encoding: 'utf-8' as const
      },
      bufferSize: 8192,
      writeInterval: 1000,
      chunkSize: 1000
    };

    test('应该创建流式CSV导出', async () => {
      const { createStreamingCSVExport } = await import('../../src/extension/export');
      
      const handle = await createStreamingCSVExport(testConfig);
      
      expect(handle).toBe('streaming_handle_123');
      expect(mockStreamingExporter.startExport).toHaveBeenCalledWith(testConfig);
    });

    test('应该快速启动实时数据流式导出', async () => {
      const { quickStreamingExport } = await import('../../src/extension/export');
      
      const handle = await quickStreamingExport(
        '/test/streaming',
        ['field1', 'field2', 'field3'],
        { bufferSize: 4096, chunkSize: 500 }
      );
      
      expect(handle).toBe('streaming_handle_123');
      expect(mockStreamingExporter.startExport).toHaveBeenCalledWith({
        outputDirectory: '/test/streaming',
        headers: ['field1', 'field2', 'field3'],
        selectedFields: [0, 1, 2],
        includeTimestamp: true,
        csvOptions: {
          delimiter: ',',
          quote: '"',
          escape: '"',
          lineEnding: '\n',
          encoding: 'utf-8'
        },
        bufferSize: 4096,
        writeInterval: 1000,
        chunkSize: 500
      });
    });

    test('应该写入实时数据到流式导出', async () => {
      const { writeStreamingData } = await import('../../src/extension/export');
      
      const testHandle = 'streaming_handle_123';
      const testValues = [10.5, 20.3, 30.1];
      const testTimestamp = new Date('2023-01-01T12:00:00Z');
      
      await writeStreamingData(testHandle, testValues, testTimestamp);
      
      expect(mockStreamingExporter.writeDataPoint).toHaveBeenCalledWith(testHandle, {
        timestamp: testTimestamp,
        values: testValues,
        metadata: {}
      });
    });

    test('应该写入实时数据到流式导出（不指定时间戳）', async () => {
      const { writeStreamingData } = await import('../../src/extension/export');
      
      const testHandle = 'streaming_handle_123';
      const testValues = [15.2, 25.7, 35.9];
      
      await writeStreamingData(testHandle, testValues);
      
      expect(mockStreamingExporter.writeDataPoint).toHaveBeenCalledWith(testHandle, {
        timestamp: undefined,
        values: testValues,
        metadata: {}
      });
    });

    test('应该完成流式导出', async () => {
      const { finishStreamingExport } = await import('../../src/extension/export');
      
      const testHandle = 'streaming_handle_123';
      
      await finishStreamingExport(testHandle);
      
      expect(mockStreamingExporter.finishExport).toHaveBeenCalledWith(testHandle);
    });
  });

  describe('增强流式导出配置测试', () => {
    test('应该创建基础增强流式导出配置', async () => {
      const { createEnhancedStreamingConfig } = await import('../../src/extension/export');
      
      const baseConfig = {
        outputDirectory: '/test/enhanced',
        headers: ['time', 'data1', 'data2'],
        selectedFields: [0, 1, 2],
        includeTimestamp: true,
        csvOptions: {
          delimiter: ',',
          quote: '"',
          escape: '"',
          lineEnding: '\n',
          encoding: 'utf-8' as const
        },
        bufferSize: 8192,
        writeInterval: 1000,
        chunkSize: 1000
      };
      
      const enhancedConfig = createEnhancedStreamingConfig(baseConfig);
      
      expect(enhancedConfig).toBeDefined();
      expect(enhancedConfig.outputDirectory).toBe('/test/enhanced');
      expect(enhancedConfig.headers).toEqual(['time', 'data1', 'data2']);
      expect(enhancedConfig.customFormatOptions).toBeDefined();
      expect(enhancedConfig.customFormatOptions.fieldSelection.enabled).toBe(true);
      expect(enhancedConfig.customFormatOptions.fieldSelection.selectedFields).toEqual([0, 1, 2]);
      expect(enhancedConfig.customFormatOptions.customDelimiter.enabled).toBe(false);
      expect(enhancedConfig.customFormatOptions.customDelimiter.delimiter).toBe(',');
      expect(enhancedConfig.largeDataProcessing).toBeDefined();
      expect(enhancedConfig.largeDataProcessing.chunkExport.enabled).toBe(true);
      expect(enhancedConfig.largeDataProcessing.chunkExport.chunkSize).toBe(1000);
      expect(enhancedConfig.largeDataProcessing.compression.enabled).toBe(false);
      expect(enhancedConfig.largeDataProcessing.pauseResume.enabled).toBe(true);
    });

    test('应该创建带自定义选项的增强流式导出配置', async () => {
      const { createEnhancedStreamingConfig } = await import('../../src/extension/export');
      
      const baseConfig = {
        outputDirectory: '/test/enhanced',
        headers: ['timestamp', 'sensor1', 'sensor2'],
        selectedFields: [0, 1, 2],
        includeTimestamp: true,
        csvOptions: {
          delimiter: ';',
          quote: '\'',
          escape: '\\',
          lineEnding: '\r\n',
          encoding: 'utf-8' as const
        },
        bufferSize: 16384,
        writeInterval: 2000,
        chunkSize: 2000
      };
      
      const options = {
        customDelimiter: '|',
        enableCompression: true,
        maxMemoryUsage: 200,
        enablePauseResume: false
      };
      
      const enhancedConfig = createEnhancedStreamingConfig(baseConfig, options);
      
      expect(enhancedConfig.customFormatOptions.customDelimiter.enabled).toBe(true);
      expect(enhancedConfig.customFormatOptions.customDelimiter.delimiter).toBe('|');
      expect(enhancedConfig.customFormatOptions.customDelimiter.customQuote).toBe('\'');
      expect(enhancedConfig.customFormatOptions.customDelimiter.customEscape).toBe('\\');
      expect(enhancedConfig.largeDataProcessing.chunkExport.maxMemoryUsage).toBe(200);
      expect(enhancedConfig.largeDataProcessing.compression.enabled).toBe(true);
      expect(enhancedConfig.largeDataProcessing.compression.algorithm).toBe('gzip');
      expect(enhancedConfig.largeDataProcessing.compression.level).toBe(6);
      expect(enhancedConfig.largeDataProcessing.pauseResume.enabled).toBe(false);
    });

    test('应该处理没有csvOptions的基础配置', async () => {
      const { createEnhancedStreamingConfig } = await import('../../src/extension/export');
      
      const baseConfig = {
        outputDirectory: '/test/minimal',
        headers: ['data'],
        selectedFields: [0],
        includeTimestamp: false,
        bufferSize: 4096,
        writeInterval: 500,
        chunkSize: 500
      };
      
      const enhancedConfig = createEnhancedStreamingConfig(baseConfig);
      
      expect(enhancedConfig.customFormatOptions.customDelimiter.delimiter).toBe(',');
      expect(enhancedConfig.customFormatOptions.customDelimiter.customQuote).toBe('"');
      expect(enhancedConfig.customFormatOptions.customDelimiter.customEscape).toBe('"');
    });

    test('应该处理没有selectedFields的基础配置', async () => {
      const { createEnhancedStreamingConfig } = await import('../../src/extension/export');
      
      const baseConfig = {
        outputDirectory: '/test/no-fields',
        headers: ['field1', 'field2'],
        includeTimestamp: true,
        csvOptions: {
          delimiter: ',',
          quote: '"',
          escape: '"',
          lineEnding: '\n',
          encoding: 'utf-8' as const
        },
        bufferSize: 8192,
        writeInterval: 1000,
        chunkSize: 1000
      };
      
      const enhancedConfig = createEnhancedStreamingConfig(baseConfig);
      
      expect(enhancedConfig.customFormatOptions.fieldSelection.selectedFields).toEqual([]);
      expect(enhancedConfig.customFormatOptions.fieldSelection.fieldOrder).toEqual([]);
    });
  });

  describe('边界条件测试', () => {
    test('应该处理空数据导出', async () => {
      const { quickExportCSV } = await import('../../src/extension/export');
      
      const result = await quickExportCSV([], [], '/test/empty.csv');
      
      expect(result).toBeDefined();
    });

    test('应该处理单行数据导出', async () => {
      const { quickExportJSON } = await import('../../src/extension/export');
      
      const singleRow = [['test']];
      const singleHeader = ['header'];
      
      const result = await quickExportJSON(singleRow, singleHeader, '/test/single.json');
      
      expect(result).toBeDefined();
    });

    test('应该处理空头部的流式导出', async () => {
      const { quickStreamingExport } = await import('../../src/extension/export');
      
      const handle = await quickStreamingExport('/test/no-headers', []);
      
      expect(handle).toBe('streaming_handle_123');
      expect(mockStreamingExporter.startExport).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: [],
          selectedFields: []
        })
      );
    });
  });
});
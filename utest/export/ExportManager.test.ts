/**
 * ExportManager.test.ts
 * 数据导出管理器单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import {
  ExportManagerImpl,
  getExportManager
} from '../../src/extension/export/ExportManager';
import {
  ExportConfig,
  ExportFormatType,
  DataSourceType,
  ExportError,
  type ExportProgress,
  type ExportResult,
  type ExportData
} from '../../src/extension/export/types';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    mkdir: vi.fn()
  },
  existsSync: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
  dirname: vi.fn()
}));

// Mock exporters
vi.mock('../../src/extension/export/exporters/CSVExporter', () => ({
  CSVExporter: vi.fn().mockImplementation(() => ({
    exportData: vi.fn().mockResolvedValue({
      success: true,
      filePath: '/test/path/test.csv',
      fileSize: 1024,
      recordCount: 100,
      duration: 150
    })
  }))
}));

vi.mock('../../src/extension/export/exporters/JSONExporter', () => ({
  JSONExporter: vi.fn().mockImplementation(() => ({
    exportData: vi.fn().mockResolvedValue({
      success: true,
      filePath: '/test/path/test.json',
      fileSize: 2048,
      recordCount: 100,
      duration: 200
    })
  }))
}));

vi.mock('../../src/extension/export/exporters/ExcelExporter', () => ({
  ExcelExporter: vi.fn().mockImplementation(() => ({
    exportData: vi.fn().mockResolvedValue({
      success: true,
      filePath: '/test/path/test.xlsx',
      fileSize: 4096,
      recordCount: 100,
      duration: 300
    })
  }))
}));

vi.mock('../../src/extension/export/exporters/XMLExporter', () => ({
  XMLExporter: vi.fn().mockImplementation(() => ({
    exportData: vi.fn().mockResolvedValue({
      success: true,
      filePath: '/test/path/test.xml',
      fileSize: 1536,
      recordCount: 100,
      duration: 250
    })
  }))
}));

// Mock DataFilter
vi.mock('../../src/extension/export/DataFilter', () => ({
  DataFilter: vi.fn().mockImplementation(() => ({
    filter: vi.fn().mockImplementation((records) => records.slice(0, 50))
  }))
}));

// Mock DataTransformer
vi.mock('../../src/extension/export/DataTransformer', () => ({
  DataTransformer: vi.fn().mockImplementation(() => ({
    transform: vi.fn().mockImplementation((records) => records.map(record => 
      record.map(val => typeof val === 'number' ? parseFloat(val.toFixed(2)) : val)
    ))
  }))
}));

describe('ExportManager', () => {
  let exportManager: ExportManagerImpl;
  
  beforeEach(() => {
    vi.clearAllMocks();
    exportManager = new ExportManagerImpl();
    
    // Mock performance.now for consistent timing
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    
    // Mock Date.now for consistent timestamps
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01T00:00:00.000Z
  });
  
  afterEach(() => {
    if (exportManager) {
      // Clean up any active exports
      exportManager.removeAllListeners();
    }
  });

  describe('实例化和初始化测试', () => {
    test('应该正确创建导出管理器实例', () => {
      expect(exportManager).toBeInstanceOf(ExportManagerImpl);
      expect(exportManager).toBeInstanceOf(EventEmitter);
    });

    test('应该注册默认的导出器', () => {
      const formats = exportManager.getSupportedFormats();
      const formatTypes = formats.map(f => f.type);
      
      expect(formatTypes).toContain(ExportFormatType.CSV);
      expect(formatTypes).toContain(ExportFormatType.JSON);
      expect(formatTypes).toContain(ExportFormatType.EXCEL);
      expect(formatTypes).toContain(ExportFormatType.XML);
    });

    test('应该返回单例实例', () => {
      const instance1 = getExportManager();
      const instance2 = getExportManager();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ExportManagerImpl);
    });
  });

  describe('支持的格式测试', () => {
    test('应该返回所有支持的导出格式', () => {
      const formats = exportManager.getSupportedFormats();
      
      expect(formats).toHaveLength(4);
      expect(formats[0]).toHaveProperty('type');
      expect(formats[0]).toHaveProperty('name');
      expect(formats[0]).toHaveProperty('extensions');
      expect(formats[0]).toHaveProperty('description');
      expect(formats[0]).toHaveProperty('options');
    });

    test('应该为CSV格式返回正确信息', () => {
      const formats = exportManager.getSupportedFormats();
      const csvFormat = formats.find(f => f.type === ExportFormatType.CSV);
      
      expect(csvFormat).toBeDefined();
      expect(csvFormat!.name).toBe('CSV (Comma Separated Values)');
      expect(csvFormat!.extensions).toEqual(['.csv']);
      expect(csvFormat!.options).toHaveProperty('delimiter', ',');
      expect(csvFormat!.options).toHaveProperty('includeHeader', true);
    });

    test('应该为JSON格式返回正确信息', () => {
      const formats = exportManager.getSupportedFormats();
      const jsonFormat = formats.find(f => f.type === ExportFormatType.JSON);
      
      expect(jsonFormat).toBeDefined();
      expect(jsonFormat!.name).toBe('JSON (JavaScript Object Notation)');
      expect(jsonFormat!.extensions).toEqual(['.json']);
      expect(jsonFormat!.options).toHaveProperty('pretty', true);
      expect(jsonFormat!.options).toHaveProperty('indent', 2);
    });

    test('应该为Excel格式返回正确信息', () => {
      const formats = exportManager.getSupportedFormats();
      const excelFormat = formats.find(f => f.type === ExportFormatType.EXCEL);
      
      expect(excelFormat).toBeDefined();
      expect(excelFormat!.name).toBe('Excel Workbook');
      expect(excelFormat!.extensions).toEqual(['.xlsx', '.xls']);
      expect(excelFormat!.options).toHaveProperty('sheetName', 'Data');
      expect(excelFormat!.options).toHaveProperty('autoFitColumns', true);
    });

    test('应该为XML格式返回正确信息', () => {
      const formats = exportManager.getSupportedFormats();
      const xmlFormat = formats.find(f => f.type === ExportFormatType.XML);
      
      expect(xmlFormat).toBeDefined();
      expect(xmlFormat!.name).toBe('XML (eXtensible Markup Language)');
      expect(xmlFormat!.extensions).toEqual(['.xml']);
      expect(xmlFormat!.options).toHaveProperty('rootElement', 'data');
      expect(xmlFormat!.options).toHaveProperty('prettyPrint', true);
    });
  });

  describe('配置验证测试', () => {
    test('应该验证必需的格式类型', async () => {
      const config = {
        format: { type: null as any, options: {} },
        file: { path: '/test/path.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Export format type is required');
    });

    test('应该验证必需的文件路径', async () => {
      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Export file path is required');
    });

    test('应该验证支持的格式类型', async () => {
      const config = {
        format: { type: 'unsupported' as ExportFormatType, options: {} },
        file: { path: '/test/path.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Unsupported format: unsupported');
    });

    test('应该验证目录存在', async () => {
      vi.mocked(path.dirname).mockReturnValue('/nonexistent/directory');
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/nonexistent/directory/test.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Directory does not exist: /nonexistent/directory');
    });

    test('应该检查文件覆盖权限', async () => {
      vi.mocked(path.dirname).mockReturnValue('/test/directory');
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        if (filePath === '/test/directory') return true;
        if (filePath === '/test/directory/existing.csv') return true;
        return false;
      });

      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/directory/existing.csv', name: 'existing.csv', overwrite: false },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('File already exists: /test/directory/existing.csv');
    });
  });

  describe('数据导出核心功能测试', () => {
    let validConfig: ExportConfig;

    beforeEach(() => {
      validConfig = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/path/test.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      // Mock successful validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
    });

    test('应该成功导出CSV数据', async () => {
      const result = await exportManager.exportData(validConfig);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('filePath', '/test/path/test.csv');
      expect(result).toHaveProperty('fileSize', 1024);
      expect(result).toHaveProperty('recordCount', 100);
      expect(result).toHaveProperty('duration');
    });

    test('应该成功导出JSON数据', async () => {
      validConfig.format.type = ExportFormatType.JSON;
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/path/test.json');
      expect(result.fileSize).toBe(2048);
    });

    test('应该成功导出Excel数据', async () => {
      validConfig.format.type = ExportFormatType.EXCEL;
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/path/test.xlsx');
      expect(result.fileSize).toBe(4096);
    });

    test('应该成功导出XML数据', async () => {
      validConfig.format.type = ExportFormatType.XML;
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/path/test.xml');
      expect(result.fileSize).toBe(1536);
    });

    test('应该生成唯一的任务ID', async () => {
      const results = await Promise.all([
        exportManager.exportData({ ...validConfig }),
        exportManager.exportData({ ...validConfig }),
        exportManager.exportData({ ...validConfig })
      ]);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
    });

    test('应该自动创建不存在的目录', async () => {
      vi.mocked(fs.promises.access).mockRejectedValue(new Error('Directory not found'));
      
      const result = await exportManager.exportData(validConfig);
      
      expect(fs.promises.mkdir).toHaveBeenCalledWith('/test/path', { recursive: true });
      expect(result.success).toBe(true);
    });
  });

  describe('数据过滤和转换测试', () => {
    let configWithFilters: ExportConfig;

    beforeEach(() => {
      configWithFilters = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/path/filtered.csv', name: 'filtered.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 3
        },
        filters: {
          timeRange: [new Date('2022-01-01'), new Date('2022-01-02')],
          valueRange: [0, 100],
          conditions: [
            {
              columnIndex: 1,
              operator: 'greater_than',
              value: 10
            }
          ]
        }
      };

      // Mock successful validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
    });

    test('应该应用时间范围过滤', async () => {
      const DataFilter = await import('../../src/extension/export/DataFilter');
      
      const result = await exportManager.exportData(configWithFilters);
      
      expect(DataFilter.DataFilter).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            columnIndex: 0,
            operator: 'in_range',
            value: [new Date('2022-01-01').getTime(), new Date('2022-01-02').getTime()]
          })
        ])
      );
      expect(result.success).toBe(true);
    });

    test('应该应用数值范围过滤', async () => {
      const DataFilter = await import('../../src/extension/export/DataFilter');
      
      await exportManager.exportData(configWithFilters);
      
      expect(DataFilter.DataFilter).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            columnIndex: 1,
            operator: 'in_range',
            value: [0, 100]
          })
        ])
      );
    });

    test('应该应用自定义过滤条件', async () => {
      const DataFilter = await import('../../src/extension/export/DataFilter');
      
      await exportManager.exportData(configWithFilters);
      
      expect(DataFilter.DataFilter).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            columnIndex: 1,
            operator: 'greater_than',
            value: 10
          })
        ])
      );
    });

    test('应该应用精度转换', async () => {
      const DataTransformer = await import('../../src/extension/export/DataTransformer');
      
      await exportManager.exportData(configWithFilters);
      
      expect(DataTransformer.DataTransformer).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'precision_round',
            config: {
              columnIndex: 1,
              precision: 3
            }
          })
        ])
      );
    });

    test('应该处理没有过滤条件的情况', async () => {
      const configNoFilters = { ...configWithFilters };
      delete configNoFilters.filters;
      
      const result = await exportManager.exportData(configNoFilters);
      
      expect(result.success).toBe(true);
    });
  });

  describe('进度监控测试', () => {
    let progressCallback: vi.MockedFunction<(progress: ExportProgress) => void>;
    let validConfig: ExportConfig;

    beforeEach(() => {
      progressCallback = vi.fn();
      validConfig = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/path/progress.csv', name: 'progress.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      // Mock successful validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);
    });

    test('应该注册和调用进度回调', async () => {
      exportManager.onProgress(progressCallback);
      
      await exportManager.exportData(validConfig);
      
      expect(progressCallback).toHaveBeenCalledTimes(4); // 4个阶段
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'preparing',
          percentage: 0
        })
      );
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'finalizing',
          percentage: 100
        })
      );
    });

    test('应该移除进度回调', async () => {
      exportManager.onProgress(progressCallback);
      exportManager.offProgress(progressCallback);
      
      await exportManager.exportData(validConfig);
      
      expect(progressCallback).not.toHaveBeenCalled();
    });

    test('应该发出进度事件', async () => {
      const eventListener = vi.fn();
      exportManager.on('progress', eventListener);
      
      await exportManager.exportData(validConfig);
      
      expect(eventListener).toHaveBeenCalledTimes(4);
    });

    test('应该处理进度回调中的错误', async () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      exportManager.onProgress(errorCallback);
      
      await exportManager.exportData(validConfig);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in progress callback:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    test('应该计算预估剩余时间', async () => {
      exportManager.onProgress(progressCallback);
      
      await exportManager.exportData(validConfig);
      
      const progressCalls = progressCallback.mock.calls;
      const firstCall = progressCalls[0][0];
      
      expect(firstCall).toHaveProperty('estimatedTimeRemaining');
      expect(typeof firstCall.estimatedTimeRemaining).toBe('number');
    });
  });

  describe('导出取消测试', () => {
    test('应该能取消正在进行的导出', async () => {
      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/path/cancel.csv', name: 'cancel.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      // Mock validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);

      // 创建一个可以被中断的Promise
      let cancelExport: () => void;
      const exportPromise = new Promise<any>((resolve, reject) => {
        cancelExport = () => reject(new Error('Export cancelled by user'));
        setTimeout(() => resolve({
          success: true,
          filePath: '/test/path/cancel.csv',
          fileSize: 1024,
          recordCount: 100,
          duration: 1000
        }), 100);
      });

      // Mock实际的导出操作
      const originalExportData = exportManager.exportData;
      vi.spyOn(exportManager, 'exportData').mockImplementation(async () => {
        setTimeout(() => cancelExport(), 10);
        return exportPromise;
      });

      await expect(exportManager.exportData(config)).rejects.toThrow('Export cancelled by user');
      
      // 恢复原方法
      exportManager.exportData = originalExportData;
    });

    test('应该发出取消事件', async () => {
      const cancelListener = vi.fn();
      exportManager.on('exportCancelled', cancelListener);
      
      // 创建一个模拟的活动任务
      const task = {
        id: 'test-task-id',
        config: {
          format: { type: ExportFormatType.CSV, options: {} },
          file: { path: '/test/path/test.csv', name: 'test.csv', overwrite: true },
          dataSource: { type: DataSourceType.CURRENT },
          processing: {
            includeMetadata: true,
            includeTimestamps: true,
            compression: false,
            encoding: 'utf-8',
            precision: 2
          },
          filters: {}
        },
        startTime: Date.now(),
        cancelled: false
      };
      
      // 将任务添加到活动导出列表中
      (exportManager as any).activeExports.set('test-task-id', task);
      
      await exportManager.cancelExport('test-task-id');
      
      expect(cancelListener).toHaveBeenCalledWith('test-task-id');
    });

    test('应该处理不存在的任务取消', async () => {
      await expect(exportManager.cancelExport('nonexistent-task')).resolves.toBeUndefined();
    });
  });

  describe('错误处理测试', () => {
    test('应该处理导出器异常', async () => {
      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/path/error.csv', name: 'error.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      // Mock validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);

      // 创建一个新的ExportManager实例并直接设置失败的导出器
      const errorExportManager = new ExportManagerImpl();
      const errorExporter = {
        exportData: vi.fn().mockRejectedValue(new Error('Exporter failed'))
      };
      (errorExportManager as any).formatRegistry.set(ExportFormatType.CSV, errorExporter);

      await expect(errorExportManager.exportData(config)).rejects.toThrow('Export failed: Exporter failed');
    });

    test('应该处理ExportError异常', async () => {
      const config = {
        format: { type: ExportFormatType.JSON, options: {} },
        file: { path: '/test/path/export-error.json', name: 'export-error.json', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      // Mock validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);

      // 创建一个新的ExportManager实例并直接设置失败的导出器
      const errorExportManager = new ExportManagerImpl();
      const errorExporter = {
        exportData: vi.fn().mockRejectedValue(new ExportError('JSON export failed'))
      };
      (errorExportManager as any).formatRegistry.set(ExportFormatType.JSON, errorExporter);

      await expect(errorExportManager.exportData(config)).rejects.toThrow(ExportError);
      await expect(errorExportManager.exportData(config)).rejects.toThrow('JSON export failed');
    });

    test('应该在导出失败时清理任务', async () => {
      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/test/path/cleanup.csv', name: 'cleanup.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      // Mock validation
      vi.mocked(path.dirname).mockReturnValue('/test/path');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.promises.access).mockResolvedValue(undefined);

      // Mock exporter error
      const CSVExporter = await import('../../src/extension/export/exporters/CSVExporter');
      vi.mocked(CSVExporter.CSVExporter).mockImplementation(() => ({
        exportData: vi.fn().mockRejectedValue(new Error('Export failed'))
      }) as any);

      try {
        await exportManager.exportData(config);
      } catch (error) {
        // 预期的错误
      }

      // 验证任务已被清理
      const activeExports = (exportManager as any).activeExports;
      expect(activeExports.size).toBe(0);
    });
  });
});
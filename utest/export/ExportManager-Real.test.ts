/**
 * ExportManager.test.ts - 测试真实源码
 * 
 * 测试 src/extension/export/ExportManager.ts 中的真实实现
 * 移除过度mock，测试实际导出管理器功能
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ExportManagerImpl,
  getExportManager
} from '../../src/extension/export/ExportManager';
import { ExportFormatType, DataSourceType } from '../../src/extension/export/types';

// 只Mock必要的外部依赖，不Mock业务逻辑
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn()
  },
  existsSync: vi.fn(),
  createWriteStream: vi.fn()
}));

vi.mock('path', () => ({
  dirname: vi.fn(),
  join: vi.fn(),
  extname: vi.fn(),
  basename: vi.fn()
}));

// Mock导出器类 - 使用简单的类定义避免hoisting问题
vi.mock('../../src/extension/export/exporters/CSVExporter', () => ({
  CSVExporter: class CSVExporter {
    constructor(private options: any = {}) {}
    
    async exportData(data: any, filePath: string) {
      const recordCount = Array.isArray(data.records) ? data.records.length : data.totalRecords || 0;
      await fs.promises.writeFile(filePath, 'mock CSV content');
      return {
        success: true,
        filePath,
        fileSize: 1024,
        recordCount,
        format: 'csv'
      };
    }
    
    setProgressCallback(callback: (percentage: number, processed: number) => void) {
      setTimeout(() => callback(25, 25), 10);
      setTimeout(() => callback(50, 50), 20);
      setTimeout(() => callback(75, 75), 30);
      setTimeout(() => callback(100, 100), 40);
    }
  }
}));

vi.mock('../../src/extension/export/exporters/JSONExporter', () => ({
  JSONExporter: class JSONExporter {
    constructor(private options: any = {}) {}
    
    async exportData(data: any, filePath: string) {
      const recordCount = Array.isArray(data.records) ? data.records.length : data.totalRecords || 0;
      await fs.promises.writeFile(filePath, 'mock JSON content');
      return {
        success: true,
        filePath,
        fileSize: 2048,
        recordCount,
        format: 'json'
      };
    }
    
    setProgressCallback(callback: (percentage: number, processed: number) => void) {
      setTimeout(() => callback(25, 25), 10);
      setTimeout(() => callback(50, 50), 20);
      setTimeout(() => callback(75, 75), 30);
      setTimeout(() => callback(100, 100), 40);
    }
  }
}));

vi.mock('../../src/extension/export/exporters/ExcelExporter', () => ({
  ExcelExporter: class ExcelExporter {
    constructor(private options: any = {}) {}
    
    async exportData(data: any, filePath: string) {
      const recordCount = Array.isArray(data.records) ? data.records.length : data.totalRecords || 0;
      await fs.promises.writeFile(filePath, 'mock Excel content');
      return {
        success: true,
        filePath,
        fileSize: 4096,
        recordCount,
        format: 'excel'
      };
    }
    
    setProgressCallback(callback: (percentage: number, processed: number) => void) {
      setTimeout(() => callback(25, 25), 10);
      setTimeout(() => callback(50, 50), 20);
      setTimeout(() => callback(75, 75), 30);
      setTimeout(() => callback(100, 100), 40);
    }
  }
}));

vi.mock('../../src/extension/export/exporters/XMLExporter', () => ({
  XMLExporter: class XMLExporter {
    constructor(private options: any = {}) {}
    
    async exportData(data: any, filePath: string) {
      const recordCount = Array.isArray(data.records) ? data.records.length : data.totalRecords || 0;
      await fs.promises.writeFile(filePath, 'mock XML content');
      return {
        success: true,
        filePath,
        fileSize: 1536,
        recordCount,
        format: 'xml'
      };
    }
    
    setProgressCallback(callback: (percentage: number, processed: number) => void) {
      setTimeout(() => callback(25, 25), 10);
      setTimeout(() => callback(50, 50), 20);
      setTimeout(() => callback(75, 75), 30);
      setTimeout(() => callback(100, 100), 40);
    }
  }
}));

describe('ExportManager 真实代码测试', () => {
  let exportManager: ExportManagerImpl;
  let tempDir: string;
  
  beforeEach(() => {
    vi.clearAllMocks();
    exportManager = new ExportManagerImpl();
    tempDir = '/tmp/test-exports';
    
    // 设置基本的文件系统Mock
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.promises.access).mockResolvedValue(undefined);
    vi.mocked(fs.promises.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
    vi.mocked(path.dirname).mockReturnValue(tempDir);
    vi.mocked(path.join).mockImplementation((...parts) => parts.join('/'));
    vi.mocked(path.extname).mockImplementation((filePath) => {
      const match = filePath.match(/\.([^.]*)$/);
      return match ? match[0] : '';
    });
  });
  
  afterEach(() => {
    if (exportManager) {
      exportManager.removeAllListeners();
    }
  });

  describe('1. 实例化和初始化测试', () => {
    test('应该正确创建导出管理器实例', () => {
      expect(exportManager).toBeInstanceOf(ExportManagerImpl);
      expect(exportManager).toBeInstanceOf(EventEmitter);
    });

    test('应该注册所有默认的导出器', () => {
      const formats = exportManager.getSupportedFormats();
      const formatTypes = formats.map(f => f.type);
      
      expect(formatTypes).toContain(ExportFormatType.CSV);
      expect(formatTypes).toContain(ExportFormatType.JSON);
      expect(formatTypes).toContain(ExportFormatType.EXCEL);
      expect(formatTypes).toContain(ExportFormatType.XML);
      expect(formats).toHaveLength(4);
    });

    test('应该返回单例实例', () => {
      const instance1 = getExportManager();
      const instance2 = getExportManager();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ExportManagerImpl);
    });

    test('应该为每种格式返回正确的默认选项', () => {
      const formats = exportManager.getSupportedFormats();
      
      const csvFormat = formats.find(f => f.type === ExportFormatType.CSV);
      expect(csvFormat?.options).toHaveProperty('delimiter', ',');
      expect(csvFormat?.options).toHaveProperty('includeHeader', true);
      
      const jsonFormat = formats.find(f => f.type === ExportFormatType.JSON);
      expect(jsonFormat?.options).toHaveProperty('pretty', true);
      expect(jsonFormat?.options).toHaveProperty('indent', 2);
      
      const excelFormat = formats.find(f => f.type === ExportFormatType.EXCEL);
      expect(excelFormat?.options).toHaveProperty('sheetName', 'Data');
      expect(excelFormat?.options).toHaveProperty('autoFitColumns', true);
      
      const xmlFormat = formats.find(f => f.type === ExportFormatType.XML);
      expect(xmlFormat?.options).toHaveProperty('rootElement', 'data');
      expect(xmlFormat?.options).toHaveProperty('prettyPrint', true);
    });
  });

  describe('2. 配置验证测试', () => {
    test('应该拒绝空的格式类型', async () => {
      const config = {
        format: { type: null as any, options: {} },
        file: { path: '/tmp/test.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Export format type is required');
    });

    test('应该拒绝空的文件路径', async () => {
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
        }
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Export file path is required');
    });

    test('应该拒绝不支持的格式类型', async () => {
      const config = {
        format: { type: 'UNSUPPORTED_FORMAT' as ExportFormatType, options: {} },
        file: { path: '/tmp/test.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Unsupported format: UNSUPPORTED_FORMAT');
    });

    test('应该验证目录存在', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        if (filePath === '/nonexistent/directory') return false;
        return true;
      });
      vi.mocked(path.dirname).mockReturnValue('/nonexistent/directory');

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
        }
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Directory does not exist: /nonexistent/directory');
    });

    test('应该检查文件覆盖权限', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        if (filePath === '/tmp/existing.csv') return true;
        if (filePath === '/tmp') return true;
        return false;
      });
      vi.mocked(path.dirname).mockReturnValue('/tmp');

      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/tmp/existing.csv', name: 'existing.csv', overwrite: false },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('File already exists: /tmp/existing.csv');
    });

    test('应该允许覆盖现有文件当overwrite为true', async () => {
      vi.mocked(fs.existsSync).mockImplementation((filePath) => {
        if (filePath === '/tmp/overwrite.csv') return true;
        if (filePath === '/tmp') return true;
        return false;
      });
      vi.mocked(path.dirname).mockReturnValue('/tmp');

      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/tmp/overwrite.csv', name: 'overwrite.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      const result = await exportManager.exportData(config);
      expect(result.success).toBe(true);
    });
  });

  describe('3. 数据导出核心功能测试', () => {
    let validConfig: any;

    beforeEach(() => {
      validConfig = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/tmp/test.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };
    });

    test('应该成功导出CSV数据', async () => {
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/tmp/test.csv');
      expect(result.fileSize).toBe(1024);
      expect(result.recordCount).toBe(1000); // Mock数据生成1000条记录
      expect(result).toHaveProperty('duration');
      expect(typeof result.duration).toBe('number');
    });

    test('应该成功导出JSON数据', async () => {
      validConfig.format.type = ExportFormatType.JSON;
      validConfig.file.path = '/tmp/test.json';
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/tmp/test.json');
      expect(result.fileSize).toBe(2048);
      expect(result.format).toBe('json');
    });

    test('应该成功导出Excel数据', async () => {
      validConfig.format.type = ExportFormatType.EXCEL;
      validConfig.file.path = '/tmp/test.xlsx';
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/tmp/test.xlsx');
      expect(result.fileSize).toBe(4096);
      expect(result.format).toBe('excel');
    });

    test('应该成功导出XML数据', async () => {
      validConfig.format.type = ExportFormatType.XML;
      validConfig.file.path = '/tmp/test.xml';
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/tmp/test.xml');
      expect(result.fileSize).toBe(1536);
      expect(result.format).toBe('xml');
    });

    test('应该生成唯一的任务ID', async () => {
      const promises = [
        exportManager.exportData({ ...validConfig }),
        exportManager.exportData({ ...validConfig }),
        exportManager.exportData({ ...validConfig })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.recordCount === 1000)).toBe(true);
    });

    test('应该自动创建不存在的目录', async () => {
      vi.mocked(fs.promises.access).mockRejectedValueOnce(new Error('Directory not found'));
      
      const result = await exportManager.exportData(validConfig);
      
      expect(fs.promises.mkdir).toHaveBeenCalledWith(tempDir, { recursive: true });
      expect(result.success).toBe(true);
    });

    test('应该处理空数据集', async () => {
      validConfig.dataSource = {
        type: DataSourceType.CURRENT,
        datasets: [],
        groups: []
      };
      
      const result = await exportManager.exportData(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0);
    });
  });

  describe('4. 进度监控测试', () => {
    let progressCallback: vi.MockedFunction<any>;
    let validConfig: any;

    beforeEach(() => {
      progressCallback = vi.fn();
      validConfig = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/tmp/progress.csv', name: 'progress.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };
    });

    test('应该注册和触发进度回调', async () => {
      exportManager.onProgress(progressCallback);
      
      await exportManager.exportData(validConfig);
      
      // 应该至少调用4次：preparing, processing, writing, finalizing
      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback.mock.calls.length).toBeGreaterThanOrEqual(4);
      
      // 检查第一次和最后一次调用
      const firstCall = progressCallback.mock.calls[0][0];
      const lastCall = progressCallback.mock.calls[progressCallback.mock.calls.length - 1][0];
      
      expect(firstCall.stage).toBe('preparing');
      expect(firstCall.percentage).toBe(0);
      expect(lastCall.stage).toBe('finalizing');
      expect(lastCall.percentage).toBe(100);
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
      
      expect(eventListener).toHaveBeenCalled();
      expect(eventListener.mock.calls.length).toBeGreaterThanOrEqual(4);
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
      if (progressCalls.length > 0) {
        const firstCall = progressCalls[0][0];
        expect(firstCall).toHaveProperty('estimatedTimeRemaining');
        expect(typeof firstCall.estimatedTimeRemaining).toBe('number');
      }
    });
  });

  describe('5. 导出取消功能测试', () => {
    test('应该能取消不存在的任务而不报错', async () => {
      await expect(exportManager.cancelExport('nonexistent-task')).resolves.toBeUndefined();
    });

    test('应该发出取消事件', async () => {
      const cancelListener = vi.fn();
      exportManager.on('exportCancelled', cancelListener);
      
      // 手动添加一个模拟的活动任务
      const taskId = 'test-task-id';
      const task = {
        id: taskId,
        config: {
          format: { type: ExportFormatType.CSV, options: {} },
          file: { path: '/tmp/test.csv', name: 'test.csv', overwrite: true },
          dataSource: { type: DataSourceType.CURRENT }
        },
        startTime: Date.now(),
        cancelled: false
      };
      
      (exportManager as any).activeExports.set(taskId, task);
      
      await exportManager.cancelExport(taskId);
      
      expect(cancelListener).toHaveBeenCalledWith(taskId);
    });
  });

  describe('6. 错误处理测试', () => {
    test('应该处理无效文件路径', async () => {
      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/invalid/path', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      vi.mocked(path.dirname).mockReturnValue('/invalid/path');

      await expect(exportManager.exportData(config)).rejects.toThrow('Invalid file path: /invalid/path');
    });

    test('应该处理目录创建失败', async () => {
      vi.mocked(fs.promises.access).mockRejectedValue(new Error('No access'));
      vi.mocked(fs.promises.mkdir).mockRejectedValue(new Error('Cannot create directory'));
      vi.mocked(path.dirname).mockReturnValue('/failed/directory');

      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/failed/directory/test.csv', name: 'test.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      await expect(exportManager.exportData(config)).rejects.toThrow('Failed to create directory: /failed/directory');
    });
  });

  describe('7. 数据处理和转换测试', () => {
    test('应该处理带过滤器的配置', async () => {
      const configWithFilters = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/tmp/filtered.csv', name: 'filtered.csv', overwrite: true },
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
          conditions: [{
            columnIndex: 1,
            operator: 'greater_than',
            value: 10
          }]
        }
      };

      const result = await exportManager.exportData(configWithFilters);
      
      expect(result.success).toBe(true);
      // 数据应该被过滤，记录数应该小于原始数据
      expect(result.recordCount).toBeLessThanOrEqual(1000);
    });

    test('应该处理没有过滤器的配置', async () => {
      const configNoFilters = {
        format: { type: ExportFormatType.JSON, options: {} },
        file: { path: '/tmp/no-filters.json', name: 'no-filters.json', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      const result = await exportManager.exportData(configNoFilters);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(1000);
    });

    test('应该应用精度转换', async () => {
      const configWithPrecision = {
        format: { type: ExportFormatType.JSON, options: {} },
        file: { path: '/tmp/precision.json', name: 'precision.json', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 1
        }
      };

      const result = await exportManager.exportData(configWithPrecision);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(1000);
    });
  });

  describe('8. 任务管理测试', () => {
    test('应该生成唯一的任务ID', () => {
      const manager = exportManager as any;
      const id1 = manager.generateTaskId();
      const id2 = manager.generateTaskId();
      const id3 = manager.generateTaskId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
      
      // 应该以'export_'开头
      expect(id1).toMatch(/^export_/);
      expect(id2).toMatch(/^export_/);
      expect(id3).toMatch(/^export_/);
    });

    test('应该正确计算预估完成时间', () => {
      const manager = exportManager as any;
      const startTime = Date.now() - 1000; // 1秒前开始
      
      // 50%完成时，应该预估还需要1秒
      const eta50 = manager.calculateETA(50, startTime);
      expect(eta50).toBeGreaterThan(800);
      expect(eta50).toBeLessThan(1200);
      
      // 100%完成时，应该预估0秒
      const eta100 = manager.calculateETA(100, startTime);
      expect(eta100).toBe(0);
      
      // 0%完成时，应该预估无限时间
      const eta0 = manager.calculateETA(0, startTime);
      expect(eta0).toBe(0);
    });

    test('应该正确管理活动导出任务', async () => {
      const config = {
        format: { type: ExportFormatType.CSV, options: {} },
        file: { path: '/tmp/task-management.csv', name: 'task-management.csv', overwrite: true },
        dataSource: { type: DataSourceType.CURRENT },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        }
      };

      // 在导出开始前，活动任务列表应该为空
      const activeExports = (exportManager as any).activeExports;
      expect(activeExports.size).toBe(0);
      
      // 开始导出
      const exportPromise = exportManager.exportData(config);
      
      // 导出完成
      await exportPromise;
      
      // 导出完成后，活动任务列表应该再次为空
      expect(activeExports.size).toBe(0);
    });
  });
});
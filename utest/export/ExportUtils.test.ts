/**
 * ExportUtils.test.ts
 * Export模块工具函数测试
 * 专门测试utils.ts中的所有工具函数
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Mock modules
vi.mock('path', () => ({
  extname: vi.fn(),
  basename: vi.fn(),
  dirname: vi.fn(),
  join: vi.fn()
}));

vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    mkdir: vi.fn(),
    unlink: vi.fn()
  },
  existsSync: vi.fn()
}));

vi.mock('os', () => ({
  tmpdir: vi.fn()
}));

describe('Export工具函数测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('格式推断功能', () => {
    test('应该正确推断CSV格式', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.csv');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/file.csv');
      
      expect(format).toBe(ExportFormatType.CSV);
      expect(mockPath.extname).toHaveBeenCalledWith('/test/file.csv');
    });

    test('应该正确推断JSON格式', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.json');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/data.json');
      
      expect(format).toBe(ExportFormatType.JSON);
    });

    test('应该正确推断Excel格式 (.xlsx)', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.xlsx');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/report.xlsx');
      
      expect(format).toBe(ExportFormatType.EXCEL);
    });

    test('应该正确推断Excel格式 (.xls)', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.xls');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/legacy.xls');
      
      expect(format).toBe(ExportFormatType.EXCEL);
    });

    test('应该正确推断XML格式', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.xml');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/config.xml');
      
      expect(format).toBe(ExportFormatType.XML);
    });

    test('应该正确推断TXT格式', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.txt');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/readme.txt');
      
      expect(format).toBe(ExportFormatType.TXT);
    });

    test('应该正确推断BINARY格式 (.bin)', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.bin');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/data.bin');
      
      expect(format).toBe(ExportFormatType.BINARY);
    });

    test('应该正确推断BINARY格式 (.dat)', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.dat');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/sensor.dat');
      
      expect(format).toBe(ExportFormatType.BINARY);
    });

    test('应该为未知扩展名返回默认CSV格式', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.unknown');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/file.unknown');
      
      expect(format).toBe(ExportFormatType.CSV);
    });

    test('应该处理大写扩展名', async () => {
      const mockPath = path as any;
      mockPath.extname.mockReturnValue('.CSV');
      
      const { inferFormatFromPath } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const format = inferFormatFromPath('/test/FILE.CSV');
      
      expect(format).toBe(ExportFormatType.CSV);
    });
  });

  describe('文件名生成功能', () => {
    test('应该生成CSV文件名', async () => {
      const { generateFileName } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const fileName = generateFileName(ExportFormatType.CSV, 'test');
      
      expect(fileName).toMatch(/^test_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/);
    });

    test('应该生成JSON文件名', async () => {
      const { generateFileName } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const fileName = generateFileName(ExportFormatType.JSON);
      
      expect(fileName).toMatch(/^export_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
    });

    test('应该生成Excel文件名', async () => {
      const { generateFileName } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const fileName = generateFileName(ExportFormatType.EXCEL, 'report');
      
      expect(fileName).toMatch(/^report_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.xlsx$/);
    });

    test('应该生成XML文件名', async () => {
      const { generateFileName } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const fileName = generateFileName(ExportFormatType.XML, 'config');
      
      expect(fileName).toMatch(/^config_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.xml$/);
    });

    test('应该生成TXT文件名', async () => {
      const { generateFileName } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const fileName = generateFileName(ExportFormatType.TXT, 'log');
      
      expect(fileName).toMatch(/^log_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.txt$/);
    });

    test('应该生成BINARY文件名', async () => {
      const { generateFileName } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const fileName = generateFileName(ExportFormatType.BINARY, 'data');
      
      expect(fileName).toMatch(/^data_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.bin$/);
    });
  });

  describe('默认导出配置创建', () => {
    test('应该创建CSV格式的默认配置', async () => {
      const mockPath = path as any;
      mockPath.basename.mockReturnValue('test.csv');
      
      const { createDefaultExportConfig } = await import('../../src/extension/export/utils');
      const { ExportFormatType, DataSourceType } = await import('../../src/extension/export/types');
      
      const config = createDefaultExportConfig(ExportFormatType.CSV, '/test/path/test.csv');
      
      expect(config.dataSource.type).toBe(DataSourceType.CURRENT);
      expect(config.format.type).toBe(ExportFormatType.CSV);
      expect(config.file.path).toBe('/test/path/test.csv');
      expect(config.file.name).toBe('test.csv');
      expect(config.file.overwrite).toBe(true);
      expect(config.processing.includeMetadata).toBe(true);
      expect(config.processing.includeTimestamps).toBe(true);
      expect(config.processing.compression).toBe(false);
      expect(config.processing.encoding).toBe('utf-8');
      expect(config.processing.precision).toBe(3);
    });

    test('应该创建JSON格式的默认配置', async () => {
      const mockPath = path as any;
      mockPath.basename.mockReturnValue('data.json');
      
      const { createDefaultExportConfig } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const config = createDefaultExportConfig(ExportFormatType.JSON, '/test/data.json');
      
      expect(config.format.type).toBe(ExportFormatType.JSON);
      expect(config.format.options.pretty).toBe(true);
      expect(config.format.options.indent).toBe(2);
    });
  });

  describe('默认格式选项获取', () => {
    test('应该返回CSV默认选项', async () => {
      const { getDefaultFormatOptions } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const options = getDefaultFormatOptions(ExportFormatType.CSV);
      
      expect(options.delimiter).toBe(',');
      expect(options.quote).toBe('"');
      expect(options.escape).toBe('"');
      expect(options.encoding).toBe('utf-8');
      expect(options.includeHeader).toBe(true);
      expect(options.lineEnding).toBe('\n');
      expect(options.precision).toBe(3);
      expect(options.dateFormat).toBe('YYYY-MM-DD HH:mm:ss');
    });

    test('应该返回JSON默认选项', async () => {
      const { getDefaultFormatOptions } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const options = getDefaultFormatOptions(ExportFormatType.JSON);
      
      expect(options.pretty).toBe(true);
      expect(options.indent).toBe(2);
      expect(options.encoding).toBe('utf-8');
      expect(options.includeMetadata).toBe(true);
      expect(options.arrayFormat).toBe(true);
      expect(options.compression).toBe(false);
    });

    test('应该返回Excel默认选项', async () => {
      const { getDefaultFormatOptions } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const options = getDefaultFormatOptions(ExportFormatType.EXCEL);
      
      expect(options.sheetName).toBe('Data');
      expect(options.includeChart).toBe(false);
      expect(options.autoFitColumns).toBe(true);
      expect(options.includeMetadata).toBe(true);
      expect(options.dateFormat).toBe('yyyy-mm-dd hh:mm:ss');
      expect(options.numberFormat).toBe('#,##0.00');
    });

    test('应该返回XML默认选项', async () => {
      const { getDefaultFormatOptions } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const options = getDefaultFormatOptions(ExportFormatType.XML);
      
      expect(options.rootElement).toBe('data');
      expect(options.recordElement).toBe('record');
      expect(options.includeAttributes).toBe(true);
      expect(options.prettyPrint).toBe(true);
      expect(options.encoding).toBe('utf-8');
    });

    test('应该为未知格式返回空对象', async () => {
      const { getDefaultFormatOptions } = await import('../../src/extension/export/utils');
      
      const options = getDefaultFormatOptions('UNKNOWN' as any);
      
      expect(options).toEqual({});
    });
  });

  describe('文件路径验证', () => {
    test('应该验证有效的文件路径', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/valid/directory');
      mockPath.basename.mockReturnValue('valid_file.csv');
      mockFs.existsSync.mockReturnValue(true);
      
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('/valid/directory/valid_file.csv');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('应该拒绝空文件路径', async () => {
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File path is required');
    });

    test('应该拒绝只有空格的文件路径', async () => {
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('   ');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File path is required');
    });

    test('应该拒绝不存在的目录', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/nonexistent/directory');
      mockFs.existsSync.mockReturnValue(false);
      
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('/nonexistent/directory/file.csv');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Directory does not exist: /nonexistent/directory');
    });

    test('应该处理目录访问错误', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/invalid/directory');
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Access denied');
      });
      
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('/invalid/directory/file.csv');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid directory path: /invalid/directory');
    });

    test('应该拒绝包含无效字符的文件名', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/valid/directory');
      mockPath.basename.mockReturnValue('invalid<file>.csv');
      mockFs.existsSync.mockReturnValue(true);
      
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('/valid/directory/invalid<file>.csv');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File name contains invalid characters');
    });

    test('应该拒绝包含控制字符的文件名', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/valid/directory');
      mockPath.basename.mockReturnValue('file\x00.csv');
      mockFs.existsSync.mockReturnValue(true);
      
      const { validateFilePath } = await import('../../src/extension/export/utils');
      
      const result = validateFilePath('/valid/directory/file\x00.csv');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File name contains invalid characters');
    });
  });

  describe('目录确保功能', () => {
    test('应该成功访问已存在的目录', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/existing/directory');
      mockFs.promises.access.mockResolvedValue(undefined);
      
      const { ensureDirectoryExists } = await import('../../src/extension/export/utils');
      
      await expect(ensureDirectoryExists('/existing/directory/file.txt')).resolves.toBeUndefined();
      
      expect(mockFs.promises.access).toHaveBeenCalledWith('/existing/directory');
      expect(mockFs.promises.mkdir).not.toHaveBeenCalled();
    });

    test('应该创建不存在的目录', async () => {
      const mockPath = path as any;
      const mockFs = fs as any;
      
      mockPath.dirname.mockReturnValue('/new/directory');
      mockFs.promises.access.mockRejectedValue(new Error('Directory not found'));
      mockFs.promises.mkdir.mockResolvedValue('/new/directory');
      
      const { ensureDirectoryExists } = await import('../../src/extension/export/utils');
      
      await expect(ensureDirectoryExists('/new/directory/file.txt')).resolves.toBeUndefined();
      
      expect(mockFs.promises.access).toHaveBeenCalledWith('/new/directory');
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/new/directory', { recursive: true });
    });
  });

  describe('文件大小格式化', () => {
    test('应该格式化字节单位', async () => {
      const { formatFileSize } = await import('../../src/extension/export/utils');
      
      expect(formatFileSize(100)).toBe('100.00 B');
      expect(formatFileSize(512)).toBe('512.00 B');
    });

    test('应该格式化KB单位', async () => {
      const { formatFileSize } = await import('../../src/extension/export/utils');
      
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    test('应该格式化MB单位', async () => {
      const { formatFileSize } = await import('../../src/extension/export/utils');
      
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
    });

    test('应该格式化GB单位', async () => {
      const { formatFileSize } = await import('../../src/extension/export/utils');
      
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 3.75)).toBe('3.75 GB');
    });

    test('应该格式化TB单位', async () => {
      const { formatFileSize } = await import('../../src/extension/export/utils');
      
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1024 * 5.25)).toBe('5.25 TB');
    });

    test('应该处理0字节', async () => {
      const { formatFileSize } = await import('../../src/extension/export/utils');
      
      expect(formatFileSize(0)).toBe('0.00 B');
    });
  });

  describe('持续时间格式化', () => {
    test('应该格式化毫秒', async () => {
      const { formatDuration } = await import('../../src/extension/export/utils');
      
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    test('应该格式化秒', async () => {
      const { formatDuration } = await import('../../src/extension/export/utils');
      
      expect(formatDuration(1000)).toBe('1.0s');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(59999)).toBe('60.0s');
    });

    test('应该格式化分钟和秒', async () => {
      const { formatDuration } = await import('../../src/extension/export/utils');
      
      expect(formatDuration(60000)).toBe('1m 0s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    test('应该处理0毫秒', async () => {
      const { formatDuration } = await import('../../src/extension/export/utils');
      
      expect(formatDuration(0)).toBe('0ms');
    });
  });

  describe('进度报告器', () => {
    test('应该创建进度报告器', async () => {
      const { createProgressReporter } = await import('../../src/extension/export/utils');
      
      const callback = vi.fn();
      const reporter = createProgressReporter(callback);
      
      expect(typeof reporter).toBe('function');
    });

    test('应该报告进度', async () => {
      const { createProgressReporter } = await import('../../src/extension/export/utils');
      
      const callback = vi.fn();
      const reporter = createProgressReporter(callback);
      
      reporter(50);
      
      expect(callback).toHaveBeenCalledWith(50);
    });

    test('应该限制进度在0-100范围内', async () => {
      const { createProgressReporter } = await import('../../src/extension/export/utils');
      
      const callback = vi.fn();
      const reporter = createProgressReporter(callback);
      
      reporter(-10);
      reporter(150);
      
      expect(callback).toHaveBeenCalledWith(0);
      expect(callback).toHaveBeenCalledWith(100);
    });

    test('应该处理没有回调的情况', async () => {
      const { createProgressReporter } = await import('../../src/extension/export/utils');
      
      const reporter = createProgressReporter();
      
      expect(() => reporter(50)).not.toThrow();
    });

    test('应该总是报告100%进度', async () => {
      vi.useFakeTimers();
      
      const { createProgressReporter } = await import('../../src/extension/export/utils');
      
      const callback = vi.fn();
      const reporter = createProgressReporter(callback);
      
      // 立即报告两次100%，应该都被调用
      reporter(100);
      reporter(100);
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(100);
      
      vi.useRealTimers();
    });
  });

  describe('文件存在检查', () => {
    test('应该检测文件存在', async () => {
      const mockFs = fs as any;
      mockFs.promises.access.mockResolvedValue(undefined);
      
      const { fileExists } = await import('../../src/extension/export/utils');
      
      const exists = await fileExists('/path/to/existing/file.txt');
      
      expect(exists).toBe(true);
      expect(mockFs.promises.access).toHaveBeenCalledWith('/path/to/existing/file.txt');
    });

    test('应该检测文件不存在', async () => {
      const mockFs = fs as any;
      mockFs.promises.access.mockRejectedValue(new Error('File not found'));
      
      const { fileExists } = await import('../../src/extension/export/utils');
      
      const exists = await fileExists('/path/to/nonexistent/file.txt');
      
      expect(exists).toBe(false);
    });
  });

  describe('临时文件管理', () => {
    test('应该生成临时文件路径', async () => {
      const mockPath = path as any;
      
      // Mock require('os').tmpdir() call
      const originalRequire = globalThis.require;
      globalThis.require = vi.fn().mockImplementation((module) => {
        if (module === 'os') {
          return { tmpdir: () => '/tmp' };
        }
        return originalRequire(module);
      }) as any;
      
      mockPath.join.mockImplementation((dir, filename) => `${dir}/${filename}`);
      
      const { getTempFilePath } = await import('../../src/extension/export/utils');
      
      const tempPath = getTempFilePath('.csv');
      
      expect(tempPath).toMatch(/^\/tmp\/export_\d+_[a-z0-9]+\.csv$/);
      expect(mockPath.join).toHaveBeenCalled();
      
      // Restore original require
      globalThis.require = originalRequire;
    });

    test('应该清理临时文件', async () => {
      const mockFs = fs as any;
      mockFs.promises.unlink.mockResolvedValue(undefined);
      
      const { cleanupTempFile } = await import('../../src/extension/export/utils');
      
      await expect(cleanupTempFile('/tmp/temp_file.csv')).resolves.toBeUndefined();
      
      expect(mockFs.promises.unlink).toHaveBeenCalledWith('/tmp/temp_file.csv');
    });

    test('应该忽略清理失败的错误', async () => {
      const mockFs = fs as any;
      mockFs.promises.unlink.mockRejectedValue(new Error('File not found'));
      
      const { cleanupTempFile } = await import('../../src/extension/export/utils');
      
      await expect(cleanupTempFile('/tmp/nonexistent.csv')).resolves.toBeUndefined();
    });
  });

  describe('数据完整性验证', () => {
    test('应该验证有效数据', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const validData = [
        ['Name', 'Age', 'Score'],
        ['Alice', '25', '95.5'],
        ['Bob', '30', '87.2']
      ];
      
      const result = validateDataIntegrity(validData);
      
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('应该拒绝非数组数据', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const result = validateDataIntegrity('not an array' as any);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Data is not an array');
    });

    test('应该检测空数据', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const result = validateDataIntegrity([]);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Data array is empty');
    });

    test('应该检测列数不一致', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const inconsistentData = [
        ['Name', 'Age', 'Score'],
        ['Alice', '25'],  // 缺少一列
        ['Bob', '30', '87.2']
      ];
      
      const result = validateDataIntegrity(inconsistentData);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Row 1 has 2 columns, expected 3');
    });

    test('应该检测null值', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const dataWithNulls = [
        ['Name', 'Age', 'Score'],
        ['Alice', null, '95.5'],
        ['Bob', '30', '87.2']
      ];
      
      const result = validateDataIntegrity(dataWithNulls);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Data contains null values');
    });

    test('应该检测undefined值', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const dataWithUndefined = [
        ['Name', 'Age', 'Score'],
        ['Alice', undefined, '95.5'],
        ['Bob', '30', '87.2']
      ];
      
      const result = validateDataIntegrity(dataWithUndefined);
      
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Data contains undefined values');
    });

    test('应该处理第一行为空的情况', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      const dataWithEmptyFirstRow = [
        null,
        ['Alice', '25', '95.5']
      ];
      
      const result = validateDataIntegrity(dataWithEmptyFirstRow as any);
      
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('columns, expected'))).toBe(true);
    });

    test('应该只检查前10行以提高性能', async () => {
      const { validateDataIntegrity } = await import('../../src/extension/export/utils');
      
      // 创建超过10行的数据，第15行有null值
      const largeData = Array.from({ length: 20 }, (_, i) => {
        if (i === 15) {
          return ['Name', null, 'Score'];
        }
        return ['Name', 'Age', 'Score'];
      });
      
      const result = validateDataIntegrity(largeData);
      
      // 由于只检查前10行，第15行的null值不应该被检测到
      expect(result.valid).toBe(true);
      expect(result.issues).not.toContain('Data contains null values');
    });
  });

  describe('导出大小估算', () => {
    test('应该估算CSV文件大小', async () => {
      const { estimateExportSize } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const size = estimateExportSize(100, 5, ExportFormatType.CSV);
      
      // 100行 * 5列 * 10字符/列 * 1.2倍系数 = 6000字节
      expect(size).toBe(6000);
    });

    test('应该估算JSON文件大小', async () => {
      const { estimateExportSize } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const size = estimateExportSize(50, 3, ExportFormatType.JSON);
      
      // 50行 * 3列 * 10字符/列 * 2.5倍系数 = 3750字节
      expect(size).toBe(3750);
    });

    test('应该估算Excel文件大小', async () => {
      const { estimateExportSize } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const size = estimateExportSize(20, 4, ExportFormatType.EXCEL);
      
      // 20行 * 4列 * 10字符/列 * 3.0倍系数 = 2400字节
      expect(size).toBe(2400);
    });

    test('应该估算XML文件大小', async () => {
      const { estimateExportSize } = await import('../../src/extension/export/utils');
      const { ExportFormatType } = await import('../../src/extension/export/types');
      
      const size = estimateExportSize(30, 2, ExportFormatType.XML);
      
      // 30行 * 2列 * 10字符/列 * 4.0倍系数 = 2400字节
      expect(size).toBe(2400);
    });

    test('应该为未知格式使用默认系数', async () => {
      const { estimateExportSize } = await import('../../src/extension/export/utils');
      
      const size = estimateExportSize(10, 3, 'UNKNOWN' as any);
      
      // 10行 * 3列 * 10字符/列 * 1.5倍系数 = 450字节
      expect(size).toBe(450);
    });
  });

  describe('导出摘要创建', () => {
    test('应该创建导出摘要', async () => {
      const { createExportSummary } = await import('../../src/extension/export/utils');
      
      const result = {
        filePath: '/test/export.csv',
        fileSize: 2048,
        recordCount: 100,
        duration: 1500
      };
      
      const summary = createExportSummary(result);
      
      expect(summary).toContain('Export completed successfully!');
      expect(summary).toContain('File: /test/export.csv');
      expect(summary).toContain('Size: 2.00 KB');
      expect(summary).toContain('Records: 100');
      expect(summary).toContain('Duration: 1.5s');
    });

    test('应该处理大数量记录', async () => {
      const { createExportSummary } = await import('../../src/extension/export/utils');
      
      const result = {
        filePath: '/test/large_export.csv',
        fileSize: 10485760, // 10MB
        recordCount: 1234567,
        duration: 90000 // 1分30秒
      };
      
      const summary = createExportSummary(result);
      
      expect(summary).toContain('Size: 10.00 MB');
      expect(summary).toContain('Records: 1,234,567');
      expect(summary).toContain('Duration: 1m 30s');
    });
  });
});
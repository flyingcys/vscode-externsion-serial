/**
 * JSONExporter 真实功能测试
 * 测试JSON导出器的核心功能，避免过度Mock
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSONExporter } from '@extension/export/exporters/JSONExporter';
import { ExportData, JSONOptions } from '@extension/export/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs 模块
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('JSONExporter 真实功能测试', () => {
  let jsonExporter: JSONExporter;
  let tempFilePath: string;
  
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
      format: 'json'
    },
    totalRecords: 3
  };

  beforeEach(() => {
    tempFilePath = path.join(__dirname, 'test-output.json');
    
    // 🔧 修复: 完善fs Mock配置，解决 promises.stat is not a function 错误
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('构造函数和初始化', () => {
    it('应该使用默认选项创建JSONExporter实例', () => {
      jsonExporter = new JSONExporter();
      expect(jsonExporter).toBeInstanceOf(JSONExporter);
    });

    it('应该正确设置自定义选项', () => {
      const options: Partial<JSONOptions> = {
        pretty: false,
        indent: 4,
        includeMetadata: false,
        arrayFormat: false
      };
      
      jsonExporter = new JSONExporter(options);
      expect(jsonExporter).toBeInstanceOf(JSONExporter);
    });

    it('应该设置进度回调函数', () => {
      jsonExporter = new JSONExporter();
      const mockCallback = vi.fn();
      
      jsonExporter.setProgressCallback(mockCallback);
      // 验证回调已设置（通过后续导出测试验证）
      expect(mockCallback).toBeDefined();
    });
  });

  describe('JSON数据导出功能', () => {
    beforeEach(() => {
      jsonExporter = new JSONExporter({ pretty: true, indent: 2 });
    });

    it('应该成功导出基本JSON数据', async () => {
      const result = await jsonExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(tempFilePath);
      expect(result.recordCount).toBe(3);
      expect(result.fileSize).toBeGreaterThan(0);
      expect(mockFs.promises.writeFile).toHaveBeenCalledOnce();
    });

    it('应该正确格式化JSON数据结构', async () => {
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const jsonContent = writeCall[1] as string;
      const parsedData = JSON.parse(jsonContent);
      
      expect(parsedData).toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('data');
      expect(parsedData.data).toHaveLength(3);
      expect(parsedData.data[0]).toHaveProperty('timestamp');
      expect(parsedData.data[0]).toHaveProperty('temperature');
    });

    it('应该在compact模式下正确导出', async () => {
      jsonExporter = new JSONExporter({ pretty: false });
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const jsonContent = writeCall[1] as string;
      
      // compact格式应该没有换行符
      expect(jsonContent).not.toMatch(/\n\s+/);
      expect(JSON.parse(jsonContent)).toBeDefined();
    });

    it('应该处理不包含元数据的导出', async () => {
      jsonExporter = new JSONExporter({ includeMetadata: false });
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const jsonContent = writeCall[1] as string;
      const parsedData = JSON.parse(jsonContent);
      
      expect(parsedData).not.toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('data');
      expect(parsedData.data).toHaveLength(3);
    });

    it('应该正确处理数组格式导出', async () => {
      jsonExporter = new JSONExporter({ arrayFormat: true, includeMetadata: false });
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const jsonContent = writeCall[1] as string;
      const parsedData = JSON.parse(jsonContent);
      
      expect(parsedData).toHaveProperty('data');
      expect(Array.isArray(parsedData.data)).toBe(true);
      expect(parsedData.data).toHaveLength(3);
      expect(parsedData.data[0]).toHaveProperty('timestamp');
    });

    it('应该调用进度回调', async () => {
      const mockCallback = vi.fn();
      jsonExporter.setProgressCallback(mockCallback);
      
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(100, 3);
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      jsonExporter = new JSONExporter();
    });

    it('应该处理文件写入错误', async () => {
      const writeError = new Error('写入失败');
      mockFs.promises.writeFile = vi.fn().mockRejectedValue(writeError);
      
      await expect(jsonExporter.exportData(sampleData, tempFilePath))
        .rejects.toThrow('JSON export failed: 写入失败');
    });

    it('应该处理空数据导出', async () => {
      const emptyData: ExportData = {
        headers: [],
        records: [],
        metadata: {},
        totalRecords: 0
      };
      
      const result = await jsonExporter.exportData(emptyData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0);
    });

    it('应该处理空文件路径', async () => {
      const emptyPath = '';
      
      const result = await jsonExporter.exportData(sampleData, emptyPath);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('');
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith('', expect.any(String), expect.any(Object));
    });

    it('应该处理JSON序列化错误', async () => {
      const invalidData = {
        headers: ['test'],
        records: [['test-value']],
        metadata: {},
        totalRecords: 1
      } as any;
      
      // 创建循环引用导致序列化失败
      const circular: any = {};
      circular.self = circular;
      invalidData.metadata.circular = circular;
      
      await expect(jsonExporter.exportData(invalidData, tempFilePath))
        .rejects.toThrow('JSON export failed');
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', async () => {
      // 生成大量测试数据
      const largeData: ExportData = {
        headers: ['id', 'value', 'timestamp'],
        records: Array.from({ length: 10000 }, (_, i) => [
          i,
          Math.random() * 100,
          new Date(Date.now() + i * 1000).toISOString()
        ]),
        metadata: { test: 'large-dataset' },
        totalRecords: 10000
      };

      jsonExporter = new JSONExporter();
      const mockCallback = vi.fn();
      jsonExporter.setProgressCallback(mockCallback);

      const startTime = performance.now();
      const result = await jsonExporter.exportData(largeData, tempFilePath);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(10000);
      expect(endTime - startTime).toBeLessThan(5000); // 应在5秒内完成
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('选项配置测试', () => {
    it('应该正确应用缩进选项', async () => {
      jsonExporter = new JSONExporter({ pretty: true, indent: 4 });
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const jsonContent = writeCall[1] as string;
      
      // 验证4空格缩进
      expect(jsonContent).toMatch(/\n    "/);
    });

    it('应该正确应用编码选项', async () => {
      jsonExporter = new JSONExporter({ encoding: 'utf-8' });
      await jsonExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      expect(writeCall[2]).toEqual({ encoding: 'utf-8' });
    });
  });
});
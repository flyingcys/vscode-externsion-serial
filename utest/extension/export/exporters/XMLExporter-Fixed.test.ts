/**
 * XMLExporter修复测试 - 基于真实源代码行为
 * 测试真正的@src/extension/export/exporters/XMLExporter.ts实现
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XMLExporter } from '../../../../src/extension/export/exporters/XMLExporter';
import { ExportData, XMLOptions } from '../../../../src/extension/export/types';
import * as fs from 'fs';

// Mock fs 模块
vi.mock('fs', () => ({
  promises: {
    writeFile: vi.fn(),
    stat: vi.fn()
  }
}));

const mockFs = vi.mocked(fs);

describe('XMLExporter 修复测试 - 基于真实源代码', () => {
  let xmlExporter: XMLExporter;
  let tempFilePath: string;

  const sampleData: ExportData = {
    headers: ['timestamp', 'temperature', 'humidity', 'pressure'],
    records: [
      ['2025-01-01T10:00:00Z', 23.5, 45.2, 1013.25],  // XMLExporter期望数组格式
      ['2025-01-01T10:00:01Z', 23.7, 45.1, 1013.30]
    ],
    totalRecords: 2,  // 关键：XMLExporter使用totalRecords而不是records.length
    metadata: {
      exportDate: '2025-01-01T10:00:00Z',
      source: 'sensor-data',
      format: 'xml'
    }
  };

  beforeEach(() => {
    tempFilePath = '/tmp/test-output.xml';
    
    // 重置所有Mock
    vi.clearAllMocks();
    
    // Mock fs.promises方法
    mockFs.promises.writeFile = vi.fn().mockResolvedValue(undefined);
    mockFs.promises.stat = vi.fn().mockResolvedValue({
      size: 1024,
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
      ctime: new Date()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本XML导出功能', () => {
    beforeEach(() => {
      xmlExporter = new XMLExporter();
    });

    it('应该成功导出基本XML数据', async () => {
      const result = await xmlExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(tempFilePath);
      expect(result.recordCount).toBe(2); // 来自totalRecords
      expect(result.fileSize).toBe(1024);
      expect(mockFs.promises.writeFile).toHaveBeenCalledOnce();
    });

    it('应该生成正确的XML结构', async () => {
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      // 验证XML声明使用小写utf-8（真实实现）
      expect(xmlContent).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xmlContent).toContain('<data ');
      expect(xmlContent).toContain('recordCount="2"');
      expect(xmlContent).toContain('<metadata>');
      expect(xmlContent).toContain('<records>');
      expect(xmlContent).toContain('</data>');
    });

    it('应该正确处理特殊字符转义', async () => {
      const specialData: ExportData = {
        headers: ['name', 'description'],
        records: [
          ['<test>&"special"</test>', 'normal text']  // 数组格式
        ],
        totalRecords: 1,
        metadata: {}
      };
      
      await xmlExporter.exportData(specialData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      // 验证XML特殊字符转义（XMLExporter.escapeXML方法）
      expect(xmlContent).toContain('&lt;test&gt;&amp;&quot;special&quot;&lt;/test&gt;');
      expect(xmlContent).toContain('normal text');
    });

    it('应该处理空数据导出', async () => {
      const emptyData: ExportData = {
        headers: [],
        records: [],
        totalRecords: 0,  // 关键：必须设置totalRecords
        metadata: {}
      };
      
      const result = await xmlExporter.exportData(emptyData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0); // 来自totalRecords
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      expect(xmlContent).toContain('<records>');
      expect(xmlContent).toContain('</records>');
    });
  });

  describe('编码和格式化选项', () => {
    it('应该正确处理UTF-8编码（小写）', async () => {
      xmlExporter = new XMLExporter({ encoding: 'utf-8' });
      
      const unicodeData: ExportData = {
        headers: ['chinese', 'arabic'],
        records: [
          ['测试', 'اختبار']  // 数组格式
        ],
        totalRecords: 1,
        metadata: {}
      };
      
      await xmlExporter.exportData(unicodeData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      // 真实实现使用小写'utf-8'
      expect(xmlContent).toContain('encoding="utf-8"');
      expect(xmlContent).toContain('测试');
      expect(xmlContent).toContain('اختبار');
    });

    it('应该支持自定义元素名称', async () => {
      xmlExporter = new XMLExporter({
        rootElement: 'dataset',
        recordElement: 'measurement'
      });
      
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toContain('<dataset ');
      expect(xmlContent).toContain('</dataset>');
    });

    it('应该在compact模式下正确导出', async () => {
      xmlExporter = new XMLExporter({ prettyPrint: false });
      
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      // compact模式不应包含多余的空白
      expect(xmlContent).not.toContain('\n  ');
      expect(xmlContent).toContain('<data ');
    });
  });

  describe('错误处理 - 基于真实异常机制', () => {
    beforeEach(() => {
      xmlExporter = new XMLExporter();
    });

    it('应该处理文件写入错误（抛出异常）', async () => {
      const writeError = new Error('写入失败');
      mockFs.promises.writeFile = vi.fn().mockRejectedValue(writeError);
      
      // 真实XMLExporter抛出ExportError异常而不是返回错误结果
      await expect(xmlExporter.exportData(sampleData, tempFilePath))
        .rejects.toThrow('XML export failed: 写入失败');
    });

    it('应该处理没有totalRecords的数据', async () => {
      const dataWithoutTotal: ExportData = {
        headers: ['test'],
        records: [{ test: 'value' }],
        // 故意省略totalRecords
        metadata: {}
      };
      
      const result = await xmlExporter.exportData(dataWithoutTotal, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBeUndefined(); // 真实行为：undefined而不是0
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', async () => {
      const largeData: ExportData = {
        headers: ['id', 'value', 'timestamp'],
        records: Array.from({ length: 5000 }, (_, i) => [
          i,  // 数组格式
          Math.random() * 100,
          new Date(Date.now() + i * 1000).toISOString()
        ]),
        totalRecords: 5000,
        metadata: {}
      };

      xmlExporter = new XMLExporter();
      const mockCallback = vi.fn();
      xmlExporter.setProgressCallback(mockCallback);

      const startTime = performance.now();
      const result = await xmlExporter.exportData(largeData, tempFilePath);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(5000); // 来自totalRecords
      expect(endTime - startTime).toBeLessThan(10000); // 应在10秒内完成
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('进度回调测试', () => {
    it('应该调用进度回调', async () => {
      xmlExporter = new XMLExporter();
      const mockCallback = vi.fn();
      xmlExporter.setProgressCallback(mockCallback);
      
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      expect(mockCallback).toHaveBeenCalled();
      
      // 验证进度回调被调用了多次（真实XMLExporter在多个点报告进度）
      expect(mockCallback).toHaveBeenCalledWith(5, 0);    // 开始进度
      expect(mockCallback).toHaveBeenCalledWith(80, 2);   // 构建完成
      expect(mockCallback).toHaveBeenCalledWith(95, 2);   // 写入完成
      expect(mockCallback).toHaveBeenCalledWith(100, 2);  // 全部完成
    });
  });

  describe('元数据处理', () => {
    it('应该在根元素中包含元数据', async () => {
      xmlExporter = new XMLExporter({ includeAttributes: true });
      
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toContain('<metadata>');
      expect(xmlContent).toContain('exportDate');
      expect(xmlContent).toContain('sensor-data');
      expect(xmlContent).toContain('</metadata>');
    });
  });

  describe('真实源代码验证测试', () => {
    it('应该验证XML静态方法正确性', () => {
      // 测试isValidElementName方法
      expect(XMLExporter.isValidElementName('data')).toBe(true);
      expect(XMLExporter.isValidElementName('record')).toBe(true);
      expect(XMLExporter.isValidElementName('xml')).toBe(false); // 保留字
      expect(XMLExporter.isValidElementName('')).toBe(false);    // 空字符串
      expect(XMLExporter.isValidElementName('123data')).toBe(false); // 以数字开头
    });

    it('应该验证默认选项创建', () => {
      const defaults = XMLExporter.createDefaultOptions();
      expect(defaults.rootElement).toBe('data');
      expect(defaults.recordElement).toBe('record');
      expect(defaults.encoding).toBe('utf-8');
      expect(defaults.prettyPrint).toBe(true);
      expect(defaults.includeAttributes).toBe(true);
    });

    it('应该验证选项验证方法', () => {
      const validOptions: XMLOptions = {
        rootElement: 'data',
        recordElement: 'record',
        encoding: 'utf-8',
        prettyPrint: true,
        includeAttributes: true
      };
      
      expect(XMLExporter.validateOptions(validOptions)).toBe(true);
      
      const invalidOptions: XMLOptions = {
        rootElement: 'xml', // 无效：保留字
        recordElement: 'record',
        encoding: 'invalid-encoding', // 无效编码
        prettyPrint: true,
        includeAttributes: true
      };
      
      expect(XMLExporter.validateOptions(invalidOptions)).toBe(false);
    });
  });
});
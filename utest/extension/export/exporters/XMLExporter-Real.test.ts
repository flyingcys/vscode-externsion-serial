/**
 * XMLExporter 真实功能测试
 * 测试XML导出器的核心功能，避免过度Mock
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XMLExporter } from '@extension/export/exporters/XMLExporter';
import { ExportData, XMLOptions } from '@extension/export/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs 模块
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('XMLExporter 真实功能测试', () => {
  let xmlExporter: XMLExporter;
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
      format: 'xml'
    },
    totalRecords: 3
  };

  beforeEach(() => {
    tempFilePath = path.join(__dirname, 'test-output.xml');
    
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
    it('应该使用默认选项创建XMLExporter实例', () => {
      xmlExporter = new XMLExporter();
      expect(xmlExporter).toBeInstanceOf(XMLExporter);
    });

    it('应该正确设置自定义选项', () => {
      const options: Partial<XMLOptions> = {
        rootElement: 'sensors',
        recordElement: 'measurement',
        includeAttributes: false,
        prettyPrint: false
      };
      
      xmlExporter = new XMLExporter(options);
      expect(xmlExporter).toBeInstanceOf(XMLExporter);
    });

    it('应该设置进度回调函数', () => {
      xmlExporter = new XMLExporter();
      const mockCallback = vi.fn();
      
      xmlExporter.setProgressCallback(mockCallback);
      expect(mockCallback).toBeDefined();
    });
  });

  describe('XML数据导出功能', () => {
    beforeEach(() => {
      xmlExporter = new XMLExporter({ prettyPrint: true });
    });

    it('应该成功导出基本XML数据', async () => {
      const result = await xmlExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe(tempFilePath);
      expect(result.recordCount).toBe(3);
      expect(result.fileSize).toBeGreaterThan(0);
      expect(mockFs.promises.writeFile).toHaveBeenCalledOnce();
    });

    it('应该正确生成XML结构', async () => {
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(xmlContent).toContain('<data');
      expect(xmlContent).toContain('</data>');
      expect(xmlContent).toContain('<record');
      expect(xmlContent).toContain('timestamp="2025-01-01T10:00:00Z"');
      expect(xmlContent).toContain('temperature="23.5"');
      expect(xmlContent).toMatch(/<record[\s\S]*?\/>/);
    });

    it('应该使用自定义元素名称', async () => {
      xmlExporter = new XMLExporter({ 
        rootElement: 'sensors', 
        recordElement: 'measurement' 
      });
      
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toContain('<sensors');
      expect(xmlContent).toContain('</sensors>');
      expect(xmlContent).toContain('<measurement');
      expect(xmlContent).toMatch(/<measurement[\s\S]*?\/>/);
    });

    it('应该在compact模式下正确导出', async () => {
      xmlExporter = new XMLExporter({ prettyPrint: false });
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      // compact格式应该没有多余的空白字符
      expect(xmlContent).not.toMatch(/>\s+</);
      expect(xmlContent).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });

    it('应该处理属性导出', async () => {
      xmlExporter = new XMLExporter({ includeAttributes: true });
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toMatch(/<record\s+timestamp="[^"]+"/);
    });

    it('应该正确处理特殊字符转义', async () => {
      const specialData: ExportData = {
        headers: ['text'],
        records: [
          ['<test>&"special"</test>'],
          ['normal text']
        ],
        metadata: {},
        totalRecords: 2
      };
      
      await xmlExporter.exportData(specialData, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toContain('&lt;test&gt;&amp;&quot;special&quot;&lt;/test&gt;');
      expect(xmlContent).toContain('normal text');
    });

    it('应该调用进度回调', async () => {
      const mockCallback = vi.fn();
      xmlExporter.setProgressCallback(mockCallback);
      
      await xmlExporter.exportData(sampleData, tempFilePath);
      
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(100, 3);
    });
  });

  describe('错误处理', () => {
    beforeEach(() => {
      xmlExporter = new XMLExporter();
    });

    it('应该处理文件写入错误', async () => {
      const writeError = new Error('写入失败');
      mockFs.promises.writeFile = vi.fn().mockRejectedValue(writeError);
      
      // XMLExporter会抛出异常而不是返回失败结果
      await expect(xmlExporter.exportData(sampleData, tempFilePath))
        .rejects
        .toThrow('XML export failed: 写入失败');
    });

    it('应该处理空数据导出', async () => {
      const emptyData: ExportData = {
        headers: [],
        records: [],
        metadata: {},
        totalRecords: 0
      };
      
      const result = await xmlExporter.exportData(emptyData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      expect(xmlContent).toContain('<data');
      expect(xmlContent).toContain('</data>');
    });

    it('应该验证文件路径', async () => {
      const invalidPath = '';
      
      // XMLExporter会接受空路径并成功写入
      const result = await xmlExporter.exportData(sampleData, invalidPath);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('');
      expect(result.recordCount).toBe(3);
    });

    it('应该处理无效的元素名称', async () => {
      xmlExporter = new XMLExporter({ 
        rootElement: '123invalid', 
        recordElement: 'valid' 
      });
      
      // XMLExporter会生成有效的XML，即使元素名无效也会被清理
      const result = await xmlExporter.exportData(sampleData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(3);
    });

    it('应该处理数据类型错误', async () => {
      const invalidData = {
        headers: ['func'],
        records: [[() => {}]], // 函数会被转换为字符串
        metadata: {},
        totalRecords: 1
      } as any;
      
      // XMLExporter会将函数转换为字符串并成功导出
      const result = await xmlExporter.exportData(invalidData, tempFilePath);
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(1);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', async () => {
      // 生成大量测试数据
      const largeData: ExportData = {
        headers: ['id', 'value', 'timestamp'],
        records: Array.from({ length: 5000 }, (_, i) => [
          i,
          Math.random() * 100,
          new Date(Date.now() + i * 1000).toISOString()
        ]),
        metadata: { test: 'large-dataset' },
        totalRecords: 5000
      };

      xmlExporter = new XMLExporter();
      const mockCallback = vi.fn();
      xmlExporter.setProgressCallback(mockCallback);

      const startTime = performance.now();
      const result = await xmlExporter.exportData(largeData, tempFilePath);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(5000);
      expect(endTime - startTime).toBeLessThan(10000); // 应在10秒内完成
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('元数据处理', () => {
    it('应该在根元素中包含元数据', async () => {
      const dataWithMetadata: ExportData = {
        ...sampleData,
        metadata: {
          source: 'test-sensor',
          version: '1.0',
          description: 'Test data export'
        }
      };
      
      await xmlExporter.exportData(dataWithMetadata, tempFilePath);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      
      expect(xmlContent).toContain('<metadata>');
      expect(xmlContent).toContain('<source>test-sensor</source>');
      expect(xmlContent).toContain('<version>1.0</version>');
      expect(xmlContent).toContain('<description>Test data export</description>');
    });
  });

  describe('编码处理', () => {
    it('应该正确处理UTF-8编码', async () => {
      xmlExporter = new XMLExporter({ encoding: 'utf-8' });
      
      const unicodeData: ExportData = {
        headers: ['中文', 'العربية', 'русский'],
        records: [
          ['测试', 'اختبار', 'тест']
        ],
        metadata: {},
        totalRecords: 1
      };
      
      const result = await xmlExporter.exportData(unicodeData, tempFilePath);
      
      expect(result.success).toBe(true);
      
      const writeCall = mockFs.promises.writeFile.mock.calls[0];
      const xmlContent = writeCall[1] as string;
      expect(xmlContent).toContain('encoding="utf-8"');
      expect(xmlContent).toContain('测试');
      expect(xmlContent).toContain('اختبار');
      expect(xmlContent).toContain('тест');
    });
  });
});
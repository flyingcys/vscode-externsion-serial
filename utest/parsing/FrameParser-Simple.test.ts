/**
 * FrameParser 简化测试 - 专注覆盖率提升
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { FrameParser } from '../../src/extension/parsing/FrameParser';

describe('FrameParser 简化覆盖率测试', () => {
  let frameParser: FrameParser;

  beforeAll(() => {
    // 取消vm2的Mock，使用真实的vm2库进行测试
    vi.unmock('vm2');
  });

  beforeEach(() => {
    // 简化配置，专注基本功能
    frameParser = new FrameParser({
      timeout: 1000,
      memoryLimit: 10 * 1024 * 1024, // 10MB
      enableConsole: false // 禁用console减少复杂性
    });
  });

  afterEach(() => {
    if (frameParser) {
      frameParser.destroy();
    }
  });

  describe('1. 基础初始化测试', () => {
    it('应该创建FrameParser实例', () => {
      expect(frameParser).toBeDefined();
      expect(frameParser).toBeInstanceOf(FrameParser);
    });

    it('应该有默认配置', () => {
      const config = frameParser.getConfig();
      expect(config).toHaveProperty('timeout');
      expect(config).toHaveProperty('memoryLimit');
      expect(config).toHaveProperty('enableConsole');
    });
  });

  describe('2. 静态方法测试', () => {
    it('应该获取默认脚本', () => {
      const defaultScript = FrameParser.getDefaultScript();
      expect(defaultScript).toContain('function parse(frame)');
      expect(defaultScript).toContain('return frame.split');
    });

    it('应该创建CSV模板', () => {
      const csvTemplate = FrameParser.createTemplate('csv');
      expect(csvTemplate).toContain('function parse(frame)');
      expect(csvTemplate).toContain('split');
    });

    it('应该创建JSON模板', () => {
      const jsonTemplate = FrameParser.createTemplate('json');
      expect(jsonTemplate).toContain('function parse(frame)');
      expect(jsonTemplate).toContain('JSON.parse');
    });

    it('应该创建自定义模板', () => {
      const customTemplate = FrameParser.createTemplate('custom');
      expect(customTemplate).toContain('function parse(frame)');
    });
  });
});
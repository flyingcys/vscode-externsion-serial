/**
 * FrameParser 真实源代码测试
 * 
 * 测试真实的FrameParser类而非Mock版本
 * 目标：将数据解析模块覆盖率从0.91%提升到95%+
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { FrameParser, ParseResult, ParserConfig } from '../../src/extension/parsing/FrameParser';

describe('FrameParser 真实源代码测试', () => {
  let frameParser: FrameParser;

  beforeAll(() => {
    // 取消vm2的Mock，使用真实的vm2库进行测试
    vi.unmock('vm2');
  });

  beforeEach(() => {
    const config: Partial<ParserConfig> = {
      timeout: 5000,
      memoryLimit: 50 * 1024 * 1024, // 50MB
      enableConsole: true
    };
    frameParser = new FrameParser(config);
  });

  afterEach(() => {
    if (frameParser) {
      frameParser.removeAllListeners();
    }
  });

  describe('1. 基础功能测试', () => {
    it('应该正确初始化FrameParser', () => {
      expect(frameParser).toBeDefined();
      expect(frameParser instanceof FrameParser).toBe(true);
    });

    it('应该执行默认的CSV解析', () => {
      const frame = 'temp=25.5,hum=60.2,press=1013.25';
      
      const result = frameParser.parse(frame);
      
      expect(result.success).toBe(true);
      expect(result.datasets).toEqual(['temp=25.5', 'hum=60.2', 'press=1013.25']);
      expect(result.error).toBeUndefined();
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('应该处理空字符串输入', () => {
      const result = frameParser.parse('');
      
      expect(result.success).toBe(true);
      expect(result.datasets).toEqual(['']);
    });
  });

  describe('2. 自定义解析脚本测试', () => {
    it('应该加载自定义解析脚本', () => {
      const customScript = `
        function parse(frame) {
          return frame.split(';');
        }
      `;
      
      const success = frameParser.loadScript(customScript);
      expect(success).toBe(true);
    });

    it('应该执行自定义分号分隔解析', () => {
      const customScript = `
        function parse(frame) {
          return frame.split(';');
        }
      `;
      
      frameParser.loadScript(customScript);
      const result = frameParser.parse('a;b;c;d');
      
      expect(result.success).toBe(true);
      expect(result.datasets).toEqual(['a', 'b', 'c', 'd']);
    });

    it('应该处理复杂JSON解析', () => {
      const jsonScript = `
        function parse(frame) {
          try {
            const data = JSON.parse(frame);
            return [
              String(data.temperature || 0),
              String(data.humidity || 0),
              String(data.pressure || 0)
            ];
          } catch (e) {
            return ['0', '0', '0'];
          }
        }
      `;
      
      frameParser.loadScript(jsonScript);
      const result = frameParser.parse('{"temperature": 25.5, "humidity": 60.2, "pressure": 1013.25}');
      
      expect(result.success).toBe(true);
      expect(result.datasets).toEqual(['25.5', '60.2', '1013.25']);
    });
  });

  describe('3. 安全和错误处理测试', () => {
    it('应该处理语法错误脚本', () => {
      const badScript = `
        function parse(frame {  // 缺少闭合括号
          return frame.split(',');
        }
      `;
      
      // 捕获错误事件
      let errorMessage = '';
      frameParser.on('error', (error) => {
        errorMessage = error.message;
      });
      
      const success = frameParser.loadScript(badScript);
      expect(success).toBe(false);
      expect(errorMessage).toContain('脚本加载错误');
    });

    it('应该处理运行时错误', () => {
      const errorScript = `
        function parse(frame) {
          throw new Error('测试错误');
        }
      `;
      
      frameParser.loadScript(errorScript);
      const result = frameParser.parse('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('测试错误');
    });

    it('应该阻止危险代码执行', () => {
      const dangerousScript = `
        function parse(frame) {
          process.exit(1); // 应该被阻止
          return [];
        }
      `;
      
      const success = frameParser.loadScript(dangerousScript);
      // VM2应该阻止这种危险操作，或者在执行时报错
      if (success) {
        const result = frameParser.parse('test');
        expect(result.success).toBe(false);
      } else {
        expect(success).toBe(false);
      }
    });

    it('应该处理无限循环超时', () => {
      const infiniteScript = `
        function parse(frame) {
          while(true) {
            // 无限循环
          }
          return [];
        }
      `;
      
      frameParser.loadScript(infiniteScript);
      const result = frameParser.parse('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    }, 10000);
  });

  describe('4. 性能测试', () => {
    it('应该快速处理小数据', () => {
      const start = performance.now();
      frameParser.parse('a,b,c,d,e');
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50); // 应该在50ms内完成
    });

    it('应该处理大数据字符串', () => {
      const largeData = Array(1000).fill('value').join(',');
      
      const result = frameParser.parse(largeData);
      
      expect(result.success).toBe(true);
      expect(result.datasets).toHaveLength(1000);
    });
  });

  describe('5. 事件和回调测试', () => {
    it('应该触发console事件', (done) => {
      const consoleScript = `
        function parse(frame) {
          console.log('解析:', frame);
          return frame.split(',');
        }
      `;
      
      frameParser.on('console', (level, args) => {
        expect(level).toBe('log');
        expect(args[0]).toBe('解析:');
        expect(args[1]).toBe('test');
        done();
      });
      
      frameParser.loadScript(consoleScript);
      frameParser.parse('test');
    });
  });

  describe('6. 脚本状态管理测试', () => {
    it('应该检测脚本修改状态', () => {
      expect(frameParser.getIsModified()).toBe(false);
      
      frameParser.loadScript('function parse(frame) { return []; }');
      // 脚本成功加载后，isModified会被重置为false
      expect(frameParser.getIsModified()).toBe(false);
    });

    it('应该重置脚本到默认状态', () => {
      frameParser.loadScript('function parse(frame) { return []; }');
      frameParser.reset();
      
      expect(frameParser.getIsModified()).toBe(false);
    });

    it('应该获取脚本文本', () => {
      const script = 'function parse(frame) { return ["test"]; }';
      frameParser.loadScript(script);
      
      expect(frameParser.getText()).toContain('function parse(frame)');
    });

    it('应该验证脚本语法', () => {
      const validScript = 'function parse(frame) { return []; }';
      const invalidScript = 'function parse(frame { return []; }'; // 缺少闭合括号
      
      expect(frameParser.validateSyntax(validScript).valid).toBe(true);
      expect(frameParser.validateSyntax(invalidScript).valid).toBe(false);
    });

    it('应该获取配置信息', () => {
      const config = frameParser.getConfig();
      
      expect(config).toHaveProperty('timeout');
      expect(config).toHaveProperty('memoryLimit');
      expect(config).toHaveProperty('enableConsole');
    });

    it('应该获取统计信息', () => {
      const stats = frameParser.getStats();
      
      expect(stats).toHaveProperty('timeout');
      expect(stats).toHaveProperty('memoryLimit');
      expect(stats).toHaveProperty('isReady');
    });
  });
});
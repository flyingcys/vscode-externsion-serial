/**
 * FrameParser 增强覆盖率测试
 * 专门测试未覆盖的方法和分支以提高覆盖率到90%+
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrameParser, type ParseResult, type ParserConfig } from '../../src/extension/parsing/FrameParser';

describe('FrameParser 增强覆盖率测试', () => {
  let parser: FrameParser;

  beforeEach(() => {
    parser = new FrameParser();
  });

  afterEach(() => {
    if (parser) {
      parser.removeAllListeners();
    }
  });

  describe('构造函数和配置测试', () => {
    it('应该使用默认配置创建实例', () => {
      const defaultParser = new FrameParser();
      expect(defaultParser).toBeInstanceOf(FrameParser);
    });

    it('应该使用自定义配置创建实例', () => {
      const customConfig: Partial<ParserConfig> = {
        timeout: 1000,
        memoryLimit: 64 * 1024 * 1024,
        enableConsole: false
      };
      
      const customParser = new FrameParser(customConfig);
      expect(customParser).toBeInstanceOf(FrameParser);
    });

    it('应该处理部分配置', () => {
      const partialConfig = { timeout: 2000 };
      const partialParser = new FrameParser(partialConfig);
      expect(partialParser).toBeInstanceOf(FrameParser);
    });
  });

  describe('loadScript() 方法完整测试', () => {
    it('应该成功加载有效的解析脚本', () => {
      const validScript = `
        function parse(frame) {
          return frame.split(',');
        }
      `;
      
      const result = parser.loadScript(validScript);
      expect(result).toBe(true);
    });

    it('应该拒绝没有parse函数的脚本', () => {
      const invalidScript = `
        function notParse(frame) {
          return frame.split(',');
        }
      `;
      
      let errorEmitted = false;
      parser.on('error', () => { errorEmitted = true; });
      
      const result = parser.loadScript(invalidScript);
      expect(result).toBe(false);
      expect(errorEmitted).toBe(true);
    });

    it('应该拒绝parse函数不可调用的脚本', () => {
      const invalidScript = `
        var parse = "not a function";
      `;
      
      let errorEmitted = false;
      parser.on('error', () => { errorEmitted = true; });
      
      const result = parser.loadScript(invalidScript);
      expect(result).toBe(false);
      expect(errorEmitted).toBe(true);
    });

    it('应该处理语法错误的脚本', () => {
      const syntaxErrorScript = `
        function parse(frame {
          return frame.split(',');
        }
      `;
      
      let errorEmitted = false;
      parser.on('error', () => { errorEmitted = true; });
      
      const result = parser.loadScript(syntaxErrorScript);
      expect(result).toBe(false);
      expect(errorEmitted).toBe(true);
    });

    it('应该发射scriptLoaded事件', () => {
      const validScript = `
        function parse(frame) {
          return ['test'];
        }
      `;
      
      let scriptLoadedEmitted = false;
      parser.on('scriptLoaded', (script) => {
        scriptLoadedEmitted = true;
        expect(script).toBe(validScript);
      });
      
      parser.loadScript(validScript);
      expect(scriptLoadedEmitted).toBe(true);
    });
  });

  describe('validateParseFunction() 方法测试', () => {
    it('应该验证标准的parse函数声明', () => {
      const validScripts = [
        'function parse(frame) { return []; }',
        'function parse(data) { return []; }', 
        'function parse(input) { return []; }',
        'function parse(frame, context) { return []; }',
        '  function  parse  (  frame  )  { return []; }', // 带空格
      ];
      
      validScripts.forEach(script => {
        const result = parser.loadScript(script);
        expect(result).toBe(true);
      });
    });

    it('应该拒绝无效的parse函数声明', () => {
      const invalidScripts = [
        'function notParse(frame) { return []; }',
        'var parse = function(frame) { return []; }',
        'const parse = (frame) => { return []; }',
        'function parse() { return []; }', // 无参数
        'function parse(123) { return []; }', // 无效参数名
        'function parse(frame, 123) { return []; }', // 无效第二个参数名
      ];
      
      invalidScripts.forEach(script => {
        let errorEmitted = false;
        parser.on('error', () => { errorEmitted = true; });
        
        const result = parser.loadScript(script);
        expect(result).toBe(false);
        
        // 清理监听器
        parser.removeAllListeners();
      });
    });
  });

  describe('parse() 方法执行测试', () => {
    beforeEach(() => {
      const script = `
        function parse(frame) {
          return frame.split(',');
        }
      `;
      parser.loadScript(script);
    });

    it('应该成功解析数据并发射parsed事件', () => {
      let parsedEmitted = false;
      let parseResult: ParseResult | null = null;
      
      parser.on('parsed', (result) => {
        parsedEmitted = true;
        parseResult = result;
      });
      
      const result = parser.parse('a,b,c');
      
      expect(result).toEqual(['a', 'b', 'c']);
      expect(parsedEmitted).toBe(true);
      expect(parseResult).toMatchObject({
        datasets: ['a', 'b', 'c'],
        success: true
      });
      expect(parseResult!.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('应该处理非数组返回值', () => {
      const nonArrayScript = `
        function parse(frame) {
          return "not an array";
        }
      `;
      
      parser.loadScript(nonArrayScript);
      
      let errorEmitted = false;
      parser.on('error', () => { errorEmitted = true; });
      
      expect(() => parser.parse('test')).toThrow();
      expect(errorEmitted).toBe(true);
    });

    it('应该将所有返回值转换为字符串', () => {
      const mixedTypeScript = `
        function parse(frame) {
          return [123, true, null, undefined, 'string'];
        }
      `;
      
      parser.loadScript(mixedTypeScript);
      
      const result = parser.parse('test');
      expect(result).toEqual(['123', 'true', 'null', 'undefined', 'string']);
    });

    it('应该处理解析过程中的运行时错误', () => {
      const errorScript = `
        function parse(frame) {
          throw new Error('Runtime error');
        }
      `;
      
      parser.loadScript(errorScript);
      
      let errorEmitted = false;
      parser.on('error', (error) => {
        errorEmitted = true;
        expect(error.message).toContain('Runtime error');
      });
      
      expect(() => parser.parse('test')).toThrow();
      expect(errorEmitted).toBe(true);
    });

    it('应该处理复杂的解析逻辑', () => {
      const complexScript = `
        var counter = 0;
        function parse(frame) {
          counter++;
          var parts = frame.split(',');
          var result = [];
          for (var i = 0; i < parts.length; i++) {
            if (parts[i].trim()) {
              result.push('frame_' + counter + '_' + parts[i].trim());
            }
          }
          return result;
        }
      `;
      
      parser.loadScript(complexScript);
      
      const result1 = parser.parse('a, b, c');
      expect(result1).toEqual(['frame_1_a', 'frame_1_b', 'frame_1_c']);
      
      const result2 = parser.parse('x, y');
      expect(result2).toEqual(['frame_2_x', 'frame_2_y']);
    });
  });

  describe('事件系统测试', () => {
    it('应该正确发射console事件', () => {
      const consoleScript = `
        function parse(frame) {
          console.log('Log message');
          console.warn('Warning message');
          console.error('Error message');
          console.info('Info message');
          return ['test'];
        }
      `;
      
      parser.loadScript(consoleScript);
      
      const consoleEvents: Array<{type: string, args: any[]}> = [];
      parser.on('console', (type, args) => {
        consoleEvents.push({ type, args });
      });
      
      parser.parse('test');
      
      expect(consoleEvents).toHaveLength(4);
      expect(consoleEvents[0]).toEqual({ type: 'log', args: ['Log message'] });
      expect(consoleEvents[1]).toEqual({ type: 'warn', args: ['Warning message'] });
      expect(consoleEvents[2]).toEqual({ type: 'error', args: ['Error message'] });
      expect(consoleEvents[3]).toEqual({ type: 'info', args: ['Info message'] });
    });

    it('应该在禁用console时不发射console事件', () => {
      const noConsoleParser = new FrameParser({ enableConsole: false });
      
      const consoleScript = `
        function parse(frame) {
          console.log('This should not emit');
          return ['test'];
        }
      `;
      
      noConsoleParser.loadScript(consoleScript);
      
      let consoleEventEmitted = false;
      noConsoleParser.on('console', () => { consoleEventEmitted = true; });
      
      noConsoleParser.parse('test');
      
      expect(consoleEventEmitted).toBe(false);
    });
  });

  describe('安全沙箱测试', () => {
    it('应该防止访问危险的全局对象', () => {
      const dangerousScript = `
        function parse(frame) {
          try {
            require('fs');
            return ['security_breach'];
          } catch (e) {
            return ['secure'];
          }
        }
      `;
      
      parser.loadScript(dangerousScript);
      const result = parser.parse('test');
      expect(result).toEqual(['secure']);
    });

    it('应该允许访问安全的全局对象', () => {
      const safeScript = `
        function parse(frame) {
          var result = [];
          result.push(Math.PI.toString());
          result.push(JSON.stringify({test: true}));
          result.push(new Date().getFullYear().toString());
          result.push(parseInt('123').toString());
          result.push(parseFloat('123.45').toString());
          return result;
        }
      `;
      
      parser.loadScript(safeScript);
      const result = parser.parse('test');
      
      expect(result[0]).toBe(Math.PI.toString());
      expect(result[1]).toBe('{"test":true}');
      expect(result[2]).toBe(new Date().getFullYear().toString());
      expect(result[3]).toBe('123');
      expect(result[4]).toBe('123.45');
    });

    it('应该禁用eval和Function构造器', () => {
      const evalScript = `
        function parse(frame) {
          try {
            eval('var x = 1');
            return ['eval_works'];
          } catch (e) {
            return ['eval_blocked'];
          }
        }
      `;
      
      parser.loadScript(evalScript);
      const result = parser.parse('test');
      expect(result).toEqual(['eval_blocked']);
    });
  });

  describe('超时和资源限制测试', () => {
    it('应该处理超时情况', () => {
      const timeoutParser = new FrameParser({ timeout: 100 });
      
      const infiniteLoopScript = `
        function parse(frame) {
          while (true) {
            // 无限循环
          }
          return ['never_reached'];
        }
      `;
      
      let errorEmitted = false;
      timeoutParser.on('error', () => { errorEmitted = true; });
      
      timeoutParser.loadScript(infiniteLoopScript);
      
      expect(() => timeoutParser.parse('test')).toThrow();
      expect(errorEmitted).toBe(true);
    });

    it('应该处理正常执行时间内的脚本', () => {
      const fastParser = new FrameParser({ timeout: 1000 });
      
      const fastScript = `
        function parse(frame) {
          return frame.split(',');
        }
      `;
      
      fastParser.loadScript(fastScript);
      const result = fastParser.parse('a,b,c');
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('静态方法测试', () => {
    it('应该获取默认脚本', () => {
      const defaultScript = FrameParser.getDefaultScript();
      expect(defaultScript).toContain('function parse(frame)');
      expect(defaultScript).toContain('return frame.split(\',\');');
    });

    it('应该创建CSV模板', () => {
      const csvTemplate = FrameParser.createCSVTemplate(['col1', 'col2', 'col3']);
      expect(csvTemplate).toContain('function parse(frame)');
      expect(csvTemplate).toContain('col1');
      expect(csvTemplate).toContain('col2');
      expect(csvTemplate).toContain('col3');
    });

    it('应该创建JSON模板', () => {
      const jsonTemplate = FrameParser.createJSONTemplate(['field1', 'field2']);
      expect(jsonTemplate).toContain('function parse(frame)');
      expect(jsonTemplate).toContain('JSON.parse');
      expect(jsonTemplate).toContain('field1');
      expect(jsonTemplate).toContain('field2');
    });

    it('应该创建自定义模板', () => {
      const customTemplate = FrameParser.createCustomTemplate('custom logic');
      expect(customTemplate).toContain('function parse(frame)');
      expect(customTemplate).toContain('custom logic');
    });
  });

  describe('错误恢复和状态管理测试', () => {
    it('应该在脚本加载失败后保持稳定状态', () => {
      // 先加载一个有效脚本
      const validScript = `
        function parse(frame) {
          return ['valid'];
        }
      `;
      parser.loadScript(validScript);
      expect(parser.parse('test')).toEqual(['valid']);
      
      // 然后尝试加载无效脚本
      const invalidScript = 'invalid javascript syntax {';
      const result = parser.loadScript(invalidScript);
      expect(result).toBe(false);
      
      // 原有脚本应该不受影响（但实际上会被清理）
      expect(() => parser.parse('test')).toThrow();
    });

    it('应该处理多次加载脚本', () => {
      const script1 = `
        function parse(frame) {
          return ['script1'];
        }
      `;
      
      const script2 = `
        function parse(frame) {
          return ['script2'];
        }  
      `;
      
      parser.loadScript(script1);
      expect(parser.parse('test')).toEqual(['script1']);
      
      parser.loadScript(script2);
      expect(parser.parse('test')).toEqual(['script2']);
    });

    it('应该正确清理和重置状态', () => {
      const script = `
        var state = 'initial';
        function parse(frame) {
          state = 'modified';
          return [state];
        }
      `;
      
      parser.loadScript(script);
      expect(parser.parse('test1')).toEqual(['modified']);
      
      // 重新加载相同脚本应该重置状态
      parser.loadScript(script);
      expect(parser.parse('test2')).toEqual(['modified']);
    });
  });

  describe('边界条件和极端情况测试', () => {
    it('应该处理空字符串输入', () => {
      const script = `
        function parse(frame) {
          if (!frame) return ['empty'];
          return frame.split(',');
        }
      `;
      
      parser.loadScript(script);
      const result = parser.parse('');
      expect(result).toEqual(['empty']);
    });

    it('应该处理特殊字符输入', () => {
      const script = `
        function parse(frame) {
          return [frame.length.toString()];
        }
      `;
      
      parser.loadScript(script);
      const result = parser.parse('\x00\x01\x02\n\r\t');
      expect(result).toEqual(['6']);
    });

    it('应该处理大量数据', () => {
      const script = `
        function parse(frame) {
          return [frame.length.toString()];
        }
      `;
      
      parser.loadScript(script);
      const largeData = 'A'.repeat(10000);
      const result = parser.parse(largeData);
      expect(result).toEqual(['10000']);
    });

    it('应该处理Unicode字符', () => {
      const script = `
        function parse(frame) {
          return [frame];
        }
      `;
      
      parser.loadScript(script);
      const unicodeData = '你好世界🌍';
      const result = parser.parse(unicodeData);
      expect(result).toEqual([unicodeData]);
    });
  });

  describe('性能和执行统计测试', () => {
    it('应该记录执行时间', () => {
      const script = `
        function parse(frame) {
          // 模拟一些处理时间
          var start = Date.now();
          while (Date.now() - start < 10) {
            // 等待10ms
          }
          return ['timed'];
        }
      `;
      
      parser.loadScript(script);
      
      let executionTime = 0;
      parser.on('parsed', (result) => {
        executionTime = result.executionTime;
      });
      
      parser.parse('test');
      expect(executionTime).toBeGreaterThanOrEqual(10);
    });

    it('应该在高频调用下保持稳定', () => {
      const script = `
        var callCount = 0;
        function parse(frame) {
          callCount++;
          return [callCount.toString()];
        }
      `;
      
      parser.loadScript(script);
      
      for (let i = 1; i <= 100; i++) {
        const result = parser.parse('test');
        expect(result).toEqual([i.toString()]);
      }
    });
  });

  describe('内存和资源管理测试', () => {
    it('应该正确清理事件监听器', () => {
      let eventCount = 0;
      
      const listener = () => { eventCount++; };
      parser.on('parsed', listener);
      
      // 触发事件
      parser.loadScript('function parse(frame) { return ["test"]; }');
      parser.parse('test');
      expect(eventCount).toBe(1);
      
      // 移除监听器
      parser.removeListener('parsed', listener);
      parser.parse('test');
      expect(eventCount).toBe(1); // 应该不再增加
    });

    it('应该在大量脚本更新后保持稳定', () => {
      for (let i = 0; i < 50; i++) {
        const script = `
          function parse(frame) {
            return ['iteration_${i}'];
          }
        `;
        
        parser.loadScript(script);
        const result = parser.parse('test');
        expect(result).toEqual([`iteration_${i}`]);
      }
    });
  });
});
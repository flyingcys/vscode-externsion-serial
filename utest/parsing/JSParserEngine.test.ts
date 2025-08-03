/**
 * JavaScript解析引擎安全测试
 * 
 * 测试VM2安全沙箱的核心功能：
 * - JavaScript代码安全执行
 * - 沙箱隔离和权限控制
 * - 恶意代码防护
 * - 性能监控和资源限制
 * - 代码语法验证
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestUtils } from '@test';
import { JSParserEngine, JSParserConfig, ParseResult, SecurityPolicy } from '../mocks/JSParserEngine';

// 使用Mock版本的JSParserEngine

describe('JavaScript解析引擎安全测试', () => {
  let jsEngine: JSParserEngine;
  let memoryDetector: TestUtils.Performance.MemoryDetector;

  beforeEach(() => {
    const config: JSParserConfig = {
      timeout: 5000,
      allowConsole: false,
      maxMemory: 50 * 1024 * 1024 // 50MB
    };
    jsEngine = new JSParserEngine(config);
    memoryDetector = new TestUtils.Performance.MemoryDetector();
  });

  afterEach(() => {
    if (jsEngine) {
      jsEngine.destroy();
    }
  });

  describe('1. 基础功能测试', () => {
    it('应该正确初始化JavaScript引擎', () => {
      expect(jsEngine).toBeDefined();
      expect(jsEngine.getStats().executionCount).toBe(0);
    });

    it('应该执行简单的解析代码', () => {
      const code = `
        function parse(input) {
          const data = JSON.parse(input);
          return {
            temperature: data.temp,
            humidity: data.hum
          };
        }
      `;

      const inputData = '{"temp": 25.5, "hum": 60}';
      const result = jsEngine.parseData(code, inputData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        temperature: 25.5,
        humidity: 60
      });
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('应该处理数学计算', () => {
      const code = `
        function parse(input) {
          const values = input.split(',').map(v => parseFloat(v));
          return {
            sum: values.reduce((a, b) => a + b, 0),
            average: values.reduce((a, b) => a + b, 0) / values.length,
            max: Math.max(...values),
            min: Math.min(...values)
          };
        }
      `;

      const inputData = '10.5,20.3,15.8,12.1';
      const result = jsEngine.parseData(code, inputData);

      expect(result.success).toBe(true);
      expect(result.data.sum).toBeCloseTo(58.7);
      expect(result.data.average).toBeCloseTo(14.675);
      expect(result.data.max).toBe(20.3);
      expect(result.data.min).toBe(10.5);
    });
  });

  describe('2. 安全沙箱隔离测试', () => {
    it('应该阻止访问process对象', () => {
      const maliciousCode = `
        function parse(input) {
          return process.env; // 尝试访问环境变量
        }
      `;

      const result = jsEngine.parseData(maliciousCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Forbidden keyword detected: process.');
    });

    it('应该阻止require调用', () => {
      const maliciousCode = `
        function parse(input) {
          const fs = require('fs'); // 尝试导入文件系统模块
          return fs.readFileSync('/etc/passwd');
        }
      `;

      const result = jsEngine.parseData(maliciousCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Forbidden keyword detected: require()');
    });

    it('应该阻止eval调用', () => {
      const maliciousCode = `
        function parse(input) {
          return eval('process.exit(1)'); // 尝试使用eval执行危险代码
        }
      `;

      const result = jsEngine.parseData(maliciousCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Forbidden keyword detected: eval()');
    });

    it('应该阻止构造函数逃逸', () => {
      const maliciousCode = `
        function parse(input) {
          // 尝试通过构造函数逃逸沙箱
          return this.constructor.constructor('return process')();
        }
      `;

      const result = jsEngine.parseData(maliciousCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Forbidden keyword detected: constructor.constructor');
    });

    it('应该阻止原型链污染', () => {
      const maliciousCode = `
        function parse(input) {
          // 尝试污染原型链
          Object.prototype.__proto__ = null;
          return 'prototype polluted';
        }
      `;

      const result = jsEngine.parseData(maliciousCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Forbidden keyword detected: __proto__');
    });

    it('应该阻止全局对象访问', () => {
      const maliciousCode = `
        function parse(input) {
          return global.process; // 尝试通过global访问process
        }
      `;

      const result = jsEngine.parseData(maliciousCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Forbidden keyword detected: global.');
    });
  });

  describe('3. 代码语法验证测试', () => {
    it('应该验证有效的JavaScript语法', () => {
      const validCode = `
        function parse(input) {
          const data = JSON.parse(input);
          return data.value * 2;
        }
      `;

      const validation = jsEngine.validateSyntax(validCode);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该检测语法错误', () => {
      const invalidCode = `
        function parse(input) {
          const data = JSON.parse(input
          return data.value; // 缺少右括号
        }
      `;

      const validation = jsEngine.validateSyntax(invalidCode);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Syntax error');
    });

    it('应该检测多个安全问题', () => {
      const maliciousCode = `
        function parse(input) {
          const fs = require('fs');
          eval('global.process.exit(1)');
          return 'malicious';
        }
      `;

      const validation = jsEngine.validateSyntax(maliciousCode);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThanOrEqual(3); // require, eval, global
    });
  });

  describe('4. 性能和资源限制测试', () => {
    it('应该限制执行时间', () => {
      const timeoutCode = `
        function parse(input) {
          // 无限循环
          while(true) {
            // 消耗CPU时间
          }
          return 'never reached';
        }
      `;

      const startTime = performance.now();
      const result = jsEngine.parseData(timeoutCode, 'test');
      const endTime = performance.now();

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
      expect(endTime - startTime).toBeLessThan(6000); // 应该在超时时间内终止
    });

    it('应该处理高频执行', async () => {
      const simpleCode = `
        function parse(input) {
          return parseInt(input) * 2;
        }
      `;

      const iterations = 1000;
      let successCount = 0;

      memoryDetector.takeSnapshot('start');

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = jsEngine.parseData(simpleCode, i.toString());
        if (result.success) {
          successCount++;
          expect(result.data).toBe(i * 2);
        }

        if (i % 100 === 0) {
          memoryDetector.takeSnapshot(`iteration-${i}`);
        }
      }

      const endTime = performance.now();
      memoryDetector.takeSnapshot('end');

      expect(successCount).toBe(iterations);
      
      const totalTime = endTime - startTime;
      const executionsPerSecond = (iterations * 1000) / totalTime;

      // 应该达到每秒至少100次执行
      TestUtils.Assertions.Performance.assertThroughput(
        executionsPerSecond,
        100,
        'JavaScript parsing'
      );

      // 检查内存泄漏
      TestUtils.Assertions.Performance.assertNoMemoryLeaks(memoryDetector);
    });

    it('应该正确计算执行统计', () => {
      const code = `
        function parse(input) {
          return { value: parseInt(input) };
        }
      `;

      // 执行多次
      for (let i = 0; i < 5; i++) {
        jsEngine.parseData(code, i.toString());
      }

      const stats = jsEngine.getStats();
      expect(stats.executionCount).toBe(5);
      expect(stats.averageTime).toBeGreaterThan(0);
      expect(stats.totalTime).toBeGreaterThan(0);
      expect(stats.totalTime).toBeCloseTo(stats.averageTime * 5, 1);
    });
  });

  describe('5. 错误处理测试', () => {
    it('应该处理运行时错误', () => {
      const errorCode = `
        function parse(input) {
          const data = JSON.parse(input);
          return data.nonexistent.property; // 将导致TypeError
        }
      `;

      const result = jsEngine.parseData(errorCode, '{}');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot read');
    });

    it('应该处理JSON解析错误', () => {
      const code = `
        function parse(input) {
          return JSON.parse(input);
        }
      `;

      const result = jsEngine.parseData(code, 'invalid json');
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON');
    });

    it('应该处理缺少parse函数的情况', () => {
      const codeWithoutParse = `
        function notParse(input) {
          return input;
        }
      `;

      const result = jsEngine.parseData(codeWithoutParse, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('must define a "parse" function');
    });

    it('应该处理返回非函数的情况', () => {
      const invalidCode = `
        const parse = 'not a function';
      `;

      const result = jsEngine.parseData(invalidCode, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('must export a function');
    });
  });

  describe('6. 复杂数据解析测试', () => {
    it('应该解析CSV格式数据', () => {
      const csvParserCode = `
        function parse(input) {
          const lines = input.trim().split('\\n');
          const headers = lines[0].split(',');
          const rows = lines.slice(1);
          
          return rows.map(row => {
            const values = row.split(',');
            const obj = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index] ? values[index].trim() : null;
            });
            return obj;
          });
        }
      `;

      const csvData = `name,age,city
John,25,New York
Jane,30,Los Angeles
Bob,35,Chicago`;

      const result = jsEngine.parseData(csvParserCode, csvData);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toEqual({ name: 'John', age: '25', city: 'New York' });
    });

    it('应该解析传感器数据格式', () => {
      const sensorParserCode = `
        function parse(input) {
          // 假设输入格式为: "SENSOR:temp=25.5,hum=60.2,press=1013.25"
          const match = input.match(/SENSOR:(.+)/);
          if (!match) return null;
          
          const dataStr = match[1];
          const pairs = dataStr.split(',');
          const result = { timestamp: Date.now() };
          
          pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            result[key.trim()] = parseFloat(value);
          });
          
          return result;
        }
      `;

      const sensorData = 'SENSOR:temp=25.5,hum=60.2,press=1013.25';
      const result = jsEngine.parseData(sensorParserCode, sensorData);

      expect(result.success).toBe(true);
      expect(result.data.temp).toBe(25.5);
      expect(result.data.hum).toBe(60.2);
      expect(result.data.press).toBe(1013.25);
      expect(result.data.timestamp).toBeTypeOf('number');
    });

    it('应该处理十六进制数据解析', () => {
      const hexParserCode = `
        function parse(input) {
          // 假设输入为十六进制字符串: "FF01FE02FD03"
          const bytes = [];
          for (let i = 0; i < input.length; i += 2) {
            bytes.push(parseInt(input.substr(i, 2), 16));
          }
          
          return {
            rawBytes: bytes,
            temperature: (bytes[1] << 8 | bytes[0]) / 100, // 小端序温度
            humidity: (bytes[3] << 8 | bytes[2]) / 100,    // 小端序湿度
            checksum: bytes[bytes.length - 1]
          };
        }
      `;

      const hexData = '9C070C19FF'; // 温度19.96°C, 湿度65.00%, 校验和255
      const result = jsEngine.parseData(hexParserCode, hexData);

      expect(result.success).toBe(true);
      expect(result.data.rawBytes).toEqual([156, 7, 12, 25, 255]);
      expect(result.data.temperature).toBeCloseTo(19.56);
      expect(result.data.humidity).toBeCloseTo(64.12);
      expect(result.data.checksum).toBe(255);
    });
  });

  describe('7. 沙箱环境功能测试', () => {
    it('应该提供安全的Math功能', () => {
      const mathCode = `
        function parse(input) {
          const value = parseFloat(input);
          return {
            sqrt: Math.sqrt(value),
            sin: Math.sin(value),
            cos: Math.cos(value),
            random: Math.random()
          };
        }
      `;

      const result = jsEngine.parseData(mathCode, '16');
      expect(result.success).toBe(true);
      expect(result.data.sqrt).toBe(4);
      expect(result.data.sin).toBeCloseTo(Math.sin(16));
      expect(result.data.cos).toBeCloseTo(Math.cos(16));
      expect(result.data.random).toBeGreaterThanOrEqual(0);
      expect(result.data.random).toBeLessThan(1);
    });

    it('应该提供安全的JSON功能', () => {
      const jsonCode = `
        function parse(input) {
          const obj = JSON.parse(input);
          return {
            stringified: JSON.stringify(obj),
            keys: Object.keys(obj)
          };
        }
      `;

      const result = jsEngine.parseData(jsonCode, '{"a": 1, "b": 2}');
      expect(result.success).toBe(true);
      expect(result.data.stringified).toBe('{"a":1,"b":2}');
      expect(result.data.keys).toEqual(['a', 'b']);
    });

    it('应该正确隔离全局状态', () => {
      const code1 = `
        function parse(input) {
          this.sharedValue = 'first';
          return this.sharedValue;
        }
      `;

      const code2 = `
        function parse(input) {
          return this.sharedValue || 'not found';
        }
      `;

      const result1 = jsEngine.parseData(code1, 'test');
      const result2 = jsEngine.parseData(code2, 'test');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.data).toBe('not found'); // 状态应该被隔离
    });
  });

  describe('8. 引擎生命周期管理', () => {
    it('应该正确重置引擎状态', () => {
      const code = `
        function parse(input) {
          return parseInt(input);
        }
      `;

      // 执行一些操作
      jsEngine.parseData(code, '1');
      jsEngine.parseData(code, '2');

      let stats = jsEngine.getStats();
      expect(stats.executionCount).toBe(2);

      // 重置引擎
      jsEngine.reset();

      stats = jsEngine.getStats();
      expect(stats.executionCount).toBe(0);
      expect(stats.totalTime).toBe(0);
    });

    it('应该正确销毁引擎', () => {
      const code = `
        function parse(input) {
          return input;
        }
      `;

      const result1 = jsEngine.parseData(code, 'test');
      expect(result1.success).toBe(true);

      jsEngine.destroy();

      // 销毁后应该无法继续使用（会抛出错误）
      expect(() => {
        jsEngine.parseData(code, 'test');
      }).toThrow();
    });
  });
});
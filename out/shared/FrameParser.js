"use strict";
/**
 * FrameParser - 基于Serial-Studio的FrameParser设计
 * 安全的JavaScript解析器，使用沙箱环境执行用户脚本
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameParser = void 0;
/**
 * JavaScript执行沙箱
 * 模拟Serial-Studio中VM2的安全执行环境
 */
class JavaScriptSandbox {
    context = {};
    script = '';
    compiledFunction = null;
    constructor() {
        this.initializeContext();
    }
    /**
     * 初始化沙箱上下文
     * 提供安全的全局变量和函数
     */
    initializeContext() {
        this.context = {
            // 数学函数
            Math: {
                abs: Math.abs,
                acos: Math.acos,
                asin: Math.asin,
                atan: Math.atan,
                atan2: Math.atan2,
                ceil: Math.ceil,
                cos: Math.cos,
                exp: Math.exp,
                floor: Math.floor,
                log: Math.log,
                max: Math.max,
                min: Math.min,
                pow: Math.pow,
                random: Math.random,
                round: Math.round,
                sin: Math.sin,
                sqrt: Math.sqrt,
                tan: Math.tan,
                PI: Math.PI,
                E: Math.E
            },
            // 日期和时间
            Date: Date,
            // 基本类型转换
            parseInt: parseInt,
            parseFloat: parseFloat,
            isNaN: isNaN,
            isFinite: isFinite,
            Number: Number,
            String: String,
            Boolean: Boolean,
            // 数组和对象工具
            Array: Array,
            Object: Object,
            JSON: {
                parse: JSON.parse,
                stringify: JSON.stringify
            },
            // 控制台输出（仅在调试模式下）
            console: {
                log: (...args) => console.log('[Frame Parser]', ...args),
                warn: (...args) => console.warn('[Frame Parser]', ...args),
                error: (...args) => console.error('[Frame Parser]', ...args)
            },
            // 禁止危险操作
            eval: undefined,
            Function: undefined,
            setTimeout: undefined,
            setInterval: undefined,
            fetch: undefined,
            XMLHttpRequest: undefined,
            Worker: undefined,
            importScripts: undefined,
            // 系统变量
            undefined: undefined,
            null: null,
            true: true,
            false: false,
            // 序列号（用于输出排序）
            __sequence: 0
        };
    }
    /**
     * 加载并编译JavaScript脚本
     */
    loadScript(script) {
        try {
            // 清理脚本内容
            this.script = this.sanitizeScript(script);
            // 编译脚本为函数
            const wrappedScript = this.wrapScript(this.script);
            this.compiledFunction = new Function(...Object.keys(this.context), wrappedScript);
            return true;
        }
        catch (error) {
            console.error('Script compilation failed:', error);
            this.compiledFunction = null;
            return false;
        }
    }
    /**
     * 清理和验证脚本内容
     */
    sanitizeScript(script) {
        // 移除危险的关键字和函数调用
        const dangerousPatterns = [
            /\beval\s*\(/gi,
            /\bFunction\s*\(/gi,
            /\bsetTimeout\s*\(/gi,
            /\bsetInterval\s*\(/gi,
            /\bfetch\s*\(/gi,
            /\bXMLHttpRequest\s*\(/gi,
            /\bWorker\s*\(/gi,
            /\bimportScripts\s*\(/gi,
            /\b__proto__\b/gi,
            /\bconstructor\b/gi,
            /\bprototype\b/gi
        ];
        let cleanScript = script;
        for (const pattern of dangerousPatterns) {
            cleanScript = cleanScript.replace(pattern, '/* BLOCKED */');
        }
        return cleanScript;
    }
    /**
     * 将脚本包装为安全的执行环境
     */
    wrapScript(script) {
        return `
      "use strict";
      try {
        // 用户脚本内容
        ${script}
        
        // 如果没有parse函数，提供默认实现
        if (typeof parse !== 'function') {
          // 默认解析器：逗号分隔的数值
          function parse(frame) {
            if (typeof frame === 'string') {
              return frame.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
            return [];
          }
        }
        
        // 返回parse函数用于外部调用
        return parse;
      } catch (error) {
        console.error('Script execution error:', error);
        return function() { return []; };
      }
    `;
    }
    /**
     * 执行脚本解析数据
     */
    parse(frameData) {
        if (!this.compiledFunction) {
            console.warn('No script loaded, using default parser');
            return this.defaultParse(frameData);
        }
        try {
            // 更新序列号
            this.context.__sequence++;
            // 执行编译后的函数
            const parseFunction = this.compiledFunction.apply(null, Object.values(this.context));
            // 转换数据格式
            let inputData;
            if (frameData instanceof Uint8Array) {
                inputData = new TextDecoder().decode(frameData);
            }
            else {
                inputData = frameData;
            }
            // 调用parse函数
            const result = parseFunction(inputData);
            // 验证结果类型
            if (Array.isArray(result)) {
                return result;
            }
            else if (result !== null && result !== undefined) {
                return [result];
            }
            else {
                return [];
            }
        }
        catch (error) {
            console.error('Script execution failed:', error);
            return this.defaultParse(frameData);
        }
    }
    /**
     * 默认的数据解析器
     * 当没有用户脚本时使用
     */
    defaultParse(frameData) {
        try {
            let dataString;
            if (frameData instanceof Uint8Array) {
                dataString = new TextDecoder().decode(frameData);
            }
            else {
                dataString = frameData;
            }
            // 逗号分隔的数值解析
            return dataString
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .map(s => {
                const num = parseFloat(s);
                return isNaN(num) ? s : num;
            });
        }
        catch (error) {
            console.error('Default parsing failed:', error);
            return [];
        }
    }
    /**
     * 验证脚本语法
     */
    validateSyntax(script) {
        try {
            const cleanScript = this.sanitizeScript(script);
            const wrappedScript = this.wrapScript(cleanScript);
            new Function(wrappedScript);
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown syntax error'
            };
        }
    }
    /**
     * 获取当前脚本内容
     */
    getScript() {
        return this.script;
    }
    /**
     * 检查是否已加载脚本
     */
    hasScript() {
        return this.compiledFunction !== null;
    }
    /**
     * 清空已加载的脚本
     */
    clearScript() {
        this.script = '';
        this.compiledFunction = null;
        this.context.__sequence = 0;
    }
}
/**
 * 帧解析器主类
 * 模拟Serial-Studio的FrameParser类
 */
class FrameParser {
    sandbox;
    isEnabled = true;
    performanceMetrics = {
        totalExecutions: 0,
        totalTime: 0,
        averageTime: 0,
        lastExecutionTime: 0
    };
    constructor() {
        this.sandbox = new JavaScriptSandbox();
    }
    /**
     * 加载JavaScript解析脚本
     */
    loadScript(script) {
        if (!script || script.trim().length === 0) {
            this.sandbox.clearScript();
            return true;
        }
        return this.sandbox.loadScript(script);
    }
    /**
     * 解析帧数据
     */
    parse(frameData) {
        if (!this.isEnabled) {
            return [];
        }
        const startTime = performance.now();
        try {
            const result = this.sandbox.parse(frameData);
            // 更新性能指标
            const executionTime = performance.now() - startTime;
            this.updatePerformanceMetrics(executionTime);
            return result;
        }
        catch (error) {
            console.error('Frame parsing failed:', error);
            return [];
        }
    }
    /**
     * 批量解析多个帧
     */
    parseMultiple(frames) {
        return frames.map(frame => this.parse(frame));
    }
    /**
     * 验证脚本语法是否正确
     */
    validateSyntax(script) {
        return this.sandbox.validateSyntax(script);
    }
    /**
     * 启用或禁用解析器
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    /**
     * 检查解析器是否启用
     */
    isParserEnabled() {
        return this.isEnabled;
    }
    /**
     * 获取当前加载的脚本
     */
    getScript() {
        return this.sandbox.getScript();
    }
    /**
     * 检查是否已加载脚本
     */
    hasScript() {
        return this.sandbox.hasScript();
    }
    /**
     * 清空解析器
     */
    clear() {
        this.sandbox.clearScript();
        this.resetPerformanceMetrics();
    }
    /**
     * 更新性能指标
     */
    updatePerformanceMetrics(executionTime) {
        this.performanceMetrics.totalExecutions++;
        this.performanceMetrics.totalTime += executionTime;
        this.performanceMetrics.lastExecutionTime = executionTime;
        this.performanceMetrics.averageTime =
            this.performanceMetrics.totalTime / this.performanceMetrics.totalExecutions;
    }
    /**
     * 重置性能指标
     */
    resetPerformanceMetrics() {
        this.performanceMetrics = {
            totalExecutions: 0,
            totalTime: 0,
            averageTime: 0,
            lastExecutionTime: 0
        };
    }
    /**
     * 获取性能统计信息
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    /**
     * 创建示例脚本（用于教学和测试）
     */
    static createExampleScript() {
        return `
// Serial-Studio Frame Parser Example
// This function will be called for each received frame

function parse(frame) {
  // Convert frame to string if it's binary data
  var data = frame.toString();
  
  // Remove whitespace
  data = data.trim();
  
  // Skip empty frames
  if (data.length === 0) {
    return [];
  }
  
  // Parse comma-separated values
  var values = data.split(',');
  var result = [];
  
  for (var i = 0; i < values.length; i++) {
    var value = values[i].trim();
    
    // Try to convert to number
    var num = parseFloat(value);
    if (!isNaN(num)) {
      result.push(num);
    } else {
      result.push(value);
    }
  }
  
  return result;
}
    `.trim();
    }
    /**
     * 创建高级示例脚本（JSON解析）
     */
    static createJsonExampleScript() {
        return `
// JSON Frame Parser Example
// Parse JSON formatted data frames

function parse(frame) {
  try {
    var data = frame.toString().trim();
    
    // Try to parse as JSON
    var json = JSON.parse(data);
    
    // Extract values from JSON object
    var result = [];
    
    if (typeof json === 'object' && json !== null) {
      // Extract all numeric values from the object
      for (var key in json) {
        if (json.hasOwnProperty(key)) {
          var value = json[key];
          if (typeof value === 'number') {
            result.push(value);
          } else if (typeof value === 'string') {
            var num = parseFloat(value);
            if (!isNaN(num)) {
              result.push(num);
            }
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.warn('JSON parsing failed:', error);
    return [];
  }
}
    `.trim();
    }
}
exports.FrameParser = FrameParser;
exports.default = FrameParser;
//# sourceMappingURL=FrameParser.js.map
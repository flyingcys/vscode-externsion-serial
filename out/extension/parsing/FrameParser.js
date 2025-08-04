"use strict";
/**
 * FrameParser implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's JSON/FrameParser.cpp design with VM2 security
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameParser = void 0;
const vm2_1 = require("vm2");
const events_1 = require("events");
/**
 * JavaScript帧解析器类
 * 使用VM2提供安全的JavaScript执行环境
 * 基于Serial-Studio的JSON::FrameParser设计
 */
class FrameParser extends events_1.EventEmitter {
    vm = null;
    parseFunction = null;
    config;
    currentScript = '';
    isModified = false;
    // 默认的解析函数代码
    static DEFAULT_SCRIPT = `
/**
 * 使用逗号分隔符将数据帧分割为元素数组
 *
 * 使用此函数将字符串（如"value1,value2,value3"）分解为
 * 单独的片段，然后可以在项目中显示或处理这些片段
 *
 * @param[in]  frame   包含数据帧的字符串
 *                     示例："value1,value2,value3"
 *
 * @return     包含分割元素的字符串数组
 *             示例：["value1", "value2", "value3"]
 *
 * @note 如果需要，可以在此函数外部声明全局变量
 *       用于存储设置或在调用之间保持状态
 */
function parse(frame) {
    return frame.split(',');
}
`;
    constructor(config = {}) {
        super();
        this.config = {
            timeout: 5000,
            memoryLimit: 128 * 1024 * 1024,
            enableConsole: true,
            ...config
        };
        // 初始化VM2安全沙箱
        this.initializeVM();
        // 加载默认脚本
        this.loadScript(FrameParser.DEFAULT_SCRIPT);
    }
    /**
     * 初始化VM2虚拟机
     */
    initializeVM() {
        const sandbox = {
            console: this.config.enableConsole ? {
                log: (...args) => this.emit('console', 'log', args),
                warn: (...args) => this.emit('console', 'warn', args),
                error: (...args) => this.emit('console', 'error', args),
                info: (...args) => this.emit('console', 'info', args)
            } : undefined,
            // 提供一些安全的全局函数
            parseInt: parseInt,
            parseFloat: parseFloat,
            isNaN: isNaN,
            isFinite: isFinite,
            Math: Math,
            String: String,
            Number: Number,
            Boolean: Boolean,
            Array: Array,
            Object: Object,
            JSON: JSON,
            Date: Date,
            RegExp: RegExp
        };
        this.vm = new vm2_1.VM({
            timeout: this.config.timeout,
            sandbox,
            eval: false,
            wasm: false,
            fixAsync: true,
            allowAsync: false // 禁用异步函数
        });
    }
    /**
     * 加载并验证JavaScript解析脚本
     * @param script JavaScript代码
     * @returns 是否加载成功
     */
    loadScript(script) {
        try {
            // 清理之前的状态
            this.parseFunction = null;
            this.currentScript = script;
            this.isModified = true;
            // 在VM中执行脚本
            this.vm.run(script);
            // 验证parse函数是否存在且可调用
            const parseFunc = this.vm.run('typeof parse === "function" ? parse : null');
            if (!parseFunc) {
                this.emit('error', new Error('parse函数未定义或不可调用'));
                return false;
            }
            // 验证parse函数签名
            if (!this.validateParseFunction(script)) {
                return false;
            }
            // 创建包装函数以处理异常
            this.parseFunction = (frame) => {
                try {
                    const startTime = Date.now();
                    const result = this.vm.run(`parse(${JSON.stringify(frame)})`);
                    const executionTime = Date.now() - startTime;
                    // 验证返回值是否为数组
                    if (!Array.isArray(result)) {
                        throw new Error('parse函数必须返回一个数组');
                    }
                    // 确保所有元素都是字符串
                    const stringResult = result.map(item => String(item));
                    this.emit('parsed', {
                        datasets: stringResult,
                        success: true,
                        executionTime
                    });
                    return stringResult;
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.emit('error', new Error(`解析错误: ${errorMessage}`));
                    throw error;
                }
            };
            this.isModified = false;
            this.emit('scriptLoaded', script);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('error', new Error(`脚本加载错误: ${errorMessage}`));
            return false;
        }
    }
    /**
     * 验证parse函数的声明格式
     * @param script 脚本内容
     * @returns 是否有效
     */
    validateParseFunction(script) {
        // 使用正则表达式检查parse函数声明
        const functionRegex = /\bfunction\s+parse\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*))?\s*\)/;
        const match = functionRegex.exec(script);
        if (!match) {
            this.emit('error', new Error('未找到有效的parse函数声明'));
            return false;
        }
        const firstArg = match[1];
        const secondArg = match[3];
        // 检查第一个参数是否为空
        if (!firstArg) {
            this.emit('error', new Error('parse函数缺少参数'));
            return false;
        }
        // 警告旧格式（两个参数）
        if (secondArg) {
            this.emit('warning', new Error(`检测到旧版本的parse函数格式，包含两个参数('${firstArg}', '${secondArg}')。` +
                `请更新为新格式，只接受帧数据作为参数。`));
            return false;
        }
        return true;
    }
    /**
     * 解析UTF-8文本数据帧
     * @param frame 解码后的UTF-8字符串帧
     * @returns 解析结果
     */
    parse(frame) {
        const startTime = Date.now();
        try {
            if (!this.parseFunction) {
                throw new Error('未加载有效的解析函数');
            }
            const datasets = this.parseFunction(frame);
            const executionTime = Date.now() - startTime;
            return {
                datasets,
                success: true,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                datasets: [],
                success: false,
                error: errorMessage,
                executionTime
            };
        }
    }
    /**
     * 解析二进制数据帧
     * @param frame 二进制帧数据
     * @returns 解析结果
     */
    parseBinary(frame) {
        const startTime = Date.now();
        try {
            if (!this.parseFunction) {
                throw new Error('未加载有效的解析函数');
            }
            // 将Buffer转换为数组传递给JavaScript
            const dataArray = Array.from(frame);
            const datasets = this.parseFunction(dataArray);
            const executionTime = Date.now() - startTime;
            return {
                datasets,
                success: true,
                executionTime
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                datasets: [],
                success: false,
                error: errorMessage,
                executionTime
            };
        }
    }
    /**
     * 验证脚本语法
     * @param script 要验证的脚本
     * @returns 验证结果
     */
    validateSyntax(script) {
        try {
            // 创建临时VM进行语法检查
            const testVM = new vm2_1.VM({
                timeout: 1000,
                sandbox: {},
                eval: false,
                wasm: false
            });
            testVM.run(script);
            // 检查parse函数是否存在
            const hasParseFunction = testVM.run('typeof parse === "function"');
            if (!hasParseFunction) {
                return {
                    valid: false,
                    error: 'parse函数未定义'
                };
            }
            return { valid: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                valid: false,
                error: errorMessage
            };
        }
    }
    /**
     * 获取当前脚本内容
     * @returns 当前脚本
     */
    getText() {
        return this.currentScript;
    }
    /**
     * 检查脚本是否已修改
     * @returns 是否已修改
     */
    getIsModified() {
        return this.isModified;
    }
    /**
     * 重置为默认脚本
     */
    reset() {
        this.loadScript(FrameParser.DEFAULT_SCRIPT);
    }
    /**
     * 获取默认脚本内容
     * @returns 默认脚本
     */
    static getDefaultScript() {
        return FrameParser.DEFAULT_SCRIPT;
    }
    /**
     * 设置解析器配置
     * @param config 新配置
     */
    setConfig(config) {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...config };
        // 如果关键配置改变，重新初始化VM
        if (oldConfig.timeout !== this.config.timeout ||
            oldConfig.memoryLimit !== this.config.memoryLimit ||
            oldConfig.enableConsole !== this.config.enableConsole) {
            this.initializeVM();
            // 重新加载当前脚本
            if (this.currentScript) {
                this.loadScript(this.currentScript);
            }
        }
    }
    /**
     * 获取当前配置
     * @returns 配置副本
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取VM统计信息
     * @returns VM使用统计
     */
    getStats() {
        return {
            timeout: this.config.timeout,
            memoryLimit: this.config.memoryLimit,
            isReady: this.parseFunction !== null
        };
    }
    /**
     * 创建脚本模板
     * @param templateType 模板类型
     * @returns 脚本模板
     */
    static createTemplate(templateType = 'csv') {
        switch (templateType) {
            case 'csv':
                return `
/**
 * CSV格式数据解析器
 * 解析逗号分隔的数值
 */
function parse(frame) {
    return frame.split(',').map(item => item.trim());
}`;
            case 'json':
                return `
/**
 * JSON格式数据解析器
 * 解析JSON对象并提取数值
 */
function parse(frame) {
    try {
        const data = JSON.parse(frame);
        return Object.values(data).map(value => String(value));
    } catch (error) {
        console.error('JSON解析错误:', error);
        return [];
    }
}`;
            case 'custom':
                return `
/**
 * 自定义数据解析器
 * 根据您的数据格式自定义解析逻辑
 */
function parse(frame) {
    // 在此处添加您的解析逻辑
    // frame 参数包含从设备接收的原始数据
    
    // 示例：处理固定宽度的数据
    const result = [];
    for (let i = 0; i < frame.length; i += 4) {
        result.push(frame.substr(i, 4));
    }
    
    return result;
}`;
            default:
                return FrameParser.DEFAULT_SCRIPT;
        }
    }
    datasetConfig = [];
    /**
     * 更新解析器配置（兼容测试接口）
     * @param config 配置对象
     */
    updateConfig(config) {
        if (config.datasets) {
            this.datasetConfig = config.datasets;
            this.emit('configUpdated', config);
        }
        if (config.timeout) {
            this.setConfig({ timeout: config.timeout });
        }
        if (config.memoryLimit) {
            this.setConfig({ memoryLimit: config.memoryLimit });
        }
        if (config.enableConsole !== undefined) {
            this.setConfig({ enableConsole: config.enableConsole });
        }
    }
    /**
     * 创建数据集（兼容测试接口）
     * @param frame 帧数据
     * @returns 数据集数组
     */
    async createDatasets(frame) {
        try {
            const parseResult = this.parse(frame.data || frame);
            if (!parseResult.success) {
                throw new Error(parseResult.error || 'Parse failed');
            }
            const datasets = parseResult.datasets.map((value, index) => {
                const config = this.datasetConfig[index] || {};
                return {
                    title: config.title || `Dataset ${index + 1}`,
                    value: parseFloat(value) || 0,
                    unit: config.unit || '',
                    index: index,
                    timestamp: Date.now()
                };
            });
            return datasets;
        }
        catch (error) {
            console.error('创建数据集失败:', error);
            throw error;
        }
    }
    /**
     * 检查解析器是否就绪
     * @returns 是否就绪
     */
    isReady() {
        return this.parseFunction !== null;
    }
    /**
     * 销毁解析器并清理资源
     */
    destroy() {
        this.parseFunction = null;
        this.currentScript = '';
        this.removeAllListeners();
    }
}
exports.FrameParser = FrameParser;
//# sourceMappingURL=FrameParser.js.map
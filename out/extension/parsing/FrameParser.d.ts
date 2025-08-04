/**
 * FrameParser implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's JSON/FrameParser.cpp design with VM2 security
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 解析结果接口
 */
export interface ParseResult {
    datasets: string[];
    success: boolean;
    error?: string;
    executionTime: number;
}
/**
 * JavaScript解析引擎配置
 */
export interface ParserConfig {
    timeout: number;
    memoryLimit: number;
    enableConsole: boolean;
}
/**
 * JavaScript帧解析器类
 * 使用VM2提供安全的JavaScript执行环境
 * 基于Serial-Studio的JSON::FrameParser设计
 */
export declare class FrameParser extends EventEmitter {
    private vm;
    private parseFunction;
    private config;
    private currentScript;
    private isModified;
    private static readonly DEFAULT_SCRIPT;
    constructor(config?: Partial<ParserConfig>);
    /**
     * 初始化VM2虚拟机
     */
    private initializeVM;
    /**
     * 加载并验证JavaScript解析脚本
     * @param script JavaScript代码
     * @returns 是否加载成功
     */
    loadScript(script: string): boolean;
    /**
     * 验证parse函数的声明格式
     * @param script 脚本内容
     * @returns 是否有效
     */
    private validateParseFunction;
    /**
     * 解析UTF-8文本数据帧
     * @param frame 解码后的UTF-8字符串帧
     * @returns 解析结果
     */
    parse(frame: string): ParseResult;
    /**
     * 解析二进制数据帧
     * @param frame 二进制帧数据
     * @returns 解析结果
     */
    parseBinary(frame: Buffer): ParseResult;
    /**
     * 验证脚本语法
     * @param script 要验证的脚本
     * @returns 验证结果
     */
    validateSyntax(script: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * 获取当前脚本内容
     * @returns 当前脚本
     */
    getText(): string;
    /**
     * 检查脚本是否已修改
     * @returns 是否已修改
     */
    getIsModified(): boolean;
    /**
     * 重置为默认脚本
     */
    reset(): void;
    /**
     * 获取默认脚本内容
     * @returns 默认脚本
     */
    static getDefaultScript(): string;
    /**
     * 设置解析器配置
     * @param config 新配置
     */
    setConfig(config: Partial<ParserConfig>): void;
    /**
     * 获取当前配置
     * @returns 配置副本
     */
    getConfig(): ParserConfig;
    /**
     * 获取VM统计信息
     * @returns VM使用统计
     */
    getStats(): {
        timeout: number;
        memoryLimit: number;
        isReady: boolean;
    };
    /**
     * 创建脚本模板
     * @param templateType 模板类型
     * @returns 脚本模板
     */
    static createTemplate(templateType?: 'csv' | 'json' | 'custom'): string;
    private datasetConfig;
    /**
     * 更新解析器配置（兼容测试接口）
     * @param config 配置对象
     */
    updateConfig(config: any): void;
    /**
     * 创建数据集（兼容测试接口）
     * @param frame 帧数据
     * @returns 数据集数组
     */
    createDatasets(frame: any): Promise<any[]>;
    /**
     * 检查解析器是否就绪
     * @returns 是否就绪
     */
    isReady(): boolean;
    /**
     * 销毁解析器并清理资源
     */
    destroy(): void;
}
//# sourceMappingURL=FrameParser.d.ts.map
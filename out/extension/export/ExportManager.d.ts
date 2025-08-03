/**
 * 数据导出管理器
 * 基于Serial Studio的CSV导出架构设计
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { ExportManager, ExportConfig, ExportResult, ExportProgress, ExportFormat } from './types';
/**
 * 导出管理器实现
 * 负责协调各种格式的导出器和数据处理
 */
export declare class ExportManagerImpl extends EventEmitter implements ExportManager {
    private formatRegistry;
    private activeExports;
    private progressCallbacks;
    constructor();
    /**
     * 注册默认的导出器
     */
    private registerDefaultExporters;
    /**
     * 执行数据导出
     * @param config 导出配置
     * @returns 导出结果
     */
    exportData(config: ExportConfig): Promise<ExportResult>;
    /**
     * 获取支持的导出格式
     * @returns 导出格式列表
     */
    getSupportedFormats(): ExportFormat[];
    /**
     * 注册进度回调
     * @param callback 进度回调函数
     */
    onProgress(callback: (progress: ExportProgress) => void): void;
    /**
     * 移除进度回调
     * @param callback 进度回调函数
     */
    offProgress(callback: (progress: ExportProgress) => void): void;
    /**
     * 取消导出
     * @param taskId 任务ID
     */
    cancelExport(taskId: string): Promise<void>;
    /**
     * 准备导出数据
     * @param config 导出配置
     * @returns 导出数据
     */
    private prepareExportData;
    /**
     * 获取数据提供者
     * @param sourceType 数据源类型
     * @returns 数据提供者
     */
    private getDataProvider;
    /**
     * 处理数据（过滤和转换）
     * @param data 原始数据
     * @param config 导出配置
     * @param taskId 任务ID
     * @returns 处理后的数据
     */
    private processData;
    /**
     * 收集异步记录为数组
     * @param asyncRecords 异步记录迭代器
     * @returns 记录数组
     */
    private collectAsyncRecords;
    /**
     * 构建过滤条件
     * @param filters 过滤配置
     * @returns 过滤条件数组
     */
    private buildFilterConditions;
    /**
     * 构建数据转换配置
     * @param processing 处理配置
     * @returns 转换配置数组
     */
    private buildTransformations;
    /**
     * 获取导出器
     * @param formatType 格式类型
     * @returns 导出器实例
     */
    private getExporter;
    /**
     * 报告进度
     * @param taskId 任务ID
     * @param stage 阶段
     * @param percentage 百分比
     * @param processedRecords 已处理记录数
     * @param totalRecords 总记录数
     */
    private reportProgress;
    /**
     * 计算预估剩余时间
     * @param percentage 当前进度百分比
     * @param startTime 开始时间
     * @returns 预估剩余时间（毫秒）
     */
    private calculateETA;
    /**
     * 生成任务ID
     * @returns 唯一任务ID
     */
    private generateTaskId;
    /**
     * 验证导出配置
     * @param config 导出配置
     */
    private validateConfig;
    /**
     * 检查任务是否被取消
     * @param taskId 任务ID
     * @returns 是否被取消
     */
    private isTaskCancelled;
    /**
     * 确保目录存在
     * @param filePath 文件路径
     */
    private ensureDirectoryExists;
    /**
     * 获取格式名称
     * @param type 格式类型
     * @returns 格式名称
     */
    private getFormatName;
    /**
     * 获取格式扩展名
     * @param type 格式类型
     * @returns 扩展名数组
     */
    private getFormatExtensions;
    /**
     * 获取格式描述
     * @param type 格式类型
     * @returns 格式描述
     */
    private getFormatDescription;
    /**
     * 获取格式默认选项
     * @param type 格式类型
     * @returns 默认选项
     */
    private getFormatDefaultOptions;
}
/**
 * 获取导出管理器单例
 * @returns 导出管理器实例
 */
export declare function getExportManager(): ExportManagerImpl;
//# sourceMappingURL=ExportManager.d.ts.map
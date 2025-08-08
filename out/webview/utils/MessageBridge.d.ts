/**
 * MessageBridge utility for communication between Extension and Webview
 * 基于Serial Studio的消息通信机制
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { Message, MessageType } from '../../shared/types';
/**
 * 消息桥梁类
 * 处理Extension和Webview之间的双向通信
 */
export declare class MessageBridge extends EventEmitter {
    private vscode;
    private messageId;
    private pendingRequests;
    private isOnline;
    private messageQueue;
    private messageStats;
    private messageListener;
    constructor(vscode: any);
    /**
     * 设置消息监听器
     */
    private setupMessageListener;
    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    handleMessage(message: Message): void;
    /**
     * 发送消息（测试兼容方法）
     * @param message 要发送的消息
     */
    send(message: any): void;
    /**
     * 发送消息到Extension
     * @param message 要发送的消息
     */
    sendMessage(message: Omit<Message, 'timestamp'>): void;
    /**
     * 内部发送消息方法
     * @param message 完整消息
     */
    private _sendMessage;
    /**
     * 发送请求并等待响应（测试兼容方法）
     * @param message 请求消息
     * @param timeout 超时时间（毫秒）
     * @returns Promise响应
     */
    request<T = any>(message: any, timeout?: number): Promise<T>;
    /**
     * 发送请求并等待响应
     * @param type 消息类型
     * @param payload 消息载荷
     * @param timeout 超时时间（毫秒）
     * @returns Promise响应
     */
    sendRequest<T = any>(type: MessageType, payload?: any, timeout?: number): Promise<T>;
    /**
     * 生成唯一的消息ID
     * @returns 消息ID
     */
    private generateMessageId;
    /**
     * 连接设备
     * @param config 连接配置
     */
    connectDevice(config: any): Promise<void>;
    /**
     * 断开设备连接
     */
    disconnectDevice(): Promise<void>;
    /**
     * 获取连接状态
     */
    getConnectionStatus(): Promise<any>;
    /**
     * 加载项目
     * @param projectPath 项目路径
     */
    loadProject(projectPath: string): Promise<any>;
    /**
     * 保存项目
     * @param projectConfig 项目配置
     * @param projectPath 保存路径
     */
    saveProject(projectConfig: any, projectPath?: string): Promise<void>;
    /**
     * 更新配置
     * @param config 新配置
     */
    updateConfig(config: any): Promise<void>;
    /**
     * 获取配置
     */
    getConfig(): Promise<any>;
    /**
     * 导出数据
     * @param exportConfig 导出配置
     */
    exportData(exportConfig: any): Promise<any>;
    /**
     * 监听数据帧
     * @param callback 回调函数
     */
    onFrameData(callback: (data: any) => void): void;
    /**
     * 监听原始数据
     * @param callback 回调函数
     */
    onRawData(callback: (data: any) => void): void;
    /**
     * 监听连接状态变化
     * @param callback 回调函数
     */
    onConnectionStatus(callback: (status: any) => void): void;
    /**
     * 监听项目加载完成
     * @param callback 回调函数
     */
    onProjectLoaded(callback: (project: any) => void): void;
    /**
     * 监听导出完成
     * @param callback 回调函数
     */
    onExportComplete(callback: (result: any) => void): void;
    /**
     * 监听错误
     * @param callback 回调函数
     */
    onError(callback: (error: any) => void): void;
    /**
     * 监听警告
     * @param callback 回调函数
     */
    onWarning(callback: (warning: any) => void): void;
    /**
     * 监听信息
     * @param callback 回调函数
     */
    onInfo(callback: (info: any) => void): void;
    /**
     * 发送日志消息
     * @param level 日志级别
     * @param message 消息内容
     * @param data 附加数据
     */
    log(level: 'error' | 'warning' | 'info', message: string, data?: any): void;
    /**
     * 发送错误消息
     * @param error 错误对象或消息
     * @param data 附加数据
     */
    logError(error: Error | string, data?: any): void;
    /**
     * 发送警告消息
     * @param message 警告消息
     * @param data 附加数据
     */
    logWarning(message: string, data?: any): void;
    /**
     * 发送信息消息
     * @param message 信息消息
     * @param data 附加数据
     */
    logInfo(message: string, data?: any): void;
    /**
     * 发送性能指标
     * @param metrics 性能指标
     */
    sendPerformanceMetrics(metrics: any): void;
    /**
     * 发送用户操作统计
     * @param action 操作名称
     * @param data 操作数据
     */
    trackUserAction(action: string, data?: any): void;
    /**
     * 发送批量消息
     * @param messages 消息数组
     */
    sendBatch(messages: any[]): void;
    /**
     * 取消待处理的请求
     * @param requestId 请求ID
     */
    cancelRequest(requestId: string): void;
    /**
     * 设置在线状态
     * @param online 是否在线
     */
    setOnline(online: boolean): void;
    /**
     * 清除消息队列
     */
    clearQueue(): void;
    /**
     * 销毁消息桥梁
     */
    destroy(): void;
    /**
     * 清理所有待处理的请求（向后兼容）
     */
    cleanup(): void;
    /**
     * 获取桥梁统计信息
     */
    getStats(): {
        pendingRequests: number;
        totalMessages: number;
        messagesSent: number;
        messagesReceived: number;
        averageLatency: number;
    };
}
//# sourceMappingURL=MessageBridge.d.ts.map
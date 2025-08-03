"use strict";
/**
 * MessageBridge utility for communication between Extension and Webview
 * 基于Serial Studio的消息通信机制
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBridge = void 0;
const events_1 = require("events");
const types_1 = require("../../shared/types");
/**
 * 消息桥梁类
 * 处理Extension和Webview之间的双向通信
 */
class MessageBridge extends events_1.EventEmitter {
    vscode;
    messageId = 0;
    pendingRequests = new Map();
    constructor(vscode) {
        super();
        this.vscode = vscode;
        this.setupMessageListener();
    }
    /**
     * 设置消息监听器
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            const message = event.data;
            this.handleMessage(message);
        });
    }
    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    handleMessage(message) {
        // 如果是响应消息，处理待处理的请求
        if (message.id && this.pendingRequests.has(message.id)) {
            const request = this.pendingRequests.get(message.id);
            clearTimeout(request.timeout);
            this.pendingRequests.delete(message.id);
            if (message.type === types_1.MessageType.ERROR) {
                request.reject(new Error(message.payload?.message || '未知错误'));
            }
            else {
                request.resolve(message.payload);
            }
            return;
        }
        // 触发对应的事件
        this.emit(message.type, message.payload);
        this.emit('message', message);
    }
    /**
     * 发送消息到Extension
     * @param message 要发送的消息
     */
    sendMessage(message) {
        const fullMessage = {
            ...message,
            timestamp: Date.now()
        };
        try {
            this.vscode.postMessage(fullMessage);
        }
        catch (error) {
            console.error('发送消息失败:', error);
            this.emit('error', error);
        }
    }
    /**
     * 发送请求并等待响应
     * @param type 消息类型
     * @param payload 消息载荷
     * @param timeout 超时时间（毫秒）
     * @returns Promise响应
     */
    sendRequest(type, payload, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const id = this.generateMessageId();
            // 设置超时
            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`请求超时: ${type}`));
            }, timeout);
            // 存储待处理的请求
            this.pendingRequests.set(id, { resolve, reject, timeout: timeoutHandle });
            // 发送消息
            this.sendMessage({ type, payload, id });
        });
    }
    /**
     * 生成唯一的消息ID
     * @returns 消息ID
     */
    generateMessageId() {
        return `msg_${++this.messageId}_${Date.now()}`;
    }
    // === 连接管理相关方法 ===
    /**
     * 连接设备
     * @param config 连接配置
     */
    async connectDevice(config) {
        await this.sendRequest(types_1.MessageType.CONNECT_DEVICE, config);
    }
    /**
     * 断开设备连接
     */
    async disconnectDevice() {
        await this.sendRequest(types_1.MessageType.DISCONNECT_DEVICE);
    }
    /**
     * 获取连接状态
     */
    async getConnectionStatus() {
        return await this.sendRequest(types_1.MessageType.CONNECTION_STATUS);
    }
    // === 项目管理相关方法 ===
    /**
     * 加载项目
     * @param projectPath 项目路径
     */
    async loadProject(projectPath) {
        return await this.sendRequest(types_1.MessageType.LOAD_PROJECT, { projectPath });
    }
    /**
     * 保存项目
     * @param projectConfig 项目配置
     * @param projectPath 保存路径
     */
    async saveProject(projectConfig, projectPath) {
        await this.sendRequest(types_1.MessageType.SAVE_PROJECT, { projectConfig, projectPath });
    }
    // === 配置管理相关方法 ===
    /**
     * 更新配置
     * @param config 新配置
     */
    async updateConfig(config) {
        await this.sendRequest(types_1.MessageType.UPDATE_CONFIG, config);
    }
    /**
     * 获取配置
     */
    async getConfig() {
        return await this.sendRequest(types_1.MessageType.GET_CONFIG);
    }
    // === 数据导出相关方法 ===
    /**
     * 导出数据
     * @param exportConfig 导出配置
     */
    async exportData(exportConfig) {
        return await this.sendRequest(types_1.MessageType.EXPORT_DATA, exportConfig);
    }
    // === 便捷方法 ===
    /**
     * 监听数据帧
     * @param callback 回调函数
     */
    onFrameData(callback) {
        this.on(types_1.MessageType.FRAME_DATA, callback);
    }
    /**
     * 监听原始数据
     * @param callback 回调函数
     */
    onRawData(callback) {
        this.on(types_1.MessageType.RAW_DATA, callback);
    }
    /**
     * 监听连接状态变化
     * @param callback 回调函数
     */
    onConnectionStatus(callback) {
        this.on(types_1.MessageType.CONNECTION_STATUS, callback);
    }
    /**
     * 监听项目加载完成
     * @param callback 回调函数
     */
    onProjectLoaded(callback) {
        this.on(types_1.MessageType.PROJECT_LOADED, callback);
    }
    /**
     * 监听导出完成
     * @param callback 回调函数
     */
    onExportComplete(callback) {
        this.on(types_1.MessageType.EXPORT_COMPLETE, callback);
    }
    /**
     * 监听错误
     * @param callback 回调函数
     */
    onError(callback) {
        this.on(types_1.MessageType.ERROR, callback);
    }
    /**
     * 监听警告
     * @param callback 回调函数
     */
    onWarning(callback) {
        this.on(types_1.MessageType.WARNING, callback);
    }
    /**
     * 监听信息
     * @param callback 回调函数
     */
    onInfo(callback) {
        this.on(types_1.MessageType.INFO, callback);
    }
    // === 日志和调试方法 ===
    /**
     * 发送日志消息
     * @param level 日志级别
     * @param message 消息内容
     * @param data 附加数据
     */
    log(level, message, data) {
        const messageType = level === 'error' ? types_1.MessageType.ERROR :
            level === 'warning' ? types_1.MessageType.WARNING :
                types_1.MessageType.INFO;
        this.sendMessage({
            type: messageType,
            payload: { message, data, timestamp: Date.now() }
        });
    }
    /**
     * 发送错误消息
     * @param error 错误对象或消息
     * @param data 附加数据
     */
    logError(error, data) {
        const message = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : undefined;
        this.log('error', message, { ...data, stack });
    }
    /**
     * 发送警告消息
     * @param message 警告消息
     * @param data 附加数据
     */
    logWarning(message, data) {
        this.log('warning', message, data);
    }
    /**
     * 发送信息消息
     * @param message 信息消息
     * @param data 附加数据
     */
    logInfo(message, data) {
        this.log('info', message, data);
    }
    // === 性能监控方法 ===
    /**
     * 发送性能指标
     * @param metrics 性能指标
     */
    sendPerformanceMetrics(metrics) {
        this.sendMessage({
            type: types_1.MessageType.INFO,
            payload: {
                type: 'performance_metrics',
                metrics
            }
        });
    }
    /**
     * 发送用户操作统计
     * @param action 操作名称
     * @param data 操作数据
     */
    trackUserAction(action, data) {
        this.sendMessage({
            type: types_1.MessageType.INFO,
            payload: {
                type: 'user_action',
                action,
                data
            }
        });
    }
    // === 清理方法 ===
    /**
     * 清理所有待处理的请求
     */
    cleanup() {
        // 清理所有待处理的请求
        for (const [, request] of this.pendingRequests) {
            clearTimeout(request.timeout);
            request.reject(new Error('MessageBridge已清理'));
        }
        this.pendingRequests.clear();
        // 移除所有事件监听器
        this.removeAllListeners();
    }
    /**
     * 获取桥梁统计信息
     */
    getStats() {
        return {
            pendingRequests: this.pendingRequests.size,
            totalMessages: this.messageId
        };
    }
}
exports.MessageBridge = MessageBridge;
//# sourceMappingURL=MessageBridge.js.map
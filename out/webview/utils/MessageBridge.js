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
    isOnline = true;
    messageQueue = [];
    messageStats = {
        messagesSent: 0,
        messagesReceived: 0,
        totalLatency: 0,
        averageLatency: 0
    };
    messageListener;
    constructor(vscode) {
        super();
        this.vscode = vscode;
        this.setupMessageListener();
    }
    /**
     * 设置消息监听器
     */
    setupMessageListener() {
        this.messageListener = (event) => {
            const message = event.data;
            this.handleMessage(message);
        };
        window.addEventListener('message', this.messageListener);
    }
    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    handleMessage(message) {
        // 处理无效消息
        if (!message || !message.type) {
            return;
        }
        this.messageStats.messagesReceived++;
        // 如果是响应消息，处理待处理的请求  
        if (message.id && this.pendingRequests.has(message.id)) {
            const request = this.pendingRequests.get(message.id);
            clearTimeout(request.timeout);
            this.pendingRequests.delete(message.id);
            // 计算延迟
            const latency = message.timestamp ? Date.now() - message.timestamp : 0;
            this.messageStats.totalLatency += latency;
            this.messageStats.averageLatency = this.messageStats.totalLatency / this.messageStats.messagesReceived;
            if (message.type === types_1.MessageType.ERROR) {
                request.reject(new Error(message.data?.message || '未知错误'));
            }
            else {
                request.resolve(message);
            }
            return;
        }
        // 如果是响应消息（通过requestId标识），处理待处理的请求
        if (message.requestId && this.pendingRequests.has(message.requestId)) {
            const request = this.pendingRequests.get(message.requestId);
            clearTimeout(request.timeout);
            this.pendingRequests.delete(message.requestId);
            // 计算延迟
            const latency = message.timestamp ? Date.now() - message.timestamp : 0;
            this.messageStats.totalLatency += latency;
            this.messageStats.averageLatency = this.messageStats.totalLatency / this.messageStats.messagesReceived;
            if (message.type === types_1.MessageType.ERROR) {
                request.reject(new Error(message.data?.message || '未知错误'));
            }
            else {
                request.resolve(message);
            }
            return;
        }
        // 处理批量消息
        if (message.type === types_1.MessageType.BATCH && message.data?.messages) {
            for (const subMessage of message.data.messages) {
                this.handleMessage(subMessage);
            }
            return;
        }
        // 触发对应的事件
        this.emit(message.type, message);
        this.emit('message', message);
    }
    /**
     * 发送消息（测试兼容方法）
     * @param message 要发送的消息
     */
    send(message) {
        const fullMessage = {
            type: message.type,
            data: message.data,
            id: this.generateMessageId(),
            timestamp: Date.now()
        };
        this._sendMessage(fullMessage);
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
        this._sendMessage(fullMessage);
    }
    /**
     * 内部发送消息方法
     * @param message 完整消息
     */
    _sendMessage(message) {
        if (!this.isOnline) {
            this.messageQueue.push(message);
            return;
        }
        try {
            this.vscode.postMessage(message);
            this.messageStats.messagesSent++;
        }
        catch (error) {
            console.error('发送消息失败:', error);
            this.emit('error', error);
        }
    }
    /**
     * 发送请求并等待响应（测试兼容方法）
     * @param message 请求消息
     * @param timeout 超时时间（毫秒）
     * @returns Promise响应
     */
    request(message, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const id = this.generateMessageId();
            // 设置超时
            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error('Request timeout'));
            }, timeout);
            // 存储待处理的请求
            this.pendingRequests.set(id, { resolve, reject, timeout: timeoutHandle });
            // 发送消息
            const fullMessage = {
                type: message.type,
                data: message.data,
                id,
                timestamp: Date.now()
            };
            this._sendMessage(fullMessage);
        });
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
            this.sendMessage({ type, data: payload, id });
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
    // === 批量消息处理 ===
    /**
     * 发送批量消息
     * @param messages 消息数组
     */
    sendBatch(messages) {
        const batchMessage = {
            type: types_1.MessageType.BATCH,
            data: {
                messages: messages.map(msg => ({
                    ...msg,
                    id: this.generateMessageId(),
                    timestamp: Date.now()
                }))
            },
            id: this.generateMessageId(),
            timestamp: Date.now()
        };
        this._sendMessage(batchMessage);
    }
    /**
     * 取消待处理的请求
     * @param requestId 请求ID
     */
    cancelRequest(requestId) {
        const request = this.pendingRequests.get(requestId);
        if (request) {
            clearTimeout(request.timeout);
            this.pendingRequests.delete(requestId);
            request.reject(new Error('Request cancelled'));
        }
    }
    /**
     * 设置在线状态
     * @param online 是否在线
     */
    setOnline(online) {
        this.isOnline = online;
        if (online && this.messageQueue.length > 0) {
            // 发送队列中的消息
            const queuedMessages = [...this.messageQueue];
            this.messageQueue = [];
            for (const message of queuedMessages) {
                this._sendMessage(message);
            }
        }
    }
    /**
     * 清除消息队列
     */
    clearQueue() {
        this.messageQueue = [];
    }
    // === 清理方法 ===
    /**
     * 销毁消息桥梁
     */
    destroy() {
        // 清理所有待处理的请求
        for (const [, request] of this.pendingRequests) {
            clearTimeout(request.timeout);
            request.reject(new Error('MessageBridge destroyed'));
        }
        this.pendingRequests.clear();
        // 清除消息队列
        this.messageQueue = [];
        // 移除窗口事件监听器
        window.removeEventListener('message', this.messageListener);
        // 移除所有事件监听器
        this.removeAllListeners();
    }
    /**
     * 清理所有待处理的请求（向后兼容）
     */
    cleanup() {
        this.destroy();
    }
    /**
     * 获取桥梁统计信息
     */
    getStats() {
        return {
            pendingRequests: this.pendingRequests.size,
            totalMessages: this.messageId,
            messagesSent: this.messageStats.messagesSent,
            messagesReceived: this.messageStats.messagesReceived,
            averageLatency: this.messageStats.averageLatency
        };
    }
}
exports.MessageBridge = MessageBridge;
//# sourceMappingURL=MessageBridge.js.map
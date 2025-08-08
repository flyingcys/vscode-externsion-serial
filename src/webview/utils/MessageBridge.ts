/**
 * MessageBridge utility for communication between Extension and Webview
 * 基于Serial Studio的消息通信机制
 */

import { EventEmitter } from 'events';
import { Message, MessageType } from '../../shared/types';

/**
 * 消息桥梁类
 * 处理Extension和Webview之间的双向通信
 */
export class MessageBridge extends EventEmitter {
  private vscode: any;
  private messageId = 0;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();
  private isOnline = true;
  private messageQueue: Message[] = [];
  private messageStats = {
    messagesSent: 0,
    messagesReceived: 0,
    totalLatency: 0,
    averageLatency: 0
  };
  private messageListener!: (event: MessageEvent) => void;

  constructor(vscode: any) {
    super();
    this.vscode = vscode;
    this.setupMessageListener();
  }

  /**
   * 设置消息监听器
   */
  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent): void => {
      const message: Message = event.data;
      this.handleMessage(message);
    };
    window.addEventListener('message', this.messageListener);
  }

  /**
   * 处理接收到的消息
   * @param message 接收到的消息
   */
  handleMessage(message: Message): void {
    // 处理无效消息
    if (!message || !message.type) {
      return;
    }

    this.messageStats.messagesReceived++;
    // 如果是响应消息，处理待处理的请求  
    if (message.id && this.pendingRequests.has(message.id)) {
      const request = this.pendingRequests.get(message.id)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.id);
      
      // 计算延迟
      const latency = message.timestamp ? Date.now() - message.timestamp : 0;
      this.messageStats.totalLatency += latency;
      this.messageStats.averageLatency = this.messageStats.totalLatency / this.messageStats.messagesReceived;
      
      if (message.type === MessageType.ERROR) {
        request.reject(new Error(message.data?.message || '未知错误'));
      } else {
        request.resolve(message);
      }
      return;
    }
    
    // 如果是响应消息（通过requestId标识），处理待处理的请求
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const request = this.pendingRequests.get(message.requestId)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.requestId);
      
      // 计算延迟
      const latency = message.timestamp ? Date.now() - message.timestamp : 0;
      this.messageStats.totalLatency += latency;
      this.messageStats.averageLatency = this.messageStats.totalLatency / this.messageStats.messagesReceived;
      
      if (message.type === MessageType.ERROR) {
        request.reject(new Error(message.data?.message || '未知错误'));
      } else {
        request.resolve(message);
      }
      return;
    }

    // 处理批量消息
    if (message.type === MessageType.BATCH && message.data?.messages) {
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
  send(message: any): void {
    const fullMessage: Message = {
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
  sendMessage(message: Omit<Message, 'timestamp'>): void {
    const fullMessage: Message = {
      ...message,
      timestamp: Date.now()
    };
    
    this._sendMessage(fullMessage);
  }

  /**
   * 内部发送消息方法
   * @param message 完整消息
   */
  private _sendMessage(message: Message): void {
    if (!this.isOnline) {
      this.messageQueue.push(message);
      return;
    }

    try {
      this.vscode.postMessage(message);
      this.messageStats.messagesSent++;
    } catch (error) {
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
  request<T = any>(message: any, timeout = 5000): Promise<T> {
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
  sendRequest<T = any>(type: MessageType, payload?: any, timeout = 5000): Promise<T> {
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
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  // === 连接管理相关方法 ===

  /**
   * 连接设备
   * @param config 连接配置
   */
  async connectDevice(config: any): Promise<void> {
    await this.sendRequest(MessageType.CONNECT_DEVICE, config);
  }

  /**
   * 断开设备连接
   */
  async disconnectDevice(): Promise<void> {
    await this.sendRequest(MessageType.DISCONNECT_DEVICE);
  }

  /**
   * 获取连接状态
   */
  async getConnectionStatus(): Promise<any> {
    return await this.sendRequest(MessageType.CONNECTION_STATUS);
  }

  // === 项目管理相关方法 ===

  /**
   * 加载项目
   * @param projectPath 项目路径
   */
  async loadProject(projectPath: string): Promise<any> {
    return await this.sendRequest(MessageType.LOAD_PROJECT, { projectPath });
  }

  /**
   * 保存项目
   * @param projectConfig 项目配置
   * @param projectPath 保存路径
   */
  async saveProject(projectConfig: any, projectPath?: string): Promise<void> {
    await this.sendRequest(MessageType.SAVE_PROJECT, { projectConfig, projectPath });
  }

  // === 配置管理相关方法 ===

  /**
   * 更新配置
   * @param config 新配置
   */
  async updateConfig(config: any): Promise<void> {
    await this.sendRequest(MessageType.UPDATE_CONFIG, config);
  }

  /**
   * 获取配置
   */
  async getConfig(): Promise<any> {
    return await this.sendRequest(MessageType.GET_CONFIG);
  }

  // === 数据导出相关方法 ===

  /**
   * 导出数据
   * @param exportConfig 导出配置
   */
  async exportData(exportConfig: any): Promise<any> {
    return await this.sendRequest(MessageType.EXPORT_DATA, exportConfig);
  }

  // === 便捷方法 ===

  /**
   * 监听数据帧
   * @param callback 回调函数
   */
  onFrameData(callback: (data: any) => void): void {
    this.on(MessageType.FRAME_DATA, callback);
  }

  /**
   * 监听原始数据
   * @param callback 回调函数
   */
  onRawData(callback: (data: any) => void): void {
    this.on(MessageType.RAW_DATA, callback);
  }

  /**
   * 监听连接状态变化
   * @param callback 回调函数
   */
  onConnectionStatus(callback: (status: any) => void): void {
    this.on(MessageType.CONNECTION_STATUS, callback);
  }

  /**
   * 监听项目加载完成
   * @param callback 回调函数
   */
  onProjectLoaded(callback: (project: any) => void): void {
    this.on(MessageType.PROJECT_LOADED, callback);
  }

  /**
   * 监听导出完成
   * @param callback 回调函数
   */
  onExportComplete(callback: (result: any) => void): void {
    this.on(MessageType.EXPORT_COMPLETE, callback);
  }

  /**
   * 监听错误
   * @param callback 回调函数
   */
  onError(callback: (error: any) => void): void {
    this.on(MessageType.ERROR, callback);
  }

  /**
   * 监听警告
   * @param callback 回调函数
   */
  onWarning(callback: (warning: any) => void): void {
    this.on(MessageType.WARNING, callback);
  }

  /**
   * 监听信息
   * @param callback 回调函数
   */
  onInfo(callback: (info: any) => void): void {
    this.on(MessageType.INFO, callback);
  }

  // === 日志和调试方法 ===

  /**
   * 发送日志消息
   * @param level 日志级别
   * @param message 消息内容
   * @param data 附加数据
   */
  log(level: 'error' | 'warning' | 'info', message: string, data?: any): void {
    const messageType = level === 'error' ? MessageType.ERROR :
                       level === 'warning' ? MessageType.WARNING :
                       MessageType.INFO;

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
  logError(error: Error | string, data?: any): void {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    this.log('error', message, { ...data, stack });
  }

  /**
   * 发送警告消息
   * @param message 警告消息
   * @param data 附加数据
   */
  logWarning(message: string, data?: any): void {
    this.log('warning', message, data);
  }

  /**
   * 发送信息消息
   * @param message 信息消息
   * @param data 附加数据
   */
  logInfo(message: string, data?: any): void {
    this.log('info', message, data);
  }

  // === 性能监控方法 ===

  /**
   * 发送性能指标
   * @param metrics 性能指标
   */
  sendPerformanceMetrics(metrics: any): void {
    this.sendMessage({
      type: MessageType.INFO,
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
  trackUserAction(action: string, data?: any): void {
    this.sendMessage({
      type: MessageType.INFO,
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
  sendBatch(messages: any[]): void {
    const batchMessage = {
      type: MessageType.BATCH,
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
  cancelRequest(requestId: string): void {
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
  setOnline(online: boolean): void {
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
  clearQueue(): void {
    this.messageQueue = [];
  }

  // === 清理方法 ===

  /**
   * 销毁消息桥梁
   */
  destroy(): void {
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
  cleanup(): void {
    this.destroy();
  }

  /**
   * 获取桥梁统计信息
   */
  getStats(): { 
    pendingRequests: number; 
    totalMessages: number;
    messagesSent: number;
    messagesReceived: number;
    averageLatency: number;
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      totalMessages: this.messageId,
      messagesSent: this.messageStats.messagesSent,
      messagesReceived: this.messageStats.messagesReceived,
      averageLatency: this.messageStats.averageLatency
    };
  }
}
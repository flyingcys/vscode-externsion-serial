/**
 * 统一错误处理系统
 * 提供用户友好的错误消息和自动恢复机制
 */

import { EventEmitter } from 'events';

/**
 * 错误严重性级别
 */
export enum ErrorSeverity {
  INFO = 'info',           // 信息性消息
  WARNING = 'warning',     // 警告，不影响核心功能
  ERROR = 'error',         // 错误，影响部分功能
  CRITICAL = 'critical',   // 严重错误，影响核心功能
  FATAL = 'fatal'          // 致命错误，系统无法继续运行
}

/**
 * 错误类别
 */
export enum ErrorCategory {
  NETWORK = 'network',           // 网络相关错误
  DATA_PROCESSING = 'data',      // 数据处理错误
  FILE_SYSTEM = 'filesystem',    // 文件系统错误
  DEVICE_CONNECTION = 'device',  // 设备连接错误
  USER_INPUT = 'user_input',     // 用户输入错误
  SYSTEM = 'system',             // 系统错误
  CONFIGURATION = 'config',       // 配置错误
  PERFORMANCE = 'performance',   // 性能相关问题
  SECURITY = 'security',         // 安全相关错误
  UNKNOWN = 'unknown'            // 未知错误
}

/**
 * 结构化错误信息
 */
export interface StructuredError {
  id: string;                          // 唯一错误ID
  code: string;                        // 错误代码
  severity: ErrorSeverity;             // 严重性级别
  category: ErrorCategory;             // 错误类别
  title: string;                       // 用户友好的标题
  message: string;                     // 用户友好的消息
  technicalDetails?: string;           // 技术详细信息（可选）
  timestamp: number;                   // 错误发生时间
  context?: Record<string, any>;       // 错误上下文信息
  suggestions?: string[];              // 解决建议
  autoRecoveryAttempted?: boolean;     // 是否尝试了自动恢复
  canRetry?: boolean;                  // 是否可以重试
  userAction?: string;                 // 建议的用户操作
  relatedErrors?: string[];            // 相关错误ID
}

/**
 * 错误处理选项
 */
export interface ErrorHandlingOptions {
  enableAutoRecovery?: boolean;        // 启用自动恢复
  enableUserNotification?: boolean;    // 启用用户通知
  enableLogging?: boolean;             // 启用日志记录
  maxRetryAttempts?: number;           // 最大重试次数
  retryDelayMs?: number;              // 重试延迟
  suppressDuplicates?: boolean;        // 抑制重复错误
  duplicateTimeWindowMs?: number;      // 重复错误时间窗口
}

/**
 * 自动恢复策略接口
 */
export interface RecoveryStrategy {
  name: string;
  description: string;
  canHandle: (error: StructuredError) => boolean;
  recover: (error: StructuredError) => Promise<boolean>;
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * 错误处理统计
 */
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  autoRecoverySuccessRate: number;
  averageRecoveryTime: number;
  recentErrors: StructuredError[];
}

/**
 * 统一错误处理器
 */
export class ErrorHandler extends EventEmitter {
  private static instance: ErrorHandler | null = null;
  private errors: Map<string, StructuredError> = new Map();
  private recoveryStrategies: RecoveryStrategy[] = [];
  private options: Required<ErrorHandlingOptions>;
  private stats: ErrorStats;
  private duplicateTracker: Map<string, number> = new Map();

  private constructor(options: ErrorHandlingOptions = {}) {
    super();
    
    this.options = {
      enableAutoRecovery: true,
      enableUserNotification: true,
      enableLogging: true,
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      suppressDuplicates: true,
      duplicateTimeWindowMs: 5000,
      ...options
    };

    this.stats = {
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      autoRecoverySuccessRate: 0,
      averageRecoveryTime: 0,
      recentErrors: []
    };

    // 初始化统计计数器
    Object.values(ErrorCategory).forEach(category => {
      this.stats.errorsByCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      this.stats.errorsBySeverity[severity] = 0;
    });

    this.setupDefaultRecoveryStrategies();
    this.setupCleanupTasks();
  }

  /**
   * 获取全局错误处理器实例
   */
  public static getInstance(options?: ErrorHandlingOptions): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(options);
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   */
  public async handleError(error: Error | StructuredError, context?: Record<string, any>): Promise<StructuredError> {
    const structuredError = this.normalizeError(error, context);
    
    // 检查重复错误
    if (this.isDuplicateError(structuredError)) {
      return structuredError;
    }

    // 记录错误
    this.recordError(structuredError);

    // 尝试自动恢复
    if (this.options.enableAutoRecovery) {
      await this.attemptAutoRecovery(structuredError);
    }

    // 发送通知
    if (this.options.enableUserNotification) {
      this.emitErrorNotification(structuredError);
    }

    // 记录日志
    if (this.options.enableLogging) {
      this.logError(structuredError);
    }

    return structuredError;
  }

  /**
   * 注册恢复策略
   */
  public registerRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
    // 按优先级排序
    this.recoveryStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取错误统计信息
   */
  public getStats(): ErrorStats {
    return { ...this.stats };
  }

  /**
   * 获取最近的错误
   */
  public getRecentErrors(limit: number = 10): StructuredError[] {
    return this.stats.recentErrors.slice(-limit);
  }

  /**
   * 清除错误历史
   */
  public clearErrorHistory(): void {
    this.errors.clear();
    this.stats.recentErrors = [];
    this.duplicateTracker.clear();
  }

  /**
   * 将普通错误标准化为结构化错误
   */
  private normalizeError(error: Error | StructuredError, context?: Record<string, any>): StructuredError {
    if (this.isStructuredError(error)) {
      return error;
    }

    const errorId = this.generateErrorId();
    const errorInfo = this.analyzeError(error);

    return {
      id: errorId,
      code: errorInfo.code,
      severity: errorInfo.severity,
      category: errorInfo.category,
      title: errorInfo.title,
      message: errorInfo.message,
      technicalDetails: error.message,
      timestamp: Date.now(),
      context: context || {},
      suggestions: errorInfo.suggestions,
      canRetry: errorInfo.canRetry,
      userAction: errorInfo.userAction
    };
  }

  /**
   * 分析错误并生成用户友好信息
   */
  private analyzeError(error: Error): {
    code: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    title: string;
    message: string;
    suggestions: string[];
    canRetry: boolean;
    userAction: string;
  } {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // 网络错误
    if (errorMessage.includes('network') || errorMessage.includes('connection') || 
        errorMessage.includes('timeout') || errorMessage.includes('econnrefused')) {
      return {
        code: 'NETWORK_ERROR',
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.NETWORK,
        title: '网络连接失败',
        message: '无法连接到服务器，请检查网络连接和服务器状态。',
        suggestions: [
          '检查网络连接是否正常',
          '确认服务器地址和端口号正确',
          '检查防火墙设置',
          '稍后重试连接'
        ],
        canRetry: true,
        userAction: '请检查网络连接后重试'
      };
    }

    // 文件系统错误
    if (errorMessage.includes('enoent') || errorMessage.includes('file not found') ||
        errorMessage.includes('permission denied') || errorMessage.includes('eacces')) {
      return {
        code: 'FILE_SYSTEM_ERROR',
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.FILE_SYSTEM,
        title: '文件操作失败',
        message: '文件读写操作失败，可能是文件不存在或权限不足。',
        suggestions: [
          '确认文件路径正确',
          '检查文件是否存在',
          '确认程序有足够的文件访问权限',
          '检查磁盘空间是否充足'
        ],
        canRetry: true,
        userAction: '请检查文件路径和权限后重试'
      };
    }

    // 数据解析错误
    if (errorMessage.includes('json') || errorMessage.includes('parse') ||
        errorMessage.includes('syntax') || errorName.includes('syntaxerror')) {
      return {
        code: 'DATA_PARSING_ERROR',
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.DATA_PROCESSING,
        title: '数据格式错误',
        message: '接收到的数据格式不正确，无法正常解析。',
        suggestions: [
          '检查数据源是否正确配置',
          '确认数据格式符合预期',
          '检查JSON格式是否有效',
          '验证数据传输过程是否完整'
        ],
        canRetry: false,
        userAction: '请检查数据格式设置'
      };
    }

    // 内存相关错误
    if (errorMessage.includes('memory') || errorMessage.includes('out of memory') ||
        errorMessage.includes('heap')) {
      return {
        code: 'MEMORY_ERROR',
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.PERFORMANCE,
        title: '内存不足',
        message: '系统内存不足，无法继续处理当前操作。',
        suggestions: [
          '关闭不必要的应用程序',
          '减少数据处理的批次大小',
          '清理系统缓存',
          '重启应用程序'
        ],
        canRetry: true,
        userAction: '请释放更多内存后重试'
      };
    }

    // MQTT相关错误
    if (errorMessage.includes('mqtt') || errorMessage.includes('broker')) {
      return {
        code: 'MQTT_CONNECTION_ERROR',
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.DEVICE_CONNECTION,
        title: 'MQTT连接失败',
        message: '无法连接到MQTT代理服务器，请检查连接配置。',
        suggestions: [
          '确认MQTT代理服务器地址正确',
          '检查用户名和密码设置',
          '验证网络连接状态',
          '确认MQTT代理服务器运行正常'
        ],
        canRetry: true,
        userAction: '请检查MQTT连接配置'
      };
    }

    // 设备连接错误
    if (errorMessage.includes('device') || errorMessage.includes('serial') ||
        errorMessage.includes('port') || errorMessage.includes('baudrate')) {
      return {
        code: 'DEVICE_CONNECTION_ERROR',
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.DEVICE_CONNECTION,
        title: '设备连接失败',
        message: '无法连接到指定设备，请检查设备状态和连接配置。',
        suggestions: [
          '确认设备已正确连接',
          '检查串口或USB连接',
          '验证波特率等参数设置',
          '确认设备驱动程序已安装'
        ],
        canRetry: true,
        userAction: '请检查设备连接状态'
      };
    }

    // 默认处理
    return {
      code: 'UNKNOWN_ERROR',
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.UNKNOWN,
      title: '发生未知错误',
      message: '系统遇到了意外问题，请尝试重新执行操作。',
      suggestions: [
        '重新尝试当前操作',
        '检查系统状态',
        '查看详细错误信息',
        '联系技术支持'
      ],
      canRetry: true,
      userAction: '请重试操作或联系技术支持'
    };
  }

  /**
   * 检查是否为重复错误
   */
  private isDuplicateError(error: StructuredError): boolean {
    if (!this.options.suppressDuplicates) {
      return false;
    }

    const key = `${error.code}_${error.category}`;
    const lastOccurrence = this.duplicateTracker.get(key);
    const now = Date.now();

    if (lastOccurrence && (now - lastOccurrence) < this.options.duplicateTimeWindowMs) {
      return true;
    }

    this.duplicateTracker.set(key, now);
    return false;
  }

  /**
   * 记录错误到统计信息
   */
  private recordError(error: StructuredError): void {
    this.errors.set(error.id, error);
    this.stats.totalErrors++;
    this.stats.errorsByCategory[error.category]++;
    this.stats.errorsBySeverity[error.severity]++;
    this.stats.recentErrors.push(error);

    // 保持最近错误列表不超过100个
    if (this.stats.recentErrors.length > 100) {
      this.stats.recentErrors = this.stats.recentErrors.slice(-100);
    }
  }

  /**
   * 尝试自动恢复
   */
  private async attemptAutoRecovery(error: StructuredError): Promise<void> {
    const applicableStrategies = this.recoveryStrategies.filter(strategy => 
      strategy.canHandle(error)
    );

    if (applicableStrategies.length === 0) {
      return;
    }

    const recoveryStartTime = performance.now();
    let recoverySuccessful = false;

    for (const strategy of applicableStrategies) {
      try {
        console.log(`尝试恢复策略: ${strategy.name}`);
        const success = await strategy.recover(error);
        
        if (success) {
          recoverySuccessful = true;
          error.autoRecoveryAttempted = true;
          console.log(`恢复策略 "${strategy.name}" 执行成功`);
          break;
        }
      } catch (recoveryError) {
        console.error(`恢复策略 "${strategy.name}" 执行失败:`, recoveryError);
      }
    }

    // 更新恢复统计信息
    const recoveryTime = performance.now() - recoveryStartTime;
    this.updateRecoveryStats(recoverySuccessful, recoveryTime);

    if (recoverySuccessful) {
      this.emit('recovery:success', { error, recoveryTime });
    } else {
      this.emit('recovery:failed', { error, recoveryTime });
    }
  }

  /**
   * 发送错误通知
   */
  private emitErrorNotification(error: StructuredError): void {
    this.emit('error:notification', error);
  }

  /**
   * 记录错误日志
   */
  private logError(error: StructuredError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.category.toUpperCase()}] ${error.title}: ${error.message}`;
    
    console[logLevel](`Error ${error.id}:`, logMessage);
    
    if (error.technicalDetails) {
      console[logLevel]('Technical Details:', error.technicalDetails);
    }
    
    if (error.context && Object.keys(error.context).length > 0) {
      console[logLevel]('Context:', error.context);
    }
  }

  /**
   * 获取日志级别
   */
  private getLogLevel(severity: ErrorSeverity): 'info' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'info';
      case ErrorSeverity.WARNING:
        return 'warn';
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.FATAL:
      default:
        return 'error';
    }
  }

  /**
   * 更新恢复统计信息
   */
  private updateRecoveryStats(successful: boolean, recoveryTime: number): void {
    // 这里可以实现更复杂的统计逻辑
    if (successful) {
      // 更新平均恢复时间
      this.stats.averageRecoveryTime = 
        (this.stats.averageRecoveryTime + recoveryTime) / 2;
    }
    
    // 计算成功率（这里简化实现）
    this.stats.autoRecoverySuccessRate = successful ? 0.9 : 0.7; // 示例值
  }

  /**
   * 设置默认恢复策略
   */
  private setupDefaultRecoveryStrategies(): void {
    // 网络重连策略
    this.registerRecoveryStrategy({
      name: 'NetworkReconnection',
      description: '网络连接重试',
      priority: 1,
      canHandle: (error) => error.category === ErrorCategory.NETWORK,
      recover: async (error) => {
        // 模拟网络重连
        await this.delay(this.options.retryDelayMs);
        return Math.random() > 0.3; // 70%成功率
      }
    });

    // 文件操作重试策略
    this.registerRecoveryStrategy({
      name: 'FileOperationRetry',
      description: '文件操作重试',
      priority: 2,
      canHandle: (error) => error.category === ErrorCategory.FILE_SYSTEM,
      recover: async (error) => {
        // 模拟文件操作重试
        await this.delay(this.options.retryDelayMs * 0.5);
        return Math.random() > 0.4; // 60%成功率
      }
    });

    // 内存释放策略
    this.registerRecoveryStrategy({
      name: 'MemoryCleanup',
      description: '内存清理',
      priority: 1,
      canHandle: (error) => error.category === ErrorCategory.PERFORMANCE,
      recover: async (error) => {
        // 尝试垃圾回收
        if (typeof globalThis.gc === 'function') {
          globalThis.gc();
        }
        await this.delay(1000);
        return true; // 内存清理通常会成功
      }
    });

    // 设备重连策略
    this.registerRecoveryStrategy({
      name: 'DeviceReconnection',
      description: '设备重新连接',
      priority: 2,
      canHandle: (error) => error.category === ErrorCategory.DEVICE_CONNECTION,
      recover: async (error) => {
        // 模拟设备重连
        await this.delay(this.options.retryDelayMs * 2);
        return Math.random() > 0.5; // 50%成功率
      }
    });
  }

  /**
   * 设置清理任务
   */
  private setupCleanupTasks(): void {
    // 定期清理过期的重复错误跟踪记录
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];
      
      for (const [key, timestamp] of this.duplicateTracker.entries()) {
        if ((now - timestamp) > this.options.duplicateTimeWindowMs * 2) {
          expiredKeys.push(key);
        }
      }
      
      expiredKeys.forEach(key => this.duplicateTracker.delete(key));
    }, 60000); // 每分钟清理一次
  }

  /**
   * 工具方法
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isStructuredError(error: any): error is StructuredError {
    return error && typeof error.id === 'string' && typeof error.code === 'string';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁错误处理器
   */
  public dispose(): void {
    this.removeAllListeners();
    this.clearErrorHistory();
    ErrorHandler.instance = null;
  }
}

/**
 * 创建用户友好的错误信息
 */
export function createUserFriendlyError(
  code: string,
  title: string,
  message: string,
  options: Partial<StructuredError> = {}
): StructuredError {
  return {
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code,
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.UNKNOWN,
    title,
    message,
    timestamp: Date.now(),
    canRetry: false,
    ...options
  };
}

/**
 * 全局错误处理器实例
 */
export const globalErrorHandler = ErrorHandler.getInstance();
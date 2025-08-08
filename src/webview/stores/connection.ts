/**
 * Connection Store for Serial Studio VSCode Extension
 * 连接状态管理存储
 */

import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import { 
  BusType,
  type ConnectionConfig, 
  type CommunicationStats
} from '../../shared/types';

/**
 * 连接状态枚举
 */
export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Error = 'error'
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  name: string;
  type: BusType;
  path?: string;
  description?: string;
  isAvailable?: boolean;
  isConnected?: boolean;
  lastSeen?: number;
}

export const useConnectionStore = defineStore('connection', () => {
  // === 状态 ===
  const connectionState = ref<ConnectionState>(ConnectionState.Disconnected);
  const currentConfig = ref<ConnectionConfig | null>(null);
  const lastError = ref<string>('');
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = ref(5);
  const isAutoReconnectEnabled = ref(true);
  
  // 可用设备列表
  const availableDevices = ref<DeviceInfo[]>([]);
  const isScanning = ref(false);
  
  // 通信统计
  const stats = reactive<CommunicationStats>({
    bytesReceived: 0,
    bytesSent: 0,
    framesReceived: 0,
    framesSent: 0,
    framesProcessed: 0,
    errors: 0,
    reconnections: 0,
    uptime: 0
  });

  // 当前设备信息
  const currentDevice = ref<DeviceInfo | null>(null);
  
  // 连接历史
  const connectionHistory = ref<Array<{
    config: ConnectionConfig;
    timestamp: number;
    duration: number;
    success: boolean;
  }>>([]);

  // === 计算属性 ===
  const isConnected = computed(() => connectionState.value === ConnectionState.Connected);
  const isConnecting = computed(() => 
    connectionState.value === ConnectionState.Connecting ||
    connectionState.value === ConnectionState.Reconnecting
  );

  const hasError = computed(() => connectionState.value === ConnectionState.Error);
  
  const canReconnect = computed(() => 
    isAutoReconnectEnabled.value && 
    reconnectAttempts.value < maxReconnectAttempts.value &&
    currentConfig.value !== null
  );

  const connectionStatusText = computed(() => {
    switch (connectionState.value) {
      case ConnectionState.Disconnected:
        return '未连接';
      case ConnectionState.Connecting:
        return '连接中...';
      case ConnectionState.Connected:
        return '已连接';
      case ConnectionState.Reconnecting:
        return `重连中... (${reconnectAttempts.value}/${maxReconnectAttempts.value})`;
      case ConnectionState.Error:
        return `连接错误: ${lastError.value}`;
      default:
        return '未知状态';
    }
  });

  const uptimeText = computed(() => {
    const hours = Math.floor(stats.uptime / 3600000);
    const minutes = Math.floor((stats.uptime % 3600000) / 60000);
    const seconds = Math.floor((stats.uptime % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  });

  // === 内部状态 ===
  let uptimeTimer: NodeJS.Timeout | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let connectionStartTime = 0;

  // === 方法 ===

  /**
   * 连接到设备
   * @param config 连接配置
   */
  const connect = async (config: ConnectionConfig): Promise<void> => {
    if (isConnecting.value) {
      throw new Error('正在连接中，请等待');
    }

    try {
      connectionState.value = ConnectionState.Connecting;
      currentConfig.value = config;
      lastError.value = '';
      connectionStartTime = Date.now();

      // 通过消息桥梁发送连接请求
      // 这里应该调用 MessageBridge 的方法
      console.log('连接请求:', config);

      // 模拟连接过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 连接成功
      connectionState.value = ConnectionState.Connected;
      reconnectAttempts.value = 0;
      startUptimeTimer();

      // 添加到连接历史
      addToHistory(config, true);

    } catch (error) {
      connectionState.value = ConnectionState.Error;
      lastError.value = error instanceof Error ? error.message : String(error);
      stats.errors++;
      
      // 添加到连接历史
      addToHistory(config, false);
      
      // 尝试自动重连
      scheduleReconnect();
      
      throw error;
    }
  };

  /**
   * 断开连接
   */
  const disconnect = async (): Promise<void> => {
    try {
      stopUptimeTimer();
      stopReconnectTimer();
      
      // 通过消息桥梁发送断开连接请求
      console.log('断开连接请求');
      
      connectionState.value = ConnectionState.Disconnected;
      currentConfig.value = null;
      lastError.value = '';
      reconnectAttempts.value = 0;

    } catch (error) {
      console.error('断开连接时出错:', error);
      lastError.value = error instanceof Error ? error.message : String(error);
    }
  };

  /**
   * 重新连接
   */
  const reconnect = async (): Promise<void> => {
    if (!currentConfig.value) {
      throw new Error('没有可用的连接配置');
    }

    reconnectAttempts.value++;
    connectionState.value = ConnectionState.Reconnecting;
    
    try {
      await connect(currentConfig.value);
      stats.reconnections++;
    } catch (error) {
      if (canReconnect.value) {
        scheduleReconnect();
      } else {
        connectionState.value = ConnectionState.Error;
        lastError.value = '重连次数已达上限';
      }
      throw error;
    }
  };

  /**
   * 安排自动重连
   */
  const scheduleReconnect = (): void => {
    if (!canReconnect.value) {return;}

    stopReconnectTimer();
    
    // 指数退避算法：第n次重连等待 2^n 秒，最多30秒
    const delay = Math.min(Math.pow(2, reconnectAttempts.value) * 1000, 30000);
    
    reconnectTimer = setTimeout(() => {
      reconnect().catch(console.error);
    }, delay);
  };

  /**
   * 扫描可用设备
   * @param busType 总线类型（可选）
   */
  const scanDevices = async (busType?: BusType): Promise<DeviceInfo[]> => {
    if (isScanning.value) {
      return availableDevices.value;
    }

    try {
      isScanning.value = true;
      
      // 通过消息桥梁发送扫描请求
      console.log('扫描设备:', busType);
      
      // 模拟扫描过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟设备列表
      const mockDevices: DeviceInfo[] = [
        {
          name: 'COM3',
          type: BusType.UART,
          description: 'USB Serial Port',
          isAvailable: true,
          lastSeen: Date.now()
        },
        {
          name: '192.168.1.100:8080',
          type: BusType.Network,
          description: 'TCP Server',
          isAvailable: true,
          lastSeen: Date.now()
        }
      ];
      
      availableDevices.value = mockDevices;
      return mockDevices;

    } catch (error) {
      console.error('设备扫描失败:', error);
      return [];
    } finally {
      isScanning.value = false;
    }
  };

  /**
   * 设置连接状态
   * @param state 连接状态
   */
  const setState = (state: ConnectionState): void => {
    connectionState.value = state;
  };

  /**
   * 设置当前设备
   * @param device 设备信息
   */
  const setCurrentDevice = (device: DeviceInfo | null): void => {
    currentDevice.value = device;
  };
  
  /**
   * 清除当前设备
   */
  const clearCurrentDevice = (): void => {
    currentDevice.value = null;
  };

  /**
   * 设置错误信息
   * @param error 错误对象或消息
   */
  const setError = (error: Error | string): void => {
    lastError.value = error instanceof Error ? error.message : error;
    connectionState.value = ConnectionState.Error;
  };

  /**
   * 清除错误信息
   */
  const clearError = (): void => {
    lastError.value = '';
  };

  /**
   * Set connection configuration
   * @param config Connection configuration
   */
  const setConnectionConfig = (config: ConnectionConfig): void => {
    currentConfig.value = config;
  };

  /**
   * Update connection configuration
   * @param updates Configuration updates
   */
  const updateConnectionConfig = (updates: Partial<ConnectionConfig>): void => {
    if (currentConfig.value) {
      currentConfig.value = { ...currentConfig.value, ...updates };
    }
  };

  /**
   * Update connection statistics
   * @param update Statistics update
   */
  const updateStats = (update: Partial<CommunicationStats>): void => {
    Object.keys(update).forEach(key => {
      const typedKey = key as keyof CommunicationStats;
      if (typeof update[typedKey] === 'number') {
        // Accumulate numeric statistics
        (stats as any)[typedKey] += update[typedKey] || 0;
      } else {
        // Direct assignment for other types
        (stats as any)[typedKey] = update[typedKey];
      }
    });
  };

  /**
   * Reset statistics
   */
  const resetStats = (): void => {
    stats.bytesReceived = 0;
    stats.bytesSent = 0;
    stats.framesReceived = 0;
    stats.framesSent = 0;
    stats.errors = 0;
    stats.reconnections = 0;
    stats.uptime = 0;
  };

  /**
   * 设置自动重连
   * @param enabled 是否启用自动重连
   */
  const setAutoReconnect = (enabled: boolean): void => {
    isAutoReconnectEnabled.value = enabled;
    
    if (!enabled) {
      stopReconnectTimer();
    }
  };

  /**
   * 设置最大重连次数
   * @param max 最大重连次数
   */
  const setMaxReconnectAttempts = (max: number): void => {
    maxReconnectAttempts.value = Math.max(0, max);
  };

  /**
   * 清除连接历史
   */
  const clearHistory = (): void => {
    connectionHistory.value = [];
  };

  /**
   * 获取连接配置预设
   */
  const getPresets = (): ConnectionConfig[] => {
    // 从本地存储获取预设配置
    const stored = localStorage.getItem('serial-studio-connection-presets');
    return stored ? JSON.parse(stored) : [];
  };

  /**
   * 保存连接配置预设
   * @param presets 预设配置列表
   */
  const savePresets = (presets: ConnectionConfig[]): void => {
    localStorage.setItem('serial-studio-connection-presets', JSON.stringify(presets));
  };

  /**
   * 添加连接预设
   * @param config 连接配置
   * @param name 预设名称
   */
  const addPreset = (config: ConnectionConfig, name: string): void => {
    const presets = getPresets();
    const preset = { ...config, name };
    
    // 检查是否已存在同名预设
    const existingIndex = presets.findIndex(p => p.name === name);
    
    if (existingIndex >= 0) {
      presets[existingIndex] = preset;
    } else {
      presets.push(preset);
    }
    
    savePresets(presets);
  };

  /**
   * 删除连接预设
   * @param name 预设名称
   */
  const removePreset = (name: string): void => {
    const presets = getPresets();
    const filtered = presets.filter(p => p.name !== name);
    savePresets(filtered);
  };

  /**
   * 检查是否可以转换到指定状态
   * @param targetState 目标状态
   * @returns 是否可以转换
   */
  const canTransitionTo = (targetState: ConnectionState): boolean => {
    const current = connectionState.value;
    
    switch (current) {
      case ConnectionState.Disconnected:
        return targetState === ConnectionState.Connecting;
        
      case ConnectionState.Connecting:
        return [
          ConnectionState.Connected,
          ConnectionState.Error,
          ConnectionState.Disconnected
        ].includes(targetState);
        
      case ConnectionState.Connected:
        return [
          ConnectionState.Disconnected,
          ConnectionState.Reconnecting,
          ConnectionState.Error
        ].includes(targetState);
        
      case ConnectionState.Reconnecting:
        return [
          ConnectionState.Connected,
          ConnectionState.Error,
          ConnectionState.Disconnected
        ].includes(targetState);
        
      case ConnectionState.Error:
        return [
          ConnectionState.Disconnected,
          ConnectionState.Connecting,
          ConnectionState.Reconnecting
        ].includes(targetState);
        
      default:
        return false;
    }
  };

  /**
   * 添加连接到历史记录
   * @param config 连接配置
   * @param success 是否成功（可选）
   */
  const addToHistoryPublic = (config: ConnectionConfig, success: boolean = true): void => {
    addToHistory(config, success);
  };

  // === 内部辅助方法 ===

  /**
   * 开始运行时间计时器
   */
  const startUptimeTimer = (): void => {
    stopUptimeTimer();
    
    const startTime = Date.now();
    uptimeTimer = setInterval(() => {
      stats.uptime = Date.now() - startTime;
    }, 1000);
  };

  /**
   * 停止运行时间计时器
   */
  const stopUptimeTimer = (): void => {
    if (uptimeTimer) {
      clearInterval(uptimeTimer);
      uptimeTimer = null;
    }
  };

  /**
   * 停止重连计时器
   */
  const stopReconnectTimer = (): void => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  /**
   * 添加到连接历史
   * @param config 连接配置
   * @param success 是否成功
   */
  const addToHistory = (config: ConnectionConfig, success: boolean): void => {
    const entry = {
      config: { ...config },
      timestamp: connectionStartTime,
      duration: Date.now() - connectionStartTime,
      success
    };
    
    connectionHistory.value.unshift(entry);
    
    // 限制历史记录数量
    if (connectionHistory.value.length > 50) {
      connectionHistory.value = connectionHistory.value.slice(0, 50);
    }
  };

  // 返回store API
  return {
    // 状态
    state: computed(() => connectionState.value),
    connectionState: computed(() => connectionState.value),
    currentConfig: computed(() => currentConfig.value),
    connectionConfig: computed(() => currentConfig.value),
    lastError: computed(() => lastError.value),
    currentDevice: computed(() => currentDevice.value),
    availableDevices: computed(() => availableDevices.value),
    isScanning: computed(() => isScanning.value),
    stats,  // 返回响应式对象而不是计算属性
    connectionHistory: computed(() => connectionHistory.value),
    
    // 计算属性
    isConnected,
    isConnecting,
    hasError,
    canReconnect,
    connectionStatusText,
    uptimeText,
    
    // 配置
    isAutoReconnectEnabled: computed(() => isAutoReconnectEnabled.value),
    maxReconnectAttempts: computed(() => maxReconnectAttempts.value),
    reconnectAttempts: computed(() => reconnectAttempts.value),
    
    // 方法
    connect,
    disconnect,
    reconnect,
    scanDevices,
    setState,
    setCurrentDevice,
    clearCurrentDevice,
    setError,
    clearError,
    setConnectionConfig,
    updateConnectionConfig,
    updateStats,
    resetStats,
    setAutoReconnect,
    setMaxReconnectAttempts,
    clearHistory,
    getPresets,
    savePresets,
    addPreset,
    removePreset,
    canTransitionTo,
    addToHistory: addToHistoryPublic
  };
});

export default useConnectionStore;
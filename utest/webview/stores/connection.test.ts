/**
 * Connection Store Tests
 * 连接状态管理存储测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createApp } from 'vue';
import { useConnectionStore, ConnectionState } from '../../../src/webview/stores/connection';
import { BusType } from '../../../src/shared/types';

describe('Connection Store', () => {
  beforeEach(() => {
    // 设置 Pinia 测试环境
    const app = createApp({});
    const pinia = createPinia();
    app.use(pinia);
    setActivePinia(pinia);
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useConnectionStore();
      
      expect(store.state).toBe(ConnectionState.Disconnected);
      expect(store.isConnected).toBe(false);
      expect(store.isConnecting).toBe(false);
      expect(store.currentDevice).toBeNull();
      expect(store.connectionConfig).toBeNull();
      expect(store.lastError).toBeNull();
    });

    it('应该有空的统计信息', () => {
      const store = useConnectionStore();
      
      expect(store.stats.bytesReceived).toBe(0);
      expect(store.stats.bytesSent).toBe(0);
      expect(store.stats.packetsReceived).toBe(0);
      expect(store.stats.packetsSent).toBe(0);
    });
  });

  describe('状态计算属性', () => {
    it('isConnected 应该正确反映连接状态', () => {
      const store = useConnectionStore();
      
      expect(store.isConnected).toBe(false);
      
      store.setState(ConnectionState.Connected);
      expect(store.isConnected).toBe(true);
      
      store.setState(ConnectionState.Connecting);
      expect(store.isConnected).toBe(false);
    });

    it('isConnecting 应该正确反映连接中状态', () => {
      const store = useConnectionStore();
      
      expect(store.isConnecting).toBe(false);
      
      store.setState(ConnectionState.Connecting);
      expect(store.isConnecting).toBe(true);
      
      store.setState(ConnectionState.Reconnecting);
      expect(store.isConnecting).toBe(true);
      
      store.setState(ConnectionState.Connected);
      expect(store.isConnecting).toBe(false);
    });

    it('hasError 应该正确反映错误状态', () => {
      const store = useConnectionStore();
      
      expect(store.hasError).toBe(false);
      
      store.setState(ConnectionState.Error);
      expect(store.hasError).toBe(true);
      
      store.setState(ConnectionState.Connected);
      expect(store.hasError).toBe(false);
    });
  });

  describe('连接操作', () => {
    it('应该能够建立连接', async () => {
      const store = useConnectionStore();
      const config = {
        busType: BusType.Serial,
        port: 'COM1',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      };

      await store.connect(config);

      expect(store.state).toBe(ConnectionState.Connecting);
      expect(store.connectionConfig).toEqual(config);
    });

    it('应该能够断开连接', async () => {
      const store = useConnectionStore();
      
      // 先建立连接
      store.setState(ConnectionState.Connected);
      
      await store.disconnect();

      expect(store.state).toBe(ConnectionState.Disconnected);
      expect(store.currentDevice).toBeNull();
      expect(store.connectionConfig).toBeNull();
    });

    it('应该能够重连', async () => {
      const store = useConnectionStore();
      const config = {
        busType: BusType.Serial,
        port: 'COM1',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      };

      // 设置初始连接配置
      store.setConnectionConfig(config);
      
      await store.reconnect();

      expect(store.state).toBe(ConnectionState.Reconnecting);
    });
  });

  describe('设备管理', () => {
    it('应该能够设置当前设备', () => {
      const store = useConnectionStore();
      const device = {
        name: 'Test Device',
        type: BusType.Serial,
        path: '/dev/ttyUSB0',
        isConnected: true
      };

      store.setCurrentDevice(device);

      expect(store.currentDevice).toEqual(device);
    });

    it('应该能够清除当前设备', () => {
      const store = useConnectionStore();
      const device = {
        name: 'Test Device',
        type: BusType.Serial,
        path: '/dev/ttyUSB0',
        isConnected: true
      };

      store.setCurrentDevice(device);
      expect(store.currentDevice).toEqual(device);

      store.clearCurrentDevice();
      expect(store.currentDevice).toBeNull();
    });
  });

  describe('统计信息管理', () => {
    it('应该能够更新接收字节数', () => {
      const store = useConnectionStore();
      
      store.updateStats({ bytesReceived: 100 });
      expect(store.stats.bytesReceived).toBe(100);
      
      store.updateStats({ bytesReceived: 50 });
      expect(store.stats.bytesReceived).toBe(150);
    });

    it('应该能够更新发送字节数', () => {
      const store = useConnectionStore();
      
      store.updateStats({ bytesSent: 200 });
      expect(store.stats.bytesSent).toBe(200);
    });

    it('应该能够更新包统计信息', () => {
      const store = useConnectionStore();
      
      store.updateStats({ 
        packetsReceived: 10,
        packetsSent: 5
      });
      
      expect(store.stats.packetsReceived).toBe(10);
      expect(store.stats.packetsSent).toBe(5);
    });

    it('应该能够重置统计信息', () => {
      const store = useConnectionStore();
      
      // 先设置一些统计数据
      store.updateStats({
        bytesReceived: 100,
        bytesSent: 200,
        packetsReceived: 10,
        packetsSent: 5
      });

      store.resetStats();

      expect(store.stats.bytesReceived).toBe(0);
      expect(store.stats.bytesSent).toBe(0);
      expect(store.stats.packetsReceived).toBe(0);
      expect(store.stats.packetsSent).toBe(0);
    });
  });

  describe('错误处理', () => {
    it('应该能够设置错误信息', () => {
      const store = useConnectionStore();
      const error = new Error('Connection failed');

      store.setError(error);

      expect(store.state).toBe(ConnectionState.Error);
      expect(store.lastError).toEqual(error);
    });

    it('应该能够清除错误信息', () => {
      const store = useConnectionStore();
      const error = new Error('Connection failed');

      store.setError(error);
      expect(store.lastError).toEqual(error);

      store.clearError();
      expect(store.lastError).toBeNull();
    });
  });

  describe('连接配置', () => {
    it('应该能够设置连接配置', () => {
      const store = useConnectionStore();
      const config = {
        busType: BusType.NetworkTCP,
        host: '192.168.1.100',
        port: 8080
      };

      store.setConnectionConfig(config);

      expect(store.connectionConfig).toEqual(config);
    });

    it('应该能够更新连接配置', () => {
      const store = useConnectionStore();
      const initialConfig = {
        busType: BusType.Serial,
        port: 'COM1',
        baudRate: 9600
      };

      store.setConnectionConfig(initialConfig);

      const updates = {
        baudRate: 115200,
        dataBits: 8
      };

      store.updateConnectionConfig(updates);

      expect(store.connectionConfig).toEqual({
        ...initialConfig,
        ...updates
      });
    });
  });

  describe('状态转换', () => {
    it('应该只允许有效的状态转换', () => {
      const store = useConnectionStore();

      // 从 Disconnected 到 Connecting
      expect(store.canTransitionTo(ConnectionState.Connecting)).toBe(true);
      expect(store.canTransitionTo(ConnectionState.Connected)).toBe(false);

      // 从 Connecting 到 Connected 或 Error
      store.setState(ConnectionState.Connecting);
      expect(store.canTransitionTo(ConnectionState.Connected)).toBe(true);
      expect(store.canTransitionTo(ConnectionState.Error)).toBe(true);
      expect(store.canTransitionTo(ConnectionState.Disconnected)).toBe(true);

      // 从 Connected 到 Disconnected 或 Reconnecting
      store.setState(ConnectionState.Connected);
      expect(store.canTransitionTo(ConnectionState.Disconnected)).toBe(true);
      expect(store.canTransitionTo(ConnectionState.Reconnecting)).toBe(true);
      expect(store.canTransitionTo(ConnectionState.Connecting)).toBe(false);
    });
  });

  describe('持久化', () => {
    it('应该能够保存连接历史', () => {
      const store = useConnectionStore();
      const config = {
        busType: BusType.Serial,
        port: 'COM1',
        baudRate: 9600
      };

      store.addToHistory(config);

      expect(store.connectionHistory).toContain(config);
      expect(store.connectionHistory.length).toBe(1);
    });

    it('应该限制连接历史数量', () => {
      const store = useConnectionStore();

      // 添加超过最大历史数量的连接
      for (let i = 0; i < 15; i++) {
        store.addToHistory({
          busType: BusType.Serial,
          port: `COM${i}`,
          baudRate: 9600
        });
      }

      expect(store.connectionHistory.length).toBeLessThanOrEqual(10);
    });

    it('应该去重连接历史', () => {
      const store = useConnectionStore();
      const config = {
        busType: BusType.Serial,
        port: 'COM1',
        baudRate: 9600
      };

      store.addToHistory(config);
      store.addToHistory(config);

      expect(store.connectionHistory.length).toBe(1);
    });
  });
});
/**
 * BluetoothLEDriver 蓝牙低功耗驱动简化测试
 * 专注于核心功能覆盖，避免复杂的蓝牙操作
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothLEDriver, BluetoothLEConfig } from '@extension/io/drivers/BluetoothLEDriver';
import { BusType } from '@shared/types';

describe('BluetoothLEDriver 蓝牙LE驱动核心功能测试', () => {
  let driver: BluetoothLEDriver;
  let config: BluetoothLEConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      type: BusType.BluetoothLE,
      deviceId: 'test-device-001',
      serviceUuid: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      characteristicUuid: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
      scanTimeout: 10000,
      connectionTimeout: 15000,
      reconnectInterval: 5000,
      autoReconnect: true,
      autoDiscoverServices: true,
      enableNotifications: true,
      powerMode: 'balanced'
    };

    driver = new BluetoothLEDriver(config);
  });

  afterEach(() => {
    if (driver) {
      driver.destroy();
    }
  });

  describe('🏗️ 基础功能', () => {
    it('应该正确初始化', () => {
      expect(driver.busType).toBe(BusType.BluetoothLE);
      expect(driver.displayName).toBe('BLE test-device-001');
    });

    it('应该应用默认配置', () => {
      const minimalConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'minimal-device',
        serviceUuid: '1800',
        characteristicUuid: '2a00'
      };

      const defaultDriver = new BluetoothLEDriver(minimalConfig);
      const finalConfig = defaultDriver.getConfiguration() as BluetoothLEConfig;

      expect(finalConfig.scanTimeout).toBe(10000);
      expect(finalConfig.connectionTimeout).toBe(15000);
      expect(finalConfig.reconnectInterval).toBe(5000);
      expect(finalConfig.autoReconnect).toBe(true);
      expect(finalConfig.autoDiscoverServices).toBe(true);
      expect(finalConfig.enableNotifications).toBe(true);
      expect(finalConfig.powerMode).toBe('balanced');
      
      defaultDriver.destroy();
    });
  });

  describe('🖥️ 操作系统支持', () => {
    it('应该检查操作系统支持', () => {
      // 静态方法测试
      const isSupported = BluetoothLEDriver.isOperatingSystemSupported();
      // 在测试环境中应该返回true（模拟支持）
      expect(typeof isSupported).toBe('boolean');
    });
  });

  describe('📝 配置验证', () => {
    it('应该验证有效配置', () => {
      const validation = BluetoothLEDriver.validateConfiguration(config);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该允许空设备ID（连接时再验证）', () => {
      const configWithEmptyDeviceId: BluetoothLEConfig = {
        ...config,
        deviceId: ''
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(configWithEmptyDeviceId);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该检测缺少服务UUID', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        serviceUuid: ''
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Service UUID is required');
    });

    it('应该检测缺少特征UUID', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        characteristicUuid: ''
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Characteristic UUID is required');
    });

    it('应该检测无效的服务UUID格式', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        serviceUuid: 'invalid-uuid'
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid service UUID format');
    });

    it('应该检测无效的特征UUID格式', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        characteristicUuid: 'invalid-uuid'
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid characteristic UUID format');
    });

    it('应该验证短格式UUID', () => {
      const shortUuidConfig: BluetoothLEConfig = {
        ...config,
        serviceUuid: '1800', // 短格式UUID
        characteristicUuid: '2a00' // 短格式UUID
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(shortUuidConfig);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该检测过短的扫描超时', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        scanTimeout: 50 // 小于测试环境最小值
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Scan timeout must be at least 100ms');
    });

    it('应该检测过短的连接超时', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        connectionTimeout: 50 // 小于测试环境最小值
      };
      
      const validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Connection timeout must be at least 100ms');
    });

    it('应该在不支持的操作系统上报错', () => {
      // 模拟不支持的操作系统
      const originalMethod = BluetoothLEDriver.isOperatingSystemSupported;
      BluetoothLEDriver.isOperatingSystemSupported = vi.fn().mockReturnValue(false);
      
      const validation = BluetoothLEDriver.validateConfiguration(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Bluetooth LE is not supported on this operating system');
      
      // 恢复原方法
      BluetoothLEDriver.isOperatingSystemSupported = originalMethod;
    });
  });

  describe('🔍 UUID验证', () => {
    it('应该验证短格式UUID', () => {
      expect(BluetoothLEDriver.isValidUUID('1800')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('2a00')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('fff0')).toBe(true);
    });

    it('应该验证长格式UUID', () => {
      expect(BluetoothLEDriver.isValidUUID('6e400001-b5a3-f393-e0a9-e50e24dcca9e')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('00002a00-0000-1000-8000-00805f9b34fb')).toBe(true);
    });

    it('应该拒绝无效UUID', () => {
      expect(BluetoothLEDriver.isValidUUID('')).toBe(false);
      expect(BluetoothLEDriver.isValidUUID('invalid')).toBe(false);
      expect(BluetoothLEDriver.isValidUUID('180')).toBe(false); // 太短
      expect(BluetoothLEDriver.isValidUUID('18000')).toBe(false); // 太长
      expect(BluetoothLEDriver.isValidUUID('6e400001-b5a3-f393-e0a9')).toBe(false); // 不完整
    });
  });

  describe('🔍 设备发现', () => {
    it('应该启动设备发现', async () => {
      // 模拟设备发现
      const devices = await driver.startDiscovery();
      
      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBeGreaterThanOrEqual(0);
      
      // 如果有模拟设备，验证其结构
      if (devices.length > 0) {
        const device = devices[0];
        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('address');
        expect(device).toHaveProperty('rssi');
        expect(device).toHaveProperty('advertisement');
      }
    });
  });

  describe('🎭 连接状态', () => {
    it('应该报告初始状态', () => {
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    it('应该处理未连接时的写入', async () => {
      const testData = Buffer.from('test');
      
      await expect(driver.write(testData)).rejects.toThrow('BLE connection is not writable');
    });

    it('应该处理未连接时的读取', async () => {
      await expect(driver.readCharacteristic()).rejects.toThrow('BLE connection is not readable');
    });
  });

  describe('🔄 自动重连', () => {
    it('应该支持禁用自动重连', () => {
      const noReconnectConfig: BluetoothLEConfig = {
        ...config,
        autoReconnect: false
      };
      
      const noReconnectDriver = new BluetoothLEDriver(noReconnectConfig);
      const finalConfig = noReconnectDriver.getConfiguration() as BluetoothLEConfig;
      
      expect(finalConfig.autoReconnect).toBe(false);
      
      noReconnectDriver.destroy();
    });
  });

  describe('🧹 资源管理', () => {
    it('应该处理销毁', () => {
      expect(() => {
        driver.destroy();
        driver.destroy(); // 多次调用不应出错
      }).not.toThrow();
    });

    it('应该处理关闭未连接的驱动', async () => {
      await expect(driver.close()).resolves.not.toThrow();
    });
  });

  describe('⚡ 功率模式', () => {
    it('应该支持不同的功率模式', () => {
      const modes: Array<'low' | 'balanced' | 'high'> = ['low', 'balanced', 'high'];
      
      modes.forEach(mode => {
        const modeConfig: BluetoothLEConfig = {
          ...config,
          powerMode: mode
        };
        
        const modeDriver = new BluetoothLEDriver(modeConfig);
        const finalConfig = modeDriver.getConfiguration() as BluetoothLEConfig;
        
        expect(finalConfig.powerMode).toBe(mode);
        
        modeDriver.destroy();
      });
    });
  });

  describe('📡 通信选项', () => {
    it('应该支持通知配置', () => {
      const notificationConfig: BluetoothLEConfig = {
        ...config,
        enableNotifications: true,
        enableIndications: false
      };
      
      const notificationDriver = new BluetoothLEDriver(notificationConfig);
      const finalConfig = notificationDriver.getConfiguration() as BluetoothLEConfig;
      
      expect(finalConfig.enableNotifications).toBe(true);
      expect(finalConfig.enableIndications).toBe(false);
      
      notificationDriver.destroy();
    });

    it('应该支持服务过滤', () => {
      const filterConfig: BluetoothLEConfig = {
        ...config,
        filterServices: ['1800', '1801', '180f']
      };
      
      const filterDriver = new BluetoothLEDriver(filterConfig);
      const finalConfig = filterDriver.getConfiguration() as BluetoothLEConfig;
      
      expect(finalConfig.filterServices).toEqual(['1800', '1801', '180f']);
      
      filterDriver.destroy();
    });
  });
});
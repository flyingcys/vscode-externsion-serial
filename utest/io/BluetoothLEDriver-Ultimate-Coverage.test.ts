/**
 * BluetoothLEDriver 蓝牙低功耗驱动 100% 覆盖度测试
 * 
 * 目标：实现BluetoothLEDriver完全覆盖
 * - 代码行覆盖率: 95%+
 * - 分支覆盖率: 95%+
 * - 函数覆盖率: 100%
 * - 测试所有BLE通信模式和边界条件
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothLEDriver, BluetoothLEConfig, BluetoothDeviceInfo } from '@extension/io/drivers/BluetoothLEDriver';
import { ConnectionConfig, BusType } from '@shared/types';

describe('BluetoothLEDriver 蓝牙LE驱动完全覆盖测试', () => {
  let driver: BluetoothLEDriver;
  let config: BluetoothLEConfig;

  beforeEach(async () => {
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

  describe('🏗️ 构造函数和初始化', () => {
    it('应该正确初始化基础属性', () => {
      expect(driver.busType).toBe(BusType.BluetoothLE);
      expect(driver.displayName).toBe('BLE test-device-001');
      expect(driver.getConfiguration().type).toBe(BusType.BluetoothLE);
    });

    it('应该正确应用默认配置', () => {
      const minimalConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'minimal-device',
        serviceUuid: '1800',
        characteristicUuid: '2a00'
      };

      const driverWithDefaults = new BluetoothLEDriver(minimalConfig);
      const finalConfig = driverWithDefaults.getConfiguration() as BluetoothLEConfig;

      expect(finalConfig.scanTimeout).toBe(10000);
      expect(finalConfig.connectionTimeout).toBe(15000);
      expect(finalConfig.reconnectInterval).toBe(5000);
      expect(finalConfig.autoReconnect).toBe(true);
      expect(finalConfig.autoDiscoverServices).toBe(true);
      expect(finalConfig.enableNotifications).toBe(true);
      expect(finalConfig.powerMode).toBe('balanced');

      driverWithDefaults.destroy();
    });

    it('应该处理连接设备时的显示名称变化', async () => {
      expect(driver.displayName).toBe('BLE test-device-001');
      
      // 模拟连接设备
      const mockDevice: BluetoothDeviceInfo = {
        id: 'test-device-001',
        name: 'Arduino Nano 33 BLE',
        address: '00:11:22:33:44:55',
        rssi: -45,
        advertisement: {
          localName: 'Arduino Nano 33 BLE',
          serviceUuids: ['180a', '180f']
        }
      };
      
      // 通过反射访问私有属性来测试显示名称变化
      (driver as any).connectedDevice = mockDevice;
      expect(driver.displayName).toBe('BLE Arduino Nano 33 BLE');
    });

    it('应该处理无设备名称时的显示名称', () => {
      const noNameConfig: BluetoothLEConfig = {
        ...config,
        deviceId: ''
      };

      const noNameDriver = new BluetoothLEDriver(noNameConfig);
      expect(noNameDriver.displayName).toBe('BLE Unknown');
      
      noNameDriver.destroy();
    });

    it('应该在无效配置时抛出错误', () => {
      const invalidConfig: BluetoothLEConfig = {
        ...config,
        serviceUuid: '' // 无效的服务UUID
      };

      expect(() => {
        new BluetoothLEDriver(invalidConfig);
      }).toThrow('Invalid BLE configuration');
    });
  });

  describe('🖥️ 操作系统支持', () => {
    it('应该正确检查操作系统支持', () => {
      const isSupported = BluetoothLEDriver.isOperatingSystemSupported();
      expect(typeof isSupported).toBe('boolean');
      
      // 测试实例方法
      expect(driver.isPlatformSupported()).toBe(isSupported);
    });

    it('应该在支持的平台上报告支持', () => {
      // 模拟不同的操作系统
      const originalPlatform = process.platform;
      
      // 测试支持的平台
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);
      
      Object.defineProperty(process, 'platform', { value: 'linux' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);
      
      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);
      
      // 恢复原始平台
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('📝 配置验证', () => {
    it('应该验证有效的BLE配置', () => {
      const validation = BluetoothLEDriver.validateConfiguration(config);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该检测所有无效配置场景', () => {
      // 测试缺少服务UUID
      let invalidConfig: BluetoothLEConfig = {
        ...config,
        serviceUuid: ''
      };
      let validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Service UUID is required');

      // 测试缺少特征UUID
      invalidConfig = {
        ...config,
        characteristicUuid: ''
      };
      validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Characteristic UUID is required');

      // 测试无效的服务UUID格式
      invalidConfig = {
        ...config,
        serviceUuid: 'invalid-uuid'
      };
      validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid service UUID format');

      // 测试无效的特征UUID格式
      invalidConfig = {
        ...config,
        characteristicUuid: 'not-a-uuid'
      };
      validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid characteristic UUID format');

      // 测试超时值过小
      invalidConfig = {
        ...config,
        scanTimeout: 50
      };
      validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Scan timeout must be at least 100ms');

      invalidConfig = {
        ...config,
        connectionTimeout: 50
      };
      validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Connection timeout must be at least 100ms');

      invalidConfig = {
        ...config,
        reconnectInterval: 50
      };
      validation = BluetoothLEDriver.validateConfiguration(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Reconnection interval must be at least 100ms');
    });

    it('应该在不支持的操作系统上报错', () => {
      const originalMethod = BluetoothLEDriver.isOperatingSystemSupported;
      BluetoothLEDriver.isOperatingSystemSupported = vi.fn().mockReturnValue(false);
      
      const validation = BluetoothLEDriver.validateConfiguration(config);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Bluetooth LE is not supported on this operating system');
      
      BluetoothLEDriver.isOperatingSystemSupported = originalMethod;
    });

    it('应该验证实例方法配置验证', () => {
      const validation = driver.validateConfiguration();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe('🔍 UUID验证', () => {
    it('应该验证所有有效的UUID格式', () => {
      // 短格式UUID
      expect(BluetoothLEDriver.isValidUUID('1800')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('2a00')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('fff0')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('ABCD')).toBe(true);
      
      // 长格式UUID
      expect(BluetoothLEDriver.isValidUUID('6e400001-b5a3-f393-e0a9-e50e24dcca9e')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('00002a00-0000-1000-8000-00805f9b34fb')).toBe(true);
      expect(BluetoothLEDriver.isValidUUID('12345678-1234-1234-1234-123456789ABC')).toBe(true);
      
      // 测试实例方法
      expect(driver.isValidUUID('1800')).toBe(true);
    });

    it('应该拒绝所有无效的UUID', () => {
      // 空值和无效字符串
      expect(BluetoothLEDriver.isValidUUID('')).toBe(false);
      expect(BluetoothLEDriver.isValidUUID('invalid')).toBe(false);
      expect(BluetoothLEDriver.isValidUUID('xyz')).toBe(false);
      
      // 错误长度
      expect(BluetoothLEDriver.isValidUUID('180')).toBe(false); // 太短
      expect(BluetoothLEDriver.isValidUUID('18000')).toBe(false); // 太长
      
      // 不完整的长格式
      expect(BluetoothLEDriver.isValidUUID('6e400001-b5a3-f393-e0a9')).toBe(false);
      expect(BluetoothLEDriver.isValidUUID('6e400001-b5a3-f393')).toBe(false);
      
      // 无效字符
      expect(BluetoothLEDriver.isValidUUID('gggg')).toBe(false);
      expect(BluetoothLEDriver.isValidUUID('6e400001-g5a3-f393-e0a9-e50e24dcca9e')).toBe(false);
    });
  });

  describe('🔍 设备发现', () => {
    it('应该成功启动设备发现', async () => {
      const devices = await driver.startDiscovery();
      
      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBe(4); // 基于mock实现的数量
      
      // 验证设备结构
      devices.forEach(device => {
        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('address');
        expect(device).toHaveProperty('rssi');
        expect(device).toHaveProperty('advertisement');
      });
    });

    it('应该在已经发现时抛出错误', async () => {
      // 通过反射设置isScanning状态
      (driver as any).isScanning = true;
      
      await expect(driver.startDiscovery()).rejects.toThrow('Discovery already in progress');
    });

    it('应该在不支持的操作系统上抛出错误', async () => {
      const originalMethod = BluetoothLEDriver.isOperatingSystemSupported;
      BluetoothLEDriver.isOperatingSystemSupported = vi.fn().mockReturnValue(false);
      
      await expect(driver.startDiscovery()).rejects.toThrow('Bluetooth LE is not supported on this operating system');
      
      BluetoothLEDriver.isOperatingSystemSupported = originalMethod;
    });

    it('应该获取发现的设备列表', async () => {
      await driver.startDiscovery();
      
      const discoveredDevices = driver.getDiscoveredDevices();
      expect(discoveredDevices.length).toBeGreaterThan(0);
    });

    it('应该处理发现过程中的错误', async () => {
      // 模拟发现过程中的错误
      const originalMethod = (driver as any).mockDeviceDiscovery;
      (driver as any).mockDeviceDiscovery = vi.fn().mockRejectedValue(new Error('Discovery failed'));
      
      await expect(driver.startDiscovery()).rejects.toThrow('Discovery failed');
    });
  });

  describe('🔗 连接管理', () => {
    it('应该成功建立BLE连接', async () => {
      // 预填充已发现的设备
      await driver.startDiscovery();
      
      let connectedEmitted = false;
      driver.on('connected', () => {
        connectedEmitted = true;
      });

      await driver.open();

      expect(driver.isOpen()).toBe(true);
      expect(connectedEmitted).toBe(true);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
      
      await driver.close();
    });

    it('应该处理设备不在缓存中的连接', async () => {
      // 不运行发现，直接连接
      await driver.open();
      
      expect(driver.isOpen()).toBe(true);
      
      await driver.close();
    });

    it('应该处理未找到设备的情况', async () => {
      const notFoundConfig: BluetoothLEConfig = {
        ...config,
        deviceId: 'non-existent-device'
      };
      
      const notFoundDriver = new BluetoothLEDriver(notFoundConfig);
      
      await expect(notFoundDriver.open()).rejects.toThrow('Device non-existent-device not found');
      
      notFoundDriver.destroy();
    });

    it('应该处理重复的连接请求', async () => {
      await driver.startDiscovery();
      
      const firstPromise = driver.open();
      const secondPromise = driver.open();
      
      // 第二次调用应该返回相同的promise
      expect(firstPromise).toBe(secondPromise);
      
      await firstPromise;
      
      expect(driver.isOpen()).toBe(true);
      
      await driver.close();
    });

    it('应该处理已连接时的打开请求', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 再次打开已连接的驱动应该立即返回
      await expect(driver.open()).resolves.not.toThrow();
      
      await driver.close();
    });

    it('应该处理连接过程中的错误', async () => {
      const errorConfig: BluetoothLEConfig = {
        ...config,
        connectionTimeout: 100 // 短超时以触发超时逻辑
      };
      
      const errorDriver = new BluetoothLEDriver(errorConfig);
      
      // 模拟连接错误（通过短超时）
      await expect(errorDriver.open()).rejects.toThrow();
      
      errorDriver.destroy();
    });

    it('应该处理连接时缺少设备ID', async () => {
      const noDeviceIdConfig: BluetoothLEConfig = {
        ...config,
        deviceId: ''
      };
      
      const noDeviceIdDriver = new BluetoothLEDriver(noDeviceIdConfig);
      
      await expect(noDeviceIdDriver.open()).rejects.toThrow('Device ID is required for BLE connection');
      
      noDeviceIdDriver.destroy();
    });

    it('应该处理连接过程中的正在连接状态', async () => {
      // 启动第一个连接，然后立即启动第二个
      await driver.startDiscovery();
      
      const firstPromise = driver.open();
      
      // 在连接进行时启动第二个连接，应该返回相同的promise
      const secondPromise = driver.open();
      
      expect(firstPromise).toBe(secondPromise);
      
      await firstPromise;
      expect(driver.isOpen()).toBe(true);
      
      await driver.close();
    });
  });

  describe('🔧 服务和特征发现', () => {
    it('应该成功发现服务和特征', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      const services = driver.getDiscoveredServices();
      expect(services.length).toBeGreaterThan(0);
      
      services.forEach(service => {
        expect(service).toHaveProperty('uuid');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('type');
        expect(service).toHaveProperty('characteristics');
      });
      
      await driver.close();
    });

    it('应该处理禁用自动服务发现', async () => {
      const manualConfig: BluetoothLEConfig = {
        ...config,
        autoDiscoverServices: false
      };
      
      const manualDriver = new BluetoothLEDriver(manualConfig);
      
      await manualDriver.startDiscovery();
      await manualDriver.open();
      
      expect(manualDriver.isOpen()).toBe(true);
      
      await manualDriver.close();
      manualDriver.destroy();
    });

    it('应该处理找不到特征的情况', async () => {
      const wrongCharConfig: BluetoothLEConfig = {
        ...config,
        characteristicUuid: '9999' // 不存在的特征UUID
      };
      
      const wrongCharDriver = new BluetoothLEDriver(wrongCharConfig);
      
      await wrongCharDriver.startDiscovery();
      await expect(wrongCharDriver.open()).rejects.toThrow('Characteristic 9999 not found');
      
      wrongCharDriver.destroy();
    });

    it('应该处理服务发现错误', async () => {
      await driver.startDiscovery();
      
      // 模拟服务发现错误
      const originalCreateMock = (driver as any).createMockPeripheral;
      (driver as any).createMockPeripheral = vi.fn().mockImplementation((device) => {
        const peripheral = originalCreateMock.call(driver, device);
        peripheral.discoverAllServicesAndCharacteristics = vi.fn().mockImplementation((callback) => {
          setTimeout(() => callback(new Error('Service discovery failed')), 10);
        });
        return peripheral;
      });
      
      await expect(driver.open()).rejects.toThrow();
    });
  });

  describe('📤 数据传输', () => {
    it('应该成功写入数据', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      const testData = Buffer.from('Hello BLE Device!');
      const bytesWritten = await driver.write(testData);
      
      expect(bytesWritten).toBe(testData.length);
      expect(driver.getStats().bytesSent).toBe(testData.length);
      
      await driver.close();
    });

    it('应该成功读取特征数据', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      const data = await driver.readCharacteristic();
      
      expect(Buffer.isBuffer(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      await driver.close();
    });

    it('应该拒绝在未连接时写入', async () => {
      const testData = Buffer.from('test data');
      
      await expect(driver.write(testData)).rejects.toThrow('BLE connection is not writable');
    });

    it('应该拒绝在未连接时读取', async () => {
      await expect(driver.readCharacteristic()).rejects.toThrow('BLE connection is not readable');
    });

    it('应该处理写入错误', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 模拟写入错误
      const currentChar = (driver as any).currentCharacteristic;
      currentChar.write = vi.fn().mockImplementation((data, withoutResponse, callback) => {
        setTimeout(() => callback(new Error('Write failed')), 10);
      });
      
      const testData = Buffer.from('test data');
      await expect(driver.write(testData)).rejects.toThrow('Write failed');
      
      await driver.close();
    });

    it('应该处理读取错误', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 模拟读取错误
      const currentChar = (driver as any).currentCharacteristic;
      currentChar.read = vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(new Error('Read failed')), 10);
      });
      
      await expect(driver.readCharacteristic()).rejects.toThrow('Read failed');
      
      await driver.close();
    });

    it('应该处理空数据读取', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 模拟空数据
      const currentChar = (driver as any).currentCharacteristic;
      currentChar.read = vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(undefined, undefined), 10);
      });
      
      await expect(driver.readCharacteristic()).rejects.toThrow('No data received');
      
      await driver.close();
    });

    it('应该处理没有可用特征的情况', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 清除当前特征
      (driver as any).currentCharacteristic = undefined;
      
      const testData = Buffer.from('test');
      await expect(driver.write(testData)).rejects.toThrow('No characteristic available for writing');
      await expect(driver.readCharacteristic()).rejects.toThrow('No characteristic available for reading');
      
      await driver.close();
    });
  });

  describe('🔔 通知管理', () => {
    it('应该成功启用通知', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 通知在open过程中已启用，验证状态
      expect(driver.isOpen()).toBe(true);
      
      await driver.close();
    });

    it('应该处理通知启用错误', async () => {
      const notifyConfig: BluetoothLEConfig = {
        ...config,
        characteristicUuid: '2a19' // 电池电量特征，支持通知
      };
      
      const notifyDriver = new BluetoothLEDriver(notifyConfig);
      
      await notifyDriver.startDiscovery();
      
      // 模拟通知订阅错误
      const originalCreateMock = (notifyDriver as any).createMockCharacteristic;
      (notifyDriver as any).createMockCharacteristic = vi.fn().mockImplementation((charInfo) => {
        const char = originalCreateMock.call(notifyDriver, charInfo);
        char.subscribe = vi.fn().mockImplementation((callback) => {
          setTimeout(() => callback(new Error('Subscribe failed')), 10);
        });
        return char;
      });
      
      await expect(notifyDriver.open()).rejects.toThrow();
      
      notifyDriver.destroy();
    });

    it('应该处理不支持通知的特征', async () => {
      const noNotifyConfig: BluetoothLEConfig = {
        ...config,
        characteristicUuid: '2a29', // 制造商名称，不支持通知
        enableNotifications: true
      };
      
      const noNotifyDriver = new BluetoothLEDriver(noNotifyConfig);
      
      await noNotifyDriver.startDiscovery();
      await noNotifyDriver.open();
      
      expect(noNotifyDriver.isOpen()).toBe(true);
      
      await noNotifyDriver.close();
      noNotifyDriver.destroy();
    });

    it('应该处理没有可用特征的通知', async () => {
      await driver.startDiscovery();
      
      // 模拟没有特征的情况
      const originalEnableNotifications = (driver as any).enableNotifications;
      (driver as any).enableNotifications = vi.fn().mockRejectedValue(new Error('No characteristic available'));
      
      await expect(driver.open()).rejects.toThrow();
    });
  });

  describe('🔄 自动重连功能', () => {
    it('应该支持启用和禁用自动重连', () => {
      // 启用自动重连（默认）
      let finalConfig = driver.getConfiguration() as BluetoothLEConfig;
      expect(finalConfig.autoReconnect).toBe(true);
      
      // 禁用自动重连
      const noReconnectConfig: BluetoothLEConfig = {
        ...config,
        autoReconnect: false
      };
      
      const noReconnectDriver = new BluetoothLEDriver(noReconnectConfig);
      finalConfig = noReconnectDriver.getConfiguration() as BluetoothLEConfig;
      expect(finalConfig.autoReconnect).toBe(false);
      
      noReconnectDriver.destroy();
    });

    it('应该在断开连接时启动重连', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 模拟连接断开
      const peripheral = (driver as any).currentPeripheral;
      if (peripheral) {
        peripheral.emit('disconnect');
        
        // 验证重连定时器被设置
        expect((driver as any).reconnectTimer).toBeTruthy();
      }
      
      await driver.close();
    });

    it('应该在禁用自动重连时不启动重连', async () => {
      const noReconnectConfig: BluetoothLEConfig = {
        ...config,
        autoReconnect: false
      };
      
      const noReconnectDriver = new BluetoothLEDriver(noReconnectConfig);
      
      await noReconnectDriver.startDiscovery();
      await noReconnectDriver.open();
      
      // 模拟连接断开
      const peripheral = (noReconnectDriver as any).currentPeripheral;
      if (peripheral) {
        peripheral.emit('disconnect');
        
        // 验证没有设置重连定时器
        expect((noReconnectDriver as any).reconnectTimer).toBeFalsy();
      }
      
      noReconnectDriver.destroy();
    });
  });

  describe('🎭 连接状态', () => {
    it('应该正确报告未连接状态', () => {
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    it('应该正确报告已连接状态', async () => {
      await driver.startDiscovery();
      await driver.open();

      expect(driver.isOpen()).toBe(true);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
      
      await driver.close();
      
      expect(driver.isOpen()).toBe(false);
    });

    it('应该获取BLE状态信息', async () => {
      const status = driver.getBluetoothStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('device');
      expect(status).toHaveProperty('services');
      expect(status).toHaveProperty('characteristic');
      expect(status).toHaveProperty('rssi');
      
      expect(status.connected).toBe(false);
      expect(status.services).toBe(0);
      expect(status.characteristic).toBe(config.characteristicUuid);
    });

    it('应该在连接后更新状态信息', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      const status = driver.getBluetoothStatus();
      
      expect(status.connected).toBe(true);
      expect(status.services).toBeGreaterThan(0);
      expect(status.device).toBeTruthy();
      
      await driver.close();
    });
  });

  describe('⚡ 功率模式', () => {
    it('应该支持所有功率模式', () => {
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
    it('应该支持通知和指示配置', () => {
      const commConfig: BluetoothLEConfig = {
        ...config,
        enableNotifications: false,
        enableIndications: true
      };
      
      const commDriver = new BluetoothLEDriver(commConfig);
      const finalConfig = commDriver.getConfiguration() as BluetoothLEConfig;
      
      expect(finalConfig.enableNotifications).toBe(false);
      expect(finalConfig.enableIndications).toBe(true);
      
      commDriver.destroy();
    });

    it('应该支持服务过滤配置', () => {
      const filterConfig: BluetoothLEConfig = {
        ...config,
        filterServices: ['180a', '180f', '1812']
      };
      
      const filterDriver = new BluetoothLEDriver(filterConfig);
      const finalConfig = filterDriver.getConfiguration() as BluetoothLEConfig;
      
      expect(finalConfig.filterServices).toEqual(['180a', '180f', '1812']);
      
      filterDriver.destroy();
    });
  });

  describe('🧹 资源管理', () => {
    it('应该正确关闭连接', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      expect(driver.isOpen()).toBe(true);
      
      await driver.close();
      
      expect(driver.isOpen()).toBe(false);
      expect((driver as any).currentPeripheral).toBeUndefined();
      expect((driver as any).currentCharacteristic).toBeUndefined();
      expect((driver as any).connectedDevice).toBeUndefined();
    });

    it('应该处理关闭未连接的驱动', async () => {
      await expect(driver.close()).resolves.not.toThrow();
    });

    it('应该处理没有disconnect方法的外围设备', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 模拟没有disconnect方法的外围设备
      const peripheral = (driver as any).currentPeripheral;
      if (peripheral) {
        delete peripheral.disconnect;
      }
      
      await expect(driver.close()).resolves.not.toThrow();
    });

    it('应该清理重连定时器', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      // 设置重连定时器
      (driver as any).reconnectTimer = setTimeout(() => {}, 1000);
      
      await driver.close();
      
      expect((driver as any).reconnectTimer).toBeUndefined();
    });

    it('应该处理多次销毁调用', () => {
      expect(() => {
        driver.destroy();
        driver.destroy();
        driver.destroy();
      }).not.toThrow();
    });

    it('应该在销毁时调用close', () => {
      const closeSpy = vi.spyOn(driver, 'close');
      
      driver.destroy();
      
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('⚠️ 错误处理', () => {
    it('应该处理各种错误场景', () => {
      expect(() => {
        driver.destroy();
      }).not.toThrow();
    });

    it('应该处理外围设备错误', async () => {
      await driver.startDiscovery();
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });
      
      // 模拟连接过程中的外围设备错误
      const connectPromise = driver.open();
      
      // 触发错误
      setTimeout(() => {
        const peripheral = (driver as any).currentPeripheral;
        if (peripheral) {
          peripheral.emit('error', new Error('Peripheral error'));
        }
      }, 100);
      
      await expect(connectPromise).rejects.toThrow('Peripheral error');
      expect(errorEmitted).toBe(true);
    });

    it('应该处理特征操作错误', async () => {
      await driver.startDiscovery();
      await driver.open();
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });
      
      // 模拟特征错误
      const characteristic = (driver as any).currentCharacteristic;
      if (characteristic) {
        characteristic.emit('error', new Error('Characteristic error'));
      }
      
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(errorEmitted).toBe(true);
      
      await driver.close();
    });
  });

  describe('🔧 Mock实现测试', () => {
    it('应该正确创建Mock外围设备', async () => {
      await driver.startDiscovery();
      
      const devices = driver.getDiscoveredDevices();
      const testDevice = devices[0];
      
      const peripheral = (driver as any).createMockPeripheral(testDevice);
      
      expect(peripheral).toHaveProperty('id');
      expect(peripheral).toHaveProperty('address');
      expect(peripheral).toHaveProperty('connect');
      expect(peripheral).toHaveProperty('disconnect');
      expect(peripheral.state).toBe('disconnected');
    });

    it('应该正确创建Mock特征', () => {
      const mockCharInfo = {
        uuid: '2a00',
        name: 'Device Name',
        properties: {
          read: true,
          write: true,
          writeWithoutResponse: false,
          notify: true,
          indicate: false
        }
      };
      
      const characteristic = (driver as any).createMockCharacteristic(mockCharInfo);
      
      expect(characteristic).toHaveProperty('uuid');
      expect(characteristic).toHaveProperty('name');
      expect(characteristic).toHaveProperty('read');
      expect(characteristic).toHaveProperty('write');
      expect(characteristic.uuid).toBe('2a00');
    });
  });
});
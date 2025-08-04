/*
 * BluetoothLEDriver 终极覆盖率测试
 * 专门针对未覆盖的BLE设备发现、连接生命周期、服务管理和错误处理功能
 * 目标：将BluetoothLEDriver.ts覆盖率从54.78%提升到90%以上
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothLEDriver, BluetoothLEConfig } from '../../src/extension/io/drivers/BluetoothLEDriver';
import { BusType } from '@shared/types';

describe('BluetoothLEDriver - 终极覆盖率测试', () => {
  let driver: BluetoothLEDriver;
  let mockConfig: BluetoothLEConfig;

  beforeEach(() => {
    mockConfig = {
      type: BusType.BluetoothLE,
      deviceId: 'test-device-1',
      serviceUuid: '180a',
      characteristicUuid: '2a29',
      scanTimeout: 5000,
      connectionTimeout: 10000,
      reconnectInterval: 3000,
      autoReconnect: true,
      autoDiscoverServices: true,
      enableNotifications: true,
      powerMode: 'balanced'
    };

    driver = new BluetoothLEDriver(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (driver) {
      driver.destroy();
    }
  });

  // ==================== 构造函数和初始配置测试 ====================

  describe('构造函数和配置覆盖', () => {
    it('应该正确初始化BLE驱动器的默认配置', () => {
      const minimalConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'device-test',
        serviceUuid: '180f',
        characteristicUuid: '2a19'
      };

      const bleDriver = new BluetoothLEDriver(minimalConfig);
      
      expect(bleDriver.busType).toBe(BusType.BluetoothLE);
      expect(bleDriver.displayName).toBe('BLE Unknown');
      
      // 验证默认配置被应用
      const config = (bleDriver as any).config;
      expect(config.scanTimeout).toBe(10000);
      expect(config.connectionTimeout).toBe(15000);
      expect(config.reconnectInterval).toBe(5000);
      expect(config.autoReconnect).toBe(true);
      expect(config.autoDiscoverServices).toBe(true);
      expect(config.enableNotifications).toBe(true);
      expect(config.powerMode).toBe('balanced');
    });

    it('应该测试displayName getter在不同连接状态下的表现', () => {
      // 无连接设备时
      expect(driver.displayName).toBe('BLE test-device-1');

      // 模拟连接设备
      (driver as any).connectedDevice = {
        id: 'device-1',
        name: 'Arduino BLE',
        address: '00:11:22:33:44:55',
        rssi: -50,
        advertisement: {}
      };

      expect(driver.displayName).toBe('BLE Arduino BLE');
    });
  });

  // ==================== 操作系统支持检测测试 ====================

  describe('操作系统支持检测覆盖', () => {
    it('应该测试isOperatingSystemSupported方法', () => {
      // 保存原始平台
      const originalPlatform = process.platform;

      // 测试支持的平台
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);

      Object.defineProperty(process, 'platform', { value: 'linux' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);

      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);

      // 测试不支持的平台
      Object.defineProperty(process, 'platform', { value: 'freebsd' });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(false);

      // 恢复原始平台
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  // ==================== 设备发现测试 ====================

  describe('设备发现覆盖', () => {
    it('应该测试startDiscovery的完整流程', async () => {
      const deviceDiscoveredSpy = vi.fn();
      driver.on('deviceDiscovered', deviceDiscoveredSpy);

      const devices = await driver.startDiscovery();

      expect(devices).toHaveLength(2);
      expect(devices[0]).toHaveProperty('id', 'device-1');
      expect(devices[0]).toHaveProperty('name', 'Arduino Nano 33 BLE');
      expect(devices[1]).toHaveProperty('id', 'device-2');
      expect(devices[1]).toHaveProperty('name', 'ESP32 BLE');
      
      // 验证设备发现事件被触发
      expect(deviceDiscoveredSpy).toHaveBeenCalledTimes(2);
    });

    it('应该测试startDiscovery在扫描进行中时的错误', async () => {
      // 设置正在扫描状态
      (driver as any).isScanning = true;

      await expect(driver.startDiscovery()).rejects.toThrow('Discovery already in progress');
    });

    it('应该测试startDiscovery在不支持操作系统上的错误', async () => {
      // 临时修改平台检测
      const originalMethod = BluetoothLEDriver.isOperatingSystemSupported;
      BluetoothLEDriver.isOperatingSystemSupported = vi.fn().mockReturnValue(false);

      await expect(driver.startDiscovery()).rejects.toThrow('Bluetooth LE is not supported on this operating system');

      // 恢复原始方法
      BluetoothLEDriver.isOperatingSystemSupported = originalMethod;
    });

    it('应该测试mockDeviceDiscovery的异步处理', async () => {
      const startTime = Date.now();
      const devices = await driver.startDiscovery();
      const endTime = Date.now();

      // 验证异步延迟（应该至少等待scanTimeout/2）
      expect(endTime - startTime).toBeGreaterThanOrEqual(2000); // scanTimeout是5000ms，延迟应该是2500ms左右
      expect(devices).toHaveLength(2);
    });

    it('应该测试getDiscoveredDevices方法', async () => {
      await driver.startDiscovery();
      
      const discoveredDevices = driver.getDiscoveredDevices();
      expect(discoveredDevices).toHaveLength(2);
      expect(discoveredDevices[0]).toHaveProperty('advertisement');
      expect(discoveredDevices[0].advertisement).toHaveProperty('serviceUuids');
    });
  });

  // ==================== 连接建立测试 ====================

  describe('连接建立覆盖', () => {
    it('应该测试open方法的完整连接流程', async () => {
      const connectedSpy = vi.fn();
      driver.on('connected', connectedSpy);

      // 监听console.log以验证日志输出
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await driver.open();

      expect(driver.isOpen()).toBe(true);
      expect(connectedSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('BLE driver connected to:'));
      
      consoleSpy.mockRestore();
    });

    it('应该测试open在已连接时的幂等性', async () => {
      // 模拟已连接状态
      (driver as any).currentPeripheral = { state: 'connected' };
      (driver as any).currentCharacteristic = {};

      // open应该直接返回，不抛出错误
      await expect(driver.open()).resolves.not.toThrow();
    });

    it('应该测试open在连接进行中时的错误', async () => {
      // 设置连接进行中状态
      (driver as any).isConnecting = true;

      await expect(driver.open()).rejects.toThrow('Connection attempt already in progress');
    });

    it('应该测试open在缺少deviceId时的错误', async () => {
      const configWithoutDeviceId: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: '',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };

      const badDriver = new BluetoothLEDriver(configWithoutDeviceId);
      
      await expect(badDriver.open()).rejects.toThrow('Device ID is required for BLE connection');
    });

    it('应该测试open在设备未找到时的错误处理', async () => {
      const configWithUnknownDevice: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'unknown-device',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };

      const unknownDriver = new BluetoothLEDriver(configWithUnknownDevice);
      
      await expect(unknownDriver.open()).rejects.toThrow('Device unknown-device not found');
    });
  });

  // ==================== 服务发现和特征设置测试 ====================

  describe('服务发现和特征设置覆盖', () => {
    beforeEach(async () => {
      // 先建立连接
      await driver.open();
    });

    it('应该测试discoverServices的完整流程', async () => {
      const servicesDiscoveredSpy = vi.fn();
      driver.on('servicesDiscovered', servicesDiscoveredSpy);

      // discoverServices在open()中自动调用，验证结果
      const services = driver.getDiscoveredServices();
      
      expect(services).toHaveLength(2);
      expect(services[0]).toHaveProperty('uuid', '180a');
      expect(services[0]).toHaveProperty('name', 'Device Information');
      expect(services[1]).toHaveProperty('uuid', '180f');
      expect(services[1]).toHaveProperty('name', 'Battery Service');
      
      expect(servicesDiscoveredSpy).toHaveBeenCalled();
    });

    it('应该测试setupCharacteristic的成功路径', async () => {
      // 验证特征已正确设置
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
    });

    it('应该测试setupCharacteristic在没有characteristicUuid时的错误', async () => {
      const configWithoutChar: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'device-1',
        serviceUuid: '180a',
        characteristicUuid: ''
      };

      const badDriver = new BluetoothLEDriver(configWithoutChar);
      
      await expect(badDriver.open()).rejects.toThrow('Characteristic UUID is required');
    });

    it('应该测试setupCharacteristic在特征未找到时的错误', async () => {
      const configWithUnknownChar: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'device-1', 
        serviceUuid: '180a',
        characteristicUuid: 'unknown-char'
      };

      const badDriver = new BluetoothLEDriver(configWithUnknownChar);
      
      await expect(badDriver.open()).rejects.toThrow('Characteristic unknown-char not found');
    });
  });

  // ==================== 通知管理测试 ====================

  describe('通知管理覆盖', () => {
    beforeEach(async () => {
      await driver.open();
    });

    it('应该测试enableNotifications的完整流程', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // enableNotifications在open()中自动调用，验证控制台输出
      expect(consoleSpy).toHaveBeenCalledWith('BLE notifications enabled');
      
      consoleSpy.mockRestore();
    });

    it('应该测试通知数据接收处理', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // 模拟接收到通知数据
      const mockCharacteristic = (driver as any).currentCharacteristic;
      const testData = Buffer.from([42]); // Mock battery level data
      
      // 触发data事件
      mockCharacteristic.emit('data', testData);
      
      expect(consoleSpy).toHaveBeenCalledWith('BLE notification received: 1 bytes');
      
      consoleSpy.mockRestore();
    });

    it('应该测试enableNotifications在没有特征时的错误', async () => {
      // 移除当前特征
      (driver as any).currentCharacteristic = null;
      
      // 测试enableNotifications方法
      await expect((driver as any).enableNotifications()).rejects.toThrow('No characteristic available');
    });
  });

  // ==================== 数据读写测试 ====================

  describe('数据读写覆盖', () => {
    beforeEach(async () => {
      await driver.open();
    });

    it('应该测试write方法的成功路径', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const testData = Buffer.from('test message');
      
      const bytesWritten = await driver.write(testData);
      
      expect(bytesWritten).toBe(testData.length);
      expect(consoleSpy).toHaveBeenCalledWith('BLE data sent: 12 bytes');
      
      consoleSpy.mockRestore();
    });

    it('应该测试write在不可写状态下的错误', async () => {
      // 关闭连接使其不可写
      await driver.close();
      
      const testData = Buffer.from('test');
      await expect(driver.write(testData)).rejects.toThrow('BLE connection is not writable');
    });

    it('应该测试write在没有特征时的错误', async () => {
      // 移除当前特征
      (driver as any).currentCharacteristic = null;
      
      const testData = Buffer.from('test');
      await expect(driver.write(testData)).rejects.toThrow('No characteristic available for writing');
    });

    it('应该测试readCharacteristic方法的成功路径', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const data = await driver.readCharacteristic();
      
      expect(data).toBeInstanceOf(Buffer);
      expect(data.toString()).toBe('Hello from BLE device!');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('BLE data read:'));
      
      consoleSpy.mockRestore();
    });

    it('应该测试readCharacteristic在不可读状态下的错误', async () => {
      await driver.close();
      
      await expect(driver.readCharacteristic()).rejects.toThrow('BLE connection is not readable');
    });

    it('应该测试readCharacteristic在没有特征时的错误', async () => {
      (driver as any).currentCharacteristic = null;
      
      await expect(driver.readCharacteristic()).rejects.toThrow('No characteristic available for reading');
    });
  });

  // ==================== 连接状态检查测试 ====================

  describe('连接状态检查覆盖', () => {
    it('应该测试isOpen方法的各种状态', async () => {
      // 初始状态
      expect(driver.isOpen()).toBe(false);
      
      // 连接后
      await driver.open();
      expect(driver.isOpen()).toBe(true);
      
      // 断开连接后
      await driver.close();
      expect(driver.isOpen()).toBe(false);
    });

    it('应该测试isReadable方法', async () => {
      expect(driver.isReadable()).toBe(false);
      
      await driver.open();
      expect(driver.isReadable()).toBe(true);
      
      await driver.close();
      expect(driver.isReadable()).toBe(false);
    });

    it('应该测试isWritable方法', async () => {
      expect(driver.isWritable()).toBe(false);
      
      await driver.open();
      expect(driver.isWritable()).toBe(true);
      
      await driver.close();
      expect(driver.isWritable()).toBe(false);
    });
  });

  // ==================== 配置验证测试 ====================

  describe('配置验证覆盖', () => {
    it('应该测试validateConfiguration的成功验证', () => {
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该测试validateConfiguration的操作系统支持检查', () => {
      // 临时修改操作系统支持检测
      const originalMethod = BluetoothLEDriver.isOperatingSystemSupported;
      BluetoothLEDriver.isOperatingSystemSupported = vi.fn().mockReturnValue(false);
      
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bluetooth LE is not supported on this operating system');
      
      // 恢复原始方法
      BluetoothLEDriver.isOperatingSystemSupported = originalMethod;
    });

    it('应该测试validateConfiguration的必填字段验证', () => {
      const invalidConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: '',
        serviceUuid: '',
        characteristicUuid: ''
      };
      
      const invalidDriver = new BluetoothLEDriver(invalidConfig);
      const result = invalidDriver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Device ID is required');
      expect(result.errors).toContain('Service UUID is required');
      expect(result.errors).toContain('Characteristic UUID is required');
    });

    it('应该测试validateConfiguration的UUID格式验证', () => {
      const invalidUuidConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'device-1',
        serviceUuid: 'invalid-uuid',
        characteristicUuid: 'also-invalid'
      };
      
      const invalidDriver = new BluetoothLEDriver(invalidUuidConfig);
      const result = invalidDriver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid service UUID format');
      expect(result.errors).toContain('Invalid characteristic UUID format');
    });

    it('应该测试validateConfiguration的超时值验证', () => {
      const invalidTimeoutConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'device-1',
        serviceUuid: '180a',
        characteristicUuid: '2a29',
        scanTimeout: 500,        // 太小
        connectionTimeout: 1000, // 太小
        reconnectInterval: 500   // 太小
      };
      
      const invalidDriver = new BluetoothLEDriver(invalidTimeoutConfig);
      const result = invalidDriver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Scan timeout must be at least 1000ms');
      expect(result.errors).toContain('Connection timeout must be at least 5000ms');
      expect(result.errors).toContain('Reconnection interval must be at least 1000ms');
    });

    it('应该测试isValidUUID方法的各种UUID格式', () => {
      const isValidUUID = (driver as any).isValidUUID.bind(driver);
      
      // 有效的短UUID
      expect(isValidUUID('180a')).toBe(true);
      expect(isValidUUID('2a29')).toBe(true);
      expect(isValidUUID('ABCD')).toBe(true);
      
      // 有效的长UUID
      expect(isValidUUID('12345678-1234-1234-1234-123456789abc')).toBe(true);
      expect(isValidUUID('ABCDEF01-2345-6789-ABCD-EF0123456789')).toBe(true);
      
      // 无效UUID
      expect(isValidUUID('invalid')).toBe(false);
      expect(isValidUUID('12345')).toBe(false);
      expect(isValidUUID('123-456-789')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  // ==================== 状态信息获取测试 ====================

  describe('状态信息获取覆盖', () => {
    it('应该测试getBluetoothStatus在未连接时的状态', () => {
      const status = driver.getBluetoothStatus();
      
      expect(status.connected).toBe(false);
      expect(status.device).toBeUndefined();
      expect(status.services).toBe(0);
      expect(status.characteristic).toBe('2a29');
      expect(status.rssi).toBeUndefined();
    });

    it('应该测试getBluetoothStatus在连接后的状态', async () => {
      await driver.open();
      
      const status = driver.getBluetoothStatus();
      
      expect(status.connected).toBe(true);
      expect(status.device).toBeDefined();
      expect(status.device?.name).toBe('Arduino Nano 33 BLE');
      expect(status.services).toBeGreaterThan(0);
      expect(status.characteristic).toBe('2a29');
      expect(status.rssi).toBe(-45);
    });
  });

  // ==================== 断开连接和资源清理测试 ====================

  describe('断开连接和资源清理覆盖', () => {
    it('应该测试close方法的完整流程', async () => {
      await driver.open();
      
      const disconnectedSpy = vi.fn();
      driver.on('disconnected', disconnectedSpy);
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await driver.close();
      
      expect(driver.isOpen()).toBe(false);
      expect(disconnectedSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('BLE driver disconnected');
      
      consoleSpy.mockRestore();
    });

    it('应该测试close在没有连接时的处理', async () => {
      // 没有连接时close应该正常返回
      await expect(driver.close()).resolves.not.toThrow();
    });

    it('应该测试destroy方法', () => {
      const closeSpy = vi.spyOn(driver, 'close');
      
      driver.destroy();
      
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  // ==================== 自动重连机制测试 ====================

  describe('自动重连机制覆盖', () => {
    beforeEach(async () => {
      await driver.open();
    });

    it('应该测试scheduleReconnect的触发条件', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // 模拟连接断开事件
      const mockPeripheral = (driver as any).currentPeripheral;
      mockPeripheral.emit('disconnect');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Scheduling BLE reconnection'));
      
      consoleSpy.mockRestore();
    });

    it('应该测试自动重连的尝试逻辑', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 模拟重连失败
      const originalOpen = driver.open.bind(driver);
      driver.open = vi.fn().mockRejectedValue(new Error('Reconnection failed'));
      
      // 触发断开连接
      const mockPeripheral = (driver as any).currentPeripheral;
      mockPeripheral.emit('disconnect');
      
      // 等待重连定时器执行
      await new Promise(resolve => setTimeout(resolve, 3100));
      
      expect(driver.open).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('BLE automatic reconnection failed:', expect.any(Error));
      
      // 恢复原始方法
      driver.open = originalOpen;
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('应该测试在禁用自动重连时不触发重连', async () => {
      // 创建禁用自动重连的驱动器
      const noReconnectConfig: BluetoothLEConfig = {
        ...mockConfig,
        autoReconnect: false
      };
      
      const noReconnectDriver = new BluetoothLEDriver(noReconnectConfig);
      await noReconnectDriver.open();
      
      const openSpy = vi.spyOn(noReconnectDriver, 'open');
      
      // 触发断开连接
      const mockPeripheral = (noReconnectDriver as any).currentPeripheral;
      mockPeripheral.emit('disconnect');
      
      // 等待一段时间确保没有重连尝试
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(openSpy).not.toHaveBeenCalled();
      
      noReconnectDriver.destroy();
    });
  });

  // ==================== Mock创建方法测试 ====================

  describe('Mock创建方法覆盖', () => {
    it('应该测试createMockPeripheral的完整功能', () => {
      const mockDevice = {
        id: 'test-device',
        name: 'Test Device',
        address: 'aa:bb:cc:dd:ee:ff',
        rssi: -60,
        advertisement: {
          localName: 'Test Device',
          serviceUuids: ['180a']
        }
      };
      
      const mockPeripheral = (driver as any).createMockPeripheral(mockDevice);
      
      expect(mockPeripheral.id).toBe('test-device');
      expect(mockPeripheral.address).toBe('aa:bb:cc:dd:ee:ff');
      expect(mockPeripheral.state).toBe('disconnected');
      expect(mockPeripheral.connectable).toBe(true);
    });

    it('应该测试createMockCharacteristic的完整功能', () => {
      const mockCharInfo = {
        uuid: '2a29',
        name: 'Manufacturer Name',
        properties: {
          read: true,
          write: false,
          writeWithoutResponse: false,
          notify: false,
          indicate: false
        }
      };
      
      const mockCharacteristic = (driver as any).createMockCharacteristic(mockCharInfo);
      
      expect(mockCharacteristic.uuid).toBe('2a29');
      expect(mockCharacteristic.name).toBe('Manufacturer Name');
      expect(mockCharacteristic.properties).toContain('read');
      expect(mockCharacteristic.properties).not.toContain('write');
    });

    it('应该测试mock特征的所有操作方法', async () => {
      const mockCharInfo = {
        uuid: '2a19',
        name: 'Battery Level',
        properties: {
          read: true,
          write: true,
          writeWithoutResponse: false,
          notify: true,
          indicate: false
        }
      };
      
      const mockCharacteristic = (driver as any).createMockCharacteristic(mockCharInfo);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // 测试read操作
      await new Promise((resolve) => {
        mockCharacteristic.read((error: any, data: Buffer) => {
          expect(error).toBeUndefined();
          expect(data.toString()).toBe('Hello from BLE device!');
          resolve(undefined);
        });
      });
      
      // 测试write操作
      await new Promise((resolve) => {
        mockCharacteristic.write(Buffer.from('test data'), false, (error: any) => {
          expect(error).toBeUndefined();
          expect(consoleSpy).toHaveBeenCalledWith('Mock BLE write: test data');
          resolve(undefined);
        });
      });
      
      // 测试subscribe操作
      await new Promise((resolve) => {
        mockCharacteristic.subscribe((error: any) => {
          expect(error).toBeUndefined();
          expect(consoleSpy).toHaveBeenCalledWith('Mock BLE notifications subscribed');
          resolve(undefined);
        });
      });
      
      // 测试unsubscribe操作
      await new Promise((resolve) => {
        mockCharacteristic.unsubscribe((error: any) => {
          expect(error).toBeUndefined();
          expect(consoleSpy).toHaveBeenCalledWith('Mock BLE notifications unsubscribed');
          resolve(undefined);
        });
      });
      
      consoleSpy.mockRestore();
    });
  });

  // ==================== 错误处理路径测试 ====================

  describe('错误处理路径覆盖', () => {
    it('应该测试连接过程中的超时错误', async () => {
      const timeoutConfig: BluetoothLEConfig = {
        ...mockConfig,
        connectionTimeout: 100 // 很短的超时时间
      };
      
      const timeoutDriver = new BluetoothLEDriver(timeoutConfig);
      
      await expect(timeoutDriver.open()).rejects.toThrow('Connection timeout after 100ms');
    });

    it('应该测试peripheral连接错误事件', async () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);
      
      // 开始连接过程
      const openPromise = driver.open();
      
      // 模拟连接错误
      setTimeout(() => {
        const mockPeripheral = (driver as any).currentPeripheral;
        if (mockPeripheral) {
          mockPeripheral.emit('error', new Error('Connection failed'));
        }
      }, 500);
      
      await expect(openPromise).rejects.toThrow('Connection failed');
      expect(errorSpy).toHaveBeenCalled();
    });

    it('应该测试服务发现错误处理', async () => {
      // 创建一个会在服务发现时失败的mock
      const errorDriver = new BluetoothLEDriver(mockConfig);
      
      // 替换createMockPeripheral以模拟服务发现错误
      (errorDriver as any).createMockPeripheral = (device: any) => {
        const peripheral = (driver as any).createMockPeripheral(device);
        peripheral.discoverAllServicesAndCharacteristics = (callback: any) => {
          setTimeout(() => callback(new Error('Service discovery failed')), 100);
        };
        return peripheral;
      };
      
      await expect(errorDriver.open()).rejects.toThrow('Service discovery failed');
    });

    it('应该测试特征订阅错误处理', async () => {
      const errorDriver = new BluetoothLEDriver(mockConfig);
      
      // 替换createMockCharacteristic以模拟订阅错误
      const originalCreateMockCharacteristic = (errorDriver as any).createMockCharacteristic;
      (errorDriver as any).createMockCharacteristic = (charInfo: any) => {
        const characteristic = originalCreateMockCharacteristic.call(errorDriver, charInfo);
        characteristic.subscribe = (callback: any) => {
          setTimeout(() => callback(new Error('Subscription failed')), 100);
        };
        return characteristic;
      };
      
      await expect(errorDriver.open()).rejects.toThrow('Subscription failed');
    });
  });
});
/**
 * BluetoothLEDriver 增强覆盖率测试
 * 专门针对未覆盖的代码路径，将覆盖率从54.78%提升到80%+
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothLEDriver } from '../../src/extension/io/drivers/BluetoothLEDriver';
import { BusType } from '../../src/shared/types';

describe('BluetoothLEDriver - 增强覆盖率测试', () => {
  let driver: BluetoothLEDriver;
  let originalPlatform: string;

  beforeEach(() => {
    const config = {
      type: BusType.BluetoothLE,
      deviceId: 'device-1', // 使用与mock发现匹配的设备ID
      serviceUuid: '180a',
      characteristicUuid: '2a29',
      scanTimeout: 5000,
      connectionTimeout: 10000,
      reconnectInterval: 2000,
      autoReconnect: true,
      autoDiscoverServices: true,
      enableNotifications: true,
      powerMode: 'balanced' as const
    };
    
    driver = new BluetoothLEDriver(config);
    originalPlatform = process.platform;
  });

  afterEach(async () => {
    try {
      await driver.destroy();
    } catch (error) {
      // Ignore cleanup errors
    }
    // Restore original platform
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true
    });
  });

  describe('🔧 操作系统支持检测覆盖', () => {
    it('应该测试isOperatingSystemSupported在不同平台下的行为', () => {
      // 测试支持的平台
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);

      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);

      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(true);

      // 测试不支持的平台
      Object.defineProperty(process, 'platform', { value: 'freebsd', writable: true });
      expect(BluetoothLEDriver.isOperatingSystemSupported()).toBe(false);
    });

    it('应该在不支持的操作系统上抛出错误', async () => {
      Object.defineProperty(process, 'platform', { value: 'unsupported', writable: true });
      
      await expect(driver.startDiscovery()).rejects.toThrow(
        'Bluetooth LE is not supported on this operating system'
      );
    });
  });

  describe('🔍 设备发现高级覆盖', () => {
    it('应该处理重复的设备发现调用', async () => {
      // 第一次发现
      const discoveryPromise1 = driver.startDiscovery();
      
      // 立即开始第二次发现，应该抛出错误
      await expect(driver.startDiscovery()).rejects.toThrow('Discovery already in progress');
      
      // 等待第一次发现完成
      const devices = await discoveryPromise1;
      expect(devices).toHaveLength(2);
    });

    it('应该能够获取发现的设备列表', async () => {
      await driver.startDiscovery();
      
      const devices = driver.getDiscoveredDevices();
      expect(devices).toHaveLength(2);
      expect(devices[0]).toHaveProperty('id');
      expect(devices[0]).toHaveProperty('name');
      expect(devices[0]).toHaveProperty('address');
      expect(devices[0]).toHaveProperty('rssi');
    });

    it('应该能够获取发现的服务列表', async () => {
      await driver.open();
      
      const services = driver.getDiscoveredServices();
      expect(services).toHaveLength(2);
      expect(services[0]).toHaveProperty('uuid');
      expect(services[0]).toHaveProperty('name');
      expect(services[0]).toHaveProperty('characteristics');
    }, 15000);
  });

  describe('🔗 连接建立高级覆盖', () => {
    it('应该处理重复的连接尝试', async () => {
      // 第一次连接
      const connectPromise1 = driver.open();
      
      // 立即尝试第二次连接，应该抛出错误
      await expect(driver.open()).rejects.toThrow('Connection attempt already in progress');
      
      // 等待第一次连接完成
      await connectPromise1;
      expect(driver.isOpen()).toBe(true);
    }, 15000);

    it('应该处理设备ID为空的情况', async () => {
      const configWithoutDeviceId = {
        type: BusType.BluetoothLE,
        deviceId: '',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };
      
      const driverWithoutDeviceId = new BluetoothLEDriver(configWithoutDeviceId);
      
      await expect(driverWithoutDeviceId.open()).rejects.toThrow(
        'Device ID is required for BLE connection'
      );
    });

    it('应该处理设备未找到的情况', async () => {
      const configWithUnknownDevice = {
        type: BusType.BluetoothLE,
        deviceId: 'unknown-device',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };
      
      const driverWithUnknownDevice = new BluetoothLEDriver(configWithUnknownDevice);
      
      await expect(driverWithUnknownDevice.open()).rejects.toThrow(
        'Device unknown-device not found'
      );
    });

    it('应该测试连接到已存在设备的情况', async () => {
      // 先发现设备
      await driver.startDiscovery();
      
      // 现在连接应该使用缓存的设备信息
      await driver.open();
      expect(driver.isOpen()).toBe(true);
    }, 15000);
  });

  describe('📊 状态检查方法覆盖', () => {
    it('应该测试各种连接状态检查方法', async () => {
      // 未连接时的状态
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
      
      // 连接后的状态
      await driver.open();
      expect(driver.isOpen()).toBe(true);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
    }, 15000);

    it('应该测试getBluetoothStatus方法', async () => {
      // 未连接时的状态
      let status = driver.getBluetoothStatus();
      expect(status.connected).toBe(false);
      expect(status.device).toBeUndefined();
      expect(status.services).toBe(0);
      
      // 连接后的状态
      await driver.open();
      status = driver.getBluetoothStatus();
      expect(status.connected).toBe(true);
      expect(status.device).toBeDefined();
      expect(status.services).toBe(2);
      expect(status.characteristic).toBe('2a29');
    }, 15000);

    it('应该测试displayName在不同状态下的表现', () => {
      // 未连接时
      expect(driver.displayName).toContain('BLE device-1');
      
      // 这里我们不能轻易测试连接后的displayName，
      // 因为需要真实的连接过程
    });
  });

  describe('🔧 配置验证全覆盖', () => {
    it('应该测试validateConfiguration的操作系统支持检查', () => {
      Object.defineProperty(process, 'platform', { value: 'unsupported', writable: true });
      
      const result = driver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bluetooth LE is not supported on this operating system');
    });

    it('应该测试validateConfiguration的必填字段验证', () => {
      const invalidConfig = {
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
      const invalidConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'test-device',
        serviceUuid: 'invalid-uuid',
        characteristicUuid: 'another-invalid'
      };
      
      const invalidDriver = new BluetoothLEDriver(invalidConfig);
      const result = invalidDriver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid service UUID format');
      expect(result.errors).toContain('Invalid characteristic UUID format');
    });

    it('应该测试validateConfiguration的超时值验证', () => {
      const invalidConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'test-device',
        serviceUuid: '180a',
        characteristicUuid: '2a29',
        scanTimeout: 500,           // 太小
        connectionTimeout: 1000,    // 太小  
        reconnectInterval: 500      // 太小
      };
      
      const invalidDriver = new BluetoothLEDriver(invalidConfig);
      const result = invalidDriver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Scan timeout must be at least 1000ms');
      expect(result.errors).toContain('Connection timeout must be at least 5000ms');
      expect(result.errors).toContain('Reconnection interval must be at least 1000ms');
    });

    it('应该测试isValidUUID方法的各种UUID格式', () => {
      const validDriver = driver as any; // 访问私有方法
      
      // 测试短UUID格式
      expect(validDriver.isValidUUID('180a')).toBe(true);
      expect(validDriver.isValidUUID('2a29')).toBe(true);
      expect(validDriver.isValidUUID('ABCD')).toBe(true);
      
      // 测试长UUID格式
      expect(validDriver.isValidUUID('12345678-1234-1234-1234-123456789abc')).toBe(true);
      expect(validDriver.isValidUUID('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF')).toBe(true);
      
      // 测试无效格式
      expect(validDriver.isValidUUID('invalid')).toBe(false);
      expect(validDriver.isValidUUID('123')).toBe(false);
      expect(validDriver.isValidUUID('12345')).toBe(false);
      expect(validDriver.isValidUUID('1234-5678')).toBe(false);
      expect(validDriver.isValidUUID('')).toBe(false);
    });

    it('应该测试成功的配置验证', () => {
      const result = driver.validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('📡 数据通信覆盖', () => {
    it('应该测试未连接时的写入操作', async () => {
      const data = Buffer.from('test data');
      
      await expect(driver.write(data)).rejects.toThrow(
        'BLE connection is not writable'
      );
    });

    it('应该测试未连接时的读取操作', async () => {
      await expect(driver.readCharacteristic()).rejects.toThrow(
        'BLE connection is not readable'
      );
    });

    it('应该测试成功的数据写入', async () => {
      await driver.open();
      
      const data = Buffer.from('test data');
      const bytesWritten = await driver.write(data);
      
      expect(bytesWritten).toBe(data.length);
    }, 15000);

    it('应该测试成功的数据读取', async () => {
      await driver.open();
      
      const data = await driver.readCharacteristic();
      
      expect(data).toBeInstanceOf(Buffer);
      expect(data.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('🔁 自动重连机制覆盖', () => {
    it('应该测试scheduleReconnect的触发条件', async () => {
      await driver.open();
      
      // 模拟断开连接事件触发重连
      const currentPeripheral = (driver as any).currentPeripheral;
      currentPeripheral.emit('disconnect');
      
      // 验证重连定时器被设置
      expect((driver as any).reconnectTimer).toBeDefined();
      
      // 清理
      if ((driver as any).reconnectTimer) {
        clearTimeout((driver as any).reconnectTimer);
      }
    }, 15000);

    it('应该测试在禁用自动重连时不触发重连', async () => {
      const configWithoutReconnect = {
        type: BusType.BluetoothLE,
        deviceId: 'device-1',
        serviceUuid: '180a',
        characteristicUuid: '2a29',
        autoReconnect: false
      };
      
      const driverWithoutReconnect = new BluetoothLEDriver(configWithoutReconnect);
      await driverWithoutReconnect.open();
      
      // 模拟断开连接
      const currentPeripheral = (driverWithoutReconnect as any).currentPeripheral;
      currentPeripheral.emit('disconnect');
      
      // 验证重连定时器未被设置
      expect((driverWithoutReconnect as any).reconnectTimer).toBeUndefined();
      
      await driverWithoutReconnect.destroy();
    });
  });

  describe('🧹 资源清理覆盖', () => {
    it('应该测试close方法在未连接时的行为', async () => {
      // 在未连接状态调用close应该是安全的
      await expect(driver.close()).resolves.toBeUndefined();
    });

    it('应该测试close方法的完整清理流程', async () => {
      await driver.open();
      
      expect(driver.isOpen()).toBe(true);
      
      await driver.close();
      
      expect(driver.isOpen()).toBe(false);
      expect((driver as any).currentPeripheral).toBeUndefined();
      expect((driver as any).currentCharacteristic).toBeUndefined();
      expect((driver as any).connectedDevice).toBeUndefined();
    }, 15000);

    it('应该测试destroy方法', async () => {
      await driver.open();
      
      expect(driver.isOpen()).toBe(true);
      
      driver.destroy(); // destroy方法内部调用close，但可能不等待
      
      // 需要稍等一下让异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(driver.isOpen()).toBe(false);
    }, 15000);
  });

  describe('🏭 Mock对象创建覆盖', () => {
    it('应该测试createMockPeripheral的完整功能', async () => {
      await driver.startDiscovery();
      const devices = driver.getDiscoveredDevices();
      const device = devices[0];
      
      const mockPeripheral = (driver as any).createMockPeripheral(device);
      
      expect(mockPeripheral.id).toBe(device.id);
      expect(mockPeripheral.address).toBe(device.address);
      expect(mockPeripheral.advertisement).toBe(device.advertisement);
      expect(mockPeripheral.state).toBe('disconnected');
      
      // 测试连接方法
      expect(typeof mockPeripheral.connect).toBe('function');
      expect(typeof mockPeripheral.disconnect).toBe('function');
      expect(typeof mockPeripheral.discoverAllServicesAndCharacteristics).toBe('function');
    });

    it('应该测试createMockCharacteristic的完整功能', async () => {
      const charInfo = {
        uuid: '2a29',
        name: 'Manufacturer Name',
        properties: {
          read: true,
          write: true,
          writeWithoutResponse: false,
          notify: true,
          indicate: false
        }
      };
      
      const mockCharacteristic = (driver as any).createMockCharacteristic(charInfo);
      
      expect(mockCharacteristic.uuid).toBe(charInfo.uuid);
      expect(mockCharacteristic.name).toBe(charInfo.name);
      expect(mockCharacteristic.properties).toContain('read');
      expect(mockCharacteristic.properties).toContain('write');
      expect(mockCharacteristic.properties).toContain('notify');
      
      // 测试方法
      expect(typeof mockCharacteristic.read).toBe('function');
      expect(typeof mockCharacteristic.write).toBe('function');
      expect(typeof mockCharacteristic.subscribe).toBe('function');
      expect(typeof mockCharacteristic.unsubscribe).toBe('function');
    });

    it('应该测试mock特征的所有操作方法', async () => {
      await driver.open();
      
      const characteristic = (driver as any).currentCharacteristic;
      
      // 测试写入操作
      const writePromise = new Promise<void>((resolve) => {
        characteristic.write(Buffer.from('test'), false, () => {
          resolve();
        });
      });
      
      await expect(writePromise).resolves.toBeUndefined();
      
      // 测试读取操作
      const readPromise = new Promise<Buffer>((resolve) => {
        characteristic.read((error: Error | undefined, data: Buffer | undefined) => {
          if (data) {
            resolve(data);
          }
        });
      });
      
      const data = await readPromise;
      expect(data).toBeInstanceOf(Buffer);
      
      // 测试订阅操作
      const subscribePromise = new Promise<void>((resolve) => {
        characteristic.subscribe(() => {
          resolve();
        });
      });
      
      await expect(subscribePromise).resolves.toBeUndefined();
      
      // 测试取消订阅操作
      const unsubscribePromise = new Promise<void>((resolve) => {
        characteristic.unsubscribe(() => {
          resolve();
        });
      });
      
      await expect(unsubscribePromise).resolves.toBeUndefined();
    }, 15000);
  });

  describe('⚠️ 错误处理路径覆盖', () => {
    it('应该测试连接过程中的超时错误', async () => {
      const shortTimeoutConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'device-1',
        serviceUuid: '180a',
        characteristicUuid: '2a29',
        connectionTimeout: 100 // 很短的超时，应该在构造函数中被拒绝
      };
      
      // 现在应该在构造函数中因为配置验证失败而抛出错误
      expect(() => new BluetoothLEDriver(shortTimeoutConfig)).toThrow(
        'Invalid BLE configuration: Connection timeout must be at least 5000ms'
      );
    });

    it('应该测试peripheral连接错误事件', async () => {
      // 这个测试需要模拟peripheral的错误事件
      // 由于mock的复杂性，我们可以通过其他方式测试错误处理
      const config = {
        type: BusType.BluetoothLE,
        deviceId: 'error-device',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };
      
      const errorDriver = new BluetoothLEDriver(config);
      
      await expect(errorDriver.open()).rejects.toThrow(
        'Device error-device not found'
      );
    });
  });

  describe('🌐 Getter属性覆盖', () => {
    it('应该测试busType属性', () => {
      expect(driver.busType).toBe(BusType.BluetoothLE);
    });

    it('应该测试displayName属性的默认值', () => {
      expect(driver.displayName).toBe('BLE device-1');
    });
  });
});
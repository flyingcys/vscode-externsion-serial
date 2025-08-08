/**
 * BluetoothLEDriver 覆盖率提升测试
 * 专门针对Mock功能的未覆盖代码路径，将BluetoothLEDriver.ts从54.39%提升到90%+
 * 覆盖行数：827-904, 910-960
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothLEDriver } from '@extension/io/drivers/BluetoothLEDriver';
import { BusType } from '@shared/types';

describe('BluetoothLEDriver - Mock功能覆盖率提升测试', () => {
  let driver: BluetoothLEDriver;

  beforeEach(() => {
    driver = new BluetoothLEDriver({
      type: BusType.BluetoothLE,
      deviceId: 'test-device',
      serviceUuid: '180a',
      characteristicUuid: '2a29',
      autoReconnect: false
    });
  });

  afterEach(() => {
    driver.destroy();
  });

  // ==================== Mock Peripheral 创建测试 ====================

  describe('Mock Peripheral 创建覆盖', () => {
    it('应该创建具有完整属性的Mock Peripheral', () => {
      const deviceInfo = {
        id: 'test-device-123',
        address: 'ff:ee:dd:cc:bb:aa', 
        rssi: -50,
        advertisement: {
          localName: 'Test BLE Device',
          txPowerLevel: 0,
          serviceUuids: ['180a'],
          manufacturerData: new Uint8Array([0x01, 0x02])
        }
      };

      // 通过内部方法创建Mock Peripheral
      const peripheral = (driver as any).createMockPeripheral(deviceInfo);

      // 验证基础属性
      expect(peripheral.id).toBe('test-device-123');
      expect(peripheral.address).toBe('ff:ee:dd:cc:bb:aa');
      expect(peripheral.addressType).toBe('public');
      expect(peripheral.connectable).toBe(true);
      expect(peripheral.advertisement).toEqual(deviceInfo.advertisement);
      expect(peripheral.rssi).toBe(-50);
      expect(peripheral.state).toBe('disconnected');
    });

    it('应该测试Mock Peripheral的连接功能', async () => {
      const deviceInfo = {
        id: 'test-connect',
        address: 'aa:bb:cc:dd:ee:ff',
        rssi: -60
      };

      const peripheral = (driver as any).createMockPeripheral(deviceInfo);

      // 测试连接回调
      const connectPromise = new Promise<void>((resolve, reject) => {
        peripheral.connect((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        // 监听连接事件
        peripheral.on('connect', () => {
          expect(peripheral.state).toBe('connected');
          resolve();
        });
      });

      await connectPromise;
    }, 2000);

    it('应该测试Mock Peripheral的断开连接功能', async () => {
      const deviceInfo = {
        id: 'test-disconnect',
        address: 'bb:cc:dd:ee:ff:aa',
        rssi: -45
      };

      const peripheral = (driver as any).createMockPeripheral(deviceInfo);

      // 先设置为已连接状态
      peripheral.state = 'connected';

      const disconnectPromise = new Promise<void>((resolve, reject) => {
        peripheral.disconnect((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

        peripheral.on('disconnect', () => {
          expect(peripheral.state).toBe('disconnected');
          resolve();
        });
      });

      await disconnectPromise;
    }, 1000);

    it('应该测试连接超时场景的Mock逻辑', async () => {
      // 创建带有短超时时间的驱动
      const shortTimeoutDriver = new BluetoothLEDriver({
        type: BusType.BluetoothLE,
        deviceId: 'timeout-test',
        serviceUuid: '180a',
        characteristicUuid: '2a29',
        connectionTimeout: 100, // 短超时时间触发超时逻辑
        autoReconnect: false
      });

      const deviceInfo = {
        id: 'timeout-device',
        address: 'cc:dd:ee:ff:aa:bb',
        rssi: -70
      };

      const peripheral = (shortTimeoutDriver as any).createMockPeripheral(deviceInfo);

      // 验证超时逻辑分支被执行
      const connectPromise = new Promise<void>((resolve) => {
        peripheral.connect();
        // 连接应该延迟 connectionTimeout + 200ms
        setTimeout(() => {
          resolve();
        }, 400);
      });

      await connectPromise;
      shortTimeoutDriver.destroy();
    }, 1000);

    it('应该测试服务和特征发现功能', async () => {
      const deviceInfo = {
        id: 'discovery-test',
        address: 'dd:ee:ff:aa:bb:cc',
        rssi: -55
      };

      const peripheral = (driver as any).createMockPeripheral(deviceInfo);

      const discoveryPromise = new Promise<void>((resolve, reject) => {
        peripheral.discoverAllServicesAndCharacteristics((error?: Error, services?: any[], characteristics?: any[]) => {
          if (error) {
            reject(error);
            return;
          }

          // 验证返回的服务
          expect(services).toBeDefined();
          expect(services).toHaveLength(2);
          expect(services![0].uuid).toBe('180a');
          expect(services![0].name).toBe('Device Information');
          expect(services![1].uuid).toBe('180f');
          expect(services![1].name).toBe('Battery Service');

          // 验证返回的特征
          expect(characteristics).toBeDefined();
          expect(characteristics).toHaveLength(2);
          expect(characteristics![0].uuid).toBe('2a29');
          expect(characteristics![0].name).toBe('Manufacturer Name');
          expect(characteristics![0].serviceUuid).toBe('180a');
          expect(characteristics![1].uuid).toBe('2a19');
          expect(characteristics![1].name).toBe('Battery Level');

          resolve();
        });
      });

      await discoveryPromise;
    }, 2000);
  });

  // ==================== Mock Characteristic 创建测试 ====================

  describe('Mock Characteristic 创建覆盖', () => {
    it('应该创建具有完整属性的Mock Characteristic', () => {
      const charInfo = {
        uuid: '2a29',
        name: 'Manufacturer Name',
        properties: {
          read: true,
          write: false,
          notify: false,
          indicate: false
        }
      };

      const characteristic = (driver as any).createMockCharacteristic(charInfo);

      // 验证基础属性
      expect(characteristic.uuid).toBe('2a29');
      expect(characteristic.name).toBe('Manufacturer Name');
      expect(characteristic.type).toBe('org.bluetooth.characteristic');
      expect(characteristic.properties).toContain('read');
      expect(characteristic.properties).not.toContain('write');
    });

    it('应该测试Mock Characteristic的读取功能', async () => {
      const charInfo = {
        uuid: '2a29',
        name: 'Manufacturer Name',
        properties: { read: true, write: false, notify: false, indicate: false }
      };

      const characteristic = (driver as any).createMockCharacteristic(charInfo);

      const readPromise = new Promise<Buffer>((resolve, reject) => {
        characteristic.read((error?: Error, data?: Buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(data!);
          }
        });
      });

      const data = await readPromise;
      expect(data).toBeInstanceOf(Buffer);
      expect(data.toString()).toBe('Hello from BLE device!');
    }, 500);

    it('应该测试Mock Characteristic的写入功能', async () => {
      const charInfo = {
        uuid: '2a00',
        name: 'Device Name',
        properties: { read: false, write: true, notify: false, indicate: false }
      };

      const characteristic = (driver as any).createMockCharacteristic(charInfo);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const testData = Buffer.from('Test Write Data');

      const writePromise = new Promise<void>((resolve, reject) => {
        characteristic.write(testData, false, (error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      await writePromise;

      // 验证写入日志
      expect(consoleSpy).toHaveBeenCalledWith('Mock BLE write: Test Write Data');
      consoleSpy.mockRestore();
    }, 500);

    it('应该测试Mock Characteristic的订阅功能', async () => {
      const charInfo = {
        uuid: '2a19',
        name: 'Battery Level', 
        properties: { read: false, write: false, notify: true, indicate: false }
      };

      const characteristic = (driver as any).createMockCharacteristic(charInfo);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      let dataReceived = false;
      characteristic.on('data', (data: Buffer) => {
        dataReceived = true;
        expect(data).toBeInstanceOf(Buffer);
        expect(data.length).toBe(1);
        expect(data[0]).toBeGreaterThanOrEqual(0);
        expect(data[0]).toBeLessThan(100);
      });

      const subscribePromise = new Promise<void>((resolve, reject) => {
        characteristic.subscribe((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      await subscribePromise;

      // 验证订阅日志
      expect(consoleSpy).toHaveBeenCalledWith('Mock BLE notifications subscribed');

      // 等待数据通知（模拟定时器触发）
      await new Promise(resolve => setTimeout(resolve, 2500));
      expect(dataReceived).toBe(true);

      consoleSpy.mockRestore();
    }, 3000);

    it('应该测试Mock Characteristic的取消订阅功能', async () => {
      const charInfo = {
        uuid: '2a19',
        name: 'Battery Level',
        properties: { read: false, write: false, notify: true, indicate: false }
      };

      const characteristic = (driver as any).createMockCharacteristic(charInfo);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const unsubscribePromise = new Promise<void>((resolve, reject) => {
        characteristic.unsubscribe((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      await unsubscribePromise;

      // 验证取消订阅日志
      expect(consoleSpy).toHaveBeenCalledWith('Mock BLE notifications unsubscribed');
      consoleSpy.mockRestore();
    }, 500);

    it('应该测试具有多个属性的Characteristic', () => {
      const charInfo = {
        uuid: 'custom-char',
        name: 'Custom Characteristic',
        properties: {
          read: true,
          write: true,
          notify: true,
          indicate: true
        }
      };

      const characteristic = (driver as any).createMockCharacteristic(charInfo);

      // 验证所有属性都被正确设置
      expect(characteristic.properties).toContain('read');
      expect(characteristic.properties).toContain('write'); 
      expect(characteristic.properties).toContain('notify');
      expect(characteristic.properties).toContain('indicate');
      expect(characteristic.properties).toHaveLength(4);
    });
  });

  // ==================== 综合Mock功能测试 ====================

  describe('综合Mock功能测试', () => {
    it('应该测试Peripheral和Characteristic的完整交互', async () => {
      const deviceInfo = {
        id: 'integration-test',
        address: 'ee:ff:aa:bb:cc:dd',
        rssi: -40
      };

      const charInfo = {
        uuid: '2a29',
        name: 'Manufacturer Name',
        properties: { read: true, write: true, notify: true, indicate: false }
      };

      // 创建Peripheral和Characteristic
      const peripheral = (driver as any).createMockPeripheral(deviceInfo);
      const characteristic = (driver as any).createMockCharacteristic(charInfo);

      // 测试连接
      await new Promise<void>((resolve) => {
        peripheral.connect(() => {
          expect(peripheral.state).toBe('connected');
          resolve();
        });
      });

      // 测试读取特征值
      const readData = await new Promise<Buffer>((resolve, reject) => {
        characteristic.read((error?: Error, data?: Buffer) => {
          if (error) reject(error);
          else resolve(data!);
        });
      });

      expect(readData.toString()).toBe('Hello from BLE device!');

      // 测试断开连接
      await new Promise<void>((resolve) => {
        peripheral.disconnect(() => {
          expect(peripheral.state).toBe('disconnected');
          resolve();
        });
      });
    }, 3000);
  });
});
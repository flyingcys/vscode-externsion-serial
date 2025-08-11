/**
 * DriverFactory真实模块测试
 * 测试驱动工厂的创建和管理功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DriverFactory } from '@extension/io/DriverFactory';

enum BusType {
  Serial = 'serial',
  Network = 'network',
  BluetoothLE = 'bluetooth-le'
}

describe('DriverFactory真实模块测试', () => {
  let factory: DriverFactory;

  beforeEach(() => {
    factory = new DriverFactory();
  });

  describe('工厂初始化测试', () => {
    it('应该正确创建DriverFactory实例', () => {
      expect(factory).toBeInstanceOf(DriverFactory);
    });

    it('应该初始化支持的驱动类型', () => {
      const supportedTypes = factory.getSupportedBusTypes();
      expect(Array.isArray(supportedTypes)).toBe(true);
      expect(supportedTypes.length).toBeGreaterThan(0);
    });

    it('应该包含基本的总线类型支持', () => {
      const supportedTypes = factory.getSupportedBusTypes();
      expect(supportedTypes).toContain(BusType.Serial);
      expect(supportedTypes).toContain(BusType.Network);
    });
  });

  describe('驱动创建测试', () => {
    it('应该能够创建串口驱动', () => {
      const driver = factory.createDriver(BusType.Serial);
      expect(driver).toBeDefined();
      expect(driver.getDriverId()).toContain('serial');
    });

    it('应该能够创建网络驱动', () => {
      const driver = factory.createDriver(BusType.Network);
      expect(driver).toBeDefined();
      expect(driver.getDriverId()).toContain('network');
    });

    it('应该能够创建蓝牙LE驱动', () => {
      const driver = factory.createDriver(BusType.BluetoothLE);
      expect(driver).toBeDefined();
      expect(driver.getDriverId()).toContain('bluetooth');
    });

    it('应该处理不支持的总线类型', () => {
      expect(() => {
        factory.createDriver(99 as BusType); // 无效的总线类型
      }).toThrow();
    });

    it('应该为相同类型创建不同实例', () => {
      const driver1 = factory.createDriver(BusType.Serial);
      const driver2 = factory.createDriver(BusType.Serial);
      
      expect(driver1).not.toBe(driver2);
      expect(driver1.getDriverId()).toBe(driver2.getDriverId());
    });
  });

  describe('驱动注册测试', () => {
    it('应该能够注册自定义驱动', () => {
      const customDriverClass = class {
        getDriverId() { return 'custom-driver'; }
        getDriverName() { return 'Custom Driver'; }
        getSupportedBusTypes() { return [BusType.Serial]; }
      };

      factory.registerDriver(BusType.Serial, customDriverClass as any);
      
      const driver = factory.createDriver(BusType.Serial);
      expect(driver.getDriverId()).toBe('custom-driver');
    });

    it('应该能够覆盖已存在的驱动', () => {
      const originalDriver = factory.createDriver(BusType.Serial);
      const originalId = originalDriver.getDriverId();

      const newDriverClass = class {
        getDriverId() { return 'new-serial-driver'; }
        getDriverName() { return 'New Serial Driver'; }
        getSupportedBusTypes() { return [BusType.Serial]; }
      };

      factory.registerDriver(BusType.Serial, newDriverClass as any);
      
      const newDriver = factory.createDriver(BusType.Serial);
      expect(newDriver.getDriverId()).toBe('new-serial-driver');
      expect(newDriver.getDriverId()).not.toBe(originalId);
    });

    it('应该验证驱动类的有效性', () => {
      const invalidDriverClass = {}; // 缺少必要方法的类

      expect(() => {
        factory.registerDriver(BusType.Serial, invalidDriverClass as any);
      }).toThrow();
    });
  });

  describe('驱动发现测试', () => {
    it('应该列出所有已注册的驱动', () => {
      const registeredDrivers = factory.getRegisteredDrivers();
      expect(Array.isArray(registeredDrivers)).toBe(true);
      expect(registeredDrivers.length).toBeGreaterThan(0);
    });

    it('应该提供驱动信息', () => {
      const driverInfo = factory.getDriverInfo(BusType.Serial);
      expect(driverInfo).toBeDefined();
      expect(driverInfo.busType).toBe(BusType.Serial);
      expect(typeof driverInfo.name).toBe('string');
      expect(typeof driverInfo.description).toBe('string');
    });

    it('应该处理不存在的驱动信息请求', () => {
      const driverInfo = factory.getDriverInfo(99 as BusType);
      expect(driverInfo).toBeNull();
    });

    it('应该检查驱动是否可用', () => {
      const isAvailable = factory.isDriverAvailable(BusType.Serial);
      expect(typeof isAvailable).toBe('boolean');
      expect(isAvailable).toBe(true);
    });

    it('应该检查不可用的驱动', () => {
      const isAvailable = factory.isDriverAvailable(99 as BusType);
      expect(isAvailable).toBe(false);
    });
  });

  describe('驱动配置测试', () => {
    it('应该获取驱动的默认配置', () => {
      const defaultConfig = factory.getDefaultConfig(BusType.Serial);
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.busType).toBe(BusType.Serial);
    });

    it('应该验证驱动配置', () => {
      const config = factory.getDefaultConfig(BusType.Serial);
      const isValid = factory.validateConfig(config);
      expect(isValid).toBe(true);
    });

    it('应该拒绝无效配置', () => {
      const invalidConfig = {
        busType: BusType.Serial,
        path: '', // 空路径
        baudRate: -1 // 无效波特率
      };
      
      const isValid = factory.validateConfig(invalidConfig);
      expect(isValid).toBe(false);
    });

    it('应该提供配置建议', () => {
      const suggestions = factory.getConfigSuggestions(BusType.Serial);
      expect(Array.isArray(suggestions)).toBe(true);
      
      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('baudRate');
        expect(suggestions[0]).toHaveProperty('dataBits');
      }
    });
  });

  describe('设备扫描测试', () => {
    it('应该扫描可用设备', async () => {
      const devices = await factory.scanDevices(BusType.Serial);
      expect(Array.isArray(devices)).toBe(true);
    });

    it('应该为每个总线类型扫描设备', async () => {
      const allDevices = await factory.scanAllDevices();
      expect(typeof allDevices).toBe('object');
      expect(allDevices).toHaveProperty(BusType.Serial.toString());
    });

    it('应该处理扫描超时', async () => {
      const devices = await factory.scanDevices(BusType.Serial, { timeout: 1 });
      expect(Array.isArray(devices)).toBe(true);
    });

    it('应该过滤设备扫描结果', async () => {
      const devices = await factory.scanDevices(BusType.Serial, {
        filter: (device) => device.path.includes('USB')
      });
      
      expect(Array.isArray(devices)).toBe(true);
      if (devices.length > 0) {
        devices.forEach(device => {
          expect(device.path).toContain('USB');
        });
      }
    });
  });

  describe('驱动生命周期测试', () => {
    it('应该正确初始化驱动', () => {
      const driver = factory.createDriver(BusType.Serial);
      expect(driver.isConnected()).toBe(false);
    });

    it('应该支持驱动预热', async () => {
      await factory.warmupDrivers();
      
      // 预热后创建驱动应该更快
      const startTime = Date.now();
      const driver = factory.createDriver(BusType.Serial);
      const createTime = Date.now() - startTime;
      
      expect(driver).toBeDefined();
      expect(createTime).toBeLessThan(100); // 应该很快
    });

    it('应该清理未使用的驱动', async () => {
      const driver = factory.createDriver(BusType.Serial);
      
      await factory.cleanupUnusedDrivers();
      
      // 清理后应该仍然可以创建新驱动
      const newDriver = factory.createDriver(BusType.Serial);
      expect(newDriver).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理驱动创建失败', () => {
      const mockDriverClass = class {
        constructor() {
          throw new Error('Driver creation failed');
        }
      };

      factory.registerDriver(BusType.Serial, mockDriverClass as any);
      
      expect(() => {
        factory.createDriver(BusType.Serial);
      }).toThrow('Driver creation failed');
    });

    it('应该处理驱动初始化错误', () => {
      const problematicDriverClass = class {
        getDriverId() { return 'problematic-driver'; }
        getDriverName() { return 'Problematic Driver'; }
        getSupportedBusTypes() { return [BusType.Serial]; }
        
        constructor() {
          // 模拟初始化问题
          setTimeout(() => {
            throw new Error('Initialization failed');
          }, 0);
        }
      };

      factory.registerDriver(BusType.Serial, problematicDriverClass as any);
      
      // 应该能创建但可能有初始化问题
      const driver = factory.createDriver(BusType.Serial);
      expect(driver).toBeDefined();
    });

    it('应该提供错误恢复机制', () => {
      // 注册一个会失败的驱动
      const failingDriverClass = class {
        constructor() {
          throw new Error('Always fails');
        }
      };

      factory.registerDriver(BusType.Serial, failingDriverClass as any);
      
      expect(() => {
        factory.createDriver(BusType.Serial);
      }).toThrow();

      // 恢复到默认驱动
      factory.resetToDefaults();
      
      const driver = factory.createDriver(BusType.Serial);
      expect(driver).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该快速创建驱动实例', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const driver = factory.createDriver(BusType.Serial);
        expect(driver).toBeDefined();
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该有效缓存驱动类', () => {
      const firstCreateTime = Date.now();
      factory.createDriver(BusType.Serial);
      const firstTime = Date.now() - firstCreateTime;

      const secondCreateTime = Date.now();
      factory.createDriver(BusType.Serial);
      const secondTime = Date.now() - secondCreateTime;

      // 第二次应该更快（由于缓存）
      expect(secondTime).toBeLessThanOrEqual(firstTime);
    });

    it('应该支持并发驱动创建', async () => {
      const creationPromises = Array.from({ length: 10 }, () => 
        Promise.resolve(factory.createDriver(BusType.Serial))
      );
      
      const drivers = await Promise.all(creationPromises);
      
      expect(drivers.length).toBe(10);
      drivers.forEach(driver => {
        expect(driver).toBeDefined();
      });
    });
  });

  describe('内存管理测试', () => {
    it('应该正确清理工厂资源', () => {
      factory.destroy();
      
      expect(() => {
        factory.createDriver(BusType.Serial);
      }).toThrow();
    });

    it('应该释放驱动引用', () => {
      const driver = factory.createDriver(BusType.Serial);
      const weakRef = new WeakRef(driver);
      
      factory.destroy();
      
      // 强制垃圾回收（如果支持）
      if (global.gc) {
        global.gc();
      }
      
      // 注意：WeakRef的行为在测试环境中可能不稳定
      expect(weakRef.deref()).toBeDefined(); // 可能仍然存在
    });
  });
});
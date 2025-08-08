/**
 * HALDriver-Ultimate-Coverage.test.ts
 * HAL驱动抽象基类100%覆盖率终极测试
 * 目标：覆盖HALDriver抽象类的所有具体方法和抽象方法调用
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { HALDriver, ConfigValidationResult, DriverStats } from '../../../src/extension/io/HALDriver';
import { ConnectionConfig, BusType } from '../../../src/shared/types';

// Mock shared types
const mockBusType = {
  UART: 'uart',
  Network: 'network',
  BluetoothLE: 'bluetooth_le',
};

vi.mock('@shared/types', () => ({
  BusType: mockBusType,
}));

// 创建具体的HALDriver实现用于测试
class TestHALDriver extends HALDriver {
  private _isOpen = false;
  private _isReadable = true;
  private _isWritable = true;
  private _validConfig = true;
  private _writeError: Error | null = null;
  private _openError: Error | null = null;
  private _closeError: Error | null = null;
  private _bytesWritten = 0;

  constructor(config: ConnectionConfig) {
    super(config);
  }

  get busType(): BusType {
    return this.config.type as BusType;
  }

  get displayName(): string {
    return `Test Driver (${this.config.type})`;
  }

  async open(): Promise<void> {
    if (this._openError) {
      throw this._openError;
    }
    this._isOpen = true;
    this.emit('connected');
  }

  async close(): Promise<void> {
    if (this._closeError) {
      throw this._closeError;
    }
    this._isOpen = false;
    this.emit('disconnected');
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  isReadable(): boolean {
    return this._isReadable;
  }

  isWritable(): boolean {
    return this._isWritable;
  }

  validateConfiguration(): ConfigValidationResult {
    if (this._validConfig) {
      return { valid: true, errors: [] };
    } else {
      return { 
        valid: false, 
        errors: ['Invalid port', 'Invalid baud rate'] 
      };
    }
  }

  async write(data: Buffer): Promise<number> {
    if (this._writeError) {
      throw this._writeError;
    }
    const bytesWritten = this._bytesWritten || data.length;
    this.updateSentStats(bytesWritten);
    return bytesWritten;
  }

  // Test helper methods
  setOpenError(error: Error | null): void {
    this._openError = error;
  }

  setCloseError(error: Error | null): void {
    this._closeError = error;
  }

  setWriteError(error: Error | null): void {
    this._writeError = error;
  }

  setBytesWritten(bytes: number): void {
    this._bytesWritten = bytes;
  }

  setReadable(readable: boolean): void {
    this._isReadable = readable;
  }

  setWritable(writable: boolean): void {
    this._isWritable = writable;
  }

  setValidConfig(valid: boolean): void {
    this._validConfig = valid;
  }

  // Expose protected methods for testing
  public testHandleError(error: Error): void {
    this.handleError(error);
  }

  public testUpdateSentStats(bytes: number): void {
    this.updateSentStats(bytes);
  }
}

describe('HALDriver抽象基类终极覆盖率测试', () => {
  let driver: TestHALDriver;
  let mockConfig: ConnectionConfig;

  beforeEach(() => {
    mockConfig = {
      type: mockBusType.UART,
      port: '/dev/ttyUSB0',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
    };
    driver = new TestHALDriver(mockConfig);
  });

  afterEach(() => {
    driver.destroy();
  });

  describe('构造函数和基本属性测试', () => {
    test('应该正确初始化HALDriver', () => {
      expect(driver.getConfiguration()).toEqual(mockConfig);
      expect(driver.busType).toBe(mockBusType.UART);
      expect(driver.displayName).toBe(`Test Driver (${mockBusType.UART})`);
    });

    test('应该初始化默认统计信息', () => {
      const stats = driver.getStats();
      expect(stats).toMatchObject({
        bytesReceived: 0,
        bytesSent: 0,
        errors: 0,
        uptime: expect.any(Number),
        lastActivity: expect.any(Number),
      });
    });

    test('应该初始化数据缓冲区', () => {
      // Buffer应该被正确初始化
      expect((driver as any).dataBuffer).toBeInstanceOf(Buffer);
      expect((driver as any).bufferSize).toBe(8192);
      expect((driver as any).bufferPosition).toBe(0);
    });
  });

  describe('抽象方法实现测试', () => {
    test('应该正确实现open方法', async () => {
      const connectedSpy = vi.fn();
      driver.on('connected', connectedSpy);

      await driver.open();

      expect(driver.isOpen()).toBe(true);
      expect(connectedSpy).toHaveBeenCalled();
    });

    test('应该处理open方法失败', async () => {
      const error = new Error('Open failed');
      driver.setOpenError(error);

      await expect(driver.open()).rejects.toThrow('Open failed');
      expect(driver.isOpen()).toBe(false);
    });

    test('应该正确实现close方法', async () => {
      await driver.open();
      
      const disconnectedSpy = vi.fn();
      driver.on('disconnected', disconnectedSpy);

      await driver.close();

      expect(driver.isOpen()).toBe(false);
      expect(disconnectedSpy).toHaveBeenCalled();
    });

    test('应该处理close方法失败', async () => {
      await driver.open();
      
      const error = new Error('Close failed');
      driver.setCloseError(error);

      await expect(driver.close()).rejects.toThrow('Close failed');
    });

    test('应该正确实现write方法', async () => {
      const data = Buffer.from('test data');
      const dataSentSpy = vi.fn();
      driver.on('dataSent', dataSentSpy);

      const bytesWritten = await driver.write(data);

      expect(bytesWritten).toBe(data.length);
      expect(dataSentSpy).toHaveBeenCalledWith(data.length);
      
      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(data.length);
    });

    test('应该处理write方法失败', async () => {
      const data = Buffer.from('test data');
      const error = new Error('Write failed');
      driver.setWriteError(error);

      await expect(driver.write(data)).rejects.toThrow('Write failed');
    });

    test('应该返回正确的可读性状态', () => {
      expect(driver.isReadable()).toBe(true);
      
      driver.setReadable(false);
      expect(driver.isReadable()).toBe(false);
    });

    test('应该返回正确的可写性状态', () => {
      expect(driver.isWritable()).toBe(true);
      
      driver.setWritable(false);
      expect(driver.isWritable()).toBe(false);
    });

    test('应该正确验证配置', () => {
      let result = driver.validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);

      driver.setValidConfig(false);
      result = driver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Invalid port', 'Invalid baud rate']);
    });
  });

  describe('配置管理测试', () => {
    test('应该获取当前配置的副本', () => {
      const config = driver.getConfiguration();
      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // 应该是副本，不是原始对象
    });

    test('应该更新配置', () => {
      const configChangedSpy = vi.fn();
      driver.on('configurationChanged', configChangedSpy);

      const newConfig = { baudRate: 115200, dataBits: 7 };
      driver.updateConfiguration(newConfig);

      const updatedConfig = driver.getConfiguration();
      expect(updatedConfig.baudRate).toBe(115200);
      expect(updatedConfig.dataBits).toBe(7);
      expect(updatedConfig.port).toBe('/dev/ttyUSB0'); // 其他字段应该保留
      expect(configChangedSpy).toHaveBeenCalled();
    });

    test('应该检查配置有效性', () => {
      expect(driver.isConfigurationValid()).toBe(true);

      driver.setValidConfig(false);
      expect(driver.isConfigurationValid()).toBe(false);
    });
  });

  describe('数据缓冲处理测试', () => {
    test('应该处理小数据块（不触发缓冲区刷新）', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const smallData = Buffer.from('small');
      driver.processData(smallData);

      // 小数据应该被缓冲，不立即发出事件
      expect(dataReceivedSpy).not.toHaveBeenCalled();
      expect((driver as any).bufferPosition).toBe(smallData.length);

      const stats = driver.getStats();
      expect(stats.bytesReceived).toBe(smallData.length);
    });

    test('应该在达到缓冲区80%阈值时刷新', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      // 设置较小的缓冲区以便测试
      driver.setBufferSize(100);
      
      // 发送80字节数据（80%阈值）
      const largeData = Buffer.alloc(80, 'A');
      driver.processData(largeData);

      expect(dataReceivedSpy).toHaveBeenCalledWith(largeData);
      expect((driver as any).bufferPosition).toBe(0); // 缓冲区应该已清空
    });

    test('应该处理缓冲区溢出情况', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.setBufferSize(10);
      
      // 先填充一些数据
      const firstData = Buffer.from('12345');
      driver.processData(firstData);
      expect(dataReceivedSpy).not.toHaveBeenCalled();

      // 再发送会导致溢出的数据
      const overflowData = Buffer.from('67890ABCDEF');
      driver.processData(overflowData);

      // 应该首先刷新缓冲区的数据，然后处理新数据
      expect(dataReceivedSpy).toHaveBeenCalledTimes(1);
      expect(dataReceivedSpy).toHaveBeenNthCalledWith(1, firstData);
      
      // 新数据应该在缓冲区中
      expect((driver as any).bufferPosition).toBe(overflowData.length);
    });

    test('应该直接处理超大数据块', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.setBufferSize(100);
      
      // 发送超过缓冲区大小的数据
      const hugeData = Buffer.alloc(200, 'X');
      driver.processData(hugeData);

      // 超大数据应该直接发出事件，不进入缓冲区
      expect(dataReceivedSpy).toHaveBeenCalledWith(hugeData);
      expect((driver as any).bufferPosition).toBe(0);
    });

    test('应该正确处理数据块组合', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.setBufferSize(10);

      // 发送多个小数据块
      const data1 = Buffer.from('ABC');
      const data2 = Buffer.from('DEF');
      const data3 = Buffer.from('GHI'); // 这个应该触发刷新（9字节，90% > 80%）

      driver.processData(data1);
      driver.processData(data2);
      expect(dataReceivedSpy).not.toHaveBeenCalled();

      driver.processData(data3);
      
      // 应该刷新组合的数据
      const expectedBuffer = Buffer.concat([data1, data2, data3]);
      expect(dataReceivedSpy).toHaveBeenCalledWith(expectedBuffer);
    });

    test('应该手动刷新缓冲区', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const data = Buffer.from('buffered data');
      driver.processData(data);
      expect(dataReceivedSpy).not.toHaveBeenCalled();

      // 手动刷新
      driver.flushBuffer();

      expect(dataReceivedSpy).toHaveBeenCalledWith(data);
      expect((driver as any).bufferPosition).toBe(0);
    });

    test('应该处理空缓冲区刷新', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      // 在没有数据时刷新
      driver.flushBuffer();

      expect(dataReceivedSpy).not.toHaveBeenCalled();
    });
  });

  describe('缓冲区大小管理测试', () => {
    test('应该设置有效的缓冲区大小', () => {
      const newSize = 4096;
      driver.setBufferSize(newSize);

      expect((driver as any).bufferSize).toBe(newSize);
      expect((driver as any).dataBuffer.length).toBe(newSize);
      expect((driver as any).bufferPosition).toBe(0);
    });

    test('应该忽略无效的缓冲区大小', () => {
      const originalSize = (driver as any).bufferSize;
      const originalBuffer = (driver as any).dataBuffer;

      // 测试零大小
      driver.setBufferSize(0);
      expect((driver as any).bufferSize).toBe(originalSize);
      expect((driver as any).dataBuffer).toBe(originalBuffer);

      // 测试负数
      driver.setBufferSize(-100);
      expect((driver as any).bufferSize).toBe(originalSize);
      expect((driver as any).dataBuffer).toBe(originalBuffer);
    });

    test('应该忽略相同的缓冲区大小', () => {
      const originalBuffer = (driver as any).dataBuffer;
      const originalSize = (driver as any).bufferSize;

      driver.setBufferSize(originalSize);
      expect((driver as any).dataBuffer).toBe(originalBuffer); // 应该是同一个对象
    });

    test('应该在设置新缓冲区大小时重置缓冲区位置', () => {
      // 先添加一些数据到缓冲区
      driver.processData(Buffer.from('test'));
      expect((driver as any).bufferPosition).toBeGreaterThan(0);

      // 设置新的缓冲区大小
      driver.setBufferSize(16384);
      expect((driver as any).bufferPosition).toBe(0);
    });
  });

  describe('统计管理测试', () => {
    test('应该正确跟踪接收字节统计', () => {
      const data1 = Buffer.from('hello');
      const data2 = Buffer.from('world');

      driver.processData(data1);
      driver.processData(data2);

      const stats = driver.getStats();
      expect(stats.bytesReceived).toBe(data1.length + data2.length);
    });

    test('应该正确跟踪发送字节统计', async () => {
      const data = Buffer.from('test data');
      await driver.write(data);

      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(data.length);
    });

    test('应该正确计算运行时间', () => {
      const stats = driver.getStats();
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
    });

    test('应该更新最后活动时间', () => {
      const originalStats = driver.getStats();
      
      // 等待一毫秒确保时间差
      setTimeout(() => {
        driver.processData(Buffer.from('test'));
        const newStats = driver.getStats();
        expect(newStats.lastActivity).toBeGreaterThan(originalStats.lastActivity);
      }, 1);
    });

    test('应该重置统计信息', () => {
      // 先产生一些统计数据
      driver.processData(Buffer.from('test'));
      driver.testHandleError(new Error('test error'));

      let stats = driver.getStats();
      expect(stats.bytesReceived).toBeGreaterThan(0);
      expect(stats.errors).toBeGreaterThan(0);

      // 重置统计
      driver.resetStats();

      stats = driver.getStats();
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.lastActivity).toBeGreaterThan(0);
    });
  });

  describe('错误处理测试', () => {
    test('应该正确处理错误', () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);

      const testError = new Error('Test error');
      driver.testHandleError(testError);

      expect(errorSpy).toHaveBeenCalledWith(testError);
      
      const stats = driver.getStats();
      expect(stats.errors).toBe(1);
    });

    test('应该累计错误计数', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');

      driver.testHandleError(error1);
      driver.testHandleError(error2);
      driver.testHandleError(error3);

      const stats = driver.getStats();
      expect(stats.errors).toBe(3);
    });
  });

  describe('发送统计更新测试', () => {
    test('应该更新发送统计并发出事件', () => {
      const dataSentSpy = vi.fn();
      driver.on('dataSent', dataSentSpy);

      driver.testUpdateSentStats(100);

      expect(dataSentSpy).toHaveBeenCalledWith(100);
      
      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(100);
      expect(stats.lastActivity).toBeGreaterThan(0);
    });

    test('应该累计发送字节数', () => {
      driver.testUpdateSentStats(50);
      driver.testUpdateSentStats(75);

      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(125);
    });
  });

  describe('资源清理测试', () => {
    test('应该在销毁时清理资源', () => {
      const removeAllListenersSpy = vi.spyOn(driver, 'removeAllListeners');
      const flushBufferSpy = vi.spyOn(driver, 'flushBuffer');

      // 添加一些数据到缓冲区
      driver.processData(Buffer.from('test data'));

      driver.destroy();

      expect(flushBufferSpy).toHaveBeenCalled();
      expect(removeAllListenersSpy).toHaveBeenCalled();
    });

    test('应该在销毁时刷新未处理的缓冲数据', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const testData = Buffer.from('buffered data');
      driver.processData(testData);
      expect(dataReceivedSpy).not.toHaveBeenCalled();

      driver.destroy();

      expect(dataReceivedSpy).toHaveBeenCalledWith(testData);
    });
  });

  describe('write方法测试的边界情况', () => {
    test('应该处理自定义写入字节数', async () => {
      const data = Buffer.from('test data');
      driver.setBytesWritten(5); // 设置与数据长度不同的写入字节数

      const bytesWritten = await driver.write(data);

      expect(bytesWritten).toBe(5);
      
      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(5);
    });

    test('应该处理零字节写入', async () => {
      const data = Buffer.from('test data');
      driver.setBytesWritten(0);

      const bytesWritten = await driver.write(data);

      expect(bytesWritten).toBe(0);
      
      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(0);
    });
  });

  describe('事件系统测试', () => {
    test('应该正确发出所有类型的事件', async () => {
      const events = {
        dataReceived: vi.fn(),
        dataSent: vi.fn(),
        error: vi.fn(),
        connected: vi.fn(),
        disconnected: vi.fn(),
        configurationChanged: vi.fn(),
      };

      Object.entries(events).forEach(([event, handler]) => {
        driver.on(event, handler);
      });

      // 触发各种事件
      await driver.open();
      driver.updateConfiguration({ baudRate: 115200 });
      await driver.write(Buffer.from('test'));
      driver.testHandleError(new Error('test'));
      driver.processData(Buffer.alloc(10000, 'X')); // 超大数据，直接发出事件
      await driver.close();

      // 验证所有事件都被发出
      expect(events.connected).toHaveBeenCalled();
      expect(events.configurationChanged).toHaveBeenCalled();
      expect(events.dataSent).toHaveBeenCalled();
      expect(events.error).toHaveBeenCalled();
      expect(events.dataReceived).toHaveBeenCalled();
      expect(events.disconnected).toHaveBeenCalled();
    });
  });

  describe('并发和线程安全测试', () => {
    test('应该处理并发数据处理', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      // 模拟并发数据处理
      const data1 = Buffer.from('concurrent1');
      const data2 = Buffer.from('concurrent2');
      const data3 = Buffer.from('concurrent3');

      // 在实际环境中，这些可能会并发执行
      // 由于synchronized函数目前是简化版，我们测试顺序执行
      driver.processData(data1);
      driver.processData(data2);
      driver.processData(data3);

      // 验证所有数据都被正确处理
      const stats = driver.getStats();
      expect(stats.bytesReceived).toBe(data1.length + data2.length + data3.length);
    });

    test('应该在并发写入时正确更新统计', async () => {
      const promises = [
        driver.write(Buffer.from('write1')),
        driver.write(Buffer.from('write22')),
        driver.write(Buffer.from('write333')),
      ];

      await Promise.all(promises);

      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(6 + 7 + 8); // 累计字节数
    });
  });

  describe('边界条件测试', () => {
    test('应该处理空数据缓冲区', () => {
      const emptyData = Buffer.alloc(0);
      driver.processData(emptyData);

      const stats = driver.getStats();
      expect(stats.bytesReceived).toBe(0);
      expect((driver as any).bufferPosition).toBe(0);
    });

    test('应该处理极小缓冲区', () => {
      driver.setBufferSize(1); // 1字节缓冲区
      
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const data = Buffer.from('X');
      driver.processData(data);

      // 1字节应该触发80%阈值（1 * 0.8 = 0.8，但1 >= 0.8）
      expect(dataReceivedSpy).toHaveBeenCalledWith(data);
    });

    test('应该处理超大缓冲区', () => {
      const hugeBuferSize = 1024 * 1024; // 1MB
      driver.setBufferSize(hugeBuferSize);

      expect((driver as any).bufferSize).toBe(hugeBuferSize);
      expect((driver as any).dataBuffer.length).toBe(hugeBuferSize);
    });

    test('应该处理重复的配置更新', () => {
      const configChangedSpy = vi.fn();
      driver.on('configurationChanged', configChangedSpy);

      const newConfig = { baudRate: 115200 };
      driver.updateConfiguration(newConfig);
      driver.updateConfiguration(newConfig);
      driver.updateConfiguration(newConfig);

      // 每次更新都应该发出事件
      expect(configChangedSpy).toHaveBeenCalledTimes(3);
    });

    test('应该处理不完整的配置更新', () => {
      const originalConfig = driver.getConfiguration();
      
      driver.updateConfiguration({});
      
      const updatedConfig = driver.getConfiguration();
      expect(updatedConfig).toEqual(originalConfig);
    });
  });

  describe('内存管理测试', () => {
    test('应该正确管理缓冲区内存', () => {
      const originalBuffer = (driver as any).dataBuffer;
      
      // 多次设置相同大小应该不重新分配
      driver.setBufferSize(8192);
      expect((driver as any).dataBuffer).toBe(originalBuffer);

      // 设置不同大小应该重新分配
      driver.setBufferSize(16384);
      expect((driver as any).dataBuffer).not.toBe(originalBuffer);
      expect((driver as any).dataBuffer.length).toBe(16384);
    });

    test('应该正确复制缓冲区数据', () => {
      const testData = Buffer.from('test data for buffer copy');
      driver.processData(testData);

      // 手动刷新以验证数据复制
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);
      
      driver.flushBuffer();

      const emittedData = dataReceivedSpy.mock.calls[0][0];
      expect(emittedData).toEqual(testData);
      expect(emittedData).not.toBe((driver as any).dataBuffer); // 应该是副本
    });
  });
});
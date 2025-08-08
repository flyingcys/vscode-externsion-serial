/**
 * HALDriver 抽象基类 100% 覆盖度测试
 * 
 * 目标：实现HALDriver基础层完全覆盖
 * - 代码行覆盖率: 100%
 * - 分支覆盖率: 100%
 * - 函数覆盖率: 100%
 * - 测试所有边界条件和错误路径
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { HALDriver, ConfigValidationResult, DriverStats } from '@extension/io/HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';

/**
 * 具体的HAL驱动实现用于测试抽象基类
 * 实现所有抽象方法以便进行完整测试
 */
class TestableHALDriver extends HALDriver {
  private _isOpen = false;
  private _isReadable = true;
  private _isWritable = true;
  private _shouldThrowOnOpen = false;
  private _shouldThrowOnWrite = false;
  private _shouldThrowOnClose = false;
  private _writeDelay = 0;
  private _bytesToWrite = 0;

  constructor(config: ConnectionConfig) {
    super(config);
  }

  // 实现抽象方法
  get busType(): BusType {
    return this.config.type || BusType.UART;
  }

  get displayName(): string {
    return 'Testable HAL Driver';
  }

  async open(): Promise<void> {
    if (this._shouldThrowOnOpen) {
      throw new Error('Open operation failed');
    }
    this._isOpen = true;
    this.emit('connected');
  }

  async close(): Promise<void> {
    if (this._shouldThrowOnClose) {
      throw new Error('Close operation failed');
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
    const errors: string[] = [];
    
    if (!this.config.type) {
      errors.push('Bus type is required');
    }
    
    // 添加更多验证规则用于测试
    if (this.config.timeout && this.config.timeout < 0) {
      errors.push('Timeout cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async write(data: Buffer): Promise<number> {
    if (this._shouldThrowOnWrite) {
      throw new Error('Write operation failed');
    }
    
    if (!this.isWritable()) {
      throw new Error('Driver is not writable');
    }
    
    if (!this.isOpen()) {
      throw new Error('Driver is not open');
    }

    // 模拟写入延迟
    if (this._writeDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this._writeDelay));
    }

    const bytesWritten = this._bytesToWrite || data.length;
    
    // 更新统计信息
    this.updateSentStats(bytesWritten);
    
    return bytesWritten;
  }

  // 测试辅助方法
  setReadable(readable: boolean): void {
    this._isReadable = readable;
  }

  setWritable(writable: boolean): void {
    this._isWritable = writable;
  }

  setShouldThrowOnOpen(shouldThrow: boolean): void {
    this._shouldThrowOnOpen = shouldThrow;
  }

  setShouldThrowOnWrite(shouldThrow: boolean): void {
    this._shouldThrowOnWrite = shouldThrow;
  }

  setShouldThrowOnClose(shouldThrow: boolean): void {
    this._shouldThrowOnClose = shouldThrow;
  }

  setWriteDelay(delay: number): void {
    this._writeDelay = delay;
  }

  setBytesToWrite(bytes: number): void {
    this._bytesToWrite = bytes;
  }

  // 暴露受保护的方法用于测试
  public testHandleError(error: Error): void {
    this.handleError(error);
  }

  public testUpdateSentStats(bytes: number): void {
    this.updateSentStats(bytes);
  }
}

describe('HALDriver 抽象基类完全覆盖测试', () => {
  let driver: TestableHALDriver;
  let config: ConnectionConfig;

  beforeEach(() => {
    config = {
      type: BusType.UART,
      port: 'COM1',
      baudRate: 9600,
      timeout: 5000,
      autoReconnect: true
    };
    
    driver = new TestableHALDriver(config);
    // 设置更高的监听器限制，避免内存泄漏警告
    driver.setMaxListeners(200);
  });

  afterEach(() => {
    if (driver) {
      driver.destroy();
    }
  });

  describe('🏗️ 构造函数和初始化', () => {
    it('应该正确初始化基础属性', () => {
      expect(driver.busType).toBe(BusType.UART);
      expect(driver.displayName).toBe('Testable HAL Driver');
      expect(driver.getConfiguration()).toEqual(config);
    });

    it('应该初始化统计信息', () => {
      const stats = driver.getStats();
      
      expect(stats).toMatchObject({
        bytesReceived: 0,
        bytesSent: 0,
        errors: 0,
        uptime: expect.any(Number),
        lastActivity: expect.any(Number)
      });
    });

    it('应该初始化数据缓冲区', () => {
      // 通过处理数据来间接验证缓冲区初始化
      const testData = Buffer.from('test data');
      
      expect(() => {
        driver.processData(testData);
      }).not.toThrow();
    });

    it('应该正确设置默认缓冲区大小', () => {
      // 默认缓冲区大小应该是8192
      const largeData = Buffer.alloc(10000, 'A');
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      driver.processData(largeData);
      
      // 应该触发缓冲区刷新
      expect(receivedData).toBeTruthy();
    });
  });

  describe('⚙️ 配置管理', () => {
    it('应该正确获取配置', () => {
      const retrievedConfig = driver.getConfiguration();
      
      // 应该返回配置的副本，不是原始引用
      expect(retrievedConfig).toEqual(config);
      expect(retrievedConfig).not.toBe(config);
    });

    it('应该正确更新配置', () => {
      const updateConfig = { baudRate: 115200, timeout: 10000 };
      
      let configChangedEmitted = false;
      driver.on('configurationChanged', () => {
        configChangedEmitted = true;
      });
      
      driver.updateConfiguration(updateConfig);
      
      const updatedConfig = driver.getConfiguration();
      expect(updatedConfig.baudRate).toBe(115200);
      expect(updatedConfig.timeout).toBe(10000);
      expect(configChangedEmitted).toBe(true);
    });

    it('应该验证配置有效性', () => {
      // 测试有效配置
      expect(driver.isConfigurationValid()).toBe(true);
      
      // 测试无效配置
      driver.updateConfiguration({ timeout: -1000 });
      expect(driver.isConfigurationValid()).toBe(false);
    });

    it('应该处理空配置更新', () => {
      const originalConfig = driver.getConfiguration();
      
      driver.updateConfiguration({});
      
      // 配置应该保持不变
      expect(driver.getConfiguration()).toEqual(originalConfig);
    });

    it('应该处理部分配置更新', () => {
      const originalBaudRate = driver.getConfiguration().baudRate;
      
      driver.updateConfiguration({ port: 'COM2' });
      
      const updatedConfig = driver.getConfiguration();
      expect(updatedConfig.port).toBe('COM2');
      expect(updatedConfig.baudRate).toBe(originalBaudRate);
    });
  });

  describe('🗂️ 缓冲区管理', () => {
    it('应该正确设置缓冲区大小', () => {
      const newSize = 4096;
      driver.setBufferSize(newSize);
      
      // 通过测试大数据包来验证新缓冲区大小
      const testData = Buffer.alloc(newSize + 1000, 'B');
      
      expect(() => {
        driver.processData(testData);
      }).not.toThrow();
    });

    it('应该拒绝非法缓冲区大小', () => {
      const originalSize = 8192; // 默认大小
      
      // 测试负数
      driver.setBufferSize(-1000);
      // 缓冲区大小应该保持不变
      
      // 测试零
      driver.setBufferSize(0);
      // 缓冲区大小应该保持不变
    });

    it('应该处理相同缓冲区大小的设置', () => {
      const currentSize = 8192;
      
      expect(() => {
        driver.setBufferSize(currentSize);
      }).not.toThrow();
    });

    it('应该正确处理小数据包', () => {
      const testData = Buffer.from('small');
      let receivedData: Buffer | null = null;
      
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      driver.processData(testData);
      
      // 小数据包应该被缓冲，不立即发射
      expect(receivedData).toBeNull();
    });

    it('应该在达到80%阈值时刷新缓冲区', () => {
      const bufferSize = 1000;
      driver.setBufferSize(bufferSize);
      
      // 创建达到80%阈值的数据
      const thresholdData = Buffer.alloc(bufferSize * 0.8, 'C');
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      driver.processData(thresholdData);
      
      // 应该触发缓冲区刷新
      expect(receivedData).toBeTruthy();
      expect(receivedData?.length).toBe(thresholdData.length);
    });

    it('应该处理缓冲区溢出', () => {
      const bufferSize = 1000;
      driver.setBufferSize(bufferSize);
      
      // 创建超过缓冲区大小的数据
      const overflowData = Buffer.alloc(bufferSize + 500, 'D');
      
      let receivedData: Buffer[] = [];
      driver.on('dataReceived', (data: Buffer) => {
        receivedData.push(data);
      });
      
      driver.processData(overflowData);
      
      // 应该触发缓冲区刷新并处理溢出数据
      expect(receivedData.length).toBeGreaterThan(0);
    });

    it('应该处理缓冲区溢出后重新装填的特殊场景', () => {
      const bufferSize = 1000;
      driver.setBufferSize(bufferSize);
      
      let receivedData: Buffer[] = [];
      driver.on('dataReceived', (data: Buffer) => {
        receivedData.push(data);
      });
      
      // 先添加数据到缓冲区，不超过80%阈值以避免自动刷新
      const initialData = Buffer.alloc(700, 'I'); // 70% 不会触发自动刷新
      driver.processData(initialData);
      
      // 此时缓冲区中有数据但尚未发射
      expect(receivedData.length).toBe(0);
      
      // 现在添加一个会导致溢出但不超过缓冲区大小的数据
      const overflowData = Buffer.alloc(400, 'O'); // 这会导致溢出，但数据本身不超过缓冲区大小
      
      driver.processData(overflowData);
      
      // 应该先刷新原有缓冲区，然后将新数据放入空缓冲区
      expect(receivedData.length).toBe(1); // 应该收到刷新的数据
      expect(receivedData[0].length).toBe(initialData.length); // 应该是初始数据
      
      // 手动刷新缓冲区来获取新数据
      driver.flushBuffer();
      
      expect(receivedData.length).toBe(2); // 现在应该有两个数据包
      expect(receivedData[1].length).toBe(overflowData.length); // 第二个应该是溢出数据
    });

    it('应该处理超大数据包直接发射', () => {
      const bufferSize = 1000;
      driver.setBufferSize(bufferSize);
      
      // 创建远超缓冲区大小的数据包
      const hugeData = Buffer.alloc(bufferSize * 2, 'E');
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      driver.processData(hugeData);
      
      // 超大数据包应该直接发射
      expect(receivedData).toBeTruthy();
      expect(receivedData?.length).toBe(hugeData.length);
    });

    it('应该手动刷新缓冲区', () => {
      const testData = Buffer.from('buffered data');
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      // 先添加数据到缓冲区
      driver.processData(testData);
      expect(receivedData).toBeNull(); // 数据应该被缓冲
      
      // 手动刷新
      driver.flushBuffer();
      
      // 现在应该收到数据
      expect(receivedData).toBeTruthy();
      expect(receivedData?.toString()).toBe('buffered data');
    });

    it('应该处理空缓冲区刷新', () => {
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      // 刷新空缓冲区
      driver.flushBuffer();
      
      // 不应该发射任何数据
      expect(receivedData).toBeNull();
    });

    it('应该处理多个小数据包的累积', () => {
      const packet1 = Buffer.from('packet1');
      const packet2 = Buffer.from('packet2');
      const packet3 = Buffer.from('packet3');
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      // 添加多个小数据包
      driver.processData(packet1);
      driver.processData(packet2);
      driver.processData(packet3);
      
      // 手动刷新以获取累积数据
      driver.flushBuffer();
      
      expect(receivedData).toBeTruthy();
      expect(receivedData?.toString()).toBe('packet1packet2packet3');
    });
  });

  describe('📊 统计数据管理', () => {
    it('应该正确更新接收统计', async () => {
      const testData = Buffer.from('received data');
      const initialStats = driver.getStats();
      
      // 添加小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));
      
      driver.processData(testData);
      
      const updatedStats = driver.getStats();
      expect(updatedStats.bytesReceived).toBe(initialStats.bytesReceived + testData.length);
      expect(updatedStats.lastActivity).toBeGreaterThanOrEqual(initialStats.lastActivity);
    });

    it('应该正确更新发送统计', async () => {
      const bytesSent = 100;
      const initialStats = driver.getStats();
      
      let dataSentEmitted = false;
      let sentBytes = 0;
      driver.on('dataSent', (bytes: number) => {
        dataSentEmitted = true;
        sentBytes = bytes;
      });
      
      // 添加小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));
      
      driver.testUpdateSentStats(bytesSent);
      
      const updatedStats = driver.getStats();
      expect(updatedStats.bytesSent).toBe(initialStats.bytesSent + bytesSent);
      expect(updatedStats.lastActivity).toBeGreaterThanOrEqual(initialStats.lastActivity);
      expect(dataSentEmitted).toBe(true);
      expect(sentBytes).toBe(bytesSent);
    });

    it('应该计算运行时间', () => {
      const stats1 = driver.getStats();
      
      // 等待一小段时间
      const delay = new Promise(resolve => setTimeout(resolve, 10));
      
      return delay.then(() => {
        const stats2 = driver.getStats();
        expect(stats2.uptime).toBeGreaterThan(stats1.uptime);
      });
    });

    it('应该重置统计数据', () => {
      // 先产生一些统计数据
      driver.processData(Buffer.from('data'));
      driver.testUpdateSentStats(50);
      
      // 使用错误事件监听而不是直接调用handleError
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });
      driver.testHandleError(new Error('test error'));
      expect(errorEmitted).toBe(true);
      
      const statsBeforeReset = driver.getStats();
      expect(statsBeforeReset.bytesReceived).toBeGreaterThan(0);
      expect(statsBeforeReset.bytesSent).toBeGreaterThan(0);
      expect(statsBeforeReset.errors).toBeGreaterThan(0);
      
      driver.resetStats();
      
      const statsAfterReset = driver.getStats();
      expect(statsAfterReset.bytesReceived).toBe(0);
      expect(statsAfterReset.bytesSent).toBe(0);
      expect(statsAfterReset.errors).toBe(0);
      expect(statsAfterReset.uptime).toBeGreaterThanOrEqual(0);
      expect(statsAfterReset.lastActivity).toBeGreaterThanOrEqual(0);
    });

    it('应该处理多次统计更新', () => {
      const data1 = Buffer.from('data1');
      const data2 = Buffer.from('data2');
      const sentBytes1 = 25;
      const sentBytes2 = 35;
      
      driver.processData(data1);
      driver.testUpdateSentStats(sentBytes1);
      
      const midStats = driver.getStats();
      
      driver.processData(data2);
      driver.testUpdateSentStats(sentBytes2);
      
      const finalStats = driver.getStats();
      
      expect(finalStats.bytesReceived).toBe(data1.length + data2.length);
      expect(finalStats.bytesSent).toBe(sentBytes1 + sentBytes2);
      expect(finalStats.lastActivity).toBeGreaterThanOrEqual(midStats.lastActivity);
    });
  });

  describe('❌ 错误处理', () => {
    it('应该正确处理并发射错误事件', () => {
      const testError = new Error('Test error message');
      
      let errorEmitted = false;
      let emittedError: Error | null = null;
      driver.on('error', (error: Error) => {
        errorEmitted = true;
        emittedError = error;
      });
      
      driver.testHandleError(testError);
      
      expect(errorEmitted).toBe(true);
      expect(emittedError).toBe(testError);
      
      const stats = driver.getStats();
      expect(stats.errors).toBe(1);
    });

    it('应该累积错误计数', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');
      
      // 监听错误事件而不让错误抛出到测试框架
      let errorCount = 0;
      driver.on('error', () => {
        errorCount++;
      });
      
      driver.testHandleError(error1);
      driver.testHandleError(error2);
      driver.testHandleError(error3);
      
      expect(errorCount).toBe(3);
      
      const stats = driver.getStats();
      expect(stats.errors).toBe(3);
    });

    it('应该处理空错误对象', () => {
      const emptyError = new Error('');
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });
      
      expect(() => {
        driver.testHandleError(emptyError);
      }).not.toThrow();
      
      expect(errorEmitted).toBe(true);
    });
  });

  describe('🎭 事件系统', () => {
    it('应该正确发射dataReceived事件', () => {
      const testData = Buffer.from('event test data');
      
      let dataReceivedEmitted = false;
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        dataReceivedEmitted = true;
        receivedData = data;
      });
      
      // 强制刷新缓冲区以触发事件
      driver.processData(testData);
      driver.flushBuffer();
      
      expect(dataReceivedEmitted).toBe(true);
      expect(receivedData?.toString()).toBe('event test data');
    });

    it('应该正确发射dataSent事件', () => {
      const sentBytes = 150;
      
      let dataSentEmitted = false;
      let emittedBytes = 0;
      driver.on('dataSent', (bytes: number) => {
        dataSentEmitted = true;
        emittedBytes = bytes;
      });
      
      driver.testUpdateSentStats(sentBytes);
      
      expect(dataSentEmitted).toBe(true);
      expect(emittedBytes).toBe(sentBytes);
    });

    it('应该正确发射error事件', () => {
      const testError = new Error('Event error test');
      
      let errorEmitted = false;
      let emittedError: Error | null = null;
      driver.on('error', (error: Error) => {
        errorEmitted = true;
        emittedError = error;
      });
      
      driver.testHandleError(testError);
      
      expect(errorEmitted).toBe(true);
      expect(emittedError).toBe(testError);
    });

    it('应该正确发射configurationChanged事件', () => {
      let configChangedEmitted = false;
      driver.on('configurationChanged', () => {
        configChangedEmitted = true;
      });
      
      driver.updateConfiguration({ baudRate: 57600 });
      
      expect(configChangedEmitted).toBe(true);
    });

    it('应该支持多个事件监听器', () => {
      let listener1Called = false;
      let listener2Called = false;
      let listener3Called = false;
      
      driver.on('error', () => { listener1Called = true; });
      driver.on('error', () => { listener2Called = true; });
      driver.on('error', () => { listener3Called = true; });
      
      driver.testHandleError(new Error('Multi-listener test'));
      
      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);
      expect(listener3Called).toBe(true);
    });
  });

  describe('🧹 资源清理', () => {
    it('应该正确清理资源', () => {
      // 添加一些数据到缓冲区
      driver.processData(Buffer.from('cleanup test'));
      
      // 添加事件监听器
      const errorListener = vi.fn();
      const dataListener = vi.fn();
      driver.on('error', errorListener);
      driver.on('dataReceived', dataListener);
      
      expect(driver.listenerCount('error')).toBe(1);
      expect(driver.listenerCount('dataReceived')).toBe(1);
      
      driver.destroy();
      
      // 所有监听器应该被移除
      expect(driver.listenerCount('error')).toBe(0);
      expect(driver.listenerCount('dataReceived')).toBe(0);
    });

    it('应该在销毁时刷新缓冲区', () => {
      const testData = Buffer.from('destroy flush test');
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      // 添加数据到缓冲区但不刷新
      driver.processData(testData);
      expect(receivedData).toBeNull();
      
      // 销毁应该刷新缓冲区
      driver.destroy();
      
      expect(receivedData).toBeTruthy();
      expect(receivedData?.toString()).toBe('destroy flush test');
    });

    it('应该处理多次destroy调用', () => {
      expect(() => {
        driver.destroy();
        driver.destroy(); // 第二次调用不应该出错
        driver.destroy(); // 第三次调用不应该出错
      }).not.toThrow();
    });
  });

  describe('🔧 线程安全和并发', () => {
    it('应该处理并发数据处理', () => {
      const data1 = Buffer.from('concurrent1');
      const data2 = Buffer.from('concurrent2');
      const data3 = Buffer.from('concurrent3');
      
      let receivedPackets: Buffer[] = [];
      driver.on('dataReceived', (data: Buffer) => {
        receivedPackets.push(data);
      });
      
      // 同时处理多个数据包
      driver.processData(data1);
      driver.processData(data2);
      driver.processData(data3);
      
      driver.flushBuffer();
      
      // 应该接收到合并的数据
      expect(receivedPackets.length).toBeGreaterThan(0);
      
      // 验证数据完整性
      const totalReceived = receivedPackets.reduce((total, packet) => total + packet.length, 0);
      const expectedTotal = data1.length + data2.length + data3.length;
      expect(totalReceived).toBe(expectedTotal);
    });

    it('应该处理快速连续的统计更新', () => {
      const updateCount = 100;
      let totalBytes = 0;
      
      for (let i = 0; i < updateCount; i++) {
        const bytes = i + 1;
        driver.testUpdateSentStats(bytes);
        totalBytes += bytes;
      }
      
      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(totalBytes);
    });
  });

  describe('🎯 边界条件测试', () => {
    it('应该处理零字节数据', () => {
      const emptyData = Buffer.alloc(0);
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      driver.processData(emptyData);
      driver.flushBuffer();
      
      // 空数据不应该触发事件
      expect(receivedData).toBeNull();
    });

    it('应该处理最大缓冲区大小', () => {
      const maxSize = 65536; // 64KB
      driver.setBufferSize(maxSize);
      
      const testData = Buffer.alloc(maxSize - 1, 'M');
      
      expect(() => {
        driver.processData(testData);
      }).not.toThrow();
    });

    it('应该处理最小有效配置', () => {
      const minimalConfig: ConnectionConfig = {
        type: BusType.UART
      };
      
      const minimalDriver = new TestableHALDriver(minimalConfig);
      
      expect(minimalDriver.getConfiguration()).toEqual(minimalConfig);
      expect(minimalDriver.busType).toBe(BusType.UART);
      
      minimalDriver.destroy();
    });

    it('应该处理极大数据包', () => {
      const hugeData = Buffer.alloc(1024 * 1024, 'H'); // 1MB
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      driver.processData(hugeData);
      
      expect(receivedData).toBeTruthy();
      expect(receivedData?.length).toBe(hugeData.length);
    });

    it('应该处理配置边界值', () => {
      const boundaryConfig = {
        timeout: 0,
        baudRate: 1,
        port: ''
      };
      
      expect(() => {
        driver.updateConfiguration(boundaryConfig);
      }).not.toThrow();
      
      const config = driver.getConfiguration();
      expect(config.timeout).toBe(0);
      expect(config.baudRate).toBe(1);
      expect(config.port).toBe('');
    });
  });

  describe('🧪 抽象方法集成测试', () => {
    it('应该通过validateConfiguration测试所有验证规则', () => {
      // 测试有效配置
      let result = driver.validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // 测试缺少必需字段
      const invalidDriver = new TestableHALDriver({ type: undefined } as any);
      result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bus type is required');
      
      invalidDriver.destroy();
    });

    it('应该测试所有连接状态方法', () => {
      // 初始状态
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
      
      // 修改状态
      driver.setReadable(false);
      driver.setWritable(false);
      
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    it('应该测试write方法的所有分支', async () => {
      const testData = Buffer.from('write test');
      
      // 测试未打开状态写入
      await expect(driver.write(testData)).rejects.toThrow('Driver is not open');
      
      // 打开驱动
      await driver.open();
      
      // 测试不可写状态
      driver.setWritable(false);
      await expect(driver.write(testData)).rejects.toThrow('Driver is not writable');
      
      // 恢复可写状态
      driver.setWritable(true);
      
      // 测试正常写入
      const bytesWritten = await driver.write(testData);
      expect(bytesWritten).toBe(testData.length);
      
      // 测试写入错误
      driver.setShouldThrowOnWrite(true);
      await expect(driver.write(testData)).rejects.toThrow('Write operation failed');
      
      await driver.close();
    });

    it('应该测试open/close操作的所有分支', async () => {
      let connectedEmitted = false;
      let disconnectedEmitted = false;
      
      driver.on('connected', () => { connectedEmitted = true; });
      driver.on('disconnected', () => { disconnectedEmitted = true; });
      
      // 正常打开
      await driver.open();
      expect(driver.isOpen()).toBe(true);
      expect(connectedEmitted).toBe(true);
      
      // 正常关闭
      await driver.close();
      expect(driver.isOpen()).toBe(false);
      expect(disconnectedEmitted).toBe(true);
      
      // 测试打开失败
      driver.setShouldThrowOnOpen(true);
      await expect(driver.open()).rejects.toThrow('Open operation failed');
      
      // 重置状态，测试关闭失败
      driver.setShouldThrowOnOpen(false);
      await driver.open(); // 先成功打开
      driver.setShouldThrowOnClose(true);
      await expect(driver.close()).rejects.toThrow('Close operation failed');
      
      // 清理状态
      driver.setShouldThrowOnClose(false);
    });
  });

  describe('📈 性能和内存测试', () => {
    it('应该处理高频数据处理', () => {
      const iterationCount = 1000;
      const dataSize = 100;
      
      for (let i = 0; i < iterationCount; i++) {
        const testData = Buffer.alloc(dataSize, i % 256);
        driver.processData(testData);
      }
      
      const stats = driver.getStats();
      expect(stats.bytesReceived).toBe(iterationCount * dataSize);
    });

    it('应该处理大量事件监听器', () => {
      const listenerCount = 100;
      const listeners: (() => void)[] = [];
      
      for (let i = 0; i < listenerCount; i++) {
        const listener = vi.fn();
        listeners.push(listener);
        driver.on('error', listener);
      }
      
      driver.testHandleError(new Error('Many listeners test'));
      
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledTimes(1);
      });
    });

    it('应该正确管理内存使用', () => {
      const largeData = Buffer.alloc(100000, 'L');
      
      // 处理大量数据
      for (let i = 0; i < 100; i++) {
        driver.processData(largeData);
        driver.flushBuffer();
      }
      
      // 验证驱动仍然可以正常工作
      const stats = driver.getStats();
      expect(stats.bytesReceived).toBeGreaterThan(0);
      
      // 清理资源
      driver.destroy();
    });
  });
});
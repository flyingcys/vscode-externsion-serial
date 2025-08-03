/**
 * HAL Driver Abstract Base Class Tests
 * 测试硬件抽象层驱动程序基类的核心功能
 * Coverage Target: 98% lines, 95% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { HALDriver, ConfigValidationResult, DriverStats } from '@extension/io/HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';

// 测试用的具体HAL驱动实现
class TestHALDriver extends HALDriver {
  private _isOpen = false;
  private _isReadable = false;
  private _isWritable = false;
  private _validationResult: ConfigValidationResult = { valid: true, errors: [] };

  constructor(config: ConnectionConfig) {
    super(config);
  }

  get busType(): BusType {
    return BusType.UART;
  }

  get displayName(): string {
    return 'Test HAL Driver';
  }

  async open(): Promise<void> {
    if (this._isOpen) {
      throw new Error('Driver is already open');
    }
    this._isOpen = true;
    this._isReadable = true;
    this._isWritable = true;
    this.emit('connected');
  }

  async close(): Promise<void> {
    if (!this._isOpen) {
      throw new Error('Driver is not open');
    }
    this._isOpen = false;
    this._isReadable = false;
    this._isWritable = false;
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
    return this._validationResult;
  }

  async write(data: Buffer): Promise<number> {
    if (!this.isWritable()) {
      throw new Error('Driver is not writable');
    }
    const bytesWritten = data.length;
    this.updateSentStats(bytesWritten);
    return bytesWritten;
  }

  // 用于测试的辅助方法
  setValidationResult(result: ConfigValidationResult): void {
    this._validationResult = result;
  }

  setReadable(readable: boolean): void {
    this._isReadable = readable;
  }

  setWritable(writable: boolean): void {
    this._isWritable = writable;
  }

  simulateDataReceive(data: Buffer): void {
    this.processData(data);
  }

  simulateError(error: Error): void {
    this.handleError(error);
  }

  getDataBuffer(): Buffer {
    return (this as any).dataBuffer;
  }

  getBufferPosition(): number {
    return (this as any).bufferPosition;
  }
}

describe('HALDriver Abstract Base Class', () => {
  let driver: TestHALDriver;
  let mockConfig: ConnectionConfig;

  beforeEach(() => {
    mockConfig = {
      type: BusType.UART,
      port: 'COM1',
      baudRate: 9600,
      autoReconnect: true,
      timeout: 1000
    };
    driver = new TestHALDriver(mockConfig);
  });

  afterEach(() => {
    driver.destroy();
  });

  describe('Constructor and Basic Properties', () => {
    test('should initialize with correct configuration', () => {
      const config = driver.getConfiguration();
      expect(config).toEqual(mockConfig);
      expect(driver.busType).toBe(BusType.UART);
      expect(driver.displayName).toBe('Test HAL Driver');
    });

    test('should initialize statistics correctly', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1000); // 设置一个固定时间
      
      const testDriver = new TestHALDriver(mockConfig);
      
      vi.advanceTimersByTime(100); // 前进100ms
      
      const stats = testDriver.getStats();
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.uptime).toBe(100); // 应该是100ms
      expect(stats.lastActivity).toBeGreaterThan(0);
      
      testDriver.destroy();
      vi.useRealTimers();
    });

    test('should initialize with default buffer size', () => {
      const buffer = driver.getDataBuffer();
      expect(buffer.length).toBe(8192); // 默认缓冲区大小
      expect(driver.getBufferPosition()).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    test('should get configuration correctly', () => {
      const config = driver.getConfiguration();
      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // 应该是副本，不是原始对象
    });

    test('should update configuration', () => {
      const configurationChangedSpy = vi.fn();
      driver.on('configurationChanged', configurationChangedSpy);

      const newConfig = { baudRate: 115200, timeout: 2000 };
      driver.updateConfiguration(newConfig);

      const updatedConfig = driver.getConfiguration();
      expect(updatedConfig.baudRate).toBe(115200);
      expect(updatedConfig.timeout).toBe(2000);
      expect(updatedConfig.port).toBe('COM1'); // 原有配置应该保留
      expect(configurationChangedSpy).toHaveBeenCalledOnce();
    });

    test('should validate configuration', () => {
      // 有效配置
      expect(driver.isConfigurationValid()).toBe(true);

      // 无效配置
      driver.setValidationResult({
        valid: false,
        errors: ['Invalid port', 'Invalid baud rate']
      });
      expect(driver.isConfigurationValid()).toBe(false);
    });
  });

  describe('Connection Lifecycle', () => {
    test('should open connection successfully', async () => {
      const connectedSpy = vi.fn();
      driver.on('connected', connectedSpy);

      expect(driver.isOpen()).toBe(false);
      await driver.open();
      
      expect(driver.isOpen()).toBe(true);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
      expect(connectedSpy).toHaveBeenCalledOnce();
    });

    test('should close connection successfully', async () => {
      const disconnectedSpy = vi.fn();
      driver.on('disconnected', disconnectedSpy);

      await driver.open();
      expect(driver.isOpen()).toBe(true);

      await driver.close();
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
      expect(disconnectedSpy).toHaveBeenCalledOnce();
    });

    test('should handle open when already open', async () => {
      await driver.open();
      await expect(driver.open()).rejects.toThrow('Driver is already open');
    });

    test('should handle close when not open', async () => {
      await expect(driver.close()).rejects.toThrow('Driver is not open');
    });
  });

  describe('Data Writing', () => {
    beforeEach(async () => {
      await driver.open();
    });

    test('should write data successfully', async () => {
      const data = Buffer.from('Hello World');
      const dataSentSpy = vi.fn();
      driver.on('dataSent', dataSentSpy);

      const bytesWritten = await driver.write(data);
      
      expect(bytesWritten).toBe(data.length);
      expect(dataSentSpy).toHaveBeenCalledWith(data.length);
      
      const stats = driver.getStats();
      expect(stats.bytesSent).toBe(data.length);
    });

    test('should fail to write when not writable', async () => {
      driver.setWritable(false);
      const data = Buffer.from('Hello World');
      
      await expect(driver.write(data)).rejects.toThrow('Driver is not writable');
    });

    test('should fail to write when closed', async () => {
      await driver.close();
      const data = Buffer.from('Hello World');
      
      await expect(driver.write(data)).rejects.toThrow('Driver is not writable');
    });
  });

  describe('Data Processing and Buffering', () => {
    test('should process small data chunks correctly', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const data1 = Buffer.from('Hello');
      const data2 = Buffer.from(' World');
      
      driver.simulateDataReceive(data1);
      driver.simulateDataReceive(data2);
      
      // 数据应该被缓冲，还未发出dataReceived事件
      expect(dataReceivedSpy).not.toHaveBeenCalled();
      expect(driver.getBufferPosition()).toBe(11); // 'Hello World'.length
      
      // 手动刷新缓冲区
      driver.flushBuffer();
      expect(dataReceivedSpy).toHaveBeenCalledOnce();
      expect(dataReceivedSpy).toHaveBeenCalledWith(Buffer.from('Hello World'));
    });

    test('should auto-flush buffer when threshold reached', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      // 设置较小的缓冲区以便测试
      driver.setBufferSize(100);
      
      // 发送足够的数据触发80%阈值
      const largeData = Buffer.alloc(85); // 85% > 80%
      driver.simulateDataReceive(largeData);
      
      // 应该自动刷新
      expect(dataReceivedSpy).toHaveBeenCalledOnce();
      expect(driver.getBufferPosition()).toBe(0);
    });

    test('should handle buffer overflow correctly', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.setBufferSize(10);
      
      // 首先填充一些数据
      const data1 = Buffer.from('12345');
      driver.simulateDataReceive(data1);
      expect(driver.getBufferPosition()).toBe(5);
      
      // 添加会导致溢出的数据（6字节，总共11字节超过缓冲区10字节）
      const data2 = Buffer.from('678901'); 
      driver.simulateDataReceive(data2);
      
      // 应该先刷新旧缓冲区，然后新数据放入缓冲区
      expect(dataReceivedSpy).toHaveBeenCalledTimes(1);
      expect(dataReceivedSpy).toHaveBeenCalledWith(Buffer.from('12345'));
      expect(driver.getBufferPosition()).toBe(6); // 新数据应该在缓冲区中
    });

    test('should handle data larger than buffer size', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.setBufferSize(10);
      
      // 发送比缓冲区更大的数据
      const largeData = Buffer.alloc(20);
      driver.simulateDataReceive(largeData);
      
      // 应该直接发出，不经过缓冲
      expect(dataReceivedSpy).toHaveBeenCalledOnce();
      expect(dataReceivedSpy).toHaveBeenCalledWith(largeData);
      expect(driver.getBufferPosition()).toBe(0);
    });

    test('should update statistics on data reception', () => {
      const data = Buffer.from('Test Data');
      const initialStats = driver.getStats();
      
      // 添加小延迟确保时间戳不同
      const startTime = Date.now();
      while (Date.now() === startTime) {
        // 忙等待直到时间戳变化
      }
      
      driver.simulateDataReceive(data);
      
      const updatedStats = driver.getStats();
      expect(updatedStats.bytesReceived).toBe(initialStats.bytesReceived + data.length);
      expect(updatedStats.lastActivity).toBeGreaterThanOrEqual(initialStats.lastActivity);
    });
  });

  describe('Buffer Management', () => {
    test('should set buffer size correctly', () => {
      const newSize = 16384;
      driver.setBufferSize(newSize);
      
      const buffer = driver.getDataBuffer();
      expect(buffer.length).toBe(newSize);
      expect(driver.getBufferPosition()).toBe(0);
    });

    test('should ignore invalid buffer sizes', () => {
      const originalSize = driver.getDataBuffer().length;
      
      driver.setBufferSize(0);
      expect(driver.getDataBuffer().length).toBe(originalSize);
      
      driver.setBufferSize(-100);
      expect(driver.getDataBuffer().length).toBe(originalSize);
    });

    test('should reset buffer position when size changes', () => {
      // 添加一些数据到缓冲区
      const data = Buffer.from('Test');
      driver.simulateDataReceive(data);
      expect(driver.getBufferPosition()).toBe(4);
      
      // 改变缓冲区大小应该重置位置
      driver.setBufferSize(16384);
      expect(driver.getBufferPosition()).toBe(0);
    });

    test('should flush buffer correctly', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const data = Buffer.from('Test Data');
      driver.simulateDataReceive(data);
      
      // 缓冲区应该有数据
      expect(driver.getBufferPosition()).toBe(data.length);
      
      // 刷新缓冲区
      driver.flushBuffer();
      expect(dataReceivedSpy).toHaveBeenCalledWith(data);
      expect(driver.getBufferPosition()).toBe(0);
      
      // 再次刷新空缓冲区不应该有任何事件
      driver.flushBuffer();
      expect(dataReceivedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors correctly', () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);

      const testError = new Error('Test error');
      driver.simulateError(testError);
      
      expect(errorSpy).toHaveBeenCalledWith(testError);
      
      const stats = driver.getStats();
      expect(stats.errors).toBe(1);
    });

    test('should track multiple errors', () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);

      driver.simulateError(new Error('Error 1'));
      driver.simulateError(new Error('Error 2'));
      driver.simulateError(new Error('Error 3'));
      
      expect(errorSpy).toHaveBeenCalledTimes(3);
      
      const stats = driver.getStats();
      expect(stats.errors).toBe(3);
    });
  });

  describe('Statistics Management', () => {
    test('should calculate uptime correctly', () => {
      vi.useFakeTimers();
      
      const stats1 = driver.getStats();
      
      // 等待一小段时间
      vi.advanceTimersByTime(100);
      
      const stats2 = driver.getStats();
      expect(stats2.uptime).toBeGreaterThanOrEqual(stats1.uptime);
      
      vi.useRealTimers();
    });

    test('should reset statistics correctly', () => {
      vi.useFakeTimers();
      vi.setSystemTime(5000);
      
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);
      
      // 生成一些统计数据
      driver.simulateDataReceive(Buffer.from('Test1'));
      driver.simulateError(new Error('Test error'));
      
      let stats = driver.getStats();
      expect(stats.bytesReceived).toBeGreaterThan(0);
      expect(stats.errors).toBeGreaterThan(0);
      
      // 前进时间然后重置统计
      vi.advanceTimersByTime(100);
      driver.resetStats();
      
      vi.advanceTimersByTime(50);
      stats = driver.getStats();
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.uptime).toBe(50); // 重置后经过的时间
      expect(stats.lastActivity).toBeGreaterThan(0);
      
      vi.useRealTimers();
    });
  });

  describe('Lifecycle and Cleanup', () => {
    test('should destroy driver correctly', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      // 添加一些缓冲数据
      driver.simulateDataReceive(Buffer.from('Test'));
      
      // 销毁驱动
      driver.destroy();
      
      // 应该刷新缓冲区并移除所有监听器
      expect(dataReceivedSpy).toHaveBeenCalledOnce();
      expect(driver.listenerCount('dataReceived')).toBe(0);
    });

    test('should handle destroy when buffer is empty', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.destroy();
      
      // 没有缓冲数据，不应该发出事件
      expect(dataReceivedSpy).not.toHaveBeenCalled();
      expect(driver.listenerCount('dataReceived')).toBe(0);
    });
  });

  describe('Event System', () => {
    test('should emit correct events for connection state changes', async () => {
      const connectedSpy = vi.fn();
      const disconnectedSpy = vi.fn();
      
      driver.on('connected', connectedSpy);
      driver.on('disconnected', disconnectedSpy);

      // 连接
      await driver.open();
      expect(connectedSpy).toHaveBeenCalledOnce();
      expect(disconnectedSpy).not.toHaveBeenCalled();

      // 断开连接
      await driver.close();
      expect(disconnectedSpy).toHaveBeenCalledOnce();
      expect(connectedSpy).toHaveBeenCalledTimes(1);
    });

    test('should emit dataSent events correctly', async () => {
      await driver.open();
      
      const dataSentSpy = vi.fn();
      driver.on('dataSent', dataSentSpy);

      const data = Buffer.from('Test Data');
      await driver.write(data);
      
      expect(dataSentSpy).toHaveBeenCalledWith(data.length);
    });

    test('should support event listener management', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      driver.on('error', listener1);
      driver.on('error', listener2);
      
      expect(driver.listenerCount('error')).toBe(2);
      
      driver.off('error', listener1);
      expect(driver.listenerCount('error')).toBe(1);
      
      driver.removeAllListeners('error');
      expect(driver.listenerCount('error')).toBe(0);
    });
  });

  describe('Thread Safety and Concurrency', () => {
    test('should handle concurrent data processing safely', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      // 模拟并发数据接收
      const data1 = Buffer.from('Data1');
      const data2 = Buffer.from('Data2'); 
      const data3 = Buffer.from('Data3');
      
      // 虽然这里是同步调用，但测试缓冲区操作的一致性
      driver.simulateDataReceive(data1);
      driver.simulateDataReceive(data2);
      driver.simulateDataReceive(data3);
      
      driver.flushBuffer();
      
      expect(dataReceivedSpy).toHaveBeenCalledOnce();
      const combinedData = Buffer.concat([data1, data2, data3]);
      expect(dataReceivedSpy).toHaveBeenCalledWith(combinedData);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle high-frequency data efficiently', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const startTime = Date.now();
      
      // 发送1000个小数据包
      for (let i = 0; i < 1000; i++) {
        driver.simulateDataReceive(Buffer.from(`data${i}`));
      }
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // 处理时间应该合理（小于100ms）
      expect(processingTime).toBeLessThan(100);
      
      // 由于缓冲，不应该有太多事件
      expect(dataReceivedSpy.mock.calls.length).toBeLessThan(50);
    });

    test('should maintain reasonable memory usage', () => {
      const originalBufferSize = driver.getDataBuffer().length;
      
      // 发送大量数据
      for (let i = 0; i < 100; i++) {
        const data = Buffer.alloc(100);
        driver.simulateDataReceive(data);
      }
      
      // 缓冲区大小不应该增长
      expect(driver.getDataBuffer().length).toBe(originalBufferSize);
    });
  });
});
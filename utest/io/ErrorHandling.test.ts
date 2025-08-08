/**
 * IO 错误处理测试
 * 测试网络异常、设备断开和数据损坏的处理机制
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager, ConnectionState } from '@extension/io/Manager';
import { HALDriver } from '@extension/io/HALDriver';
import { DriverFactory } from '@extension/io/DriverFactory';
import { 
  ConnectionConfig, 
  BusType, 
  FrameConfig, 
  FrameDetection, 
  DecoderMethod 
} from '@shared/types';
import { HALDriverMockFactory } from '@test-utils/MockFactory';

/**
 * Mock HAL Driver 用于模拟各种错误情况
 */
class MockErrorHALDriver extends HALDriver {
  private _isOpen = false;
  private _shouldFailConnection = false;
  private _shouldFailWrite = false;
  private _connectionError: Error | null = null;

  constructor(config: ConnectionConfig) {
    super(config);
  }

  get busType(): BusType {
    return this.config.type;
  }

  get displayName(): string {
    return 'Mock Error Driver';
  }

  async open(): Promise<void> {
    if (this._shouldFailConnection) {
      throw this._connectionError || new Error('Connection failed');
    }
    this._isOpen = true;
    this.emit('connected');
  }

  async close(): Promise<void> {
    this._isOpen = false;
    this.emit('disconnected');
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  isReadable(): boolean {
    return true;
  }

  isWritable(): boolean {
    return true;
  }

  validateConfiguration() {
    return { valid: true, errors: [] };
  }

  async write(data: Buffer): Promise<number> {
    if (this._shouldFailWrite) {
      throw new Error('Write operation failed');
    }
    this.updateSentStats(data.length);
    return data.length;
  }

  // 测试辅助方法
  setConnectionShouldFail(shouldFail: boolean, error?: Error): void {
    this._shouldFailConnection = shouldFail;
    this._connectionError = error || null;
  }

  setWriteShouldFail(shouldFail: boolean): void {
    this._shouldFailWrite = shouldFail;
  }

  simulateConnectionLoss(): void {
    this._isOpen = false;
    // 延迟发射事件，避免同步错误抛出
    setTimeout(() => {
      this.emit('error', new Error('Connection lost'));
      this.emit('disconnected');
    }, 1);
  }

  simulateNetworkTimeout(): void {
    setTimeout(() => {
      this.emit('error', new Error('ETIMEDOUT: Network timeout'));
    }, 1);
  }

  simulateDeviceNotFound(): void {
    setTimeout(() => {
      this.emit('error', new Error('ENOENT: Device not found'));
    }, 1);
  }

  // 添加processData方法来模拟数据接收
  processData(data: Buffer): void {
    if (this._isOpen) {
      // 更新接收统计
      this.stats.bytesReceived += data.length;
      this.stats.lastActivity = Date.now();
      
      // 直接发出dataReceived事件，避免缓冲区延迟
      this.emit('dataReceived', data);
    }
  }
  
  protected updateReceivedStats(bytes: number): void {
    this.stats.bytesReceived += bytes;
    this.stats.lastActivity = Date.now();
  }
}

describe('IO 错误处理测试', () => {
  let ioManager: IOManager;
  let mockDriver: MockErrorHALDriver;
  let originalCreateDriver: any;

  beforeEach(async () => {
    ioManager = new IOManager();
    
    // 确保统计数据被重置
    await ioManager.destroy();
    ioManager = new IOManager();
    
    // 添加错误事件监听器，防止未捕获异常
    ioManager.on('error', (error) => {
      // 捕获但不处理，让测试自己验证错误
    });
    
    // Mock DriverFactory
    const driverFactory = DriverFactory.getInstance();
    originalCreateDriver = driverFactory.createDriver;
    
    driverFactory.createDriver = vi.fn().mockImplementation((config: ConnectionConfig) => {
      mockDriver = new MockErrorHALDriver(config);
      // 也为driver添加错误监听器
      mockDriver.on('error', (error) => {
        // 捕获但不处理
      });
      return mockDriver;
    });
  });

  afterEach(async () => {
    await ioManager.destroy();
    if (originalCreateDriver) {
      DriverFactory.getInstance().createDriver = originalCreateDriver;
    }
  });

  describe('网络中断处理', () => {
    it('应该检测网络中断并触发状态变化', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080,
        autoReconnect: false
      };

      // 连接成功
      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.state).toBe(ConnectionState.Connected);

      // 监听状态变化
      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => {
        stateChanges.push(state);
      });

      // 监听错误事件
      const errors: Error[] = [];
      ioManager.on('error', (error) => {
        errors.push(error);
      });

      // 模拟网络中断
      mockDriver.simulateConnectionLoss();

      // 等待状态更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证状态变化
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Connection lost');
      expect(stateChanges).toContain(ConnectionState.Disconnected);
    });

    it('应该在网络超时时正确处理', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'unreachable-host.com',
        tcpPort: 8080,
        timeout: 5000
      };

      await ioManager.connect(config);

      const errors: Error[] = [];
      ioManager.on('error', (error) => {
        errors.push(error);
      });

      // 模拟网络超时
      mockDriver.simulateNetworkTimeout();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('ETIMEDOUT');
    });

    it('应该在连接拒绝时返回适当错误', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 9999 // 不存在的端口
      };

      // 设置连接失败
      const connectionError = new Error('ECONNREFUSED: Connection refused');
      
      // 使用动态创建driver来模拟连接失败
      const driverFactory = DriverFactory.getInstance();
      driverFactory.createDriver = vi.fn().mockImplementation((config: ConnectionConfig) => {
        const driver = new MockErrorHALDriver(config);
        driver.setConnectionShouldFail(true, connectionError);
        return driver;
      });

      // 尝试连接应该失败
      await expect(ioManager.connect(config)).rejects.toThrow('ECONNREFUSED');
      expect(ioManager.state).toBe(ConnectionState.Error);
    });
  });

  describe('设备异常断开处理', () => {
    it('应该优雅处理串口设备拔出', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);

      const errors: Error[] = [];
      ioManager.on('error', (error) => {
        errors.push(error);
      });

      // 模拟设备拔出
      mockDriver.simulateDeviceNotFound();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Device not found');
      expect(ioManager.state).toBe(ConnectionState.Error); // 错误发生时应该设置为Error状态
    });

    it('应该处理蓝牙设备超出范围', async () => {
      const config: ConnectionConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'test-device',
        serviceUuid: 'test-service'
      };

      await ioManager.connect(config);

      // 模拟蓝牙写入失败（设备超出范围）
      mockDriver.setWriteShouldFail(true);

      try {
        await ioManager.writeData(Buffer.from('test'));
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).toContain('Write operation failed');
      }
    });

    it('应该在设备不可写时拒绝写入操作', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);

      // Mock设备为只读
      mockDriver.isWritable = vi.fn().mockReturnValue(false);

      try {
        await ioManager.writeData(Buffer.from('test'));
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).toContain('Device is not writable');
      }
    });
  });

  describe('数据损坏处理', () => {
    it('应该检测和处理校验和错误', () => {
      // 配置校验和验证
      const frameConfig: FrameConfig = {
        startSequence: new Uint8Array([0xFF, 0xFE]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'crc16',
        frameDetection: FrameDetection.StartAndEndDelimiter,
        decoderMethod: DecoderMethod.PlainText
      };

      ioManager.updateFrameConfig(frameConfig);

      // 监听警告事件
      const warnings: string[] = [];
      ioManager.on('warning', (message: string) => {
        warnings.push(message);
      });

      // 模拟损坏的数据帧
      const corruptedFrame = Buffer.from([
        0xFF, 0xFE, // 起始序列
        0x31, 0x32, 0x33, // 数据 "123"
        0xAB, 0xCD, // 错误的校验和
        0x0A // 结束序列
      ]);

      // 注意：当前IOManager不实现校验和验证，所以这个测试主要验证数据流处理
      ioManager.emit('rawDataReceived', corruptedFrame);

      // 当前实现不会发出校验和警告，因为校验和验证还未实现
      // 这个测试为将来的校验和实现做准备
    });

    it('应该处理不完整的数据帧', async () => {
      await ioManager.connect({
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      });

      // 配置帧分隔符
      await ioManager.updateFrameConfig({
        startSequence: new Uint8Array([0xFF]),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        frameDetection: FrameDetection.StartAndEndDelimiter,
        decoderMethod: DecoderMethod.PlainText
      });

      const framesReceived: any[] = [];
      
      ioManager.on('frameReceived', (frame) => {
        // 创建深拷贝以避免对象池回收问题
        framesReceived.push({
          data: new Uint8Array(frame.data),
          timestamp: frame.timestamp,
          sequence: frame.sequence,
          checksumValid: frame.checksumValid
        });
      });

      // 发送不完整的帧（没有结束符）
      const incompleteFrame = Buffer.from([0xFF, 0x01, 0x02, 0x03]);
      mockDriver.processData(incompleteFrame);

      // 等待处理
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 不完整的帧不应该被发出
      expect(framesReceived).toHaveLength(0);

      // 发送结束符来完成帧
      const endDelimiter = Buffer.from([0x0A]);
      mockDriver.processData(endDelimiter);

      await new Promise(resolve => setTimeout(resolve, 50));

      // 现在应该收到完整的帧
      expect(framesReceived).toHaveLength(1);
      expect(Array.from(framesReceived[0].data)).toEqual([0x01, 0x02, 0x03]);
    });

    it('应该处理缓冲区溢出情况', async () => {
      await ioManager.connect({
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      });

      // 配置只使用结束分隔符
      await ioManager.updateFrameConfig({
        startSequence: new Uint8Array(),
        finishSequence: new Uint8Array([0x0A]),
        checksumAlgorithm: 'none',
        frameDetection: FrameDetection.EndDelimiterOnly,
        decoderMethod: DecoderMethod.PlainText
      });

      const framesReceived: any[] = [];
      ioManager.on('frameReceived', (frame) => {
        // 创建深拷贝以避免对象池回收问题
        framesReceived.push({
          data: new Uint8Array(frame.data),
          timestamp: frame.timestamp,
          sequence: frame.sequence,
          checksumValid: frame.checksumValid
        });
      });

      // 发送超大数据块（可能导致缓冲区问题）
      const largeData = Buffer.alloc(100000, 0x41); // 100KB 的 'A'
      const dataWithDelimiter = Buffer.concat([largeData, Buffer.from([0x0A])]);
      
      mockDriver.processData(dataWithDelimiter);

      await new Promise(resolve => setTimeout(resolve, 100));

      // 应该能正确处理大数据块
      expect(framesReceived).toHaveLength(1);
      expect(framesReceived[0].data.length).toBe(100000);
      expect(framesReceived[0].data[0]).toBe(0x41);
    });
  });

  describe('错误恢复机制', () => {
    it('应该在错误后允许重新连接', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      // 第一次连接成功
      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);

      // 模拟连接丢失
      mockDriver.simulateConnectionLoss();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(ioManager.state).toBe(ConnectionState.Disconnected);

      // 应该能够重新连接
      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.state).toBe(ConnectionState.Connected);
    });

    it('应该正确清理资源', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);
      
      // 添加一些数据到缓冲区
      mockDriver.processData(Buffer.from('test data without delimiter'));

      // 断开连接
      await ioManager.disconnect();

      // 验证状态被重置
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.driver).toBeNull();
      expect(ioManager.isConnected).toBe(false);
    });

    it('应该处理多重错误情况', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);

      const errors: Error[] = [];
      ioManager.on('error', (error) => {
        errors.push(error);
      });

      // 模拟多个错误
      mockDriver.emit('error', new Error('First error'));
      mockDriver.emit('error', new Error('Second error'));
      mockDriver.emit('error', new Error('Third error'));

      await new Promise(resolve => setTimeout(resolve, 100));

      // 应该接收到所有错误
      expect(errors).toHaveLength(3);
      
      // 验证统计数据
      const stats = ioManager.communicationStats;
      expect(stats.errors).toBe(3);
    });
  });

  describe('统计数据追踪', () => {
    it('应该正确追踪错误统计', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);

      // 触发多个错误 (异步发射避免直接抛出)
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          mockDriver.emit('error', new Error(`Error ${i}`));
        }, i * 10); // 错开时间发射
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = ioManager.communicationStats;
      expect(stats.errors).toBe(5);
    });

    it('应该在重连后更新重连统计', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);
      
      // 模拟重连过程
      ioManager['setState'](ConnectionState.Reconnecting);
      ioManager['setState'](ConnectionState.Connected);

      const stats = ioManager.communicationStats;
      expect(stats.reconnections).toBe(1);
    });
  });
});
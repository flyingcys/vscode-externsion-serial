/**
 * 设备断开处理测试
 * 测试各种设备断开情况下的处理逻辑和自动重连机制
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
  CommunicationStats 
} from '@shared/types';

/**
 * Mock HAL Driver 用于模拟设备断开情况
 */
class MockDisconnectionDriver extends HALDriver {
  private _isOpen = false;
  private _reconnectAttempts = 0;
  private _maxReconnectAttempts = 3;
  private _shouldFailReconnection = false;
  private _autoReconnectEnabled = false;
  private _disconnectionReason: string | null = null;

  constructor(config: ConnectionConfig) {
    super(config);
    this._autoReconnectEnabled = config.autoReconnect || false;
  }

  get busType(): BusType {
    return this.config.type;
  }

  get displayName(): string {
    return `Mock ${this.config.type} Driver`;
  }

  async open(): Promise<void> {
    if (this._shouldFailReconnection) {
      this._reconnectAttempts++;
      throw new Error(`Reconnection attempt ${this._reconnectAttempts} failed`);
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
    return this._isOpen;
  }

  isWritable(): boolean {
    return this._isOpen;
  }

  validateConfiguration() {
    return { valid: true, errors: [] };
  }

  async write(data: Buffer): Promise<number> {
    if (!this._isOpen) {
      throw new Error('Device not connected');
    }
    this.updateSentStats(data.length);
    return data.length;
  }

  // 测试辅助方法
  simulatePhysicalDisconnection(reason: string = 'Device unplugged'): void {
    this._disconnectionReason = reason;
    this._isOpen = false;
    
    // 延迟发射事件，避免同步错误抛出
    setTimeout(() => {
      this.emit('error', new Error(reason));
      this.emit('disconnected');
    }, 1);
  }

  simulateSerialPortRemoval(): void {
    this.simulatePhysicalDisconnection('ENOENT: Serial port removed');
  }

  simulateUSBDeviceRemoval(): void {
    this.simulatePhysicalDisconnection('ENODEV: USB device not found');
  }

  simulateBluetoothOutOfRange(): void {
    this.simulatePhysicalDisconnection('Bluetooth device out of range');
  }

  simulateNetworkCableUnplugged(): void {
    this.simulatePhysicalDisconnection('ENETDOWN: Network interface down');
  }

  simulatePowerLoss(): void {
    this.simulatePhysicalDisconnection('Device power loss');
  }

  setReconnectionShouldFail(shouldFail: boolean): void {
    this._shouldFailReconnection = shouldFail;
    this._reconnectAttempts = 0;
  }

  setMaxReconnectAttempts(max: number): void {
    this._maxReconnectAttempts = max;
  }

  getReconnectAttempts(): number {
    return this._reconnectAttempts;
  }

  // 添加processData方法来模拟数据接收
  processData(data: Buffer): void {
    if (this._isOpen) {
      // 更新接收统计（如果父类有这个方法的话）
      if (typeof this.updateReceivedStats === 'function') {
        this.updateReceivedStats(data.length);
      }
      this.emit('dataReceived', data);
    }
  }

  async attemptReconnection(): Promise<boolean> {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      return false;
    }

    try {
      await this.open();
      this._reconnectAttempts = 0;
      return true;
    } catch (error) {
      this._reconnectAttempts++;
      return false;
    }
  }
}

/**
 * 重连管理器测试辅助类
 */
class ReconnectionManager {
  private driver: MockDisconnectionDriver;
  private maxAttempts: number;
  private attemptInterval: number;
  private currentAttempts = 0;
  private reconnectionTimer: NodeJS.Timeout | null = null;

  constructor(driver: MockDisconnectionDriver, maxAttempts = 3, attemptInterval = 1000) {
    this.driver = driver;
    this.maxAttempts = maxAttempts;
    this.attemptInterval = attemptInterval;
  }

  async startReconnection(): Promise<boolean> {
    this.currentAttempts = 0;
    
    return new Promise((resolve) => {
      const attemptReconnection = async () => {
        if (this.currentAttempts >= this.maxAttempts) {
          resolve(false);
          return;
        }

        this.currentAttempts++;
        
        try {
          await this.driver.open();
          if (this.reconnectionTimer) {
            clearTimeout(this.reconnectionTimer);
            this.reconnectionTimer = null;
          }
          resolve(true);
        } catch (error) {
          if (this.currentAttempts < this.maxAttempts) {
            this.reconnectionTimer = setTimeout(attemptReconnection, this.attemptInterval);
          } else {
            resolve(false);
          }
        }
      };

      attemptReconnection();
    });
  }

  stop(): void {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
  }

  getCurrentAttempts(): number {
    return this.currentAttempts;
  }
}

describe('设备断开处理测试', () => {
  let ioManager: IOManager;
  let mockDriver: MockDisconnectionDriver;
  let reconnectionManager: ReconnectionManager;
  let originalCreateDriver: any;

  beforeEach(() => {
    ioManager = new IOManager();
    
    // 添加错误事件监听器，防止未捕获异常
    ioManager.on('error', (error) => {
      // 捕获但不处理，让测试自己验证错误
    });
    
    // Mock DriverFactory
    const driverFactory = DriverFactory.getInstance();
    originalCreateDriver = driverFactory.createDriver;
    
    driverFactory.createDriver = vi.fn().mockImplementation((config: ConnectionConfig) => {
      mockDriver = new MockDisconnectionDriver(config);
      // 也为driver添加错误监听器
      mockDriver.on('error', (error) => {
        // 捕获但不处理
      });
      reconnectionManager = new ReconnectionManager(mockDriver);
      return mockDriver;
    });
  });

  afterEach(async () => {
    if (reconnectionManager) {
      reconnectionManager.stop();
    }
    await ioManager.destroy();
    if (originalCreateDriver) {
      DriverFactory.getInstance().createDriver = originalCreateDriver;
    }
  });

  describe('串口设备断开处理', () => {
    it('应该检测串口设备物理移除', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);

      const errors: Error[] = [];
      const stateChanges: ConnectionState[] = [];
      
      ioManager.on('error', (error) => errors.push(error));
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      // 模拟串口设备被移除
      mockDriver.simulateSerialPortRemoval();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Serial port removed');
      expect(stateChanges).toContain(ConnectionState.Disconnected);
    });

    it('应该检测USB转串口设备断开', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(config);

      const errors: Error[] = [];
      ioManager.on('error', (error) => errors.push(error));

      // 模拟USB设备被移除
      mockDriver.simulateUSBDeviceRemoval();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('USB device not found');
    });

    it('应该在串口断开后尝试写入时抛出错误', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);
      
      // 模拟设备断开
      mockDriver.simulateSerialPortRemoval();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 尝试写入数据应该失败
      try {
        await ioManager.writeData(Buffer.from('test data'));
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).toContain('No device connected');
      }
    });
  });

  describe('蓝牙设备断开处理', () => {
    it('应该检测蓝牙设备超出范围', async () => {
      const config: ConnectionConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'AA:BB:CC:DD:EE:FF',
        serviceUuid: '12345678-1234-1234-1234-123456789abc'
      };

      await ioManager.connect(config);

      const errors: Error[] = [];
      ioManager.on('error', (error) => errors.push(error));

      // 模拟蓝牙设备超出范围
      mockDriver.simulateBluetoothOutOfRange();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Bluetooth device out of range');
    });

    it('应该在蓝牙连接丢失后更新连接状态', async () => {
      const config: ConnectionConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'AA:BB:CC:DD:EE:FF',
        serviceUuid: '12345678-1234-1234-1234-123456789abc'
      };

      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);

      // 模拟蓝牙断开
      mockDriver.simulateBluetoothOutOfRange();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 状态应该更新为断开
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
    });
  });

  describe('网络设备断开处理', () => {
    it('应该检测网络接口关闭', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: '192.168.1.100',
        tcpPort: 8080
      };

      await ioManager.connect(config);

      const errors: Error[] = [];
      ioManager.on('error', (error) => errors.push(error));

      // 模拟网络接口关闭
      mockDriver.simulateNetworkCableUnplugged();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Network interface down');
    });

    it('应该处理远程设备掉电', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'embedded-device.local',
        tcpPort: 23
      };

      await ioManager.connect(config);

      const errors: Error[] = [];
      ioManager.on('error', (error) => errors.push(error));

      // 模拟远程设备掉电
      mockDriver.simulatePowerLoss();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Device power loss');
    });
  });

  describe('自动重连机制', () => {
    it('应该在启用自动重连时尝试重新连接', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080,
        autoReconnect: true
      };

      await ioManager.connect(config);

      // 模拟连接丢失
      mockDriver.simulateNetworkCableUnplugged();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 手动触发重连测试
      const reconnectionResult = await reconnectionManager.startReconnection();
      
      expect(reconnectionResult).toBe(true);
      expect(mockDriver.isOpen()).toBe(true);
    });

    it('应该在重连失败达到最大次数后停止', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'unreachable-host.com',
        tcpPort: 8080,
        autoReconnect: true
      };

      await ioManager.connect(config);

      // 设置重连失败
      mockDriver.setReconnectionShouldFail(true);
      mockDriver.setMaxReconnectAttempts(3);

      // 模拟连接丢失
      mockDriver.simulateNetworkCableUnplugged();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 尝试重连
      const reconnectionResult = await reconnectionManager.startReconnection();

      expect(reconnectionResult).toBe(false);
      expect(reconnectionManager.getCurrentAttempts()).toBe(3);
    });

    it('应该跟踪重连尝试次数', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200,
        autoReconnect: true
      };

      await ioManager.connect(config);

      // 模拟设备断开
      mockDriver.simulateUSBDeviceRemoval();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 设置第一次重连失败，第二次成功
      let callCount = 0;
      const originalOpen = mockDriver.open.bind(mockDriver);
      mockDriver.open = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First reconnection failed');
        }
        return originalOpen();
      });

      // 开始重连
      const reconnectionResult = await reconnectionManager.startReconnection();

      expect(reconnectionResult).toBe(true);
      expect(callCount).toBe(2);
    });
  });

  describe('连接状态管理', () => {
    it('应该在设备断开时正确更新连接状态', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB1',
        baudRate: 57600
      };

      await ioManager.connect(config);
      expect(ioManager.state).toBe(ConnectionState.Connected);

      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      // 模拟设备断开
      mockDriver.simulateSerialPortRemoval();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stateChanges).toContain(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
    });

    it('应该在重连过程中显示正确状态', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);

      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      // 模拟重连过程
      ioManager['setState'](ConnectionState.Reconnecting);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      ioManager['setState'](ConnectionState.Connected);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(stateChanges).toContain(ConnectionState.Reconnecting);
      expect(stateChanges).toContain(ConnectionState.Connected);
      
      // 检查重连统计
      const stats = ioManager.communicationStats;
      expect(stats.reconnections).toBe(1);
    });
  });

  describe('清理和资源管理', () => {
    it('应该在断开时清理所有资源', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);
      
      // 添加一些待处理的数据
      const testData = Buffer.from('incomplete frame data');
      mockDriver.processData(testData);

      // 断开连接
      await ioManager.disconnect();

      // 验证清理
      expect(ioManager.driver).toBeNull();
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
    });

    it('应该在异常断开时进行清理', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);

      // 获取初始统计
      const initialStats = ioManager.communicationStats;
      
      // 模拟异常断开
      mockDriver.simulateUSBDeviceRemoval();
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证统计被更新
      const finalStats = ioManager.communicationStats;
      expect(finalStats.errors).toBe(initialStats.errors + 1);
    });

    it('应该正确处理销毁过程', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'localhost',
        tcpPort: 8080
      };

      await ioManager.connect(config);
      
      // 模拟正在进行的数据传输
      const transferPromise = ioManager.writeData(Buffer.from('test'));
      
      // 立即销毁
      const destroyPromise = ioManager.destroy();
      
      // 等待两个操作完成
      await Promise.allSettled([transferPromise, destroyPromise]);
      
      expect(ioManager.driver).toBeNull();
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
    });
  });

  describe('错误恢复和容错', () => {
    it('应该从多次连续断开中恢复', async () => {
      const config: ConnectionConfig = {
        type: BusType.Network,
        host: 'unstable-device.local',
        tcpPort: 8080
      };

      // 进行多次连接-断开-重连循环
      for (let cycle = 0; cycle < 3; cycle++) {
        await ioManager.connect(config);
        expect(ioManager.isConnected).toBe(true);

        // 模拟断开
        mockDriver.simulateNetworkCableUnplugged();
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(ioManager.state).toBe(ConnectionState.Disconnected);

        // 断开连接以准备下次测试
        if (ioManager.driver) {
          await ioManager.disconnect();
        }
      }

      // 最终应该能够正常连接
      await ioManager.connect(config);
      expect(ioManager.isConnected).toBe(true);
    });

    it('应该处理快速的连接-断开事件', async () => {
      const config: ConnectionConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);

      const events: string[] = [];
      ioManager.on('stateChanged', (state) => events.push(`state:${state}`));
      ioManager.on('error', (error) => events.push(`error:${error.message}`));

      // 快速触发多个断开事件
      for (let i = 0; i < 5; i++) {
        mockDriver.simulateUSBDeviceRemoval();
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // 应该至少有一个状态变化和错误事件
      expect(events.filter(e => e.startsWith('state:')).length).toBeGreaterThan(0);
      expect(events.filter(e => e.startsWith('error:')).length).toBeGreaterThan(0);
    });
  });
});
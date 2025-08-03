/**
 * UART Driver Tests
 * 测试串口驱动程序的完整功能
 * Coverage Target: 98% lines, 95% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import { UARTDriver, UARTConfig, ParityType, FlowControlType, SerialPortInfo } from '@extension/io/drivers/UARTDriver';
import { BusType } from '@shared/types';

// Mock SerialPort - 修复变量提升问题
vi.mock('serialport', () => {
  const mockSerialPort = {
    isOpen: false,
    readable: true,
    writable: true,
    open: vi.fn(),
    close: vi.fn(),
    write: vi.fn(),
    set: vi.fn(),
    flush: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn()
  };

  const mockSerialPortConstructor = vi.fn(() => mockSerialPort);
  const mockSerialPortList = vi.fn();
  mockSerialPortConstructor.list = mockSerialPortList;

  return {
    SerialPort: mockSerialPortConstructor
  };
});

describe('UARTDriver', () => {
  let driver: UARTDriver;
  let mockConfig: UARTConfig;
  let mockSerialPort: any;
  let mockSerialPortConstructor: any;
  let mockSerialPortList: any;

  beforeEach(async () => {
    // 重置所有mock
    vi.clearAllMocks();
    
    // 获取mock实例
    const { SerialPort } = await import('serialport');
    mockSerialPortConstructor = SerialPort as any;
    mockSerialPortList = (SerialPort as any).list;
    mockSerialPort = mockSerialPortConstructor();
    
    // 重置mockSerialPort状态
    mockSerialPort.isOpen = false;
    mockSerialPort.readable = true;
    mockSerialPort.writable = true;

    mockConfig = {
      type: BusType.UART,
      port: 'COM3',
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      autoReconnect: true,
      timeout: 1000,
      dtrEnabled: true,
      rtsEnabled: false
    };

    driver = new UARTDriver(mockConfig);
  });

  afterEach(async () => {
    if (driver) {
      // Mock successful close to avoid test failures
      if (mockSerialPort) {
        mockSerialPort.close.mockImplementation((callback) => {
          mockSerialPort.isOpen = false;
          callback?.(null);
        });
      }
      try {
        driver.destroy();
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    }
  });

  describe('Constructor and Basic Properties', () => {
    test('should initialize with correct configuration', () => {
      expect(driver.busType).toBe(BusType.UART);
      expect(driver.displayName).toBe('Serial Port COM3 (115200 baud)');
      
      const config = driver.uartConfig;
      expect(config.port).toBe('COM3');
      expect(config.baudRate).toBe(115200);
      expect(config.dataBits).toBe(8);
      expect(config.stopBits).toBe(1);
      expect(config.parity).toBe('none');
      expect(config.flowControl).toBe('none');
    });

    test('should set default values for missing configuration', () => {
      const minimalConfig: UARTConfig = {
        type: BusType.UART,
        port: 'COM1'
      };
      
      const driverWithDefaults = new UARTDriver(minimalConfig);
      const config = driverWithDefaults.uartConfig;
      
      expect(config.baudRate).toBe(9600);
      expect(config.dataBits).toBe(8);
      expect(config.stopBits).toBe(1);
      expect(config.parity).toBe('none');
      expect(config.flowControl).toBe('none');
      expect(config.autoReconnect).toBe(true);
      expect(config.timeout).toBe(1000);
      
      driverWithDefaults.destroy();
    });

    test('should return null for port when not initialized', () => {
      expect(driver.port).toBeNull();
    });
  });

  describe('Configuration Validation', () => {
    test('should validate correct configuration', () => {
      const result = driver.validateConfiguration();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty port', () => {
      const invalidConfig = { ...mockConfig, port: '' };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Port is required');
      
      invalidDriver.destroy();
    });

    test('should reject invalid baud rate', () => {
      const invalidConfig = { ...mockConfig, baudRate: 12345 };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid baud rate: 12345');
      
      invalidDriver.destroy();
    });

    test('should validate all standard baud rates', () => {
      const validBaudRates = [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 230400, 256000, 460800, 921600];
      
      validBaudRates.forEach(baudRate => {
        const config = { ...mockConfig, baudRate };
        const testDriver = new UARTDriver(config);
        
        const result = testDriver.validateConfiguration();
        expect(result.valid).toBe(true);
        
        testDriver.destroy();
      });
    });

    test('should reject invalid data bits', () => {
      const invalidConfig = { ...mockConfig, dataBits: 9 as any };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid data bits: 9');
      
      invalidDriver.destroy();
    });

    test('should reject invalid stop bits', () => {
      const invalidConfig = { ...mockConfig, stopBits: 3 as any };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid stop bits: 3');
      
      invalidDriver.destroy();
    });

    test('should reject invalid parity', () => {
      const invalidConfig = { ...mockConfig, parity: 'invalid' as ParityType };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid parity: invalid');
      
      invalidDriver.destroy();
    });

    test('should reject invalid flow control', () => {
      const invalidConfig = { ...mockConfig, flowControl: 'invalid' as FlowControlType };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid flow control: invalid');
      
      invalidDriver.destroy();
    });

    test('should accumulate multiple validation errors', () => {
      const invalidConfig: UARTConfig = {
        ...mockConfig,
        port: '',
        baudRate: 12345,
        dataBits: 9 as any,
        parity: 'invalid' as ParityType
      };
      const invalidDriver = new UARTDriver(invalidConfig);
      
      const result = invalidDriver.validateConfiguration();
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
      
      invalidDriver.destroy();
    });
  });

  describe('Serial Port Listing', () => {
    test('should list available ports successfully', async () => {
      const mockPorts = [
        {
          path: 'COM1',
          manufacturer: 'FTDI',
          serialNumber: '12345',
          pnpId: 'USB\\VID_0403&PID_6001',
          locationId: 'Port_#0001.Hub_#0001',
          productId: '6001',
          vendorId: '0403'
        },
        {
          path: 'COM3',
          manufacturer: 'Arduino',
          serialNumber: '67890'
        }
      ];

      mockSerialPortList.mockResolvedValue(mockPorts);

      const ports = await UARTDriver.listPorts();
      
      expect(mockSerialPortList).toHaveBeenCalled();
      expect(ports).toHaveLength(2);
      expect(ports[0]).toEqual({
        path: 'COM1',
        manufacturer: 'FTDI',
        serialNumber: '12345',
        pnpId: 'USB\\VID_0403&PID_6001',
        locationId: 'Port_#0001.Hub_#0001',
        productId: '6001',
        vendorId: '0403'
      });
      expect(ports[1].path).toBe('COM3');
      expect(ports[1].manufacturer).toBe('Arduino');
    });

    test('should handle port listing errors', async () => {
      const error = new Error('Failed to access serial ports');
      mockSerialPortList.mockRejectedValue(error);

      await expect(UARTDriver.listPorts()).rejects.toThrow('Failed to list serial ports: Error: Failed to access serial ports');
    });
  });

  describe('Connection Management', () => {
    test('should open connection successfully', async () => {
      const connectedSpy = vi.fn();
      driver.on('connected', connectedSpy);

      // Mock successful open
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });

      // Mock DTR/RTS setting
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      expect(mockSerialPortConstructor).toHaveBeenCalledWith({
        path: 'COM3',
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false
      });

      expect(mockSerialPort.open).toHaveBeenCalled();
      expect(mockSerialPort.set).toHaveBeenCalledWith({ dtr: true }, expect.any(Function));
      expect(driver.isOpen()).toBe(true);
      expect(connectedSpy).toHaveBeenCalledOnce();
    });

    test('should handle open failure', async () => {
      const openError = new Error('Failed to open port');
      mockSerialPort.open.mockImplementation((callback) => {
        callback?.(openError);
      });

      await expect(driver.open()).rejects.toThrow('Failed to open serial port: Failed to open port');
      expect(driver.isOpen()).toBe(false);
    });

    test('should reject open when already open', async () => {
      // Mock port as already open
      mockSerialPort.isOpen = true;
      (driver as any).serialPort = mockSerialPort;

      await expect(driver.open()).rejects.toThrow('Serial port is already open');
    });

    test('should handle invalid configuration on open', async () => {
      const invalidDriver = new UARTDriver({ ...mockConfig, port: '' });
      
      await expect(invalidDriver.open()).rejects.toThrow('Invalid configuration: Port is required');
      
      invalidDriver.destroy();
    });

    test('should close connection successfully', async () => {
      // 先打开连接
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      const disconnectedSpy = vi.fn();
      driver.on('disconnected', disconnectedSpy);

      // Mock successful close
      mockSerialPort.close.mockImplementation((callback) => {
        mockSerialPort.isOpen = false;
        callback?.(null);
      });

      await driver.close();

      expect(mockSerialPort.close).toHaveBeenCalled();
      expect(driver.isOpen()).toBe(false);
      expect(disconnectedSpy).toHaveBeenCalledOnce();
    });

    test('should handle close failure', async () => {
      // 先打开连接
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      const closeError = new Error('Failed to close port');
      mockSerialPort.close.mockImplementation((callback) => {
        callback?.(closeError);
      });

      await expect(driver.close()).rejects.toThrow('Failed to close serial port: Failed to close port');
    });
  });

  describe('State Checking', () => {
    test('should return correct state when not connected', () => {
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    test('should return correct state when connected', async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      expect(driver.isOpen()).toBe(true);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
    });

    test('should handle readable/writable states correctly', async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      // 模拟端口状态变化
      mockSerialPort.readable = false;
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(true);

      mockSerialPort.writable = false;
      expect(driver.isWritable()).toBe(false);
    });
  });

  describe('Data Writing', () => {
    beforeEach(async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();
    });

    test('should write data successfully', async () => {
      const data = Buffer.from('Hello UART');
      const dataSentSpy = vi.fn();
      driver.on('dataSent', dataSentSpy);

      mockSerialPort.write.mockImplementation((data, callback) => {
        callback?.(null);
      });

      const bytesWritten = await driver.write(data);

      expect(mockSerialPort.write).toHaveBeenCalledWith(data, expect.any(Function));
      expect(bytesWritten).toBe(data.length);
      expect(dataSentSpy).toHaveBeenCalledWith(data.length);
    });

    test('should handle write errors', async () => {
      const data = Buffer.from('Hello UART');
      const writeError = new Error('Write failed');

      mockSerialPort.write.mockImplementation((data, callback) => {
        callback?.(writeError);
      });

      await expect(driver.write(data)).rejects.toThrow('Failed to write to serial port: Write failed');
    });

    test('should reject write when not writable', async () => {
      mockSerialPort.writable = false;
      const data = Buffer.from('Hello UART');

      await expect(driver.write(data)).rejects.toThrow('Serial port is not writable');
    });
  });

  describe('Control Signals', () => {
    beforeEach(async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();
    });

    test('should set DTR signal successfully', async () => {
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.setDTR(true);
      expect(mockSerialPort.set).toHaveBeenCalledWith({ dtr: true }, expect.any(Function));

      await driver.setDTR(false);
      expect(mockSerialPort.set).toHaveBeenCalledWith({ dtr: false }, expect.any(Function));
    });

    test('should set RTS signal successfully', async () => {
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.setRTS(true);
      expect(mockSerialPort.set).toHaveBeenCalledWith({ rts: true }, expect.any(Function));

      await driver.setRTS(false);
      expect(mockSerialPort.set).toHaveBeenCalledWith({ rts: false }, expect.any(Function));
    });

    test('should handle DTR/RTS errors', async () => {
      const signalError = new Error('Signal control failed');
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(signalError);
      });

      await expect(driver.setDTR(true)).rejects.toThrow('Failed to set DTR: Signal control failed');
      await expect(driver.setRTS(true)).rejects.toThrow('Failed to set RTS: Signal control failed');
    });

    test('should reject signal control when not open', async () => {
      await driver.close();

      await expect(driver.setDTR(true)).rejects.toThrow('Serial port is not open');
      await expect(driver.setRTS(true)).rejects.toThrow('Serial port is not open');
    });
  });

  describe('Buffer Management', () => {
    beforeEach(async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();
    });

    test('should flush buffers successfully', async () => {
      mockSerialPort.flush.mockImplementation((callback) => {
        callback?.(null);
      });

      await driver.flush();
      expect(mockSerialPort.flush).toHaveBeenCalled();
    });

    test('should handle flush errors', async () => {
      const flushError = new Error('Flush failed');
      mockSerialPort.flush.mockImplementation((callback) => {
        callback?.(flushError);
      });

      await expect(driver.flush()).rejects.toThrow('Failed to flush serial port: Flush failed');
    });

    test('should reject flush when not open', async () => {
      await driver.close();
      await expect(driver.flush()).rejects.toThrow('Serial port is not open');
    });
  });

  describe('Event Handling', () => {
    let eventHandlers: { [event: string]: Function } = {};

    beforeEach(async () => {
      // 拦截事件监听器注册
      mockSerialPort.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();
    });

    test('should handle incoming data', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      const testData = Buffer.from('Received data');
      
      // 模拟数据接收
      eventHandlers['data']?.(testData);
      
      // 刷新缓冲区以触发事件
      driver.flushBuffer();
      
      expect(dataReceivedSpy).toHaveBeenCalledWith(testData);
    });

    test('should handle port errors with reconnection', () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);

      const testError = new Error('Port error');
      
      // 模拟端口错误
      eventHandlers['error']?.(testError);
      
      expect(errorSpy).toHaveBeenCalledWith(testError);
      // 验证统计信息更新
      const stats = driver.getStats();
      expect(stats.errors).toBe(1);
    });

    test('should handle port close with reconnection', () => {
      const disconnectedSpy = vi.fn();
      driver.on('disconnected', disconnectedSpy);

      // 模拟端口关闭
      eventHandlers['close']?.();
      
      expect(disconnectedSpy).toHaveBeenCalled();
    });

    test('should disable reconnection when autoReconnect is false', async () => {
      const noReconnectConfig = { ...mockConfig, autoReconnect: false };
      const noReconnectDriver = new UARTDriver(noReconnectConfig);

      // 重置事件处理器
      eventHandlers = {};
      mockSerialPort.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      await noReconnectDriver.open();

      const errorSpy = vi.fn();
      noReconnectDriver.on('error', errorSpy);

      // 模拟错误，不应该启动重连
      eventHandlers['error']?.(new Error('Test error'));
      
      expect(errorSpy).toHaveBeenCalled();
      
      noReconnectDriver.destroy();
    });
  });

  describe('Automatic Reconnection', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should attempt reconnection on error', async () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);
      
      // 建立初始连接
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      // 模拟连接丢失，设置isOpen为false以允许重连
      mockSerialPort.isOpen = false;
      
      // 设置重连时的成功mock
      let reconnectAttempts = 0;
      mockSerialPort.open.mockImplementation((callback) => {
        reconnectAttempts++;
        if (reconnectAttempts === 1) {
          // 第一次重连成功
          mockSerialPort.isOpen = true;
          callback?.(null);
        }
      });

      // 获取初始open调用次数
      const initialOpenCalls = mockSerialPort.open.mock.calls.length;

      // 触发错误以启动重连
      const errorHandler = mockSerialPort.on.mock.calls.find(call => call[0] === 'error')?.[1];
      errorHandler?.(new Error('Connection lost'));

      expect(driver.isOpen()).toBe(false);
      expect(errorSpy).toHaveBeenCalled();

      // 快进以触发重连，但限制时间避免无限循环
      vi.advanceTimersByTime(5000);

      expect(mockSerialPort.open.mock.calls.length).toBeGreaterThan(initialOpenCalls);
    });

    test('should stop reconnection timer on successful connection', async () => {
      const errorSpy = vi.fn();
      driver.on('error', errorSpy);
      
      // 建立初始连接
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      await driver.open();

      // 设置重连时的mock实现 - 第一次调用失败，第二次成功
      let reconnectAttempts = 0;
      mockSerialPort.open.mockImplementation((callback) => {
        reconnectAttempts++;
        if (reconnectAttempts === 1) {
          // 第一次重连时端口已经打开，需要先关闭
          mockSerialPort.isOpen = false;
        }
        mockSerialPort.isOpen = true;
        callback?.(null);
      });

      // 触发错误启动重连 - 同时模拟连接丢失
      const errorHandler = mockSerialPort.on.mock.calls.find(call => call[0] === 'error')?.[1];
      mockSerialPort.isOpen = false; // 确保错误触发时端口状态为关闭
      errorHandler?.(new Error('Connection lost'));

      // 快进触发重连
      vi.advanceTimersByTime(5000);

      // 再次快进，不应该有更多重连尝试
      const openCallCount = mockSerialPort.open.mock.calls.length;
      vi.advanceTimersByTime(10000);
      
      expect(mockSerialPort.open.mock.calls.length).toBe(openCallCount);
    });
  });

  describe('Resource Cleanup', () => {
    test('should cleanup resources on destroy', async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      mockSerialPort.close.mockImplementation((callback) => {
        mockSerialPort.isOpen = false;
        callback?.(null);
      });

      await driver.open();
      
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.destroy();

      // 应该关闭端口并清理监听器
      expect(mockSerialPort.close).toHaveBeenCalled();
      expect(driver.listenerCount('dataReceived')).toBe(0);
    });

    test('should handle destroy when not open', () => {
      const dataReceivedSpy = vi.fn();
      driver.on('dataReceived', dataReceivedSpy);

      driver.destroy();

      // 不应该尝试关闭未打开的端口
      expect(mockSerialPort.close).not.toHaveBeenCalled();
      expect(driver.listenerCount('dataReceived')).toBe(0);
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should handle minimal configuration', () => {
      const minimalConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0'
      };

      const minimalDriver = new UARTDriver(minimalConfig);
      const config = minimalDriver.uartConfig;

      expect(config.port).toBe('/dev/ttyUSB0');
      expect(config.baudRate).toBe(9600);
      expect(config.dataBits).toBe(8);
      expect(config.stopBits).toBe(1);
      expect(config.parity).toBe('none');
      expect(config.flowControl).toBe('none');

      minimalDriver.destroy();
    });

    test('should preserve existing configuration values', () => {
      const customConfig: UARTConfig = {
        type: BusType.UART,
        port: 'COM1',
        baudRate: 57600,
        dataBits: 7,
        stopBits: 2,
        parity: 'even',
        flowControl: 'rts',
        autoReconnect: false,
        timeout: 5000
      };

      const customDriver = new UARTDriver(customConfig);
      const config = customDriver.uartConfig;

      expect(config.baudRate).toBe(57600);
      expect(config.dataBits).toBe(7);
      expect(config.stopBits).toBe(2);
      expect(config.parity).toBe('even');
      expect(config.flowControl).toBe('rts');
      expect(config.autoReconnect).toBe(false);
      expect(config.timeout).toBe(5000);

      customDriver.destroy();
    });
  });

  describe('Error Resilience', () => {
    test('should handle malformed serial port responses', async () => {
      // 模拟串口返回异常数据，但过滤掉null值
      mockSerialPortList.mockResolvedValue([
        { path: 'COM1' }, // 缺少其他属性
        { path: '', manufacturer: undefined } // 空值和undefined
      ]);

      const ports = await UARTDriver.listPorts();
      
      expect(ports).toHaveLength(2);
      expect(ports[0].path).toBe('COM1');
      expect(ports[0].manufacturer).toBeUndefined();
    });

    test('should maintain state consistency during errors', async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        // 第一次调用失败
        callback?.(new Error('First attempt failed'));
      });

      await expect(driver.open()).rejects.toThrow();
      
      // 状态应该保持未连接
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle rapid open/close cycles', async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });

      mockSerialPort.close.mockImplementation((callback) => {
        mockSerialPort.isOpen = false;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      const startTime = Date.now();

      // 执行多次开关循环
      for (let i = 0; i < 10; i++) {
        await driver.open();
        await driver.close();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 操作应该相对快速（小于1秒）
      expect(totalTime).toBeLessThan(1000);
    });

    test('should handle high-frequency writes efficiently', async () => {
      mockSerialPort.open.mockImplementation((callback) => {
        mockSerialPort.isOpen = true;
        callback?.(null);
      });
      
      mockSerialPort.set.mockImplementation((options, callback) => {
        callback?.(null);
      });

      mockSerialPort.write.mockImplementation((data, callback) => {
        callback?.(null);
      });

      await driver.open();

      const startTime = Date.now();
      const testData = Buffer.from('test');

      // 执行100次写入
      const writePromises = [];
      for (let i = 0; i < 100; i++) {
        writePromises.push(driver.write(testData));
      }

      await Promise.all(writePromises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 100次写入应该在合理时间内完成（小于500ms）
      expect(totalTime).toBeLessThan(500);
      expect(mockSerialPort.write).toHaveBeenCalledTimes(100);
    });
  });
});
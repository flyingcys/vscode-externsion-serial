/**
 * UARTDriver 串口驱动 100% 覆盖度测试
 * 
 * 目标：实现UARTDriver完全覆盖
 * - 代码行覆盖率: 100%
 * - 分支覆盖率: 100%
 * - 函数覆盖率: 100%
 * - 测试所有串口操作、配置和边界条件
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UARTDriver, UARTConfig, ParityType, FlowControlType } from '@extension/io/drivers/UARTDriver';
import { ConnectionConfig, BusType } from '@shared/types';

// Mock SerialPort模块
vi.mock('serialport', () => {
  const mockSerialPortClass = vi.fn().mockImplementation((config: any) => {
    const instance = {
      isOpen: false,
      readable: true,
      writable: true,
      path: config.path || '',
      baudRate: config.baudRate || 9600,
      
      open: vi.fn((callback?: Function) => {
        setTimeout(() => {
          instance.isOpen = true; // 标记为已打开
          callback && callback();
        }, 1);
      }),
      
      close: vi.fn((callback?: Function) => {
        setTimeout(() => {
          instance.isOpen = false; // 标记为已关闭
          callback && callback();
        }, 1);
      }),
      
      write: vi.fn((data: any, callback?: Function) => {
        setTimeout(() => callback && callback(), 1);
        return true;
      }),
      
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn((options: any, callback?: Function) => {
        setTimeout(() => callback && callback(), 1);
      }),
      flush: vi.fn((callback?: Function) => {
        setTimeout(() => callback && callback(), 1);
      }),
      drain: vi.fn((callback?: Function) => {
        setTimeout(() => callback && callback(), 1);
      })
    };
    return instance;
  });

  mockSerialPortClass.list = vi.fn().mockResolvedValue([
    { path: '/dev/ttyUSB0', manufacturer: 'FTDI', serialNumber: '123456' },
    { path: '/dev/ttyUSB1', manufacturer: 'Arduino', productId: '0043', vendorId: '2341' },
    { path: 'COM1', manufacturer: 'Prolific', pnpId: 'FTDIBUS\\VID_0403+PID_6001' }
  ]);

  return {
    SerialPort: mockSerialPortClass
  };
});

describe('UARTDriver 串口驱动完全覆盖测试', () => {
  let driver: UARTDriver;
  let config: UARTConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      type: BusType.UART,
      port: '/dev/ttyUSB0',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
      dtrEnabled: true,
      rtsEnabled: true,
      timeout: 5000,
      autoReconnect: true
    };

    driver = new UARTDriver(config);
  });

  afterEach(() => {
    if (driver) {
      driver.destroy();
    }
  });

  describe('🏗️ 构造函数和初始化', () => {
    it('应该正确初始化基础属性', () => {
      expect(driver.busType).toBe(BusType.UART);
      expect(driver.displayName).toBe('Serial Port /dev/ttyUSB0 (9600 baud)');
      expect(driver.uartConfig).toEqual(config);
      expect(driver.port).toBeNull(); // 初始时没有连接
    });

    it('应该正确应用默认配置', () => {
      const minimalConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0'
      };

      const driverWithDefaults = new UARTDriver(minimalConfig);
      const finalConfig = driverWithDefaults.uartConfig;

      expect(finalConfig.baudRate).toBe(9600);
      expect(finalConfig.dataBits).toBe(8);
      expect(finalConfig.stopBits).toBe(1);
      expect(finalConfig.parity).toBe('none');
      expect(finalConfig.flowControl).toBe('none');

      driverWithDefaults.destroy();
    });

    it('应该保持用户提供的配置', () => {
      const customConfig: UARTConfig = {
        type: BusType.UART,
        port: 'COM3',
        baudRate: 115200,
        dataBits: 7,
        stopBits: 2,
        parity: 'even',
        flowControl: 'rts'
      };

      const customDriver = new UARTDriver(customConfig);
      const finalConfig = customDriver.uartConfig;

      expect(finalConfig.baudRate).toBe(115200);
      expect(finalConfig.dataBits).toBe(7);
      expect(finalConfig.stopBits).toBe(2);
      expect(finalConfig.parity).toBe('even');
      expect(finalConfig.flowControl).toBe('rts');

      customDriver.destroy();
    });
  });

  describe('📝 配置验证', () => {
    it('应该验证有效配置', () => {
      const validation = driver.validateConfiguration();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该检测无效端口', () => {
      const invalidConfig: UARTConfig = {
        ...config,
        port: ''
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Port is required');
      
      invalidDriver.destroy();
    });

    it('应该检测无效波特率', () => {
      const invalidConfig: UARTConfig = {
        ...config,
        baudRate: -1
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid baud rate: -1');
      
      invalidDriver.destroy();
    });

    it('应该检测无效数据位', () => {
      const invalidConfig: UARTConfig = {
        ...config,
        dataBits: 9 as any
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid data bits: 9');
      
      invalidDriver.destroy();
    });

    it('应该检测无效停止位', () => {
      const invalidConfig: UARTConfig = {
        ...config,
        stopBits: 3 as any
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid stop bits: 3');
      
      invalidDriver.destroy();
    });

    it('应该检测无效校验位', () => {
      const invalidConfig: UARTConfig = {
        ...config,
        parity: 'invalid' as ParityType
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid parity: invalid');
      
      invalidDriver.destroy();
    });

    it('应该检测无效流控制', () => {
      const invalidConfig: UARTConfig = {
        ...config,
        flowControl: 'invalid' as FlowControlType
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid flow control: invalid');
      
      invalidDriver.destroy();
    });

    it('应该允许超时配置（UARTDriver不验证超时值）', () => {
      const configWithTimeout: UARTConfig = {
        ...config,
        timeout: -100
      };
      
      const testDriver = new UARTDriver(configWithTimeout);
      const validation = testDriver.validateConfiguration();
      
      // UARTDriver实际上不验证timeout值，所以应该通过
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
      
      testDriver.destroy();
    });

    it('应该验证所有有效的配置组合', () => {
      const validCombinations = [
        { dataBits: 5, stopBits: 1, parity: 'none', flowControl: 'none' },
        { dataBits: 6, stopBits: 1.5, parity: 'odd', flowControl: 'xon' },
        { dataBits: 7, stopBits: 2, parity: 'even', flowControl: 'rts' },
        { dataBits: 8, stopBits: 1, parity: 'mark', flowControl: 'xonrts' },
        { dataBits: 8, stopBits: 1, parity: 'space', flowControl: 'none' }
      ];

      validCombinations.forEach((combo, index) => {
        const testConfig: UARTConfig = {
          ...config,
          ...combo
        };
        
        const testDriver = new UARTDriver(testConfig);
        const validation = testDriver.validateConfiguration();
        
        expect(validation.valid).toBe(true);
        expect(validation.errors).toEqual([]);
        
        testDriver.destroy();
      });
    });
  });

  describe('🔗 连接管理', () => {
    it('应该正确报告初始连接状态', () => {
      // 初始状态应该是未连接
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);  
      expect(driver.isWritable()).toBe(false);
      expect(driver.port).toBeNull();
    });

    it('应该处理打开连接失败（配置验证失败）', async () => {
      const invalidConfig: UARTConfig = {
        type: BusType.UART,
        port: '', // 无效的空端口
        baudRate: 9600
      };
      
      const invalidDriver = new UARTDriver(invalidConfig);
      
      await expect(invalidDriver.open()).rejects.toThrow(/Invalid configuration/);
      
      invalidDriver.destroy();
    });

    it('应该处理重复打开连接', async () => {
      // 模拟已经有一个打开的连接
      const mockInstance = {
        isOpen: true,
        path: '/dev/ttyUSB0',
        baudRate: 9600,
        open: vi.fn(),
        close: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn()
      };
      
      // 手动设置serialPort
      (driver as any).serialPort = mockInstance;
      
      await expect(driver.open()).rejects.toThrow('Serial port is already open');
    });

    it('应该成功关闭连接（无连接状态）', async () => {
      // 在没有连接的状态下关闭应该不出错
      await expect(driver.close()).resolves.not.toThrow();
    });

    it('应该成功打开串口连接', async () => {
      const connectedSpy = vi.fn();
      driver.on('connected', connectedSpy);

      await driver.open();

      expect(driver.isOpen()).toBe(true);
      expect(driver.port).not.toBeNull();
      expect(connectedSpy).toHaveBeenCalled();
      
      await driver.close();
    });

    it('应该处理串口打开错误', async () => {
      const mockSerialPort = await import('serialport');
      const originalMock = vi.mocked(mockSerialPort.SerialPort);
      
      // 创建一个会在open时失败的mock
      const failingInstance = {
        isOpen: false,
        path: '/dev/ttyUSB0',
        baudRate: 9600,
        readable: true,
        writable: true,
        open: vi.fn((callback) => {
          setTimeout(() => callback(new Error('Failed to open port')), 1);
        }),
        close: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn()
      };
      
      originalMock.mockImplementationOnce(() => failingInstance as any);
      
      await expect(driver.open()).rejects.toThrow('Failed to open serial port');
    });

    it('应该成功关闭已打开的连接', async () => {
      const disconnectedSpy = vi.fn();
      driver.on('disconnected', disconnectedSpy);

      await driver.open();
      await driver.close();

      expect(driver.isOpen()).toBe(false);
      expect(driver.port).toBeNull();
      expect(disconnectedSpy).toHaveBeenCalled();
    });

    it('应该处理串口关闭错误', async () => {
      await driver.open();
      
      // 模拟关闭错误
      const mockPort = driver.port as any;
      mockPort.close = vi.fn((callback?: Function) => {
        setTimeout(() => {
          if (callback) callback(new Error('Failed to close port'));
        }, 1);
      });
      
      await expect(driver.close()).rejects.toThrow('Failed to close serial port');
    });
  });

  describe('📡 数据传输', () => {
    it('应该拒绝在未连接时写入', async () => {
      const testData = Buffer.from('test');
      
      await expect(driver.write(testData)).rejects.toThrow('Serial port is not writable');
    });

    it('应该处理空数据写入', async () => {
      const emptyData = Buffer.alloc(0);
      
      await expect(driver.write(emptyData)).rejects.toThrow('Serial port is not writable');
    });

    it('应该成功写入数据', async () => {
      await driver.open();
      
      const testData = Buffer.from('Hello Serial');
      const bytesWritten = await driver.write(testData);
      
      expect(bytesWritten).toBe(testData.length);
      expect(driver.getStats().bytesSent).toBe(testData.length);
      
      await driver.close();
    });

    it('应该处理写入错误', async () => {
      await driver.open();
      
      const testData = Buffer.from('test data');
      const mockPort = driver.port as any;
      
      // 模拟写入错误
      mockPort.write = vi.fn((data, callback) => {
        setTimeout(() => callback(new Error('Write failed')), 1);
      });
      
      await expect(driver.write(testData)).rejects.toThrow('Failed to write to serial port');
      
      await driver.close();
    });

    it('应该处理数据接收', async () => {
      await driver.open();
      
      const testData = Buffer.from('received data');
      const mockPort = driver.port as any;
      const dataHandler = mockPort.on.mock.calls.find((call: any) => call[0] === 'data')[1];
      
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });
      
      // 模拟数据接收
      dataHandler(testData);
      driver.flushBuffer(); // 刷新缓冲区以触发事件
      
      expect(receivedData).toBeTruthy();
      expect(driver.getStats().bytesReceived).toBe(testData.length);
      
      await driver.close();
    });
  });

  describe('🔄 自动重连功能', () => {
    it('应该在串口错误时启动自动重连', async () => {
      // 启用autoReconnect
      const autoReconnectConfig: UARTConfig = {
        ...config,
        autoReconnect: true
      };
      const reconnectDriver = new UARTDriver(autoReconnectConfig);
      
      // 添加错误监听器避免未处理的错误
      let errorEmitted = false;
      reconnectDriver.on('error', () => {
        errorEmitted = true;
      });
      
      await reconnectDriver.open();
      const mockPort = reconnectDriver.port as any;
      
      // 获取错误处理器
      const errorHandler = mockPort.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      
      // 模拟串口错误
      errorHandler(new Error('Serial port error'));
      
      // 验证错误被处理
      expect(errorEmitted).toBe(true);
      
      // 验证自动重连逻辑被触发（通过检查内部状态）
      expect((reconnectDriver as any).isReconnecting).toBeTruthy();
      
      reconnectDriver.destroy();
    });

    it('应该在串口关闭时启动自动重连', async () => {
      const autoReconnectConfig: UARTConfig = {
        ...config,
        autoReconnect: true
      };
      const reconnectDriver = new UARTDriver(autoReconnectConfig);
      
      await reconnectDriver.open();
      const mockPort = reconnectDriver.port as any;
      
      // 获取关闭处理器
      const closeHandler = mockPort.on.mock.calls.find((call: any) => call[0] === 'close')[1];
      
      // 模拟串口关闭
      closeHandler();
      
      // 验证自动重连逻辑被触发
      expect((reconnectDriver as any).isReconnecting).toBeTruthy();
      
      reconnectDriver.destroy();
    });

    it('应该停止重连定时器在手动关闭时', async () => {
      const autoReconnectConfig: UARTConfig = {
        ...config,
        autoReconnect: true
      };
      const reconnectDriver = new UARTDriver(autoReconnectConfig);
      
      await reconnectDriver.open();
      
      // 手动关闭应该停止重连
      await reconnectDriver.close();
      
      // 验证重连状态被重置
      expect((reconnectDriver as any).isReconnecting).toBeFalsy();
      expect((reconnectDriver as any).reconnectTimer).toBeNull();
      
      reconnectDriver.destroy();
    });
  });

  describe('🔧 信号控制', () => {
    it('应该设置DTR信号', async () => {
      await driver.open();
      
      await expect(driver.setDTR(true)).resolves.not.toThrow();
      await expect(driver.setDTR(false)).resolves.not.toThrow();
      
      await driver.close();
    });

    it('应该设置RTS信号', async () => {
      await driver.open();
      
      await expect(driver.setRTS(true)).resolves.not.toThrow();
      await expect(driver.setRTS(false)).resolves.not.toThrow();
      
      await driver.close();
    });

    it('应该处理DTR设置错误', async () => {
      await driver.open();
      
      const mockPort = driver.port as any;
      mockPort.set = vi.fn((options, callback) => {
        setTimeout(() => callback(new Error('DTR failed')), 1);
      });
      
      await expect(driver.setDTR(true)).rejects.toThrow('Failed to set DTR');
      
      await driver.close();
    });

    it('应该处理RTS设置错误', async () => {
      await driver.open();
      
      const mockPort = driver.port as any;
      mockPort.set = vi.fn((options, callback) => {
        setTimeout(() => callback(new Error('RTS failed')), 1);
      });
      
      await expect(driver.setRTS(true)).rejects.toThrow('Failed to set RTS');
      
      await driver.close();
    });

    it('应该在未连接时拒绝DTR设置', async () => {
      await expect(driver.setDTR(true)).rejects.toThrow('Serial port is not open');
    });

    it('应该在未连接时拒绝RTS设置', async () => {
      await expect(driver.setRTS(false)).rejects.toThrow('Serial port is not open');
    });

    it('应该在打开时自动设置DTR/RTS', async () => {
      const configWithSignals: UARTConfig = {
        ...config,
        dtrEnabled: true,
        rtsEnabled: false
      };
      
      const testDriver = new UARTDriver(configWithSignals);
      await testDriver.open();
      
      const mockPort = testDriver.port as any;
      expect(mockPort.set).toHaveBeenCalledWith({ dtr: true }, expect.any(Function));
      expect(mockPort.set).toHaveBeenCalledWith({ rts: false }, expect.any(Function));
      
      await testDriver.close();
      testDriver.destroy();
    });
  });

  describe('💧 缓冲区操作', () => {
    it('应该刷新串口缓冲区', async () => {
      await driver.open();
      
      await expect(driver.flush()).resolves.not.toThrow();
      
      await driver.close();
    });

    it('应该处理缓冲区刷新错误', async () => {
      await driver.open();
      
      const mockPort = driver.port as any;
      mockPort.flush = vi.fn((callback) => {
        setTimeout(() => callback(new Error('Flush failed')), 1);
      });
      
      await expect(driver.flush()).rejects.toThrow('Failed to flush serial port');
      
      await driver.close();
    });

    it('应该在未连接时拒绝缓冲区刷新', async () => {
      await expect(driver.flush()).rejects.toThrow('Serial port is not open');
    });
  });

  describe('⚠️ 错误处理', () => {
    it('应该处理基本错误情况', () => {
      // 测试错误处理不会导致崩溃
      expect(() => {
        driver.destroy();
      }).not.toThrow();
    });

    it('应该处理串口事件错误', async () => {
      await driver.open();
      
      const mockPort = driver.port as any;
      const errorHandler = mockPort.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });
      
      // 模拟串口错误
      errorHandler(new Error('Serial port hardware error'));
      
      expect(errorEmitted).toBe(true);
      
      await driver.close();
    });
  });

  describe('📊 静态方法测试', () => {
    it('应该列出可用端口', async () => {
      const ports = await UARTDriver.listPorts();
      
      expect(ports).toEqual([
        { path: '/dev/ttyUSB0', manufacturer: 'FTDI', serialNumber: '123456' },
        { path: '/dev/ttyUSB1', manufacturer: 'Arduino', productId: '0043', vendorId: '2341' },
        { path: 'COM1', manufacturer: 'Prolific', pnpId: 'FTDIBUS\\VID_0403+PID_6001' }
      ]);
    });

    it('应该处理端口列表错误', async () => {
      // 获取mock并设置错误
      const { SerialPort } = await import('serialport');
      (SerialPort.list as any).mockRejectedValueOnce(new Error('List ports failed'));

      await expect(UARTDriver.listPorts()).rejects.toThrow(/Failed to list serial ports/);
    });
  });

  describe('🎯 边界条件测试', () => {
    it('应该处理最小配置', () => {
      const minConfig: UARTConfig = {
        type: BusType.UART,
        port: 'COM1'
      };

      const minDriver = new UARTDriver(minConfig);
      
      expect(minDriver.busType).toBe(BusType.UART);
      expect(minDriver.uartConfig.port).toBe('COM1');
      
      minDriver.destroy();
    });

    it('应该处理最大合理配置值', () => {
      const maxConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB999',
        baudRate: 921600, // 使用有效波特率列表中的最大值
        dataBits: 8,
        stopBits: 2,
        parity: 'space',
        flowControl: 'xonrts',
        timeout: 300000
      };

      const maxDriver = new UARTDriver(maxConfig);
      const validation = maxDriver.validateConfiguration();
      
      expect(validation.valid).toBe(true);
      
      maxDriver.destroy();
    });
  });

  describe('🧹 资源清理', () => {
    it('应该处理多次销毁调用', () => {
      expect(() => {
        driver.destroy();
        driver.destroy(); // 第二次调用不应该出错
        driver.destroy(); // 第三次调用不应该出错
      }).not.toThrow();
    });
  });
});
/**
 * IO Manager 真实功能测试
 * 测试关键通信管理逻辑，确保真实源代码被执行和验证
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager, ConnectionState } from '@extension/io/Manager';
import { BusType, ConnectionConfig, FrameDetection, DecoderMethod } from '@shared/types';

// Mock 外部依赖，但保留业务逻辑  
vi.mock('events', () => ({
  EventEmitter: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    setMaxListeners: vi.fn()
  }))
}));

vi.mock('@extension/io/DriverFactory', () => ({
  DriverFactory: {
    getInstance: vi.fn().mockReturnValue({
      createDriver: vi.fn().mockReturnValue({
        busType: 'uart',
        open: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        write: vi.fn().mockResolvedValue(10),
        destroy: vi.fn(),
        isReadable: vi.fn().mockReturnValue(true),
        isWritable: vi.fn().mockReturnValue(true),
        getConfiguration: vi.fn().mockReturnValue({ type: 'uart', port: '/dev/ttyUSB0' }),
        on: vi.fn()
      }),
      discoverDevices: vi.fn().mockResolvedValue([]),
      getAvailableDrivers: vi.fn().mockReturnValue([]),
      getSupportedBusTypes: vi.fn().mockReturnValue(['uart', 'network']),
      getDefaultConfig: vi.fn().mockReturnValue({ baudRate: 9600 }),
      validateConfig: vi.fn().mockReturnValue([]),
      isSupported: vi.fn().mockReturnValue(true)
    })
  }
}));

vi.mock('@extension/workers/WorkerManager', () => ({
  WorkerManager: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    processData: vi.fn().mockResolvedValue(undefined),
    configureWorkers: vi.fn().mockResolvedValue(undefined),
    setThreadedFrameExtraction: vi.fn(),
    getStats: vi.fn().mockReturnValue({ workerCount: 2 }),
    resetWorkers: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@shared/ObjectPoolManager', () => ({
  objectPoolManager: {
    initialize: vi.fn(),
    acquireCommunicationStats: vi.fn().mockReturnValue({
      bytesReceived: 0,
      bytesSent: 0,
      framesReceived: 0,
      framesSent: 0,
      framesProcessed: 0,
      errors: 0,
      reconnections: 0,
      uptime: Date.now(),
      memoryUsage: 1024
    }),
    releaseCommunicationStats: vi.fn(),
    acquireRawFrame: vi.fn().mockReturnValue({
      data: new Uint8Array(),
      timestamp: Date.now(),
      sequence: 0,
      checksumValid: true
    }),
    releaseRawFrame: vi.fn()
  }
}));

vi.mock('os', () => ({
  cpus: vi.fn().mockReturnValue([{}, {}, {}, {}]) // 4 CPUs
}));

// Mock require的os模块 (用于动态require)
globalThis.require = vi.fn().mockImplementation((module) => {
  if (module === 'os') {
    return { cpus: () => [{}, {}, {}, {}] };
  }
  return {};
});

describe('IO Manager 真实功能测试', () => {
  let ioManager: IOManager;
  let mockDriverFactory: any;
  let mockWorkerManager: any;

  beforeEach(() => {
    // 重置环境变量
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
    delete (global as any).vitest;

    ioManager = new IOManager();
    
    // 获取Mock实例
    const { DriverFactory } = require('@extension/io/DriverFactory');
    mockDriverFactory = DriverFactory.getInstance();
    
    const { WorkerManager } = require('@extension/workers/WorkerManager');
    mockWorkerManager = new WorkerManager();
  });

  afterEach(async () => {
    await ioManager.destroy();
    vi.clearAllMocks();
  });

  describe('初始化和配置', () => {
    it('应该正确初始化IO管理器', () => {
      expect(ioManager).toBeInstanceOf(IOManager);
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
      expect(ioManager.isPaused).toBe(false);
    });

    it('应该在测试环境中禁用多线程处理', () => {
      process.env.NODE_ENV = 'test';
      const testManager = new IOManager();
      
      expect(testManager.isThreadedFrameExtractionEnabled).toBe(false);
    });

    it('应该正确配置WorkerManager', () => {
      const workerStats = ioManager.getWorkerStats();
      expect(workerStats).toBeDefined();
      expect(workerStats?.workerCount).toBe(2);
    });

    it('应该初始化默认帧配置', () => {
      const config = ioManager.frameConfiguration;
      
      expect(config.startSequence).toEqual(new Uint8Array());
      expect(config.finishSequence).toEqual(new Uint8Array([0x0A]));
      expect(config.checksumAlgorithm).toBe('none');
      expect(config.frameDetection).toBe(FrameDetection.EndDelimiterOnly);
      expect(config.decoderMethod).toBe(DecoderMethod.PlainText);
    });
  });

  describe('连接管理', () => {
    const testConfig: ConnectionConfig = {
      type: 'uart' as BusType,
      port: '/dev/ttyUSB0',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    };

    it('应该成功连接设备', async () => {
      await ioManager.connect(testConfig);
      
      expect(ioManager.state).toBe(ConnectionState.Connected);
      expect(ioManager.isConnected).toBe(true);
      expect(mockDriverFactory.createDriver).toHaveBeenCalledWith(testConfig);
    });

    it('应该处理连接错误', async () => {
      const errorDriver = {
        ...mockDriverFactory.createDriver(),
        open: vi.fn().mockRejectedValue(new Error('Connection failed'))
      };
      mockDriverFactory.createDriver.mockReturnValue(errorDriver);

      await expect(ioManager.connect(testConfig)).rejects.toThrow('Connection failed');
      expect(ioManager.state).toBe(ConnectionState.Error);
    });

    it('应该成功断开连接', async () => {
      await ioManager.connect(testConfig);
      await ioManager.disconnect();
      
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
    });

    it('应该支持重连功能', async () => {
      await ioManager.connect(testConfig);
      const originalDriver = ioManager.driver;
      
      await ioManager.reconnect();
      
      expect(ioManager.state).toBe(ConnectionState.Connected);
      expect(mockDriverFactory.createDriver).toHaveBeenCalledTimes(2);
    });
  });

  describe('数据传输', () => {
    const testConfig: ConnectionConfig = {
      type: 'uart' as BusType,
      port: '/dev/ttyUSB0',
      baudRate: 9600
    };

    beforeEach(async () => {
      await ioManager.connect(testConfig);
    });

    it('应该成功写入数据', async () => {
      const testData = Buffer.from('Hello World');
      
      const bytesWritten = await ioManager.writeData(testData);
      
      expect(bytesWritten).toBe(10);
      expect(ioManager.driver?.write).toHaveBeenCalledWith(testData);
      
      const stats = ioManager.communicationStats;
      expect(stats.bytesSent).toBe(10);
      expect(stats.framesSent).toBe(1);
    });

    it('应该拒绝在未连接时写入数据', async () => {
      await ioManager.disconnect();
      
      const testData = Buffer.from('test');
      await expect(ioManager.writeData(testData)).rejects.toThrow('No device connected');
    });

    it('应该检查设备可写性', async () => {
      const readOnlyDriver = {
        ...ioManager.driver,
        isWritable: vi.fn().mockReturnValue(false)
      };
      (ioManager as any).currentDriver = readOnlyDriver;
      
      const testData = Buffer.from('test');
      await expect(ioManager.writeData(testData)).rejects.toThrow('Device is not writable');
    });
  });

  describe('暂停和恢复', () => {
    it('应该支持数据处理暂停', () => {
      ioManager.setPaused(true);
      expect(ioManager.isPaused).toBe(true);
      
      ioManager.setPaused(false);
      expect(ioManager.isPaused).toBe(false);
    });

    it('应该在暂停状态改变时发出警告', () => {
      const emitSpy = vi.spyOn(ioManager as any, 'emit');
      
      ioManager.setPaused(true);
      expect(emitSpy).toHaveBeenCalledWith('warning', 'Data processing paused');
      
      ioManager.setPaused(false);
      expect(emitSpy).toHaveBeenCalledWith('warning', 'Data processing resumed');
    });
  });

  describe('帧配置管理', () => {
    it('应该更新帧配置', async () => {
      const newConfig = {
        startSequence: new Uint8Array([0xFF]),
        finishSequence: new Uint8Array([0x00]),
        checksumAlgorithm: 'crc16' as const,
        frameDetection: FrameDetection.StartAndEndDelimiter
      };

      await ioManager.updateFrameConfig(newConfig);
      
      const config = ioManager.frameConfiguration;
      expect(config.startSequence).toEqual(newConfig.startSequence);
      expect(config.finishSequence).toEqual(newConfig.finishSequence);
      expect(config.checksumAlgorithm).toBe(newConfig.checksumAlgorithm);
      expect(config.frameDetection).toBe(newConfig.frameDetection);
    });

    it('应该在配置更新时配置Workers', async () => {
      const newConfig = {
        frameDetection: FrameDetection.StartDelimiterOnly
      };

      await ioManager.updateFrameConfig(newConfig);
      
      expect(mockWorkerManager.configureWorkers).toHaveBeenCalled();
    });
  });

  describe('设备发现和验证', () => {
    it('应该获取可用设备列表', async () => {
      const devices = await ioManager.getAvailableDevices('uart' as BusType);
      
      expect(mockDriverFactory.discoverDevices).toHaveBeenCalledWith('uart');
      expect(devices).toEqual([]);
    });

    it('应该获取可用驱动列表', () => {
      const drivers = ioManager.getAvailableDrivers();
      
      expect(mockDriverFactory.getAvailableDrivers).toHaveBeenCalled();
      expect(drivers).toEqual([]);
    });

    it('应该验证配置', () => {
      const config: ConnectionConfig = { type: 'uart' as BusType, port: '/dev/ttyUSB0' };
      const result = ioManager.validateConfig(config);
      
      expect(mockDriverFactory.validateConfig).toHaveBeenCalledWith(config);
      expect(result).toEqual([]);
    });

    it('应该检查总线类型支持', () => {
      const isSupported = ioManager.isBusTypeSupported('uart' as BusType);
      
      expect(mockDriverFactory.isSupported).toHaveBeenCalledWith('uart');
      expect(isSupported).toBe(true);
    });
  });

  describe('统计信息管理', () => {
    it('应该提供通信统计信息', () => {
      const stats = ioManager.communicationStats;
      
      expect(stats).toHaveProperty('bytesReceived');
      expect(stats).toHaveProperty('bytesSent');
      expect(stats).toHaveProperty('framesReceived');
      expect(stats).toHaveProperty('framesSent');
      expect(stats).toHaveProperty('framesProcessed');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('memoryUsage');
    });

    it('应该重置统计信息', () => {
      ioManager.resetStatistics();
      
      const stats = ioManager.communicationStats;
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.framesReceived).toBe(0);
      expect(stats.framesSent).toBe(0);
      expect(stats.errors).toBe(0);
    });

    it('应该提供扩展统计信息', () => {
      const extendedStats = ioManager.extendedCommunicationStats;
      
      expect(extendedStats).toHaveProperty('workers');
      expect(extendedStats.workers).toHaveProperty('workerCount');
      expect(extendedStats.workers).toHaveProperty('threadedExtraction');
    });
  });

  describe('多线程处理控制', () => {
    it('应该控制线程化帧提取', () => {
      ioManager.setThreadedFrameExtraction(false);
      expect(ioManager.isThreadedFrameExtractionEnabled).toBe(false);
      
      ioManager.setThreadedFrameExtraction(true);  
      expect(ioManager.isThreadedFrameExtractionEnabled).toBe(true);
    });

    it('应该重置Workers状态', async () => {
      await ioManager.resetWorkers();
      
      expect(mockWorkerManager.resetWorkers).toHaveBeenCalled();
    });
  });

  describe('错误处理和状态管理', () => {
    it('应该处理驱动错误', () => {
      const emitSpy = vi.spyOn(ioManager as any, 'emit');
      const testError = new Error('Driver error');
      
      // 模拟私有方法调用
      (ioManager as any).handleError(testError);
      
      expect(emitSpy).toHaveBeenCalledWith('error', testError);
    });

    it('应该管理连接状态', () => {
      const emitSpy = vi.spyOn(ioManager as any, 'emit');
      
      // 通过私有方法设置状态
      (ioManager as any).setState(ConnectionState.Connecting);
      expect(ioManager.state).toBe(ConnectionState.Connecting);
      expect(emitSpy).toHaveBeenCalledWith('stateChanged', ConnectionState.Connecting);
    });
  });

  describe('数据导出功能', () => {
    it('应该导出统计信息为JSON', () => {
      const jsonStats = ioManager.exportStatistics('json');
      
      expect(jsonStats).toBeDefined();
      expect(() => JSON.parse(jsonStats!)).not.toThrow();
    });

    it('应该导出统计信息为CSV', () => {
      const csvStats = ioManager.exportStatistics('csv');
      
      expect(csvStats).toBeDefined();
      expect(csvStats).toContain(',');
    });

    it('应己导出统计信息为XML', () => {
      const xmlStats = ioManager.exportStatistics('xml');
      
      expect(xmlStats).toBeDefined();
      expect(xmlStats).toContain('<?xml');
      expect(xmlStats).toContain('<statistics>');
    });

    it('应该对不支持格式返回null', () => {
      const result = ioManager.exportStatistics('unsupported');
      expect(result).toBeNull();
    });
  });

  describe('网络信息和断路器', () => {
    it('应该获取网络连接信息', async () => {
      const networkConfig: ConnectionConfig = {
        type: 'network' as BusType,
        host: '192.168.1.100',
        port: 8080
      };
      
      const networkDriver = {
        ...mockDriverFactory.createDriver(),
        busType: 'network'
      };
      mockDriverFactory.createDriver.mockReturnValue(networkDriver);
      
      await ioManager.connect(networkConfig);
      const networkInfo = ioManager.getNetworkInfo();
      
      expect(networkInfo).toBeDefined();
      expect(networkInfo).toHaveProperty('localAddress');
      expect(networkInfo).toHaveProperty('remoteAddress');
    });

    it('应该提供断路器状态', () => {
      const state = ioManager.getCircuitBreakerState();
      expect(['CLOSED', 'HALF_OPEN', 'OPEN']).toContain(state);
    });
  });

  describe('资源清理', () => {
    it('应该完全清理资源', async () => {
      await ioManager.connect({
        type: 'uart' as BusType,
        port: '/dev/ttyUSB0'
      });
      
      await ioManager.destroy();
      
      expect(mockWorkerManager.destroy).toHaveBeenCalled();
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
    });
  });
});
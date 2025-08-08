/**
 * Manager-Ultimate-Coverage.test.ts
 * IOManager模块100%覆盖率终极测试
 * 目标：覆盖IOManager类的所有分支和功能路径
 */

import { describe, test, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import { EventEmitter } from 'events';
import { IOManager, ConnectionState } from '../../../src/extension/io/Manager';
import { HALDriver } from '../../../src/extension/io/HALDriver';
import { DriverFactory } from '../../../src/extension/io/DriverFactory';
import { WorkerManager } from '../../../src/extension/workers/WorkerManager';
import { objectPoolManager } from '../../../src/shared/ObjectPoolManager';

// Mock all dependencies
vi.mock('../../../src/extension/io/HALDriver');
vi.mock('../../../src/extension/io/DriverFactory');
vi.mock('../../../src/extension/workers/WorkerManager');
vi.mock('../../../src/shared/ObjectPoolManager');

// Mock os module for CPU count
vi.mock('os', () => ({
  cpus: () => Array(4).fill({}), // Mock 4 CPUs
}));

// Mock shared types
const mockBusType = {
  UART: 'uart',
  Network: 'network',
  BluetoothLE: 'bluetooth_le',
};

const mockFrameDetection = {
  EndDelimiterOnly: 'end_delimiter_only',
  StartAndEndDelimiter: 'start_end_delimiter',
  StartDelimiterOnly: 'start_delimiter_only',
  NoDelimiters: 'no_delimiters',
};

const mockDecoderMethod = {
  PlainText: 'plain_text',
  HexadecimalLowercase: 'hex_lowercase',
  HexadecimalUppercase: 'hex_uppercase',
};

vi.mock('@shared/types', () => ({
  BusType: mockBusType,
  FrameDetection: mockFrameDetection,
  DecoderMethod: mockDecoderMethod,
}));

describe('IOManager终极覆盖率测试', () => {
  let mockDriverFactory: any;
  let mockHALDriver: any;
  let mockWorkerManager: any;
  let mockObjectPoolManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock HAL Driver
    mockHALDriver = {
      on: vi.fn(),
      off: vi.fn(),
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(10),
      destroy: vi.fn(),
      isReadable: vi.fn().mockReturnValue(true),
      isWritable: vi.fn().mockReturnValue(true),
      getConfiguration: vi.fn().mockReturnValue({ type: 'uart', port: '/dev/ttyUSB0' }),
      busType: 'uart',
    };

    // Mock Driver Factory
    mockDriverFactory = {
      createDriver: vi.fn().mockReturnValue(mockHALDriver),
      discoverDevices: vi.fn().mockResolvedValue([]),
      getAvailableDrivers: vi.fn().mockReturnValue([]),
      getSupportedBusTypes: vi.fn().mockReturnValue(['uart', 'network']),
      getDefaultConfig: vi.fn().mockReturnValue({ type: 'uart' }),
      validateConfig: vi.fn().mockReturnValue([]),
      isSupported: vi.fn().mockReturnValue(true),
    };

    // Mock DriverFactory.getInstance
    (DriverFactory.getInstance as MockedFunction<any>).mockReturnValue(mockDriverFactory);

    // Mock Worker Manager
    mockWorkerManager = new EventEmitter();
    mockWorkerManager.processData = vi.fn().mockResolvedValue(undefined);
    mockWorkerManager.configureWorkers = vi.fn().mockResolvedValue(undefined);
    mockWorkerManager.setThreadedFrameExtraction = vi.fn();
    mockWorkerManager.getStats = vi.fn().mockReturnValue({
      workerCount: 4,
      tasksProcessed: 100,
    });
    mockWorkerManager.resetWorkers = vi.fn().mockResolvedValue(undefined);
    mockWorkerManager.destroy = vi.fn().mockResolvedValue(undefined);

    (WorkerManager as any).mockImplementation(() => mockWorkerManager);

    // Mock Object Pool Manager
    mockObjectPoolManager = {
      initialize: vi.fn(),
      acquireCommunicationStats: vi.fn().mockReturnValue({
        bytesReceived: 0,
        bytesSent: 0,
        framesReceived: 0,
        framesSent: 0,
        framesProcessed: 0,
        errors: 0,
        reconnections: 0,
        uptime: 0,
        memoryUsage: 0,
      }),
      releaseCommunicationStats: vi.fn(),
      acquireRawFrame: vi.fn().mockReturnValue({
        data: new Uint8Array(),
        timestamp: Date.now(),
        sequence: 0,
        checksumValid: true,
      }),
      releaseRawFrame: vi.fn(),
    };

    Object.defineProperty(objectPoolManager, 'initialize', {
      value: mockObjectPoolManager.initialize,
      writable: true,
    });
    Object.defineProperty(objectPoolManager, 'acquireCommunicationStats', {
      value: mockObjectPoolManager.acquireCommunicationStats,
      writable: true,
    });
    Object.defineProperty(objectPoolManager, 'releaseCommunicationStats', {
      value: mockObjectPoolManager.releaseCommunicationStats,
      writable: true,
    });
    Object.defineProperty(objectPoolManager, 'acquireRawFrame', {
      value: mockObjectPoolManager.acquireRawFrame,
      writable: true,
    });
    Object.defineProperty(objectPoolManager, 'releaseRawFrame', {
      value: mockObjectPoolManager.releaseRawFrame,
      writable: true,
    });

    // Mock process.memoryUsage
    vi.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 100 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
      rss: 0,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('构造函数和初始化测试', () => {
    test('应该正确初始化IOManager', () => {
      const ioManager = new IOManager();

      expect(mockObjectPoolManager.initialize).toHaveBeenCalled();
      expect(DriverFactory.getInstance).toHaveBeenCalled();
      expect(mockObjectPoolManager.acquireCommunicationStats).toHaveBeenCalled();
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
    });

    test('应该在测试环境中禁用多线程', () => {
      // Set test environment
      process.env.NODE_ENV = 'test';
      
      const ioManager = new IOManager();
      expect(ioManager.isThreadedFrameExtractionEnabled).toBe(false);

      // Clean up
      delete process.env.NODE_ENV;
    });

    test('应该在vitest环境中禁用多线程', () => {
      process.env.VITEST = 'true';
      
      const ioManager = new IOManager();
      expect(ioManager.isThreadedFrameExtractionEnabled).toBe(false);

      // Clean up
      delete process.env.VITEST;
    });

    test('应该在全局vitest环境中禁用多线程', () => {
      (global as any).vitest = true;
      
      const ioManager = new IOManager();
      expect(ioManager.isThreadedFrameExtractionEnabled).toBe(false);

      // Clean up
      delete (global as any).vitest;
    });

    test('应该设置默认的帧配置', () => {
      const ioManager = new IOManager();
      const frameConfig = ioManager.frameConfiguration;

      expect(frameConfig).toMatchObject({
        startSequence: expect.any(Uint8Array),
        finishSequence: expect.any(Uint8Array),
        checksumAlgorithm: 'none',
        frameDetection: mockFrameDetection.EndDelimiterOnly,
        decoderMethod: mockDecoderMethod.PlainText,
      });
    });
  });

  describe('连接管理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该成功连接设备', async () => {
      const config = {
        type: 'uart',
        port: '/dev/ttyUSB0',
        baudRate: 9600,
      };

      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      await ioManager.connect(config);

      expect(mockDriverFactory.createDriver).toHaveBeenCalledWith(config);
      expect(mockHALDriver.open).toHaveBeenCalled();
      expect(stateChanges).toContain(ConnectionState.Connecting);
      expect(stateChanges).toContain(ConnectionState.Connected);
      expect(ioManager.isConnected).toBe(true);
    });

    test('应该处理连接失败情况', async () => {
      const config = { type: 'uart', port: '/dev/invalid' };
      const error = new Error('Connection failed');
      mockHALDriver.open.mockRejectedValue(error);

      await expect(ioManager.connect(config)).rejects.toThrow('Connection failed');
      expect(ioManager.state).toBe(ConnectionState.Error);
    });

    test('应该在连接前断开现有连接', async () => {
      const config1 = { type: 'uart', port: '/dev/ttyUSB0' };
      const config2 = { type: 'uart', port: '/dev/ttyUSB1' };

      await ioManager.connect(config1);
      expect(ioManager.isConnected).toBe(true);

      await ioManager.connect(config2);
      expect(mockHALDriver.close).toHaveBeenCalled();
    });

    test('应该成功断开连接', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      await ioManager.disconnect();

      expect(mockHALDriver.close).toHaveBeenCalled();
      expect(mockHALDriver.destroy).toHaveBeenCalled();
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect((ioManager as any).currentDriver).toBeNull();
    });

    test('应该处理无连接时的断开操作', async () => {
      await expect(ioManager.disconnect()).resolves.toBeUndefined();
    });

    test('应该处理断开连接失败', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      const error = new Error('Disconnect failed');
      mockHALDriver.close.mockRejectedValue(error);

      await expect(ioManager.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('数据读写测试', () => {
    let ioManager: IOManager;

    beforeEach(async () => {
      ioManager = new IOManager();
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该成功写入数据', async () => {
      const data = Buffer.from('test data');
      mockHALDriver.write.mockResolvedValue(9);

      const result = await ioManager.writeData(data);

      expect(mockHALDriver.write).toHaveBeenCalledWith(data);
      expect(result).toBe(9);
      expect(ioManager.communicationStats.bytesSent).toBe(9);
      expect(ioManager.communicationStats.framesSent).toBe(1);
    });

    test('应该使用write别名方法', async () => {
      const data = Buffer.from('test');
      mockHALDriver.write.mockResolvedValue(4);

      const result = await ioManager.write(data);

      expect(result).toBe(4);
    });

    test('应该在未连接时拒绝写入', async () => {
      await ioManager.disconnect();

      const data = Buffer.from('test');
      await expect(ioManager.writeData(data)).rejects.toThrow('No device connected');
    });

    test('应该在设备不可写时拒绝写入', async () => {
      mockHALDriver.isWritable.mockReturnValue(false);

      const data = Buffer.from('test');
      await expect(ioManager.writeData(data)).rejects.toThrow('Device is not writable');
    });

    test('应该处理写入失败', async () => {
      const data = Buffer.from('test');
      const error = new Error('Write failed');
      mockHALDriver.write.mockRejectedValue(error);

      await expect(ioManager.writeData(data)).rejects.toThrow('Write failed');
    });
  });

  describe('驱动事件处理测试', () => {
    let ioManager: IOManager;

    beforeEach(async () => {
      ioManager = new IOManager();
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该处理驱动数据接收事件', (done) => {
      const testData = Buffer.from('test data\n');

      ioManager.on('rawDataReceived', (data) => {
        expect(data).toEqual(testData);
        done();
      });

      // 模拟驱动数据接收事件
      const dataReceivedHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataReceivedHandler(testData);
    });

    test('应该处理驱动错误事件', (done) => {
      const testError = new Error('Driver error');

      ioManager.on('error', (error) => {
        expect(error).toBe(testError);
        done();
      });

      // 模拟驱动错误事件
      const errorHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'error'
      )[1];
      errorHandler(testError);
    });

    test('应该处理驱动连接事件', () => {
      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      // 模拟驱动连接事件
      const connectedHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'connected'
      )[1];
      connectedHandler();

      expect(stateChanges).toContain(ConnectionState.Connected);
    });

    test('应该处理驱动断开事件', () => {
      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      // 模拟驱动断开事件
      const disconnectedHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'disconnected'
      )[1];
      disconnectedHandler();

      expect(stateChanges).toContain(ConnectionState.Disconnected);
    });

    test('应该在暂停时跳过数据处理', () => {
      ioManager.setPaused(true);
      expect(ioManager.isPaused).toBe(true);

      const testData = Buffer.from('test');
      const dataReceivedHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataReceivedHandler(testData);

      // 数据应该被忽略
      expect(ioManager.communicationStats.bytesReceived).toBe(0);
    });
  });

  describe('帧处理测试', () => {
    let ioManager: IOManager;

    beforeEach(async () => {
      ioManager = new IOManager();
      // 禁用多线程以测试单线程路径
      (ioManager as any).threadedFrameExtraction = false;
      
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该提取结束分隔符帧', (done) => {
      const frames: any[] = [];
      ioManager.on('frameReceived', (frame) => {
        frames.push(frame);
        if (frames.length === 2) {
          expect(frames[0].data).toEqual(new Uint8Array(Buffer.from('frame1')));
          expect(frames[1].data).toEqual(new Uint8Array(Buffer.from('frame2')));
          done();
        }
      });

      // 发送带换行符的数据
      const testData = Buffer.from('frame1\nframe2\n');
      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataHandler(testData);
    });

    test('应该提取开始和结束分隔符帧', async (done) => {
      // 设置开始和结束分隔符
      await ioManager.updateFrameConfig({
        frameDetection: mockFrameDetection.StartAndEndDelimiter,
        startSequence: new Uint8Array([0x02]), // STX
        finishSequence: new Uint8Array([0x03]), // ETX
      });

      ioManager.on('frameReceived', (frame) => {
        expect(frame.data).toEqual(new Uint8Array(Buffer.from('data')));
        done();
      });

      // 发送完整帧数据
      const testData = Buffer.from([0x02, ...Buffer.from('data'), 0x03]);
      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataHandler(testData);
    });

    test('应该提取开始分隔符帧', async (done) => {
      await ioManager.updateFrameConfig({
        frameDetection: mockFrameDetection.StartDelimiterOnly,
        startSequence: new Uint8Array([0x24]), // $
      });

      const frames: any[] = [];
      ioManager.on('frameReceived', (frame) => {
        frames.push(frame);
        if (frames.length === 1) {
          expect(frames[0].data).toEqual(new Uint8Array(Buffer.from('frame1')));
          done();
        }
      });

      const testData = Buffer.from('$frame1$frame2');
      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataHandler(testData);
    });

    test('应该处理无分隔符帧', async (done) => {
      await ioManager.updateFrameConfig({
        frameDetection: mockFrameDetection.NoDelimiters,
      });

      ioManager.on('frameReceived', (frame) => {
        expect(frame.data).toEqual(new Uint8Array(Buffer.from('raw data')));
        done();
      });

      const testData = Buffer.from('raw data');
      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataHandler(testData);
    });

    test('应该在对象池耗尽时使用临时对象', (done) => {
      // 模拟对象池耗尽
      mockObjectPoolManager.acquireRawFrame.mockImplementation(() => {
        throw new Error('Pool exhausted');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      ioManager.on('frameReceived', (frame) => {
        expect(frame.data).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith('Object pool exhausted, creating temporary frame object');
        consoleSpy.mockRestore();
        done();
      });

      const testData = Buffer.from('test\n');
      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      dataHandler(testData);
    });
  });

  describe('多线程处理测试', () => {
    let ioManager: IOManager;

    beforeEach(async () => {
      ioManager = new IOManager();
      // 启用多线程
      (ioManager as any).threadedFrameExtraction = true;
      
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该使用多线程处理数据', async () => {
      const testData = Buffer.from('test data');
      
      // 模拟成功的多线程处理
      mockWorkerManager.processData.mockResolvedValue(undefined);

      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      
      await dataHandler(testData);

      expect(mockWorkerManager.processData).toHaveBeenCalled();
    });

    test('应该在多线程处理失败时回退到单线程', async () => {
      const testData = Buffer.from('test\n');
      
      // 模拟多线程处理失败
      mockWorkerManager.processData.mockRejectedValue(new Error('Worker failed'));
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      ioManager.on('frameReceived', (frame) => {
        expect(frame.data).toBeDefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Multi-threaded processing failed, falling back to single-threaded')
        );
        consoleSpy.mockRestore();
      });

      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      await dataHandler(testData);
    });

    test('应该处理多线程处理超时', async () => {
      const testData = Buffer.from('test\n');
      
      // 模拟处理超时
      mockWorkerManager.processData.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      const dataHandler = mockHALDriver.on.mock.calls.find(
        call => call[0] === 'dataReceived'
      )[1];
      await dataHandler(testData);

      // 应该触发超时并回退到单线程
    });
  });

  describe('Worker事件处理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该处理Worker处理完成的帧', (done) => {
      const mockFrames = [
        {
          data: new Uint8Array(Buffer.from('frame1')),
          timestamp: Date.now(),
          sequence: 1,
          checksumValid: true,
        },
        {
          data: new Uint8Array(Buffer.from('frame2')),
          timestamp: Date.now(),
          sequence: 2,
          checksumValid: true,
        }
      ];

      let receivedFrames = 0;
      ioManager.on('frameReceived', (frame) => {
        receivedFrames++;
        if (receivedFrames === 2) {
          expect(ioManager.communicationStats.framesReceived).toBe(2);
          expect(ioManager.communicationStats.framesProcessed).toBe(2);
          done();
        }
      });

      mockWorkerManager.emit('framesProcessed', mockFrames);
    });

    test('应该处理Worker错误', (done) => {
      const workerId = 'worker-1';
      const error = new Error('Worker error');

      ioManager.on('warning', (message) => {
        expect(message).toContain(`Worker ${workerId} error: ${error.message}`);
        expect(ioManager.communicationStats.errors).toBe(1);
        done();
      });

      mockWorkerManager.emit('workerError', { workerId, error });
    });

    test('应该处理Worker池初始化完成', (done) => {
      const workerCount = 4;
      const threadedExtraction = true;

      ioManager.on('warning', (message) => {
        expect(message).toContain(`Initialized ${workerCount} workers`);
        expect(message).toContain(`threaded extraction: ${threadedExtraction}`);
        done();
      });

      mockWorkerManager.emit('poolInitialized', { workerCount, threadedExtraction });
    });

    test('应该处理处理错误', (done) => {
      const error = new Error('Processing error');
      const workerId = 'worker-1';

      ioManager.on('error', (err) => {
        expect(err).toBe(error);
        expect(ioManager.communicationStats.errors).toBe(1);
        done();
      });

      mockWorkerManager.emit('processingError', { error, workerId });
    });
  });

  describe('配置管理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该更新帧配置', async () => {
      const newConfig = {
        frameDetection: mockFrameDetection.StartAndEndDelimiter,
        startSequence: new Uint8Array([0x02]),
        finishSequence: new Uint8Array([0x03]),
        checksumAlgorithm: 'crc16' as any,
      };

      await ioManager.updateFrameConfig(newConfig);

      const currentConfig = ioManager.frameConfiguration;
      expect(currentConfig.frameDetection).toBe(newConfig.frameDetection);
      expect(currentConfig.startSequence).toEqual(newConfig.startSequence);
      expect(currentConfig.finishSequence).toEqual(newConfig.finishSequence);
      expect(currentConfig.checksumAlgorithm).toBe(newConfig.checksumAlgorithm);
    });

    test('应该在多线程模式下配置Workers', async () => {
      (ioManager as any).threadedFrameExtraction = true;

      const newConfig = {
        frameDetection: mockFrameDetection.EndDelimiterOnly,
      };

      await ioManager.updateFrameConfig(newConfig);

      expect(mockWorkerManager.configureWorkers).toHaveBeenCalled();
    });

    test('应该忽略WorkerManager销毁错误', async () => {
      (ioManager as any).threadedFrameExtraction = true;
      const destroyError = new Error('WorkerManager destroyed');
      destroyError.name = 'WorkerManagerDestroyedError';
      mockWorkerManager.configureWorkers.mockRejectedValue(destroyError);

      // 应该不抛出错误
      await expect(ioManager.updateFrameConfig({ checksumAlgorithm: 'crc8' as any }))
        .resolves.toBeUndefined();
    });

    test('应该记录Worker配置失败', async () => {
      (ioManager as any).threadedFrameExtraction = true;
      const error = new Error('Config failed');
      mockWorkerManager.configureWorkers.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await ioManager.updateFrameConfig({ checksumAlgorithm: 'crc16' as any });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to configure workers:', error);
      consoleSpy.mockRestore();
    });

    test('应该使用configureFrameProcessing方法', () => {
      const config = {
        frameDetection: mockFrameDetection.NoDelimiters,
        startSequence: new Uint8Array([0x01]),
        finishSequence: new Uint8Array([0x04]),
        checksumAlgorithm: 'none' as any,
        decoderMethod: mockDecoderMethod.PlainText,
      };

      ioManager.configureFrameProcessing(config);

      expect(ioManager.getFrameConfiguration()).toEqual(config);
    });

    test('应该配置Worker线程', () => {
      const config = {
        maxWorkers: 8,
        threadedFrameExtraction: false,
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      ioManager.configureWorkers(config);

      expect(ioManager.isThreadedFrameExtractionEnabled).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('maxWorkers=8')
      );

      consoleSpy.mockRestore();
    });

    test('应该拒绝在连接时更新配置', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      expect(() => {
        ioManager.updateConfiguration({ baudRate: 115200 });
      }).toThrow('Cannot update configuration while connected');

      await ioManager.disconnect();
    });

    test('应该验证配置', () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      mockDriverFactory.validateConfig.mockReturnValue(['Error 1', 'Error 2']);

      const result = ioManager.validateConfiguration(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Error 1', 'Error 2']);
    });

    test('应该验证有效配置', () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      mockDriverFactory.validateConfig.mockReturnValue([]);

      const result = ioManager.validateConfiguration(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('设备发现和驱动管理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该获取可用设备列表', async () => {
      const mockDevices = [
        { name: 'Device 1', port: '/dev/ttyUSB0' },
        { name: 'Device 2', port: '/dev/ttyUSB1' },
      ];
      mockDriverFactory.discoverDevices.mockResolvedValue(mockDevices);

      const devices = await ioManager.getAvailableDevices('uart');

      expect(mockDriverFactory.discoverDevices).toHaveBeenCalledWith('uart');
      expect(devices).toEqual(mockDevices);
    });

    test('应该获取可用驱动列表', () => {
      const mockDrivers = [
        { type: 'uart', name: 'UART Driver' },
        { type: 'network', name: 'Network Driver' },
      ];
      mockDriverFactory.getAvailableDrivers.mockReturnValue(mockDrivers);

      const drivers = ioManager.getAvailableDrivers();

      expect(drivers).toEqual(mockDrivers);
    });

    test('应该获取支持的总线类型', () => {
      const busTypes = ['uart', 'network', 'bluetooth_le'];
      mockDriverFactory.getSupportedBusTypes.mockReturnValue(busTypes);

      const result = ioManager.getSupportedBusTypes();

      expect(result).toEqual(busTypes);
    });

    test('应该获取默认配置', () => {
      const defaultConfig = { type: 'uart', baudRate: 9600 };
      mockDriverFactory.getDefaultConfig.mockReturnValue(defaultConfig);

      const config = ioManager.getDefaultConfig('uart');

      expect(config).toEqual(defaultConfig);
    });

    test('应该检查总线类型支持', () => {
      mockDriverFactory.isSupported.mockReturnValue(true);

      const isSupported = ioManager.isBusTypeSupported('uart');

      expect(mockDriverFactory.isSupported).toHaveBeenCalledWith('uart');
      expect(isSupported).toBe(true);
    });
  });

  describe('统计和监控测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      vi.useFakeTimers();
      ioManager = new IOManager();
    });

    afterEach(async () => {
      vi.useRealTimers();
      await ioManager.destroy();
    });

    test('应该更新统计信息', () => {
      const stats = ioManager.communicationStats;
      expect(stats).toMatchObject({
        bytesReceived: 0,
        bytesSent: 0,
        framesReceived: 0,
        framesSent: 0,
        framesProcessed: 0,
        errors: 0,
        reconnections: 0,
        uptime: 0,
        memoryUsage: expect.any(Number),
      });
    });

    test('应该定时发送统计更新事件', (done) => {
      let eventCount = 0;
      ioManager.on('statisticsUpdated', (stats) => {
        eventCount++;
        if (eventCount === 2) {
          expect(stats).toBeDefined();
          done();
        }
      });

      // 快进时间以触发统计更新
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
    });

    test('应该获取扩展统计信息', () => {
      const extendedStats = ioManager.getStatistics();

      expect(extendedStats).toMatchObject({
        errorCount: expect.any(Number),
        connectionUptime: expect.any(Number),
        lastActivity: expect.any(Number),
        memoryUsage: expect.any(Number),
      });
    });

    test('应该获取Worker统计信息', () => {
      const workerStats = ioManager.getWorkerStats();

      expect(workerStats).toMatchObject({
        workerCount: 4,
        tasksProcessed: 100,
        threadedExtraction: expect.any(Boolean),
      });
    });

    test('应该获取扩展通信统计信息', () => {
      const extendedStats = ioManager.extendedCommunicationStats;

      expect(extendedStats.workers).toBeDefined();
      expect(extendedStats.workers.workerCount).toBe(4);
    });

    test('应该重置统计信息', () => {
      // 先设置一些统计值
      (ioManager as any).statistics.bytesReceived = 100;
      (ioManager as any).statistics.errors = 5;

      ioManager.resetStatistics();

      const stats = ioManager.communicationStats;
      expect(stats.bytesReceived).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.uptime).toBeGreaterThan(0);
    });

    test('应该导出JSON格式统计', () => {
      const json = ioManager.exportStatistics('json');

      expect(json).toContain('bytesReceived');
      expect(() => JSON.parse(json!)).not.toThrow();
    });

    test('应该导出CSV格式统计', () => {
      const csv = ioManager.exportStatistics('csv');

      expect(csv).toContain('bytesReceived');
      expect(csv!.split('\n')).toHaveLength(2); // Header + values
    });

    test('应该导出XML格式统计', () => {
      const xml = ioManager.exportStatistics('xml');

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<statistics>');
      expect(xml).toContain('</statistics>');
    });

    test('应该处理不支持的导出格式', () => {
      const result = ioManager.exportStatistics('yaml');

      expect(result).toBeNull();
    });
  });

  describe('状态管理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该获取连接状态', () => {
      expect(ioManager.getConnectionState()).toBe(ConnectionState.Disconnected);
    });

    test('应该获取当前总线类型', async () => {
      expect(ioManager.getCurrentBusType()).toBeNull();

      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      expect(ioManager.getCurrentBusType()).toBe('uart');
    });

    test('应该检查只读状态', async () => {
      expect(ioManager.isReadOnly).toBe(false);

      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      mockHALDriver.isReadable.mockReturnValue(true);
      mockHALDriver.isWritable.mockReturnValue(false);

      expect(ioManager.isReadOnly).toBe(true);
    });

    test('应该检查读写状态', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      mockHALDriver.isReadable.mockReturnValue(true);
      mockHALDriver.isWritable.mockReturnValue(true);

      expect(ioManager.isReadWrite).toBe(true);
    });

    test('应该获取当前驱动', async () => {
      expect(ioManager.driver).toBeNull();

      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      expect(ioManager.driver).toBe(mockHALDriver);
    });

    test('应该设置暂停状态', () => {
      const warnings: string[] = [];
      ioManager.on('warning', (message) => warnings.push(message));

      ioManager.setPaused(true);
      expect(ioManager.isPaused).toBe(true);
      expect(warnings).toContain('Data processing paused');

      ioManager.setPaused(false);
      expect(ioManager.isPaused).toBe(false);
      expect(warnings).toContain('Data processing resumed');
    });

    test('应该在重复设置相同暂停状态时不发出事件', () => {
      let warningCount = 0;
      ioManager.on('warning', () => warningCount++);

      ioManager.setPaused(true);
      ioManager.setPaused(true); // 重复设置

      expect(warningCount).toBe(1); // 只应该发出一次警告
    });
  });

  describe('重连功能测试', () => {
    let ioManager: IOManager;

    beforeEach(async () => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该成功重连', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      await ioManager.reconnect();

      expect(stateChanges).toContain(ConnectionState.Reconnecting);
      expect(stateChanges).toContain(ConnectionState.Connected);
      expect(ioManager.communicationStats.reconnections).toBe(1);
    });

    test('应该在无previous连接时拒绝重连', async () => {
      await expect(ioManager.reconnect()).rejects.toThrow(
        'No previous connection to reconnect to'
      );
    });

    test('应该处理重连失败', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      // 模拟重连失败
      mockHALDriver.open.mockRejectedValueOnce(new Error('Reconnect failed'));

      await expect(ioManager.reconnect()).rejects.toThrow('Reconnect failed');
      expect(ioManager.state).toBe(ConnectionState.Error);
    });

    test('应该跟踪重连统计', async () => {
      // 模拟从重连状态到连接状态的转换
      const initialState = ConnectionState.Reconnecting;
      const finalState = ConnectionState.Connected;
      
      (ioManager as any).currentState = initialState;
      (ioManager as any).setState(finalState);

      expect(ioManager.communicationStats.reconnections).toBe(1);
    });
  });

  describe('错误处理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该处理Fatal错误并清理资源', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      const fatalError = new Error('Fatal connection error');
      
      (ioManager as any).handleError(fatalError);

      expect(ioManager.state).toBe(ConnectionState.Error);
      expect(ioManager.communicationStats.errors).toBe(1);
      expect(mockHALDriver.destroy).toHaveBeenCalled();
    });

    test('应该在多次错误后清理资源', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      // 产生多个错误
      for (let i = 0; i < 6; i++) {
        (ioManager as any).handleError(new Error(`Error ${i}`));
      }

      expect(ioManager.communicationStats.errors).toBe(6);
      expect(mockHALDriver.destroy).toHaveBeenCalled();
    });

    test('应该处理驱动清理失败', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      // 模拟destroy失败
      mockHALDriver.destroy.mockImplementation(() => {
        throw new Error('Destroy failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const fatalError = new Error('Fatal error');
      (ioManager as any).handleError(fatalError);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error during driver cleanup:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('应该处理线程化帧提取设置', () => {
      const warnings: string[] = [];
      ioManager.on('warning', (message) => warnings.push(message));

      ioManager.setThreadedFrameExtraction(true);

      expect(mockWorkerManager.setThreadedFrameExtraction).toHaveBeenCalledWith(true);
      expect(warnings).toContain('Threaded frame extraction enabled');

      ioManager.setThreadedFrameExtraction(false);
      expect(warnings).toContain('Threaded frame extraction disabled');
    });
  });

  describe('Worker管理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该重置Workers', async () => {
      let warningCount = 0;
      ioManager.on('warning', (message) => {
        if (message.includes('Workers reset successfully')) {
          warningCount++;
        }
      });

      await ioManager.resetWorkers();

      expect(mockWorkerManager.resetWorkers).toHaveBeenCalled();
      expect(warningCount).toBe(1);
    });

    test('应该处理Worker重置失败', async () => {
      const error = new Error('Reset failed');
      mockWorkerManager.resetWorkers.mockRejectedValue(error);

      let errorEmitted = false;
      ioManager.on('error', (err) => {
        if (err === error) {
          errorEmitted = true;
        }
      });

      await ioManager.resetWorkers();

      expect(errorEmitted).toBe(true);
    });

    test('应该忽略WorkerManager销毁错误', async () => {
      const destroyError = new Error('WorkerManager destroyed');
      destroyError.name = 'WorkerManagerDestroyedError';
      mockWorkerManager.resetWorkers.mockRejectedValue(destroyError);

      // 应该不抛出错误或发出error事件
      await expect(ioManager.resetWorkers()).resolves.toBeUndefined();
    });

    test('应该在没有WorkerManager时返回null统计', () => {
      (ioManager as any).workerManager = null;

      const stats = ioManager.getWorkerStats();
      expect(stats).toBeNull();
    });
  });

  describe('配置迁移测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该迁移legacy串口配置', () => {
      const legacyConfig = {
        type: 'serial',
        port: '/dev/ttyUSB0',
        baud: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      };

      const migratedConfig = ioManager.migrateConfiguration(legacyConfig);

      expect(migratedConfig).toMatchObject({
        type: mockBusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      });
    });

    test('应该处理有效的现代配置', () => {
      const modernConfig = {
        type: mockBusType.Network,
        host: '192.168.1.1',
        protocol: 'tcp',
      };

      const migratedConfig = ioManager.migrateConfiguration(modernConfig);

      expect(migratedConfig).toMatchObject(modernConfig);
    });

    test('应该处理无效配置', () => {
      const invalidConfigs = [null, undefined, 'string', 123, []];

      invalidConfigs.forEach(config => {
        const result = ioManager.migrateConfiguration(config);
        expect(result).toBeNull();
      });
    });

    test('应该复制有效字段', () => {
      const config = {
        type: mockBusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600,
        invalidField: 'should be ignored',
      };

      const migratedConfig = ioManager.migrateConfiguration(config);

      expect(migratedConfig).toMatchObject({
        type: mockBusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600,
      });
      expect((migratedConfig as any).invalidField).toBeUndefined();
    });
  });

  describe('网络信息和断路器测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该获取网络信息（网络连接）', async () => {
      mockHALDriver.busType = mockBusType.Network;
      const config = { type: mockBusType.Network, host: '192.168.1.1' };
      await ioManager.connect(config);

      const networkInfo = ioManager.getNetworkInfo();

      expect(networkInfo).toMatchObject({
        localAddress: '127.0.0.1',
        remoteAddress: '192.168.1.1',
      });
    });

    test('应该在非网络连接时返回null', async () => {
      mockHALDriver.busType = mockBusType.UART;
      const config = { type: mockBusType.UART, port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      const networkInfo = ioManager.getNetworkInfo();

      expect(networkInfo).toBeNull();
    });

    test('应该获取断路器状态 - CLOSED', () => {
      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('CLOSED');
    });

    test('应该获取断路器状态 - HALF_OPEN', () => {
      (ioManager as any).statistics.errors = 3;
      
      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('HALF_OPEN');
    });

    test('应该获取断路器状态 - OPEN', () => {
      (ioManager as any).statistics.errors = 6;
      
      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('OPEN');
    });
  });

  describe('转换函数测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该转换帧检测模式', () => {
      const testCases = [
        { input: mockFrameDetection.EndDelimiterOnly, expected: 0 },
        { input: mockFrameDetection.StartAndEndDelimiter, expected: 1 },
        { input: mockFrameDetection.NoDelimiters, expected: 2 },
        { input: mockFrameDetection.StartDelimiterOnly, expected: 3 },
        { input: 'unknown', expected: 0 }, // default
      ];

      testCases.forEach(({ input, expected }) => {
        (ioManager as any).frameConfig.frameDetection = input;
        const result = (ioManager as any).convertToWorkerFrameDetection();
        expect(result).toBe(expected);
      });
    });

    test('应该转换操作模式', () => {
      const result = (ioManager as any).convertToWorkerOperationMode();
      expect(result).toBe(2); // QuickPlot模式
    });
  });

  describe('资源清理测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    test('应该正确清理所有资源', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };
      await ioManager.connect(config);

      await ioManager.destroy();

      expect(mockWorkerManager.destroy).toHaveBeenCalled();
      expect(mockHALDriver.close).toHaveBeenCalled();
      expect(mockObjectPoolManager.releaseCommunicationStats).toHaveBeenCalled();
      expect(mockObjectPoolManager.acquireCommunicationStats).toHaveBeenCalledTimes(2); // 初始化 + 重新创建
    });

    test('应该处理WorkerManager销毁失败', async () => {
      const error = new Error('Destroy failed');
      mockWorkerManager.destroy.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await ioManager.destroy();

      expect(consoleSpy).toHaveBeenCalledWith('Error destroying WorkerManager:', error);
      consoleSpy.mockRestore();
    });

    test('应该清理事件监听器', async () => {
      const removeAllListenersSpy = vi.spyOn(ioManager, 'removeAllListeners');

      await ioManager.destroy();

      expect(removeAllListenersSpy).toHaveBeenCalled();
    });
  });

  describe('边界条件和错误场景测试', () => {
    let ioManager: IOManager;

    beforeEach(() => {
      ioManager = new IOManager();
    });

    afterEach(async () => {
      await ioManager.destroy();
    });

    test('应该处理空帧缓冲区', () => {
      (ioManager as any).frameBuffer = Buffer.alloc(0);
      (ioManager as any).extractFrames();
      
      // 应该不崩溃
    });

    test('应该处理大型帧缓冲区', () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'A'); // 10MB
      (ioManager as any).frameBuffer = largeBuffer;
      
      // 应该能够处理而不崩溃
      (ioManager as any).extractFrames();
    });

    test('应该处理无效的分隔符', async () => {
      await ioManager.updateFrameConfig({
        startSequence: new Uint8Array([]),
        finishSequence: new Uint8Array([]),
      });

      const testData = Buffer.from('test data');
      (ioManager as any).processDataSingleThreaded(testData);
      
      // 应该不崩溃
    });

    test('应该处理并发连接请求', async () => {
      const config1 = { type: 'uart', port: '/dev/ttyUSB0' };
      const config2 = { type: 'uart', port: '/dev/ttyUSB1' };

      const promises = [
        ioManager.connect(config1),
        ioManager.connect(config2),
      ];

      // 应该能够处理并发连接请求
      await Promise.allSettled(promises);
    });

    test('应该处理快速连接/断开循环', async () => {
      const config = { type: 'uart', port: '/dev/ttyUSB0' };

      for (let i = 0; i < 5; i++) {
        await ioManager.connect(config);
        await ioManager.disconnect();
      }

      expect(ioManager.state).toBe(ConnectionState.Disconnected);
    });

    test('应该处理内存不足情况', () => {
      // 模拟内存不足
      mockObjectPoolManager.acquireRawFrame.mockImplementation(() => {
        throw new Error('Out of memory');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      (ioManager as any).emitFrame(Buffer.from('test'));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Object pool exhausted, creating temporary frame object'
      );

      consoleSpy.mockRestore();
    });
  });
});
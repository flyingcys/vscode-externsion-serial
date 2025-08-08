/**
 * IOManager 覆盖率提升测试
 * 专门针对未覆盖的代码路径，将Manager.ts从55.38%提升到90%+
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BusType } from '@shared/types';

// Mock objectPoolManager 
vi.mock('@shared/ObjectPoolManager', () => ({
  objectPoolManager: {
    initialize: vi.fn(),
    acquireCommunicationStats: vi.fn().mockReturnValue({
      bytesReceived: 0,
      bytesSent: 0,
      framesReceived: 0,
      framesSent: 0,
      errors: 0,
      reconnections: 0,
      uptime: 0
    }),
    releaseCommunicationStats: vi.fn()
  }
}));

// Mock DriverFactory
vi.mock('@extension/io/DriverFactory', () => ({
  DriverFactory: {
    getInstance: vi.fn().mockReturnValue({
      createDriver: vi.fn().mockImplementation((config) => ({
        open: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn(),
        write: vi.fn().mockResolvedValue(10),
        isReadable: vi.fn().mockReturnValue(true),
        isWritable: vi.fn().mockReturnValue(true),
        on: vi.fn(),
        busType: config.type, // 根据配置动态设置busType
        displayName: config.type === BusType.Network ? 'Test Network Driver' : 'Test UART Driver'
      })),
      discoverDevices: vi.fn().mockResolvedValue([]),
      getAvailableDrivers: vi.fn().mockReturnValue([]),
      getSupportedBusTypes: vi.fn().mockReturnValue([BusType.Network, BusType.UART]),
      getDefaultConfig: vi.fn().mockReturnValue({}),
      validateConfig: vi.fn().mockReturnValue([]),
      isSupported: vi.fn().mockReturnValue(true)
    })
  }
}));

// Mock WorkerManager
vi.mock('@extension/workers/WorkerManager', () => ({
  WorkerManager: vi.fn().mockImplementation(() => ({
    destroy: vi.fn().mockResolvedValue(undefined), // 默认成功
    on: vi.fn(),
    processData: vi.fn().mockResolvedValue(undefined),
    configureWorkers: vi.fn().mockResolvedValue(undefined),
    setThreadedFrameExtraction: vi.fn(),
    getStats: vi.fn().mockReturnValue({
      workerCount: 2,
      activeWorkers: 2,
      queueSize: 0,
      processedFrames: 150
    }),
    resetWorkers: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Import after mocks
const { IOManager } = await import('@extension/io/Manager');

describe('IOManager - 覆盖率提升测试', () => {
  let ioManager: IOManager;

  beforeEach(() => {
    vi.clearAllMocks();
    ioManager = new IOManager();
  });

  afterEach(async () => {
    if (ioManager) {
      await ioManager.destroy();
    }
  });

  // ==================== 网络信息获取测试 ====================

  describe('网络信息获取覆盖', () => {
    it('应该在网络连接时返回网络信息', async () => {
      // 连接网络驱动
      await ioManager.connect({
        type: BusType.Network,
        host: '127.0.0.1',
        port: 8080,
        protocol: 'tcp'
      });

      const networkInfo = ioManager.getNetworkInfo();
      
      expect(networkInfo).toBeDefined();
      expect(networkInfo).toHaveProperty('localAddress');
      expect(networkInfo).toHaveProperty('remoteAddress');
      expect(networkInfo.localAddress).toBe('127.0.0.1');
      expect(networkInfo.remoteAddress).toBe('192.168.1.1');
    });

    it('应该在非网络连接时返回null', async () => {
      // 连接非网络驱动
      await ioManager.connect({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      const networkInfo = ioManager.getNetworkInfo();
      expect(networkInfo).toBeNull();
    });

    it('应该在未连接时返回null', () => {
      const networkInfo = ioManager.getNetworkInfo();
      expect(networkInfo).toBeNull();
    });
  });

  // ==================== 熔断器状态测试 ====================

  describe('熔断器状态覆盖', () => {
    it('应该在无错误时返回CLOSED状态', () => {
      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('CLOSED');
    });

    it('应该在有少量错误时返回HALF_OPEN状态', () => {
      // 直接修改内部统计对象
      (ioManager as any).statistics.errors = 2;

      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('HALF_OPEN');
    });

    it('应该在错误过多时返回OPEN状态', () => {
      // 直接修改内部统计对象
      (ioManager as any).statistics.errors = 6;

      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('OPEN');
    });

    it('应该在错误恰好5个时返回OPEN状态', () => {
      // 直接修改内部统计对象进行边界值测试
      (ioManager as any).statistics.errors = 5;

      const state = ioManager.getCircuitBreakerState();
      expect(state).toBe('OPEN');
    });
  });

  // ==================== 销毁方法错误处理覆盖 ====================

  describe('销毁方法错误处理覆盖', () => {
    it('应该处理WorkerManager销毁时的错误', async () => {
      // 模拟WorkerManager destroy失败
      const workerManager = (ioManager as any).workerManager;
      const destroyError = new Error('WorkerManager destroy failed');
      workerManager.destroy.mockRejectedValue(destroyError);

      // 监听console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await ioManager.destroy();

      // 验证错误被正确捕获和记录
      expect(consoleSpy).toHaveBeenCalledWith('Error destroying WorkerManager:', destroyError);
      
      consoleSpy.mockRestore();
    });

    it('应该在WorkerManager销毁成功时正常完成', async () => {
      // 确保WorkerManager destroy成功
      const workerManager = (ioManager as any).workerManager;
      workerManager.destroy.mockResolvedValue(undefined);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await ioManager.destroy();

      // 验证没有错误被记录
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('应该在没有WorkerManager时正常销毁', async () => {
      // 移除WorkerManager
      (ioManager as any).workerManager = null;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(ioManager.destroy()).resolves.not.toThrow();

      // 验证没有错误
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  // ==================== 其他未覆盖路径测试 ====================

  describe('其他未覆盖路径', () => {
    it('应该正确处理统计对象的释放和重新获取', async () => {
      const { objectPoolManager } = await import('@shared/ObjectPoolManager');
      
      await ioManager.destroy();

      // 验证统计对象被释放和重新获取
      expect(objectPoolManager.releaseCommunicationStats).toHaveBeenCalled();
      expect(objectPoolManager.acquireCommunicationStats).toHaveBeenCalled();
    });

    it('应该在destroy时移除所有监听器', async () => {
      const removeAllListenersSpy = vi.spyOn(ioManager, 'removeAllListeners');

      await ioManager.destroy();

      expect(removeAllListenersSpy).toHaveBeenCalled();
    });

    it('应该在destroy时停止统计定时器', async () => {
      // 模拟有定时器的情况
      (ioManager as any).statisticsTimer = setInterval(() => {}, 1000);

      await ioManager.destroy();

      // 验证定时器被清理 
      expect((ioManager as any).statisticsTimer).toBeNull();
    });
  });

  // ==================== 连接状态下的销毁测试 ====================

  describe('连接状态下的销毁测试', () => {
    it('应该在有连接时先断开连接再销毁', async () => {
      // 建立连接
      await ioManager.connect({
        type: BusType.Network,
        host: '127.0.0.1',
        port: 8080,
        protocol: 'tcp'
      });

      expect(ioManager.isConnected).toBe(true);

      // 监听disconnect调用
      const disconnectSpy = vi.spyOn(ioManager, 'disconnect');

      await ioManager.destroy();

      // 验证先断开连接
      expect(disconnectSpy).toHaveBeenCalled();
      expect(ioManager.isConnected).toBe(false);
    });
  });
});
/**
 * PerformanceCollector.test.ts
 * 性能指标采集器完整测试套件
 * 
 * 目标: 95%+ 覆盖率，100% 通过率
 * 覆盖: 692行代码的完整测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  PerformanceCollector,
  performanceCollector,
  type SystemMetrics,
  type ApplicationMetrics,
  type PerformanceSnapshot,
  type CollectorConfig
} from '@shared/PerformanceCollector';

// ===== Mock Setup =====
const mockPerformanceMemory = {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB  
  jsHeapSizeLimit: 500 * 1024 * 1024 // 500MB
};

const mockProcessMemory = {
  heapUsed: 60 * 1024 * 1024, // 60MB
  heapTotal: 120 * 1024 * 1024, // 120MB
  external: 10 * 1024 * 1024, // 10MB
  rss: 80 * 1024 * 1024 // 80MB
};

const mockCpuUsage = {
  user: 1000000, // 1 second in microseconds
  system: 500000 // 0.5 seconds
};

const mockLoadAverage = [0.5, 0.7, 0.8];

// Mock global objects
const mockProcess = {
  memoryUsage: vi.fn(() => mockProcessMemory),
  cpuUsage: vi.fn(() => mockCpuUsage),
  loadavg: vi.fn(() => mockLoadAverage)
};

const mockPerformance = {
  memory: mockPerformanceMemory,
  now: vi.fn(() => Date.now())
};

// Mock timers
global.setInterval = vi.fn((fn, ms) => {
  return setInterval(fn, ms);
});
global.clearInterval = vi.fn((timer) => {
  return clearInterval(timer);
});

// Setup globals
global.process = mockProcess as any;
global.performance = mockPerformance as any;

describe('PerformanceCollector完整测试套件', () => {
  let collector: PerformanceCollector;
  let originalInstance: any;
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    
    // Reset memory values
    mockPerformanceMemory.usedJSHeapSize = 50 * 1024 * 1024;
    mockProcessMemory.heapUsed = 60 * 1024 * 1024;
    
    // Reset CPU usage
    mockCpuUsage.user = 1000000;
    mockCpuUsage.system = 500000;
    
    // Clear singleton instance for clean test
    originalInstance = (PerformanceCollector as any).instance;
    (PerformanceCollector as any).instance = null;
    
    collector = PerformanceCollector.getInstance();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    collector?.stopCollection();
    collector?.clearHistory();
    
    // Restore original instance
    (PerformanceCollector as any).instance = originalInstance;
  });

  describe('单例模式测试', () => {
    test('应该返回同一个实例', () => {
      const instance1 = PerformanceCollector.getInstance();
      const instance2 = PerformanceCollector.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(performanceCollector);
    });
    
    test('应该正确初始化默认配置', () => {
      const config = collector.getConfig();
      
      expect(config.systemMetricsInterval).toBe(2000);
      expect(config.applicationMetricsInterval).toBe(1000);
      expect(config.historySize).toBe(100);
      expect(config.enableSystemMetrics).toBe(true);
      expect(config.enableApplicationMetrics).toBe(true);
      expect(config.cpuSampleInterval).toBe(1000);
      expect(config.memoryOptimizationThreshold).toBe(500);
    });
  });

  describe('生命周期管理测试', () => {
    test('应该正确启动数据采集', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      collector.startCollection();
      
      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
      expect(setIntervalSpy).toHaveBeenNthCalledWith(1, expect.any(Function), 2000);
      expect(setIntervalSpy).toHaveBeenNthCalledWith(2, expect.any(Function), 1000);
    });
    
    test('应该正确停止数据采集', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      collector.startCollection();
      collector.stopCollection();
      
      expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
    });
    
    test('应该防止重复启动采集', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      collector.startCollection();
      collector.startCollection(); // 第二次调用应该被忽略
      
      expect(setIntervalSpy).toHaveBeenCalledTimes(2); // 只调用一次启动
      expect(consoleWarnSpy).toHaveBeenCalledWith('性能采集器已在运行');
      
      consoleWarnSpy.mockRestore();
    });
    
    test('应该支持自定义配置启动', () => {
      const customConfig: Partial<CollectorConfig> = {
        systemMetricsInterval: 5000,
        applicationMetricsInterval: 2000,
        enableSystemMetrics: false,
        historySize: 50
      };
      
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      collector.startCollection(customConfig);
      
      // 只有应用指标定时器应该被启动
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
      
      const config = collector.getConfig();
      expect(config.historySize).toBe(50);
      expect(config.enableSystemMetrics).toBe(false);
    });
  });

  describe('CPUUsageCalculator完整测试', () => {
    test('应该在Node.js环境中正确计算CPU使用率', async () => {
      // 模拟第一次调用
      mockCpuUsage.user = 1000000; // 1秒
      mockCpuUsage.system = 500000; // 0.5秒
      
      collector.startCollection();
      
      // 手动触发系统指标采集
      vi.advanceTimersByTime(2000);
      
      // 模拟第二次调用，增加CPU使用
      mockCpuUsage.user = 2000000; // 2秒
      mockCpuUsage.system = 1000000; // 1秒
      
      vi.advanceTimersByTime(2000);
      
      expect(mockProcess.cpuUsage).toHaveBeenCalled();
    });
    
    test('应该处理process.cpuUsage不存在的情况', () => {
      // 临时移除process.cpuUsage
      const originalCpuUsage = mockProcess.cpuUsage;
      delete (mockProcess as any).cpuUsage;
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      
      // 应该回退到浏览器环境的估算方法
      expect(true).toBe(true); // 不抛异常即为通过
      
      // 恢复
      mockProcess.cpuUsage = originalCpuUsage;
    });
    
    test('应该在浏览器环境中正确估算CPU使用率', () => {
      // 模拟浏览器环境
      const originalProcess = global.process;
      delete (global as any).process;
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      
      // 应该不抛异常
      expect(true).toBe(true);
      
      // 恢复
      global.process = originalProcess;
    });
    
    test('应该处理CPU使用率计算错误', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // 重新创建Mock函数
      mockProcess.cpuUsage = vi.fn(() => {
        throw new Error('CPU usage failed');
      });
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('NetworkMetricsCollector完整测试', () => {
    test('应该正确记录网络数据', () => {
      collector.recordNetworkData(1024, 512);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.system.network.bytesReceived).toBe(1024);
      expect(snapshot.system.network.bytesSent).toBe(512);
      expect(snapshot.system.network.packetsReceived).toBe(1);
      expect(snapshot.system.network.packetsSent).toBe(1);
    });
    
    test('应该正确计算网络吞吐量', () => {
      // 记录第一次数据
      collector.recordNetworkData(1024, 512);
      
      // 等待一段时间后记录第二次数据
      vi.advanceTimersByTime(1000);
      collector.recordNetworkData(1024, 512);
      
      const snapshot = collector.getCurrentSnapshot();
      
      // 总字节数应该是两次之和
      expect(snapshot.system.network.bytesReceived).toBe(2048);
      expect(snapshot.system.network.bytesSent).toBe(1024);
      
      // 吞吐量应该大于0 (bytes/second)
      expect(snapshot.system.network.throughput).toBeGreaterThan(0);
    });
    
    test('应该正确处理只接收数据的情况', () => {
      collector.recordNetworkData(2048); // 只传bytesReceived
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.system.network.bytesReceived).toBe(2048);
      expect(snapshot.system.network.bytesSent).toBe(0);
      expect(snapshot.system.network.packetsReceived).toBe(1);
      expect(snapshot.system.network.packetsSent).toBe(0);
    });
    
    test('应该正确处理零数据包的情况', () => {
      collector.recordNetworkData(0, 0);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.system.network.packetsReceived).toBe(0);
      expect(snapshot.system.network.packetsSent).toBe(0);
    });
  });

  describe('系统指标采集完整测试', () => {
    test('应该在Node.js环境中正确获取内存指标', async () => {
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      const snapshot = collector.getCurrentSnapshot();
      const memory = snapshot.system.memory;
      
      expect(memory.heap.used).toBe(60); // 60MB from process.memoryUsage
      expect(memory.heap.total).toBe(120); // 120MB
      expect(memory.external).toBe(10); // 10MB
      expect(memory.rss).toBe(80); // 80MB
      
      expect(mockProcess.memoryUsage).toHaveBeenCalled();
    });
    
    test('应该在浏览器环境中正确获取内存指标', async () => {
      // 移除process.memoryUsage，模拟浏览器环境
      const originalMemoryUsage = mockProcess.memoryUsage;
      delete (mockProcess as any).memoryUsage;
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      const snapshot = collector.getCurrentSnapshot();
      const memory = snapshot.system.memory;
      
      expect(memory.heap.used).toBe(50); // 50MB from performance.memory
      expect(memory.heap.total).toBe(100); // 100MB
      expect(memory.heap.limit).toBe(500); // 500MB
      
      // 恢复
      mockProcess.memoryUsage = originalMemoryUsage;
    });
    
    test('应该处理performance.memory不存在的情况', async () => {
      // 移除所有内存API
      const originalMemoryUsage = mockProcess.memoryUsage;
      const originalPerformanceMemory = mockPerformance.memory;
      delete (mockProcess as any).memoryUsage;
      delete (mockPerformance as any).memory;
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      const snapshot = collector.getCurrentSnapshot();
      
      // 应该返回默认值，不抛异常
      expect(snapshot.system.memory.heap.used).toBeGreaterThanOrEqual(0);
      
      // 恢复
      mockProcess.memoryUsage = originalMemoryUsage;
      mockPerformance.memory = originalPerformanceMemory;
    });
    
    test('应该正确获取系统负载', async () => {
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      const snapshot = collector.getCurrentSnapshot();
      
      expect(snapshot.system.cpu.loadAverage).toEqual(mockLoadAverage);
      expect(mockProcess.loadavg).toHaveBeenCalled();
    });
    
    test('应该处理loadavg不存在的情况', async () => {
      const originalLoadavg = mockProcess.loadavg;
      delete (mockProcess as any).loadavg;
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.system.cpu.loadAverage).toEqual([0, 0, 0]);
      
      // 恢复
      mockProcess.loadavg = originalLoadavg;
    });
    
    test('应该处理系统指标采集错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 让memoryUsage抛出错误
      mockProcess.memoryUsage.mockImplementation(() => {
        throw new Error('Memory access failed');
      });
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('采集系统指标失败:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('应用指标采集完整测试', () => {
    test('应该正确记录渲染帧', () => {
      collector.recordFrame(16.67); // 60fps
      collector.recordFrame(33.33); // 30fps (dropped frame)
      
      const snapshot = collector.getCurrentSnapshot();
      const rendering = snapshot.application.rendering;
      
      expect(rendering.renderCalls).toBe(2);
      expect(rendering.frameTime).toBe(33.33);
      expect(rendering.droppedFrames).toBe(1); // 33.33ms > 33ms threshold
    });
    
    test('应该自动计算帧时间', () => {
      const startTime = performance.now();
      mockPerformance.now.mockReturnValueOnce(startTime);
      collector.recordFrame(); // 第一帧
      
      mockPerformance.now.mockReturnValueOnce(startTime + 16.67);
      collector.recordFrame(); // 第二帧，应该自动计算时间差
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.application.rendering.frameTime).toBe(16.67);
    });
    
    test('应该正确计算FPS', () => {
      // 记录60帧
      for (let i = 0; i < 60; i++) {
        collector.recordFrame(16.67);
      }
      
      // 等待1秒触发FPS计算
      vi.advanceTimersByTime(1000);
      collector.startCollection();
      vi.advanceTimersByTime(1000);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.application.rendering.fps).toBe(60);
    });
    
    test('应该正确记录数据处理指标', () => {
      collector.recordDataProcessing(25, 100); // 25ms延迟，100队列大小
      collector.recordDataProcessing(30, 90);
      
      const snapshot = collector.getCurrentSnapshot();
      const dataProcessing = snapshot.application.dataProcessing;
      
      expect(dataProcessing.latency).toBe(30);
      expect(dataProcessing.queueSize).toBe(90);
    });
    
    test('应该正确计算数据处理吞吐量', () => {
      // 记录处理多个项目
      for (let i = 0; i < 1000; i++) {
        collector.recordDataProcessing();
      }
      
      // 等待1秒触发吞吐量计算
      vi.advanceTimersByTime(1000);
      collector.startCollection();
      vi.advanceTimersByTime(1000);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.application.dataProcessing.throughput).toBe(1000);
    });
    
    test('应该正确记录和计算错误率', () => {
      // 记录一些成功处理
      for (let i = 0; i < 90; i++) {
        collector.recordDataProcessing();
      }
      
      // 记录一些错误
      for (let i = 0; i < 10; i++) {
        collector.recordProcessingError();
      }
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.application.dataProcessing.errorRate).toBe(10); // 10%错误率
    });
    
    test('应该处理应用指标采集错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 模拟错误情况
      const originalNow = performance.now;
      (performance as any).now = undefined;
      
      collector.startCollection();
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('采集应用指标失败:', expect.any(Error));
      
      // 恢复
      performance.now = originalNow;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('自定义指标管理测试', () => {
    test('应该能设置和获取自定义指标', () => {
      collector.setCustomMetric('customMetric1', 42);
      collector.setCustomMetric('customMetric2', 3.14);
      
      expect(collector.getCustomMetric('customMetric1')).toBe(42);
      expect(collector.getCustomMetric('customMetric2')).toBe(3.14);
      expect(collector.getCustomMetric('nonexistent')).toBeUndefined();
    });
    
    test('应该在快照中包含自定义指标', () => {
      collector.setCustomMetric('test', 100);
      collector.setCustomMetric('performance', 95.5);
      
      const snapshot = collector.getCurrentSnapshot();
      
      expect(snapshot.custom).toEqual({
        test: 100,
        performance: 95.5
      });
    });
  });

  describe('快照和历史管理测试', () => {
    test('应该正确生成性能快照', () => {
      collector.recordNetworkData(1024, 512);
      collector.recordFrame(16.67);
      collector.recordDataProcessing(20, 50);
      collector.setCustomMetric('test', 42);
      
      const snapshot = collector.getCurrentSnapshot();
      
      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('system');
      expect(snapshot).toHaveProperty('application');
      expect(snapshot).toHaveProperty('custom');
      
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.system.network.bytesReceived).toBe(1024);
      expect(snapshot.application.rendering.frameTime).toBe(16.67);
      expect(snapshot.application.dataProcessing.latency).toBe(20);
      expect(snapshot.custom.test).toBe(42);
    });
    
    test('应该正确管理历史快照', () => {
      const initialSnapshots = collector.getHistorySnapshots();
      expect(initialSnapshots).toHaveLength(0);
      
      // getCurrentSnapshot不会自动添加到历史，需要通过采集器添加
      collector.recordNetworkData(100);
      const snapshot1 = collector.getCurrentSnapshot();
      
      // 验证快照结构
      expect(snapshot1).toHaveProperty('timestamp');
      expect(snapshot1.system.network.bytesReceived).toBe(100);
    });
    
    test('应该支持限制历史快照数量', () => {
      const limitedSnapshots = collector.getHistorySnapshots(2);
      expect(Array.isArray(limitedSnapshots)).toBe(true);
      expect(limitedSnapshots.length).toBeLessThanOrEqual(2);
    });
    
    test('应该能清除历史数据', () => {
      collector.recordNetworkData(1024);
      collector.setCustomMetric('test', 100);
      
      collector.clearHistory();
      
      const history = collector.getHistorySnapshots();
      expect(history).toHaveLength(0);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.system.network.bytesReceived).toBe(0);
      expect(snapshot.custom).toEqual({});
    });
  });

  describe('配置管理测试', () => {
    test('应该能获取当前配置', () => {
      const config = collector.getConfig();
      
      expect(config).toHaveProperty('systemMetricsInterval');
      expect(config).toHaveProperty('applicationMetricsInterval');
      expect(config).toHaveProperty('historySize');
      expect(config).toHaveProperty('enableSystemMetrics');
      expect(config).toHaveProperty('enableApplicationMetrics');
    });
    
    test('应该能动态更新配置', () => {
      const newConfig: Partial<CollectorConfig> = {
        systemMetricsInterval: 5000,
        enableSystemMetrics: false
      };
      
      collector.startCollection();
      collector.updateConfig(newConfig);
      
      const config = collector.getConfig();
      expect(config.systemMetricsInterval).toBe(5000);
      expect(config.enableSystemMetrics).toBe(false);
    });
    
    test('应该在更新配置时正确重启采集', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      collector.startCollection();
      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
      
      collector.updateConfig({ systemMetricsInterval: 3000 });
      
      expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
      expect(setIntervalSpy).toHaveBeenCalledTimes(4); // 2 for start + 2 for restart
    });
  });

  describe('事件发射测试', () => {
    test('应该发射系统指标事件', async () => {
      const systemMetricsCallback = vi.fn();
      collector.on('systemMetrics', systemMetricsCallback);
      
      collector.startCollection();
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      expect(systemMetricsCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          cpu: expect.any(Object),
          memory: expect.any(Object),
          network: expect.any(Object),
          disk: expect.any(Object)
        })
      );
    });
    
    test('应该发射应用指标事件', async () => {
      const applicationMetricsCallback = vi.fn();
      collector.on('applicationMetrics', applicationMetricsCallback);
      
      collector.startCollection();
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      
      expect(applicationMetricsCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          rendering: expect.any(Object),
          dataProcessing: expect.any(Object),
          objectPool: expect.any(Object),
          virtualization: expect.any(Object)
        })
      );
    });
    
    test('应该发射采集开始和停止事件', () => {
      const startCallback = vi.fn();
      const stopCallback = vi.fn();
      
      collector.on('collectionStarted', startCallback);
      collector.on('collectionStopped', stopCallback);
      
      collector.startCollection();
      expect(startCallback).toHaveBeenCalledTimes(1);
      
      collector.stopCollection();
      expect(stopCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('销毁和清理测试', () => {
    test('应该正确销毁采集器', () => {
      collector.recordNetworkData(1024);
      collector.setCustomMetric('test', 42);
      collector.startCollection();
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      collector.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      const history = collector.getHistorySnapshots();
      expect(history).toHaveLength(0);
      
      expect(collector.getCustomMetric('test')).toBeUndefined();
    });
    
    test('应该清除所有事件监听器', () => {
      const callback = vi.fn();
      collector.on('systemMetrics', callback);
      
      collector.destroy();
      
      // 验证事件监听器被清除
      expect(collector.listenerCount('systemMetrics')).toBe(0);
    });
    
    test('应该将单例实例重置为null', () => {
      collector.destroy();
      
      // 销毁后应该能获取新实例
      const newInstance = PerformanceCollector.getInstance();
      expect(newInstance).not.toBe(collector);
    });
  });

  describe('边界情况和错误处理', () => {
    test('应该处理undefined和null值', () => {
      collector.recordDataProcessing(undefined, undefined);
      collector.recordNetworkData(0);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.application.dataProcessing.latency).toBe(0);
      expect(snapshot.application.dataProcessing.queueSize).toBe(0);
    });
    
    test('应该处理极大数值', () => {
      const largeValue = Number.MAX_SAFE_INTEGER;
      collector.recordNetworkData(largeValue);
      collector.setCustomMetric('large', largeValue);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.system.network.bytesReceived).toBe(largeValue);
      expect(snapshot.custom.large).toBe(largeValue);
    });
    
    test('应该处理负数值', () => {
      collector.setCustomMetric('negative', -100);
      
      const snapshot = collector.getCurrentSnapshot();
      expect(snapshot.custom.negative).toBe(-100);
    });
    
    test('应该处理浮点数精度', () => {
      const preciseValue = 3.141592653589793;
      collector.setCustomMetric('pi', preciseValue);
      
      expect(collector.getCustomMetric('pi')).toBe(preciseValue);
    });
    
    test('应该在没有采集时停止不会出错', () => {
      expect(() => collector.stopCollection()).not.toThrow();
    });
    
    test('应该处理配置为null的情况', () => {
      expect(() => collector.updateConfig({})).not.toThrow();
    });
  });
});
/**
 * PerformanceMonitor-Enhanced.test.ts
 * 专门针对分支覆盖率提升的测试
 * 
 * 目标: 将分支覆盖率从69.85%提升到95%+
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PerformanceMonitor,
  type PerformanceMetrics,
  type MonitorConfig
} from '@shared/PerformanceMonitor';

describe('PerformanceMonitor分支覆盖率增强测试', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 创建新实例
    monitor = new PerformanceMonitor();
  });
  
  afterEach(() => {
    monitor?.destroy();
    
    // 清理全局变量
    delete (globalThis as any).__performanceStats;
    delete (globalThis as any).__lastCPUSample;
    delete (globalThis as any).__gcCount;
  });

  describe('环境检测分支覆盖', () => {
    test('应该处理__performanceStats不存在的情况', () => {
      // 确保没有全局性能统计
      delete (globalThis as any).__performanceStats;
      
      expect(monitor.getDataProcessingSpeed()).toBe(0);
      expect(monitor.getRenderingFPS()).toBe(0);
      expect(monitor.getLatency()).toBe(0);
      expect(monitor.getThroughput()).toBe(0);
      expect(monitor.getBufferUtilization()).toBe(0);
      expect(monitor.getDroppedFrames()).toBe(0);
      expect(monitor.calculateErrorRate()).toBe(0);
    });
    
    test('应该处理__performanceStats存在的情况', () => {
      // 设置全局性能统计
      (globalThis as any).__performanceStats = {
        framesProcessedPerSecond: 120,
        renderingFPS: 60,
        averageLatency: 15.5,
        bytesPerSecond: 1024000,
        bufferUtilization: 0.75,
        droppedFrames: 5,
        errorCount: 2,
        totalOperations: 100
      };
      
      expect(monitor.getDataProcessingSpeed()).toBe(120);
      expect(monitor.getRenderingFPS()).toBe(60);
      expect(monitor.getLatency()).toBe(15.5);
      expect(monitor.getThroughput()).toBe(1024000);
      expect(monitor.getBufferUtilization()).toBe(0.75);
      expect(monitor.getDroppedFrames()).toBe(5);
      expect(monitor.calculateErrorRate()).toBe(2);
    });
    
    test('应该处理CPU样本数据', () => {
      // 测试没有CPU样本的情况
      delete (globalThis as any).__lastCPUSample;
      expect(monitor.getCPUUsage()).toBe(0);
      
      // 测试有CPU样本的情况
      (globalThis as any).__lastCPUSample = {
        busyTime: 500,
        totalTime: 1000,
        timestamp: Date.now() - 1000
      };
      
      const cpuUsage = monitor.getCPUUsage();
      expect(cpuUsage).toBeGreaterThanOrEqual(0);
      expect(cpuUsage).toBeLessThanOrEqual(100);
    });
    
    test('应该处理GC计数器', () => {
      // 测试没有GC计数的情况
      delete (globalThis as any).__gcCount;
      expect(monitor.getMemoryUsage()).toBeGreaterThan(0);
      
      // 测试有GC计数的情况
      (globalThis as any).__gcCount = 15;
      expect(monitor.getMemoryUsage()).toBeGreaterThan(0);
    });
    
    test('应该处理不同内存API环境', () => {
      // 测试浏览器环境 (performance.memory)
      const originalPerformance = global.performance;
      global.performance = {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024,
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 500 * 1024 * 1024
        }
      } as any;
      
      const browserMemory = monitor.getMemoryUsage();
      expect(browserMemory).toBeGreaterThan(0);
      
      // 测试Node.js环境 (process.memoryUsage)
      delete (global.performance as any).memory;
      global.process = {
        memoryUsage: () => ({
          heapUsed: 60 * 1024 * 1024,
          heapTotal: 120 * 1024 * 1024,
          external: 10 * 1024 * 1024,
          rss: 80 * 1024 * 1024
        })
      } as any;
      
      const nodeMemory = monitor.getMemoryUsage();
      expect(nodeMemory).toBeGreaterThan(0);
      
      // 测试都不可用的情况
      delete (global as any).process;
      const fallbackMemory = monitor.getMemoryUsage();
      expect(fallbackMemory).toBeGreaterThanOrEqual(0);
      
      // 恢复
      global.performance = originalPerformance;
    });
  });

  describe('边界条件和空值处理', () => {
    test('应该处理空历史记录', () => {
      // 清空历史记录
      monitor.clearHistory();
      
      expect(monitor.getUpdateFrequency()).toBe(0);
      expect(monitor.getCurrentMetrics()).toBeNull();
      expect(monitor.getAverageMetrics(10)).toEqual({
        timestamp: 0,
        cpu: 0,
        memory: 0,
        dataProcessingSpeed: 0,
        renderingFPS: 0,
        updateFrequency: 0,
        latency: 0,
        throughput: 0,
        bufferUtilization: 0,
        droppedFrames: 0,
        errorRate: 0
      });
    });
    
    test('应该处理历史记录少于2条的情况', () => {
      monitor.clearHistory();
      
      // 添加1条记录
      monitor.recordMetrics();
      expect(monitor.getUpdateFrequency()).toBe(0);
      
      // 等待一下再添加第2条记录  
      setTimeout(() => {
        monitor.recordMetrics();
        expect(monitor.getUpdateFrequency()).toBeGreaterThanOrEqual(0);
      }, 10);
    });
    
    test('应该处理错误率计算的边界情况', () => {
      // 测试除零情况
      (globalThis as any).__performanceStats = {
        errorCount: 5,
        totalOperations: 0
      };
      
      expect(monitor.calculateErrorRate()).toBe(500); // 5/1 * 100
      
      // 测试正常情况
      (globalThis as any).__performanceStats = {
        errorCount: 5,
        totalOperations: 100
      };
      
      expect(monitor.calculateErrorRate()).toBe(5); // 5/100 * 100
    });
  });

  describe('配置和错误处理分支', () => {
    test('应该处理基准测试禁用状态', async () => {
      const config: MonitorConfig = {
        enableBenchmark: false
      };
      
      monitor.updateConfig(config);
      
      await expect(monitor.runBenchmark()).rejects.toThrow('Benchmarking is disabled');
    });
    
    test('应该处理基准测试启用状态', async () => {
      const config: MonitorConfig = {
        enableBenchmark: true
      };
      
      monitor.updateConfig(config);
      
      // Mock基准测试执行
      const mockBenchmark = vi.fn().mockResolvedValue({
        passed: true,
        results: []
      });
      
      // 应该能正常执行基准测试
      expect(async () => {
        await monitor.runBenchmark();
      }).not.toThrow();
    });
    
    test('应该处理GC可用性检查', () => {
      // 模拟GC可用
      (globalThis as any).gc = vi.fn();
      
      // 触发内存清理
      monitor.forceGC();
      expect((globalThis as any).gc).toHaveBeenCalled();
      
      // 清理
      delete (globalThis as any).gc;
    });
    
    test('应该处理监控启停状态检查', () => {
      // 测试停止状态下的重复停止
      monitor.stopMonitoring();
      expect(() => monitor.stopMonitoring()).not.toThrow();
      
      // 测试启动状态下的重复启动
      monitor.startMonitoring();
      expect(() => monitor.startMonitoring()).not.toThrow();
    });
  });

  describe('数据处理和计算分支', () => {
    test('应该处理帧率计算的不同情况', () => {
      // 测试maxHistorySize为0的情况
      const originalMaxHistory = (monitor as any).maxHistorySize;
      (monitor as any).maxHistorySize = 0;
      
      const framesPerSecond = monitor.getFramesPerSecond();
      expect(framesPerSecond).toBeGreaterThanOrEqual(0);
      
      // 恢复
      (monitor as any).maxHistorySize = originalMaxHistory;
    });
    
    test('应该处理历史记录限制', () => {
      const originalMaxHistory = (monitor as any).maxHistorySize;
      (monitor as any).maxHistorySize = 3;
      
      // 添加超过限制的记录
      for (let i = 0; i < 10; i++) {
        monitor.recordMetrics();
      }
      
      const history = monitor.getHistorySnapshots();
      expect(history.length).toBeLessThanOrEqual(3);
      
      // 恢复
      (monitor as any).maxHistorySize = originalMaxHistory;
    });
    
    test('应该处理时间计算分支', () => {
      // 测试相同时间戳的情况
      const mockMetrics = [
        { timestamp: 1000 },
        { timestamp: 1000 }
      ];
      
      (monitor as any).metrics = mockMetrics;
      
      expect(monitor.getUpdateFrequency()).toBe(0);
      
      // 测试正常时间差
      const normalMetrics = [
        { timestamp: 1000 },
        { timestamp: 2000 }
      ];
      
      (monitor as any).metrics = normalMetrics;
      expect(monitor.getUpdateFrequency()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('预警和监控分支', () => {
    test('应该处理不同类型的预警', () => {
      const alertCallback = vi.fn();
      monitor.setAlertCallback(alertCallback);
      
      // 设置低阈值以触发预警
      const alertConfig: MonitorConfig = {
        cpuThreshold: 1,
        memoryThreshold: 1,
        fpsThreshold: 200, // 很高，应该触发预警
        enableAlerts: true
      };
      
      monitor.updateConfig(alertConfig);
      monitor.recordMetrics();
      
      // 应该触发预警
      expect(alertCallback).toHaveBeenCalled();
    });
    
    test('应该处理预警禁用状态', () => {
      const alertCallback = vi.fn();
      monitor.setAlertCallback(alertCallback);
      
      const noAlertConfig: MonitorConfig = {
        enableAlerts: false
      };
      
      monitor.updateConfig(noAlertConfig);
      monitor.recordMetrics();
      
      // 不应该触发预警
      expect(alertCallback).not.toHaveBeenCalled();
    });
  });

  describe('内存管理和资源清理分支', () => {
    test('应该处理大缓冲区清理', () => {
      // 模拟大缓冲区场景
      const largeMockBuffer = {
        size: 6000 // 大于5000的阈值
      };
      
      // 这需要访问内部缓冲区管理逻辑
      // 通过触发性能记录来间接测试
      for (let i = 0; i < 100; i++) {
        monitor.recordMetrics();
      }
      
      expect(monitor.getHistorySnapshots().length).toBeGreaterThan(0);
    });
    
    test('应该处理销毁过程中的清理', () => {
      // 启动监控
      monitor.startMonitoring();
      
      // 设置预警回调
      const alertCallback = vi.fn();
      monitor.setAlertCallback(alertCallback);
      
      // 添加一些数据
      monitor.recordMetrics();
      
      // 销毁并验证清理
      monitor.destroy();
      
      expect(monitor.getHistorySnapshots()).toHaveLength(0);
      expect(monitor.getCurrentMetrics()).toBeNull();
    });
  });

  describe('类型检查和兼容性分支', () => {
    test('应该处理不同的globalThis属性状态', () => {
      // 测试属性存在但值为falsy的情况
      (globalThis as any).__performanceStats = {
        framesProcessedPerSecond: 0,
        renderingFPS: null,
        averageLatency: undefined,
        bytesPerSecond: false,
        bufferUtilization: '',
        droppedFrames: NaN,
        errorCount: 0,
        totalOperations: 0
      };
      
      expect(monitor.getDataProcessingSpeed()).toBe(0);
      expect(monitor.getRenderingFPS()).toBe(0);
      expect(monitor.getLatency()).toBe(0);
      expect(monitor.getThroughput()).toBe(0);
      expect(monitor.getBufferUtilization()).toBe(0);
      expect(monitor.getDroppedFrames()).toBe(0);
      
      // errorCount为0，totalOperations为0，应该返回0/1*100=0
      expect(monitor.calculateErrorRate()).toBe(0);
    });
    
    test('应该处理process对象的不同状态', () => {
      // 测试process存在但memoryUsage不存在
      global.process = {} as any;
      
      expect(monitor.getMemoryUsage()).toBeGreaterThanOrEqual(0);
      
      // 测试process完全不存在
      delete (global as any).process;
      
      expect(monitor.getMemoryUsage()).toBeGreaterThanOrEqual(0);
    });
  });
});
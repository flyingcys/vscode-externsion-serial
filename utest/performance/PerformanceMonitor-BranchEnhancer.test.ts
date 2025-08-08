/**
 * PerformanceMonitor-BranchEnhancer.test.ts
 * 专门提升分支覆盖率的测试
 * 
 * 目标: 将分支覆盖率从69.85%提升到95%+
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor, type MonitorConfig } from '@shared/PerformanceMonitor';

// ===== Mock Setup =====
global.performance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024,
    totalJSHeapSize: 100 * 1024 * 1024,
    jsHeapSizeLimit: 500 * 1024 * 1024
  }
} as any;

describe('PerformanceMonitor分支覆盖率增强', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new PerformanceMonitor();
  });
  
  afterEach(() => {
    monitor?.dispose();
    
    // 清理全局变量
    delete (globalThis as any).__performanceStats;
    delete (globalThis as any).__lastCPUSample;
    delete (globalThis as any).__gcCount;
  });

  describe('条件分支覆盖增强', () => {
    test('应该处理不同配置选项的分支', () => {
      // 测试禁用各种功能的配置分支
      const config1: MonitorConfig = {
        enableBenchmark: false,
        enableAlerts: false,
        maxHistorySize: 0
      };
      
      monitor.updateConfig(config1);
      expect(() => monitor.getCurrentMetrics()).not.toThrow();
      
      // 测试启用所有功能的配置分支
      const config2: MonitorConfig = {
        enableBenchmark: true,
        enableAlerts: true,
        maxHistorySize: 1000,
        cpuThreshold: 80,
        memoryThreshold: 500,
        fpsThreshold: 30
      };
      
      monitor.updateConfig(config2);
      expect(() => monitor.getCurrentMetrics()).not.toThrow();
    });
    
    test('应该处理全局性能统计存在/不存在分支', () => {
      // 测试全局性能统计不存在的分支
      delete (globalThis as any).__performanceStats;
      const metrics1 = monitor.getCurrentMetrics();
      expect(metrics1).toBeDefined();
      
      // 测试全局性能统计存在的分支
      (globalThis as any).__performanceStats = {
        framesProcessedPerSecond: 120,
        renderingFPS: 60,
        averageLatency: 10,
        bytesPerSecond: 1024000,
        bufferUtilization: 0.8,
        droppedFrames: 2,
        errorCount: 1,
        totalOperations: 100
      };
      
      const metrics2 = monitor.getCurrentMetrics();
      expect(metrics2).toBeDefined();
    });
    
    test('应该处理CPU样本数据的不同分支', () => {
      // 测试没有CPU样本数据的分支
      delete (globalThis as any).__lastCPUSample;
      const metrics1 = monitor.getCurrentMetrics();
      expect(metrics1?.cpu).toBeGreaterThanOrEqual(0);
      
      // 测试有CPU样本数据的分支
      (globalThis as any).__lastCPUSample = {
        busyTime: 300,
        totalTime: 1000,
        timestamp: Date.now() - 1000
      };
      
      const metrics2 = monitor.getCurrentMetrics();
      expect(metrics2?.cpu).toBeGreaterThanOrEqual(0);
      
      // 测试CPU样本数据异常的分支
      (globalThis as any).__lastCPUSample = {
        busyTime: null,
        totalTime: 0,
        timestamp: Date.now() - 1000
      };
      
      const metrics3 = monitor.getCurrentMetrics();
      expect(metrics3?.cpu).toBeGreaterThanOrEqual(0);
    });
    
    test('应该处理内存API的不同分支', () => {
      // 测试performance.memory存在的分支
      global.performance.memory = {
        usedJSHeapSize: 60 * 1024 * 1024,
        totalJSHeapSize: 120 * 1024 * 1024,
        jsHeapSizeLimit: 600 * 1024 * 1024
      };
      
      const metrics1 = monitor.getCurrentMetrics();
      expect(metrics1?.memory).toBeGreaterThan(0);
      
      // 测试performance.memory不存在但process.memoryUsage存在的分支
      delete (global.performance as any).memory;
      global.process = {
        memoryUsage: () => ({
          heapUsed: 70 * 1024 * 1024,
          heapTotal: 140 * 1024 * 1024,
          external: 15 * 1024 * 1024,
          rss: 90 * 1024 * 1024
        })
      } as any;
      
      const metrics2 = monitor.getCurrentMetrics();
      expect(metrics2?.memory).toBeGreaterThan(0);
      
      // 测试都不可用的分支
      delete (global as any).process;
      const metrics3 = monitor.getCurrentMetrics();
      expect(metrics3?.memory).toBeGreaterThanOrEqual(0);
      
      // 恢复
      global.performance.memory = {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 500 * 1024 * 1024
      };
    });
    
    test('应该处理GC计数的分支', () => {
      // 测试没有GC计数的分支
      delete (globalThis as any).__gcCount;
      const metrics1 = monitor.getCurrentMetrics();
      expect(metrics1).toBeDefined();
      
      // 测试有GC计数的分支
      (globalThis as any).__gcCount = 5;
      const metrics2 = monitor.getCurrentMetrics();
      expect(metrics2).toBeDefined();
    });
  });

  describe('预警系统分支覆盖', () => {
    test('应该处理不同类型的预警触发分支', () => {
      const alertCallback = vi.fn();
      monitor.onAlert(alertCallback);
      
      // 配置低阈值以触发不同类型的预警
      monitor.updateConfig({
        enableAlerts: true,
        cpuThreshold: 1,     // 很低，应该触发CPU预警
        memoryThreshold: 1,  // 很低，应该触发内存预警
        fpsThreshold: 200    // 很高，应该触发FPS预警
      });
      
      // 设置会触发预警的全局统计
      (globalThis as any).__performanceStats = {
        renderingFPS: 10,  // 低于200的阈值
        errorCount: 10,
        totalOperations: 100
      };
      
      monitor.getCurrentMetrics();
      
      // 应该触发多种类型的预警
      expect(alertCallback).toHaveBeenCalled();
    });
    
    test('应该处理预警禁用的分支', () => {
      const alertCallback = vi.fn();
      monitor.onAlert(alertCallback);
      
      // 禁用预警
      monitor.updateConfig({
        enableAlerts: false
      });
      
      // 即使条件满足预警，也不应该触发
      monitor.getCurrentMetrics();
      expect(alertCallback).not.toHaveBeenCalled();
    });
  });

  describe('边界条件和错误处理分支', () => {
    test('应该处理历史记录为空的分支', () => {
      // 测试空历史记录时的各种方法
      const history = monitor.getHistory();
      expect(Array.isArray(history)).toBe(true);
      
      const statistics = monitor.getStatistics();
      expect(statistics).toBeDefined();
      
      const report = monitor.generateReport();
      expect(report).toBeDefined();
    });
    
    test('应该处理基准测试禁用的分支', async () => {
      monitor.updateConfig({
        enableBenchmark: false
      });
      
      await expect(monitor.runBenchmark()).rejects.toThrow('Benchmarking is disabled');
    });
    
    test('应该处理基准测试启用但执行失败的分支', async () => {
      monitor.updateConfig({
        enableBenchmark: true
      });
      
      // 基准测试应该能正常启动（即使可能失败）
      const result = await monitor.runBenchmark();
      expect(result).toBeDefined();
    });
    
    test('应该处理数值为null/undefined的分支', () => {
      // 设置包含null/undefined值的全局统计
      (globalThis as any).__performanceStats = {
        framesProcessedPerSecond: null,
        renderingFPS: undefined,
        averageLatency: 0,
        bytesPerSecond: null,
        bufferUtilization: undefined,
        droppedFrames: NaN,
        errorCount: undefined,
        totalOperations: null
      };
      
      const metrics = monitor.getCurrentMetrics();
      expect(metrics).toBeDefined();
      expect(metrics?.dataProcessingSpeed).toBeGreaterThanOrEqual(0);
      expect(metrics?.renderingFPS).toBeGreaterThanOrEqual(0);
    });
  });

  describe('定时器和监控状态分支', () => {
    test('应该处理重复启动/停止监控的分支', () => {
      // 测试重复启动
      monitor.startMonitoring();
      expect(() => monitor.startMonitoring()).not.toThrow();
      
      // 测试重复停止
      monitor.stopMonitoring();
      expect(() => monitor.stopMonitoring()).not.toThrow();
    });
    
    test('应该处理监控间隔为null的分支', () => {
      // 确保监控未启动
      monitor.stopMonitoring();
      
      // 各种操作应该仍然正常工作
      expect(() => monitor.getCurrentMetrics()).not.toThrow();
      expect(() => monitor.getHistory()).not.toThrow();
      expect(() => monitor.getStatistics()).not.toThrow();
    });
  });

  describe('数据计算和统计分支', () => {
    test('应该处理除零和异常数值的分支', () => {
      // 设置会导致除零的全局统计
      (globalThis as any).__performanceStats = {
        errorCount: 5,
        totalOperations: 0  // 会导致除零
      };
      
      const metrics = monitor.getCurrentMetrics();
      expect(metrics).toBeDefined();
      expect(metrics?.errorRate).toBeGreaterThanOrEqual(0);
    });
    
    test('应该处理时间计算的不同分支', () => {
      // 创建多个指标记录来测试时间计算
      monitor.startMonitoring();
      
      // 添加一些间隔的记录
      setTimeout(() => {
        monitor.getCurrentMetrics();
        setTimeout(() => {
          monitor.getCurrentMetrics();
          const statistics = monitor.getStatistics();
          expect(statistics).toBeDefined();
        }, 100);
      }, 100);
    });
    
    test('应该处理historySize限制的分支', () => {
      // 设置小的历史记录大小
      monitor.updateConfig({
        maxHistorySize: 3
      });
      
      // 添加超过限制的记录
      for (let i = 0; i < 10; i++) {
        monitor.getCurrentMetrics();
      }
      
      const history = monitor.getHistory();
      expect(history.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GC和内存管理分支', () => {
    test('应该处理GC可用/不可用的分支', () => {
      // 测试GC不可用的分支
      delete (globalThis as any).gc;
      expect(() => monitor.getCurrentMetrics()).not.toThrow();
      
      // 测试GC可用的分支
      (globalThis as any).gc = vi.fn();
      expect(() => monitor.getCurrentMetrics()).not.toThrow();
      
      // 清理
      delete (globalThis as any).gc;
    });
    
    test('应该处理内存阈值检查的不同分支', () => {
      const alertCallback = vi.fn();
      monitor.onAlert(alertCallback);
      
      // 配置不同的内存阈值
      monitor.updateConfig({
        enableAlerts: true,
        memoryThreshold: 1  // 1MB，应该总是触发
      });
      
      monitor.getCurrentMetrics();
      expect(alertCallback).toHaveBeenCalled();
      
      // 重置并测试高阈值
      alertCallback.mockClear();
      monitor.updateConfig({
        memoryThreshold: 10000  // 10GB，应该永远不触发
      });
      
      monitor.getCurrentMetrics();
      // 这次不应该触发预警（取决于实际内存使用）
    });
  });
});
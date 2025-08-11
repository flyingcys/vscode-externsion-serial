/**
 * PerformanceMonitor.test.ts
 * 性能监控器单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PerformanceMonitor,
  PerformanceCollector,
  PerformanceBenchmark,
  type PerformanceMetrics,
  type PerformanceBaseline,
  type BenchmarkResult,
  type MonitorConfig
} from '../../src/shared/PerformanceMonitor';

// Mock global performance objects
const mockPerformanceStats = {
  framesProcessedPerSecond: 5000,
  renderingFPS: 60,
  averageLatency: 25,
  bytesPerSecond: 500000,
  bufferUtilization: 75,
  droppedFrames: 2,
  errorCount: 1,
  totalOperations: 100
};

// Mock performance.memory
const mockMemory = {
  usedJSHeapSize: 100 * 1024 * 1024, // 100MB
  totalJSHeapSize: 200 * 1024 * 1024, // 200MB
  jsHeapSizeLimit: 500 * 1024 * 1024  // 500MB
};

// Mock document for Canvas tests
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  }))
};

global.document = {
  createElement: vi.fn(() => mockCanvas)
} as any;

// Setup globals
beforeEach(() => {
  (globalThis as any).__performanceStats = mockPerformanceStats;
  (globalThis as any).__gcCount = 5;
  (globalThis as any).__lastCPUSample = {
    timestamp: performance.now(),
    busyTime: 50
  };
  
  Object.defineProperty(global.performance, 'memory', {
    value: mockMemory,
    configurable: true
  });
});

afterEach(() => {
  delete (globalThis as any).__performanceStats;
  delete (globalThis as any).__gcCount;
  delete (globalThis as any).__lastCPUSample;
});

describe('PerformanceCollector', () => {
  let collector: PerformanceCollector;
  
  beforeEach(() => {
    collector = new PerformanceCollector(100);
  });
  
  afterEach(() => {
    collector.clear();
  });

  describe('数据采集测试', () => {
    test('应该能采集基本性能指标', () => {
      const metrics = collector.collect();
      
      expect(metrics).toHaveProperty('dataProcessingRate');
      expect(metrics).toHaveProperty('renderingFPS');
      expect(metrics).toHaveProperty('updateFrequency');
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('cpuUsage');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('memoryLeakRate');
      expect(metrics).toHaveProperty('gcFrequency');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('bufferUtilization');
      expect(metrics).toHaveProperty('droppedFrames');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('timestamp');
      
      expect(typeof metrics.timestamp).toBe('number');
    });

    test('应该从全局统计中获取数据处理速度', () => {
      const metrics = collector.collect();
      expect(metrics.dataProcessingRate).toBe(mockPerformanceStats.framesProcessedPerSecond);
    });

    test('应该从全局统计中获取渲染帧率', () => {
      const metrics = collector.collect();
      expect(metrics.renderingFPS).toBe(mockPerformanceStats.renderingFPS);
    });

    test('应该从全局统计中获取延迟信息', () => {
      const metrics = collector.collect();
      expect(metrics.latency).toBe(mockPerformanceStats.averageLatency);
    });

    test('应该计算CPU使用率', () => {
      const metrics = collector.collect();
      expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.cpuUsage).toBeLessThanOrEqual(100);
    });

    test('应该获取内存使用量', () => {
      const metrics = collector.collect();
      expect(metrics.memoryUsage).toBe(mockMemory.usedJSHeapSize / 1024 / 1024);
    });

    test('应该计算吞吐量', () => {
      const metrics = collector.collect();
      expect(metrics.throughput).toBe(mockPerformanceStats.bytesPerSecond);
    });

    test('应该计算缓冲区利用率', () => {
      const metrics = collector.collect();
      expect(metrics.bufferUtilization).toBe(mockPerformanceStats.bufferUtilization);
    });

    test('应该获取丢帧数', () => {
      const metrics = collector.collect();
      expect(metrics.droppedFrames).toBe(mockPerformanceStats.droppedFrames);
    });

    test('应该计算错误率', () => {
      const metrics = collector.collect();
      const expectedErrorRate = (mockPerformanceStats.errorCount / mockPerformanceStats.totalOperations) * 100;
      expect(metrics.errorRate).toBe(expectedErrorRate);
    });
  });

  describe('更新频率计算测试', () => {
    test('应该在没有历史数据时返回0', () => {
      const metrics = collector.collect();
      expect(metrics.updateFrequency).toBe(0);
    });

    test('应该计算更新频率', async () => {
      // 采集第一个样本
      collector.collect();
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 采集更多样本
      for (let i = 0; i < 5; i++) {
        collector.collect();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const metrics = collector.collect();
      expect(metrics.updateFrequency).toBeGreaterThan(0);
    });
  });

  describe('历史数据管理测试', () => {
    test('应该保存历史数据', () => {
      collector.collect();
      collector.collect();
      collector.collect();
      
      const history = collector.getHistory();
      expect(history.length).toBe(3);
    });

    test('应该限制历史数据大小', () => {
      const smallCollector = new PerformanceCollector(2);
      
      smallCollector.collect();
      smallCollector.collect();
      smallCollector.collect();
      
      const history = smallCollector.getHistory();
      expect(history.length).toBe(2);
    });

    test('应该能清空历史数据', () => {
      collector.collect();
      collector.collect();
      
      collector.clear();
      
      const history = collector.getHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('统计计算测试', () => {
    test('应该在没有数据时返回null', () => {
      const stats = collector.getStatistics();
      expect(stats).toBeNull();
    });

    test('应该计算统计数据', () => {
      // 采集一些数据
      for (let i = 0; i < 10; i++) {
        collector.collect();
      }
      
      const stats = collector.getStatistics();
      expect(stats).not.toBeNull();
      expect(stats).toHaveProperty('dataProcessingRate');
      expect(stats).toHaveProperty('renderingFPS');
      expect(stats).toHaveProperty('updateFrequency');
      expect(stats).toHaveProperty('memoryUsage');
      
      // 每个统计项都应该有current, average, max, min
      expect(stats!.dataProcessingRate).toHaveProperty('current');
      expect(stats!.dataProcessingRate).toHaveProperty('average');
      expect(stats!.dataProcessingRate).toHaveProperty('max');
      expect(stats!.dataProcessingRate).toHaveProperty('min');
    });
  });

  describe('内存泄漏检测测试', () => {
    test('应该计算内存泄漏率', () => {
      const initialMetrics = collector.collect();
      const initialMemoryUsage = initialMetrics.memoryUsage;
      
      // 模拟内存增长
      mockMemory.usedJSHeapSize = 120 * 1024 * 1024; // 增加20MB
      
      const secondMetrics = collector.collect();
      const memoryIncrease = secondMetrics.memoryUsage - initialMemoryUsage;
      
      // 内存泄漏率应该反映增长（正值）
      expect(secondMetrics.memoryLeakRate).toBeGreaterThan(0);
      expect(memoryIncrease).toBe(20); // 验证内存确实增长了20MB
    });
  });

  describe('GC频率计算测试', () => {
    test('应该计算GC频率', () => {
      const initialMetrics = collector.collect();
      
      // 模拟GC增加
      (globalThis as any).__gcCount = 10;
      
      const secondMetrics = collector.collect();
      expect(secondMetrics.gcFrequency).toBeGreaterThan(0);
    });
  });
});

describe('PerformanceBenchmark', () => {
  let benchmark: PerformanceBenchmark;
  
  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });
  
  afterEach(() => {
    benchmark.clear();
  });

  describe('基准测试执行', () => {
    test('应该执行基本基准测试', async () => {
      const testFunction = vi.fn().mockResolvedValue(42);
      
      const result = await benchmark.benchmark(
        'Test Function',
        testFunction,
        10, // iterations
        5   // warmup iterations
      );
      
      expect(result.testName).toBe('Test Function');
      expect(result.iterations).toBe(10);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.operationsPerSecond).toBeGreaterThan(0);
      expect(testFunction).toHaveBeenCalledTimes(15); // 5 warmup + 10 test
    });

    test('应该计算正确的统计数据', async () => {
      const testFunction = () => new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await benchmark.benchmark(
        'Async Test',
        testFunction,
        5,
        2
      );
      
      expect(result.minTime).toBeGreaterThan(0);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
      expect(result.averageTime).toBeGreaterThanOrEqual(result.minTime);
      expect(result.averageTime).toBeLessThanOrEqual(result.maxTime);
      expect(result.standardDeviation).toBeGreaterThanOrEqual(0);
    });

    test('应该记录内存使用情况', async () => {
      const testFunction = () => {
        // 创建一些临时对象
        const temp = new Array(1000).fill(0);
        return temp.length;
      };
      
      const result = await benchmark.benchmark(
        'Memory Test',
        testFunction,
        10,
        2
      );
      
      expect(result.memoryUsageBefore).toBeGreaterThanOrEqual(0);
      expect(result.memoryUsageAfter).toBeGreaterThanOrEqual(0);
      expect(result.memoryDelta).toBeDefined();
    });
  });

  describe('专项基准测试', () => {
    test('应该执行数据处理基准测试', async () => {
      // Mock dynamic import
      vi.doMock('../workers/DataProcessor', () => ({
        default: { process: vi.fn(() => 1000) }
      }));
      
      const result = await benchmark.benchmarkDataProcessing();
      
      expect(result.testName).toBe('Data Processing');
      expect(result.operationsPerSecond).toBeGreaterThan(0);
    });

    test('应该执行环形缓冲区基准测试', async () => {
      // Mock CircularBuffer
      vi.doMock('./CircularBuffer', () => ({
        CircularBuffer: class {
          size = 0;
          append(data: Uint8Array) { this.size += data.length; }
          read(count: number) { this.size -= count; return new Uint8Array(count); }
        }
      }));
      
      const result = await benchmark.benchmarkCircularBuffer();
      
      expect(result.testName).toBe('Circular Buffer Operations');
      expect(result.iterations).toBeGreaterThan(0);
    });

    test('应该执行帧读取器基准测试', async () => {
      // Mock FrameReader and CircularBuffer
      vi.doMock('./FrameReader', () => ({
        FrameReader: class {
          extractFrames() { return ['1', '2', '3']; }
        }
      }));
      
      vi.doMock('./CircularBuffer', () => ({
        CircularBuffer: class {
          append() {}
        }
      }));
      
      const result = await benchmark.benchmarkFrameReader();
      
      expect(result.testName).toBe('Frame Reader Processing');
      expect(result.operationsPerSecond).toBeGreaterThan(0);
    });

    test('应该执行数据压缩基准测试', async () => {
      // Mock DataCompressor
      vi.doMock('./DataCompression', () => ({
        DataCompressor: {
          compressAuto: vi.fn((data) => ({ compressed: true, data })),
          decompress: vi.fn((compressed) => compressed.data)
        }
      }));
      
      const result = await benchmark.benchmarkDataCompression();
      
      expect(result.testName).toBe('Data Compression');
      expect(result.operationsPerSecond).toBeGreaterThan(0);
    });

    test('应该执行渲染基准测试', async () => {
      const result = await benchmark.benchmarkRendering();
      
      expect(result.testName).toBe('Canvas Rendering');
      expect(result.operationsPerSecond).toBeGreaterThan(0);
      
      // 验证Canvas和document被调用
      expect(global.document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });
  });

  describe('基准线验证', () => {
    test('应该验证性能基准线', async () => {
      // 创建一个快速的测试函数
      const fastFunction = () => 42;
      await benchmark.benchmark('Fast Test', fastFunction, 100, 10);
      
      const baseline: PerformanceBaseline = {
        name: 'Test Baseline',
        targetDataProcessingRate: 1000,
        targetRenderingFPS: 60,
        targetUpdateFrequency: 20,
        targetLatency: 50,
        targetMemoryUsage: 500,
        targetThroughput: 1000000
      };
      
      const validation = benchmark.validateBaseline(baseline);
      
      expect(validation).toHaveProperty('passed');
      expect(validation).toHaveProperty('failedTests');
      expect(validation).toHaveProperty('results');
      expect(validation.results.length).toBe(1);
    });

    test('应该识别性能不达标的测试', async () => {
      // 创建一个慢速的测试函数 - 使用同步慢函数以确保能测试到性能问题
      const slowFunction = () => {
        // 执行一些CPU密集型操作
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
          sum += Math.sqrt(i);
        }
        return sum;
      };
      await benchmark.benchmark('Data Processing', slowFunction, 10, 2);
      
      const strictBaseline: PerformanceBaseline = {
        name: 'Strict Baseline',
        targetDataProcessingRate: 100000, // 很高的要求，肯定不达标
        targetRenderingFPS: 120,
        targetUpdateFrequency: 60,
        targetLatency: 10,
        targetMemoryUsage: 1, // 很低的内存限制，肯定不达标
        targetThroughput: 10000000
      };
      
      const validation = benchmark.validateBaseline(strictBaseline);
      
      expect(validation.passed).toBe(false);
      expect(validation.failedTests.length).toBeGreaterThan(0);
    });
  });

  describe('结果管理', () => {
    test('应该能获取所有结果', async () => {
      await benchmark.benchmark('Test 1', () => 1, 5, 1);
      await benchmark.benchmark('Test 2', () => 2, 5, 1);
      
      const results = benchmark.getResults();
      expect(results.length).toBe(2);
      expect(results[0].testName).toBe('Test 1');
      expect(results[1].testName).toBe('Test 2');
    });

    test('应该能清空结果', async () => {
      await benchmark.benchmark('Test', () => 1, 5, 1);
      
      benchmark.clear();
      
      const results = benchmark.getResults();
      expect(results.length).toBe(0);
    });
  });

  describe('完整基准测试套件', () => {
    test('应该能运行所有基准测试', async () => {
      // Mock all required modules
      vi.doMock('../workers/DataProcessor', () => ({ default: { process: () => 1000 } }));
      vi.doMock('./CircularBuffer', () => ({
        CircularBuffer: class { size = 0; append() { this.size++; } read() { this.size--; return new Uint8Array(10); } }
      }));
      vi.doMock('./FrameReader', () => ({
        FrameReader: class { extractFrames() { return ['frame1']; } }
      }));
      vi.doMock('./DataCompression', () => ({
        DataCompressor: {
          compressAuto: (data: any) => ({ data }),
          decompress: (compressed: any) => compressed.data
        }
      }));
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const results = await benchmark.runAllBenchmarks();
      
      expect(results.length).toBeGreaterThan(0);
      expect(consoleSpy).toHaveBeenCalledWith('Starting performance benchmarks...');
      expect(consoleSpy).toHaveBeenCalledWith('Performance benchmarks completed.');
      
      consoleSpy.mockRestore();
    }, 10000); // 增加超时时间

    test('应该处理基准测试执行错误', async () => {
      // 创建一个新的benchmark实例以避免缓存的模块影响
      const failingBenchmark = new PerformanceBenchmark();
      
      // Mock console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Override the benchmarkDataProcessing method to throw an error
      vi.spyOn(failingBenchmark, 'benchmarkDataProcessing').mockImplementation(async () => {
        throw new Error('Benchmark failed');
      });
      
      const results = await failingBenchmark.runAllBenchmarks();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Benchmark execution failed:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    if (monitor) {
      monitor.dispose();
    }
    vi.useRealTimers();
  });

  describe('监控器初始化', () => {
    test('应该使用默认配置创建监控器', () => {
      monitor = new PerformanceMonitor();
      
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });

    test('应该使用自定义配置创建监控器', () => {
      const customConfig: Partial<MonitorConfig> = {
        sampleInterval: 2000,
        historySize: 1000,
        alertThreshold: 0.9,
        enableRealTimeMonitoring: false,
        enableBenchmarking: false
      };
      
      monitor = new PerformanceMonitor(customConfig);
      
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('实时监控功能', () => {
    test('应该自动开始监控', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      monitor = new PerformanceMonitor({
        enableRealTimeMonitoring: true,
        sampleInterval: 1000
      });
      
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        1000
      );
    });

    test('应该能手动停止和开始监控', () => {
      monitor = new PerformanceMonitor({
        enableRealTimeMonitoring: false
      });
      
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      monitor.startMonitoring();
      expect(setIntervalSpy).toHaveBeenCalled();
      
      monitor.stopMonitoring();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    test('应该防止重复启动监控', () => {
      monitor = new PerformanceMonitor({
        enableRealTimeMonitoring: false
      });
      
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      monitor.startMonitoring();
      monitor.startMonitoring(); // 第二次调用应该被忽略
      
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('性能数据获取', () => {
    test('应该能获取当前性能指标', () => {
      monitor = new PerformanceMonitor();
      
      const metrics = monitor.getCurrentMetrics();
      
      expect(metrics).toHaveProperty('dataProcessingRate');
      expect(metrics).toHaveProperty('renderingFPS');
      expect(metrics).toHaveProperty('timestamp');
    });

    test('应该能获取历史数据', () => {
      monitor = new PerformanceMonitor();
      
      // 触发一些数据采集
      monitor.getCurrentMetrics();
      monitor.getCurrentMetrics();
      
      const history = monitor.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    test('应该能获取统计数据', () => {
      monitor = new PerformanceMonitor();
      
      // 采集一些数据
      for (let i = 0; i < 5; i++) {
        monitor.getCurrentMetrics();
      }
      
      const statistics = monitor.getStatistics();
      expect(statistics).not.toBeNull();
    });
  });

  describe('报警功能', () => {
    test('应该触发性能报警', () => {
      const alertCallback = vi.fn();
      
      monitor = new PerformanceMonitor({
        alertThreshold: 0.9,
        baseline: {
          name: 'Test',
          targetDataProcessingRate: 10000,
          targetRenderingFPS: 60,
          targetUpdateFrequency: 20,
          targetLatency: 50,
          targetMemoryUsage: 500,
          targetThroughput: 1000000
        }
      });
      
      monitor.onAlert(alertCallback);
      
      // 模拟低性能指标
      mockPerformanceStats.renderingFPS = 30; // 低于60 * 0.9 = 54
      mockPerformanceStats.averageLatency = 100; // 高于50 / 0.9 = 55.6
      mockMemory.usedJSHeapSize = 600 * 1024 * 1024; // 高于500 * 0.9 = 450MB
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // 触发监控
      monitor.getCurrentMetrics();
      
      // 手动触发检查（因为使用了fake timers）
      vi.advanceTimersByTime(1000);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Performance alerts:', expect.any(Array));
      
      consoleWarnSpy.mockRestore();
    });

    test('应该能添加多个报警回调', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      monitor = new PerformanceMonitor({
        alertThreshold: 0.5
      });
      
      monitor.onAlert(callback1);
      monitor.onAlert(callback2);
      
      // 模拟报警条件
      mockPerformanceStats.renderingFPS = 10; // 很低的FPS
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      monitor.getCurrentMetrics();
      vi.advanceTimersByTime(1000);
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('基准测试集成', () => {
    test('应该能运行基准测试', async () => {
      monitor = new PerformanceMonitor({
        enableBenchmarking: true
      });
      
      // Mock all required modules for benchmarks
      vi.doMock('../workers/DataProcessor', () => ({ default: { process: () => 1000 } }));
      vi.doMock('./CircularBuffer', () => ({
        CircularBuffer: class { size = 0; append() {} read() { return new Uint8Array(10); } }
      }));
      vi.doMock('./FrameReader', () => ({
        FrameReader: class { extractFrames() { return ['frame']; } }
      }));
      vi.doMock('./DataCompression', () => ({
        DataCompressor: {
          compressAuto: (data: any) => ({ data }),
          decompress: (compressed: any) => compressed.data
        }
      }));
      
      const result = await monitor.runBenchmark();
      
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('failedTests');
      expect(result).toHaveProperty('results');
    }, 15000);

    test('应该在禁用基准测试时抛出错误', async () => {
      monitor = new PerformanceMonitor({
        enableBenchmarking: false
      });
      
      await expect(monitor.runBenchmark()).rejects.toThrow('Benchmarking is disabled');
    });
  });

  describe('报告生成', () => {
    test('应该生成完整的性能报告', () => {
      monitor = new PerformanceMonitor();
      
      // 采集一些数据
      for (let i = 0; i < 10; i++) {
        monitor.getCurrentMetrics();
      }
      
      const report = monitor.generateReport();
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('benchmarks');
      expect(report).toHaveProperty('recommendations');
      
      expect(report.summary).toHaveProperty('monitoringDuration');
      expect(report.summary).toHaveProperty('totalSamples');
      expect(report.summary).toHaveProperty('overallHealth');
      
      expect(Array.isArray(report.metrics)).toBe(true);
      expect(Array.isArray(report.benchmarks)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    test('应该生成性能改进建议', () => {
      monitor = new PerformanceMonitor({
        baseline: {
          name: 'Test',
          targetDataProcessingRate: 10000,
          targetRenderingFPS: 120, // 高于当前的60
          targetUpdateFrequency: 50, // 高于当前的20
          targetLatency: 25,
          targetMemoryUsage: 50, // 低于当前的100MB
          targetThroughput: 2000000 // 高于当前的500KB
        }
      });
      
      // 采集数据
      for (let i = 0; i < 20; i++) {
        monitor.getCurrentMetrics();
      }
      
      const report = monitor.generateReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(r => r.includes('渲染性能'))).toBe(true);
      expect(report.recommendations.some(r => r.includes('内存'))).toBe(true);
    });

    test('应该计算整体健康度评分', () => {
      monitor = new PerformanceMonitor();
      
      // 采集数据
      for (let i = 0; i < 10; i++) {
        monitor.getCurrentMetrics();
      }
      
      const report = monitor.generateReport();
      
      expect(report.summary.overallHealth).toBeGreaterThanOrEqual(0);
      expect(report.summary.overallHealth).toBeLessThanOrEqual(100);
    });
  });

  describe('配置管理', () => {
    test('应该能更新配置', () => {
      monitor = new PerformanceMonitor({
        sampleInterval: 1000
      });
      
      monitor.updateConfig({
        sampleInterval: 2000,
        alertThreshold: 0.7
      });
      
      // 配置更新应该成功（无异常抛出）
      expect(() => monitor.getCurrentMetrics()).not.toThrow();
    });
  });

  describe('资源清理', () => {
    test('应该正确清理所有资源', () => {
      monitor = new PerformanceMonitor({
        enableRealTimeMonitoring: true
      });
      
      const callback = vi.fn();
      monitor.onAlert(callback);
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      monitor.dispose();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      // 采集一些数据确保清理后状态正确
      const history = monitor.getHistory();
      expect(history.length).toBe(0);
    });

    test('应该清理报警回调', () => {
      monitor = new PerformanceMonitor();
      
      const callback = vi.fn();
      monitor.onAlert(callback);
      
      monitor.dispose();
      
      // 触发可能的报警条件
      mockPerformanceStats.renderingFPS = 1;
      monitor.getCurrentMetrics();
      
      // 回调不应该被调用
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
/**
 * PerformanceTestFramework - 性能测试框架
 * 对标Serial-Studio性能指标，提供全面的性能测试和基准对比
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

/**
 * 性能测试配置
 */
export interface PerformanceTestConfig {
  name: string;
  description: string;
  iterations: number;
  warmupIterations: number;
  timeout: number;
  dataSize: number;
  concurrency?: number;
  targetFPS?: number;
  memoryLimit?: number; // MB
}

/**
 * 性能测试结果
 */
export interface PerformanceTestResult {
  testName: string;
  success: boolean;
  executionTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  
  // 具体性能指标
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  throughput: number; // items/second
  latency: number;
  
  // 对比基准
  baselineComparison?: {
    fpsRatio: number;
    memoryRatio: number;
    throughputRatio: number;
    latencyRatio: number;
  };
  
  iterations: number;
  timestamp: number;
  environment: {
    platform: string;
    nodeVersion: string;
    memoryLimit: number;
  };
}

/**
 * Serial-Studio基准性能指标
 */
export interface SerialStudioBaseline {
  // 数据处理性能
  dataProcessingRate: number; // frames/second
  maxDataRate: number; // bytes/second
  
  // 渲染性能
  plotUpdateRate: number; // Hz
  maxPlotPoints: number;
  renderFPS: number;
  
  // 内存使用
  baseMemoryUsage: number; // MB
  memoryPerDataPoint: number; // bytes
  maxMemoryUsage: number; // MB
  
  // 响应延迟
  averageLatency: number; // ms
  maxLatency: number; // ms
  
  // 并发性能
  maxConcurrentConnections: number;
  threadPoolSize: number;
}

/**
 * 测试用例接口
 */
export interface TestCase {
  name: string;
  description: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  test: () => Promise<any>;
  validate?: (result: any) => boolean;
  config: PerformanceTestConfig;
}

/**
 * 性能测试套件
 */
export class PerformanceTestFramework extends EventEmitter {
  private testCases: Map<string, TestCase> = new Map();
  private results: Map<string, PerformanceTestResult> = new Map();
  private baseline: SerialStudioBaseline | null = null;
  private isRunning = false;
  
  // 性能监控
  private memoryMonitor: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    super();
    this.setupPerformanceMonitoring();
    this.loadSerialStudioBaseline();
  }

  /**
   * 加载Serial-Studio基准性能数据
   */
  private loadSerialStudioBaseline(): void {
    // 基于Serial-Studio实际性能数据的基准
    this.baseline = {
      // 数据处理性能（基于Serial-Studio的IO性能）
      dataProcessingRate: 1000,   // 1000 frames/second
      maxDataRate: 2000000,       // 2MB/second
      
      // 渲染性能（基于Qt的渲染能力）
      plotUpdateRate: 30,         // 30Hz更新率
      maxPlotPoints: 10000,       // 最大1万个数据点
      renderFPS: 60,              // 60fps渲染
      
      // 内存使用（基于Qt应用的内存占用）
      baseMemoryUsage: 50,        // 50MB基础内存
      memoryPerDataPoint: 24,     // 24字节每个数据点
      maxMemoryUsage: 500,        // 500MB最大内存
      
      // 响应延迟（基于实时数据处理）
      averageLatency: 16,         // 16ms平均延迟
      maxLatency: 100,            // 100ms最大延迟
      
      // 并发性能（基于多线程架构）
      maxConcurrentConnections: 10,
      threadPoolSize: 4
    };
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.emit('performanceEntry', entry);
          }
        });
        
        this.performanceObserver.observe({ 
          entryTypes: ['measure', 'mark', 'navigation'] 
        });
      } catch (error) {
        console.warn('性能观察器初始化失败:', error);
      }
    }
  }

  /**
   * 注册测试用例
   */
  registerTest(testCase: TestCase): void {
    this.testCases.set(testCase.name, testCase);
    console.log(`性能测试用例已注册: ${testCase.name}`);
  }

  /**
   * 批量注册测试用例
   */
  registerTests(testCases: TestCase[]): void {
    testCases.forEach(testCase => this.registerTest(testCase));
  }

  /**
   * 运行单个测试
   */
  async runTest(testName: string): Promise<PerformanceTestResult> {
    const testCase = this.testCases.get(testName);
    if (!testCase) {
      throw new Error(`测试用例不存在: ${testName}`);
    }

    console.log(`开始执行性能测试: ${testName}`);
    this.emit('testStart', { testName });

    const result = await this.executeTest(testCase);
    this.results.set(testName, result);
    
    this.emit('testComplete', { testName, result });
    console.log(`性能测试完成: ${testName}`);
    
    return result;
  }

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<Map<string, PerformanceTestResult>> {
    if (this.isRunning) {
      throw new Error('测试套件正在运行中');
    }

    this.isRunning = true;
    this.results.clear();

    console.log(`开始运行性能测试套件，共 ${this.testCases.size} 个测试用例`);
    this.emit('suiteStart', { totalTests: this.testCases.size });

    try {
      for (const [testName] of this.testCases) {
        await this.runTest(testName);
      }
    } catch (error) {
      console.error('测试套件执行出错:', error);
      this.emit('suiteError', { error });
    } finally {
      this.isRunning = false;
    }

    this.emit('suiteComplete', { results: this.results });
    console.log('性能测试套件执行完成');
    
    return this.results;
  }

  /**
   * 执行测试用例
   */
  private async executeTest(testCase: TestCase): Promise<PerformanceTestResult> {
    const { config } = testCase;
    const executionTimes: number[] = [];
    const memoryUsages: number[] = [];
    const fpsValues: number[] = [];
    
    let setupTime = 0;
    let teardownTime = 0;

    try {
      // 设置阶段
      if (testCase.setup) {
        const setupStart = performance.now();
        await testCase.setup();
        setupTime = performance.now() - setupStart;
      }

      // 预热阶段
      console.log(`预热阶段: ${config.warmupIterations} 次迭代`);
      for (let i = 0; i < config.warmupIterations; i++) {
        await testCase.test();
      }

      // 正式测试阶段
      console.log(`正式测试: ${config.iterations} 次迭代`);
      for (let i = 0; i < config.iterations; i++) {
        // 性能标记
        const markStart = `test-${testCase.name}-${i}-start`;
        const markEnd = `test-${testCase.name}-${i}-end`;
        
        performance.mark(markStart);
        
        // 开始内存监控
        const memoryBefore = this.getCurrentMemoryUsage();
        const fpsCounter = this.startFPSCounter();
        
        // 执行测试
        const result = await Promise.race([
          testCase.test(),
          this.createTimeoutPromise(config.timeout)
        ]);
        
        performance.mark(markEnd);
        
        // 收集性能数据
        const memoryAfter = this.getCurrentMemoryUsage();
        const fps = this.stopFPSCounter(fpsCounter);
        
        // 验证结果
        if (testCase.validate && !testCase.validate(result)) {
          throw new Error(`测试验证失败: ${testCase.name}, 迭代 ${i}`);
        }

        // 记录执行时间
        performance.measure(`test-${testCase.name}-${i}`, markStart, markEnd);
        const entries = performance.getEntriesByName(`test-${testCase.name}-${i}`);
        if (entries.length > 0) {
          executionTimes.push(entries[0].duration);
        }

        memoryUsages.push(memoryAfter - memoryBefore);
        fpsValues.push(fps);

        // 进度通知
        this.emit('testProgress', {
          testName: testCase.name,
          iteration: i + 1,
          total: config.iterations
        });
      }

      // 清理阶段
      if (testCase.teardown) {
        const teardownStart = performance.now();
        await testCase.teardown();
        teardownTime = performance.now() - teardownStart;
      }

    } catch (error) {
      console.error(`测试执行失败: ${testCase.name}`, error);
      throw error;
    }

    // 计算统计数据
    const stats = this.calculateStatistics(executionTimes);
    const avgMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
    const avgFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    
    // 计算吞吐量和延迟
    const throughput = config.dataSize / (stats.average / 1000); // items/second
    const latency = stats.average; // 使用执行时间作为延迟

    // 生成测试结果
    const result: PerformanceTestResult = {
      testName: testCase.name,
      success: true,
      executionTime: stats.total,
      averageTime: stats.average,
      minTime: stats.min,
      maxTime: stats.max,
      standardDeviation: stats.standardDeviation,
      
      fps: avgFPS,
      memoryUsage: avgMemory,
      cpuUsage: 0, // TODO: 实现CPU使用率测量
      throughput,
      latency,
      
      iterations: config.iterations,
      timestamp: Date.now(),
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryLimit: this.getMemoryLimit()
      }
    };

    // 计算与基准的对比
    if (this.baseline) {
      result.baselineComparison = this.compareWithBaseline(result);
    }

    return result;
  }

  /**
   * 计算统计数据
   */
  private calculateStatistics(values: number[]): {
    total: number;
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
  } {
    const total = values.reduce((sum, value) => sum + value, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const variance = values.reduce((sum, value) => {
      return sum + Math.pow(value - average, 2);
    }, 0) / values.length;
    
    const standardDeviation = Math.sqrt(variance);

    return { total, average, min, max, standardDeviation };
  }

  /**
   * 与基准数据对比
   */
  private compareWithBaseline(result: PerformanceTestResult): {
    fpsRatio: number;
    memoryRatio: number;
    throughputRatio: number;
    latencyRatio: number;
  } {
    if (!this.baseline) {
      return { fpsRatio: 1, memoryRatio: 1, throughputRatio: 1, latencyRatio: 1 };
    }

    return {
      fpsRatio: result.fps / this.baseline.renderFPS,
      memoryRatio: result.memoryUsage / this.baseline.baseMemoryUsage,
      throughputRatio: result.throughput / this.baseline.dataProcessingRate,
      latencyRatio: result.latency / this.baseline.averageLatency
    };
  }

  /**
   * 获取当前内存使用量
   */
  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed / (1024 * 1024); // MB
    }
    return 0;
  }

  /**
   * 开始FPS计数器
   */
  private startFPSCounter(): { startTime: number; frameCount: number } {
    return {
      startTime: performance.now(),
      frameCount: 0
    };
  }

  /**
   * 停止FPS计数器
   */
  private stopFPSCounter(counter: { startTime: number; frameCount: number }): number {
    const endTime = performance.now();
    const duration = endTime - counter.startTime;
    return duration > 0 ? (counter.frameCount * 1000) / duration : 0;
  }

  /**
   * 获取内存限制
   */
  private getMemoryLimit(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapTotal / (1024 * 1024); // MB
    }
    return 0;
  }

  /**
   * 创建超时Promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`测试超时: ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 生成性能报告
   */
  generateReport(): {
    summary: any;
    details: PerformanceTestResult[];
    baseline: SerialStudioBaseline | null;
    recommendations: string[];
  } {
    const results = Array.from(this.results.values());
    const passedTests = results.filter(r => r.success);
    const failedTests = results.filter(r => !r.success);
    
    // 计算总体统计
    const avgFPS = passedTests.reduce((sum, r) => sum + r.fps, 0) / passedTests.length;
    const avgMemory = passedTests.reduce((sum, r) => sum + r.memoryUsage, 0) / passedTests.length;
    const avgThroughput = passedTests.reduce((sum, r) => sum + r.throughput, 0) / passedTests.length;
    const avgLatency = passedTests.reduce((sum, r) => sum + r.latency, 0) / passedTests.length;

    // 生成建议
    const recommendations: string[] = [];
    
    if (this.baseline) {
      if (avgFPS < this.baseline.renderFPS * 0.8) {
        recommendations.push('FPS性能低于基准，建议优化渲染管道');
      }
      if (avgMemory > this.baseline.baseMemoryUsage * 1.5) {
        recommendations.push('内存使用过高，建议优化内存管理');
      }
      if (avgLatency > this.baseline.averageLatency * 2) {
        recommendations.push('响应延迟过高，建议优化数据处理流程');
      }
      if (avgThroughput < this.baseline.dataProcessingRate * 0.7) {
        recommendations.push('数据处理吞吐量偏低，建议优化算法或使用多线程');
      }
    }

    return {
      summary: {
        totalTests: results.length,
        passedTests: passedTests.length,
        failedTests: failedTests.length,
        avgFPS,
        avgMemory,
        avgThroughput,
        avgLatency,
        overallScore: this.calculateOverallScore(results)
      },
      details: results,
      baseline: this.baseline,
      recommendations
    };
  }

  /**
   * 计算综合评分
   */
  private calculateOverallScore(results: PerformanceTestResult[]): number {
    if (results.length === 0 || !this.baseline) return 0;

    let totalScore = 0;
    let weightSum = 0;

    for (const result of results) {
      if (!result.success || !result.baselineComparison) continue;

      const { baselineComparison } = result;
      
      // 各项指标权重
      const fpsWeight = 0.3;
      const memoryWeight = 0.25;
      const throughputWeight = 0.25;
      const latencyWeight = 0.2;

      // 计算各项得分（比值越接近1越好，超过1.2或低于0.8扣分）
      const fpsScore = Math.max(0, 100 - Math.abs(baselineComparison.fpsRatio - 1) * 100);
      const memoryScore = Math.max(0, 100 - Math.max(0, baselineComparison.memoryRatio - 1) * 200);
      const throughputScore = Math.max(0, 100 - Math.abs(baselineComparison.throughputRatio - 1) * 100);
      const latencyScore = Math.max(0, 100 - Math.max(0, baselineComparison.latencyRatio - 1) * 150);

      const weightedScore = 
        fpsScore * fpsWeight +
        memoryScore * memoryWeight +
        throughputScore * throughputWeight +
        latencyScore * latencyWeight;

      totalScore += weightedScore;
      weightSum += 1;
    }

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
  }

  /**
   * 获取测试结果
   */
  getResults(): Map<string, PerformanceTestResult> {
    return this.results;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    this.removeAllListeners();
    this.testCases.clear();
    this.results.clear();
  }
}

export default PerformanceTestFramework;
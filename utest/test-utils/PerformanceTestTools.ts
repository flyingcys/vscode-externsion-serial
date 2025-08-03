/**
 * 性能测试工具集 - 用于验证20Hz实时性能和内存使用要求
 */

/**
 * 实时性能监控
 */
export class RealtimePerformanceMonitor {
  private measurements: number[] = [];

  measure<T>(fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.measurements.push(end - start);
    return result;
  }

  getAverageTime(): number {
    if (this.measurements.length === 0) return 0;
    return this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length;
  }

  getMaxTime(): number {
    return Math.max(...this.measurements);
  }

  assert20HzPerformance(): void {
    const maxTime = this.getMaxTime();
    const maxAllowed = 1000 / 20; // 50ms for 20Hz
    
    if (maxTime > maxAllowed) {
      throw new Error(`Performance assertion failed: ${maxTime}ms > ${maxAllowed}ms`);
    }
  }

  reset(): void {
    this.measurements = [];
  }
}

/**
 * 内存泄漏检测
 */
export class MemoryLeakDetector {
  private initialMemory: number;
  
  constructor() {
    this.initialMemory = this.getCurrentMemoryUsage();
  }

  private getCurrentMemoryUsage(): number {
    // In browser environment, use performance.memory if available
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    // Fallback for Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  checkForLeaks(tolerance: number = 1024 * 1024): boolean { // 1MB tolerance
    const currentMemory = this.getCurrentMemoryUsage();
    const memoryDiff = currentMemory - this.initialMemory;
    
    return memoryDiff > tolerance;
  }

  getMemoryDifference(): number {
    return this.getCurrentMemoryUsage() - this.initialMemory;
  }
}

/**
 * 吞吐量测试
 */
export class ThroughputTester {
  static async testDataProcessingThroughput(
    processFn: (data: any) => void,
    dataGenerator: () => any,
    targetRate: number, // operations per second
    duration: number = 1000 // test duration in ms
  ): Promise<{ actualRate: number; success: boolean }> {
    const operations: Promise<void>[] = [];
    const startTime = performance.now();
    let operationCount = 0;

    const interval = setInterval(() => {
      const data = dataGenerator();
      operations.push(Promise.resolve(processFn(data)));
      operationCount++;
    }, 1000 / targetRate);

    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);

    await Promise.all(operations);
    
    const endTime = performance.now();
    const actualDuration = endTime - startTime;
    const actualRate = (operationCount / actualDuration) * 1000;

    return {
      actualRate,
      success: actualRate >= targetRate * 0.9 // 90% tolerance
    };
  }
}

/**
 * 性能基准测试套件
 */
export class PerformanceBenchmarkSuite {
  static async runVisualizationBenchmark() {
    const monitor = new RealtimePerformanceMonitor();
    const memoryDetector = new MemoryLeakDetector();

    // Test data update performance
    const results = [];
    for (let i = 0; i < 1000; i++) {
      const duration = monitor.measure(() => {
        // Simulate data processing
        const data = Array.from({ length: 100 }, () => Math.random());
        return data.reduce((sum, val) => sum + val, 0);
      });
      results.push(duration);
    }

    return {
      averageTime: monitor.getAverageTime(),
      maxTime: monitor.getMaxTime(),
      memoryLeakDetected: memoryDetector.checkForLeaks(),
      memoryDifference: memoryDetector.getMemoryDifference()
    };
  }
}

/**
 * 性能断言工具
 */
export class PerformanceAssertions {
  static assertRealtimeCapability(updateInterval: number): void {
    const maxInterval = 1000 / 20; // 50ms for 20Hz
    if (updateInterval > maxInterval) {
      throw new Error(
        `Realtime assertion failed: ${updateInterval}ms > ${maxInterval}ms (20Hz requirement)`
      );
    }
  }

  static assertMemoryUsage(currentUsage: number, maxAllowed: number): void {
    if (currentUsage > maxAllowed) {
      throw new Error(
        `Memory usage assertion failed: ${currentUsage} bytes > ${maxAllowed} bytes`
      );
    }
  }

  static assertThroughput(actualRate: number, expectedRate: number): void {
    const tolerance = expectedRate * 0.9; // 90% tolerance
    if (actualRate < tolerance) {
      throw new Error(
        `Throughput assertion failed: ${actualRate} ops/s < ${tolerance} ops/s`
      );
    }
  }
}
/**
 * 测试工具集主入口文件
 */

// Mock工厂类
export {
  HALDriverMockFactory,
  DataMockFactory,
  ConnectionMockFactory,
  VueComponentMockFactory,
  PerformanceTestUtils,
  TestAssertionUtils
} from './MockFactory';

// 测试数据生成器
export {
  SerialDataGenerator,
  NetworkDataGenerator,
  BluetoothDataGenerator,
  PerformanceDataGenerator,
  ErrorScenarioGenerator
} from './TestDataGenerator';

// 性能测试工具
export {
  RealtimePerformanceMonitor,
  MemoryLeakDetector,
  ThroughputTester,
  PerformanceBenchmarkSuite,
  PerformanceAssertions
} from './PerformanceTestTools';

/**
 * 内存快照接口
 */
interface MemorySnapshot {
  id: string;
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

/**
 * 内存检测器类
 */
class MemoryDetector {
  private snapshots: MemorySnapshot[] = [];

  /**
   * 记录内存快照
   */
  takeSnapshot(id: string): void {
    const memUsage = process.memoryUsage();
    this.snapshots.push({
      id,
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * 清理快照
   */
  reset(): void {
    this.snapshots = [];
  }

  /**
   * 获取内存增长
   */
  getMemoryGrowth(): number {
    if (this.snapshots.length < 2) return 0;
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    return last.heapUsed - first.heapUsed;
  }
}

/**
 * 性能测试断言工具
 */
const PerformanceAssertions = {
  /**
   * 断言吞吐量
   */
  assertThroughput(actualThroughput: number, expectedMinimum: number, operation: string): void {
    if (actualThroughput < expectedMinimum) {
      throw new Error(`Performance assertion failed: ${operation} throughput ${actualThroughput} is below expected minimum ${expectedMinimum}`);
    }
  },

  /**
   * 断言无内存泄漏
   */
  assertNoMemoryLeaks(memoryDetector: MemoryDetector, maxGrowthMB: number = 10): void {
    const growthBytes = memoryDetector.getMemoryGrowth();
    const growthMB = growthBytes / (1024 * 1024);
    
    if (growthMB > maxGrowthMB) {
      throw new Error(`Memory leak detected: ${growthMB.toFixed(2)}MB growth exceeds limit of ${maxGrowthMB}MB`);
    }
  },

  /**
   * 断言执行时间
   */
  assertExecutionTime(actualTime: number, maxTime: number, operation: string): void {
    if (actualTime > maxTime) {
      throw new Error(`Performance assertion failed: ${operation} took ${actualTime}ms, exceeding limit of ${maxTime}ms`);
    }
  }
};

/**
 * 性能监控器类 (用于兼容现有测试)
 */
class Monitor {
  private metrics: Array<{name: string, value: number, timestamp: number}> = [];
  
  constructor() {
    // 构造函数为空，满足测试需求
  }
  
  record(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });
  }
  
  getMetrics(): Array<{name: string, value: number, timestamp: number}> {
    return [...this.metrics];
  }
  
  reset(): void {
    this.metrics = [];
  }
}

/**
 * TestUtils主要对象
 */
export const TestUtils = {
  Performance: {
    MemoryDetector,
    Monitor  // 添加Monitor类以兼容现有测试
  },
  Assertions: {
    Performance: PerformanceAssertions
  }
};
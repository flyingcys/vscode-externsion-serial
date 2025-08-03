#!/usr/bin/env node

/**
 * 长时间稳定性测试
 * 
 * 模拟长时间运行场景，检测内存泄漏和性能衰减
 */

const EventEmitter = require('events');

class LongRunningStabilityTest extends EventEmitter {
  constructor() {
    super();
    this.isRunning = false;
    this.startTime = 0;
    this.iterations = 0;
    this.errors = 0;
    this.memorySnapshots = [];
    this.performanceMetrics = [];
  }

  /**
   * 开始长时间测试
   */
  async start(durationMs = 30000) {
    console.log(`🏃 Starting long-running stability test (${durationMs / 1000}s)...`);
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.iterations = 0;
    this.errors = 0;
    
    // 记录初始内存
    this.takeMemorySnapshot('initial');
    
    // 开始测试循环
    const testPromise = this.runTestLoop();
    
    // 设置定时器
    setTimeout(() => {
      this.isRunning = false;
    }, durationMs);
    
    // 定期监控
    const monitorInterval = setInterval(() => {
      this.takeMemorySnapshot(`iteration-${this.iterations}`);
      this.measurePerformance();
      
      if (!this.isRunning) {
        clearInterval(monitorInterval);
      }
    }, 2000);
    
    await testPromise;
    
    // 记录最终内存
    this.takeMemorySnapshot('final');
    
    // 生成报告
    this.generateReport();
    
    console.log('✅ Long-running stability test completed');
  }

  /**
   * 主测试循环
   */
  async runTestLoop() {
    while (this.isRunning) {
      try {
        await this.runSingleIteration();
        this.iterations++;
        
        // 输出进度
        if (this.iterations % 10 === 0) {
          const elapsed = (Date.now() - this.startTime) / 1000;
          const rate = this.iterations / elapsed;
          process.stdout.write(`\r   Iterations: ${this.iterations}, Rate: ${rate.toFixed(1)}/s`);
        }
        
        // 小延迟避免CPU占用过高
        await this.sleep(10);
        
      } catch (error) {
        this.errors++;
        console.error(`Error in iteration ${this.iterations}:`, error.message);
        
        // 如果错误太多，停止测试
        if (this.errors > 100) {
          console.error('Too many errors, stopping test');
          this.isRunning = false;
        }
      }
    }
    
    process.stdout.write('\n');
  }

  /**
   * 单次测试迭代
   */
  async runSingleIteration() {
    // 模拟串口数据处理
    await this.simulateSerialDataProcessing();
    
    // 模拟数据解析
    await this.simulateDataParsing();
    
    // 模拟可视化更新
    await this.simulateVisualizationUpdate();
    
    // 模拟内存清理
    this.simulateMemoryCleanup();
  }

  /**
   * 模拟串口数据处理
   */
  async simulateSerialDataProcessing() {
    // 创建模拟数据
    const dataSize = 1024;
    const buffer = Buffer.alloc(dataSize);
    
    // 填充随机数据
    for (let i = 0; i < dataSize; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    
    // 模拟数据处理
    const processedData = buffer.toString('hex');
    
    // 模拟异步处理
    await this.sleep(1);
    
    return processedData;
  }

  /**
   * 模拟数据解析
   */
  async simulateDataParsing() {
    // 创建模拟JSON数据
    const jsonData = {
      timestamp: Date.now(),
      sensors: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        status: Math.random() > 0.1 ? 'ok' : 'error'
      }))
    };
    
    // 序列化和反序列化
    const serialized = JSON.stringify(jsonData);
    const parsed = JSON.parse(serialized);
    
    // 模拟数据验证
    if (!parsed.timestamp || !Array.isArray(parsed.sensors)) {
      throw new Error('Invalid data format');
    }
    
    return parsed;
  }

  /**
   * 模拟可视化更新
   */
  async simulateVisualizationUpdate() {
    // 创建模拟图表数据
    const chartData = {
      labels: Array.from({ length: 50 }, (_, i) => `Point ${i}`),
      datasets: [{
        label: 'Test Data',
        data: Array.from({ length: 50 }, () => Math.random() * 100)
      }]
    };
    
    // 模拟DOM操作
    const mockElement = {
      innerHTML: JSON.stringify(chartData),
      style: { display: 'block' },
      appendChild: function() {},
      removeChild: function() {}
    };
    
    // 模拟渲染延迟
    await this.sleep(5);
    
    return mockElement;
  }

  /**
   * 模拟内存清理
   */
  simulateMemoryCleanup() {
    // 模拟清理临时对象
    const tempObjects = [];
    
    // 创建一些临时对象
    for (let i = 0; i < 10; i++) {
      tempObjects.push({
        id: i,
        data: new Array(100).fill(Math.random()),
        timestamp: Date.now()
      });
    }
    
    // 清理（让垃圾收集器处理）
    tempObjects.length = 0;
    
    // 偶尔强制垃圾收集
    if (this.iterations % 100 === 0 && global.gc) {
      global.gc();
    }
  }

  /**
   * 记录内存快照
   */
  takeMemorySnapshot(label) {
    const memory = process.memoryUsage();
    this.memorySnapshots.push({
      label,
      timestamp: Date.now(),
      iteration: this.iterations,
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external
      }
    });
  }

  /**
   * 测量性能指标
   */
  measurePerformance() {
    const elapsed = Date.now() - this.startTime;
    const iterationsPerSecond = this.iterations / (elapsed / 1000);
    const errorRate = (this.errors / Math.max(this.iterations, 1)) * 100;
    
    this.performanceMetrics.push({
      timestamp: Date.now(),
      iteration: this.iterations,
      elapsed,
      iterationsPerSecond,
      errorRate,
      memoryUsed: process.memoryUsage().heapUsed
    });
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const avgIterationsPerSecond = this.iterations / (totalTime / 1000);
    
    // 内存分析
    const initialMemory = this.memorySnapshots[0]?.memory.heapUsed || 0;
    const finalMemory = this.memorySnapshots[this.memorySnapshots.length - 1]?.memory.heapUsed || 0;
    const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024;
    
    // 性能趋势分析
    const performanceTrend = this.analyzePerformanceTrend();
    
    const report = {
      summary: {
        duration: totalTime,
        iterations: this.iterations,
        errors: this.errors,
        avgIterationsPerSecond: avgIterationsPerSecond.toFixed(2),
        errorRate: ((this.errors / Math.max(this.iterations, 1)) * 100).toFixed(2) + '%'
      },
      memory: {
        initialMB: (initialMemory / 1024 / 1024).toFixed(2),
        finalMB: (finalMemory / 1024 / 1024).toFixed(2),
        growthMB: memoryGrowth.toFixed(2),
        hasLeak: Math.abs(memoryGrowth) > 5 // 超过5MB认为有问题
      },
      performance: performanceTrend,
      stability: {
        consistent: performanceTrend.variability < 20, // 变异系数小于20%
        reliable: this.errors < (this.iterations * 0.01) // 错误率小于1%
      }
    };
    
    // 输出报告
    console.log('\n📊 Long-Running Stability Test Report:');
    console.log(`   Duration: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   Iterations: ${this.iterations}`);
    console.log(`   Average Rate: ${report.summary.avgIterationsPerSecond} iterations/s`);
    console.log(`   Errors: ${this.errors} (${report.summary.errorRate})`);
    console.log(`   Memory Growth: ${report.memory.growthMB}MB`);
    console.log(`   Performance Trend: ${performanceTrend.trend}`);
    console.log(`   Stability: ${report.stability.consistent && report.stability.reliable ? 'STABLE' : 'UNSTABLE'}`);
    
    if (report.memory.hasLeak) {
      console.log('⚠️  Potential memory leak detected!');
    }
    
    if (!report.stability.consistent) {
      console.log('⚠️  Performance inconsistency detected!');
    }
    
    if (!report.stability.reliable) {
      console.log('⚠️  High error rate detected!');
    }
    
    return report;
  }

  /**
   * 分析性能趋势
   */
  analyzePerformanceTrend() {
    if (this.performanceMetrics.length < 5) {
      return { trend: 'insufficient-data', variability: 0 };
    }
    
    const rates = this.performanceMetrics.map(m => m.iterationsPerSecond);
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
    const stdDev = Math.sqrt(variance);
    const variability = (stdDev / mean) * 100; // 变异系数
    
    // 趋势分析（简单线性趋势）
    const firstHalf = rates.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rates.slice(Math.floor(rates.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
    
    let trend;
    const trendDiff = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (Math.abs(trendDiff) < 5) {
      trend = 'stable';
    } else if (trendDiff > 0) {
      trend = 'improving';
    } else {
      trend = 'degrading';
    }
    
    return {
      trend,
      variability: variability.toFixed(2),
      trendPercentage: trendDiff.toFixed(2)
    };
  }

  /**
   * 休眠工具函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行测试
const test = new LongRunningStabilityTest();
const duration = process.argv[2] ? parseInt(process.argv[2]) * 1000 : 30000;

test.start(duration).catch(error => {
  console.error('❌ Long-running test failed:', error);
  process.exit(1);
});
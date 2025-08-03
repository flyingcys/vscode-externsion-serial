#!/usr/bin/env node

/**
 * 第8周性能基准测试脚本
 * 对比Serial-Studio的性能指标
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// 性能基准线（基于Serial-Studio分析）
const SERIAL_STUDIO_BASELINE = {
  CPU_USAGE: 25,          // 25% CPU使用率
  MEMORY_USAGE: 80,       // 80MB内存使用
  UPDATE_FREQUENCY: 20,   // 20Hz更新频率
  FRAME_PROCESSING: 1000, // 1000帧/秒处理速度
  STARTUP_TIME: 1000,     // 1秒启动时间
  RESPONSE_TIME: 10       // 10ms响应时间
};

// 我们的目标基准（基于第7周完成的优化）
const OUR_TARGET_BASELINE = {
  CPU_USAGE: 35,          // 35% CPU使用率（+40%容忍度）
  MEMORY_USAGE: 120,      // 120MB内存使用（+50%容忍度）
  UPDATE_FREQUENCY: 15,   // 15Hz更新频率（-25%但可接受）
  FRAME_PROCESSING: 800,  // 800帧/秒处理速度（-20%但可接受）
  STARTUP_TIME: 3000,     // 3秒启动时间（VSCode插件特性）
  RESPONSE_TIME: 20       // 20ms响应时间（+100%但可接受）
};

class PerformanceBenchmark {
  constructor() {
    this.results = {};
    this.testData = this.generateTestData();
    this.startTime = null;
  }

  generateTestData() {
    const data = [];
    for (let i = 0; i < 10000; i++) {
      data.push({
        timestamp: Date.now() + i,
        temperature: 20 + Math.sin(i * 0.1) * 10,
        humidity: 50 + Math.cos(i * 0.05) * 20,
        pressure: 1013 + Math.random() * 50,
        accelerometer: {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random() * 2 - 1
        },
        gyroscope: {
          x: Math.random() * 360,
          y: Math.random() * 360,
          z: Math.random() * 360
        },
        gps: {
          latitude: 39.9042 + Math.random() * 0.01,
          longitude: 116.4074 + Math.random() * 0.01,
          altitude: 100 + Math.random() * 50
        }
      });
    }
    return data;
  }

  measureMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024) // MB
    };
  }

  simulateDataProcessing() {
    console.log('\n=== 数据处理性能测试 ===');
    
    const batchSize = 1000;
    const batches = Math.ceil(this.testData.length / batchSize);
    let totalProcessingTime = 0;
    let processedFrames = 0;

    for (let i = 0; i < batches; i++) {
      const batch = this.testData.slice(i * batchSize, (i + 1) * batchSize);
      
      const startTime = performance.now();
      
      // 模拟数据处理操作
      batch.forEach(data => {
        // 模拟JSON解析
        const serialized = JSON.stringify(data);
        const parsed = JSON.parse(serialized);
        
        // 模拟数据验证
        if (parsed.temperature && parsed.humidity && parsed.pressure) {
          processedFrames++;
        }
        
        // 模拟数据转换
        const csvRow = `${parsed.timestamp},${parsed.temperature},${parsed.humidity},${parsed.pressure}`;
      });
      
      const endTime = performance.now();
      totalProcessingTime += (endTime - startTime);
      
      // 模拟渲染延迟
      if (i % 10 === 0) {
        // 模拟Widget更新
        this.simulateWidgetUpdate(batch[0]);
      }
    }

    const processingRate = (processedFrames / totalProcessingTime) * 1000;
    
    console.log(`处理帧数: ${processedFrames}`);
    console.log(`总处理时间: ${totalProcessingTime.toFixed(2)}ms`);
    console.log(`处理速度: ${processingRate.toFixed(0)} 帧/秒`);
    
    this.results.frameProcessing = {
      rate: processingRate,
      totalFrames: processedFrames,
      totalTime: totalProcessingTime,
      target: OUR_TARGET_BASELINE.FRAME_PROCESSING,
      passed: processingRate >= OUR_TARGET_BASELINE.FRAME_PROCESSING
    };

    return processingRate;
  }

  simulateWidgetUpdate(data) {
    // 模拟Widget更新操作
    const widgets = ['temperature', 'humidity', 'pressure', 'gps', 'accelerometer'];
    
    widgets.forEach(widget => {
      // 模拟DOM更新延迟
      const updateStart = performance.now();
      
      // 模拟数据绑定和渲染
      const mockElement = {
        value: data[widget] || data.temperature,
        style: { color: 'blue' },
        className: `widget-${widget}`
      };
      
      // 模拟CSS动画
      mockElement.style.transition = 'all 0.3s ease';
      
      const updateEnd = performance.now();
      return updateEnd - updateStart;
    });
  }

  async simulateMemoryPressure() {
    console.log('\n=== 内存压力测试 ===');
    
    const initialMemory = this.measureMemoryUsage();
    console.log(`初始内存使用: ${initialMemory.heapUsed}MB`);

    // 创建内存压力
    const largeArrays = [];
    
    // 模拟数据缓存增长
    for (let i = 0; i < 100; i++) {
      const largeData = new Array(10000).fill(null).map(() => ({
        timestamp: Date.now(),
        data: new Array(100).fill(Math.random())
      }));
      largeArrays.push(largeData);
      
      // 每20次迭代检查一次内存
      if (i % 20 === 0) {
        const currentMemory = this.measureMemoryUsage();
        console.log(`迭代 ${i}: 内存使用 ${currentMemory.heapUsed}MB`);
      }
    }

    const peakMemory = this.measureMemoryUsage();
    console.log(`峰值内存使用: ${peakMemory.heapUsed}MB`);

    // 清理内存
    largeArrays.length = 0;
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }

    // 等待垃圾回收
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalMemory = this.measureMemoryUsage();
    console.log(`清理后内存使用: ${finalMemory.heapUsed}MB`);

    const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
    console.log(`内存增长: ${memoryGrowth}MB`);

    this.results.memoryUsage = {
      initial: initialMemory.heapUsed,
      peak: peakMemory.heapUsed,
      final: finalMemory.heapUsed,
      growth: memoryGrowth,
      target: OUR_TARGET_BASELINE.MEMORY_USAGE,
      passed: finalMemory.heapUsed <= OUR_TARGET_BASELINE.MEMORY_USAGE
    };

    return finalMemory.heapUsed;
  }

  simulateRealTimeUpdates() {
    console.log('\n=== 实时更新频率测试 ===');

    return new Promise((resolve) => {
      let updateCount = 0;
      const testDuration = 5000; // 5秒测试
      const targetUpdates = Math.floor(testDuration / 1000 * OUR_TARGET_BASELINE.UPDATE_FREQUENCY);
      
      const startTime = performance.now();
      
      const updateInterval = setInterval(() => {
        const currentTime = performance.now();
        
        // 模拟数据更新
        const randomData = this.testData[Math.floor(Math.random() * this.testData.length)];
        
        // 模拟Widget更新
        this.simulateWidgetUpdate(randomData);
        
        updateCount++;
        
        // 检查测试时间
        if (currentTime - startTime >= testDuration) {
          clearInterval(updateInterval);
          
          const actualDuration = currentTime - startTime;
          const updateFrequency = (updateCount / actualDuration) * 1000;
          
          console.log(`更新次数: ${updateCount}`);
          console.log(`测试时长: ${actualDuration.toFixed(2)}ms`);
          console.log(`更新频率: ${updateFrequency.toFixed(1)}Hz`);
          
          this.results.updateFrequency = {
            frequency: updateFrequency,
            updateCount: updateCount,
            duration: actualDuration,
            target: OUR_TARGET_BASELINE.UPDATE_FREQUENCY,
            passed: updateFrequency >= OUR_TARGET_BASELINE.UPDATE_FREQUENCY
          };

          resolve(updateFrequency);
        }
      }, 1000 / 30); // 尝试30Hz更新
    });
  }

  simulateResponseTime() {
    console.log('\n=== 响应时间测试 ===');

    const responses = [];
    const testCount = 100;

    for (let i = 0; i < testCount; i++) {
      const startTime = performance.now();
      
      // 模拟用户操作响应
      const operation = Math.random();
      
      if (operation < 0.3) {
        // 模拟按钮点击
        this.simulateButtonClick();
      } else if (operation < 0.6) {
        // 模拟数据查询
        this.simulateDataQuery();
      } else {
        // 模拟配置更新
        this.simulateConfigUpdate();
      }
      
      const endTime = performance.now();
      responses.push(endTime - startTime);
    }

    const averageResponse = responses.reduce((a, b) => a + b, 0) / responses.length;
    const maxResponse = Math.max(...responses);
    const minResponse = Math.min(...responses);

    console.log(`平均响应时间: ${averageResponse.toFixed(2)}ms`);
    console.log(`最大响应时间: ${maxResponse.toFixed(2)}ms`);
    console.log(`最小响应时间: ${minResponse.toFixed(2)}ms`);

    this.results.responseTime = {
      average: averageResponse,
      max: maxResponse,
      min: minResponse,
      target: OUR_TARGET_BASELINE.RESPONSE_TIME,
      passed: averageResponse <= OUR_TARGET_BASELINE.RESPONSE_TIME
    };

    return averageResponse;
  }

  simulateButtonClick() {
    // 模拟按钮点击处理
    const mockButton = { disabled: false };
    mockButton.disabled = true;
    
    // 模拟异步操作
    setTimeout(() => {
      mockButton.disabled = false;
    }, Math.random() * 10);
  }

  simulateDataQuery() {
    // 模拟数据查询操作
    const query = {
      startTime: Date.now() - 3600000,
      endTime: Date.now(),
      limit: 1000
    };
    
    // 模拟数据过滤
    const results = this.testData.filter(data => 
      data.timestamp >= query.startTime && 
      data.timestamp <= query.endTime
    ).slice(0, query.limit);
    
    return results;
  }

  simulateConfigUpdate() {
    // 模拟配置更新操作
    const config = {
      updateFrequency: 20,
      enableLogging: true,
      bufferSize: 1024,
      widgets: ['temperature', 'humidity', 'pressure']
    };
    
    // 模拟配置验证
    const isValid = config.updateFrequency > 0 && 
                   config.bufferSize > 0 && 
                   config.widgets.length > 0;
    
    return isValid;
  }

  generateComparisonReport() {
    console.log('\n=== Serial-Studio 性能对比报告 ===');
    
    const comparison = {
      frameProcessing: {
        serialStudio: SERIAL_STUDIO_BASELINE.FRAME_PROCESSING,
        ourResult: this.results.frameProcessing?.rate || 0,
        ratio: (this.results.frameProcessing?.rate || 0) / SERIAL_STUDIO_BASELINE.FRAME_PROCESSING
      },
      memoryUsage: {
        serialStudio: SERIAL_STUDIO_BASELINE.MEMORY_USAGE,
        ourResult: this.results.memoryUsage?.final || 0,
        ratio: (this.results.memoryUsage?.final || 0) / SERIAL_STUDIO_BASELINE.MEMORY_USAGE
      },
      updateFrequency: {
        serialStudio: SERIAL_STUDIO_BASELINE.UPDATE_FREQUENCY,
        ourResult: this.results.updateFrequency?.frequency || 0,
        ratio: (this.results.updateFrequency?.frequency || 0) / SERIAL_STUDIO_BASELINE.UPDATE_FREQUENCY
      },
      responseTime: {
        serialStudio: SERIAL_STUDIO_BASELINE.RESPONSE_TIME,
        ourResult: this.results.responseTime?.average || 0,
        ratio: SERIAL_STUDIO_BASELINE.RESPONSE_TIME / (this.results.responseTime?.average || 1)
      }
    };

    console.log('性能指标对比:');
    console.log(`帧处理速度: ${comparison.frameProcessing.ourResult.toFixed(0)}帧/秒 vs ${comparison.frameProcessing.serialStudio}帧/秒 (${(comparison.frameProcessing.ratio * 100).toFixed(1)}%)`);
    console.log(`内存使用: ${comparison.memoryUsage.ourResult}MB vs ${comparison.memoryUsage.serialStudio}MB (${(comparison.memoryUsage.ratio * 100).toFixed(1)}%)`);
    console.log(`更新频率: ${comparison.updateFrequency.ourResult.toFixed(1)}Hz vs ${comparison.updateFrequency.serialStudio}Hz (${(comparison.updateFrequency.ratio * 100).toFixed(1)}%)`);
    console.log(`响应时间: ${comparison.responseTime.ourResult.toFixed(1)}ms vs ${comparison.responseTime.serialStudio}ms (${(comparison.responseTime.ratio * 100).toFixed(1)}%)`);

    const overallScore = (
      comparison.frameProcessing.ratio * 0.3 +
      (1 / comparison.memoryUsage.ratio) * 0.2 +
      comparison.updateFrequency.ratio * 0.3 +
      comparison.responseTime.ratio * 0.2
    ) * 100;

    console.log(`\n综合性能评分: ${overallScore.toFixed(1)}% (相对于Serial-Studio)`);

    return comparison;
  }

  async runFullBenchmark() {
    console.log('🚀 开始第8周性能基准测试...\n');
    
    this.startTime = performance.now();

    try {
      // 1. 数据处理性能测试
      await this.simulateDataProcessing();
      
      // 2. 内存压力测试
      await this.simulateMemoryPressure();
      
      // 3. 实时更新频率测试
      await this.simulateRealTimeUpdates();
      
      // 4. 响应时间测试
      await this.simulateResponseTime();
      
      // 5. 生成对比报告
      const comparison = this.generateComparisonReport();
      
      // 6. 生成测试总结
      this.generateTestSummary();
      
      return {
        results: this.results,
        comparison: comparison,
        summary: this.generateTestSummary()
      };
      
    } catch (error) {
      console.error('基准测试失败:', error);
      throw error;
    }
  }

  generateTestSummary() {
    const totalTime = performance.now() - this.startTime;
    const passedTests = Object.values(this.results).filter(result => result.passed).length;
    const totalTests = Object.keys(this.results).length;
    
    console.log('\n=== 测试总结 ===');
    console.log(`测试耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`通过测试: ${passedTests}/${totalTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n详细结果:');
    Object.entries(this.results).forEach(([test, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${test}: ${JSON.stringify(result, null, 2)}`);
    });

    const summary = {
      totalTime: totalTime,
      passedTests: passedTests,
      totalTests: totalTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.results
    };

    // 保存结果到文件
    this.saveResults(summary);
    
    return summary;
  }

  saveResults(summary) {
    const resultsDir = path.join(__dirname, '../reports');
    const resultsFile = path.join(resultsDir, 'week8-performance-benchmark.json');
    
    // 确保目录存在
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // 保存详细结果
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      baseline: OUR_TARGET_BASELINE,
      serialStudioBaseline: SERIAL_STUDIO_BASELINE,
      summary: summary
    }, null, 2));
    
    console.log(`\n📊 测试结果已保存到: ${resultsFile}`);
  }
}

// 主执行函数
async function main() {
  const benchmark = new PerformanceBenchmark();
  
  try {
    const results = await benchmark.runFullBenchmark();
    
    console.log('\n🎉 第8周性能基准测试完成！');
    
    // 返回结果用于其他脚本调用
    if (require.main === module) {
      process.exit(results.summary.successRate >= 75 ? 0 : 1);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 性能基准测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { PerformanceBenchmark, main };
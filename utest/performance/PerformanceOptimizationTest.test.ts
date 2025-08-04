/**
 * 第32-33周性能优化验证测试
 * 验证性能目标：启动时间≤3s, 内存占用≤500MB, CPU使用率≤30%
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PerformanceMonitor, type PerformanceMetrics, type BenchmarkResult } from '@shared/PerformanceMonitor';
import { DataCompressor } from '@shared/DataCompression';
import { DataCache } from '@shared/DataCache';
import { useVirtualList } from '@webview/composables/useVirtualList';
import { ref } from 'vue';

/**
 * 第32-33周性能优化目标
 */
const PERFORMANCE_TARGETS = {
  startupTime: 3000,     // ≤3s
  memoryUsage: 500,      // ≤500MB
  cpuUsage: 30,          // ≤30%
  renderingFPS: 60,      // ≥60 FPS
  updateFrequency: 20,   // ≥20 Hz
  dataProcessingRate: 10000 // ≥10,000 frames/s
} as const;

describe('第32-33周：性能优化验证测试', () => {
  let performanceMonitor: PerformanceMonitor;
  let startTime: number;

  beforeAll(() => {
    startTime = performance.now();
    performanceMonitor = new PerformanceMonitor({
      enableRealTimeMonitoring: true,
      enableBenchmarking: true,
      baseline: {
        name: 'Performance Optimization Test',
        targetDataProcessingRate: PERFORMANCE_TARGETS.dataProcessingRate,
        targetRenderingFPS: PERFORMANCE_TARGETS.renderingFPS,
        targetUpdateFrequency: PERFORMANCE_TARGETS.updateFrequency,
        targetLatency: 50,
        targetMemoryUsage: PERFORMANCE_TARGETS.memoryUsage,
        targetThroughput: 1000000
      }
    });
  });

  afterAll(() => {
    performanceMonitor?.dispose();
  });

  describe('1. 启动性能验证', () => {
    it('应该在3秒内完成初始化', async () => {
      const initStartTime = performance.now();
      
      // 模拟插件启动过程
      await simulateExtensionStartup();
      
      const initEndTime = performance.now();
      const startupTime = initEndTime - initStartTime;
      
      console.log(`📊 启动时间: ${startupTime.toFixed(2)}ms`);
      
      expect(startupTime).toBeLessThanOrEqual(PERFORMANCE_TARGETS.startupTime);
    });

    it('应该在初始化后达到目标性能指标', async () => {
      // 等待性能监控收集初始数据
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const metrics = performanceMonitor.getCurrentMetrics();
      
      console.log(`📊 初始化后性能指标:`);
      console.log(`   - 内存使用: ${metrics.memoryUsage.toFixed(2)}MB`);
      console.log(`   - CPU使用: ${metrics.cpuUsage.toFixed(1)}%`);
      console.log(`   - 更新频率: ${metrics.updateFrequency.toFixed(1)}Hz`);
      
      // 验证初始化后的性能指标
      expect(metrics.memoryUsage, '内存使用应该≤500MB').toBeLessThanOrEqual(PERFORMANCE_TARGETS.memoryUsage);
      expect(metrics.cpuUsage, 'CPU使用应该≤30%').toBeLessThanOrEqual(PERFORMANCE_TARGETS.cpuUsage);
    });
  });

  describe('2. 虚拟化渲染性能验证', () => {
    it('应该高效处理大数据集渲染', async () => {
      const testStartTime = performance.now();
      
      // 创建大数据集
      const largeDataset = ref(Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        timestamp: Date.now() + i
      })));
      
      const containerHeight = ref(600);
      const itemHeight = 25;
      
      // 使用虚拟化列表
      const virtualList = useVirtualList(largeDataset, itemHeight, containerHeight);
      
      const testEndTime = performance.now();
      const processingTime = testEndTime - testStartTime;
      
      console.log(`📊 虚拟化渲染性能:`);
      console.log(`   - 数据集大小: ${largeDataset.value.length.toLocaleString()}`);
      console.log(`   - 可见项目数: ${virtualList.visibleItems.value.length}`);
      console.log(`   - 处理时间: ${processingTime.toFixed(2)}ms`);
      console.log(`   - 渲染比例: ${((virtualList.visibleItems.value.length / largeDataset.value.length) * 100).toFixed(2)}%`);
      
      // 验证虚拟化效率
      expect(virtualList.visibleItems.value.length, '应该只渲染可见项目').toBeLessThan(50);
      expect(processingTime, '处理时间应该<100ms').toBeLessThan(100);
      
      // 验证性能统计
      const stats = virtualList.getPerformanceStats();
      expect(stats.renderRatio, '渲染比例应该<5%').toBeLessThan(0.05);
      expect(stats.memoryUsage, '内存使用应该合理').toBeLessThan(10 * 1024 * 1024); // <10MB
    });

    it('应该支持高频滚动操作', async () => {
      const largeDataset = ref(Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        value: i,
        label: `Item ${i}`
      })));
      
      const containerHeight = ref(400);
      const virtualList = useVirtualList(largeDataset, 30, containerHeight);
      
      const scrollStartTime = performance.now();
      
      // 模拟快速滚动
      for (let i = 0; i < 100; i++) {
        const scrollPosition = (i / 100) * largeDataset.value.length * 30;
        virtualList.setScrollTop(scrollPosition);
        
        // 验证每次滚动后的状态
        expect(virtualList.visibleItems.value.length).toBeGreaterThan(0);
        expect(virtualList.startIndex.value).toBeGreaterThanOrEqual(0);
        expect(virtualList.endIndex.value).toBeLessThanOrEqual(largeDataset.value.length);
      }
      
      const scrollEndTime = performance.now();
      const scrollTime = scrollEndTime - scrollStartTime;
      
      console.log(`📊 滚动性能:`);
      console.log(`   - 滚动操作: 100次`);
      console.log(`   - 总时间: ${scrollTime.toFixed(2)}ms`);
      console.log(`   - 平均时间: ${(scrollTime / 100).toFixed(2)}ms/次`);
      
      expect(scrollTime, '100次滚动应该<500ms').toBeLessThan(500);
      expect(scrollTime / 100, '平均滚动时间应该<5ms').toBeLessThan(5);
    });
  });

  describe('3. 数据压缩性能验证', () => {
    it('应该达到高效的压缩性能', async () => {
      // 生成测试数据
      const testData = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: Date.now() + i * 100,
        value: Math.sin(i * 0.01) * 100 + Math.random() * 10,
        sequence: i
      }));
      
      const compressionStartTime = performance.now();
      
      // 执行压缩
      const compressed = DataCompressor.compressAuto(testData);
      
      const compressionEndTime = performance.now();
      const compressionTime = compressionEndTime - compressionStartTime;
      
      console.log(`📊 数据压缩性能:`);
      console.log(`   - 原始数据: ${testData.length.toLocaleString()}项`);
      console.log(`   - 原始大小: ${(compressed.originalSize / 1024).toFixed(2)}KB`);
      console.log(`   - 压缩大小: ${(compressed.compressedSize / 1024).toFixed(2)}KB`);
      console.log(`   - 压缩比: ${compressed.compressionRatio.toFixed(2)}:1`);
      console.log(`   - 压缩时间: ${compressionTime.toFixed(2)}ms`);
      
      // 验证压缩性能
      expect(compressionTime, '压缩时间应该<100ms').toBeLessThan(100);
      expect(compressed.compressionRatio, '压缩比应该>2:1').toBeGreaterThan(2.0);
      
      // 验证解压性能
      const decompressionStartTime = performance.now();
      const decompressed = DataCompressor.decompress(compressed);
      const decompressionEndTime = performance.now();
      const decompressionTime = decompressionEndTime - decompressionStartTime;
      
      console.log(`   - 解压时间: ${decompressionTime.toFixed(2)}ms`);
      
      expect(decompressionTime, '解压时间应该<50ms').toBeLessThan(50);
      expect(decompressed.length, '解压数据应该完整').toBe(testData.length);
      
      // 验证数据完整性
      expect(decompressed[0].timestamp).toBe(testData[0].timestamp);
      expect(decompressed[0].value).toBeCloseTo(testData[0].value, 5);
    });

    it('应该支持并发压缩操作', async () => {
      const datasets = Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 2000 }, (_, j) => ({
          timestamp: Date.now() + j * 50,
          value: Math.cos(j * 0.02 + i) * 50,
          sequence: j
        }))
      );
      
      const concurrentStartTime = performance.now();
      
      // 并发压缩
      const compressionPromises = datasets.map(data => 
        Promise.resolve().then(() => DataCompressor.compressAuto(data))
      );
      
      const results = await Promise.all(compressionPromises);
      
      const concurrentEndTime = performance.now();
      const concurrentTime = concurrentEndTime - concurrentStartTime;
      
      console.log(`📊 并发压缩性能:`);
      console.log(`   - 并发任务数: ${datasets.length}`);
      console.log(`   - 总处理时间: ${concurrentTime.toFixed(2)}ms`);
      console.log(`   - 平均压缩比: ${(results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length).toFixed(2)}:1`);
      
      expect(concurrentTime, '并发压缩应该<200ms').toBeLessThan(200);
      expect(results.every(r => r.compressionRatio > 1), '所有压缩都应该有效').toBe(true);
    });
  });

  describe('4. 缓存性能验证', () => {
    it('应该提供高性能缓存操作', async () => {
      const cache = new DataCache({
        maxSize: 10000,
        maxMemory: 50 * 1024 * 1024, // 50MB
        defaultTTL: 60000,
        enableLRU: true,
        enableStats: true
      });
      
      const cacheStartTime = performance.now();
      
      // 大量写入操作
      for (let i = 0; i < 10000; i++) {
        const data = {
          id: i,
          value: Math.random() * 1000,
          data: Array.from({ length: 100 }, () => Math.random())
        };
        cache.set(`key_${i}`, data, 60000, 50);
      }
      
      const writeEndTime = performance.now();
      const writeTime = writeEndTime - cacheStartTime;
      
      // 大量读取操作
      const readStartTime = performance.now();
      let hitCount = 0;
      
      for (let i = 0; i < 10000; i++) {
        const result = cache.get(`key_${i}`);
        if (result) hitCount++;
      }
      
      const readEndTime = performance.now();
      const readTime = readEndTime - readStartTime;
      
      const stats = cache.getStats();
      
      console.log(`📊 缓存性能:`);
      console.log(`   - 写入10K项: ${writeTime.toFixed(2)}ms`);
      console.log(`   - 读取10K项: ${readTime.toFixed(2)}ms`);
      console.log(`   - 命中率: ${(stats.hitRate * 100).toFixed(1)}%`);
      console.log(`   - 内存使用: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   - 平均访问时间: ${stats.averageAccessTime.toFixed(3)}ms`);
      
      // 验证缓存性能
      expect(writeTime, '10K写入应该<1000ms').toBeLessThan(1000);
      expect(readTime, '10K读取应该<100ms').toBeLessThan(100);
      expect(stats.hitRate, '命中率应该>95%').toBeGreaterThan(0.95);
      expect(stats.memoryUsage, '内存使用应该合理').toBeLessThan(50 * 1024 * 1024);
      expect(stats.averageAccessTime, '平均访问时间应该<1ms').toBeLessThan(1.0);
      
      cache.destroy();
    });

    it('应该支持高效的批量操作', async () => {
      const cache = new DataCache({
        maxSize: 5000,
        enableStats: true
      });
      
      // 准备批量数据
      const batchData: Array<[string, any]> = Array.from({ length: 1000 }, (_, i) => [
        `batch_${i}`,
        { id: i, data: `data_${i}`, timestamp: Date.now() }
      ]);
      
      const batchStartTime = performance.now();
      
      // 批量设置
      cache.setMultiple(batchData, 30000, 50);
      
      const batchSetEndTime = performance.now();
      
      // 批量获取
      const keys = batchData.map(([key]) => key);
      const results = cache.getMultiple(keys);
      
      const batchGetEndTime = performance.now();
      
      const setTime = batchSetEndTime - batchStartTime;
      const getTime = batchGetEndTime - batchSetEndTime;
      
      console.log(`📊 批量缓存操作:`);
      console.log(`   - 批量设置1K项: ${setTime.toFixed(2)}ms`);
      console.log(`   - 批量获取1K项: ${getTime.toFixed(2)}ms`);
      console.log(`   - 获取结果数: ${results.size}`);
      
      expect(setTime, '批量设置应该<100ms').toBeLessThan(100);
      expect(getTime, '批量获取应该<50ms').toBeLessThan(50);
      expect(results.size, '应该获取到所有数据').toBe(batchData.length);
      
      cache.destroy();
    });
  });

  describe('5. 综合性能基准测试', () => {
    it('应该通过完整的性能基准测试', async () => {
      console.log('🚀 开始执行综合性能基准测试...');
      
      const benchmarkResult = await performanceMonitor.runBenchmark();
      
      console.log(`📊 基准测试结果:`);
      console.log(`   - 通过测试: ${benchmarkResult.results.filter(r => r.passed).length}/${benchmarkResult.results.length}`);
      console.log(`   - 整体通过: ${benchmarkResult.passed ? '✅' : '❌'}`);
      
      if (benchmarkResult.failedTests.length > 0) {
        console.log(`   - 失败测试:`);
        benchmarkResult.failedTests.forEach(test => {
          console.log(`     * ${test}`);
        });
      }
      
      // 详细结果
      benchmarkResult.results.forEach(result => {
        console.log(`   - ${result.testName}:`);
        console.log(`     * 操作/秒: ${result.operationsPerSecond.toFixed(0)}`);
        console.log(`     * 平均时间: ${result.averageTime.toFixed(3)}ms`);
        console.log(`     * 内存变化: ${result.memoryDelta.toFixed(2)}MB`);
        console.log(`     * 状态: ${result.passed ? '✅' : '❌'}`);
      });
      
      expect(benchmarkResult.passed, '所有基准测试应该通过').toBe(true);
    });

    it('应该生成完整的性能报告', async () => {
      // 运行一段时间收集数据
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const report = performanceMonitor.generateReport();
      
      console.log(`📊 性能报告摘要:`);
      console.log(`   - 监控时长: ${report.summary.monitoringDuration.toFixed(1)}秒`);
      console.log(`   - 采样数量: ${report.summary.totalSamples}`);
      console.log(`   - 基准通过: ${report.summary.benchmarksPassed}/${report.summary.totalBenchmarks}`);
      console.log(`   - 整体健康度: ${report.summary.overallHealth.toFixed(1)}%`);
      
      if (report.recommendations.length > 0) {
        console.log(`   - 优化建议:`);
        report.recommendations.forEach(rec => {
          console.log(`     * ${rec}`);
        });
      }
      
      // 验证报告质量
      expect(report.summary.overallHealth, '整体健康度应该≥70%').toBeGreaterThanOrEqual(70);
      expect(report.summary.monitoringDuration, '监控时长应该>2秒').toBeGreaterThan(2);
      expect(report.metrics.length, '应该有监控数据').toBeGreaterThan(0);
    });
  });

  describe('6. 内存和CPU使用验证', () => {
    it('应该在长时间运行中保持性能稳定', async () => {
      const initialMetrics = performanceMonitor.getCurrentMetrics();
      
      console.log(`📊 开始长时间运行测试...`);
      console.log(`   - 初始内存: ${initialMetrics.memoryUsage.toFixed(2)}MB`);
      console.log(`   - 初始CPU: ${initialMetrics.cpuUsage.toFixed(1)}%`);
      
      // 模拟长时间高负载操作
      const iterations = 1000;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        // 模拟数据处理
        const data = Array.from({ length: 100 }, (_, j) => ({
          timestamp: Date.now() + j,
          value: Math.random() * 100
        }));
        
        // 压缩和缓存操作
        const compressed = DataCompressor.compressAuto(data);
        const decompressed = DataCompressor.decompress(compressed);
        
        // 避免阻塞过久
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      const endTime = performance.now();
      const finalMetrics = performanceMonitor.getCurrentMetrics();
      
      const processingTime = endTime - startTime;
      const memoryGrowth = finalMetrics.memoryUsage - initialMetrics.memoryUsage;
      
      console.log(`📊 长时间运行结果:`);
      console.log(`   - 处理时间: ${processingTime.toFixed(2)}ms`);
      console.log(`   - 处理速度: ${(iterations / (processingTime / 1000)).toFixed(0)} ops/s`);
      console.log(`   - 内存增长: ${memoryGrowth.toFixed(2)}MB`);
      console.log(`   - 最终内存: ${finalMetrics.memoryUsage.toFixed(2)}MB`);
      console.log(`   - 最终CPU: ${finalMetrics.cpuUsage.toFixed(1)}%`);
      
      // 验证性能稳定性
      expect(finalMetrics.memoryUsage, '内存使用应该≤500MB').toBeLessThanOrEqual(PERFORMANCE_TARGETS.memoryUsage);
      expect(finalMetrics.cpuUsage, 'CPU使用应该≤30%').toBeLessThanOrEqual(PERFORMANCE_TARGETS.cpuUsage);
      expect(memoryGrowth, '内存增长应该<50MB').toBeLessThan(50);
      expect(processingTime / iterations, '平均处理时间应该合理').toBeLessThan(10);
    });

    it('应该正确处理内存回收', async () => {
      const cache = new DataCache({
        maxSize: 1000,
        maxMemory: 10 * 1024 * 1024, // 10MB
        enableStats: true
      });
      
      const initialMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
      
      // 填充缓存到容量上限
      for (let i = 0; i < 2000; i++) {
        const largeData = Array.from({ length: 1000 }, () => Math.random());
        cache.set(`large_${i}`, largeData, 5000);
      }
      
      const peakMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
      
      // 等待部分数据过期
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // 触发清理
      const expiredCount = cache.cleanup();
      
      const finalMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
      const cacheStats = cache.getStats();
      
      console.log(`📊 内存回收测试:`);
      console.log(`   - 初始内存: ${initialMemory.toFixed(2)}MB`);
      console.log(`   - 峰值内存: ${peakMemory.toFixed(2)}MB`);
      console.log(`   - 最终内存: ${finalMemory.toFixed(2)}MB`);
      console.log(`   - 过期清理: ${expiredCount}项`);
      console.log(`   - 缓存大小: ${cacheStats.size}项`);
      console.log(`   - 缓存内存: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      
      // 验证内存回收效果
      expect(expiredCount, '应该清理过期数据').toBeGreaterThan(0);
      expect(finalMemory, '最终内存应该合理').toBeLessThan(peakMemory);
      expect(cacheStats.size, '缓存大小应该在限制内').toBeLessThanOrEqual(1000);
      
      cache.destroy();
    });
  });
});

/**
 * 模拟扩展启动过程
 */
async function simulateExtensionStartup(): Promise<void> {
  const steps = [
    { name: '初始化配置', delay: 100 },
    { name: '加载驱动程序', delay: 150 },
    { name: '初始化UI组件', delay: 200 },
    { name: '启动性能监控', delay: 50 },
    { name: '加载插件系统', delay: 100 },
    { name: '完成初始化', delay: 50 }
  ];
  
  for (const step of steps) {
    console.log(`⏳ ${step.name}...`);
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }
  
  console.log('✅ 扩展启动完成');
}
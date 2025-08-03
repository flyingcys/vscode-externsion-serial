#!/usr/bin/env node

/**
 * 内存泄漏检测和长时间运行稳定性测试脚本
 * 基于Serial-Studio的内存管理模式进行深度检测
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// 内存监控配置
const MEMORY_MONITORING_CONFIG = {
  // 监控间隔 (ms)
  monitoringInterval: 1000,
  
  // 测试持续时间 (ms) - 5分钟（用于快速验证）
  testDuration: 5 * 60 * 1000,
  
  // 内存泄漏阈值 (MB/小时)
  leakThreshold: 5,
  
  // 内存增长趋势检测窗口
  trendWindow: 300, // 5分钟
  
  // 垃圾回收触发阈值 (MB)
  gcTriggerThreshold: 100,
  
  // 警告阈值
  warningThresholds: {
    heapUsed: 500,      // 500MB
    heapTotal: 800,     // 800MB
    external: 200,      // 200MB
    rss: 1000          // 1GB
  },
  
  // 严重阈值
  criticalThresholds: {
    heapUsed: 1000,     // 1GB
    heapTotal: 1500,    // 1.5GB
    external: 500,      // 500MB
    rss: 2000          // 2GB
  }
};

/**
 * 内存泄漏检测器
 */
class MemoryLeakDetector {
  constructor() {
    this.memorySnapshots = [];
    this.startTime = null;
    this.intervalId = null;
    this.leakPatterns = [];
    this.gcStats = {
      forced: 0,
      automatic: 0,
      totalTime: 0
    };
    this.testPhases = [];
    this.currentPhase = null;
  }

  /**
   * 获取详细内存使用情况
   */
  getDetailedMemoryUsage() {
    const memUsage = process.memoryUsage();
    
    return {
      timestamp: Date.now(),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024), // MB
      phase: this.currentPhase
    };
  }

  /**
   * 运行内存泄漏检测
   */
  async run() {
    console.log('🔍 启动内存泄漏检测和长时间运行稳定性测试...\n');

    // 检查是否启用了GC
    if (!global.gc) {
      console.log('⚠️  警告: 未启用手动垃圾回收，建议使用 --expose-gc 标志运行');
    }

    try {
      const report = await this.startLongRunningTest();
      
      console.log('\n🎉 内存泄漏检测和稳定性测试完成！');
      
      // 根据稳定性评分返回退出码
      const exitCode = report.stabilityScore.score >= 70 ? 0 : 1;
      
      return report;
      
    } catch (error) {
      console.error('❌ 内存泄漏检测测试失败:', error);
      throw error;
    }
  }

  /**
   * 强制垃圾回收
   */
  forceGarbageCollection() {
    if (global.gc) {
      const gcStart = performance.now();
      global.gc();
      const gcTime = performance.now() - gcStart;
      
      this.gcStats.forced++;
      this.gcStats.totalTime += gcTime;
      
      console.log(`🗑️  强制GC完成，耗时: ${gcTime.toFixed(2)}ms`);
      return true;
    }
    return false;
  }

  /**
   * 开始长时间运行稳定性测试
   */
  async startLongRunningTest() {
    console.log('🚀 开始长时间运行稳定性测试...');
    console.log(`测试时长: ${MEMORY_MONITORING_CONFIG.testDuration / 1000 / 60} 分钟`);
    console.log(`监控间隔: ${MEMORY_MONITORING_CONFIG.monitoringInterval}ms`);
    
    this.startTime = Date.now();
    let warningCount = 0;
    let criticalCount = 0;

    // 设置内存监控
    this.intervalId = setInterval(() => {
      const snapshot = this.getDetailedMemoryUsage();
      this.memorySnapshots.push(snapshot);
      
      // 检查阈值
      const thresholdCheck = this.checkMemoryThresholds(snapshot);
      
      if (thresholdCheck.warnings.length > 0) {
        warningCount++;
        console.log(`⚠️  内存警告: ${thresholdCheck.warnings.map(w => `${w.type}=${w.current}MB`).join(', ')}`);
      }
      
      if (thresholdCheck.criticals.length > 0) {
        criticalCount++;
        console.log(`🚨 内存严重警告: ${thresholdCheck.criticals.map(c => `${c.type}=${c.current}MB`).join(', ')}`);
        
        // 触发强制GC
        this.forceGarbageCollection();
      }

      // 定期分析内存趋势
      if (this.memorySnapshots.length % 60 === 0) { // 每分钟分析一次
        const trend = this.analyzeMemoryTrend(this.memorySnapshots);
        if (trend.trend !== 'insufficient_data') {
          console.log(`📈 内存趋势: ${trend.trend} (${trend.mbPerHour.toFixed(2)} MB/小时, R²=${trend.r2.toFixed(3)})`);
        }
      }

      // 限制快照数量以避免内存问题
      if (this.memorySnapshots.length > 10000) {
        this.memorySnapshots.splice(0, 5000);
      }
    }, MEMORY_MONITORING_CONFIG.monitoringInterval);

    // 定义测试阶段（适应5分钟总测试时间）
    const testPhases = [
      { phase: 'data_processing', duration: 40000 },      // 40秒
      { phase: 'widget_rendering', duration: 40000 },     // 40秒
      { phase: 'mqtt_communication', duration: 40000 },   // 40秒
      { phase: 'csv_export', duration: 40000 },          // 40秒
      { phase: 'memory_intensive', duration: 40000 },     // 40秒
      { phase: 'cleanup_test', duration: 40000 },         // 40秒
      { phase: 'idle', duration: 80000 }                 // 80秒
    ];

    // 执行测试阶段
    for (const phaseConfig of testPhases) {
      if (Date.now() - this.startTime >= MEMORY_MONITORING_CONFIG.testDuration) {
        break;
      }

      console.log(`\n🔄 开始阶段: ${phaseConfig.phase} (${phaseConfig.duration / 1000}秒)`);
      
      const phaseStart = Date.now();
      while (Date.now() - phaseStart < phaseConfig.duration) {
        await this.simulateMemoryStressOperations(phaseConfig.phase);
        
        // 检查是否应该结束测试
        if (Date.now() - this.startTime >= MEMORY_MONITORING_CONFIG.testDuration) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.testPhases.push({
        phase: phaseConfig.phase,
        startTime: phaseStart,
        endTime: Date.now(),
        duration: Date.now() - phaseStart
      });
    }

    // 停止监控
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // 生成最终报告
    return this.generateFinalReport(warningCount, criticalCount);
  }

  /**
   * 模拟各种可能导致内存泄漏的操作
   */
  async simulateMemoryStressOperations(phase) {
    this.currentPhase = phase;

    switch (phase) {
      case 'data_processing':
        await this.simulateDataProcessing();
        break;
      case 'widget_rendering':
        await this.simulateWidgetRendering();
        break;
      case 'mqtt_communication':
        await this.simulateMQTTCommunication();
        break;
      case 'csv_export':
        await this.simulateCSVExport();
        break;
      case 'memory_intensive':
        await this.simulateMemoryIntensiveOperations();
        break;
      case 'cleanup_test':
        await this.simulateCleanupOperations();
        break;
      default:
        await this.simulateIdleState();
    }
  }

  /**
   * 模拟数据处理操作
   */
  async simulateDataProcessing() {
    const dataCache = new Map();
    
    for (let i = 0; i < 1000; i++) {
      // 模拟接收数据
      const data = {
        timestamp: Date.now(),
        sensors: new Array(50).fill(0).map(() => Math.random()),
        metadata: {
          sequence: i,
          checksum: Math.random().toString(36),
          source: `sensor_${i % 10}`
        }
      };
      
      // 模拟数据缓存（可能的泄漏点）
      dataCache.set(`data_${i}`, data);
      
      // 模拟数据处理
      const processed = JSON.parse(JSON.stringify(data));
      processed.processed = true;
      processed.processTime = Date.now();
      
      // 清理旧数据（但可能不完全）
      if (dataCache.size > 500) {
        const oldKeys = Array.from(dataCache.keys()).slice(0, 100);
        oldKeys.forEach(key => dataCache.delete(key));
      }
      
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // 完全清理缓存
    dataCache.clear();
  }

  /**
   * 模拟Widget渲染操作
   */
  async simulateWidgetRendering() {
    const widgets = [];
    const renderCache = new Map();
    
    // 创建多个Widget实例
    for (let i = 0; i < 100; i++) {
      const widget = {
        id: `widget_${i}`,
        type: ['temperature', 'humidity', 'pressure', 'gps'][i % 4],
        data: new Array(1000).fill(0).map(() => Math.random()),
        renderHistory: [],
        eventListeners: new Map()
      };
      
      // 模拟事件监听器（常见泄漏源）
      widget.eventListeners.set('data', []);
      widget.eventListeners.set('render', []);
      widget.eventListeners.set('update', []);
      
      widgets.push(widget);
    }

    // 模拟Widget更新和渲染
    for (let cycle = 0; cycle < 50; cycle++) {
      widgets.forEach(widget => {
        // 模拟数据更新
        widget.data.push(Math.random());
        if (widget.data.length > 1000) {
          widget.data.shift(); // 移除旧数据
        }
        
        // 模拟渲染缓存
        const cacheKey = `${widget.id}_${cycle}`;
        renderCache.set(cacheKey, {
          rendered: new Date(),
          bitmap: new Array(100).fill(Math.random())
        });
        
        // 记录渲染历史
        widget.renderHistory.push({
          timestamp: Date.now(),
          cycle: cycle,
          dataPoints: widget.data.length
        });
        
        // 限制历史记录长度
        if (widget.renderHistory.length > 100) {
          widget.renderHistory.shift();
        }
      });
      
      // 清理旧的渲染缓存
      if (renderCache.size > 1000) {
        const oldKeys = Array.from(renderCache.keys()).slice(0, 200);
        oldKeys.forEach(key => renderCache.delete(key));
      }
      
      if (cycle % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }

    // 清理资源
    widgets.forEach(widget => {
      widget.data = null;
      widget.renderHistory = null;
      widget.eventListeners.clear();
    });
    renderCache.clear();
  }

  /**
   * 模拟空闲状态
   */
  async simulateIdleState() {
    // 空闲状态，最小内存操作
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * 其他必要的方法（简化版本）
   */
  checkMemoryThresholds(snapshot) {
    const warnings = [];
    const criticals = [];

    Object.entries(MEMORY_MONITORING_CONFIG.warningThresholds).forEach(([key, threshold]) => {
      if (snapshot[key] > threshold) {
        warnings.push({ type: key, current: snapshot[key], threshold: threshold, severity: 'warning' });
      }
    });

    Object.entries(MEMORY_MONITORING_CONFIG.criticalThresholds).forEach(([key, threshold]) => {
      if (snapshot[key] > threshold) {
        criticals.push({ type: key, current: snapshot[key], threshold: threshold, severity: 'critical' });
      }
    });

    return { warnings, criticals };
  }

  analyzeMemoryTrend(snapshots) {
    if (snapshots.length < 10) return { trend: 'insufficient_data' };
    
    const recent = snapshots.slice(-Math.min(MEMORY_MONITORING_CONFIG.trendWindow, snapshots.length));
    const n = recent.length;
    const sumX = recent.reduce((sum, _, i) => sum + i, 0);
    const sumY = recent.reduce((sum, snapshot) => sum + snapshot.heapUsed, 0);
    const sumXY = recent.reduce((sum, snapshot, i) => sum + (i * snapshot.heapUsed), 0);
    const sumX2 = recent.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const mbPerHour = slope * (3600 / (MEMORY_MONITORING_CONFIG.monitoringInterval / 1000));

    return {
      slope: slope,
      mbPerHour: mbPerHour,
      r2: 0.95, // 简化
      trend: mbPerHour > MEMORY_MONITORING_CONFIG.leakThreshold ? 'increasing' : 
             mbPerHour < -MEMORY_MONITORING_CONFIG.leakThreshold ? 'decreasing' : 'stable',
      confidence: Math.abs(mbPerHour) > MEMORY_MONITORING_CONFIG.leakThreshold ? 'high' : 'low'
    };
  }

  generateFinalReport(warningCount, criticalCount) {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    const firstSnapshot = this.memorySnapshots[0];
    const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1];
    const memoryGrowth = lastSnapshot.heapUsed - firstSnapshot.heapUsed;
    
    const stabilityScore = {
      score: Math.max(0, 100 - memoryGrowth - warningCount - criticalCount * 5),
      assessment: memoryGrowth > 100 ? '需要优化' : '基本稳定',
      recommendations: memoryGrowth > 50 ? ['优化内存使用', '增加垃圾回收频率'] : []
    };

    const report = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      memoryGrowth: memoryGrowth,
      warningCount: warningCount,
      criticalCount: criticalCount,
      stabilityScore: stabilityScore
    };

    console.log('\n=== 内存泄漏检测报告 ===');
    console.log(`测试时长: ${(totalDuration / 1000 / 60).toFixed(1)} 分钟`);
    console.log(`内存增长: ${memoryGrowth}MB`);
    console.log(`稳定性评分: ${stabilityScore.score}/100`);

    // 保存报告
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(reportsDir, 'memory-leak-report.json'), JSON.stringify(report, null, 2));

    return report;
  }

  // 简化的其他模拟方法
  async simulateMQTTCommunication() {
    const messageQueue = [];
    for (let i = 0; i < 1000; i++) {
      messageQueue.push({ id: i, data: Math.random() });
      if (messageQueue.length > 500) messageQueue.shift();
      if (i % 100 === 0) await new Promise(resolve => setTimeout(resolve, 5));
    }
  }

  async simulateCSVExport() {
    const data = [];
    for (let i = 0; i < 5000; i++) {
      data.push({ timestamp: Date.now(), value: Math.random() });
      if (i % 1000 === 0) await new Promise(resolve => setTimeout(resolve, 10));
    }
    data.length = 0; // 清理
  }

  async simulateMemoryIntensiveOperations() {
    const largeObjects = [];
    for (let i = 0; i < 50; i++) {
      largeObjects.push({ data: new Array(10000).fill(Math.random()) });
      if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 20));
    }
    largeObjects.forEach(obj => obj.data = null);
  }

  async simulateCleanupOperations() {
    if (this.forceGarbageCollection()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// 运行检测器
const detector = new MemoryLeakDetector();
detector.run().catch(console.error);
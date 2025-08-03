/**
 * Performance Store for Serial Studio VSCode Extension
 * 性能监控存储
 */

import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import type { PerformanceMetrics } from '../../shared/types';
import { memoryMonitor, type MemorySnapshot, type MemoryLeakReport } from '../../shared/MemoryMonitor';

/**
 * 性能采样点接口
 */
export interface PerformanceSample {
  timestamp: number;
  fps: number;
  latency: number;
  memory: number;
  cpu?: number;
  frameTime: number;
  droppedFrames: number;
}

/**
 * 性能警告接口
 */
export interface PerformanceAlert {
  id: string;
  type: 'fps' | 'memory' | 'latency' | 'cpu';
  level: 'warning' | 'critical';
  message: string;
  timestamp: number;
  value: number;
  threshold: number;
}

/**
 * 性能阈值配置
 */
export interface PerformanceThresholds {
  fps: {
    warning: number;    // FPS低于此值发出警告
    critical: number;   // FPS低于此值发出严重警告
  };
  memory: {
    warning: number;    // 内存使用超过此值(MB)发出警告
    critical: number;   // 内存使用超过此值(MB)发出严重警告
  };
  latency: {
    warning: number;    // 延迟超过此值(ms)发出警告
    critical: number;   // 延迟超过此值(ms)发出严重警告
  };
  cpu: {
    warning: number;    // CPU使用超过此值(%)发出警告
    critical: number;   // CPU使用超过此值(%)发出严重警告
  };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fps: { warning: 30, critical: 15 },
  memory: { warning: 500, critical: 800 },
  latency: { warning: 100, critical: 200 },
  cpu: { warning: 80, critical: 95 }
};

export const usePerformanceStore = defineStore('performance', () => {
  // === 状态 ===
  const isMonitoring = ref(false);
  const samples = ref<PerformanceSample[]>([]);
  const alerts = ref<PerformanceAlert[]>([]);
  const thresholds = ref<PerformanceThresholds>({ ...DEFAULT_THRESHOLDS });
  
  // 内存监控状态
  const memorySnapshots = ref<MemorySnapshot[]>([]);
  const memoryLeakReports = ref<MemoryLeakReport[]>([]);
  const memoryMonitoringEnabled = ref(false);
  
  // 当前性能指标
  const currentMetrics = reactive<PerformanceMetrics>({
    updateFrequency: 0,
    processingLatency: 0,
    memoryUsage: 0,
    droppedFrames: 0,
    cpuUsage: 0
  });

  // 实时性能数据
  const realtimeStats = reactive({
    fps: 0,
    averageFps: 0,
    minFps: Infinity,
    maxFps: 0,
    frameTime: 0,
    averageFrameTime: 0,
    lastFrameTime: 0,
    totalFrames: 0,
    droppedFrames: 0,
    droppedFrameRate: 0
  });

  // 监控配置
  const monitoringConfig = reactive({
    sampleInterval: 1000,      // 采样间隔(ms)
    maxSamples: 300,           // 最大保留样本数(5分钟)
    enableAlerts: true,        // 是否启用性能警告
    autoOptimize: false        // 是否自动优化性能
  });

  // === 内部状态 ===
  let monitoringTimer: NodeJS.Timeout | null = null;
  let frameCount = 0;
  let lastFpsTime = Date.now();
  let lastFrameTimestamp = 0;
  let performanceObserver: PerformanceObserver | null = null;

  // === 计算属性 ===
  const fps = computed(() => realtimeStats.fps);
  const latency = computed(() => currentMetrics.processingLatency);
  const memoryUsage = computed(() => currentMetrics.memoryUsage);
  const cpuUsage = computed(() => currentMetrics.cpuUsage || 0);

  const averagePerformance = computed(() => {
    if (samples.value.length === 0) {
      return {
        fps: 0,
        latency: 0,
        memory: 0,
        cpu: 0
      };
    }

    const recent = samples.value.slice(-60); // 最近1分钟的数据
    const total = recent.reduce(
      (acc, sample) => ({
        fps: acc.fps + sample.fps,
        latency: acc.latency + sample.latency,
        memory: acc.memory + sample.memory,
        cpu: acc.cpu + (sample.cpu || 0)
      }),
      { fps: 0, latency: 0, memory: 0, cpu: 0 }
    );

    return {
      fps: Math.round(total.fps / recent.length),
      latency: Math.round(total.latency / recent.length),
      memory: Math.round(total.memory / recent.length),
      cpu: Math.round(total.cpu / recent.length)
    };
  });

  const performanceGrade = computed(() => {
    const avg = averagePerformance.value;
    
    // 基于多个指标计算性能等级
    let score = 100;
    
    // FPS评分 (30%)
    if (avg.fps < thresholds.value.fps.critical) {score -= 30;}
    else if (avg.fps < thresholds.value.fps.warning) {score -= 15;}
    
    // 内存评分 (25%)
    if (avg.memory > thresholds.value.memory.critical) {score -= 25;}
    else if (avg.memory > thresholds.value.memory.warning) {score -= 12;}
    
    // 延迟评分 (25%)
    if (avg.latency > thresholds.value.latency.critical) {score -= 25;}
    else if (avg.latency > thresholds.value.latency.warning) {score -= 12;}
    
    // CPU评分 (20%)
    if (avg.cpu > thresholds.value.cpu.critical) {score -= 20;}
    else if (avg.cpu > thresholds.value.cpu.warning) {score -= 10;}
    
    if (score >= 90) {return { grade: 'A', label: '优秀', color: '#67c23a' };}
    if (score >= 80) {return { grade: 'B', label: '良好', color: '#409eff' };}
    if (score >= 70) {return { grade: 'C', label: '一般', color: '#e6a23c' };}
    if (score >= 60) {return { grade: 'D', label: '较差', color: '#f56c6c' };}
    return { grade: 'F', label: '很差', color: '#f56c6c' };
  });

  const activeAlerts = computed(() => 
    alerts.value.filter(alert => 
      Date.now() - alert.timestamp < 60000 // 1分钟内的警告
    )
  );

  const criticalAlerts = computed(() =>
    activeAlerts.value.filter(alert => alert.level === 'critical')
  );

  // === 方法 ===

  /**
   * 开始性能监控
   */
  const startMonitoring = () => {
    if (isMonitoring.value) {return;}

    isMonitoring.value = true;
    frameCount = 0;
    lastFpsTime = Date.now();
    
    // 启动采样定时器
    monitoringTimer = setInterval(collectSample, monitoringConfig.sampleInterval);
    
    // 启动Performance Observer（如果可用）
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              updateLatency(entry.duration);
            }
          }
        });
        
        performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer不可用:', error);
      }
    }

    // 启动内存监控
    startMemoryMonitoring();

    console.log('性能监控已启动');
  };

  /**
   * 停止性能监控
   */
  const stopMonitoring = () => {
    if (!isMonitoring.value) {return;}

    isMonitoring.value = false;
    
    if (monitoringTimer) {
      clearInterval(monitoringTimer);
      monitoringTimer = null;
    }

    if (performanceObserver) {
      performanceObserver.disconnect();
      performanceObserver = null;
    }

    // 停止内存监控
    stopMemoryMonitoring();

    console.log('性能监控已停止');
  };

  /**
   * 记录帧渲染
   */
  const recordFrame = () => {
    frameCount++;
    const now = Date.now();
    
    // 计算帧时间
    if (lastFrameTimestamp > 0) {
      realtimeStats.frameTime = now - lastFrameTimestamp;
      realtimeStats.averageFrameTime = 
        (realtimeStats.averageFrameTime * 0.9) + (realtimeStats.frameTime * 0.1);
    }
    
    lastFrameTimestamp = now;
    realtimeStats.totalFrames++;

    // 每秒计算一次FPS
    if (now - lastFpsTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      
      realtimeStats.fps = fps;
      realtimeStats.averageFps = 
        (realtimeStats.averageFps * 0.8) + (fps * 0.2);
      realtimeStats.minFps = Math.min(realtimeStats.minFps, fps);
      realtimeStats.maxFps = Math.max(realtimeStats.maxFps, fps);
      
      frameCount = 0;
      lastFpsTime = now;
      
      // 更新全局FPS指标
      currentMetrics.updateFrequency = fps;
    }
  };

  /**
   * 记录丢帧
   */
  const recordDroppedFrame = () => {
    realtimeStats.droppedFrames++;
    currentMetrics.droppedFrames++;
    
    // 计算丢帧率
    if (realtimeStats.totalFrames > 0) {
      realtimeStats.droppedFrameRate = 
        (realtimeStats.droppedFrames / realtimeStats.totalFrames) * 100;
    }
  };

  /**
   * 更新延迟指标
   * @param latency 延迟时间(ms)
   */
  const updateLatency = (latency: number) => {
    currentMetrics.processingLatency = latency;
  };

  /**
   * 更新内存使用情况
   * @param memoryMB 内存使用量(MB)
   */
  const updateMemoryUsage = (memoryMB: number) => {
    currentMetrics.memoryUsage = memoryMB;
  };

  /**
   * 更新CPU使用率
   * @param cpuPercent CPU使用率(%)
   */
  const updateCpuUsage = (cpuPercent: number) => {
    currentMetrics.cpuUsage = cpuPercent;
  };

  /**
   * 收集性能样本
   */
  const collectSample = () => {
    const now = Date.now();
    
    // 估算内存使用情况
    let memoryUsage = currentMetrics.memoryUsage;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
    }

    const sample: PerformanceSample = {
      timestamp: now,
      fps: realtimeStats.fps,
      latency: currentMetrics.processingLatency,
      memory: memoryUsage,
      cpu: currentMetrics.cpuUsage,
      frameTime: realtimeStats.frameTime,
      droppedFrames: currentMetrics.droppedFrames
    };

    samples.value.push(sample);

    // 限制样本数量
    if (samples.value.length > monitoringConfig.maxSamples) {
      samples.value.shift();
    }

    // 检查性能警告
    if (monitoringConfig.enableAlerts) {
      checkPerformanceAlerts(sample);
    }

    // 自动优化（如果启用）
    if (monitoringConfig.autoOptimize) {
      autoOptimizePerformance(sample);
    }
  };

  /**
   * 检查性能警告
   * @param sample 性能样本
   */
  const checkPerformanceAlerts = (sample: PerformanceSample) => {
    const now = Date.now();

    // 检查FPS警告
    if (sample.fps < thresholds.value.fps.critical) {
      addAlert('fps', 'critical', `FPS过低: ${sample.fps}`, sample.fps, thresholds.value.fps.critical);
    } else if (sample.fps < thresholds.value.fps.warning) {
      addAlert('fps', 'warning', `FPS较低: ${sample.fps}`, sample.fps, thresholds.value.fps.warning);
    }

    // 检查内存警告
    if (sample.memory > thresholds.value.memory.critical) {
      addAlert('memory', 'critical', `内存使用过高: ${sample.memory}MB`, sample.memory, thresholds.value.memory.critical);
    } else if (sample.memory > thresholds.value.memory.warning) {
      addAlert('memory', 'warning', `内存使用较高: ${sample.memory}MB`, sample.memory, thresholds.value.memory.warning);
    }

    // 检查延迟警告
    if (sample.latency > thresholds.value.latency.critical) {
      addAlert('latency', 'critical', `处理延迟过高: ${sample.latency}ms`, sample.latency, thresholds.value.latency.critical);
    } else if (sample.latency > thresholds.value.latency.warning) {
      addAlert('latency', 'warning', `处理延迟较高: ${sample.latency}ms`, sample.latency, thresholds.value.latency.warning);
    }

    // 检查CPU警告
    if (sample.cpu && sample.cpu > thresholds.value.cpu.critical) {
      addAlert('cpu', 'critical', `CPU使用过高: ${sample.cpu}%`, sample.cpu, thresholds.value.cpu.critical);
    } else if (sample.cpu && sample.cpu > thresholds.value.cpu.warning) {
      addAlert('cpu', 'warning', `CPU使用较高: ${sample.cpu}%`, sample.cpu, thresholds.value.cpu.warning);
    }
  };

  /**
   * 添加性能警告
   */
  const addAlert = (type: PerformanceAlert['type'], level: PerformanceAlert['level'], 
                   message: string, value: number, threshold: number) => {
    const alertId = `${type}-${level}-${Date.now()}`;
    
    // 避免重复警告（1分钟内同类型警告只发送一次）
    const recentSimilar = alerts.value.find(alert => 
      alert.type === type && 
      alert.level === level && 
      Date.now() - alert.timestamp < 60000
    );
    
    if (recentSimilar) {return;}

    const alert: PerformanceAlert = {
      id: alertId,
      type,
      level,
      message,
      timestamp: Date.now(),
      value,
      threshold
    };

    alerts.value.push(alert);

    // 限制警告数量
    if (alerts.value.length > 50) {
      alerts.value = alerts.value.slice(-50);
    }

    // 发送警告事件
    console.warn(`性能警告 [${level.toUpperCase()}]: ${message}`);
  };

  /**
   * 自动性能优化
   * @param sample 性能样本
   */
  const autoOptimizePerformance = (sample: PerformanceSample) => {
    // 如果FPS过低，尝试优化
    if (sample.fps < thresholds.value.fps.warning) {
      // 降低更新频率
      if (monitoringConfig.sampleInterval < 2000) {
        monitoringConfig.sampleInterval += 200;
        console.log(`自动优化: 降低采样频率至 ${monitoringConfig.sampleInterval}ms`);
      }
    }

    // 如果内存使用过高，尝试清理
    if (sample.memory > thresholds.value.memory.warning) {
      // 清理旧样本
      if (samples.value.length > 100) {
        samples.value = samples.value.slice(-100);
        console.log('自动优化: 清理历史性能样本');
      }
      
      // 清理旧警告
      const oneHourAgo = Date.now() - 3600000;
      alerts.value = alerts.value.filter(alert => alert.timestamp > oneHourAgo);
    }
  };

  /**
   * 清除所有警告
   */
  const clearAlerts = () => {
    alerts.value = [];
  };

  /**
   * 清除特定类型的警告
   * @param type 警告类型
   */
  const clearAlertsByType = (type: PerformanceAlert['type']) => {
    alerts.value = alerts.value.filter(alert => alert.type !== type);
  };

  /**
   * 重置性能统计
   */
  const resetStats = () => {
    samples.value = [];
    alerts.value = [];
    
    Object.assign(realtimeStats, {
      fps: 0,
      averageFps: 0,
      minFps: Infinity,
      maxFps: 0,
      frameTime: 0,
      averageFrameTime: 0,
      lastFrameTime: 0,
      totalFrames: 0,
      droppedFrames: 0,
      droppedFrameRate: 0
    });

    Object.assign(currentMetrics, {
      updateFrequency: 0,
      processingLatency: 0,
      memoryUsage: 0,
      droppedFrames: 0,
      cpuUsage: 0
    });

    frameCount = 0;
    lastFpsTime = Date.now();
    lastFrameTimestamp = 0;
  };

  /**
   * 获取性能报告
   */
  const getPerformanceReport = () => {
    const avg = averagePerformance.value;
    const grade = performanceGrade.value;
    
    return {
      grade,
      current: {
        fps: realtimeStats.fps,
        latency: currentMetrics.processingLatency,
        memory: currentMetrics.memoryUsage,
        cpu: currentMetrics.cpuUsage
      },
      average: avg,
      stats: {
        totalFrames: realtimeStats.totalFrames,
        droppedFrames: realtimeStats.droppedFrames,
        droppedFrameRate: realtimeStats.droppedFrameRate,
        minFps: realtimeStats.minFps,
        maxFps: realtimeStats.maxFps,
        averageFrameTime: realtimeStats.averageFrameTime
      },
      alerts: {
        active: activeAlerts.value.length,
        critical: criticalAlerts.value.length,
        recent: alerts.value.slice(-10)
      },
      samples: samples.value.length,
      monitoring: isMonitoring.value
    };
  };

  /**
   * 设置性能阈值
   * @param newThresholds 新的阈值配置
   */
  const setThresholds = (newThresholds: Partial<PerformanceThresholds>) => {
    Object.assign(thresholds.value, newThresholds);
    saveThresholds();
  };

  /**
   * 保存阈值到本地存储
   */
  const saveThresholds = () => {
    localStorage.setItem('serial-studio-performance-thresholds', JSON.stringify(thresholds.value));
  };

  /**
   * 从本地存储加载阈值
   */
  const loadThresholds = () => {
    try {
      const stored = localStorage.getItem('serial-studio-performance-thresholds');
      if (stored) {
        Object.assign(thresholds.value, JSON.parse(stored));
      }
    } catch (error) {
      console.warn('加载性能阈值失败:', error);
    }
  };

  // === 内存监控相关方法 ===

  /**
   * 启动内存监控
   */
  const startMemoryMonitoring = () => {
    if (memoryMonitoringEnabled.value) {return;}

    memoryMonitoringEnabled.value = true;

    // 设置内存监控事件监听
    memoryMonitor.on('memorySnapshot', handleMemorySnapshot);
    memoryMonitor.on('leakDetected', handleMemoryLeak);
    memoryMonitor.on('memoryPressure', handleMemoryPressure);
    memoryMonitor.on('performanceIssue', handlePerformanceIssue);

    // 启动内存监控
    memoryMonitor.startMonitoring(5000, 30000); // 5秒收集快照，30秒检测泄漏

    console.log('内存监控已启动');
  };

  /**
   * 停止内存监控
   */
  const stopMemoryMonitoring = () => {
    if (!memoryMonitoringEnabled.value) {return;}

    memoryMonitoringEnabled.value = false;

    // 移除事件监听
    memoryMonitor.removeAllListeners();

    // 停止内存监控
    memoryMonitor.stopMonitoring();

    console.log('内存监控已停止');
  };

  /**
   * 处理内存快照
   */
  const handleMemorySnapshot = (snapshot: MemorySnapshot) => {
    memorySnapshots.value.push(snapshot);

    // 限制快照数量
    if (memorySnapshots.value.length > 300) { // 保留25分钟的快照（5秒间隔）
      memorySnapshots.value.shift();
    }

    // 更新当前内存使用情况
    const memoryMB = snapshot.usedJSHeapSize / (1024 * 1024);
    updateMemoryUsage(Math.round(memoryMB));
  };

  /**
   * 处理内存泄漏检测
   */
  const handleMemoryLeak = (report: MemoryLeakReport) => {
    memoryLeakReports.value.push(report);

    // 限制报告数量
    if (memoryLeakReports.value.length > 50) {
      memoryLeakReports.value = memoryLeakReports.value.slice(-50);
    }

    // 发出严重警告
    if (report.leakSuspected) {
      addAlert('memory', 'critical', 
        `检测到内存泄漏: 增长率 ${report.memoryGrowthRate.toFixed(2)} MB/min`,
        report.memoryGrowthRate, 
        thresholds.value.memory.critical
      );
    }

    console.warn('内存泄漏检测报告:', report);
  };

  /**
   * 处理内存压力
   */
  const handleMemoryPressure = (level: 'low' | 'medium' | 'high' | 'critical') => {
    const messages = {
      low: '内存压力正常',
      medium: '内存压力中等',
      high: '内存压力较高',
      critical: '内存压力严重'
    };

    const alertLevel = level === 'critical' || level === 'high' ? 'critical' : 'warning';
    
    addAlert('memory', alertLevel, messages[level], 
      currentMetrics.memoryUsage, 
      thresholds.value.memory[alertLevel]
    );

    // 自动执行内存优化
    if (level === 'critical' || level === 'high') {
      forceMemoryOptimization();
    }
  };

  /**
   * 处理性能问题
   */
  const handlePerformanceIssue = (issue: string, details: any) => {
    console.warn('性能问题:', issue, details);
    
    addAlert('memory', 'warning', `性能问题: ${issue}`, 0, 0);
  };

  /**
   * 强制内存优化
   */
  const forceMemoryOptimization = () => {
    console.log('执行强制内存优化...');
    
    // 调用内存监控器的优化方法
    memoryMonitor.forceOptimization();
    
    // 清理旧的性能样本
    if (samples.value.length > 100) {
      samples.value = samples.value.slice(-100);
    }
    
    // 清理旧的内存快照
    if (memorySnapshots.value.length > 100) {
      memorySnapshots.value = memorySnapshots.value.slice(-100);
    }
    
    // 清理旧的泄漏报告
    if (memoryLeakReports.value.length > 20) {
      memoryLeakReports.value = memoryLeakReports.value.slice(-20);
    }
    
    console.log('内存优化完成');
  };

  /**
   * 获取内存监控状态
   */
  const getMemoryMonitoringStatus = () => {
    return {
      enabled: memoryMonitoringEnabled.value,
      snapshotCount: memorySnapshots.value.length,
      leakReportCount: memoryLeakReports.value.length,
      currentStats: memoryMonitor.getCurrentStats(),
      monitoringStatus: memoryMonitor.getMonitoringStatus()
    };
  };

  /**
   * 获取内存趋势
   */
  const getMemoryTrend = (minutes = 10) => {
    return memoryMonitor.getMemoryTrend(minutes);
  };

  // 初始化时加载阈值
  loadThresholds();

  // 返回store API
  return {
    // 状态
    isMonitoring: computed(() => isMonitoring.value),
    samples: computed(() => samples.value),
    alerts: computed(() => alerts.value),
    currentMetrics: computed(() => currentMetrics),
    realtimeStats: computed(() => realtimeStats),
    thresholds: computed(() => thresholds.value),
    monitoringConfig: computed(() => monitoringConfig),
    
    // 内存监控状态
    memorySnapshots: computed(() => memorySnapshots.value),
    memoryLeakReports: computed(() => memoryLeakReports.value),
    memoryMonitoringEnabled: computed(() => memoryMonitoringEnabled.value),
    
    // 计算属性
    fps,
    latency,
    memoryUsage,
    cpuUsage,
    averagePerformance,
    performanceGrade,
    activeAlerts,
    criticalAlerts,
    
    // 方法
    startMonitoring,
    stopMonitoring,
    recordFrame,
    recordDroppedFrame,
    updateLatency,
    updateMemoryUsage,
    updateCpuUsage,
    clearAlerts,
    clearAlertsByType,
    resetStats,
    getPerformanceReport,
    setThresholds,
    
    // 内存监控方法
    startMemoryMonitoring,
    stopMemoryMonitoring,
    forceMemoryOptimization,
    getMemoryMonitoringStatus,
    getMemoryTrend
  };
});

export default usePerformanceStore;
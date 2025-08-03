/**
 * MemoryMonitor - 内存使用监控和泄漏检测系统
 * 基于Serial-Studio的性能监控设计，提供实时内存分析和泄漏检测
 */

import { EventEmitter } from 'events';
import { getMemoryManager } from './MemoryManager';
import { objectPoolManager } from './ObjectPoolManager';

/**
 * 内存使用快照
 */
export interface MemorySnapshot {
  timestamp: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  poolStats: Record<string, any>;
  cacheStats: Record<string, any>;
  customMetrics: Record<string, number>;
}

/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakReport {
  timestamp: number;
  leakSuspected: boolean;
  memoryGrowthRate: number; // MB/min
  consecutiveGrowthPeriods: number;
  heapGrowthTrend: 'stable' | 'growing' | 'declining';
  recommendations: string[];
  criticalIssues: string[];
  poolAnalysis: {
    suspiciousPools: string[];
    lowEfficiencyPools: string[];
    overAllocatedPools: string[];
  };
}

/**
 * 内存性能阈值配置
 */
export interface MemoryThresholds {
  maxHeapUsagePercent: number; // 最大堆使用百分比
  maxMemoryGrowthRate: number; // 最大内存增长率 (MB/min)
  maxConsecutiveGrowthPeriods: number; // 最大连续增长周期
  poolHitRateThreshold: number; // 池命中率阈值
  poolUtilizationThreshold: number; // 池利用率阈值
}

/**
 * 内存监控器事件接口
 */
export interface MemoryMonitorEvents {
  'memorySnapshot': (snapshot: MemorySnapshot) => void;
  'leakDetected': (report: MemoryLeakReport) => void;
  'memoryPressure': (level: 'low' | 'medium' | 'high' | 'critical') => void;
  'performanceIssue': (issue: string, details: any) => void;
}

/**
 * 内存监控器
 * 提供全面的内存使用监控和泄漏检测功能
 */
export class MemoryMonitor extends EventEmitter {
  private static instance: MemoryMonitor | null = null;
  
  private memoryManager = getMemoryManager();
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private leakDetectionInterval: NodeJS.Timeout | null = null;
  
  // 内存快照历史
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshotHistory = 300; // 保留最近300个快照
  
  // 配置
  private thresholds: MemoryThresholds = {
    maxHeapUsagePercent: 85,
    maxMemoryGrowthRate: 10, // 10MB/min
    maxConsecutiveGrowthPeriods: 5,
    poolHitRateThreshold: 0.7,
    poolUtilizationThreshold: 0.8
  };
  
  // 内存泄漏检测状态
  private consecutiveGrowthCount = 0;
  private lastLeakCheckTime = 0;
  private baselineMemory: number | null = null;
  
  // 自定义监控指标
  private customMetrics = new Map<string, number>();
  
  private constructor() {
    super();
    this.setupNodeJSMemoryCollection();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * 设置 Node.js 内存统计收集
   */
  private setupNodeJSMemoryCollection(): void {
    // 在 Node.js 环境中启用详细的内存统计
    if (typeof process !== 'undefined' && typeof process.memoryUsage === 'function') {
      // 设置内存使用报告间隔
      if (process.report && process.report.reportOnSignal !== undefined) {
        process.report.reportOnSignal = false;
        process.report.reportOnUncaughtException = false;
        process.report.reportOnFatalError = false;
      }
    }
  }

  /**
   * 开始内存监控
   * @param interval 监控间隔（毫秒），默认5秒
   * @param leakCheckInterval 泄漏检测间隔（毫秒），默认30秒
   */
  startMonitoring(interval = 5000, leakCheckInterval = 30000): void {
    if (this.isMonitoring) {
      console.warn('内存监控已经在运行');
      return;
    }

    console.log('启动内存监控器，监控间隔:', interval, 'ms');
    
    this.isMonitoring = true;
    this.baselineMemory = this.getCurrentMemoryUsage().heapUsed;
    
    // 定期收集内存快照
    this.monitoringInterval = setInterval(() => {
      this.collectMemorySnapshot();
    }, interval);
    
    // 定期进行泄漏检测
    this.leakDetectionInterval = setInterval(() => {
      this.performLeakDetection();
    }, leakCheckInterval);
    
    // 立即收集一次快照作为基线
    this.collectMemorySnapshot();
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('停止内存监控器');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.leakDetectionInterval) {
      clearInterval(this.leakDetectionInterval);
      this.leakDetectionInterval = null;
    }
  }

  /**
   * 收集内存快照
   */
  private collectMemorySnapshot(): void {
    const timestamp = Date.now();
    
    // 收集基础内存信息
    const memoryUsage = this.getCurrentMemoryUsage();
    const browserMemory = this.getBrowserMemoryInfo();
    
    // 收集对象池统计
    const poolStats = objectPoolManager.getAllPoolStats();
    
    // 收集内存管理器统计
    const memoryStats = this.memoryManager.getMemoryStats();
    
    // 创建快照
    const snapshot: MemorySnapshot = {
      timestamp,
      totalJSHeapSize: browserMemory.totalJSHeapSize,
      usedJSHeapSize: browserMemory.usedJSHeapSize,
      jsHeapSizeLimit: browserMemory.jsHeapSizeLimit,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      poolStats,
      cacheStats: {},
      customMetrics: Object.fromEntries(this.customMetrics)
    };
    
    // 添加到历史记录
    this.snapshots.push(snapshot);
    
    // 限制历史记录大小
    if (this.snapshots.length > this.maxSnapshotHistory) {
      this.snapshots.shift();
    }
    
    // 发出快照事件
    this.emit('memorySnapshot', snapshot);
    
    // 检查内存压力
    this.checkMemoryPressure(snapshot);
  }

  /**
   * 获取当前内存使用情况
   */
  private getCurrentMemoryUsage(): NodeJS.MemoryUsage {
    if (typeof process !== 'undefined' && typeof process.memoryUsage === 'function') {
      return process.memoryUsage();
    }
    
    // 浏览器环境的后备方案
    return {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0
    };
  }

  /**
   * 获取浏览器内存信息
   */
  private getBrowserMemoryInfo(): {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  } {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        totalJSHeapSize: memory.totalJSHeapSize || 0,
        usedJSHeapSize: memory.usedJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit || 0
      };
    }
    
    return {
      totalJSHeapSize: 0,
      usedJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }

  /**
   * 检查内存压力水平
   */
  private checkMemoryPressure(snapshot: MemorySnapshot): void {
    let pressureLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // 计算堆使用率
    const heapUsagePercent = snapshot.jsHeapSizeLimit > 0 
      ? (snapshot.usedJSHeapSize / snapshot.jsHeapSizeLimit) * 100
      : 0;
    
    // 计算内存增长率
    const growthRate = this.calculateMemoryGrowthRate();
    
    // 确定压力级别
    if (heapUsagePercent > 90 || growthRate > this.thresholds.maxMemoryGrowthRate * 2) {
      pressureLevel = 'critical';
    } else if (heapUsagePercent > this.thresholds.maxHeapUsagePercent || growthRate > this.thresholds.maxMemoryGrowthRate) {
      pressureLevel = 'high';
    } else if (heapUsagePercent > 70 || growthRate > this.thresholds.maxMemoryGrowthRate * 0.5) {
      pressureLevel = 'medium';
    }
    
    // 发出内存压力事件
    if (pressureLevel !== 'low') {
      this.emit('memoryPressure', pressureLevel);
      
      // 在高压力时触发内存优化
      if (pressureLevel === 'high' || pressureLevel === 'critical') {
        this.memoryManager.optimize();
        objectPoolManager.optimize();
      }
    }
  }

  /**
   * 执行内存泄漏检测
   */
  private performLeakDetection(): void {
    const currentTime = Date.now();
    
    if (this.snapshots.length < 5) {
      console.log('快照数量不足，跳过泄漏检测');
      return;
    }
    
    const report = this.analyzeMemoryLeaks();
    
    if (report.leakSuspected) {
      console.warn('检测到可能的内存泄漏:', report);
      this.emit('leakDetected', report);
    }
    
    this.lastLeakCheckTime = currentTime;
  }

  /**
   * 分析内存泄漏
   */
  private analyzeMemoryLeaks(): MemoryLeakReport {
    const recent = this.snapshots.slice(-10); // 分析最近10个快照
    const growthRate = this.calculateMemoryGrowthRate();
    
    // 检查内存是否持续增长
    let consecutiveGrowth = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].usedJSHeapSize > recent[i - 1].usedJSHeapSize) {
        consecutiveGrowth++;
      } else {
        consecutiveGrowth = 0;
      }
    }
    
    this.consecutiveGrowthCount = consecutiveGrowth;
    
    // 确定内存增长趋势
    let heapGrowthTrend: 'stable' | 'growing' | 'declining' = 'stable';
    if (consecutiveGrowth >= 3) {
      heapGrowthTrend = 'growing';
    } else if (consecutiveGrowth === 0 && recent.length > 2) {
      const lastSnapshot = recent[recent.length - 1];
      const prevSnapshot = recent[recent.length - 3];
      if (lastSnapshot.usedJSHeapSize < prevSnapshot.usedJSHeapSize) {
        heapGrowthTrend = 'declining';
      }
    }
    
    // 分析对象池
    const poolAnalysis = this.analyzePoolPerformance();
    
    // 生成建议和关键问题
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    
    if (growthRate > this.thresholds.maxMemoryGrowthRate) {
      criticalIssues.push(`内存增长率过高: ${growthRate.toFixed(2)} MB/min`);
      recommendations.push('检查是否存在未释放的对象引用');
    }
    
    if (consecutiveGrowth >= this.thresholds.maxConsecutiveGrowthPeriods) {
      criticalIssues.push(`连续增长周期过多: ${consecutiveGrowth}`);
      recommendations.push('强制执行垃圾回收并检查对象池利用率');
    }
    
    if (poolAnalysis.suspiciousPools.length > 0) {
      criticalIssues.push(`疑似泄漏的对象池: ${poolAnalysis.suspiciousPools.join(', ')}`);
      recommendations.push('检查对象池的释放逻辑');
    }
    
    // 确定是否疑似泄漏
    const leakSuspected = criticalIssues.length > 0 || 
      (growthRate > this.thresholds.maxMemoryGrowthRate && consecutiveGrowth >= 3);
    
    return {
      timestamp: Date.now(),
      leakSuspected,
      memoryGrowthRate: growthRate,
      consecutiveGrowthPeriods: consecutiveGrowth,
      heapGrowthTrend,
      recommendations,
      criticalIssues,
      poolAnalysis
    };
  }

  /**
   * 计算内存增长率 (MB/min)
   */
  private calculateMemoryGrowthRate(): number {
    if (this.snapshots.length < 2) {
      return 0;
    }
    
    const recent = this.snapshots.slice(-5); // 使用最近5个快照
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    
    const timeDiffMinutes = (newest.timestamp - oldest.timestamp) / (1000 * 60);
    const memoryDiffMB = (newest.usedJSHeapSize - oldest.usedJSHeapSize) / (1024 * 1024);
    
    return timeDiffMinutes > 0 ? memoryDiffMB / timeDiffMinutes : 0;
  }

  /**
   * 分析对象池性能
   */
  private analyzePoolPerformance(): {
    suspiciousPools: string[];
    lowEfficiencyPools: string[];
    overAllocatedPools: string[];
  } {
    const poolStats = objectPoolManager.getAllPoolStats();
    const suspiciousPools: string[] = [];
    const lowEfficiencyPools: string[] = [];
    const overAllocatedPools: string[] = [];
    
    for (const [poolName, stats] of Object.entries(poolStats)) {
      // 检查命中率
      if (stats.hitRate < this.thresholds.poolHitRateThreshold) {
        lowEfficiencyPools.push(poolName);
      }
      
      // 检查利用率
      const utilization = stats.used / stats.size;
      if (utilization < (1 - this.thresholds.poolUtilizationThreshold) && stats.size > 10) {
        overAllocatedPools.push(poolName);
      }
      
      // 检查异常增长
      if (stats.size > 1000 && utilization < 0.1) {
        suspiciousPools.push(poolName);
      }
    }
    
    return {
      suspiciousPools,
      lowEfficiencyPools,
      overAllocatedPools
    };
  }

  /**
   * 添加自定义监控指标
   */
  addCustomMetric(name: string, value: number): void {
    this.customMetrics.set(name, value);
  }

  /**
   * 移除自定义监控指标
   */
  removeCustomMetric(name: string): void {
    this.customMetrics.delete(name);
  }

  /**
   * 获取内存使用趋势
   */
  getMemoryTrend(minutes = 10): {
    timestamps: number[];
    heapUsed: number[];
    heapTotal: number[];
    trend: 'up' | 'down' | 'stable';
  } {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentSnapshots = this.snapshots.filter(s => s.timestamp >= cutoff);
    
    if (recentSnapshots.length === 0) {
      return { timestamps: [], heapUsed: [], heapTotal: [], trend: 'stable' };
    }
    
    const timestamps = recentSnapshots.map(s => s.timestamp);
    const heapUsed = recentSnapshots.map(s => s.usedJSHeapSize);
    const heapTotal = recentSnapshots.map(s => s.totalJSHeapSize);
    
    // 计算趋势
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentSnapshots.length >= 2) {
      const first = recentSnapshots[0];
      const last = recentSnapshots[recentSnapshots.length - 1];
      const changePercent = ((last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize) * 100;
      
      if (changePercent > 5) {
        trend = 'up';
      } else if (changePercent < -5) {
        trend = 'down';
      }
    }
    
    return { timestamps, heapUsed, heapTotal, trend };
  }

  /**
   * 获取当前内存统计摘要
   */
  getCurrentStats(): {
    currentMemoryMB: number;
    memoryGrowthRate: number;
    poolEfficiency: number;
    leakRisk: 'low' | 'medium' | 'high';
  } {
    const latest = this.snapshots[this.snapshots.length - 1];
    const currentMemoryMB = latest ? latest.usedJSHeapSize / (1024 * 1024) : 0;
    const memoryGrowthRate = this.calculateMemoryGrowthRate();
    
    // 计算平均池效率
    const poolStats = objectPoolManager.getAllPoolStats();
    const poolCount = Object.keys(poolStats).length;
    const totalHitRate = Object.values(poolStats).reduce((sum, stats) => sum + stats.hitRate, 0);
    const poolEfficiency = poolCount > 0 ? totalHitRate / poolCount : 0;
    
    // 评估泄漏风险
    let leakRisk: 'low' | 'medium' | 'high' = 'low';
    if (memoryGrowthRate > this.thresholds.maxMemoryGrowthRate) {
      leakRisk = 'high';
    } else if (this.consecutiveGrowthCount >= 3 || memoryGrowthRate > this.thresholds.maxMemoryGrowthRate * 0.5) {
      leakRisk = 'medium';
    }
    
    return {
      currentMemoryMB,
      memoryGrowthRate,
      poolEfficiency,
      leakRisk
    };
  }

  /**
   * 强制执行内存优化
   */
  forceOptimization(): void {
    console.log('执行强制内存优化...');
    
    // 优化内存管理器
    this.memoryManager.optimize();
    
    // 优化对象池
    objectPoolManager.optimize();
    
    // 强制垃圾回收（如果可用）
    this.memoryManager.forceGC();
    
    // 重置基线
    this.baselineMemory = this.getCurrentMemoryUsage().heapUsed;
    this.consecutiveGrowthCount = 0;
  }

  /**
   * 设置监控阈值
   */
  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * 获取监控状态
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    snapshotCount: number;
    lastSnapshotTime: number;
    lastLeakCheckTime: number;
    thresholds: MemoryThresholds;
  } {
    return {
      isMonitoring: this.isMonitoring,
      snapshotCount: this.snapshots.length,
      lastSnapshotTime: this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1].timestamp : 0,
      lastLeakCheckTime: this.lastLeakCheckTime,
      thresholds: { ...this.thresholds }
    };
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stopMonitoring();
    this.snapshots = [];
    this.customMetrics.clear();
    this.removeAllListeners();
    MemoryMonitor.instance = null;
  }
}

// 扩展EventEmitter类型
export declare interface MemoryMonitor {
  on<U extends keyof MemoryMonitorEvents>(event: U, listener: MemoryMonitorEvents[U]): this;
  emit<U extends keyof MemoryMonitorEvents>(event: U, ...args: Parameters<MemoryMonitorEvents[U]>): boolean;
}

// 导出单例实例
export const memoryMonitor = MemoryMonitor.getInstance();

export default MemoryMonitor;
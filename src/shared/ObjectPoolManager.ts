/**
 * ObjectPoolManager - 对象池统一管理器
 * 管理各种频繁分配对象的对象池，减少GC压力和内存碎片化
 */

import { getMemoryManager, ObjectPool } from './MemoryManager';
import type { 
  DataPoint, 
  ProcessedFrame, 
  Dataset, 
  Group, 
  RawFrame,
  CommunicationStats,
  PerformanceMetrics 
} from './types';

/**
 * 对象池配置接口
 */
interface ObjectPoolConfiguration {
  initialSize: number;
  maxSize: number;
  growthFactor: number;
  shrinkThreshold: number;
}

/**
 * 默认池配置
 */
const DEFAULT_POOL_CONFIGS: Record<string, ObjectPoolConfiguration> = {
  // 高频对象 - 大容量池
  dataPoints: {
    initialSize: 200,
    maxSize: 2000,
    growthFactor: 1.5,
    shrinkThreshold: 0.3
  },
  
  // 中频对象 - 中等容量池
  datasets: {
    initialSize: 50,
    maxSize: 500,
    growthFactor: 1.4,
    shrinkThreshold: 0.4
  },
  
  groups: {
    initialSize: 20,
    maxSize: 200,
    growthFactor: 1.3,
    shrinkThreshold: 0.4
  },
  
  rawFrames: {
    initialSize: 30,
    maxSize: 300,
    growthFactor: 1.4,
    shrinkThreshold: 0.3
  },
  
  // 低频对象 - 小容量池
  processedFrames: {
    initialSize: 10,
    maxSize: 100,
    growthFactor: 1.2,
    shrinkThreshold: 0.5
  },
  
  stats: {
    initialSize: 5,
    maxSize: 50,
    growthFactor: 1.2,
    shrinkThreshold: 0.5
  }
};

/**
 * 对象池管理器
 * 单例模式，统一管理所有对象池
 */
export class ObjectPoolManager {
  private static instance: ObjectPoolManager | null = null;
  private memoryManager = getMemoryManager();
  private pools = new Map<string, ObjectPool<any>>();
  private initialized = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ObjectPoolManager {
    if (!ObjectPoolManager.instance) {
      ObjectPoolManager.instance = new ObjectPoolManager();
    }
    return ObjectPoolManager.instance;
  }

  /**
   * 初始化所有对象池
   */
  initialize(): void {
    if (this.initialized) {return;}

    console.log('初始化对象池管理器...');

    // 创建DataPoint对象池
    this.createPool<DataPoint>('dataPoints', {
      ...DEFAULT_POOL_CONFIGS.dataPoints,
      itemConstructor: () => ({ x: 0, y: 0, timestamp: 0 }),
      itemDestructor: (item: DataPoint) => {
        item.x = 0;
        item.y = 0;
        item.timestamp = 0;
      }
    });

    // 创建Dataset对象池
    this.createPool<Dataset>('datasets', {
      ...DEFAULT_POOL_CONFIGS.datasets,
      itemConstructor: () => ({
        id: '',
        title: '',
        value: null,
        widget: 'plot' as any,
        alarm: false,
        led: false,
        log: false,
        graph: false,
        fft: false
      }),
      itemDestructor: (item: Dataset) => {
        item.id = '';
        item.title = '';
        item.value = null;
        item.unit = undefined;
        item.alarm = false;
        item.led = false;
        item.log = false;
        item.graph = false;
        item.fft = false;
        item.min = undefined;
        item.max = undefined;
        item.units = undefined;
      }
    });

    // 创建Group对象池
    this.createPool<Group>('groups', {
      ...DEFAULT_POOL_CONFIGS.groups,
      itemConstructor: () => ({
        id: '',
        title: '',
        widget: 'plot' as any,
        datasets: []
      }),
      itemDestructor: (item: Group) => {
        item.id = '';
        item.title = '';
        item.datasets = [];
      }
    });

    // 创建RawFrame对象池
    this.createPool<RawFrame>('rawFrames', {
      ...DEFAULT_POOL_CONFIGS.rawFrames,
      itemConstructor: () => ({
        data: new Uint8Array(0),
        timestamp: 0,
        sequence: 0
      }),
      itemDestructor: (item: RawFrame) => {
        item.data = new Uint8Array(0);
        item.timestamp = 0;
        item.sequence = 0;
        item.checksumValid = undefined;
      }
    });

    // 创建ProcessedFrame对象池
    this.createPool<ProcessedFrame>('processedFrames', {
      ...DEFAULT_POOL_CONFIGS.processedFrames,
      itemConstructor: () => ({
        groups: [],
        timestamp: 0,
        sequence: 0,
        frameId: ''
      }),
      itemDestructor: (item: ProcessedFrame) => {
        // 释放groups中的对象回池
        for (const group of item.groups) {
          this.releaseGroup(group);
        }
        item.groups = [];
        item.timestamp = 0;
        item.sequence = 0;
        item.frameId = '';
      }
    });

    // 创建统计对象池
    this.createPool<CommunicationStats>('communicationStats', {
      ...DEFAULT_POOL_CONFIGS.stats,
      itemConstructor: () => ({
        bytesReceived: 0,
        bytesSent: 0,
        framesReceived: 0,
        framesSent: 0,
        errors: 0,
        reconnections: 0,
        uptime: 0
      }),
      itemDestructor: (item: CommunicationStats) => {
        item.bytesReceived = 0;
        item.bytesSent = 0;
        item.framesReceived = 0;
        item.framesSent = 0;
        item.errors = 0;
        item.reconnections = 0;
        item.uptime = 0;
      }
    });

    this.createPool<PerformanceMetrics>('performanceMetrics', {
      ...DEFAULT_POOL_CONFIGS.stats,
      itemConstructor: () => ({
        updateFrequency: 0,
        processingLatency: 0,
        memoryUsage: 0,
        droppedFrames: 0
      }),
      itemDestructor: (item: PerformanceMetrics) => {
        item.updateFrequency = 0;
        item.processingLatency = 0;
        item.memoryUsage = 0;
        item.droppedFrames = 0;
        item.cpuUsage = undefined;
      }
    });

    this.initialized = true;
    console.log('对象池管理器初始化完成，创建了', this.pools.size, '个对象池');
  }

  /**
   * 创建对象池
   */
  private createPool<T>(name: string, config: any): ObjectPool<T> {
    const pool = this.memoryManager.createObjectPool<T>(name, config);
    this.pools.set(name, pool);
    return pool;
  }

  /**
   * 获取对象池
   */
  private getPool<T>(name: string): ObjectPool<T> | null {
    const pool = this.pools.get(name);
    if (!pool) {
      console.warn(`对象池 '${name}' 不存在`);
      return null;
    }
    return pool as ObjectPool<T>;
  }

  // === DataPoint对象池操作 ===

  /**
   * 获取DataPoint对象
   */
  acquireDataPoint(): DataPoint {
    const pool = this.getPool<DataPoint>('dataPoints');
    return pool ? pool.acquire() : { x: 0, y: 0, timestamp: 0 };
  }

  /**
   * 释放DataPoint对象
   */
  releaseDataPoint(dataPoint: DataPoint): void {
    const pool = this.getPool<DataPoint>('dataPoints');
    if (pool) {
      pool.release(dataPoint);
    }
  }

  /**
   * 批量释放DataPoint对象
   */
  releaseDataPoints(dataPoints: DataPoint[]): void {
    for (const point of dataPoints) {
      this.releaseDataPoint(point);
    }
  }

  // === Dataset对象池操作 ===

  /**
   * 获取Dataset对象
   */
  acquireDataset(): Dataset {
    const pool = this.getPool<Dataset>('datasets');
    return pool ? pool.acquire() : {
      id: '',
      title: '',
      value: null,
      widget: 'plot' as any,
      alarm: false,
      led: false,
      log: false,
      graph: false,
      fft: false
    };
  }

  /**
   * 释放Dataset对象
   */
  releaseDataset(dataset: Dataset): void {
    const pool = this.getPool<Dataset>('datasets');
    if (pool) {
      pool.release(dataset);
    }
  }

  /**
   * 批量释放Dataset对象
   */
  releaseDatasets(datasets: Dataset[]): void {
    for (const dataset of datasets) {
      this.releaseDataset(dataset);
    }
  }

  // === Group对象池操作 ===

  /**
   * 获取Group对象
   */
  acquireGroup(): Group {
    const pool = this.getPool<Group>('groups');
    return pool ? pool.acquire() : {
      id: '',
      title: '',
      widget: 'plot' as any,
      datasets: []
    };
  }

  /**
   * 释放Group对象
   */
  releaseGroup(group: Group): void {
    // 先释放datasets
    this.releaseDatasets(group.datasets);
    group.datasets = [];
    
    const pool = this.getPool<Group>('groups');
    if (pool) {
      pool.release(group);
    }
  }

  /**
   * 批量释放Group对象
   */
  releaseGroups(groups: Group[]): void {
    for (const group of groups) {
      this.releaseGroup(group);
    }
  }

  // === RawFrame对象池操作 ===

  /**
   * 获取RawFrame对象
   */
  acquireRawFrame(): RawFrame {
    const pool = this.getPool<RawFrame>('rawFrames');
    return pool ? pool.acquire() : {
      data: new Uint8Array(0),
      timestamp: 0,
      sequence: 0
    };
  }

  /**
   * 释放RawFrame对象
   */
  releaseRawFrame(frame: RawFrame): void {
    const pool = this.getPool<RawFrame>('rawFrames');
    if (pool) {
      pool.release(frame);
    }
  }

  // === ProcessedFrame对象池操作 ===

  /**
   * 获取ProcessedFrame对象
   */
  acquireProcessedFrame(): ProcessedFrame {
    const pool = this.getPool<ProcessedFrame>('processedFrames');
    return pool ? pool.acquire() : {
      groups: [],
      timestamp: 0,
      sequence: 0,
      frameId: ''
    };
  }

  /**
   * 释放ProcessedFrame对象
   */
  releaseProcessedFrame(frame: ProcessedFrame): void {
    const pool = this.getPool<ProcessedFrame>('processedFrames');
    if (pool) {
      pool.release(frame);
    }
  }

  // === 统计对象池操作 ===

  /**
   * 获取CommunicationStats对象
   */
  acquireCommunicationStats(): CommunicationStats {
    const pool = this.getPool<CommunicationStats>('communicationStats');
    return pool ? pool.acquire() : {
      bytesReceived: 0,
      bytesSent: 0,
      framesReceived: 0,
      framesSent: 0,
      errors: 0,
      reconnections: 0,
      uptime: 0
    };
  }

  /**
   * 释放CommunicationStats对象
   */
  releaseCommunicationStats(stats: CommunicationStats): void {
    const pool = this.getPool<CommunicationStats>('communicationStats');
    if (pool) {
      pool.release(stats);
    }
  }

  /**
   * 获取PerformanceMetrics对象
   */
  acquirePerformanceMetrics(): PerformanceMetrics {
    const pool = this.getPool<PerformanceMetrics>('performanceMetrics');
    return pool ? pool.acquire() : {
      updateFrequency: 0,
      processingLatency: 0,
      memoryUsage: 0,
      droppedFrames: 0
    };
  }

  /**
   * 释放PerformanceMetrics对象
   */
  releasePerformanceMetrics(metrics: PerformanceMetrics): void {
    const pool = this.getPool<PerformanceMetrics>('performanceMetrics');
    if (pool) {
      pool.release(metrics);
    }
  }

  // === 管理操作 ===

  /**
   * 获取所有池的统计信息
   */
  getAllPoolStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name, pool] of this.pools.entries()) {
      stats[name] = pool.getStats();
    }
    
    return stats;
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): {
    totalPools: number;
    totalObjects: number;
    totalMemory: number;
    poolDetails: Record<string, any>;
  } {
    const poolStats = this.getAllPoolStats();
    let totalObjects = 0;
    let totalMemory = 0;

    for (const stats of Object.values(poolStats)) {
      totalObjects += stats.size;
      // 估算内存使用 (每个对象约100字节)
      totalMemory += stats.size * 100;
    }

    return {
      totalPools: this.pools.size,
      totalObjects,
      totalMemory,
      poolDetails: poolStats
    };
  }

  /**
   * 优化所有对象池
   */
  optimize(): void {
    console.log('优化对象池...');
    
    // 获取统计信息进行分析
    const stats = this.getAllPoolStats();
    
    for (const [poolName, poolStats] of Object.entries(stats)) {
      // 如果命中率低于50%，建议减少初始大小
      if (poolStats.hitRate < 0.5) {
        console.warn(`池 '${poolName}' 命中率低: ${(poolStats.hitRate * 100).toFixed(1)}%`);
      }
      
      // 如果空闲对象过多，触发收缩
      if (poolStats.free > poolStats.used * 2 && poolStats.used > 0) {
        console.info(`池 '${poolName}' 空闲对象过多，建议收缩`);
      }
    }
  }

  /**
   * 清理所有对象池
   */
  clear(): void {
    console.log('清理所有对象池...');
    
    for (const pool of this.pools.values()) {
      pool.clear();
    }
  }

  /**
   * 销毁对象池管理器
   */
  destroy(): void {
    this.clear();
    this.pools.clear();
    this.initialized = false;
    ObjectPoolManager.instance = null;
  }
}

// 导出单例实例
export const objectPoolManager = ObjectPoolManager.getInstance();

// 便捷函数导出
export const {
  acquireDataPoint,
  releaseDataPoint,
  releaseDataPoints,
  acquireDataset,
  releaseDataset,
  releaseDatasets,
  acquireGroup,
  releaseGroup,
  releaseGroups,
  acquireRawFrame,
  releaseRawFrame,
  acquireProcessedFrame,
  releaseProcessedFrame,
  acquireCommunicationStats,
  releaseCommunicationStats,
  acquirePerformanceMetrics,
  releasePerformanceMetrics
} = objectPoolManager;

export default ObjectPoolManager;
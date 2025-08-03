/**
 * VirtualizationManager - 虚拟化渲染管理器
 * 协调虚拟列表和表格的性能优化，基于Serial-Studio的高性能列表渲染
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 虚拟化配置接口
 */
export interface VirtualizationConfig {
    defaultItemHeight: number;
    bufferSize: number;
    overscan: number;
    enableVirtualization: boolean;
    enableItemRecycling: boolean;
    enableBatchUpdates: boolean;
    enableSmartScrolling: boolean;
    maxCacheSize: number;
    cacheExpirationTime: number;
    enableMemoryOptimization: boolean;
    renderThreshold: number;
    updateThrottleTime: number;
    scrollThrottleTime: number;
}
/**
 * 虚拟化实例接口
 */
export interface VirtualizationInstance {
    id: string;
    type: 'list' | 'table';
    itemCount: number;
    visibleRange: {
        start: number;
        end: number;
    };
    scrollTop: number;
    containerHeight: number;
    itemHeight: number | ((index: number) => number);
    isScrolling: boolean;
    lastUpdateTime: number;
}
/**
 * 性能指标接口
 */
export interface VirtualizationMetrics {
    instanceId: string;
    totalItems: number;
    visibleItems: number;
    renderTime: number;
    scrollFPS: number;
    memoryUsage: number;
    cacheHitRate: number;
    updateFrequency: number;
}
/**
 * 项目缓存接口
 */
interface ItemCache {
    data: any;
    height: number;
    timestamp: number;
    accessCount: number;
}
/**
 * 虚拟化管理器
 * 提供全局的虚拟化性能优化和资源管理
 */
export declare class VirtualizationManager extends EventEmitter {
    private static instance;
    private config;
    private instances;
    private itemCaches;
    private renderTimers;
    private scrollTimers;
    private updateQueues;
    private metrics;
    private performanceObserver;
    private isMonitoring;
    private memoryManager;
    private lastMemoryOptimization;
    private memoryOptimizationInterval;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): VirtualizationManager;
    /**
     * 注册虚拟化实例
     */
    registerInstance(id: string, type: 'list' | 'table', config?: Partial<VirtualizationInstance>): VirtualizationInstance;
    /**
     * 注销虚拟化实例
     */
    unregisterInstance(id: string): void;
    /**
     * 更新实例状态
     */
    updateInstance(id: string, updates: Partial<VirtualizationInstance>): void;
    /**
     * 计算可见范围
     */
    calculateVisibleRange(id: string, scrollTop: number, containerHeight: number, itemCount: number): {
        start: number;
        end: number;
    };
    /**
     * 查找起始索引（动态高度）
     */
    private findStartIndex;
    /**
     * 查找结束索引（动态高度）
     */
    private findEndIndex;
    /**
     * 缓存项目数据
     */
    cacheItem(id: string, index: number, data: any, height: number): void;
    /**
     * 获取缓存项目
     */
    getCachedItem(id: string, index: number): ItemCache | null;
    /**
     * 批量更新项目
     */
    batchUpdate(id: string, updates: any[]): void;
    /**
     * 处理更新
     */
    private processUpdates;
    /**
     * 处理滚动事件
     */
    handleScroll(id: string, scrollTop: number, isScrolling: boolean): void;
    /**
     * 节流滚动更新
     */
    private throttledScrollUpdate;
    /**
     * 更新滚动指标
     */
    private updateScrollMetrics;
    /**
     * 更新性能指标
     */
    private updateMetrics;
    /**
     * 估算实例内存使用
     */
    private estimateInstanceMemoryUsage;
    /**
     * 清理实例缓存
     */
    private clearInstanceCache;
    /**
     * 驱逐最旧的缓存项
     */
    private evictOldestCacheItems;
    /**
     * 设置性能监控
     */
    private setupPerformanceMonitoring;
    /**
     * 开始内存优化
     */
    private startMemoryOptimization;
    /**
     * 优化内存使用
     */
    private optimizeMemoryUsage;
    /**
     * 获取实例状态
     */
    getInstanceState(id: string): VirtualizationInstance | null;
    /**
     * 获取性能指标
     */
    getMetrics(id?: string): VirtualizationMetrics | VirtualizationMetrics[] | null;
    /**
     * 获取全局统计
     */
    getGlobalStats(): any;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<VirtualizationConfig>): void;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
export declare const virtualizationManager: VirtualizationManager;
export default VirtualizationManager;
//# sourceMappingURL=VirtualizationManager.d.ts.map
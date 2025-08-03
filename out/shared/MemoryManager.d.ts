/**
 * MemoryManager - 内存管理优化系统
 * 防止内存泄漏和GC压力，基于Serial-Studio的高性能内存管理设计
 */
/**
 * 内存池配置
 */
export interface MemoryPoolConfig {
    initialSize: number;
    maxSize: number;
    growthFactor: number;
    shrinkThreshold: number;
    itemConstructor: () => any;
    itemDestructor?: (item: any) => void;
}
/**
 * 内存统计信息
 */
export interface MemoryStats {
    totalAllocated: number;
    totalUsed: number;
    totalFree: number;
    gcCount: number;
    gcTime: number;
    memoryPressure: number;
    poolStats: {
        [key: string]: PoolStats;
    };
}
/**
 * 内存池统计
 */
export interface PoolStats {
    size: number;
    used: number;
    free: number;
    hits: number;
    misses: number;
    hitRate: number;
}
/**
 * 对象池
 * 重用对象实例，减少GC压力
 */
export declare class ObjectPool<T> {
    private pool;
    private inUse;
    private config;
    private stats;
    constructor(config: MemoryPoolConfig);
    /**
     * 初始化对象池
     */
    private initializePool;
    /**
     * 获取对象
     */
    acquire(): T;
    /**
     * 释放对象
     */
    release(item: T): void;
    /**
     * 重置对象状态
     */
    private resetItem;
    /**
     * 检查是否需要收缩
     */
    private shouldShrink;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 获取统计信息
     */
    getStats(): PoolStats;
    /**
     * 清空池
     */
    clear(): void;
}
/**
 * 缓冲区池
 * 专门管理字节数组的重用
 */
export declare class BufferPool {
    private pools;
    private commonSizes;
    private bufferToOriginal;
    constructor();
    /**
     * 为指定大小创建池
     */
    private createPoolForSize;
    /**
     * 获取缓冲区
     */
    acquire(size: number): Uint8Array;
    /**
     * 释放缓冲区
     */
    release(buffer: Uint8Array): void;
    /**
     * 查找最合适的池尺寸
     */
    private findBestSize;
    /**
     * 向上取整到二的幂次
     */
    private roundUpToPowerOfTwo;
    /**
     * 获取所有池的统计
     */
    getAllStats(): {
        [size: number]: PoolStats;
    };
    /**
     * 清理所有池
     */
    clear(): void;
}
/**
 * 弱引用管理器
 * 防止循环引用和内存泄漏
 */
export declare class WeakReferenceManager {
    private weakRefs;
    private cleanupCallbacks;
    private cleanupTimer;
    constructor();
    /**
     * 添加弱引用
     */
    addWeakRef<T extends object>(target: T, cleanupCallback?: () => void): WeakRef<T>;
    /**
     * 移除弱引用
     */
    removeWeakRef(weakRef: WeakRef<any>): void;
    /**
     * 开始清理定时器
     */
    private startCleanupTimer;
    /**
     * 清理已被回收的引用
     */
    private cleanup;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalRefs: number;
        activeRefs: number;
        inactiveRefs: number;
        cleanupCallbacks: number;
    };
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 内存管理器主类
 * 统一管理所有内存优化组件
 */
export declare class MemoryManager {
    private objectPools;
    private bufferPool;
    private weakRefManager;
    private gcObserver;
    private memoryStats;
    private lastGCTime;
    private gcCount;
    constructor();
    /**
     * 初始化GC观察器
     */
    private initializeGCObserver;
    /**
     * 开始内存监控
     */
    private startMemoryMonitoring;
    /**
     * 创建对象池
     */
    createObjectPool<T>(name: string, config: MemoryPoolConfig): ObjectPool<T>;
    /**
     * 获取对象池
     */
    getObjectPool<T>(name: string): ObjectPool<T> | null;
    /**
     * 获取缓冲区池
     */
    getBufferPool(): BufferPool;
    /**
     * 获取弱引用管理器
     */
    getWeakRefManager(): WeakReferenceManager;
    /**
     * 更新内存统计
     */
    private updateMemoryStats;
    /**
     * 获取内存统计
     */
    getMemoryStats(): MemoryStats;
    /**
     * 强制进行垃圾回收
     */
    forceGC(): void;
    /**
     * 内存压力缓解
     */
    relieveMemoryPressure(): void;
    /**
     * 检查内存泄漏
     */
    checkMemoryLeaks(): {
        potentialLeaks: string[];
        recommendations: string[];
    };
    /**
     * 优化内存使用
     */
    optimize(): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 获取全局内存管理器实例
 */
export declare function getMemoryManager(): MemoryManager;
export default MemoryManager;
//# sourceMappingURL=MemoryManager.d.ts.map
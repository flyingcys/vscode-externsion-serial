/**
 * CircularBuffer - 基于Serial-Studio的CircularBuffer.h设计
 * 高性能环形缓冲区实现，支持KMP模式匹配
 */
/**
 * 高性能环形缓冲区实现
 * 模拟Serial-Studio的CircularBuffer模板类
 * 支持零拷贝操作和线程安全机制
 */
export declare class CircularBuffer {
    private buffer;
    private head;
    private tail;
    private _size;
    private _capacity;
    private operationLock;
    private readonly lockTimeout;
    constructor(capacity?: number);
    /**
     * 获取操作锁（模拟原子操作）
     * 对应Serial-Studio的原子操作机制
     */
    private acquireLock;
    /**
     * 释放操作锁
     */
    private releaseLock;
    /**
     * 线程安全的操作包装器
     */
    private safeOperation;
    /**
     * 直接访问缓冲区元素
     */
    at(index: number): number;
    /**
     * 清空缓冲区
     */
    clear(): void;
    /**
     * 追加数据到缓冲区
     * 完整实现Serial-Studio的append逻辑
     */
    append(data: Uint8Array): void;
    /**
     * 设置缓冲区容量
     */
    setCapacity(capacity: number): void;
    /**
     * 获取当前数据大小
     */
    get size(): number;
    /**
     * 获取缓冲区容量
     */
    get capacity(): number;
    /**
     * 获取空闲空间
     */
    get freeSpace(): number;
    /**
     * 读取数据（从缓冲区中移除） - 优化版本
     * 支持零拷贝操作，对应Serial-Studio的移动语义
     */
    read(size: number): Uint8Array;
    /**
     * 零拷贝读取数据（不移除）- 新增方法
     * 返回数据的直接视图，避免内存复制
     * 注意：返回的数据可能被后续写入操作覆盖
     */
    readZeroCopy(size: number): Uint8Array | null;
    /**
     * 窥探数据（不从缓冲区移除）
     */
    peek(size: number): Uint8Array;
    /**
     * 使用KMP算法查找模式
     * 完整实现Serial-Studio的findPatternKMP方法
     */
    findPatternKMP(pattern: Uint8Array, pos?: number): number;
    /**
     * 查找所有模式匹配位置
     */
    findAllPatterns(pattern: Uint8Array): number[];
    /**
     * 获取缓冲区统计信息
     */
    getStats(): {
        size: number;
        capacity: number;
        freeSpace: number;
        head: number;
        tail: number;
        utilizationPercent: number;
    };
    /**
     * 导出所有数据为连续数组（用于调试）
     */
    toArray(): Uint8Array;
    /**
     * 检查缓冲区是否为空
     */
    get isEmpty(): boolean;
    /**
     * 检查缓冲区是否已满
     */
    get isFull(): boolean;
    /**
     * 线程安全的追加操作
     * 对应Serial-Studio的线程安全写入
     */
    appendSafe(data: Uint8Array): Promise<void>;
    /**
     * 线程安全的读取操作
     * 对应Serial-Studio的线程安全读取
     */
    readSafe(size: number): Promise<Uint8Array>;
    /**
     * 尝试进行零拷贝读取（非阻塞）
     * 对应Serial-Studio的try_dequeue操作
     */
    tryReadZeroCopy(size: number): Uint8Array | null;
    /**
     * 获取连续可读数据的最大大小
     * 用于优化零拷贝操作
     */
    getMaxContiguousRead(): number;
    /**
     * 获取连续可写空间的最大大小
     * 用于优化写入操作
     */
    getMaxContiguousWrite(): number;
    /**
     * 高级零拷贝操作：直接获取内部缓冲区的读写视图
     * 注意：这是危险操作，调用者必须确保正确使用
     */
    getReadView(): {
        data: Uint8Array;
        length: number;
    } | null;
    /**
     * 高级零拷贝操作：直接获取内部缓冲区的写入视图
     * 注意：这是危险操作，调用者必须确保正确使用
     */
    getWriteView(): {
        data: Uint8Array;
        length: number;
    } | null;
    /**
     * 提交写入操作（与getWriteView配合使用）
     * 调用者写入数据后必须调用此方法更新内部状态
     */
    commitWrite(bytesWritten: number): void;
    /**
     * 提交读取操作（与getReadView配合使用）
     * 调用者读取数据后必须调用此方法更新内部状态
     */
    commitRead(bytesRead: number): void;
    /**
     * 获取缓冲区性能统计信息
     * 对应Serial-Studio的性能监控
     */
    getPerformanceStats(): {
        maxContiguousRead: number;
        maxContiguousWrite: number;
        memoryEfficiency: number;
        fragmentationLevel: string;
        size: number;
        capacity: number;
        freeSpace: number;
        head: number;
        tail: number;
        utilizationPercent: number;
    };
}
export default CircularBuffer;
//# sourceMappingURL=CircularBuffer.d.ts.map
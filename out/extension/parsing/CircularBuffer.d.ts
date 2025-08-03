/**
 * CircularBuffer implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's IO/CircularBuffer.h design
 */
/// <reference types="node" />
/// <reference types="node" />
/**
 * 高性能环形缓冲区实现
 * 基于Serial-Studio的CircularBuffer设计，支持KMP字符串匹配算法
 */
export declare class CircularBuffer {
    private buffer;
    private head;
    private tail;
    private _size;
    private readonly capacity;
    constructor(capacity: number);
    /**
     * 向缓冲区追加数据
     * @param data 要追加的数据
     */
    append(data: Buffer): void;
    /**
     * 向缓冲区追加数据 (兼容性别名)
     * @param data 要追加的数据
     */
    write(data: Buffer): void;
    /**
     * 读取指定长度的数据并从缓冲区中移除
     * @param length 要读取的字节数
     * @returns 读取的数据
     */
    read(length: number): Buffer;
    /**
     * 查看指定长度的数据但不从缓冲区中移除
     * @param length 要查看的字节数
     * @returns 查看的数据
     */
    peek(length: number): Buffer;
    /**
     * 使用KMP算法查找模式在缓冲区中的位置
     * @param pattern 要查找的模式
     * @param startIndex 开始查找的位置（可选）
     * @returns 模式在缓冲区中的位置，如果未找到返回-1
     */
    findPatternKMP(pattern: Buffer, startIndex?: number): number;
    /**
     * 查找模式在缓冲区中的位置 (兼容性别名)
     * @param pattern 要查找的模式
     * @param startIndex 开始查找的位置（可选）
     * @returns 模式在缓冲区中的位置，如果未找到返回-1
     */
    findPattern(pattern: Buffer, startIndex?: number): number;
    /**
     * 构建KMP算法的最长前缀后缀数组
     * @param pattern 模式字符串
     * @returns LPS数组
     */
    private buildLPSArray;
    /**
     * 获取缓冲区当前大小
     */
    getSize(): number;
    /**
     * 获取缓冲区当前大小 (兼容性别名)
     */
    get size(): number;
    /**
     * 获取缓冲区容量
     */
    getCapacity(): number;
    /**
     * 检查缓冲区是否为空
     */
    isEmpty(): boolean;
    /**
     * 检查缓冲区是否已满
     */
    isFull(): boolean;
    /**
     * 清空缓冲区
     */
    clear(): void;
    /**
     * 获取缓冲区利用率百分比
     */
    getUtilization(): number;
}
//# sourceMappingURL=CircularBuffer.d.ts.map
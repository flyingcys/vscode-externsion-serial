"use strict";
/**
 * CircularBuffer implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's IO/CircularBuffer.h design
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularBuffer = void 0;
/**
 * 高性能环形缓冲区实现
 * 基于Serial-Studio的CircularBuffer设计，支持KMP字符串匹配算法
 */
class CircularBuffer {
    buffer;
    head = 0;
    tail = 0;
    _size = 0;
    capacity;
    constructor(capacity) {
        this.capacity = capacity;
        this.buffer = Buffer.alloc(capacity);
    }
    /**
     * 向缓冲区追加数据
     * @param data 要追加的数据
     */
    append(data) {
        for (let i = 0; i < data.length; i++) {
            this.buffer[this.tail] = data[i];
            this.tail = (this.tail + 1) % this.capacity;
            if (this._size === this.capacity) {
                // 缓冲区已满，覆盖最旧的数据
                this.head = (this.head + 1) % this.capacity;
            }
            else {
                this._size++;
            }
        }
    }
    /**
     * 向缓冲区追加数据 (兼容性别名)
     * @param data 要追加的数据
     */
    write(data) {
        this.append(data);
    }
    /**
     * 读取指定长度的数据并从缓冲区中移除
     * @param length 要读取的字节数
     * @returns 读取的数据
     */
    read(length) {
        const actualLength = Math.min(length, this._size);
        const result = Buffer.alloc(actualLength);
        for (let i = 0; i < actualLength; i++) {
            result[i] = this.buffer[(this.head + i) % this.capacity];
        }
        this.head = (this.head + actualLength) % this.capacity;
        this._size -= actualLength;
        return result;
    }
    /**
     * 查看指定长度的数据但不从缓冲区中移除
     * @param length 要查看的字节数
     * @returns 查看的数据
     */
    peek(length) {
        const actualLength = Math.min(length, this._size);
        const result = Buffer.alloc(actualLength);
        for (let i = 0; i < actualLength; i++) {
            result[i] = this.buffer[(this.head + i) % this.capacity];
        }
        return result;
    }
    /**
     * 使用KMP算法查找模式在缓冲区中的位置
     * @param pattern 要查找的模式
     * @param startIndex 开始查找的位置（可选）
     * @returns 模式在缓冲区中的位置，如果未找到返回-1
     */
    findPatternKMP(pattern, startIndex = 0) {
        if (pattern.length === 0 || pattern.length > this._size - startIndex) {
            return -1;
        }
        // 构建KMP失效函数表
        const lps = this.buildLPSArray(pattern);
        let textIndex = startIndex;
        let patternIndex = 0;
        while (textIndex < this._size) {
            const textChar = this.buffer[(this.head + textIndex) % this.capacity];
            const patternChar = pattern[patternIndex];
            if (textChar === patternChar) {
                textIndex++;
                patternIndex++;
            }
            if (patternIndex === pattern.length) {
                // 找到匹配
                return textIndex - patternIndex;
            }
            else if (textIndex < this._size && textChar !== patternChar) {
                if (patternIndex !== 0) {
                    patternIndex = lps[patternIndex - 1];
                }
                else {
                    textIndex++;
                }
            }
        }
        return -1;
    }
    /**
     * 查找模式在缓冲区中的位置 (兼容性别名)
     * @param pattern 要查找的模式
     * @param startIndex 开始查找的位置（可选）
     * @returns 模式在缓冲区中的位置，如果未找到返回-1
     */
    findPattern(pattern, startIndex = 0) {
        return this.findPatternKMP(pattern, startIndex);
    }
    /**
     * 构建KMP算法的最长前缀后缀数组
     * @param pattern 模式字符串
     * @returns LPS数组
     */
    buildLPSArray(pattern) {
        const lps = new Array(pattern.length).fill(0);
        let length = 0;
        let i = 1;
        while (i < pattern.length) {
            if (pattern[i] === pattern[length]) {
                length++;
                lps[i] = length;
                i++;
            }
            else {
                if (length !== 0) {
                    length = lps[length - 1];
                }
                else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }
    /**
     * 获取缓冲区当前大小
     */
    getSize() {
        return this._size;
    }
    /**
     * 获取缓冲区当前大小 (兼容性别名)
     */
    get size() {
        return this._size;
    }
    /**
     * 获取缓冲区容量
     */
    getCapacity() {
        return this.capacity;
    }
    /**
     * 检查缓冲区是否为空
     */
    isEmpty() {
        return this._size === 0;
    }
    /**
     * 检查缓冲区是否已满
     */
    isFull() {
        return this._size === this.capacity;
    }
    /**
     * 清空缓冲区
     */
    clear() {
        this.head = 0;
        this.tail = 0;
        this._size = 0;
    }
    /**
     * 获取缓冲区利用率百分比
     */
    getUtilization() {
        return (this._size / this.capacity) * 100;
    }
}
exports.CircularBuffer = CircularBuffer;
//# sourceMappingURL=CircularBuffer.js.map
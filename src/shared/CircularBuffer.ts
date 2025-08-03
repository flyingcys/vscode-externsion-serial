/**
 * CircularBuffer - 基于Serial-Studio的CircularBuffer.h设计
 * 高性能环形缓冲区实现，支持KMP模式匹配
 */

/**
 * KMP算法的部分匹配表计算
 */
function computeKMPTable(pattern: Uint8Array): number[] {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0;
  let i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i++] = len;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }

  return lps;
}

/**
 * 高性能环形缓冲区实现
 * 模拟Serial-Studio的CircularBuffer模板类
 * 支持零拷贝操作和线程安全机制
 */
export class CircularBuffer {
  private buffer: Uint8Array;
  private head: number = 0;
  private tail: number = 0;
  private _size: number = 0;
  private _capacity: number;
  
  // 模拟原子操作的锁机制（JavaScript中的简化版本）
  private operationLock: boolean = false;
  private readonly lockTimeout: number = 1000; // 1秒超时

  constructor(capacity: number = 1024 * 1024 * 10) {
    this._capacity = capacity;
    this.buffer = new Uint8Array(capacity);
  }

  /**
   * 获取操作锁（模拟原子操作）
   * 对应Serial-Studio的原子操作机制
   */
  private async acquireLock(): Promise<void> {
    const startTime = Date.now();
    
    while (this.operationLock) {
      if (Date.now() - startTime > this.lockTimeout) {
        throw new Error('CircularBuffer operation timeout - possible deadlock');
      }
      // 简单的忙等待，在实际应用中可以用更复杂的机制
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    this.operationLock = true;
  }

  /**
   * 释放操作锁
   */
  private releaseLock(): void {
    this.operationLock = false;
  }

  /**
   * 线程安全的操作包装器
   */
  private async safeOperation<T>(operation: () => T): Promise<T> {
    await this.acquireLock();
    try {
      return operation();
    } finally {
      this.releaseLock();
    }
  }

  /**
   * 直接访问缓冲区元素
   */
  at(index: number): number {
    if (index < 0 || index >= this._size) {
      throw new Error('Index out of range');
    }
    const effectiveIndex = (this.head + index) % this._capacity;
    return this.buffer[effectiveIndex];
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    this._size = 0;
    this.head = 0;
    this.tail = 0;
  }

  /**
   * 追加数据到缓冲区
   * 完整实现Serial-Studio的append逻辑
   */
  append(data: Uint8Array): void {
    const dataSize = data.length;
    if (dataSize === 0) {return;}

    let src = data;
    let copySize = dataSize;

    // 如果输入数据过大，只保留能容纳的最后部分
    if (copySize > this._capacity) {
      const offset = copySize - this._capacity;
      src = data.slice(offset);
      copySize = this._capacity;
    }

    // 如果空间不足，推进head指针覆盖旧数据
    if (copySize > this.freeSpace) {
      const overwrite = copySize - this.freeSpace;
      this.head = (this.head + overwrite) % this._capacity;
      this._size -= overwrite;
    }

    // 复制第一块数据（可能跨越缓冲区边界）
    const firstChunk = Math.min(copySize, this._capacity - this.tail);
    this.buffer.set(src.slice(0, firstChunk), this.tail);

    // 复制第二块数据（如果有回卷）
    if (copySize > firstChunk) {
      this.buffer.set(src.slice(firstChunk), 0);
    }

    // 更新tail指针和大小
    this.tail = (this.tail + copySize) % this._capacity;
    this._size = Math.min(this._size + copySize, this._capacity);
  }

  /**
   * 设置缓冲区容量
   */
  setCapacity(capacity: number): void {
    this.clear();
    this._capacity = capacity;
    this.buffer = new Uint8Array(capacity);
  }

  /**
   * 获取当前数据大小
   */
  get size(): number {
    return this._size;
  }

  /**
   * 获取缓冲区容量
   */
  get capacity(): number {
    return this._capacity;
  }

  /**
   * 获取空闲空间
   */
  get freeSpace(): number {
    return this._capacity - this._size;
  }

  /**
   * 读取数据（从缓冲区中移除） - 优化版本
   * 支持零拷贝操作，对应Serial-Studio的移动语义
   */
  read(size: number): Uint8Array {
    if (size > this._size) {
      throw new Error('Not enough data in buffer');
    }

    // 优化：如果请求的数据在连续内存中，直接返回视图（零拷贝）
    const firstChunk = Math.min(size, this._capacity - this.head);
    
    if (size === firstChunk) {
      // 数据连续，可以进行零拷贝优化
      const result = this.buffer.subarray(this.head, this.head + size);
      this.head = (this.head + size) % this._capacity;
      this._size -= size;
      return result;
    } else {
      // 数据跨越边界，需要复制
      const result = new Uint8Array(size);
      
      // 复制第一块
      result.set(this.buffer.subarray(this.head, this.head + firstChunk), 0);

      // 复制第二块（如果有回卷）
      if (size > firstChunk) {
        result.set(this.buffer.subarray(0, size - firstChunk), firstChunk);
      }

      this.head = (this.head + size) % this._capacity;
      this._size -= size;

      return result;
    }
  }

  /**
   * 零拷贝读取数据（不移除）- 新增方法
   * 返回数据的直接视图，避免内存复制
   * 注意：返回的数据可能被后续写入操作覆盖
   */
  readZeroCopy(size: number): Uint8Array | null {
    if (size > this._size) {
      return null;
    }

    const firstChunk = Math.min(size, this._capacity - this.head);
    
    if (size === firstChunk) {
      // 数据连续，返回直接视图
      return this.buffer.subarray(this.head, this.head + size);
    }
    
    // 数据不连续，无法进行零拷贝
    return null;
  }

  /**
   * 窥探数据（不从缓冲区移除）
   */
  peek(size: number): Uint8Array {
    const actualSize = Math.min(size, this._size);
    const result = new Uint8Array(actualSize);
    
    const firstChunk = Math.min(actualSize, this._capacity - this.head);
    
    // 复制第一块
    result.set(this.buffer.slice(this.head, this.head + firstChunk), 0);

    // 复制第二块（如果有回卷）
    if (actualSize > firstChunk) {
      result.set(this.buffer.slice(0, actualSize - firstChunk), firstChunk);
    }

    return result;
  }

  /**
   * 使用KMP算法查找模式
   * 完整实现Serial-Studio的findPatternKMP方法
   */
  findPatternKMP(pattern: Uint8Array, pos: number = 0): number {
    // 验证搜索模式
    if (pattern.length === 0 || this._size < pattern.length) {
      return -1;
    }

    // 从指定位置开始搜索
    const lps = computeKMPTable(pattern);
    let bufferIdx = (this.head + pos) % this._capacity;
    let i = pos;
    let j = 0;

    while (i < this._size) {
      // 比较当前缓冲区字符与模式
      if (this.buffer[bufferIdx] === pattern[j]) {
        i++;
        j++;
        bufferIdx = (bufferIdx + 1) % this._capacity;

        // 如果整个模式匹配，返回逻辑起始索引
        if (j === pattern.length) {
          return i - j;
        }
      }
      // 在一些匹配后发生不匹配，在模式中回退
      else if (j !== 0) {
        j = lps[j - 1];
      }
      // 在开始处不匹配，向前移动
      else {
        i++;
        bufferIdx = (bufferIdx + 1) % this._capacity;
      }
    }

    // 未找到模式
    return -1;
  }

  /**
   * 查找所有模式匹配位置
   */
  findAllPatterns(pattern: Uint8Array): number[] {
    const positions: number[] = [];
    let pos = 0;
    
    while (pos < this._size) {
      const found = this.findPatternKMP(pattern, pos);
      if (found === -1) {break;}
      
      positions.push(found);
      pos = found + 1; // 继续搜索
    }
    
    return positions;
  }

  /**
   * 获取缓冲区统计信息
   */
  getStats() {
    return {
      size: this._size,
      capacity: this._capacity,
      freeSpace: this.freeSpace,
      head: this.head,
      tail: this.tail,
      utilizationPercent: (this._size / this._capacity) * 100
    };
  }

  /**
   * 导出所有数据为连续数组（用于调试）
   */
  toArray(): Uint8Array {
    return this.peek(this._size);
  }

  /**
   * 检查缓冲区是否为空
   */
  get isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * 检查缓冲区是否已满
   */
  get isFull(): boolean {
    return this._size === this._capacity;
  }

  /**
   * 线程安全的追加操作
   * 对应Serial-Studio的线程安全写入
   */
  async appendSafe(data: Uint8Array): Promise<void> {
    await this.safeOperation(() => {
      this.append(data);
    });
  }

  /**
   * 线程安全的读取操作
   * 对应Serial-Studio的线程安全读取
   */
  async readSafe(size: number): Promise<Uint8Array> {
    return await this.safeOperation(() => {
      return this.read(size);
    });
  }

  /**
   * 尝试进行零拷贝读取（非阻塞）
   * 对应Serial-Studio的try_dequeue操作
   */
  tryReadZeroCopy(size: number): Uint8Array | null {
    if (this.operationLock) {
      return null; // 如果正在进行其他操作，立即返回
    }
    
    return this.readZeroCopy(size);
  }

  /**
   * 获取连续可读数据的最大大小
   * 用于优化零拷贝操作
   */
  getMaxContiguousRead(): number {
    if (this._size === 0) {return 0;}
    
    return Math.min(this._size, this._capacity - this.head);
  }

  /**
   * 获取连续可写空间的最大大小
   * 用于优化写入操作
   */
  getMaxContiguousWrite(): number {
    if (this.isFull) {return 0;}
    
    const freeSpace = this.freeSpace;
    return Math.min(freeSpace, this._capacity - this.tail);
  }

  /**
   * 高级零拷贝操作：直接获取内部缓冲区的读写视图
   * 注意：这是危险操作，调用者必须确保正确使用
   */
  getReadView(): { data: Uint8Array; length: number } | null {
    if (this._size === 0) {return null;}
    
    const contiguousSize = this.getMaxContiguousRead();
    return {
      data: this.buffer.subarray(this.head, this.head + contiguousSize),
      length: contiguousSize
    };
  }

  /**
   * 高级零拷贝操作：直接获取内部缓冲区的写入视图
   * 注意：这是危险操作，调用者必须确保正确使用
   */
  getWriteView(): { data: Uint8Array; length: number } | null {
    if (this.isFull) {return null;}
    
    const contiguousSize = this.getMaxContiguousWrite();
    return {
      data: this.buffer.subarray(this.tail, this.tail + contiguousSize),
      length: contiguousSize
    };
  }

  /**
   * 提交写入操作（与getWriteView配合使用）
   * 调用者写入数据后必须调用此方法更新内部状态
   */
  commitWrite(bytesWritten: number): void {
    if (bytesWritten <= 0 || bytesWritten > this.getMaxContiguousWrite()) {
      throw new Error('Invalid commit size');
    }
    
    this.tail = (this.tail + bytesWritten) % this._capacity;
    this._size = Math.min(this._size + bytesWritten, this._capacity);
  }

  /**
   * 提交读取操作（与getReadView配合使用）
   * 调用者读取数据后必须调用此方法更新内部状态
   */
  commitRead(bytesRead: number): void {
    if (bytesRead <= 0 || bytesRead > this.getMaxContiguousRead()) {
      throw new Error('Invalid commit size');
    }
    
    this.head = (this.head + bytesRead) % this._capacity;
    this._size -= bytesRead;
  }

  /**
   * 获取缓冲区性能统计信息
   * 对应Serial-Studio的性能监控
   */
  getPerformanceStats() {
    return {
      ...this.getStats(),
      maxContiguousRead: this.getMaxContiguousRead(),
      maxContiguousWrite: this.getMaxContiguousWrite(),
      memoryEfficiency: (this._size / this._capacity) * 100,
      fragmentationLevel: this.head !== 0 || this.tail !== this._size ? 'fragmented' : 'linear'
    };
  }
}

export default CircularBuffer;

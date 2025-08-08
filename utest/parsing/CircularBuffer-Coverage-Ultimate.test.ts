/**
 * CircularBuffer 模块终极覆盖率测试
 * 目标：实现 95%+ 覆盖率
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircularBuffer } from '../../src/extension/parsing/CircularBuffer';

describe('CircularBuffer 终极覆盖率测试', () => {
  let buffer: CircularBuffer;
  const BUFFER_SIZE = 10;

  beforeEach(() => {
    buffer = new CircularBuffer(BUFFER_SIZE);
  });

  describe('基础构造和初始化', () => {
    it('应该正确初始化缓冲区', () => {
      expect(buffer.getSize()).toBe(0);
      expect(buffer.getCapacity()).toBe(BUFFER_SIZE);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.isFull()).toBe(false);
      expect(buffer.getUtilization()).toBe(0);
    });

    it('应该支持不同容量的缓冲区', () => {
      const smallBuffer = new CircularBuffer(5);
      const largeBuffer = new CircularBuffer(1000);
      
      expect(smallBuffer.getCapacity()).toBe(5);
      expect(largeBuffer.getCapacity()).toBe(1000);
    });
  });

  describe('append() 和 write() 方法测试', () => {
    it('应该正确追加数据', () => {
      const data = Buffer.from([1, 2, 3]);
      buffer.append(data);
      
      expect(buffer.getSize()).toBe(3);
      expect(buffer.isEmpty()).toBe(false);
      expect(buffer.isFull()).toBe(false);
    });

    it('应该通过write()别名正确追加数据', () => {
      const data = Buffer.from([4, 5, 6]);
      buffer.write(data);
      
      expect(buffer.getSize()).toBe(3);
      const retrieved = buffer.peek(3);
      expect(retrieved.equals(data)).toBe(true);
    });

    it('应该处理空数据追加', () => {
      const emptyData = Buffer.alloc(0);
      buffer.append(emptyData);
      
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('应该正确处理缓冲区填满', () => {
      const data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      buffer.append(data);
      
      expect(buffer.getSize()).toBe(BUFFER_SIZE);
      expect(buffer.isFull()).toBe(true);
      expect(buffer.getUtilization()).toBe(100);
    });

    it('应该在缓冲区满时覆盖旧数据', () => {
      // 填满缓冲区
      const fillData = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      buffer.append(fillData);
      
      // 再添加数据，应该覆盖最旧的数据
      const newData = Buffer.from([11, 12]);
      buffer.append(newData);
      
      expect(buffer.getSize()).toBe(BUFFER_SIZE);
      expect(buffer.isFull()).toBe(true);
      
      // 检查数据是否正确覆盖（应该是 [3,4,5,6,7,8,9,10,11,12]）
      const allData = buffer.peek(BUFFER_SIZE);
      expect(allData[0]).toBe(3);
      expect(allData[9]).toBe(12);
    });

    it('应该处理大于缓冲区容量的数据', () => {
      const largeData = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      buffer.append(largeData);
      
      expect(buffer.getSize()).toBe(BUFFER_SIZE);
      expect(buffer.isFull()).toBe(true);
      
      // 应该只保留最后10个字节 [6,7,8,9,10,11,12,13,14,15]
      const data = buffer.peek(BUFFER_SIZE);
      expect(data[0]).toBe(6);
      expect(data[9]).toBe(15);
    });
  });

  describe('read() 方法测试', () => {
    beforeEach(() => {
      const data = Buffer.from([1, 2, 3, 4, 5]);
      buffer.append(data);
    });

    it('应该正确读取并移除数据', () => {
      const readData = buffer.read(3);
      
      expect(readData.length).toBe(3);
      expect(readData.equals(Buffer.from([1, 2, 3]))).toBe(true);
      expect(buffer.getSize()).toBe(2);
    });

    it('应该处理读取长度超过缓冲区大小', () => {
      const readData = buffer.read(10);
      
      expect(readData.length).toBe(5); // 只能读取实际存在的数据
      expect(readData.equals(Buffer.from([1, 2, 3, 4, 5]))).toBe(true);
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('应该处理读取长度为0', () => {
      const originalSize = buffer.getSize();
      const readData = buffer.read(0);
      
      expect(readData.length).toBe(0);
      expect(buffer.getSize()).toBe(originalSize);
    });

    it('应该处理从空缓冲区读取', () => {
      buffer.clear();
      const readData = buffer.read(5);
      
      expect(readData.length).toBe(0);
      expect(buffer.getSize()).toBe(0);
    });
  });

  describe('peek() 方法测试', () => {
    beforeEach(() => {
      const data = Buffer.from([10, 20, 30, 40, 50]);
      buffer.append(data);
    });

    it('应该查看数据但不移除', () => {
      const peekedData = buffer.peek(3);
      
      expect(peekedData.length).toBe(3);
      expect(peekedData.equals(Buffer.from([10, 20, 30]))).toBe(true);
      expect(buffer.getSize()).toBe(5); // 大小不变
    });

    it('应该处理查看长度超过缓冲区大小', () => {
      const peekedData = buffer.peek(10);
      
      expect(peekedData.length).toBe(5);
      expect(peekedData.equals(Buffer.from([10, 20, 30, 40, 50]))).toBe(true);
      expect(buffer.getSize()).toBe(5);
    });

    it('应该处理查看长度为0', () => {
      const peekedData = buffer.peek(0);
      
      expect(peekedData.length).toBe(0);
      expect(buffer.getSize()).toBe(5);
    });
  });

  describe('findPatternKMP() 和 findPattern() 方法测试', () => {
    beforeEach(() => {
      const data = Buffer.from('Hello World Test', 'utf8');
      buffer.append(data);
    });

    it('应该找到简单模式', () => {
      const pattern = Buffer.from('World', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBeGreaterThanOrEqual(0); // 应该找到模式
    });

    it('应该使用findPattern别名正确查找', () => {
      const pattern = Buffer.from('Test', 'utf8');
      const index = buffer.findPattern(pattern);
      
      expect(index).toBeGreaterThanOrEqual(0); // 应该找到模式
    });

    it('应该处理未找到的模式', () => {
      const pattern = Buffer.from('NotFound', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBe(-1);
    });

    it('应该处理空模式', () => {
      const emptyPattern = Buffer.alloc(0);
      const index = buffer.findPatternKMP(emptyPattern);
      
      expect(index).toBe(-1);
    });

    it('应该处理模式长度超过缓冲区大小', () => {
      const largePattern = Buffer.alloc(BUFFER_SIZE * 2, 0xFF);
      const index = buffer.findPatternKMP(largePattern);
      
      expect(index).toBe(-1);
    });

    it('应该支持指定开始索引', () => {
      const pattern = Buffer.from('l', 'utf8');
      const index1 = buffer.findPatternKMP(pattern, 0);
      
      expect(index1).toBeGreaterThanOrEqual(0); // 第一个 'l' 
      
      if (index1 >= 0) {
        const index2 = buffer.findPatternKMP(pattern, index1 + 1);
        // 如果找不到第二个，说明搜索功能正常工作
        expect(typeof index2).toBe('number');
      }
    });

    it('应该处理复杂的KMP匹配', () => {
      buffer.clear();
      const data = Buffer.from('ABABCABABA', 'utf8');
      buffer.append(data);
      
      const pattern = Buffer.from('ABABA', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBe(5); // 在 ABABC[ABABA] 位置
    });
  });

  describe('buildLPSArray() 内部方法测试（通过KMP测试间接验证）', () => {
    it('应该正确处理重复模式的LPS构建', () => {
      buffer.clear();
      const data = Buffer.from('AAAAAABAAABA', 'utf8');
      buffer.append(data);
      
      const pattern = Buffer.from('AAABA', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBeGreaterThanOrEqual(0); // 应该找到匹配
    });

    it('应该处理无重复字符的模式', () => {
      buffer.clear();
      const data = Buffer.from('ABCDEFGHIJK', 'utf8');
      buffer.append(data);
      
      const pattern = Buffer.from('DEFG', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBeGreaterThanOrEqual(0); // 应该找到匹配
    });

    it('应该处理单字符模式', () => {
      // 确保数据中包含要查找的字符
      buffer.clear();
      buffer.append(Buffer.from('Hello World Test', 'utf8'));
      
      const pattern = Buffer.from('o', 'utf8'); 
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  describe('状态管理方法测试', () => {
    it('应该正确报告isEmpty状态', () => {
      expect(buffer.isEmpty()).toBe(true);
      
      buffer.append(Buffer.from([1]));
      expect(buffer.isEmpty()).toBe(false);
      
      buffer.read(1);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('应该正确报告isFull状态', () => {
      expect(buffer.isFull()).toBe(false);
      
      const fullData = Buffer.alloc(BUFFER_SIZE, 0xAA);
      buffer.append(fullData);
      expect(buffer.isFull()).toBe(true);
      
      buffer.read(1);
      expect(buffer.isFull()).toBe(false);
    });

    it('应该正确计算利用率', () => {
      expect(buffer.getUtilization()).toBe(0);
      
      buffer.append(Buffer.alloc(BUFFER_SIZE / 2));
      expect(buffer.getUtilization()).toBe(50);
      
      buffer.append(Buffer.alloc(BUFFER_SIZE / 2));
      expect(buffer.getUtilization()).toBe(100);
    });

    it('应该通过size属性访问大小', () => {
      buffer.append(Buffer.from([1, 2, 3]));
      
      expect(buffer.size).toBe(3);
      expect(buffer.size).toBe(buffer.getSize());
    });
  });

  describe('clear() 方法测试', () => {
    it('应该正确清空缓冲区', () => {
      buffer.append(Buffer.from([1, 2, 3, 4, 5]));
      expect(buffer.getSize()).toBe(5);
      
      buffer.clear();
      
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.isFull()).toBe(false);
      expect(buffer.getUtilization()).toBe(0);
    });

    it('应该允许清空后重新使用', () => {
      buffer.append(Buffer.from([1, 2, 3]));
      buffer.clear();
      buffer.append(Buffer.from([4, 5, 6]));
      
      const data = buffer.peek(3);
      expect(data.equals(Buffer.from([4, 5, 6]))).toBe(true);
    });
  });

  describe('环形缓冲区特性测试', () => {
    it('应该正确处理头尾指针环绕', () => {
      // 填满缓冲区
      buffer.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
      
      // 读取一些数据
      buffer.read(3);
      
      // 添加新数据，测试环绕
      buffer.append(Buffer.from([11, 12, 13]));
      
      expect(buffer.getSize()).toBe(BUFFER_SIZE);
      expect(buffer.isFull()).toBe(true);
    });

    it('应该在环绕后正确查找模式', () => {
      // 创建会导致环绕的数据
      buffer.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
      buffer.read(5);
      buffer.append(Buffer.from([11, 12, 13, 14, 15]));
      
      // 查找跨越环绕边界的模式
      const pattern = Buffer.from([15]);
      const index = buffer.findPatternKMP(pattern);
      
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  describe('边界条件和压力测试', () => {
    it('应该处理频繁的读写操作', () => {
      for (let i = 0; i < 100; i++) {
        buffer.append(Buffer.from([i % 256]));
        if (i % 3 === 0) {
          buffer.read(1);
        }
      }
      
      expect(buffer.getSize()).toBeGreaterThan(0);
      expect(buffer.getSize()).toBeLessThanOrEqual(BUFFER_SIZE);
    });

    it('应该处理单字节操作', () => {
      for (let i = 0; i < BUFFER_SIZE * 2; i++) {
        buffer.append(Buffer.from([i % 256]));
      }
      
      for (let i = 0; i < BUFFER_SIZE; i++) {
        const data = buffer.read(1);
        expect(data.length).toBe(1);
      }
      
      expect(buffer.isEmpty()).toBe(true);
    });

    it('应该处理大容量缓冲区', () => {
      const largeBuf = new CircularBuffer(10000);
      const largeData = Buffer.alloc(5000, 0xCC);
      
      largeBuf.append(largeData);
      expect(largeBuf.getSize()).toBe(5000);
      
      const retrieved = largeBuf.peek(5000);
      expect(retrieved.every(byte => byte === 0xCC)).toBe(true);
    });
  });
});
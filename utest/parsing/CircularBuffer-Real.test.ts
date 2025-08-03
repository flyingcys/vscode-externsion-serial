/**
 * CircularBuffer 真实源代码测试
 * 
 * 测试真实的CircularBuffer类，提升覆盖率
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircularBuffer } from '../../src/extension/parsing/CircularBuffer';

describe('CircularBuffer 真实源代码测试', () => {
  let buffer: CircularBuffer;

  describe('1. 基础功能测试', () => {
    beforeEach(() => {
      buffer = new CircularBuffer(10);
    });

    it('应该正确初始化CircularBuffer', () => {
      expect(buffer).toBeDefined();
      expect(buffer).toBeInstanceOf(CircularBuffer);
      expect(buffer.size).toBe(0);
      expect(buffer.getCapacity()).toBe(10);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.isFull()).toBe(false);
    });

    it('应该正确计算使用率', () => {
      expect(buffer.getUtilization()).toBe(0);
    });

    it('应该清空缓冲区', () => {
      buffer.clear();
      expect(buffer.size).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });
  });

  describe('2. 数据追加和读取测试', () => {
    beforeEach(() => {
      buffer = new CircularBuffer(10);
    });

    it('应该追加单个字节数据', () => {
      const data = Buffer.from([1, 2, 3]);
      buffer.append(data);
      
      expect(buffer.size).toBe(3);
      expect(buffer.isEmpty()).toBe(false);
      expect(buffer.getUtilization()).toBe(30); // 3/10 = 30%
    });

    it('应该使用write方法追加数据', () => {
      const data = Buffer.from([4, 5, 6]);
      buffer.write(data);
      
      expect(buffer.size).toBe(3);
    });

    it('应该读取指定长度数据', () => {
      const data = Buffer.from([1, 2, 3, 4, 5]);
      buffer.append(data);
      
      const result = buffer.read(3);
      expect(result).toEqual(Buffer.from([1, 2, 3]));
      expect(buffer.size).toBe(2);
    });

    it('应该处理读取长度超出数据大小', () => {
      const data = Buffer.from([1, 2, 3]);
      buffer.append(data);
      
      const result = buffer.read(5);
      expect(result).toEqual(Buffer.from([1, 2, 3]));
      expect(buffer.size).toBe(0);
    });

    it('应该支持peek操作（不移除数据）', () => {
      const data = Buffer.from([1, 2, 3, 4, 5]);
      buffer.append(data);
      
      const result = buffer.peek(3);
      expect(result).toEqual(Buffer.from([1, 2, 3]));
      expect(buffer.size).toBe(5); // 数据仍在缓冲区中
    });
  });

  describe('3. 环形缓冲区特性测试', () => {
    beforeEach(() => {
      buffer = new CircularBuffer(5);
    });

    it('应该处理缓冲区溢出（覆盖旧数据）', () => {
      // 填满缓冲区
      const data1 = Buffer.from([1, 2, 3, 4, 5]);
      buffer.append(data1);
      expect(buffer.size).toBe(5);
      expect(buffer.isFull()).toBe(true);
      
      // 添加更多数据，应该覆盖最旧的数据
      const data2 = Buffer.from([6, 7]);
      buffer.append(data2);
      expect(buffer.size).toBe(5);
      
      // 读取所有数据验证覆盖结果
      const result = buffer.read(5);
      expect(result).toEqual(Buffer.from([3, 4, 5, 6, 7]));
    });

    it('应该正确处理连续读写操作', () => {
      // 写入数据
      buffer.append(Buffer.from([1, 2, 3]));
      expect(buffer.size).toBe(3);
      
      // 读取部分数据
      const read1 = buffer.read(2);
      expect(read1).toEqual(Buffer.from([1, 2]));
      expect(buffer.size).toBe(1);
      
      // 写入更多数据
      buffer.append(Buffer.from([4, 5, 6]));
      expect(buffer.size).toBe(4);
      
      // 读取所有数据
      const readAll = buffer.read(10);
      expect(readAll).toEqual(Buffer.from([3, 4, 5, 6]));
      expect(buffer.size).toBe(0);
    });
  });

  describe('4. 字符串匹配测试', () => {
    beforeEach(() => {
      buffer = new CircularBuffer(20);
    });

    it('应该找到简单字符串模式', () => {
      const data = Buffer.from('Hello World Test');
      buffer.append(data);
      
      const result = buffer.findPattern(Buffer.from('World'));
      expect(result).toBe(6);
    });

    it('应该处理未找到的模式', () => {
      const data = Buffer.from('Hello World Test');
      buffer.append(data);
      
      const result = buffer.findPattern(Buffer.from('NotFound'));
      expect(result).toBe(-1);
    });

    it('应该使用KMP算法处理复杂模式', () => {
      const data = Buffer.from('ABABCABABA');
      buffer.append(data);
      
      const result = buffer.findPatternKMP(Buffer.from('ABABA'));
      expect(result).toBe(5);
    });

    it('应该处理模式在缓冲区边界的情况', () => {
      // 创建一个小缓冲区测试环形边界情况
      const smallBuffer = new CircularBuffer(10);
      
      // 填满缓冲区并覆盖
      smallBuffer.append(Buffer.from('0123456789'));
      smallBuffer.append(Buffer.from('ABCD')); // 覆盖前4个字符
      
      const result = smallBuffer.findPattern(Buffer.from('CD'));
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('5. 边界条件测试', () => {
    it('应该处理空缓冲区操作', () => {
      const emptyBuffer = new CircularBuffer(5);
      
      expect(emptyBuffer.read(5)).toEqual(Buffer.alloc(0));
      expect(emptyBuffer.findPattern(Buffer.from('test'))).toBe(-1);
    });

    it('应该处理单字节缓冲区', () => {
      const singleBuffer = new CircularBuffer(1);
      
      singleBuffer.append(Buffer.from([65])); // 'A'
      expect(singleBuffer.size).toBe(1);
      expect(singleBuffer.isFull()).toBe(true);
      
      const result = singleBuffer.read(1);
      expect(result).toEqual(Buffer.from([65]));
      expect(singleBuffer.isEmpty()).toBe(true);
    });

    it('应该处理零长度追加', () => {
      buffer = new CircularBuffer(5);
      const initialSize = buffer.size;
      
      buffer.append(Buffer.alloc(0));
      expect(buffer.size).toBe(initialSize);
    });
  });

  describe('6. 性能相关测试', () => {
    it('应该高效处理大量数据', () => {
      const largeBuffer = new CircularBuffer(1000);
      const testData = Buffer.alloc(500, 42); // 500字节的测试数据
      
      const start = performance.now();
      largeBuffer.append(testData);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(10); // 应该在10ms内完成
      expect(largeBuffer.size).toBe(500);
    });

    it('应该高效执行字符串搜索', () => {
      const searchBuffer = new CircularBuffer(1000);
      const testData = Buffer.from('A'.repeat(900) + 'TARGET' + 'B'.repeat(94));
      searchBuffer.append(testData);
      
      const start = performance.now();
      const result = searchBuffer.findPatternKMP(Buffer.from('TARGET'));
      const duration = performance.now() - start;
      
      expect(result).toBe(900);
      expect(duration).toBeLessThan(5); // KMP算法应该很快
    });
  });

  describe('7. 实际使用场景测试', () => {
    it('应该处理串口数据帧解析场景', () => {
      const frameBuffer = new CircularBuffer(100);
      
      // 模拟串口数据流
      frameBuffer.append(Buffer.from('temp=25.5\n'));
      frameBuffer.append(Buffer.from('hum=60.2\n'));
      frameBuffer.append(Buffer.from('press=1013.25\n'));
      
      // 查找第一个换行符
      let frameEnd = frameBuffer.findPattern(Buffer.from('\n'));
      expect(frameEnd).toBe(9); // temp=25.5\n 的位置
      
      // 提取第一帧
      const frame1 = frameBuffer.read(frameEnd + 1);
      expect(frame1.toString()).toBe('temp=25.5\n');
      
      // 查找下一个换行符
      frameEnd = frameBuffer.findPattern(Buffer.from('\n'));
      expect(frameEnd).toBe(8); // hum=60.2\n 在剩余数据中的位置
    });

    it('应该处理二进制协议解析', () => {
      const protocolBuffer = new CircularBuffer(50);
      
      // 模拟二进制协议：[START][LENGTH][DATA][CHECKSUM][END]
      const startMarker = Buffer.from([0xAA, 0x55]);
      const endMarker = Buffer.from([0x55, 0xAA]);
      
      protocolBuffer.append(Buffer.from([0x00, 0x01, 0x02])); // 噪声数据
      protocolBuffer.append(startMarker);
      protocolBuffer.append(Buffer.from([0x04])); // 长度
      protocolBuffer.append(Buffer.from([0x01, 0x02, 0x03, 0x04])); // 数据
      protocolBuffer.append(Buffer.from([0x0A])); // 校验和
      protocolBuffer.append(endMarker);
      
      // 查找帧开始
      const startPos = protocolBuffer.findPattern(startMarker);
      expect(startPos).toBe(3);
      
      // 跳过噪声数据
      protocolBuffer.read(startPos);
      
      // 查找帧结束
      const endPos = protocolBuffer.findPattern(endMarker);
      expect(endPos).toBeGreaterThan(0);
    });
  });
});
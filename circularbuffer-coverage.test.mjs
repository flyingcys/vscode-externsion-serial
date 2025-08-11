/**
 * CircularBuffer 模块真实覆盖率测试
 * 测试环形缓冲区的所有功能和边界条件
 */

import { describe, test, expect } from 'vitest';
import { CircularBuffer } from './src/extension/parsing/CircularBuffer.ts';

describe('CircularBuffer Complete Coverage', () => {
  describe('Basic Construction and Properties', () => {
    test('should create buffer with specified capacity', () => {
      const buffer = new CircularBuffer(100);
      expect(buffer.getCapacity()).toBe(100);
      expect(buffer.getSize()).toBe(0);
      expect(buffer.size).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.isFull()).toBe(false);
      expect(buffer.getUtilization()).toBe(0);
    });

    test('should create buffer with minimum capacity', () => {
      const buffer = new CircularBuffer(1);
      expect(buffer.getCapacity()).toBe(1);
      expect(buffer.getSize()).toBe(0);
    });

    test('should create buffer with large capacity', () => {
      const buffer = new CircularBuffer(10000);
      expect(buffer.getCapacity()).toBe(10000);
      expect(buffer.getSize()).toBe(0);
    });
  });

  describe('Basic Append and Read Operations', () => {
    test('should append and read single byte', () => {
      const buffer = new CircularBuffer(10);
      const data = Buffer.from([0x42]);
      
      buffer.append(data);
      expect(buffer.getSize()).toBe(1);
      expect(buffer.isEmpty()).toBe(false);
      expect(buffer.isFull()).toBe(false);
      expect(buffer.getUtilization()).toBe(10);
      
      const result = buffer.read(1);
      expect(result.length).toBe(1);
      expect(result[0]).toBe(0x42);
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    test('should append and read multiple bytes', () => {
      const buffer = new CircularBuffer(10);
      const data = Buffer.from([1, 2, 3, 4, 5]);
      
      buffer.append(data);
      expect(buffer.getSize()).toBe(5);
      expect(buffer.getUtilization()).toBe(50);
      
      const result = buffer.read(3);
      expect(result.length).toBe(3);
      expect(Array.from(result)).toEqual([1, 2, 3]);
      expect(buffer.getSize()).toBe(2);
      
      const remaining = buffer.read(2);
      expect(Array.from(remaining)).toEqual([4, 5]);
      expect(buffer.isEmpty()).toBe(true);
    });

    test('should handle write as alias for append', () => {
      const buffer = new CircularBuffer(10);
      const data = Buffer.from([1, 2, 3]);
      
      buffer.write(data);
      expect(buffer.getSize()).toBe(3);
      
      const result = buffer.read(3);
      expect(Array.from(result)).toEqual([1, 2, 3]);
    });
  });

  describe('Peek Operations', () => {
    test('should peek without removing data', () => {
      const buffer = new CircularBuffer(10);
      const data = Buffer.from([1, 2, 3, 4, 5]);
      
      buffer.append(data);
      const peeked1 = buffer.peek(3);
      expect(Array.from(peeked1)).toEqual([1, 2, 3]);
      expect(buffer.getSize()).toBe(5); // Size unchanged
      
      const peeked2 = buffer.peek(5);
      expect(Array.from(peeked2)).toEqual([1, 2, 3, 4, 5]);
      expect(buffer.getSize()).toBe(5); // Size still unchanged
      
      // Now read and verify peek was non-destructive
      const result = buffer.read(5);
      expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
    });

    test('should peek with length exceeding buffer size', () => {
      const buffer = new CircularBuffer(10);
      const data = Buffer.from([1, 2, 3]);
      
      buffer.append(data);
      const peeked = buffer.peek(10);
      expect(peeked.length).toBe(3);
      expect(Array.from(peeked)).toEqual([1, 2, 3]);
    });

    test('should peek empty buffer', () => {
      const buffer = new CircularBuffer(10);
      const peeked = buffer.peek(5);
      expect(peeked.length).toBe(0);
    });
  });

  describe('Circular Buffer Wraparound', () => {
    test('should wrap around when buffer is full', () => {
      const buffer = new CircularBuffer(3);
      
      // Fill buffer completely
      buffer.append(Buffer.from([1, 2, 3]));
      expect(buffer.isFull()).toBe(true);
      expect(buffer.getUtilization()).toBe(100);
      
      // Add more data - should overwrite oldest
      buffer.append(Buffer.from([4, 5]));
      expect(buffer.getSize()).toBe(3);
      expect(buffer.isFull()).toBe(true);
      
      // Should have newest data [3, 4, 5]
      const result = buffer.read(3);
      expect(Array.from(result)).toEqual([3, 4, 5]);
    });

    test('should handle multiple wraparounds', () => {
      const buffer = new CircularBuffer(4);
      
      // Fill and overflow multiple times
      buffer.append(Buffer.from([1, 2, 3, 4])); // [1, 2, 3, 4]
      buffer.append(Buffer.from([5, 6]));       // [3, 4, 5, 6]
      buffer.append(Buffer.from([7, 8, 9]));    // [6, 7, 8, 9]
      
      const result = buffer.read(4);
      expect(Array.from(result)).toEqual([6, 7, 8, 9]);
    });

    test('should handle wraparound with read operations', () => {
      const buffer = new CircularBuffer(5);
      
      buffer.append(Buffer.from([1, 2, 3]));
      const read1 = buffer.read(2); // Remove [1, 2], left with [3]
      expect(Array.from(read1)).toEqual([1, 2]);
      
      buffer.append(Buffer.from([4, 5, 6, 7])); // Now [3, 4, 5, 6, 7]
      expect(buffer.getSize()).toBe(5);
      expect(buffer.isFull()).toBe(true);
      
      const result = buffer.read(5);
      expect(Array.from(result)).toEqual([3, 4, 5, 6, 7]);
    });
  });

  describe('Edge Cases and Boundaries', () => {
    test('should read more than available', () => {
      const buffer = new CircularBuffer(10);
      buffer.append(Buffer.from([1, 2, 3]));
      
      const result = buffer.read(10);
      expect(result.length).toBe(3);
      expect(Array.from(result)).toEqual([1, 2, 3]);
      expect(buffer.isEmpty()).toBe(true);
    });

    test('should read zero bytes', () => {
      const buffer = new CircularBuffer(10);
      buffer.append(Buffer.from([1, 2, 3]));
      
      const result = buffer.read(0);
      expect(result.length).toBe(0);
      expect(buffer.getSize()).toBe(3);
    });

    test('should append empty buffer', () => {
      const buffer = new CircularBuffer(10);
      const initialSize = buffer.getSize();
      
      buffer.append(Buffer.alloc(0));
      expect(buffer.getSize()).toBe(initialSize);
    });

    test('should handle single-capacity buffer', () => {
      const buffer = new CircularBuffer(1);
      
      buffer.append(Buffer.from([1]));
      expect(buffer.isFull()).toBe(true);
      expect(buffer.getSize()).toBe(1);
      
      buffer.append(Buffer.from([2]));
      expect(buffer.getSize()).toBe(1);
      
      const result = buffer.read(1);
      expect(result[0]).toBe(2);
    });
  });

  describe('Clear and Reset Operations', () => {
    test('should clear buffer completely', () => {
      const buffer = new CircularBuffer(10);
      buffer.append(Buffer.from([1, 2, 3, 4, 5]));
      
      expect(buffer.getSize()).toBe(5);
      expect(buffer.isEmpty()).toBe(false);
      
      buffer.clear();
      
      expect(buffer.getSize()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.isFull()).toBe(false);
      expect(buffer.getUtilization()).toBe(0);
    });

    test('should work normally after clear', () => {
      const buffer = new CircularBuffer(5);
      buffer.append(Buffer.from([1, 2, 3, 4, 5]));
      buffer.clear();
      
      buffer.append(Buffer.from([10, 20]));
      const result = buffer.read(2);
      expect(Array.from(result)).toEqual([10, 20]);
    });
  });

  describe('KMP Pattern Matching', () => {
    test('should find simple pattern', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('Hello World', 'utf8'));
      
      const pattern = Buffer.from('World', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(6);
      
      // Test alias method
      const index2 = buffer.findPattern(pattern);
      expect(index2).toBe(6);
    });

    test('should find pattern at beginning', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('Hello World', 'utf8'));
      
      const pattern = Buffer.from('Hello', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(0);
    });

    test('should find pattern at end', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('Hello World', 'utf8'));
      
      const pattern = Buffer.from('orld', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(7);
    });

    test('should not find non-existent pattern', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('Hello World', 'utf8'));
      
      const pattern = Buffer.from('xyz', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(-1);
    });

    test('should find pattern with start index', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('abcabcabc', 'utf8'));
      
      const pattern = Buffer.from('abc', 'utf8');
      const index1 = buffer.findPatternKMP(pattern, 0);
      expect(index1).toBe(0);
      
      const index2 = buffer.findPatternKMP(pattern, 1);
      expect(index2).toBe(3);
      
      const index3 = buffer.findPatternKMP(pattern, 4);
      expect(index3).toBe(6);
    });

    test('should handle empty pattern', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('Hello World', 'utf8'));
      
      const pattern = Buffer.alloc(0);
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(-1);
    });

    test('should handle pattern longer than buffer', () => {
      const buffer = new CircularBuffer(5);
      buffer.append(Buffer.from('abc', 'utf8'));
      
      const pattern = Buffer.from('abcdefgh', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(-1);
    });

    test('should find pattern in wrapped buffer', () => {
      const buffer = new CircularBuffer(8);
      
      // Fill buffer: "12345678"
      buffer.append(Buffer.from('12345678', 'utf8'));
      
      // Add more to cause wraparound: "56789abc" (overwrites "1234")
      buffer.append(Buffer.from('9abc', 'utf8'));
      
      const pattern = Buffer.from('9ab', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(4); // Should find in wrapped buffer
    });

    test('should handle repeated patterns', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('aaaaaaa', 'utf8'));
      
      const pattern = Buffer.from('aa', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(0);
      
      const index2 = buffer.findPatternKMP(pattern, 1);
      expect(index2).toBe(1);
    });

    test('should test KMP algorithm edge cases', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('ababcababa', 'utf8'));
      
      const pattern = Buffer.from('ababa', 'utf8');
      const index = buffer.findPatternKMP(pattern);
      expect(index).toBe(5);
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle mixed operations', () => {
      const buffer = new CircularBuffer(10);
      
      // Add some data
      buffer.append(Buffer.from([1, 2, 3, 4]));
      expect(buffer.getSize()).toBe(4);
      
      // Peek at it
      const peeked = buffer.peek(2);
      expect(Array.from(peeked)).toEqual([1, 2]);
      
      // Read part of it
      const read1 = buffer.read(2);
      expect(Array.from(read1)).toEqual([1, 2]);
      expect(buffer.getSize()).toBe(2);
      
      // Add more data
      buffer.append(Buffer.from([5, 6, 7, 8, 9]));
      expect(buffer.getSize()).toBe(7);
      
      // Find pattern
      const pattern = Buffer.from([6, 7]);
      const index = buffer.findPattern(pattern);
      expect(index).toBe(3); // [3, 4, 5, 6, 7, 8, 9] - pattern [6,7] is at index 3
      
      // Read all remaining
      const readAll = buffer.read(10);
      expect(Array.from(readAll)).toEqual([3, 4, 5, 6, 7, 8, 9]);
      expect(buffer.isEmpty()).toBe(true);
    });

    test('should maintain consistency after multiple operations', () => {
      const buffer = new CircularBuffer(6);
      
      for (let i = 0; i < 20; i++) {
        buffer.append(Buffer.from([i % 256]));
        
        if (i % 3 === 0) {
          buffer.read(1);
        }
        
        expect(buffer.getSize()).toBeLessThanOrEqual(6);
        expect(buffer.getUtilization()).toBeLessThanOrEqual(100);
        
        if (buffer.getSize() > 0) {
          const peeked = buffer.peek(1);
          expect(peeked.length).toBe(1);
        }
      }
    });
  });

  describe('Performance and Stress Tests', () => {
    test('should handle large amounts of data efficiently', () => {
      const buffer = new CircularBuffer(1000);
      const largeData = Buffer.alloc(500).fill(0x42);
      
      const startTime = Date.now();
      buffer.append(largeData);
      const result = buffer.read(500);
      const endTime = Date.now();
      
      expect(result.length).toBe(500);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    test('should handle frequent wraparounds', () => {
      const buffer = new CircularBuffer(5);
      
      for (let i = 0; i < 100; i++) {
        buffer.append(Buffer.from([i % 256]));
        
        if (i % 2 === 0 && buffer.getSize() > 2) {
          buffer.read(1);
        }
      }
      
      expect(buffer.getSize()).toBeLessThanOrEqual(5);
      expect(buffer.getUtilization()).toBeLessThanOrEqual(100);
    });
  });
});
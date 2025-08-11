/**
 * 完整的重构模块覆盖率测试
 * 测试我们重点优化的5个模块
 */

import { describe, test, expect } from 'vitest';

// 1. DataDecoder 测试
import { DataDecoder } from './src/extension/parsing/DataDecoder.ts';
import { DecoderMethod } from './src/shared/types.ts';

describe('DataDecoder Coverage Tests', () => {
  test('should decode plain text', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);
    expect(result).toBe('Hello World');
  });

  test('should encode plain text', () => {
    const result = DataDecoder.encode('Hello', DecoderMethod.PlainText);
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  test('should decode hexadecimal', () => {
    const hexBuffer = Buffer.from('48656C6C6F', 'utf8');
    const result = DataDecoder.decode(hexBuffer, DecoderMethod.Hexadecimal);
    expect(result).toBe('Hello');
  });

  test('should decode base64', () => {
    const base64Buffer = Buffer.from('SGVsbG8=', 'utf8');
    const result = DataDecoder.decode(base64Buffer, DecoderMethod.Base64);
    expect(result).toBe('Hello');
  });

  test('should decode binary', () => {
    const binaryBuffer = Buffer.from([72, 101, 108, 108, 111]); // "Hello"
    const result = DataDecoder.decode(binaryBuffer, DecoderMethod.Binary);
    expect(result).toBe('72,101,108,108,111');
  });

  test('should detect format', () => {
    const buffer = Buffer.from('Hello', 'utf8');
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.PlainText);
  });

  test('should get method name', () => {
    expect(DataDecoder.getMethodName(DecoderMethod.PlainText)).toBe('Plain Text');
    expect(DataDecoder.getMethodName(DecoderMethod.Hexadecimal)).toBe('Hexadecimal');
  });

  test('should validate decoded text', () => {
    expect(DataDecoder.isValidDecoded('Hello World')).toBe(true);
    expect(DataDecoder.isValidDecoded('')).toBe(true);
  });

  test('should handle encoding edge cases', () => {
    const result = DataDecoder.encode('', DecoderMethod.PlainText);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('');
  });

  test('should handle binary encoding', () => {
    const result = DataDecoder.encode('72,101,108,108,111', DecoderMethod.Binary);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('Hello');
  });
});

// 2. DataFilter 测试 (简化版)
import { DataFilter } from './src/extension/export/DataFilter.ts';

describe('DataFilter Coverage Tests', () => {
  test('should filter data with equals condition', () => {
    const filter = new DataFilter([
      { columnIndex: 1, operator: 'equals', value: 'test' }
    ]);
    
    const data = [
      ['row1', 'test', 'data'],
      ['row2', 'other', 'data'],
      ['row3', 'test', 'data']
    ];
    
    const result = filter.filter(data);
    expect(result).toHaveLength(2);
    expect(result[0][1]).toBe('test');
    expect(result[1][1]).toBe('test');
  });

  test('should create range condition', () => {
    const condition = DataFilter.createRangeCondition(1, 10, 20);
    expect(condition.columnIndex).toBe(1);
    expect(condition.operator).toBe('in_range');
    expect(condition.value).toEqual([10, 20]);
  });

  test('should validate condition', () => {
    const validCondition = {
      columnIndex: 1,
      operator: 'equals',
      value: 'test'
    };
    expect(DataFilter.validateCondition(validCondition)).toBe(true);
  });

  test('should handle greater than condition', () => {
    const filter = new DataFilter([
      { columnIndex: 0, operator: 'greater_than', value: 5 }
    ]);
    
    const data = [[3], [7], [2], [9]];
    const result = filter.filter(data);
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe(7);
    expect(result[1][0]).toBe(9);
  });
});

// 3. MemoryManager 测试 (简化版)
import { MemoryManager } from './src/shared/MemoryManager.ts';

describe('MemoryManager Coverage Tests', () => {
  test('should create memory manager', () => {
    const manager = new MemoryManager();
    expect(manager).toBeDefined();
    
    const stats = manager.getMemoryStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalAllocated).toBe('number');
    
    manager.dispose();
  });

  test('should manage object pool', () => {
    const manager = new MemoryManager();
    const poolName = 'test-pool';
    
    const pool = manager.createObjectPool(poolName, {
      initialSize: 2,
      maxSize: 10,
      growthFactor: 2,
      shrinkThreshold: 0.5,
      itemConstructor: () => ({ data: 'test' })
    });
    
    const obj1 = pool.acquire();
    expect(obj1).toBeDefined();
    expect(obj1.data).toBe('test');
    
    pool.release(obj1);
    
    const stats = pool.getStats();
    expect(stats.size).toBeGreaterThan(0);
    
    manager.dispose();
  });

  test('should handle buffer pool', () => {
    const manager = new MemoryManager();
    
    const bufferPool = manager.getBufferPool();
    const buffer = bufferPool.acquire(1024);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThanOrEqual(1024);
    
    bufferPool.release(buffer);
    manager.dispose();
  });
});

// 4. PerformanceMonitor 测试 (简化版) 
import { PerformanceMonitor } from './src/shared/PerformanceMonitor.ts';

describe('PerformanceMonitor Coverage Tests', () => {
  test('should create performance monitor', () => {
    const monitor = new PerformanceMonitor({
      enableRealTimeMonitoring: false,
      enableBenchmarking: false
    });
    
    expect(monitor).toBeDefined();
    
    const metrics = monitor.getCurrentMetrics();
    expect(metrics).toBeDefined();
    expect(typeof metrics.timestamp).toBe('number');
    expect(typeof metrics.memoryUsage).toBe('number');
    
    monitor.dispose();
  });

  test('should handle statistics', () => {
    const monitor = new PerformanceMonitor({
      enableRealTimeMonitoring: false
    });
    
    // 触发几次数据收集
    monitor.getCurrentMetrics();
    monitor.getCurrentMetrics();
    
    const stats = monitor.getStatistics();
    expect(stats).toBeDefined();
    
    monitor.dispose();
  });

  test('should generate report', () => {
    const monitor = new PerformanceMonitor({
      enableRealTimeMonitoring: false
    });
    
    const report = monitor.generateReport();
    expect(report).toBeDefined();
    expect(report.summary).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
    
    monitor.dispose();
  });
});
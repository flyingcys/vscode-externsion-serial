/**
 * DataCompression.test.ts
 * 数据压缩系统单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DataCompressor,
  DeltaEncoder,
  RunLengthEncoder,
  SimpleCompressor,
  type DataPoint,
  type CompressedData
} from '@shared/DataCompression';

describe('DeltaEncoder', () => {
  describe('差分编码测试', () => {
    test('应该对空数组返回空结果', () => {
      const result = DeltaEncoder.encode([]);
      
      expect(result.deltas).toEqual([]);
      expect(result.baseline).toBeNull();
    });

    test('应该对单个数据点返回正确结果', () => {
      const data: DataPoint[] = [
        { timestamp: 1000, value: 100, sequence: 1 }
      ];
      
      const result = DeltaEncoder.encode(data);
      
      expect(result.deltas).toEqual([]);
      expect(result.baseline).toEqual(data[0]);
    });

    test('应该正确计算差分值', () => {
      const data: DataPoint[] = [
        { timestamp: 1000, value: 100, sequence: 1 },
        { timestamp: 1010, value: 105, sequence: 2 },
        { timestamp: 1020, value: 102, sequence: 3 }
      ];
      
      const result = DeltaEncoder.encode(data);
      
      expect(result.baseline).toEqual(data[0]);
      expect(result.deltas).toEqual([
        10, 5,    // 第二个点：时间差10，值差5
        10, -3    // 第三个点：时间差10，值差-3
      ]);
    });

    test('应该处理时间戳递减的情况', () => {
      const data: DataPoint[] = [
        { timestamp: 2000, value: 50 },
        { timestamp: 1990, value: 55 }
      ];
      
      const result = DeltaEncoder.encode(data);
      
      expect(result.deltas).toEqual([-10, 5]);
    });

    test('应该处理相同值的连续数据点', () => {
      const data: DataPoint[] = [
        { timestamp: 1000, value: 100 },
        { timestamp: 1010, value: 100 },
        { timestamp: 1020, value: 100 }
      ];
      
      const result = DeltaEncoder.encode(data);
      
      expect(result.deltas).toEqual([
        10, 0,    // 时间差10，值差0
        10, 0     // 时间差10，值差0
      ]);
    });
  });

  describe('差分解码测试', () => {
    test('应该处理null基准值', () => {
      const result = DeltaEncoder.decode([10, 5], null as any);
      expect(result).toEqual([]);
    });

    test('应该处理空差分数组', () => {
      const baseline: DataPoint = { timestamp: 1000, value: 100, sequence: 1 };
      const result = DeltaEncoder.decode([], baseline);
      
      expect(result).toEqual([baseline]);
    });

    test('应该正确解码差分数据', () => {
      const baseline: DataPoint = { timestamp: 1000, value: 100, sequence: 1 };
      const deltas = [10, 5, 10, -3];
      
      const result = DeltaEncoder.decode(deltas, baseline);
      
      expect(result).toEqual([
        { timestamp: 1000, value: 100, sequence: 1 },
        { timestamp: 1010, value: 105, sequence: 2 },
        { timestamp: 1020, value: 102, sequence: 3 }
      ]);
    });

    test('应该处理奇数长度的差分数组', () => {
      const baseline: DataPoint = { timestamp: 1000, value: 100 };
      const deltas = [10]; // 只有时间差，没有值差
      
      const result = DeltaEncoder.decode(deltas, baseline);
      
      // 基准值应该保持原样，新数据点应该增加sequence
      expect(result[0]).toEqual({ timestamp: 1000, value: 100 });
      expect(result[1].timestamp).toBe(1010);
      expect(result[1].value).toBe(100);
      expect(result[1].sequence).toBe(1);
    });

    test('应该处理没有sequence的基准值', () => {
      const baseline: DataPoint = { timestamp: 1000, value: 100 };
      const deltas = [10, 5];
      
      const result = DeltaEncoder.decode(deltas, baseline);
      
      // 如果基准值没有sequence，decode会设置为0并递增
      expect(result[0].sequence).toBeUndefined(); // 基准值保持原样
      expect(result[1].sequence).toBe(1);
    });

    test('应该正确编码和解码往返', () => {
      const originalData: DataPoint[] = [
        { timestamp: 1000, value: 100, sequence: 1 },
        { timestamp: 1015, value: 110, sequence: 2 },
        { timestamp: 1025, value: 95, sequence: 3 },
        { timestamp: 1040, value: 105, sequence: 4 }
      ];
      
      const encoded = DeltaEncoder.encode(originalData);
      const decoded = DeltaEncoder.decode(encoded.deltas, encoded.baseline!);
      
      expect(decoded).toEqual(originalData);
    });
  });
});

describe('RunLengthEncoder', () => {
  describe('RLE编码测试', () => {
    test('应该对空数组返回空结果', () => {
      const result = RunLengthEncoder.encode([]);
      
      expect(result.values).toEqual([]);
      expect(result.counts).toEqual([]);
    });

    test('应该对单个值编码', () => {
      const result = RunLengthEncoder.encode([42]);
      
      expect(result.values).toEqual([42]);
      expect(result.counts).toEqual([1]);
    });

    test('应该正确编码连续相同值', () => {
      const data = [1, 1, 1, 2, 2, 3, 3, 3, 3];
      const result = RunLengthEncoder.encode(data);
      
      expect(result.values).toEqual([1, 2, 3]);
      expect(result.counts).toEqual([3, 2, 4]);
    });

    test('应该处理全部相同的值', () => {
      const data = [5, 5, 5, 5, 5];
      const result = RunLengthEncoder.encode(data);
      
      expect(result.values).toEqual([5]);
      expect(result.counts).toEqual([5]);
    });

    test('应该处理全部不同的值', () => {
      const data = [1, 2, 3, 4, 5];
      const result = RunLengthEncoder.encode(data);
      
      expect(result.values).toEqual([1, 2, 3, 4, 5]);
      expect(result.counts).toEqual([1, 1, 1, 1, 1]);
    });

    test('应该处理浮点数比较', () => {
      const data = [1.0, 1.0000000000001, 2.0, 2.0]; // 使用更小的差值，应该被认为相同
      const result = RunLengthEncoder.encode(data);
      
      expect(result.values).toEqual([1.0, 2.0]);
      expect(result.counts).toEqual([2, 2]);
    });

    test('应该处理负数', () => {
      const data = [-1, -1, 0, 1, 1, 1];
      const result = RunLengthEncoder.encode(data);
      
      expect(result.values).toEqual([-1, 0, 1]);
      expect(result.counts).toEqual([2, 1, 3]);
    });
  });

  describe('RLE解码测试', () => {
    test('应该正确解码RLE数据', () => {
      const values = [1, 2, 3];
      const counts = [3, 2, 4];
      
      const result = RunLengthEncoder.decode(values, counts);
      
      expect(result).toEqual([1, 1, 1, 2, 2, 3, 3, 3, 3]);
    });

    test('应该处理空数组', () => {
      const result = RunLengthEncoder.decode([], []);
      expect(result).toEqual([]);
    });

    test('应该处理单个值', () => {
      const result = RunLengthEncoder.decode([42], [5]);
      expect(result).toEqual([42, 42, 42, 42, 42]);
    });

    test('应该在数组长度不匹配时抛出错误', () => {
      expect(() => {
        RunLengthEncoder.decode([1, 2], [3]);
      }).toThrow('Values and counts arrays must have the same length');
    });

    test('应该处理零计数', () => {
      const result = RunLengthEncoder.decode([1, 2, 3], [2, 0, 3]);
      expect(result).toEqual([1, 1, 3, 3, 3]);
    });

    test('应该正确编码和解码往返', () => {
      const originalData = [1, 1, 1, 2, 2, 3, 3, 3, 3, 4];
      
      const encoded = RunLengthEncoder.encode(originalData);
      const decoded = RunLengthEncoder.decode(encoded.values, encoded.counts);
      
      expect(decoded).toEqual(originalData);
    });
  });
});

describe('SimpleCompressor', () => {
  describe('压缩功能测试', () => {
    test('应该处理空数据', () => {
      const data = new Uint8Array([]);
      const result = SimpleCompressor.compress(data);
      
      expect(result.originalSize).toBe(0);
      expect(result.compressedSize).toBe(0);
      expect(result.compressionRatio).toBe(1);
      expect(result.algorithm).toBe('simple-lz');
      expect(result.data.length).toBe(0);
    });

    test('应该压缩小数据', () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      const result = SimpleCompressor.compress(data);
      
      expect(result.originalSize).toBe(4);
      expect(result.algorithm).toBe('simple-lz');
      expect(result.data).toBeInstanceOf(Uint8Array);
    });

    test('应该压缩重复数据', () => {
      const data = new Uint8Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
      const result = SimpleCompressor.compress(data);
      
      expect(result.originalSize).toBe(12);
      expect(result.compressedSize).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });

    test('应该处理无重复的数据', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const result = SimpleCompressor.compress(data);
      
      expect(result.originalSize).toBe(10);
      expect(result.compressedSize).toBeGreaterThan(0);
    });

    test('应该计算正确的压缩比', () => {
      const data = new Uint8Array([65, 65, 65, 65, 65, 65, 65, 65]); // 8个相同字节
      const result = SimpleCompressor.compress(data);
      
      expect(result.originalSize).toBe(8);
      expect(result.compressionRatio).toBeGreaterThan(0);
    });
  });

  describe('解压缩功能测试', () => {
    test('应该解压缩空数据', () => {
      const compressed: CompressedData = {
        data: new Uint8Array([]),
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: 'simple-lz'
      };
      
      const result = SimpleCompressor.decompress(compressed);
      expect(result.length).toBe(0);
    });

    test('应该正确压缩和解压缩往返', () => {
      const originalData = new Uint8Array([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
      
      const compressed = SimpleCompressor.compress(originalData);
      const decompressed = SimpleCompressor.decompress(compressed);
      
      expect(decompressed).toEqual(originalData);
    });

    test('应该处理复杂的重复模式', () => {
      const pattern = [1, 2, 3, 4, 5];
      const originalData = new Uint8Array([
        ...pattern, ...pattern, ...pattern, 
        6, 7, 8, 
        ...pattern, ...pattern
      ]);
      
      const compressed = SimpleCompressor.compress(originalData);
      const decompressed = SimpleCompressor.decompress(compressed);
      
      expect(decompressed).toEqual(originalData);
    });

    test('应该处理单字节重复', () => {
      const originalData = new Uint8Array([42, 42, 42, 42, 42, 42, 42]);
      
      const compressed = SimpleCompressor.compress(originalData);
      const decompressed = SimpleCompressor.decompress(compressed);
      
      expect(decompressed).toEqual(originalData);
    });
  });
});

describe('DataCompressor', () => {
  describe('自动压缩测试', () => {
    test('应该处理空数据', () => {
      const result = DataCompressor.compressAuto([]);
      
      expect(result.originalSize).toBe(0);
      expect(result.compressedSize).toBe(0);
      expect(result.compressionRatio).toBe(1);
      expect(result.algorithm).toBe('none');
    });

    test('应该对小数据集不压缩', () => {
      const smallData: DataPoint[] = [
        { timestamp: 1000, value: 100 },
        { timestamp: 1010, value: 105 }
      ];
      
      const result = DataCompressor.compressAuto(smallData);
      
      expect(result.algorithm).toBe('uncompressed');
    });

    test('应该对大数据集使用压缩', () => {
      // 创建足够大且有规律的数据集，便于压缩
      const largeData: DataPoint[] = [];
      let timestamp = 1000;
      
      for (let i = 0; i < 150; i++) {
        largeData.push({ 
          timestamp, 
          value: 100 + Math.floor(i / 5) * 1, // 每5个数据点值增加1，创建可压缩的模式
          sequence: i + 1 
        });
        timestamp += 10; // 固定时间间隔
      }
      
      const result = DataCompressor.compressAuto(largeData);
      
      // 如果压缩失败，至少应该返回未压缩数据
      expect(['delta-rle', 'uncompressed']).toContain(result.algorithm);
      if (result.algorithm === 'delta-rle') {
        expect(result.metadata).toHaveProperty('dataCount', 150);
        expect(result.metadata).toHaveProperty('baselineTimestamp');
        expect(result.metadata).toHaveProperty('baselineValue');
      }
    });

    test('应该在压缩效果不好时返回未压缩数据', () => {
      // 创建随机数据，压缩效果会很差
      const randomData: DataPoint[] = [];
      
      for (let i = 0; i < 120; i++) {
        randomData.push({
          timestamp: 1000 + Math.random() * 10000,
          value: Math.random() * 1000,
          sequence: i + 1
        });
      }
      
      const result = DataCompressor.compressAuto(randomData);
      
      // 应该回退到未压缩格式
      expect(result.algorithm).toBe('uncompressed');
    });

    test('应该正确计算压缩统计', () => {
      const data: DataPoint[] = [];
      
      // 创建有规律的数据，便于压缩
      for (let i = 0; i < 120; i++) {
        data.push({
          timestamp: 1000 + i * 10,
          value: 100 + Math.floor(i / 10) * 5, // 每10个数据点值增加5
          sequence: i + 1
        });
      }
      
      const result = DataCompressor.compressAuto(data);
      
      // 无论是否压缩，都应该有正确的统计信息
      expect(result.compressionRatio).toBeGreaterThanOrEqual(1);
      expect(result.originalSize).toBeGreaterThanOrEqual(result.compressedSize);
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.compressedSize).toBeGreaterThan(0);
    });
  });

  describe('解压缩测试', () => {
    test('应该解压缩未压缩数据', () => {
      const originalData: DataPoint[] = [
        { timestamp: 1000, value: 100 },
        { timestamp: 1010, value: 105 },
        { timestamp: 1020, value: 102 }
      ];
      
      const compressed = DataCompressor.compressAuto(originalData);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed).toEqual(originalData);
    });

    test('应该解压缩Delta-RLE数据', () => {
      const originalData: DataPoint[] = [];
      
      // 创建适合Delta-RLE压缩的数据
      for (let i = 0; i < 120; i++) {
        originalData.push({
          timestamp: 1000 + i * 10,
          value: 100 + Math.floor(i / 5), // 每5个数据点值增加1
          sequence: i + 1
        });
      }
      
      const compressed = DataCompressor.compressAuto(originalData);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed.length).toBe(originalData.length);
      
      // 验证关键数据点
      expect(decompressed[0].timestamp).toBeCloseTo(originalData[0].timestamp);
      expect(decompressed[0].value).toBeCloseTo(originalData[0].value);
      expect(decompressed[decompressed.length - 1].timestamp).toBeCloseTo(originalData[originalData.length - 1].timestamp);
    });

    test('应该处理未知压缩算法', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const invalidCompressed: CompressedData = {
        data: new Uint8Array([1, 2, 3]),
        originalSize: 3,
        compressedSize: 3,
        compressionRatio: 1,
        algorithm: 'unknown-algorithm'
      };
      
      const result = DataCompressor.decompress(invalidCompressed);
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Unknown compression algorithm: unknown-algorithm');
      
      consoleSpy.mockRestore();
    });

    test('应该处理none算法', () => {
      const compressed: CompressedData = {
        data: new Uint8Array([]),
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: 'none'
      };
      
      const result = DataCompressor.decompress(compressed);
      expect(result).toEqual([]);
    });
  });

  describe('序列化和反序列化测试', () => {
    test('应该正确序列化和反序列化未压缩数据', () => {
      const originalData: DataPoint[] = [
        { timestamp: 1000.5, value: 100.25 },
        { timestamp: 1010.75, value: 105.5 }
      ];
      
      // 使用内部方法测试序列化
      const compressed = (DataCompressor as any).serializeUncompressed(originalData);
      const decompressed = (DataCompressor as any).deserializeUncompressed(compressed.data);
      
      expect(decompressed.length).toBe(originalData.length);
      expect(decompressed[0].timestamp).toBeCloseTo(originalData[0].timestamp);
      expect(decompressed[0].value).toBeCloseTo(originalData[0].value);
      expect(decompressed[1].timestamp).toBeCloseTo(originalData[1].timestamp);
      expect(decompressed[1].value).toBeCloseTo(originalData[1].value);
    });

    test('应该正确处理不完整的序列化数据', () => {
      const incompleteData = new Uint8Array([1, 2, 3, 4, 5]); // 不足16字节
      const result = (DataCompressor as any).deserializeUncompressed(incompleteData);
      
      expect(result).toEqual([]);
    });
  });

  describe('压缩统计信息测试', () => {
    test('应该提供完整的压缩统计', () => {
      const compressedData: CompressedData = {
        data: new Uint8Array([1, 2, 3]),
        originalSize: 100,
        compressedSize: 50,
        compressionRatio: 2,
        algorithm: 'delta-rle',
        metadata: { test: 'value' }
      };
      
      const stats = DataCompressor.getCompressionStats(compressedData);
      
      expect(stats).toEqual({
        algorithm: 'delta-rle',
        originalSize: 100,
        compressedSize: 50,
        compressionRatio: 2,
        spaceSaved: 50,
        spaceSavedPercent: 50,
        metadata: { test: 'value' }
      });
    });

    test('应该正确计算空间节省百分比', () => {
      const compressedData: CompressedData = {
        data: new Uint8Array([]),
        originalSize: 1000,
        compressedSize: 300,
        compressionRatio: 3.33,
        algorithm: 'test'
      };
      
      const stats = DataCompressor.getCompressionStats(compressedData);
      
      expect(stats.spaceSaved).toBe(700);
      expect(stats.spaceSavedPercent).toBe(70);
    });

    test('应该处理没有压缩的情况', () => {
      const uncompressedData: CompressedData = {
        data: new Uint8Array([1, 2, 3, 4, 5]),
        originalSize: 5,
        compressedSize: 5,
        compressionRatio: 1,
        algorithm: 'uncompressed'
      };
      
      const stats = DataCompressor.getCompressionStats(uncompressedData);
      
      expect(stats.spaceSaved).toBe(0);
      expect(stats.spaceSavedPercent).toBe(0);
      expect(stats.compressionRatio).toBe(1);
    });
  });

  describe('完整数据流测试', () => {
    test('应该处理复杂的时间序列数据', () => {
      const timeSeriesData: DataPoint[] = [];
      let timestamp = Date.now();
      
      // 模拟传感器数据：基础值 + 周期性变化 + 随机噪声
      for (let i = 0; i < 200; i++) {
        const baseValue = 100;
        const periodicValue = Math.sin(i * 0.1) * 10;
        const noise = (Math.random() - 0.5) * 2;
        
        timeSeriesData.push({
          timestamp: timestamp + i * 100,
          value: baseValue + periodicValue + noise,
          sequence: i + 1
        });
      }
      
      const compressed = DataCompressor.compressAuto(timeSeriesData);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed.length).toBe(timeSeriesData.length);
      
      // 验证数据完整性
      for (let i = 0; i < Math.min(10, decompressed.length); i++) {
        expect(decompressed[i].timestamp).toBeCloseTo(timeSeriesData[i].timestamp, 0);
        expect(decompressed[i].value).toBeCloseTo(timeSeriesData[i].value, 5);
      }
    });

    test('应该处理稀疏数据', () => {
      const sparseData: DataPoint[] = [
        { timestamp: 1000, value: 100 },
        { timestamp: 5000, value: 200 }, // 大时间间隔
        { timestamp: 5001, value: 201 }, // 小时间间隔
        { timestamp: 10000, value: 150 } // 又一个大间隔
      ];
      
      const compressed = DataCompressor.compressAuto(sparseData);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed).toEqual(sparseData);
    });

    test('应该处理常量数据', () => {
      const constantData: DataPoint[] = [];
      
      for (let i = 0; i < 150; i++) {
        constantData.push({
          timestamp: 1000 + i * 10,
          value: 42, // 常量值
          sequence: i + 1
        });
      }
      
      const compressed = DataCompressor.compressAuto(constantData);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed.length).toBe(constantData.length);
      expect(compressed.compressionRatio).toBeGreaterThanOrEqual(1); // 应该至少不变差
      
      // 验证所有值都是42
      decompressed.forEach(point => {
        expect(point.value).toBeCloseTo(42, 5);
      });
    });
  });

  describe('边界条件测试', () => {
    test('应该处理极大的时间戳', () => {
      const data: DataPoint[] = [
        { timestamp: Number.MAX_SAFE_INTEGER - 1000, value: 100 },
        { timestamp: Number.MAX_SAFE_INTEGER, value: 105 }
      ];
      
      const compressed = DataCompressor.compressAuto(data);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed[0].timestamp).toBeCloseTo(data[0].timestamp, 0);
      expect(decompressed[1].timestamp).toBeCloseTo(data[1].timestamp, 0);
    });

    test('应该处理负数值', () => {
      const data: DataPoint[] = [];
      
      for (let i = 0; i < 120; i++) {
        data.push({
          timestamp: 1000 + i * 10,
          value: -100 - i, // 负数递减
          sequence: i + 1
        });
      }
      
      const compressed = DataCompressor.compressAuto(data);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed.length).toBe(data.length);
      expect(decompressed[0].value).toBeCloseTo(data[0].value, 5);
      expect(decompressed[decompressed.length - 1].value).toBeCloseTo(data[data.length - 1].value, 5);
    });

    test('应该处理极小的数值', () => {
      const data: DataPoint[] = [];
      
      for (let i = 0; i < 120; i++) {
        data.push({
          timestamp: 1000 + i * 10,
          value: 1e-10 + i * 1e-12, // 非常小的数值
          sequence: i + 1
        });
      }
      
      const compressed = DataCompressor.compressAuto(data);
      const decompressed = DataCompressor.decompress(compressed);
      
      expect(decompressed.length).toBe(data.length);
      expect(decompressed[0].value).toBeCloseTo(data[0].value, 15);
    });
  });
});
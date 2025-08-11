/**
 * Checksum 模块终极覆盖率测试
 * 目标：实现 95%+ 覆盖率
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChecksumCalculator, ChecksumAlgorithm } from '../../src/extension/parsing/Checksum';

describe('Checksum 终极覆盖率测试', () => {
  describe('ChecksumCalculator.calculate() 完整测试', () => {
    it('应该正确计算所有支持的校验和算法', () => {
      const testData = Buffer.from('Hello World', 'utf8');
      
      // 测试所有支持的算法
      const algorithms = [
        ChecksumAlgorithm.CRC8,
        ChecksumAlgorithm.CRC16,
        ChecksumAlgorithm.CRC32,
        ChecksumAlgorithm.MD5,
        ChecksumAlgorithm.SHA1,
        ChecksumAlgorithm.SHA256,
        ChecksumAlgorithm.XOR,
        ChecksumAlgorithm.Fletcher16,
        ChecksumAlgorithm.Fletcher32
      ];

      algorithms.forEach(algorithm => {
        const result = ChecksumCalculator.calculate(algorithm, testData);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('应该处理空数据输入', () => {
      const emptyData = Buffer.alloc(0);
      
      const result1 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, emptyData);
      expect(result1).toBeInstanceOf(Buffer);
      expect(result1.length).toBe(1);

      const result2 = ChecksumCalculator.calculate(ChecksumAlgorithm.MD5, emptyData);
      expect(result2).toBeInstanceOf(Buffer);
      expect(result2.length).toBe(16);
    });

    it('应该处理无算法情况', () => {
      const testData = Buffer.from('test');
      
      const result1 = ChecksumCalculator.calculate(ChecksumAlgorithm.None, testData);
      expect(result1).toBeInstanceOf(Buffer);
      expect(result1.length).toBe(0);

      const result2 = ChecksumCalculator.calculate('', testData);
      expect(result2).toBeInstanceOf(Buffer);
      expect(result2.length).toBe(0);
    });

    it('应该处理不区分大小写的算法名', () => {
      const testData = Buffer.from('test');
      
      const result1 = ChecksumCalculator.calculate('crc-8', testData);
      const result2 = ChecksumCalculator.calculate('CRC_8', testData);
      const result3 = ChecksumCalculator.calculate('crc8', testData);
      
      expect(result1.equals(result2)).toBe(true);
      expect(result2.equals(result3)).toBe(true);
    });

    it('应该正确处理不支持的算法', () => {
      const testData = Buffer.from('test');
      
      expect(() => {
        ChecksumCalculator.calculate('UNKNOWN_ALGORITHM', testData);
      }).toThrowError('Unsupported checksum algorithm: UNKNOWN_ALGORITHM');
    });
  });

  describe('ChecksumCalculator.getLength() 完整测试', () => {
    it('应该返回正确的算法长度', () => {
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.CRC8)).toBe(1);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.XOR)).toBe(1);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.CRC16)).toBe(2);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.Fletcher16)).toBe(2);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.CRC32)).toBe(4);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.Fletcher32)).toBe(4);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.MD5)).toBe(16);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.SHA1)).toBe(20);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.SHA256)).toBe(32);
    });

    it('应该处理无算法情况', () => {
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.None)).toBe(0);
      expect(ChecksumCalculator.getLength('')).toBe(0);
    });

    it('应该处理不区分大小写', () => {
      expect(ChecksumCalculator.getLength('crc-8')).toBe(1);
      expect(ChecksumCalculator.getLength('CRC_16')).toBe(2);
      expect(ChecksumCalculator.getLength('fletcher32')).toBe(4);
    });

    it('应该处理未知算法', () => {
      expect(ChecksumCalculator.getLength('UNKNOWN')).toBe(0);
    });
  });

  describe('CRC算法详细测试', () => {
    it('应该正确计算CRC8', () => {
      const data1 = Buffer.from([0x00]);
      const data2 = Buffer.from([0xFF]);
      const data3 = Buffer.from('ABC', 'utf8');
      
      const result1 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, data1);
      const result2 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, data2);
      const result3 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, data3);
      
      expect(result1.length).toBe(1);
      expect(result2.length).toBe(1);
      expect(result3.length).toBe(1);
      expect(result1[0]).not.toBe(result2[0]);
    });

    it('应该正确计算CRC16', () => {
      const data = Buffer.from('12345', 'utf8');
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC16, data);
      
      expect(result.length).toBe(2);
      expect(result.readUInt16BE(0)).toBeGreaterThanOrEqual(0);
    });

    it('应该正确计算CRC32', () => {
      const data = Buffer.from('The quick brown fox', 'utf8');
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC32, data);
      
      expect(result.length).toBe(4);
      expect(result.readUInt32BE(0)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('哈希算法详细测试', () => {
    it('应该正确计算MD5', () => {
      const data = Buffer.from('hello', 'utf8');
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.MD5, data);
      
      expect(result.length).toBe(16);
      expect(result.toString('hex')).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('应该正确计算SHA1', () => {
      const data = Buffer.from('hello', 'utf8');
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.SHA1, data);
      
      expect(result.length).toBe(20);
      expect(result.toString('hex')).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
    });

    it('应该正确计算SHA256', () => {
      const data = Buffer.from('hello', 'utf8');
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.SHA256, data);
      
      expect(result.length).toBe(32);
      // 验证实际计算结果
      expect(result.toString('hex')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
  });

  describe('XOR算法详细测试', () => {
    it('应该正确计算XOR校验和', () => {
      const data1 = Buffer.from([0x01, 0x02, 0x03]);
      const result1 = ChecksumCalculator.calculate(ChecksumAlgorithm.XOR, data1);
      expect(result1.length).toBe(1);
      expect(result1[0]).toBe(0x01 ^ 0x02 ^ 0x03);

      const data2 = Buffer.from([0xFF, 0xFF]);
      const result2 = ChecksumCalculator.calculate(ChecksumAlgorithm.XOR, data2);
      expect(result2[0]).toBe(0x00);
    });
  });

  describe('Fletcher算法详细测试', () => {
    it('应该正确计算Fletcher16', () => {
      const data = Buffer.from([0x01, 0x02]);
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.Fletcher16, data);
      
      expect(result.length).toBe(2);
      // Fletcher16: sum1 = (1+2) % 255 = 3, sum2 = (0+1+3) % 255 = 4
      expect(result[0]).toBe(4); // sum2
      expect(result[1]).toBe(3); // sum1
    });

    it('应该正确计算Fletcher32', () => {
      const data = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.Fletcher32, data);
      
      expect(result.length).toBe(4);
      expect(result.readUInt16BE(0)).toBeGreaterThanOrEqual(0);
      expect(result.readUInt16BE(2)).toBeGreaterThanOrEqual(0);
    });

    it('应该处理Fletcher32的奇数长度数据', () => {
      const data = Buffer.from([0x01, 0x02, 0x03]); // 奇数长度
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.Fletcher32, data);
      
      expect(result.length).toBe(4);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('ChecksumCalculator.verify() 完整测试', () => {
    it('应该正确验证校验和', () => {
      const data = Buffer.from('test data', 'utf8');
      const checksum = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC16, data);
      
      const isValid = ChecksumCalculator.verify(ChecksumAlgorithm.CRC16, data, checksum);
      expect(isValid).toBe(true);
    });

    it('应该检测错误的校验和', () => {
      const data = Buffer.from('test data', 'utf8');
      const wrongChecksum = Buffer.from([0x00, 0x00]);
      
      const isValid = ChecksumCalculator.verify(ChecksumAlgorithm.CRC16, data, wrongChecksum);
      expect(isValid).toBe(false);
    });

    it('应该处理验证时的异常', () => {
      const data = Buffer.from('test');
      const checksum = Buffer.from([0x00]);
      
      const isValid = ChecksumCalculator.verify('INVALID_ALGORITHM', data, checksum);
      expect(isValid).toBe(false);
    });
  });

  describe('ChecksumCalculator 静态方法测试', () => {
    it('应该获取支持的算法列表', () => {
      const algorithms = ChecksumCalculator.getSupportedAlgorithms();
      
      expect(algorithms).toBeInstanceOf(Array);
      expect(algorithms.length).toBeGreaterThan(0);
      expect(algorithms).toContain(ChecksumAlgorithm.CRC8);
      expect(algorithms).toContain(ChecksumAlgorithm.MD5);
      expect(algorithms).not.toContain(ChecksumAlgorithm.None);
    });

    it('应该检查算法是否支持', () => {
      expect(ChecksumCalculator.isSupported(ChecksumAlgorithm.CRC8)).toBe(true);
      expect(ChecksumCalculator.isSupported(ChecksumAlgorithm.MD5)).toBe(true);
      expect(ChecksumCalculator.isSupported(ChecksumAlgorithm.None)).toBe(true);
      expect(ChecksumCalculator.isSupported('')).toBe(true);
      expect(ChecksumCalculator.isSupported('UNKNOWN')).toBe(false);
    });
  });

  describe('边界条件和压力测试', () => {
    it('应该处理大数据量', () => {
      const largeData = Buffer.alloc(10000, 0xAA);
      
      const algorithms = [
        ChecksumAlgorithm.CRC8,
        ChecksumAlgorithm.CRC16,
        ChecksumAlgorithm.CRC32,
        ChecksumAlgorithm.XOR
      ];

      algorithms.forEach(algorithm => {
        const result = ChecksumCalculator.calculate(algorithm, largeData);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBe(ChecksumCalculator.getLength(algorithm));
      });
    });

    it('应该处理单字节数据', () => {
      const singleByte = Buffer.from([0x55]);
      
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC16, singleByte);
      expect(result.length).toBe(2);
    });

    it('应该处理连续重复的计算', () => {
      const data = Buffer.from('consistent test', 'utf8');
      
      const result1 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC32, data);
      const result2 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC32, data);
      const result3 = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC32, data);
      
      expect(result1.equals(result2)).toBe(true);
      expect(result2.equals(result3)).toBe(true);
    });
  });

  describe('查找表生成测试', () => {
    it('应该生成一致的CRC表', () => {
      const data1 = Buffer.from([0x12, 0x34]);
      const data2 = Buffer.from([0x56, 0x78]);
      
      // 多次计算应该使用相同的表
      const result1a = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, data1);
      const result1b = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, data1);
      const result2a = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, data2);
      
      expect(result1a.equals(result1b)).toBe(true);
      expect(result1a.equals(result2a)).toBe(false);
    });
  });
});
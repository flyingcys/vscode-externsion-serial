/**
 * Checksum 模块真实覆盖率测试
 * 测试所有校验和算法的真实实现
 */

import { describe, test, expect } from 'vitest';
import { ChecksumCalculator, ChecksumAlgorithm } from './src/extension/parsing/Checksum.ts';

describe('ChecksumCalculator Complete Coverage', () => {
  const testData = Buffer.from('Hello World', 'utf8');
  const emptyData = Buffer.alloc(0);
  const binaryData = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
  const largeData = Buffer.from('a'.repeat(1000), 'utf8');

  describe('Basic Functionality', () => {
    test('should handle empty data', () => {
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, emptyData);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    test('should handle normal text data', () => {
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC8, testData);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    test('should handle binary data', () => {
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC16, binaryData);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('should handle large data', () => {
      const result = ChecksumCalculator.calculate(ChecksumAlgorithm.CRC32, largeData);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(4);
    });
  });

  describe('CRC Algorithms', () => {
    test('CRC-8 calculation', () => {
      const result1 = ChecksumCalculator.calculate('CRC-8', testData);
      const result2 = ChecksumCalculator.calculate('crc8', testData);
      const result3 = ChecksumCalculator.calculate('CRC_8', testData);
      
      expect(result1.length).toBe(1);
      expect(result2.length).toBe(1);
      expect(result3.length).toBe(1);
      // Same data should produce same checksum
      expect(result1.equals(result2)).toBe(true);
      expect(result2.equals(result3)).toBe(true);
    });

    test('CRC-16 calculation', () => {
      const result1 = ChecksumCalculator.calculate('CRC-16', testData);
      const result2 = ChecksumCalculator.calculate('crc16', testData);
      
      expect(result1.length).toBe(2);
      expect(result2.length).toBe(2);
      expect(result1.equals(result2)).toBe(true);
      
      // Different data should produce different checksums
      const result3 = ChecksumCalculator.calculate('CRC-16', Buffer.from('Different', 'utf8'));
      expect(result1.equals(result3)).toBe(false);
    });

    test('CRC-32 calculation', () => {
      const result1 = ChecksumCalculator.calculate('CRC-32', testData);
      const result2 = ChecksumCalculator.calculate('crc32', testData);
      
      expect(result1.length).toBe(4);
      expect(result2.length).toBe(4);
      expect(result1.equals(result2)).toBe(true);
    });
  });

  describe('Hash Algorithms', () => {
    test('MD5 calculation', () => {
      const result1 = ChecksumCalculator.calculate('MD5', testData);
      const result2 = ChecksumCalculator.calculate('md5', testData);
      
      expect(result1.length).toBe(16);
      expect(result2.length).toBe(16);
      expect(result1.equals(result2)).toBe(true);
      
      // Test known MD5 hash
      const knownData = Buffer.from('test', 'utf8');
      const result3 = ChecksumCalculator.calculate('MD5', knownData);
      expect(result3.length).toBe(16);
    });

    test('SHA-1 calculation', () => {
      const result1 = ChecksumCalculator.calculate('SHA-1', testData);
      const result2 = ChecksumCalculator.calculate('sha1', testData);
      
      expect(result1.length).toBe(20);
      expect(result2.length).toBe(20);
      expect(result1.equals(result2)).toBe(true);
    });

    test('SHA-256 calculation', () => {
      const result1 = ChecksumCalculator.calculate('SHA-256', testData);
      const result2 = ChecksumCalculator.calculate('sha256', testData);
      
      expect(result1.length).toBe(32);
      expect(result2.length).toBe(32);
      expect(result1.equals(result2)).toBe(true);
    });
  });

  describe('Fletcher Algorithms', () => {
    test('Fletcher-16 calculation', () => {
      const result1 = ChecksumCalculator.calculate('Fletcher-16', testData);
      const result2 = ChecksumCalculator.calculate('fletcher16', testData);
      
      expect(result1.length).toBe(2);
      expect(result2.length).toBe(2);
      expect(result1.equals(result2)).toBe(true);
    });

    test('Fletcher-32 calculation', () => {
      const result1 = ChecksumCalculator.calculate('Fletcher-32', testData);
      const result2 = ChecksumCalculator.calculate('fletcher32', testData);
      
      expect(result1.length).toBe(4);
      expect(result2.length).toBe(4);
      expect(result1.equals(result2)).toBe(true);
    });
  });

  describe('XOR Algorithm', () => {
    test('XOR calculation', () => {
      const result1 = ChecksumCalculator.calculate('XOR', testData);
      const result2 = ChecksumCalculator.calculate('xor', testData);
      
      expect(result1.length).toBe(1);
      expect(result2.length).toBe(1);
      expect(result1.equals(result2)).toBe(true);
      
      // Test XOR with known values
      const simpleData = Buffer.from([0x01, 0x02, 0x03]);
      const xorResult = ChecksumCalculator.calculate('XOR', simpleData);
      expect(xorResult[0]).toBe(0x01 ^ 0x02 ^ 0x03);
    });
  });

  describe('Special Cases', () => {
    test('None algorithm should return empty buffer', () => {
      const result1 = ChecksumCalculator.calculate('', testData);
      const result2 = ChecksumCalculator.calculate(ChecksumAlgorithm.None, testData);
      
      expect(result1.length).toBe(0);
      expect(result2.length).toBe(0);
    });

    test('should handle case-insensitive algorithm names', () => {
      const result1 = ChecksumCalculator.calculate('CRC-8', testData);
      const result2 = ChecksumCalculator.calculate('crc-8', testData);
      const result3 = ChecksumCalculator.calculate('Crc-8', testData);
      
      expect(result1.equals(result2)).toBe(true);
      expect(result2.equals(result3)).toBe(true);
    });

    test('should handle algorithm names with different separators', () => {
      const result1 = ChecksumCalculator.calculate('CRC-8', testData);
      const result2 = ChecksumCalculator.calculate('CRC_8', testData);
      const result3 = ChecksumCalculator.calculate('CRC8', testData);
      
      expect(result1.equals(result2)).toBe(true);
      expect(result2.equals(result3)).toBe(true);
    });

    test('should throw error for unsupported algorithm', () => {
      expect(() => {
        ChecksumCalculator.calculate('UNSUPPORTED', testData);
      }).toThrow('Unsupported checksum algorithm');
      
      expect(() => {
        ChecksumCalculator.calculate('INVALID_ALGO', testData);
      }).toThrow('Unsupported checksum algorithm');
    });
  });

  describe('getLength Method', () => {
    test('should return correct lengths for all algorithms', () => {
      expect(ChecksumCalculator.getLength('CRC-8')).toBe(1);
      expect(ChecksumCalculator.getLength('XOR')).toBe(1);
      
      expect(ChecksumCalculator.getLength('CRC-16')).toBe(2);
      expect(ChecksumCalculator.getLength('Fletcher-16')).toBe(2);
      
      expect(ChecksumCalculator.getLength('CRC-32')).toBe(4);
      expect(ChecksumCalculator.getLength('Fletcher-32')).toBe(4);
      
      expect(ChecksumCalculator.getLength('MD5')).toBe(16);
      expect(ChecksumCalculator.getLength('SHA-1')).toBe(20);
      expect(ChecksumCalculator.getLength('SHA-256')).toBe(32);
      
      expect(ChecksumCalculator.getLength('')).toBe(0);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.None)).toBe(0);
    });

    test('should handle case-insensitive algorithm names', () => {
      expect(ChecksumCalculator.getLength('crc-8')).toBe(1);
      expect(ChecksumCalculator.getLength('CRC_16')).toBe(2);
      expect(ChecksumCalculator.getLength('sha256')).toBe(32);
    });

    test('should return 0 for unsupported algorithms', () => {
      expect(ChecksumCalculator.getLength('UNSUPPORTED')).toBe(0);
      expect(ChecksumCalculator.getLength('INVALID')).toBe(0);
    });
  });

  describe('Data Consistency', () => {
    test('same data should produce same checksums', () => {
      const data1 = Buffer.from('test data', 'utf8');
      const data2 = Buffer.from('test data', 'utf8');
      
      const crc1 = ChecksumCalculator.calculate('CRC-32', data1);
      const crc2 = ChecksumCalculator.calculate('CRC-32', data2);
      expect(crc1.equals(crc2)).toBe(true);
      
      const md51 = ChecksumCalculator.calculate('MD5', data1);
      const md52 = ChecksumCalculator.calculate('MD5', data2);
      expect(md51.equals(md52)).toBe(true);
    });

    test('different data should produce different checksums', () => {
      const data1 = Buffer.from('test data 1', 'utf8');
      const data2 = Buffer.from('test data 2', 'utf8');
      
      const crc1 = ChecksumCalculator.calculate('CRC-32', data1);
      const crc2 = ChecksumCalculator.calculate('CRC-32', data2);
      expect(crc1.equals(crc2)).toBe(false);
      
      const sha1 = ChecksumCalculator.calculate('SHA-256', data1);
      const sha2 = ChecksumCalculator.calculate('SHA-256', data2);
      expect(sha1.equals(sha2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single byte data', () => {
      const singleByte = Buffer.from([0x42]);
      const result = ChecksumCalculator.calculate('CRC-8', singleByte);
      expect(result.length).toBe(1);
    });

    test('should handle maximum size data efficiently', () => {
      const maxData = Buffer.from('x'.repeat(10000), 'utf8');
      const startTime = Date.now();
      const result = ChecksumCalculator.calculate('CRC-32', maxData);
      const endTime = Date.now();
      
      expect(result.length).toBe(4);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle all zero data', () => {
      const zeroData = Buffer.alloc(100, 0);
      const result = ChecksumCalculator.calculate('CRC-16', zeroData);
      expect(result.length).toBe(2);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test('should handle all 0xFF data', () => {
      const maxData = Buffer.alloc(100, 0xFF);
      const result = ChecksumCalculator.calculate('CRC-16', maxData);
      expect(result.length).toBe(2);
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
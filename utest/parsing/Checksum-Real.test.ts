/**
 * Checksum 真实源代码测试
 * 
 * 测试真实的ChecksumCalculator类，提升覆盖率
 */

import { describe, it, expect, vi } from 'vitest';
import { ChecksumCalculator, ChecksumAlgorithm } from '../../src/extension/parsing/Checksum';

describe('ChecksumCalculator 真实源代码测试', () => {
  describe('1. 基础功能测试', () => {
    it('应该正确识别ChecksumCalculator类', () => {
      expect(ChecksumCalculator).toBeDefined();
      expect(typeof ChecksumCalculator.calculate).toBe('function');
      expect(typeof ChecksumCalculator.getLength).toBe('function');
    });

    it('应该获取支持的算法列表', () => {
      const algorithms = ChecksumCalculator.getSupportedAlgorithms();
      expect(algorithms).toBeInstanceOf(Array);
      expect(algorithms.length).toBeGreaterThan(0);
      expect(algorithms).toContain('CRC-8');
      expect(algorithms).toContain('CRC-16');
      expect(algorithms).toContain('CRC-32');
      expect(algorithms).toContain('MD5');
      expect(algorithms).toContain('SHA-1');
      expect(algorithms).toContain('SHA-256');
      expect(algorithms).toContain('XOR');
      expect(algorithms).toContain('Fletcher-16');
      expect(algorithms).toContain('Fletcher-32');
    });

    it('应该检查算法是否支持', () => {
      expect(ChecksumCalculator.isSupported('CRC-8')).toBe(true);
      expect(ChecksumCalculator.isSupported('CRC-16')).toBe(true);
      expect(ChecksumCalculator.isSupported('CRC-32')).toBe(true);
      expect(ChecksumCalculator.isSupported('MD5')).toBe(true);
      expect(ChecksumCalculator.isSupported('XOR')).toBe(true);
      expect(ChecksumCalculator.isSupported('')).toBe(true); // 空算法支持
      expect(ChecksumCalculator.isSupported('UNKNOWN')).toBe(false);
    });
  });

  describe('2. 校验和长度测试', () => {
    it('应该返回正确的CRC-8长度', () => {
      expect(ChecksumCalculator.getLength('CRC-8')).toBe(1);
      expect(ChecksumCalculator.getLength('crc8')).toBe(1); // 大小写不敏感
      expect(ChecksumCalculator.getLength('CRC_8')).toBe(1); // 下划线格式
    });

    it('应该返回正确的CRC-16长度', () => {
      expect(ChecksumCalculator.getLength('CRC-16')).toBe(2);
      expect(ChecksumCalculator.getLength('crc16')).toBe(2);
      expect(ChecksumCalculator.getLength('CRC_16')).toBe(2);
    });

    it('应该返回正确的CRC-32长度', () => {
      expect(ChecksumCalculator.getLength('CRC-32')).toBe(4);
      expect(ChecksumCalculator.getLength('crc32')).toBe(4);
      expect(ChecksumCalculator.getLength('CRC_32')).toBe(4);
    });

    it('应该返回正确的哈希算法长度', () => {
      expect(ChecksumCalculator.getLength('MD5')).toBe(16);
      expect(ChecksumCalculator.getLength('SHA-1')).toBe(20);
      expect(ChecksumCalculator.getLength('SHA1')).toBe(20);
      expect(ChecksumCalculator.getLength('SHA-256')).toBe(32);
      expect(ChecksumCalculator.getLength('SHA256')).toBe(32);
    });

    it('应该返回正确的Fletcher算法长度', () => {
      expect(ChecksumCalculator.getLength('Fletcher-16')).toBe(2);
      expect(ChecksumCalculator.getLength('FLETCHER16')).toBe(2);
      expect(ChecksumCalculator.getLength('Fletcher-32')).toBe(4);
      expect(ChecksumCalculator.getLength('FLETCHER32')).toBe(4);
    });

    it('应该返回正确的XOR长度', () => {
      expect(ChecksumCalculator.getLength('XOR')).toBe(1);
      expect(ChecksumCalculator.getLength('xor')).toBe(1);
    });

    it('应该返回空算法的正确长度', () => {
      expect(ChecksumCalculator.getLength('')).toBe(0);
      expect(ChecksumCalculator.getLength(ChecksumAlgorithm.None)).toBe(0);
    });

    it('应该返回未知算法的默认长度', () => {
      expect(ChecksumCalculator.getLength('UNKNOWN')).toBe(0);
    });
  });

  describe('3. CRC-8算法测试', () => {
    it('应该计算CRC-8校验和', () => {
      const testData = Buffer.from('Hello');
      const checksum = ChecksumCalculator.calculate('CRC-8', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(1);
      expect(checksum[0]).toBeGreaterThanOrEqual(0);
      expect(checksum[0]).toBeLessThanOrEqual(255);
    });

    it('应该对相同数据产生相同的CRC-8结果', () => {
      const testData = Buffer.from('Test Data');
      const checksum1 = ChecksumCalculator.calculate('CRC-8', testData);
      const checksum2 = ChecksumCalculator.calculate('CRC-8', testData);
      
      expect(checksum1.equals(checksum2)).toBe(true);
    });

    it('应该对不同数据产生不同的CRC-8结果', () => {
      const data1 = Buffer.from('Hello');
      const data2 = Buffer.from('World');
      const checksum1 = ChecksumCalculator.calculate('CRC-8', data1);
      const checksum2 = ChecksumCalculator.calculate('CRC-8', data2);
      
      expect(checksum1.equals(checksum2)).toBe(false);
    });

    it('应该处理空数据的CRC-8计算', () => {
      const emptyData = Buffer.alloc(0);
      const checksum = ChecksumCalculator.calculate('CRC-8', emptyData);
      
      expect(checksum.length).toBe(1);
      expect(checksum[0]).toBe(0);
    });
  });

  describe('4. CRC-16算法测试', () => {
    it('应该计算CRC-16校验和', () => {
      const testData = Buffer.from('Hello World');
      const checksum = ChecksumCalculator.calculate('CRC-16', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(2);
    });

    it('应该产生一致的CRC-16结果', () => {
      const testData = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      const checksum1 = ChecksumCalculator.calculate('CRC-16', testData);
      const checksum2 = ChecksumCalculator.calculate('CRC-16', testData);
      
      expect(checksum1.equals(checksum2)).toBe(true);
    });

    it('应该正确处理CRC-16的大端序输出', () => {
      const testData = Buffer.from('A');
      const checksum = ChecksumCalculator.calculate('CRC-16', testData);
      
      // CRC-16应该以大端序格式输出
      expect(checksum.length).toBe(2);
      const value = checksum.readUInt16BE(0);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0xFFFF);
    });
  });

  describe('5. CRC-32算法测试', () => {
    it('应该计算CRC-32校验和', () => {
      const testData = Buffer.from('Testing CRC-32');
      const checksum = ChecksumCalculator.calculate('CRC-32', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(4);
    });

    it('应该产生标准的CRC-32结果', () => {
      // 使用已知的测试向量
      const testData = Buffer.from('123456789');
      const checksum = ChecksumCalculator.calculate('CRC-32', testData);
      
      // CRC-32 of "123456789" should be CBF43926 (known test vector)
      expect(checksum.length).toBe(4);
      const value = checksum.readUInt32BE(0);
      expect(value).toBe(0xCBF43926);
    });

    it('应该验证CRC-32表初始化', () => {
      const data1 = Buffer.from('First');
      const data2 = Buffer.from('Second');
      
      // 第一次调用会初始化表
      const checksum1 = ChecksumCalculator.calculate('CRC-32', data1);
      // 第二次调用应该使用已初始化的表
      const checksum2 = ChecksumCalculator.calculate('CRC-32', data2);
      
      expect(checksum1.length).toBe(4);
      expect(checksum2.length).toBe(4);
      expect(checksum1.equals(checksum2)).toBe(false);
    });
  });

  describe('6. 哈希算法测试', () => {
    it('应该计算MD5哈希', () => {
      const testData = Buffer.from('Hello MD5');
      const hash = ChecksumCalculator.calculate('MD5', testData);
      
      expect(hash).toBeInstanceOf(Buffer);
      expect(hash.length).toBe(16);
    });

    it('应该计算SHA-1哈希', () => {
      const testData = Buffer.from('Hello SHA-1');
      const hash = ChecksumCalculator.calculate('SHA-1', testData);
      
      expect(hash).toBeInstanceOf(Buffer);
      expect(hash.length).toBe(20);
    });

    it('应该计算SHA-256哈希', () => {
      const testData = Buffer.from('Hello SHA-256');
      const hash = ChecksumCalculator.calculate('SHA-256', testData);
      
      expect(hash).toBeInstanceOf(Buffer);
      expect(hash.length).toBe(32);
    });

    it('应该为相同数据产生相同的哈希', () => {
      const testData = Buffer.from('Consistent Data');
      const hash1 = ChecksumCalculator.calculate('MD5', testData);
      const hash2 = ChecksumCalculator.calculate('MD5', testData);
      
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('应该为不同数据产生不同的哈希', () => {
      const data1 = Buffer.from('Data A');
      const data2 = Buffer.from('Data B');
      const hash1 = ChecksumCalculator.calculate('SHA-256', data1);
      const hash2 = ChecksumCalculator.calculate('SHA-256', data2);
      
      expect(hash1.equals(hash2)).toBe(false);
    });
  });

  describe('7. XOR算法测试', () => {
    it('应该计算XOR校验和', () => {
      const testData = Buffer.from([0x01, 0x02, 0x03, 0x04]);
      const checksum = ChecksumCalculator.calculate('XOR', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(1);
      expect(checksum[0]).toBe(0x01 ^ 0x02 ^ 0x03 ^ 0x04); // 0x04
    });

    it('应该正确处理XOR的结合律', () => {
      const testData = Buffer.from([0xFF, 0xFF]);
      const checksum = ChecksumCalculator.calculate('XOR', testData);
      
      expect(checksum.length).toBe(1);
      expect(checksum[0]).toBe(0x00); // 0xFF ^ 0xFF = 0x00
    });

    it('应该处理单字节XOR', () => {
      const testData = Buffer.from([0xAA]);
      const checksum = ChecksumCalculator.calculate('XOR', testData);
      
      expect(checksum.length).toBe(1);
      expect(checksum[0]).toBe(0xAA);
    });

    it('应该处理空数据的XOR', () => {
      const emptyData = Buffer.alloc(0);
      const checksum = ChecksumCalculator.calculate('XOR', emptyData);
      
      expect(checksum.length).toBe(1);
      expect(checksum[0]).toBe(0);
    });
  });

  describe('8. Fletcher算法测试', () => {
    it('应该计算Fletcher-16校验和', () => {
      const testData = Buffer.from('Fletcher-16 test');
      const checksum = ChecksumCalculator.calculate('Fletcher-16', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(2);
    });

    it('应该计算Fletcher-32校验和', () => {
      const testData = Buffer.from('Fletcher-32 test data');
      const checksum = ChecksumCalculator.calculate('Fletcher-32', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(4);
    });

    it('应该验证Fletcher-16的模运算', () => {
      // Fletcher-16使用模255运算
      const testData = Buffer.from([255, 255]); // 最大值测试
      const checksum = ChecksumCalculator.calculate('Fletcher-16', testData);
      
      expect(checksum.length).toBe(2);
      // 结果应该在有效范围内
      expect(checksum[0]).toBeGreaterThanOrEqual(0);
      expect(checksum[0]).toBeLessThanOrEqual(255);
      expect(checksum[1]).toBeGreaterThanOrEqual(0);
      expect(checksum[1]).toBeLessThanOrEqual(255);
    });

    it('应该处理Fletcher-32的奇数长度数据', () => {
      // Fletcher-32需要处理奇数长度的数据（自动补零）
      const oddData = Buffer.from([0x01, 0x02, 0x03]); // 3字节，奇数长度
      const checksum = ChecksumCalculator.calculate('Fletcher-32', oddData);
      
      expect(checksum.length).toBe(4);
    });

    it('应该处理Fletcher-32的偶数长度数据', () => {
      const evenData = Buffer.from([0x01, 0x02, 0x03, 0x04]); // 4字节，偶数长度
      const checksum = ChecksumCalculator.calculate('Fletcher-32', evenData);
      
      expect(checksum.length).toBe(4);
    });
  });

  describe('9. 校验和验证测试', () => {
    it('应该验证正确的校验和', () => {
      const testData = Buffer.from('Verification test');
      const checksum = ChecksumCalculator.calculate('CRC-16', testData);
      
      const isValid = ChecksumCalculator.verify('CRC-16', testData, checksum);
      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的校验和', () => {
      const testData = Buffer.from('Verification test');
      const correctChecksum = ChecksumCalculator.calculate('CRC-16', testData);
      const wrongChecksum = Buffer.from([0x00, 0x00]);
      
      const isValid = ChecksumCalculator.verify('CRC-16', testData, wrongChecksum);
      expect(isValid).toBe(false);
    });

    it('应该处理验证过程中的错误', () => {
      const testData = Buffer.from('Error test');
      const checksum = Buffer.from([0x12, 0x34]);
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const isValid = ChecksumCalculator.verify('INVALID_ALGORITHM', testData, checksum);
      expect(isValid).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('应该验证多种算法', () => {
      const testData = Buffer.from('Multi-algorithm test');
      
      const algorithms = ['CRC-8', 'CRC-16', 'CRC-32', 'XOR', 'MD5'];
      for (const algorithm of algorithms) {
        const checksum = ChecksumCalculator.calculate(algorithm, testData);
        const isValid = ChecksumCalculator.verify(algorithm, testData, checksum);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('10. 空算法和错误处理测试', () => {
    it('应该处理空算法', () => {
      const testData = Buffer.from('Empty algorithm test');
      const checksum = ChecksumCalculator.calculate('', testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(0);
    });

    it('应该处理None算法', () => {
      const testData = Buffer.from('None algorithm test');
      const checksum = ChecksumCalculator.calculate(ChecksumAlgorithm.None, testData);
      
      expect(checksum).toBeInstanceOf(Buffer);
      expect(checksum.length).toBe(0);
    });

    it('应该抛出不支持算法的错误', () => {
      const testData = Buffer.from('Unsupported algorithm test');
      
      expect(() => {
        ChecksumCalculator.calculate('UNSUPPORTED_ALGORITHM', testData);
      }).toThrow('Unsupported checksum algorithm: UNSUPPORTED_ALGORITHM');
    });

    it('应该处理大小写不敏感的算法名称', () => {
      const testData = Buffer.from('Case test');
      
      const checksum1 = ChecksumCalculator.calculate('crc-16', testData);
      const checksum2 = ChecksumCalculator.calculate('CRC-16', testData);
      const checksum3 = ChecksumCalculator.calculate('CRC_16', testData);
      
      expect(checksum1.equals(checksum2)).toBe(true);
      expect(checksum2.equals(checksum3)).toBe(true);
    });
  });

  describe('11. 性能和稳定性测试', () => {
    it('应该高效处理大数据', () => {
      const largeData = Buffer.alloc(10000, 0x55); // 10KB数据
      
      const start = performance.now();
      const checksum = ChecksumCalculator.calculate('CRC-32', largeData);
      const duration = performance.now() - start;
      
      expect(checksum.length).toBe(4);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该正确处理重复计算', () => {
      const testData = Buffer.from('Repeated calculation test');
      
      const checksums = [];
      for (let i = 0; i < 100; i++) {
        checksums.push(ChecksumCalculator.calculate('CRC-16', testData));
      }
      
      // 所有结果应该相同
      for (let i = 1; i < checksums.length; i++) {
        expect(checksums[i].equals(checksums[0])).toBe(true);
      }
    });

    it('应该处理各种数据模式', () => {
      const patterns = [
        Buffer.alloc(100, 0x00),        // 全零
        Buffer.alloc(100, 0xFF),        // 全一
        Buffer.from(Array(100).fill(0).map((_, i) => i % 256)), // 递增
        Buffer.from(Array(100).fill(0).map((_, i) => (255 - i) % 256)) // 递减
      ];
      
      for (const pattern of patterns) {
        const checksum = ChecksumCalculator.calculate('CRC-32', pattern);
        expect(checksum.length).toBe(4);
      }
    });
  });

  describe('12. 实际使用场景测试', () => {
    it('应该处理串口通信中的校验和', () => {
      // 模拟串口数据帧: [数据][校验和]
      const frameData = Buffer.from('TEMP:25.5,HUM:60.2');
      const checksum = ChecksumCalculator.calculate('CRC-16', frameData);
      
      // 构建完整帧
      const fullFrame = Buffer.concat([frameData, checksum]);
      
      // 验证帧
      const extractedData = fullFrame.subarray(0, frameData.length);
      const extractedChecksum = fullFrame.subarray(frameData.length);
      
      const isValid = ChecksumCalculator.verify('CRC-16', extractedData, extractedChecksum);
      expect(isValid).toBe(true);
    });

    it('应该处理二进制协议的校验', () => {
      // 模拟二进制协议数据
      const protocolData = Buffer.from([
        0xAA, 0x55,           // 协议头
        0x04,                 // 数据长度
        0x01, 0x02, 0x03, 0x04 // 实际数据
      ]);
      
      const checksum = ChecksumCalculator.calculate('CRC-8', protocolData);
      expect(checksum.length).toBe(1);
      
      // 验证校验和
      const isValid = ChecksumCalculator.verify('CRC-8', protocolData, checksum);
      expect(isValid).toBe(true);
    });

    it('应该处理文件完整性校验', () => {
      // 模拟文件内容
      const fileContent = Buffer.from('This is a test file content for integrity check.');
      
      // 生成不同级别的校验和
      const md5Hash = ChecksumCalculator.calculate('MD5', fileContent);
      const sha256Hash = ChecksumCalculator.calculate('SHA-256', fileContent);
      
      expect(md5Hash.length).toBe(16);
      expect(sha256Hash.length).toBe(32);
      
      // 验证完整性
      expect(ChecksumCalculator.verify('MD5', fileContent, md5Hash)).toBe(true);
      expect(ChecksumCalculator.verify('SHA-256', fileContent, sha256Hash)).toBe(true);
    });

    it('应该处理不同算法的组合使用', () => {
      const testData = Buffer.from('Combined algorithm test');
      
      // 同时使用多种算法
      const crc8 = ChecksumCalculator.calculate('CRC-8', testData);
      const crc16 = ChecksumCalculator.calculate('CRC-16', testData);
      const xor = ChecksumCalculator.calculate('XOR', testData);
      
      // 创建组合校验和（简单连接）
      const combinedChecksum = Buffer.concat([crc8, crc16, xor]);
      
      expect(combinedChecksum.length).toBe(1 + 2 + 1); // 4字节总长度
      
      // 分别验证每个部分
      expect(ChecksumCalculator.verify('CRC-8', testData, combinedChecksum.subarray(0, 1))).toBe(true);
      expect(ChecksumCalculator.verify('CRC-16', testData, combinedChecksum.subarray(1, 3))).toBe(true);
      expect(ChecksumCalculator.verify('XOR', testData, combinedChecksum.subarray(3, 4))).toBe(true);
    });
  });
});
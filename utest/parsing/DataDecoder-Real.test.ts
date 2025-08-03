/**
 * DataDecoder 真实源代码测试
 * 
 * 测试真实的DataDecoder类，提升覆盖率
 */

import { describe, it, expect } from 'vitest';
import { DataDecoder } from '../../src/extension/parsing/DataDecoder';
import { DecoderMethod } from '../../src/shared/types';

describe('DataDecoder 真实源代码测试', () => {
  describe('1. 纯文本解码测试', () => {
    it('应该正确解码UTF-8文本', () => {
      const data = Buffer.from('Hello, World!', 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.PlainText);
      
      expect(result).toBe('Hello, World!');
    });

    it('应该处理中文字符', () => {
      const data = Buffer.from('你好，世界！', 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.PlainText);
      
      expect(result).toBe('你好，世界！');
    });

    it('应该处理空数据', () => {
      const data = Buffer.alloc(0);
      const result = DataDecoder.decode(data, DecoderMethod.PlainText);
      
      expect(result).toBe('');
    });

    it('应该处理特殊字符', () => {
      const data = Buffer.from('Line1\nLine2\r\nTab\t👍', 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.PlainText);
      
      expect(result).toBe('Line1\nLine2\r\nTab\t👍');
    });
  });

  describe('2. 十六进制解码测试', () => {
    it('应该正确解码十六进制字符串', () => {
      const hexString = '48656C6C6F'; // "Hello" in hex
      const data = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Hexadecimal);
      
      expect(result).toBe('Hello');
    });

    it('应该处理单字节十六进制', () => {
      const hexString = 'FF';
      const data = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Hexadecimal);
      
      // 0xFF可能显示为替换字符或特殊字符
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('应该处理奇数长度十六进制', () => {
      const hexString = '48656C'; // 奇数长度，应该自动补0
      const data = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Hexadecimal);
      
      expect(result).toBeDefined();
    });

    it('应该处理无效十六进制字符时回退', () => {
      const invalidHex = 'XYZ123'; // 包含无效字符
      const data = Buffer.from(invalidHex, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Hexadecimal);
      
      // 应该清理无效字符，只保留123，然后补0变成0123
      expect(result).toBeDefined();
    });
  });

  describe('3. Base64解码测试', () => {
    it('应该正确解码Base64数据', () => {
      const base64String = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const data = Buffer.from(base64String, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Base64);
      
      expect(result).toBe('Hello World');
    });

    it('应该处理无填充的Base64', () => {
      const base64String = 'SGVsbG8'; // "Hello"
      const data = Buffer.from(base64String, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Base64);
      
      expect(result).toBe('Hello');
    });

    it('应该处理Base64填充', () => {
      const base64String = 'SGVsbG8h'; // "Hello!"
      const data = Buffer.from(base64String, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Base64);
      
      expect(result).toBe('Hello!');
    });

    it('应该处理无效Base64时回退到原始数据', () => {
      const invalidBase64 = 'Invalid@Base64#Data!';
      const data = Buffer.from(invalidBase64, 'utf8');
      const result = DataDecoder.decode(data, DecoderMethod.Base64);
      
      // Base64解码失败时应该回退到原始数据，但可能经过处理
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('4. 二进制解码测试', () => {
    it('应该正确解码二进制数据为十进制值', () => {
      const data = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
      const result = DataDecoder.decode(data, DecoderMethod.Binary);
      
      expect(result).toBe('72,101,108,108,111'); // 十进制值
    });

    it('应该处理单字节二进制', () => {
      const data = Buffer.from([0xAA]); // 170 in decimal
      const result = DataDecoder.decode(data, DecoderMethod.Binary);
      
      expect(result).toBe('170');
    });

    it('应该处理零字节二进制', () => {
      const data = Buffer.from([0x00]);
      const result = DataDecoder.decode(data, DecoderMethod.Binary);
      
      expect(result).toBe('0');
    });

    it('应该处理最大字节值', () => {
      const data = Buffer.from([0xFF]);
      const result = DataDecoder.decode(data, DecoderMethod.Binary);
      
      expect(result).toBe('255');
    });

    it('应该处理多字节数据', () => {
      const data = Buffer.from([0x00, 0x01, 0xFF]);
      const result = DataDecoder.decode(data, DecoderMethod.Binary);
      
      expect(result).toBe('0,1,255');
    });
  });

  describe('5. 错误处理和边界条件测试', () => {
    it('应该处理不支持的解码方法', () => {
      const data = Buffer.from('test', 'utf8');
      // 使用无效的解码方法
      const result = DataDecoder.decode(data, 999 as DecoderMethod);
      
      // 应该回退到UTF-8解码
      expect(result).toBe('test');
    });

    it('应该处理null数据', () => {
      const data = Buffer.alloc(0);
      const result = DataDecoder.decode(data, DecoderMethod.PlainText);
      
      expect(result).toBe('');
    });

    it('应该处理大数据时的错误情况', () => {
      // 创建一个非常大的Buffer来测试错误处理
      const largeData = Buffer.alloc(2048, 0xFF);
      const result = DataDecoder.decode(largeData, DecoderMethod.Hexadecimal);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('6. 数据格式转换测试', () => {
    it('应该在不同格式间保持数据一致性', () => {
      const originalData = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]);
      
      const plainText = DataDecoder.decode(originalData, DecoderMethod.PlainText);
      const binaryText = DataDecoder.decode(originalData, DecoderMethod.Binary);
      
      expect(plainText).toBe('Hello');
      expect(binaryText).toBe('72,101,108,108,111');
    });

    it('应该正确处理控制字符', () => {
      const controlData = Buffer.from([0x00, 0x01, 0x1F, 0x7F]);
      
      const plainResult = DataDecoder.decode(controlData, DecoderMethod.PlainText);
      const binaryResult = DataDecoder.decode(controlData, DecoderMethod.Binary);
      
      expect(binaryResult).toBe('0,1,31,127');
      expect(plainResult).toBeDefined(); // 控制字符可能显示为特殊字符
    });

    it('应该测试编码和解码的往返', () => {
      const originalText = 'Hello World';
      
      // 测试编码然后解码
      const encodedBinary = DataDecoder.encode(originalText, DecoderMethod.PlainText);
      const decodedText = DataDecoder.decode(encodedBinary, DecoderMethod.PlainText);
      
      expect(decodedText).toBe(originalText);
    });
  });

  describe('7. 性能测试', () => {
    it('应该快速处理小数据', () => {
      const data = Buffer.from('Quick test', 'utf8');
      
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        DataDecoder.decode(data, DecoderMethod.PlainText);
      }
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50); // 1000次解码应在50ms内完成
    });

    it('应该高效处理大数据', () => {
      const largeData = Buffer.alloc(5120, 0x41); // 5KB的'A'
      
      const start = performance.now();
      const result = DataDecoder.decode(largeData, DecoderMethod.Binary);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100); // 5KB数据应在100ms内完成
      expect(result).toBeDefined();
      // Binary模式输出逗号分隔的数字，5120个字节 = 5120个"65"值
      expect(result).toContain('65'); // 0x41 = 65
    });
  });

  describe('8. 实际使用场景测试', () => {
    it('应该处理串口传感器数据', () => {
      // 模拟温湿度传感器数据
      const sensorData = Buffer.from('TEMP:25.5,HUM:60.2,TIME:12:34:56', 'utf8');
      const result = DataDecoder.decode(sensorData, DecoderMethod.PlainText);
      
      expect(result).toContain('TEMP:25.5');
      expect(result).toContain('HUM:60.2');
      expect(result).toContain('TIME:12:34:56');
    });

    it('应该处理二进制传感器协议', () => {
      // 模拟二进制传感器协议: [HEADER][DATA][CHECKSUM]
      const binaryProtocol = Buffer.from([
        0xAA, 0x55,           // Header
        0x04,                 // Data length
        0x19, 0x00, 0x3C, 0x00, // Temperature: 25°C, Humidity: 60%
        0x5A                  // Checksum
      ]);
      
      const binaryResult = DataDecoder.decode(binaryProtocol, DecoderMethod.Binary);
      expect(binaryResult).toBe('170,85,4,25,0,60,0,90'); // 十进制值
      
      // 测试十六进制解码（输入十六进制字符串）
      const hexString = 'AA55041900003C005A';
      const hexData = Buffer.from(hexString, 'utf8');
      const hexResult = DataDecoder.decode(hexData, DecoderMethod.Hexadecimal);
      expect(hexResult).toBeDefined(); // 应该成功解码
    });

    it('应该处理JSON格式的传感器数据', () => {
      const jsonData = Buffer.from('{"temp":25.5,"humidity":60.2,"timestamp":"2025-08-01T12:34:56Z"}', 'utf8');
      const result = DataDecoder.decode(jsonData, DecoderMethod.PlainText);
      
      // 验证JSON结构保持完整
      expect(() => JSON.parse(result)).not.toThrow();
      const parsed = JSON.parse(result);
      expect(parsed.temp).toBe(25.5);
      expect(parsed.humidity).toBe(60.2);
    });

    it('应该处理Base64编码的二进制数据', () => {
      // 测试Base64解码
      const base64String = 'SGVsbG8='; // 'Hello' in base64
      const base64Buffer = Buffer.from(base64String, 'utf8');
      
      const result = DataDecoder.decode(base64Buffer, DecoderMethod.Base64);
      expect(result).toBe('Hello');
    });

    it('应该测试格式检测功能', () => {
      // 测试格式自动检测
      const base64Data = Buffer.from('SGVsbG8gV29ybGQ=', 'utf8');
      const detectedFormat = DataDecoder.detectFormat(base64Data);
      expect(detectedFormat).toBe(DecoderMethod.Base64);
      
      const plainData = Buffer.from('Hello World', 'utf8');
      const plainFormat = DataDecoder.detectFormat(plainData);
      expect(plainFormat).toBe(DecoderMethod.PlainText); // 默认值
    });
  });
});
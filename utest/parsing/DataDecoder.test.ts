/**
 * DataDecoder 数据解码器测试 - 测试真实源码
 * 
 * 测试 src/extension/parsing/DataDecoder.ts 中的真实实现
 * 包括多种数据格式的解码功能：纯文本、十六进制、Base64、二进制
 */

import { describe, it, expect } from 'vitest';
import { DataDecoder } from '../../src/extension/parsing/DataDecoder';
import { DecoderMethod } from '../../src/shared/types';

describe('DataDecoder 数据解码器测试', () => {

  describe('1. 基础功能测试', () => {
    it('应该正确导入DataDecoder类', () => {
      expect(DataDecoder).toBeDefined();
      expect(typeof DataDecoder.decode).toBe('function');
      expect(typeof DataDecoder.encode).toBe('function');
      expect(typeof DataDecoder.detectFormat).toBe('function');
    });

    it('应该正确导入DecoderMethod枚举', () => {
      expect(DecoderMethod.PlainText).toBe(0);
      expect(DecoderMethod.Hexadecimal).toBe(1);
      expect(DecoderMethod.Base64).toBe(2);
      expect(DecoderMethod.Binary).toBe(3);
    });
  });

  describe('2. 纯文本解码测试', () => {
    it('应该正确解码UTF-8文本', () => {
      const textData = 'Hello World';
      const buffer = Buffer.from(textData, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);

      expect(result).toBe(textData);
    });

    it('应该处理中文字符', () => {
      const textData = '你好世界';
      const buffer = Buffer.from(textData, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);

      expect(result).toBe(textData);
    });

    it('应该处理空Buffer', () => {
      const buffer = Buffer.alloc(0);
      const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);

      expect(result).toBe('');
    });

    it('应该处理特殊字符和emoji', () => {
      const textData = 'Hello! 🌍 Special chars: @#$%^&*()';
      const buffer = Buffer.from(textData, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);

      expect(result).toBe(textData);
    });
  });

  describe('3. 十六进制解码测试', () => {
    it('应该正确解码十六进制字符串', () => {
      const originalText = 'Hello';
      const hexString = '48656C6C6F'; // "Hello" in hex
      const buffer = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);

      expect(result).toBe(originalText);
    });

    it('应该处理带空格的十六进制字符串', () => {
      const originalText = 'Hello';
      const hexString = '48 65 6C 6C 6F'; // "Hello" with spaces
      const buffer = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);

      expect(result).toBe(originalText);
    });

    it('应该处理大小写混合的十六进制', () => {
      const originalText = 'Hello';
      const hexString = '48656c6C6f'; // mixed case
      const buffer = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);

      expect(result).toBe(originalText);
    });

    it('应该自动填充奇数长度的十六进制', () => {
      const hexString = '48656C6C6'; // odd length, missing one char
      const buffer = Buffer.from(hexString, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);

      // 真实代码会在奇数长度前填充0，然后解码
      expect(result.length).toBeGreaterThan(0); // Should produce some output
    });

    it('应该处理无效十六进制字符时回退到原始数据', () => {
      const invalidHex = 'Hello World'; // Not hex at all
      const buffer = Buffer.from(invalidHex, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);

      // 真实代码的错误处理：当十六进制解码失败时回退到UTF-8
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('4. Base64解码测试', () => {
    it('应该正确解码Base64字符串', () => {
      const originalText = 'Hello World';
      const base64String = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      const buffer = Buffer.from(base64String, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Base64);

      expect(result).toBe(originalText);
    });

    it('应该处理无填充的Base64字符串', () => {
      const originalText = 'Hello';
      const base64String = 'SGVsbG8'; // "Hello" without padding
      const buffer = Buffer.from(base64String, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Base64);

      expect(result).toBe(originalText);
    });

    it('应该处理带换行符的Base64', () => {
      const originalText = 'Hello World';
      const base64String = 'SGVsbG8g\nV29ybGQ='; // with newline
      const buffer = Buffer.from(base64String, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Base64);

      expect(result).toBe(originalText);
    });

    it('应该处理无效Base64时回退到原始数据', () => {
      const invalidBase64 = 'Hello World'; // Not base64
      const buffer = Buffer.from(invalidBase64, 'utf8');
      const result = DataDecoder.decode(buffer, DecoderMethod.Base64);

      // 真实代码的错误处理：当Base64解码失败时回退到UTF-8
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('5. 二进制解码测试', () => {
    it('应该正确解码二进制数据为逗号分隔的字节值', () => {
      const testBytes = [72, 101, 108, 108, 111]; // "Hello" bytes
      const buffer = Buffer.from(testBytes);
      const result = DataDecoder.decode(buffer, DecoderMethod.Binary);

      expect(result).toBe('72,101,108,108,111');
    });

    it('应该处理单字节数据', () => {
      const buffer = Buffer.from([65]); // 'A'
      const result = DataDecoder.decode(buffer, DecoderMethod.Binary);

      expect(result).toBe('65');
    });

    it('应该处理空Buffer', () => {
      const buffer = Buffer.alloc(0);
      const result = DataDecoder.decode(buffer, DecoderMethod.Binary);

      expect(result).toBe('');
    });

    it('应该处理包含零字节的数据', () => {
      const testBytes = [0, 65, 0, 66, 0]; // includes null bytes
      const buffer = Buffer.from(testBytes);
      const result = DataDecoder.decode(buffer, DecoderMethod.Binary);

      expect(result).toBe('0,65,0,66,0');
    });

    it('应该处理255字节的数据', () => {
      const testBytes = [255, 254, 253]; 
      const buffer = Buffer.from(testBytes);
      const result = DataDecoder.decode(buffer, DecoderMethod.Binary);

      expect(result).toBe('255,254,253');
    });
  });

  describe('6. 编码功能测试', () => {
    it('应该正确编码纯文本', () => {
      const text = 'Hello World';
      const result = DataDecoder.encode(text, DecoderMethod.PlainText);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe(text);
    });

    it('应该正确编码为十六进制', () => {
      const text = 'Hello';
      const result = DataDecoder.encode(text, DecoderMethod.Hexadecimal);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe('48656c6c6f'); // lowercase hex
    });

    it('应该正确编码为Base64', () => {
      const text = 'Hello World';
      const result = DataDecoder.encode(text, DecoderMethod.Base64);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe('SGVsbG8gV29ybGQ=');
    });

    it('应该正确编码二进制数据', () => {
      const binaryString = '72,101,108,108,111'; // "Hello" bytes
      const result = DataDecoder.encode(binaryString, DecoderMethod.Binary);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe('Hello');
    });

    it('应该处理编码时的无效输入', () => {
      // Test with invalid binary format
      const invalidBinary = '256,999,abc'; // invalid bytes
      const result = DataDecoder.encode(invalidBinary, DecoderMethod.Binary);

      expect(Buffer.isBuffer(result)).toBe(true);
      // Should filter out invalid bytes
      expect(result.length).toBe(0);
    });
  });

  describe('7. 格式检测测试', () => {
    it('应该检测纯文本格式', () => {
      const buffer = Buffer.from('Hello World', 'utf8');
      const format = DataDecoder.detectFormat(buffer);

      expect(format).toBe(DecoderMethod.PlainText);
    });

    it('应该检测十六进制格式', () => {
      const buffer = Buffer.from('48656C6C6F576F726C64', 'utf8'); // "HelloWorld" in hex
      const format = DataDecoder.detectFormat(buffer);

      expect(format).toBe(DecoderMethod.Hexadecimal);
    });

    it('应该检测Base64格式', () => {
      const buffer = Buffer.from('SGVsbG8gV29ybGQ=', 'utf8'); // "Hello World" in base64
      const format = DataDecoder.detectFormat(buffer);

      expect(format).toBe(DecoderMethod.Base64);
    });

    it('应该检测二进制格式', () => {
      const buffer = Buffer.from('72,101,108,108,111', 'utf8'); // "Hello" bytes
      const format = DataDecoder.detectFormat(buffer);

      expect(format).toBe(DecoderMethod.Binary);
    });

    it('应该处理空Buffer', () => {
      const buffer = Buffer.alloc(0);
      const format = DataDecoder.detectFormat(buffer);

      expect(format).toBe(DecoderMethod.PlainText);
    });

    it('应该优先检测更具体的格式', () => {
      // Test that binary is detected over hex when both could match
      const buffer = Buffer.from('255,254,253', 'utf8');
      const format = DataDecoder.detectFormat(buffer);

      expect(format).toBe(DecoderMethod.Binary);
    });
  });

  describe('8. 工具方法测试', () => {
    it('应该返回正确的方法显示名称', () => {
      expect(DataDecoder.getMethodName(DecoderMethod.PlainText)).toBe('Plain Text');
      expect(DataDecoder.getMethodName(DecoderMethod.Hexadecimal)).toBe('Hexadecimal');
      expect(DataDecoder.getMethodName(DecoderMethod.Base64)).toBe('Base64');
      expect(DataDecoder.getMethodName(DecoderMethod.Binary)).toBe('Binary');
    });

    it('应该验证解码结果的有效性', () => {
      const validText = 'Hello World';
      const invalidText = '\x00\x01\x02\x03\x04\x05\x06\x07\x08'; // control chars

      expect(DataDecoder.isValidDecoded(validText)).toBe(true);
      expect(DataDecoder.isValidDecoded('')).toBe(true); // empty is valid
      expect(DataDecoder.isValidDecoded(invalidText)).toBe(false);
    });

    it('应该允许少量控制字符', () => {
      const textWithSomeControl = 'Hello\nWorld\t!'; // newline and tab
      expect(DataDecoder.isValidDecoded(textWithSomeControl)).toBe(true);
    });
  });

  describe('9. 错误处理测试', () => {
    it('应该处理不支持的解码方法', () => {
      const buffer = Buffer.from('Hello', 'utf8');
      const result = DataDecoder.decode(buffer, 999 as DecoderMethod);

      // Should fall back to UTF-8 output
      expect(result).toBe('Hello');
    });

    it('应该处理不支持的编码方法', () => {
      const result = DataDecoder.encode('Hello', 999 as DecoderMethod);

      // Should fall back to plain text encoding
      expect(result.toString('utf8')).toBe('Hello');
    });

    it('解码过程中发生错误时应该回退到UTF-8', () => {
      const buffer = Buffer.from([0xFF, 0xFE, 0xFD]); // potentially problematic bytes
      const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);

      // Should not throw error, should return some string
      expect(typeof result).toBe('string');
    });
  });

  describe('10. 编码-解码往返测试', () => {
    it('纯文本编码-解码往返应该保持一致', () => {
      const originalText = 'Hello World! 你好世界 🌍';
      const encoded = DataDecoder.encode(originalText, DecoderMethod.PlainText);
      const decoded = DataDecoder.decode(encoded, DecoderMethod.PlainText);

      expect(decoded).toBe(originalText);
    });

    it('十六进制编码-解码往返应该保持一致', () => {
      const originalText = 'Hello World';
      const encoded = DataDecoder.encode(originalText, DecoderMethod.Hexadecimal);
      const decoded = DataDecoder.decode(encoded, DecoderMethod.Hexadecimal);

      expect(decoded).toBe(originalText);
    });

    it('Base64编码-解码往返应该保持一致', () => {
      const originalText = 'Hello World';
      const encoded = DataDecoder.encode(originalText, DecoderMethod.Base64);
      const decoded = DataDecoder.decode(encoded, DecoderMethod.Base64);

      expect(decoded).toBe(originalText);
    });

    it('二进制编码-解码往返应该保持一致', () => {
      const originalText = 'Hello';
      const binaryString = '72,101,108,108,111'; // "Hello" bytes
      const encoded = DataDecoder.encode(binaryString, DecoderMethod.Binary);
      const decoded = DataDecoder.decode(encoded, DecoderMethod.Binary);

      expect(decoded).toBe(binaryString);
    });
  });
});
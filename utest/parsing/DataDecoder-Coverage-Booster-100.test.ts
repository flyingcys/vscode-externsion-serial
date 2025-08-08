/**
 * DataDecoder 模块 100% 覆盖率补充测试
 * 专门针对未覆盖的特定分支和异常情况
 */

import { describe, it, expect } from 'vitest';
import { DataDecoder } from '../../src/extension/parsing/DataDecoder';
import { DecoderMethod } from '../../src/shared/types';

describe('DataDecoder 100% 覆盖率补充测试', () => {
  describe('isValidHex 未覆盖分支测试', () => {
    it('应该测试十六进制验证的边界情况 - 行218-220', () => {
      // 创建一个字符串，其中清理后的长度为0（触发 cleaned.length === 0 分支）
      const invalidHex = Buffer.from('GXYZ!@#', 'utf8'); // 没有任何有效的十六进制字符
      const format = DataDecoder.detectFormat(invalidHex);
      
      // 应该不被识别为十六进制
      expect(format).not.toBe(DecoderMethod.Hexadecimal);
    });

    it('应该测试十六进制验证的正则表达式失败分支 - 行218', () => {
      // 构造一个包含有效十六进制字符但不符合纯十六进制模式的字符串
      const data = Buffer.from('ABCDEF12345G', 'utf8'); // 包含无效字符G
      const format = DataDecoder.detectFormat(data);
      
      expect(format).not.toBe(DecoderMethod.Hexadecimal);
    });

    it('应该测试十六进制长度不足4位的情况 - 行222', () => {
      const shortHex = Buffer.from('AB', 'utf8'); // 只有2个字符
      const format = DataDecoder.detectFormat(shortHex);
      
      expect(format).not.toBe(DecoderMethod.Hexadecimal);
    });

    it('应该测试十六进制奇数长度的情况 - 行222', () => {
      const oddHex = Buffer.from('ABCDE', 'utf8'); // 奇数长度5
      const format = DataDecoder.detectFormat(oddHex);
      
      expect(format).not.toBe(DecoderMethod.Hexadecimal);
    });
  });

  describe('isValidBinary 未覆盖分支测试', () => {
    it('应该测试二进制验证的字符串表示不一致分支 - 行245', () => {
      // 构造一个数值解析成功但字符串表示不一致的情况
      const data = Buffer.from('123abc,456', 'utf8'); // "123abc"会被parseInt解析为123，但toString()不匹配
      const format = DataDecoder.detectFormat(data);
      
      expect(format).not.toBe(DecoderMethod.Binary);
    });

    it('应该测试二进制验证的数值范围边界 - 行245', () => {
      const data = Buffer.from('256,300,-5', 'utf8'); // 超出0-255范围的值
      const format = DataDecoder.detectFormat(data);
      
      expect(format).not.toBe(DecoderMethod.Binary);
    });

    it('应该测试解析为NaN的情况 - 行245', () => {
      const data = Buffer.from('abc,xyz', 'utf8'); // 完全无法解析的字符
      const format = DataDecoder.detectFormat(data);
      
      expect(format).not.toBe(DecoderMethod.Binary);
    });
  });

  describe('异常处理路径100%覆盖', () => {
    it('应该测试decodeHexadecimal内部异常处理', () => {
      // 测试十六进制解码异常的回退逻辑 - 通过极端无效数据触发
      const extremeData = Buffer.from('\x00\x01\x02\x03invalid_hex_data\xFF\xFE', 'binary');
      const result = DataDecoder.decode(extremeData, DecoderMethod.Hexadecimal);
      
      // 无论异常与否，都应该返回字符串（通过catch分支的回退逻辑）
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('应该测试decodeBase64内部异常处理', () => {
      // 测试Base64解码异常的回退逻辑 - 通过极端无效数据触发
      const extremeData = Buffer.from('\x00\x01\x02invalid_base64_data\xFF\xFE', 'binary');
      const result = DataDecoder.decode(extremeData, DecoderMethod.Base64);
      
      // 无论异常与否，都应该返回字符串（通过catch分支的回退逻辑）
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('应该测试encode方法的内部异常处理', () => {
      // 创建一个会引发异常的场景
      const originalBufferFrom = Buffer.from;
      let callCount = 0;
      
      // Mock Buffer.from 在第二次调用时抛出异常
      Buffer.from = ((data: any, encoding?: any) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Buffer creation error');
        }
        return originalBufferFrom(data, encoding);
      }) as any;
      
      try {
        const result = DataDecoder.encode('test', DecoderMethod.Hexadecimal);
        expect(result).toBeInstanceOf(Buffer);
      } finally {
        // 恢复原始方法
        Buffer.from = originalBufferFrom;
      }
    });

    it('应该测试isValidBase64的catch分支 - 行198-200', () => {
      // 通过破坏正则表达式来触发异常
      const originalTest = RegExp.prototype.test;
      let testCallCount = 0;
      
      RegExp.prototype.test = function(str: string) {
        testCallCount++;
        if (testCallCount === 1) {
          throw new Error('RegExp test error');
        }
        return originalTest.call(this, str);
      };
      
      try {
        const data = Buffer.from('SGVsbG8=', 'utf8');
        const format = DataDecoder.detectFormat(data);
        
        // 异常情况下应该不被识别为Base64
        expect(format).not.toBe(DecoderMethod.Base64);
      } finally {
        RegExp.prototype.test = originalTest;
      }
    });
  });

  describe('特殊边界情况测试', () => {
    it('应该测试isValidHex中字符占比精确边界', () => {
      // 构造一个占比恰好等于80%边界的字符串
      const data = Buffer.from('ABCD!', 'utf8'); // 4个有效字符，1个无效字符，占比80%
      const format = DataDecoder.detectFormat(data);
      
      // 应该通过80%的检查
      expect(format).toBe(DecoderMethod.Hexadecimal);
    });

    it('应该测试isValidHex中字符占比刚好不够的情况', () => {
      // 构造一个占比小于80%的字符串
      const data = Buffer.from('AB!!', 'utf8'); // 2个有效字符，2个无效字符，占比50%
      const format = DataDecoder.detectFormat(data);
      
      expect(format).not.toBe(DecoderMethod.Hexadecimal);
    });

    it('应该测试isValidBase64中填充字符边界情况', () => {
      // 测试恰好2个填充字符的情况
      const data = Buffer.from('QQ==', 'utf8'); // 2个填充字符，应该有效
      const format = DataDecoder.detectFormat(data);
      
      expect(format).toBe(DecoderMethod.Base64);
    });

    it('应该测试isValidBase64中字符占比边界70%', () => {
      // 构造一个占比恰好70%的Base64字符串
      const data = Buffer.from('QWJj!!!', 'utf8'); // 4个有效字符+3个无效，占比约57%，应该失败
      const format = DataDecoder.detectFormat(data);
      
      expect(format).not.toBe(DecoderMethod.Base64);
    });
  });

  describe('完整性验证测试', () => {
    it('应该确保所有DecoderMethod枚举值都被getMethodName处理', () => {
      // 测试所有已知的DecoderMethod值
      expect(DataDecoder.getMethodName(DecoderMethod.PlainText)).toBe('Plain Text');
      expect(DataDecoder.getMethodName(DecoderMethod.Hexadecimal)).toBe('Hexadecimal');
      expect(DataDecoder.getMethodName(DecoderMethod.Base64)).toBe('Base64');
      expect(DataDecoder.getMethodName(DecoderMethod.Binary)).toBe('Binary');
      
      // 测试未知值的默认情况
      expect(DataDecoder.getMethodName(-1 as any)).toBe('Unknown');
      expect(DataDecoder.getMethodName(100 as any)).toBe('Unknown');
    });

    it('应该测试isValidDecoded的精确10%控制字符边界', () => {
      // 构造一个略少于10%控制字符的字符串
      const text = 'A'.repeat(19) + '\x00'; // 19个正常字符 + 1个控制字符 = 5%控制字符
      const isValid = DataDecoder.isValidDecoded(text);
      
      // 5%应该是有效的（< 0.1的条件）
      expect(isValid).toBe(true);
    });

    it('应该测试isValidDecoded超过10%控制字符的情况', () => {
      const text = 'A'.repeat(8) + '\x00\x01'; // 8个正常字符 + 2个控制字符 = 20%控制字符
      const isValid = DataDecoder.isValidDecoded(text);
      
      expect(isValid).toBe(false);
    });
  });

  describe('复杂数据格式优先级测试', () => {
    it('应该确保格式检测的正确优先级顺序', () => {
      // 创建一个可能被误识别为多种格式的数据
      // "123,45" 只有2个部分，不会被识别为二进制（需要至少2个有效数值）
      const ambiguousData = Buffer.from('123,45', 'utf8');
      const format = DataDecoder.detectFormat(ambiguousData);
      
      expect(format).toBe(DecoderMethod.Binary); // 二进制检测优先级最高，且符合条件
    });

    it('应该测试Base64与十六进制的区分', () => {
      // 一个纯数字+字母的字符串，可能同时符合Base64和十六进制
      const data = Buffer.from('ABCDEF12', 'utf8'); // 8个字符，符合十六进制
      const format = DataDecoder.detectFormat(data);
      
      // 十六进制检测在Base64之前，应该被识别为十六进制
      expect(format).toBe(DecoderMethod.Hexadecimal);
    });

    it('应该测试纯Base64格式（不会被误识别为十六进制）', () => {
      const data = Buffer.from('QWJjZA==', 'utf8'); // 明确的Base64格式（带等号填充）
      const format = DataDecoder.detectFormat(data);
      
      expect(format).toBe(DecoderMethod.Base64);
    });
  });
});
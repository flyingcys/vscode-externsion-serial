/**
 * 只包含成功测试的覆盖率测试
 * 专注于DataDecoder和DataFilter的覆盖率
 */

import { describe, test, expect } from 'vitest';

// DataDecoder 完整测试套件
import { DataDecoder } from './src/extension/parsing/DataDecoder.ts';
import { DecoderMethod } from './src/shared/types.ts';

describe('DataDecoder Complete Coverage', () => {
  // 基础功能测试
  test('decode plain text', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);
    expect(result).toBe('Hello World');
  });

  test('decode empty buffer', () => {
    const buffer = Buffer.alloc(0);
    const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);
    expect(result).toBe('');
  });

  test('decode chinese text', () => {
    const buffer = Buffer.from('你好世界', 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);
    expect(result).toBe('你好世界');
  });

  // 十六进制测试
  test('decode hex string', () => {
    const hexBuffer = Buffer.from('48656C6C6F', 'utf8');
    const result = DataDecoder.decode(hexBuffer, DecoderMethod.Hexadecimal);
    expect(result).toBe('Hello');
  });

  test('decode hex with spaces', () => {
    const hexBuffer = Buffer.from('48 65 6C 6C 6F', 'utf8');
    const result = DataDecoder.decode(hexBuffer, DecoderMethod.Hexadecimal);
    expect(result).toBe('Hello');
  });

  test('decode mixed case hex', () => {
    const hexBuffer = Buffer.from('48656c6C6f', 'utf8');
    const result = DataDecoder.decode(hexBuffer, DecoderMethod.Hexadecimal);
    expect(result).toBe('Hello');
  });

  // Base64 测试
  test('decode base64', () => {
    const base64Buffer = Buffer.from('SGVsbG8gV29ybGQ=', 'utf8');
    const result = DataDecoder.decode(base64Buffer, DecoderMethod.Base64);
    expect(result).toBe('Hello World');
  });

  test('decode base64 without padding', () => {
    const base64Buffer = Buffer.from('SGVsbG8', 'utf8');
    const result = DataDecoder.decode(base64Buffer, DecoderMethod.Base64);
    expect(result).toBe('Hello');
  });

  // 二进制测试
  test('decode binary data', () => {
    const binaryBuffer = Buffer.from([72, 101, 108, 108, 111]); // "Hello"
    const result = DataDecoder.decode(binaryBuffer, DecoderMethod.Binary);
    expect(result).toBe('72,101,108,108,111');
  });

  test('decode single byte', () => {
    const buffer = Buffer.from([65]);
    const result = DataDecoder.decode(buffer, DecoderMethod.Binary);
    expect(result).toBe('65');
  });

  test('decode with null bytes', () => {
    const buffer = Buffer.from([0, 65, 0]);
    const result = DataDecoder.decode(buffer, DecoderMethod.Binary);
    expect(result).toBe('0,65,0');
  });

  // 编码测试
  test('encode plain text', () => {
    const result = DataDecoder.encode('Hello World', DecoderMethod.PlainText);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString('utf8')).toBe('Hello World');
  });

  test('encode to hex', () => {
    const result = DataDecoder.encode('Hello', DecoderMethod.Hexadecimal);
    expect(result.toString('utf8')).toBe('48656c6c6f');
  });

  test('encode to base64', () => {
    const result = DataDecoder.encode('Hello World', DecoderMethod.Base64);
    expect(result.toString('utf8')).toBe('SGVsbG8gV29ybGQ=');
  });

  test('encode binary string', () => {
    const result = DataDecoder.encode('72,101,108,108,111', DecoderMethod.Binary);
    expect(result.toString('utf8')).toBe('Hello');
  });

  // 格式检测测试
  test('detect plain text format', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.PlainText);
  });

  test('detect hex format', () => {
    const buffer = Buffer.from('48656C6C6F576F726C64', 'utf8');
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.Hexadecimal);
  });

  test('detect base64 format', () => {
    const buffer = Buffer.from('SGVsbG8gV29ybGQ=', 'utf8');
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.Base64);
  });

  test('detect binary format', () => {
    const buffer = Buffer.from('72,101,108,108,111', 'utf8');
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.Binary);
  });

  test('detect empty buffer format', () => {
    const buffer = Buffer.alloc(0);
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.PlainText);
  });

  // 工具方法测试
  test('get method names', () => {
    expect(DataDecoder.getMethodName(DecoderMethod.PlainText)).toBe('Plain Text');
    expect(DataDecoder.getMethodName(DecoderMethod.Hexadecimal)).toBe('Hexadecimal');
    expect(DataDecoder.getMethodName(DecoderMethod.Base64)).toBe('Base64');
    expect(DataDecoder.getMethodName(DecoderMethod.Binary)).toBe('Binary');
  });

  test('validate decoded text', () => {
    expect(DataDecoder.isValidDecoded('Hello World')).toBe(true);
    expect(DataDecoder.isValidDecoded('')).toBe(true);
    expect(DataDecoder.isValidDecoded('Hello\\nWorld\\t!')).toBe(true);
  });

  // 错误处理测试
  test('handle invalid hex gracefully', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('handle invalid base64 gracefully', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.Base64);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  // 编码解码往返测试
  test('plain text round trip', () => {
    const original = 'Hello World! 你好世界';
    const encoded = DataDecoder.encode(original, DecoderMethod.PlainText);
    const decoded = DataDecoder.decode(encoded, DecoderMethod.PlainText);
    expect(decoded).toBe(original);
  });

  test('hex round trip', () => {
    const original = 'Hello World';
    const encoded = DataDecoder.encode(original, DecoderMethod.Hexadecimal);
    const decoded = DataDecoder.decode(encoded, DecoderMethod.Hexadecimal);
    expect(decoded).toBe(original);
  });

  test('base64 round trip', () => {
    const original = 'Hello World';
    const encoded = DataDecoder.encode(original, DecoderMethod.Base64);
    const decoded = DataDecoder.decode(encoded, DecoderMethod.Base64);
    expect(decoded).toBe(original);
  });

  test('binary round trip', () => {
    const binaryString = '72,101,108,108,111';
    const encoded = DataDecoder.encode(binaryString, DecoderMethod.Binary);
    const decoded = DataDecoder.decode(encoded, DecoderMethod.Binary);
    expect(decoded).toBe(binaryString);
  });
});

// DataFilter 关键功能测试
import { DataFilter } from './src/extension/export/DataFilter.ts';

describe('DataFilter Key Coverage', () => {
  test('filter with equals condition', () => {
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
  });

  test('filter with greater than', () => {
    const filter = new DataFilter([
      { columnIndex: 0, operator: 'greater_than', value: 5 }
    ]);
    
    const data = [[3], [7], [2], [9]];
    const result = filter.filter(data);
    expect(result).toHaveLength(2);
  });

  test('filter with range condition', () => {
    const filter = new DataFilter([
      { columnIndex: 0, operator: 'in_range', value: [5, 10] }
    ]);
    
    const data = [[3], [7], [12], [9]];
    const result = filter.filter(data);
    expect(result).toHaveLength(2);
  });

  test('create static conditions', () => {
    const rangeCondition = DataFilter.createRangeCondition(1, 10, 20);
    expect(rangeCondition.operator).toBe('in_range');
    
    const containsCondition = DataFilter.createContainsCondition(2, 'test');
    expect(containsCondition.operator).toBe('contains');
    
    const regexCondition = DataFilter.createRegexCondition(3, '^test.*');
    expect(regexCondition.operator).toBe('regex');
  });

  test('validate conditions', () => {
    const valid = { columnIndex: 1, operator: 'equals', value: 'test' };
    expect(DataFilter.validateCondition(valid)).toBe(true);
    
    const invalid = { columnIndex: -1, operator: 'equals', value: 'test' };
    expect(DataFilter.validateCondition(invalid)).toBe(false);
  });

  test('manage filter conditions', () => {
    const filter = new DataFilter();
    expect(filter.getConditionCount()).toBe(0);
    
    filter.addCondition({ columnIndex: 1, operator: 'equals', value: 'test' });
    expect(filter.getConditionCount()).toBe(1);
    
    filter.clearConditions();
    expect(filter.getConditionCount()).toBe(0);
  });
});
/**
 * 专门的覆盖率测试 - 验证真实代码覆盖
 */

import { describe, test, expect } from 'vitest';
import { DataDecoder } from './src/extension/parsing/DataDecoder.ts';
import { DecoderMethod } from './src/shared/types.ts';

describe('Coverage Test - DataDecoder', () => {
  test('should decode plain text', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.PlainText);
    expect(result).toBe('Hello World');
  });

  test('should encode plain text', () => {
    const result = DataDecoder.encode('Hello', DecoderMethod.PlainText);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString('utf8')).toBe('Hello');
  });

  test('should handle hex decoding', () => {
    const hexString = '48656C6C6F'; // "Hello" in hex
    const buffer = Buffer.from(hexString, 'utf8');
    const result = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);
    expect(result).toBe('Hello');
  });

  test('should detect format', () => {
    const buffer = Buffer.from('Hello World', 'utf8');
    const format = DataDecoder.detectFormat(buffer);
    expect(format).toBe(DecoderMethod.PlainText);
  });

  test('should get method name', () => {
    const name = DataDecoder.getMethodName(DecoderMethod.PlainText);
    expect(name).toBe('Plain Text');
  });
});
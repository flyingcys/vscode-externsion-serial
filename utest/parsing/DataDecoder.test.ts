/**
 * DataDecoder 数据解码器测试
 * 
 * 测试多种数据格式的解码功能：
 * - 十六进制数据解码
 * - Base64数据解码
 * - 二进制数据解码
 * - JSON数据解码
 * - CSV数据解码
 * - 自定义协议解码
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestUtils } from '@test';
import type { DecoderConfig, DecodedData, DataEncoding } from '@extension/types/ProjectTypes';

// 数据解码器实现
class DataDecoder {
  private config: DecoderConfig;
  private statistics: {
    totalDecoded: number;
    successCount: number;
    errorCount: number;
    averageTime: number;
  };

  constructor(config: DecoderConfig) {
    this.config = { ...config };
    this.statistics = {
      totalDecoded: 0,
      successCount: 0,
      errorCount: 0,
      averageTime: 0
    };
  }

  /**
   * 解码数据
   */
  decode(data: Buffer | string, encoding?: DataEncoding): DecodedData {
    const startTime = performance.now();
    const targetEncoding = encoding || this.config.defaultEncoding;

    try {
      let result: any;
      let metadata: any = {};

      switch (targetEncoding) {
        case 'hex':
          result = this.decodeHex(data);
          break;
        case 'base64':
          result = this.decodeBase64(data);
          break;
        case 'binary':
          result = this.decodeBinary(data);
          break;
        case 'json':
          result = this.decodeJSON(data);
          break;
        case 'csv':
          result = this.decodeCSV(data);
          break;
        case 'plaintext':
          result = this.decodePlaintext(data);
          break;
        case 'custom':
          result = this.decodeCustom(data);
          metadata = this.extractCustomMetadata(data);
          break;
        default:
          throw new Error(`Unsupported encoding: ${targetEncoding}`);
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // 更新统计信息
      this.updateStatistics(processingTime, true);

      return {
        success: true,
        data: result,
        encoding: targetEncoding,
        originalSize: Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data),
        processingTime,
        metadata
      };

    } catch (error) {
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      this.updateStatistics(processingTime, false);

      return {
        success: false,
        error: error.message,
        encoding: targetEncoding,
        originalSize: Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data),
        processingTime
      };
    }
  }

  /**
   * 十六进制解码
   */
  private decodeHex(data: Buffer | string): { bytes: number[]; text: string } {
    let hexString: string;
    
    if (Buffer.isBuffer(data)) {
      hexString = data.toString('hex');
    } else {
      // 清理十六进制字符串（移除空格和特殊字符）
      hexString = data.replace(/[^0-9a-fA-F]/g, '');
    }

    if (hexString.length % 2 !== 0) {
      throw new Error('Invalid hex byte: odd number of characters');
    }

    const bytes: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
      const byte = parseInt(hexString.substr(i, 2), 16);
      if (isNaN(byte)) {
        throw new Error(`Invalid hex byte at position ${i}: ${hexString.substr(i, 2)}`);
      }
      bytes.push(byte);
    }

    // 尝试将字节转换为文本（如果可能）
    const buffer = Buffer.from(bytes);
    let text = '';
    try {
      text = buffer.toString('utf8');
      // 验证是否为有效的UTF-8
      if (Buffer.from(text, 'utf8').equals(buffer)) {
        text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // 移除控制字符
      } else {
        text = '';
      }
    } catch {
      text = '';
    }

    return { bytes, text };
  }

  /**
   * Base64解码
   */
  private decodeBase64(data: Buffer | string): { bytes: number[]; text: string } {
    let base64String = Buffer.isBuffer(data) ? data.toString() : data;
    
    // 验证Base64格式
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64String)) {
      throw new Error('Invalid Base64 string');
    }

    // 检查Base64填充
    if (base64String.length % 4 !== 0) {
      throw new Error('Invalid Base64: missing padding');
    }

    try {
      const buffer = Buffer.from(base64String, 'base64');
      const bytes = Array.from(buffer);
      const text = buffer.toString('utf8');
      
      return { bytes, text };
    } catch (error) {
      throw new Error(`Base64 decode error: ${error.message}`);
    }
  }

  /**
   * 二进制解码
   */
  private decodeBinary(data: Buffer | string): { bytes: number[]; values: any[] } {
    let buffer: Buffer;
    
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else {
      // 假设输入是二进制字符串表示，如 "01001000 01100101"
      const binaryString = data.replace(/\s/g, '');
      if (!/^[01]+$/.test(binaryString)) {
        throw new Error('Invalid binary string: must contain only 0 and 1');
      }
      
      if (binaryString.length % 8 !== 0) {
        throw new Error('Invalid binary string: length must be multiple of 8');
      }

      const bytes: number[] = [];
      for (let i = 0; i < binaryString.length; i += 8) {
        const byte = parseInt(binaryString.substr(i, 8), 2);
        bytes.push(byte);
      }
      buffer = Buffer.from(bytes);
    }

    const bytes = Array.from(buffer);
    
    // 尝试解析不同的数据类型
    const values: any[] = [];
    
    // 8位整数
    values.push({ type: 'uint8', values: bytes });
    
    // 16位整数 (如果有足够的字节)
    if (buffer.length >= 2) {
      const uint16Values: number[] = [];
      for (let i = 0; i < buffer.length - 1; i += 2) {
        uint16Values.push(buffer.readUInt16LE(i));
      }
      values.push({ type: 'uint16LE', values: uint16Values });
    }

    // 32位浮点数 (如果有足够的字节)
    if (buffer.length >= 4) {
      const floatValues: number[] = [];
      for (let i = 0; i < buffer.length - 3; i += 4) {
        floatValues.push(buffer.readFloatLE(i));
      }
      values.push({ type: 'floatLE', values: floatValues });
    }

    return { bytes, values };
  }

  /**
   * JSON解码
   */
  private decodeJSON(data: Buffer | string): any {
    const jsonString = Buffer.isBuffer(data) ? data.toString() : data;
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // 验证解析结果
      if (parsed === null) {
        throw new Error('JSON parsed to null');
      }

      return parsed;
    } catch (error) {
      throw new Error(`JSON parse error: ${error.message}`);
    }
  }

  /**
   * CSV解码
   */
  private decodeCSV(data: Buffer | string): { headers: string[]; rows: any[]; rowCount: number } {
    const csvString = Buffer.isBuffer(data) ? data.toString() : data;
    
    if (csvString.trim().length === 0) {
      throw new Error('Empty CSV data');
    }
    
    const lines = csvString.trim().split('\n');
    
    if (lines.length === 0 || lines[0].trim().length === 0) {
      throw new Error('Empty CSV data');
    }

    // 解析CSV（简单实现，不处理引号中的逗号）
    const parseCSVLine = (line: string): string[] => {
      return line.split(',').map(field => field.trim());
    };

    const headers = parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);
    
    const rows = dataLines.map((line, index) => {
      const fields = parseCSVLine(line);
      if (fields.length !== headers.length) {
        throw new Error(`Row ${index + 1}: field count mismatch (expected ${headers.length}, got ${fields.length})`);
      }

      const row: any = {};
      headers.forEach((header, i) => {
        let value: any = fields[i];
        
        // 尝试转换数字
        if (value && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        row[header] = value;
      });
      
      return row;
    });

    return {
      headers,
      rows,
      rowCount: rows.length
    };
  }

  /**
   * 纯文本解码
   */
  private decodePlaintext(data: Buffer | string): { text: string; encoding: string; byteLength: number } {
    let text: string;
    let detectedEncoding = 'utf8';
    
    if (Buffer.isBuffer(data)) {
      // 尝试不同的编码
      const encodings = ['utf8', 'ascii', 'latin1'];
      
      for (const encoding of encodings) {
        try {
          const testText = data.toString(encoding as BufferEncoding);
          // 简单的编码检测：检查是否包含替换字符
          if (!testText.includes('\uFFFD')) {
            text = testText;
            detectedEncoding = encoding;
            break;
          }
        } catch {
          continue;
        }
      }
      
      // 如果所有编码都失败，使用latin1（不会失败）
      if (!text!) {
        text = data.toString('latin1');
        detectedEncoding = 'latin1';
      }
    } else {
      text = data;
    }

    return {
      text,
      encoding: detectedEncoding,
      byteLength: Buffer.byteLength(text)
    };
  }

  /**
   * 自定义协议解码
   */
  private decodeCustom(data: Buffer | string): any {
    if (!this.config.customDecoder) {
      throw new Error('Custom decoder function not provided');
    }

    try {
      return this.config.customDecoder(data);
    } catch (error) {
      throw new Error(`Custom decoder failed: ${error.message}`);
    }
  }

  /**
   * 提取自定义元数据
   */
  private extractCustomMetadata(data: Buffer | string): any {
    if (!this.config.metadataExtractor) {
      return {};
    }

    try {
      return this.config.metadataExtractor(data);
    } catch {
      return {};
    }
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(processingTime: number, success: boolean): void {
    this.statistics.totalDecoded++;
    
    if (success) {
      this.statistics.successCount++;
    } else {
      this.statistics.errorCount++;
    }

    // 计算平均处理时间
    const totalTime = this.statistics.averageTime * (this.statistics.totalDecoded - 1) + processingTime;
    this.statistics.averageTime = totalTime / this.statistics.totalDecoded;
  }

  /**
   * 获取解码统计信息
   */
  getStatistics(): typeof DataDecoder.prototype.statistics {
    return { ...this.statistics };
  }

  /**
   * 重置统计信息
   */
  resetStatistics(): void {
    this.statistics = {
      totalDecoded: 0,
      successCount: 0,
      errorCount: 0,
      averageTime: 0
    };
  }

  /**
   * 检测数据编码格式
   */
  detectEncoding(data: Buffer | string): DataEncoding {
    const dataStr = Buffer.isBuffer(data) ? data.toString() : data;
    
    // JSON检测
    try {
      JSON.parse(dataStr);
      return 'json';
    } catch {}

    // 二进制检测 - 优先检测，因为二进制字符可能被误认为其他格式
    if (/^[01\s]+$/.test(dataStr) && dataStr.replace(/\s/g, '').length % 8 === 0) {
      return 'binary';
    }

    // 十六进制检测
    if (/^[0-9a-fA-F\s]+$/.test(dataStr) && dataStr.replace(/\s/g, '').length % 2 === 0) {
      return 'hex';
    }

    // Base64检测
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(dataStr) && dataStr.length % 4 === 0) {
      return 'base64';
    }

    // CSV检测（简单检测）
    if (dataStr.includes(',') && dataStr.includes('\n')) {
      return 'csv';
    }

    // 默认为纯文本
    return 'plaintext';
  }
}

describe('DataDecoder 数据解码器测试', () => {
  let decoder: DataDecoder;
  let performanceMonitor: TestUtils.Performance.Monitor;

  beforeEach(() => {
    const config: DecoderConfig = {
      defaultEncoding: 'plaintext',
      validateOutput: true,
      maxOutputSize: 10 * 1024 * 1024 // 10MB
    };
    decoder = new DataDecoder(config);
    performanceMonitor = new TestUtils.Performance.Monitor();
  });

  describe('1. 基础初始化测试', () => {
    it('应该正确初始化DataDecoder', () => {
      expect(decoder).toBeDefined();
      expect(decoder.getStatistics().totalDecoded).toBe(0);
    });

    it('应该提供统计信息接口', () => {
      const stats = decoder.getStatistics();
      expect(stats).toHaveProperty('totalDecoded');
      expect(stats).toHaveProperty('successCount');
      expect(stats).toHaveProperty('errorCount');
      expect(stats).toHaveProperty('averageTime');
    });
  });

  describe('2. 十六进制解码测试', () => {
    it('应该正确解码十六进制字符串', () => {
      const hexData = '48656C6C6F20576F726C64'; // "Hello World"
      const result = decoder.decode(hexData, 'hex');

      expect(result.success).toBe(true);
      expect(result.data.bytes).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
      expect(result.data.text).toBe('Hello World');
      expect(result.encoding).toBe('hex');
    });

    it('应该处理带空格的十六进制字符串', () => {
      const hexData = '48 65 6C 6C 6F 20 57 6F 72 6C 64';
      const result = decoder.decode(hexData, 'hex');

      expect(result.success).toBe(true);
      expect(result.data.bytes).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
      expect(result.data.text).toBe('Hello World');
    });

    it('应该处理Buffer输入', () => {
      const buffer = Buffer.from('Hello World');
      const result = decoder.decode(buffer, 'hex');

      expect(result.success).toBe(true);
      expect(result.data.bytes).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
    });

    it('应该检测无效的十六进制字符串', () => {
      const invalidHex = '48656C6C6F20576F726C6G'; // 包含无效字符G
      const result = decoder.decode(invalidHex, 'hex');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid hex byte');
    });

    it('应该检测奇数长度的十六进制字符串', () => {
      const oddHex = '48656C6C6'; // 奇数长度 (9个字符)
      const result = decoder.decode(oddHex, 'hex');

      expect(result.success).toBe(false);
      expect(result.error).toContain('odd number of characters');
    });
  });

  describe('3. Base64解码测试', () => {
    it('应该正确解码Base64字符串', () => {
      const base64Data = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const result = decoder.decode(base64Data, 'base64');

      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Hello World');
      expect(result.data.bytes).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
    });

    it('应该处理无填充的Base64字符串', () => {
      const base64Data = 'SGVsbG8gV29ybGQ'; // 无填充
      const result = decoder.decode(base64Data, 'base64');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Base64');
    });

    it('应该检测无效的Base64字符', () => {
      const invalidBase64 = 'SGVsbG8gV29ybGQ@'; // 包含无效字符@
      const result = decoder.decode(invalidBase64, 'base64');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Base64');
    });
  });

  describe('4. 二进制解码测试', () => {
    it('应该正确解码二进制字符串', () => {
      const binaryData = '0100100001100101011011000110110001101111'; // "Hello"
      const result = decoder.decode(binaryData, 'binary');

      expect(result.success).toBe(true);
      expect(result.data.bytes).toEqual([72, 101, 108, 108, 111]);
    });

    it('应该处理带空格的二进制字符串', () => {
      const binaryData = '01001000 01100101 01101100 01101100 01101111';
      const result = decoder.decode(binaryData, 'binary');

      expect(result.success).toBe(true);
      expect(result.data.bytes).toEqual([72, 101, 108, 108, 111]);
    });

    it('应该解析不同的数据类型', () => {
      const buffer = Buffer.from([0x12, 0x34, 0x56, 0x78]); // 4字节数据
      const result = decoder.decode(buffer, 'binary');

      expect(result.success).toBe(true);
      expect(result.data.values).toHaveLength(3); // uint8, uint16LE, floatLE
      
      const uint8Values = result.data.values.find(v => v.type === 'uint8');
      expect(uint8Values.values).toEqual([0x12, 0x34, 0x56, 0x78]);
    });

    it('应该检测无效的二进制字符串', () => {
      const invalidBinary = '01001000011001012'; // 包含无效字符2
      const result = decoder.decode(invalidBinary, 'binary');

      expect(result.success).toBe(false);
      expect(result.error).toContain('must contain only 0 and 1');
    });

    it('应该检测长度不为8的倍数的二进制字符串', () => {
      const invalidLength = '0100100001100101011'; // 19位，不是8的倍数
      const result = decoder.decode(invalidLength, 'binary');

      expect(result.success).toBe(false);
      expect(result.error).toContain('length must be multiple of 8');
    });
  });

  describe('5. JSON解码测试', () => {
    it('应该正确解码JSON字符串', () => {
      const jsonData = '{"name": "John", "age": 30, "active": true}';
      const result = decoder.decode(jsonData, 'json');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'John',
        age: 30,
        active: true
      });
    });

    it('应该处理JSON数组', () => {
      const jsonData = '[1, 2, 3, "hello", true, null]';
      const result = decoder.decode(jsonData, 'json');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3, 'hello', true, null]);
    });

    it('应该处理嵌套JSON对象', () => {
      const jsonData = '{"user": {"name": "John", "details": {"age": 30}}}';
      const result = decoder.decode(jsonData, 'json');

      expect(result.success).toBe(true);
      expect(result.data.user.name).toBe('John');
      expect(result.data.user.details.age).toBe(30);
    });

    it('应该检测无效的JSON格式', () => {
      const invalidJson = '{"name": "John", "age": 30,}'; // 多余的逗号
      const result = decoder.decode(invalidJson, 'json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON parse error');
    });
  });

  describe('6. CSV解码测试', () => {
    it('应该正确解码CSV数据', () => {
      const csvData = `name,age,city
John,25,New York
Jane,30,Los Angeles
Bob,35,Chicago`;

      const result = decoder.decode(csvData, 'csv');

      expect(result.success).toBe(true);
      expect(result.data.headers).toEqual(['name', 'age', 'city']);
      expect(result.data.rowCount).toBe(3);
      expect(result.data.rows[0]).toEqual({
        name: 'John',
        age: 25,
        city: 'New York'
      });
    });

    it('应该处理数字转换', () => {
      const csvData = `sensor,value,timestamp
temp,25.5,1234567890
hum,60.2,1234567891`;

      const result = decoder.decode(csvData, 'csv');

      expect(result.success).toBe(true);
      expect(result.data.rows[0].value).toBe(25.5);
      expect(result.data.rows[0].timestamp).toBe(1234567890);
    });

    it('应该检测字段数量不匹配', () => {
      const csvData = `name,age,city
John,25
Jane,30,Los Angeles`; // 第一行缺少字段

      const result = decoder.decode(csvData, 'csv');

      expect(result.success).toBe(false);
      expect(result.error).toContain('field count mismatch');
    });

    it('应该处理空CSV数据', () => {
      const result = decoder.decode('', 'csv');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Empty CSV data');
    });
  });

  describe('7. 纯文本解码测试', () => {
    it('应该正确解码UTF-8文本', () => {
      const textData = 'Hello, 世界! 🌍';
      const result = decoder.decode(textData, 'plaintext');

      expect(result.success).toBe(true);
      expect(result.data.text).toBe(textData);
      expect(result.data.encoding).toBe('utf8');
    });

    it('应该处理Buffer输入', () => {
      const buffer = Buffer.from('Hello World', 'utf8');
      const result = decoder.decode(buffer, 'plaintext');

      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Hello World');
      expect(result.data.encoding).toBe('utf8');
    });

    it('应该检测编码格式', () => {
      const asciiBuffer = Buffer.from('Hello World', 'ascii');
      const result = decoder.decode(asciiBuffer, 'plaintext');

      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Hello World');
      expect(['utf8', 'ascii']).toContain(result.data.encoding);
    });
  });

  describe('8. 自定义解码测试', () => {
    it('应该使用自定义解码函数', () => {
      const customConfig: DecoderConfig = {
        defaultEncoding: 'custom',
        customDecoder: (data: Buffer | string) => {
          const str = Buffer.isBuffer(data) ? data.toString() : data;
          // 自定义协议：SENSOR:temp=25.5,hum=60.2
          const match = str.match(/SENSOR:(.+)/);
          if (!match) throw new Error('Invalid sensor data format');
          
          const pairs = match[1].split(',');
          const result: any = {};
          pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            result[key] = parseFloat(value);
          });
          return result;
        }
      };

      const customDecoder = new DataDecoder(customConfig);
      const sensorData = 'SENSOR:temp=25.5,hum=60.2';
      const result = customDecoder.decode(sensorData, 'custom');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        temp: 25.5,
        hum: 60.2
      });
    });

    it('应该提取自定义元数据', () => {
      const customConfig: DecoderConfig = {
        defaultEncoding: 'custom',
        customDecoder: (data: Buffer | string) => ({ value: 42 }),
        metadataExtractor: (data: Buffer | string) => ({
          length: Buffer.isBuffer(data) ? data.length : data.length,
          type: 'sensor'
        })
      };

      const customDecoder = new DataDecoder(customConfig);
      const result = customDecoder.decode('test data', 'custom');

      expect(result.success).toBe(true);
      expect(result.metadata).toEqual({
        length: 9,
        type: 'sensor'
      });
    });

    it('应该处理自定义解码器错误', () => {
      const customConfig: DecoderConfig = {
        defaultEncoding: 'custom',
        customDecoder: () => {
          throw new Error('Custom decoder failure');
        }
      };

      const customDecoder = new DataDecoder(customConfig);
      const result = customDecoder.decode('test', 'custom');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Custom decoder failed');
    });
  });

  describe('9. 编码格式自动检测测试', () => {
    it('应该检测JSON格式', () => {
      const jsonData = '{"name": "John"}';
      const encoding = decoder.detectEncoding(jsonData);
      expect(encoding).toBe('json');
    });

    it('应该检测Base64格式', () => {
      const base64Data = 'SGVsbG8gV29ybGQ=';
      const encoding = decoder.detectEncoding(base64Data);
      expect(encoding).toBe('base64');
    });

    it('应该检测十六进制格式', () => {
      const hexData = '48656C6C6F';
      const encoding = decoder.detectEncoding(hexData);
      expect(encoding).toBe('hex');
    });

    it('应该检测二进制格式', () => {
      const binaryData = '0100100001100101';
      const encoding = decoder.detectEncoding(binaryData);
      expect(encoding).toBe('binary');
    });

    it('应该检测CSV格式', () => {
      const csvData = 'name,age\nJohn,25';
      const encoding = decoder.detectEncoding(csvData);
      expect(encoding).toBe('csv');
    });

    it('应该默认为纯文本格式', () => {
      const textData = 'Hello World';
      const encoding = decoder.detectEncoding(textData);
      expect(encoding).toBe('plaintext');
    });
  });

  describe('10. 性能和统计测试', () => {
    it('应该正确跟踪解码统计信息', () => {
      // 执行多次解码
      decoder.decode('Hello', 'plaintext');
      decoder.decode('{"name": "John"}', 'json');
      decoder.decode('invalid json', 'json'); // 这个会失败

      const stats = decoder.getStatistics();
      
      expect(stats.totalDecoded).toBe(3);
      expect(stats.successCount).toBe(2);
      expect(stats.errorCount).toBe(1);
      expect(stats.averageTime).toBeGreaterThan(0);
    });

    it('应该测量解码性能', () => {
      const largeJsonData = JSON.stringify({
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `item_${i}`,
          value: Math.random() * 100
        }))
      });

      const startTime = performance.now();
      const result = decoder.decode(largeJsonData, 'json');
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(endTime - startTime + 1); // 允许1ms误差
    });

    it('应该处理高频解码请求', async () => {
      const testData = [
        { data: 'Hello World', encoding: 'plaintext' as DataEncoding },
        { data: '48656C6C6F', encoding: 'hex' as DataEncoding },
        { data: '{"value": 42}', encoding: 'json' as DataEncoding },
        { data: 'SGVsbG8=', encoding: 'base64' as DataEncoding }
      ];

      let successCount = 0;
      const iterations = 1000;
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const testItem = testData[i % testData.length];
        const result = decoder.decode(testItem.data, testItem.encoding);
        if (result.success) {
          successCount++;
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const decodesPerSecond = (iterations * 1000) / totalTime;

      expect(successCount).toBe(iterations);
      
      // 应该达到每秒至少1000次解码
      TestUtils.Assertions.Performance.assertThroughput(
        decodesPerSecond,
        1000,
        'Data decoding'
      );
    });

    it('应该重置统计信息', () => {
      // 执行一些解码
      decoder.decode('test1', 'plaintext');
      decoder.decode('test2', 'plaintext');

      let stats = decoder.getStatistics();
      expect(stats.totalDecoded).toBe(2);

      // 重置统计
      decoder.resetStatistics();

      stats = decoder.getStatistics();
      expect(stats.totalDecoded).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.errorCount).toBe(0);
      expect(stats.averageTime).toBe(0);
    });
  });

  describe('11. 边界条件和错误处理', () => {
    it('应该处理空输入', () => {
      const result = decoder.decode('', 'plaintext');
      expect(result.success).toBe(true);
      expect(result.data.text).toBe('');
    });

    it('应该处理空Buffer', () => {
      const result = decoder.decode(Buffer.alloc(0), 'plaintext');
      expect(result.success).toBe(true);
      expect(result.data.text).toBe('');
    });

    it('应该处理不支持的编码格式', () => {
      const result = decoder.decode('test', 'unsupported' as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported encoding');
    });

    it('应该处理大数据量', () => {
      const largeData = 'x'.repeat(1024 * 1024); // 1MB数据
      const result = decoder.decode(largeData, 'plaintext');

      expect(result.success).toBe(true);
      expect(result.data.text.length).toBe(1024 * 1024);
      expect(result.originalSize).toBe(1024 * 1024);
    });

    it('应该正确计算原始数据大小', () => {
      const textData = 'Hello 世界';
      const bufferData = Buffer.from(textData);

      const textResult = decoder.decode(textData, 'plaintext');
      const bufferResult = decoder.decode(bufferData, 'plaintext');

      expect(textResult.originalSize).toBe(Buffer.byteLength(textData));
      expect(bufferResult.originalSize).toBe(bufferData.length);
      expect(textResult.originalSize).toBe(bufferResult.originalSize);
    });
  });
});
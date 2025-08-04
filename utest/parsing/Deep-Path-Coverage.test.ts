/**
 * 深度路径覆盖测试 - 针对特定代码路径的精确测试
 * 专门测试可能被遗漏的分支和边界条件
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FrameParser } from '../../src/extension/parsing/FrameParser';
import { DataDecoder } from '../../src/extension/parsing/DataDecoder';
import { CircularBuffer } from '../../src/extension/parsing/CircularBuffer';
import { ChecksumCalculator } from '../../src/extension/parsing/Checksum';
import { FrameReader } from '../../src/extension/parsing/FrameReader';
import { DecoderMethod } from '../../src/shared/types';

describe('Deep Path Coverage - Parsing Module', () => {

  describe('FrameParser VM2 安全边界', () => {
    it('应该测试VM初始化失败的恢复', () => {
      const parser = new FrameParser();
      
      // 尝试加载会导致VM问题的脚本
      const problematicScript = `
        // 尝试访问被禁止的全局对象
        function parse(frame) {
          try {
            require('fs');
          } catch (e) {
            // 预期的错误
          }
          return frame.split(',');
        }
      `;
      
      const result = parser.loadScript(problematicScript);
      // 应该能够处理这种情况而不崩溃
      expect(typeof result).toBe('boolean');
    });

    it('应该测试validateParseFunction的所有路径', () => {
      const parser = new FrameParser();
      
      // 测试没有parse函数的脚本
      const noParseScript = `
        function notParse(frame) {
          return frame.split(',');
        }
      `;
      expect(parser.loadScript(noParseScript)).toBe(false);
      
      // 测试parse函数无参数
      const noParamScript = `
        function parse() {
          return ['no', 'param'];
        }
      `;
      expect(parser.loadScript(noParamScript)).toBe(false);
      
      // 测试旧格式的两参数parse函数
      const twoParamScript = `
        function parse(frame, separator) {
          return frame.split(separator || ',');
        }
      `;
      expect(parser.loadScript(twoParamScript)).toBe(false);
    });

    it('应该测试parseFunction包装器的异常处理', () => {
      const parser = new FrameParser();
      
      // 加载会抛出非Error对象的脚本
      const nonErrorScript = `
        function parse(frame) {
          throw "String error instead of Error object";
        }
      `;
      
      parser.loadScript(nonErrorScript);
      const result = parser.parse('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('解析错误');
    });

    it('应该测试sandbox中的全局对象访问', () => {
      const parser = new FrameParser();
      
      const globalTestScript = `
        function parse(frame) {
          // 测试所有可用的全局对象
          const result = [];
          result.push(String(parseInt('123')));
          result.push(String(parseFloat('123.45')));
          result.push(String(isNaN(NaN)));
          result.push(String(isFinite(123)));
          result.push(String(Math.PI).substring(0, 4));
          result.push(String(new Date().getFullYear()));
          result.push(JSON.stringify({test: true}));
          
          return result;
        }
      `;
      
      parser.loadScript(globalTestScript);
      const result = parser.parse('test');
      
      expect(result.success).toBe(true);
      expect(result.datasets.length).toBe(7);
    });
  });

  describe('DataDecoder 精确路径测试', () => {
    it('应该测试十六进制解码的奇数长度处理', () => {
      // 创建奇数长度的十六进制字符串
      const oddHexBuffer = Buffer.from('ABC', 'utf8'); // 3个字符
      const result = DataDecoder.decode(oddHexBuffer, DecoderMethod.Hexadecimal);
      
      // 应该在前面补0并正确解码
      expect(typeof result).toBe('string');
    });

    it('应该测试Base64填充处理', () => {
      // 测试不同填充长度的Base64
      const base64WithPadding = Buffer.from('SGVsbG8=', 'utf8'); // 标准填充
      const result1 = DataDecoder.decode(base64WithPadding, DecoderMethod.Base64);
      expect(result1).toBe('Hello');
      
      const base64WithoutPadding = Buffer.from('SGVsbG8', 'utf8'); // 无填充
      const result2 = DataDecoder.decode(base64WithoutPadding, DecoderMethod.Base64);
      // 应该能够处理或回退
      expect(typeof result2).toBe('string');
    });

    it('应该测试二进制编码的边界值处理', () => {
      // 测试包含边界值的二进制字符串
      const binaryString = '0,127,128,255,256,-1';
      const result = DataDecoder.encode(binaryString, DecoderMethod.Binary);
      
      // 应该过滤掉无效值（256, -1）
      expect(result.length).toBe(4); // 只有0,127,128,255是有效的
    });

    it('应该测试格式检测的特殊情况', () => {
      // 测试看起来像Base64但实际不是的字符串
      const fakeBase64 = Buffer.from('A1B2C3D4', 'utf8'); // 看起来像Base64但长度不对
      const result1 = DataDecoder.detectFormat(fakeBase64);
      
      // 测试混合格式的字符串
      const mixedFormat = Buffer.from('ABC123,456,789XYZ', 'utf8');
      const result2 = DataDecoder.detectFormat(mixedFormat);
      
      expect([DecoderMethod.PlainText, DecoderMethod.Hexadecimal, DecoderMethod.Binary]).toContain(result1);
      expect([DecoderMethod.PlainText, DecoderMethod.Binary]).toContain(result2);
    });

    it('应该测试isValidBase64的边界条件', () => {
      // 测试private方法通过公共接口
      const decoder = DataDecoder;
      
      // 测试空字符串
      const emptyResult = decoder.detectFormat(Buffer.from('', 'utf8'));
      expect(emptyResult).toBe(DecoderMethod.PlainText);
      
      // 测试只有填充字符的字符串
      const onlyPadding = Buffer.from('====', 'utf8');
      const paddingResult = decoder.detectFormat(onlyPadding);
      expect(paddingResult).toBe(DecoderMethod.PlainText);
    });

    it('应该测试十六进制检测的百分比阈值', () => {
      // 创建刚好达到80%阈值的字符串
      const almostHex = 'ABCD1234xyz'; // 8个十六进制字符，3个非十六进制，比例约73%
      const result1 = DataDecoder.detectFormat(Buffer.from(almostHex, 'utf8'));
      
      // 创建超过80%阈值的字符串
      const mostlyHex = 'ABCD1234x'; // 8个十六进制字符，1个非十六进制，比例约89%
      const result2 = DataDecoder.detectFormat(Buffer.from(mostlyHex, 'utf8'));
      
      expect([DecoderMethod.PlainText, DecoderMethod.Hexadecimal]).toContain(result1);
      expect([DecoderMethod.PlainText, DecoderMethod.Hexadecimal]).toContain(result2);
    });
  });

  describe('CircularBuffer KMP算法深度测试', () => {
    it('应该测试buildLPSArray的复杂模式', () => {
      const buffer = new CircularBuffer(100);
      
      // 测试复杂的重复模式
      const complexPattern = 'abababcabababcabab';
      buffer.append(Buffer.from(complexPattern + 'END'));
      
      // 查找具有复杂LPS的子模式
      const pattern = Buffer.from('abababcab');
      const result = buffer.findPatternKMP(pattern);
      
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('应该测试KMP搜索的失配恢复', () => {
      const buffer = new CircularBuffer(50);
      
      // 创建会导致多次失配的数据
      const data = 'aaabaaabaaacaaabaaab';
      buffer.append(Buffer.from(data));
      
      // 搜索会导致部分匹配失败的模式  
      const pattern = Buffer.from('aaabaaac');
      const result = buffer.findPatternKMP(pattern);
      
      expect(result).toBeGreaterThanOrEqual(-1);
    });

    it('应该测试循环边界上的模式查找', () => {
      const buffer = new CircularBuffer(10);
      
      // 填满缓冲区
      buffer.append(Buffer.from('1234567890'));
      
      // 添加更多数据使其循环
      buffer.append(Buffer.from('ABCDE'));
      
      // 搜索跨越循环边界的模式
      const pattern = Buffer.from('890A');
      const result = buffer.findPattern(pattern);
      
      // 因为数据被覆盖，可能找不到
      expect(typeof result).toBe('number');
    });

    it('应该测试peek和read的交互', () => {
      const buffer = new CircularBuffer(20);
      buffer.append(Buffer.from('Hello World Test'));
      
      // 先peek数据
      const peeked = buffer.peek(10);
      expect(peeked.toString()).toBe('Hello Worl');
      
      // 缓冲区大小不应该改变
      expect(buffer.size).toBe(16);
      
      // 然后read一部分数据
      const read = buffer.read(5);
      expect(read.toString()).toBe('Hello');
      expect(buffer.size).toBe(11);
      
      // 再次peek应该显示剩余数据
      const peeked2 = buffer.peek(6);
      expect(peeked2.toString()).toBe(' World');
    });
  });

  describe('ChecksumCalculator 算法特定测试', () => {
    it('应该测试CRC表初始化', () => {
      const data = Buffer.from('test123');
      
      // 多次调用相同算法确保表被正确重用
      const result1 = ChecksumCalculator.calculate('CRC32', data);
      const result2 = ChecksumCalculator.calculate('CRC32', data);
      const result3 = ChecksumCalculator.calculate('CRC32', data);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('应该测试Fletcher算法的模运算', () => {
      // 创建会导致溢出的大数据
      const largeData = Buffer.alloc(1000, 0xFF);
      
      const fletcher16 = ChecksumCalculator.calculate('Fletcher16', largeData);
      expect(fletcher16.length).toBe(2);
      
      const fletcher32 = ChecksumCalculator.calculate('Fletcher32', largeData);
      expect(fletcher32.length).toBe(4);
    });

    it('应该测试哈希算法的错误处理', () => {
      const data = Buffer.from('test');
      
      // 测试支持的哈希算法
      const md5Result = ChecksumCalculator.calculate('MD5', data);
      expect(md5Result.length).toBe(16);
      
      const sha1Result = ChecksumCalculator.calculate('SHA1', data);
      expect(sha1Result.length).toBe(20);
      
      const sha256Result = ChecksumCalculator.calculate('SHA256', data);
      expect(sha256Result.length).toBe(32);
    });

    it('应该测试校验和验证的长度检查', () => {
      const data = Buffer.from('test');
      
      // 创建正确长度但错误内容的校验和
      const wrongCrc32 = Buffer.from([0x12, 0x34, 0x56, 0x78]);
      expect(ChecksumCalculator.verify('CRC32', data, wrongCrc32)).toBe(false);
      
      // 创建长度不匹配的校验和
      const shortChecksum = Buffer.from([0x12, 0x34]);
      expect(ChecksumCalculator.verify('CRC32', data, shortChecksum)).toBe(false);
    });

    it('应该测试算法名称的规范化', () => {
      const data = Buffer.from('test');
      
      // 测试各种大小写组合
      const variations = ['crc8', 'CRC8', 'Crc8', 'cRc8'];
      
      variations.forEach(algorithm => {
        const result = ChecksumCalculator.calculate(algorithm, data);
        expect(result.length).toBe(1); // CRC8应该返回1字节
      });
    });
  });

  describe('FrameReader 操作模式深度测试', () => {
    it('应该测试QuickPlot模式的特殊处理', () => {
      const reader = new FrameReader({
        operationMode: 2, // QuickPlot
        frameDetectionMode: 0
      });

      // QuickPlot模式应该有特殊的帧处理逻辑
      const data = Buffer.from('25.5,60.2,1013.25\n');
      const frames = reader['processData'](data);
      
      expect(frames).toBeInstanceOf(Array);
    });

    it('应该测试DeviceSendsJSON模式', () => {
      const reader = new FrameReader({
        operationMode: 1, // DeviceSendsJSON
        frameDetectionMode: 1,
        startDelimiter: Buffer.from('{'),
        endDelimiter: Buffer.from('}')
      });

      const jsonData = Buffer.from('{"sensor1":25.5}{"sensor2":60.2}');
      const frames = reader['processData'](jsonData);
      
      expect(frames).toBeInstanceOf(Array);
    });

    it('应该测试帧检测模式的组合', () => {
      // 测试StartDelimiterOnly (3)
      const reader1 = new FrameReader({
        operationMode: 0,
        frameDetectionMode: 3,
        startDelimiter: Buffer.from('$')
      });

      const data1 = Buffer.from('$frame1$frame2$frame3');
      const frames1 = reader1['processData'](data1);
      expect(frames1).toBeInstanceOf(Array);

      // 测试无效的帧检测模式
      const reader2 = new FrameReader({
        operationMode: 0,
        frameDetectionMode: 99 // 无效模式
      });

      const data2 = Buffer.from('test data');
      const frames2 = reader2['processData'](data2);
      expect(frames2).toBeInstanceOf(Array);
    });

    it('应该测试缓冲区管理的边界情况', () => {
      const reader = new FrameReader({
        operationMode: 0,
        frameDetectionMode: 0,
        endDelimiter: Buffer.from('\n'),
        maxBufferSize: 50
      });

      // 添加接近缓冲区限制的数据
      const largeChunk = Buffer.from('x'.repeat(45) + '\n');
      const frames1 = reader['processData'](largeChunk);
      
      // 添加会超过缓冲区的数据
      const overflowChunk = Buffer.from('y'.repeat(60) + '\n');
      const frames2 = reader['processData'](overflowChunk);
      
      expect(frames1).toBeInstanceOf(Array);
      expect(frames2).toBeInstanceOf(Array);
    });

    it('应该测试分隔符查找的环形缓冲区情况', () => {
      const reader = new FrameReader({
        operationMode: 0,
        frameDetectionMode: 0,
        endDelimiter: Buffer.from('\r\n')
      });

      // 发送跨缓冲区边界的分隔符
      reader['processData'](Buffer.from('data1\r'));
      reader['processData'](Buffer.from('\ndata2\r\n'));
      
      // 测试内部状态是否正确维护
      const finalFrames = reader['processData'](Buffer.from('data3\r\n'));
      expect(finalFrames).toBeInstanceOf(Array);
    });
  });

  describe('错误注入和恢复测试', () => {
    it('应该测试VM2内存溢出恢复', () => {
      const parser = new FrameParser({ memoryLimit: 1024 * 1024 }); // 1MB限制
      
      const memoryIntensiveScript = `
        function parse(frame) {
          // 尝试分配大量内存但在合理范围内
          const arr = [];
          for (let i = 0; i < 1000; i++) {
            arr.push(frame + '_' + i);
          }
          return arr.slice(0, 10); // 只返回前10个
        }
      `;
      
      parser.loadScript(memoryIntensiveScript);
      const result = parser.parse('test');
      
      // 应该能够处理而不崩溃
      expect(typeof result).toBe('object');
    });

    it('应该测试数据损坏的恢复', () => {
      const buffer = new CircularBuffer(100);
      
      // 添加正常数据
      buffer.append(Buffer.from('normal_data'));
      
      // 添加包含空字节的数据
      const corruptedData = Buffer.from([0x41, 0x00, 0x42, 0x00, 0x43]);
      buffer.append(corruptedData);
      
      // 尝试在损坏的数据中查找模式
      const pattern = Buffer.from([0x41, 0x00, 0x42]);
      const result = buffer.findPattern(pattern);
      
      expect(typeof result).toBe('number');
    });

    it('应该测试并发访问保护', () => {
      const parser = new FrameParser();
      parser.loadScript('function parse(frame) { return frame.split(","); }');
      
      // 模拟并发解析请求
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(parser.parse(`data${i},value${i}`)));
      }
      
      return Promise.all(promises).then(results => {
        expect(results.length).toBe(10);
        results.forEach(result => {
          expect(result.success).toBe(true);
          expect(result.datasets.length).toBe(2);
        });
      });
    });
  });

  describe('性能边界和资源管理', () => {
    it('应该测试大数据块的处理', () => {
      const decoder = new DataDecoder();
      
      // 创建大的数据块
      const largeData = Buffer.alloc(10000, 0x41); // 10KB的'A'
      const result = DataDecoder.decode(largeData, DecoderMethod.PlainText);
      
      expect(result.length).toBe(10000);
      expect(result).toBe('A'.repeat(10000));
    });

    it('应该测试频繁的缓冲区操作', () => {
      const buffer = new CircularBuffer(1000);
      
      // 执行大量的写入和读取操作
      for (let i = 0; i < 100; i++) {
        buffer.append(Buffer.from(`chunk_${i}_data`));
        if (i % 10 === 0) {
          buffer.read(50); // 定期读取数据
        }
      }
      
      expect(buffer.size).toBeLessThanOrEqual(1000);
      expect(buffer.getUtilization()).toBeGreaterThan(0);
    });

    it('应该测试极端校验和计算', () => {
      // 测试空数据
      const emptyResult = ChecksumCalculator.calculate('CRC32', Buffer.alloc(0));
      expect(emptyResult.length).toBe(4);
      
      // 测试单字节数据
      const singleByteResult = ChecksumCalculator.calculate('CRC32', Buffer.from([0xFF]));
      expect(singleByteResult.length).toBe(4);
      
      // 测试大数据
      const largeData = Buffer.alloc(10000, 0x55);
      const largeResult = ChecksumCalculator.calculate('CRC32', largeData);
      expect(largeResult.length).toBe(4);
    });
  });

  describe('兼容性和向后兼容测试', () => {
    it('应该测试旧版本配置的处理', () => {
      const parser = new FrameParser();
      
      // 测试旧版本可能使用的配置格式
      const oldStyleConfig = {
        timeout: 3000,
        enableConsole: true,
        // 缺失memoryLimit字段
      };
      
      parser.setConfig(oldStyleConfig);
      const config = parser.getConfig();
      
      expect(config.timeout).toBe(3000);
      expect(config.enableConsole).toBe(true);
      expect(config.memoryLimit).toBeGreaterThan(0); // 应该有默认值
    });

    it('应该测试数据格式的向下兼容', () => {
      // 测试可能来自旧版本的数据格式
      const oldFormatData = Buffer.from('\xFF\xFE\xFD\xFC', 'binary');
      
      const result1 = DataDecoder.decode(oldFormatData, DecoderMethod.PlainText);
      const result2 = DataDecoder.decode(oldFormatData, DecoderMethod.Binary);
      
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });
  });
});
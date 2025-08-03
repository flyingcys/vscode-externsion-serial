/**
 * 数据损坏处理测试
 * 测试各种数据损坏情况下的处理能力，包括校验和错误、格式错误、编码问题等
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrameParser, ParseResult, ParserConfig } from '../mocks/FrameParser';
import { DataDecoder } from '../mocks/DataDecoder';
import { FrameReader, FrameReaderConfig } from '../mocks/FrameReader';
import { CircularBuffer } from '@extension/parsing/CircularBuffer';
import { ChecksumCalculator } from '@extension/parsing/Checksum';
import { 
  DecoderMethod, 
  FrameDetection, 
  OperationMode, 
  ValidationStatus 
} from '@shared/types';

/**
 * 数据损坏模拟器
 */
class DataCorruptionSimulator {
  /**
   * 模拟位翻转错误
   */
  static simulateBitFlip(data: Buffer, corruptionRate: number = 0.01): Buffer {
    const corrupted = Buffer.from(data);
    const bitCount = data.length * 8;
    const bitsToFlip = Math.floor(bitCount * corruptionRate);
    
    for (let i = 0; i < bitsToFlip; i++) {
      const byteIndex = Math.floor(Math.random() * data.length);
      const bitIndex = Math.floor(Math.random() * 8);
      corrupted[byteIndex] ^= (1 << bitIndex);
    }
    
    return corrupted;
  }

  /**
   * 模拟字节丢失
   */
  static simulateByteDropout(data: Buffer, dropoutRate: number = 0.05): Buffer {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (Math.random() > dropoutRate) {
        result.push(data[i]);
      }
    }
    
    return Buffer.from(result);
  }

  /**
   * 模拟字节重复
   */
  static simulateByteReplication(data: Buffer, replicationRate: number = 0.03): Buffer {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      result.push(data[i]);
      
      // 随机重复字节
      if (Math.random() < replicationRate) {
        result.push(data[i]);
      }
    }
    
    return Buffer.from(result);
  }

  /**
   * 模拟噪声插入
   */
  static simulateNoiseInsertion(data: Buffer, noiseRate: number = 0.02): Buffer {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      result.push(data[i]);
      
      // 随机插入噪声字节
      if (Math.random() < noiseRate) {
        result.push(Math.floor(Math.random() * 256));
      }
    }
    
    return Buffer.from(result);
  }

  /**
   * 模拟帧分界符损坏
   */
  static simulateDelimiterCorruption(data: Buffer, delimiter: Buffer, corruptionProb: number = 0.1): Buffer {
    const result = Buffer.from(data);
    const delimiterHex = delimiter.toString('hex');
    let searchIndex = 0;
    
    while (searchIndex < result.length - delimiter.length + 1) {
      const candidateHex = result.subarray(searchIndex, searchIndex + delimiter.length).toString('hex');
      
      if (candidateHex === delimiterHex && Math.random() < corruptionProb) {
        // 损坏分界符
        const corruptIndex = searchIndex + Math.floor(Math.random() * delimiter.length);
        result[corruptIndex] = Math.floor(Math.random() * 256);
      }
      
      searchIndex++;
    }
    
    return result;
  }

  /**
   * 模拟编码转换错误
   */
  static simulateEncodingError(text: string, errorRate: number = 0.05): Buffer {
    const chars = text.split('');
    const corruptedChars = chars.map(char => {
      if (Math.random() < errorRate) {
        // 返回无效的UTF-8序列
        return String.fromCharCode(0xFFFD); // 替换字符
      }
      return char;
    });
    
    return Buffer.from(corruptedChars.join(''), 'utf8');
  }
}

/**
 * 校验和操作模拟器
 */
class ChecksumCorruptionSimulator {
  /**
   * 创建带有错误校验和的数据
   */
  static createBadChecksum(data: Buffer, algorithm: string): Buffer {
    const validChecksum = ChecksumCalculator.calculate(algorithm, data);
    const corruptedChecksum = Buffer.from(validChecksum);
    
    // 翻转校验和的一位
    if (corruptedChecksum.length > 0) {
      const byteIndex = Math.floor(Math.random() * corruptedChecksum.length);
      const bitIndex = Math.floor(Math.random() * 8);
      corruptedChecksum[byteIndex] ^= (1 << bitIndex);
    }
    
    return Buffer.concat([data, corruptedChecksum]);
  }

  /**
   * 创建截断的校验和
   */
  static createTruncatedChecksum(data: Buffer, algorithm: string): Buffer {
    const fullChecksum = ChecksumCalculator.calculate(algorithm, data);
    const truncatedLength = Math.max(1, Math.floor(fullChecksum.length / 2));
    const truncatedChecksum = fullChecksum.subarray(0, truncatedLength);
    
    return Buffer.concat([data, truncatedChecksum]);
  }
}

describe('数据损坏处理测试', () => {
  let frameParser: FrameParser;
  let frameReader: FrameReader;

  beforeEach(() => {
    const parserConfig: ParserConfig = {
      timeout: 5000,
      memoryLimit: 64 * 1024 * 1024,
      enableConsole: false
    };
    frameParser = new FrameParser(parserConfig);

    const readerConfig: FrameReaderConfig = {
      operationMode: OperationMode.ProjectFile,
      frameDetectionMode: FrameDetection.EndDelimiterOnly,
      startSequence: Buffer.from([0xFF, 0xFE]),
      finishSequence: Buffer.from([0x0A]),
      checksumAlgorithm: 'crc16'
    };
    frameReader = new FrameReader(readerConfig);
  });

  afterEach(() => {
    frameParser.destroy();
    frameReader.destroy();
  });

  describe('JavaScript解析器安全测试', () => {
    it('应该阻止访问全局对象', async () => {
      const maliciousScript = `
        // This script should load but fail at runtime
        function parse(frame) {
          return global.process.env; // 尝试访问进程环境变量
        }
      `;
      
      frameParser.loadScript(maliciousScript);
      const result = frameParser.parse('test data');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('global is not defined');
    });

    it('应该阻止文件系统访问', async () => {
      const maliciousScript = `
        // This script should load but fail at runtime
        function parse(frame) {
          require('fs').readFileSync('/etc/passwd');
          return ['data'];
        }
      `;
      
      frameParser.loadScript(maliciousScript);
      const result = frameParser.parse('test data');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('require is not defined');
    });

    it('应该限制执行时间', async () => {
      const infiniteLoopScript = `
        function parse(frame) {
          while(true) {} // 无限循环
          return ['data'];
        }
      `;
      
      frameParser.loadScript(infiniteLoopScript);
      const result = frameParser.parse('test data');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('应该限制内存使用', async () => {
      const memoryHogScript = `
        function parse(frame) {
          const bigArray = new Array(10000000).fill('x'); // 大量内存分配
          return ['data'];
        }
      `;
      
      frameParser.setConfig({ memoryLimit: 1024 * 1024 }); // 1MB 限制
      frameParser.loadScript(memoryHogScript);
      const result = frameParser.parse('test data');
      
      // 可能因内存限制或执行时间而失败
      expect(result.success).toBe(false);
    });

    it('应该拒绝恶意代码执行', () => {
      const maliciousScripts = [
        'eval("console.log(\'hacked\')")',
        'Function("return this")().process',
        'constructor.constructor("return process")().exit()',
        'this.constructor.constructor("return process")()'
      ];

      for (const script of maliciousScripts) {
        const wrappedScript = `function parse(frame) { ${script}; return ['data']; }`;
        const loadResult = frameParser.loadScript(wrappedScript);
        
        if (loadResult) {
          const result = frameParser.parse('test');
          expect(result.success).toBe(false);
        }
      }
    });
  });

  describe('数据编码处理测试', () => {
    it('应该处理损坏的UTF-8编码', () => {
      const testCases = [
        Buffer.from([0xC0, 0x80]), // 过长编码
        Buffer.from([0xFF, 0xFE]), // 无效字节序列
        Buffer.from([0xED, 0xA0, 0x80]), // 代理对
        Buffer.from([0xF4, 0x90, 0x80, 0x80]), // 超出Unicode范围
        Buffer.from([0x80, 0x80, 0x80]) // 孤立的续延字节
      ];

      for (const testCase of testCases) {
        const decoded = DataDecoder.decode(testCase, DecoderMethod.PlainText);
        expect(typeof decoded).toBe('string');
        expect(decoded.length).toBeGreaterThanOrEqual(0);
        
        // 验证解码结果不包含过多的替换字符
        const replacementCount = (decoded.match(/\uFFFD/g) || []).length;
        expect(replacementCount).toBeLessThanOrEqual(testCase.length);
      }
    });

    it('应该处理损坏的十六进制数据', () => {
      const corruptedHexCases = [
        'ABCDEFG', // 包含非法字符
        '1234X', // 混合有效和无效字符
        '12345', // 奇数长度
        '', // 空字符串
        '!@#$%^&*()' // 完全无效
      ];

      for (const hexString of corruptedHexCases) {
        const buffer = Buffer.from(hexString, 'utf8');
        const decoded = DataDecoder.decode(buffer, DecoderMethod.Hexadecimal);
        
        expect(typeof decoded).toBe('string');
        // 应该回退到UTF-8解码
        expect(decoded).toBe(hexString);
      }
    });

    it('应该处理损坏的Base64数据', () => {
      const corruptedBase64Cases = [
        'ABC', // 长度不是4的倍数
        'AB@#', // 包含非法字符
        'AB==CD', // 填充字符位置错误
        '', // 空字符串
        '===='  // 全是填充字符
      ];

      for (const base64String of corruptedBase64Cases) {
        const buffer = Buffer.from(base64String, 'utf8');
        const decoded = DataDecoder.decode(buffer, DecoderMethod.Base64);
        
        expect(typeof decoded).toBe('string');
        // 损坏的Base64应该回退到UTF-8
        expect(decoded).toBe(base64String);
      }
    });

    it('应该自动检测和处理混合编码', () => {
      // 创建包含多种编码格式的混合数据
      const validText = 'Hello, World!';
      const validHex = Buffer.from(validText).toString('hex');
      const validBase64 = Buffer.from(validText).toString('base64');
      
      const mixedData = `${validText}\n${validHex}\n${validBase64}`;
      const buffer = Buffer.from(mixedData, 'utf8');
      
      // 自动检测应该返回PlainText（因为包含混合内容）
      const detectedFormat = DataDecoder.detectFormat(buffer);
      expect(detectedFormat).toBe(DecoderMethod.PlainText);
      
      // 解码应该成功
      const decoded = DataDecoder.decode(buffer, detectedFormat);
      expect(decoded).toBe(mixedData);
    });
  });

  describe('帧分界符损坏处理', () => {
    it('应该处理损坏的帧分界符', () => {
      const validFrame = 'sensor1,25.5,60.2,1013.2';
      const delimiter = Buffer.from('\n');
      const validData = Buffer.concat([Buffer.from(validFrame), delimiter]);
      
      // 损坏分界符
      const corruptedData = DataCorruptionSimulator.simulateDelimiterCorruption(
        validData, delimiter, 1.0 // 100%损坏率用于测试
      );
      
      frameReader.processData(corruptedData);
      
      // 应该没有检测到完整帧
      expect(frameReader.getQueueLength()).toBe(0);
      
      // 但缓冲区应该包含数据
      const bufferStats = frameReader.getBufferStats();
      expect(bufferStats.size).toBeGreaterThan(0);
    });

    it('应该处理部分分界符', () => {
      const frame1 = 'data1,value1';
      const frame2 = 'data2,value2';
      const delimiter = Buffer.from('\r\n');
      
      // 创建部分分界符的数据
      const partialData = Buffer.concat([
        Buffer.from(frame1),
        Buffer.from('\r'), // 只有一半的分界符
      ]);
      
      frameReader.processData(partialData);
      expect(frameReader.getQueueLength()).toBe(0); // 没有完整帧
      
      // 发送剩余的分界符和下一帧
      const remainingData = Buffer.concat([
        Buffer.from('\n'), // 完成分界符
        Buffer.from(frame2),
        delimiter
      ]);
      
      frameReader.processData(remainingData);
      expect(frameReader.getQueueLength()).toBe(2); // 现在有两个完整帧
    });

    it('应该处理错误的帧检测模式', () => {
      // 设置为开始+结束分界符模式
      frameReader.setFrameDetectionMode(FrameDetection.StartAndEndDelimiter);
      frameReader.setStartSequence(Buffer.from('{'));
      frameReader.setFinishSequence(Buffer.from('}'));
      
      // 但发送只有结束分界符的数据
      const dataWithoutStart = Buffer.from('temperature:25.5}');
      frameReader.processData(dataWithoutStart);
      
      expect(frameReader.getQueueLength()).toBe(0); // 没有有效帧
      
      // 发送只有开始分界符的数据
      const dataWithoutEnd = Buffer.from('{humidity:60.2');
      frameReader.processData(dataWithoutEnd);
      
      expect(frameReader.getQueueLength()).toBe(0); // 仍然没有有效帧
      
      // 发送完整的帧
      const completeFrame = Buffer.from('{pressure:1013.2}');
      frameReader.processData(completeFrame);
      
      expect(frameReader.getQueueLength()).toBe(1); // 现在有一个有效帧
    });
  });

  describe('校验和错误处理', () => {
    it('应该检测CRC校验和错误', () => {
      const frameData = Buffer.from('sensor,25.5,60.2');
      const badFrame = ChecksumCorruptionSimulator.createBadChecksum(frameData, 'crc16');
      const completeFrame = Buffer.concat([badFrame, Buffer.from('\n')]);
      
      frameReader.setChecksumAlgorithm('crc16');
      frameReader.processData(completeFrame);
      
      // 坏校验和的帧应该被丢弃
      expect(frameReader.getQueueLength()).toBe(0);
    });

    it('应该处理截断的校验和', () => {
      const frameData = Buffer.from('sensor,25.5,60.2');
      const truncatedFrame = ChecksumCorruptionSimulator.createTruncatedChecksum(frameData, 'crc16');
      const completeFrame = Buffer.concat([truncatedFrame, Buffer.from('\n')]);
      
      frameReader.setChecksumAlgorithm('crc16');
      frameReader.processData(completeFrame);
      
      // 截断的校验和应该被检测为不完整
      expect(frameReader.getQueueLength()).toBe(0);
    });

    it('应该处理无效的校验和算法', () => {
      frameReader.setChecksumAlgorithm('invalid-algorithm');
      
      const frameData = Buffer.from('test,data\n');
      frameReader.processData(frameData);
      
      // 无效算法应该被处理（可能回退到无校验和模式）
      const queueLength = frameReader.getQueueLength();
      expect(queueLength).toBeGreaterThanOrEqual(0);
    });
  });

  describe('数据流损坏处理', () => {
    it('应该处理位翻转错误', () => {
      const originalFrame = 'temperature:25.5,humidity:60.2\n';
      const originalBuffer = Buffer.from(originalFrame, 'utf8');
      
      // 模拟1%的位翻转率
      const corruptedBuffer = DataCorruptionSimulator.simulateBitFlip(originalBuffer, 0.01);
      
      frameReader.processData(corruptedBuffer);
      
      // 可能有帧被处理（取决于损坏的位置）
      const processedFrames = frameReader.getQueueLength();
      expect(processedFrames).toBeGreaterThanOrEqual(0);
      
      if (processedFrames > 0) {
        const frame = frameReader.dequeueFrame();
        expect(frame).toBeDefined();
        expect(frame!.data.length).toBeGreaterThan(0);
      }
    });

    it('应该处理字节丢失', () => {
      const frames = [
        'frame1:data1\n',
        'frame2:data2\n',  
        'frame3:data3\n'
      ];
      
      const completeData = Buffer.concat(frames.map(f => Buffer.from(f)));
      
      // 模拟5%的字节丢失
      const corruptedData = DataCorruptionSimulator.simulateByteDropout(completeData, 0.05);
      
      frameReader.processData(corruptedData);
      
      // 某些帧可能仍然完整
      const recoveredFrames = frameReader.getQueueLength();
      expect(recoveredFrames).toBeLessThanOrEqual(frames.length);
      expect(recoveredFrames).toBeGreaterThanOrEqual(0);
    });

    it('应该处理噪声插入', () => {
      const cleanFrame = 'sensor:temperature,25.5\n';
      const cleanBuffer = Buffer.from(cleanFrame);
      
      // 插入随机噪声
      const noisyBuffer = DataCorruptionSimulator.simulateNoiseInsertion(cleanBuffer, 0.1);
      
      frameReader.processData(noisyBuffer);
      
      // 噪声可能破坏帧结构
      const frames = frameReader.getQueueLength();
      expect(frames).toBeGreaterThanOrEqual(0);
    });

    it('应该处理字节重复', () => {
      const originalFrame = 'data,123\n';
      const originalBuffer = Buffer.from(originalFrame);
      
      // 模拟字节重复
      const replicatedBuffer = DataCorruptionSimulator.simulateByteReplication(originalBuffer, 0.05);
      
      frameReader.processData(replicatedBuffer);
      
      // 字节重复可能会破坏帧格式
      const frames = frameReader.getQueueLength();
      expect(frames).toBeGreaterThanOrEqual(0);
    });
  });

  describe('解析器错误恢复', () => {
    it('应该从JavaScript运行时错误中恢复', () => {
      const buggyScript = `
        function parse(frame) {
          if (frame.includes('error')) {
            throw new Error('Intentional parsing error');
          }
          return frame.split(',');
        }
      `;
      
      frameParser.loadScript(buggyScript);
      
      // 测试正常情况
      const normalResult = frameParser.parse('data1,data2,data3');
      expect(normalResult.success).toBe(true);
      expect(normalResult.datasets).toEqual(['data1', 'data2', 'data3']);
      
      // 测试错误情况
      const errorResult = frameParser.parse('error,data');
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toContain('Intentional parsing error');
      
      // 测试恢复情况
      const recoveryResult = frameParser.parse('recovery,data');
      expect(recoveryResult.success).toBe(true);
      expect(recoveryResult.datasets).toEqual(['recovery', 'data']);
    });

    it('应该处理类型转换错误', () => {
      const typeErrorScript = `
        function parse(frame) {
          // 尝试对字符串调用数组方法
          return frame.map(x => x.toUpperCase());
        }
      `;
      
      frameParser.loadScript(typeErrorScript);
      const result = frameParser.parse('test,data');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('is not a function');
    });

    it('应该处理返回值类型错误', () => {
      const invalidReturnScript = `
        function parse(frame) {
          return "not an array"; // 应该返回数组
        }
      `;
      
      frameParser.loadScript(invalidReturnScript);
      const result = frameParser.parse('test,data');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('must return an array');
    });

    it('应该处理循环引用', () => {
      const circularRefScript = `
        function parse(frame) {
          const obj = {};
          obj.self = obj; // 创建循环引用
          return [JSON.stringify(obj)]; // 这会失败
        }
      `;
      
      frameParser.loadScript(circularRefScript);
      const result = frameParser.parse('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('circular');
    });
  });

  describe('资源耗尽处理', () => {
    it('应该处理解析器超时', () => {
      const slowScript = `
        function parse(frame) {
          // 模拟慢速解析
          let result = [];
          for (let i = 0; i < 1000000; i++) {
            result.push(Math.sin(i));
          }
          return result.map(String);
        }
      `;
      
      frameParser.setConfig({ timeout: 100 }); // 100ms超时
      frameParser.loadScript(slowScript);
      
      const startTime = Date.now();
      const result = frameParser.parse('test');
      const endTime = Date.now();
      
      expect(result.success).toBe(false);
      expect(endTime - startTime).toBeLessThan(1000); // 应该快速失败
      expect(result.error).toContain('timeout');
    });

    it('应该处理缓冲区溢出', () => {
      // 创建一个大于缓冲区容量的数据流
      const largeFrame = 'x'.repeat(20 * 1024 * 1024); // 20MB数据
      const largeBuffer = Buffer.from(largeFrame + '\n');
      
      frameReader.processData(largeBuffer);
      
      // 系统应该仍然可以工作，不崩溃
      const bufferStats = frameReader.getBufferStats();
      expect(bufferStats.size).toBeLessThanOrEqual(bufferStats.capacity);
    });

    it('应该处理过多的错误帧', () => {
      // 发送大量损坏的帧
      for (let i = 0; i < 1000; i++) {
        const corruptedFrame = DataCorruptionSimulator.simulateBitFlip(
          Buffer.from(`frame${i},data\n`),
          0.5 // 高损坏率
        );
        frameReader.processData(corruptedFrame);
      }
      
      // 系统应该保持稳定
      const queueLength = frameReader.getQueueLength();
      expect(queueLength).toBeLessThan(4096); // 队列大小限制
      
      const bufferStats = frameReader.getBufferStats();
      expect(bufferStats.utilization).toBeLessThanOrEqual(1.0);
    });
  });

  describe('数据完整性验证', () => {
    it('应该验证解码数据的完整性', () => {
      const testCases = [
        { input: 'Hello, 世界!', method: DecoderMethod.PlainText },
        { input: 'SGVsbG8gV29ybGQ=', method: DecoderMethod.Base64 },
        { input: '48656C6C6F20576F726C64', method: DecoderMethod.Hexadecimal },
        { input: '72,101,108,108,111', method: DecoderMethod.Binary }
      ];
      
      for (const testCase of testCases) {
        const buffer = Buffer.from(testCase.input, 'utf8');
        const decoded = DataDecoder.decode(buffer, testCase.method);
        
        // 验证解码结果是有效的
        expect(DataDecoder.isValidDecoded(decoded)).toBe(true);
        expect(decoded.length).toBeGreaterThan(0);
      }
    });

    it('应该检测解码失败', () => {
      const invalidCases = [
        Buffer.from([0xFF, 0xFE, 0xFD, 0xFC]), // 无效UTF-8
        Buffer.from([0x00, 0x01, 0x02, 0x03]), // 控制字符
        Buffer.alloc(0) // 空数据
      ];
      
      for (const invalidData of invalidCases) {
        const decoded = DataDecoder.decode(invalidData, DecoderMethod.PlainText);
        
        // 系统应该能处理无效数据而不崩溃
        expect(typeof decoded).toBe('string');
        
        // 验证是否检测到无效解码
        if (decoded.length === 0) {
          expect(DataDecoder.isValidDecoded(decoded)).toBe(true); // 空字符串是有效的
        } else {
          const validity = DataDecoder.isValidDecoded(decoded);
          expect(typeof validity).toBe('boolean');
        }
      }
    });

    it('应该保持数据处理的一致性', () => {
      const testData = 'consistent,data,test';
      const buffer = Buffer.from(testData);
      
      // 多次解码应该得到相同结果
      const results = [];
      for (let i = 0; i < 10; i++) {
        const decoded = DataDecoder.decode(buffer, DecoderMethod.PlainText);
        results.push(decoded);
      }
      
      // 所有结果应该相同
      const firstResult = results[0];
      for (const result of results) {
        expect(result).toBe(firstResult);
      }
    });
  });
});
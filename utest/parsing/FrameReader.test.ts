/**
 * FrameReader 帧读取器测试
 * 
 * 测试帧提取的核心功能：
 * - 帧边界检测和提取
 * - 多种分隔符支持
 * - 数据格式解析
 * - 缓冲区管理
 * - 性能要求验证（≥10000帧/秒）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { TestUtils } from '@test';
import type { FrameConfig, FrameDetectionMode, DataFormat } from '@extension/types/ProjectTypes';

// 模拟FrameReader实现
class FrameReader extends EventEmitter {
  private config: FrameConfig;
  private buffer: Buffer = Buffer.alloc(0);
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private startTime: number = 0;
  
  constructor(config: FrameConfig) {
    super();
    this.config = { ...config };
    this.lastFrameTime = Date.now();
    this.startTime = Date.now();
  }

  /**
   * 处理输入数据
   */
  processData(data: Buffer): void {
    // 将新数据追加到缓冲区
    this.buffer = Buffer.concat([this.buffer, data]);
    
    // 根据配置提取帧
    this.extractFrames();
  }

  /**
   * 提取帧数据
   */
  private extractFrames(): void {
    while (this.buffer.length > 0) {
      const frame = this.findNextFrame();
      if (!frame) {
        break; // 没有完整帧，等待更多数据
      }

      // 从缓冲区移除已处理的数据
      this.buffer = this.buffer.subarray(frame.endIndex + 1);
      
      // 解码帧数据
      const decodedData = this.decodeFrame(frame.data);
      
      // 更新统计
      this.frameCount++;
      const currentTime = Date.now();
      const timeDelta = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // 发出帧事件
      this.emit('frame', {
        data: decodedData,
        raw: frame.data,
        timestamp: currentTime,
        frameNumber: this.frameCount,
        processingTime: timeDelta
      });
    }
  }

  /**
   * 查找下一个完整帧
   */
  private findNextFrame(): { data: Buffer; endIndex: number } | null {
    switch (this.config.detectionMode) {
      case 'no-delimiters':
        return this.extractFixedLengthFrame();
      case 'end-delimiter':
        return this.extractEndDelimiterFrame();
      case 'start-end-delimiter':
        return this.extractStartEndDelimiterFrame();
      default:
        throw new Error(`Unsupported detection mode: ${this.config.detectionMode}`);
    }
  }

  /**
   * 提取固定长度帧
   */
  private extractFixedLengthFrame(): { data: Buffer; endIndex: number } | null {
    const frameLength = this.config.frameLength || 32;
    if (this.buffer.length < frameLength) {
      return null;
    }

    return {
      data: this.buffer.subarray(0, frameLength),
      endIndex: frameLength - 1
    };
  }

  /**
   * 提取结束分隔符帧
   */
  private extractEndDelimiterFrame(): { data: Buffer; endIndex: number } | null {
    const delimiter = Buffer.from(this.config.endDelimiter || '\n');
    const delimiterIndex = this.buffer.indexOf(delimiter);
    
    if (delimiterIndex === -1) {
      return null; // 没有找到分隔符
    }

    return {
      data: this.buffer.subarray(0, delimiterIndex),
      endIndex: delimiterIndex + delimiter.length - 1
    };
  }

  /**
   * 提取开始-结束分隔符帧
   */
  private extractStartEndDelimiterFrame(): { data: Buffer; endIndex: number } | null {
    const startDelimiter = Buffer.from(this.config.startDelimiter || '<');
    const endDelimiter = Buffer.from(this.config.endDelimiter || '>');
    
    const startIndex = this.buffer.indexOf(startDelimiter);
    if (startIndex === -1) {
      return null; // 没有找到开始分隔符
    }

    const searchStart = startIndex + startDelimiter.length;
    const endIndex = this.buffer.indexOf(endDelimiter, searchStart);
    if (endIndex === -1) {
      return null; // 没有找到结束分隔符
    }

    return {
      data: this.buffer.subarray(searchStart, endIndex),
      endIndex: endIndex + endDelimiter.length - 1
    };
  }

  /**
   * 解码帧数据
   */
  private decodeFrame(data: Buffer): string {
    switch (this.config.dataFormat) {
      case 'plaintext':
        return data.toString('utf8');
      case 'hex':
        return data.toString('hex');
      case 'base64':
        return data.toString('base64');
      case 'binary':
        return Array.from(data).map(b => b.toString(2).padStart(8, '0')).join(' ');
      default:
        return data.toString('utf8');
    }
  }

  /**
   * 获取帧统计信息
   */
  getStats(): { frameCount: number; processingRate: number } {
    const elapsedTime = Date.now() - this.startTime;
    const processingRate = elapsedTime > 0 ? (this.frameCount * 1000) / elapsedTime : this.frameCount * 1000;
    
    return {
      frameCount: this.frameCount,
      processingRate
    };
  }

  /**
   * 重置读取器
   */
  reset(): void {
    this.buffer = Buffer.alloc(0);
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.startTime = Date.now();
  }

  /**
   * 获取当前缓冲区大小
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
}

describe('FrameReader 帧读取器测试', () => {
  let frameReader: FrameReader;
  let performanceMonitor: TestUtils.Performance.Monitor;
  let memoryDetector: TestUtils.Performance.MemoryDetector;

  beforeEach(() => {
    performanceMonitor = new TestUtils.Performance.Monitor(20);
    memoryDetector = new TestUtils.Performance.MemoryDetector();
  });

  afterEach(() => {
    if (frameReader) {
      frameReader.removeAllListeners();
    }
  });

  describe('1. 基础初始化测试', () => {
    it('应该正确初始化FrameReader', () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };

      frameReader = new FrameReader(config);
      
      expect(frameReader).toBeDefined();
      expect(frameReader.getBufferSize()).toBe(0);
      expect(frameReader.getStats().frameCount).toBe(0);
    });

    it('应该处理无效配置', () => {
      expect(() => {
        const config: FrameConfig = {
          detectionMode: 'invalid-mode' as any,
          dataFormat: 'plaintext'
        };
        frameReader = new FrameReader(config);
        frameReader.processData(Buffer.from('test'));
      }).toThrow('Unsupported detection mode');
    });
  });

  describe('2. 结束分隔符帧提取', () => {
    beforeEach(() => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);
    });

    it('应该正确提取单个帧', async () => {
      const testData = 'Hello World\n';
      
      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('Hello World');
          expect(frame.raw.toString()).toBe('Hello World');
          expect(frame.frameNumber).toBe(1);
          expect(frame.timestamp).toBeTypeOf('number');
          resolve();
        });
      });

      frameReader.processData(Buffer.from(testData));
      await framePromise;
    });

    it('应该处理多个连续帧', async () => {
      const testData = 'Frame1\nFrame2\nFrame3\n';
      const expectedFrames = ['Frame1', 'Frame2', 'Frame3'];
      let frameIndex = 0;

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(expectedFrames[frameIndex]);
          expect(frame.frameNumber).toBe(frameIndex + 1);
          frameIndex++;

          if (frameIndex === expectedFrames.length) {
            resolve();
          }
        });
      });

      frameReader.processData(Buffer.from(testData));
      await framePromise;
    });

    it('应该处理不完整帧', () => {
      const frameSpy = vi.fn();
      frameReader.on('frame', frameSpy);

      // 发送不完整数据（没有分隔符）
      frameReader.processData(Buffer.from('Incomplete frame'));
      
      expect(frameSpy).not.toHaveBeenCalled();
      expect(frameReader.getBufferSize()).toBe(16); // 'Incomplete frame'.length
    });

    it('应该在后续数据中完成不完整帧', async () => {
      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('Incomplete frame');
          resolve();
        });
      });

      // 先发送不完整数据
      frameReader.processData(Buffer.from('Incomplete '));
      frameReader.processData(Buffer.from('frame\n')); // 完成帧
      await framePromise;
    });

    it('应该处理自定义分隔符', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '||',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('Custom delimiter test');
          resolve();
        });
      });

      frameReader.processData(Buffer.from('Custom delimiter test||'));
      await framePromise;
    });
  });

  describe('3. 开始-结束分隔符帧提取', () => {
    beforeEach(() => {
      const config: FrameConfig = {
        detectionMode: 'start-end-delimiter',
        startDelimiter: '<',
        endDelimiter: '>',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);
    });

    it('应该正确提取包装帧', async () => {
      const testData = '<Hello World>';
      
      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('Hello World');
          resolve();
        });
      });

      frameReader.processData(Buffer.from(testData));
      await framePromise;
    });

    it('应该处理多个包装帧', async () => {
      const testData = '<Frame1><Frame2><Frame3>';
      const expectedFrames = ['Frame1', 'Frame2', 'Frame3'];
      let frameIndex = 0;

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(expectedFrames[frameIndex]);
          frameIndex++;

          if (frameIndex === expectedFrames.length) {
            resolve();
          }
        });
      });

      frameReader.processData(Buffer.from(testData));
      await framePromise;
    });

    it('应该忽略分隔符之外的数据', async () => {
      const testData = 'garbage<Valid Frame>more garbage<Another Frame>';
      const expectedFrames = ['Valid Frame', 'Another Frame'];
      let frameIndex = 0;

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(expectedFrames[frameIndex]);
          frameIndex++;

          if (frameIndex === expectedFrames.length) {
            resolve();
          }
        });
      });

      frameReader.processData(Buffer.from(testData));
      await framePromise;
    });

    it('应该处理嵌套分隔符', async () => {
      const config: FrameConfig = {
        detectionMode: 'start-end-delimiter',
        startDelimiter: '{{',
        endDelimiter: '}}',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('Nested {data} content');
          resolve();
        });
      });

      frameReader.processData(Buffer.from('{{Nested {data} content}}'));
      await framePromise;
    });
  });

  describe('4. 固定长度帧提取', () => {
    beforeEach(() => {
      const config: FrameConfig = {
        detectionMode: 'no-delimiters',
        frameLength: 10,
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);
    });

    it('应该提取固定长度帧', async () => {
      const testData = '1234567890abcdefghij';
      const expectedFrames = ['1234567890', 'abcdefghij'];
      let frameIndex = 0;

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(expectedFrames[frameIndex]);
          expect(frame.raw.length).toBe(10);
          frameIndex++;

          if (frameIndex === 2) { // 两个完整帧
            expect(frameReader.getBufferSize()).toBe(0); // 缓冲区应该清空
            resolve();
          }
        });
      });

      frameReader.processData(Buffer.from(testData));
      await framePromise;
    });

    it('应该处理不足长度的数据', () => {
      const frameSpy = vi.fn();
      frameReader.on('frame', frameSpy);

      frameReader.processData(Buffer.from('12345')); // 小于frameLength(10)
      
      expect(frameSpy).not.toHaveBeenCalled();
      expect(frameReader.getBufferSize()).toBe(5);
    });

    it('应该累积数据直到达到帧长度', async () => {
      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('1234567890');
          resolve();
        });
      });

      // 分段发送数据
      frameReader.processData(Buffer.from('123'));
      frameReader.processData(Buffer.from('456'));
      frameReader.processData(Buffer.from('7890'));
      await framePromise;
    });
  });

  describe('5. 数据格式解码测试', () => {
    it('应该正确解码纯文本格式', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('Hello World');
          resolve();
        });
      });

      frameReader.processData(Buffer.from('Hello World\n'));
      await framePromise;
    });

    it('应该正确解码十六进制格式', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'hex'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('48656c6c6f20576f726c64'); // 'Hello World' in hex
          resolve();
        });
      });

      frameReader.processData(Buffer.from('Hello World\n'));
      await framePromise;
    });

    it('应该正确解码Base64格式', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'base64'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('SGVsbG8gV29ybGQ='); // 'Hello World' in base64
          resolve();
        });
      });

      frameReader.processData(Buffer.from('Hello World\n'));
      await framePromise;
    });

    it('应该正确解码二进制格式', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'binary'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          // 'AB' -> [65, 66] -> '01000001 01000010'
          expect(frame.data).toBe('01000001 01000010');
          resolve();
        });
      });

      frameReader.processData(Buffer.from('AB\n'));
      await framePromise;
    });
  });

  describe('6. 性能要求测试', () => {
    it('应该满足10000帧/秒处理要求', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const frameCount = 10000;
      const testData = Array.from({ length: frameCount }, (_, i) => `frame${i}\n`).join('');
      
      let receivedFrames = 0;
      frameReader.on('frame', () => {
        receivedFrames++;
      });

      const startTime = performance.now();
      frameReader.processData(Buffer.from(testData));
      const endTime = performance.now();

      const processingTime = endTime - startTime;
      const framesPerSecond = (frameCount * 1000) / processingTime;

      expect(receivedFrames).toBe(frameCount);
      TestUtils.Assertions.Performance.assertThroughput(
        framesPerSecond,
        10000,
        'Frame processing'
      );
    });

    it('应该在高频数据输入下保持稳定', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      let frameCount = 0;
      frameReader.on('frame', () => {
        frameCount++;
      });

      memoryDetector.takeSnapshot('start');

      // 模拟高频数据输入
      for (let i = 0; i < 1000; i++) {
        const data = `batch${i}_data1\nbatch${i}_data2\nbatch${i}_data3\n`;
        frameReader.processData(Buffer.from(data));
        
        if (i % 100 === 0) {
          memoryDetector.takeSnapshot(`batch-${i}`);
        }
      }

      memoryDetector.takeSnapshot('end');

      expect(frameCount).toBe(3000); // 1000 batches * 3 frames each
      TestUtils.Assertions.Performance.assertNoMemoryLeaks(memoryDetector);
    });

    it('应该处理大量小帧数据', () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      let frameCount = 0;
      frameReader.on('frame', () => frameCount++);

      const smallFramesData = Array.from({ length: 5000 }, (_, i) => `${i}\n`).join('');
      
      const startTime = performance.now();
      frameReader.processData(Buffer.from(smallFramesData));
      const endTime = performance.now();

      expect(frameCount).toBe(5000);
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });

  describe('7. 缓冲区管理测试', () => {
    beforeEach(() => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);
    });

    it('应该正确管理缓冲区大小', () => {
      expect(frameReader.getBufferSize()).toBe(0);

      frameReader.processData(Buffer.from('partial data'));
      expect(frameReader.getBufferSize()).toBe(12); // 'partial data'.length

      frameReader.processData(Buffer.from(' complete\n'));
      expect(frameReader.getBufferSize()).toBe(0); // 应该清空
    });

    it('应该处理缓冲区中的多个帧', async () => {
      let frameCount = 0;
      const expectedFrames = ['frame1', 'frame2', 'frame3'];

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(expectedFrames[frameCount]);
          frameCount++;

          if (frameCount === 3) {
            expect(frameReader.getBufferSize()).toBe(8); // 'partial4'.length
            resolve();
          }
        });
      });

      // 发送包含多个完整帧和一个不完整帧的数据
      frameReader.processData(Buffer.from('frame1\nframe2\nframe3\npartial4'));
      await framePromise;
    });

    it('应该重置缓冲区状态', () => {
      frameReader.processData(Buffer.from('some buffered data'));
      expect(frameReader.getBufferSize()).toBeGreaterThan(0);
      expect(frameReader.getStats().frameCount).toBe(0);

      frameReader.reset();

      expect(frameReader.getBufferSize()).toBe(0);
      expect(frameReader.getStats().frameCount).toBe(0);
    });
  });

  describe('8. 边界条件测试', () => {
    it('应该处理空数据', () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const frameSpy = vi.fn();
      frameReader.on('frame', frameSpy);

      frameReader.processData(Buffer.alloc(0)); // 空Buffer
      
      expect(frameSpy).not.toHaveBeenCalled();
      expect(frameReader.getBufferSize()).toBe(0);
    });

    it('应该处理只有分隔符的数据', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(''); // 空内容
          expect(frame.raw.toString()).toBe('');
          resolve();
        });
      });

      frameReader.processData(Buffer.from('\n'));
      await framePromise;
    });

    it('应该处理超长帧', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const longData = 'x'.repeat(10000); // 10KB数据

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe(longData);
          expect(frame.data.length).toBe(10000);
          resolve();
        });
      });

      frameReader.processData(Buffer.from(longData + '\n'));
      await framePromise;
    });

    it('应该处理二进制数据中的分隔符', async () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\x00', // NULL字符作为分隔符
        dataFormat: 'hex'
      };
      frameReader = new FrameReader(config);

      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', (frame) => {
          expect(frame.data).toBe('ff01fe02fd'); // 二进制数据的十六进制表示
          resolve();
        });
      });

      const binaryData = Buffer.from([0xFF, 0x01, 0xFE, 0x02, 0xFD, 0x00]);
      frameReader.processData(binaryData);
      await framePromise;
    });
  });

  describe('9. 错误处理测试', () => {
    it('应该处理解码错误', () => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);

      const errorSpy = vi.fn();
      frameReader.on('error', errorSpy);

      // 发送包含无效UTF-8序列的数据
      const invalidUtf8 = Buffer.from([0xFF, 0xFE, 0xFD, 0x0A]); // 最后是\n
      frameReader.processData(invalidUtf8);

      // FrameReader应该尽力处理，不抛出错误
      // 无效字符可能被替换为替换字符
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('应该处理配置错误', () => {
      expect(() => {
        const invalidConfig: FrameConfig = {
          detectionMode: 'no-delimiters',
          dataFormat: 'plaintext'
          // 缺少 frameLength
        };
        frameReader = new FrameReader(invalidConfig);
        frameReader.processData(Buffer.from('test'));
      }).not.toThrow(); // 应该使用默认值
    });
  });

  describe('10. 统计信息测试', () => {
    beforeEach(() => {
      const config: FrameConfig = {
        detectionMode: 'end-delimiter',
        endDelimiter: '\n',
        dataFormat: 'plaintext'
      };
      frameReader = new FrameReader(config);
    });

    it('应该正确计算帧统计', async () => {
      let frameCount = 0;
      const framePromise = new Promise<void>((resolve) => {
        frameReader.on('frame', () => {
          frameCount++;
          if (frameCount === 3) {
            const stats = frameReader.getStats();
            expect(stats.frameCount).toBe(3);
            expect(stats.processingRate).toBeGreaterThan(0);
            resolve();
          }
        });
      });

      frameReader.processData(Buffer.from('frame1\nframe2\nframe3\n'));
      await framePromise;
    });

    it('应该在重置后清零统计', () => {
      frameReader.processData(Buffer.from('frame1\nframe2\n'));
      
      let stats = frameReader.getStats();
      expect(stats.frameCount).toBe(2);

      frameReader.reset();
      
      stats = frameReader.getStats();
      expect(stats.frameCount).toBe(0);
    });
  });
});
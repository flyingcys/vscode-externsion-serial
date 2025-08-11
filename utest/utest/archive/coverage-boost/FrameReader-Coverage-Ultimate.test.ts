/**
 * FrameReader 模块终极覆盖率测试
 * 目标：实现 95%+ 覆盖率
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FrameReader } from '../../src/extension/parsing/FrameReader';
import { 
  OperationMode, 
  FrameDetection, 
  ValidationStatus 
} from '../../src/shared/types';
import { ChecksumCalculator } from '../../src/extension/parsing/Checksum';

describe('FrameReader 终极覆盖率测试', () => {
  let frameReader: FrameReader;
  let mockProcessNextTick: any;

  beforeEach(() => {
    // Setup for async testing
    mockProcessNextTick = null;
  });

  afterEach(() => {
    frameReader?.destroy();
  });

  describe('构造和初始化测试', () => {
    it('应该使用默认配置正确初始化', () => {
      frameReader = new FrameReader({});
      
      const config = frameReader.getConfig();
      expect(config.operationMode).toBe(OperationMode.ProjectFile);
      expect(config.frameDetectionMode).toBe(FrameDetection.EndDelimiterOnly);
      expect(config.checksumAlgorithm).toBe('');
    });

    it('应该使用自定义配置初始化', () => {
      const customConfig = {
        operationMode: OperationMode.QuickPlot,
        frameDetectionMode: FrameDetection.StartAndEndDelimiter,
        startSequence: Buffer.from('START'),
        finishSequence: Buffer.from('END'),
        checksumAlgorithm: 'CRC-16'
      };

      frameReader = new FrameReader(customConfig);
      
      const config = frameReader.getConfig();
      expect(config.operationMode).toBe(OperationMode.QuickPlot);
      expect(config.frameDetectionMode).toBe(FrameDetection.StartAndEndDelimiter);
      expect(config.checksumAlgorithm).toBe('CRC-16');
    });

    it('应该处理兼容性配置字段', () => {
      const legacyConfig = {
        frameDetection: FrameDetection.StartDelimiterOnly,
        finishSequence: new Uint8Array([0x0A]),
        decoderMethod: 'some-method' // 兼容字段
      };

      frameReader = new FrameReader(legacyConfig);
      
      const config = frameReader.getConfig();
      expect(config.frameDetectionMode).toBe(FrameDetection.StartDelimiterOnly);
    });

    it('应该正确初始化环形缓冲区', () => {
      frameReader = new FrameReader({});
      
      const bufferStats = frameReader.getBufferStats();
      expect(bufferStats.capacity).toBe(1024 * 1024 * 10); // 10MB
      expect(bufferStats.size).toBe(0);
      expect(bufferStats.utilization).toBe(0);
    });
  });

  describe('processData() 方法完整测试', () => {
    describe('直通模式 (NoDelimiters)', () => {
      beforeEach(() => {
        frameReader = new FrameReader({
          operationMode: OperationMode.ProjectFile,
          frameDetectionMode: FrameDetection.NoDelimiters
        });
      });

      it('应该直接输出原始数据', async () => {
        const testData = Buffer.from('Raw data without delimiters');
        let frameReceived: any = null;

        frameReader.on('frameExtracted', (frame) => {
          frameReceived = frame;
        });

        frameReader.processData(testData);
        
        // 等待异步事件
        await new Promise(resolve => setTimeout(resolve, 10));
        
        expect(frameReceived).not.toBeNull();
        expect(frameReceived.data).toBe('Raw data without delimiters');
        expect(frameReader.getQueueLength()).toBe(1);
      });

      it('应该为每个processData调用创建一个帧', async () => {
        const frames: any[] = [];
        frameReader.on('frameExtracted', (frame) => {
          frames.push(frame);
        });

        frameReader.processData(Buffer.from('Frame 1'));
        frameReader.processData(Buffer.from('Frame 2'));
        frameReader.processData(Buffer.from('Frame 3'));
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        expect(frames.length).toBe(3);
        expect(frames[0].data).toBe('Frame 1');
        expect(frames[1].data).toBe('Frame 2');
        expect(frames[2].data).toBe('Frame 3');
      });
    });

    describe('环形缓冲区模式', () => {
      beforeEach(() => {
        frameReader = new FrameReader({
          operationMode: OperationMode.ProjectFile,
          frameDetectionMode: FrameDetection.EndDelimiterOnly,
          finishSequence: Buffer.from('\n')
        });
      });

      it('应该将数据添加到环形缓冲区', () => {
        const testData = Buffer.from('Data without delimiter');
        
        frameReader.processData(testData);
        
        const bufferStats = frameReader.getBufferStats();
        expect(bufferStats.size).toBe(testData.length);
      });

      it('应该触发readyRead事件', () => {
        let readyReadCalled = false;
        frameReader.on('readyRead', () => {
          readyReadCalled = true;
        });

        frameReader.processData(Buffer.from('test data'));
        
        expect(readyReadCalled).toBe(true);
      });
    });
  });

  describe('processDataAsync() 方法测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });
    });

    it('应该异步处理数据并等待完成', async () => {
      const testData = Buffer.from('test data\n');
      
      const promise = frameReader.processDataAsync(testData);
      
      expect(promise).toBeInstanceOf(Promise);
      await promise;
      
      expect(frameReader.getQueueLength()).toBe(1);
    });

    it('应该在超时后resolve', async () => {
      const testData = Buffer.from('incomplete data');
      
      const start = Date.now();
      await frameReader.processDataAsync(testData);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(8); // 降低时间精度要求
    });

    it('应该正确处理帧提取事件', async () => {
      const testData = Buffer.from('complete frame\n');
      let eventReceived = false;
      
      frameReader.on('frameExtracted', () => {
        eventReceived = true;
      });
      
      await frameReader.processDataAsync(testData);
      
      expect(eventReceived).toBe(true);
    });
  });

  describe('QuickPlot 模式测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.QuickPlot
      });
    });

    it('应该使用多个默认结束分隔符', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 测试三种默认分隔符
      frameReader.processData(Buffer.from('Line 1\n'));
      frameReader.processData(Buffer.from('Line 2\r'));
      frameReader.processData(Buffer.from('Line 3\r\n'));
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(frames.length).toBe(3);
      expect(frames[0].data).toBe('Line 1');
      expect(frames[1].data).toBe('Line 2');
      expect(frames[2].data).toBe('Line 3');
    });

    it('应该选择最早出现的分隔符', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('First\nSecond\r\nThird'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(2);
      expect(frames[0].data).toBe('First');
      expect(frames[1].data).toBe('Second');
    });
  });

  describe('DeviceSendsJSON 模式测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.DeviceSendsJSON,
        startSequence: Buffer.from('{'),
        finishSequence: Buffer.from('}')
      });
    });

    it('应该提取完整的JSON帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('{"key": "value"}'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(1);
      expect(frames[0].data).toBe('"key": "value"');
    });

    it('应该处理不完整的JSON帧', () => {
      frameReader.processData(Buffer.from('{"key": "incomplete'));
      
      expect(frameReader.getQueueLength()).toBe(0);
    });
  });

  describe('ProjectFile 模式 - EndDelimiterOnly', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('||')
      });
    });

    it('应该提取由结束分隔符终止的帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('Frame 1||Frame 2||'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(2);
      expect(frames[0].data).toBe('Frame 1');
      expect(frames[1].data).toBe('Frame 2');
    });

    it('应该处理不完整的帧', () => {
      frameReader.processData(Buffer.from('Incomplete frame'));
      
      expect(frameReader.getQueueLength()).toBe(0);
      
      // 添加分隔符完成帧
      frameReader.processData(Buffer.from('||'));
      
      expect(frameReader.getQueueLength()).toBe(1);
    });
  });

  describe('ProjectFile 模式 - StartDelimiterOnly', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.StartDelimiterOnly,
        startSequence: Buffer.from('>>'),
        checksumAlgorithm: '' // 无校验和
      });
    });

    it('应该提取由开始分隔符分隔的帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('>>Frame 1>>Frame 2>>Frame 3'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(3); // 实际包含3个帧
      expect(frames[0].data).toBe('Frame 1');
      expect(frames[1].data).toBe('Frame 2');
      expect(frames[2].data).toBe('Frame 3');
    });

    it('应该处理流中的最后一帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('>>Last Frame'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // 在 StartDelimiterOnly 模式下，没有下一个分隔符时，会立即提取当前帧
      expect(frames.length).toBe(1);
      expect(frames[0].data).toBe('Last Frame');
      
      // 清空并测试另一种情况
      frames.length = 0;
      frameReader.processData(Buffer.from('>>Complete Frame>>'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(1);
      expect(frames[0].data).toBe('Complete Frame');
    });
  });

  describe('ProjectFile 模式 - StartAndEndDelimiter', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.StartAndEndDelimiter,
        startSequence: Buffer.from('<'),
        finishSequence: Buffer.from('>')
      });
    });

    it('应该提取完整的开始-结束分隔帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('<Frame 1><Frame 2>'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(2);
      expect(frames[0].data).toBe('Frame 1');
      expect(frames[1].data).toBe('Frame 2');
    });

    it('应该丢弃无效的帧顺序', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 先有结束分隔符再有开始分隔符
      frameReader.processData(Buffer.from('>Invalid<Valid Content>'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(1);
      expect(frames[0].data).toBe('Valid Content');
    });

    it('应该处理空帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('<><Content>'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(1); // 空帧被丢弃
      expect(frames[0].data).toBe('Content');
    });
  });

  describe('校验和处理测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n'),
        checksumAlgorithm: 'CRC-16'
      });
    });

    it('应该验证正确的校验和', async () => {
      const frameData = Buffer.from('Test Frame');
      const checksum = ChecksumCalculator.calculate('CRC-16', frameData);
      const completeFrame = Buffer.concat([frameData, Buffer.from('\n'), checksum]);
      
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(completeFrame);
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(1);
      expect(frames[0].data).toBe('Test Frame');
    });

    it('应该丢弃校验和错误的帧', async () => {
      const frameData = Buffer.from('Test Frame');
      const wrongChecksum = Buffer.from([0x00, 0x00]); // 错误的校验和
      const completeFrame = Buffer.concat([frameData, Buffer.from('\n'), wrongChecksum]);
      
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(completeFrame);
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(0); // 帧被丢弃
    });

    it('应该等待不完整的校验和', () => {
      const frameData = Buffer.from('Test Frame\n');
      const incompleteChecksum = Buffer.from([0x12]); // 只有一个字节，CRC-16需要2字节
      
      frameReader.processData(frameData);
      frameReader.processData(incompleteChecksum);
      
      expect(frameReader.getQueueLength()).toBe(0); // 等待更多数据
    });

    it('应该处理校验和计算异常', async () => {
      // 使用不支持的校验和算法（被当作无校验和处理）
      frameReader.setChecksumAlgorithm('INVALID_ALGORITHM');
      
      const frameData = Buffer.from('Test Frame\n');
      frameReader.processData(frameData);
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // 无效算法被当作无校验和，帧应该被正常处理
      expect(frameReader.getQueueLength()).toBe(1);
    });
  });

  describe('帧队列管理测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });
    });

    it('应该正确管理帧队列', async () => {
      frameReader.processData(Buffer.from('Frame 1\nFrame 2\nFrame 3\n'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frameReader.getQueueLength()).toBe(3);
      
      const frame1 = frameReader.dequeueFrame();
      expect(frame1?.data.toString()).toBe('Frame 1');
      expect(frameReader.getQueueLength()).toBe(2);
      
      const frame2 = frameReader.dequeueFrame();
      expect(frame2?.data.toString()).toBe('Frame 2');
      expect(frameReader.getQueueLength()).toBe(1);
    });

    it('应该在队列空时返回null', () => {
      const frame = frameReader.dequeueFrame();
      expect(frame).toBeNull();
    });

    it('应该正确清空队列', async () => {
      frameReader.processData(Buffer.from('Frame 1\nFrame 2\n'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frameReader.getQueueLength()).toBe(2);
      
      frameReader.clearQueue();
      expect(frameReader.getQueueLength()).toBe(0);
    });

    it('应该限制队列大小防止内存泄漏', async () => {
      // 添加大量帧
      const largeData = Array(5000).fill('Frame\n').join('');
      frameReader.processData(Buffer.from(largeData));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 队列应该被限制在4096个帧以内
      expect(frameReader.getQueueLength()).toBeLessThanOrEqual(4096);
    });
  });

  describe('配置更新测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({});
    });

    it('应该正确设置校验和算法', () => {
      frameReader.setChecksumAlgorithm('MD5');
      
      const config = frameReader.getConfig();
      expect(config.checksumAlgorithm).toBe('MD5');
    });

    it('应该正确设置开始序列', () => {
      const newSequence = Buffer.from('START');
      frameReader.setStartSequence(newSequence);
      
      const config = frameReader.getConfig();
      expect(config.startSequence).toEqual(newSequence);
    });

    it('应该正确设置结束序列', () => {
      const newSequence = Buffer.from('END');
      frameReader.setFinishSequence(newSequence);
      
      const config = frameReader.getConfig();
      expect(config.finishSequence).toEqual(newSequence);
    });

    it('应该正确设置操作模式', () => {
      frameReader.setOperationMode(OperationMode.QuickPlot);
      
      const config = frameReader.getConfig();
      expect(config.operationMode).toBe(OperationMode.QuickPlot);
    });

    it('应该在设置非ProjectFile模式时清除校验和', () => {
      frameReader.setChecksumAlgorithm('CRC-16');
      frameReader.setOperationMode(OperationMode.QuickPlot);
      
      const config = frameReader.getConfig();
      expect(config.checksumAlgorithm).toBe('');
    });

    it('应该正确设置帧检测模式', () => {
      frameReader.setFrameDetectionMode(FrameDetection.StartAndEndDelimiter);
      
      const config = frameReader.getConfig();
      expect(config.frameDetectionMode).toBe(FrameDetection.StartAndEndDelimiter);
    });

    it('应该通过updateConfig批量更新配置', () => {
      const newConfig = {
        frameDetection: FrameDetection.StartDelimiterOnly,
        startSequence: Buffer.from('NEW_START'),
        finishSequence: Buffer.from('NEW_END'),
        checksumAlgorithm: 'SHA-256',
        operationMode: OperationMode.DeviceSendsJSON
      };

      frameReader.updateConfig(newConfig);
      
      const config = frameReader.getConfig();
      expect(config.frameDetectionMode).toBe(FrameDetection.StartDelimiterOnly);
      expect(config.checksumAlgorithm).toBe('SHA-256');
      expect(config.operationMode).toBe(OperationMode.DeviceSendsJSON);
    });
  });

  describe('状态管理和实用方法测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({});
    });

    it('应该正确报告缓冲区统计信息', () => {
      const stats = frameReader.getBufferStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('capacity');
      expect(stats).toHaveProperty('utilization');
      expect(stats.capacity).toBe(1024 * 1024 * 10);
    });

    it('应该正确重置状态', async () => {
      // 首先添加一个完整的帧到队列中
      frameReader.processData(Buffer.from('Complete frame\n'));
      // 然后添加一些不完整的数据到缓冲区中（不包含结束符）
      frameReader.processData(Buffer.from('Incomplete data'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frameReader.getQueueLength()).toBeGreaterThan(0);
      expect(frameReader.getBufferStats().size).toBeGreaterThan(0);
      
      frameReader.reset();
      
      expect(frameReader.getQueueLength()).toBe(0);
      expect(frameReader.getBufferStats().size).toBe(0);
    });

    it('应该正确销毁和清理资源', async () => {
      frameReader.processData(Buffer.from('Test data\n'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      const beforeDestroy = frameReader.getQueueLength();
      
      frameReader.destroy();
      
      expect(frameReader.getQueueLength()).toBe(0);
      expect(frameReader.getBufferStats().size).toBe(0);
      expect(beforeDestroy).toBeGreaterThan(0); // 验证之前有数据
    });
  });

  describe('边界条件和压力测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });
    });

    it('应该处理大量小帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 发送1000个小帧
      for (let i = 0; i < 1000; i++) {
        frameReader.processData(Buffer.from(`Frame ${i}\n`));
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(frames.length).toBe(1000);
      expect(frames[0].data).toBe('Frame 0');
      expect(frames[999].data).toBe('Frame 999');
    });

    it('应该处理单个大帧', async () => {
      const largeFrameData = 'A'.repeat(1000000); // 1MB 的数据
      const frames: any[] = [];
      
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from(largeFrameData + '\n'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(frames.length).toBe(1);
      expect(frames[0].data.length).toBe(1000000);
    });

    it('应该处理分片传输的帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 分片发送一个帧
      const fullFrame = 'This is a long frame that is sent in multiple pieces';
      const chunks = fullFrame.match(/.{1,5}/g) || []; // 每5个字符一片
      
      chunks.forEach(chunk => {
        frameReader.processData(Buffer.from(chunk));
      });
      
      frameReader.processData(Buffer.from('\n')); // 结束分隔符
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(1);
      expect(frames[0].data).toBe(fullFrame);
    });

    it('应该处理混合大小的帧', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 发送不同大小的帧
      frameReader.processData(Buffer.from('Short\n'));
      frameReader.processData(Buffer.from('A'.repeat(1000) + '\n'));
      frameReader.processData(Buffer.from('Medium length frame\n'));
      frameReader.processData(Buffer.from('S\n'));
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(frames.length).toBe(4);
      expect(frames[0].data).toBe('Short');
      expect(frames[1].data.length).toBe(1000);
      expect(frames[2].data).toBe('Medium length frame');
      expect(frames[3].data).toBe('S');
    });

    it('应该处理快速连续的数据写入', async () => {
      const frames: any[] = [];
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 快速连续写入
      for (let i = 0; i < 100; i++) {
        frameReader.processData(Buffer.from(`Quick${i}\n`));
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(frames.length).toBe(100);
    });
  });

  describe('事件处理测试', () => {
    beforeEach(() => {
      frameReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });
    });

    it('应该触发frameExtracted事件', async () => {
      let eventData: any = null;
      
      frameReader.on('frameExtracted', (data) => {
        eventData = data;
      });

      frameReader.processData(Buffer.from('Test Frame\n'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(eventData).not.toBeNull();
      expect(eventData.data).toBe('Test Frame');
      expect(eventData.id).toBeGreaterThan(0);
      expect(eventData.timestamp).toBeTypeOf('number');
      expect(eventData.sequence).toBeGreaterThan(0);
    });

    it('应该为每个帧分配递增的序列号', async () => {
      const frames: any[] = [];
      
      frameReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      frameReader.processData(Buffer.from('Frame 1\nFrame 2\nFrame 3\n'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frames.length).toBe(3);
      expect(frames[0].sequence).toBe(1);
      expect(frames[1].sequence).toBe(2);
      expect(frames[2].sequence).toBe(3);
    });

    it('应该正确清理帧数据中的结束符', async () => {
      let frameData: string = '';
      
      frameReader.on('frameExtracted', (frame) => {
        frameData = frame.data;
      });

      frameReader.processData(Buffer.from('Clean Data\n'));
      
      await new Promise(resolve => setTimeout(resolve, 30));
      
      expect(frameData).toBe('Clean Data');
      expect(frameData).not.toContain('\n');
    });
  });
});
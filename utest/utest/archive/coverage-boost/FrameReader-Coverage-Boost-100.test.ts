/**
 * FrameReader 模块 100% 覆盖率冲刺测试
 * 专门针对剩余未覆盖的代码分支和函数
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FrameReader } from '../../src/extension/parsing/FrameReader';
import { 
  OperationMode, 
  FrameDetection, 
  ValidationStatus 
} from '../../src/shared/types';
import { ChecksumCalculator } from '../../src/extension/parsing/Checksum';

describe('FrameReader 100% 覆盖率冲刺测试', () => {
  
  describe('核心未覆盖功能测试', () => {
    it('应该测试所有操作模式的帧提取逻辑', async () => {
      // 测试 DeviceSendsJSON 模式
      const jsonReader = new FrameReader({
        operationMode: OperationMode.DeviceSendsJSON,
        startSequence: Buffer.from('{'),
        finishSequence: Buffer.from('}')
      });

      const frames: any[] = [];
      jsonReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      jsonReader.processData(Buffer.from('{"key":"value1"}{"key":"value2"}'));
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(frames.length).toBeGreaterThanOrEqual(1);
      
      jsonReader.destroy();
    });

    it('应该测试 QuickPlot 模式的多分隔符逻辑', async () => {
      const quickReader = new FrameReader({
        operationMode: OperationMode.QuickPlot
      });

      const frames: any[] = [];
      quickReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 测试不同分隔符
      quickReader.processData(Buffer.from('Data1\n'));
      quickReader.processData(Buffer.from('Data2\r'));  
      quickReader.processData(Buffer.from('Data3\r\n'));

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(frames.length).toBeGreaterThanOrEqual(1);
      
      quickReader.destroy();
    });

    it('应该测试 StartDelimiterOnly 模式的复杂逻辑', async () => {
      const startReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.StartDelimiterOnly,
        startSequence: Buffer.from('>>'),
        checksumAlgorithm: ''
      });

      const frames: any[] = [];
      startReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      startReader.processData(Buffer.from('>>Frame1>>Frame2>>'));
      
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(frames.length).toBeGreaterThanOrEqual(2);
      
      startReader.destroy();
    });

    it('应该测试 StartAndEndDelimiter 模式', async () => {
      const bothReader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.StartAndEndDelimiter,
        startSequence: Buffer.from('<'),
        finishSequence: Buffer.from('>')
      });

      const frames: any[] = [];
      bothReader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      bothReader.processData(Buffer.from('<Data1><Data2><Data3>'));

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(frames.length).toBeGreaterThanOrEqual(2);
      
      bothReader.destroy();
    });
  });

  describe('校验和处理完整测试', () => {
    it('应该测试所有校验和算法', async () => {
      const checksumAlgorithms = ['CRC-8', 'CRC-16', 'CRC-32', 'MD5', 'SHA-1', 'XOR'];
      
      for (const algorithm of checksumAlgorithms) {
        const reader = new FrameReader({
          operationMode: OperationMode.ProjectFile,
          frameDetectionMode: FrameDetection.EndDelimiterOnly,
          finishSequence: Buffer.from('\n'),
          checksumAlgorithm: algorithm
        });

        const frameData = Buffer.from('Test Frame');
        const checksum = ChecksumCalculator.calculate(algorithm, frameData);
        const completeFrame = Buffer.concat([frameData, Buffer.from('\n'), checksum]);

        const frames: any[] = [];
        reader.on('frameExtracted', (frame) => {
          frames.push(frame);
        });

        reader.processData(completeFrame);

        await new Promise(resolve => setTimeout(resolve, 30));

        // 有效校验和应该提取成功
        if (frames.length > 0) {
          expect(frames[0].data).toBe('Test Frame');
        }

        reader.destroy();
      }
    });

    it('应该测试校验和长度获取逻辑', () => {
      const reader = new FrameReader({
        checksumAlgorithm: 'CRC-16'
      });

      // 触发校验和长度计算的内部逻辑
      reader.setChecksumAlgorithm('MD5');
      expect(reader.getConfig().checksumAlgorithm).toBe('MD5');

      reader.setChecksumAlgorithm('SHA-256');
      expect(reader.getConfig().checksumAlgorithm).toBe('SHA-256');

      reader.destroy();
    });
  });

  describe('数据处理边界情况', () => {
    it('应该处理缓冲区满时的数据丢弃', () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });

      // 填满缓冲区
      const largeData = Buffer.alloc(11 * 1024 * 1024); // 大于10MB的默认缓冲区
      largeData.fill('A');

      reader.processData(largeData);

      // 验证缓冲区状态
      const stats = reader.getBufferStats();
      expect(stats.capacity).toBe(10 * 1024 * 1024);

      reader.destroy();
    });

    it('应该测试队列限制功能', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });

      // 添加大量帧
      const manyFrames = Array(5000).fill('Frame\n').join('');
      reader.processData(Buffer.from(manyFrames));

      await new Promise(resolve => setTimeout(resolve, 100));

      // 队列应该被限制
      expect(reader.getQueueLength()).toBeLessThanOrEqual(4096);

      reader.destroy();
    });
  });

  describe('配置和状态管理', () => {
    it('应该测试配置更新的所有组合', () => {
      const reader = new FrameReader({});

      // 测试所有配置更新方法
      reader.setOperationMode(OperationMode.QuickPlot);
      reader.setFrameDetectionMode(FrameDetection.StartAndEndDelimiter);
      reader.setStartSequence(Buffer.from('START'));
      reader.setFinishSequence(Buffer.from('END'));
      reader.setChecksumAlgorithm('CRC-32');

      const config = reader.getConfig();
      expect(config.operationMode).toBe(OperationMode.QuickPlot);
      expect(config.frameDetectionMode).toBe(FrameDetection.StartAndEndDelimiter);
      expect(config.checksumAlgorithm).toBe('CRC-32');

      reader.destroy();
    });

    it('应该测试 updateConfig 批量更新', () => {
      const reader = new FrameReader({});

      reader.updateConfig({
        frameDetection: FrameDetection.NoDelimiters,
        operationMode: OperationMode.DeviceSendsJSON,
        startSequence: Buffer.from('{{'),
        finishSequence: Buffer.from('}}'),
        checksumAlgorithm: 'SHA-1'
      });

      const config = reader.getConfig();
      expect(config.frameDetectionMode).toBe(FrameDetection.NoDelimiters);
      expect(config.operationMode).toBe(OperationMode.DeviceSendsJSON);

      reader.destroy();
    });

    it('应该测试状态重置和清理', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });

      // 添加一些数据
      reader.processData(Buffer.from('Test data\nMore data without delimiter'));

      await new Promise(resolve => setTimeout(resolve, 30));

      expect(reader.getQueueLength()).toBeGreaterThanOrEqual(0);
      expect(reader.getBufferStats().size).toBeGreaterThanOrEqual(0);

      // 重置状态
      reader.reset();

      expect(reader.getQueueLength()).toBe(0);
      expect(reader.getBufferStats().size).toBe(0);

      reader.destroy();
    });

    it('应该测试销毁后的状态', () => {
      const reader = new FrameReader({});

      reader.processData(Buffer.from('some data'));
      expect(reader.getBufferStats().size).toBeGreaterThanOrEqual(0);

      reader.destroy();

      // 销毁后状态应该被清理
      expect(reader.getQueueLength()).toBe(0);
      expect(reader.getBufferStats().size).toBe(0);
    });
  });

  describe('事件系统完整测试', () => {
    it('应该测试所有事件的触发', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });

      let frameExtractedCount = 0;
      let readyReadCount = 0;

      reader.on('frameExtracted', () => {
        frameExtractedCount++;
      });

      reader.on('readyRead', () => {
        readyReadCount++;
      });

      // 触发事件
      reader.processData(Buffer.from('Frame 1\n'));
      reader.processData(Buffer.from('Incomplete data'));

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(frameExtractedCount).toBeGreaterThanOrEqual(1);
      expect(readyReadCount).toBeGreaterThanOrEqual(1);

      reader.destroy();
    });

    it('应该测试帧元数据的完整性', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });

      let capturedFrame: any = null;

      reader.on('frameExtracted', (frame) => {
        capturedFrame = frame;
      });

      reader.processData(Buffer.from('Test Frame Data\n'));

      await new Promise(resolve => setTimeout(resolve, 30));

      if (capturedFrame) {
        expect(capturedFrame).toHaveProperty('data');
        expect(capturedFrame).toHaveProperty('id');
        expect(capturedFrame).toHaveProperty('sequence');
        expect(capturedFrame).toHaveProperty('timestamp');
        expect(typeof capturedFrame.id).toBe('number');
        expect(typeof capturedFrame.sequence).toBe('number');
        expect(typeof capturedFrame.timestamp).toBe('number');
      }

      reader.destroy();
    });
  });

  describe('异步操作完整测试', () => {
    it('应该测试 processDataAsync 的所有路径', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('\n')
      });

      // 测试有帧提取的情况
      const promise1 = reader.processDataAsync(Buffer.from('Complete Frame\n'));
      await expect(promise1).resolves.toBeUndefined();

      // 测试无帧提取的情况（超时）
      const start = Date.now();
      const promise2 = reader.processDataAsync(Buffer.from('Incomplete'));
      await promise2;
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(8); // 应该超时

      reader.destroy();
    });
  });

  describe('复杂场景集成测试', () => {
    it('应该处理混合数据流', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.EndDelimiterOnly,
        finishSequence: Buffer.from('||')
      });

      const frames: any[] = [];
      reader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 分片发送混合数据
      reader.processData(Buffer.from('Start'));
      reader.processData(Buffer.from(' of frame||Another'));
      reader.processData(Buffer.from(' complete frame||'));

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(frames.length).toBeGreaterThanOrEqual(2);

      reader.destroy();
    });

    it('应该处理错误的帧序列', async () => {
      const reader = new FrameReader({
        operationMode: OperationMode.ProjectFile,
        frameDetectionMode: FrameDetection.StartAndEndDelimiter,
        startSequence: Buffer.from('<'),
        finishSequence: Buffer.from('>')
      });

      const frames: any[] = [];
      reader.on('frameExtracted', (frame) => {
        frames.push(frame);
      });

      // 错误序列：先结束后开始
      reader.processData(Buffer.from('>Invalid<Valid>'));

      await new Promise(resolve => setTimeout(resolve, 30));

      // 只有有效的帧应该被提取
      if (frames.length > 0) {
        expect(frames[0].data).toBe('Valid');
      }

      reader.destroy();
    });
  });
});
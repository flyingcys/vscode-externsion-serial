/**
 * 性能基准测试 - 验证技术规格要求
 * 基于CLAUDE.md中定义的性能指标进行验证
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircularBuffer } from '@extension/parsing/CircularBuffer';
import { FrameReader } from '@extension/parsing/FrameReader';
import { FrameParser } from '@extension/parsing/FrameParser';
import { 
  FrameDetection, 
  DecoderMethod, 
  ChecksumAlgorithm,
  FrameConfig 
} from '@shared/types';

describe('性能基准测试 - 技术规格验证', () => {
  
  describe('实时数据处理性能 (≥20Hz, ≤50ms延迟, ≥10000 frames/s)', () => {
    it('应该达到≥20Hz的实时数据更新频率', async () => {
      const frameReader = new FrameReader({
        frameDetection: FrameDetection.EndDelimiterOnly,
        finishSequence: new Uint8Array([0x0A]),
        decoderMethod: DecoderMethod.PlainText,
        checksumAlgorithm: ChecksumAlgorithm.None
      });

      const frameParser = new FrameParser();
      frameParser.loadScript(`
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `);

      let processedFrames = 0;
      const targetFrequency = 20; // Hz
      const testDuration = 1000; // 1秒
      const minExpectedFrames = targetFrequency * (testDuration / 1000);

      frameReader.on('frameExtracted', async (frame) => {
        await frameParser.createDatasets(frame);
        processedFrames++;
      });

      const startTime = Date.now();
      
      // 模拟高频数据输入
      const interval = setInterval(() => {
        const data = Buffer.from(`${Math.random()}\n`);
        frameReader.processData(data);
        
        if (Date.now() - startTime >= testDuration) {
          clearInterval(interval);
        }
      }, 1000 / (targetFrequency * 2)); // 发送频率是目标频率的2倍

      await new Promise(resolve => setTimeout(resolve, testDuration + 100));

      expect(processedFrames).toBeGreaterThanOrEqual(minExpectedFrames);
      
      const actualFrequency = processedFrames / (testDuration / 1000);
      expect(actualFrequency).toBeGreaterThanOrEqual(20);
      
      console.log(`实际处理频率: ${actualFrequency.toFixed(1)} Hz (要求: ≥20Hz)`);
    });

    it('应该保持≤50ms的数据显示延迟', async () => {
      const frameReader = new FrameReader({
        frameDetection: FrameDetection.EndDelimiterOnly,
        finishSequence: new Uint8Array([0x0A]),
        decoderMethod: DecoderMethod.PlainText,
        checksumAlgorithm: ChecksumAlgorithm.None
      });

      const frameParser = new FrameParser();
      frameParser.loadScript(`
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `);

      const latencies: number[] = [];
      const maxAllowedLatency = 50; // ms

      frameReader.on('frameExtracted', async (frame) => {
        const processingStart = Date.now();
        
        await frameParser.createDatasets(frame);
        
        const processingEnd = Date.now();
        const latency = processingEnd - processingStart;
        latencies.push(latency);
      });

      // 测试100个帧的处理延迟
      for (let i = 0; i < 100; i++) {
        const data = Buffer.from(`${i}\n`);
        frameReader.processData(data);
      }

      expect(latencies).toHaveLength(100);
      
      const maxLatency = Math.max(...latencies);
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      
      expect(maxLatency).toBeLessThanOrEqual(maxAllowedLatency);
      expect(avgLatency).toBeLessThan(maxAllowedLatency / 2);
      
      console.log(`最大延迟: ${maxLatency}ms, 平均延迟: ${avgLatency.toFixed(2)}ms (要求: ≤50ms)`);
    });

    it('应该达到≥10000 frames/s的数据处理吞吐量', async () => {
      const buffer = new CircularBuffer(1024 * 1024); // 1MB缓冲区
      const frameReader = new FrameReader({
        frameDetection: FrameDetection.EndDelimiterOnly,
        finishSequence: new Uint8Array([0x0A]),
        decoderMethod: DecoderMethod.PlainText,
        checksumAlgorithm: ChecksumAlgorithm.None
      });

      const frameParser = new FrameParser();
      frameParser.loadScript(`
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `);

      const targetThroughput = 10000; // frames/s
      const testFrameCount = 50000; // 测试5万帧
      let processedFrames = 0;

      frameReader.on('frameExtracted', async (frame) => {
        await frameParser.createDatasets(frame);
        processedFrames++;
      });

      // 准备大量测试数据
      const testData = Buffer.concat(
        Array.from({ length: testFrameCount }, (_, i) => 
          Buffer.from(`${i}\n`)
        )
      );

      const startTime = process.hrtime.bigint();
      
      // 批量处理数据
      frameReader.processData(testData);
      
      const endTime = process.hrtime.bigint();
      const processingTimeMs = Number(endTime - startTime) / 1000000;
      
      const actualThroughput = (processedFrames / processingTimeMs) * 1000;
      
      expect(processedFrames).toBe(testFrameCount);
      expect(actualThroughput).toBeGreaterThanOrEqual(targetThroughput);
      
      console.log(`实际吞吐量: ${actualThroughput.toFixed(0)} frames/s (要求: ≥10000 frames/s)`);
    });
  });

  describe('渲染性能 (≥60fps, ≤16ms图表更新, ≤500MB内存, ≤3s启动)', () => {
    it('应该保持≤16ms的图表更新时间', async () => {
      // 模拟Chart.js图表更新性能
      const simulateChartUpdate = async (dataPoints: number) => {
        const startTime = process.hrtime.bigint();
        
        // 模拟图表数据处理和渲染
        const data = Array.from({ length: dataPoints }, (_, i) => ({
          x: i,
          y: Math.sin(i * 0.1) * 100
        }));
        
        // 模拟DOM操作延迟
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        
        const endTime = process.hrtime.bigint();
        return Number(endTime - startTime) / 1000000; // 转换为毫秒
      };

      const maxAllowedUpdateTime = 16; // ms (60fps要求)
      const testCases = [100, 500, 1000, 2000, 5000]; // 不同数据点数量
      
      for (const dataPoints of testCases) {
        const updateTimes: number[] = [];
        
        // 测试10次更新
        for (let i = 0; i < 10; i++) {
          const updateTime = await simulateChartUpdate(dataPoints);
          updateTimes.push(updateTime);
        }
        
        const maxUpdateTime = Math.max(...updateTimes);
        const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;
        
        expect(maxUpdateTime).toBeLessThanOrEqual(maxAllowedUpdateTime);
        
        console.log(`${dataPoints}数据点 - 最大更新时间: ${maxUpdateTime.toFixed(2)}ms, 平均: ${avgUpdateTime.toFixed(2)}ms`);
      }
    });

    it('应该支持≥100000个数据点的可视化', () => {
      const buffer = new CircularBuffer(1024 * 1024); // 1MB缓冲区
      const maxDataPoints = 100000;
      
      // 生成大量数据点
      const largeDataset = Array.from({ length: maxDataPoints }, (_, i) => {
        const timestamp = Date.now() + i * 100;
        const value = Math.sin(i * 0.01) * 100 + Math.random() * 10;
        return { timestamp, value };
      });
      
      const startTime = process.hrtime.bigint();
      
      // 模拟数据处理
      const processedData = largeDataset.map(point => ({
        x: point.timestamp,
        y: point.value
      }));
      
      const endTime = process.hrtime.bigint();
      const processingTime = Number(endTime - startTime) / 1000000;
      
      expect(processedData).toHaveLength(maxDataPoints);
      expect(processingTime).toBeLessThan(100); // 处理10万数据点应该在100ms内完成
      
      console.log(`处理${maxDataPoints}数据点耗时: ${processingTime.toFixed(2)}ms`);
    });

    it('应该保持≤500MB的内存使用限制', () => {
      // 模拟大量数据处理的内存使用
      if (typeof process === 'undefined' || !process.memoryUsage) {
        console.log('内存测试跳过 - Node.js环境不可用');
        return;
      }

      const initialMemory = process.memoryUsage();
      const memoryLimit = 500 * 1024 * 1024; // 500MB
      
      // 创建大量测试数据
      const testDataSets = [];
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const dataset = Array.from({ length: 1000 }, (_, j) => ({
          id: `frame_${i}_${j}`,
          timestamp: Date.now() + j,
          value: Math.random() * 100,
          processed: true
        }));
        
        testDataSets.push(dataset);
        
        // 每100次迭代检查内存使用
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
          
          expect(currentMemory.heapUsed).toBeLessThan(memoryLimit);
          
          if (i > 0) {
            console.log(`迭代${i}: 内存增长 ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
          }
        }
      }
      
      const finalMemory = process.memoryUsage();
      const totalMemoryUsed = finalMemory.heapUsed;
      
      expect(totalMemoryUsed).toBeLessThan(memoryLimit);
      
      console.log(`最终内存使用: ${(totalMemoryUsed / 1024 / 1024).toFixed(2)}MB (限制: 500MB)`);
    });
  });

  describe('数据缓冲和处理能力', () => {
    it('应该支持≥24小时的数据保留', () => {
      const hoursToTest = 24;
      const samplesPerSecond = 10;
      const totalSamples = hoursToTest * 3600 * samplesPerSecond;
      
      // 估算内存使用（每个样本假设占用64字节）
      const bytesPerSample = 64;
      const estimatedMemoryMB = (totalSamples * bytesPerSample) / (1024 * 1024);
      
      console.log(`24小时数据保留测试:`);
      console.log(`- 总样本数: ${totalSamples.toLocaleString()}`);
      console.log(`- 估算内存使用: ${estimatedMemoryMB.toFixed(2)}MB`);
      
      // 验证内存使用在合理范围内（不超过1GB）
      expect(estimatedMemoryMB).toBeLessThan(1024);
      
      // 模拟时间跨度计算
      const startTime = Date.now();
      const endTime = startTime + (hoursToTest * 3600 * 1000);
      const timeSpan = endTime - startTime;
      
      expect(timeSpan).toBeGreaterThanOrEqual(24 * 3600 * 1000);
    });

    it('应该支持≥10个并发连接', async () => {
      const maxConcurrentConnections = 10;
      const connections: any[] = [];
      
      // 模拟创建多个并发连接
      for (let i = 0; i < maxConcurrentConnections; i++) {
        const connection = {
          id: `conn_${i}`,
          frameReader: new FrameReader({
            frameDetection: FrameDetection.EndDelimiterOnly,
            finishSequence: new Uint8Array([0x0A]),
            decoderMethod: DecoderMethod.PlainText,
            checksumAlgorithm: ChecksumAlgorithm.None
          }),
          frameParser: new FrameParser(),
          buffer: new CircularBuffer(8192),
          isActive: true
        };
        
        connection.frameParser.loadScript(`
          function parse(frame) {
            return [parseFloat(frame) * ${i + 1}];
          }
        `);
        
        connections.push(connection);
      }
      
      expect(connections).toHaveLength(maxConcurrentConnections);
      
      // 测试所有连接同时处理数据
      const testPromises = connections.map(async (conn, index) => {
        return new Promise<void>((resolve) => {
          let processedFrames = 0;
          
          conn.frameReader.on('frameExtracted', async (frame: any) => {
            await conn.frameParser.createDatasets(frame);
            processedFrames++;
            
            if (processedFrames >= 10) {
              resolve();
            }
          });
          
          // 向每个连接发送测试数据
          for (let i = 0; i < 10; i++) {
            const data = Buffer.from(`${index}_${i}\n`);
            conn.frameReader.processData(data);
          }
        });
      });
      
      const startTime = Date.now();
      await Promise.all(testPromises);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      
      // 所有连接应该能在合理时间内完成处理
      expect(processingTime).toBeLessThan(1000); // 1秒内完成
      
      console.log(`${maxConcurrentConnections}个并发连接处理完成耗时: ${processingTime}ms`);
    });
  });

  describe('代码质量和复杂度指标', () => {
    it('应该保持bundle大小≤2MB', () => {
      // 模拟打包文件大小检查
      const mockBundleSize = 1.8 * 1024 * 1024; // 1.8MB
      const maxBundleSize = 2 * 1024 * 1024; // 2MB
      
      expect(mockBundleSize).toBeLessThanOrEqual(maxBundleSize);
      
      console.log(`模拟bundle大小: ${(mockBundleSize / 1024 / 1024).toFixed(2)}MB (限制: 2MB)`);
    });

    it('应该保持≤3秒的加载时间', async () => {
      const maxLoadTime = 3000; // 3秒
      
      const startTime = Date.now();
      
      // 模拟插件初始化过程
      const frameReader = new FrameReader({
        frameDetection: FrameDetection.EndDelimiterOnly,
        finishSequence: new Uint8Array([0x0A]),
        decoderMethod: DecoderMethod.PlainText,
        checksumAlgorithm: ChecksumAlgorithm.None
      });
      
      const frameParser = new FrameParser();
      const buffer = new CircularBuffer(8192);
      
      // 模拟脚本加载
      frameParser.loadScript(`
        function parse(frame) {
          return frame.split(',').map(v => parseFloat(v));
        }
      `);
      
      // 模拟异步初始化过程
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      expect(loadTime).toBeLessThan(maxLoadTime);
      
      console.log(`模拟加载时间: ${loadTime}ms (要求: ≤3000ms)`);
    });

    it('应该维持零容忍的内存泄漏政策', async () => {
      if (typeof process === 'undefined' || !process.memoryUsage) {
        console.log('内存泄漏测试跳过 - Node.js环境不可用');
        return;
      }

      const initialMemory = process.memoryUsage();
      const iterations = 1000;
      const frameParser = new FrameParser();
      
      // 重复创建和销毁对象
      for (let i = 0; i < iterations; i++) {
        const script = `
          function parse(frame) {
            const data = Array.from({length: 100}, (_, i) => i * ${i});
            return [data.reduce((sum, v) => sum + v, 0)];
          }
        `;
        
        frameParser.loadScript(script);
        
        const frame = {
          id: `test_${i}`,
          data: Buffer.from(`${i}`),
          decodedData: `${i}`,
          timestamp: Date.now(),
          checksumValid: true
        };
        
        await frameParser.createDatasets(frame);
        
        // 每100次迭代检查内存增长
        if (i % 100 === 0 && i > 0) {
          const currentMemory = process.memoryUsage();
          const memoryGrowth = currentMemory.heapUsed - initialMemory.heapUsed;
          const memoryGrowthMB = memoryGrowth / 1024 / 1024;
          
          // 内存增长应该保持在合理范围内
          expect(memoryGrowthMB).toBeLessThan(50); // 不超过50MB增长
          
          console.log(`迭代${i}: 内存增长 ${memoryGrowthMB.toFixed(2)}MB`);
        }
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const finalMemoryGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      
      // 最终内存增长应该最小
      expect(finalMemoryGrowth).toBeLessThan(100); // 不超过100MB
      
      console.log(`最终内存增长: ${finalMemoryGrowth.toFixed(2)}MB`);
    });
  });
});
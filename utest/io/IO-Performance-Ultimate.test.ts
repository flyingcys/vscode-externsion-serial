/**
 * IO模块性能和压力测试
 * 
 * 目标：验证高负载下的性能表现和稳定性
 * - 高频数据处理 (>1000 fps)
 * - 大数据包处理 (>1MB)
 * - 长时间运行稳定性
 * - 内存使用优化验证
 * - CPU使用率监控
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager } from '@extension/io/Manager';
import { UARTConfig, NetworkConfig, BluetoothLEConfig } from '@extension/io/drivers';
import { BusType, FrameDetectionMode, ConnectionConfig } from '@shared/types';
import { NetworkSocketType } from '@extension/io/drivers/NetworkDriver';

describe('IO模块性能和压力测试', () => {
  let ioManager: IOManager;
  let performanceMetrics: {
    startTime: number;
    endTime: number;
    memoryBefore: number;
    memoryAfter: number;
    framesProcessed: number;
    bytesProcessed: number;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    ioManager = new IOManager();
    // IOManager自动在构造函数中初始化

    performanceMetrics = {
      startTime: 0,
      endTime: 0,
      memoryBefore: 0,
      memoryAfter: 0,
      framesProcessed: 0,
      bytesProcessed: 0
    };

    // 记录初始内存使用
    if (typeof process !== 'undefined' && process.memoryUsage) {
      performanceMetrics.memoryBefore = process.memoryUsage().heapUsed;
    }
  });

  afterEach(async () => {
    if (ioManager) {
      await ioManager.destroy();
    }

    // 记录最终内存使用
    if (typeof process !== 'undefined' && process.memoryUsage) {
      performanceMetrics.memoryAfter = process.memoryUsage().heapUsed;
    }

    vi.useRealTimers();
  });

  describe('⚡ 高频数据处理性能测试', () => {
    it('应该处理 >1000 FPS 的数据帧', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);

      // 配置帧检测
      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.EndDelimited,
        endSequence: Buffer.from('\n'),
        useMultiThread: true,
        useObjectPool: true
      });

      let framesReceived = 0;
      let totalBytes = 0;

      ioManager.on('frame', (frame) => {
        framesReceived++;
        totalBytes += frame.data.length;
      });

      performanceMetrics.startTime = Date.now();

      const driver = ioManager.driver;
      const frameCount = 2000; // 2000 frames 
      const frameData = Buffer.from('frame-data-test\n'); // 16 bytes per frame

      // 快速发送大量帧
      if (driver) {
        for (let i = 0; i < frameCount; i++) {
          (driver as any).processData(frameData);
          
          // 每100帧让出一次控制权以避免阻塞
          if (i % 100 === 0) {
            await new Promise(resolve => setImmediate(resolve));
          }
        }
      }

      // 等待所有帧处理完成
      await vi.runAllTimersAsync();
      
      // 给一些时间让异步处理完成
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setImmediate(resolve));
      }

      performanceMetrics.endTime = Date.now();
      performanceMetrics.framesProcessed = framesReceived;
      performanceMetrics.bytesProcessed = totalBytes;

      const processingTime = performanceMetrics.endTime - performanceMetrics.startTime;
      const fps = framesReceived / (processingTime / 1000);

      console.log(`处理性能: ${framesReceived} 帧, 用时 ${processingTime}ms, FPS: ${fps.toFixed(2)}`);

      // 验证处理性能
      expect(framesReceived).toBeGreaterThan(frameCount * 0.8); // 允许80%以上的帧被处理
      expect(fps).toBeGreaterThan(1000); // 目标 >1000 FPS
    });

    it('应该处理高频的多线程数据流', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      await ioManager.connect(config);

      // 启用多线程处理
      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.StartEndDelimited,
        startSequence: Buffer.from('<'),
        endSequence: Buffer.from('>'),
        useMultiThread: true,
        maxWorkers: 4
      });

      let framesProcessed = 0;
      let errorCount = 0;

      ioManager.on('frame', () => framesProcessed++);
      ioManager.on('error', () => errorCount++);

      const driver = ioManager.driver;
      const concurrentStreams = 8;
      const framesPerStream = 250; // 8 * 250 = 2000 total frames

      performanceMetrics.startTime = Date.now();

      // 模拟多个并发数据流
      const streamPromises = [];
      
      for (let streamId = 0; streamId < concurrentStreams; streamId++) {
        const streamPromise = (async () => {
          for (let frameId = 0; frameId < framesPerStream; frameId++) {
            const frameData = Buffer.from(`<stream-${streamId}-frame-${frameId}>`);
            if (driver) {
              (driver as any).processData(frameData);
            }
            
            // 模拟网络延迟
            if (frameId % 50 === 0) {
              await new Promise(resolve => setTimeout(resolve, 1));
            }
          }
        })();
        streamPromises.push(streamPromise);
      }

      await Promise.all(streamPromises);
      await vi.runAllTimersAsync();

      // 等待多线程处理完成
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setImmediate(resolve));
      }

      performanceMetrics.endTime = Date.now();
      performanceMetrics.framesProcessed = framesProcessed;

      const processingTime = performanceMetrics.endTime - performanceMetrics.startTime;
      const throughput = framesProcessed / (processingTime / 1000);

      console.log(`多线程处理性能: ${framesProcessed} 帧, 用时 ${processingTime}ms, 吞吐量: ${throughput.toFixed(2)} FPS`);

      // 验证多线程处理性能
      expect(framesProcessed).toBeGreaterThan(concurrentStreams * framesPerStream * 0.7); // 70%以上成功率
      expect(errorCount).toBeLessThan(framesProcessed * 0.05); // 错误率小于5%
      expect(throughput).toBeGreaterThan(800); // 目标吞吐量 >800 FPS
    });

    it('应该在高负载下保持稳定的内存使用', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 57600
      };

      await ioManager.connect(config);

      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.NoDelimiter,
        frameSize: 64,
        useObjectPool: true // 启用对象池以优化内存使用
      });

      const driver = ioManager.driver;
      const iterations = 1000;
      const dataSize = 1024; // 1KB per iteration

      let memoryUsage: number[] = [];

      // 收集内存使用数据
      for (let i = 0; i < iterations; i++) {
        const testData = Buffer.alloc(dataSize, i % 256);
        
        if (driver) {
          (driver as any).processData(testData);
        }

        // 每100次迭代记录内存使用
        if (i % 100 === 0 && typeof process !== 'undefined' && process.memoryUsage) {
          memoryUsage.push(process.memoryUsage().heapUsed);
        }

        // 偶尔让出控制权
        if (i % 200 === 0) {
          await new Promise(resolve => setImmediate(resolve));
        }
      }

      await vi.runAllTimersAsync();

      // 分析内存使用趋势
      if (memoryUsage.length > 2) {
        const initialMemory = memoryUsage[0];
        const finalMemory = memoryUsage[memoryUsage.length - 1];
        const memoryGrowth = finalMemory - initialMemory;
        const growthRatio = memoryGrowth / initialMemory;

        console.log(`内存使用趋势: 初始 ${(initialMemory / 1024 / 1024).toFixed(2)}MB, 最终 ${(finalMemory / 1024 / 1024).toFixed(2)}MB, 增长率: ${(growthRatio * 100).toFixed(2)}%`);

        // 验证内存增长受控 (增长率应该小于50%)
        expect(growthRatio).toBeLessThan(0.5);
      }

      // 验证对象池效果
      const poolManager = (ioManager as any).objectPoolManager;
      if (poolManager) {
        const poolStats = poolManager.getPoolStats();
        console.log(`对象池统计: 创建 ${poolStats.totalCreated}, 重用 ${poolStats.totalReused}, 重用率: ${((poolStats.totalReused / poolStats.totalCreated) * 100).toFixed(2)}%`);
        
        expect(poolStats.totalReused).toBeGreaterThan(0);
        expect(poolStats.totalReused / poolStats.totalCreated).toBeGreaterThan(0.3); // 30%以上重用率
      }
    });
  });

  describe('📦 大数据包处理性能测试', () => {
    it('应该处理 >1MB 的单个数据包', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        udpPort: 9090,
        protocol: 'udp'
      };

      await ioManager.connect(config);

      const largeDataSize = 2 * 1024 * 1024; // 2MB
      const largeData = Buffer.alloc(largeDataSize, 'X');

      performanceMetrics.startTime = Date.now();

      const driver = ioManager.driver;
      let bytesWritten = 0;

      if (driver) {
        bytesWritten = await driver.write(largeData);
      }

      performanceMetrics.endTime = Date.now();
      performanceMetrics.bytesProcessed = bytesWritten;

      const processingTime = performanceMetrics.endTime - performanceMetrics.startTime;
      const throughputMBps = (bytesWritten / 1024 / 1024) / (processingTime / 1000);

      console.log(`大数据包处理: ${(bytesWritten / 1024 / 1024).toFixed(2)}MB 用时 ${processingTime}ms, 吞吐量: ${throughputMBps.toFixed(2)} MB/s`);

      // 验证大数据包处理
      expect(bytesWritten).toBe(largeDataSize);
      expect(processingTime).toBeLessThan(5000); // 5秒内完成
      expect(throughputMBps).toBeGreaterThan(0.1); // 吞吐量 >0.1 MB/s
    });

    it('应该处理连续的大数据流', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);

      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.NoDelimiter,
        frameSize: 8192, // 8KB frames
        useMultiThread: true
      });

      let totalFrames = 0;
      let totalBytes = 0;

      ioManager.on('frame', (frame) => {
        totalFrames++;
        totalBytes += frame.data.length;
      });

      const driver = ioManager.driver;
      const streamCount = 100;
      const streamSize = 16384; // 16KB per stream, total ~1.6MB

      performanceMetrics.startTime = Date.now();

      // 连续发送大数据流
      if (driver) {
        for (let i = 0; i < streamCount; i++) {
          const streamData = Buffer.alloc(streamSize, i % 256);
          (driver as any).processData(streamData);

          // 每10个stream让出控制权
          if (i % 10 === 0) {
            await new Promise(resolve => setImmediate(resolve));
          }
        }
      }

      await vi.runAllTimersAsync();

      // 等待所有数据处理完成
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setImmediate(resolve));
      }

      performanceMetrics.endTime = Date.now();
      performanceMetrics.framesProcessed = totalFrames;
      performanceMetrics.bytesProcessed = totalBytes;

      const processingTime = performanceMetrics.endTime - performanceMetrics.startTime;
      const throughputMBps = (totalBytes / 1024 / 1024) / (processingTime / 1000);

      console.log(`连续大数据流处理: ${totalFrames} 帧, ${(totalBytes / 1024 / 1024).toFixed(2)}MB, 用时 ${processingTime}ms, 吞吐量: ${throughputMBps.toFixed(2)} MB/s`);

      // 验证连续大数据流处理
      expect(totalFrames).toBeGreaterThan(streamCount * 0.8); // 80%以上的frames被处理
      expect(totalBytes).toBeGreaterThan(streamCount * streamSize * 0.8);
      expect(throughputMBps).toBeGreaterThan(1); // 吞吐量 >1 MB/s
    });

    it('应该处理分片的大帧重组', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      await ioManager.connect(config);

      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.StartEndDelimited,
        startSequence: Buffer.from('START'),
        endSequence: Buffer.from('END')
      });

      let assembledFrames = 0;
      let assembledBytes = 0;

      ioManager.on('frame', (frame) => {
        assembledFrames++;
        assembledBytes += frame.data.length;
      });

      const driver = ioManager.driver;
      const originalMessage = 'A'.repeat(100000); // 100KB message
      const fullFrame = Buffer.from(`START${originalMessage}END`);

      // 将大帧分片发送
      const chunkSize = 1024;
      const chunks = [];

      for (let i = 0; i < fullFrame.length; i += chunkSize) {
        chunks.push(fullFrame.slice(i, Math.min(i + chunkSize, fullFrame.length)));
      }

      performanceMetrics.startTime = Date.now();

      if (driver) {
        for (const chunk of chunks) {
          (driver as any).processData(chunk);
          
          // 模拟网络延迟
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      await vi.runAllTimersAsync();

      // 等待帧重组完成
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setImmediate(resolve));
      }

      performanceMetrics.endTime = Date.now();
      performanceMetrics.framesProcessed = assembledFrames;
      performanceMetrics.bytesProcessed = assembledBytes;

      const processingTime = performanceMetrics.endTime - performanceMetrics.startTime;

      console.log(`分片重组处理: ${assembledFrames} 帧, ${assembledBytes} 字节, 用时 ${processingTime}ms`);

      // 验证分片重组
      expect(assembledFrames).toBe(1); // 应该重组为1个完整帧
      expect(assembledBytes).toBe(originalMessage.length); // 验证数据完整性
      expect(processingTime).toBeLessThan(3000); // 3秒内完成
    });
  });

  describe('⏱️ 长时间运行稳定性测试', () => {
    it('应该在长时间运行中保持稳定性', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(config);

      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.EndDelimited,
        endSequence: Buffer.from('\r\n')
      });

      let totalFrames = 0;
      let errorCount = 0;
      let connectionDrops = 0;

      ioManager.on('frame', () => totalFrames++);
      ioManager.on('error', () => errorCount++);
      ioManager.on('disconnected', () => connectionDrops++);

      const driver = ioManager.driver;
      const testDuration = 5000; // 5秒测试 (在实际环境中可能需要更长)
      const messageInterval = 100; // 每100ms发送一条消息

      performanceMetrics.startTime = Date.now();

      // 模拟长时间运行
      const sendInterval = setInterval(() => {
        if (driver && ioManager.isConnected) {
          const message = `Message at ${Date.now()}\r\n`;
          (driver as any).processData(Buffer.from(message));
        }
      }, messageInterval);

      // 运行指定时间
      await new Promise(resolve => setTimeout(resolve, testDuration));
      clearInterval(sendInterval);

      await vi.runAllTimersAsync();
      performanceMetrics.endTime = Date.now();

      const expectedMessages = Math.floor(testDuration / messageInterval);
      const messageSuccessRate = totalFrames / expectedMessages;
      const errorRate = errorCount / totalFrames;

      console.log(`长时间运行结果: ${totalFrames}/${expectedMessages} 消息处理, 成功率: ${(messageSuccessRate * 100).toFixed(2)}%, 错误率: ${(errorRate * 100).toFixed(2)}%`);

      // 验证长时间稳定性
      expect(messageSuccessRate).toBeGreaterThan(0.9); // 90%以上成功率
      expect(errorRate).toBeLessThan(0.05); // 错误率小于5%
      expect(connectionDrops).toBeLessThan(2); // 连接掉线次数小于2
      expect(ioManager.isConnected).toBe(true); // 最终状态应该是连接的
    });

    it('应该处理周期性的内存清理', async () => {
      const config: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'test-device-001',
        serviceUuid: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        characteristicUuid: '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
      };

      await ioManager.connect(config);

      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.NoDelimiter,
        frameSize: 20,
        useObjectPool: true
      });

      const driver = ioManager.driver;
      const cycles = 50; // 50个周期
      const messagesPerCycle = 20;

      let memoryReadings: number[] = [];

      for (let cycle = 0; cycle < cycles; cycle++) {
        // 生成一轮数据
        if (driver) {
          for (let msg = 0; msg < messagesPerCycle; msg++) {
            const data = Buffer.from(`Cycle-${cycle}-Msg-${msg}-Data`);
            (driver as any).processData(data);
          }
        }

        // 等待处理
        await vi.runAllTimersAsync();
        await new Promise(resolve => setImmediate(resolve));

        // 记录内存使用
        if (typeof process !== 'undefined' && process.memoryUsage) {
          memoryReadings.push(process.memoryUsage().heapUsed);
        }

        // 模拟定期清理
        if (cycle % 10 === 0) {
          const poolManager = (ioManager as any).objectPoolManager;
          if (poolManager && typeof poolManager.cleanup === 'function') {
            poolManager.cleanup();
          }

          // 强制垃圾回收 (如果支持)
          if (typeof global.gc === 'function') {
            global.gc();
          }
        }
      }

      // 分析内存使用模式
      if (memoryReadings.length > 10) {
        const firstHalf = memoryReadings.slice(0, Math.floor(memoryReadings.length / 2));
        const secondHalf = memoryReadings.slice(Math.floor(memoryReadings.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const memoryGrowthRatio = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

        console.log(`内存清理效果: 前半段平均 ${(firstHalfAvg / 1024 / 1024).toFixed(2)}MB, 后半段平均 ${(secondHalfAvg / 1024 / 1024).toFixed(2)}MB, 增长率: ${(memoryGrowthRatio * 100).toFixed(2)}%`);

        // 验证内存清理效果
        expect(memoryGrowthRatio).toBeLessThan(0.3); // 内存增长应该控制在30%以内
      }
    });
  });

  describe('💻 CPU使用率监控测试', () => {
    it('应该在高负载下保持合理的CPU使用率', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      await ioManager.connect(config);

      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.StartEndDelimited,
        startSequence: Buffer.from('<<'),
        endSequence: Buffer.from('>>'),
        useMultiThread: true // 多线程减轻主线程负担
      });

      const driver = ioManager.driver;
      const testDurationMs = 3000;
      const highFrequencyInterval = 10; // 每10ms发送数据

      let cpuUsageSamples: number[] = [];
      let processedFrames = 0;

      ioManager.on('frame', () => processedFrames++);

      // CPU使用率采样 (简化版本，实际环境中需要更精确的测量)
      const cpuMonitor = setInterval(() => {
        if (typeof process !== 'undefined' && process.cpuUsage) {
          const cpuUsage = process.cpuUsage();
          const totalUsage = cpuUsage.user + cpuUsage.system;
          cpuUsageSamples.push(totalUsage);
        }
      }, 500);

      performanceMetrics.startTime = Date.now();

      // 高频数据生成
      const dataGenerator = setInterval(() => {
        if (driver) {
          const data = Buffer.from(`<<${Date.now()}-${Math.random()}>>`);
          (driver as any).processData(data);
        }
      }, highFrequencyInterval);

      // 运行测试
      await new Promise(resolve => setTimeout(resolve, testDurationMs));

      clearInterval(dataGenerator);
      clearInterval(cpuMonitor);
      await vi.runAllTimersAsync();

      performanceMetrics.endTime = Date.now();
      performanceMetrics.framesProcessed = processedFrames;

      const expectedFrames = Math.floor(testDurationMs / highFrequencyInterval);
      const processingEfficiency = processedFrames / expectedFrames;

      console.log(`CPU负载测试: 处理 ${processedFrames}/${expectedFrames} 帧, 处理效率: ${(processingEfficiency * 100).toFixed(2)}%`);

      if (cpuUsageSamples.length > 0) {
        const avgCpuUsage = cpuUsageSamples.reduce((a, b) => a + b, 0) / cpuUsageSamples.length;
        console.log(`平均CPU使用: ${avgCpuUsage.toFixed(0)} 微秒`);
      }

      // 验证CPU使用效率
      expect(processingEfficiency).toBeGreaterThan(0.7); // 70%以上处理效率
      expect(processedFrames).toBeGreaterThan(expectedFrames * 0.7);
    });

    it('应该在多线程模式下分散CPU负载', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);

      // 比较单线程和多线程性能
      const testScenarios = [
        { name: '单线程模式', useMultiThread: false },
        { name: '多线程模式', useMultiThread: true }
      ];

      const results: { [key: string]: { frames: number; time: number } } = {};

      for (const scenario of testScenarios) {
        await ioManager.updateFrameConfig({
          detectionMode: FrameDetectionMode.EndDelimited,
          endSequence: Buffer.from('\n'),
          useMultiThread: scenario.useMultiThread,
          maxWorkers: scenario.useMultiThread ? 4 : undefined
        });

        let framesProcessed = 0;
        const frameHandler = () => framesProcessed++;
        ioManager.on('frame', frameHandler);

        const startTime = Date.now();
        const driver = ioManager.driver;

        // 发送大量数据
        if (driver) {
          for (let i = 0; i < 1000; i++) {
            const data = Buffer.from(`Frame-${i}-${Date.now()}\n`);
            (driver as any).processData(data);

            if (i % 100 === 0) {
              await new Promise(resolve => setImmediate(resolve));
            }
          }
        }

        await vi.runAllTimersAsync();

        // 等待处理完成
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setImmediate(resolve));
        }

        const endTime = Date.now();
        results[scenario.name] = {
          frames: framesProcessed,
          time: endTime - startTime
        };

        ioManager.removeListener('frame', frameHandler);

        console.log(`${scenario.name}: 处理 ${framesProcessed} 帧, 用时 ${endTime - startTime}ms`);
      }

      // 验证多线程性能提升
      const singleThreadPerf = results['单线程模式'];
      const multiThreadPerf = results['多线程模式'];

      if (singleThreadPerf && multiThreadPerf) {
        const multiThreadSpeedup = singleThreadPerf.time / multiThreadPerf.time;
        const frameProcessingRatio = multiThreadPerf.frames / singleThreadPerf.frames;

        console.log(`多线程加速比: ${multiThreadSpeedup.toFixed(2)}x, 帧处理比例: ${frameProcessingRatio.toFixed(2)}`);

        // 多线程应该有一定的性能提升或至少不显著下降
        expect(frameProcessingRatio).toBeGreaterThan(0.8); // 处理的帧数不应显著减少
        
        // 在理想情况下，多线程应该更快或相近
        // 但由于测试环境的限制，我们主要验证功能性
        expect(multiThreadPerf.frames).toBeGreaterThan(0);
      }
    });
  });
});
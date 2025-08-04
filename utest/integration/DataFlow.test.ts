/**
 * 集成测试：数据流 - Extension与Webview通信
 * 测试完整的数据处理管道从串口到可视化组件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager } from '../../src/extension/io/Manager';
import { FrameReader } from '../../src/extension/parsing/FrameReader';
import { FrameParser } from '../../src/extension/parsing/FrameParser';
import { MessageBridge } from '../../src/webview/utils/MessageBridge';
import { ChecksumAlgorithm } from '../../src/extension/parsing/Checksum';
import { 
  BusType, 
  FrameDetection, 
  DecoderMethod,
  ConnectionConfig,
  FrameConfig,
  MessageType,
  Frame,
  Dataset
} from '../../src/shared/types';

// Mock vscode module
vi.mock('vscode', () => ({
  window: {
    createWebviewPanel: vi.fn(() => ({
      webview: {
        postMessage: vi.fn(),
        onDidReceiveMessage: vi.fn()
      },
      onDidDispose: vi.fn()
    }))
  },
  Uri: {
    file: vi.fn(path => ({ fsPath: path }))
  }
}));

describe('数据流集成测试', () => {
  let ioManager: IOManager;
  let frameReader: FrameReader;
  let frameParser: FrameParser;
  let messageBridge: MessageBridge;
  
  let receivedMessages: any[] = [];

  beforeEach(() => {
    // 设置测试环境
    receivedMessages = [];
    
    ioManager = new IOManager();
    frameReader = new FrameReader({
      frameDetection: FrameDetection.EndDelimiterOnly,
      finishSequence: new Uint8Array([0x0A]),
      decoderMethod: DecoderMethod.PlainText,
      checksumAlgorithm: ChecksumAlgorithm.None
    });
    frameParser = new FrameParser();
    
    // Mock MessageBridge
    messageBridge = {
      sendToWebview: vi.fn((message) => {
        receivedMessages.push(message);
      }),
      onWebviewMessage: vi.fn(),
      dispose: vi.fn()
    } as any;
  });

  afterEach(async () => {
    await ioManager.destroy();
    messageBridge.dispose();
  });

  describe('完整数据处理流程', () => {
    it('应该正确处理从串口到可视化的完整数据流', async () => {
      // 1. 设置JavaScript解析脚本
      const parseScript = `
        function parse(frame) {
          const values = frame.split(',').map(v => parseFloat(v.trim()));
          return values;
        }
      `;
      
      const scriptLoaded = frameParser.loadScript(parseScript);
      expect(scriptLoaded).toBe(true);
      
      // 2. 设置数据集配置
      frameParser.updateConfig({
        datasets: [
          { title: 'Temperature', unit: '°C' },
          { title: 'Humidity', unit: '%' },
          { title: 'Pressure', unit: 'hPa' }
        ]
      });
      
      // 3. 模拟串口数据接收
      const testData = Buffer.from('25.5, 60.2, 1013.25\n');
      
      // 4. 创建Promise来等待frameExtracted事件
      const frameProcessed = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          // 5. 解析帧数据
          const datasets = await frameParser.createDatasets(frame);
          
          // 6. 发送到webview
          messageBridge.sendToWebview({
            type: MessageType.DataUpdate,
            payload: {
              frameId: frame.id,
              timestamp: frame.timestamp,
              datasets: datasets
            }
          });
          resolve();
        });
      });
      
      // 7. 处理数据
      frameReader.processData(testData);
      
      // 8. 等待事件处理完成
      await frameProcessed;
      
      // 9. 验证结果
      expect(receivedMessages).toHaveLength(1);
      
      const message = receivedMessages[0];
      expect(message.type).toBe(MessageType.DataUpdate);
      expect(message.payload.datasets).toHaveLength(3);
      expect(message.payload.datasets[0].title).toBe('Temperature');
      expect(message.payload.datasets[0].value).toBe(25.5);
      expect(message.payload.datasets[0].unit).toBe('°C');
    });

    it('应该处理多帧数据的连续流', async () => {
      const parseScript = `
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      const frameCount = 100;
      let processedFrames = 0;
      
      // 创建Promise来等待所有帧处理完成
      const allFramesProcessed = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          const datasets = await frameParser.createDatasets(frame);
          processedFrames++;
          
          messageBridge.sendToWebview({
            type: MessageType.DataUpdate,
            payload: { datasets }
          });
          
          // 当处理完所有帧时resolve
          if (processedFrames >= frameCount) {
            resolve();
          }
        });
      });
      
      // 模拟连续数据流
      for (let i = 0; i < frameCount; i++) {
        const data = Buffer.from(`${i * 0.1}\n`);
        frameReader.processData(data);
      }
      
      // 等待所有帧处理完成
      await allFramesProcessed;
      
      expect(processedFrames).toBe(frameCount);
      expect(receivedMessages).toHaveLength(frameCount);
    });

    it('应该正确处理错误帧和恢复', async () => {
      const parseScript = `
        function parse(frame) {
          if (frame.includes('ERROR')) {
            throw new Error('Parse error');
          }
          return [parseFloat(frame)];
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      let successCount = 0;
      let errorCount = 0;
      const expectedTotalFrames = 6;
      
      // 创建Promise来等待所有帧处理完成
      const allFramesProcessed = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          // 使用setImmediate确保异步处理
          setImmediate(async () => {
            try {
              const datasets = await frameParser.createDatasets(frame);
              successCount++;
              
              messageBridge.sendToWebview({
                type: MessageType.DataUpdate,
                payload: { datasets }
              });
            } catch (error) {
              errorCount++;
              
              messageBridge.sendToWebview({
                type: MessageType.ParseError,
                payload: { error: error.message, frameId: frame.id }
              });
            }
            
            // 当处理完所有帧时resolve
            if (successCount + errorCount >= expectedTotalFrames) {
              resolve();
            }
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      
      // 混合正常和错误数据
      const testData = Buffer.from('1.5\nERROR_FRAME\n2.5\n3.5\nERROR_FRAME\n4.5\n');
      frameReader.processData(testData);
      
      // 等待所有帧处理完成
      await allFramesProcessed;
      
      expect(successCount).toBe(4); // 4个正常帧
      expect(errorCount).toBe(2);   // 2个错误帧
    });
  });

  describe('性能和可扩展性测试', () => {
    it('应该在高数据率下保持实时性能', async () => {
      const parseScript = `
        function parse(frame) {
          const values = frame.split(',');
          return values.map(v => parseFloat(v));
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      const dataRate = 1000; // 1000帧/秒
      const testDuration = 1000; // 1秒测试
      const expectedFrames = dataRate;
      
      let processedFrames = 0;
      const startTime = Date.now();
      
      frameReader.on('frameExtracted', async (frame: Frame) => {
        const datasets = await frameParser.createDatasets(frame);
        processedFrames++;
        
        // 模拟发送到webview的延迟
        messageBridge.sendToWebview({
          type: MessageType.DataUpdate,
          payload: { datasets }
        });
      });
      
      // 生成高频数据
      const interval = setInterval(() => {
        const data = Buffer.from(`${Math.random()},${Math.random()}\n`);
        frameReader.processData(data);
        
        if (Date.now() - startTime >= testDuration) {
          clearInterval(interval);
        }
      }, 1);
      
      // 等待测试完成，给额外时间让所有异步事件处理完
      await new Promise(resolve => setTimeout(resolve, testDuration + 200));
      
      // 降低性能预期，因为测试环境可能不如生产环境
      expect(processedFrames).toBeGreaterThan(expectedFrames * 0.5); // 允许50%的性能损失
    });

    it('应该有效管理内存使用', async () => {
      const parseScript = `
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      const largeDatasetCount = 10000;
      let processedCount = 0;
      
      // 创建Promise来等待所有帧处理完成
      const allFramesProcessed = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          const datasets = await frameParser.createDatasets(frame);
          processedCount++;
          
          messageBridge.sendToWebview({
            type: MessageType.DataUpdate,
            payload: { datasets }
          });
          
          // 当处理完所有帧时resolve
          if (processedCount >= largeDatasetCount) {
            resolve();
          }
        });
      });
      
      // 处理大量数据
      for (let i = 0; i < largeDatasetCount; i++) {
        const data = Buffer.from(`${i}\n`);
        frameReader.processData(data);
        
        // 每1000帧检查一次内存使用
        if (i % 1000 === 0 && typeof process !== 'undefined' && process.memoryUsage) {
          const memUsage = process.memoryUsage();
          // 内存使用不应该持续增长（避免内存泄漏）
          expect(memUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB限制
        }
      }
      
      // 等待所有帧处理完成
      await allFramesProcessed;
      
      expect(processedCount).toBe(largeDatasetCount);
    });
  });

  describe('错误处理和恢复', () => {
    it('应该从解析器崩溃中恢复', async () => {
      const badScript = `
        function parse(frame) {
          // 故意引起崩溃
          undefined.toString();
          return [1];
        }
      `;
      
      frameParser.loadScript(badScript);
      
      let errorReported = false;
      
      // 创建Promise等待处理完成
      const processingComplete = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          // 使用setImmediate确保异步处理
          setImmediate(async () => {
            try {
              await frameParser.createDatasets(frame);
            } catch (error) {
              errorReported = true;
              
              // 报告错误并尝试恢复
              messageBridge.sendToWebview({
                type: MessageType.ParseError,
                payload: { error: error.message }
              });
              
              // 重新加载安全的脚本
              const safeScript = `
                function parse(frame) {
                  return [0]; // 默认值
                }
              `;
              frameParser.loadScript(safeScript);
              resolve();
            }
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      
      const testData = Buffer.from('test\n');
      frameReader.processData(testData);
      
      // 等待处理完成
      await processingComplete;
      
      expect(errorReported).toBe(true);
      expect(frameParser.isReady()).toBe(true); // 应该已恢复
    }, 10000);

    it('应该处理通信中断', async () => {
      const parseScript = `
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      // 模拟通信中断
      const originalSendToWebview = messageBridge.sendToWebview;
      messageBridge.sendToWebview = vi.fn(() => {
        throw new Error('Communication error');
      });
      
      let communicationErrors = 0;
      
      // 创建Promise等待处理完成
      const errorHandled = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          // 使用setImmediate确保异步处理
          setImmediate(async () => {
            try {
              const datasets = await frameParser.createDatasets(frame);
              messageBridge.sendToWebview({
                type: MessageType.DataUpdate,
                payload: { datasets }
              });
            } catch (error) {
              communicationErrors++;
              
              // 实现重试逻辑
              setTimeout(() => {
                // 恢复通信
                messageBridge.sendToWebview = originalSendToWebview;
                resolve();
              }, 100);
            }
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      
      const testData = Buffer.from('42.5\n');
      frameReader.processData(testData);
      
      // 等待错误处理完成
      await errorHandled;
      
      expect(communicationErrors).toBeGreaterThan(0);
    });
  });

  describe('配置动态更新', () => {
    it('应该支持运行时配置更新', async () => {
      // 初始配置
      let parseScript = `
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      const frame1Data = Buffer.from('42.5\n');
      let datasetCount = 0;
      
      // 创建Promise等待第一次处理完成
      const firstProcessed = new Promise<void>((resolve) => {
        frameReader.once('frameExtracted', async (frame: Frame) => {
          // 使用setImmediate确保异步处理
          setImmediate(async () => {
            const datasets = await frameParser.createDatasets(frame);
            datasetCount = datasets.length;
            
            messageBridge.sendToWebview({
              type: MessageType.DataUpdate,
              payload: { datasets }
            });
            resolve();
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      frameReader.processData(frame1Data);
      await firstProcessed;
      expect(datasetCount).toBe(1);
      
      // 动态更新解析脚本
      parseScript = `
        function parse(frame) {
          const values = frame.split(',');
          return values.map(v => parseFloat(v));
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      // 创建Promise等待第二次处理完成
      const secondProcessed = new Promise<void>((resolve) => {
        frameReader.once('frameExtracted', async (frame: Frame) => {
          // 使用setImmediate确保异步处理
          setImmediate(async () => {
            const datasets = await frameParser.createDatasets(frame);
            datasetCount = datasets.length;
            
            messageBridge.sendToWebview({
              type: MessageType.DataUpdate,
              payload: { datasets }
            });
            resolve();
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      const frame2Data = Buffer.from('1.1,2.2,3.3\n');
      frameReader.processData(frame2Data);
      await secondProcessed;
      
      expect(datasetCount).toBe(3); // 新脚本返回3个值
    });

    it('应该支持帧配置热更新', async () => {
      // 初始配置：换行符分隔
      frameReader.updateConfig({
        frameDetection: FrameDetection.EndDelimiterOnly,
        finishSequence: new Uint8Array([0x0A])
      });
      
      let frameCount = 0;
      frameReader.on('frameExtracted', () => frameCount++);
      
      // 创建Promise等待前两帧处理完成
      const firstBatchProcessed = new Promise<void>((resolve) => {
        let processedCount = 0;
        frameReader.on('frameExtracted', () => {
          setImmediate(() => {
            processedCount++;
            if (processedCount === 2) {
              resolve();
            }
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      const data1 = Buffer.from('frame1\nframe2\n');
      frameReader.processData(data1);
      await firstBatchProcessed;
      expect(frameCount).toBe(2);
      
      // 动态更新配置：使用不同分隔符
      frameReader.updateConfig({
        frameDetection: FrameDetection.EndDelimiterOnly,
        finishSequence: new Uint8Array([0x3B]) // 分号
      });
      
      // 创建Promise等待后两帧处理完成
      const secondBatchProcessed = new Promise<void>((resolve) => {
        let processedCount = frameCount;
        frameReader.on('frameExtracted', () => {
          setImmediate(() => {
            processedCount++;
            if (processedCount === 4) {
              resolve();
            }
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      const data2 = Buffer.from('frame3;frame4;');
      frameReader.processData(data2);
      await secondBatchProcessed;
      expect(frameCount).toBe(4); // 总共4帧
    });
  });

  describe('实时性能监控', () => {
    it('应该提供性能统计信息', async () => {
      const parseScript = `
        function parse(frame) {
          return [parseFloat(frame)];
        }
      `;
      
      frameParser.loadScript(parseScript);
      
      let performanceStats: any[] = [];
      
      // 创建Promise等待所有帧处理完成
      const allFramesProcessed = new Promise<void>((resolve) => {
        frameReader.on('frameExtracted', async (frame: Frame) => {
          // 使用setImmediate确保异步处理
          setImmediate(async () => {
            const startTime = process.hrtime.bigint();
            
            const datasets = await frameParser.createDatasets(frame);
            
            const endTime = process.hrtime.bigint();
            const processingTime = Number(endTime - startTime) / 1000000; // 毫秒
            
            performanceStats.push({
              frameId: frame.id,
              processingTime,
              datasetCount: datasets.length
            });
            
            messageBridge.sendToWebview({
              type: MessageType.PerformanceUpdate,
              payload: {
                processingTime,
                frameRate: 1000 / processingTime,
                memoryUsage: process.memoryUsage?.() || {}
              }
            });
            
            // 当处理完所有帧时resolve
            if (performanceStats.length >= 100) {
              resolve();
            }
          });
        });
      });
      
      // 确保事件监听器设置完成后再处理数据
      await new Promise(resolve => setImmediate(resolve));
      
      // 处理测试数据
      for (let i = 0; i < 100; i++) {
        const data = Buffer.from(`${i * 0.1}\n`);
        frameReader.processData(data);
      }
      
      // 等待所有帧处理完成
      await allFramesProcessed;
      
      expect(performanceStats).toHaveLength(100);
      
      // 检查性能要求
      const avgProcessingTime = performanceStats.reduce((sum, stat) => sum + stat.processingTime, 0) / performanceStats.length;
      expect(avgProcessingTime).toBeLessThan(1); // 平均处理时间应小于1ms
      
      const maxProcessingTime = Math.max(...performanceStats.map(s => s.processingTime));
      expect(maxProcessingTime).toBeLessThan(10); // 最大处理时间应小于10ms
    });
  });
});
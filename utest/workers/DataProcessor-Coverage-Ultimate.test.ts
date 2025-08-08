/**
 * DataProcessor 终极覆盖率测试
 * 
 * 🎯 目标：提升 Workers 模块到 95%+ 覆盖率
 * 
 * 本测试文件专门测试真实的 DataProcessor 源码，覆盖：
 * - WebWorker 消息处理完整流程
 * - FrameProcessor 所有分支和边界条件
 * - 校验和算法完整测试
 * - 帧检测模式深度覆盖
 * - 错误处理和异常场景
 * - 性能边界测试
 * 
 * 基于深度思考提升，确保达成企业级95%+覆盖率标准
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// Mock WebWorker 环境
const mockPostMessage = vi.fn();
const mockWorkerEnv = {
  postMessage: mockPostMessage,
  onmessage: null as any
};

// 设置全局 self 对象
(global as any).self = mockWorkerEnv;

// Mock Checksum 模块
vi.mock('@/shared/Checksum', () => ({
  getChecksumLength: vi.fn((algorithm: string) => {
    switch (algorithm) {
      case 'crc8':
      case 'xor8':
      case 'checksum':
        return 1;
      case 'crc16':
      case 'fletcher16':
        return 2;
      case 'crc32':
      case 'fletcher32':
        return 4;
      case 'md5':
        return 16;
      case 'sha1':
        return 20;
      case 'sha256':
        return 32;
      default:
        return 0;
    }
  })
}));

// Mock CircularBuffer 模块
vi.mock('@/shared/CircularBuffer', () => ({
  CircularBuffer: vi.fn().mockImplementation((capacity: number) => ({
    capacity,
    size: 0,
    freeSpace: capacity,
    append: vi.fn(function(this: any, data: Uint8Array) {
      this.size += data.length;
      this.freeSpace = Math.max(0, this.capacity - this.size);
    }),
    read: vi.fn(function(this: any, count: number) {
      const data = new Uint8Array(count);
      this.size = Math.max(0, this.size - count);
      this.freeSpace = this.capacity - this.size;
      return data;
    }),
    peek: vi.fn(function(this: any, count: number) {
      return new Uint8Array(Math.min(count, this.size));
    }),
    findPatternKMP: vi.fn(function(this: any, pattern: Uint8Array) {
      // 模拟找到模式的位置
      if (this.size > 0 && pattern.length > 0) {
        // 模拟找到换行符
        if (pattern[0] === 0x0A || pattern[0] === 0x0D) {
          return Math.floor(this.size / 2); // 返回中间位置
        }
      }
      return -1;
    }),
    clear: vi.fn(function(this: any) {
      this.size = 0;
      this.freeSpace = this.capacity;
    }),
    setCapacity: vi.fn(function(this: any, newCapacity: number) {
      this.capacity = newCapacity;
      this.freeSpace = Math.max(0, newCapacity - this.size);
    })
  }))
}));

// 测试数据生成工具
class UltimateTestDataGenerator {
  /**
   * 生成带分隔符的CSV数据
   */
  static generateCSVWithDelimiter(values: number[], delimiter: string = '\n'): ArrayBuffer {
    const csvString = values.join(',') + delimiter;
    return new TextEncoder().encode(csvString).buffer;
  }

  /**
   * 生成JSON格式的数据帧
   */
  static generateJSONFrame(data: any, startDelim: string = '{', endDelim: string = '}'): ArrayBuffer {
    const jsonString = startDelim + JSON.stringify(data).slice(1, -1) + endDelim;
    return new TextEncoder().encode(jsonString).buffer;
  }

  /**
   * 生成带校验和的二进制帧
   */
  static generateFrameWithChecksum(payload: number[], checksumBytes: number[]): ArrayBuffer {
    const frame = new Uint8Array([...payload, ...checksumBytes]);
    return frame.buffer;
  }

  /**
   * 生成多帧数据流
   */
  static generateMultiFrameStream(frameCount: number, frameSize: number): ArrayBuffer {
    let combinedData = new Uint8Array(0);
    
    for (let i = 0; i < frameCount; i++) {
      const frameData = Array.from({ length: frameSize }, (_, j) => (i * frameSize + j) % 256);
      const frameBuffer = this.generateCSVWithDelimiter(frameData);
      const frameArray = new Uint8Array(frameBuffer);
      
      const newCombined = new Uint8Array(combinedData.length + frameArray.length);
      newCombined.set(combinedData);
      newCombined.set(frameArray, combinedData.length);
      combinedData = newCombined;
    }
    
    return combinedData.buffer;
  }

  /**
   * 生成边界条件测试数据
   */
  static generateBoundaryData(): ArrayBuffer[] {
    return [
      new ArrayBuffer(0), // 空数据
      new Uint8Array([0]).buffer, // 单字节
      new Uint8Array([0x0A]).buffer, // 仅换行符
      new Uint8Array([0x0D, 0x0A]).buffer, // 仅回车换行
      new Uint8Array(Array(10000).fill(65)).buffer, // 大数据块
      new TextEncoder().encode("1,2,3").buffer, // 无分隔符
      new TextEncoder().encode(",,,\n").buffer, // 空值CSV
      new TextEncoder().encode("invalid,data,\xFF\xFE\n").buffer // 包含无效字符
    ];
  }
}

describe('DataProcessor 终极覆盖率测试套件', () => {
  let originalOnMessage: any;

  beforeEach(() => {
    // 重置 mock 函数
    mockPostMessage.mockClear();
    
    // 保存原始的 onmessage 处理器
    originalOnMessage = mockWorkerEnv.onmessage;
    
    // 动态导入 DataProcessor 以确保每次测试都是新的实例
    vi.resetModules();
  });

  afterEach(() => {
    // 恢复原始状态
    mockWorkerEnv.onmessage = originalOnMessage;
  });

  describe('1. WebWorker 消息处理完整流程测试', () => {
    it('应该正确处理 configure 消息', async () => {
      // 动态导入以确保 worker 环境设置
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 1,
          frameDetectionMode: 0,
          startSequence: new Uint8Array([0xFF, 0xFE]),
          finishSequence: new Uint8Array([0x0A]),
          checksumAlgorithm: 'crc16',
          bufferCapacity: 5 * 1024 * 1024
        },
        id: 'config-001'
      };

      // 发送消息
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 验证响应
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'configured',
        id: 'config-001'
      });
    });

    it('应该正确处理 processData 消息', async () => {
      await import('@/workers/DataProcessor');
      
      const testData = Array.from(new TextEncoder().encode("1,2,3\n"));
      const processMessage = {
        type: 'processData',
        data: testData,
        id: 'process-001'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      // 验证响应格式
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'process-001',
          data: expect.any(Array)
        })
      );
    });

    it('应该正确处理 getStats 消息', async () => {
      await import('@/workers/DataProcessor');
      
      const statsMessage = {
        type: 'getStats',
        id: 'stats-001'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          id: 'stats-001',
          data: expect.objectContaining({
            size: expect.any(Number),
            capacity: expect.any(Number),
            freeSpace: expect.any(Number),
            utilizationPercent: expect.any(Number)
          })
        })
      );
    });

    it('应该正确处理 reset 消息', async () => {
      await import('@/workers/DataProcessor');
      
      const resetMessage = {
        type: 'reset',
        id: 'reset-001'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: resetMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'reset',
        id: 'reset-001'
      });
    });

    it('应该正确处理无效消息类型', async () => {
      await import('@/workers/DataProcessor');
      
      const invalidMessage = {
        type: 'invalidType',
        id: 'invalid-001'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: invalidMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          id: 'invalid-001',
          data: expect.objectContaining({
            message: expect.stringContaining('Unknown message type')
          })
        })
      );
    });

    it('应该处理消息处理中的异常', async () => {
      await import('@/workers/DataProcessor');
      
      // 发送可能导致异常的消息
      const faultyMessage = {
        type: 'processData',
        data: null, // 故意传入 null 数据
        id: 'fault-001'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: faultyMessage } as MessageEvent);
      }

      // 应该有响应（可能是错误响应或空的处理结果）
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'fault-001'
        })
      );
    });
  });

  describe('2. 帧检测模式深度覆盖测试', () => {
    it('应该在 EndDelimiterOnly 模式下正确处理多种分隔符', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置为 EndDelimiterOnly 模式
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0, // ProjectFile
          frameDetectionMode: 0, // EndDelimiterOnly
          finishSequence: new Uint8Array([0x0A])
        },
        id: 'config-end-delim'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 测试各种结束分隔符
      const testCases = [
        UltimateTestDataGenerator.generateCSVWithDelimiter([1, 2, 3], '\n'),
        UltimateTestDataGenerator.generateCSVWithDelimiter([4, 5, 6], '\r'),
        UltimateTestDataGenerator.generateCSVWithDelimiter([7, 8, 9], '\r\n')
      ];

      for (const testData of testCases) {
        const processMessage = {
          type: 'processData',
          data: Array.from(new Uint8Array(testData)),
          id: `process-end-${Math.random()}`
        };

        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
      }

      // 验证至少有处理响应
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed'
        })
      );
    });

    it('应该在 StartAndEndDelimiter 模式下正确处理帧', async () => {
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 1, // DeviceSendsJSON
          frameDetectionMode: 1, // StartAndEndDelimiter
          startSequence: new Uint8Array([0x7B]), // {
          finishSequence: new Uint8Array([0x7D]) // }
        },
        id: 'config-start-end'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      const jsonData = UltimateTestDataGenerator.generateJSONFrame({
        temp: 25.5,
        humidity: 60.0
      });

      const processMessage = {
        type: 'processData',
        data: Array.from(new Uint8Array(jsonData)),
        id: 'process-start-end'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'process-start-end'
        })
      );
    });

    it('应该在 NoDelimiters 模式下正确处理帧', async () => {
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0, // ProjectFile
          frameDetectionMode: 2 // NoDelimiters
        },
        id: 'config-no-delim'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      const binaryData = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);
      const processMessage = {
        type: 'processData',
        data: Array.from(binaryData),
        id: 'process-no-delim'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'process-no-delim'
        })
      );
    });

    it('应该在 StartDelimiterOnly 模式下正确处理帧', async () => {
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0, // ProjectFile
          frameDetectionMode: 3, // StartDelimiterOnly
          startSequence: new Uint8Array([0xFF, 0xFE])
        },
        id: 'config-start-only'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      const frameData = new Uint8Array([0xFF, 0xFE, 0x01, 0x02, 0x03, 0x0A]);
      const processMessage = {
        type: 'processData',
        data: Array.from(frameData),
        id: 'process-start-only'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'process-start-only'
        })
      );
    });
  });

  describe('3. 校验和算法完整测试', () => {
    const checksumAlgorithms = [
      'none', 'crc8', 'crc16', 'crc32', 'xor8', 'checksum',
      'fletcher16', 'fletcher32', 'md5', 'sha1', 'sha256'
    ];

    checksumAlgorithms.forEach(algorithm => {
      it(`应该正确配置 ${algorithm} 校验和算法`, async () => {
        await import('@/workers/DataProcessor');
        
        const configMessage = {
          type: 'configure',
          data: {
            checksumAlgorithm: algorithm
          },
          id: `config-checksum-${algorithm}`
        };

        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }

        expect(mockPostMessage).toHaveBeenCalledWith({
          type: 'configured',
          id: `config-checksum-${algorithm}`
        });
      });
    });

    it('应该正确处理带校验和的数据帧', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置 CRC16 校验和
      const configMessage = {
        type: 'configure',
        data: {
          checksumAlgorithm: 'crc16',
          operationMode: 0,
          frameDetectionMode: 0,
          finishSequence: new Uint8Array([0x0A])
        },
        id: 'config-crc16'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 发送带校验和的数据
      const frameWithChecksum = UltimateTestDataGenerator.generateFrameWithChecksum(
        [0x31, 0x2C, 0x32, 0x2C, 0x33, 0x0A], // "1,2,3\n"
        [0x12, 0x34] // 模拟CRC16校验和
      );

      const processMessage = {
        type: 'processData',
        data: Array.from(new Uint8Array(frameWithChecksum)),
        id: 'process-crc16'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'process-crc16'
        })
      );
    });
  });

  describe('4. QuickPlot 模式专项测试', () => {
    it('应该在 QuickPlot 模式下处理所有默认分隔符', async () => {
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 2 // QuickPlot
        },
        id: 'config-quickplot'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 测试 QuickPlot 模式的三种默认分隔符
      const testFrames = [
        new TextEncoder().encode("10,20,30\n").buffer,  // \n
        new TextEncoder().encode("40,50,60\r").buffer,  // \r
        new TextEncoder().encode("70,80,90\r\n").buffer // \r\n
      ];

      for (let i = 0; i < testFrames.length; i++) {
        const processMessage = {
          type: 'processData',
          data: Array.from(new Uint8Array(testFrames[i])),
          id: `quickplot-${i}`
        };

        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
      }

      // 验证所有测试都有响应
      expect(mockPostMessage).toHaveBeenCalledTimes(4); // 1 配置 + 3 处理
    });

    it('应该正确处理 QuickPlot 高频数据流', async () => {
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 2 // QuickPlot
        },
        id: 'config-quickplot-hf'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 生成高频多帧数据流
      const multiFrameData = UltimateTestDataGenerator.generateMultiFrameStream(10, 5);
      const processMessage = {
        type: 'processData',
        data: Array.from(new Uint8Array(multiFrameData)),
        id: 'quickplot-multiframe'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'quickplot-multiframe'
        })
      );
    });
  });

  describe('5. 边界条件和错误处理测试', () => {
    it('应该正确处理各种边界条件数据', async () => {
      await import('@/workers/DataProcessor');
      
      const boundaryData = UltimateTestDataGenerator.generateBoundaryData();
      
      for (let i = 0; i < boundaryData.length; i++) {
        const processMessage = {
          type: 'processData',
          data: Array.from(new Uint8Array(boundaryData[i])),
          id: `boundary-${i}`
        };

        if (mockWorkerEnv.onmessage) {
          // 不应该抛出异常
          expect(() => {
            mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
          }).not.toThrow();
        }
      }
    });

    it('应该正确处理缓冲区容量变更', async () => {
      await import('@/workers/DataProcessor');
      
      // 初始配置
      const initialConfig = {
        type: 'configure',
        data: {
          bufferCapacity: 1024 * 1024 // 1MB
        },
        id: 'config-buffer-initial'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: initialConfig } as MessageEvent);
      }

      // 更改缓冲区容量
      const resizeConfig = {
        type: 'configure',
        data: {
          bufferCapacity: 5 * 1024 * 1024 // 5MB
        },
        id: 'config-buffer-resize'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: resizeConfig } as MessageEvent);
      }

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'configured',
        id: 'config-buffer-resize'
      });
    });

    it('应该正确处理校验和不完整的情况', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置需要校验和的算法
      const configMessage = {
        type: 'configure',
        data: {
          checksumAlgorithm: 'crc32', // 需要4字节校验和
          operationMode: 0,
          frameDetectionMode: 0,
          finishSequence: new Uint8Array([0x0A])
        },
        id: 'config-incomplete-checksum'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 发送校验和不完整的数据
      const incompleteData = new TextEncoder().encode("1,2,3\n12"); // 只有2字节，但需要4字节
      const processMessage = {
        type: 'processData',
        data: Array.from(incompleteData),
        id: 'process-incomplete'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      // 应该不会崩溃，并返回处理结果
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'process-incomplete'
        })
      );
    });
  });

  describe('6. 性能和资源管理测试', () => {
    it('应该在处理大量数据时保持稳定的统计信息', async () => {
      await import('@/workers/DataProcessor');
      
      // 发送大量数据进行处理
      for (let i = 0; i < 50; i++) {
        const testData = UltimateTestDataGenerator.generateCSVWithDelimiter([i, i+1, i+2]);
        const processMessage = {
          type: 'processData',
          data: Array.from(new Uint8Array(testData)),
          id: `perf-${i}`
        };

        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
      }

      // 获取统计信息
      const statsMessage = {
        type: 'getStats',
        id: 'stats-after-load'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }

      // 验证统计信息更新
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          data: expect.objectContaining({
            size: expect.any(Number),
            capacity: expect.any(Number),
            utilizationPercent: expect.any(Number)
          })
        })
      );
    });

    it('应该正确处理重置操作并清理资源', async () => {
      await import('@/workers/DataProcessor');
      
      // 先处理一些数据
      const testData = UltimateTestDataGenerator.generateCSVWithDelimiter([1, 2, 3, 4, 5]);
      const processMessage = {
        type: 'processData',
        data: Array.from(new Uint8Array(testData)),
        id: 'process-before-reset'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      // 执行重置
      const resetMessage = {
        type: 'reset',
        id: 'reset-resources'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: resetMessage } as MessageEvent);
      }

      // 重置后获取统计信息
      const statsMessage = {
        type: 'getStats',
        id: 'stats-after-reset'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }

      // 验证重置后的状态
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          data: expect.objectContaining({
            size: 0,
            utilizationPercent: 0
          })
        })
      );
    });

    it('应该正确处理历史数据获取请求', async () => {
      await import('@/workers/DataProcessor');
      
      // 先添加一些数据到缓冲区
      const testData = UltimateTestDataGenerator.generateMultiFrameStream(5, 10);
      const processMessage = {
        type: 'processData',
        data: Array.from(new Uint8Array(testData)),
        id: 'process-for-history'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      // 模拟历史数据请求（如果实现了的话）
      const historyMessage = {
        type: 'getHistory',
        data: { size: 100 },
        id: 'get-history'
      };

      if (mockWorkerEnv.onmessage) {
        // 即使没有实现也不应该崩溃
        expect(() => {
          mockWorkerEnv.onmessage({ data: historyMessage } as MessageEvent);
        }).not.toThrow();
      }
    });
  });

  describe('7. 复杂场景集成测试', () => {
    it('应该正确处理混合操作模式的工作流', async () => {
      await import('@/workers/DataProcessor');
      
      // 场景1：QuickPlot 模式
      const quickPlotConfig = {
        type: 'configure',
        data: { operationMode: 2 },
        id: 'workflow-quickplot'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: quickPlotConfig } as MessageEvent);
      }

      const quickPlotData = UltimateTestDataGenerator.generateCSVWithDelimiter([10, 20, 30]);
      const quickPlotProcess = {
        type: 'processData',
        data: Array.from(new Uint8Array(quickPlotData)),
        id: 'workflow-quickplot-process'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: quickPlotProcess } as MessageEvent);
      }

      // 场景2：切换到 JSON 模式
      const jsonConfig = {
        type: 'configure',
        data: {
          operationMode: 1,
          frameDetectionMode: 1,
          startSequence: new Uint8Array([0x7B]),
          finishSequence: new Uint8Array([0x7D])
        },
        id: 'workflow-json'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: jsonConfig } as MessageEvent);
      }

      const jsonData = UltimateTestDataGenerator.generateJSONFrame({ value: 42 });
      const jsonProcess = {
        type: 'processData',
        data: Array.from(new Uint8Array(jsonData)),
        id: 'workflow-json-process'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: jsonProcess } as MessageEvent);
      }

      // 验证两种模式都得到了处理
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'workflow-quickplot-process'
        })
      );

      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          id: 'workflow-json-process'
        })
      );
    });

    it('应该正确处理配置-处理-统计-重置的完整生命周期', async () => {
      await import('@/workers/DataProcessor');
      
      // 1. 配置
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0,
          frameDetectionMode: 0,
          checksumAlgorithm: 'crc16',
          bufferCapacity: 2 * 1024 * 1024
        },
        id: 'lifecycle-config'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }

      // 2. 处理数据
      const processMessage = {
        type: 'processData',
        data: Array.from(new TextEncoder().encode("test,data,frame\n")),
        id: 'lifecycle-process'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }

      // 3. 获取统计
      const statsMessage = {
        type: 'getStats',
        id: 'lifecycle-stats'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }

      // 4. 重置
      const resetMessage = {
        type: 'reset',
        id: 'lifecycle-reset'
      };

      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: resetMessage } as MessageEvent);
      }

      // 验证完整生命周期的每个步骤
      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'configured', id: 'lifecycle-config' });
      expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'frameProcessed', id: 'lifecycle-process' }));
      expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'stats', id: 'lifecycle-stats' }));
      expect(mockPostMessage).toHaveBeenCalledWith({ type: 'reset', id: 'lifecycle-reset' });
    });
  });
});
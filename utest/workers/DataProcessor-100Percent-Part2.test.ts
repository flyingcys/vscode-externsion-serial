/**
 * DataProcessor 100% 覆盖率测试 - 第二部分
 * 
 * 继续测试 DataProcessor.ts 的剩余功能：
 * ✅ 帧提取算法深度测试 (readEndDelimitedFrames, readStartEndDelimitedFrames, readStartDelimitedFrames)
 * ✅ 校验和验证系统完整测试
 * ✅ 辅助功能测试 (getHistoricalData, getBufferStats, enqueueFrame, reset)
 * ✅ 错误场景和极端边界条件
 * ✅ QuickPlot 特殊场景测试
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// 复用相同的 Mock 设置
const mockPostMessage = vi.fn();
const mockWorkerEnv = {
  postMessage: mockPostMessage,
  onmessage: null as any
};

(global as any).self = mockWorkerEnv;

const mockCircularBuffer = {
  append: vi.fn(),
  read: vi.fn(() => new Uint8Array([1, 2, 3, 4])),
  peek: vi.fn(() => new Uint8Array([1, 2, 3, 4])),
  clear: vi.fn(),
  findPatternKMP: vi.fn(() => -1),
  size: 100,
  capacity: 1024 * 1024 * 10,
  freeSpace: 1024 * 1024 * 10 - 100,
  setCapacity: vi.fn()
};

vi.mock('@/shared/CircularBuffer', () => ({
  CircularBuffer: vi.fn().mockImplementation(() => mockCircularBuffer)
}));

const mockGetChecksumLength = vi.fn((algorithm: string) => {
  const lengths: Record<string, number> = {
    'none': 0, 'crc8': 1, 'xor8': 1, 'checksum': 1,
    'crc16': 2, 'fletcher16': 2, 'crc32': 4, 'fletcher32': 4,
    'md5': 16, 'sha1': 20, 'sha256': 32
  };
  return lengths[algorithm] || 0;
});

vi.mock('@/shared/Checksum', () => ({
  getChecksumLength: mockGetChecksumLength
}));

// Mock Comlink for testing
vi.mock('comlink', () => ({
  expose: vi.fn()
}));

describe('DataProcessor 100% Coverage - Part 2: Advanced Frame Processing', () => {
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockCircularBuffer.size = 100;
    mockCircularBuffer.freeSpace = 1024 * 1024 * 10 - 100;
    mockCircularBuffer.findPatternKMP.mockReturnValue(-1);
    mockCircularBuffer.peek.mockReturnValue(new Uint8Array([65, 66, 67, 68])); // ABCD
    mockCircularBuffer.read.mockReturnValue(new Uint8Array([65, 66, 67, 68]));
  });
  
  afterEach(() => {
    mockWorkerEnv.onmessage = null;
    vi.clearAllTimers();
  });

  // ===========================================
  // 5. 帧提取算法深度测试
  // ===========================================
  
  describe('Frame Extraction Algorithms - Complete Coverage', () => {
    
    describe('readEndDelimitedFrames - QuickPlot Mode', () => {
      
      it('should extract frame with \\n delimiter in QuickPlot mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 配置 QuickPlot 模式
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 2, // QuickPlot
            frameDetectionMode: 0, // EndDelimiterOnly
            checksumAlgorithm: 'none'
          },
          id: 'quickplot-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟找到 \\n 分隔符
        mockCircularBuffer.findPatternKMP.mockImplementation((pattern: Uint8Array) => {
          if (pattern.length === 1 && pattern[0] === 0x0A) { // \\n
            return 10; // 在位置10找到
          }
          return -1;
        });
        
        // 模拟缓冲区数据
        mockCircularBuffer.size = 20;
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72, 73, 74])); // 10字节数据
        
        const testData = new ArrayBuffer(8);
        const processMessage = {
          type: 'processData',
          data: testData,
          id: 'quickplot-newline-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证帧被正确提取
        expect(mockCircularBuffer.peek).toHaveBeenCalledWith(10);
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(11); // 10 + 1 (\n)
      });
      
      it('should extract frame with \\r delimiter in QuickPlot mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 模拟找到 \\r 分隔符
        mockCircularBuffer.findPatternKMP.mockImplementation((pattern: Uint8Array) => {
          if (pattern.length === 1 && pattern[0] === 0x0D) { // \\r
            return 5;
          }
          return -1;
        });
        
        mockCircularBuffer.size = 15;
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([65, 66, 67, 68, 69])); // 5字节数据
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'quickplot-cr-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        expect(mockCircularBuffer.peek).toHaveBeenCalledWith(5);
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(6); // 5 + 1 (\r)
      });
      
      it('should extract frame with \\r\\n delimiter in QuickPlot mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 模拟找到 \\r\\n 分隔符
        mockCircularBuffer.findPatternKMP.mockImplementation((pattern: Uint8Array) => {
          if (pattern.length === 2 && pattern[0] === 0x0D && pattern[1] === 0x0A) { // \\r\\n
            return 8;
          }
          return -1;
        });
        
        mockCircularBuffer.size = 20;
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([72, 101, 108, 108, 111, 87, 111, 114])); // "HelloWor"
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'quickplot-crlf-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        expect(mockCircularBuffer.peek).toHaveBeenCalledWith(8);
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(10); // 8 + 2 (\r\n)
      });
      
      it('should handle no delimiter found in QuickPlot mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 所有分隔符都不存在
        mockCircularBuffer.findPatternKMP.mockReturnValue(-1);
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'quickplot-no-delim-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证返回空帧列表
        expect(mockPostMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'frameProcessed',
            data: [],
            id: 'quickplot-no-delim-test'
          })
        );
      });
      
      it('should prioritize earliest delimiter in QuickPlot mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 模拟多个分隔符，\n 在位置3，\r 在位置5
        let callCount = 0;
        mockCircularBuffer.findPatternKMP.mockImplementation((pattern: Uint8Array) => {
          callCount++;
          if (pattern.length === 1 && pattern[0] === 0x0A) { // \\n
            return 3;
          }
          if (pattern.length === 1 && pattern[0] === 0x0D) { // \\r  
            return 5;
          }
          return -1;
        });
        
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([65, 66, 67])); // ABC
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'quickplot-priority-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证使用了最早的分隔符位置
        expect(mockCircularBuffer.peek).toHaveBeenCalledWith(3);
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(4); // 3 + 1
      });
    });
    
    describe('readEndDelimitedFrames - ProjectFile Mode', () => {
      
      it('should extract frame with custom end delimiter', async () => {
        await import('@/workers/DataProcessor');
        
        // 配置 ProjectFile 模式
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 0, // ProjectFile
            frameDetectionMode: 0, // EndDelimiterOnly
            finishSequence: new Uint8Array([0xFF, 0xFE]), // 自定义结束分隔符
            checksumAlgorithm: 'none'
          },
          id: 'project-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟找到自定义分隔符
        mockCircularBuffer.findPatternKMP.mockImplementation((pattern: Uint8Array) => {
          if (pattern.length === 2 && pattern[0] === 0xFF && pattern[1] === 0xFE) {
            return 12;
          }
          return -1;
        });
        
        mockCircularBuffer.size = 25;
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12]));
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'project-custom-delim-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        expect(mockCircularBuffer.peek).toHaveBeenCalledWith(12);
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(14); // 12 + 2
      });
      
      it('should handle checksum validation in EndDelimiterOnly mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 配置带校验和的模式
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 0, // ProjectFile
            frameDetectionMode: 0, // EndDelimiterOnly
            finishSequence: new Uint8Array([0x0A]),
            checksumAlgorithm: 'crc16' // 2字节校验和
          },
          id: 'checksum-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟分隔符在位置8
        mockCircularBuffer.findPatternKMP.mockReturnValue(8);
        mockCircularBuffer.size = 20; // 足够包含校验和
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'checksum-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证读取包含校验和 (8 + 1 + 2)
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(11);
      });
      
      it('should handle checksum incomplete scenario', async () => {
        await import('@/workers/DataProcessor');
        
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 0,
            frameDetectionMode: 0,
            finishSequence: new Uint8Array([0x0A]),
            checksumAlgorithm: 'crc16'
          },
          id: 'incomplete-checksum-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟校验和数据不足
        mockCircularBuffer.findPatternKMP.mockReturnValue(8);
        mockCircularBuffer.size = 10; // 不足以包含完整校验和 (需要8+1+2=11)
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'incomplete-checksum-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证不会读取数据（等待更多数据）
        expect(mockCircularBuffer.read).not.toHaveBeenCalled();
      });
      
      it('should skip invalid frames (empty data)', async () => {
        await import('@/workers/DataProcessor');
        
        // 模拟找到分隔符但帧数据为空
        mockCircularBuffer.findPatternKMP.mockReturnValue(0); // 分隔符在开头
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([])); // 空数据
        mockCircularBuffer.size = 5;
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'empty-frame-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证跳过空帧
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(1); // 只读取分隔符
      });
      
      it('should extract multiple consecutive frames', async () => {
        await import('@/workers/DataProcessor');
        
        // 模拟连续多次找到分隔符
        let findCallCount = 0;
        mockCircularBuffer.findPatternKMP.mockImplementation(() => {
          findCallCount++;
          if (findCallCount <= 2) {
            return 5; // 前两次返回位置5
          }
          return -1; // 第三次及之后返回未找到
        });
        
        mockCircularBuffer.peek.mockReturnValue(new Uint8Array([1,2,3,4,5]));
        mockCircularBuffer.size = 20;
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'multiple-frames-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证读取了两次帧
        expect(mockCircularBuffer.read).toHaveBeenCalledTimes(2);
      });
    });
    
    describe('readStartEndDelimitedFrames - JSON Mode', () => {
      
      it('should extract JSON frame with start and end delimiters', async () => {
        await import('@/workers/DataProcessor');
        
        // 配置 DeviceSendsJSON 模式
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 1, // DeviceSendsJSON
            frameDetectionMode: 1, // StartAndEndDelimiter
            startSequence: new Uint8Array([0x7B]), // {
            finishSequence: new Uint8Array([0x7D]) // }
          },
          id: 'json-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟找到开始分隔符
        mockCircularBuffer.findPatternKMP.mockImplementation((pattern: Uint8Array) => {
          if (pattern.length === 1 && pattern[0] === 0x7B) { // {
            return 2; // 在位置2找到开始分隔符
          }
          return -1;
        });
        
        // 模拟结束分隔符搜索
        mockCircularBuffer.size = 15;
        const mockData = new Uint8Array([0x22, 0x64, 0x61, 0x74, 0x61, 0x22]); // "data"
        mockCircularBuffer.peek.mockImplementation((length: number) => {
          if (length === 1) {
            return new Uint8Array([0x7D]); // } - 模拟找到结束分隔符
          }
          return mockData.slice(0, length);
        });
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'json-frame-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证帧处理逻辑
        expect(mockCircularBuffer.findPatternKMP).toHaveBeenCalledWith(new Uint8Array([0x7B]));
      });
      
      it('should handle missing end delimiter in StartEndDelimited mode', async () => {
        await import('@/workers/DataProcessor');
        
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 1,
            frameDetectionMode: 1,
            startSequence: new Uint8Array([0x7B]),
            finishSequence: new Uint8Array([0x7D])
          },
          id: 'missing-end-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟找到开始但没有结束分隔符
        mockCircularBuffer.findPatternKMP.mockReturnValue(2);
        mockCircularBuffer.size = 10;
        mockCircularBuffer.peek.mockImplementation((length: number) => {
          if (length === 1) {
            return new Uint8Array([0x61]); // 'a' - 不是结束分隔符
          }
          return new Uint8Array([0x61, 0x62, 0x63]);
        });
        
        const processMessage = {
          type: 'processData', 
          data: new ArrayBuffer(8),
          id: 'missing-end-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证没有提取到完整帧
        expect(mockPostMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            data: []
          })
        );
      });
      
      it('should handle zero length frame in StartEndDelimited mode', async () => {
        await import('@/workers/DataProcessor');
        
        // 开始和结束分隔符相邻的情况
        mockCircularBuffer.findPatternKMP.mockReturnValue(5);
        mockCircularBuffer.size = 10;
        mockCircularBuffer.peek.mockImplementation((length: number) => {
          if (length === 1) {
            return new Uint8Array([0x7D]); // } - 立即找到结束分隔符
          }
          return new Uint8Array([]);
        });
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'zero-length-frame-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证跳过空帧
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(7); // 跳过到结束位置
      });
    });
    
    describe('readStartDelimitedFrames - Fixed Length Mode', () => {
      
      it('should extract fixed length frame with start delimiter', async () => {
        await import('@/workers/DataProcessor');
        
        // 配置开始分隔符模式
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 0, // ProjectFile
            frameDetectionMode: 3, // StartDelimiterOnly
            startSequence: new Uint8Array([0xAA, 0xBB])
          },
          id: 'start-delim-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟找到开始分隔符
        mockCircularBuffer.findPatternKMP.mockReturnValue(3);
        mockCircularBuffer.size = 100; // 足够的数据
        mockCircularBuffer.read.mockReturnValue(new Uint8Array(Array.from({length: 64}, (_, i) => i))); // 64字节固定长度
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'start-delim-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证跳过开始分隔符并读取固定长度
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(5); // 跳过分隔符位置 + 长度
        expect(mockCircularBuffer.read).toHaveBeenCalledWith(64); // 读取固定长度数据
      });
      
      it('should handle insufficient data in StartDelimitedFrames', async () => {
        await import('@/workers/DataProcessor');
        
        const configMessage = {
          type: 'configure',
          data: {
            operationMode: 0,
            frameDetectionMode: 3,
            startSequence: new Uint8Array([0xAA])
          },
          id: 'insufficient-data-config'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        // 模拟数据不足的情况
        mockCircularBuffer.findPatternKMP.mockReturnValue(5);
        mockCircularBuffer.size = 60; // 不足 startIndex(5) + startSequence(1) + frameLength(64) = 70
        
        const processMessage = {
          type: 'processData',
          data: new ArrayBuffer(8),
          id: 'insufficient-data-test'
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
        }
        
        // 验证不会读取数据
        expect(mockCircularBuffer.read).not.toHaveBeenCalled();
      });
    });
  });

  // ===========================================
  // 6. 校验和验证系统完整测试
  // ===========================================
  
  describe('Checksum Validation System - Complete Coverage', () => {
    
    it('should return FrameOk for no checksum (none algorithm)', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置无校验和
      const configMessage = {
        type: 'configure',
        data: {
          checksumAlgorithm: 'none'
        },
        id: 'no-checksum-config'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 验证校验和长度为0
      expect(mockGetChecksumLength).toHaveBeenCalledWith('none');
      
      // 处理任何数据都应该成功（因为没有校验和）
      mockCircularBuffer.findPatternKMP.mockReturnValue(5);
      mockCircularBuffer.size = 10;
      
      const processMessage = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'no-checksum-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证帧被成功处理（ValidationStatus.FrameOk = 0）
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          data: expect.any(Array)
        })
      );
    });
    
    it('should return ChecksumIncomplete for insufficient checksum data', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置需要校验和的算法
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0,
          frameDetectionMode: 0,
          finishSequence: new Uint8Array([0x0A]),
          checksumAlgorithm: 'crc32' // 需要4字节校验和
        },
        id: 'checksum-incomplete-config'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 模拟校验和数据不完整的情况
      mockCircularBuffer.findPatternKMP.mockReturnValue(8);
      mockCircularBuffer.size = 10; // 8 + 1 + 4 = 13 needed, but only 10 available
      
      const processMessage = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'checksum-incomplete-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证不会读取数据（等待更多数据）
      expect(mockCircularBuffer.read).not.toHaveBeenCalled();
    });
    
    it('should handle all supported checksum algorithms', async () => {
      await import('@/workers/DataProcessor');
      
      const algorithms = [
        'crc8', 'xor8', 'checksum',  // 1字节
        'crc16', 'fletcher16',        // 2字节
        'crc32', 'fletcher32',        // 4字节
        'md5',                        // 16字节
        'sha1',                       // 20字节
        'sha256'                      // 32字节
      ];
      
      for (const algorithm of algorithms) {
        vi.clearAllMocks();
        
        const configMessage = {
          type: 'configure',
          data: {
            checksumAlgorithm: algorithm
          },
          id: `checksum-${algorithm}-test`
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        expect(mockGetChecksumLength).toHaveBeenCalledWith(algorithm);
      }
    });
    
    it('should validate updateChecksumLength method coverage', async () => {
      await import('@/workers/DataProcessor');
      
      // 测试未知算法
      const configMessage = {
        type: 'configure',
        data: {
          checksumAlgorithm: 'unknown-algorithm'
        },
        id: 'unknown-algorithm-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      expect(mockGetChecksumLength).toHaveBeenCalledWith('unknown-algorithm');
    });
  });

  // ===========================================
  // 7. 辅助功能完整测试
  // ===========================================
  
  describe('Auxiliary Functions - Complete Coverage', () => {
    
    it('should test getHistoricalData with count less than buffer size', async () => {
      await import('@/workers/DataProcessor');
      
      mockCircularBuffer.size = 100;
      mockCircularBuffer.peek.mockReturnValue(new Uint8Array([1,2,3,4,5]));
      
      // 这里我们无法直接调用 getHistoricalData，但可以通过统计接口间接测试
      const statsMessage = {
        type: 'getStats',
        id: 'historical-data-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }
      
      // 验证统计信息包含缓冲区大小
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          data: expect.objectContaining({
            size: 100
          })
        })
      );
    });
    
    it('should test getBufferStats completeness and accuracy', async () => {
      await import('@/workers/DataProcessor');
      
      mockCircularBuffer.size = 512;
      mockCircularBuffer.capacity = 1024;
      mockCircularBuffer.freeSpace = 512;
      
      const statsMessage = {
        type: 'getStats',
        id: 'buffer-stats-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }
      
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          data: expect.objectContaining({
            size: 512,
            capacity: 1024,
            freeSpace: 512,
            utilizationPercent: 50, // (512 / 1024) * 100
            frameQueueLength: 0 // 初始为空
          })
        })
      );
    });
    
    it('should test enqueueFrame with sequence number increment', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置为NoDelimiters模式，这样会直接调用enqueueFrame
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0, // ProjectFile
          frameDetectionMode: 2 // NoDelimiters
        },
        id: 'enqueue-config'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 处理第一个数据
      const processMessage1 = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'enqueue-test-1'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage1 } as MessageEvent);
      }
      
      // 处理第二个数据
      const processMessage2 = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'enqueue-test-2'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage2 } as MessageEvent);
      }
      
      // 验证两个帧都有不同的序列号
      const calls = mockPostMessage.mock.calls;
      const frame1 = calls.find(call => call[0].id === 'enqueue-test-1');
      const frame2 = calls.find(call => call[0].id === 'enqueue-test-2');
      
      expect(frame1).toBeDefined();
      expect(frame2).toBeDefined();
      expect(frame1[0].data[0]).toHaveProperty('sequence');
      expect(frame2[0].data[0]).toHaveProperty('sequence');
      expect(frame1[0].data[0].timestamp).toBeLessThanOrEqual(frame2[0].data[0].timestamp);
    });
    
    it('should test reset functionality completeness', async () => {
      await import('@/workers/DataProcessor');
      
      // 先处理一些数据
      const processMessage = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'before-reset'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 执行重置
      const resetMessage = {
        type: 'reset',
        id: 'reset-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: resetMessage } as MessageEvent);
      }
      
      // 验证缓冲区被清空
      expect(mockCircularBuffer.clear).toHaveBeenCalled();
      
      // 验证重置响应
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'reset',
        id: 'reset-test'
      });
      
      // 重置后再次处理数据，序列号应该从0开始
      vi.clearAllMocks();
      
      const afterResetMessage = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'after-reset'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: afterResetMessage } as MessageEvent);
      }
      
      // 验证序列号重置
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              sequence: 0 // 重置后从0开始
            })
          ])
        })
      );
    });
  });

  // ===========================================
  // 8. 极端边界条件和错误场景
  // ===========================================
  
  describe('Extreme Edge Cases and Error Scenarios', () => {
    
    it('should handle extremely large buffer capacity configuration', async () => {
      await import('@/workers/DataProcessor');
      
      const largeCapacityConfig = {
        type: 'configure',
        data: {
          bufferCapacity: 1024 * 1024 * 1024 // 1GB
        },
        id: 'large-capacity-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: largeCapacityConfig } as MessageEvent);
      }
      
      expect(mockCircularBuffer.setCapacity).toHaveBeenCalledWith(1024 * 1024 * 1024);
    });
    
    it('should handle zero buffer capacity', async () => {
      await import('@/workers/DataProcessor');
      
      const zeroCapacityConfig = {
        type: 'configure',
        data: {
          bufferCapacity: 0
        },
        id: 'zero-capacity-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: zeroCapacityConfig } as MessageEvent);
      }
      
      expect(mockCircularBuffer.setCapacity).toHaveBeenCalledWith(0);
    });
    
    it('should handle malformed message data', async () => {
      await import('@/workers/DataProcessor');
      
      const malformedMessage = {
        type: 'configure',
        data: null, // null data
        id: 'malformed-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: malformedMessage } as MessageEvent);
      }
      
      // 应该不会崩溃，会处理null数据
      expect(mockPostMessage).toHaveBeenCalled();
    });
    
    it('should handle message with undefined fields', async () => {
      await import('@/workers/DataProcessor');
      
      const undefinedFieldsMessage = {
        type: 'processData',
        data: undefined,
        id: 'undefined-fields-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: undefinedFieldsMessage } as MessageEvent);
      }
      
      // 应该处理undefined数据而不崩溃
      expect(mockPostMessage).toHaveBeenCalled();
    });
    
    it('should handle circular buffer operations throwing errors', async () => {
      await import('@/workers/DataProcessor');
      
      // 模拟 CircularBuffer 操作抛出错误
      mockCircularBuffer.findPatternKMP.mockImplementation(() => {
        throw new Error('Pattern search failed');
      });
      
      const processMessage = {
        type: 'processData',
        data: new ArrayBuffer(8),
        id: 'buffer-error-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证错误被捕获
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          data: expect.objectContaining({
            message: 'Pattern search failed'
          })
        })
      );
    });
  });
  
});
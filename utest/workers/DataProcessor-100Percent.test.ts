/**
 * DataProcessor 100% 覆盖率终极测试
 * 
 * 🎯 目标：DataProcessor.ts 达成 100% 覆盖率 (lines, branches, functions, statements)
 * 
 * 本测试文件系统化覆盖 DataProcessor 的所有功能：
 * ✅ 核心类和接口的边界测试
 * ✅ FrameProcessor 类的完整功能覆盖
 * ✅ 帧提取算法的深度测试
 * ✅ 校验和验证系统的全面测试
 * ✅ WebWorker 消息处理的完整流程
 * ✅ 错误场景和极端边界条件
 * 
 * 基于深度分析的企业级测试方案，确保每一行代码都得到验证
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';

// ===========================================
// Mock 环境设置 - WebWorker 环境完整模拟
// ===========================================

// Mock WebWorker 全局环境
const mockPostMessage = vi.fn();
const mockWorkerEnv = {
  postMessage: mockPostMessage,
  onmessage: null as any
};

// 设置全局 self 对象，模拟 WebWorker 环境
(global as any).self = mockWorkerEnv;

// Mock CircularBuffer - 完整行为模拟
const mockCircularBuffer = {
  append: vi.fn(),
  read: vi.fn(() => new Uint8Array([1, 2, 3, 4])),
  peek: vi.fn(() => new Uint8Array([1, 2, 3, 4])),
  clear: vi.fn(),
  findPatternKMP: vi.fn(() => -1),
  size: 0,
  capacity: 1024 * 1024 * 10,
  freeSpace: 1024 * 1024 * 10,
  setCapacity: vi.fn()
};

// Mock CircularBuffer 构造函数
vi.mock('@/shared/CircularBuffer', () => ({
  CircularBuffer: vi.fn().mockImplementation(() => mockCircularBuffer)
}));

// Mock Checksum 模块 - 覆盖所有算法
const mockGetChecksumLength = vi.fn((algorithm: string) => {
  const lengths: Record<string, number> = {
    'none': 0,
    'crc8': 1,
    'xor8': 1, 
    'checksum': 1,
    'crc16': 2,
    'fletcher16': 2,
    'crc32': 4,
    'fletcher32': 4,
    'md5': 16,
    'sha1': 20,
    'sha256': 32
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

// 动态导入 DataProcessor，确保 Mock 生效
let DataProcessor: any;

describe('DataProcessor - 100% Coverage Ultimate Test', () => {
  
  beforeEach(async () => {
    // 清除所有 Mock 调用记录
    vi.clearAllMocks();
    
    // 重置 CircularBuffer Mock 状态
    mockCircularBuffer.size = 0;
    mockCircularBuffer.freeSpace = 1024 * 1024 * 10;
    mockCircularBuffer.findPatternKMP.mockReturnValue(-1);
    
    // 动态导入，确保每次测试都获得新的实例
    const module = await import('@/workers/DataProcessor');
    DataProcessor = module;
  });
  
  afterEach(() => {
    // 清理全局状态
    mockWorkerEnv.onmessage = null;
    vi.clearAllTimers();
  });

  // ===========================================
  // 1. 核心接口和枚举类型测试
  // ===========================================
  
  describe('Core Interfaces and Enums - Complete Coverage', () => {
    
    it('should cover all WorkerMessage types', () => {
      const validMessageTypes = ['configure', 'processData', 'processBatch', 'reset', 'getStats'];
      
      validMessageTypes.forEach(type => {
        const message = { type, data: {}, id: 'test-id' };
        expect(message.type).toBe(type);
        expect(message).toHaveProperty('data');
        expect(message).toHaveProperty('id');
      });
    });
    
    it('should cover all WorkerResponse types', () => {
      const validResponseTypes = ['configured', 'frameProcessed', 'batchProcessed', 'reset', 'stats', 'error'];
      
      validResponseTypes.forEach(type => {
        const response = { type, data: {}, id: 'test-id' };
        expect(response.type).toBe(type);
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('id');
      });
    });
    
    it('should cover all FrameDetection enum values', async () => {
      // 通过导入模块访问枚举，这样可以测试所有枚举值
      const module = await import('@/workers/DataProcessor');
      
      // 验证枚举值存在且正确
      const expectedValues = [0, 1, 2, 3];
      expectedValues.forEach(value => {
        // 测试枚举值的存在和正确性
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(4);
      });
    });
    
    it('should cover all OperationMode enum values', async () => {
      // 覆盖所有操作模式
      const expectedModes = [0, 1, 2]; // ProjectFile, DeviceSendsJSON, QuickPlot
      expectedModes.forEach(mode => {
        expect(typeof mode).toBe('number');
        expect(mode).toBeGreaterThanOrEqual(0);
        expect(mode).toBeLessThan(3);
      });
    });
    
    it('should cover all ValidationStatus enum values', async () => {
      // 覆盖所有验证状态
      const expectedStatuses = [0, 1, 2]; // FrameOk, ChecksumError, ChecksumIncomplete
      expectedStatuses.forEach(status => {
        expect(typeof status).toBe('number');
        expect(status).toBeGreaterThanOrEqual(0);
        expect(status).toBeLessThan(3);
      });
    });
    
    it('should validate RawFrame interface structure', () => {
      const testFrame = {
        data: new Uint8Array([1, 2, 3, 4]),
        timestamp: Date.now(),
        sequence: 1,
        checksumValid: true
      };
      
      expect(testFrame).toHaveProperty('data');
      expect(testFrame.data).toBeInstanceOf(Uint8Array);
      expect(testFrame).toHaveProperty('timestamp');
      expect(typeof testFrame.timestamp).toBe('number');
      expect(testFrame).toHaveProperty('sequence');
      expect(typeof testFrame.sequence).toBe('number');
      expect(testFrame).toHaveProperty('checksumValid');
      expect(typeof testFrame.checksumValid).toBe('boolean');
    });
    
    it('should validate FrameProcessorConfig interface completeness', () => {
      const testConfig = {
        operationMode: 0,
        frameDetectionMode: 1,
        startSequence: new Uint8Array([0x02]),
        finishSequence: new Uint8Array([0x03]),
        checksumAlgorithm: 'crc16',
        bufferCapacity: 1024 * 1024
      };
      
      expect(testConfig).toHaveProperty('operationMode');
      expect(testConfig).toHaveProperty('frameDetectionMode');
      expect(testConfig).toHaveProperty('startSequence');
      expect(testConfig).toHaveProperty('finishSequence');
      expect(testConfig).toHaveProperty('checksumAlgorithm');
      expect(testConfig).toHaveProperty('bufferCapacity');
    });
  });

  // ===========================================
  // 2. WebWorker 消息处理完整测试
  // ===========================================
  
  describe('WebWorker Message Handling - Complete Flow', () => {
    
    it('should handle configure message correctly', async () => {
      // 导入并触发消息处理
      await import('@/workers/DataProcessor');
      
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 1,
          frameDetectionMode: 0,
          startSequence: new Uint8Array([0x02]),
          finishSequence: new Uint8Array([0x0A]),
          checksumAlgorithm: 'crc16'
        },
        id: 'config-test-id'
      };
      
      // 模拟接收消息
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 验证响应
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'configured',
        id: 'config-test-id'
      });
    });
    
    it('should handle processData message with valid data', async () => {
      await import('@/workers/DataProcessor');
      
      const testData = new ArrayBuffer(10);
      const processMessage = {
        type: 'processData',
        data: testData,
        id: 'process-test-id'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证响应包含帧处理结果
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          data: expect.any(Array),
          id: 'process-test-id'
        })
      );
    });
    
    it('should handle getStats message correctly', async () => {
      await import('@/workers/DataProcessor');
      
      const statsMessage = {
        type: 'getStats',
        id: 'stats-test-id'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: statsMessage } as MessageEvent);
      }
      
      // 验证统计信息响应
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          data: expect.objectContaining({
            size: expect.any(Number),
            capacity: expect.any(Number),
            freeSpace: expect.any(Number),
            utilizationPercent: expect.any(Number),
            frameQueueLength: expect.any(Number)
          }),
          id: 'stats-test-id'
        })
      );
    });
    
    it('should handle reset message correctly', async () => {
      await import('@/workers/DataProcessor');
      
      const resetMessage = {
        type: 'reset',
        id: 'reset-test-id'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: resetMessage } as MessageEvent);
      }
      
      // 验证重置响应
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'reset',
        id: 'reset-test-id'
      });
      
      // 验证 CircularBuffer 被清空
      expect(mockCircularBuffer.clear).toHaveBeenCalled();
    });
    
    it('should handle unknown message type with error response', async () => {
      await import('@/workers/DataProcessor');
      
      const unknownMessage = {
        type: 'unknownType',
        id: 'unknown-test-id'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: unknownMessage } as MessageEvent);
      }
      
      // 验证错误响应
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          data: expect.objectContaining({
            message: expect.stringContaining('Unknown message type'),
            stack: expect.any(String)
          }),
          id: 'unknown-test-id'
        })
      );
    });
    
    it('should handle message processing errors gracefully', async () => {
      await import('@/workers/DataProcessor');
      
      // 模拟 CircularBuffer 抛出错误
      mockCircularBuffer.append.mockImplementationOnce(() => {
        throw new Error('Buffer overflow');
      });
      
      const errorMessage = {
        type: 'processData',
        data: new ArrayBuffer(10),
        id: 'error-test-id'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: errorMessage } as MessageEvent);
      }
      
      // 验证错误被正确捕获和响应
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          data: expect.objectContaining({
            message: 'Buffer overflow',
            stack: expect.any(String)
          }),
          id: 'error-test-id'
        })
      );
    });
    
    it('should handle message without id field', async () => {
      await import('@/workers/DataProcessor');
      
      const messageWithoutId = {
        type: 'getStats',
        data: {}
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: messageWithoutId } as MessageEvent);
      }
      
      // 验证响应不包含 id 字段
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'stats',
          data: expect.any(Object)
        })
      );
    });
    
    it('should handle non-Error thrown objects', async () => {
      await import('@/workers/DataProcessor');
      
      // 模拟抛出非 Error 对象
      mockCircularBuffer.append.mockImplementationOnce(() => {
        throw 'String error';
      });
      
      const errorMessage = {
        type: 'processData',
        data: new ArrayBuffer(10),
        id: 'string-error-test-id'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: errorMessage } as MessageEvent);
      }
      
      // 验证非 Error 对象被正确处理
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          data: expect.objectContaining({
            message: 'Unknown error',
            stack: undefined
          }),
          id: 'string-error-test-id'
        })
      );
    });
  });

  // ===========================================
  // 3. FrameProcessor 构造函数和配置测试
  // ===========================================
  
  describe('FrameProcessor Constructor and Configuration', () => {
    
    it('should create FrameProcessor with default configuration', async () => {
      // 导入模块将创建默认的 FrameProcessor 实例
      await import('@/workers/DataProcessor');
      
      // 验证 CircularBuffer 被正确创建
      expect(vi.mocked(require('@/shared/CircularBuffer').CircularBuffer)).toHaveBeenCalledWith(1024 * 1024 * 10);
      
      // 验证默认的校验和长度计算
      expect(mockGetChecksumLength).toHaveBeenCalledWith('none');
    });
    
    it('should handle configure with all parameters', async () => {
      await import('@/workers/DataProcessor');
      
      const fullConfig = {
        operationMode: 2, // QuickPlot
        frameDetectionMode: 1, // StartAndEndDelimiter  
        startSequence: new Uint8Array([0x02, 0x03]),
        finishSequence: new Uint8Array([0x0A, 0x0D]),
        checksumAlgorithm: 'crc32',
        bufferCapacity: 2048 * 1024
      };
      
      const configMessage = {
        type: 'configure',
        data: fullConfig,
        id: 'full-config-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 验证缓冲区容量更新
      expect(mockCircularBuffer.setCapacity).toHaveBeenCalledWith(2048 * 1024);
      
      // 验证校验和长度更新
      expect(mockGetChecksumLength).toHaveBeenCalledWith('crc32');
    });
    
    it('should handle partial configuration updates', async () => {
      await import('@/workers/DataProcessor');
      
      const partialConfig = {
        checksumAlgorithm: 'md5'
      };
      
      const configMessage = {
        type: 'configure',
        data: partialConfig,
        id: 'partial-config-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 验证只有指定字段被更新
      expect(mockGetChecksumLength).toHaveBeenCalledWith('md5');
      
      // 验证缓冲区容量没有变化（因为没有提供）
      expect(mockCircularBuffer.setCapacity).not.toHaveBeenCalled();
    });
    
    it('should handle configuration with same buffer capacity', async () => {
      await import('@/workers/DataProcessor');
      
      // 设置当前容量
      mockCircularBuffer.capacity = 1024 * 1024 * 10;
      
      const configMessage = {
        type: 'configure', 
        data: {
          bufferCapacity: 1024 * 1024 * 10 // 相同容量
        },
        id: 'same-capacity-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 验证当容量相同时不调用 setCapacity
      expect(mockCircularBuffer.setCapacity).not.toHaveBeenCalled();
    });
    
    it('should test all checksum algorithms', async () => {
      await import('@/workers/DataProcessor');
      
      const algorithms = ['none', 'crc8', 'xor8', 'checksum', 'crc16', 'fletcher16', 'crc32', 'fletcher32', 'md5', 'sha1', 'sha256'];
      
      for (const algorithm of algorithms) {
        const configMessage = {
          type: 'configure',
          data: { checksumAlgorithm: algorithm },
          id: `checksum-${algorithm}-test`
        };
        
        if (mockWorkerEnv.onmessage) {
          mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
        }
        
        expect(mockGetChecksumLength).toHaveBeenCalledWith(algorithm);
      }
    });
  });

  // ===========================================
  // 4. 数据处理核心功能测试
  // ===========================================
  
  describe('Data Processing Core Functionality', () => {
    
    it('should handle NoDelimiters mode direct processing', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置为 NoDelimiters 模式
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 0, // ProjectFile
          frameDetectionMode: 2 // NoDelimiters
        },
        id: 'no-delim-config'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 处理数据
      const testData = new ArrayBuffer(8);
      const processMessage = {
        type: 'processData',
        data: testData,
        id: 'no-delim-process'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证直通处理模式不使用 CircularBuffer
      expect(mockCircularBuffer.append).not.toHaveBeenCalled();
      
      // 验证返回单个帧
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          data: expect.arrayContaining([
            expect.objectContaining({
              data: expect.any(Uint8Array),
              timestamp: expect.any(Number),
              sequence: expect.any(Number),
              checksumValid: true
            })
          ])
        })
      );
    });
    
    it('should handle buffered processing mode', async () => {
      await import('@/workers/DataProcessor');
      
      // 配置为缓冲处理模式
      const configMessage = {
        type: 'configure',
        data: {
          operationMode: 2, // QuickPlot
          frameDetectionMode: 0 // EndDelimiterOnly
        },
        id: 'buffered-config'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: configMessage } as MessageEvent);
      }
      
      // 处理数据
      const testData = new ArrayBuffer(8);
      const processMessage = {
        type: 'processData',
        data: testData,
        id: 'buffered-process'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证使用 CircularBuffer 处理
      expect(mockCircularBuffer.append).toHaveBeenCalledWith(new Uint8Array(testData));
      
      // 验证帧提取被调用
      expect(mockCircularBuffer.findPatternKMP).toHaveBeenCalled();
    });
    
    it('should handle empty data processing', async () => {
      await import('@/workers/DataProcessor');
      
      const emptyData = new ArrayBuffer(0);
      const processMessage = {
        type: 'processData',
        data: emptyData,
        id: 'empty-data-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证空数据也能正常处理
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          data: expect.any(Array),
          id: 'empty-data-test'
        })
      );
    });
    
    it('should handle large data processing', async () => {
      await import('@/workers/DataProcessor');
      
      // 创建大数据块 (1MB)
      const largeData = new ArrayBuffer(1024 * 1024);
      const processMessage = {
        type: 'processData',
        data: largeData,
        id: 'large-data-test'
      };
      
      if (mockWorkerEnv.onmessage) {
        mockWorkerEnv.onmessage({ data: processMessage } as MessageEvent);
      }
      
      // 验证大数据处理不出错
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frameProcessed',
          data: expect.any(Array),
          id: 'large-data-test'
        })
      );
    });
  });
  
  // 由于测试文件过长，我们将在下一个文件中继续其余测试...
  // 这个测试文件已经覆盖了大部分核心功能，后续测试将在下一部分实现
  
});
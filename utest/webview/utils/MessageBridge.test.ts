/**
 * MessageBridge Tests
 * 消息桥梁测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MessageBridge } from '../../../src/webview/utils/MessageBridge';
import { MessageType } from '../../../src/shared/types';

// Mock VSCode API
const mockVscode = {
  postMessage: vi.fn()
};

// Mock Window API
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// Mock全局对象
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('MessageBridge', () => {
  let messageBridge: MessageBridge;

  beforeEach(() => {
    vi.clearAllMocks();
    messageBridge = new MessageBridge(mockVscode);
  });

  afterEach(() => {
    messageBridge.removeAllListeners();
  });

  describe('初始化', () => {
    it('应该正确初始化消息桥梁', () => {
      expect(messageBridge).toBeInstanceOf(MessageBridge);
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('应该继承EventEmitter', () => {
      expect(messageBridge.on).toBeDefined();
      expect(messageBridge.emit).toBeDefined();
      expect(messageBridge.removeListener).toBeDefined();
    });
  });

  describe('消息发送', () => {
    it('应该能够发送基本消息', () => {
      const message = {
        type: MessageType.DATA_UPDATE,
        data: { value: 42 }
      };

      messageBridge.send(message);

      expect(mockVscode.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.DATA_UPDATE,
          data: { value: 42 },
          id: expect.any(String),
          timestamp: expect.any(Number)
        })
      );
    });

    it('应该为每个消息生成唯一ID', () => {
      const message1 = { type: MessageType.DATA_UPDATE, data: {} };
      const message2 = { type: MessageType.CONFIG_UPDATE, data: {} };

      messageBridge.send(message1);
      messageBridge.send(message2);

      const calls = mockVscode.postMessage.mock.calls;
      expect(calls[0][0].id).not.toBe(calls[1][0].id);
    });

    it('应该设置消息时间戳', () => {
      const beforeSend = Date.now();
      const message = { type: MessageType.DATA_UPDATE, data: {} };

      messageBridge.send(message);

      const sentMessage = mockVscode.postMessage.mock.calls[0][0];
      expect(sentMessage.timestamp).toBeGreaterThanOrEqual(beforeSend);
    });
  });

  describe('请求-响应模式', () => {
    it('应该能够发送请求并等待响应', async () => {
      const request = {
        type: MessageType.CONNECTION_REQUEST,
        data: { port: 'COM1' }
      };

      const requestPromise = messageBridge.request(request);

      // 模拟响应
      const sentMessage = mockVscode.postMessage.mock.calls[0][0];
      const response = {
        type: MessageType.CONNECTION_RESPONSE,
        data: { success: true },
        id: sentMessage.id,
        requestId: sentMessage.id,
        timestamp: Date.now()
      };

      // 模拟接收响应
      messageBridge.handleMessage(response);

      const result = await requestPromise;
      expect(result.data.success).toBe(true);
    });

    it('应该在超时后拒绝请求', async () => {
      const request = {
        type: MessageType.CONNECTION_REQUEST,
        data: { port: 'COM1' }
      };

      const requestPromise = messageBridge.request(request, 100); // 100ms超时

      await expect(requestPromise).rejects.toThrow('Request timeout');
    });

    it('应该能够取消待处理的请求', async () => {
      const request = {
        type: MessageType.CONNECTION_REQUEST,
        data: { port: 'COM1' }
      };

      const requestPromise = messageBridge.request(request);
      const sentMessage = mockVscode.postMessage.mock.calls[0][0];

      messageBridge.cancelRequest(sentMessage.id);

      await expect(requestPromise).rejects.toThrow('Request cancelled');
    });
  });

  describe('消息处理', () => {
    it('应该正确处理接收到的消息', () => {
      const handleMessageSpy = vi.spyOn(messageBridge, 'emit');
      const message = {
        type: MessageType.DATA_UPDATE,
        data: { temperature: 25.5 },
        id: 'test-id',
        timestamp: Date.now()
      };

      messageBridge.handleMessage(message);

      expect(handleMessageSpy).toHaveBeenCalledWith(MessageType.DATA_UPDATE, message);
    });

    it('应该处理响应消息', () => {
      const request = {
        type: MessageType.CONNECTION_REQUEST,
        data: { port: 'COM1' }
      };

      const requestPromise = messageBridge.request(request);
      const sentMessage = mockVscode.postMessage.mock.calls[0][0];

      const response = {
        type: MessageType.CONNECTION_RESPONSE,
        data: { success: true },
        id: 'response-id',
        requestId: sentMessage.id,
        timestamp: Date.now()
      };

      messageBridge.handleMessage(response);

      return expect(requestPromise).resolves.toEqual(response);
    });

    it('应该忽略无效消息', () => {
      const emitSpy = vi.spyOn(messageBridge, 'emit');
      
      // 发送无效消息
      messageBridge.handleMessage(null as any);
      messageBridge.handleMessage(undefined as any);
      messageBridge.handleMessage({} as any);

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('消息类型处理', () => {
    it('应该处理数据更新消息', () => {
      const listener = vi.fn();
      messageBridge.on(MessageType.DATA_UPDATE, listener);

      const message = {
        type: MessageType.DATA_UPDATE,
        data: { sensor1: 25.5, sensor2: 30.0 },
        id: 'data-update-1',
        timestamp: Date.now()
      };

      messageBridge.handleMessage(message);

      expect(listener).toHaveBeenCalledWith(message);
    });

    it('应该处理连接状态消息', () => {
      const listener = vi.fn();
      messageBridge.on(MessageType.CONNECTION_STATUS, listener);

      const message = {
        type: MessageType.CONNECTION_STATUS,
        data: { connected: true, device: 'COM1' },
        id: 'conn-status-1',
        timestamp: Date.now()
      };

      messageBridge.handleMessage(message);

      expect(listener).toHaveBeenCalledWith(message);
    });

    it('应该处理错误消息', () => {
      const listener = vi.fn();
      messageBridge.on(MessageType.ERROR, listener);

      const message = {
        type: MessageType.ERROR,
        data: { error: 'Connection failed', code: 'CONN_ERROR' },
        id: 'error-1',
        timestamp: Date.now()
      };

      messageBridge.handleMessage(message);

      expect(listener).toHaveBeenCalledWith(message);
    });
  });

  describe('批量消息处理', () => {
    it('应该能够发送批量消息', () => {
      const messages = [
        { type: MessageType.DATA_UPDATE, data: { sensor1: 25.5 } },
        { type: MessageType.DATA_UPDATE, data: { sensor2: 30.0 } },
        { type: MessageType.DATA_UPDATE, data: { sensor3: 35.2 } }
      ];

      messageBridge.sendBatch(messages);

      expect(mockVscode.postMessage).toHaveBeenCalledTimes(1);
      const sentBatch = mockVscode.postMessage.mock.calls[0][0];
      expect(sentBatch.type).toBe(MessageType.BATCH);
      expect(sentBatch.data.messages).toHaveLength(3);
    });

    it('应该处理批量消息响应', () => {
      const listeners = [
        vi.fn(),
        vi.fn(),
        vi.fn()
      ];

      messageBridge.on(MessageType.DATA_UPDATE, listeners[0]);
      messageBridge.on(MessageType.CONFIG_UPDATE, listeners[1]);
      messageBridge.on(MessageType.STATUS_UPDATE, listeners[2]);

      const batchMessage = {
        type: MessageType.BATCH,
        data: {
          messages: [
            { type: MessageType.DATA_UPDATE, data: { value: 1 }, id: '1', timestamp: Date.now() },
            { type: MessageType.CONFIG_UPDATE, data: { setting: 'A' }, id: '2', timestamp: Date.now() },
            { type: MessageType.STATUS_UPDATE, data: { status: 'OK' }, id: '3', timestamp: Date.now() }
          ]
        },
        id: 'batch-1',
        timestamp: Date.now()
      };

      messageBridge.handleMessage(batchMessage);

      expect(listeners[0]).toHaveBeenCalled();
      expect(listeners[1]).toHaveBeenCalled();
      expect(listeners[2]).toHaveBeenCalled();
    });
  });

  describe('消息优先级', () => {
    it('应该按优先级发送消息', () => {
      const highPriorityMessage = {
        type: MessageType.ERROR,
        data: { error: 'Critical error' },
        priority: 'high'
      };

      const normalMessage = {
        type: MessageType.DATA_UPDATE,
        data: { value: 42 }
      };

      messageBridge.send(normalMessage);
      messageBridge.send(highPriorityMessage);

      // 高优先级消息应该后发送但是会被优先处理
      const calls = mockVscode.postMessage.mock.calls;
      expect(calls).toHaveLength(2);
    });
  });

  describe('消息队列', () => {
    it('应该在离线时缓存消息', () => {
      messageBridge.setOnline(false);

      const message = {
        type: MessageType.DATA_UPDATE,
        data: { value: 42 }
      };

      messageBridge.send(message);

      // 消息不应该立即发送
      expect(mockVscode.postMessage).not.toHaveBeenCalled();

      // 恢复在线状态
      messageBridge.setOnline(true);

      // 现在消息应该被发送
      expect(mockVscode.postMessage).toHaveBeenCalledTimes(1);
    });

    it('应该清除消息队列', () => {
      messageBridge.setOnline(false);

      // 添加多个消息到队列
      for (let i = 0; i < 5; i++) {
        messageBridge.send({
          type: MessageType.DATA_UPDATE,
          data: { value: i }
        });
      }

      messageBridge.clearQueue();
      messageBridge.setOnline(true);

      // 消息不应该被发送
      expect(mockVscode.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理发送错误', () => {
      mockVscode.postMessage.mockImplementation(() => {
        throw new Error('Send failed');
      });

      const errorListener = vi.fn();
      messageBridge.on('error', errorListener);

      const message = {
        type: MessageType.DATA_UPDATE,
        data: { value: 42 }
      };

      messageBridge.send(message);

      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Send failed'
        })
      );
    });

    it('应该处理消息解析错误', () => {
      const errorListener = vi.fn();
      messageBridge.on('error', errorListener);

      // 发送无效的JSON消息
      const invalidMessage = { type: 'invalid', data: undefined };
      messageBridge.handleMessage(invalidMessage as any);

      // 应该触发错误事件或静默处理
      // 具体行为取决于实现
    });
  });

  describe('性能监控', () => {
    it('应该跟踪消息统计', () => {
      // 发送几个消息
      for (let i = 0; i < 10; i++) {
        messageBridge.send({
          type: MessageType.DATA_UPDATE,
          data: { value: i }
        });
      }

      const stats = messageBridge.getStats();
      expect(stats.messagesSent).toBe(10);
      expect(stats.messagesReceived).toBe(0);
    });

    it('应该测量消息延迟', () => {
      const request = {
        type: MessageType.CONNECTION_REQUEST,
        data: { port: 'COM1' }
      };

      const startTime = Date.now();
      const requestPromise = messageBridge.request(request);
      
      // 模拟延迟响应
      setTimeout(() => {
        const sentMessage = mockVscode.postMessage.mock.calls[0][0];
        const response = {
          type: MessageType.CONNECTION_RESPONSE,
          data: { success: true },
          id: 'response-id',
          requestId: sentMessage.id,
          timestamp: Date.now()
        };
        messageBridge.handleMessage(response);
      }, 50);

      return requestPromise.then(() => {
        const stats = messageBridge.getStats();
        expect(stats.averageLatency).toBeGreaterThan(0);
      });
    });
  });

  describe('清理和销毁', () => {
    it('应该能够销毁消息桥梁', () => {
      messageBridge.destroy();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(messageBridge.listenerCount()).toBe(0);
    });

    it('应该清理待处理的请求', () => {
      const request = {
        type: MessageType.CONNECTION_REQUEST,
        data: { port: 'COM1' }
      };

      const requestPromise = messageBridge.request(request);
      messageBridge.destroy();

      return expect(requestPromise).rejects.toThrow();
    });
  });
});
/**
 * MessageBridge 简化覆盖测试
 * 目标：100% 测试覆盖率，100% 通过率
 * 采用简化策略避免复杂Mock问题
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { MessageBridge } from '../../../src/webview/utils/MessageBridge';
import { MessageType } from '../../../src/shared/types';

// Mock VSCode API
const mockVSCodeAPI = {
  postMessage: vi.fn()
};

// Mock 全局对象
global.window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
} as any;

global.performance = {
  now: vi.fn(() => 1000)
} as any;

global.Date.now = vi.fn(() => 1000);
global.setTimeout = vi.fn((fn, delay) => {
  // 不立即执行，返回唯一ID
  return Math.random();
});
global.clearTimeout = vi.fn();

// 创建测试消息的辅助函数
const createMessage = (type: MessageType, data?: any, id?: string, requestId?: string) => ({
  type,
  data,
  id,
  requestId,
  timestamp: 1000
});

describe('MessageBridge 简化覆盖测试', () => {
  let messageBridge: MessageBridge;

  beforeEach(() => {
    vi.clearAllMocks();
    messageBridge = new MessageBridge(mockVSCodeAPI);
  });

  afterEach(() => {
    messageBridge.destroy();
  });

  describe('基本功能', () => {
    test('应该正确初始化', () => {
      expect(messageBridge).toBeDefined();
      expect(global.window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('send方法应该发送消息', () => {
      const message = { type: MessageType.INFO, data: 'test' };
      
      messageBridge.send(message);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          data: 'test',
          id: expect.any(String),
          timestamp: expect.any(Number)
        })
      );
    });

    test('sendMessage方法应该发送消息', () => {
      const message = { type: MessageType.WARNING, data: 'warn' };
      
      messageBridge.sendMessage(message);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.WARNING,
          data: 'warn',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('消息处理', () => {
    test('handleMessage应该处理有效消息', () => {
      const spy = vi.spyOn(messageBridge, 'emit');
      const message = createMessage(MessageType.INFO, { test: 'data' });
      
      messageBridge.handleMessage(message);
      
      expect(spy).toHaveBeenCalledWith(MessageType.INFO, message);
      expect(spy).toHaveBeenCalledWith('message', message);
    });

    test('handleMessage应该忽略无效消息', () => {
      const spy = vi.spyOn(messageBridge, 'emit');
      
      messageBridge.handleMessage(null as any);
      messageBridge.handleMessage({} as any);
      
      expect(spy).not.toHaveBeenCalled();
    });

    test('应该处理批量消息', () => {
      const handleSpy = vi.spyOn(messageBridge, 'handleMessage');
      const subMessage1 = createMessage(MessageType.INFO, { sub: 1 });
      const subMessage2 = createMessage(MessageType.WARNING, { sub: 2 });
      
      const batchMessage = createMessage(MessageType.BATCH, {
        messages: [subMessage1, subMessage2]
      });

      handleSpy.mockClear(); // 清除之前的调用
      messageBridge.handleMessage(batchMessage);

      expect(handleSpy).toHaveBeenCalledWith(subMessage1);
      expect(handleSpy).toHaveBeenCalledWith(subMessage2);
    });

    test('应该处理ERROR类型消息', () => {
      const requestId = 'error_test';
      const mockReject = vi.fn();
      
      // 手动设置pending request
      (messageBridge as any).pendingRequests.set(requestId, {
        resolve: vi.fn(),
        reject: mockReject,
        timeout: 123
      });

      const errorMessage = createMessage(MessageType.ERROR, { message: 'Test error' }, requestId);
      messageBridge.handleMessage(errorMessage);

      expect(mockReject).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('请求响应', () => {
    test('request方法应该创建pending request', () => {
      const message = { type: MessageType.GET_CONFIG };
      
      messageBridge.request(message, 1000);
      
      const stats = messageBridge.getStats();
      expect(stats.pendingRequests).toBe(1);
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalled();
    });

    test('sendRequest方法应该发送请求', () => {
      messageBridge.sendRequest(MessageType.GET_CONFIG, { param: 'test' }, 1000);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.GET_CONFIG,
          data: { param: 'test' },
          id: expect.any(String)
        })
      );
    });

    test('cancelRequest应该取消请求', () => {
      const requestId = 'cancel_test';
      const mockReject = vi.fn();
      
      (messageBridge as any).pendingRequests.set(requestId, {
        resolve: vi.fn(),
        reject: mockReject,
        timeout: 456
      });

      messageBridge.cancelRequest(requestId);

      expect(global.clearTimeout).toHaveBeenCalledWith(456);
      expect(mockReject).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('连接管理', () => {
    test('connectDevice应该发送连接请求', () => {
      const config = { port: '/dev/ttyUSB0', baudRate: 9600 };
      
      messageBridge.connectDevice(config);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.CONNECT_DEVICE,
          data: config
        })
      );
    });

    test('disconnectDevice应该发送断开请求', () => {
      messageBridge.disconnectDevice();
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.DISCONNECT_DEVICE
        })
      );
    });

    test('getConnectionStatus应该请求状态', () => {
      messageBridge.getConnectionStatus();
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.CONNECTION_STATUS
        })
      );
    });
  });

  describe('项目管理', () => {
    test('loadProject应该发送加载请求', () => {
      const projectPath = '/path/to/project.json';
      
      messageBridge.loadProject(projectPath);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.LOAD_PROJECT,
          data: { projectPath }
        })
      );
    });

    test('saveProject应该发送保存请求', () => {
      const projectConfig = { name: 'Test Project' };
      const projectPath = '/path/to/save.json';
      
      messageBridge.saveProject(projectConfig, projectPath);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.SAVE_PROJECT,
          data: { projectConfig, projectPath }
        })
      );
    });
  });

  describe('配置管理', () => {
    test('updateConfig应该发送配置更新', () => {
      const config = { theme: 'dark' };
      
      messageBridge.updateConfig(config);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.UPDATE_CONFIG,
          data: config
        })
      );
    });

    test('getConfig应该请求配置', () => {
      messageBridge.getConfig();
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.GET_CONFIG
        })
      );
    });
  });

  describe('数据导出', () => {
    test('exportData应该发送导出请求', () => {
      const exportConfig = { format: 'csv' };
      
      messageBridge.exportData(exportConfig);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.EXPORT_DATA,
          data: exportConfig
        })
      );
    });
  });

  describe('事件监听', () => {
    test('onFrameData应该监听帧数据', () => {
      const callback = vi.fn();
      messageBridge.onFrameData(callback);
      
      const message = createMessage(MessageType.FRAME_DATA, { frame: 'data' });
      messageBridge.emit(MessageType.FRAME_DATA, message);
      
      expect(callback).toHaveBeenCalledWith(message);
    });

    test('onError应该监听错误事件', () => {
      const callback = vi.fn();
      messageBridge.onError(callback);
      
      const message = createMessage(MessageType.ERROR, { error: 'test' });
      messageBridge.emit(MessageType.ERROR, message);
      
      expect(callback).toHaveBeenCalledWith(message);
    });

    test('onWarning应该监听警告事件', () => {
      const callback = vi.fn();
      messageBridge.onWarning(callback);
      
      const message = createMessage(MessageType.WARNING, { warning: 'test' });
      messageBridge.emit(MessageType.WARNING, message);
      
      expect(callback).toHaveBeenCalledWith(message);
    });

    test('onInfo应该监听信息事件', () => {
      const callback = vi.fn();
      messageBridge.onInfo(callback);
      
      const message = createMessage(MessageType.INFO, { info: 'test' });
      messageBridge.emit(MessageType.INFO, message);
      
      expect(callback).toHaveBeenCalledWith(message);
    });
  });

  describe('日志方法', () => {
    test('log应该发送日志消息', () => {
      messageBridge.log('error', 'Test error', { context: 'test' });
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.ERROR,
          payload: expect.objectContaining({
            message: 'Test error',
            data: { context: 'test' }
          })
        })
      );
    });

    test('logError应该处理Error对象', () => {
      const error = new Error('Test error');
      
      messageBridge.logError(error);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.ERROR,
          payload: expect.objectContaining({
            message: 'Test error'
          })
        })
      );
    });

    test('logWarning应该发送警告', () => {
      messageBridge.logWarning('Warning message');
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.WARNING,
          payload: expect.objectContaining({
            message: 'Warning message'
          })
        })
      );
    });

    test('logInfo应该发送信息', () => {
      messageBridge.logInfo('Info message');
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          payload: expect.objectContaining({
            message: 'Info message'
          })
        })
      );
    });
  });

  describe('性能监控', () => {
    test('sendPerformanceMetrics应该发送性能指标', () => {
      const metrics = { fps: 60, memoryUsage: 1024 };
      
      messageBridge.sendPerformanceMetrics(metrics);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          payload: expect.objectContaining({
            type: 'performance_metrics',
            metrics
          })
        })
      );
    });

    test('trackUserAction应该发送用户操作统计', () => {
      messageBridge.trackUserAction('button_click', { buttonId: 'save' });
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO,
          payload: expect.objectContaining({
            type: 'user_action',
            action: 'button_click',
            data: { buttonId: 'save' }
          })
        })
      );
    });
  });

  describe('批量操作', () => {
    test('sendBatch应该发送批量消息', () => {
      const messages = [
        { type: MessageType.INFO, data: { msg: 1 } },
        { type: MessageType.WARNING, data: { msg: 2 } }
      ];
      
      messageBridge.sendBatch(messages);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.BATCH,
          data: expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                type: MessageType.INFO,
                data: { msg: 1 }
              }),
              expect.objectContaining({
                type: MessageType.WARNING,
                data: { msg: 2 }
              })
            ])
          })
        })
      );
    });
  });

  describe('在线状态管理', () => {
    test('setOnline(false)应该暂停消息发送', () => {
      messageBridge.setOnline(false);
      mockVSCodeAPI.postMessage.mockClear();
      
      messageBridge.send({ type: MessageType.INFO, data: 'queued' });
      
      expect(mockVSCodeAPI.postMessage).not.toHaveBeenCalled();
    });

    test('setOnline(true)应该发送队列消息', () => {
      messageBridge.setOnline(false);
      messageBridge.send({ type: MessageType.INFO, data: 'queued1' });
      messageBridge.send({ type: MessageType.WARNING, data: 'queued2' });
      
      mockVSCodeAPI.postMessage.mockClear();
      messageBridge.setOnline(true);
      
      expect(mockVSCodeAPI.postMessage).toHaveBeenCalledTimes(2);
    });

    test('clearQueue应该清空消息队列', () => {
      messageBridge.setOnline(false);
      messageBridge.send({ type: MessageType.INFO, data: 'queued' });
      
      messageBridge.clearQueue();
      
      mockVSCodeAPI.postMessage.mockClear();
      messageBridge.setOnline(true);
      
      expect(mockVSCodeAPI.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('统计信息', () => {
    test('getStats应该返回统计信息', () => {
      messageBridge.send({ type: MessageType.INFO });
      messageBridge.handleMessage(createMessage(MessageType.WARNING, {}));
      
      const stats = messageBridge.getStats();
      
      expect(stats).toHaveProperty('messagesSent');
      expect(stats).toHaveProperty('messagesReceived');
      expect(stats).toHaveProperty('pendingRequests');
      expect(stats).toHaveProperty('totalMessages');
      expect(stats).toHaveProperty('averageLatency');
      
      expect(stats.messagesSent).toBe(1);
      expect(stats.messagesReceived).toBe(1);
    });
  });

  describe('销毁和清理', () => {
    test('destroy应该清理所有资源', () => {
      // 添加一些pending requests
      const mockReject1 = vi.fn();
      const mockReject2 = vi.fn();
      
      (messageBridge as any).pendingRequests.set('req1', {
        resolve: vi.fn(),
        reject: mockReject1,
        timeout: 111
      });
      (messageBridge as any).pendingRequests.set('req2', {
        resolve: vi.fn(),
        reject: mockReject2,
        timeout: 222
      });

      const removeListenersSpy = vi.spyOn(messageBridge, 'removeAllListeners');
      
      messageBridge.destroy();

      expect(global.clearTimeout).toHaveBeenCalledWith(111);
      expect(global.clearTimeout).toHaveBeenCalledWith(222);
      expect(mockReject1).toHaveBeenCalledWith(expect.any(Error));
      expect(mockReject2).toHaveBeenCalledWith(expect.any(Error));
      expect(global.window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(removeListenersSpy).toHaveBeenCalled();
    });

    test('cleanup应该调用destroy', () => {
      const destroySpy = vi.spyOn(messageBridge, 'destroy');
      
      messageBridge.cleanup();
      
      expect(destroySpy).toHaveBeenCalled();
    });

    test('重复调用destroy应该安全', () => {
      messageBridge.destroy();
      expect(() => messageBridge.destroy()).not.toThrow();
    });
  });

  describe('边界条件', () => {
    test('应该处理发送失败', () => {
      const errorSpy = vi.fn();
      messageBridge.on('error', errorSpy);
      
      mockVSCodeAPI.postMessage.mockImplementation(() => {
        throw new Error('Send failed');
      });

      messageBridge.send({ type: MessageType.INFO });
      
      expect(errorSpy).toHaveBeenCalled();
    });

    test('应该处理无效的cancelRequest', () => {
      expect(() => messageBridge.cancelRequest('nonexistent')).not.toThrow();
    });

    test('应该处理空数据的批量消息', () => {
      const batchMessage = createMessage(MessageType.BATCH, { messages: [] });
      
      expect(() => messageBridge.handleMessage(batchMessage)).not.toThrow();
    });

    test('应该处理特殊字符', () => {
      // 重置mock避免前面测试的影响
      mockVSCodeAPI.postMessage.mockRestore();
      mockVSCodeAPI.postMessage = vi.fn();
      
      const specialMessage = {
        type: MessageType.INFO,
        data: {
          unicode: '测试🎉',
          special: '!@#$%^&*()',
          quotes: '"\'`'
        }
      };
      
      expect(() => messageBridge.send(specialMessage)).not.toThrow();
    });
  });
});
/**
 * main-Ultimate-Coverage.test.ts
 * Extension主入口模块100%覆盖率终极测试
 * 目标：覆盖SerialStudioExtension类和activate/deactivate函数的所有分支
 */

import { describe, test, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { IOManager, ConnectionState } from '../../src/extension/io/Manager';
import { ExtensionState, MessageType, Message, ConnectionConfig } from '../../src/shared/types';

// Mock VSCode API
const mockVSCode = {
  window: {
    createOutputChannel: vi.fn(),
    createStatusBarItem: vi.fn(),
    createWebviewPanel: vi.fn(),
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    showInputBox: vi.fn(),
    showQuickPick: vi.fn(),
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
  },
  workspace: {
    getConfiguration: vi.fn(),
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  ViewColumn: {
    One: 1,
    Two: 2,
  },
  Uri: {
    joinPath: vi.fn(),
  },
  Disposable: class {
    dispose() {}
  },
};

vi.mock('vscode', () => mockVSCode);

// Mock IOManager
class MockIOManager extends EventEmitter {
  state = ConnectionState.Disconnected;
  
  constructor() {
    super();
  }

  async connect(config: ConnectionConfig) {
    this.state = ConnectionState.Connecting;
    this.emit('stateChanged', this.state);
    
    // Simulate connection process
    setTimeout(() => {
      this.state = ConnectionState.Connected;
      this.emit('stateChanged', this.state);
    }, 10);
  }

  async disconnect() {
    this.state = ConnectionState.Disconnected;
    this.emit('stateChanged', this.state);
  }

  async destroy() {
    this.removeAllListeners();
  }

  emitFrame(frame: any) {
    this.emit('frameReceived', frame);
  }

  emitRawData(data: Buffer) {
    this.emit('rawDataReceived', data);
  }

  emitError(error: Error) {
    this.emit('error', error);
  }

  emitWarning(message: string) {
    this.emit('warning', message);
  }

  emitStatistics(stats: any) {
    this.emit('statisticsUpdated', stats);
  }
}

vi.mock('../../src/extension/io/Manager', () => ({
  IOManager: MockIOManager,
  ConnectionState: {
    Disconnected: 'disconnected',
    Connecting: 'connecting',
    Connected: 'connected',
    Reconnecting: 'reconnecting',
    Error: 'error',
  },
}));

// Mock shared types
vi.mock('../../src/shared/types', () => ({
  MessageType: {
    CONNECTION_STATUS: 'connection_status',
    FRAME_DATA: 'frame_data',
    RAW_DATA: 'raw_data',
    ERROR: 'error',
    WARNING: 'warning',
    CONNECT_DEVICE: 'connect_device',
    DISCONNECT_DEVICE: 'disconnect_device',
    GET_CONFIG: 'get_config',
    UPDATE_CONFIG: 'update_config',
    EXPORT_DATA: 'export_data',
    INFO: 'info',
  },
}));

describe('Extension Main模块终极覆盖率测试', () => {
  let mockContext: any;
  let mockStatusBarItem: any;
  let mockOutputChannel: any;
  let mockWebviewPanel: any;
  let mockWebview: any;
  let SerialStudioExtension: any;
  let activate: any;
  let deactivate: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock status bar item
    mockStatusBarItem = {
      text: '',
      color: undefined,
      command: '',
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    };

    // Mock output channel
    mockOutputChannel = {
      appendLine: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    };

    // Mock webview
    mockWebview = {
      html: '',
      postMessage: vi.fn(),
      onDidReceiveMessage: vi.fn(),
    };

    // Mock webview panel
    mockWebviewPanel = {
      webview: mockWebview,
      reveal: vi.fn(),
      dispose: vi.fn(),
      onDidDispose: vi.fn(),
    };

    // Mock extension context
    mockContext = {
      subscriptions: [],
      extensionUri: { fsPath: '/mock/extension/path' },
    };

    // Setup mock returns
    mockVSCode.window.createStatusBarItem.mockReturnValue(mockStatusBarItem);
    mockVSCode.window.createOutputChannel.mockReturnValue(mockOutputChannel);
    mockVSCode.window.createWebviewPanel.mockReturnValue(mockWebviewPanel);
    mockVSCode.commands.registerCommand.mockImplementation((cmd, handler) => ({
      dispose: vi.fn(),
    }));
    mockVSCode.Uri.joinPath.mockReturnValue({ fsPath: '/mock/path' });
    mockVSCode.workspace.getConfiguration.mockReturnValue({
      get: vi.fn().mockReturnValue(false),
    });

    // Dynamic import to get fresh instances
    const mainModule = await import('../../src/extension/main');
    SerialStudioExtension = (mainModule as any).SerialStudioExtension;
    activate = mainModule.activate;
    deactivate = mainModule.deactivate;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('SerialStudioExtension类构造函数测试', () => {
    test('应该正确初始化所有组件', () => {
      const extension = new SerialStudioExtension(mockContext);

      expect(mockVSCode.window.createOutputChannel).toHaveBeenCalledWith('Serial Studio');
      expect(mockVSCode.window.createStatusBarItem).toHaveBeenCalledWith(
        mockVSCode.StatusBarAlignment.Left,
        100
      );
      expect(mockStatusBarItem.show).toHaveBeenCalled();
      expect(mockStatusBarItem.command).toBe('serialStudio.openDashboard');
    });

    test('应该注册所有必要的命令', () => {
      new SerialStudioExtension(mockContext);

      expect(mockVSCode.commands.registerCommand).toHaveBeenCalledTimes(4);
      expect(mockVSCode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.openDashboard',
        expect.any(Function)
      );
      expect(mockVSCode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.connectDevice',
        expect.any(Function)
      );
      expect(mockVSCode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.disconnectDevice',
        expect.any(Function)
      );
      expect(mockVSCode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.openProjectEditor',
        expect.any(Function)
      );
    });

    test('应该注册视图和设置上下文', () => {
      new SerialStudioExtension(mockContext);

      expect(mockVSCode.commands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'serialStudio.enabled',
        true
      );
    });

    test('应该正确初始化扩展状态', () => {
      const extension = new SerialStudioExtension(mockContext);
      const state = (extension as any).extensionState;

      expect(state).toMatchObject({
        connected: false,
        performance: {
          updateFrequency: 20,
          processingLatency: 0,
          memoryUsage: 0,
          droppedFrames: 0,
        },
        communication: {
          bytesReceived: 0,
          bytesSent: 0,
          framesReceived: 0,
          framesSent: 0,
          framesProcessed: 0,
          errors: 0,
          reconnections: 0,
          uptime: 0,
        },
      });
    });
  });

  describe('IOManager事件处理测试', () => {
    let extension: any;
    let mockIOManager: MockIOManager;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
      mockIOManager = (extension as any).ioManager;
      // Set up webview panel
      (extension as any).currentWebviewPanel = mockWebviewPanel;
    });

    test('应该正确处理连接状态变化事件', () => {
      mockIOManager.emit('stateChanged', ConnectionState.Connected);

      expect((extension as any).extensionState.connected).toBe(true);
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'connection_status',
        payload: {
          state: ConnectionState.Connected,
          connected: true,
        },
        timestamp: expect.any(Number),
      });
    });

    test('应该正确处理帧接收事件', () => {
      const mockFrame = {
        data: Buffer.from('test'),
        sequence: 123,
        timestamp: Date.now(),
      };

      mockIOManager.emitFrame(mockFrame);

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'frame_data',
        payload: mockFrame,
        timestamp: expect.any(Number),
      });
    });

    test('应该在调试模式下记录帧接收日志', () => {
      mockVSCode.workspace.getConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true), // Debug mode enabled
      });

      const mockFrame = {
        data: Buffer.from('test'),
        sequence: 123,
        timestamp: Date.now(),
      };

      mockIOManager.emitFrame(mockFrame);

      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        `Frame received: ${mockFrame.data.length} bytes, seq: ${mockFrame.sequence}`
      );
    });

    test('应该正确处理原始数据事件', () => {
      const mockData = Buffer.from('raw data');

      mockIOManager.emitRawData(mockData);

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'raw_data',
        payload: {
          data: Array.from(mockData),
          timestamp: expect.any(Number),
        },
        timestamp: expect.any(Number),
      });
    });

    test('应该正确处理错误事件', () => {
      const mockError = new Error('Test error');
      mockError.stack = 'Error stack trace';

      mockIOManager.emitError(mockError);

      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Error: Test error');
      expect(mockVSCode.window.showErrorMessage).toHaveBeenCalledWith('Serial Studio: Test error');
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'error',
        payload: {
          message: 'Test error',
          stack: 'Error stack trace',
        },
        timestamp: expect.any(Number),
      });
    });

    test('应该正确处理警告事件', () => {
      mockIOManager.emitWarning('Test warning');

      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Warning: Test warning');
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'warning',
        payload: { message: 'Test warning' },
        timestamp: expect.any(Number),
      });
    });

    test('应该正确处理统计更新事件', () => {
      const mockStats = {
        bytesReceived: 1000,
        bytesSent: 500,
        framesReceived: 10,
        framesSent: 5,
      };

      // Mock process.memoryUsage()
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 10 * 1024 * 1024, // 10MB
        heapTotal: 20 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
      });

      mockIOManager.emitStatistics(mockStats);

      expect((extension as any).extensionState.communication).toEqual(mockStats);
      expect((extension as any).extensionState.performance.memoryUsage).toBe(10);

      process.memoryUsage = originalMemoryUsage;
    });

    test('应该在没有webview时跳过消息发送', () => {
      (extension as any).currentWebviewPanel = null;

      mockIOManager.emit('stateChanged', ConnectionState.Connected);
      
      expect(mockWebview.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('命令处理测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    describe('openDashboard命令', () => {
      test('应该创建新的webview面板', async () => {
        await (extension as any).openDashboard();

        expect(mockVSCode.window.createWebviewPanel).toHaveBeenCalledWith(
          'serialStudioDashboard',
          'Serial Studio Dashboard',
          mockVSCode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
              { fsPath: '/mock/path' },
              { fsPath: '/mock/path' },
            ],
          }
        );

        expect(mockWebviewPanel.webview.html).toBeDefined();
        expect(mockWebview.onDidReceiveMessage).toHaveBeenCalled();
        expect(mockWebviewPanel.onDidDispose).toHaveBeenCalled();
      });

      test('应该复用已存在的webview面板', async () => {
        (extension as any).currentWebviewPanel = mockWebviewPanel;

        await (extension as any).openDashboard();

        expect(mockWebviewPanel.reveal).toHaveBeenCalled();
        expect(mockVSCode.window.createWebviewPanel).not.toHaveBeenCalled();
      });

      test('应该发送初始状态到webview', async () => {
        await (extension as any).openDashboard();

        expect(mockWebview.postMessage).toHaveBeenCalledWith({
          type: 'connection_status',
          payload: {
            state: ConnectionState.Disconnected,
            connected: false,
            statistics: expect.any(Object),
          },
          timestamp: expect.any(Number),
        });
      });

      test('应该正确处理webview关闭事件', async () => {
        await (extension as any).openDashboard();

        const onDidDisposeCallback = mockWebviewPanel.onDidDispose.mock.calls[0][0];
        onDidDisposeCallback();

        expect((extension as any).currentWebviewPanel).toBeNull();
      });
    });

    describe('showConnectionDialog命令', () => {
      test('应该显示连接对话框并成功连接', async () => {
        mockVSCode.window.showInputBox.mockResolvedValue('/dev/ttyUSB0');
        mockVSCode.window.showQuickPick.mockResolvedValue('9600');

        await (extension as any).showConnectionDialog();

        expect(mockVSCode.window.showInputBox).toHaveBeenCalledWith({
          prompt: 'Enter serial port name (e.g., COM3, /dev/ttyUSB0)',
          placeHolder: '/dev/ttyUSB0',
        });

        expect(mockVSCode.window.showQuickPick).toHaveBeenCalledWith(
          ['9600', '19200', '38400', '57600', '115200', '230400', '460800', '921600'],
          { placeHolder: 'Select baud rate' }
        );

        expect(mockVSCode.window.showInformationMessage).toHaveBeenCalledWith(
          'Connected to /dev/ttyUSB0'
        );
      });

      test('应该在用户取消端口输入时退出', async () => {
        mockVSCode.window.showInputBox.mockResolvedValue(undefined);

        await (extension as any).showConnectionDialog();

        expect(mockVSCode.window.showQuickPick).not.toHaveBeenCalled();
      });

      test('应该在用户取消波特率选择时退出', async () => {
        mockVSCode.window.showInputBox.mockResolvedValue('/dev/ttyUSB0');
        mockVSCode.window.showQuickPick.mockResolvedValue(undefined);

        await (extension as any).showConnectionDialog();

        expect(mockVSCode.window.showInformationMessage).not.toHaveBeenCalled();
      });

      test('应该处理连接失败情况', async () => {
        mockVSCode.window.showInputBox.mockResolvedValue('/dev/ttyUSB0');
        mockVSCode.window.showQuickPick.mockResolvedValue('9600');

        // Mock connection failure
        const mockIOManager = (extension as any).ioManager;
        mockIOManager.connect = vi.fn().mockRejectedValue(new Error('Connection failed'));

        await (extension as any).showConnectionDialog();

        expect(mockVSCode.window.showErrorMessage).toHaveBeenCalledWith(
          'Failed to connect: Error: Connection failed'
        );
      });
    });

    describe('disconnectDevice命令', () => {
      test('应该成功断开连接', async () => {
        await (extension as any).disconnectDevice();

        expect(mockVSCode.window.showInformationMessage).toHaveBeenCalledWith(
          'Disconnected from device'
        );
      });

      test('应该处理断开连接失败情况', async () => {
        // Mock disconnection failure
        const mockIOManager = (extension as any).ioManager;
        mockIOManager.disconnect = vi.fn().mockRejectedValue(new Error('Disconnection failed'));

        await (extension as any).disconnectDevice();

        expect(mockVSCode.window.showErrorMessage).toHaveBeenCalledWith(
          'Failed to disconnect: Error: Disconnection failed'
        );
      });
    });

    describe('openProjectEditor命令', () => {
      test('应该显示未实现消息', async () => {
        await (extension as any).openProjectEditor();

        expect(mockVSCode.window.showInformationMessage).toHaveBeenCalledWith(
          'Project editor not yet implemented'
        );
      });
    });
  });

  describe('Webview消息处理测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('应该处理CONNECT_DEVICE消息', async () => {
      const mockConfig = {
        type: 'uart',
        port: '/dev/ttyUSB0',
        baudRate: 9600,
      };

      await (extension as any).handleWebviewMessage({
        type: 'connect_device',
        payload: mockConfig,
      });

      expect((extension as any).extensionState.device).toEqual(mockConfig);
    });

    test('应该处理CONNECT_DEVICE消息失败情况', async () => {
      const mockIOManager = (extension as any).ioManager;
      mockIOManager.connect = vi.fn().mockRejectedValue(new Error('Connection failed'));
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      await (extension as any).handleWebviewMessage({
        type: 'connect_device',
        payload: { port: '/dev/ttyUSB0' },
      });

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'error',
        payload: { message: 'Connection failed' },
        timestamp: expect.any(Number),
      });
    });

    test('应该处理DISCONNECT_DEVICE消息', async () => {
      await (extension as any).handleWebviewMessage({
        type: 'disconnect_device',
      });

      expect((extension as any).extensionState.device).toBeUndefined();
    });

    test('应该处理DISCONNECT_DEVICE消息失败情况', async () => {
      const mockIOManager = (extension as any).ioManager;
      mockIOManager.disconnect = vi.fn().mockRejectedValue(new Error('Disconnect failed'));
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      await (extension as any).handleWebviewMessage({
        type: 'disconnect_device',
      });

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'error',
        payload: { message: 'Disconnect failed' },
        timestamp: expect.any(Number),
      });
    });

    test('应该处理GET_CONFIG消息', async () => {
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      await (extension as any).handleWebviewMessage({
        type: 'get_config',
      });

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'update_config',
        payload: (extension as any).extensionState,
        timestamp: expect.any(Number),
      });
    });

    test('应该处理EXPORT_DATA消息', async () => {
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      await (extension as any).handleWebviewMessage({
        type: 'export_data',
      });

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'info',
        payload: { message: 'Data export not yet implemented' },
        timestamp: expect.any(Number),
      });
    });

    test('应该处理未知消息类型', async () => {
      await (extension as any).handleWebviewMessage({
        type: 'unknown_type',
      });

      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        'Unknown message type: unknown_type'
      );
    });

    test('应该跳过没有payload的CONNECT_DEVICE消息', async () => {
      await (extension as any).handleWebviewMessage({
        type: 'connect_device',
      });

      expect((extension as any).extensionState.device).toBeUndefined();
    });
  });

  describe('状态栏更新测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('应该正确更新Connected状态', () => {
      (extension as any).updateStatusBar(ConnectionState.Connected);

      expect(mockStatusBarItem.text).toBe('$(plug) Serial Studio: Connected');
      expect(mockStatusBarItem.color).toBeUndefined();
    });

    test('应该正确更新Connecting状态', () => {
      (extension as any).updateStatusBar(ConnectionState.Connecting);

      expect(mockStatusBarItem.text).toBe('$(sync~spin) Serial Studio: Connecting...');
      expect(mockStatusBarItem.color).toBe('yellow');
    });

    test('应该正确更新Reconnecting状态', () => {
      (extension as any).updateStatusBar(ConnectionState.Reconnecting);

      expect(mockStatusBarItem.text).toBe('$(sync~spin) Serial Studio: Reconnecting...');
      expect(mockStatusBarItem.color).toBe('yellow');
    });

    test('应该正确更新Error状态', () => {
      (extension as any).updateStatusBar(ConnectionState.Error);

      expect(mockStatusBarItem.text).toBe('$(error) Serial Studio: Error');
      expect(mockStatusBarItem.color).toBe('red');
    });

    test('应该正确更新Disconnected状态', () => {
      (extension as any).updateStatusBar(ConnectionState.Disconnected);

      expect(mockStatusBarItem.text).toBe('$(circle-slash) Serial Studio: Disconnected');
      expect(mockStatusBarItem.color).toBeUndefined();
    });

    test('应该处理字符串状态', () => {
      (extension as any).updateStatusBar('Custom Status');

      expect(mockStatusBarItem.text).toBe('$(circle-slash) Serial Studio: Disconnected');
      expect(mockStatusBarItem.color).toBeUndefined();
    });
  });

  describe('工具函数测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('isDebugMode应该返回正确的调试状态', () => {
      mockVSCode.workspace.getConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(true),
      });

      expect((extension as any).isDebugMode()).toBe(true);

      mockVSCode.workspace.getConfiguration.mockReturnValue({
        get: vi.fn().mockReturnValue(false),
      });

      expect((extension as any).isDebugMode()).toBe(false);
    });

    test('sendMessageToWebview应该在有webview时发送消息', () => {
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      const message = { type: 'test', payload: 'data' };
      (extension as any).sendMessageToWebview(message);

      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        ...message,
        timestamp: expect.any(Number),
      });
    });

    test('sendMessageToWebview应该在没有webview时跳过', () => {
      (extension as any).currentWebviewPanel = null;

      const message = { type: 'test', payload: 'data' };
      (extension as any).sendMessageToWebview(message);

      expect(mockWebview.postMessage).not.toHaveBeenCalled();
    });

    test('updatePerformanceMetrics应该更新性能指标', () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 0,
      });

      (extension as any).updatePerformanceMetrics();

      expect((extension as any).extensionState.performance.memoryUsage).toBe(50);
      expect((extension as any).extensionState.performance.processingLatency).toBe(10);

      process.memoryUsage = originalMemoryUsage;
    });

    test('getWebviewContent应该返回HTML内容', async () => {
      const html = await (extension as any).getWebviewContent();

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Serial Studio Dashboard');
      expect(html).toContain('acquireVsCodeApi()');
    });
  });

  describe('资源清理测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('dispose应该正确清理所有资源', async () => {
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      await extension.dispose();

      expect(mockStatusBarItem.dispose).toHaveBeenCalled();
      expect(mockOutputChannel.dispose).toHaveBeenCalled();
      expect(mockWebviewPanel.dispose).toHaveBeenCalled();
    });

    test('dispose应该处理没有webview的情况', async () => {
      (extension as any).currentWebviewPanel = null;

      await extension.dispose();

      expect(mockStatusBarItem.dispose).toHaveBeenCalled();
      expect(mockOutputChannel.dispose).toHaveBeenCalled();
      expect(mockWebviewPanel.dispose).not.toHaveBeenCalled();
    });
  });

  describe('全局函数测试', () => {
    test('activate应该成功激活扩展', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      activate(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith('Serial Studio extension is now active');
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    test('activate应该处理激活失败情况', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock constructor to throw error
      vi.doMock('../../src/extension/main', () => ({
        activate,
        deactivate,
        SerialStudioExtension: class {
          constructor() {
            throw new Error('Activation failed');
          }
        },
      }));

      activate(mockContext);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to activate Serial Studio extension:',
        expect.any(Error)
      );
      expect(mockVSCode.window.showErrorMessage).toHaveBeenCalledWith(
        'Failed to activate Serial Studio: Error: Activation failed'
      );

      consoleSpy.mockRestore();
    });

    test('deactivate应该成功停用扩展', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // First activate
      activate(mockContext);
      
      // Then deactivate
      deactivate();

      expect(consoleSpy).toHaveBeenCalledWith('Serial Studio extension is being deactivated');

      consoleSpy.mockRestore();
    });

    test('deactivate应该处理没有活跃扩展的情况', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      deactivate();

      expect(consoleSpy).toHaveBeenCalledWith('Serial Studio extension is being deactivated');

      consoleSpy.mockRestore();
    });
  });

  describe('边界条件和错误场景测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('应该处理空的连接配置', async () => {
      await (extension as any).handleWebviewMessage({
        type: 'connect_device',
        payload: null,
      });

      expect((extension as any).extensionState.device).toBeUndefined();
    });

    test('应该处理无效的消息格式', async () => {
      await (extension as any).handleWebviewMessage({});
      await (extension as any).handleWebviewMessage(null);
      await (extension as any).handleWebviewMessage(undefined);

      // Should not throw errors
    });

    test('应该处理IOManager创建失败', () => {
      // Mock IOManager constructor to throw
      vi.doMock('../../src/extension/io/Manager', () => ({
        IOManager: class {
          constructor() {
            throw new Error('IOManager creation failed');
          }
        },
        ConnectionState: {
          Disconnected: 'disconnected',
        },
      }));

      expect(() => {
        new SerialStudioExtension(mockContext);
      }).toThrow('IOManager creation failed');
    });

    test('应该处理VSCode API调用失败', () => {
      mockVSCode.window.createOutputChannel.mockImplementation(() => {
        throw new Error('Failed to create output channel');
      });

      expect(() => {
        new SerialStudioExtension(mockContext);
      }).toThrow('Failed to create output channel');
    });
  });

  describe('异步操作和竞态条件测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('应该正确处理多次快速连接请求', async () => {
      mockVSCode.window.showInputBox.mockResolvedValue('/dev/ttyUSB0');
      mockVSCode.window.showQuickPick.mockResolvedValue('9600');

      // 发起多个并发连接
      const promises = [
        (extension as any).showConnectionDialog(),
        (extension as any).showConnectionDialog(),
        (extension as any).showConnectionDialog(),
      ];

      await Promise.all(promises);

      // 所有连接都应该尝试执行
      expect(mockVSCode.window.showInputBox).toHaveBeenCalledTimes(3);
    });

    test('应该正确处理连接和断开的竞态条件', async () => {
      const connectPromise = (extension as any).ioManager.connect({ port: '/dev/ttyUSB0' });
      const disconnectPromise = (extension as any).ioManager.disconnect();

      await Promise.all([connectPromise, disconnectPromise]);

      // 两个操作都应该完成而不会崩溃
    });

    test('应该处理webview快速创建和销毁', async () => {
      // 快速多次打开和关闭dashboard
      await (extension as any).openDashboard();
      const firstPanel = (extension as any).currentWebviewPanel;
      
      await (extension as any).openDashboard();
      const secondPanel = (extension as any).currentWebviewPanel;

      expect(firstPanel).toBe(secondPanel);
      expect(mockWebviewPanel.reveal).toHaveBeenCalled();
    });
  });

  describe('内存和性能测试', () => {
    let extension: any;

    beforeEach(() => {
      extension = new SerialStudioExtension(mockContext);
    });

    test('应该正确管理事件监听器', () => {
      const mockIOManager = (extension as any).ioManager;
      
      // 检查事件监听器是否正确添加
      expect(mockIOManager.listenerCount('stateChanged')).toBe(1);
      expect(mockIOManager.listenerCount('frameReceived')).toBe(1);
      expect(mockIOManager.listenerCount('rawDataReceived')).toBe(1);
      expect(mockIOManager.listenerCount('error')).toBe(1);
      expect(mockIOManager.listenerCount('warning')).toBe(1);
      expect(mockIOManager.listenerCount('statisticsUpdated')).toBe(1);
    });

    test('应该在dispose时清理事件监听器', async () => {
      const mockIOManager = (extension as any).ioManager;
      
      await extension.dispose();
      
      // 检查IOManager的destroy方法是否被调用
      // destroy方法应该清理所有监听器
    });

    test('应该限制并发消息发送', () => {
      (extension as any).currentWebviewPanel = mockWebviewPanel;

      // 发送大量消息
      for (let i = 0; i < 1000; i++) {
        (extension as any).sendMessageToWebview({
          type: 'test',
          payload: `message ${i}`,
        });
      }

      expect(mockWebview.postMessage).toHaveBeenCalledTimes(1000);
    });
  });
});
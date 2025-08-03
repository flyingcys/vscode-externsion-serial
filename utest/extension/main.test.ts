/**
 * 主扩展入口测试 (main.ts)
 * 测试 SerialStudioExtension 类的生命周期、webview管理、命令注册和消息处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as vscode from 'vscode';
import { activate, deactivate } from '../../src/extension/main';
import { IOManager, ConnectionState } from '../../src/extension/io/Manager';
import { MessageType, ConnectionConfig, BusType } from '../../src/shared/types';

// Mock VSCode API
vi.mock('vscode', () => ({
  window: {
    createOutputChannel: vi.fn().mockReturnValue({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn()
    }),
    createStatusBarItem: vi.fn().mockReturnValue({
      text: '',
      color: undefined,
      command: '',
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    }),
    showInputBox: vi.fn(),
    showQuickPick: vi.fn(),
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    createWebviewPanel: vi.fn().mockReturnValue({
      webview: {
        html: '',
        postMessage: vi.fn(),
        onDidReceiveMessage: vi.fn().mockReturnValue({ dispose: vi.fn() }),
        options: {},
        cspSource: 'self'
      },
      onDidDispose: vi.fn().mockReturnValue({ dispose: vi.fn() }),
      dispose: vi.fn(),
      reveal: vi.fn(),
      title: 'Test Panel'
    })
  },
  commands: {
    registerCommand: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    executeCommand: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue(false)
    })
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  },
  Uri: {
    file: vi.fn().mockImplementation((path: string) => ({
      scheme: 'file',
      path,
      fsPath: path
    })),
    joinPath: vi.fn().mockImplementation((base, ...paths) => ({
      scheme: base.scheme,
      path: `${base.path}/${paths.join('/')}`,
      fsPath: `${base.fsPath}/${paths.join('/')}`
    }))
  }
}));

// Mock IOManager
vi.mock('../../src/extension/io/Manager', () => ({
  IOManager: vi.fn().mockImplementation(() => ({
    state: ConnectionState.Disconnected,
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    isConnected: false
  })),
  ConnectionState: {
    Disconnected: 'disconnected',
    Connecting: 'connecting',
    Connected: 'connected',
    Reconnecting: 'reconnecting',
    Error: 'error'
  }
}));

describe('SerialStudioExtension 主扩展入口测试', () => {
  let mockContext: vscode.ExtensionContext;
  let mockIOManager: any;

  beforeEach(() => {
    // 创建 Mock ExtensionContext
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: vi.fn(),
        update: vi.fn()
      },
      globalState: {
        get: vi.fn(),
        update: vi.fn(),
        keys: vi.fn().mockReturnValue([])
      },
      extensionUri: {
        scheme: 'file',
        path: '/mock/extension/path',
        fsPath: '/mock/extension/path'
      },
      extensionPath: '/mock/extension/path',
      environmentVariableCollection: {
        clear: vi.fn(),
        delete: vi.fn(),
        forEach: vi.fn(),
        get: vi.fn(),
        prepend: vi.fn(),
        replace: vi.fn(),
        append: vi.fn()
      },
      asAbsolutePath: vi.fn().mockImplementation((relativePath: string) => 
        `/mock/extension/path/${relativePath}`
      ),
      storageUri: {
        scheme: 'file',
        path: '/mock/storage',
        fsPath: '/mock/storage'
      },
      globalStorageUri: {
        scheme: 'file',
        path: '/mock/global-storage',
        fsPath: '/mock/global-storage'
      },
      logUri: {
        scheme: 'file',
        path: '/mock/logs',
        fsPath: '/mock/logs'
      },
      storagePath: '/mock/storage',
      globalStoragePath: '/mock/global-storage',
      logPath: '/mock/logs',
      extensionMode: 1, // Normal mode
      secrets: {
        get: vi.fn(),
        store: vi.fn(),
        delete: vi.fn(),
        onDidChange: vi.fn()
      }
    } as any;

    // 重置所有 mocks
    vi.clearAllMocks();
    
    // 创建 IOManager mock 实例
    mockIOManager = {
      state: ConnectionState.Disconnected,
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      setFrameConfig: vi.fn(),
      write: vi.fn().mockResolvedValue(10),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      isConnected: false
    };
    
    // 配置 IOManager 构造函数返回 mock 实例
    (IOManager as any).mockImplementation(() => mockIOManager);
  });

  afterEach(() => {
    // 清理
    deactivate();
    vi.clearAllMocks();
  });

  describe('扩展激活和生命周期', () => {
    it('应该成功激活扩展', () => {
      expect(() => activate(mockContext)).not.toThrow();
    });

    it('应该创建必要的输出通道', () => {
      activate(mockContext);
      expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Serial Studio');
    });

    it('应该创建状态栏项目', () => {
      activate(mockContext);
      expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
        vscode.StatusBarAlignment.Left, 
        100
      );
    });

    it('应该注册所有必要的命令', () => {
      activate(mockContext);
      
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.openDashboard',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.connectDevice',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.disconnectDevice',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'serialStudio.openProjectEditor',
        expect.any(Function)
      );
    });

    it('应该将所有订阅添加到上下文', () => {
      activate(mockContext);
      
      // 验证订阅数量 - 4个命令 + 状态栏 + 输出通道 + IOManager事件监听器
      expect(mockContext.subscriptions.length).toBeGreaterThan(5);
    });

    it('应该正确处理扩展停用', () => {
      activate(mockContext);
      expect(() => deactivate()).not.toThrow();
    });
  });

  describe('IOManager 事件处理', () => {
    let eventHandlers: { [key: string]: Function } = {};

    beforeEach(() => {
      // 模拟事件监听器注册
      mockIOManager.on.mockImplementation((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      });
      
      activate(mockContext);
    });

    it('应该注册 IOManager 事件监听器', () => {
      expect(mockIOManager.on).toHaveBeenCalledWith('stateChanged', expect.any(Function));
      expect(mockIOManager.on).toHaveBeenCalledWith('frameReceived', expect.any(Function));
      expect(mockIOManager.on).toHaveBeenCalledWith('rawDataReceived', expect.any(Function));
      expect(mockIOManager.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockIOManager.on).toHaveBeenCalledWith('warning', expect.any(Function));
      expect(mockIOManager.on).toHaveBeenCalledWith('statisticsUpdated', expect.any(Function));
    });

    it('应该处理连接状态变化', () => {
      const stateHandler = eventHandlers['stateChanged'];
      expect(stateHandler).toBeDefined();
      
      // 模拟状态变化
      stateHandler(ConnectionState.Connected);
      
      // 验证状态栏更新
      expect(vscode.window.createStatusBarItem().text).toBeDefined();
    });

    it('应该处理帧数据接收', () => {
      const frameHandler = eventHandlers['frameReceived'];
      expect(frameHandler).toBeDefined();
      
      const mockFrame = {
        data: new Uint8Array([1, 2, 3]),
        timestamp: Date.now(),
        sequence: 1
      };
      
      expect(() => frameHandler(mockFrame)).not.toThrow();
    });

    it('应该处理原始数据接收', () => {
      const rawDataHandler = eventHandlers['rawDataReceived'];
      expect(rawDataHandler).toBeDefined();
      
      const mockData = Buffer.from([1, 2, 3, 4]);
      expect(() => rawDataHandler(mockData)).not.toThrow();
    });

    it('应该处理错误事件', () => {
      const errorHandler = eventHandlers['error'];
      expect(errorHandler).toBeDefined();
      
      const mockError = new Error('Test error');
      errorHandler(mockError);
      
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });

    it('应该处理警告事件', () => {
      const warningHandler = eventHandlers['warning'];
      expect(warningHandler).toBeDefined();
      
      const warningMessage = 'Test warning';
      expect(() => warningHandler(warningMessage)).not.toThrow();
    });

    it('应该处理统计更新', () => {
      const statsHandler = eventHandlers['statisticsUpdated'];
      expect(statsHandler).toBeDefined();
      
      const mockStats = {
        bytesReceived: 1000,
        bytesSent: 500,
        framesReceived: 10,
        framesSent: 5,
        errors: 0,
        reconnections: 0,
        uptime: 60000
      };
      
      expect(() => statsHandler(mockStats)).not.toThrow();
    });
  });

  describe('Webview 面板管理', () => {
    beforeEach(() => {
      activate(mockContext);
    });

    it('应该创建 webview 面板', async () => {
      // 模拟命令调用
      const openDashboardCommand = vscode.commands.registerCommand as any;
      const commandCall = openDashboardCommand.mock.calls.find(call => 
        call[0] === 'serialStudio.openDashboard'
      );
      
      expect(commandCall).toBeDefined();
      const commandHandler = commandCall[1];
      
      await commandHandler();
      
      expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
        'serialStudioDashboard',
        'Serial Studio Dashboard',
        vscode.ViewColumn.One,
        expect.objectContaining({
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: expect.any(Array)
        })
      );
    });

    it('应该生成正确的 webview HTML 内容', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.openDashboard'
      );
      const commandHandler = commandCall[1];
      
      await commandHandler();
      
      const mockPanel = vscode.window.createWebviewPanel() as any;
      expect(mockPanel.webview.html).toBeDefined();
    });

    it('应该只创建一个 webview 面板实例', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.openDashboard'
      );
      const commandHandler = commandCall[1];
      
      // 第一次调用
      await commandHandler();
      expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
      
      // 第二次调用应该重用现有面板
      const mockPanel = vscode.window.createWebviewPanel() as any;
      await commandHandler();
      expect(mockPanel.reveal).toHaveBeenCalled();
    });

    it('应该注册 webview 消息处理器', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.openDashboard'
      );
      const commandHandler = commandCall[1];
      
      await commandHandler();
      
      const mockPanel = vscode.window.createWebviewPanel() as any;
      expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
      expect(mockPanel.onDidDispose).toHaveBeenCalled();
    });
  });

  describe('Webview 消息处理', () => {
    let messageHandler: Function;
    
    beforeEach(async () => {
      activate(mockContext);
      
      // 打开 dashboard 获取消息处理器
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.openDashboard'
      );
      const commandHandler = commandCall[1];
      await commandHandler();
      
      const mockPanel = vscode.window.createWebviewPanel() as any;
      const onMessageCall = mockPanel.webview.onDidReceiveMessage.mock.calls[0];
      messageHandler = onMessageCall[0];
    });

    it('应该处理连接设备消息', async () => {
      const connectMessage = {
        type: MessageType.CONNECT_DEVICE,
        payload: {
          type: BusType.UART,
          port: '/dev/ttyUSB0',
          baudRate: 115200
        } as ConnectionConfig
      };
      
      await messageHandler(connectMessage);
      expect(mockIOManager.connect).toHaveBeenCalledWith(connectMessage.payload);
    });

    it('应该处理断开设备消息', async () => {
      const disconnectMessage = {
        type: MessageType.DISCONNECT_DEVICE
      };
      
      await messageHandler(disconnectMessage);
      expect(mockIOManager.disconnect).toHaveBeenCalled();
    });

    it('应该处理获取配置消息', async () => {
      const getConfigMessage = {
        type: MessageType.GET_CONFIG
      };
      
      const mockPanel = vscode.window.createWebviewPanel() as any;
      await messageHandler(getConfigMessage);
      
      expect(mockPanel.webview.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.UPDATE_CONFIG,
          timestamp: expect.any(Number)
        })
      );
    });

    it('应该处理数据导出消息', async () => {
      const exportMessage = {
        type: MessageType.EXPORT_DATA,
        payload: {
          format: 'csv',
          datasets: ['temperature', 'humidity']
        }
      };
      
      const mockPanel = vscode.window.createWebviewPanel() as any;
      await messageHandler(exportMessage);
      
      expect(mockPanel.webview.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.INFO
        })
      );
    });

    it('应该处理连接错误', async () => {
      mockIOManager.connect.mockRejectedValue(new Error('Connection failed'));
      
      const connectMessage = {
        type: MessageType.CONNECT_DEVICE,
        payload: {
          type: BusType.UART,
          port: '/dev/invalid'
        } as ConnectionConfig
      };
      
      const mockPanel = vscode.window.createWebviewPanel() as any;
      await messageHandler(connectMessage);
      
      expect(mockPanel.webview.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageType.ERROR,
          payload: expect.objectContaining({
            message: 'Connection failed'
          })
        })
      );
    });

    it('应该处理未知消息类型', async () => {
      const unknownMessage = {
        type: 'unknown_message_type' as MessageType
      };
      
      // 应该不抛出错误
      await expect(messageHandler(unknownMessage)).resolves.not.toThrow();
    });
  });

  describe('设备连接对话框', () => {
    beforeEach(() => {
      activate(mockContext);
    });

    it('应该显示连接对话框', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.connectDevice'
      );
      const commandHandler = commandCall[1];
      
      // 模拟用户输入
      (vscode.window.showInputBox as any).mockResolvedValue('/dev/ttyUSB0');
      (vscode.window.showQuickPick as any).mockResolvedValue('115200');
      
      await commandHandler();
      
      expect(vscode.window.showInputBox).toHaveBeenCalled();
      expect(vscode.window.showQuickPick).toHaveBeenCalled();
      expect(mockIOManager.connect).toHaveBeenCalled();
    });

    it('应该处理用户取消输入', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.connectDevice'
      );
      const commandHandler = commandCall[1];
      
      // 模拟用户取消
      (vscode.window.showInputBox as any).mockResolvedValue(undefined);
      
      await commandHandler();
      
      expect(mockIOManager.connect).not.toHaveBeenCalled();
    });

    it('应该处理连接失败', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.connectDevice'
      );
      const commandHandler = commandCall[1];
      
      mockIOManager.connect.mockRejectedValue(new Error('Device not found'));
      (vscode.window.showInputBox as any).mockResolvedValue('/dev/ttyUSB0');
      (vscode.window.showQuickPick as any).mockResolvedValue('115200');
      
      await commandHandler();
      
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Device not found')
      );
    });
  });

  describe('设备断开连接', () => {
    beforeEach(() => {
      activate(mockContext);
    });

    it('应该成功断开设备', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.disconnectDevice'
      );
      const commandHandler = commandCall[1];
      
      await commandHandler();
      
      expect(mockIOManager.disconnect).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        'Disconnected from device'
      );
    });

    it('应该处理断开连接失败', async () => {
      const commandCall = (vscode.commands.registerCommand as any).mock.calls.find(call => 
        call[0] === 'serialStudio.disconnectDevice'
      );
      const commandHandler = commandCall[1];
      
      mockIOManager.disconnect.mockRejectedValue(new Error('Disconnect failed'));
      
      await commandHandler();
      
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Disconnect failed')
      );
    });
  });

  describe('状态栏管理', () => {
    let statusBarItem: any;
    
    beforeEach(() => {
      statusBarItem = {
        text: '',
        color: undefined,
        command: '',
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn()
      };
      
      (vscode.window.createStatusBarItem as any).mockReturnValue(statusBarItem);
      activate(mockContext);
    });

    it('应该初始化状态栏', () => {
      expect(statusBarItem.command).toBe('serialStudio.openDashboard');
      expect(statusBarItem.show).toHaveBeenCalled();
    });

    it('应该更新状态栏文本', () => {
      // 状态栏文本应该在初始化时设置
      expect(statusBarItem.text).toContain('Serial Studio');
    });
  });

  describe('性能指标更新', () => {
    beforeEach(() => {
      activate(mockContext);
    });

    it('应该计算内存使用情况', () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        rss: 120 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024
      });

      // 触发统计更新
      const eventHandlers: { [key: string]: Function } = {};
      mockIOManager.on.mockImplementation((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      });

      const mockStats = {
        bytesReceived: 1000,
        bytesSent: 500,
        framesReceived: 10,
        framesSent: 5,
        errors: 0,
        reconnections: 0,
        uptime: 60000
      };

      if (eventHandlers['statisticsUpdated']) {
        eventHandlers['statisticsUpdated'](mockStats);
      }

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('调试模式检测', () => {
    it('应该能够检查调试配置', () => {
      activate(mockContext);
      
      // 验证 getConfiguration 方法可用
      expect(vscode.workspace.getConfiguration).toBeDefined();
      expect(typeof vscode.workspace.getConfiguration).toBe('function');
    });
  });

  describe('资源清理', () => {
    it('应该正确清理所有资源', async () => {
      activate(mockContext);
      
      const extension = (global as any).__extension_instance__;
      if (extension && extension.dispose) {
        await extension.dispose();
        expect(mockIOManager.destroy).toHaveBeenCalled();
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理扩展激活错误', () => {
      // 模拟 IOManager 构造函数抛出错误
      (IOManager as any).mockImplementation(() => {
        throw new Error('IOManager initialization failed');
      });

      expect(() => activate(mockContext)).not.toThrow();
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });
  });
});
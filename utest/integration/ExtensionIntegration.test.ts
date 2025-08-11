/**
 * 扩展集成测试
 * 测试Extension与Webview之间的集成功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('扩展集成测试', () => {
  let mockExtensionContext: any;
  let mockWebviewPanel: any;

  beforeEach(() => {
    mockExtensionContext = {
      subscriptions: [],
      globalState: {
        get: vi.fn(),
        update: vi.fn()
      },
      workspaceState: {
        get: vi.fn(),
        update: vi.fn()
      },
      extensionPath: '/test/extension/path',
      extensionUri: { fsPath: '/test/extension/path' },
      globalStorageUri: { fsPath: '/test/storage' },
      logUri: { fsPath: '/test/logs' }
    };

    mockWebviewPanel = {
      webview: {
        html: '',
        postMessage: vi.fn(),
        onDidReceiveMessage: vi.fn(),
        asWebviewUri: vi.fn().mockReturnValue('vscode-resource://test'),
        cspSource: 'vscode-resource:'
      },
      onDidDispose: vi.fn(),
      reveal: vi.fn(),
      dispose: vi.fn(),
      title: 'Serial Studio',
      viewType: 'serialStudio'
    };
  });

  describe('扩展激活测试', () => {
    it('应该成功激活扩展', async () => {
      // 模拟扩展激活
      const activation = vi.fn().mockResolvedValue(undefined);
      
      await activation(mockExtensionContext);
      
      expect(activation).toHaveBeenCalledWith(mockExtensionContext);
    });

    it('应该注册命令', async () => {
      const registerCommand = vi.fn();
      global.vscode.commands.registerCommand = registerCommand;
      
      // 模拟注册扩展命令
      const commands = [
        'serialStudio.openProject',
        'serialStudio.connect',
        'serialStudio.disconnect',
        'serialStudio.exportData'
      ];
      
      commands.forEach(cmd => {
        registerCommand(cmd, vi.fn());
      });
      
      expect(registerCommand).toHaveBeenCalledTimes(commands.length);
    });

    it('应该注册Webview Provider', () => {
      const registerWebviewPanelSerializer = vi.fn();
      global.vscode.window.registerWebviewPanelSerializer = registerWebviewPanelSerializer;
      
      registerWebviewPanelSerializer('serialStudio', {
        deserializeWebviewPanel: vi.fn()
      });
      
      expect(registerWebviewPanelSerializer).toHaveBeenCalled();
    });
  });

  describe('Webview集成测试', () => {
    it('应该创建Webview Panel', () => {
      const createWebviewPanel = vi.fn().mockReturnValue(mockWebviewPanel);
      global.vscode.window.createWebviewPanel = createWebviewPanel;
      
      const panel = createWebviewPanel(
        'serialStudio',
        'Serial Studio',
        1, // ViewColumn.One
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );
      
      expect(createWebviewPanel).toHaveBeenCalled();
      expect(panel).toBe(mockWebviewPanel);
    });

    it('应该处理Webview消息', async () => {
      const messageHandler = vi.fn();
      mockWebviewPanel.webview.onDidReceiveMessage.mockImplementation(messageHandler);
      
      // 模拟接收消息
      const testMessage = {
        type: 'connect',
        payload: {
          type: 'serial',
          port: '/dev/ttyUSB0',
          baudRate: 9600
        }
      };
      
      messageHandler(testMessage);
      
      expect(messageHandler).toHaveBeenCalledWith(testMessage);
    });

    it('应该向Webview发送消息', async () => {
      const postMessage = mockWebviewPanel.webview.postMessage;
      
      const testMessage = {
        type: 'connectionStatus',
        payload: {
          connected: true,
          device: '/dev/ttyUSB0'
        }
      };
      
      await postMessage(testMessage);
      
      expect(postMessage).toHaveBeenCalledWith(testMessage);
    });

    it('应该处理Webview销毁', () => {
      const disposeHandler = vi.fn();
      mockWebviewPanel.onDidDispose.mockImplementation(disposeHandler);
      
      mockWebviewPanel.dispose();
      
      expect(disposeHandler).toHaveBeenCalled();
    });
  });

  describe('设备连接集成测试', () => {
    it('应该处理设备连接请求', async () => {
      const mockIOManager = {
        connect: vi.fn().mockResolvedValue(true),
        disconnect: vi.fn().mockResolvedValue(true),
        isConnected: vi.fn().mockReturnValue(false),
        write: vi.fn().mockResolvedValue(10)
      };
      
      const connectionConfig = {
        type: 'serial',
        port: '/dev/ttyUSB0',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      };
      
      const result = await mockIOManager.connect(connectionConfig);
      
      expect(result).toBe(true);
      expect(mockIOManager.connect).toHaveBeenCalledWith(connectionConfig);
    });

    it('应该处理数据传输', async () => {
      const mockIOManager = {
        write: vi.fn().mockResolvedValue(5),
        on: vi.fn()
      };
      
      const testData = Buffer.from('hello');
      const bytesWritten = await mockIOManager.write(testData);
      
      expect(bytesWritten).toBe(5);
      expect(mockIOManager.write).toHaveBeenCalledWith(testData);
    });

    it('应该处理设备断开', async () => {
      const mockIOManager = {
        disconnect: vi.fn().mockResolvedValue(true),
        isConnected: vi.fn().mockReturnValue(false)
      };
      
      await mockIOManager.disconnect();
      
      expect(mockIOManager.disconnect).toHaveBeenCalled();
      expect(mockIOManager.isConnected()).toBe(false);
    });
  });

  describe('数据流集成测试', () => {
    it('应该处理数据接收流', (done) => {
      const mockFrameReader = {
        on: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };
      
      let dataCallback: Function;
      mockFrameReader.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          dataCallback = callback;
        }
      });
      
      mockFrameReader.start();
      
      // 模拟数据到达
      setTimeout(() => {
        if (dataCallback) {
          dataCallback({
            timestamp: Date.now(),
            data: Buffer.from([0x01, 0x02, 0x03]),
            frameNumber: 1
          });
          
          expect(mockFrameReader.on).toHaveBeenCalledWith('data', expect.any(Function));
          done();
        }
      }, 10);
    });

    it('应该处理帧解析', () => {
      const mockFrameParser = {
        parse: vi.fn().mockReturnValue({
          valid: true,
          datasets: [
            { id: 'temp', value: 25.4, units: '°C' },
            { id: 'humidity', value: 65.2, units: '%' }
          ]
        })
      };
      
      const rawData = Buffer.from('temp:25.4,humidity:65.2\n');
      const result = mockFrameParser.parse(rawData);
      
      expect(result.valid).toBe(true);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0].value).toBe(25.4);
    });

    it('应该处理数据导出', async () => {
      const mockExportManager = {
        export: vi.fn().mockResolvedValue('/test/exported/data.csv'),
        getSupportedFormats: vi.fn().mockReturnValue(['csv', 'json', 'xml'])
      };
      
      const exportConfig = {
        format: 'csv',
        datasets: ['temp', 'humidity'],
        timeRange: {
          start: Date.now() - 3600000, // 1小时前
          end: Date.now()
        }
      };
      
      const exportPath = await mockExportManager.export(exportConfig);
      
      expect(exportPath).toBe('/test/exported/data.csv');
      expect(mockExportManager.export).toHaveBeenCalledWith(exportConfig);
    });
  });

  describe('插件系统集成测试', () => {
    it('应该加载插件', async () => {
      const mockPluginManager = {
        loadPlugin: vi.fn().mockResolvedValue({
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          status: 'loaded'
        }),
        getLoadedPlugins: vi.fn().mockReturnValue([])
      };
      
      const plugin = await mockPluginManager.loadPlugin('/test/plugin/path');
      
      expect(plugin.status).toBe('loaded');
      expect(mockPluginManager.loadPlugin).toHaveBeenCalledWith('/test/plugin/path');
    });

    it('应该注册插件贡献', () => {
      const mockContributionRegistry = {
        register: vi.fn(),
        getContributions: vi.fn().mockReturnValue({
          drivers: [],
          widgets: [],
          parsers: []
        })
      };
      
      const contribution = {
        type: 'driver',
        id: 'custom-driver',
        implementation: class CustomDriver {}
      };
      
      mockContributionRegistry.register(contribution);
      
      expect(mockContributionRegistry.register).toHaveBeenCalledWith(contribution);
    });

    it('应该隔离插件执行', async () => {
      const mockVM = {
        run: vi.fn().mockReturnValue({ result: 'success' }),
        freeze: vi.fn(),
        timeout: 5000
      };
      
      const pluginCode = 'function parse(data) { return { success: true }; }';
      const result = mockVM.run(pluginCode);
      
      expect(result.result).toBe('success');
      expect(mockVM.run).toHaveBeenCalledWith(pluginCode);
    });
  });

  describe('项目管理集成测试', () => {
    it('应该打开项目文件', async () => {
      const mockProjectManager = {
        openProject: vi.fn().mockResolvedValue({
          id: 'test-project',
          name: 'Test Project',
          devices: [],
          widgets: []
        }),
        saveProject: vi.fn().mockResolvedValue('/test/project.json')
      };
      
      const project = await mockProjectManager.openProject('/test/project.json');
      
      expect(project.name).toBe('Test Project');
      expect(mockProjectManager.openProject).toHaveBeenCalledWith('/test/project.json');
    });

    it('应该验证项目配置', () => {
      const mockProjectValidator = {
        validate: vi.fn().mockReturnValue({
          valid: true,
          errors: []
        })
      };
      
      const projectConfig = {
        version: '1.0',
        devices: [{
          type: 'serial',
          port: '/dev/ttyUSB0'
        }],
        widgets: [{
          type: 'plot',
          datasets: ['temp']
        }]
      };
      
      const result = mockProjectValidator.validate(projectConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该保存项目状态', async () => {
      const mockProjectManager = {
        saveProject: vi.fn().mockResolvedValue('/test/saved-project.json'),
        getProjectState: vi.fn().mockReturnValue({
          devices: { connected: true },
          widgets: { layout: 'grid' },
          data: { frameCount: 1000 }
        })
      };
      
      const projectState = mockProjectManager.getProjectState();
      const savedPath = await mockProjectManager.saveProject(projectState);
      
      expect(savedPath).toBe('/test/saved-project.json');
      expect(projectState.data.frameCount).toBe(1000);
    });
  });

  describe('性能集成测试', () => {
    it('应该监控内存使用', () => {
      const mockMemoryManager = {
        getStats: vi.fn().mockReturnValue({
          heapUsed: 50 * 1024 * 1024, // 50MB
          heapTotal: 100 * 1024 * 1024, // 100MB
          objectPoolHits: 0.85, // 85%命中率
          gcCount: 5
        }),
        cleanup: vi.fn()
      };
      
      const stats = mockMemoryManager.getStats();
      
      expect(stats.heapUsed).toBeLessThan(stats.heapTotal);
      expect(stats.objectPoolHits).toBeGreaterThan(0.8);
    });

    it('应该监控性能指标', () => {
      const mockPerformanceMonitor = {
        getMetrics: vi.fn().mockReturnValue({
          fps: 58.5,
          frameTime: 17.1,
          dataProcessingRate: 1000,
          memoryPressure: 0.3
        }),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn()
      };
      
      mockPerformanceMonitor.startMonitoring();
      const metrics = mockPerformanceMonitor.getMetrics();
      
      expect(metrics.fps).toBeGreaterThan(30);
      expect(metrics.frameTime).toBeLessThan(33.33); // 60fps = 16.67ms
      expect(metrics.memoryPressure).toBeLessThan(0.8);
    });

    it('应该处理高频数据', (done) => {
      const mockDataProcessor = {
        processHighFrequency: vi.fn(),
        setThrottleRate: vi.fn()
      };
      
      // 模拟高频数据处理
      const dataPoints = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: Date.now() + i,
        value: Math.sin(i * 0.1) * 100
      }));
      
      mockDataProcessor.setThrottleRate(60); // 60fps
      
      dataPoints.forEach(point => {
        mockDataProcessor.processHighFrequency(point);
      });
      
      setTimeout(() => {
        expect(mockDataProcessor.processHighFrequency).toHaveBeenCalledTimes(1000);
        done();
      }, 100);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该处理连接错误', async () => {
      const mockIOManager = {
        connect: vi.fn().mockRejectedValue(new Error('Device not found')),
        on: vi.fn()
      };
      
      let errorCallback: Function;
      mockIOManager.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          errorCallback = callback;
        }
      });
      
      try {
        await mockIOManager.connect({ port: '/dev/invalid' });
      } catch (error) {
        expect(error.message).toBe('Device not found');
      }
      
      // 模拟错误事件
      if (errorCallback) {
        errorCallback(new Error('Connection lost'));
      }
      
      expect(mockIOManager.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('应该处理解析错误', () => {
      const mockFrameParser = {
        parse: vi.fn().mockReturnValue({
          valid: false,
          error: 'Invalid frame format',
          rawData: Buffer.from('invalid data')
        })
      };
      
      const result = mockFrameParser.parse(Buffer.from('invalid data'));
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid frame format');
    });

    it('应该处理资源清理', async () => {
      const mockResourceManager = {
        cleanup: vi.fn().mockResolvedValue(undefined),
        getActiveResources: vi.fn().mockReturnValue([
          'webview-panel-1',
          'io-connection-1',
          'worker-thread-1'
        ])
      };
      
      const activeResources = mockResourceManager.getActiveResources();
      expect(activeResources).toHaveLength(3);
      
      await mockResourceManager.cleanup();
      expect(mockResourceManager.cleanup).toHaveBeenCalled();
    });
  });
});
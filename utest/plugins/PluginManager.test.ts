/**
 * Serial-Studio VSCode 插件系统 - PluginManager 核心测试
 * 
 * 本测试文件实现了 PluginManager 的全面单元测试，覆盖：
 * - 插件发现和加载
 * - 插件激活和停用
 * - 贡献点管理
 * - 错误处理
 * - 生命周期管理
 * 
 * 基于 todo.md 中 P1-02 任务要求
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';

// Mock VSCode module
vi.mock('vscode', () => ({
  window: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    withProgress: vi.fn(),
    createOutputChannel: vi.fn().mockReturnValue({
      append: vi.fn(),
      appendLine: vi.fn(),
      clear: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    })
  },
  workspace: {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue({}),
      update: vi.fn().mockResolvedValue(undefined),
      has: vi.fn().mockReturnValue(true)
    }),
    onDidChangeConfiguration: vi.fn(),
    workspaceFolders: [{
      uri: { fsPath: '/test/workspace' },
      name: 'test-workspace',
      index: 0
    }],
    rootPath: '/test/workspace'
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn()
  },
  Uri: {
    file: vi.fn().mockImplementation((path: string) => ({
      scheme: 'file',
      path,
      fsPath: path
    })),
    parse: vi.fn()
  }
}));

import { PluginManager } from '@extension/plugins/PluginManager';
import { 
  PluginManifest, 
  ExtensionPoint, 
  PluginEvent,
  WidgetContribution,
  PluginActivationResult
} from '@extension/plugins/types';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  access: vi.fn(),
  readFile: vi.fn()
}));

/**
 * Mock Factory 扩展 - 创建插件系统相关的 Mock 对象
 */
class PluginMockFactory {
  /**
   * 创建 VSCode 扩展上下文 Mock
   */
  static createMockExtensionContext(): any {
    const mockUri = (path: string) => ({ fsPath: path, scheme: 'file', path });
    
    const mockContext = {
      subscriptions: [],
      workspaceState: {
        get: vi.fn(),
        update: vi.fn(),
        keys: vi.fn(() => [])
      },
      globalState: {
        get: vi.fn(),
        update: vi.fn(),
        keys: vi.fn(() => []),
        setKeysForSync: vi.fn()
      },
      extensionUri: mockUri('/mock/extension/path'),
      extensionPath: '/mock/extension/path',
      globalStorageUri: mockUri('/mock/global-storage'),
      storageUri: mockUri('/mock/storage'),
      logUri: mockUri('/mock/logs'),
      asAbsolutePath: vi.fn((relativePath: string) => `/mock/extension/path/${relativePath}`),
      environmentVariableCollection: {
        replace: vi.fn(),
        append: vi.fn(),
        prepend: vi.fn(),
        get: vi.fn(),
        forEach: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        persistent: true
      }
    };

    return mockContext;
  }

  /**
   * 创建插件清单 Mock
   */
  static createMockPluginManifest(overrides?: Partial<PluginManifest>): PluginManifest {
    return {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'Test plugin for unit testing',
      author: 'Test Author',
      license: 'MIT',
      engines: {
        vscode: '^1.70.0',
        serialStudio: '^1.0.0'
      },
      contributes: {
        widgets: [{
          id: 'test-widget',
          name: 'Test Widget',
          type: 'dataset',
          component: {},
          configSchema: { type: 'object' }
        }]
      },
      activationEvents: ['*'],
      main: './main.js',
      ...overrides
    };
  }

  /**
   * 创建插件模块 Mock
   */
  static createMockPluginModule() {
    return {
      activate: vi.fn(),
      deactivate: vi.fn(),
      default: {}
    };
  }

  /**
   * 创建 Widget 贡献 Mock
   */
  static createMockWidgetContribution(): WidgetContribution {
    return {
      id: 'mock-widget',
      name: 'Mock Widget',
      type: 'dataset',
      component: {},
      configSchema: { type: 'object' },
      supportedDataTypes: ['number', 'string']
    };
  }
}

describe('PluginManager', () => {
  let pluginManager: PluginManager;
  let mockExtensionContext: any;
  let mockFs: any;

  beforeEach(async () => {
    // 重置单例
    (PluginManager as any).instance = undefined;
    
    pluginManager = PluginManager.getInstance();
    mockExtensionContext = PluginMockFactory.createMockExtensionContext();
    mockFs = vi.mocked(fs);

    // 清除所有 mock 调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * 单例模式测试
   */
  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = PluginManager.getInstance();
      const instance2 = PluginManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('应该在多次调用时保持状态', () => {
      const instance1 = PluginManager.getInstance();
      const instance2 = PluginManager.getInstance();
      
      expect(instance1.getLoadedPlugins()).toStrictEqual(instance2.getLoadedPlugins());
    });
  });

  /**
   * 初始化测试
   */
  describe('初始化', () => {
    it('应该正确初始化插件管理器', async () => {
      // Mock 目录结构
      mockFs.readdir.mockResolvedValue([]);
      
      await pluginManager.initialize(mockExtensionContext);
      
      expect(mockExtensionContext.subscriptions).toHaveLength(1);
      // Note: VSCode window calls are mocked by the global setup
      // This test would check for information message in a real environment
    });

    it('应该发现并加载内置插件', async () => {
      // Mock 内置插件目录结构
      mockFs.readdir.mockResolvedValueOnce([
        { name: 'test-plugin', isDirectory: () => true }
      ] as any);
      mockFs.access.mockResolvedValue(undefined);
      
      // Mock 插件加载器 - 设置在初始化之前
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(PluginMockFactory.createMockPluginModule())
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;

      // 确保 loadPlugin 方法被正确mock
      const loadPluginSpy = vi.spyOn(pluginManager, 'loadPlugin').mockResolvedValue(true);

      await pluginManager.initialize(mockExtensionContext);

      // 验证loadPlugin被调用，路径应该是正确的
      expect(loadPluginSpy).toHaveBeenCalledWith('/mock/extension/path/plugins/test-plugin/plugin.json');
      expect(pluginManager.getLoadedPlugins()).toHaveLength(1);
      
      loadPluginSpy.mockRestore();
    });

    it('应该处理没有插件目录的情况', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));
      
      await expect(pluginManager.initialize(mockExtensionContext)).resolves.not.toThrow();
    });

    it('应该防止重复初始化', async () => {
      mockFs.readdir.mockResolvedValue([]);
      
      // Mock VSCode window.showInformationMessage
      const showInfoSpy = vi.spyOn(vscode.window, 'showInformationMessage');
      
      await pluginManager.initialize(mockExtensionContext);
      await pluginManager.initialize(mockExtensionContext);
      
      // 应该只调用一次信息提示
      expect(showInfoSpy).toHaveBeenCalledTimes(1);
      
      showInfoSpy.mockRestore();
    });
  });

  /**
   * 插件加载测试
   */
  describe('插件加载', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);
    });

    it('应该成功加载有效的插件', async () => {
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;

      const result = await pluginManager.loadPlugin('/path/to/plugin/plugin.json');

      expect(result).toBe(true);
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(true);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(1);
    });

    it('应该拒绝重复加载同一插件', async () => {
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;

      // 第一次加载
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      
      // 第二次加载应该失败
      const result = await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      
      expect(result).toBe(false);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(1);
    });

    it('应该处理插件加载失败', async () => {
      const mockPluginLoader = {
        loadManifest: vi.fn().mockRejectedValue(new Error('Invalid manifest')),
        validateManifest: vi.fn(),
        loadPluginModule: vi.fn()
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;

      const result = await pluginManager.loadPlugin('/path/to/invalid/plugin.json');

      expect(result).toBe(false);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(0);
    });
  });

  /**
   * 插件激活测试
   */
  describe('插件激活', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      // 预加载一个测试插件
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
    });

    it('应该成功激活已加载的插件', async () => {
      const result = await pluginManager.activatePlugin('test-plugin');

      expect(result.success).toBe(true);
      expect(result.exports).toBeDefined();
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(true);
    });

    it('应该调用插件的激活函数', async () => {
      const plugin = pluginManager.getPlugin('test-plugin');
      const activateSpy = plugin?.activate as any;

      await pluginManager.activatePlugin('test-plugin');

      expect(activateSpy).toHaveBeenCalledWith(plugin?.context);
    });

    it('应该处理插件激活函数是 Promise 的情况', async () => {
      const plugin = pluginManager.getPlugin('test-plugin');
      if (plugin?.activate) {
        (plugin.activate as any).mockResolvedValue(undefined);
      }

      const result = await pluginManager.activatePlugin('test-plugin');

      expect(result.success).toBe(true);
    });

    it('应该拒绝激活不存在的插件', async () => {
      const result = await pluginManager.activatePlugin('non-existent-plugin');

      expect(result.success).toBe(false);
      expect(result.error).toContain('is not loaded');
    });

    it('应该处理重复激活', async () => {
      await pluginManager.activatePlugin('test-plugin');
      const result = await pluginManager.activatePlugin('test-plugin');

      expect(result.success).toBe(true);
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(true);
    });

    it('应该处理插件激活失败', async () => {
      const plugin = pluginManager.getPlugin('test-plugin');
      if (plugin?.activate) {
        (plugin.activate as any).mockRejectedValue(new Error('Activation failed'));
      }

      const result = await pluginManager.activatePlugin('test-plugin');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Activation failed');
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(false);
    });
  });

  /**
   * 插件停用测试
   */
  describe('插件停用', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      // 预加载并激活一个测试插件
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      await pluginManager.activatePlugin('test-plugin');
    });

    it('应该成功停用已激活的插件', async () => {
      const result = await pluginManager.deactivatePlugin('test-plugin');

      expect(result).toBe(true);
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(false);
    });

    it('应该调用插件的停用函数', async () => {
      const plugin = pluginManager.getPlugin('test-plugin');
      const deactivateSpy = plugin?.deactivate as any;

      await pluginManager.deactivatePlugin('test-plugin');

      expect(deactivateSpy).toHaveBeenCalled();
    });

    it('应该清理插件上下文订阅', async () => {
      const plugin = pluginManager.getPlugin('test-plugin');
      const mockDisposable = { dispose: vi.fn() };
      plugin?.context.subscriptions.push(mockDisposable);

      await pluginManager.deactivatePlugin('test-plugin');

      expect(mockDisposable.dispose).toHaveBeenCalled();
    });

    it('应该处理停用不存在或未激活的插件', async () => {
      const result1 = await pluginManager.deactivatePlugin('non-existent');
      const result2 = await pluginManager.deactivatePlugin('test-plugin');
      const result3 = await pluginManager.deactivatePlugin('test-plugin'); // 重复停用

      expect(result1).toBe(false);
      expect(result2).toBe(true);
      expect(result3).toBe(false);
    });

    it('应该处理插件停用失败', async () => {
      const plugin = pluginManager.getPlugin('test-plugin');
      if (plugin?.deactivate) {
        (plugin.deactivate as any).mockRejectedValue(new Error('Deactivation failed'));
      }

      const result = await pluginManager.deactivatePlugin('test-plugin');

      expect(result).toBe(false);
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(true);
    });
  });

  /**
   * 插件卸载测试
   */
  describe('插件卸载', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
    });

    it('应该成功卸载已加载的插件', async () => {
      const result = await pluginManager.unloadPlugin('test-plugin');

      expect(result).toBe(true);
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(false);
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });

    it('应该在卸载前先停用插件', async () => {
      await pluginManager.activatePlugin('test-plugin');
      
      const result = await pluginManager.unloadPlugin('test-plugin');

      expect(result).toBe(true);
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(false);
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(false);
    });

    it('应该处理卸载不存在的插件', async () => {
      const result = await pluginManager.unloadPlugin('non-existent');

      expect(result).toBe(false);
    });
  });

  /**
   * 插件重载测试
   */
  describe('插件重载', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      
      // 确保插件加载成功
      const result = await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      expect(result).toBe(true);
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(true);
    });

    it('应该成功重载插件', async () => {
      // 验证插件已加载
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(true);
      
      const result = await pluginManager.reloadPlugin('test-plugin');

      expect(result).toBe(true);
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(true);
    });

    it('应该处理重载不存在的插件', async () => {
      const result = await pluginManager.reloadPlugin('non-existent');

      expect(result).toBe(false);
    });
  });

  /**
   * 贡献点管理测试
   */
  describe('贡献点管理', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);
    });

    it('应该正确注册插件贡献', async () => {
      const contributionRegistry = pluginManager.getContributionRegistry();
      const mockContribution = PluginMockFactory.createMockWidgetContribution();
      
      contributionRegistry.register(
        ExtensionPoint.VISUALIZATION_WIDGETS,
        mockContribution,
        'test-plugin'
      );

      const contributions = contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(contributions).toContain(mockContribution);
    });

    it('应该在插件激活时注册贡献', async () => {
      const mockManifest = PluginMockFactory.createMockPluginManifest({
        contributes: {
          widgets: [PluginMockFactory.createMockWidgetContribution()]
        }
      });
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      await pluginManager.activatePlugin('test-plugin');

      const contributionRegistry = pluginManager.getContributionRegistry();
      const contributions = contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(contributions).toHaveLength(1);
    });

    it('应该在插件停用时清理贡献', async () => {
      const mockManifest = PluginMockFactory.createMockPluginManifest({
        contributes: {
          widgets: [PluginMockFactory.createMockWidgetContribution()]
        }
      });
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      await pluginManager.activatePlugin('test-plugin');
      
      // 验证贡献已注册
      const contributionRegistry = pluginManager.getContributionRegistry();
      let contributions = contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(contributions).toHaveLength(1);

      // 停用插件
      await pluginManager.deactivatePlugin('test-plugin');

      // 验证贡献已清理
      contributions = contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(contributions).toHaveLength(0);
    });
  });

  /**
   * 批量操作测试
   */
  describe('批量操作', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      // 创建mock插件加载器，支持多个插件manifest
      const mockManifests = new Map();
      for (let i = 1; i <= 3; i++) {
        mockManifests.set(`/path/to/plugin-${i}/plugin.json`, PluginMockFactory.createMockPluginManifest({
          id: `test-plugin-${i}`,
          name: `Test Plugin ${i}`
        }));
      }

      const mockPluginLoader = {
        loadManifest: vi.fn().mockImplementation((path: string) => {
          return Promise.resolve(mockManifests.get(path));
        }),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(PluginMockFactory.createMockPluginModule())
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;

      // 加载多个测试插件
      for (let i = 1; i <= 3; i++) {
        const result = await pluginManager.loadPlugin(`/path/to/plugin-${i}/plugin.json`);
        expect(result).toBe(true);
        await pluginManager.activatePlugin(`test-plugin-${i}`);
      }
    });

    it('应该正确获取所有加载的插件', () => {
      const loadedPlugins = pluginManager.getLoadedPlugins();
      expect(loadedPlugins).toHaveLength(3);
      
      const pluginIds = loadedPlugins.map(p => p.manifest.id);
      expect(pluginIds).toContain('test-plugin-1');
      expect(pluginIds).toContain('test-plugin-2');
      expect(pluginIds).toContain('test-plugin-3');
    });

    it('应该正确获取所有激活的插件', () => {
      const activatedPlugins = pluginManager.getActivatedPlugins();
      expect(activatedPlugins).toHaveLength(3);
    });

    it('应该成功停用所有插件', async () => {
      await pluginManager.deactivateAllPlugins();

      expect(pluginManager.getActivatedPlugins()).toHaveLength(0);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(3); // 仍然加载，只是未激活
    });
  });

  /**
   * 统计信息测试
   */
  describe('统计信息', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      const mockManifest = PluginMockFactory.createMockPluginManifest({
        contributes: {
          widgets: [PluginMockFactory.createMockWidgetContribution()]
        }
      });
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
    });

    it('应该正确报告插件统计信息', () => {
      const stats = pluginManager.getStatistics();

      expect(stats.totalPlugins).toBe(1);
      expect(stats.activatedPlugins).toBe(0);
    });

    it('应该在插件激活后更新统计信息', async () => {
      await pluginManager.activatePlugin('test-plugin');
      
      const stats = pluginManager.getStatistics();

      expect(stats.totalPlugins).toBe(1);
      expect(stats.activatedPlugins).toBe(1);
      expect(stats.totalContributions).toBeGreaterThan(0);
    });
  });

  /**
   * 错误处理测试
   */
  describe('错误处理', () => {
    beforeEach(async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);
    });

    it('应该处理插件事件错误', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 触发插件错误事件
      const pluginManager = PluginManager.getInstance();
      (pluginManager as any).handlePluginError({
        pluginId: 'test-plugin',
        event: PluginEvent.ERROR,
        error: new Error('Test error')
      });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Plugin error in test-plugin'),
        expect.any(Error)
      );
      // Note: VSCode window calls are mocked by the global setup
      
      errorSpy.mockRestore();
    });

    it('应该在插件激活失败时发出错误事件', async () => {
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      // 使激活函数抛出错误
      mockModule.activate.mockRejectedValue(new Error('Activation error'));
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');

      const result = await pluginManager.activatePlugin('test-plugin');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Activation error');
    });
  });

  /**
   * 生命周期管理测试
   */
  describe('生命周期管理', () => {
    it('应该在扩展停用时清理所有插件', async () => {
      mockFs.readdir.mockResolvedValue([]);
      await pluginManager.initialize(mockExtensionContext);

      // 模拟有激活的插件
      const mockManifest = PluginMockFactory.createMockPluginManifest();
      const mockModule = PluginMockFactory.createMockPluginModule();
      
      const mockPluginLoader = {
        loadManifest: vi.fn().mockResolvedValue(mockManifest),
        validateManifest: vi.fn().mockResolvedValue(undefined),
        loadPluginModule: vi.fn().mockResolvedValue(mockModule)
      };
      
      (pluginManager as any).pluginLoader = mockPluginLoader;
      await pluginManager.loadPlugin('/path/to/plugin/plugin.json');
      await pluginManager.activatePlugin('test-plugin');

      // 触发扩展停用清理
      const disposable = mockExtensionContext.subscriptions[0];
      if (disposable && typeof disposable.dispose === 'function') {
        await disposable.dispose();
      }

      expect(pluginManager.getActivatedPlugins()).toHaveLength(0);
    });
  });
});
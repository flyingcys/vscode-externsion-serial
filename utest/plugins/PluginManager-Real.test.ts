/**
 * PluginManager真实代码测试
 * 
 * 测试extension/plugins/PluginManager.ts的真实实现，
 * 重点覆盖核心功能和边界情况，追求高覆盖率
 */

import { describe, test, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PluginManager, PluginStatistics } from '../../src/extension/plugins/PluginManager';
import { 
  PluginManifest, 
  PluginInstance, 
  PluginActivationResult,
  ExtensionPoint,
  PluginEvent
} from '../../src/extension/plugins/types';
import { ContributionRegistry } from '../../src/extension/plugins/ContributionRegistry';
import { PluginLoader } from '../../src/extension/plugins/PluginLoader';

// 模拟vscode
vi.mock('vscode', () => ({
  window: {
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn()
  }
}));

// 模拟文件系统
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  access: vi.fn()
}));

// 模拟依赖模块
vi.mock('../../src/extension/plugins/ContributionRegistry', () => {
  const mockContributionRegistry = {
    getInstance: vi.fn(() => mockContributionRegistry),
    addEventListener: vi.fn(),
    register: vi.fn(),
    unregisterPlugin: vi.fn(),
    getStatistics: vi.fn(() => ({
      totalContributions: 5,
      contributionsByExtensionPoint: {
        [ExtensionPoint.COMMUNICATION_DRIVERS]: 1,
        [ExtensionPoint.VISUALIZATION_WIDGETS]: 2,
        [ExtensionPoint.DATA_PARSERS]: 2
      }
    })),
    emitEvent: vi.fn()
  };
  
  return {
    ContributionRegistry: mockContributionRegistry
  };
});

vi.mock('../../src/extension/plugins/PluginLoader', () => {
  const mockPluginLoader = {
    loadManifest: vi.fn(),
    validateManifest: vi.fn(),
    loadPluginModule: vi.fn()
  };
  
  return {
    PluginLoader: vi.fn(() => mockPluginLoader)
  };
});

vi.mock('../../src/extension/plugins/PluginContext', () => ({
  PluginContextImpl: vi.fn().mockImplementation((manifest: PluginManifest) => ({
    manifest,
    subscriptions: []
  }))
}));

// 测试辅助工具类
class PluginTestHelper {
  static createMockExtensionContext() {
    return {
      subscriptions: [],
      extensionPath: '/test/extension',
      globalStorageUri: {
        fsPath: '/test/global'
      }
    };
  }

  static createMockPluginManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
    return {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author',
      publisher: 'Test Publisher',
      main: 'index.js',
      engines: {
        'serial-studio': '^1.0.0'
      },
      activationEvents: ['*'],
      contributes: {
        widgets: [{
          id: 'test-widget',
          title: 'Test Widget',
          description: 'A test widget',
          icon: 'test-icon',
          component: 'TestWidget'
        }]
      },
      ...overrides
    };
  }

  static createMockPluginModule(overrides = {}) {
    return {
      activate: vi.fn().mockResolvedValue(undefined),
      deactivate: vi.fn().mockResolvedValue(undefined),
      ...overrides
    };
  }
}

describe('PluginManager真实代码测试', () => {
  let pluginManager: PluginManager;
  let mockExtensionContext: any;
  let mockPluginLoader: any;
  let mockContributionRegistry: any;

  beforeEach(() => {
    // 重置所有的mock
    vi.clearAllMocks();
    
    // 获取单例实例
    pluginManager = PluginManager.getInstance();
    
    // 创建测试上下文
    mockExtensionContext = PluginTestHelper.createMockExtensionContext();
    
    // 获取mock实例
    mockPluginLoader = new (PluginLoader as any)();
    mockContributionRegistry = ContributionRegistry.getInstance();
  });

  afterEach(async () => {
    // 清理所有插件
    await pluginManager.deactivateAllPlugins();
    
    // 重置单例状态（通过反射访问私有属性）
    (pluginManager as any).initializationComplete = false;
    (pluginManager as any).loadedPlugins.clear();
    (pluginManager as any).activatedPlugins.clear();
    (pluginManager as any).pluginPaths.clear();
  });

  describe('单例模式测试', () => {
    test('应该返回同一个实例', () => {
      const instance1 = PluginManager.getInstance();
      const instance2 = PluginManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(PluginManager);
    });
    
    test('应该正确初始化内部组件', () => {
      expect(mockContributionRegistry.addEventListener).toHaveBeenCalledWith(
        PluginEvent.ERROR,
        expect.any(Function)
      );
    });
  });

  describe('初始化流程测试', () => {
    test('应该成功完成初始化', async () => {
      const fsMock = fs as any;
      fsMock.readdir.mockResolvedValue([]);

      await pluginManager.initialize(mockExtensionContext);
      
      expect(mockExtensionContext.subscriptions).toHaveLength(1);
      expect((pluginManager as any).initializationComplete).toBe(true);
    });
    
    test('应该防止重复初始化', async () => {
      const fsMock = fs as any;
      fsMock.readdir.mockResolvedValue([]);
      
      await pluginManager.initialize(mockExtensionContext);
      await pluginManager.initialize(mockExtensionContext);
      
      // 第二次初始化应该直接返回
      expect((pluginManager as any).extensionContext).toBe(mockExtensionContext);
    });
    
    test('应该处理插件目录不存在的情况', async () => {
      const fsMock = fs as any;
      fsMock.readdir.mockRejectedValue(new Error('ENOENT: no such file or directory'));
      
      await expect(pluginManager.initialize(mockExtensionContext))
        .resolves.not.toThrow();
    });
  });

  describe('插件加载测试', () => {
    beforeEach(() => {
      // 设置默认的mock返回值
      mockPluginLoader.loadManifest.mockResolvedValue(
        PluginTestHelper.createMockPluginManifest()
      );
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
    });

    test('应该成功加载有效插件', async () => {
      const manifestPath = '/test/plugin.json';
      
      const result = await pluginManager.loadPlugin(manifestPath);
      
      expect(result).toBe(true);
      expect(mockPluginLoader.loadManifest).toHaveBeenCalledWith(manifestPath);
      expect(mockPluginLoader.validateManifest).toHaveBeenCalled();
      expect(mockPluginLoader.loadPluginModule).toHaveBeenCalled();
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(true);
    });
    
    test('应该拒绝无效的插件路径', async () => {
      const result1 = await pluginManager.loadPlugin('');
      const result2 = await pluginManager.loadPlugin(null as any);
      const result3 = await pluginManager.loadPlugin(undefined as any);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
    
    test('应该拒绝重复加载同一插件', async () => {
      const manifestPath = '/test/plugin.json';
      
      // 第一次加载成功
      const result1 = await pluginManager.loadPlugin(manifestPath);
      expect(result1).toBe(true);
      
      // 第二次加载应该失败
      const result2 = await pluginManager.loadPlugin(manifestPath);
      expect(result2).toBe(false);
    });
    
    test('应该处理插件清单加载失败', async () => {
      mockPluginLoader.loadManifest.mockRejectedValue(new Error('Manifest load failed'));
      
      const result = await pluginManager.loadPlugin('/test/plugin.json');
      
      expect(result).toBe(false);
      expect(mockContributionRegistry.emitEvent).toHaveBeenCalledWith(
        PluginEvent.ERROR,
        expect.objectContaining({
          pluginId: 'unknown',
          event: PluginEvent.ERROR,
          error: expect.any(Error)
        })
      );
    });
    
    test('应该处理插件模块加载失败', async () => {
      mockPluginLoader.loadPluginModule.mockRejectedValue(new Error('Module load failed'));
      
      const result = await pluginManager.loadPlugin('/test/plugin.json');
      
      expect(result).toBe(false);
    });
  });

  describe('插件激活测试', () => {
    beforeEach(async () => {
      // 预加载一个测试插件
      mockPluginLoader.loadManifest.mockResolvedValue(
        PluginTestHelper.createMockPluginManifest()
      );
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin.json');
    });

    test('应该成功激活已加载的插件', async () => {
      const result = await pluginManager.activatePlugin('test-plugin');
      
      expect(result.success).toBe(true);
      expect(result.exports).toBeDefined();
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(true);
      
      // 验证activate函数被调用
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      expect(pluginInstance?.activate).toHaveBeenCalled();
    });
    
    test('应该处理Promise形式的激活函数', async () => {
      const asyncActivate = vi.fn().mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue({
        activate: asyncActivate,
        deactivate: vi.fn()
      });
      
      await pluginManager.loadPlugin('/test/async-plugin.json');
      const result = await pluginManager.activatePlugin('test-plugin');
      
      expect(result.success).toBe(true);
      expect(asyncActivate).toHaveBeenCalled();
    });
    
    test('应该处理没有激活函数的插件', async () => {
      mockPluginLoader.loadPluginModule.mockResolvedValue({
        // 没有activate函数
        deactivate: vi.fn()
      });
      
      await pluginManager.loadPlugin('/test/no-activate-plugin.json');
      const result = await pluginManager.activatePlugin('test-plugin');
      
      expect(result.success).toBe(true);
    });
    
    test('应该拒绝激活未加载的插件', async () => {
      const result = await pluginManager.activatePlugin('non-existent-plugin');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('is not loaded');
    });
    
    test('应该处理重复激活', async () => {
      await pluginManager.activatePlugin('test-plugin');
      const result = await pluginManager.activatePlugin('test-plugin');
      
      expect(result.success).toBe(true);
      // activate函数应该只被调用一次
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      expect(pluginInstance?.activate).toHaveBeenCalledTimes(1);
    });
    
    test('应该处理插件激活失败', async () => {
      const failingActivate = vi.fn().mockRejectedValue(new Error('Activation failed'));
      mockPluginLoader.loadPluginModule.mockResolvedValue({
        activate: failingActivate,
        deactivate: vi.fn()
      });
      
      await pluginManager.loadPlugin('/test/failing-plugin.json');
      const result = await pluginManager.activatePlugin('test-plugin');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Activation failed');
      expect(mockContributionRegistry.emitEvent).toHaveBeenCalledWith(
        PluginEvent.ERROR,
        expect.objectContaining({
          pluginId: 'test-plugin',
          event: PluginEvent.ERROR,
          error: expect.any(Error)
        })
      );
    });
  });

  describe('插件停用测试', () => {
    beforeEach(async () => {
      // 预加载并激活一个测试插件
      mockPluginLoader.loadManifest.mockResolvedValue(
        PluginTestHelper.createMockPluginManifest()
      );
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin.json');
      await pluginManager.activatePlugin('test-plugin');
    });

    test('应该成功停用已激活的插件', async () => {
      const result = await pluginManager.deactivatePlugin('test-plugin');
      
      expect(result).toBe(true);
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(false);
      expect(mockContributionRegistry.unregisterPlugin).toHaveBeenCalledWith('test-plugin');
      
      // 验证deactivate函数被调用
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      expect(pluginInstance?.deactivate).toHaveBeenCalled();
    });
    
    test('应该处理Promise形式的停用函数', async () => {
      const asyncDeactivate = vi.fn().mockResolvedValue(undefined);
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      pluginInstance!.deactivate = asyncDeactivate;
      
      const result = await pluginManager.deactivatePlugin('test-plugin');
      
      expect(result).toBe(true);
      expect(asyncDeactivate).toHaveBeenCalled();
    });
    
    test('应该处理没有停用函数的插件', async () => {
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      pluginInstance!.deactivate = undefined;
      
      const result = await pluginManager.deactivatePlugin('test-plugin');
      
      expect(result).toBe(true);
    });
    
    test('应该清理插件上下文订阅', async () => {
      const mockDisposable = { dispose: vi.fn() };
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      pluginInstance!.context.subscriptions.push(mockDisposable);
      
      await pluginManager.deactivatePlugin('test-plugin');
      
      expect(mockDisposable.dispose).toHaveBeenCalled();
    });
    
    test('应该处理未加载或未激活的插件', async () => {
      const result1 = await pluginManager.deactivatePlugin('non-existent-plugin');
      expect(result1).toBe(false);
      
      // 停用已停用的插件
      await pluginManager.deactivatePlugin('test-plugin');
      const result2 = await pluginManager.deactivatePlugin('test-plugin');
      expect(result2).toBe(false);
    });
    
    test('应该处理插件停用失败', async () => {
      const failingDeactivate = vi.fn().mockRejectedValue(new Error('Deactivation failed'));
      const pluginInstance = pluginManager.getPlugin('test-plugin');
      pluginInstance!.deactivate = failingDeactivate;
      
      const result = await pluginManager.deactivatePlugin('test-plugin');
      
      expect(result).toBe(false);
      expect(mockContributionRegistry.emitEvent).toHaveBeenCalledWith(
        PluginEvent.ERROR,
        expect.objectContaining({
          pluginId: 'test-plugin',
          event: PluginEvent.ERROR,
          error: expect.any(Error)
        })
      );
    });
  });

  describe('插件卸载测试', () => {
    beforeEach(async () => {
      // 预加载并激活一个测试插件
      mockPluginLoader.loadManifest.mockResolvedValue(
        PluginTestHelper.createMockPluginManifest()
      );
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin.json');
      await pluginManager.activatePlugin('test-plugin');
    });

    test('应该成功卸载插件', async () => {
      const result = await pluginManager.unloadPlugin('test-plugin');
      
      expect(result).toBe(true);
      expect(pluginManager.isPluginLoaded('test-plugin')).toBe(false);
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(false);
    });
    
    test('应该在卸载前自动停用插件', async () => {
      expect(pluginManager.isPluginActivated('test-plugin')).toBe(true);
      
      await pluginManager.unloadPlugin('test-plugin');
      
      expect(mockContributionRegistry.unregisterPlugin).toHaveBeenCalledWith('test-plugin');
    });
    
    test('应该处理未加载的插件', async () => {
      const result = await pluginManager.unloadPlugin('non-existent-plugin');
      
      expect(result).toBe(false);
    });
  });

  describe('插件重载测试', () => {
    beforeEach(async () => {
      mockPluginLoader.loadManifest.mockResolvedValue(
        PluginTestHelper.createMockPluginManifest()
      );
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin.json');
    });

    test('应该成功重载插件', async () => {
      const result = await pluginManager.reloadPlugin('test-plugin');
      
      expect(result).toBe(true);
      expect(mockPluginLoader.loadManifest).toHaveBeenCalledTimes(2); // 初始加载 + 重载
    });
    
    test('应该处理未记录路径的插件', async () => {
      const result = await pluginManager.reloadPlugin('non-existent-plugin');
      
      expect(result).toBe(false);
    });
  });

  describe('插件查询功能测试', () => {
    beforeEach(async () => {
      // 加载多个测试插件
      mockPluginLoader.loadManifest
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-1' }))
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-2' }));
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin1.json');
      await pluginManager.loadPlugin('/test/plugin2.json');
      await pluginManager.activatePlugin('plugin-1');
    });

    test('应该正确获取加载的插件', () => {
      const plugin = pluginManager.getPlugin('plugin-1');
      
      expect(plugin).toBeDefined();
      expect(plugin?.manifest.id).toBe('plugin-1');
    });
    
    test('应该返回所有加载的插件', () => {
      const loadedPlugins = pluginManager.getLoadedPlugins();
      
      expect(loadedPlugins).toHaveLength(2);
      expect(loadedPlugins.map(p => p.manifest.id)).toContain('plugin-1');
      expect(loadedPlugins.map(p => p.manifest.id)).toContain('plugin-2');
    });
    
    test('应该返回激活的插件', () => {
      const activatedPlugins = pluginManager.getActivatedPlugins();
      
      expect(activatedPlugins).toHaveLength(1);
      expect(activatedPlugins[0].manifest.id).toBe('plugin-1');
    });
    
    test('应该正确检查插件状态', () => {
      expect(pluginManager.isPluginLoaded('plugin-1')).toBe(true);
      expect(pluginManager.isPluginLoaded('non-existent')).toBe(false);
      
      expect(pluginManager.isPluginActivated('plugin-1')).toBe(true);
      expect(pluginManager.isPluginActivated('plugin-2')).toBe(false);
    });
  });

  describe('贡献点管理测试', () => {
    test('应该提供ContributionRegistry访问', () => {
      const registry = pluginManager.getContributionRegistry();
      
      expect(registry).toBe(mockContributionRegistry);
    });
    
    test('应该正确注册各种贡献点', async () => {
      const comprehensiveManifest = PluginTestHelper.createMockPluginManifest({
        contributes: {
          drivers: [{ id: 'test-driver', name: 'Test Driver' }],
          parsers: [{ id: 'test-parser', name: 'Test Parser' }],
          validators: [{ id: 'test-validator', name: 'Test Validator' }],
          transformers: [{ id: 'test-transformer', name: 'Test Transformer' }],
          widgets: [{ id: 'test-widget', title: 'Test Widget', description: 'Test', icon: 'test', component: 'Test' }],
          renderers: [{ id: 'test-renderer', name: 'Test Renderer' }],
          exportFormats: [{ id: 'test-format', name: 'Test Format' }],
          exportProcessors: [{ id: 'test-processor', name: 'Test Processor' }],
          menus: [{ id: 'test-menu', title: 'Test Menu' }],
          toolbars: [{ id: 'test-toolbar', title: 'Test Toolbar' }],
          settings: [{ id: 'test-settings', title: 'Test Settings' }],
          themes: [{ id: 'test-theme', name: 'Test Theme' }],
          iconThemes: [{ id: 'test-icon-theme', name: 'Test Icon Theme' }],
          debugTools: [{ id: 'test-debug', name: 'Test Debug Tool' }],
          analysisTools: [{ id: 'test-analysis', name: 'Test Analysis Tool' }]
        }
      });
      
      mockPluginLoader.loadManifest.mockResolvedValue(comprehensiveManifest);
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/comprehensive-plugin.json');
      await pluginManager.activatePlugin('test-plugin');
      
      // 验证所有贡献点都被注册
      expect(mockContributionRegistry.register).toHaveBeenCalledTimes(15);
      expect(mockContributionRegistry.register).toHaveBeenCalledWith(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        expect.any(Object),
        'test-plugin'
      );
    });
  });

  describe('统计信息测试', () => {
    beforeEach(async () => {
      // 加载并激活多个插件用于统计测试
      mockPluginLoader.loadManifest
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-1' }))
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-2' }));
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin1.json');
      await pluginManager.loadPlugin('/test/plugin2.json');
      await pluginManager.activatePlugin('plugin-1');
    });

    test('应该正确报告插件统计信息', () => {
      const stats: PluginStatistics = pluginManager.getStatistics();
      
      expect(stats.totalPlugins).toBe(2);
      expect(stats.activatedPlugins).toBe(1);
      expect(stats.totalContributions).toBe(5);
      expect(stats.contributionsByExtensionPoint).toBeDefined();
    });
  });

  describe('批量操作测试', () => {
    beforeEach(async () => {
      // 加载并激活多个插件
      mockPluginLoader.loadManifest
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-1' }))
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-2' }))
        .mockResolvedValueOnce(PluginTestHelper.createMockPluginManifest({ id: 'plugin-3' }));
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      await pluginManager.loadPlugin('/test/plugin1.json');
      await pluginManager.loadPlugin('/test/plugin2.json');
      await pluginManager.loadPlugin('/test/plugin3.json');
      await pluginManager.activatePlugin('plugin-1');
      await pluginManager.activatePlugin('plugin-2');
      await pluginManager.activatePlugin('plugin-3');
    });

    test('应该成功停用所有插件', async () => {
      expect(pluginManager.getActivatedPlugins()).toHaveLength(3);
      
      await pluginManager.deactivateAllPlugins();
      
      expect(pluginManager.getActivatedPlugins()).toHaveLength(0);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理插件错误事件', () => {
      // 直接调用私有方法测试错误处理
      const errorData = {
        pluginId: 'test-plugin',
        event: PluginEvent.ERROR,
        error: new Error('Test error')
      };
      
      // 通过反射调用私有方法
      (pluginManager as any).handlePluginError(errorData);
      
      // 验证错误被正确处理（这里主要测试不抛出异常）
      expect(true).toBe(true);
    });
  });

  describe('插件发现测试', () => {
    beforeEach(async () => {
      await pluginManager.initialize(mockExtensionContext);
    });

    test('应该处理插件目录发现', async () => {
      const fsMock = fs as any;
      
      // 模拟文件系统结构
      fsMock.readdir.mockResolvedValueOnce([
        { name: 'plugin1', isDirectory: () => true },
        { name: 'plugin2', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false }
      ]);
      
      fsMock.access
        .mockResolvedValueOnce(undefined) // plugin1/plugin.json exists
        .mockRejectedValueOnce(new Error('ENOENT')); // plugin2/plugin.json doesn't exist
      
      mockPluginLoader.loadManifest.mockResolvedValue(
        PluginTestHelper.createMockPluginManifest()
      );
      mockPluginLoader.validateManifest.mockResolvedValue(undefined);
      mockPluginLoader.loadPluginModule.mockResolvedValue(
        PluginTestHelper.createMockPluginModule()
      );
      
      // 调用私有方法进行测试
      await (pluginManager as any).discoverPluginsInDirectory('/test/plugins');
      
      // 验证只有存在manifest的插件被加载
      expect(mockPluginLoader.loadManifest).toHaveBeenCalledTimes(1);
    });
  });
});
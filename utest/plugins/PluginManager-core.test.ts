/**
 * PluginManager 核心功能测试
 * 
 * 快速覆盖核心API - 专注100%覆盖率目标
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PluginManager } from '../../src/extension/plugins/PluginManager';
import { PhysicalPluginMockManager } from '../mocks/physical-plugin-mock';
import { PluginManifestFactory } from '../mocks/plugins-mock-factory';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录（ES模块兼容）
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock VSCode extension context
const mockExtensionContext = {
  subscriptions: [],
  workspaceState: {
    get: vi.fn(),
    update: vi.fn()
  },
  globalState: {
    get: vi.fn(),
    update: vi.fn()
  },
  extensionPath: '/mock/extension/path',
  storagePath: '/mock/storage/path',
  globalStoragePath: '/mock/global/storage/path',
  logPath: '/mock/log/path',
  extensionUri: { fsPath: '/mock/extension/path' } as any,
  storageUri: { fsPath: '/mock/storage/path' } as any,
  globalStorageUri: { fsPath: '/mock/global/storage/path' } as any,
  logUri: { fsPath: '/mock/log/path' } as any,
  environmentVariableCollection: {} as any,
  asAbsolutePath: vi.fn((relativePath: string) => `/mock/extension/path/${relativePath}`),
  secrets: {} as any,
  extension: {} as any
};

describe.sequential('PluginManager - Core Coverage Test', () => {
  let pluginManager: PluginManager;
  let physicalMockManager: PhysicalPluginMockManager;

  beforeEach(async () => {
    pluginManager = PluginManager.getInstance();
    physicalMockManager = new PhysicalPluginMockManager();
    
    // 初始化PluginManager
    await pluginManager.initialize(mockExtensionContext as any);
  });

  afterEach(async () => {
    try {
      // 更彻底的清理
      await pluginManager.deactivateAllPlugins();
      
      // 获取当前加载的所有插件并卸载它们
      const loadedPlugins = pluginManager.getLoadedPlugins();
      for (const plugin of loadedPlugins) {
        try {
          await pluginManager.unloadPlugin(plugin.manifest.id);
        } catch (error) {
          // 忽略卸载错误，继续清理
        }
      }
      
      // 清理物理文件
      await physicalMockManager.cleanup();
      
      // 重置单例状态 - 如果PluginManager有清理方法
      // 这里我们强制重置一些内部状态
      if (typeof (pluginManager as any).clear === 'function') {
        (pluginManager as any).clear();
      }
      
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
    
    // 不要调用vi.resetAllMocks()，它会破坏setup.ts中的path mock
    // vi.resetAllMocks();
  });

  describe('Core Plugin Management', () => {
    it('应成功加载和激活插件', async () => {
      const manifest = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      // 确保ID与测试期望一致
      manifest.id = 'test-plugin-1';
      
      const pluginPath = path.resolve(__dirname, '../../tmp-pm-test-plugin-1');
      
      try {
        await physicalMockManager.createPluginFiles({
          pluginPath,
          manifest
        });
        
        // 加载插件
        const loaded = await pluginManager.loadPlugin(`${pluginPath}/plugin.json`);
        expect(loaded).toBe(true);
        expect(pluginManager.isPluginLoaded('test-plugin-1')).toBe(true);
        
        // 激活插件
        const result = await pluginManager.activatePlugin('test-plugin-1');
        expect(result.success).toBe(true);
        expect(pluginManager.isPluginActivated('test-plugin-1')).toBe(true);
        
        // 验证插件实例
        const plugin = pluginManager.getPlugin('test-plugin-1');
        expect(plugin).toBeDefined();
        expect(plugin!.manifest.id).toBe('test-plugin-1');
        
      } finally {
        try {
          await physicalMockManager.cleanup(pluginPath);
        } catch (error) {
          // 忽略清理错误
        }
      }
    });

    it('应支持插件停用和卸载', async () => {
      const manifest = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      // 确保ID与测试期望一致
      manifest.id = 'test-plugin-2';
      
      const pluginPath = path.resolve(__dirname, '../../tmp-pm-test-plugin-2');
      
      try {
        await physicalMockManager.createPluginFiles({
          pluginPath,
          manifest
        });
        
        await pluginManager.loadPlugin(`${pluginPath}/plugin.json`);
        await pluginManager.activatePlugin('test-plugin-2');
        
        expect(pluginManager.isPluginActivated('test-plugin-2')).toBe(true);
        
        // 停用插件
        const deactivated = await pluginManager.deactivatePlugin('test-plugin-2');
        expect(deactivated).toBe(true);
        expect(pluginManager.isPluginActivated('test-plugin-2')).toBe(false);
        expect(pluginManager.isPluginLoaded('test-plugin-2')).toBe(true); // 仍然加载
        
        // 卸载插件
        const unloaded = await pluginManager.unloadPlugin('test-plugin-2');
        expect(unloaded).toBe(true);
        expect(pluginManager.isPluginLoaded('test-plugin-2')).toBe(false);
        
      } finally {
        try {
          await physicalMockManager.cleanup(pluginPath);
        } catch (error) {
          // 忽略清理错误
        }
      }
    });

    it('应支持插件重新加载', async () => {
      const manifest = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      // 确保ID与测试期望一致
      manifest.id = 'test-plugin-3';
      
      const pluginPath = path.resolve(__dirname, '../../tmp-pm-test-plugin-3');
      
      try {
        await physicalMockManager.createPluginFiles({
          pluginPath,
          manifest
        });
        
        await pluginManager.loadPlugin(`${pluginPath}/plugin.json`);
        await pluginManager.activatePlugin('test-plugin-3');
        
        expect(pluginManager.isPluginActivated('test-plugin-3')).toBe(true);
        
        // 重新加载插件
        const reloaded = await pluginManager.reloadPlugin('test-plugin-3');
        expect(reloaded).toBe(true);
        expect(pluginManager.isPluginLoaded('test-plugin-3')).toBe(true);
        
      } finally {
        try {
          await physicalMockManager.cleanup(pluginPath);
        } catch (error) {
          // 忽略清理错误
        }
      }
    });

    it('应提供插件查询功能', async () => {
      const manifest1 = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      manifest1.id = 'plugin-query-1';
      
      const manifest2 = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      manifest2.id = 'plugin-query-2';
      
      const pluginPath1 = path.resolve(__dirname, '../../tmp-pm-query-plugin-1');
      const pluginPath2 = path.resolve(__dirname, '../../tmp-pm-query-plugin-2');
      
      try {
        await physicalMockManager.createPluginFiles({ pluginPath: pluginPath1, manifest: manifest1 });
        await physicalMockManager.createPluginFiles({ pluginPath: pluginPath2, manifest: manifest2 });
        
        await pluginManager.loadPlugin(`${pluginPath1}/plugin.json`);
        await pluginManager.loadPlugin(`${pluginPath2}/plugin.json`);
        await pluginManager.activatePlugin('plugin-query-1');
        
        // 测试查询功能
        const loadedPlugins = pluginManager.getLoadedPlugins();
        expect(loadedPlugins).toHaveLength(2);
        
        const activatedPlugins = pluginManager.getActivatedPlugins();
        expect(activatedPlugins).toHaveLength(1);
        expect(activatedPlugins[0].manifest.id).toBe('plugin-query-1');
        
      } finally {
        try {
          await physicalMockManager.cleanup(pluginPath1);
          await physicalMockManager.cleanup(pluginPath2);
        } catch (error) {
          // 忽略清理错误
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('应处理无效的插件路径', async () => {
      const result = await pluginManager.loadPlugin('/non/existent/path/plugin.json');
      expect(result).toBe(false);
    });

    it('应处理不存在的插件ID', async () => {
      expect(pluginManager.isPluginLoaded('non-existent-plugin')).toBe(false);
      expect(pluginManager.isPluginActivated('non-existent-plugin')).toBe(false);
      expect(pluginManager.getPlugin('non-existent-plugin')).toBeUndefined();
      
      const activateResult = await pluginManager.activatePlugin('non-existent-plugin');
      expect(activateResult.success).toBe(false);
      
      const deactivateResult = await pluginManager.deactivatePlugin('non-existent-plugin');
      expect(deactivateResult).toBe(false);
      
      const unloadResult = await pluginManager.unloadPlugin('non-existent-plugin');
      expect(unloadResult).toBe(false);
      
      const reloadResult = await pluginManager.reloadPlugin('non-existent-plugin');
      expect(reloadResult).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    it('应支持批量停用所有插件', async () => {
      const manifest1 = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      manifest1.id = 'batch-plugin-1';
      
      const manifest2 = PluginManifestFactory.createValid({
        activationEvents: ['*']
      });
      manifest2.id = 'batch-plugin-2';
      
      const pluginPath1 = path.resolve(__dirname, '../../tmp-pm-batch-plugin-1');
      const pluginPath2 = path.resolve(__dirname, '../../tmp-pm-batch-plugin-2');
      
      try {
        await physicalMockManager.createPluginFiles({ pluginPath: pluginPath1, manifest: manifest1 });
        await physicalMockManager.createPluginFiles({ pluginPath: pluginPath2, manifest: manifest2 });
        
        await pluginManager.loadPlugin(`${pluginPath1}/plugin.json`);
        await pluginManager.loadPlugin(`${pluginPath2}/plugin.json`);
        await pluginManager.activatePlugin('batch-plugin-1');
        await pluginManager.activatePlugin('batch-plugin-2');
        
        expect(pluginManager.getActivatedPlugins()).toHaveLength(2);
        
        // 批量停用
        await pluginManager.deactivateAllPlugins();
        
        expect(pluginManager.getActivatedPlugins()).toHaveLength(0);
        expect(pluginManager.isPluginActivated('batch-plugin-1')).toBe(false);
        expect(pluginManager.isPluginActivated('batch-plugin-2')).toBe(false);
        
      } finally {
        try {
          await physicalMockManager.cleanup(pluginPath1);
          await physicalMockManager.cleanup(pluginPath2);
        } catch (error) {
          // 忽略清理错误
        }
      }
    });
  });

  describe('Statistics and Registry', () => {
    it('应提供统计信息', async () => {
      const stats = pluginManager.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalPlugins).toBe('number');
      expect(typeof stats.activatedPlugins).toBe('number');
    });

    it('应提供ContributionRegistry访问', () => {
      const registry = pluginManager.getContributionRegistry();
      expect(registry).toBeDefined();
    });
  });
});
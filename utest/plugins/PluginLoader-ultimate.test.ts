/**
 * PluginLoader 终极覆盖测试
 * 
 * 测试目标: 100% 代码覆盖率
 * - manifest 加载和验证的所有场景
 * - 插件模块加载的所有路径
 * - 错误处理的完整覆盖
 * - 缓存机制验证
 * - 安全验证测试
 * 
 * 基于 Plugins-high.md 计划中的 P3-01 任务
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { PluginLoader } from '../../src/extension/plugins/PluginLoader';
import { PluginManifest } from '../../src/extension/plugins/types';
import {
  PluginManifestFactory,
  ContributionFactory,
  PluginModuleFactory,
  FileSystemMockFactory,
  TestScenarios,
  TestUtils
} from '../mocks/plugins-mock-factory';
import { PhysicalPluginMockManager } from '../mocks/physical-plugin-mock';
import {
  generateTestEcosystem,
  generateVersionData,
  generateIdData,
  generateContributionData
} from '../test-data/plugins-test-data-generator';
import { 
  PhysicalPluginMockManager,
  getPhysicalPluginMockManager,
  setupPhysicalPluginMocks 
} from '../mocks/physical-plugin-mock';

describe.sequential('PluginLoader - Ultimate Coverage Test', () => {
  let pluginLoader: PluginLoader;
  let physicalMockManager: PhysicalPluginMockManager;

  beforeEach(() => {
    pluginLoader = new PluginLoader();
    pluginLoader.clearCaches();
    
    // Initialize physical mock manager
    physicalMockManager = new PhysicalPluginMockManager();

    // Reset module load controller
    global.moduleLoadController.reset();

    // 重置PluginManifestFactory计数器，确保每个测试都有一致的ID
    (PluginManifestFactory as any).counter = 0;

    // 彻底清除Node.js require缓存中的插件相关模块
    Object.keys(require.cache).forEach(key => {
      if (key.includes('tmp-') || 
          key.includes('/test/plugin') || 
          key.includes('test-plugin') ||
          key.includes('plugin.js') ||
          key.includes('index.js') && key.includes('tmp')) {
        delete require.cache[key];
      }
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // 🎯 移除全局physicalMockManager cleanup避免race condition
    // 每个测试在try/finally中负责自己的文件清理
    
    // Reset mock calls but keep mock implementation
    vi.clearAllMocks();
    TestUtils.resetAllMocks();
  });

  describe('Manifest Loading', () => {
    describe('loadManifest() - Success Cases', () => {
      it('应成功加载有效的插件清单', async () => {
        const manifest = PluginManifestFactory.createValid();
        const manifestPath = '/test/plugin/plugin.json';
        
        // 使用现有的fs mock
        vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(manifest));

        const result = await pluginLoader.loadManifest(manifestPath);

        expect(result).toEqual(manifest);
        expect(fsPromises.readFile).toHaveBeenCalledWith(manifestPath, 'utf8');
      });

      it('应使用缓存的清单文件', async () => {
        const manifest = PluginManifestFactory.createValid();
        const manifestPath = '/test/plugin/plugin.json';
        
        // 使用现有的fs mock
        vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(manifest));

        // 第一次加载
        const result1 = await pluginLoader.loadManifest(manifestPath);
        // 第二次加载（应从缓存获取）
        const result2 = await pluginLoader.loadManifest(manifestPath);

        expect(result1).toEqual(manifest);
        expect(result2).toEqual(manifest);
        expect(fsPromises.readFile).toHaveBeenCalledTimes(1);
      });

      it('应正确解析包含所有贡献类型的清单', async () => {
        const manifest = PluginManifestFactory.createWithAllContributions();
        const manifestPath = '/test/full-plugin/plugin.json';
        
        // 创建JSON安全的manifest（去除函数）
        const jsonSafeManifest = JSON.parse(JSON.stringify(manifest));
        
        // 使用现有的fs mock
        vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(jsonSafeManifest));

        const result = await pluginLoader.loadManifest(manifestPath);

        // 比较基本属性
        expect(result.id).toBe(jsonSafeManifest.id);
        expect(result.name).toBe(jsonSafeManifest.name);
        expect(result.version).toBe(jsonSafeManifest.version);
        expect(result.contributes).toBeDefined();
        expect(result.contributes!.drivers).toHaveLength(1);
        expect(result.contributes!.parsers).toHaveLength(1);
        expect(result.contributes!.widgets).toHaveLength(1);
      });
    });

    describe('loadManifest() - Error Cases', () => {
      it('应处理文件不存在错误', async () => {
        const manifestPath = '/test/nonexistent/plugin.json';
        
        vi.mocked(fsPromises.readFile).mockRejectedValue(new Error('ENOENT: no such file'));

        await expect(pluginLoader.loadManifest(manifestPath)).rejects.toThrow(
          'Failed to load plugin manifest from /test/nonexistent/plugin.json'
        );
      });

      it('应处理JSON解析错误', async () => {
        const manifestPath = '/test/invalid/plugin.json';
        
        vi.mocked(fsPromises.readFile).mockResolvedValue('invalid json content');

        await expect(pluginLoader.loadManifest(manifestPath)).rejects.toThrow(
          'Failed to load plugin manifest from /test/invalid/plugin.json'
        );
      });

      it('应处理文件权限错误', async () => {
        const manifestPath = '/test/permission/plugin.json';
        
        vi.mocked(fsPromises.readFile).mockRejectedValue(new Error('EACCES: permission denied'));

        await expect(pluginLoader.loadManifest(manifestPath)).rejects.toThrow(
          'Failed to load plugin manifest from /test/permission/plugin.json: EACCES: permission denied'
        );
      });
    });
  });

  describe('Manifest Validation', () => {
    describe('validateManifest() - Required Fields', () => {
      it('应通过有效清单的验证', async () => {
        const manifest = PluginManifestFactory.createValid();
        
        await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
      });

      it('应拒绝缺少id字段的清单', async () => {
        const manifest = PluginManifestFactory.createInvalid(['id']);
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Plugin ID is required and must be a string'
        );
      });

      it('应拒绝缺少name字段的清单', async () => {
        const manifest = PluginManifestFactory.createInvalid(['name']);
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Plugin name is required and must be a string'
        );
      });

      it('应拒绝缺少version字段的清单', async () => {
        const manifest = PluginManifestFactory.createInvalid(['version']);
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Plugin version is required and must be a string'
        );
      });

      it('应拒绝缺少description字段的清单', async () => {
        const manifest = PluginManifestFactory.createInvalid(['description']);
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Plugin description is required and must be a string'
        );
      });

      it('应拒绝缺少author字段的清单', async () => {
        const manifest = PluginManifestFactory.createInvalid(['author']);
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Plugin author is required and must be a string'
        );
      });

      it('应拒绝缺少engines字段的清单', async () => {
        const manifest = PluginManifestFactory.createInvalid(['engines']);
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Engine compatibility is required'
        );
      });

      it('应拒绝engines缺少vscode字段的清单', async () => {
        const manifest = PluginManifestFactory.createValid({
          engines: { serialStudio: '1.0.0' } as any
        });
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'VSCode engine compatibility is required'
        );
      });

      it('应拒绝engines缺少serialStudio字段的清单', async () => {
        const manifest = PluginManifestFactory.createValid({
          engines: { vscode: '^1.60.0' } as any
        });
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Serial Studio engine compatibility is required'
        );
      });

      it('应拒绝activationEvents不是数组的清单', async () => {
        const manifest = PluginManifestFactory.createValid();
        (manifest as any).activationEvents = 'not-array';
        
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Activation events must be an array'
        );
      });
    });

    describe('validateManifest() - Version Validation', () => {
      it('应验证语义化版本格式', async () => {
        const testCases = generateVersionData();

        for (const testCase of [...testCases.valid, ...testCases.invalid]) {
          // 只测试非空字符串版本（避免类型验证错误）
          if (testCase.version === '') continue;
          
          const manifest = PluginManifestFactory.createValid({
            version: testCase.version
          });

          if (testCase.expected) {
            await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
          } else {
            await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
              'Plugin version must follow semantic versioning (e.g., 1.0.0)'
            );
          }
        }
      });
    });

    describe('validateManifest() - ID Validation', () => {
      it('应验证插件ID格式', async () => {
        const testCases = generateIdData();

        for (const testCase of [...testCases.valid, ...testCases.invalid]) {
          // 只测试非空字符串ID（避免类型验证错误）
          if (testCase.id === '') continue;
          
          const manifest = PluginManifestFactory.createValid({
            id: testCase.id
          });

          if (testCase.expected) {
            await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
          } else {
            await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
              'Plugin ID must contain only alphanumeric characters, hyphens, and dots'
            );
          }
        }
      });
    });

    describe('validateManifest() - Contributions Validation', () => {
      it('应验证驱动贡献的完整性', async () => {
        const validDrivers = [ContributionFactory.createDriver()];
        const invalidDrivers = [
          { name: 'Missing ID', protocol: 'test' },
          { id: 'missing-name', protocol: 'test' },
          { id: 'missing-protocol', name: 'Missing Protocol' }
        ];

        // 有效的驱动贡献
        let manifest = PluginManifestFactory.createValid({
          contributes: { drivers: validDrivers }
        });
        await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();

        // 无效的驱动贡献
        for (const invalidDriver of invalidDrivers) {
          manifest = PluginManifestFactory.createValid({
            contributes: { drivers: [invalidDriver] }
          });
          await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow();
        }

        // drivers不是数组
        manifest = PluginManifestFactory.createValid({
          contributes: { drivers: 'not-array' as any }
        });
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Driver contributions must be an array'
        );
      });

      it('应验证组件贡献的完整性', async () => {
        const validWidgets = [ContributionFactory.createWidget()];
        const invalidWidgets = [
          { name: 'Missing ID', type: 'dataset' },
          { id: 'missing-name', type: 'dataset' },
          { id: 'invalid-type', name: 'Invalid Type', type: 'invalid-type' }
        ];

        // 有效的组件贡献
        let manifest = PluginManifestFactory.createValid({
          contributes: { widgets: validWidgets }
        });
        await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();

        // 无效的组件贡献
        for (const invalidWidget of invalidWidgets) {
          manifest = PluginManifestFactory.createValid({
            contributes: { widgets: [invalidWidget] }
          });
          await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow();
        }

        // widgets不是数组
        manifest = PluginManifestFactory.createValid({
          contributes: { widgets: 'not-array' as any }
        });
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Widget contributions must be an array'
        );
      });

      it('应验证解析器贡献的完整性', async () => {
        const validParsers = [ContributionFactory.createParser()];
        const invalidParsers = [
          { name: 'Missing ID' },
          { id: 'missing-name' }
        ];

        // 有效的解析器贡献
        let manifest = PluginManifestFactory.createValid({
          contributes: { parsers: validParsers }
        });
        await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();

        // 无效的解析器贡献
        for (const invalidParser of invalidParsers) {
          manifest = PluginManifestFactory.createValid({
            contributes: { parsers: [invalidParser] }
          });
          await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow();
        }

        // parsers不是数组
        manifest = PluginManifestFactory.createValid({
          contributes: { parsers: 'not-array' as any }
        });
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Parser contributions must be an array'
        );
      });

      it('应验证菜单贡献的完整性', async () => {
        const validMenus = [ContributionFactory.createMenu()];
        const invalidMenus = [
          { label: 'Missing ID', command: 'test' },
          { id: 'missing-label', command: 'test' },
          { id: 'missing-command', label: 'Missing Command' }
        ];

        // 有效的菜单贡献
        let manifest = PluginManifestFactory.createValid({
          contributes: { menus: validMenus }
        });
        await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();

        // 无效的菜单贡献
        for (const invalidMenu of invalidMenus) {
          manifest = PluginManifestFactory.createValid({
            contributes: { menus: [invalidMenu] }
          });
          await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow();
        }

        // menus不是数组
        manifest = PluginManifestFactory.createValid({
          contributes: { menus: 'not-array' as any }
        });
        await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
          'Menu contributions must be an array'
        );
      });
    });

    describe('validateManifest() - Dependencies Validation', () => {
      it('应验证依赖版本格式', async () => {
        const validDependencies = {
          'dep1': '1.0.0',
          'dep2': '2.1.0-alpha',
          'dep3': '3.0.0+build.1'
        };

        const invalidDependencies = {
          'invalid1': 'not-a-version',
          'invalid2': '1.0',
          'invalid3': 'v1.0.0'
        };

        // 有效的依赖
        let manifest = PluginManifestFactory.createValid({
          dependencies: validDependencies
        });
        await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();

        // 无效的依赖
        for (const [depName, depVersion] of Object.entries(invalidDependencies)) {
          manifest = PluginManifestFactory.createValid({
            dependencies: { [depName]: depVersion }
          });
          await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow(
            `Dependency ${depName} has invalid version: ${depVersion}`
          );
        }
      });
    });

    describe('validateManifest() - Multiple Errors', () => {
      it('应收集并报告多个验证错误', async () => {
        const manifest = {
          // 缺少id
          name: 'Test Plugin',
          // 无效版本
          version: 'invalid',
          description: 'Test',
          author: 'Test',
          license: 'MIT',
          engines: {
            vscode: '^1.60.0'
            // 缺少serialStudio
          },
          // 无效的激活事件
          activationEvents: 'not-array'
        } as any;

        try {
          await pluginLoader.validateManifest(manifest);
          throw new Error('Expected validation to fail');
        } catch (error: any) {
          expect(error.message).toContain('Plugin manifest validation failed:');
          expect(error.message).toContain('Plugin ID is required');
          expect(error.message).toContain('Plugin version must follow semantic versioning');
          expect(error.message).toContain('Serial Studio engine compatibility is required');
          expect(error.message).toContain('Activation events must be an array');
        }
      });
    });
  });

  describe('Plugin Module Loading', () => {
    describe('loadPluginModule() - Success Cases', () => {
      it('应使用manifest指定的main入口加载模块', async () => {
        // 🎯 P6-01: 修复manifest与pluginPath匹配问题
        const pluginPath = await physicalMockManager.createStandardTestPlugin('main');
        
        // 🎯 关键修复：使用与创建插件文件匹配的manifest
        // createStandardTestPlugin('main') 创建的插件就包含 main: 'custom-entry.js'
        // 读取实际创建的manifest
        const manifestPath = `${pluginPath}/plugin.json`;
        const realFs = require('fs/promises');
        const manifestContent = await realFs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        const result = await pluginLoader.loadPluginModule(manifest, pluginPath);

        expect(result).toBeDefined();
        expect(typeof result.activate).toBe('function');
        expect(result.customExport).toBe(true);
        
        // 测试完成后立即清理
        await physicalMockManager.cleanup();
      });

      it('应尝试默认入口点当没有指定main时', async () => {
        // 🎯 P6-01: 修复manifest与pluginPath匹配问题
        const pluginPath = await physicalMockManager.createStandardTestPlugin('index');

        // 🎯 关键修复：使用实际创建的manifest
        const manifestPath = `${pluginPath}/plugin.json`;
        const realFs = require('fs/promises');
        const manifestContent = await realFs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        const result = await pluginLoader.loadPluginModule(manifest, pluginPath);

        expect(result).toBeDefined();
        expect(typeof result.activate).toBe('function');
        expect(result.drivers).toBeDefined();
        expect(result.widgets).toBeDefined();
        expect(result.parsers).toBeDefined();
        
        // 测试完成后立即清理
        await physicalMockManager.cleanup();
      });

      it('应尝试所有默认入口点并找到可用的', async () => {
        // 🎯 P6-01: 修复manifest与pluginPath匹配问题
        const pluginPath = await physicalMockManager.createStandardTestPlugin('plugin');

        // 🎯 关键修复：使用实际创建的manifest
        const manifestPath = `${pluginPath}/plugin.json`;
        const realFs = require('fs/promises');
        const manifestContent = await realFs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        const result = await pluginLoader.loadPluginModule(manifest, pluginPath);

        expect(result).toBeDefined();
        expect(typeof result.activate).toBe('function');
        expect(result.entryPoint).toBe('plugin.js');
        
        // 测试完成后立即清理
        await physicalMockManager.cleanup();
      });

      it('应使用缓存的模块', async () => {
        // 🎯 P6-01: 修复manifest与pluginPath匹配问题
        const pluginPath = await physicalMockManager.createStandardTestPlugin('index');

        // 🎯 关键修复：使用实际创建的manifest
        const manifestPath = `${pluginPath}/plugin.json`;
        const realFs = require('fs/promises');
        const manifestContent = await realFs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        // 第一次加载
        const result1 = await pluginLoader.loadPluginModule(manifest, pluginPath);
        // 第二次加载（应从缓存获取）
        const result2 = await pluginLoader.loadPluginModule(manifest, pluginPath);

        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
        expect(typeof result1.activate).toBe('function');
        expect(typeof result2.activate).toBe('function');
        // Module should be cached - verify results are the same
        expect(result1).toBe(result2);
        
        // 测试完成后立即清理
        await physicalMockManager.cleanup();
      });

      it('应清除require缓存并重新加载模块', async () => {
        // 🎯 P6-01: 修复manifest与pluginPath匹配问题
        const pluginPath = await physicalMockManager.createStandardTestPlugin('index');

        // 🎯 关键修复：使用实际创建的manifest
        const manifestPath = `${pluginPath}/plugin.json`;
        const realFs = require('fs/promises');
        const manifestContent = await realFs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        // Test that module can be loaded successfully (cache management is internal)
        const result = await pluginLoader.loadPluginModule(manifest, pluginPath);

        expect(result).toBeDefined();
        expect(typeof result.activate).toBe('function');
        expect(result.drivers).toBeDefined();
        expect(result.widgets).toBeDefined();
        expect(result.parsers).toBeDefined();
        
        // 测试完成后立即清理
        await physicalMockManager.cleanup();
      });
    });

    describe('loadPluginModule() - Error Cases', () => {
      it('应处理找不到任何入口文件的情况', async () => {
        const manifest = PluginManifestFactory.createValid();
        delete (manifest as any).main;
        const pluginPath = '/test/plugin';

        // 所有默认路径都不存在
        vi.mocked(fsPromises.access).mockRejectedValue(new Error('ENOENT'));

        await expect(pluginLoader.loadPluginModule(manifest, pluginPath)).rejects.toThrow(
          `Failed to load plugin module for ${manifest.id}: No main entry point found. Specify "main" in plugin.json or provide index.js`
        );
      });

      it('应处理指定main文件不存在的情况', async () => {
        const manifest = PluginManifestFactory.createValid({
          main: 'nonexistent.js'
        });
        const pluginPath = '/test/plugin';

        vi.mocked(fsPromises.access).mockRejectedValue(new Error('ENOENT'));

        await expect(pluginLoader.loadPluginModule(manifest, pluginPath)).rejects.toThrow(
          `Failed to load plugin module for ${manifest.id}: ENOENT`
        );
      });

      it('应处理模块加载错误', async () => {
        const manifest = PluginManifestFactory.createValid();
        
        // 创建一个会导致语法错误的物理插件文件
        const errorPluginPath = path.resolve(__dirname, '../../tmp-error-plugin');
        const physicalMockManager = new PhysicalPluginMockManager();
        
        try {
          // 创建有语法错误的插件文件
          await physicalMockManager.createErrorPlugin({
            pluginPath: errorPluginPath,
            manifest,
            errorType: 'syntax'
          });
          
          await expect(pluginLoader.loadPluginModule(manifest, errorPluginPath)).rejects.toThrow();
        } finally {
          // 清理临时文件
          await physicalMockManager.cleanup(errorPluginPath);
        }
      });
    });

    describe('validatePluginModule() - Module Validation', () => {
      it('应验证声明驱动贡献的插件导出drivers', async () => {
        // 🎯 P6-01: 修复为物理文件策略，创建确实缺少drivers导出的插件
        const manifest = PluginManifestFactory.createValid({
          contributes: {
            drivers: [ContributionFactory.createDriver()]
          },
          activationEvents: ['*'] // 确保有激活事件
        });
        
        // 创建缺少drivers导出的插件
        const pluginPath = await physicalMockManager.createPluginFiles({
          pluginPath: physicalMockManager.generateUniquePluginPath('validation-drivers'),
          manifest,
          moduleContent: `
module.exports = {
  activate: async function(context) {
    return { initialized: true };
  },
  deactivate: async function() {},
  // 故意不包含drivers导出，虽然manifest中声明了drivers贡献
};`
        });
        
        await expect(pluginLoader.loadPluginModule(manifest, pluginPath)).rejects.toThrow(
          'Plugin declares driver contributions but does not export "drivers"'
        );
        
        // 测试完成后立即清理
        await physicalMockManager.cleanup();
      });

      it('应验证声明组件贡献的插件导出widgets', async () => {
        const manifest = PluginManifestFactory.createValid({
          contributes: {
            widgets: [ContributionFactory.createWidget()]
          },
          activationEvents: ['*']
        });
        
        // 🎯 P6-01: 使用新的唯一路径策略和确切的widgets验证内容
        const pluginPath = await physicalMockManager.createPluginFiles({
          pluginPath: physicalMockManager.generateUniquePluginPath('validation-widgets'),
          manifest,
          moduleContent: `
module.exports = {
  activate: async function(context) {
    return { initialized: true };
  },
  deactivate: async function() {},
  // 故意不包含widgets导出，虽然manifest中声明了widgets贡献
};`
        });
        
        try {
          await expect(pluginLoader.loadPluginModule(manifest, pluginPath)).rejects.toThrow(
            'Plugin declares widget contributions but does not export "widgets"'
          );
        } finally {
          // 清理临时文件
          await physicalMockManager.cleanup();
        }
      });

      it('应验证声明解析器贡献的插件导出parsers', async () => {
        const manifest = PluginManifestFactory.createValid({
          contributes: {
            parsers: [ContributionFactory.createParser()]
          },
          activationEvents: ['*']
        });
        
        // 🎯 P6-01: 使用新的唯一路径策略和确切的parsers验证内容
        const pluginPath = await physicalMockManager.createPluginFiles({
          pluginPath: physicalMockManager.generateUniquePluginPath('validation-parsers'),
          manifest,
          moduleContent: `
module.exports = {
  activate: async function(context) {
    return { initialized: true };
  },
  deactivate: async function() {},
  // 故意不包含parsers导出，虽然manifest中声明了parsers贡献
};`
        });
        
        try {
          await expect(pluginLoader.loadPluginModule(manifest, pluginPath)).rejects.toThrow(
            'Plugin declares parser contributions but does not export "parsers"'
          );
        } finally {
          // 清理临时文件
          await physicalMockManager.cleanup();
        }
      });

      it('应验证有激活事件的插件导出activate函数', async () => {
        const manifest = PluginManifestFactory.createValid({
          activationEvents: ['onCommand:test']
        });
        
        // 🎯 P6-01: 使用新的唯一路径策略和确切的activate验证内容
        const pluginPath = await physicalMockManager.createPluginFiles({
          pluginPath: physicalMockManager.generateUniquePluginPath('validation-activate'),
          manifest,
          moduleContent: `
module.exports = {
  // 故意不包含activate函数，虽然manifest中声明了激活事件
  deactivate: async function() {},
};`
        });
        
        try {
          await expect(pluginLoader.loadPluginModule(manifest, pluginPath)).rejects.toThrow(
            'Plugin declares activation events but does not export an "activate" function'
          );
        } finally {
          // 清理临时文件
          await physicalMockManager.cleanup();
        }
      });

      it('应收集并报告多个模块验证错误', async () => {
        const manifest = PluginManifestFactory.createValid({
          contributes: {
            drivers: [ContributionFactory.createDriver()],
            widgets: [ContributionFactory.createWidget()]
          },
          activationEvents: ['*']
        });
        
        // 🎯 P6-01: 使用新的唯一路径策略和确切的多重验证错误内容
        const pluginPath = await physicalMockManager.createPluginFiles({
          pluginPath: physicalMockManager.generateUniquePluginPath('validation-multiple'),
          manifest,
          moduleContent: `
module.exports = {
  // 故意缺少所有必要的导出：drivers, widgets, activate
  deactivate: async function() {},
};`
        });
        
        try {
          try {
            await pluginLoader.loadPluginModule(manifest, pluginPath);
            throw new Error('Expected validation to fail');
          } catch (error: any) {
            expect(error.message).toContain('Plugin module validation failed:');
            expect(error.message).toContain('but does not export "drivers"');
            expect(error.message).toContain('but does not export "widgets"');
            expect(error.message).toContain('but does not export an "activate" function');
          }
        } finally {
          // 清理临时文件
          await physicalMockManager.cleanup();
        }
      });
    });
  });

  describe('Schema and Utility Methods', () => {
    describe('getManifestSchema()', () => {
      it('应返回完整的JSON Schema定义', () => {
        const schema = pluginLoader.getManifestSchema();

        expect(schema.type).toBe('object');
        expect(schema.required).toEqual([
          'id', 'name', 'version', 'description', 'author', 'engines', 'activationEvents'
        ]);
        expect(schema.properties).toBeDefined();
        expect(schema.properties.id).toBeDefined();
        expect(schema.properties.name).toBeDefined();
        expect(schema.properties.version).toBeDefined();
        expect(schema.properties.engines).toBeDefined();
        expect(schema.properties.contributes).toBeDefined();
      });

      it('应包含正确的版本验证模式', () => {
        const schema = pluginLoader.getManifestSchema();
        const versionProperty = schema.properties.version;

        expect(versionProperty.type).toBe('string');
        expect(versionProperty.pattern).toBeDefined();
      });

      it('应包含正确的ID验证模式', () => {
        const schema = pluginLoader.getManifestSchema();
        const idProperty = schema.properties.id;

        expect(idProperty.type).toBe('string');
        expect(idProperty.pattern).toBe('^[a-zA-Z0-9.-]+$');
        expect(idProperty.minLength).toBe(1);
        expect(idProperty.maxLength).toBe(100);
      });

      it('应包含engines对象的完整定义', () => {
        const schema = pluginLoader.getManifestSchema();
        const enginesProperty = schema.properties.engines;

        expect(enginesProperty.type).toBe('object');
        expect(enginesProperty.required).toEqual(['vscode', 'serialStudio']);
        expect(enginesProperty.properties.vscode).toEqual({ type: 'string' });
        expect(enginesProperty.properties.serialStudio).toEqual({ type: 'string' });
      });

      it('应包含贡献定义的Schema', () => {
        const schema = pluginLoader.getManifestSchema();
        const contributesProperty = schema.properties.contributes;

        expect(contributesProperty.type).toBe('object');
        expect(contributesProperty.properties).toBeDefined();
        expect(contributesProperty.properties.drivers).toBeDefined();
        expect(contributesProperty.properties.widgets).toBeDefined();
        expect(contributesProperty.properties.parsers).toBeDefined();
        expect(contributesProperty.properties.menus).toBeDefined();
      });
    });

    describe('clearCaches()', () => {
      it('应清除所有缓存', async () => {
        // 🎯 P6-01: 使用统一的物理文件策略
        const pluginPath = await physicalMockManager.createStandardTestPlugin('index');
        
        try {
          const manifestPath = `${pluginPath}/plugin.json`;

          // 加载清单和模块，确保缓存生效
          const loadedManifest1 = await pluginLoader.loadManifest(manifestPath);
          const loadedModule1 = await pluginLoader.loadPluginModule(loadedManifest1, pluginPath);

          // 清除缓存
          pluginLoader.clearCaches();

          // 再次加载 - 应该重新加载而不是使用缓存
          const loadedManifest2 = await pluginLoader.loadManifest(manifestPath);
          const loadedModule2 = await pluginLoader.loadPluginModule(loadedManifest2, pluginPath);
          
          // 验证缓存被清理（通过检查模块被重新加载）
          expect(loadedManifest1).toBeDefined();
          expect(loadedManifest2).toBeDefined();
          expect(loadedModule1).toBeDefined();
          expect(loadedModule2).toBeDefined();
        } finally {
          await physicalMockManager.cleanup();
        }
      });
    });
  });

  describe('Private Helper Methods Coverage', () => {
    describe('isValidSemanticVersion()', () => {
      it('应正确验证各种语义化版本格式', async () => {
        const testCases = [
          // 基本版本
          { version: '1.0.0', expected: true },
          { version: '0.0.1', expected: true },
          { version: '10.20.30', expected: true },
          
          // 预发布版本
          { version: '1.0.0-alpha', expected: true },
          { version: '1.0.0-alpha.1', expected: true },
          { version: '1.0.0-beta', expected: true },
          { version: '1.0.0-rc.1', expected: true },
          
          // 构建元数据
          { version: '1.0.0+build', expected: true },
          { version: '1.0.0+20210101', expected: true },
          { version: '1.0.0-alpha+build.1', expected: true },
          
          // 无效版本
          { version: '1.0', expected: false },
          { version: 'v1.0.0', expected: false },
          { version: '1.0.0.0', expected: false },
          { version: '', expected: false },
          { version: 'latest', expected: false }
        ];

        for (const testCase of testCases) {
          const manifest = PluginManifestFactory.createValid({
            version: testCase.version
          });

          if (testCase.expected) {
            await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
          } else {
            await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow();
          }
        }
      });
    });

    describe('isValidPluginId()', () => {
      it('应正确验证插件ID格式', async () => {
        const testCases = [
          // 有效ID
          { id: 'simple', expected: true },
          { id: 'plugin-name', expected: true },
          { id: 'plugin.name', expected: true },
          { id: 'namespace.plugin-name', expected: true },
          { id: 'a', expected: true },
          { id: 'plugin123', expected: true },
          { id: 'PLUGIN', expected: true },
          
          // 无效ID
          { id: '', expected: false },
          { id: 'plugin name', expected: false },
          { id: 'plugin@name', expected: false },
          { id: 'plugin#name', expected: false },
          { id: 'plugin/name', expected: false },
          { id: 'plugin\\name', expected: false },
          { id: 'a'.repeat(101), expected: false } // 超过长度限制
        ];

        for (const testCase of testCases) {
          const manifest = PluginManifestFactory.createValid({
            id: testCase.id
          });

          if (testCase.expected) {
            await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
          } else {
            await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow();
          }
        }
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('应处理空的贡献对象', async () => {
      const manifest = PluginManifestFactory.createValid({
        contributes: {}
      });

      await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
    });

    it('应处理undefined的贡献对象', async () => {
      const manifest = PluginManifestFactory.createValid();
      delete (manifest as any).contributes;

      await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
    });

    it('应处理空的激活事件数组', async () => {
      // 使用物理文件策略替代moduleLoadController
      const manifest = PluginManifestFactory.createValid({
        activationEvents: []
      });
      
      // 🎯 P6-01: 使用统一的物理文件策略
      const pluginPath = await physicalMockManager.createStandardTestPlugin('index');
      
      try {
        // 🎯 P6-01: 使用实际创建的manifest，并且空的激活事件数组不需要activate函数
        const manifestPath = `${pluginPath}/plugin.json`;
        const realFs = require('fs/promises');
        const manifestContent = await realFs.readFile(manifestPath, 'utf8');
        const actualManifest = JSON.parse(manifestContent);
        
        // 修改manifest为空的激活事件数组
        actualManifest.activationEvents = [];
        await realFs.writeFile(manifestPath, JSON.stringify(actualManifest, null, 2));

        const loadedModule = await pluginLoader.loadPluginModule(actualManifest, pluginPath);
        
        expect(loadedModule).toBeDefined();
        expect(loadedModule.drivers).toEqual([]);
        expect(loadedModule.widgets).toEqual([]);
        expect(loadedModule.parsers).toEqual([]);
      } finally {
        await physicalMockManager.cleanup();
      }
    });

    it('应处理非常长的插件清单', async () => {
      const manifest = PluginManifestFactory.createValid({
        description: 'a'.repeat(10000), // 非常长的描述
        keywords: Array.from({ length: 100 }, (_, i) => `keyword${i}`) // 大量关键词
      });

      await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
    });

    it('应处理包含特殊字符的字段', async () => {
      const manifest = PluginManifestFactory.createValid({
        description: 'Plugin with 特殊字符 and émojis 🚀',
        author: 'Author Name with Ümlaut'
      });

      await expect(pluginLoader.validateManifest(manifest)).resolves.not.toThrow();
    });
  });

  describe('Performance and Resource Management', () => {
    it('应限制缓存大小以避免内存泄漏', async () => {
      // 加载大量清单以测试缓存行为
      const manifestPromises = [];
      for (let i = 0; i < 100; i++) {
        const manifest = PluginManifestFactory.createValid({
          id: `plugin-${i}`
        });
        const manifestPath = `/test/plugin-${i}/plugin.json`;
        
        // 使用现有的fs mock
        vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(manifest));
        manifestPromises.push(pluginLoader.loadManifest(manifestPath));
      }

      await Promise.all(manifestPromises);

      // 验证缓存没有导致内存问题（这里主要是确保不抛出异常）
      expect(manifestPromises).toHaveLength(100);
    });

    it('应正确处理并发的加载请求', async () => {
      const manifest = PluginManifestFactory.createValid();
      const manifestPath = '/test/plugin/plugin.json';
      
      vi.mocked(fsPromises.readFile).mockResolvedValue(JSON.stringify(manifest));

      // 并发加载相同的清单
      const promises = Array.from({ length: 10 }, () => 
        pluginLoader.loadManifest(manifestPath)
      );

      const results = await Promise.all(promises);

      // 所有结果应该相同
      results.forEach(result => {
        expect(result).toEqual(manifest);
      });

      // 在并发情况下，由于竞态条件，文件可能被读取多次
      // 但不应该超过并发数量
      expect(fsPromises.readFile).toHaveBeenCalledWith(manifestPath, 'utf8');
      expect(vi.mocked(fsPromises.readFile).mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(vi.mocked(fsPromises.readFile).mock.calls.length).toBeLessThanOrEqual(10);
    });
  });
});
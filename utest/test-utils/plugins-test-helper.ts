/**
 * Plugins模块专用测试助手
 * 
 * 提供高级测试工具函数，简化Plugins模块的测试编写
 * 包括测试环境设置、断言工具、性能测试等
 */

import { vi, expect } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import {
  PluginManifest,
  ExtensionPoint,
  PluginInstance,
  PluginEvent,
  PluginActivationResult
} from '../../src/extension/plugins/types';
import { PluginManager } from '../../src/extension/plugins/PluginManager';
import { ContributionRegistry } from '../../src/extension/plugins/ContributionRegistry';
import { PluginLoader } from '../../src/extension/plugins/PluginLoader';
import { PluginSystem } from '../../src/extension/plugins/index';
import {
  PluginManifestFactory,
  ContributionFactory,
  ExtensionContextFactory,
  PluginModuleFactory,
  FileSystemMockFactory,
  TestScenarios
} from '../mocks/plugins-mock-factory';
import {
  createExtensionContextMock,
  vscodeEnhancedMock
} from '../mocks/vscode-plugin-enhanced';

/**
 * 测试环境管理器
 */
export class TestEnvironment {
  private tempDirs: string[] = [];
  private cleanupCallbacks: (() => void)[] = [];

  /**
   * 设置完整的插件测试环境
   */
  async setup(options: {
    withPlugins?: Array<{ manifest: PluginManifest; moduleCode?: string }>;
    withErrors?: boolean;
    mockFileSystem?: boolean;
  } = {}) {
    const { withPlugins = [], withErrors = false, mockFileSystem = true } = options;

    // 创建临时目录
    const tempDir = await this.createTempDir();
    const pluginsDir = path.join(tempDir, 'plugins');

    // 创建扩展上下文
    const extensionContext = createExtensionContextMock({
      extensionPath: tempDir,
      globalStorageUri: { fsPath: path.join(tempDir, 'global-storage') },
      workspaceStorageUri: { fsPath: path.join(tempDir, 'workspace-storage') }
    });

    // 如果需要模拟文件系统
    if (mockFileSystem) {
      if (withErrors) {
        FileSystemMockFactory.createWithErrors();
      } else if (withPlugins.length > 0) {
        const pluginFiles = withPlugins.map((plugin, index) => ({
          dir: `plugin-${index}`,
          manifest: plugin.manifest,
          moduleContent: plugin.moduleCode || this.generateDefaultModuleCode()
        }));
        FileSystemMockFactory.createWithPluginFiles(pluginFiles);
      } else {
        FileSystemMockFactory.createEmpty();
      }
    }

    return {
      tempDir,
      pluginsDir,
      extensionContext,
      cleanup: () => this.cleanup()
    };
  }

  /**
   * 创建临时目录
   */
  private async createTempDir(): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'serial-studio-plugin-test-'));
    this.tempDirs.push(tempDir);
    return tempDir;
  }

  /**
   * 生成默认的插件模块代码
   */
  private generateDefaultModuleCode(): string {
    return `
      module.exports = {
        activate: function(context) {
          console.log('Plugin activated');
          return Promise.resolve();
        },
        deactivate: function() {
          console.log('Plugin deactivated');
          return Promise.resolve();
        }
      };
    `;
  }

  /**
   * 添加清理回调
   */
  addCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * 清理测试环境
   */
  async cleanup(): Promise<void> {
    // 执行清理回调
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });
    this.cleanupCallbacks.length = 0;

    // 清理临时目录
    for (const tempDir of this.tempDirs) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Failed to remove temp dir ${tempDir}:`, error);
      }
    }
    this.tempDirs.length = 0;

    // 重置Mock
    vi.clearAllMocks();
  }
}

/**
 * 插件系统测试助手
 */
export class PluginSystemTestHelper {
  private environment: TestEnvironment;

  constructor() {
    this.environment = new TestEnvironment();
  }

  /**
   * 创建完整的插件系统测试场景
   */
  async createTestScenario(options: {
    plugins?: PluginManifest[];
    withErrors?: boolean;
    autoInitialize?: boolean;
  } = {}): Promise<{
    pluginSystem: PluginSystem;
    pluginManager: PluginManager;
    contributionRegistry: ContributionRegistry;
    extensionContext: any;
    cleanup: () => Promise<void>;
  }> {
    const { plugins = [], withErrors = false, autoInitialize = true } = options;

    // 设置环境
    const env = await this.environment.setup({
      withPlugins: plugins.map(manifest => ({ manifest })),
      withErrors,
      mockFileSystem: true
    });

    // 获取系统组件
    const pluginSystem = PluginSystem.getInstance();
    const pluginManager = PluginManager.getInstance();
    const contributionRegistry = ContributionRegistry.getInstance();

    // 清理注册表状态
    contributionRegistry.clear();

    // 如果需要自动初始化
    if (autoInitialize) {
      await pluginManager.initialize(env.extensionContext);
    }

    return {
      pluginSystem,
      pluginManager,
      contributionRegistry,
      extensionContext: env.extensionContext,
      cleanup: env.cleanup
    };
  }

  /**
   * 创建插件加载测试场景
   */
  async createLoadingTestScenario(): Promise<{
    pluginLoader: PluginLoader;
    validManifests: PluginManifest[];
    invalidManifests: Partial<PluginManifest>[];
    cleanup: () => Promise<void>;
  }> {
    const env = await this.environment.setup();

    const pluginLoader = new PluginLoader();

    return {
      pluginLoader,
      validManifests: [
        PluginManifestFactory.createValid(),
        PluginManifestFactory.createWithAllContributions()
      ],
      invalidManifests: [
        PluginManifestFactory.createInvalid(['id']),
        PluginManifestFactory.createWithInvalidVersion(),
        PluginManifestFactory.createWithInvalidId()
      ],
      cleanup: env.cleanup
    };
  }

  /**
   * 创建贡献注册测试场景
   */
  createContributionTestScenario(): {
    contributionRegistry: ContributionRegistry;
    allExtensionPoints: ExtensionPoint[];
    sampleContributions: any[];
    cleanup: () => void;
  } {
    const contributionRegistry = ContributionRegistry.getInstance();
    contributionRegistry.clear();

    const allExtensionPoints = TestScenarios.getAllExtensionPoints();
    const sampleContributions = [
      { point: ExtensionPoint.COMMUNICATION_DRIVERS, contribution: ContributionFactory.createDriver() },
      { point: ExtensionPoint.DATA_PARSERS, contribution: ContributionFactory.createParser() },
      { point: ExtensionPoint.VISUALIZATION_WIDGETS, contribution: ContributionFactory.createWidget() },
      { point: ExtensionPoint.EXPORT_FORMATS, contribution: ContributionFactory.createExportFormat() },
      { point: ExtensionPoint.MENU_CONTRIBUTIONS, contribution: ContributionFactory.createMenu() }
    ];

    return {
      contributionRegistry,
      allExtensionPoints,
      sampleContributions,
      cleanup: () => {
        contributionRegistry.clear();
        vi.clearAllMocks();
      }
    };
  }
}

/**
 * 断言工具集
 */
export class PluginAssertions {
  /**
   * 断言插件已成功加载
   */
  static expectPluginLoaded(pluginManager: PluginManager, pluginId: string): void {
    expect(pluginManager.isPluginLoaded(pluginId)).toBe(true);
    
    const plugin = pluginManager.getPlugin(pluginId);
    expect(plugin).toBeDefined();
    expect(plugin!.manifest.id).toBe(pluginId);
  }

  /**
   * 断言插件已激活
   */
  static expectPluginActivated(pluginManager: PluginManager, pluginId: string): void {
    this.expectPluginLoaded(pluginManager, pluginId);
    expect(pluginManager.isPluginActivated(pluginId)).toBe(true);
    
    const activatedPlugins = pluginManager.getActivatedPlugins();
    expect(activatedPlugins.some(p => p.manifest.id === pluginId)).toBe(true);
  }

  /**
   * 断言插件激活结果
   */
  static expectActivationResult(result: PluginActivationResult, success: boolean, errorMessage?: string): void {
    expect(result.success).toBe(success);
    
    if (success) {
      expect(result.error).toBeUndefined();
      expect(result.exports).toBeDefined();
    } else {
      expect(result.error).toBeDefined();
      if (errorMessage) {
        expect(result.error).toContain(errorMessage);
      }
    }
  }

  /**
   * 断言贡献已注册
   */
  static expectContributionRegistered(
    contributionRegistry: ContributionRegistry,
    extensionPoint: ExtensionPoint,
    contributionId: string,
    pluginId: string
  ): void {
    expect(contributionRegistry.hasContribution(contributionId)).toBe(true);
    expect(contributionRegistry.getContributionOwner(contributionId)).toBe(pluginId);
    
    const contributions = contributionRegistry.getContributions(extensionPoint);
    expect(contributions.some((c: any) => c.id === contributionId)).toBe(true);
  }

  /**
   * 断言事件已触发
   */
  static expectEventEmitted(mockFn: any, event: PluginEvent, pluginId: string): void {
    expect(mockFn).toHaveBeenCalled();
    
    const calls = mockFn.mock.calls;
    const eventCall = calls.find((call: any) => call[0] === event && call[1].pluginId === pluginId);
    expect(eventCall).toBeDefined();
  }

  /**
   * 断言统计信息正确
   */
  static expectStatistics(
    stats: any,
    expectedTotals: { plugins: number; contributions: number }
  ): void {
    expect(stats.totalPlugins).toBe(expectedTotals.plugins);
    expect(stats.totalContributions).toBe(expectedTotals.contributions);
    expect(stats.contributionsByExtensionPoint).toBeDefined();
    expect(typeof stats.contributionsByExtensionPoint).toBe('object');
  }

  /**
   * 断言Mock函数调用序列
   */
  static expectCallSequence(mockFn: any, expectedCalls: any[][]): void {
    expect(mockFn).toHaveBeenCalledTimes(expectedCalls.length);
    
    expectedCalls.forEach((expectedCall, index) => {
      expect(mockFn).toHaveBeenNthCalledWith(index + 1, ...expectedCall);
    });
  }

  /**
   * 断言错误处理
   */
  static expectErrorHandled(mockErrorHandler: any, expectedError: string | Error): void {
    expect(mockErrorHandler).toHaveBeenCalled();
    
    const call = mockErrorHandler.mock.calls[0];
    if (typeof expectedError === 'string') {
      expect(call[0]).toContain(expectedError);
    } else {
      expect(call[0]).toBe(expectedError);
    }
  }
}

/**
 * 性能测试工具
 */
export class PluginPerformanceHelper {
  /**
   * 测量插件加载时间
   */
  static async measureLoadingTime(
    pluginManager: PluginManager,
    manifestPath: string
  ): Promise<number> {
    const startTime = performance.now();
    await pluginManager.loadPlugin(manifestPath);
    const endTime = performance.now();
    
    return endTime - startTime;
  }

  /**
   * 测量插件激活时间
   */
  static async measureActivationTime(
    pluginManager: PluginManager,
    pluginId: string
  ): Promise<number> {
    const startTime = performance.now();
    await pluginManager.activatePlugin(pluginId);
    const endTime = performance.now();
    
    return endTime - startTime;
  }

  /**
   * 批量性能测试
   */
  static async performanceBenchmark(
    operations: Array<() => Promise<void>>
  ): Promise<{
    total: number;
    average: number;
    min: number;
    max: number;
    times: number[];
  }> {
    const times: number[] = [];
    
    for (const operation of operations) {
      const startTime = performance.now();
      await operation();
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
    
    const total = times.reduce((sum, time) => sum + time, 0);
    const average = total / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return { total, average, min, max, times };
  }

  /**
   * 内存使用监控
   */
  static monitorMemoryUsage(): {
    start: () => void;
    stop: () => { initial: number; final: number; delta: number };
  } {
    let initialMemory = 0;
    
    return {
      start: () => {
        if (global.gc) {
          global.gc();
        }
        initialMemory = process.memoryUsage().heapUsed;
      },
      
      stop: () => {
        if (global.gc) {
          global.gc();
        }
        const finalMemory = process.memoryUsage().heapUsed;
        const delta = finalMemory - initialMemory;
        
        return {
          initial: initialMemory,
          final: finalMemory,
          delta
        };
      }
    };
  }
}

/**
 * 并发测试工具
 */
export class PluginConcurrencyHelper {
  /**
   * 并发插件操作测试
   */
  static async concurrentOperations<T>(
    operations: Array<() => Promise<T>>,
    concurrency: number = 10
  ): Promise<T[]> {
    const chunks: Array<() => Promise<T>>[] = [];
    
    // 将操作分组以控制并发度
    for (let i = 0; i < operations.length; i += concurrency) {
      chunks.push(operations.slice(i, i + concurrency));
    }
    
    const results: T[] = [];
    
    // 逐批执行操作
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(op => op()));
      results.push(...chunkResults);
    }
    
    return results;
  }

  /**
   * 竞态条件测试
   */
  static async raceConditionTest(
    operations: Array<() => Promise<any>>
  ): Promise<{
    results: any[];
    completionOrder: number[];
    errors: Error[];
  }> {
    const results: any[] = [];
    const completionOrder: number[] = [];
    const errors: Error[] = [];
    
    const promises = operations.map((operation, index) =>
      operation()
        .then(result => {
          results[index] = result;
          completionOrder.push(index);
        })
        .catch(error => {
          errors.push(error);
        })
    );
    
    await Promise.allSettled(promises);
    
    return { results, completionOrder, errors };
  }

  /**
   * 压力测试
   */
  static async stressTest(
    operation: () => Promise<void>,
    iterations: number = 1000,
    timeoutMs: number = 30000
  ): Promise<{
    successful: number;
    failed: number;
    totalTime: number;
    averageTime: number;
    errors: Error[];
  }> {
    const startTime = Date.now();
    const errors: Error[] = [];
    let successful = 0;
    let failed = 0;
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Stress test timeout')), timeoutMs)
    );
    
    try {
      const promises = Array.from({ length: iterations }, async () => {
        try {
          await operation();
          successful++;
        } catch (error) {
          failed++;
          errors.push(error as Error);
        }
      });
      
      await Promise.race([
        Promise.all(promises),
        timeoutPromise
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Stress test timeout') {
        throw error;
      }
    }
    
    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / iterations;
    
    return {
      successful,
      failed,
      totalTime,
      averageTime,
      errors
    };
  }
}

// 导出便利函数
export function createPluginTestHelper(): PluginSystemTestHelper {
  return new PluginSystemTestHelper();
}

export function createTestEnvironment(): TestEnvironment {
  return new TestEnvironment();
}
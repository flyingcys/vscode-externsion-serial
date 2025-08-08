/**
 * Plugins模块专用Mock工厂
 * 
 * 提供Plugins模块测试所需的所有Mock对象和工厂方法
 * 确保100%覆盖率测试的数据完整性和一致性
 */

import { vi } from 'vitest';
import * as path from 'path';
import * as os from 'os';
import {
  PluginManifest,
  ExtensionPoint,
  PluginCategory,
  DriverContribution,
  ParserContribution,
  ValidatorContribution,
  TransformerContribution,
  WidgetContribution,
  RendererContribution,
  ExportFormatContribution,
  ExportProcessorContribution,
  MenuContribution,
  ToolbarContribution,
  SettingsContribution,
  ThemeContribution,
  IconThemeContribution,
  DebugToolContribution,
  AnalysisToolContribution,
  JSONSchema
} from '../../src/extension/plugins/types';

/**
 * 插件Manifest生成器
 */
export class PluginManifestFactory {
  private static counter = 0;

  /**
   * 创建有效的插件Manifest
   */
  static createValid(overrides: Partial<PluginManifest> = {}): PluginManifest {
    const id = `test-plugin-${++this.counter}`;
    
    return {
      id,
      name: `Test Plugin ${this.counter}`,
      version: '1.0.0',
      description: `Test plugin description ${this.counter}`,
      author: 'Test Author',
      license: 'MIT',
      engines: {
        vscode: '^1.60.0',
        serialStudio: '^1.0.0'
      },
      activationEvents: ['*'],
      main: 'index.js',
      category: 'communication' as PluginCategory,
      keywords: ['test', 'plugin'],
      homepage: `https://example.com/${id}`,
      repository: {
        type: 'git',
        url: `https://github.com/test/${id}.git`
      },
      contributes: {},
      dependencies: {},
      ...overrides
    };
  }

  /**
   * 创建包含所有贡献类型的完整Manifest
   */
  static createWithAllContributions(): PluginManifest {
    const manifest = this.createValid();
    
    manifest.contributes = {
      drivers: [ContributionFactory.createDriver()],
      parsers: [ContributionFactory.createParser()],
      validators: [ContributionFactory.createValidator()],
      transformers: [ContributionFactory.createTransformer()],
      widgets: [ContributionFactory.createWidget()],
      renderers: [ContributionFactory.createRenderer()],
      exportFormats: [ContributionFactory.createExportFormat()],
      exportProcessors: [ContributionFactory.createExportProcessor()],
      menus: [ContributionFactory.createMenu()],
      toolbars: [ContributionFactory.createToolbar()],
      settings: [ContributionFactory.createSettings()],
      themes: [ContributionFactory.createTheme()],
      iconThemes: [ContributionFactory.createIconTheme()],
      debugTools: [ContributionFactory.createDebugTool()],
      analysisTools: [ContributionFactory.createAnalysisTool()]
    };

    return manifest;
  }

  /**
   * 创建无效的Manifest（缺少必需字段）
   */
  static createInvalid(missingFields: string[] = ['id']): Partial<PluginManifest> {
    const valid = this.createValid();
    const invalid: any = { ...valid };
    
    missingFields.forEach(field => {
      delete invalid[field];
    });
    
    return invalid;
  }

  /**
   * 创建版本格式无效的Manifest
   */
  static createWithInvalidVersion(): PluginManifest {
    return this.createValid({
      version: 'invalid-version'
    });
  }

  /**
   * 创建ID格式无效的Manifest
   */
  static createWithInvalidId(): PluginManifest {
    return this.createValid({
      id: 'invalid id with spaces!'
    });
  }

  /**
   * 创建引擎兼容性无效的Manifest
   */
  static createWithInvalidEngines(): PluginManifest {
    return this.createValid({
      engines: {
        vscode: 'invalid-version',
        serialStudio: ''
      }
    });
  }

  /**
   * 创建激活事件无效的Manifest
   */
  static createWithInvalidActivationEvents(): PluginManifest {
    const manifest = this.createValid();
    (manifest as any).activationEvents = 'not-an-array';
    return manifest;
  }
}

/**
 * 贡献点工厂
 */
export class ContributionFactory {
  private static counter = 0;

  static createDriver(overrides: Partial<DriverContribution> = {}): DriverContribution {
    return {
      id: `test-driver-${++this.counter}`,
      name: `Test Driver ${this.counter}`,
      protocol: 'test-protocol',
      driverClass: vi.fn() as any,
      configSchema: this.createJSONSchema(),
      icon: 'test-icon.svg',
      platforms: ['linux', 'win32', 'darwin'],
      ...overrides
    };
  }

  static createParser(overrides: Partial<ParserContribution> = {}): ParserContribution {
    return {
      id: `test-parser-${++this.counter}`,
      name: `Test Parser ${this.counter}`,
      description: 'Test parser description',
      parserClass: vi.fn() as any,
      template: 'function parse(frame) { return []; }',
      examples: ['parse([1,2,3])'],
      supportedFormats: ['json', 'binary'],
      ...overrides
    };
  }

  static createValidator(overrides: Partial<ValidatorContribution> = {}): ValidatorContribution {
    return {
      id: `test-validator-${++this.counter}`,
      name: `Test Validator ${this.counter}`,
      validate: vi.fn().mockReturnValue({ valid: true }),
      schema: this.createJSONSchema(),
      ...overrides
    };
  }

  static createTransformer(overrides: Partial<TransformerContribution> = {}): TransformerContribution {
    return {
      id: `test-transformer-${++this.counter}`,
      name: `Test Transformer ${this.counter}`,
      transform: vi.fn().mockImplementation((data: any) => data),
      inputType: 'any',
      outputType: 'any',
      ...overrides
    };
  }

  static createWidget(overrides: Partial<WidgetContribution> = {}): WidgetContribution {
    return {
      id: `test-widget-${++this.counter}`,
      name: `Test Widget ${this.counter}`,
      type: 'dataset',
      component: vi.fn(),
      configSchema: this.createJSONSchema(),
      preview: 'preview.png',
      supportedDataTypes: ['number', 'string'],
      category: 'display',
      ...overrides
    };
  }

  static createRenderer(overrides: Partial<RendererContribution> = {}): RendererContribution {
    return {
      id: `test-renderer-${++this.counter}`,
      name: `Test Renderer ${this.counter}`,
      renderer: {
        render: vi.fn(),
        update: vi.fn(),
        destroy: vi.fn()
      },
      supportedTypes: ['line', 'bar'],
      ...overrides
    };
  }

  static createExportFormat(overrides: Partial<ExportFormatContribution> = {}): ExportFormatContribution {
    return {
      id: `test-format-${++this.counter}`,
      name: `Test Format ${this.counter}`,
      extension: 'test',
      mimeType: 'application/test',
      export: vi.fn().mockResolvedValue(Buffer.from('test data')),
      description: 'Test export format',
      ...overrides
    };
  }

  static createExportProcessor(overrides: Partial<ExportProcessorContribution> = {}): ExportProcessorContribution {
    return {
      id: `test-processor-${++this.counter}`,
      name: `Test Processor ${this.counter}`,
      process: vi.fn().mockResolvedValue({}),
      supportedFormats: ['csv', 'json'],
      ...overrides
    };
  }

  static createMenu(overrides: Partial<MenuContribution> = {}): MenuContribution {
    return {
      id: `test-menu-${++this.counter}`,
      label: `Test Menu ${this.counter}`,
      command: `test.command.${this.counter}`,
      group: 'test',
      when: 'always',
      shortcut: 'Ctrl+T',
      ...overrides
    };
  }

  static createToolbar(overrides: Partial<ToolbarContribution> = {}): ToolbarContribution {
    return {
      id: `test-toolbar-${++this.counter}`,
      label: `Test Toolbar ${this.counter}`,
      icon: 'test-icon',
      command: `test.command.${this.counter}`,
      group: 'test',
      when: 'always',
      ...overrides
    };
  }

  static createSettings(overrides: Partial<SettingsContribution> = {}): SettingsContribution {
    return {
      id: `test-settings-${++this.counter}`,
      title: `Test Settings ${this.counter}`,
      properties: {
        'test.property': {
          type: 'string',
          default: 'test',
          description: 'Test property'
        }
      },
      ...overrides
    };
  }

  static createTheme(overrides: Partial<ThemeContribution> = {}): ThemeContribution {
    return {
      id: `test-theme-${++this.counter}`,
      name: `Test Theme ${this.counter}`,
      type: 'light',
      path: 'themes/test.css',
      description: 'Test theme',
      ...overrides
    };
  }

  static createIconTheme(overrides: Partial<IconThemeContribution> = {}): IconThemeContribution {
    return {
      id: `test-icon-theme-${++this.counter}`,
      name: `Test Icon Theme ${this.counter}`,
      iconDefinitions: {
        'test-icon': {
          iconPath: 'icons/test.svg'
        }
      },
      fileExtensions: {
        'txt': 'test-icon'
      },
      ...overrides
    };
  }

  static createDebugTool(overrides: Partial<DebugToolContribution> = {}): DebugToolContribution {
    return {
      id: `test-debug-tool-${++this.counter}`,
      name: `Test Debug Tool ${this.counter}`,
      component: vi.fn(),
      when: 'debugMode',
      ...overrides
    };
  }

  static createAnalysisTool(overrides: Partial<AnalysisToolContribution> = {}): AnalysisToolContribution {
    return {
      id: `test-analysis-tool-${++this.counter}`,
      name: `Test Analysis Tool ${this.counter}`,
      analyze: vi.fn().mockResolvedValue({
        summary: 'Test analysis',
        data: {},
        charts: []
      }),
      supportedDataTypes: ['number'],
      ...overrides
    };
  }

  static createJSONSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        testProperty: {
          type: 'string',
          default: 'test'
        }
      },
      required: ['testProperty']
    };
  }
}

/**
 * VSCode扩展上下文Mock工厂
 */
export class ExtensionContextFactory {
  static create(overrides: any = {}): any {
    const tempDir = path.join(os.tmpdir(), 'serial-studio-test');
    
    return {
      extensionPath: tempDir,
      globalStorageUri: { fsPath: path.join(tempDir, 'global') },
      workspaceState: {
        keys: vi.fn().mockReturnValue([]),
        get: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined)
      },
      globalState: {
        keys: vi.fn().mockReturnValue([]),
        get: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined)
      },
      subscriptions: [],
      ...overrides
    };
  }

  static createWithPlugins(pluginPaths: string[]): any {
    const context = this.create();
    
    // 模拟插件目录结构
    const pluginsDir = path.join(context.extensionPath, 'plugins');
    context.pluginDirectories = pluginPaths.map(p => path.join(pluginsDir, p));
    
    return context;
  }
}

/**
 * 插件模块Mock工厂
 */
export class PluginModuleFactory {
  static createValid(exports: any = {}): any {
    return {
      activate: vi.fn().mockResolvedValue(undefined),
      deactivate: vi.fn().mockResolvedValue(undefined),
      ...exports
    };
  }

  static createWithContributions(contributionTypes: string[]): any {
    const module = this.createValid();
    
    contributionTypes.forEach(type => {
      switch (type) {
        case 'drivers':
          module.drivers = [ContributionFactory.createDriver()];
          break;
        case 'parsers':
          module.parsers = [ContributionFactory.createParser()];
          break;
        case 'widgets':
          module.widgets = [ContributionFactory.createWidget()];
          break;
        // 添加更多贡献类型...
      }
    });
    
    return module;
  }

  static createInvalid(missingExports: string[] = []): any {
    const module = this.createValid();
    
    missingExports.forEach(exportName => {
      delete module[exportName];
    });
    
    return module;
  }

  static createAsyncActivate(): any {
    return {
      activate: vi.fn().mockImplementation(async (context: any) => {
        // 模拟异步激活过程
        await new Promise(resolve => setTimeout(resolve, 10));
        return { initialized: true };
      }),
      deactivate: vi.fn().mockResolvedValue(undefined)
    };
  }

  static createFailingActivate(error: Error = new Error('Activation failed')): any {
    return {
      activate: vi.fn().mockRejectedValue(error),
      deactivate: vi.fn().mockResolvedValue(undefined)
    };
  }
}

/**
 * 文件系统Mock工厂
 */
export class FileSystemMockFactory {
  static createWithPluginFiles(plugins: Array<{ dir: string; manifest: PluginManifest; moduleContent?: string }>): void {
    const fs = require('fs/promises');
    
    // Mock readdir to return plugin directories
    fs.readdir.mockImplementation(async (dir: string, options?: any) => {
      if (dir.includes('plugins')) {
        return plugins.map(p => ({
          name: p.dir,
          isDirectory: () => true,
          isFile: () => false
        }));
      }
      return [];
    });
    
    // Mock readFile for manifests
    fs.readFile.mockImplementation(async (filePath: string, encoding?: string) => {
      for (const plugin of plugins) {
        if (filePath.includes(path.join(plugin.dir, 'plugin.json'))) {
          return JSON.stringify(plugin.manifest, null, 2);
        }
        
        if (filePath.includes(path.join(plugin.dir, 'index.js'))) {
          return plugin.moduleContent || 'module.exports = { activate: () => {} };';
        }
      }
      
      throw new Error('File not found');
    });
    
    // Mock access for file existence checks
    fs.access.mockImplementation(async (filePath: string) => {
      for (const plugin of plugins) {
        if (filePath.includes(path.join(plugin.dir, 'plugin.json')) ||
            filePath.includes(path.join(plugin.dir, 'index.js'))) {
          return; // Success
        }
      }
      
      throw new Error('File not found');
    });
  }

  static createEmpty(): void {
    const fs = require('fs/promises');
    
    fs.readdir.mockResolvedValue([]);
    fs.readFile.mockRejectedValue(new Error('File not found'));
    fs.access.mockRejectedValue(new Error('File not found'));
  }

  static createWithErrors(): void {
    const fs = require('fs/promises');
    
    fs.readdir.mockRejectedValue(new Error('Permission denied'));
    fs.readFile.mockRejectedValue(new Error('I/O error'));
    fs.access.mockRejectedValue(new Error('Access denied'));
  }
}

/**
 * 测试场景数据集
 */
export class TestScenarios {
  /**
   * 获取所有扩展点
   */
  static getAllExtensionPoints(): ExtensionPoint[] {
    return Object.values(ExtensionPoint);
  }

  /**
   * 获取所有插件类别
   */
  static getAllPluginCategories(): PluginCategory[] {
    return ['communication', 'visualization', 'data-processing', 'export', 'themes', 'tools', 'other'];
  }

  /**
   * 获取版本测试用例
   */
  static getVersionTestCases(): Array<{ version: string; valid: boolean }> {
    return [
      { version: '1.0.0', valid: true },
      { version: '1.0.0-alpha', valid: true },
      { version: '1.0.0+build.1', valid: true },
      { version: '1.0.0-alpha+build.1', valid: true },
      { version: '1.0', valid: false },
      { version: 'v1.0.0', valid: false },
      { version: '1.0.0.0', valid: false },
      { version: '', valid: false },
      { version: 'invalid', valid: false }
    ];
  }

  /**
   * 获取插件ID测试用例
   */
  static getPluginIdTestCases(): Array<{ id: string; valid: boolean }> {
    return [
      { id: 'valid-plugin', valid: true },
      { id: 'valid.plugin', valid: true },
      { id: 'valid-plugin-123', valid: true },
      { id: 'valid plugin', valid: false },
      { id: 'valid@plugin', valid: false },
      { id: 'valid#plugin', valid: false },
      { id: '', valid: false },
      { id: 'a'.repeat(101), valid: false }
    ];
  }

  /**
   * 获取贡献验证测试用例
   */
  static getContributionValidationCases() {
    return {
      drivers: [
        { contribution: ContributionFactory.createDriver(), valid: true },
        { contribution: { name: 'Missing ID' }, valid: false },
        { contribution: { id: 'test', protocol: 'Missing name' }, valid: false }
      ],
      widgets: [
        { contribution: ContributionFactory.createWidget(), valid: true },
        { contribution: { name: 'Missing ID' }, valid: false },
        { contribution: { id: 'test', type: 'invalid-type' }, valid: false }
      ],
      parsers: [
        { contribution: ContributionFactory.createParser(), valid: true },
        { contribution: { name: 'Missing ID' }, valid: false },
        { contribution: { id: 'test' }, valid: false }
      ]
    };
  }

  /**
   * 获取错误处理测试场景
   */
  static getErrorScenarios() {
    return [
      {
        name: 'File not found',
        setup: () => FileSystemMockFactory.createEmpty(),
        expectedError: 'File not found'
      },
      {
        name: 'Permission denied',
        setup: () => FileSystemMockFactory.createWithErrors(),
        expectedError: 'Permission denied'
      },
      {
        name: 'Invalid JSON',
        setup: () => {
          const fs = require('fs/promises');
          fs.readFile.mockResolvedValue('invalid json');
        },
        expectedError: 'Unexpected token'
      },
      {
        name: 'Module loading error',
        setup: () => {
          const originalRequire = require;
          // @ts-ignore
          require.mockImplementation(() => {
            throw new Error('Module not found');
          });
          return () => {
            // @ts-ignore
            require = originalRequire;
          };
        },
        expectedError: 'Module not found'
      }
    ];
  }
}

/**
 * 测试工具类
 */
export class TestUtils {
  /**
   * 创建临时插件目录
   */
  static async createTempPluginDir(): Promise<string> {
    const fs = require('fs/promises');
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'plugin-test-'));
    return tempDir;
  }

  /**
   * 等待异步操作完成
   */
  static async waitForAsyncOperations(): Promise<void> {
    await new Promise(resolve => setImmediate(resolve));
  }

  /**
   * 验证Mock函数调用
   */
  static expectMockCalls(mockFn: any, expectedCalls: any[]): void {
    expect(mockFn).toHaveBeenCalledTimes(expectedCalls.length);
    expectedCalls.forEach((call, index) => {
      expect(mockFn).toHaveBeenNthCalledWith(index + 1, ...call);
    });
  }

  /**
   * 重置所有Mock
   */
  static resetAllMocks(): void {
    vi.clearAllMocks();
    ContributionFactory['counter'] = 0;
    PluginManifestFactory['counter'] = 0;
  }

  /**
   * 创建Mock Promise
   */
  static createMockPromise<T>(value: T, delay: number = 0): Promise<T> {
    return new Promise(resolve => {
      setTimeout(() => resolve(value), delay);
    });
  }

  /**
   * 创建Mock错误Promise
   */
  static createMockErrorPromise(error: Error, delay: number = 0): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(error), delay);
    });
  }
}
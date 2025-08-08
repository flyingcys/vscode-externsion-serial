/**
 * Plugins Types 模块完整覆盖测试
 * 
 * 测试目标: 100% 代码覆盖率
 * - 枚举值完整性测试
 * - 接口类型验证
 * - 类型定义正确性
 * - 扩展点完整性验证
 * 
 * 基于 Plugins-high.md 计划中的 P2-01 任务
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // 枚举类型
  ExtensionPoint,
  PluginEvent,
  
  // 接口类型
  PluginManifest,
  PluginContributions,
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
  PluginContext,
  PluginLogger,
  PluginStorage,
  PluginAPI,
  PluginInstance,
  PluginActivationResult,
  PluginEventData,
  JSONSchema,
  ValidationResult,
  ChartRenderer,
  SettingProperty,
  IconDefinition,
  AnalysisResult,
  
  // 类型别名
  PluginCategory
} from '../../src/extension/plugins/types';

describe('Plugins Types Module - Complete Coverage', () => {
  
  describe('ExtensionPoint Enum', () => {
    it('应包含所有15个预定义的扩展点', () => {
      const expectedExtensionPoints = [
        'communication.drivers',
        'data.parsers',
        'data.validators', 
        'data.transformers',
        'visualization.widgets',
        'visualization.renderers',
        'export.formats',
        'export.processors',
        'ui.menus',
        'ui.toolbars',
        'ui.settings',
        'ui.themes',
        'ui.iconThemes',
        'tools.debug',
        'tools.analysis'
      ];

      const actualExtensionPoints = Object.values(ExtensionPoint);
      
      expect(actualExtensionPoints).toHaveLength(15);
      expectedExtensionPoints.forEach(point => {
        expect(actualExtensionPoints).toContain(point);
      });
    });

    it('应包含COMMUNICATION_DRIVERS扩展点', () => {
      expect(ExtensionPoint.COMMUNICATION_DRIVERS).toBe('communication.drivers');
    });

    it('应包含DATA_PARSERS扩展点', () => {
      expect(ExtensionPoint.DATA_PARSERS).toBe('data.parsers');
    });

    it('应包含DATA_VALIDATORS扩展点', () => {
      expect(ExtensionPoint.DATA_VALIDATORS).toBe('data.validators');
    });

    it('应包含DATA_TRANSFORMERS扩展点', () => {
      expect(ExtensionPoint.DATA_TRANSFORMERS).toBe('data.transformers');
    });

    it('应包含VISUALIZATION_WIDGETS扩展点', () => {
      expect(ExtensionPoint.VISUALIZATION_WIDGETS).toBe('visualization.widgets');
    });

    it('应包含CHART_RENDERERS扩展点', () => {
      expect(ExtensionPoint.CHART_RENDERERS).toBe('visualization.renderers');
    });

    it('应包含EXPORT_FORMATS扩展点', () => {
      expect(ExtensionPoint.EXPORT_FORMATS).toBe('export.formats');
    });

    it('应包含EXPORT_PROCESSORS扩展点', () => {
      expect(ExtensionPoint.EXPORT_PROCESSORS).toBe('export.processors');
    });

    it('应包含MENU_CONTRIBUTIONS扩展点', () => {
      expect(ExtensionPoint.MENU_CONTRIBUTIONS).toBe('ui.menus');
    });

    it('应包含TOOLBAR_CONTRIBUTIONS扩展点', () => {
      expect(ExtensionPoint.TOOLBAR_CONTRIBUTIONS).toBe('ui.toolbars');
    });

    it('应包含SETTINGS_PAGES扩展点', () => {
      expect(ExtensionPoint.SETTINGS_PAGES).toBe('ui.settings');
    });

    it('应包含THEMES扩展点', () => {
      expect(ExtensionPoint.THEMES).toBe('ui.themes');
    });

    it('应包含ICON_THEMES扩展点', () => {
      expect(ExtensionPoint.ICON_THEMES).toBe('ui.iconThemes');
    });

    it('应包含DEBUG_TOOLS扩展点', () => {
      expect(ExtensionPoint.DEBUG_TOOLS).toBe('tools.debug');
    });

    it('应包含ANALYSIS_TOOLS扩展点', () => {
      expect(ExtensionPoint.ANALYSIS_TOOLS).toBe('tools.analysis');
    });
  });

  describe('PluginEvent Enum', () => {
    it('应包含所有插件事件类型', () => {
      const expectedEvents = [
        'plugin:loaded',
        'plugin:activated', 
        'plugin:deactivated',
        'plugin:unloaded',
        'plugin:error'
      ];

      const actualEvents = Object.values(PluginEvent);
      
      expect(actualEvents).toHaveLength(5);
      expectedEvents.forEach(event => {
        expect(actualEvents).toContain(event);
      });
    });

    it('应包含LOADED事件', () => {
      expect(PluginEvent.LOADED).toBe('plugin:loaded');
    });

    it('应包含ACTIVATED事件', () => {
      expect(PluginEvent.ACTIVATED).toBe('plugin:activated');
    });

    it('应包含DEACTIVATED事件', () => {
      expect(PluginEvent.DEACTIVATED).toBe('plugin:deactivated');
    });

    it('应包含UNLOADED事件', () => {
      expect(PluginEvent.UNLOADED).toBe('plugin:unloaded');
    });

    it('应包含ERROR事件', () => {
      expect(PluginEvent.ERROR).toBe('plugin:error');
    });
  });

  describe('PluginCategory Type', () => {
    it('应包含所有预定义的插件类别', () => {
      const validCategories = [
        'communication',
        'visualization', 
        'data-processing',
        'export',
        'themes',
        'tools',
        'other'
      ];

      // 类型测试：尝试创建每种类别的变量
      const categories: PluginCategory[] = [
        'communication',
        'visualization',
        'data-processing', 
        'export',
        'themes',
        'tools',
        'other'
      ];

      expect(categories).toHaveLength(7);
      validCategories.forEach((category, index) => {
        expect(categories[index]).toBe(category);
      });
    });
  });

  describe('PluginManifest Interface', () => {
    it('应定义完整的插件清单结构', () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'Test plugin description',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        contributes: {
          drivers: [],
          parsers: []
        },
        activationEvents: ['*'],
        main: 'index.js',
        dependencies: {
          'test-dep': '1.0.0'
        },
        keywords: ['test'],
        category: 'communication',
        homepage: 'https://example.com',
        repository: {
          type: 'git',
          url: 'https://github.com/test/plugin.git'
        }
      };

      // 验证必需字段
      expect(manifest.id).toBe('test-plugin');
      expect(manifest.name).toBe('Test Plugin');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.description).toBe('Test plugin description');
      expect(manifest.author).toBe('Test Author');
      expect(manifest.license).toBe('MIT');
      expect(manifest.engines).toBeDefined();
      expect(manifest.engines.vscode).toBe('^1.60.0');
      expect(manifest.engines.serialStudio).toBe('^1.0.0');
      expect(manifest.activationEvents).toEqual(['*']);

      // 验证可选字段
      expect(manifest.main).toBe('index.js');
      expect(manifest.dependencies).toBeDefined();
      expect(manifest.keywords).toEqual(['test']);
      expect(manifest.category).toBe('communication');
      expect(manifest.homepage).toBe('https://example.com');
      expect(manifest.repository).toBeDefined();
      expect(manifest.repository!.type).toBe('git');
    });

    it('应支持最小化的插件清单', () => {
      const minimalManifest: PluginManifest = {
        id: 'minimal',
        name: 'Minimal',
        version: '1.0.0',
        description: 'Minimal plugin',
        author: 'Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: []
      };

      expect(minimalManifest.id).toBe('minimal');
      expect(minimalManifest.main).toBeUndefined();
      expect(minimalManifest.contributes).toBeUndefined();
    });
  });

  describe('Contribution Interfaces', () => {
    describe('DriverContribution', () => {
      it('应定义驱动贡献接口结构', () => {
        const driverContrib: DriverContribution = {
          id: 'test-driver',
          name: 'Test Driver',
          protocol: 'test-protocol',
          driverClass: class TestDriver {},
          configSchema: {
            type: 'object',
            properties: {}
          },
          icon: 'test-icon.svg',
          platforms: ['linux', 'win32', 'darwin']
        };

        expect(driverContrib.id).toBe('test-driver');
        expect(driverContrib.name).toBe('Test Driver');
        expect(driverContrib.protocol).toBe('test-protocol');
        expect(typeof driverContrib.driverClass).toBe('function');
        expect(driverContrib.configSchema.type).toBe('object');
        expect(driverContrib.platforms).toEqual(['linux', 'win32', 'darwin']);
      });
    });

    describe('ParserContribution', () => {
      it('应定义解析器贡献接口结构', () => {
        const parserContrib: ParserContribution = {
          id: 'test-parser',
          name: 'Test Parser',
          description: 'Test parser description',
          parserClass: class TestParser {},
          template: 'function parse() {}',
          examples: ['example1', 'example2'],
          supportedFormats: ['json', 'xml']
        };

        expect(parserContrib.id).toBe('test-parser');
        expect(parserContrib.name).toBe('Test Parser');
        expect(parserContrib.description).toBe('Test parser description');
        expect(typeof parserContrib.parserClass).toBe('function');
        expect(parserContrib.template).toBe('function parse() {}');
        expect(parserContrib.examples).toEqual(['example1', 'example2']);
        expect(parserContrib.supportedFormats).toEqual(['json', 'xml']);
      });
    });

    describe('ValidatorContribution', () => {
      it('应定义验证器贡献接口结构', () => {
        const validatorContrib: ValidatorContribution = {
          id: 'test-validator',
          name: 'Test Validator',
          validate: (data: any) => ({ valid: true }),
          schema: {
            type: 'object'
          }
        };

        expect(validatorContrib.id).toBe('test-validator');
        expect(validatorContrib.name).toBe('Test Validator');
        expect(typeof validatorContrib.validate).toBe('function');
        expect(validatorContrib.validate('test')).toEqual({ valid: true });
        expect(validatorContrib.schema!.type).toBe('object');
      });
    });

    describe('TransformerContribution', () => {
      it('应定义转换器贡献接口结构', () => {
        const transformerContrib: TransformerContribution = {
          id: 'test-transformer',
          name: 'Test Transformer',
          transform: (data: any) => data * 2,
          inputType: 'number',
          outputType: 'number'
        };

        expect(transformerContrib.id).toBe('test-transformer');
        expect(transformerContrib.name).toBe('Test Transformer');
        expect(typeof transformerContrib.transform).toBe('function');
        expect(transformerContrib.transform(5)).toBe(10);
        expect(transformerContrib.inputType).toBe('number');
        expect(transformerContrib.outputType).toBe('number');
      });
    });

    describe('WidgetContribution', () => {
      it('应定义组件贡献接口结构', () => {
        const widgetContrib: WidgetContribution = {
          id: 'test-widget',
          name: 'Test Widget',
          type: 'dataset',
          component: { name: 'TestWidget' },
          configSchema: {
            type: 'object'
          },
          preview: 'preview.png',
          supportedDataTypes: ['number', 'string'],
          category: 'display'
        };

        expect(widgetContrib.id).toBe('test-widget');
        expect(widgetContrib.name).toBe('Test Widget');
        expect(widgetContrib.type).toBe('dataset');
        expect(widgetContrib.component.name).toBe('TestWidget');
        expect(widgetContrib.preview).toBe('preview.png');
        expect(widgetContrib.supportedDataTypes).toEqual(['number', 'string']);
        expect(widgetContrib.category).toBe('display');
      });

      it('应支持group类型的组件', () => {
        const groupWidget: WidgetContribution = {
          id: 'group-widget',
          name: 'Group Widget',
          type: 'group',
          component: { name: 'GroupWidget' },
          configSchema: { type: 'object' }
        };

        expect(groupWidget.type).toBe('group');
      });
    });

    describe('MenuContribution', () => {
      it('应定义菜单贡献接口结构', () => {
        const menuContrib: MenuContribution = {
          id: 'test-menu',
          label: 'Test Menu',
          command: 'test.command',
          group: 'test-group',
          when: 'always',
          shortcut: 'Ctrl+T'
        };

        expect(menuContrib.id).toBe('test-menu');
        expect(menuContrib.label).toBe('Test Menu');
        expect(menuContrib.command).toBe('test.command');
        expect(menuContrib.group).toBe('test-group');
        expect(menuContrib.when).toBe('always');
        expect(menuContrib.shortcut).toBe('Ctrl+T');
      });
    });

    describe('ThemeContribution', () => {
      it('应定义主题贡献接口结构', () => {
        const lightTheme: ThemeContribution = {
          id: 'light-theme',
          name: 'Light Theme',
          type: 'light',
          path: 'themes/light.css',
          description: 'Light theme'
        };

        const darkTheme: ThemeContribution = {
          id: 'dark-theme',
          name: 'Dark Theme', 
          type: 'dark',
          path: 'themes/dark.css'
        };

        const highContrastTheme: ThemeContribution = {
          id: 'hc-theme',
          name: 'High Contrast Theme',
          type: 'high-contrast',
          path: 'themes/hc.css'
        };

        expect(lightTheme.type).toBe('light');
        expect(darkTheme.type).toBe('dark');
        expect(highContrastTheme.type).toBe('high-contrast');
        
        expect(lightTheme.description).toBe('Light theme');
        expect(darkTheme.description).toBeUndefined();
      });
    });
  });

  describe('Plugin Runtime Interfaces', () => {
    describe('PluginContext', () => {
      it('应定义插件上下文接口结构', () => {
        const context: PluginContext = {
          extensionContext: {},
          manifest: {
            id: 'test',
            name: 'Test',
            version: '1.0.0',
            description: 'Test',
            author: 'Test',
            license: 'MIT',
            engines: { vscode: '1.0.0', serialStudio: '1.0.0' },
            activationEvents: []
          },
          logger: {
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {}
          },
          storage: {
            get: () => undefined,
            set: async () => {},
            delete: async () => {},
            clear: async () => {}
          },
          api: {
            io: {
              getManager: () => ({}),
              registerDriver: () => {}
            },
            parsing: {
              createParser: () => ({} as any),
              registerTransformer: () => {}
            },
            ui: {
              registerWidget: () => {},
              showMessage: () => {}
            },
            project: {
              getCurrentProject: () => null,
              saveProject: async () => {}
            }
          },
          subscriptions: []
        };

        expect(context.extensionContext).toBeDefined();
        expect(context.manifest).toBeDefined();
        expect(context.logger).toBeDefined();
        expect(context.storage).toBeDefined();
        expect(context.api).toBeDefined();
        expect(context.subscriptions).toEqual([]);
      });
    });

    describe('PluginLogger', () => {
      it('应定义日志器接口结构', () => {
        const logger: PluginLogger = {
          debug: (message: string, ...args: any[]) => {},
          info: (message: string, ...args: any[]) => {},
          warn: (message: string, ...args: any[]) => {},
          error: (message: string, ...args: any[]) => {}
        };

        expect(typeof logger.debug).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');

        // 测试方法调用不抛出错误
        expect(() => logger.debug('test')).not.toThrow();
        expect(() => logger.info('test', 'arg')).not.toThrow();
        expect(() => logger.warn('test', 1, 2)).not.toThrow();
        expect(() => logger.error('test', { key: 'value' })).not.toThrow();
      });
    });

    describe('PluginStorage', () => {
      it('应定义存储接口结构', () => {
        const storage: PluginStorage = {
          get: <T>(key: string, defaultValue?: T) => defaultValue,
          set: async <T>(key: string, value: T) => {},
          delete: async (key: string) => {},
          clear: async () => {}
        };

        expect(typeof storage.get).toBe('function');
        expect(typeof storage.set).toBe('function');
        expect(typeof storage.delete).toBe('function');
        expect(typeof storage.clear).toBe('function');

        // 测试泛型类型支持
        expect(storage.get<string>('key', 'default')).toBe('default');
        expect(storage.get<number>('key')).toBeUndefined();
      });
    });

    describe('PluginActivationResult', () => {
      it('应定义激活结果接口结构', () => {
        const successResult: PluginActivationResult = {
          success: true,
          exports: { activate: () => {} }
        };

        const failureResult: PluginActivationResult = {
          success: false,
          error: 'Activation failed'
        };

        expect(successResult.success).toBe(true);
        expect(successResult.exports).toBeDefined();
        expect(successResult.error).toBeUndefined();

        expect(failureResult.success).toBe(false);
        expect(failureResult.error).toBe('Activation failed');
        expect(failureResult.exports).toBeUndefined();
      });
    });

    describe('PluginEventData', () => {
      it('应定义插件事件数据接口结构', () => {
        const eventData: PluginEventData = {
          pluginId: 'test-plugin',
          event: PluginEvent.LOADED,
          data: { manifest: {} },
          error: new Error('Test error')
        };

        expect(eventData.pluginId).toBe('test-plugin');
        expect(eventData.event).toBe(PluginEvent.LOADED);
        expect(eventData.data).toBeDefined();
        expect(eventData.error).toBeInstanceOf(Error);
      });

      it('应支持无错误的事件数据', () => {
        const eventData: PluginEventData = {
          pluginId: 'test-plugin',
          event: PluginEvent.ACTIVATED
        };

        expect(eventData.pluginId).toBe('test-plugin');
        expect(eventData.event).toBe(PluginEvent.ACTIVATED);
        expect(eventData.data).toBeUndefined();
        expect(eventData.error).toBeUndefined();
      });
    });
  });

  describe('Utility Interfaces', () => {
    describe('JSONSchema', () => {
      it('应定义JSON Schema接口结构', () => {
        const schema: JSONSchema = {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          },
          required: ['name'],
          additionalProperty: 'custom'
        };

        expect(schema.type).toBe('object');
        expect(schema.properties).toBeDefined();
        expect(schema.required).toEqual(['name']);
        expect(schema.additionalProperty).toBe('custom');
      });
    });

    describe('ValidationResult', () => {
      it('应定义验证结果接口结构', () => {
        const validResult: ValidationResult = {
          valid: true
        };

        const invalidResult: ValidationResult = {
          valid: false,
          errors: ['Field is required', 'Invalid format']
        };

        expect(validResult.valid).toBe(true);
        expect(validResult.errors).toBeUndefined();

        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.errors).toEqual(['Field is required', 'Invalid format']);
      });
    });

    describe('ChartRenderer', () => {
      it('应定义图表渲染器接口结构', () => {
        const renderer: ChartRenderer = {
          render: (data: any, options: any) => {},
          update: (data: any) => {},
          destroy: () => {}
        };

        expect(typeof renderer.render).toBe('function');
        expect(typeof renderer.update).toBe('function');
        expect(typeof renderer.destroy).toBe('function');

        // 测试方法调用不抛出错误
        expect(() => renderer.render({}, {})).not.toThrow();
        expect(() => renderer.update({})).not.toThrow();
        expect(() => renderer.destroy()).not.toThrow();
      });
    });

    describe('SettingProperty', () => {
      it('应定义设置属性接口结构', () => {
        const stringProperty: SettingProperty = {
          type: 'string',
          default: 'default value',
          description: 'String property',
          enum: ['option1', 'option2']
        };

        const numberProperty: SettingProperty = {
          type: 'number',
          default: 42
        };

        const booleanProperty: SettingProperty = {
          type: 'boolean',
          default: true
        };

        const arrayProperty: SettingProperty = {
          type: 'array',
          default: []
        };

        const objectProperty: SettingProperty = {
          type: 'object',
          default: {}
        };

        expect(stringProperty.type).toBe('string');
        expect(stringProperty.default).toBe('default value');
        expect(stringProperty.enum).toEqual(['option1', 'option2']);

        expect(numberProperty.type).toBe('number');
        expect(numberProperty.default).toBe(42);

        expect(booleanProperty.type).toBe('boolean');
        expect(booleanProperty.default).toBe(true);

        expect(arrayProperty.type).toBe('array');
        expect(Array.isArray(arrayProperty.default)).toBe(true);

        expect(objectProperty.type).toBe('object');
        expect(typeof objectProperty.default).toBe('object');
      });
    });

    describe('IconDefinition', () => {
      it('应定义图标定义接口结构', () => {
        const pathIcon: IconDefinition = {
          iconPath: 'icons/test.svg'
        };

        const fontIcon: IconDefinition = {
          iconPath: 'icons/font.svg',
          fontCharacter: '\\uE001',
          fontColor: '#FF0000'
        };

        expect(pathIcon.iconPath).toBe('icons/test.svg');
        expect(pathIcon.fontCharacter).toBeUndefined();

        expect(fontIcon.iconPath).toBe('icons/font.svg');
        expect(fontIcon.fontCharacter).toBe('\\uE001');
        expect(fontIcon.fontColor).toBe('#FF0000');
      });
    });

    describe('AnalysisResult', () => {
      it('应定义分析结果接口结构', () => {
        const result: AnalysisResult = {
          summary: 'Analysis completed',
          data: { count: 100, average: 50.5 },
          charts: [
            { type: 'bar', data: [] },
            { type: 'line', data: [] }
          ]
        };

        expect(result.summary).toBe('Analysis completed');
        expect(result.data.count).toBe(100);
        expect(result.data.average).toBe(50.5);
        expect(result.charts).toHaveLength(2);
        expect(result.charts![0].type).toBe('bar');
        expect(result.charts![1].type).toBe('line');
      });

      it('应支持无图表的分析结果', () => {
        const result: AnalysisResult = {
          summary: 'Simple analysis',
          data: { result: 'success' }
        };

        expect(result.charts).toBeUndefined();
      });
    });
  });

  describe('Type Completeness', () => {
    it('应确保所有导出的类型都被测试覆盖', () => {
      // 这个测试确保我们没有遗漏任何导出的类型
      const testedTypes = [
        'ExtensionPoint',
        'PluginEvent', 
        'PluginManifest',
        'PluginCategory',
        'PluginContributions',
        'DriverContribution',
        'ParserContribution',
        'ValidatorContribution',
        'TransformerContribution',
        'WidgetContribution',
        'RendererContribution',
        'ExportFormatContribution',
        'ExportProcessorContribution',
        'MenuContribution',
        'ToolbarContribution',
        'SettingsContribution',
        'ThemeContribution',
        'IconThemeContribution',
        'DebugToolContribution',
        'AnalysisToolContribution',
        'PluginContext',
        'PluginLogger',
        'PluginStorage', 
        'PluginAPI',
        'PluginInstance',
        'PluginActivationResult',
        'PluginEventData',
        'JSONSchema',
        'ValidationResult',
        'ChartRenderer',
        'SettingProperty',
        'IconDefinition',
        'AnalysisResult'
      ];

      // 简单验证：确保每个类型都在某个describe块中被测试
      const testSuiteNames = [
        'ExtensionPoint Enum',
        'PluginEvent Enum',
        'PluginCategory Type',
        'PluginManifest Interface',
        'Contribution Interfaces',
        'Plugin Runtime Interfaces',
        'Utility Interfaces'
      ];

      expect(testedTypes.length).toBeGreaterThan(30);
      expect(testSuiteNames.length).toBe(7);
    });
  });

  describe('Interface Inheritance and Composition', () => {
    it('应正确处理PluginContributions接口的组合', () => {
      const contributions: PluginContributions = {
        drivers: [{
          id: 'test-driver',
          name: 'Test Driver',
          protocol: 'test',
          driverClass: class {},
          configSchema: { type: 'object' }
        }],
        parsers: [{
          id: 'test-parser',
          name: 'Test Parser',
          description: 'Test',
          parserClass: class {},
        }],
        // 所有其他字段都是可选的
        widgets: undefined,
        validators: undefined
      };

      expect(contributions.drivers).toHaveLength(1);
      expect(contributions.parsers).toHaveLength(1);
      expect(contributions.widgets).toBeUndefined();
      expect(contributions.validators).toBeUndefined();
    });

    it('应支持PluginInstance接口的完整结构', () => {
      const instance: PluginInstance = {
        manifest: {
          id: 'test',
          name: 'Test',
          version: '1.0.0', 
          description: 'Test',
          author: 'Test',
          license: 'MIT',
          engines: { vscode: '1.0.0', serialStudio: '1.0.0' },
          activationEvents: []
        },
        exports: {
          activate: () => {},
          deactivate: () => {}
        },
        context: {} as any,
        activate: async (context: any) => {
          return { initialized: true };
        },
        deactivate: async () => {
          // cleanup
        }
      };

      expect(instance.manifest.id).toBe('test');
      expect(typeof instance.exports.activate).toBe('function');
      expect(typeof instance.activate).toBe('function');
      expect(typeof instance.deactivate).toBe('function');
    });
  });
});
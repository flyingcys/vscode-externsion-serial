/**
 * ContributionRegistry 完整测试
 * 
 * 测试目标: 100% 代码覆盖率，与实际API完全匹配
 * - 所有15个扩展点的完整测试
 * - 注册、查询、注销功能的完整覆盖
 * - 事件系统和错误处理
 * - 统计信息和性能测试
 * 
 * 基于 ContributionRegistry.ts 的实际API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContributionRegistry, ContributionStatistics } from '../../src/extension/plugins/ContributionRegistry';
import { 
  ExtensionPoint,
  PluginEvent,
  PluginEventData,
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
  AnalysisToolContribution
} from '../../src/extension/plugins/types';
import {
  ContributionFactory
} from '../mocks/plugins-mock-factory';

describe('ContributionRegistry - Complete API Test', () => {
  let contributionRegistry: ContributionRegistry;

  beforeEach(() => {
    contributionRegistry = ContributionRegistry.getInstance();
    contributionRegistry.clear();
  });

  afterEach(() => {
    contributionRegistry.clear();
    vi.resetAllMocks();
  });

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = ContributionRegistry.getInstance();
      const instance2 = ContributionRegistry.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(contributionRegistry);
    });
  });

  describe('贡献注册 - register()', () => {
    describe('所有15个扩展点的注册', () => {
      it('应该成功注册 COMMUNICATION_DRIVERS 贡献', () => {
        const driver = ContributionFactory.createDriver({ id: 'test-driver' });
        
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
        
        const drivers = contributionRegistry.getContributions<DriverContribution>(ExtensionPoint.COMMUNICATION_DRIVERS);
        expect(drivers).toHaveLength(1);
        expect(drivers[0].id).toBe('test-driver');
      });

      it('应该成功注册 DATA_PARSERS 贡献', () => {
        const parser = ContributionFactory.createParser({ id: 'test-parser' });
        
        contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parser, 'test-plugin');
        
        const parsers = contributionRegistry.getContributions<ParserContribution>(ExtensionPoint.DATA_PARSERS);
        expect(parsers).toHaveLength(1);
        expect(parsers[0].id).toBe('test-parser');
      });

      it('应该成功注册 DATA_VALIDATORS 贡献', () => {
        const validator = ContributionFactory.createValidator({ id: 'test-validator' });
        
        contributionRegistry.register(ExtensionPoint.DATA_VALIDATORS, validator, 'test-plugin');
        
        const validators = contributionRegistry.getContributions<ValidatorContribution>(ExtensionPoint.DATA_VALIDATORS);
        expect(validators).toHaveLength(1);
        expect(validators[0].id).toBe('test-validator');
      });

      it('应该成功注册 DATA_TRANSFORMERS 贡献', () => {
        const transformer = ContributionFactory.createTransformer({ id: 'test-transformer' });
        
        contributionRegistry.register(ExtensionPoint.DATA_TRANSFORMERS, transformer, 'test-plugin');
        
        const transformers = contributionRegistry.getContributions<TransformerContribution>(ExtensionPoint.DATA_TRANSFORMERS);
        expect(transformers).toHaveLength(1);
        expect(transformers[0].id).toBe('test-transformer');
      });

      it('应该成功注册 VISUALIZATION_WIDGETS 贡献', () => {
        const widget = ContributionFactory.createWidget({ id: 'test-widget' });
        
        contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
        
        const widgets = contributionRegistry.getContributions<WidgetContribution>(ExtensionPoint.VISUALIZATION_WIDGETS);
        expect(widgets).toHaveLength(1);
        expect(widgets[0].id).toBe('test-widget');
      });

      it('应该成功注册 CHART_RENDERERS 贡献', () => {
        const renderer = ContributionFactory.createRenderer({ id: 'test-renderer' });
        
        contributionRegistry.register(ExtensionPoint.CHART_RENDERERS, renderer, 'test-plugin');
        
        const renderers = contributionRegistry.getContributions<RendererContribution>(ExtensionPoint.CHART_RENDERERS);
        expect(renderers).toHaveLength(1);
        expect(renderers[0].id).toBe('test-renderer');
      });

      it('应该成功注册 EXPORT_FORMATS 贡献', () => {
        const format = ContributionFactory.createExportFormat({ id: 'test-format' });
        
        contributionRegistry.register(ExtensionPoint.EXPORT_FORMATS, format, 'test-plugin');
        
        const formats = contributionRegistry.getContributions<ExportFormatContribution>(ExtensionPoint.EXPORT_FORMATS);
        expect(formats).toHaveLength(1);
        expect(formats[0].id).toBe('test-format');
      });

      it('应该成功注册 EXPORT_PROCESSORS 贡献', () => {
        const processor = ContributionFactory.createExportProcessor({ id: 'test-processor' });
        
        contributionRegistry.register(ExtensionPoint.EXPORT_PROCESSORS, processor, 'test-plugin');
        
        const processors = contributionRegistry.getContributions<ExportProcessorContribution>(ExtensionPoint.EXPORT_PROCESSORS);
        expect(processors).toHaveLength(1);
        expect(processors[0].id).toBe('test-processor');
      });

      it('应该成功注册 MENU_CONTRIBUTIONS 贡献', () => {
        const menu = ContributionFactory.createMenu({ id: 'test-menu' });
        
        contributionRegistry.register(ExtensionPoint.MENU_CONTRIBUTIONS, menu, 'test-plugin');
        
        const menus = contributionRegistry.getContributions<MenuContribution>(ExtensionPoint.MENU_CONTRIBUTIONS);
        expect(menus).toHaveLength(1);
        expect(menus[0].id).toBe('test-menu');
      });

      it('应该成功注册 TOOLBAR_CONTRIBUTIONS 贡献', () => {
        const toolbar = ContributionFactory.createToolbar({ id: 'test-toolbar' });
        
        contributionRegistry.register(ExtensionPoint.TOOLBAR_CONTRIBUTIONS, toolbar, 'test-plugin');
        
        const toolbars = contributionRegistry.getContributions<ToolbarContribution>(ExtensionPoint.TOOLBAR_CONTRIBUTIONS);
        expect(toolbars).toHaveLength(1);
        expect(toolbars[0].id).toBe('test-toolbar');
      });

      it('应该成功注册 SETTINGS_PAGES 贡献', () => {
        const settings = ContributionFactory.createSettings({ id: 'test-settings' });
        
        contributionRegistry.register(ExtensionPoint.SETTINGS_PAGES, settings, 'test-plugin');
        
        const settingsPages = contributionRegistry.getContributions<SettingsContribution>(ExtensionPoint.SETTINGS_PAGES);
        expect(settingsPages).toHaveLength(1);
        expect(settingsPages[0].id).toBe('test-settings');
      });

      it('应该成功注册 THEMES 贡献', () => {
        const theme = ContributionFactory.createTheme({ id: 'test-theme' });
        
        contributionRegistry.register(ExtensionPoint.THEMES, theme, 'test-plugin');
        
        const themes = contributionRegistry.getContributions<ThemeContribution>(ExtensionPoint.THEMES);
        expect(themes).toHaveLength(1);
        expect(themes[0].id).toBe('test-theme');
      });

      it('应该成功注册 ICON_THEMES 贡献', () => {
        const iconTheme = ContributionFactory.createIconTheme({ id: 'test-icon-theme' });
        
        contributionRegistry.register(ExtensionPoint.ICON_THEMES, iconTheme, 'test-plugin');
        
        const iconThemes = contributionRegistry.getContributions<IconThemeContribution>(ExtensionPoint.ICON_THEMES);
        expect(iconThemes).toHaveLength(1);
        expect(iconThemes[0].id).toBe('test-icon-theme');
      });

      it('应该成功注册 DEBUG_TOOLS 贡献', () => {
        const debugTool = ContributionFactory.createDebugTool({ id: 'test-debug-tool' });
        
        contributionRegistry.register(ExtensionPoint.DEBUG_TOOLS, debugTool, 'test-plugin');
        
        const debugTools = contributionRegistry.getContributions<DebugToolContribution>(ExtensionPoint.DEBUG_TOOLS);
        expect(debugTools).toHaveLength(1);
        expect(debugTools[0].id).toBe('test-debug-tool');
      });

      it('应该成功注册 ANALYSIS_TOOLS 贡献', () => {
        const analysisTool = ContributionFactory.createAnalysisTool({ id: 'test-analysis-tool' });
        
        contributionRegistry.register(ExtensionPoint.ANALYSIS_TOOLS, analysisTool, 'test-plugin');
        
        const analysisTools = contributionRegistry.getContributions<AnalysisToolContribution>(ExtensionPoint.ANALYSIS_TOOLS);
        expect(analysisTools).toHaveLength(1);
        expect(analysisTools[0].id).toBe('test-analysis-tool');
      });
    });

    describe('注册验证', () => {
      it('应该拒绝没有id字段的贡献', () => {
        const invalidContribution = { name: 'No ID Contribution' };
        
        expect(() => {
          contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, invalidContribution, 'test-plugin');
        }).toThrow('Contribution must have a valid id field');
      });

      it('应该拒绝id字段不是字符串的贡献', () => {
        const invalidContribution = { id: 123, name: 'Invalid ID Type' };
        
        expect(() => {
          contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, invalidContribution, 'test-plugin');
        }).toThrow('Contribution must have a valid id field');
      });

      it('应该拒绝null贡献', () => {
        expect(() => {
          contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, null, 'test-plugin');
        }).toThrow('Contribution must have a valid id field');
      });

      it('应该拒绝undefined贡献', () => {
        expect(() => {
          contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, undefined, 'test-plugin');
        }).toThrow('Contribution must have a valid id field');
      });
    });

    describe('重复注册处理', () => {
      it('应该拒绝不同插件注册相同ID的贡献', () => {
        const contribution1 = ContributionFactory.createDriver({ id: 'same-id' });
        const contribution2 = ContributionFactory.createDriver({ id: 'same-id' });
        
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, contribution1, 'plugin1');
        
        expect(() => {
          contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, contribution2, 'plugin2');
        }).toThrow("Contribution 'same-id' is already registered by plugin 'plugin1'");
      });

      it('应该允许同一插件重复注册相同贡献', () => {
        const contribution = ContributionFactory.createDriver({ id: 'same-contribution' });
        
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, contribution, 'test-plugin');
        
        expect(() => {
          contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, contribution, 'test-plugin');
        }).not.toThrow();
        
        const drivers = contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS);
        expect(drivers).toHaveLength(1);
      });
    });

    describe('未知扩展点处理', () => {
      it('应该拒绝未知的扩展点', () => {
        const contribution = ContributionFactory.createDriver({ id: 'test-driver' });
        
        expect(() => {
          contributionRegistry.register('unknown.extension.point' as ExtensionPoint, contribution, 'test-plugin');
        }).toThrow('Unknown extension point: unknown.extension.point');
      });
    });
  });

  describe('贡献查询 - getContributions()', () => {
    it('应该返回指定扩展点的所有贡献', () => {
      const driver1 = ContributionFactory.createDriver({ id: 'driver1' });
      const driver2 = ContributionFactory.createDriver({ id: 'driver2' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver1, 'plugin1');
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver2, 'plugin2');
      
      const drivers = contributionRegistry.getContributions<DriverContribution>(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(drivers).toHaveLength(2);
      expect(drivers.map(d => d.id)).toContain('driver1');
      expect(drivers.map(d => d.id)).toContain('driver2');
    });

    it('应该返回空数组当没有贡献时', () => {
      const drivers = contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(drivers).toEqual([]);
    });

    it('应该返回空数组对于未知扩展点', () => {
      const contributions = contributionRegistry.getContributions('unknown.point' as ExtensionPoint);
      expect(contributions).toEqual([]);
    });
  });

  describe('单个贡献查询 - getContribution()', () => {
    it('应该通过ID查找贡献', () => {
      const driver = ContributionFactory.createDriver({ id: 'specific-driver' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      const found = contributionRegistry.getContribution<DriverContribution>('specific-driver');
      expect(found).toBeDefined();
      expect(found!.id).toBe('specific-driver');
    });

    it('应该在所有扩展点中搜索', () => {
      const driver = ContributionFactory.createDriver({ id: 'test-driver' });
      const widget = ContributionFactory.createWidget({ id: 'test-widget' });
      const parser = ContributionFactory.createParser({ id: 'test-parser' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'plugin1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'plugin2');
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parser, 'plugin3');
      
      expect(contributionRegistry.getContribution('test-driver')).toBe(driver);
      expect(contributionRegistry.getContribution('test-widget')).toBe(widget);
      expect(contributionRegistry.getContribution('test-parser')).toBe(parser);
    });

    it('应该返回undefined对于不存在的贡献', () => {
      const found = contributionRegistry.getContribution('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('插件贡献管理', () => {
    it('应该跟踪插件的所有贡献', () => {
      const driver = ContributionFactory.createDriver({ id: 'plugin-driver' });
      const widget = ContributionFactory.createWidget({ id: 'plugin-widget' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
      
      const pluginContributions = contributionRegistry.getPluginContributions('test-plugin');
      expect(pluginContributions).toHaveLength(2);
      expect(pluginContributions.map((c: any) => c.id)).toContain('plugin-driver');
      expect(pluginContributions.map((c: any) => c.id)).toContain('plugin-widget');
    });

    it('应该返回空数组对于没有贡献的插件', () => {
      const contributions = contributionRegistry.getPluginContributions('non-existent-plugin');
      expect(contributions).toEqual([]);
    });

    it('应该正确处理部分贡献被删除的情况', () => {
      const driver = ContributionFactory.createDriver({ id: 'driver-to-delete' });
      const widget = ContributionFactory.createWidget({ id: 'widget-to-keep' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
      
      // 手动删除驱动贡献（模拟部分删除）
      contributionRegistry.unregister('driver-to-delete', 'test-plugin');
      
      const remainingContributions = contributionRegistry.getPluginContributions('test-plugin');
      expect(remainingContributions).toHaveLength(1);
      expect(remainingContributions[0].id).toBe('widget-to-keep');
    });
  });

  describe('贡献所有权管理', () => {
    it('应该跟踪贡献的所有者', () => {
      const driver = ContributionFactory.createDriver({ id: 'owned-driver' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'owner-plugin');
      
      const owner = contributionRegistry.getContributionOwner('owned-driver');
      expect(owner).toBe('owner-plugin');
    });

    it('应该返回undefined对于不存在的贡献所有者', () => {
      const owner = contributionRegistry.getContributionOwner('non-existent');
      expect(owner).toBeUndefined();
    });

    it('应该正确检查贡献是否存在', () => {
      const driver = ContributionFactory.createDriver({ id: 'existing-driver' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      expect(contributionRegistry.hasContribution('existing-driver')).toBe(true);
      expect(contributionRegistry.hasContribution('non-existent')).toBe(false);
    });
  });

  describe('贡献注销 - unregister()', () => {
    it('应该成功注销贡献', () => {
      const driver = ContributionFactory.createDriver({ id: 'driver-to-unregister' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      expect(contributionRegistry.hasContribution('driver-to-unregister')).toBe(true);
      
      contributionRegistry.unregister('driver-to-unregister', 'test-plugin');
      
      expect(contributionRegistry.hasContribution('driver-to-unregister')).toBe(false);
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(0);
    });

    it('应该拒绝非所有者注销贡献', () => {
      const driver = ContributionFactory.createDriver({ id: 'protected-driver' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'owner-plugin');
      
      expect(() => {
        contributionRegistry.unregister('protected-driver', 'different-plugin');
      }).toThrow("Cannot unregister contribution 'protected-driver': owned by different plugin");
    });

    it('应该清理所有相关的跟踪信息', () => {
      const driver = ContributionFactory.createDriver({ id: 'cleanup-test' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      contributionRegistry.unregister('cleanup-test', 'test-plugin');
      
      expect(contributionRegistry.hasContribution('cleanup-test')).toBe(false);
      expect(contributionRegistry.getContributionOwner('cleanup-test')).toBeUndefined();
      expect(contributionRegistry.getPluginContributions('test-plugin')).toHaveLength(0);
    });
  });

  describe('插件批量注销 - unregisterPlugin()', () => {
    it('应该注销插件的所有贡献', () => {
      const driver = ContributionFactory.createDriver({ id: 'plugin-driver' });
      const widget = ContributionFactory.createWidget({ id: 'plugin-widget' });
      const parser = ContributionFactory.createParser({ id: 'plugin-parser' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parser, 'test-plugin');
      
      expect(contributionRegistry.getPluginContributions('test-plugin')).toHaveLength(3);
      
      contributionRegistry.unregisterPlugin('test-plugin');
      
      expect(contributionRegistry.getPluginContributions('test-plugin')).toHaveLength(0);
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(0);
      expect(contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(0);
      expect(contributionRegistry.getContributions(ExtensionPoint.DATA_PARSERS)).toHaveLength(0);
    });

    it('应该安全处理不存在的插件', () => {
      expect(() => {
        contributionRegistry.unregisterPlugin('non-existent-plugin');
      }).not.toThrow();
    });

    it('应该不影响其他插件的贡献', () => {
      const driver1 = ContributionFactory.createDriver({ id: 'plugin1-driver' });
      const driver2 = ContributionFactory.createDriver({ id: 'plugin2-driver' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver1, 'plugin1');
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver2, 'plugin2');
      
      contributionRegistry.unregisterPlugin('plugin1');
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      expect(contributionRegistry.getContribution('plugin2-driver')).toBeDefined();
      expect(contributionRegistry.getContribution('plugin1-driver')).toBeUndefined();
    });
  });

  describe('扩展点管理', () => {
    it('应该返回所有扩展点', () => {
      const extensionPoints = contributionRegistry.getExtensionPoints();
      
      expect(extensionPoints).toHaveLength(15);
      expect(extensionPoints).toContain(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(extensionPoints).toContain(ExtensionPoint.DATA_PARSERS);
      expect(extensionPoints).toContain(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(extensionPoints).toContain(ExtensionPoint.ANALYSIS_TOOLS);
    });

    it('应该包含所有预期的扩展点', () => {
      const extensionPoints = contributionRegistry.getExtensionPoints();
      
      const expectedPoints = [
        ExtensionPoint.COMMUNICATION_DRIVERS,
        ExtensionPoint.DATA_PARSERS,
        ExtensionPoint.DATA_VALIDATORS,
        ExtensionPoint.DATA_TRANSFORMERS,
        ExtensionPoint.VISUALIZATION_WIDGETS,
        ExtensionPoint.CHART_RENDERERS,
        ExtensionPoint.EXPORT_FORMATS,
        ExtensionPoint.EXPORT_PROCESSORS,
        ExtensionPoint.MENU_CONTRIBUTIONS,
        ExtensionPoint.TOOLBAR_CONTRIBUTIONS,
        ExtensionPoint.SETTINGS_PAGES,
        ExtensionPoint.THEMES,
        ExtensionPoint.ICON_THEMES,
        ExtensionPoint.DEBUG_TOOLS,
        ExtensionPoint.ANALYSIS_TOOLS
      ];
      
      expectedPoints.forEach(point => {
        expect(extensionPoints).toContain(point);
      });
    });
  });

  describe('统计信息 - getStatistics()', () => {
    it('应该返回准确的统计信息', () => {
      // 注册一些贡献
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, 
        ContributionFactory.createDriver({ id: 'driver1' }), 'plugin1');
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, 
        ContributionFactory.createDriver({ id: 'driver2' }), 'plugin1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, 
        ContributionFactory.createWidget({ id: 'widget1' }), 'plugin2');
      
      const stats = contributionRegistry.getStatistics();
      
      expect(stats.totalContributions).toBe(3);
      expect(stats.totalPlugins).toBe(2);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.COMMUNICATION_DRIVERS]).toBe(2);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.VISUALIZATION_WIDGETS]).toBe(1);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.DATA_PARSERS]).toBe(0);
    });

    it('应该在空注册表时返回零统计', () => {
      const stats = contributionRegistry.getStatistics();
      
      expect(stats.totalContributions).toBe(0);
      expect(stats.totalPlugins).toBe(0);
      
      Object.values(ExtensionPoint).forEach(extensionPoint => {
        expect(stats.contributionsByExtensionPoint[extensionPoint]).toBe(0);
      });
    });

    it('应该包含所有扩展点的统计信息', () => {
      const stats = contributionRegistry.getStatistics();
      
      Object.values(ExtensionPoint).forEach(extensionPoint => {
        expect(stats.contributionsByExtensionPoint).toHaveProperty(extensionPoint);
        expect(typeof stats.contributionsByExtensionPoint[extensionPoint]).toBe('number');
      });
    });
  });

  describe('事件系统', () => {
    it('应该添加和调用事件监听器', () => {
      const listener = vi.fn();
      const eventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.LOADED
      };
      
      contributionRegistry.addEventListener(PluginEvent.LOADED, listener);
      contributionRegistry.emitEvent(PluginEvent.LOADED, eventData);
      
      expect(listener).toHaveBeenCalledWith(eventData);
    });

    it('应该支持多个监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const eventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.ACTIVATED
      };
      
      contributionRegistry.addEventListener(PluginEvent.ACTIVATED, listener1);
      contributionRegistry.addEventListener(PluginEvent.ACTIVATED, listener2);
      contributionRegistry.emitEvent(PluginEvent.ACTIVATED, eventData);
      
      expect(listener1).toHaveBeenCalledWith(eventData);
      expect(listener2).toHaveBeenCalledWith(eventData);
    });

    it('应该移除事件监听器', () => {
      const listener = vi.fn();
      const eventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.DEACTIVATED
      };
      
      contributionRegistry.addEventListener(PluginEvent.DEACTIVATED, listener);
      contributionRegistry.removeEventListener(PluginEvent.DEACTIVATED, listener);
      contributionRegistry.emitEvent(PluginEvent.DEACTIVATED, eventData);
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('应该处理监听器中的错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const eventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.ERROR
      };
      
      contributionRegistry.addEventListener(PluginEvent.ERROR, errorListener);
      contributionRegistry.addEventListener(PluginEvent.ERROR, normalListener);
      contributionRegistry.emitEvent(PluginEvent.ERROR, eventData);
      
      expect(errorListener).toHaveBeenCalledWith(eventData);
      expect(normalListener).toHaveBeenCalledWith(eventData);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('应该安全处理不存在的事件类型', () => {
      const eventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.LOADED
      };
      
      expect(() => {
        contributionRegistry.emitEvent(PluginEvent.LOADED, eventData);
      }).not.toThrow();
    });

    it('应该安全处理移除不存在的监听器', () => {
      const listener = vi.fn();
      
      expect(() => {
        contributionRegistry.removeEventListener(PluginEvent.LOADED, listener);
      }).not.toThrow();
    });
  });

  describe('清理功能 - clear()', () => {
    it('应该清除所有贡献和跟踪信息', () => {
      // 注册各种贡献
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, 
        ContributionFactory.createDriver({ id: 'driver1' }), 'plugin1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, 
        ContributionFactory.createWidget({ id: 'widget1' }), 'plugin2');
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, 
        ContributionFactory.createParser({ id: 'parser1' }), 'plugin3');
      
      // 添加事件监听器
      const listener = vi.fn();
      contributionRegistry.addEventListener(PluginEvent.LOADED, listener);
      
      // 验证注册成功
      expect(contributionRegistry.getStatistics().totalContributions).toBe(3);
      expect(contributionRegistry.getStatistics().totalPlugins).toBe(3);
      
      // 清理
      contributionRegistry.clear();
      
      // 验证清理结果
      const stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(0);
      expect(stats.totalPlugins).toBe(0);
      
      // 验证所有扩展点都为空
      Object.values(ExtensionPoint).forEach(extensionPoint => {
        expect(contributionRegistry.getContributions(extensionPoint)).toHaveLength(0);
      });
      
      // 验证事件监听器被清理
      contributionRegistry.emitEvent(PluginEvent.LOADED, {
        pluginId: 'test',
        event: PluginEvent.LOADED
      });
      expect(listener).not.toHaveBeenCalled();
    });

    it('应该在清理后保持功能正常', () => {
      // 先注册一些贡献
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, 
        ContributionFactory.createDriver({ id: 'pre-clear-driver' }), 'plugin1');
      
      // 清理
      contributionRegistry.clear();
      
      // 验证可以重新注册
      const driver = ContributionFactory.createDriver({ id: 'post-clear-driver' });
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'plugin2');
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      expect(contributionRegistry.getContribution('post-clear-driver')).toBe(driver);
      expect(contributionRegistry.getContribution('pre-clear-driver')).toBeUndefined();
    });
  });

  describe('复杂场景和集成测试', () => {
    it('应该处理复杂的插件生态系统', () => {
      // 插件1: 多种贡献
      const plugin1Contributions = [
        { point: ExtensionPoint.COMMUNICATION_DRIVERS, contribution: ContributionFactory.createDriver({ id: 'serial-driver' }) },
        { point: ExtensionPoint.VISUALIZATION_WIDGETS, contribution: ContributionFactory.createWidget({ id: 'plot-widget' }) },
        { point: ExtensionPoint.DATA_PARSERS, contribution: ContributionFactory.createParser({ id: 'json-parser' }) }
      ];
      
      // 插件2: 单一贡献
      const plugin2Contributions = [
        { point: ExtensionPoint.THEMES, contribution: ContributionFactory.createTheme({ id: 'dark-theme' }) }
      ];
      
      // 插件3: 多个同类贡献
      const plugin3Contributions = [
        { point: ExtensionPoint.COMMUNICATION_DRIVERS, contribution: ContributionFactory.createDriver({ id: 'tcp-driver' }) },
        { point: ExtensionPoint.COMMUNICATION_DRIVERS, contribution: ContributionFactory.createDriver({ id: 'udp-driver' }) }
      ];
      
      // 注册所有贡献
      plugin1Contributions.forEach(({ point, contribution }) => {
        contributionRegistry.register(point, contribution, 'plugin1');
      });
      plugin2Contributions.forEach(({ point, contribution }) => {
        contributionRegistry.register(point, contribution, 'plugin2');
      });
      plugin3Contributions.forEach(({ point, contribution }) => {
        contributionRegistry.register(point, contribution, 'plugin3');
      });
      
      // 验证整体状态
      const stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(6);
      expect(stats.totalPlugins).toBe(3);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.COMMUNICATION_DRIVERS]).toBe(3);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.VISUALIZATION_WIDGETS]).toBe(1);
      
      // 验证各种查询
      expect(contributionRegistry.getPluginContributions('plugin1')).toHaveLength(3);
      expect(contributionRegistry.getPluginContributions('plugin2')).toHaveLength(1);
      expect(contributionRegistry.getPluginContributions('plugin3')).toHaveLength(2);
      
      // 部分卸载
      contributionRegistry.unregisterPlugin('plugin2');
      
      const newStats = contributionRegistry.getStatistics();
      expect(newStats.totalContributions).toBe(5);
      expect(newStats.totalPlugins).toBe(2);
      expect(contributionRegistry.getContribution('dark-theme')).toBeUndefined();
      
      // 验证其他插件不受影响
      expect(contributionRegistry.getContribution('serial-driver')).toBeDefined();
      expect(contributionRegistry.getContribution('tcp-driver')).toBeDefined();
    });

    it('应该处理并发操作', () => {
      const contributions = [];
      
      // 模拟并发注册
      for (let i = 0; i < 100; i++) {
        const driver = ContributionFactory.createDriver({ id: `concurrent-driver-${i}` });
        contributions.push(driver);
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, `plugin-${i % 10}`);
      }
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(100);
      expect(contributionRegistry.getStatistics().totalPlugins).toBe(10);
      
      // 模拟并发查询
      contributions.forEach((contribution) => {
        expect(contributionRegistry.getContribution(contribution.id)).toBe(contribution);
      });
      
      // 模拟并发卸载
      for (let i = 0; i < 5; i++) {
        contributionRegistry.unregisterPlugin(`plugin-${i}`);
      }
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(50);
      expect(contributionRegistry.getStatistics().totalPlugins).toBe(5);
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理极长的贡献ID', () => {
      const longId = 'a'.repeat(1000);
      const driver = ContributionFactory.createDriver({ id: longId });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      expect(contributionRegistry.getContribution(longId)).toBe(driver);
    });

    it('应该处理特殊字符的贡献ID', () => {
      const specialId = 'test-驱动器-🚀-@#$%^&*()';
      const driver = ContributionFactory.createDriver({ id: specialId });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      expect(contributionRegistry.getContribution(specialId)).toBe(driver);
    });

    it('应该处理大量贡献的性能', () => {
      const start = Date.now();
      
      // 注册大量贡献
      for (let i = 0; i < 10000; i++) {
        const driver = ContributionFactory.createDriver({ id: `perf-driver-${i}` });
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, `plugin-${i % 100}`);
      }
      
      const registrationTime = Date.now() - start;
      expect(registrationTime).toBeLessThan(1000); // 应该在1秒内完成
      
      // 查询性能测试
      const queryStart = Date.now();
      expect(contributionRegistry.getContribution('perf-driver-5000')).toBeDefined();
      const queryTime = Date.now() - queryStart;
      expect(queryTime).toBeLessThan(10); // 查询应该很快
      
      // 统计性能测试
      const statsStart = Date.now();
      const stats = contributionRegistry.getStatistics();
      const statsTime = Date.now() - statsStart;
      expect(stats.totalContributions).toBe(10000);
      expect(statsTime).toBeLessThan(100); // 统计应该很快
    });
  });
});
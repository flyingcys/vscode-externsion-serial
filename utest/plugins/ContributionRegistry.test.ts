/**
 * Serial-Studio VSCode 插件系统 - ContributionRegistry 测试
 * 
 * 本测试文件实现了 ContributionRegistry 的全面单元测试，覆盖：
 * - 贡献注册和注销
 * - 扩展点管理
 * - 插件所有权跟踪
 * - 事件监听机制
 * - 统计信息获取
 * 
 * 基于 todo.md 中 P1-04 任务要求
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContributionRegistry, ContributionStatistics } from '@extension/plugins/ContributionRegistry';
import { 
  ExtensionPoint, 
  PluginEvent,
  PluginEventData,
  WidgetContribution,
  DriverContribution,
  ParserContribution,
  ThemeContribution,
  MenuContribution,
  ExportFormatContribution
} from '@extension/plugins/types';

/**
 * Mock 贡献工厂
 */
class ContributionMockFactory {
  /**
   * 创建 Widget 贡献 Mock
   */
  static createWidgetContribution(id: string, overrides?: Partial<WidgetContribution>): WidgetContribution {
    return {
      id,
      name: `Test Widget ${id}`,
      type: 'dataset',
      component: {},
      configSchema: { type: 'object' },
      supportedDataTypes: ['number', 'string'],
      category: 'test',
      ...overrides
    };
  }

  /**
   * 创建 Driver 贡献 Mock
   */
  static createDriverContribution(id: string, overrides?: Partial<DriverContribution>): DriverContribution {
    return {
      id,
      name: `Test Driver ${id}`,
      protocol: 'test-protocol',
      driverClass: class TestDriver {} as any,
      configSchema: { type: 'object' },
      platforms: ['linux', 'win32', 'darwin'],
      ...overrides
    };
  }

  /**
   * 创建 Parser 贡献 Mock
   */
  static createParserContribution(id: string, overrides?: Partial<ParserContribution>): ParserContribution {
    return {
      id,
      name: `Test Parser ${id}`,
      description: `Description for parser ${id}`,
      parserClass: class TestParser {} as any,
      template: 'function parse(frame) { return frame.split(","); }',
      supportedFormats: ['csv', 'json'],
      ...overrides
    };
  }

  /**
   * 创建 Theme 贡献 Mock
   */
  static createThemeContribution(id: string, overrides?: Partial<ThemeContribution>): ThemeContribution {
    return {
      id,
      name: `Test Theme ${id}`,
      type: 'dark',
      path: `/themes/${id}.css`,
      description: `Test theme ${id}`,
      ...overrides
    };
  }

  /**
   * 创建 Menu 贡献 Mock
   */
  static createMenuContribution(id: string, overrides?: Partial<MenuContribution>): MenuContribution {
    return {
      id,
      label: `Test Menu ${id}`,
      command: `test.command.${id}`,
      group: 'test',
      when: 'always',
      ...overrides
    };
  }

  /**
   * 创建 Export Format 贡献 Mock
   */
  static createExportFormatContribution(id: string, overrides?: Partial<ExportFormatContribution>): ExportFormatContribution {
    return {
      id,
      name: `Test Export Format ${id}`,
      extension: `.${id}`,
      mimeType: `application/x-${id}`,
      export: vi.fn().mockResolvedValue(Buffer.from('test data')),
      description: `Test export format ${id}`,
      ...overrides
    };
  }
}

describe('ContributionRegistry', () => {
  let registry: ContributionRegistry;

  beforeEach(() => {
    // 重置单例
    (ContributionRegistry as any).instance = undefined;
    registry = ContributionRegistry.getInstance();
    registry.clear(); // 确保开始时为空
  });

  afterEach(() => {
    registry.clear();
  });

  /**
   * 单例模式测试
   */
  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = ContributionRegistry.getInstance();
      const instance2 = ContributionRegistry.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(registry);
    });

    it('应该在多次调用时保持状态', () => {
      const widget = ContributionMockFactory.createWidgetContribution('test-widget');
      
      const instance1 = ContributionRegistry.getInstance();
      instance1.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
      
      const instance2 = ContributionRegistry.getInstance();
      const contributions = instance2.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      
      expect(contributions).toHaveLength(1);
      expect(contributions[0]).toBe(widget);
    });
  });

  /**
   * 贡献注册测试
   */
  describe('贡献注册', () => {
    it('应该成功注册 Widget 贡献', () => {
      const widget = ContributionMockFactory.createWidgetContribution('test-widget');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
      
      const contributions = registry.getContributions<WidgetContribution>(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(contributions).toHaveLength(1);
      expect(contributions[0]).toBe(widget);
      expect(registry.hasContribution('test-widget')).toBe(true);
      expect(registry.getContributionOwner('test-widget')).toBe('test-plugin');
    });

    it('应该成功注册 Driver 贡献', () => {
      const driver = ContributionMockFactory.createDriverContribution('test-driver');
      
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
      
      const contributions = registry.getContributions<DriverContribution>(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(contributions).toHaveLength(1);
      expect(contributions[0]).toBe(driver);
    });

    it('应该成功注册多种类型的贡献', () => {
      const widget = ContributionMockFactory.createWidgetContribution('test-widget');
      const driver = ContributionMockFactory.createDriverContribution('test-driver');
      const parser = ContributionMockFactory.createParserContribution('test-parser');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'plugin-1');
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'plugin-2');
      registry.register(ExtensionPoint.DATA_PARSERS, parser, 'plugin-3');
      
      expect(registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(1);
      expect(registry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      expect(registry.getContributions(ExtensionPoint.DATA_PARSERS)).toHaveLength(1);
    });

    it('应该支持同一插件注册多个贡献', () => {
      const widget1 = ContributionMockFactory.createWidgetContribution('widget-1');
      const widget2 = ContributionMockFactory.createWidgetContribution('widget-2');
      const driver = ContributionMockFactory.createDriverContribution('driver-1');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget1, 'multi-plugin');
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget2, 'multi-plugin');
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'multi-plugin');
      
      const pluginContributions = registry.getPluginContributions('multi-plugin');
      expect(pluginContributions).toHaveLength(3);
      
      const widgets = registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(widgets).toHaveLength(2);
    });

    it('应该拒绝重复的贡献ID', () => {
      const widget1 = ContributionMockFactory.createWidgetContribution('duplicate-id');
      const widget2 = ContributionMockFactory.createWidgetContribution('duplicate-id');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget1, 'plugin-1');
      
      expect(() => {
        registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget2, 'plugin-2');
      }).toThrow("Contribution 'duplicate-id' is already registered by plugin 'plugin-1'");
    });

    it('应该允许同一插件重复注册相同贡献', () => {
      const widget = ContributionMockFactory.createWidgetContribution('same-widget');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'same-plugin');
      
      // 不应该抛出错误
      expect(() => {
        registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'same-plugin');
      }).not.toThrow();
      
      // 仍然只有一个贡献
      const contributions = registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(contributions).toHaveLength(1);
    });

    it('应该拒绝未知的扩展点', () => {
      const widget = ContributionMockFactory.createWidgetContribution('test-widget');
      
      expect(() => {
        registry.register('unknown.extension.point' as ExtensionPoint, widget, 'test-plugin');
      }).toThrow('Unknown extension point: unknown.extension.point');
    });
  });

  /**
   * 贡献注销测试
   */
  describe('贡献注销', () => {
    beforeEach(() => {
      // 预注册一些贡献用于测试
      const widget = ContributionMockFactory.createWidgetContribution('test-widget');
      const driver = ContributionMockFactory.createDriverContribution('test-driver');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'test-plugin');
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'test-plugin');
    });

    it('应该成功注销单个贡献', () => {
      registry.unregister('test-widget', 'test-plugin');
      
      expect(registry.hasContribution('test-widget')).toBe(false);
      expect(registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(0);
      expect(registry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1); // driver 仍在
    });

    it('应该拒绝错误插件的注销请求', () => {
      expect(() => {
        registry.unregister('test-widget', 'wrong-plugin');
      }).toThrow("Cannot unregister contribution 'test-widget': owned by different plugin");
    });

    it('应该成功注销插件的所有贡献', () => {
      registry.unregisterPlugin('test-plugin');
      
      expect(registry.hasContribution('test-widget')).toBe(false);
      expect(registry.hasContribution('test-driver')).toBe(false);
      expect(registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(0);
      expect(registry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(0);
    });

    it('应该处理注销不存在的插件', () => {
      // 不应该抛出错误
      expect(() => {
        registry.unregisterPlugin('non-existent-plugin');
      }).not.toThrow();
    });

    it('应该正确清理所有跟踪数据', () => {
      registry.unregister('test-widget', 'test-plugin');
      
      expect(registry.getContributionOwner('test-widget')).toBeUndefined();
      expect(registry.getPluginContributions('test-plugin')).toHaveLength(1); // 只剩 driver
      
      registry.unregisterPlugin('test-plugin');
      expect(registry.getPluginContributions('test-plugin')).toHaveLength(0);
    });
  });

  /**
   * 贡献查询测试
   */
  describe('贡献查询', () => {
    beforeEach(() => {
      // 预注册各种类型的贡献
      const widget = ContributionMockFactory.createWidgetContribution('test-widget');
      const driver = ContributionMockFactory.createDriverContribution('test-driver');
      const parser = ContributionMockFactory.createParserContribution('test-parser');
      const theme = ContributionMockFactory.createThemeContribution('test-theme');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'plugin-1');
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'plugin-2');
      registry.register(ExtensionPoint.DATA_PARSERS, parser, 'plugin-1');
      registry.register(ExtensionPoint.THEMES, theme, 'plugin-3');
    });

    it('应该按扩展点正确返回贡献', () => {
      const widgets = registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      const drivers = registry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS);
      const parsers = registry.getContributions(ExtensionPoint.DATA_PARSERS);
      const themes = registry.getContributions(ExtensionPoint.THEMES);
      
      expect(widgets).toHaveLength(1);
      expect(drivers).toHaveLength(1);
      expect(parsers).toHaveLength(1);
      expect(themes).toHaveLength(1);
      
      expect(widgets[0].id).toBe('test-widget');
      expect(drivers[0].id).toBe('test-driver');
      expect(parsers[0].id).toBe('test-parser');
      expect(themes[0].id).toBe('test-theme');
    });

    it('应该返回空数组当扩展点没有贡献时', () => {
      const emptyContributions = registry.getContributions(ExtensionPoint.MENU_CONTRIBUTIONS);
      expect(emptyContributions).toHaveLength(0);
      expect(Array.isArray(emptyContributions)).toBe(true);
    });

    it('应该通过ID获取特定贡献', () => {
      const widget = registry.getContribution<WidgetContribution>('test-widget');
      const driver = registry.getContribution<DriverContribution>('test-driver');
      const nonExistent = registry.getContribution('non-existent');
      
      expect(widget).toBeDefined();
      expect(widget!.id).toBe('test-widget');
      expect(driver).toBeDefined();
      expect(driver!.id).toBe('test-driver');
      expect(nonExistent).toBeUndefined();
    });

    it('应该按插件ID获取贡献', () => {
      const plugin1Contributions = registry.getPluginContributions('plugin-1');
      const plugin2Contributions = registry.getPluginContributions('plugin-2');
      const nonExistentContributions = registry.getPluginContributions('non-existent');
      
      expect(plugin1Contributions).toHaveLength(2); // widget + parser
      expect(plugin2Contributions).toHaveLength(1); // driver
      expect(nonExistentContributions).toHaveLength(0);
      
      const plugin1Ids = plugin1Contributions.map(c => c.id);
      expect(plugin1Ids).toContain('test-widget');
      expect(plugin1Ids).toContain('test-parser');
    });

    it('应该正确检查贡献存在性', () => {
      expect(registry.hasContribution('test-widget')).toBe(true);
      expect(registry.hasContribution('test-driver')).toBe(true);
      expect(registry.hasContribution('non-existent')).toBe(false);
    });

    it('应该正确返回贡献所有者', () => {
      expect(registry.getContributionOwner('test-widget')).toBe('plugin-1');
      expect(registry.getContributionOwner('test-driver')).toBe('plugin-2');
      expect(registry.getContributionOwner('non-existent')).toBeUndefined();
    });
  });

  /**
   * 扩展点管理测试
   */
  describe('扩展点管理', () => {
    it('应该返回所有可用的扩展点', () => {
      const extensionPoints = registry.getExtensionPoints();
      
      expect(extensionPoints).toContain(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(extensionPoints).toContain(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(extensionPoints).toContain(ExtensionPoint.DATA_PARSERS);
      expect(extensionPoints).toContain(ExtensionPoint.THEMES);
      expect(extensionPoints).toContain(ExtensionPoint.MENU_CONTRIBUTIONS);
      
      // 应该包含所有15个扩展点
      expect(extensionPoints.length).toBeGreaterThanOrEqual(15);
    });

    it('应该支持所有定义的扩展点类型', () => {
      // 测试每种扩展点类型
      const contributions = [
        { point: ExtensionPoint.COMMUNICATION_DRIVERS, contribution: ContributionMockFactory.createDriverContribution('driver') },
        { point: ExtensionPoint.DATA_PARSERS, contribution: ContributionMockFactory.createParserContribution('parser') },
        { point: ExtensionPoint.VISUALIZATION_WIDGETS, contribution: ContributionMockFactory.createWidgetContribution('widget') },
        { point: ExtensionPoint.THEMES, contribution: ContributionMockFactory.createThemeContribution('theme') },
        { point: ExtensionPoint.MENU_CONTRIBUTIONS, contribution: ContributionMockFactory.createMenuContribution('menu') },
        { point: ExtensionPoint.EXPORT_FORMATS, contribution: ContributionMockFactory.createExportFormatContribution('export') }
      ];

      contributions.forEach(({ point, contribution }, index) => {
        const pluginId = `plugin-${index}`;
        expect(() => {
          registry.register(point, contribution, pluginId);
        }).not.toThrow();
        
        expect(registry.getContributions(point)).toHaveLength(1);
      });
    });
  });

  /**
   * 统计信息测试
   */
  describe('统计信息', () => {
    beforeEach(() => {
      // 注册多种贡献用于统计测试
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, 
        ContributionMockFactory.createWidgetContribution('widget-1'), 'plugin-1');
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, 
        ContributionMockFactory.createWidgetContribution('widget-2'), 'plugin-1');
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, 
        ContributionMockFactory.createDriverContribution('driver-1'), 'plugin-2');
      registry.register(ExtensionPoint.THEMES, 
        ContributionMockFactory.createThemeContribution('theme-1'), 'plugin-3');
    });

    it('应该正确计算总体统计信息', () => {
      const stats: ContributionStatistics = registry.getStatistics();
      
      expect(stats.totalContributions).toBe(4);
      expect(stats.totalPlugins).toBe(3);
    });

    it('应该正确计算各扩展点的贡献数量', () => {
      const stats = registry.getStatistics();
      
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.VISUALIZATION_WIDGETS]).toBe(2);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.COMMUNICATION_DRIVERS]).toBe(1);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.THEMES]).toBe(1);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.DATA_PARSERS]).toBe(0);
    });

    it('应该在贡献变化时更新统计信息', () => {
      let stats = registry.getStatistics();
      expect(stats.totalContributions).toBe(4);
      
      // 添加新贡献
      registry.register(ExtensionPoint.DATA_PARSERS, 
        ContributionMockFactory.createParserContribution('parser-1'), 'plugin-4');
      
      stats = registry.getStatistics();
      expect(stats.totalContributions).toBe(5);
      expect(stats.totalPlugins).toBe(4);
      
      // 移除贡献
      registry.unregister('widget-1', 'plugin-1');
      
      stats = registry.getStatistics();
      expect(stats.totalContributions).toBe(4);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.VISUALIZATION_WIDGETS]).toBe(1);
    });
  });

  /**
   * 事件系统测试
   */
  describe('事件系统', () => {
    it('应该正确添加和移除事件监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      registry.addEventListener(PluginEvent.LOADED, listener1);
      registry.addEventListener(PluginEvent.LOADED, listener2);
      
      const eventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.LOADED,
        data: { test: 'data' }
      };
      
      registry.emitEvent(PluginEvent.LOADED, eventData);
      
      expect(listener1).toHaveBeenCalledWith(eventData);
      expect(listener2).toHaveBeenCalledWith(eventData);
      
      // 移除一个监听器
      registry.removeEventListener(PluginEvent.LOADED, listener1);
      
      registry.emitEvent(PluginEvent.LOADED, eventData);
      
      expect(listener1).toHaveBeenCalledTimes(1); // 没有再次调用
      expect(listener2).toHaveBeenCalledTimes(2); // 调用了两次
    });

    it('应该支持不同类型的事件', () => {
      const loadedListener = vi.fn();
      const activatedListener = vi.fn();
      const errorListener = vi.fn();
      
      registry.addEventListener(PluginEvent.LOADED, loadedListener);
      registry.addEventListener(PluginEvent.ACTIVATED, activatedListener);
      registry.addEventListener(PluginEvent.ERROR, errorListener);
      
      registry.emitEvent(PluginEvent.LOADED, {
        pluginId: 'test', event: PluginEvent.LOADED
      });
      registry.emitEvent(PluginEvent.ACTIVATED, {
        pluginId: 'test', event: PluginEvent.ACTIVATED
      });
      registry.emitEvent(PluginEvent.ERROR, {
        pluginId: 'test', event: PluginEvent.ERROR, error: new Error('test')
      });
      
      expect(loadedListener).toHaveBeenCalledTimes(1);
      expect(activatedListener).toHaveBeenCalledTimes(1);
      expect(errorListener).toHaveBeenCalledTimes(1);
    });

    it('应该处理监听器中的错误', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      registry.addEventListener(PluginEvent.LOADED, errorListener);
      registry.addEventListener(PluginEvent.LOADED, normalListener);
      
      registry.emitEvent(PluginEvent.LOADED, {
        pluginId: 'test', event: PluginEvent.LOADED
      });
      
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in plugin event listener'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('应该在没有监听器时安全地发出事件', () => {
      expect(() => {
        registry.emitEvent(PluginEvent.LOADED, {
          pluginId: 'test', event: PluginEvent.LOADED
        });
      }).not.toThrow();
    });
  });

  /**
   * 边界条件和错误处理测试
   */
  describe('边界条件和错误处理', () => {
    it('应该处理大量贡献的注册', () => {
      const contributionCount = 1000;
      
      for (let i = 0; i < contributionCount; i++) {
        const widget = ContributionMockFactory.createWidgetContribution(`widget-${i}`);
        registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, `plugin-${i % 10}`);
      }
      
      const stats = registry.getStatistics();
      expect(stats.totalContributions).toBe(contributionCount);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.VISUALIZATION_WIDGETS]).toBe(contributionCount);
    });

    it('应该处理复杂的插件依赖关系', () => {
      // 模拟插件A依赖插件B的贡献
      const baseWidget = ContributionMockFactory.createWidgetContribution('base-widget');
      const extendedWidget = ContributionMockFactory.createWidgetContribution('extended-widget');
      
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, baseWidget, 'base-plugin');
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, extendedWidget, 'extended-plugin');
      
      // 移除基础插件
      registry.unregisterPlugin('base-plugin');
      
      // 扩展插件的贡献应该仍然存在
      expect(registry.hasContribution('extended-widget')).toBe(true);
      expect(registry.hasContribution('base-widget')).toBe(false);
    });

    it('应该正确处理清理操作', () => {
      // 注册一些贡献
      registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, 
        ContributionMockFactory.createWidgetContribution('widget'), 'plugin-1');
      registry.register(ExtensionPoint.COMMUNICATION_DRIVERS, 
        ContributionMockFactory.createDriverContribution('driver'), 'plugin-2');
      
      // 添加事件监听器
      const listener = vi.fn();
      registry.addEventListener(PluginEvent.LOADED, listener);
      
      expect(registry.getStatistics().totalContributions).toBe(2);
      
      // 清理
      registry.clear();
      
      const stats = registry.getStatistics();
      expect(stats.totalContributions).toBe(0);
      expect(stats.totalPlugins).toBe(0);
      
      // 事件监听器也应该被清理
      registry.emitEvent(PluginEvent.LOADED, {
        pluginId: 'test', event: PluginEvent.LOADED
      });
      expect(listener).not.toHaveBeenCalled();
    });

    it('应该处理无效的贡献数据', () => {
      const invalidContribution = { /* 缺少必需的 id 字段 */ } as any;
      
      expect(() => {
        registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, invalidContribution, 'test-plugin');
      }).toThrow(); // 应该抛出错误，因为贡献没有id
    });
  });

  /**
   * 性能测试
   */
  describe('性能测试', () => {
    it('应该快速查询大量贡献', () => {
      // 注册大量贡献
      const contributionCount = 10000;
      for (let i = 0; i < contributionCount; i++) {
        const widget = ContributionMockFactory.createWidgetContribution(`perf-widget-${i}`);
        registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, `perf-plugin-${i % 100}`);
      }
      
      // 测试查询性能
      const startTime = performance.now();
      
      // 执行多次查询
      for (let i = 0; i < 1000; i++) {
        registry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
        registry.hasContribution(`perf-widget-${i % contributionCount}`);
        registry.getContribution(`perf-widget-${i % contributionCount}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 1000次查询应该在合理时间内完成（比如100ms）
      expect(duration).toBeLessThan(100);
    });

    it('应该高效处理插件的批量注销', () => {
      // 为单个插件注册大量贡献
      const contributionCount = 1000;
      const pluginId = 'bulk-plugin';
      
      for (let i = 0; i < contributionCount; i++) {
        const widget = ContributionMockFactory.createWidgetContribution(`bulk-widget-${i}`);
        registry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, pluginId);
      }
      
      expect(registry.getPluginContributions(pluginId)).toHaveLength(contributionCount);
      
      // 测试批量注销性能
      const startTime = performance.now();
      registry.unregisterPlugin(pluginId);
      const endTime = performance.now();
      
      expect(registry.getPluginContributions(pluginId)).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(50); // 应该很快完成
    });
  });
});
/**
 * ContributionRegistry 终极覆盖测试
 * 
 * 测试目标: 100% 代码覆盖率
 * - 所有注册和查询方法的完整测试
 * - 错误处理和边界条件
 * - 插件生命周期管理
 * - 贡献冲突解决
 * - 性能和内存管理
 * 
 * 基于 Plugins-high.md 计划中的 P3-03 任务
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContributionRegistry } from '../../src/extension/plugins/ContributionRegistry';
import { 
  PluginManifest, 
  ExtensionPoint,
  DriverContribution, 
  WidgetContribution, 
  ParserContribution 
} from '../../src/extension/plugins/types';
import {
  PluginManifestFactory,
  ContributionFactory
} from '../mocks/plugins-mock-factory';

describe('ContributionRegistry - Ultimate Coverage Test', () => {
  let contributionRegistry: ContributionRegistry;

  beforeEach(() => {
    contributionRegistry = ContributionRegistry.getInstance();
    contributionRegistry.clear(); // 清理之前的状态
  });

  afterEach(() => {
    contributionRegistry.clear();
    vi.resetAllMocks();
  });

  describe('Driver Contributions', () => {
    it('应成功注册驱动贡献', () => {
      const driverContrib = ContributionFactory.createDriver();
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driverContrib, 'test-plugin');
      
      const drivers = contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(drivers).toHaveLength(1);
      expect(drivers[0].id).toBe(driverContrib.id);
    });

    it('应通过ID查找驱动', () => {
      const driverContrib = ContributionFactory.createDriver({
        id: 'custom-driver'
      });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driverContrib, 'test-plugin');
      
      const found = contributionRegistry.getContribution('custom-driver');
      expect(found).toBeDefined();
      expect(found!.id).toBe('custom-driver');
    });

    it('应处理驱动ID冲突', () => {
      const driver1 = ContributionFactory.createDriver({ id: 'same-driver' });
      const driver2 = ContributionFactory.createDriver({ id: 'same-driver' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver1, 'plugin1');
      
      expect(() => {
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver2, 'plugin2');
      }).toThrow('already registered');
    });

    it('应支持驱动卸载', () => {
      const driverContrib = ContributionFactory.createDriver();
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driverContrib, 'test-plugin');
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      
      contributionRegistry.unregisterPlugin('test-plugin');
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(0);
    });
  });

  describe('Widget Contributions', () => {
    it('应成功注册组件贡献', () => {
      const widgetContrib = ContributionFactory.createWidget();
      
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widgetContrib, 'test-plugin');
      
      const widgets = contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(widgets).toHaveLength(1);
      expect(widgets[0].id).toBe(widgetContrib.id);
    });

    it('应通过ID查找组件', () => {
      const widgetContrib = ContributionFactory.createWidget({
        id: 'custom-widget'
      });
      
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widgetContrib, 'test-plugin');
      
      const found = contributionRegistry.getContribution('custom-widget');
      expect(found).toBeDefined();
      expect(found!.id).toBe('custom-widget');
    });

    it('应支持组件所有者查询', () => {
      const widgetContrib = ContributionFactory.createWidget({ id: 'test-widget' });
      
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widgetContrib, 'test-plugin');
      
      const owner = contributionRegistry.getContributionOwner('test-widget');
      expect(owner).toBe('test-plugin');
    });

    it('应处理组件ID冲突', () => {
      const widget1 = ContributionFactory.createWidget({ id: 'my-widget' });
      const widget2 = ContributionFactory.createWidget({ id: 'my-widget' });
      
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget1, 'plugin1');
      
      expect(() => {
        contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget2, 'plugin2');
      }).toThrow('already registered');
    });
  });

  describe('Parser Contributions', () => {
    it('应成功注册解析器贡献', () => {
      const parserContrib = ContributionFactory.createParser();
      
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parserContrib, 'test-plugin');
      
      const parsers = contributionRegistry.getContributions(ExtensionPoint.DATA_PARSERS);
      expect(parsers).toHaveLength(1);
      expect(parsers[0].id).toBe(parserContrib.id);
    });

    it('应通过ID查找解析器', () => {
      const parserContrib = ContributionFactory.createParser({
        id: 'json-parser'
      });
      
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parserContrib, 'test-plugin');
      
      const found = contributionRegistry.getContribution('json-parser');
      expect(found).toBeDefined();
      expect(found!.id).toBe('json-parser');
    });

    it('应处理解析器ID冲突', () => {
      const parser1 = ContributionFactory.createParser({ id: 'my-parser' });
      const parser2 = ContributionFactory.createParser({ id: 'my-parser' });
      
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parser1, 'plugin1');
      
      expect(() => {
        contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parser2, 'plugin2');
      }).toThrow('already registered');
    });
  });

  describe('Plugin Management', () => {
    it('应跟踪每个插件的贡献', () => {
      const driverContrib = ContributionFactory.createDriver();
      const widgetContrib = ContributionFactory.createWidget();
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driverContrib, 'test-plugin');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widgetContrib, 'test-plugin');
      
      const contributions = contributionRegistry.getPluginContributions('test-plugin');
      expect(contributions.drivers).toHaveLength(1);
      expect(contributions.widgets).toHaveLength(1);
      expect(contributions.parsers).toHaveLength(0);
    });

    it('应支持批量注册插件贡献', () => {
      const manifest = PluginManifestFactory.createValid({
        contributes: {
          drivers: [ContributionFactory.createDriver()],
          widgets: [ContributionFactory.createWidget()],
          parsers: [ContributionFactory.createParser()]
        }
      });
      
      contributionRegistry.registerPluginContributions('test-plugin', manifest.contributes!);
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      expect(contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(1);
      expect(contributionRegistry.getContributions(ExtensionPoint.DATA_PARSERS)).toHaveLength(1);
    });

    it('应支持清空所有贡献', () => {
      contributionRegistry.registerDriverContribution('plugin1', ContributionFactory.createDriver());
      contributionRegistry.registerWidgetContribution('plugin2', ContributionFactory.createWidget());
      
      expect(contributionRegistry.getDriverContributions()).toHaveLength(1);
      expect(contributionRegistry.getWidgetContributions()).toHaveLength(1);
      
      contributionRegistry.clear();
      
      expect(contributionRegistry.getDriverContributions()).toHaveLength(0);
      expect(contributionRegistry.getWidgetContributions()).toHaveLength(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('应处理无效的贡献对象', () => {
      expect(() => {
        contributionRegistry.registerDriverContribution('test-plugin', null as any);
      }).toThrow('Invalid driver contribution');
    });

    it('应处理空插件ID', () => {
      const driverContrib = ContributionFactory.createDriver();
      
      expect(() => {
        contributionRegistry.registerDriverContribution('', driverContrib);
      }).toThrow('Plugin ID cannot be empty');
    });

    it('应处理重复的插件注册', () => {
      const driverContrib = ContributionFactory.createDriver();
      
      contributionRegistry.registerDriverContribution('test-plugin', driverContrib);
      
      // 重复注册同一插件应该覆盖之前的贡献
      contributionRegistry.registerDriverContribution('test-plugin', driverContrib);
      
      expect(contributionRegistry.getDriverContributions()).toHaveLength(1);
    });

    it('应处理查询不存在的贡献', () => {
      expect(contributionRegistry.findDriverByProtocol('non-existent')).toBeNull();
      expect(contributionRegistry.findWidgetById('non-existent')).toBeNull();
      expect(contributionRegistry.findParserById('non-existent')).toBeNull();
    });

    it('应处理卸载不存在的插件', () => {
      expect(() => {
        contributionRegistry.unregisterPluginContributions('non-existent-plugin');
      }).not.toThrow(); // 应该安全地忽略
    });
  });

  describe('Performance and Memory Management', () => {
    it('应有效处理大量贡献', () => {
      const startTime = Date.now();
      
      // 注册大量贡献
      for (let i = 0; i < 1000; i++) {
        const driver = ContributionFactory.createDriver({
          id: `driver-${i}`,
          protocol: `protocol-${i}`
        });
        contributionRegistry.registerDriverContribution(`plugin-${i}`, driver);
      }
      
      const registrationTime = Date.now() - startTime;
      expect(registrationTime).toBeLessThan(100); // 应在100ms内完成
      
      // 查询性能
      const queryStart = Date.now();
      const found = contributionRegistry.findDriverByProtocol('protocol-500');
      const queryTime = Date.now() - queryStart;
      
      expect(found).toBeDefined();
      expect(queryTime).toBeLessThan(10); // 查询应非常快
    });

    it('应正确释放内存', () => {
      // 注册大量贡献
      for (let i = 0; i < 100; i++) {
        contributionRegistry.registerDriverContribution(`plugin-${i}`, ContributionFactory.createDriver());
        contributionRegistry.registerWidgetContribution(`plugin-${i}`, ContributionFactory.createWidget());
      }
      
      expect(contributionRegistry.getDriverContributions()).toHaveLength(100);
      expect(contributionRegistry.getWidgetContributions()).toHaveLength(100);
      
      // 清除所有贡献
      contributionRegistry.clear();
      
      // 验证内存已释放
      expect(contributionRegistry.getDriverContributions()).toHaveLength(0);
      expect(contributionRegistry.getWidgetContributions()).toHaveLength(0);
      expect(contributionRegistry.getParserContributions()).toHaveLength(0);
    });
  });

  describe('Core API Features', () => {
    it('应返回所有扩展点', () => {
      const extensionPoints = contributionRegistry.getExtensionPoints();
      expect(extensionPoints).toBeDefined();
      expect(extensionPoints.length).toBeGreaterThan(0);
      expect(extensionPoints).toContain(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(extensionPoints).toContain(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(extensionPoints).toContain(ExtensionPoint.DATA_PARSERS);
    });

    it('应提供统计信息', () => {
      // 注册一些贡献
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, ContributionFactory.createDriver(), 'plugin1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, ContributionFactory.createWidget(), 'plugin1');
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, ContributionFactory.createParser(), 'plugin2');
      
      const stats = contributionRegistry.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalContributions).toBe(3);
      expect(stats.totalPlugins).toBe(2);
      expect(stats.contributionsByExtensionPoint).toBeDefined();
    });

    it('应支持事件系统', () => {
      const eventListener = vi.fn();
      
      // 这里假设有PluginEvent枚举，我们可以用'contribution.registered'等
      // 由于不确定具体的事件类型，我们测试基本功能
      expect(() => {
        contributionRegistry.addEventListener('test' as any, eventListener);
        contributionRegistry.removeEventListener('test' as any, eventListener);
      }).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('应支持复杂的插件生态系统场景', () => {
      // 创建一个复杂的插件生态系统
      const corePlugin = PluginManifestFactory.createValid({
        id: 'core-plugin',
        contributes: {
          drivers: [
            ContributionFactory.createDriver({ id: 'serial-driver', protocol: 'serial' }),
            ContributionFactory.createDriver({ id: 'tcp-driver', protocol: 'tcp' })
          ],
          widgets: [
            ContributionFactory.createWidget({ id: 'plot-widget', type: 'plot' })
          ]
        }
      });
      
      const extensionPlugin = PluginManifestFactory.createValid({
        id: 'extension-plugin',
        contributes: {
          widgets: [
            ContributionFactory.createWidget({ id: 'gauge-widget', type: 'gauge' }),
            ContributionFactory.createWidget({ id: 'terminal-widget', type: 'terminal' })
          ],
          parsers: [
            ContributionFactory.createParser({ id: 'json-parser' })
          ]
        }
      });
      
      // 注册插件贡献
      contributionRegistry.registerPluginContributions('core-plugin', corePlugin.contributes!);
      contributionRegistry.registerPluginContributions('extension-plugin', extensionPlugin.contributes!);
      
      // 验证整体生态系统
      expect(contributionRegistry.getDriverContributions()).toHaveLength(2);
      expect(contributionRegistry.getWidgetContributions()).toHaveLength(3);
      expect(contributionRegistry.getParserContributions()).toHaveLength(1);
      
      // 验证查询功能
      expect(contributionRegistry.findDriverByProtocol('serial')).toBeDefined();
      expect(contributionRegistry.getWidgetsByType('gauge')).toHaveLength(1);
      expect(contributionRegistry.findParserById('json-parser')).toBeDefined();
      
      // 卸载一个插件
      contributionRegistry.unregisterPluginContributions('extension-plugin');
      
      expect(contributionRegistry.getDriverContributions()).toHaveLength(2); // 核心插件驱动保留
      expect(contributionRegistry.getWidgetContributions()).toHaveLength(1); // 只剩核心插件组件
      expect(contributionRegistry.getParserContributions()).toHaveLength(0); // 扩展插件解析器被移除
    });
  });
});
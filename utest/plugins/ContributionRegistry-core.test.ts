/**
 * ContributionRegistry 核心功能测试
 * 
 * 快速覆盖核心API - 专注100%覆盖率目标
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContributionRegistry } from '../../src/extension/plugins/ContributionRegistry';
import { ExtensionPoint } from '../../src/extension/plugins/types';
import { PluginManifestFactory, ContributionFactory } from '../mocks/plugins-mock-factory';

describe('ContributionRegistry - Core Coverage Test', () => {
  let contributionRegistry: ContributionRegistry;

  beforeEach(() => {
    contributionRegistry = ContributionRegistry.getInstance();
    contributionRegistry.clear();
  });

  afterEach(() => {
    contributionRegistry.clear();
    vi.resetAllMocks();
  });

  describe('Core Registration and Query', () => {
    it('应成功注册和查询贡献', () => {
      const driver = ContributionFactory.createDriver({ id: 'test-driver' });
      const widget = ContributionFactory.createWidget({ id: 'test-widget' });
      const parser = ContributionFactory.createParser({ id: 'test-parser' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'plugin1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'plugin1');
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, parser, 'plugin2');
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      expect(contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(1);
      expect(contributionRegistry.getContributions(ExtensionPoint.DATA_PARSERS)).toHaveLength(1);
      
      expect(contributionRegistry.getContribution('test-driver')).toBeDefined();
      expect(contributionRegistry.getContribution('test-widget')).toBeDefined();
      expect(contributionRegistry.getContribution('test-parser')).toBeDefined();
    });

    it('应支持插件管理', () => {
      const driver = ContributionFactory.createDriver({ id: 'plugin1-driver' });
      const widget = ContributionFactory.createWidget({ id: 'plugin1-widget' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver, 'plugin1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, widget, 'plugin1');
      
      const pluginContribs = contributionRegistry.getPluginContributions('plugin1');
      expect(pluginContribs).toHaveLength(2);
      
      expect(contributionRegistry.getContributionOwner('plugin1-driver')).toBe('plugin1');
      expect(contributionRegistry.hasContribution('plugin1-driver')).toBe(true);
      
      contributionRegistry.unregisterPlugin('plugin1');
      expect(contributionRegistry.hasContribution('plugin1-driver')).toBe(false);
      expect(contributionRegistry.hasContribution('plugin1-widget')).toBe(false);
    });

    it('应处理ID冲突', () => {
      const driver1 = ContributionFactory.createDriver({ id: 'same-id' });
      const driver2 = ContributionFactory.createDriver({ id: 'same-id' });
      
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver1, 'plugin1');
      
      expect(() => {
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, driver2, 'plugin2');
      }).toThrow('already registered');
    });

    it('应提供统计信息', () => {
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, ContributionFactory.createDriver(), 'p1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, ContributionFactory.createWidget(), 'p1');
      contributionRegistry.register(ExtensionPoint.DATA_PARSERS, ContributionFactory.createParser(), 'p2');
      
      const stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(3);
      expect(stats.totalPlugins).toBe(2);
      expect(stats.contributionsByExtensionPoint).toBeDefined();
    });

    it('应返回扩展点列表', () => {
      const extensionPoints = contributionRegistry.getExtensionPoints();
      expect(extensionPoints).toContain(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(extensionPoints).toContain(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(extensionPoints.length).toBeGreaterThan(5);
    });
  });

  describe('Error Handling', () => {
    it('应处理无效贡献', () => {
      expect(() => {
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, null as any, 'plugin1');
      }).toThrow('valid id field');
      
      expect(() => {
        contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, { name: 'test' } as any, 'plugin1');
      }).toThrow('valid id field');
    });

    it('应处理不存在的查询', () => {
      expect(contributionRegistry.getContribution('non-existent')).toBeUndefined();
      expect(contributionRegistry.hasContribution('non-existent')).toBe(false);
      expect(contributionRegistry.getContributionOwner('non-existent')).toBeUndefined();
    });

    it('应安全处理插件卸载', () => {
      expect(() => {
        contributionRegistry.unregisterPlugin('non-existent');
      }).not.toThrow();
      
      // unregister 对不存在的贡献会抛出错误，这是正确的行为
      expect(() => {
        contributionRegistry.unregister('non-existent', 'plugin1');
      }).toThrow('Cannot unregister contribution');
    });
  });

  describe('Event System', () => {
    it('应支持事件监听器', () => {
      const listener = vi.fn();
      
      expect(() => {
        contributionRegistry.addEventListener('test' as any, listener);
        contributionRegistry.emitEvent('test' as any, {} as any);
        contributionRegistry.removeEventListener('test' as any, listener);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('应正确清理所有数据', () => {
      contributionRegistry.register(ExtensionPoint.COMMUNICATION_DRIVERS, ContributionFactory.createDriver(), 'p1');
      contributionRegistry.register(ExtensionPoint.VISUALIZATION_WIDGETS, ContributionFactory.createWidget(), 'p2');
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(1);
      expect(contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(1);
      
      contributionRegistry.clear();
      
      expect(contributionRegistry.getContributions(ExtensionPoint.COMMUNICATION_DRIVERS)).toHaveLength(0);
      expect(contributionRegistry.getContributions(ExtensionPoint.VISUALIZATION_WIDGETS)).toHaveLength(0);
      expect(contributionRegistry.getStatistics().totalContributions).toBe(0);
    });
  });
});
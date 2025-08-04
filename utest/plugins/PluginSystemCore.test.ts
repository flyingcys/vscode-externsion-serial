/**
 * Serial-Studio VSCode Plugin System - Core Unit Tests
 * 
 * Tests the core plugin system functionality without VSCode dependencies.
 * Focuses on plugin loading, contribution registry, and extension points.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ContributionRegistry,
  PluginLoader,
  ExtensionPoint,
  PluginManifest,
  DriverContribution,
  WidgetContribution,
  PluginEvent,
  PluginEventData
} from '../../src/extension/plugins';

describe('Plugin System Core Tests', () => {
  let contributionRegistry: ContributionRegistry;
  let pluginLoader: PluginLoader;
  
  beforeEach(() => {
    contributionRegistry = ContributionRegistry.getInstance();
    pluginLoader = new PluginLoader();
    
    // Clear any existing state
    contributionRegistry.clear();
    pluginLoader.clearCaches();
  });
  
  afterEach(() => {
    contributionRegistry.clear();
    pluginLoader.clearCaches();
  });
  
  describe('Extension Points', () => {
    it('should support all 15 extension points', () => {
      const extensionPoints = contributionRegistry.getExtensionPoints();
      expect(extensionPoints).toHaveLength(15);
      
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
    
    it('should start with empty contributions', () => {
      const stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(0);
      expect(stats.totalPlugins).toBe(0);
      
      Object.values(ExtensionPoint).forEach(point => {
        const contributions = contributionRegistry.getContributions(point);
        expect(contributions).toHaveLength(0);
      });
    });
  });
  
  describe('Contribution Registry', () => {
    it('should register driver contributions', () => {
      const driverContribution: DriverContribution = {
        id: 'test-driver',
        name: 'Test Driver',
        protocol: 'TEST',
        driverClass: class TestDriver {} as any,
        configSchema: { type: 'object' }
      };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        driverContribution,
        'test-plugin'
      );
      
      const drivers = contributionRegistry.getContributions<DriverContribution>(
        ExtensionPoint.COMMUNICATION_DRIVERS
      );
      
      expect(drivers).toHaveLength(1);
      expect(drivers[0].id).toBe('test-driver');
      expect(drivers[0].name).toBe('Test Driver');
      expect(drivers[0].protocol).toBe('TEST');
    });
    
    it('should register widget contributions', () => {
      const widgetContribution: WidgetContribution = {
        id: 'test-widget',
        name: 'Test Widget',
        type: 'dataset',
        component: class TestWidget {},
        configSchema: { type: 'object' }
      };
      
      contributionRegistry.register(
        ExtensionPoint.VISUALIZATION_WIDGETS,
        widgetContribution,
        'test-plugin'
      );
      
      const widgets = contributionRegistry.getContributions<WidgetContribution>(
        ExtensionPoint.VISUALIZATION_WIDGETS
      );
      
      expect(widgets).toHaveLength(1);
      expect(widgets[0].id).toBe('test-widget');
      expect(widgets[0].name).toBe('Test Widget');
      expect(widgets[0].type).toBe('dataset');
    });
    
    it('should track contribution ownership', () => {
      const contribution = {
        id: 'test-contribution',
        name: 'Test Contribution'
      };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution,
        'test-plugin'
      );
      
      expect(contributionRegistry.hasContribution('test-contribution')).toBe(true);
      expect(contributionRegistry.getContributionOwner('test-contribution')).toBe('test-plugin');
    });
    
    it('should prevent duplicate contribution IDs from different plugins', () => {
      const contribution = {
        id: 'duplicate-id',
        name: 'Test Contribution'
      };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution,
        'plugin-1'
      );
      
      expect(() => {
        contributionRegistry.register(
          ExtensionPoint.COMMUNICATION_DRIVERS,
          contribution,
          'plugin-2'
        );
      }).toThrow('already registered by plugin');
    });
    
    it('should allow same plugin to re-register same contribution', () => {
      const contribution = {
        id: 'same-contribution',
        name: 'Test Contribution'
      };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution,
        'test-plugin'
      );
      
      // Should not throw
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution,
        'test-plugin'
      );
      
      const contributions = contributionRegistry.getContributions(
        ExtensionPoint.COMMUNICATION_DRIVERS
      );
      expect(contributions).toHaveLength(1);
    });
    
    it('should unregister contributions', () => {
      const contribution = {
        id: 'test-contribution',
        name: 'Test Contribution'
      };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution,
        'test-plugin'
      );
      
      expect(contributionRegistry.hasContribution('test-contribution')).toBe(true);
      
      contributionRegistry.unregister('test-contribution', 'test-plugin');
      
      expect(contributionRegistry.hasContribution('test-contribution')).toBe(false);
    });
    
    it('should prevent unauthorized unregistration', () => {
      const contribution = {
        id: 'test-contribution',
        name: 'Test Contribution'
      };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution,
        'owner-plugin'
      );
      
      expect(() => {
        contributionRegistry.unregister('test-contribution', 'other-plugin');
      }).toThrow('owned by different plugin');
    });
    
    it('should unregister all plugin contributions', () => {
      const contribution1 = { id: 'contrib-1', name: 'Contribution 1' };
      const contribution2 = { id: 'contrib-2', name: 'Contribution 2' };
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        contribution1,
        'test-plugin'
      );
      
      contributionRegistry.register(
        ExtensionPoint.VISUALIZATION_WIDGETS,
        contribution2,
        'test-plugin'
      );
      
      expect(contributionRegistry.getPluginContributions('test-plugin')).toHaveLength(2);
      
      contributionRegistry.unregisterPlugin('test-plugin');
      
      expect(contributionRegistry.getPluginContributions('test-plugin')).toHaveLength(0);
      expect(contributionRegistry.hasContribution('contrib-1')).toBe(false);
      expect(contributionRegistry.hasContribution('contrib-2')).toBe(false);
    });
    
    it('should generate correct statistics', () => {
      // Initially empty
      let stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(0);
      expect(stats.totalPlugins).toBe(0);
      
      // Add contributions
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        { id: 'driver-1', name: 'Driver 1' },
        'plugin-1'
      );
      
      contributionRegistry.register(
        ExtensionPoint.VISUALIZATION_WIDGETS,
        { id: 'widget-1', name: 'Widget 1' },
        'plugin-1'
      );
      
      contributionRegistry.register(
        ExtensionPoint.COMMUNICATION_DRIVERS,
        { id: 'driver-2', name: 'Driver 2' },
        'plugin-2'
      );
      
      stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(3);
      expect(stats.totalPlugins).toBe(2);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.COMMUNICATION_DRIVERS]).toBe(2);
      expect(stats.contributionsByExtensionPoint[ExtensionPoint.VISUALIZATION_WIDGETS]).toBe(1);
    });
  });
  
  describe('Plugin Loader', () => {
    it('should validate plugin manifest schema', async () => {
      const validManifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*']
      };
      
      // Should not throw
      await expect(pluginLoader.validateManifest(validManifest)).resolves.not.toThrow();
    });
    
    it('should reject invalid plugin manifest', async () => {
      const invalidManifest = {
        name: 'Invalid Plugin'
        // Missing required fields
      } as any;
      
      await expect(pluginLoader.validateManifest(invalidManifest)).rejects.toThrow('validation failed');
    });
    
    it('should validate semantic version format', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: 'invalid-version',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*']
      };
      
      await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow('semantic versioning');
    });
    
    it('should validate plugin ID format', async () => {
      const manifest: PluginManifest = {
        id: 'invalid plugin id!',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*']
      };
      
      await expect(pluginLoader.validateManifest(manifest)).rejects.toThrow('alphanumeric characters');
    });
    
    it('should get manifest schema', () => {
      const schema = pluginLoader.getManifestSchema();
      
      expect(schema.type).toBe('object');
      expect(schema.required).toContain('id');
      expect(schema.required).toContain('name');
      expect(schema.required).toContain('version');
      expect(schema.properties).toHaveProperty('id');
      expect(schema.properties).toHaveProperty('engines');
    });
  });
  
  describe('Event System', () => {
    it('should emit and handle events', () => {
      let eventReceived = false;
      let receivedData: PluginEventData | null = null;
      
      contributionRegistry.addEventListener(PluginEvent.LOADED, (data) => {
        eventReceived = true;
        receivedData = data;
      });
      
      const testEventData: PluginEventData = {
        pluginId: 'test-plugin',
        event: PluginEvent.LOADED,
        data: { test: 'data' }
      };
      
      contributionRegistry.emitEvent(PluginEvent.LOADED, testEventData);
      
      expect(eventReceived).toBe(true);
      expect(receivedData).toEqual(testEventData);
    });
    
    it('should handle multiple event listeners', () => {
      let listener1Called = false;
      let listener2Called = false;
      
      contributionRegistry.addEventListener(PluginEvent.ACTIVATED, () => {
        listener1Called = true;
      });
      
      contributionRegistry.addEventListener(PluginEvent.ACTIVATED, () => {
        listener2Called = true;
      });
      
      contributionRegistry.emitEvent(PluginEvent.ACTIVATED, {
        pluginId: 'test',
        event: PluginEvent.ACTIVATED
      });
      
      expect(listener1Called).toBe(true);
      expect(listener2Called).toBe(true);
    });
    
    it('should remove event listeners', () => {
      let listenerCalled = false;
      
      const listener = () => {
        listenerCalled = true;
      };
      
      contributionRegistry.addEventListener(PluginEvent.ERROR, listener);
      contributionRegistry.removeEventListener(PluginEvent.ERROR, listener);
      
      contributionRegistry.emitEvent(PluginEvent.ERROR, {
        pluginId: 'test',
        event: PluginEvent.ERROR
      });
      
      expect(listenerCalled).toBe(false);
    });
  });
});
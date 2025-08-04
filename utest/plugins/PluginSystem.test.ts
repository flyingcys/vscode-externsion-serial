/**
 * Serial-Studio VSCode Plugin System - Integration Tests
 * 
 * Comprehensive tests for the plugin system, verifying all core functionality
 * including plugin loading, activation, contribution registration, and lifecycle management.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import {
  PluginSystem,
  PluginManager,
  ContributionRegistry,
  PluginLoader,
  ExtensionPoint,
  PluginManifest,
  DriverContribution,
  WidgetContribution,
  PluginEvent
} from '../../src/extension/plugins';

describe('Plugin System Integration Tests', () => {
  let pluginSystem: PluginSystem;
  let pluginManager: PluginManager;
  let contributionRegistry: ContributionRegistry;
  let testPluginDir: string;
  let mockExtensionContext: any;
  
  beforeEach(async () => {
    // Create test directory
    testPluginDir = await fs.mkdtemp(path.join(os.tmpdir(), 'serial-studio-plugin-test-'));
    
    // Create mock VSCode extension context
    mockExtensionContext = {
      extensionPath: testPluginDir,
      globalStorageUri: { fsPath: testPluginDir },
      subscriptions: [],
      globalState: {
        keys: () => [],
        get: () => undefined,
        update: async () => {}
      }
    };
    
    // Get fresh instances
    pluginSystem = PluginSystem.getInstance();
    pluginManager = PluginManager.getInstance();
    contributionRegistry = ContributionRegistry.getInstance();
    
    // Clear any existing state
    contributionRegistry.clear();
  });
  
  afterEach(async () => {
    try {
      // Clean up test directory
      await fs.rm(testPluginDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });
  
  describe('Plugin System Initialization', () => {
    it('should initialize successfully', async () => {
      expect(pluginSystem.isInitialized()).toBe(false);
      
      await pluginSystem.initialize(mockExtensionContext);
      
      expect(pluginSystem.isInitialized()).toBe(true);
    });
    
    it('should not initialize twice', async () => {
      await pluginSystem.initialize(mockExtensionContext);
      expect(pluginSystem.isInitialized()).toBe(true);
      
      // Second initialization should not throw
      await pluginSystem.initialize(mockExtensionContext);
      expect(pluginSystem.isInitialized()).toBe(true);
    });
  });
  
  describe('Plugin Loading and Validation', () => {
    it('should load a valid plugin', async () => {
      const pluginManifest = createTestPluginManifest();
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      
      const result = await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      expect(result).toBe(true);
      
      expect(pluginManager.isPluginLoaded(pluginManifest.id)).toBe(true);
    });
    
    it('should reject invalid plugin manifest', async () => {
      const invalidManifest = {
        // Missing required fields
        name: 'Invalid Plugin'
      };
      
      const pluginPath = await createTestPlugin(invalidManifest as any);
      
      await pluginSystem.initialize(mockExtensionContext);
      
      const result = await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      expect(result).toBe(false);
    });
    
    it('should validate semantic versioning', async () => {
      const manifest = createTestPluginManifest();
      manifest.version = 'invalid-version';
      
      const pluginPath = await createTestPlugin(manifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      
      const result = await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      expect(result).toBe(false);
    });
  });
  
  describe('Plugin Activation and Deactivation', () => {
    it('should activate a loaded plugin', async () => {
      const pluginManifest = createTestPluginManifest();
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      
      const result = await pluginSystem.activatePlugin(pluginManifest.id);
      expect(result).toBe(true);
      
      expect(pluginManager.isPluginActivated(pluginManifest.id)).toBe(true);
    });
    
    it('should deactivate an activated plugin', async () => {
      const pluginManifest = createTestPluginManifest();
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      await pluginSystem.activatePlugin(pluginManifest.id);
      
      const result = await pluginManager.deactivatePlugin(pluginManifest.id);
      expect(result).toBe(true);
      
      expect(pluginManager.isPluginActivated(pluginManifest.id)).toBe(false);
    });
    
    it('should not activate non-existent plugin', async () => {
      await pluginSystem.initialize(mockExtensionContext);
      
      const result = await pluginSystem.activatePlugin('non-existent-plugin');
      expect(result).toBe(false);
    });
  });
  
  describe('Contribution Registration', () => {
    it('should register driver contributions', async () => {
      const pluginManifest = createTestPluginManifest();
      pluginManifest.contributes = {
        drivers: [{
          id: 'test-driver',
          name: 'Test Driver',
          protocol: 'TEST',
          driverClass: class TestDriver {} as any,
          configSchema: { type: 'object' }
        }]
      };
      
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      await pluginSystem.activatePlugin(pluginManifest.id);
      
      const drivers = pluginSystem.getContributions<DriverContribution>(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(drivers).toHaveLength(1);
      expect(drivers[0].id).toBe('test-driver');
    });
    
    it('should register widget contributions', async () => {
      const pluginManifest = createTestPluginManifest();
      pluginManifest.contributes = {
        widgets: [{
          id: 'test-widget',
          name: 'Test Widget',
          type: 'dataset',
          component: class TestWidget {},
          configSchema: { type: 'object' }
        }]
      };
      
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      await pluginSystem.activatePlugin(pluginManifest.id);
      
      const widgets = pluginSystem.getContributions<WidgetContribution>(ExtensionPoint.VISUALIZATION_WIDGETS);
      expect(widgets).toHaveLength(1);
      expect(widgets[0].id).toBe('test-widget');
    });
    
    it('should unregister contributions when plugin is deactivated', async () => {
      const pluginManifest = createTestPluginManifest();
      pluginManifest.contributes = {
        drivers: [{
          id: 'test-driver',
          name: 'Test Driver',
          protocol: 'TEST',
          driverClass: class TestDriver {} as any,
          configSchema: { type: 'object' }
        }]
      };
      
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      await pluginSystem.activatePlugin(pluginManifest.id);
      
      let drivers = pluginSystem.getContributions<DriverContribution>(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(drivers).toHaveLength(1);
      
      await pluginManager.deactivatePlugin(pluginManifest.id);
      
      drivers = pluginSystem.getContributions<DriverContribution>(ExtensionPoint.COMMUNICATION_DRIVERS);
      expect(drivers).toHaveLength(0);
    });
  });
  
  describe('Plugin Events', () => {
    it('should emit plugin loaded event', async () => {
      const pluginManifest = createTestPluginManifest();
      const pluginPath = await createTestPlugin(pluginManifest);
      
      let loadedEventReceived = false;
      contributionRegistry.addEventListener(PluginEvent.LOADED, (data) => {
        if (data.pluginId === pluginManifest.id) {
          loadedEventReceived = true;
        }
      });
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      
      expect(loadedEventReceived).toBe(true);
    });
    
    it('should emit plugin activated event', async () => {
      const pluginManifest = createTestPluginManifest();
      const pluginPath = await createTestPlugin(pluginManifest);
      
      let activatedEventReceived = false;
      contributionRegistry.addEventListener(PluginEvent.ACTIVATED, (data) => {
        if (data.pluginId === pluginManifest.id) {
          activatedEventReceived = true;
        }
      });
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      await pluginSystem.activatePlugin(pluginManifest.id);
      
      expect(activatedEventReceived).toBe(true);
    });
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
    
    it('should track contributions correctly', async () => {
      const stats = contributionRegistry.getStatistics();
      expect(stats.totalContributions).toBe(0);
      expect(stats.totalPlugins).toBe(0);
      
      const pluginManifest = createTestPluginManifest();
      pluginManifest.contributes = {
        drivers: [{ id: 'driver1', name: 'Driver 1', protocol: 'TEST1', driverClass: class {} as any, configSchema: {} }],
        widgets: [{ id: 'widget1', name: 'Widget 1', type: 'dataset', component: class {}, configSchema: {} }]
      };
      
      const pluginPath = await createTestPlugin(pluginManifest);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      await pluginSystem.activatePlugin(pluginManifest.id);
      
      const newStats = contributionRegistry.getStatistics();
      expect(newStats.totalContributions).toBe(2);
      expect(newStats.totalPlugins).toBe(1);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle plugin loading errors gracefully', async () => {
      await pluginSystem.initialize(mockExtensionContext);
      
      const result = await pluginSystem.loadPlugin('/non/existent/path/plugin.json');
      expect(result).toBe(false);
    });
    
    it('should handle plugin activation errors gracefully', async () => {
      const pluginManifest = createTestPluginManifest();
      
      // Create plugin with faulty activate function
      const pluginCode = `
        exports.activate = function(context) {
          throw new Error('Activation error');
        };
      `;
      
      const pluginPath = await createTestPlugin(pluginManifest, pluginCode);
      
      await pluginSystem.initialize(mockExtensionContext);
      await pluginSystem.loadPlugin(path.join(pluginPath, 'plugin.json'));
      
      const result = await pluginSystem.activatePlugin(pluginManifest.id);
      expect(result).toBe(false);
    });
  });
  
  // Helper functions
  
  function createTestPluginManifest(): PluginManifest {
    return {
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
      activationEvents: ['*'],
      main: 'index.js'
    };
  }
  
  async function createTestPlugin(manifest: PluginManifest, customCode?: string): Promise<string> {
    const pluginDir = path.join(testPluginDir, manifest.id);
    await fs.mkdir(pluginDir, { recursive: true });
    
    // Write manifest
    await fs.writeFile(
      path.join(pluginDir, 'plugin.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Write main file
    const mainCode = customCode || `
      exports.activate = function(context) {
        context.logger.info('Plugin activated: ${manifest.name}');
      };
      
      exports.deactivate = function() {
        console.log('Plugin deactivated: ${manifest.name}');
      };
      
      exports.drivers = manifest.contributes && manifest.contributes.drivers || [];
      exports.widgets = manifest.contributes && manifest.contributes.widgets || [];
    `;
    
    await fs.writeFile(path.join(pluginDir, 'index.js'), mainCode);
    
    return pluginDir;
  }
});
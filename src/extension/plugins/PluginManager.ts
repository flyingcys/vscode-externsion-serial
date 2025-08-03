/**
 * Serial-Studio VSCode Plugin System - Plugin Manager
 * 
 * This module implements the core plugin management system that handles
 * plugin loading, activation, deactivation, and lifecycle management.
 * 
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ContributionRegistry } from './ContributionRegistry';
import { PluginLoader } from './PluginLoader';
import { PluginContextImpl } from './PluginContext';
import {
  PluginManifest,
  PluginInstance,
  PluginActivationResult,
  PluginContext,
  ExtensionPoint,
  PluginEvent,
  PluginEventData
} from './types';

/**
 * Plugin Manager
 * 
 * Central management system for all plugins. Handles the complete lifecycle
 * from discovery to activation and cleanup.
 */
export class PluginManager {
  private static instance: PluginManager;
  
  private readonly contributionRegistry: ContributionRegistry;
  private readonly pluginLoader: PluginLoader;
  private readonly loadedPlugins = new Map<string, PluginInstance>();
  private readonly activatedPlugins = new Set<string>();
  private readonly pluginPaths = new Map<string, string>();
  
  private extensionContext: vscode.ExtensionContext | null = null;
  private initializationComplete = false;
  
  private constructor() {
    this.contributionRegistry = ContributionRegistry.getInstance();
    this.pluginLoader = new PluginLoader();
    
    // Listen for contribution registry events
    this.contributionRegistry.addEventListener(
      PluginEvent.ERROR,
      this.handlePluginError.bind(this)
    );
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }
  
  /**
   * Initialize plugin manager with VSCode extension context
   */
  public async initialize(extensionContext: vscode.ExtensionContext): Promise<void> {
    if (this.initializationComplete) {
      return;
    }
    
    this.extensionContext = extensionContext;
    
    // Register cleanup on extension deactivation
    extensionContext.subscriptions.push({
      dispose: () => this.deactivateAllPlugins()
    });
    
    // Discover and load built-in plugins
    await this.discoverBuiltinPlugins();
    
    // Discover and load user plugins
    await this.discoverUserPlugins();
    
    this.initializationComplete = true;
    
    vscode.window.showInformationMessage(
      `Serial Studio Plugin Manager initialized. Loaded ${this.loadedPlugins.size} plugins.`
    );
  }
  
  /**
   * Load a plugin from manifest path
   */
  public async loadPlugin(manifestPath: string): Promise<boolean> {
    try {
      // Validate input parameters
      if (!manifestPath || typeof manifestPath !== 'string') {
        console.error(`Failed to load plugin from ${manifestPath}: Invalid manifest path`);
        return false;
      }
      
      console.log(`Loading plugin from: ${manifestPath}`);
      
      // Load and validate manifest
      const manifest = await this.pluginLoader.loadManifest(manifestPath);
      await this.pluginLoader.validateManifest(manifest);
      
      // Check if plugin is already loaded
      if (this.loadedPlugins.has(manifest.id)) {
        console.warn(`Plugin ${manifest.id} is already loaded`);
        return false;
      }
      
      // Load plugin code
      const pluginPath = path.dirname(manifestPath);
      const pluginModule = await this.pluginLoader.loadPluginModule(manifest, pluginPath);
      
      // Create plugin context
      const context = new PluginContextImpl(manifest, this.extensionContext!);
      
      // Create plugin instance
      const instance: PluginInstance = {
        manifest,
        exports: pluginModule,
        context,
        activate: pluginModule.activate,
        deactivate: pluginModule.deactivate
      };
      
      // Register plugin
      this.loadedPlugins.set(manifest.id, instance);
      this.pluginPaths.set(manifest.id, pluginPath);
      
      // Emit loaded event
      this.emitPluginEvent(PluginEvent.LOADED, {
        pluginId: manifest.id,
        event: PluginEvent.LOADED,
        data: manifest
      });
      
      console.log(`Successfully loaded plugin: ${manifest.name} (${manifest.id})`);
      return true;
      
    } catch (error) {
      console.error(`Failed to load plugin from ${manifestPath}:`, error);
      
      this.emitPluginEvent(PluginEvent.ERROR, {
        pluginId: 'unknown',
        event: PluginEvent.ERROR,
        error: error as Error
      });
      
      return false;
    }
  }
  
  /**
   * Activate a plugin
   */
  public async activatePlugin(pluginId: string): Promise<PluginActivationResult> {
    const instance = this.loadedPlugins.get(pluginId);
    if (!instance) {
      return {
        success: false,
        error: `Plugin ${pluginId} is not loaded`
      };
    }
    
    if (this.activatedPlugins.has(pluginId)) {
      return {
        success: true,
        exports: instance.exports
      };
    }
    
    try {
      console.log(`Activating plugin: ${instance.manifest.name}`);
      
      // Call plugin's activate function
      if (instance.activate) {
        const result = instance.activate(instance.context);
        if (result instanceof Promise) {
          await result;
        }
      }
      
      // Register plugin contributions
      await this.registerPluginContributions(instance);
      
      // Mark as activated
      this.activatedPlugins.add(pluginId);
      
      // Emit activated event
      this.emitPluginEvent(PluginEvent.ACTIVATED, {
        pluginId,
        event: PluginEvent.ACTIVATED,
        data: instance.manifest
      });
      
      console.log(`Successfully activated plugin: ${instance.manifest.name}`);
      
      return {
        success: true,
        exports: instance.exports
      };
      
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);
      
      this.emitPluginEvent(PluginEvent.ERROR, {
        pluginId,
        event: PluginEvent.ERROR,
        error: error as Error
      });
      
      return {
        success: false,
        error: `Activation failed: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Deactivate a plugin
   */
  public async deactivatePlugin(pluginId: string): Promise<boolean> {
    const instance = this.loadedPlugins.get(pluginId);
    if (!instance || !this.activatedPlugins.has(pluginId)) {
      return false;
    }
    
    try {
      console.log(`Deactivating plugin: ${instance.manifest.name}`);
      
      // Unregister contributions
      this.contributionRegistry.unregisterPlugin(pluginId);
      
      // Call plugin's deactivate function
      if (instance.deactivate) {
        const result = instance.deactivate();
        if (result instanceof Promise) {
          await result;
        }
      }
      
      // Clean up plugin context
      instance.context.subscriptions.forEach(disposable => {
        if (disposable && typeof disposable.dispose === 'function') {
          disposable.dispose();
        }
      });
      
      // Mark as deactivated
      this.activatedPlugins.delete(pluginId);
      
      // Emit deactivated event
      this.emitPluginEvent(PluginEvent.DEACTIVATED, {
        pluginId,
        event: PluginEvent.DEACTIVATED,
        data: instance.manifest
      });
      
      console.log(`Successfully deactivated plugin: ${instance.manifest.name}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error);
      
      this.emitPluginEvent(PluginEvent.ERROR, {
        pluginId,
        event: PluginEvent.ERROR,
        error: error as Error
      });
      
      return false;
    }
  }
  
  /**
   * Unload a plugin
   */
  public async unloadPlugin(pluginId: string): Promise<boolean> {
    // Deactivate first if activated
    if (this.activatedPlugins.has(pluginId)) {
      await this.deactivatePlugin(pluginId);
    }
    
    const instance = this.loadedPlugins.get(pluginId);
    if (!instance) {
      return false;
    }
    
    try {
      // Remove from maps
      this.loadedPlugins.delete(pluginId);
      this.pluginPaths.delete(pluginId);
      
      // Emit unloaded event
      this.emitPluginEvent(PluginEvent.UNLOADED, {
        pluginId,
        event: PluginEvent.UNLOADED,
        data: instance.manifest
      });
      
      console.log(`Successfully unloaded plugin: ${instance.manifest.name}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Get loaded plugin instance
   */
  public getPlugin(pluginId: string): PluginInstance | undefined {
    return this.loadedPlugins.get(pluginId);
  }
  
  /**
   * Get all loaded plugins
   */
  public getLoadedPlugins(): PluginInstance[] {
    return Array.from(this.loadedPlugins.values());
  }
  
  /**
   * Get activated plugins
   */
  public getActivatedPlugins(): PluginInstance[] {
    return Array.from(this.activatedPlugins)
      .map(id => this.loadedPlugins.get(id))
      .filter((instance): instance is PluginInstance => instance !== undefined);
  }
  
  /**
   * Check if plugin is loaded
   */
  public isPluginLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId);
  }
  
  /**
   * Check if plugin is activated
   */
  public isPluginActivated(pluginId: string): boolean {
    return this.activatedPlugins.has(pluginId);
  }
  
  /**
   * Get contribution registry
   */
  public getContributionRegistry(): ContributionRegistry {
    return this.contributionRegistry;
  }
  
  /**
   * Reload a plugin
   */
  public async reloadPlugin(pluginId: string): Promise<boolean> {
    const pluginPath = this.pluginPaths.get(pluginId);
    if (!pluginPath) {
      return false;
    }
    
    // Unload current instance
    await this.unloadPlugin(pluginId);
    
    // Reload from path
    const manifestPath = path.join(pluginPath, 'plugin.json');
    return await this.loadPlugin(manifestPath);
  }
  
  /**
   * Deactivate all plugins
   */
  public async deactivateAllPlugins(): Promise<void> {
    const activatedPluginIds = Array.from(this.activatedPlugins);
    
    for (const pluginId of activatedPluginIds) {
      await this.deactivatePlugin(pluginId);
    }
    
    console.log('All plugins deactivated');
  }
  
  /**
   * Get plugin statistics
   */
  public getStatistics(): PluginStatistics {
    const contributionStats = this.contributionRegistry.getStatistics();
    
    return {
      totalPlugins: this.loadedPlugins.size,
      activatedPlugins: this.activatedPlugins.size,
      totalContributions: contributionStats.totalContributions,
      contributionsByExtensionPoint: contributionStats.contributionsByExtensionPoint
    };
  }
  
  /**
   * Register plugin contributions to extension points
   */
  private async registerPluginContributions(instance: PluginInstance): Promise<void> {
    const { manifest } = instance;
    const { contributes } = manifest;
    
    if (!contributes) {
      return;
    }
    
    // Register each type of contribution
    if (contributes.drivers) {
      for (const driver of contributes.drivers) {
        this.contributionRegistry.register(
          ExtensionPoint.COMMUNICATION_DRIVERS,
          driver,
          manifest.id
        );
      }
    }
    
    if (contributes.parsers) {
      for (const parser of contributes.parsers) {
        this.contributionRegistry.register(
          ExtensionPoint.DATA_PARSERS,
          parser,
          manifest.id
        );
      }
    }
    
    if (contributes.validators) {
      for (const validator of contributes.validators) {
        this.contributionRegistry.register(
          ExtensionPoint.DATA_VALIDATORS,
          validator,
          manifest.id
        );
      }
    }
    
    if (contributes.transformers) {
      for (const transformer of contributes.transformers) {
        this.contributionRegistry.register(
          ExtensionPoint.DATA_TRANSFORMERS,
          transformer,
          manifest.id
        );
      }
    }
    
    if (contributes.widgets) {
      for (const widget of contributes.widgets) {
        this.contributionRegistry.register(
          ExtensionPoint.VISUALIZATION_WIDGETS,
          widget,
          manifest.id
        );
      }
    }
    
    if (contributes.renderers) {
      for (const renderer of contributes.renderers) {
        this.contributionRegistry.register(
          ExtensionPoint.CHART_RENDERERS,
          renderer,
          manifest.id
        );
      }
    }
    
    if (contributes.exportFormats) {
      for (const format of contributes.exportFormats) {
        this.contributionRegistry.register(
          ExtensionPoint.EXPORT_FORMATS,
          format,
          manifest.id
        );
      }
    }
    
    if (contributes.exportProcessors) {
      for (const processor of contributes.exportProcessors) {
        this.contributionRegistry.register(
          ExtensionPoint.EXPORT_PROCESSORS,
          processor,
          manifest.id
        );
      }
    }
    
    if (contributes.menus) {
      for (const menu of contributes.menus) {
        this.contributionRegistry.register(
          ExtensionPoint.MENU_CONTRIBUTIONS,
          menu,
          manifest.id
        );
      }
    }
    
    if (contributes.toolbars) {
      for (const toolbar of contributes.toolbars) {
        this.contributionRegistry.register(
          ExtensionPoint.TOOLBAR_CONTRIBUTIONS,
          toolbar,
          manifest.id
        );
      }
    }
    
    if (contributes.settings) {
      for (const setting of contributes.settings) {
        this.contributionRegistry.register(
          ExtensionPoint.SETTINGS_PAGES,
          setting,
          manifest.id
        );
      }
    }
    
    if (contributes.themes) {
      for (const theme of contributes.themes) {
        this.contributionRegistry.register(
          ExtensionPoint.THEMES,
          theme,
          manifest.id
        );
      }
    }
    
    if (contributes.iconThemes) {
      for (const iconTheme of contributes.iconThemes) {
        this.contributionRegistry.register(
          ExtensionPoint.ICON_THEMES,
          iconTheme,
          manifest.id
        );
      }
    }
    
    if (contributes.debugTools) {
      for (const debugTool of contributes.debugTools) {
        this.contributionRegistry.register(
          ExtensionPoint.DEBUG_TOOLS,
          debugTool,
          manifest.id
        );
      }
    }
    
    if (contributes.analysisTools) {
      for (const analysisTool of contributes.analysisTools) {
        this.contributionRegistry.register(
          ExtensionPoint.ANALYSIS_TOOLS,
          analysisTool,
          manifest.id
        );
      }
    }
  }
  
  /**
   * Discover built-in plugins
   */
  private async discoverBuiltinPlugins(): Promise<void> {
    if (!this.extensionContext) {
      return;
    }
    
    const builtinPluginsPath = path.join(this.extensionContext.extensionPath, 'plugins');
    
    try {
      await this.discoverPluginsInDirectory(builtinPluginsPath);
    } catch (error) {
      console.log('No built-in plugins directory found');
    }
  }
  
  /**
   * Discover user plugins
   */
  private async discoverUserPlugins(): Promise<void> {
    if (!this.extensionContext) {
      return;
    }
    
    const userPluginsPath = path.join(this.extensionContext.globalStorageUri.fsPath, 'plugins');
    
    try {
      await this.discoverPluginsInDirectory(userPluginsPath);
    } catch (error) {
      console.log('No user plugins directory found');
    }
  }
  
  /**
   * Discover plugins in a directory
   */
  private async discoverPluginsInDirectory(directory: string): Promise<void> {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginDir = path.join(directory, entry.name);
          const manifestPath = path.join(pluginDir, 'plugin.json');
          
          try {
            await fs.access(manifestPath);
            await this.loadPlugin(manifestPath);
          } catch (error) {
            console.log(`No manifest found in ${pluginDir}`);
          }
        }
      }
    } catch (error) {
      console.log(`Could not read plugins directory ${directory}`);
    }
  }
  
  /**
   * Handle plugin errors
   */
  private handlePluginError(data: PluginEventData): void {
    console.error(`Plugin error in ${data.pluginId}:`, data.error);
    
    // Show error to user
    vscode.window.showErrorMessage(
      `Plugin ${data.pluginId} encountered an error: ${data.error?.message}`
    );
  }
  
  /**
   * Emit plugin event
   */
  private emitPluginEvent(event: PluginEvent, data: PluginEventData): void {
    this.contributionRegistry.emitEvent(event, data);
  }
}

/**
 * Plugin Statistics
 */
export interface PluginStatistics {
  totalPlugins: number;
  activatedPlugins: number;
  totalContributions: number;
  contributionsByExtensionPoint: Record<ExtensionPoint, number>;
}
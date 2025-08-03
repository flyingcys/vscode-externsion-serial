/**
 * Serial-Studio VSCode Plugin System - Main Entry Point
 * 
 * This module exports all the core components of the plugin system,
 * providing a unified interface for the plugin architecture.
 * 
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */

// Core types and interfaces
export * from './types';

// Main plugin system components
export { ContributionRegistry } from './ContributionRegistry';
export { PluginManager } from './PluginManager';
export { PluginLoader } from './PluginLoader';
export { 
  PluginContextImpl, 
  PluginContextFactory, 
  PluginSecurityManager 
} from './PluginContext';

// Re-export key types for convenience
export {
  ExtensionPoint,
  PluginManifest,
  PluginInstance,
  PluginContext,
  PluginEvent,
  PluginEventData,
  DriverContribution,
  WidgetContribution,
  ParserContribution,
  MenuContribution,
  ToolbarContribution
} from './types';

/**
 * Plugin System Facade
 * 
 * Provides a simplified interface for initializing and using the plugin system.
 */
export class PluginSystem {
  private static instance: PluginSystem;
  private pluginManager: import('./PluginManager').PluginManager;
  private contributionRegistry: import('./ContributionRegistry').ContributionRegistry;
  private initialized = false;
  
  private constructor() {
    const { PluginManager } = require('./PluginManager');
    const { ContributionRegistry } = require('./ContributionRegistry');
    this.pluginManager = PluginManager.getInstance();
    this.contributionRegistry = ContributionRegistry.getInstance();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }
  
  /**
   * Initialize the plugin system
   */
  public async initialize(extensionContext: any): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    await this.pluginManager.initialize(extensionContext);
    this.initialized = true;
    
    console.log('Serial Studio Plugin System initialized successfully');
  }
  
  /**
   * Get plugin manager
   */
  public getPluginManager(): import('./PluginManager').PluginManager {
    return this.pluginManager;
  }
  
  /**
   * Get contribution registry
   */
  public getContributionRegistry(): import('./ContributionRegistry').ContributionRegistry {
    return this.contributionRegistry;
  }
  
  /**
   * Load a plugin
   */
  public async loadPlugin(manifestPath: string): Promise<boolean> {
    return await this.pluginManager.loadPlugin(manifestPath);
  }
  
  /**
   * Activate a plugin
   */
  public async activatePlugin(pluginId: string): Promise<boolean> {
    const result = await this.pluginManager.activatePlugin(pluginId);
    return result.success;
  }
  
  /**
   * Get contributions for an extension point
   */
  public getContributions<T>(extensionPoint: import('./types').ExtensionPoint): T[] {
    return this.contributionRegistry.getContributions<T>(extensionPoint);
  }
  
  /**
   * Get system statistics
   */
  public getStatistics() {
    return this.pluginManager.getStatistics();
  }
  
  /**
   * Check if system is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Default export for convenience
 */
export default PluginSystem;
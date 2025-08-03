/**
 * Serial-Studio VSCode Plugin System - Plugin Manager
 *
 * This module implements the core plugin management system that handles
 * plugin loading, activation, deactivation, and lifecycle management.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
import * as vscode from 'vscode';
import { ContributionRegistry } from './ContributionRegistry';
import { PluginInstance, PluginActivationResult, ExtensionPoint } from './types';
/**
 * Plugin Manager
 *
 * Central management system for all plugins. Handles the complete lifecycle
 * from discovery to activation and cleanup.
 */
export declare class PluginManager {
    private static instance;
    private readonly contributionRegistry;
    private readonly pluginLoader;
    private readonly loadedPlugins;
    private readonly activatedPlugins;
    private readonly pluginPaths;
    private extensionContext;
    private initializationComplete;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): PluginManager;
    /**
     * Initialize plugin manager with VSCode extension context
     */
    initialize(extensionContext: vscode.ExtensionContext): Promise<void>;
    /**
     * Load a plugin from manifest path
     */
    loadPlugin(manifestPath: string): Promise<boolean>;
    /**
     * Activate a plugin
     */
    activatePlugin(pluginId: string): Promise<PluginActivationResult>;
    /**
     * Deactivate a plugin
     */
    deactivatePlugin(pluginId: string): Promise<boolean>;
    /**
     * Unload a plugin
     */
    unloadPlugin(pluginId: string): Promise<boolean>;
    /**
     * Get loaded plugin instance
     */
    getPlugin(pluginId: string): PluginInstance | undefined;
    /**
     * Get all loaded plugins
     */
    getLoadedPlugins(): PluginInstance[];
    /**
     * Get activated plugins
     */
    getActivatedPlugins(): PluginInstance[];
    /**
     * Check if plugin is loaded
     */
    isPluginLoaded(pluginId: string): boolean;
    /**
     * Check if plugin is activated
     */
    isPluginActivated(pluginId: string): boolean;
    /**
     * Get contribution registry
     */
    getContributionRegistry(): ContributionRegistry;
    /**
     * Reload a plugin
     */
    reloadPlugin(pluginId: string): Promise<boolean>;
    /**
     * Deactivate all plugins
     */
    deactivateAllPlugins(): Promise<void>;
    /**
     * Get plugin statistics
     */
    getStatistics(): PluginStatistics;
    /**
     * Register plugin contributions to extension points
     */
    private registerPluginContributions;
    /**
     * Discover built-in plugins
     */
    private discoverBuiltinPlugins;
    /**
     * Discover user plugins
     */
    private discoverUserPlugins;
    /**
     * Discover plugins in a directory
     */
    private discoverPluginsInDirectory;
    /**
     * Handle plugin errors
     */
    private handlePluginError;
    /**
     * Emit plugin event
     */
    private emitPluginEvent;
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
//# sourceMappingURL=PluginManager.d.ts.map
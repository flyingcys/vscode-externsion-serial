/**
 * Serial-Studio VSCode Plugin System - Main Entry Point
 *
 * This module exports all the core components of the plugin system,
 * providing a unified interface for the plugin architecture.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
export * from './types';
export { ContributionRegistry } from './ContributionRegistry';
export { PluginManager } from './PluginManager';
export { PluginLoader } from './PluginLoader';
export { PluginContextImpl, PluginContextFactory, PluginSecurityManager } from './PluginContext';
export { ExtensionPoint, PluginManifest, PluginInstance, PluginContext, PluginEvent, PluginEventData, DriverContribution, WidgetContribution, ParserContribution, MenuContribution, ToolbarContribution } from './types';
/**
 * Plugin System Facade
 *
 * Provides a simplified interface for initializing and using the plugin system.
 */
export declare class PluginSystem {
    private static instance;
    private pluginManager;
    private contributionRegistry;
    private initialized;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): PluginSystem;
    /**
     * Initialize the plugin system
     */
    initialize(extensionContext: any): Promise<void>;
    /**
     * Get plugin manager
     */
    getPluginManager(): import('./PluginManager').PluginManager;
    /**
     * Get contribution registry
     */
    getContributionRegistry(): import('./ContributionRegistry').ContributionRegistry;
    /**
     * Load a plugin
     */
    loadPlugin(manifestPath: string): Promise<boolean>;
    /**
     * Activate a plugin
     */
    activatePlugin(pluginId: string): Promise<boolean>;
    /**
     * Get contributions for an extension point
     */
    getContributions<T>(extensionPoint: import('./types').ExtensionPoint): T[];
    /**
     * Get system statistics
     */
    getStatistics(): import("./PluginManager").PluginStatistics;
    /**
     * Check if system is initialized
     */
    isInitialized(): boolean;
}
/**
 * Default export for convenience
 */
export default PluginSystem;
//# sourceMappingURL=index.d.ts.map
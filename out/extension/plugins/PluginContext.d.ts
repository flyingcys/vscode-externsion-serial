/**
 * Serial-Studio VSCode Plugin System - Plugin Context
 *
 * This module implements the plugin execution context that provides
 * runtime environment and API access for plugins.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
import * as vscode from 'vscode';
import { PluginContext, PluginManifest, PluginLogger, PluginStorage, PluginAPI } from './types';
/**
 * Plugin Context Implementation
 *
 * Provides the runtime environment for plugins, including logging,
 * storage, and API access to Serial-Studio functionality.
 */
export declare class PluginContextImpl implements PluginContext {
    readonly extensionContext: vscode.ExtensionContext;
    readonly manifest: PluginManifest;
    readonly logger: PluginLogger;
    readonly storage: PluginStorage;
    readonly api: PluginAPI;
    readonly subscriptions: any[];
    constructor(manifest: PluginManifest, extensionContext: vscode.ExtensionContext);
}
/**
 * Plugin Context Factory
 *
 * Creates plugin contexts with proper isolation and resource management.
 */
export declare class PluginContextFactory {
    private static contexts;
    /**
     * Create a plugin context
     */
    static createContext(manifest: PluginManifest, extensionContext: vscode.ExtensionContext): PluginContext;
    /**
     * Destroy a plugin context
     */
    static destroyContext(manifest: PluginManifest): void;
    /**
     * Get all active contexts
     */
    static getActiveContexts(): PluginContext[];
    /**
     * Clear all contexts (for testing)
     */
    static clearAll(): void;
}
/**
 * Plugin Security Manager
 *
 * Provides security controls and sandboxing for plugin execution.
 */
export declare class PluginSecurityManager {
    private static allowedAPIs;
    private static restrictedAPIs;
    /**
     * Check if API is allowed for plugins
     */
    static isAPIAllowed(apiName: string): boolean;
    /**
     * Validate plugin code for security issues
     */
    static validatePluginCode(code: string): string[];
    /**
     * Create sandboxed execution context for plugin code
     */
    static createSandbox(): any;
}
//# sourceMappingURL=PluginContext.d.ts.map
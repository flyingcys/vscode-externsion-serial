"use strict";
/**
 * Serial-Studio VSCode Plugin System - Plugin Manager
 *
 * This module implements the core plugin management system that handles
 * plugin loading, activation, deactivation, and lifecycle management.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const ContributionRegistry_1 = require("./ContributionRegistry");
const PluginLoader_1 = require("./PluginLoader");
const PluginContext_1 = require("./PluginContext");
const types_1 = require("./types");
/**
 * Plugin Manager
 *
 * Central management system for all plugins. Handles the complete lifecycle
 * from discovery to activation and cleanup.
 */
class PluginManager {
    static instance;
    contributionRegistry;
    pluginLoader;
    loadedPlugins = new Map();
    activatedPlugins = new Set();
    pluginPaths = new Map();
    extensionContext = null;
    initializationComplete = false;
    constructor() {
        this.contributionRegistry = ContributionRegistry_1.ContributionRegistry.getInstance();
        this.pluginLoader = new PluginLoader_1.PluginLoader();
        // Listen for contribution registry events
        this.contributionRegistry.addEventListener(types_1.PluginEvent.ERROR, this.handlePluginError.bind(this));
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }
    /**
     * Initialize plugin manager with VSCode extension context
     */
    async initialize(extensionContext) {
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
        vscode.window.showInformationMessage(`Serial Studio Plugin Manager initialized. Loaded ${this.loadedPlugins.size} plugins.`);
    }
    /**
     * Load a plugin from manifest path
     */
    async loadPlugin(manifestPath) {
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
            const context = new PluginContext_1.PluginContextImpl(manifest, this.extensionContext);
            // Create plugin instance
            const instance = {
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
            this.emitPluginEvent(types_1.PluginEvent.LOADED, {
                pluginId: manifest.id,
                event: types_1.PluginEvent.LOADED,
                data: manifest
            });
            console.log(`Successfully loaded plugin: ${manifest.name} (${manifest.id})`);
            return true;
        }
        catch (error) {
            console.error(`Failed to load plugin from ${manifestPath}:`, error);
            this.emitPluginEvent(types_1.PluginEvent.ERROR, {
                pluginId: 'unknown',
                event: types_1.PluginEvent.ERROR,
                error: error
            });
            return false;
        }
    }
    /**
     * Activate a plugin
     */
    async activatePlugin(pluginId) {
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
            this.emitPluginEvent(types_1.PluginEvent.ACTIVATED, {
                pluginId,
                event: types_1.PluginEvent.ACTIVATED,
                data: instance.manifest
            });
            console.log(`Successfully activated plugin: ${instance.manifest.name}`);
            return {
                success: true,
                exports: instance.exports
            };
        }
        catch (error) {
            console.error(`Failed to activate plugin ${pluginId}:`, error);
            this.emitPluginEvent(types_1.PluginEvent.ERROR, {
                pluginId,
                event: types_1.PluginEvent.ERROR,
                error: error
            });
            return {
                success: false,
                error: `Activation failed: ${error.message}`
            };
        }
    }
    /**
     * Deactivate a plugin
     */
    async deactivatePlugin(pluginId) {
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
            this.emitPluginEvent(types_1.PluginEvent.DEACTIVATED, {
                pluginId,
                event: types_1.PluginEvent.DEACTIVATED,
                data: instance.manifest
            });
            console.log(`Successfully deactivated plugin: ${instance.manifest.name}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to deactivate plugin ${pluginId}:`, error);
            this.emitPluginEvent(types_1.PluginEvent.ERROR, {
                pluginId,
                event: types_1.PluginEvent.ERROR,
                error: error
            });
            return false;
        }
    }
    /**
     * Unload a plugin
     */
    async unloadPlugin(pluginId) {
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
            this.emitPluginEvent(types_1.PluginEvent.UNLOADED, {
                pluginId,
                event: types_1.PluginEvent.UNLOADED,
                data: instance.manifest
            });
            console.log(`Successfully unloaded plugin: ${instance.manifest.name}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to unload plugin ${pluginId}:`, error);
            return false;
        }
    }
    /**
     * Get loaded plugin instance
     */
    getPlugin(pluginId) {
        return this.loadedPlugins.get(pluginId);
    }
    /**
     * Get all loaded plugins
     */
    getLoadedPlugins() {
        return Array.from(this.loadedPlugins.values());
    }
    /**
     * Get activated plugins
     */
    getActivatedPlugins() {
        return Array.from(this.activatedPlugins)
            .map(id => this.loadedPlugins.get(id))
            .filter((instance) => instance !== undefined);
    }
    /**
     * Check if plugin is loaded
     */
    isPluginLoaded(pluginId) {
        return this.loadedPlugins.has(pluginId);
    }
    /**
     * Check if plugin is activated
     */
    isPluginActivated(pluginId) {
        return this.activatedPlugins.has(pluginId);
    }
    /**
     * Get contribution registry
     */
    getContributionRegistry() {
        return this.contributionRegistry;
    }
    /**
     * Reload a plugin
     */
    async reloadPlugin(pluginId) {
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
    async deactivateAllPlugins() {
        const activatedPluginIds = Array.from(this.activatedPlugins);
        for (const pluginId of activatedPluginIds) {
            await this.deactivatePlugin(pluginId);
        }
        console.log('All plugins deactivated');
    }
    /**
     * Get plugin statistics
     */
    getStatistics() {
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
    async registerPluginContributions(instance) {
        const { manifest } = instance;
        const { contributes } = manifest;
        if (!contributes) {
            return;
        }
        // Register each type of contribution
        if (contributes.drivers) {
            for (const driver of contributes.drivers) {
                this.contributionRegistry.register(types_1.ExtensionPoint.COMMUNICATION_DRIVERS, driver, manifest.id);
            }
        }
        if (contributes.parsers) {
            for (const parser of contributes.parsers) {
                this.contributionRegistry.register(types_1.ExtensionPoint.DATA_PARSERS, parser, manifest.id);
            }
        }
        if (contributes.validators) {
            for (const validator of contributes.validators) {
                this.contributionRegistry.register(types_1.ExtensionPoint.DATA_VALIDATORS, validator, manifest.id);
            }
        }
        if (contributes.transformers) {
            for (const transformer of contributes.transformers) {
                this.contributionRegistry.register(types_1.ExtensionPoint.DATA_TRANSFORMERS, transformer, manifest.id);
            }
        }
        if (contributes.widgets) {
            for (const widget of contributes.widgets) {
                this.contributionRegistry.register(types_1.ExtensionPoint.VISUALIZATION_WIDGETS, widget, manifest.id);
            }
        }
        if (contributes.renderers) {
            for (const renderer of contributes.renderers) {
                this.contributionRegistry.register(types_1.ExtensionPoint.CHART_RENDERERS, renderer, manifest.id);
            }
        }
        if (contributes.exportFormats) {
            for (const format of contributes.exportFormats) {
                this.contributionRegistry.register(types_1.ExtensionPoint.EXPORT_FORMATS, format, manifest.id);
            }
        }
        if (contributes.exportProcessors) {
            for (const processor of contributes.exportProcessors) {
                this.contributionRegistry.register(types_1.ExtensionPoint.EXPORT_PROCESSORS, processor, manifest.id);
            }
        }
        if (contributes.menus) {
            for (const menu of contributes.menus) {
                this.contributionRegistry.register(types_1.ExtensionPoint.MENU_CONTRIBUTIONS, menu, manifest.id);
            }
        }
        if (contributes.toolbars) {
            for (const toolbar of contributes.toolbars) {
                this.contributionRegistry.register(types_1.ExtensionPoint.TOOLBAR_CONTRIBUTIONS, toolbar, manifest.id);
            }
        }
        if (contributes.settings) {
            for (const setting of contributes.settings) {
                this.contributionRegistry.register(types_1.ExtensionPoint.SETTINGS_PAGES, setting, manifest.id);
            }
        }
        if (contributes.themes) {
            for (const theme of contributes.themes) {
                this.contributionRegistry.register(types_1.ExtensionPoint.THEMES, theme, manifest.id);
            }
        }
        if (contributes.iconThemes) {
            for (const iconTheme of contributes.iconThemes) {
                this.contributionRegistry.register(types_1.ExtensionPoint.ICON_THEMES, iconTheme, manifest.id);
            }
        }
        if (contributes.debugTools) {
            for (const debugTool of contributes.debugTools) {
                this.contributionRegistry.register(types_1.ExtensionPoint.DEBUG_TOOLS, debugTool, manifest.id);
            }
        }
        if (contributes.analysisTools) {
            for (const analysisTool of contributes.analysisTools) {
                this.contributionRegistry.register(types_1.ExtensionPoint.ANALYSIS_TOOLS, analysisTool, manifest.id);
            }
        }
    }
    /**
     * Discover built-in plugins
     */
    async discoverBuiltinPlugins() {
        if (!this.extensionContext) {
            return;
        }
        const builtinPluginsPath = path.join(this.extensionContext.extensionPath, 'plugins');
        try {
            await this.discoverPluginsInDirectory(builtinPluginsPath);
        }
        catch (error) {
            console.log('No built-in plugins directory found');
        }
    }
    /**
     * Discover user plugins
     */
    async discoverUserPlugins() {
        if (!this.extensionContext) {
            return;
        }
        const userPluginsPath = path.join(this.extensionContext.globalStorageUri.fsPath, 'plugins');
        try {
            await this.discoverPluginsInDirectory(userPluginsPath);
        }
        catch (error) {
            console.log('No user plugins directory found');
        }
    }
    /**
     * Discover plugins in a directory
     */
    async discoverPluginsInDirectory(directory) {
        try {
            const entries = await fs.readdir(directory, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const pluginDir = path.join(directory, entry.name);
                    const manifestPath = path.join(pluginDir, 'plugin.json');
                    try {
                        await fs.access(manifestPath);
                        await this.loadPlugin(manifestPath);
                    }
                    catch (error) {
                        console.log(`No manifest found in ${pluginDir}`);
                    }
                }
            }
        }
        catch (error) {
            console.log(`Could not read plugins directory ${directory}`);
        }
    }
    /**
     * Handle plugin errors
     */
    handlePluginError(data) {
        console.error(`Plugin error in ${data.pluginId}:`, data.error);
        // Show error to user
        vscode.window.showErrorMessage(`Plugin ${data.pluginId} encountered an error: ${data.error?.message}`);
    }
    /**
     * Emit plugin event
     */
    emitPluginEvent(event, data) {
        this.contributionRegistry.emitEvent(event, data);
    }
}
exports.PluginManager = PluginManager;
//# sourceMappingURL=PluginManager.js.map
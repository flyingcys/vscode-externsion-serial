"use strict";
/**
 * Serial-Studio VSCode Plugin System - Main Entry Point
 *
 * This module exports all the core components of the plugin system,
 * providing a unified interface for the plugin architecture.
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginSystem = exports.PluginEvent = exports.ExtensionPoint = exports.PluginSecurityManager = exports.PluginContextFactory = exports.PluginContextImpl = exports.PluginLoader = exports.PluginManager = exports.ContributionRegistry = void 0;
// Core types and interfaces
__exportStar(require("./types"), exports);
// Main plugin system components
var ContributionRegistry_1 = require("./ContributionRegistry");
Object.defineProperty(exports, "ContributionRegistry", { enumerable: true, get: function () { return ContributionRegistry_1.ContributionRegistry; } });
var PluginManager_1 = require("./PluginManager");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return PluginManager_1.PluginManager; } });
var PluginLoader_1 = require("./PluginLoader");
Object.defineProperty(exports, "PluginLoader", { enumerable: true, get: function () { return PluginLoader_1.PluginLoader; } });
var PluginContext_1 = require("./PluginContext");
Object.defineProperty(exports, "PluginContextImpl", { enumerable: true, get: function () { return PluginContext_1.PluginContextImpl; } });
Object.defineProperty(exports, "PluginContextFactory", { enumerable: true, get: function () { return PluginContext_1.PluginContextFactory; } });
Object.defineProperty(exports, "PluginSecurityManager", { enumerable: true, get: function () { return PluginContext_1.PluginSecurityManager; } });
// Re-export key types for convenience
var types_1 = require("./types");
Object.defineProperty(exports, "ExtensionPoint", { enumerable: true, get: function () { return types_1.ExtensionPoint; } });
Object.defineProperty(exports, "PluginEvent", { enumerable: true, get: function () { return types_1.PluginEvent; } });
/**
 * Plugin System Facade
 *
 * Provides a simplified interface for initializing and using the plugin system.
 */
class PluginSystem {
    static instance;
    pluginManager;
    contributionRegistry;
    initialized = false;
    constructor() {
        const { PluginManager } = require('./PluginManager');
        const { ContributionRegistry } = require('./ContributionRegistry');
        this.pluginManager = PluginManager.getInstance();
        this.contributionRegistry = ContributionRegistry.getInstance();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!PluginSystem.instance) {
            PluginSystem.instance = new PluginSystem();
        }
        return PluginSystem.instance;
    }
    /**
     * Initialize the plugin system
     */
    async initialize(extensionContext) {
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
    getPluginManager() {
        return this.pluginManager;
    }
    /**
     * Get contribution registry
     */
    getContributionRegistry() {
        return this.contributionRegistry;
    }
    /**
     * Load a plugin
     */
    async loadPlugin(manifestPath) {
        return await this.pluginManager.loadPlugin(manifestPath);
    }
    /**
     * Activate a plugin
     */
    async activatePlugin(pluginId) {
        const result = await this.pluginManager.activatePlugin(pluginId);
        return result.success;
    }
    /**
     * Get contributions for an extension point
     */
    getContributions(extensionPoint) {
        return this.contributionRegistry.getContributions(extensionPoint);
    }
    /**
     * Get system statistics
     */
    getStatistics() {
        return this.pluginManager.getStatistics();
    }
    /**
     * Check if system is initialized
     */
    isInitialized() {
        return this.initialized;
    }
}
exports.PluginSystem = PluginSystem;
/**
 * Default export for convenience
 */
exports.default = PluginSystem;
//# sourceMappingURL=index.js.map
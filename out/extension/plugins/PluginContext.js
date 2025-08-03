"use strict";
/**
 * Serial-Studio VSCode Plugin System - Plugin Context
 *
 * This module implements the plugin execution context that provides
 * runtime environment and API access for plugins.
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
exports.PluginSecurityManager = exports.PluginContextFactory = exports.PluginContextImpl = void 0;
const vscode = __importStar(require("vscode"));
const Manager_1 = require("../io/Manager");
const FrameParser_1 = require("../parsing/FrameParser");
/**
 * Plugin Context Implementation
 *
 * Provides the runtime environment for plugins, including logging,
 * storage, and API access to Serial-Studio functionality.
 */
class PluginContextImpl {
    extensionContext;
    manifest;
    logger;
    storage;
    api;
    subscriptions = [];
    constructor(manifest, extensionContext) {
        this.manifest = manifest;
        this.extensionContext = extensionContext;
        this.logger = new PluginLoggerImpl(manifest.id);
        this.storage = new PluginStorageImpl(manifest.id, extensionContext);
        this.api = new PluginAPIImpl(this.logger);
    }
}
exports.PluginContextImpl = PluginContextImpl;
/**
 * Plugin Logger Implementation
 */
class PluginLoggerImpl {
    pluginId;
    outputChannel;
    constructor(pluginId) {
        this.pluginId = pluginId;
        this.outputChannel = vscode.window.createOutputChannel(`Serial Studio Plugin: ${pluginId}`);
    }
    debug(message, ...args) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [DEBUG] ${message}`;
        console.debug(logMessage, ...args);
        this.outputChannel.appendLine(logMessage);
        if (args.length > 0) {
            this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
        }
    }
    info(message, ...args) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [INFO] ${message}`;
        console.info(logMessage, ...args);
        this.outputChannel.appendLine(logMessage);
        if (args.length > 0) {
            this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
        }
    }
    warn(message, ...args) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [WARN] ${message}`;
        console.warn(logMessage, ...args);
        this.outputChannel.appendLine(logMessage);
        if (args.length > 0) {
            this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
        }
    }
    error(message, ...args) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [ERROR] ${message}`;
        console.error(logMessage, ...args);
        this.outputChannel.appendLine(logMessage);
        if (args.length > 0) {
            this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
        }
        // Also show error in VSCode UI for critical errors
        if (message.toLowerCase().includes('critical') || message.toLowerCase().includes('fatal')) {
            vscode.window.showErrorMessage(`Plugin Error: ${message}`);
        }
    }
}
/**
 * Plugin Storage Implementation
 */
class PluginStorageImpl {
    pluginId;
    extensionContext;
    storagePrefix;
    constructor(pluginId, extensionContext) {
        this.pluginId = pluginId;
        this.extensionContext = extensionContext;
        this.storagePrefix = `plugin.${pluginId}.`;
    }
    get(key, defaultValue) {
        const fullKey = this.storagePrefix + key;
        const value = this.extensionContext.globalState.get(fullKey);
        if (value === undefined && defaultValue !== undefined) {
            return defaultValue;
        }
        return value;
    }
    async set(key, value) {
        const fullKey = this.storagePrefix + key;
        await this.extensionContext.globalState.update(fullKey, value);
    }
    async delete(key) {
        const fullKey = this.storagePrefix + key;
        await this.extensionContext.globalState.update(fullKey, undefined);
    }
    async clear() {
        const keys = this.extensionContext.globalState.keys();
        for (const key of keys) {
            if (key.startsWith(this.storagePrefix)) {
                await this.extensionContext.globalState.update(key, undefined);
            }
        }
    }
    /**
     * Get all keys for this plugin
     */
    getKeys() {
        const keys = this.extensionContext.globalState.keys();
        return keys
            .filter(key => key.startsWith(this.storagePrefix))
            .map(key => key.substring(this.storagePrefix.length));
    }
    /**
     * Get all data for this plugin
     */
    getAll() {
        const keys = this.getKeys();
        const data = {};
        for (const key of keys) {
            data[key] = this.get(key);
        }
        return data;
    }
}
/**
 * Plugin API Implementation
 */
class PluginAPIImpl {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    get io() {
        return {
            getManager: () => {
                // IOManager is not a singleton, return a new instance
                return new Manager_1.IOManager();
            },
            registerDriver: (driver) => {
                try {
                    // Register the driver with the IO manager
                    const manager = new Manager_1.IOManager();
                    // Note: This would need to be implemented in the actual IOManager
                    // manager.registerDriver(driver);
                    this.logger.info(`Registered driver: ${driver.constructor.name}`);
                }
                catch (error) {
                    this.logger.error(`Failed to register driver: ${error.message}`);
                    throw error;
                }
            }
        };
    }
    get parsing() {
        return {
            createParser: (script) => {
                try {
                    const parser = new FrameParser_1.FrameParser();
                    parser.loadScript(script);
                    this.logger.info('Created new frame parser');
                    return parser;
                }
                catch (error) {
                    this.logger.error(`Failed to create parser: ${error.message}`);
                    throw error;
                }
            },
            registerTransformer: (transformer) => {
                try {
                    // Register the transformer with the parsing system
                    // This would need to be implemented in the actual parsing system
                    this.logger.info(`Registered transformer: ${transformer.name}`);
                }
                catch (error) {
                    this.logger.error(`Failed to register transformer: ${error.message}`);
                    throw error;
                }
            }
        };
    }
    get ui() {
        return {
            registerWidget: (widget) => {
                try {
                    // Register the widget with the UI system
                    // This would need to be implemented in the actual UI system
                    this.logger.info(`Registered widget: ${widget.name}`);
                }
                catch (error) {
                    this.logger.error(`Failed to register widget: ${error.message}`);
                    throw error;
                }
            },
            showMessage: (message, type = 'info') => {
                switch (type) {
                    case 'info':
                        vscode.window.showInformationMessage(message);
                        break;
                    case 'warn':
                        vscode.window.showWarningMessage(message);
                        break;
                    case 'error':
                        vscode.window.showErrorMessage(message);
                        break;
                }
                this.logger.info(`Showed ${type} message: ${message}`);
            }
        };
    }
    get project() {
        return {
            getCurrentProject: () => {
                try {
                    // Get current project from project manager
                    // This would need to be implemented with the actual project manager
                    this.logger.info('Retrieved current project');
                    return null; // Placeholder
                }
                catch (error) {
                    this.logger.error(`Failed to get current project: ${error.message}`);
                    throw error;
                }
            },
            saveProject: async (project) => {
                try {
                    // Save project using project manager
                    // This would need to be implemented with the actual project manager
                    this.logger.info('Saved project');
                }
                catch (error) {
                    this.logger.error(`Failed to save project: ${error.message}`);
                    throw error;
                }
            }
        };
    }
}
/**
 * Plugin Context Factory
 *
 * Creates plugin contexts with proper isolation and resource management.
 */
class PluginContextFactory {
    static contexts = new Map();
    /**
     * Create a plugin context
     */
    static createContext(manifest, extensionContext) {
        const contextId = `${manifest.id}@${manifest.version}`;
        if (this.contexts.has(contextId)) {
            return this.contexts.get(contextId);
        }
        const context = new PluginContextImpl(manifest, extensionContext);
        this.contexts.set(contextId, context);
        return context;
    }
    /**
     * Destroy a plugin context
     */
    static destroyContext(manifest) {
        const contextId = `${manifest.id}@${manifest.version}`;
        const context = this.contexts.get(contextId);
        if (context) {
            // Clean up subscriptions
            context.subscriptions.forEach(disposable => {
                if (disposable && typeof disposable.dispose === 'function') {
                    disposable.dispose();
                }
            });
            this.contexts.delete(contextId);
        }
    }
    /**
     * Get all active contexts
     */
    static getActiveContexts() {
        return Array.from(this.contexts.values());
    }
    /**
     * Clear all contexts (for testing)
     */
    static clearAll() {
        for (const context of this.contexts.values()) {
            context.subscriptions.forEach(disposable => {
                if (disposable && typeof disposable.dispose === 'function') {
                    disposable.dispose();
                }
            });
        }
        this.contexts.clear();
    }
}
exports.PluginContextFactory = PluginContextFactory;
/**
 * Plugin Security Manager
 *
 * Provides security controls and sandboxing for plugin execution.
 */
class PluginSecurityManager {
    static allowedAPIs = new Set([
        'console.log',
        'console.info',
        'console.warn',
        'console.error',
        'JSON.parse',
        'JSON.stringify',
        'Math.*',
        'Date.*',
        'String.*',
        'Array.*',
        'Object.*'
    ]);
    static restrictedAPIs = new Set([
        'eval',
        'Function',
        'require',
        'process',
        'global',
        'window',
        'document',
        'XMLHttpRequest',
        'fetch',
        'import',
        'importScripts'
    ]);
    /**
     * Check if API is allowed for plugins
     */
    static isAPIAllowed(apiName) {
        // Check if explicitly restricted
        if (this.restrictedAPIs.has(apiName)) {
            return false;
        }
        // Check if explicitly allowed
        for (const allowedPattern of this.allowedAPIs) {
            if (allowedPattern.endsWith('*')) {
                const prefix = allowedPattern.slice(0, -1);
                if (apiName.startsWith(prefix)) {
                    return true;
                }
            }
            else if (apiName === allowedPattern) {
                return true;
            }
        }
        return false;
    }
    /**
     * Validate plugin code for security issues
     */
    static validatePluginCode(code) {
        const issues = [];
        // Check for restricted APIs
        for (const restrictedAPI of this.restrictedAPIs) {
            if (code.includes(restrictedAPI)) {
                issues.push(`Uses restricted API: ${restrictedAPI}`);
            }
        }
        // Check for potential security issues
        if (code.includes('__proto__')) {
            issues.push('Uses potentially unsafe __proto__ property');
        }
        if (code.includes('constructor.constructor')) {
            issues.push('Uses potentially unsafe constructor access');
        }
        if (code.match(/\\bthis\\s*\\.\\s*constructor\\s*\\.\\s*constructor/)) {
            issues.push('Attempts to access Function constructor');
        }
        return issues;
    }
    /**
     * Create sandboxed execution context for plugin code
     */
    static createSandbox() {
        const sandbox = {
            // Safe APIs
            console: {
                log: console.log.bind(console),
                info: console.info.bind(console),
                warn: console.warn.bind(console),
                error: console.error.bind(console)
            },
            JSON: JSON,
            Math: Math,
            Date: Date,
            // String, Array, Object constructors
            String: String,
            Array: Array,
            Object: Object,
            // Utility functions
            parseInt: parseInt,
            parseFloat: parseFloat,
            isNaN: isNaN,
            isFinite: isFinite,
            // Restricted globals
            eval: undefined,
            Function: undefined,
            require: undefined,
            process: undefined,
            global: undefined,
            window: undefined,
            document: undefined
        };
        return sandbox;
    }
}
exports.PluginSecurityManager = PluginSecurityManager;
//# sourceMappingURL=PluginContext.js.map
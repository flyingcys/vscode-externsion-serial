/**
 * Serial-Studio VSCode Plugin System - Plugin Context
 * 
 * This module implements the plugin execution context that provides
 * runtime environment and API access for plugins.
 * 
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { 
  PluginContext, 
  PluginManifest, 
  PluginLogger, 
  PluginStorage, 
  PluginAPI,
  TransformerContribution,
  WidgetContribution 
} from './types';
import { IOManager } from '../io/Manager';
import { HALDriver } from '../io/HALDriver';
import { FrameParser } from '../parsing/FrameParser';

/**
 * Plugin Context Implementation
 * 
 * Provides the runtime environment for plugins, including logging,
 * storage, and API access to Serial-Studio functionality.
 */
export class PluginContextImpl implements PluginContext {
  public readonly extensionContext: vscode.ExtensionContext;
  public readonly manifest: PluginManifest;
  public readonly logger: PluginLogger;
  public readonly storage: PluginStorage;
  public readonly api: PluginAPI;
  public readonly subscriptions: any[] = [];
  
  constructor(manifest: PluginManifest, extensionContext: vscode.ExtensionContext) {
    this.manifest = manifest;
    this.extensionContext = extensionContext;
    this.logger = new PluginLoggerImpl(manifest.id);
    this.storage = new PluginStorageImpl(manifest.id, extensionContext);
    this.api = new PluginAPIImpl(this.logger);
  }
}

/**
 * Plugin Logger Implementation
 */
class PluginLoggerImpl implements PluginLogger {
  private readonly pluginId: string;
  private outputChannel: vscode.OutputChannel;
  
  constructor(pluginId: string) {
    this.pluginId = pluginId;
    this.outputChannel = vscode.window.createOutputChannel(`Serial Studio Plugin: ${pluginId}`);
  }
  
  debug(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [DEBUG] ${message}`;
    
    console.debug(logMessage, ...args);
    this.outputChannel.appendLine(logMessage);
    
    if (args.length > 0) {
      this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
    }
  }
  
  info(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] ${message}`;
    
    console.info(logMessage, ...args);
    this.outputChannel.appendLine(logMessage);
    
    if (args.length > 0) {
      this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN] ${message}`;
    
    console.warn(logMessage, ...args);
    this.outputChannel.appendLine(logMessage);
    
    if (args.length > 0) {
      this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);
    }
  }
  
  error(message: string, ...args: any[]): void {
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
class PluginStorageImpl implements PluginStorage {
  private readonly pluginId: string;
  private readonly extensionContext: vscode.ExtensionContext;
  private readonly storagePrefix: string;
  
  constructor(pluginId: string, extensionContext: vscode.ExtensionContext) {
    this.pluginId = pluginId;
    this.extensionContext = extensionContext;
    this.storagePrefix = `plugin.${pluginId}.`;
  }
  
  get<T>(key: string, defaultValue?: T): T | undefined {
    const fullKey = this.storagePrefix + key;
    const value = this.extensionContext.globalState.get<T>(fullKey);
    
    if (value === undefined && defaultValue !== undefined) {
      return defaultValue;
    }
    
    return value;
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = this.storagePrefix + key;
    await this.extensionContext.globalState.update(fullKey, value);
  }
  
  async delete(key: string): Promise<void> {
    const fullKey = this.storagePrefix + key;
    await this.extensionContext.globalState.update(fullKey, undefined);
  }
  
  async clear(): Promise<void> {
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
  getKeys(): string[] {
    const keys = this.extensionContext.globalState.keys();
    return keys
      .filter(key => key.startsWith(this.storagePrefix))
      .map(key => key.substring(this.storagePrefix.length));
  }
  
  /**
   * Get all data for this plugin
   */
  getAll(): Record<string, any> {
    const keys = this.getKeys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      data[key] = this.get(key);
    }
    
    return data;
  }
}

/**
 * Plugin API Implementation
 */
class PluginAPIImpl implements PluginAPI {
  private readonly logger: PluginLogger;
  
  constructor(logger: PluginLogger) {
    this.logger = logger;
  }
  
  get io() {
    return {
      getManager: () => {
        // IOManager is not a singleton, return a new instance
        return new IOManager();
      },
      
      registerDriver: (driver: HALDriver) => {
        try {
          // Register the driver with the IO manager
          const manager = new IOManager();
          // Note: This would need to be implemented in the actual IOManager
          // manager.registerDriver(driver);
          
          this.logger.info(`Registered driver: ${driver.constructor.name}`);
        } catch (error) {
          this.logger.error(`Failed to register driver: ${(error as Error).message}`);
          throw error;
        }
      }
    };
  }
  
  get parsing() {
    return {
      createParser: (script: string) => {
        try {
          const parser = new FrameParser();
          parser.loadScript(script);
          
          this.logger.info('Created new frame parser');
          return parser;
        } catch (error) {
          this.logger.error(`Failed to create parser: ${(error as Error).message}`);
          throw error;
        }
      },
      
      registerTransformer: (transformer: TransformerContribution) => {
        try {
          // Register the transformer with the parsing system
          // This would need to be implemented in the actual parsing system
          
          this.logger.info(`Registered transformer: ${transformer.name}`);
        } catch (error) {
          this.logger.error(`Failed to register transformer: ${(error as Error).message}`);
          throw error;
        }
      }
    };
  }
  
  get ui() {
    return {
      registerWidget: (widget: WidgetContribution) => {
        try {
          // Register the widget with the UI system
          // This would need to be implemented in the actual UI system
          
          this.logger.info(`Registered widget: ${widget.name}`);
        } catch (error) {
          this.logger.error(`Failed to register widget: ${(error as Error).message}`);
          throw error;
        }
      },
      
      showMessage: (message: string, type: 'info' | 'warn' | 'error' = 'info') => {
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
        } catch (error) {
          this.logger.error(`Failed to get current project: ${(error as Error).message}`);
          throw error;
        }
      },
      
      saveProject: async (project: any) => {
        try {
          // Save project using project manager
          // This would need to be implemented with the actual project manager
          
          this.logger.info('Saved project');
        } catch (error) {
          this.logger.error(`Failed to save project: ${(error as Error).message}`);
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
export class PluginContextFactory {
  private static contexts = new Map<string, PluginContext>();
  
  /**
   * Create a plugin context
   */
  public static createContext(
    manifest: PluginManifest, 
    extensionContext: vscode.ExtensionContext
  ): PluginContext {
    const contextId = `${manifest.id}@${manifest.version}`;
    
    if (this.contexts.has(contextId)) {
      return this.contexts.get(contextId)!;
    }
    
    const context = new PluginContextImpl(manifest, extensionContext);
    this.contexts.set(contextId, context);
    
    return context;
  }
  
  /**
   * Destroy a plugin context
   */
  public static destroyContext(manifest: PluginManifest): void {
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
  public static getActiveContexts(): PluginContext[] {
    return Array.from(this.contexts.values());
  }
  
  /**
   * Clear all contexts (for testing)
   */
  public static clearAll(): void {
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

/**
 * Plugin Security Manager
 * 
 * Provides security controls and sandboxing for plugin execution.
 */
export class PluginSecurityManager {
  private static allowedAPIs = new Set([
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
  
  private static restrictedAPIs = new Set([
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
  public static isAPIAllowed(apiName: string): boolean {
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
      } else if (apiName === allowedPattern) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Validate plugin code for security issues
   */
  public static validatePluginCode(code: string): string[] {
    const issues: string[] = [];
    
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
  public static createSandbox(): any {
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
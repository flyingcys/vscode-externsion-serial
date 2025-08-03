/**
 * Serial-Studio VSCode Plugin System - Core Types
 * 
 * This module defines the core types and interfaces for the plugin system,
 * implementing the 15 extension points defined in the architecture specification.
 * 
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */

import { HALDriver } from '../io/HALDriver';
import { DataDecoder } from '../parsing/DataDecoder';
import { FrameParser } from '../parsing/FrameParser';

/**
 * 15 Core Extension Points
 * 
 * These extension points define where plugins can contribute functionality,
 * following Serial-Studio's modular architecture principles.
 */
export enum ExtensionPoint {
  COMMUNICATION_DRIVERS = 'communication.drivers',
  DATA_PARSERS = 'data.parsers',
  DATA_VALIDATORS = 'data.validators',
  DATA_TRANSFORMERS = 'data.transformers',
  VISUALIZATION_WIDGETS = 'visualization.widgets',
  CHART_RENDERERS = 'visualization.renderers',
  EXPORT_FORMATS = 'export.formats',
  EXPORT_PROCESSORS = 'export.processors',
  MENU_CONTRIBUTIONS = 'ui.menus',
  TOOLBAR_CONTRIBUTIONS = 'ui.toolbars',
  SETTINGS_PAGES = 'ui.settings',
  THEMES = 'ui.themes',
  ICON_THEMES = 'ui.iconThemes',
  DEBUG_TOOLS = 'tools.debug',
  ANALYSIS_TOOLS = 'tools.analysis'
}

/**
 * Plugin Manifest
 * 
 * Defines the structure of a plugin's manifest file, similar to package.json
 * but specifically tailored for Serial-Studio plugins.
 */
export interface PluginManifest {
  /** Unique plugin identifier */
  id: string;
  
  /** Human-readable plugin name */
  name: string;
  
  /** Semantic version */
  version: string;
  
  /** Plugin description */
  description: string;
  
  /** Plugin author */
  author: string;
  
  /** License type */
  license: string;
  
  /** Engine compatibility */
  engines: {
    vscode: string;
    serialStudio: string;
  };
  
  /** Plugin contributions to extension points */
  contributes: PluginContributions;
  
  /** Events that trigger plugin activation */
  activationEvents: string[];
  
  /** Main entry point file */
  main?: string;
  
  /** Plugin dependencies */
  dependencies?: Record<string, string>;
  
  /** Keywords for plugin discovery */
  keywords?: string[];
  
  /** Plugin category */
  category?: PluginCategory;
  
  /** Plugin homepage URL */
  homepage?: string;
  
  /** Repository information */
  repository?: {
    type: string;
    url: string;
  };
}

/**
 * Plugin Categories
 */
export type PluginCategory = 
  | 'communication'
  | 'visualization' 
  | 'data-processing'
  | 'export'
  | 'themes'
  | 'tools'
  | 'other';

/**
 * Plugin Contributions
 * 
 * Defines what a plugin can contribute to each extension point.
 */
export interface PluginContributions {
  drivers?: DriverContribution[];
  parsers?: ParserContribution[];
  validators?: ValidatorContribution[];
  transformers?: TransformerContribution[];
  widgets?: WidgetContribution[];
  renderers?: RendererContribution[];
  exportFormats?: ExportFormatContribution[];
  exportProcessors?: ExportProcessorContribution[];
  menus?: MenuContribution[];
  toolbars?: ToolbarContribution[];
  settings?: SettingsContribution[];
  themes?: ThemeContribution[];
  iconThemes?: IconThemeContribution[];
  debugTools?: DebugToolContribution[];
  analysisTools?: AnalysisToolContribution[];
}

/**
 * Communication Driver Contribution
 * 
 * Allows plugins to add new communication protocols
 */
export interface DriverContribution {
  /** Unique driver identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Supported protocol */
  protocol: string;
  
  /** Driver class constructor */
  driverClass: new () => HALDriver;
  
  /** Configuration schema */
  configSchema: JSONSchema;
  
  /** Driver icon */
  icon?: string;
  
  /** Supported platforms */
  platforms?: ('win32' | 'darwin' | 'linux')[];
}

/**
 * Data Parser Contribution
 * 
 * Allows plugins to add custom data parsing logic
 */
export interface ParserContribution {
  /** Unique parser identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Parser description */
  description: string;
  
  /** Parser class constructor */
  parserClass: new () => FrameParser;
  
  /** JavaScript template */
  template?: string;
  
  /** Usage examples */
  examples?: string[];
  
  /** Supported data formats */
  supportedFormats?: string[];
}

/**
 * Data Validator Contribution
 * 
 * Allows plugins to add data validation logic
 */
export interface ValidatorContribution {
  /** Unique validator identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Validation function */
  validate: (data: any) => ValidationResult;
  
  /** Validation schema */
  schema?: JSONSchema;
}

/**
 * Data Transformer Contribution
 * 
 * Allows plugins to add data transformation logic
 */
export interface TransformerContribution {
  /** Unique transformer identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Transform function */
  transform: (data: any) => any;
  
  /** Input data type */
  inputType: string;
  
  /** Output data type */
  outputType: string;
}

/**
 * Visualization Widget Contribution
 * 
 * Allows plugins to add custom visualization components
 */
export interface WidgetContribution {
  /** Unique widget identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Widget type */
  type: 'dataset' | 'group';
  
  /** Vue component constructor */
  component: any;
  
  /** Configuration schema */
  configSchema: JSONSchema;
  
  /** Widget preview image */
  preview?: string;
  
  /** Supported data types */
  supportedDataTypes?: string[];
  
  /** Widget category */
  category?: string;
}

/**
 * Chart Renderer Contribution
 * 
 * Allows plugins to add custom chart rendering engines
 */
export interface RendererContribution {
  /** Unique renderer identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Renderer class */
  renderer: ChartRenderer;
  
  /** Supported chart types */
  supportedTypes: string[];
}

/**
 * Export Format Contribution
 * 
 * Allows plugins to add new export formats
 */
export interface ExportFormatContribution {
  /** Unique format identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** File extension */
  extension: string;
  
  /** MIME type */
  mimeType: string;
  
  /** Export function */
  export: (data: any, options?: any) => Promise<Buffer>;
  
  /** Format description */
  description?: string;
}

/**
 * Export Processor Contribution
 * 
 * Allows plugins to add export processing logic
 */
export interface ExportProcessorContribution {
  /** Unique processor identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Process function */
  process: (data: any, format: string) => Promise<any>;
  
  /** Supported formats */
  supportedFormats: string[];
}

/**
 * Menu Contribution
 * 
 * Allows plugins to add menu items
 */
export interface MenuContribution {
  /** Menu identifier */
  id: string;
  
  /** Menu label */
  label: string;
  
  /** Command to execute */
  command: string;
  
  /** Menu group */
  group?: string;
  
  /** When clause for visibility */
  when?: string;
  
  /** Keyboard shortcut */
  shortcut?: string;
}

/**
 * Toolbar Contribution
 * 
 * Allows plugins to add toolbar buttons
 */
export interface ToolbarContribution {
  /** Button identifier */
  id: string;
  
  /** Button label */
  label: string;
  
  /** Button icon */
  icon: string;
  
  /** Command to execute */
  command: string;
  
  /** Button group */
  group?: string;
  
  /** When clause for visibility */
  when?: string;
}

/**
 * Settings Contribution
 * 
 * Allows plugins to add configuration settings
 */
export interface SettingsContribution {
  /** Setting identifier */
  id: string;
  
  /** Setting title */
  title: string;
  
  /** Settings schema */
  properties: Record<string, SettingProperty>;
}

/**
 * Theme Contribution
 * 
 * Allows plugins to add custom themes
 */
export interface ThemeContribution {
  /** Theme identifier */
  id: string;
  
  /** Theme name */
  name: string;
  
  /** Theme type */
  type: 'light' | 'dark' | 'high-contrast';
  
  /** Theme CSS file path */
  path: string;
  
  /** Theme description */
  description?: string;
}

/**
 * Icon Theme Contribution
 * 
 * Allows plugins to add custom icon themes
 */
export interface IconThemeContribution {
  /** Icon theme identifier */
  id: string;
  
  /** Icon theme name */
  name: string;
  
  /** Icon definitions */
  iconDefinitions: Record<string, IconDefinition>;
  
  /** File associations */
  fileExtensions?: Record<string, string>;
}

/**
 * Debug Tool Contribution
 * 
 * Allows plugins to add debugging tools
 */
export interface DebugToolContribution {
  /** Tool identifier */
  id: string;
  
  /** Tool name */
  name: string;
  
  /** Tool component */
  component: any;
  
  /** Tool activation conditions */
  when?: string;
}

/**
 * Analysis Tool Contribution
 * 
 * Allows plugins to add data analysis tools
 */
export interface AnalysisToolContribution {
  /** Tool identifier */
  id: string;
  
  /** Tool name */
  name: string;
  
  /** Analysis function */
  analyze: (data: any) => Promise<AnalysisResult>;
  
  /** Supported data types */
  supportedDataTypes: string[];
}

/**
 * Plugin Context
 * 
 * Provides runtime environment for plugins
 */
export interface PluginContext {
  /** Extension context from VSCode */
  extensionContext: any;
  
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /** Logger instance */
  logger: PluginLogger;
  
  /** Storage utilities */
  storage: PluginStorage;
  
  /** API access */
  api: PluginAPI;
  
  /** Disposable subscriptions */
  subscriptions: any[];
}

/**
 * Plugin Logger
 */
export interface PluginLogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Plugin Storage
 */
export interface PluginStorage {
  get<T>(key: string, defaultValue?: T): T | undefined;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Plugin API
 * 
 * Provides access to Serial-Studio core functionality
 */
export interface PluginAPI {
  /** IO Manager access */
  io: {
    getManager(): any;
    registerDriver(driver: HALDriver): void;
  };
  
  /** Data parsing access */
  parsing: {
    createParser(script: string): FrameParser;
    registerTransformer(transformer: TransformerContribution): void;
  };
  
  /** UI access */
  ui: {
    registerWidget(widget: WidgetContribution): void;
    showMessage(message: string, type?: 'info' | 'warn' | 'error'): void;
  };
  
  /** Project access */
  project: {
    getCurrentProject(): any;
    saveProject(project: any): Promise<void>;
  };
}

/**
 * Plugin Instance
 * 
 * Represents a loaded and activated plugin
 */
export interface PluginInstance {
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /** Plugin exports */
  exports: any;
  
  /** Plugin context */
  context: PluginContext;
  
  /** Activation function */
  activate?(context: PluginContext): void | Promise<void>;
  
  /** Deactivation function */
  deactivate?(): void | Promise<void>;
}

/**
 * Plugin Activation Result
 */
export interface PluginActivationResult {
  /** Whether activation was successful */
  success: boolean;
  
  /** Error message if activation failed */
  error?: string;
  
  /** Plugin exports */
  exports?: any;
}

/**
 * Supporting Types
 */

export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface ChartRenderer {
  render(data: any, options: any): void;
  update(data: any): void;
  destroy(): void;
}

export interface SettingProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: any;
  description?: string;
  enum?: any[];
}

export interface IconDefinition {
  iconPath: string;
  fontCharacter?: string;
  fontColor?: string;
}

export interface AnalysisResult {
  summary: string;
  data: any;
  charts?: any[];
}

/**
 * Plugin Events
 */
export enum PluginEvent {
  LOADED = 'plugin:loaded',
  ACTIVATED = 'plugin:activated',
  DEACTIVATED = 'plugin:deactivated',
  UNLOADED = 'plugin:unloaded',
  ERROR = 'plugin:error'
}

export interface PluginEventData {
  pluginId: string;
  event: PluginEvent;
  data?: any;
  error?: Error;
}
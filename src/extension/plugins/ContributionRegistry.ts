/**
 * Serial-Studio VSCode Plugin System - Contribution Registry
 * 
 * This module implements the contribution registry system that manages
 * plugin contributions to various extension points.
 * 
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */

import {
  ExtensionPoint,
  DriverContribution,
  ParserContribution,
  ValidatorContribution,
  TransformerContribution,
  WidgetContribution,
  RendererContribution,
  ExportFormatContribution,
  ExportProcessorContribution,
  MenuContribution,
  ToolbarContribution,
  SettingsContribution,
  ThemeContribution,
  IconThemeContribution,
  DebugToolContribution,
  AnalysisToolContribution,
  PluginEvent,
  PluginEventData
} from './types';

/**
 * Contribution Registry
 * 
 * Central registry for managing plugin contributions to extension points.
 * Provides type-safe registration and querying of contributions.
 */
export class ContributionRegistry {
  private static instance: ContributionRegistry;
  
  // Extension point contribution maps
  private drivers = new Map<string, DriverContribution>();
  private parsers = new Map<string, ParserContribution>();
  private validators = new Map<string, ValidatorContribution>();
  private transformers = new Map<string, TransformerContribution>();
  private widgets = new Map<string, WidgetContribution>();
  private renderers = new Map<string, RendererContribution>();
  private exportFormats = new Map<string, ExportFormatContribution>();
  private exportProcessors = new Map<string, ExportProcessorContribution>();
  private menus = new Map<string, MenuContribution>();
  private toolbars = new Map<string, ToolbarContribution>();
  private settings = new Map<string, SettingsContribution>();
  private themes = new Map<string, ThemeContribution>();
  private iconThemes = new Map<string, IconThemeContribution>();
  private debugTools = new Map<string, DebugToolContribution>();
  private analysisTools = new Map<string, AnalysisToolContribution>();
  
  // Plugin ownership tracking
  private contributionOwnership = new Map<string, string>(); // contributionId -> pluginId
  private pluginContributions = new Map<string, Set<string>>(); // pluginId -> contributionIds
  
  // Event listeners
  private eventListeners = new Map<PluginEvent, ((data: PluginEventData) => void)[]>();
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ContributionRegistry {
    if (!ContributionRegistry.instance) {
      ContributionRegistry.instance = new ContributionRegistry();
    }
    return ContributionRegistry.instance;
  }
  
  /**
   * Register a contribution to an extension point
   */
  public register(
    extensionPoint: ExtensionPoint,
    contribution: any,
    pluginId: string
  ): void {
    // Validate contribution has required id field
    if (!contribution || !contribution.id || typeof contribution.id !== 'string') {
      throw new Error('Contribution must have a valid id field');
    }
    
    const contributionId = contribution.id;
    
    // Check for duplicate contributions
    if (this.contributionOwnership.has(contributionId)) {
      const existingOwner = this.contributionOwnership.get(contributionId);
      if (existingOwner !== pluginId) {
        throw new Error(
          `Contribution '${contributionId}' is already registered by plugin '${existingOwner}'`
        );
      }
      return; // Already registered by same plugin
    }
    
    // Register contribution based on extension point
    switch (extensionPoint) {
      case ExtensionPoint.COMMUNICATION_DRIVERS:
        this.drivers.set(contributionId, contribution as DriverContribution);
        break;
      case ExtensionPoint.DATA_PARSERS:
        this.parsers.set(contributionId, contribution as ParserContribution);
        break;
      case ExtensionPoint.DATA_VALIDATORS:
        this.validators.set(contributionId, contribution as ValidatorContribution);
        break;
      case ExtensionPoint.DATA_TRANSFORMERS:
        this.transformers.set(contributionId, contribution as TransformerContribution);
        break;
      case ExtensionPoint.VISUALIZATION_WIDGETS:
        this.widgets.set(contributionId, contribution as WidgetContribution);
        break;
      case ExtensionPoint.CHART_RENDERERS:
        this.renderers.set(contributionId, contribution as RendererContribution);
        break;
      case ExtensionPoint.EXPORT_FORMATS:
        this.exportFormats.set(contributionId, contribution as ExportFormatContribution);
        break;
      case ExtensionPoint.EXPORT_PROCESSORS:
        this.exportProcessors.set(contributionId, contribution as ExportProcessorContribution);
        break;
      case ExtensionPoint.MENU_CONTRIBUTIONS:
        this.menus.set(contributionId, contribution as MenuContribution);
        break;
      case ExtensionPoint.TOOLBAR_CONTRIBUTIONS:
        this.toolbars.set(contributionId, contribution as ToolbarContribution);
        break;
      case ExtensionPoint.SETTINGS_PAGES:
        this.settings.set(contributionId, contribution as SettingsContribution);
        break;
      case ExtensionPoint.THEMES:
        this.themes.set(contributionId, contribution as ThemeContribution);
        break;
      case ExtensionPoint.ICON_THEMES:
        this.iconThemes.set(contributionId, contribution as IconThemeContribution);
        break;
      case ExtensionPoint.DEBUG_TOOLS:
        this.debugTools.set(contributionId, contribution as DebugToolContribution);
        break;
      case ExtensionPoint.ANALYSIS_TOOLS:
        this.analysisTools.set(contributionId, contribution as AnalysisToolContribution);
        break;
      default:
        throw new Error(`Unknown extension point: ${extensionPoint}`);
    }
    
    // Track ownership
    this.contributionOwnership.set(contributionId, pluginId);
    
    if (!this.pluginContributions.has(pluginId)) {
      this.pluginContributions.set(pluginId, new Set());
    }
    this.pluginContributions.get(pluginId)!.add(contributionId);
    
    console.log(`Registered contribution '${contributionId}' to '${extensionPoint}' by plugin '${pluginId}'`);
  }
  
  /**
   * Unregister a contribution
   */
  public unregister(contributionId: string, pluginId: string): void {
    const owner = this.contributionOwnership.get(contributionId);
    if (owner !== pluginId) {
      throw new Error(
        `Cannot unregister contribution '${contributionId}': owned by different plugin`
      );
    }
    
    // Remove from all possible extension points
    this.drivers.delete(contributionId);
    this.parsers.delete(contributionId);
    this.validators.delete(contributionId);
    this.transformers.delete(contributionId);
    this.widgets.delete(contributionId);
    this.renderers.delete(contributionId);
    this.exportFormats.delete(contributionId);
    this.exportProcessors.delete(contributionId);
    this.menus.delete(contributionId);
    this.toolbars.delete(contributionId);
    this.settings.delete(contributionId);
    this.themes.delete(contributionId);
    this.iconThemes.delete(contributionId);
    this.debugTools.delete(contributionId);
    this.analysisTools.delete(contributionId);
    
    // Remove ownership tracking
    this.contributionOwnership.delete(contributionId);
    this.pluginContributions.get(pluginId)?.delete(contributionId);
    
    console.log(`Unregistered contribution '${contributionId}' from plugin '${pluginId}'`);
  }
  
  /**
   * Unregister all contributions from a plugin
   */
  public unregisterPlugin(pluginId: string): void {
    const contributions = this.pluginContributions.get(pluginId);
    if (contributions) {
      for (const contributionId of contributions) {
        this.unregister(contributionId, pluginId);
      }
      this.pluginContributions.delete(pluginId);
    }
  }
  
  /**
   * Get contributions for a specific extension point
   */
  public getContributions<T>(extensionPoint: ExtensionPoint): T[] {
    switch (extensionPoint) {
      case ExtensionPoint.COMMUNICATION_DRIVERS:
        return Array.from(this.drivers.values()) as T[];
      case ExtensionPoint.DATA_PARSERS:
        return Array.from(this.parsers.values()) as T[];
      case ExtensionPoint.DATA_VALIDATORS:
        return Array.from(this.validators.values()) as T[];
      case ExtensionPoint.DATA_TRANSFORMERS:
        return Array.from(this.transformers.values()) as T[];
      case ExtensionPoint.VISUALIZATION_WIDGETS:
        return Array.from(this.widgets.values()) as T[];
      case ExtensionPoint.CHART_RENDERERS:
        return Array.from(this.renderers.values()) as T[];
      case ExtensionPoint.EXPORT_FORMATS:
        return Array.from(this.exportFormats.values()) as T[];
      case ExtensionPoint.EXPORT_PROCESSORS:
        return Array.from(this.exportProcessors.values()) as T[];
      case ExtensionPoint.MENU_CONTRIBUTIONS:
        return Array.from(this.menus.values()) as T[];
      case ExtensionPoint.TOOLBAR_CONTRIBUTIONS:
        return Array.from(this.toolbars.values()) as T[];
      case ExtensionPoint.SETTINGS_PAGES:
        return Array.from(this.settings.values()) as T[];
      case ExtensionPoint.THEMES:
        return Array.from(this.themes.values()) as T[];
      case ExtensionPoint.ICON_THEMES:
        return Array.from(this.iconThemes.values()) as T[];
      case ExtensionPoint.DEBUG_TOOLS:
        return Array.from(this.debugTools.values()) as T[];
      case ExtensionPoint.ANALYSIS_TOOLS:
        return Array.from(this.analysisTools.values()) as T[];
      default:
        return [];
    }
  }
  
  /**
   * Get a specific contribution by ID
   */
  public getContribution<T>(contributionId: string): T | undefined {
    // Search in all extension points
    const maps = [
      this.drivers, this.parsers, this.validators, this.transformers,
      this.widgets, this.renderers, this.exportFormats, this.exportProcessors,
      this.menus, this.toolbars, this.settings, this.themes,
      this.iconThemes, this.debugTools, this.analysisTools
    ];
    
    for (const map of maps) {
      if (map.has(contributionId)) {
        return map.get(contributionId) as T;
      }
    }
    
    return undefined;
  }
  
  /**
   * Get contributions by plugin ID
   */
  public getPluginContributions(pluginId: string): any[] {
    const contributionIds = this.pluginContributions.get(pluginId);
    if (!contributionIds) {
      return [];
    }
    
    const contributions: any[] = [];
    for (const contributionId of contributionIds) {
      const contribution = this.getContribution(contributionId);
      if (contribution) {
        contributions.push(contribution);
      }
    }
    
    return contributions;
  }
  
  /**
   * Get owner of a contribution
   */
  public getContributionOwner(contributionId: string): string | undefined {
    return this.contributionOwnership.get(contributionId);
  }
  
  /**
   * Check if a contribution exists
   */
  public hasContribution(contributionId: string): boolean {
    return this.contributionOwnership.has(contributionId);
  }
  
  /**
   * Get all extension points
   */
  public getExtensionPoints(): ExtensionPoint[] {
    return Object.values(ExtensionPoint);
  }
  
  /**
   * Get statistics about registered contributions
   */
  public getStatistics(): ContributionStatistics {
    return {
      totalContributions: this.contributionOwnership.size,
      totalPlugins: this.pluginContributions.size,
      contributionsByExtensionPoint: {
        [ExtensionPoint.COMMUNICATION_DRIVERS]: this.drivers.size,
        [ExtensionPoint.DATA_PARSERS]: this.parsers.size,
        [ExtensionPoint.DATA_VALIDATORS]: this.validators.size,
        [ExtensionPoint.DATA_TRANSFORMERS]: this.transformers.size,
        [ExtensionPoint.VISUALIZATION_WIDGETS]: this.widgets.size,
        [ExtensionPoint.CHART_RENDERERS]: this.renderers.size,
        [ExtensionPoint.EXPORT_FORMATS]: this.exportFormats.size,
        [ExtensionPoint.EXPORT_PROCESSORS]: this.exportProcessors.size,
        [ExtensionPoint.MENU_CONTRIBUTIONS]: this.menus.size,
        [ExtensionPoint.TOOLBAR_CONTRIBUTIONS]: this.toolbars.size,
        [ExtensionPoint.SETTINGS_PAGES]: this.settings.size,
        [ExtensionPoint.THEMES]: this.themes.size,
        [ExtensionPoint.ICON_THEMES]: this.iconThemes.size,
        [ExtensionPoint.DEBUG_TOOLS]: this.debugTools.size,
        [ExtensionPoint.ANALYSIS_TOOLS]: this.analysisTools.size
      }
    };
  }
  
  /**
   * Add event listener
   */
  public addEventListener(event: PluginEvent, listener: (data: PluginEventData) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * Remove event listener
   */
  public removeEventListener(event: PluginEvent, listener: (data: PluginEventData) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit event
   */
  public emitEvent(event: PluginEvent, data: PluginEventData): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in plugin event listener for ${event}:`, error);
        }
      }
    }
  }
  
  /**
   * Clear all contributions (for testing)
   */
  public clear(): void {
    this.drivers.clear();
    this.parsers.clear();
    this.validators.clear();
    this.transformers.clear();
    this.widgets.clear();
    this.renderers.clear();
    this.exportFormats.clear();
    this.exportProcessors.clear();
    this.menus.clear();
    this.toolbars.clear();
    this.settings.clear();
    this.themes.clear();
    this.iconThemes.clear();
    this.debugTools.clear();
    this.analysisTools.clear();
    
    this.contributionOwnership.clear();
    this.pluginContributions.clear();
    this.eventListeners.clear();
  }
}

/**
 * Contribution Statistics
 */
export interface ContributionStatistics {
  totalContributions: number;
  totalPlugins: number;
  contributionsByExtensionPoint: Record<ExtensionPoint, number>;
}
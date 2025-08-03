/**
 * Serial-Studio VSCode Plugin System - Contribution Registry
 *
 * This module implements the contribution registry system that manages
 * plugin contributions to various extension points.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
import { ExtensionPoint, PluginEvent, PluginEventData } from './types';
/**
 * Contribution Registry
 *
 * Central registry for managing plugin contributions to extension points.
 * Provides type-safe registration and querying of contributions.
 */
export declare class ContributionRegistry {
    private static instance;
    private drivers;
    private parsers;
    private validators;
    private transformers;
    private widgets;
    private renderers;
    private exportFormats;
    private exportProcessors;
    private menus;
    private toolbars;
    private settings;
    private themes;
    private iconThemes;
    private debugTools;
    private analysisTools;
    private contributionOwnership;
    private pluginContributions;
    private eventListeners;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): ContributionRegistry;
    /**
     * Register a contribution to an extension point
     */
    register(extensionPoint: ExtensionPoint, contribution: any, pluginId: string): void;
    /**
     * Unregister a contribution
     */
    unregister(contributionId: string, pluginId: string): void;
    /**
     * Unregister all contributions from a plugin
     */
    unregisterPlugin(pluginId: string): void;
    /**
     * Get contributions for a specific extension point
     */
    getContributions<T>(extensionPoint: ExtensionPoint): T[];
    /**
     * Get a specific contribution by ID
     */
    getContribution<T>(contributionId: string): T | undefined;
    /**
     * Get contributions by plugin ID
     */
    getPluginContributions(pluginId: string): any[];
    /**
     * Get owner of a contribution
     */
    getContributionOwner(contributionId: string): string | undefined;
    /**
     * Check if a contribution exists
     */
    hasContribution(contributionId: string): boolean;
    /**
     * Get all extension points
     */
    getExtensionPoints(): ExtensionPoint[];
    /**
     * Get statistics about registered contributions
     */
    getStatistics(): ContributionStatistics;
    /**
     * Add event listener
     */
    addEventListener(event: PluginEvent, listener: (data: PluginEventData) => void): void;
    /**
     * Remove event listener
     */
    removeEventListener(event: PluginEvent, listener: (data: PluginEventData) => void): void;
    /**
     * Emit event
     */
    emitEvent(event: PluginEvent, data: PluginEventData): void;
    /**
     * Clear all contributions (for testing)
     */
    clear(): void;
}
/**
 * Contribution Statistics
 */
export interface ContributionStatistics {
    totalContributions: number;
    totalPlugins: number;
    contributionsByExtensionPoint: Record<ExtensionPoint, number>;
}
//# sourceMappingURL=ContributionRegistry.d.ts.map
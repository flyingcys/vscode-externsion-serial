"use strict";
/**
 * Serial-Studio VSCode Plugin System - Contribution Registry
 *
 * This module implements the contribution registry system that manages
 * plugin contributions to various extension points.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributionRegistry = void 0;
const types_1 = require("./types");
/**
 * Contribution Registry
 *
 * Central registry for managing plugin contributions to extension points.
 * Provides type-safe registration and querying of contributions.
 */
class ContributionRegistry {
    static instance;
    // Extension point contribution maps
    drivers = new Map();
    parsers = new Map();
    validators = new Map();
    transformers = new Map();
    widgets = new Map();
    renderers = new Map();
    exportFormats = new Map();
    exportProcessors = new Map();
    menus = new Map();
    toolbars = new Map();
    settings = new Map();
    themes = new Map();
    iconThemes = new Map();
    debugTools = new Map();
    analysisTools = new Map();
    // Plugin ownership tracking
    contributionOwnership = new Map(); // contributionId -> pluginId
    pluginContributions = new Map(); // pluginId -> contributionIds
    // Event listeners
    eventListeners = new Map();
    constructor() { }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!ContributionRegistry.instance) {
            ContributionRegistry.instance = new ContributionRegistry();
        }
        return ContributionRegistry.instance;
    }
    /**
     * Register a contribution to an extension point
     */
    register(extensionPoint, contribution, pluginId) {
        // Validate contribution has required id field
        if (!contribution || !contribution.id || typeof contribution.id !== 'string') {
            throw new Error('Contribution must have a valid id field');
        }
        const contributionId = contribution.id;
        // Check for duplicate contributions
        if (this.contributionOwnership.has(contributionId)) {
            const existingOwner = this.contributionOwnership.get(contributionId);
            if (existingOwner !== pluginId) {
                throw new Error(`Contribution '${contributionId}' is already registered by plugin '${existingOwner}'`);
            }
            return; // Already registered by same plugin
        }
        // Register contribution based on extension point
        switch (extensionPoint) {
            case types_1.ExtensionPoint.COMMUNICATION_DRIVERS:
                this.drivers.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.DATA_PARSERS:
                this.parsers.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.DATA_VALIDATORS:
                this.validators.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.DATA_TRANSFORMERS:
                this.transformers.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.VISUALIZATION_WIDGETS:
                this.widgets.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.CHART_RENDERERS:
                this.renderers.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.EXPORT_FORMATS:
                this.exportFormats.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.EXPORT_PROCESSORS:
                this.exportProcessors.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.MENU_CONTRIBUTIONS:
                this.menus.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.TOOLBAR_CONTRIBUTIONS:
                this.toolbars.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.SETTINGS_PAGES:
                this.settings.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.THEMES:
                this.themes.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.ICON_THEMES:
                this.iconThemes.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.DEBUG_TOOLS:
                this.debugTools.set(contributionId, contribution);
                break;
            case types_1.ExtensionPoint.ANALYSIS_TOOLS:
                this.analysisTools.set(contributionId, contribution);
                break;
            default:
                throw new Error(`Unknown extension point: ${extensionPoint}`);
        }
        // Track ownership
        this.contributionOwnership.set(contributionId, pluginId);
        if (!this.pluginContributions.has(pluginId)) {
            this.pluginContributions.set(pluginId, new Set());
        }
        this.pluginContributions.get(pluginId).add(contributionId);
        console.log(`Registered contribution '${contributionId}' to '${extensionPoint}' by plugin '${pluginId}'`);
    }
    /**
     * Unregister a contribution
     */
    unregister(contributionId, pluginId) {
        const owner = this.contributionOwnership.get(contributionId);
        if (owner !== pluginId) {
            throw new Error(`Cannot unregister contribution '${contributionId}': owned by different plugin`);
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
    unregisterPlugin(pluginId) {
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
    getContributions(extensionPoint) {
        switch (extensionPoint) {
            case types_1.ExtensionPoint.COMMUNICATION_DRIVERS:
                return Array.from(this.drivers.values());
            case types_1.ExtensionPoint.DATA_PARSERS:
                return Array.from(this.parsers.values());
            case types_1.ExtensionPoint.DATA_VALIDATORS:
                return Array.from(this.validators.values());
            case types_1.ExtensionPoint.DATA_TRANSFORMERS:
                return Array.from(this.transformers.values());
            case types_1.ExtensionPoint.VISUALIZATION_WIDGETS:
                return Array.from(this.widgets.values());
            case types_1.ExtensionPoint.CHART_RENDERERS:
                return Array.from(this.renderers.values());
            case types_1.ExtensionPoint.EXPORT_FORMATS:
                return Array.from(this.exportFormats.values());
            case types_1.ExtensionPoint.EXPORT_PROCESSORS:
                return Array.from(this.exportProcessors.values());
            case types_1.ExtensionPoint.MENU_CONTRIBUTIONS:
                return Array.from(this.menus.values());
            case types_1.ExtensionPoint.TOOLBAR_CONTRIBUTIONS:
                return Array.from(this.toolbars.values());
            case types_1.ExtensionPoint.SETTINGS_PAGES:
                return Array.from(this.settings.values());
            case types_1.ExtensionPoint.THEMES:
                return Array.from(this.themes.values());
            case types_1.ExtensionPoint.ICON_THEMES:
                return Array.from(this.iconThemes.values());
            case types_1.ExtensionPoint.DEBUG_TOOLS:
                return Array.from(this.debugTools.values());
            case types_1.ExtensionPoint.ANALYSIS_TOOLS:
                return Array.from(this.analysisTools.values());
            default:
                return [];
        }
    }
    /**
     * Get a specific contribution by ID
     */
    getContribution(contributionId) {
        // Search in all extension points
        const maps = [
            this.drivers, this.parsers, this.validators, this.transformers,
            this.widgets, this.renderers, this.exportFormats, this.exportProcessors,
            this.menus, this.toolbars, this.settings, this.themes,
            this.iconThemes, this.debugTools, this.analysisTools
        ];
        for (const map of maps) {
            if (map.has(contributionId)) {
                return map.get(contributionId);
            }
        }
        return undefined;
    }
    /**
     * Get contributions by plugin ID
     */
    getPluginContributions(pluginId) {
        const contributionIds = this.pluginContributions.get(pluginId);
        if (!contributionIds) {
            return [];
        }
        const contributions = [];
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
    getContributionOwner(contributionId) {
        return this.contributionOwnership.get(contributionId);
    }
    /**
     * Check if a contribution exists
     */
    hasContribution(contributionId) {
        return this.contributionOwnership.has(contributionId);
    }
    /**
     * Get all extension points
     */
    getExtensionPoints() {
        return Object.values(types_1.ExtensionPoint);
    }
    /**
     * Get statistics about registered contributions
     */
    getStatistics() {
        return {
            totalContributions: this.contributionOwnership.size,
            totalPlugins: this.pluginContributions.size,
            contributionsByExtensionPoint: {
                [types_1.ExtensionPoint.COMMUNICATION_DRIVERS]: this.drivers.size,
                [types_1.ExtensionPoint.DATA_PARSERS]: this.parsers.size,
                [types_1.ExtensionPoint.DATA_VALIDATORS]: this.validators.size,
                [types_1.ExtensionPoint.DATA_TRANSFORMERS]: this.transformers.size,
                [types_1.ExtensionPoint.VISUALIZATION_WIDGETS]: this.widgets.size,
                [types_1.ExtensionPoint.CHART_RENDERERS]: this.renderers.size,
                [types_1.ExtensionPoint.EXPORT_FORMATS]: this.exportFormats.size,
                [types_1.ExtensionPoint.EXPORT_PROCESSORS]: this.exportProcessors.size,
                [types_1.ExtensionPoint.MENU_CONTRIBUTIONS]: this.menus.size,
                [types_1.ExtensionPoint.TOOLBAR_CONTRIBUTIONS]: this.toolbars.size,
                [types_1.ExtensionPoint.SETTINGS_PAGES]: this.settings.size,
                [types_1.ExtensionPoint.THEMES]: this.themes.size,
                [types_1.ExtensionPoint.ICON_THEMES]: this.iconThemes.size,
                [types_1.ExtensionPoint.DEBUG_TOOLS]: this.debugTools.size,
                [types_1.ExtensionPoint.ANALYSIS_TOOLS]: this.analysisTools.size
            }
        };
    }
    /**
     * Add event listener
     */
    addEventListener(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    /**
     * Remove event listener
     */
    removeEventListener(event, listener) {
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
    emitEvent(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(data);
                }
                catch (error) {
                    console.error(`Error in plugin event listener for ${event}:`, error);
                }
            }
        }
    }
    /**
     * Clear all contributions (for testing)
     */
    clear() {
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
exports.ContributionRegistry = ContributionRegistry;
//# sourceMappingURL=ContributionRegistry.js.map
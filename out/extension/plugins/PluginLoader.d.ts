/**
 * Serial-Studio VSCode Plugin System - Plugin Loader
 *
 * This module implements the plugin loading mechanism, including manifest
 * validation, module loading, and dependency resolution.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
import { PluginManifest, JSONSchema } from './types';
/**
 * Plugin Loader
 *
 * Handles the loading and validation of plugin files and manifests.
 */
export declare class PluginLoader {
    private manifestCache;
    private moduleCache;
    /**
     * Load plugin manifest from file
     */
    loadManifest(manifestPath: string): Promise<PluginManifest>;
    /**
     * Validate plugin manifest
     */
    validateManifest(manifest: PluginManifest): Promise<void>;
    /**
     * Load plugin module
     */
    loadPluginModule(manifest: PluginManifest, pluginPath: string): Promise<any>;
    /**
     * Validate plugin module exports
     */
    private validatePluginModule;
    /**
     * Validate contributions in manifest
     */
    private validateContributions;
    /**
     * Validate dependencies
     */
    private validateDependencies;
    /**
     * Check if version follows semantic versioning
     */
    private isValidSemanticVersion;
    /**
     * Check if plugin ID is valid
     */
    private isValidPluginId;
    /**
     * Clear caches
     */
    clearCaches(): void;
    /**
     * Get manifest schema for validation
     */
    getManifestSchema(): JSONSchema;
}
//# sourceMappingURL=PluginLoader.d.ts.map
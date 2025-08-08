"use strict";
/**
 * Serial-Studio VSCode Plugin System - Plugin Loader
 *
 * This module implements the plugin loading mechanism, including manifest
 * validation, module loading, and dependency resolution.
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
exports.PluginLoader = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Plugin Loader
 *
 * Handles the loading and validation of plugin files and manifests.
 */
class PluginLoader {
    manifestCache = new Map();
    moduleCache = new Map();
    /**
     * Load plugin manifest from file
     */
    async loadManifest(manifestPath) {
        try {
            // Check cache first
            if (this.manifestCache.has(manifestPath)) {
                return this.manifestCache.get(manifestPath);
            }
            // Read and parse manifest file
            const manifestContent = await fs.readFile(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);
            // Cache the manifest
            this.manifestCache.set(manifestPath, manifest);
            return manifest;
        }
        catch (error) {
            throw new Error(`Failed to load plugin manifest from ${manifestPath}: ${error.message}`);
        }
    }
    /**
     * Validate plugin manifest
     */
    async validateManifest(manifest) {
        const errors = [];
        // Required fields validation
        if (!manifest.id || typeof manifest.id !== 'string') {
            errors.push('Plugin ID is required and must be a string');
        }
        if (!manifest.name || typeof manifest.name !== 'string') {
            errors.push('Plugin name is required and must be a string');
        }
        if (!manifest.version || typeof manifest.version !== 'string') {
            errors.push('Plugin version is required and must be a string');
        }
        if (!manifest.description || typeof manifest.description !== 'string') {
            errors.push('Plugin description is required and must be a string');
        }
        if (!manifest.author || typeof manifest.author !== 'string') {
            errors.push('Plugin author is required and must be a string');
        }
        // Engine compatibility validation
        if (!manifest.engines) {
            errors.push('Engine compatibility is required');
        }
        else {
            if (!manifest.engines.vscode) {
                errors.push('VSCode engine compatibility is required');
            }
            if (!manifest.engines.serialStudio) {
                errors.push('Serial Studio engine compatibility is required');
            }
        }
        // Activation events validation
        if (!Array.isArray(manifest.activationEvents)) {
            errors.push('Activation events must be an array');
        }
        // Version format validation
        if (manifest.version && !this.isValidSemanticVersion(manifest.version)) {
            errors.push('Plugin version must follow semantic versioning (e.g., 1.0.0)');
        }
        // Plugin ID format validation
        if (manifest.id && !this.isValidPluginId(manifest.id)) {
            errors.push('Plugin ID must contain only alphanumeric characters, hyphens, and dots');
        }
        // Contributions validation
        if (manifest.contributes) {
            await this.validateContributions(manifest.contributes, errors);
        }
        // Dependencies validation
        if (manifest.dependencies) {
            this.validateDependencies(manifest.dependencies, errors);
        }
        if (errors.length > 0) {
            throw new Error(`Plugin manifest validation failed:\n${errors.join('\n')}`);
        }
    }
    /**
     * Load plugin module
     */
    async loadPluginModule(manifest, pluginPath) {
        const cacheKey = `${manifest.id}@${manifest.version}`;
        // Check cache first
        if (this.moduleCache.has(cacheKey)) {
            return this.moduleCache.get(cacheKey);
        }
        try {
            let modulePath;
            // Determine main entry point
            if (manifest.main) {
                modulePath = path.resolve(pluginPath, manifest.main);
            }
            else {
                // Default entry points
                const defaultPaths = [
                    path.join(pluginPath, 'index.js'),
                    path.join(pluginPath, 'main.js'),
                    path.join(pluginPath, 'plugin.js')
                ];
                modulePath = '';
                for (const defaultPath of defaultPaths) {
                    try {
                        await fs.access(defaultPath);
                        modulePath = defaultPath;
                        break;
                    }
                    catch {
                        // Continue checking
                    }
                }
                if (!modulePath) {
                    throw new Error('No main entry point found. Specify "main" in plugin.json or provide index.js');
                }
            }
            // Check if module file exists
            await fs.access(modulePath);
            // Load the module
            // Note: In a real implementation, you'd want to use a secure module loader
            // that can handle dynamic imports and provides isolation
            delete require.cache[require.resolve(modulePath)];
            const pluginModule = require(modulePath);
            // Add metadata about which entry point was used
            const entryFileName = path.basename(modulePath);
            pluginModule.entryPoint = entryFileName;
            // Validate required exports
            this.validatePluginModule(pluginModule, manifest);
            // Cache the module
            this.moduleCache.set(cacheKey, pluginModule);
            return pluginModule;
        }
        catch (error) {
            throw new Error(`Failed to load plugin module for ${manifest.id}: ${error.message}`);
        }
    }
    /**
     * Validate plugin module exports
     */
    validatePluginModule(pluginModule, manifest) {
        const errors = [];
        // Check for required exports based on contributions
        if (manifest.contributes) {
            if (manifest.contributes.drivers && !pluginModule.drivers) {
                errors.push('Plugin declares driver contributions but does not export "drivers"');
            }
            if (manifest.contributes.widgets && !pluginModule.widgets) {
                errors.push('Plugin declares widget contributions but does not export "widgets"');
            }
            if (manifest.contributes.parsers && !pluginModule.parsers) {
                errors.push('Plugin declares parser contributions but does not export "parsers"');
            }
            // Add more validation for other contribution types as needed
        }
        // Validate activate function if activation events are specified
        if (manifest.activationEvents.length > 0 && typeof pluginModule.activate !== 'function') {
            errors.push('Plugin declares activation events but does not export an "activate" function');
        }
        if (errors.length > 0) {
            throw new Error(`Plugin module validation failed:\\n${errors.join('\\n')}`);
        }
    }
    /**
     * Validate contributions in manifest
     */
    async validateContributions(contributes, errors) {
        // Validate driver contributions
        if (contributes.drivers) {
            if (!Array.isArray(contributes.drivers)) {
                errors.push('Driver contributions must be an array');
            }
            else {
                contributes.drivers.forEach((driver, index) => {
                    if (!driver.id) {
                        errors.push(`Driver contribution ${index} is missing required "id" field`);
                    }
                    if (!driver.name) {
                        errors.push(`Driver contribution ${index} is missing required "name" field`);
                    }
                    if (!driver.protocol) {
                        errors.push(`Driver contribution ${index} is missing required "protocol" field`);
                    }
                });
            }
        }
        // Validate widget contributions
        if (contributes.widgets) {
            if (!Array.isArray(contributes.widgets)) {
                errors.push('Widget contributions must be an array');
            }
            else {
                contributes.widgets.forEach((widget, index) => {
                    if (!widget.id) {
                        errors.push(`Widget contribution ${index} is missing required "id" field`);
                    }
                    if (!widget.name) {
                        errors.push(`Widget contribution ${index} is missing required "name" field`);
                    }
                    if (!widget.type || !['dataset', 'group'].includes(widget.type)) {
                        errors.push(`Widget contribution ${index} must have type "dataset" or "group"`);
                    }
                });
            }
        }
        // Validate parser contributions
        if (contributes.parsers) {
            if (!Array.isArray(contributes.parsers)) {
                errors.push('Parser contributions must be an array');
            }
            else {
                contributes.parsers.forEach((parser, index) => {
                    if (!parser.id) {
                        errors.push(`Parser contribution ${index} is missing required "id" field`);
                    }
                    if (!parser.name) {
                        errors.push(`Parser contribution ${index} is missing required "name" field`);
                    }
                });
            }
        }
        // Validate menu contributions
        if (contributes.menus) {
            if (!Array.isArray(contributes.menus)) {
                errors.push('Menu contributions must be an array');
            }
            else {
                contributes.menus.forEach((menu, index) => {
                    if (!menu.id) {
                        errors.push(`Menu contribution ${index} is missing required "id" field`);
                    }
                    if (!menu.label) {
                        errors.push(`Menu contribution ${index} is missing required "label" field`);
                    }
                    if (!menu.command) {
                        errors.push(`Menu contribution ${index} is missing required "command" field`);
                    }
                });
            }
        }
        // Add validation for other contribution types...
    }
    /**
     * Validate dependencies
     */
    validateDependencies(dependencies, errors) {
        for (const [depName, depVersion] of Object.entries(dependencies)) {
            if (!this.isValidSemanticVersion(depVersion)) {
                errors.push(`Dependency ${depName} has invalid version: ${depVersion}`);
            }
        }
    }
    /**
     * Check if version follows semantic versioning
     */
    isValidSemanticVersion(version) {
        const semverRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?(?:\+[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?$/;
        return semverRegex.test(version);
    }
    /**
     * Check if plugin ID is valid
     */
    isValidPluginId(pluginId) {
        const idRegex = /^[a-zA-Z0-9.-]+$/;
        return idRegex.test(pluginId) && pluginId.length > 0 && pluginId.length <= 100;
    }
    /**
     * Clear caches
     */
    clearCaches() {
        this.manifestCache.clear();
        this.moduleCache.clear();
    }
    /**
     * Get manifest schema for validation
     */
    getManifestSchema() {
        return {
            type: 'object',
            required: ['id', 'name', 'version', 'description', 'author', 'engines', 'activationEvents'],
            properties: {
                id: {
                    type: 'string',
                    pattern: '^[a-zA-Z0-9.-]+$',
                    minLength: 1,
                    maxLength: 100
                },
                name: {
                    type: 'string',
                    minLength: 1
                },
                version: {
                    type: 'string',
                    pattern: '^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$'
                },
                description: {
                    type: 'string',
                    minLength: 1
                },
                author: {
                    type: 'string',
                    minLength: 1
                },
                license: {
                    type: 'string'
                },
                engines: {
                    type: 'object',
                    required: ['vscode', 'serialStudio'],
                    properties: {
                        vscode: { type: 'string' },
                        serialStudio: { type: 'string' }
                    }
                },
                activationEvents: {
                    type: 'array',
                    items: { type: 'string' }
                },
                main: {
                    type: 'string'
                },
                dependencies: {
                    type: 'object',
                    additionalProperties: { type: 'string' }
                },
                keywords: {
                    type: 'array',
                    items: { type: 'string' }
                },
                category: {
                    type: 'string',
                    enum: ['communication', 'visualization', 'data-processing', 'export', 'themes', 'tools', 'other']
                },
                homepage: {
                    type: 'string',
                    format: 'uri'
                },
                repository: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        url: { type: 'string', format: 'uri' }
                    },
                    required: ['type', 'url']
                },
                contributes: {
                    type: 'object',
                    properties: {
                        drivers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['id', 'name', 'protocol'],
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    protocol: { type: 'string' }
                                }
                            }
                        },
                        widgets: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['id', 'name', 'type'],
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    type: {
                                        type: 'string',
                                        enum: ['dataset', 'group']
                                    }
                                }
                            }
                        },
                        parsers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['id', 'name'],
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        },
                        menus: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['id', 'label', 'command'],
                                properties: {
                                    id: { type: 'string' },
                                    label: { type: 'string' },
                                    command: { type: 'string' }
                                }
                            }
                        }
                        // Add more contribution schemas as needed
                    }
                }
            }
        };
    }
}
exports.PluginLoader = PluginLoader;
//# sourceMappingURL=PluginLoader.js.map
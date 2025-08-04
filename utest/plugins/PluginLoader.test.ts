/**
 * Serial-Studio VSCode Plugin System - Plugin Loader Tests
 * 
 * Tests the plugin loader functionality independently
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PluginLoader } from '../../src/extension/plugins/PluginLoader';
import { PluginManifest } from '../../src/extension/plugins/types';

describe('PluginLoader', () => {
  let loader: PluginLoader;
  
  beforeEach(() => {
    loader = new PluginLoader();
    loader.clearCaches();
  });
  
  describe('Manifest Validation', () => {
    it('should validate valid plugin manifest', async () => {
      const validManifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*']
      };
      
      // Should not throw
      await expect(loader.validateManifest(validManifest)).resolves.not.toThrow();
    });
    
    it('should reject manifest with missing required fields', async () => {
      const invalidManifest = {
        name: 'Invalid Plugin'
        // Missing required fields: id, version, description, author, engines
      } as any;
      
      await expect(loader.validateManifest(invalidManifest)).rejects.toThrow('validation failed');
    });
    
    it('should reject manifest with invalid version format', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: 'invalid-version',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*']
      };
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('semantic versioning');
    });
    
    it('should reject manifest with invalid plugin ID', async () => {
      const manifest: PluginManifest = {
        id: 'invalid plugin id!',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*']
      };
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('alphanumeric characters');
    });
    
    it('should reject manifest with missing engine compatibility', async () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        // Missing engines
        activationEvents: ['*']
      } as any;
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('Engine compatibility is required');
    });
    
    it('should reject manifest with invalid activation events', async () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: 'not-an-array'
      } as any;
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('must be an array');
    });
    
    it('should validate driver contributions format', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*'],
        contributes: {
          drivers: [
            {
              // Missing required fields
              name: 'Test Driver'
            } as any
          ]
        }
      };
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('missing required "id" field');
    });
    
    it('should validate widget contributions format', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*'],
        contributes: {
          widgets: [
            {
              id: 'test-widget',
              name: 'Test Widget',
              type: 'invalid-type' as any // Should be 'dataset' or 'group'
            }
          ]
        }
      };
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('must have type "dataset" or "group"');
    });
    
    it('should validate menu contributions format', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*'],
        contributes: {
          menus: [
            {
              id: 'test-menu',
              label: 'Test Menu'
              // Missing required 'command' field
            } as any
          ]
        }
      };
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('missing required "command" field');
    });
    
    it('should validate dependencies format', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.60.0',
          serialStudio: '^1.0.0'
        },
        activationEvents: ['*'],
        dependencies: {
          'some-dependency': 'invalid-version-format'
        }
      };
      
      await expect(loader.validateManifest(manifest)).rejects.toThrow('invalid version');
    });
  });
  
  describe('Schema Generation', () => {
    it('should provide manifest schema', () => {
      const schema = loader.getManifestSchema();
      
      expect(schema.type).toBe('object');
      expect(schema.required).toContain('id');
      expect(schema.required).toContain('name');
      expect(schema.required).toContain('version');
      expect(schema.required).toContain('description');
      expect(schema.required).toContain('author');
      expect(schema.required).toContain('engines');
      expect(schema.required).toContain('activationEvents');
      
      expect(schema.properties).toHaveProperty('id');
      expect(schema.properties).toHaveProperty('name');
      expect(schema.properties).toHaveProperty('version');
      expect(schema.properties).toHaveProperty('engines');
      expect(schema.properties).toHaveProperty('contributes');
    });
    
    it('should have proper version pattern in schema', () => {
      const schema = loader.getManifestSchema();
      const versionProperty = schema.properties.version as any;
      
      expect(versionProperty.pattern).toBeDefined();
      expect(versionProperty.pattern).toBeTruthy();
    });
    
    it('should have proper plugin ID pattern in schema', () => {
      const schema = loader.getManifestSchema();
      const idProperty = schema.properties.id as any;
      
      expect(idProperty.pattern).toBeDefined();
      expect(idProperty.minLength).toBe(1);
      expect(idProperty.maxLength).toBe(100);
    });
  });
  
  describe('Cache Management', () => {
    it('should clear caches', () => {
      // This test mainly ensures the clearCaches method doesn't throw
      expect(() => loader.clearCaches()).not.toThrow();
    });
  });
});
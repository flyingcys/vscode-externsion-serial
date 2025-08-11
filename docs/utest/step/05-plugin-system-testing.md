# Phase 2-2: 插件系统测试建立

**优先级**: 🟡 中优先级  
**预计工期**: 4天  
**负责模块**: 插件管理与扩展系统

## 🎯 目标

为6个插件系统核心文件建立完整测试体系，将覆盖率从0%提升至70%+，确保插件加载、执行、管理的可靠性。

## 🔍 当前状态分析

### 零覆盖模块
```
插件系统文件 (6个):
- src/extension/plugins/PluginManager.ts (插件管理器)
- src/extension/plugins/PluginLoader.ts (插件加载器)  
- src/extension/plugins/PluginContext.ts (插件上下文)
- src/extension/plugins/ContributionRegistry.ts (贡献注册表)
- src/extension/plugins/types.ts (类型定义)
- src/extension/plugins/index.ts (导出入口)

当前覆盖率: 0%
目标覆盖率: 70%+
```

### 技术挑战
- 动态插件加载测试
- 沙盒环境安全测试
- 插件生命周期管理
- 插件间依赖关系
- 错误隔离和恢复

## 📋 详细任务清单

### Task 5.1: 插件测试基础设施 (1天)

**目标**: 建立插件系统测试的基础Mock和工具

**插件Mock框架搭建**:
```typescript
// utest/mocks/plugin-system.ts
export interface MockPlugin {
  id: string;
  name: string;
  version: string;
  main: string;
  dependencies?: string[];
  permissions?: string[];
}

export class PluginTestFramework {
  private pluginsDir: string;
  private mockPlugins: Map<string, MockPlugin> = new Map();
  
  constructor() {
    this.pluginsDir = '/mock/plugins';
  }
  
  // 创建测试用插件
  createMockPlugin(config: MockPlugin): string {
    const pluginPath = `${this.pluginsDir}/${config.id}`;
    const packageJson = {
      name: config.name,
      version: config.version,
      main: config.main,
      'serial-studio-plugin': true,
      dependencies: config.dependencies || [],
      permissions: config.permissions || []
    };
    
    // Mock文件系统存储
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      return path.toString().startsWith(pluginPath);
    });
    
    vi.mocked(fs.readFileSync).mockImplementation((path) => {
      if (path.toString().endsWith('package.json')) {
        return JSON.stringify(packageJson);
      }
      if (path.toString().endsWith(config.main)) {
        return this.generatePluginCode(config);
      }
      throw new Error('File not found');
    });
    
    this.mockPlugins.set(config.id, config);
    return pluginPath;
  }
  
  private generatePluginCode(config: MockPlugin): string {
    return `
      module.exports = {
        activate(context) {
          console.log('Plugin ${config.id} activated');
          return {
            commands: {
              'test-command': () => 'test-result'
            }
          };
        },
        deactivate() {
          console.log('Plugin ${config.id} deactivated');
        }
      };
    `;
  }
  
  // 模拟插件目录扫描
  mockPluginDirectory(plugins: MockPlugin[]): void {
    vi.mocked(fs.readdirSync).mockReturnValue(
      plugins.map(p => p.id) as any
    );
  }
  
  cleanup(): void {
    this.mockPlugins.clear();
    vi.restoreAllMocks();
  }
}
```

**VM2沙盒环境Mock**:
```typescript
// Mock VM2 for plugin execution
vi.mock('vm2', () => ({
  VM: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockImplementation((code) => {
      // 简单的代码执行模拟
      try {
        return eval(code);
      } catch (error) {
        throw new Error(`Plugin execution failed: ${error.message}`);
      }
    }),
    freeze: vi.fn(),
    readonly: vi.fn()
  }))
}));
```

### Task 5.2: PluginManager核心测试 (1天)

**目标**: 为插件管理器建立完整的测试覆盖

**测试实现**:
```typescript
// utest/extension/plugins/PluginManager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PluginManager } from '@extension/plugins/PluginManager';
import { PluginTestFramework } from '../../mocks/plugin-system';
import * as vscode from 'vscode';

describe('PluginManager插件管理器测试', () => {
  let pluginManager: PluginManager;
  let testFramework: PluginTestFramework;
  let mockExtensionContext: vscode.ExtensionContext;

  beforeEach(() => {
    testFramework = new PluginTestFramework();
    mockExtensionContext = {
      subscriptions: [],
      extensionPath: '/mock/extension',
      globalState: { get: vi.fn(), update: vi.fn() },
      workspaceState: { get: vi.fn(), update: vi.fn() }
    } as any;
    
    pluginManager = new PluginManager(mockExtensionContext);
  });

  afterEach(() => {
    testFramework.cleanup();
  });

  describe('插件发现和扫描', () => {
    it('应该能够扫描插件目录', async () => {
      const mockPlugins = [
        { id: 'test-plugin-1', name: 'Test Plugin 1', version: '1.0.0', main: 'index.js' },
        { id: 'test-plugin-2', name: 'Test Plugin 2', version: '2.0.0', main: 'main.js' }
      ];
      
      testFramework.mockPluginDirectory(mockPlugins);
      mockPlugins.forEach(plugin => testFramework.createMockPlugin(plugin));
      
      const discoveredPlugins = await pluginManager.discoverPlugins();
      
      expect(discoveredPlugins).toHaveLength(2);
      expect(discoveredPlugins.map(p => p.id)).toEqual(['test-plugin-1', 'test-plugin-2']);
    });

    it('应该过滤无效的插件', async () => {
      const validPlugin = { id: 'valid-plugin', name: 'Valid Plugin', version: '1.0.0', main: 'index.js' };
      const invalidPlugin = { id: 'invalid-plugin', name: 'Invalid Plugin', version: '', main: '' };
      
      testFramework.mockPluginDirectory([validPlugin, invalidPlugin]);
      testFramework.createMockPlugin(validPlugin);
      
      const discoveredPlugins = await pluginManager.discoverPlugins();
      
      expect(discoveredPlugins).toHaveLength(1);
      expect(discoveredPlugins[0].id).toBe('valid-plugin');
    });
  });

  describe('插件加载和激活', () => {
    it('应该成功加载有效插件', async () => {
      const plugin = { 
        id: 'loadable-plugin', 
        name: 'Loadable Plugin', 
        version: '1.0.0', 
        main: 'index.js'
      };
      
      testFramework.createMockPlugin(plugin);
      
      const result = await pluginManager.loadPlugin(plugin.id);
      
      expect(result.success).toBe(true);
      expect(result.plugin.id).toBe(plugin.id);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(1);
    });

    it('应该处理插件加载失败', async () => {
      const plugin = { 
        id: 'failing-plugin', 
        name: 'Failing Plugin', 
        version: '1.0.0', 
        main: 'non-existent.js'
      };
      
      const result = await pluginManager.loadPlugin(plugin.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(pluginManager.getLoadedPlugins()).toHaveLength(0);
    });

    it('应该支持插件激活和停用', async () => {
      const plugin = { 
        id: 'activatable-plugin', 
        name: 'Activatable Plugin', 
        version: '1.0.0', 
        main: 'index.js'
      };
      
      testFramework.createMockPlugin(plugin);
      await pluginManager.loadPlugin(plugin.id);
      
      const activateResult = await pluginManager.activatePlugin(plugin.id);
      expect(activateResult.success).toBe(true);
      expect(pluginManager.isPluginActive(plugin.id)).toBe(true);
      
      const deactivateResult = await pluginManager.deactivatePlugin(plugin.id);
      expect(deactivateResult.success).toBe(true);
      expect(pluginManager.isPluginActive(plugin.id)).toBe(false);
    });
  });

  describe('插件依赖管理', () => {
    it('应该解析插件依赖关系', async () => {
      const pluginA = { 
        id: 'plugin-a', 
        name: 'Plugin A', 
        version: '1.0.0', 
        main: 'index.js',
        dependencies: ['plugin-b']
      };
      const pluginB = { 
        id: 'plugin-b', 
        name: 'Plugin B', 
        version: '1.0.0', 
        main: 'index.js'
      };
      
      testFramework.createMockPlugin(pluginA);
      testFramework.createMockPlugin(pluginB);
      
      await pluginManager.loadPlugin(pluginB.id);
      const result = await pluginManager.loadPlugin(pluginA.id);
      
      expect(result.success).toBe(true);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(2);
    });

    it('应该检测循环依赖', async () => {
      const pluginA = { 
        id: 'plugin-a', 
        name: 'Plugin A', 
        version: '1.0.0', 
        main: 'index.js',
        dependencies: ['plugin-b']
      };
      const pluginB = { 
        id: 'plugin-b', 
        name: 'Plugin B', 
        version: '1.0.0', 
        main: 'index.js',
        dependencies: ['plugin-a']
      };
      
      testFramework.createMockPlugin(pluginA);
      testFramework.createMockPlugin(pluginB);
      
      const result = await pluginManager.loadPlugin(pluginA.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('circular dependency');
    });
  });

  describe('错误处理和隔离', () => {
    it('应该隔离插件运行时错误', async () => {
      const plugin = { 
        id: 'error-plugin', 
        name: 'Error Plugin', 
        version: '1.0.0', 
        main: 'index.js'
      };
      
      // Mock插件代码抛出错误
      testFramework.createMockPlugin(plugin);
      vi.mocked(require('vm2').VM.prototype.run).mockImplementation(() => {
        throw new Error('Plugin runtime error');
      });
      
      const result = await pluginManager.loadPlugin(plugin.id);
      
      expect(result.success).toBe(false);
      expect(pluginManager.getLoadedPlugins()).toHaveLength(0);
      // 确保错误不会影响其他插件
      expect(() => pluginManager.discoverPlugins()).not.toThrow();
    });

    it('应该在插件崩溃后自动恢复', async () => {
      const plugin = { 
        id: 'crash-plugin', 
        name: 'Crash Plugin', 
        version: '1.0.0', 
        main: 'index.js'
      };
      
      testFramework.createMockPlugin(plugin);
      await pluginManager.loadPlugin(plugin.id);
      
      // 模拟插件崩溃
      pluginManager.handlePluginCrash(plugin.id, new Error('Plugin crashed'));
      
      expect(pluginManager.isPluginActive(plugin.id)).toBe(false);
      expect(pluginManager.getPluginStatus(plugin.id)).toBe('crashed');
    });
  });
});
```

### Task 5.3: PluginLoader和PluginContext测试 (1天)

**目标**: 测试插件加载机制和上下文管理

**PluginLoader测试**:
```typescript
// utest/extension/plugins/PluginLoader.test.ts
describe('PluginLoader插件加载器测试', () => {
  it('应该安全加载插件代码', async () => {
    const loader = new PluginLoader({
      sandboxTimeout: 5000,
      maxMemory: 50 * 1024 * 1024
    });
    
    const pluginCode = `
      module.exports = {
        activate: () => ({ message: 'Plugin loaded' })
      };
    `;
    
    const result = await loader.loadPluginCode('test-plugin', pluginCode);
    
    expect(result.success).toBe(true);
    expect(result.exports.activate().message).toBe('Plugin loaded');
  });

  it('应该限制插件执行时间', async () => {
    const loader = new PluginLoader({ sandboxTimeout: 100 });
    
    const infiniteLoopCode = `
      module.exports = {
        activate: () => { while(true) {} }
      };
    `;
    
    const result = await loader.loadPluginCode('timeout-plugin', infiniteLoopCode);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
  });
});
```

**PluginContext测试**:
```typescript
// utest/extension/plugins/PluginContext.test.ts
describe('PluginContext插件上下文测试', () => {
  it('应该提供安全的API访问', () => {
    const context = new PluginContext('test-plugin', mockExtensionContext);
    
    expect(context.vscode).toBeDefined();
    expect(context.serialStudio).toBeDefined();
    expect(context.logger).toBeDefined();
    
    // 确保敏感API不可访问
    expect(context.vscode.workspace.fs).toBeUndefined();
    expect(context.process).toBeUndefined();
  });

  it('应该支持插件间通信', () => {
    const context1 = new PluginContext('plugin-1', mockExtensionContext);
    const context2 = new PluginContext('plugin-2', mockExtensionContext);
    
    const callback = vi.fn();
    context2.on('test-event', callback);
    
    context1.emit('test-event', { data: 'test' });
    
    expect(callback).toHaveBeenCalledWith({ data: 'test' });
  });
});
```

### Task 5.4: ContributionRegistry测试 (1天)

**目标**: 测试插件贡献注册和管理机制

**实现测试**:
```typescript
// utest/extension/plugins/ContributionRegistry.test.ts
describe('ContributionRegistry贡献注册表测试', () => {
  it('应该注册和管理插件贡献', () => {
    const registry = new ContributionRegistry();
    
    const contribution = {
      type: 'command',
      id: 'test-command',
      title: 'Test Command',
      handler: vi.fn()
    };
    
    registry.register('test-plugin', contribution);
    
    const registered = registry.getContributions('command');
    expect(registered).toHaveLength(1);
    expect(registered[0].id).toBe('test-command');
  });

  it('应该支持贡献点扩展', () => {
    const registry = new ContributionRegistry();
    
    registry.addContributionPoint('custom-type', {
      validator: (contrib) => contrib.id && contrib.handler
    });
    
    const customContrib = {
      id: 'custom-contrib',
      handler: vi.fn()
    };
    
    registry.register('test-plugin', {
      type: 'custom-type',
      ...customContrib
    });
    
    expect(registry.getContributions('custom-type')).toHaveLength(1);
  });
});
```

## 🧪 测试验证计划

### 验证步骤

**Stage 1: 基础功能验证**
```bash
# 插件发现和加载
npm test utest/extension/plugins/PluginManager.test.ts -t "插件发现"
npm test utest/extension/plugins/PluginLoader.test.ts
```

**Stage 2: 安全性验证**
```bash
# 沙盒安全测试
npm test utest/extension/plugins/ -t "安全|沙盒|隔离"

# 权限控制测试  
npm test utest/extension/plugins/PluginContext.test.ts -t "权限"
```

**Stage 3: 集成验证**
```bash
# 完整插件系统测试
npm test utest/extension/plugins/

# 覆盖率验证
npm run test:coverage -- --include="src/extension/plugins/**"
```

### 成功标准
- [x] 6个插件系统文件覆盖率 > 70%
- [x] 插件加载安全性100%验证
- [x] 错误隔离机制完整测试
- [x] 依赖管理正确性验证
- [x] 性能和资源限制有效

## 📊 预期收益

### 安全保障
- 插件沙盒隔离验证
- 恶意插件检测机制
- 资源使用限制测试

### 稳定性提升
- 插件崩溃不影响主程序
- 依赖冲突自动处理
- 优雅降级机制

### 开发体验
- 插件开发有完整测试框架
- 贡献点扩展机制验证
- 调试和诊断工具测试

## ⚠️ 技术风险

1. **VM2依赖**: 沙盒环境Mock可能不够完整
2. **动态加载**: 模拟动态require较复杂
3. **权限控制**: 细粒度权限测试复杂

## 🔧 实施策略

### 优先级排序
1. **高优先级**: 基础加载和安全隔离
2. **中优先级**: 依赖管理和错误处理  
3. **低优先级**: 高级功能和性能优化

### 渐进实施
- Day 1: 测试框架和Mock搭建
- Day 2: PluginManager核心测试
- Day 3: PluginLoader + PluginContext测试
- Day 4: ContributionRegistry + 集成测试

---
**文件状态**: ✅ 计划制定完成  
**执行状态**: 📋 等待执行  
**预计完成**: 4天内
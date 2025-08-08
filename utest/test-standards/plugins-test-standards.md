# Plugins 模块测试标准

## 📋 测试标准概述

本文档定义了 Plugins 模块 100% 覆盖度和通过率的测试标准，确保代码质量达到工业级标准。

## 🎯 覆盖率要求

### 基本覆盖率标准
- **行覆盖率 (Line Coverage)**: 100%
- **分支覆盖率 (Branch Coverage)**: 100%  
- **函数覆盖率 (Function Coverage)**: 100%
- **语句覆盖率 (Statement Coverage)**: 100%

### 覆盖率验证
```bash
# 运行覆盖率测试
npm run test:coverage:plugins

# 查看详细覆盖率报告
npm run test:coverage:report
```

## 🧪 测试分类标准

### 1. 单元测试 (70%)
每个方法和函数都必须有对应的单元测试：

#### 必测场景
- **正常路径**: 所有预期输入和输出
- **边界条件**: null、undefined、空值、极值
- **异常路径**: 错误输入和异常处理
- **状态变化**: 对象状态的正确变更

#### 测试文件命名
```
src/extension/plugins/PluginManager.ts
  → utest/plugins/PluginManager-Ultimate-Coverage.test.ts

src/extension/plugins/types.ts  
  → utest/plugins/types.test.ts
```

### 2. 集成测试 (20%)
组件间交互测试：

#### 必测集成点
- PluginManager ↔ ContributionRegistry
- PluginManager ↔ PluginLoader  
- PluginManager ↔ PluginContext
- ContributionRegistry ↔ Event System

### 3. 端到端测试 (10%)
完整工作流测试：

#### 关键工作流
- 插件发现 → 加载 → 激活 → 注册贡献 → 使用 → 停用 → 卸载
- 错误恢复流程
- 插件热重载流程

## 📊 测试质量标准

### 测试代码质量
- **测试命名**: 描述性，明确测试意图
- **测试隔离**: 每个测试独立运行，无依赖
- **测试数据**: 使用 Factory 模式生成测试数据
- **Mock 使用**: 合理使用 Mock，避免过度模拟

### 断言标准
```typescript
// ✅ 好的断言 - 具体明确
expect(pluginManager.isPluginLoaded('test-plugin')).toBe(true);
expect(plugin.manifest.id).toBe('test-plugin');

// ❌ 不好的断言 - 模糊不清
expect(result).toBeTruthy();
expect(plugin).toBeDefined();
```

### 错误测试标准
```typescript
// ✅ 完整的错误测试
await expect(pluginManager.loadPlugin('nonexistent.json'))
  .rejects
  .toThrow('Cannot find module');

// 验证错误的具体属性
expect(error).toBeInstanceOf(PluginLoadError);
expect(error.code).toBe('MODULE_NOT_FOUND');
expect(error.pluginId).toBe('test-plugin');
```

## 🔍 代码覆盖分析标准

### 分支覆盖检查
确保所有条件分支都被测试：

```typescript
// 原代码
function validatePlugin(plugin: PluginManifest): boolean {
  if (!plugin.id) return false;           // 分支1: id为空
  if (!plugin.version) return false;      // 分支2: version为空  
  if (!plugin.engines) return false;      // 分支3: engines为空
  return true;                           // 分支4: 全部有效
}

// 测试必须覆盖所有4个分支
it('应该验证所有必需字段', () => {
  expect(validatePlugin({})).toBe(false);                    // 分支1
  expect(validatePlugin({id: 'test'})).toBe(false);          // 分支2  
  expect(validatePlugin({id: 'test', version: '1.0.0'})).toBe(false); // 分支3
  expect(validatePlugin(validManifest)).toBe(true);          // 分支4
});
```

### 循环覆盖检查
确保循环的所有执行路径：

```typescript
// 测试空数组、单元素、多元素情况
expect(processPlugins([])).toEqual([]);           // 0次循环
expect(processPlugins([plugin1])).toEqual([...]);  // 1次循环  
expect(processPlugins([plugin1, plugin2])).toEqual([...]); // 多次循环
```

## 🚀 性能测试标准

### 性能基准
- **插件加载时间**: < 100ms (单个插件)
- **插件激活时间**: < 50ms (单个插件)
- **贡献注册时间**: < 10ms (单个贡献)
- **内存使用**: < 10MB (10个插件)

### 性能测试示例
```typescript
it('插件加载性能应符合标准', async () => {
  const startTime = performance.now();
  await pluginManager.loadPlugin(manifestPath);
  const loadTime = performance.now() - startTime;
  
  expect(loadTime).toBeLessThan(100); // 100ms以内
});
```

## 🛡️ 安全性测试标准

### 必测安全场景
- **插件代码注入**: 验证恶意代码隔离
- **文件路径遍历**: 防止访问未授权文件
- **内存泄漏**: 确保资源正确清理
- **沙箱隔离**: 插件运行环境隔离

### 安全测试示例
```typescript
it('应该防止插件代码注入', async () => {
  const maliciousCode = 'process.exit(1); module.exports = {};';
  
  await expect(
    pluginLoader.loadPluginModule('/path/to/malicious.js')
  ).rejects.toThrow('Security violation');
});
```

## 📋 测试检查清单

### 代码覆盖检查
- [ ] 所有 public 方法都有测试
- [ ] 所有 private 方法通过 public 方法间接测试
- [ ] 所有条件分支都被执行
- [ ] 所有异常路径都被测试
- [ ] 所有边界条件都被检查

### 测试质量检查
- [ ] 测试命名清晰描述测试场景
- [ ] 测试相互独立，无依赖关系
- [ ] Mock 使用适当，不过度模拟
- [ ] 断言具体明确，验证正确结果
- [ ] 清理代码完整，无资源泄漏

### 文档和维护
- [ ] 测试有适当的注释说明
- [ ] 复杂测试逻辑有文档解释
- [ ] 测试数据生成器统一管理
- [ ] 测试辅助工具可复用

## 🔧 工具配置标准

### 覆盖率工具配置
```javascript
// vitest.config.mjs 配置要求
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov', 'cobertura'],
  include: ['src/extension/plugins/**/*.ts'],
  exclude: ['src/extension/plugins/**/*.d.ts'],
  thresholds: {
    'src/extension/plugins/**': {
      lines: 100,
      branches: 100, 
      functions: 100,
      statements: 100
    }
  }
}
```

### 测试环境要求
- **Node.js**: >= 16.0.0
- **内存限制**: 512MB (单个测试进程)
- **超时设置**: 60s (单个测试), 300s (整个套件)
- **并发控制**: 单进程执行，避免竞态条件

## 📈 持续集成标准

### CI/CD 检查点
1. **语法检查**: ESLint 100% 通过
2. **类型检查**: TypeScript 无错误
3. **单元测试**: 100% 通过率
4. **覆盖率检查**: 100% 覆盖
5. **性能基准**: 符合性能标准
6. **内存检查**: 无内存泄漏

### 失败处理
- **测试失败**: 自动重试1次，仍失败则构建失败
- **覆盖率不足**: 构建失败，显示详细报告
- **性能下降**: 警告但不阻塞，需人工审查

## 🎯 质量门禁

### 代码合并要求
- ✅ 所有测试通过
- ✅ 覆盖率达到 100%
- ✅ 性能测试通过
- ✅ 代码审查通过
- ✅ 文档更新完整

### 发布前检查
- ✅ 端到端测试通过
- ✅ 兼容性测试通过  
- ✅ 安全性测试通过
- ✅ 压力测试通过
- ✅ 回归测试通过

---

**遵循这些标准，确保 Plugins 模块达到工业级代码质量！** 💪
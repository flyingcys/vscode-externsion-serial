# Phase 1-1: 环境兼容性修复

**优先级**: 🔴 紧急  
**预计工期**: 2天  
**负责模块**: 测试环境基础设施

## 🎯 目标

修复所有环境兼容性问题，确保测试能在Node.js环境中正确模拟浏览器API，解决67%的测试失败原因。

## 🔍 当前问题分析

### 主要错误类型
```
1. clearInterval is not defined (19个测试失败)
2. window.matchMedia is not a function (6个测试失败)  
3. DOM API缺失 (8个测试失败)
4. 浏览器存储API缺失 (3个测试失败)
```

### 影响范围
- **MemoryManager**: 38/57测试失败 → 67%通过率
- **可视化交互**: 22/28测试失败 → 21%通过率  
- **响应式布局**: 全部测试失败

## 📋 详细任务清单

### Task 1.1: 浏览器定时器API Mock (4小时)

**目标**: 修复clearInterval、setInterval等定时器API缺失问题

```typescript
// 在 utest/setup.ts 中添加
global.setInterval = vi.fn((fn, ms) => {
  return setTimeout(fn, ms);
});

global.clearInterval = vi.fn((id) => {
  clearTimeout(id);
});

global.setTimeout = vi.fn().mockImplementation(setTimeout);
global.clearTimeout = vi.fn().mockImplementation(clearTimeout);
```

**验证标准**: 
- MemoryManager-Real.test.ts 所有定时器相关测试通过
- 运行 `npm test utest/shared/MemoryManager-Real.test.ts` 0失败

### Task 1.2: DOM API Mock配置 (3小时)

**目标**: 提供window、document等DOM对象模拟

```typescript
// 安装 jsdom
npm install -D jsdom

// 在 vitest.config.mjs 中配置
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./utest/setup.ts'],
    globals: true
  }
});
```

**具体Mock对象**:
```typescript
// Window API Mock
global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// ResizeObserver Mock  
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

**验证标准**:
- 可视化交互测试中window API调用不再报错
- 响应式布局测试正常运行

### Task 1.3: 存储API Mock (2小时)

**目标**: 模拟localStorage、sessionStorage等存储API

```typescript
// Storage Mock
const createStorageMock = () => {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => storage.get(key) || null),
    setItem: vi.fn((key, value) => storage.set(key, value)),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
    get length() { return storage.size; },
    key: vi.fn((index) => Array.from(storage.keys())[index] || null)
  };
};

global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();
```

### Task 1.4: Performance API Mock (2小时)

**目标**: 模拟性能监控相关API

```typescript
// Performance API Mock
global.performance = {
  ...global.performance,
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  },
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  observer: vi.fn()
};

// PerformanceObserver Mock
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => [])
}));
```

## 🧪 测试验证计划

### 验证步骤
1. **修复后验证**:
   ```bash
   npm test utest/shared/MemoryManager-Real.test.ts
   npm test utest/visualization/Visualization-Interaction-Ultimate.test.ts
   ```

2. **回归测试**:
   ```bash
   npm test utest/extension/licensing/ 
   npm test utest/parsing/
   ```

3. **覆盖率验证**:
   ```bash
   npm run test:coverage:full
   ```

### 成功标准
- [x] clearInterval错误完全消除
- [x] window API错误完全消除  
- [x] MemoryManager测试通过率 67% → 95%+
- [x] 可视化交互测试通过率 21% → 80%+
- [x] 不影响现有通过的测试

## 🔧 实施指南

### 步骤1: 环境依赖安装
```bash
npm install -D jsdom @vitest/environment-jsdom
npm install -D @types/jsdom
```

### 步骤2: 配置文件修改
- 更新 `utest/vitest.config.mjs`
- 更新 `utest/setup.ts`  
- 创建 `utest/setup/browser-mocks.ts`

### 步骤3: 逐个API修复
按照Mock复杂度从低到高：
1. 简单函数Mock (setTimeout等)
2. 对象Mock (localStorage等)
3. 构造函数Mock (PerformanceObserver等)
4. 复杂API Mock (matchMedia等)

### 步骤4: 测试验证
每完成一类Mock就立即验证相关测试

## ⚠️ 注意事项

1. **兼容性**: 确保Mock不影响真实浏览器环境运行
2. **性能**: Mock对象应该轻量，不影响测试速度
3. **准确性**: Mock行为应尽量接近真实API
4. **维护性**: Mock代码应该模块化，便于后续维护

## 📊 预期收益

### 直接收益
- 修复33个失败测试 (clearInterval等问题)
- MemoryManager模块通过率提升28%
- 可视化交互模块通过率提升59%

### 间接收益  
- 为后续Vue组件测试打好基础
- 提升整体测试环境稳定性
- 减少开发者环境差异问题

## 🔄 后续优化

1. **Mock库标准化**: 考虑使用happy-dom或其他专业Mock库
2. **环境检测**: 添加环境兼容性自动检测
3. **Mock更新**: 定期更新Mock以匹配最新浏览器API

---
**文件状态**: ✅ 计划制定完成  
**执行状态**: 📋 等待执行  
**预计完成**: 2天内
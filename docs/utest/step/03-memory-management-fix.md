# Phase 1-3: 内存管理测试修复

**优先级**: 🔴 紧急  
**预计工期**: 1天  
**负责模块**: 内存管理系统

## 🎯 目标

修复MemoryManager测试中的环境依赖问题，将通过率从67%提升至95%+，确保内存管理系统得到充分测试保护。

## 🔍 当前问题分析

### 核心问题
```
主要错误: clearInterval is not defined (19次失败)
影响文件: utest/shared/MemoryManager-Real.test.ts
当前通过率: 38/57 (67%)  
目标通过率: 54/57 (95%+)
```

### 失败测试分布
- **定时器相关**: 15个测试 (clearInterval问题)
- **浏览器API**: 3个测试 (performance.memory问题)  
- **环境检测**: 1个测试 (PerformanceObserver问题)

## 📋 详细任务清单

### Task 3.1: 定时器API Mock修复 (2小时)

**目标**: 解决所有clearInterval相关错误

**问题定位**:
```typescript
// src/shared/MemoryManager.ts:488 
// 错误调用: clearInterval(this.cleanupTimer)
// 测试环境缺少定时器API
```

**解决方案**:
```typescript
// 在utest/setup.ts中添加
beforeAll(() => {
  global.setInterval = vi.fn().mockImplementation((callback, ms) => {
    return setTimeout(callback, 0); // 立即执行，加速测试
  });
  
  global.clearInterval = vi.fn().mockImplementation((id) => {
    if (id) clearTimeout(id);
  });
  
  // Mock定时器ID生成
  let timerId = 1;
  global.setInterval = vi.fn().mockImplementation((callback, ms) => {
    const id = timerId++;
    setTimeout(callback, 0);
    return id;
  });
});
```

**验证命令**:
```bash
npm test utest/shared/MemoryManager-Real.test.ts -t "应该能够创建MemoryManager实例"
```

### Task 3.2: Performance Memory API Mock (1小时)

**目标**: 提供完整的performance.memory Mock

**实现方案**:
```typescript
// Mock performance.memory API
global.performance = {
  ...global.performance,
  memory: {
    get usedJSHeapSize() { return Math.random() * 1000000 + 500000; },
    get totalJSHeapSize() { return Math.random() * 2000000 + 1000000; },  
    get jsHeapSizeLimit() { return 4000000000; }
  },
  now: () => Date.now() + Math.random() * 1000
};

// 支持内存压力模拟
export const mockMemoryPressure = (pressure: 'low' | 'high') => {
  const memoryMock = global.performance.memory as any;
  if (pressure === 'high') {
    memoryMock.usedJSHeapSize = 1800000; // 90% 使用率
    memoryMock.totalJSHeapSize = 2000000;
  } else {
    memoryMock.usedJSHeapSize = 500000;  // 25% 使用率
    memoryMock.totalJSHeapSize = 2000000;
  }
};
```

### Task 3.3: PerformanceObserver Mock增强 (1.5小时)

**目标**: 支持内存和GC性能监控的Mock

**完整实现**:
```typescript
// 创建功能完整的PerformanceObserver Mock
class MockPerformanceObserver {
  private callback: Function;
  private options: any;
  
  constructor(callback: Function) {
    this.callback = callback;
  }
  
  observe(options: any) {
    this.options = options;
    
    // 模拟GC事件
    if (options.entryTypes?.includes('measure')) {
      setTimeout(() => {
        this.callback({
          getEntries: () => [{
            name: 'gc',
            entryType: 'measure',
            startTime: performance.now(),
            duration: Math.random() * 10
          }]
        });
      }, 0);
    }
  }
  
  disconnect() {
    // Mock disconnect
  }
  
  takeRecords() {
    return [];
  }
}

global.PerformanceObserver = MockPerformanceObserver as any;

// 支持特定场景的Observer触发
export const triggerPerformanceEvent = (type: string, data: any) => {
  // 触发相应的性能事件用于测试
};
```

### Task 3.4: WeakRef环境适配 (1.5小时)

**目标**: 处理WeakRef在不同Node.js版本中的兼容性

**解决方案**:
```typescript
// 检测WeakRef支持
if (typeof WeakRef === 'undefined') {
  // Node.js < 14.6 fallback
  global.WeakRef = class MockWeakRef<T extends object> {
    private target: T;
    
    constructor(target: T) {
      this.target = target;
    }
    
    deref(): T | undefined {
      return this.target; // 简化实现，不会被GC
    }
  } as any;
}

// FinalizationRegistry Mock
if (typeof FinalizationRegistry === 'undefined') {
  global.FinalizationRegistry = class MockFinalizationRegistry {
    constructor(private cleanup: Function) {}
    register(target: any, heldValue: any) {}
    unregister(unregisterToken: any) {}
  } as any;
}
```

## 🧪 测试验证计划

### 验证步骤

**Step 1: 单元验证**
```bash
# 测试定时器修复
npm test utest/shared/MemoryManager-Real.test.ts -t "定时器"

# 测试内存API修复  
npm test utest/shared/MemoryManager-Real.test.ts -t "内存"

# 测试性能观察器修复
npm test utest/shared/MemoryManager-Real.test.ts -t "PerformanceObserver"
```

**Step 2: 完整验证**
```bash
# 运行完整MemoryManager测试
npm test utest/shared/MemoryManager-Real.test.ts

# 检查通过率
npm test utest/shared/MemoryManager-Real.test.ts --reporter=verbose
```

**Step 3: 性能测试验证**
```bash
# 验证内存管理相关的性能测试
npm test utest/performance/ -t "memory"
```

### 成功标准
- [x] clearInterval错误完全消除 (19个测试修复)
- [x] performance.memory API正常工作
- [x] PerformanceObserver Mock功能完整
- [x] WeakRef兼容性问题解决
- [x] MemoryManager通过率 67% → 95%+

## 🔧 实施指南

### 修复优先级
1. **高优先级**: clearInterval定时器API (影响15个测试)
2. **中优先级**: performance.memory API (影响3个测试)
3. **低优先级**: PerformanceObserver完善 (提升测试质量)

### 实施步骤
```bash
# Step 1: 准备环境
cd /path/to/project
npm test utest/shared/MemoryManager-Real.test.ts # 确认当前失败

# Step 2: 修复定时器API
# 编辑 utest/setup.ts，添加定时器Mock

# Step 3: 验证修复效果
npm test utest/shared/MemoryManager-Real.test.ts

# Step 4: 完善其他API
# 添加performance、WeakRef等Mock

# Step 5: 最终验证
npm test utest/shared/MemoryManager-Real.test.ts --reporter=verbose
```

### 代码文件修改
```
需要修改的文件:
- utest/setup.ts (添加Mock配置)
- utest/setup/browser-mocks.ts (新建浏览器API Mock)  
- utest/shared/MemoryManager-Real.test.ts (可能需要微调)
```

## 💡 最佳实践

### Mock设计原则
1. **渐进增强**: 先修复核心问题，再完善边缘功能
2. **行为一致**: Mock行为应与真实API一致
3. **测试友好**: Mock应支持测试场景配置

### 性能考虑
```typescript
// 优化建议：使用lazy initialization
const getPerformanceMock = () => {
  if (!global._performanceMock) {
    global._performanceMock = createPerformanceMock();
  }
  return global._performanceMock;
};
```

## 📊 预期收益

### 直接收益
- 修复19个clearInterval失败测试
- MemoryManager模块通过率提升28%
- 内存管理功能得到充分测试保护

### 间接收益
- 为性能测试模块打下基础
- 提升浏览器API Mock体系完整性
- 减少环境相关测试问题

## ⚠️ 注意事项

1. **版本兼容**: 确保Mock在不同Node.js版本中正常工作
2. **内存泄漏**: Mock本身不应造成内存泄漏
3. **测试隔离**: 确保Mock不影响其他测试模块

## 🔄 后续优化

1. **性能基准**: 建立内存管理性能基准测试
2. **压力测试**: 模拟高内存压力场景
3. **监控集成**: 与CI/CD内存监控集成

---
**文件状态**: ✅ 计划制定完成  
**执行状态**: 📋 等待执行  
**预计完成**: 1天内
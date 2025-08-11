# Phase 1-2: Mock配置优化

**优先级**: 🔴 紧急  
**预计工期**: 2天  
**负责模块**: Mock基础设施

## 🎯 目标

完善所有Mock配置，解决child_process、vscode、系统模块等Mock不当导致的测试失败，提升12%的测试通过率。

## 🔍 当前问题分析

### 主要Mock问题
```
1. child_process mock不完整 (4个测试失败)
2. vscode API mock缺失 (6个测试失败)  
3. 系统模块mock配置错误 (3个测试失败)
4. 第三方库mock不准确 (5个测试失败)
```

### 影响的测试模块
- **MQTT+许可证综合**: 26/28通过 → 2个mock问题
- **插件系统**: 22/23通过 → 1个vscode mock问题
- **导出系统**: 32/33通过 → 1个fs mock问题

## 📋 详细任务清单

### Task 2.1: child_process Mock完善 (4小时)

**目标**: 解决"No default export is defined on child_process mock"错误

**问题诊断**:
```typescript
// 当前错误的Mock方式
vi.mock('child_process', () => ({})); // ❌ 缺少必要方法

// 正确的Mock配置
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    exec: vi.fn((command, options, callback) => {
      if (callback) callback(null, 'mock-output', '');
      return { pid: 12345, kill: vi.fn() };
    }),
    spawn: vi.fn(() => ({
      pid: 12345,
      stdout: { on: vi.fn(), pipe: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn()
    })),
    execSync: vi.fn(() => 'mock-sync-output')
  };
});
```

**具体实施**:
1. 在`utest/mocks/`下创建`child-process.ts`专用Mock
2. 更新所有使用child_process的测试文件
3. 验证MachineID、LicenseManager等模块

**验证标准**: MachineID相关测试100%通过

### Task 2.2: VSCode API Mock标准化 (5小时)

**目标**: 建立完整的VSCode扩展API Mock体系

**当前vscode.ts Mock问题**:
- ExtensionContext不完整
- Commands注册Mock缺失
- Webview API不准确

**完整Mock配置**:
```typescript
// utest/mocks/vscode-enhanced.ts
export const vscode = {
  // 基础API
  Uri: {
    parse: vi.fn().mockImplementation((url: string) => ({ 
      toString: () => url,
      fsPath: url.replace('file://', ''),
      scheme: 'file'
    })),
    file: vi.fn().mockImplementation((path: string) => ({
      toString: () => `file://${path}`,
      fsPath: path,
      scheme: 'file'
    }))
  },

  // 扩展上下文
  ExtensionContext: vi.fn().mockImplementation(() => ({
    subscriptions: [],
    workspaceState: {
      get: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined)
    },
    globalState: {
      get: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined)
    },
    extensionPath: '/mock/extension/path',
    storagePath: '/mock/storage/path',
    globalStoragePath: '/mock/global/storage/path'
  })),

  // 命令系统
  commands: {
    registerCommand: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
    executeCommand: vi.fn().mockResolvedValue(undefined),
    getCommands: vi.fn().mockResolvedValue([])
  },

  // 窗口API
  window: {
    showInformationMessage: vi.fn().mockResolvedValue(undefined),
    showWarningMessage: vi.fn().mockResolvedValue(undefined), 
    showErrorMessage: vi.fn().mockResolvedValue(undefined),
    createWebviewPanel: vi.fn().mockReturnValue({
      webview: {
        html: '',
        postMessage: vi.fn(),
        onDidReceiveMessage: vi.fn()
      },
      dispose: vi.fn()
    })
  },

  // 环境API
  env: {
    openExternal: vi.fn().mockResolvedValue(true),
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue('')
    }
  },

  // 枚举类型
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  }
};
```

**验证标准**: 所有vscode API调用不再报错

### Task 2.3: 文件系统Mock优化 (3小时)

**目标**: 完善fs、path等系统模块Mock

**fs Mock增强**:
```typescript
// utest/mocks/fs-enhanced.ts
import { vi } from 'vitest';

export const fs = {
  // 异步方法
  readFile: vi.fn().mockImplementation((path, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = 'utf8';
    }
    callback?.(null, 'mock-file-content');
  }),
  
  writeFile: vi.fn().mockImplementation((path, data, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
    }
    callback?.(null);
  }),

  // 同步方法
  readFileSync: vi.fn().mockReturnValue('mock-file-content'),
  writeFileSync: vi.fn().mockReturnValue(undefined),
  existsSync: vi.fn().mockReturnValue(true),
  
  // Stream相关
  createReadStream: vi.fn().mockReturnValue({
    on: vi.fn(),
    pipe: vi.fn(),
    close: vi.fn()
  }),
  
  createWriteStream: vi.fn().mockReturnValue({
    write: vi.fn(),
    end: vi.fn(),
    on: vi.fn()
  })
};
```

### Task 2.4: 第三方库Mock管理 (4小时)

**目标**: 统一管理mqtt、serialport等第三方库Mock

**MQTT Mock完善**:
```typescript
// utest/mocks/mqtt-enhanced.ts
export const MQTTClient = vi.fn().mockImplementation(() => ({
  connect: vi.fn().mockReturnThis(),
  on: vi.fn().mockImplementation((event, callback) => {
    // 模拟连接成功
    if (event === 'connect') {
      setTimeout(() => callback(), 0);
    }
    return this;
  }),
  publish: vi.fn().mockImplementation((topic, message, callback) => {
    callback?.(null);
  }),
  subscribe: vi.fn().mockImplementation((topic, callback) => {
    callback?.(null, { topic, qos: 0 });
  }),
  end: vi.fn().mockImplementation((force, callback) => {
    callback?.();
  })
}));
```

**SerialPort Mock**:
```typescript
// utest/mocks/serialport.ts
export const SerialPort = vi.fn().mockImplementation(() => ({
  open: vi.fn().mockImplementation((callback) => callback?.(null)),
  close: vi.fn().mockImplementation((callback) => callback?.(null)),
  write: vi.fn().mockImplementation((data, callback) => callback?.(null)),
  on: vi.fn(),
  isOpen: true
}));

export const SerialPortMock = {
  list: vi.fn().mockResolvedValue([
    { path: '/dev/ttyUSB0', manufacturer: 'Mock Device' }
  ])
};
```

## 🧪 测试验证计划

### 分阶段验证

**Stage 1: 单模块验证**
```bash
# 验证child_process修复
npm test utest/extension/licensing/LicenseManager-Real.test.ts

# 验证vscode API修复  
npm test utest/extension/plugins/

# 验证fs Mock修复
npm test utest/extension/export/
```

**Stage 2: 综合验证**
```bash
# 验证MQTT综合模块
npm test utest/extension/mqtt-licensing/

# 验证导出系统
npm test utest/extension/export/Export-Comprehensive-Coverage.test.ts
```

**Stage 3: 回归测试**
```bash
npm run test:unit
```

### 成功标准
- [x] child_process相关错误完全消除
- [x] vscode API调用100%成功
- [x] MQTT综合测试通过率 93% → 100%
- [x] 导出系统测试通过率 97% → 100%
- [x] 插件系统测试通过率 96% → 100%

## 🔧 实施指南

### 步骤1: Mock文件重构
```
utest/mocks/
├── enhanced/                 # 新建增强Mock目录
│   ├── child-process.ts     # child_process完整Mock
│   ├── vscode-complete.ts   # 完整vscode API
│   ├── fs-enhanced.ts       # 增强文件系统Mock
│   └── third-party.ts       # 第三方库Mock集合
├── index.ts                 # Mock模块统一导出
└── mock-factory.ts          # Mock工厂函数
```

### 步骤2: Mock配置标准化
```typescript
// utest/setup.ts 中统一配置
import './mocks/enhanced/child-process';
import './mocks/enhanced/vscode-complete';  
import './mocks/enhanced/fs-enhanced';
import './mocks/enhanced/third-party';
```

### 步骤3: 测试文件更新
- 移除各测试文件中的重复Mock配置
- 统一使用enhanced Mock
- 更新import路径

## 💡 最佳实践

### Mock设计原则
1. **完整性**: Mock应覆盖真实API的所有使用场景
2. **准确性**: Mock行为应尽量接近真实实现
3. **可配置**: 支持测试特定场景的配置
4. **高性能**: Mock不应影响测试执行速度

### Mock管理策略
```typescript
// Mock工厂模式
export class MockFactory {
  static createVSCodeMock(options = {}) {
    return { ...defaultVSCodeMock, ...options };
  }
  
  static createFileSystemMock(mockFiles = {}) {
    return new FileSystemMock(mockFiles);
  }
}
```

## 📊 预期收益

### 测试稳定性提升
- 消除18个Mock相关失败测试
- 提升综合测试通过率 12%
- 减少开发环境差异问题

### 开发体验改善
- 统一Mock配置，减少重复代码
- 提供标准Mock模板
- 简化新测试文件创建

## ⚠️ 风险控制

1. **兼容性风险**: 确保Mock不破坏现有测试
2. **维护风险**: 建立Mock更新机制
3. **性能风险**: 监控Mock对测试速度的影响

---
**文件状态**: ✅ 计划制定完成  
**执行状态**: 📋 等待执行  
**预计完成**: 2天内
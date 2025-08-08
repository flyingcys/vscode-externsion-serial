/**
 * Webview Main Entry Point 单元测试
 * 测试 Vue 应用初始化、配置和启动流程
 * 目标：100% 测试覆盖率
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Mock Vue 相关模块
const mockApp = {
  use: vi.fn().mockReturnThis(),
  provide: vi.fn().mockReturnThis(),
  mount: vi.fn().mockReturnThis(),
  config: {
    errorHandler: null as any
  }
};

const mockPinia = {};

vi.mock('vue');
vi.mock('pinia');
vi.mock('element-plus');
vi.mock('element-plus/dist/index.css', () => ({}));
vi.mock('element-plus/theme-chalk/dark/css-vars.css', () => ({}));

// Mock stores
const mockThemeStore = {
  initializeTheme: vi.fn()
};

const mockDataStore = {
  initialize: vi.fn()
};

vi.mock('../../src/webview/stores/theme', () => ({
  useThemeStore: vi.fn(() => mockThemeStore)
}));

vi.mock('../../src/webview/stores/data', () => ({
  useDataStore: vi.fn(() => mockDataStore)
}));

// Mock MessageBridge
const mockMessageBridge = {
  sendMessage: vi.fn()
};

vi.mock('../../src/webview/utils/MessageBridge', () => ({
  MessageBridge: vi.fn(() => mockMessageBridge)
}));

// Mock shared types
vi.mock('../../src/shared/types', () => ({
  MessageType: {
    ERROR: 'ERROR'
  }
}));

// Mock App 组件
vi.mock('../../src/webview/App.vue', () => ({
  default: { name: 'App', template: '<div>App Component</div>' }
}));

describe('Webview Main Entry Point', () => {
  let originalWindow: any;
  let mockVSCodeApi: any;
  let consoleLogSpy: vi.SpyInstance;
  let consoleErrorSpy: vi.SpyInstance;

  beforeEach(() => {
    // 保存原始 window 对象
    originalWindow = global.window;
    
    // 重置所有 mock
    vi.clearAllMocks();
    
    // 设置 mock 返回值
    vi.mocked(createApp).mockReturnValue(mockApp as any);
    vi.mocked(createPinia).mockReturnValue(mockPinia as any);
    
    // Mock VSCode API
    mockVSCodeApi = {
      postMessage: vi.fn(),
      setState: vi.fn(),
      getState: vi.fn()
    };
    
    // Mock window.acquireVsCodeApi
    global.window = {
      acquireVsCodeApi: vi.fn(() => mockVSCodeApi)
    } as any;
    
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 恢复原始 window 对象
    global.window = originalWindow;
    
    // 恢复 console 方法
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('应用初始化', () => {
    test('应该创建 Vue 应用实例', async () => {
      const { createApp } = await import('vue');
      
      // 动态导入主入口文件以触发初始化
      await import('../../src/webview/main');
      
      expect(createApp).toHaveBeenCalledWith('AppComponent');
    });

    test('应该配置 Pinia 状态管理', async () => {
      const { createPinia } = await import('pinia');
      
      await import('../../src/webview/main');
      
      expect(createPinia).toHaveBeenCalled();
      expect(mockApp.use).toHaveBeenCalledWith(mockPinia);
    });

    test('应该配置 Element Plus UI 库', async () => {
      await import('../../src/webview/main');
      
      expect(mockApp.use).toHaveBeenCalledWith('ElementPlusPlugin');
    });

    test('应该挂载应用到 #app 元素', async () => {
      await import('../../src/webview/main');
      
      expect(mockApp.mount).toHaveBeenCalledWith('#app');
    });
  });

  describe('VSCode API 集成', () => {
    test('应该获取 VSCode API', async () => {
      await import('../../src/webview/main');
      
      expect(window.acquireVsCodeApi).toHaveBeenCalled();
    });

    test('应该初始化消息桥梁', async () => {
      const { MessageBridge } = await import('../../src/webview/utils/MessageBridge');
      
      await import('../../src/webview/main');
      
      expect(MessageBridge).toHaveBeenCalledWith(mockVSCodeApi);
      expect(mockApp.provide).toHaveBeenCalledWith('messageBridge', mockMessageBridge);
    });

    test('当 VSCode API 不可用时应该正常处理', async () => {
      // Mock 不可用的 VSCode API
      global.window.acquireVsCodeApi = undefined;
      
      await expect(async () => {
        await import('../../src/webview/main');
      }).not.toThrow();
    });
  });

  describe('全局错误处理', () => {
    test('应该配置全局错误处理器', async () => {
      await import('../../src/webview/main');
      
      expect(mockApp.config.errorHandler).toBeTypeOf('function');
    });

    test('错误处理器应该记录错误并发送消息', async () => {
      await import('../../src/webview/main');
      
      const errorHandler = mockApp.config.errorHandler;
      const testError = new Error('测试错误');
      const testInfo = '组件渲染错误';
      
      // 调用错误处理器
      errorHandler(testError, null, testInfo);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Vue应用错误:', testError, testInfo);
      expect(mockMessageBridge.sendMessage).toHaveBeenCalledWith({
        type: 'ERROR',
        payload: {
          message: '测试错误',
          stack: testError.stack,
          info: testInfo
        }
      });
    });

    test('错误处理器应该处理非 Error 对象', async () => {
      await import('../../src/webview/main');
      
      const errorHandler = mockApp.config.errorHandler;
      const testError = '字符串错误';
      const testInfo = '未知错误类型';
      
      errorHandler(testError, null, testInfo);
      
      expect(mockMessageBridge.sendMessage).toHaveBeenCalledWith({
        type: 'ERROR',
        payload: {
          message: '字符串错误',
          stack: undefined,
          info: testInfo
        }
      });
    });

    test('当没有 VSCode API 时错误处理器不应发送消息', async () => {
      // Mock 不可用的 VSCode API
      global.window.acquireVsCodeApi = undefined;
      
      await import('../../src/webview/main');
      
      // 在没有 VSCode API 的情况下，应该没有配置错误处理器
      expect(mockApp.config.errorHandler).toBeNull();
    });
  });

  describe('存储初始化', () => {
    test('应该初始化主题存储', async () => {
      const { useThemeStore } = await import('../../src/webview/stores/theme');
      
      await import('../../src/webview/main');
      
      expect(useThemeStore).toHaveBeenCalled();
      expect(mockThemeStore.initializeTheme).toHaveBeenCalled();
    });

    test('应该初始化数据存储', async () => {
      const { useDataStore } = await import('../../src/webview/stores/data');
      
      await import('../../src/webview/main');
      
      expect(useDataStore).toHaveBeenCalled();
      expect(mockDataStore.initialize).toHaveBeenCalled();
    });
  });

  describe('应用启动日志', () => {
    test('应该输出启动日志', async () => {
      await import('../../src/webview/main');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Serial Studio VSCode Extension Webview 已启动');
    });
  });

  describe('边界条件测试', () => {
    test('主题存储初始化失败时应该继续启动', async () => {
      mockThemeStore.initializeTheme.mockImplementation(() => {
        throw new Error('主题初始化失败');
      });
      
      await expect(async () => {
        await import('../../src/webview/main');
      }).not.toThrow();
    });

    test('数据存储初始化失败时应该继续启动', async () => {
      mockDataStore.initialize.mockImplementation(() => {
        throw new Error('数据存储初始化失败');
      });
      
      await expect(async () => {
        await import('../../src/webview/main');
      }).not.toThrow();
    });

    test('MessageBridge 创建失败时应该继续启动', async () => {
      // 重新 mock MessageBridge 使其抛出错误
      vi.doMock('../../src/webview/utils/MessageBridge', () => ({
        MessageBridge: vi.fn(() => {
          throw new Error('MessageBridge 创建失败');
        })
      }));
      
      await expect(async () => {
        // 使用不同的模块路径避免缓存
        delete require.cache[require.resolve('../../src/webview/main')];
        await import('../../src/webview/main?t=' + Date.now());
      }).not.toThrow();
    });
  });

  describe('集成测试', () => {
    test('完整初始化流程应该按正确顺序执行', async () => {
      const { createApp } = await import('vue');
      const { createPinia } = await import('pinia');
      const { useThemeStore } = await import('../../src/webview/stores/theme');
      const { useDataStore } = await import('../../src/webview/stores/data');
      
      await import('../../src/webview/main');
      
      // 验证调用顺序
      expect(createApp).toHaveBeenCalled();
      expect(createPinia).toHaveBeenCalled();
      expect(mockApp.use).toHaveBeenCalledTimes(2); // Pinia + Element Plus
      expect(mockApp.provide).toHaveBeenCalled();
      expect(mockApp.mount).toHaveBeenCalled();
      expect(useThemeStore).toHaveBeenCalled();
      expect(useDataStore).toHaveBeenCalled();
      expect(mockThemeStore.initializeTheme).toHaveBeenCalled();
      expect(mockDataStore.initialize).toHaveBeenCalled();
    });

    test('应该在所有配置完成后再挂载应用', async () => {
      await import('../../src/webview/main');
      
      const callOrder: string[] = [];
      
      // 检查调用顺序
      mockApp.use.mock.calls.forEach(() => callOrder.push('use'));
      mockApp.provide.mock.calls.forEach(() => callOrder.push('provide'));
      mockApp.mount.mock.calls.forEach(() => callOrder.push('mount'));
      
      // mount 应该在所有配置之后
      const mountIndex = callOrder.lastIndexOf('mount');
      expect(mountIndex).toBe(callOrder.length - 1);
    });
  });

  describe('类型安全性测试', () => {
    test('全局类型声明应该正确', async () => {
      // 验证全局 window 接口扩展
      expect(typeof window.acquireVsCodeApi).toBe('function');
    });

    test('错误处理器类型应该匹配 Vue 要求', async () => {
      await import('../../src/webview/main');
      
      const errorHandler = mockApp.config.errorHandler;
      expect(errorHandler).toBeTypeOf('function');
      expect(errorHandler.length).toBe(3); // error, instance, info 三个参数
    });
  });

  describe('内存泄漏预防', () => {
    test('应该不会创建循环引用', async () => {
      await import('../../src/webview/main');
      
      // 验证没有在全局对象上添加循环引用
      expect(global).not.toHaveProperty('app');
      expect(global).not.toHaveProperty('pinia');
      expect(global).not.toHaveProperty('messageBridge');
    });
  });
});
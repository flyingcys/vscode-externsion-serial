/**
 * Vue测试工具配置
 * 处理Vue组件的依赖注入和全局配置
 */

import { vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setupCommonMocks } from './common-mocks';

// 获取通用Mock
const { messageBridge, components, icons } = setupCommonMocks();

/**
 * 创建具有完整依赖注入的Vue组件挂载器
 */
export const createVueWrapper = (component: any, options: any = {}) => {
  const defaultOptions = {
    global: {
      provide: {
        messageBridge: messageBridge,
        // 添加其他可能需要的依赖注入
        $router: {
          push: vi.fn(),
          go: vi.fn(),
          back: vi.fn()
        },
        $route: {
          path: '/',
          query: {},
          params: {}
        }
      },
      plugins: [
        // Mock Pinia
        {
          install(app) {
            app.config.globalProperties.$pinia = {
              state: {},
              stores: new Map()
            };
            // 提供常用的stores
            app.provide('themeStore', {
              currentTheme: 'default',
              isDark: false,
              setTheme: vi.fn(),
              toggleDark: vi.fn()
            });
            app.provide('dataStore', {
              datasets: [],
              widgets: new Map(),
              addDataset: vi.fn(),
              updateDataset: vi.fn()
            });
            app.provide('connectionStore', {
              isConnected: false,
              status: 'disconnected',
              connect: vi.fn(),
              disconnect: vi.fn()
            });
          }
        }
      ],
      stubs: {
        // Element Plus组件
        ...components,
        // Element Plus图标
        ...icons,
        // 其他可能的Stub
        RouterLink: true,
        RouterView: true,
        // 添加常见的第三方组件Stub
        'el-input-number': true,
        'el-checkbox': true,
        'el-radio': true,
        'el-radio-group': true,
        'el-date-picker': true
      },
      mocks: {
        $t: (key: string) => key // i18n Mock
      },
      directives: {
        // 常用指令Mock
        loading: {},
        infinite: {}
      }
    },
    attachTo: document.body
  };

  // 深度合并选项
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
      provide: {
        ...defaultOptions.global.provide,
        ...options.global?.provide
      },
      stubs: {
        ...defaultOptions.global.stubs,
        ...options.global?.stubs
      }
    }
  };

  return mount(component, mergedOptions);
};

/**
 * 专门用于BaseWidget的挂载器
 */
export const mountBaseWidget = (props: any = {}, options: any = {}) => {
  // 动态导入BaseWidget以避免早期模块加载问题
  return import('@/webview/components/base/BaseWidget.vue').then(module => {
    const BaseWidget = module.default;
    return createVueWrapper(BaseWidget, {
      props,
      ...options
    });
  });
};

// 导出Mock对象供其他测试使用
export { messageBridge, components, icons };
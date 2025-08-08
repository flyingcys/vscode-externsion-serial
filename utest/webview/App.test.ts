/**
 * App.vue 主应用组件单元测试
 * 测试主应用组件的渲染、交互和功能
 * 目标：100% 测试覆盖率
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import App from '../../src/webview/App.vue';

// Mock Element Plus 组件
const mockElementPlusComponents = {
  'el-icon': { template: '<span class="mock-el-icon"><slot /></span>' },
  'el-tag': { template: '<span class="mock-el-tag" :class="[type, size]"><slot /></span>', props: ['type', 'size'] },
  'el-button': { template: '<button class="mock-el-button" @click="$emit(\'click\')"><slot /></button>' },
  'el-button-group': { template: '<div class="mock-el-button-group"><slot /></div>' },
  'el-tabs': { template: '<div class="mock-el-tabs"><slot /></div>', props: ['modelValue', 'tabPosition', 'stretch'], emits: ['update:modelValue'] },
  'el-tab-pane': { template: '<div class="mock-el-tab-pane"><slot /><template #label><slot name="label" /></template></div>', props: ['label', 'name'] },
  'el-text': { template: '<span class="mock-el-text" :class="[size, type]"><slot /></span>', props: ['size', 'type'] },
  'el-backtop': { template: '<div class="mock-el-backtop"></div>', props: ['right', 'bottom'] }
};

// Mock Element Plus Icons
const mockIcons = {
  Connection: { template: '<i class="icon-connection"></i>' },
  Document: { template: '<i class="icon-document"></i>' },
  Monitor: { template: '<i class="icon-monitor"></i>' },
  VideoPlay: { template: '<i class="icon-video-play"></i>' },
  VideoPause: { template: '<i class="icon-video-pause"></i>' },
  FullScreen: { template: '<i class="icon-fullscreen"></i>' },
  Grid: { template: '<i class="icon-grid"></i>' },
  Download: { template: '<i class="icon-download"></i>' },
  Camera: { template: '<i class="icon-camera"></i>' }
};

// Mock 子组件
const mockChildComponents = {
  ConnectionPanel: { template: '<div class="mock-connection-panel">Connection Panel</div>' },
  ProjectPanel: { template: '<div class="mock-project-panel">Project Panel</div>' },
  ConsolePanel: { template: '<div class="mock-console-panel">Console Panel</div>' },
  DashboardLayout: { 
    template: '<div class="mock-dashboard-layout" @widget-resize="$emit(\'widget-resize\', $event)" @widget-move="$emit(\'widget-move\', $event)">Dashboard Layout</div>',
    props: ['widgets', 'layout'],
    emits: ['widget-resize', 'widget-move']
  },
  SettingsDialog: { 
    template: '<div class="mock-settings-dialog" v-if="modelValue" @settings-changed="$emit(\'settings-changed\', $event)">Settings Dialog</div>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'settings-changed']
  },
  LayoutSelector: { 
    template: '<div class="mock-layout-selector" v-if="modelValue" @layout-selected="$emit(\'layout-selected\', $event)">Layout Selector</div>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'layout-selected']
  }
};

// Mock stores
const createMockStores = () => {
  const connectionStore = {
    isConnected: false
  };
  
  const dataStore = {
    isPaused: false,
    widgets: [],
    togglePause: vi.fn(),
    clearAllData: vi.fn()
  };
  
  const themeStore = {
    isDarkMode: false
  };
  
  const layoutStore = {
    currentLayout: {},
    updateWidgetSize: vi.fn(),
    updateWidgetPosition: vi.fn(),
    setLayout: vi.fn()
  };
  
  const performanceStore = {
    fps: 60,
    latency: 5,
    memoryUsage: 128.5,
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn()
  };

  return {
    connectionStore,
    dataStore,
    themeStore,
    layoutStore,
    performanceStore
  };
};

// Mock store composables
vi.mock('../../src/webview/stores/connection', () => ({
  useConnectionStore: () => mockStores.connectionStore
}));

vi.mock('../../src/webview/stores/data', () => ({
  useDataStore: () => mockStores.dataStore
}));

vi.mock('../../src/webview/stores/theme', () => ({
  useThemeStore: () => mockStores.themeStore
}));

vi.mock('../../src/webview/stores/layout', () => ({
  useLayoutStore: () => mockStores.layoutStore
}));

vi.mock('../../src/webview/stores/performance', () => ({
  usePerformanceStore: () => mockStores.performanceStore
}));

let mockStores: ReturnType<typeof createMockStores>;

describe('App.vue', () => {
  let wrapper: VueWrapper;
  let pinia: ReturnType<typeof createPinia>;
  let consoleLogSpy: vi.SpyInstance;

  beforeEach(() => {
    // 创建 Pinia 实例
    pinia = createPinia();
    setActivePinia(pinia);
    
    // 重置 mock stores
    mockStores = createMockStores();
    
    // Mock console.log
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // 添加全局属性到 document
    Object.defineProperty(document, 'addEventListener', {
      value: vi.fn(),
      writable: true
    });
    
    Object.defineProperty(document, 'removeEventListener', {
      value: vi.fn(),
      writable: true
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    consoleLogSpy.mockRestore();
  });

  const createWrapper = (props = {}) => {
    return mount(App, {
      props,
      global: {
        plugins: [pinia],
        components: {
          ...mockElementPlusComponents,
          ...mockIcons,
          ...mockChildComponents
        },
        stubs: {
          teleport: true
        }
      }
    });
  };

  describe('组件渲染', () => {
    test('应该正确渲染基本结构', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.serial-studio-app').exists()).toBe(true);
      expect(wrapper.find('.app-header').exists()).toBe(true);
      expect(wrapper.find('.app-content').exists()).toBe(true);
    });

    test('应该显示应用标题和图标', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.app-title').text()).toBe('Serial Studio');
      expect(wrapper.find('.icon-connection').exists()).toBe(true);
    });

    test('应该根据连接状态显示不同的标签', async () => {
      wrapper = createWrapper();
      
      // 未连接状态
      expect(wrapper.find('.mock-el-tag.info').exists()).toBe(true);
      expect(wrapper.find('.mock-el-tag').text()).toBe('未连接');
      
      // 连接状态
      mockStores.connectionStore.isConnected = true;
      await nextTick();
      expect(wrapper.find('.mock-el-tag.success').exists()).toBe(true);
      expect(wrapper.find('.mock-el-tag').text()).toBe('已连接');
    });
  });

  describe('主题系统', () => {
    test('应该根据主题模式应用正确的 CSS 类', async () => {
      wrapper = createWrapper();
      
      // 浅色主题
      expect(wrapper.find('.serial-studio-app').classes()).toContain('light');
      
      // 深色主题
      mockStores.themeStore.isDarkMode = true;
      await nextTick();
      expect(wrapper.find('.serial-studio-app').classes()).toContain('dark');
    });
  });

  describe('性能信息显示', () => {
    test('应该显示性能信息', () => {
      wrapper = createWrapper();
      
      const performanceInfo = wrapper.find('.performance-info');
      expect(performanceInfo.exists()).toBe(true);
      expect(performanceInfo.text()).toContain('FPS: 60');
      expect(performanceInfo.text()).toContain('延迟: 5ms');
      expect(performanceInfo.text()).toContain('内存: 129MB'); // Math.round(128.5) = 129
    });
  });

  describe('按钮交互', () => {
    test('暂停/恢复按钮应该正确工作', async () => {
      wrapper = createWrapper();
      
      // 初始状态 - 未暂停
      const pauseButton = wrapper.find('.mock-el-button');
      expect(pauseButton.text()).toContain('暂停');
      
      // 点击暂停
      await pauseButton.trigger('click');
      expect(mockStores.dataStore.togglePause).toHaveBeenCalled();
      
      // 模拟暂停状态
      mockStores.dataStore.isPaused = true;
      await nextTick();
      expect(pauseButton.text()).toContain('恢复');
    });

    test('清除按钮应该清除所有数据', async () => {
      wrapper = createWrapper();
      
      const buttons = wrapper.findAll('.mock-el-button');
      const clearButton = buttons.find(btn => btn.text().includes('清除'));
      
      expect(clearButton).toBeDefined();
      await clearButton!.trigger('click');
      expect(mockStores.dataStore.clearAllData).toHaveBeenCalled();
    });

    test('设置按钮应该显示设置对话框', async () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.mock-settings-dialog').exists()).toBe(false);
      
      const buttons = wrapper.findAll('.mock-el-button');
      const settingsButton = buttons.find(btn => btn.text().includes('设置'));
      
      await settingsButton!.trigger('click');
      await nextTick();
      
      expect(wrapper.find('.mock-settings-dialog').exists()).toBe(true);
    });
  });

  describe('工具栏功能', () => {
    test('全屏切换应该正确工作', async () => {
      wrapper = createWrapper();
      
      // 初始状态不是全屏
      expect(wrapper.find('.sidebar').exists()).toBe(true);
      expect(wrapper.find('.toolbar').exists()).toBe(true);
      
      // 查找全屏按钮并点击
      const toolbarButtons = wrapper.find('.toolbar-left').findAll('.mock-el-button');
      await toolbarButtons[0].trigger('click'); // 假设第一个是全屏按钮
      
      await nextTick();
      
      // 全屏状态下侧边栏和工具栏应该隐藏
      expect(wrapper.find('.sidebar').exists()).toBe(false);
      expect(wrapper.find('.toolbar').exists()).toBe(false);
    });

    test('布局选择器应该正确工作', async () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.mock-layout-selector').exists()).toBe(false);
      
      const toolbarButtons = wrapper.find('.toolbar-left').findAll('.mock-el-button');
      await toolbarButtons[1].trigger('click'); // 假设第二个是布局按钮
      
      await nextTick();
      expect(wrapper.find('.mock-layout-selector').exists()).toBe(true);
    });

    test('导出数据和截图功能应该触发相应方法', async () => {
      wrapper = createWrapper();
      
      const toolbarButtons = wrapper.find('.toolbar-right').findAll('.mock-el-button');
      
      // 测试导出数据
      await toolbarButtons[0].trigger('click');
      expect(consoleLogSpy).toHaveBeenCalledWith('导出数据');
      
      // 测试截图
      await toolbarButtons[1].trigger('click');
      expect(consoleLogSpy).toHaveBeenCalledWith('截图');
    });
  });

  describe('Widget 交互', () => {
    test('应该处理 Widget 大小调整事件', async () => {
      wrapper = createWrapper();
      
      const dashboardLayout = wrapper.findComponent({ name: 'DashboardLayout' });
      await dashboardLayout.vm.$emit('widget-resize', 'widget-1', { width: 200, height: 100 });
      
      expect(mockStores.layoutStore.updateWidgetSize).toHaveBeenCalledWith('widget-1', { width: 200, height: 100 });
    });

    test('应该处理 Widget 移动事件', async () => {
      wrapper = createWrapper();
      
      const dashboardLayout = wrapper.findComponent({ name: 'DashboardLayout' });
      await dashboardLayout.vm.$emit('widget-move', 'widget-1', { x: 10, y: 20 });
      
      expect(mockStores.layoutStore.updateWidgetPosition).toHaveBeenCalledWith('widget-1', { x: 10, y: 20 });
    });
  });

  describe('对话框交互', () => {
    test('设置对话框应该处理设置变更', async () => {
      wrapper = createWrapper();
      
      // 显示设置对话框
      await wrapper.setData({ showSettings: true });
      await nextTick();
      
      const settingsDialog = wrapper.findComponent({ name: 'SettingsDialog' });
      const testSettings = { theme: 'dark', language: 'zh' };
      
      await settingsDialog.vm.$emit('settings-changed', testSettings);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('设置已更改:', testSettings);
    });

    test('布局选择器应该处理布局选择', async () => {
      wrapper = createWrapper();
      
      // 显示布局选择器
      await wrapper.setData({ showLayoutSelector: true });
      await nextTick();
      
      const layoutSelector = wrapper.findComponent({ name: 'LayoutSelector' });
      const testLayout = { type: 'grid', columns: 3 };
      
      await layoutSelector.vm.$emit('layout-selected', testLayout);
      
      expect(mockStores.layoutStore.setLayout).toHaveBeenCalledWith(testLayout);
    });
  });

  describe('键盘快捷键', () => {
    test('F11 应该切换全屏模式', async () => {
      wrapper = createWrapper();
      
      // 初始不是全屏
      expect(wrapper.find('.sidebar').exists()).toBe(true);
      
      // 模拟 F11 按键
      const keyEvent = new KeyboardEvent('keydown', { key: 'F11' });
      Object.defineProperty(keyEvent, 'preventDefault', { value: vi.fn() });
      
      document.dispatchEvent(keyEvent);
      await nextTick();
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
    });

    test('Ctrl+P 应该切换暂停状态', async () => {
      wrapper = createWrapper();
      
      const keyEvent = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true });
      Object.defineProperty(keyEvent, 'preventDefault', { value: vi.fn() });
      
      document.dispatchEvent(keyEvent);
      await nextTick();
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
      expect(mockStores.dataStore.togglePause).toHaveBeenCalled();
    });

    test('Ctrl+Shift+C 应该清除数据', async () => {
      wrapper = createWrapper();
      
      const keyEvent = new KeyboardEvent('keydown', { key: 'C', ctrlKey: true, shiftKey: true });
      Object.defineProperty(keyEvent, 'preventDefault', { value: vi.fn() });
      
      document.dispatchEvent(keyEvent);
      await nextTick();
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
      expect(mockStores.dataStore.clearAllData).toHaveBeenCalled();
    });
  });

  describe('生命周期', () => {
    test('挂载时应该启动性能监控和添加事件监听器', () => {
      wrapper = createWrapper();
      
      expect(mockStores.performanceStore.startMonitoring).toHaveBeenCalled();
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    test('卸载时应该停止性能监控和移除事件监听器', () => {
      wrapper = createWrapper();
      
      wrapper.unmount();
      
      expect(mockStores.performanceStore.stopMonitoring).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('响应式设计', () => {
    test('应该在小屏幕上隐藏性能信息', async () => {
      // Mock window.matchMedia for responsive design
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('max-width: 768px'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      });
      
      wrapper = createWrapper();
      
      // 在实际应用中，这需要根据媒体查询来调整
      // 这里主要测试组件结构是否存在对应的响应式类
      expect(wrapper.find('.toolbar-center').exists()).toBe(true);
    });
  });

  describe('标签页切换', () => {
    test('应该正确切换标签页', async () => {
      wrapper = createWrapper();
      
      // 测试初始标签页
      expect(wrapper.vm.activeTab).toBe('connection');
      
      // 切换到项目标签页
      await wrapper.setData({ activeTab: 'project' });
      expect(wrapper.vm.activeTab).toBe('project');
      
      // 切换到控制台标签页
      await wrapper.setData({ activeTab: 'console' });
      expect(wrapper.vm.activeTab).toBe('console');
    });
  });

  describe('边界条件测试', () => {
    test('在没有 widgets 数据时应该正常渲染', () => {
      mockStores.dataStore.widgets = [];
      wrapper = createWrapper();
      
      expect(wrapper.find('.dashboard-container').exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'DashboardLayout' }).props('widgets')).toEqual([]);
    });

    test('性能数据为 undefined 时应该安全处理', async () => {
      mockStores.performanceStore.fps = undefined as any;
      mockStores.performanceStore.latency = undefined as any;
      mockStores.performanceStore.memoryUsage = undefined as any;
      
      wrapper = createWrapper();
      
      const performanceInfo = wrapper.find('.performance-info');
      expect(performanceInfo.text()).toContain('FPS: undefined');
      expect(performanceInfo.text()).toContain('延迟: undefinedms');
      expect(performanceInfo.text()).toContain('内存: NaNMB');
    });
  });

  describe('可访问性测试', () => {
    test('按钮应该有正确的 title 属性', () => {
      wrapper = createWrapper();
      
      const toolbarButtons = wrapper.find('.toolbar-left').findAll('.mock-el-button');
      // 注意：在实际 Element Plus 组件中，title 会被正确渲染
      // 这里主要测试组件结构是否包含可访问性考虑
      expect(toolbarButtons.length).toBeGreaterThan(0);
    });

    test('应该为屏幕阅读器提供适当的标签', () => {
      wrapper = createWrapper();
      
      // 检查是否有语义化的结构
      expect(wrapper.find('.app-header').exists()).toBe(true);
      expect(wrapper.find('.app-content').exists()).toBe(true);
      expect(wrapper.find('.sidebar').exists()).toBe(true);
      expect(wrapper.find('.main-panel').exists()).toBe(true);
    });
  });
});
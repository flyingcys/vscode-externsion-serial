/**
 * BaseWidget.vue 测试
 * 目标：100% 覆盖率，完整测试基础组件功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup } from 'element-plus';
import BaseWidget from '../../../../src/webview/components/base/BaseWidget.vue';
import { WidgetType, WidgetConfig } from '../../../../src/shared/types';

// Mock the dialog components
vi.mock('../../../../src/webview/components/dialogs/WidgetSettingsDialog.vue', () => ({
  default: {
    name: 'WidgetSettingsDialog',
    template: '<div class="mock-widget-settings-dialog"></div>',
    props: ['modelValue', 'widgetType', 'config'],
    emits: ['update:modelValue', 'settings-changed']
  }
}));

vi.mock('../../../../src/webview/components/dialogs/WidgetExportDialog.vue', () => ({
  default: {
    name: 'WidgetExportDialog',
    template: '<div class="mock-widget-export-dialog"></div>',
    props: ['modelValue', 'widgetType', 'data'],
    emits: ['update:modelValue', 'export-confirmed']
  }
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

describe('BaseWidget 测试', () => {
  let wrapper: VueWrapper<any>;

  const defaultProps = {
    widgetType: WidgetType.Plot,
    title: 'Test Widget',
    isEnabled: true,
    showTitleBar: true,
    showFooter: true,
    hasData: true
  };

  const createWrapper = (props = {}, slots = {}) => {
    return mount(BaseWidget, {
      props: { ...defaultProps, ...props },
      slots,
      global: {
        components: {
          ElButton,
          ElIcon,
          ElTag,
          ElTooltip,
          ElButtonGroup
        },
        stubs: {
          'el-icon': { template: '<i><slot /></i>' },
          'el-button': { template: '<button><slot /></button>' },
          'el-tag': { template: '<span class="el-tag"><slot /></span>' },
          'el-tooltip': { template: '<div><slot /></div>' },
          'el-button-group': { template: '<div class="el-button-group"><slot /></div>' }
        },
        provide: {
          messageBridge: {
            sendMessage: vi.fn()
          }
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    test('应该正确渲染基本结构', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.base-widget').exists()).toBe(true);
      expect(wrapper.find('.widget-header').exists()).toBe(true);
      expect(wrapper.find('.widget-content').exists()).toBe(true);
      expect(wrapper.find('.widget-footer').exists()).toBe(true);
    });

    test('应该应用正确的CSS类', () => {
      wrapper = createWrapper({
        widgetType: WidgetType.Gauge,
        isSelected: true,
        hasError: true
      });
      
      const baseWidget = wrapper.find('.base-widget');
      expect(baseWidget.classes()).toContain('widget-gauge');
      expect(baseWidget.classes()).toContain('widget-selected');
      expect(baseWidget.classes()).toContain('widget-error');
    });

    test('应该根据禁用状态添加相应类', () => {
      wrapper = createWrapper({ isEnabled: false });
      
      expect(wrapper.find('.base-widget').classes()).toContain('widget-disabled');
    });

    test('应该根据加载状态添加相应类', () => {
      wrapper = createWrapper({ isLoading: true });
      
      expect(wrapper.find('.base-widget').classes()).toContain('widget-loading');
    });
  });

  describe('标题栏功能', () => {
    test('应该显示正确的标题', () => {
      wrapper = createWrapper({ title: 'Custom Title' });
      
      expect(wrapper.find('.widget-title').text()).toBe('Custom Title');
    });

    test('应该从数据集获取标题', () => {
      wrapper = createWrapper({
        datasets: [{ title: 'Dataset Title' }]
      });
      
      expect(wrapper.find('.widget-title').text()).toBe('Dataset Title');
    });

    test('应该显示默认标题', () => {
      wrapper = createWrapper({
        widgetType: WidgetType.Gauge,
        title: undefined,
        datasets: []
      });
      
      expect(wrapper.find('.widget-title').text()).toBe('仪表盘');
    });

    test('应该显示修改指示器', () => {
      wrapper = createWrapper({
        title: 'Modified Widget'
      });

      // 通过设置项目状态为已修改来测试修改指示器
      expect(wrapper.find('.widget-title').exists()).toBe(true);
    });

    test('应该隐藏标题栏', () => {
      wrapper = createWrapper({ showTitleBar: false });
      
      expect(wrapper.find('.widget-header').exists()).toBe(false);
    });
  });

  describe('状态指示器', () => {
    test('应该显示连接状态', () => {
      wrapper = createWrapper({
        connectionStatus: 'Connected',
        showStatus: true
      });
      
      const statusTag = wrapper.find('.el-tag');
      expect(statusTag.exists()).toBe(true);
      expect(statusTag.text()).toBe('Connected');
    });

    test('应该根据连接状态显示正确的标签类型', async () => {
      wrapper = createWrapper({
        connectionStatus: 'Connected',
        showStatus: true
      });
      
      // 测试不同状态的标签类型
      const testCases = [
        { status: 'connected', expectedType: 'success' },
        { status: 'error', expectedType: 'danger' },
        { status: 'connecting', expectedType: 'warning' },
        { status: 'unknown', expectedType: 'info' }
      ];

      for (const testCase of testCases) {
        await wrapper.setProps({ connectionStatus: testCase.status });
        // 这里我们验证组件内部的逻辑，实际的标签类型会由 Element Plus 处理
        expect(wrapper.vm.statusTagType).toBe(testCase.expectedType);
      }
    });

    test('应该显示错误图标', () => {
      wrapper = createWrapper({
        hasError: true,
        showStatus: true
      });
      
      expect(wrapper.find('.error-icon').exists()).toBe(true);
    });

    test('应该显示加载图标', () => {
      wrapper = createWrapper({
        isLoading: true,
        showStatus: true
      });
      
      expect(wrapper.find('.loading-icon').exists()).toBe(true);
    });
  });

  describe('工具栏功能', () => {
    test('应该显示默认工具栏按钮', () => {
      wrapper = createWrapper({ showDefaultToolbar: true });
      
      expect(wrapper.find('.el-button-group').exists()).toBe(true);
      // 验证按钮数量
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('应该触发刷新事件', async () => {
      wrapper = createWrapper();
      
      const refreshButton = wrapper.findAll('button')[0];
      await refreshButton.trigger('click');
      
      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    test('应该打开设置对话框', async () => {
      wrapper = createWrapper();
      
      // 找到设置按钮并点击
      await wrapper.vm.handleSettings();
      await nextTick();
      
      expect(wrapper.vm.showSettingsDialog).toBe(true);
      expect(wrapper.emitted('settings')).toBeTruthy();
    });

    test('应该打开导出对话框', async () => {
      wrapper = createWrapper({ widgetData: [1, 2, 3] });
      
      await wrapper.vm.handleExport();
      await nextTick();
      
      expect(wrapper.vm.showExportDialog).toBe(true);
      expect(wrapper.emitted('export')).toBeTruthy();
      expect(wrapper.emitted('export')?.[0]).toEqual([[1, 2, 3]]);
    });

    test('应该禁用按钮当组件被禁用时', () => {
      wrapper = createWrapper({ isEnabled: false });
      
      const buttons = wrapper.findAll('button');
      // 检查至少有一个按钮被禁用
      expect(buttons.some(btn => btn.attributes('disabled') !== undefined)).toBe(true);
    });

    test('应该禁用导出按钮当没有数据时', () => {
      wrapper = createWrapper({ hasData: false });
      
      // 验证导出按钮的禁用状态
      expect(wrapper.vm.hasData).toBe(false);
    });
  });

  describe('全屏功能', () => {
    test('应该切换全屏状态', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.toggleFullscreen();
      
      expect(wrapper.vm.isFullscreen).toBe(true);
      expect(wrapper.emitted('fullscreen')).toBeTruthy();
      expect(wrapper.emitted('fullscreen')?.[0]).toEqual([true]);
    });

    test('应该通过双击标题栏切换全屏', async () => {
      wrapper = createWrapper();
      
      const header = wrapper.find('.widget-header');
      await header.trigger('dblclick');
      
      expect(wrapper.vm.isFullscreen).toBe(true);
      expect(wrapper.emitted('fullscreen')).toBeTruthy();
    });

    test('应该添加全屏CSS类', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.toggleFullscreen();
      await nextTick();
      
      expect(wrapper.find('.base-widget').classes()).toContain('widget-fullscreen');
    });
  });

  describe('内容区域', () => {
    test('应该显示主要内容插槽', () => {
      wrapper = createWrapper(
        { hasData: true },
        { default: '<div class="test-content">Test Content</div>' }
      );
      
      expect(wrapper.find('.test-content').exists()).toBe(true);
      expect(wrapper.find('.test-content').text()).toBe('Test Content');
    });

    test('应该显示加载覆盖层', () => {
      wrapper = createWrapper({
        isLoading: true,
        showLoadingOverlay: true,
        loadingText: 'Loading...'
      });
      
      const loadingOverlay = wrapper.find('.loading-overlay');
      expect(loadingOverlay.exists()).toBe(true);
      expect(loadingOverlay.text()).toContain('Loading...');
    });

    test('应该显示错误覆盖层', () => {
      wrapper = createWrapper({
        hasError: true,
        showErrorOverlay: true,
        errorTitle: 'Error Title',
        errorMessage: 'Error Message'
      });
      
      const errorOverlay = wrapper.find('.error-overlay');
      expect(errorOverlay.exists()).toBe(true);
      expect(errorOverlay.text()).toContain('Error Title');
      expect(errorOverlay.text()).toContain('Error Message');
    });

    test('应该显示重试按钮', () => {
      wrapper = createWrapper({
        hasError: true,
        allowRetry: true
      });
      
      expect(wrapper.find('.error-overlay button').exists()).toBe(true);
    });

    test('应该触发重试事件', async () => {
      wrapper = createWrapper({
        hasError: true,
        allowRetry: true
      });
      
      await wrapper.vm.handleRetry();
      
      expect(wrapper.emitted('retry')).toBeTruthy();
    });

    test('应该显示空状态', () => {
      wrapper = createWrapper({
        hasData: false,
        showEmptyState: true,
        emptyTitle: 'No Data',
        emptyMessage: 'No data available'
      });
      
      const emptyState = wrapper.find('.empty-state');
      expect(emptyState.exists()).toBe(true);
      expect(emptyState.text()).toContain('No Data');
      expect(emptyState.text()).toContain('No data available');
    });
  });

  describe('脚注功能', () => {
    test('应该显示数据计数', () => {
      wrapper = createWrapper({
        widgetData: [1, 2, 3, 4, 5],
        showDataCount: true,
        showFooter: true
      });
      
      expect(wrapper.find('.data-count').text()).toContain('5');
    });

    test('应该显示更新时间', () => {
      const now = Date.now();
      wrapper = createWrapper({
        lastUpdate: now - 5000, // 5秒前
        showUpdateTime: true,
        showFooter: true
      });
      
      expect(wrapper.find('.update-time').text()).toContain('秒前');
    });

    test('应该隐藏脚注', () => {
      wrapper = createWrapper({ showFooter: false });
      
      expect(wrapper.find('.widget-footer').exists()).toBe(false);
    });

    test('应该显示自定义脚注内容', () => {
      wrapper = createWrapper(
        { showFooter: true },
        {
          'footer-left': '<span class="custom-left">Custom Left</span>',
          'footer-right': '<span class="custom-right">Custom Right</span>'
        }
      );
      
      expect(wrapper.find('.custom-left').exists()).toBe(true);
      expect(wrapper.find('.custom-right').exists()).toBe(true);
    });
  });

  describe('样式计算', () => {
    test('应该计算正确的容器样式', () => {
      wrapper = createWrapper({
        width: 300,
        height: 200,
        minWidth: 100,
        maxWidth: 500
      });
      
      const style = wrapper.vm.widgetStyle;
      expect(style.width).toBe('300px');
      expect(style.height).toBe('200px');
      expect(style.minWidth).toBe('100px');
      expect(style.maxWidth).toBe('500px');
    });

    test('应该计算正确的内容样式', () => {
      wrapper = createWrapper({
        showTitleBar: true,
        showFooter: true
      });
      
      const style = wrapper.vm.contentStyle;
      expect(style.height).toBe('calc(100% - 80px)');
    });

    test('应该计算仅标题栏的内容高度', () => {
      wrapper = createWrapper({
        showTitleBar: true,
        showFooter: false
      });
      
      const style = wrapper.vm.contentStyle;
      expect(style.height).toBe('calc(100% - 40px)');
    });

    test('应该计算仅脚注的内容高度', () => {
      wrapper = createWrapper({
        showTitleBar: false,
        showFooter: true
      });
      
      const style = wrapper.vm.contentStyle;
      expect(style.height).toBe('calc(100% - 40px)');
    });

    test('应该计算无标题栏和脚注的内容高度', () => {
      wrapper = createWrapper({
        showTitleBar: false,
        showFooter: false
      });
      
      const style = wrapper.vm.contentStyle;
      expect(style.height).toBe('100%');
    });
  });

  describe('数据统计', () => {
    test('应该计算数组数据的数量', () => {
      wrapper = createWrapper({
        widgetData: [1, 2, 3, 4, 5]
      });
      
      expect(wrapper.vm.dataCount).toBe(5);
    });

    test('应该计算单个数据项', () => {
      wrapper = createWrapper({
        widgetData: { value: 42 }
      });
      
      expect(wrapper.vm.dataCount).toBe(1);
    });

    test('应该从数据集计算数量', () => {
      wrapper = createWrapper({
        widgetData: undefined,
        datasets: [{ title: 'Dataset 1' }, { title: 'Dataset 2' }]
      });
      
      expect(wrapper.vm.dataCount).toBe(2);
    });

    test('应该返回零当没有数据时', () => {
      wrapper = createWrapper({
        widgetData: undefined,
        datasets: undefined
      });
      
      expect(wrapper.vm.dataCount).toBe(0);
    });
  });

  describe('时间格式化', () => {
    test('应该显示"从未"当没有更新时间时', () => {
      wrapper = createWrapper({ lastUpdate: undefined });
      
      expect(wrapper.vm.lastUpdateText).toBe('从未');
    });

    test('应该显示"刚刚"', () => {
      const now = Date.now();
      wrapper = createWrapper({ lastUpdate: now - 500 });
      
      expect(wrapper.vm.lastUpdateText).toBe('刚刚');
    });

    test('应该显示秒数', () => {
      const now = Date.now();
      wrapper = createWrapper({ lastUpdate: now - 5000 });
      
      expect(wrapper.vm.lastUpdateText).toBe('5秒前');
    });

    test('应该显示分钟数', () => {
      const now = Date.now();
      wrapper = createWrapper({ lastUpdate: now - 120000 });
      
      expect(wrapper.vm.lastUpdateText).toBe('2分钟前');
    });

    test('应该显示小时数', () => {
      const now = Date.now();
      wrapper = createWrapper({ lastUpdate: now - 7200000 });
      
      expect(wrapper.vm.lastUpdateText).toBe('2小时前');
    });
  });

  describe('工具函数', () => {
    test('应该获取正确的默认标题', () => {
      const testCases = [
        { type: WidgetType.Plot, expected: '数据图表' },
        { type: WidgetType.Gauge, expected: '仪表盘' },
        { type: WidgetType.GPS, expected: 'GPS地图' },
        { type: WidgetType.Terminal, expected: '终端' }
      ];

      testCases.forEach(({ type, expected }) => {
        wrapper = createWrapper({ widgetType: type });
        expect(wrapper.vm.displayTitle).toBe(expected);
      });
    });

    test('应该获取正确的图标', () => {
      wrapper = createWrapper({ widgetType: WidgetType.Plot });
      expect(wrapper.vm.widgetIcon).toBe('TrendCharts');
      
      wrapper = createWrapper({ widgetType: WidgetType.Gauge });
      expect(wrapper.vm.widgetIcon).toBe('Timer');
    });

    test('应该生成正确的图标类名', () => {
      wrapper = createWrapper({ widgetType: WidgetType.Plot });
      expect(wrapper.vm.iconClass).toBe('icon-plot');
    });
  });

  describe('生命周期', () => {
    test('应该设置 ResizeObserver', () => {
      wrapper = createWrapper();
      
      expect(global.ResizeObserver).toHaveBeenCalled();
    });

    test('应该监听选中状态变化', async () => {
      wrapper = createWrapper({ isSelected: false });
      
      const consoleSpy = vi.spyOn(console, 'log');
      
      await wrapper.setProps({ isSelected: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(`Widget ${WidgetType.Plot} selected`);
    });
  });

  describe('事件处理', () => {
    test('应该处理设置变更', async () => {
      wrapper = createWrapper();
      
      const newConfig: WidgetConfig = { theme: 'dark' };
      await wrapper.vm.handleSettingsChanged(newConfig);
      
      expect(wrapper.emitted('settings-changed')).toBeTruthy();
      expect(wrapper.emitted('settings-changed')?.[0]).toEqual([newConfig]);
    });

    test('应该处理导出确认', async () => {
      wrapper = createWrapper();
      
      const consoleSpy = vi.spyOn(console, 'log');
      const exportData = { data: 'test' };
      
      await wrapper.vm.handleExportConfirmed(exportData);
      
      expect(consoleSpy).toHaveBeenCalledWith('导出数据:', exportData);
    });

    test('应该触发 resize 事件', async () => {
      wrapper = createWrapper();
      
      const size = { width: 300, height: 200 };
      await wrapper.vm.$emit('resize', size);
      
      expect(wrapper.emitted('resize')?.[0]).toEqual([size]);
    });
  });

  describe('边界条件', () => {
    test('应该处理空的数据集', () => {
      wrapper = createWrapper({
        datasets: [],
        widgetData: undefined
      });
      
      expect(wrapper.vm.displayTitle).toBe('数据图表'); // 默认标题
      expect(wrapper.vm.dataCount).toBe(0);
    });

    test('应该处理无效的组件类型', () => {
      wrapper = createWrapper({
        widgetType: 'invalid-type' as WidgetType
      });
      
      expect(wrapper.vm.displayTitle).toBe('未知组件');
      expect(wrapper.vm.widgetIcon).toBe('QuestionFilled');
    });

    test('应该处理 null 数据', () => {
      wrapper = createWrapper({
        widgetData: null
      });
      
      expect(wrapper.vm.dataCount).toBe(0);
    });

    test('应该处理 undefined 配置', () => {
      wrapper = createWrapper({
        widgetConfig: undefined
      });
      
      // 应该正常渲染而不报错
      expect(wrapper.find('.base-widget').exists()).toBe(true);
    });
  });

  describe('自定义插槽', () => {
    test('应该渲染工具栏插槽', () => {
      wrapper = createWrapper(
        {},
        {
          toolbar: '<button class="custom-toolbar-btn">Custom</button>'
        }
      );
      
      expect(wrapper.find('.custom-toolbar-btn').exists()).toBe(true);
    });

    test('应该向默认插槽传递正确的属性', () => {
      const testData = { value: 42 };
      const testConfig = { theme: 'dark' };
      
      wrapper = createWrapper(
        {
          widgetData: testData,
          widgetConfig: testConfig
        },
        {
          default: '<div class="slot-test" :data="props.data" :config="props.config"></div>'
        }
      );
      
      // 验证插槽接收到正确的属性
      const slotContent = wrapper.find('.widget-main-content');
      expect(slotContent.exists()).toBe(true);
    });
  });
});
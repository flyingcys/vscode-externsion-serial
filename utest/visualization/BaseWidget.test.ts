/**
 * BaseWidget 组件单元测试
 * 测试所有可视化组件的基础组件功能
 * Coverage Target: 100% lines, 98% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup } from 'element-plus';

import BaseWidget from '@/webview/components/base/BaseWidget.vue';
import { WidgetType } from '@shared/types';
import { DataMockFactory } from '@test';

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' },
  ElTag: { name: 'ElTag', template: '<span class="el-tag"><slot /></span>' },
  ElTooltip: { name: 'ElTooltip', template: '<div><slot /></div>' },
  ElButtonGroup: { name: 'ElButtonGroup', template: '<div class="el-button-group"><slot /></div>' }
}));

// Mock Element Plus Icons
vi.mock('@element-plus/icons-vue', () => ({
  Refresh: { name: 'Refresh' },
  Setting: { name: 'Setting' },
  Download: { name: 'Download' },
  FullScreen: { name: 'FullScreen' },
  WarningFilled: { name: 'WarningFilled' },
  Loading: { name: 'Loading' },
  DocumentRemove: { name: 'DocumentRemove' }
}));

// Mock 子组件
vi.mock('@/webview/components/dialogs/WidgetSettingsDialog.vue', () => ({
  default: {
    name: 'WidgetSettingsDialog',
    template: '<div class="widget-settings-dialog"></div>',
    props: ['modelValue', 'widgetType', 'config'],
    emits: ['update:modelValue', 'settings-changed']
  }
}));

vi.mock('@/webview/components/dialogs/WidgetExportDialog.vue', () => ({
  default: {
    name: 'WidgetExportDialog',
    template: '<div class="widget-export-dialog"></div>',
    props: ['modelValue', 'widgetType', 'data'],
    emits: ['update:modelValue', 'export-confirmed']
  }
}));

describe('BaseWidget', () => {
  let wrapper: VueWrapper<any>;
  let mockResizeObserver: any;

  // 基础Props
  const defaultProps = {
    widgetType: WidgetType.Plot,
    title: '测试组件',
    isEnabled: true
  };

  beforeEach(() => {
    // Mock ResizeObserver
    mockResizeObserver = {
      observe: vi.fn(),
      disconnect: vi.fn()
    };
    global.ResizeObserver = vi.fn(() => mockResizeObserver);

    // Mock console方法
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('基础初始化测试', () => {
    test('应该正确渲染基本结构', async () => {
      wrapper = mount(BaseWidget, {
        props: defaultProps,
        global: {
          components: {
            ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup
          }
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.classes()).toContain('base-widget');
      expect(wrapper.classes()).toContain('widget-plot');
    });

    test('应该显示正确的标题', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, title: '自定义标题' },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const titleElement = wrapper.find('.widget-title');
      expect(titleElement.exists()).toBe(true);
      expect(titleElement.text()).toBe('自定义标题');
    });

    test('应该在没有title时使用dataset title', () => {
      const datasets = [DataMockFactory.createMockDataset({ title: '数据集标题' })];
      
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps, 
          title: undefined,
          datasets 
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const titleElement = wrapper.find('.widget-title');
      expect(titleElement.text()).toBe('数据集标题');
    });

    test('应该使用默认标题当没有title和datasets时', () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps, 
          title: undefined 
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const titleElement = wrapper.find('.widget-title');
      expect(titleElement.text()).toBe('数据图表');
    });
  });

  describe('状态管理测试', () => {
    test('应该正确处理选中状态', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, isSelected: true },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.classes()).toContain('widget-selected');
    });

    test('应该正确处理禁用状态', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, isEnabled: false },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.classes()).toContain('widget-disabled');
    });

    test('应该正确处理加载状态', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, isLoading: true },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.classes()).toContain('widget-loading');
      expect(wrapper.find('.loading-overlay').exists()).toBe(true);
    });

    test('应该正确处理错误状态', () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps, 
          hasError: true,
          errorTitle: '测试错误',
          errorMessage: '这是测试错误消息'
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.classes()).toContain('widget-error');
      expect(wrapper.find('.error-overlay').exists()).toBe(true);
      expect(wrapper.find('.error-title').text()).toBe('测试错误');
      expect(wrapper.find('.error-message').text()).toBe('这是测试错误消息');
    });

    test('应该正确处理空数据状态', () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps, 
          hasData: false,
          emptyTitle: '无数据',
          emptyMessage: '等待数据输入'
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.find('.empty-title').text()).toBe('无数据');
      expect(wrapper.find('.empty-message').text()).toBe('等待数据输入');
    });
  });

  describe('工具栏功能测试', () => {
    beforeEach(() => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps, 
          showDefaultToolbar: true,
          hasData: true
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });
    });

    test('应该显示默认工具栏', () => {
      expect(wrapper.find('.header-right').exists()).toBe(true);
      expect(wrapper.find('.el-button-group').exists()).toBe(true);
    });

    test('应该触发刷新事件', async () => {
      const refreshButton = wrapper.findAll('button')[0]; // 第一个按钮是刷新
      await refreshButton.trigger('click');
      
      expect(wrapper.emitted('refresh')).toBeTruthy();
      expect(wrapper.emitted('refresh')).toHaveLength(1);
    });

    test('应该触发设置事件', async () => {
      const settingsButton = wrapper.findAll('button')[1]; // 第二个按钮是设置
      await settingsButton.trigger('click');
      
      expect(wrapper.emitted('settings')).toBeTruthy();
      expect(wrapper.emitted('settings')).toHaveLength(1);
    });

    test('应该触发导出事件', async () => {
      const exportButton = wrapper.findAll('button')[2]; // 第三个按钮是导出
      await exportButton.trigger('click');
      
      expect(wrapper.emitted('export')).toBeTruthy();
      expect(wrapper.emitted('export')).toHaveLength(1);
    });

    test('应该触发全屏事件', async () => {
      const fullscreenButton = wrapper.findAll('button')[3]; // 第四个按钮是全屏
      await fullscreenButton.trigger('click');
      
      expect(wrapper.emitted('fullscreen')).toBeTruthy();
      expect(wrapper.emitted('fullscreen')?.[0]).toEqual([true]);
    });

    test('应该在禁用状态下禁用按钮', async () => {
      await wrapper.setProps({ isEnabled: false });
      
      const buttons = wrapper.findAll('button');
      buttons.forEach((button, index) => {
        if (index < 3) { // 前三个按钮在禁用状态下应该被禁用
          expect(button.attributes('disabled')).toBeDefined();
        }
      });
    });

    test('应该在无数据时禁用导出按钮', async () => {
      await wrapper.setProps({ hasData: false });
      
      const exportButton = wrapper.findAll('button')[2];
      expect(exportButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('连接状态测试', () => {
    test('应该显示连接状态标签', () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps, 
          connectionStatus: 'connected',
          showStatus: true
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.find('.el-tag').exists()).toBe(true);
      expect(wrapper.find('.el-tag').text()).toBe('connected');
    });

    test('should显示正确的状态标签类型', async () => {
      const testCases = [
        { status: 'connected', expectedType: 'success' },
        { status: '已连接', expectedType: 'success' },
        { status: 'error', expectedType: 'danger' },
        { status: '错误', expectedType: 'danger' },
        { status: 'connecting', expectedType: 'warning' },
        { status: '连接中', expectedType: 'warning' },
        { status: 'unknown', expectedType: 'info' }
      ];

      for (const testCase of testCases) {
        wrapper = mount(BaseWidget, {
          props: { 
            ...defaultProps, 
            connectionStatus: testCase.status,
            showStatus: true
          },
          global: {
            components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
          }
        });

        // 这里需要检查tag的type属性，但由于是mock组件，我们通过computed属性测试
        const vm = wrapper.vm as any;
        expect(vm.statusTagType).toBe(testCase.expectedType);
      }
    });
  });

  describe('尺寸和样式测试', () => {
    test('应该应用正确的尺寸样式', () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          width: 300,
          height: 200,
          minWidth: 100,
          minHeight: 50,
          maxWidth: 500,
          maxHeight: 400
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const style = wrapper.attributes('style');
      expect(style).toContain('width: 300px');
      expect(style).toContain('height: 200px');
      expect(style).toContain('min-width: 100px');
      expect(style).toContain('min-height: 50px');
      expect(style).toContain('max-width: 500px');
      expect(style).toContain('max-height: 400px');
    });

    test('应该计算正确的内容区域高度', async () => {
      // 显示标题栏和脚注
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          showTitleBar: true,
          showFooter: true
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const contentElement = wrapper.find('.widget-content');
      expect(contentElement.attributes('style')).toContain('height: calc(100% - 80px)');

      // 只显示标题栏
      await wrapper.setProps({ showFooter: false });
      expect(contentElement.attributes('style')).toContain('height: calc(100% - 40px)');

      // 都不显示
      await wrapper.setProps({ showTitleBar: false });
      expect(contentElement.attributes('style')).toContain('height: 100%');
    });
  });

  describe('数据统计测试', () => {
    test('应该正确计算数据数量 - 数组数据', () => {
      const widgetData = [1, 2, 3, 4, 5];
      
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          widgetData,
          showDataCount: true
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.dataCount).toBe(5);
    });

    test('应该正确计算数据数量 - datasets', () => {
      const datasets = [
        DataMockFactory.createMockDataset({ id: '1' }),
        DataMockFactory.createMockDataset({ id: '2' }),
        DataMockFactory.createMockDataset({ id: '3' })
      ];
      
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          datasets,
          showDataCount: true
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.dataCount).toBe(3);
    });

    test('应该正确格式化更新时间', () => {
      const now = Date.now();
      const testCases = [
        { lastUpdate: now, expected: '刚刚' },
        { lastUpdate: now - 5000, expected: '5秒前' },
        { lastUpdate: now - 120000, expected: '2分钟前' },
        { lastUpdate: now - 7200000, expected: '2小时前' },
        { lastUpdate: 0, expected: '从未' }
      ];

      testCases.forEach(testCase => {
        wrapper = mount(BaseWidget, {
          props: { 
            ...defaultProps,
            lastUpdate: testCase.lastUpdate,
            showUpdateTime: true
          },
          global: {
            components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
          }
        });

        const vm = wrapper.vm as any;
        expect(vm.lastUpdateText).toBe(testCase.expected);
      });
    });
  });

  describe('全屏功能测试', () => {
    beforeEach(() => {
      wrapper = mount(BaseWidget, {
        props: defaultProps,
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });
    });

    test('应该切换全屏状态', async () => {
      const vm = wrapper.vm as any;
      
      // 初始状态
      expect(vm.isFullscreen).toBe(false);
      expect(wrapper.classes()).not.toContain('widget-fullscreen');

      // 切换到全屏
      await vm.toggleFullscreen();
      expect(vm.isFullscreen).toBe(true);
      expect(wrapper.classes()).toContain('widget-fullscreen');

      // 切换回普通模式
      await vm.toggleFullscreen();
      expect(vm.isFullscreen).toBe(false);
      expect(wrapper.classes()).not.toContain('widget-fullscreen');
    });

    test('应该通过双击标题栏切换全屏', async () => {
      const headerElement = wrapper.find('.widget-header');
      await headerElement.trigger('dblclick');

      expect(wrapper.emitted('fullscreen')).toBeTruthy();
      expect(wrapper.emitted('fullscreen')?.[0]).toEqual([true]);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理重试操作', async () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          hasError: true,
          allowRetry: true
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const retryButton = wrapper.find('.error-overlay button');
      expect(retryButton.exists()).toBe(true);

      await retryButton.trigger('click');
      expect(wrapper.emitted('retry')).toBeTruthy();
      expect(wrapper.emitted('retry')).toHaveLength(1);
    });

    test('应该在不允许重试时隐藏重试按钮', () => {
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          hasError: true,
          allowRetry: false
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const retryButton = wrapper.find('.error-overlay button');
      expect(retryButton.exists()).toBe(false);
    });
  });

  describe('插槽测试', () => {
    test('应该渲染主要内容插槽', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, hasData: true },
        slots: {
          default: '<div class="test-content">测试内容</div>'
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.find('.test-content').exists()).toBe(true);
      expect(wrapper.find('.test-content').text()).toBe('测试内容');
    });

    test('应该渲染工具栏插槽', () => {
      wrapper = mount(BaseWidget, {
        props: defaultProps,
        slots: {
          toolbar: '<button class="custom-toolbar-btn">自定义按钮</button>'
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.find('.custom-toolbar-btn').exists()).toBe(true);
      expect(wrapper.find('.custom-toolbar-btn').text()).toBe('自定义按钮');
    });

    test('应该渲染脚注插槽', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, showFooter: true },
        slots: {
          'footer-left': '<span class="custom-footer-left">左侧</span>',
          'footer-right': '<span class="custom-footer-right">右侧</span>'
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(wrapper.find('.custom-footer-left').exists()).toBe(true);
      expect(wrapper.find('.custom-footer-right').exists()).toBe(true);
    });
  });

  describe('ResizeObserver集成测试', () => {
    test('应该设置ResizeObserver', () => {
      wrapper = mount(BaseWidget, {
        props: defaultProps,
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      expect(global.ResizeObserver).toHaveBeenCalled();
      expect(mockResizeObserver.observe).toHaveBeenCalled();
    });

    test('应该在组件卸载时断开ResizeObserver', () => {
      wrapper = mount(BaseWidget, {
        props: defaultProps,
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      wrapper.unmount();
      expect(mockResizeObserver.disconnect).toHaveBeenCalled();
    });

    test('应该处理ResizeObserver不存在的情况', () => {
      // 临时删除ResizeObserver
      const originalResizeObserver = global.ResizeObserver;
      delete (global as any).ResizeObserver;

      expect(() => {
        wrapper = mount(BaseWidget, {
          props: defaultProps,
          global: {
            components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
          }
        });
      }).not.toThrow();

      // 恢复ResizeObserver
      global.ResizeObserver = originalResizeObserver;
    });
  });

  describe('组件类型和图标测试', () => {
    const widgetTypeTests = [
      { type: WidgetType.Plot, title: '数据图表', icon: 'TrendCharts' },
      { type: WidgetType.MultiPlot, title: '多数据图表', icon: 'DataAnalysis' },
      { type: WidgetType.Gauge, title: '仪表盘', icon: 'Timer' },
      { type: WidgetType.Bar, title: '条形图', icon: 'Histogram' },
      { type: WidgetType.Compass, title: '指南针', icon: 'Compass' },
      { type: WidgetType.GPS, title: 'GPS地图', icon: 'Location' },
      { type: WidgetType.LED, title: 'LED面板', icon: 'Lightning' },
      { type: WidgetType.DataGrid, title: '数据网格', icon: 'Grid' },
      { type: WidgetType.Terminal, title: '终端', icon: 'Monitor' }
    ];

    test.each(widgetTypeTests)('应该为$type显示正确的默认标题和图标', ({ type, title, icon }) => {
      wrapper = mount(BaseWidget, {
        props: { widgetType: type },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.displayTitle).toBe(title);
      expect(vm.widgetIcon).toBe(icon);
      expect(wrapper.classes()).toContain(`widget-${type}`);
    });
  });

  describe('属性监听测试', () => {
    test('应该监听isSelected属性变化', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, isSelected: false },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      await wrapper.setProps({ isSelected: true });
      await nextTick();

      expect(consoleSpy).toHaveBeenCalledWith(`Widget ${WidgetType.Plot} selected`);
    });
  });

  describe('边界情况测试', () => {
    test('应该处理undefined widgetData', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, widgetData: undefined },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.dataCount).toBe(0);
    });

    test('应该处理空字符串connectionStatus', () => {
      wrapper = mount(BaseWidget, {
        props: { ...defaultProps, connectionStatus: '' },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.statusTagType).toBe('info');
    });

    test('应该处理未知的WidgetType', () => {
      wrapper = mount(BaseWidget, {
        props: { widgetType: 'unknown' as WidgetType },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.displayTitle).toBe('未知组件');
      expect(vm.widgetIcon).toBe('QuestionFilled');
    });
  });

  describe('性能测试', () => {
    test('应该正确处理大量数据点计数', () => {
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => i);
      
      wrapper = mount(BaseWidget, {
        props: { 
          ...defaultProps,
          widgetData: largeDataSet 
        },
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const vm = wrapper.vm as any;
      expect(vm.dataCount).toBe(10000);
    });

    test('应该快速切换多个状态', async () => {
      wrapper = mount(BaseWidget, {
        props: defaultProps,
        global: {
          components: { ElButton, ElIcon, ElTag, ElTooltip, ElButtonGroup }
        }
      });

      const start = performance.now();
      
      // 快速切换多个状态
      for (let i = 0; i < 100; i++) {
        await wrapper.setProps({
          isLoading: i % 2 === 0,
          hasError: i % 3 === 0,
          isSelected: i % 4 === 0,
          hasData: i % 5 !== 0
        });
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
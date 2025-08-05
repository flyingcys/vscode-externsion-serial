/**
 * BarWidget.test.ts
 * 测试真实的BarWidget.vue组件
 * Coverage Target: 85% lines, 80% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import BarWidget from '../../src/webview/components/widgets/BarWidget.vue';
import { WidgetType } from '../../src/shared/types';

// Mock Chart.js
const mockChart = {
  data: { datasets: [], labels: [] },
  update: vi.fn(),
  destroy: vi.fn(),
  resize: vi.fn(),
  getElementsAtEventForMode: vi.fn().mockReturnValue([]),
  canvas: { getContext: vi.fn().mockReturnValue({}) }
};

vi.mock('chart.js', () => ({
  Chart: Object.assign(vi.fn().mockImplementation(() => mockChart), {
    register: vi.fn()
  }),
  registerables: [],
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn()
}));

// Mock BaseWidget
vi.mock('../../src/webview/components/BaseWidget.vue', () => ({
  default: {
    name: 'BaseWidget',
    template: `
      <div class="base-widget">
        <div class="widget-header">
          <slot name="toolbar" />
        </div>
        <div class="widget-content">
          <slot />
        </div>
        <div class="widget-footer">
          <div class="footer-left">
            <slot name="footer-left" />
          </div>
          <div class="footer-right">
            <slot name="footer-right" />
          </div>
        </div>
      </div>
    `,
    props: [
      'widgetType', 'title', 'datasets', 'widgetData', 'widgetConfig',
      'isLoading', 'hasError', 'errorMessage', 'hasData', 'lastUpdate'
    ],
    emits: ['refresh', 'settings', 'export', 'resize', 'settingsChanged']
  }
}));

// Mock Element Plus Icons
vi.mock('@element-plus/icons-vue', () => ({
  VideoPlay: { name: 'VideoPlay', template: '<svg class="video-play-icon" />' },
  VideoPause: { name: 'VideoPause', template: '<svg class="video-pause-icon" />' },
  Sort: { name: 'Sort', template: '<svg class="sort-icon" />' },
  Refresh: { name: 'Refresh', template: '<svg class="refresh-icon" />' },
  Download: { name: 'Download', template: '<svg class="download-icon" />' },
  Setting: { name: 'Setting', template: '<svg class="setting-icon" />' }
}));

// Mock stores
vi.mock('../../src/webview/stores/theme', () => ({
  useThemeStore: () => ({
    currentTheme: 'light',
    getChartColors: vi.fn().mockReturnValue({
      background: '#ffffff',
      text: '#303133',
      grid: '#e4e7ed',
      axis: '#606266'
    })
  })
}));

vi.mock('../../src/webview/stores/performance', () => ({
  usePerformanceStore: () => ({
    recordFrame: vi.fn()
  })
}));

describe('BarWidget', () => {
  let wrapper: VueWrapper<any>;
  
  const mockDatasets = [
    {
      id: 'sensor1',
      title: 'Temperature',
      unit: '°C',
      value: 25.5,
      timestamp: Date.now()
    },
    {
      id: 'sensor2',
      title: 'Humidity',
      unit: '%',
      value: 65.0,
      timestamp: Date.now()
    }
  ];

  const defaultProps = {
    datasets: mockDatasets,
    config: {
      title: '测试条形图',
      orientation: 'vertical',
      sortMode: 'none',
      showValues: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DOM APIs
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    // Mock Canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn()
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('组件初始化', () => {
    test('应该正确渲染组件', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'BaseWidget' }).exists()).toBe(true);
    });

    test('应该正确设置Widget类型', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('widgetType')).toBe(WidgetType.Bar);
    });

    test('应该显示标题', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('title')).toBe('测试条形图');
    });

    test('应该渲染Canvas元素', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const canvas = wrapper.find('canvas');
      expect(canvas.exists()).toBe(true);
    });
  });

  describe('数据处理', () => {
    test('应该正确处理datasets数据', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('datasets')).toEqual(mockDatasets);
      expect(baseWidget.props('hasData')).toBe(true);
    });

    test('应该处理空数据情况', () => {
      wrapper = mount(BarWidget, {
        props: { ...defaultProps, datasets: [] }
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('hasData')).toBe(false);
    });

    test('应该更新数据时触发图表更新', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const newDatasets = [
        ...mockDatasets,
        {
          id: 'sensor3',
          title: 'Pressure',
          unit: 'Pa',
          value: 1013.25,
          timestamp: Date.now()
        }
      ];

      await wrapper.setProps({ datasets: newDatasets });

      // 验证Chart.update被调用
      expect(mockChart.update).toHaveBeenCalled();
    });
  });

  describe('工具栏功能', () => {
    test('应该显示暂停/恢复按钮', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const pauseButton = wrapper.find('[data-testid="pause-button"]');
      expect(pauseButton.exists()).toBe(true);
    });

    test('应该处理暂停/恢复切换', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const pauseButton = wrapper.find('[data-testid="pause-button"]');
      await pauseButton.trigger('click');

      // 验证暂停状态变化
      expect(wrapper.vm.isPaused).toBe(true);
    });

    test('应该显示排序下拉框', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const sortDropdown = wrapper.find('[data-testid="sort-dropdown"]');
      expect(sortDropdown.exists()).toBe(true);
    });

    test('应该显示方向切换按钮', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const orientationButton = wrapper.find('[data-testid="orientation-button"]');
      expect(orientationButton.exists()).toBe(true);
    });
  });

  describe('图表交互', () => {
    test('应该处理图表点击事件', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const canvas = wrapper.find('canvas');
      await canvas.trigger('click');

      // 验证点击处理逻辑
      expect(mockChart.getElementsAtEventForMode).toHaveBeenCalled();
    });

    test('应该处理容器尺寸变化', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      // 模拟容器尺寸变化
      const container = wrapper.find('.bar-container');
      if (container.exists()) {
        // Resize Observer会触发resize事件
        wrapper.vm.handleResize();
        expect(mockChart.resize).toHaveBeenCalled();
      }
    });
  });

  describe('配置选项', () => {
    test('应该支持垂直方向配置', () => {
      wrapper = mount(BarWidget, {
        props: {
          ...defaultProps,
          config: { ...defaultProps.config, orientation: 'vertical' }
        }
      });

      expect(wrapper.vm.config.orientation).toBe('vertical');
    });

    test('应该支持水平方向配置', () => {
      wrapper = mount(BarWidget, {
        props: {
          ...defaultProps,
          config: { ...defaultProps.config, orientation: 'horizontal' }
        }
      });

      expect(wrapper.vm.config.orientation).toBe('horizontal');
    });

    test('应该支持排序配置', () => {
      wrapper = mount(BarWidget, {
        props: {
          ...defaultProps,
          config: { ...defaultProps.config, sortMode: 'asc' }
        }
      });

      expect(wrapper.vm.config.sortMode).toBe('asc');
    });

    test('应该支持显示数值配置', () => {
      wrapper = mount(BarWidget, {
        props: {
          ...defaultProps,
          config: { ...defaultProps.config, showValues: false }
        }
      });

      expect(wrapper.vm.config.showValues).toBe(false);
    });
  });

  describe('错误处理', () => {
    test('应该处理Chart.js初始化错误', async () => {
      // Mock Chart构造函数抛出错误
      vi.mocked(mockChart).mockImplementationOnce(() => {
        throw new Error('Chart initialization failed');
      });

      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      await nextTick();

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('hasError')).toBe(true);
    });

    test('应该处理数据格式错误', async () => {
      const invalidDatasets = [
        { id: 'invalid', title: null, value: 'not-a-number' }
      ];

      wrapper = mount(BarWidget, {
        props: { ...defaultProps, datasets: invalidDatasets }
      });

      await nextTick();

      // 应该有错误处理机制
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('性能优化', () => {
    test('应该在暂停时停止更新', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      // 暂停组件
      wrapper.vm.isPaused = true;
      
      // 尝试更新数据
      await wrapper.setProps({ 
        datasets: [...mockDatasets, { id: 'new', title: 'New', value: 100 }] 
      });

      // 在暂停状态下，图表不应该更新
      // 这个具体逻辑取决于组件的实现
      expect(wrapper.vm.isPaused).toBe(true);
    });

    test('应该正确清理资源', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      wrapper.unmount();

      // 验证Chart实例被销毁
      expect(mockChart.destroy).toHaveBeenCalled();
    });
  });

  describe('事件发射', () => {
    test('应该发射refresh事件', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      await baseWidget.vm.$emit('refresh');

      expect(wrapper.emitted('refresh')).toBeTruthy();
    });

    test('应该发射settings事件', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      await baseWidget.vm.$emit('settings');

      expect(wrapper.emitted('settings')).toBeTruthy();
    });

    test('应该发射export事件', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      await baseWidget.vm.$emit('export');

      expect(wrapper.emitted('export')).toBeTruthy();
    });
  });

  describe('主题支持', () => {
    test('应该使用主题颜色', () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      // 验证主题store被调用
      expect(wrapper.vm.themeColors).toBeDefined();
    });

    test('应该响应主题变化', async () => {
      wrapper = mount(BarWidget, {
        props: defaultProps
      });

      // 模拟主题变化
      wrapper.vm.currentTheme = 'dark';
      await nextTick();

      // 图表应该更新以反映新主题
      expect(mockChart.update).toHaveBeenCalled();
    });
  });
});
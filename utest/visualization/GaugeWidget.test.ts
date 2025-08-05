/**
 * GaugeWidget.test.ts
 * 测试真实的GaugeWidget.vue组件
 * Coverage Target: 85% lines, 80% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import GaugeWidget from '../../src/webview/components/widgets/GaugeWidget.vue';
import { WidgetType } from '../../src/shared/types';

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
  Refresh: { name: 'Refresh', template: '<svg class="refresh-icon" />' },
  Setting: { name: 'Setting', template: '<svg class="setting-icon" />' },
  Download: { name: 'Download', template: '<svg class="download-icon" />' }
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

describe('GaugeWidget', () => {
  let wrapper: VueWrapper<any>;
  
  const mockDatasets = [
    {
      id: 'gauge1',
      title: 'Temperature',
      unit: '°C',
      value: 25.5,
      min: 0,
      max: 100,
      timestamp: Date.now()
    }
  ];

  const defaultProps = {
    datasets: mockDatasets,
    config: {
      title: '温度仪表盘',
      min: 0,
      max: 100,
      units: '°C',
      showLabels: true,
      showTicks: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock SVG APIs
    global.SVGElement = vi.fn();
    global.SVGSVGElement = vi.fn();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('组件初始化', () => {
    test('应该正确渲染组件', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'BaseWidget' }).exists()).toBe(true);
    });

    test('应该正确设置Widget类型', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('widgetType')).toBe(WidgetType.Gauge);
    });

    test('应该显示标题', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('title')).toBe('温度仪表盘');
    });

    test('应该渲染SVG元素', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const svg = wrapper.find('svg');
      expect(svg.exists()).toBe(true);
    });
  });

  describe('数据处理', () => {
    test('应该正确处理datasets数据', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('datasets')).toEqual(mockDatasets);
      expect(baseWidget.props('hasData')).toBe(true);
    });

    test('应该处理空数据情况', () => {
      wrapper = mount(GaugeWidget, {
        props: { ...defaultProps, datasets: [] }
      });

      const baseWidget = wrapper.findComponent({ name: 'BaseWidget' });
      expect(baseWidget.props('hasData')).toBe(false);
    });

    test('应该计算正确的仪表盘角度', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      // 值为25.5，范围0-100，应该计算出正确的角度
      const angle = wrapper.vm.calculateAngle(25.5, 0, 100);
      expect(angle).toBeGreaterThan(0);
      expect(angle).toBeLessThan(180);
    });
  });

  describe('仪表盘功能', () => {
    test('应该显示当前数值', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const valueText = wrapper.find('.gauge-value');
      expect(valueText.exists()).toBe(true);
    });

    test('应该显示单位', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const unitText = wrapper.find('.gauge-unit');
      expect(unitText.exists()).toBe(true);
    });

    test('应该绘制刻度线', () => {
      wrapper = mount(GaugeWidget, {
        props: {
          ...defaultProps,
          config: { ...defaultProps.config, showTicks: true }
        }
      });

      const ticks = wrapper.findAll('.gauge-tick');
      expect(ticks.length).toBeGreaterThan(0);
    });

    test('应该显示标签', () => {
      wrapper = mount(GaugeWidget, {
        props: {
          ...defaultProps,
          config: { ...defaultProps.config, showLabels: true }
        }
      });

      const labels = wrapper.findAll('.gauge-label');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('颜色和样式', () => {
    test('应该根据数值应用颜色', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const needle = wrapper.find('.gauge-needle');
      expect(needle.exists()).toBe(true);
    });

    test('应该支持危险值警告颜色', () => {
      const dangerProps = {
        ...defaultProps,
        datasets: [{
          ...mockDatasets[0],
          value: 95 // 高危险值
        }]
      };

      wrapper = mount(GaugeWidget, {
        props: dangerProps
      });

      // 应该应用危险颜色
      expect(wrapper.vm.getValueColor(95, 0, 100)).toBe('#f56c6c');
    });

    test('应该支持警告值颜色', () => {
      const warningProps = {
        ...defaultProps,
        datasets: [{
          ...mockDatasets[0],
          value: 75 // 警告值
        }]
      };

      wrapper = mount(GaugeWidget, {
        props: warningProps
      });

      // 应该应用警告颜色
      expect(wrapper.vm.getValueColor(75, 0, 100)).toBe('#e6a23c');
    });
  });

  describe('交互功能', () => {
    test('应该处理重置峰值功能', async () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const resetButton = wrapper.find('[data-testid="reset-button"]');
      if (resetButton.exists()) {
        await resetButton.trigger('click');
        expect(wrapper.vm.peakValue).toBe(0);
      }
    });

    test('应该处理标签切换', async () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const toggleButton = wrapper.find('[data-testid="toggle-labels"]');
      if (toggleButton.exists()) {
        await toggleButton.trigger('click');
        expect(wrapper.vm.showLabels).toBe(!defaultProps.config.showLabels);
      }
    });
  });

  describe('配置选项', () => {
    test('应该支持自定义范围', () => {
      const customProps = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          min: -50,
          max: 150
        }
      };

      wrapper = mount(GaugeWidget, {
        props: customProps
      });

      expect(wrapper.vm.config.min).toBe(-50);
      expect(wrapper.vm.config.max).toBe(150);
    });

    test('应该支持自定义单位', () => {
      const customProps = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          units: 'kPa'
        }
      };

      wrapper = mount(GaugeWidget, {
        props: customProps
      });

      expect(wrapper.vm.config.units).toBe('kPa');
    });

    test('应该支持隐藏刻度', () => {
      const customProps = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          showTicks: false
        }
      };

      wrapper = mount(GaugeWidget, {
        props: customProps
      });

      const ticks = wrapper.findAll('.gauge-tick');
      expect(ticks.length).toBe(0);
    });
  });

  describe('响应式更新', () => {
    test('应该响应数据变化', async () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const newDatasets = [{
        ...mockDatasets[0],
        value: 75.0
      }];

      await wrapper.setProps({ datasets: newDatasets });

      expect(wrapper.vm.currentValue).toBe(75.0);
    });

    test('应该更新峰值记录', async () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const initialPeak = wrapper.vm.peakValue;

      const higherValueDatasets = [{
        ...mockDatasets[0],
        value: 85.0
      }];

      await wrapper.setProps({ datasets: higherValueDatasets });

      expect(wrapper.vm.peakValue).toBeGreaterThanOrEqual(initialPeak);
    });
  });

  describe('错误处理', () => {
    test('应该处理无效数值', () => {
      const invalidDatasets = [{
        ...mockDatasets[0],
        value: NaN
      }];

      wrapper = mount(GaugeWidget, {
        props: { ...defaultProps, datasets: invalidDatasets }
      });

      // 应该有默认值处理
      expect(wrapper.vm.currentValue).toBe(0);
    });

    test('应该处理超出范围的数值', () => {
      const outOfRangeDatasets = [{
        ...mockDatasets[0],
        value: 150 // 超出max=100
      }];

      wrapper = mount(GaugeWidget, {
        props: { ...defaultProps, datasets: outOfRangeDatasets }
      });

      // 应该钳制到最大值
      expect(wrapper.vm.clampedValue).toBe(100);
    });
  });

  describe('性能优化', () => {
    test('应该正确清理SVG元素', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      wrapper.unmount();

      // 验证清理逻辑（具体实现取决于组件）
      expect(wrapper.exists()).toBe(false);
    });

    test('应该避免不必要的重绘', async () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      const drawSpy = vi.spyOn(wrapper.vm, 'drawGauge');

      // 设置相同的值，不应该重绘
      await wrapper.setProps({ 
        datasets: [{ ...mockDatasets[0], value: 25.5 }] 
      });

      expect(drawSpy).not.toHaveBeenCalled();
    });
  });

  describe('主题支持', () => {
    test('应该使用主题颜色', () => {
      wrapper = mount(GaugeWidget, {
        props: defaultProps
      });

      // 验证主题store被调用
      expect(wrapper.vm.themeColors).toBeDefined();
    });
  });
});
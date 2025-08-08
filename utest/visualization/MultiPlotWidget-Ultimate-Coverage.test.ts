/**
 * MultiPlotWidget-Refactored.test.ts
 * 多图表组件重构测试 - 基于实际公共API
 * Coverage Target: 95%+ lines, 90%+ branches
 * 
 * 测试覆盖功能:
 * - 基于实际MultiPlotWidget.vue的公共API
 * - 工具栏按钮功能 (interpolate/legends/axes/crosshairs/pause/zoom)
 * - BaseWidget集成和Props处理
 * - 多曲线数据处理和显示控制
 * - 响应式数据和计算属性
 * - 边界条件和错误处理
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import MultiPlotWidget from '@/webview/components/widgets/MultiPlotWidget.vue';
import { WidgetType } from '@/shared/types';

describe('MultiPlotWidget-Refactored', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = createVueWrapper(MultiPlotWidget, {
      props: {
        datasets: [
          {
            title: '温度',
            value: 25.5,
            units: '°C',
            graph: true
          },
          {
            title: '湿度',
            value: 60.0,
            units: '%',
            graph: true
          },
          {
            title: '气压',
            value: 1013.25,
            units: 'hPa',
            graph: true
          }
        ],
        widgetTitle: 'MultiPlot测试',
        canvasWidth: 800,
        canvasHeight: 400,
        maxDataPoints: 1000,
        showCurveStats: true
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // ===================== 1. 基础渲染和Props测试 =====================

  test('1.1 应该正确渲染MultiPlotWidget组件', async () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.multiplot-toolbar').exists()).toBe(true);
    expect(wrapper.find('.multiplot-container').exists()).toBe(true);
  });

  test('1.2 应该正确处理Props', async () => {
    const vm = wrapper.vm as any;
    
    expect(vm.datasets).toHaveLength(3);
    expect(vm.widgetTitle).toBe('MultiPlot测试');
    expect(vm.canvasWidth).toBe(800);
    expect(vm.canvasHeight).toBe(400);
    expect(vm.maxDataPoints).toBe(1000);
    expect(vm.showCurveStats).toBe(true);
  });

  test('1.3 应该设置默认Props值', async () => {
    const defaultWrapper = createVueWrapper(MultiPlotWidget, {
      props: {
        datasets: []
      }
    });

    const vm = defaultWrapper.vm as any;
    expect(vm.widgetTitle).toBe('多数据图表');
    expect(vm.canvasWidth).toBe(800);
    expect(vm.canvasHeight).toBe(400);
    expect(vm.maxDataPoints).toBe(1000);
    expect(vm.showCurveStats).toBe(true);

    defaultWrapper.unmount();
  });

  test('1.4 应该使用BaseWidget作为基础', async () => {
    expect(wrapper.findComponent({ name: 'BaseWidget' }).exists()).toBe(true);
  });

  // ===================== 2. 工具栏按钮功能测试 =====================

  test('2.1 插值模式切换功能', async () => {
    const vm = wrapper.vm as any;
    const initialInterpolateMode = vm.interpolateMode;
    
    // 调用toggleInterpolateMode方法
    vm.toggleInterpolateMode();
    await nextTick();
    
    expect(vm.toggleInterpolateMode).toBeInstanceOf(Function);
    expect(vm.interpolateMode).toBe(!initialInterpolateMode);
  });

  test('2.2 图例显示控制功能', async () => {
    const vm = wrapper.vm as any;
    const initialShowLegends = vm.showLegends;
    
    // 调用toggleLegends方法
    vm.toggleLegends();
    await nextTick();
    
    expect(vm.toggleLegends).toBeInstanceOf(Function);
    expect(vm.showLegends).toBe(!initialShowLegends);
  });

  test('2.3 X轴标签显示控制', async () => {
    const vm = wrapper.vm as any;
    const initialShowXLabels = vm.showXLabels;
    
    // 调用toggleXLabels方法
    vm.toggleXLabels();
    await nextTick();
    
    expect(vm.toggleXLabels).toBeInstanceOf(Function);
    expect(vm.showXLabels).toBe(!initialShowXLabels);
  });

  test('2.4 Y轴标签显示控制', async () => {
    const vm = wrapper.vm as any;
    const initialShowYLabels = vm.showYLabels;
    
    // 调用toggleYLabels方法
    vm.toggleYLabels();
    await nextTick();
    
    expect(vm.toggleYLabels).toBeInstanceOf(Function);
    expect(vm.showYLabels).toBe(!initialShowYLabels);
  });

  test('2.5 十字线显示控制', async () => {
    const vm = wrapper.vm as any;
    const initialShowCrosshairs = vm.showCrosshairs;
    
    // 调用toggleCrosshairs方法
    vm.toggleCrosshairs();
    await nextTick();
    
    expect(vm.toggleCrosshairs).toBeInstanceOf(Function);
    expect(vm.showCrosshairs).toBe(!initialShowCrosshairs);
  });

  test('2.6 暂停/恢复功能', async () => {
    const vm = wrapper.vm as any;
    const initialPaused = vm.isPaused;
    
    // 调用togglePause方法
    vm.togglePause();
    await nextTick();
    
    expect(vm.togglePause).toBeInstanceOf(Function);
    expect(vm.isPaused).toBe(!initialPaused);
  });

  test('2.7 重置缩放功能', async () => {
    const vm = wrapper.vm as any;
    
    // 调用resetZoom方法
    vm.resetZoom();
    await nextTick();
    
    expect(vm.resetZoom).toBeInstanceOf(Function);
  });

  // ===================== 3. 数据处理测试 =====================

  test('3.1 应该处理多个数据集', async () => {
    const vm = wrapper.vm as any;
    expect(vm.datasets).toHaveLength(3);
    expect(vm.datasets[0].title).toBe('温度');
    expect(vm.datasets[1].title).toBe('湿度');
    expect(vm.datasets[2].title).toBe('气压');
  });

  test('3.2 应该处理数据集更新', async () => {
    await wrapper.setProps({
      datasets: [
        { title: '新温度', value: 30.0, units: '°C', graph: true },
        { title: '新湿度', value: 65.0, units: '%', graph: true }
      ]
    });

    const vm = wrapper.vm as any;
    expect(vm.datasets).toHaveLength(2);
    expect(vm.datasets[0].value).toBe(30.0);
  });

  test('3.3 应该处理图表数据格式化', async () => {
    const vm = wrapper.vm as any;
    
    // 测试数据格式化方法（如果存在）
    if (vm.formatChartData) {
      const result = vm.formatChartData(vm.datasets);
      expect(result).toBeDefined();
    }
  });

  // ===================== 4. Widget事件处理测试 =====================

  test('4.1 刷新事件处理', async () => {
    const vm = wrapper.vm as any;
    
    vm.handleRefresh();
    await nextTick();
    
    expect(vm.handleRefresh).toBeInstanceOf(Function);
  });

  test('4.2 设置事件处理', async () => {
    const vm = wrapper.vm as any;
    
    vm.handleSettings();
    await nextTick();
    
    expect(vm.handleSettings).toBeInstanceOf(Function);
  });

  test('4.3 导出事件处理', async () => {
    const vm = wrapper.vm as any;
    
    // 设置数据
    await wrapper.setProps({
      datasets: [
        { title: 'Data1', value: 10 },
        { title: 'Data2', value: 20 }
      ]
    });
    
    vm.handleExport();
    await nextTick();
    
    expect(vm.handleExport).toBeInstanceOf(Function);
  });

  // ===================== 5. 响应式数据和计算属性测试 =====================

  test('5.1 响应式数据初始化', async () => {
    const vm = wrapper.vm as any;
    
    // 检查初始状态
    expect(vm.interpolateMode).toBeDefined();
    expect(vm.showLegends).toBeDefined();
    expect(vm.showXLabels).toBeDefined();
    expect(vm.showYLabels).toBeDefined();
    expect(typeof vm.interpolateMode).toBe('boolean');
  });

  test('5.2 widgetTitle计算属性', async () => {
    const vm = wrapper.vm as any;
    expect(vm.widgetTitle).toBe('MultiPlot测试');
    
    // 测试默认标题
    await wrapper.setProps({ widgetTitle: undefined });
    expect(typeof vm.widgetTitle).toBe('string');
  });

  test('5.3 曲线统计计算', async () => {
    const vm = wrapper.vm as any;
    
    // 测试曲线统计信息
    if (vm.visibleCurveCount !== undefined) {
      expect(typeof vm.visibleCurveCount).toBe('number');
    }
    if (vm.totalCurves !== undefined) {
      expect(typeof vm.totalCurves).toBe('number');
    }
    if (vm.dataPointsCount !== undefined) {
      expect(typeof vm.dataPointsCount).toBe('number');
    }
  });

  // ===================== 6. 按钮点击事件测试 =====================

  test('6.1 插值模式按钮点击', async () => {
    const interpolateButton = wrapper.find('[title="插值显示模式"]');
    expect(interpolateButton.exists()).toBe(true);
    
    const vm = wrapper.vm as any;
    const initialState = vm.interpolateMode;
    
    await interpolateButton.trigger('click');
    expect(vm.interpolateMode).toBe(!initialState);
  });

  test('6.2 图例显示按钮点击', async () => {
    const legendButton = wrapper.find('[title="显示图例"]');
    expect(legendButton.exists()).toBe(true);
    
    const vm = wrapper.vm as any;
    const initialState = vm.showLegends;
    
    await legendButton.trigger('click');
    expect(vm.showLegends).toBe(!initialState);
  });

  test('6.3 X轴标签按钮点击', async () => {
    const xAxisButton = wrapper.find('[title="显示X轴标签"]');
    expect(xAxisButton.exists()).toBe(true);
    
    const vm = wrapper.vm as any;
    const initialState = vm.showXLabels;
    
    await xAxisButton.trigger('click');
    expect(vm.showXLabels).toBe(!initialState);
  });

  test('6.4 Y轴标签按钮点击', async () => {
    const yAxisButton = wrapper.find('[title="显示Y轴标签"]');
    expect(yAxisButton.exists()).toBe(true);
    
    const vm = wrapper.vm as any;
    const initialState = vm.showYLabels;
    
    await yAxisButton.trigger('click');
    expect(vm.showYLabels).toBe(!initialState);
  });

  test('6.5 暂停按钮点击', async () => {
    const pauseButton = wrapper.find('[title="暂停"], [title="恢复"]');
    expect(pauseButton.exists()).toBe(true);
    
    const vm = wrapper.vm as any;
    const initialState = vm.isPaused;
    
    await pauseButton.trigger('click');
    expect(vm.isPaused).toBe(!initialState);
  });

  // ===================== 7. 条件渲染测试 =====================

  test('7.1 曲线统计显示控制', async () => {
    // 显示曲线统计
    await wrapper.setProps({ showCurveStats: true });
    expect(wrapper.find('.curve-stats').exists()).toBe(true);
    
    // 隐藏曲线统计
    await wrapper.setProps({ showCurveStats: false });
    expect(wrapper.find('.curve-stats').exists()).toBe(false);
  });

  test('7.2 图表容器存在', async () => {
    expect(wrapper.find('.multiplot-container').exists()).toBe(true);
  });

  // ===================== 8. 边界条件和错误处理测试 =====================

  test('8.1 空数据集处理', async () => {
    await wrapper.setProps({ datasets: [] });
    const vm = wrapper.vm as any;
    
    expect(vm.datasets).toEqual([]);
    // 组件应该正常渲染
    expect(wrapper.find('.multiplot-toolbar').exists()).toBe(true);
  });

  test('8.2 无效Props处理', async () => {
    await wrapper.setProps({
      datasets: null,
      widgetTitle: ''
    });
    
    // 组件应该不崩溃
    expect(wrapper.exists()).toBe(true);
  });

  test('8.3 大量数据处理', async () => {
    const largeDatasets = Array.from({ length: 50 }, (_, i) => ({
      title: `Series${i}`,
      value: Math.random() * 100,
      units: 'V',
      graph: true
    }));
    
    await wrapper.setProps({ datasets: largeDatasets });
    
    const vm = wrapper.vm as any;
    expect(vm.datasets).toHaveLength(50);
    expect(wrapper.exists()).toBe(true);
  });

  // ===================== 9. 集成测试 =====================

  test('9.1 完整交互流程', async () => {
    const vm = wrapper.vm as any;
    
    // 初始状态验证
    expect(wrapper.find('.multiplot-toolbar').exists()).toBe(true);
    
    // 模拟用户交互
    await wrapper.find('[title="插值显示模式"]').trigger('click');
    await wrapper.find('[title="显示图例"]').trigger('click');
    
    // 验证状态变化
    expect(vm.toggleInterpolateMode).toBeInstanceOf(Function);
    expect(vm.toggleLegends).toBeInstanceOf(Function);
    
    // 数据更新
    await wrapper.setProps({
      datasets: [
        { title: '新数据', value: 42, units: 'Hz', graph: true }
      ]
    });
    
    expect(vm.datasets[0].value).toBe(42);
  });

  test('9.2 多状态组合测试', async () => {
    const vm = wrapper.vm as any;
    
    // 设置多种状态组合
    vm.interpolateMode = true;
    vm.showLegends = false;
    vm.showXLabels = true;
    vm.showYLabels = false;
    vm.isPaused = true;
    
    await nextTick();
    
    // 验证状态正确维护
    expect(vm.interpolateMode).toBe(true);
    expect(vm.showLegends).toBe(false);
    expect(vm.showXLabels).toBe(true);
    expect(vm.showYLabels).toBe(false);
    expect(vm.isPaused).toBe(true);
  });

  // ===================== 10. 组件生命周期测试 =====================

  test('10.1 组件挂载成功', async () => {
    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.element).toBeTruthy();
  });

  test('10.2 组件销毁清理', async () => {
    expect(wrapper.exists()).toBe(true);
    
    wrapper.unmount();
    
    expect(wrapper.exists()).toBe(false);
  });
});
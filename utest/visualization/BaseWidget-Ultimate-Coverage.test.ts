/**
 * BaseWidget-MockBased.test.ts
 * BaseWidget基础组件测试 - 基于实际Mock实现
 * Coverage Target: 95%+ lines, 90%+ branches
 * 
 * 测试覆盖功能:
 * - 基于common-mocks.ts中的实际BaseWidget Mock
 * - 模板渲染和Props传递
 * - 事件发射和插槽功能
 * - CSS类和数据属性
 * - Widget类型和标题显示
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import BaseWidget from '@/webview/components/base/BaseWidget.vue';
import { WidgetType } from '@/shared/types';

describe('BaseWidget-MockBased', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = createVueWrapper(BaseWidget, {
      props: {
        widgetType: 'plot',
        title: 'BaseWidget测试',
        datasets: [
          {
            title: '测试数据',
            value: 42,
            units: 'V'
          }
        ]
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // ===================== 1. 基础渲染测试 =====================

  test('1.1 应该正确渲染BaseWidget组件', async () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.base-widget').exists()).toBe(true);
    expect(wrapper.find('.widget-header').exists()).toBe(true);
    expect(wrapper.find('.widget-content').exists()).toBe(true);
  });

  test('1.2 应该设置正确的data-widget-type属性', async () => {
    const baseWidget = wrapper.find('.base-widget');
    expect(baseWidget.attributes('data-widget-type')).toBe('plot');
  });

  test('1.3 应该显示正确的标题', async () => {
    const title = wrapper.find('h3');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('BaseWidget测试');
  });

  test('1.4 应该渲染Widget操作按钮', async () => {
    const refreshBtn = wrapper.find('.refresh-btn');
    const settingsBtn = wrapper.find('.settings-btn');
    const exportBtn = wrapper.find('.export-btn');
    
    expect(refreshBtn.exists()).toBe(true);
    expect(settingsBtn.exists()).toBe(true);
    expect(exportBtn.exists()).toBe(true);
    
    expect(refreshBtn.text()).toBe('刷新');
    expect(settingsBtn.text()).toBe('设置');
    expect(exportBtn.text()).toBe('导出');
  });

  // ===================== 2. Props处理测试 =====================

  test('2.1 应该正确处理widgetType prop', async () => {
    await wrapper.setProps({ widgetType: 'gauge' });
    
    const baseWidget = wrapper.find('.base-widget');
    expect(baseWidget.attributes('data-widget-type')).toBe('gauge');
  });

  test('2.2 应该正确处理title prop', async () => {
    await wrapper.setProps({ title: '新标题' });
    
    const title = wrapper.find('h3');
    expect(title.text()).toBe('新标题');
  });

  test('2.3 应该正确处理datasets prop', async () => {
    const vm = wrapper.vm as any;
    expect(vm.datasets).toHaveLength(1);
    expect(vm.datasets[0].title).toBe('测试数据');
    expect(vm.datasets[0].value).toBe(42);
  });

  test('2.4 应该处理不同的Widget类型', async () => {
    const widgetTypes = ['plot', 'gauge', 'bar', 'multiplot', 'gps', 'led', 'terminal', 'fft', '3d'];
    
    for (const type of widgetTypes) {
      await wrapper.setProps({ widgetType: type });
      const baseWidget = wrapper.find('.base-widget');
      expect(baseWidget.attributes('data-widget-type')).toBe(type);
    }
  });

  // ===================== 3. 事件发射测试 =====================

  test('3.1 刷新按钮应该发射refresh事件', async () => {
    const refreshBtn = wrapper.find('.refresh-btn');
    
    await refreshBtn.trigger('click');
    
    const refreshEvents = wrapper.emitted('refresh');
    expect(refreshEvents).toBeTruthy();
    expect(refreshEvents).toHaveLength(1);
  });

  test('3.2 设置按钮应该发射settings事件', async () => {
    const settingsBtn = wrapper.find('.settings-btn');
    
    await settingsBtn.trigger('click');
    
    const settingsEvents = wrapper.emitted('settings');
    expect(settingsEvents).toBeTruthy();
    expect(settingsEvents).toHaveLength(1);
  });

  test('3.3 导出按钮应该发射export事件', async () => {
    const exportBtn = wrapper.find('.export-btn');
    
    await exportBtn.trigger('click');
    
    const exportEvents = wrapper.emitted('export');
    expect(exportEvents).toBeTruthy();
    expect(exportEvents).toHaveLength(1);
    expect(exportEvents[0]).toEqual([{}]); // 默认导出空对象
  });

  test('3.4 多次点击应该发射多次事件', async () => {
    const refreshBtn = wrapper.find('.refresh-btn');
    
    await refreshBtn.trigger('click');
    await refreshBtn.trigger('click');
    await refreshBtn.trigger('click');
    
    const refreshEvents = wrapper.emitted('refresh');
    expect(refreshEvents).toHaveLength(3);
  });

  // ===================== 4. 插槽功能测试 =====================

  test('4.1 应该正确渲染toolbar插槽', async () => {
    const wrapperWithSlot = createVueWrapper(BaseWidget, {
      props: {
        widgetType: 'plot',
        title: '测试标题'
      },
      slots: {
        toolbar: '<button class="custom-toolbar-btn">自定义按钮</button>'
      }
    });

    const toolbarSlot = wrapperWithSlot.find('.widget-toolbar');
    const customBtn = wrapperWithSlot.find('.custom-toolbar-btn');
    
    expect(toolbarSlot.exists()).toBe(true);
    expect(customBtn.exists()).toBe(true);
    expect(customBtn.text()).toBe('自定义按钮');
    
    wrapperWithSlot.unmount();
  });

  test('4.2 应该正确渲染默认内容插槽', async () => {
    const wrapperWithSlot = createVueWrapper(BaseWidget, {
      props: {
        widgetType: 'plot',
        title: '测试标题'
      },
      slots: {
        default: '<div class="custom-content">自定义内容</div>'
      }
    });

    const content = wrapperWithSlot.find('.custom-content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe('自定义内容');
    
    wrapperWithSlot.unmount();
  });

  test('4.3 应该同时支持多个插槽', async () => {
    const wrapperWithSlots = createVueWrapper(BaseWidget, {
      props: {
        widgetType: 'gauge',
        title: '多插槽测试'
      },
      slots: {
        toolbar: '<span class="custom-toolbar">工具栏</span>',
        default: '<div class="custom-main">主内容</div>'
      }
    });

    expect(wrapperWithSlots.find('.custom-toolbar').exists()).toBe(true);
    expect(wrapperWithSlots.find('.custom-main').exists()).toBe(true);
    
    wrapperWithSlots.unmount();
  });

  // ===================== 5. 响应式更新测试 =====================

  test('5.1 Props变化应该更新渲染', async () => {
    // 初始状态
    expect(wrapper.find('h3').text()).toBe('BaseWidget测试');
    expect(wrapper.find('.base-widget').attributes('data-widget-type')).toBe('plot');
    
    // 更新Props
    await wrapper.setProps({
      title: '更新后的标题',
      widgetType: 'bar'
    });
    
    // 验证更新
    expect(wrapper.find('h3').text()).toBe('更新后的标题');
    expect(wrapper.find('.base-widget').attributes('data-widget-type')).toBe('bar');
  });

  test('5.2 数据集变化应该正确处理', async () => {
    await wrapper.setProps({
      datasets: [
        { title: '数据1', value: 100 },
        { title: '数据2', value: 200 },
        { title: '数据3', value: 300 }
      ]
    });
    
    const vm = wrapper.vm as any;
    expect(vm.datasets).toHaveLength(3);
    expect(vm.datasets[1].value).toBe(200);
  });

  // ===================== 6. 边界条件测试 =====================

  test('6.1 空标题处理', async () => {
    await wrapper.setProps({ title: '' });
    
    const title = wrapper.find('h3');
    expect(title.text()).toBe('');
  });

  test('6.2 空数据集处理', async () => {
    await wrapper.setProps({ datasets: [] });
    
    const vm = wrapper.vm as any;
    expect(vm.datasets).toEqual([]);
  });

  test('6.3 undefined props处理', async () => {
    await wrapper.setProps({
      title: undefined,
      datasets: undefined
    });
    
    // 组件应该不崩溃
    expect(wrapper.find('.base-widget').exists()).toBe(true);
  });

  test('6.4 特殊字符标题处理', async () => {
    const specialTitle = '特殊字符<>&"\'标题';
    await wrapper.setProps({ title: specialTitle });
    
    const title = wrapper.find('h3');
    expect(title.text()).toBe(specialTitle);
  });

  test('6.5 长标题处理', async () => {
    const longTitle = 'A'.repeat(100);
    await wrapper.setProps({ title: longTitle });
    
    const title = wrapper.find('h3');
    expect(title.text()).toBe(longTitle);
  });

  // ===================== 7. CSS和样式测试 =====================

  test('7.1 基础CSS类存在', async () => {
    const baseWidget = wrapper.find('.base-widget');
    expect(baseWidget.classes()).toContain('base-widget');
  });

  test('7.2 正确的DOM结构', async () => {
    expect(wrapper.find('.base-widget .widget-header').exists()).toBe(true);
    expect(wrapper.find('.base-widget .widget-content').exists()).toBe(true);
    expect(wrapper.find('.widget-header .widget-toolbar').exists()).toBe(true);
    expect(wrapper.find('.widget-header .widget-actions').exists()).toBe(true);
  });

  test('7.3 按钮正确的CSS类', async () => {
    expect(wrapper.find('.refresh-btn').exists()).toBe(true);
    expect(wrapper.find('.settings-btn').exists()).toBe(true);
    expect(wrapper.find('.export-btn').exists()).toBe(true);
  });

  // ===================== 8. 组件生命周期测试 =====================

  test('8.1 组件挂载成功', async () => {
    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.element).toBeTruthy();
  });

  test('8.2 组件销毁清理', async () => {
    expect(wrapper.exists()).toBe(true);
    
    wrapper.unmount();
    
    expect(wrapper.exists()).toBe(false);
  });

  test('8.3 多次挂载和销毁', async () => {
    // 创建多个实例
    const wrappers = [];
    
    for (let i = 0; i < 5; i++) {
      const w = createVueWrapper(BaseWidget, {
        props: {
          widgetType: 'plot',
          title: `测试${i}`
        }
      });
      wrappers.push(w);
      expect(w.exists()).toBe(true);
    }
    
    // 销毁所有实例
    wrappers.forEach(w => {
      w.unmount();
      expect(w.exists()).toBe(false);
    });
  });

  // ===================== 9. 集成测试 =====================

  test('9.1 完整交互流程', async () => {
    // 初始状态验证
    expect(wrapper.find('h3').text()).toBe('BaseWidget测试');
    
    // 点击按钮
    await wrapper.find('.refresh-btn').trigger('click');
    await wrapper.find('.settings-btn').trigger('click');
    
    // 验证事件发射
    expect(wrapper.emitted('refresh')).toHaveLength(1);
    expect(wrapper.emitted('settings')).toHaveLength(1);
    
    // 更新Props
    await wrapper.setProps({ title: '交互测试完成' });
    
    // 验证更新
    expect(wrapper.find('h3').text()).toBe('交互测试完成');
  });

  test('9.2 复杂数据处理流程', async () => {
    const complexData = [
      { title: '温度', value: 25.5, units: '°C', timestamp: Date.now() },
      { title: '湿度', value: 60, units: '%', timestamp: Date.now() + 1000 },
      { title: '气压', value: 1013.25, units: 'hPa', timestamp: Date.now() + 2000 }
    ];
    
    await wrapper.setProps({ datasets: complexData });
    
    const vm = wrapper.vm as any;
    expect(vm.datasets).toHaveLength(3);
    expect(vm.datasets[0].title).toBe('温度');
    expect(vm.datasets[1].value).toBe(60);
    expect(vm.datasets[2].units).toBe('hPa');
  });

  test('9.3 错误恢复测试', async () => {
    // 设置无效数据
    await wrapper.setProps({ widgetType: null });
    
    // 组件应该仍然存在
    expect(wrapper.find('.base-widget').exists()).toBe(true);
    
    // 恢复有效数据
    await wrapper.setProps({ widgetType: 'gauge' });
    
    // 验证恢复
    expect(wrapper.find('.base-widget').attributes('data-widget-type')).toBe('gauge');
  });
});
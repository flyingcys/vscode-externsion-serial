import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConnectionPanel from '@webview/components/panels/ConnectionPanel.vue';

describe('ConnectionPanel 连接面板组件测试', () => {
  test('应该正确渲染连接面板', () => {
    const wrapper = mount(ConnectionPanel);
    
    expect(wrapper.find('.connection-panel').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('连接面板');
    expect(wrapper.find('p').text()).toBe('连接设置和状态显示');
  });

  test('应该具有正确的CSS类名', () => {
    const wrapper = mount(ConnectionPanel);
    
    expect(wrapper.classes()).toContain('connection-panel');
  });

  test('应该是一个有效的Vue组件', () => {
    const wrapper = mount(ConnectionPanel);
    
    expect(wrapper.vm).toBeDefined();
    expect(wrapper.element.tagName).toBe('DIV');
  });

  test('应该能够正常挂载和卸载', async () => {
    const wrapper = mount(ConnectionPanel);
    expect(wrapper.exists()).toBe(true);
    
    wrapper.unmount();
    expect(wrapper.exists()).toBe(false);
  });

  test('组件结构应该符合预期', () => {
    const wrapper = mount(ConnectionPanel);
    
    const panel = wrapper.find('.connection-panel');
    expect(panel.exists()).toBe(true);
    
    const title = panel.find('h3');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('连接面板');
    
    const description = panel.find('p');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('连接设置和状态显示');
  });
});
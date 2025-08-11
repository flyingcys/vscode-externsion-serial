import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectPanel from '@webview/components/panels/ProjectPanel.vue';

describe('ProjectPanel 项目面板组件测试', () => {
  test('应该正确渲染项目面板', () => {
    const wrapper = mount(ProjectPanel);
    
    expect(wrapper.find('.project-panel').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('项目面板');
    expect(wrapper.find('p').text()).toBe('项目管理和配置');
  });

  test('应该具有正确的CSS类名', () => {
    const wrapper = mount(ProjectPanel);
    
    expect(wrapper.classes()).toContain('project-panel');
  });

  test('应该是一个有效的Vue组件', () => {
    const wrapper = mount(ProjectPanel);
    
    expect(wrapper.vm).toBeDefined();
    expect(wrapper.element.tagName).toBe('DIV');
  });

  test('应该能够正常挂载和卸载', async () => {
    const wrapper = mount(ProjectPanel);
    expect(wrapper.exists()).toBe(true);
    
    wrapper.unmount();
    expect(wrapper.exists()).toBe(false);
  });

  test('组件结构应该符合预期', () => {
    const wrapper = mount(ProjectPanel);
    
    const panel = wrapper.find('.project-panel');
    expect(panel.exists()).toBe(true);
    
    const title = panel.find('h3');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('项目面板');
    
    const description = panel.find('p');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('项目管理和配置');
  });
});
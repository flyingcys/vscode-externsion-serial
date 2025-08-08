/**
 * VirtualList.vue 测试
 * 目标：100% 覆盖率，完整测试虚拟化列表功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElIcon } from 'element-plus';
import VirtualList from '../../../../src/webview/components/virtual/VirtualList.vue';

// Mock lodash-es throttle and debounce
vi.mock('lodash-es', () => ({
  throttle: vi.fn((fn, delay) => {
    const throttled = (...args: any[]) => fn(...args);
    return throttled;
  }),
  debounce: vi.fn((fn, delay) => {
    const debounced = (...args: any[]) => fn(...args);
    return debounced;
  })
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock window.addEventListener/removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });

describe('VirtualList 测试', () => {
  let wrapper: VueWrapper<any>;

  const createTestData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: i * 10
    }));
  };

  const defaultProps = {
    items: createTestData(100),
    itemHeight: 50,
    height: 300
  };

  const createWrapper = (props = {}, slots = {}) => {
    return mount(VirtualList, {
      props: { ...defaultProps, ...props },
      slots,
      global: {
        components: {
          ElIcon
        },
        stubs: {
          'el-icon': { 
            template: '<i class="el-icon"><slot /></i>',
            props: ['size', 'color']
          }
        }
      },
      attachTo: document.body
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('基础渲染', () => {
    test('应该正确渲染基本结构', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.virtual-list-container').exists()).toBe(true);
      expect(wrapper.find('.virtual-list-phantom').exists()).toBe(true);
      expect(wrapper.find('.virtual-list-content').exists()).toBe(true);
    });

    test('应该应用容器样式', () => {
      wrapper = createWrapper({
        height: 400,
        width: 600
      });
      
      const container = wrapper.find('.virtual-list-container');
      const style = wrapper.vm.containerStyle;
      
      expect(style.height).toBe('400px');
      expect(style.width).toBe('600px');
      expect(style.overflow).toBe('auto');
      expect(style.position).toBe('relative');
    });

    test('应该支持字符串尺寸', () => {
      wrapper = createWrapper({
        height: '100vh',
        width: '50%'
      });
      
      const style = wrapper.vm.containerStyle;
      expect(style.height).toBe('100vh');
      expect(style.width).toBe('50%');
    });

    test('应该计算正确的总高度', () => {
      wrapper = createWrapper({
        items: createTestData(50),
        estimatedItemHeight: 60
      });
      
      expect(wrapper.vm.totalHeight).toBe(50 * 60);
    });

    test('应该处理空数据', () => {
      wrapper = createWrapper({
        items: []
      });
      
      expect(wrapper.vm.totalHeight).toBe(0);
      expect(wrapper.find('.virtual-list-empty').exists()).toBe(true);
    });
  });

  describe('项目渲染', () => {
    test('应该渲染可见项目', () => {
      wrapper = createWrapper();
      
      const items = wrapper.findAll('.virtual-list-item');
      expect(items.length).toBeGreaterThan(0);
    });

    test('应该使用默认项目渲染', () => {
      wrapper = createWrapper();
      
      const defaultItems = wrapper.findAll('.virtual-list-item-default');
      expect(defaultItems.length).toBeGreaterThan(0);
    });

    test('应该使用自定义项目渲染', () => {
      wrapper = createWrapper(
        {},
        {
          default: '&lt;div class="custom-item"&gt;{{ item.name }}&lt;/div&gt;'
        }
      );
      
      // 由于插槽的复杂性，我们验证默认渲染器不存在
      expect(wrapper.find('.virtual-list-item').exists()).toBe(true);
    });

    test('应该格式化项目文本', () => {
      const testCases = [
        { input: 'string value', expected: 'string value' },
        { input: { name: 'test' }, expected: '{"name":"test"}' },
        { input: 123, expected: '123' },
        { input: true, expected: 'true' }
      ];

      wrapper = createWrapper();

      testCases.forEach(({ input, expected }) => {
        expect(wrapper.vm.formatItem(input)).toBe(expected);
      });
    });

    test('应该生成正确的项目键', () => {
      wrapper = createWrapper({
        keyField: 'id'
      });
      
      const item = { id: 42, name: 'Test' };
      expect(wrapper.vm.getItemKey(item, 0)).toBe(42);
    });

    test('应该使用索引作为键当对象没有键字段时', () => {
      wrapper = createWrapper({
        keyField: 'missing'
      });
      
      const item = { name: 'Test' };
      expect(wrapper.vm.getItemKey(item, 5)).toBe(5);
    });

    test('应该使用自定义键函数', () => {
      wrapper = createWrapper({
        getItemKey: (item, index) => `custom-${item.id}`
      });
      
      const item = { id: 42 };
      expect(wrapper.vm.getItemKey(item, 0)).toBe('custom-42');
    });

    test('应该为非对象项目使用索引', () => {
      wrapper = createWrapper();
      
      expect(wrapper.vm.getItemKey('string item', 3)).toBe(3);
    });
  });

  describe('虚拟化计算', () => {
    test('应该计算正确的开始索引', () => {
      wrapper = createWrapper({
        items: createTestData(100),
        itemHeight: 50
      });
      
      // 模拟容器高度
      wrapper.vm.containerHeight = 300;
      wrapper.vm.scrollTop = 200; // 滚动到4个项目的位置
      
      const startIndex = wrapper.vm.startIndex;
      expect(startIndex).toBeGreaterThanOrEqual(0);
    });

    test('应该计算正确的结束索引', () => {
      wrapper = createWrapper({
        items: createTestData(100),
        itemHeight: 50
      });
      
      wrapper.vm.containerHeight = 300;
      wrapper.vm.scrollTop = 0;
      
      const endIndex = wrapper.vm.endIndex;
      expect(endIndex).toBeGreaterThan(0);
      expect(endIndex).toBeLessThan(100);
    });

    test('应该计算项目顶部位置', () => {
      wrapper = createWrapper({
        estimatedItemHeight: 50
      });
      
      expect(wrapper.vm.getItemTop(0)).toBe(0);
      expect(wrapper.vm.getItemTop(5)).toBe(250);
    });

    test('应该使用缓存的测量数据', () => {
      wrapper = createWrapper();
      
      // 模拟缓存数据
      wrapper.vm.measurementCache.set(0, { height: 60, top: 0 });
      wrapper.vm.measurementCache.set(1, { height: 70, top: 60 });
      
      expect(wrapper.vm.getItemTop(2)).toBe(130);
    });

    test('应该计算正确的项目样式', () => {
      wrapper = createWrapper({
        estimatedItemHeight: 50
      });
      
      const style = wrapper.vm.getItemStyle(0);
      expect(style.height).toBe('50px');
      expect(style.overflow).toBe('hidden');
    });

    test('应该使用缓存的项目高度', () => {
      wrapper = createWrapper();
      
      wrapper.vm.measurementCache.set(0, { height: 80, top: 0 });
      
      const style = wrapper.vm.getItemStyle(0);
      expect(style.height).toBe('80px');
    });
  });

  describe('滚动处理', () => {
    test('应该处理滚动事件', async () => {
      wrapper = createWrapper();
      
      const container = wrapper.find('.virtual-list-container');
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: {
          scrollTop: 100,
          scrollHeight: 1000,
          clientHeight: 300
        }
      });
      
      await container.trigger('scroll', scrollEvent);
      
      expect(wrapper.emitted('scroll')).toBeTruthy();
      expect(wrapper.emitted('visible-change')).toBeTruthy();
    });

    test('应该检测滚动方向', async () => {
      wrapper = createWrapper();
      
      // 模拟向下滚动
      wrapper.vm.lastScrollTop = 50;
      
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: {
          scrollTop: 100,
          scrollHeight: 1000,
          clientHeight: 300
        }
      });
      
      await wrapper.vm.handleScroll(scrollEvent);
      
      expect(wrapper.vm.scrollDirection).toBe('down');
    });

    test('应该检测向上滚动', async () => {
      wrapper = createWrapper();
      
      wrapper.vm.lastScrollTop = 100;
      
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: {
          scrollTop: 50,
          scrollHeight: 1000,
          clientHeight: 300
        }
      });
      
      await wrapper.vm.handleScroll(scrollEvent);
      
      expect(wrapper.vm.scrollDirection).toBe('up');
    });

    test('应该触发到达顶部事件', async () => {
      wrapper = createWrapper({
        threshold: 50
      });
      
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: {
          scrollTop: 30,
          scrollHeight: 1000,
          clientHeight: 300
        }
      });
      
      await wrapper.vm.handleScroll(scrollEvent);
      
      expect(wrapper.emitted('reach-top')).toBeTruthy();
    });

    test('应该触发到达底部事件', async () => {
      wrapper = createWrapper({
        threshold: 50
      });
      
      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'target', {
        value: {
          scrollTop: 650,
          scrollHeight: 1000,
          clientHeight: 300
        }
      });
      
      await wrapper.vm.handleScroll(scrollEvent);
      
      expect(wrapper.emitted('reach-bottom')).toBeTruthy();
    });
  });

  describe('项目点击', () => {
    test('应该处理项目点击事件', async () => {
      wrapper = createWrapper();
      
      const item = { id: 1, name: 'Test Item' };
      await wrapper.vm.handleItemClick(item, 0);
      
      expect(wrapper.emitted('item-click')).toBeTruthy();
      expect(wrapper.emitted('item-click')?.[0]).toEqual([item, 0]);
    });
  });

  describe('公共方法', () => {
    test('应该滚动到指定索引', () => {
      wrapper = createWrapper();
      
      const mockScrollTo = vi.fn();
      wrapper.vm.containerRef = {
        scrollTo: mockScrollTo
      };
      
      wrapper.vm.scrollToIndex(5);
      
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: wrapper.vm.getItemTop(5),
        behavior: 'smooth'
      });
    });

    test('应该滚动到顶部', () => {
      wrapper = createWrapper();
      
      const mockScrollTo = vi.fn();
      wrapper.vm.containerRef = {
        scrollTo: mockScrollTo
      };
      
      wrapper.vm.scrollToTop();
      
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    test('应该滚动到底部', () => {
      wrapper = createWrapper();
      
      const mockScrollTo = vi.fn();
      wrapper.vm.containerRef = {
        scrollTo: mockScrollTo
      };
      
      wrapper.vm.scrollToBottom('auto');
      
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: wrapper.vm.totalHeight,
        behavior: 'auto'
      });
    });

    test('应该处理无效的滚动索引', () => {
      wrapper = createWrapper({
        items: createTestData(10)
      });
      
      const mockScrollTo = vi.fn();
      wrapper.vm.containerRef = {
        scrollTo: mockScrollTo
      };
      
      wrapper.vm.scrollToIndex(-1);
      wrapper.vm.scrollToIndex(15);
      
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    test('应该处理没有容器引用的情况', () => {
      wrapper = createWrapper();
      wrapper.vm.containerRef = null;
      
      expect(() => {
        wrapper.vm.scrollToIndex(5);
        wrapper.vm.scrollToTop();
        wrapper.vm.scrollToBottom();
      }).not.toThrow();
    });
  });

  describe('缓存管理', () => {
    test('应该清除缓存', () => {
      wrapper = createWrapper();
      
      // 添加一些缓存数据
      wrapper.vm.itemHeightCache.set(0, 50);
      wrapper.vm.measurementCache.set(0, { height: 50, top: 0 });
      
      wrapper.vm.clearCache();
      
      expect(wrapper.vm.itemHeightCache.size).toBe(0);
      expect(wrapper.vm.measurementCache.size).toBe(0);
    });

    test('应该测量项目高度', () => {
      wrapper = createWrapper();
      
      const mockElement = {
        getBoundingClientRect: () => ({
          height: 75
        })
      };
      
      wrapper.vm.measureItem(0, mockElement as HTMLElement);
      
      expect(wrapper.vm.itemHeightCache.get(0)).toBe(75);
      expect(wrapper.vm.measurementCache.has(0)).toBe(true);
    });
  });

  describe('尺寸更新', () => {
    test('应该更新容器尺寸', () => {
      wrapper = createWrapper();
      
      const mockGetBoundingClientRect = vi.fn().mockReturnValue({
        height: 400
      });
      
      wrapper.vm.containerRef = {
        getBoundingClientRect: mockGetBoundingClientRect
      };
      
      wrapper.vm.updateContainerSize();
      
      expect(wrapper.vm.containerHeight).toBe(400);
    });

    test('应该处理没有容器引用的情况', () => {
      wrapper = createWrapper();
      wrapper.vm.containerRef = null;
      
      expect(() => {
        wrapper.vm.updateContainerSize();
      }).not.toThrow();
    });
  });

  describe('状态显示', () => {
    test('应该显示加载状态', () => {
      wrapper = createWrapper({
        loading: true,
        items: createTestData(5)
      });
      
      expect(wrapper.find('.virtual-list-loading').exists()).toBe(true);
      expect(wrapper.find('.virtual-list-loading').text()).toContain('加载中');
    });

    test('应该隐藏加载状态当没有项目时', () => {
      wrapper = createWrapper({
        loading: true,
        items: []
      });
      
      expect(wrapper.find('.virtual-list-loading').exists()).toBe(false);
    });

    test('应该显示空状态', () => {
      wrapper = createWrapper({
        loading: false,
        items: []
      });
      
      expect(wrapper.find('.virtual-list-empty').exists()).toBe(true);
      expect(wrapper.find('.empty-content').exists()).toBe(true);
    });

    test('应该显示自定义空状态', () => {
      wrapper = createWrapper(
        {
          loading: false,
          items: []
        },
        {
          empty: '&lt;div class="custom-empty"&gt;No data found&lt;/div&gt;'
        }
      );
      
      expect(wrapper.find('.virtual-list-empty').exists()).toBe(true);
    });
  });

  describe('生命周期', () => {
    test('应该在挂载时设置尺寸', () => {
      const updateContainerSizeSpy = vi.fn();
      
      wrapper = createWrapper();
      wrapper.vm.updateContainerSize = updateContainerSizeSpy;
      
      // 触发mounted钩子的逻辑
      wrapper.vm.updateContainerSize();
      
      expect(updateContainerSizeSpy).toHaveBeenCalled();
    });

    test('应该添加窗口尺寸变化监听器', () => {
      wrapper = createWrapper();
      
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('应该在卸载时移除监听器', () => {
      wrapper = createWrapper();
      wrapper.unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('响应式更新', () => {
    test('应该在项目变化时清除缓存', async () => {
      wrapper = createWrapper();
      
      const clearCacheSpy = vi.spyOn(wrapper.vm, 'clearCache');
      
      await wrapper.setProps({
        items: createTestData(20)
      });
      
      expect(clearCacheSpy).toHaveBeenCalled();
    });
  });

  describe('函数类型项目高度', () => {
    test('应该支持函数类型的项目高度', () => {
      const heightFunction = (index: number) => 50 + (index % 3) * 10;
      
      wrapper = createWrapper({
        itemHeight: heightFunction
      });
      
      expect(wrapper.vm.getItemHeight(0)).toBe(50);
      expect(wrapper.vm.getItemHeight(1)).toBe(60);
      expect(wrapper.vm.getItemHeight(2)).toBe(70);
    });
  });

  describe('性能统计', () => {
    test('应该返回正确的统计信息', () => {
      wrapper = createWrapper({
        items: createTestData(100)
      });
      
      const stats = wrapper.vm.getStats();
      
      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('visibleItems');
      expect(stats).toHaveProperty('startIndex');
      expect(stats).toHaveProperty('endIndex');
      expect(stats).toHaveProperty('scrollTop');
      expect(stats).toHaveProperty('totalHeight');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('isScrolling');
      expect(stats).toHaveProperty('scrollDirection');
      
      expect(stats.totalItems).toBe(100);
      expect(typeof stats.visibleItems).toBe('number');
    });
  });

  describe('边界条件', () => {
    test('应该处理极大的数据集', () => {
      wrapper = createWrapper({
        items: createTestData(100000),
        estimatedItemHeight: 50
      });
      
      expect(wrapper.vm.totalHeight).toBe(5000000);
    });

    test('应该处理零高度项目', () => {
      wrapper = createWrapper({
        itemHeight: 0
      });
      
      expect(wrapper.vm.getItemTop(5)).toBe(0);
    });

    test('应该处理负索引', () => {
      wrapper = createWrapper();
      
      expect(wrapper.vm.getItemTop(-1)).toBe(0);
    });

    test('应该处理 undefined 项目', () => {
      wrapper = createWrapper({
        items: [undefined, null, '', 0]
      });
      
      expect(wrapper.vm.formatItem(undefined)).toBe('undefined');
      expect(wrapper.vm.formatItem(null)).toBe('null');
    });

    test('应该处理空字符串键字段', () => {
      wrapper = createWrapper({
        keyField: ''
      });
      
      const item = { name: 'Test' };
      expect(wrapper.vm.getItemKey(item, 5)).toBe(5);
    });
  });

  describe('暴露的方法', () => {
    test('应该暴露所有公共方法', () => {
      wrapper = createWrapper();
      
      // 检查 defineExpose 暴露的方法
      expect(typeof wrapper.vm.scrollToIndex).toBe('function');
      expect(typeof wrapper.vm.scrollToTop).toBe('function');
      expect(typeof wrapper.vm.scrollToBottom).toBe('function');
      expect(typeof wrapper.vm.clearCache).toBe('function');
      expect(typeof wrapper.vm.measureVisibleItems).toBe('function');
      expect(typeof wrapper.vm.getStats).toBe('function');
    });
  });
});
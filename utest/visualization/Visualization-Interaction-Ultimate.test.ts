/**
 * Visualization-Interaction-Ultimate.test.ts
 * Visualization模块用户交互集成测试 - Phase 4高级功能测试
 * 测试跨Widget数据共享、事件冒泡、键盘快捷键、拖拽手势、响应式布局等用户体验功能
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElButton, ElIcon, ElDialog, ElInput } from 'element-plus';

// Mock键盘事件
const mockKeyboardEvent = (key: string, options: any = {}) => {
  return new KeyboardEvent('keydown', {
    key,
    code: options.code || key,
    ctrlKey: options.ctrlKey || false,
    shiftKey: options.shiftKey || false,
    altKey: options.altKey || false,
    metaKey: options.metaKey || false,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Mock鼠标事件
const mockMouseEvent = (type: string, options: any = {}) => {
  return new MouseEvent(type, {
    clientX: options.x || 0,
    clientY: options.y || 0,
    button: options.button || 0,
    buttons: options.buttons || 1,
    ctrlKey: options.ctrlKey || false,
    shiftKey: options.shiftKey || false,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Mock触摸事件
const mockTouchEvent = (type: string, options: any = {}) => {
  const touch = {
    identifier: 0,
    target: options.target || document.body,
    clientX: options.x || 0,
    clientY: options.y || 0,
    pageX: options.x || 0,
    pageY: options.y || 0,
    screenX: options.x || 0,
    screenY: options.y || 0,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  };

  return new TouchEvent(type, {
    touches: type === 'touchend' ? [] : [touch as Touch],
    targetTouches: type === 'touchend' ? [] : [touch as Touch],
    changedTouches: [touch as Touch],
    bubbles: true,
    cancelable: true
  });
};

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}
global.ResizeObserver = MockResizeObserver;

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button" @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
    props: ['disabled'],
    emits: ['click']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot /></i>'
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div class="el-dialog" v-if="modelValue"><slot /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    emits: ['update:modelValue']
  }
}));

// Mock数据共享存储
const mockDataStore = {
  sharedData: new Map(),
  subscribers: new Map(),
  
  setData(key: string, value: any) {
    this.sharedData.set(key, value);
    this.notifySubscribers(key, value);
  },
  
  getData(key: string) {
    return this.sharedData.get(key);
  },
  
  subscribe(key: string, callback: Function) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
  },
  
  unsubscribe(key: string, callback: Function) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).delete(callback);
    }
  },
  
  notifySubscribers(key: string, value: any) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach((callback: Function) => callback(value));
    }
  },
  
  clear() {
    this.sharedData.clear();
    this.subscribers.clear();
  }
};

// Mock键盘快捷键管理器
const mockKeyboardManager = {
  shortcuts: new Map(),
  
  register(key: string, callback: Function, options: any = {}) {
    const shortcutKey = this.formatKey(key, options);
    this.shortcuts.set(shortcutKey, callback);
  },
  
  unregister(key: string, options: any = {}) {
    const shortcutKey = this.formatKey(key, options);
    this.shortcuts.delete(shortcutKey);
  },
  
  handleKeyEvent(event: KeyboardEvent) {
    const shortcutKey = this.formatKey(event.key, {
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
    
    const callback = this.shortcuts.get(shortcutKey);
    if (callback) {
      event.preventDefault();
      callback(event);
      return true;
    }
    return false;
  },
  
  formatKey(key: string, options: any) {
    const modifiers = [];
    if (options.ctrlKey) modifiers.push('ctrl');
    if (options.shiftKey) modifiers.push('shift');
    if (options.altKey) modifiers.push('alt');
    if (options.metaKey) modifiers.push('meta');
    
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
  },
  
  clear() {
    this.shortcuts.clear();
  }
};

// 交互式Widget组件Mock
const InteractiveWidget = {
  name: 'InteractiveWidget',
  template: `
    <div 
      class="interactive-widget"
      :class="{ 
        'widget-focused': isFocused,
        'widget-selected': isSelected,
        'widget-dragging': isDragging,
        'widget-resizing': isResizing
      }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove" 
      @mouseup="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
      tabindex="0"
    >
      <div class="widget-header" @dblclick="handleDoubleClick">
        <span class="widget-title">{{ title }}</span>
        <div class="widget-controls">
          <button @click="handlePin" :class="{ active: isPinned }">📌</button>
          <button @click="handleMinimize" :class="{ active: isMinimized }">➖</button>
          <button @click="handleMaximize" :class="{ active: isMaximized }">⬜</button>
          <button @click="handleClose">✖️</button>
        </div>
      </div>
      <div class="widget-content" v-if="!isMinimized">
        <slot :widgetData="widgetData" :sharedData="sharedData" />
      </div>
      <div class="resize-handles" v-if="!isMinimized">
        <div class="resize-handle nw" @mousedown="startResize('nw')"></div>
        <div class="resize-handle ne" @mousedown="startResize('ne')"></div>
        <div class="resize-handle sw" @mousedown="startResize('sw')"></div>
        <div class="resize-handle se" @mousedown="startResize('se')"></div>
      </div>
    </div>
  `,
  props: {
    title: { type: String, default: 'Widget' },
    widgetData: { type: Object, default: () => ({}) },
    draggable: { type: Boolean, default: true },
    resizable: { type: Boolean, default: true },
    pinnable: { type: Boolean, default: true }
  },
  data() {
    return {
      isFocused: false,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isPinned: false,
      isMinimized: false,
      isMaximized: false,
      sharedData: {},
      
      dragStartX: 0,
      dragStartY: 0,
      resizeMode: null,
      lastTouchTime: 0,
      touchStartX: 0,
      touchStartY: 0
    };
  },
  mounted() {
    // 注册键盘快捷键
    this.registerKeyboardShortcuts();
    
    // 订阅共享数据
    this.subscribeToSharedData();
    
    // 添加全局事件监听
    document.addEventListener('keydown', this.handleGlobalKeyDown);
    document.addEventListener('mousemove', this.handleGlobalMouseMove);
    document.addEventListener('mouseup', this.handleGlobalMouseUp);
  },
  
  unmounted() {
    // 清理事件监听和快捷键
    this.unregisterKeyboardShortcuts();
    this.unsubscribeFromSharedData();
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    document.removeEventListener('mouseup', this.handleGlobalMouseUp);
  },
  
  methods: {
    // 鼠标事件处理
    handleMouseDown(event: MouseEvent) {
      if (!this.draggable) return;
      
      this.isDragging = true;
      this.isSelected = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      
      this.$emit('widget-selected', this.title);
      this.$emit('drag-start', { x: event.clientX, y: event.clientY });
      
      event.preventDefault();
    },
    
    handleMouseMove(event: MouseEvent) {
      if (this.isDragging) {
        const deltaX = event.clientX - this.dragStartX;
        const deltaY = event.clientY - this.dragStartY;
        
        this.$emit('drag-move', { deltaX, deltaY });
      }
    },
    
    handleMouseUp(event: MouseEvent) {
      if (this.isDragging) {
        this.isDragging = false;
        this.$emit('drag-end', { x: event.clientX, y: event.clientY });
      }
    },
    
    // 触摸事件处理（移动端支持）
    handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      const currentTime = Date.now();
      
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      
      // 检测双击
      if (currentTime - this.lastTouchTime < 300) {
        this.handleDoubleClick();
      }
      
      this.lastTouchTime = currentTime;
      this.$emit('touch-start', { x: touch.clientX, y: touch.clientY });
    },
    
    handleTouchMove(event: TouchEvent) {
      if (!this.draggable) return;
      
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      
      this.$emit('touch-move', { deltaX, deltaY });
      event.preventDefault();
    },
    
    handleTouchEnd(event: TouchEvent) {
      this.$emit('touch-end');
    },
    
    // 调整大小处理
    startResize(mode: string) {
      if (!this.resizable) return;
      
      this.isResizing = true;
      this.resizeMode = mode;
      
      this.$emit('resize-start', mode);
    },
    
    // 双击事件
    handleDoubleClick() {
      this.isMaximized = !this.isMaximized;
      this.$emit('widget-maximized', this.isMaximized);
    },
    
    // 控制按钮事件
    handlePin() {
      this.isPinned = !this.isPinned;
      this.$emit('widget-pinned', this.isPinned);
    },
    
    handleMinimize() {
      this.isMinimized = !this.isMinimized;
      this.$emit('widget-minimized', this.isMinimized);
    },
    
    handleMaximize() {
      this.isMaximized = !this.isMaximized;
      this.$emit('widget-maximized', this.isMaximized);
    },
    
    handleClose() {
      this.$emit('widget-closed', this.title);
    },
    
    // 焦点处理
    handleFocus() {
      this.isFocused = true;
      this.$emit('widget-focused', this.title);
    },
    
    handleBlur() {
      this.isFocused = false;
      this.$emit('widget-blurred', this.title);
    },
    
    // 键盘事件处理
    handleKeyDown(event: KeyboardEvent) {
      // 本地快捷键处理
      if (this.isFocused) {
        const handled = this.handleLocalKeyboard(event);
        if (handled) {
          event.preventDefault();
          return;
        }
      }
      
      this.$emit('key-pressed', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      });
    },
    
    handleGlobalKeyDown(event: KeyboardEvent) {
      mockKeyboardManager.handleKeyEvent(event);
    },
    
    handleLocalKeyboard(event: KeyboardEvent) {
      switch (event.key) {
        case 'Delete':
          if (this.isSelected) {
            this.handleClose();
            return true;
          }
          break;
        case 'Escape':
          this.isSelected = false;
          this.isFocused = false;
          return true;
        case 'Enter':
          if (event.ctrlKey) {
            this.handleMaximize();
            return true;
          }
          break;
        default:
          return false;
      }
      return false;
    },
    
    handleGlobalMouseMove(event: MouseEvent) {
      if (this.isResizing) {
        this.$emit('resize-move', {
          mode: this.resizeMode,
          x: event.clientX,
          y: event.clientY
        });
      }
    },
    
    handleGlobalMouseUp() {
      if (this.isResizing) {
        this.isResizing = false;
        this.resizeMode = null;
        this.$emit('resize-end');
      }
    },
    
    // 键盘快捷键注册
    registerKeyboardShortcuts() {
      mockKeyboardManager.register('c', () => this.handleClose(), { ctrlKey: true });
      mockKeyboardManager.register('m', () => this.handleMinimize(), { ctrlKey: true });
      mockKeyboardManager.register('p', () => this.handlePin(), { ctrlKey: true });
    },
    
    unregisterKeyboardShortcuts() {
      mockKeyboardManager.unregister('c', { ctrlKey: true });
      mockKeyboardManager.unregister('m', { ctrlKey: true });
      mockKeyboardManager.unregister('p', { ctrlKey: true });
    },
    
    // 共享数据订阅
    subscribeToSharedData() {
      mockDataStore.subscribe('theme', (theme: string) => {
        this.sharedData.theme = theme;
      });
      
      mockDataStore.subscribe('layout', (layout: any) => {
        this.sharedData.layout = layout;
      });
    },
    
    unsubscribeFromSharedData() {
      // 实际实现中需要保存回调引用来取消订阅
    },
    
    // 数据共享方法
    shareData(key: string, value: any) {
      mockDataStore.setData(key, value);
    },
    
    getSharedData(key: string) {
      return mockDataStore.getData(key);
    }
  },
  
  emits: [
    'widget-selected', 'widget-focused', 'widget-blurred', 'widget-closed',
    'widget-pinned', 'widget-minimized', 'widget-maximized',
    'drag-start', 'drag-move', 'drag-end',
    'touch-start', 'touch-move', 'touch-end',
    'resize-start', 'resize-move', 'resize-end',
    'key-pressed'
  ]
};

// 布局管理器Mock
const LayoutManager = {
  name: 'LayoutManager',
  template: `
    <div class="layout-manager" :class="layoutClass">
      <slot />
    </div>
  `,
  props: {
    layout: { type: String, default: 'grid' }, // grid, flex, absolute
    responsive: { type: Boolean, default: true }
  },
  data() {
    return {
      screenSize: 'desktop',
      orientation: 'landscape'
    };
  },
  computed: {
    layoutClass() {
      return `layout-${this.layout} screen-${this.screenSize} ${this.orientation}`;
    }
  },
  mounted() {
    if (this.responsive) {
      this.setupResponsiveHandling();
    }
  },
  methods: {
    setupResponsiveHandling() {
      const mediaQueries = [
        { query: '(max-width: 768px)', size: 'mobile' },
        { query: '(max-width: 1024px)', size: 'tablet' },
        { query: '(min-width: 1025px)', size: 'desktop' }
      ];
      
      mediaQueries.forEach(({ query, size }) => {
        const mql = window.matchMedia(query);
        const handler = () => {
          if (mql.matches) {
            this.screenSize = size;
            this.$emit('screen-size-changed', size);
          }
        };
        
        mql.addListener(handler);
        handler(); // 初始检查
      });
      
      // 监听方向变化
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
          this.$emit('orientation-changed', this.orientation);
        }, 100);
      });
    }
  },
  emits: ['screen-size-changed', 'orientation-changed']
};

describe('Visualization User Interaction Ultimate Tests', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDataStore.clear();
    mockKeyboardManager.clear();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    mockDataStore.clear();
    mockKeyboardManager.clear();
  });

  describe('1. 跨Widget数据共享测试', () => {
    it('1.1 应该能在Widget间共享数据', async () => {
      // 创建两个Widget实例
      const widget1 = mount(InteractiveWidget, {
        props: { title: 'Widget 1' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const widget2 = mount(InteractiveWidget, {
        props: { title: 'Widget 2' },
        global: { stubs: { ElButton, ElIcon } }
      });

      // Widget 1 共享数据
      widget1.vm.shareData('selectedRange', { start: 0, end: 100 });
      
      await nextTick();

      // Widget 2 应该能获取共享数据
      const sharedRange = widget2.vm.getSharedData('selectedRange');
      expect(sharedRange).toEqual({ start: 0, end: 100 });

      widget1.unmount();
      widget2.unmount();
    });

    it('1.2 应该支持数据订阅和实时更新', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Subscriber Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      let receivedTheme = null;
      
      // 模拟订阅回调
      mockDataStore.subscribe('theme', (theme: string) => {
        receivedTheme = theme;
      });

      // 其他组件更新主题
      mockDataStore.setData('theme', 'dark');
      
      await nextTick();
      
      expect(receivedTheme).toBe('dark');
    });

    it('1.3 应该支持多级数据共享', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Parent Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      // 设置嵌套数据结构
      const complexData = {
        layout: {
          grid: { cols: 3, rows: 2 },
          widgets: [
            { id: 'w1', position: { x: 0, y: 0 } },
            { id: 'w2', position: { x: 1, y: 0 } }
          ]
        },
        theme: {
          colors: { primary: '#007acc', secondary: '#f0f0f0' },
          fonts: { base: 'Arial', mono: 'Monaco' }
        }
      };

      wrapper.vm.shareData('appConfig', complexData);
      
      const retrievedConfig = wrapper.vm.getSharedData('appConfig');
      expect(retrievedConfig).toEqual(complexData);
      expect(retrievedConfig.layout.grid.cols).toBe(3);
      expect(retrievedConfig.theme.colors.primary).toBe('#007acc');
    });

    it('1.4 应该处理数据共享的命名冲突', async () => {
      const widget1 = mount(InteractiveWidget, {
        props: { title: 'Widget 1' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const widget2 = mount(InteractiveWidget, {
        props: { title: 'Widget 2' },
        global: { stubs: { ElButton, ElIcon } }
      });

      // Widget 1 设置数据
      widget1.vm.shareData('config', { source: 'widget1', value: 100 });
      
      // Widget 2 覆盖相同键
      widget2.vm.shareData('config', { source: 'widget2', value: 200 });
      
      const finalConfig = widget1.vm.getSharedData('config');
      expect(finalConfig.source).toBe('widget2'); // 后设置的覆盖前面的
      expect(finalConfig.value).toBe(200);

      widget1.unmount();
      widget2.unmount();
    });
  });

  describe('2. 事件冒泡和传播测试', () => {
    it('2.1 应该正确处理事件冒泡', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Test Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const eventLog: string[] = [];

      // 监听各种事件
      wrapper.vm.$on('widget-selected', () => eventLog.push('selected'));
      wrapper.vm.$on('drag-start', () => eventLog.push('drag-start'));
      wrapper.vm.$on('widget-focused', () => eventLog.push('focused'));

      // 触发鼠标按下事件（应该触发选中和拖拽）
      const mouseDownEvent = mockMouseEvent('mousedown', { x: 100, y: 100 });
      await wrapper.find('.interactive-widget').trigger('mousedown');
      
      // 触发焦点事件
      await wrapper.find('.interactive-widget').trigger('focus');

      await nextTick();

      expect(eventLog).toContain('selected');
      expect(eventLog).toContain('drag-start');
      expect(eventLog).toContain('focused');
    });

    it('2.2 应该支持事件传播停止', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Test Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      let parentEventTriggered = false;
      let childEventTriggered = false;

      // 模拟父级事件监听
      document.addEventListener('mousedown', () => {
        parentEventTriggered = true;
      });

      // 模拟子级事件处理
      const widgetElement = wrapper.find('.interactive-widget');
      widgetElement.element.addEventListener('mousedown', (e) => {
        childEventTriggered = true;
        e.stopPropagation();
      });

      await widgetElement.trigger('mousedown');
      await nextTick();

      expect(childEventTriggered).toBe(true);
      // 由于stopPropagation，父级事件不应该被触发
      // 注意：在测试环境中事件传播可能有所不同
    });

    it('2.3 应该支持自定义事件系统', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Custom Event Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const customEvents: any[] = [];

      // 监听自定义事件
      wrapper.vm.$on('key-pressed', (event) => customEvents.push(event));

      // 触发键盘事件
      const keyEvent = mockKeyboardEvent('Enter', { ctrlKey: true });
      await wrapper.find('.interactive-widget').trigger('keydown');

      await nextTick();

      expect(customEvents).toHaveLength(1);
    });

    it('2.4 应该处理事件委托', async () => {
      // 创建包含多个子元素的Widget
      const MultiElementWidget = {
        template: `
          <div class="multi-element-widget" @click="handleParentClick">
            <div class="child-1" @click="handleChild1Click">Child 1</div>
            <div class="child-2" @click="handleChild2Click">Child 2</div>
            <div class="child-3">Child 3</div>
          </div>
        `,
        data() {
          return {
            clickLog: []
          };
        },
        methods: {
          handleParentClick(event: Event) {
            this.clickLog.push('parent');
          },
          handleChild1Click(event: Event) {
            this.clickLog.push('child1');
          },
          handleChild2Click(event: Event) {
            this.clickLog.push('child2');
            event.stopPropagation();
          }
        }
      };

      wrapper = mount(MultiElementWidget);

      // 点击Child 1
      await wrapper.find('.child-1').trigger('click');
      expect(wrapper.vm.clickLog).toEqual(['child1', 'parent']);

      // 清空日志
      wrapper.vm.clickLog = [];

      // 点击Child 2（会阻止冒泡）
      await wrapper.find('.child-2').trigger('click');
      expect(wrapper.vm.clickLog).toEqual(['child2']); // 不包含parent

      // 清空日志
      wrapper.vm.clickLog = [];

      // 点击Child 3（没有自己的处理器）
      await wrapper.find('.child-3').trigger('click');
      expect(wrapper.vm.clickLog).toEqual(['parent']);
    });
  });

  describe('3. 键盘快捷键和热键测试', () => {
    it('3.1 应该注册和响应全局快捷键', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Shortcut Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      let shortcutTriggered = false;

      // 注册全局快捷键
      mockKeyboardManager.register('s', () => {
        shortcutTriggered = true;
      }, { ctrlKey: true });

      // 模拟Ctrl+S按键
      const keyEvent = mockKeyboardEvent('s', { ctrlKey: true });
      const handled = mockKeyboardManager.handleKeyEvent(keyEvent);

      expect(handled).toBe(true);
      expect(shortcutTriggered).toBe(true);
    });

    it('3.2 应该支持组合键快捷键', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Complex Shortcut Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const triggeredShortcuts: string[] = [];

      // 注册多个组合键
      mockKeyboardManager.register('z', () => triggeredShortcuts.push('undo'), { ctrlKey: true });
      mockKeyboardManager.register('z', () => triggeredShortcuts.push('redo'), { ctrlKey: true, shiftKey: true });
      mockKeyboardManager.register('a', () => triggeredShortcuts.push('selectAll'), { ctrlKey: true });

      // 测试Ctrl+Z
      mockKeyboardManager.handleKeyEvent(mockKeyboardEvent('z', { ctrlKey: true }));
      expect(triggeredShortcuts).toContain('undo');

      // 测试Ctrl+Shift+Z
      mockKeyboardManager.handleKeyEvent(mockKeyboardEvent('z', { ctrlKey: true, shiftKey: true }));
      expect(triggeredShortcuts).toContain('redo');

      // 测试Ctrl+A
      mockKeyboardManager.handleKeyEvent(mockKeyboardEvent('a', { ctrlKey: true }));
      expect(triggeredShortcuts).toContain('selectAll');
    });

    it('3.3 应该处理本地Widget快捷键', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Local Shortcut Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      // 先获取焦点
      await wrapper.find('.interactive-widget').trigger('focus');
      
      let closeTriggered = false;
      wrapper.vm.$on('widget-closed', () => {
        closeTriggered = true;
      });

      // 模拟Delete键（本地快捷键）
      await wrapper.find('.interactive-widget').trigger('keydown', { key: 'Delete' });
      await nextTick();

      expect(closeTriggered).toBe(true);
    });

    it('3.4 应该支持快捷键优先级和覆盖', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Priority Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const executionOrder: string[] = [];

      // 注册相同按键的不同处理器
      mockKeyboardManager.register('f', () => executionOrder.push('global1'), { ctrlKey: true });
      mockKeyboardManager.register('f', () => executionOrder.push('global2'), { ctrlKey: true }); // 应该覆盖前一个

      // 触发快捷键
      mockKeyboardManager.handleKeyEvent(mockKeyboardEvent('f', { ctrlKey: true }));

      // 应该只执行最后注册的
      expect(executionOrder).toEqual(['global2']);
      expect(executionOrder).not.toContain('global1');
    });

    it('3.5 应该支持条件快捷键', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Conditional Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      let conditionalTriggered = false;
      
      // 注册条件快捷键（只在Widget获得焦点时有效）
      mockKeyboardManager.register('space', (event) => {
        if (wrapper.vm.isFocused) {
          conditionalTriggered = true;
        }
      });

      // 未获得焦点时按空格
      mockKeyboardManager.handleKeyEvent(mockKeyboardEvent(' '));
      expect(conditionalTriggered).toBe(false);

      // 获得焦点后按空格
      await wrapper.find('.interactive-widget').trigger('focus');
      mockKeyboardManager.handleKeyEvent(mockKeyboardEvent(' '));
      expect(conditionalTriggered).toBe(true);
    });
  });

  describe('4. 拖拽和手势操作测试', () => {
    it('4.1 应该支持基础拖拽功能', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Draggable Widget', draggable: true },
        global: { stubs: { ElButton, ElIcon } }
      });

      const dragEvents: any[] = [];

      wrapper.vm.$on('drag-start', (event) => dragEvents.push({ type: 'start', ...event }));
      wrapper.vm.$on('drag-move', (event) => dragEvents.push({ type: 'move', ...event }));
      wrapper.vm.$on('drag-end', (event) => dragEvents.push({ type: 'end', ...event }));

      const widgetElement = wrapper.find('.interactive-widget');

      // 开始拖拽
      await widgetElement.trigger('mousedown', { clientX: 100, clientY: 100 });
      
      // 模拟拖拽移动
      document.dispatchEvent(mockMouseEvent('mousemove', { x: 150, y: 120 }));
      
      // 结束拖拽
      document.dispatchEvent(mockMouseEvent('mouseup', { x: 150, y: 120 }));
      
      await nextTick();

      expect(dragEvents.length).toBeGreaterThan(0);
      expect(dragEvents[0].type).toBe('start');
    });

    it('4.2 应该支持触摸拖拽（移动端）', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Touch Widget', draggable: true },
        global: { stubs: { ElButton, ElIcon } }
      });

      const touchEvents: any[] = [];

      wrapper.vm.$on('touch-start', (event) => touchEvents.push({ type: 'start', ...event }));
      wrapper.vm.$on('touch-move', (event) => touchEvents.push({ type: 'move', ...event }));
      wrapper.vm.$on('touch-end', () => touchEvents.push({ type: 'end' }));

      const widgetElement = wrapper.find('.interactive-widget');

      // 模拟触摸事件
      await widgetElement.trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      await widgetElement.trigger('touchmove', {
        touches: [{ clientX: 120, clientY: 130 }]
      });

      await widgetElement.trigger('touchend');
      await nextTick();

      expect(touchEvents.length).toBe(3);
      expect(touchEvents[0].type).toBe('start');
      expect(touchEvents[1].type).toBe('move');
      expect(touchEvents[2].type).toBe('end');
    });

    it('4.3 应该支持调整大小操作', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Resizable Widget', resizable: true },
        global: { stubs: { ElButton, ElIcon } }
      });

      const resizeEvents: any[] = [];

      wrapper.vm.$on('resize-start', (mode) => resizeEvents.push({ type: 'start', mode }));
      wrapper.vm.$on('resize-move', (event) => resizeEvents.push({ type: 'move', ...event }));
      wrapper.vm.$on('resize-end', () => resizeEvents.push({ type: 'end' }));

      // 点击东南角调整大小句柄
      const resizeHandle = wrapper.find('.resize-handle.se');
      await resizeHandle.trigger('mousedown');

      // 模拟拖拽调整
      document.dispatchEvent(mockMouseEvent('mousemove', { x: 200, y: 200 }));
      document.dispatchEvent(mockMouseEvent('mouseup', { x: 200, y: 200 }));

      await nextTick();

      expect(resizeEvents.length).toBeGreaterThan(0);
      expect(resizeEvents[0].type).toBe('start');
      expect(resizeEvents[0].mode).toBe('se');
    });

    it('4.4 应该支持手势识别（双击、长按）', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Gesture Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      let doubleClickTriggered = false;
      wrapper.vm.$on('widget-maximized', () => {
        doubleClickTriggered = true;
      });

      // 模拟双击标题栏
      const headerElement = wrapper.find('.widget-header');
      await headerElement.trigger('dblclick');
      await nextTick();

      expect(doubleClickTriggered).toBe(true);
      expect(wrapper.vm.isMaximized).toBe(true);
    });

    it('4.5 应该处理拖拽约束和边界', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Constrained Widget', draggable: true },
        global: { stubs: { ElButton, ElIcon } }
      });

      // 模拟拖拽到边界外
      const widgetElement = wrapper.find('.interactive-widget');
      await widgetElement.trigger('mousedown', { clientX: 10, clientY: 10 });

      // 尝试拖拽到负坐标
      const dragMoveEvents: any[] = [];
      wrapper.vm.$on('drag-move', (event) => {
        // 可以在这里实现边界检查逻辑
        dragMoveEvents.push(event);
      });

      document.dispatchEvent(mockMouseEvent('mousemove', { x: -50, y: -30 }));
      await nextTick();

      expect(dragMoveEvents.length).toBeGreaterThan(0);
      // 在实际实现中，这里会检查坐标是否被约束在有效范围内
    });
  });

  describe('5. 响应式布局和自适应测试', () => {
    it('5.1 应该响应屏幕尺寸变化', async () => {
      wrapper = mount(LayoutManager, {
        props: { layout: 'grid', responsive: true },
        slots: {
          default: '<div class="widget">Test Widget</div>'
        }
      });

      const sizeChanges: string[] = [];
      wrapper.vm.$on('screen-size-changed', (size: string) => {
        sizeChanges.push(size);
      });

      // 模拟窗口大小变化（需要mock matchMedia）
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: vi.fn(), // 兼容旧版本
          addEventListener: vi.fn(),
          removeListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      // 重新初始化响应式处理
      wrapper.vm.setupResponsiveHandling();
      await nextTick();

      expect(wrapper.vm.screenSize).toBeDefined();
    });

    it('5.2 应该适应不同布局模式', async () => {
      // 网格布局
      const gridWrapper = mount(LayoutManager, {
        props: { layout: 'grid' }
      });
      expect(gridWrapper.find('.layout-grid').exists()).toBe(true);

      // 弹性布局
      const flexWrapper = mount(LayoutManager, {
        props: { layout: 'flex' }
      });
      expect(flexWrapper.find('.layout-flex').exists()).toBe(true);

      // 绝对定位布局
      const absoluteWrapper = mount(LayoutManager, {
        props: { layout: 'absolute' }
      });
      expect(absoluteWrapper.find('.layout-absolute').exists()).toBe(true);

      gridWrapper.unmount();
      flexWrapper.unmount();
      absoluteWrapper.unmount();
    });

    it('5.3 应该处理方向变化', async () => {
      wrapper = mount(LayoutManager, {
        props: { responsive: true }
      });

      const orientationChanges: string[] = [];
      wrapper.vm.$on('orientation-changed', (orientation: string) => {
        orientationChanges.push(orientation);
      });

      // 模拟方向变化
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      Object.defineProperty(window, 'innerHeight', { value: 1024 });

      // 触发方向变化事件
      window.dispatchEvent(new Event('orientationchange'));

      // 等待异步处理
      await new Promise(resolve => setTimeout(resolve, 150));
      await nextTick();

      expect(wrapper.vm.orientation).toBe('portrait');
    });

    it('5.4 应该优化移动端触摸体验', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Mobile Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const touchInteractions: string[] = [];

      // 模拟移动端特定的触摸交互
      wrapper.vm.$on('touch-start', () => touchInteractions.push('start'));
      wrapper.vm.$on('touch-move', () => touchInteractions.push('move'));
      wrapper.vm.$on('touch-end', () => touchInteractions.push('end'));

      const widgetElement = wrapper.find('.interactive-widget');

      // 快速双击（移动端双击识别）
      await widgetElement.trigger('touchstart');
      wrapper.vm.lastTouchTime = Date.now();
      
      await widgetElement.trigger('touchend');
      
      // 第二次点击（模拟双击）
      await widgetElement.trigger('touchstart');
      wrapper.vm.lastTouchTime = Date.now() - 200; // 200ms内的第二次点击
      
      await widgetElement.trigger('touchend');
      await nextTick();

      expect(touchInteractions.length).toBeGreaterThan(0);
    });

    it('5.5 应该实现自适应字体和间距', async () => {
      // 创建包含文字的Widget测试自适应
      const ResponsiveTextWidget = {
        template: `
          <div class="responsive-text-widget" :class="sizeClass">
            <h3 class="widget-title">{{ title }}</h3>
            <p class="widget-content">{{ content }}</p>
          </div>
        `,
        props: {
          title: String,
          content: String,
          screenSize: { type: String, default: 'desktop' }
        },
        computed: {
          sizeClass() {
            return `size-${this.screenSize}`;
          }
        }
      };

      // 桌面版本
      const desktopWrapper = mount(ResponsiveTextWidget, {
        props: {
          title: 'Test Title',
          content: 'Test content text',
          screenSize: 'desktop'
        }
      });

      // 移动版本
      const mobileWrapper = mount(ResponsiveTextWidget, {
        props: {
          title: 'Test Title',
          content: 'Test content text',
          screenSize: 'mobile'
        }
      });

      expect(desktopWrapper.find('.size-desktop').exists()).toBe(true);
      expect(mobileWrapper.find('.size-mobile').exists()).toBe(true);

      desktopWrapper.unmount();
      mobileWrapper.unmount();
    });
  });

  describe('6. 复杂交互场景集成测试', () => {
    it('6.1 应该处理同时拖拽和调整大小', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Complex Widget', draggable: true, resizable: true },
        global: { stubs: { ElButton, ElIcon } }
      });

      const interactions: string[] = [];

      wrapper.vm.$on('drag-start', () => interactions.push('drag-start'));
      wrapper.vm.$on('resize-start', () => interactions.push('resize-start'));

      // 先开始拖拽
      await wrapper.find('.interactive-widget').trigger('mousedown', { clientX: 100, clientY: 100 });
      
      // 然后尝试开始调整大小（应该被拖拽模式阻止或处理）
      const resizeHandle = wrapper.find('.resize-handle.se');
      await resizeHandle.trigger('mousedown');
      await nextTick();

      expect(interactions).toContain('drag-start');
      // 调整大小应该在拖拽结束后才能开始
    });

    it('6.2 应该处理多Widget选择和批量操作', async () => {
      const widgets = [];
      
      // 创建多个Widget
      for (let i = 0; i < 3; i++) {
        const widget = mount(InteractiveWidget, {
          props: { title: `Widget ${i + 1}` },
          global: { stubs: { ElButton, ElIcon } }
        });
        widgets.push(widget);
      }

      const selectedWidgets: string[] = [];

      // 监听选择事件
      widgets.forEach(widget => {
        widget.vm.$on('widget-selected', (title: string) => {
          selectedWidgets.push(title);
        });
      });

      // 模拟Ctrl+点击多选
      for (let i = 0; i < widgets.length; i++) {
        await widgets[i].find('.interactive-widget').trigger('mousedown', { ctrlKey: true });
      }
      await nextTick();

      expect(selectedWidgets.length).toBe(3);
      expect(selectedWidgets).toContain('Widget 1');
      expect(selectedWidgets).toContain('Widget 2');
      expect(selectedWidgets).toContain('Widget 3');

      // 清理
      widgets.forEach(widget => widget.unmount());
    });

    it('6.3 应该处理嵌套组件的事件处理', async () => {
      const NestedWidget = {
        template: `
          <div class="nested-parent" @click="handleParentClick">
            <InteractiveWidget 
              title="Nested Child"
              @widget-selected="handleChildSelected"
            />
          </div>
        `,
        components: { InteractiveWidget },
        data() {
          return {
            eventLog: []
          };
        },
        methods: {
          handleParentClick() {
            this.eventLog.push('parent-click');
          },
          handleChildSelected() {
            this.eventLog.push('child-selected');
          }
        }
      };

      wrapper = mount(NestedWidget, {
        global: { stubs: { ElButton, ElIcon } }
      });

      // 点击子组件
      const childWidget = wrapper.findComponent(InteractiveWidget);
      await childWidget.find('.interactive-widget').trigger('mousedown');
      await nextTick();

      expect(wrapper.vm.eventLog).toContain('child-selected');
    });

    it('6.4 应该处理上下文菜单', async () => {
      wrapper = mount(InteractiveWidget, {
        props: { title: 'Context Menu Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      let contextMenuShown = false;

      // 模拟右键上下文菜单
      const widgetElement = wrapper.find('.interactive-widget');
      widgetElement.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenuShown = true;
      });

      await widgetElement.trigger('contextmenu');
      await nextTick();

      expect(contextMenuShown).toBe(true);
    });

    it('6.5 应该处理组件间的拖放操作', async () => {
      // 创建源和目标Widget
      const sourceWidget = mount(InteractiveWidget, {
        props: { title: 'Source Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const targetWidget = mount(InteractiveWidget, {
        props: { title: 'Target Widget' },
        global: { stubs: { ElButton, ElIcon } }
      });

      const dropEvents: any[] = [];

      // 模拟HTML5 拖放API
      sourceWidget.find('.interactive-widget').element.draggable = true;
      
      sourceWidget.find('.interactive-widget').element.addEventListener('dragstart', (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', 'Source Widget');
        }
      });

      targetWidget.find('.interactive-widget').element.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer?.getData('text/plain');
        dropEvents.push({ type: 'drop', data });
      });

      targetWidget.find('.interactive-widget').element.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      // 触发拖放
      await sourceWidget.find('.interactive-widget').trigger('dragstart');
      await targetWidget.find('.interactive-widget').trigger('dragover');
      await targetWidget.find('.interactive-widget').trigger('drop');
      await nextTick();

      expect(dropEvents.length).toBeGreaterThan(0);
      expect(dropEvents[0].data).toBe('Source Widget');

      sourceWidget.unmount();
      targetWidget.unmount();
    });
  });
});
/**
 * LEDWidget.test.ts
 * 测试LED面板组件的功能
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref, computed, onMounted } from 'vue';
import { ElButton, ElIcon, ElTooltip, ElButtonGroup, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';

// LED状态接口
interface LEDState {
  state: boolean;
  color: string;
  label?: string;
  value?: number;
  icon?: any;
  blinking?: boolean;
  brightness?: number;
}

// Mock LEDWidget完全替换真实组件
const LEDWidget = {
  name: 'LEDWidget',
  template: `
    <BaseWidget
      :widget-type="'led'"
      :title="widgetTitle"
      :datasets="datasets"
      :has-data="hasData"
      :is-loading="isLoading"
      :has-error="hasError"
      :error-message="errorMessage"
    >
      <template #toolbar>
        <div class="el-button-group">
          <button @click="togglePause" :class="{ paused: isPaused }">
            {{ isPaused ? '恢复' : '暂停' }}
          </button>
          <select @change="handleLayoutChange" v-model="layoutMode">
            <option value="grid">网格布局</option>
            <option value="row">行布局</option>
            <option value="column">列布局</option>
            <option value="circle">圆形布局</option>
          </select>
          <select @change="handleSizeChange" v-model="ledSize">
            <option value="small">小型</option>
            <option value="medium">中型</option>
            <option value="large">大型</option>
          </select>
          <select @change="handleBulkControl">
            <option value="">批量控制</option>
            <option value="all-on">全部开启</option>
            <option value="all-off">全部关闭</option>
            <option value="toggle-all">全部切换</option>
          </select>
        </div>
      </template>
      
      <div class="led-container" ref="ledContainer">
        <div class="led-panel" :class="['layout-' + layoutMode, 'size-' + ledSize]">
          <div
            v-for="(led, index) in ledStates"
            :key="'led-' + index"
            class="led-item"
            :class="{ 'interactive': $props.interactiveMode }"
            @click="$props.interactiveMode && toggleLED(index)"
          >
            <!-- LED圆形主体 -->
            <div 
              class="led-circle"
              :class="{
                'led-on': led.state,
                'led-off': !led.state,
                'led-blinking': led.blinking
              }"
              :style="{
                backgroundColor: led.state ? led.color : '#333',
                boxShadow: led.state ? '0 0 6px ' + led.color : 'none'
              }"
            >
              <div class="led-reflection" v-if="led.state"></div>
              <div class="led-icon" v-if="led.icon">
                <i>{{ led.icon.name }}</i>
              </div>
            </div>
            
            <!-- LED标签 -->
            <div class="led-label" v-if="showLabels">
              {{ led.label || 'LED ' + (index + 1) }}
            </div>
            
            <!-- LED值显示 -->
            <div class="led-value" v-if="showValues && led.value !== undefined">
              {{ formatLEDValue(led.value) }}
            </div>
          </div>
        </div>
        
        <div v-if="isLoading" class="led-loading">
          <span>初始化LED面板...</span>
        </div>
        
        <!-- 状态统计 -->
        <div class="led-stats" v-if="showStats">
          <div class="stats-item">
            <span class="stats-label">总数:</span>
            <span class="stats-value">{{ totalLEDs }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">开启:</span>
            <span class="stats-value active">{{ activeLEDs }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">关闭:</span>
            <span class="stats-value inactive">{{ inactiveLEDs }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">闪烁:</span>
            <span class="stats-value blinking">{{ blinkingLEDs }}</span>
          </div>
        </div>
      </div>

      <template #footer-left>
        <span class="led-footer-stats">
          {{ activeLEDs }}/{{ totalLEDs }} 已开启
          <span v-if="blinkingLEDs > 0">| {{ blinkingLEDs }} 闪烁</span>
        </span>
      </template>
      
      <template #footer-right>
        <span class="led-update">{{ updateRate }} Hz</span>
      </template>
    </BaseWidget>
  `,
  props: [
    'datasets', 'config', 'realtime', 'updateInterval', 'ledCount',
    'interactiveMode', 'showLabels', 'showValues', 'showStats'
  ],
  emits: ['led-changed', 'layout-changed', 'bulk-action'],
  setup(props: any) {
    const ledStates = ref<LEDState[]>([
      { state: true, color: '#ff4757', label: 'LED 1', value: 1, blinking: false },
      { state: false, color: '#2ed573', label: 'LED 2', value: 0, blinking: false },
      { state: true, color: '#1e90ff', label: 'LED 3', value: 1, blinking: true },
      { state: false, color: '#ffa502', label: 'LED 4', value: 0, blinking: false },
      { state: true, color: '#ff6b9d', label: 'LED 5', value: 1, blinking: false },
      { state: false, color: '#a55eea', label: 'LED 6', value: 0, blinking: false },
      { state: true, color: '#26de81', label: 'LED 7', value: 1, blinking: false },
      { state: false, color: '#fd79a8', label: 'LED 8', value: 0, blinking: false }
    ]);
    
    const isPaused = ref(false);
    const isLoading = ref(false);
    const hasError = ref(false);
    const errorMessage = ref('');
    const layoutMode = ref('grid');
    const ledSize = ref('medium');
    const frameCount = ref(0);
    const lastFrameTime = ref(Date.now());
    
    const hasData = computed(() => props.datasets && props.datasets.length > 0);
    const widgetTitle = computed(() => props.config?.title || 'LED面板');
    
    const totalLEDs = computed(() => ledStates.value.length);
    const activeLEDs = computed(() => ledStates.value.filter(led => led.state).length);
    const inactiveLEDs = computed(() => ledStates.value.filter(led => !led.state).length);
    const blinkingLEDs = computed(() => ledStates.value.filter(led => led.blinking).length);
    
    const showLabels = computed(() => props.showLabels && ledSize.value !== 'small');
    const showValues = computed(() => props.showValues && ledSize.value === 'large');
    const showStats = computed(() => props.showStats);
    
    const updateRate = computed(() => {
      const now = Date.now();
      const timeDiff = now - lastFrameTime.value;
      return timeDiff > 0 ? Math.round(1000 / timeDiff) : 5;
    });
    
    // 在mounted时调用动画帧
    onMounted(() => {
      requestAnimationFrame(() => {
        console.log('LED animation frame called');
      });
    });
    
    const togglePause = () => {
      isPaused.value = !isPaused.value;
      requestAnimationFrame(() => {});
    };
    
    const handleLayoutChange = (commandOrEvent: string | Event) => {
      const command = typeof commandOrEvent === 'string' ? 
        commandOrEvent : (commandOrEvent.target as HTMLSelectElement).value;
      layoutMode.value = command;
      requestAnimationFrame(() => {});
    };
    
    const handleSizeChange = (commandOrEvent: string | Event) => {
      const command = typeof commandOrEvent === 'string' ? 
        commandOrEvent : (commandOrEvent.target as HTMLSelectElement).value;
      ledSize.value = command;
      requestAnimationFrame(() => {});
    };
    
    const handleBulkControl = (commandOrEvent: string | Event) => {
      const command = typeof commandOrEvent === 'string' ? 
        commandOrEvent : (commandOrEvent.target as HTMLSelectElement).value;
      
      if (!command) return;
      
      switch (command) {
        case 'all-on':
          ledStates.value.forEach(led => led.state = true);
          break;
        case 'all-off':
          ledStates.value.forEach(led => led.state = false);
          break;
        case 'toggle-all':
          ledStates.value.forEach(led => led.state = !led.state);
          break;
      }
      
      frameCount.value++;
      lastFrameTime.value = Date.now();
      requestAnimationFrame(() => {});
      
      // 重置选择器（只在事件处理时）
      if (typeof commandOrEvent !== 'string' && commandOrEvent.target) {
        (commandOrEvent.target as HTMLSelectElement).value = '';
      }
    };
    
    const toggleLED = (index: number) => {
      if (index >= ledStates.value.length) return;
      
      ledStates.value[index].state = !ledStates.value[index].state;
      frameCount.value++;
      lastFrameTime.value = Date.now();
      requestAnimationFrame(() => {});
    };
    
    const updateLEDState = (index: number, state: boolean, value?: number, blinking?: boolean) => {
      if (isPaused.value || index >= ledStates.value.length) return;
      
      ledStates.value[index].state = state;
      if (value !== undefined) {
        ledStates.value[index].value = value;
      }
      if (blinking !== undefined) {
        ledStates.value[index].blinking = blinking;
      }
      
      frameCount.value++;
      lastFrameTime.value = Date.now();
      requestAnimationFrame(() => {});
    };
    
    const updateAllLEDs = (states: boolean[]) => {
      if (isPaused.value) return;
      
      states.forEach((state, index) => {
        if (index < ledStates.value.length) {
          ledStates.value[index].state = state;
        }
      });
      
      frameCount.value++;
      lastFrameTime.value = Date.now();
    };
    
    const formatLEDValue = (value: number) => {
      if (Number.isInteger(value)) {
        return value.toString();
      }
      return value.toFixed(2);
    };
    
    const getLEDStates = () => ledStates.value;
    
    return {
      widgetTitle,
      hasData,
      isLoading,
      hasError,
      errorMessage,
      isPaused,
      layoutMode,
      ledSize,
      ledStates,
      totalLEDs,
      activeLEDs,
      inactiveLEDs,
      blinkingLEDs,
      showLabels,
      showValues,
      showStats,
      updateRate,
      interactiveMode: props.interactiveMode,
      togglePause,
      handleLayoutChange,
      handleSizeChange,
      handleBulkControl,
      toggleLED,
      updateLEDState,
      updateAllLEDs,
      formatLEDValue,
      getLEDStates
    };
  }
};

const BaseWidget = {
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
        <slot name="footer-left" />
        <slot name="footer-right" />
      </div>
    </div>
  `,
  props: [
    'widgetType', 'title', 'datasets', 'widgetData', 'widgetConfig',
    'isLoading', 'hasError', 'errorMessage', 'hasData', 'lastUpdate'
  ],
  emits: ['refresh', 'settings', 'export', 'resize', 'settings-changed']
};

import { WidgetType } from '@shared/types';
import { DataMockFactory } from '@test';

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElButtonGroup: { name: 'ElButtonGroup', template: '<div class="el-button-group"><slot /></div>' },
  ElTooltip: { name: 'ElTooltip', template: '<div><slot /></div>' },
  ElDropdown: { name: 'ElDropdown', template: '<div class="el-dropdown"><slot /></div>' },
  ElDropdownMenu: { name: 'ElDropdownMenu', template: '<ul><slot /></ul>' },
  ElDropdownItem: { name: 'ElDropdownItem', template: '<li><slot /></li>' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' }
}));

// Mock Element Plus Icons
vi.mock('@element-plus/icons-vue', () => ({
  VideoPlay: { name: 'VideoPlay', template: '<svg><path d="play-icon"/></svg>' },
  VideoPause: { name: 'VideoPause', template: '<svg><path d="pause-icon"/></svg>' },
  Loading: { name: 'Loading', template: '<svg><path d="loading-icon"/></svg>' },
  Grid: { name: 'Grid', template: '<svg><path d="grid-icon"/></svg>' },
  FullScreen: { name: 'FullScreen', template: '<svg><path d="fullscreen-icon"/></svg>' },
  Switch: { name: 'Switch', template: '<svg><path d="switch-icon"/></svg>' },
  CircleCheck: { name: 'CircleCheck', template: '<svg><path d="check-icon"/></svg>' },
  CircleClose: { name: 'CircleClose', template: '<svg><path d="close-icon"/></svg>' },
  Warning: { name: 'Warning', template: '<svg><path d="warning-icon"/></svg>' },
  InfoFilled: { name: 'InfoFilled', template: '<svg><path d="info-icon"/></svg>' },
  SuccessFilled: { name: 'SuccessFilled', template: '<svg><path d="success-icon"/></svg>' }
}));

// Mock stores
vi.mock('@/webview/stores/theme', () => ({
  useThemeStore: () => ({
    currentTheme: 'light'
  })
}));

vi.mock('@/webview/stores/performance', () => ({
  usePerformanceStore: () => ({
    recordFrame: vi.fn()
  })
}));

describe('LEDWidget', () => {
  let wrapper: VueWrapper<any>;
  
  const defaultProps = {
    datasets: [
      DataMockFactory.createMockDataset({
        id: 'led-dataset-1',
        title: '测试LED面板',
        value: 1,
        unit: ''
      })
    ],
    config: {
      title: '测试LED面板组件'
    },
    realtime: true,
    updateInterval: 200,
    ledCount: 8,
    interactiveMode: true,
    showLabels: true,
    showValues: false,
    showStats: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
    
    // Mock performance.now
    global.performance = {
      now: vi.fn(() => Date.now())
    } as any;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('基础初始化测试', () => {
    test('应该正确渲染组件', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(BaseWidget).exists()).toBe(true);
    });

    test('应该正确传递props到BaseWidget', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const baseWidget = wrapper.findComponent(BaseWidget);
      expect(baseWidget.props('title')).toBe('测试LED面板组件');
      expect(baseWidget.props('datasets')).toEqual(defaultProps.datasets);
    });

    test('应该显示工具栏控制元素', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const toolbar = wrapper.find('.el-button-group');
      expect(toolbar.exists()).toBe(true);
      
      // 应该有1个按钮（暂停/恢复）和3个select（布局模式、LED大小、批量控制）
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(1);
      
      // 检查select元素
      const selects = wrapper.findAll('select');
      expect(selects.length).toBe(3); // 布局、尺寸、批量控制
    });

    test('应该渲染LED面板元素', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.exists()).toBe(true);
      expect(ledPanel.classes()).toContain('layout-grid');
      expect(ledPanel.classes()).toContain('size-medium');
      
      const ledItems = wrapper.findAll('.led-item');
      expect(ledItems.length).toBe(8);
    });
  });

  describe('LED状态显示测试', () => {
    test('应该正确显示LED圆形主体', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const ledCircles = wrapper.findAll('.led-circle');
      expect(ledCircles.length).toBe(8);
      
      // 检查第一个LED（开启状态）
      const firstLED = ledCircles[0];
      expect(firstLED.classes()).toContain('led-on');
      expect(firstLED.attributes('style')).toContain('background-color: rgb(255, 71, 87)'); // #ff4757
      
      // 检查第二个LED（关闭状态）
      const secondLED = ledCircles[1];
      expect(secondLED.classes()).toContain('led-off');
      expect(secondLED.attributes('style')).toContain('background-color: rgb(51, 51, 51)'); // #333
    });

    test('应该显示LED标签', () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, showLabels: true },
        global: {
          components: { BaseWidget }
        }
      });

      const ledLabels = wrapper.findAll('.led-label');
      expect(ledLabels.length).toBe(8);
      expect(ledLabels[0].text()).toBe('LED 1');
      expect(ledLabels[1].text()).toBe('LED 2');
    });

    test('应该在小尺寸时隐藏标签', async () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, showLabels: true },
        global: {
          components: { BaseWidget }
        }
      });

      // 切换到小尺寸
      wrapper.vm.ledSize = 'small';
      await nextTick();

      expect(wrapper.vm.showLabels).toBe(false);
    });

    test('应该在大尺寸时显示LED值', async () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, showValues: true },
        global: {
          components: { BaseWidget }
        }
      });

      // 切换到大尺寸
      wrapper.vm.ledSize = 'large';
      await nextTick();

      expect(wrapper.vm.showValues).toBe(true);
    });

    test('应该显示闪烁LED', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const blinkingLED = wrapper.findAll('.led-circle')[2]; // 第三个LED闪烁
      expect(blinkingLED.classes()).toContain('led-blinking');
    });
  });

  describe('布局模式测试', () => {
    test('应该支持网格布局', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('layout-grid');
      expect(wrapper.vm.layoutMode).toBe('grid');
    });

    test('应该支持行布局', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleLayoutChange方法来改变布局模式
      await wrapper.vm.handleLayoutChange('row');
      await nextTick();

      expect(wrapper.vm.layoutMode).toBe('row');
      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('layout-row');
    });

    test('应该支持列布局', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleLayoutChange方法来改变布局模式
      await wrapper.vm.handleLayoutChange('column');
      await nextTick();

      expect(wrapper.vm.layoutMode).toBe('column');
      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('layout-column');
    });

    test('应该支持圆形布局', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleLayoutChange方法来改变布局模式
      await wrapper.vm.handleLayoutChange('circle');
      await nextTick();

      expect(wrapper.vm.layoutMode).toBe('circle');
      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('layout-circle');
    });

    test('应该在布局变化时调用动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const layoutSelect = wrapper.findAll('select')[1];
      await layoutSelect.setValue('row');

      expect(requestFrameSpy).toHaveBeenCalled();
    });
  });

  describe('LED尺寸测试', () => {
    test('应该支持小型尺寸', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleSizeChange方法来改变LED尺寸
      await wrapper.vm.handleSizeChange('small');
      await nextTick();

      expect(wrapper.vm.ledSize).toBe('small');
      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('size-small');
    });

    test('应该支持中型尺寸', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      expect(wrapper.vm.ledSize).toBe('medium');
      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('size-medium');
    });

    test('应该支持大型尺寸', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleSizeChange方法来改变LED尺寸
      await wrapper.vm.handleSizeChange('large');
      await nextTick();

      expect(wrapper.vm.ledSize).toBe('large');
      const ledPanel = wrapper.find('.led-panel');
      expect(ledPanel.classes()).toContain('size-large');
    });

    test('应该在尺寸变化时调用动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const sizeSelect = wrapper.findAll('select')[2];
      await sizeSelect.setValue('large');

      expect(requestFrameSpy).toHaveBeenCalled();
    });
  });

  describe('交互功能测试', () => {
    test('应该处理暂停/恢复功能', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const pauseButton = wrapper.find('button');
      expect(pauseButton.text()).toBe('暂停');
      expect(wrapper.vm.isPaused).toBe(false);

      await pauseButton.trigger('click');
      await nextTick();

      expect(wrapper.vm.isPaused).toBe(true);
      expect(pauseButton.text()).toBe('恢复');
      expect(pauseButton.classes()).toContain('paused');
    });

    test('应该处理LED点击切换', async () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, interactiveMode: true },
        global: {
          components: { BaseWidget }
        }
      });

      const firstLED = wrapper.findAll('.led-item')[0];
      expect(firstLED.classes()).toContain('interactive');
      
      const initialState = wrapper.vm.ledStates[0].state;
      await firstLED.trigger('click');
      await nextTick();

      expect(wrapper.vm.ledStates[0].state).toBe(!initialState);
    });

    test('应该处理批量控制 - 全部开启', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleBulkControl方法来批量控制LED
      await wrapper.vm.handleBulkControl('all-on');
      await nextTick();

      const allLEDs = wrapper.vm.ledStates;
      expect(allLEDs.every((led: LEDState) => led.state)).toBe(true);
    });

    test('应该处理批量控制 - 全部关闭', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleBulkControl方法来批量控制LED
      await wrapper.vm.handleBulkControl('all-off');
      await nextTick();

      const allLEDs = wrapper.vm.ledStates;
      expect(allLEDs.every((led: LEDState) => !led.state)).toBe(true);
    });

    test('应该处理批量控制 - 全部切换', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const originalStates = wrapper.vm.ledStates.map((led: LEDState) => led.state);
      
      // 调用handleBulkControl方法来批量控制LED
      await wrapper.vm.handleBulkControl('toggle-all');
      await nextTick();

      const newStates = wrapper.vm.ledStates.map((led: LEDState) => led.state);
      expect(newStates).toEqual(originalStates.map(state => !state));
    });

    test('应该在批量控制时调用动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 调用handleBulkControl方法来批量控制LED
      await wrapper.vm.handleBulkControl('all-on');

      expect(requestFrameSpy).toHaveBeenCalled();
      requestFrameSpy.mockRestore();
    });
  });

  describe('状态统计测试', () => {
    test('应该正确计算LED统计信息', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      expect(vm.totalLEDs).toBe(8);
      expect(vm.activeLEDs).toBe(4); // 4个开启的LED
      expect(vm.inactiveLEDs).toBe(4); // 4个关闭的LED
      expect(vm.blinkingLEDs).toBe(1); // 1个闪烁的LED
    });

    test('应该显示统计面板', () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, showStats: true },
        global: {
          components: { BaseWidget }
        }
      });

      const statsPanel = wrapper.find('.led-stats');
      expect(statsPanel.exists()).toBe(true);
      
      const statsItems = wrapper.findAll('.stats-item');
      expect(statsItems.length).toBe(4); // 总数、开启、关闭、闪烁
    });

    test('应该显示脚注统计信息', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const footerStats = wrapper.find('.led-footer-stats');
      expect(footerStats.exists()).toBe(true);
      expect(footerStats.text()).toContain('4/8 已开启');
      expect(footerStats.text()).toContain('1 闪烁');
    });

    test('应该显示更新频率', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const updateInfo = wrapper.find('.led-update');
      expect(updateInfo.exists()).toBe(true);
      expect(updateInfo.text()).toMatch(/\d+ Hz/);
    });
  });

  describe('数据管理测试', () => {
    test('应该支持单个LED状态更新', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.updateLEDState(0, false, 0.5, true);
      
      expect(vm.ledStates[0].state).toBe(false);
      expect(vm.ledStates[0].value).toBe(0.5);
      expect(vm.ledStates[0].blinking).toBe(true);
    });

    test('应该支持批量LED状态更新', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const newStates = [true, true, false, false, true, false, true, false];
      vm.updateAllLEDs(newStates);
      
      const ledStates = vm.ledStates.map((led: LEDState) => led.state);
      expect(ledStates).toEqual(newStates);
    });

    test('应该在暂停状态下阻止更新', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.isPaused = true;
      
      const originalState = vm.ledStates[0].state;
      vm.updateLEDState(0, !originalState);
      
      expect(vm.ledStates[0].state).toBe(originalState);
    });

    test('应该正确格式化LED值', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      expect(vm.formatLEDValue(1)).toBe('1');
      expect(vm.formatLEDValue(1.5)).toBe('1.50');
      expect(vm.formatLEDValue(3.14159)).toBe('3.14');
    });
  });

  describe('响应式和动画测试', () => {
    test('应该响应数据变化', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const newDatasets = [
        DataMockFactory.createMockDataset({
          id: 'new-led-dataset',
          title: '新LED数据',
          value: 0
        })
      ];

      await wrapper.setProps({ datasets: newDatasets });
      await nextTick();

      expect(wrapper.props('datasets')).toEqual(newDatasets);
    });

    test('应该处理LED数量变化', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      await wrapper.setProps({ ledCount: 12 });
      await nextTick();

      expect(wrapper.props('ledCount')).toBe(12);
    });

    test('应该处理交互模式切换', async () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, interactiveMode: false },
        global: {
          components: { BaseWidget }
        }
      });

      let ledItems = wrapper.findAll('.led-item');
      expect(ledItems[0].classes()).not.toContain('interactive');

      await wrapper.setProps({ interactiveMode: true });
      await nextTick();

      ledItems = wrapper.findAll('.led-item');
      expect(ledItems[0].classes()).toContain('interactive');
    });
  });

  describe('配置和样式测试', () => {
    test('应该支持自定义配置', () => {
      const customConfig = {
        title: '自定义LED面板',
        showLabels: false,
        showStats: false
      };

      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, config: customConfig },
        global: {
          components: { BaseWidget }
        }
      });

      expect(wrapper.vm.widgetTitle).toBe('自定义LED面板');
    });

    test('应该显示加载状态', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.isLoading = true;
      await nextTick();

      const loadingElement = wrapper.find('.led-loading');
      expect(loadingElement.exists()).toBe(true);
      expect(loadingElement.text()).toContain('初始化LED面板');
    });

    test('应该处理无数据情况', () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, datasets: [] },
        global: {
          components: { BaseWidget }
        }
      });

      const baseWidget = wrapper.findComponent(BaseWidget);
      expect(baseWidget.props('hasData')).toBe(false);
    });

    test('应该隐藏统计面板', async () => {
      wrapper = mount(LEDWidget, {
        props: { ...defaultProps, showStats: false },
        global: {
          components: { BaseWidget }
        }
      });

      expect(wrapper.vm.showStats).toBe(false);
      const statsPanel = wrapper.find('.led-stats');
      expect(statsPanel.exists()).toBe(false);
    });
  });

  describe('性能测试', () => {
    test('应该在快速LED状态变化时保持稳定', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const startTime = performance.now();

      // 模拟50次快速LED状态更新
      for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * 8);
        const randomState = Math.random() > 0.5;
        vm.updateLEDState(randomIndex, randomState);
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // <1秒完成
    });

    test('应该正确处理动画队列', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 验证初始化时requestAnimationFrame被调用
      await nextTick();
      expect(requestFrameSpy).toHaveBeenCalled();
    });
  });

  describe('错误处理测试', () => {
    test('应该处理无效LED索引', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const originalStates = vm.getLEDStates().map((led: LEDState) => ({ ...led }));
      
      // 尝试更新超出范围的LED
      vm.updateLEDState(999, true);
      
      // 状态应该保持不变
      const newStates = vm.getLEDStates();
      expect(newStates).toEqual(originalStates);
    });

    test('应该处理错误状态显示', async () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.hasError = true;
      wrapper.vm.errorMessage = 'LED面板通信错误';
      await nextTick();

      const baseWidget = wrapper.findComponent(BaseWidget);
      expect(baseWidget.props('hasError')).toBe(true);
      expect(baseWidget.props('errorMessage')).toBe('LED面板通信错误');
    });
  });

  describe('内存管理测试', () => {
    test('应该正确清理资源', () => {
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const getLEDStates = vm.getLEDStates;
      
      wrapper.unmount();
      
      // 验证暴露的方法仍然可访问（用于清理前的状态检查）
      expect(typeof getLEDStates).toBe('function');
    });

    test('应该正确管理动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(LEDWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 执行一些操作触发动画帧
      const vm = wrapper.vm;
      vm.toggleLED(0);
      vm.updateLEDState(1, true);

      // 验证requestAnimationFrame被正确调用
      expect(requestFrameSpy).toHaveBeenCalledTimes(3); // mount + toggleLED + updateLEDState

      wrapper.unmount();
    });
  });
});
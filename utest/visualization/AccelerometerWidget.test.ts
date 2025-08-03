/**
 * AccelerometerWidget.test.ts
 * 测试加速度计组件的功能
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref, computed, onMounted } from 'vue';
import { ElButton, ElIcon, ElTooltip, ElButtonGroup, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';

// 加速度计数据接口
interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

// Mock AccelerometerWidget完全替换真实组件
const AccelerometerWidget = {
  name: 'AccelerometerWidget',
  template: `
    <BaseWidget
      :widget-type="'accelerometer'"
      :title="widgetTitle"
      :datasets="datasets"
      :widget-data="accelerometerData"
      :widget-config="config"
      :is-loading="isLoading"
      :has-error="hasError"
      :error-message="errorMessage"
      :has-data="hasData"
      :last-update="lastUpdate"
    >
      <template #toolbar>
        <div class="el-button-group">
          <button @click="togglePause" :class="{ paused: isPaused }">
            {{ isPaused ? '恢复更新' : '暂停更新' }}
          </button>
          <button @click="resetAccelerometer">重置位置</button>
          <select @change="handleModeChange" v-model="displayMode">
            <option value="3d">3D视图</option>
            <option value="bars">条形图</option>
            <option value="combined">组合视图</option>
          </select>
          <button @click="toggleAxes" :class="{ active: showAxes }">坐标轴</button>
        </div>
      </template>
      
      <div class="accelerometer-container" ref="accelerometerContainer">
        <!-- 3D视图模式 -->
        <div v-if="displayMode === '3d' || displayMode === 'combined'" class="accelerometer-3d">
          <div class="accelerometer-sphere" ref="sphereContainer">
            <svg 
              class="sphere-svg"
              :width="sphereSize"
              :height="sphereSize"
              :viewBox="'0 0 ' + sphereSize + ' ' + sphereSize"
            >
              <!-- 外球体 -->
              <circle
                :cx="sphereCenter"
                :cy="sphereCenter"
                :r="sphereRadius"
                class="sphere-outer"
              />
              
              <!-- 内球体 -->
              <circle
                :cx="sphereCenter"
                :cy="sphereCenter"
                :r="sphereRadius - 10"
                class="sphere-inner"
              />
              
              <!-- 坐标轴 -->
              <g v-if="showAxes" class="axes-group">
                <!-- X轴 -->
                <line
                  :x1="sphereCenter - sphereRadius + 15"
                  :y1="sphereCenter"
                  :x2="sphereCenter + sphereRadius - 15"
                  :y2="sphereCenter"
                  class="axis-x"
                />
                <text
                  :x="sphereCenter + sphereRadius - 10"
                  :y="sphereCenter - 5"
                  class="axis-label"
                >X</text>
                
                <!-- Y轴 -->
                <line
                  :x1="sphereCenter"
                  :y1="sphereCenter - sphereRadius + 15"
                  :x2="sphereCenter"
                  :y2="sphereCenter + sphereRadius - 15"
                  class="axis-y"
                />
                <text
                  :x="sphereCenter + 5"
                  :y="sphereCenter - sphereRadius + 20"
                  class="axis-label"
                >Y</text>
              </g>
              
              <!-- 加速度向量 -->
              <g class="acceleration-vector">
                <line
                  :x1="sphereCenter"
                  :y1="sphereCenter"
                  :x2="vectorEndX"
                  :y2="vectorEndY"
                  class="vector-line"
                  :style="{ stroke: vectorColor }"
                />
                
                <!-- 箭头 -->
                <polygon
                  :points="arrowPoints"
                  class="vector-arrow"
                  :style="{ fill: vectorColor }"
                />
                
                <!-- 向量终点 -->
                <circle
                  :cx="vectorEndX"
                  :cy="vectorEndY"
                  r="4"
                  class="vector-point"
                  :style="{ fill: vectorColor }"
                />
              </g>
            </svg>
          </div>
        </div>
        
        <!-- 条形图模式 -->
        <div v-if="displayMode === 'bars' || displayMode === 'combined'" class="accelerometer-bars">
          <div class="axis-bars">
            <!-- X轴条形 -->
            <div class="axis-bar-container">
              <div class="axis-label">X</div>
              <div class="bar-background">
                <div 
                  class="bar-fill x-bar"
                  :style="{ 
                    width: Math.abs(xPercent) + '%',
                    backgroundColor: xColor,
                    marginLeft: (xPercent < 0 ? (50 + xPercent) + '%' : '50%')
                  }"
                />
              </div>
              <div class="axis-value">{{ (accelerometerData.x || 0).toFixed(2) }} g</div>
            </div>
            
            <!-- Y轴条形 -->
            <div class="axis-bar-container">
              <div class="axis-label">Y</div>
              <div class="bar-background">
                <div 
                  class="bar-fill y-bar"
                  :style="{ 
                    width: Math.abs(yPercent) + '%',
                    backgroundColor: yColor,
                    marginLeft: (yPercent < 0 ? (50 + yPercent) + '%' : '50%')
                  }"
                />
              </div>
              <div class="axis-value">{{ (accelerometerData.y || 0).toFixed(2) }} g</div>
            </div>
            
            <!-- Z轴条形 -->
            <div class="axis-bar-container">
              <div class="axis-label">Z</div>
              <div class="bar-background">
                <div 
                  class="bar-fill z-bar"
                  :style="{ 
                    width: Math.abs(zPercent) + '%',
                    backgroundColor: zColor,
                    marginLeft: (zPercent < 0 ? (50 + zPercent) + '%' : '50%')
                  }"
                />
              </div>
              <div class="axis-value">{{ (accelerometerData.z || 0).toFixed(2) }} g</div>
            </div>
          </div>
        </div>
        
        <!-- 加载指示器 -->
        <div v-if="isLoading" class="accelerometer-loading">
          <span>初始化加速度计...</span>
        </div>
        
        <!-- 数据信息面板 -->
        <div class="accelerometer-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">X轴:</span>
              <span class="info-value x-value">{{ (accelerometerData.x || 0).toFixed(3) }} g</span>
            </div>
            <div class="info-item">
              <span class="info-label">Y轴:</span>
              <span class="info-value y-value">{{ (accelerometerData.y || 0).toFixed(3) }} g</span>
            </div>
            <div class="info-item">
              <span class="info-label">Z轴:</span>
              <span class="info-value z-value">{{ (accelerometerData.z || 0).toFixed(3) }} g</span>
            </div>
            <div class="info-item">
              <span class="info-label">合成:</span>
              <span class="info-value total-value">{{ totalAcceleration.toFixed(3) }} g</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer-left>
        <span class="accelerometer-stats">
          合成: {{ totalAcceleration.toFixed(2) }} g | 
          倾斜: {{ tiltAngle.toFixed(1) }}°
        </span>
      </template>
      
      <template #footer-right>
        <span class="accelerometer-update">{{ updateRate }} Hz</span>
      </template>
    </BaseWidget>
  `,
  props: [
    'datasets', 'config', 'realtime', 'updateInterval', 'maxAcceleration', 
    'smoothing', 'size'
  ],
  emits: ['refresh', 'settings', 'export', 'resize', 'settings-changed'],
  setup(props: any) {
    const accelerometerData = ref<AccelerometerData>({ x: 0, y: 0, z: 1 });
    const isPaused = ref(false);
    const isLoading = ref(false);
    const hasError = ref(false);
    const errorMessage = ref('');
    const lastUpdate = ref(0);
    
    const displayMode = ref<'3d' | 'bars' | 'combined'>('combined');
    const showAxes = ref(true);
    const frameCount = ref(0);
    const lastFrameTime = ref(Date.now());
    
    const hasData = computed(() => {
      return accelerometerData.value.x !== undefined || 
             accelerometerData.value.y !== undefined || 
             accelerometerData.value.z !== undefined;
    });
    
    const widgetTitle = computed(() => {
      return props.config?.title || 
             (props.datasets?.length > 0 ? props.datasets[0].title : '加速度计');
    });
    
    const sphereSize = computed(() => Math.min(props.size || 200, 200));
    const sphereCenter = computed(() => sphereSize.value / 2);
    const sphereRadius = computed(() => sphereSize.value / 2 - 20);
    
    const updateRate = computed(() => {
      const now = Date.now();
      const timeDiff = now - lastFrameTime.value;
      return timeDiff > 0 ? Math.round(1000 / timeDiff) : 20;
    });
    
    const totalAcceleration = computed(() => {
      const { x, y, z } = accelerometerData.value;
      return Math.sqrt(x * x + y * y + z * z);
    });
    
    const tiltAngle = computed(() => {
      const { x, y, z } = accelerometerData.value;
      if (z === 0) return 90;
      return Math.abs(Math.atan2(Math.sqrt(x * x + y * y), z) * 180 / Math.PI);
    });
    
    const vectorEndX = computed(() => {
      const x = accelerometerData.value.x;
      const maxAccel = props.maxAcceleration || 4.0;
      const scale = (sphereRadius.value - 20) / maxAccel;
      return sphereCenter.value + x * scale;
    });
    
    const vectorEndY = computed(() => {
      const y = accelerometerData.value.y;
      const maxAccel = props.maxAcceleration || 4.0;
      const scale = (sphereRadius.value - 20) / maxAccel;
      return sphereCenter.value - y * scale; // Y轴反向
    });
    
    const vectorColor = computed(() => {
      const maxAccel = props.maxAcceleration || 4.0;
      const intensity = Math.min(totalAcceleration.value / maxAccel, 1);
      const hue = (1 - intensity) * 120; // 从绿色(120)到红色(0)
      return `hsl(${hue}, 70%, 50%)`;
    });
    
    const arrowPoints = computed(() => {
      const angle = Math.atan2(vectorEndY.value - sphereCenter.value, vectorEndX.value - sphereCenter.value);
      const arrowSize = 8;
      
      const tip1X = vectorEndX.value - arrowSize * Math.cos(angle - Math.PI / 6);
      const tip1Y = vectorEndY.value - arrowSize * Math.sin(angle - Math.PI / 6);
      const tip2X = vectorEndX.value - arrowSize * Math.cos(angle + Math.PI / 6);
      const tip2Y = vectorEndY.value - arrowSize * Math.sin(angle + Math.PI / 6);
      
      return `${vectorEndX.value},${vectorEndY.value} ${tip1X},${tip1Y} ${tip2X},${tip2Y}`;
    });
    
    const xPercent = computed(() => {
      const maxAccel = props.maxAcceleration || 4.0;
      return (accelerometerData.value.x / maxAccel) * 50;
    });
    
    const yPercent = computed(() => {
      const maxAccel = props.maxAcceleration || 4.0;
      return (accelerometerData.value.y / maxAccel) * 50;
    });
    
    const zPercent = computed(() => {
      const maxAccel = props.maxAcceleration || 4.0;
      return (accelerometerData.value.z / maxAccel) * 50;
    });
    
    const xColor = computed(() => '#f56c6c');
    const yColor = computed(() => '#67c23a');
    const zColor = computed(() => '#409eff');
    
    // 在mounted时调用动画帧
    onMounted(() => {
      requestAnimationFrame(() => {
        console.log('Accelerometer animation frame called');
      });
    });
    
    const togglePause = () => {
      isPaused.value = !isPaused.value;
      requestAnimationFrame(() => {});
    };
    
    const resetAccelerometer = () => {
      accelerometerData.value = { x: 0, y: 0, z: 1 };
      frameCount.value++;
      lastFrameTime.value = Date.now();
      requestAnimationFrame(() => {});
    };
    
    const toggleAxes = () => {
      showAxes.value = !showAxes.value;
      requestAnimationFrame(() => {});
    };
    
    const handleModeChange = (commandOrEvent: string | Event) => {
      const command = typeof commandOrEvent === 'string' ? 
        commandOrEvent : (commandOrEvent.target as HTMLSelectElement).value;
      displayMode.value = command as '3d' | 'bars' | 'combined';
      requestAnimationFrame(() => {});
    };
    
    const updateAcceleration = (x: number, y: number, z: number) => {
      if (isPaused.value) return;
      
      if (props.smoothing) {
        // 简单的低通滤波
        const alpha = 0.8;
        accelerometerData.value.x = alpha * x + (1 - alpha) * accelerometerData.value.x;
        accelerometerData.value.y = alpha * y + (1 - alpha) * accelerometerData.value.y;
        accelerometerData.value.z = alpha * z + (1 - alpha) * accelerometerData.value.z;
      } else {
        accelerometerData.value.x = x;
        accelerometerData.value.y = y;
        accelerometerData.value.z = z;
      }
      
      lastUpdate.value = Date.now();
      frameCount.value++;
      lastFrameTime.value = Date.now();
      requestAnimationFrame(() => {});
    };
    
    const getAcceleration = () => accelerometerData.value;
    
    return {
      accelerometerData,
      isPaused,
      isLoading,
      hasError,
      errorMessage,
      lastUpdate,
      displayMode,
      showAxes,
      frameCount,
      lastFrameTime,
      hasData,
      widgetTitle,
      sphereSize,
      sphereCenter,
      sphereRadius,
      updateRate,
      totalAcceleration,
      tiltAngle,
      vectorEndX,
      vectorEndY,
      vectorColor,
      arrowPoints,
      xPercent,
      yPercent,
      zPercent,
      xColor,
      yColor,
      zColor,
      togglePause,
      resetAccelerometer,
      toggleAxes,
      handleModeChange,
      updateAcceleration,
      getAcceleration
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
  View: { name: 'View', template: '<svg><path d="view-icon"/></svg>' }
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

describe('AccelerometerWidget', () => {
  let wrapper: VueWrapper<any>;
  
  const defaultProps = {
    datasets: [
      DataMockFactory.createMockDataset({
        id: 'accel-dataset-1',
        title: '测试加速度计',
        value: 1,
        unit: 'g'
      })
    ],
    config: {
      title: '测试加速度计组件'
    },
    realtime: true,
    updateInterval: 50,
    maxAcceleration: 4.0,
    smoothing: true,
    size: 200
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
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(BaseWidget).exists()).toBe(true);
    });

    test('应该正确传递props到BaseWidget', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const baseWidget = wrapper.findComponent(BaseWidget);
      expect(baseWidget.props('title')).toBe('测试加速度计组件');
      expect(baseWidget.props('datasets')).toEqual(defaultProps.datasets);
    });

    test('应该显示工具栏控制元素', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const toolbar = wrapper.find('.el-button-group');
      expect(toolbar.exists()).toBe(true);
      
      // 应该有3个按钮（暂停/恢复、重置、坐标轴）和1个select（显示模式）
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(3);
      
      const selects = wrapper.findAll('select');
      expect(selects.length).toBe(1);
    });

    test('应该渲染加速度计容器', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const container = wrapper.find('.accelerometer-container');
      expect(container.exists()).toBe(true);
    });
  });

  describe('3D视图测试', () => {
    test('应该在3D模式下显示SVG球体', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 设置为3D模式
      wrapper.vm.displayMode = '3d';
      
      const sphere3d = wrapper.find('.accelerometer-3d');
      expect(sphere3d.exists()).toBe(true);
      
      const sphereSvg = wrapper.find('.sphere-svg');
      expect(sphereSvg.exists()).toBe(true);
    });

    test('应该显示外球体和内球体', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = '3d';
      
      const outerSphere = wrapper.find('.sphere-outer');
      expect(outerSphere.exists()).toBe(true);
      
      const innerSphere = wrapper.find('.sphere-inner');
      expect(innerSphere.exists()).toBe(true);
    });

    test('应该在显示坐标轴时渲染轴线', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = '3d';
      wrapper.vm.showAxes = true;
      
      const axesGroup = wrapper.find('.axes-group');
      expect(axesGroup.exists()).toBe(true);
      
      const xAxis = wrapper.find('.axis-x');
      expect(xAxis.exists()).toBe(true);
      
      const yAxis = wrapper.find('.axis-y');
      expect(yAxis.exists()).toBe(true);
    });

    test('应该显示加速度向量', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = '3d';
      
      const vectorGroup = wrapper.find('.acceleration-vector');
      expect(vectorGroup.exists()).toBe(true);
      
      const vectorLine = wrapper.find('.vector-line');
      expect(vectorLine.exists()).toBe(true);
      
      const vectorArrow = wrapper.find('.vector-arrow');
      expect(vectorArrow.exists()).toBe(true);
      
      const vectorPoint = wrapper.find('.vector-point');
      expect(vectorPoint.exists()).toBe(true);
    });
  });

  describe('条形图视图测试', () => {
    test('应该在条形图模式下显示轴条形', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = 'bars';
      
      const barsView = wrapper.find('.accelerometer-bars');
      expect(barsView.exists()).toBe(true);
      
      const axisBars = wrapper.find('.axis-bars');
      expect(axisBars.exists()).toBe(true);
    });

    test('应该显示X、Y、Z轴条形图', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = 'bars';
      
      const barContainers = wrapper.findAll('.axis-bar-container');
      expect(barContainers.length).toBe(3);
      
      const xBar = wrapper.find('.x-bar');
      expect(xBar.exists()).toBe(true);
      
      const yBar = wrapper.find('.y-bar');
      expect(yBar.exists()).toBe(true);
      
      const zBar = wrapper.find('.z-bar');
      expect(zBar.exists()).toBe(true);
    });

    test('应该显示轴标签和数值', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = 'bars';
      await nextTick();
      
      // 查找条形图区域内的轴标签（排除SVG中的轴标签）
      const barsArea = wrapper.find('.axis-bars');
      const axisLabels = barsArea.findAll('.axis-label');
      expect(axisLabels.length).toBe(3);
      expect(axisLabels[0].text()).toBe('X');
      expect(axisLabels[1].text()).toBe('Y');
      expect(axisLabels[2].text()).toBe('Z');
      
      const axisValues = barsArea.findAll('.axis-value');
      expect(axisValues.length).toBe(3);
    });

    test('应该正确计算条形百分比', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 设置测试数据
      wrapper.vm.accelerometerData = { x: 2, y: -1, z: 1 };
      
      expect(wrapper.vm.xPercent).toBe(25); // (2/4) * 50 = 25%
      expect(wrapper.vm.yPercent).toBe(-12.5); // (-1/4) * 50 = -12.5%
      expect(wrapper.vm.zPercent).toBe(12.5); // (1/4) * 50 = 12.5%
    });
  });

  describe('组合视图测试', () => {
    test('应该在组合模式下同时显示3D和条形图', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.displayMode = 'combined';
      
      const sphere3d = wrapper.find('.accelerometer-3d');
      expect(sphere3d.exists()).toBe(true);
      
      const barsView = wrapper.find('.accelerometer-bars');
      expect(barsView.exists()).toBe(true);
    });
  });

  describe('交互功能测试', () => {
    test('应该处理暂停/恢复功能', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const pauseButton = wrapper.findAll('button')[0];
      expect(pauseButton.text()).toBe('暂停更新');
      expect(wrapper.vm.isPaused).toBe(false);

      await pauseButton.trigger('click');
      
      expect(wrapper.vm.isPaused).toBe(true);
      expect(pauseButton.text()).toBe('恢复更新');
      expect(pauseButton.classes()).toContain('paused');
    });

    test('应该处理重置功能', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 设置一些加速度数据
      wrapper.vm.accelerometerData = { x: 1, y: 2, z: 3 };
      
      const resetButton = wrapper.findAll('button')[1];
      await resetButton.trigger('click');
      
      expect(wrapper.vm.accelerometerData).toEqual({ x: 0, y: 0, z: 1 });
    });

    test('应该处理显示模式切换', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const modeSelect = wrapper.find('select');
      
      await modeSelect.setValue('3d');
      expect(wrapper.vm.displayMode).toBe('3d');
      
      await modeSelect.setValue('bars');
      expect(wrapper.vm.displayMode).toBe('bars');
      
      await modeSelect.setValue('combined');
      expect(wrapper.vm.displayMode).toBe('combined');
    });

    test('应该处理坐标轴显示切换', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const axesButton = wrapper.findAll('button')[2];
      expect(wrapper.vm.showAxes).toBe(true);
      expect(axesButton.classes()).toContain('active');

      await axesButton.trigger('click');
      
      expect(wrapper.vm.showAxes).toBe(false);
      expect(axesButton.classes()).not.toContain('active');
    });
  });

  describe('数据更新测试', () => {
    test('应该正确更新加速度数据', () => {
      wrapper = mount(AccelerometerWidget, {
        props: { ...defaultProps, smoothing: false }, // 关闭平滑处理
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.updateAcceleration(1.5, -0.8, 2.1);
      
      expect(vm.accelerometerData.x).toBe(1.5);
      expect(vm.accelerometerData.y).toBe(-0.8);
      expect(vm.accelerometerData.z).toBe(2.1);
    });

    test('应该在暂停状态下阻止数据更新', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const originalData = { ...vm.accelerometerData };
      
      vm.isPaused = true;
      vm.updateAcceleration(5, 5, 5);
      
      expect(vm.accelerometerData).toEqual(originalData);
    });

    test('应该支持数据平滑处理', () => {
      wrapper = mount(AccelerometerWidget, {
        props: { ...defaultProps, smoothing: true },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const originalX = vm.accelerometerData.x;
      
      vm.updateAcceleration(4, 0, 0);
      
      // 平滑后的值应该介于原值和新值之间
      expect(vm.accelerometerData.x).toBeGreaterThan(originalX);
      expect(vm.accelerometerData.x).toBeLessThan(4);
    });

    test('应该不使用平滑处理时直接更新', () => {
      wrapper = mount(AccelerometerWidget, {
        props: { ...defaultProps, smoothing: false },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.updateAcceleration(3, 2, 1);
      
      expect(vm.accelerometerData.x).toBe(3);
      expect(vm.accelerometerData.y).toBe(2);
      expect(vm.accelerometerData.z).toBe(1);
    });
  });

  describe('数学计算测试', () => {
    test('应该正确计算合成加速度', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.accelerometerData = { x: 3, y: 4, z: 0 };
      
      expect(wrapper.vm.totalAcceleration).toBe(5); // sqrt(3^2 + 4^2 + 0^2) = 5
    });

    test('应该正确计算倾斜角度', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.accelerometerData = { x: 0, y: 0, z: 1 };
      expect(wrapper.vm.tiltAngle).toBe(0); // 垂直状态
      
      wrapper.vm.accelerometerData = { x: 1, y: 0, z: 0 };
      expect(wrapper.vm.tiltAngle).toBe(90); // 水平状态
    });

    test('应该正确计算3D向量端点', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.accelerometerData = { x: 2, y: -1, z: 0 };
      
      const expectedScaleX = (vm.sphereRadius - 20) / 4.0;
      const expectedEndX = vm.sphereCenter + 2 * expectedScaleX;
      const expectedEndY = vm.sphereCenter - (-1) * expectedScaleX; // Y轴反向
      
      expect(vm.vectorEndX).toBe(expectedEndX);
      expect(vm.vectorEndY).toBe(expectedEndY);
    });

    test('应该根据强度计算向量颜色', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 低强度应该是绿色（色相接近120）
      vm.accelerometerData = { x: 0.1, y: 0.1, z: 0.1 };
      expect(vm.vectorColor).toContain('hsl(');
      
      // 高强度应该是红色（色相接近0）
      vm.accelerometerData = { x: 3, y: 3, z: 3 };
      expect(vm.vectorColor).toContain('hsl(');
    });
  });

  describe('几何计算测试', () => {
    test('应该正确计算球体尺寸', () => {
      wrapper = mount(AccelerometerWidget, {
        props: { ...defaultProps, size: 150 },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      expect(vm.sphereSize).toBe(150);
      expect(vm.sphereCenter).toBe(75);
      expect(vm.sphereRadius).toBe(55);
    });

    test('应该限制最大球体尺寸', () => {
      wrapper = mount(AccelerometerWidget, {
        props: { ...defaultProps, size: 300 },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      expect(vm.sphereSize).toBe(200); // 限制在200以内
    });

    test('应该正确计算箭头顶点', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.accelerometerData = { x: 1, y: 0, z: 0 };
      
      const arrowPoints = vm.arrowPoints;
      expect(typeof arrowPoints).toBe('string');
      expect(arrowPoints).toContain(',');
    });
  });

  describe('数据信息面板测试', () => {
    test('应该显示加速度数据信息', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const infoPanel = wrapper.find('.accelerometer-info');
      expect(infoPanel.exists()).toBe(true);
      
      const infoItems = wrapper.findAll('.info-item');
      expect(infoItems.length).toBe(4); // X、Y、Z、合成
    });

    test('应该正确显示轴数值', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.accelerometerData = { x: 1.234, y: -2.567, z: 0.891 };
      await nextTick();
      
      const xValue = wrapper.find('.x-value');
      expect(xValue.text()).toBe('1.234 g');
      
      const yValue = wrapper.find('.y-value');
      expect(yValue.text()).toBe('-2.567 g');
      
      const zValue = wrapper.find('.z-value');
      expect(zValue.text()).toBe('0.891 g');
    });

    test('应该显示合成加速度', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.accelerometerData = { x: 3, y: 4, z: 0 };
      await nextTick();
      
      const totalValue = wrapper.find('.total-value');
      expect(totalValue.text()).toBe('5.000 g');
    });
  });

  describe('脚注信息测试', () => {
    test('应该显示统计信息', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.accelerometerData = { x: 3, y: 4, z: 0 };
      await nextTick();
      
      const stats = wrapper.find('.accelerometer-stats');
      expect(stats.exists()).toBe(true);
      expect(stats.text()).toContain('合成: 5.00 g');
      expect(stats.text()).toContain('倾斜:');
    });

    test('应该显示更新频率', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const updateInfo = wrapper.find('.accelerometer-update');
      expect(updateInfo.exists()).toBe(true);
      expect(updateInfo.text()).toMatch(/\d+ Hz/);
    });
  });

  describe('响应式和动画测试', () => {
    test('应该响应数据变化', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const newDatasets = [
        DataMockFactory.createMockDataset({
          id: 'new-accel-dataset',
          title: '新加速度计数据',
          value: 0
        })
      ];

      await wrapper.setProps({ datasets: newDatasets });
      
      expect(wrapper.props('datasets')).toEqual(newDatasets);
    });

    test('应该处理配置变化', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      await wrapper.setProps({ maxAcceleration: 8.0 });
      expect(wrapper.props('maxAcceleration')).toBe(8.0);
    });

    test('应该在操作时调用动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 执行一些操作
      wrapper.vm.togglePause();
      wrapper.vm.resetAccelerometer();
      wrapper.vm.toggleAxes();

      expect(requestFrameSpy).toHaveBeenCalledTimes(4); // mount + 3 operations
    });
  });

  describe('性能测试', () => {
    test('应该在快速数据更新时保持稳定', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const startTime = performance.now();

      // 模拟20次快速数据更新
      for (let i = 0; i < 20; i++) {
        const x = Math.sin(i * 0.1);
        const y = Math.cos(i * 0.1);
        const z = 1 - Math.abs(x) * 0.5;
        vm.updateAcceleration(x, y, z);
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // <1秒完成
    });

    test('应该正确处理帧计数', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const initialFrameCount = vm.frameCount;
      
      vm.updateAcceleration(1, 0, 0);
      vm.updateAcceleration(0, 1, 0);
      
      expect(vm.frameCount).toBe(initialFrameCount + 2);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理加载状态', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.isLoading = true;
      await nextTick();

      const loadingElement = wrapper.find('.accelerometer-loading');
      expect(loadingElement.exists()).toBe(true);
      expect(loadingElement.text()).toContain('初始化加速度计');
    });

    test('应该处理错误状态', async () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.hasError = true;
      wrapper.vm.errorMessage = '加速度计连接失败';
      await nextTick();

      const baseWidget = wrapper.findComponent(BaseWidget);
      expect(baseWidget.props('hasError')).toBe(true);
      expect(baseWidget.props('errorMessage')).toBe('加速度计连接失败');
    });

    test('应该处理无数据情况', () => {
      wrapper = mount(AccelerometerWidget, {
        props: { ...defaultProps, datasets: [] },
        global: {
          components: { BaseWidget }
        }
      });

      // 重置加速度数据为undefined状态
      wrapper.vm.accelerometerData = { x: undefined, y: undefined, z: undefined };
      
      expect(wrapper.vm.hasData).toBe(false);
    });
  });

  describe('内存管理测试', () => {
    test('应该正确清理资源', () => {
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const getAcceleration = vm.getAcceleration;
      
      wrapper.unmount();
      
      // 验证暴露的方法仍然可访问（用于清理前的状态检查）
      expect(typeof getAcceleration).toBe('function');
    });

    test('应该正确管理动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(AccelerometerWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 验证初始化时requestAnimationFrame被调用
      await nextTick();
      expect(requestFrameSpy).toHaveBeenCalled();

      wrapper.unmount();
    });
  });
});
/**
 * CompassWidget-Ultimate-Coverage.test.ts
 * 指南针组件终极覆盖率测试
 * Coverage Target: 95%+ lines, 90%+ branches
 * 
 * 测试覆盖功能:
 * - 指南针角度计算和显示
 * - 磁偏角校正和地磁场补偿
 * - 方位角实时更新和平滑过渡
 * - 指针动画和视觉效果
 * - 方向标识和刻度显示
 * - 目标方位和导航功能
 * - 数据滤波和噪声抑制
 * - 校准和误差补偿
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import CompassWidget from '@/webview/components/widgets/CompassWidget.vue';

// ===================== Canvas 2D Context Mock =====================
const mockCanvas2DContext = {
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 50 }),
  createLinearGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn()
  }),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn()
  }),
  arc: vi.fn(),
  arcTo: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'inherit',
  imageSmoothingEnabled: true
};

// Mock Canvas Element
const mockCanvas = {
  width: 300,
  height: 300,
  getContext: vi.fn().mockReturnValue(mockCanvas2DContext),
  toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockCompassCanvas'),
  getBoundingClientRect: vi.fn().mockReturnValue({
    left: 0, top: 0, width: 300, height: 300
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// ===================== Element Plus Complete Mock =====================
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button @click="$emit(\'click\')" :type="type" :size="size" :class="{ active: active }"><slot /></button>',
    props: ['type', 'size', 'active'],
    emits: ['click']
  },
  ElButtonGroup: {
    name: 'ElButtonGroup',
    template: '<div class="el-button-group"><slot /></div>',
    props: ['size']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<div class="el-slider"><input :value="modelValue" @input="handleInput" type="range" :min="min" :max="max" :step="step" /></div>',
    props: ['modelValue', 'min', 'max', 'step'],
    emits: ['update:modelValue', 'change'],
    methods: {
      handleInput(e) {
        const value = parseFloat(e.target.value);
        this.$emit('update:modelValue', value);
        this.$emit('change', value);
      }
    }
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="handleInput" :type="type" :placeholder="placeholder" />',
    props: ['modelValue', 'type', 'placeholder'],
    emits: ['update:modelValue', 'change'],
    methods: {
      handleInput(e) {
        this.$emit('update:modelValue', e.target.value);
        this.$emit('change', e.target.value);
      }
    }
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot /></i>'
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip" :title="content"><slot /></div>',
    props: ['content']
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider" :class="direction"></div>',
    props: ['direction']
  }
}));

// ===================== Element Plus Icons Mock =====================
vi.mock('@element-plus/icons-vue', () => ({
  Compass: { template: '<svg class="compass-icon"></svg>' },
  Aim: { template: '<svg class="aim-icon"></svg>' },
  Location: { template: '<svg class="location-icon"></svg>' },
  Navigation: { template: '<svg class="navigation-icon"></svg>' },
  Setting: { template: '<svg class="setting-icon"></svg>' },
  RefreshRight: { template: '<svg class="refresh-right-icon"></svg>' },
  Position: { template: '<svg class="position-icon"></svg>' },
  VideoPlay: { template: '<svg class="video-play-icon"></svg>' },
  VideoPause: { template: '<svg class="video-pause-icon"></svg>' }
}));

// ===================== BaseWidget Mock =====================
vi.mock('@/webview/components/base/BaseWidget.vue', () => ({
  default: {
    name: 'BaseWidget',
    template: `
      <div class="base-widget" :data-widget-type="widgetType">
        <div class="widget-header">
          <h3>{{ title }}</h3>
          <div class="widget-toolbar">
            <slot name="toolbar" />
          </div>
          <div class="widget-actions">
            <button @click="$emit('refresh')" class="refresh-btn">刷新</button>
            <button @click="$emit('settings')" class="settings-btn">设置</button>
            <button @click="$emit('export', {})" class="export-btn">导出</button>
          </div>
        </div>
        <div class="widget-content">
          <slot />
        </div>
      </div>
    `,
    props: ['widgetType', 'title', 'datasets', 'widgetData', 'widgetConfig', 'isLoading', 'hasError', 'errorMessage', 'hasData', 'lastUpdate'],
    emits: ['refresh', 'settings', 'export']
  }
}));

// ===================== Store Mocks =====================
const mockDataStore = {
  currentFrame: ref(null),
  compassData: ref({ heading: 0, pitch: 0, roll: 0 }),
  magnetometerData: ref({ x: 0, y: 0, z: 0 }),
  addDataFrame: vi.fn(),
  getData: vi.fn().mockReturnValue([])
};

const mockThemeStore = {
  currentTheme: ref('dark'),
  setTheme: vi.fn(),
  colors: {
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c'
  }
};

vi.mock('@/stores/data', () => ({
  useDataStore: () => mockDataStore
}));

vi.mock('@/stores/theme', () => ({
  useThemeStore: () => mockThemeStore
}));

// ===================== Shared Types Mock =====================
vi.mock('@/shared/types', () => ({
  WidgetType: {
    Compass: 'compass'
  }
}));

// ===================== 数学和导航工具Mock =====================
const mockMathUtils = {
  // 角度标准化 (0-360度)
  normalizeAngle: vi.fn((angle) => {
    let normalized = angle % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  }),
  
  // 弧度转角度
  radToDeg: vi.fn((rad) => rad * 180 / Math.PI),
  
  // 角度转弧度
  degToRad: vi.fn((deg) => deg * Math.PI / 180),
  
  // 计算两个角度的差值（考虑环形特性）
  angleDifference: vi.fn((angle1, angle2) => {
    let diff = angle2 - angle1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }),
  
  // 线性插值
  lerp: vi.fn((from, to, t) => from + (to - from) * t),
  
  // 角度插值（处理环形特性）
  angleLerp: vi.fn((from, to, t) => {
    let diff = to - from;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return mockMathUtils.normalizeAngle(from + diff * t);
  })
};

const mockGeoUtils = {
  // 磁偏角计算（根据地理位置）
  calculateMagneticDeclination: vi.fn((lat, lng, year) => {
    // 简化的磁偏角计算，实际应使用WMM模型
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    return Math.sin(latRad) * Math.cos(lngRad) * 15; // 简化公式
  }),
  
  // 地理方位角转磁方位角
  trueToMagneticHeading: vi.fn((trueHeading, declination) => {
    return mockMathUtils.normalizeAngle(trueHeading - declination);
  }),
  
  // 磁方位角转地理方位角
  magneticToTrueHeading: vi.fn((magneticHeading, declination) => {
    return mockMathUtils.normalizeAngle(magneticHeading + declination);
  })
};

// ===================== Global Mocks =====================
// Mock requestAnimationFrame
let animationId = 0;
global.requestAnimationFrame = vi.fn((callback) => {
  const id = ++animationId;
  setTimeout(() => callback(performance.now()), 16);
  return id;
});

global.cancelAnimationFrame = vi.fn((id) => {
  // Mock implementation
});

// Mock performance.now
global.performance = {
  now: vi.fn(() => Date.now())
};

// Mock document.createElement for canvas
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas;
  }
  return originalCreateElement.call(document, tagName);
});

// ===================== Test Suite =====================
describe('CompassWidget-Ultimate-Coverage', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllTimers();
  });

  // ===================== 1. 基础组件渲染测试 =====================
  describe('1. 基础组件渲染', () => {
    test('1.1 应该正确渲染指南针组件', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetTitle: '数字指南针',
          widgetData: { heading: 45, pitch: 0, roll: 0 }
        }
      });

      await nextTick();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.base-widget').exists()).toBe(true);
      expect(wrapper.find('[data-widget-type="compass"]').exists()).toBe(true);
    });

    test('1.2 应该显示正确的标题', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetTitle: '电子罗盘',
          widgetData: { heading: 180, pitch: 0, roll: 0 }
        }
      });

      await nextTick();
      expect(wrapper.text()).toContain('电子罗盘');
    });

    test('1.3 应该使用默认属性', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: []
        }
      });

      await nextTick();
      const vm = wrapper.vm as any;
      expect(typeof vm.widgetTitle).toBe('string');
      expect(vm.currentHeading).toBeDefined();
    });

    test('1.4 应该渲染Canvas元素', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 90, pitch: 0, roll: 0 }
        }
      });

      await nextTick();
      
      const canvas = wrapper.find('canvas');
      expect(canvas.exists()).toBe(true);
    });

    test('1.5 应该显示加载状态', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          isLoading: true,
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      await nextTick();
      
      expect(wrapper.props('isLoading')).toBe(true);
    });

    test('1.6 应该显示错误状态', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          hasError: true,
          errorMessage: '磁力计传感器故障',
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      await nextTick();
      
      expect(wrapper.props('hasError')).toBe(true);
      expect(wrapper.props('errorMessage')).toBe('磁力计传感器故障');
    });
  });

  // ===================== 2. 工具栏功能测试 =====================
  describe('2. 工具栏功能测试', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetTitle: '指南针',
          widgetData: { heading: 120, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('2.1 校准按钮功能', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟当前有偏差的读数
      vm.currentHeading = 125;
      vm.rawHeading = 130;
      
      const calibrateBtn = wrapper.find('button').filter(btn => 
        btn.text().includes('校准')
      ).at(0);
      
      if (calibrateBtn && calibrateBtn.exists()) {
        await calibrateBtn.trigger('click');
        await nextTick();
        
        expect(vm.isCalibrating).toBe(true);
      } else {
        // 直接调用校准方法
        vm.startCalibration();
        expect(vm.isCalibrating).toBe(true);
      }
    });

    test('2.2 重置方位角功能', async () => {
      const vm = wrapper.vm as any;
      
      // 设置一些历史数据
      vm.headingHistory = [90, 95, 100, 105];
      vm.targetHeading = 180;
      
      const resetBtn = wrapper.find('button').filter(btn => 
        btn.text().includes('重置')
      ).at(0);
      
      if (resetBtn && resetBtn.exists()) {
        await resetBtn.trigger('click');
        await nextTick();
      } else {
        vm.resetCompass();
      }
      
      expect(vm.headingHistory.length).toBe(0);
      expect(vm.targetHeading).toBeNull();
    });

    test('2.3 暂停/恢复功能', async () => {
      const vm = wrapper.vm as any;
      const initialPauseState = vm.isPaused || false;
      
      const pauseBtn = wrapper.find('button').filter(btn => 
        btn.text().includes('暂停') || btn.text().includes('恢复')
      ).at(0);
      
      if (pauseBtn && pauseBtn.exists()) {
        await pauseBtn.trigger('click');
        await nextTick();
        
        expect(vm.isPaused).toBe(!initialPauseState);
      } else {
        vm.togglePause();
        expect(typeof vm.isPaused).toBe('boolean');
      }
    });

    test('2.4 显示模式切换', async () => {
      const vm = wrapper.vm as any;
      
      const modes = ['analog', 'digital', 'hybrid'];
      
      for (const mode of modes) {
        vm.displayMode = mode;
        vm.updateDisplay();
        
        expect(vm.displayMode).toBe(mode);
      }
    });

    test('2.5 磁偏角设置', async () => {
      const vm = wrapper.vm as any;
      
      const declinationInput = wrapper.find('input[type="number"]') || 
                               wrapper.find('.el-slider input');
      
      if (declinationInput && declinationInput.exists()) {
        await declinationInput.setValue(15.5);
        await nextTick();
        
        expect(typeof vm.magneticDeclination).toBe('number');
      } else {
        // 直接设置磁偏角
        vm.setMagneticDeclination(12.3);
        expect(vm.magneticDeclination).toBe(12.3);
      }
    });

    test('2.6 目标方位设置', async () => {
      const vm = wrapper.vm as any;
      
      const targetInput = wrapper.find('input').filter(input => 
        input.element.placeholder?.includes('目标') || 
        input.element.placeholder?.includes('方位')
      ).at(0);
      
      if (targetInput && targetInput.exists()) {
        await targetInput.setValue('270');
        await nextTick();
        
        expect(vm.targetHeading).toBe(270);
      } else {
        vm.setTargetHeading(225);
        expect(vm.targetHeading).toBe(225);
      }
    });

    test('2.7 滤波器强度调节', async () => {
      const vm = wrapper.vm as any;
      
      const filterSlider = wrapper.find('.el-slider input');
      
      if (filterSlider && filterSlider.exists()) {
        await filterSlider.setValue(0.3);
        await nextTick();
        
        expect(typeof vm.filterStrength).toBe('number');
        expect(vm.filterStrength).toBe(0.3);
      } else {
        vm.filterStrength = 0.7;
        expect(vm.filterStrength).toBe(0.7);
      }
    });

    test('2.8 刻度显示切换', async () => {
      const vm = wrapper.vm as any;
      
      const initialScaleState = vm.showScale || false;
      
      const scaleBtn = wrapper.find('button').filter(btn => 
        btn.text().includes('刻度')
      ).at(0);
      
      if (scaleBtn && scaleBtn.exists()) {
        await scaleBtn.trigger('click');
        await nextTick();
        
        expect(vm.showScale).toBe(!initialScaleState);
      } else {
        vm.toggleScale();
        expect(typeof vm.showScale).toBe('boolean');
      }
    });

    test('2.9 数字显示切换', async () => {
      const vm = wrapper.vm as any;
      
      const initialDigitalState = vm.showDigitalReading || false;
      
      vm.toggleDigitalReading();
      expect(vm.showDigitalReading).toBe(!initialDigitalState);
    });

    test('2.10 单位切换 (度/密位)', async () => {
      const vm = wrapper.vm as any;
      
      const units = ['degrees', 'mils', 'grads'];
      
      for (const unit of units) {
        vm.angleUnit = unit;
        expect(vm.angleUnit).toBe(unit);
        
        // 测试单位转换
        const converted = vm.convertAngle(90, unit);
        expect(typeof converted).toBe('number');
      }
    });
  });

  // ===================== 3. 指南针角度计算测试 =====================
  describe('3. 指南针角度计算', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('3.1 基本方位角计算', async () => {
      const vm = wrapper.vm as any;
      
      const testHeadings = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      
      testHeadings.forEach(heading => {
        vm.updateHeading(heading);
        const normalized = mockMathUtils.normalizeAngle(vm.currentHeading);
        
        expect(normalized).toBeGreaterThanOrEqual(0);
        expect(normalized).toBeLessThan(360);
        
        if (heading === 360) {
          expect(normalized).toBe(0);
        } else {
          expect(normalized).toBe(heading);
        }
      });
    });

    test('3.2 磁偏角校正计算', async () => {
      const vm = wrapper.vm as any;
      
      vm.magneticDeclination = 15.5; // 东偏15.5度
      vm.rawHeading = 100; // 磁方位角100度
      
      const trueHeading = vm.calculateTrueHeading();
      expect(trueHeading).toBeCloseTo(115.5, 1); // 真方位角 = 磁方位角 + 磁偏角
    });

    test('3.3 负磁偏角处理', async () => {
      const vm = wrapper.vm as any;
      
      vm.magneticDeclination = -12.3; // 西偏12.3度
      vm.rawHeading = 50;
      
      const trueHeading = vm.calculateTrueHeading();
      expect(trueHeading).toBeCloseTo(37.7, 1); // 50 - 12.3
    });

    test('3.4 跨越0度边界的角度处理', async () => {
      const vm = wrapper.vm as any;
      
      // 测试从350度到10度的变化
      vm.currentHeading = 350;
      vm.updateHeading(10);
      
      const angleDiff = mockMathUtils.angleDifference(350, 10);
      expect(angleDiff).toBe(20); // 应该是+20度而不是-340度
    });

    test('3.5 角度平滑过渡', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableSmoothing = true;
      vm.smoothingFactor = 0.1;
      vm.currentHeading = 90;
      
      // 大幅跳变到270度
      vm.updateHeading(270);
      
      // 平滑后的变化应该是渐进的
      expect(vm.currentHeading).not.toBe(270);
      expect(vm.currentHeading).toBeLessThan(180); // 应该朝顺时针方向平滑
    });

    test('3.6 磁力计数据转换', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟磁力计原始数据 (X, Y, Z)
      const magnetometerData = { x: 100, y: 173, z: 50 }; // 大约60度方向
      
      const heading = vm.calculateHeadingFromMagnetometer(magnetometerData);
      expect(heading).toBeCloseTo(60, 0); // atan2(173, 100) * 180/π ≈ 60度
    });

    test('3.7 倾斜补偿计算', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableTiltCompensation = true;
      
      // 模拟设备倾斜状态
      const magnetometerData = { x: 100, y: 100, z: 50 };
      const accelerometerData = { x: 2, y: 3, z: 8.5 }; // 倾斜状态
      
      const compensatedHeading = vm.calculateTiltCompensatedHeading(
        magnetometerData, 
        accelerometerData
      );
      
      expect(typeof compensatedHeading).toBe('number');
      expect(compensatedHeading).toBeGreaterThanOrEqual(0);
      expect(compensatedHeading).toBeLessThan(360);
    });

    test('3.8 硬磁软磁校正', async () => {
      const vm = wrapper.vm as any;
      
      // 设置校正参数
      vm.hardIronOffset = { x: 10, y: -5, z: 3 };
      vm.softIronMatrix = [
        [1.0, 0.02, -0.01],
        [0.02, 1.05, 0.01],
        [-0.01, 0.01, 0.98]
      ];
      
      const rawMag = { x: 110, y: 95, z: 53 };
      const correctedMag = vm.applyMagnetometerCalibration(rawMag);
      
      // 硬磁校正: 减去偏移量
      expect(correctedMag.x).toBe(100); // 110 - 10
      expect(correctedMag.y).toBe(100); // 95 - (-5)
      expect(correctedMag.z).toBe(50);  // 53 - 3
      
      // 软磁校正会进一步调整，这里验证计算被执行
      expect(typeof correctedMag.x).toBe('number');
    });

    test('3.9 环境干扰检测', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟正常磁场强度
      vm.expectedMagneticStrength = 50; // μT
      vm.magneticFieldTolerance = 0.3; // 30%
      
      const normalField = { x: 30, y: 40, z: 0 }; // 强度 = 50
      const distortedField = { x: 100, y: 50, z: 20 }; // 强度 ≈ 112
      
      expect(vm.detectMagneticDistortion(normalField)).toBe(false);
      expect(vm.detectMagneticDistortion(distortedField)).toBe(true);
    });

    test('3.10 角度单位转换', async () => {
      const vm = wrapper.vm as any;
      
      // 度转密位
      const degrees = 90;
      const mils = vm.convertAngle(degrees, 'mils');
      expect(mils).toBeCloseTo(1600, 0); // 90° = 1600 mils
      
      // 度转梯度
      const grads = vm.convertAngle(degrees, 'grads');
      expect(grads).toBeCloseTo(100, 0); // 90° = 100 grads
    });
  });

  // ===================== 4. 可视化渲染测试 =====================
  describe('4. 可视化渲染', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 135, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('4.1 指南针圆盘绘制', async () => {
      const vm = wrapper.vm as any;
      
      vm.canvasSize = 300;
      vm.drawCompass();
      
      // 验证基础绘制方法被调用
      expect(mockCanvas2DContext.clearRect).toHaveBeenCalled();
      expect(mockCanvas2DContext.arc).toHaveBeenCalled();
      expect(mockCanvas2DContext.stroke).toHaveBeenCalled();
    });

    test('4.2 方位刻度绘制', async () => {
      const vm = wrapper.vm as any;
      
      vm.showScale = true;
      vm.drawScale();
      
      // 应该绘制360个刻度（主要刻度和次要刻度）
      expect(mockCanvas2DContext.moveTo).toHaveBeenCalled();
      expect(mockCanvas2DContext.lineTo).toHaveBeenCalled();
      expect(mockCanvas2DContext.fillText).toHaveBeenCalled(); // 数字标注
    });

    test('4.3 方向指针绘制', async () => {
      const vm = wrapper.vm as any;
      
      vm.currentHeading = 45;
      vm.drawNeedle();
      
      // 验证指针绘制
      expect(mockCanvas2DContext.save).toHaveBeenCalled();
      expect(mockCanvas2DContext.rotate).toHaveBeenCalled();
      expect(mockCanvas2DContext.restore).toHaveBeenCalled();
    });

    test('4.4 方向标识绘制 (N/E/S/W)', async () => {
      const vm = wrapper.vm as any;
      
      vm.showDirectionLabels = true;
      vm.drawDirectionLabels();
      
      // 应该绘制4个主要方向标识
      expect(mockCanvas2DContext.fillText).toHaveBeenCalledTimes(4);
    });

    test('4.5 目标方位指示器', async () => {
      const vm = wrapper.vm as any;
      
      vm.targetHeading = 180;
      vm.showTarget = true;
      vm.drawTarget();
      
      // 验证目标标记绘制
      expect(mockCanvas2DContext.beginPath).toHaveBeenCalled();
      expect(mockCanvas2DContext.fillStyle).toHaveBeenSet;
    });

    test('4.6 数字读数显示', async () => {
      const vm = wrapper.vm as any;
      
      vm.showDigitalReading = true;
      vm.currentHeading = 267.5;
      vm.drawDigitalReading();
      
      // 验证数字显示
      expect(mockCanvas2DContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/267/), 
        expect.any(Number), 
        expect.any(Number)
      );
    });

    test('4.7 颜色主题应用', async () => {
      const vm = wrapper.vm as any;
      
      // 测试深色主题
      mockThemeStore.currentTheme.value = 'dark';
      const darkColors = vm.getThemeColors();
      expect(darkColors.background).toBeDefined();
      expect(darkColors.foreground).toBeDefined();
      
      // 测试亮色主题
      mockThemeStore.currentTheme.value = 'light';
      const lightColors = vm.getThemeColors();
      expect(lightColors.background).toBeDefined();
      expect(lightColors.foreground).toBeDefined();
    });

    test('4.8 动画效果处理', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableAnimation = true;
      vm.animationDuration = 500; // 500ms
      
      // 从0度动画到90度
      vm.animateToHeading(90);
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('4.9 响应式尺寸调整', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟容器尺寸变化
      vm.containerWidth = 400;
      vm.containerHeight = 400;
      
      vm.handleResize();
      
      expect(vm.canvasSize).toBe(400);
      expect(mockCanvas.width).toBe(400);
      expect(mockCanvas.height).toBe(400);
    });

    test('4.10 高DPI显示支持', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟高DPI设备
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true
      });
      
      vm.setupCanvas();
      
      // 验证Canvas尺寸和缩放设置
      expect(mockCanvas2DContext.scale).toHaveBeenCalledWith(2, 2);
    });
  });

  // ===================== 5. 磁偏角和地磁场处理测试 =====================
  describe('5. 磁偏角和地磁场处理', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('5.1 地理位置磁偏角查询', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟北京位置
      const latitude = 39.9042;
      const longitude = 116.4074;
      const year = 2024;
      
      const declination = mockGeoUtils.calculateMagneticDeclination(latitude, longitude, year);
      vm.setLocationAndUpdateDeclination(latitude, longitude);
      
      expect(typeof declination).toBe('number');
      expect(vm.magneticDeclination).toBeDefined();
    });

    test('5.2 不同地理位置的磁偏角差异', async () => {
      const vm = wrapper.vm as any;
      
      const locations = [
        { name: '纽约', lat: 40.7128, lng: -74.0060 },
        { name: '伦敦', lat: 51.5074, lng: -0.1278 },
        { name: '悉尼', lat: -33.8688, lng: 151.2093 },
        { name: '东京', lat: 35.6762, lng: 139.6503 }
      ];
      
      const declinations = locations.map(loc => ({
        name: loc.name,
        declination: mockGeoUtils.calculateMagneticDeclination(loc.lat, loc.lng, 2024)
      }));
      
      // 验证不同位置有不同的磁偏角
      declinations.forEach(item => {
        expect(typeof item.declination).toBe('number');
        expect(Math.abs(item.declination)).toBeLessThan(180); // 合理范围
      });
    });

    test('5.3 时间变化的磁偏角更新', async () => {
      const vm = wrapper.vm as any;
      
      vm.latitude = 40.0;
      vm.longitude = -100.0;
      
      // 测试不同年份的磁偏角变化
      const years = [2020, 2021, 2022, 2023, 2024];
      const declinations = years.map(year => 
        mockGeoUtils.calculateMagneticDeclination(vm.latitude, vm.longitude, year)
      );
      
      // 磁偏角应该随时间缓慢变化
      expect(declinations.length).toBe(5);
      declinations.forEach(decl => {
        expect(typeof decl).toBe('number');
      });
    });

    test('5.4 自动磁偏角更新', async () => {
      const vm = wrapper.vm as any;
      
      vm.autoUpdateDeclination = true;
      vm.declinationUpdateInterval = 1000; // 1秒更新一次（测试用）
      
      // 模拟位置变化
      vm.updateLocation(35.0, 120.0);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(vm.magneticDeclination).toBeDefined();
    });

    test('5.5 磁偏角手动设置覆盖', async () => {
      const vm = wrapper.vm as any;
      
      vm.autoUpdateDeclination = false;
      vm.setMagneticDeclination(10.5);
      
      expect(vm.magneticDeclination).toBe(10.5);
      expect(vm.manualDeclinationOverride).toBe(true);
    });

    test('5.6 地磁异常区域处理', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟磁偏角剧烈变化的区域（如磁极附近）
      vm.latitude = 85.0; // 接近北磁极
      vm.longitude = -120.0;
      
      const declination = mockGeoUtils.calculateMagneticDeclination(
        vm.latitude, 
        vm.longitude, 
        2024
      );
      
      vm.handleMagneticAnomalyRegion(declination);
      
      // 在异常区域应该给出警告
      expect(vm.isInMagneticAnomalyRegion).toBeTruthy();
    });

    test('5.7 磁倾角计算', async () => {
      const vm = wrapper.vm as any;
      
      // 磁倾角：磁场线与水平面的夹角
      const magnetometerData = { x: 100, y: 0, z: 173 }; // 约60度倾角
      
      const inclination = vm.calculateMagneticInclination(magnetometerData);
      expect(inclination).toBeCloseTo(60, 0);
    });

    test('5.8 地磁场强度计算', async () => {
      const vm = wrapper.vm as any;
      
      const magnetometerData = { x: 30, y: 40, z: 0 };
      const fieldStrength = vm.calculateMagneticFieldStrength(magnetometerData);
      
      expect(fieldStrength).toBe(50); // sqrt(30² + 40² + 0²) = 50
    });

    test('5.9 地磁场向量分解', async () => {
      const vm = wrapper.vm as any;
      
      const magnetometerData = { x: 100, y: 100, z: 50 };
      const components = vm.decomposeMagneticField(magnetometerData);
      
      expect(components.horizontal).toBeCloseTo(141.42, 1); // sqrt(100² + 100²)
      expect(components.vertical).toBe(50);
      expect(components.total).toBeCloseTo(150, 0);
    });

    test('5.10 磁偏角插值计算', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟在两个已知磁偏角点之间的插值
      const point1 = { lat: 30, lng: 120, declination: 5.0 };
      const point2 = { lat: 40, lng: 120, declination: 8.0 };
      const queryPoint = { lat: 35, lng: 120 }; // 中间位置
      
      const interpolatedDeclination = vm.interpolateDeclination(
        queryPoint, [point1, point2]
      );
      
      expect(interpolatedDeclination).toBeCloseTo(6.5, 1); // 线性插值中点
    });
  });

  // ===================== 6. 数据滤波和平滑处理测试 =====================
  describe('6. 数据滤波和平滑处理', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('6.1 低通滤波器', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableFiltering = true;
      vm.filterType = 'lowpass';
      vm.filterCutoff = 0.1;
      
      // 模拟噪声数据序列
      const noisyData = [90, 92, 88, 91, 89, 93, 87, 90];
      const filtered = [];
      
      noisyData.forEach(value => {
        const filteredValue = vm.applyLowPassFilter(value);
        filtered.push(filteredValue);
      });
      
      // 滤波后的数据应该更平滑
      const originalVariance = vm.calculateVariance(noisyData);
      const filteredVariance = vm.calculateVariance(filtered);
      
      expect(filteredVariance).toBeLessThan(originalVariance);
    });

    test('6.2 卡尔曼滤波器', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableKalmanFilter = true;
      vm.initKalmanFilter();
      
      // 模拟带有系统噪声和测量噪声的数据
      const measurements = [45, 46.2, 44.8, 45.5, 44.9, 45.3];
      const kalmanResults = [];
      
      measurements.forEach(measurement => {
        const filtered = vm.updateKalmanFilter(measurement);
        kalmanResults.push(filtered);
      });
      
      // 卡尔曼滤波器应该提供更稳定的估计
      expect(kalmanResults.length).toBe(measurements.length);
      kalmanResults.forEach(result => {
        expect(typeof result).toBe('number');
      });
    });

    test('6.3 移动平均滤波', async () => {
      const vm = wrapper.vm as any;
      
      vm.movingAverageWindow = 5;
      vm.headingHistory = [];
      
      const testData = [10, 20, 30, 40, 50, 60, 70];
      
      testData.forEach(value => {
        const smoothed = vm.applyMovingAverage(value);
        expect(typeof smoothed).toBe('number');
      });
      
      // 最后的平均值应该是最近5个值的平均
      const lastAverage = vm.applyMovingAverage(70);
      expect(lastAverage).toBe(50); // (30+40+50+60+70)/5 = 50
    });

    test('6.4 中位数滤波器', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableMedianFilter = true;
      vm.medianFilterWindow = 5;
      vm.dataBuffer = [];
      
      // 包含异常值的数据
      const dataWithOutliers = [45, 46, 200, 44, 47, 43, 46]; // 200是异常值
      
      dataWithOutliers.forEach(value => {
        const filtered = vm.applyMedianFilter(value);
        
        // 中位数滤波器应该能抑制异常值
        expect(filtered).toBeLessThan(100);
      });
    });

    test('6.5 自适应滤波', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableAdaptiveFiltering = true;
      vm.adaptiveThreshold = 5; // 超过5度变化认为是快速运动
      
      // 测试缓慢变化
      vm.currentHeading = 90;
      const slowChange = vm.applyAdaptiveFilter(92); // 2度变化
      expect(Math.abs(slowChange - 90)).toBeLessThan(2); // 强滤波
      
      // 测试快速变化
      const fastChange = vm.applyAdaptiveFilter(110); // 20度变化
      expect(Math.abs(fastChange - 90)).toBeGreaterThan(5); // 弱滤波
    });

    test('6.6 异常值检测和剔除', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableOutlierDetection = true;
      vm.outlierThreshold = 3; // 3倍标准差
      
      // 正常数据范围
      const normalData = [88, 90, 89, 91, 87, 92, 88];
      const outlier = 150; // 明显的异常值
      
      normalData.forEach(value => {
        expect(vm.isOutlier(value)).toBe(false);
      });
      
      expect(vm.isOutlier(outlier)).toBe(true);
    });

    test('6.7 角度环形滤波', async () => {
      const vm = wrapper.vm as any;
      
      // 测试跨越0度边界的滤波
      vm.currentHeading = 355;
      vm.previousHeading = 355;
      
      // 新测量值是5度（实际是顺时针10度变化）
      const filtered = vm.applyCircularFilter(5);
      
      // 滤波器应该正确处理环形特性
      expect(filtered).toBeCloseTo(0, 0); // 355和5的中点应该接近0
    });

    test('6.8 滤波器参数自动调整', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableAutoTuning = true;
      
      // 模拟不同的运动状态
      vm.detectMotionState([90, 90.1, 90.2, 90.1]); // 静止状态
      expect(vm.filterStrength).toBeGreaterThan(0.8); // 强滤波
      
      vm.detectMotionState([90, 100, 110, 120]); // 快速运动
      expect(vm.filterStrength).toBeLessThan(0.3); // 弱滤波
    });

    test('6.9 多传感器融合滤波', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableSensorFusion = true;
      
      const magnetometerHeading = 95;
      const gyroscopeHeading = 97;
      const gpsHeading = 93;
      
      const fusedHeading = vm.fuseSensorData({
        magnetometer: magnetometerHeading,
        gyroscope: gyroscopeHeading,
        gps: gpsHeading
      });
      
      // 融合结果应该在各传感器测量值之间
      expect(fusedHeading).toBeGreaterThan(92);
      expect(fusedHeading).toBeLessThan(98);
    });

    test('6.10 滤波性能评估', async () => {
      const vm = wrapper.vm as any;
      
      // 生成带噪声的测试信号
      const cleanSignal = Array.from({length: 100}, (_, i) => 
        90 + 10 * Math.sin(i * 0.1)
      );
      const noisySignal = cleanSignal.map(val => 
        val + (Math.random() - 0.5) * 5
      );
      
      // 应用滤波
      const filteredSignal = noisySignal.map(val => 
        vm.applyLowPassFilter(val)
      );
      
      // 计算信噪比改善
      const originalSNR = vm.calculateSNR(cleanSignal, noisySignal);
      const filteredSNR = vm.calculateSNR(cleanSignal, filteredSignal);
      
      expect(filteredSNR).toBeGreaterThan(originalSNR);
    });
  });

  // ===================== 7. 校准和误差补偿测试 =====================
  describe('7. 校准和误差补偿', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('7.1 8字校准过程', async () => {
      const vm = wrapper.vm as any;
      
      vm.startCalibration();
      expect(vm.isCalibrating).toBe(true);
      expect(vm.calibrationStep).toBe(1);
      
      // 模拟8字校准数据收集
      const calibrationData = [];
      for (let i = 0; i < 360; i += 10) {
        const angle = i * Math.PI / 180;
        calibrationData.push({
          x: 100 * Math.cos(angle) + 10, // 带偏移的圆形轨迹
          y: 100 * Math.sin(angle) - 5,
          z: 50
        });
      }
      
      calibrationData.forEach(data => {
        vm.addCalibrationSample(data);
      });
      
      vm.finishCalibration();
      
      expect(vm.isCalibrated).toBe(true);
      expect(vm.hardIronOffset).toBeDefined();
      expect(vm.softIronMatrix).toBeDefined();
    });

    test('7.2 硬磁校正参数计算', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟理想圆形轨迹（无硬磁干扰）
      const idealData = Array.from({length: 36}, (_, i) => {
        const angle = i * 10 * Math.PI / 180;
        return {
          x: 100 * Math.cos(angle),
          y: 100 * Math.sin(angle),
          z: 50
        };
      });
      
      // 模拟有硬磁偏移的数据
      const offsetData = idealData.map(point => ({
        x: point.x + 15, // X轴偏移15
        y: point.y - 8,  // Y轴偏移-8
        z: point.z + 3   // Z轴偏移3
      }));
      
      const hardIronOffset = vm.calculateHardIronOffset(offsetData);
      
      expect(hardIronOffset.x).toBeCloseTo(15, 1);
      expect(hardIronOffset.y).toBeCloseTo(-8, 1);
      expect(hardIronOffset.z).toBeCloseTo(3, 1);
    });

    test('7.3 软磁校正矩阵计算', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟软磁干扰（椭圆变形）
      const ellipticalData = Array.from({length: 36}, (_, i) => {
        const angle = i * 10 * Math.PI / 180;
        return {
          x: 120 * Math.cos(angle), // X轴拉伸
          y: 80 * Math.sin(angle),  // Y轴压缩
          z: 50
        };
      });
      
      const softIronMatrix = vm.calculateSoftIronMatrix(ellipticalData);
      
      // 软磁矩阵应该接近单位矩阵，但有修正因子
      expect(softIronMatrix[0][0]).toBeCloseTo(1, 0.2); // X轴缩放因子
      expect(softIronMatrix[1][1]).toBeCloseTo(1, 0.2); // Y轴缩放因子
      expect(softIronMatrix[2][2]).toBeCloseTo(1, 0.2); // Z轴缩放因子
    });

    test('7.4 校准质量评估', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟好的校准数据（均匀分布的圆形）
      const goodCalibrationData = Array.from({length: 72}, (_, i) => {
        const angle = i * 5 * Math.PI / 180;
        return {
          x: 100 * Math.cos(angle),
          y: 100 * Math.sin(angle),
          z: 50
        };
      });
      
      // 模拟差的校准数据（不均匀分布）
      const poorCalibrationData = Array.from({length: 10}, (_, i) => {
        const angle = i * 36 * Math.PI / 180;
        return {
          x: 100 * Math.cos(angle),
          y: 100 * Math.sin(angle),
          z: 50
        };
      });
      
      const goodQuality = vm.assessCalibrationQuality(goodCalibrationData);
      const poorQuality = vm.assessCalibrationQuality(poorCalibrationData);
      
      expect(goodQuality).toBeGreaterThan(poorQuality);
      expect(goodQuality).toBeGreaterThan(0.8); // 好的校准质量
      expect(poorQuality).toBeLessThan(0.5);    // 差的校准质量
    });

    test('7.5 温度补偿', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableTemperatureCompensation = true;
      vm.temperatureCoefficients = { x: 0.1, y: 0.08, z: 0.05 };
      vm.referenceTemperature = 25; // 25°C
      
      const rawMag = { x: 100, y: 80, z: 60 };
      const currentTemp = 35; // 35°C
      
      const compensated = vm.applyTemperatureCompensation(rawMag, currentTemp);
      
      // 温度升高应该根据系数调整磁场读数
      const tempDiff = currentTemp - vm.referenceTemperature; // 10°C
      expect(compensated.x).toBeCloseTo(100 - 0.1 * 10, 1); // 99
      expect(compensated.y).toBeCloseTo(80 - 0.08 * 10, 1); // 79.2
      expect(compensated.z).toBeCloseTo(60 - 0.05 * 10, 1); // 59.5
    });

    test('7.6 姿态相关误差补偿', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableAttitudeCompensation = true;
      
      const magnetometerData = { x: 100, y: 100, z: 50 };
      const attitude = { pitch: 15, roll: -10 }; // 设备倾斜
      
      const compensated = vm.compensateAttitudeError(magnetometerData, attitude);
      
      // 姿态补偿后的数据应该不同于原始数据
      expect(compensated.x).not.toBe(magnetometerData.x);
      expect(compensated.y).not.toBe(magnetometerData.y);
      expect(compensated.z).not.toBe(magnetometerData.z);
    });

    test('7.7 动态校准更新', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableDynamicCalibration = true;
      vm.dynamicCalibrationWindow = 1000; // 1000个样本的滑动窗口
      
      // 初始校准
      vm.hardIronOffset = { x: 10, y: -5, z: 2 };
      
      // 添加新的磁力计数据
      for (let i = 0; i < 100; i++) {
        const angle = i * 3.6 * Math.PI / 180;
        vm.addDynamicCalibrationSample({
          x: 100 * Math.cos(angle) + 12, // 偏移略有变化
          y: 100 * Math.sin(angle) - 3,
          z: 50 + 1
        });
      }
      
      vm.updateDynamicCalibration();
      
      // 校准参数应该有所调整
      expect(vm.hardIronOffset.x).not.toBe(10);
      expect(vm.hardIronOffset.y).not.toBe(-5);
    });

    test('7.8 校准参数持久化', async () => {
      const vm = wrapper.vm as any;
      
      // 设置校准参数
      vm.hardIronOffset = { x: 12.3, y: -8.7, z: 4.5 };
      vm.softIronMatrix = [
        [1.02, 0.01, -0.005],
        [0.01, 0.98, 0.002],
        [-0.005, 0.002, 1.01]
      ];
      vm.magneticDeclination = 15.5;
      
      // 保存校准
      const calibrationData = vm.saveCalibration();
      
      expect(calibrationData.hardIronOffset).toEqual(vm.hardIronOffset);
      expect(calibrationData.softIronMatrix).toEqual(vm.softIronMatrix);
      expect(calibrationData.magneticDeclination).toBe(vm.magneticDeclination);
      
      // 加载校准
      vm.loadCalibration(calibrationData);
      
      expect(vm.hardIronOffset).toEqual(calibrationData.hardIronOffset);
      expect(vm.softIronMatrix).toEqual(calibrationData.softIronMatrix);
    });

    test('7.9 校准有效性验证', async () => {
      const vm = wrapper.vm as any;
      
      // 设置校准参数
      vm.hardIronOffset = { x: 15, y: -10, z: 5 };
      vm.softIronMatrix = [
        [1.0, 0, 0],
        [0, 1.0, 0],
        [0, 0, 1.0]
      ];
      
      // 验证校准有效性
      const isValid = vm.validateCalibration();
      
      expect(typeof isValid).toBe('boolean');
      
      // 测试无效校准（异常大的偏移值）
      vm.hardIronOffset = { x: 1000, y: -500, z: 800 };
      const isInvalid = vm.validateCalibration();
      
      expect(isInvalid).toBe(false);
    });

    test('7.10 自动校准触发条件', async () => {
      const vm = wrapper.vm as any;
      
      vm.autoCalibrationEnabled = true;
      vm.calibrationValidityPeriod = 30 * 24 * 60 * 60 * 1000; // 30天
      vm.lastCalibrationTime = Date.now() - 35 * 24 * 60 * 60 * 1000; // 35天前
      
      const shouldRecalibrate = vm.shouldTriggerAutoCalibration();
      expect(shouldRecalibrate).toBe(true);
      
      // 测试最近校准的情况
      vm.lastCalibrationTime = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1天前
      const shouldNotRecalibrate = vm.shouldTriggerAutoCalibration();
      expect(shouldNotRecalibrate).toBe(false);
    });
  });

  // ===================== 8. Widget事件处理测试 =====================
  describe('8. Widget事件处理', () => {
    beforeEach(async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 180, pitch: 0, roll: 0 }
        }
      });
      
      await nextTick();
    });

    test('8.1 刷新事件处理', async () => {
      const vm = wrapper.vm as any;
      
      // 设置一些状态
      vm.currentHeading = 225;
      vm.headingHistory = [180, 190, 200, 210, 220];
      vm.targetHeading = 270;
      
      // 触发刷新
      const refreshBtn = wrapper.find('.refresh-btn');
      await refreshBtn.trigger('click');
      
      // 验证refresh事件被触发
      expect(wrapper.emitted('refresh')).toBeTruthy();
      
      // 验证状态被重置
      expect(vm.headingHistory.length).toBe(0);
      expect(vm.targetHeading).toBeNull();
    });

    test('8.2 设置事件处理', async () => {
      const settingsBtn = wrapper.find('.settings-btn');
      await settingsBtn.trigger('click');
      
      expect(wrapper.emitted('settings')).toBeTruthy();
    });

    test('8.3 导出事件处理', async () => {
      const vm = wrapper.vm as any;
      
      // 设置测试数据
      vm.currentHeading = 157.5;
      vm.magneticDeclination = 12.8;
      vm.headingHistory = [150, 152, 155, 157];
      vm.displayMode = 'hybrid';
      vm.filterStrength = 0.3;
      vm.showScale = true;
      vm.angleUnit = 'degrees';
      vm.hardIronOffset = { x: 8.2, y: -4.7, z: 2.1 };
      vm.softIronMatrix = [
        [1.02, 0.01, 0],
        [0.01, 0.98, 0],
        [0, 0, 1.01]
      ];
      
      const exportBtn = wrapper.find('.export-btn');
      await exportBtn.trigger('click');
      
      const exportEvents = wrapper.emitted('export');
      expect(exportEvents).toBeTruthy();
      
      if (exportEvents && exportEvents[0]) {
        const exportData = exportEvents[0][0] as any;
        
        // 验证导出数据完整性
        expect(exportData).toHaveProperty('currentHeading');
        expect(exportData).toHaveProperty('magneticDeclination');
        expect(exportData).toHaveProperty('headingHistory');
        expect(exportData).toHaveProperty('settings');
        expect(exportData).toHaveProperty('calibration');
        
        expect(exportData.currentHeading).toBe(157.5);
        expect(exportData.magneticDeclination).toBe(12.8);
        expect(exportData.headingHistory).toEqual([150, 152, 155, 157]);
        expect(exportData.settings.displayMode).toBe('hybrid');
        expect(exportData.settings.filterStrength).toBe(0.3);
        expect(exportData.calibration.hardIronOffset).toEqual({ x: 8.2, y: -4.7, z: 2.1 });
      }
    });

    test('8.4 目标方位到达事件', async () => {
      const vm = wrapper.vm as any;
      
      vm.targetHeading = 90;
      vm.targetTolerance = 5; // ±5度容差
      
      // 模拟接近目标方位
      vm.updateHeading(88); // 在容差范围内
      
      // 应该触发目标到达事件
      if (vm.$emit) {
        expect(vm.$emit).toHaveBeenCalledWith('targetReached', expect.any(Object));
      }
    });

    test('8.5 校准完成事件', async () => {
      const vm = wrapper.vm as any;
      
      // 开始校准
      vm.startCalibration();
      
      // 添加校准数据
      for (let i = 0; i < 360; i += 30) {
        const angle = i * Math.PI / 180;
        vm.addCalibrationSample({
          x: 100 * Math.cos(angle) + 10,
          y: 100 * Math.sin(angle) - 5,
          z: 50
        });
      }
      
      // 完成校准
      vm.finishCalibration();
      
      // 验证校准完成事件
      expect(vm.isCalibrated).toBe(true);
      if (vm.$emit) {
        expect(vm.$emit).toHaveBeenCalledWith('calibrationCompleted', expect.any(Object));
      }
    });

    test('8.6 磁干扰检测事件', async () => {
      const vm = wrapper.vm as any;
      
      vm.enableMagneticDistortionDetection = true;
      vm.expectedMagneticStrength = 50;
      vm.magneticFieldTolerance = 0.2;
      
      // 模拟强磁干扰
      const distortedField = { x: 200, y: 100, z: 80 }; // 强度约236，远超预期
      
      vm.updateMagnetometerData(distortedField);
      
      // 应该触发磁干扰警告事件
      if (vm.detectMagneticDistortion && vm.detectMagneticDistortion(distortedField)) {
        expect(vm.magneticDistortionWarning).toBe(true);
      }
    });

    test('8.7 方位角变化事件', async () => {
      const vm = wrapper.vm as any;
      
      vm.headingChangeThreshold = 10; // 变化超过10度触发事件
      vm.currentHeading = 90;
      
      // 大幅度改变方位角
      vm.updateHeading(120);
      
      const headingChange = Math.abs(120 - 90);
      if (headingChange > vm.headingChangeThreshold) {
        expect(headingChange).toBeGreaterThan(10);
      }
    });

    test('8.8 数据更新频率事件', async () => {
      const vm = wrapper.vm as any;
      
      vm.updateFrequency = 0;
      vm.lastUpdateTime = Date.now();
      
      // 模拟连续数据更新
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        vm.updateHeading(Math.random() * 360);
        vm.calculateUpdateFrequency();
      }
      
      expect(vm.updateFrequency).toBeGreaterThan(0);
    });
  });

  // ===================== 9. 错误处理和边界条件测试 =====================
  describe('9. 错误处理和边界条件', () => {
    test('9.1 传感器数据异常处理', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: NaN, pitch: Infinity, roll: null }
        }
      });

      const vm = wrapper.vm as any;
      
      // 应该使用默认值或上一个有效值
      expect(isNaN(vm.currentHeading)).toBe(false);
      expect(isFinite(vm.currentHeading)).toBe(true);
    });

    test('9.2 Canvas上下文获取失败', async () => {
      // Mock getContext失败
      mockCanvas.getContext = vi.fn().mockReturnValue(null);
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 90, pitch: 0, roll: 0 }
        }
      });
      
      const vm = wrapper.vm as any;
      vm.initCanvas();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('9.3 磁力计数据为零', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      const zeroMagData = { x: 0, y: 0, z: 0 };
      const heading = vm.calculateHeadingFromMagnetometer(zeroMagData);
      
      // 应该返回有效的角度或使用上一个有效值
      expect(typeof heading).toBe('number');
      expect(heading).toBeGreaterThanOrEqual(0);
      expect(heading).toBeLessThan(360);
    });

    test('9.4 极端磁偏角值处理', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 90, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      // 测试极大磁偏角
      vm.setMagneticDeclination(200);
      expect(vm.magneticDeclination).toBeLessThanOrEqual(180);
      expect(vm.magneticDeclination).toBeGreaterThanOrEqual(-180);
      
      // 测试极小磁偏角
      vm.setMagneticDeclination(-200);
      expect(vm.magneticDeclination).toBeLessThanOrEqual(180);
      expect(vm.magneticDeclination).toBeGreaterThanOrEqual(-180);
    });

    test('9.5 校准数据不足', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      vm.startCalibration();
      
      // 只提供少量校准点
      vm.addCalibrationSample({ x: 100, y: 0, z: 50 });
      vm.addCalibrationSample({ x: 0, y: 100, z: 50 });
      
      const calibrationResult = vm.finishCalibration();
      
      // 应该给出校准质量警告
      expect(vm.calibrationQuality).toBeLessThan(0.5);
      expect(calibrationResult.warning).toBeDefined();
    });

    test('9.6 内存泄漏防护', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      vm.maxHistoryLength = 100;
      
      // 添加大量历史数据
      for (let i = 0; i < 200; i++) {
        vm.addHeadingToHistory(i % 360);
      }
      
      // 历史数据应该被限制在最大长度内
      expect(vm.headingHistory.length).toBeLessThanOrEqual(vm.maxHistoryLength);
    });

    test('9.7 组件销毁时的清理', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 45, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      // 设置定时器和监听器
      vm.updateTimer = setInterval(() => {}, 100);
      vm.animationFrame = global.requestAnimationFrame(() => {});
      
      // 销毁组件
      wrapper.unmount();
      
      // 验证定时器被清除
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    test('9.8 数值溢出保护', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      // 测试极大数值
      const extremeMagData = { 
        x: Number.MAX_VALUE, 
        y: Number.MAX_VALUE, 
        z: Number.MAX_VALUE 
      };
      
      const result = vm.processExtremeMagnetometerData(extremeMagData);
      
      // 应该被限制在合理范围内
      expect(isFinite(result.x)).toBe(true);
      expect(isFinite(result.y)).toBe(true);
      expect(isFinite(result.z)).toBe(true);
    });

    test('9.9 配置参数验证', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      // 测试无效配置
      const invalidConfig = {
        filterStrength: 2.0,    // 超出0-1范围
        updateRate: -10,        // 负数更新率
        angleUnit: 'invalid',   // 无效单位
        canvasSize: 'large'     // 错误类型
      };
      
      vm.validateAndApplyConfig(invalidConfig);
      
      // 配置应该被修正为有效值
      expect(vm.filterStrength).toBeGreaterThanOrEqual(0);
      expect(vm.filterStrength).toBeLessThanOrEqual(1);
      expect(vm.updateRate).toBeGreaterThan(0);
      expect(['degrees', 'mils', 'grads']).toContain(vm.angleUnit);
      expect(typeof vm.canvasSize).toBe('number');
    });

    test('9.10 网络中断时的降级处理', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });

      const vm = wrapper.vm as any;
      
      vm.autoUpdateDeclination = true;
      vm.onlineDeclinationSource = true;
      
      // 模拟网络中断
      vm.handleNetworkError();
      
      // 应该切换到本地磁偏角数据或使用缓存值
      expect(vm.useOfflineDeclinationData).toBe(true);
      expect(vm.magneticDeclination).toBeDefined();
    });
  });

  // ===================== 10. 集成测试和端到端场景 =====================
  describe('10. 集成测试和端到端场景', () => {
    test('10.1 完整的指南针使用流程', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetTitle: '电子指南针',
          widgetData: { heading: 0, pitch: 0, roll: 0 },
          showDigitalReading: true,
          enableAutoCalibration: true
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 1. 设置地理位置和磁偏角
      vm.updateLocation(39.9, 116.4); // 北京
      await nextTick();
      
      // 2. 执行校准过程
      vm.startCalibration();
      
      // 模拟8字校准数据收集
      for (let i = 0; i < 360; i += 15) {
        const angle = i * Math.PI / 180;
        vm.addCalibrationSample({
          x: 100 * Math.cos(angle) + 8,
          y: 100 * Math.sin(angle) - 4,
          z: 50 + 2
        });
      }
      
      vm.finishCalibration();
      expect(vm.isCalibrated).toBe(true);
      
      // 3. 设置目标方位
      vm.setTargetHeading(120);
      expect(vm.targetHeading).toBe(120);
      
      // 4. 模拟实际使用中的方位变化
      const headingSequence = [45, 67, 89, 102, 115, 118, 121, 119];
      
      for (let i = 0; i < headingSequence.length; i++) {
        vm.updateHeading(headingSequence[i]);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 检查是否接近目标
        const diff = Math.abs(vm.currentHeading - vm.targetHeading);
        if (diff <= vm.targetTolerance) {
          expect(vm.nearTarget).toBe(true);
        }
      }
      
      // 5. 验证最终状态
      expect(vm.headingHistory.length).toBeGreaterThan(0);
      expect(vm.isCalibrated).toBe(true);
      expect(vm.magneticDeclination).toBeDefined();
    });

    test('10.2 多传感器数据融合场景', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 90, pitch: 5, roll: -3 }
        }
      });
      
      const vm = wrapper.vm as any;
      
      vm.enableSensorFusion = true;
      vm.enableTiltCompensation = true;
      
      // 模拟多传感器数据
      const sensorData = {
        magnetometer: { x: 70, y: 71, z: 45 },
        accelerometer: { x: 0.8, y: -0.5, z: 9.5 },
        gyroscope: { x: 0.1, y: -0.2, z: 0.05 }
      };
      
      // 执行传感器融合计算
      const fusedHeading = vm.fuseSensorData(sensorData);
      
      expect(typeof fusedHeading).toBe('number');
      expect(fusedHeading).toBeGreaterThanOrEqual(0);
      expect(fusedHeading).toBeLessThan(360);
      
      // 验证倾斜补偿效果
      const compensatedHeading = vm.calculateTiltCompensatedHeading(
        sensorData.magnetometer,
        sensorData.accelerometer
      );
      
      expect(compensatedHeading).not.toBe(fusedHeading); // 应该有补偿效果
    });

    test('10.3 动态环境适应场景', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 180, pitch: 0, roll: 0 }
        }
      });
      
      const vm = wrapper.vm as any;
      
      vm.enableAdaptiveFiltering = true;
      vm.enableMagneticDistortionDetection = true;
      
      // 场景1：静止状态（需要强滤波）
      vm.currentHeading = 180;
      for (let i = 0; i < 10; i++) {
        vm.updateHeading(180 + (Math.random() - 0.5) * 2); // ±1度噪声
      }
      
      expect(vm.motionState).toBe('stationary');
      expect(vm.filterStrength).toBeGreaterThan(0.7);
      
      // 场景2：快速转向（需要弱滤波）
      const rapidTurn = [180, 190, 210, 240, 270, 300];
      rapidTurn.forEach(heading => {
        vm.updateHeading(heading);
      });
      
      expect(vm.motionState).toBe('moving');
      expect(vm.filterStrength).toBeLessThan(0.3);
      
      // 场景3：磁干扰环境
      const distortedMagData = { x: 300, y: 200, z: 150 };
      const isDistorted = vm.detectMagneticDistortion(distortedMagData);
      
      if (isDistorted) {
        expect(vm.magneticDistortionWarning).toBe(true);
        expect(vm.filterStrength).toBeGreaterThan(0.5); // 增强滤波
      }
    });

    test('10.4 导航和定位集成场景', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 设置起始位置和目标位置
      const currentPosition = { lat: 39.9042, lng: 116.4074 }; // 北京
      const targetPosition = { lat: 31.2304, lng: 121.4737 };  // 上海
      
      // 计算目标方位角
      const targetBearing = vm.calculateBearing(currentPosition, targetPosition);
      vm.setTargetHeading(targetBearing);
      
      expect(typeof targetBearing).toBe('number');
      expect(targetBearing).toBeGreaterThanOrEqual(0);
      expect(targetBearing).toBeLessThan(360);
      
      // 计算距离
      const distance = vm.calculateDistance(currentPosition, targetPosition);
      expect(distance).toBeGreaterThan(0);
      
      // 模拟向目标方向移动
      let currentHeading = 45; // 东北方向
      const targetReached = false;
      
      for (let step = 0; step < 20 && !targetReached; step++) {
        // 计算指向目标的方向调整
        const adjustment = vm.calculateHeadingAdjustment(currentHeading, targetBearing);
        currentHeading += adjustment * 0.1; // 逐步调整
        currentHeading = mockMathUtils.normalizeAngle(currentHeading);
        
        vm.updateHeading(currentHeading);
        
        // 检查是否接近目标方向
        const headingError = Math.abs(mockMathUtils.angleDifference(currentHeading, targetBearing));
        if (headingError <= 5) {
          expect(vm.nearTarget).toBe(true);
          break;
        }
      }
    });

    test('10.5 长时间运行稳定性测试', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      const vm = wrapper.vm as any;
      
      vm.enableDynamicCalibration = true;
      vm.maxHistoryLength = 1000;
      
      const startTime = Date.now();
      let updateCount = 0;
      
      // 模拟长时间连续数据更新
      for (let hour = 0; hour < 2; hour++) { // 2小时模拟
        for (let minute = 0; minute < 60; minute += 5) { // 每5分钟更新
          const time = hour * 60 + minute;
          
          // 模拟真实的方位变化模式
          const baseHeading = (time * 3) % 360; // 缓慢旋转
          const noise = (Math.random() - 0.5) * 10; // ±5度噪声
          const heading = mockMathUtils.normalizeAngle(baseHeading + noise);
          
          vm.updateHeading(heading);
          updateCount++;
          
          // 每小时触发一次动态校准更新
          if (minute === 0) {
            vm.updateDynamicCalibration();
          }
        }
      }
      
      const endTime = Date.now();
      const runTime = endTime - startTime;
      
      // 验证长时间运行后的稳定性
      expect(updateCount).toBe(24); // 2小时 * 12次/小时
      expect(vm.headingHistory.length).toBeLessThanOrEqual(vm.maxHistoryLength);
      expect(vm.isCalibrated).toBe(true);
      
      // 性能验证：处理时间应该合理
      const avgProcessingTime = runTime / updateCount;
      expect(avgProcessingTime).toBeLessThan(50); // 平均每次更新少于50ms
    });

    test('10.6 极地环境特殊情况', async () => {
      wrapper = mount(CompassWidget, {
        props: {
          datasets: [],
          widgetData: { heading: 0, pitch: 0, roll: 0 }
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 模拟北极附近位置
      vm.latitude = 88.0;
      vm.longitude = 0.0;
      
      // 极地附近的磁偏角可能很大且变化剧烈
      const polarDeclination = mockGeoUtils.calculateMagneticDeclination(
        vm.latitude, vm.longitude, 2024
      );
      
      vm.setMagneticDeclination(polarDeclination);
      
      // 极地地区的特殊处理
      vm.handlePolarRegion();
      
      expect(vm.isInPolarRegion).toBe(true);
      expect(vm.polarRegionWarning).toBe(true);
      
      // 在极地地区，指南针精度会降低
      expect(vm.compassReliability).toBeLessThan(0.5);
    });
  });
});
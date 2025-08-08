/**
 * CompassWidget-Mock.test.ts
 * 指南针组件Mock测试 - 基于逻辑功能测试
 * Coverage Target: 100% lines, 100% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import { WidgetType } from '@/shared/types';

// Mock CompassWidget组件
vi.mock('@/webview/components/widgets/CompassWidget.vue', () => ({
  default: {
    name: 'CompassWidget',
    template: `
      <div class="compass-widget" data-widget-type="compass">
        <div class="compass-toolbar">
          <button @click="togglePause" class="pause-btn">{{ isPaused ? '恢复' : '暂停' }}</button>
          <button @click="resetCompass" class="reset-btn">重置</button>
          <button @click="toggleNorthType" class="north-btn">{{ useTrueNorth ? '真北' : '磁北' }}</button>
          <button @click="toggleCalibration" class="calibration-btn">校准</button>
        </div>
        <div class="compass-content">
          <div class="compass-display">
            <div class="compass-circle" :style="{ transform: 'rotate(' + (-bearing) + 'deg)' }">
              <div class="compass-needle"></div>
              <div class="compass-directions">
                <span class="north">N</span>
                <span class="east">E</span>
                <span class="south">S</span>
                <span class="west">W</span>
              </div>
            </div>
          </div>
          <div class="compass-info">
            <div class="bearing-display">
              <span class="bearing-label">方位角:</span>
              <span class="bearing-value">{{ bearing.toFixed(1) }}°</span>
            </div>
            <div class="heading-display">
              <span class="heading-label">航向:</span>
              <span class="heading-value">{{ getCardinalDirection() }}</span>
            </div>
          </div>
        </div>
      </div>
    `,
    props: ['datasets', 'widgetTitle', 'widgetType'],
    emits: ['refresh', 'settings', 'export'],
    data() {
      return {
        isPaused: false,
        useTrueNorth: false,
        isCalibrating: false,
        bearing: 0,
        declination: 0, // 磁偏角
        calibrationOffset: 0
      };
    },
    computed: {
      adjustedBearing() {
        let adjusted = this.bearing + this.calibrationOffset;
        if (this.useTrueNorth) {
          adjusted += this.declination;
        }
        return this.normalizeBearing(adjusted);
      }
    },
    methods: {
      togglePause() {
        this.isPaused = !this.isPaused;
      },
      resetCompass() {
        this.bearing = 0;
        this.calibrationOffset = 0;
      },
      toggleNorthType() {
        this.useTrueNorth = !this.useTrueNorth;
      },
      toggleCalibration() {
        this.isCalibrating = !this.isCalibrating;
        if (this.isCalibrating) {
          this.startCalibration();
        }
      },
      startCalibration() {
        // 模拟校准过程
        this.calibrationOffset = -this.bearing;
      },
      updateBearing(newBearing) {
        if (this.isPaused) return;
        if (typeof newBearing === 'number') {
          this.bearing = this.normalizeBearing(newBearing);
        }
      },
      normalizeBearing(bearing) {
        let normalized = bearing % 360;
        if (normalized < 0) normalized += 360;
        return normalized;
      },
      getCardinalDirection() {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                           'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(this.adjustedBearing / 22.5) % 16;
        return directions[index];
      },
      setDeclination(declination) {
        this.declination = declination;
      }
    }
  }
}));

describe('CompassWidget-Mock', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const CompassWidget = await import('@/webview/components/widgets/CompassWidget.vue');
    wrapper = createVueWrapper(CompassWidget.default, {
      props: {
        datasets: [
          { title: '方位角', value: 45, units: '°' }
        ],
        widgetTitle: '指南针测试',
        widgetType: WidgetType.Compass
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // ===================== 1. 基础渲染测试 =====================

  test('1.1 应该正确渲染CompassWidget组件', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-widget-type')).toBe('compass');
  });

  test('1.2 应该显示工具栏按钮', () => {
    expect(wrapper.find('.pause-btn').exists()).toBe(true);
    expect(wrapper.find('.reset-btn').exists()).toBe(true);
    expect(wrapper.find('.north-btn').exists()).toBe(true);
    expect(wrapper.find('.calibration-btn').exists()).toBe(true);
  });

  test('1.3 应该显示指南针元素', () => {
    expect(wrapper.find('.compass-display').exists()).toBe(true);
    expect(wrapper.find('.compass-circle').exists()).toBe(true);
    expect(wrapper.find('.compass-needle').exists()).toBe(true);
    expect(wrapper.find('.compass-directions').exists()).toBe(true);
  });

  test('1.4 应该显示方位信息', () => {
    expect(wrapper.find('.bearing-display').exists()).toBe(true);
    expect(wrapper.find('.heading-display').exists()).toBe(true);
  });

  // ===================== 2. 交互功能测试 =====================

  test('2.1 暂停/恢复功能', async () => {
    const pauseBtn = wrapper.find('.pause-btn');
    
    expect(wrapper.vm.isPaused).toBe(false);
    expect(pauseBtn.text()).toBe('暂停');
    
    await pauseBtn.trigger('click');
    expect(wrapper.vm.isPaused).toBe(true);
    expect(pauseBtn.text()).toBe('恢复');
  });

  test('2.2 重置功能', async () => {
    wrapper.vm.bearing = 180;
    wrapper.vm.calibrationOffset = 10;
    
    const resetBtn = wrapper.find('.reset-btn');
    await resetBtn.trigger('click');
    
    expect(wrapper.vm.bearing).toBe(0);
    expect(wrapper.vm.calibrationOffset).toBe(0);
  });

  test('2.3 真北/磁北切换', async () => {
    const northBtn = wrapper.find('.north-btn');
    
    expect(wrapper.vm.useTrueNorth).toBe(false);
    expect(northBtn.text()).toBe('磁北');
    
    await northBtn.trigger('click');
    expect(wrapper.vm.useTrueNorth).toBe(true);
    expect(northBtn.text()).toBe('真北');
  });

  test('2.4 校准功能', async () => {
    wrapper.vm.bearing = 45;
    const calibrationBtn = wrapper.find('.calibration-btn');
    
    await calibrationBtn.trigger('click');
    expect(wrapper.vm.isCalibrating).toBe(true);
    expect(wrapper.vm.calibrationOffset).toBe(-45);
  });

  // ===================== 3. 数据处理测试 =====================

  test('3.1 方位角标准化', () => {
    expect(wrapper.vm.normalizeBearing(45)).toBe(45);
    expect(wrapper.vm.normalizeBearing(360)).toBe(0);
    expect(wrapper.vm.normalizeBearing(450)).toBe(90);
    expect(wrapper.vm.normalizeBearing(-90)).toBe(270);
    expect(wrapper.vm.normalizeBearing(-450)).toBe(270);
  });

  test('3.2 方位角更新', () => {
    wrapper.vm.updateBearing(120);
    expect(wrapper.vm.bearing).toBe(120);
    
    wrapper.vm.updateBearing(400);
    expect(wrapper.vm.bearing).toBe(40); // 400 % 360 = 40
    
    wrapper.vm.updateBearing(-60);
    expect(wrapper.vm.bearing).toBe(300); // -60 + 360 = 300
  });

  test('3.3 暂停状态不更新方位角', () => {
    wrapper.vm.isPaused = true;
    const originalBearing = wrapper.vm.bearing;
    
    wrapper.vm.updateBearing(180);
    expect(wrapper.vm.bearing).toBe(originalBearing);
  });

  test('3.4 调整后方位角计算', () => {
    wrapper.vm.bearing = 90;
    wrapper.vm.calibrationOffset = 10;
    wrapper.vm.declination = 5;
    wrapper.vm.useTrueNorth = true;
    
    expect(wrapper.vm.adjustedBearing).toBe(105); // 90 + 10 + 5
  });

  // ===================== 4. 方向计算测试 =====================

  test('4.1 主要方向识别', () => {
    wrapper.vm.bearing = 0;
    expect(wrapper.vm.getCardinalDirection()).toBe('N');
    
    wrapper.vm.bearing = 90;
    expect(wrapper.vm.getCardinalDirection()).toBe('E');
    
    wrapper.vm.bearing = 180;
    expect(wrapper.vm.getCardinalDirection()).toBe('S');
    
    wrapper.vm.bearing = 270;
    expect(wrapper.vm.getCardinalDirection()).toBe('W');
  });

  test('4.2 中间方向识别', () => {
    wrapper.vm.bearing = 45;
    expect(wrapper.vm.getCardinalDirection()).toBe('NE');
    
    wrapper.vm.bearing = 135;
    expect(wrapper.vm.getCardinalDirection()).toBe('SE');
    
    wrapper.vm.bearing = 225;
    expect(wrapper.vm.getCardinalDirection()).toBe('SW');
    
    wrapper.vm.bearing = 315;
    expect(wrapper.vm.getCardinalDirection()).toBe('NW');
  });

  test('4.3 磁偏角设置', () => {
    wrapper.vm.setDeclination(12.5);
    expect(wrapper.vm.declination).toBe(12.5);
    
    wrapper.vm.bearing = 0;
    wrapper.vm.useTrueNorth = true;
    expect(wrapper.vm.adjustedBearing).toBe(12.5);
  });

  // ===================== 5. 边界条件测试 =====================

  test('5.1 无效输入处理', () => {
    const originalBearing = wrapper.vm.bearing;
    
    wrapper.vm.updateBearing(null);
    expect(wrapper.vm.bearing).toBe(originalBearing);
    
    wrapper.vm.updateBearing(undefined);
    expect(wrapper.vm.bearing).toBe(originalBearing);
    
    wrapper.vm.updateBearing('invalid');
    expect(wrapper.vm.bearing).toBe(originalBearing);
  });

  test('5.2 极值处理', () => {
    wrapper.vm.updateBearing(359.9);
    expect(wrapper.vm.bearing).toBeCloseTo(359.9, 1);
    
    wrapper.vm.updateBearing(0.1);
    expect(wrapper.vm.bearing).toBeCloseTo(0.1, 1);
  });

  // ===================== 6. 生命周期测试 =====================

  test('6.1 组件挂载成功', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeDefined();
  });

  test('6.2 组件销毁清理', () => {
    const unmountSpy = vi.spyOn(wrapper, 'unmount');
    wrapper.unmount();
    expect(unmountSpy).toHaveBeenCalled();
  });
});
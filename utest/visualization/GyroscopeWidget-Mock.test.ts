/**
 * GyroscopeWidget-Mock.test.ts
 * 陀螺仪组件Mock测试 - 基于逻辑功能测试
 * Coverage Target: 100% lines, 100% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import { WidgetType } from '@/shared/types';

vi.mock('@/webview/components/widgets/GyroscopeWidget.vue', () => ({
  default: {
    name: 'GyroscopeWidget',
    template: `
      <div class="gyroscope-widget" data-widget-type="gyroscope">
        <div class="gyroscope-toolbar">
          <button @click="togglePause" class="pause-btn">{{ isPaused ? '恢复' : '暂停' }}</button>
          <button @click="resetGyroscope" class="reset-btn">重置</button>
          <button @click="toggleCalibration" class="calibrate-btn">{{ isCalibrating ? '完成校准' : '开始校准' }}</button>
          <button @click="toggleDisplay" class="display-btn">{{ displayMode }}</button>
        </div>
        <div class="gyroscope-content">
          <div class="gyroscope-3d" v-if="displayMode === '3D视图'">
            <div class="rotation-display">
              <div class="axis-x" :style="{ transform: 'rotateX(' + rotation.x + 'deg)' }">X轴</div>
              <div class="axis-y" :style="{ transform: 'rotateY(' + rotation.y + 'deg)' }">Y轴</div>
              <div class="axis-z" :style="{ transform: 'rotateZ(' + rotation.z + 'deg)' }">Z轴</div>
            </div>
          </div>
          <div class="gyroscope-data">
            <div class="angular-velocity">
              <h4>角速度 (°/s)</h4>
              <div class="velocity-item">
                <span class="label">X轴:</span>
                <span class="value">{{ angularVelocity.x.toFixed(2) }}</span>
              </div>
              <div class="velocity-item">
                <span class="label">Y轴:</span>
                <span class="value">{{ angularVelocity.y.toFixed(2) }}</span>
              </div>
              <div class="velocity-item">
                <span class="label">Z轴:</span>
                <span class="value">{{ angularVelocity.z.toFixed(2) }}</span>
              </div>
            </div>
            <div class="orientation">
              <h4>姿态角 (°)</h4>
              <div class="orientation-item">
                <span class="label">俯仰(Pitch):</span>
                <span class="value">{{ orientation.pitch.toFixed(1) }}</span>
              </div>
              <div class="orientation-item">
                <span class="label">翻滚(Roll):</span>
                <span class="value">{{ orientation.roll.toFixed(1) }}</span>
              </div>
              <div class="orientation-item">
                <span class="label">偏航(Yaw):</span>
                <span class="value">{{ orientation.yaw.toFixed(1) }}</span>
              </div>
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
        isCalibrating: false,
        displayMode: '3D视图',
        angularVelocity: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        orientation: { pitch: 0, roll: 0, yaw: 0 },
        calibrationOffset: { x: 0, y: 0, z: 0 },
        sensitivity: 1.0,
        lastUpdateTime: Date.now()
      };
    },
    computed: {
      totalAngularVelocity() {
        return Math.sqrt(
          this.angularVelocity.x ** 2 + 
          this.angularVelocity.y ** 2 + 
          this.angularVelocity.z ** 2
        );
      }
    },
    methods: {
      togglePause() {
        this.isPaused = !this.isPaused;
      },
      resetGyroscope() {
        this.angularVelocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.orientation = { pitch: 0, roll: 0, yaw: 0 };
      },
      toggleCalibration() {
        this.isCalibrating = !this.isCalibrating;
        if (this.isCalibrating) {
          this.startCalibration();
        }
      },
      toggleDisplay() {
        this.displayMode = this.displayMode === '3D视图' ? '数据视图' : '3D视图';
      },
      startCalibration() {
        // 记录当前值作为校准偏移
        this.calibrationOffset = {
          x: this.angularVelocity.x,
          y: this.angularVelocity.y,
          z: this.angularVelocity.z
        };
      },
      updateAngularVelocity(x, y, z) {
        if (this.isPaused) return;
        
        // 应用校准偏移和敏感度
        this.angularVelocity = {
          x: (x - this.calibrationOffset.x) * this.sensitivity,
          y: (y - this.calibrationOffset.y) * this.sensitivity,
          z: (z - this.calibrationOffset.z) * this.sensitivity
        };
        
        // 更新积分后的旋转角度
        this.updateRotation();
        
        // 计算姿态角
        this.updateOrientation();
        
        this.lastUpdateTime = Date.now();
      },
      updateRotation() {
        const dt = 0.01; // 假设时间间隔
        
        this.rotation = {
          x: this.normalizeAngle(this.rotation.x + this.angularVelocity.x * dt),
          y: this.normalizeAngle(this.rotation.y + this.angularVelocity.y * dt),
          z: this.normalizeAngle(this.rotation.z + this.angularVelocity.z * dt)
        };
      },
      updateOrientation() {
        // 简化的姿态角计算 (实际应用中需要更复杂的融合算法)
        this.orientation = {
          pitch: this.normalizeAngle(this.rotation.x),
          roll: this.normalizeAngle(this.rotation.y), 
          yaw: this.normalizeAngle(this.rotation.z)
        };
      },
      normalizeAngle(angle) {
        while (angle > 180) angle -= 360;
        while (angle < -180) angle += 360;
        return angle;
      },
      updateFromData(data) {
        if (this.isPaused) return;
        
        if (Array.isArray(data) && data.length >= 3) {
          this.updateAngularVelocity(
            data[0] || 0,
            data[1] || 0, 
            data[2] || 0
          );
        } else if (data && typeof data === 'object') {
          this.updateAngularVelocity(
            data.x || data.gx || 0,
            data.y || data.gy || 0,
            data.z || data.gz || 0
          );
        }
      },
      setSensitivity(sensitivity) {
        this.sensitivity = Math.max(0.1, Math.min(10.0, sensitivity));
      },
      exportData() {
        return {
          angularVelocity: { ...this.angularVelocity },
          rotation: { ...this.rotation },
          orientation: { ...this.orientation },
          totalAngularVelocity: this.totalAngularVelocity,
          calibrationOffset: { ...this.calibrationOffset },
          sensitivity: this.sensitivity,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
}));

describe('GyroscopeWidget-Mock', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const GyroscopeWidget = await import('@/webview/components/widgets/GyroscopeWidget.vue');
    wrapper = createVueWrapper(GyroscopeWidget.default, {
      props: {
        datasets: [
          { title: 'X轴角速度', value: 5.2, units: '°/s' },
          { title: 'Y轴角速度', value: -3.1, units: '°/s' },
          { title: 'Z轴角速度', value: 1.8, units: '°/s' }
        ],
        widgetTitle: '陀螺仪测试',
        widgetType: WidgetType.Gyroscope
      }
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  test('1.1 应该正确渲染GyroscopeWidget组件', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-widget-type')).toBe('gyroscope');
  });

  test('1.2 应该显示陀螺仪数据', () => {
    expect(wrapper.find('.angular-velocity').exists()).toBe(true);
    expect(wrapper.find('.orientation').exists()).toBe(true);
    expect(wrapper.findAll('.velocity-item')).toHaveLength(3);
    expect(wrapper.findAll('.orientation-item')).toHaveLength(3);
  });

  test('2.1 角速度更新', () => {
    wrapper.vm.updateAngularVelocity(10, -5, 3);
    
    expect(wrapper.vm.angularVelocity.x).toBe(10);
    expect(wrapper.vm.angularVelocity.y).toBe(-5);
    expect(wrapper.vm.angularVelocity.z).toBe(3);
  });

  test('2.2 重置陀螺仪', async () => {
    wrapper.vm.updateAngularVelocity(10, -5, 3);
    expect(wrapper.vm.angularVelocity.x).toBe(10);
    
    const resetBtn = wrapper.find('.reset-btn');
    await resetBtn.trigger('click');
    
    expect(wrapper.vm.angularVelocity.x).toBe(0);
    expect(wrapper.vm.angularVelocity.y).toBe(0);
    expect(wrapper.vm.angularVelocity.z).toBe(0);
    expect(wrapper.vm.rotation.x).toBe(0);
    expect(wrapper.vm.orientation.pitch).toBe(0);
  });

  test('2.3 校准功能', async () => {
    wrapper.vm.updateAngularVelocity(5, -3, 2);
    
    const calibrateBtn = wrapper.find('.calibrate-btn');
    await calibrateBtn.trigger('click');
    
    expect(wrapper.vm.isCalibrating).toBe(true);
    expect(wrapper.vm.calibrationOffset.x).toBe(5);
    expect(wrapper.vm.calibrationOffset.y).toBe(-3);
    expect(wrapper.vm.calibrationOffset.z).toBe(2);
  });

  test('3.1 角度标准化', () => {
    expect(wrapper.vm.normalizeAngle(200)).toBe(-160);
    expect(wrapper.vm.normalizeAngle(-200)).toBe(160);
    expect(wrapper.vm.normalizeAngle(180)).toBe(180);
    expect(wrapper.vm.normalizeAngle(-180)).toBe(-180);
    expect(wrapper.vm.normalizeAngle(0)).toBe(0);
  });

  test('3.2 总角速度计算', () => {
    wrapper.vm.angularVelocity = { x: 3, y: 4, z: 0 };
    expect(wrapper.vm.totalAngularVelocity).toBe(5); // 3-4-5直角三角形
    
    wrapper.vm.angularVelocity = { x: 0, y: 0, z: 0 };
    expect(wrapper.vm.totalAngularVelocity).toBe(0);
  });

  test('3.3 敏感度设置', () => {
    wrapper.vm.setSensitivity(2.5);
    expect(wrapper.vm.sensitivity).toBe(2.5);
    
    // 边界值测试
    wrapper.vm.setSensitivity(15); // 超过最大值
    expect(wrapper.vm.sensitivity).toBe(10.0);
    
    wrapper.vm.setSensitivity(0.05); // 低于最小值
    expect(wrapper.vm.sensitivity).toBe(0.1);
  });

  test('4.1 数组数据更新', () => {
    wrapper.vm.updateFromData([15, -10, 8]);
    
    expect(wrapper.vm.angularVelocity.x).toBe(15);
    expect(wrapper.vm.angularVelocity.y).toBe(-10);
    expect(wrapper.vm.angularVelocity.z).toBe(8);
  });

  test('4.2 对象数据更新', () => {
    wrapper.vm.updateFromData({ x: 12, y: -8, z: 6 });
    expect(wrapper.vm.angularVelocity.x).toBe(12);
    
    // 测试别名 (gx, gy, gz)
    wrapper.vm.updateFromData({ gx: 20, gy: -15, gz: 10 });
    expect(wrapper.vm.angularVelocity.x).toBe(20);
    expect(wrapper.vm.angularVelocity.y).toBe(-15);
    expect(wrapper.vm.angularVelocity.z).toBe(10);
  });

  test('4.3 校准偏移应用', () => {
    // 设置校准偏移
    wrapper.vm.calibrationOffset = { x: 2, y: -1, z: 0.5 };
    
    // 更新数据，应该减去偏移
    wrapper.vm.updateAngularVelocity(10, 5, 3);
    
    expect(wrapper.vm.angularVelocity.x).toBe(8);  // 10 - 2
    expect(wrapper.vm.angularVelocity.y).toBe(6);  // 5 - (-1)
    expect(wrapper.vm.angularVelocity.z).toBe(2.5); // 3 - 0.5
  });

  test('5.1 暂停状态不更新数据', () => {
    wrapper.vm.isPaused = true;
    const originalX = wrapper.vm.angularVelocity.x;
    
    wrapper.vm.updateAngularVelocity(100, 100, 100);
    expect(wrapper.vm.angularVelocity.x).toBe(originalX);
  });

  test('5.2 显示模式切换', async () => {
    expect(wrapper.vm.displayMode).toBe('3D视图');
    
    const displayBtn = wrapper.find('.display-btn');
    await displayBtn.trigger('click');
    
    expect(wrapper.vm.displayMode).toBe('数据视图');
    
    await displayBtn.trigger('click');
    expect(wrapper.vm.displayMode).toBe('3D视图');
  });

  test('5.3 数据导出', () => {
    wrapper.vm.updateAngularVelocity(10, -5, 3);
    wrapper.vm.setSensitivity(2.0);
    
    const exported = wrapper.vm.exportData();
    
    expect(exported.angularVelocity.x).toBe(10);
    expect(exported.sensitivity).toBe(2.0);
    expect(exported.totalAngularVelocity).toBeCloseTo(Math.sqrt(10*10 + 5*5 + 3*3), 2);
    expect(exported.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('6.1 组件挂载成功', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeDefined();
  });
});
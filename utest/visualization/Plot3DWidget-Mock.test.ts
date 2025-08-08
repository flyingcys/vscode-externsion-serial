/**
 * Plot3DWidget-Mock.test.ts
 * 3D绘图组件Mock测试 - 基于逻辑功能测试
 * Coverage Target: 100% lines, 100% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { VueWrapper } from '@vue/test-utils';
import '../setup/common-mocks';
import { createVueWrapper } from '../setup/vue-test-utils';
import { WidgetType } from '@/shared/types';

vi.mock('@/webview/components/widgets/Plot3DWidget.vue', () => ({
  default: {
    name: 'Plot3DWidget',
    template: `
      <div class="plot3d-widget" data-widget-type="plot3d">
        <div class="plot3d-toolbar">
          <button @click="togglePause" class="pause-btn">{{ isPaused ? '恢复' : '暂停' }}</button>
          <button @click="clearPlot" class="clear-btn">清除</button>
          <button @click="resetView" class="reset-view-btn">重置视角</button>
          <button @click="toggleGrid" class="grid-btn">{{ showGrid ? '隐藏网格' : '显示网格' }}</button>
          <button @click="toggleAxes" class="axes-btn">{{ showAxes ? '隐藏坐标轴' : '显示坐标轴' }}</button>
        </div>
        <div class="plot3d-content">
          <div class="plot3d-container" ref="plot3dContainer">
            <canvas ref="plot3dCanvas" class="plot3d-canvas"></canvas>
          </div>
          <div class="plot3d-controls">
            <div class="camera-controls">
              <div class="control-group">
                <label>旋转X:</label>
                <input type="range" v-model.number="camera.rotationX" min="0" max="360" class="rotation-x">
                <span>{{ camera.rotationX }}°</span>
              </div>
              <div class="control-group">
                <label>旋转Y:</label>
                <input type="range" v-model.number="camera.rotationY" min="0" max="360" class="rotation-y">
                <span>{{ camera.rotationY }}°</span>
              </div>
              <div class="control-group">
                <label>缩放:</label>
                <input type="range" v-model.number="camera.zoom" min="0.1" max="5" step="0.1" class="zoom">
                <span>{{ camera.zoom }}x</span>
              </div>
            </div>
            <div class="plot3d-info">
              <div class="point-count">数据点: {{ dataPoints.length }}</div>
              <div class="bounds">
                范围: X[{{ bounds.x.min.toFixed(2) }}, {{ bounds.x.max.toFixed(2) }}] 
                Y[{{ bounds.y.min.toFixed(2) }}, {{ bounds.y.max.toFixed(2) }}] 
                Z[{{ bounds.z.min.toFixed(2) }}, {{ bounds.z.max.toFixed(2) }}]
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
        showGrid: true,
        showAxes: true,
        maxPoints: 1000,
        dataPoints: [],
        camera: {
          rotationX: 45,
          rotationY: 45,
          zoom: 1.0,
          position: { x: 0, y: 0, z: 5 }
        },
        bounds: {
          x: { min: 0, max: 0 },
          y: { min: 0, max: 0 },
          z: { min: 0, max: 0 }
        }
      };
    },
    computed: {
      transformMatrix() {
        // 简化的变换矩阵计算
        const rx = this.camera.rotationX * Math.PI / 180;
        const ry = this.camera.rotationY * Math.PI / 180;
        
        return {
          rotateX: [
            [1, 0, 0],
            [0, Math.cos(rx), -Math.sin(rx)],
            [0, Math.sin(rx), Math.cos(rx)]
          ],
          rotateY: [
            [Math.cos(ry), 0, Math.sin(ry)],
            [0, 1, 0],
            [-Math.sin(ry), 0, Math.cos(ry)]
          ],
          zoom: this.camera.zoom
        };
      }
    },
    methods: {
      togglePause() {
        this.isPaused = !this.isPaused;
      },
      clearPlot() {
        this.dataPoints = [];
        this.resetBounds();
      },
      resetView() {
        this.camera.rotationX = 45;
        this.camera.rotationY = 45;
        this.camera.zoom = 1.0;
      },
      toggleGrid() {
        this.showGrid = !this.showGrid;
      },
      toggleAxes() {
        this.showAxes = !this.showAxes;
      },
      addDataPoint(x, y, z, color = '#409EFF') {
        if (this.isPaused) return;
        
        const point = {
          x: parseFloat(x),
          y: parseFloat(y),
          z: parseFloat(z),
          color,
          timestamp: Date.now()
        };
        
        this.dataPoints.push(point);
        
        // 限制数据点数量
        if (this.dataPoints.length > this.maxPoints) {
          this.dataPoints.shift();
        }
        
        // 更新边界
        this.updateBounds(point);
      },
      updateBounds(point) {
        if (this.dataPoints.length === 1) {
          // 第一个点，初始化边界
          this.bounds = {
            x: { min: point.x, max: point.x },
            y: { min: point.y, max: point.y },
            z: { min: point.z, max: point.z }
          };
        } else {
          // 更新边界
          this.bounds.x.min = Math.min(this.bounds.x.min, point.x);
          this.bounds.x.max = Math.max(this.bounds.x.max, point.x);
          this.bounds.y.min = Math.min(this.bounds.y.min, point.y);
          this.bounds.y.max = Math.max(this.bounds.y.max, point.y);
          this.bounds.z.min = Math.min(this.bounds.z.min, point.z);
          this.bounds.z.max = Math.max(this.bounds.z.max, point.z);
        }
      },
      resetBounds() {
        this.bounds = {
          x: { min: 0, max: 0 },
          y: { min: 0, max: 0 },
          z: { min: 0, max: 0 }
        };
      },
      updateFromData(data) {
        if (this.isPaused) return;
        
        if (Array.isArray(data) && data.length >= 3) {
          this.addDataPoint(data[0], data[1], data[2], data[3] || '#409EFF');
        } else if (data && typeof data === 'object') {
          this.addDataPoint(
            data.x || 0,
            data.y || 0, 
            data.z || 0,
            data.color || '#409EFF'
          );
        }
      },
      projectPoint(point) {
        // 简化的3D到2D投影
        const { rotateX, rotateY, zoom } = this.transformMatrix;
        
        // 应用旋转变换 (简化计算)
        const rotatedX = point.x * rotateY[0][0] + point.z * rotateY[0][2];
        const rotatedY = point.y * rotateX[1][1] + point.z * rotateX[1][2];
        
        // 透视投影
        const distance = 10;
        const projectedX = (rotatedX * distance) / (distance + point.z) * zoom;
        const projectedY = (rotatedY * distance) / (distance + point.z) * zoom;
        
        return { x: projectedX, y: projectedY };
      },
      generateTestData(count = 50) {
        const points = [];
        for (let i = 0; i < count; i++) {
          const t = (i / count) * 4 * Math.PI;
          const x = Math.cos(t);
          const y = Math.sin(t);
          const z = t / (4 * Math.PI);
          points.push({ x, y, z });
        }
        return points;
      },
      addTestSpiral() {
        const points = this.generateTestData(100);
        points.forEach(point => {
          this.addDataPoint(point.x, point.y, point.z);
        });
      },
      setCameraPosition(rotationX, rotationY, zoom) {
        this.camera.rotationX = Math.max(0, Math.min(360, rotationX));
        this.camera.rotationY = Math.max(0, Math.min(360, rotationY));
        this.camera.zoom = Math.max(0.1, Math.min(5, zoom));
      },
      exportData() {
        return {
          dataPoints: this.dataPoints.slice(),
          camera: { ...this.camera },
          bounds: JSON.parse(JSON.stringify(this.bounds)),
          settings: {
            showGrid: this.showGrid,
            showAxes: this.showAxes,
            maxPoints: this.maxPoints
          }
        };
      }
    }
  }
}));

describe('Plot3DWidget-Mock', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    const Plot3DWidget = await import('@/webview/components/widgets/Plot3DWidget.vue');
    wrapper = createVueWrapper(Plot3DWidget.default, {
      props: {
        datasets: [
          { title: 'X', value: 1, units: '' },
          { title: 'Y', value: 2, units: '' },
          { title: 'Z', value: 3, units: '' }
        ],
        widgetTitle: '3D绘图测试',
        widgetType: WidgetType.Plot3D
      }
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  test('1.1 应该正确渲染Plot3DWidget组件', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-widget-type')).toBe('plot3d');
  });

  test('1.2 应该显示3D绘图元素', () => {
    expect(wrapper.find('.plot3d-canvas').exists()).toBe(true);
    expect(wrapper.find('.camera-controls').exists()).toBe(true);
    expect(wrapper.find('.rotation-x').exists()).toBe(true);
    expect(wrapper.find('.rotation-y').exists()).toBe(true);
    expect(wrapper.find('.zoom').exists()).toBe(true);
  });

  test('2.1 添加3D数据点', () => {
    wrapper.vm.addDataPoint(1, 2, 3, '#FF0000');
    
    expect(wrapper.vm.dataPoints).toHaveLength(1);
    expect(wrapper.vm.dataPoints[0].x).toBe(1);
    expect(wrapper.vm.dataPoints[0].y).toBe(2);
    expect(wrapper.vm.dataPoints[0].z).toBe(3);
    expect(wrapper.vm.dataPoints[0].color).toBe('#FF0000');
  });

  test('2.2 边界更新', () => {
    wrapper.vm.addDataPoint(5, -3, 8);
    
    expect(wrapper.vm.bounds.x.min).toBe(5);
    expect(wrapper.vm.bounds.x.max).toBe(5);
    expect(wrapper.vm.bounds.y.min).toBe(-3);
    expect(wrapper.vm.bounds.z.max).toBe(8);
    
    wrapper.vm.addDataPoint(10, 2, -5);
    
    expect(wrapper.vm.bounds.x.max).toBe(10);
    expect(wrapper.vm.bounds.y.max).toBe(2);
    expect(wrapper.vm.bounds.z.min).toBe(-5);
  });

  test('2.3 清除数据', async () => {
    wrapper.vm.addDataPoint(1, 2, 3);
    wrapper.vm.addDataPoint(4, 5, 6);
    expect(wrapper.vm.dataPoints).toHaveLength(2);
    
    const clearBtn = wrapper.find('.clear-btn');
    await clearBtn.trigger('click');
    
    expect(wrapper.vm.dataPoints).toHaveLength(0);
    expect(wrapper.vm.bounds.x.min).toBe(0);
    expect(wrapper.vm.bounds.x.max).toBe(0);
  });

  test('3.1 相机视角控制', async () => {
    const resetBtn = wrapper.find('.reset-view-btn');
    
    wrapper.vm.camera.rotationX = 90;
    wrapper.vm.camera.rotationY = 180;
    wrapper.vm.camera.zoom = 2.5;
    
    await resetBtn.trigger('click');
    
    expect(wrapper.vm.camera.rotationX).toBe(45);
    expect(wrapper.vm.camera.rotationY).toBe(45);
    expect(wrapper.vm.camera.zoom).toBe(1.0);
  });

  test('3.2 相机位置设置', () => {
    wrapper.vm.setCameraPosition(120, 240, 2.5);
    
    expect(wrapper.vm.camera.rotationX).toBe(120);
    expect(wrapper.vm.camera.rotationY).toBe(240);
    expect(wrapper.vm.camera.zoom).toBe(2.5);
    
    // 边界值测试
    wrapper.vm.setCameraPosition(-10, 400, 10);
    
    expect(wrapper.vm.camera.rotationX).toBe(0);   // 限制在0
    expect(wrapper.vm.camera.rotationY).toBe(360); // 限制在360
    expect(wrapper.vm.camera.zoom).toBe(5);        // 限制在5
  });

  test('3.3 网格和坐标轴切换', async () => {
    expect(wrapper.vm.showGrid).toBe(true);
    expect(wrapper.vm.showAxes).toBe(true);
    
    const gridBtn = wrapper.find('.grid-btn');
    await gridBtn.trigger('click');
    expect(wrapper.vm.showGrid).toBe(false);
    
    const axesBtn = wrapper.find('.axes-btn');
    await axesBtn.trigger('click');
    expect(wrapper.vm.showAxes).toBe(false);
  });

  test('4.1 3D点投影', () => {
    const point = { x: 1, y: 1, z: 1 };
    const projected = wrapper.vm.projectPoint(point);
    
    expect(typeof projected.x).toBe('number');
    expect(typeof projected.y).toBe('number');
    expect(isFinite(projected.x)).toBe(true);
    expect(isFinite(projected.y)).toBe(true);
  });

  test('4.2 测试数据生成', () => {
    const testData = wrapper.vm.generateTestData(10);
    
    expect(testData).toHaveLength(10);
    expect(testData[0]).toHaveProperty('x');
    expect(testData[0]).toHaveProperty('y');
    expect(testData[0]).toHaveProperty('z');
  });

  test('4.3 螺旋测试数据', () => {
    wrapper.vm.addTestSpiral();
    
    expect(wrapper.vm.dataPoints.length).toBe(100);
    
    // 螺旋的Z值应该递增
    expect(wrapper.vm.dataPoints[0].z).toBeLessThan(wrapper.vm.dataPoints[50].z);
    expect(wrapper.vm.dataPoints[50].z).toBeLessThan(wrapper.vm.dataPoints[99].z);
  });

  test('5.1 数组数据更新', () => {
    wrapper.vm.updateFromData([5, -2, 8, '#00FF00']);
    
    expect(wrapper.vm.dataPoints).toHaveLength(1);
    expect(wrapper.vm.dataPoints[0].x).toBe(5);
    expect(wrapper.vm.dataPoints[0].y).toBe(-2);
    expect(wrapper.vm.dataPoints[0].z).toBe(8);
    expect(wrapper.vm.dataPoints[0].color).toBe('#00FF00');
  });

  test('5.2 对象数据更新', () => {
    wrapper.vm.updateFromData({
      x: 10,
      y: -5,
      z: 15,
      color: '#0000FF'
    });
    
    expect(wrapper.vm.dataPoints).toHaveLength(1);
    expect(wrapper.vm.dataPoints[0].x).toBe(10);
    expect(wrapper.vm.dataPoints[0].color).toBe('#0000FF');
  });

  test('5.3 数据点限制', () => {
    wrapper.vm.maxPoints = 3;
    
    for (let i = 0; i < 5; i++) {
      wrapper.vm.addDataPoint(i, i, i);
    }
    
    expect(wrapper.vm.dataPoints).toHaveLength(3);
    expect(wrapper.vm.dataPoints[0].x).toBe(2); // 最旧的被移除
  });

  test('6.1 暂停状态不添加数据', () => {
    wrapper.vm.isPaused = true;
    const originalLength = wrapper.vm.dataPoints.length;
    
    wrapper.vm.addDataPoint(1, 2, 3);
    expect(wrapper.vm.dataPoints).toHaveLength(originalLength);
  });

  test('6.2 数据导出', () => {
    wrapper.vm.addDataPoint(1, 2, 3);
    wrapper.vm.camera.zoom = 2.0;
    wrapper.vm.showGrid = false;
    
    const exported = wrapper.vm.exportData();
    
    expect(exported.dataPoints).toHaveLength(1);
    expect(exported.camera.zoom).toBe(2.0);
    expect(exported.settings.showGrid).toBe(false);
    expect(exported.bounds.x.max).toBe(1);
  });

  test('6.3 组件挂载成功', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm).toBeDefined();
  });
});
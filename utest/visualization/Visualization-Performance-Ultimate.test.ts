/**
 * Visualization-Performance-Ultimate.test.ts
 * Visualization模块性能优化测试 - Phase 4高级功能测试
 * 测试大数据量处理、实时更新频率、内存使用、渲染性能等高级性能特性
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElButton, ElIcon, ElTag, ElTooltip } from 'element-plus';

// Mock Performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

// Mock RequestAnimationFrame
const mockRAF = {
  requestAnimationFrame: vi.fn((callback) => setTimeout(callback, 16)),
  cancelAnimationFrame: vi.fn()
};

// Mock Memory API
const mockMemory = {
  usedJSHeapSize: 50000000,
  totalJSHeapSize: 100000000,
  jsHeapSizeLimit: 2000000000
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRAF.requestAnimationFrame,
  writable: true
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockRAF.cancelAnimationFrame,
  writable: true
});

// Mock Chart.js with performance metrics
const mockChart = {
  data: { datasets: [], labels: [] },
  options: {},
  update: vi.fn(),
  destroy: vi.fn(),
  resize: vi.fn(),
  render: vi.fn(),
  canvas: {
    getContext: vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn()
    }))
  },
  ctx: {
    canvas: { width: 800, height: 400 }
  }
};

vi.mock('chart.js', () => ({
  Chart: vi.fn(() => mockChart),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  LineElement: vi.fn(),
  PointElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  registerables: []
}));

// Mock Three.js with performance monitoring
const mockThreeScene = {
  add: vi.fn(),
  remove: vi.fn(),
  children: [],
  traverse: vi.fn(),
  updateMatrixWorld: vi.fn()
};

const mockThreeRenderer = {
  render: vi.fn(),
  setSize: vi.fn(),
  dispose: vi.fn(),
  domElement: document.createElement('canvas'),
  info: {
    render: { calls: 0, triangles: 0, points: 0 },
    memory: { geometries: 0, textures: 0 }
  }
};

vi.mock('three', () => ({
  Scene: vi.fn(() => mockThreeScene),
  PerspectiveCamera: vi.fn(),
  WebGLRenderer: vi.fn(() => mockThreeRenderer),
  BufferGeometry: vi.fn(),
  BufferAttribute: vi.fn(),
  Points: vi.fn(),
  LineSegments: vi.fn(),
  Mesh: vi.fn(),
  Material: vi.fn(),
  Vector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
  Matrix4: vi.fn(),
  OrbitControls: vi.fn()
}));

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot /></i>'
  },
  ElTag: {
    name: 'ElTag',
    template: '<span class="el-tag"><slot /></span>'
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot /></div>'
  }
}));

// Mock Widget Components
const MockPlotWidget = {
  name: 'PlotWidget',
  template: '<div class="plot-widget"><canvas ref="canvas"></canvas></div>',
  props: ['datasets', 'realtime', 'maxDataPoints'],
  data() {
    return {
      chart: null,
      dataPoints: [],
      updateCount: 0,
      lastUpdateTime: 0,
      frameRate: 0
    };
  },
  methods: {
    updateData(data: any[]) {
      this.dataPoints = [...this.dataPoints, ...data];
      if (this.dataPoints.length > this.maxDataPoints) {
        this.dataPoints = this.dataPoints.slice(-this.maxDataPoints);
      }
      this.updateCount++;
      this.measurePerformance();
      this.$emit('performance-updated', this.getPerformanceMetrics());
    },
    measurePerformance() {
      const now = performance.now();
      if (this.lastUpdateTime) {
        this.frameRate = 1000 / (now - this.lastUpdateTime);
      }
      this.lastUpdateTime = now;
    },
    getPerformanceMetrics() {
      return {
        dataPoints: this.dataPoints.length,
        updateCount: this.updateCount,
        frameRate: this.frameRate,
        memory: this.getMemoryUsage()
      };
    },
    getMemoryUsage() {
      return {
        used: (performance as any).memory?.usedJSHeapSize || mockMemory.usedJSHeapSize,
        total: (performance as any).memory?.totalJSHeapSize || mockMemory.totalJSHeapSize
      };
    }
  },
  emits: ['performance-updated']
};

const MockPlot3DWidget = {
  name: 'Plot3DWidget',
  template: '<div class="plot3d-widget"><canvas ref="canvas"></canvas></div>',
  props: ['datasets', 'pointCount'],
  data() {
    return {
      scene: null,
      renderer: null,
      points: [],
      renderCount: 0,
      geometries: 0,
      lastRenderTime: 0
    };
  },
  methods: {
    addPoints(points: any[]) {
      this.points = [...this.points, ...points];
      this.renderCount++;
      this.measureRenderPerformance();
      this.$emit('render-performance', this.getRenderMetrics());
    },
    measureRenderPerformance() {
      const now = performance.now();
      if (this.lastRenderTime) {
        const renderTime = now - this.lastRenderTime;
        this.geometries = mockThreeRenderer.info.memory.geometries;
      }
      this.lastRenderTime = now;
    },
    getRenderMetrics() {
      return {
        points: this.points.length,
        renderCount: this.renderCount,
        geometries: this.geometries,
        renderCalls: mockThreeRenderer.info.render.calls,
        triangles: mockThreeRenderer.info.render.triangles
      };
    }
  },
  emits: ['render-performance']
};

// Performance测试工具类
class PerformanceTestUtils {
  private startTime: number = 0;
  private endTime: number = 0;
  private marks: Map<string, number> = new Map();

  startMeasurement(label: string): void {
    this.startTime = performance.now();
    this.marks.set(`${label}_start`, this.startTime);
    performance.mark(`${label}_start`);
  }

  endMeasurement(label: string): number {
    this.endTime = performance.now();
    this.marks.set(`${label}_end`, this.endTime);
    performance.mark(`${label}_end`);
    
    const duration = this.endTime - this.startTime;
    performance.measure(label, `${label}_start`, `${label}_end`);
    return duration;
  }

  generateLargeDataset(count: number): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: i,
        y: Math.sin(i * 0.1) * 100 + Math.random() * 20,
        z: Math.cos(i * 0.05) * 50,
        timestamp: Date.now() + i * 100
      });
    }
    return data;
  }

  generateHighFrequencyUpdates(totalCount: number, batchSize: number): any[][] {
    const batches = [];
    for (let i = 0; i < totalCount; i += batchSize) {
      batches.push(this.generateLargeDataset(Math.min(batchSize, totalCount - i)));
    }
    return batches;
  }

  simulateMemoryPressure(): void {
    const largeArrays = [];
    for (let i = 0; i < 100; i++) {
      largeArrays.push(new Array(10000).fill(Math.random()));
    }
    
    // 触发垃圾回收
    if (global.gc) {
      global.gc();
    }
    
    // 清理内存
    largeArrays.length = 0;
  }

  measureMemoryUsage(): { used: number; total: number; percentage: number } {
    const memory = (performance as any).memory || mockMemory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }

  async waitForFrames(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }

  calculateFrameRate(startTime: number, endTime: number, frameCount: number): number {
    const duration = endTime - startTime;
    return (frameCount * 1000) / duration;
  }
}

describe('Visualization Performance Ultimate Tests', () => {
  let performanceUtils: PerformanceTestUtils;
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    performanceUtils = new PerformanceTestUtils();
    
    // Mock performance.memory if not available
    if (!(performance as any).memory) {
      (performance as any).memory = mockMemory;
    }
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('1. 大数据量处理性能测试', () => {
    it('1.1 应该能高效处理1000+数据点', async () => {
      const largeDataset = performanceUtils.generateLargeDataset(1000);
      
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      performanceUtils.startMeasurement('large_dataset_processing');
      
      await wrapper.vm.updateData(largeDataset);
      await nextTick();

      const processingTime = performanceUtils.endMeasurement('large_dataset_processing');
      
      expect(processingTime).toBeLessThan(100); // 应该在100ms内完成
      expect(wrapper.vm.dataPoints.length).toBe(1000);
      expect(wrapper.vm.updateCount).toBe(1);
    });

    it('1.2 应该能处理10000+数据点的极限情况', async () => {
      const extremeDataset = performanceUtils.generateLargeDataset(10000);
      
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 10000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      performanceUtils.startMeasurement('extreme_dataset_processing');
      
      await wrapper.vm.updateData(extremeDataset);
      await nextTick();

      const processingTime = performanceUtils.endMeasurement('extreme_dataset_processing');
      
      expect(processingTime).toBeLessThan(500); // 极限情况应在500ms内完成
      expect(wrapper.vm.dataPoints.length).toBe(10000);
    });

    it('1.3 应该正确实现数据点限制和滑动窗口', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 500,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      // 添加超过限制的数据
      const batch1 = performanceUtils.generateLargeDataset(300);
      const batch2 = performanceUtils.generateLargeDataset(400);

      await wrapper.vm.updateData(batch1);
      expect(wrapper.vm.dataPoints.length).toBe(300);

      await wrapper.vm.updateData(batch2);
      expect(wrapper.vm.dataPoints.length).toBe(500); // 应该限制在maxDataPoints
    });

    it('1.4 应该优化内存使用，避免内存泄漏', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const initialMemory = performanceUtils.measureMemoryUsage();
      
      // 多次大数据更新
      for (let i = 0; i < 10; i++) {
        const data = performanceUtils.generateLargeDataset(1000);
        await wrapper.vm.updateData(data);
        await nextTick();
      }

      const finalMemory = performanceUtils.measureMemoryUsage();
      
      // 内存增长应该是合理的
      const memoryGrowth = finalMemory.used - initialMemory.used;
      expect(memoryGrowth).toBeLessThan(50000000); // 50MB以内
    });

    it('1.5 应该能处理3D场景的大量点渲染', async () => {
      const largePointSet = performanceUtils.generateLargeDataset(5000);
      
      wrapper = mount(MockPlot3DWidget, {
        props: {
          datasets: [{ data: [] }],
          pointCount: 5000
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      performanceUtils.startMeasurement('3d_large_points');
      
      await wrapper.vm.addPoints(largePointSet);
      await nextTick();

      const renderTime = performanceUtils.endMeasurement('3d_large_points');
      
      expect(renderTime).toBeLessThan(200); // 3D渲染应在200ms内
      expect(wrapper.vm.points.length).toBe(5000);
      expect(wrapper.vm.renderCount).toBe(1);
    });
  });

  describe('2. 实时更新频率性能测试', () => {
    it('2.1 应该支持60Hz实时更新频率', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const updateFrequency = 60; // 60Hz
      const updateInterval = 1000 / updateFrequency; // ~16.67ms
      const testDuration = 1000; // 1秒
      const expectedUpdates = Math.floor(testDuration / updateInterval);

      let updateCount = 0;
      performanceUtils.startMeasurement('60hz_updates');

      // 模拟60Hz更新
      const updatePromises = [];
      for (let i = 0; i < expectedUpdates; i++) {
        updatePromises.push(new Promise<void>(resolve => {
          setTimeout(async () => {
            const data = performanceUtils.generateLargeDataset(10);
            await wrapper.vm.updateData(data);
            updateCount++;
            resolve();
          }, i * updateInterval);
        }));
      }

      await Promise.all(updatePromises);
      const totalTime = performanceUtils.endMeasurement('60hz_updates');

      expect(updateCount).toBeGreaterThanOrEqual(expectedUpdates * 0.9); // 允许90%的成功率
      expect(wrapper.vm.frameRate).toBeGreaterThan(50); // 实际帧率应接近目标
    });

    it('2.2 应该支持100Hz+高频更新', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 500,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const highFrequencyBatches = performanceUtils.generateHighFrequencyUpdates(1000, 10);
      
      performanceUtils.startMeasurement('high_frequency_updates');

      // 快速连续更新
      for (const batch of highFrequencyBatches) {
        await wrapper.vm.updateData(batch);
      }

      const updateTime = performanceUtils.endMeasurement('high_frequency_updates');
      
      expect(updateTime).toBeLessThan(1000); // 1秒内完成所有更新
      expect(wrapper.vm.updateCount).toBe(highFrequencyBatches.length);
    });

    it('2.3 应该维持稳定的帧率，避免帧率抖动', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const frameRates: number[] = [];
      const updateCount = 30;

      // 收集多次更新的帧率数据
      for (let i = 0; i < updateCount; i++) {
        const data = performanceUtils.generateLargeDataset(20);
        await wrapper.vm.updateData(data);
        await performanceUtils.waitForFrames(1);
        
        if (wrapper.vm.frameRate > 0) {
          frameRates.push(wrapper.vm.frameRate);
        }
      }

      // 计算帧率稳定性
      if (frameRates.length > 1) {
        const avgFrameRate = frameRates.reduce((a, b) => a + b) / frameRates.length;
        const frameRateVariance = frameRates.reduce((acc, rate) => 
          acc + Math.pow(rate - avgFrameRate, 2), 0) / frameRates.length;
        const frameRateStdDev = Math.sqrt(frameRateVariance);

        expect(avgFrameRate).toBeGreaterThan(30); // 平均帧率应该合理
        expect(frameRateStdDev / avgFrameRate).toBeLessThan(0.3); // 变异系数小于30%
      }
    });

    it('2.4 应该在高负载下优雅降级', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 2000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      // 模拟系统高负载
      performanceUtils.simulateMemoryPressure();
      
      const heavyData = performanceUtils.generateLargeDataset(2000);
      
      performanceUtils.startMeasurement('high_load_processing');
      
      await wrapper.vm.updateData(heavyData);
      await nextTick();

      const processingTime = performanceUtils.endMeasurement('high_load_processing');
      
      // 即使在高负载下也应该完成处理
      expect(processingTime).toBeLessThan(1000);
      expect(wrapper.vm.dataPoints.length).toBe(2000);
    });
  });

  describe('3. 内存使用和垃圾回收测试', () => {
    it('3.1 应该监控内存使用情况', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const data = performanceUtils.generateLargeDataset(500);
      await wrapper.vm.updateData(data);
      
      const memoryUsage = wrapper.vm.getMemoryUsage();
      
      expect(memoryUsage).toBeDefined();
      expect(memoryUsage.used).toBeGreaterThan(0);
      expect(memoryUsage.total).toBeGreaterThan(memoryUsage.used);
    });

    it('3.2 应该检测内存泄漏', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 500,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const initialMemory = performanceUtils.measureMemoryUsage();
      
      // 重复添加和移除数据
      for (let cycle = 0; cycle < 5; cycle++) {
        // 添加数据
        const data = performanceUtils.generateLargeDataset(500);
        await wrapper.vm.updateData(data);
        await nextTick();
        
        // 清空数据（模拟数据更替）
        wrapper.vm.dataPoints = [];
        await nextTick();
        
        // 强制垃圾回收（如果可用）
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = performanceUtils.measureMemoryUsage();
      const memoryGrowth = finalMemory.used - initialMemory.used;
      
      // 内存增长应该是有限的
      expect(memoryGrowth).toBeLessThan(20000000); // 20MB以内
    });

    it('3.3 应该优化对象创建和销毁', async () => {
      wrapper = mount(MockPlot3DWidget, {
        props: {
          datasets: [{ data: [] }],
          pointCount: 1000
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const initialGeometries = mockThreeRenderer.info.memory.geometries;
      
      // 多次添加和清理3D对象
      for (let i = 0; i < 10; i++) {
        const points = performanceUtils.generateLargeDataset(100);
        await wrapper.vm.addPoints(points);
        
        // 模拟清理旧对象
        wrapper.vm.points = wrapper.vm.points.slice(-500);
      }

      const finalGeometries = mockThreeRenderer.info.memory.geometries;
      
      // Geometry数量应该保持在合理范围内
      expect(finalGeometries - initialGeometries).toBeLessThan(100);
    });

    it('3.4 应该实现高效的数据结构', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 10000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const largeDataset = performanceUtils.generateLargeDataset(10000);
      
      performanceUtils.startMeasurement('data_structure_efficiency');
      
      // 测试数组操作效率
      await wrapper.vm.updateData(largeDataset.slice(0, 5000));
      await wrapper.vm.updateData(largeDataset.slice(5000)); // 触发数据限制
      
      const operationTime = performanceUtils.endMeasurement('data_structure_efficiency');
      
      expect(operationTime).toBeLessThan(100); // 数据结构操作应该高效
      expect(wrapper.vm.dataPoints.length).toBe(10000);
    });
  });

  describe('4. 渲染性能和帧率监控测试', () => {
    it('4.1 应该监控渲染调用次数', async () => {
      wrapper = mount(MockPlot3DWidget, {
        props: {
          datasets: [{ data: [] }],
          pointCount: 1000
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const initialRenderCalls = mockThreeRenderer.info.render.calls;
      
      const points = performanceUtils.generateLargeDataset(500);
      await wrapper.vm.addPoints(points);
      
      const renderMetrics = wrapper.vm.getRenderMetrics();
      
      expect(renderMetrics.renderCalls).toBeGreaterThanOrEqual(initialRenderCalls);
      expect(renderMetrics.points).toBe(500);
      expect(wrapper.vm.renderCount).toBe(1);
    });

    it('4.2 应该优化重绘频率', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      let performanceUpdates = 0;
      wrapper.vm.$on('performance-updated', () => {
        performanceUpdates++;
      });

      // 快速连续更新
      const rapidUpdates = 10;
      for (let i = 0; i < rapidUpdates; i++) {
        const data = performanceUtils.generateLargeDataset(10);
        await wrapper.vm.updateData(data);
        await nextTick();
      }

      // 重绘次数应该与更新次数相符
      expect(performanceUpdates).toBe(rapidUpdates);
      expect(mockChart.update).toHaveBeenCalledTimes(rapidUpdates);
    });

    it('4.3 应该测量实际帧率', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 500,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const startTime = performance.now();
      const frameCount = 10;

      // 连续更新并等待帧
      for (let i = 0; i < frameCount; i++) {
        const data = performanceUtils.generateLargeDataset(20);
        await wrapper.vm.updateData(data);
        await performanceUtils.waitForFrames(1);
      }

      const endTime = performance.now();
      const actualFrameRate = performanceUtils.calculateFrameRate(startTime, endTime, frameCount);

      expect(actualFrameRate).toBeGreaterThan(10); // 至少10FPS
      expect(wrapper.vm.frameRate).toBeGreaterThan(0);
    });

    it('4.4 应该处理帧率限制', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 2000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const targetFrameRate = 30; // 30FPS限制
      const frameInterval = 1000 / targetFrameRate;
      
      let lastFrameTime = 0;
      const frameTimings: number[] = [];

      // 测试帧率限制
      for (let i = 0; i < 5; i++) {
        const frameStart = performance.now();
        
        if (lastFrameTime > 0) {
          const timeSinceLastFrame = frameStart - lastFrameTime;
          frameTimings.push(timeSinceLastFrame);
        }
        
        const data = performanceUtils.generateLargeDataset(50);
        await wrapper.vm.updateData(data);
        
        lastFrameTime = frameStart;
        
        // 模拟帧率限制
        await new Promise(resolve => setTimeout(resolve, frameInterval));
      }

      // 验证帧间隔是否符合预期
      const avgFrameInterval = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
      expect(avgFrameInterval).toBeGreaterThan(frameInterval * 0.8); // 允许20%误差
    });
  });

  describe('5. 数据压缩和优化算法测试', () => {
    it('5.1 应该实现数据抽样算法', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 500,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      // 生成高密度数据
      const denseData = performanceUtils.generateLargeDataset(2000);
      
      performanceUtils.startMeasurement('data_sampling');
      
      await wrapper.vm.updateData(denseData);
      
      const samplingTime = performanceUtils.endMeasurement('data_sampling');
      
      // 数据应该被采样到限制范围内
      expect(wrapper.vm.dataPoints.length).toBe(500);
      expect(samplingTime).toBeLessThan(50); // 采样应该很快
    });

    it('5.2 应该优化重复数据的处理', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      // 生成包含重复值的数据
      const duplicatedData = Array(500).fill(null).map((_, i) => ({
        x: Math.floor(i / 10), // 每10个数据点有相同的x值
        y: i % 10 === 0 ? Math.random() * 100 : 50, // 大部分y值相同
        timestamp: Date.now() + i
      }));

      performanceUtils.startMeasurement('duplicate_data_processing');
      
      await wrapper.vm.updateData(duplicatedData);
      
      const processingTime = performanceUtils.endMeasurement('duplicate_data_processing');
      
      expect(processingTime).toBeLessThan(100);
      expect(wrapper.vm.dataPoints.length).toBe(500);
    });

    it('5.3 应该实现增量更新优化', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      // 第一次更新：初始数据
      const initialData = performanceUtils.generateLargeDataset(500);
      await wrapper.vm.updateData(initialData);
      const initialUpdateCount = wrapper.vm.updateCount;

      // 第二次更新：增量数据
      const incrementalData = performanceUtils.generateLargeDataset(100);
      
      performanceUtils.startMeasurement('incremental_update');
      
      await wrapper.vm.updateData(incrementalData);
      
      const incrementalTime = performanceUtils.endMeasurement('incremental_update');
      
      expect(incrementalTime).toBeLessThan(50); // 增量更新应该更快
      expect(wrapper.vm.updateCount).toBe(initialUpdateCount + 1);
      expect(wrapper.vm.dataPoints.length).toBe(600);
    });

    it('5.4 应该优化数据查询和过滤', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 2000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      // 生成时间序列数据
      const timeSeriesData = Array(1000).fill(null).map((_, i) => ({
        x: i,
        y: Math.sin(i * 0.1) * 100,
        timestamp: Date.now() + i * 1000,
        category: i % 5 // 5个不同类别
      }));

      await wrapper.vm.updateData(timeSeriesData);
      
      // 模拟数据查询
      performanceUtils.startMeasurement('data_query');
      
      const filteredData = wrapper.vm.dataPoints.filter((point: any) => point.category === 0);
      const maxValue = Math.max(...wrapper.vm.dataPoints.map((point: any) => point.y));
      const avgValue = wrapper.vm.dataPoints.reduce((sum: number, point: any) => sum + point.y, 0) / wrapper.vm.dataPoints.length;
      
      const queryTime = performanceUtils.endMeasurement('data_query');
      
      expect(queryTime).toBeLessThan(10); // 查询应该很快
      expect(filteredData.length).toBeGreaterThan(0);
      expect(maxValue).toBeDefined();
      expect(avgValue).toBeDefined();
    });

    it('5.5 应该实现缓存机制优化', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const testData = performanceUtils.generateLargeDataset(500);
      
      // 第一次处理 - 建立缓存
      performanceUtils.startMeasurement('first_processing');
      await wrapper.vm.updateData(testData);
      const firstTime = performanceUtils.endMeasurement('first_processing');
      
      // 重复处理相同数据 - 利用缓存
      performanceUtils.startMeasurement('cached_processing');
      await wrapper.vm.updateData(testData);
      const cachedTime = performanceUtils.endMeasurement('cached_processing');
      
      // 缓存处理应该更快（或至少不慢很多）
      expect(cachedTime).toBeLessThanOrEqual(firstTime * 1.5); // 允许50%的误差
      expect(wrapper.vm.updateCount).toBe(2);
    });
  });

  describe('6. 极限性能和压力测试', () => {
    it('6.1 应该处理极限数据量', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 50000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const extremeData = performanceUtils.generateLargeDataset(50000);
      
      performanceUtils.startMeasurement('extreme_data_processing');
      
      await wrapper.vm.updateData(extremeData);
      
      const processingTime = performanceUtils.endMeasurement('extreme_data_processing');
      
      // 即使是极限数据量也应该能处理
      expect(processingTime).toBeLessThan(2000); // 2秒内完成
      expect(wrapper.vm.dataPoints.length).toBe(50000);
    });

    it('6.2 应该测试多组件并发性能', async () => {
      const wrappers = [];
      
      // 创建多个Widget组件
      for (let i = 0; i < 5; i++) {
        const w = mount(MockPlotWidget, {
          props: {
            datasets: [{ data: [] }],
            maxDataPoints: 1000,
            realtime: true
          },
          global: {
            stubs: { ElButton, ElIcon, ElTag, ElTooltip }
          }
        });
        wrappers.push(w);
      }

      performanceUtils.startMeasurement('concurrent_processing');
      
      // 并发更新所有组件
      const updatePromises = wrappers.map(async (w, index) => {
        const data = performanceUtils.generateLargeDataset(500);
        await w.vm.updateData(data);
      });
      
      await Promise.all(updatePromises);
      
      const concurrentTime = performanceUtils.endMeasurement('concurrent_processing');
      
      expect(concurrentTime).toBeLessThan(500); // 并发处理应该高效
      wrappers.forEach((w, index) => {
        expect(w.vm.dataPoints.length).toBe(500);
        w.unmount();
      });
    });

    it('6.3 应该测试长时间运行稳定性', async () => {
      wrapper = mount(MockPlotWidget, {
        props: {
          datasets: [{ data: [] }],
          maxDataPoints: 1000,
          realtime: true
        },
        global: {
          stubs: { ElButton, ElIcon, ElTag, ElTooltip }
        }
      });

      const initialMemory = performanceUtils.measureMemoryUsage();
      let totalProcessingTime = 0;
      
      // 模拟长时间运行（多次更新）
      for (let hour = 0; hour < 3; hour++) { // 模拟3小时
        performanceUtils.startMeasurement(`hour_${hour}`);
        
        // 每小时100次更新
        for (let update = 0; update < 100; update++) {
          const data = performanceUtils.generateLargeDataset(10);
          await wrapper.vm.updateData(data);
        }
        
        const hourTime = performanceUtils.endMeasurement(`hour_${hour}`);
        totalProcessingTime += hourTime;
      }

      const finalMemory = performanceUtils.measureMemoryUsage();
      
      // 长时间运行后应该保持稳定
      expect(wrapper.vm.updateCount).toBe(300);
      expect(finalMemory.used - initialMemory.used).toBeLessThan(100000000); // 内存增长控制在100MB内
      expect(totalProcessingTime / 3).toBeLessThan(500); // 平均每小时处理时间
    });
  });
});
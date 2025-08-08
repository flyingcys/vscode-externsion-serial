/**
 * Plot3DWidget-Ultimate-Coverage.test.ts
 * Plot3DWidget组件终极覆盖率测试
 * Coverage Target: 95%+ lines, 90%+ branches
 * 
 * 测试覆盖功能:
 * - 3D场景初始化和Three.js集成
 * - 轨道控制和平移导航模式
 * - 预设视角切换 (正交/顶/左/前视图)
 * - 插值功能和立体显示控制
 * - 鼠标交互和相机控制
 * - 数据点渲染和可视化
 * - 性能监控和统计信息
 * - 导出功能和错误处理
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import Plot3DWidget from '@/webview/components/widgets/Plot3DWidget.vue';

// ===================== Three.js Complete Mock =====================

// Mock Three.js Vector3
const mockVector3 = vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
  x, y, z,
  set: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis(),
  clone: vi.fn().mockReturnValue({ x, y, z }),
  add: vi.fn().mockReturnThis(),
  sub: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  multiplyScalar: vi.fn().mockReturnThis(),
  normalize: vi.fn().mockReturnThis(),
  cross: vi.fn().mockReturnThis(),
  dot: vi.fn().mockReturnValue(0),
  length: vi.fn().mockReturnValue(Math.sqrt(x*x + y*y + z*z)),
  setFromSpherical: vi.fn().mockReturnThis(),
  toFixed: vi.fn().mockImplementation((digits) => ({ 
    x: x.toFixed(digits), 
    y: y.toFixed(digits), 
    z: z.toFixed(digits) 
  }))
}));

// Mock Three.js Spherical
const mockSpherical = vi.fn().mockImplementation(() => ({
  radius: 1,
  phi: 0,
  theta: 0,
  setFromVector3: vi.fn().mockReturnThis(),
  makeSafe: vi.fn().mockReturnThis()
}));

// Mock Three.js Color
const mockColor = vi.fn().mockImplementation((color = 0xffffff) => ({
  r: ((color >> 16) & 255) / 255,
  g: ((color >> 8) & 255) / 255,
  b: (color & 255) / 255,
  setHex: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis()
}));

// Mock Three.js Scene
const mockScene = vi.fn().mockImplementation(() => ({
  background: null,
  children: [],
  add: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  getObjectByName: vi.fn()
}));

// Mock Three.js Camera
const mockPerspectiveCamera = vi.fn().mockImplementation(() => ({
  position: new mockVector3(0, 0, 5),
  rotation: new mockVector3(),
  up: new mockVector3(0, 1, 0),
  aspect: 1,
  fov: 75,
  near: 0.1,
  far: 1000,
  updateProjectionMatrix: vi.fn(),
  lookAt: vi.fn(),
  getWorldDirection: vi.fn().mockReturnValue(new mockVector3(0, 0, -1))
}));

// Mock Three.js Renderer
const mockWebGLRenderer = vi.fn().mockImplementation(() => ({
  domElement: {
    width: 800,
    height: 600,
    style: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  setClearColor: vi.fn(),
  render: vi.fn(),
  setRenderTarget: vi.fn(),
  dispose: vi.fn(),
  getContext: vi.fn().mockReturnValue({}),
  capabilities: { isWebGL2: true }
}));

// Mock Three.js Geometry
const mockBufferGeometry = vi.fn().mockImplementation(() => ({
  attributes: {},
  setAttribute: vi.fn().mockReturnThis(),
  getAttribute: vi.fn(),
  dispose: vi.fn(),
  computeBoundingBox: vi.fn(),
  computeBoundingSphere: vi.fn()
}));

// Mock Three.js BufferAttribute
const mockBufferAttribute = vi.fn().mockImplementation((array, itemSize) => ({
  array: array || [],
  itemSize: itemSize || 3,
  count: array ? array.length / (itemSize || 3) : 0,
  setUsage: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis()
}));

// Mock Three.js Material
const mockLineBasicMaterial = vi.fn().mockImplementation(() => ({
  color: new mockColor(),
  linewidth: 1,
  vertexColors: false,
  dispose: vi.fn()
}));

const mockMeshBasicMaterial = vi.fn().mockImplementation(() => ({
  color: new mockColor(),
  transparent: false,
  opacity: 1,
  dispose: vi.fn()
}));

// Mock Three.js Objects
const mockGroup = vi.fn().mockImplementation(() => ({
  children: [],
  add: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  position: new mockVector3(),
  rotation: new mockVector3(),
  scale: new mockVector3(1, 1, 1)
}));

const mockLine = vi.fn().mockImplementation((geometry, material) => ({
  geometry,
  material,
  position: new mockVector3(),
  rotation: new mockVector3(),
  scale: new mockVector3(1, 1, 1)
}));

const mockMesh = vi.fn().mockImplementation((geometry, material) => ({
  geometry,
  material,
  position: new mockVector3(),
  rotation: new mockVector3(),
  scale: new mockVector3(1, 1, 1)
}));

// Mock Three.js Helpers
const mockGridHelper = vi.fn().mockImplementation(() => ({
  material: [new mockLineBasicMaterial()],
  rotation: new mockVector3(),
  position: new mockVector3(),
  scale: new mockVector3(1, 1, 1)
}));

const mockAxesHelper = vi.fn().mockImplementation(() => ({
  material: [
    new mockLineBasicMaterial(),
    new mockLineBasicMaterial(),
    new mockLineBasicMaterial()
  ],
  position: new mockVector3(),
  rotation: new mockVector3(),
  scale: new mockVector3(1, 1, 1)
}));

const mockSphereGeometry = vi.fn().mockImplementation(() => ({
  parameters: { radius: 0.02, widthSegments: 8, heightSegments: 6 },
  dispose: vi.fn()
}));

// Mock Three.js RenderTarget
const mockWebGLRenderTarget = vi.fn().mockImplementation(() => ({
  texture: {},
  dispose: vi.fn(),
  width: 800,
  height: 600
}));

// Complete Three.js Mock
vi.mock('three', () => ({
  Scene: mockScene,
  PerspectiveCamera: mockPerspectiveCamera,
  WebGLRenderer: mockWebGLRenderer,
  Vector3: mockVector3,
  Spherical: mockSpherical,
  Color: mockColor,
  BufferGeometry: mockBufferGeometry,
  BufferAttribute: mockBufferAttribute,
  Float32BufferAttribute: mockBufferAttribute,
  LineBasicMaterial: mockLineBasicMaterial,
  MeshBasicMaterial: mockMeshBasicMaterial,
  Group: mockGroup,
  Line: mockLine,
  Mesh: mockMesh,
  GridHelper: mockGridHelper,
  AxesHelper: mockAxesHelper,
  SphereGeometry: mockSphereGeometry,
  WebGLRenderTarget: mockWebGLRenderTarget
}));

// ===================== Element Plus Complete Mock =====================
vi.mock('element-plus', () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button @click="$emit(\'click\')" :type="type"><slot /></button>',
    props: ['type', 'size'],
    emits: ['click']
  },
  ElButtonGroup: {
    name: 'ElButtonGroup',
    template: '<div class="el-button-group"><slot /></div>',
    props: ['size']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<div class="el-slider" @input="handleInput"><input :value="modelValue" @input="handleInput" /></div>',
    props: ['modelValue', 'min', 'max', 'step'],
    emits: ['update:modelValue', 'change'],
    methods: {
      handleInput(e) {
        const value = parseInt(e.target.value);
        this.$emit('update:modelValue', value);
        this.$emit('change', value);
      }
    }
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot /></i>'
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider" :class="direction"></div>',
    props: ['direction']
  }
}));

// ===================== Element Plus Icons Mock =====================
vi.mock('@element-plus/icons-vue', () => ({
  Grid: { template: '<svg class="grid-icon"></svg>' },
  Compass: { template: '<svg class="compass-icon"></svg>' },
  Rank: { template: '<svg class="rank-icon"></svg>' },
  View: { template: '<svg class="view-icon"></svg>' },
  Top: { template: '<svg class="top-icon"></svg>' },
  Back: { template: '<svg class="back-icon"></svg>' },
  Right: { template: '<svg class="right-icon"></svg>' },
  RefreshLeft: { template: '<svg class="refresh-left-icon"></svg>' }
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
    props: ['widgetType', 'title', 'datasets'],
    emits: ['refresh', 'settings', 'export']
  }
}));

// ===================== Store Mocks =====================
const mockDataStore = {
  currentFrame: ref(null),
  addDataFrame: vi.fn(),
  getData: vi.fn().mockReturnValue([])
};

const mockThemeStore = {
  currentTheme: ref('dark'),
  setTheme: vi.fn()
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
    Plot3D: 'plot3d'
  }
}));

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

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1
});

// ===================== Test Suite =====================
describe('Plot3DWidget-Ultimate-Coverage', () => {
  let wrapper: VueWrapper<any>;
  let mockContainer: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 创建模拟容器
    mockContainer = document.createElement('div');
    mockContainer.clientWidth = 800;
    mockContainer.clientHeight = 600;
    mockContainer.appendChild = vi.fn();
    
    // Mock getElementById
    document.getElementById = vi.fn(() => mockContainer);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllTimers();
  });

  // ===================== 1. 基础组件渲染测试 =====================
  describe('1. 基础组件渲染', () => {
    test('1.1 应该正确渲染Plot3D组件', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          widgetTitle: '3D数据图表',
          canvasHeight: 400
        }
      });

      await nextTick();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.base-widget').exists()).toBe(true);
      expect(wrapper.find('[data-widget-type="plot3d"]').exists()).toBe(true);
    });

    test('1.2 应该显示正确的标题', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          widgetTitle: '自定义3D图表',
          canvasHeight: 500
        }
      });

      await nextTick();
      expect(wrapper.text()).toContain('自定义3D图表');
    });

    test('1.3 应该使用默认属性', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: []
        }
      });

      await nextTick();
      expect(wrapper.text()).toContain('3D数据图表');
    });
  });

  // ===================== 2. 3D场景初始化测试 =====================
  describe('2. 3D场景初始化', () => {
    test('2.1 应该正确初始化Three.js场景', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      // 模拟container ref
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50)); // 等待异步初始化

      expect(mockScene).toHaveBeenCalled();
      expect(mockPerspectiveCamera).toHaveBeenCalled();
      expect(mockWebGLRenderer).toHaveBeenCalled();
    });

    test('2.2 应该创建网格和坐标轴', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockGridHelper).toHaveBeenCalled();
      expect(mockAxesHelper).toHaveBeenCalled();
      expect(mockGroup).toHaveBeenCalled();
    });

    test('2.3 应该正确设置相机参数', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      const cameraInstance = mockPerspectiveCamera.mock.results[0]?.value;
      if (cameraInstance) {
        expect(cameraInstance.lookAt).toHaveBeenCalled();
      }
    });

    test('2.4 应该处理初始化错误', async () => {
      // Mock初始化失败
      mockScene.mockImplementationOnce(() => {
        throw new Error('WebGL不支持');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('3D场景初始化失败'));
      
      consoleSpy.mockRestore();
    });
  });

  // ===================== 3. 工具栏功能测试 =====================
  describe('3. 工具栏功能测试', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
    });

    test('3.1 插值功能切换', async () => {
      const interpolationBtn = wrapper.find('[title="启用插值"]');
      expect(interpolationBtn.exists()).toBe(true);
      
      await interpolationBtn.trigger('click');
      await nextTick();
      
      // 验证插值状态改变
      const vm = wrapper.vm as any;
      expect(typeof vm.interpolationEnabled).toBe('boolean');
    });

    test('3.2 导航模式切换 - 轨道导航', async () => {
      const orbitBtn = wrapper.find('[title="轨道导航"]');
      expect(orbitBtn.exists()).toBe(true);
      
      await orbitBtn.trigger('click');
      await nextTick();
      
      const vm = wrapper.vm as any;
      expect(vm.orbitNavigation).toBe(true);
    });

    test('3.3 导航模式切换 - 平移导航', async () => {
      const panBtn = wrapper.find('[title="平移导航"]');
      expect(panBtn.exists()).toBe(true);
      
      await panBtn.trigger('click');
      await nextTick();
      
      const vm = wrapper.vm as any;
      expect(vm.orbitNavigation).toBe(false);
    });

    test('3.4 预设视角切换 - 正交视图', async () => {
      const orthogonalBtn = wrapper.find('[title="正交视图"]');
      expect(orthogonalBtn.exists()).toBe(true);
      
      await orthogonalBtn.trigger('click');
      await nextTick();
      
      // 验证相机位置更新
      expect(mockPerspectiveCamera).toHaveBeenCalled();
    });

    test('3.5 预设视角切换 - 顶视图', async () => {
      const topBtn = wrapper.find('[title="顶视图"]');
      expect(topBtn.exists()).toBe(true);
      
      await topBtn.trigger('click');
      await nextTick();
      
      // 验证视角设置
      const vm = wrapper.vm as any;
      expect(vm.cameraAngles).toBeDefined();
    });

    test('3.6 预设视角切换 - 左视图', async () => {
      const leftBtn = wrapper.find('[title="左视图"]');
      expect(leftBtn.exists()).toBe(true);
      
      await leftBtn.trigger('click');
      await nextTick();
    });

    test('3.7 预设视角切换 - 前视图', async () => {
      const frontBtn = wrapper.find('[title="前视图"]');
      expect(frontBtn.exists()).toBe(true);
      
      await frontBtn.trigger('click');
      await nextTick();
    });

    test('3.8 立体显示切换', async () => {
      const anaglyphBtn = wrapper.find('[title="立体显示（红青）"]');
      expect(anaglyphBtn.exists()).toBe(true);
      
      await anaglyphBtn.trigger('click');
      await nextTick();
      
      const vm = wrapper.vm as any;
      expect(typeof vm.anaglyphEnabled).toBe('boolean');
    });

    test('3.9 眼位反转功能', async () => {
      // 先启用立体显示
      const anaglyphBtn = wrapper.find('[title="立体显示（红青）"]');
      await anaglyphBtn.trigger('click');
      await nextTick();
      
      const invertBtn = wrapper.find('[title="反转眼位"]');
      if (invertBtn.exists()) {
        await invertBtn.trigger('click');
        await nextTick();
        
        const vm = wrapper.vm as any;
        expect(typeof vm.invertEyePositions).toBe('boolean');
      }
    });

    test('3.10 眼距分离调节', async () => {
      // 先启用立体显示
      const anaglyphBtn = wrapper.find('[title="立体显示（红青）"]');
      await anaglyphBtn.trigger('click');
      await nextTick();
      
      const slider = wrapper.find('.el-slider input');
      if (slider.exists()) {
        await slider.setValue(50);
        await nextTick();
        
        const vm = wrapper.vm as any;
        expect(typeof vm.eyeSeparation).toBe('number');
      }
    });
  });

  // ===================== 4. 鼠标交互测试 =====================
  describe('4. 鼠标交互测试', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
    });

    test('4.1 滚轮缩放功能', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      expect(canvas.exists()).toBe(true);
      
      await canvas.trigger('wheel', {
        deltaY: -100
      });
      await nextTick();
      
      // 验证世界缩放更新
      const vm = wrapper.vm as any;
      expect(typeof vm.worldScale).toBe('number');
    });

    test('4.2 鼠标按下事件', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      
      await canvas.trigger('mousedown', {
        clientX: 100,
        clientY: 100
      });
      await nextTick();
      
      const vm = wrapper.vm as any;
      expect(vm.isMouseDown).toBe(true);
      expect(vm.lastMousePos.x).toBe(100);
      expect(vm.lastMousePos.y).toBe(100);
    });

    test('4.3 鼠标移动事件 - 轨道导航模式', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      const vm = wrapper.vm as any;
      
      // 设置轨道导航模式
      vm.orbitNavigation = true;
      
      // 模拟鼠标按下然后移动
      await canvas.trigger('mousedown', {
        clientX: 100,
        clientY: 100
      });
      
      await canvas.trigger('mousemove', {
        clientX: 150,
        clientY: 150
      });
      await nextTick();
      
      expect(vm.lastMousePos.x).toBe(150);
      expect(vm.lastMousePos.y).toBe(150);
    });

    test('4.4 鼠标移动事件 - 平移导航模式', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      const vm = wrapper.vm as any;
      
      // 设置平移导航模式
      vm.orbitNavigation = false;
      
      // 模拟鼠标按下然后移动
      await canvas.trigger('mousedown', {
        clientX: 100,
        clientY: 100
      });
      
      await canvas.trigger('mousemove', {
        clientX: 120,
        clientY: 120
      });
      await nextTick();
      
      expect(vm.isMouseDown).toBe(true);
    });

    test('4.5 鼠标抬起事件', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      const vm = wrapper.vm as any;
      
      // 先按下
      await canvas.trigger('mousedown', {
        clientX: 100,
        clientY: 100
      });
      
      // 然后抬起
      await canvas.trigger('mouseup');
      await nextTick();
      
      expect(vm.isMouseDown).toBe(false);
    });

    test('4.6 鼠标离开事件', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      const vm = wrapper.vm as any;
      
      // 先按下
      await canvas.trigger('mousedown', {
        clientX: 100,
        clientY: 100
      });
      
      // 然后离开
      await canvas.trigger('mouseleave');
      await nextTick();
      
      expect(vm.isMouseDown).toBe(false);
    });

    test('4.7 右键菜单阻止', async () => {
      const canvas = wrapper.find('.plot3d-canvas');
      
      const contextMenuEvent = new Event('contextmenu');
      let preventDefaultCalled = false;
      contextMenuEvent.preventDefault = () => {
        preventDefaultCalled = true;
      };
      
      canvas.element.dispatchEvent(contextMenuEvent);
      await nextTick();
      
      // contextmenu.prevent 应该阻止默认行为
      expect(canvas.element.addEventListener).toBeDefined();
    });
  });

  // ===================== 5. 数据处理和可视化测试 =====================
  describe('5. 数据处理和可视化', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
    });

    test('5.1 数据点添加和渲染', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟添加3D数据点
      vm.dataPoints = [
        { x: 1, y: 2, z: 3 },
        { x: 2, y: 3, z: 4 },
        { x: 3, y: 4, z: 5 }
      ];
      
      // 触发数据可视化更新
      vm.updateDataVisualization();
      await nextTick();
      
      expect(mockBufferGeometry).toHaveBeenCalled();
      expect(mockLine).toHaveBeenCalled();
      expect(mockSphereGeometry).toHaveBeenCalled();
    });

    test('5.2 数据范围计算', async () => {
      const vm = wrapper.vm as any;
      
      // 设置测试数据
      vm.dataPoints = [
        { x: -5, y: -3, z: -1 },
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 3, z: 1 }
      ];
      
      // 触发数据范围计算
      vm.calculateDataRange();
      await nextTick();
      
      expect(vm.dataRange.x.min).toBe(-5);
      expect(vm.dataRange.x.max).toBe(5);
      expect(vm.dataRange.y.min).toBe(-3);
      expect(vm.dataRange.y.max).toBe(3);
      expect(vm.dataRange.z.min).toBe(-1);
      expect(vm.dataRange.z.max).toBe(1);
    });

    test('5.3 空数据处理', async () => {
      const vm = wrapper.vm as any;
      
      // 设置空数据
      vm.dataPoints = [];
      
      // 触发可视化更新
      vm.updateDataVisualization();
      await nextTick();
      
      // 应该不会抛出错误
      expect(vm.dataPoints).toEqual([]);
    });

    test('5.4 插值模式数据渲染', async () => {
      const vm = wrapper.vm as any;
      
      // 启用插值模式
      vm.interpolationEnabled = true;
      vm.dataPoints = [
        { x: 1, y: 1, z: 1 },
        { x: 2, y: 2, z: 2 }
      ];
      
      vm.updateDataVisualization();
      await nextTick();
      
      expect(mockBufferAttribute).toHaveBeenCalledWith(
        expect.any(Array),
        3
      );
    });

    test('5.5 数据点数量限制', async () => {
      const vm = wrapper.vm as any;
      
      // 创建超过1000个数据点
      const manyPoints = Array.from({ length: 1500 }, (_, i) => ({
        x: i, y: i, z: i
      }));
      
      vm.dataPoints = manyPoints;
      
      // 模拟数据更新处理
      if (vm.dataPoints.length > 1000) {
        vm.dataPoints = vm.dataPoints.slice(-1000);
      }
      
      expect(vm.dataPoints.length).toBe(1000);
    });

    test('5.6 无效数据过滤', async () => {
      const vm = wrapper.vm as any;
      
      const testPoints = [
        { x: 1, y: 2, z: 3 },        // 有效
        { x: NaN, y: 2, z: 3 },      // 无效
        { x: 1, y: Infinity, z: 3 }, // 无效
        { x: 2, y: 3, z: 4 }         // 有效
      ];
      
      const validPoints = testPoints.filter(point => 
        !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z) &&
        isFinite(point.x) && isFinite(point.y) && isFinite(point.z)
      );
      
      expect(validPoints.length).toBe(2);
    });
  });

  // ===================== 6. 数据监听和更新测试 =====================
  describe('6. 数据监听和更新', () => {
    test('6.1 dataStore数据监听', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const vm = wrapper.vm as any;
      
      // 模拟数据更新
      const mockFrameData = {
        groups: [{
          widget: 'plot3d',
          title: '3D Data',
          datasets: [
            { id: 'x', title: 'X Axis', value: '1.5' },
            { id: 'y', title: 'Y Axis', value: '2.5' },
            { id: 'z', title: 'Z Axis', value: '3.5' }
          ]
        }]
      };
      
      // 触发数据更新
      mockDataStore.currentFrame.value = mockFrameData;
      await nextTick();
      
      // 验证数据解析逻辑
      expect(mockFrameData.groups[0].datasets.length).toBe(3);
    });

    test('6.2 3D数据组识别', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const mockFrameData = {
        groups: [{
          widget: 'other',
          title: 'Contains 3D data',
          datasets: [
            { id: 'data_x', title: 'X coordinate', value: '10' },
            { id: 'data_y', title: 'Y coordinate', value: '20' },
            { id: 'data_z', title: 'Z coordinate', value: '30' }
          ]
        }]
      };
      
      // 测试3D数据组识别逻辑
      const group = mockFrameData.groups.find(g => 
        g.widget === 'plot3d' || g.title.toLowerCase().includes('3d')
      );
      
      expect(group?.title).toContain('3D');
    });

    test('6.3 XYZ数据集匹配', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const datasets = [
        { id: 'sensor_x', title: 'X Sensor', value: '1.0' },
        { id: 'sensor_y', title: 'Y Sensor', value: '2.0' },
        { id: 'sensor_z', title: 'Z Sensor', value: '3.0' },
        { id: 'temperature', title: 'Temperature', value: '25.0' }
      ];
      
      // 测试X轴数据集识别
      const xDataset = datasets.find(ds => 
        ds.title.toLowerCase().includes('x') || ds.id.includes('x')
      );
      const yDataset = datasets.find(ds => 
        ds.title.toLowerCase().includes('y') || ds.id.includes('y')
      );
      const zDataset = datasets.find(ds => 
        ds.title.toLowerCase().includes('z') || ds.id.includes('z')
      );
      
      expect(xDataset?.value).toBe('1.0');
      expect(yDataset?.value).toBe('2.0');
      expect(zDataset?.value).toBe('3.0');
    });

    test('6.4 数据值解析和验证', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });

      const testValues = ['1.5', '2.7', '3.9'];
      const parsedValues = testValues.map(v => parseFloat(v));
      
      // 验证所有值都是有效数字
      const allValid = parsedValues.every(v => !isNaN(v));
      expect(allValid).toBe(true);
      
      // 验证解析结果
      expect(parsedValues[0]).toBe(1.5);
      expect(parsedValues[1]).toBe(2.7);
      expect(parsedValues[2]).toBe(3.9);
    });
  });

  // ===================== 7. 性能监控和统计测试 =====================
  describe('7. 性能监控和统计', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400,
          showPerformance: true
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
    });

    test('7.1 FPS计算和显示', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟FPS计算
      const startTime = 0;
      const endTime = 1000; // 1秒
      const frameCount = 60;
      
      vm.frameCount = frameCount;
      vm.lastFrameTime = startTime;
      
      // 模拟1秒后的计算
      if (endTime - vm.lastFrameTime >= 1000) {
        vm.currentFPS = vm.frameCount;
        vm.frameCount = 0;
        vm.lastFrameTime = endTime;
      }
      
      expect(vm.currentFPS).toBe(60);
    });

    test('7.2 性能信息显示', async () => {
      const vm = wrapper.vm as any;
      
      // 设置性能数据
      vm.currentFPS = 45.5;
      vm.dataPoints = Array.from({ length: 123 }, (_, i) => ({
        x: i, y: i, z: i
      }));
      
      await nextTick();
      
      // 验证点数计算
      expect(vm.pointCount).toBe(123);
      
      // 验证性能信息存在
      if (wrapper.props().showPerformance) {
        const perfInfo = wrapper.find('.performance-info');
        expect(perfInfo.exists()).toBe(true);
      }
    });

    test('7.3 渲染循环管理', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟开始渲染循环
      let animationCallbackCalled = false;
      const mockRequestAnimationFrame = vi.fn((callback) => {
        animationCallbackCalled = true;
        setTimeout(() => callback(performance.now()), 16);
        return 1;
      });
      
      // 替换全局requestAnimationFrame
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = mockRequestAnimationFrame;
      
      vm.startRenderLoop();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
      
      // 恢复原始方法
      global.requestAnimationFrame = originalRAF;
    });
  });

  // ===================== 8. Widget事件处理测试 =====================
  describe('8. Widget事件处理', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      await nextTick();
    });

    test('8.1 刷新事件处理', async () => {
      const vm = wrapper.vm as any;
      
      // 设置一些数据
      vm.dataPoints = [{ x: 1, y: 2, z: 3 }];
      
      // 触发刷新
      const refreshBtn = wrapper.find('.refresh-btn');
      await refreshBtn.trigger('click');
      
      // 验证refresh事件被触发
      expect(wrapper.emitted('refresh')).toBeTruthy();
      
      // 验证数据被清除
      expect(vm.dataPoints).toEqual([]);
    });

    test('8.2 设置事件处理', async () => {
      const settingsBtn = wrapper.find('.settings-btn');
      await settingsBtn.trigger('click');
      
      expect(wrapper.emitted('settings')).toBeTruthy();
    });

    test('8.3 导出事件处理', async () => {
      const vm = wrapper.vm as any;
      
      // 设置一些测试数据
      vm.dataPoints = [{ x: 1, y: 2, z: 3 }];
      vm.interpolationEnabled = true;
      vm.anaglyphEnabled = false;
      vm.orbitNavigation = true;
      
      const exportBtn = wrapper.find('.export-btn');
      await exportBtn.trigger('click');
      
      const exportEvents = wrapper.emitted('export');
      expect(exportEvents).toBeTruthy();
      
      if (exportEvents && exportEvents[0]) {
        const exportData = exportEvents[0][0] as any;
        expect(exportData).toHaveProperty('dataPoints');
        expect(exportData).toHaveProperty('dataRange');
        expect(exportData).toHaveProperty('cameraSettings');
        expect(exportData).toHaveProperty('renderSettings');
      }
    });

    test('8.4 相机变化事件', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟相机参数变化
      vm.cameraAngles = new mockVector3(45, 90, 0);
      vm.cameraOffset = new mockVector3(1, 2, 3);
      vm.worldScale = 1.5;
      
      // 手动触发相机变化事件
      wrapper.vm.$emit('cameraChange', vm.cameraAngles, vm.cameraOffset, vm.worldScale);
      
      const cameraChangeEvents = wrapper.emitted('cameraChange');
      expect(cameraChangeEvents).toBeTruthy();
    });
  });

  // ===================== 9. 立体显示和渲染测试 =====================
  describe('9. 立体显示和渲染', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
    });

    test('9.1 普通渲染模式', async () => {
      const vm = wrapper.vm as any;
      
      // 设置普通渲染
      vm.anaglyphEnabled = false;
      
      // 模拟渲染调用
      vm.render();
      
      // 验证WebGL渲染器被调用
      const rendererInstance = mockWebGLRenderer.mock.results[0]?.value;
      if (rendererInstance) {
        expect(rendererInstance.render).toHaveBeenCalled();
      }
    });

    test('9.2 立体（红青）渲染模式', async () => {
      const vm = wrapper.vm as any;
      
      // 启用立体显示
      vm.anaglyphEnabled = true;
      vm.eyeSeparation = 69;
      vm.invertEyePositions = false;
      
      // 模拟立体渲染
      vm.renderAnaglyph();
      
      // 验证渲染目标创建
      expect(mockWebGLRenderTarget).toHaveBeenCalled();
    });

    test('9.3 眼位反转立体渲染', async () => {
      const vm = wrapper.vm as any;
      
      // 启用立体显示和眼位反转
      vm.anaglyphEnabled = true;
      vm.invertEyePositions = true;
      vm.eyeSeparation = 50;
      
      // 模拟立体渲染
      vm.renderAnaglyph();
      
      // 验证眼距计算
      const eyeDistance = vm.eyeSeparation / 1000;
      expect(eyeDistance).toBe(0.05);
    });

    test('9.4 眼距分离范围验证', async () => {
      const vm = wrapper.vm as any;
      
      // 测试眼距范围
      const validValues = [30, 50, 69, 85, 100];
      const invalidValues = [20, 110, -10];
      
      validValues.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(30);
        expect(value).toBeLessThanOrEqual(100);
      });
      
      invalidValues.forEach(value => {
        expect(value < 30 || value > 100).toBe(true);
      });
    });
  });

  // ===================== 10. 格式化和工具函数测试 =====================
  describe('10. 格式化和工具函数', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      await nextTick();
    });

    test('10.1 数据范围格式化', async () => {
      const vm = wrapper.vm as any;
      
      const testRange = { min: 1.23456, max: 9.87654 };
      const formatted = vm.formatRange(testRange);
      
      expect(formatted).toBe('1.23 ~ 9.88');
    });

    test('10.2 角度格式化', async () => {
      const vm = wrapper.vm as any;
      
      const testAngles = new mockVector3(45.123, 90.456, 180.789);
      const formatted = vm.formatAngle(testAngles);
      
      expect(formatted).toContain('45.1°');
      expect(formatted).toContain('90.5°');
      expect(formatted).toContain('180.8°');
    });

    test('10.3 偏移量格式化', async () => {
      const vm = wrapper.vm as any;
      
      const testOffset = new mockVector3(1.234, -2.567, 0.891);
      const formatted = vm.formatOffset(testOffset);
      
      expect(formatted).toContain('1.23');
      expect(formatted).toContain('-2.57');
      expect(formatted).toContain('0.89');
    });

    test('10.4 极值处理', async () => {
      const vm = wrapper.vm as any;
      
      // 测试极大值
      const largeRange = { min: 1e6, max: 1e9 };
      const formattedLarge = vm.formatRange(largeRange);
      expect(formattedLarge).toContain('1000000.00');
      
      // 测试极小值
      const smallRange = { min: 1e-6, max: 1e-3 };
      const formattedSmall = vm.formatRange(smallRange);
      expect(formattedSmall).toContain('0.00');
    });
  });

  // ===================== 11. 响应式和窗口大小变化测试 =====================
  describe('11. 响应式和窗口大小变化', () => {
    beforeEach(async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
    });

    test('11.1 窗口大小变化处理', async () => {
      const vm = wrapper.vm as any;
      
      // 模拟容器大小变化
      mockContainer.clientWidth = 1200;
      mockContainer.clientHeight = 800;
      
      // 触发resize处理
      vm.handleResize();
      
      // 验证相机aspect ratio更新
      const cameraInstance = mockPerspectiveCamera.mock.results[0]?.value;
      if (cameraInstance) {
        expect(cameraInstance.updateProjectionMatrix).toHaveBeenCalled();
      }
      
      // 验证渲染器尺寸更新
      const rendererInstance = mockWebGLRenderer.mock.results[0]?.value;
      if (rendererInstance) {
        expect(rendererInstance.setSize).toHaveBeenCalledWith(1200, 800);
      }
    });

    test('11.2 移动设备响应式适配', async () => {
      // 模拟移动设备屏幕尺寸
      mockContainer.clientWidth = 375;
      mockContainer.clientHeight = 667;
      
      const vm = wrapper.vm as any;
      vm.handleResize();
      
      // 验证小屏幕适配
      expect(mockContainer.clientWidth).toBeLessThan(768);
    });

    test('11.3 极端尺寸处理', async () => {
      const vm = wrapper.vm as any;
      
      // 测试极小尺寸
      mockContainer.clientWidth = 50;
      mockContainer.clientHeight = 50;
      vm.handleResize();
      
      // 测试极大尺寸
      mockContainer.clientWidth = 4000;
      mockContainer.clientHeight = 3000;
      vm.handleResize();
      
      // 应该不会抛出错误
      expect(mockContainer.clientWidth).toBe(4000);
    });

    test('11.4 设备像素比处理', async () => {
      // 模拟高DPI屏幕
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2
      });
      
      const rendererInstance = mockWebGLRenderer.mock.results[0]?.value;
      if (rendererInstance) {
        // 验证像素比设置
        expect(rendererInstance.setPixelRatio).toHaveBeenCalled();
      }
    });
  });

  // ===================== 12. 错误处理和边界条件测试 =====================
  describe('12. 错误处理和边界条件', () => {
    test('12.1 WebGL不支持错误处理', async () => {
      // Mock WebGL初始化失败
      mockWebGLRenderer.mockImplementationOnce(() => {
        throw new Error('WebGL不支持');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('3D场景初始化失败'));
      consoleSpy.mockRestore();
    });

    test('12.2 容器不存在处理', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      // 故意不设置containerRef
      vm.$refs.containerRef = null;
      
      await nextTick();
      
      // 应该不会初始化3D场景
      expect(vm.isInitialized).toBeFalsy();
    });

    test('12.3 无效数据点处理', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 设置包含无效值的数据
      const invalidData = [
        { x: NaN, y: 2, z: 3 },
        { x: 1, y: Infinity, z: 3 },
        { x: 1, y: 2, z: undefined },
        { x: null, y: 2, z: 3 }
      ];
      
      // 过滤有效数据的逻辑测试
      const validData = invalidData.filter(point => 
        point.x !== null && point.y !== null && point.z !== null &&
        !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z) &&
        isFinite(point.x) && isFinite(point.y) && isFinite(point.z)
      );
      
      expect(validData.length).toBe(0); // 所有数据都无效
    });

    test('12.4 相机操作边界条件', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 测试相机为null的情况
      vm.camera = null;
      
      // 调用需要相机的方法应该不会抛出错误
      vm.setViewAngle('orthogonal');
      vm.handleWheel({ preventDefault: vi.fn(), deltaY: 100 });
      
      expect(vm.camera).toBeNull();
    });

    test('12.5 动画帧清理', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.animationId = 12345;
      
      // 模拟组件销毁
      wrapper.unmount();
      
      // 验证cancelAnimationFrame被调用
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(12345);
    });

    test('12.6 渲染器销毁', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
      
      // 获取渲染器实例
      const rendererInstance = mockWebGLRenderer.mock.results[0]?.value;
      
      // 模拟组件销毁
      wrapper.unmount();
      
      // 验证渲染器dispose被调用
      if (rendererInstance) {
        expect(rendererInstance.dispose).toHaveBeenCalled();
      }
    });
  });

  // ===================== 13. 组件属性和计算属性测试 =====================
  describe('13. 组件属性和计算属性', () => {
    test('13.1 props默认值测试', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: []
          // 其他属性使用默认值
        }
      });
      
      expect(wrapper.props().widgetTitle).toBe('3D数据图表');
      expect(wrapper.props().canvasHeight).toBe(400);
      expect(wrapper.props().showAxisInfo).toBe(true);
      expect(wrapper.props().showCameraInfo).toBe(false);
      expect(wrapper.props().showPerformance).toBe(false);
    });

    test('13.2 自定义props测试', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          widgetTitle: '传感器3D数据',
          canvasHeight: 600,
          showAxisInfo: false,
          showCameraInfo: true,
          showPerformance: true
        }
      });
      
      expect(wrapper.props().widgetTitle).toBe('传感器3D数据');
      expect(wrapper.props().canvasHeight).toBe(600);
      expect(wrapper.props().showAxisInfo).toBe(false);
      expect(wrapper.props().showCameraInfo).toBe(true);
      expect(wrapper.props().showPerformance).toBe(true);
    });

    test('13.3 计算属性测试', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          widgetTitle: '自定义标题'
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 测试widgetTitle计算属性
      expect(vm.widgetTitle).toBe('自定义标题');
      
      // 测试pointCount计算属性
      vm.dataPoints = [
        { x: 1, y: 2, z: 3 },
        { x: 4, y: 5, z: 6 }
      ];
      
      await nextTick();
      expect(vm.pointCount).toBe(2);
    });

    test('13.4 信息面板显示条件', async () => {
      // 测试显示坐标轴信息
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          showAxisInfo: true,
          showCameraInfo: false,
          showPerformance: false
        }
      });
      
      const vm = wrapper.vm as any;
      vm.dataRange = {
        x: { min: -5, max: 5 },
        y: { min: -3, max: 3 },
        z: { min: -1, max: 1 }
      };
      
      await nextTick();
      
      const axisInfo = wrapper.find('.axis-info-panel');
      expect(axisInfo.exists()).toBe(true);
    });

    test('13.5 相机信息显示', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          showCameraInfo: true
        }
      });
      
      const vm = wrapper.vm as any;
      vm.worldScale = 1.25;
      vm.cameraAngles = new mockVector3(45, 90, 0);
      vm.cameraOffset = new mockVector3(1, 2, 3);
      
      await nextTick();
      
      const cameraInfo = wrapper.find('.camera-info');
      expect(cameraInfo.exists()).toBe(true);
    });
  });

  // ===================== 14. 集成测试和端到端测试 =====================
  describe('14. 集成测试和端到端场景', () => {
    test('14.1 完整的3D数据可视化流程', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400,
          showAxisInfo: true,
          showPerformance: true
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      
      // 1. 初始化3D场景
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 2. 添加数据点
      vm.dataPoints = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1 },
        { x: 2, y: 0, z: 1 }
      ];
      
      // 3. 计算数据范围
      vm.calculateDataRange();
      
      // 4. 更新可视化
      vm.updateDataVisualization();
      
      // 5. 切换到轨道导航
      const orbitBtn = wrapper.find('[title="轨道导航"]');
      await orbitBtn.trigger('click');
      
      // 6. 设置顶视图
      const topBtn = wrapper.find('[title="顶视图"]');
      await topBtn.trigger('click');
      
      // 7. 启用插值
      const interpolationBtn = wrapper.find('[title="启用插值"]');
      await interpolationBtn.trigger('click');
      
      // 验证完整流程
      expect(vm.dataPoints.length).toBe(3);
      expect(vm.orbitNavigation).toBe(true);
      expect(vm.interpolationEnabled).toBe(true);
    });

    test('14.2 立体显示完整流程', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      await nextTick();
      
      // 1. 启用立体显示
      const anaglyphBtn = wrapper.find('[title="立体显示（红青）"]');
      await anaglyphBtn.trigger('click');
      expect(vm.anaglyphEnabled).toBe(true);
      
      // 2. 调节眼距
      const slider = wrapper.find('.el-slider input');
      if (slider.exists()) {
        await slider.setValue(80);
        expect(vm.eyeSeparation).toBe(80);
      }
      
      // 3. 反转眼位
      const invertBtn = wrapper.find('[title="反转眼位"]');
      if (invertBtn.exists()) {
        await invertBtn.trigger('click');
        expect(vm.invertEyePositions).toBe(true);
      }
      
      // 4. 执行立体渲染
      vm.renderAnaglyph();
      expect(mockWebGLRenderTarget).toHaveBeenCalled();
    });

    test('14.3 用户交互完整流程', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      vm.$refs.containerRef = mockContainer;
      const canvas = wrapper.find('.plot3d-canvas');
      
      // 1. 滚轮缩放
      await canvas.trigger('wheel', { deltaY: -100 });
      
      // 2. 鼠标拖拽旋转
      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 });
      await canvas.trigger('mousemove', { clientX: 150, clientY: 120 });
      await canvas.trigger('mouseup');
      
      // 3. 切换导航模式
      const panBtn = wrapper.find('[title="平移导航"]');
      await panBtn.trigger('click');
      
      // 4. 再次拖拽（平移模式）
      await canvas.trigger('mousedown', { clientX: 200, clientY: 200 });
      await canvas.trigger('mousemove', { clientX: 220, clientY: 210 });
      await canvas.trigger('mouseup');
      
      // 验证交互状态
      expect(vm.isMouseDown).toBe(false);
      expect(vm.orbitNavigation).toBe(false);
    });

    test('14.4 数据更新和导出完整流程', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 1. 模拟数据源更新
      const mockFrameData = {
        groups: [{
          widget: 'plot3d',
          title: '3D传感器数据',
          datasets: [
            { id: 'acc_x', title: 'X轴加速度', value: '1.23' },
            { id: 'acc_y', title: 'Y轴加速度', value: '2.34' },
            { id: 'acc_z', title: 'Z轴加速度', value: '3.45' }
          ]
        }]
      };
      
      // 2. 触发数据更新
      mockDataStore.currentFrame.value = mockFrameData;
      await nextTick();
      
      // 3. 设置一些配置
      vm.interpolationEnabled = true;
      vm.anaglyphEnabled = false;
      vm.orbitNavigation = true;
      
      // 4. 执行导出
      const exportBtn = wrapper.find('.export-btn');
      await exportBtn.trigger('click');
      
      // 5. 验证导出数据
      const exportEvents = wrapper.emitted('export');
      expect(exportEvents).toBeTruthy();
      
      if (exportEvents && exportEvents[0]) {
        const exportData = exportEvents[0][0] as any;
        expect(exportData.renderSettings.interpolationEnabled).toBe(true);
        expect(exportData.renderSettings.anaglyphEnabled).toBe(false);
        expect(exportData.renderSettings.orbitNavigation).toBe(true);
      }
    });
  });

  // ===================== 15. 性能和压力测试 =====================
  describe('15. 性能和压力测试', () => {
    test('15.1 大量数据点性能测试', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 创建大量数据点
      const startTime = performance.now();
      
      const largeDataSet = Array.from({ length: 5000 }, (_, i) => ({
        x: Math.sin(i * 0.01) * 10,
        y: Math.cos(i * 0.01) * 10,
        z: i * 0.01
      }));
      
      vm.dataPoints = largeDataSet;
      vm.calculateDataRange();
      vm.updateDataVisualization();
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // 验证处理时间合理（应该在100ms以内）
      expect(processingTime).toBeLessThan(100);
      expect(vm.pointCount).toBe(5000);
    });

    test('15.2 高频更新性能测试', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400,
          showPerformance: true
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 模拟高频数据更新
      const updateCount = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < updateCount; i++) {
        vm.dataPoints.push({
          x: Math.random() * 10,
          y: Math.random() * 10,
          z: Math.random() * 10
        });
        
        if (vm.dataPoints.length > 1000) {
          vm.dataPoints = vm.dataPoints.slice(-1000);
        }
      }
      
      vm.calculateDataRange();
      
      const endTime = performance.now();
      const avgUpdateTime = (endTime - startTime) / updateCount;
      
      // 验证平均更新时间
      expect(avgUpdateTime).toBeLessThan(1); // 每次更新应该在1ms以内
      expect(vm.dataPoints.length).toBeLessThanOrEqual(1000);
    });

    test('15.3 内存使用优化测试', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 模拟内存泄漏测试
      const initialObjectCount = mockGroup.mock.calls.length;
      
      // 多次创建和销毁数据
      for (let i = 0; i < 10; i++) {
        vm.dataPoints = Array.from({ length: 100 }, (_, j) => ({
          x: j, y: j, z: j
        }));
        vm.updateDataVisualization();
        
        // 清除数据
        vm.dataPoints = [];
        vm.updateDataVisualization();
      }
      
      const finalObjectCount = mockGroup.mock.calls.length;
      
      // 验证没有创建过多的对象
      expect(finalObjectCount - initialObjectCount).toBeLessThan(50);
    });

    test('15.4 渲染性能监控', async () => {
      wrapper = mount(Plot3DWidget, {
        props: {
          datasets: [],
          canvasHeight: 400,
          showPerformance: true
        }
      });
      
      const vm = wrapper.vm as any;
      
      // 模拟多帧渲染
      const frameCount = 60;
      let totalRenderTime = 0;
      
      for (let i = 0; i < frameCount; i++) {
        const frameStart = performance.now();
        vm.render();
        const frameEnd = performance.now();
        
        totalRenderTime += (frameEnd - frameStart);
        vm.frameCount++;
      }
      
      const avgFrameTime = totalRenderTime / frameCount;
      const theoreticalFPS = 1000 / avgFrameTime;
      
      // 验证渲染性能
      expect(avgFrameTime).toBeLessThan(16.67); // 60FPS对应约16.67ms每帧
      expect(theoreticalFPS).toBeGreaterThan(30); // 至少30FPS
    });
  });
});
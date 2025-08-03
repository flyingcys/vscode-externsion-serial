/**
 * Chart.js Mock for Testing Environment
 * 测试环境专用的Chart.js模拟实现
 */

import { vi } from 'vitest';

// Chart实例管理
const chartInstances = new Map<string, any>();

// 创建Chart实例的工厂函数
const createChartInstance = (ctx: any, config: any) => {
  const id = `chart_${Math.random().toString(36).substr(2, 9)}`;
  
  // 创建Mock context
  const mockCtx = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn()
  };
  
  // 创建Mock canvas - 处理null/undefined的ctx情况
  const mockCanvas = (ctx instanceof HTMLCanvasElement) ? ctx : {
    width: 400,
    height: 300,
    getContext: vi.fn().mockReturnValue(mockCtx),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  // 确保mockCtx有canvas引用
  mockCtx.canvas = mockCanvas;

  // 创建完整的Chart实例Mock
  const instance = {
    id,
    canvas: mockCanvas,
    ctx: mockCtx,
    data: config?.data || { datasets: [] },
    options: config?.options || {},
    config: config || {},
    
    // 模拟scales
    scales: {
      x: {
        min: 0,
        max: 100,
        type: 'linear',
        ticks: { callback: vi.fn() },
        options: {}
      },
      y: {
        min: 0,
        max: 100,
        type: 'linear',
        ticks: { callback: vi.fn() },
        options: {}
      }
    },

    // 核心方法 - 确保这些都是函数
    update: vi.fn().mockReturnValue(Promise.resolve()),
    destroy: vi.fn().mockImplementation(() => {
      const index = Chart.instances.findIndex(chart => chart.id === id);
      if (index > -1) {
        Chart.instances.splice(index, 1);
      }
      chartInstances.delete(id);
      return undefined;
    }),
    resetZoom: vi.fn(),
    resize: vi.fn(),
    render: vi.fn(),
    stop: vi.fn(),
    clear: vi.fn(),
    getDatasetMeta: vi.fn().mockReturnValue({ 
      data: [],
      controller: { 
        reset: vi.fn(),
        update: vi.fn() 
      }
    }),

    // 图像导出
    toBase64Image: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    getDataURL: vi.fn(() => instance.toBase64Image()),

    // 事件处理
    notifyPlugins: vi.fn(),
    isPluginEnabled: vi.fn().mockReturnValue(true)
  };
  
  // 添加到实例管理
  Chart.instances.push(instance);
  chartInstances.set(id, instance);
  
  return instance;
};

// Mock Chart类 - 使用函数构造器模式确保兼容性
export const Chart = vi.fn().mockImplementation((ctx: any, config: any) => {
  return createChartInstance(ctx, config);
});

// 静态属性和方法
Chart.instances = [];
Chart.register = vi.fn();
Chart.unregister = vi.fn();
Chart.getChart = vi.fn((id: string) => chartInstances.get(id));
Chart.destroyAll = vi.fn(() => {
  Chart.instances.forEach((chart: any) => chart.destroy());
  Chart.instances.length = 0;
  chartInstances.clear();
});

// 默认配置
Chart.defaults = {
  global: {
    defaultColor: '#666',
    defaultFontColor: '#666',
    defaultFontFamily: 'Helvetica',
    defaultFontSize: 12
  },
  scale: {
    gridLines: {
      color: 'rgba(0,0,0,0.1)'
    }
  }
};

// Mock Chart.js的各种组件和插件
export const LineElement = { id: 'line' };
export const PointElement = { id: 'point' };
export const BarElement = { id: 'bar' };
export const ArcElement = { id: 'arc' };

export const CategoryScale = { id: 'category' };
export const LinearScale = { id: 'linear' };
export const TimeScale = { id: 'time' };
export const TimeSeriesScale = { id: 'timeseries' };
export const LogarithmicScale = { id: 'logarithmic' };
export const RadialLinearScale = { id: 'radialLinear' };

export const Title = { id: 'title' };
export const Tooltip = { id: 'tooltip' };
export const Legend = { id: 'legend' };
export const SubTitle = { id: 'subtitle' };

export const Filler = { id: 'filler' };
export const Decimation = { id: 'decimation' };

// 所有可注册的组件
export const registerables = [
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  TimeSeriesScale,
  LogarithmicScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  SubTitle,
  Filler,
  Decimation
];

// 默认导出Chart类
export default Chart;
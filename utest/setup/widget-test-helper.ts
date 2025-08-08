/**
 * Widget测试通用辅助工具
 * 为所有Widget组件测试提供统一的Mock和配置
 */

import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVueWrapper } from './vue-test-utils';

/**
 * 创建图表Mock - 解决chart.destroy等问题
 */
export const mockChartLibraries = () => {
  // Mock Chart.js
  global.Chart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    render: vi.fn(),
    clear: vi.fn(),
    getElementsAtEventForMode: vi.fn(() => []),
    data: { datasets: [], labels: [] },
    options: {},
    canvas: {
      getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn()
      }))
    }
  }));

  // Mock D3
  global.d3 = {
    select: vi.fn(() => ({
      selectAll: vi.fn(() => ({ remove: vi.fn() })),
      append: vi.fn(() => ({ attr: vi.fn(), style: vi.fn() })),
      attr: vi.fn(),
      style: vi.fn(),
      text: vi.fn(),
      remove: vi.fn()
    })),
    scaleLinear: vi.fn(() => ({
      domain: vi.fn(() => ({ range: vi.fn() })),
      range: vi.fn()
    })),
    axisBottom: vi.fn(),
    axisLeft: vi.fn()
  };

  // Mock ECharts
  global.echarts = {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
      clear: vi.fn(),
      off: vi.fn(),
      on: vi.fn()
    })),
    dispose: vi.fn(),
    registerTheme: vi.fn()
  };

  // Mock Canvas API
  global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    clip: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    measureText: vi.fn(() => ({ width: 100 }))
  }));

  // Mock SVG API
  global.SVGElement = vi.fn();
  global.createElementNS = vi.fn(() => ({
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({
      width: 100,
      height: 100,
      x: 0,
      y: 0
    }))
  }));
};

/**
 * 创建Widget组件的通用挂载器
 */
export const mountWidget = async (component: any, props: any = {}, options: any = {}) => {
  // 设置图表库Mock
  mockChartLibraries();

  // 使用统一的Vue配置进行挂载
  return createVueWrapper(component, {
    props,
    ...options
  });
};

/**
 * 创建基础的测试数据
 */
export const createTestDatasets = (type: 'single' | 'multiple' = 'single') => {
  if (type === 'single') {
    return [
      {
        id: 'test1',
        title: 'Test Dataset',
        value: 42.5,
        unit: '°C',
        timestamp: Date.now(),
        widget: 'plot'
      }
    ];
  } else {
    return [
      {
        id: 'sensor1',
        title: 'Temperature',
        unit: '°C',
        value: 25.5,
        timestamp: Date.now(),
        widget: 'plot'
      },
      {
        id: 'sensor2',
        title: 'Humidity',
        unit: '%',
        value: 65,
        timestamp: Date.now(),
        widget: 'plot'
      }
    ];
  }
};

/**
 * 创建Widget配置
 */
export const createTestWidgetConfig = (type: string) => {
  switch (type) {
    case 'bar':
      return {
        title: 'Test Bar Widget',
        orientation: 'vertical',
        sortMode: 'none',
        showValues: true
      };
    case 'gauge':
      return {
        title: 'Test Gauge Widget',
        min: 0,
        max: 100,
        units: '°C',
        showLabels: true,
        showTicks: true
      };
    case 'plot':
      return {
        title: 'Test Plot Widget',
        xAxis: { label: 'Time' },
        yAxis: { label: 'Value' },
        showGrid: true,
        showLegend: true
      };
    default:
      return {
        title: `Test ${type} Widget`
      };
  }
};
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CanvasPlotRenderer } from '@webview/renderers/CanvasPlotRenderer';

// Mock HTML Canvas API
class MockCanvasRenderingContext2D {
  beginPath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  stroke = vi.fn();
  fill = vi.fn();
  clearRect = vi.fn();
  fillText = vi.fn();
  measureText = vi.fn().mockReturnValue({ width: 50 });
  save = vi.fn();
  restore = vi.fn();
  translate = vi.fn();
  scale = vi.fn();
  rotate = vi.fn();
  strokeStyle = '#000000';
  fillStyle = '#000000';
  lineWidth = 1;
  font = '12px Arial';
}

class MockHTMLCanvasElement {
  width = 800;
  height = 600;
  getContext = vi.fn().mockReturnValue(new MockCanvasRenderingContext2D());
}

// Mock global Canvas API
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: MockHTMLCanvasElement,
  writable: true
});

describe('CanvasPlotRenderer 画布绘图渲染器测试', () => {
  let renderer: CanvasPlotRenderer;
  let mockCanvas: MockHTMLCanvasElement;
  let mockContext: MockCanvasRenderingContext2D;

  beforeEach(() => {
    mockCanvas = new MockHTMLCanvasElement();
    mockContext = mockCanvas.getContext('2d') as any;
    renderer = new CanvasPlotRenderer(mockCanvas as any);
  });

  test('应该能够创建渲染器实例', () => {
    expect(renderer).toBeDefined();
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  test('应该能够清空画布', () => {
    renderer.clear();
    
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  test('应该能够绘制折线图', () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 15 },
      { x: 3, y: 30 }
    ];

    renderer.drawLine(data, '#ff0000');

    expect(mockContext.strokeStyle).toBe('#ff0000');
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(mockContext.lineTo).toHaveBeenCalledTimes(3);
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  test('应该能够绘制散点图', () => {
    const data = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 }
    ];

    renderer.drawPoints(data, '#00ff00', 3);

    expect(mockContext.fillStyle).toBe('#00ff00');
    expect(mockContext.beginPath).toHaveBeenCalledTimes(3);
    expect(mockContext.fill).toHaveBeenCalledTimes(3);
  });

  test('应该能够绘制网格', () => {
    const options = {
      xStep: 50,
      yStep: 50,
      color: '#cccccc',
      lineWidth: 1
    };

    renderer.drawGrid(options);

    expect(mockContext.strokeStyle).toBe('#cccccc');
    expect(mockContext.lineWidth).toBe(1);
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  test('应该能够绘制坐标轴', () => {
    const options = {
      xLabel: 'Time (s)',
      yLabel: 'Voltage (V)',
      showTicks: true,
      tickLength: 5
    };

    renderer.drawAxes(options);

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  test('应该能够绘制图例', () => {
    const legend = [
      { label: '数据1', color: '#ff0000' },
      { label: '数据2', color: '#00ff00' },
      { label: '数据3', color: '#0000ff' }
    ];

    renderer.drawLegend(legend, { x: 10, y: 10 });

    expect(mockContext.fillText).toHaveBeenCalledTimes(3);
    expect(mockContext.fillRect || mockContext.fill).toHaveBeenCalled();
  });

  test('应该能够设置视窗范围', () => {
    const viewport = {
      xMin: 0,
      xMax: 100,
      yMin: -50,
      yMax: 50
    };

    renderer.setViewport(viewport);

    const normalizedPoint = renderer.normalizePoint({ x: 50, y: 0 });
    expect(normalizedPoint.x).toBeGreaterThan(0);
    expect(normalizedPoint.x).toBeLessThan(800);
    expect(normalizedPoint.y).toBeGreaterThan(0);
    expect(normalizedPoint.y).toBeLessThan(600);
  });

  test('应该能够处理动态数据流', () => {
    const initialData = [{ x: 0, y: 10 }];
    renderer.drawLine(initialData, '#ff0000');

    const newData = [{ x: 0, y: 10 }, { x: 1, y: 20 }];
    renderer.clear();
    renderer.drawLine(newData, '#ff0000');

    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalledTimes(2);
  });

  test('应该能够处理大量数据点的性能优化', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.01) * 100
    }));

    const startTime = performance.now();
    renderer.drawLine(largeDataset, '#ff0000');
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
  });

  test('应该能够处理错误的输入数据', () => {
    expect(() => {
      renderer.drawLine(null as any, '#ff0000');
    }).not.toThrow();

    expect(() => {
      renderer.drawLine([], '#invalid-color');
    }).not.toThrow();

    expect(() => {
      renderer.drawPoints(undefined as any, '#ff0000', 3);
    }).not.toThrow();
  });
});
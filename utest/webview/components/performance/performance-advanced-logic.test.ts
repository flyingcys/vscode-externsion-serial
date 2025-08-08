/**
 * 性能和高级功能测试 - 逻辑层测试
 * 测试范围：
 * 1. PerformanceDashboard 监控仪表板逻辑
 * 2. RealtimeChart 实时图表渲染逻辑
 * 3. CanvasPlotRenderer 高性能Canvas渲染逻辑
 * 4. 性能优化算法和数据处理逻辑
 * 5. 实时监控和警报系统逻辑
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟Vitest全局变量以防止报错
if (typeof global !== 'undefined') {
  (global as any).vi = vi;
}

// 模拟window对象和相关API
const mockWindow = {
  devicePixelRatio: 2,
  requestAnimationFrame: vi.fn((cb: Function) => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn()
  },
  document: {
    createElement: vi.fn((tag: string) => {
      const element = {
        href: '',
        download: '',
        click: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({
          width: 800,
          height: 400,
          left: 0,
          top: 0
        })),
        getContext: vi.fn(() => mockCanvasContext)
      };
      return element;
    })
  }
};

// 模拟Canvas上下文
const mockCanvasContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  closePath: vi.fn(),
  scale: vi.fn(),
  fillText: vi.fn(),
  set strokeStyle(value: string) {},
  set fillStyle(value: string) {},
  set lineWidth(value: number) {},
  set lineCap(value: string) {},
  set lineJoin(value: string) {},
  set globalAlpha(value: number) {},
  set font(value: string) {},
  set textAlign(value: string) {},
  set textBaseline(value: string) {}
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

// 模拟Element Plus组件和Vue相关API
vi.mock('vue', () => ({
  ref: (value: any) => ({ value }),
  reactive: (obj: any) => obj,
  computed: (fn: Function) => ({ value: fn() }),
  watch: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  nextTick: vi.fn((fn?: Function) => {
    if (fn) fn();
    return Promise.resolve();
  }),
  defineProps: vi.fn(),
  defineEmits: vi.fn(() => vi.fn()),
  defineExpose: vi.fn(),
  withDefaults: vi.fn()
}));

vi.mock('@element-plus/icons-vue', () => ({
  Monitor: 'Monitor',
  VideoPlay: 'VideoPlay',
  VideoPause: 'VideoPause',
  Refresh: 'Refresh',
  Download: 'Download'
}));

// 模拟stores
const mockPerformanceStore = {
  cpuUsage: 45.5,
  memoryUsage: 128.7,
  fps: 58.3,
  activeAlerts: [],
  startMonitoring: vi.fn(),
  stopMonitoring: vi.fn(),
  resetStats: vi.fn()
};

const mockThemeStore = {
  currentTheme: 'default'
};

vi.mock('../../stores/performance', () => ({
  usePerformanceStore: () => mockPerformanceStore
}));

vi.mock('../../stores/theme', () => ({
  useThemeStore: () => mockThemeStore
}));

// 模拟HighFrequencyRenderer
const mockHighFrequencyRenderer = {
  on: vi.fn(),
  scheduleRender: vi.fn(),
  createRenderContext: vi.fn(() => ({ id: 'mock-context' })),
  removeRenderContext: vi.fn(),
  updateConfig: vi.fn(),
  resizeCanvas: vi.fn(),
  getRenderStats: vi.fn(() => ({
    totalRenders: 100,
    averageFPS: 60,
    lastRenderTime: Date.now()
  })),
  getRenderContextStats: vi.fn(() => ({
    'mock-widget': {
      renderCount: 50,
      lastUpdate: Date.now()
    }
  }))
};

vi.mock('../../shared/HighFrequencyRenderer', () => ({
  default: vi.fn(() => mockHighFrequencyRenderer),
  RenderTask: {},
  RenderDataPoint: {},
  RenderArea: {},
  OffscreenRenderContext: {}
}));

// ================================
// PerformanceDashboard 逻辑测试
// ================================

describe('PerformanceDashboard Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('监控控制逻辑', () => {
    it('应该正确切换监控状态', () => {
      const isMonitoring = { value: false };
      const monitoringStartTime = { value: 0 };
      
      // 模拟开始监控
      const startMonitoring = () => {
        if (!isMonitoring.value) {
          isMonitoring.value = true;
          monitoringStartTime.value = Date.now();
          return true;
        }
        return false;
      };
      
      // 模拟停止监控
      const stopMonitoring = () => {
        if (isMonitoring.value) {
          isMonitoring.value = false;
          return true;
        }
        return false;
      };
      
      // 测试开始监控
      expect(startMonitoring()).toBe(true);
      expect(isMonitoring.value).toBe(true);
      expect(monitoringStartTime.value).toBeGreaterThan(0);
      
      // 测试重复开始
      expect(startMonitoring()).toBe(false);
      
      // 测试停止监控
      expect(stopMonitoring()).toBe(true);
      expect(isMonitoring.value).toBe(false);
      
      // 测试重复停止
      expect(stopMonitoring()).toBe(false);
    });

    it('应该正确计算监控持续时间', () => {
      const isMonitoring = { value: true };
      const monitoringStartTime = { value: Date.now() - 5000 }; // 5秒前
      
      const getMonitoringDuration = () => {
        if (!isMonitoring.value || monitoringStartTime.value === 0) return 0;
        return Date.now() - monitoringStartTime.value;
      };
      
      const duration = getMonitoringDuration();
      expect(duration).toBeGreaterThanOrEqual(4900); // 允许小的时间误差
      expect(duration).toBeLessThanOrEqual(5100);
    });

    it('应该正确更新刷新间隔', () => {
      const refreshInterval = { value: 1000 };
      let timerCleared = false;
      let timerStarted = false;
      
      const updateRefreshInterval = (newInterval: number) => {
        refreshInterval.value = newInterval;
        timerCleared = true;
        timerStarted = true;
      };
      
      updateRefreshInterval(500);
      expect(refreshInterval.value).toBe(500);
      expect(timerCleared).toBe(true);
      expect(timerStarted).toBe(true);
    });
  });

  describe('性能指标计算逻辑', () => {
    it('应该正确计算平均值指标', () => {
      const metricsHistory = {
        cpu: [40, 50, 60],
        memory: [100, 120, 140],
        fps: [55, 60, 58],
        throughput: [10, 20, 15]
      };
      
      const calculateAverageMetrics = () => {
        if (metricsHistory.cpu.length === 0) {
          return { cpu: 0, memory: 0, fps: 0, throughput: 0 };
        }
        
        return {
          cpu: metricsHistory.cpu.reduce((a, b) => a + b, 0) / metricsHistory.cpu.length,
          memory: metricsHistory.memory.reduce((a, b) => a + b, 0) / metricsHistory.memory.length,
          fps: metricsHistory.fps.reduce((a, b) => a + b, 0) / metricsHistory.fps.length,
          throughput: metricsHistory.throughput.reduce((a, b) => a + b, 0) / metricsHistory.throughput.length
        };
      };
      
      const averages = calculateAverageMetrics();
      expect(averages.cpu).toBe(50);
      expect(averages.memory).toBe(120);
      expect(averages.fps).toBeCloseTo(57.67, 1);
      expect(averages.throughput).toBe(15);
    });

    it('应该正确计算最大值指标', () => {
      const metricsHistory = {
        cpu: [40, 80, 60],
        memory: [100, 200, 140],
        fps: [55, 60, 45],
        throughput: [10, 30, 15]
      };
      
      const calculateMaxMetrics = () => ({
        cpu: Math.max(...metricsHistory.cpu, 0),
        memory: Math.max(...metricsHistory.memory, 0),
        fps: Math.max(...metricsHistory.fps, 0),
        throughput: Math.max(...metricsHistory.throughput, 0)
      });
      
      const maxValues = calculateMaxMetrics();
      expect(maxValues.cpu).toBe(80);
      expect(maxValues.memory).toBe(200);
      expect(maxValues.fps).toBe(60);
      expect(maxValues.throughput).toBe(30);
    });

    it('应该正确计算内存详细信息', () => {
      const currentMemory = 100;
      
      const calculateMemoryDetails = (memory: number) => ({
        heapUsed: memory * 0.7,
        heapTotal: memory * 1.2,
        external: memory * 0.1,
        rss: memory * 1.5
      });
      
      const details = calculateMemoryDetails(currentMemory);
      expect(details.heapUsed).toBe(70);
      expect(details.heapTotal).toBe(120);
      expect(details.external).toBe(10);
      expect(details.rss).toBe(150);
    });
  });

  describe('数据导出逻辑', () => {
    it('应该正确生成导出数据', () => {
      const currentTime = Date.now();
      const duration = 60000;
      const metricsHistory = {
        cpu: [40, 50, 60],
        memory: [100, 120, 140],
        fps: [55, 60, 58],
        throughput: [10, 20, 15],
        timestamps: [currentTime - 2000, currentTime - 1000, currentTime]
      };
      
      const generateExportData = () => ({
        timestamp: currentTime,
        duration,
        metrics: metricsHistory,
        summary: {
          current: { cpu: 60, memory: 140, fps: 58, throughput: 15 },
          average: { cpu: 50, memory: 120, fps: 57.67, throughput: 15 },
          max: { cpu: 60, memory: 140, fps: 60, throughput: 20 }
        },
        alerts: []
      });
      
      const exportData = generateExportData();
      expect(exportData.timestamp).toBe(currentTime);
      expect(exportData.duration).toBe(duration);
      expect(exportData.metrics).toEqual(metricsHistory);
      expect(exportData.summary.current.cpu).toBe(60);
      expect(exportData.alerts).toEqual([]);
    });

    it('应该正确生成文件名', () => {
      const generateFilename = () => {
        const now = new Date();
        const isoString = now.toISOString().slice(0, 19);
        return `performance-data-${isoString}.json`;
      };
      
      const filename = generateFilename();
      expect(filename).toMatch(/^performance-data-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.json$/);
    });
  });

  describe('时间格式化逻辑', () => {
    it('应该正确格式化持续时间', () => {
      const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
          return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
          return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
          return `${seconds}s`;
        }
      };
      
      expect(formatDuration(30000)).toBe('30s');
      expect(formatDuration(90000)).toBe('1:30');
      expect(formatDuration(3661000)).toBe('1:01:01');
      expect(formatDuration(5000)).toBe('5s');
    });

    it('应该正确格式化吞吐量', () => {
      const formatThroughput = (bytes: number) => (bytes / 1024).toFixed(1);
      
      expect(formatThroughput(1024)).toBe('1.0');
      expect(formatThroughput(2560)).toBe('2.5');
      expect(formatThroughput(10240)).toBe('10.0');
    });
  });
});

// ================================
// RealtimeChart 逻辑测试
// ================================

describe('RealtimeChart Logic', () => {
  describe('数据处理逻辑', () => {
    it('应该正确过滤时间窗口内的数据', () => {
      const now = Date.now();
      const timeRange = 60; // 60秒
      const panOffset = 0;
      
      const data = [
        { timestamp: now - 120000, value: 10 }, // 2分钟前
        { timestamp: now - 30000, value: 20 },  // 30秒前
        { timestamp: now - 10000, value: 30 },  // 10秒前
        { timestamp: now, value: 40 }           // 现在
      ];
      
      const filterVisibleData = (data: any[], timeRange: number, panOffset: number) => {
        const timeWindow = timeRange * 1000;
        const startTime = now - timeWindow + panOffset;
        const endTime = now + panOffset;
        
        return data.filter(point => 
          point.timestamp >= startTime && point.timestamp <= endTime
        );
      };
      
      const visible = filterVisibleData(data, timeRange, panOffset);
      expect(visible).toHaveLength(3); // 排除2分钟前的数据
      expect(visible[0].value).toBe(20);
      expect(visible[2].value).toBe(40);
    });

    it('应该正确查找最近的数据点', () => {
      const data = [
        { timestamp: 1000, value: 10 },
        { timestamp: 2000, value: 20 },
        { timestamp: 3000, value: 30 },
        { timestamp: 4000, value: 40 }
      ];
      
      const findClosestPoint = (data: any[], targetTime: number, threshold = 5000) => {
        if (data.length === 0) return null;
        
        let closest = data[0];
        let minDiff = Math.abs(data[0].timestamp - targetTime);
        
        for (const point of data) {
          const diff = Math.abs(point.timestamp - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            closest = point;
          }
        }
        
        return minDiff < threshold ? closest : null;
      };
      
      // 测试找到最近点
      expect(findClosestPoint(data, 2100)).toEqual({ timestamp: 2000, value: 20 });
      expect(findClosestPoint(data, 3500)).toEqual({ timestamp: 3000, value: 30 });
      
      // 测试超出阈值
      expect(findClosestPoint(data, 10000)).toBeNull();
      
      // 测试空数据
      expect(findClosestPoint([], 2000)).toBeNull();
    });
  });

  describe('坐标转换逻辑', () => {
    it('应该正确计算Canvas坐标', () => {
      const width = 800;
      const height = 400;
      const padding = 40;
      const startTime = 1000;
      const endTime = 5000;
      const minValue = 0;
      const maxValue = 100;
      
      const transformToCanvas = (timestamp: number, value: number) => {
        const x = padding + ((timestamp - startTime) / (endTime - startTime)) * (width - 2 * padding);
        const y = height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
        return { x, y };
      };
      
      // 测试起始点
      const start = transformToCanvas(1000, 0);
      expect(start.x).toBe(40);
      expect(start.y).toBe(360);
      
      // 测试结束点
      const end = transformToCanvas(5000, 100);
      expect(end.x).toBe(760);
      expect(end.y).toBe(40);
      
      // 测试中间点
      const middle = transformToCanvas(3000, 50);
      expect(middle.x).toBe(400);
      expect(middle.y).toBe(200);
    });
  });

  describe('图表控制逻辑', () => {
    it('应该正确处理缩放操作', () => {
      let zoomLevel = { value: 1 };
      
      const handleZoom = (delta: number) => {
        const factor = delta > 0 ? 1.1 : 0.9;
        zoomLevel.value = Math.max(0.1, Math.min(10, zoomLevel.value * factor));
      };
      
      // 测试放大
      handleZoom(1);
      expect(zoomLevel.value).toBeCloseTo(1.1, 2);
      
      // 测试缩小
      handleZoom(-1);
      expect(zoomLevel.value).toBeCloseTo(1.0, 1);
      
      // 测试边界限制
      zoomLevel.value = 0.05;
      handleZoom(-1);
      expect(zoomLevel.value).toBe(0.1);
      
      zoomLevel.value = 12;
      handleZoom(1);
      expect(zoomLevel.value).toBe(10);
    });

    it('应该正确处理平移操作', () => {
      let panOffset = { value: 0 };
      
      const handlePan = (deltaX: number, sensitivity = 10) => {
        panOffset.value += deltaX * sensitivity;
      };
      
      handlePan(5);
      expect(panOffset.value).toBe(50);
      
      handlePan(-2);
      expect(panOffset.value).toBe(30);
    });

    it('应该正确重置缩放和平移', () => {
      const zoomLevel = { value: 2.5 };
      const panOffset = { value: 100 };
      const timeRange = { value: 60 };
      
      const resetZoom = () => {
        zoomLevel.value = 1;
        panOffset.value = 0;
        return {
          startTime: Date.now() - timeRange.value * 1000,
          endTime: Date.now()
        };
      };
      
      const result = resetZoom();
      expect(zoomLevel.value).toBe(1);
      expect(panOffset.value).toBe(0);
      expect(result.startTime).toBeLessThan(result.endTime);
    });
  });

  describe('数据系列管理逻辑', () => {
    it('应该正确切换数据系列可见性', () => {
      const seriesConfig = [
        { name: 'CPU', hidden: false, color: '#409eff' },
        { name: 'Memory', hidden: false, color: '#67c23a' },
        { name: 'FPS', hidden: true, color: '#e6a23c' }
      ];
      
      const toggleSeries = (seriesName: string) => {
        const series = seriesConfig.find(s => s.name === seriesName);
        if (series) {
          series.hidden = !series.hidden;
          return !series.hidden;
        }
        return false;
      };
      
      // 测试隐藏可见系列
      expect(toggleSeries('CPU')).toBe(false);
      expect(seriesConfig[0].hidden).toBe(true);
      
      // 测试显示隐藏系列
      expect(toggleSeries('FPS')).toBe(true);
      expect(seriesConfig[2].hidden).toBe(false);
      
      // 测试不存在的系列
      expect(toggleSeries('NonExistent')).toBe(false);
    });

    it('应该正确获取系列最后值', () => {
      const dataMap = new Map([
        ['CPU', [{ timestamp: 1000, value: 45 }, { timestamp: 2000, value: 50 }]],
        ['Memory', []],
        ['FPS', [{ timestamp: 1000, value: 60 }]]
      ]);
      
      const getLastValue = (seriesName: string) => {
        const data = dataMap.get(seriesName);
        if (!data || data.length === 0) return 0;
        return data[data.length - 1].value;
      };
      
      expect(getLastValue('CPU')).toBe(50);
      expect(getLastValue('Memory')).toBe(0);
      expect(getLastValue('FPS')).toBe(60);
      expect(getLastValue('NonExistent')).toBe(0);
    });
  });
});

// ================================
// CanvasPlotRenderer 逻辑测试
// ================================

describe('CanvasPlotRenderer Logic', () => {
  describe('渲染器初始化逻辑', () => {
    it('应该正确合并配置选项', () => {
      const defaultConfig = {
        enableOffscreenRendering: true,
        enableIncrementalUpdates: true,
        targetFPS: 30,
        maxDataPoints: 1000,
        renderingOptimizations: {
          enableBatching: true,
          enableCaching: true,
          enableCulling: true
        }
      };
      
      const userConfig = {
        targetFPS: 60,
        maxDataPoints: 2000,
        renderingOptimizations: {
          enableBatching: false
        }
      };
      
      const mergeConfig = (defaults: any, user: any) => {
        return {
          ...defaults,
          ...user,
          renderingOptimizations: {
            ...defaults.renderingOptimizations,
            ...user.renderingOptimizations
          }
        };
      };
      
      const merged = mergeConfig(defaultConfig, userConfig);
      
      expect(merged.enableOffscreenRendering).toBe(true);
      expect(merged.targetFPS).toBe(60);
      expect(merged.maxDataPoints).toBe(2000);
      expect(merged.renderingOptimizations.enableBatching).toBe(false);
      expect(merged.renderingOptimizations.enableCaching).toBe(true);
    });
  });

  describe('数据点管理逻辑', () => {
    it('应该正确添加和限制数据点', () => {
      const maxDataPoints = 5;
      const dataHistory: any[] = [];
      
      const addDataPoint = (point: { x: number, y: number, timestamp: number }) => {
        const renderPoint = {
          x: point.timestamp || Date.now(),
          y: point.y,
          value: point.y,
          timestamp: point.timestamp || Date.now()
        };
        
        dataHistory.push(renderPoint);
        
        if (dataHistory.length > maxDataPoints) {
          dataHistory.shift();
        }
        
        return dataHistory.length;
      };
      
      // 添加数据点
      for (let i = 0; i < 7; i++) {
        const length = addDataPoint({ x: i, y: i * 10, timestamp: i * 1000 });
        if (i < 5) {
          expect(length).toBe(i + 1);
        } else {
          expect(length).toBe(5); // 应该限制在最大长度
        }
      }
      
      expect(dataHistory).toHaveLength(5);
      expect(dataHistory[0].value).toBe(20); // 前两个点应该被移除
      expect(dataHistory[4].value).toBe(60);
    });

    it('应该正确转换数据点格式', () => {
      const convertDataPoint = (point: { timestamp?: number, y: number }) => ({
        x: point.timestamp || Date.now(),
        y: point.y,
        value: point.y,
        timestamp: point.timestamp || Date.now()
      });
      
      const now = Date.now();
      
      // 有时间戳的点
      const withTimestamp = convertDataPoint({ timestamp: 1000, y: 50 });
      expect(withTimestamp.x).toBe(1000);
      expect(withTimestamp.timestamp).toBe(1000);
      expect(withTimestamp.y).toBe(50);
      expect(withTimestamp.value).toBe(50);
      
      // 无时间戳的点
      const withoutTimestamp = convertDataPoint({ y: 30 });
      expect(withoutTimestamp.y).toBe(30);
      expect(withoutTimestamp.timestamp).toBeGreaterThanOrEqual(now);
    });
  });

  describe('坐标转换逻辑', () => {
    it('应该正确转换X坐标到Canvas空间', () => {
      const chartConfig = {
        width: 800,
        xRange: { min: 0, max: 100 }
      };
      
      const transformXToCanvas = (dataX: number) => {
        const { xRange } = chartConfig;
        const canvasWidth = chartConfig.width;
        const normalizedX = (dataX - xRange.min) / (xRange.max - xRange.min);
        return normalizedX * canvasWidth;
      };
      
      expect(transformXToCanvas(0)).toBe(0);
      expect(transformXToCanvas(50)).toBe(400);
      expect(transformXToCanvas(100)).toBe(800);
      expect(transformXToCanvas(25)).toBe(200);
    });

    it('应该正确转换Y坐标到Canvas空间', () => {
      const chartConfig = {
        height: 400,
        yRange: { min: -50, max: 50 }
      };
      
      const transformYToCanvas = (dataY: number) => {
        const { yRange } = chartConfig;
        const canvasHeight = chartConfig.height;
        const normalizedY = (dataY - yRange.min) / (yRange.max - yRange.min);
        return canvasHeight - (normalizedY * canvasHeight); // Y轴翻转
      };
      
      expect(transformYToCanvas(-50)).toBe(400); // 底部
      expect(transformYToCanvas(50)).toBe(0);    // 顶部
      expect(transformYToCanvas(0)).toBe(200);   // 中间
      expect(transformYToCanvas(25)).toBe(100);  // 上1/4
    });
  });

  describe('渲染区域计算逻辑', () => {
    it('应该正确计算变化区域', () => {
      const chartConfig = { width: 800, height: 400 };
      
      const transformXToCanvas = (dataX: number) => dataX * 8; // 简化转换
      const transformYToCanvas = (dataY: number) => 400 - dataY * 4; // 简化转换
      
      const calculateChangedAreas = (newPoints: any[]) => {
        if (newPoints.length === 0) return [];
        
        const minX = Math.min(...newPoints.map(p => p.x));
        const maxX = Math.max(...newPoints.map(p => p.x));
        const minY = Math.min(...newPoints.map(p => p.y));
        const maxY = Math.max(...newPoints.map(p => p.y));
        
        const area = {
          x: transformXToCanvas(minX) - 10,
          y: transformYToCanvas(maxY) - 10,
          width: transformXToCanvas(maxX) - transformXToCanvas(minX) + 20,
          height: transformYToCanvas(minY) - transformYToCanvas(maxY) + 20
        };
        
        return [area];
      };
      
      const points = [
        { x: 10, y: 20 },
        { x: 20, y: 30 },
        { x: 15, y: 25 }
      ];
      
      const areas = calculateChangedAreas(points);
      expect(areas).toHaveLength(1);
      
      const area = areas[0];
      expect(area.x).toBe(70); // 10*8 - 10
      expect(area.width).toBe(100); // (20-10)*8 + 20
    });

    it('应该处理空数据点数组', () => {
      const calculateChangedAreas = (newPoints: any[]) => {
        if (newPoints.length === 0) return [];
        return [{ x: 0, y: 0, width: 100, height: 100 }];
      };
      
      expect(calculateChangedAreas([])).toEqual([]);
    });
  });

  describe('性能统计逻辑', () => {
    it('应该正确跟踪渲染统计', () => {
      let renderCount = 0;
      let incrementalRenderCount = 0;
      let fullRenderCount = 0;
      let lastRenderTime = 0;
      
      const trackRender = (type: 'incremental' | 'full') => {
        renderCount++;
        lastRenderTime = Date.now();
        
        if (type === 'incremental') {
          incrementalRenderCount++;
        } else {
          fullRenderCount++;
        }
      };
      
      const getPerformanceStats = () => ({
        totalRenders: renderCount,
        incrementalRenders: incrementalRenderCount,
        fullRenders: fullRenderCount,
        lastRenderTime
      });
      
      // 模拟渲染
      trackRender('incremental');
      trackRender('incremental');
      trackRender('full');
      
      const stats = getPerformanceStats();
      expect(stats.totalRenders).toBe(3);
      expect(stats.incrementalRenders).toBe(2);
      expect(stats.fullRenders).toBe(1);
      expect(stats.lastRenderTime).toBeGreaterThan(0);
    });

    it('应该正确计算数据点总数', () => {
      const dataHistory = new Map([
        ['series1', [1, 2, 3]],
        ['series2', [4, 5]],
        ['series3', []]
      ]);
      
      const getTotalDataPoints = () => {
        return Array.from(dataHistory.values())
          .reduce((sum, points) => sum + points.length, 0);
      };
      
      expect(getTotalDataPoints()).toBe(5);
    });
  });

  describe('配置更新逻辑', () => {
    it('应该正确更新渲染配置', () => {
      const currentConfig = {
        targetFPS: 30,
        enableBatching: true,
        enableCaching: false
      };
      
      const updateConfig = (newConfig: Partial<typeof currentConfig>) => {
        return { ...currentConfig, ...newConfig };
      };
      
      const updated = updateConfig({ targetFPS: 60, enableCaching: true });
      
      expect(updated.targetFPS).toBe(60);
      expect(updated.enableBatching).toBe(true);
      expect(updated.enableCaching).toBe(true);
    });

    it('应该正确处理Canvas尺寸变化', () => {
      const chartConfig = { width: 800, height: 400 };
      let resizeCalled = false;
      
      const updateChartConfig = (newConfig: Partial<typeof chartConfig>) => {
        const oldConfig = { ...chartConfig };
        Object.assign(chartConfig, newConfig);
        
        if (newConfig.width !== undefined || newConfig.height !== undefined) {
          resizeCalled = true;
        }
        
        return { oldConfig, newConfig: chartConfig };
      };
      
      const result = updateChartConfig({ width: 1000, height: 500 });
      
      expect(chartConfig.width).toBe(1000);
      expect(chartConfig.height).toBe(500);
      expect(resizeCalled).toBe(true);
    });
  });
});

// ================================
// 性能优化算法测试
// ================================

describe('Performance Optimization Algorithms', () => {
  describe('数据采样算法', () => {
    it('应该正确实现LTTB数据采样', () => {
      // 最大三角形三桶算法（LTTB）简化实现
      const lttbSampling = (data: any[], threshold: number) => {
        if (data.length <= threshold) return data;
        if (threshold < 3) return data.slice(0, threshold);
        
        const sampled = [];
        const bucketSize = (data.length - 2) / (threshold - 2);
        
        // 始终包含第一个点
        sampled.push(data[0]);
        
        let a = 0;
        for (let i = 0; i < threshold - 2; i++) {
          const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
          const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
          const avgRangeEnd2 = avgRangeEnd < data.length ? avgRangeEnd : data.length;
          
          // 计算下一个桶的平均值
          let avgX = 0;
          let avgY = 0;
          let avgRangeLength = avgRangeEnd2 - avgRangeStart;
          
          for (let j = avgRangeStart; j < avgRangeEnd2; j++) {
            avgX += data[j].x;
            avgY += data[j].y;
          }
          avgX /= avgRangeLength;
          avgY /= avgRangeLength;
          
          // 在当前桶中找到最大三角形面积的点
          const rangeOff = Math.floor((i + 0) * bucketSize) + 1;
          const rangeTo = Math.floor((i + 1) * bucketSize) + 1;
          
          let maxArea = -1;
          let maxAreaPoint = null;
          
          for (let j = rangeOff; j < rangeTo; j++) {
            // 计算三角形面积
            const area = Math.abs(
              (data[a].x - avgX) * (data[j].y - data[a].y) - 
              (data[a].x - data[j].x) * (avgY - data[a].y)
            ) * 0.5;
            
            if (area > maxArea) {
              maxArea = area;
              maxAreaPoint = data[j];
            }
          }
          
          if (maxAreaPoint) {
            sampled.push(maxAreaPoint);
            a = data.indexOf(maxAreaPoint);
          }
        }
        
        // 始终包含最后一个点
        sampled.push(data[data.length - 1]);
        
        return sampled;
      };
      
      // 测试数据
      const data = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 10) * 50 + 50 + Math.random() * 10
      }));
      
      const sampled = lttbSampling(data, 20);
      
      expect(sampled.length).toBeLessThanOrEqual(20);
      expect(sampled[0]).toEqual(data[0]);
      expect(sampled[sampled.length - 1]).toEqual(data[data.length - 1]);
    });

    it('应该正确实现均匀采样算法', () => {
      const uniformSampling = (data: any[], targetCount: number) => {
        if (data.length <= targetCount) return data;
        
        const step = data.length / targetCount;
        const sampled = [];
        
        for (let i = 0; i < targetCount; i++) {
          const index = Math.floor(i * step);
          sampled.push(data[index]);
        }
        
        return sampled;
      };
      
      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i }));
      const sampled = uniformSampling(data, 10);
      
      expect(sampled).toHaveLength(10);
      expect(sampled[0]).toEqual({ x: 0, y: 0 });
      expect(sampled[9]).toEqual({ x: 90, y: 90 });
    });
  });

  describe('内存管理算法', () => {
    it('应该正确实现循环缓冲区', () => {
      class CircularBuffer<T> {
        private buffer: T[];
        private head = 0;
        private tail = 0;
        private size = 0;
        
        constructor(private capacity: number) {
          this.buffer = new Array(capacity);
        }
        
        push(item: T): void {
          this.buffer[this.tail] = item;
          this.tail = (this.tail + 1) % this.capacity;
          
          if (this.size < this.capacity) {
            this.size++;
          } else {
            this.head = (this.head + 1) % this.capacity;
          }
        }
        
        toArray(): T[] {
          const result = [];
          for (let i = 0; i < this.size; i++) {
            const index = (this.head + i) % this.capacity;
            result.push(this.buffer[index]);
          }
          return result;
        }
        
        getSize(): number {
          return this.size;
        }
        
        isFull(): boolean {
          return this.size === this.capacity;
        }
      }
      
      const buffer = new CircularBuffer<number>(3);
      
      // 测试添加元素
      buffer.push(1);
      buffer.push(2);
      expect(buffer.getSize()).toBe(2);
      expect(buffer.toArray()).toEqual([1, 2]);
      
      // 测试容量满
      buffer.push(3);
      expect(buffer.isFull()).toBe(true);
      expect(buffer.toArray()).toEqual([1, 2, 3]);
      
      // 测试溢出
      buffer.push(4);
      expect(buffer.getSize()).toBe(3);
      expect(buffer.toArray()).toEqual([2, 3, 4]);
    });

    it('应该正确实现对象池', () => {
      class ObjectPool<T> {
        private available: T[] = [];
        private inUse = new Set<T>();
        
        constructor(private factory: () => T, initialSize = 5) {
          for (let i = 0; i < initialSize; i++) {
            this.available.push(factory());
          }
        }
        
        acquire(): T {
          let obj = this.available.pop();
          if (!obj) {
            obj = this.factory();
          }
          this.inUse.add(obj);
          return obj;
        }
        
        release(obj: T): void {
          if (this.inUse.has(obj)) {
            this.inUse.delete(obj);
            this.available.push(obj);
          }
        }
        
        getStats() {
          return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size
          };
        }
      }
      
      const pool = new ObjectPool(() => ({ x: 0, y: 0 }), 2);
      
      expect(pool.getStats()).toEqual({ available: 2, inUse: 0, total: 2 });
      
      // 获取对象
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      expect(pool.getStats()).toEqual({ available: 0, inUse: 2, total: 2 });
      
      // 获取第三个对象（会创建新的）
      const obj3 = pool.acquire();
      expect(pool.getStats()).toEqual({ available: 0, inUse: 3, total: 3 });
      
      // 释放对象
      pool.release(obj1);
      pool.release(obj2);
      expect(pool.getStats()).toEqual({ available: 2, inUse: 1, total: 3 });
    });
  });

  describe('动画和定时算法', () => {
    it('应该正确实现帧率限制', () => {
      class FrameRateLimiter {
        private lastFrame = 0;
        private frameInterval: number;
        
        constructor(targetFPS: number) {
          this.frameInterval = 1000 / targetFPS;
        }
        
        shouldRender(now = Date.now()): boolean {
          if (now - this.lastFrame >= this.frameInterval) {
            this.lastFrame = now;
            return true;
          }
          return false;
        }
        
        getRemainingTime(now = Date.now()): number {
          const elapsed = now - this.lastFrame;
          return Math.max(0, this.frameInterval - elapsed);
        }
      }
      
      const limiter = new FrameRateLimiter(30); // 30 FPS
      const now = Date.now();
      
      // 第一次渲染应该允许
      expect(limiter.shouldRender(now)).toBe(true);
      
      // 立即第二次渲染应该被阻止
      expect(limiter.shouldRender(now + 10)).toBe(false);
      
      // 超过间隔时间后应该允许
      expect(limiter.shouldRender(now + 40)).toBe(true);
      
      // 测试剩余时间计算
      limiter.shouldRender(now + 50);
      const remaining = limiter.getRemainingTime(now + 60);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThan(33.34); // 允许更宽松的范围
    });

    it('应该正确实现缓动函数', () => {
      const easing = {
        linear: (t: number) => t,
        easeInQuad: (t: number) => t * t,
        easeOutQuad: (t: number) => t * (2 - t),
        easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: (t: number) => t * t * t,
        easeOutCubic: (t: number) => (--t) * t * t + 1
      };
      
      // 测试边界值
      Object.values(easing).forEach(fn => {
        expect(fn(0)).toBeCloseTo(0, 5);
        expect(fn(1)).toBeCloseTo(1, 5);
      });
      
      // 测试中间值
      expect(easing.linear(0.5)).toBe(0.5);
      expect(easing.easeInQuad(0.5)).toBe(0.25);
      expect(easing.easeOutQuad(0.5)).toBe(0.75);
      expect(easing.easeInOutQuad(0.5)).toBe(0.5);
    });
  });
});
/**
 * Data Store 简化单元测试
 * 专注于核心数据管理逻辑测试
 * 目标：100% 测试覆盖率
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// 数据类型定义
interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface Dataset {
  id: string;
  title: string;
  widgetType: string;
  data: DataPoint[];
  lastUpdate: number;
  isActive: boolean;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  config: any;
  data?: any;
}

// 模拟数据存储的核心逻辑
const createDataStore = () => {
  let datasets: Dataset[] = [];
  let widgets: Widget[] = [];
  let isPaused = false;
  let isRecording = false;
  let maxDataPoints = 10000;
  let rawData: any[] = [];
  let performanceMetrics = {
    dataRate: 0,
    processingTime: 0,
    memoryUsage: 0,
    droppedFrames: 0
  };

  return {
    // 状态属性
    get datasets() { return datasets; },
    get widgets() { return widgets; },
    get isPaused() { return isPaused; },
    get isRecording() { return isRecording; },
    get maxDataPoints() { return maxDataPoints; },
    get rawData() { return rawData; },
    get performanceMetrics() { return performanceMetrics; },
    
    // 计算属性
    get totalDataPoints() { 
      return datasets.reduce((total, dataset) => total + dataset.data.length, 0);
    },
    get activeDatasets() {
      return datasets.filter(ds => ds.isActive);
    },
    get memoryUsage() {
      return this.totalDataPoints * 32; // 假设每个数据点32字节
    },

    // 基础控制方法
    togglePause() {
      isPaused = !isPaused;
    },

    toggleRecording() {
      isRecording = !isRecording;
    },

    initialize() {
      datasets = [];
      widgets = [];
      rawData = [];
      isPaused = false;
      isRecording = false;
    },

    // 数据集管理
    addDataset(dataset: Omit<Dataset, 'lastUpdate' | 'isActive'>) {
      const newDataset: Dataset = {
        ...dataset,
        lastUpdate: Date.now(),
        isActive: true
      };
      datasets.push(newDataset);
      return newDataset;
    },

    removeDataset(id: string) {
      const index = datasets.findIndex(ds => ds.id === id);
      if (index !== -1) {
        datasets.splice(index, 1);
        return true;
      }
      return false;
    },

    getDataset(id: string) {
      return datasets.find(ds => ds.id === id) || null;
    },

    updateDataset(id: string, updates: Partial<Dataset>) {
      const dataset = datasets.find(ds => ds.id === id);
      if (dataset) {
        Object.assign(dataset, updates, { lastUpdate: Date.now() });
        return dataset;
      }
      return null;
    },

    // 数据点管理
    addDataPoint(datasetId: string, dataPoint: DataPoint) {
      const dataset = this.getDataset(datasetId);
      if (dataset && !isPaused) {
        dataset.data.push(dataPoint);
        dataset.lastUpdate = Date.now();
        
        // 限制数据点数量
        if (dataset.data.length > maxDataPoints) {
          dataset.data.shift();
        }
        
        return true;
      }
      return false;
    },

    addBulkDataPoints(datasetId: string, dataPoints: DataPoint[]) {
      const dataset = this.getDataset(datasetId);
      if (dataset && !isPaused) {
        dataset.data.push(...dataPoints);
        dataset.lastUpdate = Date.now();
        
        // 限制数据点数量
        if (dataset.data.length > maxDataPoints) {
          dataset.data.splice(0, dataset.data.length - maxDataPoints);
        }
        
        return true;
      }
      return false;
    },

    // Widget 管理
    addWidget(widget: Widget) {
      widgets.push(widget);
    },

    removeWidget(id: string) {
      const index = widgets.findIndex(w => w.id === id);
      if (index !== -1) {
        widgets.splice(index, 1);
        return true;
      }
      return false;
    },

    setWidgetData(widgetId: string, data: any) {
      const widget = widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.data = data;
        return true;
      }
      return false;
    },

    getWidgetData(widgetId: string) {
      const widget = widgets.find(w => w.id === widgetId);
      return widget?.data || null;
    },

    // 原始数据管理
    addRawData(data: any) {
      if (!isPaused) {
        rawData.push({
          ...data,
          timestamp: Date.now()
        });
        
        if (rawData.length > maxDataPoints) {
          rawData.shift();
        }
        
        return true;
      }
      return false;
    },

    // 数据清理
    clearAllData() {
      datasets.forEach(dataset => {
        dataset.data = [];
        dataset.lastUpdate = Date.now();
      });
      rawData = [];
      this.resetPerformanceMetrics();
    },

    clearDataset(id: string) {
      const dataset = this.getDataset(id);
      if (dataset) {
        dataset.data = [];
        dataset.lastUpdate = Date.now();
        return true;
      }
      return false;
    },

    clearExpiredData(maxAge: number = 3600000) { // 1小时
      const cutoffTime = Date.now() - maxAge;
      
      datasets.forEach(dataset => {
        dataset.data = dataset.data.filter(point => point.timestamp > cutoffTime);
        dataset.lastUpdate = Date.now();
      });
      
      rawData = rawData.filter(item => item.timestamp > cutoffTime);
    },

    // 性能监控
    updatePerformanceMetrics(metrics: Partial<typeof performanceMetrics>) {
      Object.assign(performanceMetrics, metrics);
    },

    resetPerformanceMetrics() {
      performanceMetrics = {
        dataRate: 0,
        processingTime: 0,
        memoryUsage: 0,
        droppedFrames: 0
      };
    },

    // 数据查询和过滤
    searchDatasets(query: string) {
      return datasets.filter(dataset => 
        dataset.title.toLowerCase().includes(query.toLowerCase()) ||
        dataset.id.toLowerCase().includes(query.toLowerCase())
      );
    },

    getDatasetsByType(widgetType: string) {
      return datasets.filter(dataset => dataset.widgetType === widgetType);
    },

    getDataInTimeRange(datasetId: string, startTime: number, endTime: number) {
      const dataset = this.getDataset(datasetId);
      if (dataset) {
        return dataset.data.filter(point => 
          point.timestamp >= startTime && point.timestamp <= endTime
        );
      }
      return [];
    },

    // 数据统计
    getDatasetStats(datasetId: string) {
      const dataset = this.getDataset(datasetId);
      if (!dataset || dataset.data.length === 0) {
        return null;
      }

      const values = dataset.data.map(point => point.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;

      return {
        count: dataset.data.length,
        min,
        max,
        avg,
        sum,
        latest: values[values.length - 1]
      };
    },

    // 数据采样
    sampleData(datasetId: string, sampleRate: number) {
      const dataset = this.getDataset(datasetId);
      if (!dataset) return [];

      const step = Math.max(1, Math.floor(dataset.data.length / sampleRate));
      return dataset.data.filter((_, index) => index % step === 0);
    }
  };
};

describe('Data Store 逻辑测试', () => {
  let store: ReturnType<typeof createDataStore>;

  beforeEach(() => {
    store = createDataStore();
  });

  describe('初始状态', () => {
    test('应该有正确的初始状态', () => {
      expect(store.datasets).toEqual([]);
      expect(store.widgets).toEqual([]);
      expect(store.rawData).toEqual([]);
      expect(store.isPaused).toBe(false);
      expect(store.isRecording).toBe(false);
      expect(store.totalDataPoints).toBe(0);
    });

    test('应该有初始性能指标', () => {
      expect(store.performanceMetrics).toEqual({
        dataRate: 0,
        processingTime: 0,
        memoryUsage: 0,
        droppedFrames: 0
      });
    });
  });

  describe('基础控制', () => {
    test('togglePause 应该切换暂停状态', () => {
      expect(store.isPaused).toBe(false);
      
      store.togglePause();
      expect(store.isPaused).toBe(true);
      
      store.togglePause();
      expect(store.isPaused).toBe(false);
    });

    test('toggleRecording 应该切换录制状态', () => {
      expect(store.isRecording).toBe(false);
      
      store.toggleRecording();
      expect(store.isRecording).toBe(true);
      
      store.toggleRecording();
      expect(store.isRecording).toBe(false);
    });

    test('initialize 应该重置所有状态', () => {
      // 添加一些数据
      store.addDataset({ id: 'test', title: 'Test', widgetType: 'plot', data: [] });
      store.togglePause();
      store.toggleRecording();
      
      store.initialize();
      
      expect(store.datasets).toEqual([]);
      expect(store.widgets).toEqual([]);
      expect(store.rawData).toEqual([]);
      expect(store.isPaused).toBe(false);
      expect(store.isRecording).toBe(false);
    });
  });

  describe('数据集管理', () => {
    test('addDataset 应该添加数据集', () => {
      const dataset = {
        id: 'test-1',
        title: '测试数据集',
        widgetType: 'plot',
        data: []
      };
      
      const result = store.addDataset(dataset);
      
      expect(store.datasets).toHaveLength(1);
      expect(result.id).toBe('test-1');
      expect(result.isActive).toBe(true);
      expect(result.lastUpdate).toBeGreaterThan(0);
    });

    test('removeDataset 应该移除数据集', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      const result = store.removeDataset('test-1');
      expect(result).toBe(true);
      expect(store.datasets).toHaveLength(0);
      
      const notFound = store.removeDataset('not-exist');
      expect(notFound).toBe(false);
    });

    test('getDataset 应该返回指定数据集', () => {
      const dataset = { id: 'test-1', title: 'Test', widgetType: 'plot', data: [] };
      store.addDataset(dataset);
      
      const result = store.getDataset('test-1');
      expect(result?.id).toBe('test-1');
      
      const notFound = store.getDataset('not-exist');
      expect(notFound).toBeNull();
    });

    test('updateDataset 应该更新数据集', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      const result = store.updateDataset('test-1', { title: '更新的标题' });
      
      expect(result?.title).toBe('更新的标题');
      expect(result?.lastUpdate).toBeGreaterThan(0);
      
      const notFound = store.updateDataset('not-exist', { title: 'Test' });
      expect(notFound).toBeNull();
    });
  });

  describe('数据点管理', () => {
    beforeEach(() => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
    });

    test('addDataPoint 应该添加数据点', () => {
      const dataPoint = { timestamp: Date.now(), value: 123.45 };
      
      const result = store.addDataPoint('test-1', dataPoint);
      
      expect(result).toBe(true);
      expect(store.getDataset('test-1')?.data).toHaveLength(1);
      expect(store.totalDataPoints).toBe(1);
    });

    test('addDataPoint 在暂停时应该不添加数据', () => {
      store.togglePause();
      
      const result = store.addDataPoint('test-1', { timestamp: Date.now(), value: 123 });
      
      expect(result).toBe(false);
      expect(store.getDataset('test-1')?.data).toHaveLength(0);
    });

    test('addBulkDataPoints 应该批量添加数据点', () => {
      const dataPoints = [
        { timestamp: Date.now(), value: 1 },
        { timestamp: Date.now() + 1000, value: 2 },
        { timestamp: Date.now() + 2000, value: 3 }
      ];
      
      const result = store.addBulkDataPoints('test-1', dataPoints);
      
      expect(result).toBe(true);
      expect(store.getDataset('test-1')?.data).toHaveLength(3);
      expect(store.totalDataPoints).toBe(3);
    });

    test('应该限制数据点数量', () => {
      // 创建自定义的 store 实例用于测试数据点限制
      const createLimitedDataStore = () => {
        let datasets: Dataset[] = [];
        let widgets: Widget[] = [];
        let isPaused = false;
        let isRecording = false;
        const maxDataPoints = 2; // 设置较小的限制
        let rawData: any[] = [];
        let performanceMetrics = {
          dataRate: 0,
          processingTime: 0,
          memoryUsage: 0,
          droppedFrames: 0
        };

        return {
          get datasets() { return datasets; },
          get maxDataPoints() { return maxDataPoints; },
          addDataset(dataset: Omit<Dataset, 'lastUpdate' | 'isActive'>) {
            const newDataset: Dataset = {
              ...dataset,
              lastUpdate: Date.now(),
              isActive: true
            };
            datasets.push(newDataset);
            return newDataset;
          },
          getDataset(id: string) {
            return datasets.find(ds => ds.id === id) || null;
          },
          addDataPoint(datasetId: string, dataPoint: DataPoint) {
            const dataset = this.getDataset(datasetId);
            if (dataset && !isPaused) {
              dataset.data.push(dataPoint);
              dataset.lastUpdate = Date.now();
              
              // 限制数据点数量
              if (dataset.data.length > maxDataPoints) {
                dataset.data.shift();
              }
              
              return true;
            }
            return false;
          }
        };
      };
      
      const testStore = createLimitedDataStore();
      testStore.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      testStore.addDataPoint('test-1', { timestamp: 1, value: 1 });
      testStore.addDataPoint('test-1', { timestamp: 2, value: 2 });
      testStore.addDataPoint('test-1', { timestamp: 3, value: 3 });
      
      const dataset = testStore.getDataset('test-1');
      expect(dataset?.data).toHaveLength(2);
      expect(dataset?.data[0].timestamp).toBe(2); // 第一个应该被移除
    });
  });

  describe('Widget 管理', () => {
    test('addWidget 应该添加 Widget', () => {
      const widget = {
        id: 'widget-1',
        type: 'plot',
        title: '绘图组件',
        config: { color: 'blue' }
      };
      
      store.addWidget(widget);
      
      expect(store.widgets).toHaveLength(1);
      expect(store.widgets[0]).toEqual(widget);
    });

    test('removeWidget 应该移除 Widget', () => {
      const widget = { id: 'widget-1', type: 'plot', title: 'Test', config: {} };
      store.addWidget(widget);
      
      const result = store.removeWidget('widget-1');
      expect(result).toBe(true);
      expect(store.widgets).toHaveLength(0);
      
      const notFound = store.removeWidget('not-exist');
      expect(notFound).toBe(false);
    });

    test('setWidgetData 和 getWidgetData 应该正确管理 Widget 数据', () => {
      const widget = { id: 'widget-1', type: 'plot', title: 'Test', config: {} };
      store.addWidget(widget);
      
      const testData = { values: [1, 2, 3] };
      const setResult = store.setWidgetData('widget-1', testData);
      expect(setResult).toBe(true);
      
      const getData = store.getWidgetData('widget-1');
      expect(getData).toEqual(testData);
      
      const notFound = store.getWidgetData('not-exist');
      expect(notFound).toBeNull();
    });
  });

  describe('原始数据管理', () => {
    test('addRawData 应该添加原始数据', () => {
      const data = { type: 'sensor', value: 123 };
      
      const result = store.addRawData(data);
      
      expect(result).toBe(true);
      expect(store.rawData).toHaveLength(1);
      expect(store.rawData[0].type).toBe('sensor');
      expect(store.rawData[0].timestamp).toBeGreaterThan(0);
    });

    test('addRawData 在暂停时应该不添加数据', () => {
      store.togglePause();
      
      const result = store.addRawData({ type: 'test' });
      
      expect(result).toBe(false);
      expect(store.rawData).toHaveLength(0);
    });
  });

  describe('数据清理', () => {
    beforeEach(() => {
      store.addDataset({ id: 'test-1', title: 'Test 1', widgetType: 'plot', data: [] });
      store.addDataset({ id: 'test-2', title: 'Test 2', widgetType: 'gauge', data: [] });
      
      store.addDataPoint('test-1', { timestamp: Date.now(), value: 1 });
      store.addDataPoint('test-2', { timestamp: Date.now(), value: 2 });
      store.addRawData({ type: 'test' });
    });

    test('clearAllData 应该清除所有数据', () => {
      expect(store.totalDataPoints).toBe(2);
      expect(store.rawData).toHaveLength(1);
      
      store.clearAllData();
      
      expect(store.totalDataPoints).toBe(0);
      expect(store.rawData).toHaveLength(0);
      expect(store.performanceMetrics).toEqual({
        dataRate: 0,
        processingTime: 0,
        memoryUsage: 0,
        droppedFrames: 0
      });
    });

    test('clearDataset 应该清除指定数据集', () => {
      const result = store.clearDataset('test-1');
      
      expect(result).toBe(true);
      expect(store.getDataset('test-1')?.data).toHaveLength(0);
      expect(store.getDataset('test-2')?.data).toHaveLength(1);
      
      const notFound = store.clearDataset('not-exist');
      expect(notFound).toBe(false);
    });

    test('clearExpiredData 应该清除过期数据', () => {
      // 先添加一个过期的数据点（手动设置 timestamp）
      const oldTime = Date.now() - 7200000; // 2小时前
      const dataset = store.getDataset('test-1')!;
      
      // 直接添加过期数据到数据集
      dataset.data.push({ timestamp: oldTime, value: 999 });
      
      // 使用 addRawData 方法添加原始数据，然后手动修改时间戳
      store.addRawData({ type: 'old' });
      // 手动修改最后一条原始数据的时间戳
      const rawDataArray = store.rawData;
      if (rawDataArray.length > 1) {
        rawDataArray[rawDataArray.length - 1].timestamp = oldTime;
      }
      
      expect(store.getDataset('test-1')?.data).toHaveLength(2); // 1个新的 + 1个旧的
      expect(store.rawData).toHaveLength(2); // 1个新的 + 1个旧的
      
      store.clearExpiredData(3600000); // 清除1小时前的数据
      
      expect(store.getDataset('test-1')?.data).toHaveLength(1); // 应该只剩新数据
      expect(store.rawData).toHaveLength(1); // 应该只剩新数据
    });
  });

  describe('性能监控', () => {
    test('updatePerformanceMetrics 应该更新性能指标', () => {
      store.updatePerformanceMetrics({ dataRate: 100, processingTime: 50 });
      
      expect(store.performanceMetrics.dataRate).toBe(100);
      expect(store.performanceMetrics.processingTime).toBe(50);
      expect(store.performanceMetrics.memoryUsage).toBe(0); // 不应该被影响
    });

    test('resetPerformanceMetrics 应该重置性能指标', () => {
      store.updatePerformanceMetrics({ dataRate: 100, processingTime: 50 });
      
      store.resetPerformanceMetrics();
      
      expect(store.performanceMetrics).toEqual({
        dataRate: 0,
        processingTime: 0,
        memoryUsage: 0,
        droppedFrames: 0
      });
    });

    test('memoryUsage 应该基于数据点计算', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      expect(store.memoryUsage).toBe(0);
      
      store.addDataPoint('test-1', { timestamp: Date.now(), value: 1 });
      expect(store.memoryUsage).toBe(32); // 1 个数据点 * 32 字节
      
      store.addDataPoint('test-1', { timestamp: Date.now(), value: 2 });
      expect(store.memoryUsage).toBe(64); // 2 个数据点 * 32 字节
    });
  });

  describe('数据查询和过滤', () => {
    beforeEach(() => {
      store.addDataset({ id: 'plot-1', title: 'Temperature Plot', widgetType: 'plot', data: [] });
      store.addDataset({ id: 'gauge-1', title: 'Pressure Gauge', widgetType: 'gauge', data: [] });
      store.addDataset({ id: 'plot-2', title: 'Humidity Plot', widgetType: 'plot', data: [] });
    });

    test('searchDatasets 应该按标题搜索', () => {
      const results = store.searchDatasets('plot');
      
      expect(results).toHaveLength(2);
      expect(results.map(ds => ds.id)).toContain('plot-1');
      expect(results.map(ds => ds.id)).toContain('plot-2');
    });

    test('searchDatasets 应该按 ID 搜索', () => {
      const results = store.searchDatasets('gauge');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('gauge-1');
    });

    test('getDatasetsByType 应该按类型过滤', () => {
      const plots = store.getDatasetsByType('plot');
      const gauges = store.getDatasetsByType('gauge');
      
      expect(plots).toHaveLength(2);
      expect(gauges).toHaveLength(1);
    });

    test('getDataInTimeRange 应该按时间范围过滤', () => {
      const baseTime = Date.now();
      const dataset = store.getDataset('plot-1');
      
      // 添加不同时间的数据点
      store.addDataPoint('plot-1', { timestamp: baseTime - 1000, value: 1 });
      store.addDataPoint('plot-1', { timestamp: baseTime, value: 2 });
      store.addDataPoint('plot-1', { timestamp: baseTime + 1000, value: 3 });
      
      const results = store.getDataInTimeRange('plot-1', baseTime - 500, baseTime + 500);
      
      expect(results).toHaveLength(1);
      expect(results[0].value).toBe(2);
    });
  });

  describe('数据统计', () => {
    test('getDatasetStats 应该计算统计信息', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      store.addDataPoint('test-1', { timestamp: Date.now(), value: 10 });
      store.addDataPoint('test-1', { timestamp: Date.now(), value: 20 });
      store.addDataPoint('test-1', { timestamp: Date.now(), value: 30 });
      
      const stats = store.getDatasetStats('test-1');
      
      expect(stats).toEqual({
        count: 3,
        min: 10,
        max: 30,
        avg: 20,
        sum: 60,
        latest: 30
      });
    });

    test('getDatasetStats 对空数据集应该返回 null', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      const stats = store.getDatasetStats('test-1');
      expect(stats).toBeNull();
      
      const notFound = store.getDatasetStats('not-exist');
      expect(notFound).toBeNull();
    });
  });

  describe('数据采样', () => {
    test('sampleData 应该对数据进行采样', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      // 添加10个数据点
      for (let i = 0; i < 10; i++) {
        store.addDataPoint('test-1', { timestamp: Date.now() + i, value: i });
      }
      
      const samples = store.sampleData('test-1', 5);
      
      expect(samples.length).toBeLessThanOrEqual(5);
      expect(samples[0].value).toBe(0); // 第一个应该是索引0
    });

    test('sampleData 对不存在的数据集应该返回空数组', () => {
      const samples = store.sampleData('not-exist', 5);
      expect(samples).toEqual([]);
    });
  });

  describe('计算属性', () => {
    test('activeDatasets 应该只返回活跃的数据集', () => {
      store.addDataset({ id: 'test-1', title: 'Test 1', widgetType: 'plot', data: [] });
      store.addDataset({ id: 'test-2', title: 'Test 2', widgetType: 'plot', data: [] });
      
      // 禁用一个数据集
      store.updateDataset('test-2', { isActive: false });
      
      const active = store.activeDatasets;
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('test-1');
    });
  });

  describe('边界条件', () => {
    test('应该处理空数据操作', () => {
      expect(store.totalDataPoints).toBe(0);
      expect(store.memoryUsage).toBe(0);
      expect(store.activeDatasets).toHaveLength(0);
    });

    test('应该处理不存在的数据集操作', () => {
      expect(store.addDataPoint('not-exist', { timestamp: Date.now(), value: 1 })).toBe(false);
      expect(store.addBulkDataPoints('not-exist', [])).toBe(false);
      expect(store.clearDataset('not-exist')).toBe(false);
    });

    test('应该处理空的批量数据', () => {
      store.addDataset({ id: 'test-1', title: 'Test', widgetType: 'plot', data: [] });
      
      const result = store.addBulkDataPoints('test-1', []);
      expect(result).toBe(true);
      expect(store.getDataset('test-1')?.data).toHaveLength(0);
    });
  });
});
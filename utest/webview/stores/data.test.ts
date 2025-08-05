/**
 * Data Store Tests
 * 数据状态管理存储测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createApp } from 'vue';
import { useDataStore } from '../../../src/webview/stores/data';

// Mock 依赖模块
vi.mock('../../../src/shared/MemoryManager', () => ({
  getMemoryManager: vi.fn().mockReturnValue({
    allocate: vi.fn(),
    deallocate: vi.fn(),
    getStats: vi.fn().mockReturnValue({ used: 0, available: 1000000 })
  })
}));

vi.mock('../../../src/shared/DataCache', () => ({
  DataCache: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn(),
    clear: vi.fn(),
    size: 0
  }))
}));

vi.mock('../../../src/shared/ObjectPoolManager', () => ({
  objectPoolManager: {
    get: vi.fn().mockReturnValue({}),
    release: vi.fn()
  }
}));

describe('Data Store', () => {
  beforeEach(() => {
    // 设置 Pinia 测试环境
    const app = createApp({});
    const pinia = createPinia();
    app.use(pinia);
    setActivePinia(pinia);
    
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useDataStore();
      
      expect(store.rawData).toEqual([]);
      expect(store.processedFrames).toEqual([]);
      expect(store.datasets).toEqual([]);
      expect(store.groups).toEqual([]);
      expect(store.widgetData).toEqual(new Map());
      expect(store.isProcessing).toBe(false);
      expect(store.totalFrames).toBe(0);
      expect(store.droppedFrames).toBe(0);
    });

    it('应该有默认的性能指标', () => {
      const store = useDataStore();
      
      expect(store.performanceMetrics.processingRate).toBe(0);
      expect(store.performanceMetrics.memoryUsage).toBe(0);
      expect(store.performanceMetrics.renderingFps).toBe(0);
      expect(store.performanceMetrics.dataLatency).toBe(0);
    });
  });

  describe('原始数据管理', () => {
    it('应该能够添加原始数据', () => {
      const store = useDataStore();
      const rawData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);

      store.addRawData(rawData);

      expect(store.rawData.length).toBe(1);
      expect(store.rawData[0].data).toEqual(rawData);
      expect(store.rawData[0].timestamp).toBeTypeOf('number');
    });

    it('应该能够批量添加原始数据', () => {
      const store = useDataStore();
      const batchData = [
        new Uint8Array([0x01, 0x02]),
        new Uint8Array([0x03, 0x04]),
        new Uint8Array([0x05, 0x06])
      ];

      store.addRawDataBatch(batchData);

      expect(store.rawData.length).toBe(3);
    });

    it('应该限制原始数据缓存大小', () => {
      const store = useDataStore();
      
      // 添加超过最大缓存数量的数据
      for (let i = 0; i < 1100; i++) {
        store.addRawData(new Uint8Array([i % 256]));
      }

      expect(store.rawData.length).toBeLessThanOrEqual(1000);
    });

    it('应该能够清除原始数据', () => {
      const store = useDataStore();
      
      store.addRawData(new Uint8Array([0x01, 0x02]));
      expect(store.rawData.length).toBe(1);

      store.clearRawData();
      expect(store.rawData.length).toBe(0);
    });
  });

  describe('处理后的帧管理', () => {
    it('应该能够添加处理后的帧', () => {
      const store = useDataStore();
      const frame = {
        id: 'frame-1',
        timestamp: Date.now(),
        groups: [],
        isValid: true,
        checksum: 0x1234
      };

      store.addProcessedFrame(frame);

      expect(store.processedFrames.length).toBe(1);
      expect(store.processedFrames[0]).toEqual(frame);
      expect(store.totalFrames).toBe(1);
    });

    it('应该能够处理无效帧', () => {
      const store = useDataStore();
      const invalidFrame = {
        id: 'frame-invalid',
        timestamp: Date.now(),
        groups: [],
        isValid: false,
        checksum: 0x0000
      };

      store.addProcessedFrame(invalidFrame);

      expect(store.droppedFrames).toBe(1);
      expect(store.processedFrames.length).toBe(0);
    });

    it('应该能够批量添加处理后的帧', () => {
      const store = useDataStore();
      const frames = [
        {
          id: 'frame-1',
          timestamp: Date.now(),
          groups: [],
          isValid: true,
          checksum: 0x1234
        },
        {
          id: 'frame-2',
          timestamp: Date.now() + 1,
          groups: [],
          isValid: true,
          checksum: 0x5678
        }
      ];

      store.addProcessedFramesBatch(frames);

      expect(store.processedFrames.length).toBe(2);
      expect(store.totalFrames).toBe(2);
    });
  });

  describe('数据集管理', () => {
    it('应该能够添加数据集', () => {
      const store = useDataStore();
      const dataset = {
        id: 'dataset-1',
        title: 'Temperature',
        unit: '°C',
        index: 0,
        widget: 'gauge',
        value: 25.5,
        timestamp: Date.now()
      };

      store.addDataset(dataset);

      expect(store.datasets.length).toBe(1);
      expect(store.datasets[0]).toEqual(dataset);
    });

    it('应该能够更新现有数据集', () => {
      const store = useDataStore();
      const dataset = {
        id: 'dataset-1',
        title: 'Temperature',
        unit: '°C',
        index: 0,
        widget: 'gauge',
        value: 25.5,
        timestamp: Date.now()
      };

      store.addDataset(dataset);

      const updatedDataset = {
        ...dataset,
        value: 30.0,
        timestamp: Date.now() + 1000
      };

      store.updateDataset('dataset-1', updatedDataset);

      expect(store.datasets[0].value).toBe(30.0);
    });

    it('应该能够移除数据集', () => {
      const store = useDataStore();
      const dataset = {
        id: 'dataset-1',
        title: 'Temperature',
        unit: '°C',
        index: 0,
        widget: 'gauge',
        value: 25.5,
        timestamp: Date.now()
      };

      store.addDataset(dataset);
      expect(store.datasets.length).toBe(1);

      store.removeDataset('dataset-1');
      expect(store.datasets.length).toBe(0);
    });
  });

  describe('组管理', () => {
    it('应该能够添加组', () => {
      const store = useDataStore();
      const group = {
        id: 'group-1',
        title: 'Sensors',
        datasets: []
      };

      store.addGroup(group);

      expect(store.groups.length).toBe(1);
      expect(store.groups[0]).toEqual(group);
    });

    it('应该能够更新组', () => {
      const store = useDataStore();
      const group = {
        id: 'group-1',
        title: 'Sensors',
        datasets: []
      };

      store.addGroup(group);

      const updatedGroup = {
        ...group,
        title: 'Environmental Sensors'
      };

      store.updateGroup('group-1', updatedGroup);

      expect(store.groups[0].title).toBe('Environmental Sensors');
    });
  });

  describe('Widget数据管理', () => {
    it('应该能够设置Widget数据', () => {
      const store = useDataStore();
      const widgetData = {
        id: 'widget-1',
        type: 'plot',
        title: 'Temperature Plot',
        datasets: [],
        dataPoints: [],
        lastUpdate: Date.now(),
        isActive: true
      };

      store.setWidgetData('widget-1', widgetData);

      expect(store.widgetData.get('widget-1')).toEqual(widgetData);
    });

    it('应该能够更新Widget数据', () => {
      const store = useDataStore();
      const widgetData = {
        id: 'widget-1',
        type: 'plot',
        title: 'Temperature Plot',
        datasets: [],
        dataPoints: [],
        lastUpdate: Date.now(),
        isActive: true
      };

      store.setWidgetData('widget-1', widgetData);

      const updates = {
        title: 'Updated Temperature Plot',
        lastUpdate: Date.now() + 1000
      };

      store.updateWidgetData('widget-1', updates);

      const updatedData = store.widgetData.get('widget-1');
      expect(updatedData?.title).toBe('Updated Temperature Plot');
    });

    it('应该能够移除Widget数据', () => {
      const store = useDataStore();
      const widgetData = {
        id: 'widget-1',
        type: 'plot',
        title: 'Temperature Plot',
        datasets: [],
        dataPoints: [],
        lastUpdate: Date.now(),
        isActive: true
      };

      store.setWidgetData('widget-1', widgetData);
      expect(store.widgetData.has('widget-1')).toBe(true);

      store.removeWidgetData('widget-1');
      expect(store.widgetData.has('widget-1')).toBe(false);
    });
  });

  describe('数据搜索和过滤', () => {
    beforeEach(() => {
      const store = useDataStore();
      
      // 添加测试数据
      const datasets = [
        {
          id: 'temp-1',
          title: 'Temperature Sensor 1',
          unit: '°C',
          index: 0,
          widget: 'gauge',
          value: 25.5,
          timestamp: Date.now()
        },
        {
          id: 'temp-2',
          title: 'Temperature Sensor 2',
          unit: '°C',
          index: 1,
          widget: 'gauge',
          value: 30.0,
          timestamp: Date.now()
        },
        {
          id: 'humid-1',
          title: 'Humidity Sensor',
          unit: '%',
          index: 2,
          widget: 'bar',
          value: 65.0,
          timestamp: Date.now()
        }
      ];

      datasets.forEach(dataset => store.addDataset(dataset));
    });

    it('应该能够按标题搜索数据集', () => {
      const store = useDataStore();
      
      const results = store.searchDatasets('Temperature');
      expect(results.length).toBe(2);
      expect(results.every(d => d.title.includes('Temperature'))).toBe(true);
    });

    it('应该能够按Widget类型过滤数据集', () => {
      const store = useDataStore();
      
      const gaugeDatasets = store.getDatasetsByWidget('gauge');
      expect(gaugeDatasets.length).toBe(2);
      expect(gaugeDatasets.every(d => d.widget === 'gauge')).toBe(true);
    });

    it('应该能够按时间范围过滤数据', () => {
      const store = useDataStore();
      const now = Date.now();
      const oneHourAgo = now - 3600000;

      const recentData = store.getDataInTimeRange(oneHourAgo, now);
      expect(recentData.length).toBe(3);
    });
  });

  describe('性能监控', () => {
    it('应该能够更新性能指标', () => {
      const store = useDataStore();
      
      const metrics = {
        processingRate: 100,
        memoryUsage: 50,
        renderingFps: 60,
        dataLatency: 5
      };

      store.updatePerformanceMetrics(metrics);

      expect(store.performanceMetrics).toEqual(metrics);
    });

    it('应该能够计算处理速率', () => {
      const store = useDataStore();
      
      // 模拟数据处理
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        store.addRawData(new Uint8Array([i % 256]));
      }
      const endTime = Date.now();

      const rate = store.calculateProcessingRate(startTime, endTime, 100);
      expect(rate).toBeGreaterThan(0);
    });
  });

  describe('数据清理', () => {
    it('应该能够清除所有数据', () => {
      const store = useDataStore();
      
      // 添加各种数据
      store.addRawData(new Uint8Array([0x01, 0x02]));
      store.addDataset({
        id: 'test',
        title: 'Test',
        unit: 'V',
        index: 0,
        widget: 'gauge',
        value: 1.0,
        timestamp: Date.now()
      });

      store.clearAllData();

      expect(store.rawData.length).toBe(0);
      expect(store.datasets.length).toBe(0);
      expect(store.processedFrames.length).toBe(0);
      expect(store.widgetData.size).toBe(0);
      expect(store.totalFrames).toBe(0);
      expect(store.droppedFrames).toBe(0);
    });

    it('应该能够清除过期数据', () => {
      const store = useDataStore();
      const now = Date.now();
      const oldTimestamp = now - 7200000; // 2小时前

      // 添加新旧数据
      store.addDataset({
        id: 'old',
        title: 'Old Data',
        unit: 'V',
        index: 0,
        widget: 'gauge',
        value: 1.0,
        timestamp: oldTimestamp
      });

      store.addDataset({
        id: 'new',
        title: 'New Data',
        unit: 'V',
        index: 1,
        widget: 'gauge',
        value: 2.0,
        timestamp: now
      });

      store.clearExpiredData(3600000); // 清除1小时前的数据

      expect(store.datasets.length).toBe(1);
      expect(store.datasets[0].id).toBe('new');
    });
  });

  describe('内存管理', () => {
    it('应该监控内存使用情况', () => {
      const store = useDataStore();
      
      const memoryUsage = store.getMemoryUsage();
      expect(memoryUsage).toBeTypeOf('object');
      expect(memoryUsage.used).toBeTypeOf('number');
      expect(memoryUsage.available).toBeTypeOf('number');
    });

    it('应该在内存不足时触发清理', () => {
      const store = useDataStore();
      
      // 模拟低内存情况
      const mockMemoryManager = {
        getStats: vi.fn().mockReturnValue({ used: 950000, available: 1000000 })
      };

      const cleanupSpy = vi.spyOn(store, 'triggerMemoryCleanup');
      store.checkMemoryUsage();

      // 如果内存使用率超过阈值，应该触发清理
      if (mockMemoryManager.getStats().used / 1000000 > 0.9) {
        expect(cleanupSpy).toHaveBeenCalled();
      }
    });
  });
});
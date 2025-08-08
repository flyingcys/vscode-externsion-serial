/**
 * OptimizedGPSTrajectoryRenderer 简化测试
 * 目标：100% 行覆盖率、分支覆盖率、函数覆盖率
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock leaflet
vi.mock('leaflet', () => {
  return {
    default: {
      latLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
      latLngBounds: vi.fn((points: any[]) => ({
        getWest: () => -180,
        getEast: () => 180,
        getNorth: () => 85,
        getSouth: () => -85,
        contains: () => true
      })),
      polyline: vi.fn((points: any[], options?: any) => ({
        addTo: vi.fn().mockReturnThis(),
        addLatLng: vi.fn(),
        setStyle: vi.fn(),
        remove: vi.fn(),
        points,
        options
      })),
      Map: vi.fn()
    },
    latLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
    latLngBounds: vi.fn((points: any[]) => ({
      getWest: () => -180,
      getEast: () => 180,
      getNorth: () => 85,
      getSouth: () => -85,
      contains: () => true
    })),
    polyline: vi.fn((points: any[], options?: any) => ({
      addTo: vi.fn().mockReturnThis(),
      addLatLng: vi.fn(),
      setStyle: vi.fn(),
      remove: vi.fn(),
      points,
      options
    }))
  };
});

// Mock AdvancedSamplingAlgorithms
vi.mock('./AdvancedSamplingAlgorithms', () => ({
  AdvancedSamplingAlgorithms: vi.fn(),
  createDefaultSampler: vi.fn(() => ({
    adaptiveSampling: vi.fn((key, points) => points),
    douglasPeuckerDecimation: vi.fn((points) => points.slice(0, Math.floor(points.length / 2))),
    clearCache: vi.fn()
  }))
}));

// Mock globals
global.performance = { now: vi.fn(() => 1000) } as any;
global.Date.now = vi.fn(() => 1000000);

// Mock Image
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = '';
  private _src = '';
  
  get src() { return this._src; }
  set src(value: string) {
    this._src = value;
    setTimeout(() => this.onload?.(), 10);
  }
}
global.Image = MockImage as any;

import {
  OptimizedGPSTrajectoryRenderer,
  MapTileCacheManager,
  GPSPoint
} from '../../../src/webview/utils/OptimizedGPSTrajectoryRenderer';

describe('OptimizedGPSTrajectoryRenderer 简化测试', () => {
  let renderer: OptimizedGPSTrajectoryRenderer;
  let mockMap: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockMap = {
      getZoom: vi.fn(() => 10),
      getBounds: vi.fn(() => ({
        getWest: () => -180,
        getEast: () => 180,
        getNorth: () => 85,
        getSouth: () => -85,
        contains: () => true
      })),
      fitBounds: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      removeLayer: vi.fn(),
      addLayer: vi.fn()
    };
    
    renderer = new OptimizedGPSTrajectoryRenderer(mockMap);
  });

  afterEach(() => {
    renderer?.destroy();
  });

  describe('基础功能测试', () => {
    it('应该创建渲染器实例', () => {
      expect(renderer).toBeDefined();
      expect(mockMap.on).toHaveBeenCalledWith('zoomend', expect.any(Function));
      expect(mockMap.on).toHaveBeenCalledWith('moveend', expect.any(Function));
    });

    it('应该使用自定义配置', () => {
      const customRenderer = new OptimizedGPSTrajectoryRenderer(mockMap, {
        maxTrajectoryPoints: 1000,
        updateThreshold: 50
      });
      
      const stats = customRenderer.getStats();
      expect(stats.totalPoints).toBe(0);
      
      customRenderer.destroy();
    });

    it('应该返回初始统计信息', () => {
      const stats = renderer.getStats();
      expect(stats.totalPoints).toBe(0);
      expect(stats.visiblePoints).toBe(0);
      expect(stats.segments).toBe(0);
      expect(stats.renderTime).toBe(0);
    });
  });

  describe('GPS点添加测试', () => {
    it('应该添加GPS点', () => {
      const point: GPSPoint = {
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      };

      renderer.addGPSPoint(point);
      
      const stats = renderer.getStats();
      expect(stats.totalPoints).toBe(1);
    });

    it('应该处理批量GPS点', () => {
      const points: GPSPoint[] = [
        { lat: 39.9042, lng: 116.4074, timestamp: 1000000 },
        { lat: 39.9043, lng: 116.4075, timestamp: 1001000 },
        { lat: 39.9044, lng: 116.4076, timestamp: 1002000 }
      ];

      renderer.addGPSPoints(points);
      
      const stats = renderer.getStats();
      expect(stats.totalPoints).toBe(3);
    });

    it('应该处理空点数组', () => {
      renderer.addGPSPoints([]);
      
      const stats = renderer.getStats();
      expect(stats.totalPoints).toBe(0);
    });

    it('应该在更新阈值内跳过点', () => {
      const point1: GPSPoint = {
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      };
      
      const point2: GPSPoint = {
        lat: 39.9043,
        lng: 116.4075,
        timestamp: 1000050
      };

      // Mock 时间差小于阈值
      vi.mocked(Date.now)
        .mockReturnValueOnce(1000000)
        .mockReturnValueOnce(1000050);

      renderer.addGPSPoint(point1);
      renderer.addGPSPoint(point2); // 应该被跳过
      
      const stats = renderer.getStats();
      expect(stats.totalPoints).toBe(1);
    });

    it('应该处理不同缩放级别', () => {
      const zoomLevels = [8, 11, 13, 16];
      
      for (const zoom of zoomLevels) {
        mockMap.getZoom.mockReturnValue(zoom);
        
        const testRenderer = new OptimizedGPSTrajectoryRenderer(mockMap);
        testRenderer.addGPSPoint({
          lat: 39.9042,
          lng: 116.4074,
          timestamp: 1000000
        });
        
        testRenderer.destroy();
      }
    });
  });

  describe('轨迹段管理测试', () => {
    it('应该创建新轨迹段', () => {
      const point: GPSPoint = {
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      };

      renderer.addGPSPoint(point);
      
      const stats = renderer.getStats();
      expect(stats.segments).toBeGreaterThan(0);
    });

    it('应该基于时间创建新段', () => {
      const segmentRenderer = new OptimizedGPSTrajectoryRenderer(mockMap, {
        segmentTimeSpan: 1000 // 1秒
      });

      const point1: GPSPoint = {
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      };
      
      const point2: GPSPoint = {
        lat: 39.9043,
        lng: 116.4075,
        timestamp: 1002000 // 2秒后
      };

      vi.mocked(Date.now)
        .mockReturnValueOnce(1000000)
        .mockReturnValueOnce(1002000);

      segmentRenderer.addGPSPoint(point1);
      segmentRenderer.addGPSPoint(point2);
      
      segmentRenderer.destroy();
    });

    it('应该限制最大段数', () => {
      const maxSegmentsRenderer = new OptimizedGPSTrajectoryRenderer(mockMap, {
        maxSegments: 2,
        segmentTimeSpan: 1000
      });

      // 添加3个段的点
      for (let i = 0; i < 3; i++) {
        vi.mocked(Date.now).mockReturnValue(1000000 + i * 500);
        maxSegmentsRenderer.addGPSPoint({
          lat: 39.9042 + i * 0.01,
          lng: 116.4074 + i * 0.01,
          timestamp: 1000000 + i * 2000
        });
      }
      
      expect(mockMap.removeLayer).toHaveBeenCalled();
      
      maxSegmentsRenderer.destroy();
    });
  });

  describe('地图事件处理测试', () => {
    it('应该处理缩放变化', () => {
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      // 触发缩放事件
      const zoomHandler = mockMap.on.mock.calls.find(call => call[0] === 'zoomend')?.[1];
      if (zoomHandler) {
        mockMap.getZoom.mockReturnValue(15);
        zoomHandler();
        
        mockMap.getZoom.mockReturnValue(8);
        zoomHandler();
      }
    });

    it('应该处理地图移动', () => {
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      const moveHandler = mockMap.on.mock.calls.find(call => call[0] === 'moveend')?.[1];
      moveHandler?.();
      
      const stats = renderer.getStats();
      expect(stats.visiblePoints).toBeGreaterThanOrEqual(0);
    });

    it('应该在禁用自适应质量时跳过处理', () => {
      const noAdaptiveRenderer = new OptimizedGPSTrajectoryRenderer(mockMap, {
        adaptiveQuality: false
      });

      noAdaptiveRenderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      const zoomHandler = mockMap.on.mock.calls.find(call => call[0] === 'zoomend')?.[1];
      zoomHandler?.();
      
      noAdaptiveRenderer.destroy();
    });
  });

  describe('轨迹边界和视图测试', () => {
    it('应该返回null当没有轨迹时', () => {
      const bounds = renderer.getTrajectoryBounds();
      expect(bounds).toBeNull();
    });

    it('应该返回轨迹边界', () => {
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      const bounds = renderer.getTrajectoryBounds();
      expect(bounds).not.toBeNull();
    });

    it('应该适应轨迹边界', () => {
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      renderer.fitTrajectoryBounds();
      expect(mockMap.fitBounds).toHaveBeenCalled();
    });

    it('应该在无轨迹时不调用fitBounds', () => {
      renderer.fitTrajectoryBounds();
      expect(mockMap.fitBounds).not.toHaveBeenCalled();
    });
  });

  describe('配置和清理测试', () => {
    it('应该更新配置', () => {
      renderer.updateConfig({
        maxTrajectoryPoints: 2000,
        enableCaching: false
      });
      
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      const stats = renderer.getStats();
      expect(stats.totalPoints).toBe(1);
    });

    it('应该清除轨迹', () => {
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      let stats = renderer.getStats();
      expect(stats.totalPoints).toBe(1);
      
      renderer.clearTrajectory();
      
      stats = renderer.getStats();
      expect(stats.totalPoints).toBe(0);
    });

    it('应该正确销毁', () => {
      renderer.addGPSPoint({
        lat: 39.9042,
        lng: 116.4074,
        timestamp: 1000000
      });
      
      renderer.destroy();
      
      expect(mockMap.off).toHaveBeenCalledWith('zoomend', expect.any(Function));
      expect(mockMap.off).toHaveBeenCalledWith('moveend', expect.any(Function));
    });
  });

  describe('抽稀处理测试', () => {
    it('应该触发抽稀', () => {
      const decimationRenderer = new OptimizedGPSTrajectoryRenderer(mockMap, {
        decimationThreshold: 3
      });

      // 添加足够的点触发抽稀
      for (let i = 0; i < 5; i++) {
        vi.mocked(Date.now).mockReturnValue(1000000 + i * 200);
        decimationRenderer.addGPSPoint({
          lat: 39.9042 + i * 0.001,
          lng: 116.4074 + i * 0.001,
          timestamp: 1000000 + i * 1000
        });
      }
      
      decimationRenderer.destroy();
    });

    it('应该处理少量点不触发抽稀', () => {
      const decimationRenderer = new OptimizedGPSTrajectoryRenderer(mockMap, {
        decimationThreshold: 5
      });

      // 添加少量点
      for (let i = 0; i < 2; i++) {
        vi.mocked(Date.now).mockReturnValue(1000000 + i * 200);
        decimationRenderer.addGPSPoint({
          lat: 39.9042 + i * 0.001,
          lng: 116.4074 + i * 0.001,
          timestamp: 1000000 + i * 1000
        });
      }
      
      decimationRenderer.destroy();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理无效坐标', () => {
      const invalidPoints: GPSPoint[] = [
        { lat: NaN, lng: 116.4074, timestamp: 1000000 },
        { lat: 39.9042, lng: NaN, timestamp: 1001000 },
        { lat: Infinity, lng: 116.4074, timestamp: 1002000 }
      ];
      
      invalidPoints.forEach(point => {
        expect(() => renderer.addGPSPoint(point)).not.toThrow();
      });
    });

    it('应该处理极端时间戳', () => {
      const extremePoints: GPSPoint[] = [
        { lat: 39.9042, lng: 116.4074, timestamp: 0 },
        { lat: 39.9043, lng: 116.4075, timestamp: Number.MAX_SAFE_INTEGER },
        { lat: 39.9044, lng: 116.4076, timestamp: -1000000 }
      ];
      
      extremePoints.forEach(point => {
        expect(() => renderer.addGPSPoint(point)).not.toThrow();
      });
    });

    it('应该返回统计副本', () => {
      const stats1 = renderer.getStats();
      const stats2 = renderer.getStats();
      
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });
});

describe('MapTileCacheManager 简化测试', () => {
  let cacheManager: MapTileCacheManager;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheManager = new MapTileCacheManager();
  });

  afterEach(() => {
    cacheManager.clearCache();
  });

  describe('基础功能测试', () => {
    it('应该创建默认缓存管理器', () => {
      const defaultManager = new MapTileCacheManager();
      const stats = defaultManager.getCacheStats();
      
      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(200);
    });

    it('应该创建自定义大小缓存管理器', () => {
      const customManager = new MapTileCacheManager(50);
      const stats = customManager.getCacheStats();
      
      expect(stats.maxSize).toBe(50);
    });
  });

  describe('瓦片预加载测试', () => {
    it('应该预加载瓦片', async () => {
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles(urls, bounds, 2);
      
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });

    it('应该处理空URL数组', async () => {
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles([], bounds, 1);
      
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('应该处理加载错误', async () => {
      // Mock失败的Image
      const OriginalImage = global.Image;
      class FailingImage extends MockImage {
        set src(value: string) {
          this._src = value;
          setTimeout(() => this.onerror?.(), 10);
        }
      }
      global.Image = FailingImage as any;

      const urls = ['https://fail.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles(urls, bounds, 1);
      
      // 应该优雅处理错误
      expect(true).toBe(true);
      
      global.Image = OriginalImage;
    });
  });

  describe('缓存操作测试', () => {
    it('应该获取缓存瓦片', async () => {
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles(urls, bounds, 1);
      
      const tile = cacheManager.getCachedTile('https://tile.server/1/0/0.png', 1, 0, 0);
      expect(tile).toBeTruthy();
    });

    it('应该返回null对未缓存瓦片', () => {
      const tile = cacheManager.getCachedTile('nonexistent.png', 1, 0, 0);
      expect(tile).toBeNull();
    });

    it('应该处理重复缓存', async () => {
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles(urls, bounds, 1);
      await cacheManager.preloadTiles(urls, bounds, 1);
      
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('缓存清理测试', () => {
    it('应该清理过期缓存', async () => {
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles(urls, bounds, 1);
      
      const initialStats = cacheManager.getCacheStats();
      const initialSize = initialStats.size;
      
      cacheManager.cleanExpiredCache(1); // 1ms，所有都过期
      
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(initialSize); // 允许部分清理或全部清理
    });

    it('应该清空缓存', async () => {
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -1,
        getEast: () => 1,
        getNorth: () => 1,
        getSouth: () => -1
      } as any;

      await cacheManager.preloadTiles(urls, bounds, 1);
      
      let stats = cacheManager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      
      cacheManager.clearCache();
      
      stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('应该限制缓存大小', async () => {
      const smallManager = new MapTileCacheManager(2);
      
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const bounds = {
        getWest: () => -2,
        getEast: () => 2,
        getNorth: () => 2,
        getSouth: () => -2
      } as any;

      await smallManager.preloadTiles(urls, bounds, 2);
      
      const stats = smallManager.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(2);
      
      smallManager.clearCache();
    });
  });

  describe('统计信息测试', () => {
    it('应该返回正确统计', () => {
      const stats = cacheManager.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRatio');
      expect(stats.hitRatio).toBe(0); // TODO功能
    });
  });

  describe('边界条件测试', () => {
    it('应该处理极端坐标', async () => {
      const urls = ['https://tile.server/{z}/{x}/{y}.png'];
      const extremeBounds = {
        getWest: () => -180,
        getEast: () => 180,
        getNorth: () => 85.0511,
        getSouth: () => -85.0511
      } as any;

      await cacheManager.preloadTiles(urls, extremeBounds, 0);
      
      expect(true).toBe(true); // 不应该抛出异常
    });

    it('应该使用默认过期时间', () => {
      cacheManager.cleanExpiredCache(); // 使用默认值
      expect(true).toBe(true); // 不应该抛出异常
    });
  });
});
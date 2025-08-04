/**
 * 优化的GPS轨迹渲染器
 * 基于Serial-Studio的GPS可视化优化，实现增量更新和高性能轨迹渲染
 * 
 * 主要优化点：
 * 1. 增量轨迹更新，避免完整重绘
 * 2. 地图瓦片缓存管理  
 * 3. 大量GPS点的抽稀显示
 * 4. 内存和性能优化
 */

import L from 'leaflet';
import { AdvancedSamplingAlgorithms, createDefaultSampler } from './AdvancedSamplingAlgorithms';

export interface GPSPoint {
  lat: number;
  lng: number;
  alt?: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface TrajectorySegment {
  points: L.LatLng[];
  polyline: L.Polyline;
  startTime: number;
  endTime: number;
  color: string;
}

export interface TileCache {
  url: string;
  image: HTMLImageElement;
  timestamp: number;
  zoom: number;
  x: number;
  y: number;
}

export interface GPSRenderingConfig {
  maxTrajectoryPoints: number;
  maxSegments: number;
  segmentTimeSpan: number; // 每个片段的时间跨度（毫秒）
  decimationThreshold: number; // 抽稀阈值（点数）
  updateThreshold: number; // 更新阈值（毫秒）
  enableCaching: boolean;
  cacheSize: number;
  adaptiveQuality: boolean;
}

export interface RenderingStats {
  totalPoints: number;
  visiblePoints: number;
  segments: number;
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
  decimationRatio: number;
}

/**
 * 优化的GPS轨迹渲染器类
 */
export class OptimizedGPSTrajectoryRenderer {
  private map: L.Map;
  private config: GPSRenderingConfig;
  private segments: TrajectorySegment[] = [];
  private currentSegment: TrajectorySegment | null = null;
  private sampler: AdvancedSamplingAlgorithms;
  private tileCache: Map<string, TileCache> = new Map();
  private lastUpdateTime = 0;
  private stats: RenderingStats;

  // 颜色渐变配置
  private colors = [
    '#3388ff', '#66bb6a', '#ffca28', '#ff7043', 
    '#ab47bc', '#26a69a', '#ec407a', '#5c6bc0'
  ];

  constructor(map: L.Map, config: Partial<GPSRenderingConfig> = {}) {
    this.map = map;
    this.config = {
      maxTrajectoryPoints: 5000,
      maxSegments: 10,
      segmentTimeSpan: 300000, // 5分钟
      decimationThreshold: 1000,
      updateThreshold: 100, // 100ms
      enableCaching: true,
      cacheSize: 100,
      adaptiveQuality: true,
      ...config
    };

    this.sampler = createDefaultSampler({
      maxPointsPerSecond: 10, // GPS数据通常较低频
      adaptiveSampling: true,
      noiseThreshold: 0.00001, // GPS坐标精度较高
      smoothingFactor: 0.1
    });

    this.stats = this.resetStats();

    // 监听地图缩放事件，根据缩放级别调整显示质量
    this.map.on('zoomend', this.handleZoomChange.bind(this));
    this.map.on('moveend', this.handleMapMove.bind(this));
  }

  /**
   * 添加GPS点 - 增量更新优化
   * @param point GPS点数据
   */
  public addGPSPoint(point: GPSPoint): void {
    const now = Date.now();
    
    // 防抖处理
    if (now - this.lastUpdateTime < this.config.updateThreshold) {
      return;
    }

    const startTime = performance.now();

    // 转换为采样算法的格式
    // const samplingPoint = {
    //   x: point.lng,
    //   y: point.lat,
    //   timestamp: point.timestamp
    // };

    // 使用采样算法过滤点
    const shouldAdd = this.shouldAddPoint(point);
    if (!shouldAdd) {
      return;
    }

    // 获取或创建当前轨迹段
    if (!this.currentSegment || this.shouldCreateNewSegment(point)) {
      this.createNewSegment(point);
    }

    // 添加点到当前段
    this.addPointToCurrentSegment(point);

    // 管理轨迹段数量
    this.manageSegments();

    // 更新统计信息
    this.stats.totalPoints++;
    this.stats.renderTime = performance.now() - startTime;
    this.lastUpdateTime = now;
  }

  /**
   * 批量添加GPS点 - 优化大量数据处理
   * @param points GPS点数组  
   */
  public addGPSPoints(points: GPSPoint[]): void {
    if (points.length === 0) {return;}

    const startTime = performance.now();

    // 使用采样算法处理批量数据
    const samplingPoints = points.map(p => ({
      x: p.lng,
      y: p.lat,
      timestamp: p.timestamp
    }));

    const sampledPoints = this.sampler.adaptiveSampling('gps_trajectory', samplingPoints);
    
    // 转换回GPS点格式
    const filteredGPSPoints = sampledPoints.map(sp => {
      const originalPoint = points.find(p => p.timestamp === sp.timestamp);
      return originalPoint || {
        lat: sp.y,
        lng: sp.x,
        timestamp: sp.timestamp
      } as GPSPoint;
    });

    // 批量添加过滤后的点
    for (const point of filteredGPSPoints) {
      this.addPointToCurrentSegment(point);
    }

    this.manageSegments();
    
    this.stats.totalPoints += points.length;
    this.stats.visiblePoints += filteredGPSPoints.length;
    this.stats.decimationRatio = filteredGPSPoints.length / points.length;
    this.stats.renderTime = performance.now() - startTime;
  }

  /**
   * 判断是否应该添加点
   * @param point GPS点
   * @returns 是否添加
   */
  private shouldAddPoint(point: GPSPoint): boolean {
    if (!this.currentSegment || this.currentSegment.points.length === 0) {
      return true;
    }

    const lastPoint = this.currentSegment.points[this.currentSegment.points.length - 1];
    const distance = this.calculateDistance(
      { lat: lastPoint.lat, lng: lastPoint.lng },
      { lat: point.lat, lng: point.lng }
    );

    // 基于距离和时间的智能过滤
    const timeDiff = point.timestamp - this.currentSegment.endTime;
    const distanceThreshold = this.getDistanceThreshold();

    return distance > distanceThreshold || timeDiff > 5000; // 5秒或距离阈值
  }

  /**
   * 根据地图缩放级别获取距离阈值
   * @returns 距离阈值（米）
   */
  private getDistanceThreshold(): number {
    const zoom = this.map.getZoom();
    if (zoom >= 15) {return 5;} // 高缩放级别，保留更多细节
    if (zoom >= 12) {return 10;}
    if (zoom >= 10) {return 25;}
    return 50; // 低缩放级别，更激进的抽稀
  }

  /**
   * 计算两点间距离（米）
   * @param point1 起点
   * @param point2 终点
   * @returns 距离（米）
   */
  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371000; // 地球半径（米）
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 判断是否需要创建新的轨迹段
   * @param point GPS点
   * @returns 是否创建新段
   */
  private shouldCreateNewSegment(point: GPSPoint): boolean {
    if (!this.currentSegment) {return true;}

    const timeDiff = point.timestamp - this.currentSegment.startTime;
    const pointCount = this.currentSegment.points.length;

    return timeDiff > this.config.segmentTimeSpan || 
           pointCount >= this.config.maxTrajectoryPoints / this.config.maxSegments;
  }

  /**
   * 创建新的轨迹段
   * @param initialPoint 初始GPS点
   */
  private createNewSegment(initialPoint: GPSPoint): void {
    const colorIndex = this.segments.length % this.colors.length;
    
    this.currentSegment = {
      points: [],
      polyline: L.polyline([], {
        color: this.colors[colorIndex],
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1.0
      }).addTo(this.map),
      startTime: initialPoint.timestamp,
      endTime: initialPoint.timestamp,
      color: this.colors[colorIndex]
    };

    this.segments.push(this.currentSegment);
  }

  /**
   * 添加点到当前轨迹段 - 增量更新
   * @param point GPS点
   */
  private addPointToCurrentSegment(point: GPSPoint): void {
    if (!this.currentSegment) {return;}

    const latLng = L.latLng(point.lat, point.lng);
    this.currentSegment.points.push(latLng);
    this.currentSegment.endTime = point.timestamp;

    // 增量更新折线，而不是重新创建
    this.currentSegment.polyline.addLatLng(latLng);

    // 如果点数过多，进行抽稀
    if (this.currentSegment.points.length > this.config.decimationThreshold) {
      this.decimateCurrentSegment();
    }
  }

  /**
   * 对当前轨迹段进行抽稀
   */
  private decimateCurrentSegment(): void {
    if (!this.currentSegment || this.currentSegment.points.length < 3) {return;}

    // 使用Douglas-Peucker算法抽稀
    const points = this.currentSegment.points.map(latLng => ({
      x: latLng.lng,
      y: latLng.lat,
      timestamp: Date.now()
    }));

    const epsilon = this.getDecimationEpsilon();
    const decimatedPoints = this.sampler.douglasPeuckerDecimation(points, epsilon);

    // 更新轨迹段
    this.currentSegment.points = decimatedPoints.map(p => L.latLng(p.y, p.x));
    
    // 重新创建折线（只有在抽稀时才重新创建）
    this.map.removeLayer(this.currentSegment.polyline);
    this.currentSegment.polyline = L.polyline(this.currentSegment.points, {
      color: this.currentSegment.color,
      weight: 3,
      opacity: 0.8,
      smoothFactor: 1.0
    }).addTo(this.map);
  }

  /**
   * 根据地图缩放级别获取抽稀参数
   * @returns epsilon值
   */
  private getDecimationEpsilon(): number {
    const zoom = this.map.getZoom();
    if (zoom >= 15) {return 0.00001;} // 高精度
    if (zoom >= 12) {return 0.0001;}
    if (zoom >= 10) {return 0.0005;}
    return 0.001; // 低精度
  }

  /**
   * 管理轨迹段数量
   */
  private manageSegments(): void {
    while (this.segments.length > this.config.maxSegments) {
      const oldestSegment = this.segments.shift();
      if (oldestSegment) {
        this.map.removeLayer(oldestSegment.polyline);
      }
    }

    this.stats.segments = this.segments.length;
  }

  /**
   * 处理地图缩放变化
   */
  private handleZoomChange(): void {
    if (!this.config.adaptiveQuality) {return;}

    const zoom = this.map.getZoom();
    
    // 根据缩放级别调整渲染质量
    this.segments.forEach(segment => {
      if (zoom >= 12) {
        // 高缩放级别，增加线宽和透明度
        segment.polyline.setStyle({
          weight: 4,
          opacity: 0.9
        });
      } else {
        // 低缩放级别，减少线宽
        segment.polyline.setStyle({
          weight: 2,
          opacity: 0.7
        });
      }
    });
  }

  /**
   * 处理地图移动
   */
  private handleMapMove(): void {
    // 在地图移动时可以实现视口裁剪等优化
    this.updateVisiblePointsCount();
  }

  /**
   * 更新可见点数统计
   */
  private updateVisiblePointsCount(): void {
    const bounds = this.map.getBounds();
    let visiblePoints = 0;

    this.segments.forEach(segment => {
      visiblePoints += segment.points.filter(point => 
        bounds.contains(point)
      ).length;
    });

    this.stats.visiblePoints = visiblePoints;
  }

  /**
   * 清除所有轨迹
   */
  public clearTrajectory(): void {
    this.segments.forEach(segment => {
      this.map.removeLayer(segment.polyline);
    });
    
    this.segments = [];
    this.currentSegment = null;
    this.sampler.clearCache();
    this.stats = this.resetStats();
  }

  /**
   * 获取轨迹边界
   * @returns 边界对象
   */
  public getTrajectoryBounds(): L.LatLngBounds | null {
    if (this.segments.length === 0) {return null;}

    const allPoints: L.LatLng[] = [];
    this.segments.forEach(segment => {
      allPoints.push(...segment.points);
    });

    return L.latLngBounds(allPoints);
  }

  /**
   * 适应轨迹视图
   */
  public fitTrajectoryBounds(): void {
    const bounds = this.getTrajectoryBounds();
    if (bounds) {
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }

  /**
   * 获取性能统计
   * @returns 统计信息
   */
  public getStats(): RenderingStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   * @returns 重置后的统计信息
   */
  private resetStats(): RenderingStats {
    return {
      totalPoints: 0,
      visiblePoints: 0,
      segments: 0,
      renderTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      decimationRatio: 1.0
    };
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  public updateConfig(newConfig: Partial<GPSRenderingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 销毁渲染器
   */
  public destroy(): void {
    this.clearTrajectory();
    this.map.off('zoomend', this.handleZoomChange);
    this.map.off('moveend', this.handleMapMove);
    this.tileCache.clear();
  }
}

/**
 * 地图瓦片缓存管理器
 */
export class MapTileCacheManager {
  private cache: Map<string, TileCache> = new Map();
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 200) {
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * 生成瓦片缓存键
   * @param url 瓦片URL
   * @param zoom 缩放级别
   * @param x X坐标
   * @param y Y坐标
   * @returns 缓存键
   */
  private generateCacheKey(url: string, zoom: number, x: number, y: number): string {
    return `${url}_${zoom}_${x}_${y}`;
  }

  /**
   * 预加载瓦片
   * @param urls 瓦片URL数组
   * @param bounds 边界
   * @param zoom 缩放级别
   */
  public async preloadTiles(urls: string[], bounds: L.LatLngBounds, zoom: number): Promise<void> {
    const tilePromises: Promise<void>[] = [];

    // 计算需要的瓦片范围
    // const tileSize = 256; // 暂时未使用
    const scale = Math.pow(2, zoom);
    
    const minX = Math.floor((bounds.getWest() + 180) / 360 * scale);
    const maxX = Math.floor((bounds.getEast() + 180) / 360 * scale);
    const minY = Math.floor((1 - Math.log(Math.tan(bounds.getNorth() * Math.PI / 180) + 1 / Math.cos(bounds.getNorth() * Math.PI / 180)) / Math.PI) / 2 * scale);
    const maxY = Math.floor((1 - Math.log(Math.tan(bounds.getSouth() * Math.PI / 180) + 1 / Math.cos(bounds.getSouth() * Math.PI / 180)) / Math.PI) / 2 * scale);

    for (const url of urls) {
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const tileUrl = url.replace('{z}', zoom.toString())
                             .replace('{x}', x.toString())
                             .replace('{y}', y.toString());
          
          tilePromises.push(this.loadAndCacheTile(tileUrl, zoom, x, y));
        }
      }
    }

    await Promise.allSettled(tilePromises);
  }

  /**
   * 加载并缓存瓦片
   * @param url 瓦片URL
   * @param zoom 缩放级别
   * @param x X坐标
   * @param y Y坐标
   */
  private async loadAndCacheTile(url: string, zoom: number, x: number, y: number): Promise<void> {
    const cacheKey = this.generateCacheKey(url, zoom, x, y);
    
    if (this.cache.has(cacheKey)) {
      return; // 已缓存
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = (): void => {
        const tileCache: TileCache = {
          url,
          image: img,
          timestamp: Date.now(),
          zoom,
          x,
          y
        };

        this.addToCache(cacheKey, tileCache);
        resolve();
      };

      img.onerror = (): void => {
        reject(new Error(`Failed to load tile: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * 添加到缓存
   * @param key 缓存键
   * @param tileCache 瓦片缓存
   */
  private addToCache(key: string, tileCache: TileCache): void {
    // 如果缓存已满，删除最旧的瓦片
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, tileCache);
  }

  /**
   * 获取缓存的瓦片
   * @param url 瓦片URL
   * @param zoom 缩放级别
   * @param x X坐标
   * @param y Y坐标
   * @returns 缓存的瓦片或null
   */
  public getCachedTile(url: string, zoom: number, x: number, y: number): TileCache | null {
    const cacheKey = this.generateCacheKey(url, zoom, x, y);
    return this.cache.get(cacheKey) || null;
  }

  /**
   * 清理过期缓存
   * @param maxAge 最大缓存时间（毫秒）
   */
  public cleanExpiredCache(maxAge: number = 3600000): void { // 默认1小时
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((tileCache, key) => {
      if (now - tileCache.timestamp > maxAge) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   * @returns 缓存统计信息
   */
  public getCacheStats(): { size: number; maxSize: number; hitRatio: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRatio: 0 // TODO: 实现命中率统计
    };
  }
}
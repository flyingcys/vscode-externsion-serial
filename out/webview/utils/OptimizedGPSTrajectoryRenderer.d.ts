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
    segmentTimeSpan: number;
    decimationThreshold: number;
    updateThreshold: number;
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
export declare class OptimizedGPSTrajectoryRenderer {
    private map;
    private config;
    private segments;
    private currentSegment;
    private sampler;
    private tileCache;
    private lastUpdateTime;
    private stats;
    private colors;
    constructor(map: L.Map, config?: Partial<GPSRenderingConfig>);
    /**
     * 添加GPS点 - 增量更新优化
     * @param point GPS点数据
     */
    addGPSPoint(point: GPSPoint): void;
    /**
     * 批量添加GPS点 - 优化大量数据处理
     * @param points GPS点数组
     */
    addGPSPoints(points: GPSPoint[]): void;
    /**
     * 判断是否应该添加点
     * @param point GPS点
     * @returns 是否添加
     */
    private shouldAddPoint;
    /**
     * 根据地图缩放级别获取距离阈值
     * @returns 距离阈值（米）
     */
    private getDistanceThreshold;
    /**
     * 计算两点间距离（米）
     * @param point1 起点
     * @param point2 终点
     * @returns 距离（米）
     */
    private calculateDistance;
    private toRadians;
    /**
     * 判断是否需要创建新的轨迹段
     * @param point GPS点
     * @returns 是否创建新段
     */
    private shouldCreateNewSegment;
    /**
     * 创建新的轨迹段
     * @param initialPoint 初始GPS点
     */
    private createNewSegment;
    /**
     * 添加点到当前轨迹段 - 增量更新
     * @param point GPS点
     */
    private addPointToCurrentSegment;
    /**
     * 对当前轨迹段进行抽稀
     */
    private decimateCurrentSegment;
    /**
     * 根据地图缩放级别获取抽稀参数
     * @returns epsilon值
     */
    private getDecimationEpsilon;
    /**
     * 管理轨迹段数量
     */
    private manageSegments;
    /**
     * 处理地图缩放变化
     */
    private handleZoomChange;
    /**
     * 处理地图移动
     */
    private handleMapMove;
    /**
     * 更新可见点数统计
     */
    private updateVisiblePointsCount;
    /**
     * 清除所有轨迹
     */
    clearTrajectory(): void;
    /**
     * 获取轨迹边界
     * @returns 边界对象
     */
    getTrajectoryBounds(): L.LatLngBounds | null;
    /**
     * 适应轨迹视图
     */
    fitTrajectoryBounds(): void;
    /**
     * 获取性能统计
     * @returns 统计信息
     */
    getStats(): RenderingStats;
    /**
     * 重置统计信息
     * @returns 重置后的统计信息
     */
    private resetStats;
    /**
     * 更新配置
     * @param newConfig 新配置
     */
    updateConfig(newConfig: Partial<GPSRenderingConfig>): void;
    /**
     * 销毁渲染器
     */
    destroy(): void;
}
/**
 * 地图瓦片缓存管理器
 */
export declare class MapTileCacheManager {
    private cache;
    private maxCacheSize;
    constructor(maxCacheSize?: number);
    /**
     * 生成瓦片缓存键
     * @param url 瓦片URL
     * @param zoom 缩放级别
     * @param x X坐标
     * @param y Y坐标
     * @returns 缓存键
     */
    private generateCacheKey;
    /**
     * 预加载瓦片
     * @param urls 瓦片URL数组
     * @param bounds 边界
     * @param zoom 缩放级别
     */
    preloadTiles(urls: string[], bounds: L.LatLngBounds, zoom: number): Promise<void>;
    /**
     * 加载并缓存瓦片
     * @param url 瓦片URL
     * @param zoom 缩放级别
     * @param x X坐标
     * @param y Y坐标
     */
    private loadAndCacheTile;
    /**
     * 添加到缓存
     * @param key 缓存键
     * @param tileCache 瓦片缓存
     */
    private addToCache;
    /**
     * 获取缓存的瓦片
     * @param url 瓦片URL
     * @param zoom 缩放级别
     * @param x X坐标
     * @param y Y坐标
     * @returns 缓存的瓦片或null
     */
    getCachedTile(url: string, zoom: number, x: number, y: number): TileCache | null;
    /**
     * 清理过期缓存
     * @param maxAge 最大缓存时间（毫秒）
     */
    cleanExpiredCache(maxAge?: number): void;
    /**
     * 清空缓存
     */
    clearCache(): void;
    /**
     * 获取缓存统计
     * @returns 缓存统计信息
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitRatio: number;
    };
}
//# sourceMappingURL=OptimizedGPSTrajectoryRenderer.d.ts.map
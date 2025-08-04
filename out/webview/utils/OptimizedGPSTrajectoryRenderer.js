"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapTileCacheManager = exports.OptimizedGPSTrajectoryRenderer = void 0;
const leaflet_1 = __importDefault(require("leaflet"));
const AdvancedSamplingAlgorithms_1 = require("./AdvancedSamplingAlgorithms");
/**
 * 优化的GPS轨迹渲染器类
 */
class OptimizedGPSTrajectoryRenderer {
    map;
    config;
    segments = [];
    currentSegment = null;
    sampler;
    tileCache = new Map();
    lastUpdateTime = 0;
    stats;
    // 颜色渐变配置
    colors = [
        '#3388ff', '#66bb6a', '#ffca28', '#ff7043',
        '#ab47bc', '#26a69a', '#ec407a', '#5c6bc0'
    ];
    constructor(map, config = {}) {
        this.map = map;
        this.config = {
            maxTrajectoryPoints: 5000,
            maxSegments: 10,
            segmentTimeSpan: 300000,
            decimationThreshold: 1000,
            updateThreshold: 100,
            enableCaching: true,
            cacheSize: 100,
            adaptiveQuality: true,
            ...config
        };
        this.sampler = (0, AdvancedSamplingAlgorithms_1.createDefaultSampler)({
            maxPointsPerSecond: 10,
            adaptiveSampling: true,
            noiseThreshold: 0.00001,
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
    addGPSPoint(point) {
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
    addGPSPoints(points) {
        if (points.length === 0) {
            return;
        }
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
            };
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
    shouldAddPoint(point) {
        if (!this.currentSegment || this.currentSegment.points.length === 0) {
            return true;
        }
        const lastPoint = this.currentSegment.points[this.currentSegment.points.length - 1];
        const distance = this.calculateDistance({ lat: lastPoint.lat, lng: lastPoint.lng }, { lat: point.lat, lng: point.lng });
        // 基于距离和时间的智能过滤
        const timeDiff = point.timestamp - this.currentSegment.endTime;
        const distanceThreshold = this.getDistanceThreshold();
        return distance > distanceThreshold || timeDiff > 5000; // 5秒或距离阈值
    }
    /**
     * 根据地图缩放级别获取距离阈值
     * @returns 距离阈值（米）
     */
    getDistanceThreshold() {
        const zoom = this.map.getZoom();
        if (zoom >= 15) {
            return 5;
        } // 高缩放级别，保留更多细节
        if (zoom >= 12) {
            return 10;
        }
        if (zoom >= 10) {
            return 25;
        }
        return 50; // 低缩放级别，更激进的抽稀
    }
    /**
     * 计算两点间距离（米）
     * @param point1 起点
     * @param point2 终点
     * @returns 距离（米）
     */
    calculateDistance(point1, point2) {
        const R = 6371000; // 地球半径（米）
        const dLat = this.toRadians(point2.lat - point1.lat);
        const dLng = this.toRadians(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * 判断是否需要创建新的轨迹段
     * @param point GPS点
     * @returns 是否创建新段
     */
    shouldCreateNewSegment(point) {
        if (!this.currentSegment) {
            return true;
        }
        const timeDiff = point.timestamp - this.currentSegment.startTime;
        const pointCount = this.currentSegment.points.length;
        return timeDiff > this.config.segmentTimeSpan ||
            pointCount >= this.config.maxTrajectoryPoints / this.config.maxSegments;
    }
    /**
     * 创建新的轨迹段
     * @param initialPoint 初始GPS点
     */
    createNewSegment(initialPoint) {
        const colorIndex = this.segments.length % this.colors.length;
        this.currentSegment = {
            points: [],
            polyline: leaflet_1.default.polyline([], {
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
    addPointToCurrentSegment(point) {
        if (!this.currentSegment) {
            return;
        }
        const latLng = leaflet_1.default.latLng(point.lat, point.lng);
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
    decimateCurrentSegment() {
        if (!this.currentSegment || this.currentSegment.points.length < 3) {
            return;
        }
        // 使用Douglas-Peucker算法抽稀
        const points = this.currentSegment.points.map(latLng => ({
            x: latLng.lng,
            y: latLng.lat,
            timestamp: Date.now()
        }));
        const epsilon = this.getDecimationEpsilon();
        const decimatedPoints = this.sampler.douglasPeuckerDecimation(points, epsilon);
        // 更新轨迹段
        this.currentSegment.points = decimatedPoints.map(p => leaflet_1.default.latLng(p.y, p.x));
        // 重新创建折线（只有在抽稀时才重新创建）
        this.map.removeLayer(this.currentSegment.polyline);
        this.currentSegment.polyline = leaflet_1.default.polyline(this.currentSegment.points, {
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
    getDecimationEpsilon() {
        const zoom = this.map.getZoom();
        if (zoom >= 15) {
            return 0.00001;
        } // 高精度
        if (zoom >= 12) {
            return 0.0001;
        }
        if (zoom >= 10) {
            return 0.0005;
        }
        return 0.001; // 低精度
    }
    /**
     * 管理轨迹段数量
     */
    manageSegments() {
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
    handleZoomChange() {
        if (!this.config.adaptiveQuality) {
            return;
        }
        const zoom = this.map.getZoom();
        // 根据缩放级别调整渲染质量
        this.segments.forEach(segment => {
            if (zoom >= 12) {
                // 高缩放级别，增加线宽和透明度
                segment.polyline.setStyle({
                    weight: 4,
                    opacity: 0.9
                });
            }
            else {
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
    handleMapMove() {
        // 在地图移动时可以实现视口裁剪等优化
        this.updateVisiblePointsCount();
    }
    /**
     * 更新可见点数统计
     */
    updateVisiblePointsCount() {
        const bounds = this.map.getBounds();
        let visiblePoints = 0;
        this.segments.forEach(segment => {
            visiblePoints += segment.points.filter(point => bounds.contains(point)).length;
        });
        this.stats.visiblePoints = visiblePoints;
    }
    /**
     * 清除所有轨迹
     */
    clearTrajectory() {
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
    getTrajectoryBounds() {
        if (this.segments.length === 0) {
            return null;
        }
        const allPoints = [];
        this.segments.forEach(segment => {
            allPoints.push(...segment.points);
        });
        return leaflet_1.default.latLngBounds(allPoints);
    }
    /**
     * 适应轨迹视图
     */
    fitTrajectoryBounds() {
        const bounds = this.getTrajectoryBounds();
        if (bounds) {
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
    }
    /**
     * 获取性能统计
     * @returns 统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 重置统计信息
     * @returns 重置后的统计信息
     */
    resetStats() {
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
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * 销毁渲染器
     */
    destroy() {
        this.clearTrajectory();
        this.map.off('zoomend', this.handleZoomChange);
        this.map.off('moveend', this.handleMapMove);
        this.tileCache.clear();
    }
}
exports.OptimizedGPSTrajectoryRenderer = OptimizedGPSTrajectoryRenderer;
/**
 * 地图瓦片缓存管理器
 */
class MapTileCacheManager {
    cache = new Map();
    maxCacheSize;
    constructor(maxCacheSize = 200) {
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
    generateCacheKey(url, zoom, x, y) {
        return `${url}_${zoom}_${x}_${y}`;
    }
    /**
     * 预加载瓦片
     * @param urls 瓦片URL数组
     * @param bounds 边界
     * @param zoom 缩放级别
     */
    async preloadTiles(urls, bounds, zoom) {
        const tilePromises = [];
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
    async loadAndCacheTile(url, zoom, x, y) {
        const cacheKey = this.generateCacheKey(url, zoom, x, y);
        if (this.cache.has(cacheKey)) {
            return; // 已缓存
        }
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const tileCache = {
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
            img.onerror = () => {
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
    addToCache(key, tileCache) {
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
    getCachedTile(url, zoom, x, y) {
        const cacheKey = this.generateCacheKey(url, zoom, x, y);
        return this.cache.get(cacheKey) || null;
    }
    /**
     * 清理过期缓存
     * @param maxAge 最大缓存时间（毫秒）
     */
    cleanExpiredCache(maxAge = 3600000) {
        const now = Date.now();
        const expiredKeys = [];
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
    clearCache() {
        this.cache.clear();
    }
    /**
     * 获取缓存统计
     * @returns 缓存统计信息
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRatio: 0 // TODO: 实现命中率统计
        };
    }
}
exports.MapTileCacheManager = MapTileCacheManager;
//# sourceMappingURL=OptimizedGPSTrajectoryRenderer.js.map
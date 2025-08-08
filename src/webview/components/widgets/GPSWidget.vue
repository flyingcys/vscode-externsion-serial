<!--
GPS地图组件 - 基于Serial-Studio GPS.qml和GPS.cpp实现
使用Leaflet地图库实现瓦片地图显示和GPS数据可视化
-->
<template>
  <BaseWidget 
    :widget-type="WidgetType.GPS"
    :title="widgetTitle"
    :datasets="datasets"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
  >
    <!-- GPS工具栏 -->
    <template #toolbar>
      <div class="gps-toolbar">
        <!-- 自动居中按钮 -->
        <el-button
          size="small"
          :type="autoCenter ? 'primary' : 'default'"
          @click="toggleAutoCenter"
          title="自动居中"
        >
          <el-icon><Aim /></el-icon>
        </el-button>

        <!-- 轨迹绘制按钮 -->
        <el-button
          size="small"
          :type="plotTrajectory ? 'primary' : 'default'"
          @click="toggleTrajectory"
          title="显示轨迹"
        >
          <el-icon><Connection /></el-icon>
        </el-button>

        <el-divider direction="vertical" />

        <!-- 缩放控制 -->
        <el-button-group size="small">
          <el-button @click="zoomIn" title="放大">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button @click="zoomOut" title="缩小">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <!-- 天气图层 -->
        <el-button
          size="small"
          :type="showWeather ? 'primary' : 'default'"
          @click="toggleWeather"
          title="显示天气"
        >
          <el-icon><Cloudy /></el-icon>
        </el-button>

        <el-divider direction="vertical" />

        <!-- 地图类型选择 -->
        <el-select
          v-model="currentMapType"
          size="small"
          style="min-width: 140px"
          @change="handleMapTypeChange"
        >
          <el-option
            v-for="(type, index) in mapTypes"
            :key="index"
            :label="type"
            :value="index"
          />
        </el-select>
      </div>
    </template>

    <!-- 地图容器 -->
    <div class="gps-container">
      <div
        ref="mapContainer"
        class="gps-map"
        :style="{ height: mapHeight + 'px' }"
      />
      
      <!-- GPS信息面板 -->
      <div v-if="showInfo" class="gps-info-panel">
        <div class="info-item">
          <span class="label">纬度:</span>
          <span class="value">{{ formatCoordinate(currentPosition.lat) }}°</span>
        </div>
        <div class="info-item">
          <span class="label">经度:</span>
          <span class="value">{{ formatCoordinate(currentPosition.lng) }}°</span>
        </div>
        <div class="info-item">
          <span class="label">高度:</span>
          <span class="value">{{ formatAltitude(currentPosition.alt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">精度:</span>
          <span class="value">{{ formatAccuracy(currentPosition.accuracy) }}</span>
        </div>
      </div>

      <!-- 性能监控 -->
      <div v-if="showPerformance" class="performance-monitor">
        <div>更新率: {{ updateRate.toFixed(1) }} Hz</div>
        <div>响应时间: {{ responseTime.toFixed(1) }} ms</div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElButton, ElButtonGroup, ElSelect, ElOption, ElIcon, ElDivider } from 'element-plus'
import { Aim, Connection, ZoomIn, ZoomOut, Cloudy } from '@element-plus/icons-vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import BaseWidget from '../base/BaseWidget.vue'
import { 
  WidgetType, 
  GPSPosition, 
  GPSTrajectoryPoint, 
  GPSSeries,
  MapLayerType 
} from '@/shared/types'
import { useDataStore } from '@/webview/stores/data'
import { useThemeStore } from '@/webview/stores/theme'
import { 
  OptimizedGPSTrajectoryRenderer, 
  MapTileCacheManager,
  GPSPoint,
  GPSRenderingConfig 
} from '../../utils/OptimizedGPSTrajectoryRenderer'

// Props定义
interface Props {
  datasets: any[]
  widgetTitle?: string
  mapHeight?: number
  showInfo?: boolean
  showPerformance?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  widgetTitle: 'GPS地图',
  mapHeight: 400,
  showInfo: true,
  showPerformance: false
})

// Emits定义
const emit = defineEmits<{
  refresh: []
  settings: []
  export: [data: any]
  positionUpdate: [position: GPSPosition]
}>()

// 地图类型定义（与Serial-Studio保持一致）
const mapTypes = [
  '卫星图像',
  '卫星图像（带标签）',  
  '街道地图',
  '地形图',
  '地势图',
  '浅灰画布',
  '深灰画布',
  '国家地理'
]

// 地图服务URL模板（使用OpenStreetMap等开源服务）
const mapUrls = [
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'
]

// 存储引用
const dataStore = useDataStore()
const themeStore = useThemeStore()

// 响应式状态
const mapContainer = ref<HTMLDivElement>()
const map = ref<L.Map>()
const currentMapType = ref(0)
const autoCenter = ref(true)
const plotTrajectory = ref(true)
const showWeather = ref(false)
const zoomLevel = ref(10)

// GPS位置状态
const currentPosition = ref<GPSPosition>({
  lat: 39.9042, // 默认位置（北京）
  lng: 116.4074,
  alt: 0,
  accuracy: 0
})

const trajectoryPoints = ref<GPSTrajectoryPoint[]>([])
const gpsMarker = ref<L.Marker>()
const trajectoryPolyline = ref<L.Polyline>()
const weatherLayer = ref<L.TileLayer>()

// 优化的GPS渲染器
const trajectoryRenderer = ref<OptimizedGPSTrajectoryRenderer>()
const tileCacheManager = ref<MapTileCacheManager>()

// 渲染配置
const renderingConfig = ref<GPSRenderingConfig>({
  maxTrajectoryPoints: 5000,
  maxSegments: 10,
  segmentTimeSpan: 300000, // 5分钟
  decimationThreshold: 1000,
  updateThreshold: 50, // 50ms更新阈值
  enableCaching: true,
  cacheSize: 200,
  adaptiveQuality: true
})

// 性能监控
const updateRate = ref(0)
const responseTime = ref(0)
const lastUpdateTime = ref(0)
const updateCount = ref(0)
const renderingStats = ref({
  totalPoints: 0,
  visiblePoints: 0,
  segments: 0,
  renderTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  decimationRatio: 1.0
})

// 计算属性
const widgetTitle = computed(() => props.widgetTitle || 'GPS地图')

// 地图初始化
const initializeMap = async () => {
  if (!mapContainer.value) return

  try {
    const startTime = performance.now()

    // 创建地图实例
    map.value = L.map(mapContainer.value, {
      center: [currentPosition.value.lat, currentPosition.value.lng] as L.LatLngTuple,
      zoom: zoomLevel.value,
      zoomControl: false, // 使用自定义缩放控制
      attributionControl: true
    })

    // 添加地图图层
    updateMapLayer()

    // 创建GPS标记
    createGPSMarker()

    // 初始化优化的轨迹渲染器
    initializeTrajectoryRenderer()

    // 初始化瓦片缓存管理器
    initializeTileCacheManager()

    // 监听地图事件
    map.value.on('zoomend', handleZoomChange)
    map.value.on('dragend', handleMapDrag)

    // 记录响应时间
    responseTime.value = performance.now() - startTime

    console.log(`GPS地图初始化完成，耗时: ${responseTime.value.toFixed(1)}ms`)
  } catch (error) {
    console.error('GPS地图初始化失败:', error)
  }
}

// 更新地图图层
const updateMapLayer = () => {
  if (!map.value) return

  // 移除现有图层
  map.value.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.value?.removeLayer(layer)
    }
  })

  // 添加新的瓦片图层
  const tileLayer = L.tileLayer(mapUrls[currentMapType.value], {
    attribution: '© ArcGIS | © OpenStreetMap contributors',
    maxZoom: 18,
    tileSize: 256
  })

  tileLayer.addTo(map.value)

  // 添加天气图层（如果启用）
  if (showWeather.value) {
    addWeatherLayer()
  }
}

// 创建GPS标记
const createGPSMarker = () => {
  if (!map.value) return

  // 创建自定义GPS图标
  const gpsIcon = L.divIcon({
    className: 'gps-marker',
    html: `
      <div class="gps-indicator">
        <div class="gps-dot"></div>
        <div class="gps-pulse"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  // 创建标记
  gpsMarker.value = L.marker(
    [currentPosition.value.lat, currentPosition.value.lng],
    { icon: gpsIcon }
  ).addTo(map.value)

  // 添加弹出窗口
  gpsMarker.value.bindPopup(`
    <div class="gps-popup">
      <h4>GPS位置</h4>
      <p><strong>纬度:</strong> ${formatCoordinate(currentPosition.value.lat)}°</p>
      <p><strong>经度:</strong> ${formatCoordinate(currentPosition.value.lng)}°</p>
      <p><strong>高度:</strong> ${formatAltitude(currentPosition.value.alt)}</p>
    </div>
  `)
}

/**
 * 初始化优化的轨迹渲染器
 */
const initializeTrajectoryRenderer = () => {
  if (!map.value) return
  
  trajectoryRenderer.value = new OptimizedGPSTrajectoryRenderer(
    map.value, 
    renderingConfig.value
  )
  console.log('优化的GPS轨迹渲染器初始化完成')
}

/**
 * 初始化瓦片缓存管理器
 */
const initializeTileCacheManager = () => {
  tileCacheManager.value = new MapTileCacheManager(renderingConfig.value.cacheSize)
  
  // 预加载当前视图的瓦片
  if (map.value) {
    const bounds = map.value.getBounds()
    const zoom = map.value.getZoom()
    const currentMapUrl = mapUrls[currentMapType.value]
    
    tileCacheManager.value.preloadTiles([currentMapUrl], bounds, zoom)
      .then(() => {
        console.log('地图瓦片预加载完成')
        renderingStats.value.cacheHits++
      })
      .catch(error => {
        console.warn('地图瓦片预加载失败:', error)
        renderingStats.value.cacheMisses++
      })
  }
}

// 创建轨迹线（保留原有方法作为后备）
const createTrajectoryPolyline = () => {
  if (!map.value || trajectoryPoints.value.length === 0) return

  const latLngs = trajectoryPoints.value.map(point => [point.lat, point.lng] as L.LatLngTuple)
  
  trajectoryPolyline.value = L.polyline(latLngs, {
    color: '#3388ff',
    weight: 3,
    opacity: 0.8
  }).addTo(map.value)
}

// 添加天气图层
const addWeatherLayer = () => {
  if (!map.value) return

  // 使用OpenWeatherMap的天气图层
  weatherLayer.value = L.tileLayer(
    'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_API_KEY',
    {
      attribution: '© OpenWeatherMap',
      opacity: 0.6
    }
  ).addTo(map.value)
}

// 更新GPS位置
/**
 * 优化的GPS位置更新 - 使用增量轨迹渲染
 * @param newPosition 新的GPS位置
 */
const updateGPSPosition = (newPosition: GPSPosition) => {
  const startTime = performance.now()

  currentPosition.value = { ...newPosition }

  if (gpsMarker.value && map.value) {
    // 更新标记位置
    gpsMarker.value.setLatLng([newPosition.lat, newPosition.lng])

    // 更新弹出窗口内容
    gpsMarker.value.setPopupContent(`
      <div class="gps-popup">
        <h4>GPS位置</h4>
        <p><strong>纬度:</strong> ${formatCoordinate(newPosition.lat)}°</p>
        <p><strong>经度:</strong> ${formatCoordinate(newPosition.lng)}°</p>
        <p><strong>高度:</strong> ${formatAltitude(newPosition.alt)}</p>
        <p><strong>精度:</strong> ${formatAccuracy(newPosition.accuracy)}</p>
      </div>
    `)

    // 自动居中
    if (autoCenter.value) {
      map.value.setView([newPosition.lat, newPosition.lng], zoomLevel.value)
    }

    // 使用优化的轨迹渲染器添加GPS点
    if (plotTrajectory.value && trajectoryRenderer.value) {
      const gpsPoint: GPSPoint = {
        lat: newPosition.lat,
        lng: newPosition.lng,
        alt: newPosition.alt,
        timestamp: newPosition.timestamp || Date.now(),
        accuracy: newPosition.accuracy,
        speed: newPosition.speed,
        heading: newPosition.heading
      }

      // 使用优化的渲染器添加点（自动处理抽稀和增量更新）
      trajectoryRenderer.value.addGPSPoint(gpsPoint)
      
      // 更新渲染统计信息
      const stats = trajectoryRenderer.value.getStats()
      renderingStats.value = { ...stats }
    } else if (plotTrajectory.value) {
      // 回退到原有的轨迹处理方式
      const trajectoryPoint: GPSTrajectoryPoint = {
        ...newPosition,
        timestamp: Date.now()
      }
      trajectoryPoints.value.push(trajectoryPoint)

      // 限制轨迹点数量（保留最近1000个点）
      if (trajectoryPoints.value.length > 1000) {
        trajectoryPoints.value = trajectoryPoints.value.slice(-1000)
      }

      // 更新轨迹线
      updateTrajectoryPolyline()
    }
  }

  // 更新性能指标
  const now = Date.now()
  if (lastUpdateTime.value > 0) {
    const interval = now - lastUpdateTime.value
    updateRate.value = 1000 / interval
  }
  lastUpdateTime.value = now
  updateCount.value++

  responseTime.value = performance.now() - startTime

  emit('positionUpdate', newPosition)
}

/**
 * 批量更新GPS位置 - 优化大量数据处理
 * @param positions GPS位置数组
 */
const updateGPSPositions = (positions: GPSPosition[]) => {
  if (!positions || positions.length === 0) return

  const startTime = performance.now()

  // 只处理最新的位置作为当前位置
  const latestPosition = positions[positions.length - 1]
  currentPosition.value = { ...latestPosition }

  if (gpsMarker.value && map.value) {
    gpsMarker.value.setLatLng([latestPosition.lat, latestPosition.lng])
  }

  // 使用优化的轨迹渲染器批量处理GPS点
  if (plotTrajectory.value && trajectoryRenderer.value) {
    const gpsPoints: GPSPoint[] = positions.map(pos => ({
      lat: pos.lat,
      lng: pos.lng,
      alt: pos.alt,
      timestamp: pos.timestamp || Date.now(),
      accuracy: pos.accuracy,
      speed: pos.speed,
      heading: pos.heading
    }))

    // 批量添加GPS点（内部会进行智能采样和抽稀）
    trajectoryRenderer.value.addGPSPoints(gpsPoints)
    
    // 更新渲染统计信息
    const stats = trajectoryRenderer.value.getStats()
    renderingStats.value = { ...stats }
  }

  // 自动居中到最新位置
  if (autoCenter.value && map.value) {
    map.value.setView([latestPosition.lat, latestPosition.lng], zoomLevel.value)
  }

  // 更新性能统计
  updateCount.value += positions.length
  responseTime.value = performance.now() - startTime

  emit('positionUpdate', latestPosition)
}

// 更新轨迹线
const updateTrajectoryPolyline = () => {
  if (!map.value || !plotTrajectory.value) return

  if (trajectoryPolyline.value) {
    map.value.removeLayer(trajectoryPolyline.value)
  }

  if (trajectoryPoints.value.length > 1) {
    createTrajectoryPolyline()
  }
}

// 工具栏事件处理
const toggleAutoCenter = () => {
  autoCenter.value = !autoCenter.value
  if (autoCenter.value && map.value) {
    map.value.setView([currentPosition.value.lat, currentPosition.value.lng], zoomLevel.value)
  }
}

const toggleTrajectory = () => {
  plotTrajectory.value = !plotTrajectory.value
  
  if (plotTrajectory.value) {
    createTrajectoryPolyline()
  } else if (trajectoryPolyline.value && map.value) {
    map.value.removeLayer(trajectoryPolyline.value)
    trajectoryPolyline.value = undefined
  }
}

const toggleWeather = () => {
  showWeather.value = !showWeather.value
  
  if (showWeather.value) {
    addWeatherLayer()
  } else if (weatherLayer.value && map.value) {
    map.value.removeLayer(weatherLayer.value)
    weatherLayer.value = undefined
  }
}

const zoomIn = () => {
  if (map.value) {
    map.value.zoomIn()
  }
}

const zoomOut = () => {
  if (map.value) {
    map.value.zoomOut()
  }
}

const handleMapTypeChange = (type: number) => {
  currentMapType.value = type
  updateMapLayer()
}

const handleZoomChange = () => {
  if (map.value) {
    zoomLevel.value = map.value.getZoom()
  }
}

const handleMapDrag = () => {
  // 拖拽时禁用自动居中
  if (autoCenter.value) {
    autoCenter.value = false
  }
}

// 工具函数
const formatCoordinate = (coord: number): string => {
  return coord.toFixed(6)
}

const formatAltitude = (alt: number): string => {
  if (isNaN(alt) || alt === 0) return '未知'
  return `${alt.toFixed(1)} m`
}

const formatAccuracy = (accuracy?: number): string => {
  if (!accuracy || isNaN(accuracy)) return '未知'
  return `±${accuracy.toFixed(1)} m`
}

// Widget事件处理
const handleRefresh = () => {
  // 清除轨迹数据
  trajectoryPoints.value = []
  if (trajectoryPolyline.value && map.value) {
    map.value.removeLayer(trajectoryPolyline.value)
    trajectoryPolyline.value = undefined
  }

  // 重置性能指标
  updateCount.value = 0
  updateRate.value = 0
  responseTime.value = 0

  emit('refresh')
}

const handleSettings = () => {
  emit('settings')
}

const handleExport = () => {
  const exportData = {
    currentPosition: currentPosition.value,
    trajectoryPoints: trajectoryPoints.value,
    settings: {
      autoCenter: autoCenter.value,
      plotTrajectory: plotTrajectory.value,
      showWeather: showWeather.value,
      mapType: currentMapType.value,
      zoomLevel: zoomLevel.value
    }
  }
  
  emit('export', exportData)
}

// 监听数据变化
watch(
  () => dataStore.currentFrame,
  (newFrame) => {
    if (newFrame?.groups) {
      // 查找GPS数据组
      const gpsGroup = newFrame.groups.find(group => 
        group.widget === 'gps' || group.title.toLowerCase().includes('gps')
      )

      if (gpsGroup?.datasets && gpsGroup.datasets.length >= 2) {
        const latDataset = gpsGroup.datasets.find(ds => 
          ds.title.toLowerCase().includes('lat') || ds.title.toLowerCase().includes('纬度')
        )
        const lngDataset = gpsGroup.datasets.find(ds => 
          ds.title.toLowerCase().includes('lng') || ds.title.toLowerCase().includes('lon') || ds.title.toLowerCase().includes('经度')
        )
        const altDataset = gpsGroup.datasets.find(ds => 
          ds.title.toLowerCase().includes('alt') || ds.title.toLowerCase().includes('高度')
        )

        if (latDataset?.value !== undefined && lngDataset?.value !== undefined) {
          const newPosition: GPSPosition = {
            lat: parseFloat(latDataset.value.toString()),
            lng: parseFloat(lngDataset.value.toString()),
            alt: altDataset?.value ? parseFloat(altDataset.value.toString()) : 0,
            timestamp: Date.now()
          }

          // 验证GPS数据有效性
          if (!isNaN(newPosition.lat) && !isNaN(newPosition.lng) &&
              newPosition.lat >= -90 && newPosition.lat <= 90 &&
              newPosition.lng >= -180 && newPosition.lng <= 180) {
            updateGPSPosition(newPosition)
          }
        }
      }
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(async () => {
  await nextTick()
  await initializeMap()
})

onUnmounted(() => {
  // 清理优化的GPS轨迹渲染器
  if (trajectoryRenderer.value) {
    trajectoryRenderer.value.destroy()
    trajectoryRenderer.value = undefined
  }
  
  // 清理瓦片缓存管理器
  if (tileCacheManager.value) {
    tileCacheManager.value.clearCache()
    tileCacheManager.value = undefined
  }
  
  // 清理地图实例
  if (map.value) {
    map.value.remove()
    map.value = undefined
  }
  
  console.log('GPSWidget: 所有资源已清理完毕')
})
</script>

<style scoped>
.gps-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
}

.gps-container {
  position: relative;
  height: 100%;
}

.gps-map {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.gps-info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  min-width: 180px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.performance-monitor {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
}

/* GPS标记样式 */
:deep(.gps-marker) {
  background: transparent;
  border: none;
}

:deep(.gps-indicator) {
  position: relative;
  width: 20px;
  height: 20px;
}

:deep(.gps-dot) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #3388ff;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

:deep(.gps-pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid #3388ff;
  border-radius: 50%;
  background: rgba(51, 136, 255, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* GPS弹出窗口样式 */
:deep(.gps-popup) {
  font-size: 12px;
}

:deep(.gps-popup h4) {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

:deep(.gps-popup p) {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gps-toolbar {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .gps-info-panel {
    position: static;
    margin: 8px;
    width: auto;
  }
}
</style>
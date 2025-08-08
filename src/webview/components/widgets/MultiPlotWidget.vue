<!--
MultiPlot多数据图表组件 - 基于Serial-Studio MultiPlot.qml和MultiPlot.cpp实现
使用Chart.js实现多序列数据的同时可视化，支持图例控制和曲线管理
-->
<template>
  <BaseWidget 
    :widget-type="WidgetType.MultiPlot"
    :title="widgetTitle"
    :datasets="datasets"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
  >
    <!-- 多图表工具栏 -->
    <template #toolbar>
      <div class="multiplot-toolbar">
        <!-- 插值模式切换 -->
        <el-button
          size="small"
          :type="interpolateMode ? 'primary' : 'default'"
          @click="toggleInterpolateMode"
          title="插值显示模式"
        >
          <el-icon><TrendCharts /></el-icon>
        </el-button>

        <!-- 图例显示控制 -->
        <el-button
          size="small"
          :type="showLegends ? 'primary' : 'default'"
          @click="toggleLegends"
          title="显示图例"
        >
          <el-icon><List /></el-icon>
        </el-button>

        <el-divider direction="vertical" />

        <!-- 坐标轴标签控制 -->
        <el-button
          size="small"
          :type="showXLabels ? 'primary' : 'default'"
          @click="toggleXLabels"
          title="显示X轴标签"
        >
          X
        </el-button>

        <el-button
          size="small"
          :type="showYLabels ? 'primary' : 'default'"
          @click="toggleYLabels"
          title="显示Y轴标签"
        >
          Y
        </el-button>

        <el-divider direction="vertical" />

        <!-- 十字线控制 -->
        <el-button
          size="small"
          :type="showCrosshairs ? 'primary' : 'default'"
          @click="toggleCrosshairs"
          title="显示十字线"
        >
          <el-icon><Aim /></el-icon>
        </el-button>

        <!-- 暂停/恢复 -->
        <el-button
          size="small"
          :type="isPaused ? 'warning' : 'default'"
          @click="togglePause"
          :title="isPaused ? '恢复' : '暂停'"
        >
          <el-icon v-if="isPaused"><VideoPlay /></el-icon>
          <el-icon v-else><VideoPause /></el-icon>
        </el-button>

        <!-- 重置缩放 -->
        <el-button
          size="small"
          @click="resetZoom"
          title="重置缩放"
          :disabled="!isZoomed"
        >
          <el-icon><RefreshRight /></el-icon>
        </el-button>

        <div class="toolbar-spacer" />

        <!-- 曲线统计信息 -->
        <div v-if="showCurveStats" class="curve-stats">
          <span>{{ visibleCurveCount }}/{{ totalCurves }} 曲线</span>
          <span>{{ dataPointsCount }} 点</span>
        </div>
      </div>
    </template>

    <!-- 主要内容区域 -->
    <div class="multiplot-container">
      <!-- 图表区域 -->
      <div class="chart-area" :style="{ width: chartAreaWidth }">
        <canvas
          ref="chartCanvas"
          class="multiplot-canvas"
          :width="canvasWidth"
          :height="canvasHeight"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @wheel="handleWheel"
          @mouseleave="handleMouseLeave"
        />
      </div>

      <!-- 图例面板 -->
      <div v-if="showLegends" class="legend-panel">
        <div class="legend-header">
          <h4>数据序列</h4>
          <el-button
            size="small"
            text
            @click="toggleAllCurves"
          >
            {{ allCurvesVisible ? '全部隐藏' : '全部显示' }}
          </el-button>
        </div>

        <div class="legend-content">
          <div
            v-for="(curve, index) in curves"
            :key="index"
            class="legend-item"
            @click="toggleCurveVisibility(index)"
          >
            <div class="legend-control">
              <el-switch
                v-model="curve.visible"
                size="small"
                @change="handleCurveVisibilityChange(index, $event)"
              />
              
              <div
                class="color-indicator"
                :style="{ backgroundColor: curve.color }"
              />
              
              <span class="curve-label">{{ curve.label }}</span>
            </div>

            <div class="curve-stats">
              <div class="stat-item">
                <span class="stat-label">最新:</span>
                <span class="stat-value">{{ formatValue(curve.lastValue) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最大:</span>
                <span class="stat-value">{{ formatValue(curve.maxValue) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最小:</span>
                <span class="stat-value">{{ formatValue(curve.minValue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  ElButton, 
  ElSwitch, 
  ElIcon, 
  ElDivider 
} from 'element-plus'
import { 
  TrendCharts, 
  List,
  Aim, 
  VideoPlay, 
  VideoPause, 
  RefreshRight 
} from '@element-plus/icons-vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

import BaseWidget from '../base/BaseWidget.vue'
import { WidgetType, Dataset, PlotSeries } from '@/shared/types'
import { useDataStore } from '@/webview/stores/data'
import { useThemeStore } from '@/webview/stores/theme'

// 注册Chart.js组件
Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props定义
interface Props {
  datasets: Dataset[]
  widgetTitle?: string
  canvasWidth?: number
  canvasHeight?: number
  maxDataPoints?: number
  showCurveStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  widgetTitle: '多数据图表',
  canvasWidth: 800,
  canvasHeight: 400,
  maxDataPoints: 1000,
  showCurveStats: true
})

// Emits定义
const emit = defineEmits<{
  refresh: []
  settings: []
  export: [data: any]
  'data-exported': [data: any]
  curveToggle: [index: number, visible: boolean]
}>()

// 曲线数据接口
interface CurveData {
  id: string
  label: string
  color: string
  visible: boolean
  data: { x: number; y: number }[]
  lastValue: number
  minValue: number
  maxValue: number
}

// 存储引用
const dataStore = useDataStore()
const themeStore = useThemeStore()

// DOM引用
const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<Chart>()

// 显示控制状态
const interpolateMode = ref(true)
const showLegends = ref(true)
const showXLabels = ref(true)
const showYLabels = ref(true)
const showCrosshairs = ref(false)
const isPaused = ref(false)
const isZoomed = ref(false)

// 曲线数据管理
const curves = ref<CurveData[]>([])
const sampleCounter = ref(0)

// 预定义颜色方案
const colorPalette = [
  '#3388ff', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7',
  '#a29bfe', '#74b9ff', '#00b894', '#00cec9',
  '#e17055', '#fdcb6e', '#e84393', '#fd79a8'
]

// 计算属性
const widgetTitle = computed(() => props.widgetTitle || '多数据图表')
const totalCurves = computed(() => curves.value.length)
const visibleCurveCount = computed(() => curves.value.filter(c => c.visible).length)
const dataPointsCount = computed(() => 
  curves.value.reduce((sum, curve) => sum + curve.data.length, 0)
)
const allCurvesVisible = computed(() => 
  curves.value.length > 0 && curves.value.every(c => c.visible)
)
const chartAreaWidth = computed(() => 
  showLegends.value ? 'calc(100% - 280px)' : '100%'
)

// 初始化Chart.js图表
const initializeChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: []
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // 禁用动画以提高性能
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false // 使用自定义图例
        },
        tooltip: {
          enabled: showCrosshairs.value,
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: {
          type: 'linear',
          display: showXLabels.value,
          title: {
            display: true,
            text: '采样点'
          }
        },
        y: {
          type: 'linear',
          display: showYLabels.value,
          title: {
            display: true,
            text: '数值'
          }
        }
      }
    }
  })

  console.log('MultiPlot图表初始化完成')
}

// 创建新曲线
const createCurve = (id: string, label: string): CurveData => {
  const colorIndex = curves.value.length % colorPalette.length
  
  return {
    id,
    label,
    color: colorPalette[colorIndex],
    visible: true,
    data: [],
    lastValue: 0,
    minValue: 0,
    maxValue: 0
  }
}

// 添加数据点到曲线
const addDataPoint = (curveId: string, value: number) => {
  if (isPaused.value) return

  let curve = curves.value.find(c => c.id === curveId)
  
  // 如果曲线不存在，创建新曲线
  if (!curve) {
    curve = createCurve(curveId, `数据序列 ${curves.value.length + 1}`)
    curves.value.push(curve)
    updateChartDatasets()
  }

  // 添加数据点
  const dataPoint = {
    x: sampleCounter.value,
    y: value
  }
  
  curve.data.push(dataPoint)
  
  // 限制数据点数量
  if (curve.data.length > props.maxDataPoints) {
    curve.data = curve.data.slice(-props.maxDataPoints)
  }

  // 更新统计信息
  curve.lastValue = value
  curve.minValue = Math.min(curve.minValue, value)
  curve.maxValue = Math.max(curve.maxValue, value)

  sampleCounter.value++
  
  // 更新图表
  updateChart()
}

// 更新Chart.js数据集
const updateChartDatasets = () => {
  if (!chart.value) return

  chart.value.data.datasets = curves.value.map(curve => ({
    label: curve.label,
    data: curve.data,
    borderColor: curve.color,
    backgroundColor: interpolateMode.value ? 
      `${curve.color}20` : curve.color,
    borderWidth: 2,
    pointRadius: interpolateMode.value ? 0 : 2,
    pointHoverRadius: 4,
    fill: false,
    tension: interpolateMode.value ? 0.1 : 0,
    hidden: !curve.visible
  }))
}

// 更新图表
const updateChart = () => {
  if (!chart.value) return

  updateChartDatasets()
  chart.value.update('none') // 无动画更新
}

// 工具栏事件处理
const toggleInterpolateMode = () => {
  interpolateMode.value = !interpolateMode.value
  updateChart()
}

const toggleLegends = () => {
  showLegends.value = !showLegends.value
}

const toggleXLabels = () => {
  showXLabels.value = !showXLabels.value
  if (chart.value) {
    chart.value.options.scales!.x!.display = showXLabels.value
    chart.value.update()
  }
}

const toggleYLabels = () => {
  showYLabels.value = !showYLabels.value
  if (chart.value) {
    chart.value.options.scales!.y!.display = showYLabels.value
    chart.value.update()
  }
}

const toggleCrosshairs = () => {
  showCrosshairs.value = !showCrosshairs.value
  if (chart.value) {
    chart.value.options.plugins!.tooltip!.enabled = showCrosshairs.value
    chart.value.update()
  }
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const resetZoom = () => {
  if (!chart.value) return
  
  chart.value.resetZoom()
  isZoomed.value = false
}

// 图例控制
const toggleAllCurves = () => {
  const newVisibility = !allCurvesVisible.value
  
  curves.value.forEach((curve, index) => {
    curve.visible = newVisibility
    emit('curveToggle', index, newVisibility)
  })
  
  updateChart()
}

const toggleCurveVisibility = (index: number) => {
  if (index >= 0 && index < curves.value.length) {
    curves.value[index].visible = !curves.value[index].visible
    updateChart()
  }
}

const handleCurveVisibilityChange = (index: number, visible: boolean) => {
  if (index >= 0 && index < curves.value.length) {
    curves.value[index].visible = visible
    emit('curveToggle', index, visible)
    updateChart()
  }
}

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent) => {
  // 缩放和平移处理
}

const handleMouseMove = (event: MouseEvent) => {
  // 十字线处理
}

const handleMouseUp = () => {
  // 鼠标释放处理
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  // 缩放处理
  isZoomed.value = true
}

const handleMouseLeave = () => {
  // 鼠标离开处理
}

// Widget事件处理
const handleRefresh = () => {
  curves.value.forEach(curve => {
    curve.data = []
    curve.lastValue = 0
    curve.minValue = 0
    curve.maxValue = 0
  })
  
  sampleCounter.value = 0
  updateChart()
  emit('refresh')
}

const handleSettings = () => {
  emit('settings')
}

const handleExport = () => {
  const exportData = {
    curves: curves.value.map(curve => ({
      id: curve.id,
      label: curve.label,
      color: curve.color,
      visible: curve.visible,
      data: curve.data,
      stats: {
        lastValue: curve.lastValue,
        minValue: curve.minValue,
        maxValue: curve.maxValue,
        dataPoints: curve.data.length
      }
    })),
    settings: {
      interpolateMode: interpolateMode.value,
      showLegends: showLegends.value,
      maxDataPoints: props.maxDataPoints
    }
  }
  
  emit('export', exportData)
}

// 工具函数
const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toFixed(2)
}

// 监听数据变化
watch(
  () => dataStore.currentFrame,
  (newFrame) => {
    if (newFrame?.groups) {
      // 查找多图表数据组
      const multiplotGroup = newFrame.groups.find(group => 
        group.widget === 'multiplot' || group.title.toLowerCase().includes('multi')
      )

      if (multiplotGroup?.datasets) {
        // 为每个数据集添加数据点
        multiplotGroup.datasets.forEach(dataset => {
          if (dataset?.value !== undefined) {
            const value = parseFloat(dataset.value.toString())
            if (!isNaN(value)) {
              addDataPoint(dataset.id, value)
            }
          }
        })
      }
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(async () => {
  await nextTick()
  initializeChart()
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<style scoped>
.multiplot-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
  flex-wrap: wrap;
}

.toolbar-spacer {
  flex: 1;
}

.curve-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-regular);
}

.multiplot-container {
  display: flex;
  height: 100%;
  background: var(--el-bg-color);
}

.chart-area {
  flex: 1;
  position: relative;
}

.multiplot-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.legend-panel {
  width: 280px;
  background: var(--el-bg-color-page);
  border-left: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.legend-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.legend-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.legend-item {
  padding: 8px;
  margin-bottom: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.legend-item:hover {
  border-color: var(--el-color-primary);
}

.legend-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.curve-label {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.curve-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

.stat-item {
  font-size: 11px;
  font-family: monospace;
}

.stat-label {
  color: var(--el-text-color-regular);
}

.stat-value {
  color: var(--el-text-color-primary);
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .multiplot-container {
    flex-direction: column;
  }
  
  .legend-panel {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid var(--el-border-color-light);
  }
  
  .legend-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .multiplot-toolbar {
    gap: 4px;
    padding: 6px 8px;
  }
  
  .curve-stats {
    font-size: 11px;
  }
  
  .legend-content {
    grid-template-columns: 1fr;
  }
}
</style>
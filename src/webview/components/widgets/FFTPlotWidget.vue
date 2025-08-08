<!--
FFT频谱分析组件 - 基于Serial-Studio FFTPlot.qml和FFTPlot.cpp实现
使用Chart.js和fft.js实现实时频谱分析和可视化
-->
<template>
  <BaseWidget 
    :widget-type="WidgetType.FFT"
    :title="widgetTitle"
    :datasets="datasets"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
  >
    <!-- FFT工具栏 -->
    <template #toolbar>
      <div class="fft-toolbar">
        <!-- 区域填充开关 -->
        <el-button
          size="small"
          :type="showAreaUnderPlot ? 'primary' : 'default'"
          @click="toggleAreaDisplay"
          title="显示频谱下方区域"
        >
          <el-icon><TrendCharts /></el-icon>
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

        <!-- 窗函数选择 -->
        <el-select
          v-model="windowFunction"
          size="small"
          style="width: 100px;"
          @change="changeWindowFunction"
        >
          <el-option label="矩形" value="rectangular" />
          <el-option label="汉宁" value="hann" />
          <el-option label="汉明" value="hamming" />
          <el-option label="布莱克曼" value="blackman" />
        </el-select>

        <!-- FFT参数显示 -->
        <div v-if="showFFTInfo" class="fft-info">
          <span>{{ fftSize }}点</span>
          <span>{{ samplingRate }}Hz</span>
        </div>
      </div>
    </template>

    <!-- 频谱图表容器 -->
    <div class="fft-plot-container">
      <canvas
        ref="chartCanvas"
        class="fft-canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @wheel="handleWheel"
        @mouseleave="handleMouseLeave"
      />

      <!-- 频率信息面板 -->
      <div v-if="showFreqInfo" class="freq-info-panel">
        <div class="freq-item">
          <span class="label">峰值频率:</span>
          <span class="value">{{ formatFrequency(peakFrequency) }}</span>
        </div>
        <div class="freq-item">
          <span class="label">峰值幅度:</span>
          <span class="value">{{ formatMagnitude(peakMagnitude) }}</span>
        </div>
        <div class="freq-item">
          <span class="label">频率范围:</span>
          <span class="value">{{ formatFrequency(0) }} - {{ formatFrequency(maxFrequency) }}</span>
        </div>
        <div class="freq-item">
          <span class="label">频率分辨率:</span>
          <span class="value">{{ formatFrequency(frequencyResolution) }}</span>
        </div>
      </div>

      <!-- 鼠标位置信息 -->
      <div v-if="showCrosshairs && mousePosition" class="mouse-info">
        <span>{{ formatFrequency(mousePosition.freq) }}</span>
        <span>{{ formatMagnitude(mousePosition.mag) }}</span>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { 
  ElButton, 
  ElSelect, 
  ElOption, 
  ElIcon, 
  ElDivider 
} from 'element-plus'
import { 
  TrendCharts, 
  Aim, 
  VideoPlay, 
  VideoPause, 
  RefreshRight 
} from '@element-plus/icons-vue'
// @ts-ignore
import FFT from 'fft.js'

import BaseWidget from '../base/BaseWidget.vue'
import { WidgetType, Dataset } from '@/shared/types'
import { useDataStore } from '@/webview/stores/data'
import { useThemeStore } from '@/webview/stores/theme'

// Props定义
interface Props {
  datasets: Dataset[]
  widgetTitle?: string
  canvasWidth?: number
  canvasHeight?: number
  showFreqInfo?: boolean
  showFFTInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  widgetTitle: 'FFT频谱分析',
  canvasWidth: 800,
  canvasHeight: 400,
  showFreqInfo: true,
  showFFTInfo: true
})

// Emits定义
const emit = defineEmits<{
  refresh: []
  settings: []
  export: [data: any]
  frequencyDetected: [freq: number, magnitude: number]
}>()

// 存储引用
const dataStore = useDataStore()
const themeStore = useThemeStore()

// DOM引用
const chartCanvas = ref<HTMLCanvasElement>()
const canvasContext = ref<CanvasRenderingContext2D>()

// FFT计算状态
const fft = ref<any>()
const fftSize = ref(1024)
const samplingRate = ref(44100) // 默认采样率
const windowFunction = ref<'rectangular' | 'hann' | 'hamming' | 'blackman'>('hann')

// 可视化状态
const showAreaUnderPlot = ref(false)
const showXLabels = ref(true)
const showYLabels = ref(true)
const showCrosshairs = ref(false)
const isPaused = ref(false)
const isZoomed = ref(false)

// 数据缓冲区
const timeData = ref<number[]>([])
const frequencyData = ref<number[]>([])
const magnitudeData = ref<number[]>([])

// 频谱分析结果
const peakFrequency = ref(0)
const peakMagnitude = ref(-100)
const maxFrequency = computed(() => samplingRate.value / 2) // Nyquist频率
const frequencyResolution = computed(() => samplingRate.value / fftSize.value)

// 图表范围
const minX = ref(0)
const maxX = computed(() => maxFrequency.value)
const minY = ref(-100)
const maxY = ref(0)

// 鼠标交互
const mousePosition = ref<{ freq: number; mag: number } | null>(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 缩放和平移
const zoomLevel = ref(1)
const panOffset = ref({ x: 0, y: 0 })

// 性能监控
const lastUpdateTime = ref(0)
const fftCalculationTime = ref(0)

// 计算属性
const widgetTitle = computed(() => props.widgetTitle || 'FFT频谱分析')

// 初始化FFT分析器
const initializeFFT = () => {
  fft.value = new FFT(fftSize.value)
  
  // 初始化数据缓冲区
  timeData.value = new Array(fftSize.value).fill(0)
  frequencyData.value = new Array(fftSize.value).fill(0)
  magnitudeData.value = new Array(fftSize.value / 2).fill(-100)
  
  console.log(`FFT分析器初始化完成: ${fftSize.value}点, ${samplingRate.value}Hz`)
}

// 初始化Canvas
const initializeCanvas = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  canvasContext.value = ctx
  
  // 设置画布样式
  ctx.imageSmoothingEnabled = true
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  console.log('Canvas初始化完成')
}

// 应用窗函数
const applyWindowFunction = (data: number[]): number[] => {
  const windowed = [...data]
  const N = windowed.length
  
  switch (windowFunction.value) {
    case 'hann':
      for (let i = 0; i < N; i++) {
        const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)))
        windowed[i] *= window
      }
      break
      
    case 'hamming':
      for (let i = 0; i < N; i++) {
        const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1))
        windowed[i] *= window
      }
      break
      
    case 'blackman':
      for (let i = 0; i < N; i++) {
        const window = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)) + 
                      0.08 * Math.cos(4 * Math.PI * i / (N - 1))
        windowed[i] *= window
      }
      break
      
    case 'rectangular':
    default:
      // 不应用窗函数
      break
  }
  
  return windowed
}

// 执行FFT计算
const performFFT = (inputData: number[]) => {
  if (!fft.value || inputData.length < fftSize.value) return

  const startTime = performance.now()
  
  // 准备输入数据
  const input = inputData.slice(-fftSize.value)
  
  // 应用窗函数
  const windowedData = applyWindowFunction(input)
  
  // 复数输入 (实部, 虚部)
  const complexInput = new Array(fftSize.value * 2)
  for (let i = 0; i < fftSize.value; i++) {
    complexInput[i * 2] = windowedData[i]      // 实部
    complexInput[i * 2 + 1] = 0                // 虚部
  }
  
  // 执行FFT
  const complexOutput = new Array(fftSize.value * 2)
  fft.value.realTransform(complexOutput, complexInput)
  
  // 计算幅度谱
  const halfSize = fftSize.value / 2
  magnitudeData.value = new Array(halfSize)
  
  let peakIdx = 0
  let peakVal = -Infinity
  
  for (let i = 0; i < halfSize; i++) {
    const real = complexOutput[i * 2]
    const imag = complexOutput[i * 2 + 1]
    const magnitude = Math.sqrt(real * real + imag * imag)
    
    // 转换为dB
    const magnitudeDB = magnitude > 1e-12 ? 20 * Math.log10(magnitude) : -100
    magnitudeData.value[i] = magnitudeDB
    
    // 查找峰值
    if (magnitudeDB > peakVal && i > 0) { // 跳过DC分量
      peakVal = magnitudeDB
      peakIdx = i
    }
  }
  
  // 更新峰值信息
  peakMagnitude.value = peakVal
  peakFrequency.value = (peakIdx * samplingRate.value) / fftSize.value
  
  // 记录计算时间
  fftCalculationTime.value = performance.now() - startTime
}

// 绘制频谱图
const drawSpectrum = () => {
  if (!canvasContext.value || !chartCanvas.value) return

  const ctx = canvasContext.value
  const canvas = chartCanvas.value
  const width = canvas.width
  const height = canvas.height
  
  // 清除画布
  ctx.clearRect(0, 0, width, height)
  
  // 设置背景色
  ctx.fillStyle = themeStore.isDark ? '#1a1a1a' : '#ffffff'
  ctx.fillRect(0, 0, width, height)
  
  // 绘制网格
  drawGrid(ctx, width, height)
  
  // 绘制频谱曲线
  drawSpectrumCurve(ctx, width, height)
  
  // 绘制区域填充（如果启用）
  if (showAreaUnderPlot.value) {
    drawSpectrumArea(ctx, width, height)
  }
  
  // 绘制十字线（如果启用）
  if (showCrosshairs.value && mousePosition.value) {
    drawCrosshairs(ctx, width, height)
  }
  
  // 绘制坐标轴标签
  drawAxisLabels(ctx, width, height)
}

// 绘制网格
const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = themeStore.isDark ? '#333333' : '#e0e0e0'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 2])
  
  // 垂直网格线（频率）
  const freqStep = maxFrequency.value / 10
  for (let i = 1; i < 10; i++) {
    const x = (i * freqStep / maxFrequency.value) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  // 水平网格线（幅度）
  const magStep = (maxY.value - minY.value) / 10
  for (let i = 1; i < 10; i++) {
    const y = height - ((i * magStep) / (maxY.value - minY.value)) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  ctx.setLineDash([])
}

// 绘制频谱曲线
const drawSpectrumCurve = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (magnitudeData.value.length === 0) return
  
  ctx.strokeStyle = '#3388ff'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const dataLength = magnitudeData.value.length
  
  for (let i = 0; i < dataLength; i++) {
    const freq = (i * samplingRate.value) / fftSize.value
    const magnitude = magnitudeData.value[i]
    
    const x = (freq / maxFrequency.value) * width
    const y = height - ((magnitude - minY.value) / (maxY.value - minY.value)) * height
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.stroke()
}

// 绘制频谱区域填充
const drawSpectrumArea = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (magnitudeData.value.length === 0) return
  
  ctx.fillStyle = 'rgba(51, 136, 255, 0.2)'
  ctx.beginPath()
  
  const dataLength = magnitudeData.value.length
  
  // 起始点（底部）
  ctx.moveTo(0, height)
  
  // 频谱曲线
  for (let i = 0; i < dataLength; i++) {
    const freq = (i * samplingRate.value) / fftSize.value
    const magnitude = magnitudeData.value[i]
    
    const x = (freq / maxFrequency.value) * width
    const y = height - ((magnitude - minY.value) / (maxY.value - minY.value)) * height
    
    ctx.lineTo(x, y)
  }
  
  // 结束点（底部）
  ctx.lineTo(width, height)
  ctx.closePath()
  ctx.fill()
}

// 绘制十字线
const drawCrosshairs = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (!mousePosition.value) return
  
  const x = (mousePosition.value.freq / maxFrequency.value) * width
  const y = height - ((mousePosition.value.mag - minY.value) / (maxY.value - minY.value)) * height
  
  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 1
  ctx.setLineDash([5, 5])
  
  // 垂直线
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, height)
  ctx.stroke()
  
  // 水平线
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(width, y)
  ctx.stroke()
  
  ctx.setLineDash([])
}

// 绘制坐标轴标签
const drawAxisLabels = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.fillStyle = themeStore.isDark ? '#ffffff' : '#333333'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  
  // X轴标签（频率）
  if (showXLabels.value) {
    const freqStep = maxFrequency.value / 10
    for (let i = 0; i <= 10; i++) {
      const freq = i * freqStep
      const x = (freq / maxFrequency.value) * width
      ctx.fillText(formatFrequency(freq), x, height - 5)
    }
  }
  
  // Y轴标签（幅度）
  if (showYLabels.value) {
    ctx.textAlign = 'right'
    const magStep = (maxY.value - minY.value) / 10
    for (let i = 0; i <= 10; i++) {
      const magnitude = minY.value + i * magStep
      const y = height - ((magnitude - minY.value) / (maxY.value - minY.value)) * height
      ctx.fillText(formatMagnitude(magnitude), width - 5, y + 4)
    }
  }
}

// 处理新的时域数据
const processTimeData = (newData: number[]) => {
  if (isPaused.value) return
  
  // 添加新数据到缓冲区
  timeData.value.push(...newData)
  
  // 保持缓冲区大小
  if (timeData.value.length > fftSize.value * 2) {
    timeData.value = timeData.value.slice(-fftSize.value * 2)
  }
  
  // 如果有足够的数据，执行FFT
  if (timeData.value.length >= fftSize.value) {
    performFFT(timeData.value)
    drawSpectrum()
    
    // 发送频率检测事件
    emit('frequencyDetected', peakFrequency.value, peakMagnitude.value)
  }
}

// 工具栏事件处理
const toggleAreaDisplay = () => {
  showAreaUnderPlot.value = !showAreaUnderPlot.value
  drawSpectrum()
}

const toggleXLabels = () => {
  showXLabels.value = !showXLabels.value
  drawSpectrum()
}

const toggleYLabels = () => {
  showYLabels.value = !showYLabels.value
  drawSpectrum()
}

const toggleCrosshairs = () => {
  showCrosshairs.value = !showCrosshairs.value
  if (!showCrosshairs.value) {
    mousePosition.value = null
  }
  drawSpectrum()
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const resetZoom = () => {
  zoomLevel.value = 1
  panOffset.value = { x: 0, y: 0 }
  isZoomed.value = false
  drawSpectrum()
}

const changeWindowFunction = (newFunction: string) => {
  windowFunction.value = newFunction as any
  // 重新计算当前数据的FFT
  if (timeData.value.length >= fftSize.value) {
    performFFT(timeData.value)
    drawSpectrum()
  }
}

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragStart.value = { x: event.offsetX, y: event.offsetY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!chartCanvas.value) return
  
  const rect = chartCanvas.value.getBoundingClientRect()
  const x = event.offsetX
  const y = event.offsetY
  
  // 更新鼠标位置信息
  if (showCrosshairs.value) {
    const freq = (x / chartCanvas.value.width) * maxFrequency.value
    const mag = minY.value + (1 - y / chartCanvas.value.height) * (maxY.value - minY.value)
    
    mousePosition.value = { freq, mag }
    drawSpectrum()
  }
  
  // 处理拖拽
  if (isDragging.value) {
    const deltaX = x - dragStart.value.x
    const deltaY = y - dragStart.value.y
    
    panOffset.value.x += deltaX
    panOffset.value.y += deltaY
    
    dragStart.value = { x, y }
    isZoomed.value = true
    drawSpectrum()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value *= zoomFactor
  isZoomed.value = zoomLevel.value !== 1
  
  drawSpectrum()
}

const handleMouseLeave = () => {
  isDragging.value = false
  if (!showCrosshairs.value) {
    mousePosition.value = null
    drawSpectrum()
  }
}

// Widget事件处理
const handleRefresh = () => {
  timeData.value = []
  magnitudeData.value = new Array(fftSize.value / 2).fill(-100)
  peakFrequency.value = 0
  peakMagnitude.value = -100
  drawSpectrum()
  emit('refresh')
}

const handleSettings = () => {
  emit('settings')
}

const handleExport = () => {
  const exportData = {
    frequencyData: magnitudeData.value,
    peakFrequency: peakFrequency.value,
    peakMagnitude: peakMagnitude.value,
    fftSize: fftSize.value,
    samplingRate: samplingRate.value,
    windowFunction: windowFunction.value
  }
  
  emit('export', exportData)
}

// 工具函数
const formatFrequency = (freq: number): string => {
  if (freq >= 1000) {
    return `${(freq / 1000).toFixed(1)}k`
  }
  return `${freq.toFixed(0)}`
}

const formatMagnitude = (mag: number): string => {
  return `${mag.toFixed(1)}dB`
}

// 监听数据变化
watch(
  () => dataStore.currentFrame,
  (newFrame) => {
    if (newFrame?.groups) {
      // 查找FFT数据组
      const fftGroup = newFrame.groups.find(group => 
        group.widget === 'fft' || group.title.toLowerCase().includes('fft')
      )

      if (fftGroup?.datasets && fftGroup.datasets.length > 0) {
        // 处理单个数据点
        const dataset = fftGroup.datasets[0]
        if (dataset?.value !== undefined) {
          const value = parseFloat(dataset.value.toString())
          if (!isNaN(value)) {
            processTimeData([value])
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
  initializeFFT()
  initializeCanvas()
  drawSpectrum()
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style scoped>
.fft-toolbar {
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

.fft-info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  font-family: monospace;
  color: var(--el-text-color-regular);
}

.fft-plot-container {
  position: relative;
  height: 100%;
  background: var(--el-bg-color);
  overflow: hidden;
}

.fft-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  user-select: none;
}

.freq-info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  backdrop-filter: blur(4px);
  min-width: 160px;
}

.freq-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.freq-item:last-child {
  margin-bottom: 0;
}

.freq-item .label {
  font-weight: 500;
  color: #cccccc;
}

.freq-item .value {
  font-weight: bold;
  color: #ffffff;
}

.mouse-info {
  position: absolute;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  pointer-events: none;
  display: flex;
  gap: 8px;
  transform: translate(-50%, -100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fft-toolbar {
    gap: 4px;
    padding: 6px 8px;
  }
  
  .freq-info-panel {
    position: static;
    margin: 8px;
    width: auto;
  }
  
  .fft-info {
    font-size: 11px;
  }
}
</style>
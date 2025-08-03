<!--
  RealtimeChart - 实时性能图表组件
  用于显示性能指标的实时趋势图，支持多条数据线和滚动更新
-->

<template>
  <div class="realtime-chart" ref="containerRef">
    <div class="chart-header" v-if="showHeader">
      <div class="chart-title">
        <span>{{ title }}</span>
        <el-tag v-if="showStatus" :type="statusType" size="small">
          {{ statusText }}
        </el-tag>
      </div>
      
      <div class="chart-controls">
        <el-button-group size="small">
          <el-tooltip content="暂停/恢复" placement="bottom">
            <el-button 
              :icon="isPaused ? VideoPlay : VideoPause"
              @click="togglePause"
            />
          </el-tooltip>
          
          <el-tooltip content="重置缩放" placement="bottom">
            <el-button 
              icon="Aim"
              @click="resetZoom"
            />
          </el-tooltip>
          
          <el-tooltip content="清除数据" placement="bottom">
            <el-button 
              icon="Delete"
              @click="clearData"
            />
          </el-tooltip>
        </el-button-group>
        
        <el-select 
          v-model="timeRange" 
          size="small" 
          style="width: 100px; margin-left: 8px"
          @change="updateTimeRange"
        >
          <el-option label="30s" :value="30" />
          <el-option label="1min" :value="60" />
          <el-option label="5min" :value="300" />
          <el-option label="10min" :value="600" />
        </el-select>
      </div>
    </div>
    
    <div class="chart-container" :style="containerStyle">
      <canvas 
        ref="chartRef"
        :width="canvasWidth"
        :height="canvasHeight"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
      />
      
      <!-- 工具提示 -->
      <div 
        v-if="tooltip.visible"
        class="chart-tooltip"
        :style="tooltipStyle"
      >
        <div class="tooltip-time">{{ formatTime(tooltip.time) }}</div>
        <div 
          v-for="item in tooltip.data" 
          :key="item.name"
          class="tooltip-item"
        >
          <div 
            class="tooltip-color" 
            :style="{ backgroundColor: item.color }"
          />
          <span class="tooltip-name">{{ item.name }}:</span>
          <span class="tooltip-value">{{ formatValue(item.value, item.unit) }}</span>
        </div>
      </div>
      
      <!-- 图例 -->
      <div v-if="showLegend" class="chart-legend">
        <div 
          v-for="series in seriesConfig" 
          :key="series.name"
          class="legend-item"
          :class="{ disabled: series.hidden }"
          @click="toggleSeries(series.name)"
        >
          <div 
            class="legend-color" 
            :style="{ backgroundColor: series.color }"
          />
          <span class="legend-name">{{ series.name }}</span>
          <span class="legend-value">{{ formatValue(getLastValue(series.name), series.unit) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  watch,
  nextTick,
  CSSProperties
} from 'vue';
import { VideoPlay, VideoPause } from '@element-plus/icons-vue';

// 数据点接口
interface DataPoint {
  timestamp: number;
  value: number;
}

// 数据系列配置
interface SeriesConfig {
  name: string;
  color: string;
  unit?: string;
  min?: number;
  max?: number;
  hidden?: boolean;
  lineWidth?: number;
  fillAlpha?: number;
}

// 工具提示数据
interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  time: number;
  data: Array<{
    name: string;
    value: number;
    color: string;
    unit?: string;
  }>;
}

// Props 定义
interface Props {
  title?: string;
  data: Map<string, DataPoint[]>;
  seriesConfig: SeriesConfig[];
  width?: number;
  height?: number;
  showHeader?: boolean;
  showLegend?: boolean;
  showStatus?: boolean;
  showGrid?: boolean;
  autoScale?: boolean;
  smoothCurves?: boolean;
  maxDataPoints?: number;
  updateInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: '实时图表',
  width: 600,
  height: 300,
  showHeader: true,
  showLegend: true,
  showStatus: false,
  showGrid: true,
  autoScale: true,
  smoothCurves: true,
  maxDataPoints: 1000,
  updateInterval: 1000
});

// Emits 定义
const emit = defineEmits<{
  'pause-changed': [isPaused: boolean];
  'zoom-changed': [range: { startTime: number; endTime: number }];
  'series-toggled': [seriesName: string, visible: boolean];
}>();

// 响应式状态
const containerRef = ref<HTMLDivElement>();
const chartRef = ref<HTMLCanvasElement>();
const isPaused = ref(false);
const timeRange = ref(60); // 默认显示1分钟
const canvasWidth = ref(props.width);
const canvasHeight = ref(props.height);

// 缩放和平移状态
const zoomLevel = ref(1);
const panOffset = ref(0);
const isDragging = ref(false);
const lastMouseX = ref(0);

// 工具提示状态
const tooltip = ref<TooltipData>({
  visible: false,
  x: 0,
  y: 0,
  time: 0,
  data: []
});

// 渲染上下文
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number | null = null;

// 计算属性
const containerStyle = computed((): CSSProperties => ({
  position: 'relative',
  width: `${canvasWidth.value}px`,
  height: `${canvasHeight.value}px`
}));

const tooltipStyle = computed((): CSSProperties => ({
  left: `${tooltip.value.x + 10}px`,
  top: `${tooltip.value.y - 10}px`
}));

const statusType = computed(() => {
  // TODO: 基于数据状态返回类型
  return 'success';
});

const statusText = computed(() => {
  if (isPaused.value) return '已暂停';
  
  const totalPoints = Array.from(props.data.values())
    .reduce((sum, points) => sum + points.length, 0);
  
  return `${totalPoints} 数据点`;
});

// 方法
const initCanvas = () => {
  if (!chartRef.value) return;
  
  ctx = chartRef.value.getContext('2d');
  if (!ctx) return;
  
  // 设置高DPI支持
  const ratio = window.devicePixelRatio || 1;
  const rect = chartRef.value.getBoundingClientRect();
  
  chartRef.value.width = rect.width * ratio;
  chartRef.value.height = rect.height * ratio;
  
  ctx.scale(ratio, ratio);
  
  canvasWidth.value = rect.width;
  canvasHeight.value = rect.height;
};

const startAnimation = () => {
  if (animationFrameId) return;
  
  const animate = () => {
    if (!isPaused.value) {
      drawChart();
    }
    animationFrameId = requestAnimationFrame(animate);
  };
  
  animationFrameId = requestAnimationFrame(animate);
};

const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const drawChart = () => {
  if (!ctx) return;
  
  const width = canvasWidth.value;
  const height = canvasHeight.value;
  
  // 清空画布
  ctx.clearRect(0, 0, width, height);
  
  // 绘制背景
  drawBackground();
  
  // 绘制网格
  if (props.showGrid) {
    drawGrid();
  }
  
  // 绘制数据线
  drawDataSeries();
  
  // 绘制坐标轴
  drawAxes();
};

const drawBackground = () => {
  if (!ctx) return;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
};

const drawGrid = () => {
  if (!ctx) return;
  
  const width = canvasWidth.value;
  const height = canvasHeight.value;
  
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.lineWidth = 1;
  
  // 垂直网格线
  const gridLines = 10;
  for (let i = 0; i <= gridLines; i++) {
    const x = (width / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // 水平网格线
  for (let i = 0; i <= gridLines; i++) {
    const y = (height / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawDataSeries = () => {
  if (!ctx) return;
  
  const now = Date.now();
  const timeWindow = timeRange.value * 1000; // 转换为毫秒
  const startTime = now - timeWindow + panOffset.value;
  const endTime = now + panOffset.value;
  
  for (const series of props.seriesConfig) {
    if (series.hidden) continue;
    
    const data = props.data.get(series.name) || [];
    if (data.length === 0) continue;
    
    // 过滤时间窗口内的数据
    const visibleData = data.filter(point => 
      point.timestamp >= startTime && point.timestamp <= endTime
    );
    
    if (visibleData.length < 2) continue;
    
    drawSeries(visibleData, series, startTime, endTime);
  }
};

const drawSeries = (
  data: DataPoint[], 
  series: SeriesConfig, 
  startTime: number, 
  endTime: number
) => {
  if (!ctx) return;
  
  const width = canvasWidth.value;
  const height = canvasHeight.value;
  const padding = 40; // 边距
  
  // 计算数据范围
  const values = data.map(p => p.value);
  const minValue = series.min ?? Math.min(...values);
  const maxValue = series.max ?? Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  
  // 设置绘制样式
  ctx.strokeStyle = series.color;
  ctx.lineWidth = series.lineWidth || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // 绘制数据线
  ctx.beginPath();
  
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    
    // 计算坐标
    const x = padding + ((point.timestamp - startTime) / (endTime - startTime)) * (width - 2 * padding);
    const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding);
    
    if (props.smoothCurves && i > 0) {
      // 使用贝塞尔曲线平滑
      const prevPoint = data[i - 1];
      const prevX = padding + ((prevPoint.timestamp - startTime) / (endTime - startTime)) * (width - 2 * padding);
      const prevY = height - padding - ((prevPoint.value - minValue) / valueRange) * (height - 2 * padding);
      
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(cpX, prevY, x, y);
    } else {
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
  }
  
  ctx.stroke();
  
  // 填充区域
  if (series.fillAlpha && series.fillAlpha > 0) {
    ctx.globalAlpha = series.fillAlpha;
    ctx.fillStyle = series.color;
    
    // 闭合路径到底部
    const lastPoint = data[data.length - 1];
    const lastX = padding + ((lastPoint.timestamp - startTime) / (endTime - startTime)) * (width - 2 * padding);
    
    ctx.lineTo(lastX, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
};

const drawAxes = () => {
  if (!ctx) return;
  
  const width = canvasWidth.value;
  const height = canvasHeight.value;
  const padding = 40;
  
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  
  // X轴
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Y轴
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();
  
  // 绘制刻度标签
  drawAxisLabels();
};

const drawAxisLabels = () => {
  if (!ctx) return;
  
  const width = canvasWidth.value;
  const height = canvasHeight.value;
  const padding = 40;
  
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  // X轴时间标签
  const now = Date.now();
  const timeWindow = timeRange.value * 1000;
  const startTime = now - timeWindow + panOffset.value;
  
  for (let i = 0; i <= 5; i++) {
    const time = startTime + (timeWindow / 5) * i;
    const x = padding + (width - 2 * padding) * (i / 5);
    
    ctx.fillText(formatAxisTime(time), x, height - 10);
  }
  
  // Y轴数值标签
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  // 使用第一个可见系列的范围
  const visibleSeries = props.seriesConfig.find(s => !s.hidden);
  if (visibleSeries) {
    const data = props.data.get(visibleSeries.name) || [];
    if (data.length > 0) {
      const values = data.map(p => p.value);
      const minValue = visibleSeries.min ?? Math.min(...values);
      const maxValue = visibleSeries.max ?? Math.max(...values);
      
      for (let i = 0; i <= 5; i++) {
        const value = minValue + (maxValue - minValue) * (i / 5);
        const y = height - padding - (height - 2 * padding) * (i / 5);
        
        ctx.fillText(
          formatValue(value, visibleSeries.unit), 
          padding - 10, 
          y
        );
      }
    }
  }
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  emit('pause-changed', isPaused.value);
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panOffset.value = 0;
  emit('zoom-changed', {
    startTime: Date.now() - timeRange.value * 1000,
    endTime: Date.now()
  });
};

const clearData = () => {
  for (const [key] of props.data) {
    props.data.set(key, []);
  }
};

const updateTimeRange = (newRange: number) => {
  timeRange.value = newRange;
  panOffset.value = 0; // 重置平移
};

const toggleSeries = (seriesName: string) => {
  const series = props.seriesConfig.find(s => s.name === seriesName);
  if (series) {
    series.hidden = !series.hidden;
    emit('series-toggled', seriesName, !series.hidden);
  }
};

const getLastValue = (seriesName: string): number => {
  const data = props.data.get(seriesName);
  if (!data || data.length === 0) return 0;
  
  return data[data.length - 1].value;
};

// 鼠标事件处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  
  const delta = event.deltaY > 0 ? 1.1 : 0.9;
  zoomLevel.value = Math.max(0.1, Math.min(10, zoomLevel.value * delta));
};

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  lastMouseX.value = event.clientX;
};

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - lastMouseX.value;
    panOffset.value += deltaX * 10; // 调整平移灵敏度
    lastMouseX.value = event.clientX;
  } else {
    // 更新工具提示
    updateTooltip(event);
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleMouseLeave = () => {
  isDragging.value = false;
  tooltip.value.visible = false;
};

const updateTooltip = (event: MouseEvent) => {
  if (!chartRef.value || isDragging.value) return;
  
  const rect = chartRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 计算对应的时间
  const padding = 40;
  const timePercent = (x - padding) / (canvasWidth.value - 2 * padding);
  const timeWindow = timeRange.value * 1000;
  const time = Date.now() - timeWindow + timeWindow * timePercent + panOffset.value;
  
  // 查找最近的数据点
  const tooltipData: TooltipData['data'] = [];
  
  for (const series of props.seriesConfig) {
    if (series.hidden) continue;
    
    const data = props.data.get(series.name) || [];
    const closestPoint = findClosestPoint(data, time);
    
    if (closestPoint) {
      tooltipData.push({
        name: series.name,
        value: closestPoint.value,
        color: series.color,
        unit: series.unit
      });
    }
  }
  
  tooltip.value = {
    visible: tooltipData.length > 0,
    x,
    y,
    time,
    data: tooltipData
  };
};

const findClosestPoint = (data: DataPoint[], targetTime: number): DataPoint | null => {
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
  
  // 只有在时间差小于阈值时才返回
  return minDiff < 5000 ? closest : null; // 5秒阈值
};

// 格式化工具函数
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

const formatAxisTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.getMinutes().toString().padStart(2, '0') + ':' + 
         date.getSeconds().toString().padStart(2, '0');
};

const formatValue = (value: number, unit?: string): string => {
  const formatted = value.toFixed(1);
  return unit ? `${formatted}${unit}` : formatted;
};

// 生命周期
onMounted(() => {
  initCanvas();
  startAnimation();
  
  // 监听窗口大小变化
  window.addEventListener('resize', initCanvas);
});

onUnmounted(() => {
  stopAnimation();
  window.removeEventListener('resize', initCanvas);
});

// 监听器
watch(() => props.data, () => {
  if (!isPaused.value) {
    nextTick(() => {
      drawChart();
    });
  }
}, { deep: true });

// 暴露方法
defineExpose({
  togglePause,
  resetZoom,
  clearData,
  isPaused: computed(() => isPaused.value),
  drawChart
});
</script>

<style scoped>
.realtime-chart {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-extra-light);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart-container {
  position: relative;
}

.chart-container canvas {
  cursor: crosshair;
}

.chart-tooltip {
  position: absolute;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  min-width: 120px;
}

.tooltip-time {
  font-weight: 500;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0;
}

.tooltip-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.tooltip-name {
  flex: 1;
}

.tooltip-value {
  font-weight: 500;
}

.chart-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.legend-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.legend-item.disabled {
  opacity: 0.5;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-name {
  flex: 1;
}

.legend-value {
  font-weight: 500;
  color: var(--el-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .chart-legend {
    position: static;
    margin-top: 8px;
  }
}
</style>
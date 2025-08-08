<!--
  PlotWidget - 实时数据图表组件
  基于Serial Studio的Plot Widget实现，使用Chart.js进行渲染
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Plot"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="chartData"
    :widget-config="config"
    :is-loading="isLoading"
    :has-error="hasError"
    :error-message="errorMessage"
    :has-data="hasData"
    :last-update="lastUpdate"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
    @resize="handleResize"
    @settings-changed="handleSettingsChanged"
  >
    <!-- 图表工具栏 -->
    <template #toolbar>
      <el-button-group size="small">
        <!-- 暂停/恢复 -->
        <el-tooltip :content="isPaused ? '恢复更新' : '暂停更新'" placement="bottom">
          <el-button 
            :icon="isPaused ? VideoPlay : VideoPause"
            @click="togglePause"
          />
        </el-tooltip>
        
        <!-- 自动缩放 -->
        <el-tooltip content="自动缩放" placement="bottom">
          <el-button 
            icon="Aim"
            @click="autoScale"
          />
        </el-tooltip>
        
        <!-- 清除数据 -->
        <el-tooltip content="清除数据" placement="bottom">
          <el-button 
            icon="Delete"
            @click="clearData"
          />
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要图表内容 -->
    <div class="plot-container" ref="plotContainer">
      <canvas 
        ref="chartCanvas"
        class="plot-canvas"
        @contextmenu.prevent="showContextMenu"
      />
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="plot-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化图表...</span>
      </div>
      
      <!-- 数据信息覆盖层 -->
      <div v-if="showDataInfo" class="data-info-overlay">
        <div class="data-info">
          <div class="info-item">
            <span class="info-label">数据点:</span>
            <span class="info-value">{{ totalDataPoints }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">更新率:</span>
            <span class="info-value">{{ updateRate }} Hz</span>
          </div>
          <div class="info-item">
            <span class="info-label">范围:</span>
            <span class="info-value">{{ yRangeText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="plot-stats">
        点数: {{ totalDataPoints }} | 
        范围: {{ yRangeText }}
      </span>
    </template>
    
    <template #footer-right>
      <span class="plot-rate">
        {{ updateRate }} Hz
      </span>
    </template>
  </BaseWidget>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  watch, 
  nextTick 
} from 'vue';
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { VideoPlay, VideoPause, Loading } from '@element-plus/icons-vue';

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, DataPoint, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';
import { usePerformanceStore } from '../../stores/performance';
import { 
  AdvancedSamplingAlgorithms, 
  createHighFrequencySampler, 
  createPrecisionSampler,
  SamplingConfig 
} from '../../utils/AdvancedSamplingAlgorithms';

// 注册Chart.js组件
Chart.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  realtime?: boolean;
  maxDataPoints?: number;
  updateInterval?: number;
  showPoints?: boolean;
  showFill?: boolean;
  smoothCurves?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  maxDataPoints: 1000,
  updateInterval: 100,
  showPoints: false,
  showFill: false,
  smoothCurves: true
});

// Emits定义
const emit = defineEmits<{
  'data-point-click': [point: DataPoint, datasetIndex: number];
  'zoom-changed': [range: { xMin: number; xMax: number; yMin: number; yMax: number }];
}>();

// 响应式状态
const plotContainer = ref<HTMLDivElement>();
const chartCanvas = ref<HTMLCanvasElement>();
const chart = ref<Chart>();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);
const showDataInfo = ref(false);

// 数据存储
const chartData = ref<{ x: number; y: number }[][]>([]);
const dataLabels = ref<string[]>([]);
const colors = ref<string[]>([]);

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 增量更新优化 - 基于Serial-Studio的24Hz更新策略
const updateQueue = ref<Array<{datasetIndex: number, points: any[]}>>([]);
const updateThrottleTimer = ref<NodeJS.Timeout | null>(null);
const batchUpdateInterval = 42; // 42ms批量更新间隔 (约24Hz，对应Serial-Studio)

// 高频数据处理和智能采样算法
const lastDataPoints = ref<Map<number, {x: number, y: number, timestamp: number}>>(new Map());
const dataPointThreshold = 0.001; // 数据点变化阈值
const timeThreshold = 16; // 16ms时间间隔阈值（约60fps）
const highFrequencyThreshold = 10; // 高频数据阈值（10Hz以上）

// 时间序列流式更新缓冲区 - 模拟Serial-Studio的LineSeries结构
const streamingBuffer = ref<Map<number, {
  buffer: Array<{x: number, y: number}>,
  maxSize: number,
  lastFlush: number,
  sampleRate: number,
  decimationFactor: number
}>>(new Map());

// 数据压缩和采样策略
const compressionConfig = ref({
  enabled: true,
  maxPointsPerSecond: 60, // 最大每秒数据点数
  adaptiveSampling: true, // 自适应采样
  smoothingFactor: 0.1, // 平滑因子
  noiseThreshold: 0.01 // 噪声阈值
});

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 高级采样算法实例
const samplingAlgorithms = ref<Map<number, AdvancedSamplingAlgorithms>>(new Map());
const samplingMode = ref<'high-frequency' | 'precision' | 'custom'>('high-frequency');

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '数据图表');
});

const hasData = computed(() => {
  return chartData.value.some(series => series.length > 0);
});

const totalDataPoints = computed(() => {
  return chartData.value.reduce((total, series) => total + series.length, 0);
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const yRangeText = computed(() => {
  try {
    if (!chart.value || !chart.value.scales || !chart.value.scales.y) return 'N/A';
    
    const yScale = chart.value.scales.y;
    if (yScale && typeof yScale.min !== 'undefined' && typeof yScale.max !== 'undefined') {
      const min = yScale.min?.toFixed(2) || '0';
      const max = yScale.max?.toFixed(2) || '0';
      return `${min} ~ ${max}`;
    }
    
    return 'N/A';
  } catch (error) {
    console.warn('获取Y轴范围时出错:', error);
    return 'N/A';
  }
});

const chartOptions = computed(() => {
  const themeColors = themeStore.getChartColors();
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: props.smoothCurves ? 200 : 0
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: props.datasets.length > 1,
        position: 'top' as const,
        labels: {
          color: themeColors.text,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: themeColors.background,
        titleColor: themeColors.text,
        bodyColor: themeColors.text,
        borderColor: themeColors.grid,
        borderWidth: 1,
        callbacks: {
          title: (tooltipItems: any[]) => {
            if (tooltipItems.length > 0) {
              const point = tooltipItems[0];
              return new Date(point.parsed.x).toLocaleTimeString();
            }
            return '';
          },
          label: (context: any) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y?.toFixed(3) || '';
            const unit = props.datasets[context.datasetIndex]?.unit || '';
            return `${datasetLabel}: ${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            second: 'HH:mm:ss',
            minute: 'HH:mm',
            hour: 'HH:mm'
          }
        },
        grid: {
          display: true,
          color: themeColors.grid
        },
        ticks: {
          color: themeColors.axis,
          maxTicksLimit: 10
        },
        title: {
          display: !!props.config?.xAxis?.label,
          text: props.config?.xAxis?.label || '时间',
          color: themeColors.text
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          display: true,
          color: themeColors.grid
        },
        ticks: {
          color: themeColors.axis,
          callback: function(value: any) {
            return Number(value).toFixed(2);
          }
        },
        title: {
          display: !!props.config?.yAxis?.label,
          text: props.config?.yAxis?.label || '数值',
          color: themeColors.text
        },
        min: props.config?.yAxis?.min,
        max: props.config?.yAxis?.max
      }
    },
    onHover: (event: any, elements: any[]) => {
      chartCanvas.value!.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const pointIndex = element.index;
        const point = chartData.value[datasetIndex][pointIndex];
        
        if (point) {
          emit('data-point-click', {
            x: point.x,
            y: point.y,
            timestamp: point.x
          }, datasetIndex);
        }
      }
    }
  };
});

// 方法
const initializeChart = async () => {
  if (!chartCanvas.value) return;

  try {
    isLoading.value = true;
    
    // 销毁现有图表
    if (chart.value && typeof chart.value.destroy === 'function') {
      try {
        chart.value.destroy();
      } catch (error) {
        console.warn('销毁现有图表时出错:', error);
      }
    }

    // 初始化数据结构
    setupDataStructure();
    
    // 创建新图表
    chart.value = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        datasets: generateChartDatasets()
      },
      options: chartOptions.value
    });

    isLoading.value = false;
    console.log('Plot图表初始化完成');
    
  } catch (error) {
    console.error('初始化图表时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '图表初始化失败';
    isLoading.value = false;
  }
};

const setupDataStructure = () => {
  const datasetCount = Math.max(props.datasets.length, 1);
  
  chartData.value = Array.from({ length: datasetCount }, () => []);
  dataLabels.value = props.datasets.map(ds => ds.title);
  colors.value = generateColors(datasetCount);
};

const generateColors = (count: number): string[] => {
  const defaultColors = [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(defaultColors[i % defaultColors.length]);
  }
  
  return result;
};

const generateChartDatasets = () => {
  return chartData.value.map((data, index) => ({
    label: dataLabels.value[index] || `系列 ${index + 1}`,
    data: data,
    borderColor: colors.value[index],
    backgroundColor: props.showFill 
      ? colors.value[index] + '20' 
      : 'transparent',
    borderWidth: 2,
    pointRadius: props.showPoints ? 3 : 0,
    pointHoverRadius: 5,
    tension: props.smoothCurves ? 0.3 : 0,
    fill: props.showFill
  }));
};

const addDataPoint = (datasetIndex: number, point: DataPoint) => {
  if (isPaused.value || !chart.value) return;
  
  const data = chartData.value[datasetIndex];
  if (!data) return;

  // 智能采样 - 去除重复或相似的数据点
  if (!shouldAddDataPoint(datasetIndex, point)) {
    return;
  }

  // 添加新数据点
  const newPoint = {
    x: point.timestamp,
    y: point.y
  };
  data.push(newPoint);

  // 限制数据点数量
  let pointRemoved = false;
  if (data.length > props.maxDataPoints) {
    data.shift();
    pointRemoved = true;
  }

  // 更新最后数据点记录
  lastDataPoints.value.set(datasetIndex, newPoint);

  // 使用批量更新策略
  addToUpdateQueue(datasetIndex, newPoint);
  
  // 更新统计信息
  lastUpdate.value = Date.now();
  recordFrame();
};

/**
 * 初始化采样算法实例
 * @param datasetIndex 数据集索引
 */
const initializeSamplingAlgorithm = (datasetIndex: number) => {
  if (!samplingAlgorithms.value.has(datasetIndex)) {
    let sampler: AdvancedSamplingAlgorithms;
    
    switch (samplingMode.value) {
      case 'high-frequency':
        sampler = createHighFrequencySampler();
        break;
      case 'precision':
        sampler = createPrecisionSampler();
        break;
      case 'custom':
      default:
        sampler = new AdvancedSamplingAlgorithms({
          maxPointsPerSecond: compressionConfig.value.maxPointsPerSecond,
          adaptiveSampling: compressionConfig.value.adaptiveSampling,
          noiseThreshold: compressionConfig.value.noiseThreshold,
          smoothingFactor: compressionConfig.value.smoothingFactor,
          compressionRatio: 0.6,
          enableLossyCompression: true
        });
        break;
    }
    
    samplingAlgorithms.value.set(datasetIndex, sampler);
  }
};

/**
 * 初始化流式缓冲区 - 基于Serial-Studio的LineSeries设计
 * @param datasetIndex 数据集索引
 */
const initializeStreamingBuffer = (datasetIndex: number) => {
  if (!streamingBuffer.value.has(datasetIndex)) {
    streamingBuffer.value.set(datasetIndex, {
      buffer: [],
      maxSize: props.maxDataPoints || 1000,
      lastFlush: Date.now(),
      sampleRate: 0,
      decimationFactor: 1
    });
  }
};

/**
 * 智能采样算法 - 基于Serial-Studio的数据处理逻辑
 * @param datasetIndex 数据集索引
 * @param point 新数据点
 * @returns 是否应该添加数据点
 */
const shouldAddDataPoint = (datasetIndex: number, point: DataPoint): boolean => {
  const lastPoint = lastDataPoints.value.get(datasetIndex);
  const currentTime = point.timestamp;
  
  if (!lastPoint) {
    // 第一个数据点，必须添加
    lastDataPoints.value.set(datasetIndex, {
      x: point.x,
      y: point.y,
      timestamp: currentTime
    });
    return true;
  }

  const timeDiff = currentTime - lastPoint.timestamp;
  const valueDiff = Math.abs(point.y - lastPoint.y);
  const relativeChange = lastPoint.y !== 0 ? Math.abs(valueDiff / lastPoint.y) : valueDiff;
  
  // 计算采样率 - 模拟Serial-Studio的智能间隔计算
  const instantSampleRate = timeDiff > 0 ? 1000 / timeDiff : 0;
  
  // 高频数据处理策略
  if (instantSampleRate > compressionConfig.value.maxPointsPerSecond) {
    // 高频数据，需要抽稀
    const buffer = streamingBuffer.value.get(datasetIndex);
    if (buffer) {
      buffer.sampleRate = instantSampleRate;
      buffer.decimationFactor = Math.ceil(instantSampleRate / compressionConfig.value.maxPointsPerSecond);
      
      // 只保留抽稀后的数据点
      if (buffer.buffer.length % buffer.decimationFactor !== 0) {
        return false;
      }
    }
  }

  // 自适应采样逻辑
  if (compressionConfig.value.adaptiveSampling) {
    // 时间间隔过短且数值变化小，跳过
    if (timeDiff < timeThreshold && relativeChange < dataPointThreshold) {
      return false;
    }
    
    // 噪声过滤
    if (relativeChange < compressionConfig.value.noiseThreshold && timeDiff < 100) {
      return false;
    }
    
    // 对于快速变化的信号，保留更多数据点
    if (relativeChange > 0.1) { // 10%以上的变化认为是重要信号
      lastDataPoints.value.set(datasetIndex, {
        x: point.x,
        y: point.y,
        timestamp: currentTime
      });
      return true;
    }
  }

  // 基于时间间隔的标准采样
  const shouldAdd = timeDiff >= timeThreshold;
  
  if (shouldAdd) {
    lastDataPoints.value.set(datasetIndex, {
      x: point.x,
      y: point.y,
      timestamp: currentTime
    });
  }
  
  return shouldAdd;
};

/**
 * 高级流式数据处理 - 使用AdvancedSamplingAlgorithms
 * @param datasetIndex 数据集索引
 * @param points 新数据点数组
 */
const processStreamingData = (datasetIndex: number, points: DataPoint[]) => {
  initializeStreamingBuffer(datasetIndex);
  initializeSamplingAlgorithm(datasetIndex);
  
  const buffer = streamingBuffer.value.get(datasetIndex)!;
  const sampler = samplingAlgorithms.value.get(datasetIndex)!;
  
  // 使用高级采样算法处理数据
  const datasetId = `dataset_${datasetIndex}`;
  let sampledPoints = sampler.adaptiveSampling(datasetId, points);
  
  // 如果启用平滑，应用指数平滑
  if (compressionConfig.value.smoothingFactor > 0) {
    sampledPoints = sampler.exponentialSmoothing(datasetId, sampledPoints);
  }
  
  // 转换为图表格式并更新缓冲区
  const processedPoints: Array<{x: number, y: number}> = [];
  
  for (const point of sampledPoints) {
    const processedPoint = {
      x: point.timestamp,
      y: point.y
    };
    
    buffer.buffer.push(processedPoint);
    processedPoints.push(processedPoint);
    
    // 限制缓冲区大小
    if (buffer.buffer.length > buffer.maxSize) {
      buffer.buffer.shift();
    }
  }
  
  // 批量刷新到图表
  if (processedPoints.length > 0) {
    addToUpdateQueue(datasetIndex, processedPoints);
  }
  
  buffer.lastFlush = Date.now();
  
  // 更新采样统计信息
  performanceStore.updateSamplingStats(sampler.getStats());
};

/**
 * 高频数据抽稀处理 - Douglas-Peucker算法
 * @param datasetIndex 数据集索引
 * @param epsilon 容差值
 */
const decimateHighFrequencyData = (datasetIndex: number, epsilon: number = 1.0) => {
  initializeSamplingAlgorithm(datasetIndex);
  
  const data = chartData.value[datasetIndex];
  if (!data || data.length < 3) return;
  
  const sampler = samplingAlgorithms.value.get(datasetIndex)!;
  
  // 转换为采样算法的数据格式
  const inputPoints = data.map(point => ({
    x: point.x,
    y: point.y,
    timestamp: point.x
  }));
  
  // 应用Douglas-Peucker抽稀算法
  const decimatedPoints = sampler.douglasPeuckerDecimation(inputPoints, epsilon);
  
  // 更新图表数据
  chartData.value[datasetIndex] = decimatedPoints.map(point => ({
    x: point.x,
    y: point.y
  }));
  
  // 立即更新图表
  updateChart();
};

/**
 * 智能采样率调整 - 基于数据频率自动调整
 * @param datasetIndex 数据集索引
 */
const adjustSamplingRate = (datasetIndex: number) => {
  const buffer = streamingBuffer.value.get(datasetIndex);
  const sampler = samplingAlgorithms.value.get(datasetIndex);
  
  if (!buffer || !sampler) return;
  
  // 计算当前数据频率
  const currentTime = Date.now();
  const timeWindow = 5000; // 5秒窗口
  const recentPoints = buffer.buffer.filter(point => 
    currentTime - point.x < timeWindow
  );
  
  if (recentPoints.length < 2) return;
  
  const samplingRate = recentPoints.length / (timeWindow / 1000);
  
  // 根据采样率调整算法参数
  let newConfig: Partial<SamplingConfig> = {};
  
  if (samplingRate > 100) {
    // 高频数据，启用激进压缩
    newConfig = {
      maxPointsPerSecond: 60,
      adaptiveSampling: true,
      noiseThreshold: 0.01,
      smoothingFactor: 0.1,
      compressionRatio: 0.3
    };
    samplingMode.value = 'high-frequency';
  } else if (samplingRate < 10) {
    // 低频数据，保持精度
    newConfig = {
      maxPointsPerSecond: 30,
      adaptiveSampling: true,
      noiseThreshold: 0.001,
      smoothingFactor: 0.02,
      compressionRatio: 0.8
    };
    samplingMode.value = 'precision';
  }
  
  sampler.updateConfig(newConfig);
  buffer.sampleRate = samplingRate;
};

/**
 * 添加到更新队列（批量更新策略）- 支持单个点或点数组
 * @param datasetIndex 数据集索引
 * @param points 数据点或数据点数组
 */
const addToUpdateQueue = (datasetIndex: number, points: any | any[]) => {
  // 查找现有的更新项
  let updateItem = updateQueue.value.find(item => item.datasetIndex === datasetIndex);
  
  if (!updateItem) {
    updateItem = { datasetIndex, points: [] };
    updateQueue.value.push(updateItem);
  }
  
  // 支持单个点或点数组
  if (Array.isArray(points)) {
    updateItem.points.push(...points);
  } else {
    updateItem.points.push(points);
  }

  // 启动批量更新定时器 - 使用24Hz频率（42ms间隔）
  if (!updateThrottleTimer.value) {
    updateThrottleTimer.value = setTimeout(() => {
      processBatchUpdate();
    }, batchUpdateInterval);
  }
};

/**
 * 处理批量更新
 */
const processBatchUpdate = () => {
  if (updateQueue.value.length === 0) {
    updateThrottleTimer.value = null;
    return;
  }

  // 执行批量更新
  batchIncrementalUpdate([...updateQueue.value]);
  
  // 清空队列
  updateQueue.value = [];
  updateThrottleTimer.value = null;
};

/**
 * 增量更新图表 - 只更新变化的部分，避免完整重绘
 * @param datasetIndex 数据集索引
 * @param newPoint 新数据点
 * @param pointRemoved 是否移除了旧数据点
 */
const incrementalUpdateChart = (datasetIndex: number, newPoint: any, pointRemoved: boolean) => {
  if (!chart.value || !chart.value.data || !chart.value.data.datasets || isPaused.value) return;

  try {
    const dataset = chart.value.data.datasets[datasetIndex];
    if (!dataset) return;

    // 添加新数据点
    dataset.data.push(newPoint);

    // 如果移除了旧数据点，也从图表数据中移除
    if (pointRemoved && dataset.data.length > props.maxDataPoints) {
      dataset.data.shift();
    }

    // 使用 'none' 模式进行快速更新，不触发动画
    chart.value.update('none');
    
  } catch (error) {
    console.error('增量更新图表时出错:', error);
    // 如果增量更新失败，回退到完整更新
    updateChart();
  }
};

/**
 * 批量增量更新 - 一次性添加多个数据点
 * @param updates 更新数组，每个元素包含datasetIndex和points
 */
const batchIncrementalUpdate = (updates: Array<{datasetIndex: number, points: any[]}>) => {
  if (!chart.value || !chart.value.data || !chart.value.data.datasets || isPaused.value || updates.length === 0) return;

  try {
    let hasUpdates = false;

    for (const update of updates) {
      const dataset = chart.value.data.datasets[update.datasetIndex];
      if (!dataset) continue;

      // 批量添加数据点
      for (const point of update.points) {
        dataset.data.push(point);
        chartData.value[update.datasetIndex].push(point);
      }

      // 限制数据点数量
      while (dataset.data.length > props.maxDataPoints) {
        dataset.data.shift();
        chartData.value[update.datasetIndex].shift();
      }

      hasUpdates = true;
    }

    // 一次性更新图表
    if (hasUpdates) {
      chart.value.update('none');
    }
    
  } catch (error) {
    console.error('批量增量更新图表时出错:', error);
    updateChart();
  }
};

const updateChart = () => {
  if (!chart.value || isPaused.value || typeof chart.value.update !== 'function') return;

  try {
    // 完整更新数据集 - 只在必要时使用
    if (chart.value.data) {
      chart.value.data.datasets = generateChartDatasets();
    }
    
    // 更新图表，使用 'resize' 模式来重新计算布局
    chart.value.update('resize');
    
  } catch (error) {
    console.error('更新图表时出错:', error);
  }
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const autoScale = () => {
  if (!chart.value || typeof chart.value.resetZoom !== 'function') return;
  
  try {
    chart.value.resetZoom();
  } catch (error) {
    console.warn('重置缩放时出错:', error);
  }
};

// 图表渲染缓存机制 - 避免重复渲染相同数据
const renderCache = ref<Map<string, {
  lastRenderHash: string,
  lastRenderTime: number,
  cachedImageData: ImageData | null
}>>(new Map());

/**
 * 计算数据哈希值，用于检测数据变化
 * @param datasetIndex 数据集索引
 * @returns 数据哈希值
 */
const calculateDataHash = (datasetIndex: number): string => {
  const data = chartData.value[datasetIndex];
  if (!data || data.length === 0) return '';
  
  // 简化哈希计算：使用最后几个数据点
  const sampleSize = Math.min(10, data.length);
  const samples = data.slice(-sampleSize);
  
  let hash = '';
  for (const point of samples) {
    hash += `${point.x.toFixed(0)}_${point.y.toFixed(3)}_`;
  }
  
  return hash + data.length;
};

/**
 * 检查是否需要重新渲染
 * @param datasetIndex 数据集索引
 * @returns 是否需要重新渲染
 */
const shouldRerender = (datasetIndex: number): boolean => {
  const key = `dataset_${datasetIndex}`;
  const cache = renderCache.value.get(key);
  const currentHash = calculateDataHash(datasetIndex);
  
  if (!cache) {
    renderCache.value.set(key, {
      lastRenderHash: currentHash,
      lastRenderTime: Date.now(),
      cachedImageData: null
    });
    return true;
  }
  
  const hashChanged = cache.lastRenderHash !== currentHash;
  const timeSinceLastRender = Date.now() - cache.lastRenderTime;
  
  // 强制重渲染条件：数据变化或超过100ms未更新
  if (hashChanged || timeSinceLastRender > 100) {
    cache.lastRenderHash = currentHash;
    cache.lastRenderTime = Date.now();
    return true;
  }
  
  return false;
};

const clearData = () => {
  chartData.value.forEach(data => data.length = 0);
  
  // 清理增量更新相关数据
  updateQueue.value = [];
  lastDataPoints.value.clear();
  streamingBuffer.value.clear();
  renderCache.value.clear();
  
  if (updateThrottleTimer.value) {
    clearTimeout(updateThrottleTimer.value);
    updateThrottleTimer.value = null;
  }
  
  updateChart();
};

const handleRefresh = () => {
  initializeChart();
};

const handleSettings = () => {
  // 设置对话框已在BaseWidget中处理
  console.log('打开设置对话框');
};

const handleExport = () => {
  // 导出对话框已在BaseWidget中处理
  console.log('导出图表数据');
};

const handleResize = (size: { width: number; height: number }) => {
  if (chart.value && typeof chart.value.resize === 'function') {
    try {
      chart.value.resize();
    } catch (error) {
      console.warn('调整图表大小时出错:', error);
    }
  }
};

const handleSettingsChanged = (config: WidgetConfig) => {
  // 应用新配置
  Object.assign(props.config, config);
  initializeChart();
};

const showContextMenu = (event: MouseEvent) => {
  // TODO: 实现右键上下文菜单
  console.log('显示上下文菜单', event);
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  if (props.datasets.length === 0) return;

  setInterval(() => {
    if (!isPaused.value && hasData.value) {
      props.datasets.forEach((dataset, index) => {
        const value = Math.sin(Date.now() / 1000 + index) * 50 + 
                     Math.random() * 20 + index * 25;
        
        addDataPoint(index, {
          x: Date.now(),
          y: value,
          timestamp: Date.now()
        });
      });
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeChart();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  // 清理图表
  if (chart.value && typeof chart.value.destroy === 'function') {
    try {
      chart.value.destroy();
    } catch (error) {
      console.warn('组件卸载时出现错误:', error);
    }
  }
  
  // 清理批量更新定时器
  if (updateThrottleTimer.value) {
    clearTimeout(updateThrottleTimer.value);
    updateThrottleTimer.value = null;
  }
  
  // 清理所有数据和缓存
  updateQueue.value = [];
  lastDataPoints.value.clear();
  streamingBuffer.value.clear();
  renderCache.value.clear();
  
  console.log('PlotWidget: 所有资源已清理完毕');
});

// 监听器
watch(() => props.datasets, () => {
  initializeChart();
}, { deep: true });

watch(() => themeStore.currentTheme, () => {
  if (chart.value && typeof chart.value.update === 'function') {
    try {
      chart.value.options = chartOptions.value;
      chart.value.update();
    } catch (error) {
      console.warn('更新图表主题时出错:', error);
    }
  }
});

// 暴露组件方法
defineExpose({
  addDataPoint,
  clearData,
  autoScale,
  togglePause,
  handleResize,
  handleRefresh,
  handleExport,
  showContextMenu,
  
  // 增量更新方法
  batchIncrementalUpdate,
  processBatchUpdate,
  
  // 新增的流式更新方法（模拟Serial-Studio的hotpathRxFrame）
  processStreamingData,
  initializeStreamingBuffer,
  shouldAddDataPoint,
  
  // 缓存相关方法
  shouldRerender,
  calculateDataHash,
  
  // 计算属性和状态
  chart,
  isPaused,
  isLoading,
  hasError,
  errorMessage,
  lastUpdate,
  totalDataPoints,
  updateRate,
  yRangeText,
  chartOptions,
  
  // 性能监控属性
  lastFrameTime,
  frameCount,
  updateQueue: computed(() => updateQueue.value),
  batchUpdateInterval,
  
  // 流式缓冲区状态
  streamingBuffer: computed(() => streamingBuffer.value),
  compressionConfig: computed(() => compressionConfig.value),
  renderCache: computed(() => renderCache.value),
  
  // 其他属性
  config: props.config,
  getChart: () => chart.value,
  
  // 获取增强的性能统计
  getPerformanceStats: () => ({
    totalDataPoints: totalDataPoints.value,
    updateRate: updateRate.value,
    queueLength: updateQueue.value.length,
    lastFrameTime: lastFrameTime.value,
    frameCount: frameCount.value,
    
    // 新增的流式更新统计
    streamingBufferSizes: Array.from(streamingBuffer.value.entries()).map(([index, buffer]) => ({
      datasetIndex: index,
      bufferSize: buffer.buffer.length,
      sampleRate: buffer.sampleRate,
      decimationFactor: buffer.decimationFactor,
      lastFlush: buffer.lastFlush
    })),
    
    // 缓存统计
    cacheStats: {
      totalCaches: renderCache.value.size,
      cacheHitRatio: renderCache.value.size > 0 ? 
        Array.from(renderCache.value.values()).filter(cache => 
          Date.now() - cache.lastRenderTime < 100
        ).length / renderCache.value.size : 0
    },
    
    // 采样配置
    compressionEnabled: compressionConfig.value.enabled,
    maxPointsPerSecond: compressionConfig.value.maxPointsPerSecond,
    adaptiveSampling: compressionConfig.value.adaptiveSampling
  }),
  
  // 配置更新方法
  updateCompressionConfig: (newConfig: Partial<typeof compressionConfig.value>) => {
    Object.assign(compressionConfig.value, newConfig);
  }
});
</script>

<style scoped>
.plot-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.plot-canvas {
  width: 100% !important;
  height: 100% !important;
}

.plot-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.data-info-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  padding: 8px;
  color: white;
  font-size: 12px;
  pointer-events: none;
}

.data-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.info-label {
  opacity: 0.8;
}

.info-value {
  font-weight: 500;
}

.plot-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.plot-rate {
  font-size: 12px;
  color: var(--el-color-success);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 576px) {
  .data-info-overlay {
    font-size: 11px;
    padding: 6px;
  }
  
  .plot-stats,
  .plot-rate {
    font-size: 11px;
  }
}
</style>
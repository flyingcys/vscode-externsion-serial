<!--
  BarWidget - 条形图组件
  基于Serial Studio的Bar Widget实现，使用Chart.js进行渲染
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Bar"
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
    <!-- 工具栏 -->
    <template #toolbar>
      <el-button-group size="small">
        <!-- 暂停/恢复 -->
        <el-tooltip :content="isPaused ? '恢复更新' : '暂停更新'" placement="bottom">
          <el-button 
            :icon="isPaused ? VideoPlay : VideoPause"
            @click="togglePause"
          />
        </el-tooltip>
        
        <!-- 排序方式 -->
        <el-tooltip content="排序方式" placement="bottom">
          <el-dropdown @command="handleSortChange">
            <el-button icon="Sort">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="none">不排序</el-dropdown-item>
                <el-dropdown-item command="asc">升序</el-dropdown-item>
                <el-dropdown-item command="desc">降序</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- 显示模式 -->
        <el-tooltip content="显示模式" placement="bottom">
          <el-dropdown @command="handleModeChange">
            <el-button icon="Grid">
              <el-icon><Grid /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="vertical">垂直条形</el-dropdown-item>
                <el-dropdown-item command="horizontal">水平条形</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要图表内容 -->
    <div class="bar-container" ref="barContainer">
      <canvas 
        ref="chartCanvas"
        class="bar-canvas"
        @contextmenu.prevent="showContextMenu"
      />
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="bar-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化条形图...</span>
      </div>
      
      <!-- 数据信息覆盖层 -->
      <div v-if="showDataInfo" class="data-info-overlay">
        <div class="data-info">
          <div class="info-item">
            <span class="info-label">数据项:</span>
            <span class="info-value">{{ totalDataItems }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最大值:</span>
            <span class="info-value">{{ maxValue }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最小值:</span>
            <span class="info-value">{{ minValue }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="bar-stats">
        数据项: {{ totalDataItems }} | 
        范围: {{ rangeText }}
      </span>
    </template>
    
    <template #footer-right>
      <span class="bar-update">
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
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { VideoPlay, VideoPause, Loading, ArrowDown, Grid } from '@element-plus/icons-vue';

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, DataPoint, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';
import { usePerformanceStore } from '../../stores/performance';

// 注册Chart.js组件
Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  realtime?: boolean;
  maxDataItems?: number;
  updateInterval?: number;
  orientation?: 'vertical' | 'horizontal';
  sortMode?: 'none' | 'asc' | 'desc';
  showValues?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  maxDataItems: 50,
  updateInterval: 500,
  orientation: 'vertical',
  sortMode: 'none',
  showValues: true
});

// 响应式状态
const barContainer = ref<HTMLDivElement>();
const chartCanvas = ref<HTMLCanvasElement>();
const chart = ref<Chart>();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);
const showDataInfo = ref(false);

// 图表设置
const currentOrientation = ref(props.orientation);
const currentSortMode = ref(props.sortMode);

// 数据存储
const chartData = ref<{ label: string; value: number; unit?: string }[]>([]);
const colors = ref<string[]>([]);

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '条形图');
});

const hasData = computed(() => {
  return chartData.value.length > 0;
});

const totalDataItems = computed(() => {
  return chartData.value.length;
});

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 0;
  return Math.max(...chartData.value.map(item => item.value));
});

const minValue = computed(() => {
  if (chartData.value.length === 0) return 0;
  return Math.min(...chartData.value.map(item => item.value));
});

const rangeText = computed(() => {
  if (chartData.value.length === 0) return 'N/A';
  return `${minValue.value.toFixed(2)} ~ ${maxValue.value.toFixed(2)}`;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const sortedData = computed(() => {
  const data = [...chartData.value];
  
  switch (currentSortMode.value) {
    case 'asc':
      return data.sort((a, b) => a.value - b.value);
    case 'desc':
      return data.sort((a, b) => b.value - a.value);
    default:
      return data;
  }
});

const chartOptions = computed(() => {
  const themeColors = themeStore.getChartColors();
  const isHorizontal = currentOrientation.value === 'horizontal';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: isHorizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: false
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
              return tooltipItems[0].label;
            }
            return '';
          },
          label: (context: any) => {
            const value = context.parsed[isHorizontal ? 'x' : 'y'];
            const unit = sortedData.value[context.dataIndex]?.unit || '';
            return `值: ${value.toFixed(3)} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: themeColors.grid
        },
        ticks: {
          color: themeColors.axis,
          maxRotation: isHorizontal ? 0 : 45
        },
        title: {
          display: !!props.config?.xAxis?.label,
          text: props.config?.xAxis?.label || (isHorizontal ? '数值' : '项目'),
          color: themeColors.text
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: themeColors.grid
        },
        ticks: {
          color: themeColors.axis,
          callback: function(value: any) {
            return isHorizontal ? value : Number(value).toFixed(1);
          }
        },
        title: {
          display: !!props.config?.yAxis?.label,
          text: props.config?.yAxis?.label || (isHorizontal ? '项目' : '数值'),
          color: themeColors.text
        }
      }
    },
    animation: {
      duration: 300
    }
  };
});

// 方法
const initializeChart = async () => {
  if (!chartCanvas.value) return;

  try {
    isLoading.value = true;
    
    // 销毁现有图表
    if (chart.value) {
      chart.value.destroy();
    }

    // 初始化数据结构
    setupDataStructure();
    
    // 创建新图表
    chart.value = new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels: sortedData.value.map(item => item.label),
        datasets: [{
          data: sortedData.value.map(item => item.value),
          backgroundColor: colors.value,
          borderColor: colors.value.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      options: chartOptions.value
    });

    isLoading.value = false;
    console.log('Bar图表初始化完成');
    
  } catch (error) {
    console.error('初始化条形图时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '条形图初始化失败';
    isLoading.value = false;
  }
};

const setupDataStructure = () => {
  // 初始化示例数据
  if (chartData.value.length === 0 && props.datasets.length > 0) {
    chartData.value = props.datasets.map((dataset, index) => ({
      label: dataset.title || `项目${index + 1}`,
      value: Math.random() * 100,
      unit: dataset.unit
    }));
  }
  
  colors.value = generateColors(chartData.value.length);
};

const generateColors = (count: number): string[] => {
  const baseColors = [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
    '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#74b9ff'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const color = baseColors[i % baseColors.length];
    return color + 'cc'; // 添加透明度
  });
};

const updateData = (newData: { label: string; value: number; unit?: string }[]) => {
  if (isPaused.value || !chart.value) return;
  
  chartData.value = newData.slice(0, props.maxDataItems);
  colors.value = generateColors(chartData.value.length);
  
  updateChart();
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const addDataItem = (label: string, value: number, unit?: string) => {
  if (isPaused.value) return;
  
  const existingIndex = chartData.value.findIndex(item => item.label === label);
  
  if (existingIndex >= 0) {
    // 更新现有数据项
    chartData.value[existingIndex].value = value;
    chartData.value[existingIndex].unit = unit;
  } else {
    // 添加新数据项
    chartData.value.push({ label, value, unit });
    
    // 限制数据项数量
    if (chartData.value.length > props.maxDataItems) {
      chartData.value.shift();
    }
  }
  
  colors.value = generateColors(chartData.value.length);
  updateChart();
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const updateChart = () => {
  if (!chart.value || isPaused.value) return;

  try {
    // 确保chart.value.data和datasets存在
    if (!chart.value.data || !chart.value.data.datasets || !chart.value.data.datasets[0]) {
      return;
    }
    
    // 更新数据
    chart.value.data.labels = sortedData.value.map(item => item.label);
    chart.value.data.datasets[0].data = sortedData.value.map(item => item.value);
    chart.value.data.datasets[0].backgroundColor = colors.value;
    chart.value.data.datasets[0].borderColor = colors.value.map(color => color.replace('cc', 'ff'));
    
    // 更新图表
    chart.value.update('none');
    
  } catch (error) {
    console.error('更新条形图时出错:', error);
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

const handleSortChange = (command: string) => {
  currentSortMode.value = command as 'none' | 'asc' | 'desc';
  updateChart();
};

const handleModeChange = (command: string) => {
  currentOrientation.value = command as 'vertical' | 'horizontal';
  initializeChart();
};

const handleRefresh = () => {
  initializeChart();
};

const handleSettings = () => {
  console.log('打开条形图设置对话框');
};

const handleExport = () => {
  console.log('导出条形图数据');
};

const handleResize = (size: { width: number; height: number }) => {
  if (chart.value) {
    chart.value.resize();
  }
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeChart();
};

const showContextMenu = (event: MouseEvent) => {
  console.log('显示条形图上下文菜单', event);
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  setInterval(() => {
    if (!isPaused.value && props.realtime && chart.value) {
      // 更新现有数据项的值
      chartData.value.forEach(item => {
        item.value = Math.max(0, item.value + (Math.random() - 0.5) * 20);
      });
      
      updateChart();
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
  if (chart.value) {
    chart.value.destroy();
  }
});

// 监听器
watch(() => props.datasets, () => {
  initializeChart();
}, { deep: true });

watch(() => themeStore.currentTheme, () => {
  if (chart.value) {
    chart.value.options = chartOptions.value;
    chart.value.update();
  }
});

// 暴露组件方法
defineExpose({
  addDataItem,
  updateData,
  togglePause,
  getChart: () => chart.value
});
</script>

<style scoped>
.bar-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.bar-canvas {
  width: 100% !important;
  height: 100% !important;
}

.bar-loading {
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

.bar-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.bar-update {
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
  
  .bar-stats,
  .bar-update {
    font-size: 11px;
  }
}
</style>
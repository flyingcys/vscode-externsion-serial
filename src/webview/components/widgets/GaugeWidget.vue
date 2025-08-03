<!--
  GaugeWidget - 仪表盘组件
  基于Serial Studio的Gauge Widget实现，使用SVG绘制圆形仪表盘
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Gauge"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="currentValue"
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
    <!-- 仪表盘工具栏 -->
    <template #toolbar>
      <el-button-group size="small">
        <!-- 重置峰值 -->
        <el-tooltip content="重置峰值" placement="bottom">
          <el-button 
            icon="RefreshLeft"
            @click="resetPeakValues"
          />
        </el-tooltip>
        
        <!-- 显示/隐藏标签 -->
        <el-tooltip :content="showLabels ? '隐藏标签' : '显示标签'" placement="bottom">
          <el-button 
            icon="View"
            @click="toggleLabels"
            :type="showLabels ? 'primary' : 'default'"
          />
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要仪表盘内容 -->
    <div class="gauge-container" ref="gaugeContainer">
      <div class="gauge-wrapper">
        <!-- SVG仪表盘 -->
        <svg 
          class="gauge-svg"
          :width="gaugeSize"
          :height="gaugeSize"
          viewBox="0 0 300 300"
        >
          <!-- 背景圆弧 -->
          <path 
            :d="backgroundArcPath"
            :stroke="themeColors.grid"
            stroke-width="12"
            fill="none"
            stroke-linecap="round"
          />
          
          <!-- 数值圆弧 -->
          <path 
            :d="valueArcPath"
            :stroke="valueColor"
            stroke-width="12"
            fill="none"
            stroke-linecap="round"
            class="value-arc"
            :class="{ 'danger': isDangerValue, 'warning': isWarningValue }"
          />
          
          <!-- 刻度标记 -->
          <g v-if="showTicks">
            <line
              v-for="tick in tickMarks"
              :key="tick.angle"
              :x1="tick.x1"
              :y1="tick.y1"
              :x2="tick.x2"
              :y2="tick.y2"
              :stroke="themeColors.axis"
              :stroke-width="tick.major ? 2 : 1"
            />
          </g>
          
          <!-- 刻度标签 -->
          <g v-if="showLabels">
            <text
              v-for="label in tickLabels"
              :key="label.value"
              :x="label.x"
              :y="label.y"
              :fill="themeColors.text"
              class="tick-label"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ label.text }}
            </text>
          </g>
          
          <!-- 指针 -->
          <g v-if="showPointer">
            <!-- 指针阴影 -->
            <line
              :x1="150"
              :y1="150"
              :x2="pointerEnd.x + 1"
              :y2="pointerEnd.y + 1"
              stroke="rgba(0,0,0,0.3)"
              stroke-width="3"
              stroke-linecap="round"
            />
            
            <!-- 指针主体 -->
            <line
              :x1="150"
              :y1="150"
              :x2="pointerEnd.x"
              :y2="pointerEnd.y"
              :stroke="pointerColor"
              stroke-width="3"
              stroke-linecap="round"
              class="gauge-pointer"
            />
            
            <!-- 中心圆点 -->
            <circle
              cx="150"
              cy="150"
              r="8"
              :fill="pointerColor"
              :stroke="themeColors.background"
              stroke-width="2"
            />
          </g>
          
          <!-- 危险区域指示 -->
          <path
            v-if="showDangerZone && dangerValue < maxValue"
            :d="dangerArcPath"
            stroke="#f56c6c"
            stroke-width="4"
            fill="none"
            opacity="0.6"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- 数值显示 -->
        <div class="gauge-center">
          <div class="current-value" :class="valueClass">
            {{ formattedValue }}
          </div>
          <div v-if="unit" class="value-unit">
            {{ unit }}
          </div>
          <div v-if="showPercentage" class="value-percentage">
            {{ percentage }}%
          </div>
        </div>
        
        <!-- 峰值显示 -->
        <div v-if="showPeakValues" class="peak-values">
          <div class="peak-item">
            <span class="peak-label">最大:</span>
            <span class="peak-value max">{{ formattedPeakMax }}</span>
          </div>
          <div class="peak-item">
            <span class="peak-label">最小:</span>
            <span class="peak-value min">{{ formattedPeakMin }}</span>
          </div>
        </div>
      </div>
      
      <!-- 状态指示器 -->
      <div v-if="showStatusLeds" class="status-leds">
        <div 
          class="status-led"
          :class="{ 
            'active': !isDangerValue && !isWarningValue,
            'normal': !isDangerValue && !isWarningValue
          }"
        >
          <span class="led-dot normal-led"></span>
          <span class="led-label">正常</span>
        </div>
        
        <div 
          class="status-led"
          :class="{ 'active': isWarningValue }"
        >
          <span class="led-dot warning-led"></span>
          <span class="led-label">警告</span>
        </div>
        
        <div 
          class="status-led"
          :class="{ 'active': isDangerValue }"
        >
          <span class="led-dot danger-led"></span>
          <span class="led-label">危险</span>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="gauge-stats">
        范围: {{ minValue }} ~ {{ maxValue }} {{ unit }}
      </span>
    </template>
    
    <template #footer-right>
      <span class="gauge-percentage">
        {{ percentage }}%
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

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  minValue?: number;
  maxValue?: number;
  warningValue?: number;
  dangerValue?: number;
  unit?: string;
  showPointer?: boolean;
  showTicks?: boolean;
  showLabels?: boolean;
  showDangerZone?: boolean;
  showPeakValues?: boolean;
  showStatusLeds?: boolean;
  showPercentage?: boolean;
  tickCount?: number;
  animationDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  minValue: 0,
  maxValue: 100,
  warningValue: 70,
  dangerValue: 85,
  unit: '',
  showPointer: true,
  showTicks: true,
  showLabels: true,
  showDangerZone: true,
  showPeakValues: true,
  showStatusLeds: true,
  showPercentage: true,
  tickCount: 6,
  animationDuration: 500
});

// Emits定义
const emit = defineEmits<{
  'value-changed': [value: number];
  'threshold-exceeded': [type: 'warning' | 'danger', value: number];
}>();

// 响应式状态
const gaugeContainer = ref<HTMLDivElement>();
const currentValue = ref(0);
const targetValue = ref(0);
const peakMin = ref(props.maxValue);
const peakMax = ref(props.minValue);
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);
const animationFrame = ref<number>();

// 显示控制
const showLabels = ref(props.showLabels);

// 依赖注入
const themeStore = useThemeStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '仪表盘');
});

const hasData = computed(() => {
  return props.datasets.length > 0;
});

const themeColors = computed(() => themeStore.getChartColors());

const gaugeSize = computed(() => {
  if (!gaugeContainer.value) return 300;
  
  const containerWidth = gaugeContainer.value.clientWidth;
  const containerHeight = gaugeContainer.value.clientHeight;
  const availableSize = Math.min(containerWidth, containerHeight - 80); // 留出空间给状态指示器
  
  return Math.max(200, Math.min(400, availableSize));
});

// 数值格式化
const formattedValue = computed(() => {
  return currentValue.value.toFixed(1);
});

const formattedPeakMax = computed(() => {
  return peakMax.value.toFixed(1);
});

const formattedPeakMin = computed(() => {
  return peakMin.value.toFixed(1);
});

// 百分比计算
const percentage = computed(() => {
  const range = props.maxValue - props.minValue;
  if (range === 0) return 0;
  
  const normalizedValue = currentValue.value - props.minValue;
  return Math.round((normalizedValue / range) * 100);
});

// 状态判断
const isDangerValue = computed(() => {
  return currentValue.value >= props.dangerValue;
});

const isWarningValue = computed(() => {
  return currentValue.value >= props.warningValue && !isDangerValue.value;
});

const valueClass = computed(() => ({
  'danger': isDangerValue.value,
  'warning': isWarningValue.value,
  'normal': !isDangerValue.value && !isWarningValue.value
}));

// 颜色计算
const valueColor = computed(() => {
  if (isDangerValue.value) return '#f56c6c';
  if (isWarningValue.value) return '#e6a23c';
  return '#67c23a';
});

const pointerColor = computed(() => {
  return valueColor.value;
});

// SVG路径计算
const startAngle = -135; // 起始角度
const endAngle = 135;    // 结束角度
const centerX = 150;
const centerY = 150;
const radius = 100;

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const backgroundArcPath = computed(() => {
  return describeArc(centerX, centerY, radius, startAngle, endAngle);
});

const valueArcPath = computed(() => {
  const range = props.maxValue - props.minValue;
  if (range === 0) return '';
  
  const normalizedValue = (currentValue.value - props.minValue) / range;
  const valueAngle = startAngle + (endAngle - startAngle) * normalizedValue;
  
  if (normalizedValue <= 0) return '';
  
  return describeArc(centerX, centerY, radius, startAngle, valueAngle);
});

const dangerArcPath = computed(() => {
  if (props.dangerValue >= props.maxValue) return '';
  
  const range = props.maxValue - props.minValue;
  const normalizedDanger = (props.dangerValue - props.minValue) / range;
  const dangerAngle = startAngle + (endAngle - startAngle) * normalizedDanger;
  
  return describeArc(centerX, centerY, radius, dangerAngle, endAngle);
});

// 指针位置计算
const pointerEnd = computed(() => {
  const range = props.maxValue - props.minValue;
  if (range === 0) return { x: centerX, y: centerY - radius + 20 };
  
  const normalizedValue = (currentValue.value - props.minValue) / range;
  const angle = startAngle + (endAngle - startAngle) * normalizedValue;
  
  return polarToCartesian(centerX, centerY, radius - 20, angle);
});

// 刻度标记计算
const tickMarks = computed(() => {
  const ticks = [];
  const angleRange = endAngle - startAngle;
  
  for (let i = 0; i <= props.tickCount; i++) {
    const angle = startAngle + (angleRange * i / props.tickCount);
    const isMajor = i % Math.ceil(props.tickCount / 5) === 0;
    const tickRadius = isMajor ? 15 : 8;
    
    const outer = polarToCartesian(centerX, centerY, radius, angle);
    const inner = polarToCartesian(centerX, centerY, radius - tickRadius, angle);
    
    ticks.push({
      angle,
      x1: outer.x,
      y1: outer.y,
      x2: inner.x,
      y2: inner.y,
      major: isMajor
    });
  }
  
  return ticks;
});

// 刻度标签计算
const tickLabels = computed(() => {
  const labels = [];
  const angleRange = endAngle - startAngle;
  const valueRange = props.maxValue - props.minValue;
  
  for (let i = 0; i <= props.tickCount; i++) {
    const angle = startAngle + (angleRange * i / props.tickCount);
    const value = props.minValue + (valueRange * i / props.tickCount);
    
    const position = polarToCartesian(centerX, centerY, radius - 30, angle);
    
    labels.push({
      angle,
      value,
      x: position.x,
      y: position.y,
      text: value.toFixed(0)
    });
  }
  
  return labels;
});

// 方法
const updateValue = (newValue: number) => {
  // 限制值在有效范围内
  const clampedValue = Math.max(props.minValue, Math.min(props.maxValue, newValue));
  
  if (clampedValue !== targetValue.value) {
    targetValue.value = clampedValue;
    animateToValue();
    
    // 更新峰值
    if (clampedValue > peakMax.value) {
      peakMax.value = clampedValue;
    }
    if (clampedValue < peakMin.value) {
      peakMin.value = clampedValue;
    }
    
    // 检查阈值
    if (clampedValue >= props.dangerValue) {
      emit('threshold-exceeded', 'danger', clampedValue);
    } else if (clampedValue >= props.warningValue) {
      emit('threshold-exceeded', 'warning', clampedValue);
    }
    
    emit('value-changed', clampedValue);
    lastUpdate.value = Date.now();
  }
};

const animateToValue = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
  
  const startValue = currentValue.value;
  const endValue = targetValue.value;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / props.animationDuration, 1);
    
    // 使用缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    currentValue.value = startValue + (endValue - startValue) * easeProgress;
    
    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(animate);
    } else {
      currentValue.value = endValue;
    }
  };
  
  animate();
};

const resetPeakValues = () => {
  peakMin.value = currentValue.value;
  peakMax.value = currentValue.value;
};

const toggleLabels = () => {
  showLabels.value = !showLabels.value;
};

const handleRefresh = () => {
  resetPeakValues();
  updateValue(0);
};

const handleSettings = () => {
  console.log('打开仪表盘设置');
};

const handleExport = () => {
  console.log('导出仪表盘数据');
};

const handleResize = () => {
  // 响应式调整已通过CSS和computed属性处理
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
};

// 模拟数据更新（演示用）
const simulateDataUpdate = () => {
  setInterval(() => {
    if (hasData.value) {
      // 生成模拟数据
      const time = Date.now() / 1000;
      const value = props.minValue + 
                   (props.maxValue - props.minValue) * 
                   (0.5 + 0.3 * Math.sin(time * 0.5) + 0.2 * Math.random());
      
      updateValue(value);
    }
  }, 1000);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  
  // 初始化峰值
  peakMin.value = props.minValue;
  peakMax.value = props.minValue;
  
  // 开始数据模拟（演示用）
  simulateDataUpdate();
});

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});

// 监听器
watch(() => props.datasets, (newDatasets) => {
  if (newDatasets.length > 0) {
    const value = parseFloat(String(newDatasets[0].value)) || 0;
    updateValue(value);
  }
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateValue,
  resetPeakValues,
  getCurrentValue: () => currentValue.value,
  getPeakValues: () => ({ min: peakMin.value, max: peakMax.value })
});
</script>

<style scoped>
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px;
  min-height: 250px;
}

.gauge-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-svg {
  max-width: 100%;
  max-height: 100%;
}

.value-arc {
  transition: stroke 0.3s ease;
}

.value-arc.danger {
  stroke: #f56c6c !important;
}

.value-arc.warning {
  stroke: #e6a23c !important;
}

.tick-label {
  font-size: 12px;
  font-weight: 500;
}

.gauge-pointer {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.current-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.current-value.normal {
  color: #67c23a;
}

.current-value.warning {
  color: #e6a23c;
}

.current-value.danger {
  color: #f56c6c;
}

.value-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.value-percentage {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.peak-values {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
}

.peak-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.peak-label {
  color: var(--el-text-color-secondary);
}

.peak-value {
  font-weight: 500;
}

.peak-value.max {
  color: #f56c6c;
}

.peak-value.min {
  color: #409eff;
}

.status-leds {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.status-led {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.status-led.active {
  opacity: 1;
}

.led-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid currentColor;
  transition: all 0.3s ease;
}

.status-led.active .led-dot {
  box-shadow: 0 0 8px currentColor;
}

.normal-led {
  color: #67c23a;
}

.warning-led {
  color: #e6a23c;
}

.danger-led {
  color: #f56c6c;
}

.led-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.gauge-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gauge-percentage {
  font-size: 12px;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .gauge-container {
    padding: 8px;
  }
  
  .current-value {
    font-size: 24px;
  }
  
  .value-unit {
    font-size: 12px;
  }
  
  .peak-values {
    gap: 12px;
  }
  
  .status-leds {
    gap: 8px;
  }
  
  .tick-label {
    font-size: 10px;
  }
}
</style>
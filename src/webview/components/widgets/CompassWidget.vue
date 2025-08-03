<!--
  CompassWidget - 指南针组件
  基于Serial Studio的Compass Widget实现，显示方向和方位角度
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Compass"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="compassData"
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
        
        <!-- 重置方向 -->
        <el-tooltip content="重置方向" placement="bottom">
          <el-button 
            icon="RefreshRight"
            @click="resetCompass"
          />
        </el-tooltip>
        
        <!-- 显示模式 -->
        <el-tooltip content="显示模式" placement="bottom">
          <el-dropdown @command="handleModeChange">
            <el-button icon="Setting">
              <el-icon><Setting /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="cardinal">基本方位</el-dropdown-item>
                <el-dropdown-item command="degree">角度显示</el-dropdown-item>
                <el-dropdown-item command="both">全部显示</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要指南针内容 -->
    <div class="compass-container" ref="compassContainer">
      <!-- SVG指南针 -->
      <div class="compass-display">
        <svg 
          class="compass-svg"
          :width="compassSize"
          :height="compassSize"
          :viewBox="`0 0 ${compassSize} ${compassSize}`"
        >
          <!-- 外圈 -->
          <circle
            :cx="center"
            :cy="center"
            :r="radius"
            class="compass-outer-ring"
          />
          
          <!-- 内圈 -->
          <circle
            :cx="center"
            :cy="center"
            :r="radius - 20"
            class="compass-inner-ring"
          />
          
          <!-- 刻度线 -->
          <g v-for="(tick, index) in ticks" :key="index">
            <line
              :x1="tick.x1"
              :y1="tick.y1"
              :x2="tick.x2"
              :y2="tick.y2"
              :class="tick.major ? 'compass-major-tick' : 'compass-minor-tick'"
            />
            
            <!-- 主要方位标签 -->
            <text
              v-if="tick.major && tick.label && showCardinalMode"
              :x="tick.labelX"
              :y="tick.labelY"
              class="compass-cardinal-label"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {{ tick.label }}
            </text>
            
            <!-- 度数标签 -->
            <text
              v-if="tick.major && showDegreeMode"
              :x="tick.degreeX"
              :y="tick.degreeY"
              class="compass-degree-label"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {{ tick.degree }}°
            </text>
          </g>
          
          <!-- 指针 -->
          <g :transform="`rotate(${currentHeading} ${center} ${center})`">
            <!-- 北针（红色） -->
            <polygon
              :points="northNeedlePoints"
              class="compass-north-needle"
            />
            
            <!-- 南针（白色） -->
            <polygon
              :points="southNeedlePoints"
              class="compass-south-needle"
            />
          </g>
          
          <!-- 中心圆点 -->
          <circle
            :cx="center"
            :cy="center"
            r="8"
            class="compass-center-dot"
          />
          
          <!-- 当前方向文本 -->
          <text
            :x="center"
            :y="center + 40"
            class="compass-heading-text"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{ headingText }}
          </text>
        </svg>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="compass-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化指南针...</span>
      </div>
      
      <!-- 数据信息显示 -->
      <div class="compass-info">
        <div class="info-panel">
          <div class="info-item">
            <span class="info-label">方位角:</span>
            <span class="info-value">{{ currentHeading.toFixed(1) }}°</span>
          </div>
          <div class="info-item">
            <span class="info-label">方向:</span>
            <span class="info-value">{{ cardinalDirection }}</span>
          </div>
          <div class="info-item" v-if="magneticDeclination !== null">
            <span class="info-label">磁偏角:</span>
            <span class="info-value">{{ magneticDeclination.toFixed(1) }}°</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="compass-stats">
        方位: {{ cardinalDirection }} ({{ currentHeading.toFixed(1) }}°)
      </span>
    </template>
    
    <template #footer-right>
      <span class="compass-update">
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
import { VideoPlay, VideoPause, Loading, Setting } from '@element-plus/icons-vue';

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, DataPoint, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';
import { usePerformanceStore } from '../../stores/performance';

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  realtime?: boolean;
  updateInterval?: number;
  magneticDeclination?: number | null;
  smoothing?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  updateInterval: 100,
  magneticDeclination: null,
  smoothing: true,
  size: 300
});

// 响应式状态
const compassContainer = ref<HTMLDivElement>();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);

// 指南针数据
const currentHeading = ref(0); // 当前方位角（度）
const targetHeading = ref(0);  // 目标方位角（用于平滑动画）
const compassData = ref<{ heading: number; x?: number; y?: number; z?: number }>({ heading: 0 });

// 显示模式
const displayMode = ref<'cardinal' | 'degree' | 'both'>('both');

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '指南针');
});

const hasData = computed(() => {
  return compassData.value.heading !== undefined;
});

const compassSize = computed(() => {
  return Math.min(props.size, 300);
});

const center = computed(() => {
  return compassSize.value / 2;
});

const radius = computed(() => {
  return compassSize.value / 2 - 30;
});

const showCardinalMode = computed(() => {
  return displayMode.value === 'cardinal' || displayMode.value === 'both';
});

const showDegreeMode = computed(() => {
  return displayMode.value === 'degree' || displayMode.value === 'both';
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const cardinalDirection = computed(() => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(currentHeading.value / 22.5) % 16;
  return directions[index];
});

const headingText = computed(() => {
  return `${cardinalDirection.value} ${currentHeading.value.toFixed(0)}°`;
});

// 刻度线计算
const ticks = computed(() => {
  const ticksArray = [];
  
  for (let i = 0; i < 360; i += 15) {
    const radian = (i - 90) * Math.PI / 180;
    const isMajor = i % 30 === 0;
    const tickLength = isMajor ? 15 : 8;
    
    const outerRadius = radius.value;
    const innerRadius = outerRadius - tickLength;
    const labelRadius = outerRadius - 25;
    const degreeRadius = outerRadius - 35;
    
    const x1 = center.value + Math.cos(radian) * outerRadius;
    const y1 = center.value + Math.sin(radian) * outerRadius;
    const x2 = center.value + Math.cos(radian) * innerRadius;
    const y2 = center.value + Math.sin(radian) * innerRadius;
    
    const labelX = center.value + Math.cos(radian) * labelRadius;
    const labelY = center.value + Math.sin(radian) * labelRadius;
    
    const degreeX = center.value + Math.cos(radian) * degreeRadius;
    const degreeY = center.value + Math.sin(radian) * degreeRadius;
    
    // 主要方位标签
    const cardinalLabels: { [key: number]: string } = {
      0: 'N', 30: 'NNE', 60: 'NE', 90: 'E', 120: 'SE', 150: 'SSE',
      180: 'S', 210: 'SSW', 240: 'SW', 270: 'W', 300: 'NW', 330: 'NNW'
    };
    
    ticksArray.push({
      x1, y1, x2, y2,
      labelX, labelY,
      degreeX, degreeY,
      major: isMajor,
      label: cardinalLabels[i],
      degree: i
    });
  }
  
  return ticksArray;
});

// 指针形状
const northNeedlePoints = computed(() => {
  const needleLength = radius.value - 40;
  const needleWidth = 8;
  
  return `${center.value},${center.value - needleLength} 
          ${center.value - needleWidth},${center.value + 10} 
          ${center.value + needleWidth},${center.value + 10}`;
});

const southNeedlePoints = computed(() => {
  const needleLength = radius.value - 40;
  const needleWidth = 8;
  
  return `${center.value},${center.value + needleLength} 
          ${center.value - needleWidth},${center.value - 10} 
          ${center.value + needleWidth},${center.value - 10}`;
});

// 方法
const initializeCompass = async () => {
  try {
    isLoading.value = true;
    
    // 初始化指南针数据
    if (props.datasets.length > 0) {
      const dataset = props.datasets[0];
      if (dataset.value !== undefined) {
        updateHeading(Number(dataset.value));
      }
    }
    
    isLoading.value = false;
    console.log('指南针初始化完成');
    
  } catch (error) {
    console.error('初始化指南针时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '指南针初始化失败';
    isLoading.value = false;
  }
};

const updateHeading = (newHeading: number) => {
  if (isPaused.value) return;
  
  // 标准化角度到0-360度
  newHeading = ((newHeading % 360) + 360) % 360;
  
  targetHeading.value = newHeading;
  
  if (props.smoothing) {
    animateToHeading(newHeading);
  } else {
    currentHeading.value = newHeading;
  }
  
  compassData.value.heading = newHeading;
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const animateToHeading = (targetAngle: number) => {
  const startAngle = currentHeading.value;
  let angleDiff = targetAngle - startAngle;
  
  // 处理角度跨越360度的情况
  if (angleDiff > 180) {
    angleDiff -= 360;
  } else if (angleDiff < -180) {
    angleDiff += 360;
  }
  
  const animationDuration = 300; // 毫秒
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    
    // 使用缓动函数
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    currentHeading.value = startAngle + angleDiff * easedProgress;
    
    // 标准化角度
    currentHeading.value = ((currentHeading.value % 360) + 360) % 360;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
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

const resetCompass = () => {
  currentHeading.value = 0;
  targetHeading.value = 0;
  compassData.value.heading = 0;
};

const handleModeChange = (command: string) => {
  displayMode.value = command as 'cardinal' | 'degree' | 'both';
};

const handleRefresh = () => {
  initializeCompass();
};

const handleSettings = () => {
  console.log('打开指南针设置对话框');
};

const handleExport = () => {
  console.log('导出指南针数据');
};

const handleResize = (size: { width: number; height: number }) => {
  // 指南针会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeCompass();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  let direction = 1;
  let speed = 2;
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      // 模拟缓慢转动
      targetHeading.value += direction * speed;
      
      // 随机改变方向
      if (Math.random() < 0.02) {
        direction *= -1;
        speed = Math.random() * 3 + 1;
      }
      
      updateHeading(targetHeading.value);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeCompass();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  // 清理资源
});

// 监听器
watch(() => props.datasets, () => {
  initializeCompass();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateHeading,
  resetCompass,
  togglePause,
  getCurrentHeading: () => currentHeading.value
});
</script>

<style scoped>
.compass-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.compass-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass-svg {
  max-width: 100%;
  max-height: 100%;
}

.compass-outer-ring {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 2;
}

.compass-inner-ring {
  fill: var(--el-bg-color);
  stroke: var(--el-border-color-light);
  stroke-width: 1;
}

.compass-major-tick {
  stroke: var(--el-text-color-regular);
  stroke-width: 2;
}

.compass-minor-tick {
  stroke: var(--el-text-color-secondary);
  stroke-width: 1;
}

.compass-cardinal-label {
  fill: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: bold;
}

.compass-degree-label {
  fill: var(--el-text-color-secondary);
  font-size: 10px;
}

.compass-north-needle {
  fill: var(--el-color-danger);
  stroke: var(--el-color-danger-dark-2);
  stroke-width: 1;
}

.compass-south-needle {
  fill: var(--el-color-info-light-5);
  stroke: var(--el-color-info);
  stroke-width: 1;
}

.compass-center-dot {
  fill: var(--el-color-primary);
  stroke: var(--el-color-primary-dark-2);
  stroke-width: 1;
}

.compass-heading-text {
  fill: var(--el-text-color-primary);
  font-size: 12px;
  font-weight: 500;
}

.compass-loading {
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

.compass-info {
  margin-top: 16px;
  width: 100%;
}

.info-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 80px;
}

.info-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.compass-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.compass-update {
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
  .compass-cardinal-label {
    font-size: 12px;
  }
  
  .compass-degree-label {
    font-size: 9px;
  }
  
  .compass-heading-text {
    font-size: 11px;
  }
  
  .info-panel {
    gap: 8px;
  }
  
  .info-item {
    min-width: 60px;
  }
  
  .info-label {
    font-size: 10px;
  }
  
  .info-value {
    font-size: 12px;
  }
}
</style>
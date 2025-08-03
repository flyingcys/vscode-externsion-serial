<!--
  AccelerometerWidget - 加速度计组件
  基于Serial Studio的Accelerometer Widget实现，显示三轴加速度数据
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Accelerometer"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="accelerometerData"
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
        
        <!-- 重置位置 -->
        <el-tooltip content="重置位置" placement="bottom">
          <el-button 
            icon="RefreshRight"
            @click="resetAccelerometer"
          />
        </el-tooltip>
        
        <!-- 显示模式 -->
        <el-tooltip content="显示模式" placement="bottom">
          <el-dropdown @command="handleModeChange">
            <el-button icon="View">
              <el-icon><View /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="3d">3D视图</el-dropdown-item>
                <el-dropdown-item command="bars">条形图</el-dropdown-item>
                <el-dropdown-item command="combined">组合视图</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- 坐标轴显示 -->
        <el-tooltip content="坐标轴显示" placement="bottom">
          <el-button 
            :class="{ 'is-active': showAxes }"
            icon="Grid"
            @click="toggleAxes"
          />
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要加速度计内容 -->
    <div class="accelerometer-container" ref="accelerometerContainer">
      <!-- 3D视图模式 -->
      <div v-if="displayMode === '3d' || displayMode === 'combined'" class="accelerometer-3d">
        <div class="accelerometer-sphere" ref="sphereContainer">
          <!-- SVG 3D球体表示 -->
          <svg 
            class="sphere-svg"
            :width="sphereSize"
            :height="sphereSize"
            :viewBox="`0 0 ${sphereSize} ${sphereSize}`"
          >
            <!-- 外球体 -->
            <circle
              :cx="sphereCenter"
              :cy="sphereCenter"
              :r="sphereRadius"
              class="sphere-outer"
            />
            
            <!-- 内球体 -->
            <circle
              :cx="sphereCenter"
              :cy="sphereCenter"
              :r="sphereRadius - 10"
              class="sphere-inner"
            />
            
            <!-- 坐标轴（可选显示） -->
            <g v-if="showAxes" class="axes-group">
              <!-- X轴 -->
              <line
                :x1="sphereCenter - sphereRadius + 15"
                :y1="sphereCenter"
                :x2="sphereCenter + sphereRadius - 15"
                :y2="sphereCenter"
                class="axis-x"
              />
              <text
                :x="sphereCenter + sphereRadius - 10"
                :y="sphereCenter - 5"
                class="axis-label"
              >X</text>
              
              <!-- Y轴 -->
              <line
                :x1="sphereCenter"
                :y1="sphereCenter - sphereRadius + 15"
                :x2="sphereCenter"
                :y2="sphereCenter + sphereRadius - 15"
                class="axis-y"
              />
              <text
                :x="sphereCenter + 5"
                :y="sphereCenter - sphereRadius + 20"
                class="axis-label"
              >Y</text>
            </g>
            
            <!-- 加速度向量 -->
            <g class="acceleration-vector">
              <line
                :x1="sphereCenter"
                :y1="sphereCenter"
                :x2="vectorEndX"
                :y2="vectorEndY"
                class="vector-line"
                :style="{ stroke: vectorColor }"
              />
              
              <!-- 箭头 -->
              <polygon
                :points="arrowPoints"
                class="vector-arrow"
                :style="{ fill: vectorColor }"
              />
              
              <!-- 向量终点 -->
              <circle
                :cx="vectorEndX"
                :cy="vectorEndY"
                r="4"
                class="vector-point"
                :style="{ fill: vectorColor }"
              />
            </g>
          </svg>
        </div>
      </div>
      
      <!-- 条形图模式 -->
      <div v-if="displayMode === 'bars' || displayMode === 'combined'" class="accelerometer-bars">
        <div class="axis-bars">
          <!-- X轴条形 -->
          <div class="axis-bar-container">
            <div class="axis-label">X</div>
            <div class="bar-background">
              <div 
                class="bar-fill x-bar"
                :style="{ 
                  width: `${Math.abs(xPercent)}%`,
                  backgroundColor: xColor,
                  marginLeft: xPercent < 0 ? `${50 + xPercent}%` : '50%'
                }"
              />
            </div>
            <div class="axis-value">{{ accelerometerData.x?.toFixed(2) || '0.00' }} g</div>
          </div>
          
          <!-- Y轴条形 -->
          <div class="axis-bar-container">
            <div class="axis-label">Y</div>
            <div class="bar-background">
              <div 
                class="bar-fill y-bar"
                :style="{ 
                  width: `${Math.abs(yPercent)}%`,
                  backgroundColor: yColor,
                  marginLeft: yPercent < 0 ? `${50 + yPercent}%` : '50%'
                }"
              />
            </div>
            <div class="axis-value">{{ accelerometerData.y?.toFixed(2) || '0.00' }} g</div>
          </div>
          
          <!-- Z轴条形 -->
          <div class="axis-bar-container">
            <div class="axis-label">Z</div>
            <div class="bar-background">
              <div 
                class="bar-fill z-bar"
                :style="{ 
                  width: `${Math.abs(zPercent)}%`,
                  backgroundColor: zColor,
                  marginLeft: zPercent < 0 ? `${50 + zPercent}%` : '50%'
                }"
              />
            </div>
            <div class="axis-value">{{ accelerometerData.z?.toFixed(2) || '0.00' }} g</div>
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="accelerometer-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化加速度计...</span>
      </div>
      
      <!-- 数据信息面板 -->
      <div class="accelerometer-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">X轴:</span>
            <span class="info-value x-value">{{ accelerometerData.x?.toFixed(3) || '0.000' }} g</span>
          </div>
          <div class="info-item">
            <span class="info-label">Y轴:</span>
            <span class="info-value y-value">{{ accelerometerData.y?.toFixed(3) || '0.000' }} g</span>
          </div>
          <div class="info-item">
            <span class="info-label">Z轴:</span>
            <span class="info-value z-value">{{ accelerometerData.z?.toFixed(3) || '0.000' }} g</span>
          </div>
          <div class="info-item">
            <span class="info-label">合成:</span>
            <span class="info-value total-value">{{ totalAcceleration.toFixed(3) }} g</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="accelerometer-stats">
        合成: {{ totalAcceleration.toFixed(2) }} g | 
        倾斜: {{ tiltAngle.toFixed(1) }}°
      </span>
    </template>
    
    <template #footer-right>
      <span class="accelerometer-update">
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
import { VideoPlay, VideoPause, Loading, View } from '@element-plus/icons-vue';

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
  maxAcceleration?: number;
  smoothing?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  updateInterval: 50,
  maxAcceleration: 4.0, // 最大加速度范围(g)
  smoothing: true,
  size: 200
});

// 响应式状态
const accelerometerContainer = ref<HTMLDivElement>();
const sphereContainer = ref<HTMLDivElement>();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);

// 显示选项
const displayMode = ref<'3d' | 'bars' | 'combined'>('combined');
const showAxes = ref(true);

// 加速度计数据
const accelerometerData = ref<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '加速度计');
});

const hasData = computed(() => {
  return accelerometerData.value.x !== undefined || 
         accelerometerData.value.y !== undefined || 
         accelerometerData.value.z !== undefined;
});

const sphereSize = computed(() => {
  return Math.min(props.size, 200);
});

const sphereCenter = computed(() => {
  return sphereSize.value / 2;
});

const sphereRadius = computed(() => {
  return sphereSize.value / 2 - 20;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

// 计算合成加速度
const totalAcceleration = computed(() => {
  const { x, y, z } = accelerometerData.value;
  return Math.sqrt(x * x + y * y + z * z);
});

// 计算倾斜角度
const tiltAngle = computed(() => {
  const { x, y, z } = accelerometerData.value;
  if (z === 0) return 90;
  return Math.abs(Math.atan2(Math.sqrt(x * x + y * y), z) * 180 / Math.PI);
});

// 向量显示计算
const vectorEndX = computed(() => {
  const x = accelerometerData.value.x;
  const scale = (sphereRadius.value - 20) / props.maxAcceleration;
  return sphereCenter.value + x * scale;
});

const vectorEndY = computed(() => {
  const y = accelerometerData.value.y;
  const scale = (sphereRadius.value - 20) / props.maxAcceleration;
  return sphereCenter.value - y * scale; // Y轴反向
});

const vectorColor = computed(() => {
  const intensity = Math.min(totalAcceleration.value / props.maxAcceleration, 1);
  const hue = (1 - intensity) * 120; // 从绿色(120)到红色(0)
  return `hsl(${hue}, 70%, 50%)`;
});

const arrowPoints = computed(() => {
  const angle = Math.atan2(vectorEndY.value - sphereCenter.value, vectorEndX.value - sphereCenter.value);
  const arrowSize = 8;
  
  const tip1X = vectorEndX.value - arrowSize * Math.cos(angle - Math.PI / 6);
  const tip1Y = vectorEndY.value - arrowSize * Math.sin(angle - Math.PI / 6);
  const tip2X = vectorEndX.value - arrowSize * Math.cos(angle + Math.PI / 6);
  const tip2Y = vectorEndY.value - arrowSize * Math.sin(angle + Math.PI / 6);
  
  return `${vectorEndX.value},${vectorEndY.value} ${tip1X},${tip1Y} ${tip2X},${tip2Y}`;
});

// 条形图百分比计算
const xPercent = computed(() => {
  return (accelerometerData.value.x / props.maxAcceleration) * 50;
});

const yPercent = computed(() => {
  return (accelerometerData.value.y / props.maxAcceleration) * 50;
});

const zPercent = computed(() => {
  return (accelerometerData.value.z / props.maxAcceleration) * 50;
});

// 轴颜色
const xColor = computed(() => '#f56c6c'); // 红色
const yColor = computed(() => '#67c23a'); // 绿色
const zColor = computed(() => '#409eff'); // 蓝色

// 方法
const initializeAccelerometer = async () => {
  try {
    isLoading.value = true;
    
    // 初始化加速度计数据
    accelerometerData.value = { x: 0, y: 0, z: 1 }; // 默认重力在Z轴
    
    isLoading.value = false;
    console.log('加速度计初始化完成');
    
  } catch (error) {
    console.error('初始化加速度计时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '加速度计初始化失败';
    isLoading.value = false;
  }
};

const updateAcceleration = (x: number, y: number, z: number) => {
  if (isPaused.value) return;
  
  if (props.smoothing) {
    // 简单的低通滤波
    const alpha = 0.8;
    accelerometerData.value.x = alpha * x + (1 - alpha) * accelerometerData.value.x;
    accelerometerData.value.y = alpha * y + (1 - alpha) * accelerometerData.value.y;
    accelerometerData.value.z = alpha * z + (1 - alpha) * accelerometerData.value.z;
  } else {
    accelerometerData.value.x = x;
    accelerometerData.value.y = y;
    accelerometerData.value.z = z;
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
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

const resetAccelerometer = () => {
  accelerometerData.value = { x: 0, y: 0, z: 1 };
};

const toggleAxes = () => {
  showAxes.value = !showAxes.value;
};

const handleModeChange = (command: string) => {
  displayMode.value = command as '3d' | 'bars' | 'combined';
};

const handleRefresh = () => {
  initializeAccelerometer();
};

const handleSettings = () => {
  console.log('打开加速度计设置对话框');
};

const handleExport = () => {
  console.log('导出加速度计数据');
};

const handleResize = (size: { width: number; height: number }) => {
  // 加速度计会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeAccelerometer();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  let time = 0;
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      time += 0.1;
      
      // 模拟倾斜运动
      const x = Math.sin(time) * 0.5 + (Math.random() - 0.5) * 0.1;
      const y = Math.cos(time * 0.7) * 0.3 + (Math.random() - 0.5) * 0.1;
      const z = 1 - Math.abs(x) * 0.5 - Math.abs(y) * 0.3 + (Math.random() - 0.5) * 0.05;
      
      updateAcceleration(x, y, z);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeAccelerometer();
  
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
  initializeAccelerometer();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateAcceleration,
  resetAccelerometer,
  togglePause,
  getAcceleration: () => accelerometerData.value
});
</script>

<style scoped>
.accelerometer-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.accelerometer-3d {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accelerometer-sphere {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sphere-svg {
  max-width: 100%;
  max-height: 100%;
}

.sphere-outer {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 2;
}

.sphere-inner {
  fill: var(--el-bg-color-page);
  stroke: var(--el-border-color-light);
  stroke-width: 1;
  opacity: 0.3;
}

.axes-group .axis-x,
.axes-group .axis-y {
  stroke-width: 1;
  opacity: 0.6;
}

.axis-x {
  stroke: #f56c6c;
}

.axis-y {
  stroke: #67c23a;
}

.axis-label {
  fill: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: bold;
}

.vector-line {
  stroke-width: 3;
}

.vector-arrow {
  stroke: none;
}

.vector-point {
  stroke: none;
}

.accelerometer-bars {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.axis-bars {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.axis-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.axis-label {
  width: 20px;
  font-weight: bold;
  text-align: center;
}

.bar-background {
  flex: 1;
  height: 20px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 2px;
}

.axis-value {
  width: 80px;
  text-align: right;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.accelerometer-loading {
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

.accelerometer-info {
  margin-top: auto;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--el-bg-color);
  border-radius: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  font-weight: 500;
}

.x-value {
  color: #f56c6c;
}

.y-value {
  color: #67c23a;
}

.z-value {
  color: #409eff;
}

.total-value {
  color: var(--el-color-primary);
  font-weight: bold;
}

.accelerometer-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.accelerometer-update {
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
@media (max-width: 768px) {
  .accelerometer-container {
    min-height: 200px;
    gap: 12px;
  }
  
  .axis-bars {
    gap: 12px;
  }
  
  .axis-bar-container {
    gap: 8px;
  }
  
  .axis-value {
    width: 70px;
    font-size: 11px;
  }
  
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 6px;
  }
  
  .info-item {
    padding: 3px 6px;
  }
  
  .info-label,
  .info-value {
    font-size: 11px;
  }
}

@media (max-width: 576px) {
  .accelerometer-container {
    min-height: 180px;
  }
  
  .axis-value {
    width: 60px;
    font-size: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
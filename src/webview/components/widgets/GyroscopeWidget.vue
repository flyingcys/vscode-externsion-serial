<!--
  GyroscopeWidget - 陀螺仪组件
  基于Serial Studio的Gyroscope Widget实现，显示三轴角速度数据
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.Gyroscope"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="gyroscopeData"
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
        
        <!-- 重置角度 -->
        <el-tooltip content="重置角度" placement="bottom">
          <el-button 
            icon="RefreshRight"
            @click="resetGyroscope"
          />
        </el-tooltip>
        
        <!-- 显示模式 -->
        <el-tooltip content="显示模式" placement="bottom">
          <el-dropdown @command="handleModeChange">
            <el-button icon="Operation">
              <el-icon><Operation /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="attitude">姿态视图</el-dropdown-item>
                <el-dropdown-item command="rates">角速度视图</el-dropdown-item>
                <el-dropdown-item command="combined">组合视图</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- 校准模式 -->
        <el-tooltip content="校准陀螺仪" placement="bottom">
          <el-button 
            :class="{ 'is-active': isCalibrating }"
            icon="Compass"
            @click="toggleCalibration"
          />
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要陀螺仪内容 -->
    <div class="gyroscope-container" ref="gyroscopeContainer">
      <!-- 姿态视图模式 -->
      <div v-if="displayMode === 'attitude' || displayMode === 'combined'" class="gyroscope-attitude">
        <div class="attitude-display" ref="attitudeContainer">
          <!-- SVG姿态指示器 -->
          <svg 
            class="attitude-svg"
            :width="attitudeSize"
            :height="attitudeSize"
            :viewBox="`0 0 ${attitudeSize} ${attitudeSize}`"
          >
            <!-- 人工地平线背景 -->
            <defs>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#87CEEB;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <!-- 外圈 -->
            <circle
              :cx="attitudeCenter"
              :cy="attitudeCenter"
              :r="attitudeRadius"
              class="attitude-outer-ring"
            />
            
            <!-- 地平线组 -->
            <g :transform="`translate(${attitudeCenter}, ${attitudeCenter}) rotate(${-attitudes.roll})`">
              <!-- 天空 -->
              <rect
                :x="-attitudeRadius"
                :y="-attitudeRadius - attitudes.pitch * 2"
                :width="attitudeRadius * 2"
                :height="attitudeRadius + attitudes.pitch * 2"
                fill="url(#skyGradient)"
              />
              
              <!-- 地面 -->
              <rect
                :x="-attitudeRadius"
                :y="-attitudes.pitch * 2"
                :width="attitudeRadius * 2"
                :height="attitudeRadius + attitudes.pitch * 2"
                fill="url(#groundGradient)"
              />
              
              <!-- 地平线 -->
              <line
                :x1="-attitudeRadius"
                :y1="-attitudes.pitch * 2"
                :x2="attitudeRadius"
                :y2="-attitudes.pitch * 2"
                class="horizon-line"
              />
            </g>
            
            <!-- 俯仰角刻度 -->
            <g>
              <g v-for="(pitch, index) in pitchMarks" :key="index">
                <line
                  :x1="attitudeCenter - pitch.length"
                  :y1="attitudeCenter + pitch.offset"
                  :x2="attitudeCenter + pitch.length"
                  :y2="attitudeCenter + pitch.offset"
                  class="pitch-mark"
                  :class="{ 'major': pitch.major }"
                />
                <text
                  v-if="pitch.major"
                  :x="attitudeCenter + pitch.length + 5"
                  :y="attitudeCenter + pitch.offset + 3"
                  class="pitch-label"
                >{{ pitch.angle }}°</text>
              </g>
            </g>
            
            <!-- 飞机标记 -->
            <g :transform="`translate(${attitudeCenter}, ${attitudeCenter})`">
              <!-- 机身 -->
              <line x1="-20" y1="0" x2="20" y2="0" class="aircraft-wing" />
              <line x1="0" y1="-8" x2="0" y2="8" class="aircraft-body" />
              <circle cx="0" cy="0" r="3" class="aircraft-center" />
            </g>
            
            <!-- 偏航角指示器 -->
            <g class="yaw-indicator">
              <circle
                :cx="attitudeCenter"
                :cy="30"
                r="15"
                class="yaw-circle"
              />
              <text
                :x="attitudeCenter"
                :y="35"
                class="yaw-text"
                text-anchor="middle"
              >{{ attitudes.yaw.toFixed(0) }}°</text>
            </g>
          </svg>
        </div>
      </div>
      
      <!-- 角速度视图模式 -->
      <div v-if="displayMode === 'rates' || displayMode === 'combined'" class="gyroscope-rates">
        <div class="rates-display">
          <!-- 圆形角速度指示器 -->
          <div class="rate-indicators">
            <!-- Roll角速度 -->
            <div class="rate-indicator">
              <div class="rate-circle roll-rate">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" class="rate-background" />
                  <circle 
                    cx="40" cy="40" r="35"
                    class="rate-progress roll-progress"
                    :style="{ strokeDashoffset: rollProgressOffset }"
                  />
                  <text x="40" y="35" class="rate-label" text-anchor="middle">ROLL</text>
                  <text x="40" y="50" class="rate-value" text-anchor="middle">
                    {{ gyroscopeData.roll?.toFixed(1) || '0.0' }}
                  </text>
                </svg>
              </div>
            </div>
            
            <!-- Pitch角速度 -->
            <div class="rate-indicator">
              <div class="rate-circle pitch-rate">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" class="rate-background" />
                  <circle 
                    cx="40" cy="40" r="35"
                    class="rate-progress pitch-progress"
                    :style="{ strokeDashoffset: pitchProgressOffset }"
                  />
                  <text x="40" y="35" class="rate-label" text-anchor="middle">PITCH</text>
                  <text x="40" y="50" class="rate-value" text-anchor="middle">
                    {{ gyroscopeData.pitch?.toFixed(1) || '0.0' }}
                  </text>
                </svg>
              </div>
            </div>
            
            <!-- Yaw角速度 -->
            <div class="rate-indicator">
              <div class="rate-circle yaw-rate">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" class="rate-background" />
                  <circle 
                    cx="40" cy="40" r="35"
                    class="rate-progress yaw-progress"
                    :style="{ strokeDashoffset: yawProgressOffset }"
                  />
                  <text x="40" y="35" class="rate-label" text-anchor="middle">YAW</text>
                  <text x="40" y="50" class="rate-value" text-anchor="middle">
                    {{ gyroscopeData.yaw?.toFixed(1) || '0.0' }}
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="gyroscope-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化陀螺仪...</span>
      </div>
      
      <!-- 校准提示 -->
      <div v-if="isCalibrating" class="calibration-overlay">
        <div class="calibration-message">
          <el-icon class="calibration-icon"><Loading /></el-icon>
          <span>校准中，请保持设备静止...</span>
          <el-progress 
            :percentage="calibrationProgress" 
            :show-text="false"
            style="margin-top: 8px;"
          />
        </div>
      </div>
      
      <!-- 数据信息面板 -->
      <div class="gyroscope-info">
        <div class="info-grid">
          <div class="info-section">
            <div class="section-title">角速度 (°/s)</div>
            <div class="info-item">
              <span class="info-label">Roll:</span>
              <span class="info-value roll-value">{{ gyroscopeData.roll?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Pitch:</span>
              <span class="info-value pitch-value">{{ gyroscopeData.pitch?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Yaw:</span>
              <span class="info-value yaw-value">{{ gyroscopeData.yaw?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="section-title">积分角度 (°)</div>
            <div class="info-item">
              <span class="info-label">Roll:</span>
              <span class="info-value">{{ attitudes.roll.toFixed(1) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Pitch:</span>
              <span class="info-value">{{ attitudes.pitch.toFixed(1) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Yaw:</span>
              <span class="info-value">{{ attitudes.yaw.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="gyroscope-stats">
        RPY: {{ attitudes.roll.toFixed(1) }}° {{ attitudes.pitch.toFixed(1) }}° {{ attitudes.yaw.toFixed(1) }}°
      </span>
    </template>
    
    <template #footer-right>
      <span class="gyroscope-update">
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
import { VideoPlay, VideoPause, Loading, Operation } from '@element-plus/icons-vue';

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
  maxAngularRate?: number;
  enableIntegration?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  updateInterval: 20,
  maxAngularRate: 500, // 最大角速度(°/s)
  enableIntegration: true,
  size: 200
});

// 响应式状态
const gyroscopeContainer = ref<HTMLDivElement>();
const attitudeContainer = ref<HTMLDivElement>();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);

// 显示模式和校准
const displayMode = ref<'attitude' | 'rates' | 'combined'>('combined');
const isCalibrating = ref(false);
const calibrationProgress = ref(0);

// 陀螺仪数据
const gyroscopeData = ref<{ roll: number; pitch: number; yaw: number }>({ 
  roll: 0, pitch: 0, yaw: 0 
});

// 积分姿态角度
const attitudes = ref<{ roll: number; pitch: number; yaw: number }>({ 
  roll: 0, pitch: 0, yaw: 0 
});

// 校准数据
const calibrationOffset = ref<{ roll: number; pitch: number; yaw: number }>({ 
  roll: 0, pitch: 0, yaw: 0 
});

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);
const lastUpdateTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '陀螺仪');
});

const hasData = computed(() => {
  return gyroscopeData.value.roll !== undefined || 
         gyroscopeData.value.pitch !== undefined || 
         gyroscopeData.value.yaw !== undefined;
});

const attitudeSize = computed(() => {
  return Math.min(props.size, 200);
});

const attitudeCenter = computed(() => {
  return attitudeSize.value / 2;
});

const attitudeRadius = computed(() => {
  return attitudeSize.value / 2 - 30;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

// 俯仰角刻度线
const pitchMarks = computed(() => {
  const marks = [];
  for (let angle = -60; angle <= 60; angle += 10) {
    const offset = angle * 2; // 像素偏移
    const isMajor = angle % 20 === 0;
    
    marks.push({
      angle,
      offset,
      major: isMajor,
      length: isMajor ? 20 : 10
    });
  }
  return marks;
});

// 角速度进度条计算
const rollProgressOffset = computed(() => {
  const progress = Math.abs(gyroscopeData.value.roll) / props.maxAngularRate;
  const circumference = 2 * Math.PI * 35; // 半径35的圆周长
  return circumference * (1 - Math.min(progress, 1));
});

const pitchProgressOffset = computed(() => {
  const progress = Math.abs(gyroscopeData.value.pitch) / props.maxAngularRate;
  const circumference = 2 * Math.PI * 35;
  return circumference * (1 - Math.min(progress, 1));
});

const yawProgressOffset = computed(() => {
  const progress = Math.abs(gyroscopeData.value.yaw) / props.maxAngularRate;
  const circumference = 2 * Math.PI * 35;
  return circumference * (1 - Math.min(progress, 1));
});

// 方法
const initializeGyroscope = async () => {
  try {
    isLoading.value = true;
    
    // 初始化陀螺仪数据
    gyroscopeData.value = { roll: 0, pitch: 0, yaw: 0 };
    attitudes.value = { roll: 0, pitch: 0, yaw: 0 };
    calibrationOffset.value = { roll: 0, pitch: 0, yaw: 0 };
    
    lastUpdateTime.value = Date.now();
    
    isLoading.value = false;
    console.log('陀螺仪初始化完成');
    
  } catch (error) {
    console.error('初始化陀螺仪时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '陀螺仪初始化失败';
    isLoading.value = false;
  }
};

const updateAngularRates = (roll: number, pitch: number, yaw: number) => {
  if (isPaused.value) return;
  
  // 应用校准偏移
  const calibratedRoll = roll - calibrationOffset.value.roll;
  const calibratedPitch = pitch - calibrationOffset.value.pitch;
  const calibratedYaw = yaw - calibrationOffset.value.yaw;
  
  gyroscopeData.value.roll = calibratedRoll;
  gyroscopeData.value.pitch = calibratedPitch;
  gyroscopeData.value.yaw = calibratedYaw;
  
  // 积分计算姿态角度
  if (props.enableIntegration) {
    integrateAttitudes(calibratedRoll, calibratedPitch, calibratedYaw);
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const integrateAttitudes = (rollRate: number, pitchRate: number, yawRate: number) => {
  const now = Date.now();
  const dt = (now - lastUpdateTime.value) / 1000; // 转换为秒
  
  if (dt > 0 && dt < 0.1) { // 防止异常大的时间间隔
    // 简单的欧拉积分
    attitudes.value.roll += rollRate * dt;
    attitudes.value.pitch += pitchRate * dt;
    attitudes.value.yaw += yawRate * dt;
    
    // 限制角度范围
    attitudes.value.roll = normalizeAngle(attitudes.value.roll);
    attitudes.value.pitch = Math.max(-90, Math.min(90, attitudes.value.pitch));
    attitudes.value.yaw = normalizeAngle(attitudes.value.yaw);
  }
  
  lastUpdateTime.value = now;
};

const normalizeAngle = (angle: number): number => {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
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

const resetGyroscope = () => {
  gyroscopeData.value = { roll: 0, pitch: 0, yaw: 0 };
  attitudes.value = { roll: 0, pitch: 0, yaw: 0 };
  lastUpdateTime.value = Date.now();
};

const toggleCalibration = () => {
  if (isCalibrating.value) {
    stopCalibration();
  } else {
    startCalibration();
  }
};

const startCalibration = () => {
  isCalibrating.value = true;
  calibrationProgress.value = 0;
  
  const calibrationSamples: Array<{ roll: number; pitch: number; yaw: number }> = [];
  const sampleDuration = 3000; // 3秒校准
  const sampleInterval = 50; // 50ms采样间隔
  const totalSamples = sampleDuration / sampleInterval;
  
  const calibrationTimer = setInterval(() => {
    calibrationSamples.push({
      roll: gyroscopeData.value.roll,
      pitch: gyroscopeData.value.pitch,
      yaw: gyroscopeData.value.yaw
    });
    
    calibrationProgress.value = (calibrationSamples.length / totalSamples) * 100;
    
    if (calibrationSamples.length >= totalSamples) {
      // 计算平均偏移
      const avgRoll = calibrationSamples.reduce((sum, sample) => sum + sample.roll, 0) / calibrationSamples.length;
      const avgPitch = calibrationSamples.reduce((sum, sample) => sum + sample.pitch, 0) / calibrationSamples.length;
      const avgYaw = calibrationSamples.reduce((sum, sample) => sum + sample.yaw, 0) / calibrationSamples.length;
      
      calibrationOffset.value = {
        roll: avgRoll,
        pitch: avgPitch,
        yaw: avgYaw
      };
      
      clearInterval(calibrationTimer);
      stopCalibration();
      
      console.log('陀螺仪校准完成:', calibrationOffset.value);
    }
  }, sampleInterval);
};

const stopCalibration = () => {
  isCalibrating.value = false;
  calibrationProgress.value = 0;
};

const handleModeChange = (command: string) => {
  displayMode.value = command as 'attitude' | 'rates' | 'combined';
};

const handleRefresh = () => {
  initializeGyroscope();
};

const handleSettings = () => {
  console.log('打开陀螺仪设置对话框');
};

const handleExport = () => {
  console.log('导出陀螺仪数据');
};

const handleResize = (size: { width: number; height: number }) => {
  // 陀螺仪会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeGyroscope();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  let time = 0;
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      time += 0.02;
      
      // 模拟陀螺仪数据
      const roll = Math.sin(time) * 50 + (Math.random() - 0.5) * 10;
      const pitch = Math.cos(time * 0.7) * 30 + (Math.random() - 0.5) * 8;
      const yaw = Math.sin(time * 0.3) * 80 + (Math.random() - 0.5) * 15;
      
      updateAngularRates(roll, pitch, yaw);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeGyroscope();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  if (isCalibrating.value) {
    stopCalibration();
  }
});

// 监听器
watch(() => props.datasets, () => {
  initializeGyroscope();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateAngularRates,
  resetGyroscope,
  togglePause,
  startCalibration,
  getAngularRates: () => gyroscopeData.value,
  getAttitudes: () => attitudes.value
});
</script>

<style scoped>
.gyroscope-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gyroscope-attitude {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attitude-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.attitude-svg {
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  border-radius: 50%;
}

.attitude-outer-ring {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 3;
}

.horizon-line {
  stroke: #fff;
  stroke-width: 3;
}

.pitch-mark {
  stroke: var(--el-text-color-secondary);
  stroke-width: 1;
}

.pitch-mark.major {
  stroke: var(--el-text-color-primary);
  stroke-width: 2;
}

.pitch-label {
  fill: var(--el-text-color-primary);
  font-size: 10px;
  font-weight: 500;
}

.aircraft-wing {
  stroke: var(--el-color-warning);
  stroke-width: 3;
}

.aircraft-body {
  stroke: var(--el-color-warning);
  stroke-width: 2;
}

.aircraft-center {
  fill: var(--el-color-warning);
}

.yaw-circle {
  fill: var(--el-bg-color);
  stroke: var(--el-border-color);
  stroke-width: 2;
}

.yaw-text {
  fill: var(--el-text-color-primary);
  font-size: 10px;
  font-weight: bold;
}

.gyroscope-rates {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rates-display {
  width: 100%;
  max-width: 300px;
}

.rate-indicators {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 16px;
}

.rate-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rate-circle {
  position: relative;
}

.rate-background {
  fill: none;
  stroke: var(--el-border-color-lighter);
  stroke-width: 4;
}

.rate-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transform-origin: center;
  transform: rotate(-90deg);
  stroke-dasharray: 219.8; /* 2 * PI * 35 */
  transition: stroke-dashoffset 0.2s ease;
}

.roll-progress {
  stroke: #f56c6c;
}

.pitch-progress {
  stroke: #67c23a;
}

.yaw-progress {
  stroke: #409eff;
}

.rate-label {
  fill: var(--el-text-color-secondary);
  font-size: 9px;
  font-weight: 500;
}

.rate-value {
  fill: var(--el-text-color-primary);
  font-size: 11px;
  font-weight: bold;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gyroscope-loading {
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

.calibration-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.calibration-message {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  text-align: center;
  min-width: 200px;
  color: var(--el-text-color-primary);
}

.calibration-icon {
  font-size: 20px;
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

.gyroscope-info {
  margin-top: auto;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.info-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  font-weight: 500;
}

.roll-value {
  color: #f56c6c;
}

.pitch-value {
  color: #67c23a;
}

.yaw-value {
  color: #409eff;
}

.gyroscope-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.gyroscope-update {
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
  .gyroscope-container {
    min-height: 240px;
    gap: 12px;
  }
  
  .rate-indicators {
    gap: 12px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .info-item {
    font-size: 10px;
  }
}

@media (max-width: 576px) {
  .gyroscope-container {
    min-height: 200px;
  }
  
  .rate-indicators {
    flex-direction: column;
    gap: 8px;
  }
  
  .calibration-message {
    padding: 16px;
    min-width: 180px;
  }
}
</style>
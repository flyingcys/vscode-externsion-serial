<!--
  LEDWidget - LED面板组件
  基于Serial Studio的LED Widget实现，显示多个LED状态指示器
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.LED"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="ledData"
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
        
        <!-- 布局模式 -->
        <el-tooltip content="布局模式" placement="bottom">
          <el-dropdown @command="handleLayoutChange">
            <el-button icon="Grid">
              <el-icon><Grid /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="grid">网格布局</el-dropdown-item>
                <el-dropdown-item command="row">行布局</el-dropdown-item>
                <el-dropdown-item command="column">列布局</el-dropdown-item>
                <el-dropdown-item command="circle">圆形布局</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- LED大小 -->
        <el-tooltip content="LED大小" placement="bottom">
          <el-dropdown @command="handleSizeChange">
            <el-button icon="FullScreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="small">小型</el-dropdown-item>
                <el-dropdown-item command="medium">中型</el-dropdown-item>
                <el-dropdown-item command="large">大型</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- 全部开启/关闭 -->
        <el-tooltip content="全部控制" placement="bottom">
          <el-dropdown @command="handleBulkControl">
            <el-button icon="Switch">
              <el-icon><Switch /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all-on">全部开启</el-dropdown-item>
                <el-dropdown-item command="all-off">全部关闭</el-dropdown-item>
                <el-dropdown-item command="toggle-all">全部切换</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要LED面板内容 -->
    <div class="led-container" ref="ledContainer">
      <!-- LED面板 -->
      <div 
        class="led-panel"
        :class="[
          `layout-${layoutMode}`,
          `size-${ledSize}`
        ]"
      >
        <!-- 单个LED -->
        <div
          v-for="(led, index) in ledStates"
          :key="`led-${index}`"
          class="led-item"
          :class="{ 'interactive': interactiveMode }"
          :style="getLEDStyle(index)"
          @click="interactiveMode && toggleLED(index)"
        >
          <!-- LED圆形主体 -->
          <div 
            class="led-circle"
            :class="{
              'led-on': led.state,
              'led-off': !led.state,
              'led-blinking': led.blinking
            }"
            :style="{
              backgroundColor: led.state ? led.color : '#333',
              boxShadow: led.state ? `0 0 ${getLEDGlowSize()} ${led.color}` : 'none'
            }"
          >
            <!-- LED内部反射效果 -->
            <div class="led-reflection" v-if="led.state"></div>
            
            <!-- LED状态图标 -->
            <div class="led-icon" v-if="led.icon">
              <el-icon :size="getLEDIconSize()">
                <component :is="led.icon" />
              </el-icon>
            </div>
          </div>
          
          <!-- LED标签 -->
          <div class="led-label" v-if="showLabels">
            {{ led.label || `LED ${index + 1}` }}
          </div>
          
          <!-- LED值显示 -->
          <div class="led-value" v-if="showValues && led.value !== undefined">
            {{ formatLEDValue(led.value) }}
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="led-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化LED面板...</span>
      </div>
      
      <!-- 状态统计 -->
      <div class="led-stats" v-if="showStats">
        <div class="stats-item">
          <span class="stats-label">总数:</span>
          <span class="stats-value">{{ totalLEDs }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">开启:</span>
          <span class="stats-value active">{{ activeLEDs }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">关闭:</span>
          <span class="stats-value inactive">{{ inactiveLEDs }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">闪烁:</span>
          <span class="stats-value blinking">{{ blinkingLEDs }}</span>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="led-footer-stats">
        {{ activeLEDs }}/{{ totalLEDs }} 已开启
        <span v-if="blinkingLEDs > 0">| {{ blinkingLEDs }} 闪烁</span>
      </span>
    </template>
    
    <template #footer-right>
      <span class="led-update">
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
  VideoPlay, 
  VideoPause, 
  Loading, 
  Grid, 
  FullScreen, 
  Switch,
  CircleCheck,
  CircleClose,
  Warning,
  InfoFilled,
  SuccessFilled
} from '@element-plus/icons-vue';

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, DataPoint, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';
import { usePerformanceStore } from '../../stores/performance';

// LED状态接口
interface LEDState {
  state: boolean;
  color: string;
  label?: string;
  value?: number;
  icon?: any;
  blinking?: boolean;
  brightness?: number;
}

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  realtime?: boolean;
  updateInterval?: number;
  ledCount?: number;
  interactiveMode?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  showStats?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  updateInterval: 200,
  ledCount: 8,
  interactiveMode: false,
  showLabels: true,
  showValues: false,
  showStats: true
});

// 响应式状态
const ledContainer = ref<HTMLDivElement>();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);

// LED配置
const layoutMode = ref<'grid' | 'row' | 'column' | 'circle'>('grid');
const ledSize = ref<'small' | 'medium' | 'large'>('medium');

// LED数据
const ledData = ref<{ states: LEDState[] }>({ states: [] });
const ledStates = ref<LEDState[]>([]);

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : 'LED面板');
});

const hasData = computed(() => {
  return ledStates.value.length > 0;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const totalLEDs = computed(() => ledStates.value.length);
const activeLEDs = computed(() => ledStates.value.filter(led => led.state).length);
const inactiveLEDs = computed(() => ledStates.value.filter(led => !led.state).length);
const blinkingLEDs = computed(() => ledStates.value.filter(led => led.blinking).length);

const showLabels = computed(() => props.showLabels && ledSize.value !== 'small');
const showValues = computed(() => props.showValues && ledSize.value === 'large');
const showStats = computed(() => props.showStats);

// LED样式计算
const getLEDStyle = (index: number) => {
  if (layoutMode.value === 'circle') {
    const angle = (360 / totalLEDs.value) * index;
    const radius = 80;
    const centerX = 50;
    const centerY = 50;
    const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180);
    
    return {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)'
    };
  }
  
  return {};
};

const getLEDGlowSize = () => {
  switch (ledSize.value) {
    case 'small': return '4px';
    case 'medium': return '6px';
    case 'large': return '8px';
    default: return '6px';
  }
};

const getLEDIconSize = () => {
  switch (ledSize.value) {
    case 'small': return 12;
    case 'medium': return 16;
    case 'large': return 20;
    default: return 16;
  }
};

const formatLEDValue = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(2);
};

// 预定义颜色
const defaultColors = [
  '#ff4757', // 红色
  '#2ed573', // 绿色
  '#1e90ff', // 蓝色
  '#ffa502', // 橙色
  '#ff6b9d', // 粉色
  '#a55eea', // 紫色
  '#26de81', // 青绿色
  '#fd79a8', // 玫瑰色
  '#fdcb6e', // 黄色
  '#6c5ce7'  // 靛蓝色
];

// 方法
const initializeLEDs = async () => {
  try {
    isLoading.value = true;
    
    // 初始化LED状态数组
    const initialStates: LEDState[] = [];
    
    for (let i = 0; i < props.ledCount; i++) {
      const dataset = props.datasets[i];
      initialStates.push({
        state: false,
        color: dataset?.color || defaultColors[i % defaultColors.length],
        label: dataset?.title || `LED ${i + 1}`,
        value: dataset?.value ? Number(dataset.value) : undefined,
        icon: getRandomIcon(),
        blinking: false,
        brightness: 1.0
      });
    }
    
    ledStates.value = initialStates;
    ledData.value.states = initialStates;
    
    isLoading.value = false;
    console.log('LED面板初始化完成');
    
  } catch (error) {
    console.error('初始化LED面板时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : 'LED面板初始化失败';
    isLoading.value = false;
  }
};

const getRandomIcon = () => {
  const icons = [undefined, CircleCheck, Warning, InfoFilled, SuccessFilled];
  return icons[Math.floor(Math.random() * icons.length)];
};

const updateLEDState = (index: number, state: boolean, value?: number, blinking?: boolean) => {
  if (isPaused.value || index >= ledStates.value.length) return;
  
  ledStates.value[index].state = state;
  if (value !== undefined) {
    ledStates.value[index].value = value;
  }
  if (blinking !== undefined) {
    ledStates.value[index].blinking = blinking;
  }
  
  // 更新数据对象
  ledData.value.states = [...ledStates.value];
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const updateAllLEDs = (states: boolean[]) => {
  if (isPaused.value) return;
  
  states.forEach((state, index) => {
    if (index < ledStates.value.length) {
      ledStates.value[index].state = state;
    }
  });
  
  ledData.value.states = [...ledStates.value];
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const toggleLED = (index: number) => {
  if (index >= ledStates.value.length) return;
  
  ledStates.value[index].state = !ledStates.value[index].state;
  ledData.value.states = [...ledStates.value];
  
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

const handleLayoutChange = (command: string) => {
  layoutMode.value = command as 'grid' | 'row' | 'column' | 'circle';
};

const handleSizeChange = (command: string) => {
  ledSize.value = command as 'small' | 'medium' | 'large';
};

const handleBulkControl = (command: string) => {
  switch (command) {
    case 'all-on':
      ledStates.value.forEach(led => led.state = true);
      break;
    case 'all-off':
      ledStates.value.forEach(led => led.state = false);
      break;
    case 'toggle-all':
      ledStates.value.forEach(led => led.state = !led.state);
      break;
  }
  
  ledData.value.states = [...ledStates.value];
  lastUpdate.value = Date.now();
  recordFrame();
};

const handleRefresh = () => {
  initializeLEDs();
};

const handleSettings = () => {
  console.log('打开LED面板设置对话框');
};

const handleExport = () => {
  console.log('导出LED面板数据');
};

const handleResize = (size: { width: number; height: number }) => {
  // LED面板会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeLEDs();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      // 随机更新LED状态
      const randomIndex = Math.floor(Math.random() * ledStates.value.length);
      const randomState = Math.random() > 0.5;
      const randomBlinking = Math.random() > 0.8;
      
      updateLEDState(randomIndex, randomState, undefined, randomBlinking);
      
      // 偶尔更新一些LED的闪烁状态
      if (Math.random() > 0.9) {
        ledStates.value.forEach(led => {
          if (Math.random() > 0.95) {
            led.blinking = !led.blinking;
          }
        });
      }
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeLEDs();
  
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
  initializeLEDs();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateLEDState,
  updateAllLEDs,
  toggleLED,
  togglePause,
  getLEDStates: () => ledStates.value
});
</script>

<style scoped>
.led-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.led-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

/* 布局模式 */
.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 16px;
  max-width: 100%;
}

.layout-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.layout-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.layout-circle {
  position: relative;
  width: 200px;
  height: 200px;
}

/* LED尺寸 */
.size-small .led-item {
  width: 40px;
  height: 40px;
}

.size-medium .led-item {
  width: 60px;
  height: 60px;
}

.size-large .led-item {
  width: 80px;
  height: 80px;
}

.led-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.led-item.interactive:hover {
  transform: scale(1.1);
}

.led-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.led-circle.led-on {
  border-color: rgba(255, 255, 255, 0.8);
}

.led-circle.led-off {
  background-color: #333 !important;
  border-color: rgba(255, 255, 255, 0.1);
}

.led-circle.led-blinking {
  animation: ledBlink 1s ease-in-out infinite;
}

.led-reflection {
  position: absolute;
  top: 15%;
  left: 15%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  filter: blur(2px);
}

.led-icon {
  position: relative;
  z-index: 2;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.led-label {
  font-size: 10px;
  color: var(--el-text-color-primary);
  text-align: center;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.led-value {
  font-size: 9px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  text-align: center;
}

.led-loading {
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

.led-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  flex-wrap: wrap;
  gap: 8px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 60px;
}

.stats-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.stats-value {
  font-size: 14px;
  font-weight: bold;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.stats-value.active {
  color: var(--el-color-success);
}

.stats-value.inactive {
  color: var(--el-text-color-secondary);
}

.stats-value.blinking {
  color: var(--el-color-warning);
}

.led-footer-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.led-update {
  font-size: 12px;
  color: var(--el-color-success);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

@keyframes ledBlink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
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
  .led-container {
    min-height: 180px;
    gap: 12px;
  }
  
  .led-panel {
    padding: 16px;
  }
  
  .layout-grid {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    gap: 12px;
  }
  
  .layout-row,
  .layout-column {
    gap: 12px;
  }
  
  .layout-circle {
    width: 160px;
    height: 160px;
  }
  
  .led-stats {
    padding: 8px;
    gap: 6px;
  }
  
  .stats-item {
    min-width: 50px;
  }
  
  .stats-label {
    font-size: 9px;
  }
  
  .stats-value {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .led-container {
    min-height: 160px;
  }
  
  .led-panel {
    padding: 12px;
  }
  
  .layout-grid {
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    gap: 8px;
  }
  
  .layout-circle {
    width: 120px;
    height: 120px;
  }
  
  .size-small .led-item {
    width: 30px;
    height: 30px;
  }
  
  .size-medium .led-item {
    width: 45px;
    height: 45px;
  }
  
  .size-large .led-item {
    width: 60px;
    height: 60px;
  }
  
  .led-label {
    font-size: 9px;
  }
  
  .led-value {
    font-size: 8px;
  }
  
  .led-stats {
    flex-direction: column;
    gap: 4px;
  }
  
  .stats-item {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    min-width: auto;
  }
}
</style>
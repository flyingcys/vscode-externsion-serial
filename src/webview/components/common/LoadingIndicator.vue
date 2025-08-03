<!--
  统一加载指示器组件
  支持多种加载效果和进度反馈
-->

<template>
  <div class="loading-indicator" :class="loadingClasses">
    <!-- 旋转加载器 -->
    <div v-if="type === 'spinner'" class="loading-spinner">
      <el-icon 
        class="spinner-icon" 
        :size="iconSize"
        :color="themeColor"
      >
        <Loading />
      </el-icon>
      <div v-if="showText" class="loading-text">
        <div class="loading-title">{{ title }}</div>
        <div v-if="description" class="loading-description">{{ description }}</div>
      </div>
    </div>

    <!-- 进度条 -->
    <div v-else-if="type === 'progress'" class="loading-progress">
      <div v-if="showText" class="progress-header">
        <div class="progress-title">{{ title }}</div>
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
      </div>
      
      <el-progress
        :percentage="progress"
        :stroke-width="strokeWidth"
        :show-text="false"
        :color="progressColors"
        class="progress-bar"
      />
      
      <div v-if="description" class="progress-description">{{ description }}</div>
      
      <!-- 子进度显示 -->
      <div v-if="subProgress" class="sub-progress">
        <div class="sub-progress-text">
          {{ subProgress.label || t('loading.subProgress') }}: 
          {{ subProgress.current }}/{{ subProgress.total }}
        </div>
        <el-progress
          :percentage="(subProgress.current / subProgress.total) * 100"
          :stroke-width="4"
          :show-text="false"
          class="sub-progress-bar"
        />
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-else-if="type === 'skeleton'" class="loading-skeleton">
      <el-skeleton 
        :loading="true"
        :rows="skeletonRows"
        :animated="true"
        class="skeleton-content"
      >
        <template #template>
          <el-skeleton-item 
            v-if="skeletonAvatar"
            variant="circle" 
            style="width: 60px; height: 60px; margin-bottom: 16px;" 
          />
          <el-skeleton-item 
            variant="h1" 
            style="width: 60%; margin-bottom: 12px;" 
          />
          <el-skeleton-item 
            v-for="i in skeletonRows" 
            :key="i"
            variant="text" 
            :style="{ width: getSkeletonLineWidth(i) }"
          />
        </template>
      </el-skeleton>
    </div>

    <!-- 点动画 -->
    <div v-else-if="type === 'dots'" class="loading-dots">
      <div class="dots-container">
        <span 
          v-for="i in 3" 
          :key="i"
          class="dot" 
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        ></span>
      </div>
      <div v-if="showText" class="loading-text">
        <div class="loading-title">{{ title }}</div>
        <div v-if="description" class="loading-description">{{ description }}</div>
      </div>
    </div>

    <!-- 脉冲效果 -->
    <div v-else-if="type === 'pulse'" class="loading-pulse">
      <div class="pulse-container">
        <div class="pulse-circle"></div>
        <div class="pulse-circle-inner"></div>
      </div>
      <div v-if="showText" class="loading-text">
        <div class="loading-title">{{ title }}</div>
        <div v-if="description" class="loading-description">{{ description }}</div>
      </div>
    </div>

    <!-- 波浪效果 -->
    <div v-else-if="type === 'wave'" class="loading-wave">
      <div class="wave-container">
        <div 
          v-for="i in 5" 
          :key="i"
          class="wave-bar"
          :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
        ></div>
      </div>
      <div v-if="showText" class="loading-text">
        <div class="loading-title">{{ title }}</div>
        <div v-if="description" class="loading-description">{{ description }}</div>
      </div>
    </div>

    <!-- 取消按钮 -->
    <div v-if="cancellable" class="loading-actions">
      <el-button 
        type="text" 
        size="small"
        @click="handleCancel"
      >
        {{ t('loading.cancel') }}
      </el-button>
    </div>

    <!-- 操作历史按钮 -->
    <div v-if="showHistory" class="loading-actions">
      <el-button 
        type="text" 
        size="small"
        @click="showLoadingHistory"
      >
        {{ t('loading.viewHistory') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { useI18n } from '../../composables/useI18n';
import { 
  LoadingType, 
  LoadingStatus, 
  type LoadingTask,
  globalLoadingManager 
} from '../../../shared/LoadingStateManager';

// Props
interface Props {
  type?: LoadingType;
  title?: string;
  description?: string;
  progress?: number;
  subProgress?: {
    current: number;
    total: number;
    label?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  cancellable?: boolean;
  showHistory?: boolean;
  taskId?: string;
  overlay?: boolean;
  fullscreen?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  
  // 骨架屏特定属性
  skeletonRows?: number;
  skeletonAvatar?: boolean;
  
  // 样式定制
  customColor?: string;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: LoadingType.SPINNER,
  title: '',
  description: '',
  progress: 0,
  size: 'medium',
  showText: true,
  cancellable: false,
  showHistory: false,
  overlay: false,
  fullscreen: false,
  theme: 'auto',
  skeletonRows: 3,
  skeletonAvatar: false,
  strokeWidth: 8
});

// Emits
const emit = defineEmits<{
  cancel: [];
  showHistory: [];
}>();

// Composables
const { t } = useI18n();

// Reactive state
const currentTask = ref<LoadingTask | null>(null);

// Computed
const loadingClasses = computed(() => [
  `loading-indicator--${props.type}`,
  `loading-indicator--${props.size}`,
  `loading-indicator--${props.theme}`,
  {
    'loading-indicator--overlay': props.overlay,
    'loading-indicator--fullscreen': props.fullscreen,
    'loading-indicator--cancellable': props.cancellable,
    'loading-indicator--with-text': props.showText && (props.title || props.description)
  }
]);

const iconSize = computed(() => {
  const sizes = {
    small: 20,
    medium: 32,
    large: 48
  };
  return sizes[props.size];
});

const themeColor = computed(() => {
  if (props.customColor) return props.customColor;
  
  return 'var(--el-color-primary)';
});

const progressColors = computed(() => {
  if (props.customColor) return props.customColor;
  
  return [
    { color: '#f56565', percentage: 20 },
    { color: '#ed8936', percentage: 40 },
    { color: '#ecc94b', percentage: 60 },
    { color: '#48bb78', percentage: 80 },
    { color: '#38a169', percentage: 100 }
  ];
});

// Methods
const getSkeletonLineWidth = (index: number): string => {
  // 创建不同宽度的骨架线条
  const widths = ['90%', '75%', '85%', '60%', '80%'];
  return widths[(index - 1) % widths.length];
};

const handleCancel = () => {
  if (props.taskId) {
    globalLoadingManager.cancelTask(props.taskId);
  }
  emit('cancel');
};

const showLoadingHistory = () => {
  emit('showHistory');
};

// 监听任务状态变化
let taskListener: ((task: LoadingTask) => void) | null = null;
let stateListener: ((state: any) => void) | null = null;

const setupTaskListeners = () => {
  if (!props.taskId) return;

  // 获取当前任务
  currentTask.value = globalLoadingManager.getTask(props.taskId) || null;

  // 监听任务进度更新
  taskListener = ({ task }) => {
    if (task.id === props.taskId) {
      currentTask.value = task;
    }
  };

  globalLoadingManager.on('task:progress', taskListener);

  // 监听任务完成
  const completionListener = ({ task }) => {
    if (task.id === props.taskId) {
      currentTask.value = task;
    }
  };

  globalLoadingManager.on('task:completed', completionListener);
  globalLoadingManager.on('task:failed', completionListener);
  globalLoadingManager.on('task:cancelled', completionListener);
};

const cleanupTaskListeners = () => {
  if (taskListener) {
    globalLoadingManager.off('task:progress', taskListener);
    taskListener = null;
  }
};

// Lifecycle
onMounted(() => {
  setupTaskListeners();
});

onUnmounted(() => {
  cleanupTaskListeners();
});

// Watch for taskId changes
watch(() => props.taskId, () => {
  cleanupTaskListeners();
  setupTaskListeners();
});

// Expose task information
defineExpose({
  currentTask: computed(() => currentTask.value),
  isLoading: computed(() => currentTask.value?.status === LoadingStatus.LOADING),
  canCancel: computed(() => currentTask.value?.cancellable || props.cancellable)
});
</script>

<style scoped>
/* 基础样式 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--el-text-color-primary);
}

.loading-indicator--overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.loading-indicator--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 2000;
}

/* 尺寸变体 */
.loading-indicator--small {
  padding: 8px;
}

.loading-indicator--small .loading-text {
  font-size: 12px;
}

.loading-indicator--medium {
  padding: 16px;
}

.loading-indicator--large {
  padding: 24px;
}

.loading-indicator--large .loading-text {
  font-size: 16px;
}

/* 旋转加载器 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 进度条 */
.loading-progress {
  width: 100%;
  max-width: 400px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.progress-percentage {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 600;
}

.progress-bar {
  margin-bottom: 8px;
}

.progress-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.sub-progress {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-light);
}

.sub-progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.sub-progress-bar {
  --el-progress-bg-color: var(--el-fill-color-light);
}

/* 骨架屏 */
.loading-skeleton {
  width: 100%;
  max-width: 600px;
}

.skeleton-content {
  --el-skeleton-color: var(--el-fill-color);
  --el-skeleton-to-color: var(--el-fill-color-light);
}

/* 点动画 */
.loading-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.dots-container {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-primary);
  animation: dotPulse 1.4s ease-in-out infinite both;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 脉冲效果 */
.loading-pulse {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pulse-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.pulse-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--el-color-primary);
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
}

.pulse-circle-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border-radius: 50%;
  background: var(--el-color-primary);
  animation: pulse 2s ease-in-out infinite;
  animation-delay: 0.5s;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 波浪效果 */
.loading-wave {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.wave-container {
  display: flex;
  gap: 2px;
  align-items: end;
  height: 40px;
}

.wave-bar {
  width: 4px;
  height: 100%;
  background: var(--el-color-primary);
  border-radius: 2px;
  animation: waveAnimation 1.2s ease-in-out infinite;
}

@keyframes waveAnimation {
  0%, 100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}

/* 文本样式 */
.loading-text {
  text-align: center;
}

.loading-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
}

.loading-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

/* 操作按钮 */
.loading-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

/* 主题适配 */
.loading-indicator--dark {
  --el-text-color-primary: #ffffff;
  --el-text-color-secondary: #cccccc;
}

.loading-indicator--dark.loading-indicator--overlay {
  background: rgba(0, 0, 0, 0.8);
}

.loading-indicator--dark.loading-indicator--fullscreen {
  background: rgba(0, 0, 0, 0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-indicator--fullscreen {
    padding: 20px;
  }
  
  .loading-progress {
    max-width: 280px;
  }
  
  .progress-header {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .loading-indicator--large {
    padding: 16px;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .spinner-icon,
  .dot,
  .pulse-circle,
  .pulse-circle-inner,
  .wave-bar {
    animation: none;
  }
  
  .loading-indicator {
    /* 提供静态指示 */
  }
}

/* RTL 支持 */
[dir="rtl"] .progress-header {
  direction: rtl;
}

[dir="rtl"] .loading-actions {
  direction: rtl;
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .loading-indicator {
    --el-color-primary: #0066cc;
  }
  
  .loading-indicator--overlay,
  .loading-indicator--fullscreen {
    background: rgba(255, 255, 255, 0.98);
  }
  
  .dot,
  .pulse-circle,
  .pulse-circle-inner,
  .wave-bar {
    background: #0066cc;
  }
}
</style>
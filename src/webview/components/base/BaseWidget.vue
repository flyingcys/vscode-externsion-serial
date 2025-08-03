<!--
  BaseWidget - 所有可视化组件的基础组件
  基于Serial Studio的Widget设计，提供统一的外观和行为
-->

<template>
  <div 
    :class="[
      'base-widget',
      `widget-${widgetType}`,
      {
        'widget-selected': isSelected,
        'widget-disabled': !isEnabled,
        'widget-error': hasError,
        'widget-loading': isLoading,
        'widget-fullscreen': isFullscreen
      }
    ]"
    :style="widgetStyle"
  >
    <!-- Widget标题栏 -->
    <div 
      v-if="showTitleBar" 
      class="widget-header"
      @dblclick="toggleFullscreen"
    >
      <div class="header-left">
        <!-- Widget图标 -->
        <el-icon v-if="widgetIcon" :class="['widget-icon', iconClass]">
          <component :is="widgetIcon" />
        </el-icon>
        
        <!-- Widget标题 -->
        <span class="widget-title">{{ displayTitle }}</span>
        
        <!-- 状态指示器 -->
        <div v-if="showStatus" class="status-indicators">
          <el-tag 
            v-if="connectionStatus"
            :type="statusTagType"
            size="small"
            effect="plain"
          >
            {{ connectionStatus }}
          </el-tag>
          
          <el-tooltip v-if="hasError" content="组件错误" placement="bottom">
            <el-icon class="error-icon">
              <WarningFilled />
            </el-icon>
          </el-tooltip>
          
          <el-tooltip v-if="isLoading" content="加载中..." placement="bottom">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <div class="header-right">
        <!-- 自定义工具栏按钮 -->
        <slot name="toolbar" />
        
        <!-- 默认工具栏 -->
        <el-button-group v-if="showDefaultToolbar" size="small">
          <!-- 刷新按钮 -->
          <el-tooltip content="刷新" placement="bottom">
            <el-button 
              :icon="Refresh"
              @click="handleRefresh"
              :disabled="!isEnabled"
            />
          </el-tooltip>
          
          <!-- 设置按钮 -->
          <el-tooltip content="设置" placement="bottom">
            <el-button 
              :icon="Setting"
              @click="handleSettings"
              :disabled="!isEnabled"
            />
          </el-tooltip>
          
          <!-- 导出按钮 -->
          <el-tooltip content="导出数据" placement="bottom">
            <el-button 
              :icon="Download"
              @click="handleExport"
              :disabled="!isEnabled || !hasData"
            />
          </el-tooltip>
          
          <!-- 全屏按钮 -->
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏显示'" placement="bottom">
            <el-button 
              :icon="isFullscreen ? FullScreen : FullScreen"
              @click="toggleFullscreen"
            />
          </el-tooltip>
        </el-button-group>
      </div>
    </div>

    <!-- Widget内容区域 -->
    <div 
      class="widget-content"
      :style="contentStyle"
    >
      <!-- 加载状态 -->
      <div v-if="isLoading && showLoadingOverlay" class="loading-overlay">
        <el-icon class="loading-spinner">
          <Loading />
        </el-icon>
        <span>{{ loadingText }}</span>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="hasError && showErrorOverlay" class="error-overlay">
        <el-icon class="error-icon">
          <WarningFilled />
        </el-icon>
        <div class="error-content">
          <div class="error-title">{{ errorTitle }}</div>
          <div class="error-message">{{ errorMessage }}</div>
          <el-button 
            v-if="allowRetry" 
            type="primary" 
            size="small" 
            @click="handleRetry"
          >
            重试
          </el-button>
        </div>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="!hasData && showEmptyState" class="empty-state">
        <el-icon class="empty-icon">
          <DocumentRemove />
        </el-icon>
        <div class="empty-content">
          <div class="empty-title">{{ emptyTitle }}</div>
          <div class="empty-message">{{ emptyMessage }}</div>
        </div>
      </div>
      
      <!-- 主要内容插槽 -->
      <div v-else class="widget-main-content">
        <slot :data="widgetData" :config="widgetConfig" />
      </div>
    </div>

    <!-- Widget脚注 -->
    <div v-if="showFooter" class="widget-footer">
      <div class="footer-left">
        <slot name="footer-left">
          <span v-if="showDataCount" class="data-count">
            数据点: {{ dataCount }}
          </span>
        </slot>
      </div>
      
      <div class="footer-right">
        <slot name="footer-right">
          <span v-if="showUpdateTime" class="update-time">
            更新: {{ lastUpdateText }}
          </span>
        </slot>
      </div>
    </div>

    <!-- 设置对话框 -->
    <WidgetSettingsDialog
      v-model="showSettingsDialog"
      :widget-type="widgetType"
      :config="widgetConfig"
      @settings-changed="handleSettingsChanged"
    />
    
    <!-- 导出对话框 -->
    <WidgetExportDialog
      v-model="showExportDialog"
      :widget-type="widgetType"
      :data="widgetData"
      @export-confirmed="handleExportConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue';
import { 
  Refresh, 
  Setting, 
  Download, 
  FullScreen,
  WarningFilled,
  Loading,
  DocumentRemove
} from '@element-plus/icons-vue';

import { WidgetType, Dataset, WidgetConfig } from '../../../shared/types';
import WidgetSettingsDialog from '../dialogs/WidgetSettingsDialog.vue';
import WidgetExportDialog from '../dialogs/WidgetExportDialog.vue';

// Props定义
interface Props {
  // 基础属性
  widgetType: WidgetType;
  title?: string;
  
  // 数据相关
  datasets?: Dataset[];
  widgetData?: any;
  widgetConfig?: WidgetConfig;
  
  // 外观设置
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  
  // 功能控制
  isEnabled?: boolean;
  isSelected?: boolean;
  showTitleBar?: boolean;
  showFooter?: boolean;
  showDefaultToolbar?: boolean;
  showStatus?: boolean;
  
  // 状态控制
  isLoading?: boolean;
  loadingText?: string;
  showLoadingOverlay?: boolean;
  
  // 错误处理
  hasError?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  showErrorOverlay?: boolean;
  allowRetry?: boolean;
  
  // 空状态
  hasData?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  showEmptyState?: boolean;
  
  // 更新信息
  showDataCount?: boolean;
  showUpdateTime?: boolean;
  lastUpdate?: number;
  
  // 连接状态
  connectionStatus?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isEnabled: true,
  isSelected: false,
  showTitleBar: true,
  showFooter: true,
  showDefaultToolbar: true,
  showStatus: true,
  
  isLoading: false,
  loadingText: '加载中...',
  showLoadingOverlay: true,
  
  hasError: false,
  errorTitle: '组件错误',
  errorMessage: '组件运行时发生错误',
  showErrorOverlay: true,
  allowRetry: true,
  
  hasData: true,
  emptyTitle: '暂无数据',
  emptyMessage: '等待数据传入...',
  showEmptyState: true,
  
  showDataCount: true,
  showUpdateTime: true,
  
  connectionStatus: ''
});

// Emits定义
const emit = defineEmits<{
  refresh: [];
  settings: [];
  export: [data: any];
  fullscreen: [isFullscreen: boolean];
  retry: [];
  resize: [size: { width: number; height: number }];
  'settings-changed': [config: WidgetConfig];
}>();

// 响应式状态
const isFullscreen = ref(false);
const showSettingsDialog = ref(false);
const showExportDialog = ref(false);

// 依赖注入
const messageBridge = inject('messageBridge');

// 计算属性
const displayTitle = computed(() => {
  if (props.title) return props.title;
  if (props.datasets && props.datasets.length > 0) {
    return props.datasets[0].title;
  }
  return getDefaultTitle(props.widgetType);
});

const widgetIcon = computed(() => {
  return getWidgetIcon(props.widgetType);
});

const iconClass = computed(() => {
  return `icon-${props.widgetType}`;
});

const statusTagType = computed(() => {
  if (!props.connectionStatus) return 'info';
  
  const status = props.connectionStatus.toLowerCase();
  if (status.includes('connected') || status.includes('已连接')) return 'success';
  if (status.includes('error') || status.includes('错误')) return 'danger';
  if (status.includes('connecting') || status.includes('连接中')) return 'warning';
  return 'info';
});

const dataCount = computed(() => {
  if (props.widgetData !== undefined) {
    if (Array.isArray(props.widgetData)) return props.widgetData.length;
    return 1; // Single data item
  }
  if (props.datasets) return props.datasets.length;
  return 0;
});

const lastUpdateText = computed(() => {
  if (!props.lastUpdate) return '从未';
  
  const now = Date.now();
  const diff = now - props.lastUpdate;
  
  if (diff < 1000) return '刚刚';
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  return `${Math.floor(diff / 3600000)}小时前`;
});

const widgetStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.width) style.width = `${props.width}px`;
  if (props.height) style.height = `${props.height}px`;
  if (props.minWidth) style.minWidth = `${props.minWidth}px`;
  if (props.minHeight) style.minHeight = `${props.minHeight}px`;
  if (props.maxWidth) style.maxWidth = `${props.maxWidth}px`;
  if (props.maxHeight) style.maxHeight = `${props.maxHeight}px`;
  
  return style;
});

const contentStyle = computed(() => {
  const style: Record<string, string> = {};
  
  // 计算内容区域高度（减去标题栏和脚注高度）
  let contentHeight = '100%';
  if (props.showTitleBar && props.showFooter) {
    contentHeight = 'calc(100% - 80px)';
  } else if (props.showTitleBar || props.showFooter) {
    contentHeight = 'calc(100% - 40px)';
  }
  
  style.height = contentHeight;
  
  return style;
});

// 方法
const handleRefresh = () => {
  emit('refresh');
};

const handleSettings = () => {
  showSettingsDialog.value = true;
  emit('settings');
};

const handleExport = () => {
  showExportDialog.value = true;
  emit('export', props.widgetData);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  emit('fullscreen', isFullscreen.value);
};

const handleRetry = () => {
  emit('retry');
};

const handleSettingsChanged = (config: WidgetConfig) => {
  emit('settings-changed', config);
};

const handleExportConfirmed = (exportData: any) => {
  // 处理导出逻辑
  console.log('导出数据:', exportData);
};

// 工具函数
const getDefaultTitle = (type: WidgetType): string => {
  const titles: Record<WidgetType, string> = {
    [WidgetType.Plot]: '数据图表',
    [WidgetType.MultiPlot]: '多数据图表',
    [WidgetType.Gauge]: '仪表盘',
    [WidgetType.Bar]: '条形图',
    [WidgetType.Compass]: '指南针',
    [WidgetType.Accelerometer]: '加速度计',
    [WidgetType.Gyroscope]: '陀螺仪',
    [WidgetType.GPS]: 'GPS地图',
    [WidgetType.LED]: 'LED面板',
    [WidgetType.DataGrid]: '数据网格',
    [WidgetType.Terminal]: '终端',
    [WidgetType.FFT]: '频谱分析',
    [WidgetType.Plot3D]: '3D图表'
  };
  
  return titles[type] || '未知组件';
};

const getWidgetIcon = (type: WidgetType): string => {
  const icons: Record<WidgetType, string> = {
    [WidgetType.Plot]: 'TrendCharts',
    [WidgetType.MultiPlot]: 'DataAnalysis',
    [WidgetType.Gauge]: 'Timer',
    [WidgetType.Bar]: 'Histogram',
    [WidgetType.Compass]: 'Compass',
    [WidgetType.Accelerometer]: 'Position',
    [WidgetType.Gyroscope]: 'Position',
    [WidgetType.GPS]: 'Location',
    [WidgetType.LED]: 'Lightning',
    [WidgetType.DataGrid]: 'Grid',
    [WidgetType.Terminal]: 'Monitor',
    [WidgetType.FFT]: 'DataLine',
    [WidgetType.Plot3D]: 'Box'
  };
  
  return icons[type] || 'QuestionFilled';
};

// 生命周期
onMounted(() => {
  // 注册resize监听器
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        emit('resize', { width, height });
      }
    });
    
    resizeObserver.observe(document.querySelector('.base-widget') as Element);
    
    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});

// 监听属性变化
watch(() => props.isSelected, (selected) => {
  if (selected) {
    // 组件被选中时的处理
    console.log(`Widget ${props.widgetType} selected`);
  }
});
</script>

<style scoped>
.base-widget {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-blank);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.base-widget:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.widget-selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.widget-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.widget-error {
  border-color: var(--el-color-danger);
}

.widget-loading {
  pointer-events: none;
}

.widget-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  border-radius: 0 !important;
}

/* 标题栏样式 */
.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  min-height: 40px;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.widget-icon {
  font-size: 16px;
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.widget-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.error-icon,
.loading-icon {
  font-size: 14px;
}

.error-icon {
  color: var(--el-color-danger);
}

.loading-icon {
  color: var(--el-color-warning);
  animation: spin 1s linear infinite;
}

.header-right {
  flex-shrink: 0;
}

/* 内容区域样式 */
.widget-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.widget-main-content {
  width: 100%;
  height: 100%;
}

/* 加载覆盖层 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  z-index: 10;
}

.loading-spinner {
  font-size: 24px;
  color: var(--el-color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

/* 错误覆盖层 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(245, 108, 108, 0.05);
  z-index: 10;
}

.error-overlay .error-icon {
  font-size: 32px;
  color: var(--el-color-danger);
  margin-bottom: 12px;
}

.error-content {
  text-align: center;
  max-width: 80%;
}

.error-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-color-danger);
  margin-bottom: 4px;
}

.error-message {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
}

/* 空状态 */
.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--el-text-color-placeholder);
  z-index: 5;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.empty-content {
  text-align: center;
  max-width: 80%;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-message {
  font-size: 14px;
  line-height: 1.4;
}

/* 脚注样式 */
.widget-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-height: 32px;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 动画 */
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
  .widget-header {
    padding: 6px 8px;
  }
  
  .widget-title {
    font-size: 13px;
  }
  
  .widget-footer {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
<!--
  Main Application Component for Serial Studio VSCode Extension
  基于Serial Studio的主界面设计
-->

<template>
  <div id="app" :class="['serial-studio-app', themeClass]">
    <!-- 应用标题栏 -->
    <div class="app-header">
      <div class="header-left">
        <el-icon class="app-icon">
          <Connection />
        </el-icon>
        <span class="app-title">Serial Studio</span>
        <el-tag v-if="connectionStore.isConnected" type="success" size="small">
          已连接
        </el-tag>
        <el-tag v-else type="info" size="small">
          未连接
        </el-tag>
      </div>
      
      <div class="header-right">
        <el-button-group size="small">
          <el-button 
            :icon="dataStore.isPaused ? VideoPlay : VideoPause"
            @click="togglePause"
          >
            {{ dataStore.isPaused ? '恢复' : '暂停' }}
          </el-button>
          
          <el-button 
            icon="Refresh"
            @click="clearData"
          >
            清除
          </el-button>
          
          <el-button 
            icon="Setting"
            @click="showSettings = true"
          >
            设置
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="app-content">
      <!-- 侧边栏 -->
      <div class="sidebar" v-if="!isFullscreen">
        <el-tabs v-model="activeTab" tab-position="left" stretch>
          <!-- 连接设置标签页 -->
          <el-tab-pane label="连接" name="connection">
            <template #label>
              <el-icon><Connection /></el-icon>
              <span>连接</span>
            </template>
            <ConnectionPanel />
          </el-tab-pane>
          
          <!-- 项目配置标签页 -->
          <el-tab-pane label="项目" name="project">
            <template #label>
              <el-icon><Document /></el-icon>
              <span>项目</span>
            </template>
            <ProjectPanel />
          </el-tab-pane>
          
          <!-- 控制台标签页 -->
          <el-tab-pane label="控制台" name="console">
            <template #label>
              <el-icon><Monitor /></el-icon>
              <span>控制台</span>
            </template>
            <ConsolePanel />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 主面板 -->
      <div class="main-panel">
        <!-- 工具栏 -->
        <div class="toolbar" v-if="!isFullscreen">
          <div class="toolbar-left">
            <el-button-group size="small">
              <el-button 
                icon="FullScreen"
                @click="toggleFullscreen"
                title="全屏显示"
              />
              
              <el-button 
                icon="Grid"
                @click="showLayoutSelector = true"
                title="布局设置"
              />
            </el-button-group>
          </div>
          
          <div class="toolbar-center">
            <el-text class="performance-info" size="small" type="info">
              FPS: {{ performanceInfo.fps }} | 
              延迟: {{ performanceInfo.latency }}ms |
              内存: {{ performanceInfo.memory }}MB
            </el-text>
          </div>
          
          <div class="toolbar-right">
            <el-button-group size="small">
              <el-button 
                icon="Download"
                @click="exportData"
                title="导出数据"
              />
              
              <el-button 
                icon="Camera"
                @click="captureScreenshot"
                title="截图"
              />
            </el-button-group>
          </div>
        </div>

        <!-- 仪表盘区域 -->
        <div class="dashboard-container">
          <DashboardLayout
            :widgets="dataStore.widgets"
            :layout="layoutStore.currentLayout"
            @widget-resize="handleWidgetResize"
            @widget-move="handleWidgetMove"
          />
        </div>
      </div>
    </div>

    <!-- 设置对话框 -->
    <SettingsDialog 
      v-model="showSettings"
      @settings-changed="handleSettingsChange"
    />
    
    <!-- 布局选择器 -->
    <LayoutSelector
      v-model="showLayoutSelector"
      @layout-selected="handleLayoutSelected"
    />

    <!-- 错误提示 -->
    <el-backtop :right="100" :bottom="100" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Connection, 
  Document, 
  Monitor, 
  VideoPlay, 
  VideoPause,
  FullScreen,
  Grid,
  Download,
  Camera
} from '@element-plus/icons-vue';

import { useConnectionStore } from './stores/connection';
import { useDataStore } from './stores/data';
import { useThemeStore } from './stores/theme';
import { useLayoutStore } from './stores/layout';
import { usePerformanceStore } from './stores/performance';

import ConnectionPanel from './components/panels/ConnectionPanel.vue';
import ProjectPanel from './components/panels/ProjectPanel.vue';  
import ConsolePanel from './components/panels/ConsolePanel.vue';
import DashboardLayout from './components/layout/DashboardLayout.vue';
import SettingsDialog from './components/dialogs/SettingsDialog.vue';
import LayoutSelector from './components/dialogs/LayoutSelector.vue';

// 状态管理
const connectionStore = useConnectionStore();
const dataStore = useDataStore();
const themeStore = useThemeStore();
const layoutStore = useLayoutStore();
const performanceStore = usePerformanceStore();

// 响应式数据
const activeTab = ref('connection');
const showSettings = ref(false);
const showLayoutSelector = ref(false);
const isFullscreen = ref(false);

// 计算属性
const themeClass = computed(() => themeStore.isDarkMode ? 'dark' : 'light');

const performanceInfo = computed(() => ({
  fps: performanceStore.fps,
  latency: performanceStore.latency,
  memory: Math.round(performanceStore.memoryUsage)
}));

// 方法
const togglePause = () => {
  dataStore.togglePause();
};

const clearData = () => {
  dataStore.clearAllData();
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const exportData = () => {
  // TODO: 实现数据导出功能
  console.log('导出数据');
};

const captureScreenshot = () => {
  // TODO: 实现截图功能
  console.log('截图');
};

const handleWidgetResize = (widgetId: string, size: { width: number; height: number }) => {
  layoutStore.updateWidgetSize(widgetId, size);
};

const handleWidgetMove = (widgetId: string, position: { x: number; y: number }) => {
  layoutStore.updateWidgetPosition(widgetId, position);
};

const handleSettingsChange = (settings: any) => {
  // 处理设置变更
  console.log('设置已更改:', settings);
};

const handleLayoutSelected = (layout: any) => {
  layoutStore.setLayout(layout);
};

// 生命周期
onMounted(() => {
  // 启动性能监控
  performanceStore.startMonitoring();
  
  // 监听键盘快捷键
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  // 停止性能监控
  performanceStore.stopMonitoring();
  
  // 移除事件监听器
  document.removeEventListener('keydown', handleKeydown);
});

const handleKeydown = (event: KeyboardEvent) => {
  // F11: 全屏切换
  if (event.key === 'F11') {
    event.preventDefault();
    toggleFullscreen();
  }
  
  // Ctrl+P: 暂停/恢复
  if (event.ctrlKey && event.key === 'p') {
    event.preventDefault();
    togglePause();
  }
  
  // Ctrl+Shift+C: 清除数据
  if (event.ctrlKey && event.shiftKey && event.key === 'C') {
    event.preventDefault();
    clearData();
  }
};
</script>

<style scoped>
.serial-studio-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-blank);
  min-height: 48px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-blank);
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-blank);
  min-height: 40px;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.performance-info {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dashboard-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: var(--el-bg-color-page);
}

/* 暗色主题样式 */
.dark {
  --el-bg-color-page: #1a1a1a;
  --el-text-color-primary: #e8e8e8;
  --el-fill-color-blank: #2d2d2d;
  --el-border-color-light: #404040;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }
  
  .toolbar-center {
    display: none;
  }
}

@media (max-width: 576px) {
  .app-header {
    padding: 4px 8px;
  }
  
  .toolbar {
    padding: 4px 8px;
  }
  
  .dashboard-container {
    padding: 8px;
  }
}
</style>
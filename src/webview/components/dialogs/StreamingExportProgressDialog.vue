<!--
  流式导出进度监控对话框
  对应Serial-Studio的实时导出监控功能
  支持进度监控、暂停/恢复、取消等操作
-->

<template>
  <el-dialog
    v-model="visible"
    title="流式导出进度"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="streaming-progress-dialog"
  >
    <div class="progress-container">
      <!-- 导出句柄列表 -->
      <div v-if="exportHandles.length === 0" class="no-exports">
        <el-empty description="当前没有活跃的流式导出任务" />
      </div>
      
      <div v-else class="export-list">
        <el-card
          v-for="handle in exportHandles"
          :key="handle.id"
          shadow="hover"
          class="export-card"
          :class="{ 
            'export-error': handle.state === 'error',
            'export-completed': handle.state === 'completed',
            'export-paused': handle.state === 'paused'
          }"
        >
          <!-- 卡片头部 -->
          <template #header>
            <div class="card-header">
              <div class="export-info">
                <span class="export-title">
                  {{ getExportTitle(handle) }}
                </span>
                <el-tag
                  :type="getStateTagType(handle.state)"
                  size="small"
                  class="state-tag"
                >
                  {{ getStateText(handle.state) }}
                </el-tag>
              </div>
              <div class="export-actions">
                <el-button-group size="small">
                  <el-button
                    v-if="handle.state === 'writing'"
                    type="warning"
                    @click="pauseExport(handle)"
                    :icon="VideoPause"
                  >
                    暂停
                  </el-button>
                  <el-button
                    v-else-if="handle.state === 'paused'"
                    type="success"
                    @click="resumeExport(handle)"
                    :icon="VideoPlay"
                  >
                    恢复
                  </el-button>
                  <el-button
                    v-if="['writing', 'paused'].includes(handle.state)"
                    type="danger"
                    @click="cancelExport(handle)"
                    :icon="Close"
                  >
                    取消
                  </el-button>
                  <el-button
                    v-if="handle.state === 'completed'"
                    type="primary"
                    @click="openExportFile(handle)"
                    :icon="FolderOpened"
                  >
                    打开文件
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          
          <!-- 进度信息 -->
          <div class="progress-info">
            <!-- 进度条 -->
            <div class="progress-bar-section">
              <el-progress
                :percentage="handle.progress.percentage"
                :status="getProgressStatus(handle.state)"
                :stroke-width="8"
                :show-text="true"
                class="main-progress"
              />
              
              <!-- 分块进度（如果有） -->
              <div v-if="handle.progress.totalChunks > 1" class="chunk-progress">
                <span class="chunk-info">
                  块进度: {{ handle.progress.currentChunk }}/{{ handle.progress.totalChunks }}
                </span>
                <el-progress
                  :percentage="(handle.progress.currentChunk / handle.progress.totalChunks) * 100"
                  :stroke-width="4"
                  :show-text="false"
                  size="small"
                />
              </div>
            </div>
            
            <!-- 统计信息 -->
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">已写入记录</div>
                <div class="stat-value">{{ formatNumber(handle.progress.recordsWritten) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">总记录数</div>
                <div class="stat-value">{{ formatNumber(handle.progress.totalRecords) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">已写入字节</div>
                <div class="stat-value">{{ formatBytes(handle.progress.bytesWritten) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">剩余时间</div>
                <div class="stat-value">{{ formatTime(handle.progress.estimatedTimeRemaining) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">运行时间</div>
                <div class="stat-value">{{ formatDuration(Date.now() - handle.startTime) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">输出文件</div>
                <div class="stat-value file-path" :title="handle.config.actualFilePath">
                  {{ getFileName(handle.config.actualFilePath) }}
                </div>
              </div>
            </div>
            
            <!-- 错误信息 -->
            <div v-if="handle.error" class="error-info">
              <el-alert
                :title="handle.error.message"
                type="error"
                :closable="false"
                show-icon
              />
            </div>
            
            <!-- 实时统计图表 -->
            <div v-if="handle.state === 'writing'" class="realtime-chart">
              <div class="chart-title">写入速度</div>
              <div class="speed-display">
                {{ calculateWriteSpeed(handle) }} 记录/秒
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="refreshStatus">刷新状态</el-button>
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { VideoPause, VideoPlay, Close, FolderOpened } from '@element-plus/icons-vue';
import type { StreamingExportHandle, StreamingExportState } from '../../../../../extension/export/types';

// Props
interface Props {
  visible: boolean;
  exportHandles: StreamingExportHandle[];
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  exportHandles: () => []
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'pause-export': [handle: StreamingExportHandle];
  'resume-export': [handle: StreamingExportHandle];
  'cancel-export': [handle: StreamingExportHandle];
  'refresh-status': [];
}>();

// Refs
const refreshTimer = ref<NodeJS.Timeout | null>(null);
const writeSpeedCache = ref(new Map<string, { records: number; timestamp: number; speed: number }>());

// 计算属性
const activeExports = computed(() => 
  props.exportHandles.filter(h => ['preparing', 'writing'].includes(h.state))
);

const completedExports = computed(() => 
  props.exportHandles.filter(h => h.state === 'completed')
);

const errorExports = computed(() => 
  props.exportHandles.filter(h => h.state === 'error')
);

// 监听可见性变化
watch(() => props.visible, (visible) => {
  if (visible) {
    startRefreshTimer();
  } else {
    stopRefreshTimer();
  }
});

// 组件挂载
onMounted(() => {
  if (props.visible) {
    startRefreshTimer();
  }
});

// 组件卸载
onUnmounted(() => {
  stopRefreshTimer();
});

// 方法
const getExportTitle = (handle: StreamingExportHandle): string => {
  const prefix = handle.config.filePrefix || 'export';
  const timestamp = new Date(handle.startTime).toLocaleTimeString();
  return `${prefix} (${timestamp})`;
};

const getStateText = (state: StreamingExportState): string => {
  const stateMap = {
    preparing: '准备中',
    writing: '写入中',
    paused: '已暂停',
    completed: '已完成',
    cancelled: '已取消',
    error: '错误'
  };
  return stateMap[state] || state;
};

const getStateTagType = (state: StreamingExportState): string => {
  const typeMap = {
    preparing: 'info',
    writing: 'primary',
    paused: 'warning',
    completed: 'success',
    cancelled: 'info',
    error: 'danger'
  };
  return typeMap[state] || 'info';
};

const getProgressStatus = (state: StreamingExportState): string | undefined => {
  const statusMap = {
    error: 'exception',
    completed: 'success',
    cancelled: 'warning'
  };
  return statusMap[state];
};

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (milliseconds: number): string => {
  if (milliseconds <= 0) return '未知';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}时${minutes % 60}分`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
};

const formatDuration = (milliseconds: number): string => {
  return formatTime(milliseconds);
};

const getFileName = (filePath?: string): string => {
  if (!filePath) return '未知';
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1];
};

const calculateWriteSpeed = (handle: StreamingExportHandle): number => {
  const cached = writeSpeedCache.value.get(handle.id);
  const now = Date.now();
  const currentRecords = handle.progress.recordsWritten;
  
  if (!cached) {
    writeSpeedCache.value.set(handle.id, {
      records: currentRecords,
      timestamp: now,
      speed: 0
    });
    return 0;
  }
  
  const timeDiff = now - cached.timestamp;
  const recordsDiff = currentRecords - cached.records;
  
  if (timeDiff >= 1000) { // 每秒更新一次
    const speed = recordsDiff / (timeDiff / 1000);
    writeSpeedCache.value.set(handle.id, {
      records: currentRecords,
      timestamp: now,
      speed: Math.round(speed)
    });
    return Math.round(speed);
  }
  
  return cached.speed;
};

const pauseExport = async (handle: StreamingExportHandle) => {
  try {
    await ElMessageBox.confirm(
      '确定要暂停这个导出任务吗？',
      '确认暂停',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    emit('pause-export', handle);
    ElMessage.success('导出任务已暂停');
  } catch {
    // 用户取消
  }
};

const resumeExport = (handle: StreamingExportHandle) => {
  emit('resume-export', handle);
  ElMessage.success('导出任务已恢复');
};

const cancelExport = async (handle: StreamingExportHandle) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个导出任务吗？已导出的数据将会保留。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    emit('cancel-export', handle);
    ElMessage.success('导出任务已取消');
  } catch {
    // 用户取消
  }
};

const openExportFile = (handle: StreamingExportHandle) => {
  if (handle.config.actualFilePath) {
    // 在实际环境中，这里会调用VSCode的文件打开API
    ElMessage.success(`打开文件: ${handle.config.actualFilePath}`);
  } else {
    ElMessage.warning('文件路径不可用');
  }
};

const refreshStatus = () => {
  emit('refresh-status');
  ElMessage.success('状态已刷新');
};

const startRefreshTimer = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
  }
  
  // 每2秒自动刷新一次状态
  refreshTimer.value = setInterval(() => {
    if (activeExports.value.length > 0) {
      emit('refresh-status');
    }
  }, 2000);
};

const stopRefreshTimer = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.streaming-progress-dialog {
  .progress-container {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .no-exports {
    padding: 40px 0;
    text-align: center;
  }
  
  .export-list {
    .export-card {
      margin-bottom: 16px;
      transition: all 0.3s;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.export-error {
        border-color: var(--el-color-danger);
      }
      
      &.export-completed {
        border-color: var(--el-color-success);
      }
      
      &.export-paused {
        border-color: var(--el-color-warning);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .export-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .export-title {
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
        }
      }
      
      .progress-info {
        .progress-bar-section {
          margin-bottom: 20px;
          
          .main-progress {
            margin-bottom: 12px;
          }
          
          .chunk-progress {
            .chunk-info {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-bottom: 4px;
              display: block;
            }
          }
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
          
          .stat-item {
            text-align: center;
            padding: 12px;
            background: var(--el-bg-color-page);
            border-radius: 6px;
            
            .stat-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-bottom: 4px;
            }
            
            .stat-value {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              
              &.file-path {
                font-size: 12px;
                font-weight: normal;
                word-break: break-all;
              }
            }
          }
        }
        
        .error-info {
          margin-bottom: 16px;
        }
        
        .realtime-chart {
          text-align: center;
          padding: 16px;
          background: var(--el-bg-color-page);
          border-radius: 6px;
          
          .chart-title {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-bottom: 8px;
          }
          
          .speed-display {
            font-size: 24px;
            font-weight: 600;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
  
  .dialog-footer {
    text-align: right;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .streaming-progress-dialog {
    width: 95% !important;
    
    .progress-container {
      max-height: 500px;
    }
    
    .export-list .export-card .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
}
</style>
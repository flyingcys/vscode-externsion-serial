<template>
  <el-dialog
    v-model="visible"
    title="导出进度"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="export-progress-content">
      <!-- 当前任务信息 -->
      <div class="task-info">
        <div class="task-title">
          <i :class="getStageIcon(progress.stage)"></i>
          {{ getStageTitle(progress.stage) }}
        </div>
        <div class="task-description">
          {{ getStageDescription(progress.stage) }}
        </div>
      </div>
      
      <!-- 主进度条 -->
      <div class="main-progress">
        <el-progress
          :percentage="progress.percentage"
          :status="getProgressStatus()"
          :stroke-width="20"
          :show-text="false"
        />
        <div class="progress-text">
          <span class="percentage">{{ Math.round(progress.percentage) }}%</span>
          <span class="records">{{ progress.processedRecords }} / {{ progress.totalRecords }}</span>
        </div>
      </div>
      
      <!-- 详细统计信息 -->
      <div class="progress-stats">
        <div class="stat-group">
          <div class="stat-item">
            <span class="stat-label">已处理记录:</span>
            <span class="stat-value">{{ formatNumber(progress.processedRecords) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总记录数:</span>
            <span class="stat-value">{{ formatNumber(progress.totalRecords) }}</span>
          </div>
        </div>
        
        <div class="stat-group">
          <div class="stat-item">
            <span class="stat-label">处理速度:</span>
            <span class="stat-value">{{ getProcessingSpeed() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预计剩余:</span>
            <span class="stat-value">{{ formatETA(progress.estimatedTimeRemaining) }}</span>
          </div>
        </div>
        
        <div v-if="progress.currentFile" class="stat-group">
          <div class="stat-item full-width">
            <span class="stat-label">当前文件:</span>
            <span class="stat-value file-path">{{ progress.currentFile }}</span>
          </div>
        </div>
      </div>
      
      <!-- 阶段进度指示器 -->
      <div class="stage-indicators">
        <div
          v-for="stage in stages"
          :key="stage.key"
          :class="[
            'stage-indicator',
            {
              'completed': isStageCompleted(stage.key),
              'active': progress.stage === stage.key,
              'pending': !isStageCompleted(stage.key) && progress.stage !== stage.key
            }
          ]"
        >
          <div class="stage-icon">
            <i v-if="isStageCompleted(stage.key)" class="el-icon-check"></i>
            <i v-else-if="progress.stage === stage.key" :class="stage.icon"></i>
            <i v-else class="el-icon-time"></i>
          </div>
          <div class="stage-text">{{ stage.title }}</div>
        </div>
      </div>
      
      <!-- 实时日志 -->
      <div v-if="showLogs" class="progress-logs">
        <div class="logs-header">
          <h4>处理日志</h4>
          <el-button type="text" size="small" @click="clearLogs">清除</el-button>
        </div>
        <div class="logs-content" ref="logsContainer">
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="['log-entry', `log-${log.level}`]"
          >
            <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
      
      <!-- 错误信息 -->
      <div v-if="error" class="error-section">
        <el-alert
          :title="error.title"
          :description="error.message"
          type="error"
          :closable="false"
          show-icon
        />
        <div v-if="error.details" class="error-details">
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <pre>{{ error.details }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      
      <!-- 成功信息 -->
      <div v-if="completed && !error" class="success-section">
        <el-result
          icon="success"
          title="导出完成"
          :sub-title="`已成功导出 ${progress.totalRecords} 条记录`"
        >
          <template #extra>
            <div class="success-actions">
              <el-button type="primary" @click="openFile">打开文件</el-button>
              <el-button @click="openFolder">打开所在文件夹</el-button>
            </div>
          </template>
        </el-result>
      </div>
    </div>
    
    <!-- 对话框底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="toggleLogs">
          {{ showLogs ? '隐藏日志' : '显示日志' }}
        </el-button>
        
        <div class="footer-actions">
          <el-button
            v-if="!completed && !error"
            type="danger"
            @click="handleCancel"
            :disabled="progress.stage === 'finalizing'"
          >
            {{ progress.stage === 'finalizing' ? '正在完成...' : '取消导出' }}
          </el-button>
          
          <el-button
            v-if="completed || error"
            type="primary"
            @click="handleClose"
          >
            关闭
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ExportProgress } from '@/extension/export/types';

// 阶段定义
const stages = [
  { key: 'preparing', title: '准备数据', icon: 'el-icon-loading' },
  { key: 'processing', title: '处理数据', icon: 'el-icon-processor' },
  { key: 'writing', title: '写入文件', icon: 'el-icon-document' },
  { key: 'finalizing', title: '完成导出', icon: 'el-icon-check' }
];

// 日志条目接口
interface LogEntry {
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
}

// 错误信息接口
interface ErrorInfo {
  title: string;
  message: string;
  details?: string;
}

// Props
interface Props {
  modelValue: boolean;
  progress: ExportProgress;
  completed?: boolean;
  error?: ErrorInfo | null;
}

const props = withDefaults(defineProps<Props>(), {
  completed: false,
  error: null
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'cancel': [];
  'close': [];
  'open-file': [filePath: string];
  'open-folder': [filePath: string];
}>();

// 响应式状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const showLogs = ref(false);
const logs = ref<LogEntry[]>([]);
const logsContainer = ref<HTMLElement>();
const startTime = ref<number>(Date.now());
const lastProcessedRecords = ref<number>(0);
const lastUpdateTime = ref<number>(Date.now());

// 计算属性
const getProgressStatus = () => {
  if (props.error) return 'exception';
  if (props.completed) return 'success';
  if (props.progress.percentage === 100) return 'success';
  return 'active';
};

const getProcessingSpeed = () => {
  const now = Date.now();
  const timeDiff = (now - lastUpdateTime.value) / 1000; // 秒
  const recordsDiff = props.progress.processedRecords - lastProcessedRecords.value;
  
  if (timeDiff > 0 && recordsDiff > 0) {
    const speed = recordsDiff / timeDiff;
    if (speed > 1000) {
      return `${(speed / 1000).toFixed(1)}k/s`;
    } else if (speed > 0) {
      return `${Math.round(speed)}/s`;
    }
  }
  
  return '计算中...';
};

// 方法
const getStageIcon = (stage: string) => {
  const stageConfig = stages.find(s => s.key === stage);
  return stageConfig?.icon || 'el-icon-time';
};

const getStageTitle = (stage: string) => {
  const titles = {
    preparing: '准备导出数据',
    processing: '处理和过滤数据',
    writing: '写入导出文件',
    finalizing: '完成导出操作'
  };
  return titles[stage] || '处理中';
};

const getStageDescription = (stage: string) => {
  const descriptions = {
    preparing: '正在收集和验证导出数据...',
    processing: '正在应用过滤条件和数据转换...',
    writing: '正在将数据写入目标文件...',
    finalizing: '正在完成文件写入和验证...'
  };
  return descriptions[stage] || '正在处理数据...';
};

const isStageCompleted = (stageKey: string) => {
  const currentIndex = stages.findIndex(s => s.key === props.progress.stage);
  const stageIndex = stages.findIndex(s => s.key === stageKey);
  return stageIndex < currentIndex || (props.completed && stageIndex <= currentIndex);
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatETA = (ms: number) => {
  if (ms <= 0) return '未知';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${seconds}秒`;
  }
};

const formatLogTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const addLog = (level: LogEntry['level'], message: string) => {
  logs.value.push({
    timestamp: Date.now(),
    level,
    message
  });
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(-100);
  }
  
  // 自动滚动到底部
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
    }
  });
};

const clearLogs = () => {
  logs.value = [];
};

const toggleLogs = () => {
  showLogs.value = !showLogs.value;
};

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消当前导出操作吗？已处理的数据将会丢失。',
      '确认取消',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '继续导出',
        type: 'warning'
      }
    );
    
    emit('cancel');
    addLog('warning', '用户取消了导出操作');
  } catch {
    // 用户取消确认对话框
  }
};

const handleClose = () => {
  emit('close');
  visible.value = false;
};

const openFile = () => {
  if (props.progress.currentFile) {
    emit('open-file', props.progress.currentFile);
  }
};

const openFolder = () => {
  if (props.progress.currentFile) {
    emit('open-folder', props.progress.currentFile);
  }
};

// 监听器
watch(() => props.progress, (newProgress, oldProgress) => {
  // 更新处理速度计算相关数据
  lastProcessedRecords.value = oldProgress?.processedRecords || 0;
  lastUpdateTime.value = Date.now();
  
  // 添加阶段变化日志
  if (oldProgress && newProgress.stage !== oldProgress.stage) {
    addLog('info', `进入阶段: ${getStageTitle(newProgress.stage)}`);
  }
  
  // 添加进度日志
  if (newProgress.processedRecords > 0 && newProgress.processedRecords % 1000 === 0) {
    addLog('info', `已处理 ${formatNumber(newProgress.processedRecords)} 条记录`);
  }
}, { deep: true });

watch(() => props.completed, (completed) => {
  if (completed) {
    addLog('info', '导出操作已完成');
  }
});

watch(() => props.error, (error) => {
  if (error) {
    addLog('error', `导出失败: ${error.message}`);
  }
});

// 初始化
onMounted(() => {
  startTime.value = Date.now();
  addLog('info', '开始导出操作');
});
</script>

<style scoped>
.export-progress-content {
  padding: 0;
}

.task-info {
  text-align: center;
  margin-bottom: 24px;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.task-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.main-progress {
  margin-bottom: 24px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
}

.percentage {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.records {
  color: var(--el-text-color-secondary);
}

.progress-stats {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.stat-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-group:last-child {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-item.full-width {
  align-items: flex-start;
  flex-direction: row;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.file-path {
  word-break: break-all;
  margin-left: 8px;
}

.stage-indicators {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.stage-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.stage-indicator:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: var(--el-border-color-light);
  z-index: 1;
}

.stage-indicator.completed:not(:last-child)::after {
  background-color: var(--el-color-success);
}

.stage-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}

.stage-indicator.completed .stage-icon {
  background-color: var(--el-color-success);
  color: white;
}

.stage-indicator.active .stage-icon {
  background-color: var(--el-color-primary);
  color: white;
  animation: pulse 2s infinite;
}

.stage-indicator.pending .stage-icon {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-disabled);
  border: 2px solid var(--el-border-color-light);
}

.stage-text {
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

.stage-indicator.active .stage-text {
  color: var(--el-color-primary);
  font-weight: 600;
}

.stage-indicator.completed .stage-text {
  color: var(--el-color-success);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 var(--el-color-primary);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.progress-logs {
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-lighter);
}

.logs-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.logs-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background-color: var(--el-bg-color);
}

.log-entry {
  display: flex;
  align-items: flex-start;
  padding: 4px 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  border-radius: 4px;
  margin-bottom: 2px;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-info {
  background-color: var(--el-fill-color-light);
}

.log-warning {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.log-error {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger-dark-2);
}

.log-time {
  margin-right: 8px;
  color: var(--el-text-color-disabled);
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.error-section,
.success-section {
  margin-bottom: 16px;
}

.error-details {
  margin-top: 12px;
}

.error-details pre {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.success-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions {
  display: flex;
  gap: 8px;
}
</style>
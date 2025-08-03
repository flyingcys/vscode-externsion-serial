<!--
  用户友好的错误通知对话框
  集成统一错误处理系统，提供清晰的错误信息和解决建议
-->

<template>
  <div class="error-notification-system">
    <!-- 全局错误对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentError?.title || t('error.dialog.title')"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      :show-close="true"
      class="error-dialog"
      :class="{
        'error-dialog--warning': currentError?.severity === 'warning',
        'error-dialog--error': currentError?.severity === 'error',
        'error-dialog--critical': currentError?.severity === 'critical',
        'error-dialog--fatal': currentError?.severity === 'fatal'
      }"
      @close="handleDialogClose"
    >
      <div v-if="currentError" class="error-content">
        <!-- 错误图标和基本信息 -->
        <div class="error-header">
          <div class="error-icon">
            <el-icon size="48" :color="getSeverityColor(currentError.severity)">
              <Warning v-if="currentError.severity === 'warning'" />
              <CircleClose v-else-if="currentError.severity === 'error'" />
              <WarnTriangleFilled v-else-if="currentError.severity === 'critical'" />
              <Close v-else-if="currentError.severity === 'fatal'" />
              <InfoFilled v-else />
            </el-icon>
          </div>
          <div class="error-info">
            <h3 class="error-title">{{ currentError.title }}</h3>
            <div class="error-meta">
              <el-tag 
                :type="getSeverityTagType(currentError.severity)" 
                size="small"
                class="error-severity-tag"
              >
                {{ t(`error.severity.${currentError.severity}`) }}
              </el-tag>
              <el-tag 
                type="info" 
                size="small" 
                class="error-category-tag"
              >
                {{ t(`error.category.${currentError.category}`) }}
              </el-tag>
              <span class="error-time">
                {{ formatTime(currentError.timestamp) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 错误消息 -->
        <div class="error-message">
          <p>{{ currentError.message }}</p>
        </div>

        <!-- 解决建议 -->
        <div v-if="currentError.suggestions && currentError.suggestions.length > 0" class="error-suggestions">
          <h4>{{ t('error.dialog.suggestions') }}</h4>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in currentError.suggestions" :key="index">
              <el-icon class="suggestion-icon"><Right /></el-icon>
              <span>{{ suggestion }}</span>
            </li>
          </ul>
        </div>

        <!-- 用户操作指导 -->
        <div v-if="currentError.userAction" class="error-user-action">
          <el-alert
            :title="t('error.dialog.userAction')"
            :description="currentError.userAction"
            type="info"
            :closable="false"
            show-icon
            class="user-action-alert"
          />
        </div>

        <!-- 自动恢复状态 -->
        <div v-if="currentError.autoRecoveryAttempted" class="error-recovery-status">
          <el-alert
            :title="t('error.dialog.autoRecovery')"
            :description="t('error.dialog.autoRecoveryMessage')"
            type="success"
            :closable="false"
            show-icon
            class="recovery-alert"
          />
        </div>

        <!-- 技术详细信息（可展开） -->
        <div v-if="currentError.technicalDetails" class="error-technical-details">
          <el-collapse v-model="technicalDetailsOpen">
            <el-collapse-item :title="t('error.dialog.technicalDetails')" name="technical">
              <div class="technical-content">
                <pre class="technical-text">{{ currentError.technicalDetails }}</pre>
                <div v-if="currentError.context && Object.keys(currentError.context).length > 0" class="context-info">
                  <h5>{{ t('error.dialog.context') }}</h5>
                  <pre class="context-text">{{ JSON.stringify(currentError.context, null, 2) }}</pre>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 对话框操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <el-button 
              v-if="currentError?.canRetry"
              type="primary"
              :loading="retryLoading"
              @click="handleRetry"
            >
              {{ t('error.dialog.retry') }}
            </el-button>
            <el-button 
              v-if="showReportButton"
              type="warning"
              @click="handleReportError"
            >
              {{ t('error.dialog.report') }}
            </el-button>
          </div>
          <div class="footer-right">
            <el-button @click="handleDialogClose">
              {{ t('common.close') }}
            </el-button>
            <el-button 
              v-if="hasMoreErrors"
              type="info"
              @click="showErrorHistory"
            >
              {{ t('error.dialog.viewHistory') }} ({{ errorHistory.length }})
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 错误历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      :title="t('error.history.title')"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="error-history-content">
        <div class="history-stats">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-statistic 
                :title="t('error.history.totalErrors')"
                :value="errorStats.totalErrors"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                :title="t('error.history.recoveryRate')"
                :value="errorStats.autoRecoverySuccessRate"
                suffix="%"
                :precision="1"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                :title="t('error.history.avgRecoveryTime')"
                :value="errorStats.averageRecoveryTime"
                suffix="ms"
                :precision="0"
              />
            </el-col>
            <el-col :span="6">
              <el-button 
                type="danger" 
                size="small"
                @click="clearErrorHistory"
              >
                {{ t('error.history.clear') }}
              </el-button>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <div class="history-filters">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-select 
                v-model="historyFilter.severity"
                :placeholder="t('error.history.filterBySeverity')"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="severity in severityOptions"
                  :key="severity"
                  :label="t(`error.severity.${severity}`)"
                  :value="severity"
                />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select 
                v-model="historyFilter.category"
                :placeholder="t('error.history.filterByCategory')"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="category in categoryOptions"
                  :key="category"
                  :label="t(`error.category.${category}`)"
                  :value="category"
                />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input
                v-model="historyFilter.search"
                :placeholder="t('error.history.search')"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </div>

        <div class="history-list">
          <el-table 
            :data="filteredErrorHistory" 
            height="400"
            @row-click="handleHistoryRowClick"
          >
            <el-table-column 
              prop="timestamp" 
              :label="t('error.history.time')"
              width="160"
              :formatter="formatTimestampColumn"
            />
            <el-table-column 
              prop="severity" 
              :label="t('error.history.severity')"
              width="100"
            >
              <template #default="{ row }">
                <el-tag 
                  :type="getSeverityTagType(row.severity)" 
                  size="small"
                >
                  {{ t(`error.severity.${row.severity}`) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column 
              prop="category" 
              :label="t('error.history.category')"
              width="120"
            >
              <template #default="{ row }">
                <el-tag type="info" size="small">
                  {{ t(`error.category.${row.category}`) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column 
              prop="title" 
              :label="t('error.history.title')"
              min-width="200"
            />
            <el-table-column 
              prop="message" 
              :label="t('error.history.message')"
              min-width="300"
              show-overflow-tooltip
            />
            <el-table-column 
              :label="t('error.history.actions')"
              width="120"
            >
              <template #default="{ row }">
                <el-button 
                  v-if="row.canRetry"
                  type="primary" 
                  size="small"
                  @click.stop="retryHistoryError(row)"
                >
                  {{ t('error.dialog.retry') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 浮动错误通知 -->
    <div class="floating-notifications">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in floatingNotifications"
          :key="notification.id"
          class="floating-notification"
          :class="`floating-notification--${notification.severity}`"
        >
          <div class="notification-content">
            <el-icon class="notification-icon">
              <Warning v-if="notification.severity === 'warning'" />
              <CircleClose v-else-if="notification.severity === 'error'" />
              <WarnTriangleFilled v-else-if="notification.severity === 'critical'" />
              <InfoFilled v-else />
            </el-icon>
            <div class="notification-text">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
            </div>
            <el-button 
              type="text" 
              size="small"
              @click="showErrorDetails(notification)"
            >
              {{ t('error.notification.details') }}
            </el-button>
            <el-button 
              type="text" 
              size="small"
              @click="dismissNotification(notification.id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  Warning, 
  CircleClose, 
  WarnTriangleFilled, 
  Close, 
  InfoFilled, 
  Right,
  Search
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '../../composables/useI18n';
import { 
  globalErrorHandler, 
  type StructuredError, 
  ErrorSeverity, 
  ErrorCategory 
} from '../../../shared/ErrorHandling';

// Props
interface Props {
  autoShow?: boolean;
  showFloatingNotifications?: boolean;
  maxFloatingNotifications?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoShow: true,
  showFloatingNotifications: true,
  maxFloatingNotifications: 3
});

// Composables
const { t } = useI18n();

// Reactive state
const dialogVisible = ref(false);
const historyDialogVisible = ref(false);
const currentError = ref<StructuredError | null>(null);
const errorHistory = ref<StructuredError[]>([]);
const errorStats = ref({
  totalErrors: 0,
  autoRecoverySuccessRate: 0,
  averageRecoveryTime: 0
});

const technicalDetailsOpen = ref<string[]>([]);
const retryLoading = ref(false);
const floatingNotifications = ref<StructuredError[]>([]);

// History filtering
const historyFilter = ref({
  severity: '',
  category: '',
  search: ''
});

// Computed
const hasMoreErrors = computed(() => errorHistory.value.length > 1);

const showReportButton = computed(() => {
  return currentError.value?.severity === 'critical' || 
         currentError.value?.severity === 'fatal';
});

const severityOptions = computed(() => Object.values(ErrorSeverity));
const categoryOptions = computed(() => Object.values(ErrorCategory));

const filteredErrorHistory = computed(() => {
  let filtered = errorHistory.value;
  
  if (historyFilter.value.severity) {
    filtered = filtered.filter(error => error.severity === historyFilter.value.severity);
  }
  
  if (historyFilter.value.category) {
    filtered = filtered.filter(error => error.category === historyFilter.value.category);
  }
  
  if (historyFilter.value.search) {
    const searchLower = historyFilter.value.search.toLowerCase();
    filtered = filtered.filter(error => 
      error.title.toLowerCase().includes(searchLower) ||
      error.message.toLowerCase().includes(searchLower) ||
      error.code.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered.sort((a, b) => b.timestamp - a.timestamp);
});

// Methods
const getSeverityColor = (severity: ErrorSeverity): string => {
  const colors = {
    [ErrorSeverity.INFO]: '#409EFF',
    [ErrorSeverity.WARNING]: '#E6A23C',
    [ErrorSeverity.ERROR]: '#F56C6C',
    [ErrorSeverity.CRITICAL]: '#FF4D4F',
    [ErrorSeverity.FATAL]: '#722ED1'
  };
  return colors[severity] || colors[ErrorSeverity.ERROR];
};

const getSeverityTagType = (severity: ErrorSeverity): string => {
  const types = {
    [ErrorSeverity.INFO]: 'info',
    [ErrorSeverity.WARNING]: 'warning',
    [ErrorSeverity.ERROR]: 'danger',
    [ErrorSeverity.CRITICAL]: 'danger',
    [ErrorSeverity.FATAL]: 'danger'
  };
  return types[severity] || 'danger';
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const formatTimestampColumn = (row: StructuredError): string => {
  return formatTime(row.timestamp);
};

const showError = (error: StructuredError) => {
  currentError.value = error;
  errorHistory.value.unshift(error);
  
  // 限制历史记录数量
  if (errorHistory.value.length > 100) {
    errorHistory.value = errorHistory.value.slice(0, 100);
  }
  
  if (props.autoShow) {
    dialogVisible.value = true;
  }
  
  // 添加到浮动通知
  if (props.showFloatingNotifications && !props.autoShow) {
    addFloatingNotification(error);
  }
};

const addFloatingNotification = (error: StructuredError) => {
  floatingNotifications.value.unshift(error);
  
  // 限制浮动通知数量
  if (floatingNotifications.value.length > props.maxFloatingNotifications) {
    floatingNotifications.value = floatingNotifications.value.slice(0, props.maxFloatingNotifications);
  }
  
  // 自动消失（除了严重错误）
  if (error.severity !== ErrorSeverity.CRITICAL && error.severity !== ErrorSeverity.FATAL) {
    setTimeout(() => {
      dismissNotification(error.id);
    }, 5000);
  }
};

const dismissNotification = (errorId: string) => {
  const index = floatingNotifications.value.findIndex(n => n.id === errorId);
  if (index !== -1) {
    floatingNotifications.value.splice(index, 1);
  }
};

const showErrorDetails = (error: StructuredError) => {
  currentError.value = error;
  dialogVisible.value = true;
  dismissNotification(error.id);
};

const handleDialogClose = () => {
  dialogVisible.value = false;
  currentError.value = null;
  technicalDetailsOpen.value = [];
};

const handleRetry = async () => {
  if (!currentError.value) return;
  
  retryLoading.value = true;
  
  try {
    // 发出重试事件，让父组件处理具体的重试逻辑
    const retryEvent = new CustomEvent('error:retry', {
      detail: { error: currentError.value }
    });
    window.dispatchEvent(retryEvent);
    
    ElMessage.success(t('error.dialog.retrySuccess'));
    handleDialogClose();
  } catch (error) {
    ElMessage.error(t('error.dialog.retryFailed'));
  } finally {
    retryLoading.value = false;
  }
};

const handleReportError = async () => {
  if (!currentError.value) return;
  
  try {
    const errorReport = {
      id: currentError.value.id,
      code: currentError.value.code,
      severity: currentError.value.severity,
      category: currentError.value.category,
      title: currentError.value.title,
      message: currentError.value.message,
      technicalDetails: currentError.value.technicalDetails,
      context: currentError.value.context,
      timestamp: currentError.value.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // 将错误报告复制到剪贴板
    await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    
    ElMessage.success(t('error.dialog.reportSuccess'));
  } catch (error) {
    ElMessage.error(t('error.dialog.reportFailed'));
  }
};

const showErrorHistory = () => {
  updateErrorStats();
  historyDialogVisible.value = true;
};

const updateErrorStats = () => {
  const stats = globalErrorHandler.getStats();
  errorStats.value = {
    totalErrors: stats.totalErrors,
    autoRecoverySuccessRate: stats.autoRecoverySuccessRate * 100,
    averageRecoveryTime: stats.averageRecoveryTime
  };
};

const clearErrorHistory = async () => {
  try {
    await ElMessageBox.confirm(
      t('error.history.clearConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    );
    
    globalErrorHandler.clearErrorHistory();
    errorHistory.value = [];
    errorStats.value = {
      totalErrors: 0,
      autoRecoverySuccessRate: 0,
      averageRecoveryTime: 0
    };
    
    ElMessage.success(t('error.history.clearSuccess'));
  } catch {
    // 用户取消了操作
  }
};

const handleHistoryRowClick = (error: StructuredError) => {
  currentError.value = error;
  historyDialogVisible.value = false;
  dialogVisible.value = true;
};

const retryHistoryError = async (error: StructuredError) => {
  // 发出重试事件
  const retryEvent = new CustomEvent('error:retry', {
    detail: { error }
  });
  window.dispatchEvent(retryEvent);
};

// Event listeners
let errorListener: ((error: StructuredError) => void) | null = null;

onMounted(() => {
  // 监听错误通知
  errorListener = (error: StructuredError) => {
    showError(error);
  };
  
  globalErrorHandler.on('error:notification', errorListener);
  
  // 加载现有的错误历史
  errorHistory.value = globalErrorHandler.getRecentErrors(50);
  updateErrorStats();
});

onUnmounted(() => {
  if (errorListener) {
    globalErrorHandler.off('error:notification', errorListener);
  }
});

// Expose methods for parent components
defineExpose({
  showError,
  showErrorHistory,
  clearErrorHistory
});
</script>

<style scoped>
/* 错误对话框样式 */
.error-dialog {
  --el-dialog-border-radius: 12px;
}

.error-content {
  padding: 0;
}

.error-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.error-icon {
  flex-shrink: 0;
}

.error-info {
  flex: 1;
}

.error-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.error-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.error-severity-tag,
.error-category-tag {
  font-size: 12px;
}

.error-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.error-message {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
}

.error-message p {
  margin: 0;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.error-suggestions {
  margin-bottom: 20px;
}

.error-suggestions h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.suggestions-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.suggestions-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: var(--el-bg-color);
  border-radius: 6px;
  line-height: 1.5;
}

.suggestion-icon {
  color: var(--el-color-primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.error-user-action {
  margin-bottom: 20px;
}

.user-action-alert {
  border-radius: 8px;
}

.error-recovery-status {
  margin-bottom: 20px;
}

.recovery-alert {
  border-radius: 8px;
}

.error-technical-details {
  margin-top: 20px;
}

.technical-content {
  background: var(--el-bg-color-page);
  border-radius: 6px;
  padding: 12px;
}

.technical-text,
.context-text {
  margin: 0;
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--el-text-color-primary);
}

.context-info h5 {
  margin: 16px 0 8px 0;
  font-size: 13px;
  font-weight: 600;
}

/* 对话框底部样式 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
}

/* 错误历史对话框样式 */
.error-history-content {
  padding: 0;
}

.history-stats {
  margin-bottom: 20px;
}

.history-filters {
  margin-bottom: 20px;
}

.history-list {
  /* Element Plus table 的样式会自动应用 */
}

/* 浮动通知样式 */
.floating-notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  max-width: 400px;
}

.floating-notification {
  margin-bottom: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  border-left: 4px solid var(--el-color-primary);
}

.floating-notification--warning {
  border-left-color: var(--el-color-warning);
}

.floating-notification--error {
  border-left-color: var(--el-color-danger);
}

.floating-notification--critical {
  border-left-color: var(--el-color-danger);
  box-shadow: var(--el-box-shadow-dark);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-text {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
}

.notification-message {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

/* 动画效果 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-notifications {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .error-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .error-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: center;
  }
}

/* 深色主题适配 */
html[data-theme="dark"] .error-dialog {
  --el-dialog-bg-color: var(--el-bg-color);
}

html[data-theme="dark"] .floating-notification {
  background: var(--el-bg-color-overlay);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* RTL支持 */
html[dir="rtl"] .error-header {
  direction: rtl;
}

html[dir="rtl"] .suggestions-list li {
  direction: rtl;
}

html[dir="rtl"] .floating-notifications {
  left: 20px;
  right: auto;
}

html[dir="rtl"] .notification-enter-from,
html[dir="rtl"] .notification-leave-to {
  transform: translateX(-100%);
}
</style>
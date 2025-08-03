<template>
  <el-drawer
    v-model="visible"
    title="MQTT 状态监控"
    direction="rtl"
    size="450px"
    :with-header="true"
  >
    <div class="monitor-container">
      <!-- 连接状态 -->
      <el-card class="status-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Connection /></el-icon>
            <span>连接状态</span>
            <el-tag
              :type="connectionStatusType"
              class="status-tag"
            >
              {{ connectionStatusText }}
            </el-tag>
          </div>
        </template>
        
        <div class="status-grid">
          <div class="status-item">
            <span class="label">主机地址</span>
            <span class="value">{{ config?.hostname }}:{{ config?.port }}</span>
          </div>
          <div class="status-item">
            <span class="label">客户端ID</span>
            <span class="value">{{ config?.clientId }}</span>
          </div>
          <div class="status-item">
            <span class="label">协议版本</span>
            <span class="value">MQTT {{ getProtocolVersionText(config?.protocolVersion) }}</span>
          </div>
          <div class="status-item">
            <span class="label">连接时间</span>
            <span class="value">{{ formatConnectionTime() }}</span>
          </div>
          <div class="status-item">
            <span class="label">重连次数</span>
            <span class="value">{{ statistics?.connectionInfo.reconnectAttempts || 0 }}</span>
          </div>
        </div>
      </el-card>

      <!-- 数据统计 -->
      <el-card class="status-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </div>
        </template>
        
        <div class="statistics-grid">
          <div class="stat-item">
            <div class="stat-number">{{ statistics?.connectionInfo.messagesSent || 0 }}</div>
            <div class="stat-label">发送消息数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ statistics?.connectionInfo.messagesReceived || 0 }}</div>
            <div class="stat-label">接收消息数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatBytes(statistics?.connectionInfo.bytesSent || 0) }}</div>
            <div class="stat-label">发送字节数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatBytes(statistics?.connectionInfo.bytesReceived || 0) }}</div>
            <div class="stat-label">接收字节数</div>
          </div>
        </div>
      </el-card>

      <!-- 性能指标 -->
      <el-card class="status-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Speedometer /></el-icon>
            <span>性能指标</span>
          </div>
        </template>
        
        <div class="performance-list">
          <div class="performance-item">
            <span class="label">平均延迟</span>
            <span class="value">{{ formatLatency(statistics?.performance.avgLatency || 0) }}</span>
          </div>
          <div class="performance-item">
            <span class="label">最大延迟</span>
            <span class="value">{{ formatLatency(statistics?.performance.maxLatency || 0) }}</span>
          </div>
          <div class="performance-item">
            <span class="label">消息速率</span>
            <span class="value">{{ formatRate(statistics?.performance.messageRate || 0) }} msg/s</span>
          </div>
          <div class="performance-item">
            <span class="label">数据吞吐量</span>
            <span class="value">{{ formatThroughput(statistics?.performance.throughput || 0) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 错误日志 -->
      <el-card class="status-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Warning /></el-icon>
            <span>错误日志</span>
            <el-badge
              v-if="statistics?.errors && statistics.errors.length > 0"
              :value="statistics.errors.length"
              type="danger"
              class="error-badge"
            />
          </div>
        </template>
        
        <div class="error-list">
          <el-empty
            v-if="!statistics?.errors || statistics.errors.length === 0"
            description="暂无错误记录"
            :image-size="60"
          />
          <div
            v-else
            class="error-scroll"
          >
            <div
              v-for="(error, index) in statistics.errors.slice(-10)"
              :key="index"
              class="error-item"
            >
              <div class="error-header">
                <el-tag
                  size="small"
                  :type="error.recoverable ? 'warning' : 'danger'"
                >
                  {{ error.code }}
                </el-tag>
                <span class="error-time">{{ formatTime(error.timestamp) }}</span>
              </div>
              <div class="error-message">{{ error.message }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          :disabled="isConnected"
          @click="handleConnect"
          :loading="connecting"
        >
          <el-icon><Connection /></el-icon>
          连接
        </el-button>
        
        <el-button
          type="danger"
          :disabled="!isConnected"
          @click="handleDisconnect"
          :loading="disconnecting"
        >
          <el-icon><Close /></el-icon>
          断开
        </el-button>
        
        <el-button
          type="info"
          @click="handleResetStats"
        >
          <el-icon><Refresh /></el-icon>
          重置统计
        </el-button>
        
        <el-button
          type="success"
          @click="handleRefresh"
        >
          <el-icon><RefreshRight /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Connection,
  DataAnalysis,
  Speedometer,
  Warning,
  Close,
  Refresh,
  RefreshRight
} from '@element-plus/icons-vue'

// Props & Emits
interface Props {
  visible: boolean
  config?: MQTTConfig
  statistics?: MQTTStatistics
  connectionState?: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'connect'): void
  (e: 'disconnect'): void
  (e: 'reset-stats'): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  config: undefined,
  statistics: undefined,
  connectionState: 0
})

const emit = defineEmits<Emits>()

// Refs
const connecting = ref(false)
const disconnecting = ref(false)
const refreshTimer = ref<NodeJS.Timeout | null>(null)

// Computed
const isConnected = computed(() => props.connectionState === 2) // Connected

const connectionStatusText = computed(() => {
  switch (props.connectionState) {
    case 0: return '已断开'
    case 1: return '连接中'
    case 2: return '已连接'
    case 3: return '断开中'
    case 4: return '重连中'
    default: return '未知'
  }
})

const connectionStatusType = computed(() => {
  switch (props.connectionState) {
    case 0: return 'info'      // 已断开
    case 1: return 'warning'   // 连接中
    case 2: return 'success'   // 已连接
    case 3: return 'warning'   // 断开中
    case 4: return 'danger'    // 重连中
    default: return ''
  }
})

// Methods
function getProtocolVersionText(version?: number): string {
  switch (version) {
    case 3: return '3.1'
    case 4: return '3.1.1'
    case 5: return '5.0'
    default: return '未知'
  }
}

function formatConnectionTime(): string {
  if (!props.statistics?.connectionInfo.connectedAt) {
    return '未连接'
  }
  
  const connectedAt = new Date(props.statistics.connectionInfo.connectedAt)
  const now = new Date()
  const diffMs = now.getTime() - connectedAt.getTime()
  
  const seconds = Math.floor(diffMs / 1000) % 60
  const minutes = Math.floor(diffMs / (1000 * 60)) % 60
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (hours > 0) {
    return `${hours}时${minutes}分${seconds}秒`
  } else if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatLatency(latency: number): string {
  if (latency < 1000) {
    return `${latency.toFixed(1)}ms`
  } else {
    return `${(latency / 1000).toFixed(2)}s`
  }
}

function formatRate(rate: number): string {
  return rate.toFixed(2)
}

function formatThroughput(throughput: number): string {
  if (throughput < 1024) {
    return `${throughput.toFixed(2)} B/s`
  } else if (throughput < 1024 * 1024) {
    return `${(throughput / 1024).toFixed(2)} KB/s`
  } else {
    return `${(throughput / (1024 * 1024)).toFixed(2)} MB/s`
  }
}

function formatTime(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString()
}

async function handleConnect() {
  connecting.value = true
  try {
    emit('connect')
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟连接延迟
    ElMessage.success('连接成功')
  } catch (error) {
    ElMessage.error('连接失败')
  } finally {
    connecting.value = false
  }
}

async function handleDisconnect() {
  disconnecting.value = true
  try {
    emit('disconnect')
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟断开延迟
    ElMessage.success('已断开连接')
  } catch (error) {
    ElMessage.error('断开连接失败')
  } finally {
    disconnecting.value = false
  }
}

function handleResetStats() {
  emit('reset-stats')
  ElMessage.success('统计信息已重置')
}

function handleRefresh() {
  emit('refresh')
  ElMessage.success('状态已刷新')
}

// Lifecycle
onMounted(() => {
  // 每5秒刷新一次状态
  refreshTimer.value = setInterval(() => {
    if (props.visible) {
      emit('refresh')
    }
  }, 5000)
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})

// Types
interface MQTTConfig {
  hostname: string
  port: number
  clientId: string
  protocolVersion: number
}

interface MQTTStatistics {
  connectionInfo: {
    state: number
    connectedAt?: Date
    reconnectAttempts: number
    bytesReceived: number
    bytesSent: number
    messagesReceived: number
    messagesSent: number
  }
  performance: {
    avgLatency: number
    maxLatency: number
    messageRate: number
    throughput: number
  }
  errors: Array<{
    code: string
    message: string
    timestamp: Date
    recoverable: boolean
  }>
}
</script>

<style scoped>
.monitor-container {
  padding: 0 16px 16px;
}

.status-card {
  margin-bottom: 16px;
}

.status-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  margin-left: auto;
}

.error-badge {
  margin-left: auto;
}

.status-grid {
  display: grid;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.status-item:last-child {
  border-bottom: none;
}

.status-item .label {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.status-item .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
  word-break: break-all;
}

.statistics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.performance-item:last-child {
  border-bottom: none;
}

.performance-item .label {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.performance-item .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.error-list {
  max-height: 200px;
}

.error-scroll {
  max-height: 200px;
  overflow-y: auto;
}

.error-item {
  padding: 8px;
  margin-bottom: 8px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-warning);
}

.error-item:last-child {
  margin-bottom: 0;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.error-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.error-message {
  font-size: 13px;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__header) {
  padding: 12px 16px;
  background-color: var(--el-fill-color-lighter);
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-empty) {
  padding: 20px 0;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 16px 0;
}

:deep(.el-drawer__body) {
  padding: 16px 0 0;
}
</style>
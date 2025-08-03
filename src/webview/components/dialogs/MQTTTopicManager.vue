<template>
  <el-dialog
    v-model="visible"
    title="MQTT 主题管理"
    width="700px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <div class="topic-manager">
      <!-- 添加订阅 -->
      <el-card class="add-subscription-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Plus /></el-icon>
            <span>添加订阅</span>
          </div>
        </template>
        
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addRules"
          inline
          size="default"
        >
          <el-form-item label="主题" prop="topic" style="flex: 1;">
            <el-input
              v-model="addForm.topic"
              placeholder="sensor/+/temperature"
              clearable
              style="width: 100%;"
            >
              <template #prepend>
                <el-icon><Position /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="QoS" prop="qos">
            <el-select v-model="addForm.qos" style="width: 120px;">
              <el-option label="QoS 0" :value="0" />
              <el-option label="QoS 1" :value="1" />
              <el-option label="QoS 2" :value="2" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleAddSubscription"
              :loading="adding"
              :disabled="!isConnected"
            >
              <el-icon><Plus /></el-icon>
              订阅
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 订阅列表 -->
      <el-card class="subscriptions-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>当前订阅</span>
            <el-badge
              :value="subscriptions.length"
              type="primary"
              class="subscription-badge"
            />
          </div>
        </template>
        
        <el-table
          :data="subscriptions"
          stripe
          style="width: 100%"
          max-height="300"
        >
          <el-table-column prop="topic" label="主题" min-width="200">
            <template #default="{ row }">
              <div class="topic-cell">
                <el-icon><Position /></el-icon>
                <span>{{ row.topic }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="qos" label="QoS" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="getQosTagType(row.qos)">
                QoS {{ row.qos }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="messageCount" label="消息数" width="80">
            <template #default="{ row }">
              <span class="message-count">{{ row.messageCount || 0 }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="lastMessage" label="最后消息" width="140">
            <template #default="{ row }">
              <span class="last-message">
                {{ row.lastMessage ? formatTime(row.lastMessage) : '无' }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="row.active ? 'success' : 'info'">
                {{ row.active ? '活跃' : '暂停' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="160">
            <template #default="{ row, $index }">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleToggleSubscription(row, $index)"
                :disabled="!isConnected"
              >
                {{ row.active ? '暂停' : '恢复' }}
              </el-button>
              
              <el-button
                link
                type="danger"
                size="small"
                @click="handleRemoveSubscription(row, $index)"
                :disabled="!isConnected"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty
          v-if="subscriptions.length === 0"
          description="暂无订阅主题"
          :image-size="80"
        />
      </el-card>

      <!-- 消息历史 -->
      <el-card class="messages-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>消息历史</span>
            <div class="header-actions">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleClearMessages"
              >
                清空历史
              </el-button>
              <el-switch
                v-model="autoScroll"
                size="small"
                active-text="自动滚动"
                inactive-text=""
              />
            </div>
          </div>
        </template>
        
        <div class="message-list" ref="messageListRef">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message-item"
          >
            <div class="message-header">
              <el-tag size="small" type="info">{{ message.topic }}</el-tag>
              <el-tag size="small" :type="getQosTagType(message.qos)">
                QoS {{ message.qos }}
              </el-tag>
              <el-tag v-if="message.retain" size="small" type="warning">
                保留
              </el-tag>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-content">
              <pre>{{ formatMessagePayload(message.payload) }}</pre>
            </div>
          </div>
          
          <el-empty
            v-if="messages.length === 0"
            description="暂无消息记录"
            :image-size="60"
          />
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="info" @click="handleExportSubscriptions">
          导出订阅
        </el-button>
        <el-button type="success" @click="handleImportSubscriptions">
          导入订阅
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  List,
  Position,
  ChatDotRound
} from '@element-plus/icons-vue'

// Props & Emits
interface Props {
  visible: boolean
  isConnected?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'subscribe', topic: string, qos: number): void
  (e: 'unsubscribe', topic: string): void
  (e: 'clear-messages'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  isConnected: false
})

const emit = defineEmits<Emits>()

// Refs
const addFormRef = ref<FormInstance>()
const messageListRef = ref<HTMLElement>()
const adding = ref(false)
const autoScroll = ref(true)

// Form Data
const addForm = reactive({
  topic: '',
  qos: 0
})

// Rules
const addRules: FormRules = {
  topic: [
    { required: true, message: '请输入主题', trigger: 'blur' },
    { validator: validateTopic, trigger: 'blur' }
  ],
  qos: [
    { required: true, message: '请选择QoS等级', trigger: 'change' }
  ]
}

// Data
const subscriptions = ref<Subscription[]>([
  {
    topic: 'sensor/temperature',
    qos: 1,
    active: true,
    messageCount: 15,
    lastMessage: new Date()
  },
  {
    topic: 'sensor/+/humidity',
    qos: 0,
    active: true,
    messageCount: 8,
    lastMessage: new Date(Date.now() - 30000)
  },
  {
    topic: 'device/status',
    qos: 2,
    active: false,
    messageCount: 3,
    lastMessage: new Date(Date.now() - 120000)
  }
])

const messages = ref<MQTTMessage[]>([
  {
    topic: 'sensor/temperature',
    payload: Buffer.from('25.3'),
    qos: 1,
    retain: false,
    dup: false,
    timestamp: new Date()
  },
  {
    topic: 'sensor/room1/humidity',
    payload: Buffer.from('{"humidity": 65.2, "unit": "%"}'),
    qos: 0,
    retain: true,
    dup: false,
    timestamp: new Date(Date.now() - 15000)
  },
  {
    topic: 'device/status',
    payload: Buffer.from('online'),
    qos: 2,
    retain: false,
    dup: false,
    timestamp: new Date(Date.now() - 60000)
  }
])

// Validation
function validateTopic(rule: any, value: string, callback: Function) {
  if (!value || value.trim() === '') {
    callback(new Error('主题不能为空'))
    return
  }
  
  // MQTT 主题验证
  if (value.includes('\0')) {
    callback(new Error('主题不能包含null字符'))
    return
  }
  
  if (value.length > 65535) {
    callback(new Error('主题长度不能超过65535字符'))
    return
  }
  
  // 检查是否已存在
  if (subscriptions.value.some(sub => sub.topic === value.trim())) {
    callback(new Error('该主题已被订阅'))
    return
  }
  
  callback()
}

// Methods
function getQosTagType(qos: number): string {
  switch (qos) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'danger'
    default: return ''
  }
}

function formatTime(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString()
}

function formatMessagePayload(payload: Buffer): string {
  try {
    const text = payload.toString('utf8')
    // 尝试格式化JSON
    const json = JSON.parse(text)
    return JSON.stringify(json, null, 2)
  } catch {
    // 如果不是JSON，直接返回文本
    return payload.toString('utf8')
  }
}

async function handleAddSubscription() {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    
    adding.value = true
    
    // 模拟订阅过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newSubscription: Subscription = {
      topic: addForm.topic.trim(),
      qos: addForm.qos,
      active: true,
      messageCount: 0,
      lastMessage: undefined
    }
    
    subscriptions.value.push(newSubscription)
    emit('subscribe', newSubscription.topic, newSubscription.qos)
    
    // 重置表单
    addForm.topic = ''
    addForm.qos = 0
    addFormRef.value.resetFields()
    
    ElMessage.success(`已订阅主题: ${newSubscription.topic}`)
    
  } catch (error) {
    ElMessage.error('订阅失败，请检查输入')
  } finally {
    adding.value = false
  }
}

async function handleToggleSubscription(subscription: Subscription, index: number) {
  try {
    if (subscription.active) {
      // 暂停订阅
      await ElMessageBox.confirm(
        `确定要暂停订阅主题 "${subscription.topic}" 吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      subscription.active = false
      emit('unsubscribe', subscription.topic)
      ElMessage.success('已暂停订阅')
    } else {
      // 恢复订阅
      subscription.active = true
      emit('subscribe', subscription.topic, subscription.qos)
      ElMessage.success('已恢复订阅')
    }
  } catch {
    // 用户取消操作
  }
}

async function handleRemoveSubscription(subscription: Subscription, index: number) {
  try {
    await ElMessageBox.confirm(
      `确定要移除订阅主题 "${subscription.topic}" 吗？这将删除该主题的所有消息记录。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (subscription.active) {
      emit('unsubscribe', subscription.topic)
    }
    
    subscriptions.value.splice(index, 1)
    
    // 移除相关消息
    const topicPattern = new RegExp(
      '^' + subscription.topic.replace(/\+/g, '[^/]+').replace(/#/g, '.*') + '$'
    )
    messages.value = messages.value.filter(msg => !topicPattern.test(msg.topic))
    
    ElMessage.success('订阅已移除')
    
  } catch {
    // 用户取消操作
  }
}

async function handleClearMessages() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有消息历史吗？',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    messages.value = []
    emit('clear-messages')
    ElMessage.success('消息历史已清空')
    
  } catch {
    // 用户取消操作
  }
}

function handleExportSubscriptions() {
  const data = {
    subscriptions: subscriptions.value.map(sub => ({
      topic: sub.topic,
      qos: sub.qos,
      active: sub.active
    })),
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mqtt-subscriptions-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('订阅配置已导出')
}

function handleImportSubscriptions() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.subscriptions && Array.isArray(data.subscriptions)) {
            // 合并订阅，避免重复
            data.subscriptions.forEach((importedSub: any) => {
              if (!subscriptions.value.some(sub => sub.topic === importedSub.topic)) {
                subscriptions.value.push({
                  topic: importedSub.topic,
                  qos: importedSub.qos || 0,
                  active: importedSub.active || false,
                  messageCount: 0,
                  lastMessage: undefined
                })
              }
            })
            ElMessage.success(`已导入 ${data.subscriptions.length} 个订阅配置`)
          } else {
            ElMessage.error('无效的订阅配置文件')
          }
        } catch (error) {
          ElMessage.error('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  
  input.click()
}

function handleClose() {
  emit('update:visible', false)
}

// 自动滚动到最新消息
watch(messages, () => {
  if (autoScroll.value) {
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
      }
    })
  }
}, { deep: true })

// Types
interface Subscription {
  topic: string
  qos: number
  active: boolean
  messageCount: number
  lastMessage?: Date
}

interface MQTTMessage {
  topic: string
  payload: Buffer
  qos: number
  retain: boolean
  dup: boolean
  timestamp: Date
}
</script>

<style scoped>
.topic-manager {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.add-subscription-card,
.subscriptions-card,
.messages-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subscription-badge {
  margin-left: auto;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topic-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.message-count {
  font-weight: 500;
  color: var(--el-color-primary);
}

.last-message {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.message-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.message-item {
  margin-bottom: 12px;
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
  border-left: 3px solid var(--el-color-primary);
}

.message-item:last-child {
  margin-bottom: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}

.message-content {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background-color: var(--el-fill-color-blank);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.message-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  background-color: var(--el-fill-color-lighter);
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}

:deep(.el-table .el-table__empty-block) {
  min-height: 120px;
}

:deep(.el-empty) {
  padding: 20px 0;
}
</style>
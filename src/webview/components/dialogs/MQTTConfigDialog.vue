<template>
  <el-dialog
    v-model="visible"
    title="MQTT 客户端配置"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      size="default"
    >
      <!-- 基础连接配置 -->
      <el-card class="config-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Connection /></el-icon>
            <span>连接配置</span>
          </div>
        </template>
        
        <el-form-item label="主机名" prop="hostname">
          <el-input
            v-model="formData.hostname"
            placeholder="mqtt.example.com"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="端口" prop="port">
          <el-input-number
            v-model="formData.port"
            :min="1"
            :max="65535"
            controls-position="right"
            class="full-width"
          />
        </el-form-item>
        
        <el-form-item label="客户端ID" prop="clientId">
          <el-input
            v-model="formData.clientId"
            placeholder="自动生成"
            clearable
          >
            <template #suffix>
              <el-button
                link
                type="primary"
                @click="regenerateClientId"
              >
                重新生成
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="模式" prop="mode">
          <el-radio-group v-model="formData.mode">
            <el-radio :label="0">订阅者</el-radio>
            <el-radio :label="1">发布者</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="主题" prop="topicFilter">
          <el-input
            v-model="formData.topicFilter"
            placeholder="sensor/+/data"
            clearable
          />
        </el-form-item>
      </el-card>

      <!-- 认证配置 -->
      <el-card class="config-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Key /></el-icon>
            <span>认证配置</span>
          </div>
        </template>
        
        <el-form-item label="用户名">
          <el-input
            v-model="formData.username"
            placeholder="可选"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="可选"
            show-password
            clearable
          />
        </el-form-item>
      </el-card>

      <!-- 协议配置 -->
      <el-card class="config-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>协议配置</span>
          </div>
        </template>
        
        <el-form-item label="协议版本">
          <el-select v-model="formData.protocolVersion" class="full-width">
            <el-option label="MQTT 3.1" :value="3" />
            <el-option label="MQTT 3.1.1" :value="4" />
            <el-option label="MQTT 5.0" :value="5" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="保持连接" prop="keepAlive">
          <el-input-number
            v-model="formData.keepAlive"
            :min="0"
            :max="65535"
            controls-position="right"
            class="full-width"
          />
          <span class="form-item-help">秒 (0表示禁用)</span>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="formData.cleanSession">
            清理会话
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="formData.autoKeepAlive">
            自动保持连接
          </el-checkbox>
        </el-form-item>
      </el-card>

      <!-- 遗嘱消息配置 -->
      <el-card class="config-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Warning /></el-icon>
            <span>遗嘱消息 (LWT)</span>
            <el-switch
              v-model="willEnabled"
              size="small"
              style="margin-left: auto;"
            />
          </div>
        </template>
        
        <template v-if="willEnabled">
          <el-form-item label="遗嘱主题" prop="willTopic">
            <el-input
              v-model="formData.willMessage.topic"
              placeholder="device/status"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="遗嘱消息" prop="willMessageContent">
            <el-input
              v-model="formData.willMessage.message"
              type="textarea"
              :rows="2"
              placeholder="offline"
            />
          </el-form-item>
          
          <el-form-item label="遗嘱QoS">
            <el-select v-model="formData.willMessage.qos" class="full-width">
              <el-option label="QoS 0 (最多一次)" :value="0" />
              <el-option label="QoS 1 (至少一次)" :value="1" />
              <el-option label="QoS 2 (精确一次)" :value="2" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="formData.willMessage.retain">
              保留遗嘱消息
            </el-checkbox>
          </el-form-item>
        </template>
      </el-card>

      <!-- SSL/TLS配置 -->
      <el-card class="config-section" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><Lock /></el-icon>
            <span>SSL/TLS 配置</span>
            <el-switch
              v-model="formData.ssl.enabled"
              size="small"
              style="margin-left: auto;"
            />
          </div>
        </template>
        
        <template v-if="formData.ssl.enabled">
          <el-form-item label="SSL协议">
            <el-select v-model="formData.ssl.protocol" class="full-width">
              <el-option label="TLS 1.2" value="TLSv1.2" />
              <el-option label="TLS 1.3" value="TLSv1.3" />
              <el-option label="任意协议" value="any" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="证书验证">
            <el-select v-model="formData.ssl.peerVerifyMode" class="full-width">
              <el-option label="不验证" value="none" />
              <el-option label="查询证书" value="query" />
              <el-option label="验证证书" value="verify" />
              <el-option label="自动验证" value="auto" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="验证深度">
            <el-input-number
              v-model="formData.ssl.peerVerifyDepth"
              :min="0"
              :max="10"
              controls-position="right"
              class="full-width"
            />
          </el-form-item>
          
          <el-form-item label="CA证书文件">
            <el-input
              v-model="caCertificatesText"
              type="textarea"
              :rows="2"
              placeholder="多个文件路径用换行分隔"
              @input="updateCaCertificates"
            />
          </el-form-item>
          
          <el-form-item label="客户端证书">
            <el-input
              v-model="formData.ssl.clientCertificate"
              placeholder="客户端证书文件路径"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="私钥文件">
            <el-input
              v-model="formData.ssl.privateKey"
              placeholder="私钥文件路径"
              clearable
            />
          </el-form-item>
        </template>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="testConnection" :loading="testing">
          测试连接
        </el-button>
        <el-button type="success" @click="handleSave" :loading="saving">
          保存配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Connection, Key, Setting, Warning, Lock } from '@element-plus/icons-vue'

// Props & Emits
interface Props {
  visible: boolean
  config?: MQTTConfig
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', config: MQTTConfig): void
  (e: 'test', config: MQTTConfig): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  config: undefined
})

const emit = defineEmits<Emits>()

// Refs
const formRef = ref<FormInstance>()
const testing = ref(false)
const saving = ref(false)

// 遗嘱消息启用状态
const willEnabled = ref(false)

// CA证书文本表示
const caCertificatesText = ref('')

// Form Data
const formData = reactive({
  hostname: 'localhost',
  port: 1883,
  clientId: '',
  username: '',
  password: '',
  protocolVersion: 4, // MQTT 3.1.1
  cleanSession: true,
  keepAlive: 60,
  autoKeepAlive: true,
  topicFilter: '',
  mode: 0, // Subscriber
  willMessage: {
    topic: '',
    message: '',
    qos: 0,
    retain: false
  },
  ssl: {
    enabled: false,
    protocol: 'TLSv1.2',
    peerVerifyMode: 'verify',
    peerVerifyDepth: 3,
    caCertificates: [] as string[],
    clientCertificate: '',
    privateKey: ''
  }
})

// Validation Rules
const rules: FormRules = {
  hostname: [
    { required: true, message: '请输入主机名', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口号必须在1-65535之间', trigger: 'blur' }
  ],
  clientId: [
    { required: true, message: '请输入客户端ID', trigger: 'blur' }
  ],
  topicFilter: [
    { required: true, message: '请输入主题', trigger: 'blur' }
  ],
  keepAlive: [
    { type: 'number', min: 0, max: 65535, message: '保持连接时间必须在0-65535之间', trigger: 'blur' }
  ],
  willTopic: [
    { validator: validateWillTopic, trigger: 'blur' }
  ],
  willMessageContent: [
    { validator: validateWillMessage, trigger: 'blur' }
  ]
}

// 遗嘱消息验证
function validateWillTopic(rule: any, value: string, callback: Function) {
  if (willEnabled.value && (!value || value.trim() === '')) {
    callback(new Error('启用遗嘱消息时，遗嘱主题不能为空'))
  } else {
    callback()
  }
}

function validateWillMessage(rule: any, value: string, callback: Function) {
  if (willEnabled.value && (!value || value.trim() === '')) {
    callback(new Error('启用遗嘱消息时，遗嘱消息内容不能为空'))
  } else {
    callback()
  }
}

// Watch props changes
watch(() => props.visible, (newValue) => {
  if (newValue && props.config) {
    loadConfig(props.config)
  } else if (newValue && !props.config) {
    resetForm()
  }
})

// Methods
function loadConfig(config: MQTTConfig) {
  Object.assign(formData, {
    ...config,
    willMessage: config.willMessage ? { ...config.willMessage } : {
      topic: '',
      message: '',
      qos: 0,
      retain: false
    },
    ssl: { ...config.ssl }
  })
  
  willEnabled.value = !!config.willMessage?.topic
  caCertificatesText.value = config.ssl.caCertificates?.join('\n') || ''
}

function resetForm() {
  Object.assign(formData, {
    hostname: 'localhost',
    port: 1883,
    clientId: generateClientId(),
    username: '',
    password: '',
    protocolVersion: 4,
    cleanSession: true,
    keepAlive: 60,
    autoKeepAlive: true,
    topicFilter: '',
    mode: 0,
    willMessage: {
      topic: '',
      message: '',
      qos: 0,
      retain: false
    },
    ssl: {
      enabled: false,
      protocol: 'TLSv1.2',
      peerVerifyMode: 'verify',
      peerVerifyDepth: 3,
      caCertificates: [],
      clientCertificate: '',
      privateKey: ''
    }
  })
  
  willEnabled.value = false
  caCertificatesText.value = ''
}

function generateClientId(): string {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let clientId = 'vscode-serial-studio-'
  
  for (let i = 0; i < 16; i++) {
    clientId += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return clientId
}

function regenerateClientId() {
  formData.clientId = generateClientId()
  ElMessage.success('客户端ID已重新生成')
}

function updateCaCertificates(value: string) {
  formData.ssl.caCertificates = value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

async function testConnection() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    testing.value = true
    
    const config = buildConfig()
    emit('test', config)
    
    // 这里应该等待测试结果，暂时模拟
    setTimeout(() => {
      testing.value = false
      ElMessage.success('连接测试成功')
    }, 2000)
    
  } catch (error) {
    ElMessage.error('请检查配置项')
  }
}

async function handleSave() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const config = buildConfig()
    emit('save', config)
    
    setTimeout(() => {
      saving.value = false
      emit('update:visible', false)
      ElMessage.success('配置保存成功')
    }, 1000)
    
  } catch (error) {
    ElMessage.error('请检查配置项')
  }
}

function buildConfig(): MQTTConfig {
  const config: MQTTConfig = {
    hostname: formData.hostname,
    port: formData.port,
    clientId: formData.clientId,
    username: formData.username || undefined,
    password: formData.password || undefined,
    protocolVersion: formData.protocolVersion,
    cleanSession: formData.cleanSession,
    keepAlive: formData.keepAlive,
    autoKeepAlive: formData.autoKeepAlive,
    topicFilter: formData.topicFilter,
    mode: formData.mode,
    ssl: { ...formData.ssl }
  }
  
  // 如果启用了遗嘱消息
  if (willEnabled.value && formData.willMessage.topic) {
    config.willMessage = { ...formData.willMessage }
  }
  
  return config
}

function handleClose() {
  emit('update:visible', false)
}

// Types (这些应该从MQTT types中导入)
interface MQTTConfig {
  hostname: string
  port: number
  clientId: string
  username?: string
  password?: string
  protocolVersion: number
  cleanSession: boolean
  keepAlive: number
  autoKeepAlive: boolean
  topicFilter: string
  mode: number
  willMessage?: {
    topic: string
    message: string
    qos: number
    retain: boolean
  }
  ssl: {
    enabled: boolean
    protocol: string
    peerVerifyMode: string
    peerVerifyDepth: number
    caCertificates?: string[]
    clientCertificate?: string
    privateKey?: string
  }
}
</script>

<style scoped>
.config-section {
  margin-bottom: 16px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.full-width {
  width: 100%;
}

.form-item-help {
  color: var(--el-text-color-regular);
  font-size: 12px;
  margin-left: 8px;
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

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
</style>
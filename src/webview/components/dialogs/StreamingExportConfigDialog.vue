<!--
  流式导出配置对话框
  对应Serial-Studio的CSV导出配置功能
  支持实时流式导出、自定义格式和大数据处理
-->

<template>
  <el-dialog
    v-model="visible"
    title="流式导出配置"
    width="800px"
    :before-close="handleClose"
    class="streaming-export-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="streaming-export-form"
    >
      <!-- 基础配置 -->
      <el-card shadow="never" class="config-section">
        <template #header>
          <span class="section-title">基础配置</span>
        </template>
        
        <el-form-item label="输出目录" prop="outputDirectory">
          <el-input
            v-model="form.outputDirectory"
            placeholder="选择导出文件的目录"
            :readonly="true"
            @click="selectOutputDirectory"
          >
            <template #append>
              <el-button @click="selectOutputDirectory">浏览</el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="文件前缀" prop="filePrefix">
          <el-input
            v-model="form.filePrefix"
            placeholder="导出文件的前缀名称"
            clearable
          >
            <template #prepend>serial_export</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="包含时间戳">
          <el-switch
            v-model="form.includeTimestamp"
            active-text="是"
            inactive-text="否"
          />
          <el-tooltip content="是否在CSV中包含数据接收时间戳列" placement="top">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </el-form-item>
      </el-card>

      <!-- CSV格式配置 -->
      <el-card shadow="never" class="config-section">
        <template #header>
          <span class="section-title">CSV格式配置</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分隔符" prop="csvOptions.delimiter">
              <el-select v-model="form.csvOptions.delimiter" placeholder="选择分隔符">
                <el-option label="逗号 (,)" value=","/>
                <el-option label="分号 (;)" value=";"/>
                <el-option label="制表符 (Tab)" value="\t"/>
                <el-option label="管道 (|)" value="|"/>
                <el-option label="自定义" value="custom"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.csvOptions.delimiter === 'custom'">
            <el-form-item label="自定义分隔符">
              <el-input
                v-model="customDelimiter"
                placeholder="输入自定义分隔符"
                maxlength="5"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="引号字符">
              <el-input
                v-model="form.csvOptions.quote"
                placeholder="引号字符"
                maxlength="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行结束符">
              <el-select v-model="form.csvOptions.lineEnding">
                <el-option label="LF (\\n)" value="\n"/>
                <el-option label="CRLF (\\r\\n)" value="\r\n"/>
                <el-option label="CR (\\r)" value="\r"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 字段配置 -->
      <el-card shadow="never" class="config-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">字段配置</span>
            <el-button
              size="small"
              type="primary"
              @click="showFieldSelection = true"
            >
              选择字段
            </el-button>
          </div>
        </template>
        
        <el-form-item label="可用字段">
          <div class="field-list">
            <el-tag
              v-for="(header, index) in availableHeaders"
              :key="index"
              :type="selectedFields.includes(index) ? 'primary' : 'info'"
              class="field-tag"
              @click="toggleField(index)"
            >
              {{ header }}
            </el-tag>
          </div>
        </el-form-item>
        
        <el-form-item label="数值精度">
          <el-input-number
            v-model="form.precision"
            :min="0"
            :max="10"
            placeholder="小数点后位数"
          />
        </el-form-item>
      </el-card>

      <!-- 性能配置 -->
      <el-card shadow="never" class="config-section">
        <template #header>
          <span class="section-title">性能配置</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="缓冲区大小">
              <el-input-number
                v-model="form.bufferSize"
                :min="1000"
                :max="100000"
                :step="1000"
                placeholder="记录数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="写入间隔">
              <el-input-number
                v-model="form.writeInterval"
                :min="100"
                :max="10000"
                :step="100"
                placeholder="毫秒"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分块大小">
              <el-input-number
                v-model="form.chunkSize"
                :min="100"
                :max="10000"
                :step="100"
                placeholder="记录数"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 高级选项 -->
      <el-card shadow="never" class="config-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">高级选项</span>
            <el-switch
              v-model="showAdvancedOptions"
              active-text="显示"
              inactive-text="隐藏"
            />
          </div>
        </template>
        
        <div v-show="showAdvancedOptions">
          <!-- 大数据处理 -->
          <el-form-item label="启用分块导出">
            <el-switch
              v-model="form.largeDataProcessing.chunkExport.enabled"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
          
          <el-row v-show="form.largeDataProcessing.chunkExport.enabled" :gutter="20">
            <el-col :span="12">
              <el-form-item label="最大内存使用">
                <el-input-number
                  v-model="form.largeDataProcessing.chunkExport.maxMemoryUsage"
                  :min="10"
                  :max="1000"
                  placeholder="MB"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <!-- 数据压缩 -->
          <el-form-item label="启用压缩">
            <el-switch
              v-model="form.largeDataProcessing.compression.enabled"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
          
          <el-row v-show="form.largeDataProcessing.compression.enabled" :gutter="20">
            <el-col :span="12">
              <el-form-item label="压缩算法">
                <el-select v-model="form.largeDataProcessing.compression.algorithm">
                  <el-option label="GZIP" value="gzip"/>
                  <el-option label="Deflate" value="deflate"/>
                  <el-option label="Brotli" value="brotli"/>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="压缩级别">
                <el-input-number
                  v-model="form.largeDataProcessing.compression.level"
                  :min="1"
                  :max="9"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirming">
          开始流式导出
        </el-button>
      </div>
    </template>

    <!-- 字段选择对话框 -->
    <el-dialog
      v-model="showFieldSelection"
      title="选择导出字段"
      width="600px"
      append-to-body
    >
      <div class="field-selection">
        <el-transfer
          v-model="selectedFields"
          :data="fieldTransferData"
          :titles="['可用字段', '已选字段']"
          :button-texts="['移除', '添加']"
          filterable
        />
      </div>
      
      <template #footer>
        <el-button @click="showFieldSelection = false">取消</el-button>
        <el-button type="primary" @click="applyFieldSelection">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import type { StreamingExportConfig, EnhancedStreamingExportConfig } from '../../../../../extension/export/types';

// Props
interface Props {
  visible: boolean;
  initialConfig?: Partial<StreamingExportConfig>;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  initialConfig: () => ({})
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'confirm': [config: EnhancedStreamingExportConfig];
  'cancel': [];
}>();

// Refs
const formRef = ref();
const confirming = ref(false);
const showAdvancedOptions = ref(false);
const showFieldSelection = ref(false);
const customDelimiter = ref('');

// 可用字段（模拟数据，实际应该从数据存储获取）
const availableHeaders = ref([
  'Timestamp',
  'Temperature (°C)',
  'Humidity (%)',
  'Pressure (hPa)',
  'Voltage (V)',
  'Current (A)',
  'Power (W)',
  'GPS Latitude',
  'GPS Longitude',
  'Acceleration X',
  'Acceleration Y',
  'Acceleration Z'
]);

const selectedFields = ref<number[]>([0, 1, 2, 3]);

// 表单数据
const form = reactive<EnhancedStreamingExportConfig>({
  outputDirectory: '',
  filePrefix: 'streaming_export',
  includeTimestamp: true,
  headers: availableHeaders.value,
  selectedFields: selectedFields.value,
  precision: 2,
  csvOptions: {
    delimiter: ',',
    quote: '"',
    escape: '"',
    lineEnding: '\n',
    encoding: 'utf-8'
  },
  bufferSize: 8192,
  writeInterval: 1000,
  chunkSize: 1000,
  customFormatOptions: {
    fieldSelection: {
      enabled: true,
      selectedFields: selectedFields.value,
      fieldOrder: selectedFields.value
    },
    customDelimiter: {
      enabled: false,
      delimiter: ',',
      customQuote: '"',
      customEscape: '"'
    },
    dataFiltering: {
      enabled: false
    },
    dataTransformation: {
      enabled: false,
      transformations: []
    }
  },
  largeDataProcessing: {
    chunkExport: {
      enabled: false,
      chunkSize: 1000,
      maxMemoryUsage: 100
    },
    compression: {
      enabled: false,
      algorithm: 'gzip',
      level: 6
    },
    pauseResume: {
      enabled: true,
      autoSaveInterval: 5000
    }
  }
});

// 表单验证规则
const rules = {
  outputDirectory: [
    { required: true, message: '请选择输出目录', trigger: 'blur' }
  ],
  filePrefix: [
    { required: true, message: '请输入文件前缀', trigger: 'blur' },
    { min: 1, max: 50, message: '文件前缀长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

// 计算属性
const fieldTransferData = computed(() => {
  return availableHeaders.value.map((header, index) => ({
    key: index,
    label: header,
    disabled: false
  }));
});

// 监听自定义分隔符变化
watch(() => form.csvOptions?.delimiter, (newValue) => {
  if (newValue === 'custom') {
    form.csvOptions!.delimiter = customDelimiter.value || ',';
  }
});

watch(customDelimiter, (newValue) => {
  if (form.csvOptions?.delimiter === 'custom') {
    form.csvOptions.delimiter = newValue || ',';
  }
});

// 监听选中字段变化
watch(selectedFields, (newFields) => {
  form.selectedFields = [...newFields];
  if (form.customFormatOptions?.fieldSelection) {
    form.customFormatOptions.fieldSelection.selectedFields = [...newFields];
    form.customFormatOptions.fieldSelection.fieldOrder = [...newFields];
  }
}, { deep: true });

// 初始化表单
watch(() => props.initialConfig, (config) => {
  if (config) {
    Object.assign(form, config);
    if (config.selectedFields) {
      selectedFields.value = [...config.selectedFields];
    }
  }
}, { immediate: true, deep: true });

// 方法
const selectOutputDirectory = async () => {
  try {
    // 在实际环境中，这里会调用VSCode的文件选择API
    // 目前使用模拟的路径
    form.outputDirectory = '/path/to/export/directory';
    ElMessage.success('已选择输出目录');
  } catch (error) {
    ElMessage.error('选择目录失败');
  }
};

const toggleField = (index: number) => {
  const fieldIndex = selectedFields.value.indexOf(index);
  if (fieldIndex > -1) {
    selectedFields.value.splice(fieldIndex, 1);
  } else {
    selectedFields.value.push(index);
  }
};

const applyFieldSelection = () => {
  showFieldSelection.value = false;
  ElMessage.success(`已选择 ${selectedFields.value.length} 个字段`);
};

const handleClose = () => {
  emit('update:visible', false);
  emit('cancel');
};

const handleConfirm = async () => {
  try {
    // 验证表单
    await formRef.value?.validate();
    
    confirming.value = true;
    
    // 准备配置数据
    const config: EnhancedStreamingExportConfig = {
      ...form,
      headers: selectedFields.value.map(index => availableHeaders.value[index]),
      selectedFields: [...selectedFields.value]
    };
    
    // 如果启用了自定义分隔符
    if (form.csvOptions?.delimiter === 'custom') {
      config.csvOptions!.delimiter = customDelimiter.value || ',';
      if (config.customFormatOptions?.customDelimiter) {
        config.customFormatOptions.customDelimiter.enabled = true;
        config.customFormatOptions.customDelimiter.delimiter = customDelimiter.value || ',';
      }
    }
    
    emit('confirm', config);
    emit('update:visible', false);
    
    ElMessage.success('流式导出配置完成');
    
  } catch (error) {
    console.error('表单验证失败:', error);
    ElMessage.error('请检查配置信息');
  } finally {
    confirming.value = false;
  }
};

// 重置表单
const resetForm = () => {
  form.outputDirectory = '';
  form.filePrefix = 'streaming_export';
  form.includeTimestamp = true;
  selectedFields.value = [0, 1, 2, 3];
  form.precision = 2;
  showAdvancedOptions.value = false;
};

// 导出方法给父组件使用
defineExpose({
  resetForm
});
</script>

<style scoped>
.streaming-export-dialog {
  .streaming-export-form {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .config-section {
    margin-bottom: 20px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .section-title {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .field-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .field-tag {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .info-icon {
    margin-left: 8px;
    color: var(--el-color-info);
    cursor: help;
  }
  
  .dialog-footer {
    text-align: right;
  }
}

.field-selection {
  .el-transfer {
    width: 100%;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .streaming-export-dialog {
    width: 95% !important;
    
    .streaming-export-form {
      max-height: 500px;
    }
  }
}
</style>
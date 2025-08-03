<template>
  <el-dialog
    v-model="visible"
    title="数据导出"
    :width="isAdvancedMode ? '800px' : '600px'"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 导出配置表单 -->
    <el-form
      ref="formRef"
      :model="exportConfig"
      :rules="formRules"
      label-width="120px"
      @submit.prevent
    >
      <!-- 基础配置区域 -->
      <div class="config-section">
        <h4 class="section-title">
          <i class="icon-export"></i>
          导出配置
        </h4>
        
        <!-- 数据源选择 -->
        <el-form-item label="数据源" prop="dataSource.type">
          <el-radio-group v-model="exportConfig.dataSource.type" @change="handleDataSourceChange">
            <el-radio label="current">当前数据</el-radio>
            <el-radio label="historical">历史数据</el-radio>
            <el-radio label="range">时间范围</el-radio>
            <el-radio label="selection">选中数据</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 时间范围选择 (仅在range模式下显示) -->
        <el-form-item 
          v-if="exportConfig.dataSource.type === 'range'"
          label="时间范围"
          prop="dataSource.range"
        >
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        
        <!-- 数据集选择 -->
        <el-form-item label="数据集" prop="dataSource.datasets">
          <el-select
            v-model="exportConfig.dataSource.datasets"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            placeholder="选择要导出的数据集"
            style="width: 100%"
          >
            <el-option
              v-for="dataset in availableDatasets"
              :key="dataset.id"
              :label="`${dataset.title} (${dataset.units})`"
              :value="dataset.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 导出格式 -->
        <el-form-item label="导出格式" prop="format.type">
          <el-select v-model="exportConfig.format.type" @change="handleFormatChange">
            <el-option
              v-for="format in supportedFormats"
              :key="format.type"
              :label="format.name"
              :value="format.type"
            >
              <div class="format-option">
                <span class="format-name">{{ format.name }}</span>
                <span class="format-desc">{{ format.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 文件路径 -->
        <el-form-item label="保存路径" prop="file.path">
          <div class="file-path-input">
            <el-input
              v-model="exportConfig.file.name"
              placeholder="输入文件名"
              @blur="handleFileNameChange"
            >
              <template #append>
                {{ getCurrentExtension() }}
              </template>
            </el-input>
            <el-button 
              type="primary" 
              :icon="Folder" 
              @click="selectSavePath"
              style="margin-left: 8px;"
            >
              浏览
            </el-button>
          </div>
          <div v-if="exportConfig.file.path" class="file-path-preview">
            保存到: {{ exportConfig.file.path }}
          </div>
        </el-form-item>
        
        <!-- 覆盖选项 -->
        <el-form-item v-if="fileExists" label="">
          <el-checkbox v-model="exportConfig.file.overwrite">
            文件已存在，是否覆盖？
          </el-checkbox>
        </el-form-item>
      </div>
      
      <!-- 高级选项 -->
      <div class="advanced-toggle">
        <el-button
          type="text"
          @click="isAdvancedMode = !isAdvancedMode"
        >
          <i :class="isAdvancedMode ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          {{ isAdvancedMode ? '隐藏高级选项' : '显示高级选项' }}
        </el-button>
      </div>
      
      <!-- 高级配置区域 -->
      <div v-if="isAdvancedMode" class="config-section advanced-section">
        <h4 class="section-title">
          <i class="icon-settings"></i>
          高级选项
        </h4>
        
        <!-- 格式特定选项 -->
        <component 
          :is="getFormatOptionsComponent()"
          v-model="exportConfig.format.options"
          :format-type="exportConfig.format.type"
        />
        
        <!-- 数据处理选项 -->
        <div class="processing-options">
          <h5>数据处理</h5>
          
          <el-form-item label="包含元数据">
            <el-switch v-model="exportConfig.processing.includeMetadata" />
          </el-form-item>
          
          <el-form-item label="包含时间戳">
            <el-switch v-model="exportConfig.processing.includeTimestamps" />
          </el-form-item>
          
          <el-form-item label="数据压缩">
            <el-switch v-model="exportConfig.processing.compression" />
          </el-form-item>
          
          <el-form-item label="数值精度">
            <el-input-number
              v-model="exportConfig.processing.precision"
              :min="0"
              :max="10"
              :step="1"
            />
          </el-form-item>
          
          <el-form-item label="字符编码">
            <el-select v-model="exportConfig.processing.encoding">
              <el-option label="UTF-8" value="utf-8" />
              <el-option label="GBK" value="gbk" />
              <el-option label="ASCII" value="ascii" />
            </el-select>
          </el-form-item>
        </div>
        
        <!-- 数据过滤选项 -->
        <div class="filter-options">
          <h5>数据过滤</h5>
          
          <el-form-item label="数值范围">
            <div class="range-input">
              <el-input-number
                v-model="valueRange[0]"
                placeholder="最小值"
                :precision="2"
              />
              <span>至</span>
              <el-input-number
                v-model="valueRange[1]"
                placeholder="最大值"
                :precision="2"
              />
            </div>
          </el-form-item>
        </div>
      </div>
    </el-form>
    
    <!-- 进度显示区域 -->
    <div v-if="isExporting" class="export-progress">
      <div class="progress-header">
        <h4>{{ getProgressTitle() }}</h4>
        <el-button 
          type="danger" 
          size="small" 
          @click="cancelExport"
          :disabled="exportProgress.stage === 'finalizing'"
        >
          取消
        </el-button>
      </div>
      
      <el-progress 
        :percentage="exportProgress.percentage"
        :status="getProgressStatus()"
        :stroke-width="18"
      >
        <template #default="{ percentage }">
          <span class="progress-text">{{ percentage }}%</span>
        </template>
      </el-progress>
      
      <div class="progress-details">
        <div class="progress-stats">
          <span>已处理: {{ exportProgress.processedRecords }} / {{ exportProgress.totalRecords }}</span>
          <span v-if="exportProgress.estimatedTimeRemaining > 0">
            预计剩余: {{ formatTime(exportProgress.estimatedTimeRemaining) }}
          </span>
        </div>
        <div class="progress-stage">
          {{ getStageDescription(exportProgress.stage) }}
          <span v-if="exportProgress.currentFile">: {{ exportProgress.currentFile }}</span>
        </div>
      </div>
    </div>
    
    <!-- 批量导出选项 -->
    <div v-if="!isExporting" class="batch-export-section">
      <el-checkbox v-model="batchMode">
        启用批量导出
      </el-checkbox>
      
      <div v-if="batchMode" class="batch-options">
        <el-form-item label="分割方式">
          <el-radio-group v-model="batchConfig.splitBy">
            <el-radio label="time">按时间分割</el-radio>
            <el-radio label="size">按大小分割</el-radio>
            <el-radio label="count">按记录数分割</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="batchConfig.splitBy === 'time'" label="时间间隔">
          <el-select v-model="batchConfig.timeInterval">
            <el-option label="1小时" value="1h" />
            <el-option label="6小时" value="6h" />
            <el-option label="12小时" value="12h" />
            <el-option label="1天" value="1d" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="batchConfig.splitBy === 'size'" label="文件大小(MB)">
          <el-input-number v-model="batchConfig.maxSize" :min="1" :max="1000" />
        </el-form-item>
        
        <el-form-item v-if="batchConfig.splitBy === 'count'" label="记录数">
          <el-input-number v-model="batchConfig.maxRecords" :min="100" :max="100000" :step="100" />
        </el-form-item>
      </div>
    </div>

    <!-- 对话框底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="startExport"
          :loading="isExporting"
          :disabled="!isConfigValid"
        >
          {{ isExporting ? '导出中...' : '开始导出' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import {
  ExportConfig,
  ExportFormatType,
  DataSourceType,
  ExportProgress,
  ExportFormat,
  DatasetInfo
} from '@/extension/export/types';
import { getExportManager } from '@/extension/export/ExportManager';
import CSVFormatOptions from './format-options/CSVFormatOptions.vue';
import JSONFormatOptions from './format-options/JSONFormatOptions.vue';
import ExcelFormatOptions from './format-options/ExcelFormatOptions.vue';
import XMLFormatOptions from './format-options/XMLFormatOptions.vue';

// Props 和 Emits
interface Props {
  modelValue: boolean;
  availableDatasets?: DatasetInfo[];
}

const props = withDefaults(defineProps<Props>(), {
  availableDatasets: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'export-started': [taskId: string];
  'export-completed': [result: any];
  'export-failed': [error: Error];
}>();

// 响应式状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formRef = ref<FormInstance>();
const isAdvancedMode = ref(false);
const isExporting = ref(false);
const batchMode = ref(false);
const fileExists = ref(false);
const currentTaskId = ref<string>('');

// 导出配置
const exportConfig = reactive<ExportConfig>({
  dataSource: {
    type: DataSourceType.CURRENT,
    datasets: [],
    groups: []
  },
  format: {
    type: ExportFormatType.CSV,
    options: {}
  },
  file: {
    path: '',
    name: '',
    overwrite: false
  },
  processing: {
    includeMetadata: true,
    includeTimestamps: true,
    compression: false,
    encoding: 'utf-8',
    precision: 2
  },
  filters: {}
});

// 批量导出配置
const batchConfig = reactive({
  splitBy: 'time',
  timeInterval: '1h',
  maxSize: 50,
  maxRecords: 10000
});

// 导出进度
const exportProgress = reactive<ExportProgress>({
  taskId: '',
  stage: 'preparing',
  percentage: 0,
  processedRecords: 0,
  totalRecords: 0,
  estimatedTimeRemaining: 0
});

// 时间范围和数值范围
const dateRange = ref<[string, string]>(['', '']);
const valueRange = ref<[number, number]>([0, 100]);

// 表单验证规则
const formRules: FormRules = {
  'dataSource.type': [
    { required: true, message: '请选择数据源类型', trigger: 'change' }
  ],
  'format.type': [
    { required: true, message: '请选择导出格式', trigger: 'change' }
  ],
  'file.name': [
    { required: true, message: '请输入文件名', trigger: 'blur' },
    { min: 1, max: 255, message: '文件名长度在 1 到 255 个字符', trigger: 'blur' }
  ]
};

// 计算属性
const supportedFormats = computed(() => {
  return getExportManager().getSupportedFormats();
});

const availableDatasets = computed(() => {
  return props.availableDatasets || [];
});

const isConfigValid = computed(() => {
  return !!(
    exportConfig.dataSource.type &&
    exportConfig.format.type &&
    exportConfig.file.name &&
    exportConfig.file.path
  );
});

// 方法
const handleDataSourceChange = () => {
  if (exportConfig.dataSource.type !== 'range') {
    dateRange.value = ['', ''];
    exportConfig.dataSource.range = undefined;
  }
};

const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates && dates.length === 2) {
    exportConfig.dataSource.range = {
      startTime: new Date(dates[0]),
      endTime: new Date(dates[1])
    };
  } else {
    exportConfig.dataSource.range = undefined;
  }
};

const handleFormatChange = () => {
  // 重置格式选项为默认值
  const format = supportedFormats.value.find(f => f.type === exportConfig.format.type);
  if (format) {
    exportConfig.format.options = { ...format.options };
  }
  
  // 更新文件扩展名
  updateFileExtension();
};

const handleFileNameChange = () => {
  updateFilePath();
  checkFileExists();
};

const updateFileExtension = () => {
  const format = supportedFormats.value.find(f => f.type === exportConfig.format.type);
  if (format && format.extensions.length > 0) {
    const currentName = exportConfig.file.name;
    const nameWithoutExt = currentName.replace(/\.[^/.]+$/, '');
    exportConfig.file.name = nameWithoutExt + format.extensions[0];
  }
};

const updateFilePath = () => {
  if (exportConfig.file.name) {
    // 这里应该使用 VSCode API 获取工作区路径
    exportConfig.file.path = `/tmp/${exportConfig.file.name}`;
  }
};

const checkFileExists = async () => {
  // 这里应该检查文件是否存在
  fileExists.value = false;
};

const selectSavePath = async () => {
  try {
    // 这里应该调用 VSCode API 打开文件选择对话框
    const result = await window.vscode.postMessage({
      command: 'selectSaveFile',
      filters: getFileFilters()
    });
    
    if (result && result.path) {
      exportConfig.file.path = result.path;
      exportConfig.file.name = result.name;
    }
  } catch (error) {
    ElMessage.error('选择保存路径失败');
  }
};

const getFileFilters = () => {
  const format = supportedFormats.value.find(f => f.type === exportConfig.format.type);
  if (format) {
    return {
      [format.name]: format.extensions
    };
  }
  return {};
};

const getCurrentExtension = () => {
  const format = supportedFormats.value.find(f => f.type === exportConfig.format.type);
  return format?.extensions[0] || '';
};

const getFormatOptionsComponent = () => {
  const componentMap = {
    [ExportFormatType.CSV]: 'CSVFormatOptions',
    [ExportFormatType.JSON]: 'JSONFormatOptions',
    [ExportFormatType.EXCEL]: 'ExcelFormatOptions',
    [ExportFormatType.XML]: 'XMLFormatOptions'
  };
  return componentMap[exportConfig.format.type] || 'div';
};

const startExport = async () => {
  try {
    // 验证表单
    if (!formRef.value) return;
    
    const valid = await formRef.value.validate();
    if (!valid) {
      ElMessage.error('请检查表单配置');
      return;
    }
    
    isExporting.value = true;
    
    // 设置进度回调
    const exportManager = getExportManager();
    exportManager.onProgress((progress) => {
      Object.assign(exportProgress, progress);
    });
    
    // 准备配置
    const config = { ...exportConfig };
    
    // 设置过滤器
    if (valueRange.value[0] !== 0 || valueRange.value[1] !== 100) {
      config.filters.valueRange = valueRange.value;
    }
    
    // 执行导出
    let result;
    if (batchMode.value) {
      result = await performBatchExport(config);
    } else {
      result = await exportManager.exportData(config);
    }
    
    // 导出成功
    ElMessage.success(`导出完成！文件已保存到 ${result.filePath}`);
    emit('export-completed', result);
    handleClose();
    
  } catch (error) {
    console.error('Export failed:', error);
    ElMessage.error(`导出失败: ${error.message}`);
    emit('export-failed', error as Error);
  } finally {
    isExporting.value = false;
  }
};

const performBatchExport = async (config: ExportConfig) => {
  // 批量导出逻辑
  const results = [];
  
  // 根据分割方式处理
  switch (batchConfig.splitBy) {
    case 'time':
      // 按时间分割
      break;
    case 'size':
      // 按大小分割
      break;
    case 'count':
      // 按记录数分割
      break;
  }
  
  return results;
};

const cancelExport = async () => {
  try {
    const confirmed = await ElMessageBox.confirm(
      '确定要取消当前导出操作吗？',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '继续导出',
        type: 'warning'
      }
    );
    
    if (confirmed && currentTaskId.value) {
      await getExportManager().cancelExport(currentTaskId.value);
      isExporting.value = false;
      ElMessage.info('导出已取消');
    }
  } catch {
    // 用户取消确认对话框
  }
};

const getProgressTitle = () => {
  const titles = {
    preparing: '准备导出数据...',
    processing: '处理数据...',
    writing: '写入文件...',
    finalizing: '完成导出...'
  };
  return titles[exportProgress.stage] || '导出中...';
};

const getProgressStatus = () => {
  if (exportProgress.percentage === 100) return 'success';
  if (exportProgress.stage === 'preparing') return 'normal';
  return 'active';
};

const getStageDescription = (stage: string) => {
  const descriptions = {
    preparing: '正在准备导出数据',
    processing: '正在应用过滤和转换',
    writing: '正在写入文件',
    finalizing: '正在完成导出'
  };
  return descriptions[stage] || '处理中';
};

const formatTime = (ms: number) => {
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

const handleClose = () => {
  if (isExporting.value) {
    ElMessageBox.confirm(
      '导出正在进行中，确定要关闭吗？',
      '确认关闭',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      if (currentTaskId.value) {
        cancelExport();
      }
      visible.value = false;
    }).catch(() => {
      // 用户取消
    });
  } else {
    visible.value = false;
  }
};

// 监听器
watch(() => exportConfig.format.type, () => {
  handleFormatChange();
}, { immediate: true });

watch(() => exportConfig.dataSource.datasets, () => {
  // 当选择的数据集改变时，可以进行一些处理
}, { deep: true });

// 组件挂载时初始化
const initializeExportConfig = () => {
  // 设置默认数据集
  if (availableDatasets.value.length > 0) {
    exportConfig.dataSource.datasets = availableDatasets.value.slice(0, 3).map(d => d.id);
  }
  
  // 设置默认文件名
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
  exportConfig.file.name = `export_${timestamp}`;
  
  // 更新文件路径
  updateFilePath();
};

// 初始化
initializeExportConfig();
</script>

<style scoped>
.config-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 8px;
  font-size: 18px;
  color: var(--el-color-primary);
}

.advanced-section {
  border: 1px solid var(--el-border-color-light);
}

.advanced-toggle {
  text-align: center;
  margin: 16px 0;
}

.format-option {
  display: flex;
  flex-direction: column;
}

.format-name {
  font-weight: 600;
}

.format-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.file-path-input {
  display: flex;
  align-items: center;
}

.file-path-preview {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 4px 8px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input span {
  color: var(--el-text-color-secondary);
}

.processing-options,
.filter-options {
  margin-top: 16px;
}

.processing-options h5,
.filter-options h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.export-progress {
  margin: 24px 0;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
}

.progress-details {
  margin-top: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.progress-stage {
  text-align: center;
}

.batch-export-section {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.batch-options {
  margin-top: 12px;
  padding-left: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 图标样式 */
.icon-export::before {
  content: "📤";
}

.icon-settings::before {
  content: "⚙️";
}
</style>
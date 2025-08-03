<!--
  WidgetExportDialog - Widget数据导出对话框
  支持多种格式的数据导出功能
-->

<template>
  <el-dialog
    v-model="visible"
    :title="`导出${widgetTypeName}数据`"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form 
      ref="formRef"
      :model="exportForm"
      :rules="exportRules"
      label-width="120px"
      label-position="left"
    >
      <!-- 导出格式选择 -->
      <el-card class="export-card" shadow="never">
        <template #header>
          <span class="card-title">导出格式</span>
        </template>
        
        <el-form-item label="文件格式" prop="format">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="csv">
              <div class="format-option">
                <el-icon><Document /></el-icon>
                <div class="format-info">
                  <div class="format-name">CSV</div>
                  <div class="format-desc">逗号分隔值文件，适合Excel打开</div>
                </div>
              </div>
            </el-radio>
            
            <el-radio label="json">
              <div class="format-option">
                <el-icon><DocumentAdd /></el-icon>
                <div class="format-info">
                  <div class="format-name">JSON</div>
                  <div class="format-desc">JavaScript对象格式，保留完整数据结构</div>
                </div>
              </div>
            </el-radio>
            
            <el-radio label="excel">
              <div class="format-option">
                <el-icon><Tickets /></el-icon>
                <div class="format-info">
                  <div class="format-name">Excel</div>
                  <div class="format-desc">Excel工作簿，支持多个工作表</div>
                </div>
              </div>
            </el-radio>
            
            <el-radio label="txt">
              <div class="format-option">
                <el-icon><Files /></el-icon>
                <div class="format-info">
                  <div class="format-name">TXT</div>
                  <div class="format-desc">纯文本文件</div>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <!-- 数据范围选择 -->
      <el-card class="export-card" shadow="never">
        <template #header>
          <span class="card-title">数据范围</span>
        </template>
        
        <el-form-item label="数据源">
          <el-radio-group v-model="exportForm.dataSource">
            <el-radio label="current">当前显示数据</el-radio>
            <el-radio label="all">全部历史数据</el-radio>
            <el-radio label="range">自定义时间范围</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 时间范围选择 -->
        <el-form-item 
          v-if="exportForm.dataSource === 'range'"
          label="时间范围"
          prop="timeRange"
        >
          <el-date-picker
            v-model="exportForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <!-- 数据点限制 -->
        <el-form-item label="最大数据点">
          <el-input-number
            v-model="exportForm.maxPoints"
            :min="100"
            :max="100000"
            :step="1000"
            controls-position="right"
          />
          <span class="form-tip">限制导出的数据点数量，0表示不限制</span>
        </el-form-item>
      </el-card>

      <!-- 导出选项 -->
      <el-card class="export-card" shadow="never">
        <template #header>
          <span class="card-title">导出选项</span>
        </template>
        
        <el-form-item label="文件名" prop="filename">
          <el-input
            v-model="exportForm.filename"
            placeholder="请输入文件名"
            clearable
          >
            <template #suffix>
              <span class="filename-extension">.{{ getFileExtension() }}</span>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- CSV特定选项 -->
        <template v-if="exportForm.format === 'csv'">
          <el-form-item label="分隔符">
            <el-select v-model="exportForm.csvOptions.delimiter">
              <el-option label="逗号 (,)" value="," />
              <el-option label="分号 (;)" value=";" />
              <el-option label="制表符" value="\t" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="编码格式">
            <el-select v-model="exportForm.csvOptions.encoding">
              <el-option label="UTF-8" value="utf8" />
              <el-option label="UTF-8 BOM" value="utf8-bom" />
              <el-option label="GBK" value="gbk" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="包含标题行">
            <el-switch v-model="exportForm.csvOptions.includeHeader" />
          </el-form-item>
        </template>
        
        <!-- Excel特定选项 -->
        <template v-if="exportForm.format === 'excel'">
          <el-form-item label="工作表名称">
            <el-input
              v-model="exportForm.excelOptions.sheetName"
              placeholder="工作表名称"
            />
          </el-form-item>
          
          <el-form-item label="包含图表">
            <el-switch v-model="exportForm.excelOptions.includeChart" />
          </el-form-item>
        </template>
        
        <!-- JSON特定选项 -->
        <template v-if="exportForm.format === 'json'">
          <el-form-item label="格式化输出">
            <el-switch v-model="exportForm.jsonOptions.prettify" />
          </el-form-item>
          
          <el-form-item label="包含元数据">
            <el-switch v-model="exportForm.jsonOptions.includeMetadata" />
          </el-form-item>
        </template>
      </el-card>
    </el-form>

    <!-- 数据预览 -->
    <el-card v-if="previewData.length > 0" class="export-card" shadow="never">
      <template #header>
        <div class="preview-header">
          <span class="card-title">数据预览</span>
          <el-tag size="small">{{ previewData.length }} 条记录</el-tag>
        </div>
      </template>
      
      <div class="preview-content">
        <el-table
          :data="previewData.slice(0, 10)"
          size="small"
          stripe
          max-height="200"
        >
          <el-table-column
            v-for="column in previewColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            show-overflow-tooltip
          />
        </el-table>
        
        <div v-if="previewData.length > 10" class="preview-more">
          还有 {{ previewData.length - 10 }} 条记录...
        </div>
      </div>
    </el-card>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button @click="generatePreview" :loading="previewing">
            预览数据
          </el-button>
        </div>
        
        <div class="footer-right">
          <el-button @click="handleClose">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleExport" 
            :loading="exporting"
            :disabled="previewData.length === 0"
          >
            开始导出
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  Document, 
  DocumentAdd, 
  Tickets, 
  Files 
} from '@element-plus/icons-vue';
import { WidgetType } from '../../../shared/types';

// Props定义
interface Props {
  modelValue: boolean;
  widgetType: WidgetType;
  data?: any;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({})
});

// Emits定义
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'export-confirmed': [config: any];
}>();

// 响应式状态
const visible = ref(false);
const formRef = ref<FormInstance>();
const exporting = ref(false);
const previewing = ref(false);
const previewData = ref<any[]>([]);
const previewColumns = ref<any[]>([]);

// 导出表单数据
const exportForm = ref({
  format: 'csv',
  dataSource: 'current',
  timeRange: [],
  maxPoints: 10000,
  filename: '',
  
  // CSV选项
  csvOptions: {
    delimiter: ',',
    encoding: 'utf8',
    includeHeader: true
  },
  
  // Excel选项
  excelOptions: {
    sheetName: 'Data',
    includeChart: false
  },
  
  // JSON选项
  jsonOptions: {
    prettify: true,
    includeMetadata: true
  }
});

// 表单验证规则
const exportRules: FormRules = {
  format: [
    { required: true, message: '请选择导出格式', trigger: 'change' }
  ],
  filename: [
    { required: true, message: '请输入文件名', trigger: 'blur' },
    { 
      pattern: /^[^<>:"/\\|?*]+$/, 
      message: '文件名包含非法字符', 
      trigger: 'blur' 
    }
  ],
  timeRange: [
    { 
      validator: (rule, value, callback) => {
        if (exportForm.value.dataSource === 'range' && (!value || value.length !== 2)) {
          callback(new Error('请选择时间范围'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// 计算属性
const widgetTypeName = computed(() => {
  const names: Record<WidgetType, string> = {
    [WidgetType.Plot]: '图表',
    [WidgetType.MultiPlot]: '多数据图表',
    [WidgetType.Gauge]: '仪表盘',
    [WidgetType.Bar]: '条形图',  
    [WidgetType.Compass]: '指南针',
    [WidgetType.Accelerometer]: '加速度计',
    [WidgetType.Gyroscope]: '陀螺仪',
    [WidgetType.GPS]: 'GPS',
    [WidgetType.LED]: 'LED面板',
    [WidgetType.DataGrid]: '数据网格',
    [WidgetType.Terminal]: '终端',
    [WidgetType.FFT]: '频谱',
    [WidgetType.Plot3D]: '3D图表'
  };
  
  return names[props.widgetType] || '组件';
});

// 方法
const getFileExtension = () => {
  const extensions: Record<string, string> = {
    csv: 'csv',
    json: 'json',
    excel: 'xlsx',
    txt: 'txt'
  };
  
  return extensions[exportForm.value.format] || 'dat';
};

const generateDefaultFilename = () => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const typeName = widgetTypeName.value.toLowerCase();
  return `${typeName}_data_${timestamp}`;
};

const generatePreview = async () => {
  previewing.value = true;
  
  try {
    // 模拟数据处理延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成预览数据
    const mockData = generateMockPreviewData();
    previewData.value = mockData.data;
    previewColumns.value = mockData.columns;
    
  } catch (error) {
    console.error('生成预览数据失败:', error);
  } finally {
    previewing.value = false;
  }
};

const generateMockPreviewData = () => {
  // 根据widget类型生成不同的预览数据
  switch (props.widgetType) {
    case WidgetType.Plot:
    case WidgetType.MultiPlot:
      return {
        columns: [
          { prop: 'timestamp', label: '时间戳', width: 180 },
          { prop: 'value', label: '数值', width: 120 },
          { prop: 'unit', label: '单位', width: 80 }
        ],
        data: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - (49 - i) * 1000).toISOString(),
          value: (Math.sin(i * 0.1) * 100 + Math.random() * 20).toFixed(2),
          unit: 'V'
        }))
      };
      
    case WidgetType.Gauge:
      return {
        columns: [
          { prop: 'timestamp', label: '时间戳', width: 180 },
          { prop: 'current', label: '当前值', width: 100 },
          { prop: 'min', label: '最小值', width: 100 },
          { prop: 'max', label: '最大值', width: 100 },
          { prop: 'unit', label: '单位', width: 80 }
        ],
        data: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (29 - i) * 2000).toISOString(),
          current: (Math.random() * 100).toFixed(1),
          min: '0',
          max: '100',
          unit: '%'
        }))
      };
      
    case WidgetType.GPS:
      return {
        columns: [
          { prop: 'timestamp', label: '时间戳', width: 180 },
          { prop: 'latitude', label: '纬度', width: 120 },
          { prop: 'longitude', label: '经度', width: 120 },
          { prop: 'altitude', label: '海拔', width: 100 }
        ],
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 5000).toISOString(),
          latitude: (39.9042 + (Math.random() - 0.5) * 0.01).toFixed(6),
          longitude: (116.4074 + (Math.random() - 0.5) * 0.01).toFixed(6),
          altitude: (50 + Math.random() * 10).toFixed(1)
        }))
      };
      
    default:
      return {
        columns: [
          { prop: 'timestamp', label: '时间戳', width: 180 },
          { prop: 'data', label: '数据', width: 200 }
        ],
        data: Array.from({ length: 25 }, (_, i) => ({
          timestamp: new Date(Date.now() - (24 - i) * 1000).toISOString(),
          data: `Sample data ${i + 1}`
        }))
      };
  }
};

const handleClose = () => {
  visible.value = false;
  emit('update:modelValue', false);
};

const handleExport = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    exporting.value = true;
    
    // 构建导出配置
    const exportConfig = {
      format: exportForm.value.format,
      filename: exportForm.value.filename,
      dataSource: exportForm.value.dataSource,
      timeRange: exportForm.value.timeRange,
      maxPoints: exportForm.value.maxPoints,
      data: previewData.value,
      
      // 格式特定选项
      options: exportForm.value.format === 'csv' ? exportForm.value.csvOptions :
               exportForm.value.format === 'excel' ? exportForm.value.excelOptions :
               exportForm.value.format === 'json' ? exportForm.value.jsonOptions :
               {}
    };
    
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    emit('export-confirmed', exportConfig);
    handleClose();
    
  } catch (error) {
    console.error('导出失败:', error);
  } finally {
    exporting.value = false;
  }
};

// 监听器
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    nextTick(() => {
      // 重置表单
      exportForm.value.filename = generateDefaultFilename();
      previewData.value = [];
      previewColumns.value = [];
    });
  }
});

watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false);
  }
});

// 自动生成预览数据
watch(() => exportForm.value.dataSource, () => {
  if (visible.value) {
    generatePreview();
  }
});
</script>

<style scoped>
.export-card {
  margin-bottom: 16px;
}

.export-card:last-child {
  margin-bottom: 0;
}

.card-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.format-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-left: 8px;
}

.format-info {
  flex: 1;
}

.format-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.format-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.3;
}

.filename-extension {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-left: 8px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  max-height: 300px;
  overflow: auto;
}

.preview-more {
  text-align: center;
  padding: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
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
</style>
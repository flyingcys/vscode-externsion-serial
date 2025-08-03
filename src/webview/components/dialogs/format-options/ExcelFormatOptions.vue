<template>
  <div class="excel-format-options">
    <h5>Excel 格式选项</h5>
    
    <el-form label-width="120px">
      <!-- 工作表名称 -->
      <el-form-item label="工作表名称">
        <el-input
          v-model="options.sheetName"
          placeholder="Data"
          style="width: 200px;"
          @input="updateOptions"
        />
        <span class="option-description">
          Excel工作表的名称
        </span>
      </el-form-item>
      
      <!-- 包含元数据 -->
      <el-form-item label="包含元数据">
        <el-switch v-model="options.includeMetadata" @change="updateOptions" />
        <span class="option-description">
          在单独工作表中包含导出元数据信息
        </span>
      </el-form-item>
      
      <!-- 自动调整列宽 -->
      <el-form-item label="自动调整列宽">
        <el-switch v-model="options.autoFitColumns" @change="updateOptions" />
        <span class="option-description">
          根据内容自动调整列宽度
        </span>
      </el-form-item>
      
      <!-- 日期格式 -->
      <el-form-item label="日期格式">
        <el-select v-model="options.dateFormat" @change="updateOptions">
          <el-option label="yyyy-mm-dd hh:mm:ss" value="yyyy-mm-dd hh:mm:ss" />
          <el-option label="yyyy/mm/dd hh:mm:ss" value="yyyy/mm/dd hh:mm:ss" />
          <el-option label="dd/mm/yyyy hh:mm:ss" value="dd/mm/yyyy hh:mm:ss" />
          <el-option label="mm/dd/yyyy hh:mm:ss" value="mm/dd/yyyy hh:mm:ss" />
          <el-option label="yyyy-mm-dd" value="yyyy-mm-dd" />
          <el-option label="自定义格式" value="custom" />
        </el-select>
        
        <el-input
          v-if="options.dateFormat === 'custom'"
          v-model="customDateFormat"
          placeholder="yyyy-mm-dd hh:mm:ss"
          style="width: 200px; margin-top: 8px;"
          @input="handleCustomDateFormat"
        />
      </el-form-item>
      
      <!-- 数字格式 -->
      <el-form-item label="数字格式">
        <el-select v-model="options.numberFormat" @change="updateOptions">
          <el-option label="通用格式" value="General" />
          <el-option label="保留2位小数" value="0.00" />
          <el-option label="保留3位小数" value="0.000" />
          <el-option label="科学计数法" value="0.00E+00" />
          <el-option label="千分位分隔符" value="#,##0.00" />
          <el-option label="百分比" value="0.00%" />
          <el-option label="自定义格式" value="custom" />
        </el-select>
        
        <el-input
          v-if="options.numberFormat === 'custom'"
          v-model="customNumberFormat"
          placeholder="0.00"
          style="width: 150px; margin-top: 8px;"
          @input="handleCustomNumberFormat"
        />
      </el-form-item>
      
      <!-- 冻结表头 -->
      <el-form-item label="冻结表头">
        <el-switch v-model="options.freezeHeader" @change="updateOptions" />
        <span class="option-description">
          冻结第一行表头，滚动时保持可见
        </span>
      </el-form-item>
      
      <!-- 自动筛选 -->
      <el-form-item label="自动筛选">
        <el-switch v-model="options.autoFilter" @change="updateOptions" />
        <span class="option-description">
          为表头添加筛选下拉箭头
        </span>
      </el-form-item>
      
      <!-- 包含图表 -->
      <el-form-item label="包含图表">
        <el-switch v-model="options.includeChart" @change="updateOptions" />
        <span class="option-description">
          在工作表中创建数据图表
        </span>
      </el-form-item>
      
      <!-- 图表配置 -->
      <div v-if="options.includeChart" class="chart-config">
        <h6>图表配置</h6>
        
        <el-form-item label="图表类型">
          <el-select v-model="chartConfig.type" @change="updateChartConfig">
            <el-option label="折线图" value="line" />
            <el-option label="柱状图" value="bar" />
            <el-option label="散点图" value="scatter" />
            <el-option label="面积图" value="area" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="图表位置">
          <div class="chart-position">
            <label>列:</label>
            <el-input-number v-model="chartConfig.position.x" :min="1" @change="updateChartConfig" />
            <label>行:</label>
            <el-input-number v-model="chartConfig.position.y" :min="1" @change="updateChartConfig" />
          </div>
        </el-form-item>
        
        <el-form-item label="图表大小">
          <div class="chart-size">
            <label>宽度:</label>
            <el-input-number v-model="chartConfig.size.width" :min="200" :step="50" @change="updateChartConfig" />
            <label>高度:</label>
            <el-input-number v-model="chartConfig.size.height" :min="150" :step="50" @change="updateChartConfig" />
          </div>
        </el-form-item>
        
        <el-form-item label="数据系列">
          <el-select v-model="chartConfig.series.categories" placeholder="选择X轴数据">
            <el-option label="时间戳" value="timestamp" />
            <el-option label="序号" value="index" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="数值列">
          <el-select v-model="chartConfig.series.values" multiple placeholder="选择Y轴数据">
            <el-option label="温度" value="temperature" />
            <el-option label="湿度" value="humidity" />
            <el-option label="压力" value="pressure" />
          </el-select>
        </el-form-item>
      </div>
      
      <!-- 样式设置 -->
      <div class="style-settings">
        <h6>样式设置</h6>
        
        <el-form-item label="表头样式">
          <el-switch v-model="options.headerStyle" @change="updateOptions" />
          <span class="option-description">
            为表头应用粗体和背景色
          </span>
        </el-form-item>
        
        <el-form-item label="表格边框">
          <el-switch v-model="options.tableBorders" @change="updateOptions" />
          <span class="option-description">
            为数据表格添加边框
          </span>
        </el-form-item>
        
        <el-form-item label="斑马条纹">
          <el-switch v-model="options.alternatingRows" @change="updateOptions" />
          <span class="option-description">
            交替行使用不同背景色
          </span>
        </el-form-item>
        
        <el-form-item label="主题色彩">
          <el-select v-model="options.colorTheme" @change="updateOptions">
            <el-option label="默认" value="default" />
            <el-option label="蓝色" value="blue" />
            <el-option label="绿色" value="green" />
            <el-option label="橙色" value="orange" />
            <el-option label="紫色" value="purple" />
          </el-select>
        </el-form-item>
      </div>
      
      <!-- 保护设置 -->
      <div class="protection-settings">
        <h6>保护设置</h6>
        
        <el-form-item label="保护工作表">
          <el-switch v-model="options.protectSheet" @change="updateOptions" />
          <span class="option-description">
            保护工作表防止意外修改
          </span>
        </el-form-item>
        
        <el-form-item v-if="options.protectSheet" label="保护密码">
          <el-input
            v-model="options.protectionPassword"
            type="password"
            placeholder="可选的保护密码"
            style="width: 200px;"
            @input="updateOptions"
          />
        </el-form-item>
      </div>
      
      <!-- 分页设置 -->
      <div class="page-settings">
        <h6>分页设置</h6>
        
        <el-form-item label="页面方向">
          <el-radio-group v-model="options.pageOrientation" @change="updateOptions">
            <el-radio label="portrait">纵向</el-radio>
            <el-radio label="landscape">横向</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="页面大小">
          <el-select v-model="options.pageSize" @change="updateOptions">
            <el-option label="A4" value="A4" />
            <el-option label="A3" value="A3" />
            <el-option label="Letter" value="Letter" />
            <el-option label="Legal" value="Legal" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="打印标题">
          <el-switch v-model="options.printHeaders" @change="updateOptions" />
          <span class="option-description">
            在每页顶部重复打印表头
          </span>
        </el-form-item>
      </div>
    </el-form>
    
    <!-- 预览示例 -->
    <div class="format-preview">
      <h6>Excel预览信息</h6>
      <div class="preview-info">
        <div class="info-item">
          <strong>工作表:</strong> {{ options.sheetName || 'Data' }}
          <span v-if="options.includeMetadata"> + Metadata</span>
        </div>
        <div class="info-item">
          <strong>日期格式:</strong> {{ getDateFormatExample() }}
        </div>
        <div class="info-item">
          <strong>数字格式:</strong> {{ getNumberFormatExample() }}
        </div>
        <div v-if="options.includeChart" class="info-item">
          <strong>图表:</strong> {{ chartConfig.type }} ({{ chartConfig.size.width }}x{{ chartConfig.size.height }})
        </div>
        <div class="info-item">
          <strong>样式:</strong>
          <el-tag v-if="options.headerStyle" size="small">表头样式</el-tag>
          <el-tag v-if="options.tableBorders" size="small">边框</el-tag>
          <el-tag v-if="options.alternatingRows" size="small">斑马条纹</el-tag>
          <el-tag v-if="options.autoFilter" size="small">自动筛选</el-tag>
          <el-tag v-if="options.freezeHeader" size="small">冻结表头</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { ExcelOptions, ChartConfig } from '@/extension/export/types';

// 扩展ExcelOptions接口以包含额外选项
interface ExtendedExcelOptions extends ExcelOptions {
  freezeHeader?: boolean;
  autoFilter?: boolean;
  headerStyle?: boolean;
  tableBorders?: boolean;
  alternatingRows?: boolean;
  colorTheme?: string;
  protectSheet?: boolean;
  protectionPassword?: string;
  pageOrientation?: string;
  pageSize?: string;
  printHeaders?: boolean;
}

// Props
interface Props {
  modelValue: ExtendedExcelOptions;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: ExtendedExcelOptions];
}>();

// 响应式状态
const customDateFormat = ref('yyyy-mm-dd hh:mm:ss');
const customNumberFormat = ref('0.00');

// 本地选项副本
const options = ref<ExtendedExcelOptions>({
  sheetName: 'Data',
  includeChart: false,
  autoFitColumns: true,
  includeMetadata: true,
  dateFormat: 'yyyy-mm-dd hh:mm:ss',
  numberFormat: '0.00',
  freezeHeader: true,
  autoFilter: true,
  headerStyle: true,
  tableBorders: true,
  alternatingRows: false,
  colorTheme: 'default',
  protectSheet: false,
  protectionPassword: '',
  pageOrientation: 'portrait',
  pageSize: 'A4',
  printHeaders: true,
  ...props.modelValue
});

// 图表配置
const chartConfig = reactive<ChartConfig>({
  type: 'line',
  position: { x: 10, y: 1 },
  size: { width: 400, height: 300 },
  series: {
    name: 'Data Series',
    categories: 'timestamp',
    values: 'temperature'
  },
  ...props.modelValue.chartConfig
});

// 方法
const updateOptions = () => {
  const updatedOptions = { ...options.value };
  if (updatedOptions.includeChart) {
    updatedOptions.chartConfig = { ...chartConfig };
  }
  emit('update:modelValue', updatedOptions);
};

const updateChartConfig = () => {
  options.value.chartConfig = { ...chartConfig };
  updateOptions();
};

const handleCustomDateFormat = (value: string) => {
  if (options.value.dateFormat === 'custom') {
    options.value.dateFormat = value;
    updateOptions();
  }
};

const handleCustomNumberFormat = (value: string) => {
  if (options.value.numberFormat === 'custom') {
    options.value.numberFormat = value;
    updateOptions();
  }
};

const getDateFormatExample = () => {
  const now = new Date();
  const format = options.value.dateFormat;
  
  switch (format) {
    case 'yyyy-mm-dd hh:mm:ss':
      return '2023-12-25 10:30:00';
    case 'yyyy/mm/dd hh:mm:ss':
      return '2023/12/25 10:30:00';
    case 'dd/mm/yyyy hh:mm:ss':
      return '25/12/2023 10:30:00';
    case 'mm/dd/yyyy hh:mm:ss':
      return '12/25/2023 10:30:00';
    case 'yyyy-mm-dd':
      return '2023-12-25';
    case 'custom':
      return customDateFormat.value;
    default:
      return format;
  }
};

const getNumberFormatExample = () => {
  const value = 1234.567;
  const format = options.value.numberFormat;
  
  switch (format) {
    case 'General':
      return '1234.567';
    case '0.00':
      return '1234.57';
    case '0.000':
      return '1234.567';
    case '0.00E+00':
      return '1.23E+03';
    case '#,##0.00':
      return '1,234.57';
    case '0.00%':
      return '123456.70%';
    case 'custom':
      return customNumberFormat.value + ' → ' + value.toFixed(2);
    default:
      return format + ' → ' + value.toString();
  }
};

// 监听器
watch(() => props.modelValue, (newValue) => {
  options.value = { ...newValue };
  if (newValue.chartConfig) {
    Object.assign(chartConfig, newValue.chartConfig);
  }
}, { deep: true });
</script>

<style scoped>
.excel-format-options {
  padding: 0;
}

.excel-format-options h5,
.excel-format-options h6 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.excel-format-options h6 {
  font-size: 13px;
  margin: 16px 0 12px 0;
}

.option-description {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.chart-config,
.style-settings,
.protection-settings,
.page-settings {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.chart-position,
.chart-size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-position label,
.chart-size label {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 40px;
}

.format-preview {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.format-preview h6 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.preview-info {
  font-size: 12px;
}

.info-item {
  margin-bottom: 8px;
  line-height: 1.5;
}

.info-item strong {
  color: var(--el-text-color-primary);
  margin-right: 8px;
}

.info-item .el-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}
</style>
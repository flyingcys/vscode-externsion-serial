<template>
  <div class="csv-format-options">
    <h5>CSV 格式选项</h5>
    
    <el-form label-width="120px">
      <!-- 分隔符设置 -->
      <el-form-item label="分隔符">
        <el-radio-group v-model="options.delimiter" @change="updateOptions">
          <el-radio label=",">逗号 (,)</el-radio>
          <el-radio label=";">分号 (;)</el-radio>
          <el-radio label="\t">制表符 (\t)</el-radio>
          <el-radio label="|">竖线 (|)</el-radio>
          <el-radio label="custom">自定义</el-radio>
        </el-radio-group>
        
        <el-input
          v-if="options.delimiter === 'custom'"
          v-model="customDelimiter"
          placeholder="输入自定义分隔符"
          style="width: 120px; margin-top: 8px;"
          maxlength="1"
          @input="handleCustomDelimiter"
        />
      </el-form-item>
      
      <!-- 引号设置 -->
      <el-form-item label="引号字符">
        <el-select v-model="options.quote" @change="updateOptions">
          <el-option label="双引号 (&quot;)" value="&quot;" />
          <el-option label="单引号 (')" value="'" />
          <el-option label="无引号" value="" />
        </el-select>
      </el-form-item>
      
      <!-- 转义字符 -->
      <el-form-item label="转义字符">
        <el-select v-model="options.escape" @change="updateOptions">
          <el-option label="双引号 (&quot;)" value="&quot;" />
          <el-option label="反斜杠 (\)" value="\\" />
          <el-option label="与引号相同" value="same" />
        </el-select>
      </el-form-item>
      
      <!-- 包含表头 -->
      <el-form-item label="包含表头">
        <el-switch v-model="options.includeHeader" @change="updateOptions" />
        <span class="option-description">
          包含列名作为第一行
        </span>
      </el-form-item>
      
      <!-- 行结束符 -->
      <el-form-item label="行结束符">
        <el-radio-group v-model="options.lineEnding" @change="updateOptions">
          <el-radio label="\n">LF (\n)</el-radio>
          <el-radio label="\r\n">CRLF (\r\n)</el-radio>
          <el-radio label="\r">CR (\r)</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 数值精度 -->
      <el-form-item label="数值精度">
        <el-input-number
          v-model="options.precision"
          :min="0"
          :max="10"
          @change="updateOptions"
        />
        <span class="option-description">
          小数点后保留的位数
        </span>
      </el-form-item>
      
      <!-- 日期格式 -->
      <el-form-item label="日期格式">
        <el-select v-model="options.dateFormat" @change="updateOptions">
          <el-option label="ISO 8601 (2023-12-25T10:30:00)" value="iso" />
          <el-option label="中文格式 (2023年12月25日 10:30:00)" value="zh-CN" />
          <el-option label="美式格式 (12/25/2023 10:30:00 AM)" value="en-US" />
          <el-option label="Unix 时间戳" value="timestamp" />
          <el-option label="自定义格式" value="custom" />
        </el-select>
        
        <el-input
          v-if="options.dateFormat === 'custom'"
          v-model="customDateFormat"
          placeholder="YYYY-MM-DD HH:mm:ss"
          style="width: 200px; margin-top: 8px;"
          @input="handleCustomDateFormat"
        />
      </el-form-item>
      
      <!-- 字符编码 -->
      <el-form-item label="字符编码">
        <el-select v-model="options.encoding" @change="updateOptions">
          <el-option label="UTF-8" value="utf-8" />
          <el-option label="UTF-16" value="utf-16" />
          <el-option label="GBK" value="gbk" />
          <el-option label="GB2312" value="gb2312" />
          <el-option label="ASCII" value="ascii" />
          <el-option label="ISO-8859-1" value="iso-8859-1" />
        </el-select>
      </el-form-item>
      
      <!-- 空值处理 -->
      <el-form-item label="空值表示">
        <el-input
          v-model="options.nullValue"
          placeholder="空值的表示方式"
          style="width: 120px;"
          @input="updateOptions"
        />
        <span class="option-description">
          NULL值或空值的表示方式
        </span>
      </el-form-item>
      
      <!-- BOM设置 -->
      <el-form-item label="BOM标记">
        <el-switch v-model="options.includeBOM" @change="updateOptions" />
        <span class="option-description">
          在UTF-8文件开头添加BOM标记
        </span>
      </el-form-item>
    </el-form>
    
    <!-- 预览示例 -->
    <div class="format-preview">
      <h6>格式预览</h6>
      <el-input
        type="textarea"
        :rows="6"
        :model-value="previewText"
        readonly
        class="preview-text"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CSVOptions } from '@/extension/export/types';

// Props
interface Props {
  modelValue: CSVOptions;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: CSVOptions];
}>();

// 响应式状态
const customDelimiter = ref('');
const customDateFormat = ref('YYYY-MM-DD HH:mm:ss');

// 本地选项副本
const options = ref<CSVOptions>({
  delimiter: ',',
  quote: '"',
  escape: '"',
  encoding: 'utf-8',
  includeHeader: true,
  lineEnding: '\n',
  precision: 2,
  dateFormat: 'iso',
  nullValue: '',
  includeBOM: false,
  ...props.modelValue
});

// 计算属性
const previewText = computed(() => {
  const delimiter = options.value.delimiter === 'custom' ? customDelimiter.value : options.value.delimiter;
  const quote = options.value.quote;
  const lineEnding = options.value.lineEnding;
  
  let preview = '';
  
  // 添加表头
  if (options.value.includeHeader) {
    const headers = ['时间戳', '温度(°C)', '湿度(%)', '压力(hPa)'];
    const quotedHeaders = headers.map(h => quote ? `${quote}${h}${quote}` : h);
    preview += quotedHeaders.join(delimiter) + lineEnding;
  }
  
  // 添加示例数据
  const sampleData = [
    ['2023-12-25T10:30:00', '23.45', '65.2', '1013.25'],
    ['2023-12-25T10:30:01', '23.46', '65.1', '1013.23'],
    ['2023-12-25T10:30:02', '23.44', '65.3', '1013.27']
  ];
  
  sampleData.forEach(row => {
    const quotedRow = row.map(value => {
      // 应用数值精度
      if (!isNaN(Number(value)) && value.includes('.')) {
        const num = parseFloat(value);
        value = num.toFixed(options.value.precision || 2);
      }
      
      // 应用引号
      return quote ? `${quote}${value}${quote}` : value;
    });
    preview += quotedRow.join(delimiter) + lineEnding;
  });
  
  return preview;
});

// 方法
const updateOptions = () => {
  emit('update:modelValue', { ...options.value });
};

const handleCustomDelimiter = (value: string) => {
  if (options.value.delimiter === 'custom') {
    options.value.delimiter = value;
    updateOptions();
  }
};

const handleCustomDateFormat = (value: string) => {
  if (options.value.dateFormat === 'custom') {
    options.value.dateFormat = value;
    updateOptions();
  }
};

// 监听器
watch(() => props.modelValue, (newValue) => {
  options.value = { ...newValue };
}, { deep: true });

watch(() => options.value.escape, (newEscape) => {
  if (newEscape === 'same') {
    options.value.escape = options.value.quote;
    updateOptions();
  }
});
</script>

<style scoped>
.csv-format-options {
  padding: 0;
}

.csv-format-options h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.option-description {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
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

.preview-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.preview-text :deep(.el-textarea__inner) {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
}
</style>
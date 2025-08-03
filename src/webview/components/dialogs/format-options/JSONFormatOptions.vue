<template>
  <div class="json-format-options">
    <h5>JSON 格式选项</h5>
    
    <el-form label-width="120px">
      <!-- 格式化输出 -->
      <el-form-item label="格式化输出">
        <el-switch v-model="options.pretty" @change="updateOptions" />
        <span class="option-description">
          是否格式化JSON输出（美化）
        </span>
      </el-form-item>
      
      <!-- 缩进设置 -->
      <el-form-item v-if="options.pretty" label="缩进空格">
        <el-input-number
          v-model="options.indent"
          :min="0"
          :max="8"
          @change="updateOptions"
        />
        <span class="option-description">
          每级缩进的空格数
        </span>
      </el-form-item>
      
      <!-- 数据结构 -->
      <el-form-item label="数据结构">
        <el-radio-group v-model="options.arrayFormat" @change="updateOptions">
          <el-radio :label="true">数组格式</el-radio>
          <el-radio :label="false">对象格式</el-radio>
        </el-radio-group>
        <div class="structure-description">
          <span v-if="options.arrayFormat">
            输出为记录数组: [{"timestamp": "...", "value": ...}, ...]
          </span>
          <span v-else>
            输出为分组对象: {"dataset1": [...], "dataset2": [...]}
          </span>
        </div>
      </el-form-item>
      
      <!-- 包含元数据 -->
      <el-form-item label="包含元数据">
        <el-switch v-model="options.includeMetadata" @change="updateOptions" />
        <span class="option-description">
          包含导出信息、设备信息等元数据
        </span>
      </el-form-item>
      
      <!-- 字符编码 -->
      <el-form-item label="字符编码">
        <el-select v-model="options.encoding" @change="updateOptions">
          <el-option label="UTF-8" value="utf-8" />
          <el-option label="UTF-16" value="utf-16" />
          <el-option label="ASCII" value="ascii" />
        </el-select>
      </el-form-item>
      
      <!-- 数据压缩 -->
      <el-form-item label="数据压缩">
        <el-switch v-model="options.compression" @change="updateOptions" />
        <span class="option-description">
          使用gzip压缩减少文件大小
        </span>
      </el-form-item>
      
      <!-- 时间格式 -->
      <el-form-item label="时间格式">
        <el-select v-model="options.timeFormat" @change="updateOptions">
          <el-option label="ISO 8601字符串" value="iso" />
          <el-option label="Unix时间戳(秒)" value="unix" />
          <el-option label="Unix时间戳(毫秒)" value="unix_ms" />
          <el-option label="相对时间(秒)" value="relative" />
        </el-select>
      </el-form-item>
      
      <!-- 数值精度 -->
      <el-form-item label="数值精度">
        <el-input-number
          v-model="options.precision"
          :min="0"
          :max="15"
          @change="updateOptions"
        />
        <span class="option-description">
          浮点数精度（0表示保持原始精度）
        </span>
      </el-form-item>
      
      <!-- 空值处理 -->
      <el-form-item label="空值处理">
        <el-select v-model="options.nullHandling" @change="updateOptions">
          <el-option label="保持null" value="null" />
          <el-option label="转为空字符串" value="empty" />
          <el-option label="跳过字段" value="skip" />
          <el-option label="使用默认值" value="default" />
        </el-select>
      </el-form-item>
      
      <!-- 字段顺序 -->
      <el-form-item label="字段顺序">
        <el-select v-model="options.fieldOrder" @change="updateOptions">
          <el-option label="保持原始顺序" value="original" />
          <el-option label="按字母排序" value="alphabetical" />
          <el-option label="时间戳优先" value="timestamp_first" />
        </el-select>
      </el-form-item>
      
      <!-- 数组分块 -->
      <el-form-item label="数组分块">
        <el-switch v-model="enableChunking" @change="handleChunkingChange" />
        <span class="option-description">
          将大型数据集分割为多个数组
        </span>
      </el-form-item>
      
      <el-form-item v-if="enableChunking" label="分块大小">
        <el-input-number
          v-model="options.chunkSize"
          :min="100"
          :max="100000"
          :step="100"
          @change="updateOptions"
        />
        <span class="option-description">
          每个分块的记录数
        </span>
      </el-form-item>
      
      <!-- 自定义根键名 -->
      <el-form-item label="根键名">
        <el-input
          v-model="options.rootKey"
          placeholder="data"
          style="width: 150px;"
          @input="updateOptions"
        />
        <span class="option-description">
          自定义JSON根对象的键名
        </span>
      </el-form-item>
    </el-form>
    
    <!-- 预览示例 -->
    <div class="format-preview">
      <h6>格式预览</h6>
      <el-input
        type="textarea"
        :rows="12"
        :model-value="previewText"
        readonly
        class="preview-text"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { JSONOptions } from '@/extension/export/types';

// 扩展JSONOptions接口以包含额外选项
interface ExtendedJSONOptions extends JSONOptions {
  timeFormat?: string;
  precision?: number;
  nullHandling?: string;
  fieldOrder?: string;
  chunkSize?: number;
  rootKey?: string;
}

// Props
interface Props {
  modelValue: ExtendedJSONOptions;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: ExtendedJSONOptions];
}>();

// 响应式状态
const enableChunking = ref(false);

// 本地选项副本
const options = ref<ExtendedJSONOptions>({
  pretty: true,
  indent: 2,
  encoding: 'utf-8',
  includeMetadata: true,
  arrayFormat: true,
  compression: false,
  timeFormat: 'iso',
  precision: 0,
  nullHandling: 'null',
  fieldOrder: 'original',
  chunkSize: 1000,
  rootKey: 'data',
  ...props.modelValue
});

// 计算属性
const previewText = computed(() => {
  const sampleData = generateSampleData();
  
  if (options.value.arrayFormat) {
    return generateArrayFormatPreview(sampleData);
  } else {
    return generateObjectFormatPreview(sampleData);
  }
});

// 方法
const updateOptions = () => {
  emit('update:modelValue', { ...options.value });
};

const handleChunkingChange = () => {
  if (!enableChunking.value) {
    delete options.value.chunkSize;
  }
  updateOptions();
};

const generateSampleData = () => {
  const now = new Date();
  const baseTime = now.getTime();
  
  return [
    {
      timestamp: formatTimestamp(new Date(baseTime), options.value.timeFormat),
      temperature: formatNumber(23.45, options.value.precision),
      humidity: formatNumber(65.2, options.value.precision),
      pressure: formatNumber(1013.25, options.value.precision)
    },
    {
      timestamp: formatTimestamp(new Date(baseTime + 1000), options.value.timeFormat),
      temperature: formatNumber(23.46, options.value.precision),
      humidity: formatNumber(65.1, options.value.precision),
      pressure: formatNumber(1013.23, options.value.precision)
    },
    {
      timestamp: formatTimestamp(new Date(baseTime + 2000), options.value.timeFormat),
      temperature: formatNumber(23.44, options.value.precision),
      humidity: formatNumber(65.3, options.value.precision),
      pressure: formatNumber(1013.27, options.value.precision)
    }
  ];
};

const formatTimestamp = (date: Date, format?: string) => {
  switch (format) {
    case 'unix':
      return Math.floor(date.getTime() / 1000);
    case 'unix_ms':
      return date.getTime();
    case 'relative':
      return 0; // 相对于开始时间的秒数
    case 'iso':
    default:
      return date.toISOString();
  }
};

const formatNumber = (value: number, precision?: number) => {
  if (precision && precision > 0) {
    return parseFloat(value.toFixed(precision));
  }
  return value;
};

const generateArrayFormatPreview = (data: any[]) => {
  const result = {
    [options.value.rootKey || 'data']: data
  };
  
  if (options.value.includeMetadata) {
    result.metadata = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      source: 'Serial-Studio VSCode Extension',
      recordCount: data.length
    };
  }
  
  return JSON.stringify(result, null, options.value.pretty ? options.value.indent : 0);
};

const generateObjectFormatPreview = (data: any[]) => {
  const result = {
    datasets: {
      temperature: data.map(d => ({ timestamp: d.timestamp, value: d.temperature })),
      humidity: data.map(d => ({ timestamp: d.timestamp, value: d.humidity })),
      pressure: data.map(d => ({ timestamp: d.timestamp, value: d.pressure }))
    }
  };
  
  if (options.value.includeMetadata) {
    result.metadata = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      source: 'Serial-Studio VSCode Extension',
      datasetCount: Object.keys(result.datasets).length
    };
  }
  
  return JSON.stringify(result, null, options.value.pretty ? options.value.indent : 0);
};

const sortFields = (obj: any, order: string) => {
  if (order === 'alphabetical') {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  } else if (order === 'timestamp_first') {
    const sorted = {};
    if (obj.timestamp !== undefined) {
      sorted.timestamp = obj.timestamp;
    }
    Object.keys(obj).forEach(key => {
      if (key !== 'timestamp') {
        sorted[key] = obj[key];
      }
    });
    return sorted;
  }
  return obj;
};

// 监听器
watch(() => props.modelValue, (newValue) => {
  options.value = { ...newValue };
  enableChunking.value = !!(newValue.chunkSize && newValue.chunkSize > 0);
}, { deep: true });
</script>

<style scoped>
.json-format-options {
  padding: 0;
}

.json-format-options h5 {
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

.structure-description {
  margin-top: 8px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
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
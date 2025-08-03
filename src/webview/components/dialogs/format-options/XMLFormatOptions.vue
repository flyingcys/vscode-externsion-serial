<template>
  <div class="xml-format-options">
    <h5>XML 格式选项</h5>
    
    <el-form label-width="120px">
      <!-- 根元素名称 -->
      <el-form-item label="根元素">
        <el-input
          v-model="options.rootElement"
          placeholder="data"
          style="width: 200px;"
          @input="updateOptions"
        />
        <span class="option-description">
          XML文档的根元素名称
        </span>
      </el-form-item>
      
      <!-- 记录元素名称 -->
      <el-form-item label="记录元素">
        <el-input
          v-model="options.recordElement"
          placeholder="record"
          style="width: 200px;"
          @input="updateOptions"
        />
        <span class="option-description">
          每条数据记录的元素名称
        </span>
      </el-form-item>
      
      <!-- 格式化输出 -->
      <el-form-item label="格式化输出">
        <el-switch v-model="options.prettyPrint" @change="updateOptions" />
        <span class="option-description">
          是否格式化XML输出（美化缩进）
        </span>
      </el-form-item>
      
      <!-- 缩进设置 -->
      <el-form-item v-if="options.prettyPrint" label="缩进空格">
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
      
      <!-- 使用属性 -->
      <el-form-item label="使用属性">
        <el-switch v-model="options.includeAttributes" @change="updateOptions" />
        <span class="option-description">
          将数据作为XML元素属性而非子元素
        </span>
      </el-form-item>
      
      <!-- 字符编码 -->
      <el-form-item label="字符编码">
        <el-select v-model="options.encoding" @change="updateOptions">
          <el-option label="UTF-8" value="utf-8" />
          <el-option label="UTF-16" value="utf-16" />
          <el-option label="ISO-8859-1" value="iso-8859-1" />
          <el-option label="ASCII" value="ascii" />
        </el-select>
      </el-form-item>
      
      <!-- XML版本 -->
      <el-form-item label="XML版本">
        <el-select v-model="options.xmlVersion" @change="updateOptions">
          <el-option label="1.0" value="1.0" />
          <el-option label="1.1" value="1.1" />
        </el-select>
      </el-form-item>
      
      <!-- 包含声明 -->
      <el-form-item label="包含XML声明">
        <el-switch v-model="options.includeDeclaration" @change="updateOptions" />
        <span class="option-description">
          在文件开头包含 &lt;?xml version="1.0" encoding="utf-8"?&gt;
        </span>
      </el-form-item>
      
      <!-- 命名空间 -->
      <el-form-item label="使用命名空间">
        <el-switch v-model="useNamespace" @change="handleNamespaceChange" />
        <span class="option-description">
          为XML元素添加命名空间
        </span>
      </el-form-item>
      
      <el-form-item v-if="useNamespace" label="命名空间URI">
        <el-input
          v-model="options.namespace"
          placeholder="http://example.com/serialstudio"
          style="width: 300px;"
          @input="updateOptions"
        />
      </el-form-item>
      
      <el-form-item v-if="useNamespace" label="命名空间前缀">
        <el-input
          v-model="options.namespacePrefix"
          placeholder="ss"
          style="width: 100px;"
          @input="updateOptions"
        />
      </el-form-item>
      
      <!-- 数据类型标注 -->
      <el-form-item label="数据类型标注">
        <el-switch v-model="options.includeDataTypes" @change="updateOptions" />
        <span class="option-description">
          为数据元素添加type属性标明数据类型
        </span>
      </el-form-item>
      
      <!-- 元数据处理 -->
      <el-form-item label="包含元数据">
        <el-switch v-model="options.includeMetadata" @change="updateOptions" />
        <span class="option-description">
          在XML中包含导出元数据信息
        </span>
      </el-form-item>
      
      <!-- CDATA包装 -->
      <el-form-item label="CDATA包装">
        <el-select v-model="options.cdataWrapping" @change="updateOptions">
          <el-option label="不使用" value="none" />
          <el-option label="文本值" value="text" />
          <el-option label="所有值" value="all" />
          <el-option label="特殊字符" value="special" />
        </el-select>
        <span class="option-description">
          选择何时使用CDATA包装数据值
        </span>
      </el-form-item>
      
      <!-- 元素排序 -->
      <el-form-item label="元素排序">
        <el-select v-model="options.elementOrder" @change="updateOptions">
          <el-option label="保持原始顺序" value="original" />
          <el-option label="按字母排序" value="alphabetical" />
          <el-option label="时间戳优先" value="timestamp_first" />
        </el-select>
      </el-form-item>
      
      <!-- 空值处理 -->
      <el-form-item label="空值处理">
        <el-select v-model="options.nullHandling" @change="updateOptions">
          <el-option label="空元素" value="empty" />
          <el-option label="自关闭标签" value="self_closing" />
          <el-option label="跳过元素" value="skip" />
          <el-option label="使用nil属性" value="nil" />
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
      
      <!-- Schema验证 -->
      <el-form-item label="包含Schema">
        <el-switch v-model="options.includeSchema" @change="updateOptions" />
        <span class="option-description">
          生成并包含XSD schema定义
        </span>
      </el-form-item>
      
      <!-- 注释设置 -->
      <el-form-item label="包含注释">
        <el-switch v-model="options.includeComments" @change="updateOptions" />
        <span class="option-description">
          在XML中包含描述性注释
        </span>
      </el-form-item>
    </el-form>
    
    <!-- 预览示例 -->
    <div class="format-preview">
      <h6>XML格式预览</h6>
      <el-input
        type="textarea"
        :rows="15"
        :model-value="previewText"
        readonly
        class="preview-text"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { XMLOptions } from '@/extension/export/types';

// 扩展XMLOptions接口以包含额外选项
interface ExtendedXMLOptions extends XMLOptions {
  xmlVersion?: string;
  includeDeclaration?: boolean;
  namespace?: string;
  namespacePrefix?: string;
  includeDataTypes?: boolean;
  includeMetadata?: boolean;
  cdataWrapping?: string;
  elementOrder?: string;
  nullHandling?: string;
  precision?: number;
  includeSchema?: boolean;
  includeComments?: boolean;
  indent?: number;
}

// Props
interface Props {
  modelValue: ExtendedXMLOptions;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: ExtendedXMLOptions];
}>();

// 响应式状态
const useNamespace = ref(false);

// 本地选项副本
const options = ref<ExtendedXMLOptions>({
  rootElement: 'data',
  recordElement: 'record',
  includeAttributes: false,
  prettyPrint: true,
  encoding: 'utf-8',
  xmlVersion: '1.0',
  includeDeclaration: true,
  namespace: '',
  namespacePrefix: '',
  includeDataTypes: false,
  includeMetadata: true,
  cdataWrapping: 'none',
  elementOrder: 'original',
  nullHandling: 'empty',
  precision: 0,
  includeSchema: false,
  includeComments: false,
  indent: 2,
  ...props.modelValue
});

// 计算属性
const previewText = computed(() => {
  return generateXMLPreview();
});

// 方法
const updateOptions = () => {
  emit('update:modelValue', { ...options.value });
};

const handleNamespaceChange = () => {
  if (!useNamespace.value) {
    options.value.namespace = '';
    options.value.namespacePrefix = '';
  } else {
    options.value.namespace = 'http://example.com/serialstudio';
    options.value.namespacePrefix = 'ss';
  }
  updateOptions();
};

const generateXMLPreview = () => {
  const opts = options.value;
  const indent = opts.prettyPrint ? ' '.repeat(opts.indent || 2) : '';
  const newline = opts.prettyPrint ? '\n' : '';
  const nsPrefix = opts.namespacePrefix ? `${opts.namespacePrefix}:` : '';
  
  let xml = '';
  
  // XML声明
  if (opts.includeDeclaration) {
    xml += `<?xml version="${opts.xmlVersion || '1.0'}" encoding="${opts.encoding}"?>${newline}`;
  }
  
  // 注释
  if (opts.includeComments) {
    xml += `<!-- Serial-Studio Data Export -->${newline}`;
    xml += `<!-- Generated: ${new Date().toISOString()} -->${newline}`;
  }
  
  // 根元素开始
  xml += `<${nsPrefix}${opts.rootElement}`;
  if (opts.namespace) {
    xml += ` xmlns${opts.namespacePrefix ? ':' + opts.namespacePrefix : ''}="${opts.namespace}"`;
  }
  xml += `>${newline}`;
  
  // 元数据
  if (opts.includeMetadata) {
    xml += `${indent}<${nsPrefix}metadata>${newline}`;
    xml += `${indent}${indent}<${nsPrefix}exportTime>${new Date().toISOString()}</${nsPrefix}exportTime>${newline}`;
    xml += `${indent}${indent}<${nsPrefix}version>1.0.0</${nsPrefix}version>${newline}`;
    xml += `${indent}${indent}<${nsPrefix}source>Serial-Studio VSCode Extension</${nsPrefix}source>${newline}`;
    xml += `${indent}</${nsPrefix}metadata>${newline}`;
  }
  
  // 数据记录
  const sampleData = [
    { timestamp: '2023-12-25T10:30:00', temperature: 23.45, humidity: 65.2, pressure: 1013.25 },
    { timestamp: '2023-12-25T10:30:01', temperature: 23.46, humidity: 65.1, pressure: 1013.23 },
    { timestamp: '2023-12-25T10:30:02', temperature: 23.44, humidity: 65.3, pressure: 1013.27 }
  ];
  
  sampleData.forEach(record => {
    if (opts.includeAttributes) {
      xml += `${indent}<${nsPrefix}${opts.recordElement}`;
      Object.entries(record).forEach(([key, value]) => {
        const formattedValue = formatValue(value, opts);
        xml += ` ${key}="${formattedValue}"`;
      });
      xml += opts.nullHandling === 'self_closing' ? ' />' : `></${nsPrefix}${opts.recordElement}>`;
      xml += newline;
    } else {
      xml += `${indent}<${nsPrefix}${opts.recordElement}>${newline}`;
      
      const entries = Object.entries(record);
      if (opts.elementOrder === 'alphabetical') {
        entries.sort(([a], [b]) => a.localeCompare(b));
      } else if (opts.elementOrder === 'timestamp_first') {
        entries.sort(([a], [b]) => {
          if (a === 'timestamp') return -1;
          if (b === 'timestamp') return 1;
          return 0;
        });
      }
      
      entries.forEach(([key, value]) => {
        const formattedValue = formatValue(value, opts);
        xml += `${indent}${indent}<${nsPrefix}${key}`;
        
        if (opts.includeDataTypes) {
          const type = typeof value === 'number' ? 'number' : 'string';
          xml += ` type="${type}"`;
        }
        
        xml += '>';
        
        if (opts.cdataWrapping === 'all' || 
            (opts.cdataWrapping === 'text' && typeof value === 'string') ||
            (opts.cdataWrapping === 'special' && hasSpecialChars(String(value)))) {
          xml += `<![CDATA[${formattedValue}]]>`;
        } else {
          xml += escapeXml(String(formattedValue));
        }
        
        xml += `</${nsPrefix}${key}>${newline}`;
      });
      
      xml += `${indent}</${nsPrefix}${opts.recordElement}>${newline}`;
    }
  });
  
  // 根元素结束
  xml += `</${nsPrefix}${opts.rootElement}>`;
  
  return xml;
};

const formatValue = (value: any, opts: ExtendedXMLOptions) => {
  if (typeof value === 'number' && opts.precision && opts.precision > 0) {
    return value.toFixed(opts.precision);
  }
  return value;
};

const hasSpecialChars = (str: string) => {
  return /[<>&"']/.test(str);
};

const escapeXml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// 监听器
watch(() => props.modelValue, (newValue) => {
  options.value = { ...newValue };
  useNamespace.value = !!(newValue.namespace);
}, { deep: true });
</script>

<style scoped>
.xml-format-options {
  padding: 0;
}

.xml-format-options h5 {
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
<!--
  WidgetSettingsDialog - Widget设置对话框
  为不同类型的Widget提供通用的设置界面
-->

<template>
  <el-dialog
    v-model="visible"
    :title="`${widgetTypeName}设置`"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form 
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
    >
      <!-- 基础设置 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <span class="card-title">基础设置</span>
        </template>
        
        <!-- 标题设置 -->
        <el-form-item label="组件标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入组件标题"
            clearable
          />
        </el-form-item>
        
        <!-- 尺寸设置 -->
        <el-form-item label="组件尺寸">
          <div class="size-controls">
            <el-input-number
              v-model="formData.size.width"
              :min="100"
              :max="2000"
              :step="10"
              controls-position="right"
              class="size-input"
            />
            <span class="size-separator">×</span>
            <el-input-number
              v-model="formData.size.height"
              :min="80"
              :max="1500"
              :step="10"
              controls-position="right"
              class="size-input"
            />
            <span class="size-unit">像素</span>
          </div>
        </el-form-item>
        
        <!-- 位置设置 -->
        <el-form-item label="组件位置">
          <div class="position-controls">
            <el-input-number
              v-model="formData.position.x"
              :min="0"
              :max="1920"
              :step="10"
              controls-position="right"
              class="position-input"
            />
            <span class="position-separator">,</span>
            <el-input-number
              v-model="formData.position.y"
              :min="0"
              :max="1080"
              :step="10"
              controls-position="right"
              class="position-input"
            />
          </div>
        </el-form-item>
      </el-card>

      <!-- 显示设置 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <span class="card-title">显示设置</span>
        </template>
        
        <!-- 主题颜色 -->
        <el-form-item label="主题颜色">
          <div class="color-controls">
            <el-color-picker
              v-model="formData.colors.primary"
              :predefine="predefineColors"
              show-alpha
            />
            <span class="color-label">主色调</span>
          </div>
        </el-form-item>
        
        <!-- 显示选项 -->
        <el-form-item label="显示选项">
          <div class="display-options">
            <el-checkbox v-model="formData.showLegend">显示图例</el-checkbox>
            <el-checkbox v-model="formData.showGrid">显示网格</el-checkbox>
            <el-checkbox v-model="formData.showLabels">显示标签</el-checkbox>
            <el-checkbox v-model="formData.showAnimation">启用动画</el-checkbox>
          </div>
        </el-form-item>
      </el-card>

      <!-- 特定Widget设置 -->
      <el-card v-if="hasSpecificSettings" class="settings-card" shadow="never">
        <template #header>
          <span class="card-title">{{ widgetTypeName }}专用设置</span>
        </template>
        
        <!-- Plot/MultiPlot设置 -->
        <template v-if="isPlotWidget">
          <el-form-item label="X轴标签" prop="xAxis.label">
            <el-input v-model="formData.xAxis.label" placeholder="X轴标签" />
          </el-form-item>
          
          <el-form-item label="Y轴标签" prop="yAxis.label">
            <el-input v-model="formData.yAxis.label" placeholder="Y轴标签" />
          </el-form-item>
          
          <el-form-item label="Y轴范围">
            <div class="range-controls">
              <el-input-number
                v-model="formData.yAxis.min"
                placeholder="最小值"
                controls-position="right"
                class="range-input"
              />
              <span class="range-separator">~</span>
              <el-input-number
                v-model="formData.yAxis.max"
                placeholder="最大值"
                controls-position="right"
                class="range-input"
              />
            </div>
          </el-form-item>
          
          <el-form-item label="数据点数量">
            <el-input-number
              v-model="formData.maxDataPoints"
              :min="100"
              :max="10000"
              :step="100"
              controls-position="right"
            />
          </el-form-item>
        </template>
        
        <!-- Gauge设置 -->
        <template v-if="isGaugeWidget">
          <el-form-item label="最小值" prop="minValue">
            <el-input-number
              v-model="formData.minValue"
              :precision="2"
              controls-position="right"
            />
          </el-form-item>
          
          <el-form-item label="最大值" prop="maxValue">
            <el-input-number
              v-model="formData.maxValue"
              :precision="2"
              controls-position="right"
            />
          </el-form-item>
          
          <el-form-item label="单位" prop="units">
            <el-input v-model="formData.units" placeholder="单位（如：°C, m/s）" />
          </el-form-item>
          
          <el-form-item label="危险值">
            <el-input-number
              v-model="formData.dangerValue"
              :precision="2"
              controls-position="right"
            />
          </el-form-item>
        </template>
        
        <!-- Terminal设置 -->
        <template v-if="isTerminalWidget">
          <el-form-item label="最大行数">
            <el-input-number
              v-model="formData.maxLines"
              :min="100"
              :max="5000"
              :step="100"
              controls-position="right"
            />
          </el-form-item>
          
          <el-form-item label="字体大小">
            <el-input-number
              v-model="formData.fontSize"
              :min="10"
              :max="24"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          
          <el-form-item label="自动滚动">
            <el-switch v-model="formData.autoScroll" />
          </el-form-item>
        </template>
      </el-card>

      <!-- 数据设置 -->
      <el-card class="settings-card" shadow="never">
        <template #header>
          <span class="card-title">数据设置</span>
        </template>
        
        <el-form-item label="更新频率">
          <el-select v-model="formData.updateRate" placeholder="选择更新频率">
            <el-option label="实时 (20Hz)" :value="20" />
            <el-option label="高速 (10Hz)" :value="10" />
            <el-option label="正常 (5Hz)" :value="5" />
            <el-option label="慢速 (1Hz)" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="数据保留">
          <el-select v-model="formData.dataRetention" placeholder="选择数据保留时间">
            <el-option label="1小时" value="1h" />
            <el-option label="6小时" value="6h" />
            <el-option label="12小时" value="12h" />
            <el-option label="24小时" value="24h" />
            <el-option label="永久" value="forever" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="数据过滤">
          <div class="filter-controls">
            <el-switch v-model="formData.enableFiltering" />
            <span class="filter-label">启用数据过滤</span>
          </div>
        </el-form-item>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="saving">
          应用设置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { WidgetType, WidgetConfig } from '../../../shared/types';

// Props定义
interface Props {
  modelValue: boolean;
  widgetType: WidgetType;
  config?: WidgetConfig;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({} as WidgetConfig)
});

// Emits定义  
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'settings-changed': [config: WidgetConfig];
}>();

// 响应式状态
const visible = ref(false);
const formRef = ref<FormInstance>();
const saving = ref(false);

// 表单数据
const formData = ref({
  title: '',
  size: { width: 400, height: 300 },
  position: { x: 0, y: 0 },
  colors: { primary: '#409eff' },
  showLegend: true,
  showGrid: true,
  showLabels: true,
  showAnimation: true,
  
  // Plot特定
  xAxis: { label: '时间', min: null, max: null },
  yAxis: { label: '数值', min: null, max: null },
  maxDataPoints: 1000,
  
  // Gauge特定
  minValue: 0,
  maxValue: 100,
  units: '',
  dangerValue: 80,
  
  // Terminal特定
  maxLines: 1000,
  fontSize: 14,
  autoScroll: true,
  
  // 通用数据设置
  updateRate: 10,
  dataRetention: '24h',
  enableFiltering: false
});

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入组件标题', trigger: 'blur' }
  ],
  'xAxis.label': [
    { required: true, message: '请输入X轴标签', trigger: 'blur' }
  ],
  'yAxis.label': [
    { required: true, message: '请输入Y轴标签', trigger: 'blur' }
  ],
  minValue: [
    { required: true, message: '请输入最小值', trigger: 'blur' }
  ],
  maxValue: [
    { required: true, message: '请输入最大值', trigger: 'blur' }
  ]
};

// 预定义颜色
const predefineColors = [
  '#409eff',
  '#67c23a', 
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
  '#6c5ce7'
];

// 计算属性
const widgetTypeName = computed(() => {
  const names: Record<WidgetType, string> = {
    [WidgetType.Plot]: '数据图表',
    [WidgetType.MultiPlot]: '多数据图表',
    [WidgetType.Gauge]: '仪表盘',
    [WidgetType.Bar]: '条形图',
    [WidgetType.Compass]: '指南针',
    [WidgetType.Accelerometer]: '加速度计',
    [WidgetType.Gyroscope]: '陀螺仪',
    [WidgetType.GPS]: 'GPS地图',
    [WidgetType.LED]: 'LED面板',
    [WidgetType.DataGrid]: '数据网格',
    [WidgetType.Terminal]: '终端',
    [WidgetType.FFT]: '频谱分析',
    [WidgetType.Plot3D]: '3D图表'
  };
  
  return names[props.widgetType] || '未知组件';
});

const hasSpecificSettings = computed(() => {
  return isPlotWidget.value || isGaugeWidget.value || isTerminalWidget.value;
});

const isPlotWidget = computed(() => {
  return [WidgetType.Plot, WidgetType.MultiPlot, WidgetType.FFT].includes(props.widgetType);
});

const isGaugeWidget = computed(() => {
  return props.widgetType === WidgetType.Gauge;
});

const isTerminalWidget = computed(() => {
  return props.widgetType === WidgetType.Terminal;
});

// 方法
const handleClose = () => {
  visible.value = false;
  emit('update:modelValue', false);
};

const handleReset = () => {
  loadConfigToForm();
};

const handleConfirm = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    saving.value = true;
    
    // 构建配置对象
    const config: WidgetConfig = {
      type: props.widgetType,
      title: formData.value.title,
      size: { ...formData.value.size },
      position: { ...formData.value.position },
      colors: [formData.value.colors.primary],
      showLegend: formData.value.showLegend,
      showGrid: formData.value.showGrid,
      showLabels: formData.value.showLabels,
      
      // 根据widget类型添加特定配置
      ...(isPlotWidget.value && {
        xAxis: { ...formData.value.xAxis },
        yAxis: { ...formData.value.yAxis },
        maxDataPoints: formData.value.maxDataPoints
      }),
      
      ...(isGaugeWidget.value && {
        minValue: formData.value.minValue,
        maxValue: formData.value.maxValue,
        units: formData.value.units,
        dangerValue: formData.value.dangerValue
      }),
      
      ...(isTerminalWidget.value && {
        maxLines: formData.value.maxLines,
        fontSize: formData.value.fontSize,
        autoScroll: formData.value.autoScroll
      })
    };
    
    // 延迟以显示保存状态
    await new Promise(resolve => setTimeout(resolve, 500));
    
    emit('settings-changed', config);
    handleClose();
    
  } catch (error) {
    console.error('保存设置时出错:', error);
  } finally {
    saving.value = false;
  }
};

const loadConfigToForm = () => {
  if (props.config) {
    Object.assign(formData.value, {
      title: props.config.title || '',
      size: props.config.size || { width: 400, height: 300 },
      position: props.config.position || { x: 0, y: 0 },
      colors: { primary: props.config.colors?.[0] || '#409eff' },
      showLegend: props.config.showLegend ?? true,
      showGrid: props.config.showGrid ?? true,
      showLabels: props.config.showLabels ?? true,
      
      // Plot特定配置
      xAxis: props.config.xAxis || { label: '时间', min: null, max: null },
      yAxis: props.config.yAxis || { label: '数值', min: null, max: null },
      maxDataPoints: props.config.maxDataPoints || 1000,
      
      // Gauge特定配置
      minValue: props.config.minValue || 0,
      maxValue: props.config.maxValue || 100,
      units: props.config.units || '',
      dangerValue: props.config.dangerValue || 80,
      
      // Terminal特定配置
      maxLines: props.config.maxLines || 1000,
      fontSize: props.config.fontSize || 14,
      autoScroll: props.config.autoScroll ?? true
    });
  }
};

// 监听器
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    nextTick(() => {
      loadConfigToForm();
    });
  }
});

watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false);
  }
});
</script>

<style scoped>
.settings-card {
  margin-bottom: 16px;
}

.settings-card:last-child {
  margin-bottom: 0;
}

.card-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.size-controls,
.position-controls,
.range-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-input,
.position-input,
.range-input {
  width: 120px;
}

.size-separator,
.position-separator,
.range-separator {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.size-unit {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.color-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.display-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .display-options {
    grid-template-columns: 1fr;
  }
  
  .size-controls,
  .position-controls,
  .range-controls {
    flex-wrap: wrap;
  }
  
  .size-input,
  .position-input,
  .range-input {
    width: 100px;
  }
}
</style>
<!--
  Custom Theme Editor Component
  自定义主题编辑器组件
  
  提供可视化的主题颜色编辑功能
-->

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? t('theme.editCustomTheme') : t('theme.createCustomTheme')"
    width="800px"
    :before-close="handleClose"
    destroy-on-close
    class="custom-theme-editor"
  >
    <div class="theme-editor-content">
      <!-- 基本信息 -->
      <el-card class="basic-info-card" shadow="never">
        <template #header>
          <span>{{ t('theme.basicInfo') }}</span>
        </template>
        
        <el-form :model="themeForm" label-width="120px" size="default">
          <el-form-item :label="t('theme.themeName')" required>
            <el-input 
              v-model="themeForm.title"
              :placeholder="t('theme.themeNamePlaceholder')"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item :label="t('theme.baseTheme')">
            <el-select v-model="baseTheme" @change="onBaseThemeChange">
              <el-option
                v-for="theme in builtinThemes"
                :key="theme.title"
                :label="theme.title"
                :value="theme.title"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 颜色配置 -->
      <el-card class="colors-config-card" shadow="never">
        <template #header>
          <span>{{ t('theme.colorConfiguration') }}</span>
        </template>
        
        <el-tabs v-model="activeColorTab" type="border-card">
          <!-- 基础颜色 -->
          <el-tab-pane :label="t('theme.basicColors')" name="basic">
            <div class="color-grid">
              <div
                v-for="colorKey in basicColorKeys"
                :key="colorKey"
                class="color-item"
              >
                <label class="color-label">{{ getColorLabel(colorKey) }}</label>
                <div class="color-input-group">
                  <el-color-picker
                    v-model="themeForm.colors[colorKey]"
                    :predefine="predefineColors"
                    show-alpha
                    @change="onColorChange(colorKey, $event)"
                  />
                  <el-input
                    v-model="themeForm.colors[colorKey]"
                    size="small"
                    style="width: 100px; margin-left: 8px;"
                    @input="validateColor(colorKey, $event)"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 界面颜色 -->
          <el-tab-pane :label="t('theme.interfaceColors')" name="interface">
            <div class="color-grid">
              <div
                v-for="colorKey in interfaceColorKeys"
                :key="colorKey"
                class="color-item"
              >
                <label class="color-label">{{ getColorLabel(colorKey) }}</label>
                <div class="color-input-group">
                  <el-color-picker
                    v-model="themeForm.colors[colorKey]"
                    :predefine="predefineColors"
                    show-alpha
                    @change="onColorChange(colorKey, $event)"
                  />
                  <el-input
                    v-model="themeForm.colors[colorKey]"
                    size="small"
                    style="width: 100px; margin-left: 8px;"
                    @input="validateColor(colorKey, $event)"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 图表颜色 -->
          <el-tab-pane :label="t('theme.chartColors')" name="chart">
            <div class="widget-colors-section">
              <div class="widget-colors-header">
                <span>{{ t('theme.widgetColors') }}</span>
                <el-button size="small" @click="addWidgetColor">
                  <i class="el-icon-plus"></i>
                  {{ t('common.add') }}
                </el-button>
              </div>
              
              <div class="widget-colors-list">
                <div
                  v-for="(color, index) in themeForm.colors.widget_colors"
                  :key="index"
                  class="widget-color-item"
                >
                  <span class="color-index">#{{ index + 1 }}</span>
                  <el-color-picker
                    v-model="themeForm.colors.widget_colors[index]"
                    :predefine="predefineColors"
                    @change="onWidgetColorChange(index, $event)"
                  />
                  <el-input
                    v-model="themeForm.colors.widget_colors[index]"
                    size="small"
                    style="width: 100px; margin: 0 8px;"
                  />
                  <el-button
                    size="small"
                    type="danger"
                    @click="removeWidgetColor(index)"
                    :disabled="themeForm.colors.widget_colors.length <= 1"
                  >
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 3D绘图颜色 -->
          <el-tab-pane :label="t('theme.plot3dColors')" name="plot3d">
            <div class="color-grid">
              <div
                v-for="colorKey in plot3dColorKeys"
                :key="colorKey"
                class="color-item"
              >
                <label class="color-label">{{ getColorLabel(colorKey) }}</label>
                <div class="color-input-group">
                  <el-color-picker
                    v-model="themeForm.colors[colorKey]"
                    :predefine="predefineColors"
                    show-alpha
                    @change="onColorChange(colorKey, $event)"
                  />
                  <el-input
                    v-model="themeForm.colors[colorKey]"
                    size="small"
                    style="width: 100px; margin-left: 8px;"
                    @input="validateColor(colorKey, $event)"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 预览 -->
      <el-card class="preview-card" shadow="never">
        <template #header>
          <span>{{ t('theme.preview') }}</span>
        </template>
        
        <div class="theme-preview-area">
          <div class="preview-sample" :style="getPreviewStyle()">
            <div class="sample-toolbar">
              <span class="sample-title">{{ themeForm.title || t('theme.sampleTitle') }}</span>
              <div class="sample-actions">
                <div class="sample-button">{{ t('common.connect') }}</div>
                <div class="sample-button primary">{{ t('common.save') }}</div>
              </div>
            </div>
            
            <div class="sample-content">
              <div class="sample-sidebar">
                <div class="sample-menu-item active">{{ t('dashboard.title') }}</div>
                <div class="sample-menu-item">{{ t('console.title') }}</div>
                <div class="sample-menu-item">{{ t('settings.title') }}</div>
              </div>
              
              <div class="sample-main">
                <div class="sample-widget">
                  <div class="widget-header">{{ t('dashboard.widget.plot') }}</div>
                  <div class="widget-chart">
                    <div
                      v-for="(color, index) in themeForm.colors.widget_colors.slice(0, 3)"
                      :key="index"
                      class="chart-line"
                      :style="{ backgroundColor: color }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
        <el-button @click="resetColors">{{ t('common.reset') }}</el-button>
        <el-button 
          type="primary"
          @click="saveTheme"
          :disabled="!isValidTheme"
        >
          {{ t('common.save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '../../composables/useI18n'
import { ThemeManager } from '../../utils/ThemeManager'
import { BUILTIN_THEMES } from '../../themes/builtin-themes'
import type { ThemeDef, SerialStudioColors } from '../../types/ThemeDef'

// Props和Events定义
interface CustomThemeEditorProps {
  modelValue: boolean
  theme?: ThemeDef | null
}

interface CustomThemeEditorEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', theme: ThemeDef): void
}

const props = defineProps<CustomThemeEditorProps>()
const emit = defineEmits<CustomThemeEditorEmits>()

// 组合式API
const { t } = useI18n()

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const themeForm = ref<ThemeDef>({
  title: '',
  parameters: {},
  translations: {},
  colors: {} as SerialStudioColors
})

const baseTheme = ref('Default')
const activeColorTab = ref('basic')

// 主题管理器实例
const themeManager = ThemeManager.getInstance()

// 计算属性
const isEditing = computed(() => !!props.theme)
const builtinThemes = computed(() => BUILTIN_THEMES)

const isValidTheme = computed(() => {
  return themeForm.value.title.trim().length > 0 &&
         Object.keys(themeForm.value.colors).length > 0
})

// 颜色分类
const basicColorKeys = [
  'text', 'base', 'window', 'accent', 'error', 'alarm',
  'button', 'button_text', 'highlight', 'highlighted_text'
]

const interfaceColorKeys = [
  'toolbar_top', 'toolbar_bottom', 'toolbar_text', 'toolbar_border',
  'console_base', 'console_text', 'console_border',
  'widget_base', 'widget_text', 'widget_border', 'widget_window'
]

const plot3dColorKeys = [
  'plot3d_x_axis', 'plot3d_y_axis', 'plot3d_z_axis', 'plot3d_axis_text',
  'plot3d_grid_major', 'plot3d_grid_minor', 'plot3d_background_inner', 'plot3d_background_outer'
]

// 预定义颜色
const predefineColors = [
  '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1',
  '#1e90ff', '#c71585', '#ff69b4', '#ba55d3', '#9370db',
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'
]

// 方法
const getColorLabel = (colorKey: string): string => {
  // 将颜色键转换为可读标签
  const labelMap: Record<string, string> = {
    // 基础颜色
    text: t('theme.colors.text'),
    base: t('theme.colors.base'),
    window: t('theme.colors.window'),
    accent: t('theme.colors.accent'),
    error: t('theme.colors.error'),
    alarm: t('theme.colors.alarm'),
    button: t('theme.colors.button'),
    button_text: t('theme.colors.buttonText'),
    highlight: t('theme.colors.highlight'),
    highlighted_text: t('theme.colors.highlightedText'),
    
    // 界面颜色
    toolbar_top: t('theme.colors.toolbarTop'),
    toolbar_bottom: t('theme.colors.toolbarBottom'),
    toolbar_text: t('theme.colors.toolbarText'),
    toolbar_border: t('theme.colors.toolbarBorder'),
    console_base: t('theme.colors.consoleBase'),
    console_text: t('theme.colors.consoleText'),
    console_border: t('theme.colors.consoleBorder'),
    widget_base: t('theme.colors.widgetBase'),
    widget_text: t('theme.colors.widgetText'),
    widget_border: t('theme.colors.widgetBorder'),
    widget_window: t('theme.colors.widgetWindow'),
    
    // 3D绘图颜色
    plot3d_x_axis: t('theme.colors.plot3dXAxis'),
    plot3d_y_axis: t('theme.colors.plot3dYAxis'),
    plot3d_z_axis: t('theme.colors.plot3dZAxis'),
    plot3d_axis_text: t('theme.colors.plot3dAxisText'),
    plot3d_grid_major: t('theme.colors.plot3dGridMajor'),
    plot3d_grid_minor: t('theme.colors.plot3dGridMinor'),
    plot3d_background_inner: t('theme.colors.plot3dBackgroundInner'),
    plot3d_background_outer: t('theme.colors.plot3dBackgroundOuter')
  }
  
  return labelMap[colorKey] || colorKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const onColorChange = (colorKey: string, color: string | null) => {
  if (color) {
    themeForm.value.colors[colorKey] = color
  }
}

const onWidgetColorChange = (index: number, color: string | null) => {
  if (color && themeForm.value.colors.widget_colors) {
    themeForm.value.colors.widget_colors[index] = color
  }
}

const validateColor = (colorKey: string, value: string) => {
  // 验证颜色格式
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (colorRegex.test(value)) {
    themeForm.value.colors[colorKey] = value
  }
}

const addWidgetColor = () => {
  if (!themeForm.value.colors.widget_colors) {
    themeForm.value.colors.widget_colors = []
  }
  themeForm.value.colors.widget_colors.push('#007aff')
}

const removeWidgetColor = (index: number) => {
  if (themeForm.value.colors.widget_colors && themeForm.value.colors.widget_colors.length > 1) {
    themeForm.value.colors.widget_colors.splice(index, 1)
  }
}

const onBaseThemeChange = (themeName: string) => {
  const baseThemeData = builtinThemes.value.find(theme => theme.title === themeName)
  if (baseThemeData) {
    // 保留用户已修改的标题
    const title = themeForm.value.title
    themeForm.value = {
      ...baseThemeData,
      title: title || `${baseThemeData.title} Custom`,
      colors: { ...baseThemeData.colors }
    }
  }
}

const getPreviewStyle = () => {
  const colors = themeForm.value.colors
  return {
    '--preview-bg': colors.base || '#ffffff',
    '--preview-text': colors.text || '#000000',
    '--preview-accent': colors.accent || '#007aff',
    '--preview-button': colors.button || '#f0f0f0',
    '--preview-button-text': colors.button_text || '#000000',
    '--preview-toolbar': colors.toolbar_top || '#f0f0f0',
    '--preview-toolbar-text': colors.toolbar_text || '#000000',
    '--preview-border': colors.widget_border || '#cccccc'
  }
}

const resetColors = () => {
  if (baseTheme.value) {
    onBaseThemeChange(baseTheme.value)
  }
}

const saveTheme = () => {
  if (!isValidTheme.value) {
    ElMessage.error(t('theme.invalidThemeData'))
    return
  }

  // 确保必要字段存在
  if (!themeForm.value.colors.widget_colors || themeForm.value.colors.widget_colors.length === 0) {
    themeForm.value.colors.widget_colors = ['#007aff', '#ff9500', '#34c759', '#ff3b30']
  }

  emit('save', { ...themeForm.value })
}

const handleClose = () => {
  dialogVisible.value = false
}

const initializeTheme = () => {
  if (props.theme) {
    // 编辑模式
    themeForm.value = { ...props.theme }
  } else {
    // 创建新主题
    const defaultTheme = builtinThemes.value[0]
    themeForm.value = {
      title: '',
      parameters: { ...defaultTheme.parameters },
      translations: {},
      colors: { ...defaultTheme.colors }
    }
  }
}

// 生命周期
onMounted(() => {
  initializeTheme()
})

// 监听props变化
watch(() => props.theme, () => {
  if (dialogVisible.value) {
    initializeTheme()
  }
})

watch(dialogVisible, (visible) => {
  if (visible) {
    initializeTheme()
  }
})
</script>

<style scoped>
.custom-theme-editor {
  --dialog-padding: 24px;
}

.theme-editor-content {
  max-height: 70vh;
  overflow-y: auto;
}

.basic-info-card,
.colors-config-card,
.preview-card {
  margin-bottom: 20px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.color-input-group {
  display: flex;
  align-items: center;
}

.widget-colors-section {
  padding: 16px 0;
}

.widget-colors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
}

.widget-colors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.widget-color-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.color-index {
  font-weight: 500;
  min-width: 30px;
  color: var(--el-text-color-secondary);
}

.theme-preview-area {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.preview-sample {
  border: 1px solid var(--preview-border, #cccccc);
  border-radius: 8px;
  overflow: hidden;
  background: var(--preview-bg, #ffffff);
  color: var(--preview-text, #000000);
  font-size: 14px;
}

.sample-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--preview-toolbar, #f0f0f0);
  color: var(--preview-toolbar-text, #000000);
  border-bottom: 1px solid var(--preview-border, #cccccc);
}

.sample-title {
  font-weight: 600;
}

.sample-actions {
  display: flex;
  gap: 8px;
}

.sample-button {
  padding: 6px 12px;
  border-radius: 4px;
  background: var(--preview-button, #f0f0f0);
  color: var(--preview-button-text, #000000);
  font-size: 12px;
  border: 1px solid var(--preview-border, #cccccc);
}

.sample-button.primary {
  background: var(--preview-accent, #007aff);
  color: white;
  border-color: var(--preview-accent, #007aff);
}

.sample-content {
  display: flex;
  height: 200px;
}

.sample-sidebar {
  width: 150px;
  background: var(--preview-bg, #ffffff);
  border-right: 1px solid var(--preview-border, #cccccc);
  padding: 16px 0;
}

.sample-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.sample-menu-item.active {
  background: var(--preview-accent, #007aff);
  color: white;
}

.sample-main {
  flex: 1;
  padding: 16px;
}

.sample-widget {
  border: 1px solid var(--preview-border, #cccccc);
  border-radius: 6px;
  height: 120px;
}

.widget-header {
  padding: 8px 12px;
  background: var(--preview-button, #f0f0f0);
  font-size: 12px;
  font-weight: 500;
  border-bottom: 1px solid var(--preview-border, #cccccc);
}

.widget-chart {
  padding: 16px;
  display: flex;
  gap: 4px;
  height: 60px;
  align-items: flex-end;
}

.chart-line {
  flex: 1;
  border-radius: 2px;
  opacity: 0.8;
}

.chart-line:nth-child(1) { height: 40%; }
.chart-line:nth-child(2) { height: 70%; }
.chart-line:nth-child(3) { height: 55%; }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-theme-editor {
    width: 95% !important;
  }
  
  .color-grid {
    grid-template-columns: 1fr;
  }
  
  .sample-content {
    flex-direction: column;
    height: auto;
  }
  
  .sample-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--preview-border, #cccccc);
  }
}

/* 动画效果 */
.color-item {
  animation: fadeInUp 0.3s ease;
}

.widget-color-item {
  animation: slideInLeft 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
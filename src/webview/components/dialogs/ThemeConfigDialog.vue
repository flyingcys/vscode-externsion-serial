<!--
  Theme Configuration Dialog Component
  主题配置对话框组件
  
  基于Serial-Studio主题系统，提供完整的主题配置功能
-->

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('theme.themeSettings')"
    width="700px"
    :before-close="handleClose"
    destroy-on-close
    class="theme-config-dialog"
  >
    <div class="theme-config-content">
      <!-- 主题类型选择 -->
      <div class="theme-type-section">
        <h4>{{ t('theme.title') }}</h4>
        <el-radio-group 
          v-model="selectedThemeType" 
          @change="onThemeTypeChange"
          class="theme-type-group"
        >
          <el-radio-button label="auto">
            <i class="el-icon-magic-stick"></i>
            {{ t('theme.auto') }}
          </el-radio-button>
          <el-radio-button label="light">
            <i class="el-icon-sunny"></i>
            {{ t('theme.light') }}
          </el-radio-button>
          <el-radio-button label="dark">
            <i class="el-icon-moon"></i>
            {{ t('theme.dark') }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <el-divider />

      <!-- 内置主题选择 -->
      <div class="builtin-themes-section">
        <h4>{{ t('theme.builtinThemes') }}</h4>
        <div class="themes-grid">
          <div
            v-for="theme in builtinThemes"
            :key="theme.title"
            class="theme-card"
            :class="{
              'selected': selectedTheme === theme.title,
              'current': currentTheme?.title === theme.title
            }"
            @click="selectTheme(theme.title)"
          >
            <div class="theme-preview">
              <div class="preview-colors">
                <div 
                  v-for="(color, index) in getPreviewColors(theme)"
                  :key="index"
                  class="color-dot"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
            <div class="theme-info">
              <div class="theme-name">{{ getThemeDisplayName(theme) }}</div>
              <div class="theme-type">{{ getThemeType(theme) }}</div>
            </div>
            <div v-if="currentTheme?.title === theme.title" class="current-indicator">
              <el-tag type="success" size="small">{{ t('common.current') }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <!-- 自定义主题 -->
      <div class="custom-themes-section">
        <div class="section-header">
          <h4>{{ t('theme.customThemes') }}</h4>
          <el-button 
            type="primary" 
            size="small"
            @click="showCustomThemeDialog = true"
          >
            <i class="el-icon-plus"></i>
            {{ t('theme.createCustom') }}
          </el-button>
        </div>
        
        <div v-if="customThemes.length === 0" class="no-custom-themes">
          <el-empty :description="t('theme.noCustomThemes')" />
        </div>
        
        <div v-else class="themes-grid">
          <div
            v-for="theme in customThemes"
            :key="theme.title"
            class="theme-card custom-theme"
            :class="{
              'selected': selectedTheme === theme.title,
              'current': currentTheme?.title === theme.title
            }"
            @click="selectTheme(theme.title)"
          >
            <div class="theme-preview">
              <div class="preview-colors">
                <div 
                  v-for="(color, index) in getPreviewColors(theme)"
                  :key="index"
                  class="color-dot"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
            <div class="theme-info">
              <div class="theme-name">{{ theme.title }}</div>
              <div class="theme-type">{{ t('theme.custom') }}</div>
            </div>
            <div class="theme-actions">
              <el-button-group size="small">
                <el-button @click.stop="editCustomTheme(theme)">
                  <i class="el-icon-edit"></i>
                </el-button>
                <el-button @click.stop="exportTheme(theme.title)">
                  <i class="el-icon-download"></i>
                </el-button>
                <el-button 
                  type="danger"
                  @click.stop="deleteCustomTheme(theme.title)"
                >
                  <i class="el-icon-delete"></i>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <!-- 主题选项 -->
      <div class="theme-options-section">
        <h4>{{ t('theme.options') }}</h4>
        <el-form label-width="150px" size="default">
          <el-form-item :label="t('theme.followSystem')">
            <el-switch
              v-model="followSystemTheme"
              @change="onFollowSystemChange"
            />
            <div class="option-description">
              {{ t('theme.followSystemDescription') }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t('theme.animations')">
            <el-switch
              v-model="enableAnimations"
              @change="onAnimationsChange"
            />
            <div class="option-description">
              {{ t('theme.animationsDescription') }}
            </div>
          </el-form-item>

          <el-form-item :label="t('theme.highContrast')">
            <el-switch
              v-model="highContrastMode"
              @change="onHighContrastChange"
            />
            <div class="option-description">
              {{ t('theme.highContrastDescription') }}
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 导入主题 -->
      <el-divider />
      
      <div class="import-export-section">
        <h4>{{ t('theme.importExport') }}</h4>
        <div class="import-export-actions">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".json"
            @change="handleThemeImport"
          >
            <el-button>
              <i class="el-icon-upload2"></i>
              {{ t('theme.importTheme') }}
            </el-button>
          </el-upload>
          
          <el-button @click="exportAllThemes">
            <i class="el-icon-download"></i>
            {{ t('theme.exportAll') }}
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
        <el-button 
          type="primary"
          @click="applyChanges"
          :disabled="!hasChanges"
        >
          {{ t('common.apply') }}
        </el-button>
        <el-button 
          type="info"
          @click="resetToDefault"
        >
          {{ t('common.reset') }}
        </el-button>
      </div>
    </template>

    <!-- 自定义主题编辑器对话框 -->
    <CustomThemeEditor
      v-model="showCustomThemeDialog"
      :theme="editingTheme"
      @save="onCustomThemeSave"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { useI18n } from '../../composables/useI18n'
import { ThemeManager } from '../../utils/ThemeManager'
import CustomThemeEditor from './CustomThemeEditor.vue'
import type { ThemeDef, ThemeType } from '../../types/ThemeDef'

// Props和Events定义
interface ThemeConfigProps {
  modelValue: boolean
}

interface ThemeConfigEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'theme-changed', theme: ThemeDef): void
}

const props = defineProps<ThemeConfigProps>()
const emit = defineEmits<ThemeConfigEmits>()

// 组合式API
const { t } = useI18n()

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const selectedThemeType = ref<ThemeType>('auto')
const selectedTheme = ref<string>('')
const followSystemTheme = ref(true)
const enableAnimations = ref(true)
const highContrastMode = ref(false)
const showCustomThemeDialog = ref(false)
const editingTheme = ref<ThemeDef | null>(null)

// 主题管理器实例
const themeManager = ThemeManager.getInstance()

// 计算属性
const currentTheme = computed(() => themeManager.getCurrentTheme())
const currentThemeType = computed(() => themeManager.getCurrentThemeType())

const builtinThemes = computed(() => {
  return themeManager.getAvailableThemes().filter(theme => 
    !themeManager['customThemes'].includes(theme)
  )
})

const customThemes = computed(() => {
  return themeManager['customThemes'] || []
})

const hasChanges = computed(() => {
  return selectedTheme.value !== (currentTheme.value?.title || '') ||
         selectedThemeType.value !== currentThemeType.value
})

// 方法
const getThemeDisplayName = (theme: ThemeDef): string => {
  const currentLocale = 'zh_CN' // 从 i18n 获取当前语言
  return theme.translations?.[currentLocale] || theme.title
}

const getThemeType = (theme: ThemeDef): string => {
  // 根据主题颜色判断类型
  const bgColor = theme.colors.base || theme.colors.window || '#ffffff'
  const rgb = hexToRgb(bgColor)
  if (rgb) {
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    const type = brightness > 128 ? 'light' : 'dark'
    return t(`theme.${type}`)
  }
  return t('theme.unknown')
}

const getPreviewColors = (theme: ThemeDef): string[] => {
  return [
    theme.colors.base || '#ffffff',
    theme.colors.accent || '#007aff',
    theme.colors.text || '#000000',
    theme.colors.error || '#ff3b30',
    theme.colors.widget_colors?.[0] || '#007aff',
    theme.colors.widget_colors?.[1] || '#ff9500'
  ]
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const selectTheme = (themeTitle: string) => {
  selectedTheme.value = themeTitle
}

const onThemeTypeChange = (type: ThemeType) => {
  selectedThemeType.value = type
}

const onFollowSystemChange = (value: boolean) => {
  if (value) {
    selectedThemeType.value = 'auto'
  }
}

const onAnimationsChange = (value: boolean) => {
  // 应用动画设置
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(
      '--theme-transition-duration', 
      value ? '0.3s' : '0s'
    )
  }
}

const onHighContrastChange = (value: boolean) => {
  // 应用高对比度设置
  if (typeof document !== 'undefined') {
    if (value) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }
}

const editCustomTheme = (theme: ThemeDef) => {
  editingTheme.value = { ...theme }
  showCustomThemeDialog.value = true
}

const deleteCustomTheme = async (themeTitle: string) => {
  try {
    await ElMessageBox.confirm(
      t('theme.deleteConfirm', { name: themeTitle }),
      t('common.warning'),
      {
        type: 'warning',
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel')
      }
    )
    
    await themeManager.removeCustomTheme(themeTitle)
    ElMessage.success(t('theme.themeDeleted'))
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete theme:', error)
      ElMessage.error(t('error.generic'))
    }
  }
}

const exportTheme = (themeTitle: string) => {
  try {
    const themeJson = themeManager.exportTheme(themeTitle)
    const blob = new Blob([themeJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${themeTitle.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success(t('theme.themeExported'))
  } catch (error) {
    console.error('Failed to export theme:', error)
    ElMessage.error(t('error.generic'))
  }
}

const exportAllThemes = () => {
  try {
    const allThemes = {
      builtin: builtinThemes.value,
      custom: customThemes.value,
      settings: {
        selectedTheme: selectedTheme.value,
        selectedThemeType: selectedThemeType.value,
        enableAnimations: enableAnimations.value,
        highContrastMode: highContrastMode.value
      }
    }
    
    const json = JSON.stringify(allThemes, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'serial-studio-themes.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success(t('theme.allThemesExported'))
  } catch (error) {
    console.error('Failed to export all themes:', error)
    ElMessage.error(t('error.generic'))
  }
}

const handleThemeImport = async (file: UploadFile) => {
  try {
    const text = await file.raw?.text()
    if (text) {
      await themeManager.importTheme(text)
      ElMessage.success(t('theme.themeImported'))
    }
  } catch (error) {
    console.error('Failed to import theme:', error)
    ElMessage.error(t('theme.invalidTheme'))
  }
}

const onCustomThemeSave = async (theme: ThemeDef) => {
  try {
    await themeManager.addCustomTheme(theme)
    showCustomThemeDialog.value = false
    editingTheme.value = null
    ElMessage.success(t('theme.customThemeSaved'))
  } catch (error) {
    console.error('Failed to save custom theme:', error)
    ElMessage.error(t('error.generic'))
  }
}

const applyChanges = async () => {
  try {
    // 应用主题类型更改
    if (selectedThemeType.value !== currentThemeType.value) {
      await themeManager.setThemeType(selectedThemeType.value)
    }
    
    // 应用主题更改
    if (selectedTheme.value && selectedTheme.value !== (currentTheme.value?.title || '')) {
      await themeManager.setTheme(selectedTheme.value)
    }
    
    emit('theme-changed', themeManager.getCurrentTheme()!)
    ElMessage.success(t('theme.settingsApplied'))
    handleClose()
  } catch (error) {
    console.error('Failed to apply theme changes:', error)
    ElMessage.error(t('error.generic'))
  }
}

const resetToDefault = async () => {
  try {
    await themeManager.reset()
    loadCurrentSettings()
    ElMessage.success(t('theme.settingsReset'))
  } catch (error) {
    console.error('Failed to reset theme settings:', error)
    ElMessage.error(t('error.generic'))
  }
}

const handleClose = () => {
  // 重置设置
  loadCurrentSettings()
  dialogVisible.value = false
}

const loadCurrentSettings = () => {
  selectedThemeType.value = currentThemeType.value
  selectedTheme.value = currentTheme.value?.title || ''
  
  // 从localStorage加载其他设置
  if (typeof window !== 'undefined' && window.localStorage) {
    followSystemTheme.value = selectedThemeType.value === 'auto'
    enableAnimations.value = localStorage.getItem('serial-studio-theme-animations') !== 'false'
    highContrastMode.value = localStorage.getItem('serial-studio-high-contrast') === 'true'
  }
}

// 生命周期
onMounted(() => {
  loadCurrentSettings()
})

// 监听对话框打开状态
watch(dialogVisible, (visible) => {
  if (visible) {
    loadCurrentSettings()
  }
})

// 保存设置到localStorage
watch([enableAnimations, highContrastMode], ([animations, highContrast]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('serial-studio-theme-animations', String(animations))
    localStorage.setItem('serial-studio-high-contrast', String(highContrast))
  }
})
</script>

<style scoped>
.theme-config-dialog {
  --dialog-padding: 24px;
}

.theme-config-content {
  max-height: 70vh;
  overflow-y: auto;
}

.theme-type-section,
.builtin-themes-section,
.custom-themes-section,
.theme-options-section,
.import-export-section {
  margin-bottom: 20px;
}

.theme-type-section h4,
.builtin-themes-section h4,
.custom-themes-section h4,
.theme-options-section h4,
.import-export-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.theme-type-group {
  display: flex;
  gap: 12px;
}

.theme-type-group :deep(.el-radio-button__inner) {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.theme-card {
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: var(--el-bg-color);
}

.theme-card:hover {
  border-color: var(--el-color-primary-light-3);
  box-shadow: 0 4px 12px var(--el-box-shadow-light);
  transform: translateY(-2px);
}

.theme-card.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.theme-card.current::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--el-color-success);
  border-radius: 50%;
  border: 2px solid var(--el-bg-color);
}

.theme-preview {
  margin-bottom: 12px;
}

.preview-colors {
  display: flex;
  gap: 4px;
  height: 24px;
}

.color-dot {
  flex: 1;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.theme-info {
  text-align: center;
}

.theme-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.theme-type {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.current-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}

.theme-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.custom-theme {
  border-color: var(--el-color-warning-light-5);
}

.custom-theme:hover {
  border-color: var(--el-color-warning);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.no-custom-themes {
  text-align: center;
  padding: 40px;
}

.option-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.import-export-actions {
  display: flex;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 高对比度模式 */
:global(.high-contrast) .theme-card {
  border-width: 3px;
}

:global(.high-contrast) .theme-card.selected {
  border-width: 4px;
}

/* 主题切换动画 */
.theme-card {
  animation: var(--theme-transition-duration, 0.3s) ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-config-dialog {
    width: 95% !important;
  }
  
  .themes-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-type-group {
    flex-direction: column;
  }
  
  .import-export-actions {
    flex-direction: column;
  }
}

/* 动画效果 */
.theme-card {
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
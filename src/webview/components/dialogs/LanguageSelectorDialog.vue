<!--
  Language Selector Dialog Component
  语言选择器对话框组件
  
  基于Serial-Studio国际化系统，提供完整的语言切换功能
-->

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('language.title')"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
    class="language-selector-dialog"
  >
    <div class="language-selector-content">
      <!-- 当前语言显示 -->
      <div class="current-language-section">
        <h4>{{ t('language.current') }}</h4>
        <div class="current-language-display">
          <el-tag type="primary" size="large">
            <i :class="getCurrentLanguageFlag()" class="language-flag"></i>
            {{ getCurrentLanguageInfo().nativeName }}
            <span class="language-code">({{ getCurrentLanguageInfo().code }})</span>
          </el-tag>
        </div>
      </div>

      <el-divider />

      <!-- 可用语言列表 -->
      <div class="available-languages-section">
        <h4>{{ t('language.available') }}</h4>
        <div class="language-list">
          <div
            v-for="language in availableLanguages"
            :key="language.code"
            class="language-item"
            :class="{
              'current': language.code === currentLocale,
              'rtl': language.rtl
            }"
            @click="selectLanguage(language.code)"
          >
            <div class="language-info">
              <i :class="getLanguageFlag(language.code)" class="language-flag"></i>
              <div class="language-names">
                <div class="native-name">{{ language.nativeName }}</div>
                <div class="english-name">{{ language.englishName }}</div>
              </div>
            </div>
            <div class="language-meta">
              <el-tag v-if="language.rtl" size="small" type="info">RTL</el-tag>
              <el-tag v-if="language.code === currentLocale" size="small" type="success">
                {{ t('language.current') }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 语言设置选项 -->
      <el-divider />
      
      <div class="language-options-section">
        <h4>{{ t('settings.title') }}</h4>
        <el-form label-width="120px" size="default">
          <el-form-item :label="t('language.autoDetect')">
            <el-switch
              v-model="autoDetectLanguage"
              @change="onAutoDetectChange"
            />
            <div class="option-description">
              {{ t('language.autoDetectDescription') }}
            </div>
          </el-form-item>
          
          <el-form-item :label="t('settings.dateFormat')">
            <el-select v-model="dateFormat" @change="onDateFormatChange">
              <el-option value="short" :label="formatDateExample('short')" />
              <el-option value="medium" :label="formatDateExample('medium')" />
              <el-option value="long" :label="formatDateExample('long')" />
            </el-select>
          </el-form-item>
          
          <el-form-item :label="t('settings.numberFormat')">
            <el-select v-model="numberFormat" @change="onNumberFormatChange">
              <el-option value="decimal" :label="formatNumberExample('decimal')" />
              <el-option value="currency" :label="formatNumberExample('currency')" />
              <el-option value="percent" :label="formatNumberExample('percent')" />
            </el-select>
          </el-form-item>
        </el-form>
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
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '../../composables/useI18n'
import { I18nManager } from '../../i18n/I18nManager'
import type { SupportedLocales, LanguageInfo } from '../../types/I18nDef'

// Props和Events定义
interface LanguageSelectorProps {
  modelValue: boolean
}

interface LanguageSelectorEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'language-changed', locale: SupportedLocales): void
}

const props = defineProps<LanguageSelectorProps>()
const emit = defineEmits<LanguageSelectorEmits>()

// 组合式API
const { t, locale: currentLocale } = useI18n()

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const selectedLanguage = ref<SupportedLocales>(currentLocale.value)
const autoDetectLanguage = ref(false)
const dateFormat = ref<'short' | 'medium' | 'long'>('medium')
const numberFormat = ref<'decimal' | 'currency' | 'percent'>('decimal')

// I18n管理器实例
const i18nManager = I18nManager.getInstance()

// 计算属性
const availableLanguages = computed(() => {
  return i18nManager.getAvailableLanguages().sort((a, b) => {
    // 当前语言排在最前面
    if (a.code === currentLocale.value) return -1
    if (b.code === currentLocale.value) return 1
    // 其他按英文名称排序
    return a.englishName.localeCompare(b.englishName)
  })
})

const hasChanges = computed(() => {
  return selectedLanguage.value !== currentLocale.value
})

// 方法
const getCurrentLanguageInfo = (): LanguageInfo => {
  return i18nManager.getCurrentLanguageInfo()
}

const getCurrentLanguageFlag = (): string => {
  return getLanguageFlag(currentLocale.value)
}

const getLanguageFlag = (locale: SupportedLocales): string => {
  const flagMap: Record<SupportedLocales, string> = {
    'en_US': 'flag-icon flag-icon-us',
    'zh_CN': 'flag-icon flag-icon-cn',
    'es_MX': 'flag-icon flag-icon-mx',
    'de_DE': 'flag-icon flag-icon-de',
    'fr_FR': 'flag-icon flag-icon-fr',
    'it_IT': 'flag-icon flag-icon-it',
    'ja_JP': 'flag-icon flag-icon-jp',
    'ko_KR': 'flag-icon flag-icon-kr',
    'pl_PL': 'flag-icon flag-icon-pl',
    'pt_BR': 'flag-icon flag-icon-br',
    'ru_RU': 'flag-icon flag-icon-ru',
    'tr_TR': 'flag-icon flag-icon-tr',
    'cs_CZ': 'flag-icon flag-icon-cz',
    'uk_UA': 'flag-icon flag-icon-ua'
  }
  return flagMap[locale] || 'flag-icon flag-icon-unknown'
}

const selectLanguage = (locale: SupportedLocales) => {
  selectedLanguage.value = locale
}

const formatDateExample = (format: 'short' | 'medium' | 'long'): string => {
  const now = new Date()
  return i18nManager.formatDate(now, format)
}

const formatNumberExample = (format: 'decimal' | 'currency' | 'percent'): string => {
  const number = format === 'percent' ? 0.1234 : 1234.56
  return i18nManager.formatNumber(number, format)
}

const onAutoDetectChange = (value: boolean) => {
  // 实现自动检测语言功能
  if (value) {
    const detectedLocale = i18nManager['detector'].detectFromBrowser()
    if (detectedLocale !== currentLocale.value) {
      selectedLanguage.value = detectedLocale
      ElMessage.info(t('language.autoDetected', { language: detectedLocale }))
    }
  }
}

const onDateFormatChange = (format: 'short' | 'medium' | 'long') => {
  // 保存日期格式偏好
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('serial-studio-date-format', format)
  }
}

const onNumberFormatChange = (format: 'decimal' | 'currency' | 'percent') => {
  // 保存数字格式偏好
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('serial-studio-number-format', format)
  }
}

const applyChanges = async () => {
  if (selectedLanguage.value !== currentLocale.value) {
    try {
      await i18nManager.setLocale(selectedLanguage.value)
      emit('language-changed', selectedLanguage.value)
      ElMessage.success(t('language.languageChanged', { 
        language: i18nManager.getCurrentLanguageInfo().nativeName 
      }))
      handleClose()
    } catch (error) {
      console.error('Failed to change language:', error)
      ElMessage.error(t('error.generic'))
    }
  }
}

const resetToDefault = () => {
  selectedLanguage.value = 'en_US' as SupportedLocales
  autoDetectLanguage.value = false
  dateFormat.value = 'medium'
  numberFormat.value = 'decimal'
}

const handleClose = () => {
  // 重置选择
  selectedLanguage.value = currentLocale.value
  dialogVisible.value = false
}

// 加载保存的设置
const loadSettings = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedDateFormat = localStorage.getItem('serial-studio-date-format')
    if (savedDateFormat) {
      dateFormat.value = savedDateFormat as 'short' | 'medium' | 'long'
    }
    
    const savedNumberFormat = localStorage.getItem('serial-studio-number-format')
    if (savedNumberFormat) {
      numberFormat.value = savedNumberFormat as 'decimal' | 'currency' | 'percent'
    }
    
    const savedAutoDetect = localStorage.getItem('serial-studio-auto-detect-language')
    if (savedAutoDetect) {
      autoDetectLanguage.value = savedAutoDetect === 'true'
    }
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
})

// 监听对话框打开状态
watch(dialogVisible, (visible) => {
  if (visible) {
    selectedLanguage.value = currentLocale.value
    loadSettings()
  }
})
</script>

<style scoped>
.language-selector-dialog {
  --dialog-padding: 24px;
}

.language-selector-content {
  max-height: 600px;
  overflow-y: auto;
}

.current-language-section,
.available-languages-section,
.language-options-section {
  margin-bottom: 20px;
}

.current-language-section h4,
.available-languages-section h4,
.language-options-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.current-language-display {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.language-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.language-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.language-item:last-child {
  border-bottom: none;
}

.language-item:hover {
  background: var(--el-fill-color-light);
}

.language-item.current {
  background: var(--el-color-primary-light-9);
  border-left: 4px solid var(--el-color-primary);
}

.language-item.rtl {
  direction: rtl;
}

.language-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-flag {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.language-names {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.native-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.english-name {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.language-code {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 4px;
}

.language-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.option-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 国旗样式（可以用CSS Sprites或者字体图标代替） */
.flag-icon {
  display: inline-block;
  width: 24px;
  height: 18px;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  border: 1px solid var(--el-border-color-lighter);
}

.flag-icon-us { background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIGZpbGw9IiNmZmZmZmYiLz4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMyIgZmlsbD0iI2Y5NDQ0NCIvPgo8L3N2Zz4='); }
.flag-icon-cn { background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIGZpbGw9IiNkZTI5MTAiLz4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMyIgZmlsbD0iI2ZmZGUwMCIvPgo8L3N2Zz4='); }

/* RTL支持 */
.language-item.rtl .language-info {
  flex-direction: row-reverse;
}

.language-item.rtl .language-names {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .language-selector-dialog {
    width: 90% !important;
  }
  
  .language-item {
    padding: 16px 12px;
  }
  
  .language-info {
    gap: 8px;
  }
}

/* 动画效果 */
.language-item {
  animation: fadeInUp 0.3s ease;
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

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .language-item.current {
    background: var(--el-color-primary-dark-2);
  }
}
</style>
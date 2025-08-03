/**
 * Vue I18n Composable API
 * Vue国际化组合式API
 */

import { ref, computed, readonly, inject, provide, type Ref, type ComputedRef } from 'vue';
import { I18nManager } from '../i18n/I18nManager';
import type {
  SupportedLocales,
  LanguageInfo,
  TranslateFunction,
  TranslationContext,
  InterpolationParams
} from '../types/I18nDef';

/**
 * I18n注入键
 */
export const I18N_INJECTION_KEY = Symbol('i18n');

/**
 * I18n响应式状态
 */
interface I18nState {
  currentLocale: Ref<SupportedLocales>;
  currentLanguageInfo: ComputedRef<LanguageInfo>;
  isRTL: ComputedRef<boolean>;
  availableLanguages: ComputedRef<LanguageInfo[]>;
  initialized: Ref<boolean>;
}

/**
 * I18n组合式API返回类型
 */
interface UseI18nReturn extends I18nState {
  t: TranslateFunction;
  setLocale: (locale: SupportedLocales) => Promise<void>;
  formatDate: (date: Date, format?: 'short' | 'medium' | 'long') => string;
  formatNumber: (num: number, format?: 'decimal' | 'currency' | 'percent') => string;
  getTranslationContext: () => TranslationContext;
}

/**
 * 全局I18n状态
 */
let globalI18nState: I18nState | null = null;
let i18nManager: I18nManager | null = null;

/**
 * 创建I18n实例
 */
export function createI18n(): I18nManager {
  if (!i18nManager) {
    i18nManager = I18nManager.getInstance();
    
    // 创建响应式状态
    const currentLocale = ref<SupportedLocales>(i18nManager.getCurrentLocale());
    const initialized = ref(false);
    
    const currentLanguageInfo = computed(() => 
      i18nManager!.getCurrentLanguageInfo()
    );
    
    const isRTL = computed(() => 
      i18nManager!.isCurrentRTL()
    );
    
    const availableLanguages = computed(() => 
      i18nManager!.getAvailableLanguages()
    );
    
    // 监听语言变更事件
    i18nManager.onLocaleChanged((newLocale) => {
      currentLocale.value = newLocale;
    });
    
    // 创建全局状态
    globalI18nState = {
      currentLocale,
      currentLanguageInfo,
      isRTL,
      availableLanguages,
      initialized
    };
    
    // 初始化I18n系统
    i18nManager.initialize().then(() => {
      initialized.value = true;
      currentLocale.value = i18nManager!.getCurrentLocale();
    }).catch(error => {
      console.error('Failed to initialize I18n:', error);
      initialized.value = true; // 即使失败也设置为true，使用默认语言
    });
  }
  
  return i18nManager;
}

/**
 * 提供I18n实例到Vue应用
 */
export function provideI18n(): I18nManager {
  const manager = createI18n();
  provide(I18N_INJECTION_KEY, manager);
  return manager;
}

/**
 * Vue I18n组合式API
 */
export function useI18n(): UseI18nReturn {
  // 尝试从注入获取I18n管理器
  let manager = inject<I18nManager>(I18N_INJECTION_KEY);
  
  // 如果没有注入，创建全局实例
  if (!manager) {
    manager = createI18n();
  }
  
  // 如果没有全局状态，创建它
  if (!globalI18nState) {
    createI18n();
  }
  
  const state = globalI18nState!;
  
  /**
   * 翻译函数
   */
  const t: TranslateFunction = (
    key: string, 
    params?: InterpolationParams | (string | number)[], 
    fallback?: string
  ): string => {
    return manager!.t(key, params, fallback);
  };
  
  /**
   * 设置语言
   */
  const setLocale = async (locale: SupportedLocales): Promise<void> => {
    await manager!.setLocale(locale);
  };
  
  /**
   * 格式化日期
   */
  const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
    return manager!.formatDate(date, format);
  };
  
  /**
   * 格式化数字
   */
  const formatNumber = (num: number, format: 'decimal' | 'currency' | 'percent' = 'decimal'): string => {
    return manager!.formatNumber(num, format);
  };
  
  /**
   * 获取翻译上下文
   */
  const getTranslationContext = (): TranslationContext => {
    return {
      t,
      locale: state.currentLocale.value,
      localeInfo: state.currentLanguageInfo.value,
      isRTL: state.isRTL.value,
      setLocale,
      getAvailableLocales: () => state.availableLanguages.value,
      formatDate,
      formatNumber
    };
  };
  
  return {
    // 状态
    currentLocale: readonly(state.currentLocale),
    currentLanguageInfo: state.currentLanguageInfo,
    isRTL: state.isRTL,
    availableLanguages: state.availableLanguages,
    initialized: readonly(state.initialized),
    
    // 方法
    t,
    setLocale,
    formatDate,
    formatNumber,
    getTranslationContext
  };
}

/**
 * 简化的翻译函数Hook（用于简单场景）
 */
export function useTranslation() {
  const { t } = useI18n();
  return { t };
}

/**
 * 语言切换Hook
 */
export function useLanguageSwitch() {
  const { 
    currentLocale, 
    availableLanguages, 
    setLocale 
  } = useI18n();
  
  return {
    currentLocale,
    availableLanguages,
    setLocale
  };
}

/**
 * 数字和日期格式化Hook
 */
export function useFormatters() {
  const { formatDate, formatNumber, currentLocale } = useI18n();
  
  return {
    formatDate,
    formatNumber,
    currentLocale
  };
}

/**
 * RTL布局Hook
 */
export function useRTL() {
  const { isRTL, currentLocale } = useI18n();
  
  const getTextDirection = computed(() => isRTL.value ? 'rtl' : 'ltr');
  const getFlexDirection = computed(() => isRTL.value ? 'row-reverse' : 'row');
  const getTextAlign = computed(() => isRTL.value ? 'right' : 'left');
  
  return {
    isRTL,
    currentLocale,
    textDirection: getTextDirection,
    flexDirection: getFlexDirection,
    textAlign: getTextAlign
  };
}

/**
 * 翻译状态监听Hook
 */
export function useTranslationState() {
  const { currentLocale, initialized } = useI18n();
  
  // 语言变更事件
  const onLocaleChange = (callback: (locale: SupportedLocales) => void) => {
    const manager = i18nManager || createI18n();
    return manager.onLocaleChanged((newLocale) => {
      callback(newLocale);
    });
  };
  
  // 翻译缺失事件
  const onTranslationMissing = (callback: (key: string, locale: SupportedLocales) => void) => {
    const manager = i18nManager || createI18n();
    return manager.onTranslationMissing(callback);
  };
  
  return {
    currentLocale,
    initialized,
    onLocaleChange,
    onTranslationMissing
  };
}

/**
 * 翻译预加载Hook
 */
export function useTranslationPreloader() {
  const manager = i18nManager || createI18n();
  
  const preloadTranslations = async (locales: SupportedLocales[]) => {
    await manager.preloadTranslations(locales);
  };
  
  const clearCache = () => {
    manager.clearCache();
  };
  
  return {
    preloadTranslations,
    clearCache
  };
}

/**
 * 翻译键验证Hook（开发环境使用）
 */
export function useTranslationValidator() {
  const { t } = useI18n();
  
  const validateKey = (key: string): boolean => {
    const result = t(key);
    // 如果返回的是键本身或错误格式，说明翻译缺失
    return !result.startsWith('[') || !result.endsWith(']') || result !== key;
  };
  
  const validateKeys = (keys: string[]): { valid: string[]; invalid: string[] } => {
    const valid: string[] = [];
    const invalid: string[] = [];
    
    keys.forEach(key => {
      if (validateKey(key)) {
        valid.push(key);
      } else {
        invalid.push(key);
      }
    });
    
    return { valid, invalid };
  };
  
  return {
    validateKey,
    validateKeys
  };
}

/**
 * 翻译调试Hook（开发环境使用）
 */
export function useTranslationDebug() {
  const { currentLocale } = useI18n();
  
  const logMissingTranslations = ref<Array<{
    key: string;
    locale: SupportedLocales;
    timestamp: Date;
  }>>([]);
  
  // 监听翻译缺失事件
  const { onTranslationMissing } = useTranslationState();
  onTranslationMissing((key, locale) => {
    logMissingTranslations.value.push({
      key,
      locale,
      timestamp: new Date()
    });
  });
  
  const clearMissingLog = () => {
    logMissingTranslations.value = [];
  };
  
  const exportMissingLog = () => {
    return JSON.stringify(logMissingTranslations.value, null, 2);
  };
  
  return {
    currentLocale,
    missingTranslations: readonly(logMissingTranslations),
    clearMissingLog,
    exportMissingLog
  };
}
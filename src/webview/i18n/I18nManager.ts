/**
 * I18n Manager for Serial-Studio VSCode Extension
 * 完全兼容Serial-Studio的国际化管理器
 */

import {
  SupportedLocales,
  type LanguageInfo,
  type TranslationResource,
  type TranslationMessages,
  type InterpolationParams,
  type TranslateFunction,
  type TranslationOptions,
  type I18nConfig,
  type I18nEvents,
  type TranslationLoader,
  type TranslationCache,
  type LanguageDetector
} from '../types/I18nDef';

import {
  LANGUAGES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  getLanguageInfo,
  getAllLanguages,
  isSupportedLocale,
  isRTLLanguage,
  getMatchingLocale,
  getPluralRule
} from './languages';

/**
 * 翻译事件监听器类型
 */
type LocaleChangeListener = (newLocale: SupportedLocales, oldLocale: SupportedLocales) => void;
type ResourceLoadListener = (locale: SupportedLocales, resource: TranslationResource) => void;
type TranslationMissingListener = (key: string, locale: SupportedLocales) => void;

/**
 * 默认翻译选项
 */
const DEFAULT_OPTIONS: TranslationOptions = {
  defaultLocale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  enablePluralization: true,
  enableInterpolation: true,
  warnOnMissing: true,
  missingKeyHandler: (key: string, locale: SupportedLocales) => `[${locale}:${key}]`
};

/**
 * 简单的内存缓存实现
 */
class MemoryTranslationCache implements TranslationCache {
  private cache = new Map<SupportedLocales, TranslationResource>();

  get(locale: SupportedLocales): TranslationResource | null {
    return this.cache.get(locale) || null;
  }

  set(locale: SupportedLocales, resource: TranslationResource): void {
    this.cache.set(locale, resource);
  }

  clear(): void {
    this.cache.clear();
  }

  has(locale: SupportedLocales): boolean {
    return this.cache.has(locale);
  }
}

/**
 * 默认语言检测器
 */
class DefaultLanguageDetector implements LanguageDetector {
  private storageKey = 'serial-studio-locale';

  detect(): SupportedLocales {
    // 1. 首先从存储中检测
    const stored = this.detectFromStorage();
    if (stored) {
      return stored;
    }

    // 2. 从浏览器检测
    return this.detectFromBrowser();
  }

  detectFromBrowser(): SupportedLocales {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // 检查 navigator.language
      if (navigator.language) {
        return getMatchingLocale(navigator.language);
      }

      // 检查 navigator.languages
      if (navigator.languages && navigator.languages.length > 0) {
        for (const lang of navigator.languages) {
          const matched = getMatchingLocale(lang);
          if (matched !== DEFAULT_LOCALE || lang.startsWith('en')) {
            return matched;
          }
        }
      }
    }

    return DEFAULT_LOCALE;
  }

  detectFromStorage(): SupportedLocales | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored && isSupportedLocale(stored)) {
          return stored as SupportedLocales;
        }
      }
    } catch (error) {
      console.warn('Failed to detect language from storage:', error);
    }
    return null;
  }

  saveLanguage(locale: SupportedLocales): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, locale);
      }
    } catch (error) {
      console.warn('Failed to save language to storage:', error);
    }
  }
}

/**
 * 默认翻译加载器
 */
class DefaultTranslationLoader implements TranslationLoader {
  private loadedTranslations = new Map<SupportedLocales, TranslationResource>();

  async loadTranslation(locale: SupportedLocales): Promise<TranslationResource> {
    // 如果已经加载过，直接返回
    if (this.loadedTranslations.has(locale)) {
      return this.loadedTranslations.get(locale)!;
    }

    try {
      // 动态导入翻译文件
      const module = await this.importTranslationModule(locale);
      const resource: TranslationResource = {
        locale,
        messages: module.default || module,
        pluralRule: getPluralRule(locale),
        dateTimeFormats: this.getDateTimeFormats(locale),
        numberFormats: this.getNumberFormats(locale)
      };

      this.loadedTranslations.set(locale, resource);
      return resource;
    } catch (error) {
      console.warn(`Failed to load translation for ${locale}:`, error);
      
      // 返回空的翻译资源
      const emptyResource: TranslationResource = {
        locale,
        messages: {},
        pluralRule: getPluralRule(locale),
        dateTimeFormats: this.getDateTimeFormats(locale),
        numberFormats: this.getNumberFormats(locale)
      };
      
      return emptyResource;
    }
  }

  hasTranslation(locale: SupportedLocales): boolean {
    return this.loadedTranslations.has(locale);
  }

  getSupportedLocales(): SupportedLocales[] {
    return Object.values(SupportedLocales);
  }

  private async importTranslationModule(locale: SupportedLocales): Promise<any> {
    try {
      // 动态导入对应的翻译文件
      switch (locale) {
        case SupportedLocales.ZH_CN:
          return await import('../translations/zh_CN');
        case SupportedLocales.EN_US:
          return await import('../translations/en_US');
        case SupportedLocales.DE_DE:
        case SupportedLocales.FR_FR:
        case SupportedLocales.ES_MX:
        case SupportedLocales.IT_IT:
        case SupportedLocales.JA_JP:
        case SupportedLocales.KO_KR:
        case SupportedLocales.PL_PL:
        case SupportedLocales.PT_BR:
        case SupportedLocales.RU_RU:
        case SupportedLocales.TR_TR:
        case SupportedLocales.CS_CZ:
        case SupportedLocales.UK_UA:
          // 对于尚未实现的语言，回退到英语
          console.warn(`Translation for ${locale} not yet implemented, falling back to en_US`);
          return await import('../translations/en_US');
        default:
          // 回退到英语
          return await import('../translations/en_US');
      }
    } catch (error) {
      console.warn(`Failed to import translation module for ${locale}:`, error);
      // 最后的回退
      return await import('../translations/en_US');
    }
  }

  private getDateTimeFormats(locale: SupportedLocales): TranslationResource['dateTimeFormats'] {
    return {
      short: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      },
      medium: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric' 
      },
      long: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric' 
      }
    };
  }

  private getNumberFormats(locale: SupportedLocales): TranslationResource['numberFormats'] {
    return {
      decimal: { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 3 
      },
      currency: { 
        style: 'currency', 
        currency: this.getCurrencyForLocale(locale) 
      },
      percent: { 
        style: 'percent', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      }
    };
  }

  private getCurrencyForLocale(locale: SupportedLocales): string {
    const currencyMap: Record<SupportedLocales, string> = {
      [SupportedLocales.EN_US]: 'USD',
      [SupportedLocales.ES_MX]: 'MXN',
      [SupportedLocales.DE_DE]: 'EUR',
      [SupportedLocales.FR_FR]: 'EUR',
      [SupportedLocales.IT_IT]: 'EUR',
      [SupportedLocales.JA_JP]: 'JPY',
      [SupportedLocales.KO_KR]: 'KRW',
      [SupportedLocales.PL_PL]: 'PLN',
      [SupportedLocales.PT_BR]: 'BRL',
      [SupportedLocales.RU_RU]: 'RUB',
      [SupportedLocales.TR_TR]: 'TRY',
      [SupportedLocales.ZH_CN]: 'CNY',
      [SupportedLocales.CS_CZ]: 'CZK',
      [SupportedLocales.UK_UA]: 'UAH'
    };
    
    return currencyMap[locale] || 'USD';
  }
}

/**
 * I18n管理器主类
 */
export class I18nManager {
  private static instance: I18nManager | null = null;

  // 配置和状态
  private config: I18nConfig;
  private currentResource: TranslationResource | null = null;
  
  // 依赖组件
  private loader: TranslationLoader;
  private cache: TranslationCache;
  private detector: LanguageDetector;
  
  // 事件监听器
  private localeChangeListeners: LocaleChangeListener[] = [];
  private resourceLoadListeners: ResourceLoadListener[] = [];
  private translationMissingListeners: TranslationMissingListener[] = [];

  private constructor(
    options: Partial<TranslationOptions> = {},
    loader?: TranslationLoader,
    cache?: TranslationCache,
    detector?: LanguageDetector
  ) {
    this.config = {
      currentLocale: DEFAULT_LOCALE,
      options: { ...DEFAULT_OPTIONS, ...options },
      initialized: false
    };
    
    this.loader = loader || new DefaultTranslationLoader();
    this.cache = cache || new MemoryTranslationCache();
    this.detector = detector || new DefaultLanguageDetector();
  }

  /**
   * 获取I18n管理器单例
   */
  public static getInstance(
    options?: Partial<TranslationOptions>,
    loader?: TranslationLoader,
    cache?: TranslationCache,
    detector?: LanguageDetector
  ): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager(options, loader, cache, detector);
    }
    return I18nManager.instance;
  }

  /**
   * 重置单例实例 (主要用于测试)
   */
  public static resetInstance(): void {
    if (I18nManager.instance) {
      I18nManager.instance.destroy();
    }
    I18nManager.instance = null;
  }

  /**
   * 初始化I18n系统
   */
  public async initialize(): Promise<void> {
    if (this.config.initialized) {
      return;
    }

    try {
      // 检测用户首选语言
      const detectedLocale = this.detector.detect();
      
      // 加载翻译资源
      await this.setLocale(detectedLocale, false);
      
      this.config.initialized = true;
      console.log(`I18n initialized with locale: ${this.config.currentLocale}`);
    } catch (error) {
      console.error('Failed to initialize I18n:', error);
      // 回退到默认语言
      await this.setLocale(DEFAULT_LOCALE, false);
      this.config.initialized = true;
    }
  }

  /**
   * 设置当前语言
   */
  public async setLocale(locale: SupportedLocales, save: boolean = true): Promise<void> {
    if (!isSupportedLocale(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    const oldLocale = this.config.currentLocale;
    
    try {
      // 从缓存获取或加载翻译资源
      let resource = this.cache.get(locale);
      if (!resource) {
        resource = await this.loader.loadTranslation(locale);
        this.cache.set(locale, resource);
        
        // 通知资源加载监听器
        this.notifyResourceLoaded(locale, resource);
      }

      // 更新当前状态
      this.config.currentLocale = locale;
      this.currentResource = resource;

      // 通知语言变更监听器
      this.notifyLocaleChanged(locale, oldLocale);

      // 保存到存储
      if (save) {
        this.detector.saveLanguage(locale);
      }

      // 应用RTL设置
      this.applyRTLSetting(locale);

      console.log(`Locale changed from ${oldLocale} to ${locale}`);
    } catch (error) {
      console.error(`Failed to set locale to ${locale}:`, error);
      throw error;
    }
  }

  /**
   * 获取当前语言
   */
  public getCurrentLocale(): SupportedLocales {
    return this.config.currentLocale;
  }

  /**
   * 获取当前语言信息
   */
  public getCurrentLanguageInfo(): LanguageInfo {
    return getLanguageInfo(this.config.currentLocale);
  }

  /**
   * 检查当前语言是否为RTL
   */
  public isCurrentRTL(): boolean {
    return isRTLLanguage(this.config.currentLocale);
  }

  /**
   * 获取所有可用语言
   */
  public getAvailableLanguages(): LanguageInfo[] {
    return getAllLanguages();
  }

  /**
   * 翻译函数
   */
  public t: TranslateFunction = (key: string, params?: InterpolationParams | (string | number)[], fallback?: string): string => {
    if (!this.currentResource) {
      return fallback || this.config.options.missingKeyHandler(key, this.config.currentLocale);
    }

    try {
      // 获取翻译文本
      let translation = this.getTranslationByKey(key, this.currentResource.messages);
      
      // 如果没有找到翻译，尝试回退语言
      if (translation === null && this.config.currentLocale !== this.config.options.fallbackLocale) {
        const fallbackResource = this.cache.get(this.config.options.fallbackLocale);
        if (fallbackResource) {
          translation = this.getTranslationByKey(key, fallbackResource.messages);
        }
      }

      // 如果仍然没有找到，返回fallback或缺失键处理结果
      if (translation === null) {
        this.notifyTranslationMissing(key, this.config.currentLocale);
        return fallback || this.config.options.missingKeyHandler(key, this.config.currentLocale);
      }

      // 处理插值
      if (params && this.config.options.enableInterpolation) {
        translation = this.interpolate(translation, params);
      }

      return translation;
    } catch (error) {
      console.warn(`Error translating key "${key}":`, error);
      return fallback || key;
    }
  };

  /**
   * 格式化日期
   */
  public formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
    if (!this.currentResource?.dateTimeFormats) {
      return date.toLocaleDateString();
    }

    try {
      const options = this.currentResource.dateTimeFormats[format];
      return new Intl.DateTimeFormat(this.config.currentLocale.replace('_', '-'), options).format(date);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  };

  /**
   * 格式化数字
   */
  public formatNumber = (num: number, format: 'decimal' | 'currency' | 'percent' = 'decimal'): string => {
    if (!this.currentResource?.numberFormats) {
      return num.toString();
    }

    try {
      const options = this.currentResource.numberFormats[format];
      return new Intl.NumberFormat(this.config.currentLocale.replace('_', '-'), options).format(num);
    } catch (error) {
      console.warn('Error formatting number:', error);
      return num.toString();
    }
  };

  /**
   * 添加语言变更监听器
   */
  public onLocaleChanged(listener: LocaleChangeListener): () => void {
    this.localeChangeListeners.push(listener);
    return () => {
      const index = this.localeChangeListeners.indexOf(listener);
      if (index >= 0) {
        this.localeChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * 添加资源加载监听器
   */
  public onResourceLoaded(listener: ResourceLoadListener): () => void {
    this.resourceLoadListeners.push(listener);
    return () => {
      const index = this.resourceLoadListeners.indexOf(listener);
      if (index >= 0) {
        this.resourceLoadListeners.splice(index, 1);
      }
    };
  }

  /**
   * 添加翻译缺失监听器
   */
  public onTranslationMissing(listener: TranslationMissingListener): () => void {
    this.translationMissingListeners.push(listener);
    return () => {
      const index = this.translationMissingListeners.indexOf(listener);
      if (index >= 0) {
        this.translationMissingListeners.splice(index, 1);
      }
    };
  }

  /**
   * 预加载翻译资源
   */
  public async preloadTranslations(locales: SupportedLocales[]): Promise<void> {
    const promises = locales.map(async locale => {
      if (!this.cache.has(locale)) {
        try {
          const resource = await this.loader.loadTranslation(locale);
          this.cache.set(locale, resource);
          this.notifyResourceLoaded(locale, resource);
        } catch (error) {
          console.warn(`Failed to preload translation for ${locale}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 清空翻译缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * 销毁I18n管理器
   */
  public destroy(): void {
    this.clearCache();
    this.localeChangeListeners = [];
    this.resourceLoadListeners = [];
    this.translationMissingListeners = [];
    this.config.initialized = false;
    I18nManager.instance = null;
  }

  // === 私有方法 ===

  /**
   * 根据键获取翻译
   */
  private getTranslationByKey(key: string, messages: TranslationMessages): string | null {
    const keys = key.split('.');
    let current: any = messages;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * 插值处理
   */
  private interpolate(text: string, params: InterpolationParams | (string | number)[]): string {
    if (Array.isArray(params)) {
      // 位置参数插值: Hello {0}, welcome to {1}
      return text.replace(/\{(\d+)\}/g, (match, index) => {
        const paramIndex = parseInt(index, 10);
        return paramIndex < params.length ? String(params[paramIndex]) : match;
      });
    } else {
      // 命名参数插值: Hello {name}, welcome to {app}
      return text.replace(/\{([^}]+)\}/g, (match, key) => {
        return key in params ? String(params[key]) : match;
      });
    }
  }

  /**
   * 应用RTL设置
   */
  private applyRTLSetting(locale: SupportedLocales): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const isRTL = isRTLLanguage(locale);
      const html = document.documentElement;
      
      if (isRTL) {
        html.setAttribute('dir', 'rtl');
        html.classList.add('rtl');
      } else {
        html.setAttribute('dir', 'ltr');
        html.classList.remove('rtl');
      }
    }
  }

  /**
   * 通知语言变更
   */
  private notifyLocaleChanged(newLocale: SupportedLocales, oldLocale: SupportedLocales): void {
    this.localeChangeListeners.forEach(listener => {
      try {
        listener(newLocale, oldLocale);
      } catch (error) {
        console.error('Error in locale change listener:', error);
      }
    });
  }

  /**
   * 通知资源加载
   */
  private notifyResourceLoaded(locale: SupportedLocales, resource: TranslationResource): void {
    this.resourceLoadListeners.forEach(listener => {
      try {
        listener(locale, resource);
      } catch (error) {
        console.error('Error in resource load listener:', error);
      }
    });
  }

  /**
   * 通知翻译缺失
   */
  private notifyTranslationMissing(key: string, locale: SupportedLocales): void {
    if (this.config.options.warnOnMissing) {
      console.warn(`Missing translation for key "${key}" in locale "${locale}"`);
    }
    
    this.translationMissingListeners.forEach(listener => {
      try {
        listener(key, locale);
      } catch (error) {
        console.error('Error in translation missing listener:', error);
      }
    });
  }
}
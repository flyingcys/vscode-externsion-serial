"use strict";
/**
 * I18n Manager for Serial-Studio VSCode Extension
 * 完全兼容Serial-Studio的国际化管理器
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nManager = void 0;
const I18nDef_1 = require("../types/I18nDef");
const languages_1 = require("./languages");
/**
 * 默认翻译选项
 */
const DEFAULT_OPTIONS = {
    defaultLocale: languages_1.DEFAULT_LOCALE,
    fallbackLocale: languages_1.FALLBACK_LOCALE,
    enablePluralization: true,
    enableInterpolation: true,
    warnOnMissing: true,
    missingKeyHandler: (key, locale) => `[${locale}:${key}]`
};
/**
 * 简单的内存缓存实现
 */
class MemoryTranslationCache {
    cache = new Map();
    get(locale) {
        return this.cache.get(locale) || null;
    }
    set(locale, resource) {
        this.cache.set(locale, resource);
    }
    clear() {
        this.cache.clear();
    }
    has(locale) {
        return this.cache.has(locale);
    }
}
/**
 * 默认语言检测器
 */
class DefaultLanguageDetector {
    storageKey = 'serial-studio-locale';
    detect() {
        // 1. 首先从存储中检测
        const stored = this.detectFromStorage();
        if (stored) {
            return stored;
        }
        // 2. 从浏览器检测
        return this.detectFromBrowser();
    }
    detectFromBrowser() {
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            // 检查 navigator.language
            if (navigator.language) {
                return (0, languages_1.getMatchingLocale)(navigator.language);
            }
            // 检查 navigator.languages
            if (navigator.languages && navigator.languages.length > 0) {
                for (const lang of navigator.languages) {
                    const matched = (0, languages_1.getMatchingLocale)(lang);
                    if (matched !== languages_1.DEFAULT_LOCALE || lang.startsWith('en')) {
                        return matched;
                    }
                }
            }
        }
        return languages_1.DEFAULT_LOCALE;
    }
    detectFromStorage() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(this.storageKey);
                if (stored && (0, languages_1.isSupportedLocale)(stored)) {
                    return stored;
                }
            }
        }
        catch (error) {
            console.warn('Failed to detect language from storage:', error);
        }
        return null;
    }
    saveLanguage(locale) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(this.storageKey, locale);
            }
        }
        catch (error) {
            console.warn('Failed to save language to storage:', error);
        }
    }
}
/**
 * 默认翻译加载器
 */
class DefaultTranslationLoader {
    loadedTranslations = new Map();
    async loadTranslation(locale) {
        // 如果已经加载过，直接返回
        if (this.loadedTranslations.has(locale)) {
            return this.loadedTranslations.get(locale);
        }
        try {
            // 动态导入翻译文件
            const module = await this.importTranslationModule(locale);
            const resource = {
                locale,
                messages: module.default || module,
                pluralRule: (0, languages_1.getPluralRule)(locale),
                dateTimeFormats: this.getDateTimeFormats(locale),
                numberFormats: this.getNumberFormats(locale)
            };
            this.loadedTranslations.set(locale, resource);
            return resource;
        }
        catch (error) {
            console.warn(`Failed to load translation for ${locale}:`, error);
            // 返回空的翻译资源
            const emptyResource = {
                locale,
                messages: {},
                pluralRule: (0, languages_1.getPluralRule)(locale),
                dateTimeFormats: this.getDateTimeFormats(locale),
                numberFormats: this.getNumberFormats(locale)
            };
            return emptyResource;
        }
    }
    hasTranslation(locale) {
        return this.loadedTranslations.has(locale);
    }
    getSupportedLocales() {
        return Object.values(I18nDef_1.SupportedLocales);
    }
    async importTranslationModule(locale) {
        try {
            // 动态导入对应的翻译文件
            switch (locale) {
                case I18nDef_1.SupportedLocales.ZH_CN:
                    return await Promise.resolve().then(() => __importStar(require('../translations/zh_CN')));
                case I18nDef_1.SupportedLocales.EN_US:
                    return await Promise.resolve().then(() => __importStar(require('../translations/en_US')));
                case I18nDef_1.SupportedLocales.DE_DE:
                case I18nDef_1.SupportedLocales.FR_FR:
                case I18nDef_1.SupportedLocales.ES_MX:
                case I18nDef_1.SupportedLocales.IT_IT:
                case I18nDef_1.SupportedLocales.JA_JP:
                case I18nDef_1.SupportedLocales.KO_KR:
                case I18nDef_1.SupportedLocales.PL_PL:
                case I18nDef_1.SupportedLocales.PT_BR:
                case I18nDef_1.SupportedLocales.RU_RU:
                case I18nDef_1.SupportedLocales.TR_TR:
                case I18nDef_1.SupportedLocales.CS_CZ:
                case I18nDef_1.SupportedLocales.UK_UA:
                    // 对于尚未实现的语言，回退到英语
                    console.warn(`Translation for ${locale} not yet implemented, falling back to en_US`);
                    return await Promise.resolve().then(() => __importStar(require('../translations/en_US')));
                default:
                    // 回退到英语
                    return await Promise.resolve().then(() => __importStar(require('../translations/en_US')));
            }
        }
        catch (error) {
            console.warn(`Failed to import translation module for ${locale}:`, error);
            // 最后的回退
            return await Promise.resolve().then(() => __importStar(require('../translations/en_US')));
        }
    }
    getDateTimeFormats(locale) {
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
    getNumberFormats(locale) {
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
    getCurrencyForLocale(locale) {
        const currencyMap = {
            [I18nDef_1.SupportedLocales.EN_US]: 'USD',
            [I18nDef_1.SupportedLocales.ES_MX]: 'MXN',
            [I18nDef_1.SupportedLocales.DE_DE]: 'EUR',
            [I18nDef_1.SupportedLocales.FR_FR]: 'EUR',
            [I18nDef_1.SupportedLocales.IT_IT]: 'EUR',
            [I18nDef_1.SupportedLocales.JA_JP]: 'JPY',
            [I18nDef_1.SupportedLocales.KO_KR]: 'KRW',
            [I18nDef_1.SupportedLocales.PL_PL]: 'PLN',
            [I18nDef_1.SupportedLocales.PT_BR]: 'BRL',
            [I18nDef_1.SupportedLocales.RU_RU]: 'RUB',
            [I18nDef_1.SupportedLocales.TR_TR]: 'TRY',
            [I18nDef_1.SupportedLocales.ZH_CN]: 'CNY',
            [I18nDef_1.SupportedLocales.CS_CZ]: 'CZK',
            [I18nDef_1.SupportedLocales.UK_UA]: 'UAH'
        };
        return currencyMap[locale] || 'USD';
    }
}
/**
 * I18n管理器主类
 */
class I18nManager {
    static instance = null;
    // 配置和状态
    config;
    currentResource = null;
    // 依赖组件
    loader;
    cache;
    detector;
    // 事件监听器
    localeChangeListeners = [];
    resourceLoadListeners = [];
    translationMissingListeners = [];
    constructor(options = {}, loader, cache, detector) {
        this.config = {
            currentLocale: languages_1.DEFAULT_LOCALE,
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
    static getInstance(options, loader, cache, detector) {
        if (!I18nManager.instance) {
            I18nManager.instance = new I18nManager(options, loader, cache, detector);
        }
        return I18nManager.instance;
    }
    /**
     * 重置单例实例 (主要用于测试)
     */
    static resetInstance() {
        if (I18nManager.instance) {
            I18nManager.instance.destroy();
        }
        I18nManager.instance = null;
    }
    /**
     * 初始化I18n系统
     */
    async initialize() {
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
        }
        catch (error) {
            console.error('Failed to initialize I18n:', error);
            // 回退到默认语言
            await this.setLocale(languages_1.DEFAULT_LOCALE, false);
            this.config.initialized = true;
        }
    }
    /**
     * 设置当前语言
     */
    async setLocale(locale, save = true) {
        if (!(0, languages_1.isSupportedLocale)(locale)) {
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
        }
        catch (error) {
            console.error(`Failed to set locale to ${locale}:`, error);
            throw error;
        }
    }
    /**
     * 获取当前语言
     */
    getCurrentLocale() {
        return this.config.currentLocale;
    }
    /**
     * 获取当前语言信息
     */
    getCurrentLanguageInfo() {
        return (0, languages_1.getLanguageInfo)(this.config.currentLocale);
    }
    /**
     * 检查当前语言是否为RTL
     */
    isCurrentRTL() {
        return (0, languages_1.isRTLLanguage)(this.config.currentLocale);
    }
    /**
     * 获取所有可用语言
     */
    getAvailableLanguages() {
        return (0, languages_1.getAllLanguages)();
    }
    /**
     * 翻译函数
     */
    t = (key, params, fallback) => {
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
        }
        catch (error) {
            console.warn(`Error translating key "${key}":`, error);
            return fallback || key;
        }
    };
    /**
     * 格式化日期
     */
    formatDate = (date, format = 'medium') => {
        if (!this.currentResource?.dateTimeFormats) {
            return date.toLocaleDateString();
        }
        try {
            const options = this.currentResource.dateTimeFormats[format];
            return new Intl.DateTimeFormat(this.config.currentLocale.replace('_', '-'), options).format(date);
        }
        catch (error) {
            console.warn('Error formatting date:', error);
            return date.toLocaleDateString();
        }
    };
    /**
     * 格式化数字
     */
    formatNumber = (num, format = 'decimal') => {
        if (!this.currentResource?.numberFormats) {
            return num.toString();
        }
        try {
            const options = this.currentResource.numberFormats[format];
            return new Intl.NumberFormat(this.config.currentLocale.replace('_', '-'), options).format(num);
        }
        catch (error) {
            console.warn('Error formatting number:', error);
            return num.toString();
        }
    };
    /**
     * 添加语言变更监听器
     */
    onLocaleChanged(listener) {
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
    onResourceLoaded(listener) {
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
    onTranslationMissing(listener) {
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
    async preloadTranslations(locales) {
        const promises = locales.map(async (locale) => {
            if (!this.cache.has(locale)) {
                try {
                    const resource = await this.loader.loadTranslation(locale);
                    this.cache.set(locale, resource);
                    this.notifyResourceLoaded(locale, resource);
                }
                catch (error) {
                    console.warn(`Failed to preload translation for ${locale}:`, error);
                }
            }
        });
        await Promise.allSettled(promises);
    }
    /**
     * 清空翻译缓存
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * 销毁I18n管理器
     */
    destroy() {
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
    getTranslationByKey(key, messages) {
        const keys = key.split('.');
        let current = messages;
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            }
            else {
                return null;
            }
        }
        return typeof current === 'string' ? current : null;
    }
    /**
     * 插值处理
     */
    interpolate(text, params) {
        if (Array.isArray(params)) {
            // 位置参数插值: Hello {0}, welcome to {1}
            return text.replace(/\{(\d+)\}/g, (match, index) => {
                const paramIndex = parseInt(index, 10);
                return paramIndex < params.length ? String(params[paramIndex]) : match;
            });
        }
        else {
            // 命名参数插值: Hello {name}, welcome to {app}
            return text.replace(/\{([^}]+)\}/g, (match, key) => {
                return key in params ? String(params[key]) : match;
            });
        }
    }
    /**
     * 应用RTL设置
     */
    applyRTLSetting(locale) {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const isRTL = (0, languages_1.isRTLLanguage)(locale);
            const html = document.documentElement;
            if (isRTL) {
                html.setAttribute('dir', 'rtl');
                html.classList.add('rtl');
            }
            else {
                html.setAttribute('dir', 'ltr');
                html.classList.remove('rtl');
            }
        }
    }
    /**
     * 通知语言变更
     */
    notifyLocaleChanged(newLocale, oldLocale) {
        this.localeChangeListeners.forEach(listener => {
            try {
                listener(newLocale, oldLocale);
            }
            catch (error) {
                console.error('Error in locale change listener:', error);
            }
        });
    }
    /**
     * 通知资源加载
     */
    notifyResourceLoaded(locale, resource) {
        this.resourceLoadListeners.forEach(listener => {
            try {
                listener(locale, resource);
            }
            catch (error) {
                console.error('Error in resource load listener:', error);
            }
        });
    }
    /**
     * 通知翻译缺失
     */
    notifyTranslationMissing(key, locale) {
        if (this.config.options.warnOnMissing) {
            console.warn(`Missing translation for key "${key}" in locale "${locale}"`);
        }
        this.translationMissingListeners.forEach(listener => {
            try {
                listener(key, locale);
            }
            catch (error) {
                console.error('Error in translation missing listener:', error);
            }
        });
    }
}
exports.I18nManager = I18nManager;
//# sourceMappingURL=I18nManager.js.map
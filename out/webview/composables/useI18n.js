"use strict";
/**
 * Vue I18n Composable API
 * Vue国际化组合式API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTranslationDebug = exports.useTranslationValidator = exports.useTranslationPreloader = exports.useTranslationState = exports.useRTL = exports.useFormatters = exports.useLanguageSwitch = exports.useTranslation = exports.useI18n = exports.provideI18n = exports.createI18n = exports.I18N_INJECTION_KEY = void 0;
const vue_1 = require("vue");
const I18nManager_1 = require("../i18n/I18nManager");
/**
 * I18n注入键
 */
exports.I18N_INJECTION_KEY = Symbol('i18n');
/**
 * 全局I18n状态
 */
let globalI18nState = null;
let i18nManager = null;
/**
 * 创建I18n实例
 */
function createI18n() {
    if (!i18nManager) {
        i18nManager = I18nManager_1.I18nManager.getInstance();
        // 创建响应式状态
        const currentLocale = (0, vue_1.ref)(i18nManager.getCurrentLocale());
        const initialized = (0, vue_1.ref)(false);
        const currentLanguageInfo = (0, vue_1.computed)(() => i18nManager.getCurrentLanguageInfo());
        const isRTL = (0, vue_1.computed)(() => i18nManager.isCurrentRTL());
        const availableLanguages = (0, vue_1.computed)(() => i18nManager.getAvailableLanguages());
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
            currentLocale.value = i18nManager.getCurrentLocale();
        }).catch(error => {
            console.error('Failed to initialize I18n:', error);
            initialized.value = true; // 即使失败也设置为true，使用默认语言
        });
    }
    return i18nManager;
}
exports.createI18n = createI18n;
/**
 * 提供I18n实例到Vue应用
 */
function provideI18n() {
    const manager = createI18n();
    (0, vue_1.provide)(exports.I18N_INJECTION_KEY, manager);
    return manager;
}
exports.provideI18n = provideI18n;
/**
 * Vue I18n组合式API
 */
function useI18n() {
    // 尝试从注入获取I18n管理器
    let manager = (0, vue_1.inject)(exports.I18N_INJECTION_KEY);
    // 如果没有注入，创建全局实例
    if (!manager) {
        manager = createI18n();
    }
    // 如果没有全局状态，创建它
    if (!globalI18nState) {
        createI18n();
    }
    const state = globalI18nState;
    /**
     * 翻译函数
     */
    const t = (key, params, fallback) => {
        return manager.t(key, params, fallback);
    };
    /**
     * 设置语言
     */
    const setLocale = async (locale) => {
        await manager.setLocale(locale);
    };
    /**
     * 格式化日期
     */
    const formatDate = (date, format = 'medium') => {
        return manager.formatDate(date, format);
    };
    /**
     * 格式化数字
     */
    const formatNumber = (num, format = 'decimal') => {
        return manager.formatNumber(num, format);
    };
    /**
     * 获取翻译上下文
     */
    const getTranslationContext = () => {
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
        currentLocale: (0, vue_1.readonly)(state.currentLocale),
        currentLanguageInfo: state.currentLanguageInfo,
        isRTL: state.isRTL,
        availableLanguages: state.availableLanguages,
        initialized: (0, vue_1.readonly)(state.initialized),
        // 方法
        t,
        setLocale,
        formatDate,
        formatNumber,
        getTranslationContext
    };
}
exports.useI18n = useI18n;
/**
 * 简化的翻译函数Hook（用于简单场景）
 */
function useTranslation() {
    const { t } = useI18n();
    return { t };
}
exports.useTranslation = useTranslation;
/**
 * 语言切换Hook
 */
function useLanguageSwitch() {
    const { currentLocale, availableLanguages, setLocale } = useI18n();
    return {
        currentLocale,
        availableLanguages,
        setLocale
    };
}
exports.useLanguageSwitch = useLanguageSwitch;
/**
 * 数字和日期格式化Hook
 */
function useFormatters() {
    const { formatDate, formatNumber, currentLocale } = useI18n();
    return {
        formatDate,
        formatNumber,
        currentLocale
    };
}
exports.useFormatters = useFormatters;
/**
 * RTL布局Hook
 */
function useRTL() {
    const { isRTL, currentLocale } = useI18n();
    const getTextDirection = (0, vue_1.computed)(() => isRTL.value ? 'rtl' : 'ltr');
    const getFlexDirection = (0, vue_1.computed)(() => isRTL.value ? 'row-reverse' : 'row');
    const getTextAlign = (0, vue_1.computed)(() => isRTL.value ? 'right' : 'left');
    return {
        isRTL,
        currentLocale,
        textDirection: getTextDirection,
        flexDirection: getFlexDirection,
        textAlign: getTextAlign
    };
}
exports.useRTL = useRTL;
/**
 * 翻译状态监听Hook
 */
function useTranslationState() {
    const { currentLocale, initialized } = useI18n();
    // 语言变更事件
    const onLocaleChange = (callback) => {
        const manager = i18nManager || createI18n();
        return manager.onLocaleChanged((newLocale) => {
            callback(newLocale);
        });
    };
    // 翻译缺失事件
    const onTranslationMissing = (callback) => {
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
exports.useTranslationState = useTranslationState;
/**
 * 翻译预加载Hook
 */
function useTranslationPreloader() {
    const manager = i18nManager || createI18n();
    const preloadTranslations = async (locales) => {
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
exports.useTranslationPreloader = useTranslationPreloader;
/**
 * 翻译键验证Hook（开发环境使用）
 */
function useTranslationValidator() {
    const { t } = useI18n();
    const validateKey = (key) => {
        const result = t(key);
        // 如果返回的是键本身或错误格式，说明翻译缺失
        return !result.startsWith('[') || !result.endsWith(']') || result !== key;
    };
    const validateKeys = (keys) => {
        const valid = [];
        const invalid = [];
        keys.forEach(key => {
            if (validateKey(key)) {
                valid.push(key);
            }
            else {
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
exports.useTranslationValidator = useTranslationValidator;
/**
 * 翻译调试Hook（开发环境使用）
 */
function useTranslationDebug() {
    const { currentLocale } = useI18n();
    const logMissingTranslations = (0, vue_1.ref)([]);
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
        missingTranslations: (0, vue_1.readonly)(logMissingTranslations),
        clearMissingLog,
        exportMissingLog
    };
}
exports.useTranslationDebug = useTranslationDebug;
//# sourceMappingURL=useI18n.js.map
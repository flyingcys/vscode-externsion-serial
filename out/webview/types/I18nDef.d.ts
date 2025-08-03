/**
 * Internationalization Types for Serial-Studio VSCode Extension
 * 与Serial-Studio完全兼容的国际化类型定义
 */
/**
 * 支持的语言列表 - 与Serial-Studio完全一致
 */
export declare enum SupportedLocales {
    EN_US = "en_US",
    ES_MX = "es_MX",
    DE_DE = "de_DE",
    FR_FR = "fr_FR",
    IT_IT = "it_IT",
    JA_JP = "ja_JP",
    KO_KR = "ko_KR",
    PL_PL = "pl_PL",
    PT_BR = "pt_BR",
    RU_RU = "ru_RU",
    TR_TR = "tr_TR",
    ZH_CN = "zh_CN",
    CS_CZ = "cs_CZ",
    UK_UA = "uk_UA"
}
/**
 * 语言信息接口
 */
export interface LanguageInfo {
    /** 语言代码 */
    code: SupportedLocales;
    /** 语言的本地化名称 */
    nativeName: string;
    /** 语言的英文名称 */
    englishName: string;
    /** 是否为RTL语言 */
    isRTL: boolean;
    /** 语言的国家代码 */
    country: string;
    /** 语言的ISO 639-1代码 */
    iso639: string;
}
/**
 * 翻译消息接口
 */
export interface TranslationMessages {
    [key: string]: string | TranslationMessages;
}
/**
 * 翻译资源接口
 */
export interface TranslationResource {
    /** 语言代码 */
    locale: SupportedLocales;
    /** 翻译消息 */
    messages: TranslationMessages;
    /** 复数规则函数 */
    pluralRule?: (count: number) => string;
    /** 日期时间格式 */
    dateTimeFormats?: {
        short: Intl.DateTimeFormatOptions;
        medium: Intl.DateTimeFormatOptions;
        long: Intl.DateTimeFormatOptions;
    };
    /** 数字格式 */
    numberFormats?: {
        decimal: Intl.NumberFormatOptions;
        currency: Intl.NumberFormatOptions;
        percent: Intl.NumberFormatOptions;
    };
}
/**
 * 插值参数接口
 */
export interface InterpolationParams {
    [key: string]: string | number | boolean;
}
/**
 * 翻译函数类型
 */
export type TranslateFunction = (key: string, params?: InterpolationParams | (string | number)[], fallback?: string) => string;
/**
 * 翻译选项
 */
export interface TranslationOptions {
    /** 默认语言 */
    defaultLocale: SupportedLocales;
    /** 回退语言 */
    fallbackLocale: SupportedLocales;
    /** 是否启用复数 */
    enablePluralization: boolean;
    /** 是否启用插值 */
    enableInterpolation: boolean;
    /** 是否在生产环境显示缺失的翻译警告 */
    warnOnMissing: boolean;
    /** 缺失翻译时的默认值 */
    missingKeyHandler: (key: string, locale: SupportedLocales) => string;
}
/**
 * I18n配置接口
 */
export interface I18nConfig {
    /** 当前语言 */
    currentLocale: SupportedLocales;
    /** 选项 */
    options: TranslationOptions;
    /** 是否初始化完成 */
    initialized: boolean;
}
/**
 * 翻译上下文接口
 */
export interface TranslationContext {
    /** 当前翻译函数 */
    t: TranslateFunction;
    /** 当前语言代码 */
    locale: SupportedLocales;
    /** 当前语言信息 */
    localeInfo: LanguageInfo;
    /** 是否为RTL语言 */
    isRTL: boolean;
    /** 切换语言函数 */
    setLocale: (locale: SupportedLocales) => Promise<void>;
    /** 获取所有可用语言 */
    getAvailableLocales: () => LanguageInfo[];
    /** 格式化日期 */
    formatDate: (date: Date, format?: 'short' | 'medium' | 'long') => string;
    /** 格式化数字 */
    formatNumber: (num: number, format?: 'decimal' | 'currency' | 'percent') => string;
}
/**
 * 翻译事件接口
 */
export interface I18nEvents {
    /** 语言变更事件 */
    localeChanged: (newLocale: SupportedLocales, oldLocale: SupportedLocales) => void;
    /** 翻译资源加载事件 */
    resourceLoaded: (locale: SupportedLocales, resource: TranslationResource) => void;
    /** 翻译缺失事件 */
    translationMissing: (key: string, locale: SupportedLocales) => void;
}
/**
 * 翻译文件结构 - 兼容Qt TS格式
 */
export interface QtTranslationFile {
    /** XML版本和编码 */
    version: string;
    /** 语言代码 */
    language: string;
    /** 源语言代码 */
    sourcelanguage: string;
    /** 翻译上下文列表 */
    contexts: QtTranslationContext[];
}
/**
 * Qt翻译上下文
 */
export interface QtTranslationContext {
    /** 上下文名称 */
    name: string;
    /** 消息列表 */
    messages: QtTranslationMessage[];
}
/**
 * Qt翻译消息
 */
export interface QtTranslationMessage {
    /** 消息位置信息 */
    location: {
        filename: string;
        line: number;
    };
    /** 源文本 */
    source: string;
    /** 翻译文本 */
    translation: string;
    /** 翻译状态 */
    type?: 'unfinished' | 'finished' | 'obsolete';
}
/**
 * 翻译命名空间
 */
export interface TranslationNamespace {
    /** 命名空间名称 */
    namespace: string;
    /** 翻译消息 */
    messages: TranslationMessages;
}
/**
 * 异步翻译加载器接口
 */
export interface TranslationLoader {
    /** 加载翻译资源 */
    loadTranslation(locale: SupportedLocales): Promise<TranslationResource>;
    /** 检查翻译资源是否存在 */
    hasTranslation(locale: SupportedLocales): boolean;
    /** 获取支持的语言列表 */
    getSupportedLocales(): SupportedLocales[];
}
/**
 * 翻译缓存接口
 */
export interface TranslationCache {
    /** 获取缓存的翻译 */
    get(locale: SupportedLocales): TranslationResource | null;
    /** 设置翻译缓存 */
    set(locale: SupportedLocales, resource: TranslationResource): void;
    /** 清空缓存 */
    clear(): void;
    /** 检查是否有缓存 */
    has(locale: SupportedLocales): boolean;
}
/**
 * 语言检测器接口
 */
export interface LanguageDetector {
    /** 检测用户首选语言 */
    detect(): SupportedLocales;
    /** 从浏览器检测语言 */
    detectFromBrowser(): SupportedLocales;
    /** 从存储检测语言 */
    detectFromStorage(): SupportedLocales | null;
    /** 保存语言设置 */
    saveLanguage(locale: SupportedLocales): void;
}
//# sourceMappingURL=I18nDef.d.ts.map
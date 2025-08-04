/**
 * I18n Manager for Serial-Studio VSCode Extension
 * 完全兼容Serial-Studio的国际化管理器
 */
import { SupportedLocales, type LanguageInfo, type TranslationResource, type TranslateFunction, type TranslationOptions, type TranslationLoader, type TranslationCache, type LanguageDetector } from '../types/I18nDef';
/**
 * 翻译事件监听器类型
 */
type LocaleChangeListener = (newLocale: SupportedLocales, oldLocale: SupportedLocales) => void;
type ResourceLoadListener = (locale: SupportedLocales, resource: TranslationResource) => void;
type TranslationMissingListener = (key: string, locale: SupportedLocales) => void;
/**
 * I18n管理器主类
 */
export declare class I18nManager {
    private static instance;
    private config;
    private currentResource;
    private loader;
    private cache;
    private detector;
    private localeChangeListeners;
    private resourceLoadListeners;
    private translationMissingListeners;
    private constructor();
    /**
     * 获取I18n管理器单例
     */
    static getInstance(options?: Partial<TranslationOptions>, loader?: TranslationLoader, cache?: TranslationCache, detector?: LanguageDetector): I18nManager;
    /**
     * 重置单例实例 (主要用于测试)
     */
    static resetInstance(): void;
    /**
     * 初始化I18n系统
     */
    initialize(): Promise<void>;
    /**
     * 设置当前语言
     */
    setLocale(locale: SupportedLocales, save?: boolean): Promise<void>;
    /**
     * 获取当前语言
     */
    getCurrentLocale(): SupportedLocales;
    /**
     * 获取当前语言信息
     */
    getCurrentLanguageInfo(): LanguageInfo;
    /**
     * 检查当前语言是否为RTL
     */
    isCurrentRTL(): boolean;
    /**
     * 获取所有可用语言
     */
    getAvailableLanguages(): LanguageInfo[];
    /**
     * 翻译函数
     */
    t: TranslateFunction;
    /**
     * 格式化日期
     */
    formatDate: (date: Date, format?: 'short' | 'medium' | 'long') => string;
    /**
     * 格式化数字
     */
    formatNumber: (num: number, format?: 'decimal' | 'currency' | 'percent') => string;
    /**
     * 添加语言变更监听器
     */
    onLocaleChanged(listener: LocaleChangeListener): () => void;
    /**
     * 添加资源加载监听器
     */
    onResourceLoaded(listener: ResourceLoadListener): () => void;
    /**
     * 添加翻译缺失监听器
     */
    onTranslationMissing(listener: TranslationMissingListener): () => void;
    /**
     * 预加载翻译资源
     */
    preloadTranslations(locales: SupportedLocales[]): Promise<void>;
    /**
     * 清空翻译缓存
     */
    clearCache(): void;
    /**
     * 销毁I18n管理器
     */
    destroy(): void;
    /**
     * 根据键获取翻译
     */
    private getTranslationByKey;
    /**
     * 插值处理
     */
    private interpolate;
    /**
     * 应用RTL设置
     */
    private applyRTLSetting;
    /**
     * 通知语言变更
     */
    private notifyLocaleChanged;
    /**
     * 通知资源加载
     */
    private notifyResourceLoaded;
    /**
     * 通知翻译缺失
     */
    private notifyTranslationMissing;
}
export {};
//# sourceMappingURL=I18nManager.d.ts.map
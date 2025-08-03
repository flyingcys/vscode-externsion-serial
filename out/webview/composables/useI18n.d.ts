/**
 * Vue I18n Composable API
 * Vue国际化组合式API
 */
import { type Ref, type ComputedRef } from 'vue';
import { I18nManager } from '../i18n/I18nManager';
import type { SupportedLocales, LanguageInfo, TranslateFunction, TranslationContext } from '../types/I18nDef';
/**
 * I18n注入键
 */
export declare const I18N_INJECTION_KEY: unique symbol;
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
 * 创建I18n实例
 */
export declare function createI18n(): I18nManager;
/**
 * 提供I18n实例到Vue应用
 */
export declare function provideI18n(): I18nManager;
/**
 * Vue I18n组合式API
 */
export declare function useI18n(): UseI18nReturn;
/**
 * 简化的翻译函数Hook（用于简单场景）
 */
export declare function useTranslation(): {
    t: TranslateFunction;
};
/**
 * 语言切换Hook
 */
export declare function useLanguageSwitch(): {
    currentLocale: Ref<SupportedLocales>;
    availableLanguages: ComputedRef<LanguageInfo[]>;
    setLocale: (locale: SupportedLocales) => Promise<void>;
};
/**
 * 数字和日期格式化Hook
 */
export declare function useFormatters(): {
    formatDate: (date: Date, format?: "medium" | "short" | "long" | undefined) => string;
    formatNumber: (num: number, format?: "decimal" | "currency" | "percent" | undefined) => string;
    currentLocale: Ref<SupportedLocales>;
};
/**
 * RTL布局Hook
 */
export declare function useRTL(): {
    isRTL: ComputedRef<boolean>;
    currentLocale: Ref<SupportedLocales>;
    textDirection: ComputedRef<"rtl" | "ltr">;
    flexDirection: ComputedRef<"row-reverse" | "row">;
    textAlign: ComputedRef<"left" | "right">;
};
/**
 * 翻译状态监听Hook
 */
export declare function useTranslationState(): {
    currentLocale: Ref<SupportedLocales>;
    initialized: Ref<boolean>;
    onLocaleChange: (callback: (locale: SupportedLocales) => void) => () => void;
    onTranslationMissing: (callback: (key: string, locale: SupportedLocales) => void) => () => void;
};
/**
 * 翻译预加载Hook
 */
export declare function useTranslationPreloader(): {
    preloadTranslations: (locales: SupportedLocales[]) => Promise<void>;
    clearCache: () => void;
};
/**
 * 翻译键验证Hook（开发环境使用）
 */
export declare function useTranslationValidator(): {
    validateKey: (key: string) => boolean;
    validateKeys: (keys: string[]) => {
        valid: string[];
        invalid: string[];
    };
};
/**
 * 翻译调试Hook（开发环境使用）
 */
export declare function useTranslationDebug(): {
    currentLocale: Ref<SupportedLocales>;
    missingTranslations: Readonly<Ref<{
        key: string;
        locale: SupportedLocales;
        timestamp: Date;
    }[]>>;
    clearMissingLog: () => void;
    exportMissingLog: () => string;
};
export {};
//# sourceMappingURL=useI18n.d.ts.map
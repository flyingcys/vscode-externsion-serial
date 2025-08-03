/**
 * Language Information Data
 * 语言信息数据 - 与Serial-Studio完全兼容
 */
import { SupportedLocales, type LanguageInfo } from '../types/I18nDef';
/**
 * 所有支持的语言信息
 */
export declare const LANGUAGES: Record<SupportedLocales, LanguageInfo>;
/**
 * RTL语言列表（当前Serial-Studio不包含RTL语言，但为扩展性保留）
 */
export declare const RTL_LANGUAGES: SupportedLocales[];
/**
 * 默认语言
 */
export declare const DEFAULT_LOCALE = SupportedLocales.EN_US;
/**
 * 回退语言
 */
export declare const FALLBACK_LOCALE = SupportedLocales.EN_US;
/**
 * 获取语言信息
 */
export declare function getLanguageInfo(locale: SupportedLocales): LanguageInfo;
/**
 * 获取所有可用的语言信息
 */
export declare function getAllLanguages(): LanguageInfo[];
/**
 * 检查是否为支持的语言
 */
export declare function isSupportedLocale(locale: string): locale is SupportedLocales;
/**
 * 检查是否为RTL语言
 */
export declare function isRTLLanguage(locale: SupportedLocales): boolean;
/**
 * 根据浏览器语言获取最匹配的支持语言
 */
export declare function getMatchingLocale(browserLanguage: string): SupportedLocales;
/**
 * 复数规则函数映射
 */
export declare const PLURAL_RULES: Record<SupportedLocales, (count: number) => string>;
/**
 * 获取复数规则函数
 */
export declare function getPluralRule(locale: SupportedLocales): (count: number) => string;
//# sourceMappingURL=languages.d.ts.map
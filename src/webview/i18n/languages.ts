/**
 * Language Information Data
 * 语言信息数据 - 与Serial-Studio完全兼容
 */

import { SupportedLocales, type LanguageInfo } from '../types/I18nDef';

/**
 * 所有支持的语言信息
 */
export const LANGUAGES: Record<SupportedLocales, LanguageInfo> = {
  [SupportedLocales.EN_US]: {
    code: SupportedLocales.EN_US,
    nativeName: 'English',
    englishName: 'English (US)',
    isRTL: false,
    country: 'US',
    iso639: 'en'
  },
  
  [SupportedLocales.ES_MX]: {
    code: SupportedLocales.ES_MX,
    nativeName: 'Español',
    englishName: 'Spanish (Mexico)',
    isRTL: false,
    country: 'MX',
    iso639: 'es'
  },
  
  [SupportedLocales.DE_DE]: {
    code: SupportedLocales.DE_DE,
    nativeName: 'Deutsch',
    englishName: 'German (Germany)',
    isRTL: false,
    country: 'DE',
    iso639: 'de'
  },
  
  [SupportedLocales.FR_FR]: {
    code: SupportedLocales.FR_FR,
    nativeName: 'Français',
    englishName: 'French (France)',
    isRTL: false,
    country: 'FR',  
    iso639: 'fr'
  },
  
  [SupportedLocales.IT_IT]: {
    code: SupportedLocales.IT_IT,
    nativeName: 'Italiano',
    englishName: 'Italian (Italy)',
    isRTL: false,
    country: 'IT',
    iso639: 'it'
  },
  
  [SupportedLocales.JA_JP]: {
    code: SupportedLocales.JA_JP,
    nativeName: '日本語',
    englishName: 'Japanese (Japan)',
    isRTL: false,
    country: 'JP',
    iso639: 'ja'
  },
  
  [SupportedLocales.KO_KR]: {
    code: SupportedLocales.KO_KR,
    nativeName: '한국어',
    englishName: 'Korean (Korea)',
    isRTL: false,
    country: 'KR',
    iso639: 'ko'
  },
  
  [SupportedLocales.PL_PL]: {
    code: SupportedLocales.PL_PL,
    nativeName: 'Polski',
    englishName: 'Polish (Poland)',
    isRTL: false,
    country: 'PL',
    iso639: 'pl'
  },
  
  [SupportedLocales.PT_BR]: {
    code: SupportedLocales.PT_BR,
    nativeName: 'Português',
    englishName: 'Portuguese (Brazil)',
    isRTL: false,
    country: 'BR',
    iso639: 'pt'
  },
  
  [SupportedLocales.RU_RU]: {
    code: SupportedLocales.RU_RU,
    nativeName: 'Русский',
    englishName: 'Russian (Russia)',
    isRTL: false,
    country: 'RU',
    iso639: 'ru'
  },
  
  [SupportedLocales.TR_TR]: {
    code: SupportedLocales.TR_TR,
    nativeName: 'Türkçe',
    englishName: 'Turkish (Turkey)',
    isRTL: false,
    country: 'TR',
    iso639: 'tr'
  },
  
  [SupportedLocales.ZH_CN]: {
    code: SupportedLocales.ZH_CN,
    nativeName: '简体中文',
    englishName: 'Chinese (Simplified)',
    isRTL: false,
    country: 'CN',
    iso639: 'zh'
  },
  
  [SupportedLocales.CS_CZ]: {
    code: SupportedLocales.CS_CZ,
    nativeName: 'Čeština',
    englishName: 'Czech (Czech Republic)',
    isRTL: false,
    country: 'CZ',
    iso639: 'cs'
  },
  
  [SupportedLocales.UK_UA]: {
    code: SupportedLocales.UK_UA,
    nativeName: 'Українська',
    englishName: 'Ukrainian (Ukraine)',
    isRTL: false,
    country: 'UA',
    iso639: 'uk'
  }
};

/**
 * RTL语言列表（当前Serial-Studio不包含RTL语言，但为扩展性保留）
 */
export const RTL_LANGUAGES: SupportedLocales[] = [
  // 预留给未来可能支持的RTL语言
  // SupportedLocales.AR_SA, // Arabic (Saudi Arabia)
  // SupportedLocales.HE_IL, // Hebrew (Israel)
];

/**
 * 默认语言
 */
export const DEFAULT_LOCALE = SupportedLocales.EN_US;

/**
 * 回退语言
 */
export const FALLBACK_LOCALE = SupportedLocales.EN_US;

/**
 * 获取语言信息
 */
export function getLanguageInfo(locale: SupportedLocales): LanguageInfo {
  return LANGUAGES[locale] || LANGUAGES[DEFAULT_LOCALE];
}

/**
 * 获取所有可用的语言信息
 */
export function getAllLanguages(): LanguageInfo[] {
  return Object.values(LANGUAGES);
}

/**
 * 检查是否为支持的语言
 */
export function isSupportedLocale(locale: string): locale is SupportedLocales {
  return Object.values(SupportedLocales).includes(locale as SupportedLocales);
}

/**
 * 检查是否为RTL语言
 */
export function isRTLLanguage(locale: SupportedLocales): boolean {
  return RTL_LANGUAGES.includes(locale);
}

/**
 * 根据浏览器语言获取最匹配的支持语言
 */
export function getMatchingLocale(browserLanguage: string): SupportedLocales {
  // 直接匹配
  if (isSupportedLocale(browserLanguage)) {
    return browserLanguage as SupportedLocales;
  }
  
  // 匹配语言代码（忽略地区）
  const lang = browserLanguage.split('-')[0].toLowerCase();
  const locale = Object.values(SupportedLocales).find(supportedLocale => {
    return LANGUAGES[supportedLocale].iso639 === lang;
  });
  
  if (locale) {
    return locale;
  }
  
  // 特殊处理一些常见的浏览器语言代码
  const languageMap: Record<string, SupportedLocales> = {
    'en': SupportedLocales.EN_US,
    'es': SupportedLocales.ES_MX,
    'de': SupportedLocales.DE_DE,
    'fr': SupportedLocales.FR_FR,
    'it': SupportedLocales.IT_IT,
    'ja': SupportedLocales.JA_JP,
    'ko': SupportedLocales.KO_KR,
    'pl': SupportedLocales.PL_PL,
    'pt': SupportedLocales.PT_BR,
    'ru': SupportedLocales.RU_RU,
    'tr': SupportedLocales.TR_TR,
    'zh': SupportedLocales.ZH_CN,
    'cs': SupportedLocales.CS_CZ,
    'uk': SupportedLocales.UK_UA,
    
    // 其他常见变体
    'zh-cn': SupportedLocales.ZH_CN,
    'zh-hans': SupportedLocales.ZH_CN,
    'pt-br': SupportedLocales.PT_BR,
    'es-mx': SupportedLocales.ES_MX,
    'en-us': SupportedLocales.EN_US,
    'de-de': SupportedLocales.DE_DE,
    'fr-fr': SupportedLocales.FR_FR,
    'it-it': SupportedLocales.IT_IT,
    'ja-jp': SupportedLocales.JA_JP,
    'ko-kr': SupportedLocales.KO_KR,
    'pl-pl': SupportedLocales.PL_PL,
    'ru-ru': SupportedLocales.RU_RU,
    'tr-tr': SupportedLocales.TR_TR,
    'cs-cz': SupportedLocales.CS_CZ,
    'uk-ua': SupportedLocales.UK_UA
  };
  
  const normalized = browserLanguage.toLowerCase().replace('_', '-');
  return languageMap[normalized] || DEFAULT_LOCALE;
}

/**
 * 复数规则函数映射
 */
export const PLURAL_RULES: Record<SupportedLocales, (count: number) => string> = {
  // 英语：0-1用单数，其他用复数
  [SupportedLocales.EN_US]: (count: number) => count === 1 ? 'one' : 'other',
  
  // 西班牙语：0-1用单数，其他用复数  
  [SupportedLocales.ES_MX]: (count: number) => count === 1 ? 'one' : 'other',
  
  // 德语：0-1用单数，其他用复数
  [SupportedLocales.DE_DE]: (count: number) => count === 1 ? 'one' : 'other',
  
  // 法语：0-1用单数，其他用复数
  [SupportedLocales.FR_FR]: (count: number) => count <= 1 ? 'one' : 'other',
  
  // 意大利语：0-1用单数，其他用复数
  [SupportedLocales.IT_IT]: (count: number) => count === 1 ? 'one' : 'other',
  
  // 日语：无复数概念
  [SupportedLocales.JA_JP]: () => 'other',
  
  // 韩语：无复数概念
  [SupportedLocales.KO_KR]: () => 'other',
  
  // 波兰语：复杂的复数规则
  [SupportedLocales.PL_PL]: (count: number) => {
    if (count === 1) {return 'one';}
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {return 'few';}
    return 'many';
  },
  
  // 葡萄牙语：0-1用单数，其他用复数
  [SupportedLocales.PT_BR]: (count: number) => count <= 1 ? 'one' : 'other',
  
  // 俄语：复杂的复数规则
  [SupportedLocales.RU_RU]: (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {return 'one';}
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {return 'few';}
    return 'many';
  },
  
  // 土耳其语：无复数概念（语法复数不同）
  [SupportedLocales.TR_TR]: () => 'other',
  
  // 中文：无复数概念
  [SupportedLocales.ZH_CN]: () => 'other',
  
  // 捷克语：复杂的复数规则
  [SupportedLocales.CS_CZ]: (count: number) => {
    if (count === 1) {return 'one';}
    if (count >= 2 && count <= 4) {return 'few';}
    return 'many';
  },
  
  // 乌克兰语：类似俄语的复数规则
  [SupportedLocales.UK_UA]: (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {return 'one';}
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {return 'few';}
    return 'many';
  }
};

/**
 * 获取复数规则函数
 */
export function getPluralRule(locale: SupportedLocales): (count: number) => string {
  return PLURAL_RULES[locale] || PLURAL_RULES[DEFAULT_LOCALE];
}
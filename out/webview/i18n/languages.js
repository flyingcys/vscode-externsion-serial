"use strict";
/**
 * Language Information Data
 * 语言信息数据 - 与Serial-Studio完全兼容
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluralRule = exports.PLURAL_RULES = exports.getMatchingLocale = exports.isRTLLanguage = exports.isSupportedLocale = exports.getAllLanguages = exports.getLanguageInfo = exports.FALLBACK_LOCALE = exports.DEFAULT_LOCALE = exports.RTL_LANGUAGES = exports.LANGUAGES = void 0;
const I18nDef_1 = require("../types/I18nDef");
/**
 * 所有支持的语言信息
 */
exports.LANGUAGES = {
    [I18nDef_1.SupportedLocales.EN_US]: {
        code: I18nDef_1.SupportedLocales.EN_US,
        nativeName: 'English',
        englishName: 'English (US)',
        isRTL: false,
        country: 'US',
        iso639: 'en'
    },
    [I18nDef_1.SupportedLocales.ES_MX]: {
        code: I18nDef_1.SupportedLocales.ES_MX,
        nativeName: 'Español',
        englishName: 'Spanish (Mexico)',
        isRTL: false,
        country: 'MX',
        iso639: 'es'
    },
    [I18nDef_1.SupportedLocales.DE_DE]: {
        code: I18nDef_1.SupportedLocales.DE_DE,
        nativeName: 'Deutsch',
        englishName: 'German (Germany)',
        isRTL: false,
        country: 'DE',
        iso639: 'de'
    },
    [I18nDef_1.SupportedLocales.FR_FR]: {
        code: I18nDef_1.SupportedLocales.FR_FR,
        nativeName: 'Français',
        englishName: 'French (France)',
        isRTL: false,
        country: 'FR',
        iso639: 'fr'
    },
    [I18nDef_1.SupportedLocales.IT_IT]: {
        code: I18nDef_1.SupportedLocales.IT_IT,
        nativeName: 'Italiano',
        englishName: 'Italian (Italy)',
        isRTL: false,
        country: 'IT',
        iso639: 'it'
    },
    [I18nDef_1.SupportedLocales.JA_JP]: {
        code: I18nDef_1.SupportedLocales.JA_JP,
        nativeName: '日本語',
        englishName: 'Japanese (Japan)',
        isRTL: false,
        country: 'JP',
        iso639: 'ja'
    },
    [I18nDef_1.SupportedLocales.KO_KR]: {
        code: I18nDef_1.SupportedLocales.KO_KR,
        nativeName: '한국어',
        englishName: 'Korean (Korea)',
        isRTL: false,
        country: 'KR',
        iso639: 'ko'
    },
    [I18nDef_1.SupportedLocales.PL_PL]: {
        code: I18nDef_1.SupportedLocales.PL_PL,
        nativeName: 'Polski',
        englishName: 'Polish (Poland)',
        isRTL: false,
        country: 'PL',
        iso639: 'pl'
    },
    [I18nDef_1.SupportedLocales.PT_BR]: {
        code: I18nDef_1.SupportedLocales.PT_BR,
        nativeName: 'Português',
        englishName: 'Portuguese (Brazil)',
        isRTL: false,
        country: 'BR',
        iso639: 'pt'
    },
    [I18nDef_1.SupportedLocales.RU_RU]: {
        code: I18nDef_1.SupportedLocales.RU_RU,
        nativeName: 'Русский',
        englishName: 'Russian (Russia)',
        isRTL: false,
        country: 'RU',
        iso639: 'ru'
    },
    [I18nDef_1.SupportedLocales.TR_TR]: {
        code: I18nDef_1.SupportedLocales.TR_TR,
        nativeName: 'Türkçe',
        englishName: 'Turkish (Turkey)',
        isRTL: false,
        country: 'TR',
        iso639: 'tr'
    },
    [I18nDef_1.SupportedLocales.ZH_CN]: {
        code: I18nDef_1.SupportedLocales.ZH_CN,
        nativeName: '简体中文',
        englishName: 'Chinese (Simplified)',
        isRTL: false,
        country: 'CN',
        iso639: 'zh'
    },
    [I18nDef_1.SupportedLocales.CS_CZ]: {
        code: I18nDef_1.SupportedLocales.CS_CZ,
        nativeName: 'Čeština',
        englishName: 'Czech (Czech Republic)',
        isRTL: false,
        country: 'CZ',
        iso639: 'cs'
    },
    [I18nDef_1.SupportedLocales.UK_UA]: {
        code: I18nDef_1.SupportedLocales.UK_UA,
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
exports.RTL_LANGUAGES = [
// 预留给未来可能支持的RTL语言
// SupportedLocales.AR_SA, // Arabic (Saudi Arabia)
// SupportedLocales.HE_IL, // Hebrew (Israel)
];
/**
 * 默认语言
 */
exports.DEFAULT_LOCALE = I18nDef_1.SupportedLocales.EN_US;
/**
 * 回退语言
 */
exports.FALLBACK_LOCALE = I18nDef_1.SupportedLocales.EN_US;
/**
 * 获取语言信息
 */
function getLanguageInfo(locale) {
    return exports.LANGUAGES[locale] || exports.LANGUAGES[exports.DEFAULT_LOCALE];
}
exports.getLanguageInfo = getLanguageInfo;
/**
 * 获取所有可用的语言信息
 */
function getAllLanguages() {
    return Object.values(exports.LANGUAGES);
}
exports.getAllLanguages = getAllLanguages;
/**
 * 检查是否为支持的语言
 */
function isSupportedLocale(locale) {
    return Object.values(I18nDef_1.SupportedLocales).includes(locale);
}
exports.isSupportedLocale = isSupportedLocale;
/**
 * 检查是否为RTL语言
 */
function isRTLLanguage(locale) {
    return exports.RTL_LANGUAGES.includes(locale);
}
exports.isRTLLanguage = isRTLLanguage;
/**
 * 根据浏览器语言获取最匹配的支持语言
 */
function getMatchingLocale(browserLanguage) {
    // 直接匹配
    if (isSupportedLocale(browserLanguage)) {
        return browserLanguage;
    }
    // 匹配语言代码（忽略地区）
    const lang = browserLanguage.split('-')[0].toLowerCase();
    const locale = Object.values(I18nDef_1.SupportedLocales).find(supportedLocale => {
        return exports.LANGUAGES[supportedLocale].iso639 === lang;
    });
    if (locale) {
        return locale;
    }
    // 特殊处理一些常见的浏览器语言代码
    const languageMap = {
        'en': I18nDef_1.SupportedLocales.EN_US,
        'es': I18nDef_1.SupportedLocales.ES_MX,
        'de': I18nDef_1.SupportedLocales.DE_DE,
        'fr': I18nDef_1.SupportedLocales.FR_FR,
        'it': I18nDef_1.SupportedLocales.IT_IT,
        'ja': I18nDef_1.SupportedLocales.JA_JP,
        'ko': I18nDef_1.SupportedLocales.KO_KR,
        'pl': I18nDef_1.SupportedLocales.PL_PL,
        'pt': I18nDef_1.SupportedLocales.PT_BR,
        'ru': I18nDef_1.SupportedLocales.RU_RU,
        'tr': I18nDef_1.SupportedLocales.TR_TR,
        'zh': I18nDef_1.SupportedLocales.ZH_CN,
        'cs': I18nDef_1.SupportedLocales.CS_CZ,
        'uk': I18nDef_1.SupportedLocales.UK_UA,
        // 其他常见变体
        'zh-cn': I18nDef_1.SupportedLocales.ZH_CN,
        'zh-hans': I18nDef_1.SupportedLocales.ZH_CN,
        'pt-br': I18nDef_1.SupportedLocales.PT_BR,
        'es-mx': I18nDef_1.SupportedLocales.ES_MX,
        'en-us': I18nDef_1.SupportedLocales.EN_US,
        'de-de': I18nDef_1.SupportedLocales.DE_DE,
        'fr-fr': I18nDef_1.SupportedLocales.FR_FR,
        'it-it': I18nDef_1.SupportedLocales.IT_IT,
        'ja-jp': I18nDef_1.SupportedLocales.JA_JP,
        'ko-kr': I18nDef_1.SupportedLocales.KO_KR,
        'pl-pl': I18nDef_1.SupportedLocales.PL_PL,
        'ru-ru': I18nDef_1.SupportedLocales.RU_RU,
        'tr-tr': I18nDef_1.SupportedLocales.TR_TR,
        'cs-cz': I18nDef_1.SupportedLocales.CS_CZ,
        'uk-ua': I18nDef_1.SupportedLocales.UK_UA
    };
    const normalized = browserLanguage.toLowerCase().replace('_', '-');
    return languageMap[normalized] || exports.DEFAULT_LOCALE;
}
exports.getMatchingLocale = getMatchingLocale;
/**
 * 复数规则函数映射
 */
exports.PLURAL_RULES = {
    // 英语：0-1用单数，其他用复数
    [I18nDef_1.SupportedLocales.EN_US]: (count) => count === 1 ? 'one' : 'other',
    // 西班牙语：0-1用单数，其他用复数  
    [I18nDef_1.SupportedLocales.ES_MX]: (count) => count === 1 ? 'one' : 'other',
    // 德语：0-1用单数，其他用复数
    [I18nDef_1.SupportedLocales.DE_DE]: (count) => count === 1 ? 'one' : 'other',
    // 法语：0-1用单数，其他用复数
    [I18nDef_1.SupportedLocales.FR_FR]: (count) => count <= 1 ? 'one' : 'other',
    // 意大利语：0-1用单数，其他用复数
    [I18nDef_1.SupportedLocales.IT_IT]: (count) => count === 1 ? 'one' : 'other',
    // 日语：无复数概念
    [I18nDef_1.SupportedLocales.JA_JP]: () => 'other',
    // 韩语：无复数概念
    [I18nDef_1.SupportedLocales.KO_KR]: () => 'other',
    // 波兰语：复杂的复数规则
    [I18nDef_1.SupportedLocales.PL_PL]: (count) => {
        if (count === 1) {
            return 'one';
        }
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'few';
        }
        return 'many';
    },
    // 葡萄牙语：0-1用单数，其他用复数
    [I18nDef_1.SupportedLocales.PT_BR]: (count) => count <= 1 ? 'one' : 'other',
    // 俄语：复杂的复数规则
    [I18nDef_1.SupportedLocales.RU_RU]: (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'one';
        }
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'few';
        }
        return 'many';
    },
    // 土耳其语：无复数概念（语法复数不同）
    [I18nDef_1.SupportedLocales.TR_TR]: () => 'other',
    // 中文：无复数概念
    [I18nDef_1.SupportedLocales.ZH_CN]: () => 'other',
    // 捷克语：复杂的复数规则
    [I18nDef_1.SupportedLocales.CS_CZ]: (count) => {
        if (count === 1) {
            return 'one';
        }
        if (count >= 2 && count <= 4) {
            return 'few';
        }
        return 'many';
    },
    // 乌克兰语：类似俄语的复数规则
    [I18nDef_1.SupportedLocales.UK_UA]: (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'one';
        }
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'few';
        }
        return 'many';
    }
};
/**
 * 获取复数规则函数
 */
function getPluralRule(locale) {
    return exports.PLURAL_RULES[locale] || exports.PLURAL_RULES[exports.DEFAULT_LOCALE];
}
exports.getPluralRule = getPluralRule;
//# sourceMappingURL=languages.js.map
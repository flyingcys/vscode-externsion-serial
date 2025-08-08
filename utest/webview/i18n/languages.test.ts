/**
 * Languages 工具函数测试
 * 目标：100% 覆盖率，完整测试语言相关功能
 */

import { describe, test, expect } from 'vitest';

import { SupportedLocales } from '../../../src/webview/types/I18nDef';
import {
  LANGUAGES,
  RTL_LANGUAGES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  getLanguageInfo,
  getAllLanguages,
  isSupportedLocale,
  isRTLLanguage,
  getMatchingLocale,
  PLURAL_RULES,
  getPluralRule
} from '../../../src/webview/i18n/languages';

describe('Languages 工具函数测试', () => {
  
  describe('常量测试', () => {
    test('LANGUAGES 应该包含所有支持的语言', () => {
      const supportedLocales = Object.values(SupportedLocales);
      const languageKeys = Object.keys(LANGUAGES);
      
      expect(languageKeys.length).toBe(supportedLocales.length);
      supportedLocales.forEach(locale => {
        expect(LANGUAGES[locale]).toBeDefined();
        expect(LANGUAGES[locale].code).toBe(locale);
      });
    });

    test('每个语言信息应该包含必需的属性', () => {
      Object.values(LANGUAGES).forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('nativeName');
        expect(lang).toHaveProperty('englishName');
        expect(lang).toHaveProperty('isRTL');
        expect(lang).toHaveProperty('country');
        expect(lang).toHaveProperty('iso639');
        
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.nativeName).toBe('string');
        expect(typeof lang.englishName).toBe('string');
        expect(typeof lang.isRTL).toBe('boolean');
        expect(typeof lang.country).toBe('string');
        expect(typeof lang.iso639).toBe('string');
      });
    });

    test('DEFAULT_LOCALE 应该是有效的语言', () => {
      expect(DEFAULT_LOCALE).toBe(SupportedLocales.EN_US);
      expect(LANGUAGES[DEFAULT_LOCALE]).toBeDefined();
    });

    test('FALLBACK_LOCALE 应该是有效的语言', () => {
      expect(FALLBACK_LOCALE).toBe(SupportedLocales.EN_US);
      expect(LANGUAGES[FALLBACK_LOCALE]).toBeDefined();
    });

    test('RTL_LANGUAGES 应该是有效的数组', () => {
      expect(Array.isArray(RTL_LANGUAGES)).toBe(true);
      // 当前为空数组，因为Serial-Studio不包含RTL语言
      expect(RTL_LANGUAGES.length).toBe(0);
    });
  });

  describe('语言信息验证', () => {
    test('英语语言信息应该正确', () => {
      const en = LANGUAGES[SupportedLocales.EN_US];
      
      expect(en.code).toBe(SupportedLocales.EN_US);
      expect(en.nativeName).toBe('English');
      expect(en.englishName).toBe('English (US)');
      expect(en.isRTL).toBe(false);
      expect(en.country).toBe('US');
      expect(en.iso639).toBe('en');
    });

    test('中文语言信息应该正确', () => {
      const zh = LANGUAGES[SupportedLocales.ZH_CN];
      
      expect(zh.code).toBe(SupportedLocales.ZH_CN);
      expect(zh.nativeName).toBe('简体中文');
      expect(zh.englishName).toBe('Chinese (Simplified)');
      expect(zh.isRTL).toBe(false);
      expect(zh.country).toBe('CN');
      expect(zh.iso639).toBe('zh');
    });

    test('德语语言信息应该正确', () => {
      const de = LANGUAGES[SupportedLocales.DE_DE];
      
      expect(de.code).toBe(SupportedLocales.DE_DE);
      expect(de.nativeName).toBe('Deutsch');
      expect(de.englishName).toBe('German (Germany)');
      expect(de.isRTL).toBe(false);
      expect(de.country).toBe('DE');
      expect(de.iso639).toBe('de');
    });

    test('所有语言的 isRTL 都应该是 false', () => {
      Object.values(LANGUAGES).forEach(lang => {
        expect(lang.isRTL).toBe(false);
      });
    });
  });

  describe('getLanguageInfo 函数', () => {
    test('应该返回正确的语言信息', () => {
      const result = getLanguageInfo(SupportedLocales.ZH_CN);
      
      expect(result).toBe(LANGUAGES[SupportedLocales.ZH_CN]);
      expect(result.code).toBe(SupportedLocales.ZH_CN);
    });

    test('未知语言应该返回默认语言信息', () => {
      const result = getLanguageInfo('unknown' as SupportedLocales);
      
      expect(result).toBe(LANGUAGES[DEFAULT_LOCALE]);
    });
  });

  describe('getAllLanguages 函数', () => {
    test('应该返回所有语言信息', () => {
      const result = getAllLanguages();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(14);
      
      result.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('nativeName');
      });
    });

    test('返回的数组应该包含所有支持的语言', () => {
      const result = getAllLanguages();
      const codes = result.map(lang => lang.code);
      
      Object.values(SupportedLocales).forEach(locale => {
        expect(codes).toContain(locale);
      });
    });
  });

  describe('isSupportedLocale 函数', () => {
    test('支持的语言应该返回 true', () => {
      Object.values(SupportedLocales).forEach(locale => {
        expect(isSupportedLocale(locale)).toBe(true);
      });
    });

    test('不支持的语言应该返回 false', () => {
      expect(isSupportedLocale('invalid')).toBe(false);
      expect(isSupportedLocale('ar_SA')).toBe(false);
      expect(isSupportedLocale('he_IL')).toBe(false);
      expect(isSupportedLocale('')).toBe(false);
    });

    test('应该处理 null 和 undefined', () => {
      expect(isSupportedLocale(null as any)).toBe(false);
      expect(isSupportedLocale(undefined as any)).toBe(false);
    });
  });

  describe('isRTLLanguage 函数', () => {
    test('当前所有语言都应该返回 false', () => {
      Object.values(SupportedLocales).forEach(locale => {
        expect(isRTLLanguage(locale)).toBe(false);
      });
    });

    test('RTL_LANGUAGES 数组中的语言应该返回 true', () => {
      RTL_LANGUAGES.forEach(locale => {
        expect(isRTLLanguage(locale)).toBe(true);
      });
    });
  });

  describe('getMatchingLocale 函数', () => {
    test('完全匹配的语言应该直接返回', () => {
      expect(getMatchingLocale('en_US')).toBe(SupportedLocales.EN_US);
      expect(getMatchingLocale('zh_CN')).toBe(SupportedLocales.ZH_CN);
      expect(getMatchingLocale('de_DE')).toBe(SupportedLocales.DE_DE);
    });

    test('应该处理短语言代码', () => {
      expect(getMatchingLocale('en')).toBe(SupportedLocales.EN_US);
      expect(getMatchingLocale('zh')).toBe(SupportedLocales.ZH_CN);
      expect(getMatchingLocale('de')).toBe(SupportedLocales.DE_DE);
      expect(getMatchingLocale('fr')).toBe(SupportedLocales.FR_FR);
      expect(getMatchingLocale('ja')).toBe(SupportedLocales.JA_JP);
    });

    test('应该处理带连字符的语言代码', () => {
      expect(getMatchingLocale('en-US')).toBe(SupportedLocales.EN_US);
      expect(getMatchingLocale('zh-CN')).toBe(SupportedLocales.ZH_CN);
      expect(getMatchingLocale('zh-Hans')).toBe(SupportedLocales.ZH_CN);
      expect(getMatchingLocale('pt-BR')).toBe(SupportedLocales.PT_BR);
    });

    test('应该处理大小写变化', () => {
      expect(getMatchingLocale('EN')).toBe(SupportedLocales.EN_US);
      expect(getMatchingLocale('ZH')).toBe(SupportedLocales.ZH_CN);
      expect(getMatchingLocale('EN-US')).toBe(SupportedLocales.EN_US);
      expect(getMatchingLocale('zh-cn')).toBe(SupportedLocales.ZH_CN);
    });

    test('不匹配的语言应该返回默认语言', () => {
      expect(getMatchingLocale('invalid')).toBe(DEFAULT_LOCALE);
      expect(getMatchingLocale('ar')).toBe(DEFAULT_LOCALE);
      expect(getMatchingLocale('he')).toBe(DEFAULT_LOCALE);
      expect(getMatchingLocale('xx-XX')).toBe(DEFAULT_LOCALE);
    });

    test('应该处理空值和无效输入', () => {
      expect(getMatchingLocale('')).toBe(DEFAULT_LOCALE);
      expect(getMatchingLocale(null as any)).toBe(DEFAULT_LOCALE);
      expect(getMatchingLocale(undefined as any)).toBe(DEFAULT_LOCALE);
      expect(getMatchingLocale(123 as any)).toBe(DEFAULT_LOCALE);
    });

    test('应该处理特殊的语言变体', () => {
      expect(getMatchingLocale('zh-Hans-CN')).toBe(SupportedLocales.ZH_CN);
      expect(getMatchingLocale('en-GB')).toBe(SupportedLocales.EN_US); // 回退到 en_US
      expect(getMatchingLocale('pt')).toBe(SupportedLocales.PT_BR);    // 葡萄牙语回退到巴西葡语
    });
  });

  describe('PLURAL_RULES 常量', () => {
    test('应该包含所有支持语言的复数规则', () => {
      Object.values(SupportedLocales).forEach(locale => {
        expect(PLURAL_RULES[locale]).toBeDefined();
        expect(typeof PLURAL_RULES[locale]).toBe('function');
      });
    });

    test('英语复数规则应该正确', () => {
      const rule = PLURAL_RULES[SupportedLocales.EN_US];
      
      expect(rule(0)).toBe('other');
      expect(rule(1)).toBe('one');
      expect(rule(2)).toBe('other');
      expect(rule(10)).toBe('other');
    });

    test('法语复数规则应该正确', () => {
      const rule = PLURAL_RULES[SupportedLocales.FR_FR];
      
      expect(rule(0)).toBe('one');
      expect(rule(1)).toBe('one');
      expect(rule(2)).toBe('other');
      expect(rule(10)).toBe('other');
    });

    test('波兰语复数规则应该正确（复杂规则）', () => {
      const rule = PLURAL_RULES[SupportedLocales.PL_PL];
      
      expect(rule(1)).toBe('one');
      expect(rule(2)).toBe('few');
      expect(rule(3)).toBe('few');
      expect(rule(4)).toBe('few');
      expect(rule(5)).toBe('many');
      expect(rule(22)).toBe('few');
      expect(rule(112)).toBe('many'); // 12 在 10-20 范围内，应该是 many
    });

    test('俄语复数规则应该正确（复杂规则）', () => {
      const rule = PLURAL_RULES[SupportedLocales.RU_RU];
      
      expect(rule(1)).toBe('one');
      expect(rule(2)).toBe('few');
      expect(rule(3)).toBe('few');
      expect(rule(4)).toBe('few');
      expect(rule(5)).toBe('many');
      expect(rule(11)).toBe('many'); // 11 是特殊情况
      expect(rule(21)).toBe('one');  // 21 % 10 = 1，且 21 % 100 != 11
    });

    test('捷克语复数规则应该正确', () => {
      const rule = PLURAL_RULES[SupportedLocales.CS_CZ];
      
      expect(rule(1)).toBe('one');
      expect(rule(2)).toBe('few');
      expect(rule(3)).toBe('few');
      expect(rule(4)).toBe('few');
      expect(rule(5)).toBe('many');
      expect(rule(10)).toBe('many');
    });

    test('乌克兰语复数规则应该正确（类似俄语）', () => {
      const rule = PLURAL_RULES[SupportedLocales.UK_UA];
      
      expect(rule(1)).toBe('one');
      expect(rule(2)).toBe('few');
      expect(rule(3)).toBe('few');
      expect(rule(4)).toBe('few');
      expect(rule(5)).toBe('many');
      expect(rule(11)).toBe('many');
      expect(rule(21)).toBe('one');
    });

    test('无复数概念的语言应该返回 other', () => {
      const languages = [
        SupportedLocales.JA_JP,
        SupportedLocales.KO_KR,
        SupportedLocales.TR_TR,
        SupportedLocales.ZH_CN
      ];
      
      languages.forEach(locale => {
        const rule = PLURAL_RULES[locale];
        expect(rule(0)).toBe('other');
        expect(rule(1)).toBe('other');
        expect(rule(2)).toBe('other');
        expect(rule(100)).toBe('other');
      });
    });
  });

  describe('getPluralRule 函数', () => {
    test('应该返回 Intl.PluralRules 实例', () => {
      const result = getPluralRule(SupportedLocales.EN_US);
      
      expect(result).toBeInstanceOf(Intl.PluralRules);
    });

    test('应该处理不同的语言', () => {
      const locales = [
        SupportedLocales.EN_US,
        SupportedLocales.ZH_CN,
        SupportedLocales.DE_DE,
        SupportedLocales.FR_FR
      ];
      
      locales.forEach(locale => {
        const result = getPluralRule(locale);
        expect(result).toBeInstanceOf(Intl.PluralRules);
        
        // 测试基本功能
        expect(typeof result.select(1)).toBe('string');
        expect(['zero', 'one', 'two', 'few', 'many', 'other']).toContain(result.select(1));
      });
    });

    test('应该正确转换语言代码格式', () => {
      // 测试下划线转连字符的转换
      const result = getPluralRule(SupportedLocales.ZH_CN);
      expect(result).toBeInstanceOf(Intl.PluralRules);
    });

    test('不支持的语言应该抛出错误', () => {
      expect(() => getPluralRule('invalid' as SupportedLocales)).toThrow('Unsupported locale: invalid');
    });
  });

  describe('复数规则边界条件', () => {
    test('应该处理负数', () => {
      Object.values(PLURAL_RULES).forEach(rule => {
        expect(typeof rule(-1)).toBe('string');
        expect(typeof rule(-5)).toBe('string');
      });
    });

    test('应该处理零', () => {
      Object.values(PLURAL_RULES).forEach(rule => {
        expect(typeof rule(0)).toBe('string');
      });
    });

    test('应该处理大数', () => {
      Object.values(PLURAL_RULES).forEach(rule => {
        expect(typeof rule(1000)).toBe('string');
        expect(typeof rule(9999)).toBe('string');
      });
    });

    test('应该处理浮点数', () => {
      Object.values(PLURAL_RULES).forEach(rule => {
        expect(typeof rule(1.5)).toBe('string');
        expect(typeof rule(2.7)).toBe('string');
      });
    });
  });

  describe('语言映射完整性', () => {
    test('每个 SupportedLocales 枚举值都应该有对应的语言信息', () => {
      Object.values(SupportedLocales).forEach(locale => {
        expect(LANGUAGES[locale]).toBeDefined();
        expect(PLURAL_RULES[locale]).toBeDefined();
      });
    });

    test('语言信息的 code 应该与键匹配', () => {
      Object.entries(LANGUAGES).forEach(([key, value]) => {
        expect(value.code).toBe(key);
      });
    });

    test('所有 ISO 639-1 代码都应该是有效的', () => {
      const validIsoCodes = [
        'en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'zh', 'cs', 'uk'
      ];
      
      Object.values(LANGUAGES).forEach(lang => {
        expect(validIsoCodes).toContain(lang.iso639);
      });
    });

    test('所有国家代码都应该是有效的', () => {
      Object.values(LANGUAGES).forEach(lang => {
        expect(lang.country).toMatch(/^[A-Z]{2}$/);
        expect(lang.country.length).toBe(2);
      });
    });
  });
});
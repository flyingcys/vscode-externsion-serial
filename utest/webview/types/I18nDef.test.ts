/**
 * I18nDef 类型定义测试
 * 目标：100% 类型安全覆盖，验证接口兼容性
 */

import { describe, test, expect } from 'vitest';
import {
  SupportedLocales,
  LanguageInfo,
  TranslationMessages,
  TranslationResource,
  InterpolationParams,
  TranslateFunction,
  TranslationOptions,
  I18nConfig,
  TranslationContext,
  I18nEvents,
  QtTranslationFile,
  QtTranslationContext,
  QtTranslationMessage,
  TranslationNamespace,
  TranslationLoader,
  TranslationCache,
  LanguageDetector
} from '../../../src/webview/types/I18nDef';

describe('I18nDef 类型定义测试', () => {
  
  describe('SupportedLocales 枚举测试', () => {
    test('应该包含所有支持的语言代码', () => {
      expect(SupportedLocales.EN_US).toBe('en_US');
      expect(SupportedLocales.ES_MX).toBe('es_MX');
      expect(SupportedLocales.DE_DE).toBe('de_DE');
      expect(SupportedLocales.FR_FR).toBe('fr_FR');
      expect(SupportedLocales.IT_IT).toBe('it_IT');
      expect(SupportedLocales.JA_JP).toBe('ja_JP');
      expect(SupportedLocales.KO_KR).toBe('ko_KR');
      expect(SupportedLocales.PL_PL).toBe('pl_PL');
      expect(SupportedLocales.PT_BR).toBe('pt_BR');
      expect(SupportedLocales.RU_RU).toBe('ru_RU');
      expect(SupportedLocales.TR_TR).toBe('tr_TR');
      expect(SupportedLocales.ZH_CN).toBe('zh_CN');
      expect(SupportedLocales.CS_CZ).toBe('cs_CZ');
      expect(SupportedLocales.UK_UA).toBe('uk_UA');
    });

    test('应该有14种支持的语言', () => {
      const locales = Object.values(SupportedLocales);
      expect(locales.length).toBe(14);
    });
  });

  describe('LanguageInfo 接口测试', () => {
    test('应该创建有效的语言信息对象', () => {
      const langInfo: LanguageInfo = {
        code: SupportedLocales.EN_US,
        nativeName: 'English',
        englishName: 'English (United States)',
        isRTL: false,
        country: 'US',
        iso639: 'en'
      };

      expect(langInfo.code).toBe(SupportedLocales.EN_US);
      expect(langInfo.nativeName).toBe('English');
      expect(langInfo.englishName).toBe('English (United States)');
      expect(langInfo.isRTL).toBe(false);
      expect(langInfo.country).toBe('US');
      expect(langInfo.iso639).toBe('en');
    });

    test('应该支持RTL语言', () => {
      const arabicInfo: LanguageInfo = {
        code: SupportedLocales.EN_US, // 使用现有枚举值
        nativeName: 'العربية',
        englishName: 'Arabic',
        isRTL: true,
        country: 'SA',
        iso639: 'ar'
      };

      expect(arabicInfo.isRTL).toBe(true);
    });
  });

  describe('TranslationMessages 接口测试', () => {
    test('应该支持嵌套消息结构', () => {
      const messages: TranslationMessages = {
        'simple': 'Simple message',
        'nested': {
          'level1': 'Level 1 message',
          'level2': {
            'deep': 'Deep nested message'
          }
        }
      };

      expect(messages['simple']).toBe('Simple message');
      expect((messages['nested'] as TranslationMessages)['level1']).toBe('Level 1 message');
      expect(((messages['nested'] as TranslationMessages)['level2'] as TranslationMessages)['deep']).toBe('Deep nested message');
    });
  });

  describe('TranslationResource 接口测试', () => {
    test('应该创建有效的翻译资源', () => {
      const resource: TranslationResource = {
        locale: SupportedLocales.EN_US,
        messages: {
          'hello': 'Hello',
          'world': 'World'
        }
      };

      expect(resource.locale).toBe(SupportedLocales.EN_US);
      expect(resource.messages['hello']).toBe('Hello');
    });

    test('应该支持可选的格式化配置', () => {
      const resource: TranslationResource = {
        locale: SupportedLocales.EN_US,
        messages: {},
        pluralRule: (count: number) => count === 1 ? 'one' : 'other',
        dateTimeFormats: {
          short: { dateStyle: 'short' },
          medium: { dateStyle: 'medium' },
          long: { dateStyle: 'long' }
        },
        numberFormats: {
          decimal: { style: 'decimal' },
          currency: { style: 'currency', currency: 'USD' },
          percent: { style: 'percent' }
        }
      };

      expect(resource.pluralRule!(1)).toBe('one');
      expect(resource.pluralRule!(2)).toBe('other');
      expect(resource.dateTimeFormats?.short.dateStyle).toBe('short');
      expect(resource.numberFormats?.currency.currency).toBe('USD');
    });
  });

  describe('InterpolationParams 接口测试', () => {
    test('应该支持不同类型的参数', () => {
      const params: InterpolationParams = {
        name: 'John',
        age: 30,
        isActive: true
      };

      expect(params.name).toBe('John');
      expect(params.age).toBe(30);
      expect(params.isActive).toBe(true);
    });
  });

  describe('TranslateFunction 类型测试', () => {
    test('应该创建有效的翻译函数', () => {
      const t: TranslateFunction = (key: string, params?: InterpolationParams | (string | number)[], fallback?: string) => {
        if (key === 'hello') return 'Hello';
        if (key === 'name' && params) {
          if (Array.isArray(params)) {
            return `Hello ${params[0]}`;
          } else {
            return `Hello ${params.name}`;
          }
        }
        return fallback || key;
      };

      expect(t('hello')).toBe('Hello');
      expect(t('name', { name: 'John' })).toBe('Hello John');
      expect(t('name', ['Jane'])).toBe('Hello Jane');
      expect(t('unknown', undefined, 'Default')).toBe('Default');
    });
  });

  describe('TranslationOptions 接口测试', () => {
    test('应该创建有效的翻译选项', () => {
      const options: TranslationOptions = {
        defaultLocale: SupportedLocales.EN_US,
        fallbackLocale: SupportedLocales.EN_US,
        enablePluralization: true,
        enableInterpolation: true,
        warnOnMissing: true,
        missingKeyHandler: (key: string, locale: SupportedLocales) => `[Missing: ${key}]`
      };

      expect(options.defaultLocale).toBe(SupportedLocales.EN_US);
      expect(options.enablePluralization).toBe(true);
      expect(options.missingKeyHandler('test', SupportedLocales.EN_US)).toBe('[Missing: test]');
    });
  });

  describe('I18nConfig 接口测试', () => {
    test('应该创建有效的I18n配置', () => {
      const config: I18nConfig = {
        currentLocale: SupportedLocales.ZH_CN,
        options: {
          defaultLocale: SupportedLocales.EN_US,
          fallbackLocale: SupportedLocales.EN_US,
          enablePluralization: true,
          enableInterpolation: true,
          warnOnMissing: false,
          missingKeyHandler: (key) => key
        },
        initialized: true
      };

      expect(config.currentLocale).toBe(SupportedLocales.ZH_CN);
      expect(config.initialized).toBe(true);
    });
  });

  describe('TranslationContext 接口测试', () => {
    test('应该创建有效的翻译上下文', () => {
      const context: TranslationContext = {
        t: (key) => key,
        locale: SupportedLocales.EN_US,
        localeInfo: {
          code: SupportedLocales.EN_US,
          nativeName: 'English',
          englishName: 'English',
          isRTL: false,
          country: 'US',
          iso639: 'en'
        },
        isRTL: false,
        setLocale: async (locale) => { /* implementation */ },
        getAvailableLocales: () => [],
        formatDate: (date, format) => date.toISOString(),
        formatNumber: (num, format) => num.toString()
      };

      expect(context.locale).toBe(SupportedLocales.EN_US);
      expect(context.isRTL).toBe(false);
      expect(typeof context.setLocale).toBe('function');
      expect(typeof context.getAvailableLocales).toBe('function');
    });
  });

  describe('I18nEvents 接口测试', () => {
    test('应该定义有效的事件处理器', () => {
      const events: I18nEvents = {
        localeChanged: (newLocale, oldLocale) => {
          expect(typeof newLocale).toBe('string');
          expect(typeof oldLocale).toBe('string');
        },
        resourceLoaded: (locale, resource) => {
          expect(typeof locale).toBe('string');
          expect(typeof resource).toBe('object');
        },
        translationMissing: (key, locale) => {
          expect(typeof key).toBe('string');
          expect(typeof locale).toBe('string');
        }
      };

      events.localeChanged(SupportedLocales.EN_US, SupportedLocales.ZH_CN);
      events.resourceLoaded(SupportedLocales.EN_US, {
        locale: SupportedLocales.EN_US,
        messages: {}
      });
      events.translationMissing('test.key', SupportedLocales.EN_US);
    });
  });

  describe('Qt兼容性接口测试', () => {
    test('应该创建有效的Qt翻译文件结构', () => {
      const qtFile: QtTranslationFile = {
        version: '2.1',
        language: 'en_US',
        sourcelanguage: 'en',
        contexts: [
          {
            name: 'MainWindow',
            messages: [
              {
                location: {
                  filename: 'mainwindow.cpp',
                  line: 100
                },
                source: 'Hello World',
                translation: 'Hello World',
                type: 'finished'
              }
            ]
          }
        ]
      };

      expect(qtFile.version).toBe('2.1');
      expect(qtFile.contexts.length).toBe(1);
      expect(qtFile.contexts[0].messages[0].source).toBe('Hello World');
    });

    test('应该创建有效的Qt翻译上下文', () => {
      const context: QtTranslationContext = {
        name: 'Dialog',
        messages: []
      };

      expect(context.name).toBe('Dialog');
      expect(Array.isArray(context.messages)).toBe(true);
    });

    test('应该创建有效的Qt翻译消息', () => {
      const message: QtTranslationMessage = {
        location: {
          filename: 'dialog.cpp',
          line: 50
        },
        source: 'OK',
        translation: 'OK',
        type: 'unfinished'
      };

      expect(message.source).toBe('OK');
      expect(message.translation).toBe('OK');
      expect(message.type).toBe('unfinished');
    });
  });

  describe('扩展接口测试', () => {
    test('应该创建有效的翻译命名空间', () => {
      const namespace: TranslationNamespace = {
        namespace: 'widgets',
        messages: {
          'button.ok': 'OK',
          'button.cancel': 'Cancel'
        }
      };

      expect(namespace.namespace).toBe('widgets');
      expect(namespace.messages['button.ok']).toBe('OK');
    });

    test('应该创建有效的翻译加载器', () => {
      const loader: TranslationLoader = {
        loadTranslation: async (locale) => ({
          locale,
          messages: {}
        }),
        hasTranslation: (locale) => locale === SupportedLocales.EN_US,
        getSupportedLocales: () => [SupportedLocales.EN_US, SupportedLocales.ZH_CN]
      };

      expect(loader.hasTranslation(SupportedLocales.EN_US)).toBe(true);
      expect(loader.hasTranslation(SupportedLocales.DE_DE)).toBe(false);
      expect(loader.getSupportedLocales().length).toBe(2);
    });

    test('应该创建有效的翻译缓存', () => {
      const cache: TranslationCache = {
        get: (locale) => null,
        set: (locale, resource) => { /* implementation */ },
        clear: () => { /* implementation */ },
        has: (locale) => false
      };

      expect(cache.get(SupportedLocales.EN_US)).toBeNull();
      expect(cache.has(SupportedLocales.EN_US)).toBe(false);
      expect(typeof cache.set).toBe('function');
      expect(typeof cache.clear).toBe('function');
    });

    test('应该创建有效的语言检测器', () => {
      const detector: LanguageDetector = {
        detect: () => SupportedLocales.EN_US,
        detectFromBrowser: () => SupportedLocales.EN_US,
        detectFromStorage: () => null,
        saveLanguage: (locale) => { /* implementation */ }
      };

      expect(detector.detect()).toBe(SupportedLocales.EN_US);
      expect(detector.detectFromBrowser()).toBe(SupportedLocales.EN_US);
      expect(detector.detectFromStorage()).toBeNull();
      expect(typeof detector.saveLanguage).toBe('function');
    });
  });

  describe('类型兼容性测试', () => {
    test('翻译函数应该兼容不同的参数类型', () => {
      const t: TranslateFunction = (key, params, fallback) => {
        if (params && typeof params === 'object' && !Array.isArray(params)) {
          return `${key} with object params`;
        }
        if (params && Array.isArray(params)) {
          return `${key} with array params`;
        }
        return fallback || key;
      };

      expect(t('test', { name: 'John' })).toBe('test with object params');
      expect(t('test', ['John', 'Doe'])).toBe('test with array params');
      expect(t('test', undefined, 'fallback')).toBe('fallback');
    });

    test('TranslationMessages应该支持深度嵌套', () => {
      const deepMessages: TranslationMessages = {
        'level1': {
          'level2': {
            'level3': {
              'level4': 'Deep message'
            }
          }
        }
      };

      const level4 = ((((deepMessages['level1'] as TranslationMessages)['level2'] as TranslationMessages)['level3'] as TranslationMessages)['level4']);
      expect(level4).toBe('Deep message');
    });
  });

  describe('边界条件测试', () => {
    test('应该处理空的翻译资源', () => {
      const emptyResource: TranslationResource = {
        locale: SupportedLocales.EN_US,
        messages: {}
      };

      expect(Object.keys(emptyResource.messages).length).toBe(0);
    });

    test('应该处理复杂的插值参数', () => {
      const complexParams: InterpolationParams = {
        user: 'John',
        count: 42,
        active: true,
        score: 95.5,
        tags: 'important'
      };

      expect(complexParams.user).toBe('John');
      expect(complexParams.count).toBe(42);
      expect(complexParams.active).toBe(true);
      expect(complexParams.score).toBe(95.5);
    });

    test('应该处理所有翻译状态类型', () => {
      const messages: QtTranslationMessage[] = [
        {
          location: { filename: 'test.cpp', line: 1 },
          source: 'Test 1',
          translation: 'Test 1',
          type: 'finished'
        },
        {
          location: { filename: 'test.cpp', line: 2 },
          source: 'Test 2',
          translation: '',
          type: 'unfinished'
        },
        {
          location: { filename: 'test.cpp', line: 3 },
          source: 'Test 3',
          translation: 'Old Test 3',
          type: 'obsolete'
        },
        {
          location: { filename: 'test.cpp', line: 4 },
          source: 'Test 4',
          translation: 'Test 4'
          // type 可以是可选的
        }
      ];

      expect(messages[0].type).toBe('finished');
      expect(messages[1].type).toBe('unfinished');
      expect(messages[2].type).toBe('obsolete');
      expect(messages[3].type).toBeUndefined();
    });
  });
});
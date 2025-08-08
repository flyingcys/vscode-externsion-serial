/**
 * useI18n Composable 简化测试
 * 目标：100% 测试覆盖率，100% 通过率
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock I18nManager - 直接在工厂函数中创建
vi.mock('../../../src/webview/i18n/I18nManager', () => {
  const mockInstance = {
    getInstance: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    getCurrentLocale: vi.fn().mockReturnValue('en'),
    getCurrentLanguageInfo: vi.fn().mockReturnValue({
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false
    }),
    isCurrentRTL: vi.fn().mockReturnValue(false),
    getAvailableLanguages: vi.fn().mockReturnValue([
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
      { code: 'zh_CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false }
    ]),
    onLocaleChanged: vi.fn().mockImplementation(() => () => {}),
    t: vi.fn().mockImplementation((key) => `translated:${key}`),
    setLocale: vi.fn().mockResolvedValue(undefined),
    formatDate: vi.fn().mockReturnValue('2023/12/25'),
    formatNumber: vi.fn().mockReturnValue('1,234.56'),
    onTranslationMissing: vi.fn().mockImplementation(() => () => {}),
    preloadTranslations: vi.fn().mockResolvedValue(undefined),
    clearCache: vi.fn()
  };
  
  mockInstance.getInstance.mockReturnValue(mockInstance);
  
  return {
    I18nManager: mockInstance
  };
});

// Mock Vue
vi.mock('vue', () => ({
  ref: vi.fn((val) => ({ value: val })),
  computed: vi.fn((fn) => ({ get value() { return fn(); } })),
  readonly: vi.fn((val) => val),
  inject: vi.fn(() => null),
  provide: vi.fn()
}));

// Mock types
vi.mock('../../../src/webview/types/I18nDef', () => ({}));

// 导入测试目标和mock实例
import {
  I18N_INJECTION_KEY,
  createI18n,
  provideI18n,
  useI18n,
  useTranslation,
  useLanguageSwitch,
  useFormatters,
  useRTL,
  useTranslationState,
  useTranslationPreloader,
  useTranslationValidator,
  useTranslationDebug
} from '../../../src/webview/composables/useI18n';

import { I18nManager } from '../../../src/webview/i18n/I18nManager';

describe('useI18n Composable 简化测试', () => {
  const mockManager = vi.mocked(I18nManager);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本功能', () => {
    test('I18N_INJECTION_KEY应该是Symbol', () => {
      expect(typeof I18N_INJECTION_KEY).toBe('symbol');
    });

    test('createI18n应该创建管理器实例', () => {
      const manager = createI18n();
      expect(manager).toBeDefined();
    });

    test('provideI18n应该提供管理器', async () => {
      const vue = await import('vue');
      const manager = provideI18n();
      expect(vue.provide).toHaveBeenCalled();
      expect(manager).toBeDefined();
    });
  });

  describe('useI18n主函数', () => {
    test('应该返回完整API', () => {
      const api = useI18n();
      
      expect(api).toHaveProperty('currentLocale');
      expect(api).toHaveProperty('currentLanguageInfo');
      expect(api).toHaveProperty('isRTL');
      expect(api).toHaveProperty('availableLanguages');
      expect(api).toHaveProperty('initialized');
      expect(api).toHaveProperty('t');
      expect(api).toHaveProperty('setLocale');
      expect(api).toHaveProperty('formatDate');
      expect(api).toHaveProperty('formatNumber');
      expect(api).toHaveProperty('getTranslationContext');
    });

    test('t函数应该翻译文本', () => {
      const { t } = useI18n();
      const result = t('test.key');
      
      expect(result).toBe('translated:test.key');
    });

    test('setLocale应该设置语言', async () => {
      const { setLocale } = useI18n();
      await setLocale('zh_CN' as any);
      
      expect(mockManager.setLocale).toHaveBeenCalledWith('zh_CN');
    });

    test('formatDate应该格式化日期', () => {
      const { formatDate } = useI18n();
      const date = new Date('2023-12-25');
      const result = formatDate(date);
      
      expect(mockManager.formatDate).toHaveBeenCalledWith(date, 'medium');
      expect(result).toBe('2023/12/25');
    });

    test('formatNumber应该格式化数字', () => {
      const { formatNumber } = useI18n();
      const result = formatNumber(1234.56);
      
      expect(mockManager.formatNumber).toHaveBeenCalledWith(1234.56, 'decimal');
      expect(result).toBe('1,234.56');
    });

    test('getTranslationContext应该返回上下文', () => {
      const { getTranslationContext } = useI18n();
      const context = getTranslationContext();
      
      expect(context).toHaveProperty('t');
      expect(context).toHaveProperty('locale');
      expect(context).toHaveProperty('localeInfo');
      expect(context).toHaveProperty('isRTL');
      expect(context).toHaveProperty('setLocale');
      expect(context).toHaveProperty('getAvailableLocales');
      expect(context).toHaveProperty('formatDate');
      expect(context).toHaveProperty('formatNumber');
    });
  });

  describe('useTranslation Hook', () => {
    test('应该返回翻译函数', () => {
      const { t } = useTranslation();
      expect(typeof t).toBe('function');
      
      const result = t('test.key');
      expect(result).toBe('translated:test.key');
    });
  });

  describe('useLanguageSwitch Hook', () => {
    test('应该返回语言切换API', () => {
      const api = useLanguageSwitch();
      
      expect(api).toHaveProperty('currentLocale');
      expect(api).toHaveProperty('availableLanguages');
      expect(api).toHaveProperty('setLocale');
    });
  });

  describe('useFormatters Hook', () => {
    test('应该返回格式化API', () => {
      const api = useFormatters();
      
      expect(api).toHaveProperty('formatDate');
      expect(api).toHaveProperty('formatNumber');
      expect(api).toHaveProperty('currentLocale');
    });
  });

  describe('useRTL Hook', () => {
    test('应该返回RTL相关API', () => {
      const api = useRTL();
      
      expect(api).toHaveProperty('isRTL');
      expect(api).toHaveProperty('currentLocale');
      expect(api).toHaveProperty('textDirection');
      expect(api).toHaveProperty('flexDirection');
      expect(api).toHaveProperty('textAlign');
    });

    test('LTR语言应该返回正确方向', () => {
      mockManager.isCurrentRTL.mockReturnValue(false);
      const api = useRTL();
      
      expect(api.textDirection.value).toBe('ltr');
      expect(api.flexDirection.value).toBe('row');
      expect(api.textAlign.value).toBe('left');
    });

    test('RTL语言应该返回正确方向', () => {
      mockManager.isCurrentRTL.mockReturnValue(true);
      const api = useRTL();
      
      expect(api.textDirection.value).toBe('rtl');
      expect(api.flexDirection.value).toBe('row-reverse');
      expect(api.textAlign.value).toBe('right');
    });
  });

  describe('useTranslationState Hook', () => {
    test('应该返回翻译状态API', () => {
      const api = useTranslationState();
      
      expect(api).toHaveProperty('currentLocale');
      expect(api).toHaveProperty('initialized');
      expect(api).toHaveProperty('onLocaleChange');
      expect(api).toHaveProperty('onTranslationMissing');
    });

    test('onLocaleChange应该注册回调', () => {
      const { onLocaleChange } = useTranslationState();
      const callback = vi.fn();
      
      const unsubscribe = onLocaleChange(callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    test('onTranslationMissing应该注册回调', () => {
      const { onTranslationMissing } = useTranslationState();
      const callback = vi.fn();
      
      const unsubscribe = onTranslationMissing(callback);
      
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('useTranslationPreloader Hook', () => {
    test('应该返回预加载API', () => {
      const api = useTranslationPreloader();
      
      expect(api).toHaveProperty('preloadTranslations');
      expect(api).toHaveProperty('clearCache');
    });

    test('preloadTranslations应该预加载翻译', async () => {
      const { preloadTranslations } = useTranslationPreloader();
      const locales = ['en', 'zh'] as any[];
      
      await preloadTranslations(locales);
      
      expect(mockManager.preloadTranslations).toHaveBeenCalledWith(locales);
    });

    test('clearCache应该清空缓存', () => {
      const { clearCache } = useTranslationPreloader();
      
      clearCache();
      
      expect(mockManager.clearCache).toHaveBeenCalled();
    });
  });

  describe('useTranslationValidator Hook', () => {
    test('应该返回验证API', () => {
      const api = useTranslationValidator();
      
      expect(api).toHaveProperty('validateKey');
      expect(api).toHaveProperty('validateKeys');
    });

    test('validateKey应该验证翻译键', () => {
      mockManager.t.mockReturnValue('Valid Translation');
      
      const { validateKey } = useTranslationValidator();
      const result = validateKey('valid.key');
      
      expect(result).toBe(true);
    });

    test('validateKeys应该批量验证', () => {
      mockManager.t
        .mockReturnValueOnce('Valid Translation')
        .mockReturnValueOnce('[missing]')
        .mockReturnValueOnce('Another Valid Translation');
      
      const { validateKeys } = useTranslationValidator();
      const result = validateKeys(['valid1', '[missing]', 'valid2']);
      
      expect(result.valid).toContain('valid1');
      expect(result.valid).toContain('valid2');
    });
  });

  describe('useTranslationDebug Hook', () => {
    test('应该返回调试API', () => {
      const api = useTranslationDebug();
      
      expect(api).toHaveProperty('currentLocale');
      expect(api).toHaveProperty('missingTranslations');
      expect(api).toHaveProperty('clearMissingLog');
      expect(api).toHaveProperty('exportMissingLog');
    });

    test('clearMissingLog应该清空日志', () => {
      const { clearMissingLog, missingTranslations } = useTranslationDebug();
      
      clearMissingLog();
      
      expect(missingTranslations.value).toEqual([]);
    });

    test('exportMissingLog应该导出日志', () => {
      const { exportMissingLog } = useTranslationDebug();
      
      const result = exportMissingLog();
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('错误处理', () => {
    test('setLocale失败应该抛出错误', async () => {
      const error = new Error('Set locale failed');
      mockManager.setLocale.mockRejectedValue(error);
      
      const { setLocale } = useI18n();
      
      await expect(setLocale('invalid' as any)).rejects.toThrow(error);
    });
  });

  describe('边界条件', () => {
    test('应该处理空翻译键', () => {
      const { t } = useI18n();
      
      t('');
      
      expect(mockManager.t).toHaveBeenCalledWith('', undefined, undefined);
    });

    test('应该处理无效输入', () => {
      const { formatDate } = useI18n();
      const invalidDate = new Date('invalid');
      
      formatDate(invalidDate);
      
      expect(mockManager.formatDate).toHaveBeenCalled();
    });

    test('多次调用应该复用状态', () => {
      const api1 = useI18n();
      const api2 = useI18n();
      
      expect(api1.currentLocale).toBe(api2.currentLocale);
    });
  });
});
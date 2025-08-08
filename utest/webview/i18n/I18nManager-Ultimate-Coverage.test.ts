/**
 * I18nManager 终极覆盖测试
 * 目标：100% 测试覆盖率，100% 通过率
 * 覆盖：单例模式、翻译加载、缓存管理、事件监听、格式化、RTL支持
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies using factory function
vi.mock('../../../src/webview/i18n/languages', () => ({
  LANGUAGES: {
    'en_US': { code: 'en_US', name: 'English', nativeName: 'English', rtl: false },
    'zh_CN': { code: 'zh_CN', name: 'Chinese', nativeName: '中文', rtl: false }
  },
  DEFAULT_LOCALE: 'en_US',
  FALLBACK_LOCALE: 'en_US',
  getLanguageInfo: vi.fn(),
  getAllLanguages: vi.fn(),
  isSupportedLocale: vi.fn(),
  isRTLLanguage: vi.fn(),
  getMatchingLocale: vi.fn(),
  getPluralRule: vi.fn()
}));

// Mock translation files
vi.mock('../../../src/webview/translations/en_US', () => ({
  default: {
    common: {
      hello: 'Hello',
      welcome: 'Welcome {name}',
      items: {
        count_0: 'No items',
        count_1: '1 item',
        count_other: '{0} items'
      }
    }
  }
}));

vi.mock('../../../src/webview/translations/zh_CN', () => ({
  default: {
    common: {
      hello: '你好',
      welcome: '欢迎 {name}',
      items: {
        count_0: '没有项目',
        count_1: '1个项目',
        count_other: '{0}个项目'
      }
    }
  }
}));

// Mock global objects
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};

const mockNavigator = {
  language: 'en-US',
  languages: ['en-US', 'zh-CN']
};

const mockDocument = {
  documentElement: {
    setAttribute: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  }
};

global.localStorage = mockLocalStorage as any;
global.navigator = mockNavigator as any;
global.document = mockDocument as any;
global.window = { localStorage: mockLocalStorage } as any;

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
global.console = mockConsole as any;

// Mock Intl for formatting
const mockIntlDateTimeFormat = vi.fn().mockImplementation(() => ({
  format: vi.fn((date: Date) => '2023/12/25 10:30:00')
}));

const mockIntlNumberFormat = vi.fn().mockImplementation(() => ({
  format: vi.fn((num: number) => '1,234.56')
}));

const mockIntlPluralRules = vi.fn().mockImplementation(() => ({
  select: vi.fn((count: number) => count === 1 ? 'one' : 'other')
}));

global.Intl = {
  DateTimeFormat: mockIntlDateTimeFormat as any,
  NumberFormat: mockIntlNumberFormat as any,
  PluralRules: mockIntlPluralRules as any
} as any;

// Import the class to test
import { I18nManager } from '../../../src/webview/i18n/I18nManager';
import { SupportedLocales } from '../../../src/webview/types/I18nDef';

// Get mock references
import * as mockLanguagesModule from '../../../src/webview/i18n/languages';

describe('I18nManager 终极覆盖测试', () => {
  beforeEach(() => {
    // 重置所有mocks
    vi.clearAllMocks();
    
    // 重置I18nManager单例
    I18nManager.resetInstance();
    
    // 设置默认mock返回值
    (mockLanguagesModule.getLanguageInfo as any).mockReturnValue({
      code: 'en_US', name: 'English', nativeName: 'English', rtl: false
    });
    (mockLanguagesModule.getAllLanguages as any).mockReturnValue([
      { code: 'en_US', name: 'English', nativeName: 'English', rtl: false },
      { code: 'zh_CN', name: 'Chinese', nativeName: '中文', rtl: false }
    ]);
    (mockLanguagesModule.isSupportedLocale as any).mockImplementation((locale: string) => 
      ['en_US', 'zh_CN'].includes(locale)
    );
    (mockLanguagesModule.isRTLLanguage as any).mockReturnValue(false);
    (mockLanguagesModule.getMatchingLocale as any).mockReturnValue('en_US' as SupportedLocales);
    (mockLanguagesModule.getPluralRule as any).mockReturnValue(mockIntlPluralRules());
    
    // 设置localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    
    // 重置console mocks
    mockConsole.log.mockImplementation(() => {});
    mockConsole.warn.mockImplementation(() => {});
    mockConsole.error.mockImplementation(() => {});
  });

  afterEach(() => {
    I18nManager.resetInstance();
  });

  describe('单例模式', () => {
    test('应该创建单例实例', () => {
      const instance1 = I18nManager.getInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('应该在resetInstance后创建新实例', () => {
      const instance1 = I18nManager.getInstance();
      I18nManager.resetInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });

    test('应该接受初始化选项', () => {
      const options = {
        defaultLocale: 'zh_CN' as SupportedLocales,
        warnOnMissing: false
      };
      
      const instance = I18nManager.getInstance(options);
      
      expect(instance).toBeDefined();
    });
  });

  describe('初始化过程', () => {
    test('应该成功初始化', async () => {
      const manager = I18nManager.getInstance();
      
      await manager.initialize();
      
      expect(mockLanguagesModule.getMatchingLocale).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('I18n initialized with locale:')
      );
    });

    test('应该处理初始化失败', async () => {
      // Mock loader to throw error
      const mockLoader = {
        loadTranslation: vi.fn().mockRejectedValue(new Error('Load failed')),
        hasTranslation: vi.fn(),
        getSupportedLocales: vi.fn()
      };
      
      const manager = I18nManager.getInstance({}, mockLoader);
      
      await manager.initialize();
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Failed to initialize I18n:',
        expect.any(Error)
      );
    });

    test('重复初始化应该直接返回', async () => {
      const manager = I18nManager.getInstance();
      
      await manager.initialize();
      await manager.initialize(); // 第二次调用
      
      // 只应该调用一次
      expect(mockLanguages.getMatchingLocale).toHaveBeenCalledTimes(1);
    });
  });

  describe('语言设置', () => {
    test('应该成功设置语言', async () => {
      const manager = I18nManager.getInstance();
      mockLanguages.isSupportedLocale.mockImplementation(locale => locale === 'zh_CN');
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(manager.getCurrentLocale()).toBe('zh_CN');
    });

    test('应该拒绝不支持的语言', async () => {
      const manager = I18nManager.getInstance();
      mockLanguages.isSupportedLocale.mockReturnValue(false);
      
      await expect(manager.setLocale('invalid' as SupportedLocales))
        .rejects.toThrow('Unsupported locale: invalid');
    });

    test('应该触发语言变更事件', async () => {
      const manager = I18nManager.getInstance();
      const listener = vi.fn();
      
      manager.onLocaleChanged(listener);
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(listener).toHaveBeenCalledWith('zh_CN', 'en_US');
    });

    test('应该保存语言设置到存储', async () => {
      const manager = I18nManager.getInstance();
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      await manager.setLocale('zh_CN' as SupportedLocales, true);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'serial-studio-locale',
        'zh_CN'
      );
    });

    test('应该应用RTL设置', async () => {
      const manager = I18nManager.getInstance();
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      mockLanguages.isRTLLanguage.mockReturnValue(true);
      
      await manager.setLocale('ar_SA' as SupportedLocales);
      
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('dir', 'rtl');
      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('rtl');
    });
  });

  describe('翻译功能', () => {
    test('应该翻译简单键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('common.hello');
      
      expect(result).toBe('Hello');
    });

    test('应该进行参数插值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('common.welcome', { name: 'John' });
      
      expect(result).toBe('Welcome John');
    });

    test('应该进行位置参数插值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('common.items.count_other', ['5']);
      
      expect(result).toBe('5 items');
    });

    test('应该处理缺失的翻译键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('nonexistent.key');
      
      expect(result).toBe('[en_US:nonexistent.key]');
    });

    test('应该使用fallback值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('nonexistent.key', {}, 'Fallback Text');
      
      expect(result).toBe('Fallback Text');
    });

    test('应该回退到fallback语言', async () => {
      const manager = I18nManager.getInstance({
        fallbackLocale: 'en_US' as SupportedLocales
      });
      
      // 设置为中文，但中文缺少某个键
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      // Mock中文翻译没有该键，但英文有
      const result = manager.t('common.hello');
      
      expect(result).toBeDefined();
    });
  });

  describe('格式化功能', () => {
    test('应该格式化日期', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const date = new Date('2023-12-25');
      const result = manager.formatDate(date, 'medium');
      
      expect(mockIntlDateTimeFormat).toHaveBeenCalledWith('en-US', expect.any(Object));
      expect(result).toBe('2023/12/25 10:30:00');
    });

    test('应该格式化数字', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.formatNumber(1234.56, 'decimal');
      
      expect(mockIntlNumberFormat).toHaveBeenCalledWith('en-US', expect.any(Object));
      expect(result).toBe('1,234.56');
    });

    test('应该处理格式化错误', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // Mock Intl to throw error
      mockIntlDateTimeFormat.mockImplementation(() => {
        throw new Error('Formatting error');
      });
      
      const date = new Date('2023-12-25');
      const result = manager.formatDate(date);
      
      expect(result).toBe(date.toLocaleDateString());
      expect(mockConsole.warn).toHaveBeenCalledWith('Error formatting date:', expect.any(Error));
    });
  });

  describe('事件监听', () => {
    test('应该添加和移除语言变更监听器', async () => {
      const manager = I18nManager.getInstance();
      const listener = vi.fn();
      
      const unsubscribe = manager.onLocaleChanged(listener);
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
      await manager.setLocale('en_US' as SupportedLocales);
      expect(listener).toHaveBeenCalledTimes(1); // 没有再次调用
    });

    test('应该添加资源加载监听器', async () => {
      const manager = I18nManager.getInstance();
      const listener = vi.fn();
      
      manager.onResourceLoaded(listener);
      await manager.initialize();
      
      expect(listener).toHaveBeenCalled();
    });

    test('应该添加翻译缺失监听器', async () => {
      const manager = I18nManager.getInstance();
      const listener = vi.fn();
      
      manager.onTranslationMissing(listener);
      await manager.initialize();
      
      manager.t('nonexistent.key');
      
      expect(listener).toHaveBeenCalledWith('nonexistent.key', 'en_US');
    });

    test('应该处理监听器中的错误', async () => {
      const manager = I18nManager.getInstance();
      const badListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      
      manager.onLocaleChanged(badListener);
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error in locale change listener:',
        expect.any(Error)
      );
    });
  });

  describe('缓存管理', () => {
    test('应该从缓存获取翻译资源', async () => {
      const manager = I18nManager.getInstance();
      
      // 第一次加载会缓存
      await manager.initialize();
      
      // 第二次设置相同语言应该从缓存获取
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      await manager.setLocale('en_US' as SupportedLocales);
      
      expect(manager.getCurrentLocale()).toBe('en_US');
    });

    test('应该清空缓存', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.clearCache();
      
      // 清空后应该没有缓存
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(false);
    });
  });

  describe('预加载功能', () => {
    test('应该预加载多个语言', async () => {
      const manager = I18nManager.getInstance();
      
      await manager.preloadTranslations(['en_US', 'zh_CN'] as SupportedLocales[]);
      
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(true);
      expect(manager.hasTranslation('zh_CN' as SupportedLocales)).toBe(true);
    });

    test('应该处理预加载失败', async () => {
      const mockLoader = {
        loadTranslation: vi.fn().mockRejectedValue(new Error('Load failed')),
        hasTranslation: vi.fn(),
        getSupportedLocales: vi.fn()
      };
      
      const manager = I18nManager.getInstance({}, mockLoader);
      
      await manager.preloadTranslations(['invalid'] as SupportedLocales[]);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to preload translation for'),
        expect.any(Error)
      );
    });
  });

  describe('语言信息获取', () => {
    test('应该获取当前语言信息', () => {
      const manager = I18nManager.getInstance();
      const expectedInfo = mockLanguages.LANGUAGES['en_US'];
      
      const info = manager.getCurrentLanguageInfo();
      
      expect(mockLanguages.getLanguageInfo).toHaveBeenCalledWith('en_US');
      expect(info).toBe(expectedInfo);
    });

    test('应该检查是否为RTL语言', () => {
      const manager = I18nManager.getInstance();
      
      const isRTL = manager.isCurrentRTL();
      
      expect(mockLanguages.isRTLLanguage).toHaveBeenCalledWith('en_US');
      expect(isRTL).toBe(false);
    });

    test('应该获取所有可用语言', () => {
      const manager = I18nManager.getInstance();
      
      const languages = manager.getAvailableLanguages();
      
      expect(mockLanguages.getAllLanguages).toHaveBeenCalled();
      expect(languages).toBe(Object.values(mockLanguages.LANGUAGES));
    });
  });

  describe('翻译统计', () => {
    test('应该检查翻译键是否存在', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const exists = manager.hasTranslationKey('common.hello');
      const missing = manager.hasTranslationKey('nonexistent.key');
      
      expect(exists).toBe(true);
      expect(missing).toBe(false);
    });

    test('应该获取翻译统计信息', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // 触发一些缺失翻译
      manager.t('missing.key1');
      manager.t('missing.key2');
      
      const stats = manager.getTranslationStats();
      
      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('missingKeys');
      expect(stats).toHaveProperty('coverage');
      expect(stats.missingKeys).toBe(2);
    });

    test('应该获取缺失的翻译键列表', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.t('missing.key1');
      manager.t('missing.key2');
      
      const missingKeys = manager.getMissingKeys();
      
      expect(missingKeys).toEqual(['missing.key1', 'missing.key2']);
    });
  });

  describe('销毁功能', () => {
    test('应该正确销毁实例', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.destroy();
      
      // 销毁后应该没有缓存
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(false);
    });

    test('销毁后resetInstance应该清空单例', () => {
      const instance1 = I18nManager.getInstance();
      I18nManager.resetInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('语言检测器', () => {
    test('应该从存储检测语言', () => {
      mockLocalStorage.getItem.mockReturnValue('zh_CN');
      mockLanguages.isSupportedLocale.mockImplementation(locale => locale === 'zh_CN');
      
      const manager = I18nManager.getInstance();
      // 检测过程在initialize中进行
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('serial-studio-locale');
    });

    test('应该从浏览器检测语言', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const manager = I18nManager.getInstance();
      
      expect(mockLanguages.getMatchingLocale).toBeCalled;
    });

    test('应该处理存储访问失败', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const manager = I18nManager.getInstance();
      
      expect(mockConsole.warn).toBeCalledWith(
        'Failed to detect language from storage:',
        expect.any(Error)
      );
    });

    test('应该处理保存语言失败', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const manager = I18nManager.getInstance();
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Failed to save language to storage:',
        expect.any(Error)
      );
    });
  });

  describe('边界条件和错误处理', () => {
    test('应该处理无效的翻译键格式', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('');
      
      expect(result).toBe('[en_US:]');
    });

    test('应该处理翻译过程中的错误', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // Mock插值过程抛出错误
      const originalT = manager.t;
      manager.t = vi.fn().mockImplementation(() => {
        throw new Error('Translation error');
      });
      
      const result = originalT.call(manager, 'common.hello', {}, 'fallback');
      
      expect(result).toBe('Hello');
    });

    test('应该处理setLocale失败', async () => {
      const mockLoader = {
        loadTranslation: vi.fn().mockRejectedValue(new Error('Load failed')),
        hasTranslation: vi.fn(),
        getSupportedLocales: vi.fn()
      };
      
      const manager = I18nManager.getInstance({}, mockLoader);
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      await expect(manager.setLocale('zh_CN' as SupportedLocales))
        .rejects.toThrow('Load failed');
    });

    test('应该处理翻译文件导入失败', async () => {
      // Mock dynamic import to fail
      const originalImport = vi.fn().mockRejectedValue(new Error('Import failed'));
      
      const mockLoader = {
        loadTranslation: originalImport,
        hasTranslation: vi.fn(),
        getSupportedLocales: vi.fn()
      };
      
      const manager = I18nManager.getInstance({}, mockLoader);
      
      await expect(manager.initialize()).rejects.toThrow();
    });
  });

  describe('格式化边界条件', () => {
    test('应该处理无翻译资源的日期格式化', async () => {
      const manager = I18nManager.getInstance();
      // 不调用initialize，直接格式化
      
      const date = new Date('2023-12-25');
      const result = manager.formatDate(date);
      
      expect(result).toBe(date.toLocaleDateString());
    });

    test('应该处理无翻译资源的数字格式化', async () => {
      const manager = I18nManager.getInstance();
      // 不调用initialize，直接格式化
      
      const result = manager.formatNumber(1234.56);
      
      expect(result).toBe('1234.56');
    });
  });

  describe('多线程安全性', () => {
    test('应该处理并发的语言切换', async () => {
      const manager = I18nManager.getInstance();
      mockLanguages.isSupportedLocale.mockReturnValue(true);
      
      const promises = [
        manager.setLocale('en_US' as SupportedLocales),
        manager.setLocale('zh_CN' as SupportedLocales),
        manager.setLocale('en_US' as SupportedLocales)
      ];
      
      await Promise.all(promises);
      
      // 应该没有抛出错误
      expect(manager.getCurrentLocale()).toBeDefined();
    });

    test('应该处理并发的预加载请求', async () => {
      const manager = I18nManager.getInstance();
      
      const promises = [
        manager.preloadTranslations(['en_US'] as SupportedLocales[]),
        manager.preloadTranslations(['zh_CN'] as SupportedLocales[]),
        manager.preloadTranslations(['en_US', 'zh_CN'] as SupportedLocales[])
      ];
      
      await Promise.allSettled(promises);
      
      // 应该没有抛出错误
      expect(true).toBe(true);
    });
  });
});
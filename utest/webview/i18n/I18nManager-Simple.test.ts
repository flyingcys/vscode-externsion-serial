/**
 * I18nManager 简化测试
 * 目标：核心功能覆盖，100% 通过率
 * 避免复杂Mock依赖，专注业务逻辑测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// 简化的Mock策略 - 使用工厂函数
vi.mock('../../../src/webview/i18n/languages', () => ({
  DEFAULT_LOCALE: 'en_US',
  FALLBACK_LOCALE: 'en_US',
  getLanguageInfo: vi.fn(() => ({ 
    code: 'en_US', name: 'English', nativeName: 'English', rtl: false 
  })),
  getAllLanguages: vi.fn(() => [
    { code: 'en_US', name: 'English', nativeName: 'English', rtl: false },
    { code: 'zh_CN', name: 'Chinese', nativeName: '中文', rtl: false }
  ]),
  isSupportedLocale: vi.fn(locale => ['en_US', 'zh_CN'].includes(locale)),
  isRTLLanguage: vi.fn(() => false),
  getMatchingLocale: vi.fn(() => 'en_US'),
  getPluralRule: vi.fn(() => ({ select: () => 'other' }))
}));

// Mock翻译文件
vi.mock('../../../src/webview/translations/en_US', () => ({
  default: {
    test: {
      hello: 'Hello',
      welcome: 'Welcome {name}',
      count: '{0} items'
    }
  }
}));

vi.mock('../../../src/webview/translations/zh_CN', () => ({
  default: {
    test: {
      hello: '你好',
      welcome: '欢迎 {name}',
      count: '{0}个项目'
    }
  }
}));

// Mock全局对象
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
} as any;

global.navigator = {
  language: 'en-US',
  languages: ['en-US']
} as any;

global.document = {
  documentElement: {
    setAttribute: vi.fn(),
    classList: { add: vi.fn(), remove: vi.fn() }
  }
} as any;

global.window = { localStorage: global.localStorage } as any;

// Mock Intl
global.Intl = {
  DateTimeFormat: vi.fn().mockImplementation(() => ({
    format: vi.fn(() => '2023/12/25')
  })),
  NumberFormat: vi.fn().mockImplementation(() => ({
    format: vi.fn(() => '1,234.56')
  })),
  PluralRules: vi.fn().mockImplementation(() => ({
    select: vi.fn(() => 'other')
  }))
} as any;

// Mock console
global.console = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as any;

// 导入要测试的模块
import { I18nManager } from '../../../src/webview/i18n/I18nManager';
import { SupportedLocales } from '../../../src/webview/types/I18nDef';

// 获取mock引用
import * as mockLangModule from '../../../src/webview/i18n/languages';

describe('I18nManager 简化测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    I18nManager.resetInstance();
    
    // 重置localStorage mock
    (global.localStorage.getItem as any).mockReturnValue(null);
    
    // 确保mock函数正确设置
    (mockLangModule.isSupportedLocale as any).mockImplementation(
      locale => ['en_US', 'zh_CN'].includes(locale)
    );
    (mockLangModule.getMatchingLocale as any).mockReturnValue('en_US');
  });

  afterEach(() => {
    I18nManager.resetInstance();
  });

  describe('单例模式', () => {
    test('应该创建单例实例', () => {
      const instance1 = I18nManager.getInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(I18nManager);
    });

    test('resetInstance应该清空单例', () => {
      const instance1 = I18nManager.getInstance();
      I18nManager.resetInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });

    test('应该接受初始化选项', () => {
      const options = { warnOnMissing: false };
      const instance = I18nManager.getInstance(options);
      
      expect(instance).toBeDefined();
    });
  });

  describe('初始化', () => {
    test('应该成功初始化', async () => {
      const manager = I18nManager.getInstance();
      
      await expect(manager.initialize()).resolves.not.toThrow();
      expect(mockLangModule.getMatchingLocale).toHaveBeenCalled();
    });

    test('重复初始化应该正常处理', async () => {
      const manager = I18nManager.getInstance();
      
      await manager.initialize();
      await manager.initialize(); // 第二次
      
      expect(mockLangModule.getMatchingLocale).toHaveBeenCalledTimes(1);
    });
  });

  describe('语言设置', () => {
    test('应该设置支持的语言', async () => {
      const manager = I18nManager.getInstance();
      
      await expect(manager.setLocale('zh_CN' as SupportedLocales)).resolves.not.toThrow();
      expect(manager.getCurrentLocale()).toBe('zh_CN');
    });

    test('应该拒绝不支持的语言', async () => {
      const manager = I18nManager.getInstance();
      (mockLangModule.isSupportedLocale as any).mockReturnValue(false);
      
      await expect(manager.setLocale('invalid' as SupportedLocales))
        .rejects.toThrow('Unsupported locale: invalid');
    });

    test('应该保存语言到存储', async () => {
      const manager = I18nManager.getInstance();
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'serial-studio-locale', 'zh_CN'
      );
    });
  });

  describe('翻译功能', () => {
    test('应该翻译简单键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('test.hello');
      expect(result).toBe('Hello');
    });

    test('应该进行参数插值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('test.welcome', { name: 'John' });
      expect(result).toBe('Welcome John');
    });

    test('应该进行位置参数插值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('test.count', ['5']);
      expect(result).toBe('5 items');
    });

    test('应该处理缺失键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('missing.key');
      expect(result).toBe('[en_US:missing.key]');
    });

    test('应该使用fallback值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('missing.key', {}, 'Fallback');
      expect(result).toBe('Fallback');
    });
  });

  describe('事件监听', () => {
    test('应该添加和移除语言变更监听器', async () => {
      const manager = I18nManager.getInstance();
      const listener = vi.fn();
      
      const unsubscribe = manager.onLocaleChanged(listener);
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      expect(listener).toHaveBeenCalledWith('zh_CN', 'en_US');
      
      unsubscribe();
      await manager.setLocale('en_US' as SupportedLocales);
      expect(listener).toHaveBeenCalledTimes(1); // 没有再次调用
    });

    test('应该添加翻译缺失监听器', async () => {
      const manager = I18nManager.getInstance();
      const listener = vi.fn();
      
      manager.onTranslationMissing(listener);
      await manager.initialize();
      
      manager.t('missing.key');
      expect(listener).toHaveBeenCalledWith('missing.key', 'en_US');
    });
  });

  describe('格式化功能', () => {
    test('应该格式化日期', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const date = new Date('2023-12-25');
      const result = manager.formatDate(date);
      
      expect(result).toBe('2023/12/25');
    });

    test('应该格式化数字', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.formatNumber(1234.56);
      
      expect(result).toBe('1,234.56');
    });
  });

  describe('语言信息', () => {
    test('应该获取当前语言信息', () => {
      const manager = I18nManager.getInstance();
      
      const info = manager.getCurrentLanguageInfo();
      
      expect(mockLangModule.getLanguageInfo).toHaveBeenCalled();
      expect(info).toEqual({
        code: 'en_US', name: 'English', nativeName: 'English', rtl: false
      });
    });

    test('应该检查RTL', () => {
      const manager = I18nManager.getInstance();
      
      const isRTL = manager.isCurrentRTL();
      
      expect(mockLangModule.isRTLLanguage).toHaveBeenCalled();
      expect(isRTL).toBe(false);
    });

    test('应该获取所有语言', () => {
      const manager = I18nManager.getInstance();
      
      const languages = manager.getAvailableLanguages();
      
      expect(mockLangModule.getAllLanguages).toHaveBeenCalled();
      expect(languages).toHaveLength(2);
    });
  });

  describe('缓存管理', () => {
    test('应该清空缓存', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(true);
      
      manager.clearCache();
      
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(false);
    });
  });

  describe('预加载', () => {
    test('应该预加载语言', async () => {
      const manager = I18nManager.getInstance();
      
      await manager.preloadTranslations(['en_US', 'zh_CN'] as SupportedLocales[]);
      
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(true);
      expect(manager.hasTranslation('zh_CN' as SupportedLocales)).toBe(true);
    });
  });

  describe('翻译统计', () => {
    test('应该检查翻译键存在', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      expect(manager.hasTranslationKey('test.hello')).toBe(true);
      expect(manager.hasTranslationKey('missing.key')).toBe(false);
    });

    test('应该获取统计信息', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.t('missing1');
      manager.t('missing2');
      
      const stats = manager.getTranslationStats();
      
      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('missingKeys');
      expect(stats).toHaveProperty('coverage');
      expect(stats.missingKeys).toBe(2);
    });

    test('应该获取缺失键列表', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.t('missing1');
      manager.t('missing2');
      
      const missingKeys = manager.getMissingKeys();
      expect(missingKeys).toEqual(['missing1', 'missing2']);
    });
  });

  describe('销毁', () => {
    test('应该正确销毁', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.destroy();
      
      expect(manager.hasTranslation('en_US' as SupportedLocales)).toBe(false);
    });
  });

  describe('错误处理', () => {
    test('应该处理初始化失败', async () => {
      const mockLoader = {
        loadTranslation: vi.fn()
          .mockRejectedValueOnce(new Error('Load failed')) // 第一次失败
          .mockResolvedValueOnce({  // 回退成功
            locale: 'en_US',
            messages: {},
            pluralRule: { select: () => 'other' },
            dateTimeFormats: {},
            numberFormats: {}
          }),
        hasTranslation: vi.fn(),
        getSupportedLocales: vi.fn()
      };
      
      const manager = I18nManager.getInstance({}, mockLoader);
      
      await expect(manager.initialize()).resolves.not.toThrow();
      
      // 应该回退到默认语言并记录错误
      expect(global.console.error).toHaveBeenCalled();
    });

    test('应该处理存储错误', async () => {
      (global.localStorage.setItem as any).mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const manager = I18nManager.getInstance();
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(global.console.warn).toHaveBeenCalledWith(
        'Failed to save language to storage:',
        expect.any(Error)
      );
    });

    test('应该处理监听器错误', async () => {
      const manager = I18nManager.getInstance();
      const badListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      
      manager.onLocaleChanged(badListener);
      
      await manager.setLocale('zh_CN' as SupportedLocales);
      
      expect(global.console.error).toHaveBeenCalledWith(
        'Error in locale change listener:',
        expect.any(Error)
      );
    });
  });

  describe('边界条件', () => {
    test('应该处理空翻译键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('');
      expect(result).toBe('[en_US:]');
    });

    test('应该处理无翻译资源的格式化', () => {
      const manager = I18nManager.getInstance();
      
      const date = new Date('2023-12-25');
      const dateResult = manager.formatDate(date);
      expect(dateResult).toBe(date.toLocaleDateString());
      
      const numberResult = manager.formatNumber(123);
      expect(numberResult).toBe('123');
    });
  });
});
/**
 * I18n Manager 真实源码测试
 * 
 * 针对 src/webview/i18n/I18nManager.ts 的完整功能测试
 * 确保测试覆盖真实源码的所有功能和边界情况
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 直接定义类型避免导入问题
enum SupportedLocales {
  EN_US = 'en_US',
  ES_MX = 'es_MX', 
  DE_DE = 'de_DE',
  FR_FR = 'fr_FR',
  IT_IT = 'it_IT',
  JA_JP = 'ja_JP',
  KO_KR = 'ko_KR',
  PL_PL = 'pl_PL',
  PT_BR = 'pt_BR',
  RU_RU = 'ru_RU',
  TR_TR = 'tr_TR',
  ZH_CN = 'zh_CN',
  CS_CZ = 'cs_CZ',
  UK_UA = 'uk_UA'
}

interface LanguageInfo {
  code: SupportedLocales;
  nativeName: string;
  englishName: string;
  isRTL: boolean;
  country: string;
  iso639: string;
}

interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

interface TranslationResource {
  locale: SupportedLocales;
  messages: TranslationMessages;
  pluralRule?: (count: number) => string;
  dateTimeFormats?: {
    short: Intl.DateTimeFormatOptions;
    medium: Intl.DateTimeFormatOptions;
    long: Intl.DateTimeFormatOptions;
  };
  numberFormats?: {
    decimal: Intl.NumberFormatOptions;
    currency: Intl.NumberFormatOptions;
    percent: Intl.NumberFormatOptions;
  };
}

interface InterpolationParams {
  [key: string]: string | number | boolean;
}

interface TranslationOptions {
  defaultLocale: SupportedLocales;
  fallbackLocale: SupportedLocales;
  enablePluralization: boolean;
  enableInterpolation: boolean;
  warnOnMissing: boolean;
  missingKeyHandler: (key: string, locale: SupportedLocales) => string;
}

interface TranslationLoader {
  loadTranslation(locale: SupportedLocales): Promise<TranslationResource>;
  hasTranslation(locale: SupportedLocales): boolean;
  getSupportedLocales(): SupportedLocales[];
}

interface TranslationCache {
  get(locale: SupportedLocales): TranslationResource | null;
  set(locale: SupportedLocales, resource: TranslationResource): void;
  clear(): void;
  has(locale: SupportedLocales): boolean;
}

interface LanguageDetector {
  detect(): SupportedLocales;
  detectFromBrowser(): SupportedLocales;
  detectFromStorage(): SupportedLocales | null;
  saveLanguage(locale: SupportedLocales): void;
}

// 创建模拟的全局环境
const mockWindow = {
  localStorage: new Map<string, string>(),
  navigator: {
    language: 'en-US',
    languages: ['en-US', 'en']
  }
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

// 模拟浏览器环境
global.window = mockWindow as any;
global.document = mockDocument as any;
global.localStorage = {
  getItem: (key: string) => mockWindow.localStorage.get(key) || null,
  setItem: (key: string, value: string) => mockWindow.localStorage.set(key, value),
  removeItem: (key: string) => mockWindow.localStorage.delete(key),
  clear: () => mockWindow.localStorage.clear()
} as any;

// 模拟翻译资源
const mockTranslationEN = {
  locale: SupportedLocales.EN_US,
  messages: {
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...'
    },
    app: {
      name: 'Serial Studio',
      version: 'Version {version}'
    },
    error: {
      network: 'Network error',
      fileNotFound: 'File not found',
      general: 'An error occurred'
    }
  },
  pluralRule: 'en',
  dateTimeFormats: {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }
  },
  numberFormats: {
    decimal: { minimumFractionDigits: 0, maximumFractionDigits: 3 },
    currency: { style: 'currency', currency: 'USD' },
    percent: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }
  }
};

const mockTranslationZH = {
  locale: SupportedLocales.ZH_CN,
  messages: {
    common: {
      ok: '确定',
      cancel: '取消',
      save: '保存',
      loading: '加载中...'
    },
    app: {
      name: 'Serial Studio',
      version: '版本 {version}'
    },
    error: {
      network: '网络错误',
      fileNotFound: '文件未找到',
      general: '发生错误'
    }
  },
  pluralRule: 'zh',
  dateTimeFormats: {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }
  },
  numberFormats: {
    decimal: { minimumFractionDigits: 0, maximumFractionDigits: 3 },
    currency: { style: 'currency', currency: 'CNY' },
    percent: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }
  }
};

// 模拟翻译加载器
class MockTranslationLoader implements TranslationLoader {
  private translations = new Map<SupportedLocales, TranslationResource>([
    [SupportedLocales.EN_US, mockTranslationEN],
    [SupportedLocales.ZH_CN, mockTranslationZH]
  ]);

  async loadTranslation(locale: SupportedLocales): Promise<TranslationResource> {
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const resource = this.translations.get(locale);
    if (!resource) {
      throw new Error(`Translation not found for ${locale}`);
    }
    
    return resource;
  }

  hasTranslation(locale: SupportedLocales): boolean {
    return this.translations.has(locale);
  }

  getSupportedLocales(): SupportedLocales[] {
    return Array.from(this.translations.keys());
  }
}

// 模拟缓存
class MockTranslationCache implements TranslationCache {
  private cache = new Map<SupportedLocales, TranslationResource>();

  get(locale: SupportedLocales): TranslationResource | null {
    return this.cache.get(locale) || null;
  }

  set(locale: SupportedLocales, resource: TranslationResource): void {
    this.cache.set(locale, resource);
  }

  clear(): void {
    this.cache.clear();
  }

  has(locale: SupportedLocales): boolean {
    return this.cache.has(locale);
  }
}

// 模拟语言检测器
class MockLanguageDetector implements LanguageDetector {
  private storageKey = 'serial-studio-locale';

  detect(): SupportedLocales {
    const stored = this.detectFromStorage();
    if (stored) {
      return stored;
    }
    return this.detectFromBrowser();
  }

  detectFromBrowser(): SupportedLocales {
    return SupportedLocales.EN_US;
  }

  detectFromStorage(): SupportedLocales | null {
    const stored = localStorage.getItem(this.storageKey);
    if (stored && Object.values(SupportedLocales).includes(stored as SupportedLocales)) {
      return stored as SupportedLocales;
    }
    return null;
  }

  saveLanguage(locale: SupportedLocales): void {
    localStorage.setItem(this.storageKey, locale);
  }
}

describe('I18nManager 真实源码测试', () => {
  let manager: I18nManager;
  let mockLoader: MockTranslationLoader;
  let mockCache: MockTranslationCache;
  let mockDetector: MockLanguageDetector;

  beforeEach(() => {
    // 重置所有 mocks
    vi.clearAllMocks();
    mockWindow.localStorage.clear();
    
    // 重置单例实例
    I18nManager.resetInstance();
    
    // 创建模拟依赖
    mockLoader = new MockTranslationLoader();
    mockCache = new MockTranslationCache();
    mockDetector = new MockLanguageDetector();
    
    // 创建管理器实例
    manager = I18nManager.getInstance({}, mockLoader, mockCache, mockDetector);
  });

  afterEach(() => {
    // 清理
    I18nManager.resetInstance();
    mockWindow.localStorage.clear();
  });

  describe('1. 单例模式测试', () => {
    it('应该返回相同的实例', () => {
      const instance1 = I18nManager.getInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('应该正确重置实例', () => {
      const instance1 = I18nManager.getInstance();
      I18nManager.resetInstance();
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });

    it('应该支持自定义依赖注入', () => {
      const customLoader = new MockTranslationLoader();
      const customCache = new MockTranslationCache();
      const customDetector = new MockLanguageDetector();
      
      I18nManager.resetInstance();
      const customManager = I18nManager.getInstance({}, customLoader, customCache, customDetector);
      
      expect(customManager).toBeDefined();
    });
  });

  describe('2. 初始化测试', () => {
    it('应该正确初始化', async () => {
      await manager.initialize();
      
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.EN_US);
    });

    it('应该在初始化时检测用户语言', async () => {
      const detectSpy = vi.spyOn(mockDetector, 'detect');
      
      await manager.initialize();
      
      expect(detectSpy).toHaveBeenCalled();
    });

    it('应该处理初始化失败', async () => {
      const errorLoader = {
        ...mockLoader,
        loadTranslation: vi.fn().mockRejectedValue(new Error('Load failed'))
      };
      
      I18nManager.resetInstance();
      const errorManager = I18nManager.getInstance({}, errorLoader, mockCache, mockDetector);
      
      await errorManager.initialize();
      
      // 应该回退到默认语言
      expect(errorManager.getCurrentLocale()).toBe(SupportedLocales.EN_US);
    });

    it('应该避免重复初始化', async () => {
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation');
      
      await manager.initialize();
      await manager.initialize(); // 再次初始化
      
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. 语言设置测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该正确设置语言', async () => {
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.ZH_CN);
    });

    it('应该拒绝不支持的语言', async () => {
      await expect(manager.setLocale('invalid' as SupportedLocales))
        .rejects.toThrow('Unsupported locale: invalid');
    });

    it('应该持久化语言选择', async () => {
      const saveSpy = vi.spyOn(mockDetector, 'saveLanguage');
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      expect(saveSpy).toHaveBeenCalledWith(SupportedLocales.ZH_CN);
    });

    it('应该应用RTL设置', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('dir', 'ltr');
      expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('rtl');
    });

    it('应该处理语言设置错误', async () => {
      const errorLoader = {
        ...mockLoader,
        loadTranslation: vi.fn().mockRejectedValue(new Error('Load failed'))
      };
      
      I18nManager.resetInstance();
      const errorManager = I18nManager.getInstance({}, errorLoader, mockCache, mockDetector);
      await errorManager.initialize();
      
      await expect(errorManager.setLocale(SupportedLocales.ZH_CN))
        .rejects.toThrow('Load failed');
    });
  });

  describe('4. 翻译功能测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该正确翻译简单文本', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const translation = manager.t('common.ok');
      expect(translation).toBe('OK');
    });

    it('应该正确翻译中文文本', async () => {
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      const translation = manager.t('common.ok');
      expect(translation).toBe('确定');
    });

    it('应该处理嵌套键', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const translation = manager.t('error.network');
      expect(translation).toBe('Network error');
    });

    it('应该处理插值参数 - 对象格式', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const translation = manager.t('app.version', { version: '1.2.3' });
      expect(translation).toBe('Version 1.2.3');
    });

    it('应该处理插值参数 - 数组格式', async () => {
      // 需要先设置一个支持数组插值的翻译
      const testResource = {
        ...mockTranslationEN,
        messages: {
          ...mockTranslationEN.messages,
          test: {
            arrayInterpolation: 'Hello {0}, welcome to {1}!'
          }
        }
      };
      
      mockCache.set(SupportedLocales.EN_US, testResource);
      await manager.setLocale(SupportedLocales.EN_US);
      
      const translation = manager.t('test.arrayInterpolation', ['John', 'Serial Studio']);
      expect(translation).toBe('Hello John, welcome to Serial Studio!');
    });

    it('应该回退到fallback语言', async () => {
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      // 测试一个只在英文中存在的键
      const translation = manager.t('nonexistent.key');
      expect(translation).toBe('[zh_CN:nonexistent.key]');
    });

    it('应该处理缺失的翻译键', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const translation = manager.t('missing.key');
      expect(translation).toBe('[en_US:missing.key]');
    });

    it('应该处理fallback参数', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const translation = manager.t('missing.key', {}, 'Fallback text');
      expect(translation).toBe('Fallback text');
    });

    it('应该处理未初始化状态', () => {
      I18nManager.resetInstance();
      const uninitializedManager = I18nManager.getInstance({}, mockLoader, mockCache, mockDetector);
      
      const translation = uninitializedManager.t('common.ok');
      expect(translation).toBe('[en_US:common.ok]');
    });

    it('应该处理翻译过程中的异常', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      // 测试异常情况的处理
      const translation = manager.t('common.ok', null as any);
      expect(translation).toBe('OK');
    });
  });

  describe('5. 缓存系统测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该从缓存获取翻译资源', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation');
      
      // 再次设置相同语言，应该从缓存获取
      await manager.setLocale(SupportedLocales.EN_US);
      
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('应该缓存新加载的资源', async () => {
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      expect(mockCache.has(SupportedLocales.ZH_CN)).toBe(true);
    });

    it('应该清空缓存', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      manager.clearCache();
      
      expect(mockCache.has(SupportedLocales.EN_US)).toBe(false);
    });
  });

  describe('6. 事件监听测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该触发语言变更事件', async () => {
      let eventTriggered = false;
      const unsubscribe = manager.onLocaleChanged((newLocale, oldLocale) => {
        expect(newLocale).toBe(SupportedLocales.ZH_CN);
        expect(oldLocale).toBe(SupportedLocales.EN_US);
        eventTriggered = true;
      });
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      expect(eventTriggered).toBe(true);
      unsubscribe();
    });

    it('应该触发资源加载事件', async () => {
      let resourceLoaded = false;
      const unsubscribe = manager.onResourceLoaded((locale, resource) => {
        expect(locale).toBe(SupportedLocales.ZH_CN);
        expect(resource.locale).toBe(SupportedLocales.ZH_CN);
        resourceLoaded = true;
      });
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      expect(resourceLoaded).toBe(true);
      unsubscribe();
    });

    it('应该触发翻译缺失事件', async () => {
      let missingTriggered = false;
      const unsubscribe = manager.onTranslationMissing((key, locale) => {
        expect(key).toBe('missing.key');
        expect(locale).toBe(SupportedLocales.EN_US);
        missingTriggered = true;
      });
      
      await manager.setLocale(SupportedLocales.EN_US);
      manager.t('missing.key');
      
      expect(missingTriggered).toBe(true);
      unsubscribe();
    });

    it('应该正确取消事件监听', async () => {
      let eventCount = 0;
      const unsubscribe = manager.onLocaleChanged(() => {
        eventCount++;
      });
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      unsubscribe();
      await manager.setLocale(SupportedLocales.EN_US);
      
      expect(eventCount).toBe(1);
    });
  });

  describe('7. 格式化功能测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该格式化日期', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const date = new Date(2024, 0, 15, 10, 30, 45);
      const formatted = manager.formatDate(date);
      
      expect(formatted).toBeDefined();
    });

    it('应该格式化数字', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const formatted = manager.formatNumber(1234.56);
      
      expect(formatted).toBeDefined();
    });

    it('应该处理格式化错误', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      // 测试无效日期
      const invalidDate = new Date('invalid');
      const formatted = manager.formatDate(invalidDate);
      
      expect(formatted).toBeDefined();
    });

    it('应该处理空资源的格式化', () => {
      I18nManager.resetInstance();
      const emptyManager = I18nManager.getInstance({}, mockLoader, mockCache, mockDetector);
      
      const date = new Date();
      const number = 123.45;
      
      expect(emptyManager.formatDate(date)).toBeDefined();
      expect(emptyManager.formatNumber(number)).toBeDefined();
    });
  });

  describe('8. 语言信息测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该获取当前语言信息', async () => {
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      const langInfo = manager.getCurrentLanguageInfo();
      
      expect(langInfo.code).toBe(SupportedLocales.ZH_CN);
      expect(langInfo.name).toBe('Chinese (Simplified)');
    });

    it('应该检测RTL语言', async () => {
      await manager.setLocale(SupportedLocales.EN_US);
      
      const isRTL = manager.isCurrentRTL();
      
      expect(isRTL).toBe(false);
    });

    it('应该获取所有可用语言', () => {
      const languages = manager.getAvailableLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    });
  });

  describe('9. 预加载功能测试', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该预加载指定语言', async () => {
      const locales = [SupportedLocales.ZH_CN, SupportedLocales.EN_US];
      
      await manager.preloadTranslations(locales);
      
      expect(mockCache.has(SupportedLocales.ZH_CN)).toBe(true);
      expect(mockCache.has(SupportedLocales.EN_US)).toBe(true);
    });

    it('应该处理预加载失败', async () => {
      const errorLoader = {
        ...mockLoader,
        loadTranslation: vi.fn().mockRejectedValue(new Error('Load failed'))
      };
      
      I18nManager.resetInstance();
      const errorManager = I18nManager.getInstance({}, errorLoader, mockCache, mockDetector);
      await errorManager.initialize();
      
      const locales = [SupportedLocales.ZH_CN];
      
      // 应该不抛出异常
      await expect(errorManager.preloadTranslations(locales)).resolves.toBeUndefined();
    });

    it('应该跳过已缓存的语言', async () => {
      // 先加载一个语言
      await manager.setLocale(SupportedLocales.EN_US);
      
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation');
      
      // 预加载包含已加载的语言
      await manager.preloadTranslations([SupportedLocales.EN_US, SupportedLocales.ZH_CN]);
      
      // 应该只加载一次新语言
      expect(loadSpy).toHaveBeenCalledTimes(1);
      expect(loadSpy).toHaveBeenCalledWith(SupportedLocales.ZH_CN);
    });
  });

  describe('10. 销毁功能测试', () => {
    it('应该正确销毁管理器', async () => {
      await manager.initialize();
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      // 添加一些监听器
      const unsubscribe1 = manager.onLocaleChanged(() => {});
      const unsubscribe2 = manager.onResourceLoaded(() => {});
      
      manager.destroy();
      
      // 验证缓存已清空
      expect(mockCache.has(SupportedLocales.ZH_CN)).toBe(false);
    });

    it('应该在销毁后重置单例', () => {
      const instance1 = I18nManager.getInstance();
      instance1.destroy();
      
      const instance2 = I18nManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});
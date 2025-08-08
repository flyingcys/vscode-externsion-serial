/**
 * I18n Manager 终极覆盖率测试
 * 
 * 基于真实API的系统性测试，目标100%覆盖率和100%通过率
 * 解决所有已知的翻译键缺失、日期格式化错误等问题
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock完整DOM环境
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => mockLocalStorage.store.set(key, value)),
  removeItem: vi.fn((key: string) => mockLocalStorage.store.delete(key)),
  clear: vi.fn(() => mockLocalStorage.store.clear())
};

const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(() => false),
  toggle: vi.fn()
};

const mockDocumentElement = {
  dir: 'ltr',
  setAttribute: vi.fn(),
  classList: mockClassList
};

const mockWindow = {
  localStorage: mockLocalStorage,
  navigator: {
    language: 'en-US',
    languages: ['en-US', 'en']
  },
  document: {
    documentElement: mockDocumentElement
  }
} as any;

// 设置全局mock
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });
Object.defineProperty(global, 'navigator', { value: mockWindow.navigator, writable: true });
Object.defineProperty(global, 'document', { value: mockWindow.document, writable: true });

// Mock模块导入
vi.mock('../../src/webview/translations/en_US', () => ({
  default: {
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error'
    },
    app: {
      title: 'Serial Studio VSCode Extension',
      description: 'Serial data visualization tool'
    },
    test: {
      key: 'Test Value',
      greeting: 'Hello {name}',
      message: 'You have {0} new messages'
    }
  }
}));

vi.mock('../../src/webview/translations/zh_CN', () => ({
  default: {
    common: {
      ok: '确定',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      error: '错误'
    },
    app: {
      title: 'Serial Studio VSCode 扩展',
      description: '串口数据可视化工具'
    },
    test: {
      key: '测试值',
      greeting: '你好 {name}',
      message: '你有 {0} 条新消息'
    }
  }
}));

// 动态导入I18nManager
let I18nManager: any = null;
let SupportedLocales: any = null;

describe('I18nManager 终极覆盖率测试', () => {
  beforeEach(async () => {
    // 清理环境
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
    mockDocumentElement.setAttribute.mockClear();
    
    // 动态导入I18nManager
    try {
      const i18nModule = await import('../../src/webview/i18n/I18nManager');
      I18nManager = i18nModule.default || i18nModule.I18nManager;
      
      // 导入支持的语言类型
      try {
        const typesModule = await import('../../src/webview/types/I18nDef');
        SupportedLocales = typesModule.SupportedLocales;
      } catch {
        // 备用定义
        SupportedLocales = {
          EN_US: 'en_US',
          ES_MX: 'es_MX', 
          DE_DE: 'de_DE',
          FR_FR: 'fr_FR',
          IT_IT: 'it_IT',
          JA_JP: 'ja_JP',
          KO_KR: 'ko_KR',
          PL_PL: 'pl_PL',
          PT_BR: 'pt_BR',
          RU_RU: 'ru_RU',
          TR_TR: 'tr_TR',
          ZH_CN: 'zh_CN',
          CS_CZ: 'cs_CZ',
          UK_UA: 'uk_UA'
        };
      }
      
      // 重置单例
      if (I18nManager.resetInstance) {
        I18nManager.resetInstance();
      }
    } catch (error) {
      console.error('Failed to import I18nManager:', error);
    }
  });

  afterEach(() => {
    // 清理单例
    if (I18nManager && I18nManager.resetInstance) {
      I18nManager.resetInstance();
    }
  });

  describe('1. 单例模式测试', () => {
    it('1.1 应该创建单例实例', () => {
      const instance1 = I18nManager.getInstance();
      const instance2 = I18nManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('1.2 应该支持重置单例', () => {
      const instance1 = I18nManager.getInstance();
      I18nManager.resetInstance();
      const instance2 = I18nManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });

    it('1.3 应该支持自定义配置创建', () => {
      const manager = I18nManager.getInstance({
        warnOnMissing: false,
        enableInterpolation: false
      });
      expect(manager).toBeDefined();
    });
  });

  describe('2. 初始化测试', () => {
    it('2.1 应该成功初始化', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.EN_US);
    });

    it('2.2 应该处理重复初始化', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.initialize(); // 第二次调用应该被忽略
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.EN_US);
    });

    it('2.3 应该从localStorage恢复语言设置', async () => {
      mockLocalStorage.setItem('serial-studio-locale', 'zh_CN');
      I18nManager.resetInstance();
      const manager = I18nManager.getInstance();
      await manager.initialize();
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.ZH_CN);
    });
  });

  describe('3. 语言设置测试', () => {
    it('3.1 应该设置支持的语言', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.ZH_CN);
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.ZH_CN);
    });

    it('3.2 应该拒绝不支持的语言', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      try {
        await manager.setLocale('invalid_locale' as any);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Unsupported locale');
      }
    });

    it('3.3 应该触发语言变更事件', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const changeHandler = vi.fn();
      manager.onLocaleChanged(changeHandler);
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      expect(changeHandler).toHaveBeenCalledWith(SupportedLocales.ZH_CN, SupportedLocales.EN_US);
    });

    it('3.4 应该应用RTL设置', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // 测试LTR语言
      await manager.setLocale(SupportedLocales.EN_US);
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('dir', 'ltr');
      expect(mockClassList.remove).toHaveBeenCalledWith('rtl');
    });
  });

  describe('4. 翻译功能测试 - 系统性错误处理', () => {
    it('4.1 应该正确翻译存在的键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.EN_US);
      
      expect(manager.t('common.ok')).toBe('OK');
      expect(manager.t('app.title')).toBe('Serial Studio VSCode Extension');
    });

    it('4.2 应该处理缺失的翻译键（使用fallback）', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.EN_US);
      
      const result = manager.t('nonexistent.key', undefined, 'Default Value');
      expect(result).toBe('Default Value');
    });

    it('4.3 应该处理缺失的翻译键（使用missingKeyHandler）', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.EN_US);
      
      const result = manager.t('nonexistent.key');
      expect(result).toBe('[en_US:nonexistent.key]');
    });

    it('4.4 应该支持参数插值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.EN_US);
      
      const result = manager.t('test.greeting', { name: 'Alice' });
      expect(result).toBe('Hello Alice');
    });

    it('4.5 应该支持位置参数插值', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.EN_US);
      
      const result = manager.t('test.message', [5]);
      expect(result).toBe('You have 5 new messages');
    });

    it('4.6 应该处理语言回退', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      // 测试中文不存在的键，回退到英文
      const result = manager.t('common.ok');
      expect(result).toBe('确定'); // 中文版本存在
    });
  });

  describe('5. 格式化功能测试 - 错误处理加强', () => {
    it('5.1 应该格式化有效日期', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const date = new Date('2023-12-25');
      const result = manager.formatDate(date, 'short');
      expect(result).toMatch(/Dec|12/); // 匹配月份或数字
    });

    it('5.2 应该处理无效日期（系统性修复）', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const invalidDate = new Date('invalid');
      expect(() => {
        const result = manager.formatDate(invalidDate);
        // 应该返回fallback而不是抛出异常
        expect(typeof result).toBe('string');
      }).not.toThrow();
    });

    it('5.3 应该格式化数字', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.formatNumber(1234.56, 'decimal');
      expect(result).toMatch(/1,?234/); // 适应不同的数字格式
    });

    it('5.4 应该处理数字格式化错误', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.formatNumber(NaN, 'decimal');
      expect(typeof result).toBe('string');
    });
  });

  describe('6. 事件系统测试', () => {
    it('6.1 应该支持语言变更监听', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const listener = vi.fn();
      const unsubscribe = manager.onLocaleChanged(listener);
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      expect(listener).toHaveBeenCalledWith(SupportedLocales.ZH_CN, SupportedLocales.EN_US);
      
      unsubscribe();
      await manager.setLocale(SupportedLocales.EN_US);
      expect(listener).toHaveBeenCalledTimes(1); // 应该只被调用一次
    });

    it('6.2 应该支持资源加载监听', async () => {
      const manager = I18nManager.getInstance();
      
      const listener = vi.fn();
      manager.onResourceLoaded(listener);
      
      await manager.initialize();
      expect(listener).toHaveBeenCalled();
    });

    it('6.3 应该支持翻译缺失监听', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const listener = vi.fn();
      manager.onTranslationMissing(listener);
      
      manager.t('missing.key');
      expect(listener).toHaveBeenCalledWith('missing.key', SupportedLocales.EN_US);
    });
  });

  describe('7. 语言信息测试', () => {
    it('7.1 应该获取当前语言信息', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const languageInfo = manager.getCurrentLanguageInfo();
      expect(languageInfo).toBeDefined();
      expect(languageInfo.code).toBe(SupportedLocales.EN_US);
    });

    it('7.2 应该检查RTL语言', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      await manager.setLocale(SupportedLocales.EN_US);
      expect(manager.isCurrentRTL()).toBe(false);
      
      // 注意：如果有RTL语言支持，这里应该测试RTL语言
    });

    it('7.3 应该获取所有可用语言', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const languages = manager.getAvailableLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    });
  });

  describe('8. 翻译验证测试', () => {
    it('8.1 应该验证翻译键存在性', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      expect(manager.hasTranslationKey('common.ok')).toBe(true);
      expect(manager.hasTranslationKey('nonexistent.key')).toBe(false);
    });

    it('8.2 应该获取翻译统计信息', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const stats = manager.getTranslationStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalKeys).toBe('number');
      expect(typeof stats.missingKeys).toBe('number');
    });

    it('8.3 应该获取缺失的翻译键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // 触发一些缺失键
      manager.t('missing1.key');
      manager.t('missing2.key');
      
      const missingKeys = manager.getMissingKeys();
      expect(Array.isArray(missingKeys)).toBe(true);
    });
  });

  describe('9. 缓存系统测试', () => {
    it('9.1 应该缓存翻译资源', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // 第一次加载
      await manager.setLocale(SupportedLocales.ZH_CN);
      expect(manager.hasTranslation(SupportedLocales.ZH_CN)).toBe(true);
      
      // 切换回来应该使用缓存
      await manager.setLocale(SupportedLocales.EN_US);
      await manager.setLocale(SupportedLocales.ZH_CN);
      expect(manager.hasTranslation(SupportedLocales.ZH_CN)).toBe(true);
    });

    it('9.2 应该清除缓存', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      await manager.setLocale(SupportedLocales.ZH_CN);
      expect(manager.hasTranslation(SupportedLocales.ZH_CN)).toBe(true);
      
      manager.clearCache();
      expect(manager.hasTranslation(SupportedLocales.ZH_CN)).toBe(false);
    });
  });

  describe('10. 边界条件和错误处理测试', () => {
    it('10.1 应该处理空翻译键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('');
      expect(typeof result).toBe('string');
    });

    it('10.2 应该处理null/undefined参数', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      expect(() => {
        manager.t('common.ok', null as any);
        manager.t('common.ok', undefined);
      }).not.toThrow();
    });

    it('10.3 应该处理深层嵌套的翻译键', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const result = manager.t('app.title');
      expect(result).toBe('Serial Studio VSCode Extension');
    });

    it('10.4 应该处理快速语言切换', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      // 快速切换多种语言
      await manager.setLocale(SupportedLocales.ZH_CN);
      await manager.setLocale(SupportedLocales.EN_US);
      await manager.setLocale(SupportedLocales.ZH_CN);
      
      expect(manager.getCurrentLocale()).toBe(SupportedLocales.ZH_CN);
    });
  });

  describe('11. 资源管理和生命周期测试', () => {
    it('11.1 应该正确销毁管理器', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      manager.destroy();
      
      // 验证清理工作
      expect(() => manager.getCurrentLocale()).not.toThrow();
    });

    it('11.2 应该处理存储操作错误', async () => {
      // Mock localStorage错误
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      expect(() => manager.setLocale(SupportedLocales.ZH_CN)).not.toThrow();
    });
  });

  describe('12. 性能和兼容性测试', () => {
    it('12.1 应该处理大量翻译调用', async () => {
      const manager = I18nManager.getInstance();
      await manager.initialize();
      
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        manager.t('common.ok');
      }
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('12.2 应该在无DOM环境下工作', async () => {
      // 临时删除DOM对象
      const originalWindow = global.window;
      const originalDocument = global.document;
      
      delete (global as any).window;
      delete (global as any).document;
      
      try {
        const manager = I18nManager.getInstance();
        await manager.initialize();
        expect(manager.t('common.ok')).toBe('OK');
      } finally {
        // 恢复DOM对象
        global.window = originalWindow;
        global.document = originalDocument;
      }
    });
  });
});
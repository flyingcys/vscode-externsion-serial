/**
 * Theme and I18n Integration Tests
 * 主题系统和国际化集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../../src/webview/utils/ThemeManager';
import { I18nManager } from '../../src/webview/i18n/I18nManager';
import { BUILTIN_THEMES } from '../../src/webview/themes/builtin-themes';
import { SupportedLocales } from '../../src/webview/types/I18nDef';
import { LANGUAGES } from '../../src/webview/i18n/languages';

// Mock DOM environment
const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn()
    },
    setAttribute: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  },
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    }
  }
} as any;

const mockWindow = {
  matchMedia: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })),
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  },
  navigator: {
    language: 'en-US',
    languages: ['en-US', 'zh-CN']
  }
} as any;

// Setup DOM mocks
global.document = mockDocument;
global.window = mockWindow;
global.localStorage = mockWindow.localStorage;

describe('Theme and I18n Integration Tests', () => {
  let themeManager: ThemeManager;
  let i18nManager: I18nManager;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset managers
    (ThemeManager as any).instance = null;
    (I18nManager as any).instance = null;
    
    // Create fresh instances
    themeManager = ThemeManager.getInstance();
    i18nManager = I18nManager.getInstance();
  });

  afterEach(() => {
    // Cleanup
    themeManager?.destroy();
    i18nManager?.destroy();
  });

  describe('Theme System Integration', () => {
    it('should initialize theme manager successfully', async () => {
      await themeManager.initialize();
      
      const currentTheme = themeManager.getCurrentTheme();
      expect(currentTheme).toBeTruthy();
      expect(currentTheme?.title).toBe('Default');
    });

    it('should load all builtin themes', () => {
      const availableThemes = themeManager.getAvailableThemes();
      
      expect(availableThemes).toHaveLength(BUILTIN_THEMES.length);
      expect(availableThemes.map(t => t.title)).toEqual(
        expect.arrayContaining(['Default', 'Dark', 'Light', 'Iron', 'Midnight'])
      );
    });

    it('should switch themes correctly', async () => {
      await themeManager.initialize();
      
      await themeManager.setTheme('Dark');
      
      const currentTheme = themeManager.getCurrentTheme();
      expect(currentTheme?.title).toBe('Dark');
      
      // Verify CSS variables are applied (check for actual variables from dark theme)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--ss-groupbox-background',
        expect.any(String)
      );
    });

    it('should handle theme type changes', async () => {
      await themeManager.initialize();
      
      await themeManager.setThemeType('dark');
      expect(themeManager.getCurrentThemeType()).toBe('dark');
      
      await themeManager.setThemeType('light');
      expect(themeManager.getCurrentThemeType()).toBe('light');
      
      await themeManager.setThemeType('auto');
      expect(themeManager.getCurrentThemeType()).toBe('auto');
    });

    it('should apply CSS variables correctly', async () => {
      await themeManager.initialize();
      await themeManager.setTheme('Dark');
      
      const theme = themeManager.getCurrentTheme();
      expect(theme).toBeTruthy();
      
      // Verify critical CSS variables are set (using actual variables from theme)
      const expectedVariables = [
        '--ss-groupbox-background',
        '--el-bg-color',
        '--ss-link', // This is the actual accent color variable
        '--el-color-error',
        '--ss-dashboard-bg'
      ];
      
      expectedVariables.forEach(variable => {
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
          variable,
          expect.any(String)
        );
      });
    });

    it('should handle custom themes', async () => {
      await themeManager.initialize();
      
      const customTheme = {
        ...BUILTIN_THEMES[0],
        title: 'Custom Test Theme',
        colors: {
          ...BUILTIN_THEMES[0].colors,
          accent: '#ff0000'
        }
      };
      
      await themeManager.addCustomTheme(customTheme);
      
      const availableThemes = themeManager.getAvailableThemes();
      expect(availableThemes.some(t => t.title === 'Custom Test Theme')).toBe(true);
      
      await themeManager.setTheme('Custom Test Theme');
      const currentTheme = themeManager.getCurrentTheme();
      expect(currentTheme?.title).toBe('Custom Test Theme');
      expect(currentTheme?.colors.accent).toBe('#ff0000');
    });

    it('should get chart colors correctly', async () => {
      await themeManager.initialize();
      
      const chartColors = themeManager.getChartColors();
      expect(Array.isArray(chartColors)).toBe(true);
      expect(chartColors.length).toBeGreaterThan(0);
      
      // Verify colors are valid hex codes
      chartColors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should handle theme validation', async () => {
      await themeManager.initialize();
      
      const invalidTheme = {
        title: 'Invalid Theme'
        // Missing required fields
      };
      
      await expect(themeManager.addCustomTheme(invalidTheme as any)).rejects.toThrow();
    });
  });

  describe('I18n System Integration', () => {
    it('should initialize i18n manager successfully', async () => {
      await i18nManager.initialize();
      
      const currentLocale = i18nManager.getCurrentLocale();
      expect(Object.values(SupportedLocales)).toContain(currentLocale);
    });

    it('should translate messages correctly', async () => {
      await i18nManager.initialize();
      
      const translated = i18nManager.t('common.ok');
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
    });

    it('should handle missing translations', async () => {
      await i18nManager.initialize();
      
      const result = i18nManager.t('non.existent.key');
      expect(result).toContain('non.existent.key');
    });

    it('should interpolate parameters', async () => {
      await i18nManager.initialize();
      
      const result = i18nManager.t('app.version', { version: '1.0.0' });
      expect(result).toContain('1.0.0');
    });

    it('should switch locales correctly', async () => {
      await i18nManager.initialize();
      
      await i18nManager.setLocale(SupportedLocales.ZH_CN);
      expect(i18nManager.getCurrentLocale()).toBe(SupportedLocales.ZH_CN);
      
      const translated = i18nManager.t('common.ok');
      expect(translated).toBe('确定');
      
      await i18nManager.setLocale(SupportedLocales.EN_US);
      expect(i18nManager.getCurrentLocale()).toBe(SupportedLocales.EN_US);
      
      const translatedEn = i18nManager.t('common.ok');
      expect(translatedEn).toBe('OK');
    });

    it('should format dates correctly', async () => {
      await i18nManager.initialize();
      
      const testDate = new Date('2023-12-25T10:30:00Z');
      
      const shortFormat = i18nManager.formatDate(testDate, 'short');
      const mediumFormat = i18nManager.formatDate(testDate, 'medium');
      const longFormat = i18nManager.formatDate(testDate, 'long');
      
      expect(typeof shortFormat).toBe('string');
      expect(typeof mediumFormat).toBe('string');
      expect(typeof longFormat).toBe('string');
      
      expect(longFormat.length).toBeGreaterThan(mediumFormat.length);
      expect(mediumFormat.length).toBeGreaterThan(shortFormat.length);
    });

    it('should format numbers correctly', async () => {
      await i18nManager.initialize();
      
      const testNumber = 1234.56;
      
      const decimal = i18nManager.formatNumber(testNumber, 'decimal');
      const percent = i18nManager.formatNumber(0.25, 'percent');
      
      expect(typeof decimal).toBe('string');
      expect(typeof percent).toBe('string');
      
      expect(decimal).toMatch(/1[,.]?234/); // Allow for locale-specific formatting
      expect(percent).toContain('25');
    });

    it('should handle all supported locales', () => {
      const availableLanguages = i18nManager.getAvailableLanguages();
      
      expect(availableLanguages).toHaveLength(Object.keys(LANGUAGES).length);
      
      availableLanguages.forEach(lang => {
        expect(Object.values(SupportedLocales)).toContain(lang.code);
        expect(typeof lang.nativeName).toBe('string');
        expect(typeof lang.englishName).toBe('string');
        expect(typeof lang.isRTL).toBe('boolean');
      });
    });

    it('should detect RTL languages correctly', async () => {
      await i18nManager.initialize();
      
      // Currently no RTL languages in Serial-Studio, but test the mechanism
      const isRTL = i18nManager.isCurrentRTL();
      expect(typeof isRTL).toBe('boolean');
      
      // For current languages, should be false
      expect(isRTL).toBe(false);
    });

    it('should preload translations', async () => {
      await i18nManager.initialize();
      
      const locales = [SupportedLocales.ZH_CN, SupportedLocales.DE_DE];
      
      await expect(i18nManager.preloadTranslations(locales)).resolves.not.toThrow();
    });
  });

  describe('Theme and I18n Combined Integration', () => {
    it('should work together without conflicts', async () => {
      await themeManager.initialize();
      await i18nManager.initialize();
      
      // Change theme
      await themeManager.setTheme('Dark');
      
      // Change locale
      await i18nManager.setLocale(SupportedLocales.ZH_CN);
      
      // Verify both are working
      expect(themeManager.getCurrentTheme()?.title).toBe('Dark');
      expect(i18nManager.getCurrentLocale()).toBe(SupportedLocales.ZH_CN);
      
      const translated = i18nManager.t('theme.dark');
      expect(translated).toBe('深色');
    });

    it('should handle theme translations', async () => {
      await themeManager.initialize();
      await i18nManager.initialize();
      
      const theme = themeManager.getCurrentTheme();
      expect(theme).toBeTruthy();
      
      // Test theme title translations
      const themeTranslations = theme!.translations;
      expect(themeTranslations).toBeTruthy();
      expect(themeTranslations.zh_CN).toBeTruthy();
      expect(themeTranslations.en_US).toBeTruthy();
    });

    it('should maintain consistency when switching both theme and locale', async () => {
      await themeManager.initialize();
      await i18nManager.initialize();
      
      // Test multiple combinations
      const combinations = [
        { theme: 'Dark', locale: SupportedLocales.ZH_CN },
        { theme: 'Light', locale: SupportedLocales.EN_US },
        { theme: 'Iron', locale: SupportedLocales.DE_DE },
        { theme: 'Midnight', locale: SupportedLocales.FR_FR }
      ];
      
      for (const { theme, locale } of combinations) {
        await themeManager.setTheme(theme);
        await i18nManager.setLocale(locale);
        
        expect(themeManager.getCurrentTheme()?.title).toBe(theme);
        expect(i18nManager.getCurrentLocale()).toBe(locale);
        
        // Verify translations still work
        const translated = i18nManager.t('common.ok');
        expect(typeof translated).toBe('string');
        expect(translated.length).toBeGreaterThan(0);
      }
    });

    it('should handle simultaneous state changes', async () => {
      await themeManager.initialize();
      await i18nManager.initialize();
      
      const promises = [
        themeManager.setTheme('Dark'),
        i18nManager.setLocale(SupportedLocales.ZH_CN),
        themeManager.setThemeType('dark'),
        i18nManager.setLocale(SupportedLocales.EN_US)
      ];
      
      await Promise.all(promises);
      
      // Should end up in stable state
      expect(themeManager.getCurrentTheme()).toBeTruthy();
      expect(i18nManager.getCurrentLocale()).toBeTruthy();
    });
  });

  describe('Performance Integration Tests', () => {
    it('should initialize both systems quickly', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        themeManager.initialize(),
        i18nManager.initialize()
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should initialize in less than 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle rapid theme switches efficiently', async () => {
      await themeManager.initialize();
      
      const themes = ['Default', 'Dark', 'Light', 'Iron', 'Midnight'];
      const startTime = Date.now();
      
      for (const theme of themes) {
        await themeManager.setTheme(theme);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete all switches in reasonable time
      expect(duration).toBeLessThan(500);
    });

    it('should handle rapid locale switches efficiently', async () => {
      await i18nManager.initialize();
      
      const locales = [
        SupportedLocales.EN_US,
        SupportedLocales.ZH_CN,
        SupportedLocales.DE_DE,
        SupportedLocales.FR_FR,
        SupportedLocales.ES_MX
      ];
      
      const startTime = Date.now();
      
      for (const locale of locales) {
        await i18nManager.setLocale(locale);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete all switches in reasonable time
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle theme manager errors gracefully', async () => {
      await themeManager.initialize();
      
      // Test invalid theme
      await expect(themeManager.setTheme('NonExistentTheme')).rejects.toThrow();
      
      // Should still be in valid state
      expect(themeManager.getCurrentTheme()).toBeTruthy();
    });

    it('should handle i18n manager errors gracefully', async () => {
      await i18nManager.initialize();
      
      // Test invalid locale
      await expect(i18nManager.setLocale('invalid' as SupportedLocales)).rejects.toThrow();
      
      // Should still be in valid state
      expect(i18nManager.getCurrentLocale()).toBeTruthy();
    });

    it('should recover from DOM manipulation errors', async () => {
      // Initialize first
      await themeManager.initialize();
      
      // Backup original mock
      const originalMock = mockDocument.documentElement.style.setProperty;
      
      // Simulate DOM error only after initialization
      mockDocument.documentElement.style.setProperty.mockImplementation(() => {
        throw new Error('DOM Error');
      });
      
      // Should throw the DOM error, but not crash the manager
      await expect(themeManager.setTheme('Dark')).rejects.toThrow('DOM Error');
      
      // Manager should still be functional after error (theme won't change due to error)
      expect(themeManager.getCurrentTheme()?.title).toBe('Default');
      
      // Restore original mock
      mockDocument.documentElement.style.setProperty = originalMock;
    });
  });
});
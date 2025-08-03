/**
 * 主题系统模块测试
 * 
 * 测试 src/webview/utils/ThemeManager.ts 的真实实现
 * 包含：主题配置、主题管理器、颜色系统、自定义主题、性能优化等
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../../src/webview/utils/ThemeManager';
import type { ThemeDef, ThemeType, SerialStudioColors } from '../../src/webview/types/ThemeDef';

// Mock DOM APIs
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: () => null
  };
})();

const mockMediaQuery = {
  matches: false,
  media: '(prefers-color-scheme: dark)',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn()
};

// Mock window and document
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    ...mockMediaQuery,
    matches: query.includes('dark') ? false : true
  })),
  writable: true
});

// Mock document
const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(),
      removeProperty: vi.fn()
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    },
    setAttribute: vi.fn(),
    getAttribute: vi.fn()
  },
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    }
  }
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

// 创建测试用的简化主题数据
const createTestTheme = (title: string, type: 'light' | 'dark' = 'light'): ThemeDef => {
  const baseColors = type === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColors = type === 'dark' ? '#ffffff' : '#000000';
  
  return {
    title,
    parameters: {
      'code-editor-theme': type,
      'start-icon': `assets/logo/start${type === 'dark' ? '-dark' : ''}.svg`
    },
    translations: {
      en_US: title,
      es_MX: title,
      de_DE: title,
      fr_FR: title,
      it_IT: title,
      ja_JP: title,
      ko_KR: title,
      pl_PL: title,
      pt_BR: title,
      ru_RU: title,
      tr_TR: title,
      zh_CN: title,
      cs_CZ: title,
      uk_UA: title
    },
    colors: {
      // 基础颜色
      text: textColors,
      base: baseColors,
      window: type === 'dark' ? '#2a2a2a' : '#f9f9f9',
      accent: type === 'dark' ? '#4b6cb7' : '#3daee9',
      error: type === 'dark' ? '#e06c75' : '#f95258',
      alarm: type === 'dark' ? '#a02125' : '#ba252e',
      
      // 其他必需的颜色属性（使用默认值）
      groupbox_border: '#cccccc',
      groupbox_background: baseColors,
      groupbox_hard_border: '#aaaaaa',
      pane_background: baseColors,
      pane_section_label: textColors,
      pane_caption_bg_top: '#f0f0f0',
      pane_caption_border: '#cccccc',
      pane_caption_bg_bottom: '#e0e0e0',
      pane_caption_foreground: textColors,
      setup_border: '#cccccc',
      toolbar_top: type === 'dark' ? '#000000' : '#475057',
      titlebar_text: textColors,
      toolbar_text: type === 'dark' ? '#aaadb2' : '#ffffff',
      toolbar_bottom: type === 'dark' ? '#050505' : '#475057',
      toolbar_border: '#cccccc',
      toolbar_separator: '#cccccc',
      toolbar_checked_button_opacity: 0.7,
      toolbar_checked_button_border: '#cccccc',
      toolbar_checked_button_background: '#eeeeee',
      dashboard_background: baseColors,
      mid: '#808080',
      dark: '#404040',
      link: '#0000ff',
      light: '#c0c0c0',
      shadow: '#808080',
      button: type === 'dark' ? '#1c1c1c' : '#eff0f1',
      midlight: '#a0a0a0',
      highlight: type === 'dark' ? '#4b6cb7' : '#3daee9',
      window_text: textColors,
      bright_text: '#ffffff',
      button_text: type === 'dark' ? '#aaadb2' : '#232629',
      tooltip_base: '#ffffcc',
      tooltip_text: '#000000',
      link_visited: '#800080',
      alternate_base: type === 'dark' ? '#2a2a2a' : '#f0f0f0',
      placeholder_text: '#808080',
      highlighted_text: '#ffffff',
      console_text: type === 'dark' ? '#98c379' : '#434649',
      console_base: type === 'dark' ? '#0e0e0e' : '#fcfcfc',
      console_border: '#cccccc',
      console_highlight: type === 'dark' ? '#4b6cb7' : '#B1DFF6',
      widget_text: textColors,
      widget_base: type === 'dark' ? '#191b1d' : '#eff0f1',
      widget_button: '#eeeeee',
      widget_border: '#cccccc',
      widget_window: type === 'dark' ? '#0e0e0e' : '#f9f9f9',
      widget_highlight: type === 'dark' ? '#4b6cb7' : '#3daee9',
      widget_button_text: textColors,
      widget_highlighted_text: '#ffffff',
      widget_placeholder_text: '#808080',
      window_border: '#cccccc',
      window_toolbar_background: '#f0f0f0',
      window_caption_active_top: '#4080ff',
      window_caption_active_text: '#ffffff',
      window_caption_inactive_top: '#808080',
      window_caption_inactive_text: '#c0c0c0',
      window_caption_active_bottom: '#2060df',
      window_caption_inactive_bottom: '#606060',
      taskbar_top: '#f0f0f0',
      taskbar_text: textColors,
      taskbar_bottom: '#e0e0e0',
      taskbar_border: '#cccccc',
      taskbar_separator: '#cccccc',
      tasbkar_highlight: '#4080ff',
      taskbar_indicator_active: '#00ff00',
      taskbar_indicator_inactive: '#808080',
      taskbar_checked_button_top: '#e0e0e0',
      taskbar_checked_button_border: '#cccccc',
      taskbar_checked_button_bottom: '#d0d0d0',
      start_menu_text: textColors,
      start_menu_border: '#cccccc',
      start_menu_highlight: '#4080ff',
      start_menu_background: baseColors,
      start_menu_gradient_top: '#f0f0f0',
      start_menu_version_text: '#808080',
      start_menu_gradient_bottom: '#e0e0e0',
      start_menu_highlighted_text: '#ffffff',
      snap_indicator_border: '#ff0000',
      snap_indicator_background: '#ffcccc',
      table_text: textColors,
      table_cell_bg: baseColors,
      table_fg_header: textColors,
      table_separator: '#cccccc',
      table_bg_header_top: '#f0f0f0',
      table_border_header: '#cccccc',
      table_bg_header_bottom: '#e0e0e0',
      table_separator_header: '#cccccc',
      polar_indicator: '#ff0000',
      polar_background: baseColors,
      polar_foreground: textColors,
      plot3d_x_axis: type === 'dark' ? '#f46c7a' : '#e04b5a',
      plot3d_y_axis: type === 'dark' ? '#99d95c' : '#7fbf3f',
      plot3d_z_axis: type === 'dark' ? '#5aaef2' : '#3391e6',
      plot3d_axis_text: '#ffffff',
      plot3d_grid_major: type === 'dark' ? '#43484b' : '#A0A7B0',
      plot3d_grid_minor: type === 'dark' ? '#232323' : '#5f6670',
      plot3d_background_inner: type === 'dark' ? '#171717' : '#eff0f1',
      plot3d_background_outer: type === 'dark' ? '#0f0f0f' : '#eff0f1',
      menu_hover_bg: '#e0e0e0',
      menu_hover_text: textColors,
      menu_border: '#cccccc',
      
      // 组件颜色数组
      widget_colors: type === 'dark' ? [
        '#4b6cb7', '#98c379', '#e06c75', '#d19a66', '#c678dd',
        '#ffcc00', '#ff2d55', '#6e7074', '#7e7e83', '#a45a7a', '#56b6c2'
      ] : [
        '#007aff', '#ff9500', '#34c759', '#ff3b30', '#af52de', 
        '#ffcc00', '#ff2d55', '#c7c7cc', '#8e8e93', '#007aff', '#5856d6'
      ]
    } as SerialStudioColors
  };
};

/**
 * 主题系统测试工具类
 */
class ThemeSystemTestUtils {
  static createCustomTheme(name: string, type: 'light' | 'dark' = 'light'): ThemeDef {
    return createTestTheme(name, type);
  }

  static createInvalidTheme(): any {
    return {
      title: 'Invalid Theme',
      // 缺少必要的colors属性
      parameters: {},
      translations: {}
    };
  }

  static simulateSystemThemeChange(isDark: boolean): void {
    const mockEvent = { matches: isDark };
    mockMediaQuery.matches = isDark;
    
    // 触发媒体查询事件
    if (mockMediaQuery.addEventListener.mock.calls.length > 0) {
      const callback = mockMediaQuery.addEventListener.mock.calls[0][1];
      if (callback) {
        callback(mockEvent);
      }
    }
  }

  static resetMocks(): void {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockMediaQuery.matches = false;
    // 重置ThemeManager单例
    (ThemeManager as any).instance = null;
  }

  static createPerformanceTestThemes(count: number): ThemeDef[] {
    const themes: ThemeDef[] = [];
    for (let i = 0; i < count; i++) {
      themes.push(this.createCustomTheme(`Performance Test Theme ${i}`, i % 2 === 0 ? 'light' : 'dark'));
    }
    return themes;
  }
}

describe('主题系统模块测试', () => {
  let themeManager: ThemeManager; 

  beforeEach(() => {
    ThemeSystemTestUtils.resetMocks();
    themeManager = ThemeManager.getInstance();
  });

  afterEach(() => {
    if (themeManager && typeof themeManager.destroy === 'function') {
      themeManager.destroy();
    }
  });

  describe('1. 主题配置和验证测试', () => {
    it('应该创建有效的主题配置', () => {
      const theme = ThemeSystemTestUtils.createCustomTheme('Test Theme', 'light');
      
      expect(theme.title).toBe('Test Theme');
      expect(theme.parameters['code-editor-theme']).toBe('light');
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.widget_colors).toBeInstanceOf(Array);
      expect(theme.translations.en_US).toBe('Test Theme');
    });

    it('应该识别主题类型（浅色/深色）', () => {
      const lightTheme = ThemeSystemTestUtils.createCustomTheme('Light Theme', 'light');
      const darkTheme = ThemeSystemTestUtils.createCustomTheme('Dark Theme', 'dark');
      
      // 通过颜色判断主题类型
      expect(lightTheme.colors.base).toContain('#fff');
      expect(darkTheme.colors.base).toContain('#1a1a1a');
    });
  });

  describe('2. 主题管理器核心功能测试', () => {
    it('应该正确初始化主题管理器', async () => {
      expect(themeManager).toBeDefined();
      expect(themeManager.getCurrentThemeType()).toBe('auto');
      
      await themeManager.initialize();
      expect(themeManager.getCurrentTheme()).toBeDefined();
    });

    it('应该正确检测系统主题偏好', () => {
      // 模拟浅色主题偏好
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(() => ({
          ...mockMediaQuery,
          matches: false
        }))
      });
      
      expect(themeManager.isSystemPrefersDark()).toBe(false);
      
      // 模拟深色主题偏好
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(() => ({
          ...mockMediaQuery,
          matches: true
        }))
      });
      
      const newManager = ThemeManager.getInstance();
      expect(newManager.isSystemPrefersDark()).toBeDefined();
    });

    it('应该支持设置主题类型', async () => {
      let themeChangedCount = 0;
      const unsubscribe = themeManager.onThemeTypeChanged(() => {
        themeChangedCount++;
      });
      
      await themeManager.setThemeType('dark');
      expect(themeManager.getCurrentThemeType()).toBe('dark');
      expect(themeChangedCount).toBe(1);
      
      await themeManager.setThemeType('light');
      expect(themeManager.getCurrentThemeType()).toBe('light');
      expect(themeChangedCount).toBe(2);
      
      unsubscribe();
    });

    it('应该支持设置具体主题', async () => {
      let themeChangedCount = 0;
      const unsubscribe = themeManager.onThemeChanged((theme) => {
        themeChangedCount++;
        expect(theme.title).toBeDefined();
      });
      
      const availableThemes = themeManager.getAvailableThemes();
      if (availableThemes.length > 0) {
        await themeManager.setTheme(availableThemes[0].title);
        expect(themeManager.getCurrentTheme()?.title).toBe(availableThemes[0].title);
        expect(themeChangedCount).toBe(1);
      }
      
      unsubscribe();
    });

    it('应该支持主题切换', async () => {
      const availableThemes = themeManager.getAvailableThemes();
      if (availableThemes.length > 0) {
        await themeManager.setTheme(availableThemes[0].title);
        const initialType = themeManager.getEffectiveThemeType();
        expect(['light', 'dark'].includes(initialType)).toBe(true);
        
        // 切换主题
        await themeManager.toggleTheme();
        const toggledType = themeManager.getEffectiveThemeType();
        expect(toggledType).not.toBe(initialType);
      }
    });
  });

  describe('3. 自定义主题管理测试', () => {
    it('应该支持添加自定义主题', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('My Custom Theme');
      
      await themeManager.addCustomTheme(customTheme);
      
      const availableThemes = themeManager.getAvailableThemes();
      expect(availableThemes.some(theme => theme.title === 'My Custom Theme')).toBe(true);
    });

    it('应该支持删除自定义主题', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Custom Theme');
      
      await themeManager.addCustomTheme(customTheme);
      expect(themeManager.getAvailableThemes().some(theme => theme.title === 'Custom Theme')).toBe(true);
      
      await themeManager.removeCustomTheme('Custom Theme');
      expect(themeManager.getAvailableThemes().some(theme => theme.title === 'Custom Theme')).toBe(false);
    });

    it('应该阻止删除内置主题', async () => {
      const availableThemes = themeManager.getAvailableThemes();
      if (availableThemes.length > 0) {
        const builtInTheme = availableThemes[0];
        await expect(themeManager.removeCustomTheme(builtInTheme.title)).rejects.toThrow('Cannot remove built-in theme');
      }
    });

    it('应该支持导出主题配置', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Export Test Theme');
      await themeManager.addCustomTheme(customTheme);
      
      const exportedJson = themeManager.exportTheme('Export Test Theme');
      const parsedTheme = JSON.parse(exportedJson);
      
      expect(parsedTheme.title).toBe('Export Test Theme');
      expect(parsedTheme.colors).toBeDefined();
      expect(parsedTheme.translations).toBeDefined();
    });

    it('应该支持导入主题配置', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Import Test Theme');
      const themeJson = JSON.stringify(customTheme);
      
      await themeManager.importTheme(themeJson);
      
      const importedTheme = themeManager.getAvailableThemes().find(theme => theme.title === 'Import Test Theme');
      expect(importedTheme).toBeDefined();
      expect(importedTheme?.title).toBe('Import Test Theme');
    });

    it('应该处理导入无效主题配置', async () => {
      const invalidTheme = ThemeSystemTestUtils.createInvalidTheme();
      const invalidJson = JSON.stringify(invalidTheme);
      
      await expect(themeManager.importTheme(invalidJson)).rejects.toThrow('Invalid theme');
    });
  });

  describe('4. 颜色系统和CSS变量测试', () => {
    it('应该获取图表颜色配置', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Chart Colors Test');
      await themeManager.addCustomTheme(customTheme);
      await themeManager.loadTheme(customTheme.title);
      
      const chartColors = themeManager.getChartColors();
      expect(chartColors).toEqual(customTheme.colors.widget_colors);
    });

    it('应该获取特定主题颜色值', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Color Value Test');
      await themeManager.addCustomTheme(customTheme);
      await themeManager.loadTheme(customTheme.title);
      
      const textColor = themeManager.getThemeColor('text');
      const accentColor = themeManager.getThemeColor('accent');
      
      expect(textColor).toBe(customTheme.colors.text);
      expect(accentColor).toBe(customTheme.colors.accent);
    });
  });

  describe('5. 本地存储和持久化测试', () => {
    it('应该保存主题配置到本地存储', async () => {
      const availableThemes = themeManager.getAvailableThemes();
      if (availableThemes.length > 0) {
        await themeManager.setTheme(availableThemes[0].title);
        
        const storedConfig = mockLocalStorage.getItem('serial-studio-theme-config');
        expect(storedConfig).toBeDefined();
        
        const config = JSON.parse(storedConfig!);
        expect(config.themeId).toBe(availableThemes[0].title);
      }
    });

    it('应该保存和加载自定义主题', async () => {
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Persistent Theme');
      
      await themeManager.addCustomTheme(customTheme);
      
      const storedThemes = mockLocalStorage.getItem('serial-studio-custom-themes');
      expect(storedThemes).toBeDefined();
      
      const themes = JSON.parse(storedThemes!);
      expect(themes).toHaveLength(1);
      expect(themes[0].title).toBe('Persistent Theme');
    });
  });

  describe('6. 性能和边界条件测试', () => {
    it('应该处理不存在的主题', async () => {
      await expect(themeManager.setTheme('NonExistentTheme')).rejects.toThrow('Theme not found');
      await expect(themeManager.loadTheme('NonExistentTheme')).rejects.toThrow('Theme not found');
      expect(() => themeManager.exportTheme('NonExistentTheme')).toThrow('Theme not found');
    });

    it('应该支持重置主题设置', async () => {
      // 添加自定义主题并切换
      const customTheme = ThemeSystemTestUtils.createCustomTheme('Custom Theme');
      await themeManager.addCustomTheme(customTheme);
      await themeManager.setTheme('Custom Theme');
      await themeManager.setThemeType('dark');
      
      // 重置
      await themeManager.reset();
      
      expect(themeManager.getCurrentThemeType()).toBe('auto');
      expect(themeManager.getAvailableThemes().some(theme => theme.title === 'Custom Theme')).toBe(false);
    });

    it('应该正确清理资源', () => {
      const manager = ThemeManager.getInstance();
      
      // 销毁管理器
      manager.destroy();
      
      // 验证清理
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
    });
  });
});
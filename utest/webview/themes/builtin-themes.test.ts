/**
 * Built-in Themes 测试
 * 目标：100% 覆盖率，验证所有内置主题的完整性和兼容性
 */

import { describe, test, expect } from 'vitest';

import { SupportedLocales } from '../../../src/webview/types/I18nDef';
import {
  defaultTheme,
  lightTheme,
  darkTheme,
  ironTheme,
  midnightTheme,
  highContrastTheme,
  BUILTIN_THEMES,
  getBuiltInTheme
} from '../../../src/webview/themes/builtin-themes';

describe('Built-in Themes 测试', () => {
  
  describe('主题完整性测试', () => {
    test('所有主题都应该有必需的属性', () => {
      const themes = [
        defaultTheme,
        lightTheme,
        darkTheme,
        ironTheme,
        midnightTheme,
        highContrastTheme
      ];

      themes.forEach(theme => {
        // 验证基本结构
        expect(theme).toHaveProperty('title');
        expect(theme).toHaveProperty('parameters');
        expect(theme).toHaveProperty('translations');
        expect(theme).toHaveProperty('colors');

        // 验证属性类型
        expect(typeof theme.title).toBe('string');
        expect(typeof theme.parameters).toBe('object');
        expect(typeof theme.translations).toBe('object');
        expect(typeof theme.colors).toBe('object');

        // 标题不应为空
        expect(theme.title.trim()).not.toBe('');
      });
    });

    test('所有主题都应该有必需的参数', () => {
      BUILTIN_THEMES.forEach(theme => {
        expect(theme.parameters).toHaveProperty('code-editor-theme');
        expect(theme.parameters).toHaveProperty('start-icon');
        
        expect(typeof theme.parameters['code-editor-theme']).toBe('string');
        expect(typeof theme.parameters['start-icon']).toBe('string');
        
        expect(theme.parameters['code-editor-theme'].trim()).not.toBe('');
        expect(theme.parameters['start-icon'].trim()).not.toBe('');
      });
    });

    test('所有主题都应该包含所有支持语言的翻译', () => {
      const supportedLocales = Object.values(SupportedLocales);
      
      BUILTIN_THEMES.forEach(theme => {
        supportedLocales.forEach(locale => {
          expect(theme.translations).toHaveProperty(locale);
          expect(typeof theme.translations[locale]).toBe('string');
          expect(theme.translations[locale].trim()).not.toBe('');
        });
      });
    });

    test('所有主题都应该包含完整的颜色定义', () => {
      const requiredColorProperties = [
        // 基础颜色
        'groupbox_border', 'groupbox_background', 'groupbox_hard_border',
        'pane_background', 'pane_section_label', 'pane_caption_bg_top',
        'pane_caption_border', 'pane_caption_bg_bottom', 'pane_caption_foreground',
        'setup_border', 'toolbar_top', 'titlebar_text', 'toolbar_text',
        'toolbar_bottom', 'toolbar_border', 'toolbar_separator',
        'toolbar_checked_button_opacity', 'toolbar_checked_button_border',
        'toolbar_checked_button_background', 'error', 'alarm', 'dashboard_background',
        
        // 基础样式颜色
        'mid', 'dark', 'text', 'base', 'link', 'light', 'window', 'shadow',
        'accent', 'button', 'midlight', 'highlight', 'window_text',
        'bright_text', 'button_text', 'tooltip_base', 'tooltip_text',
        'link_visited', 'alternate_base', 'placeholder_text', 'highlighted_text',
        
        // 控制台样式
        'console_text', 'console_base', 'console_border', 'console_highlight',
        
        // 组件样式
        'widget_text', 'widget_base', 'widget_button', 'widget_border',
        'widget_window', 'widget_highlight', 'widget_button_text',
        'widget_highlighted_text', 'widget_placeholder_text',
        
        // 窗口样式
        'window_border', 'window_toolbar_background',
        'window_caption_active_top', 'window_caption_active_text',
        'window_caption_inactive_top', 'window_caption_inactive_text',
        'window_caption_active_bottom', 'window_caption_inactive_bottom',
        
        // 任务栏样式
        'taskbar_top', 'taskbar_text', 'taskbar_bottom', 'taskbar_border',
        'taskbar_separator', 'tasbkar_highlight', 'taskbar_indicator_active',
        'taskbar_indicator_inactive', 'taskbar_checked_button_top',
        'taskbar_checked_button_border', 'taskbar_checked_button_bottom',
        
        // 开始菜单样式
        'start_menu_text', 'start_menu_border', 'start_menu_highlight',
        'start_menu_background', 'start_menu_gradient_top',
        'start_menu_version_text', 'start_menu_gradient_bottom',
        'start_menu_highlighted_text',
        
        // 对齐指示器
        'snap_indicator_border', 'snap_indicator_background',
        
        // 表格样式
        'table_text', 'table_cell_bg', 'table_fg_header', 'table_separator',
        'table_bg_header_top', 'table_border_header', 'table_bg_header_bottom',
        'table_separator_header',
        
        // 极坐标样式
        'polar_indicator', 'polar_background', 'polar_foreground',
        
        // 3D绘图样式
        'plot3d_x_axis', 'plot3d_y_axis', 'plot3d_z_axis', 'plot3d_axis_text',
        'plot3d_grid_major', 'plot3d_grid_minor', 'plot3d_background_inner',
        'plot3d_background_outer',
        
        // 菜单样式
        'menu_hover_bg', 'menu_hover_text', 'menu_border',
        
        // 组件颜色数组
        'widget_colors'
      ];

      BUILTIN_THEMES.forEach(theme => {
        requiredColorProperties.forEach(prop => {
          expect(theme.colors).toHaveProperty(prop);
          
          if (prop === 'widget_colors') {
            expect(Array.isArray(theme.colors[prop])).toBe(true);
            expect(theme.colors[prop].length).toBeGreaterThan(0);
          } else if (prop === 'toolbar_checked_button_opacity') {
            expect(typeof theme.colors[prop]).toBe('number');
            expect(theme.colors[prop]).toBeGreaterThanOrEqual(0);
            expect(theme.colors[prop]).toBeLessThanOrEqual(1);
          } else {
            expect(typeof theme.colors[prop]).toBe('string');
            expect(theme.colors[prop].trim()).not.toBe('');
          }
        });
      });
    });
  });

  describe('个别主题特性测试', () => {
    test('默认主题应该有正确的配置', () => {
      expect(defaultTheme.title).toBe('Default');
      expect(defaultTheme.parameters['code-editor-theme']).toBe('default');
      expect(defaultTheme.translations['en_US']).toBe('Default');
      expect(defaultTheme.translations['zh_CN']).toBe('默认');
      
      // 验证默认主题的基本颜色
      expect(defaultTheme.colors.text).toBe('#232629');
      expect(defaultTheme.colors.base).toBe('#f9f9f9');
      expect(defaultTheme.colors.accent).toBe('#3daee9');
    });

    test('深色主题应该有正确的配置', () => {
      expect(darkTheme.title).toBe('Dark');
      expect(darkTheme.parameters['code-editor-theme']).toBe('dark');
      expect(darkTheme.translations['en_US']).toBe('Dark');
      expect(darkTheme.translations['zh_CN']).toBe('深色');
      
      // 验证深色主题的基本颜色
      expect(darkTheme.colors.text).toBe('#aaadb2');
      expect(darkTheme.colors.base).toBe('#0e0e0e');
      expect(darkTheme.colors.accent).toBe('#4b6cb7');
    });

    test('浅色主题应该有正确的配置', () => {
      expect(lightTheme.title).toBe('Light');
      expect(lightTheme.parameters['code-editor-theme']).toBe('light');
      expect(lightTheme.translations['en_US']).toBe('Light');
      expect(lightTheme.translations['zh_CN']).toBe('浅色');
      
      // 验证浅色主题的基本颜色
      expect(lightTheme.colors.text).toBe('#222222');
      expect(lightTheme.colors.base).toBe('#ffffff');
      expect(lightTheme.colors.accent).toBe('#0080ff');
    });

    test('铁色主题应该有正确的配置', () => {
      expect(ironTheme.title).toBe('Iron');
      expect(ironTheme.parameters['code-editor-theme']).toBe('iron');
      expect(ironTheme.translations['en_US']).toBe('Iron');
      expect(ironTheme.translations['zh_CN']).toBe('铁色');
      
      // 验证铁色主题的金属质感颜色
      expect(ironTheme.colors.text).toBe('#cccccc');
      expect(ironTheme.colors.base).toBe('#2a2a2a');
      expect(ironTheme.colors.accent).toBe('#88aaff');
    });

    test('午夜主题应该有正确的配置', () => {
      expect(midnightTheme.title).toBe('Midnight');
      expect(midnightTheme.parameters['code-editor-theme']).toBe('midnight');
      expect(midnightTheme.translations['en_US']).toBe('Midnight');
      expect(midnightTheme.translations['zh_CN']).toBe('午夜');
      
      // 验证午夜主题的极深色调
      expect(midnightTheme.colors.text).toBe('#999999');
      expect(midnightTheme.colors.base).toBe('#000000');
      expect(midnightTheme.colors.accent).toBe('#6666ff');
    });

    test('高对比度主题应该有正确的配置', () => {
      expect(highContrastTheme.title).toBe('High Contrast');
      expect(highContrastTheme.parameters['code-editor-theme']).toBe('high-contrast');
      expect(highContrastTheme.translations['en_US']).toBe('High Contrast');
      expect(highContrastTheme.translations['zh_CN']).toBe('高对比度');
      
      // 验证高对比度主题的极端对比
      expect(highContrastTheme.colors.text).toBe('#ffffff');
      expect(highContrastTheme.colors.base).toBe('#000000');
      expect(highContrastTheme.colors.accent).toBe('#00ffff');
      expect(highContrastTheme.colors.toolbar_checked_button_opacity).toBe(1.0);
    });
  });

  describe('颜色格式验证', () => {
    test('所有颜色值都应该是有效的十六进制颜色', () => {
      const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

      BUILTIN_THEMES.forEach(theme => {
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (key === 'widget_colors') {
            (value as string[]).forEach((color, index) => {
              expect(color).toMatch(hexColorRegex, 
                `Theme ${theme.title}, widget_colors[${index}]: ${color}`);
            });
          } else if (key === 'toolbar_checked_button_opacity') {
            expect(typeof value).toBe('number');
          } else {
            expect(value).toMatch(hexColorRegex, 
              `Theme ${theme.title}, ${key}: ${value}`);
          }
        });
      });
    });

    test('widget_colors应该包含足够的颜色', () => {
      BUILTIN_THEMES.forEach(theme => {
        expect(theme.colors.widget_colors.length).toBeGreaterThanOrEqual(8);
        expect(theme.colors.widget_colors.length).toBeLessThanOrEqual(20);
        
        // 确保没有重复的颜色
        const uniqueColors = new Set(theme.colors.widget_colors);
        expect(uniqueColors.size).toBeGreaterThanOrEqual(theme.colors.widget_colors.length * 0.8);
      });
    });
  });

  describe('主题对比度测试', () => {
    test('深色主题应该有足够的对比度', () => {
      const darkThemes = [darkTheme, ironTheme, midnightTheme];
      
      darkThemes.forEach(theme => {
        // 深色主题的背景应该比文本暗
        const bgBrightness = getColorBrightness(theme.colors.base);
        const textBrightness = getColorBrightness(theme.colors.text);
        
        expect(bgBrightness).toBeLessThan(textBrightness);
      });
    });

    test('浅色主题应该有足够的对比度', () => {
      const lightThemes = [defaultTheme, lightTheme];
      
      lightThemes.forEach(theme => {
        // 浅色主题的背景应该比文本亮
        const bgBrightness = getColorBrightness(theme.colors.base);
        const textBrightness = getColorBrightness(theme.colors.text);
        
        expect(bgBrightness).toBeGreaterThan(textBrightness);
      });
    });

    test('高对比度主题应该有最高的对比度', () => {
      const bgBrightness = getColorBrightness(highContrastTheme.colors.base);
      const textBrightness = getColorBrightness(highContrastTheme.colors.text);
      
      // 高对比度主题应该使用纯黑和纯白
      expect(bgBrightness).toBe(0); // 纯黑
      expect(textBrightness).toBe(255); // 纯白
    });

    // 辅助函数：计算颜色亮度
    function getColorBrightness(hexColor: string): number {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // 使用相对亮度公式
      return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  });

  describe('BUILTIN_THEMES 数组测试', () => {
    test('BUILTIN_THEMES 应该包含所有主题', () => {
      expect(BUILTIN_THEMES).toContain(defaultTheme);
      expect(BUILTIN_THEMES).toContain(lightTheme);
      expect(BUILTIN_THEMES).toContain(darkTheme);
      expect(BUILTIN_THEMES).toContain(ironTheme);
      expect(BUILTIN_THEMES).toContain(midnightTheme);
      expect(BUILTIN_THEMES).toContain(highContrastTheme);
    });

    test('BUILTIN_THEMES 应该有正确的数量', () => {
      expect(BUILTIN_THEMES.length).toBe(6);
    });

    test('所有主题都应该有唯一的标题', () => {
      const titles = BUILTIN_THEMES.map(theme => theme.title.toLowerCase());
      const uniqueTitles = new Set(titles);
      
      expect(uniqueTitles.size).toBe(titles.length);
    });
  });

  describe('getBuiltInTheme 函数测试', () => {
    test('应该根据标题找到正确的主题', () => {
      expect(getBuiltInTheme('default')).toBe(defaultTheme);
      expect(getBuiltInTheme('Default')).toBe(defaultTheme);
      expect(getBuiltInTheme('DEFAULT')).toBe(defaultTheme);
      
      expect(getBuiltInTheme('dark')).toBe(darkTheme);
      expect(getBuiltInTheme('Dark')).toBe(darkTheme);
      
      expect(getBuiltInTheme('light')).toBe(lightTheme);
      expect(getBuiltInTheme('iron')).toBe(ironTheme);
      expect(getBuiltInTheme('midnight')).toBe(midnightTheme);
      expect(getBuiltInTheme('high contrast')).toBe(highContrastTheme);
    });

    test('不存在的主题应该返回 undefined', () => {
      expect(getBuiltInTheme('nonexistent')).toBeUndefined();
      expect(getBuiltInTheme('')).toBeUndefined();
      expect(getBuiltInTheme('custom')).toBeUndefined();
    });

    test('应该处理大小写不敏感的查找', () => {
      expect(getBuiltInTheme('DARK')).toBe(darkTheme);
      expect(getBuiltInTheme('Light')).toBe(lightTheme);
      expect(getBuiltInTheme('IrOn')).toBe(ironTheme);
      expect(getBuiltInTheme('HIGH CONTRAST')).toBe(highContrastTheme);
    });
  });

  describe('主题兼容性测试', () => {
    test('所有主题都应该与Serial-Studio兼容', () => {
      BUILTIN_THEMES.forEach(theme => {
        // 验证主题结构符合Serial-Studio格式
        expect(theme).toHaveProperty('title');
        expect(theme).toHaveProperty('parameters');
        expect(theme).toHaveProperty('translations');
        expect(theme).toHaveProperty('colors');
        
        // 验证必需的参数
        expect(theme.parameters).toHaveProperty('code-editor-theme');
        expect(theme.parameters).toHaveProperty('start-icon');
        
        // 验证图标路径
        expect(theme.parameters['start-icon']).toMatch(/\.(svg|png|ico)$/);
      });
    });

    test('所有主题的翻译应该与I18nDef兼容', () => {
      const supportedLocales = Object.values(SupportedLocales);
      
      BUILTIN_THEMES.forEach(theme => {
        const translationKeys = Object.keys(theme.translations);
        
        // 验证包含所有支持的语言
        supportedLocales.forEach(locale => {
          expect(translationKeys).toContain(locale);
        });
        
        // 验证没有额外的不支持语言
        translationKeys.forEach(key => {
          expect(supportedLocales).toContain(key as SupportedLocales);
        });
      });
    });
  });

  describe('特殊颜色属性测试', () => {
    test('透明度值应该在合理范围内', () => {
      BUILTIN_THEMES.forEach(theme => {
        const opacity = theme.colors.toolbar_checked_button_opacity;
        expect(opacity).toBeGreaterThanOrEqual(0);
        expect(opacity).toBeLessThanOrEqual(1);
        expect(typeof opacity).toBe('number');
      });
    });

    test('应该包含可选的欢迎界面颜色', () => {
      BUILTIN_THEMES.forEach(theme => {
        // 检查是否有欢迎界面相关颜色
        const hasWelcomeColors = 
          theme.colors.welcome_gradient_top ||
          theme.colors.welcome_gradient_bottom ||
          theme.colors.welcome_gradient_border;
          
        if (hasWelcomeColors) {
          // 如果有欢迎界面颜色，验证格式
          if (theme.colors.welcome_gradient_top) {
            expect(theme.colors.welcome_gradient_top).toMatch(/^#[0-9a-fA-F]{6}$/);
          }
          if (theme.colors.welcome_gradient_bottom) {
            expect(theme.colors.welcome_gradient_bottom).toMatch(/^#[0-9a-fA-F]{6}$/);
          }
          if (theme.colors.welcome_gradient_border) {
            expect(theme.colors.welcome_gradient_border).toMatch(/^#[0-9a-fA-F]{6}$/);
          }
        }
      });
    });
  });

  describe('边界条件和错误处理', () => {
    test('所有主题的颜色值都不应该为空或无效', () => {
      BUILTIN_THEMES.forEach(theme => {
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (key === 'widget_colors') {
            expect(Array.isArray(value)).toBe(true);
            (value as string[]).forEach(color => {
              expect(typeof color).toBe('string');
              expect(color.trim()).not.toBe('');
            });
          } else if (key === 'toolbar_checked_button_opacity') {
            expect(typeof value).toBe('number');
            expect(isFinite(value as number)).toBe(true);
          } else {
            expect(typeof value).toBe('string');
            expect((value as string).trim()).not.toBe('');
          }
        });
      });
    });

    test('翻译文本都不应该为空', () => {
      BUILTIN_THEMES.forEach(theme => {
        Object.values(theme.translations).forEach(translation => {
          expect(typeof translation).toBe('string');
          expect(translation.trim()).not.toBe('');
          expect(translation.length).toBeGreaterThan(0);
        });
      });
    });

    test('参数值都不应该为空', () => {
      BUILTIN_THEMES.forEach(theme => {
        Object.values(theme.parameters).forEach(param => {
          expect(typeof param).toBe('string');
          expect(param.trim()).not.toBe('');
          expect(param.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('性能和内存测试', () => {
    test('主题数据大小应该合理', () => {
      BUILTIN_THEMES.forEach(theme => {
        const jsonString = JSON.stringify(theme);
        const sizeKB = jsonString.length / 1024;
        
        // 单个主题不应超过50KB
        expect(sizeKB).toBeLessThan(50);
      });
    });

    test('widget_colors 数组长度应该合理', () => {
      BUILTIN_THEMES.forEach(theme => {
        expect(theme.colors.widget_colors.length).toBeLessThan(50);
        expect(theme.colors.widget_colors.length).toBeGreaterThan(5);
      });
    });
  });
});
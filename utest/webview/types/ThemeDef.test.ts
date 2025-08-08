/**
 * ThemeDef 类型定义测试
 * 目标：100% 类型安全覆盖，验证Theme接口兼容性
 */

import { describe, test, expect } from 'vitest';
import {
  ThemeDef,
  SerialStudioColors,
  ThemeType,
  BuiltInThemes,
  ThemeConfig,
  ThemeEvents,
  CSSVariableMap,
  ThemeValidationResult
} from '../../../src/webview/types/ThemeDef';

describe('ThemeDef 类型定义测试', () => {
  
  describe('ThemeType 枚举测试', () => {
    test('应该包含所有主题类型', () => {
      const lightType: ThemeType = 'light';
      const darkType: ThemeType = 'dark';
      const autoType: ThemeType = 'auto';
      
      expect(lightType).toBe('light');
      expect(darkType).toBe('dark');
      expect(autoType).toBe('auto');
    });
  });

  describe('BuiltInThemes 枚举测试', () => {
    test('应该包含所有内置主题', () => {
      expect(BuiltInThemes.Default).toBe('default');
      expect(BuiltInThemes.Dark).toBe('dark');
      expect(BuiltInThemes.Light).toBe('light');
      expect(BuiltInThemes.Iron).toBe('iron');
      expect(BuiltInThemes.Midnight).toBe('midnight');
    });

    test('应该有5种内置主题', () => {
      const themes = Object.values(BuiltInThemes);
      expect(themes.length).toBe(5);
    });
  });

  describe('SerialStudioColors 接口测试', () => {
    test('应该创建完整的颜色配置', () => {
      const colors: SerialStudioColors = {
        // 分组框样式
        groupbox_border: '#cccccc',
        groupbox_background: '#ffffff',
        groupbox_hard_border: '#000000',

        // 面板样式
        pane_background: '#f5f5f5',
        pane_section_label: '#333333',
        pane_caption_bg_top: '#e0e0e0',
        pane_caption_border: '#cccccc',
        pane_caption_bg_bottom: '#d0d0d0',
        pane_caption_foreground: '#000000',

        // 设置和工具栏样式
        setup_border: '#cccccc',
        toolbar_top: '#f0f0f0',
        titlebar_text: '#000000',
        toolbar_text: '#333333',
        toolbar_bottom: '#e0e0e0',
        toolbar_border: '#cccccc',
        toolbar_separator: '#dddddd',
        toolbar_checked_button_opacity: 0.8,
        toolbar_checked_button_border: '#0078d4',
        toolbar_checked_button_background: '#e3f2fd',

        // 状态颜色
        error: '#ff0000',
        alarm: '#ffa500',
        dashboard_background: '#ffffff',

        // 基础颜色
        mid: '#808080',
        dark: '#404040',
        text: '#000000',
        base: '#ffffff',
        link: '#0078d4',
        light: '#f0f0f0',
        window: '#ffffff',
        shadow: '#000000',
        accent: '#0078d4',
        button: '#e1e1e1',
        midlight: '#c0c0c0',
        highlight: '#0078d4',
        window_text: '#000000',
        bright_text: '#ffffff',
        button_text: '#000000',
        tooltip_base: '#ffffcc',
        tooltip_text: '#000000',
        link_visited: '#551a8b',
        alternate_base: '#f5f5f5',
        placeholder_text: '#999999',
        highlighted_text: '#ffffff',

        // 控制台样式
        console_text: '#000000',
        console_base: '#ffffff',
        console_border: '#cccccc',
        console_highlight: '#0078d4',

        // 组件样式
        widget_text: '#000000',
        widget_base: '#ffffff',
        widget_button: '#e1e1e1',
        widget_border: '#cccccc',
        widget_window: '#ffffff',
        widget_highlight: '#0078d4',
        widget_button_text: '#000000',
        widget_highlighted_text: '#ffffff',
        widget_placeholder_text: '#999999',

        // 窗口样式
        window_border: '#cccccc',
        window_toolbar_background: '#f0f0f0',
        window_caption_active_top: '#0078d4',
        window_caption_active_text: '#ffffff',
        window_caption_inactive_top: '#cccccc',
        window_caption_inactive_text: '#666666',
        window_caption_active_bottom: '#005a9e',
        window_caption_inactive_bottom: '#999999',

        // 任务栏样式
        taskbar_top: '#f0f0f0',
        taskbar_text: '#000000',
        taskbar_bottom: '#e0e0e0',
        taskbar_border: '#cccccc',
        taskbar_separator: '#dddddd',
        tasbkar_highlight: '#0078d4',
        taskbar_indicator_active: '#0078d4',
        taskbar_indicator_inactive: '#cccccc',
        taskbar_checked_button_top: '#e3f2fd',
        taskbar_checked_button_border: '#0078d4',
        taskbar_checked_button_bottom: '#bbdefb',

        // 开始菜单样式
        start_menu_text: '#000000',
        start_menu_border: '#cccccc',
        start_menu_highlight: '#0078d4',
        start_menu_background: '#ffffff',
        start_menu_gradient_top: '#f0f0f0',
        start_menu_version_text: '#666666',
        start_menu_gradient_bottom: '#e0e0e0',
        start_menu_highlighted_text: '#ffffff',

        // 对齐指示器
        snap_indicator_border: '#0078d4',
        snap_indicator_background: '#e3f2fd',

        // 表格样式
        table_text: '#000000',
        table_cell_bg: '#ffffff',
        table_fg_header: '#000000',
        table_separator: '#dddddd',
        table_bg_header_top: '#f0f0f0',
        table_border_header: '#cccccc',
        table_bg_header_bottom: '#e0e0e0',
        table_separator_header: '#cccccc',

        // 极坐标样式
        polar_indicator: '#0078d4',
        polar_background: '#ffffff',
        polar_foreground: '#000000',

        // 3D绘图样式
        plot3d_x_axis: '#ff0000',
        plot3d_y_axis: '#00ff00',
        plot3d_z_axis: '#0000ff',
        plot3d_axis_text: '#000000',
        plot3d_grid_major: '#cccccc',
        plot3d_grid_minor: '#eeeeee',
        plot3d_background_inner: '#f8f8f8',
        plot3d_background_outer: '#ffffff',

        // 菜单样式
        menu_hover_bg: '#e3f2fd',
        menu_hover_text: '#000000',
        menu_border: '#cccccc',

        // 欢迎界面样式（可选）
        welcome_gradient_top: '#f0f8ff',
        welcome_gradient_bottom: '#e0f0ff',
        welcome_gradient_border: '#cccccc',

        // 组件颜色数组
        widget_colors: [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f',
          '#bb8fce', '#85c1e9', '#f8c471', '#82e0aa'
        ]
      };

      expect(colors.groupbox_border).toBe('#cccccc');
      expect(colors.error).toBe('#ff0000');
      expect(colors.widget_colors.length).toBe(8);
      expect(colors.toolbar_checked_button_opacity).toBe(0.8);
      expect(colors.welcome_gradient_top).toBe('#f0f8ff'); // 可选属性
    });

    test('应该支持可选的欢迎界面样式', () => {
      const colorsWithoutWelcome: SerialStudioColors = {
        // 基础必需属性
        groupbox_border: '#cccccc',
        groupbox_background: '#ffffff',
        groupbox_hard_border: '#000000',
        pane_background: '#f5f5f5',
        pane_section_label: '#333333',
        pane_caption_bg_top: '#e0e0e0',
        pane_caption_border: '#cccccc',
        pane_caption_bg_bottom: '#d0d0d0',
        pane_caption_foreground: '#000000',
        setup_border: '#cccccc',
        toolbar_top: '#f0f0f0',
        titlebar_text: '#000000',
        toolbar_text: '#333333',
        toolbar_bottom: '#e0e0e0',
        toolbar_border: '#cccccc',
        toolbar_separator: '#dddddd',
        toolbar_checked_button_opacity: 0.8,
        toolbar_checked_button_border: '#0078d4',
        toolbar_checked_button_background: '#e3f2fd',
        error: '#ff0000',
        alarm: '#ffa500',
        dashboard_background: '#ffffff',
        mid: '#808080',
        dark: '#404040',
        text: '#000000',
        base: '#ffffff',
        link: '#0078d4',
        light: '#f0f0f0',
        window: '#ffffff',
        shadow: '#000000',
        accent: '#0078d4',
        button: '#e1e1e1',
        midlight: '#c0c0c0',
        highlight: '#0078d4',
        window_text: '#000000',
        bright_text: '#ffffff',
        button_text: '#000000',
        tooltip_base: '#ffffcc',
        tooltip_text: '#000000',
        link_visited: '#551a8b',
        alternate_base: '#f5f5f5',
        placeholder_text: '#999999',
        highlighted_text: '#ffffff',
        console_text: '#000000',
        console_base: '#ffffff',
        console_border: '#cccccc',
        console_highlight: '#0078d4',
        widget_text: '#000000',
        widget_base: '#ffffff',
        widget_button: '#e1e1e1',
        widget_border: '#cccccc',
        widget_window: '#ffffff',
        widget_highlight: '#0078d4',
        widget_button_text: '#000000',
        widget_highlighted_text: '#ffffff',
        widget_placeholder_text: '#999999',
        window_border: '#cccccc',
        window_toolbar_background: '#f0f0f0',
        window_caption_active_top: '#0078d4',
        window_caption_active_text: '#ffffff',
        window_caption_inactive_top: '#cccccc',
        window_caption_inactive_text: '#666666',
        window_caption_active_bottom: '#005a9e',
        window_caption_inactive_bottom: '#999999',
        taskbar_top: '#f0f0f0',
        taskbar_text: '#000000',
        taskbar_bottom: '#e0e0e0',
        taskbar_border: '#cccccc',
        taskbar_separator: '#dddddd',
        tasbkar_highlight: '#0078d4',
        taskbar_indicator_active: '#0078d4',
        taskbar_indicator_inactive: '#cccccc',
        taskbar_checked_button_top: '#e3f2fd',
        taskbar_checked_button_border: '#0078d4',
        taskbar_checked_button_bottom: '#bbdefb',
        start_menu_text: '#000000',
        start_menu_border: '#cccccc',
        start_menu_highlight: '#0078d4',
        start_menu_background: '#ffffff',
        start_menu_gradient_top: '#f0f0f0',
        start_menu_version_text: '#666666',
        start_menu_gradient_bottom: '#e0e0e0',
        start_menu_highlighted_text: '#ffffff',
        snap_indicator_border: '#0078d4',
        snap_indicator_background: '#e3f2fd',
        table_text: '#000000',
        table_cell_bg: '#ffffff',
        table_fg_header: '#000000',
        table_separator: '#dddddd',
        table_bg_header_top: '#f0f0f0',
        table_border_header: '#cccccc',
        table_bg_header_bottom: '#e0e0e0',
        table_separator_header: '#cccccc',
        polar_indicator: '#0078d4',
        polar_background: '#ffffff',
        polar_foreground: '#000000',
        plot3d_x_axis: '#ff0000',
        plot3d_y_axis: '#00ff00',
        plot3d_z_axis: '#0000ff',
        plot3d_axis_text: '#000000',
        plot3d_grid_major: '#cccccc',
        plot3d_grid_minor: '#eeeeee',
        plot3d_background_inner: '#f8f8f8',
        plot3d_background_outer: '#ffffff',
        menu_hover_bg: '#e3f2fd',
        menu_hover_text: '#000000',
        menu_border: '#cccccc',
        widget_colors: ['#ff6b6b', '#4ecdc4']
        // 不包含welcome相关属性
      };

      expect(colorsWithoutWelcome.welcome_gradient_top).toBeUndefined();
      expect(colorsWithoutWelcome.welcome_gradient_bottom).toBeUndefined();
      expect(colorsWithoutWelcome.welcome_gradient_border).toBeUndefined();
    });
  });

  describe('ThemeDef 接口测试', () => {
    test('应该创建有效的主题定义', () => {
      const theme: ThemeDef = {
        title: 'Test Theme',
        parameters: {
          'code-editor-theme': 'vs-dark',
          'start-icon': 'custom-icon.png',
          'custom-param': 'custom-value'
        },
        translations: {
          en_US: 'Test Theme',
          es_MX: 'Tema de Prueba',
          de_DE: 'Test-Theme',
          fr_FR: 'Thème de Test',
          it_IT: 'Tema di Test',
          ja_JP: 'テストテーマ',
          ko_KR: '테스트 테마',
          pl_PL: 'Motyw Testowy',
          pt_BR: 'Tema de Teste',
          ru_RU: 'Тестовая Тема',
          tr_TR: 'Test Teması',
          zh_CN: '测试主题',
          cs_CZ: 'Testovací Téma',
          uk_UA: 'Тестова Тема'
        },
        colors: {
          groupbox_border: '#cccccc',
          groupbox_background: '#ffffff',
          groupbox_hard_border: '#000000',
          pane_background: '#f5f5f5',
          pane_section_label: '#333333',
          pane_caption_bg_top: '#e0e0e0',
          pane_caption_border: '#cccccc',
          pane_caption_bg_bottom: '#d0d0d0',
          pane_caption_foreground: '#000000',
          setup_border: '#cccccc',
          toolbar_top: '#f0f0f0',
          titlebar_text: '#000000',
          toolbar_text: '#333333',
          toolbar_bottom: '#e0e0e0',
          toolbar_border: '#cccccc',
          toolbar_separator: '#dddddd',
          toolbar_checked_button_opacity: 0.8,
          toolbar_checked_button_border: '#0078d4',
          toolbar_checked_button_background: '#e3f2fd',
          error: '#ff0000',
          alarm: '#ffa500',
          dashboard_background: '#ffffff',
          mid: '#808080',
          dark: '#404040',
          text: '#000000',
          base: '#ffffff',
          link: '#0078d4',
          light: '#f0f0f0',
          window: '#ffffff',
          shadow: '#000000',
          accent: '#0078d4',
          button: '#e1e1e1',
          midlight: '#c0c0c0',
          highlight: '#0078d4',
          window_text: '#000000',
          bright_text: '#ffffff',
          button_text: '#000000',
          tooltip_base: '#ffffcc',
          tooltip_text: '#000000',
          link_visited: '#551a8b',
          alternate_base: '#f5f5f5',
          placeholder_text: '#999999',
          highlighted_text: '#ffffff',
          console_text: '#000000',
          console_base: '#ffffff',
          console_border: '#cccccc',
          console_highlight: '#0078d4',
          widget_text: '#000000',
          widget_base: '#ffffff',
          widget_button: '#e1e1e1',
          widget_border: '#cccccc',
          widget_window: '#ffffff',
          widget_highlight: '#0078d4',
          widget_button_text: '#000000',
          widget_highlighted_text: '#ffffff',
          widget_placeholder_text: '#999999',
          window_border: '#cccccc',
          window_toolbar_background: '#f0f0f0',
          window_caption_active_top: '#0078d4',
          window_caption_active_text: '#ffffff',
          window_caption_inactive_top: '#cccccc',
          window_caption_inactive_text: '#666666',
          window_caption_active_bottom: '#005a9e',
          window_caption_inactive_bottom: '#999999',
          taskbar_top: '#f0f0f0',
          taskbar_text: '#000000',
          taskbar_bottom: '#e0e0e0',
          taskbar_border: '#cccccc',
          taskbar_separator: '#dddddd',
          tasbkar_highlight: '#0078d4',
          taskbar_indicator_active: '#0078d4',
          taskbar_indicator_inactive: '#cccccc',
          taskbar_checked_button_top: '#e3f2fd',
          taskbar_checked_button_border: '#0078d4',
          taskbar_checked_button_bottom: '#bbdefb',
          start_menu_text: '#000000',
          start_menu_border: '#cccccc',
          start_menu_highlight: '#0078d4',
          start_menu_background: '#ffffff',
          start_menu_gradient_top: '#f0f0f0',
          start_menu_version_text: '#666666',
          start_menu_gradient_bottom: '#e0e0e0',
          start_menu_highlighted_text: '#ffffff',
          snap_indicator_border: '#0078d4',
          snap_indicator_background: '#e3f2fd',
          table_text: '#000000',
          table_cell_bg: '#ffffff',
          table_fg_header: '#000000',
          table_separator: '#dddddd',
          table_bg_header_top: '#f0f0f0',
          table_border_header: '#cccccc',
          table_bg_header_bottom: '#e0e0e0',
          table_separator_header: '#cccccc',
          polar_indicator: '#0078d4',
          polar_background: '#ffffff',
          polar_foreground: '#000000',
          plot3d_x_axis: '#ff0000',
          plot3d_y_axis: '#00ff00',
          plot3d_z_axis: '#0000ff',
          plot3d_axis_text: '#000000',
          plot3d_grid_major: '#cccccc',
          plot3d_grid_minor: '#eeeeee',
          plot3d_background_inner: '#f8f8f8',
          plot3d_background_outer: '#ffffff',
          menu_hover_bg: '#e3f2fd',
          menu_hover_text: '#000000',
          menu_border: '#cccccc',
          widget_colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f']
        }
      };

      expect(theme.title).toBe('Test Theme');
      expect(theme.parameters['code-editor-theme']).toBe('vs-dark');
      expect(theme.translations.zh_CN).toBe('测试主题');
      expect(theme.colors.error).toBe('#ff0000');
      expect(theme.colors.widget_colors.length).toBe(4);
    });

    test('应该支持自定义参数', () => {
      const customParams = {
        'code-editor-theme': 'monokai',
        'start-icon': 'my-icon.svg',
        'custom-font': 'Roboto',
        'custom-size': '14px',
        'animation-speed': '200ms'
      };

      const theme: ThemeDef = {
        title: 'Custom Theme',
        parameters: customParams,
        translations: {
          en_US: 'Custom Theme',
          es_MX: 'Tema Personalizado',
          de_DE: 'Benutzerdefiniertes Thema',
          fr_FR: 'Thème Personnalisé',
          it_IT: 'Tema Personalizzato',
          ja_JP: 'カスタムテーマ',
          ko_KR: '사용자 지정 테마',
          pl_PL: 'Motyw Niestandardowy',
          pt_BR: 'Tema Personalizado',
          ru_RU: 'Пользовательская Тема',
          tr_TR: 'Özel Tema',
          zh_CN: '自定义主题',
          cs_CZ: 'Vlastní Téma',
          uk_UA: 'Користувацька Тема'
        },
        colors: {} as SerialStudioColors
      };

      expect(theme.parameters['custom-font']).toBe('Roboto');
      expect(theme.parameters['animation-speed']).toBe('200ms');
    });
  });

  describe('ThemeConfig 接口测试', () => {
    test('应该创建有效的主题配置', () => {
      const config: ThemeConfig = {
        themeType: 'auto',
        themeId: BuiltInThemes.Dark,
        customThemes: []
      };

      expect(config.themeType).toBe('auto');
      expect(config.themeId).toBe('dark');
      expect(Array.isArray(config.customThemes)).toBe(true);
    });

    test('应该支持自定义主题列表', () => {
      const customTheme: ThemeDef = {
        title: 'My Theme',
        parameters: {
          'code-editor-theme': 'custom',
          'start-icon': 'icon.png'
        },
        translations: {
          en_US: 'My Theme',
          es_MX: 'Mi Tema',
          de_DE: 'Mein Thema',
          fr_FR: 'Mon Thème',
          it_IT: 'Il Mio Tema',
          ja_JP: 'マイテーマ',
          ko_KR: '내 테마',
          pl_PL: 'Mój Motyw',
          pt_BR: 'Meu Tema',
          ru_RU: 'Моя Тема',
          tr_TR: 'Benim Temam',
          zh_CN: '我的主题',
          cs_CZ: 'Mé Téma',
          uk_UA: 'Моя Тема'
        },
        colors: {} as SerialStudioColors
      };

      const config: ThemeConfig = {
        themeType: 'light',
        themeId: 'my-custom-theme',
        customThemes: [customTheme]
      };

      expect(config.customThemes.length).toBe(1);
      expect(config.customThemes[0].title).toBe('My Theme');
    });
  });

  describe('ThemeEvents 接口测试', () => {
    test('应该定义有效的事件处理器', () => {
      const mockTheme: ThemeDef = {
        title: 'Mock Theme',
        parameters: {},
        translations: {} as any,
        colors: {} as SerialStudioColors
      };

      const events: ThemeEvents = {
        themeChanged: (theme) => {
          expect(typeof theme).toBe('object');
          expect(theme.title).toBeDefined();
        },
        themeTypeChanged: (type) => {
          expect(['light', 'dark', 'auto'].includes(type)).toBe(true);
        },
        systemThemeChanged: (isDark) => {
          expect(typeof isDark).toBe('boolean');
        }
      };

      events.themeChanged(mockTheme);
      events.themeTypeChanged('dark');
      events.systemThemeChanged(true);
    });
  });

  describe('CSSVariableMap 接口测试', () => {
    test('应该创建有效的CSS变量映射', () => {
      const cssMap: CSSVariableMap = {
        'groupbox_border': ['--groupbox-border-color'],
        'toolbar_top': ['--toolbar-bg-top', '--toolbar-gradient-start'],
        'widget_colors': [
          '--widget-color-0',
          '--widget-color-1',
          '--widget-color-2',
          '--widget-color-3'
        ]
      };

      expect(Array.isArray(cssMap['groupbox_border'])).toBe(true);
      expect(cssMap['toolbar_top'].length).toBe(2);
      expect(cssMap['widget_colors'].length).toBe(4);
    });
  });

  describe('ThemeValidationResult 接口测试', () => {
    test('应该创建有效的验证结果', () => {
      const validResult: ThemeValidationResult = {
        valid: true,
        errors: [],
        warnings: []
      };

      const invalidResult: ThemeValidationResult = {
        valid: false,
        errors: ['Invalid color format: xyz'],
        warnings: ['Deprecated property: old_color']
      };

      expect(validResult.valid).toBe(true);
      expect(validResult.errors.length).toBe(0);
      expect(validResult.warnings.length).toBe(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBe(1);
      expect(invalidResult.warnings.length).toBe(1);
    });
  });

  describe('类型兼容性测试', () => {
    test('ThemeDef应该与Serial-Studio完全兼容', () => {
      // 测试Serial-Studio的典型主题结构
      const serialStudioTheme: ThemeDef = {
        title: 'Default',
        parameters: {
          'code-editor-theme': 'default',
          'start-icon': 'serial-studio.ico'
        },
        translations: {
          en_US: 'Default',
          es_MX: 'Por defecto',
          de_DE: 'Standard',
          fr_FR: 'Par défaut',
          it_IT: 'Predefinito',
          ja_JP: 'デフォルト',
          ko_KR: '기본값',
          pl_PL: 'Domyślny',
          pt_BR: 'Padrão',
          ru_RU: 'По умолчанию',
          tr_TR: 'Varsayılan',
          zh_CN: '默认',
          cs_CZ: 'Výchozí',
          uk_UA: 'За замовчуванням'
        },
        colors: {
          // 只测试关键颜色属性的存在
          error: '#ff0000',
          alarm: '#ffa500',
          accent: '#0078d4',
          widget_colors: ['#ff0000', '#00ff00', '#0000ff']
        } as SerialStudioColors
      };

      expect(serialStudioTheme.title).toBe('Default');
      expect(serialStudioTheme.colors.error).toBe('#ff0000');
      expect(serialStudioTheme.translations.zh_CN).toBe('默认');
    });

    test('应该支持不同的主题类型组合', () => {
      const configs: ThemeConfig[] = [
        { themeType: 'light', themeId: BuiltInThemes.Light, customThemes: [] },
        { themeType: 'dark', themeId: BuiltInThemes.Dark, customThemes: [] },
        { themeType: 'auto', themeId: BuiltInThemes.Default, customThemes: [] }
      ];

      configs.forEach(config => {
        expect(['light', 'dark', 'auto'].includes(config.themeType)).toBe(true);
        expect(typeof config.themeId).toBe('string');
        expect(Array.isArray(config.customThemes)).toBe(true);
      });
    });
  });

  describe('边界条件测试', () => {
    test('应该处理空的widget_colors数组', () => {
      const colors: SerialStudioColors = {
        widget_colors: [],
        // 其他必需属性简化表示
        error: '#ff0000'
      } as SerialStudioColors;

      expect(colors.widget_colors.length).toBe(0);
    });

    test('应该处理大量widget_colors', () => {
      const colors: SerialStudioColors = {
        widget_colors: Array.from({ length: 50 }, (_, i) => `#${i.toString(16).padStart(6, '0')}`),
        error: '#ff0000'
      } as SerialStudioColors;

      expect(colors.widget_colors.length).toBe(50);
      expect(colors.widget_colors[0]).toBe('#000000');
      expect(colors.widget_colors[15]).toBe('#00000f');
    });

    test('应该处理特殊字符的翻译', () => {
      const theme: ThemeDef = {
        title: 'Special Theme',
        parameters: {},
        translations: {
          en_US: 'Theme with "quotes" & <tags>',
          es_MX: 'Tema con "comillas" y <etiquetas>',
          de_DE: 'Thema mit "Anführungszeichen" & <Tags>',
          fr_FR: 'Thème avec "guillemets" et <balises>',
          it_IT: 'Tema con "virgolette" e <tag>',
          ja_JP: '「引用符」と<タグ>を含むテーマ',
          ko_KR: '"따옴표"와 <태그>가 있는 테마',
          pl_PL: 'Motyw z "cudzysłowami" i <tagami>',
          pt_BR: 'Tema com "aspas" e <tags>',
          ru_RU: 'Тема с "кавычками" и <тегами>',
          tr_TR: '"Tırnak işaretleri" ve <etiketler> içeren tema',
          zh_CN: '包含"引号"和<标签>的主题',
          cs_CZ: 'Téma s "uvozovkami" a <značkami>',
          uk_UA: 'Тема з "лапками" та <тегами>'
        },
        colors: {} as SerialStudioColors
      };

      expect(theme.translations.en_US).toContain('"quotes"');
      expect(theme.translations.zh_CN).toContain('<标签>');
    });

    test('应该处理极值的不透明度', () => {
      const colors: SerialStudioColors = {
        toolbar_checked_button_opacity: 0.0,
        error: '#ff0000'
      } as SerialStudioColors;

      const colors2: SerialStudioColors = {
        toolbar_checked_button_opacity: 1.0,
        error: '#ff0000'
      } as SerialStudioColors;

      expect(colors.toolbar_checked_button_opacity).toBe(0.0);
      expect(colors2.toolbar_checked_button_opacity).toBe(1.0);
    });

    test('应该处理复杂的验证结果', () => {
      const complexValidation: ThemeValidationResult = {
        valid: false,
        errors: [
          'Color "invalid_color" is not a valid hex color',
          'Missing required property "widget_colors"',
          'Opacity value 1.5 is out of range [0-1]'
        ],
        warnings: [
          'Property "old_property" is deprecated, use "new_property" instead',
          'Color "#fff" should be written as "#ffffff" for consistency',
          'Translation for "ja_JP" is missing'
        ]
      };

      expect(complexValidation.errors.length).toBe(3);
      expect(complexValidation.warnings.length).toBe(3);
      expect(complexValidation.valid).toBe(false);
    });
  });
});
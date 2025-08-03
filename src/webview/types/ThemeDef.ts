/**
 * Serial-Studio Compatible Theme Definition
 * 与Serial-Studio完全兼容的主题定义
 */

/**
 * 主题定义接口 - 完全兼容Serial-Studio
 */
export interface ThemeDef {
  /** 主题标题 */
  title: string;
  
  /** 主题参数 */
  parameters: {
    /** 代码编辑器主题 */
    'code-editor-theme': string;
    /** 启动图标 */
    'start-icon': string;
    /** 其他自定义参数 */
    [key: string]: string;
  };
  
  /** 多语言翻译 */
  translations: {
    en_US: string;
    es_MX: string;
    de_DE: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    ko_KR: string;
    pl_PL: string;
    pt_BR: string;
    ru_RU: string;
    tr_TR: string;
    zh_CN: string;
    cs_CZ: string;
    uk_UA: string;
  };
  
  /** 颜色配置 - 完全匹配Serial-Studio结构 */
  colors: SerialStudioColors;
}

/**
 * Serial-Studio颜色配置接口
 */
export interface SerialStudioColors {
  // === 分组框样式 ===
  groupbox_border: string;
  groupbox_background: string;
  groupbox_hard_border: string;

  // === 面板样式 ===
  pane_background: string;
  pane_section_label: string;
  pane_caption_bg_top: string;
  pane_caption_border: string;
  pane_caption_bg_bottom: string;
  pane_caption_foreground: string;

  // === 设置和工具栏样式 ===
  setup_border: string;
  toolbar_top: string;
  titlebar_text: string;
  toolbar_text: string;
  toolbar_bottom: string;
  toolbar_border: string;
  toolbar_separator: string;
  toolbar_checked_button_opacity: number;
  toolbar_checked_button_border: string;
  toolbar_checked_button_background: string;

  // === 状态颜色 ===
  error: string;
  alarm: string;
  dashboard_background: string;

  // === 基础颜色 ===
  mid: string;
  dark: string;
  text: string;
  base: string;
  link: string;
  light: string;
  window: string;
  shadow: string;
  accent: string;
  button: string;
  midlight: string;
  highlight: string;
  window_text: string;
  bright_text: string;
  button_text: string;
  tooltip_base: string;
  tooltip_text: string;
  link_visited: string;
  alternate_base: string;
  placeholder_text: string;
  highlighted_text: string;

  // === 控制台样式 ===
  console_text: string;
  console_base: string;
  console_border: string;
  console_highlight: string;

  // === 组件样式 ===
  widget_text: string;
  widget_base: string;
  widget_button: string;
  widget_border: string;
  widget_window: string;
  widget_highlight: string;
  widget_button_text: string;
  widget_highlighted_text: string;
  widget_placeholder_text: string;

  // === 窗口样式 ===
  window_border: string;
  window_toolbar_background: string;
  window_caption_active_top: string;
  window_caption_active_text: string;
  window_caption_inactive_top: string;
  window_caption_inactive_text: string;
  window_caption_active_bottom: string;
  window_caption_inactive_bottom: string;

  // === 任务栏样式 ===
  taskbar_top: string;
  taskbar_text: string;
  taskbar_bottom: string;
  taskbar_border: string;
  taskbar_separator: string;
  tasbkar_highlight: string;
  taskbar_indicator_active: string;
  taskbar_indicator_inactive: string;
  taskbar_checked_button_top: string;
  taskbar_checked_button_border: string;
  taskbar_checked_button_bottom: string;

  // === 开始菜单样式 ===
  start_menu_text: string;
  start_menu_border: string;
  start_menu_highlight: string;
  start_menu_background: string;
  start_menu_gradient_top: string;
  start_menu_version_text: string;
  start_menu_gradient_bottom: string;
  start_menu_highlighted_text: string;

  // === 对齐指示器 ===
  snap_indicator_border: string;
  snap_indicator_background: string;

  // === 表格样式 ===
  table_text: string;
  table_cell_bg: string;
  table_fg_header: string;
  table_separator: string;
  table_bg_header_top: string;
  table_border_header: string;
  table_bg_header_bottom: string;
  table_separator_header: string;

  // === 极坐标样式 ===
  polar_indicator: string;
  polar_background: string;
  polar_foreground: string;

  // === 3D绘图样式 ===
  plot3d_x_axis: string;
  plot3d_y_axis: string;
  plot3d_z_axis: string;
  plot3d_axis_text: string;
  plot3d_grid_major: string;
  plot3d_grid_minor: string;
  plot3d_background_inner: string;
  plot3d_background_outer: string;

  // === 菜单样式 ===
  menu_hover_bg: string;
  menu_hover_text: string;
  menu_border: string;

  // === 欢迎界面样式（可选） ===
  welcome_gradient_top?: string;
  welcome_gradient_bottom?: string;
  welcome_gradient_border?: string;

  // === 组件颜色数组 ===
  widget_colors: string[];
}

/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark' | 'auto';

/**
 * 内置主题ID
 */
export enum BuiltInThemes {
  Default = 'default',
  Dark = 'dark', 
  Light = 'light',
  Iron = 'iron',
  Midnight = 'midnight'
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 当前主题类型 */
  themeType: ThemeType;
  /** 当前主题ID */
  themeId: string;
  /** 自定义主题列表 */
  customThemes: ThemeDef[];
}

/**
 * 主题管理器事件
 */
export interface ThemeEvents {
  /** 主题变更事件 */
  themeChanged: (theme: ThemeDef) => void;
  /** 主题类型变更事件 */
  themeTypeChanged: (type: ThemeType) => void;
  /** 系统主题变更事件 */
  systemThemeChanged: (isDark: boolean) => void;
}

/**
 * CSS变量映射表
 */
export interface CSSVariableMap {
  [serialStudioProperty: string]: string[];
}

/**
 * 主题验证结果
 */
export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
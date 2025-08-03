/**
 * Theme Manager for Serial-Studio VSCode Extension
 * 完全兼容Serial-Studio的主题管理器
 */

import type { 
  ThemeDef, 
  ThemeType, 
  ThemeConfig, 
  ThemeEvents, 
  CSSVariableMap,
  ThemeValidationResult,
  SerialStudioColors
} from '../types/ThemeDef';
import { BUILTIN_THEMES, getBuiltInTheme } from '../themes/builtin-themes';

/**
 * 主题变更监听器
 */
type ThemeListener = (theme: ThemeDef) => void;
type ThemeTypeListener = (type: ThemeType) => void;
type SystemThemeListener = (isDark: boolean) => void;

/**
 * Serial-Studio兼容的主题管理器
 */
export class ThemeManager {
  private static instance: ThemeManager | null = null;
  
  // 当前状态
  private currentTheme: ThemeDef | null = null;
  private currentThemeType: ThemeType = 'auto';
  private systemPrefersDark: boolean = false;
  private customThemes: ThemeDef[] = [];
  
  // 事件监听器
  private themeListeners: ThemeListener[] = [];
  private themeTypeListeners: ThemeTypeListener[] = [];
  private systemThemeListeners: SystemThemeListener[] = [];
  
  // CSS变量映射表 - 将Serial-Studio颜色属性映射到CSS变量
  private cssVariableMap: CSSVariableMap = this.createCSSVariableMap();
  
  // 媒体查询监听器
  private mediaQueryListener: ((e: any) => void) | null = null;

  private constructor() {
    this.detectSystemTheme();
    this.setupMediaQueryListener();
  }

  /**
   * 获取主题管理器单例
   */
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 初始化主题系统
   */
  public async initialize(): Promise<void> {
    // 加载自定义主题
    await this.loadCustomThemes();
    
    // 加载保存的主题设置
    const config = this.loadThemeConfig();
    
    // 应用主题
    if (config.themeId) {
      await this.setTheme(config.themeId, false);
    } else {
      // 默认使用auto模式
      await this.setThemeType('auto', false);
    }
    
    console.log('Theme Manager initialized');
  }

  /**
   * 获取所有可用主题
   */
  public getAvailableThemes(): ThemeDef[] {
    return [...BUILTIN_THEMES, ...this.customThemes];
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): ThemeDef | null {
    return this.currentTheme;
  }

  /**
   * 获取当前主题类型
   */
  public getCurrentThemeType(): ThemeType {
    return this.currentThemeType;
  }

  /**
   * 检测系统是否偏好深色主题
   */
  public isSystemPrefersDark(): boolean {
    return this.systemPrefersDark;
  }

  /**
   * 获取有效的主题类型（解析auto）
   */
  public getEffectiveThemeType(): 'light' | 'dark' {
    if (this.currentThemeType === 'auto') {
      return this.systemPrefersDark ? 'dark' : 'light';
    }
    return this.currentThemeType;
  }

  /**
   * 设置主题类型
   */
  public async setThemeType(type: ThemeType, save: boolean = true): Promise<void> {
    this.currentThemeType = type;
    
    // 根据类型选择合适的主题
    let targetTheme: ThemeDef | null = null;
    
    if (type === 'auto') {
      // 根据系统偏好选择主题
      const effectiveType = this.systemPrefersDark ? 'dark' : 'light';
      targetTheme = this.findThemeByType(effectiveType);
    } else {
      // 直接选择对应类型的主题
      targetTheme = this.findThemeByType(type);
    }
    
    if (targetTheme) {
      await this.loadTheme(targetTheme.title, false);
    }
    
    // 通知监听器
    this.notifyThemeTypeChanged(type);
    
    if (save) {
      this.saveThemeConfig();
    }
  }

  /**
   * 设置主题
   */
  public async setTheme(themeId: string, save: boolean = true): Promise<void> {
    const theme = this.findThemeById(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }
    
    await this.loadTheme(theme.title, save);
  }

  /**
   * 加载主题
   */
  public async loadTheme(themeTitle: string, save: boolean = true): Promise<void> {
    const theme = this.findThemeByTitle(themeTitle);
    if (!theme) {
      throw new Error(`Theme not found: ${themeTitle}`);
    }
    
    // 设置当前主题
    this.currentTheme = theme;
    
    // 应用主题到DOM
    this.applyTheme(theme);
    
    // 通知监听器
    this.notifyThemeChanged(theme);
    
    if (save) {
      this.saveThemeConfig();
    }
    
    console.log(`Theme loaded: ${theme.title}`);
  }

  /**
   * 切换深色/浅色主题
   */
  public async toggleTheme(): Promise<void> {
    const currentType = this.getEffectiveThemeType();
    const targetType: ThemeType = currentType === 'dark' ? 'light' : 'dark';
    await this.setThemeType(targetType);
  }

  /**
   * 添加自定义主题
   */
  public async addCustomTheme(theme: ThemeDef): Promise<void> {
    // 验证主题
    const validation = this.validateTheme(theme);
    if (!validation.valid) {
      throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
    }
    
    // 检查是否已存在
    const existingIndex = this.customThemes.findIndex(t => t.title === theme.title);
    
    if (existingIndex >= 0) {
      this.customThemes[existingIndex] = theme;
    } else {
      this.customThemes.push(theme);
    }
    
    await this.saveCustomThemes();
  }

  /**
   * 删除自定义主题
   */
  public async removeCustomTheme(themeTitle: string): Promise<void> {
    // 不允许删除内置主题
    const isBuiltIn = BUILTIN_THEMES.some(theme => theme.title === themeTitle);
    if (isBuiltIn) {
      throw new Error('Cannot remove built-in theme');
    }
    
    this.customThemes = this.customThemes.filter(theme => theme.title !== themeTitle);
    
    // 如果当前主题被删除，切换到默认主题
    if (this.currentTheme?.title === themeTitle) {
      await this.setTheme('Default');
    }
    
    await this.saveCustomThemes();
  }

  /**
   * 导出主题
   */
  public exportTheme(themeTitle: string): string {
    const theme = this.findThemeByTitle(themeTitle);
    if (!theme) {
      throw new Error(`Theme not found: ${themeTitle}`);
    }
    
    return JSON.stringify(theme, null, 2);
  }

  /**
   * 导入主题
   */
  public async importTheme(themeJson: string): Promise<void> {
    try {
      const theme: ThemeDef = JSON.parse(themeJson);
      await this.addCustomTheme(theme);
    } catch (error) {
      throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取图表颜色
   */
  public getChartColors(): string[] {
    return this.currentTheme?.colors.widget_colors || [];
  }

  /**
   * 获取主题颜色值
   */
  public getThemeColor(colorKey: keyof SerialStudioColors): string {
    if (!this.currentTheme) {
      return '#000000';
    }
    
    const value = this.currentTheme.colors[colorKey];
    return typeof value === 'string' ? value : String(value);
  }

  /**
   * 添加主题变更监听器
   */
  public onThemeChanged(listener: ThemeListener): () => void {
    this.themeListeners.push(listener);
    return () => {
      const index = this.themeListeners.indexOf(listener);
      if (index >= 0) {
        this.themeListeners.splice(index, 1);
      }
    };
  }

  /**
   * 添加主题类型变更监听器
   */
  public onThemeTypeChanged(listener: ThemeTypeListener): () => void {
    this.themeTypeListeners.push(listener);
    return () => {
      const index = this.themeTypeListeners.indexOf(listener);
      if (index >= 0) {
        this.themeTypeListeners.splice(index, 1);
      }
    };
  }

  /**
   * 添加系统主题变更监听器
   */
  public onSystemThemeChanged(listener: SystemThemeListener): () => void {
    this.systemThemeListeners.push(listener);
    return () => {
      const index = this.systemThemeListeners.indexOf(listener);
      if (index >= 0) {
        this.systemThemeListeners.splice(index, 1);
      }
    };
  }

  /**
   * 重置主题设置
   */
  public async reset(): Promise<void> {
    this.currentThemeType = 'auto';
    this.customThemes = [];
    await this.setThemeType('auto');
    await this.saveCustomThemes();
  }

  // === 私有方法 ===

  /**
   * 检测系统主题偏好
   */
  private detectSystemTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  /**
   * 设置媒体查询监听器
   */
  private setupMediaQueryListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      this.mediaQueryListener = (e: any) => {
        const oldValue = this.systemPrefersDark;
        this.systemPrefersDark = e.matches;
        
        // 通知监听器
        this.notifySystemThemeChanged(this.systemPrefersDark);
        
        // 如果是auto模式，自动切换主题
        if (this.currentThemeType === 'auto' && oldValue !== this.systemPrefersDark) {
          const targetType = this.systemPrefersDark ? 'dark' : 'light';
          const targetTheme = this.findThemeByType(targetType);
          if (targetTheme) {
            this.loadTheme(targetTheme.title, false);
          }
        }
      };
      
      mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(theme: ThemeDef): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    const root = document.documentElement;
    const colors = theme.colors;
    
    // 应用所有颜色变量
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const cssVars = this.cssVariableMap[key] || [`--ss-${key.replace(/_/g, '-')}`];
        cssVars.forEach(cssVar => {
          root.style.setProperty(cssVar, value);
        });
      } else if (typeof value === 'number') {
        const cssVars = this.cssVariableMap[key] || [`--ss-${key.replace(/_/g, '-')}`];
        cssVars.forEach(cssVar => {
          root.style.setProperty(cssVar, String(value));
        });
      }
    });
    
    // 特殊处理widget_colors数组
    if (colors.widget_colors && Array.isArray(colors.widget_colors)) {
      colors.widget_colors.forEach((color, index) => {
        root.style.setProperty(`--ss-widget-color-${index}`, color);
      });
      root.style.setProperty('--ss-widget-colors-count', String(colors.widget_colors.length));
    }
    
    // 设置主题类名
    const effectiveType = this.getEffectiveThemeType();
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${effectiveType}`);
    
    // 设置data属性用于CSS选择器
    document.documentElement.setAttribute('data-theme', theme.title.toLowerCase());
    document.documentElement.setAttribute('data-theme-type', effectiveType);
    
    // Element Plus主题切换
    if (effectiveType === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * 创建CSS变量映射表
   */
  private createCSSVariableMap(): CSSVariableMap {
    return {
      // 基础颜色映射到Element Plus变量
      accent: ['--el-color-primary'],
      success: ['--el-color-success'],
      error: ['--el-color-danger', '--el-color-error'],
      alarm: ['--el-color-warning'],
      text: ['--el-text-color-primary'],
      window_text: ['--el-text-color-regular'],
      placeholder_text: ['--el-text-color-placeholder'],
      base: ['--el-bg-color'],
      window: ['--el-bg-color-page'],
      button: ['--el-button-bg-color'],
      button_text: ['--el-button-text-color'],
      highlight: ['--el-color-primary-light-3'],
      
      // 边框颜色
      groupbox_border: ['--el-border-color'],
      widget_border: ['--el-border-color-light'],
      setup_border: ['--el-border-color-lighter'],
      
      // 填充颜色
      widget_base: ['--el-fill-color'],
      alternate_base: ['--el-fill-color-light'],
      
      // 工具栏颜色
      toolbar_top: ['--ss-toolbar-bg-top'],
      toolbar_bottom: ['--ss-toolbar-bg-bottom'],
      toolbar_text: ['--ss-toolbar-text'],
      toolbar_border: ['--ss-toolbar-border'],
      
      // 控制台颜色
      console_base: ['--ss-console-bg'],
      console_text: ['--ss-console-text'],
      console_border: ['--ss-console-border'],
      
      // 仪表板颜色
      dashboard_background: ['--ss-dashboard-bg'],
      
      // 3D绘图颜色
      plot3d_x_axis: ['--ss-plot3d-x-axis'],
      plot3d_y_axis: ['--ss-plot3d-y-axis'],
      plot3d_z_axis: ['--ss-plot3d-z-axis'],
      plot3d_axis_text: ['--ss-plot3d-axis-text'],
      plot3d_grid_major: ['--ss-plot3d-grid-major'],
      plot3d_grid_minor: ['--ss-plot3d-grid-minor'],
      plot3d_background_inner: ['--ss-plot3d-bg-inner'],
      plot3d_background_outer: ['--ss-plot3d-bg-outer']
    };
  }

  /**
   * 根据类型查找主题
   */
  private findThemeByType(type: 'light' | 'dark'): ThemeDef | null {
    const allThemes = this.getAvailableThemes();
    
    // 优先查找匹配类型的主题
    const typeThemes = allThemes.filter(theme => {
      const themeType = this.getThemeTypeFromColors(theme.colors);
      return themeType === type;
    });
    
    if (typeThemes.length > 0) {
      // 优先返回标准主题
      const standardTheme = typeThemes.find(theme => 
        theme.title.toLowerCase() === type || 
        (type === 'light' && theme.title.toLowerCase() === 'default')
      );
      return standardTheme || typeThemes[0];
    }
    
    // 如果没有找到，返回默认主题
    return BUILTIN_THEMES[0];
  }

  /**
   * 根据颜色判断主题类型
   */
  private getThemeTypeFromColors(colors: SerialStudioColors): 'light' | 'dark' {
    // 通过背景颜色的亮度判断主题类型
    const bgColor = colors.base || colors.window || '#ffffff';
    const rgb = this.hexToRgb(bgColor);
    if (rgb) {
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 128 ? 'light' : 'dark';
    }
    return 'light';
  }

  /**
   * 十六进制颜色转换为RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * 根据ID查找主题
   */
  private findThemeById(themeId: string): ThemeDef | null {
    return this.getAvailableThemes().find(theme => 
      theme.title.toLowerCase() === themeId.toLowerCase()
    ) || null;
  }

  /**
   * 根据标题查找主题
   */
  private findThemeByTitle(title: string): ThemeDef | null {
    return this.getAvailableThemes().find(theme => theme.title === title) || null;
  }

  /**
   * 验证主题
   */
  private validateTheme(theme: any): ThemeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 基础结构验证
    if (!theme || typeof theme !== 'object') {
      errors.push('Theme must be an object');
      return { valid: false, errors, warnings };
    }
    
    // 必要字段验证
    if (!theme.title || typeof theme.title !== 'string') {
      errors.push('Theme must have a title');
    }
    
    if (!theme.colors || typeof theme.colors !== 'object') {
      errors.push('Theme must have colors object');
    }
    
    if (!theme.translations || typeof theme.translations !== 'object') {
      warnings.push('Theme should have translations object');
    }
    
    if (!theme.parameters || typeof theme.parameters !== 'object') {
      warnings.push('Theme should have parameters object');
    }
    
    // 颜色验证
    if (theme.colors) {
      const requiredColors = ['text', 'base', 'accent', 'error'];
      requiredColors.forEach(color => {
        if (!theme.colors[color]) {
          errors.push(`Missing required color: ${color}`);
        }
      });
      
      if (!theme.colors.widget_colors || !Array.isArray(theme.colors.widget_colors)) {
        errors.push('Theme must have widget_colors array');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 通知主题变更
   */
  private notifyThemeChanged(theme: ThemeDef): void {
    this.themeListeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * 通知主题类型变更
   */
  private notifyThemeTypeChanged(type: ThemeType): void {
    this.themeTypeListeners.forEach(listener => {
      try {
        listener(type);
      } catch (error) {
        console.error('Error in theme type change listener:', error);
      }
    });
  }

  /**
   * 通知系统主题变更
   */
  private notifySystemThemeChanged(isDark: boolean): void {
    this.systemThemeListeners.forEach(listener => {
      try {
        listener(isDark);
      } catch (error) {
        console.error('Error in system theme change listener:', error);
      }
    });
  }

  /**
   * 保存主题配置
   */
  private saveThemeConfig(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    const config: ThemeConfig = {
      themeType: this.currentThemeType,
      themeId: this.currentTheme?.title || 'Default',
      customThemes: this.customThemes
    };
    
    try {
      localStorage.setItem('serial-studio-theme-config', JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save theme config:', error);
    }
  }

  /**
   * 加载主题配置
   */
  private loadThemeConfig(): ThemeConfig {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('serial-studio-theme-config');
        if (stored) {
          const config = JSON.parse(stored);
          return {
            themeType: config.themeType || 'auto',
            themeId: config.themeId || 'Default',
            customThemes: config.customThemes || []
          };
        }
      } catch (error) {
        console.warn('Failed to load theme config:', error);
      }
    }
    
    return {
      themeType: 'auto',
      themeId: 'Default',
      customThemes: []
    };
  }

  /**
   * 保存自定义主题
   */
  private async saveCustomThemes(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('serial-studio-custom-themes', JSON.stringify(this.customThemes));
      } catch (error) {
        console.warn('Failed to save custom themes:', error);
      }
    }
  }

  /**
   * 加载自定义主题
   */
  private async loadCustomThemes(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('serial-studio-custom-themes');
        if (stored) {
          const themes = JSON.parse(stored);
          this.customThemes = themes.filter((theme: any) => this.validateTheme(theme).valid);
        }
      } catch (error) {
        console.warn('Failed to load custom themes:', error);
      }
    }
  }

  /**
   * 销毁主题管理器
   */
  public destroy(): void {
    // 移除媒体查询监听器
    if (this.mediaQueryListener && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }
    
    // 清空监听器
    this.themeListeners = [];
    this.themeTypeListeners = [];
    this.systemThemeListeners = [];
    
    // 重置实例  
    ThemeManager.instance = null;
  }
}
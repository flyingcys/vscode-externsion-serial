/**
 * Theme Manager for Serial-Studio VSCode Extension
 * 完全兼容Serial-Studio的主题管理器
 */
import type { ThemeDef, ThemeType, SerialStudioColors } from '../types/ThemeDef';
/**
 * 主题变更监听器
 */
type ThemeListener = (theme: ThemeDef) => void;
type ThemeTypeListener = (type: ThemeType) => void;
type SystemThemeListener = (isDark: boolean) => void;
/**
 * Serial-Studio兼容的主题管理器
 */
export declare class ThemeManager {
    private static instance;
    private currentTheme;
    private currentThemeType;
    private systemPrefersDark;
    private customThemes;
    private themeListeners;
    private themeTypeListeners;
    private systemThemeListeners;
    private cssVariableMap;
    private mediaQueryListener;
    private constructor();
    /**
     * 获取主题管理器单例
     */
    static getInstance(): ThemeManager;
    /**
     * 初始化主题系统
     */
    initialize(): Promise<void>;
    /**
     * 获取所有可用主题
     */
    getAvailableThemes(): ThemeDef[];
    /**
     * 获取当前主题
     */
    getCurrentTheme(): ThemeDef | null;
    /**
     * 获取当前主题类型
     */
    getCurrentThemeType(): ThemeType;
    /**
     * 检测系统是否偏好深色主题
     */
    isSystemPrefersDark(): boolean;
    /**
     * 获取有效的主题类型（解析auto）
     */
    getEffectiveThemeType(): 'light' | 'dark';
    /**
     * 设置主题类型
     */
    setThemeType(type: ThemeType, save?: boolean): Promise<void>;
    /**
     * 设置主题
     */
    setTheme(themeId: string, save?: boolean): Promise<void>;
    /**
     * 加载主题
     */
    loadTheme(themeTitle: string, save?: boolean): Promise<void>;
    /**
     * 切换深色/浅色主题
     */
    toggleTheme(): Promise<void>;
    /**
     * 添加自定义主题
     */
    addCustomTheme(theme: ThemeDef): Promise<void>;
    /**
     * 删除自定义主题
     */
    removeCustomTheme(themeTitle: string): Promise<void>;
    /**
     * 导出主题
     */
    exportTheme(themeTitle: string): string;
    /**
     * 导入主题
     */
    importTheme(themeJson: string): Promise<void>;
    /**
     * 获取图表颜色
     */
    getChartColors(): string[];
    /**
     * 获取主题颜色值
     */
    getThemeColor(colorKey: keyof SerialStudioColors): string;
    /**
     * 添加主题变更监听器
     */
    onThemeChanged(listener: ThemeListener): () => void;
    /**
     * 添加主题类型变更监听器
     */
    onThemeTypeChanged(listener: ThemeTypeListener): () => void;
    /**
     * 添加系统主题变更监听器
     */
    onSystemThemeChanged(listener: SystemThemeListener): () => void;
    /**
     * 重置主题设置
     */
    reset(): Promise<void>;
    /**
     * 检测系统主题偏好
     */
    private detectSystemTheme;
    /**
     * 设置媒体查询监听器
     */
    private setupMediaQueryListener;
    /**
     * 应用主题到DOM
     */
    private applyTheme;
    /**
     * 创建CSS变量映射表
     */
    private createCSSVariableMap;
    /**
     * 根据类型查找主题
     */
    private findThemeByType;
    /**
     * 根据颜色判断主题类型
     */
    private getThemeTypeFromColors;
    /**
     * 十六进制颜色转换为RGB
     */
    private hexToRgb;
    /**
     * 根据ID查找主题
     */
    private findThemeById;
    /**
     * 根据标题查找主题
     */
    private findThemeByTitle;
    /**
     * 验证主题
     */
    private validateTheme;
    /**
     * 通知主题变更
     */
    private notifyThemeChanged;
    /**
     * 通知主题类型变更
     */
    private notifyThemeTypeChanged;
    /**
     * 通知系统主题变更
     */
    private notifySystemThemeChanged;
    /**
     * 保存主题配置
     */
    private saveThemeConfig;
    /**
     * 加载主题配置
     */
    private loadThemeConfig;
    /**
     * 保存自定义主题
     */
    private saveCustomThemes;
    /**
     * 加载自定义主题
     */
    private loadCustomThemes;
    /**
     * 销毁主题管理器
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=ThemeManager.d.ts.map
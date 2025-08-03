/**
 * Built-in Themes for Serial-Studio VSCode Extension
 * 与Serial-Studio完全兼容的内置主题
 */
import type { ThemeDef } from '../types/ThemeDef';
/**
 * 默认主题（浅色）- 基于Serial-Studio default.json
 */
export declare const defaultTheme: ThemeDef;
/**
 * 深色主题 - 基于Serial-Studio dark.json
 */
export declare const darkTheme: ThemeDef;
/**
 * 轻量主题
 */
export declare const lightTheme: ThemeDef;
/**
 * Iron主题 - 基于Serial-Studio iron.json (如果存在)
 */
export declare const ironTheme: ThemeDef;
/**
 * Midnight主题 - 极深的黑色主题
 */
export declare const midnightTheme: ThemeDef;
/**
 * 高对比度主题 - 提升可访问性
 */
export declare const highContrastTheme: ThemeDef;
/**
 * 所有内置主题
 */
export declare const BUILTIN_THEMES: ThemeDef[];
/**
 * 根据主题ID获取内置主题
 */
export declare const getBuiltInTheme: (themeId: string) => ThemeDef | undefined;
//# sourceMappingURL=builtin-themes.d.ts.map
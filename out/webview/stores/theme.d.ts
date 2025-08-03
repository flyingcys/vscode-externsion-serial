/**
 * Theme Store for Serial Studio VSCode Extension
 * 主题管理存储
 */
/// <reference types="@/types/vue" />
/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark' | 'auto';
/**
 * 颜色主题接口
 */
export interface ColorTheme {
    id: string;
    name: string;
    type: 'light' | 'dark';
    colors: {
        primary: string;
        success: string;
        warning: string;
        danger: string;
        info: string;
        text: {
            primary: string;
            regular: string;
            secondary: string;
            placeholder: string;
            disabled: string;
        };
        background: {
            primary: string;
            secondary: string;
            overlay: string;
        };
        border: {
            light: string;
            base: string;
            dark: string;
        };
        fill: {
            blank: string;
            light: string;
            lighter: string;
            extra_light: string;
            dark: string;
            darker: string;
        };
    };
}
export declare const useThemeStore: import("pinia").StoreDefinition<"theme", any, any, any>;
export default useThemeStore;
//# sourceMappingURL=theme.d.ts.map
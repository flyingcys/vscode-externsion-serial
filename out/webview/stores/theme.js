"use strict";
/**
 * Theme Store for Serial Studio VSCode Extension
 * 主题管理存储
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeStore = void 0;
const pinia_1 = require("pinia");
const vue_1 = require("vue");
/**
 * 预定义主题
 */
const PREDEFINED_THEMES = [
    {
        id: 'light',
        name: '浅色主题',
        type: 'light',
        colors: {
            primary: '#409eff',
            success: '#67c23a',
            warning: '#e6a23c',
            danger: '#f56c6c',
            info: '#909399',
            text: {
                primary: '#303133',
                regular: '#606266',
                secondary: '#909399',
                placeholder: '#a8abb2',
                disabled: '#c0c4cc'
            },
            background: {
                primary: '#ffffff',
                secondary: '#f5f7fa',
                overlay: 'rgba(255, 255, 255, 0.9)'
            },
            border: {
                light: '#e4e7ed',
                base: '#dcdfe6',
                dark: '#d4d7de'
            },
            fill: {
                blank: '#ffffff',
                light: '#f0f2f5',
                lighter: '#f5f7fa',
                extra_light: '#fafafa',
                dark: '#ebeef5',
                darker: '#e6e8eb'
            }
        }
    },
    {
        id: 'dark',
        name: '深色主题',
        type: 'dark',
        colors: {
            primary: '#409eff',
            success: '#67c23a',
            warning: '#e6a23c',
            danger: '#f56c6c',
            info: '#909399',
            text: {
                primary: '#e5eaf3',
                regular: '#cfd3dc',
                secondary: '#a3a6ad',
                placeholder: '#8d9095',
                disabled: '#6c6e72'
            },
            background: {
                primary: '#141414',
                secondary: '#1d1e1f',
                overlay: 'rgba(20, 20, 20, 0.9)'
            },
            border: {
                light: '#414243',
                base: '#4c4d4f',
                dark: '#58585b'
            },
            fill: {
                blank: '#1d1e1f',
                light: '#262727',
                lighter: '#1d1e1f',
                extra_light: '#191a1b',
                dark: '#39393a',
                darker: '#2b2b2c'
            }
        }
    },
    {
        id: 'vs-dark',
        name: 'VS Code 深色',
        type: 'dark',
        colors: {
            primary: '#007acc',
            success: '#89d185',
            warning: '#ffcc02',
            danger: '#f14c4c',
            info: '#75beff',
            text: {
                primary: '#cccccc',
                regular: '#cccccc',
                secondary: '#969696',
                placeholder: '#6a6a6a',
                disabled: '#5a5a5a'
            },
            background: {
                primary: '#1e1e1e',
                secondary: '#252526',
                overlay: 'rgba(30, 30, 30, 0.95)'
            },
            border: {
                light: '#3e3e42',
                base: '#464647',
                dark: '#525252'
            },
            fill: {
                blank: '#252526',
                light: '#2d2d30',
                lighter: '#252526',
                extra_light: '#1e1e1e',
                dark: '#3e3e42',
                darker: '#464647'
            }
        }
    }
];
exports.useThemeStore = (0, pinia_1.defineStore)('theme', () => {
    // === 状态 ===
    const currentThemeType = (0, vue_1.ref)('auto');
    const currentThemeId = (0, vue_1.ref)('light');
    const isDarkMode = (0, vue_1.ref)(false);
    const systemPrefersDark = (0, vue_1.ref)(false);
    const customThemes = (0, vue_1.ref)([]);
    // === 计算属性 ===
    const availableThemes = (0, vue_1.computed)(() => [
        ...PREDEFINED_THEMES,
        ...customThemes.value
    ]);
    const currentTheme = (0, vue_1.computed)(() => {
        return availableThemes.value.find(theme => theme.id === currentThemeId.value)
            || PREDEFINED_THEMES[0];
    });
    const effectiveThemeType = (0, vue_1.computed)(() => {
        if (currentThemeType.value === 'auto') {
            return systemPrefersDark.value ? 'dark' : 'light';
        }
        return currentThemeType.value;
    });
    // === 方法 ===
    /**
     * 初始化主题系统
     */
    const initializeTheme = () => {
        // 检测系统主题偏好
        detectSystemTheme();
        // 从本地存储加载设置
        loadThemeSettings();
        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        // 应用主题
        applyTheme();
        console.log('主题系统已初始化');
    };
    /**
     * 检测系统主题偏好
     */
    const detectSystemTheme = () => {
        systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    /**
     * 处理系统主题变化
     * @param event 媒体查询事件
     */
    const handleSystemThemeChange = (event) => {
        systemPrefersDark.value = event.matches;
        if (currentThemeType.value === 'auto') {
            applyTheme();
        }
    };
    /**
     * 设置主题类型
     * @param type 主题类型
     */
    const setThemeType = (type) => {
        currentThemeType.value = type;
        // 如果是auto模式，根据系统主题选择具体主题
        if (type === 'auto') {
            const targetType = systemPrefersDark.value ? 'dark' : 'light';
            const autoTheme = availableThemes.value.find(theme => theme.type === targetType);
            if (autoTheme) {
                currentThemeId.value = autoTheme.id;
            }
        }
        applyTheme();
        saveThemeSettings();
    };
    /**
     * 设置具体主题
     * @param themeId 主题ID
     */
    const setTheme = (themeId) => {
        const theme = availableThemes.value.find(t => t.id === themeId);
        if (!theme) {
            console.warn(`主题 ${themeId} 不存在`);
            return;
        }
        currentThemeId.value = themeId;
        currentThemeType.value = theme.type;
        applyTheme();
        saveThemeSettings();
    };
    /**
     * 应用主题到DOM
     */
    const applyTheme = () => {
        const theme = currentTheme.value;
        const root = document.documentElement;
        // 设置暗色模式标志
        isDarkMode.value = effectiveThemeType.value === 'dark';
        // 应用CSS变量
        root.style.setProperty('--el-color-primary', theme.colors.primary);
        root.style.setProperty('--el-color-success', theme.colors.success);
        root.style.setProperty('--el-color-warning', theme.colors.warning);
        root.style.setProperty('--el-color-danger', theme.colors.danger);
        root.style.setProperty('--el-color-info', theme.colors.info);
        // 文本颜色
        root.style.setProperty('--el-text-color-primary', theme.colors.text.primary);
        root.style.setProperty('--el-text-color-regular', theme.colors.text.regular);
        root.style.setProperty('--el-text-color-secondary', theme.colors.text.secondary);
        root.style.setProperty('--el-text-color-placeholder', theme.colors.text.placeholder);
        root.style.setProperty('--el-text-color-disabled', theme.colors.text.disabled);
        // 背景颜色
        root.style.setProperty('--el-bg-color', theme.colors.background.primary);
        root.style.setProperty('--el-bg-color-page', theme.colors.background.secondary);
        root.style.setProperty('--el-bg-color-overlay', theme.colors.background.overlay);
        // 边框颜色
        root.style.setProperty('--el-border-color-light', theme.colors.border.light);
        root.style.setProperty('--el-border-color', theme.colors.border.base);
        root.style.setProperty('--el-border-color-dark', theme.colors.border.dark);
        // 填充颜色
        root.style.setProperty('--el-fill-color-blank', theme.colors.fill.blank);
        root.style.setProperty('--el-fill-color-light', theme.colors.fill.light);
        root.style.setProperty('--el-fill-color-lighter', theme.colors.fill.lighter);
        root.style.setProperty('--el-fill-color-extra-light', theme.colors.fill.extra_light);
        root.style.setProperty('--el-fill-color-dark', theme.colors.fill.dark);
        root.style.setProperty('--el-fill-color-darker', theme.colors.fill.darker);
        // 添加主题类到body
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${effectiveThemeType.value}-theme`);
        // 设置Element Plus的暗色主题
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    };
    /**
     * 切换主题（浅色/深色）
     */
    const toggleTheme = () => {
        const newType = isDarkMode.value ? 'light' : 'dark';
        const targetTheme = availableThemes.value.find(theme => theme.type === newType);
        if (targetTheme) {
            setTheme(targetTheme.id);
        }
    };
    /**
     * 添加自定义主题
     * @param theme 自定义主题
     */
    const addCustomTheme = (theme) => {
        // 检查是否已存在相同ID的主题
        const existingIndex = customThemes.value.findIndex(t => t.id === theme.id);
        if (existingIndex >= 0) {
            customThemes.value[existingIndex] = theme;
        }
        else {
            customThemes.value.push(theme);
        }
        saveCustomThemes();
    };
    /**
     * 删除自定义主题
     * @param themeId 主题ID
     */
    const removeCustomTheme = (themeId) => {
        // 不允许删除预定义主题
        if (PREDEFINED_THEMES.some(theme => theme.id === themeId)) {
            console.warn('不能删除预定义主题');
            return;
        }
        customThemes.value = customThemes.value.filter(theme => theme.id !== themeId);
        // 如果当前主题被删除，切换到默认主题
        if (currentThemeId.value === themeId) {
            setTheme('light');
        }
        saveCustomThemes();
    };
    /**
     * 导出主题配置
     * @param themeId 主题ID
     * @returns 主题配置JSON字符串
     */
    const exportTheme = (themeId) => {
        const theme = availableThemes.value.find(t => t.id === themeId);
        if (!theme) {
            throw new Error(`主题 ${themeId} 不存在`);
        }
        return JSON.stringify(theme, null, 2);
    };
    /**
     * 导入主题配置
     * @param themeJson 主题配置JSON字符串
     */
    const importTheme = (themeJson) => {
        try {
            const theme = JSON.parse(themeJson);
            // 验证主题结构
            if (!validateTheme(theme)) {
                throw new Error('主题配置格式不正确');
            }
            addCustomTheme(theme);
        }
        catch (error) {
            throw new Error(`导入主题失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    /**
     * 验证主题配置
     * @param theme 主题配置
     * @returns 是否有效
     */
    const validateTheme = (theme) => {
        return theme &&
            typeof theme.id === 'string' &&
            typeof theme.name === 'string' &&
            (theme.type === 'light' || theme.type === 'dark') &&
            theme.colors &&
            typeof theme.colors.primary === 'string';
    };
    /**
     * 重置主题设置
     */
    const resetTheme = () => {
        currentThemeType.value = 'auto';
        currentThemeId.value = 'light';
        customThemes.value = [];
        applyTheme();
        saveThemeSettings();
        saveCustomThemes();
    };
    /**
     * 获取当前主题的图表颜色配置
     */
    const getChartColors = () => {
        const theme = currentTheme.value;
        return {
            primary: theme.colors.primary,
            success: theme.colors.success,
            warning: theme.colors.warning,
            danger: theme.colors.danger,
            info: theme.colors.info,
            text: theme.colors.text.primary,
            background: theme.colors.background.primary,
            grid: theme.colors.border.light,
            axis: theme.colors.text.secondary
        };
    };
    // === 本地存储方法 ===
    /**
     * 保存主题设置到本地存储
     */
    const saveThemeSettings = () => {
        const settings = {
            themeType: currentThemeType.value,
            themeId: currentThemeId.value
        };
        localStorage.setItem('serial-studio-theme-settings', JSON.stringify(settings));
    };
    /**
     * 从本地存储加载主题设置
     */
    const loadThemeSettings = () => {
        try {
            const stored = localStorage.getItem('serial-studio-theme-settings');
            if (stored) {
                const settings = JSON.parse(stored);
                currentThemeType.value = settings.themeType || 'auto';
                currentThemeId.value = settings.themeId || 'light';
            }
        }
        catch (error) {
            console.warn('加载主题设置失败:', error);
        }
    };
    /**
     * 保存自定义主题到本地存储
     */
    const saveCustomThemes = () => {
        localStorage.setItem('serial-studio-custom-themes', JSON.stringify(customThemes.value));
    };
    /**
     * 从本地存储加载自定义主题
     */
    const loadCustomThemes = () => {
        try {
            const stored = localStorage.getItem('serial-studio-custom-themes');
            if (stored) {
                const themes = JSON.parse(stored);
                customThemes.value = themes.filter(validateTheme);
            }
        }
        catch (error) {
            console.warn('加载自定义主题失败:', error);
        }
    };
    // 在初始化时加载自定义主题
    loadCustomThemes();
    // 监听主题变化
    (0, vue_1.watch)(currentThemeId, () => {
        applyTheme();
    });
    // 返回store API
    return {
        // 状态
        currentThemeType: (0, vue_1.computed)(() => currentThemeType.value),
        currentThemeId: (0, vue_1.computed)(() => currentThemeId.value),
        isDarkMode: (0, vue_1.computed)(() => isDarkMode.value),
        systemPrefersDark: (0, vue_1.computed)(() => systemPrefersDark.value),
        // 计算属性
        availableThemes,
        currentTheme,
        effectiveThemeType,
        // 方法
        initializeTheme,
        setThemeType,
        setTheme,
        toggleTheme,
        addCustomTheme,
        removeCustomTheme,
        exportTheme,
        importTheme,
        resetTheme,
        getChartColors
    };
});
exports.default = exports.useThemeStore;
//# sourceMappingURL=theme.js.map
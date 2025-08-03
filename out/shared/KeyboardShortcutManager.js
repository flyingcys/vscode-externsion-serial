"use strict";
/**
 * 统一键盘快捷键管理器
 * 提供全局键盘快捷键绑定和管理功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalShortcutManager = exports.keyboardShortcut = exports.KeyboardShortcutManager = exports.ShortcutCategory = void 0;
const events_1 = require("events");
/**
 * 快捷键类别
 */
var ShortcutCategory;
(function (ShortcutCategory) {
    ShortcutCategory["GENERAL"] = "general";
    ShortcutCategory["NAVIGATION"] = "navigation";
    ShortcutCategory["EDIT"] = "edit";
    ShortcutCategory["VIEW"] = "view";
    ShortcutCategory["DATA"] = "data";
    ShortcutCategory["CONNECTION"] = "connection";
    ShortcutCategory["EXPORT"] = "export";
    ShortcutCategory["DEBUG"] = "debug";
    ShortcutCategory["SETTINGS"] = "settings"; // 设置
})(ShortcutCategory = exports.ShortcutCategory || (exports.ShortcutCategory = {}));
/**
 * 键盘快捷键管理器
 */
class KeyboardShortcutManager extends events_1.EventEmitter {
    static instance = null;
    shortcuts = new Map();
    keyBindings = new Map(); // 键组合 -> 快捷键ID列表
    currentContext = {};
    enabled = true;
    recording = false;
    recordingCallback = null;
    constructor() {
        super();
        this.setupEventListeners();
        this.initializeDefaultShortcuts();
    }
    /**
     * 获取全局键盘快捷键管理器实例
     */
    static getInstance() {
        if (!KeyboardShortcutManager.instance) {
            KeyboardShortcutManager.instance = new KeyboardShortcutManager();
        }
        return KeyboardShortcutManager.instance;
    }
    /**
     * 注册快捷键
     */
    registerShortcut(shortcut) {
        // 检查快捷键冲突
        const conflicts = this.checkConflicts(shortcut);
        if (conflicts.length > 0) {
            console.warn('快捷键冲突:', conflicts);
            this.emit('conflict', { shortcut, conflicts });
            return false;
        }
        // 注册快捷键
        this.shortcuts.set(shortcut.id, {
            enabled: true,
            global: false,
            preventDefault: true,
            stopPropagation: false,
            priority: 100,
            ...shortcut
        });
        // 建立键绑定映射
        const keyCombo = this.getKeyCombo(shortcut.key, shortcut.modifiers);
        const existingBindings = this.keyBindings.get(keyCombo) || [];
        existingBindings.push(shortcut.id);
        this.keyBindings.set(keyCombo, existingBindings);
        this.emit('shortcut:registered', shortcut);
        return true;
    }
    /**
     * 批量注册快捷键
     */
    registerShortcuts(shortcuts) {
        const failed = [];
        for (const shortcut of shortcuts) {
            const success = this.registerShortcut(shortcut);
            if (!success) {
                failed.push({
                    shortcut,
                    reason: 'conflict'
                });
            }
        }
        if (failed.length > 0) {
            this.emit('batch:failed', failed);
        }
    }
    /**
     * 注销快捷键
     */
    unregisterShortcut(shortcutId) {
        const shortcut = this.shortcuts.get(shortcutId);
        if (!shortcut) {
            return false;
        }
        // 移除键绑定
        const keyCombo = this.getKeyCombo(shortcut.key, shortcut.modifiers);
        const bindings = this.keyBindings.get(keyCombo) || [];
        const index = bindings.indexOf(shortcutId);
        if (index !== -1) {
            bindings.splice(index, 1);
            if (bindings.length === 0) {
                this.keyBindings.delete(keyCombo);
            }
            else {
                this.keyBindings.set(keyCombo, bindings);
            }
        }
        // 移除快捷键
        this.shortcuts.delete(shortcutId);
        this.emit('shortcut:unregistered', shortcut);
        return true;
    }
    /**
     * 启用/禁用快捷键
     */
    setShortcutEnabled(shortcutId, enabled) {
        const shortcut = this.shortcuts.get(shortcutId);
        if (!shortcut) {
            return false;
        }
        shortcut.enabled = enabled;
        this.emit('shortcut:toggled', { shortcut, enabled });
        return true;
    }
    /**
     * 更新快捷键上下文
     */
    updateContext(context) {
        this.currentContext = {
            ...this.currentContext,
            ...context
        };
        this.emit('context:updated', this.currentContext);
    }
    /**
     * 获取所有快捷键
     */
    getShortcuts() {
        return Array.from(this.shortcuts.values());
    }
    /**
     * 按类别获取快捷键
     */
    getShortcutsByCategory(category) {
        return this.getShortcuts().filter(s => s.category === category);
    }
    /**
     * 获取快捷键
     */
    getShortcut(shortcutId) {
        return this.shortcuts.get(shortcutId);
    }
    /**
     * 检查快捷键冲突
     */
    checkConflicts(shortcut) {
        const conflicts = [];
        const keyCombo = this.getKeyCombo(shortcut.key, shortcut.modifiers);
        const existingIds = this.keyBindings.get(keyCombo) || [];
        for (const existingId of existingIds) {
            const existing = this.shortcuts.get(existingId);
            if (existing && existing.id !== shortcut.id) {
                // 检查上下文重叠
                if (this.hasContextOverlap(existing, shortcut)) {
                    conflicts.push({
                        existingShortcut: existing,
                        newShortcut: shortcut,
                        conflictType: 'exact'
                    });
                }
            }
        }
        return conflicts;
    }
    /**
     * 开始录制快捷键
     */
    startRecording(callback) {
        this.recording = true;
        this.recordingCallback = callback;
        this.emit('recording:started');
    }
    /**
     * 停止录制快捷键
     */
    stopRecording() {
        this.recording = false;
        this.recordingCallback = null;
        this.emit('recording:stopped');
    }
    /**
     * 启用/禁用快捷键系统
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.emit('system:toggled', enabled);
    }
    /**
     * 重置所有快捷键为默认设置
     */
    resetToDefaults() {
        this.shortcuts.clear();
        this.keyBindings.clear();
        this.initializeDefaultShortcuts();
        this.emit('system:reset');
    }
    /**
     * 导出快捷键配置
     */
    exportConfig() {
        const config = Array.from(this.shortcuts.values()).map(shortcut => ({
            id: shortcut.id,
            key: shortcut.key,
            modifiers: shortcut.modifiers,
            description: shortcut.description,
            category: shortcut.category,
            enabled: shortcut.enabled,
            global: shortcut.global,
            context: shortcut.context,
            priority: shortcut.priority
        }));
        return JSON.stringify(config, null, 2);
    }
    /**
     * 导入快捷键配置
     */
    importConfig(configJson) {
        try {
            const config = JSON.parse(configJson);
            // 清除现有配置
            this.shortcuts.clear();
            this.keyBindings.clear();
            // 导入新配置
            for (const shortcutConfig of config) {
                // 注意：这里不包含action，需要由应用程序重新绑定
                console.warn(`快捷键 ${shortcutConfig.id} 需要重新绑定动作`);
            }
            this.emit('config:imported', config);
            return true;
        }
        catch (error) {
            console.error('导入快捷键配置失败:', error);
            return false;
        }
    }
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        if (typeof window === 'undefined') {
            return;
        }
        // 键盘按下事件
        window.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        // 焦点变化监听
        window.addEventListener('focusin', this.handleFocusChange.bind(this));
        window.addEventListener('focusout', this.handleFocusChange.bind(this));
    }
    /**
     * 处理键盘按下事件
     */
    handleKeyDown(event) {
        if (!this.enabled) {
            return;
        }
        const keyCombo = this.getKeyComboFromEvent(event);
        // 录制模式
        if (this.recording && this.recordingCallback) {
            this.recordingCallback(keyCombo);
            return;
        }
        // 查找匹配的快捷键
        const matchingShortcuts = this.findMatchingShortcuts(keyCombo, event);
        if (matchingShortcuts.length === 0) {
            return;
        }
        // 按优先级排序
        matchingShortcuts.sort((a, b) => (a.priority || 100) - (b.priority || 100));
        // 执行第一个匹配的快捷键
        const shortcut = matchingShortcuts[0];
        if (shortcut.preventDefault) {
            event.preventDefault();
        }
        if (shortcut.stopPropagation) {
            event.stopPropagation();
        }
        try {
            this.emit('shortcut:triggered', { shortcut, event });
            shortcut.action();
        }
        catch (error) {
            console.error(`执行快捷键 ${shortcut.id} 失败:`, error);
            this.emit('shortcut:error', { shortcut, error });
        }
    }
    /**
     * 处理焦点变化
     */
    handleFocusChange(event) {
        const target = event.target;
        this.updateContext({
            activeElement: target,
            focusedInput: this.isInputElement(target)
        });
    }
    /**
     * 查找匹配的快捷键
     */
    findMatchingShortcuts(keyCombo, event) {
        const shortcutIds = this.keyBindings.get(keyCombo) || [];
        const matchingShortcuts = [];
        for (const shortcutId of shortcutIds) {
            const shortcut = this.shortcuts.get(shortcutId);
            if (!shortcut || !shortcut.enabled) {
                continue;
            }
            // 检查上下文匹配
            if (this.isContextMatch(shortcut, event)) {
                matchingShortcuts.push(shortcut);
            }
        }
        return matchingShortcuts;
    }
    /**
     * 检查上下文是否匹配
     */
    isContextMatch(shortcut, event) {
        // 全局快捷键总是匹配
        if (shortcut.global) {
            return true;
        }
        // 如果没有指定上下文，默认匹配
        if (!shortcut.context || shortcut.context.length === 0) {
            return true;
        }
        // 检查输入框焦点
        if (this.currentContext.focusedInput && !shortcut.context.includes('input')) {
            return false;
        }
        // 检查模态框状态
        if (this.currentContext.modalOpen && !shortcut.context.includes('modal')) {
            return false;
        }
        // 检查当前视图
        if (this.currentContext.currentView && shortcut.context.includes(`view:${this.currentContext.currentView}`)) {
            return true;
        }
        // 检查自定义上下文
        for (const context of shortcut.context) {
            if (context.startsWith('custom:')) {
                const customKey = context.replace('custom:', '');
                if (this.currentContext.customContext?.[customKey]) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * 检查两个快捷键是否有上下文重叠
     */
    hasContextOverlap(existing, newShortcut) {
        // 如果任一是全局快捷键，则有重叠
        if (existing.global || newShortcut.global) {
            return true;
        }
        // 如果都没有指定上下文，则有重叠
        if ((!existing.context || existing.context.length === 0) &&
            (!newShortcut.context || newShortcut.context.length === 0)) {
            return true;
        }
        // 检查上下文交集
        const existingContexts = new Set(existing.context || []);
        const newContexts = new Set(newShortcut.context || []);
        for (const context of newContexts) {
            if (existingContexts.has(context)) {
                return true;
            }
        }
        return false;
    }
    /**
     * 从事件获取键组合
     */
    getKeyComboFromEvent(event) {
        return this.getKeyCombo(event.key, {
            ctrl: event.ctrlKey,
            alt: event.altKey,
            shift: event.shiftKey,
            meta: event.metaKey
        });
    }
    /**
     * 获取键组合字符串
     */
    getKeyCombo(key, modifiers) {
        const parts = [];
        if (modifiers?.ctrl) {
            parts.push('Ctrl');
        }
        if (modifiers?.alt) {
            parts.push('Alt');
        }
        if (modifiers?.shift) {
            parts.push('Shift');
        }
        if (modifiers?.meta) {
            parts.push('Meta');
        }
        parts.push(key);
        return parts.join('+');
    }
    /**
     * 判断是否为输入元素
     */
    isInputElement(element) {
        const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTags.includes(element.tagName) ||
            element.contentEditable === 'true';
    }
    /**
     * 初始化默认快捷键
     */
    initializeDefaultShortcuts() {
        const defaultShortcuts = [
            // 通用快捷键
            {
                id: 'general.help',
                key: 'F1',
                description: '显示帮助',
                category: ShortcutCategory.GENERAL,
                global: true
            },
            {
                id: 'general.search',
                key: 'f',
                modifiers: { ctrl: true },
                description: '搜索',
                category: ShortcutCategory.GENERAL
            },
            {
                id: 'general.settings',
                key: ',',
                modifiers: { ctrl: true },
                description: '打开设置',
                category: ShortcutCategory.GENERAL
            },
            // 导航快捷键
            {
                id: 'navigation.back',
                key: 'ArrowLeft',
                modifiers: { alt: true },
                description: '后退',
                category: ShortcutCategory.NAVIGATION
            },
            {
                id: 'navigation.forward',
                key: 'ArrowRight',
                modifiers: { alt: true },
                description: '前进',
                category: ShortcutCategory.NAVIGATION
            },
            {
                id: 'navigation.refresh',
                key: 'F5',
                description: '刷新',
                category: ShortcutCategory.NAVIGATION
            },
            // 编辑快捷键
            {
                id: 'edit.copy',
                key: 'c',
                modifiers: { ctrl: true },
                description: '复制',
                category: ShortcutCategory.EDIT,
                context: ['input']
            },
            {
                id: 'edit.paste',
                key: 'v',
                modifiers: { ctrl: true },
                description: '粘贴',
                category: ShortcutCategory.EDIT,
                context: ['input']
            },
            {
                id: 'edit.selectAll',
                key: 'a',
                modifiers: { ctrl: true },
                description: '全选',
                category: ShortcutCategory.EDIT
            },
            // 视图快捷键
            {
                id: 'view.toggleFullscreen',
                key: 'F11',
                description: '切换全屏',
                category: ShortcutCategory.VIEW,
                global: true
            },
            {
                id: 'view.zoomIn',
                key: '=',
                modifiers: { ctrl: true },
                description: '放大',
                category: ShortcutCategory.VIEW
            },
            {
                id: 'view.zoomOut',
                key: '-',
                modifiers: { ctrl: true },
                description: '缩小',
                category: ShortcutCategory.VIEW
            },
            // 连接操作
            {
                id: 'connection.connect',
                key: 'Enter',
                modifiers: { ctrl: true },
                description: '连接设备',
                category: ShortcutCategory.CONNECTION
            },
            {
                id: 'connection.disconnect',
                key: 'd',
                modifiers: { ctrl: true, shift: true },
                description: '断开连接',
                category: ShortcutCategory.CONNECTION
            },
            // 数据操作
            {
                id: 'data.clear',
                key: 'Delete',
                modifiers: { ctrl: true },
                description: '清除数据',
                category: ShortcutCategory.DATA
            },
            {
                id: 'data.save',
                key: 's',
                modifiers: { ctrl: true },
                description: '保存数据',
                category: ShortcutCategory.DATA
            },
            // 导出操作
            {
                id: 'export.csv',
                key: 'e',
                modifiers: { ctrl: true },
                description: '导出CSV',
                category: ShortcutCategory.EXPORT
            },
            {
                id: 'export.screenshot',
                key: 'F12',
                description: '截图',
                category: ShortcutCategory.EXPORT
            }
        ];
        // 注册默认快捷键（需要应用程序提供具体的action实现）
        this.emit('defaults:ready', defaultShortcuts);
    }
    /**
     * 获取快捷键显示文本
     */
    getShortcutDisplayText(shortcut) {
        const parts = [];
        if (shortcut.modifiers?.ctrl) {
            parts.push('Ctrl');
        }
        if (shortcut.modifiers?.alt) {
            parts.push('Alt');
        }
        if (shortcut.modifiers?.shift) {
            parts.push('Shift');
        }
        if (shortcut.modifiers?.meta) {
            parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win');
        }
        // 转换特殊键名
        const keyDisplayNames = {
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'Enter': '⏎',
            'Escape': 'Esc',
            'Backspace': '⌫',
            'Delete': 'Del',
            'Tab': '⇥',
            ' ': 'Space'
        };
        const displayKey = keyDisplayNames[shortcut.key] || shortcut.key.toUpperCase();
        parts.push(displayKey);
        return parts.join(' + ');
    }
    /**
     * 销毁管理器
     */
    dispose() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
            window.removeEventListener('focusin', this.handleFocusChange.bind(this));
            window.removeEventListener('focusout', this.handleFocusChange.bind(this));
        }
        this.shortcuts.clear();
        this.keyBindings.clear();
        this.removeAllListeners();
        KeyboardShortcutManager.instance = null;
    }
}
exports.KeyboardShortcutManager = KeyboardShortcutManager;
/**
 * 快捷键装饰器
 */
function keyboardShortcut(shortcutConfig) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const shortcutManager = KeyboardShortcutManager.getInstance();
        // 在方法首次调用时注册快捷键
        let registered = false;
        descriptor.value = function (...args) {
            if (!registered) {
                shortcutManager.registerShortcut({
                    ...shortcutConfig,
                    id: `${target.constructor.name}.${propertyKey}`,
                    action: () => originalMethod.apply(this, args)
                });
                registered = true;
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.keyboardShortcut = keyboardShortcut;
/**
 * 全局键盘快捷键管理器实例
 */
exports.globalShortcutManager = KeyboardShortcutManager.getInstance();
//# sourceMappingURL=KeyboardShortcutManager.js.map
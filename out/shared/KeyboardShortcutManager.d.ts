/**
 * 统一键盘快捷键管理器
 * 提供全局键盘快捷键绑定和管理功能
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 修饰键
 */
export interface ModifierKeys {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
}
/**
 * 快捷键定义
 */
export interface KeyboardShortcut {
    id: string;
    key: string;
    modifiers?: ModifierKeys;
    description: string;
    category: string;
    action: () => void | Promise<void>;
    enabled?: boolean;
    global?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    context?: string[];
    priority?: number;
}
/**
 * 快捷键类别
 */
export declare enum ShortcutCategory {
    GENERAL = "general",
    NAVIGATION = "navigation",
    EDIT = "edit",
    VIEW = "view",
    DATA = "data",
    CONNECTION = "connection",
    EXPORT = "export",
    DEBUG = "debug",
    SETTINGS = "settings"
}
/**
 * 键盘事件上下文
 */
export interface KeyboardContext {
    activeElement?: HTMLElement;
    focusedInput?: boolean;
    modalOpen?: boolean;
    currentView?: string;
    customContext?: Record<string, any>;
}
/**
 * 快捷键冲突检测结果
 */
export interface ShortcutConflict {
    existingShortcut: KeyboardShortcut;
    newShortcut: KeyboardShortcut;
    conflictType: 'exact' | 'partial';
}
/**
 * 键盘快捷键管理器
 */
export declare class KeyboardShortcutManager extends EventEmitter {
    private static instance;
    private shortcuts;
    private keyBindings;
    private currentContext;
    private enabled;
    private recording;
    private recordingCallback;
    private constructor();
    /**
     * 获取全局键盘快捷键管理器实例
     */
    static getInstance(): KeyboardShortcutManager;
    /**
     * 注册快捷键
     */
    registerShortcut(shortcut: KeyboardShortcut): boolean;
    /**
     * 批量注册快捷键
     */
    registerShortcuts(shortcuts: KeyboardShortcut[]): void;
    /**
     * 注销快捷键
     */
    unregisterShortcut(shortcutId: string): boolean;
    /**
     * 启用/禁用快捷键
     */
    setShortcutEnabled(shortcutId: string, enabled: boolean): boolean;
    /**
     * 更新快捷键上下文
     */
    updateContext(context: Partial<KeyboardContext>): void;
    /**
     * 获取所有快捷键
     */
    getShortcuts(): KeyboardShortcut[];
    /**
     * 按类别获取快捷键
     */
    getShortcutsByCategory(category: string): KeyboardShortcut[];
    /**
     * 获取快捷键
     */
    getShortcut(shortcutId: string): KeyboardShortcut | undefined;
    /**
     * 检查快捷键冲突
     */
    checkConflicts(shortcut: KeyboardShortcut): ShortcutConflict[];
    /**
     * 开始录制快捷键
     */
    startRecording(callback: (shortcut: string) => void): void;
    /**
     * 停止录制快捷键
     */
    stopRecording(): void;
    /**
     * 启用/禁用快捷键系统
     */
    setEnabled(enabled: boolean): void;
    /**
     * 重置所有快捷键为默认设置
     */
    resetToDefaults(): void;
    /**
     * 导出快捷键配置
     */
    exportConfig(): string;
    /**
     * 导入快捷键配置
     */
    importConfig(configJson: string): boolean;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 处理键盘按下事件
     */
    private handleKeyDown;
    /**
     * 处理焦点变化
     */
    private handleFocusChange;
    /**
     * 查找匹配的快捷键
     */
    private findMatchingShortcuts;
    /**
     * 检查上下文是否匹配
     */
    private isContextMatch;
    /**
     * 检查两个快捷键是否有上下文重叠
     */
    private hasContextOverlap;
    /**
     * 从事件获取键组合
     */
    private getKeyComboFromEvent;
    /**
     * 获取键组合字符串
     */
    private getKeyCombo;
    /**
     * 判断是否为输入元素
     */
    private isInputElement;
    /**
     * 初始化默认快捷键
     */
    private initializeDefaultShortcuts;
    /**
     * 获取快捷键显示文本
     */
    getShortcutDisplayText(shortcut: KeyboardShortcut): string;
    /**
     * 销毁管理器
     */
    dispose(): void;
}
/**
 * 快捷键装饰器
 */
export declare function keyboardShortcut(shortcutConfig: Omit<KeyboardShortcut, 'id' | 'action'>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 全局键盘快捷键管理器实例
 */
export declare const globalShortcutManager: KeyboardShortcutManager;
//# sourceMappingURL=KeyboardShortcutManager.d.ts.map
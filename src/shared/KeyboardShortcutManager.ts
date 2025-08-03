/**
 * 统一键盘快捷键管理器
 * 提供全局键盘快捷键绑定和管理功能
 */

import { EventEmitter } from 'events';

/**
 * 修饰键
 */
export interface ModifierKeys {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Windows键/Cmd键
}

/**
 * 快捷键定义
 */
export interface KeyboardShortcut {
  id: string;                     // 快捷键唯一ID
  key: string;                    // 主键
  modifiers?: ModifierKeys;       // 修饰键
  description: string;            // 描述
  category: string;               // 分类
  action: () => void | Promise<void>; // 执行动作
  enabled?: boolean;              // 是否启用
  global?: boolean;               // 是否全局快捷键
  preventDefault?: boolean;       // 是否阻止默认行为
  stopPropagation?: boolean;      // 是否阻止事件冒泡
  context?: string[];             // 上下文限制
  priority?: number;              // 优先级（数字越小优先级越高）
}

/**
 * 快捷键类别
 */
export enum ShortcutCategory {
  GENERAL = 'general',           // 通用
  NAVIGATION = 'navigation',     // 导航
  EDIT = 'edit',                 // 编辑
  VIEW = 'view',                 // 视图
  DATA = 'data',                 // 数据操作
  CONNECTION = 'connection',     // 连接操作
  EXPORT = 'export',             // 导出
  DEBUG = 'debug',               // 调试
  SETTINGS = 'settings'          // 设置
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
export class KeyboardShortcutManager extends EventEmitter {
  private static instance: KeyboardShortcutManager | null = null;
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private keyBindings: Map<string, string[]> = new Map(); // 键组合 -> 快捷键ID列表
  private currentContext: KeyboardContext = {};
  private enabled = true;
  private recording = false;
  private recordingCallback: ((shortcut: string) => void) | null = null;

  private constructor() {
    super();
    this.setupEventListeners();
    this.initializeDefaultShortcuts();
  }

  /**
   * 获取全局键盘快捷键管理器实例
   */
  public static getInstance(): KeyboardShortcutManager {
    if (!KeyboardShortcutManager.instance) {
      KeyboardShortcutManager.instance = new KeyboardShortcutManager();
    }
    return KeyboardShortcutManager.instance;
  }

  /**
   * 注册快捷键
   */
  public registerShortcut(shortcut: KeyboardShortcut): boolean {
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
  public registerShortcuts(shortcuts: KeyboardShortcut[]): void {
    const failed: { shortcut: KeyboardShortcut; reason: string }[] = [];
    
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
  public unregisterShortcut(shortcutId: string): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) {return false;}

    // 移除键绑定
    const keyCombo = this.getKeyCombo(shortcut.key, shortcut.modifiers);
    const bindings = this.keyBindings.get(keyCombo) || [];
    const index = bindings.indexOf(shortcutId);
    if (index !== -1) {
      bindings.splice(index, 1);
      if (bindings.length === 0) {
        this.keyBindings.delete(keyCombo);
      } else {
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
  public setShortcutEnabled(shortcutId: string, enabled: boolean): boolean {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) {return false;}

    shortcut.enabled = enabled;
    this.emit('shortcut:toggled', { shortcut, enabled });
    return true;
  }

  /**
   * 更新快捷键上下文
   */
  public updateContext(context: Partial<KeyboardContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...context
    };
    this.emit('context:updated', this.currentContext);
  }

  /**
   * 获取所有快捷键
   */
  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * 按类别获取快捷键
   */
  public getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.getShortcuts().filter(s => s.category === category);
  }

  /**
   * 获取快捷键
   */
  public getShortcut(shortcutId: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(shortcutId);
  }

  /**
   * 检查快捷键冲突
   */
  public checkConflicts(shortcut: KeyboardShortcut): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
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
  public startRecording(callback: (shortcut: string) => void): void {
    this.recording = true;
    this.recordingCallback = callback;
    this.emit('recording:started');
  }

  /**
   * 停止录制快捷键
   */
  public stopRecording(): void {
    this.recording = false;
    this.recordingCallback = null;
    this.emit('recording:stopped');
  }

  /**
   * 启用/禁用快捷键系统
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.emit('system:toggled', enabled);
  }

  /**
   * 重置所有快捷键为默认设置
   */
  public resetToDefaults(): void {
    this.shortcuts.clear();
    this.keyBindings.clear();
    this.initializeDefaultShortcuts();
    this.emit('system:reset');
  }

  /**
   * 导出快捷键配置
   */
  public exportConfig(): string {
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
  public importConfig(configJson: string): boolean {
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
    } catch (error) {
      console.error('导入快捷键配置失败:', error);
      return false;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') {return;}

    // 键盘按下事件
    window.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    
    // 焦点变化监听
    window.addEventListener('focusin', this.handleFocusChange.bind(this));
    window.addEventListener('focusout', this.handleFocusChange.bind(this));
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) {return;}

    const keyCombo = this.getKeyComboFromEvent(event);
    
    // 录制模式
    if (this.recording && this.recordingCallback) {
      this.recordingCallback(keyCombo);
      return;
    }

    // 查找匹配的快捷键
    const matchingShortcuts = this.findMatchingShortcuts(keyCombo, event);
    
    if (matchingShortcuts.length === 0) {return;}

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
    } catch (error) {
      console.error(`执行快捷键 ${shortcut.id} 失败:`, error);
      this.emit('shortcut:error', { shortcut, error });
    }
  }

  /**
   * 处理焦点变化
   */
  private handleFocusChange(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    
    this.updateContext({
      activeElement: target,
      focusedInput: this.isInputElement(target)
    });
  }

  /**
   * 查找匹配的快捷键
   */
  private findMatchingShortcuts(keyCombo: string, event: KeyboardEvent): KeyboardShortcut[] {
    const shortcutIds = this.keyBindings.get(keyCombo) || [];
    const matchingShortcuts: KeyboardShortcut[] = [];

    for (const shortcutId of shortcutIds) {
      const shortcut = this.shortcuts.get(shortcutId);
      
      if (!shortcut || !shortcut.enabled) {continue;}
      
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
  private isContextMatch(shortcut: KeyboardShortcut, event: KeyboardEvent): boolean {
    // 全局快捷键总是匹配
    if (shortcut.global) {return true;}

    // 如果没有指定上下文，默认匹配
    if (!shortcut.context || shortcut.context.length === 0) {return true;}

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
  private hasContextOverlap(existing: KeyboardShortcut, newShortcut: KeyboardShortcut): boolean {
    // 如果任一是全局快捷键，则有重叠
    if (existing.global || newShortcut.global) {return true;}

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
  private getKeyComboFromEvent(event: KeyboardEvent): string {
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
  private getKeyCombo(key: string, modifiers?: ModifierKeys): string {
    const parts: string[] = [];
    
    if (modifiers?.ctrl) {parts.push('Ctrl');}
    if (modifiers?.alt) {parts.push('Alt');}
    if (modifiers?.shift) {parts.push('Shift');}
    if (modifiers?.meta) {parts.push('Meta');}
    
    parts.push(key);
    
    return parts.join('+');
  }

  /**
   * 判断是否为输入元素
   */
  private isInputElement(element: HTMLElement): boolean {
    const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    return inputTags.includes(element.tagName) || 
           element.contentEditable === 'true';
  }

  /**
   * 初始化默认快捷键
   */
  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: Omit<KeyboardShortcut, 'action'>[] = [
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
  public getShortcutDisplayText(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    if (shortcut.modifiers?.ctrl) {parts.push('Ctrl');}
    if (shortcut.modifiers?.alt) {parts.push('Alt');}
    if (shortcut.modifiers?.shift) {parts.push('Shift');}
    if (shortcut.modifiers?.meta) {parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win');}
    
    // 转换特殊键名
    const keyDisplayNames: Record<string, string> = {
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
  public dispose(): void {
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

/**
 * 快捷键装饰器
 */
export function keyboardShortcut(shortcutConfig: Omit<KeyboardShortcut, 'id' | 'action'>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const shortcutManager = KeyboardShortcutManager.getInstance();
    
    // 在方法首次调用时注册快捷键
    let registered = false;
    
    descriptor.value = function (...args: any[]) {
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

/**
 * 全局键盘快捷键管理器实例
 */
export const globalShortcutManager = KeyboardShortcutManager.getInstance();
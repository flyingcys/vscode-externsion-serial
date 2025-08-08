/**
 * 增强的VSCode API Mock - 专门为Plugins模块测试设计
 * 
 * 提供完整的VSCode API模拟，支持插件系统的所有功能测试
 * 包括扩展上下文、消息传递、状态管理等
 */

import { vi } from 'vitest';

/**
 * 增强的ExtensionContext Mock
 */
export function createExtensionContextMock(overrides: any = {}) {
  const subscriptions: any[] = [];
  const globalStateData = new Map<string, any>();
  const workspaceStateData = new Map<string, any>();

  return {
    subscriptions,
    extensionPath: '/test/extension/path',
    extensionUri: {
      fsPath: '/test/extension/path',
      scheme: 'file',
      authority: '',
      path: '/test/extension/path',
      query: '',
      fragment: ''
    },
    globalStorageUri: {
      fsPath: '/test/global/storage',
      scheme: 'file',
      authority: '',
      path: '/test/global/storage',
      query: '',
      fragment: ''
    },
    workspaceStorageUri: {
      fsPath: '/test/workspace/storage',
      scheme: 'file',
      authority: '',
      path: '/test/workspace/storage',
      query: '',
      fragment: ''
    },
    logUri: {
      fsPath: '/test/logs',
      scheme: 'file',
      authority: '',
      path: '/test/logs',
      query: '',
      fragment: ''
    },
    storagePath: '/test/storage',
    globalStoragePath: '/test/global/storage',
    logPath: '/test/logs',
    
    // Global State Mock
    globalState: {
      keys: vi.fn(() => Array.from(globalStateData.keys())),
      get: vi.fn((key: string, defaultValue?: any) => {
        return globalStateData.get(key) ?? defaultValue;
      }),
      update: vi.fn((key: string, value: any) => {
        if (value === undefined) {
          globalStateData.delete(key);
        } else {
          globalStateData.set(key, value);
        }
        return Promise.resolve();
      })
    },
    
    // Workspace State Mock
    workspaceState: {
      keys: vi.fn(() => Array.from(workspaceStateData.keys())),
      get: vi.fn((key: string, defaultValue?: any) => {
        return workspaceStateData.get(key) ?? defaultValue;
      }),
      update: vi.fn((key: string, value: any) => {
        if (value === undefined) {
          workspaceStateData.delete(key);
        } else {
          workspaceStateData.set(key, value);
        }
        return Promise.resolve();
      })
    },
    
    // Extension Mode
    extensionMode: 1, // Normal mode
    
    // Environment Variable Access
    environmentVariableCollection: {
      persistent: true,
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      forEach: vi.fn()
    },
    
    // Secrets
    secrets: {
      get: vi.fn(),
      store: vi.fn(),
      delete: vi.fn(),
      onDidChange: vi.fn()
    },
    
    ...overrides
  };
}

/**
 * 增强的OutputChannel Mock
 */
export function createOutputChannelMock(name: string) {
  const lines: string[] = [];
  
  return {
    name,
    append: vi.fn((value: string) => {
      lines.push(value);
    }),
    appendLine: vi.fn((value: string) => {
      lines.push(value + '\n');
    }),
    clear: vi.fn(() => {
      lines.length = 0;
    }),
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn(),
    // Test helpers
    _getContent: () => lines.join(''),
    _getLines: () => [...lines]
  };
}

/**
 * 增强的StatusBarItem Mock
 */
export function createStatusBarItemMock() {
  return {
    alignment: 1, // Left alignment
    priority: 0,
    text: '',
    tooltip: '',
    color: undefined,
    backgroundColor: undefined,
    command: undefined,
    accessibilityInformation: undefined,
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn()
  };
}

/**
 * 增强的WebviewPanel Mock
 */
export function createWebviewPanelMock() {
  const eventListeners = new Map<string, Function[]>();
  
  const emitEvent = (event: string, ...args: any[]) => {
    const listeners = eventListeners.get(event) || [];
    listeners.forEach(listener => listener(...args));
  };
  
  const addEventListener = (event: string, listener: Function) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event)!.push(listener);
    
    return {
      dispose: () => {
        const listeners = eventListeners.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  };
  
  return {
    viewType: 'test-view',
    title: 'Test Panel',
    iconPath: undefined,
    
    webview: {
      options: {},
      html: '',
      cspSource: 'self',
      postMessage: vi.fn((message: any) => {
        // 模拟消息发送到webview
        setTimeout(() => {
          emitEvent('message', { data: message });
        }, 0);
        return Promise.resolve(true);
      }),
      onDidReceiveMessage: vi.fn((listener: Function) => {
        return addEventListener('message', listener);
      }),
      asWebviewUri: vi.fn((uri: any) => ({
        ...uri,
        scheme: 'vscode-webview'
      }))
    },
    
    onDidDispose: vi.fn((listener: Function) => {
      return addEventListener('dispose', listener);
    }),
    
    onDidChangeViewState: vi.fn((listener: Function) => {
      return addEventListener('viewStateChange', listener);
    }),
    
    reveal: vi.fn((viewColumn?: number, preserveFocus?: boolean) => {
      emitEvent('viewStateChange', { webviewPanel: this, active: true, visible: true });
    }),
    
    dispose: vi.fn(() => {
      emitEvent('dispose');
      eventListeners.clear();
    }),
    
    active: true,
    visible: true,
    viewColumn: 1,
    
    // Test helpers
    _emitEvent: emitEvent,
    _addEventListener: addEventListener,
    _getEventListeners: () => eventListeners
  };
}

/**
 * 增强的QuickPick Mock
 */
export function createQuickPickMock() {
  const eventListeners = new Map<string, Function[]>();
  
  const emitEvent = (event: string, ...args: any[]) => {
    const listeners = eventListeners.get(event) || [];
    listeners.forEach(listener => listener(...args));
  };
  
  const addEventListener = (event: string, listener: Function) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event)!.push(listener);
    
    return {
      dispose: () => {
        const listeners = eventListeners.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  };
  
  return {
    items: [],
    canSelectMany: false,
    placeholder: '',
    ignoreFocusOut: false,
    matchOnDescription: false,
    matchOnDetail: false,
    keepScrollPosition: false,
    activeItems: [],
    selectedItems: [],
    title: '',
    step: undefined,
    totalSteps: undefined,
    enabled: true,
    busy: false,
    value: '',
    
    onDidChangeActive: vi.fn((listener: Function) => addEventListener('changeActive', listener)),
    onDidChangeSelection: vi.fn((listener: Function) => addEventListener('changeSelection', listener)),
    onDidChangeValue: vi.fn((listener: Function) => addEventListener('changeValue', listener)),
    onDidAccept: vi.fn((listener: Function) => addEventListener('accept', listener)),
    onDidHide: vi.fn((listener: Function) => addEventListener('hide', listener)),
    
    show: vi.fn(),
    hide: vi.fn(() => emitEvent('hide')),
    dispose: vi.fn(),
    
    // Test helpers
    _emitEvent: emitEvent,
    _triggerAccept: () => emitEvent('accept'),
    _changeSelection: (items: any[]) => {
      this.selectedItems = items;
      emitEvent('changeSelection', items);
    }
  };
}

/**
 * 增强的InputBox Mock
 */
export function createInputBoxMock() {
  const eventListeners = new Map<string, Function[]>();
  
  const emitEvent = (event: string, ...args: any[]) => {
    const listeners = eventListeners.get(event) || [];
    listeners.forEach(listener => listener(...args));
  };
  
  const addEventListener = (event: string, listener: Function) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event)!.push(listener);
    
    return {
      dispose: () => {
        const listeners = eventListeners.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  };
  
  return {
    value: '',
    placeholder: '',
    password: false,
    prompt: '',
    validationMessage: '',
    title: '',
    step: undefined,
    totalSteps: undefined,
    enabled: true,
    busy: false,
    ignoreFocusOut: false,
    
    onDidChangeValue: vi.fn((listener: Function) => addEventListener('changeValue', listener)),
    onDidAccept: vi.fn((listener: Function) => addEventListener('accept', listener)),
    onDidHide: vi.fn((listener: Function) => addEventListener('hide', listener)),
    
    show: vi.fn(),
    hide: vi.fn(() => emitEvent('hide')),
    dispose: vi.fn(),
    
    // Test helpers
    _emitEvent: emitEvent,
    _setValue: (value: string) => {
      this.value = value;
      emitEvent('changeValue', value);
    },
    _triggerAccept: () => emitEvent('accept')
  };
}

/**
 * 增强的Progress Mock
 */
export function createProgressMock() {
  return {
    report: vi.fn((value: { message?: string; increment?: number }) => {
      // 模拟进度报告
    })
  };
}

/**
 * 完整的VSCode API Mock
 */
export const vscodeEnhancedMock = {
  // Uri class
  Uri: {
    file: vi.fn((path: string) => ({
      scheme: 'file',
      authority: '',
      path,
      query: '',
      fragment: '',
      fsPath: path,
      toString: () => `file://${path}`,
      toJSON: () => ({ scheme: 'file', path })
    })),
    parse: vi.fn((value: string) => {
      const url = new URL(value);
      return {
        scheme: url.protocol.slice(0, -1),
        authority: url.host,
        path: url.pathname,
        query: url.search.slice(1),
        fragment: url.hash.slice(1),
        fsPath: url.pathname,
        toString: () => value
      };
    }),
    joinPath: vi.fn((base: any, ...pathSegments: string[]) => {
      const joined = [base.path, ...pathSegments].join('/');
      return {
        scheme: base.scheme,
        authority: base.authority,
        path: joined,
        query: base.query,
        fragment: base.fragment,
        fsPath: joined,
        toString: () => `${base.scheme}://${base.authority || ''}${joined}`
      };
    })
  },
  
  // ViewColumn enum
  ViewColumn: {
    Active: -1,
    Beside: -2,
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9
  },
  
  // StatusBarAlignment enum
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  
  // DiagnosticSeverity enum
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  },
  
  // Window namespace
  window: {
    showInformationMessage: vi.fn((message: string, ...items: string[]) => {
      return Promise.resolve(items[0]);
    }),
    showWarningMessage: vi.fn((message: string, ...items: string[]) => {
      return Promise.resolve(items[0]);
    }),
    showErrorMessage: vi.fn((message: string, ...items: string[]) => {
      return Promise.resolve(items[0]);
    }),
    showQuickPick: vi.fn((items: any[], options?: any) => {
      return Promise.resolve(Array.isArray(items) ? items[0] : undefined);
    }),
    showInputBox: vi.fn((options?: any) => {
      return Promise.resolve('test-input');
    }),
    showOpenDialog: vi.fn((options?: any) => {
      return Promise.resolve([vscodeEnhancedMock.Uri.file('/test/file.txt')]);
    }),
    showSaveDialog: vi.fn((options?: any) => {
      return Promise.resolve(vscodeEnhancedMock.Uri.file('/test/save.txt'));
    }),
    showWorkspaceFolderPick: vi.fn((options?: any) => {
      return Promise.resolve({
        uri: vscodeEnhancedMock.Uri.file('/test/workspace'),
        name: 'test-workspace',
        index: 0
      });
    }),
    createOutputChannel: vi.fn((name: string) => createOutputChannelMock(name)),
    createStatusBarItem: vi.fn(() => createStatusBarItemMock()),
    createWebviewPanel: vi.fn((viewType: string, title: string, showOptions: any, options?: any) => {
      const panel = createWebviewPanelMock();
      panel.viewType = viewType;
      panel.title = title;
      return panel;
    }),
    createQuickPick: vi.fn(() => createQuickPickMock()),
    createInputBox: vi.fn(() => createInputBoxMock()),
    withProgress: vi.fn((options: any, task: (progress: any, token: any) => any) => {
      const progress = createProgressMock();
      const token = { isCancellationRequested: false, onCancellationRequested: vi.fn() };
      return task(progress, token);
    }),
    setStatusBarMessage: vi.fn(),
    activeTextEditor: undefined,
    visibleTextEditors: [],
    onDidChangeActiveTextEditor: vi.fn(),
    onDidChangeVisibleTextEditors: vi.fn(),
    onDidChangeTextEditorSelection: vi.fn(),
    onDidChangeTextEditorVisibleRanges: vi.fn(),
    onDidChangeTextEditorOptions: vi.fn(),
    onDidChangeTextEditorViewColumn: vi.fn(),
    tabGroups: {
      all: [],
      activeTabGroup: undefined,
      onDidChangeTabGroups: vi.fn(),
      onDidChangeTabs: vi.fn()
    }
  },
  
  // Workspace namespace
  workspace: {
    workspaceFolders: [
      {
        uri: vscodeEnhancedMock.Uri.file('/test/workspace'),
        name: 'test-workspace',
        index: 0
      }
    ],
    rootPath: '/test/workspace',
    name: 'test-workspace',
    workspaceFile: undefined,
    
    getConfiguration: vi.fn((section?: string, resource?: any) => {
      const config = new Map<string, any>();
      return {
        get: vi.fn((key: string, defaultValue?: any) => config.get(key) ?? defaultValue),
        has: vi.fn((key: string) => config.has(key)),
        inspect: vi.fn(),
        update: vi.fn((key: string, value: any, target?: any) => {
          config.set(key, value);
          return Promise.resolve();
        })
      };
    }),
    
    onDidChangeConfiguration: vi.fn(),
    onDidChangeWorkspaceFolders: vi.fn(),
    onDidOpenTextDocument: vi.fn(),
    onDidCloseTextDocument: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
    onDidSaveTextDocument: vi.fn(),
    onWillSaveTextDocument: vi.fn(),
    
    openTextDocument: vi.fn(),
    saveAll: vi.fn(),
    applyEdit: vi.fn(),
    
    findFiles: vi.fn((include: string, exclude?: string) => {
      return Promise.resolve([vscodeEnhancedMock.Uri.file('/test/found.txt')]);
    }),
    
    createFileSystemWatcher: vi.fn((globPattern: string) => ({
      onDidCreate: vi.fn(),
      onDidChange: vi.fn(),
      onDidDelete: vi.fn(),
      dispose: vi.fn()
    }))
  },
  
  // Commands namespace
  commands: {
    registerCommand: vi.fn((command: string, callback: Function) => ({
      dispose: vi.fn()
    })),
    registerTextEditorCommand: vi.fn((command: string, callback: Function) => ({
      dispose: vi.fn()
    })),
    executeCommand: vi.fn((command: string, ...rest: any[]) => {
      return Promise.resolve();
    }),
    getCommands: vi.fn(() => Promise.resolve(['test.command']))
  },
  
  // Languages namespace
  languages: {
    registerDocumentFormattingEditProvider: vi.fn(),
    registerDocumentRangeFormattingEditProvider: vi.fn(),
    registerHoverProvider: vi.fn(),
    registerCompletionItemProvider: vi.fn(),
    registerCodeActionsProvider: vi.fn(),
    registerDiagnosticCollection: vi.fn(),
    createDiagnosticCollection: vi.fn(() => ({
      name: 'test-diagnostics',
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      has: vi.fn(),
      dispose: vi.fn()
    }))
  },
  
  // Extensions namespace
  extensions: {
    all: [],
    getExtension: vi.fn((extensionId: string) => undefined),
    onDidChange: vi.fn()
  },
  
  // Environment namespace
  env: {
    appName: 'Visual Studio Code - Test',
    appRoot: '/test/vscode',
    appHost: 'desktop',
    language: 'en',
    clipboard: {
      readText: vi.fn(() => Promise.resolve('clipboard text')),
      writeText: vi.fn((text: string) => Promise.resolve())
    },
    machineId: 'test-machine-id',
    sessionId: 'test-session-id',
    remoteName: undefined,
    shell: '/bin/bash',
    uriScheme: 'vscode',
    openExternal: vi.fn((uri: any) => Promise.resolve(true)),
    asExternalUri: vi.fn((uri: any) => Promise.resolve(uri)),
    logLevel: 1 // Info
  },
  
  // Debug namespace
  debug: {
    activeDebugSession: undefined,
    activeDebugConsole: {
      append: vi.fn(),
      appendLine: vi.fn()
    },
    breakpoints: [],
    registerDebugConfigurationProvider: vi.fn(),
    registerDebugAdapterDescriptorFactory: vi.fn(),
    startDebugging: vi.fn(),
    stopDebugging: vi.fn(),
    addBreakpoints: vi.fn(),
    removeBreakpoints: vi.fn(),
    onDidChangeActiveDebugSession: vi.fn(),
    onDidStartDebugSession: vi.fn(),
    onDidReceiveDebugSessionCustomEvent: vi.fn(),
    onDidTerminateDebugSession: vi.fn(),
    onDidChangeBreakpoints: vi.fn()
  },
  
  // Tasks namespace
  tasks: {
    registerTaskProvider: vi.fn(),
    fetchTasks: vi.fn(),
    executeTask: vi.fn(),
    onDidStartTask: vi.fn(),
    onDidEndTask: vi.fn(),
    onDidStartTaskProcess: vi.fn(),
    onDidEndTaskProcess: vi.fn()
  }
};

// Export individual components for focused testing
export {
  createExtensionContextMock,
  createOutputChannelMock,
  createStatusBarItemMock,
  createWebviewPanelMock,
  createQuickPickMock,
  createInputBoxMock,
  createProgressMock
};
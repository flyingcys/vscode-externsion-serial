/**
 * VSCode API Mock for Testing Environment
 * 测试环境专用的VSCode API模拟实现
 */

import { vi } from 'vitest';

// Mock VSCode Uri class
export const Uri = {
  file: vi.fn().mockImplementation((path: string) => ({
    scheme: 'file',
    path,
    fsPath: path,
    toString: () => `file://${path}`
  })),
  parse: vi.fn(),
  joinPath: vi.fn()
};

// Mock VSCode window namespace
export const window = {
  showOpenDialog: vi.fn(),
  showSaveDialog: vi.fn(),
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  showQuickPick: vi.fn(),
  showInputBox: vi.fn(),
  withProgress: vi.fn(),
  createWebviewPanel: vi.fn().mockReturnValue({
    webview: {
      postMessage: vi.fn(),
      onDidReceiveMessage: vi.fn(),
      html: '',
      options: {},
      cspSource: 'self'
    },
    onDidDispose: vi.fn(),
    dispose: vi.fn(),
    reveal: vi.fn(),
    title: 'Test Panel'
  }),
  createStatusBarItem: vi.fn().mockReturnValue({
    text: '',
    tooltip: '',
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn()
  }),
  createOutputChannel: vi.fn().mockReturnValue({
    append: vi.fn(),
    appendLine: vi.fn(),
    clear: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    dispose: vi.fn()
  })
};

// Mock VSCode workspace namespace
export const workspace = {
  getConfiguration: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue({}),
    update: vi.fn().mockResolvedValue(undefined),
    has: vi.fn().mockReturnValue(true)
  }),
  onDidChangeConfiguration: vi.fn(),
  workspaceFolders: [{
    uri: { fsPath: '/test/workspace' },
    name: 'test-workspace',
    index: 0
  }],
  rootPath: '/test/workspace',
  openTextDocument: vi.fn(),
  saveAll: vi.fn()
};

// Mock VSCode commands namespace
export const commands = {
  registerCommand: vi.fn(),
  executeCommand: vi.fn()
};

// Mock VSCode extensions namespace
export const extensions = {
  getExtension: vi.fn(),
  all: []
};

// Mock VSCode languages namespace
export const languages = {
  registerDocumentFormattingEditProvider: vi.fn(),
  registerHoverProvider: vi.fn(),
  registerCompletionItemProvider: vi.fn()
};

// Mock VSCode env namespace
export const env = {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn()
  },
  openExternal: vi.fn()
};

// Mock ConfigurationTarget
export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3
}

// Mock ViewColumn
export enum ViewColumn {
  Active = -1,
  Beside = -2,
  One = 1,
  Two = 2,
  Three = 3
}

// Mock StatusBarAlignment
export enum StatusBarAlignment {
  Left = 1,
  Right = 2
}

// Mock Progress类型相关
export interface Progress<T> {
  report(value: T): void;
}

export interface ProgressOptions {
  location: any;
  title?: string;
  cancellable?: boolean;
}

// Mock CancellationToken
export interface CancellationToken {
  isCancellationRequested: boolean;
  onCancellationRequested: any;
}

// Mock常用的VSCode类型
export interface QuickPickItem {
  label: string;
  description?: string;
  detail?: string;
  picked?: boolean;
  alwaysShow?: boolean;
}

export interface OpenDialogOptions {
  canSelectFiles?: boolean;
  canSelectFolders?: boolean;
  canSelectMany?: boolean;
  defaultUri?: any;
  filters?: { [name: string]: string[] };
  openLabel?: string;
  title?: string;
}

export interface SaveDialogOptions {
  defaultUri?: any;
  filters?: { [name: string]: string[] };
  saveLabel?: string;
  title?: string;
}

// 默认导出完整的vscode命名空间模拟
export default {
  Uri,
  window,
  workspace,
  commands,
  extensions,
  languages,
  env,
  ConfigurationTarget,
  ViewColumn,
  StatusBarAlignment
};
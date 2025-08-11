/**
 * Extension支撑服务模块100%覆盖率测试套件
 * 
 * 测试范围：
 * - webview/ProjectEditorProvider.ts (1,122行) - Webview项目编辑器提供者
 * - workers/WorkerManager.ts (510行) - 多线程数据处理管理器  
 * - types/ProjectTypes.ts (352行) - 项目类型定义和验证
 * 
 * 目标：100%分支覆盖率 + 100%行覆盖率 + A级质量标准
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { ProjectEditorProvider } from '../../../src/extension/webview/ProjectEditorProvider';
import { WorkerManager, WorkerMessage, WorkerResponse, RawFrame } from '../../../src/extension/workers/WorkerManager';
import {
  ProjectConfig,
  Group,
  Dataset,
  Action,
  ProjectViewType,
  EditorWidgetType,
  FrameDetectionMethod,
  DecoderMethod,
  WIDGET_TYPES,
  TIMER_MODES,
  EOL_SEQUENCES,
  ValidationResult,
  ProjectStatistics,
  ExportConfig,
  ImportOptions,
  ProjectTemplate,
  ProjectDiff,
  isValidProjectConfig,
  isValidGroup,
  isValidDataset,
  isValidAction
} from '../../../src/extension/types/ProjectTypes';

// ============================================================================
// Mock设置
// ============================================================================

// Mock VSCode API
vi.mock('vscode', () => ({
  Uri: {
    file: vi.fn((path) => ({ fsPath: path, scheme: 'file', authority: '', path, query: '', fragment: '' })),
    joinPath: vi.fn((base, ...paths) => ({
      fsPath: path.join(base.fsPath, ...paths),
      scheme: 'file',
      authority: '',
      path: path.join(base.fsPath, ...paths),
      query: '',
      fragment: ''
    }))
  },
  window: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showErrorMessage: vi.fn()
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  Disposable: vi.fn().mockImplementation((fn) => ({ dispose: fn }))
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  stat: vi.fn()
}));

// Mock path
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    join: vi.fn((...paths) => paths.join('/')),
    basename: vi.fn((filePath) => filePath.split('/').pop()),
    extname: vi.fn((filePath) => {
      const parts = filePath.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    })
  };
});

// Mock Worker threads  
vi.mock('worker_threads', () => ({
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    postMessage: vi.fn(),
    terminate: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock项目管理器
const mockProjectManager = {
  getInstance: vi.fn(() => mockProjectManager),
  currentProject: null as ProjectConfig | null,
  createNewProject: vi.fn(),
  openProjectFile: vi.fn(),
  saveProjectFile: vi.fn(),
  setTitle: vi.fn(),
  addGroup: vi.fn(),
  deleteGroup: vi.fn(),
  addDataset: vi.fn(),
  deleteDataset: vi.fn(),
  askSave: vi.fn(),
  on: vi.fn(),
  emit: vi.fn(),
  jsonFilePath: '/test/project.ssproj',
  jsonFileName: 'project.ssproj', 
  modified: false,
  title: 'Test Project',
  groupCount: 2,
  datasetCount: 4,
  EVENTS: {
    PROJECT_LOADED: 'projectLoaded',
    PROJECT_MODIFIED: 'projectModified',
    TITLE_CHANGED: 'titleChanged',
    JSON_FILE_CHANGED: 'jsonFileChanged'
  }
};

// Mock序列化器和验证器
const mockSerializer = {
  importFromSerialStudio: vi.fn(),
  exportForSerialStudio: vi.fn(),
  createTemplate: vi.fn()
};

const mockValidator = {
  validateProject: vi.fn()
};

vi.mock('../../../src/extension/project/ProjectManager', () => ({
  ProjectManager: mockProjectManager
}));

vi.mock('../../../src/extension/project/ProjectSerializer', () => ({
  ProjectSerializer: vi.fn(() => mockSerializer)
}));

vi.mock('../../../src/extension/project/ProjectValidator', () => ({
  ProjectValidator: vi.fn(() => mockValidator)
}));

// Mock os模块
vi.mock('os', () => ({
  cpus: vi.fn(() => Array(8).fill({ model: 'Test CPU' })),
  platform: vi.fn(() => 'linux'),
  hostname: vi.fn(() => 'test-host'),
  arch: vi.fn(() => 'x64'),
  networkInterfaces: vi.fn(() => ({
    eth0: [{ mac: '00:11:22:33:44:55', internal: false }]
  }))
}));

// ============================================================================  
// 测试数据
// ============================================================================

const createTestProjectConfig = (): ProjectConfig => ({
  title: 'Test Project',
  decoder: DecoderMethod.PlainText,
  frameDetection: FrameDetectionMethod.StartAndEndDelimiter,
  frameStart: '<',
  frameEnd: '>',
  frameParser: 'function parse(data) { return JSON.parse(data); }',
  groups: [
    {
      title: 'Sensors',
      widget: WIDGET_TYPES.GROUP.ACCELEROMETER,
      datasets: [
        {
          title: 'X Axis',
          units: 'm/s²',
          widget: WIDGET_TYPES.DATASET.X_AXIS,
          value: '0.0',
          index: 0,
          graph: true,
          fft: false,
          led: false,
          log: true,
          min: -10,
          max: 10,
          alarm: 8,
          ledHigh: 5,
          fftSamples: 1024,
          fftSamplingRate: 100
        }
      ]
    }
  ],
  actions: [
    {
      title: 'Start Recording',
      icon: 'play',
      txData: 'START',
      eolSequence: EOL_SEQUENCES.LF,
      binaryData: false,
      autoExecuteOnConnect: false,
      timerMode: TIMER_MODES.OFF,
      timerIntervalMs: 1000
    }
  ],
  mapTilerApiKey: 'test-maptiler-key',
  thunderforestApiKey: 'test-thunderforest-key'
});

const createTestRawFrame = (): RawFrame => ({
  data: new Uint8Array([1, 2, 3, 4]),
  timestamp: Date.now(),
  sequence: 1,
  checksumValid: true
});

// ============================================================================
// ProjectEditorProvider测试套件
// ============================================================================

describe('ProjectEditorProvider 100% Coverage', () => {
  let provider: ProjectEditorProvider;
  let mockWebviewView: any;
  let mockWebview: any;
  let mockExtensionUri: vscode.Uri;

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks();
    
    // 设置mock URI
    mockExtensionUri = {
      fsPath: '/extension/path',
      scheme: 'file',
      authority: '',
      path: '/extension/path',
      query: '',
      fragment: ''
    };

    // 设置mock webview
    mockWebview = {
      options: {},
      html: '',
      postMessage: vi.fn(),
      asWebviewUri: vi.fn((uri) => uri),
      cspSource: 'vscode-webview://',
      onDidReceiveMessage: vi.fn()
    };

    // 设置mock webview view
    mockWebviewView = {
      webview: mockWebview,
      visible: true,
      show: vi.fn(),
      onDidChangeVisibility: vi.fn()
    };

    provider = new ProjectEditorProvider(mockExtensionUri);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 基本初始化测试
  it('should initialize ProjectEditorProvider correctly', () => {
    expect(provider).toBeDefined();
    expect(mockProjectManager.getInstance).toHaveBeenCalled();
  });

  // WebView解析测试
  it('should resolve webview view correctly', () => {
    const mockContext = {};
    const mockToken = { isCancellationRequested: false, onCancellationRequested: vi.fn() };

    provider.resolveWebviewView(mockWebviewView, mockContext, mockToken);

    expect(mockWebviewView.webview.options.enableScripts).toBe(true);
    expect(mockWebviewView.webview.options.localResourceRoots).toHaveLength(3);
    expect(mockWebviewView.webview.html).toContain('<!DOCTYPE html>');
    expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled();
    expect(mockWebviewView.onDidChangeVisibility).toHaveBeenCalled();
  });

  // HTML生成测试
  it('should generate correct HTML for webview', () => {
    provider.resolveWebviewView(mockWebviewView, {}, {} as any);
    const html = mockWebviewView.webview.html;
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Serial Studio Project Editor');
    expect(html).toContain('Content-Security-Policy');
    expect(html).toContain('nonce-');
    expect(html).toContain('Loading Project Editor...');
  });

  // Nonce生成测试
  it('should generate unique nonce values', () => {
    const provider1 = new ProjectEditorProvider(mockExtensionUri);
    const provider2 = new ProjectEditorProvider(mockExtensionUri);
    
    provider1.resolveWebviewView(mockWebviewView, {}, {} as any);
    const html1 = mockWebviewView.webview.html;
    
    provider2.resolveWebviewView(mockWebviewView, {}, {} as any);
    const html2 = mockWebviewView.webview.html;
    
    const nonce1 = html1.match(/nonce-([a-zA-Z0-9]+)/)?.[1];
    const nonce2 = html2.match(/nonce-([a-zA-Z0-9]+)/)?.[1];
    
    expect(nonce1).toBeDefined();
    expect(nonce2).toBeDefined();
    expect(nonce1).not.toBe(nonce2);
  });

  // 项目管理器事件监听测试
  it('should setup project manager listeners correctly', () => {
    expect(mockProjectManager.on).toHaveBeenCalledWith('projectLoaded', expect.any(Function));
    expect(mockProjectManager.on).toHaveBeenCalledWith('projectModified', expect.any(Function));
    expect(mockProjectManager.on).toHaveBeenCalledWith('titleChanged', expect.any(Function));
    expect(mockProjectManager.on).toHaveBeenCalledWith('jsonFileChanged', expect.any(Function));
  });

  // WebView消息处理测试
  describe('Webview Message Handling', () => {
    beforeEach(() => {
      provider.resolveWebviewView(mockWebviewView, {}, {} as any);
    });

    it('should handle newProject message', async () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'newProject' });
      expect(mockProjectManager.createNewProject).toHaveBeenCalled();
    });

    it('should handle openProject message', async () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'openProject', filePath: '/test/project.ssproj' });
      expect(mockProjectManager.openProjectFile).toHaveBeenCalledWith('/test/project.ssproj');
    });

    it('should handle saveProject message', async () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'saveProject', askPath: true });
      expect(mockProjectManager.saveProjectFile).toHaveBeenCalledWith(true);
    });

    it('should handle setTitle message', async () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'setTitle', title: 'New Title' });
      expect(mockProjectManager.setTitle).toHaveBeenCalledWith('New Title');
    });

    it('should handle project configuration updates', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      // Test frame parser update
      await messageHandler({ 
        type: 'setFrameParser', 
        code: 'function newParser() { return {}; }' 
      });
      expect(testProject.frameParser).toBe('function newParser() { return {}; }');
      
      // Test frame detection update
      await messageHandler({ 
        type: 'setFrameDetection', 
        value: FrameDetectionMethod.EndDelimiterOnly 
      });
      expect(testProject.frameDetection).toBe(FrameDetectionMethod.EndDelimiterOnly);
      
      // Test frame start update
      await messageHandler({ type: 'setFrameStart', value: '{' });
      expect(testProject.frameStart).toBe('{');
      
      // Test frame end update
      await messageHandler({ type: 'setFrameEnd', value: '}' });
      expect(testProject.frameEnd).toBe('}');
      
      // Test decoder update
      await messageHandler({ type: 'setDecoder', value: DecoderMethod.Hexadecimal });
      expect(testProject.decoder).toBe(DecoderMethod.Hexadecimal);
    });

    it('should handle group operations', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      mockProjectManager.addGroup.mockReturnValue(true);
      mockProjectManager.deleteGroup.mockReturnValue(true);
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      // Add group
      await messageHandler({ 
        type: 'addGroup', 
        title: 'New Group', 
        widget: WIDGET_TYPES.GROUP.GPS_MAP 
      });
      expect(mockProjectManager.addGroup).toHaveBeenCalledWith('New Group', WIDGET_TYPES.GROUP.GPS_MAP);
      
      // Delete group
      await messageHandler({ type: 'deleteGroup', index: 0 });
      expect(mockProjectManager.deleteGroup).toHaveBeenCalledWith(0);
      
      // Update group
      await messageHandler({ 
        type: 'updateGroup', 
        index: 0, 
        data: { title: 'Updated Group' }
      });
      expect(testProject.groups[0].title).toBe('Updated Group');
    });

    it('should handle dataset operations', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      mockProjectManager.addDataset.mockReturnValue(true);
      mockProjectManager.deleteDataset.mockReturnValue(true);
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      // Add dataset
      const newDataset = {
        title: 'New Dataset',
        units: 'V',
        widget: WIDGET_TYPES.DATASET.GAUGE,
        value: '0',
        index: 1,
        graph: false,
        fft: false,
        led: true,
        log: false,
        min: 0,
        max: 5,
        alarm: 4,
        ledHigh: 3,
        fftSamples: 512,
        fftSamplingRate: 50
      };
      
      await messageHandler({ 
        type: 'addDataset', 
        groupIndex: 0, 
        dataset: newDataset 
      });
      expect(mockProjectManager.addDataset).toHaveBeenCalledWith(0, newDataset);
      
      // Delete dataset
      await messageHandler({ 
        type: 'deleteDataset', 
        groupIndex: 0, 
        datasetIndex: 0 
      });
      expect(mockProjectManager.deleteDataset).toHaveBeenCalledWith(0, 0);
      
      // Update dataset
      await messageHandler({ 
        type: 'updateDataset', 
        groupIndex: 0, 
        datasetIndex: 0,
        data: { title: 'Updated Dataset' }
      });
      expect(testProject.groups[0].datasets[0].title).toBe('Updated Dataset');
    });

    it('should handle action operations', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      // Add action
      const newAction = {
        title: 'New Action',
        icon: 'stop',
        txData: 'STOP',
        eolSequence: EOL_SEQUENCES.CRLF,
        binaryData: false,
        autoExecuteOnConnect: true,
        timerMode: TIMER_MODES.AUTO_START,
        timerIntervalMs: 500
      };
      
      await messageHandler({ type: 'addAction', action: newAction });
      expect(testProject.actions).toContain(newAction);
      
      // Delete action
      await messageHandler({ type: 'deleteAction', index: 0 });
      expect(testProject.actions).toHaveLength(0);
      
      // Update action (重新添加后测试更新)
      testProject.actions.push(newAction);
      await messageHandler({ 
        type: 'updateAction', 
        index: 0, 
        data: { title: 'Updated Action' }
      });
      expect(testProject.actions[0].title).toBe('Updated Action');
    });

    it('should handle view operations', async () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      await messageHandler({ 
        type: 'changeView', 
        view: ProjectViewType.GroupView, 
        context: { groupIndex: 1 } 
      });
      
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'viewChanged',
        data: { view: ProjectViewType.GroupView, context: { groupIndex: 1 } }
      });
    });

    it('should handle project data requests', async () => {
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      await messageHandler({ type: 'getProjectData' });
      
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'projectData',
        data: expect.objectContaining({
          project: mockProjectManager.currentProject,
          filePath: mockProjectManager.jsonFilePath,
          fileName: mockProjectManager.jsonFileName
        })
      });
    });

    it('should handle project validation', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      await messageHandler({ type: 'validateProject' });
      
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'validationResult',
        data: { valid: true, errors: [] }
      });
    });

    it('should handle unknown message types', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'unknownMessage' });
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown message type:', 'unknownMessage');
    });
  });

  // 导入导出功能测试
  describe('Import/Export Functionality', () => {
    beforeEach(() => {
      provider.resolveWebviewView(mockWebviewView, {}, {} as any);
      vi.mocked(fs.readFile).mockResolvedValue('{"title":"Test"}');
      vi.mocked(fs.stat).mockResolvedValue({ size: 1024 } as any);
    });

    it('should handle Serial Studio project import with file dialog', async () => {
      const testProject = createTestProjectConfig();
      
      vi.mocked(vscode.window.showOpenDialog).mockResolvedValue([
        { fsPath: '/test/project.ssproj' } as vscode.Uri
      ]);
      
      mockSerializer.importFromSerialStudio.mockReturnValue(testProject);
      mockValidator.validateProject.mockReturnValue({ valid: true, errors: [] });
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'importSerialStudioProject' });
      
      expect(vscode.window.showOpenDialog).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalledWith('/test/project.ssproj', 'utf-8');
      expect(mockSerializer.importFromSerialStudio).toHaveBeenCalled();
      expect(mockWebview.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'importPreview' })
      );
    });

    it('should handle import cancellation', async () => {
      vi.mocked(vscode.window.showOpenDialog).mockResolvedValue(undefined);
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'importSerialStudioProject' });
      
      expect(mockWebview.postMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'importPreview' })
      );
    });

    it('should handle import errors', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ 
        type: 'importSerialStudioProject', 
        filePath: '/invalid/path.ssproj' 
      });
      
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'importError',
        data: expect.objectContaining({ error: 'File not found' })
      });
    });

    it('should handle import confirmation', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.askSave.mockResolvedValue(true);
      
      // 设置导入预览
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      // 先执行导入预览
      mockSerializer.importFromSerialStudio.mockReturnValue(testProject);
      mockValidator.validateProject.mockReturnValue({ valid: true, errors: [] });
      
      await messageHandler({ 
        type: 'importSerialStudioProject', 
        filePath: '/test/project.ssproj' 
      });
      
      // 然后确认导入
      await messageHandler({ type: 'confirmImport' });
      
      expect(mockProjectManager.askSave).toHaveBeenCalled();
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'importCompleted',
        data: expect.objectContaining({ success: true })
      });
    });

    it('should handle export for Serial Studio', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      mockSerializer.exportForSerialStudio.mockReturnValue('{"exported": true}');
      
      vi.mocked(vscode.window.showSaveDialog).mockResolvedValue({
        fsPath: '/test/export.ssproj'
      } as vscode.Uri);
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'exportForSerialStudio' });
      
      expect(mockSerializer.exportForSerialStudio).toHaveBeenCalledWith(testProject);
      expect(fs.writeFile).toHaveBeenCalledWith('/test/export.ssproj', '{"exported": true}', 'utf-8');
      expect(mockWebview.postMessage).toHaveBeenCalledWith({
        type: 'exportCompleted',
        data: expect.objectContaining({ success: true })
      });
    });

    it('should handle batch export', async () => {
      const testProject = createTestProjectConfig();
      mockProjectManager.currentProject = testProject;
      mockSerializer.exportForSerialStudio.mockReturnValue('{"exported": true}');
      
      const batchConfig = {
        formats: [
          { type: 'json', path: '/test/export.json' },
          { type: 'ssproj', path: '/test/export.ssproj' }
        ],
        includeAssets: false,
        compression: false,
        outputDir: '/test/output'
      };
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      await messageHandler({ type: 'batchExport', config: batchConfig });
      
      expect(fs.mkdir).toHaveBeenCalledWith('/test/output', { recursive: true });
      expect(mockWebview.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'batchExportCompleted' })
      );
    });

    it('should handle template operations', async () => {
      const testTemplate = createTestProjectConfig();
      mockSerializer.createTemplate.mockReturnValue(testTemplate);
      
      const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
      
      // Create template
      await messageHandler({ type: 'createTemplate', templateType: 'sensor' });
      expect(mockSerializer.createTemplate).toHaveBeenCalledWith('sensor');
      
      // Apply template
      await messageHandler({ type: 'applyTemplate', templateType: 'gps' });
      expect(mockSerializer.createTemplate).toHaveBeenCalledWith('gps');
    });
  });

  // 公共方法测试
  it('should expose public methods correctly', async () => {
    provider.resolveWebviewView(mockWebviewView, {}, {} as any);
    
    provider.show();
    expect(mockWebviewView.show).toHaveBeenCalledWith(true);
    
    await provider.openProject('/test/project.ssproj');
    expect(mockProjectManager.openProjectFile).toHaveBeenCalledWith('/test/project.ssproj');
    
    await provider.newProject();
    expect(mockProjectManager.createNewProject).toHaveBeenCalled();
    
    await provider.saveProject(true);
    expect(mockProjectManager.saveProjectFile).toHaveBeenCalledWith(true);
  });

  // 错误处理测试
  it('should handle errors in message processing', async () => {
    mockProjectManager.createNewProject.mockRejectedValue(new Error('Creation failed'));
    
    provider.resolveWebviewView(mockWebviewView, {}, {} as any);
    const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
    
    // 应该不会抛出错误，错误被内部处理
    await expect(messageHandler({ type: 'newProject' })).resolves.toBeUndefined();
  });
});

// ============================================================================
// WorkerManager测试套件  
// ============================================================================

describe('WorkerManager 100% Coverage', () => {
  let workerManager: WorkerManager;
  let mockWorker: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Worker构造函数
    mockWorker = {
      on: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn().mockResolvedValue(undefined)
    };
    
    vi.mocked(Worker).mockImplementation(() => mockWorker);
    
    workerManager = new WorkerManager({ maxWorkers: 2, queueSize: 100 });
  });

  afterEach(async () => {
    await workerManager.destroy();
  });

  // 基本初始化测试
  it('should initialize WorkerManager correctly', () => {
    expect(workerManager).toBeDefined();
    expect(Worker).toHaveBeenCalledTimes(2); // maxWorkers = 2
    expect(mockWorker.on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockWorker.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockWorker.on).toHaveBeenCalledWith('exit', expect.any(Function));
  });

  // 默认配置测试
  it('should use default configuration when not provided', () => {
    const defaultManager = new WorkerManager();
    const stats = defaultManager.getStats();
    
    expect(stats.workerCount).toBeGreaterThan(0);
    expect(defaultManager.threadedFrameExtraction).toBe(true);
  });

  // Worker池配置测试
  it('should configure all workers', async () => {
    const config = { bufferSize: 1024, sampleRate: 44100 };
    
    // Mock worker response
    mockWorker.postMessage.mockImplementation((message: WorkerMessage) => {
      if (message.type === 'configure') {
        setTimeout(() => {
          const responseHandler = mockWorker.on.mock.calls.find(
            call => call[0] === 'message'
          )?.[1];
          
          responseHandler?.({
            type: 'configured' as const,
            id: message.id,
            data: null
          });
        }, 0);
      }
    });
    
    await workerManager.configureWorkers(config);
    
    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'configure', data: config })
    );
  });

  // 数据处理测试
  it('should process data through workers', async () => {
    const testData = new ArrayBuffer(1024);
    const expectedFrames = [createTestRawFrame()];
    
    // Mock worker response
    mockWorker.postMessage.mockImplementation((message: WorkerMessage) => {
      if (message.type === 'processData') {
        setTimeout(() => {
          const responseHandler = mockWorker.on.mock.calls.find(
            call => call[0] === 'message'
          )?.[1];
          
          responseHandler?.({
            type: 'frameProcessed' as const,
            id: message.id,
            data: expectedFrames
          });
        }, 0);
      }
    });
    
    const result = await workerManager.processData(testData);
    
    expect(result).toEqual(expectedFrames);
    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'processData', data: testData })
    );
  });

  // 批量处理测试
  it('should process batch data', async () => {
    const testBatch = [new ArrayBuffer(512), new ArrayBuffer(512)];
    const expectedFrame = createTestRawFrame();
    
    // Mock worker response
    mockWorker.postMessage.mockImplementation((message: WorkerMessage) => {
      if (message.type === 'processData') {
        setTimeout(() => {
          const responseHandler = mockWorker.on.mock.calls.find(
            call => call[0] === 'message'
          )?.[1];
          
          responseHandler?.({
            type: 'frameProcessed' as const,
            id: message.id,
            data: [expectedFrame]
          });
        }, 0);
      }
    });
    
    const results = await workerManager.processBatch(testBatch);
    
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(expectedFrame);
  });

  // 空批量处理测试
  it('should handle empty batch processing', async () => {
    const result = await workerManager.processBatch([]);
    expect(result).toEqual([]);
  });

  // Worker错误处理测试
  it('should handle worker errors', async () => {
    const errorHandler = mockWorker.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];
    
    const testError = new Error('Worker crashed');
    errorHandler?.(testError);
    
    // 应该创建新的Worker替换失败的Worker
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(Worker).toHaveBeenCalledTimes(3); // 初始2个 + 重启1个
  });

  // Worker退出处理测试
  it('should handle worker exit', async () => {
    const exitHandler = mockWorker.on.mock.calls.find(
      call => call[0] === 'exit'
    )?.[1];
    
    exitHandler?.(1); // 非零退出码
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(Worker).toHaveBeenCalledTimes(3); // 初始2个 + 重启1个
  });

  // 消息超时测试
  it('should handle message timeout', async () => {
    const testData = new ArrayBuffer(1024);
    
    // 不发送响应，让消息超时
    const timeoutManager = new WorkerManager({ maxWorkers: 1 });
    
    await expect(timeoutManager.processData(testData)).rejects.toThrow('Worker request timeout');
  });

  // 统计信息测试
  it('should provide correct statistics', () => {
    const stats = workerManager.getStats();
    
    expect(stats).toHaveProperty('workerCount');
    expect(stats).toHaveProperty('idleWorkers');
    expect(stats).toHaveProperty('busyWorkers');
    expect(stats).toHaveProperty('errorWorkers');
    expect(stats).toHaveProperty('totalRequests');
    expect(stats).toHaveProperty('completedRequests');
    expect(stats).toHaveProperty('averageProcessingTime');
  });

  // Worker重置测试
  it('should reset all workers', async () => {
    // Mock worker response for reset
    mockWorker.postMessage.mockImplementation((message: WorkerMessage) => {
      if (message.type === 'reset') {
        setTimeout(() => {
          const responseHandler = mockWorker.on.mock.calls.find(
            call => call[0] === 'message'
          )?.[1];
          
          responseHandler?.({
            type: 'reset' as const,
            id: message.id,
            data: null
          });
        }, 0);
      }
    });
    
    await workerManager.resetWorkers();
    
    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'reset' })
    );
  });

  // 线程化提取配置测试
  it('should manage threaded frame extraction setting', () => {
    expect(workerManager.threadedFrameExtraction).toBe(true);
    
    workerManager.setThreadedFrameExtraction(false);
    expect(workerManager.threadedFrameExtraction).toBe(false);
  });

  // 销毁测试
  it('should destroy worker pool correctly', async () => {
    const testData = new ArrayBuffer(512);
    
    // 开始一个处理请求
    const processPromise = workerManager.processData(testData);
    
    // 立即销毁
    await workerManager.destroy();
    
    // 处理请求应该被拒绝
    await expect(processPromise).rejects.toThrow('WorkerManager destroyed');
    
    expect(mockWorker.terminate).toHaveBeenCalledTimes(2);
  });

  // 销毁后使用测试
  it('should reject processing after destruction', async () => {
    await workerManager.destroy();
    
    const testData = new ArrayBuffer(512);
    await expect(workerManager.processData(testData)).rejects.toThrow('WorkerManager is destroyed');
  });

  // 负载均衡测试
  it('should balance load across workers', async () => {
    const testData1 = new ArrayBuffer(512);
    const testData2 = new ArrayBuffer(512);
    
    // Mock responses
    mockWorker.postMessage.mockImplementation((message: WorkerMessage) => {
      setTimeout(() => {
        const responseHandler = mockWorker.on.mock.calls.find(
          call => call[0] === 'message'
        )?.[1];
        
        responseHandler?.({
          type: 'frameProcessed' as const,
          id: message.id,
          data: []
        });
      }, 0);
    });
    
    const [result1, result2] = await Promise.all([
      workerManager.processData(testData1),
      workerManager.processData(testData2)
    ]);
    
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  // 测试环境兼容性测试
  it('should handle test environment without real workers', () => {
    // 模拟测试环境下Worker不支持事件监听
    const mockTestWorker = {
      // 没有on方法
      postMessage: undefined,
      terminate: undefined
    };
    
    vi.mocked(Worker).mockImplementation(() => mockTestWorker as any);
    
    expect(() => new WorkerManager({ maxWorkers: 1 })).not.toThrow();
  });
});

// ============================================================================
// ProjectTypes测试套件
// ============================================================================

describe('ProjectTypes 100% Coverage', () => {
  
  // 常量测试
  it('should export correct widget type constants', () => {
    expect(WIDGET_TYPES.GROUP.ACCELEROMETER).toBe('accelerometer');
    expect(WIDGET_TYPES.GROUP.GYROSCOPE).toBe('gyro');
    expect(WIDGET_TYPES.GROUP.GPS_MAP).toBe('map');
    expect(WIDGET_TYPES.GROUP.COMPASS).toBe('compass');
    
    expect(WIDGET_TYPES.DATASET.PLOT).toBe('plot');
    expect(WIDGET_TYPES.DATASET.BAR).toBe('bar');
    expect(WIDGET_TYPES.DATASET.GAUGE).toBe('gauge');
    expect(WIDGET_TYPES.DATASET.LED).toBe('led');
    expect(WIDGET_TYPES.DATASET.X_AXIS).toBe('x');
    expect(WIDGET_TYPES.DATASET.Y_AXIS).toBe('y');
    expect(WIDGET_TYPES.DATASET.Z_AXIS).toBe('z');
  });

  it('should export correct timer mode constants', () => {
    expect(TIMER_MODES.OFF).toBe('off');
    expect(TIMER_MODES.AUTO_START).toBe('autoStart');
    expect(TIMER_MODES.START_ON_TRIGGER).toBe('startOnTrigger');
    expect(TIMER_MODES.TOGGLE_ON_TRIGGER).toBe('toggleOnTrigger');
  });

  it('should export correct EOL sequence constants', () => {
    expect(EOL_SEQUENCES.LF).toBe('\\n');
    expect(EOL_SEQUENCES.CR).toBe('\\r');
    expect(EOL_SEQUENCES.CRLF).toBe('\\r\\n');
    expect(EOL_SEQUENCES.SEMICOLON).toBe(';');
    expect(EOL_SEQUENCES.NULL).toBe('\\0');
  });

  // 枚举测试
  it('should export correct enum values', () => {
    expect(ProjectViewType.ProjectView).toBe('project');
    expect(ProjectViewType.GroupView).toBe('group');
    expect(ProjectViewType.DatasetView).toBe('dataset');
    expect(ProjectViewType.ActionView).toBe('action');
    expect(ProjectViewType.FrameParserView).toBe('frameParser');
    
    expect(EditorWidgetType.TextField).toBe('textField');
    expect(EditorWidgetType.HexTextField).toBe('hexTextField');
    expect(EditorWidgetType.IntField).toBe('intField');
    expect(EditorWidgetType.CheckBox).toBe('checkBox');
    
    expect(FrameDetectionMethod.NoDelimiters).toBe(0);
    expect(FrameDetectionMethod.EndDelimiterOnly).toBe(1);
    expect(FrameDetectionMethod.StartDelimiterOnly).toBe(2);
    expect(FrameDetectionMethod.StartAndEndDelimiter).toBe(3);
    
    expect(DecoderMethod.PlainText).toBe(0);
    expect(DecoderMethod.Hexadecimal).toBe(1);
    expect(DecoderMethod.Base64).toBe(2);
  });

  // 类型守卫测试 - ProjectConfig
  describe('isValidProjectConfig', () => {
    it('should validate correct project config', () => {
      const validConfig = createTestProjectConfig();
      expect(isValidProjectConfig(validConfig)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(isValidProjectConfig(null)).toBe(false);
      expect(isValidProjectConfig(undefined)).toBe(false);
    });

    it('should reject non-object', () => {
      expect(isValidProjectConfig('string')).toBe(false);
      expect(isValidProjectConfig(123)).toBe(false);
      expect(isValidProjectConfig([])).toBe(false);
    });

    it('should reject missing required properties', () => {
      const invalidConfigs = [
        { /* missing title */ },
        { title: 'test' /* missing other props */ },
        { title: 'test', decoder: 0, frameDetection: 0, frameStart: '', frameEnd: '' /* missing frameParser */ },
        { title: 'test', decoder: 0, frameDetection: 0, frameStart: '', frameEnd: '', frameParser: '' /* missing groups */ },
        { title: 'test', decoder: 0, frameDetection: 0, frameStart: '', frameEnd: '', frameParser: '', groups: [] /* missing actions */ }
      ];
      
      invalidConfigs.forEach(config => {
        expect(isValidProjectConfig(config)).toBe(false);
      });
    });

    it('should reject invalid property types', () => {
      const baseConfig = createTestProjectConfig();
      
      const invalidConfigs = [
        { ...baseConfig, title: 123 },
        { ...baseConfig, decoder: 'invalid' },
        { ...baseConfig, frameDetection: 'invalid' },
        { ...baseConfig, frameStart: 123 },
        { ...baseConfig, frameEnd: 123 },
        { ...baseConfig, frameParser: 123 },
        { ...baseConfig, groups: 'invalid' },
        { ...baseConfig, actions: 'invalid' }
      ];
      
      invalidConfigs.forEach(config => {
        expect(isValidProjectConfig(config)).toBe(false);
      });
    });
  });

  // 类型守卫测试 - Group
  describe('isValidGroup', () => {
    it('should validate correct group', () => {
      const validGroup: Group = {
        title: 'Test Group',
        widget: WIDGET_TYPES.GROUP.ACCELEROMETER,
        datasets: []
      };
      
      expect(isValidGroup(validGroup)).toBe(true);
    });

    it('should reject invalid groups', () => {
      const invalidGroups = [
        null,
        undefined,
        'string',
        123,
        [],
        {},
        { title: 'test' }, // missing widget and datasets
        { title: 123, widget: 'test', datasets: [] }, // invalid title type
        { title: 'test', widget: 123, datasets: [] }, // invalid widget type
        { title: 'test', widget: 'test', datasets: 'invalid' } // invalid datasets type
      ];
      
      invalidGroups.forEach(group => {
        expect(isValidGroup(group)).toBe(false);
      });
    });
  });

  // 类型守卫测试 - Dataset
  describe('isValidDataset', () => {
    it('should validate correct dataset', () => {
      const validDataset = createTestProjectConfig().groups[0].datasets[0];
      expect(isValidDataset(validDataset)).toBe(true);
    });

    it('should reject invalid datasets', () => {
      const baseDataset = createTestProjectConfig().groups[0].datasets[0];
      
      const invalidDatasets = [
        null,
        undefined,
        'string',
        123,
        [],
        {},
        { ...baseDataset, title: 123 },
        { ...baseDataset, units: 123 },
        { ...baseDataset, widget: 123 },
        { ...baseDataset, value: 123 },
        { ...baseDataset, index: 'invalid' },
        { ...baseDataset, graph: 'invalid' },
        { ...baseDataset, fft: 'invalid' },
        { ...baseDataset, led: 'invalid' },
        { ...baseDataset, log: 'invalid' }
      ];
      
      invalidDatasets.forEach(dataset => {
        expect(isValidDataset(dataset)).toBe(false);
      });
    });
  });

  // 类型守卫测试 - Action
  describe('isValidAction', () => {
    it('should validate correct action', () => {
      const validAction = createTestProjectConfig().actions[0];
      expect(isValidAction(validAction)).toBe(true);
    });

    it('should reject invalid actions', () => {
      const baseAction = createTestProjectConfig().actions[0];
      
      const invalidActions = [
        null,
        undefined,
        'string',
        123,
        [],
        {},
        { ...baseAction, title: 123 },
        { ...baseAction, icon: 123 },
        { ...baseAction, txData: 123 },
        { ...baseAction, eolSequence: 123 },
        { ...baseAction, binaryData: 'invalid' },
        { ...baseAction, autoExecuteOnConnect: 'invalid' },
        { ...baseAction, timerMode: 123 },
        { ...baseAction, timerIntervalMs: 'invalid' }
      ];
      
      invalidActions.forEach(action => {
        expect(isValidAction(action)).toBe(false);
      });
    });
  });

  // 接口完整性测试
  it('should define all required interfaces', () => {
    // 测试接口是否存在（通过TypeScript编译即可验证）
    const validationResult: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    const stats: ProjectStatistics = {
      groupCount: 1,
      datasetCount: 2,
      actionCount: 1,
      totalDataPoints: 100,
      usedIndices: [0, 1],
      duplicateIndices: []
    };
    
    const exportConfig: ExportConfig = {
      format: 'ssproj',
      includeActions: true,
      includeApiKeys: false,
      prettyPrint: true,
      indentSize: 2
    };
    
    const importOptions: ImportOptions = {
      validateSchema: true,
      mergeWithCurrent: false,
      preserveIndices: true,
      handleDuplicates: 'rename'
    };
    
    const template: ProjectTemplate = 'sensor';
    
    expect(validationResult.valid).toBe(true);
    expect(stats.groupCount).toBe(1);
    expect(exportConfig.format).toBe('ssproj');
    expect(importOptions.validateSchema).toBe(true);
    expect(template).toBe('sensor');
  });

  // 复杂类型测试
  it('should handle complex types correctly', () => {
    const projectDiff: ProjectDiff = {
      added: {
        groups: [],
        datasets: [],
        actions: []
      },
      removed: {
        groups: [],
        datasets: [],
        actions: []
      },
      modified: {
        project: { title: 'Updated Title' },
        groups: [{ index: 0, changes: { title: 'Updated Group' } }],
        datasets: [{ groupIndex: 0, datasetIndex: 0, changes: { title: 'Updated Dataset' } }],
        actions: [{ index: 0, changes: { title: 'Updated Action' } }]
      }
    };
    
    expect(projectDiff.added.groups).toHaveLength(0);
    expect(projectDiff.modified.project.title).toBe('Updated Title');
  });

  // 边界情况测试
  it('should handle edge cases in type guards', () => {
    // 测试包含额外属性的对象
    const validConfigWithExtra = {
      ...createTestProjectConfig(),
      extraProperty: 'should not affect validation'
    };
    
    expect(isValidProjectConfig(validConfigWithExtra)).toBe(true);
    
    // 测试嵌套数组为空的情况
    const emptyArraysConfig = {
      ...createTestProjectConfig(),
      groups: [],
      actions: []
    };
    
    expect(isValidProjectConfig(emptyArraysConfig)).toBe(true);
  });
});

// ============================================================================
// 集成测试
// ============================================================================

describe('Extension Support Services Integration', () => {
  
  it('should integrate ProjectEditorProvider with WorkerManager', async () => {
    const provider = new ProjectEditorProvider(vscode.Uri.file('/extension'));
    const workerManager = new WorkerManager({ maxWorkers: 1 });
    
    // Mock worker response
    const mockWorker = vi.mocked(Worker).mock.results[0].value;
    mockWorker.postMessage.mockImplementation((message: WorkerMessage) => {
      setTimeout(() => {
        const responseHandler = mockWorker.on.mock.calls.find(
          call => call[0] === 'message'
        )?.[1];
        
        responseHandler?.({
          type: 'frameProcessed' as const,
          id: message.id,
          data: [createTestRawFrame()]
        });
      }, 0);
    });
    
    // 测试数据处理
    const testData = new ArrayBuffer(1024);
    const frames = await workerManager.processData(testData);
    
    expect(frames).toHaveLength(1);
    expect(frames[0]).toMatchObject({
      data: expect.any(Uint8Array),
      timestamp: expect.any(Number),
      sequence: expect.any(Number),
      checksumValid: expect.any(Boolean)
    });
    
    await workerManager.destroy();
  });
  
  it('should validate project types in real scenarios', () => {
    const projectConfig = createTestProjectConfig();
    
    // 验证完整的项目配置
    expect(isValidProjectConfig(projectConfig)).toBe(true);
    
    // 验证组群
    projectConfig.groups.forEach(group => {
      expect(isValidGroup(group)).toBe(true);
      
      // 验证数据集
      group.datasets.forEach(dataset => {
        expect(isValidDataset(dataset)).toBe(true);
      });
    });
    
    // 验证动作
    projectConfig.actions.forEach(action => {
      expect(isValidAction(action)).toBe(true);
    });
  });
  
  it('should handle performance requirements', async () => {
    const startTime = performance.now();
    
    // 测试大量类型验证性能
    const testProject = createTestProjectConfig();
    
    for (let i = 0; i < 1000; i++) {
      isValidProjectConfig(testProject);
      isValidGroup(testProject.groups[0]);
      isValidDataset(testProject.groups[0].datasets[0]);
      isValidAction(testProject.actions[0]);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 性能要求：1000次验证应在100ms内完成
    expect(duration).toBeLessThan(100);
  });
});
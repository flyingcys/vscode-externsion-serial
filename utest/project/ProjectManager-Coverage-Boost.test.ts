/*
 * ProjectManager 覆盖率提升测试
 * 专门针对真实ProjectManager.ts源代码中未覆盖的代码路径
 * 目标：将覆盖率从67.56%提升到90%以上
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectConfig, Group, Dataset } from '../../src/extension/types/ProjectTypes';

// Mock vscode 模块
vi.mock('vscode', () => {
  const mockVscode = {
    window: {
      showOpenDialog: vi.fn(),
      showSaveDialog: vi.fn(),
      showInformationMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      showWarningMessage: vi.fn(),
      withProgress: vi.fn(),
      createWebviewPanel: vi.fn()
    },
    workspace: {
      getConfiguration: vi.fn(),
      onDidChangeConfiguration: vi.fn(),
      workspaceFolders: undefined,
      rootPath: undefined
    },
    Uri: {
      file: vi.fn((path: string) => ({ fsPath: path, scheme: 'file', path })),
      parse: vi.fn()
    },
    commands: {
      registerCommand: vi.fn(),
      executeCommand: vi.fn()
    }
  };
  return mockVscode;
});

// Mock fs/promises 模块
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

// Mock path模块
vi.mock('path', () => ({
  basename: vi.fn((filePath: string) => filePath.split('/').pop() || 'project.ssproj'),
  join: vi.fn((...paths: string[]) => paths.join('/'))
}));

// 导入模拟的模块
const fs = await import('fs/promises');
const vscode = await import('vscode');
const mockReadFile = vi.mocked(fs.readFile);
const mockWriteFile = vi.mocked(fs.writeFile);

// 导入真实的ProjectManager
let ProjectManager: any;

describe('ProjectManager - 覆盖率提升测试', () => {
  let projectManager: any;

  beforeEach(async () => {
    // 动态导入真实的ProjectManager
    const module = await import('../../src/extension/project/ProjectManager');
    ProjectManager = module.ProjectManager;
    
    ProjectManager.resetInstance();
    projectManager = ProjectManager.getInstance();
    vi.clearAllMocks();
    
    // 重置vscode mocks
    vi.mocked(vscode.window.showErrorMessage).mockClear();
    vi.mocked(vscode.window.showWarningMessage).mockClear();
    vi.mocked(vscode.window.showInformationMessage).mockClear();
    vi.mocked(vscode.window.showOpenDialog).mockClear();
    vi.mocked(vscode.window.showSaveDialog).mockClear();
  });

  afterEach(() => {
    if (projectManager) {
      projectManager.dispose();
    }
  });

  // ==================== 针对openProjectFile未覆盖路径 ====================

  describe('文件操作完整路径覆盖', () => {
    it('应该处理JSON解析过程中的SyntaxError', async () => {
      const testPath = '/test/invalid.json';
      // 模拟返回无效的JSON字符串（源码使用 'utf-8' 选项，返回字符串）
      mockReadFile.mockResolvedValueOnce('invalid json {');

      const result = await projectManager.openProjectFile(testPath);
      
      expect(result).toBe(false);
      // 验证vscode全局mock被调用
      expect(vi.mocked(vscode.window.showErrorMessage)).toHaveBeenCalledWith(
        expect.stringContaining('Failed to open project')
      );
    });

    it('应该处理文件读取时的Error异常', async () => {
      const testPath = '/test/project.json';
      const error = new Error('File not found');
      mockReadFile.mockRejectedValueOnce(error);

      const result = await projectManager.openProjectFile(testPath);
      
      expect(result).toBe(false);
      expect(vi.mocked(vscode.window.showErrorMessage)).toHaveBeenCalledWith(
        expect.stringContaining('Failed to open project: File not found')
      );
    });

    it('应该处理空文件路径数组的情况', async () => {
      vi.mocked(vscode.window.showOpenDialog).mockResolvedValueOnce([]);

      const result = await projectManager.openProjectFile();
      
      expect(result).toBe(false);
    });

    it('应该处理文件对话框返回undefined的情况', async () => {
      vscode.window.showOpenDialog.mockResolvedValueOnce(undefined);

      const result = await projectManager.openProjectFile();
      
      expect(result).toBe(false);
    });
  });

  // ==================== 针对saveProjectFile未覆盖路径 ====================

  describe('saveProjectFile 完整路径覆盖', () => {
    it('应该处理保存对话框取消的情况', async () => {
      projectManager.setTitle('Test Project');
      
      vscode.window.showSaveDialog.mockResolvedValueOnce(undefined);

      const result = await projectManager.saveProjectFile(true);
      
      expect(result).toBe(false);
    });

    it('应该处理文件写入时的Error异常', async () => {
      projectManager.setTitle('Test Project');
      // 设置有效的文件路径
      projectManager._filePath = '/test/project.ssproj';
      
      // 模拟writeFile抛出错误
      const error = new Error('Disk full');
      mockWriteFile.mockRejectedValueOnce(error);

      const result = await projectManager.saveProjectFile();
      
      expect(result).toBe(false);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save project: Disk full')
      );
    });

    it('应该测试workspace.rootPath的访问', async () => {
      projectManager.setTitle('Test Project');
      
      // 模拟workspace.rootPath被访问
      const originalRootPath = vscode.workspace.rootPath;
      vscode.workspace.rootPath = '/workspace/path';
      
      // 确保Uri.file可以正常工作
      if (!vscode.Uri.file) {
        vscode.Uri.file = vi.fn().mockImplementation((path: string) => ({ fsPath: path }));
      }
      
      // Mock showSaveDialog返回选择的文件
      vscode.window.showSaveDialog.mockResolvedValueOnce({
        fsPath: '/new/path.ssproj'
      });
      
      mockWriteFile.mockResolvedValueOnce(undefined);

      const result = await projectManager.saveProjectFile(true);
      
      expect(result).toBe(true);
      expect(vscode.window.showSaveDialog).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
      
      // 恢复原始值
      vscode.workspace.rootPath = originalRootPath;
    });
  });

  // ==================== 针对askSave未覆盖路径 ====================

  describe('askSave 完整路径覆盖', () => {
    it('应该处理Save选择且保存成功的情况', async () => {
      projectManager.setTitle('Test Project');
      projectManager._filePath = '/test/project.ssproj';
      projectManager.setModified(true);
      
      // 确保Uri.file可以正常工作
      if (!vscode.Uri.file) {
        vscode.Uri.file = vi.fn().mockImplementation((path: string) => ({ fsPath: path }));
      }
      
      // Mock showWarningMessage返回Save选择
      vscode.window.showWarningMessage.mockResolvedValueOnce('Save');
      mockWriteFile.mockResolvedValueOnce(undefined);
      
      const result = await projectManager.askSave();
      
      expect(result).toBe(true);
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it('应该处理undefined返回值（用户直接关闭对话框）', async () => {
      projectManager.setModified(true);
      
      vscode.window.showWarningMessage.mockResolvedValueOnce(undefined);

      const result = await projectManager.askSave();
      
      expect(result).toBe(false);
    });

    it('应该处理Cancel选择的情况', async () => {
      projectManager.setModified(true);
      
      vscode.window.showWarningMessage.mockResolvedValueOnce('Cancel');

      const result = await projectManager.askSave();
      
      expect(result).toBe(false);
    });
  });

  // ==================== 针对deleteDataset未覆盖路径 ====================

  describe('deleteDataset 边界条件覆盖', () => {
    it('应该处理数据集索引为负数的情况', () => {
      projectManager.addGroup('Test Group', 'line');
      projectManager.addDataset(0, { title: 'Test Dataset' });

      const result = projectManager.deleteDataset(0, -1);
      
      expect(result).toBe(false);
    });

    it('应该处理数据集索引超出范围的情况', () => {
      projectManager.addGroup('Test Group', 'line');
      projectManager.addDataset(0, { title: 'Test Dataset' });

      const result = projectManager.deleteDataset(0, 999);
      
      expect(result).toBe(false);
    });

    it('应该处理组群索引为负数的deleteDataset调用', () => {
      const result = projectManager.deleteDataset(-1, 0);
      
      expect(result).toBe(false);
    });

    it('应该处理组群索引超出范围的deleteDataset调用', () => {
      const result = projectManager.deleteDataset(999, 0);
      
      expect(result).toBe(false);
    });

    it('应该处理空项目状态下的deleteDataset调用', () => {
      projectManager._currentProject = null;
      
      const result = projectManager.deleteDataset(0, 0);
      
      expect(result).toBe(false);
    });
  });

  // ==================== 针对addDataset详细路径覆盖 ====================

  describe('addDataset 详细属性覆盖', () => {
    beforeEach(() => {
      projectManager.addGroup('Test Group', 'line');
    });

    it('应该处理所有数据集属性的完整设置', () => {
      const fullDataset = {
        title: 'Full Dataset',
        units: 'm/s',
        widget: 'gauge',
        value: '100',
        index: 10,
        graph: true,
        fft: true,
        led: true,
        log: true,
        min: -100,
        max: 100,
        alarm: 50,
        ledHigh: 75,
        fftSamples: 2048,
        fftSamplingRate: 1000
      };

      const result = projectManager.addDataset(0, fullDataset);
      
      expect(result).toBe(true);
      expect(projectManager.currentProject?.groups[0].datasets[0]).toMatchObject(fullDataset);
    });

    it('应该处理所有数据集属性为默认值的情况', () => {
      const emptyDataset = {};

      const result = projectManager.addDataset(0, emptyDataset);
      
      expect(result).toBe(true);
      
      const addedDataset = projectManager.currentProject?.groups[0].datasets[0];
      expect(addedDataset).toMatchObject({
        title: expect.stringContaining('Dataset'),
        units: '',
        widget: '',
        value: '--',
        index: expect.any(Number),
        graph: false,
        fft: false,
        led: false,
        log: false,
        min: 0,
        max: 0,
        alarm: 0,
        ledHigh: 1,
        fftSamples: 1024,
        fftSamplingRate: 100
      });
    });

    it('应该处理部分属性为undefined的情况', () => {
      const partialDataset = {
        title: 'Partial Dataset',
        graph: undefined,
        fft: undefined,
        min: undefined,
        max: undefined
      };

      const result = projectManager.addDataset(0, partialDataset);
      
      expect(result).toBe(true);
      
      const addedDataset = projectManager.currentProject?.groups[0].datasets[0];
      expect(addedDataset?.graph).toBe(false);
      expect(addedDataset?.fft).toBe(false);
      expect(addedDataset?.min).toBe(0);
      expect(addedDataset?.max).toBe(0);
    });
  });

  // ==================== 针对getNextDatasetIndex详细覆盖 ====================

  describe('getNextDatasetIndex 算法覆盖', () => {
    it('应该处理空项目状态下的索引计算', () => {
      projectManager._currentProject = null;
      
      // 由于getNextDatasetIndex是私有方法，我们通过addDataset间接测试
      projectManager._currentProject = projectManager.createDefaultProject();
      projectManager.addGroup('Test Group', 'line');
      
      // 创建一个新实例来测试空项目状态
      ProjectManager.resetInstance();
      const newManager = ProjectManager.getInstance();
      newManager._currentProject = null;
      
      // 直接创建默认项目
      newManager._currentProject = newManager.createDefaultProject();
      newManager.addGroup('Test Group', 'line');
      
      const result = newManager.addDataset(0, { title: 'Test' });
      expect(result).toBe(true);
      
      newManager.dispose();
    });

    it('应该处理非连续数据集索引的计算', () => {
      projectManager.addGroup('Group 1', 'line');
      projectManager.addGroup('Group 2', 'bar');
      
      // 添加非连续索引的数据集
      projectManager.addDataset(0, { title: 'Dataset 1', index: 5 });
      projectManager.addDataset(0, { title: 'Dataset 2', index: 10 });
      projectManager.addDataset(1, { title: 'Dataset 3', index: 3 });
      
      // 添加新数据集应该使用下一个最大索引
      projectManager.addDataset(0, { title: 'Dataset 4' });
      
      const datasets = projectManager.currentProject?.groups[0].datasets;
      const lastDataset = datasets?.[datasets.length - 1];
      expect(lastDataset?.index).toBe(11); // 应该是10 + 1
    });

    it('应该处理所有数据集索引为0的边界情况', () => {
      projectManager.addGroup('Test Group', 'line');
      
      // 添加索引都为0的数据集
      projectManager.addDataset(0, { title: 'Dataset 1', index: 0 });
      projectManager.addDataset(0, { title: 'Dataset 2', index: 0 });
      
      // 添加新数据集应该使用下一个索引
      projectManager.addDataset(0, { title: 'Dataset 3' });
      
      const datasets = projectManager.currentProject?.groups[0].datasets;
      const lastDataset = datasets?.[datasets.length - 1];
      // 当最大索引是0时，下一个应该是1
      expect(lastDataset?.index).toBeGreaterThan(0);
    });
  });

  // ==================== 完整的错误处理覆盖 ====================

  describe('完整错误处理覆盖', () => {
    it('应该处理dispose过程中removeAllListeners的异常', () => {
      // Mock removeAllListeners抛出异常
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      projectManager.removeAllListeners = vi.fn().mockImplementation(() => {
        throw new Error('Mock dispose error');
      });

      expect(() => {
        projectManager.dispose();
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error during ProjectManager disposal:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('应该测试内存泄漏检查功能', () => {
      // 测试内存泄漏检查的不同路径
      const stats = projectManager.getEventEmitterStats();
      expect(stats).toHaveProperty('listenerCount');
      expect(stats).toHaveProperty('totalListeners');
      expect(stats).toHaveProperty('maxListeners');
      
      const leakCheck = projectManager.checkForMemoryLeaks();
      expect(leakCheck).toHaveProperty('hasWarnings');
      expect(leakCheck).toHaveProperty('warnings');
      expect(leakCheck).toHaveProperty('stats');
    });

    it('应该测试事件监听器清理功能', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // 测试清理特定事件
      projectManager.clearEventListeners(ProjectManager.EVENTS.PROJECT_LOADED);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cleared all listeners for event:')
      );
      
      // 测试清理所有事件
      projectManager.clearEventListeners();
      expect(consoleSpy).toHaveBeenCalledWith('Cleared all event listeners');
      
      consoleSpy.mockRestore();
    });

    it('应该测试项目数据集计数的边界情况', () => {
      // 测试空项目状态
      projectManager._currentProject = null;
      expect(projectManager.datasetCount).toBe(0);
      expect(projectManager.groupCount).toBe(0);
    });
  });

  // ==================== jsonFileName路径覆盖 ====================

  describe('jsonFileName 路径覆盖', () => {
    it('应该处理有文件路径时的文件名提取', () => {
      projectManager._filePath = '/path/to/my-project.ssproj';
      
      expect(projectManager.jsonFileName).toBe('my-project.ssproj');
    });

    it('应该处理复杂路径的文件名提取', () => {
      projectManager._filePath = '/very/long/path/with/spaces/complex project name.ssproj';
      
      expect(projectManager.jsonFileName).toBe('complex project name.ssproj');
    });

    it('应该处理空字符串路径', () => {
      projectManager._filePath = '';
      
      expect(projectManager.jsonFileName).toBe('New Project');
    });
  });
});
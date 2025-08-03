/*
 * ProjectManager 单元测试
 * 测试项目管理器的完整功能，包括文件操作、项目编辑、事件系统等
 */

import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import { ProjectConfig, Group, Dataset } from '../../src/extension/types/ProjectTypes';

// Mock fs/promises 模块 - 必须在导入之前
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

// 现在导入ProjectManager Mock
import { ProjectManager } from '../mocks/ProjectManager';
// 导入fs/promises获取mock引用
import * as fs from 'fs/promises';

// 使用全局vscode mock
const vscode = (global as any).vscode;

// 获取fs/promises mock函数的引用
const mockReadFile = vi.mocked(fs.readFile);
const mockWriteFile = vi.mocked(fs.writeFile);

describe('ProjectManager', () => {
  let projectManager: ProjectManager;
  const mockShowOpenDialog = vscode.window.showOpenDialog;
  const mockShowSaveDialog = vscode.window.showSaveDialog;
  const mockShowErrorMessage = vscode.window.showErrorMessage;
  const mockShowInformationMessage = vscode.window.showInformationMessage;
  const mockShowWarningMessage = vscode.window.showWarningMessage;

  beforeEach(() => {
    // 重置单例实例
    ProjectManager.resetInstance();
    projectManager = ProjectManager.getInstance();
    
    // 重置所有 mock
    vi.clearAllMocks();
    
    // 重置VSCode API mocks
    mockShowOpenDialog.mockReset();
    mockShowSaveDialog.mockReset();
    mockShowErrorMessage.mockReset();
    mockShowInformationMessage.mockReset();
    mockShowWarningMessage.mockReset();
  });

  afterEach(() => {
    // 使用新的dispose方法清理事件监听器，防止内存泄漏
    if (projectManager) {
      projectManager.dispose();
    }
  });

  // ==================== 基础功能测试 ====================

  describe('基础初始化测试', () => {
    it('应该正确创建单例实例', () => {
      const instance1 = ProjectManager.getInstance();
      const instance2 = ProjectManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ProjectManager);
    });

    it('应该初始化默认项目', () => {
      expect(projectManager.currentProject).toBeTruthy();
      expect(projectManager.currentProject?.title).toBe('New Project');
      expect(projectManager.groupCount).toBe(0);
      expect(projectManager.datasetCount).toBe(0);
      expect(projectManager.modified).toBe(false);
    });

    it('应该正确初始化项目属性', () => {
      expect(projectManager.title).toBe('New Project');
      expect(projectManager.jsonFilePath).toBe('');
      expect(projectManager.jsonFileName).toBe('New Project');
    });

    it('应该正确初始化默认项目配置', () => {
      const project = projectManager.currentProject!;
      
      expect(project.decoder).toBe(0); // PlainText
      expect(project.frameDetection).toBe(1); // EndDelimiterOnly
      expect(project.frameStart).toBe('$');
      expect(project.frameEnd).toBe(';');
      expect(project.frameParser).toContain('function parse(frame)');
      expect(project.groups).toEqual([]);
      expect(project.actions).toEqual([]);
    });
  });

  // ==================== 状态访问器测试 ====================

  describe('状态访问器测试', () => {
    it('应该正确返回修改状态', () => {
      expect(projectManager.modified).toBe(false);
      
      projectManager.setTitle('Test Project');
      expect(projectManager.modified).toBe(true);
    });

    it('应该正确返回项目标题', () => {
      expect(projectManager.title).toBe('New Project');
      
      projectManager.setTitle('Updated Title');
      expect(projectManager.title).toBe('Updated Title');
    });

    it('应该正确计算组群数量', () => {
      expect(projectManager.groupCount).toBe(0);
      
      projectManager.addGroup('Test Group', 'plot');
      expect(projectManager.groupCount).toBe(1);
      
      projectManager.addGroup('Test Group 2', 'gauge');
      expect(projectManager.groupCount).toBe(2);
    });

    it('应该正确计算数据集数量', () => {
      expect(projectManager.datasetCount).toBe(0);
      
      projectManager.addGroup('Test Group', 'plot');
      projectManager.addDataset(0, { title: 'Dataset 1' });
      expect(projectManager.datasetCount).toBe(1);
      
      projectManager.addDataset(0, { title: 'Dataset 2' });
      expect(projectManager.datasetCount).toBe(2);
    });

    it('应该正确处理文件路径和文件名', () => {
      expect(projectManager.jsonFilePath).toBe('');
      expect(projectManager.jsonFileName).toBe('New Project');

      // 模拟设置文件路径（通过私有属性访问）
      (projectManager as any)._filePath = '/path/to/test.ssproj';
      expect(projectManager.jsonFilePath).toBe('/path/to/test.ssproj');
      expect(projectManager.jsonFileName).toBe('test.ssproj');
    });
  });

  // ==================== 项目文件操作测试 ====================

  describe('项目文件操作测试', () => {
    describe('创建新项目', () => {
      it('应该正确创建新项目', async () => {
        // 先修改项目使其变为已修改状态
        projectManager.setTitle('Modified Project');
        expect(projectManager.modified).toBe(true);

        const eventSpy = vi.fn();
        projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, eventSpy);

        await projectManager.createNewProject();

        expect(projectManager.title).toBe('New Project');
        expect(projectManager.modified).toBe(false);
        expect(projectManager.jsonFilePath).toBe('');
        expect(eventSpy).toHaveBeenCalledWith(projectManager.currentProject);
      });

      it('应该发出正确的事件', async () => {
        const projectLoadedSpy = vi.fn();
        const titleChangedSpy = vi.fn();
        const fileChangedSpy = vi.fn();

        projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, projectLoadedSpy);
        projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, titleChangedSpy);
        projectManager.on(ProjectManager.EVENTS.JSON_FILE_CHANGED, fileChangedSpy);

        await projectManager.createNewProject();

        expect(projectLoadedSpy).toHaveBeenCalled();
        expect(titleChangedSpy).toHaveBeenCalledWith('New Project');
        expect(fileChangedSpy).toHaveBeenCalledWith('');
      });
    });

    describe('打开项目文件', () => {
      const validProjectData: ProjectConfig = {
        title: 'Test Project',
        decoder: 0,
        frameDetection: 1,
        frameStart: '$',
        frameEnd: ';',
        frameParser: 'function parse(frame) { return frame.split(","); }',
        groups: [],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      it('应该成功打开有效的项目文件', async () => {
        const filePath = '/test/project.ssproj';
        mockReadFile.mockResolvedValueOnce(JSON.stringify(validProjectData));

        const result = await projectManager.openProjectFile(filePath);

        expect(result).toBe(true);
        expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(projectManager.title).toBe('Test Project');
        expect(projectManager.jsonFilePath).toBe(filePath);
        expect(projectManager.modified).toBe(false);
        expect(mockShowInformationMessage).toHaveBeenCalledWith('Project loaded: project.ssproj');
      });

      it('应该通过文件对话框选择文件', async () => {
        const filePath = '/test/selected.ssproj';
        mockShowOpenDialog.mockResolvedValueOnce([{ fsPath: filePath }] as any);
        mockReadFile.mockResolvedValueOnce(JSON.stringify(validProjectData));

        const result = await projectManager.openProjectFile();

        expect(result).toBe(true);
        expect(mockShowOpenDialog).toHaveBeenCalledWith({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            'Project Files': ['json', 'ssproj']
          },
          title: 'Select Project File'
        });
      });

      it('应该处理文件对话框取消', async () => {
        mockShowOpenDialog.mockResolvedValueOnce(undefined);

        const result = await projectManager.openProjectFile();

        expect(result).toBe(false);
      });

      it('应该处理无效的JSON文件', async () => {
        const filePath = '/test/invalid.ssproj';
        mockReadFile.mockResolvedValueOnce('invalid json content');

        const result = await projectManager.openProjectFile(filePath);

        expect(result).toBe(false);
        expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to open project'));
      });

      it('应该处理验证失败的项目文件', async () => {
        const invalidProject = { ...validProjectData, title: '' }; // 空标题，验证失败
        mockReadFile.mockResolvedValueOnce(JSON.stringify(invalidProject));

        const result = await projectManager.openProjectFile('/test/invalid.ssproj');

        expect(result).toBe(false);
        expect(mockShowErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Invalid project file'));
      });

      it('应该处理文件读取错误', async () => {
        mockReadFile.mockRejectedValueOnce(new Error('File not found'));

        const result = await projectManager.openProjectFile('/test/notfound.ssproj');

        expect(result).toBe(false);
        expect(mockShowErrorMessage).toHaveBeenCalledWith('Failed to open project: File not found');
      });

      it('应该发出项目加载事件', async () => {
        const eventSpy = vi.fn();
        projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, eventSpy);
        
        mockReadFile.mockResolvedValueOnce(JSON.stringify(validProjectData));

        await projectManager.openProjectFile('/test/project.ssproj');

        expect(eventSpy).toHaveBeenCalledWith(validProjectData);
      });
    });

    describe('保存项目文件', () => {
      beforeEach(() => {
        projectManager.setTitle('Test Project');
        (projectManager as any)._filePath = '/test/existing.ssproj';
      });

      it('应该成功保存项目到现有路径', async () => {
        mockWriteFile.mockResolvedValueOnce(undefined);

        const result = await projectManager.saveProjectFile();

        expect(result).toBe(true);
        expect(mockWriteFile).toHaveBeenCalledWith(
          '/test/existing.ssproj',
          expect.stringContaining('"title": "Test Project"'),
          'utf-8'
        );
        expect(projectManager.modified).toBe(false);
        expect(mockShowInformationMessage).toHaveBeenCalledWith('Project saved: existing.ssproj');
      });

      it('应该处理空标题错误', async () => {
        projectManager.setTitle('');

        const result = await projectManager.saveProjectFile();

        expect(result).toBe(false);
        expect(mockShowErrorMessage).toHaveBeenCalledWith('Project title cannot be empty!');
      });

      it('应该通过保存对话框选择新路径', async () => {
        const newPath = '/test/new.ssproj';
        mockShowSaveDialog.mockResolvedValueOnce({ fsPath: newPath } as any);
        mockWriteFile.mockResolvedValueOnce(undefined);

        const result = await projectManager.saveProjectFile(true);

        expect(result).toBe(true);
        expect(mockShowSaveDialog).toHaveBeenCalled();
        expect(mockWriteFile).toHaveBeenCalledWith(newPath, expect.any(String), 'utf-8');
      });

      it('应该处理保存对话框取消', async () => {
        mockShowSaveDialog.mockResolvedValueOnce(undefined);

        const result = await projectManager.saveProjectFile(true);

        expect(result).toBe(false);
      });

      it('应该处理文件写入错误', async () => {
        mockWriteFile.mockRejectedValueOnce(new Error('Write failed'));

        const result = await projectManager.saveProjectFile();

        expect(result).toBe(false);
        expect(mockShowErrorMessage).toHaveBeenCalledWith('Failed to save project: Write failed');
      });

      it('应该发出项目保存事件', async () => {
        const eventSpy = vi.fn();
        projectManager.on(ProjectManager.EVENTS.PROJECT_SAVED, eventSpy);
        
        mockWriteFile.mockResolvedValueOnce(undefined);

        await projectManager.saveProjectFile();

        expect(eventSpy).toHaveBeenCalledWith('/test/existing.ssproj');
      });
    });

    describe('询问保存', () => {
      it('应该在未修改时直接返回true', async () => {
        expect(projectManager.modified).toBe(false);

        const result = await projectManager.askSave();

        expect(result).toBe(true);
        expect(mockShowWarningMessage).not.toHaveBeenCalled();
      });

      it('应该处理用户选择保存', async () => {
        projectManager.setTitle('Modified Project');
        mockShowWarningMessage.mockResolvedValueOnce('Save');
        mockWriteFile.mockResolvedValueOnce(undefined);
        (projectManager as any)._filePath = '/test/project.ssproj';

        const result = await projectManager.askSave();

        expect(result).toBe(true);
        expect(mockShowWarningMessage).toHaveBeenCalled();
        expect(mockWriteFile).toHaveBeenCalled();
      });

      it('应该处理用户选择不保存', async () => {
        projectManager.setTitle('Modified Project');
        mockShowWarningMessage.mockResolvedValueOnce('Don\'t Save');

        const result = await projectManager.askSave();

        expect(result).toBe(true);
        expect(mockWriteFile).not.toHaveBeenCalled();
      });

      it('应该处理用户取消', async () => {
        projectManager.setTitle('Modified Project');
        mockShowWarningMessage.mockResolvedValueOnce('Cancel');

        const result = await projectManager.askSave();

        expect(result).toBe(false);
      });

      it('应该处理未定义的返回值', async () => {
        projectManager.setTitle('Modified Project');
        mockShowWarningMessage.mockResolvedValueOnce(undefined);

        const result = await projectManager.askSave();

        expect(result).toBe(false);
      });
    });
  });

  // ==================== 项目编辑操作测试 ====================

  describe('项目编辑操作测试', () => {
    describe('设置项目标题', () => {
      it('应该正确设置新标题', () => {
        const eventSpy = vi.fn();
        projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, eventSpy);

        projectManager.setTitle('New Title');

        expect(projectManager.title).toBe('New Title');
        expect(projectManager.currentProject?.title).toBe('New Title');
        expect(projectManager.modified).toBe(true);
        expect(eventSpy).toHaveBeenCalledWith('New Title');
      });

      it('应该忽略相同的标题', () => {
        const currentTitle = projectManager.title;
        const eventSpy = vi.fn();
        projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, eventSpy);

        projectManager.setTitle(currentTitle);

        expect(projectManager.modified).toBe(false);
        expect(eventSpy).not.toHaveBeenCalled();
      });
    });

    describe('组群管理', () => {
      it('应该成功添加组群', () => {
        const result = projectManager.addGroup('Test Group', 'plot');

        expect(result).toBe(true);
        expect(projectManager.groupCount).toBe(1);
        expect(projectManager.currentProject?.groups[0]).toEqual({
          title: 'Test Group',
          widget: 'plot',
          datasets: []
        });
        expect(projectManager.modified).toBe(true);
      });

      it('应该使用默认组群标题', () => {
        const result = projectManager.addGroup('', '');

        expect(result).toBe(true);
        expect(projectManager.currentProject?.groups[0].title).toBe('Group 1');
      });

      it('应该正确编号多个组群', () => {
        projectManager.addGroup('', '');
        projectManager.addGroup('', '');

        expect(projectManager.currentProject?.groups[0].title).toBe('Group 1');
        expect(projectManager.currentProject?.groups[1].title).toBe('Group 2');
      });

      it('应该成功删除组群', () => {
        projectManager.addGroup('Test Group', 'plot');
        expect(projectManager.groupCount).toBe(1);

        const result = projectManager.deleteGroup(0);

        expect(result).toBe(true);
        expect(projectManager.groupCount).toBe(0);
        expect(projectManager.modified).toBe(true);
      });

      it('应该处理无效的组群索引', () => {
        const result1 = projectManager.deleteGroup(-1);
        const result2 = projectManager.deleteGroup(0);
        const result3 = projectManager.deleteGroup(999);

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
      });

      it('应该在没有当前项目时拒绝添加组群', () => {
        (projectManager as any)._currentProject = null;

        const result = projectManager.addGroup('Test', 'plot');

        expect(result).toBe(false);
      });
    });

    describe('数据集管理', () => {
      beforeEach(() => {
        projectManager.addGroup('Test Group', 'plot');
      });

      it('应该成功添加数据集', () => {
        const datasetData = {
          title: 'Test Dataset',
          units: 'V',
          widget: 'gauge'
        };

        const result = projectManager.addDataset(0, datasetData);

        expect(result).toBe(true);
        expect(projectManager.datasetCount).toBe(1);
        
        const dataset = projectManager.currentProject?.groups[0].datasets[0];
        expect(dataset?.title).toBe('Test Dataset');
        expect(dataset?.units).toBe('V');
        expect(dataset?.widget).toBe('gauge');
        expect(dataset?.index).toBe(1); // 自动分配的索引
        expect(projectManager.modified).toBe(true);
      });

      it('应该使用默认数据集属性', () => {
        const result = projectManager.addDataset(0, {});

        expect(result).toBe(true);
        
        const dataset = projectManager.currentProject?.groups[0].datasets[0];
        expect(dataset?.title).toBe('Dataset 1');
        expect(dataset?.units).toBe('');
        expect(dataset?.widget).toBe('');
        expect(dataset?.value).toBe('--');
        expect(dataset?.graph).toBe(false);
        expect(dataset?.fft).toBe(false);
        expect(dataset?.led).toBe(false);
        expect(dataset?.log).toBe(false);
      });

      it('应该正确分配数据集索引', () => {
        projectManager.addDataset(0, { title: 'Dataset 1' });
        projectManager.addDataset(0, { title: 'Dataset 2' });

        const datasets = projectManager.currentProject?.groups[0].datasets;
        expect(datasets?.[0].index).toBe(1);
        expect(datasets?.[1].index).toBe(2);
      });

      it('应该处理无效的组群索引', () => {
        const result1 = projectManager.addDataset(-1, {});
        const result2 = projectManager.addDataset(999, {});

        expect(result1).toBe(false);
        expect(result2).toBe(false);
      });

      it('应该成功删除数据集', () => {
        projectManager.addDataset(0, { title: 'Test Dataset' });
        expect(projectManager.datasetCount).toBe(1);

        const result = projectManager.deleteDataset(0, 0);

        expect(result).toBe(true);
        expect(projectManager.datasetCount).toBe(0);
        expect(projectManager.modified).toBe(true);
      });

      it('应该处理无效的数据集删除索引', () => {
        projectManager.addDataset(0, { title: 'Test Dataset' });

        const result1 = projectManager.deleteDataset(-1, 0); // 无效组群索引
        const result2 = projectManager.deleteDataset(0, -1); // 无效数据集索引
        const result3 = projectManager.deleteDataset(0, 999); // 超出范围的数据集索引

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
      });

      it('应该在没有当前项目时拒绝添加数据集', () => {
        (projectManager as any)._currentProject = null;

        const result = projectManager.addDataset(0, {});

        expect(result).toBe(false);
      });
    });
  });

  // ==================== 事件系统测试 ====================

  describe('事件系统测试', () => {
    it('应该正确发出项目修改事件', () => {
      const eventSpy = vi.fn();
      projectManager.on(ProjectManager.EVENTS.PROJECT_MODIFIED, eventSpy);

      projectManager.setTitle('Modified Title');

      expect(eventSpy).toHaveBeenCalledWith(true);
    });

    it('应该正确发出标题变更事件', () => {
      const eventSpy = vi.fn();
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, eventSpy);

      projectManager.setTitle('New Title');

      expect(eventSpy).toHaveBeenCalledWith('New Title');
    });

    it('应该支持多个事件监听器', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy1);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy2);

      projectManager.setTitle('New Title');

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('应该正确定义所有事件常量', () => {
      expect(ProjectManager.EVENTS.PROJECT_LOADED).toBe('projectLoaded');
      expect(ProjectManager.EVENTS.PROJECT_SAVED).toBe('projectSaved');
      expect(ProjectManager.EVENTS.PROJECT_MODIFIED).toBe('projectModified');
      expect(ProjectManager.EVENTS.TITLE_CHANGED).toBe('titleChanged');
      expect(ProjectManager.EVENTS.JSON_FILE_CHANGED).toBe('jsonFileChanged');
      expect(ProjectManager.EVENTS.VALIDATION_ERROR).toBe('validationError');
    });
  });

  // ==================== EventEmitter内存泄漏防护测试 ====================

  describe('EventEmitter内存泄漏防护测试', () => {
    it('应该设置合适的最大监听器数量限制', () => {
      expect(projectManager.getMaxListeners()).toBe(50);
    });

    it('应该正确统计事件监听器数量', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      const spy3 = vi.fn();

      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy1);
      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy2);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy3);

      const stats = projectManager.getEventEmitterStats();
      
      expect(stats.listenerCount[ProjectManager.EVENTS.PROJECT_LOADED]).toBe(2);
      expect(stats.listenerCount[ProjectManager.EVENTS.TITLE_CHANGED]).toBe(1);
      expect(stats.totalListeners).toBe(3);
      expect(stats.maxListeners).toBe(50);
    });

    it('应该检测潜在的内存泄漏风险', () => {
      // 添加大量监听器来触发警告
      const listeners = [];
      for (let i = 0; i < 12; i++) {
        const spy = vi.fn();
        listeners.push(spy);
        projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy);
      }

      const leakCheck = projectManager.checkForMemoryLeaks();
      
      expect(leakCheck.hasWarnings).toBe(true);
      expect(leakCheck.warnings.some(warning => 
        warning.includes(`Event '${ProjectManager.EVENTS.PROJECT_LOADED}'`) &&
        warning.includes('12 listeners')
      )).toBe(true);
    });

    it('应该正确清理所有事件监听器', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();

      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy1);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy2);

      // 验证监听器已添加
      expect(projectManager.getEventEmitterStats().totalListeners).toBe(2);

      // 清理所有监听器
      projectManager.clearEventListeners();

      // 验证监听器已清理
      expect(projectManager.getEventEmitterStats().totalListeners).toBe(0);
    });

    it('应该正确清理特定事件的监听器', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      const spy3 = vi.fn();

      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy1);
      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy2);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy3);

      // 清理特定事件的监听器
      projectManager.clearEventListeners(ProjectManager.EVENTS.PROJECT_LOADED);

      const stats = projectManager.getEventEmitterStats();
      expect(stats.listenerCount[ProjectManager.EVENTS.PROJECT_LOADED]).toBe(0);
      expect(stats.listenerCount[ProjectManager.EVENTS.TITLE_CHANGED]).toBe(1);
      expect(stats.totalListeners).toBe(1);
    });

    it('应该在dispose时清理所有资源', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();

      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy1);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy2);

      expect(projectManager.getEventEmitterStats().totalListeners).toBe(2);

      // dispose应该清理所有监听器
      projectManager.dispose();

      expect(projectManager.getEventEmitterStats().totalListeners).toBe(0);
    });

    it('应该正确重置单例实例', () => {
      const originalInstance = projectManager;
      const spy = vi.fn();
      
      originalInstance.on(ProjectManager.EVENTS.PROJECT_LOADED, spy);
      expect(originalInstance.getEventEmitterStats().totalListeners).toBe(1);

      // 重置实例
      ProjectManager.resetInstance();
      const newInstance = ProjectManager.getInstance();

      // 新实例应该没有旧的监听器
      expect(newInstance.getEventEmitterStats().totalListeners).toBe(0);
      expect(newInstance).not.toBe(originalInstance);
    });

    it('应该处理dispose过程中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 模拟removeAllListeners抛出错误
      const originalRemoveAllListeners = projectManager.removeAllListeners;
      projectManager.removeAllListeners = vi.fn().mockImplementation(() => {
        throw new Error('Mock error during cleanup');
      });

      // dispose应该捕获错误而不是抛出
      expect(() => projectManager.dispose()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error during ProjectManager disposal:', expect.any(Error));

      // 恢复原始方法和清理mock
      projectManager.removeAllListeners = originalRemoveAllListeners;
      consoleSpy.mockRestore();
    });

    it('应该不检测到内存泄漏风险当监听器数量合理时', () => {
      // 添加少量监听器
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      
      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, spy1);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, spy2);

      const leakCheck = projectManager.checkForMemoryLeaks();
      
      expect(leakCheck.hasWarnings).toBe(false);
      expect(leakCheck.warnings).toHaveLength(0);
      expect(leakCheck.stats.totalListeners).toBe(2);
    });
  });

  // ==================== 边界条件和错误处理测试 ====================

  describe('边界条件和错误处理测试', () => {
    it('应该处理空项目状态', () => {
      (projectManager as any)._currentProject = null;

      expect(projectManager.groupCount).toBe(0);
      expect(projectManager.datasetCount).toBe(0);
      expect(projectManager.currentProject).toBeNull();
    });

    it('应该正确计算复杂项目的数据集数量', () => {
      // 添加多个组群和数据集
      projectManager.addGroup('Group 1', 'plot');
      projectManager.addGroup('Group 2', 'gauge');
      
      projectManager.addDataset(0, { title: 'Dataset 1' });
      projectManager.addDataset(0, { title: 'Dataset 2' });
      projectManager.addDataset(1, { title: 'Dataset 3' });

      expect(projectManager.groupCount).toBe(2);
      expect(projectManager.datasetCount).toBe(3);
    });

    it('应该正确处理数据集索引分配', () => {
      // 创建有现有索引的项目
      const project = projectManager.currentProject!;
      project.groups = [{
        title: 'Test Group',
        widget: '',
        datasets: [
          {
            title: 'Existing Dataset',
            units: '',
            widget: '',
            value: '--',
            index: 5, // 已存在的索引
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
          }
        ]
      }];

      // 添加新数据集应该分配索引6
      projectManager.addDataset(0, { title: 'New Dataset' });
      
      const newDataset = project.groups[0].datasets[1];
      expect(newDataset.index).toBe(6);
    });

    it('应该在修改状态变化时只发出一次事件', () => {
      const eventSpy = vi.fn();
      projectManager.on(ProjectManager.EVENTS.PROJECT_MODIFIED, eventSpy);

      // 连续设置相同的修改状态
      (projectManager as any).setModified(true);
      (projectManager as any).setModified(true);

      expect(eventSpy).toHaveBeenCalledTimes(1);
    });
  });
});
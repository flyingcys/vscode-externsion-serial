/*
 * ProjectManager 最终覆盖率测试
 * 专门测试未覆盖的getter方法、文件操作和项目编辑方法
 * 目标：将ProjectManager覆盖率从71.35%提升到90%以上
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectConfig } from '../../src/extension/types/ProjectTypes';

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

// Mock vscode
const vscode = (global as any).vscode;
const fs = await import('fs/promises');
const path = await import('path');
const mockReadFile = vi.mocked(fs.readFile);
const mockWriteFile = vi.mocked(fs.writeFile);
const mockBasename = vi.mocked(path.basename);

// 导入真实的ProjectManager
let ProjectManager: any;

describe('ProjectManager - 最终覆盖率测试', () => {
  let projectManager: any;

  beforeEach(async () => {
    // 动态导入真实的ProjectManager
    const module = await import('../../src/extension/project/ProjectManager');
    ProjectManager = module.ProjectManager;
    
    ProjectManager.resetInstance();
    projectManager = ProjectManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (projectManager) {
      projectManager.dispose();
    }
  });

  // ==================== Getter方法测试 ====================

  describe('Getter方法覆盖测试', () => {
    it('应该正确获取modified状态', () => {
      // 初始状态应该是false
      expect(projectManager.modified).toBe(false);
      
      // 修改项目后应该是true
      projectManager.addGroup('Test Group', 'line');
      expect(projectManager.modified).toBe(true);
    });

    it('应该正确获取title', () => {
      // 默认标题
      expect(projectManager.title).toBe('New Project');
      
      // 设置新标题
      projectManager.setTitle('Custom Title');
      expect(projectManager.title).toBe('Custom Title');
    });

    it('应该正确获取jsonFilePath', () => {
      // 初始状态应该是空字符串
      expect(projectManager.jsonFilePath).toBe('');
      
      // 设置文件路径后应该返回路径
      projectManager._filePath = '/path/to/project.ssproj';
      expect(projectManager.jsonFilePath).toBe('/path/to/project.ssproj');
    });

    it('应该正确获取jsonFileName', () => {
      // 没有文件路径时应该返回默认名称
      expect(projectManager.jsonFileName).toBe('New Project');
      
      // 设置文件路径后应该返回文件名
      projectManager._filePath = '/path/to/test-project.ssproj';
      mockBasename.mockReturnValue('test-project.ssproj');
      expect(projectManager.jsonFileName).toBe('test-project.ssproj');
      
      // 验证path.basename被调用
      expect(mockBasename).toHaveBeenCalledWith('/path/to/test-project.ssproj');
    });
  });

  // ==================== 项目标题设置测试 ====================

  describe('项目标题设置测试', () => {
    it('应该正确设置项目标题', () => {
      const titleChangeSpy = vi.fn();
      const modifiedSpy = vi.fn();
      
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, titleChangeSpy);
      projectManager.on(ProjectManager.EVENTS.PROJECT_MODIFIED, modifiedSpy);
      
      projectManager.setTitle('New Test Title');
      
      expect(projectManager.title).toBe('New Test Title');
      expect(projectManager.currentProject?.title).toBe('New Test Title');
      expect(projectManager.modified).toBe(true);
      expect(titleChangeSpy).toHaveBeenCalledWith('New Test Title');
      expect(modifiedSpy).toHaveBeenCalledWith(true);
    });

    it('应该忽略相同标题的设置', () => {
      const titleChangeSpy = vi.fn();
      
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, titleChangeSpy);
      
      const currentTitle = projectManager.title;
      projectManager.setTitle(currentTitle);
      
      expect(titleChangeSpy).not.toHaveBeenCalled();
    });

    it('应该正确更新currentProject中的标题', () => {
      projectManager.setTitle('Project Title Update');
      
      expect(projectManager.currentProject?.title).toBe('Project Title Update');
      expect(projectManager.title).toBe('Project Title Update');
    });
  });

  // ==================== 文件操作测试 ====================

  describe('文件操作覆盖测试', () => {
    beforeEach(() => {
      // 重置所有vscode mock方法
      vscode.window.showInformationMessage = vi.fn();
      vscode.window.showErrorMessage = vi.fn();
      vscode.window.showOpenDialog = vi.fn();
      vscode.window.showSaveDialog = vi.fn();
      vscode.window.showWarningMessage = vi.fn();
      vscode.workspace = { rootPath: '/workspace' };
      vscode.Uri = {
        file: vi.fn((path: string) => ({ fsPath: path }))
      };
    });

    it('应该测试openProjectFile的基本路径', async () => {
      // 简单测试文件读取错误路径
      mockReadFile.mockRejectedValue(new Error('File not found'));
      
      const result = await projectManager.openProjectFile('/nonexistent/file.ssproj');
      
      expect(result).toBe(false);
      expect(mockReadFile).toHaveBeenCalledWith('/nonexistent/file.ssproj', 'utf-8');
    });

    it('应该测试saveProjectFile的空标题检查', async () => {
      // 保存项目前先设置空标题
      projectManager._title = '   '; // 设置空白标题
      
      const result = await projectManager.saveProjectFile();
      
      expect(result).toBe(false);
    });

    it('应该测试saveProjectFile的文件写入错误', async () => {
      projectManager.setTitle('Valid Title');
      projectManager._filePath = '/test/file.ssproj';
      
      mockWriteFile.mockRejectedValue(new Error('Permission denied'));
      
      const result = await projectManager.saveProjectFile();
      
      expect(result).toBe(false);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('应该测试saveProjectFile的成功写入', async () => {
      projectManager.setTitle('Valid Title');
      projectManager._filePath = '/test/file.ssproj';
      
      mockWriteFile.mockResolvedValue(undefined);
      
      const result = await projectManager.saveProjectFile();
      
      expect(result).toBe(true);
      expect(projectManager.modified).toBe(false);
      expect(mockWriteFile).toHaveBeenCalled();
    });
  });

  // ==================== askSave方法测试 ====================

  describe('askSave方法测试', () => {
    it('应该在项目未修改时直接返回true', async () => {
      // 确保项目未修改
      projectManager._modified = false;
      
      const result = await projectManager.askSave();
      
      expect(result).toBe(true);
    });

    it('应该测试askSave的修改状态检查路径', async () => {
      // 通过正常方法触发修改状态
      projectManager.addGroup('Test Group', 'line');
      expect(projectManager.modified).toBe(true);
      
      // Mock用户选择Don't Save以避免实际保存文件（注意转义符）
      (vscode.window.showWarningMessage as any).mockResolvedValueOnce('Don\'t Save');
      
      const result = await projectManager.askSave();
      
      expect(result).toBe(true);
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });

    it('应该测试askSave的Cancel路径', async () => {
      projectManager._modified = true;
      projectManager._title = 'Test Project';
      
      vscode.window.showWarningMessage = vi.fn().mockResolvedValue('Cancel');
      
      const result = await projectManager.askSave();
      
      expect(result).toBe(false);
    });
  });

  // ==================== 创建新项目方法测试 ====================

  describe('createNewProject方法测试', () => {
    it('应该正确触发createNewProject的所有事件', async () => {
      const projectLoadedSpy = vi.fn();
      const titleChangedSpy = vi.fn();
      const jsonFileChangedSpy = vi.fn();
      
      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, projectLoadedSpy);
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, titleChangedSpy);
      projectManager.on(ProjectManager.EVENTS.JSON_FILE_CHANGED, jsonFileChangedSpy);
      
      await projectManager.createNewProject();
      
      expect(projectLoadedSpy).toHaveBeenCalledWith(projectManager.currentProject);
      expect(titleChangedSpy).toHaveBeenCalledWith('New Project');
      expect(jsonFileChangedSpy).toHaveBeenCalledWith('');
      expect(projectManager.modified).toBe(false);
      expect(projectManager.jsonFilePath).toBe('');
    });
  });
});
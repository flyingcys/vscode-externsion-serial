/**
 * ProjectManager Mock for Testing Environment
 * 测试环境专用的ProjectManager模拟实现
 */

import { EventEmitter } from 'events';
import { ProjectConfig, Group, Dataset, ValidationResult } from '../../src/extension/types/ProjectTypes';

// Mock ProjectValidator
export class MockProjectValidator {
  validateProject(project: any): ValidationResult {
    // 简单验证：检查标题是否为空
    if (!project.title || project.title.trim() === '') {
      return {
        valid: false,
        errors: ['Project title cannot be empty']
      };
    }
    
    return {
      valid: true,
      errors: []
    };
  }
}

// Mock ProjectSerializer
export class MockProjectSerializer {
  serialize(project: ProjectConfig): any {
    return {
      title: project.title,
      decoder: project.decoder,
      frameDetection: project.frameDetection,
      frameStart: project.frameStart,
      frameEnd: project.frameEnd,
      frameParser: project.frameParser,
      groups: project.groups || [],
      actions: project.actions || [],
      mapTilerApiKey: project.mapTilerApiKey || '',
      thunderforestApiKey: project.thunderforestApiKey || ''
    };
  }
}

/**
 * 测试用的ProjectManager Mock类
 * 简化的ProjectManager实现，专注于测试核心功能
 */
export class ProjectManager extends EventEmitter {
  private static _instance: ProjectManager;
  
  // 核心状态
  private _currentProject: ProjectConfig | null = null;
  private _filePath: string = '';
  private _modified: boolean = false;
  private _title: string = '';
  
  // Mock子管理器
  private _validator: MockProjectValidator;
  private _serializer: MockProjectSerializer;
  
  // 事件类型定义
  public static readonly EVENTS = {
    PROJECT_LOADED: 'projectLoaded',
    PROJECT_SAVED: 'projectSaved',
    PROJECT_MODIFIED: 'projectModified',
    TITLE_CHANGED: 'titleChanged',
    JSON_FILE_CHANGED: 'jsonFileChanged',
    VALIDATION_ERROR: 'validationError'
  } as const;

  private constructor() {
    super();
    this.setMaxListeners(50);
    
    this._validator = new MockProjectValidator();
    this._serializer = new MockProjectSerializer();
    
    // 初始化默认项目
    this.createNewProject();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ProjectManager {
    if (!ProjectManager._instance) {
      ProjectManager._instance = new ProjectManager();
    }
    return ProjectManager._instance;
  }

  /**
   * 重置单例实例（测试用）
   */
  public static resetInstance(): void {
    if (ProjectManager._instance) {
      ProjectManager._instance.dispose();
    }
    ProjectManager._instance = null!;
  }

  // ================== 状态访问器 ==================

  public get modified(): boolean {
    return this._modified;
  }

  public get title(): string {
    return this._title;
  }

  public get jsonFilePath(): string {
    return this._filePath;
  }

  public get jsonFileName(): string {
    if (this._filePath) {
      return this._filePath.split('/').pop() || 'project.ssproj';
    }
    return 'New Project';
  }

  public get currentProject(): ProjectConfig | null {
    return this._currentProject;
  }

  public get groupCount(): number {
    return this._currentProject?.groups.length || 0;
  }

  public get datasetCount(): number {
    if (!this._currentProject) return 0;
    
    return this._currentProject.groups.reduce((total, group) => {
      return total + group.datasets.length;
    }, 0);
  }

  // ================== 项目文件操作 ==================

  /**
   * 创建新项目
   */
  public async createNewProject(): Promise<void> {
    this._currentProject = this.createDefaultProject();
    this._filePath = '';
    this._title = this._currentProject.title;
    this._modified = false;
    
    this.emit(ProjectManager.EVENTS.PROJECT_LOADED, this._currentProject);
    this.emit(ProjectManager.EVENTS.TITLE_CHANGED, this._title);
    this.emit(ProjectManager.EVENTS.JSON_FILE_CHANGED, '');
  }

  /**
   * 打开项目文件
   */
  public async openProjectFile(filePath?: string): Promise<boolean> {
    try {
      const vscode = (global as any).vscode;
      let targetPath = filePath;
      
      // 如果没有提供路径，弹出文件选择对话框
      if (!targetPath) {
        const result = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            'Project Files': ['json', 'ssproj']
          },
          title: 'Select Project File'
        });
        
        if (!result || result.length === 0) {
          return false;
        }
        
        targetPath = result[0].fsPath;
      }

      // 读取和解析文件
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(targetPath, 'utf-8');
      const projectData = JSON.parse(fileContent);
      
      // 验证项目数据
      const validation = this._validator.validateProject(projectData);
      if (!validation.valid) {
        vscode.window.showErrorMessage(`Invalid project file: ${validation.errors.join(', ')}`);
        return false;
      }

      // 加载项目
      this._currentProject = projectData;
      this._filePath = targetPath;
      this._title = projectData.title || 'Untitled Project';
      this._modified = false;

      // 发出事件
      this.emit(ProjectManager.EVENTS.PROJECT_LOADED, this._currentProject);
      this.emit(ProjectManager.EVENTS.TITLE_CHANGED, this._title);
      this.emit(ProjectManager.EVENTS.JSON_FILE_CHANGED, this._filePath);

      vscode.window.showInformationMessage(`Project loaded: ${this.jsonFileName}`);
      return true;

    } catch (error) {
      const vscode = (global as any).vscode;
      const message = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Failed to open project: ${message}`);
      return false;
    }
  }

  /**
   * 保存项目文件
   */
  public async saveProjectFile(askPath: boolean = false): Promise<boolean> {
    try {
      const vscode = (global as any).vscode;
      
      // 验证项目标题
      if (!this._title.trim()) {
        vscode.window.showErrorMessage('Project title cannot be empty!');
        return false;
      }

      let targetPath = this._filePath;

      // 如果需要询问路径或当前没有路径
      if (askPath || !targetPath) {
        const result = await vscode.window.showSaveDialog({
          defaultUri: targetPath ? 
            vscode.Uri.file(targetPath) : 
            vscode.Uri.file(`${this._title}.ssproj`),
          filters: {
            'Serial Studio Project': ['ssproj'],
            'JSON Files': ['json']
          },
          title: 'Save Serial Studio Project'
        });

        if (!result) {
          return false;
        }

        targetPath = result.fsPath;
      }

      // 序列化项目数据
      const projectJson = this._serializer.serialize(this._currentProject!);
      
      // 写入文件
      const fs = await import('fs/promises');
      await fs.writeFile(targetPath, JSON.stringify(projectJson, null, 2), 'utf-8');

      // 更新状态
      this._filePath = targetPath;
      this._modified = false;

      // 发出事件
      this.emit(ProjectManager.EVENTS.PROJECT_SAVED, targetPath);
      
      vscode.window.showInformationMessage(`Project saved: ${this.jsonFileName}`);
      return true;

    } catch (error) {
      const vscode = (global as any).vscode;
      const message = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Failed to save project: ${message}`);
      return false;
    }
  }

  /**
   * 询问保存
   */
  public async askForSave(): Promise<boolean> {
    if (!this._modified) {
      return true;
    }

    const vscode = (global as any).vscode;
    const result = await vscode.window.showWarningMessage(
      `Do you want to save changes to ${this.jsonFileName}?`,
      { modal: true },
      'Save',
      "Don't Save",
      'Cancel'
    );

    if (result === 'Save') {
      return await this.saveProjectFile();
    } else if (result === "Don't Save") {
      return true;
    } else {
      return false; // Cancel
    }
  }

  /**
   * 询问保存（测试期望的方法名）
   */
  public async askSave(): Promise<boolean> {
    return this.askForSave();
  }

  // ================== 项目编辑方法 ==================

  /**
   * 设置项目标题
   */
  public setTitle(title: string): void {
    if (this._title !== title) {
      this._title = title;
      if (this._currentProject) {
        this._currentProject.title = title;
      }
      this.setModified(true);
      this.emit(ProjectManager.EVENTS.TITLE_CHANGED, title);
    }
  }

  /**
   * 添加组群
   */
  public addGroup(title: string, widget: string): boolean {
    if (!this._currentProject) return false;

    // 如果标题为空，使用默认标题
    let groupTitle = title;
    if (!title.trim()) {
      const groupCount = this._currentProject.groups.length;
      groupTitle = `Group ${groupCount + 1}`;
    }

    const newGroup: Group = {
      title: groupTitle,
      widget,
      datasets: []
    };

    this._currentProject.groups.push(newGroup);
    this.setModified(true);
    return true;
  }

  /**
   * 删除组群
   */
  public deleteGroup(index: number): boolean {
    if (!this._currentProject || index < 0 || index >= this._currentProject.groups.length) {
      return false;
    }

    this._currentProject.groups.splice(index, 1);
    this.setModified(true);
    return true;
  }

  /**
   * 添加数据集
   */
  public addDataset(groupIndex: number, dataset: Partial<Dataset>): boolean {
    if (!this._currentProject || groupIndex < 0 || groupIndex >= this._currentProject.groups.length) {
      return false;
    }

    // 自动分配索引（从1开始）
    const existingDatasets = this._currentProject.groups[groupIndex].datasets;
    let nextIndex = dataset.index;
    
    if (nextIndex === undefined) {
      // 找到最大索引，然后分配下一个
      const maxIndex = existingDatasets.reduce((max, ds) => Math.max(max, ds.index || 0), 0);
      nextIndex = Math.max(maxIndex + 1, existingDatasets.length + 1);
    }

    // 如果没有提供标题，使用默认标题
    let datasetTitle = dataset.title;
    if (!datasetTitle) {
      datasetTitle = `Dataset ${nextIndex}`;
    }

    const newDataset: any = {
      title: datasetTitle,
      index: nextIndex,
      graph: dataset.graph !== undefined ? dataset.graph : false,
      fft: (dataset as any).fft !== undefined ? (dataset as any).fft : false,
      led: (dataset as any).led !== undefined ? (dataset as any).led : false,
      log: (dataset as any).log !== undefined ? (dataset as any).log : false,
      units: dataset.units || '',
      widget: dataset.widget || '',
      value: (dataset as any).value || '--',
      min: dataset.min || 0,
      max: dataset.max || 100,
      alarmMin: dataset.alarmMin || 0,
      alarmMax: dataset.alarmMax || 100
    };

    this._currentProject.groups[groupIndex].datasets.push(newDataset);
    this.setModified(true);
    return true;
  }

  /**
   * 删除数据集
   */
  public deleteDataset(groupIndex: number, datasetIndex: number): boolean {
    if (!this._currentProject || 
        groupIndex < 0 || groupIndex >= this._currentProject.groups.length ||
        datasetIndex < 0 || datasetIndex >= this._currentProject.groups[groupIndex].datasets.length) {
      return false;
    }

    this._currentProject.groups[groupIndex].datasets.splice(datasetIndex, 1);
    this.setModified(true);
    return true;
  }

  /**
   * 设置修改状态
   */
  private setModified(modified: boolean): void {
    if (this._modified !== modified) {
      this._modified = modified;
      this.emit(ProjectManager.EVENTS.PROJECT_MODIFIED, modified);
    }
  }

  /**
   * 创建默认项目
   */
  private createDefaultProject(): ProjectConfig {
    return {
      title: 'New Project',
      decoder: 0, // PlainText
      frameDetection: 1, // EndDelimiterOnly
      frameStart: '$',
      frameEnd: ';',
      frameParser: 'function parse(frame) {\n  return frame.split(",");\n}',
      groups: [],
      actions: [],
      mapTilerApiKey: '',
      thunderforestApiKey: ''
    };
  }

  // ================== EventEmitter管理方法 ==================

  /**
   * 获取EventEmitter统计信息
   */
  public getEventEmitterStats(): { totalListeners: number; eventTypes: string[]; listenerCount: Record<string, number>; maxListeners: number } {
    const eventNames = this.eventNames() as string[];
    const listenerCount: Record<string, number> = {};
    
    // 为每个事件类型统计监听器数量
    Object.values(ProjectManager.EVENTS).forEach(eventName => {
      listenerCount[eventName] = this.listenerCount(eventName);
    });
    
    const totalListeners = eventNames.reduce((total, eventName) => {
      return total + this.listenerCount(eventName);
    }, 0);

    return {
      totalListeners,
      eventTypes: eventNames,
      listenerCount,
      maxListeners: this.getMaxListeners()
    };
  }

  /**
   * 检查内存泄漏风险
   */
  public checkForMemoryLeaks(): { hasLeakRisk: boolean; highRiskEvents: string[]; hasWarnings: boolean; warnings: string[]; stats: any } {
    const eventNames = this.eventNames() as string[];
    const highRiskEvents = eventNames.filter(eventName => {
      return this.listenerCount(eventName) > 10; // 超过10个监听器视为高风险
    });
    
    const warnings = highRiskEvents.map(eventName => 
      `Event '${eventName}' has ${this.listenerCount(eventName)} listeners (potential memory leak)`
    );

    const stats = this.getEventEmitterStats();

    return {
      hasLeakRisk: highRiskEvents.length > 0,
      highRiskEvents,
      hasWarnings: warnings.length > 0,
      warnings,
      stats
    };
  }

  /**
   * 清理特定事件的监听器
   */
  public clearEventListeners(eventName?: string): void {
    if (eventName) {
      this.removeAllListeners(eventName);
      console.log(`Cleared all listeners for event: ${eventName}`);
    } else {
      this.removeAllListeners();
      console.log('Cleared all event listeners');
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    try {
      this.removeAllListeners();
      console.log('ProjectManager disposed: all event listeners removed');
    } catch (error) {
      console.error('Error during ProjectManager disposal:', error instanceof Error ? error : new Error('Unknown error'));
      // 继续执行，不抛出错误
    }
  }
}
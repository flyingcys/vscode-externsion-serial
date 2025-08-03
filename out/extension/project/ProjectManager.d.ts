/// <reference types="node" />
import { EventEmitter } from 'events';
import { ProjectConfig, Dataset } from '../types/ProjectTypes';
/**
 * 项目管理器 - 单例模式管理项目状态
 * 对应Serial-Studio的ProjectModel类
 */
export declare class ProjectManager extends EventEmitter {
    private static _instance;
    private _currentProject;
    private _filePath;
    private _modified;
    private _title;
    private _validator;
    private _serializer;
    static readonly EVENTS: {
        readonly PROJECT_LOADED: "projectLoaded";
        readonly PROJECT_SAVED: "projectSaved";
        readonly PROJECT_MODIFIED: "projectModified";
        readonly TITLE_CHANGED: "titleChanged";
        readonly JSON_FILE_CHANGED: "jsonFileChanged";
        readonly VALIDATION_ERROR: "validationError";
    };
    private constructor();
    /**
     * 获取单例实例 - 对应ProjectModel::instance()
     */
    static getInstance(): ProjectManager;
    /**
     * 获取项目是否已修改 - 对应modified()
     */
    get modified(): boolean;
    /**
     * 获取项目标题 - 对应title()
     */
    get title(): string;
    /**
     * 获取JSON文件路径 - 对应jsonFilePath()
     */
    get jsonFilePath(): string;
    /**
     * 获取JSON文件名 - 对应jsonFileName()
     */
    get jsonFileName(): string;
    /**
     * 获取当前项目配置 - 对应groups()等访问器
     */
    get currentProject(): ProjectConfig | null;
    /**
     * 获取项目组群数量 - 对应groupCount()
     */
    get groupCount(): number;
    /**
     * 获取数据集总数 - 对应datasetCount()
     */
    get datasetCount(): number;
    /**
     * 创建新项目 - 对应newJsonFile()
     */
    createNewProject(): Promise<void>;
    /**
     * 打开项目文件 - 对应openJsonFile()
     */
    openProjectFile(filePath?: string): Promise<boolean>;
    /**
     * 保存项目文件 - 对应saveJsonFile()
     */
    saveProjectFile(askPath?: boolean): Promise<boolean>;
    /**
     * 询问是否保存 - 对应askSave()
     */
    askSave(): Promise<boolean>;
    /**
     * 设置项目标题
     */
    setTitle(title: string): void;
    /**
     * 添加组群 - 对应addGroup()
     */
    addGroup(title: string, widget: string): boolean;
    /**
     * 删除组群 - 对应deleteCurrentGroup()
     */
    deleteGroup(groupIndex: number): boolean;
    /**
     * 添加数据集 - 对应addDataset()
     */
    addDataset(groupIndex: number, dataset: Partial<Dataset>): boolean;
    /**
     * 删除数据集 - 对应deleteCurrentDataset()
     */
    deleteDataset(groupIndex: number, datasetIndex: number): boolean;
    /**
     * 设置修改状态 - 对应setModified()
     */
    private setModified;
    /**
     * 创建默认项目配置
     */
    private createDefaultProject;
    /**
     * 获取默认帧解析器代码
     */
    private getDefaultFrameParser;
    /**
     * 获取下一个数据集索引
     */
    private getNextDatasetIndex;
    /**
     * 清理资源和事件监听器 - 用于扩展停用时清理内存
     */
    dispose(): void;
    /**
     * 获取EventEmitter状态信息 - 用于调试和监控
     */
    getEventEmitterStats(): {
        listenerCount: {
            [event: string]: number;
        };
        totalListeners: number;
        maxListeners: number;
    };
    /**
     * 检查是否存在潜在的内存泄漏
     */
    checkForMemoryLeaks(): {
        hasWarnings: boolean;
        warnings: string[];
        stats: ReturnType<ProjectManager['getEventEmitterStats']>;
    };
    /**
     * 强制清理特定事件的所有监听器
     */
    clearEventListeners(eventName?: string): void;
    /**
     * 重置单例实例 - 仅用于测试环境
     * @internal
     */
    static resetInstance(): void;
}
//# sourceMappingURL=ProjectManager.d.ts.map
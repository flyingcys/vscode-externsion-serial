"use strict";
/*
 * Serial Studio VSCode Extension
 * 项目管理器 - 对应Serial-Studio的ProjectModel
 *
 * 基于Serial-Studio架构的完全等价实现
 * 提供项目的创建、加载、保存、验证等核心功能
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const ProjectValidator_1 = require("./ProjectValidator");
const ProjectSerializer_1 = require("./ProjectSerializer");
/**
 * 项目管理器 - 单例模式管理项目状态
 * 对应Serial-Studio的ProjectModel类
 */
class ProjectManager extends events_1.EventEmitter {
    static _instance;
    // 核心状态 - 对应ProjectModel的成员变量
    _currentProject = null;
    _filePath = '';
    _modified = false;
    _title = '';
    // 子管理器
    _validator;
    _serializer;
    // 事件类型定义 - 对应Serial-Studio的signals
    static EVENTS = {
        PROJECT_LOADED: 'projectLoaded',
        PROJECT_SAVED: 'projectSaved',
        PROJECT_MODIFIED: 'projectModified',
        TITLE_CHANGED: 'titleChanged',
        JSON_FILE_CHANGED: 'jsonFileChanged',
        VALIDATION_ERROR: 'validationError'
    };
    constructor() {
        super();
        // 设置EventEmitter最大监听器数量限制，防止内存泄漏
        this.setMaxListeners(50);
        this._validator = new ProjectValidator_1.ProjectValidator();
        this._serializer = new ProjectSerializer_1.ProjectSerializer();
        // 初始化默认项目
        this.createNewProject();
    }
    /**
     * 获取单例实例 - 对应ProjectModel::instance()
     */
    static getInstance() {
        if (!ProjectManager._instance) {
            ProjectManager._instance = new ProjectManager();
        }
        return ProjectManager._instance;
    }
    // ================== 状态访问器 ==================
    // 对应ProjectModel的getter方法
    /**
     * 获取项目是否已修改 - 对应modified()
     */
    get modified() {
        return this._modified;
    }
    /**
     * 获取项目标题 - 对应title()
     */
    get title() {
        return this._title;
    }
    /**
     * 获取JSON文件路径 - 对应jsonFilePath()
     */
    get jsonFilePath() {
        return this._filePath;
    }
    /**
     * 获取JSON文件名 - 对应jsonFileName()
     */
    get jsonFileName() {
        if (this._filePath) {
            return path.basename(this._filePath);
        }
        return 'New Project';
    }
    /**
     * 获取当前项目配置 - 对应groups()等访问器
     */
    get currentProject() {
        return this._currentProject;
    }
    /**
     * 获取项目组群数量 - 对应groupCount()
     */
    get groupCount() {
        return this._currentProject?.groups.length || 0;
    }
    /**
     * 获取数据集总数 - 对应datasetCount()
     */
    get datasetCount() {
        if (!this._currentProject) {
            return 0;
        }
        return this._currentProject.groups.reduce((total, group) => {
            return total + group.datasets.length;
        }, 0);
    }
    // ================== 项目文件操作 ==================
    // 对应ProjectModel的文件操作方法
    /**
     * 创建新项目 - 对应newJsonFile()
     */
    async createNewProject() {
        this._currentProject = this.createDefaultProject();
        this._filePath = '';
        this._title = this._currentProject.title;
        this._modified = false;
        this.emit(ProjectManager.EVENTS.PROJECT_LOADED, this._currentProject);
        this.emit(ProjectManager.EVENTS.TITLE_CHANGED, this._title);
        this.emit(ProjectManager.EVENTS.JSON_FILE_CHANGED, '');
    }
    /**
     * 打开项目文件 - 对应openJsonFile()
     */
    async openProjectFile(filePath) {
        try {
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to open project: ${message}`);
            return false;
        }
    }
    /**
     * 保存项目文件 - 对应saveJsonFile()
     */
    async saveProjectFile(askPath = false) {
        try {
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
                        vscode.Uri.file(path.join(vscode.workspace.rootPath || '', `${this._title}.ssproj`)),
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
            const projectJson = this._serializer.serialize(this._currentProject);
            // 写入文件
            await fs.writeFile(targetPath, JSON.stringify(projectJson, null, 2), 'utf-8');
            // 更新状态
            this._filePath = targetPath;
            this._modified = false;
            // 发出事件
            this.emit(ProjectManager.EVENTS.PROJECT_SAVED, targetPath);
            this.emit(ProjectManager.EVENTS.JSON_FILE_CHANGED, this._filePath);
            vscode.window.showInformationMessage(`Project saved: ${this.jsonFileName}`);
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to save project: ${message}`);
            return false;
        }
    }
    /**
     * 询问是否保存 - 对应askSave()
     */
    async askSave() {
        if (!this._modified) {
            return true;
        }
        const result = await vscode.window.showWarningMessage(`The project "${this._title}" has unsaved changes.`, { modal: true }, 'Save', 'Don\'t Save', 'Cancel');
        switch (result) {
            case 'Save':
                return await this.saveProjectFile();
            case 'Don\'t Save':
                return true;
            case 'Cancel':
            default:
                return false;
        }
    }
    // ================== 项目编辑操作 ==================
    // 对应ProjectModel的编辑方法
    /**
     * 设置项目标题
     */
    setTitle(title) {
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
     * 添加组群 - 对应addGroup()
     */
    addGroup(title, widget) {
        if (!this._currentProject) {
            return false;
        }
        const newGroup = {
            title: title || `Group ${this._currentProject.groups.length + 1}`,
            widget: widget || '',
            datasets: []
        };
        this._currentProject.groups.push(newGroup);
        this.setModified(true);
        return true;
    }
    /**
     * 删除组群 - 对应deleteCurrentGroup()
     */
    deleteGroup(groupIndex) {
        if (!this._currentProject || groupIndex < 0 || groupIndex >= this._currentProject.groups.length) {
            return false;
        }
        this._currentProject.groups.splice(groupIndex, 1);
        this.setModified(true);
        return true;
    }
    /**
     * 添加数据集 - 对应addDataset()
     */
    addDataset(groupIndex, dataset) {
        if (!this._currentProject || groupIndex < 0 || groupIndex >= this._currentProject.groups.length) {
            return false;
        }
        const group = this._currentProject.groups[groupIndex];
        const newDataset = {
            title: dataset.title || `Dataset ${group.datasets.length + 1}`,
            units: dataset.units || '',
            widget: dataset.widget || '',
            value: dataset.value || '--',
            index: dataset.index || this.getNextDatasetIndex(),
            graph: dataset.graph ?? false,
            fft: dataset.fft ?? false,
            led: dataset.led ?? false,
            log: dataset.log ?? false,
            min: dataset.min ?? 0,
            max: dataset.max ?? 0,
            alarm: dataset.alarm ?? 0,
            ledHigh: dataset.ledHigh ?? 1,
            fftSamples: dataset.fftSamples ?? 1024,
            fftSamplingRate: dataset.fftSamplingRate ?? 100
        };
        group.datasets.push(newDataset);
        this.setModified(true);
        return true;
    }
    /**
     * 删除数据集 - 对应deleteCurrentDataset()
     */
    deleteDataset(groupIndex, datasetIndex) {
        if (!this._currentProject ||
            groupIndex < 0 || groupIndex >= this._currentProject.groups.length) {
            return false;
        }
        const group = this._currentProject.groups[groupIndex];
        if (datasetIndex < 0 || datasetIndex >= group.datasets.length) {
            return false;
        }
        group.datasets.splice(datasetIndex, 1);
        this.setModified(true);
        return true;
    }
    /**
     * 设置修改状态 - 对应setModified()
     */
    setModified(modified) {
        if (this._modified !== modified) {
            this._modified = modified;
            this.emit(ProjectManager.EVENTS.PROJECT_MODIFIED, modified);
        }
    }
    // ================== 私有辅助方法 ==================
    /**
     * 创建默认项目配置
     */
    createDefaultProject() {
        return {
            title: 'New Project',
            decoder: 0,
            frameDetection: 1,
            frameStart: '$',
            frameEnd: ';',
            frameParser: this.getDefaultFrameParser(),
            groups: [],
            actions: [],
            mapTilerApiKey: '',
            thunderforestApiKey: ''
        };
    }
    /**
     * 获取默认帧解析器代码
     */
    getDefaultFrameParser() {
        return `/**
 * Splits a data frame into an array of elements using a comma separator.
 *
 * Use this function to break a string (like "value1,value2,value3") into
 * individual pieces, which can then be displayed or processed in your project.
 *
 * @param[in]  frame   A string containing the data frame.
 *                     Example: "value1,value2,value3"
 * @return     An array of strings with the split elements.
 *             Example: ["value1", "value2", "value3"]
 *
 * @note You can declare global variables outside this function if needed
 *       for storing settings or keeping state between calls.
 */
function parse(frame) {
    return frame.split(',');
}
`;
    }
    /**
     * 获取下一个数据集索引
     */
    getNextDatasetIndex() {
        if (!this._currentProject) {
            return 1;
        }
        let maxIndex = 0;
        for (const group of this._currentProject.groups) {
            for (const dataset of group.datasets) {
                if (dataset.index > maxIndex) {
                    maxIndex = dataset.index;
                }
            }
        }
        return maxIndex + 1;
    }
    // ================== 资源管理方法 ==================
    /**
     * 清理资源和事件监听器 - 用于扩展停用时清理内存
     */
    dispose() {
        try {
            // 移除所有事件监听器，防止内存泄漏
            this.removeAllListeners();
            console.log('ProjectManager disposed: all event listeners removed');
        }
        catch (error) {
            console.error('Error during ProjectManager disposal:', error);
        }
    }
    /**
     * 获取EventEmitter状态信息 - 用于调试和监控
     */
    getEventEmitterStats() {
        const events = Object.values(ProjectManager.EVENTS);
        const listenerCount = {};
        let totalListeners = 0;
        for (const event of events) {
            const count = this.listenerCount(event);
            listenerCount[event] = count;
            totalListeners += count;
        }
        return {
            listenerCount,
            totalListeners,
            maxListeners: this.getMaxListeners()
        };
    }
    /**
     * 检查是否存在潜在的内存泄漏
     */
    checkForMemoryLeaks() {
        const stats = this.getEventEmitterStats();
        const warnings = [];
        // 检查是否有过多的监听器
        const warningThreshold = Math.floor(this.getMaxListeners() * 0.8); // 80%阈值
        if (stats.totalListeners > warningThreshold) {
            warnings.push(`Total listeners (${stats.totalListeners}) exceeds warning threshold (${warningThreshold})`);
        }
        // 检查单个事件的监听器数量
        for (const [event, count] of Object.entries(stats.listenerCount)) {
            if (count > 10) { // 单个事件超过10个监听器可能有问题
                warnings.push(`Event '${event}' has ${count} listeners (consider cleanup)`);
            }
        }
        return {
            hasWarnings: warnings.length > 0,
            warnings,
            stats
        };
    }
    /**
     * 强制清理特定事件的所有监听器
     */
    clearEventListeners(eventName) {
        if (eventName) {
            this.removeAllListeners(eventName);
            console.log(`Cleared all listeners for event: ${eventName}`);
        }
        else {
            this.removeAllListeners();
            console.log('Cleared all event listeners');
        }
    }
    /**
     * 重置单例实例 - 仅用于测试环境
     * @internal
     */
    static resetInstance() {
        if (ProjectManager._instance) {
            ProjectManager._instance.dispose();
            ProjectManager._instance = undefined;
        }
    }
}
exports.ProjectManager = ProjectManager;
//# sourceMappingURL=ProjectManager.js.map
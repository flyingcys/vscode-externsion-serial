"use strict";
/*
 * Serial Studio VSCode Extension
 * 项目编辑器Webview提供者
 *
 * 对应Serial-Studio的ProjectEditor.qml
 * 提供完整的项目配置编辑界面
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
exports.ProjectEditorProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const ProjectManager_1 = require("../project/ProjectManager");
const ProjectSerializer_1 = require("../project/ProjectSerializer");
const ProjectValidator_1 = require("../project/ProjectValidator");
/**
 * 项目编辑器Webview提供者
 * 对应Serial-Studio的ProjectEditor窗口
 */
class ProjectEditorProvider {
    _extensionUri;
    static viewType = 'serialStudioProjectEditor';
    _view;
    projectManager;
    serializer;
    validator;
    // 导入导出状态管理
    exportProgress = new Map();
    importPreview = null;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.projectManager = ProjectManager_1.ProjectManager.getInstance();
        this.serializer = new ProjectSerializer_1.ProjectSerializer();
        this.validator = new ProjectValidator_1.ProjectValidator();
        // 监听项目管理器事件
        this.setupProjectManagerListeners();
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri,
                vscode.Uri.joinPath(this._extensionUri, 'dist'),
                vscode.Uri.joinPath(this._extensionUri, 'src', 'webview')
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // 处理来自webview的消息
        webviewView.webview.onDidReceiveMessage(message => this.handleWebviewMessage(message), undefined, []);
        // 当webview变为可见时，发送当前项目数据
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.sendProjectData();
            }
        });
        // 初始发送项目数据
        this.sendProjectData();
    }
    /**
     * 设置项目管理器事件监听
     */
    setupProjectManagerListeners() {
        // 项目加载时更新webview
        this.projectManager.on(ProjectManager_1.ProjectManager.EVENTS.PROJECT_LOADED, (project) => {
            this.sendMessage({
                type: 'projectLoaded',
                data: project
            });
        });
        // 项目修改时更新webview
        this.projectManager.on(ProjectManager_1.ProjectManager.EVENTS.PROJECT_MODIFIED, (modified) => {
            this.sendMessage({
                type: 'projectModified',
                data: { modified }
            });
        });
        // 项目标题变更时更新webview
        this.projectManager.on(ProjectManager_1.ProjectManager.EVENTS.TITLE_CHANGED, (title) => {
            this.sendMessage({
                type: 'titleChanged',
                data: { title }
            });
        });
        // 文件路径变更时更新webview
        this.projectManager.on(ProjectManager_1.ProjectManager.EVENTS.JSON_FILE_CHANGED, (filePath) => {
            this.sendMessage({
                type: 'filePathChanged',
                data: { filePath, fileName: this.projectManager.jsonFileName }
            });
        });
    }
    /**
     * 处理来自webview的消息
     */
    async handleWebviewMessage(message) {
        switch (message.type) {
            // 项目文件操作
            case 'newProject':
                await this.projectManager.createNewProject();
                break;
            case 'openProject':
                await this.projectManager.openProjectFile(message.filePath);
                break;
            case 'saveProject':
                await this.projectManager.saveProjectFile(message.askPath || false);
                break;
            // 项目配置修改
            case 'setTitle':
                this.projectManager.setTitle(message.title);
                break;
            case 'setFrameParser':
                if (this.projectManager.currentProject) {
                    this.projectManager.currentProject.frameParser = message.code;
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                }
                break;
            case 'setFrameDetection':
                if (this.projectManager.currentProject) {
                    this.projectManager.currentProject.frameDetection = message.value;
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                }
                break;
            case 'setFrameStart':
                if (this.projectManager.currentProject) {
                    this.projectManager.currentProject.frameStart = message.value;
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                }
                break;
            case 'setFrameEnd':
                if (this.projectManager.currentProject) {
                    this.projectManager.currentProject.frameEnd = message.value;
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                }
                break;
            case 'setDecoder':
                if (this.projectManager.currentProject) {
                    this.projectManager.currentProject.decoder = message.value;
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                }
                break;
            // 组群操作
            case 'addGroup':
                const groupAdded = this.projectManager.addGroup(message.title, message.widget);
                if (groupAdded) {
                    this.sendProjectData();
                }
                break;
            case 'deleteGroup':
                const groupDeleted = this.projectManager.deleteGroup(message.index);
                if (groupDeleted) {
                    this.sendProjectData();
                }
                break;
            case 'updateGroup':
                if (this.projectManager.currentProject &&
                    message.index >= 0 &&
                    message.index < this.projectManager.currentProject.groups.length) {
                    const group = this.projectManager.currentProject.groups[message.index];
                    Object.assign(group, message.data);
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                    this.sendProjectData();
                }
                break;
            // 数据集操作
            case 'addDataset':
                const datasetAdded = this.projectManager.addDataset(message.groupIndex, message.dataset);
                if (datasetAdded) {
                    this.sendProjectData();
                }
                break;
            case 'deleteDataset':
                const datasetDeleted = this.projectManager.deleteDataset(message.groupIndex, message.datasetIndex);
                if (datasetDeleted) {
                    this.sendProjectData();
                }
                break;
            case 'updateDataset':
                if (this.projectManager.currentProject &&
                    message.groupIndex >= 0 &&
                    message.groupIndex < this.projectManager.currentProject.groups.length) {
                    const group = this.projectManager.currentProject.groups[message.groupIndex];
                    if (message.datasetIndex >= 0 && message.datasetIndex < group.datasets.length) {
                        const dataset = group.datasets[message.datasetIndex];
                        Object.assign(dataset, message.data);
                        this.sendMessage({
                            type: 'projectModified',
                            data: { modified: true }
                        });
                        this.sendProjectData();
                    }
                }
                break;
            // 动作操作
            case 'addAction':
                if (this.projectManager.currentProject) {
                    this.projectManager.currentProject.actions.push(message.action);
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                    this.sendProjectData();
                }
                break;
            case 'deleteAction':
                if (this.projectManager.currentProject &&
                    message.index >= 0 &&
                    message.index < this.projectManager.currentProject.actions.length) {
                    this.projectManager.currentProject.actions.splice(message.index, 1);
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                    this.sendProjectData();
                }
                break;
            case 'updateAction':
                if (this.projectManager.currentProject &&
                    message.index >= 0 &&
                    message.index < this.projectManager.currentProject.actions.length) {
                    const action = this.projectManager.currentProject.actions[message.index];
                    Object.assign(action, message.data);
                    this.sendMessage({
                        type: 'projectModified',
                        data: { modified: true }
                    });
                    this.sendProjectData();
                }
                break;
            // 视图切换
            case 'changeView':
                this.sendMessage({
                    type: 'viewChanged',
                    data: { view: message.view, context: message.context }
                });
                break;
            // 获取项目数据
            case 'getProjectData':
                this.sendProjectData();
                break;
            // 验证项目
            case 'validateProject':
                if (this.projectManager.currentProject) {
                    // 这里会在第18周实现完整的验证逻辑
                    this.sendMessage({
                        type: 'validationResult',
                        data: { valid: true, errors: [] }
                    });
                }
                break;
            // ==================== 第19周：高级导入导出功能 ====================
            // 导入Serial-Studio项目
            case 'importSerialStudioProject':
                await this.handleImportSerialStudioProject(message);
                break;
            // 导出为Serial-Studio兼容格式
            case 'exportForSerialStudio':
                await this.handleExportForSerialStudio(message);
                break;
            // 批量导出功能
            case 'batchExport':
                await this.handleBatchExport(message);
                break;
            // 创建项目模板
            case 'createTemplate':
                await this.handleCreateTemplate(message);
                break;
            // 应用项目模板
            case 'applyTemplate':
                await this.handleApplyTemplate(message);
                break;
            // 获取导出进度
            case 'getExportProgress':
                this.handleGetExportProgress(message);
                break;
            // 取消导出操作
            case 'cancelExport':
                this.handleCancelExport(message);
                break;
            // 导入预览
            case 'previewImport':
                await this.handlePreviewImport(message);
                break;
            // 确认导入
            case 'confirmImport':
                await this.handleConfirmImport(message);
                break;
            // 获取支持的导入格式
            case 'getSupportedFormats':
                this.handleGetSupportedFormats();
                break;
            // 验证导入文件
            case 'validateImportFile':
                await this.handleValidateImportFile(message);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }
    /**
     * 向webview发送消息
     */
    sendMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }
    /**
     * 发送当前项目数据到webview
     */
    sendProjectData() {
        this.sendMessage({
            type: 'projectData',
            data: {
                project: this.projectManager.currentProject,
                filePath: this.projectManager.jsonFilePath,
                fileName: this.projectManager.jsonFileName,
                modified: this.projectManager.modified,
                title: this.projectManager.title,
                groupCount: this.projectManager.groupCount,
                datasetCount: this.projectManager.datasetCount
            }
        });
    }
    /**
     * 生成webview的HTML内容
     */
    _getHtmlForWebview(webview) {
        // 获取必要的资源URI
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'projectEditor.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'projectEditor.css'));
        // CSP nonce for security
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
              style-src ${webview.cspSource} 'unsafe-inline'; 
              script-src 'nonce-${nonce}'; 
              font-src ${webview.cspSource};">
        <link href="${styleUri}" rel="stylesheet">
        <title>Serial Studio Project Editor</title>
    </head>
    <body>
        <div id="app">
            <!-- Vue3应用将在这里渲染 -->
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading Project Editor...</p>
            </div>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
    }
    /**
     * 生成安全的nonce值
     */
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    /**
     * 显示项目编辑器
     */
    show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }
    /**
     * 打开项目文件
     */
    async openProject(filePath) {
        await this.projectManager.openProjectFile(filePath);
    }
    /**
     * 创建新项目
     */
    async newProject() {
        await this.projectManager.createNewProject();
    }
    /**
     * 保存项目
     */
    async saveProject(askPath = false) {
        await this.projectManager.saveProjectFile(askPath);
    }
    // ==================== 第19周：高级导入导出功能实现 ====================
    /**
     * 处理Serial-Studio项目导入
     */
    async handleImportSerialStudioProject(message) {
        try {
            let filePath = message.filePath;
            // 如果没有提供路径，显示文件选择对话框
            if (!filePath) {
                const result = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        'Serial Studio Project': ['ssproj'],
                        'JSON Files': ['json'],
                        'All Files': ['*']
                    },
                    title: 'Import Serial Studio Project'
                });
                if (!result || result.length === 0) {
                    return;
                }
                filePath = result[0].fsPath;
            }
            // 开始导入进度报告
            this.sendMessage({
                type: 'importProgress',
                data: {
                    status: 'reading',
                    progress: 10,
                    message: 'Reading project file...'
                }
            });
            // 读取文件
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const fileStats = await fs.stat(filePath);
            this.sendMessage({
                type: 'importProgress',
                data: {
                    status: 'parsing',
                    progress: 30,
                    message: 'Parsing project data...'
                }
            });
            // 解析和验证项目
            const project = this.serializer.importFromSerialStudio(fileContent);
            const validation = this.validator.validateProject(project);
            this.sendMessage({
                type: 'importProgress',
                data: {
                    status: 'validating',
                    progress: 60,
                    message: 'Validating project structure...'
                }
            });
            // 创建导入预览
            this.importPreview = {
                filePath,
                fileName: path.basename(filePath),
                fileSize: fileStats.size,
                project,
                validation: {
                    valid: validation.valid,
                    errors: validation.errors,
                    warnings: validation.warnings || []
                },
                metadata: {
                    importTime: Date.now(),
                    originalFormat: path.extname(filePath),
                    sourceApplication: 'Serial Studio'
                }
            };
            this.sendMessage({
                type: 'importProgress',
                data: {
                    status: 'completed',
                    progress: 100,
                    message: 'Import analysis completed'
                }
            });
            // 发送导入预览
            this.sendMessage({
                type: 'importPreview',
                data: this.importPreview
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.sendMessage({
                type: 'importError',
                data: {
                    error: message,
                    status: 'error'
                }
            });
        }
    }
    /**
     * 处理导入预览
     */
    async handlePreviewImport(message) {
        await this.handleImportSerialStudioProject({ filePath: message.filePath });
    }
    /**
     * 处理确认导入
     */
    async handleConfirmImport(message) {
        if (!this.importPreview) {
            this.sendMessage({
                type: 'importError',
                data: { error: 'No import preview available' }
            });
            return;
        }
        try {
            // 询问是否保存当前项目
            const saved = await this.projectManager.askSave();
            if (!saved) {
                return;
            }
            // 加载导入的项目
            const project = this.importPreview.project;
            // 更新项目管理器
            this.projectManager._currentProject = project;
            this.projectManager._title = project.title;
            this.projectManager._filePath = '';
            this.projectManager._modified = true;
            // 清除导入预览
            this.importPreview = null;
            // 发送成功消息
            this.sendMessage({
                type: 'importCompleted',
                data: {
                    success: true,
                    message: `Successfully imported project: ${project.title}`
                }
            });
            // 更新项目数据
            this.sendProjectData();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.sendMessage({
                type: 'importError',
                data: { error: message }
            });
        }
    }
    /**
     * 处理Serial-Studio兼容格式导出
     */
    async handleExportForSerialStudio(message) {
        if (!this.projectManager.currentProject) {
            this.sendMessage({
                type: 'exportError',
                data: { error: 'No project to export' }
            });
            return;
        }
        try {
            let targetPath = message.filePath;
            // 如果没有提供路径，显示保存对话框
            if (!targetPath) {
                const result = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(`${this.projectManager.title}.ssproj`),
                    filters: {
                        'Serial Studio Project': ['ssproj'],
                        'JSON Files': ['json']
                    },
                    title: 'Export Serial Studio Project'
                });
                if (!result) {
                    return;
                }
                targetPath = result.fsPath;
            }
            // 导出项目
            const exportedContent = this.serializer.exportForSerialStudio(this.projectManager.currentProject);
            await fs.writeFile(targetPath, exportedContent, 'utf-8');
            this.sendMessage({
                type: 'exportCompleted',
                data: {
                    success: true,
                    filePath: targetPath,
                    message: `Project exported to: ${path.basename(targetPath)}`
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.sendMessage({
                type: 'exportError',
                data: { error: message }
            });
        }
    }
    /**
     * 处理批量导出
     */
    async handleBatchExport(message) {
        if (!this.projectManager.currentProject) {
            this.sendMessage({
                type: 'exportError',
                data: { error: 'No project to export' }
            });
            return;
        }
        const config = message.config;
        const exportId = `batch_${Date.now()}`;
        try {
            // 初始化导出进度
            const progress = {
                id: exportId,
                status: 'preparing',
                progress: 0,
                message: 'Preparing batch export...',
                total: config.formats.length,
                current: 0,
                startTime: Date.now()
            };
            this.exportProgress.set(exportId, progress);
            this.sendMessage({
                type: 'exportProgress',
                data: progress
            });
            // 创建输出目录
            await fs.mkdir(config.outputDir, { recursive: true });
            // 逐个导出格式
            for (let i = 0; i < config.formats.length; i++) {
                const format = config.formats[i];
                progress.current = i + 1;
                progress.progress = Math.round((i / config.formats.length) * 100);
                progress.message = `Exporting to ${format.type.toUpperCase()}...`;
                progress.status = 'exporting';
                this.sendMessage({
                    type: 'exportProgress',
                    data: progress
                });
                // 检查是否被取消
                const currentProgress = this.exportProgress.get(exportId);
                if (currentProgress && currentProgress.status === 'cancelled') {
                    break;
                }
                // 执行导出
                await this.performSingleExport(format, config.outputDir);
                // 添加延迟以显示进度
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // 完成导出
            progress.status = 'completed';
            progress.progress = 100;
            progress.message = `Batch export completed (${config.formats.length} formats)`;
            progress.endTime = Date.now();
            this.sendMessage({
                type: 'exportProgress',
                data: progress
            });
            this.sendMessage({
                type: 'batchExportCompleted',
                data: {
                    success: true,
                    outputDir: config.outputDir,
                    formats: config.formats.length,
                    duration: progress.endTime - progress.startTime
                }
            });
        }
        catch (error) {
            const progress = this.exportProgress.get(exportId);
            if (progress) {
                progress.status = 'error';
                progress.error = error instanceof Error ? error.message : 'Unknown error';
                this.sendMessage({
                    type: 'exportProgress',
                    data: progress
                });
            }
            this.sendMessage({
                type: 'exportError',
                data: { error: progress?.error || 'Batch export failed' }
            });
        }
    }
    /**
     * 执行单个格式导出
     */
    async performSingleExport(format, outputDir) {
        if (!this.projectManager.currentProject) {
            return;
        }
        const fileName = `${this.projectManager.title}.${format.type}`;
        const filePath = path.join(outputDir, fileName);
        switch (format.type) {
            case 'ssproj':
            case 'json':
                const jsonContent = this.serializer.exportForSerialStudio(this.projectManager.currentProject);
                await fs.writeFile(filePath, jsonContent, 'utf-8');
                break;
            case 'xml':
                const xmlContent = this.convertProjectToXML(this.projectManager.currentProject);
                await fs.writeFile(filePath, xmlContent, 'utf-8');
                break;
            case 'csv':
                const csvContent = this.convertProjectToCSV(this.projectManager.currentProject);
                await fs.writeFile(filePath, csvContent, 'utf-8');
                break;
            default:
                throw new Error(`Unsupported export format: ${format.type}`);
        }
    }
    /**
     * 转换项目为XML格式
     */
    convertProjectToXML(project) {
        const escapeXml = (text) => text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<SerialStudioProject>\n';
        xml += `  <title>${escapeXml(project.title)}</title>\n`;
        xml += `  <decoder>${project.decoder}</decoder>\n`;
        xml += `  <frameDetection>${project.frameDetection}</frameDetection>\n`;
        xml += `  <frameStart>${escapeXml(project.frameStart)}</frameStart>\n`;
        xml += `  <frameEnd>${escapeXml(project.frameEnd)}</frameEnd>\n`;
        xml += '  <groups>\n';
        project.groups.forEach(group => {
            xml += '    <group>\n';
            xml += `      <title>${escapeXml(group.title)}</title>\n`;
            xml += `      <widget>${escapeXml(group.widget)}</widget>\n`;
            xml += '      <datasets>\n';
            group.datasets.forEach(dataset => {
                xml += '        <dataset>\n';
                xml += `          <title>${escapeXml(dataset.title)}</title>\n`;
                xml += `          <units>${escapeXml(dataset.units)}</units>\n`;
                xml += `          <widget>${escapeXml(dataset.widget)}</widget>\n`;
                xml += `          <index>${dataset.index}</index>\n`;
                xml += `          <graph>${dataset.graph}</graph>\n`;
                xml += `          <fft>${dataset.fft}</fft>\n`;
                xml += `          <led>${dataset.led}</led>\n`;
                xml += `          <log>${dataset.log}</log>\n`;
                xml += `          <min>${dataset.min}</min>\n`;
                xml += `          <max>${dataset.max}</max>\n`;
                xml += `          <alarm>${dataset.alarm}</alarm>\n`;
                xml += '        </dataset>\n';
            });
            xml += '      </datasets>\n';
            xml += '    </group>\n';
        });
        xml += '  </groups>\n';
        xml += '</SerialStudioProject>';
        return xml;
    }
    /**
     * 转换项目为CSV格式
     */
    convertProjectToCSV(project) {
        const lines = [];
        // CSV头部
        lines.push('Type,Group,Title,Units,Widget,Index,Graph,FFT,LED,Log,Min,Max,Alarm');
        // 项目基本信息
        lines.push(`Project,"","${project.title}","","","","","","","","","",""`);
        // 组群和数据集
        project.groups.forEach(group => {
            lines.push(`Group,"${group.title}","","","${group.widget}","","","","","","","",""`);
            group.datasets.forEach(dataset => {
                lines.push(`Dataset,"${group.title}","${dataset.title}","${dataset.units}","${dataset.widget}",${dataset.index},${dataset.graph},${dataset.fft},${dataset.led},${dataset.log},${dataset.min},${dataset.max},${dataset.alarm}`);
            });
        });
        return lines.join('\n');
    }
    /**
     * 处理创建项目模板
     */
    async handleCreateTemplate(message) {
        try {
            const template = this.serializer.createTemplate(message.templateType);
            // 应用模板到当前项目
            this.projectManager._currentProject = template;
            this.projectManager._title = template.title;
            this.projectManager._modified = true;
            this.sendMessage({
                type: 'templateCreated',
                data: {
                    success: true,
                    templateType: message.templateType,
                    project: template
                }
            });
            this.sendProjectData();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.sendMessage({
                type: 'templateError',
                data: { error: errorMessage }
            });
        }
    }
    /**
     * 处理应用项目模板
     */
    async handleApplyTemplate(message) {
        await this.handleCreateTemplate(message);
    }
    /**
     * 获取导出进度
     */
    handleGetExportProgress(message) {
        const progress = this.exportProgress.get(message.exportId);
        this.sendMessage({
            type: 'exportProgress',
            data: progress || {
                id: message.exportId,
                status: 'not_found',
                progress: 0,
                message: 'Export not found'
            }
        });
    }
    /**
     * 取消导出操作
     */
    handleCancelExport(message) {
        const progress = this.exportProgress.get(message.exportId);
        if (progress && progress.status === 'exporting') {
            progress.status = 'cancelled';
            progress.message = 'Export cancelled by user';
            progress.endTime = Date.now();
            this.sendMessage({
                type: 'exportProgress',
                data: progress
            });
            this.sendMessage({
                type: 'exportCancelled',
                data: { exportId: message.exportId }
            });
        }
    }
    /**
     * 获取支持的导入格式
     */
    handleGetSupportedFormats() {
        const formats = [
            {
                name: 'Serial Studio Project',
                extensions: ['ssproj'],
                description: 'Native Serial Studio project format',
                canImport: true,
                canExport: true
            },
            {
                name: 'JSON',
                extensions: ['json'],
                description: 'Standard JSON format',
                canImport: true,
                canExport: true
            },
            {
                name: 'XML',
                extensions: ['xml'],
                description: 'Extensible Markup Language format',
                canImport: false,
                canExport: true
            },
            {
                name: 'CSV',
                extensions: ['csv'],
                description: 'Comma-separated values format',
                canImport: false,
                canExport: true
            }
        ];
        this.sendMessage({
            type: 'supportedFormats',
            data: { formats }
        });
    }
    /**
     * 验证导入文件
     */
    async handleValidateImportFile(message) {
        try {
            const filePath = message.filePath;
            const fileContent = await fs.readFile(filePath, 'utf-8');
            // 尝试解析和验证
            const project = this.serializer.importFromSerialStudio(fileContent);
            const validation = this.validator.validateProject(project);
            this.sendMessage({
                type: 'fileValidation',
                data: {
                    filePath,
                    valid: validation.valid,
                    errors: validation.errors,
                    warnings: validation.warnings || [],
                    project: validation.valid ? project : undefined
                }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.sendMessage({
                type: 'fileValidation',
                data: {
                    filePath: message.filePath,
                    valid: false,
                    errors: [errorMessage],
                    warnings: []
                }
            });
        }
    }
}
exports.ProjectEditorProvider = ProjectEditorProvider;
//# sourceMappingURL=ProjectEditorProvider.js.map
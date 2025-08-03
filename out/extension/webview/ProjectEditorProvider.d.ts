import * as vscode from 'vscode';
/**
 * 项目编辑器Webview提供者
 * 对应Serial-Studio的ProjectEditor窗口
 */
export declare class ProjectEditorProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "serialStudioProjectEditor";
    private _view?;
    private projectManager;
    private serializer;
    private validator;
    private exportProgress;
    private importPreview;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    /**
     * 设置项目管理器事件监听
     */
    private setupProjectManagerListeners;
    /**
     * 处理来自webview的消息
     */
    private handleWebviewMessage;
    /**
     * 向webview发送消息
     */
    private sendMessage;
    /**
     * 发送当前项目数据到webview
     */
    private sendProjectData;
    /**
     * 生成webview的HTML内容
     */
    private _getHtmlForWebview;
    /**
     * 生成安全的nonce值
     */
    private getNonce;
    /**
     * 显示项目编辑器
     */
    show(): void;
    /**
     * 打开项目文件
     */
    openProject(filePath?: string): Promise<void>;
    /**
     * 创建新项目
     */
    newProject(): Promise<void>;
    /**
     * 保存项目
     */
    saveProject(askPath?: boolean): Promise<void>;
    /**
     * 处理Serial-Studio项目导入
     */
    private handleImportSerialStudioProject;
    /**
     * 处理导入预览
     */
    private handlePreviewImport;
    /**
     * 处理确认导入
     */
    private handleConfirmImport;
    /**
     * 处理Serial-Studio兼容格式导出
     */
    private handleExportForSerialStudio;
    /**
     * 处理批量导出
     */
    private handleBatchExport;
    /**
     * 执行单个格式导出
     */
    private performSingleExport;
    /**
     * 转换项目为XML格式
     */
    private convertProjectToXML;
    /**
     * 转换项目为CSV格式
     */
    private convertProjectToCSV;
    /**
     * 处理创建项目模板
     */
    private handleCreateTemplate;
    /**
     * 处理应用项目模板
     */
    private handleApplyTemplate;
    /**
     * 获取导出进度
     */
    private handleGetExportProgress;
    /**
     * 取消导出操作
     */
    private handleCancelExport;
    /**
     * 获取支持的导入格式
     */
    private handleGetSupportedFormats;
    /**
     * 验证导入文件
     */
    private handleValidateImportFile;
}
//# sourceMappingURL=ProjectEditorProvider.d.ts.map
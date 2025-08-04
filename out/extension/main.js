"use strict";
/**
 * Serial Studio VSCode Extension Main Entry Point
 *
 * This is the main entry point for the Serial Studio VSCode extension.
 * It handles extension activation, command registration, and webview management.
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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const Manager_1 = require("./io/Manager");
const types_1 = require("../shared/types");
/**
 * Extension context and state management
 */
class SerialStudioExtension {
    context;
    ioManager;
    outputChannel;
    statusBarItem;
    currentWebviewPanel = null;
    extensionState = {
        connected: false,
        performance: {
            updateFrequency: 20,
            processingLatency: 0,
            memoryUsage: 0,
            droppedFrames: 0
        },
        communication: {
            bytesReceived: 0,
            bytesSent: 0,
            framesReceived: 0,
            framesSent: 0,
            errors: 0,
            reconnections: 0,
            uptime: 0
        }
    };
    constructor(context) {
        this.context = context;
        this.ioManager = new Manager_1.IOManager();
        this.outputChannel = vscode.window.createOutputChannel('Serial Studio');
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'serialStudio.openDashboard';
        this.updateStatusBar('Disconnected');
        this.statusBarItem.show();
        this.setupIOManagerEvents();
        this.registerCommands();
        this.registerViews();
    }
    /**
     * Set up IO Manager event handlers
     */
    setupIOManagerEvents() {
        // Handle connection state changes
        this.ioManager.on('stateChanged', (state) => {
            this.extensionState.connected = state === Manager_1.ConnectionState.Connected;
            this.updateStatusBar(state);
            // Notify webview of state change
            if (this.currentWebviewPanel) {
                this.sendMessageToWebview({
                    type: types_1.MessageType.CONNECTION_STATUS,
                    payload: { state, connected: this.extensionState.connected }
                });
            }
        });
        // Handle frame data
        this.ioManager.on('frameReceived', (frame) => {
            // Forward frame to webview for processing
            if (this.currentWebviewPanel) {
                this.sendMessageToWebview({
                    type: types_1.MessageType.FRAME_DATA,
                    payload: frame
                });
            }
            // Log to output channel in debug mode
            if (this.isDebugMode()) {
                this.outputChannel.appendLine(`Frame received: ${frame.data.length} bytes, seq: ${frame.sequence}`);
            }
        });
        // Handle raw data
        this.ioManager.on('rawDataReceived', (data) => {
            if (this.currentWebviewPanel) {
                this.sendMessageToWebview({
                    type: types_1.MessageType.RAW_DATA,
                    payload: { data: Array.from(data), timestamp: Date.now() }
                });
            }
        });
        // Handle errors
        this.ioManager.on('error', (error) => {
            this.outputChannel.appendLine(`Error: ${error.message}`);
            vscode.window.showErrorMessage(`Serial Studio: ${error.message}`);
            if (this.currentWebviewPanel) {
                this.sendMessageToWebview({
                    type: types_1.MessageType.ERROR,
                    payload: { message: error.message, stack: error.stack }
                });
            }
        });
        // Handle warnings
        this.ioManager.on('warning', (message) => {
            this.outputChannel.appendLine(`Warning: ${message}`);
            if (this.currentWebviewPanel) {
                this.sendMessageToWebview({
                    type: types_1.MessageType.WARNING,
                    payload: { message }
                });
            }
        });
        // Handle statistics updates
        this.ioManager.on('statisticsUpdated', (stats) => {
            this.extensionState.communication = stats;
            // Update performance metrics
            this.updatePerformanceMetrics();
        });
    }
    /**
     * Register extension commands
     */
    registerCommands() {
        // Open dashboard command
        const openDashboard = vscode.commands.registerCommand('serialStudio.openDashboard', () => this.openDashboard());
        // Connect device command
        const connectDevice = vscode.commands.registerCommand('serialStudio.connectDevice', () => this.showConnectionDialog());
        // Disconnect device command
        const disconnectDevice = vscode.commands.registerCommand('serialStudio.disconnectDevice', () => this.disconnectDevice());
        // Open project editor command
        const openProjectEditor = vscode.commands.registerCommand('serialStudio.openProjectEditor', () => this.openProjectEditor());
        // Add commands to context subscriptions
        this.context.subscriptions.push(openDashboard, connectDevice, disconnectDevice, openProjectEditor, this.statusBarItem, this.outputChannel);
    }
    /**
     * Register extension views
     */
    registerViews() {
        // Set context for when extension is enabled
        vscode.commands.executeCommand('setContext', 'serialStudio.enabled', true);
        // TODO: Register tree view provider for device list
    }
    /**
     * Open the main dashboard webview
     */
    async openDashboard() {
        // Check if panel already exists
        if (this.currentWebviewPanel) {
            this.currentWebviewPanel.reveal();
            return;
        }
        // Create new webview panel
        this.currentWebviewPanel = vscode.window.createWebviewPanel('serialStudioDashboard', 'Serial Studio Dashboard', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'assets'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist')
            ]
        });
        // Set webview content
        this.currentWebviewPanel.webview.html = await this.getWebviewContent();
        // Handle webview messages
        this.currentWebviewPanel.webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message), undefined, this.context.subscriptions);
        // Handle panel disposal
        this.currentWebviewPanel.onDidDispose(() => {
            this.currentWebviewPanel = null;
        }, null, this.context.subscriptions);
        // Send initial state to webview
        this.sendMessageToWebview({
            type: types_1.MessageType.CONNECTION_STATUS,
            payload: {
                state: this.ioManager.state,
                connected: this.extensionState.connected,
                statistics: this.extensionState.communication
            }
        });
    }
    /**
     * Show connection configuration dialog
     */
    async showConnectionDialog() {
        // For now, show a simple input dialog
        // TODO: Replace with proper connection configuration UI
        const portName = await vscode.window.showInputBox({
            prompt: 'Enter serial port name (e.g., COM3, /dev/ttyUSB0)',
            placeHolder: '/dev/ttyUSB0'
        });
        if (!portName) {
            return;
        }
        const baudRateStr = await vscode.window.showQuickPick(['9600', '19200', '38400', '57600', '115200', '230400', '460800', '921600'], { placeHolder: 'Select baud rate' });
        if (!baudRateStr) {
            return;
        }
        try {
            const config = {
                type: 'uart',
                port: portName,
                baudRate: parseInt(baudRateStr),
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none',
                autoReconnect: true
            };
            await this.ioManager.connect(config);
            this.extensionState.device = config;
            vscode.window.showInformationMessage(`Connected to ${portName}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to connect: ${error}`);
        }
    }
    /**
     * Disconnect from current device
     */
    async disconnectDevice() {
        try {
            await this.ioManager.disconnect();
            this.extensionState.device = undefined;
            vscode.window.showInformationMessage('Disconnected from device');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to disconnect: ${error}`);
        }
    }
    /**
     * Open project editor (placeholder)
     */
    async openProjectEditor() {
        vscode.window.showInformationMessage('Project editor not yet implemented');
        // TODO: Implement project editor webview
    }
    /**
     * Handle messages from webview
     */
    async handleWebviewMessage(message) {
        switch (message.type) {
            case types_1.MessageType.CONNECT_DEVICE:
                if (message.payload) {
                    try {
                        await this.ioManager.connect(message.payload);
                        this.extensionState.device = message.payload;
                    }
                    catch (error) {
                        this.sendMessageToWebview({
                            type: types_1.MessageType.ERROR,
                            payload: { message: error.message }
                        });
                    }
                }
                break;
            case types_1.MessageType.DISCONNECT_DEVICE:
                try {
                    await this.ioManager.disconnect();
                    this.extensionState.device = undefined;
                }
                catch (error) {
                    this.sendMessageToWebview({
                        type: types_1.MessageType.ERROR,
                        payload: { message: error.message }
                    });
                }
                break;
            case types_1.MessageType.GET_CONFIG:
                this.sendMessageToWebview({
                    type: types_1.MessageType.UPDATE_CONFIG,
                    payload: this.extensionState
                });
                break;
            case types_1.MessageType.EXPORT_DATA:
                // TODO: Implement data export
                this.sendMessageToWebview({
                    type: types_1.MessageType.INFO,
                    payload: { message: 'Data export not yet implemented' }
                });
                break;
            default:
                this.outputChannel.appendLine(`Unknown message type: ${message.type}`);
        }
    }
    /**
     * Send message to webview
     */
    sendMessageToWebview(message) {
        if (this.currentWebviewPanel) {
            message.timestamp = Date.now();
            this.currentWebviewPanel.webview.postMessage(message);
        }
    }
    /**
     * Get webview HTML content
     */
    async getWebviewContent() {
        // For now, return a simple HTML placeholder
        // TODO: Replace with actual Vue.js application
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serial Studio Dashboard</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .status-bar {
            background-color: var(--vscode-statusBar-background);
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .placeholder {
            text-align: center;
            padding: 50px;
            color: var(--vscode-descriptionForeground);
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin: 4px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-bar">
            <strong>Serial Studio Dashboard</strong>
            <div id="status">Status: Initializing...</div>
        </div>
        
        <div class="placeholder">
            <h2>🚀 Serial Studio Dashboard</h2>
            <p>Vue.js dashboard will be implemented here</p>
            <p>Current status: <span id="connection-status">Disconnected</span></p>
            
            <div>
                <button onclick="requestConnection()">Connect Device</button>
                <button onclick="requestDisconnection()">Disconnect</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'connection_status':
                    updateConnectionStatus(message.payload);
                    break;
                case 'frame_data':
                    console.log('Frame received:', message.payload);
                    break;
                case 'error':
                    console.error('Error:', message.payload.message);
                    break;
            }
        });
        
        function updateConnectionStatus(payload) {
            const statusElement = document.getElementById('connection-status');
            statusElement.textContent = payload.connected ? 'Connected' : 'Disconnected';
            statusElement.style.color = payload.connected ? 'green' : 'red';
        }
        
        function requestConnection() {
            vscode.postMessage({
                type: 'get_config'
            });
        }
        
        function requestDisconnection() {
            vscode.postMessage({
                type: 'disconnect_device'
            });
        }
        
        // Request initial state
        vscode.postMessage({
            type: 'get_config'
        });
    </script>
</body>
</html>`;
    }
    /**
     * Update status bar display
     */
    updateStatusBar(state) {
        let text;
        let color;
        switch (state) {
            case Manager_1.ConnectionState.Connected:
                text = '$(plug) Serial Studio: Connected';
                color = undefined; // Default color
                break;
            case Manager_1.ConnectionState.Connecting:
                text = '$(sync~spin) Serial Studio: Connecting...';
                color = 'yellow';
                break;
            case Manager_1.ConnectionState.Reconnecting:
                text = '$(sync~spin) Serial Studio: Reconnecting...';
                color = 'yellow';
                break;
            case Manager_1.ConnectionState.Error:
                text = '$(error) Serial Studio: Error';
                color = 'red';
                break;
            default:
                text = '$(circle-slash) Serial Studio: Disconnected';
                color = undefined;
        }
        this.statusBarItem.text = text;
        this.statusBarItem.color = color;
    }
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Calculate memory usage (simplified)
        const memUsage = process.memoryUsage();
        this.extensionState.performance.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB
        // Calculate processing latency (placeholder)
        this.extensionState.performance.processingLatency = 10; // ms
    }
    /**
     * Check if debug mode is enabled
     */
    isDebugMode() {
        return vscode.workspace.getConfiguration('serialStudio').get('debug', false);
    }
    /**
     * Clean up extension resources
     */
    async dispose() {
        await this.ioManager.destroy();
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        if (this.currentWebviewPanel) {
            this.currentWebviewPanel.dispose();
        }
    }
}
let extension;
/**
 * Extension activation function
 */
function activate(context) {
    console.log('Serial Studio extension is now active');
    try {
        extension = new SerialStudioExtension(context);
        // Set up extension deactivation
        context.subscriptions.push({
            dispose: () => extension?.dispose()
        });
    }
    catch (error) {
        console.error('Failed to activate Serial Studio extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Serial Studio: ${error}`);
    }
}
exports.activate = activate;
/**
 * Extension deactivation function
 */
function deactivate() {
    console.log('Serial Studio extension is being deactivated');
    if (extension) {
        extension.dispose();
        extension = undefined;
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map
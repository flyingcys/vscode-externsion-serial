/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(__webpack_require__(1));
const Manager_1 = __webpack_require__(2);
const types_1 = __webpack_require__(8);
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


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * IO Manager - Central manager for I/O operations across multiple protocols
 * Based on Serial Studio's IO::Manager implementation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IOManager = exports.ConnectionState = void 0;
const events_1 = __webpack_require__(3);
const DriverFactory_1 = __webpack_require__(4);
const WorkerManager_1 = __webpack_require__(13);
const ObjectPoolManager_1 = __webpack_require__(17);
const types_1 = __webpack_require__(8);
/**
 * Connection state enumeration
 */
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Disconnected"] = "disconnected";
    ConnectionState["Connecting"] = "connecting";
    ConnectionState["Connected"] = "connected";
    ConnectionState["Reconnecting"] = "reconnecting";
    ConnectionState["Error"] = "error";
})(ConnectionState = exports.ConnectionState || (exports.ConnectionState = {}));
/**
 * Central manager for I/O operations across multiple protocols.
 *
 * Handles communication with devices over Serial, Network, and Bluetooth LE,
 * managing configuration, connection, and data transfer.
 *
 * Integrates with frame reading for parsing data streams and ensures
 * thread-safe operation.
 */
class IOManager extends events_1.EventEmitter {
    currentDriver = null;
    currentState = ConnectionState.Disconnected;
    frameConfig;
    paused = false;
    statistics;
    statisticsTimer = null;
    driverFactory;
    // 多线程数据处理 - 对应Serial-Studio的线程化帧提取
    workerManager;
    threadedFrameExtraction = true; // 对应Serial-Studio的m_threadedFrameExtraction
    // Frame processing (legacy - 用于非多线程模式)
    frameBuffer = Buffer.alloc(0);
    frameSequence = 0;
    constructor() {
        super();
        // Initialize object pool manager
        ObjectPoolManager_1.objectPoolManager.initialize();
        // Initialize driver factory
        this.driverFactory = DriverFactory_1.DriverFactory.getInstance();
        // Initialize WorkerManager for multi-threaded processing
        // 对应Serial-Studio的QThread管理
        this.workerManager = new WorkerManager_1.WorkerManager({
            maxWorkers: Math.max(2, Math.min(4, (__webpack_require__(16).cpus)().length - 1)),
            threadedFrameExtraction: this.threadedFrameExtraction
        });
        // Setup WorkerManager event handlers
        this.setupWorkerEvents();
        // Initialize default frame configuration
        this.frameConfig = {
            startSequence: new Uint8Array(),
            finishSequence: new Uint8Array([0x0A]),
            checksumAlgorithm: 'none',
            frameDetection: types_1.FrameDetection.EndDelimiterOnly,
            decoderMethod: types_1.DecoderMethod.PlainText
        };
        // Initialize statistics using object pool
        this.statistics = ObjectPoolManager_1.objectPoolManager.acquireCommunicationStats();
        this.startStatisticsTimer();
    }
    /**
     * 设置WorkerManager事件监听
     * 对应Serial-Studio的线程间通信
     */
    setupWorkerEvents() {
        // 处理Worker处理完成的帧数据
        this.workerManager.on('framesProcessed', (frames) => {
            frames.forEach(frame => {
                this.statistics.framesReceived++;
                // 从对象池获取RawFrame对象
                const convertedFrame = ObjectPoolManager_1.objectPoolManager.acquireRawFrame();
                convertedFrame.data = frame.data;
                convertedFrame.timestamp = frame.timestamp;
                convertedFrame.sequence = frame.sequence;
                convertedFrame.checksumValid = frame.checksumValid;
                this.emit('frameReceived', convertedFrame);
            });
        });
        // 处理Worker错误
        this.workerManager.on('workerError', ({ workerId, error }) => {
            this.statistics.errors++;
            this.emit('warning', `Worker ${workerId} error: ${error.message}`);
        });
        // 处理Worker池初始化完成
        this.workerManager.on('poolInitialized', ({ workerCount, threadedExtraction }) => {
            this.emit('warning', `Initialized ${workerCount} workers, threaded extraction: ${threadedExtraction}`);
        });
        // 处理处理错误
        this.workerManager.on('processingError', ({ error, workerId }) => {
            this.statistics.errors++;
            this.emit('error', error);
        });
    }
    /**
     * Get current connection state
     */
    get state() {
        return this.currentState;
    }
    /**
     * Check if currently connected
     */
    get isConnected() {
        return this.currentState === ConnectionState.Connected;
    }
    /**
     * Check if connection is read-only
     */
    get isReadOnly() {
        return this.currentDriver ?
            this.currentDriver.isReadable() && !this.currentDriver.isWritable() :
            false;
    }
    /**
     * Check if connection supports read/write
     */
    get isReadWrite() {
        return this.currentDriver ?
            this.currentDriver.isReadable() && this.currentDriver.isWritable() :
            false;
    }
    /**
     * Get current driver instance
     */
    get driver() {
        return this.currentDriver;
    }
    /**
     * Get current frame configuration
     */
    get frameConfiguration() {
        return { ...this.frameConfig };
    }
    /**
     * Get communication statistics
     */
    get communicationStats() {
        return { ...this.statistics };
    }
    /**
     * Check if data processing is paused
     */
    get isPaused() {
        return this.paused;
    }
    /**
     * Set pause state for data processing
     */
    setPaused(paused) {
        if (this.paused !== paused) {
            this.paused = paused;
            if (paused) {
                this.emit('warning', 'Data processing paused');
            }
            else {
                this.emit('warning', 'Data processing resumed');
            }
        }
    }
    /**
     * Connect to a device using the specified configuration
     */
    async connect(config) {
        // Disconnect any existing connection
        if (this.currentDriver) {
            await this.disconnect();
        }
        this.setState(ConnectionState.Connecting);
        try {
            // Create appropriate driver based on bus type
            this.currentDriver = this.createDriver(config);
            // Set up driver event handlers
            this.setupDriverEvents();
            // Attempt connection
            await this.currentDriver.open();
            this.setState(ConnectionState.Connected);
            this.statistics.uptime = Date.now();
        }
        catch (error) {
            this.setState(ConnectionState.Error);
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Disconnect from the current device
     */
    async disconnect() {
        if (!this.currentDriver) {
            return;
        }
        try {
            this.setState(ConnectionState.Disconnected);
            // Clean up driver
            await this.currentDriver.close();
            this.currentDriver.destroy();
            this.currentDriver = null;
            // Reset frame processing state
            this.frameBuffer = Buffer.alloc(0);
            this.frameSequence = 0;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Write data to the connected device
     */
    async writeData(data) {
        if (!this.currentDriver || !this.isConnected) {
            throw new Error('No device connected');
        }
        if (!this.currentDriver.isWritable()) {
            throw new Error('Device is not writable');
        }
        try {
            const bytesWritten = await this.currentDriver.write(data);
            this.statistics.bytesSent += bytesWritten;
            this.statistics.framesSent++;
            return bytesWritten;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Update frame configuration
     */
    async updateFrameConfig(config) {
        this.frameConfig = { ...this.frameConfig, ...config };
        // 配置Workers使用新的帧配置
        if (this.threadedFrameExtraction && this.workerManager) {
            try {
                await this.workerManager.configureWorkers({
                    operationMode: this.convertToWorkerOperationMode(),
                    frameDetectionMode: this.convertToWorkerFrameDetection(),
                    startSequence: this.frameConfig.startSequence,
                    finishSequence: this.frameConfig.finishSequence,
                    checksumAlgorithm: this.frameConfig.checksumAlgorithm
                });
            }
            catch (error) {
                // 忽略 WorkerManager 销毁时的错误
                if (error.name !== 'WorkerManagerDestroyedError') {
                    console.error('Failed to configure workers:', error);
                }
            }
        }
        // Reset frame buffer when configuration changes
        this.frameBuffer = Buffer.alloc(0);
    }
    /**
     * 转换操作模式到Worker格式
     */
    convertToWorkerOperationMode() {
        // 这里应该基于当前连接状态和配置来确定操作模式
        // 暂时返回默认值，后续可以根据具体需求调整
        return 2; // QuickPlot模式
    }
    /**
     * 转换帧检测模式到Worker格式
     */
    convertToWorkerFrameDetection() {
        switch (this.frameConfig.frameDetection) {
            case types_1.FrameDetection.EndDelimiterOnly:
                return 0;
            case types_1.FrameDetection.StartAndEndDelimiter:
                return 1;
            case types_1.FrameDetection.NoDelimiters:
                return 2;
            case types_1.FrameDetection.StartDelimiterOnly:
                return 3;
            default:
                return 0;
        }
    }
    /**
     * Get list of available devices for a specific bus type
     */
    async getAvailableDevices(busType) {
        return await this.driverFactory.discoverDevices(busType);
    }
    /**
     * Get all available driver capabilities
     */
    getAvailableDrivers() {
        return this.driverFactory.getAvailableDrivers();
    }
    /**
     * Get supported bus types
     */
    getSupportedBusTypes() {
        return this.driverFactory.getSupportedBusTypes();
    }
    /**
     * Get default configuration for a bus type
     */
    getDefaultConfig(busType) {
        return this.driverFactory.getDefaultConfig(busType);
    }
    /**
     * Validate configuration for a specific bus type
     */
    validateConfig(config) {
        return this.driverFactory.validateConfig(config);
    }
    /**
     * Check if a bus type is supported
     */
    isBusTypeSupported(busType) {
        return this.driverFactory.isSupported(busType);
    }
    /**
     * Create appropriate driver instance based on configuration
     */
    createDriver(config) {
        return this.driverFactory.createDriver(config);
    }
    /**
     * Set up event handlers for the current driver
     */
    setupDriverEvents() {
        if (!this.currentDriver) {
            return;
        }
        // Handle incoming data
        this.currentDriver.on('dataReceived', (data) => {
            if (!this.paused) {
                this.processIncomingData(data);
            }
        });
        // Handle driver errors
        this.currentDriver.on('error', (error) => {
            this.handleError(error);
        });
        // Handle connection events
        this.currentDriver.on('connected', () => {
            this.setState(ConnectionState.Connected);
        });
        this.currentDriver.on('disconnected', () => {
            this.setState(ConnectionState.Disconnected);
        });
    }
    /**
     * 处理传入数据并提取帧 - 多线程版本
     * 对应Serial-Studio的热路径数据处理
     */
    processIncomingData(data) {
        // 更新统计信息
        this.statistics.bytesReceived += data.length;
        // 发送原始数据事件
        this.emit('rawDataReceived', data);
        if (this.threadedFrameExtraction && this.workerManager) {
            // 多线程处理 - 对应Serial-Studio的线程化帧提取
            this.processDataMultiThreaded(data);
        }
        else {
            // 回退到单线程处理（用于调试或兼容性）
            this.processDataSingleThreaded(data);
        }
    }
    /**
     * 多线程数据处理
     * 对应Serial-Studio的moveToThread和线程化处理
     */
    async processDataMultiThreaded(data) {
        try {
            // 转换Buffer为ArrayBuffer以便传输给Worker
            const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
            // 异步处理数据，不阻塞主线程
            this.workerManager.processData(arrayBuffer).catch(error => {
                // 如果Worker处理失败，回退到单线程处理
                console.warn('Multi-threaded processing failed, falling back to single-threaded:', error);
                this.processDataSingleThreaded(data);
            });
        }
        catch (error) {
            // 处理错误，回退到单线程处理
            console.error('Error in multi-threaded processing:', error);
            this.processDataSingleThreaded(data);
        }
    }
    /**
     * 单线程数据处理（回退模式）
     * 保持与原版Serial-Studio的兼容性
     */
    processDataSingleThreaded(data) {
        // 追加到帧缓冲区
        this.frameBuffer = Buffer.concat([this.frameBuffer, data]);
        // 基于检测方法提取帧
        this.extractFrames();
    }
    /**
     * Extract frames from the current buffer
     */
    extractFrames() {
        switch (this.frameConfig.frameDetection) {
            case types_1.FrameDetection.EndDelimiterOnly:
                this.extractEndDelimitedFrames();
                break;
            case types_1.FrameDetection.StartAndEndDelimiter:
                this.extractStartEndDelimitedFrames();
                break;
            case types_1.FrameDetection.StartDelimiterOnly:
                this.extractStartDelimitedFrames();
                break;
            case types_1.FrameDetection.NoDelimiters:
                this.extractNoDelimiterFrames();
                break;
        }
    }
    /**
     * Extract frames using end delimiter only
     */
    extractEndDelimitedFrames() {
        const delimiter = Buffer.from(this.frameConfig.finishSequence);
        let startIndex = 0;
        let delimiterIndex;
        while ((delimiterIndex = this.frameBuffer.indexOf(delimiter, startIndex)) !== -1) {
            // Extract frame data (excluding delimiter)
            const frameData = this.frameBuffer.subarray(startIndex, delimiterIndex);
            if (frameData.length > 0) {
                this.emitFrame(frameData);
            }
            startIndex = delimiterIndex + delimiter.length;
        }
        // Keep remaining data in buffer
        if (startIndex > 0) {
            this.frameBuffer = this.frameBuffer.subarray(startIndex);
        }
    }
    /**
     * Extract frames using start and end delimiters
     */
    extractStartEndDelimitedFrames() {
        const startDelimiter = Buffer.from(this.frameConfig.startSequence);
        const endDelimiter = Buffer.from(this.frameConfig.finishSequence);
        let searchIndex = 0;
        while (searchIndex < this.frameBuffer.length) {
            // Find start delimiter
            const startIndex = this.frameBuffer.indexOf(startDelimiter, searchIndex);
            if (startIndex === -1) {
                break;
            }
            // Find end delimiter after start
            const endIndex = this.frameBuffer.indexOf(endDelimiter, startIndex + startDelimiter.length);
            if (endIndex === -1) {
                break;
            }
            // Extract frame data (including delimiters)
            const frameStart = startIndex + startDelimiter.length;
            const frameData = this.frameBuffer.subarray(frameStart, endIndex);
            if (frameData.length > 0) {
                this.emitFrame(frameData);
            }
            searchIndex = endIndex + endDelimiter.length;
        }
        // Remove processed data from buffer
        if (searchIndex > 0) {
            this.frameBuffer = this.frameBuffer.subarray(searchIndex);
        }
    }
    /**
     * Extract frames using start delimiter only
     */
    extractStartDelimitedFrames() {
        const delimiter = Buffer.from(this.frameConfig.startSequence);
        let lastDelimiterIndex = -1;
        let searchIndex = 0;
        while (true) {
            const delimiterIndex = this.frameBuffer.indexOf(delimiter, searchIndex);
            if (delimiterIndex === -1) {
                // No more delimiters found
                if (lastDelimiterIndex !== -1) {
                    // Emit frame from last delimiter to end of buffer
                    const frameData = this.frameBuffer.subarray(lastDelimiterIndex + delimiter.length);
                    if (frameData.length > 0) {
                        this.emitFrame(frameData);
                    }
                }
                break;
            }
            if (lastDelimiterIndex !== -1) {
                // Emit frame between delimiters
                const frameData = this.frameBuffer.subarray(lastDelimiterIndex + delimiter.length, delimiterIndex);
                if (frameData.length > 0) {
                    this.emitFrame(frameData);
                }
            }
            lastDelimiterIndex = delimiterIndex;
            searchIndex = delimiterIndex + delimiter.length;
        }
        // Keep data from last delimiter onwards
        if (lastDelimiterIndex !== -1) {
            this.frameBuffer = this.frameBuffer.subarray(lastDelimiterIndex);
        }
    }
    /**
     * Process data without frame delimiters
     */
    extractNoDelimiterFrames() {
        if (this.frameBuffer.length > 0) {
            this.emitFrame(this.frameBuffer);
            this.frameBuffer = Buffer.alloc(0);
        }
    }
    /**
     * Emit a processed frame
     */
    emitFrame(data) {
        const frame = ObjectPoolManager_1.objectPoolManager.acquireRawFrame();
        frame.data = new Uint8Array(data);
        frame.timestamp = Date.now();
        frame.sequence = ++this.frameSequence;
        frame.checksumValid = true; // TODO: Implement checksum validation
        this.statistics.framesReceived++;
        this.emit('frameReceived', frame);
    }
    /**
     * Set connection state and emit event
     */
    setState(state) {
        if (this.currentState !== state) {
            const previousState = this.currentState;
            this.currentState = state;
            // Track reconnections
            if (state === ConnectionState.Connected && previousState === ConnectionState.Reconnecting) {
                this.statistics.reconnections++;
            }
            this.emit('stateChanged', state);
        }
    }
    /**
     * Handle errors
     */
    handleError(error) {
        this.statistics.errors++;
        this.emit('error', error);
    }
    /**
     * Start statistics update timer
     */
    startStatisticsTimer() {
        this.statisticsTimer = setInterval(() => {
            if (this.isConnected) {
                this.statistics.uptime = Date.now() - (this.statistics.uptime || Date.now());
            }
            this.emit('statisticsUpdated', this.statistics);
        }, 1000); // Update every second
    }
    /**
     * Stop statistics timer
     */
    stopStatisticsTimer() {
        if (this.statisticsTimer) {
            clearInterval(this.statisticsTimer);
            this.statisticsTimer = null;
        }
    }
    /**
     * 启用或禁用线程化帧提取
     * 对应Serial-Studio的m_threadedFrameExtraction设置
     */
    setThreadedFrameExtraction(enabled) {
        this.threadedFrameExtraction = enabled;
        if (this.workerManager) {
            this.workerManager.setThreadedFrameExtraction(enabled);
        }
        this.emit('warning', `Threaded frame extraction ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * 获取线程化帧提取状态
     */
    get isThreadedFrameExtractionEnabled() {
        return this.threadedFrameExtraction;
    }
    /**
     * 获取Worker统计信息
     * 对应Serial-Studio的线程性能监控
     */
    getWorkerStats() {
        if (this.workerManager) {
            return {
                ...this.workerManager.getStats(),
                threadedExtraction: this.threadedFrameExtraction
            };
        }
        return null;
    }
    /**
     * 重置Worker状态
     * 对应Serial-Studio的帧读取器重置
     */
    async resetWorkers() {
        if (this.workerManager) {
            try {
                await this.workerManager.resetWorkers();
                this.emit('warning', 'Workers reset successfully');
            }
            catch (error) {
                // 忽略 WorkerManager 销毁时的错误
                if (error.name !== 'WorkerManagerDestroyedError') {
                    this.emit('error', error);
                }
            }
        }
    }
    /**
     * 获取扩展的通信统计信息，包括Worker统计
     */
    get extendedCommunicationStats() {
        const baseStats = this.communicationStats;
        const workerStats = this.getWorkerStats();
        return {
            ...baseStats,
            workers: workerStats || {
                workerCount: 0,
                threadedExtraction: this.threadedFrameExtraction
            }
        };
    }
    /**
     * Clean up resources
     */
    async destroy() {
        this.stopStatisticsTimer();
        // 销毁WorkerManager
        if (this.workerManager) {
            try {
                await this.workerManager.destroy();
            }
            catch (error) {
                console.error('Error destroying WorkerManager:', error);
            }
        }
        if (this.currentDriver) {
            await this.disconnect();
        }
        // 释放统计对象回对象池
        ObjectPoolManager_1.objectPoolManager.releaseCommunicationStats(this.statistics);
        // 重新初始化统计对象，防止访问已释放的对象
        this.statistics = ObjectPoolManager_1.objectPoolManager.acquireCommunicationStats();
        this.removeAllListeners();
    }
}
exports.IOManager = IOManager;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("events");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Driver Factory - Centralized driver creation and management
 * Based on Serial Studio's modular driver architecture
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DriverFactory = void 0;
const UARTDriver_1 = __webpack_require__(5);
const NetworkDriver_1 = __webpack_require__(9);
const BluetoothLEDriver_1 = __webpack_require__(12);
const types_1 = __webpack_require__(8);
/**
 * Driver Factory Class
 *
 * Provides centralized driver creation, validation, and management.
 * Maintains a registry of available drivers and their capabilities.
 *
 * Features:
 * - Driver registration and discovery
 * - Configuration validation
 * - Platform capability detection
 * - Default configuration management
 * - Driver lifecycle management
 */
class DriverFactory {
    static instance;
    drivers = new Map();
    constructor() {
        this.initializeDriverRegistry();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!DriverFactory.instance) {
            DriverFactory.instance = new DriverFactory();
        }
        return DriverFactory.instance;
    }
    /**
     * Initialize driver registry with all available drivers
     */
    initializeDriverRegistry() {
        // Register UART Driver
        this.drivers.set(types_1.BusType.UART, {
            busType: types_1.BusType.UART,
            name: 'Serial Port (UART)',
            description: 'RS-232/RS-485 serial communication',
            factory: (config) => new UARTDriver_1.UARTDriver(config),
            configValidator: this.validateUARTConfig.bind(this),
            isSupported: () => true,
            getDefaultConfig: () => ({
                type: types_1.BusType.UART,
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none',
                autoReconnect: true,
                timeout: 5000
            })
        });
        // Register Network Driver
        this.drivers.set(types_1.BusType.Network, {
            busType: types_1.BusType.Network,
            name: 'Network (TCP/UDP)',
            description: 'TCP/UDP network communication',
            factory: (config) => new NetworkDriver_1.NetworkDriver(config),
            configValidator: this.validateNetworkConfig.bind(this),
            isSupported: () => true,
            getDefaultConfig: () => ({
                type: types_1.BusType.Network,
                host: '127.0.0.1',
                protocol: 'tcp',
                tcpPort: 23,
                udpPort: 53,
                socketType: NetworkDriver_1.NetworkSocketType.TCP_CLIENT,
                autoReconnect: true,
                connectTimeout: 5000,
                reconnectInterval: 3000,
                keepAlive: true,
                noDelay: true
            })
        });
        // Register Bluetooth LE Driver
        this.drivers.set(types_1.BusType.BluetoothLE, {
            busType: types_1.BusType.BluetoothLE,
            name: 'Bluetooth Low Energy',
            description: 'Bluetooth Low Energy (BLE) communication',
            factory: (config) => new BluetoothLEDriver_1.BluetoothLEDriver(config),
            configValidator: this.validateBluetoothLEConfig.bind(this),
            isSupported: () => BluetoothLEDriver_1.BluetoothLEDriver.isOperatingSystemSupported(),
            getDefaultConfig: () => ({
                type: types_1.BusType.BluetoothLE,
                autoReconnect: true,
                scanTimeout: 10000,
                connectionTimeout: 15000,
                reconnectInterval: 5000,
                autoDiscoverServices: true,
                enableNotifications: true,
                powerMode: 'balanced'
            })
        });
    }
    /**
     * Create a driver instance based on configuration
     */
    createDriver(config) {
        const driverEntry = this.drivers.get(config.type);
        if (!driverEntry) {
            throw new Error(`Unsupported bus type: ${config.type}`);
        }
        if (!driverEntry.isSupported()) {
            throw new Error(`Driver ${driverEntry.name} is not supported on this platform`);
        }
        // Validate configuration
        const errors = driverEntry.configValidator(config);
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
        }
        // Create driver instance
        return driverEntry.factory(config);
    }
    /**
     * Get all available driver capabilities
     */
    getAvailableDrivers() {
        return Array.from(this.drivers.values()).map(entry => ({
            busType: entry.busType,
            name: entry.name,
            description: entry.description,
            supported: entry.isSupported(),
            features: this.getDriverFeatures(entry.busType),
            defaultConfig: entry.getDefaultConfig()
        }));
    }
    /**
     * Get supported bus types
     */
    getSupportedBusTypes() {
        return Array.from(this.drivers.values())
            .filter(entry => entry.isSupported())
            .map(entry => entry.busType);
    }
    /**
     * Get default configuration for a bus type
     */
    getDefaultConfig(busType) {
        const driverEntry = this.drivers.get(busType);
        if (!driverEntry) {
            throw new Error(`Unsupported bus type: ${busType}`);
        }
        return driverEntry.getDefaultConfig();
    }
    /**
     * Validate configuration for a specific bus type
     */
    validateConfig(config) {
        const driverEntry = this.drivers.get(config.type);
        if (!driverEntry) {
            return [`Unsupported bus type: ${config.type}`];
        }
        return driverEntry.configValidator(config);
    }
    /**
     * Check if a bus type is supported
     */
    isSupported(busType) {
        const driverEntry = this.drivers.get(busType);
        return driverEntry ? driverEntry.isSupported() : false;
    }
    /**
     * Get driver features for a bus type
     */
    getDriverFeatures(busType) {
        switch (busType) {
            case types_1.BusType.UART:
                return {
                    bidirectional: true,
                    streaming: true,
                    discovery: true,
                    reconnection: true,
                    multipleConnections: false
                };
            case types_1.BusType.Network:
                return {
                    bidirectional: true,
                    streaming: true,
                    discovery: false,
                    reconnection: true,
                    multipleConnections: true
                };
            case types_1.BusType.BluetoothLE:
                return {
                    bidirectional: true,
                    streaming: true,
                    discovery: true,
                    reconnection: true,
                    multipleConnections: false
                };
            default:
                return {
                    bidirectional: false,
                    streaming: false,
                    discovery: false,
                    reconnection: false,
                    multipleConnections: false
                };
        }
    }
    /**
     * Validate UART configuration
     */
    validateUARTConfig(config) {
        const errors = [];
        if (!config.port || config.port.trim() === '') {
            errors.push('Port is required for UART connection');
        }
        if (config.baudRate && config.baudRate <= 0) {
            errors.push('Baud rate must be a positive number');
        }
        if (config.dataBits && ![5, 6, 7, 8].includes(config.dataBits)) {
            errors.push('Data bits must be 5, 6, 7, or 8');
        }
        if (config.stopBits && ![1, 1.5, 2].includes(config.stopBits)) {
            errors.push('Stop bits must be 1, 1.5, or 2');
        }
        if (config.parity && !['none', 'odd', 'even', 'mark', 'space'].includes(config.parity)) {
            errors.push('Parity must be none, odd, even, mark, or space');
        }
        return errors;
    }
    /**
     * Validate Network configuration
     */
    validateNetworkConfig(config) {
        const networkConfig = config;
        const errors = [];
        if (!networkConfig.host || networkConfig.host.trim() === '') {
            errors.push('Host address is required');
        }
        if (!networkConfig.protocol) {
            errors.push('Protocol (tcp/udp) is required');
        }
        else if (!['tcp', 'udp'].includes(networkConfig.protocol)) {
            errors.push('Protocol must be either tcp or udp');
        }
        // Validate ports
        if (networkConfig.protocol === 'tcp') {
            if (!networkConfig.tcpPort || networkConfig.tcpPort < 1 || networkConfig.tcpPort > 65535) {
                errors.push('Valid TCP port (1-65535) is required');
            }
        }
        else if (networkConfig.protocol === 'udp') {
            if (!networkConfig.udpPort || networkConfig.udpPort < 1 || networkConfig.udpPort > 65535) {
                errors.push('Valid UDP port (1-65535) is required');
            }
        }
        // Validate multicast configuration
        if (networkConfig.socketType === NetworkDriver_1.NetworkSocketType.UDP_MULTICAST) {
            if (!networkConfig.multicastAddress) {
                errors.push('Multicast address is required for multicast mode');
            }
            else {
                // Basic multicast address validation
                const parts = networkConfig.multicastAddress.split('.');
                if (parts.length !== 4 || parseInt(parts[0]) < 224 || parseInt(parts[0]) > 239) {
                    errors.push('Invalid multicast address format');
                }
            }
        }
        // Validate timeouts
        if (networkConfig.connectTimeout && networkConfig.connectTimeout < 1000) {
            errors.push('Connection timeout must be at least 1000ms');
        }
        return errors;
    }
    /**
     * Validate Bluetooth LE configuration
     */
    validateBluetoothLEConfig(config) {
        const bleConfig = config;
        const errors = [];
        // Check OS support
        if (!BluetoothLEDriver_1.BluetoothLEDriver.isOperatingSystemSupported()) {
            errors.push('Bluetooth LE is not supported on this operating system');
        }
        // Validate required fields
        if (!bleConfig.deviceId || bleConfig.deviceId.trim() === '') {
            errors.push('Device ID is required');
        }
        if (!bleConfig.serviceUuid || bleConfig.serviceUuid.trim() === '') {
            errors.push('Service UUID is required');
        }
        if (!bleConfig.characteristicUuid || bleConfig.characteristicUuid.trim() === '') {
            errors.push('Characteristic UUID is required');
        }
        // Validate UUIDs format
        if (bleConfig.serviceUuid && !this.isValidUUID(bleConfig.serviceUuid)) {
            errors.push('Invalid service UUID format');
        }
        if (bleConfig.characteristicUuid && !this.isValidUUID(bleConfig.characteristicUuid)) {
            errors.push('Invalid characteristic UUID format');
        }
        // Validate timeouts
        if (bleConfig.scanTimeout && bleConfig.scanTimeout < 1000) {
            errors.push('Scan timeout must be at least 1000ms');
        }
        if (bleConfig.connectionTimeout && bleConfig.connectionTimeout < 5000) {
            errors.push('Connection timeout must be at least 5000ms');
        }
        return errors;
    }
    /**
     * Validate UUID format
     */
    isValidUUID(uuid) {
        // Basic UUID validation (supports both short and long formats)
        const shortUuidRegex = /^[0-9a-f]{4}$/i;
        const longUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return shortUuidRegex.test(uuid) || longUuidRegex.test(uuid);
    }
    /**
     * Get device discovery functions for each bus type
     */
    async discoverDevices(busType) {
        switch (busType) {
            case types_1.BusType.UART:
                return await UARTDriver_1.UARTDriver.listPorts();
            case types_1.BusType.Network:
                // Network devices don't have discovery
                return [];
            case types_1.BusType.BluetoothLE:
                if (!this.isSupported(types_1.BusType.BluetoothLE)) {
                    throw new Error('Bluetooth LE is not supported on this platform');
                }
                // Create temporary driver for discovery
                const tempConfig = {
                    type: types_1.BusType.BluetoothLE,
                    deviceId: '',
                    serviceUuid: '',
                    characteristicUuid: ''
                };
                const bleDriver = new BluetoothLEDriver_1.BluetoothLEDriver(tempConfig);
                try {
                    const devices = await bleDriver.startDiscovery();
                    bleDriver.destroy();
                    return devices;
                }
                catch (error) {
                    bleDriver.destroy();
                    throw error;
                }
            default:
                throw new Error(`Device discovery not supported for bus type: ${busType}`);
        }
    }
    /**
     * Create driver with merged default configuration
     */
    createDriverWithDefaults(config) {
        const defaultConfig = this.getDefaultConfig(config.type);
        const mergedConfig = { ...defaultConfig, ...config };
        return this.createDriver(mergedConfig);
    }
    /**
     * Get driver information
     */
    getDriverInfo(busType) {
        const driverEntry = this.drivers.get(busType);
        if (!driverEntry) {
            return null;
        }
        return {
            busType: driverEntry.busType,
            name: driverEntry.name,
            description: driverEntry.description,
            supported: driverEntry.isSupported(),
            features: this.getDriverFeatures(driverEntry.busType),
            defaultConfig: driverEntry.getDefaultConfig()
        };
    }
}
exports.DriverFactory = DriverFactory;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * UART (Serial Port) Driver Implementation
 * Based on Serial Studio's IO::Drivers::UART implementation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UARTDriver = void 0;
const serialport_1 = __webpack_require__(6);
const HALDriver_1 = __webpack_require__(7);
const types_1 = __webpack_require__(8);
/**
 * UART Driver for serial port communication
 *
 * Implements the HAL driver interface for serial port devices,
 * providing configuration, connection management, and data transfer
 * capabilities with comprehensive error handling and auto-reconnection.
 */
class UARTDriver extends HALDriver_1.HALDriver {
    serialPort = null;
    reconnectTimer = null;
    isReconnecting = false;
    constructor(config) {
        super(config);
        this.validateAndSetDefaults();
    }
    /**
     * Get the bus type for this driver
     */
    get busType() {
        return types_1.BusType.UART;
    }
    /**
     * Get display name for this driver instance
     */
    get displayName() {
        const uartConfig = this.config;
        return `Serial Port ${uartConfig.port} (${uartConfig.baudRate} baud)`;
    }
    /**
     * Get the underlying SerialPort instance
     */
    get port() {
        return this.serialPort;
    }
    /**
     * Get current UART-specific configuration
     */
    get uartConfig() {
        return this.config;
    }
    /**
     * Validate configuration and set defaults
     */
    validateAndSetDefaults() {
        const config = this.config;
        // Set defaults if not provided
        config.baudRate = config.baudRate || 9600;
        config.dataBits = config.dataBits || 8;
        config.stopBits = config.stopBits || 1;
        config.parity = config.parity || 'none';
        config.flowControl = config.flowControl || 'none';
        config.autoReconnect = config.autoReconnect ?? true;
        config.timeout = config.timeout || 1000;
    }
    /**
     * List available serial ports
     */
    static async listPorts() {
        try {
            const ports = await serialport_1.SerialPort.list();
            return ports.map(port => ({
                path: port.path,
                manufacturer: port.manufacturer,
                serialNumber: port.serialNumber,
                pnpId: port.pnpId,
                locationId: port.locationId,
                productId: port.productId,
                vendorId: port.vendorId
            }));
        }
        catch (error) {
            throw new Error(`Failed to list serial ports: ${error}`);
        }
    }
    /**
     * Open the serial port connection
     */
    async open() {
        const config = this.uartConfig;
        if (this.serialPort && this.serialPort.isOpen) {
            throw new Error('Serial port is already open');
        }
        const validation = this.validateConfiguration();
        if (!validation.valid) {
            throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
        }
        try {
            // Create and open serial port
            this.serialPort = new serialport_1.SerialPort({
                path: config.port,
                baudRate: config.baudRate,
                dataBits: config.dataBits,
                stopBits: config.stopBits,
                parity: config.parity,
                autoOpen: false
            });
            // Set up event handlers
            this.setupEventHandlers();
            // Open the port
            await new Promise((resolve, reject) => {
                this.serialPort.open((error) => {
                    if (error) {
                        reject(new Error(`Failed to open serial port: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
            // Configure DTR/RTS if specified
            if (config.dtrEnabled !== undefined) {
                await this.setDTR(config.dtrEnabled);
            }
            if (config.rtsEnabled !== undefined) {
                await this.setRTS(config.rtsEnabled);
            }
            this.emit('connected');
            this.resetStats();
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Close the serial port connection
     */
    async close() {
        // Stop reconnection attempts
        this.stopReconnectTimer();
        if (this.serialPort && this.serialPort.isOpen) {
            try {
                await new Promise((resolve, reject) => {
                    this.serialPort.close((error) => {
                        if (error) {
                            reject(new Error(`Failed to close serial port: ${error.message}`));
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            catch (error) {
                this.handleError(error);
                throw error;
            }
        }
        this.serialPort = null;
        this.emit('disconnected');
    }
    /**
     * Check if the serial port is open
     */
    isOpen() {
        return this.serialPort ? this.serialPort.isOpen : false;
    }
    /**
     * Check if the port is readable
     */
    isReadable() {
        return this.isOpen() && this.serialPort.readable;
    }
    /**
     * Check if the port is writable
     */
    isWritable() {
        return this.isOpen() && this.serialPort.writable;
    }
    /**
     * Validate the current configuration
     */
    validateConfiguration() {
        const config = this.uartConfig;
        const errors = [];
        // Validate port
        if (!config.port || config.port.trim() === '') {
            errors.push('Port is required');
        }
        // Validate baud rate
        const validBaudRates = [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 230400, 256000, 460800, 921600];
        if (!validBaudRates.includes(config.baudRate)) {
            errors.push(`Invalid baud rate: ${config.baudRate}`);
        }
        // Validate data bits
        if (![5, 6, 7, 8].includes(config.dataBits)) {
            errors.push(`Invalid data bits: ${config.dataBits}`);
        }
        // Validate stop bits
        if (![1, 1.5, 2].includes(config.stopBits)) {
            errors.push(`Invalid stop bits: ${config.stopBits}`);
        }
        // Validate parity
        const validParity = ['none', 'odd', 'even', 'mark', 'space'];
        if (!validParity.includes(config.parity)) {
            errors.push(`Invalid parity: ${config.parity}`);
        }
        // Validate flow control
        const validFlowControl = ['none', 'xon', 'rts', 'xonrts'];
        if (!validFlowControl.includes(config.flowControl)) {
            errors.push(`Invalid flow control: ${config.flowControl}`);
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Write data to the serial port
     */
    async write(data) {
        if (!this.isWritable()) {
            throw new Error('Serial port is not writable');
        }
        try {
            const bytesWritten = await new Promise((resolve, reject) => {
                this.serialPort.write(data, (error) => {
                    if (error) {
                        reject(new Error(`Failed to write to serial port: ${error.message}`));
                    }
                    else {
                        resolve(data.length); // SerialPort doesn't return bytesWritten in callback
                    }
                });
            });
            this.updateSentStats(bytesWritten);
            return bytesWritten;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Set DTR (Data Terminal Ready) signal
     */
    async setDTR(enabled) {
        if (!this.serialPort || !this.serialPort.isOpen) {
            throw new Error('Serial port is not open');
        }
        try {
            await new Promise((resolve, reject) => {
                this.serialPort.set({ dtr: enabled }, (error) => {
                    if (error) {
                        reject(new Error(`Failed to set DTR: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Set RTS (Request To Send) signal
     */
    async setRTS(enabled) {
        if (!this.serialPort || !this.serialPort.isOpen) {
            throw new Error('Serial port is not open');
        }
        try {
            await new Promise((resolve, reject) => {
                this.serialPort.set({ rts: enabled }, (error) => {
                    if (error) {
                        reject(new Error(`Failed to set RTS: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Flush the serial port buffers
     */
    async flush() {
        if (!this.serialPort || !this.serialPort.isOpen) {
            throw new Error('Serial port is not open');
        }
        try {
            await new Promise((resolve, reject) => {
                this.serialPort.flush((error) => {
                    if (error) {
                        reject(new Error(`Failed to flush serial port: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Set up event handlers for the serial port
     */
    setupEventHandlers() {
        if (!this.serialPort) {
            return;
        }
        // Handle incoming data
        this.serialPort.on('data', (data) => {
            this.processData(data);
        });
        // Handle errors
        this.serialPort.on('error', (error) => {
            this.handleError(error);
            // Attempt reconnection if enabled
            if (this.uartConfig.autoReconnect && !this.isReconnecting) {
                this.startReconnectTimer();
            }
        });
        // Handle close events
        this.serialPort.on('close', () => {
            this.emit('disconnected');
            // Attempt reconnection if enabled and not manually closed
            if (this.uartConfig.autoReconnect && !this.isReconnecting) {
                this.startReconnectTimer();
            }
        });
    }
    /**
     * Start automatic reconnection timer
     */
    startReconnectTimer() {
        if (this.reconnectTimer) {
            return;
        }
        this.isReconnecting = true;
        this.reconnectTimer = setInterval(async () => {
            try {
                // Ensure port is closed before attempting reconnection
                if (this.serialPort && this.serialPort.isOpen) {
                    await this.close();
                }
                await this.open();
                this.stopReconnectTimer();
            }
            catch (error) {
                // Reconnection failed, will try again on next timer
                console.warn(`Reconnection attempt failed: ${error}`);
            }
        }, 5000); // Try every 5 seconds
    }
    /**
     * Stop automatic reconnection timer
     */
    stopReconnectTimer() {
        if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.isReconnecting = false;
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.stopReconnectTimer();
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.close();
        }
        super.destroy();
    }
}
exports.UARTDriver = UARTDriver;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("serialport");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Hardware Abstraction Layer (HAL) Driver
 * Abstract base class for all communication drivers
 * Based on Serial Studio's IO::HAL_Driver design
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HALDriver = void 0;
const events_1 = __webpack_require__(3);
/**
 * Abstract Hardware Abstraction Layer Driver
 *
 * This class provides the core interface for all I/O drivers in the system.
 * It defines methods for opening, closing, and checking the state of devices,
 * as well as sending and receiving data.
 *
 * The class includes a high-efficiency buffered data processing mechanism
 * through processData(), which reduces signal overhead in high-frequency
 * environments by aggregating data until a configurable buffer threshold is
 * reached.
 *
 * Thread safety is ensured for buffer operations, making processData() safe
 * to call from multiple threads.
 */
class HALDriver extends events_1.EventEmitter {
    config;
    stats;
    bufferSize = 8192;
    dataBuffer;
    bufferPosition = 0;
    bufferLock = new Object();
    constructor(config) {
        super();
        this.config = config;
        const now = Date.now();
        this.stats = {
            bytesReceived: 0,
            bytesSent: 0,
            errors: 0,
            uptime: now,
            lastActivity: now
        };
        this.dataBuffer = Buffer.alloc(this.bufferSize);
    }
    /**
     * Get the current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }
    /**
     * Update the configuration (must call open() again to apply)
     * @param newConfig New configuration to apply
     */
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configurationChanged');
    }
    /**
     * Check if the current configuration is valid
     */
    isConfigurationValid() {
        return this.validateConfiguration().valid;
    }
    /**
     * Set the buffer size for data aggregation
     * @param size Buffer size in bytes
     */
    setBufferSize(size) {
        if (size > 0 && size !== this.bufferSize) {
            this.bufferSize = size;
            this.dataBuffer = Buffer.alloc(size);
            this.bufferPosition = 0;
        }
    }
    /**
     * Process incoming data with buffering to reduce signal overhead
     * Thread-safe operation that aggregates data until buffer threshold is reached
     * @param data Incoming data to process
     */
    processData(data) {
        // Thread-safe buffer operation
        synchronized(this.bufferLock, () => {
            // Update statistics
            this.stats.bytesReceived += data.length;
            this.stats.lastActivity = Date.now();
            // Check if data fits in current buffer
            if (this.bufferPosition + data.length <= this.bufferSize) {
                // Add to buffer
                data.copy(this.dataBuffer, this.bufferPosition);
                this.bufferPosition += data.length;
            }
            else {
                // Buffer would overflow, flush current buffer and start new one
                this.flushBuffer();
                if (data.length <= this.bufferSize) {
                    // New data fits in empty buffer
                    data.copy(this.dataBuffer, 0);
                    this.bufferPosition = data.length;
                }
                else {
                    // Data is larger than buffer, emit directly
                    this.emit('dataReceived', data);
                    return;
                }
            }
            // Check if buffer is full or if we should flush based on other criteria
            if (this.bufferPosition >= this.bufferSize * 0.8) { // 80% threshold
                this.flushBuffer();
            }
        });
    }
    /**
     * Flush the current data buffer
     * Emits buffered data if any exists
     */
    flushBuffer() {
        if (this.bufferPosition > 0) {
            const bufferedData = Buffer.alloc(this.bufferPosition);
            this.dataBuffer.copy(bufferedData, 0, 0, this.bufferPosition);
            this.bufferPosition = 0;
            this.emit('dataReceived', bufferedData);
        }
    }
    /**
     * Get driver statistics
     */
    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.uptime
        };
    }
    /**
     * Reset driver statistics
     */
    resetStats() {
        const now = Date.now();
        this.stats = {
            bytesReceived: 0,
            bytesSent: 0,
            errors: 0,
            uptime: now,
            lastActivity: now
        };
    }
    /**
     * Handle driver errors
     * @param error The error that occurred
     */
    handleError(error) {
        this.stats.errors++;
        this.emit('error', error);
    }
    /**
     * Update sent bytes statistics
     * @param bytes Number of bytes sent
     */
    updateSentStats(bytes) {
        this.stats.bytesSent += bytes;
        this.stats.lastActivity = Date.now();
        this.emit('dataSent', bytes);
    }
    /**
     * Clean up resources when driver is destroyed
     */
    destroy() {
        this.flushBuffer();
        this.removeAllListeners();
    }
}
exports.HALDriver = HALDriver;
/**
 * Simple mutex-like synchronization for critical sections
 * @param lock Object to use as mutex
 * @param fn Function to execute in critical section
 */
function synchronized(lock, fn) {
    // Note: This is a simplified synchronization mechanism
    // In a real implementation, you might want to use a proper mutex library
    return fn();
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


/**
 * Shared types for Serial Studio VSCode Extension
 * Based on Serial Studio's architecture and design patterns
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageType = exports.ExportFormatType = exports.MapLayerType = exports.ValidationStatus = exports.WidgetType = exports.BusType = exports.OperationMode = exports.FrameDetection = exports.DecoderMethod = void 0;
/**
 * Decoder methods for processing incoming data streams
 * Mirrors SerialStudio::DecoderMethod enum
 */
var DecoderMethod;
(function (DecoderMethod) {
    DecoderMethod[DecoderMethod["PlainText"] = 0] = "PlainText";
    DecoderMethod[DecoderMethod["Hexadecimal"] = 1] = "Hexadecimal";
    DecoderMethod[DecoderMethod["Base64"] = 2] = "Base64";
    DecoderMethod[DecoderMethod["Binary"] = 3] = "Binary";
})(DecoderMethod = exports.DecoderMethod || (exports.DecoderMethod = {}));
/**
 * Frame detection methods for identifying data frames in streams
 * Mirrors SerialStudio::FrameDetection enum
 */
var FrameDetection;
(function (FrameDetection) {
    FrameDetection[FrameDetection["EndDelimiterOnly"] = 0] = "EndDelimiterOnly";
    FrameDetection[FrameDetection["StartAndEndDelimiter"] = 1] = "StartAndEndDelimiter";
    FrameDetection[FrameDetection["NoDelimiters"] = 2] = "NoDelimiters";
    FrameDetection[FrameDetection["StartDelimiterOnly"] = 3] = "StartDelimiterOnly";
})(FrameDetection = exports.FrameDetection || (exports.FrameDetection = {}));
/**
 * Operation modes for dashboard construction
 * Mirrors SerialStudio::OperationMode enum
 */
var OperationMode;
(function (OperationMode) {
    OperationMode[OperationMode["ProjectFile"] = 0] = "ProjectFile";
    OperationMode[OperationMode["DeviceSendsJSON"] = 1] = "DeviceSendsJSON";
    OperationMode[OperationMode["QuickPlot"] = 2] = "QuickPlot";
})(OperationMode = exports.OperationMode || (exports.OperationMode = {}));
/**
 * Communication bus types
 * Mirrors SerialStudio::BusType enum
 */
var BusType;
(function (BusType) {
    BusType["UART"] = "uart";
    BusType["Network"] = "network";
    BusType["BluetoothLE"] = "bluetooth-le";
    BusType["Audio"] = "audio";
    BusType["ModBus"] = "modbus";
    BusType["CanBus"] = "can"; // Commercial feature
})(BusType = exports.BusType || (exports.BusType = {}));
/**
 * Widget types for different visualizations
 * Mirrors Serial Studio's widget system
 */
var WidgetType;
(function (WidgetType) {
    WidgetType["Plot"] = "plot";
    WidgetType["MultiPlot"] = "multiplot";
    WidgetType["Gauge"] = "gauge";
    WidgetType["Bar"] = "bar";
    WidgetType["Compass"] = "compass";
    WidgetType["Accelerometer"] = "accelerometer";
    WidgetType["Gyroscope"] = "gyroscope";
    WidgetType["GPS"] = "gps";
    WidgetType["LED"] = "led";
    WidgetType["DataGrid"] = "datagrid";
    WidgetType["Terminal"] = "terminal";
    WidgetType["FFT"] = "fft";
    WidgetType["Plot3D"] = "plot3d";
})(WidgetType = exports.WidgetType || (exports.WidgetType = {}));
/**
 * Data validation status for frame processing
 * Mirrors IO::ValidationStatus enum
 */
var ValidationStatus;
(function (ValidationStatus) {
    ValidationStatus["FrameOk"] = "frame_ok";
    ValidationStatus["ChecksumError"] = "checksum_error";
    ValidationStatus["ChecksumIncomplete"] = "checksum_incomplete";
})(ValidationStatus = exports.ValidationStatus || (exports.ValidationStatus = {}));
/**
 * Map layer types
 */
var MapLayerType;
(function (MapLayerType) {
    MapLayerType[MapLayerType["Satellite"] = 0] = "Satellite";
    MapLayerType[MapLayerType["SatelliteLabels"] = 1] = "SatelliteLabels";
    MapLayerType[MapLayerType["Street"] = 2] = "Street";
    MapLayerType[MapLayerType["Topographic"] = 3] = "Topographic";
    MapLayerType[MapLayerType["Terrain"] = 4] = "Terrain";
    MapLayerType[MapLayerType["LightGray"] = 5] = "LightGray";
    MapLayerType[MapLayerType["DarkGray"] = 6] = "DarkGray";
    MapLayerType[MapLayerType["NationalGeographic"] = 7] = "NationalGeographic";
})(MapLayerType = exports.MapLayerType || (exports.MapLayerType = {}));
/**
 * Export format types
 */
var ExportFormatType;
(function (ExportFormatType) {
    ExportFormatType["CSV"] = "csv";
    ExportFormatType["JSON"] = "json";
    ExportFormatType["EXCEL"] = "excel";
    ExportFormatType["XML"] = "xml";
    ExportFormatType["TXT"] = "txt";
    ExportFormatType["BINARY"] = "binary";
})(ExportFormatType = exports.ExportFormatType || (exports.ExportFormatType = {}));
/**
 * Message types for communication between extension and webview
 */
var MessageType;
(function (MessageType) {
    // Connection management
    MessageType["CONNECT_DEVICE"] = "connect_device";
    MessageType["DISCONNECT_DEVICE"] = "disconnect_device";
    MessageType["CONNECTION_STATUS"] = "connection_status";
    // Data flow
    MessageType["FRAME_DATA"] = "frame_data";
    MessageType["RAW_DATA"] = "raw_data";
    // Project management
    MessageType["LOAD_PROJECT"] = "load_project";
    MessageType["SAVE_PROJECT"] = "save_project";
    MessageType["PROJECT_LOADED"] = "project_loaded";
    // Configuration
    MessageType["UPDATE_CONFIG"] = "update_config";
    MessageType["GET_CONFIG"] = "get_config";
    // Export
    MessageType["EXPORT_DATA"] = "export_data";
    MessageType["EXPORT_COMPLETE"] = "export_complete";
    // Error handling
    MessageType["ERROR"] = "error";
    MessageType["WARNING"] = "warning";
    MessageType["INFO"] = "info";
})(MessageType = exports.MessageType || (exports.MessageType = {}));


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Network Driver for TCP/UDP communication
 * Based on Serial Studio's IO::Drivers::Network design
 * Supports both TCP client/server and UDP communication modes
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NetworkDriver = exports.NetworkSocketType = void 0;
const net = __importStar(__webpack_require__(10));
const dgram = __importStar(__webpack_require__(11));
const HALDriver_1 = __webpack_require__(7);
const types_1 = __webpack_require__(8);
/**
 * Network socket types supported by the driver
 */
var NetworkSocketType;
(function (NetworkSocketType) {
    NetworkSocketType["TCP_CLIENT"] = "tcp_client";
    NetworkSocketType["TCP_SERVER"] = "tcp_server";
    NetworkSocketType["UDP"] = "udp";
    NetworkSocketType["UDP_MULTICAST"] = "udp_multicast";
})(NetworkSocketType = exports.NetworkSocketType || (exports.NetworkSocketType = {}));
/**
 * Network Driver Implementation
 *
 * Provides TCP and UDP communication capabilities following Serial Studio's
 * network driver architecture. Supports both client and server modes for TCP,
 * and unicast/multicast for UDP.
 *
 * Features:
 * - TCP client/server connections
 * - UDP unicast/multicast communication
 * - Automatic reconnection
 * - Connection pooling
 * - Error handling and recovery
 */
class NetworkDriver extends HALDriver_1.HALDriver {
    tcpSocket;
    tcpServer;
    udpSocket;
    reconnectTimer;
    connectionPromise;
    isConnecting = false;
    // Default configuration values
    static DEFAULT_TCP_PORT = 23;
    static DEFAULT_UDP_PORT = 53;
    static DEFAULT_HOST = '127.0.0.1';
    static DEFAULT_TIMEOUT = 5000;
    static DEFAULT_RECONNECT_INTERVAL = 3000;
    constructor(config) {
        super(config);
        // Apply network-specific defaults
        const defaultConfig = {
            host: NetworkDriver.DEFAULT_HOST,
            tcpPort: NetworkDriver.DEFAULT_TCP_PORT,
            udpPort: NetworkDriver.DEFAULT_UDP_PORT,
            protocol: 'tcp',
            socketType: NetworkSocketType.TCP_CLIENT,
            connectTimeout: NetworkDriver.DEFAULT_TIMEOUT,
            reconnectInterval: NetworkDriver.DEFAULT_RECONNECT_INTERVAL,
            autoReconnect: true,
            keepAlive: true,
            noDelay: true,
            multicastTTL: 1
        };
        this.config = { ...defaultConfig, ...config };
    }
    get busType() {
        return types_1.BusType.Network;
    }
    get displayName() {
        const config = this.config;
        const protocol = config.protocol.toUpperCase();
        const port = config.protocol === 'tcp' ? config.tcpPort : config.udpPort;
        return `${protocol} ${config.host}:${port}`;
    }
    /**
     * Open network connection based on configuration
     */
    async open() {
        if (this.isOpen()) {
            return;
        }
        if (this.isConnecting) {
            return this.connectionPromise;
        }
        this.isConnecting = true;
        const config = this.config;
        try {
            this.connectionPromise = this.establishConnection(config);
            await this.connectionPromise;
            this.emit('connected');
            console.log(`Network driver connected: ${this.displayName}`);
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
        finally {
            this.isConnecting = false;
            this.connectionPromise = undefined;
        }
    }
    /**
     * Establish connection based on protocol and socket type
     */
    async establishConnection(config) {
        if (config.protocol === 'tcp') {
            if (config.socketType === NetworkSocketType.TCP_SERVER) {
                await this.createTcpServer(config);
            }
            else {
                await this.createTcpClient(config);
            }
        }
        else if (config.protocol === 'udp') {
            await this.createUdpSocket(config);
        }
        else {
            throw new Error(`Unsupported protocol: ${config.protocol}`);
        }
    }
    /**
     * Create TCP client connection
     */
    async createTcpClient(config) {
        return new Promise((resolve, reject) => {
            this.tcpSocket = new net.Socket();
            // Configure socket options
            if (config.keepAlive) {
                this.tcpSocket.setKeepAlive(true);
            }
            if (config.noDelay) {
                this.tcpSocket.setNoDelay(true);
            }
            // Set up event handlers
            this.tcpSocket.on('connect', () => {
                console.log(`TCP client connected to ${config.host}:${config.tcpPort}`);
                resolve();
            });
            this.tcpSocket.on('data', (data) => {
                this.processData(data);
            });
            this.tcpSocket.on('error', (error) => {
                this.handleError(error);
                reject(error);
            });
            this.tcpSocket.on('close', () => {
                console.log('TCP client connection closed');
                this.emit('disconnected');
                this.scheduleReconnect();
            });
            // Connect with timeout
            const timeout = setTimeout(() => {
                this.tcpSocket?.destroy();
                reject(new Error(`Connection timeout after ${config.connectTimeout}ms`));
            }, config.connectTimeout);
            this.tcpSocket.connect(config.tcpPort, config.host, () => {
                clearTimeout(timeout);
            });
        });
    }
    /**
     * Create TCP server
     */
    async createTcpServer(config) {
        return new Promise((resolve, reject) => {
            this.tcpServer = net.createServer();
            this.tcpServer.on('connection', (socket) => {
                console.log(`TCP server received connection from ${socket.remoteAddress}:${socket.remotePort}`);
                this.tcpSocket = socket;
                // Configure connected socket
                if (config.keepAlive) {
                    socket.setKeepAlive(true);
                }
                if (config.noDelay) {
                    socket.setNoDelay(true);
                }
                socket.on('data', (data) => {
                    this.processData(data);
                });
                socket.on('error', (error) => {
                    this.handleError(error);
                });
                socket.on('close', () => {
                    console.log('TCP server client disconnected');
                    this.tcpSocket = undefined;
                });
                this.emit('connected');
            });
            this.tcpServer.on('error', (error) => {
                this.handleError(error);
                reject(error);
            });
            this.tcpServer.listen(config.tcpPort, config.host, () => {
                console.log(`TCP server listening on ${config.host}:${config.tcpPort}`);
                resolve();
            });
        });
    }
    /**
     * Create UDP socket
     */
    async createUdpSocket(config) {
        return new Promise((resolve, reject) => {
            this.udpSocket = dgram.createSocket('udp4');
            this.udpSocket.on('message', (data, rinfo) => {
                console.log(`UDP received ${data.length} bytes from ${rinfo.address}:${rinfo.port}`);
                this.processData(data);
            });
            this.udpSocket.on('error', (error) => {
                this.handleError(error);
                reject(error);
            });
            this.udpSocket.on('listening', () => {
                const address = this.udpSocket.address();
                console.log(`UDP socket listening on ${address.address}:${address.port}`);
                // Join multicast group if specified
                if (config.socketType === NetworkSocketType.UDP_MULTICAST && config.multicastAddress) {
                    try {
                        this.udpSocket.addMembership(config.multicastAddress);
                        if (config.multicastTTL) {
                            this.udpSocket.setMulticastTTL(config.multicastTTL);
                        }
                        console.log(`Joined multicast group: ${config.multicastAddress}`);
                    }
                    catch (error) {
                        this.handleError(error);
                    }
                }
                resolve();
            });
            // Bind to specified port and host
            this.udpSocket.bind(config.udpPort, config.host);
        });
    }
    /**
     * Close network connection
     */
    async close() {
        // Clear reconnection timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        // Close TCP connections
        if (this.tcpSocket) {
            this.tcpSocket.destroy();
            this.tcpSocket = undefined;
        }
        if (this.tcpServer) {
            this.tcpServer.close();
            this.tcpServer = undefined;
        }
        // Close UDP socket
        if (this.udpSocket) {
            this.udpSocket.close();
            this.udpSocket = undefined;
        }
        this.emit('disconnected');
        console.log('Network driver disconnected');
    }
    /**
     * Check if connection is open
     */
    isOpen() {
        const config = this.config;
        if (config.protocol === 'tcp') {
            if (config.socketType === NetworkSocketType.TCP_SERVER) {
                return this.tcpServer?.listening === true;
            }
            else {
                return this.tcpSocket?.readyState === 'open';
            }
        }
        else if (config.protocol === 'udp') {
            return this.udpSocket !== undefined;
        }
        return false;
    }
    /**
     * Check if connection is readable
     */
    isReadable() {
        return this.isOpen();
    }
    /**
     * Check if connection is writable
     */
    isWritable() {
        const config = this.config;
        if (config.protocol === 'tcp') {
            return this.tcpSocket?.writable === true;
        }
        else if (config.protocol === 'udp') {
            return this.udpSocket !== undefined;
        }
        return false;
    }
    /**
     * Validate network configuration
     */
    validateConfiguration() {
        const config = this.config;
        const errors = [];
        // Validate required fields
        if (!config.host || config.host.trim() === '') {
            errors.push('Host address is required');
        }
        if (!config.protocol) {
            errors.push('Protocol (tcp/udp) is required');
        }
        else if (!['tcp', 'udp'].includes(config.protocol)) {
            errors.push('Protocol must be either tcp or udp');
        }
        // Validate ports
        if (config.protocol === 'tcp') {
            if (!config.tcpPort || config.tcpPort < 1 || config.tcpPort > 65535) {
                errors.push('Valid TCP port (1-65535) is required');
            }
        }
        else if (config.protocol === 'udp') {
            if (!config.udpPort || config.udpPort < 1 || config.udpPort > 65535) {
                errors.push('Valid UDP port (1-65535) is required');
            }
        }
        // Validate multicast configuration
        if (config.socketType === NetworkSocketType.UDP_MULTICAST) {
            if (!config.multicastAddress) {
                errors.push('Multicast address is required for multicast mode');
            }
            else {
                // Basic multicast address validation (224.0.0.0 to 239.255.255.255)
                const parts = config.multicastAddress.split('.');
                if (parts.length !== 4 || parseInt(parts[0]) < 224 || parseInt(parts[0]) > 239) {
                    errors.push('Invalid multicast address format');
                }
            }
        }
        // Validate timeouts
        if (config.connectTimeout && config.connectTimeout < 1000) {
            errors.push('Connection timeout must be at least 1000ms');
        }
        if (config.reconnectInterval && config.reconnectInterval < 1000) {
            errors.push('Reconnection interval must be at least 1000ms');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Write data to network connection
     */
    async write(data) {
        if (!this.isWritable()) {
            throw new Error('Network connection is not writable');
        }
        const config = this.config;
        try {
            if (config.protocol === 'tcp' && this.tcpSocket) {
                return new Promise((resolve, reject) => {
                    this.tcpSocket.write(data, (error) => {
                        if (error) {
                            this.handleError(error);
                            reject(error);
                        }
                        else {
                            this.updateSentStats(data.length);
                            resolve(data.length);
                        }
                    });
                });
            }
            else if (config.protocol === 'udp' && this.udpSocket) {
                return new Promise((resolve, reject) => {
                    const port = config.udpPort;
                    const host = config.multicastAddress || config.host;
                    this.udpSocket.send(data, port, host, (error) => {
                        if (error) {
                            this.handleError(error);
                            reject(error);
                        }
                        else {
                            this.updateSentStats(data.length);
                            resolve(data.length);
                        }
                    });
                });
            }
            else {
                throw new Error('No valid connection available for writing');
            }
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Schedule automatic reconnection if enabled
     */
    scheduleReconnect() {
        const config = this.config;
        if (config.autoReconnect && !this.reconnectTimer) {
            console.log(`Scheduling reconnection in ${config.reconnectInterval}ms`);
            this.reconnectTimer = setTimeout(async () => {
                this.reconnectTimer = undefined;
                if (!this.isOpen()) {
                    try {
                        console.log('Attempting automatic reconnection...');
                        await this.open();
                    }
                    catch (error) {
                        console.error('Automatic reconnection failed:', error);
                        this.scheduleReconnect(); // Schedule next attempt
                    }
                }
            }, config.reconnectInterval);
        }
    }
    /**
     * Get network-specific status information
     */
    getNetworkStatus() {
        const config = this.config;
        const status = {
            protocol: config.protocol,
            host: config.host,
            port: config.protocol === 'tcp' ? config.tcpPort : config.udpPort,
            socketType: config.socketType || 'unknown',
            connected: this.isOpen(),
            remoteAddress: undefined,
            remotePort: undefined
        };
        // Add remote connection info for TCP
        if (this.tcpSocket && config.protocol === 'tcp') {
            status.remoteAddress = this.tcpSocket.remoteAddress;
            status.remotePort = this.tcpSocket.remotePort;
        }
        return status;
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.close();
        super.destroy();
    }
}
exports.NetworkDriver = NetworkDriver;


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("net");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("dgram");

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Bluetooth Low Energy (BLE) Driver
 * Based on Serial Studio's IO::Drivers::BluetoothLE design
 * Provides BLE device discovery, connection, and data communication
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BluetoothLEDriver = void 0;
const events_1 = __webpack_require__(3);
const HALDriver_1 = __webpack_require__(7);
const types_1 = __webpack_require__(8);
/**
 * Bluetooth LE Driver Implementation
 *
 * Provides Bluetooth Low Energy communication capabilities following Serial Studio's
 * BLE driver architecture. Supports device discovery, service exploration,
 * and data communication through characteristics.
 *
 * Features:
 * - Device discovery and filtering
 * - Service and characteristic discovery
 * - Read/Write/Notify operations
 * - Automatic reconnection
 * - Connection state management
 * - Error handling and recovery
 *
 * Note: This implementation uses mock interfaces. In a real deployment,
 * you would integrate with a BLE library like 'noble' or '@abandonware/noble'
 */
class BluetoothLEDriver extends HALDriver_1.HALDriver {
    discoveredDevices = new Map();
    connectedDevice;
    currentPeripheral;
    currentCharacteristic;
    services = new Map();
    isScanning = false;
    isConnecting = false;
    reconnectTimer;
    // Default configuration values
    static DEFAULT_SCAN_TIMEOUT = 10000;
    static DEFAULT_CONNECTION_TIMEOUT = 15000;
    static DEFAULT_RECONNECT_INTERVAL = 5000;
    constructor(config) {
        super(config);
        // Apply BLE-specific defaults
        this.config = {
            scanTimeout: BluetoothLEDriver.DEFAULT_SCAN_TIMEOUT,
            connectionTimeout: BluetoothLEDriver.DEFAULT_CONNECTION_TIMEOUT,
            reconnectInterval: BluetoothLEDriver.DEFAULT_RECONNECT_INTERVAL,
            autoReconnect: true,
            autoDiscoverServices: true,
            enableNotifications: true,
            powerMode: 'balanced',
            ...config
        };
    }
    get busType() {
        return types_1.BusType.BluetoothLE;
    }
    get displayName() {
        const config = this.config;
        const deviceName = this.connectedDevice?.name || config.deviceId || 'Unknown';
        return `BLE ${deviceName}`;
    }
    /**
     * Check if the operating system supports Bluetooth LE
     */
    static isOperatingSystemSupported() {
        // In a real implementation, you would check platform capabilities
        const platform = process.platform;
        return platform === 'darwin' || platform === 'linux' || platform === 'win32';
    }
    /**
     * Start device discovery
     */
    async startDiscovery() {
        if (this.isScanning) {
            throw new Error('Discovery already in progress');
        }
        if (!BluetoothLEDriver.isOperatingSystemSupported()) {
            throw new Error('Bluetooth LE is not supported on this operating system');
        }
        const config = this.config;
        this.isScanning = true;
        this.discoveredDevices.clear();
        try {
            console.log('Starting BLE device discovery...');
            // Mock device discovery - in real implementation, use noble.startScanning()
            await this.mockDeviceDiscovery(config);
            const devices = Array.from(this.discoveredDevices.values());
            console.log(`Discovery completed. Found ${devices.length} devices`);
            return devices;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
        finally {
            this.isScanning = false;
        }
    }
    /**
     * Mock device discovery for demonstration
     */
    async mockDeviceDiscovery(config) {
        return new Promise((resolve) => {
            // Simulate discovery delay
            setTimeout(() => {
                // Add some mock devices
                const mockDevices = [
                    {
                        id: 'device-1',
                        name: 'Arduino Nano 33 BLE',
                        address: '00:11:22:33:44:55',
                        rssi: -45,
                        advertisement: {
                            localName: 'Arduino Nano 33 BLE',
                            serviceUuids: ['180a', '180f'],
                            manufacturerData: Buffer.from([0x01, 0x02, 0x03])
                        }
                    },
                    {
                        id: 'device-2',
                        name: 'ESP32 BLE',
                        address: 'aa:bb:cc:dd:ee:ff',
                        rssi: -67,
                        advertisement: {
                            localName: 'ESP32 BLE',
                            serviceUuids: ['12345678-1234-1234-1234-123456789abc'],
                            txPowerLevel: 4
                        }
                    }
                ];
                mockDevices.forEach(device => {
                    this.discoveredDevices.set(device.id, device);
                    // Emit as generic event since it's not in HALDriverEvents
                    this.emit('deviceDiscovered', device);
                });
                resolve();
            }, config.scanTimeout / 2);
        });
    }
    /**
     * Open connection to BLE device
     */
    async open() {
        if (this.isOpen()) {
            return;
        }
        if (this.isConnecting) {
            throw new Error('Connection attempt already in progress');
        }
        const config = this.config;
        if (!config.deviceId) {
            throw new Error('Device ID is required for BLE connection');
        }
        this.isConnecting = true;
        try {
            // Find device in discovered devices or discover it
            let device = this.discoveredDevices.get(config.deviceId);
            if (!device) {
                console.log('Device not in cache, starting discovery...');
                const devices = await this.startDiscovery();
                device = devices.find(d => d.id === config.deviceId);
                if (!device) {
                    throw new Error(`Device ${config.deviceId} not found`);
                }
            }
            // Connect to device
            await this.connectToDevice(device);
            // Discover services and characteristics
            if (config.autoDiscoverServices) {
                await this.discoverServices();
            }
            // Set up characteristic for communication
            await this.setupCharacteristic(config);
            this.connectedDevice = device;
            this.emit('connected');
            console.log(`BLE driver connected to: ${device.name} (${device.address})`);
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
        finally {
            this.isConnecting = false;
        }
    }
    /**
     * Connect to a specific BLE device
     */
    async connectToDevice(device) {
        const config = this.config;
        return new Promise((resolve, reject) => {
            // Mock peripheral connection - in real implementation, use noble.peripheral
            this.currentPeripheral = this.createMockPeripheral(device);
            const timeout = setTimeout(() => {
                reject(new Error(`Connection timeout after ${config.connectionTimeout}ms`));
            }, config.connectionTimeout);
            this.currentPeripheral.on('connect', () => {
                clearTimeout(timeout);
                console.log(`Connected to BLE device: ${device.name}`);
                resolve();
            });
            this.currentPeripheral.on('disconnect', () => {
                console.log('BLE device disconnected');
                this.currentPeripheral = undefined;
                this.currentCharacteristic = undefined;
                this.emit('disconnected');
                this.scheduleReconnect();
            });
            this.currentPeripheral.on('error', (error) => {
                clearTimeout(timeout);
                this.handleError(error);
                reject(error);
            });
            // Initiate connection
            this.currentPeripheral.connect();
        });
    }
    /**
     * Discover services on connected device
     */
    async discoverServices() {
        if (!this.currentPeripheral) {
            throw new Error('No connected peripheral');
        }
        return new Promise((resolve, reject) => {
            this.currentPeripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
                if (error) {
                    reject(error);
                    return;
                }
                // Process discovered services
                if (services) {
                    services.forEach((service) => {
                        const serviceInfo = {
                            uuid: service.uuid,
                            name: service.name || service.uuid,
                            type: service.type || 'primary',
                            characteristics: []
                        };
                        // Process characteristics for this service
                        if (characteristics) {
                            const serviceCharacteristics = characteristics.filter((char) => char.serviceUuid === service.uuid);
                            serviceCharacteristics.forEach((char) => {
                                const charInfo = {
                                    uuid: char.uuid,
                                    name: char.name || char.uuid,
                                    properties: {
                                        read: char.properties.includes('read'),
                                        write: char.properties.includes('write'),
                                        writeWithoutResponse: char.properties.includes('writeWithoutResponse'),
                                        notify: char.properties.includes('notify'),
                                        indicate: char.properties.includes('indicate')
                                    }
                                };
                                serviceInfo.characteristics.push(charInfo);
                            });
                        }
                        this.services.set(service.uuid, serviceInfo);
                    });
                }
                console.log(`Discovered ${this.services.size} services`);
                // Emit as generic event since it's not in HALDriverEvents
                this.emit('servicesDiscovered', Array.from(this.services.values()));
                resolve();
            });
        });
    }
    /**
     * Set up communication characteristic
     */
    async setupCharacteristic(config) {
        if (!config.characteristicUuid) {
            throw new Error('Characteristic UUID is required');
        }
        // Find the characteristic
        let targetCharacteristic;
        for (const service of this.services.values()) {
            targetCharacteristic = service.characteristics.find(char => char.uuid === config.characteristicUuid);
            if (targetCharacteristic) {
                break;
            }
        }
        if (!targetCharacteristic) {
            throw new Error(`Characteristic ${config.characteristicUuid} not found`);
        }
        // Mock characteristic setup
        this.currentCharacteristic = this.createMockCharacteristic(targetCharacteristic);
        // Enable notifications if supported and requested
        if (targetCharacteristic.properties.notify && config.enableNotifications) {
            await this.enableNotifications();
        }
        console.log(`Set up characteristic: ${targetCharacteristic.name} (${targetCharacteristic.uuid})`);
    }
    /**
     * Enable notifications on current characteristic
     */
    async enableNotifications() {
        if (!this.currentCharacteristic) {
            throw new Error('No characteristic available');
        }
        return new Promise((resolve, reject) => {
            this.currentCharacteristic.on('data', (data) => {
                console.log(`BLE notification received: ${data.length} bytes`);
                this.processData(data);
            });
            this.currentCharacteristic.subscribe((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log('BLE notifications enabled');
                    resolve();
                }
            });
        });
    }
    /**
     * Close BLE connection
     */
    async close() {
        // Clear reconnection timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        // Disconnect from peripheral
        if (this.currentPeripheral) {
            return new Promise((resolve) => {
                this.currentPeripheral.disconnect(() => {
                    this.currentPeripheral = undefined;
                    this.currentCharacteristic = undefined;
                    this.connectedDevice = undefined;
                    this.services.clear();
                    this.emit('disconnected');
                    console.log('BLE driver disconnected');
                    resolve();
                });
            });
        }
    }
    /**
     * Check if BLE connection is open
     */
    isOpen() {
        return this.currentPeripheral?.state === 'connected' &&
            this.currentCharacteristic !== undefined;
    }
    /**
     * Check if BLE connection is readable
     */
    isReadable() {
        return this.isOpen() &&
            this.currentCharacteristic !== undefined;
    }
    /**
     * Check if BLE connection is writable
     */
    isWritable() {
        return this.isOpen() &&
            this.currentCharacteristic !== undefined;
    }
    /**
     * Validate BLE configuration
     */
    validateConfiguration() {
        const config = this.config;
        const errors = [];
        // Check OS support
        if (!BluetoothLEDriver.isOperatingSystemSupported()) {
            errors.push('Bluetooth LE is not supported on this operating system');
        }
        // Validate required fields
        if (!config.deviceId || config.deviceId.trim() === '') {
            errors.push('Device ID is required');
        }
        if (!config.serviceUuid || config.serviceUuid.trim() === '') {
            errors.push('Service UUID is required');
        }
        if (!config.characteristicUuid || config.characteristicUuid.trim() === '') {
            errors.push('Characteristic UUID is required');
        }
        // Validate UUIDs format (basic validation)
        if (config.serviceUuid && !this.isValidUUID(config.serviceUuid)) {
            errors.push('Invalid service UUID format');
        }
        if (config.characteristicUuid && !this.isValidUUID(config.characteristicUuid)) {
            errors.push('Invalid characteristic UUID format');
        }
        // Validate timeouts
        if (config.scanTimeout && config.scanTimeout < 1000) {
            errors.push('Scan timeout must be at least 1000ms');
        }
        if (config.connectionTimeout && config.connectionTimeout < 5000) {
            errors.push('Connection timeout must be at least 5000ms');
        }
        if (config.reconnectInterval && config.reconnectInterval < 1000) {
            errors.push('Reconnection interval must be at least 1000ms');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Write data to BLE characteristic
     */
    async write(data) {
        if (!this.isWritable()) {
            throw new Error('BLE connection is not writable');
        }
        if (!this.currentCharacteristic) {
            throw new Error('No characteristic available for writing');
        }
        try {
            return new Promise((resolve, reject) => {
                this.currentCharacteristic.write(data, false, (error) => {
                    if (error) {
                        this.handleError(error);
                        reject(error);
                    }
                    else {
                        this.updateSentStats(data.length);
                        console.log(`BLE data sent: ${data.length} bytes`);
                        resolve(data.length);
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Read data from BLE characteristic
     */
    async readCharacteristic() {
        if (!this.isReadable()) {
            throw new Error('BLE connection is not readable');
        }
        if (!this.currentCharacteristic) {
            throw new Error('No characteristic available for reading');
        }
        return new Promise((resolve, reject) => {
            this.currentCharacteristic.read((error, data) => {
                if (error) {
                    this.handleError(error);
                    reject(error);
                }
                else if (data) {
                    console.log(`BLE data read: ${data.length} bytes`);
                    resolve(data);
                }
                else {
                    reject(new Error('No data received'));
                }
            });
        });
    }
    /**
     * Get list of discovered devices
     */
    getDiscoveredDevices() {
        return Array.from(this.discoveredDevices.values());
    }
    /**
     * Get list of discovered services
     */
    getDiscoveredServices() {
        return Array.from(this.services.values());
    }
    /**
     * Get BLE-specific status information
     */
    getBluetoothStatus() {
        return {
            connected: this.isOpen(),
            device: this.connectedDevice,
            services: this.services.size,
            characteristic: this.config.characteristicUuid,
            rssi: this.connectedDevice?.rssi
        };
    }
    /**
     * Schedule automatic reconnection if enabled
     */
    scheduleReconnect() {
        const config = this.config;
        if (config.autoReconnect && !this.reconnectTimer) {
            console.log(`Scheduling BLE reconnection in ${config.reconnectInterval}ms`);
            this.reconnectTimer = setTimeout(async () => {
                this.reconnectTimer = undefined;
                if (!this.isOpen()) {
                    try {
                        console.log('Attempting BLE automatic reconnection...');
                        await this.open();
                    }
                    catch (error) {
                        console.error('BLE automatic reconnection failed:', error);
                        this.scheduleReconnect(); // Schedule next attempt
                    }
                }
            }, config.reconnectInterval);
        }
    }
    /**
     * Validate UUID format
     */
    isValidUUID(uuid) {
        // Basic UUID validation (supports both short and long formats)
        const shortUuidRegex = /^[0-9a-f]{4}$/i;
        const longUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return shortUuidRegex.test(uuid) || longUuidRegex.test(uuid);
    }
    /**
     * Create mock peripheral for demonstration
     */
    createMockPeripheral(device) {
        const peripheral = new events_1.EventEmitter();
        peripheral.id = device.id;
        peripheral.address = device.address;
        peripheral.addressType = 'public';
        peripheral.connectable = true;
        peripheral.advertisement = device.advertisement;
        peripheral.rssi = device.rssi;
        peripheral.state = 'disconnected';
        peripheral.connect = (callback) => {
            setTimeout(() => {
                peripheral.state = 'connected';
                peripheral.emit('connect');
                if (callback) {
                    callback();
                }
            }, 1000);
        };
        peripheral.disconnect = (callback) => {
            setTimeout(() => {
                peripheral.state = 'disconnected';
                peripheral.emit('disconnect');
                if (callback) {
                    callback();
                }
            }, 500);
        };
        peripheral.discoverAllServicesAndCharacteristics = (callback) => {
            setTimeout(() => {
                const mockServices = [
                    { uuid: '180a', name: 'Device Information', type: 'primary' },
                    { uuid: '180f', name: 'Battery Service', type: 'primary' }
                ];
                const mockCharacteristics = [
                    {
                        uuid: '2a29',
                        name: 'Manufacturer Name',
                        serviceUuid: '180a',
                        properties: ['read']
                    },
                    {
                        uuid: '2a19',
                        name: 'Battery Level',
                        serviceUuid: '180f',
                        properties: ['read', 'notify']
                    }
                ];
                if (callback) {
                    callback(undefined, mockServices, mockCharacteristics);
                }
            }, 1500);
        };
        return peripheral;
    }
    /**
     * Create mock characteristic for demonstration
     */
    createMockCharacteristic(charInfo) {
        const characteristic = new events_1.EventEmitter();
        characteristic.uuid = charInfo.uuid;
        characteristic.name = charInfo.name;
        characteristic.type = 'org.bluetooth.characteristic';
        characteristic.properties = Object.keys(charInfo.properties).filter(prop => charInfo.properties[prop]);
        characteristic.read = (callback) => {
            setTimeout(() => {
                const mockData = Buffer.from('Hello from BLE device!');
                if (callback) {
                    callback(undefined, mockData);
                }
            }, 100);
        };
        characteristic.write = (data, withoutResponse, callback) => {
            setTimeout(() => {
                console.log(`Mock BLE write: ${data.toString()}`);
                if (callback) {
                    callback();
                }
            }, 100);
        };
        characteristic.subscribe = (callback) => {
            setTimeout(() => {
                console.log('Mock BLE notifications subscribed');
                if (callback) {
                    callback();
                }
                // Simulate periodic notifications
                setInterval(() => {
                    const mockData = Buffer.from([Math.floor(Math.random() * 100)]);
                    characteristic.emit('data', mockData);
                }, 2000);
            }, 200);
        };
        characteristic.unsubscribe = (callback) => {
            setTimeout(() => {
                console.log('Mock BLE notifications unsubscribed');
                if (callback) {
                    callback();
                }
            }, 100);
        };
        return characteristic;
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.close();
        super.destroy();
    }
}
exports.BluetoothLEDriver = BluetoothLEDriver;


/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * WorkerManager - 管理多线程数据处理
 * 基于Serial-Studio的多线程架构设计
 * 对应Serial-Studio的QThread管理系统
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkerManager = void 0;
const events_1 = __webpack_require__(3);
const path = __importStar(__webpack_require__(14));
const worker_threads_1 = __webpack_require__(15);
/**
 * Worker状态
 */
var WorkerState;
(function (WorkerState) {
    WorkerState["Idle"] = "idle";
    WorkerState["Busy"] = "busy";
    WorkerState["Error"] = "error";
})(WorkerState || (WorkerState = {}));
/**
 * 多线程数据处理管理器
 * 实现与Serial-Studio相同的线程化帧提取
 */
class WorkerManager extends events_1.EventEmitter {
    workers = [];
    config;
    workerScript;
    requestCounter = 0;
    isDestroyed = false;
    loadBalanceIndex = 0;
    // 统计信息
    stats = {
        totalRequests: 0,
        completedRequests: 0,
        errorRequests: 0,
        averageProcessingTime: 0,
        activeWorkers: 0
    };
    constructor(config = {}) {
        super();
        // 默认配置
        this.config = {
            maxWorkers: Math.max(2, Math.min(8, (__webpack_require__(16).cpus)().length - 1)),
            queueSize: 1000,
            threadedFrameExtraction: true,
            ...config
        };
        // Worker脚本路径
        this.workerScript = path.join(__dirname, '../../workers/DataProcessor.js');
        this.initializeWorkerPool();
    }
    /**
     * 初始化Worker池
     * 对应Serial-Studio的startFrameReader逻辑
     */
    initializeWorkerPool() {
        for (let i = 0; i < this.config.maxWorkers; i++) {
            this.createWorker();
        }
        this.emit('poolInitialized', {
            workerCount: this.workers.length,
            threadedExtraction: this.config.threadedFrameExtraction
        });
    }
    /**
     * 创建单个Worker实例
     */
    createWorker() {
        const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            const worker = new worker_threads_1.Worker(this.workerScript, {
                // 传递必要的环境变量和选项
                env: process.env,
                // transferList可以用于优化ArrayBuffer传输
            });
            const workerInstance = {
                worker,
                state: WorkerState.Idle,
                id: workerId,
                lastUsed: Date.now(),
                pendingRequests: new Map()
            };
            // 设置Worker事件监听
            this.setupWorkerEvents(workerInstance);
            this.workers.push(workerInstance);
            this.stats.activeWorkers++;
        }
        catch (error) {
            console.error(`Failed to create worker ${workerId}:`, error);
            this.emit('workerError', { workerId, error });
        }
    }
    /**
     * 设置Worker事件监听
     */
    setupWorkerEvents(workerInstance) {
        const { worker, id } = workerInstance;
        // 处理Worker消息
        worker.on('message', (response) => {
            this.handleWorkerMessage(workerInstance, response);
        });
        // 处理Worker错误
        worker.on('error', (error) => {
            this.handleWorkerError(workerInstance, error);
        });
        // 处理Worker退出
        worker.on('exit', (code) => {
            this.handleWorkerExit(workerInstance, code);
        });
    }
    /**
     * 处理Worker消息响应
     */
    handleWorkerMessage(workerInstance, response) {
        const { id, type, data } = response;
        // 更新Worker状态
        workerInstance.state = WorkerState.Idle;
        workerInstance.lastUsed = Date.now();
        if (id && workerInstance.pendingRequests.has(id)) {
            const request = workerInstance.pendingRequests.get(id);
            clearTimeout(request.timeout);
            workerInstance.pendingRequests.delete(id);
            if (type === 'error') {
                this.stats.errorRequests++;
                request.reject(new Error(data?.message || 'Worker processing error'));
            }
            else {
                this.stats.completedRequests++;
                request.resolve(data);
            }
        }
        // 发送全局事件
        this.emit('workerResponse', { workerId: workerInstance.id, response });
        // 特殊处理帧数据
        if (type === 'frameProcessed' && data && Array.isArray(data)) {
            this.emit('framesProcessed', data);
        }
    }
    /**
     * 处理Worker错误
     */
    handleWorkerError(workerInstance, error) {
        workerInstance.state = WorkerState.Error;
        this.stats.errorRequests++;
        // 拒绝所有待处理的请求
        workerInstance.pendingRequests.forEach((request) => {
            clearTimeout(request.timeout);
            request.reject(error);
        });
        workerInstance.pendingRequests.clear();
        this.emit('workerError', { workerId: workerInstance.id, error });
        // 重启Worker
        this.restartWorker(workerInstance);
    }
    /**
     * 处理Worker退出
     */
    handleWorkerExit(workerInstance, code) {
        this.stats.activeWorkers--;
        if (code !== 0) {
            console.warn(`Worker ${workerInstance.id} exited with code ${code}`);
        }
        // 从池中移除
        const index = this.workers.indexOf(workerInstance);
        if (index !== -1) {
            this.workers.splice(index, 1);
            // 如果不是正常销毁，重新创建Worker
            if (!this.isDestroyed) {
                this.createWorker();
            }
        }
    }
    /**
     * 重启失败的Worker
     */
    restartWorker(workerInstance) {
        try {
            workerInstance.worker.terminate();
        }
        catch (error) {
            console.error('Error terminating worker:', error);
        }
        // 创建新的Worker替换
        const index = this.workers.indexOf(workerInstance);
        if (index !== -1) {
            this.workers.splice(index, 1);
            this.stats.activeWorkers--;
            this.createWorker();
        }
    }
    /**
     * 获取可用的Worker
     * 实现负载均衡算法
     */
    getAvailableWorker() {
        // 优先查找空闲Worker
        let idleWorker = this.workers.find(w => w.state === WorkerState.Idle);
        if (idleWorker) {
            return idleWorker;
        }
        // 如果没有空闲Worker，使用轮询算法
        if (this.workers.length > 0) {
            this.loadBalanceIndex = (this.loadBalanceIndex + 1) % this.workers.length;
            const worker = this.workers[this.loadBalanceIndex];
            if (worker.state !== WorkerState.Error) {
                return worker;
            }
        }
        return null;
    }
    /**
     * 向Worker发送消息
     * 对应Serial-Studio的帧处理热路径
     */
    async sendWorkerMessage(workerId, message, timeout = 5000) {
        const workerInstance = this.workers.find(w => w.id === workerId);
        if (!workerInstance) {
            throw new Error(`Worker ${workerId} not found`);
        }
        const requestId = `req_${++this.requestCounter}_${Date.now()}`;
        const messageWithId = { ...message, id: requestId };
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                workerInstance.pendingRequests.delete(requestId);
                reject(new Error(`Worker request timeout: ${message.type}`));
            }, timeout);
            workerInstance.pendingRequests.set(requestId, { resolve, reject, timeout: timeoutHandle });
            workerInstance.state = WorkerState.Busy;
            workerInstance.worker.postMessage(messageWithId);
            this.stats.totalRequests++;
        });
    }
    /**
     * 配置所有Worker
     */
    async configureWorkers(config) {
        const promises = this.workers.map(worker => this.sendWorkerMessage(worker.id, { type: 'configure', data: config }));
        await Promise.all(promises);
        this.emit('workersConfigured', config);
    }
    /**
     * 处理数据 - 主要的热路径方法
     * 对应Serial-Studio的hotpathRxFrame
     */
    async processData(data) {
        if (this.isDestroyed) {
            throw new Error('WorkerManager is destroyed');
        }
        const worker = this.getAvailableWorker();
        if (!worker) {
            throw new Error('No available workers');
        }
        const startTime = performance.now();
        try {
            const result = await this.sendWorkerMessage(worker.id, {
                type: 'processData',
                data
            });
            // 更新统计信息
            const processingTime = performance.now() - startTime;
            this.stats.averageProcessingTime =
                (this.stats.averageProcessingTime + processingTime) / 2;
            return result || [];
        }
        catch (error) {
            this.emit('processingError', { error, workerId: worker.id });
            throw error;
        }
    }
    /**
     * 批量处理数据
     */
    async processBatch(dataList) {
        if (dataList.length === 0) {
            return [];
        }
        // 将数据分配给不同的Worker并行处理
        const chunks = this.chunkArray(dataList, this.workers.length);
        const promises = chunks.map(async (chunk, index) => {
            if (chunk.length === 0) {
                return [];
            }
            const worker = this.workers[index % this.workers.length];
            if (!worker || worker.state === WorkerState.Error) {
                return [];
            }
            const results = [];
            for (const data of chunk) {
                try {
                    const frameResults = await this.processData(data);
                    results.push(...frameResults);
                }
                catch (error) {
                    console.error('Batch processing error:', error);
                }
            }
            return results;
        });
        const results = await Promise.all(promises);
        return results.flat();
    }
    /**
     * 分割数组为指定数量的块
     */
    chunkArray(array, chunkCount) {
        const chunks = [];
        const chunkSize = Math.ceil(array.length / chunkCount);
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            workerCount: this.workers.length,
            idleWorkers: this.workers.filter(w => w.state === WorkerState.Idle).length,
            busyWorkers: this.workers.filter(w => w.state === WorkerState.Busy).length,
            errorWorkers: this.workers.filter(w => w.state === WorkerState.Error).length,
            pendingRequests: this.workers.reduce((sum, w) => sum + w.pendingRequests.size, 0)
        };
    }
    /**
     * 重置所有Worker状态
     */
    async resetWorkers() {
        const promises = this.workers.map(worker => this.sendWorkerMessage(worker.id, { type: 'reset' }));
        await Promise.all(promises);
    }
    /**
     * 销毁Worker池
     */
    async destroy() {
        this.isDestroyed = true;
        // 取消所有待处理的请求，静默失败
        this.workers.forEach(worker => {
            worker.pendingRequests.forEach(request => {
                clearTimeout(request.timeout);
                // 使用一个特殊的错误类型，让调用者知道这是销毁造成的
                const destroyError = new Error('WorkerManager destroyed');
                destroyError.name = 'WorkerManagerDestroyedError';
                request.reject(destroyError);
            });
            worker.pendingRequests.clear();
        });
        // 终止所有Worker
        const terminatePromises = this.workers.map(worker => worker.worker.terminate());
        try {
            await Promise.all(terminatePromises);
        }
        catch (error) {
            // Worker 终止过程中的错误可以被忽略
            console.debug('Worker termination error (expected during cleanup):', error);
        }
        this.workers = [];
        this.stats.activeWorkers = 0;
        this.removeAllListeners();
    }
    /**
     * 检查是否启用了线程化帧提取
     * 对应Serial-Studio的m_threadedFrameExtraction
     */
    get threadedFrameExtraction() {
        return this.config.threadedFrameExtraction;
    }
    /**
     * 设置线程化帧提取状态
     */
    setThreadedFrameExtraction(enabled) {
        this.config.threadedFrameExtraction = enabled;
        this.emit('threadedExtractionChanged', enabled);
    }
}
exports.WorkerManager = WorkerManager;
exports["default"] = WorkerManager;


/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("os");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * ObjectPoolManager - 对象池统一管理器
 * 管理各种频繁分配对象的对象池，减少GC压力和内存碎片化
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.releasePerformanceMetrics = exports.acquirePerformanceMetrics = exports.releaseCommunicationStats = exports.acquireCommunicationStats = exports.releaseProcessedFrame = exports.acquireProcessedFrame = exports.releaseRawFrame = exports.acquireRawFrame = exports.releaseGroups = exports.releaseGroup = exports.acquireGroup = exports.releaseDatasets = exports.releaseDataset = exports.acquireDataset = exports.releaseDataPoints = exports.releaseDataPoint = exports.acquireDataPoint = exports.objectPoolManager = exports.ObjectPoolManager = void 0;
const MemoryManager_1 = __webpack_require__(18);
/**
 * 默认池配置
 */
const DEFAULT_POOL_CONFIGS = {
    // 高频对象 - 大容量池
    dataPoints: {
        initialSize: 200,
        maxSize: 2000,
        growthFactor: 1.5,
        shrinkThreshold: 0.3
    },
    // 中频对象 - 中等容量池
    datasets: {
        initialSize: 50,
        maxSize: 500,
        growthFactor: 1.4,
        shrinkThreshold: 0.4
    },
    groups: {
        initialSize: 20,
        maxSize: 200,
        growthFactor: 1.3,
        shrinkThreshold: 0.4
    },
    rawFrames: {
        initialSize: 30,
        maxSize: 300,
        growthFactor: 1.4,
        shrinkThreshold: 0.3
    },
    // 低频对象 - 小容量池
    processedFrames: {
        initialSize: 10,
        maxSize: 100,
        growthFactor: 1.2,
        shrinkThreshold: 0.5
    },
    stats: {
        initialSize: 5,
        maxSize: 50,
        growthFactor: 1.2,
        shrinkThreshold: 0.5
    }
};
/**
 * 对象池管理器
 * 单例模式，统一管理所有对象池
 */
class ObjectPoolManager {
    static instance = null;
    memoryManager = (0, MemoryManager_1.getMemoryManager)();
    pools = new Map();
    initialized = false;
    constructor() { }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!ObjectPoolManager.instance) {
            ObjectPoolManager.instance = new ObjectPoolManager();
        }
        return ObjectPoolManager.instance;
    }
    /**
     * 初始化所有对象池
     */
    initialize() {
        if (this.initialized) {
            return;
        }
        console.log('初始化对象池管理器...');
        // 创建DataPoint对象池
        this.createPool('dataPoints', {
            ...DEFAULT_POOL_CONFIGS.dataPoints,
            itemConstructor: () => ({ x: 0, y: 0, timestamp: 0 }),
            itemDestructor: (item) => {
                item.x = 0;
                item.y = 0;
                item.timestamp = 0;
            }
        });
        // 创建Dataset对象池
        this.createPool('datasets', {
            ...DEFAULT_POOL_CONFIGS.datasets,
            itemConstructor: () => ({
                id: '',
                title: '',
                value: null,
                widget: 'plot',
                alarm: false,
                led: false,
                log: false,
                graph: false,
                fft: false
            }),
            itemDestructor: (item) => {
                item.id = '';
                item.title = '';
                item.value = null;
                item.unit = undefined;
                item.alarm = false;
                item.led = false;
                item.log = false;
                item.graph = false;
                item.fft = false;
                item.min = undefined;
                item.max = undefined;
                item.units = undefined;
            }
        });
        // 创建Group对象池
        this.createPool('groups', {
            ...DEFAULT_POOL_CONFIGS.groups,
            itemConstructor: () => ({
                id: '',
                title: '',
                widget: 'plot',
                datasets: []
            }),
            itemDestructor: (item) => {
                item.id = '';
                item.title = '';
                item.datasets = [];
            }
        });
        // 创建RawFrame对象池
        this.createPool('rawFrames', {
            ...DEFAULT_POOL_CONFIGS.rawFrames,
            itemConstructor: () => ({
                data: new Uint8Array(0),
                timestamp: 0,
                sequence: 0
            }),
            itemDestructor: (item) => {
                item.data = new Uint8Array(0);
                item.timestamp = 0;
                item.sequence = 0;
                item.checksumValid = undefined;
            }
        });
        // 创建ProcessedFrame对象池
        this.createPool('processedFrames', {
            ...DEFAULT_POOL_CONFIGS.processedFrames,
            itemConstructor: () => ({
                groups: [],
                timestamp: 0,
                sequence: 0,
                frameId: ''
            }),
            itemDestructor: (item) => {
                // 释放groups中的对象回池
                for (const group of item.groups) {
                    this.releaseGroup(group);
                }
                item.groups = [];
                item.timestamp = 0;
                item.sequence = 0;
                item.frameId = '';
            }
        });
        // 创建统计对象池
        this.createPool('communicationStats', {
            ...DEFAULT_POOL_CONFIGS.stats,
            itemConstructor: () => ({
                bytesReceived: 0,
                bytesSent: 0,
                framesReceived: 0,
                framesSent: 0,
                errors: 0,
                reconnections: 0,
                uptime: 0
            }),
            itemDestructor: (item) => {
                item.bytesReceived = 0;
                item.bytesSent = 0;
                item.framesReceived = 0;
                item.framesSent = 0;
                item.errors = 0;
                item.reconnections = 0;
                item.uptime = 0;
            }
        });
        this.createPool('performanceMetrics', {
            ...DEFAULT_POOL_CONFIGS.stats,
            itemConstructor: () => ({
                updateFrequency: 0,
                processingLatency: 0,
                memoryUsage: 0,
                droppedFrames: 0
            }),
            itemDestructor: (item) => {
                item.updateFrequency = 0;
                item.processingLatency = 0;
                item.memoryUsage = 0;
                item.droppedFrames = 0;
                item.cpuUsage = undefined;
            }
        });
        this.initialized = true;
        console.log('对象池管理器初始化完成，创建了', this.pools.size, '个对象池');
    }
    /**
     * 创建对象池
     */
    createPool(name, config) {
        const pool = this.memoryManager.createObjectPool(name, config);
        this.pools.set(name, pool);
        return pool;
    }
    /**
     * 获取对象池
     */
    getPool(name) {
        const pool = this.pools.get(name);
        if (!pool) {
            console.warn(`对象池 '${name}' 不存在`);
            return null;
        }
        return pool;
    }
    // === DataPoint对象池操作 ===
    /**
     * 获取DataPoint对象
     */
    acquireDataPoint() {
        const pool = this.getPool('dataPoints');
        return pool ? pool.acquire() : { x: 0, y: 0, timestamp: 0 };
    }
    /**
     * 释放DataPoint对象
     */
    releaseDataPoint(dataPoint) {
        const pool = this.getPool('dataPoints');
        if (pool) {
            pool.release(dataPoint);
        }
    }
    /**
     * 批量释放DataPoint对象
     */
    releaseDataPoints(dataPoints) {
        for (const point of dataPoints) {
            this.releaseDataPoint(point);
        }
    }
    // === Dataset对象池操作 ===
    /**
     * 获取Dataset对象
     */
    acquireDataset() {
        const pool = this.getPool('datasets');
        return pool ? pool.acquire() : {
            id: '',
            title: '',
            value: null,
            widget: 'plot',
            alarm: false,
            led: false,
            log: false,
            graph: false,
            fft: false
        };
    }
    /**
     * 释放Dataset对象
     */
    releaseDataset(dataset) {
        const pool = this.getPool('datasets');
        if (pool) {
            pool.release(dataset);
        }
    }
    /**
     * 批量释放Dataset对象
     */
    releaseDatasets(datasets) {
        for (const dataset of datasets) {
            this.releaseDataset(dataset);
        }
    }
    // === Group对象池操作 ===
    /**
     * 获取Group对象
     */
    acquireGroup() {
        const pool = this.getPool('groups');
        return pool ? pool.acquire() : {
            id: '',
            title: '',
            widget: 'plot',
            datasets: []
        };
    }
    /**
     * 释放Group对象
     */
    releaseGroup(group) {
        // 先释放datasets
        this.releaseDatasets(group.datasets);
        group.datasets = [];
        const pool = this.getPool('groups');
        if (pool) {
            pool.release(group);
        }
    }
    /**
     * 批量释放Group对象
     */
    releaseGroups(groups) {
        for (const group of groups) {
            this.releaseGroup(group);
        }
    }
    // === RawFrame对象池操作 ===
    /**
     * 获取RawFrame对象
     */
    acquireRawFrame() {
        const pool = this.getPool('rawFrames');
        return pool ? pool.acquire() : {
            data: new Uint8Array(0),
            timestamp: 0,
            sequence: 0
        };
    }
    /**
     * 释放RawFrame对象
     */
    releaseRawFrame(frame) {
        const pool = this.getPool('rawFrames');
        if (pool) {
            pool.release(frame);
        }
    }
    // === ProcessedFrame对象池操作 ===
    /**
     * 获取ProcessedFrame对象
     */
    acquireProcessedFrame() {
        const pool = this.getPool('processedFrames');
        return pool ? pool.acquire() : {
            groups: [],
            timestamp: 0,
            sequence: 0,
            frameId: ''
        };
    }
    /**
     * 释放ProcessedFrame对象
     */
    releaseProcessedFrame(frame) {
        const pool = this.getPool('processedFrames');
        if (pool) {
            pool.release(frame);
        }
    }
    // === 统计对象池操作 ===
    /**
     * 获取CommunicationStats对象
     */
    acquireCommunicationStats() {
        const pool = this.getPool('communicationStats');
        return pool ? pool.acquire() : {
            bytesReceived: 0,
            bytesSent: 0,
            framesReceived: 0,
            framesSent: 0,
            errors: 0,
            reconnections: 0,
            uptime: 0
        };
    }
    /**
     * 释放CommunicationStats对象
     */
    releaseCommunicationStats(stats) {
        const pool = this.getPool('communicationStats');
        if (pool) {
            pool.release(stats);
        }
    }
    /**
     * 获取PerformanceMetrics对象
     */
    acquirePerformanceMetrics() {
        const pool = this.getPool('performanceMetrics');
        return pool ? pool.acquire() : {
            updateFrequency: 0,
            processingLatency: 0,
            memoryUsage: 0,
            droppedFrames: 0
        };
    }
    /**
     * 释放PerformanceMetrics对象
     */
    releasePerformanceMetrics(metrics) {
        const pool = this.getPool('performanceMetrics');
        if (pool) {
            pool.release(metrics);
        }
    }
    // === 管理操作 ===
    /**
     * 获取所有池的统计信息
     */
    getAllPoolStats() {
        const stats = {};
        for (const [name, pool] of this.pools.entries()) {
            stats[name] = pool.getStats();
        }
        return stats;
    }
    /**
     * 获取内存使用情况
     */
    getMemoryUsage() {
        const poolStats = this.getAllPoolStats();
        let totalObjects = 0;
        let totalMemory = 0;
        for (const stats of Object.values(poolStats)) {
            totalObjects += stats.size;
            // 估算内存使用 (每个对象约100字节)
            totalMemory += stats.size * 100;
        }
        return {
            totalPools: this.pools.size,
            totalObjects,
            totalMemory,
            poolDetails: poolStats
        };
    }
    /**
     * 优化所有对象池
     */
    optimize() {
        console.log('优化对象池...');
        // 获取统计信息进行分析
        const stats = this.getAllPoolStats();
        for (const [poolName, poolStats] of Object.entries(stats)) {
            // 如果命中率低于50%，建议减少初始大小
            if (poolStats.hitRate < 0.5) {
                console.warn(`池 '${poolName}' 命中率低: ${(poolStats.hitRate * 100).toFixed(1)}%`);
            }
            // 如果空闲对象过多，触发收缩
            if (poolStats.free > poolStats.used * 2 && poolStats.used > 0) {
                console.info(`池 '${poolName}' 空闲对象过多，建议收缩`);
            }
        }
    }
    /**
     * 清理所有对象池
     */
    clear() {
        console.log('清理所有对象池...');
        for (const pool of this.pools.values()) {
            pool.clear();
        }
    }
    /**
     * 销毁对象池管理器
     */
    destroy() {
        this.clear();
        this.pools.clear();
        this.initialized = false;
        ObjectPoolManager.instance = null;
    }
}
exports.ObjectPoolManager = ObjectPoolManager;
// 导出单例实例
exports.objectPoolManager = ObjectPoolManager.getInstance();
// 便捷函数导出
exports.acquireDataPoint = exports.objectPoolManager.acquireDataPoint, exports.releaseDataPoint = exports.objectPoolManager.releaseDataPoint, exports.releaseDataPoints = exports.objectPoolManager.releaseDataPoints, exports.acquireDataset = exports.objectPoolManager.acquireDataset, exports.releaseDataset = exports.objectPoolManager.releaseDataset, exports.releaseDatasets = exports.objectPoolManager.releaseDatasets, exports.acquireGroup = exports.objectPoolManager.acquireGroup, exports.releaseGroup = exports.objectPoolManager.releaseGroup, exports.releaseGroups = exports.objectPoolManager.releaseGroups, exports.acquireRawFrame = exports.objectPoolManager.acquireRawFrame, exports.releaseRawFrame = exports.objectPoolManager.releaseRawFrame, exports.acquireProcessedFrame = exports.objectPoolManager.acquireProcessedFrame, exports.releaseProcessedFrame = exports.objectPoolManager.releaseProcessedFrame, exports.acquireCommunicationStats = exports.objectPoolManager.acquireCommunicationStats, exports.releaseCommunicationStats = exports.objectPoolManager.releaseCommunicationStats, exports.acquirePerformanceMetrics = exports.objectPoolManager.acquirePerformanceMetrics, exports.releasePerformanceMetrics = exports.objectPoolManager.releasePerformanceMetrics;
exports["default"] = ObjectPoolManager;


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


/**
 * MemoryManager - 内存管理优化系统
 * 防止内存泄漏和GC压力，基于Serial-Studio的高性能内存管理设计
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMemoryManager = exports.MemoryManager = exports.WeakReferenceManager = exports.BufferPool = exports.ObjectPool = void 0;
/**
 * 对象池
 * 重用对象实例，减少GC压力
 */
class ObjectPool {
    pool = [];
    inUse = new Set();
    config;
    stats;
    constructor(config) {
        this.config = config;
        this.stats = {
            size: 0,
            used: 0,
            free: 0,
            hits: 0,
            misses: 0,
            hitRate: 0
        };
        // 初始化池
        this.initializePool();
    }
    /**
     * 初始化对象池
     */
    initializePool() {
        for (let i = 0; i < this.config.initialSize; i++) {
            const item = this.config.itemConstructor();
            this.pool.push(item);
        }
        this.updateStats();
    }
    /**
     * 获取对象
     */
    acquire() {
        let item;
        if (this.pool.length > 0) {
            // 从池中获取
            item = this.pool.pop();
            this.stats.hits++;
        }
        else {
            // 创建新对象
            if (this.inUse.size < this.config.maxSize) {
                item = this.config.itemConstructor();
                this.stats.misses++;
            }
            else {
                throw new Error('Object pool exhausted');
            }
        }
        this.inUse.add(item);
        this.updateStats();
        return item;
    }
    /**
     * 释放对象
     */
    release(item) {
        if (!this.inUse.has(item)) {
            console.warn('Attempting to release item not from this pool');
            return;
        }
        this.inUse.delete(item);
        // 重置对象状态
        this.resetItem(item);
        // 检查是否需要收缩池
        if (this.shouldShrink()) {
            // 销毁对象
            if (this.config.itemDestructor) {
                this.config.itemDestructor(item);
            }
        }
        else {
            // 返回池中
            this.pool.push(item);
        }
        this.updateStats();
    }
    /**
     * 重置对象状态
     */
    resetItem(item) {
        // 清理对象属性
        if (typeof item === 'object' && item !== null) {
            // 清理数组
            if (Array.isArray(item)) {
                item.length = 0;
            }
            // 清理Map和Set
            else if (item instanceof Map || item instanceof Set) {
                item.clear();
            }
            // 清理 TypedArray (包括 Uint8Array)
            else if (item instanceof Uint8Array ||
                item instanceof Int8Array ||
                item instanceof Uint16Array ||
                item instanceof Int16Array ||
                item instanceof Uint32Array ||
                item instanceof Int32Array ||
                item instanceof Float32Array ||
                item instanceof Float64Array) {
                // TypedArray 只需要填充零值，不能删除索引属性
                item.fill(0);
            }
            // 清理普通对象属性
            else {
                for (const key in item) {
                    if (item.hasOwnProperty(key) && typeof item[key] !== 'function') {
                        try {
                            delete item[key];
                        }
                        catch (error) {
                            // 如果属性不可删除，尝试设置为默认值
                            try {
                                item[key] = null;
                            }
                            catch (e) {
                                // 忽略无法设置的属性
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * 检查是否需要收缩
     */
    shouldShrink() {
        const totalSize = this.pool.length + this.inUse.size;
        const utilization = this.inUse.size / totalSize;
        return utilization < this.config.shrinkThreshold;
    }
    /**
     * 更新统计信息
     */
    updateStats() {
        this.stats.size = this.pool.length + this.inUse.size;
        this.stats.used = this.inUse.size;
        this.stats.free = this.pool.length;
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 清空池
     */
    clear() {
        // 释放所有在用对象
        this.inUse.clear();
        // 销毁池中对象
        if (this.config.itemDestructor) {
            for (const item of this.pool) {
                this.config.itemDestructor(item);
            }
        }
        this.pool = [];
        this.updateStats();
    }
}
exports.ObjectPool = ObjectPool;
/**
 * 缓冲区池
 * 专门管理字节数组的重用
 */
class BufferPool {
    pools = new Map();
    commonSizes = [64, 256, 1024, 4096, 16384, 65536]; // 常用大小
    bufferToOriginal = new WeakMap(); // 跟踪子数组到原始缓冲区的映射
    constructor() {
        // 初始化常用大小的池
        for (const size of this.commonSizes) {
            this.createPoolForSize(size);
        }
    }
    /**
     * 为指定大小创建池
     */
    createPoolForSize(size) {
        const pool = new ObjectPool({
            initialSize: 10,
            maxSize: 100,
            growthFactor: 1.5,
            shrinkThreshold: 0.3,
            itemConstructor: () => new Uint8Array(size),
            itemDestructor: () => { } // Uint8Array不需要特殊清理
        });
        this.pools.set(size, pool);
    }
    /**
     * 获取缓冲区
     */
    acquire(size) {
        // 查找最合适的池
        let bestSize = this.findBestSize(size);
        if (!bestSize) {
            // 为新尺寸创建池
            bestSize = this.roundUpToPowerOfTwo(size);
            this.createPoolForSize(bestSize);
        }
        const pool = this.pools.get(bestSize);
        const buffer = pool.acquire();
        // 如果需要的尺寸小于缓冲区，返回子数组并跟踪映射
        if (size < buffer.length) {
            const subarray = buffer.subarray(0, size);
            this.bufferToOriginal.set(subarray, buffer);
            return subarray;
        }
        return buffer;
    }
    /**
     * 释放缓冲区
     */
    release(buffer) {
        // 检查是否是子数组，如果是则获取原始缓冲区
        const originalBuffer = this.bufferToOriginal.get(buffer);
        const bufferToRelease = originalBuffer || buffer;
        const size = bufferToRelease.length;
        const pool = this.pools.get(size);
        if (pool) {
            pool.release(bufferToRelease);
            // 如果释放的是子数组，清理映射
            if (originalBuffer) {
                this.bufferToOriginal.delete(buffer);
            }
        }
        else {
            // 如果找不到对应的池，可能是外部创建的缓冲区，只记录警告
            console.warn(`Attempting to release buffer of size ${size} with no corresponding pool`);
        }
    }
    /**
     * 查找最合适的池尺寸
     */
    findBestSize(size) {
        for (const poolSize of this.pools.keys()) {
            if (poolSize >= size) {
                return poolSize;
            }
        }
        return null;
    }
    /**
     * 向上取整到二的幂次
     */
    roundUpToPowerOfTwo(size) {
        let power = 1;
        while (power < size) {
            power *= 2;
        }
        return power;
    }
    /**
     * 获取所有池的统计
     */
    getAllStats() {
        const stats = {};
        for (const [size, pool] of this.pools.entries()) {
            stats[size] = pool.getStats();
        }
        return stats;
    }
    /**
     * 清理所有池
     */
    clear() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
    }
}
exports.BufferPool = BufferPool;
/**
 * 弱引用管理器
 * 防止循环引用和内存泄漏
 */
class WeakReferenceManager {
    weakRefs = new Set();
    cleanupCallbacks = new Map();
    cleanupTimer = null;
    constructor() {
        this.startCleanupTimer();
    }
    /**
     * 添加弱引用
     */
    addWeakRef(target, cleanupCallback) {
        const weakRef = new WeakRef(target);
        this.weakRefs.add(weakRef);
        if (cleanupCallback) {
            this.cleanupCallbacks.set(weakRef, cleanupCallback);
        }
        return weakRef;
    }
    /**
     * 移除弱引用
     */
    removeWeakRef(weakRef) {
        this.weakRefs.delete(weakRef);
        const cleanupCallback = this.cleanupCallbacks.get(weakRef);
        if (cleanupCallback) {
            cleanupCallback();
            this.cleanupCallbacks.delete(weakRef);
        }
    }
    /**
     * 开始清理定时器
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, 5000); // 每5秒清理一次
    }
    /**
     * 清理已被回收的引用
     */
    cleanup() {
        const toRemove = [];
        for (const weakRef of this.weakRefs) {
            if (weakRef.deref() === undefined) {
                toRemove.push(weakRef);
            }
        }
        for (const weakRef of toRemove) {
            this.removeWeakRef(weakRef);
        }
    }
    /**
     * 获取统计信息
     */
    getStats() {
        let active = 0;
        let inactive = 0;
        for (const weakRef of this.weakRefs) {
            if (weakRef.deref() !== undefined) {
                active++;
            }
            else {
                inactive++;
            }
        }
        return {
            totalRefs: this.weakRefs.size,
            activeRefs: active,
            inactiveRefs: inactive,
            cleanupCallbacks: this.cleanupCallbacks.size
        };
    }
    /**
     * 清理资源
     */
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        // 执行所有清理回调
        for (const callback of this.cleanupCallbacks.values()) {
            try {
                callback();
            }
            catch (error) {
                console.error('Cleanup callback error:', error);
            }
        }
        this.weakRefs.clear();
        this.cleanupCallbacks.clear();
    }
}
exports.WeakReferenceManager = WeakReferenceManager;
/**
 * 内存管理器主类
 * 统一管理所有内存优化组件
 */
class MemoryManager {
    objectPools = new Map();
    bufferPool;
    weakRefManager;
    gcObserver = null;
    memoryStats;
    lastGCTime = 0;
    gcCount = 0;
    constructor() {
        this.bufferPool = new BufferPool();
        this.weakRefManager = new WeakReferenceManager();
        this.memoryStats = {
            totalAllocated: 0,
            totalUsed: 0,
            totalFree: 0,
            gcCount: 0,
            gcTime: 0,
            memoryPressure: 0,
            poolStats: {}
        };
        this.initializeGCObserver();
        this.startMemoryMonitoring();
    }
    /**
     * 初始化GC观察器
     */
    initializeGCObserver() {
        if ('PerformanceObserver' in window) {
            try {
                this.gcObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'measure' && entry.name.includes('gc')) {
                            this.gcCount++;
                            this.lastGCTime = entry.duration;
                        }
                    }
                });
                this.gcObserver.observe({ entryTypes: ['measure'] });
            }
            catch (error) {
                console.warn('GC observer not supported:', error);
            }
        }
    }
    /**
     * 开始内存监控
     */
    startMemoryMonitoring() {
        setInterval(() => {
            this.updateMemoryStats();
        }, 1000); // 每秒更新
    }
    /**
     * 创建对象池
     */
    createObjectPool(name, config) {
        const pool = new ObjectPool(config);
        this.objectPools.set(name, pool);
        return pool;
    }
    /**
     * 获取对象池
     */
    getObjectPool(name) {
        return this.objectPools.get(name) || null;
    }
    /**
     * 获取缓冲区池
     */
    getBufferPool() {
        return this.bufferPool;
    }
    /**
     * 获取弱引用管理器
     */
    getWeakRefManager() {
        return this.weakRefManager;
    }
    /**
     * 更新内存统计
     */
    updateMemoryStats() {
        // 更新池统计
        this.memoryStats.poolStats = {};
        for (const [name, pool] of this.objectPools.entries()) {
            this.memoryStats.poolStats[name] = pool.getStats();
        }
        // 更新缓冲区池统计
        const bufferStats = this.bufferPool.getAllStats();
        for (const [size, stats] of Object.entries(bufferStats)) {
            this.memoryStats.poolStats[`buffer-${size}`] = stats;
        }
        // 更新内存使用情况
        if ('memory' in performance) {
            const memory = performance.memory;
            this.memoryStats.totalAllocated = memory.totalJSHeapSize;
            this.memoryStats.totalUsed = memory.usedJSHeapSize;
            this.memoryStats.totalFree = memory.totalJSHeapSize - memory.usedJSHeapSize;
            // 计算内存压力
            this.memoryStats.memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        // 更新GC统计
        this.memoryStats.gcCount = this.gcCount;
        this.memoryStats.gcTime = this.lastGCTime;
    }
    /**
     * 获取内存统计
     */
    getMemoryStats() {
        return { ...this.memoryStats };
    }
    /**
     * 强制进行垃圾回收
     */
    forceGC() {
        if ('gc' in window) {
            window.gc();
        }
        else {
            // 模拟垃圾回收：创建大量临时对象并立即释放
            const temp = [];
            for (let i = 0; i < 1000; i++) {
                temp.push(new Array(1000).fill(0));
            }
            temp.length = 0;
        }
    }
    /**
     * 内存压力缓解
     */
    relieveMemoryPressure() {
        // 清理所有池
        for (const pool of this.objectPools.values()) {
            // 对于对象池，清理部分空闲对象
            // 这里可以添加更精细的清理逻辑
        }
        this.bufferPool.clear();
        // 强制GC
        this.forceGC();
    }
    /**
     * 检查内存泄漏
     */
    checkMemoryLeaks() {
        const leaks = [];
        const recommendations = [];
        // 检查池利用率
        for (const [name, stats] of Object.entries(this.memoryStats.poolStats)) {
            if (stats.hitRate < 0.5) {
                leaks.push(`Pool '${name}' has low hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
                recommendations.push(`Consider reducing initial size of pool '${name}'`);
            }
            if (stats.size > stats.used * 3 && stats.used > 0) {
                leaks.push(`Pool '${name}' has excessive free objects`);
                recommendations.push(`Consider implementing dynamic shrinking for pool '${name}'`);
            }
        }
        // 检查内存压力
        if (this.memoryStats.memoryPressure > 0.8) {
            leaks.push(`High memory pressure: ${(this.memoryStats.memoryPressure * 100).toFixed(1)}%`);
            recommendations.push('Consider implementing memory pressure relief');
        }
        // 检查GC频率
        if (this.gcCount > 10) {
            leaks.push(`Frequent GC activity: ${this.gcCount} collections`);
            recommendations.push('Consider using object pooling for frequently allocated objects');
        }
        return { potentialLeaks: leaks, recommendations };
    }
    /**
     * 优化内存使用
     */
    optimize() {
        const leakCheck = this.checkMemoryLeaks();
        if (leakCheck.potentialLeaks.length > 0) {
            console.warn('Memory optimization needed:', leakCheck);
            // 自动优化措施
            if (this.memoryStats.memoryPressure > 0.8) {
                this.relieveMemoryPressure();
            }
        }
    }
    /**
     * 清理资源
     */
    dispose() {
        // 清理GC观察器
        if (this.gcObserver) {
            this.gcObserver.disconnect();
            this.gcObserver = null;
        }
        // 清理所有池
        for (const pool of this.objectPools.values()) {
            pool.clear();
        }
        this.objectPools.clear();
        this.bufferPool.clear();
        this.weakRefManager.dispose();
    }
}
exports.MemoryManager = MemoryManager;
// 全局单例
let globalMemoryManager = null;
/**
 * 获取全局内存管理器实例
 */
function getMemoryManager() {
    if (!globalMemoryManager) {
        globalMemoryManager = new MemoryManager();
    }
    return globalMemoryManager;
}
exports.getMemoryManager = getMemoryManager;
exports["default"] = MemoryManager;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map
/**
 * Serial Studio VSCode Extension Main Entry Point
 * 
 * This is the main entry point for the Serial Studio VSCode extension.
 * It handles extension activation, command registration, and webview management.
 */

import * as vscode from 'vscode';
import { IOManager, ConnectionState } from './io/Manager';
import { ExtensionState, MessageType, Message, ConnectionConfig } from '../shared/types';

/**
 * Extension context and state management
 */
class SerialStudioExtension {
  private context: vscode.ExtensionContext;
  private ioManager: IOManager;
  private outputChannel: vscode.OutputChannel;
  private statusBarItem: vscode.StatusBarItem;
  private currentWebviewPanel: vscode.WebviewPanel | null = null;
  
  private extensionState: ExtensionState = {
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

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.ioManager = new IOManager();
    this.outputChannel = vscode.window.createOutputChannel('Serial Studio');
    
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left, 
      100
    );
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
  private setupIOManagerEvents(): void {
    // Handle connection state changes
    this.ioManager.on('stateChanged', (state: ConnectionState) => {
      this.extensionState.connected = state === ConnectionState.Connected;
      this.updateStatusBar(state);
      
      // Notify webview of state change
      if (this.currentWebviewPanel) {
        this.sendMessageToWebview({
          type: MessageType.CONNECTION_STATUS,
          payload: { state, connected: this.extensionState.connected }
        });
      }
    });

    // Handle frame data
    this.ioManager.on('frameReceived', (frame) => {
      // Forward frame to webview for processing
      if (this.currentWebviewPanel) {
        this.sendMessageToWebview({
          type: MessageType.FRAME_DATA,
          payload: frame
        });
      }
      
      // Log to output channel in debug mode
      if (this.isDebugMode()) {
        this.outputChannel.appendLine(`Frame received: ${frame.data.length} bytes, seq: ${frame.sequence}`);
      }
    });

    // Handle raw data
    this.ioManager.on('rawDataReceived', (data: Buffer) => {
      if (this.currentWebviewPanel) {
        this.sendMessageToWebview({
          type: MessageType.RAW_DATA,
          payload: { data: Array.from(data), timestamp: Date.now() }
        });
      }
    });

    // Handle errors
    this.ioManager.on('error', (error: Error) => {
      this.outputChannel.appendLine(`Error: ${error.message}`);
      vscode.window.showErrorMessage(`Serial Studio: ${error.message}`);
      
      if (this.currentWebviewPanel) {
        this.sendMessageToWebview({
          type: MessageType.ERROR,
          payload: { message: error.message, stack: error.stack }
        });
      }
    });

    // Handle warnings
    this.ioManager.on('warning', (message: string) => {
      this.outputChannel.appendLine(`Warning: ${message}`);
      
      if (this.currentWebviewPanel) {
        this.sendMessageToWebview({
          type: MessageType.WARNING,
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
  private registerCommands(): void {
    // Open dashboard command
    const openDashboard = vscode.commands.registerCommand(
      'serialStudio.openDashboard',
      () => this.openDashboard()
    );

    // Connect device command
    const connectDevice = vscode.commands.registerCommand(
      'serialStudio.connectDevice',
      () => this.showConnectionDialog()
    );

    // Disconnect device command
    const disconnectDevice = vscode.commands.registerCommand(
      'serialStudio.disconnectDevice',
      () => this.disconnectDevice()
    );

    // Open project editor command
    const openProjectEditor = vscode.commands.registerCommand(
      'serialStudio.openProjectEditor',
      () => this.openProjectEditor()
    );

    // Add commands to context subscriptions
    this.context.subscriptions.push(
      openDashboard,
      connectDevice,
      disconnectDevice,
      openProjectEditor,
      this.statusBarItem,
      this.outputChannel
    );
  }

  /**
   * Register extension views
   */
  private registerViews(): void {
    // Set context for when extension is enabled
    vscode.commands.executeCommand('setContext', 'serialStudio.enabled', true);
    
    // TODO: Register tree view provider for device list
  }

  /**
   * Open the main dashboard webview
   */
  private async openDashboard(): Promise<void> {
    // Check if panel already exists
    if (this.currentWebviewPanel) {
      this.currentWebviewPanel.reveal();
      return;
    }

    // Create new webview panel
    this.currentWebviewPanel = vscode.window.createWebviewPanel(
      'serialStudioDashboard',
      'Serial Studio Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, 'assets'),
          vscode.Uri.joinPath(this.context.extensionUri, 'dist')
        ]
      }
    );

    // Set webview content
    this.currentWebviewPanel.webview.html = await this.getWebviewContent();

    // Handle webview messages
    this.currentWebviewPanel.webview.onDidReceiveMessage(
      (message: Message) => this.handleWebviewMessage(message),
      undefined,
      this.context.subscriptions
    );

    // Handle panel disposal
    this.currentWebviewPanel.onDidDispose(
      () => {
        this.currentWebviewPanel = null;
      },
      null,
      this.context.subscriptions
    );

    // Send initial state to webview
    this.sendMessageToWebview({
      type: MessageType.CONNECTION_STATUS,
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
  private async showConnectionDialog(): Promise<void> {
    // For now, show a simple input dialog
    // TODO: Replace with proper connection configuration UI
    
    const portName = await vscode.window.showInputBox({
      prompt: 'Enter serial port name (e.g., COM3, /dev/ttyUSB0)',
      placeHolder: '/dev/ttyUSB0'
    });

    if (!portName) {
      return;
    }

    const baudRateStr = await vscode.window.showQuickPick(
      ['9600', '19200', '38400', '57600', '115200', '230400', '460800', '921600'],
      { placeHolder: 'Select baud rate' }
    );

    if (!baudRateStr) {
      return;
    }

    try {
      const config: ConnectionConfig = {
        type: 'uart' as any,
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
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    }
  }

  /**
   * Disconnect from current device
   */
  private async disconnectDevice(): Promise<void> {
    try {
      await this.ioManager.disconnect();
      this.extensionState.device = undefined;
      
      vscode.window.showInformationMessage('Disconnected from device');
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to disconnect: ${error}`);
    }
  }

  /**
   * Open project editor (placeholder)
   */
  private async openProjectEditor(): Promise<void> {
    vscode.window.showInformationMessage('Project editor not yet implemented');
    // TODO: Implement project editor webview
  }

  /**
   * Handle messages from webview
   */
  private async handleWebviewMessage(message: Message): Promise<void> {
    switch (message.type) {
      case MessageType.CONNECT_DEVICE:
        if (message.payload) {
          try {
            await this.ioManager.connect(message.payload);
            this.extensionState.device = message.payload;
          } catch (error) {
            this.sendMessageToWebview({
              type: MessageType.ERROR,
              payload: { message: (error as Error).message }
            });
          }
        }
        break;

      case MessageType.DISCONNECT_DEVICE:
        try {
          await this.ioManager.disconnect();
          this.extensionState.device = undefined;
        } catch (error) {
          this.sendMessageToWebview({
            type: MessageType.ERROR,
            payload: { message: (error as Error).message }
          });
        }
        break;

      case MessageType.GET_CONFIG:
        this.sendMessageToWebview({
          type: MessageType.UPDATE_CONFIG,
          payload: this.extensionState
        });
        break;

      case MessageType.EXPORT_DATA:
        // TODO: Implement data export
        this.sendMessageToWebview({
          type: MessageType.INFO,
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
  private sendMessageToWebview(message: Message): void {
    if (this.currentWebviewPanel) {
      message.timestamp = Date.now();
      this.currentWebviewPanel.webview.postMessage(message);
    }
  }

  /**
   * Get webview HTML content
   */
  private async getWebviewContent(): Promise<string> {
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
  private updateStatusBar(state: ConnectionState | string): void {
    let text: string;
    let color: string | undefined;

    switch (state) {
      case ConnectionState.Connected:
        text = '$(plug) Serial Studio: Connected';
        color = undefined; // Default color
        break;
      case ConnectionState.Connecting:
        text = '$(sync~spin) Serial Studio: Connecting...';
        color = 'yellow';
        break;
      case ConnectionState.Reconnecting:
        text = '$(sync~spin) Serial Studio: Reconnecting...';
        color = 'yellow';
        break;
      case ConnectionState.Error:
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
  private updatePerformanceMetrics(): void {
    // Calculate memory usage (simplified)
    const memUsage = process.memoryUsage();
    this.extensionState.performance.memoryUsage = memUsage.heapUsed / 1024 / 1024; // MB

    // Calculate processing latency (placeholder)
    this.extensionState.performance.processingLatency = 10; // ms
  }

  /**
   * Check if debug mode is enabled
   */
  private isDebugMode(): boolean {
    return vscode.workspace.getConfiguration('serialStudio').get('debug', false);
  }

  /**
   * Clean up extension resources
   */
  async dispose(): Promise<void> {
    await this.ioManager.destroy();
    this.statusBarItem.dispose();
    this.outputChannel.dispose();
    
    if (this.currentWebviewPanel) {
      this.currentWebviewPanel.dispose();
    }
  }
}

let extension: SerialStudioExtension | undefined;

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Serial Studio extension is now active');
  
  try {
    extension = new SerialStudioExtension(context);
    
    // Set up extension deactivation
    context.subscriptions.push({
      dispose: () => extension?.dispose()
    });
    
  } catch (error) {
    console.error('Failed to activate Serial Studio extension:', error);
    vscode.window.showErrorMessage(`Failed to activate Serial Studio: ${error}`);
  }
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
  console.log('Serial Studio extension is being deactivated');
  
  if (extension) {
    extension.dispose();
    extension = undefined;
  }
}
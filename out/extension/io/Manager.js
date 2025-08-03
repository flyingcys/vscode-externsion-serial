"use strict";
/**
 * IO Manager - Central manager for I/O operations across multiple protocols
 * Based on Serial Studio's IO::Manager implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOManager = exports.ConnectionState = void 0;
const events_1 = require("events");
const DriverFactory_1 = require("./DriverFactory");
const WorkerManager_1 = require("../workers/WorkerManager");
const ObjectPoolManager_1 = require("../../shared/ObjectPoolManager");
const types_1 = require("@shared/types");
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
            maxWorkers: Math.max(2, Math.min(4, require('os').cpus().length - 1)),
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
//# sourceMappingURL=Manager.js.map
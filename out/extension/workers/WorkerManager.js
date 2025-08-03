"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerManager = void 0;
const events_1 = require("events");
const path = __importStar(require("path"));
const worker_threads_1 = require("worker_threads");
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
            maxWorkers: Math.max(2, Math.min(8, require('os').cpus().length - 1)),
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
exports.default = WorkerManager;
//# sourceMappingURL=WorkerManager.js.map
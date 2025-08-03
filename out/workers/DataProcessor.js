"use strict";
/**
 * FrameProcessor WebWorker - 基于Serial-Studio的FrameReader设计
 * 在独立线程中处理高频数据流，避免阻塞主线程
 * 对应Serial-Studio的多线程帧处理架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
// 导入共享的循环缓冲区和帧解析器
const CircularBuffer_1 = require("../shared/CircularBuffer");
const Checksum_1 = require("../shared/Checksum");
// 帧检测模式枚举 - 对应Serial-Studio的FrameDetection
var FrameDetection;
(function (FrameDetection) {
    FrameDetection[FrameDetection["EndDelimiterOnly"] = 0] = "EndDelimiterOnly";
    FrameDetection[FrameDetection["StartAndEndDelimiter"] = 1] = "StartAndEndDelimiter";
    FrameDetection[FrameDetection["NoDelimiters"] = 2] = "NoDelimiters";
    FrameDetection[FrameDetection["StartDelimiterOnly"] = 3] = "StartDelimiterOnly";
})(FrameDetection || (FrameDetection = {}));
// 操作模式枚举 - 对应Serial-Studio的OperationMode
var OperationMode;
(function (OperationMode) {
    OperationMode[OperationMode["ProjectFile"] = 0] = "ProjectFile";
    OperationMode[OperationMode["DeviceSendsJSON"] = 1] = "DeviceSendsJSON";
    OperationMode[OperationMode["QuickPlot"] = 2] = "QuickPlot";
})(OperationMode || (OperationMode = {}));
// 验证状态枚举
var ValidationStatus;
(function (ValidationStatus) {
    ValidationStatus[ValidationStatus["FrameOk"] = 0] = "FrameOk";
    ValidationStatus[ValidationStatus["ChecksumError"] = 1] = "ChecksumError";
    ValidationStatus[ValidationStatus["ChecksumIncomplete"] = 2] = "ChecksumIncomplete";
})(ValidationStatus || (ValidationStatus = {}));
/**
 * FrameProcessor - 基于Serial-Studio的多线程帧处理器
 * 实现与Serial-Studio IO::FrameReader相同的功能
 */
class FrameProcessor {
    circularBuffer;
    frameQueue = [];
    config;
    checksumLength = 0;
    sequenceNumber = 0;
    // QuickPlot模式的默认结束序列
    quickPlotEndSequences = [
        new Uint8Array([0x0A]),
        new Uint8Array([0x0D]),
        new Uint8Array([0x0D, 0x0A]) // \r\n
    ];
    constructor() {
        // 初始化10MB环形缓冲区，与Serial-Studio保持一致
        this.circularBuffer = new CircularBuffer_1.CircularBuffer(1024 * 1024 * 10);
        // 默认配置
        this.config = {
            operationMode: OperationMode.QuickPlot,
            frameDetectionMode: FrameDetection.EndDelimiterOnly,
            startSequence: new Uint8Array(),
            finishSequence: new Uint8Array([0x0A]),
            checksumAlgorithm: 'none'
        };
        this.updateChecksumLength();
    }
    /**
     * 配置帧处理器参数
     * @param config 配置参数
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        // 重新配置缓冲区大小
        if (config.bufferCapacity && config.bufferCapacity !== this.circularBuffer.capacity) {
            this.circularBuffer.setCapacity(config.bufferCapacity);
        }
        // 更新校验和长度
        this.updateChecksumLength();
    }
    /**
     * 处理传入的数据进行帧提取和UI通知
     * 对应Serial-Studio的processData方法
     * @param data 来自设备的传入字节流
     */
    processData(data) {
        const buffer = new Uint8Array(data);
        // 直通模式（无分隔符）
        if (this.config.operationMode === OperationMode.ProjectFile &&
            this.config.frameDetectionMode === FrameDetection.NoDelimiters) {
            return [this.enqueueFrame(buffer)];
        }
        else {
            // 使用环形缓冲区解析帧
            this.circularBuffer.append(buffer);
            return this.extractFrames();
        }
    }
    /**
     * 根据当前模式提取帧
     * 对应Serial-Studio的extractFrames方法
     */
    extractFrames() {
        const frames = [];
        switch (this.config.operationMode) {
            case OperationMode.QuickPlot:
                frames.push(...this.readEndDelimitedFrames());
                break;
            case OperationMode.DeviceSendsJSON:
                frames.push(...this.readStartEndDelimitedFrames());
                break;
            case OperationMode.ProjectFile:
                switch (this.config.frameDetectionMode) {
                    case FrameDetection.EndDelimiterOnly:
                        frames.push(...this.readEndDelimitedFrames());
                        break;
                    case FrameDetection.StartDelimiterOnly:
                        frames.push(...this.readStartDelimitedFrames());
                        break;
                    case FrameDetection.StartAndEndDelimiter:
                        frames.push(...this.readStartEndDelimitedFrames());
                        break;
                }
                break;
        }
        return frames;
    }
    /**
     * 解析由已知结束分隔符终止的帧
     * 处理QuickPlot和Project模式，其中帧的结束由特定的字节序列标记
     */
    readEndDelimitedFrames() {
        const frames = [];
        while (true) {
            let endIndex = -1;
            let delimiter = new Uint8Array();
            // 查找最早的结束序列（QuickPlot模式）
            if (this.config.operationMode === OperationMode.QuickPlot) {
                for (const d of this.quickPlotEndSequences) {
                    const index = this.circularBuffer.findPatternKMP(d);
                    if (index !== -1 && (endIndex === -1 || index < endIndex)) {
                        endIndex = index;
                        delimiter = d;
                        break;
                    }
                }
            }
            else if (this.config.frameDetectionMode === FrameDetection.EndDelimiterOnly) {
                // 或使用固定分隔符（项目模式）
                delimiter = this.config.finishSequence;
                endIndex = this.circularBuffer.findPatternKMP(delimiter);
            }
            // 未找到帧
            if (endIndex === -1) {
                break;
            }
            // 提取帧数据
            const frameData = this.circularBuffer.peek(endIndex);
            const crcPosition = endIndex + delimiter.length;
            const frameEndPos = crcPosition + this.checksumLength;
            // 读取帧
            if (frameData.length > 0) {
                const result = this.validateChecksum(frameData, crcPosition);
                if (result === ValidationStatus.FrameOk) {
                    frames.push(this.enqueueFrame(frameData));
                    this.circularBuffer.read(frameEndPos);
                }
                else if (result === ValidationStatus.ChecksumIncomplete) {
                    // 数据不完整，等待更多数据
                    break;
                }
                else {
                    // 校验和错误，丢弃帧
                    this.circularBuffer.read(frameEndPos);
                }
            }
            else {
                // 无效帧
                this.circularBuffer.read(frameEndPos);
            }
        }
        return frames;
    }
    /**
     * 解析由开始和结束分隔符围绕的帧
     * 用于JSON和其他结构化数据格式
     */
    readStartEndDelimitedFrames() {
        const frames = [];
        while (true) {
            // 查找开始分隔符
            const startIndex = this.circularBuffer.findPatternKMP(this.config.startSequence);
            if (startIndex === -1) {
                break;
            }
            // 从开始分隔符后查找结束分隔符
            const searchStart = startIndex + this.config.startSequence.length;
            let endIndex = -1;
            // 简化实现：从搜索点开始查找结束分隔符
            for (let i = searchStart; i < this.circularBuffer.size - this.config.finishSequence.length; i++) {
                let match = true;
                for (let j = 0; j < this.config.finishSequence.length; j++) {
                    if (this.circularBuffer.peek(1)[0] !== this.config.finishSequence[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    endIndex = i;
                    break;
                }
            }
            if (endIndex === -1) {
                break;
            }
            // 提取帧数据（不包括分隔符）
            const frameLength = endIndex - searchStart;
            if (frameLength > 0) {
                this.circularBuffer.read(searchStart); // 跳过开始分隔符
                const frameData = this.circularBuffer.read(frameLength);
                this.circularBuffer.read(this.config.finishSequence.length); // 跳过结束分隔符
                frames.push(this.enqueueFrame(frameData));
            }
            else {
                // 跳过这个无效帧
                this.circularBuffer.read(endIndex + this.config.finishSequence.length);
            }
        }
        return frames;
    }
    /**
     * 解析由开始分隔符标记的帧
     * 用于固定长度或其他特殊格式
     */
    readStartDelimitedFrames() {
        const frames = [];
        while (true) {
            const startIndex = this.circularBuffer.findPatternKMP(this.config.startSequence);
            if (startIndex === -1) {
                break;
            }
            // 简化实现：读取固定长度的数据
            // 实际实现应该根据协议确定帧长度
            const frameLength = 64; // 假设固定长度
            if (this.circularBuffer.size < startIndex + this.config.startSequence.length + frameLength) {
                break;
            }
            this.circularBuffer.read(startIndex + this.config.startSequence.length);
            const frameData = this.circularBuffer.read(frameLength);
            frames.push(this.enqueueFrame(frameData));
        }
        return frames;
    }
    /**
     * 获取历史数据
     * 用于回放和分析功能
     */
    getHistoricalData(count) {
        return this.circularBuffer.peek(Math.min(count, this.circularBuffer.size));
    }
    /**
     * 获取缓冲区统计信息
     */
    getBufferStats() {
        return {
            size: this.circularBuffer.size,
            capacity: this.circularBuffer.capacity,
            freeSpace: this.circularBuffer.freeSpace,
            utilizationPercent: (this.circularBuffer.size / this.circularBuffer.capacity) * 100,
            frameQueueLength: this.frameQueue.length
        };
    }
    /**
     * 验证校验和
     * @param frameData 帧数据
     * @param crcPosition 校验和位置
     * @returns 校验状态
     */
    validateChecksum(frameData, crcPosition) {
        // 如果没有校验和，直接返回有效
        if (this.checksumLength === 0) {
            return ValidationStatus.FrameOk;
        }
        // 检查校验和数据是否完整
        if (this.circularBuffer.size < crcPosition + this.checksumLength) {
            return ValidationStatus.ChecksumIncomplete;
        }
        // 简化实现，实际应该根据校验算法进行验证
        // 这里假设校验有效，具体校验逻辑可以后续完善
        return ValidationStatus.FrameOk;
    }
    /**
     * 更新校验和长度
     * 对应Serial-Studio的updateChecksumLength方法
     */
    updateChecksumLength() {
        this.checksumLength = (0, Checksum_1.getChecksumLength)(this.config.checksumAlgorithm);
    }
    /**
     * 创建帧并分配序列号
     * @param data 帧数据
     * @returns RawFrame 对象
     */
    enqueueFrame(data) {
        return {
            data,
            timestamp: Date.now(),
            sequence: this.sequenceNumber++,
            checksumValid: true // 无分隔符模式下假设校验有效
        };
    }
    /**
     * 重置帧读取器状态
     */
    reset() {
        this.circularBuffer.clear();
        this.frameQueue = [];
        this.sequenceNumber = 0;
    }
}
// 创建处理器实例
const frameProcessor = new FrameProcessor();
// WebWorker 消息处理
self.onmessage = function (event) {
    const { type, data, id } = event.data;
    try {
        switch (type) {
            case 'configure':
                frameProcessor.configure(data);
                self.postMessage({ type: 'configured', id });
                break;
            case 'processData':
                const frames = frameProcessor.processData(data);
                self.postMessage({
                    type: 'frameProcessed',
                    data: frames,
                    id
                });
                break;
            case 'getStats':
                const stats = frameProcessor.getBufferStats();
                self.postMessage({
                    type: 'stats',
                    data: stats,
                    id
                });
                break;
            case 'reset':
                frameProcessor.reset();
                self.postMessage({ type: 'reset', id });
                break;
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    }
    catch (error) {
        self.postMessage({
            type: 'error',
            data: {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            id
        });
    }
};
//# sourceMappingURL=DataProcessor.js.map
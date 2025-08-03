"use strict";
/**
 * FrameReader implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's IO/FrameReader.cpp design
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameReader = void 0;
const events_1 = require("events");
const CircularBuffer_1 = require("./CircularBuffer");
const Checksum_1 = require("./Checksum");
const types_1 = require("../../shared/types");
/**
 * 多线程帧读取器类
 * 用于检测和处理流式数据中的数据帧
 * 基于Serial-Studio的IO::FrameReader设计
 */
class FrameReader extends events_1.EventEmitter {
    circularBuffer;
    frameQueue = [];
    config;
    checksumLength = 0;
    sequenceNumber = 0;
    // 快速绘图模式的默认结束序列
    quickPlotEndSequences = [
        Buffer.from('\n'),
        Buffer.from('\r'),
        Buffer.from('\r\n')
    ];
    constructor(config) {
        super();
        // 初始化10MB环形缓冲区
        this.circularBuffer = new CircularBuffer_1.CircularBuffer(1024 * 1024 * 10);
        this.config = { ...config };
        this.updateChecksumLength();
    }
    /**
     * 处理传入的数据进行帧提取和UI通知
     * @param data 来自设备的传入字节流
     */
    processData(data) {
        // 直通模式（无分隔符）
        if (this.config.operationMode === types_1.OperationMode.ProjectFile &&
            this.config.frameDetectionMode === types_1.FrameDetection.NoDelimiters) {
            this.enqueueFrame(data);
        }
        else {
            // 使用环形缓冲区解析帧
            this.circularBuffer.append(data);
            this.extractFrames();
        }
        // 通知UI有新帧可用
        this.emit('readyRead');
    }
    /**
     * 根据当前模式提取帧
     */
    extractFrames() {
        switch (this.config.operationMode) {
            case types_1.OperationMode.QuickPlot:
                this.readEndDelimitedFrames();
                break;
            case types_1.OperationMode.DeviceSendsJSON:
                this.readStartEndDelimitedFrames();
                break;
            case types_1.OperationMode.ProjectFile:
                switch (this.config.frameDetectionMode) {
                    case types_1.FrameDetection.EndDelimiterOnly:
                        this.readEndDelimitedFrames();
                        break;
                    case types_1.FrameDetection.StartDelimiterOnly:
                        this.readStartDelimitedFrames();
                        break;
                    case types_1.FrameDetection.StartAndEndDelimiter:
                        this.readStartEndDelimitedFrames();
                        break;
                }
                break;
        }
    }
    /**
     * 解析由已知结束分隔符终止的帧
     * 处理QuickPlot和Project模式，其中帧的结束由特定的字节序列标记
     */
    readEndDelimitedFrames() {
        while (true) {
            let endIndex = -1;
            let delimiter = Buffer.alloc(0);
            // 查找最早的结束序列（QuickPlot模式）
            if (this.config.operationMode === types_1.OperationMode.QuickPlot) {
                for (const d of this.quickPlotEndSequences) {
                    const index = this.circularBuffer.findPatternKMP(d);
                    if (index !== -1 && (endIndex === -1 || index < endIndex)) {
                        endIndex = index;
                        delimiter = d;
                        break;
                    }
                }
            }
            else if (this.config.frameDetectionMode === types_1.FrameDetection.EndDelimiterOnly) {
                // 或使用固定分隔符（项目模式）
                delimiter = this.config.finishSequence;
                endIndex = this.circularBuffer.findPatternKMP(delimiter);
            }
            // 未找到帧
            if (endIndex === -1) {
                break;
            }
            // 提取帧数据
            const frame = this.circularBuffer.peek(endIndex);
            const crcPosition = endIndex + delimiter.length;
            const frameEndPos = crcPosition + this.checksumLength;
            // 读取帧
            if (frame.length > 0) {
                const result = this.validateChecksum(frame, crcPosition);
                if (result === types_1.ValidationStatus.FrameOk) {
                    this.enqueueFrame(frame);
                    this.circularBuffer.read(frameEndPos);
                }
                else if (result === types_1.ValidationStatus.ChecksumIncomplete) {
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
    }
    /**
     * 解析仅由开始序列分隔的帧
     * 假设每个帧都以固定的开始模式开始，并在下一个相同模式的出现之前结束
     */
    readStartDelimitedFrames() {
        while (true) {
            // 在缓冲区中找到第一个开始分隔符
            const startIndex = this.circularBuffer.findPatternKMP(this.config.startSequence);
            if (startIndex === -1) {
                break;
            }
            // 尝试在此之后找到下一个开始分隔符
            const nextStartIndex = this.circularBuffer.findPatternKMP(this.config.startSequence, startIndex + this.config.startSequence.length);
            // 计算当前帧的开始和结束位置
            let frameEndPos;
            const frameStart = startIndex + this.config.startSequence.length;
            // 未找到第二个开始分隔符...可能是流中的最后一帧
            if (nextStartIndex === -1) {
                frameEndPos = this.circularBuffer.getSize();
                if ((frameEndPos - frameStart) < this.checksumLength) {
                    break;
                }
            }
            else {
                // 找到有效的第二个开始分隔符
                frameEndPos = nextStartIndex;
            }
            // 计算帧长度并验证其合理性
            const frameLength = frameEndPos - frameStart;
            if (frameLength <= 0) {
                this.circularBuffer.read(frameEndPos);
                continue;
            }
            // 计算校验和的位置并进行完整性检查
            const crcPosition = frameEndPos - this.checksumLength;
            if (crcPosition < frameStart) {
                this.circularBuffer.read(frameEndPos);
                continue;
            }
            // 构建帧字节数组
            const fullFrame = this.circularBuffer.peek(frameEndPos);
            const frame = fullFrame.subarray(frameStart, frameStart + frameLength - this.checksumLength);
            // 验证帧
            if (frame.length > 0) {
                const result = this.validateChecksum(frame, crcPosition);
                if (result === types_1.ValidationStatus.FrameOk) {
                    this.enqueueFrame(frame);
                    this.circularBuffer.read(frameEndPos);
                }
                else if (result === types_1.ValidationStatus.ChecksumIncomplete) {
                    // 还没有足够的字节来计算校验和，等待更多数据
                    break;
                }
                else {
                    // 无效校验和...丢弃并继续
                    this.circularBuffer.read(frameEndPos);
                }
            }
            else {
                // 空帧或无效数据，丢弃...
                this.circularBuffer.read(frameEndPos);
            }
        }
    }
    /**
     * 使用开始和结束分隔符解析帧
     * 用于JSON和Project模式，其中帧以已知字节序列开始并以另一个结束
     */
    readStartEndDelimitedFrames() {
        while (true) {
            // 定位结束分隔符
            const finishIndex = this.circularBuffer.findPatternKMP(this.config.finishSequence);
            if (finishIndex === -1) {
                break;
            }
            // 定位开始分隔符并确保它在结束之前
            const startIndex = this.circularBuffer.findPatternKMP(this.config.startSequence);
            if (startIndex === -1 || startIndex >= finishIndex) {
                this.circularBuffer.read(finishIndex + this.config.finishSequence.length);
                continue;
            }
            // 确定有效载荷边界
            const frameStart = startIndex + this.config.startSequence.length;
            const frameLength = finishIndex - frameStart;
            if (frameLength <= 0) {
                this.circularBuffer.read(finishIndex + this.config.finishSequence.length);
                continue;
            }
            // 提取帧数据
            const crcPosition = finishIndex + this.config.finishSequence.length;
            const frameEndPos = crcPosition + this.checksumLength;
            const fullFrame = this.circularBuffer.peek(frameStart + frameLength);
            const frame = fullFrame.subarray(frameStart, frameStart + frameLength);
            // 读取帧
            if (frame.length > 0) {
                const result = this.validateChecksum(frame, crcPosition);
                if (result === types_1.ValidationStatus.FrameOk) {
                    this.enqueueFrame(frame);
                    this.circularBuffer.read(frameEndPos);
                }
                else if (result === types_1.ValidationStatus.ChecksumIncomplete) {
                    // 数据不完整，等待更多数据
                    break;
                }
                else {
                    // 校验和错误
                    this.circularBuffer.read(frameEndPos);
                }
            }
            else {
                // 无效帧
                this.circularBuffer.read(frameEndPos);
            }
        }
    }
    /**
     * 验证帧的校验和
     * @param frame 提取的帧有效载荷（不包括校验和字节）
     * @param crcPosition 缓冲区中校验和开始的字节偏移量
     * @returns 验证状态
     */
    validateChecksum(frame, crcPosition) {
        // 如果校验和为空则提前停止
        if (this.checksumLength === 0) {
            return types_1.ValidationStatus.FrameOk;
        }
        // 验证我们可以读取校验和
        const buffer = this.circularBuffer.peek(this.circularBuffer.getSize());
        if (buffer.length < crcPosition + this.checksumLength) {
            return types_1.ValidationStatus.ChecksumIncomplete;
        }
        try {
            // 比较计算的与接收的校验和
            const calculated = Checksum_1.ChecksumCalculator.calculate(this.config.checksumAlgorithm, frame);
            const received = buffer.subarray(crcPosition, crcPosition + this.checksumLength);
            if (calculated.equals(received)) {
                return types_1.ValidationStatus.FrameOk;
            }
            // 记录校验和不匹配
            console.warn('Checksum validation failed:', {
                algorithm: this.config.checksumAlgorithm,
                received: received.toString('hex'),
                calculated: calculated.toString('hex'),
                frame: frame.toString('hex')
            });
            return types_1.ValidationStatus.ChecksumError;
        }
        catch (error) {
            console.error('Checksum validation error:', error);
            return types_1.ValidationStatus.ChecksumError;
        }
    }
    /**
     * 将帧加入队列
     * @param data 帧数据
     */
    enqueueFrame(data) {
        const frame = {
            data: Buffer.from(data),
            timestamp: Date.now(),
            sequence: ++this.sequenceNumber,
            checksumValid: true
        };
        this.frameQueue.push(frame);
        // 限制队列大小以防止内存泄漏
        if (this.frameQueue.length > 4096) {
            this.frameQueue.shift();
        }
    }
    /**
     * 从队列中获取下一个可用帧
     * @returns 下一个帧，如果没有可用帧则返回null
     */
    dequeueFrame() {
        return this.frameQueue.shift() || null;
    }
    /**
     * 获取队列中等待处理的帧数量
     * @returns 队列长度
     */
    getQueueLength() {
        return this.frameQueue.length;
    }
    /**
     * 清空帧队列
     */
    clearQueue() {
        this.frameQueue = [];
    }
    /**
     * 设置校验和算法
     * @param algorithm 新的校验和算法
     */
    setChecksumAlgorithm(algorithm) {
        this.config.checksumAlgorithm = algorithm;
        this.updateChecksumLength();
    }
    /**
     * 设置开始序列
     * @param sequence 新的开始序列
     */
    setStartSequence(sequence) {
        this.config.startSequence = Buffer.from(sequence);
    }
    /**
     * 设置结束序列
     * @param sequence 新的结束序列
     */
    setFinishSequence(sequence) {
        this.config.finishSequence = Buffer.from(sequence);
    }
    /**
     * 设置操作模式
     * @param mode 新的操作模式
     */
    setOperationMode(mode) {
        this.config.operationMode = mode;
        if (mode !== types_1.OperationMode.ProjectFile) {
            this.checksumLength = 0;
            this.config.checksumAlgorithm = '';
        }
    }
    /**
     * 设置帧检测模式
     * @param mode 新的帧检测模式
     */
    setFrameDetectionMode(mode) {
        this.config.frameDetectionMode = mode;
    }
    /**
     * 更新校验和长度
     */
    updateChecksumLength() {
        this.checksumLength = Checksum_1.ChecksumCalculator.getLength(this.config.checksumAlgorithm);
    }
    /**
     * 获取当前配置
     * @returns 当前配置的副本
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取缓冲区统计信息
     * @returns 缓冲区使用情况
     */
    getBufferStats() {
        return {
            size: this.circularBuffer.getSize(),
            capacity: this.circularBuffer.getCapacity(),
            utilization: this.circularBuffer.getUtilization()
        };
    }
    /**
     * 重置帧读取器状态
     */
    reset() {
        this.circularBuffer.clear();
        this.clearQueue();
        this.sequenceNumber = 0;
    }
    /**
     * 销毁帧读取器并清理资源
     */
    destroy() {
        this.reset();
        this.removeAllListeners();
    }
}
exports.FrameReader = FrameReader;
//# sourceMappingURL=FrameReader.js.map
/**
 * FrameReader - 基于Serial-Studio的FrameReader设计
 * 多线程帧读取器，支持多种帧检测模式
 */
import { CircularBuffer } from './CircularBuffer';
export type FrameDetectionMode = 'end-delimiter' | 'start-delimiter' | 'start-end-delimiter' | 'no-delimiters';
export type OperationMode = 'quick-plot' | 'project-file' | 'device-json';
export declare enum ValidationStatus {
    FrameOk = "ok",
    ChecksumError = "checksum_error",
    ChecksumIncomplete = "incomplete"
}
interface FrameReaderConfig {
    frameDetectionMode: FrameDetectionMode;
    operationMode: OperationMode;
    startSequence?: Uint8Array;
    finishSequence?: Uint8Array;
    checksumAlgorithm?: string;
}
/**
 * 高性能帧读取器
 * 模拟Serial-Studio的FrameReader类功能
 */
export declare class FrameReader {
    private checksumLength;
    private operationMode;
    private frameDetectionMode;
    private checksumAlgorithm;
    private startSequence;
    private finishSequence;
    private readonly quickPlotEndSequences;
    private frameQueue;
    constructor(config?: Partial<FrameReaderConfig>);
    /**
     * 配置帧读取器参数
     */
    configure(config: Partial<FrameReaderConfig>): void;
    /**
     * 设置校验和算法
     */
    setChecksum(algorithm: string): void;
    /**
     * 设置开始序列
     */
    setStartSequence(sequence: Uint8Array): void;
    /**
     * 设置结束序列
     */
    setFinishSequence(sequence: Uint8Array): void;
    /**
     * 设置操作模式
     */
    setOperationMode(mode: OperationMode): void;
    /**
     * 设置帧检测模式
     */
    setFrameDetectionMode(mode: FrameDetectionMode): void;
    /**
     * 从环形缓冲区提取帧数据
     * 模拟Serial-Studio的processData逻辑
     */
    extractFrames(buffer: CircularBuffer): Uint8Array[];
    /**
     * 读取以结束分隔符结尾的帧
     * 完整实现Serial-Studio的readEndDelimitedFrames方法
     */
    private readEndDelimitedFrames;
    /**
     * 读取以开始分隔符开头的帧
     * 完整实现Serial-Studio的readStartDelimitedFrames方法
     */
    private readStartDelimitedFrames;
    /**
     * 读取使用开始和结束分隔符的帧
     * 完整实现Serial-Studio的readStartEndDelimitedFrames方法
     */
    private readStartEndDelimitedFrames;
    /**
     * 验证帧的校验和
     * 完整实现Serial-Studio的checksum方法
     */
    private validateChecksum;
    /**
     * 比较两个字节数组是否相等
     */
    private arraysEqual;
    /**
     * 获取帧队列中的所有帧
     */
    getFrames(): Uint8Array[];
    /**
     * 清空帧队列
     */
    clearFrames(): void;
    /**
     * 获取配置信息
     */
    getConfig(): FrameReaderConfig;
}
export default FrameReader;
//# sourceMappingURL=FrameReader.d.ts.map
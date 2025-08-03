/**
 * FrameReader implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's IO/FrameReader.cpp design
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { FrameDetection, OperationMode, RawFrame } from '../../shared/types';
/**
 * 帧读取器配置接口
 */
export interface FrameReaderConfig {
    operationMode: OperationMode;
    frameDetectionMode: FrameDetection;
    startSequence: Buffer;
    finishSequence: Buffer;
    checksumAlgorithm: string;
}
/**
 * 多线程帧读取器类
 * 用于检测和处理流式数据中的数据帧
 * 基于Serial-Studio的IO::FrameReader设计
 */
export declare class FrameReader extends EventEmitter {
    private circularBuffer;
    private frameQueue;
    private config;
    private checksumLength;
    private sequenceNumber;
    private readonly quickPlotEndSequences;
    constructor(config: FrameReaderConfig);
    /**
     * 处理传入的数据进行帧提取和UI通知
     * @param data 来自设备的传入字节流
     */
    processData(data: Buffer): void;
    /**
     * 根据当前模式提取帧
     */
    private extractFrames;
    /**
     * 解析由已知结束分隔符终止的帧
     * 处理QuickPlot和Project模式，其中帧的结束由特定的字节序列标记
     */
    private readEndDelimitedFrames;
    /**
     * 解析仅由开始序列分隔的帧
     * 假设每个帧都以固定的开始模式开始，并在下一个相同模式的出现之前结束
     */
    private readStartDelimitedFrames;
    /**
     * 使用开始和结束分隔符解析帧
     * 用于JSON和Project模式，其中帧以已知字节序列开始并以另一个结束
     */
    private readStartEndDelimitedFrames;
    /**
     * 验证帧的校验和
     * @param frame 提取的帧有效载荷（不包括校验和字节）
     * @param crcPosition 缓冲区中校验和开始的字节偏移量
     * @returns 验证状态
     */
    private validateChecksum;
    /**
     * 将帧加入队列
     * @param data 帧数据
     */
    private enqueueFrame;
    /**
     * 从队列中获取下一个可用帧
     * @returns 下一个帧，如果没有可用帧则返回null
     */
    dequeueFrame(): RawFrame | null;
    /**
     * 获取队列中等待处理的帧数量
     * @returns 队列长度
     */
    getQueueLength(): number;
    /**
     * 清空帧队列
     */
    clearQueue(): void;
    /**
     * 设置校验和算法
     * @param algorithm 新的校验和算法
     */
    setChecksumAlgorithm(algorithm: string): void;
    /**
     * 设置开始序列
     * @param sequence 新的开始序列
     */
    setStartSequence(sequence: Buffer): void;
    /**
     * 设置结束序列
     * @param sequence 新的结束序列
     */
    setFinishSequence(sequence: Buffer): void;
    /**
     * 设置操作模式
     * @param mode 新的操作模式
     */
    setOperationMode(mode: OperationMode): void;
    /**
     * 设置帧检测模式
     * @param mode 新的帧检测模式
     */
    setFrameDetectionMode(mode: FrameDetection): void;
    /**
     * 更新校验和长度
     */
    private updateChecksumLength;
    /**
     * 获取当前配置
     * @returns 当前配置的副本
     */
    getConfig(): FrameReaderConfig;
    /**
     * 获取缓冲区统计信息
     * @returns 缓冲区使用情况
     */
    getBufferStats(): {
        size: number;
        capacity: number;
        utilization: number;
    };
    /**
     * 重置帧读取器状态
     */
    reset(): void;
    /**
     * 销毁帧读取器并清理资源
     */
    destroy(): void;
}
//# sourceMappingURL=FrameReader.d.ts.map
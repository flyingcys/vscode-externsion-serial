/**
 * FrameProcessor WebWorker - 基于Serial-Studio的FrameReader设计
 * 在独立线程中处理高频数据流，避免阻塞主线程
 * 对应Serial-Studio的多线程帧处理架构
 */
interface WorkerMessage {
    type: 'configure' | 'processData' | 'processBatch' | 'reset' | 'getStats';
    data?: any;
    id?: string;
}
interface WorkerResponse {
    type: 'configured' | 'frameProcessed' | 'batchProcessed' | 'reset' | 'stats' | 'error';
    data?: any;
    id?: string;
}
declare enum FrameDetection {
    EndDelimiterOnly = 0,
    StartAndEndDelimiter = 1,
    NoDelimiters = 2,
    StartDelimiterOnly = 3
}
declare enum OperationMode {
    ProjectFile = 0,
    DeviceSendsJSON = 1,
    QuickPlot = 2
}
interface RawFrame {
    data: Uint8Array;
    timestamp: number;
    sequence: number;
    checksumValid: boolean;
}
interface FrameProcessorConfig {
    operationMode: OperationMode;
    frameDetectionMode: FrameDetection;
    startSequence: Uint8Array;
    finishSequence: Uint8Array;
    checksumAlgorithm: string;
    bufferCapacity?: number;
}
export type { WorkerMessage, WorkerResponse, RawFrame, FrameProcessorConfig };
//# sourceMappingURL=DataProcessor.d.ts.map
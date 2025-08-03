/**
 * DataCompression - 高性能数据压缩和序列化系统
 * 基于Serial-Studio的数据传输优化设计，提升数据传输效率
 */
/**
 * 数据点接口
 */
export interface DataPoint {
    timestamp: number;
    value: number;
    sequence?: number;
}
/**
 * 压缩数据结果
 */
export interface CompressedData {
    data: Uint8Array;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
    metadata?: any;
}
/**
 * 差分编码器
 * 对时间序列数据进行差分编码，减少数据冗余
 */
export declare class DeltaEncoder {
    /**
     * 对数据点数组进行差分编码
     */
    static encode(data: DataPoint[]): {
        deltas: number[];
        baseline: DataPoint | null;
    };
    /**
     * 解码差分编码数据
     */
    static decode(deltas: number[], baseline: DataPoint): DataPoint[];
}
/**
 * 行程长度编码器（RLE）
 * 对连续相同的数值进行压缩
 */
export declare class RunLengthEncoder {
    /**
     * RLE编码
     */
    static encode(data: number[]): {
        values: number[];
        counts: number[];
    };
    /**
     * RLE解码
     */
    static decode(values: number[], counts: number[]): number[];
}
/**
 * LZ4风格的简化压缩算法
 * 适用于实时数据流的快速压缩
 */
export declare class SimpleCompressor {
    private static readonly WINDOW_SIZE;
    private static readonly MIN_MATCH_LENGTH;
    private static readonly MAX_MATCH_LENGTH;
    /**
     * 简化的字典压缩
     */
    static compress(data: Uint8Array): CompressedData;
    /**
     * 解压缩数据
     */
    static decompress(compressed: CompressedData): Uint8Array;
}
/**
 * 数据压缩管理器
 * 统一管理各种压缩算法
 */
export declare class DataCompressor {
    private static readonly COMPRESSION_THRESHOLD;
    /**
     * 自动选择最佳压缩算法
     */
    static compressAuto(data: DataPoint[]): CompressedData;
    /**
     * 解压缩数据
     */
    static decompress(compressed: CompressedData): DataPoint[];
    /**
     * 序列化未压缩数据
     */
    private static serializeUncompressed;
    /**
     * 反序列化未压缩数据
     */
    private static deserializeUncompressed;
    /**
     * 序列化Delta-RLE数据
     */
    private static serializeDeltaRLE;
    /**
     * 反序列化Delta-RLE数据
     */
    private static deserializeDeltaRLE;
    /**
     * 估算数据大小
     */
    private static estimateDataSize;
    /**
     * 获取压缩统计信息
     */
    static getCompressionStats(compressed: CompressedData): {
        algorithm: string;
        originalSize: number;
        compressedSize: number;
        compressionRatio: number;
        spaceSaved: number;
        spaceSavedPercent: number;
        metadata: any;
    };
}
export default DataCompressor;
//# sourceMappingURL=DataCompression.d.ts.map
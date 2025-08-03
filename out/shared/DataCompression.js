"use strict";
/**
 * DataCompression - 高性能数据压缩和序列化系统
 * 基于Serial-Studio的数据传输优化设计，提升数据传输效率
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCompressor = exports.SimpleCompressor = exports.RunLengthEncoder = exports.DeltaEncoder = void 0;
/**
 * 差分编码器
 * 对时间序列数据进行差分编码，减少数据冗余
 */
class DeltaEncoder {
    /**
     * 对数据点数组进行差分编码
     */
    static encode(data) {
        if (data.length === 0) {
            return { deltas: [], baseline: null };
        }
        const baseline = data[0];
        const deltas = [];
        for (let i = 1; i < data.length; i++) {
            // 计算时间差值
            const timeDelta = data[i].timestamp - data[i - 1].timestamp;
            // 计算数值差值
            const valueDelta = data[i].value - data[i - 1].value;
            // 将差值编码为单个数值（简化处理）
            deltas.push(timeDelta);
            deltas.push(valueDelta);
        }
        return { deltas, baseline };
    }
    /**
     * 解码差分编码数据
     */
    static decode(deltas, baseline) {
        if (!baseline || deltas.length === 0) {
            return baseline ? [baseline] : [];
        }
        const result = [baseline];
        let currentTime = baseline.timestamp;
        let currentValue = baseline.value;
        let sequence = baseline.sequence || 0;
        for (let i = 0; i < deltas.length; i += 2) {
            const timeDelta = deltas[i];
            const valueDelta = deltas[i + 1] || 0;
            currentTime += timeDelta;
            currentValue += valueDelta;
            sequence++;
            result.push({
                timestamp: currentTime,
                value: currentValue,
                sequence
            });
        }
        return result;
    }
}
exports.DeltaEncoder = DeltaEncoder;
/**
 * 行程长度编码器（RLE）
 * 对连续相同的数值进行压缩
 */
class RunLengthEncoder {
    /**
     * RLE编码
     */
    static encode(data) {
        if (data.length === 0) {
            return { values: [], counts: [] };
        }
        const values = [];
        const counts = [];
        let currentValue = data[0];
        let currentCount = 1;
        for (let i = 1; i < data.length; i++) {
            if (Math.abs(data[i] - currentValue) < 1e-10) { // 浮点数比较
                currentCount++;
            }
            else {
                values.push(currentValue);
                counts.push(currentCount);
                currentValue = data[i];
                currentCount = 1;
            }
        }
        // 添加最后一组
        values.push(currentValue);
        counts.push(currentCount);
        return { values, counts };
    }
    /**
     * RLE解码
     */
    static decode(values, counts) {
        if (values.length !== counts.length) {
            throw new Error('Values and counts arrays must have the same length');
        }
        const result = [];
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const count = counts[i];
            for (let j = 0; j < count; j++) {
                result.push(value);
            }
        }
        return result;
    }
}
exports.RunLengthEncoder = RunLengthEncoder;
/**
 * LZ4风格的简化压缩算法
 * 适用于实时数据流的快速压缩
 */
class SimpleCompressor {
    static WINDOW_SIZE = 4096;
    static MIN_MATCH_LENGTH = 4;
    static MAX_MATCH_LENGTH = 15;
    /**
     * 简化的字典压缩
     */
    static compress(data) {
        const originalSize = data.length;
        if (originalSize === 0) {
            return {
                data: new Uint8Array(),
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 1,
                algorithm: 'simple-lz'
            };
        }
        // 简化实现：只做简单的重复模式检测
        const compressed = [];
        let pos = 0;
        while (pos < data.length) {
            let bestMatchLength = 0;
            let bestMatchDistance = 0;
            // 在窗口内查找最优匹配
            const windowStart = Math.max(0, pos - this.WINDOW_SIZE);
            for (let i = windowStart; i < pos; i++) {
                let matchLength = 0;
                // 计算匹配长度
                while (matchLength < this.MAX_MATCH_LENGTH &&
                    pos + matchLength < data.length &&
                    data[i + matchLength] === data[pos + matchLength]) {
                    matchLength++;
                }
                // 更新最优匹配
                if (matchLength >= this.MIN_MATCH_LENGTH && matchLength > bestMatchLength) {
                    bestMatchLength = matchLength;
                    bestMatchDistance = pos - i;
                }
            }
            if (bestMatchLength >= this.MIN_MATCH_LENGTH) {
                // 输出匹配标记：负数表示匹配
                compressed.push(-bestMatchDistance);
                compressed.push(bestMatchLength);
                pos += bestMatchLength;
            }
            else {
                // 输出字面字符
                compressed.push(data[pos]);
                pos++;
            }
        }
        // 转换为字节数组
        const compressedData = new Uint8Array(compressed.length * 2); // 简化处理
        let offset = 0;
        for (const value of compressed) {
            if (value < 0) {
                // 负数：匹配距离
                compressedData[offset++] = 0xFF; // 标记位
                compressedData[offset++] = (-value) & 0xFF;
            }
            else if (offset > 0 && compressedData[offset - 2] === 0xFF) {
                // 匹配长度
                compressedData[offset++] = value & 0xFF;
            }
            else {
                // 字面字符
                compressedData[offset++] = value & 0xFF;
            }
        }
        const finalData = compressedData.slice(0, offset);
        const compressedSize = finalData.length;
        return {
            data: finalData,
            originalSize,
            compressedSize,
            compressionRatio: originalSize / compressedSize,
            algorithm: 'simple-lz'
        };
    }
    /**
     * 解压缩数据
     */
    static decompress(compressed) {
        if (compressed.originalSize === 0) {
            return new Uint8Array();
        }
        const data = compressed.data;
        const result = [];
        let pos = 0;
        while (pos < data.length) {
            if (data[pos] === 0xFF && pos + 2 < data.length) {
                // 匹配模式
                const distance = data[pos + 1];
                const length = data[pos + 2];
                // 复制匹配的数据
                const startPos = result.length - distance;
                for (let i = 0; i < length; i++) {
                    result.push(result[startPos + i]);
                }
                pos += 3;
            }
            else {
                // 字面字符
                result.push(data[pos]);
                pos++;
            }
        }
        return new Uint8Array(result);
    }
}
exports.SimpleCompressor = SimpleCompressor;
/**
 * 数据压缩管理器
 * 统一管理各种压缩算法
 */
class DataCompressor {
    static COMPRESSION_THRESHOLD = 100; // 最小压缩数据大小
    /**
     * 自动选择最佳压缩算法
     */
    static compressAuto(data) {
        if (data.length === 0) {
            return {
                data: new Uint8Array(),
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 1,
                algorithm: 'none'
            };
        }
        // 小数据集不压缩
        if (data.length < this.COMPRESSION_THRESHOLD) {
            return this.serializeUncompressed(data);
        }
        // 尝试Delta + RLE组合压缩
        const deltaResult = DeltaEncoder.encode(data);
        const rleResult = RunLengthEncoder.encode(deltaResult.deltas);
        // 序列化结果
        const serialized = this.serializeDeltaRLE({
            baseline: deltaResult.baseline,
            values: rleResult.values,
            counts: rleResult.counts
        });
        // 计算压缩效果
        const originalSize = this.estimateDataSize(data);
        const compressedSize = serialized.length;
        if (compressedSize >= originalSize * 0.8) {
            // 压缩效果不好，返回未压缩数据
            return this.serializeUncompressed(data);
        }
        return {
            data: serialized,
            originalSize,
            compressedSize,
            compressionRatio: originalSize / compressedSize,
            algorithm: 'delta-rle',
            metadata: {
                dataCount: data.length,
                baselineTimestamp: deltaResult.baseline?.timestamp,
                baselineValue: deltaResult.baseline?.value
            }
        };
    }
    /**
     * 解压缩数据
     */
    static decompress(compressed) {
        switch (compressed.algorithm) {
            case 'none':
            case 'uncompressed':
                return this.deserializeUncompressed(compressed.data);
            case 'delta-rle':
                const deltaRLEData = this.deserializeDeltaRLE(compressed.data);
                const deltas = RunLengthEncoder.decode(deltaRLEData.values, deltaRLEData.counts);
                return DeltaEncoder.decode(deltas, deltaRLEData.baseline);
            case 'simple-lz':
                const decompressed = SimpleCompressor.decompress(compressed);
                return this.deserializeUncompressed(decompressed);
            default:
                console.warn(`Unknown compression algorithm: ${compressed.algorithm}`);
                return [];
        }
    }
    /**
     * 序列化未压缩数据
     */
    static serializeUncompressed(data) {
        const buffer = new ArrayBuffer(data.length * 16); // 每个数据点16字节
        const view = new DataView(buffer);
        let offset = 0;
        for (const point of data) {
            view.setFloat64(offset, point.timestamp, true);
            view.setFloat64(offset + 8, point.value, true);
            offset += 16;
        }
        const serialized = new Uint8Array(buffer);
        return {
            data: serialized,
            originalSize: serialized.length,
            compressedSize: serialized.length,
            compressionRatio: 1,
            algorithm: 'uncompressed'
        };
    }
    /**
     * 反序列化未压缩数据
     */
    static deserializeUncompressed(data) {
        const result = [];
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        for (let offset = 0; offset + 15 < data.length; offset += 16) {
            const timestamp = view.getFloat64(offset, true);
            const value = view.getFloat64(offset + 8, true);
            result.push({ timestamp, value });
        }
        return result;
    }
    /**
     * 序列化Delta-RLE数据
     */
    static serializeDeltaRLE(data) {
        const totalSize = 24 + data.values.length * 8 + data.counts.length * 4;
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        let offset = 0;
        // 写入baseline
        if (data.baseline) {
            view.setFloat64(offset, data.baseline.timestamp, true);
            view.setFloat64(offset + 8, data.baseline.value, true);
            view.setUint32(offset + 16, data.baseline.sequence || 0, true);
        }
        offset += 20;
        // 写入数组长度
        view.setUint32(offset, data.values.length, true);
        offset += 4;
        // 写入values
        for (const value of data.values) {
            view.setFloat64(offset, value, true);
            offset += 8;
        }
        // 写入counts
        for (const count of data.counts) {
            view.setUint32(offset, count, true);
            offset += 4;
        }
        return new Uint8Array(buffer);
    }
    /**
     * 反序列化Delta-RLE数据
     */
    static deserializeDeltaRLE(data) {
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        let offset = 0;
        // 读取baseline
        const baseline = {
            timestamp: view.getFloat64(offset, true),
            value: view.getFloat64(offset + 8, true),
            sequence: view.getUint32(offset + 16, true)
        };
        offset += 20;
        // 读取数组长度
        const arrayLength = view.getUint32(offset, true);
        offset += 4;
        // 读取values
        const values = [];
        for (let i = 0; i < arrayLength; i++) {
            values.push(view.getFloat64(offset, true));
            offset += 8;
        }
        // 读取counts
        const counts = [];
        for (let i = 0; i < arrayLength; i++) {
            counts.push(view.getUint32(offset, true));
            offset += 4;
        }
        return { baseline, values, counts };
    }
    /**
     * 估算数据大小
     */
    static estimateDataSize(data) {
        return data.length * 16; // 每个数据点16字节
    }
    /**
     * 获取压缩统计信息
     */
    static getCompressionStats(compressed) {
        return {
            algorithm: compressed.algorithm,
            originalSize: compressed.originalSize,
            compressedSize: compressed.compressedSize,
            compressionRatio: compressed.compressionRatio,
            spaceSaved: compressed.originalSize - compressed.compressedSize,
            spaceSavedPercent: ((compressed.originalSize - compressed.compressedSize) / compressed.originalSize) * 100,
            metadata: compressed.metadata
        };
    }
}
exports.DataCompressor = DataCompressor;
exports.default = DataCompressor;
//# sourceMappingURL=DataCompression.js.map
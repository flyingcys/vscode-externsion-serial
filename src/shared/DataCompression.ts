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
export class DeltaEncoder {
  /**
   * 对数据点数组进行差分编码
   */
  static encode(data: DataPoint[]): { deltas: number[]; baseline: DataPoint | null } {
    if (data.length === 0) {
      return { deltas: [], baseline: null };
    }

    const baseline = data[0];
    const deltas: number[] = [];

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
  static decode(deltas: number[], baseline: DataPoint): DataPoint[] {
    if (!baseline || deltas.length === 0) {
      return baseline ? [baseline] : [];
    }

    const result: DataPoint[] = [baseline];
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

/**
 * 行程长度编码器（RLE）
 * 对连续相同的数值进行压缩
 */
export class RunLengthEncoder {
  /**
   * RLE编码
   */
  static encode(data: number[]): { values: number[]; counts: number[] } {
    if (data.length === 0) {
      return { values: [], counts: [] };
    }

    const values: number[] = [];
    const counts: number[] = [];
    
    let currentValue = data[0];
    let currentCount = 1;

    for (let i = 1; i < data.length; i++) {
      if (Math.abs(data[i] - currentValue) < 1e-10) { // 浮点数比较
        currentCount++;
      } else {
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
  static decode(values: number[], counts: number[]): number[] {
    if (values.length !== counts.length) {
      throw new Error('Values and counts arrays must have the same length');
    }

    const result: number[] = [];
    
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

/**
 * LZ4风格的简化压缩算法
 * 适用于实时数据流的快速压缩
 */
export class SimpleCompressor {
  private static readonly WINDOW_SIZE = 4096;
  private static readonly MIN_MATCH_LENGTH = 4;
  private static readonly MAX_MATCH_LENGTH = 15;

  /**
   * 增强的字典压缩 - 使用哈希表加速匹配，优化压缩比
   */
  static compress(data: Uint8Array): CompressedData {
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

    // 改进的压缩策略：
    // 1. 增大窗口大小以找到更多匹配
    // 2. 降低最小匹配长度以压缩更多重复
    // 3. 添加字节频率分析优化
    const ENHANCED_WINDOW_SIZE = 8192; // 增大窗口
    const ENHANCED_MIN_MATCH = 3; // 降低最小匹配长度
    
    // 预处理：字节频率分析
    const frequencies = new Uint32Array(256);
    for (let i = 0; i < data.length; i++) {
      frequencies[data[i]]++;
    }
    
    // 使用哈希表加速字符串匹配
    const hashTable = new Map<number, number[]>();
    const compressed: number[] = [];
    let pos = 0;

    // 改进的哈希函数 - 使用更多字节提高匹配精度
    const hash = (pos: number): number => {
      if (pos + 3 >= data.length) return 0;
      // 使用4字节哈希提高匹配质量
      return ((data[pos] << 24) | (data[pos + 1] << 16) | (data[pos + 2] << 8) | (data[pos + 3] || 0)) >>> 0;
    };

    while (pos < data.length) {
      let bestMatchLength = 0;
      let bestMatchDistance = 0;
      
      // 如果有足够的数据计算哈希
      if (pos + 3 < data.length) {
        const hashValue = hash(pos);
        const matches = hashTable.get(hashValue) || [];
        
        // 在哈希匹配中查找最优匹配
        for (const matchPos of matches) {
          if (pos - matchPos > ENHANCED_WINDOW_SIZE) continue;
          
          let matchLength = 0;
          
          // 计算匹配长度
          while (
            matchLength < this.MAX_MATCH_LENGTH &&
            pos + matchLength < data.length &&
            matchPos + matchLength < pos &&
            data[matchPos + matchLength] === data[pos + matchLength]
          ) {
            matchLength++;
          }
          
          // 更新最优匹配 - 使用增强的最小匹配长度
          if (matchLength >= ENHANCED_MIN_MATCH && matchLength > bestMatchLength) {
            bestMatchLength = matchLength;
            bestMatchDistance = pos - matchPos;
          }
        }
        
        // 将当前位置加入哈希表
        if (!hashTable.has(hashValue)) {
          hashTable.set(hashValue, []);
        }
        hashTable.get(hashValue)!.push(pos);
        
        // 限制哈希表条目数量，避免内存过度使用
        if (hashTable.get(hashValue)!.length > 16) {
          hashTable.get(hashValue)!.shift();
        }
      }
      
      if (bestMatchLength >= ENHANCED_MIN_MATCH) {
        // 输出匹配：使用特殊编码
        compressed.push(0x80 | (bestMatchLength - ENHANCED_MIN_MATCH)); // 长度编码
        compressed.push(bestMatchDistance & 0xFF); // 距离低位
        if (bestMatchDistance > 255) {
          compressed.push((bestMatchDistance >> 8) & 0xFF); // 距离高位
        }
        pos += bestMatchLength;
      } else {
        // 输出字面字符
        compressed.push(data[pos]);
        pos++;
      }
    }

    // 更高效的字节数组转换
    const compressedData = new Uint8Array(compressed);
    
    return {
      data: compressedData,
      originalSize,
      compressedSize: compressedData.length,
      compressionRatio: originalSize / compressedData.length,
      algorithm: 'simple-lz'
    };
  }

  /**
   * 解压缩数据 - 与增强压缩算法兼容
   */
  static decompress(compressed: CompressedData): Uint8Array {
    if (compressed.originalSize === 0) {
      return new Uint8Array();
    }

    const data = compressed.data;
    const result: number[] = [];
    let pos = 0;
    const ENHANCED_MIN_MATCH = 3; // 与压缩算法保持一致

    while (pos < data.length) {
      if ((data[pos] & 0x80) !== 0) {
        // 匹配模式：最高位为1
        const length = (data[pos] & 0x7F) + ENHANCED_MIN_MATCH;
        pos++;
        
        if (pos >= data.length) break;
        
        let distance = data[pos++];
        
        // 检查是否有高位距离字节
        if (distance === 0 && pos < data.length) {
          distance = data[pos++];
          distance = (distance << 8) | data[pos++];
        }
        
        // 复制匹配的数据
        const startPos = result.length - distance;
        for (let i = 0; i < length; i++) {
          if (startPos + i >= 0 && startPos + i < result.length) {
            result.push(result[startPos + i]);
          }
        }
      } else {
        // 字面字符
        result.push(data[pos]);
        pos++;
      }
    }

    return new Uint8Array(result);
  }
}

/**
 * 数据压缩管理器
 * 统一管理各种压缩算法
 */
export class DataCompressor {
  private static readonly COMPRESSION_THRESHOLD = 100; // 最小压缩数据大小

  /**
   * 自动选择最佳压缩算法
   */
  static compressAuto(data: DataPoint[]): CompressedData {
    if (data.length === 0) {
      return {
        data: new Uint8Array(),
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: 'none'
      };
    }

    // 尝试多种压缩策略，选择最优结果
    const strategies = [
      () => this.compressDeltaRLE(data),
      () => this.compressWithQuantization(data),
      () => this.compressWithLZ(data)
    ];

    let bestResult: CompressedData | null = null;
    
    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (!bestResult || result.compressionRatio > bestResult.compressionRatio) {
          bestResult = result;
        }
      } catch (error) {
        console.warn('Compression strategy failed:', error);
      }
    }

    // 如果所有压缩策略都失败，返回未压缩数据
    if (!bestResult) {
      return this.serializeUncompressed(data);
    }

    return bestResult;
  }

  /**
   * Delta + RLE压缩策略
   */
  private static compressDeltaRLE(data: DataPoint[]): CompressedData {
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
   * 量化压缩策略 - 减少精度以提高压缩比
   */
  private static compressWithQuantization(data: DataPoint[]): CompressedData {
    // 量化数据以减少熵
    const quantizedData = data.map(point => ({
      timestamp: Math.round(point.timestamp / 100) * 100, // 时间戳量化到最近100ms
      value: Math.round(point.value * 100) / 100, // 数值量化到2位小数
      sequence: point.sequence
    }));

    // 使用Delta + RLE压缩量化数据
    const deltaResult = DeltaEncoder.encode(quantizedData);
    const rleResult = RunLengthEncoder.encode(deltaResult.deltas);
    
    const serialized = this.serializeDeltaRLE({
      baseline: deltaResult.baseline,
      values: rleResult.values,
      counts: rleResult.counts
    });

    const originalSize = this.estimateDataSize(data);
    const compressedSize = serialized.length;
    
    return {
      data: serialized,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
      algorithm: 'quantized-delta-rle',
      metadata: {
        dataCount: data.length,
        quantization: { timestampStep: 100, valuePrecision: 2 }
      }
    };
  }

  /**
   * LZ风格压缩策略
   */
  private static compressWithLZ(data: DataPoint[]): CompressedData {
    // 先序列化为字节数组
    const uncompressed = this.serializeUncompressed(data);
    
    // 使用简化LZ压缩
    const lzResult = SimpleCompressor.compress(uncompressed.data);
    
    return {
      data: lzResult.data,
      originalSize: lzResult.originalSize,
      compressedSize: lzResult.compressedSize,
      compressionRatio: lzResult.compressionRatio,
      algorithm: 'simple-lz',
      metadata: {
        dataCount: data.length
      }
    };
  }

  /**
   * 解压缩数据
   */
  static decompress(compressed: CompressedData): DataPoint[] {
    switch (compressed.algorithm) {
      case 'none':
      case 'uncompressed':
        return this.deserializeUncompressed(compressed.data);
      
      case 'delta-rle':
      case 'quantized-delta-rle':
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
  private static serializeUncompressed(data: DataPoint[]): CompressedData {
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
  private static deserializeUncompressed(data: Uint8Array): DataPoint[] {
    const result: DataPoint[] = [];
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
  private static serializeDeltaRLE(data: {
    baseline: DataPoint | null;
    values: number[];
    counts: number[];
  }): Uint8Array {
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
  private static deserializeDeltaRLE(data: Uint8Array): {
    baseline: DataPoint;
    values: number[];
    counts: number[];
  } {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;

    // 读取baseline
    const baseline: DataPoint = {
      timestamp: view.getFloat64(offset, true),
      value: view.getFloat64(offset + 8, true),
      sequence: view.getUint32(offset + 16, true)
    };
    offset += 20;

    // 读取数组长度
    const arrayLength = view.getUint32(offset, true);
    offset += 4;

    // 读取values
    const values: number[] = [];
    for (let i = 0; i < arrayLength; i++) {
      values.push(view.getFloat64(offset, true));
      offset += 8;
    }

    // 读取counts
    const counts: number[] = [];
    for (let i = 0; i < arrayLength; i++) {
      counts.push(view.getUint32(offset, true));
      offset += 4;
    }

    return { baseline, values, counts };
  }

  /**
   * 估算数据大小
   */
  private static estimateDataSize(data: DataPoint[]): number {
    return data.length * 16; // 每个数据点16字节
  }

  /**
   * 获取压缩统计信息
   */
  static getCompressionStats(compressed: CompressedData) {
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

export default DataCompressor;

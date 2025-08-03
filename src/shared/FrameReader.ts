/**
 * FrameReader - 基于Serial-Studio的FrameReader设计
 * 多线程帧读取器，支持多种帧检测模式
 */

import { CircularBuffer } from './CircularBuffer';
import { checksum, checksumFunctionMap } from './Checksum';

export type FrameDetectionMode = 'end-delimiter' | 'start-delimiter' | 'start-end-delimiter' | 'no-delimiters';
export type OperationMode = 'quick-plot' | 'project-file' | 'device-json';

export enum ValidationStatus {
  FrameOk = 'ok',
  ChecksumError = 'checksum_error',
  ChecksumIncomplete = 'incomplete'
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
export class FrameReader {
  private checksumLength: number = 0;
  private operationMode: OperationMode = 'quick-plot';
  private frameDetectionMode: FrameDetectionMode = 'end-delimiter';
  
  private checksumAlgorithm: string = '';
  private startSequence: Uint8Array = new Uint8Array();
  private finishSequence: Uint8Array = new Uint8Array();
  
  // QuickPlot模式的默认结束分隔符
  private readonly quickPlotEndSequences: Uint8Array[] = [
    new TextEncoder().encode('\n'),
    new TextEncoder().encode('\r'),
    new TextEncoder().encode('\r\n')
  ];
  
  private frameQueue: Uint8Array[] = [];

  constructor(config?: Partial<FrameReaderConfig>) {
    if (config) {
      this.configure(config);
    }
  }

  /**
   * 配置帧读取器参数
   */
  configure(config: Partial<FrameReaderConfig>): void {
    if (config.frameDetectionMode) {
      this.frameDetectionMode = config.frameDetectionMode;
    }
    if (config.operationMode) {
      this.operationMode = config.operationMode;
    }
    if (config.startSequence) {
      this.startSequence = config.startSequence;
    }
    if (config.finishSequence) {
      this.finishSequence = config.finishSequence;
    }
    if (config.checksumAlgorithm) {
      this.setChecksum(config.checksumAlgorithm);
    }
  }

  /**
   * 设置校验和算法
   */
  setChecksum(algorithm: string): void {
    this.checksumAlgorithm = algorithm;
    const checksumFunctions = checksumFunctionMap();
    const checksumFunction = checksumFunctions.get(algorithm);
    
    if (checksumFunction) {
      // 计算校验和长度
      const testResult = checksumFunction(new Uint8Array(), 0);
      this.checksumLength = testResult.length;
    } else {
      this.checksumLength = 0;
    }
  }

  /**
   * 设置开始序列
   */
  setStartSequence(sequence: Uint8Array): void {
    this.startSequence = sequence;
  }

  /**
   * 设置结束序列
   */
  setFinishSequence(sequence: Uint8Array): void {
    this.finishSequence = sequence;
  }

  /**
   * 设置操作模式
   */
  setOperationMode(mode: OperationMode): void {
    this.operationMode = mode;
    if (mode !== 'project-file') {
      this.checksumLength = 0;
      this.checksumAlgorithm = '';
    }
  }

  /**
   * 设置帧检测模式
   */
  setFrameDetectionMode(mode: FrameDetectionMode): void {
    this.frameDetectionMode = mode;
  }

  /**
   * 从环形缓冲区提取帧数据
   * 模拟Serial-Studio的processData逻辑
   */
  extractFrames(buffer: CircularBuffer): Uint8Array[] {
    this.frameQueue = [];
    
    // 无分隔符模式，直接返回整个缓冲区数据
    if (this.operationMode === 'project-file' && this.frameDetectionMode === 'no-delimiters') {
      if (buffer.size > 0) {
        const data = buffer.read(buffer.size);
        this.frameQueue.push(data);
      }
      return this.frameQueue;
    }

    // 根据操作模式提取帧
    switch (this.operationMode) {
      case 'quick-plot':
        this.readEndDelimitedFrames(buffer);
        break;
      case 'device-json':
        this.readStartEndDelimitedFrames(buffer);
        break;
      case 'project-file':
        switch (this.frameDetectionMode) {
          case 'end-delimiter':
            this.readEndDelimitedFrames(buffer);
            break;
          case 'start-delimiter':
            this.readStartDelimitedFrames(buffer);
            break;
          case 'start-end-delimiter':
            this.readStartEndDelimitedFrames(buffer);
            break;
        }
        break;
    }

    return this.frameQueue;
  }

  /**
   * 读取以结束分隔符结尾的帧
   * 完整实现Serial-Studio的readEndDelimitedFrames方法
   */
  private readEndDelimitedFrames(buffer: CircularBuffer): void {
    while (true) {
      let endIndex = -1;
      let delimiter = new Uint8Array();

      // 查找最早的结束序列（QuickPlot模式）
      if (this.operationMode === 'quick-plot') {
        for (const d of this.quickPlotEndSequences) {
          const index = buffer.findPatternKMP(d);
          if (index !== -1 && (endIndex === -1 || index < endIndex)) {
            endIndex = index;
            delimiter = d;
            break;
          }
        }
      }
      // 或使用固定分隔符（项目模式）
      else if (this.frameDetectionMode === 'end-delimiter') {
        delimiter = this.finishSequence;
        endIndex = buffer.findPatternKMP(delimiter);
      }

      // 未找到帧
      if (endIndex === -1) {
        break;
      }

      // 提取帧数据
      const frame = buffer.peek(endIndex);
      const crcPosition = endIndex + delimiter.length;
      const frameEndPos = crcPosition + this.checksumLength;

      // 读取帧
      if (frame.length > 0) {
        // 验证校验和并注册帧
        const result = this.validateChecksum(frame, buffer, crcPosition);
        if (result === ValidationStatus.FrameOk) {
          this.frameQueue.push(frame.slice()); // 创建副本
          buffer.read(frameEndPos);
        }
        // 数据不完整，无法计算校验和
        else if (result === ValidationStatus.ChecksumIncomplete) {
          break;
        }
        // 错誤的校验和
        else {
          buffer.read(frameEndPos);
        }
      }
      // 无效帧
      else {
        buffer.read(frameEndPos);
      }
    }
  }

  /**
   * 读取以开始分隔符开头的帧
   * 完整实现Serial-Studio的readStartDelimitedFrames方法
   */
  private readStartDelimitedFrames(buffer: CircularBuffer): void {
    while (true) {
      // 在缓冲区中查找第一个开始分隔符
      const startIndex = buffer.findPatternKMP(this.startSequence);
      if (startIndex === -1) {
        break;
      }

      // 尝试在这个后找到下一个开始分隔符
      const nextStartIndex = buffer.findPatternKMP(
        this.startSequence,
        startIndex + this.startSequence.length
      );

      // 计算当前帧的开始和结束位置
      let frameEndPos: number;
      const frameStart = startIndex + this.startSequence.length;

      // 没有找到第二个开始分隔符，可能是流中的最后一帧
      if (nextStartIndex === -1) {
        frameEndPos = buffer.size;
        if (frameEndPos - frameStart < this.checksumLength) {
          break;
        }
      }
      // 找到有效的第二个开始分隔符
      else {
        frameEndPos = nextStartIndex;
      }

      // 计算帧长度并验证合理性
      const frameLength = frameEndPos - frameStart;
      if (frameLength <= 0) {
        buffer.read(frameEndPos);
        continue;
      }

      // 计算校验和位置并验证合理性
      const crcPosition = frameEndPos - this.checksumLength;
      if (crcPosition < frameStart) {
        buffer.read(frameEndPos);
        continue;
      }

      // 构建帧字节数组
      const fullData = buffer.peek(frameEndPos);
      const frame = fullData.slice(frameStart, frameStart + frameLength - this.checksumLength);

      // 验证帧
      if (frame.length > 0) {
        // 执行校验和算法并注册帧
        const result = this.validateChecksum(frame, buffer, crcPosition);
        if (result === ValidationStatus.FrameOk) {
          this.frameQueue.push(frame.slice());
          buffer.read(frameEndPos);
        }
        // 还没有足够的字节来计算校验和，等待更多
        else if (result === ValidationStatus.ChecksumIncomplete) {
          break;
        }
        // 无效校验和，丢弃并继续
        else {
          buffer.read(frameEndPos);
        }
      }
      // 空帧或无效数据，丢弃
      else {
        buffer.read(frameEndPos);
      }
    }
  }

  /**
   * 读取使用开始和结束分隔符的帧
   * 完整实现Serial-Studio的readStartEndDelimitedFrames方法
   */
  private readStartEndDelimitedFrames(buffer: CircularBuffer): void {
    while (true) {
      // 定位结束分隔符
      const finishIndex = buffer.findPatternKMP(this.finishSequence);
      if (finishIndex === -1) {
        break;
      }

      // 定位开始分隔符并确保它在结束之前
      const startIndex = buffer.findPatternKMP(this.startSequence);
      if (startIndex === -1 || startIndex >= finishIndex) {
        buffer.read(finishIndex + this.finishSequence.length);
        continue;
      }

      // 确定载荷边界
      const frameStart = startIndex + this.startSequence.length;
      const frameLength = finishIndex - frameStart;
      if (frameLength <= 0) {
        buffer.read(finishIndex + this.finishSequence.length);
        continue;
      }

      // 提取帧数据
      const crcPosition = finishIndex + this.finishSequence.length;
      const frameEndPos = crcPosition + this.checksumLength;
      const fullData = buffer.peek(frameStart + frameLength);
      const frame = fullData.slice(frameStart, frameStart + frameLength);

      // 读取帧
      if (frame.length > 0) {
        // 验证校验和并注册帧
        const result = this.validateChecksum(frame, buffer, crcPosition);
        if (result === ValidationStatus.FrameOk) {
          this.frameQueue.push(frame.slice());
          buffer.read(frameEndPos);
        }
        // 数据不完整，无法计算校验和
        else if (result === ValidationStatus.ChecksumIncomplete) {
          break;
        }
        // 错誤的校验和
        else {
          buffer.read(frameEndPos);
        }
      }
      // 无效帧
      else {
        buffer.read(frameEndPos);
      }
    }
  }

  /**
   * 验证帧的校验和
   * 完整实现Serial-Studio的checksum方法
   */
  private validateChecksum(
    frame: Uint8Array,
    buffer: CircularBuffer,
    crcPosition: number
  ): ValidationStatus {
    // 如果校验和为空，早期停止
    if (this.checksumLength === 0) {
      return ValidationStatus.FrameOk;
    }

    // 验证我们可以读取校验和
    const bufferData = buffer.peek(buffer.size);
    if (bufferData.length < crcPosition + this.checksumLength) {
      return ValidationStatus.ChecksumIncomplete;
    }

    // 比较实际与接收的校验和
    const calculated = checksum(this.checksumAlgorithm, frame);
    const received = bufferData.slice(crcPosition, crcPosition + this.checksumLength);
    
    if (this.arraysEqual(calculated, received)) {
      return ValidationStatus.FrameOk;
    }

    // 记录校验和不匹配
    console.warn('Checksum failed:', {
      algorithm: this.checksumAlgorithm,
      received: Array.from(received).map(b => b.toString(16).padStart(2, '0')).join(' '),
      calculated: Array.from(calculated).map(b => b.toString(16).padStart(2, '0')).join(' '),
      frame: Array.from(frame).map(b => b.toString(16).padStart(2, '0')).join(' ')
    });

    return ValidationStatus.ChecksumError;
  }

  /**
   * 比较两个字节数组是否相等
   */
  private arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {return false;}
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {return false;}
    }
    return true;
  }

  /**
   * 获取帧队列中的所有帧
   */
  getFrames(): Uint8Array[] {
    const frames = this.frameQueue.slice();
    this.frameQueue = [];
    return frames;
  }

  /**
   * 清空帧队列
   */
  clearFrames(): void {
    this.frameQueue = [];
  }

  /**
   * 获取配置信息
   */
  getConfig(): FrameReaderConfig {
    return {
      frameDetectionMode: this.frameDetectionMode,
      operationMode: this.operationMode,
      startSequence: this.startSequence,
      finishSequence: this.finishSequence,
      checksumAlgorithm: this.checksumAlgorithm
    };
  }
}

export default FrameReader;

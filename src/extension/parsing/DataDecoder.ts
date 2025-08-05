/**
 * DataDecoder implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's data decoding architecture
 */

import { DecoderMethod } from '../../shared/types';

/**
 * 数据解码器类
 * 支持多种数据格式的解码：纯文本、十六进制、Base64、二进制
 */
export class DataDecoder {
  /**
   * 解码数据帧
   * @param data 原始数据
   * @param method 解码方法
   * @returns 解码后的字符串
   */
  static decode(data: Buffer, method: DecoderMethod): string {
    try {
      switch (method) {
        case DecoderMethod.PlainText:
          return this.decodePlainText(data);
        
        case DecoderMethod.Hexadecimal:
          return this.decodeHexadecimal(data);
        
        case DecoderMethod.Base64:
          return this.decodeBase64(data);
        
        case DecoderMethod.Binary:
          return this.decodeBinary(data);
        
        default:
          throw new Error(`Unsupported decoder method: ${method}`);
      }
    } catch (error) {
      console.error('Data decoding error:', error);
      return data.toString('utf8', 0, Math.min(data.length, 1024)); // 回退到UTF-8
    }
  }

  /**
   * 纯文本解码
   * @param data 原始数据
   * @returns UTF-8字符串
   */
  private static decodePlainText(data: Buffer): string {
    return data.toString('utf8');
  }

  /**
   * 十六进制解码
   * 将十六进制字符串转换为原始数据，然后解码为文本
   * @param data 十六进制数据
   * @returns 解码后的字符串
   */
  private static decodeHexadecimal(data: Buffer): string {
    try {
      // 将Buffer转换为十六进制字符串
      const hexString = data.toString('utf8').replace(/[^0-9A-Fa-f]/g, '');
      
      // 确保长度为偶数
      const paddedHex = hexString.length % 2 === 0 ? hexString : '0' + hexString;
      
      // 转换为Buffer并解码
      const decoded = Buffer.from(paddedHex, 'hex');
      return decoded.toString('utf8');
    } catch (error) {
      // 如果十六进制解码失败，回退到原始数据
      return data.toString('utf8');
    }
  }

  /**
   * Base64解码
   * @param data Base64编码的数据
   * @returns 解码后的字符串
   */
  private static decodeBase64(data: Buffer): string {
    try {
      const base64String = data.toString('utf8').replace(/[^A-Za-z0-9+/=]/g, '');
      const decoded = Buffer.from(base64String, 'base64');
      return decoded.toString('utf8');
    } catch (error) {
      // 如果Base64解码失败，回退到原始数据
      return data.toString('utf8');
    }
  }

  /**
   * 二进制解码
   * 将每个字节表示为其数值
   * @param data 二进制数据
   * @returns 以逗号分隔的字节值字符串
   */
  private static decodeBinary(data: Buffer): string {
    const values: string[] = [];
    for (const byte of data) {
      values.push(byte.toString());
    }
    return values.join(',');
  }

  /**
   * 编码数据（用于测试和验证）
   * @param text 要编码的文本
   * @param method 编码方法
   * @returns 编码后的Buffer
   */
  static encode(text: string, method: DecoderMethod): Buffer {
    try {
      switch (method) {
        case DecoderMethod.PlainText:
          return Buffer.from(text, 'utf8');
        
        case DecoderMethod.Hexadecimal:
          return Buffer.from(Buffer.from(text, 'utf8').toString('hex'), 'utf8');
        
        case DecoderMethod.Base64:
          return Buffer.from(Buffer.from(text, 'utf8').toString('base64'), 'utf8');
        
        case DecoderMethod.Binary:
          // 将逗号分隔的数值字符串转换为字节
          const values = text.split(',').map(v => parseInt(v.trim(), 10));
          return Buffer.from(values.filter(v => !isNaN(v) && v >= 0 && v <= 255));
        
        default:
          throw new Error(`Unsupported encoder method: ${method}`);
      }
    } catch (error) {
      console.error('Data encoding error:', error);
      return Buffer.from(text, 'utf8');
    }
  }

  /**
   * 检测数据格式
   * 尝试自动检测数据是什么格式
   * @param data 要检测的数据
   * @returns 检测到的格式
   */
  static detectFormat(data: Buffer): DecoderMethod {
    const text = data.toString('utf8');
    
    // 空数据默认为纯文本
    if (text.length === 0) {
      return DecoderMethod.PlainText;
    }
    
    // 检查是否为二进制数值序列（优先级较高，因为更具体）
    if (this.isValidBinary(text)) {
      return DecoderMethod.Binary;
    }
    
    // 检查是否为十六进制（在Base64之前检查，因为纯十六进制更明确）
    if (this.isValidHex(text)) {
      return DecoderMethod.Hexadecimal;
    }
    
    // 检查是否为Base64
    if (this.isValidBase64(text)) {
      return DecoderMethod.Base64;
    }
    
    // 默认为纯文本
    return DecoderMethod.PlainText;
  }

  /**
   * 检查字符串是否为有效的Base64
   */
  private static isValidBase64(str: string): boolean {
    try {
      // 如果包含逗号，通常不是Base64格式
      if (str.includes(',')) {
        return false;
      }
      
      const cleaned = str.replace(/[^A-Za-z0-9+/=]/g, '');
      // 如果清理后的字符串与原字符串差异太大，说明包含太多非Base64字符
      // 但是要允许空格和换行符，这些在Base64中是常见的
      if (cleaned.length < str.length * 0.7) {
        return false;
      }
      // Base64字符串必须是4的倍数，且至少有4个字符
      if (cleaned.length < 4 || cleaned.length % 4 !== 0) {
        return false;
      }
      // 检查是否只包含有效的Base64字符
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
        return false;
      }
      // 检查填充字符是否正确
      const paddingMatch = cleaned.match(/=*$/);
      const paddingLength = paddingMatch ? paddingMatch[0].length : 0;
      return paddingLength <= 2;
    } catch {
      return false;
    }
  }

  /**
   * 检查字符串是否为有效的十六进制
   */
  private static isValidHex(str: string): boolean {
    // 如果包含逗号，通常不是十六进制格式
    if (str.includes(',')) {
      return false;
    }
    
    const cleaned = str.replace(/[^0-9A-Fa-f]/g, '');
    // 十六进制字符串应该有合理的长度，且至少80%为十六进制字符
    if (cleaned.length === 0 || cleaned.length < str.length * 0.8) {
      return false;
    }
    // 检查是否只包含十六进制字符
    if (!/^[0-9A-Fa-f]+$/.test(cleaned)) {
      return false;
    }
    // 十六进制字符串通常是偶数长度，且至少有4个字符才是有意义的十六进制
    return cleaned.length >= 4 && cleaned.length % 2 === 0;
  }

  /**
   * 检查字符串是否为有效的二进制数值序列
   */
  private static isValidBinary(str: string): boolean {
    // 必须包含逗号分隔的数值
    if (!str.includes(',')) {
      return false;
    }
    
    const parts = str.split(',');
    // 至少需要2个数值
    if (parts.length < 2) {
      return false;
    }
    
    // 检查所有部分是否都是有效的字节值（0-255）
    return parts.every(part => {
      const trimmed = part.trim();
      const num = parseInt(trimmed, 10);
      // 必须是有效数字，且在字节范围内，且字符串表示一致（避免如"123abc"被解析为123）
      return !isNaN(num) && num >= 0 && num <= 255 && num.toString() === trimmed;
    });
  }

  /**
   * 获取解码方法的显示名称
   */
  static getMethodName(method: DecoderMethod): string {
    switch (method) {
      case DecoderMethod.PlainText:
        return 'Plain Text';
      case DecoderMethod.Hexadecimal:
        return 'Hexadecimal';
      case DecoderMethod.Base64:
        return 'Base64';
      case DecoderMethod.Binary:
        return 'Binary';
      default:
        return 'Unknown';
    }
  }

  /**
   * 验证解码结果是否有效
   * @param decoded 解码后的字符串
   * @returns 是否为有效的解码结果
   */
  static isValidDecoded(decoded: string): boolean {
    // 检查是否包含过多的控制字符或无效字符
    const controlCharCount = (decoded.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
    const totalLength = decoded.length;
    
    // 如果控制字符超过10%，可能是无效的解码
    return totalLength === 0 || (controlCharCount / totalLength) < 0.1;
  }
}
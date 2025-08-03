/**
 * Checksum implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's IO/Checksum.h design
 */

import * as crypto from 'crypto';

/**
 * 校验和算法类型
 */
export enum ChecksumAlgorithm {
  None = '',
  CRC8 = 'CRC-8',
  CRC16 = 'CRC-16',
  CRC32 = 'CRC-32',
  MD5 = 'MD5',
  SHA1 = 'SHA-1',
  SHA256 = 'SHA-256',
  XOR = 'XOR',
  Fletcher16 = 'Fletcher-16',
  Fletcher32 = 'Fletcher-32'
}

/**
 * 校验和计算器类
 * 提供多种校验和算法的实现
 */
export class ChecksumCalculator {
  private static crc8Table: number[] | null = null;
  private static crc16Table: number[] | null = null;
  private static crc32Table: number[] | null = null;

  /**
   * 计算指定算法的校验和
   * @param algorithm 校验和算法
   * @param data 要计算校验和的数据
   * @returns 校验和结果
   */
  static calculate(algorithm: string, data: Buffer): Buffer {
    const alg = algorithm.toUpperCase().replace(/[-_]/g, ''); // 移除连字符和下划线
    
    switch (alg) {
      case 'CRC8':
        return this.calculateCRC8(data);
      
      case 'CRC16':
        return this.calculateCRC16(data);
      
      case 'CRC32':
        return this.calculateCRC32(data);
      
      case 'MD5':
        return this.calculateMD5(data);
      
      case 'SHA1':
        return this.calculateSHA1(data);
      
      case 'SHA256':
        return this.calculateSHA256(data);
      
      case 'XOR':
        return this.calculateXOR(data);
      
      case 'FLETCHER16':
        return this.calculateFletcher16(data);
      
      case 'FLETCHER32':
        return this.calculateFletcher32(data);
      
      case ChecksumAlgorithm.None:
      case '':
        return Buffer.alloc(0);
      
      default:
        throw new Error(`Unsupported checksum algorithm: ${algorithm}`);
    }
  }

  /**
   * 获取校验和长度（字节数）
   * @param algorithm 校验和算法
   * @returns 校验和长度
   */
  static getLength(algorithm: string): number {
    const alg = algorithm.toUpperCase().replace(/[-_]/g, ''); // 移除连字符和下划线
    
    switch (alg) {
      case 'CRC8':
      case 'XOR':
        return 1;
      
      case 'CRC16':
      case 'FLETCHER16':
        return 2;
      
      case 'CRC32':
      case 'FLETCHER32':
        return 4;
      
      case 'MD5':
        return 16;
      
      case 'SHA1':
        return 20;
      
      case 'SHA256':
        return 32;
      
      case ChecksumAlgorithm.None:
      case '':
        return 0;
      
      default:
        return 0;
    }
  }

  /**
   * 计算CRC-8校验和
   * @param data 数据
   * @returns CRC-8校验和
   */
  private static calculateCRC8(data: Buffer): Buffer {
    if (!this.crc8Table) {
      this.crc8Table = this.generateCRC8Table();
    }

    let crc = 0x00;
    for (const byte of data) {
      crc = this.crc8Table[(crc ^ byte) & 0xFF];
    }

    return Buffer.from([crc]);
  }

  /**
   * 生成CRC-8查找表
   * @returns CRC-8查找表
   */
  private static generateCRC8Table(): number[] {
    const table = new Array(256);
    const polynomial = 0x07; // CRC-8-ATM polynomial

    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x80) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFF;
      }
      table[i] = crc;
    }

    return table;
  }

  /**
   * 计算CRC-16校验和
   * @param data 数据
   * @returns CRC-16校验和
   */
  private static calculateCRC16(data: Buffer): Buffer {
    if (!this.crc16Table) {
      this.crc16Table = this.generateCRC16Table();
    }

    let crc = 0x0000;
    for (const byte of data) {
      const tblIdx = ((crc >> 8) ^ byte) & 0xFF;
      crc = ((crc << 8) ^ this.crc16Table[tblIdx]) & 0xFFFF;
    }

    const result = Buffer.alloc(2);
    result.writeUInt16BE(crc, 0);
    return result;
  }

  /**
   * 生成CRC-16查找表
   * @returns CRC-16查找表
   */
  private static generateCRC16Table(): number[] {
    const table = new Array(256);
    const polynomial = 0x1021; // CRC-16-CCITT polynomial

    for (let i = 0; i < 256; i++) {
      let crc = i << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFFFF;
      }
      table[i] = crc;
    }

    return table;
  }

  /**
   * 计算CRC-32校验和
   * @param data 数据
   * @returns CRC-32校验和
   */
  private static calculateCRC32(data: Buffer): Buffer {
    if (!this.crc32Table) {
      this.crc32Table = this.generateCRC32Table();
    }

    let crc = 0xFFFFFFFF;
    for (const byte of data) {
      const tblIdx = (crc ^ byte) & 0xFF;
      crc = (crc >>> 8) ^ this.crc32Table[tblIdx];
    }

    crc = crc ^ 0xFFFFFFFF;
    const result = Buffer.alloc(4);
    result.writeUInt32BE(crc >>> 0, 0); // >>> 0 确保无符号
    return result;
  }

  /**
   * 生成CRC-32查找表
   * @returns CRC-32查找表
   */
  private static generateCRC32Table(): number[] {
    const table = new Array(256);
    const polynomial = 0xEDB88320;

    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >>> 1) ^ polynomial;
        } else {
          crc = crc >>> 1;
        }
      }
      table[i] = crc >>> 0; // >>> 0 确保无符号
    }

    return table;
  }

  /**
   * 计算MD5哈希
   * @param data 数据
   * @returns MD5哈希
   */
  private static calculateMD5(data: Buffer): Buffer {
    return crypto.createHash('md5').update(data).digest();
  }

  /**
   * 计算SHA-1哈希
   * @param data 数据
   * @returns SHA-1哈希
   */
  private static calculateSHA1(data: Buffer): Buffer {
    return crypto.createHash('sha1').update(data).digest();
  }

  /**
   * 计算SHA-256哈希
   * @param data 数据
   * @returns SHA-256哈希
   */
  private static calculateSHA256(data: Buffer): Buffer {
    return crypto.createHash('sha256').update(data).digest();
  }

  /**
   * 计算XOR校验和
   * @param data 数据
   * @returns XOR校验和
   */
  private static calculateXOR(data: Buffer): Buffer {
    let xor = 0;
    for (const byte of data) {
      xor ^= byte;
    }
    return Buffer.from([xor]);
  }

  /**
   * 计算Fletcher-16校验和
   * @param data 数据
   * @returns Fletcher-16校验和
   */
  private static calculateFletcher16(data: Buffer): Buffer {
    let sum1 = 0;
    let sum2 = 0;

    for (const byte of data) {
      sum1 = (sum1 + byte) % 255;
      sum2 = (sum2 + sum1) % 255;
    }

    const result = Buffer.alloc(2);
    result[0] = sum2;
    result[1] = sum1;
    return result;
  }

  /**
   * 计算Fletcher-32校验和
   * @param data 数据
   * @returns Fletcher-32校验和
   */
  private static calculateFletcher32(data: Buffer): Buffer {
    let sum1 = 0;
    let sum2 = 0;

    // 确保数据长度为偶数，不足时补零
    const paddedData = data.length % 2 === 0 ? data : Buffer.concat([data, Buffer.from([0])]);

    for (let i = 0; i < paddedData.length; i += 2) {
      const word = paddedData.readUInt16BE(i);
      sum1 = (sum1 + word) % 65535;
      sum2 = (sum2 + sum1) % 65535;
    }

    const result = Buffer.alloc(4);
    result.writeUInt16BE(sum2, 0);
    result.writeUInt16BE(sum1, 2);
    return result;
  }

  /**
   * 验证校验和
   * @param algorithm 校验和算法
   * @param data 数据
   * @param expectedChecksum 期望的校验和
   * @returns 校验是否通过
   */
  static verify(algorithm: string, data: Buffer, expectedChecksum: Buffer): boolean {
    try {
      const calculatedChecksum = this.calculate(algorithm, data);
      return calculatedChecksum.equals(expectedChecksum);
    } catch (error) {
      console.error('Checksum verification error:', error);
      return false;
    }
  }

  /**
   * 获取支持的校验和算法列表
   * @returns 支持的算法列表
   */
  static getSupportedAlgorithms(): string[] {
    return Object.values(ChecksumAlgorithm).filter(alg => alg !== '');
  }

  /**
   * 检查算法是否受支持
   * @param algorithm 算法名称
   * @returns 是否支持
   */
  static isSupported(algorithm: string): boolean {
    return this.getSupportedAlgorithms().includes(algorithm) || algorithm === '';
  }
}
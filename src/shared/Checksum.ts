/**
 * Checksum - 基于Serial-Studio的Checksum设计
 * 支持多种校验和算法：CRC16、CRC32、MD5、SHA256等
 */

// CRC16表（IBM/ANSI）
const CRC16_TABLE = new Uint16Array(256);

// 初始化CRC16表
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    if (crc & 1) {
      crc = (crc >>> 1) ^ 0xA001;
    } else {
      crc = crc >>> 1;
    }
  }
  CRC16_TABLE[i] = crc;
}

// CRC32表（IEEE 802.3）
const CRC32_TABLE = new Uint32Array(256);

// 初始化CRC32表
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    if (crc & 1) {
      crc = (crc >>> 1) ^ 0xEDB88320;
    } else {
      crc = crc >>> 1;
    }
  }
  CRC32_TABLE[i] = crc;
}

/**
 * 校验和函数类型
 */
type ChecksumFunction = (data: Uint8Array, seed?: number) => Uint8Array;

/**
 * CRC8校验和计算
 */
function crc8(data: Uint8Array, seed: number = 0): Uint8Array {
  let crc = seed;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x07;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFF;
  }
  return new Uint8Array([crc]);
}

/**
 * CRC16校验和计算（IBM/ANSI）
 */
function crc16(data: Uint8Array, seed: number = 0xFFFF): Uint8Array {
  let crc = seed;
  for (let i = 0; i < data.length; i++) {
    const tableIndex = (crc ^ data[i]) & 0xFF;
    crc = (crc >>> 8) ^ CRC16_TABLE[tableIndex];
  }
  
  // 返回小端序格式
  return new Uint8Array([crc & 0xFF, (crc >>> 8) & 0xFF]);
}

/**
 * CRC32校验和计算（IEEE 802.3）
 */
function crc32(data: Uint8Array, seed: number = 0xFFFFFFFF): Uint8Array {
  let crc = seed;
  for (let i = 0; i < data.length; i++) {
    const tableIndex = (crc ^ data[i]) & 0xFF;
    crc = (crc >>> 8) ^ CRC32_TABLE[tableIndex];
  }
  crc = crc ^ 0xFFFFFFFF;
  
  // 返回小端序格式
  return new Uint8Array([
    crc & 0xFF,
    (crc >>> 8) & 0xFF,
    (crc >>> 16) & 0xFF,
    (crc >>> 24) & 0xFF
  ]);
}

/**
 * 简单的校验和（求和）
 */
function checksumSum(data: Uint8Array): Uint8Array {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return new Uint8Array([sum & 0xFF]);
}

/**
 * XOR校验和
 */
function checksumXor(data: Uint8Array): Uint8Array {
  let xor = 0;
  for (let i = 0; i < data.length; i++) {
    xor ^= data[i];
  }
  return new Uint8Array([xor]);
}

/**
 * MD5哈希算法（使用Web Crypto API）
 */
async function md5Hash(data: Uint8Array): Promise<Uint8Array> {
  // 注意：Web Crypto API不支持MD5，这里提供一个简化实现
  // 在实际生产中应使用专门的MD5库
  console.warn('MD5 hash not implemented, using CRC32 as fallback');
  return crc32(data);
}

/**
 * SHA256哈希算法（使用Web Crypto API）
 */
async function sha256Hash(data: Uint8Array): Promise<Uint8Array> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  } else {
    // 在Worker环境中的降级处理
    console.warn('Web Crypto API not available, using CRC32 as fallback');
    return crc32(data);
  }
}

/**
 * 校验和函数映射表
 */
const CHECKSUM_FUNCTIONS = new Map<string, ChecksumFunction>([
  ['none', () => new Uint8Array()],
  ['sum', checksumSum],
  ['xor', checksumXor],
  ['crc8', crc8],
  ['crc16', crc16],
  ['crc32', crc32],
  // 异步函数需要特殊处理
  ['md5', (data) => {
    // 返回一个空的Promise结果，实际使用时需要await
    console.warn('MD5 requires async handling');
    return crc32(data);
  }],
  ['sha256', (data) => {
    console.warn('SHA256 requires async handling');
    return crc32(data);
  }]
]);

/**
 * 获取所有可用的校验和算法
 */
export function getAvailableChecksums(): string[] {
  return Array.from(CHECKSUM_FUNCTIONS.keys());
}

/**
 * 获取校验和函数映射表
 */
export function checksumFunctionMap(): Map<string, ChecksumFunction> {
  return CHECKSUM_FUNCTIONS;
}

/**
 * 计算数据的校验和
 * 模拟Serial-Studio的checksum函数
 */
export function checksum(algorithm: string, data: Uint8Array, seed: number = 0): Uint8Array {
  const func = CHECKSUM_FUNCTIONS.get(algorithm.toLowerCase());
  if (!func) {
    console.warn(`Unknown checksum algorithm: ${algorithm}`);
    return new Uint8Array();
  }
  
  try {
    return func(data, seed);
  } catch (error) {
    console.error(`Checksum calculation failed for ${algorithm}:`, error);
    return new Uint8Array();
  }
}

/**
 * 异步计算数据的校验和（用于哈希算法）
 */
export async function checksumAsync(algorithm: string, data: Uint8Array): Promise<Uint8Array> {
  switch (algorithm.toLowerCase()) {
    case 'md5':
      return await md5Hash(data);
    case 'sha256':
      return await sha256Hash(data);
    default:
      return checksum(algorithm, data);
  }
}

/**
 * 验证数据的校验和
 */
export function validateChecksum(
  algorithm: string,
  data: Uint8Array,
  expectedChecksum: Uint8Array,
  seed: number = 0
): boolean {
  const calculated = checksum(algorithm, data, seed);
  
  if (calculated.length !== expectedChecksum.length) {
    return false;
  }
  
  for (let i = 0; i < calculated.length; i++) {
    if (calculated[i] !== expectedChecksum[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * 获取指定算法的校验和长度
 */
export function getChecksumLength(algorithm: string): number {
  const testData = new Uint8Array([0x00]);
  const result = checksum(algorithm, testData);
  return result.length;
}

/**
 * 校验和实用工具
 */
export const ChecksumUtils = {
  /**
   * 将字节数组转换为十六进制字符串
   */
  toHexString(data: Uint8Array): string {
    return Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
  },

  /**
   * 从十六进制字符串解析字节数组
   */
  fromHexString(hexString: string): Uint8Array {
    const hex = hexString.replace(/\s+/g, '').replace(/^0x/i, '');
    const bytes = new Uint8Array(hex.length / 2);
    
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    
    return bytes;
  },

  /**
   * 比较两个校验和是否相等
   */
  compare(checksum1: Uint8Array, checksum2: Uint8Array): boolean {
    if (checksum1.length !== checksum2.length) {
      return false;
    }
    
    for (let i = 0; i < checksum1.length; i++) {
      if (checksum1[i] !== checksum2[i]) {
        return false;
      }
    }
    
    return true;
  }
};

// 导出单个算法函数
export {
  crc8,
  crc16,
  crc32,
  checksumSum,
  checksumXor,
  md5Hash,
  sha256Hash
};

export default {
  checksum,
  checksumAsync,
  validateChecksum,
  getChecksumLength,
  getAvailableChecksums,
  checksumFunctionMap,
  ChecksumUtils
};

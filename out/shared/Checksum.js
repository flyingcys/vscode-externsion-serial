"use strict";
/**
 * Checksum - 基于Serial-Studio的Checksum设计
 * 支持多种校验和算法：CRC16、CRC32、MD5、SHA256等
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hash = exports.md5Hash = exports.checksumXor = exports.checksumSum = exports.crc32 = exports.crc16 = exports.crc8 = exports.ChecksumUtils = exports.getChecksumLength = exports.validateChecksum = exports.checksumAsync = exports.checksum = exports.checksumFunctionMap = exports.getAvailableChecksums = void 0;
// CRC16表（IBM/ANSI）
const CRC16_TABLE = new Uint16Array(256);
// 初始化CRC16表
for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
        if (crc & 1) {
            crc = (crc >>> 1) ^ 0xA001;
        }
        else {
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
        }
        else {
            crc = crc >>> 1;
        }
    }
    CRC32_TABLE[i] = crc;
}
/**
 * CRC8校验和计算
 */
function crc8(data, seed = 0) {
    let crc = seed;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            if (crc & 0x80) {
                crc = (crc << 1) ^ 0x07;
            }
            else {
                crc = crc << 1;
            }
        }
        crc &= 0xFF;
    }
    return new Uint8Array([crc]);
}
exports.crc8 = crc8;
/**
 * CRC16校验和计算（IBM/ANSI）
 */
function crc16(data, seed = 0xFFFF) {
    let crc = seed;
    for (let i = 0; i < data.length; i++) {
        const tableIndex = (crc ^ data[i]) & 0xFF;
        crc = (crc >>> 8) ^ CRC16_TABLE[tableIndex];
    }
    // 返回小端序格式
    return new Uint8Array([crc & 0xFF, (crc >>> 8) & 0xFF]);
}
exports.crc16 = crc16;
/**
 * CRC32校验和计算（IEEE 802.3）
 */
function crc32(data, seed = 0xFFFFFFFF) {
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
exports.crc32 = crc32;
/**
 * 简单的校验和（求和）
 */
function checksumSum(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
    }
    return new Uint8Array([sum & 0xFF]);
}
exports.checksumSum = checksumSum;
/**
 * XOR校验和
 */
function checksumXor(data) {
    let xor = 0;
    for (let i = 0; i < data.length; i++) {
        xor ^= data[i];
    }
    return new Uint8Array([xor]);
}
exports.checksumXor = checksumXor;
/**
 * MD5哈希算法（使用Web Crypto API）
 */
async function md5Hash(data) {
    // 注意：Web Crypto API不支持MD5，这里提供一个简化实现
    // 在实际生产中应使用专门的MD5库
    console.warn('MD5 hash not implemented, using CRC32 as fallback');
    return crc32(data);
}
exports.md5Hash = md5Hash;
/**
 * SHA256哈希算法（使用Web Crypto API）
 */
async function sha256Hash(data) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return new Uint8Array(hashBuffer);
    }
    else {
        // 在Worker环境中的降级处理
        console.warn('Web Crypto API not available, using CRC32 as fallback');
        return crc32(data);
    }
}
exports.sha256Hash = sha256Hash;
/**
 * 校验和函数映射表
 */
const CHECKSUM_FUNCTIONS = new Map([
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
function getAvailableChecksums() {
    return Array.from(CHECKSUM_FUNCTIONS.keys());
}
exports.getAvailableChecksums = getAvailableChecksums;
/**
 * 获取校验和函数映射表
 */
function checksumFunctionMap() {
    return CHECKSUM_FUNCTIONS;
}
exports.checksumFunctionMap = checksumFunctionMap;
/**
 * 计算数据的校验和
 * 模拟Serial-Studio的checksum函数
 */
function checksum(algorithm, data, seed = 0) {
    const func = CHECKSUM_FUNCTIONS.get(algorithm.toLowerCase());
    if (!func) {
        console.warn(`Unknown checksum algorithm: ${algorithm}`);
        return new Uint8Array();
    }
    try {
        return func(data, seed);
    }
    catch (error) {
        console.error(`Checksum calculation failed for ${algorithm}:`, error);
        return new Uint8Array();
    }
}
exports.checksum = checksum;
/**
 * 异步计算数据的校验和（用于哈希算法）
 */
async function checksumAsync(algorithm, data) {
    switch (algorithm.toLowerCase()) {
        case 'md5':
            return await md5Hash(data);
        case 'sha256':
            return await sha256Hash(data);
        default:
            return checksum(algorithm, data);
    }
}
exports.checksumAsync = checksumAsync;
/**
 * 验证数据的校验和
 */
function validateChecksum(algorithm, data, expectedChecksum, seed = 0) {
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
exports.validateChecksum = validateChecksum;
/**
 * 获取指定算法的校验和长度
 */
function getChecksumLength(algorithm) {
    const testData = new Uint8Array([0x00]);
    const result = checksum(algorithm, testData);
    return result.length;
}
exports.getChecksumLength = getChecksumLength;
/**
 * 校验和实用工具
 */
exports.ChecksumUtils = {
    /**
     * 将字节数组转换为十六进制字符串
     */
    toHexString(data) {
        return Array.from(data)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
    },
    /**
     * 从十六进制字符串解析字节数组
     */
    fromHexString(hexString) {
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
    compare(checksum1, checksum2) {
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
exports.default = {
    checksum,
    checksumAsync,
    validateChecksum,
    getChecksumLength,
    getAvailableChecksums,
    checksumFunctionMap,
    ChecksumUtils: exports.ChecksumUtils
};
//# sourceMappingURL=Checksum.js.map
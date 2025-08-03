/**
 * Checksum - 基于Serial-Studio的Checksum设计
 * 支持多种校验和算法：CRC16、CRC32、MD5、SHA256等
 */
/**
 * 校验和函数类型
 */
type ChecksumFunction = (data: Uint8Array, seed?: number) => Uint8Array;
/**
 * CRC8校验和计算
 */
declare function crc8(data: Uint8Array, seed?: number): Uint8Array;
/**
 * CRC16校验和计算（IBM/ANSI）
 */
declare function crc16(data: Uint8Array, seed?: number): Uint8Array;
/**
 * CRC32校验和计算（IEEE 802.3）
 */
declare function crc32(data: Uint8Array, seed?: number): Uint8Array;
/**
 * 简单的校验和（求和）
 */
declare function checksumSum(data: Uint8Array): Uint8Array;
/**
 * XOR校验和
 */
declare function checksumXor(data: Uint8Array): Uint8Array;
/**
 * MD5哈希算法（使用Web Crypto API）
 */
declare function md5Hash(data: Uint8Array): Promise<Uint8Array>;
/**
 * SHA256哈希算法（使用Web Crypto API）
 */
declare function sha256Hash(data: Uint8Array): Promise<Uint8Array>;
/**
 * 获取所有可用的校验和算法
 */
export declare function getAvailableChecksums(): string[];
/**
 * 获取校验和函数映射表
 */
export declare function checksumFunctionMap(): Map<string, ChecksumFunction>;
/**
 * 计算数据的校验和
 * 模拟Serial-Studio的checksum函数
 */
export declare function checksum(algorithm: string, data: Uint8Array, seed?: number): Uint8Array;
/**
 * 异步计算数据的校验和（用于哈希算法）
 */
export declare function checksumAsync(algorithm: string, data: Uint8Array): Promise<Uint8Array>;
/**
 * 验证数据的校验和
 */
export declare function validateChecksum(algorithm: string, data: Uint8Array, expectedChecksum: Uint8Array, seed?: number): boolean;
/**
 * 获取指定算法的校验和长度
 */
export declare function getChecksumLength(algorithm: string): number;
/**
 * 校验和实用工具
 */
export declare const ChecksumUtils: {
    /**
     * 将字节数组转换为十六进制字符串
     */
    toHexString(data: Uint8Array): string;
    /**
     * 从十六进制字符串解析字节数组
     */
    fromHexString(hexString: string): Uint8Array;
    /**
     * 比较两个校验和是否相等
     */
    compare(checksum1: Uint8Array, checksum2: Uint8Array): boolean;
};
export { crc8, crc16, crc32, checksumSum, checksumXor, md5Hash, sha256Hash };
declare const _default: {
    checksum: typeof checksum;
    checksumAsync: typeof checksumAsync;
    validateChecksum: typeof validateChecksum;
    getChecksumLength: typeof getChecksumLength;
    getAvailableChecksums: typeof getAvailableChecksums;
    checksumFunctionMap: typeof checksumFunctionMap;
    ChecksumUtils: {
        /**
         * 将字节数组转换为十六进制字符串
         */
        toHexString(data: Uint8Array): string;
        /**
         * 从十六进制字符串解析字节数组
         */
        fromHexString(hexString: string): Uint8Array;
        /**
         * 比较两个校验和是否相等
         */
        compare(checksum1: Uint8Array, checksum2: Uint8Array): boolean;
    };
};
export default _default;
//# sourceMappingURL=Checksum.d.ts.map
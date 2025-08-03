/**
 * Checksum implementation for Serial Studio VSCode Extension
 * Based on Serial Studio's IO/Checksum.h design
 */
/// <reference types="node" />
/// <reference types="node" />
/**
 * 校验和算法类型
 */
export declare enum ChecksumAlgorithm {
    None = "",
    CRC8 = "CRC-8",
    CRC16 = "CRC-16",
    CRC32 = "CRC-32",
    MD5 = "MD5",
    SHA1 = "SHA-1",
    SHA256 = "SHA-256",
    XOR = "XOR",
    Fletcher16 = "Fletcher-16",
    Fletcher32 = "Fletcher-32"
}
/**
 * 校验和计算器类
 * 提供多种校验和算法的实现
 */
export declare class ChecksumCalculator {
    private static crc8Table;
    private static crc16Table;
    private static crc32Table;
    /**
     * 计算指定算法的校验和
     * @param algorithm 校验和算法
     * @param data 要计算校验和的数据
     * @returns 校验和结果
     */
    static calculate(algorithm: string, data: Buffer): Buffer;
    /**
     * 获取校验和长度（字节数）
     * @param algorithm 校验和算法
     * @returns 校验和长度
     */
    static getLength(algorithm: string): number;
    /**
     * 计算CRC-8校验和
     * @param data 数据
     * @returns CRC-8校验和
     */
    private static calculateCRC8;
    /**
     * 生成CRC-8查找表
     * @returns CRC-8查找表
     */
    private static generateCRC8Table;
    /**
     * 计算CRC-16校验和
     * @param data 数据
     * @returns CRC-16校验和
     */
    private static calculateCRC16;
    /**
     * 生成CRC-16查找表
     * @returns CRC-16查找表
     */
    private static generateCRC16Table;
    /**
     * 计算CRC-32校验和
     * @param data 数据
     * @returns CRC-32校验和
     */
    private static calculateCRC32;
    /**
     * 生成CRC-32查找表
     * @returns CRC-32查找表
     */
    private static generateCRC32Table;
    /**
     * 计算MD5哈希
     * @param data 数据
     * @returns MD5哈希
     */
    private static calculateMD5;
    /**
     * 计算SHA-1哈希
     * @param data 数据
     * @returns SHA-1哈希
     */
    private static calculateSHA1;
    /**
     * 计算SHA-256哈希
     * @param data 数据
     * @returns SHA-256哈希
     */
    private static calculateSHA256;
    /**
     * 计算XOR校验和
     * @param data 数据
     * @returns XOR校验和
     */
    private static calculateXOR;
    /**
     * 计算Fletcher-16校验和
     * @param data 数据
     * @returns Fletcher-16校验和
     */
    private static calculateFletcher16;
    /**
     * 计算Fletcher-32校验和
     * @param data 数据
     * @returns Fletcher-32校验和
     */
    private static calculateFletcher32;
    /**
     * 验证校验和
     * @param algorithm 校验和算法
     * @param data 数据
     * @param expectedChecksum 期望的校验和
     * @returns 校验是否通过
     */
    static verify(algorithm: string, data: Buffer, expectedChecksum: Buffer): boolean;
    /**
     * 获取支持的校验和算法列表
     * @returns 支持的算法列表
     */
    static getSupportedAlgorithms(): string[];
    /**
     * 检查算法是否受支持
     * @param algorithm 算法名称
     * @returns 是否支持
     */
    static isSupported(algorithm: string): boolean;
}
//# sourceMappingURL=Checksum.d.ts.map
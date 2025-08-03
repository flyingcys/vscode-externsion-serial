/**
 * 保护模式枚举
 * 对应Serial-Studio SimpleCrypt::ProtectionMode
 */
export declare enum ProtectionMode {
    /** 不使用完整性保护 */
    ProtectionNone = 0,
    /** 使用校验和进行完整性保护 */
    ProtectionChecksum = 1,
    /** 使用哈希进行完整性保护 */
    ProtectionHash = 2
}
/**
 * SimpleCrypt - 简单加密工具类
 *
 * 基于Serial-Studio SimpleCrypt C++实现的TypeScript版本
 * 提供轻量级的字符串加密/解密功能，主要用于保护许可证信息
 *
 * 核心功能：
 * - 使用机器特定密钥进行数据加密
 * - 支持完整性保护（校验和或哈希）
 * - 与Serial-Studio C++版本兼容的加密格式
 * - 防止许可证信息在不同机器间复制使用
 *
 * 加密算法：
 * - 对称加密：AES-256-CBC
 * - 完整性保护：SHA-256哈希或简单校验和
 * - 密钥派生：基于机器特定密钥和固定盐值
 */
export declare class SimpleCrypt {
    private key;
    private protectionMode;
    private static readonly KEY_SIZE;
    private static readonly BLOCK_SIZE;
    private static readonly DEFAULT_SALT;
    /**
     * 构造函数
     * @param key 可选的初始密钥
     */
    constructor(key?: bigint);
    /**
     * 设置加密密钥
     * @param key 64位整数密钥，通常来自MachineID
     */
    setKey(key: bigint): void;
    /**
     * 获取当前加密密钥
     */
    getKey(): bigint;
    /**
     * 设置完整性保护模式
     * @param mode 保护模式
     */
    setIntegrityProtectionMode(mode: ProtectionMode): void;
    /**
     * 获取当前完整性保护模式
     */
    getIntegrityProtectionMode(): ProtectionMode;
    /**
     * 加密字符串
     * @param plaintext 要加密的明文字符串
     * @returns 加密后的base64编码字符串，失败返回空字符串
     */
    encrypt(plaintext: string): string;
    /**
     * 解密字符串
     * @param ciphertext 加密的base64字符串
     * @returns 解密后的明文字符串，失败返回空字符串
     */
    decrypt(ciphertext: string): string;
    /**
     * 从64位整数密钥派生32字节AES密钥
     * @param key 64位整数密钥
     * @returns 32字节AES密钥
     */
    private deriveAESKey;
    /**
     * 添加校验和保护
     * @param iv 初始化向量
     * @param encrypted 加密数据
     * @returns 包含校验和的数据
     */
    private addChecksumProtection;
    /**
     * 添加哈希保护
     * @param iv 初始化向量
     * @param encrypted 加密数据
     * @returns 包含哈希的数据
     */
    private addHashProtection;
    /**
     * 验证校验和并提取数据
     * @param data 包含校验和的数据
     * @returns 提取的IV和加密数据，验证失败返回null
     */
    private verifyAndExtractChecksum;
    /**
     * 验证哈希并提取数据
     * @param data 包含哈希的数据
     * @returns 提取的IV和加密数据，验证失败返回null
     */
    private verifyAndExtractHash;
    /**
     * 计算CRC32校验和
     * @param data 要计算校验和的数据
     * @returns CRC32校验和
     */
    private calculateCRC32;
    /**
     * 生成CRC32查找表
     * @returns CRC32查找表
     */
    private makeCRCTable;
}
//# sourceMappingURL=SimpleCrypt.d.ts.map
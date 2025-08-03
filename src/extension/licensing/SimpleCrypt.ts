/*
 * Serial Studio VSCode Extension - 加密工具
 * 
 * 基于Serial-Studio SimpleCrypt的TypeScript/Node.js实现
 * 提供与原版兼容的数据加密和解密功能
 */

import * as crypto from 'crypto';

/**
 * 保护模式枚举
 * 对应Serial-Studio SimpleCrypt::ProtectionMode
 */
export enum ProtectionMode {
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
export class SimpleCrypt {
    private key: bigint = BigInt(0);
    private protectionMode: ProtectionMode = ProtectionMode.ProtectionNone;
    
    // AES-256需要32字节密钥
    private static readonly KEY_SIZE = 32;
    // AES块大小是16字节
    private static readonly BLOCK_SIZE = 16;
    // 默认盐值，与Serial-Studio保持一致
    private static readonly DEFAULT_SALT = 'SerialStudio-VSCode-Salt';

    /**
     * 构造函数
     * @param key 可选的初始密钥
     */
    constructor(key?: bigint) {
        if (key !== undefined) {
            this.setKey(key);
        }
    }

    /**
     * 设置加密密钥
     * @param key 64位整数密钥，通常来自MachineID
     */
    public setKey(key: bigint): void {
        this.key = key;
    }

    /**
     * 获取当前加密密钥
     */
    public getKey(): bigint {
        return this.key;
    }

    /**
     * 设置完整性保护模式
     * @param mode 保护模式
     */
    public setIntegrityProtectionMode(mode: ProtectionMode): void {
        this.protectionMode = mode;
    }

    /**
     * 获取当前完整性保护模式
     */
    public getIntegrityProtectionMode(): ProtectionMode {
        return this.protectionMode;
    }

    /**
     * 加密字符串
     * @param plaintext 要加密的明文字符串
     * @returns 加密后的base64编码字符串，失败返回空字符串
     */
    public encrypt(plaintext: string): string {
        if (!plaintext || this.key === BigInt(0)) {
            return '';
        }

        try {
            // 将64位密钥扩展为32字节AES密钥
            const aesKey = this.deriveAESKey(this.key);
            
            // 生成随机IV
            const iv = crypto.randomBytes(SimpleCrypt.BLOCK_SIZE);
            
            // 创建加密器
            const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
            
            // 加密数据
            let encrypted = cipher.update(plaintext, 'utf8');
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            
            // 根据保护模式添加完整性保护
            let finalData: Buffer;
            switch (this.protectionMode) {
                case ProtectionMode.ProtectionChecksum:
                    finalData = this.addChecksumProtection(iv, encrypted);
                    break;
                case ProtectionMode.ProtectionHash:
                    finalData = this.addHashProtection(iv, encrypted);
                    break;
                default:
                    finalData = Buffer.concat([iv, encrypted]);
                    break;
            }
            
            return finalData.toString('base64');
        } catch (error) {
            console.error('Encryption failed:', error);
            return '';
        }
    }

    /**
     * 解密字符串
     * @param ciphertext 加密的base64字符串
     * @returns 解密后的明文字符串，失败返回空字符串
     */
    public decrypt(ciphertext: string): string {
        if (!ciphertext || this.key === BigInt(0)) {
            return '';
        }

        try {
            // 解码base64
            const encryptedData = Buffer.from(ciphertext, 'base64');
            
            if (encryptedData.length < SimpleCrypt.BLOCK_SIZE) {
                return '';
            }
            
            // 根据保护模式验证和提取数据
            let iv: Buffer;
            let encrypted: Buffer;
            
            switch (this.protectionMode) {
                case ProtectionMode.ProtectionChecksum:
                    const checksumResult = this.verifyAndExtractChecksum(encryptedData);
                    if (!checksumResult) {return '';}
                    iv = checksumResult.iv;
                    encrypted = checksumResult.encrypted;
                    break;
                case ProtectionMode.ProtectionHash:
                    const hashResult = this.verifyAndExtractHash(encryptedData);
                    if (!hashResult) {return '';}
                    iv = hashResult.iv;
                    encrypted = hashResult.encrypted;
                    break;
                default:
                    iv = encryptedData.subarray(0, SimpleCrypt.BLOCK_SIZE);
                    encrypted = encryptedData.subarray(SimpleCrypt.BLOCK_SIZE);
                    break;
            }
            
            // 将64位密钥扩展为32字节AES密钥
            const aesKey = this.deriveAESKey(this.key);
            
            // 创建解密器
            const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
            
            // 解密数据
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Decryption failed:', error);
            return '';
        }
    }

    /**
     * 从64位整数密钥派生32字节AES密钥
     * @param key 64位整数密钥
     * @returns 32字节AES密钥
     */
    private deriveAESKey(key: bigint): Buffer {
        // 将bigint转换为8字节buffer
        const keyBuffer = Buffer.allocUnsafe(8);
        keyBuffer.writeBigUInt64BE(key, 0);
        
        // 使用PBKDF2派生32字节密钥
        const salt = Buffer.from(SimpleCrypt.DEFAULT_SALT, 'utf8');
        return crypto.pbkdf2Sync(keyBuffer, salt, 10000, SimpleCrypt.KEY_SIZE, 'sha256');
    }

    /**
     * 添加校验和保护
     * @param iv 初始化向量
     * @param encrypted 加密数据
     * @returns 包含校验和的数据
     */
    private addChecksumProtection(iv: Buffer, encrypted: Buffer): Buffer {
        // 计算简单的CRC32校验和
        const data = Buffer.concat([iv, encrypted]);
        const checksum = this.calculateCRC32(data);
        const checksumBuffer = Buffer.allocUnsafe(4);
        checksumBuffer.writeUInt32BE(checksum, 0);
        
        return Buffer.concat([checksumBuffer, data]);
    }

    /**
     * 添加哈希保护
     * @param iv 初始化向量
     * @param encrypted 加密数据
     * @returns 包含哈希的数据
     */
    private addHashProtection(iv: Buffer, encrypted: Buffer): Buffer {
        const data = Buffer.concat([iv, encrypted]);
        const hash = crypto.createHash('sha256').update(data).digest();
        
        return Buffer.concat([hash, data]);
    }

    /**
     * 验证校验和并提取数据
     * @param data 包含校验和的数据
     * @returns 提取的IV和加密数据，验证失败返回null
     */
    private verifyAndExtractChecksum(data: Buffer): { iv: Buffer; encrypted: Buffer } | null {
        if (data.length < 4 + SimpleCrypt.BLOCK_SIZE) {
            return null;
        }
        
        const storedChecksum = data.readUInt32BE(0);
        const actualData = data.subarray(4);
        const calculatedChecksum = this.calculateCRC32(actualData);
        
        if (storedChecksum !== calculatedChecksum) {
            return null;
        }
        
        const iv = actualData.subarray(0, SimpleCrypt.BLOCK_SIZE);
        const encrypted = actualData.subarray(SimpleCrypt.BLOCK_SIZE);
        
        return { iv, encrypted };
    }

    /**
     * 验证哈希并提取数据
     * @param data 包含哈希的数据
     * @returns 提取的IV和加密数据，验证失败返回null
     */
    private verifyAndExtractHash(data: Buffer): { iv: Buffer; encrypted: Buffer } | null {
        const hashSize = 32; // SHA-256 hash size
        if (data.length < hashSize + SimpleCrypt.BLOCK_SIZE) {
            return null;
        }
        
        const storedHash = data.subarray(0, hashSize);
        const actualData = data.subarray(hashSize);
        const calculatedHash = crypto.createHash('sha256').update(actualData).digest();
        
        if (!storedHash.equals(calculatedHash)) {
            return null;
        }
        
        const iv = actualData.subarray(0, SimpleCrypt.BLOCK_SIZE);
        const encrypted = actualData.subarray(SimpleCrypt.BLOCK_SIZE);
        
        return { iv, encrypted };
    }

    /**
     * 计算CRC32校验和
     * @param data 要计算校验和的数据
     * @returns CRC32校验和
     */
    private calculateCRC32(data: Buffer): number {
        const crcTable = this.makeCRCTable();
        let crc = 0 ^ (-1);

        for (let i = 0; i < data.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
        }

        return (crc ^ (-1)) >>> 0;
    }

    /**
     * 生成CRC32查找表
     * @returns CRC32查找表
     */
    private makeCRCTable(): number[] {
        const crcTable: number[] = [];
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    }
}
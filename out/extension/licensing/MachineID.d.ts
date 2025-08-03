/**
 * MachineID - 机器标识管理器
 *
 * 提供一致的、哈希化的机器标识符用于许可证验证和数据加密
 * 基于Serial-Studio的MachineID C++实现
 *
 * 核心功能：
 * - 生成唯一的、平台无关的机器标识符
 * - 基于系统特定属性生成机器ID
 * - 绑定许可证密钥和激活到特定机器
 * - 为敏感数据加密提供稳定的加密密钥
 *
 * 生成的标识符不包含个人信息或硬件可识别信息
 * 使用单向哈希确保隐私的同时执行每设备限制
 */
export declare class MachineID {
    private static instance;
    private _machineId;
    private _machineSpecificKey;
    private constructor();
    /**
     * 获取MachineID单例实例
     * 遵循Singleton模式确保运行时只有一个实例
     */
    static getInstance(): MachineID;
    /**
     * 返回哈希化的、base64编码的机器标识符
     *
     * 该值基于平台特定标识符和应用程序名称生成，
     * 然后进行哈希和编码以避免泄露可识别信息。
     * 为许可证、缓存或其他每设备逻辑提供一致的机器ID
     */
    get machineId(): string;
    /**
     * 返回机器特性加密密钥
     *
     * 该64位密钥来自用于生成机器ID的相同输入
     * 用于本地数据加密（如缓存的许可证信息），
     * 确保加密内容无法在其他机器上重用或解密
     */
    get machineSpecificKey(): bigint;
    /**
     * 收集系统特定数据以生成唯一机器标识符和加密密钥
     *
     * 该方法根据操作系统收集平台特定的机器信息：
     * - Linux: /var/lib/dbus/machine-id 或 /etc/machine-id
     * - macOS: IOPlatformUUID (通过ioreg)
     * - Windows: MachineGuid + UUID (通过registry和PowerShell)
     * - BSD: /etc/hostid 或 smbios.system.uuid
     *
     * 生成的机器特定ID与应用程序名称和操作系统名称结合
     * 使用BLAKE2s-128算法进行哈希处理，创建不可逆的、
     * 隐私保护的标识符，在同一台机器上保持一致
     *
     * 派生两个值：
     * - 机器ID：用于机器识别的base64编码哈希字符串
     * - 机器特定密钥：从哈希提取的64位密钥，用于加密
     *   或解密本地缓存的敏感数据（如许可证信息），
     *   确保不能跨不同机器重用
     */
    private readInformation;
    /**
     * 获取Linux系统的机器ID
     */
    private getLinuxMachineId;
    /**
     * 获取macOS系统的机器ID
     */
    private getMacOSMachineId;
    /**
     * 获取Windows系统的机器ID
     */
    private getWindowsMachineId;
    /**
     * 获取BSD系统的机器ID
     */
    private getBSDMachineId;
    /**
     * 回退方案：使用网络接口信息生成机器ID
     */
    private getFallbackMachineId;
    /**
     * 同步版本的信息读取（用于测试和简单场景）
     */
    private readInformationSync;
}
//# sourceMappingURL=MachineID.d.ts.map
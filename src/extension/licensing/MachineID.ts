/*
 * Serial Studio VSCode Extension - 许可证管理系统
 * 
 * 基于Serial-Studio C++版本的许可证架构设计
 * 实现与原版完全一致的机器ID生成和管理功能
 */

import * as crypto from 'crypto';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
export class MachineID {
    private static instance: MachineID;
    private _machineId: string = '';
    private _machineSpecificKey: bigint = BigInt(0);

    private constructor() {
        // 同步版本的初始化，使用fallback方式
        this.readInformationSync();
    }

    /**
     * 获取MachineID单例实例
     * 遵循Singleton模式确保运行时只有一个实例
     */
    public static getInstance(): MachineID {
        if (!MachineID.instance) {
            MachineID.instance = new MachineID();
        }
        return MachineID.instance;
    }

    /**
     * 返回哈希化的、base64编码的机器标识符
     * 
     * 该值基于平台特定标识符和应用程序名称生成，
     * 然后进行哈希和编码以避免泄露可识别信息。
     * 为许可证、缓存或其他每设备逻辑提供一致的机器ID
     */
    public get machineId(): string {
        return this._machineId;
    }

    /**
     * 返回机器特性加密密钥
     * 
     * 该64位密钥来自用于生成机器ID的相同输入
     * 用于本地数据加密（如缓存的许可证信息），
     * 确保加密内容无法在其他机器上重用或解密
     */
    public get machineSpecificKey(): bigint {
        return this._machineSpecificKey;
    }

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
    private async readInformation(): Promise<void> {
        let id = '';
        const osName = os.platform();
        const appName = 'Serial-Studio-VSCode';

        try {
            switch (osName) {
                case 'linux':
                    id = await this.getLinuxMachineId();
                    break;
                case 'darwin':
                    id = await this.getMacOSMachineId();
                    break;
                case 'win32':
                    id = await this.getWindowsMachineId();
                    break;
                case 'freebsd':
                case 'openbsd':
                case 'netbsd':
                    id = await this.getBSDMachineId();
                    break;
                default:
                    // 回退到网络接口MAC地址
                    id = await this.getFallbackMachineId();
                    break;
            }
        } catch (error) {
            console.warn('Failed to get system machine ID, using fallback:', error);
            id = await this.getFallbackMachineId();
        }

        // 生成基于机器ID、应用程序名称和操作系统的哈希
        const data = `${appName}@${id}:${osName}`;
        
        // 使用BLAKE2s等效的加密哈希（Node.js使用sha256作为替代）
        const hash = crypto.createHash('sha256').update(data, 'utf8').digest();

        // 获取机器ID和加密密钥作为base64字符串
        this._machineId = hash.toString('base64');
        
        // 从哈希的前8字节提取64位密钥
        const keyBuffer = hash.subarray(0, 8);
        this._machineSpecificKey = keyBuffer.readBigUInt64BE(0);
    }

    /**
     * 获取Linux系统的机器ID
     */
    private async getLinuxMachineId(): Promise<string> {
        try {
            // 首先尝试 /var/lib/dbus/machine-id
            const { stdout: machineId1 } = await execAsync('cat /var/lib/dbus/machine-id');
            if (machineId1.trim()) {
                return machineId1.trim();
            }
        } catch {
            // 忽略错误，尝试下一个
        }

        try {
            // 然后尝试 /etc/machine-id
            const { stdout: machineId2 } = await execAsync('cat /etc/machine-id');
            if (machineId2.trim()) {
                return machineId2.trim();
            }
        } catch {
            // 忽略错误，返回空字符串让调用者处理
        }

        throw new Error('Unable to read Linux machine ID');
    }

    /**
     * 获取macOS系统的机器ID
     */
    private async getMacOSMachineId(): Promise<string> {
        try {
            const { stdout } = await execAsync('ioreg -rd1 -c IOPlatformExpertDevice');
            const lines = stdout.split('\n');
            
            for (const line of lines) {
                if (line.includes('IOPlatformUUID')) {
                    const match = line.match(/"([^"]+)"/);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
            }
        } catch {
            // 忽略错误
        }

        throw new Error('Unable to read macOS machine ID');
    }

    /**
     * 获取Windows系统的机器ID
     */
    private async getWindowsMachineId(): Promise<string> {
        let machineGuid = '';
        let uuid = '';

        try {
            // 获取MachineGuid从注册表
            const { stdout: regOutput } = await execAsync(
                'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid'
            );
            const regLines = regOutput.split('\n');
            for (const line of regLines) {
                if (line.includes('MachineGuid')) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 3) {
                        machineGuid = parts[parts.length - 1];
                    }
                    break;
                }
            }
        } catch {
            // 忽略错误
        }

        try {
            // 使用PowerShell获取UUID
            const { stdout: psOutput } = await execAsync(
                'powershell -ExecutionPolicy Bypass -command "(Get-CimInstance -Class Win32_ComputerSystemProduct).UUID"'
            );
            uuid = psOutput.trim();
        } catch {
            // 忽略错误
        }

        // 组合MachineGuid和UUID
        const combinedId = machineGuid + uuid;
        if (combinedId) {
            return combinedId;
        }

        throw new Error('Unable to read Windows machine ID');
    }

    /**
     * 获取BSD系统的机器ID
     */
    private async getBSDMachineId(): Promise<string> {
        try {
            // 尝试 /etc/hostid
            const { stdout: hostId } = await execAsync('cat /etc/hostid');
            if (hostId.trim()) {
                return hostId.trim();
            }
        } catch {
            // 忽略错误，尝试下一个
        }

        try {
            // 尝试 kenv 命令
            const { stdout: kenvOutput } = await execAsync('kenv -q smbios.system.uuid');
            if (kenvOutput.trim()) {
                return kenvOutput.trim();
            }
        } catch {
            // 忽略错误
        }

        throw new Error('Unable to read BSD machine ID');
    }

    /**
     * 回退方案：使用网络接口信息生成机器ID
     */
    private async getFallbackMachineId(): Promise<string> {
        const networkInterfaces = os.networkInterfaces();
        const macs: string[] = [];

        // 收集所有非虚拟网络接口的MAC地址
        for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            if (interfaces && !name.startsWith('lo') && !name.startsWith('docker')) {
                for (const iface of interfaces) {
                    if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
                        macs.push(iface.mac);
                    }
                }
            }
        }

        if (macs.length > 0) {
            // 使用第一个有效的MAC地址和主机名
            const hostname = os.hostname();
            const cpuInfo = os.cpus()[0]?.model || 'unknown';
            return `${macs[0]}-${hostname}-${cpuInfo}`;
        }

        // 最后的回退方案
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        return `${hostname}-${platform}-${arch}-${Date.now()}`;
    }

    /**
     * 同步版本的信息读取（用于测试和简单场景）
     */
    private readInformationSync(): void {
        // 使用系统信息作为回退方案
        const networkInterfaces = os.networkInterfaces();
        const macs: string[] = [];

        // 收集MAC地址
        for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            if (interfaces && !name.startsWith('lo') && !name.startsWith('docker')) {
                for (const iface of interfaces) {
                    if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
                        macs.push(iface.mac);
                    }
                }
            }
        }

        let id: string;
        if (macs.length > 0) {
            const hostname = os.hostname();
            const cpuInfo = os.cpus()[0]?.model || 'unknown';
            id = `${macs[0]}-${hostname}-${cpuInfo}`;
        } else {
            const hostname = os.hostname();
            const platform = os.platform();
            const arch = os.arch();
            id = `${hostname}-${platform}-${arch}`;
        }

        const osName = os.platform();
        const appName = 'Serial-Studio-VSCode';

        // 生成基于机器ID、应用程序名称和操作系统的哈希
        const data = `${appName}@${id}:${osName}`;
        
        // 使用Node.js内置crypto进行哈希
        const hash = crypto.createHash('sha256').update(data, 'utf8').digest();

        // 获取机器ID和加密密钥
        this._machineId = hash.toString('base64');
        
        // 从哈希的前8字节提取64位密钥
        const keyBuffer = hash.subarray(0, 8);
        this._machineSpecificKey = keyBuffer.readBigUInt64BE(0);
    }
}
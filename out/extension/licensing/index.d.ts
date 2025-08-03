export { MachineID } from './MachineID';
export { SimpleCrypt, ProtectionMode } from './SimpleCrypt';
export { LicenseManager, LicenseInfo, LicenseManagerEvents } from './LicenseManager';
export { FeatureGate, FeatureDefinition, LicenseType, FallbackBehavior, FeatureCheckResult } from './FeatureGate';
export { ConfigurationManager, ConfigurationType, ConfigurationItem, ConfigurationChangeEvent, SyncOptions } from './ConfigurationManager';
import * as vscode from 'vscode';
import { LicenseManager } from './LicenseManager';
import { FeatureGate } from './FeatureGate';
import { ConfigurationManager } from './ConfigurationManager';
/**
 * 许可证系统管理器
 * 提供统一的许可证系统访问接口
 */
export declare class LicensingSystem {
    private static instance;
    readonly licenseManager: LicenseManager;
    readonly featureGate: FeatureGate;
    readonly configurationManager: ConfigurationManager;
    private constructor();
    /**
     * 初始化许可证系统
     * @param context VSCode扩展上下文
     */
    static initialize(context: vscode.ExtensionContext): Promise<LicensingSystem>;
    /**
     * 获取许可证系统实例
     */
    static getInstance(): LicensingSystem;
    /**
     * 执行系统设置
     */
    private setup;
    /**
     * 注册VSCode命令
     */
    private registerCommands;
    /**
     * 执行初始许可证检查
     */
    private performInitialLicenseCheck;
    /**
     * 获取系统状态摘要
     */
    getSystemStatus(): {
        isActivated: boolean;
        licenseType: string;
        availableFeatures: number;
        totalFeatures: number;
    };
    /**
     * 检查特性是否可用（便捷方法）
     * @param featureId 特性ID
     */
    isFeatureAvailable(featureId: string): boolean;
    /**
     * 要求特性访问权限（便捷方法）
     * @param featureId 特性ID
     * @param showUpgradePrompt 是否显示升级提示
     */
    requireFeature(featureId: string, showUpgradePrompt?: boolean): Promise<boolean>;
    /**
     * 获取配置值（便捷方法）
     * @param key 配置键
     * @param defaultValue 默认值
     */
    getConfig<T>(key: string, defaultValue?: T): T;
    /**
     * 设置配置值（便捷方法）
     * @param key 配置键
     * @param value 配置值
     */
    setConfig<T>(key: string, value: T): Promise<boolean>;
    /**
     * 清理系统资源
     */
    dispose(): void;
}
/**
 * 便捷的初始化函数
 * @param context VSCode扩展上下文
 */
export declare function initializeLicensing(context: vscode.ExtensionContext): Promise<LicensingSystem>;
/**
 * 获取许可证系统实例的便捷函数
 */
export declare function getLicensingSystem(): LicensingSystem;
//# sourceMappingURL=index.d.ts.map
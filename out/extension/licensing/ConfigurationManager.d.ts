import * as vscode from 'vscode';
/**
 * 配置类型枚举
 */
export declare enum ConfigurationType {
    /** 用户配置 */
    User = "user",
    /** 工作区配置 */
    Workspace = "workspace",
    /** 全局配置 */
    Global = "global",
    /** 许可证配置 */
    License = "license"
}
/**
 * 配置项定义接口
 */
export interface ConfigurationItem {
    /** 配置键 */
    key: string;
    /** 配置值 */
    value: any;
    /** 配置类型 */
    type: ConfigurationType;
    /** 是否加密存储 */
    encrypted: boolean;
    /** 是否需要许可证 */
    requiresLicense: boolean;
    /** 所需特性 */
    requiredFeature?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 验证函数 */
    validator?: (value: any) => boolean;
    /** 描述 */
    description?: string;
}
/**
 * 配置变更事件接口
 */
export interface ConfigurationChangeEvent {
    /** 变更的键 */
    key: string;
    /** 旧值 */
    oldValue: any;
    /** 新值 */
    newValue: any;
    /** 配置类型 */
    type: ConfigurationType;
}
/**
 * 配置同步选项接口
 */
export interface SyncOptions {
    /** 是否同步用户配置 */
    syncUserConfig: boolean;
    /** 是否同步工作区配置 */
    syncWorkspaceConfig: boolean;
    /** 是否同步许可证配置 */
    syncLicenseConfig: boolean;
    /** 同步服务器URL */
    syncServerUrl?: string;
    /** 同步令牌 */
    syncToken?: string;
}
/**
 * ConfigurationManager - 配置管理和同步系统
 *
 * 基于Serial-Studio配置管理机制的TypeScript实现
 * 提供统一的配置管理、加密存储和跨设备同步功能
 *
 * 核心功能：
 * - 多层级配置管理（全局、工作区、用户）
 * - 敏感配置的加密存储
 * - 基于许可证的配置访问控制
 * - 配置验证和类型安全
 * - 跨设备配置同步（企业版特性）
 * - 配置变更监听和通知
 *
 * 设计原则：
 * - 类型安全的配置访问
 * - 敏感信息的安全存储
 * - 优雅的配置迁移和升级
 * - 高性能的配置读写
 * - 完整的错误处理和恢复
 */
export declare class ConfigurationManager {
    private static instance;
    private context;
    private licenseManager;
    private featureGate;
    private simpleCrypt;
    private machineId;
    private configurationItems;
    private changeListeners;
    private configCache;
    private syncInProgress;
    private static readonly BUILT_IN_CONFIGURATIONS;
    /**
     * 私有构造函数
     * @param context VSCode扩展上下文
     */
    private constructor();
    /**
     * 获取配置管理器单例实例
     * @param context VSCode扩展上下文
     */
    static getInstance(context?: vscode.ExtensionContext): ConfigurationManager;
    /**
     * 获取配置值
     * @param key 配置键
     * @param defaultValue 默认值
     * @returns 配置值
     */
    get<T>(key: string, defaultValue?: T): T;
    /**
     * 设置配置值
     * @param key 配置键
     * @param value 配置值
     * @returns 是否设置成功
     */
    set<T>(key: string, value: T): Promise<boolean>;
    /**
     * 重置配置到默认值
     * @param key 配置键
     */
    reset(key: string): Promise<boolean>;
    /**
     * 检查配置是否存在
     * @param key 配置键
     */
    has(key: string): boolean;
    /**
     * 获取所有配置键
     */
    getKeys(): string[];
    /**
     * 获取配置项定义
     * @param key 配置键
     */
    getConfigurationItem(key: string): ConfigurationItem | undefined;
    /**
     * 同步配置到服务器
     * @param options 同步选项
     */
    syncToServer(options: SyncOptions): Promise<boolean>;
    /**
     * 从服务器同步配置
     * @param options 同步选项
     */
    syncFromServer(options: SyncOptions): Promise<boolean>;
    /**
     * 添加配置变更监听器
     * @param listener 监听器函数
     */
    onConfigurationChanged(listener: (event: ConfigurationChangeEvent) => void): vscode.Disposable;
    /**
     * 触发配置变更通知
     * @param event 变更事件
     */
    private notifyConfigurationChange;
    /**
     * 初始化配置定义
     */
    private initializeConfigurations;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 获取用户配置
     */
    private getUserConfiguration;
    /**
     * 设置用户配置
     */
    private setUserConfiguration;
    /**
     * 获取工作区配置
     */
    private getWorkspaceConfiguration;
    /**
     * 设置工作区配置
     */
    private setWorkspaceConfiguration;
    /**
     * 获取全局配置
     */
    private getGlobalConfiguration;
    /**
     * 设置全局配置
     */
    private setGlobalConfiguration;
    /**
     * 获取许可证配置
     */
    private getLicenseConfiguration;
    /**
     * 设置许可证配置
     */
    private setLicenseConfiguration;
    /**
     * 准备同步配置数据
     */
    private prepareConfigForSync;
}
//# sourceMappingURL=ConfigurationManager.d.ts.map
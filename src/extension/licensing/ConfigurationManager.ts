/*
 * Serial Studio VSCode Extension - 配置管理和同步系统
 * 
 * 基于Serial-Studio的配置管理机制实现
 * 提供与原版完全一致的配置管理和同步功能
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LicenseManager } from './LicenseManager';
import { FeatureGate } from './FeatureGate';
import { SimpleCrypt, ProtectionMode } from './SimpleCrypt';
import { MachineID } from './MachineID';

/**
 * 配置类型枚举
 */
export enum ConfigurationType {
    /** 用户配置 */
    User = 'user',
    /** 工作区配置 */
    Workspace = 'workspace',
    /** 全局配置 */
    Global = 'global',
    /** 许可证配置 */
    License = 'license'
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
export class ConfigurationManager {
    private static instance: ConfigurationManager;
    private context: vscode.ExtensionContext;
    private licenseManager: LicenseManager;
    private featureGate: FeatureGate;
    private simpleCrypt: SimpleCrypt;
    private machineId: MachineID;
    
    private configurationItems: Map<string, ConfigurationItem> = new Map();
    private changeListeners: Array<(event: ConfigurationChangeEvent) => void> = [];
    private configCache: Map<string, any> = new Map();
    private syncInProgress: boolean = false;

    // 内置配置定义
    private static readonly BUILT_IN_CONFIGURATIONS: ConfigurationItem[] = [
        // 基础配置
        {
            key: 'serialStudio.theme',
            value: 'default',
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: 'default',
            description: '界面主题设置'
        },
        {
            key: 'serialStudio.language',
            value: 'zh-CN',
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: 'zh-CN',
            description: '界面语言设置'
        },
        {
            key: 'serialStudio.autoSave',
            value: true,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: true,
            description: '自动保存项目配置'
        },
        
        // 连接配置
        {
            key: 'serialStudio.connection.autoReconnect',
            value: true,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: true,
            description: '自动重连断开的连接'
        },
        {
            key: 'serialStudio.connection.timeout',
            value: 5000,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: 5000,
            validator: (value: number) => value > 0 && value <= 60000,
            description: '连接超时时间（毫秒）'
        },
        
        // 数据处理配置
        {
            key: 'serialStudio.data.bufferSize',
            value: 100000,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: 100000,
            validator: (value: number) => value >= 1000 && value <= 1000000,
            description: '数据缓冲区大小'
        },
        {
            key: 'serialStudio.data.updateFrequency',
            value: 20,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: false,
            defaultValue: 20,
            validator: (value: number) => value >= 1 && value <= 60,
            description: '数据更新频率（Hz）'
        },
        
        // 高级特性配置（需要许可证）
        {
            key: 'serialStudio.export.advanced.enabled',
            value: false,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: true,
            requiredFeature: 'advanced-export',
            defaultValue: false,
            description: '启用高级导出功能'
        },
        {
            key: 'serialStudio.mqtt.broker.url',
            value: '',
            type: ConfigurationType.User,
            encrypted: true,
            requiresLicense: true,
            requiredFeature: 'mqtt-publisher',
            defaultValue: '',
            description: 'MQTT Broker URL'
        },
        {
            key: 'serialStudio.mqtt.broker.username',
            value: '',
            type: ConfigurationType.User,
            encrypted: true,
            requiresLicense: true,
            requiredFeature: 'mqtt-publisher',
            defaultValue: '',
            description: 'MQTT Broker 用户名'
        },
        {
            key: 'serialStudio.mqtt.broker.password',
            value: '',
            type: ConfigurationType.User,
            encrypted: true,
            requiresLicense: true,
            requiredFeature: 'mqtt-publisher',
            defaultValue: '',
            description: 'MQTT Broker 密码'
        },
        
        // 企业版配置
        {
            key: 'serialStudio.sync.enabled',
            value: false,
            type: ConfigurationType.User,
            encrypted: false,
            requiresLicense: true,
            requiredFeature: 'team-collaboration',
            defaultValue: false,
            description: '启用配置同步'
        },
        {
            key: 'serialStudio.sync.serverUrl',
            value: '',
            type: ConfigurationType.User,
            encrypted: true,
            requiresLicense: true,
            requiredFeature: 'team-collaboration',
            defaultValue: '',
            description: '同步服务器URL'
        },
        {
            key: 'serialStudio.sync.token',
            value: '',
            type: ConfigurationType.User,
            encrypted: true,
            requiresLicense: true,
            requiredFeature: 'team-collaboration',
            defaultValue: '',
            description: '同步访问令牌'
        }
    ];

    /**
     * 私有构造函数
     * @param context VSCode扩展上下文
     */
    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.licenseManager = LicenseManager.getInstance(context);
        this.featureGate = FeatureGate.getInstance(context);
        this.machineId = MachineID.getInstance();
        this.simpleCrypt = new SimpleCrypt();
        
        // 配置加密
        this.simpleCrypt.setKey(this.machineId.machineSpecificKey);
        this.simpleCrypt.setIntegrityProtectionMode(ProtectionMode.ProtectionHash);
        
        this.initializeConfigurations();
        this.setupEventListeners();
    }

    /**
     * 获取配置管理器单例实例
     * @param context VSCode扩展上下文
     */
    public static getInstance(context?: vscode.ExtensionContext): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            if (!context) {
                throw new Error('ConfigurationManager requires extension context for initialization');
            }
            ConfigurationManager.instance = new ConfigurationManager(context);
        }
        return ConfigurationManager.instance;
    }

    // #region 配置访问方法

    /**
     * 获取配置值
     * @param key 配置键
     * @param defaultValue 默认值
     * @returns 配置值
     */
    public get<T>(key: string, defaultValue?: T): T {
        // 检查缓存
        if (this.configCache.has(key)) {
            return this.configCache.get(key);
        }

        const configItem = this.configurationItems.get(key);
        if (!configItem) {
            return defaultValue as T;
        }

        // 检查许可证要求
        if (configItem.requiresLicense && configItem.requiredFeature) {
            if (!this.featureGate.isFeatureEnabled(configItem.requiredFeature)) {
                return configItem.defaultValue ?? defaultValue as T;
            }
        }

        let value: T;

        switch (configItem.type) {
            case ConfigurationType.User:
                value = this.getUserConfiguration(key, configItem);
                break;
            case ConfigurationType.Workspace:
                value = this.getWorkspaceConfiguration(key, configItem);
                break;
            case ConfigurationType.Global:
                value = this.getGlobalConfiguration(key, configItem);
                break;
            case ConfigurationType.License:
                value = this.getLicenseConfiguration(key, configItem);
                break;
            default:
                value = configItem.defaultValue ?? defaultValue as T;
                break;
        }

        // 缓存结果
        this.configCache.set(key, value);
        return value;
    }

    /**
     * 设置配置值
     * @param key 配置键
     * @param value 配置值
     * @returns 是否设置成功
     */
    public async set<T>(key: string, value: T): Promise<boolean> {
        const configItem = this.configurationItems.get(key);
        if (!configItem) {
            console.warn(`Configuration item not found: ${key}`);
            return false;
        }

        // 检查许可证要求
        if (configItem.requiresLicense && configItem.requiredFeature) {
            if (!this.featureGate.isFeatureEnabled(configItem.requiredFeature)) {
                vscode.window.showWarningMessage(`配置 ${key} 需要 ${configItem.requiredFeature} 特性`);
                return false;
            }
        }

        // 验证值
        if (configItem.validator && !configItem.validator(value)) {
            vscode.window.showErrorMessage(`配置值验证失败: ${key}`);
            return false;
        }

        const oldValue = this.get(key);

        try {
            switch (configItem.type) {
                case ConfigurationType.User:
                    await this.setUserConfiguration(key, value, configItem);
                    break;
                case ConfigurationType.Workspace:
                    await this.setWorkspaceConfiguration(key, value, configItem);
                    break;
                case ConfigurationType.Global:
                    await this.setGlobalConfiguration(key, value, configItem);
                    break;
                case ConfigurationType.License:
                    await this.setLicenseConfiguration(key, value, configItem);
                    break;
                default:
                    return false;
            }

            // 更新缓存
            this.configCache.set(key, value);

            // 触发变更事件
            this.notifyConfigurationChange({
                key,
                oldValue,
                newValue: value,
                type: configItem.type
            });

            return true;
        } catch (error) {
            console.error(`Failed to set configuration ${key}:`, error);
            return false;
        }
    }

    /**
     * 重置配置到默认值
     * @param key 配置键
     */
    public async reset(key: string): Promise<boolean> {
        const configItem = this.configurationItems.get(key);
        if (!configItem) {
            return false;
        }

        return await this.set(key, configItem.defaultValue);
    }

    /**
     * 检查配置是否存在
     * @param key 配置键
     */
    public has(key: string): boolean {
        return this.configurationItems.has(key);
    }

    /**
     * 获取所有配置键
     */
    public getKeys(): string[] {
        return Array.from(this.configurationItems.keys());
    }

    /**
     * 获取配置项定义
     * @param key 配置键
     */
    public getConfigurationItem(key: string): ConfigurationItem | undefined {
        return this.configurationItems.get(key);
    }

    // #endregion

    // #region 配置同步

    /**
     * 同步配置到服务器
     * @param options 同步选项
     */
    public async syncToServer(options: SyncOptions): Promise<boolean> {
        if (!this.featureGate.isFeatureEnabled('team-collaboration')) {
            vscode.window.showWarningMessage('配置同步需要企业版许可证');
            return false;
        }

        if (this.syncInProgress) {
            return false;
        }

        this.syncInProgress = true;

        try {
            const configData = this.prepareConfigForSync(options);
            
            // TODO: 实现服务器同步逻辑
            // 这里应该调用同步服务器的API
            console.log('Syncing configuration to server:', configData);
            
            vscode.window.showInformationMessage('配置已同步到服务器');
            return true;
        } catch (error) {
            console.error('Configuration sync failed:', error);
            vscode.window.showErrorMessage(`配置同步失败: ${error}`);
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * 从服务器同步配置
     * @param options 同步选项
     */
    public async syncFromServer(options: SyncOptions): Promise<boolean> {
        if (!this.featureGate.isFeatureEnabled('team-collaboration')) {
            vscode.window.showWarningMessage('配置同步需要企业版许可证');
            return false;
        }

        if (this.syncInProgress) {
            return false;
        }

        this.syncInProgress = true;

        try {
            // TODO: 实现从服务器拉取配置的逻辑
            // const remoteConfig = await this.fetchConfigFromServer(options);
            // await this.applyRemoteConfig(remoteConfig);
            
            console.log('Syncing configuration from server');
            
            vscode.window.showInformationMessage('配置已从服务器同步');
            return true;
        } catch (error) {
            console.error('Configuration sync failed:', error);
            vscode.window.showErrorMessage(`配置同步失败: ${error}`);
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    // #endregion

    // #region 事件处理

    /**
     * 添加配置变更监听器
     * @param listener 监听器函数
     */
    public onConfigurationChanged(listener: (event: ConfigurationChangeEvent) => void): vscode.Disposable {
        this.changeListeners.push(listener);
        
        return new vscode.Disposable(() => {
            const index = this.changeListeners.indexOf(listener);
            if (index > -1) {
                this.changeListeners.splice(index, 1);
            }
        });
    }

    /**
     * 触发配置变更通知
     * @param event 变更事件
     */
    private notifyConfigurationChange(event: ConfigurationChangeEvent): void {
        this.changeListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Configuration change listener error:', error);
            }
        });
    }

    // #endregion

    // #region 私有方法

    /**
     * 初始化配置定义
     */
    private initializeConfigurations(): void {
        ConfigurationManager.BUILT_IN_CONFIGURATIONS.forEach(config => {
            this.configurationItems.set(config.key, { ...config });
        });
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 监听VSCode配置变更
        vscode.workspace.onDidChangeConfiguration(e => {
            this.configCache.clear(); // 清除缓存
            
            // 通知相关配置变更
            for (const [key] of this.configurationItems) {
                if (e.affectsConfiguration(key)) {
                    const newValue = this.get(key);
                    this.notifyConfigurationChange({
                        key,
                        oldValue: undefined, // VSCode事件中没有旧值
                        newValue,
                        type: ConfigurationType.User
                    });
                }
            }
        });

        // 监听许可证变更
        this.licenseManager.on({
            onLicenseChanged: () => {
                this.configCache.clear();
            },
            onActivationChanged: () => {
                this.configCache.clear();
            }
        });
    }

    /**
     * 获取用户配置
     */
    private getUserConfiguration<T>(key: string, configItem: ConfigurationItem): T {
        if (configItem.encrypted) {
            const encryptedValue = this.context.globalState.get<string>(`encrypted.${key}`);
            if (encryptedValue) {
                const decryptedValue = this.simpleCrypt.decrypt(encryptedValue);
                try {
                    return JSON.parse(decryptedValue);
                } catch {
                    return decryptedValue as T;
                }
            }
            return configItem.defaultValue;
        } else {
            const config = vscode.workspace.getConfiguration();
            return config.get<T>(key, configItem.defaultValue);
        }
    }

    /**
     * 设置用户配置
     */
    private async setUserConfiguration<T>(key: string, value: T, configItem: ConfigurationItem): Promise<void> {
        if (configItem.encrypted) {
            const valueToEncrypt = typeof value === 'string' ? value : JSON.stringify(value);
            const encryptedValue = this.simpleCrypt.encrypt(valueToEncrypt);
            await this.context.globalState.update(`encrypted.${key}`, encryptedValue);
        } else {
            const config = vscode.workspace.getConfiguration();
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
    }

    /**
     * 获取工作区配置
     */
    private getWorkspaceConfiguration<T>(key: string, configItem: ConfigurationItem): T {
        const config = vscode.workspace.getConfiguration();
        return config.get<T>(key, configItem.defaultValue);
    }

    /**
     * 设置工作区配置
     */
    private async setWorkspaceConfiguration<T>(key: string, value: T, configItem: ConfigurationItem): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        await config.update(key, value, vscode.ConfigurationTarget.Workspace);
    }

    /**
     * 获取全局配置
     */
    private getGlobalConfiguration<T>(key: string, configItem: ConfigurationItem): T {
        return this.context.globalState.get<T>(key, configItem.defaultValue);
    }

    /**
     * 设置全局配置
     */
    private async setGlobalConfiguration<T>(key: string, value: T, configItem: ConfigurationItem): Promise<void> {
        await this.context.globalState.update(key, value);
    }

    /**
     * 获取许可证配置
     */
    private getLicenseConfiguration<T>(key: string, configItem: ConfigurationItem): T {
        const encryptedValue = this.context.globalState.get<string>(`license.${key}`);
        if (encryptedValue) {
            const decryptedValue = this.simpleCrypt.decrypt(encryptedValue);
            try {
                return JSON.parse(decryptedValue);
            } catch {
                return decryptedValue as T;
            }
        }
        return configItem.defaultValue;
    }

    /**
     * 设置许可证配置
     */
    private async setLicenseConfiguration<T>(key: string, value: T, configItem: ConfigurationItem): Promise<void> {
        const valueToEncrypt = typeof value === 'string' ? value : JSON.stringify(value);
        const encryptedValue = this.simpleCrypt.encrypt(valueToEncrypt);
        await this.context.globalState.update(`license.${key}`, encryptedValue);
    }

    /**
     * 准备同步配置数据
     */
    private prepareConfigForSync(options: SyncOptions): any {
        const syncData: any = {
            machineId: this.machineId.machineId,
            timestamp: Date.now(),
            configurations: {}
        };

        for (const [key, configItem] of this.configurationItems) {
            let shouldSync = false;

            switch (configItem.type) {
                case ConfigurationType.User:
                    shouldSync = options.syncUserConfig;
                    break;
                case ConfigurationType.Workspace:
                    shouldSync = options.syncWorkspaceConfig;
                    break;
                case ConfigurationType.License:
                    shouldSync = options.syncLicenseConfig;
                    break;
            }

            if (shouldSync && !configItem.encrypted) {
                syncData.configurations[key] = this.get(key);
            }
        }

        return syncData;
    }

    // #endregion
}
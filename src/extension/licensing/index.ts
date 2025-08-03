/*
 * Serial Studio VSCode Extension - 许可证管理系统入口
 * 
 * 统一导出所有许可证相关的类和接口
 * 提供简化的初始化和使用API
 */

// 核心类导出
export { MachineID } from './MachineID';
export { SimpleCrypt, ProtectionMode } from './SimpleCrypt';
export { LicenseManager, LicenseInfo, LicenseManagerEvents } from './LicenseManager';
export { FeatureGate, FeatureDefinition, LicenseType, FallbackBehavior, FeatureCheckResult } from './FeatureGate';
export { ConfigurationManager, ConfigurationType, ConfigurationItem, ConfigurationChangeEvent, SyncOptions } from './ConfigurationManager';

// 便捷的初始化函数
import * as vscode from 'vscode';
import { LicenseManager } from './LicenseManager';
import { FeatureGate } from './FeatureGate';
import { ConfigurationManager } from './ConfigurationManager';

/**
 * 许可证系统管理器
 * 提供统一的许可证系统访问接口
 */
export class LicensingSystem {
    private static instance: LicensingSystem;
    
    public readonly licenseManager: LicenseManager;
    public readonly featureGate: FeatureGate;
    public readonly configurationManager: ConfigurationManager;

    private constructor(context: vscode.ExtensionContext) {
        this.licenseManager = LicenseManager.getInstance(context);
        this.featureGate = FeatureGate.getInstance(context);
        this.configurationManager = ConfigurationManager.getInstance(context);
    }

    /**
     * 初始化许可证系统
     * @param context VSCode扩展上下文
     */
    public static async initialize(context: vscode.ExtensionContext): Promise<LicensingSystem> {
        if (!LicensingSystem.instance) {
            LicensingSystem.instance = new LicensingSystem(context);
            await LicensingSystem.instance.setup();
        }
        return LicensingSystem.instance;
    }

    /**
     * 获取许可证系统实例
     */
    public static getInstance(): LicensingSystem {
        if (!LicensingSystem.instance) {
            throw new Error('LicensingSystem not initialized. Call initialize() first.');
        }
        return LicensingSystem.instance;
    }

    /**
     * 执行系统设置
     */
    private async setup(): Promise<void> {
        // 注册VSCode命令
        this.registerCommands();
        
        // 启动许可证验证
        await this.performInitialLicenseCheck();
    }

    /**
     * 注册VSCode命令
     */
    private registerCommands(): void {
        const commands = [
            // 许可证管理命令
            vscode.commands.registerCommand('serialStudio.licensing.activate', async () => {
                const licenseKey = await vscode.window.showInputBox({
                    prompt: '请输入许可证密钥',
                    placeHolder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    validateInput: (value) => {
                        if (!value || value.length !== 36) {
                            return '许可证密钥格式无效';
                        }
                        return null;
                    }
                });

                if (licenseKey) {
                    this.licenseManager.setLicenseKey(licenseKey);
                    const success = await this.licenseManager.activate();
                    if (success) {
                        vscode.window.showInformationMessage('许可证激活成功！');
                    }
                }
            }),

            vscode.commands.registerCommand('serialStudio.licensing.deactivate', async () => {
                const confirm = await vscode.window.showWarningMessage(
                    '确定要停用此设备上的许可证吗？',
                    '停用',
                    '取消'
                );

                if (confirm === '停用') {
                    const success = await this.licenseManager.deactivate();
                    if (success) {
                        vscode.window.showInformationMessage('许可证已停用');
                    }
                }
            }),

            vscode.commands.registerCommand('serialStudio.licensing.validate', async () => {
                const success = await this.licenseManager.validate();
                if (success) {
                    vscode.window.showInformationMessage('许可证验证成功');
                } else {
                    vscode.window.showWarningMessage('许可证验证失败');
                }
            }),

            vscode.commands.registerCommand('serialStudio.licensing.buy', async () => {
                await this.licenseManager.buy();
            }),

            vscode.commands.registerCommand('serialStudio.licensing.status', async () => {
                await this.featureGate.showLicenseStatus();
            }),

            // 配置管理命令
            vscode.commands.registerCommand('serialStudio.config.reset', async () => {
                const keys = this.configurationManager.getKeys();
                const selected = await vscode.window.showQuickPick(keys, {
                    title: '选择要重置的配置',
                    placeHolder: '选择配置项'
                });

                if (selected) {
                    const success = await this.configurationManager.reset(selected);
                    if (success) {
                        vscode.window.showInformationMessage(`配置 ${selected} 已重置`);
                    }
                }
            }),

            vscode.commands.registerCommand('serialStudio.config.sync.upload', async () => {
                const options: import('./ConfigurationManager').SyncOptions = {
                    syncUserConfig: true,
                    syncWorkspaceConfig: false,
                    syncLicenseConfig: false
                };

                const success = await this.configurationManager.syncToServer(options);
                if (success) {
                    vscode.window.showInformationMessage('配置已上传到服务器');
                }
            }),

            vscode.commands.registerCommand('serialStudio.config.sync.download', async () => {
                const options: import('./ConfigurationManager').SyncOptions = {
                    syncUserConfig: true,
                    syncWorkspaceConfig: false,
                    syncLicenseConfig: false
                };

                const success = await this.configurationManager.syncFromServer(options);
                if (success) {
                    vscode.window.showInformationMessage('配置已从服务器下载');
                }
            })
        ];

        // 所有命令都会在扩展停用时自动释放
        commands.forEach(cmd => {
            if (vscode.extensions.getExtension('your-extension-id')?.isActive) {
                // 如果需要手动管理命令生命周期，可以在这里保存disposable
            }
        });
    }

    /**
     * 执行初始许可证检查
     */
    private async performInitialLicenseCheck(): Promise<void> {
        try {
            // 如果已激活，进行验证
            if (this.licenseManager.isActivated) {
                await this.licenseManager.validate();
            }
        } catch (error) {
            console.warn('Initial license check failed:', error);
        }
    }

    /**
     * 获取系统状态摘要
     */
    public getSystemStatus(): {
        isActivated: boolean;
        licenseType: string;
        availableFeatures: number;
        totalFeatures: number;
    } {
        const availableFeatures = this.featureGate.getAvailableFeatures();
        const allFeatures = this.featureGate.getAllFeatures();

        return {
            isActivated: this.licenseManager.isActivated,
            licenseType: this.licenseManager.variantName || 'Free',
            availableFeatures: availableFeatures.length,
            totalFeatures: allFeatures.size
        };
    }

    /**
     * 检查特性是否可用（便捷方法）
     * @param featureId 特性ID
     */
    public isFeatureAvailable(featureId: string): boolean {
        return this.featureGate.isFeatureEnabled(featureId);
    }

    /**
     * 要求特性访问权限（便捷方法）
     * @param featureId 特性ID
     * @param showUpgradePrompt 是否显示升级提示
     */
    public async requireFeature(featureId: string, showUpgradePrompt: boolean = true): Promise<boolean> {
        return this.featureGate.requireFeature(featureId, showUpgradePrompt);
    }

    /**
     * 获取配置值（便捷方法）
     * @param key 配置键
     * @param defaultValue 默认值
     */
    public getConfig<T>(key: string, defaultValue?: T): T {
        return this.configurationManager.get(key, defaultValue);
    }

    /**
     * 设置配置值（便捷方法）
     * @param key 配置键
     * @param value 配置值
     */
    public async setConfig<T>(key: string, value: T): Promise<boolean> {
        return this.configurationManager.set(key, value);
    }

    /**
     * 清理系统资源
     */
    public dispose(): void {
        // 如果有需要清理的资源，在这里处理
        console.log('LicensingSystem disposed');
    }
}

/**
 * 便捷的初始化函数
 * @param context VSCode扩展上下文
 */
export async function initializeLicensing(context: vscode.ExtensionContext): Promise<LicensingSystem> {
    return LicensingSystem.initialize(context);
}

/**
 * 获取许可证系统实例的便捷函数
 */
export function getLicensingSystem(): LicensingSystem {
    return LicensingSystem.getInstance();
}
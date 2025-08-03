/*
 * Serial Studio VSCode Extension - 特性门控系统
 * 
 * 基于Serial-Studio的特性控制机制实现
 * 提供与原版完全一致的商业特性控制功能
 */

import * as vscode from 'vscode';
import { LicenseManager } from './LicenseManager';

/**
 * 特性定义接口
 */
export interface FeatureDefinition {
    /** 特性ID */
    id: string;
    /** 特性名称 */
    name: string;
    /** 特性描述 */
    description: string;
    /** 所需的最低许可证类型 */
    requiredLicenseType: LicenseType;
    /** 是否为核心特性（影响基本功能） */
    isCore: boolean;
    /** 回退行为 */
    fallbackBehavior?: FallbackBehavior;
}

/**
 * 许可证类型枚举
 */
export enum LicenseType {
    /** 免费版本 */
    Free = 'free',
    /** 专业版 */
    Pro = 'pro',
    /** 企业版 */
    Enterprise = 'enterprise'
}

/**
 * 回退行为枚举
 */
export enum FallbackBehavior {
    /** 隐藏功能 */
    Hide = 'hide',
    /** 显示但禁用 */
    Disable = 'disable',
    /** 显示升级提示 */
    ShowUpgrade = 'show_upgrade',
    /** 使用基础实现 */
    UseBasic = 'use_basic'
}

/**
 * 特性检查结果接口
 */
export interface FeatureCheckResult {
    /** 是否允许访问 */
    allowed: boolean;
    /** 当前许可证类型 */
    currentLicenseType: LicenseType;
    /** 所需许可证类型 */
    requiredLicenseType: LicenseType;
    /** 回退行为 */
    fallbackBehavior?: FallbackBehavior;
    /** 升级URL */
    upgradeUrl?: string;
    /** 提示信息 */
    message?: string;
}

/**
 * FeatureGate - 特性门控管理器
 * 
 * 基于Serial-Studio的特性控制机制的TypeScript实现
 * 提供细粒度的商业特性访问控制
 * 
 * 核心功能：
 * - 检查特性是否对当前许可证可用
 * - 提供优雅的降级体验
 * - 集成升级提示和购买流程
 * - 支持特性的动态启用/禁用
 * - 与VSCode命令和菜单系统集成
 * 
 * 设计原则：
 * - 对免费用户友好，不阻碍基本功能
 * - 为付费特性提供清晰的价值演示
 * - 平滑的升级路径和用户体验
 * - 防止许可证绕过和滥用
 */
export class FeatureGate {
    private static instance: FeatureGate;
    private licenseManager: LicenseManager;
    private features: Map<string, FeatureDefinition> = new Map();
    private context: vscode.ExtensionContext;

    /**
     * 私有构造函数
     * @param context VSCode扩展上下文
     */
    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.licenseManager = LicenseManager.getInstance(context);
        this.initializeFeatures();
        this.setupLicenseListeners();
    }

    /**
     * 获取特性门控单例实例
     * @param context VSCode扩展上下文
     */
    public static getInstance(context?: vscode.ExtensionContext): FeatureGate {
        if (!FeatureGate.instance) {
            if (!context) {
                throw new Error('FeatureGate requires extension context for initialization');
            }
            FeatureGate.instance = new FeatureGate(context);
        }
        return FeatureGate.instance;
    }

    /**
     * 检查特性是否可用
     * @param featureId 特性ID
     * @returns 特性检查结果
     */
    public checkFeature(featureId: string): FeatureCheckResult {
        const feature = this.features.get(featureId);
        if (!feature) {
            return {
                allowed: false,
                currentLicenseType: this.getCurrentLicenseType(),
                requiredLicenseType: LicenseType.Free,
                message: `未知特性: ${featureId}`
            };
        }

        const currentLicenseType = this.getCurrentLicenseType();
        const allowed = this.isLicenseTypeSufficient(currentLicenseType, feature.requiredLicenseType);

        return {
            allowed,
            currentLicenseType,
            requiredLicenseType: feature.requiredLicenseType,
            fallbackBehavior: feature.fallbackBehavior,
            upgradeUrl: allowed ? undefined : 'https://serialstudio.io/pricing',
            message: allowed ? undefined : this.getUpgradeMessage(feature)
        };
    }

    /**
     * 检查特性是否启用（简化版本）
     * @param featureId 特性ID
     * @returns 是否启用
     */
    public isFeatureEnabled(featureId: string): boolean {
        return this.checkFeature(featureId).allowed;
    }

    /**
     * 要求特性访问权限，如果没有权限则显示升级提示
     * @param featureId 特性ID
     * @param showUpgradePrompt 是否显示升级提示
     * @returns 是否有访问权限
     */
    public async requireFeature(featureId: string, showUpgradePrompt: boolean = true): Promise<boolean> {
        const result = this.checkFeature(featureId);
        
        if (result.allowed) {
            return true;
        }

        if (showUpgradePrompt && result.message) {
            const upgradeAction = '升级许可证';
            const learnMoreAction = '了解更多';
            
            const selection = await vscode.window.showWarningMessage(
                result.message,
                upgradeAction,
                learnMoreAction
            );

            if (selection === upgradeAction) {
                await this.licenseManager.buy();
            } else if (selection === learnMoreAction) {
                await this.showFeatureInfo(featureId);
            }
        }

        return false;
    }

    /**
     * 注册新特性
     * @param feature 特性定义
     */
    public registerFeature(feature: FeatureDefinition): void {
        this.features.set(feature.id, feature);
        this.updateCommandVisibility(feature);
    }

    /**
     * 批量注册特性
     * @param features 特性定义数组
     */
    public registerFeatures(features: FeatureDefinition[]): void {
        features.forEach(feature => this.registerFeature(feature));
    }

    /**
     * 获取所有特性定义
     * @returns 特性定义映射
     */
    public getAllFeatures(): Map<string, FeatureDefinition> {
        return new Map(this.features);
    }

    /**
     * 获取可用特性列表
     * @returns 可用特性ID数组
     */
    public getAvailableFeatures(): string[] {
        const available: string[] = [];
        for (const [featureId] of this.features) {
            if (this.isFeatureEnabled(featureId)) {
                available.push(featureId);
            }
        }
        return available;
    }

    /**
     * 获取不可用特性列表
     * @returns 不可用特性信息数组
     */
    public getUnavailableFeatures(): Array<{ feature: FeatureDefinition; result: FeatureCheckResult }> {
        const unavailable: Array<{ feature: FeatureDefinition; result: FeatureCheckResult }> = [];
        
        for (const [featureId, feature] of this.features) {
            const result = this.checkFeature(featureId);
            if (!result.allowed) {
                unavailable.push({ feature, result });
            }
        }
        
        return unavailable;
    }

    /**
     * 显示许可证状态和特性摘要
     */
    public async showLicenseStatus(): Promise<void> {
        const currentLicense = this.getCurrentLicenseType();
        const totalFeatures = this.features.size;
        const availableFeatures = this.getAvailableFeatures().length;
        const unavailableFeatures = this.getUnavailableFeatures();

        const items: vscode.QuickPickItem[] = [
            {
                label: '$(shield) 许可证状态',
                description: `当前许可证: ${this.getLicenseDisplayName(currentLicense)}`
            },
            {
                label: '$(check) 可用特性',
                description: `${availableFeatures}/${totalFeatures} 个特性可用`
            }
        ];

        if (unavailableFeatures.length > 0) {
            items.push({
                label: '$(lock) 受限特性',
                description: `${unavailableFeatures.length} 个特性需要升级`
            });
        }

        if (!this.licenseManager.isActivated) {
            items.push({
                label: '$(rocket) 升级许可证',
                description: '解锁所有专业特性'
            });
        }

        const selection = await vscode.window.showQuickPick(items, {
            title: 'Serial Studio VSCode - 许可证状态',
            placeHolder: '选择查看详细信息'
        });

        if (selection?.label.includes('升级许可证')) {
            await this.licenseManager.buy();
        } else if (selection?.label.includes('受限特性')) {
            await this.showUnavailableFeatures();
        }
    }

    // #region 私有方法

    /**
     * 初始化内置特性定义
     */
    private initializeFeatures(): void {
        const features: FeatureDefinition[] = [
            // 3D可视化特性
            {
                id: '3d-visualization',
                name: '3D数据可视化',
                description: '实时3D数据图表和立体显示模式',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            // 高级导出特性
            {
                id: 'advanced-export',
                name: '高级数据导出',
                description: '多格式批量导出和自定义导出模板',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.UseBasic
            },
            // MQTT发布器
            {
                id: 'mqtt-publisher',
                name: 'MQTT数据发布',
                description: '将串口数据发布到MQTT broker',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            // CAN总线支持
            {
                id: 'can-bus',
                name: 'CAN总线支持',
                description: 'Controller Area Network协议支持',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            // Modbus支持
            {
                id: 'modbus',
                name: 'Modbus协议支持',
                description: 'Modbus RTU/TCP协议支持',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            // 音频输入
            {
                id: 'audio-input',
                name: '音频数据输入',
                description: '从麦克风或音频设备读取数据',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            // 高级主题
            {
                id: 'advanced-themes',
                name: '高级主题和定制',
                description: '更多主题选项和界面定制功能',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.UseBasic
            },
            // 优先支持
            {
                id: 'priority-support',
                name: '优先客户支持',
                description: '24小时内响应的优先技术支持',
                requiredLicenseType: LicenseType.Pro,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            // 企业特性
            {
                id: 'unlimited-devices',
                name: '无限设备许可',
                description: '在无限数量的设备上使用',
                requiredLicenseType: LicenseType.Enterprise,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            {
                id: 'team-collaboration',
                name: '团队协作功能',
                description: '项目共享和团队协作工具',
                requiredLicenseType: LicenseType.Enterprise,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            {
                id: 'advanced-security',
                name: '高级安全功能',
                description: '数据加密和访问控制',
                requiredLicenseType: LicenseType.Enterprise,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            },
            {
                id: 'custom-branding',
                name: '自定义品牌',
                description: '定制应用外观和品牌元素',
                requiredLicenseType: LicenseType.Enterprise,
                isCore: false,
                fallbackBehavior: FallbackBehavior.ShowUpgrade
            }
        ];

        this.registerFeatures(features);
    }

    /**
     * 设置许可证监听器
     */
    private setupLicenseListeners(): void {
        this.licenseManager.on({
            onLicenseChanged: () => {
                this.updateAllCommandVisibility();
            },
            onActivationChanged: () => {
                this.updateAllCommandVisibility();
            }
        });
    }

    /**
     * 获取当前许可证类型
     */
    private getCurrentLicenseType(): LicenseType {
        if (!this.licenseManager.isActivated) {
            return LicenseType.Free;
        }

        const variantName = this.licenseManager.variantName.toLowerCase();
        
        if (variantName.includes('enterprise')) {
            return LicenseType.Enterprise;
        } else if (variantName.includes('pro')) {
            return LicenseType.Pro;
        } else {
            return LicenseType.Free;
        }
    }

    /**
     * 检查许可证类型是否足够
     * @param current 当前许可证类型
     * @param required 所需许可证类型
     */
    private isLicenseTypeSufficient(current: LicenseType, required: LicenseType): boolean {
        const levels = {
            [LicenseType.Free]: 0,
            [LicenseType.Pro]: 1,
            [LicenseType.Enterprise]: 2
        };

        return levels[current] >= levels[required];
    }

    /**
     * 获取升级消息
     * @param feature 特性定义
     */
    private getUpgradeMessage(feature: FeatureDefinition): string {
        const requiredLicense = this.getLicenseDisplayName(feature.requiredLicenseType);
        return `${feature.name} 需要 ${requiredLicense} 许可证。升级以解锁此功能。`;
    }

    /**
     * 获取许可证显示名称
     * @param licenseType 许可证类型
     */
    private getLicenseDisplayName(licenseType: LicenseType): string {
        switch (licenseType) {
            case LicenseType.Free:
                return '免费版';
            case LicenseType.Pro:
                return '专业版';
            case LicenseType.Enterprise:
                return '企业版';
            default:
                return '未知';
        }
    }

    /**
     * 显示特性信息
     * @param featureId 特性ID
     */
    private async showFeatureInfo(featureId: string): Promise<void> {
        const feature = this.features.get(featureId);
        if (!feature) {return;}

        const message = `**${feature.name}**\n\n${feature.description}\n\n需要: ${this.getLicenseDisplayName(feature.requiredLicenseType)}`;
        
        const upgradeAction = '升级许可证';
        const selection = await vscode.window.showInformationMessage(
            message,
            { modal: true },
            upgradeAction
        );

        if (selection === upgradeAction) {
            await this.licenseManager.buy();
        }
    }

    /**
     * 显示不可用特性列表
     */
    private async showUnavailableFeatures(): Promise<void> {
        const unavailable = this.getUnavailableFeatures();
        
        const items: vscode.QuickPickItem[] = unavailable.map(({ feature, result }) => ({
            label: `$(lock) ${feature.name}`,
            description: `需要 ${this.getLicenseDisplayName(result.requiredLicenseType)}`,
            detail: feature.description
        }));

        items.push({
            label: '$(rocket) 升级许可证',
            description: '解锁所有特性'
        });

        const selection = await vscode.window.showQuickPick(items, {
            title: '受限特性',
            placeHolder: '选择了解更多或升级许可证'
        });

        if (selection?.label.includes('升级许可证')) {
            await this.licenseManager.buy();
        }
    }

    /**
     * 更新命令可见性
     * @param feature 特性定义
     */
    private updateCommandVisibility(feature: FeatureDefinition): void {
        const isEnabled = this.isFeatureEnabled(feature.id);
        
        // 更新上下文变量，用于控制命令和菜单的可见性
        void vscode.commands.executeCommand('setContext', `serialStudio.feature.${feature.id}`, isEnabled);
        
        // 如果特性不可用且回退行为是隐藏，则隐藏相关命令
        if (!isEnabled && feature.fallbackBehavior === FallbackBehavior.Hide) {
            void vscode.commands.executeCommand('setContext', `serialStudio.feature.${feature.id}.visible`, false);
        } else {
            void vscode.commands.executeCommand('setContext', `serialStudio.feature.${feature.id}.visible`, true);
        }
    }

    /**
     * 更新所有命令可见性
     */
    private updateAllCommandVisibility(): void {
        for (const [, feature] of this.features) {
            this.updateCommandVisibility(feature);
        }
    }

    // #endregion
}
import * as vscode from 'vscode';
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
export declare enum LicenseType {
    /** 免费版本 */
    Free = "free",
    /** 专业版 */
    Pro = "pro",
    /** 企业版 */
    Enterprise = "enterprise"
}
/**
 * 回退行为枚举
 */
export declare enum FallbackBehavior {
    /** 隐藏功能 */
    Hide = "hide",
    /** 显示但禁用 */
    Disable = "disable",
    /** 显示升级提示 */
    ShowUpgrade = "show_upgrade",
    /** 使用基础实现 */
    UseBasic = "use_basic"
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
export declare class FeatureGate {
    private static instance;
    private licenseManager;
    private features;
    private context;
    /**
     * 私有构造函数
     * @param context VSCode扩展上下文
     */
    private constructor();
    /**
     * 获取特性门控单例实例
     * @param context VSCode扩展上下文
     */
    static getInstance(context?: vscode.ExtensionContext): FeatureGate;
    /**
     * 检查特性是否可用
     * @param featureId 特性ID
     * @returns 特性检查结果
     */
    checkFeature(featureId: string): FeatureCheckResult;
    /**
     * 检查特性是否启用（简化版本）
     * @param featureId 特性ID
     * @returns 是否启用
     */
    isFeatureEnabled(featureId: string): boolean;
    /**
     * 要求特性访问权限，如果没有权限则显示升级提示
     * @param featureId 特性ID
     * @param showUpgradePrompt 是否显示升级提示
     * @returns 是否有访问权限
     */
    requireFeature(featureId: string, showUpgradePrompt?: boolean): Promise<boolean>;
    /**
     * 注册新特性
     * @param feature 特性定义
     */
    registerFeature(feature: FeatureDefinition): void;
    /**
     * 批量注册特性
     * @param features 特性定义数组
     */
    registerFeatures(features: FeatureDefinition[]): void;
    /**
     * 获取所有特性定义
     * @returns 特性定义映射
     */
    getAllFeatures(): Map<string, FeatureDefinition>;
    /**
     * 获取可用特性列表
     * @returns 可用特性ID数组
     */
    getAvailableFeatures(): string[];
    /**
     * 获取不可用特性列表
     * @returns 不可用特性信息数组
     */
    getUnavailableFeatures(): Array<{
        feature: FeatureDefinition;
        result: FeatureCheckResult;
    }>;
    /**
     * 显示许可证状态和特性摘要
     */
    showLicenseStatus(): Promise<void>;
    /**
     * 初始化内置特性定义
     */
    private initializeFeatures;
    /**
     * 设置许可证监听器
     */
    private setupLicenseListeners;
    /**
     * 获取当前许可证类型
     */
    private getCurrentLicenseType;
    /**
     * 检查许可证类型是否足够
     * @param current 当前许可证类型
     * @param required 所需许可证类型
     */
    private isLicenseTypeSufficient;
    /**
     * 获取升级消息
     * @param feature 特性定义
     */
    private getUpgradeMessage;
    /**
     * 获取许可证显示名称
     * @param licenseType 许可证类型
     */
    private getLicenseDisplayName;
    /**
     * 显示特性信息
     * @param featureId 特性ID
     */
    private showFeatureInfo;
    /**
     * 显示不可用特性列表
     */
    private showUnavailableFeatures;
    /**
     * 更新命令可见性
     * @param feature 特性定义
     */
    private updateCommandVisibility;
    /**
     * 更新所有命令可见性
     */
    private updateAllCommandVisibility;
}
//# sourceMappingURL=FeatureGate.d.ts.map
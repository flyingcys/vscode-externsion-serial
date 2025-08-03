import * as vscode from 'vscode';
/**
 * 许可证信息接口
 */
export interface LicenseInfo {
    /** 许可证密钥 */
    licenseKey: string;
    /** 实例ID */
    instanceId: string;
    /** 是否已激活 */
    isActivated: boolean;
    /** 应用程序名称 */
    appName: string;
    /** 变体名称（如Pro Monthly, Enterprise Yearly等） */
    variantName: string;
    /** 实例名称 */
    instanceName: string;
    /** 客户姓名 */
    customerName: string;
    /** 客户邮箱 */
    customerEmail: string;
    /** 座位限制 */
    seatLimit: number;
    /** 座位使用量 */
    seatUsage: number;
    /** 激活日期 */
    activationDate: Date;
    /** 启用的特性列表 */
    enabledFeatures: string[];
}
/**
 * 许可证管理器事件接口
 */
export interface LicenseManagerEvents {
    /** 许可证状态变化 */
    onLicenseChanged: (info: LicenseInfo | null) => void;
    /** 激活状态变化 */
    onActivationChanged: (activated: boolean) => void;
    /** 忙碌状态变化 */
    onBusyChanged: (busy: boolean) => void;
}
/**
 * LicenseManager - 许可证管理器
 *
 * 基于Serial-Studio LemonSqueezy C++实现的完整TypeScript版本
 * 处理软件激活、验证和停用，使用Lemon Squeezy API
 *
 * 核心功能：
 * - 在每设备基础上激活新许可证
 * - 验证许可证密钥和分配的实例
 * - 停用许可证以释放座位
 * - 安全地在本地存储加密的许可证数据
 *
 * 与Lemon Squeezy许可证端点直接通信，确保：
 * - 许可证匹配预期的产品和商店ID
 * - 激活绑定到唯一的机器ID
 * - 只接受有效和活跃的密钥
 *
 * 实现为单例模式，完全集成到VSCode扩展系统中
 * 所有敏感数据使用机器特定密钥加密
 */
export declare class LicenseManager {
    private static instance;
    private context;
    private machineId;
    private simpleCrypt;
    private licenseInfo;
    private busy;
    private eventListeners;
    private static readonly STORE_ID;
    private static readonly PRODUCT_ID;
    private static readonly API_BASE_URL;
    private static readonly GRACE_PERIOD_DAYS;
    /**
     * 私有构造函数
     * @param context VSCode扩展上下文
     */
    private constructor();
    /**
     * 获取许可证管理器单例实例
     * @param context VSCode扩展上下文
     */
    static getInstance(context?: vscode.ExtensionContext): LicenseManager;
    /**
     * 返回是否正在进行许可证操作
     */
    get isBusy(): boolean;
    /**
     * 返回总的允许设备激活数量
     * -1表示无限激活（如Elite计划）
     */
    get seatLimit(): number;
    /**
     * 返回当前激活的设备数量
     */
    get seatUsage(): number;
    /**
     * 返回当前许可证是否已成功激活
     */
    get isActivated(): boolean;
    /**
     * 检查存储的许可证密钥格式是否有效
     * 不验证服务器 - 只检查本地格式
     * 通常，有效的Lemon Squeezy许可证密钥长度为36个字符（UUID）
     */
    get canActivate(): boolean;
    /**
     * 返回应用程序名称
     */
    get appName(): string;
    /**
     * 返回当前存储的许可证密钥
     */
    get licenseKey(): string;
    /**
     * 返回当前实例ID
     */
    get instanceId(): string;
    /**
     * 返回购买许可证的变体名称
     */
    get variantName(): string;
    /**
     * 返回机器特定的实例名称
     */
    get instanceName(): string;
    /**
     * 返回购买时注册的客户姓名
     */
    get customerName(): string;
    /**
     * 返回绑定到许可证的客户邮箱地址
     */
    get customerEmail(): string;
    /**
     * 返回完整的许可证信息
     */
    get currentLicenseInfo(): LicenseInfo | null;
    /**
     * 注册事件监听器
     * @param events 事件监听器对象
     */
    on(events: Partial<LicenseManagerEvents>): void;
    /**
     * 移除事件监听器
     * @param eventName 事件名称
     */
    off(eventName: keyof LicenseManagerEvents): void;
    /**
     * 触发许可证变化事件
     */
    private emitLicenseChanged;
    /**
     * 触发激活状态变化事件
     */
    private emitActivationChanged;
    /**
     * 触发忙碌状态变化事件
     */
    private emitBusyChanged;
    /**
     * 设置许可证密钥
     * @param licenseKey 许可证密钥
     */
    setLicenseKey(licenseKey: string): void;
    /**
     * 激活许可证
     * 向Lemon Squeezy API发送激活请求
     */
    activate(): Promise<boolean>;
    /**
     * 验证当前许可证密钥和实例ID
     * 检查许可证是否仍然有效、未过期且分配给此机器
     */
    validate(): Promise<boolean>;
    /**
     * 停用此机器上的许可证密钥实例
     * 释放Lemon Squeezy上的一个激活座位，用于切换设备时
     */
    deactivate(): Promise<boolean>;
    /**
     * 检查特性是否启用
     * @param featureName 特性名称
     */
    isFeatureEnabled(featureName: string): boolean;
    /**
     * 打开购买页面
     */
    buy(): Promise<void>;
    /**
     * 打开客户门户
     */
    openCustomerPortal(): Promise<void>;
    /**
     * 清除许可证缓存
     * @param clearLicense 是否同时清除许可证密钥
     */
    clearLicenseCache(clearLicense?: boolean): void;
    /**
     * 设置忙碌状态
     * @param busy 是否忙碌
     */
    private setBusy;
    /**
     * 创建空的许可证信息对象
     */
    private createEmptyLicenseInfo;
    /**
     * 向Lemon Squeezy API发起请求
     * @param endpoint API端点
     * @param payload 请求载荷
     */
    private makeAPIRequest;
    /**
     * 处理激活响应
     * @param response API响应
     */
    private processActivationResponse;
    /**
     * 处理验证响应
     * @param response API响应
     */
    private processValidationResponse;
    /**
     * 处理停用响应
     */
    private processDeactivationResponse;
    /**
     * 根据变体名称确定应用程序名称
     * @param variantName 变体名称
     */
    private determineAppName;
    /**
     * 根据变体名称确定启用的特性
     * @param variantName 变体名称
     */
    private determineEnabledFeatures;
    /**
     * 从扩展存储读取设置
     */
    private readSettings;
    /**
     * 将设置写入扩展存储
     */
    private writeSettings;
}
//# sourceMappingURL=LicenseManager.d.ts.map
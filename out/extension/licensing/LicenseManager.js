"use strict";
/*
 * Serial Studio VSCode Extension - 许可证管理器
 *
 * 基于Serial-Studio LemonSqueezy的完整TypeScript实现
 * 提供与原版完全一致的许可证管理功能
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseManager = void 0;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
const MachineID_1 = require("./MachineID");
const SimpleCrypt_1 = require("./SimpleCrypt");
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
class LicenseManager {
    static instance;
    context;
    machineId;
    simpleCrypt;
    licenseInfo = null;
    busy = false;
    eventListeners = {};
    // Lemon Squeezy配置 - 与Serial-Studio保持一致
    static STORE_ID = 170454;
    static PRODUCT_ID = 496241;
    static API_BASE_URL = 'https://api.lemonsqueezy.com/v1/licenses';
    static GRACE_PERIOD_DAYS = 3; // 宽限期天数
    /**
     * 私有构造函数
     * @param context VSCode扩展上下文
     */
    constructor(context) {
        this.context = context;
        this.machineId = MachineID_1.MachineID.getInstance();
        this.simpleCrypt = new SimpleCrypt_1.SimpleCrypt();
        // 配置数据加密
        this.simpleCrypt.setKey(this.machineId.machineSpecificKey);
        this.simpleCrypt.setIntegrityProtectionMode(SimpleCrypt_1.ProtectionMode.ProtectionHash);
        // 读取设置
        this.readSettings();
    }
    /**
     * 获取许可证管理器单例实例
     * @param context VSCode扩展上下文
     */
    static getInstance(context) {
        if (!LicenseManager.instance) {
            if (!context) {
                throw new Error('LicenseManager requires extension context for initialization');
            }
            LicenseManager.instance = new LicenseManager(context);
        }
        return LicenseManager.instance;
    }
    // #region 属性访问器
    /**
     * 返回是否正在进行许可证操作
     */
    get isBusy() {
        return this.busy;
    }
    /**
     * 返回总的允许设备激活数量
     * -1表示无限激活（如Elite计划）
     */
    get seatLimit() {
        return this.licenseInfo?.seatLimit ?? -1;
    }
    /**
     * 返回当前激活的设备数量
     */
    get seatUsage() {
        return this.licenseInfo?.seatUsage ?? -1;
    }
    /**
     * 返回当前许可证是否已成功激活
     */
    get isActivated() {
        return this.licenseInfo?.isActivated ?? false;
    }
    /**
     * 检查存储的许可证密钥格式是否有效
     * 不验证服务器 - 只检查本地格式
     * 通常，有效的Lemon Squeezy许可证密钥长度为36个字符（UUID）
     */
    get canActivate() {
        return (this.licenseInfo?.licenseKey?.length ?? 0) === 36;
    }
    /**
     * 返回应用程序名称
     */
    get appName() {
        return this.licenseInfo?.appName ?? 'Serial Studio VSCode';
    }
    /**
     * 返回当前存储的许可证密钥
     */
    get licenseKey() {
        return this.licenseInfo?.licenseKey ?? '';
    }
    /**
     * 返回当前实例ID
     */
    get instanceId() {
        return this.licenseInfo?.instanceId ?? '';
    }
    /**
     * 返回购买许可证的变体名称
     */
    get variantName() {
        return this.licenseInfo?.variantName ?? '';
    }
    /**
     * 返回机器特定的实例名称
     */
    get instanceName() {
        return this.licenseInfo?.instanceName ?? '';
    }
    /**
     * 返回购买时注册的客户姓名
     */
    get customerName() {
        return this.licenseInfo?.customerName ?? '';
    }
    /**
     * 返回绑定到许可证的客户邮箱地址
     */
    get customerEmail() {
        return this.licenseInfo?.customerEmail ?? '';
    }
    /**
     * 返回完整的许可证信息
     */
    get currentLicenseInfo() {
        return this.licenseInfo ? { ...this.licenseInfo } : null;
    }
    // #endregion
    // # region 事件管理
    /**
     * 注册事件监听器
     * @param events 事件监听器对象
     */
    on(events) {
        Object.assign(this.eventListeners, events);
    }
    /**
     * 移除事件监听器
     * @param eventName 事件名称
     */
    off(eventName) {
        delete this.eventListeners[eventName];
    }
    /**
     * 触发许可证变化事件
     */
    emitLicenseChanged() {
        this.eventListeners.onLicenseChanged?.(this.licenseInfo);
    }
    /**
     * 触发激活状态变化事件
     */
    emitActivationChanged() {
        this.eventListeners.onActivationChanged?.(this.isActivated);
    }
    /**
     * 触发忙碌状态变化事件
     */
    emitBusyChanged() {
        this.eventListeners.onBusyChanged?.(this.busy);
    }
    // #endregion
    // #region 许可证操作
    /**
     * 设置许可证密钥
     * @param licenseKey 许可证密钥
     */
    setLicenseKey(licenseKey) {
        if (!this.licenseInfo) {
            this.licenseInfo = this.createEmptyLicenseInfo();
        }
        this.licenseInfo.licenseKey = licenseKey.trim();
        this.writeSettings();
        this.emitLicenseChanged();
    }
    /**
     * 激活许可证
     * 向Lemon Squeezy API发送激活请求
     */
    async activate() {
        if (!this.canActivate || this.busy) {
            return false;
        }
        this.setBusy(true);
        try {
            const payload = {
                license_key: this.licenseKey,
                instance_name: this.machineId.machineId
            };
            const response = await this.makeAPIRequest('activate', payload);
            if (response) {
                this.processActivationResponse(response);
                this.writeSettings();
                return true;
            }
        }
        catch (error) {
            console.error('License activation failed:', error);
            vscode.window.showErrorMessage(`许可证激活失败: ${error}`);
        }
        finally {
            this.setBusy(false);
        }
        return false;
    }
    /**
     * 验证当前许可证密钥和实例ID
     * 检查许可证是否仍然有效、未过期且分配给此机器
     */
    async validate() {
        if (!this.canActivate || this.busy) {
            return false;
        }
        this.setBusy(true);
        try {
            const payload = {
                license_key: this.licenseKey,
                instance_id: this.instanceId
            };
            const response = await this.makeAPIRequest('validate', payload);
            if (response) {
                this.processValidationResponse(response);
                this.writeSettings();
                return true;
            }
        }
        catch (error) {
            console.error('License validation failed:', error);
            // 验证失败时不显示错误消息，可能只是网络问题
        }
        finally {
            this.setBusy(false);
        }
        return false;
    }
    /**
     * 停用此机器上的许可证密钥实例
     * 释放Lemon Squeezy上的一个激活座位，用于切换设备时
     */
    async deactivate() {
        if (!this.isActivated || this.busy) {
            return false;
        }
        this.setBusy(true);
        try {
            const payload = {
                license_key: this.licenseKey,
                instance_id: this.instanceId
            };
            const response = await this.makeAPIRequest('deactivate', payload);
            if (response) {
                this.processDeactivationResponse();
                this.writeSettings();
                return true;
            }
        }
        catch (error) {
            console.error('License deactivation failed:', error);
            vscode.window.showErrorMessage(`许可证停用失败: ${error}`);
        }
        finally {
            this.setBusy(false);
        }
        return false;
    }
    /**
     * 检查特性是否启用
     * @param featureName 特性名称
     */
    isFeatureEnabled(featureName) {
        if (!this.licenseInfo || !this.isActivated) {
            return false;
        }
        return this.licenseInfo.enabledFeatures.includes(featureName);
    }
    /**
     * 打开购买页面
     */
    async buy() {
        const buyUrl = 'https://serialstudio.io/pricing';
        await vscode.env.openExternal(vscode.Uri.parse(buyUrl));
    }
    /**
     * 打开客户门户
     */
    async openCustomerPortal() {
        if (this.customerEmail) {
            const portalUrl = `https://serialstudio.lemonsqueezy.com/billing`;
            await vscode.env.openExternal(vscode.Uri.parse(portalUrl));
        }
        else {
            vscode.window.showWarningMessage('无客户信息可用');
        }
    }
    /**
     * 清除许可证缓存
     * @param clearLicense 是否同时清除许可证密钥
     */
    clearLicenseCache(clearLicense = false) {
        if (clearLicense) {
            this.licenseInfo = null;
        }
        else if (this.licenseInfo) {
            // 只清除激活状态，保留许可证密钥
            this.licenseInfo.isActivated = false;
            this.licenseInfo.instanceId = '';
            this.licenseInfo.seatLimit = -1;
            this.licenseInfo.seatUsage = -1;
            this.licenseInfo.enabledFeatures = [];
        }
        this.writeSettings();
        this.emitLicenseChanged();
        this.emitActivationChanged();
    }
    // #endregion
    // #region 私有方法
    /**
     * 设置忙碌状态
     * @param busy 是否忙碌
     */
    setBusy(busy) {
        this.busy = busy;
        this.emitBusyChanged();
    }
    /**
     * 创建空的许可证信息对象
     */
    createEmptyLicenseInfo() {
        return {
            licenseKey: '',
            instanceId: '',
            isActivated: false,
            appName: 'Serial Studio VSCode',
            variantName: '',
            instanceName: this.machineId.machineId,
            customerName: '',
            customerEmail: '',
            seatLimit: -1,
            seatUsage: -1,
            activationDate: new Date(),
            enabledFeatures: []
        };
    }
    /**
     * 向Lemon Squeezy API发起请求
     * @param endpoint API端点
     * @param payload 请求载荷
     */
    async makeAPIRequest(endpoint, payload) {
        return new Promise((resolve, reject) => {
            const url = `${LicenseManager.API_BASE_URL}/${endpoint}`;
            const data = JSON.stringify(payload);
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            const req = https.request(url, options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const response = JSON.parse(responseData);
                            resolve(response);
                        }
                        else {
                            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                        }
                    }
                    catch (error) {
                        reject(new Error(`Failed to parse response: ${error}`));
                    }
                });
            });
            req.on('error', (error) => {
                reject(error);
            });
            req.write(data);
            req.end();
        });
    }
    /**
     * 处理激活响应
     * @param response API响应
     */
    processActivationResponse(response) {
        if (!response.valid) {
            throw new Error('Invalid license key');
        }
        if (!this.licenseInfo) {
            this.licenseInfo = this.createEmptyLicenseInfo();
        }
        this.licenseInfo.isActivated = true;
        this.licenseInfo.instanceId = response.instance.id;
        this.licenseInfo.seatLimit = response.license_key.activation_limit;
        this.licenseInfo.seatUsage = response.license_key.activation_usage;
        this.licenseInfo.variantName = response.meta.variant_name;
        this.licenseInfo.customerName = response.meta.customer_name;
        this.licenseInfo.customerEmail = response.meta.customer_email;
        this.licenseInfo.activationDate = new Date();
        this.licenseInfo.appName = this.determineAppName(response.meta.variant_name);
        this.licenseInfo.enabledFeatures = this.determineEnabledFeatures(response.meta.variant_name);
        this.emitActivationChanged();
        this.emitLicenseChanged();
        vscode.window.showInformationMessage(`许可证激活成功！欢迎使用 ${this.licenseInfo.appName}`);
    }
    /**
     * 处理验证响应
     * @param response API响应
     */
    processValidationResponse(response) {
        if (!response.valid) {
            this.clearLicenseCache();
            return;
        }
        if (!this.licenseInfo) {
            this.licenseInfo = this.createEmptyLicenseInfo();
        }
        this.licenseInfo.isActivated = true;
        this.licenseInfo.seatLimit = response.license_key.activation_limit;
        this.licenseInfo.seatUsage = response.license_key.activation_usage;
        this.licenseInfo.variantName = response.meta.variant_name;
        this.licenseInfo.customerName = response.meta.customer_name;
        this.licenseInfo.customerEmail = response.meta.customer_email;
        this.licenseInfo.appName = this.determineAppName(response.meta.variant_name);
        this.licenseInfo.enabledFeatures = this.determineEnabledFeatures(response.meta.variant_name);
        this.emitLicenseChanged();
    }
    /**
     * 处理停用响应
     */
    processDeactivationResponse() {
        this.clearLicenseCache();
        vscode.window.showInformationMessage('许可证已成功停用');
    }
    /**
     * 根据变体名称确定应用程序名称
     * @param variantName 变体名称
     */
    determineAppName(variantName) {
        if (variantName.toLowerCase().includes('pro')) {
            return 'Serial Studio VSCode Pro';
        }
        else if (variantName.toLowerCase().includes('enterprise')) {
            return 'Serial Studio VSCode Enterprise';
        }
        else {
            return 'Serial Studio VSCode';
        }
    }
    /**
     * 根据变体名称确定启用的特性
     * @param variantName 变体名称
     */
    determineEnabledFeatures(variantName) {
        const features = [];
        const variant = variantName.toLowerCase();
        if (variant.includes('pro') || variant.includes('enterprise')) {
            features.push('3d-visualization', 'advanced-export', 'mqtt-publisher', 'can-bus', 'modbus', 'audio-input', 'advanced-themes', 'priority-support');
        }
        if (variant.includes('enterprise')) {
            features.push('unlimited-devices', 'team-collaboration', 'advanced-security', 'custom-branding');
        }
        return features;
    }
    /**
     * 从扩展存储读取设置
     */
    readSettings() {
        try {
            const encryptedData = this.context.globalState.get('licenseData');
            if (encryptedData) {
                const decryptedData = this.simpleCrypt.decrypt(encryptedData);
                if (decryptedData) {
                    this.licenseInfo = JSON.parse(decryptedData);
                    // 转换日期字符串回Date对象
                    if (this.licenseInfo && this.licenseInfo.activationDate) {
                        this.licenseInfo.activationDate = new Date(this.licenseInfo.activationDate);
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to read license settings:', error);
            this.licenseInfo = null;
        }
    }
    /**
     * 将设置写入扩展存储
     */
    writeSettings() {
        try {
            if (this.licenseInfo) {
                const dataToEncrypt = JSON.stringify(this.licenseInfo);
                const encryptedData = this.simpleCrypt.encrypt(dataToEncrypt);
                this.context.globalState.update('licenseData', encryptedData);
            }
            else {
                this.context.globalState.update('licenseData', undefined);
            }
        }
        catch (error) {
            console.error('Failed to write license settings:', error);
        }
    }
}
exports.LicenseManager = LicenseManager;
//# sourceMappingURL=LicenseManager.js.map
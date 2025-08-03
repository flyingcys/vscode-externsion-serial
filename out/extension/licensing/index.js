"use strict";
/*
 * Serial Studio VSCode Extension - 许可证管理系统入口
 *
 * 统一导出所有许可证相关的类和接口
 * 提供简化的初始化和使用API
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
exports.getLicensingSystem = exports.initializeLicensing = exports.LicensingSystem = exports.ConfigurationType = exports.ConfigurationManager = exports.FallbackBehavior = exports.LicenseType = exports.FeatureGate = exports.LicenseManager = exports.ProtectionMode = exports.SimpleCrypt = exports.MachineID = void 0;
// 核心类导出
var MachineID_1 = require("./MachineID");
Object.defineProperty(exports, "MachineID", { enumerable: true, get: function () { return MachineID_1.MachineID; } });
var SimpleCrypt_1 = require("./SimpleCrypt");
Object.defineProperty(exports, "SimpleCrypt", { enumerable: true, get: function () { return SimpleCrypt_1.SimpleCrypt; } });
Object.defineProperty(exports, "ProtectionMode", { enumerable: true, get: function () { return SimpleCrypt_1.ProtectionMode; } });
var LicenseManager_1 = require("./LicenseManager");
Object.defineProperty(exports, "LicenseManager", { enumerable: true, get: function () { return LicenseManager_1.LicenseManager; } });
var FeatureGate_1 = require("./FeatureGate");
Object.defineProperty(exports, "FeatureGate", { enumerable: true, get: function () { return FeatureGate_1.FeatureGate; } });
Object.defineProperty(exports, "LicenseType", { enumerable: true, get: function () { return FeatureGate_1.LicenseType; } });
Object.defineProperty(exports, "FallbackBehavior", { enumerable: true, get: function () { return FeatureGate_1.FallbackBehavior; } });
var ConfigurationManager_1 = require("./ConfigurationManager");
Object.defineProperty(exports, "ConfigurationManager", { enumerable: true, get: function () { return ConfigurationManager_1.ConfigurationManager; } });
Object.defineProperty(exports, "ConfigurationType", { enumerable: true, get: function () { return ConfigurationManager_1.ConfigurationType; } });
// 便捷的初始化函数
const vscode = __importStar(require("vscode"));
const LicenseManager_2 = require("./LicenseManager");
const FeatureGate_2 = require("./FeatureGate");
const ConfigurationManager_2 = require("./ConfigurationManager");
/**
 * 许可证系统管理器
 * 提供统一的许可证系统访问接口
 */
class LicensingSystem {
    static instance;
    licenseManager;
    featureGate;
    configurationManager;
    constructor(context) {
        this.licenseManager = LicenseManager_2.LicenseManager.getInstance(context);
        this.featureGate = FeatureGate_2.FeatureGate.getInstance(context);
        this.configurationManager = ConfigurationManager_2.ConfigurationManager.getInstance(context);
    }
    /**
     * 初始化许可证系统
     * @param context VSCode扩展上下文
     */
    static async initialize(context) {
        if (!LicensingSystem.instance) {
            LicensingSystem.instance = new LicensingSystem(context);
            await LicensingSystem.instance.setup();
        }
        return LicensingSystem.instance;
    }
    /**
     * 获取许可证系统实例
     */
    static getInstance() {
        if (!LicensingSystem.instance) {
            throw new Error('LicensingSystem not initialized. Call initialize() first.');
        }
        return LicensingSystem.instance;
    }
    /**
     * 执行系统设置
     */
    async setup() {
        // 注册VSCode命令
        this.registerCommands();
        // 启动许可证验证
        await this.performInitialLicenseCheck();
    }
    /**
     * 注册VSCode命令
     */
    registerCommands() {
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
                const confirm = await vscode.window.showWarningMessage('确定要停用此设备上的许可证吗？', '停用', '取消');
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
                }
                else {
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
                const options = {
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
                const options = {
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
    async performInitialLicenseCheck() {
        try {
            // 如果已激活，进行验证
            if (this.licenseManager.isActivated) {
                await this.licenseManager.validate();
            }
        }
        catch (error) {
            console.warn('Initial license check failed:', error);
        }
    }
    /**
     * 获取系统状态摘要
     */
    getSystemStatus() {
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
    isFeatureAvailable(featureId) {
        return this.featureGate.isFeatureEnabled(featureId);
    }
    /**
     * 要求特性访问权限（便捷方法）
     * @param featureId 特性ID
     * @param showUpgradePrompt 是否显示升级提示
     */
    async requireFeature(featureId, showUpgradePrompt = true) {
        return this.featureGate.requireFeature(featureId, showUpgradePrompt);
    }
    /**
     * 获取配置值（便捷方法）
     * @param key 配置键
     * @param defaultValue 默认值
     */
    getConfig(key, defaultValue) {
        return this.configurationManager.get(key, defaultValue);
    }
    /**
     * 设置配置值（便捷方法）
     * @param key 配置键
     * @param value 配置值
     */
    async setConfig(key, value) {
        return this.configurationManager.set(key, value);
    }
    /**
     * 清理系统资源
     */
    dispose() {
        // 如果有需要清理的资源，在这里处理
        console.log('LicensingSystem disposed');
    }
}
exports.LicensingSystem = LicensingSystem;
/**
 * 便捷的初始化函数
 * @param context VSCode扩展上下文
 */
async function initializeLicensing(context) {
    return LicensingSystem.initialize(context);
}
exports.initializeLicensing = initializeLicensing;
/**
 * 获取许可证系统实例的便捷函数
 */
function getLicensingSystem() {
    return LicensingSystem.getInstance();
}
exports.getLicensingSystem = getLicensingSystem;
//# sourceMappingURL=index.js.map
/**
 * FeatureGate 真实功能测试
 * 测试特性门控系统的核心业务逻辑，确保真实源代码被执行和验证
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeatureGate, FeatureDefinition, LicenseType, FallbackBehavior, FeatureCheckResult } from '@extension/licensing/FeatureGate';
import { LicenseManager } from '@extension/licensing/LicenseManager';
import * as vscode from 'vscode';

// Mock vscode
vi.mock('vscode', () => ({
  ExtensionContext: vi.fn(),
  commands: {
    executeCommand: vi.fn().mockResolvedValue(undefined)
  },
  window: {
    showWarningMessage: vi.fn().mockResolvedValue(undefined),
    showInformationMessage: vi.fn().mockResolvedValue(undefined),
    showQuickPick: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock LicenseManager
vi.mock('@extension/licensing/LicenseManager', () => ({
  LicenseManager: {
    getInstance: vi.fn().mockReturnValue({
      isActivated: false,
      variantName: '',
      buy: vi.fn().mockResolvedValue(undefined),
      on: vi.fn()
    })
  }
}));

describe('FeatureGate 真实功能测试', () => {
  let mockContext: any;
  let mockLicenseManager: any;
  let featureGate: FeatureGate;

  beforeEach(() => {
    // 🔧 创建模拟的VSCode扩展上下文
    mockContext = {
      subscriptions: [],
      globalState: {
        get: vi.fn().mockReturnValue(null),
        update: vi.fn().mockResolvedValue(undefined)
      }
    };

    // 🔧 创建模拟的LicenseManager
    mockLicenseManager = {
      isActivated: false,
      variantName: '',
      buy: vi.fn().mockResolvedValue(undefined),
      on: vi.fn()
    };

    vi.mocked(LicenseManager.getInstance).mockReturnValue(mockLicenseManager);

    // 🔧 重置FeatureGate单例
    (FeatureGate as any).instance = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
    (FeatureGate as any).instance = null;
  });

  describe('单例模式和初始化', () => {
    it('应该创建FeatureGate单例实例', () => {
      featureGate = FeatureGate.getInstance(mockContext);
      
      expect(featureGate).toBeInstanceOf(FeatureGate);
      expect(LicenseManager.getInstance).toHaveBeenCalledWith(mockContext);
      expect(mockLicenseManager.on).toHaveBeenCalled();
    });

    it('应该返回相同的单例实例', () => {
      const instance1 = FeatureGate.getInstance(mockContext);
      const instance2 = FeatureGate.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('应该在无上下文时抛出错误', () => {
      (FeatureGate as any).instance = null;
      
      expect(() => FeatureGate.getInstance()).toThrow(
        'FeatureGate requires extension context for initialization'
      );
    });

    it('应该初始化内置特性', () => {
      featureGate = FeatureGate.getInstance(mockContext);
      
      const allFeatures = featureGate.getAllFeatures();
      expect(allFeatures.size).toBeGreaterThan(0);
      
      // 验证一些关键特性是否被注册
      expect(allFeatures.has('3d-visualization')).toBe(true);
      expect(allFeatures.has('advanced-export')).toBe(true);
      expect(allFeatures.has('mqtt-publisher')).toBe(true);
      expect(allFeatures.has('unlimited-devices')).toBe(true);
    });
  });

  describe('特性检查功能', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该正确检查免费版本的特性访问', () => {
      mockLicenseManager.isActivated = false;
      
      // 检查Pro特性
      const result = featureGate.checkFeature('3d-visualization');
      
      expect(result.allowed).toBe(false);
      expect(result.currentLicenseType).toBe(LicenseType.Free);
      expect(result.requiredLicenseType).toBe(LicenseType.Pro);
      expect(result.upgradeUrl).toBe('https://serialstudio.io/pricing');
      expect(result.message).toBeDefined();
    });

    it('应该正确检查Pro版本的特性访问', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Pro Monthly';
      
      // Pro特性应该可用
      const proResult = featureGate.checkFeature('3d-visualization');
      expect(proResult.allowed).toBe(true);
      expect(proResult.currentLicenseType).toBe(LicenseType.Pro);
      
      // Enterprise特性应该不可用
      const enterpriseResult = featureGate.checkFeature('unlimited-devices');
      expect(enterpriseResult.allowed).toBe(false);
      expect(enterpriseResult.requiredLicenseType).toBe(LicenseType.Enterprise);
    });

    it('应该正确检查Enterprise版本的特性访问', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Enterprise Yearly';
      
      // 所有特性都应该可用
      const proResult = featureGate.checkFeature('3d-visualization');
      expect(proResult.allowed).toBe(true);
      
      const enterpriseResult = featureGate.checkFeature('unlimited-devices');
      expect(enterpriseResult.allowed).toBe(true);
      expect(enterpriseResult.currentLicenseType).toBe(LicenseType.Enterprise);
    });

    it('应该处理未知特性', () => {
      const result = featureGate.checkFeature('non-existent-feature');
      
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('未知特性');
    });

    it('应该使用isFeatureEnabled简化检查', () => {
      mockLicenseManager.isActivated = false;
      
      expect(featureGate.isFeatureEnabled('3d-visualization')).toBe(false);
      
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Pro Monthly';
      
      expect(featureGate.isFeatureEnabled('3d-visualization')).toBe(true);
    });
  });

  describe('特性访问要求', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该允许有权限的特性访问', async () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Pro Monthly';
      
      const result = await featureGate.requireFeature('3d-visualization');
      
      expect(result).toBe(true);
      expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
    });

    it('应该拒绝无权限的特性访问并显示提示', async () => {
      mockLicenseManager.isActivated = false;
      
      const result = await featureGate.requireFeature('3d-visualization');
      
      expect(result).toBe(false);
      expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });

    it('应该处理用户选择升级许可证', async () => {
      mockLicenseManager.isActivated = false;
      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('升级许可证' as any);
      
      const result = await featureGate.requireFeature('3d-visualization');
      
      expect(result).toBe(false);
      expect(mockLicenseManager.buy).toHaveBeenCalled();
    });

    it('应该处理用户选择了解更多', async () => {
      mockLicenseManager.isActivated = false;
      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue('了解更多' as any);
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue(undefined as any);
      
      const result = await featureGate.requireFeature('3d-visualization');
      
      expect(result).toBe(false);
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it('应该支持禁用升级提示', async () => {
      mockLicenseManager.isActivated = false;
      
      const result = await featureGate.requireFeature('3d-visualization', false);
      
      expect(result).toBe(false);
      expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
    });
  });

  describe('特性注册和管理', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该注册新特性', () => {
      const customFeature: FeatureDefinition = {
        id: 'custom-feature',
        name: '自定义特性',
        description: '测试用的自定义特性',
        requiredLicenseType: LicenseType.Pro,
        isCore: false,
        fallbackBehavior: FallbackBehavior.ShowUpgrade
      };
      
      featureGate.registerFeature(customFeature);
      
      const allFeatures = featureGate.getAllFeatures();
      expect(allFeatures.has('custom-feature')).toBe(true);
      expect(allFeatures.get('custom-feature')).toEqual(customFeature);
    });

    it('应该批量注册特性', () => {
      const customFeatures: FeatureDefinition[] = [
        {
          id: 'feature-1',
          name: '特性1',
          description: '测试特性1',
          requiredLicenseType: LicenseType.Pro,
          isCore: false,
          fallbackBehavior: FallbackBehavior.Hide
        },
        {
          id: 'feature-2',
          name: '特性2',
          description: '测试特性2',
          requiredLicenseType: LicenseType.Enterprise,
          isCore: false,
          fallbackBehavior: FallbackBehavior.Disable
        }
      ];
      
      featureGate.registerFeatures(customFeatures);
      
      const allFeatures = featureGate.getAllFeatures();
      expect(allFeatures.has('feature-1')).toBe(true);
      expect(allFeatures.has('feature-2')).toBe(true);
    });

    it('应该更新命令可见性', () => {
      const customFeature: FeatureDefinition = {
        id: 'test-visibility',
        name: '可见性测试',
        description: '测试命令可见性控制',
        requiredLicenseType: LicenseType.Pro,
        isCore: false,
        fallbackBehavior: FallbackBehavior.Hide
      };
      
      featureGate.registerFeature(customFeature);
      
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'serialStudio.feature.test-visibility',
        false
      );
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'serialStudio.feature.test-visibility.visible',
        false
      );
    });
  });

  describe('特性列表和摘要', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该获取可用特性列表', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Pro Monthly';
      
      const availableFeatures = featureGate.getAvailableFeatures();
      
      expect(availableFeatures.length).toBeGreaterThan(0);
      expect(availableFeatures).toContain('3d-visualization');
      expect(availableFeatures).toContain('advanced-export');
      expect(availableFeatures).not.toContain('unlimited-devices'); // Enterprise特性
    });

    it('应该获取不可用特性列表', () => {
      mockLicenseManager.isActivated = false;
      
      const unavailableFeatures = featureGate.getUnavailableFeatures();
      
      expect(unavailableFeatures.length).toBeGreaterThan(0);
      
      const proFeature = unavailableFeatures.find(f => f.feature.id === '3d-visualization');
      expect(proFeature).toBeDefined();
      expect(proFeature!.result.allowed).toBe(false);
      expect(proFeature!.result.requiredLicenseType).toBe(LicenseType.Pro);
    });

    it('应该显示许可证状态', async () => {
      mockLicenseManager.isActivated = false;
      
      await featureGate.showLicenseStatus();
      
      expect(vscode.window.showQuickPick).toHaveBeenCalled();
      
      const quickPickOptions = vi.mocked(vscode.window.showQuickPick).mock.calls[0][0];
      expect(quickPickOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: expect.stringContaining('许可证状态')
          }),
          expect.objectContaining({
            label: expect.stringContaining('可用特性')
          })
        ])
      );
    });
  });

  describe('许可证类型判断', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该正确识别免费版本', () => {
      mockLicenseManager.isActivated = false;
      
      const result = featureGate.checkFeature('3d-visualization');
      expect(result.currentLicenseType).toBe(LicenseType.Free);
    });

    it('应该正确识别Pro版本', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Pro Monthly';
      
      const result = featureGate.checkFeature('3d-visualization');
      expect(result.currentLicenseType).toBe(LicenseType.Pro);
    });

    it('应该正确识别Enterprise版本', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Enterprise Yearly';
      
      const result = featureGate.checkFeature('unlimited-devices');
      expect(result.currentLicenseType).toBe(LicenseType.Enterprise);
    });

    it('应该处理大小写不敏感的版本名称', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'PRO MONTHLY';
      
      const result = featureGate.checkFeature('3d-visualization');
      expect(result.currentLicenseType).toBe(LicenseType.Pro);
    });
  });

  describe('回退行为处理', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该处理ShowUpgrade回退行为', () => {
      mockLicenseManager.isActivated = false;
      
      const result = featureGate.checkFeature('3d-visualization');
      
      expect(result.fallbackBehavior).toBe(FallbackBehavior.ShowUpgrade);
      expect(result.upgradeUrl).toBeDefined();
    });

    it('应该处理UseBasic回退行为', () => {
      mockLicenseManager.isActivated = false;
      
      const result = featureGate.checkFeature('advanced-export');
      
      expect(result.fallbackBehavior).toBe(FallbackBehavior.UseBasic);
    });

    it('应该处理Hide回退行为', () => {
      // 注册一个使用Hide回退行为的特性
      const hideFeature: FeatureDefinition = {
        id: 'hide-test',
        name: '隐藏测试',
        description: '测试隐藏行为',
        requiredLicenseType: LicenseType.Pro,
        isCore: false,
        fallbackBehavior: FallbackBehavior.Hide
      };
      
      featureGate.registerFeature(hideFeature);
      
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        'serialStudio.feature.hide-test.visible',
        false
      );
    });
  });

  describe('用户界面交互', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该处理升级许可证的快速选择', async () => {
      mockLicenseManager.isActivated = false;
      vi.mocked(vscode.window.showQuickPick).mockResolvedValue({
        label: '$(rocket) 升级许可证'
      } as any);
      
      await featureGate.showLicenseStatus();
      
      expect(mockLicenseManager.buy).toHaveBeenCalled();
    });

    it('应该处理查看受限特性', async () => {
      mockLicenseManager.isActivated = false;
      vi.mocked(vscode.window.showQuickPick)
        .mockResolvedValueOnce({ label: '$(lock) 受限特性' } as any)
        .mockResolvedValueOnce(undefined as any);
      
      await featureGate.showLicenseStatus();
      
      // 应该调用两次showQuickPick：一次显示状态，一次显示受限特性
      expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(2);
    });

    it('应该显示特性详细信息', async () => {
      vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('升级许可证' as any);
      
      // 通过私有方法测试，需要访问实例的私有方法
      const featureGateInternal = featureGate as any;
      await featureGateInternal.showFeatureInfo('3d-visualization');
      
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
      expect(mockLicenseManager.buy).toHaveBeenCalled();
    });
  });

  describe('许可证状态监听', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该监听许可证变化事件', () => {
      expect(mockLicenseManager.on).toHaveBeenCalled();
      
      const eventCallbacks = vi.mocked(mockLicenseManager.on).mock.calls[0][0];
      expect(eventCallbacks.onLicenseChanged).toBeDefined();
      expect(eventCallbacks.onActivationChanged).toBeDefined();
    });

    it('应该在许可证变化时更新命令可见性', () => {
      const eventCallbacks = vi.mocked(mockLicenseManager.on).mock.calls[0][0];
      
      // 清除之前的调用
      vi.mocked(vscode.commands.executeCommand).mockClear();
      
      // 触发许可证变化事件
      eventCallbacks.onLicenseChanged();
      
      // 验证所有特性的命令可见性都被更新
      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'setContext',
        expect.stringMatching(/serialStudio\.feature\./),
        expect.any(Boolean)
      );
    });

    it('应该在激活状态变化时更新命令可见性', () => {
      const eventCallbacks = vi.mocked(mockLicenseManager.on).mock.calls[0][0];
      
      // 清除之前的调用
      vi.mocked(vscode.commands.executeCommand).mockClear();
      
      // 触发激活状态变化事件
      eventCallbacks.onActivationChanged();
      
      // 验证命令可见性被更新
      expect(vscode.commands.executeCommand).toHaveBeenCalled();
    });
  });

  describe('边界情况和错误处理', () => {
    beforeEach(() => {
      featureGate = FeatureGate.getInstance(mockContext);
    });

    it('应该处理空的变体名称', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = '';
      
      const result = featureGate.checkFeature('3d-visualization');
      expect(result.currentLicenseType).toBe(LicenseType.Free);
    });

    it('应该处理未识别的变体名称', () => {
      mockLicenseManager.isActivated = true;
      mockLicenseManager.variantName = 'Unknown Plan';
      
      const result = featureGate.checkFeature('3d-visualization');
      expect(result.currentLicenseType).toBe(LicenseType.Free);
    });

    it('应该安全处理不存在的特性信息显示', async () => {
      const featureGateInternal = featureGate as any;
      
      // 这应该不会抛出异常
      await featureGateInternal.showFeatureInfo('non-existent-feature');
      
      expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('应该处理用户取消升级提示', async () => {
      mockLicenseManager.isActivated = false;
      vi.mocked(vscode.window.showWarningMessage).mockResolvedValue(undefined as any);
      
      const result = await featureGate.requireFeature('3d-visualization');
      
      expect(result).toBe(false);
      expect(mockLicenseManager.buy).not.toHaveBeenCalled();
    });
  });
});
/**
 * LicenseManager 真实功能测试
 * 测试许可证管理器的核心业务逻辑，确保真实源代码被执行和验证
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LicenseManager, LicenseInfo, LicenseManagerEvents } from '@extension/licensing/LicenseManager';
import { MachineID } from '@extension/licensing/MachineID';
import { SimpleCrypt, ProtectionMode } from '@extension/licensing/SimpleCrypt';
import * as vscode from 'vscode';
import * as https from 'https';

// Mock vscode
vi.mock('vscode', () => ({
  ExtensionContext: vi.fn(),
  Uri: {
    parse: vi.fn().mockImplementation((url: string) => ({ toString: () => url }))
  },
  env: {
    openExternal: vi.fn().mockResolvedValue(undefined)
  },
  window: {
    showInformationMessage: vi.fn().mockResolvedValue(undefined),
    showWarningMessage: vi.fn().mockResolvedValue(undefined),
    showErrorMessage: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock https
vi.mock('https', () => ({
  request: vi.fn()
}));

// Mock MachineID
vi.mock('@extension/licensing/MachineID', () => {
  const mockInstance = {
    machineId: 'test-machine-id-12345',
    machineSpecificKey: BigInt('0x123456789ABCDEF0')
  };

  return {
    MachineID: {
      getInstance: vi.fn().mockReturnValue(mockInstance)
    }
  };
});

// Mock SimpleCrypt
vi.mock('@extension/licensing/SimpleCrypt', () => ({
  SimpleCrypt: vi.fn().mockImplementation(() => ({
    setKey: vi.fn(),
    setIntegrityProtectionMode: vi.fn(),
    encrypt: vi.fn().mockImplementation((data: string) => `encrypted_${data}`),
    decrypt: vi.fn().mockImplementation((data: string) => data.replace('encrypted_', ''))
  })),
  ProtectionMode: {
    ProtectionHash: 'hash'
  }
}));

describe('LicenseManager 真实功能测试', () => {
  let mockContext: any;
  let mockHttpsRequest: any;
  let licenseManager: LicenseManager;
  
  // 模拟的Lemon Squeezy API响应
  const mockSuccessfulApiResponse = {
    valid: true,
    license_key: {
      id: 'lic_123456',
      status: 'active',
      key: 'test-license-key-uuid-1234-5678-9012',
      activation_limit: 5,
      activation_usage: 2,
      created_at: '2025-01-01T00:00:00Z',
      expires_at: null
    },
    instance: {
      id: 'inst_789012',
      name: 'test-machine-id-12345',
      created_at: '2025-01-01T10:00:00Z'
    },
    meta: {
      store_id: 170454,
      product_id: 496241,
      variant_id: 123456,
      variant_name: 'Pro Monthly',
      customer_id: 98765,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com'
    }
  };

  beforeEach(() => {
    // 🔧 创建模拟的VSCode扩展上下文
    mockContext = {
      globalState: {
        get: vi.fn().mockReturnValue(null),
        update: vi.fn().mockResolvedValue(undefined)
      },
      subscriptions: []
    };

    // 🔧 设置https Mock
    mockHttpsRequest = vi.fn().mockImplementation((url, options, callback) => {
      const mockResponse = {
        statusCode: 200,
        on: vi.fn().mockImplementation((event, handler) => {
          if (event === 'data') {
            handler(JSON.stringify(mockSuccessfulApiResponse));
          } else if (event === 'end') {
            setTimeout(handler, 0);
          }
        })
      };
      
      callback(mockResponse);
      
      return {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn()
      };
    });
    
    vi.mocked(https.request).mockImplementation(mockHttpsRequest);
    
    // 🔧 重置LicenseManager单例
    (LicenseManager as any).instance = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
    (LicenseManager as any).instance = null;
  });

  describe('单例模式和初始化', () => {
    it('应该创建LicenseManager单例实例', () => {
      licenseManager = LicenseManager.getInstance(mockContext);
      
      expect(licenseManager).toBeInstanceOf(LicenseManager);
      expect(licenseManager.appName).toBe('Serial Studio VSCode');
      expect(licenseManager.isBusy).toBe(false);
    });

    it('应该返回相同的单例实例', () => {
      const instance1 = LicenseManager.getInstance(mockContext);
      const instance2 = LicenseManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('应该在无上下文时抛出错误', () => {
      (LicenseManager as any).instance = null;
      
      expect(() => LicenseManager.getInstance()).toThrow(
        'LicenseManager requires extension context for initialization'
      );
    });

    it('应该正确初始化加密组件', () => {
      licenseManager = LicenseManager.getInstance(mockContext);
      
      expect(MachineID.getInstance).toHaveBeenCalled();
      expect(SimpleCrypt).toHaveBeenCalled();
    });
  });

  describe('许可证密钥管理', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
    });

    it('应该设置许可证密钥', () => {
      const testKey = 'test-license-key-uuid-1234-5678-9012';
      
      licenseManager.setLicenseKey(testKey);
      
      expect(licenseManager.licenseKey).toBe(testKey);
      expect(mockContext.globalState.update).toHaveBeenCalledWith('licenseData', expect.any(String));
    });

    it('应该修剪许可证密钥的空白', () => {
      const testKey = '  test-license-key-uuid-1234-5678-9012  ';
      const trimmedKey = 'test-license-key-uuid-1234-5678-9012';
      
      licenseManager.setLicenseKey(testKey);
      
      expect(licenseManager.licenseKey).toBe(trimmedKey);
    });

    it('应该验证canActivate基于密钥长度', () => {
      expect(licenseManager.canActivate).toBe(false);
      
      // 设置36字符的UUID格式密钥
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
      expect(licenseManager.canActivate).toBe(true);
      
      // 设置无效长度的密钥
      licenseManager.setLicenseKey('short-key');
      expect(licenseManager.canActivate).toBe(false);
    });
  });

  describe('许可证激活功能', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
    });

    it('应该成功激活有效许可证', async () => {
      const result = await licenseManager.activate();
      
      expect(result).toBe(true);
      expect(licenseManager.isActivated).toBe(true);
      expect(licenseManager.instanceId).toBe('inst_789012');
      expect(licenseManager.variantName).toBe('Pro Monthly');
      expect(licenseManager.customerName).toBe('Test Customer');
      expect(licenseManager.customerEmail).toBe('test@example.com');
      expect(licenseManager.seatLimit).toBe(5);
      expect(licenseManager.seatUsage).toBe(2);
    });

    it('应该在激活过程中设置忙碌状态', async () => {
      const busyStates: boolean[] = [];
      
      licenseManager.on({
        onBusyChanged: (busy) => busyStates.push(busy)
      });
      
      await licenseManager.activate();
      
      expect(busyStates).toEqual([true, false]);
    });

    it('应该拒绝无效密钥的激活', async () => {
      licenseManager.setLicenseKey('invalid-key');
      
      const result = await licenseManager.activate();
      
      expect(result).toBe(false);
      expect(licenseManager.isActivated).toBe(false);
    });

    it('应该在已忙碌时拒绝激活', async () => {
      // 将licenseManager设置为忙碌状态
      (licenseManager as any).busy = true;
      
      const result = await licenseManager.activate();
      
      expect(result).toBe(false);
    });

    it('应该触发激活相关事件', async () => {
      const mockEvents = {
        onActivationChanged: vi.fn(),
        onLicenseChanged: vi.fn(),
        onBusyChanged: vi.fn()
      };
      
      licenseManager.on(mockEvents);
      await licenseManager.activate();
      
      expect(mockEvents.onActivationChanged).toHaveBeenCalledWith(true);
      expect(mockEvents.onLicenseChanged).toHaveBeenCalled();
      expect(mockEvents.onBusyChanged).toHaveBeenCalled();
    });
  });

  describe('许可证验证功能', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
    });

    it('应该成功验证已激活的许可证', async () => {
      // 先激活
      await licenseManager.activate();
      
      const result = await licenseManager.validate();
      
      expect(result).toBe(true);
      expect(licenseManager.isActivated).toBe(true);
    });

    it('应该处理验证失败的情况', async () => {
      // 模拟API返回无效响应
      const invalidResponse = { ...mockSuccessfulApiResponse, valid: false };
      mockHttpsRequest.mockImplementation((url, options, callback) => {
        const mockResponse = {
          statusCode: 200,
          on: vi.fn().mockImplementation((event, handler) => {
            if (event === 'data') {
              handler(JSON.stringify(invalidResponse));
            } else if (event === 'end') {
              setTimeout(handler, 0);
            }
          })
        };
        callback(mockResponse);
        return { on: vi.fn(), write: vi.fn(), end: vi.fn() };
      });
      
      const result = await licenseManager.validate();
      
      expect(result).toBe(true); // API调用成功但会清除缓存
      expect(licenseManager.isActivated).toBe(false);
    });
  });

  describe('许可证停用功能', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
    });

    it('应该成功停用已激活的许可证', async () => {
      // 先激活
      await licenseManager.activate();
      expect(licenseManager.isActivated).toBe(true);
      
      // 然后停用
      const result = await licenseManager.deactivate();
      
      expect(result).toBe(true);
      expect(licenseManager.isActivated).toBe(false);
      expect(licenseManager.instanceId).toBe('');
    });

    it('应该拒绝停用未激活的许可证', async () => {
      const result = await licenseManager.deactivate();
      
      expect(result).toBe(false);
    });
  });

  describe('特性管理', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
    });

    it('应该正确检查Pro版本的特性', async () => {
      await licenseManager.activate();
      
      expect(licenseManager.isFeatureEnabled('3d-visualization')).toBe(true);
      expect(licenseManager.isFeatureEnabled('advanced-export')).toBe(true);
      expect(licenseManager.isFeatureEnabled('mqtt-publisher')).toBe(true);
      expect(licenseManager.isFeatureEnabled('priority-support')).toBe(true);
      
      // Enterprise独有特性
      expect(licenseManager.isFeatureEnabled('unlimited-devices')).toBe(false);
      expect(licenseManager.isFeatureEnabled('team-collaboration')).toBe(false);
    });

    it('应该在未激活时拒绝所有特性', () => {
      expect(licenseManager.isFeatureEnabled('3d-visualization')).toBe(false);
      expect(licenseManager.isFeatureEnabled('any-feature')).toBe(false);
    });

    it('应该正确检查Enterprise版本的特性', async () => {
      const enterpriseResponse = {
        ...mockSuccessfulApiResponse,
        meta: {
          ...mockSuccessfulApiResponse.meta,
          variant_name: 'Enterprise Yearly'
        }
      };
      
      mockHttpsRequest.mockImplementation((url, options, callback) => {
        const mockResponse = {
          statusCode: 200,
          on: vi.fn().mockImplementation((event, handler) => {
            if (event === 'data') {
              handler(JSON.stringify(enterpriseResponse));
            } else if (event === 'end') {
              setTimeout(handler, 0);
            }
          })
        };
        callback(mockResponse);
        return { on: vi.fn(), write: vi.fn(), end: vi.fn() };
      });
      
      await licenseManager.activate();
      
      expect(licenseManager.isFeatureEnabled('unlimited-devices')).toBe(true);
      expect(licenseManager.isFeatureEnabled('team-collaboration')).toBe(true);
      expect(licenseManager.isFeatureEnabled('advanced-security')).toBe(true);
      expect(licenseManager.isFeatureEnabled('custom-branding')).toBe(true);
    });
  });

  describe('事件系统', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
    });

    it('应该正确注册和触发事件监听器', () => {
      const mockEvents: Partial<LicenseManagerEvents> = {
        onLicenseChanged: vi.fn(),
        onActivationChanged: vi.fn(),
        onBusyChanged: vi.fn()
      };
      
      licenseManager.on(mockEvents);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
      
      expect(mockEvents.onLicenseChanged).toHaveBeenCalled();
    });

    it('应该能够移除事件监听器', () => {
      const mockCallback = vi.fn();
      licenseManager.on({ onLicenseChanged: mockCallback });
      
      licenseManager.off('onLicenseChanged');
      licenseManager.setLicenseKey('test-key');
      
      // 事件应该不会被调用，因为监听器已被移除
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('数据持久化', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
    });

    it('应该加密保存许可证数据', () => {
      licenseManager.setLicenseKey('test-license-key');
      
      expect(mockContext.globalState.update).toHaveBeenCalledWith(
        'licenseData', 
        expect.stringContaining('encrypted_')
      );
    });

    it('应该从存储中读取加密数据', () => {
      const testLicenseInfo: LicenseInfo = {
        licenseKey: 'test-key',
        instanceId: 'test-instance',
        isActivated: true,
        appName: 'Test App',
        variantName: 'Pro',
        instanceName: 'test-machine',
        customerName: 'Test User',
        customerEmail: 'test@test.com',
        seatLimit: 5,
        seatUsage: 1,
        activationDate: new Date(),
        enabledFeatures: ['feature1']
      };
      
      const encryptedData = `encrypted_${JSON.stringify(testLicenseInfo)}`;
      mockContext.globalState.get.mockReturnValue(encryptedData);
      
      // 创建新实例来测试读取
      (LicenseManager as any).instance = null;
      licenseManager = LicenseManager.getInstance(mockContext);
      
      expect(licenseManager.licenseKey).toBe('test-key');
      expect(licenseManager.isActivated).toBe(true);
      expect(licenseManager.customerName).toBe('Test User');
    });
  });

  describe('许可证缓存管理', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
    });

    it('应该清除许可证缓存但保留密钥', async () => {
      await licenseManager.activate();
      expect(licenseManager.isActivated).toBe(true);
      
      licenseManager.clearLicenseCache(false);
      
      expect(licenseManager.licenseKey).toBe('12345678-1234-1234-1234-123456789012');
      expect(licenseManager.isActivated).toBe(false);
      expect(licenseManager.instanceId).toBe('');
      expect(licenseManager.seatLimit).toBe(-1);
    });

    it('应该完全清除许可证数据', async () => {
      await licenseManager.activate();
      
      licenseManager.clearLicenseCache(true);
      
      expect(licenseManager.licenseKey).toBe('');
      expect(licenseManager.isActivated).toBe(false);
      expect(licenseManager.currentLicenseInfo).toBeNull();
    });
  });

  describe('外部链接操作', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
    });

    it('应该打开购买页面', async () => {
      await licenseManager.buy();
      
      expect(vscode.env.openExternal).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function)
        })
      );
    });

    it('应该打开客户门户', async () => {
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
      await licenseManager.activate();
      
      await licenseManager.openCustomerPortal();
      
      expect(vscode.env.openExternal).toHaveBeenCalled();
    });

    it('应该在无客户信息时显示警告', async () => {
      await licenseManager.openCustomerPortal();
      
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('无客户信息可用');
    });
  });

  describe('API错误处理', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
    });

    it('应该处理API请求错误', async () => {
      mockHttpsRequest.mockImplementation((url, options, callback) => {
        const mockResponse = {
          statusCode: 404,
          on: vi.fn().mockImplementation((event, handler) => {
            if (event === 'data') {
              handler('Not Found');
            } else if (event === 'end') {
              setTimeout(handler, 0);
            }
          })
        };
        callback(mockResponse);
        return { on: vi.fn(), write: vi.fn(), end: vi.fn() };
      });
      
      const result = await licenseManager.activate();
      
      expect(result).toBe(false);
      expect(vscode.window.showErrorMessage).toHaveBeenCalled();
    });

    it('应该处理网络错误', async () => {
      mockHttpsRequest.mockImplementation(() => {
        const mockRequest = {
          on: vi.fn().mockImplementation((event, handler) => {
            if (event === 'error') {
              setTimeout(() => handler(new Error('Network error')), 0);
            }
          }),
          write: vi.fn(),
          end: vi.fn()
        };
        return mockRequest;
      });
      
      const result = await licenseManager.activate();
      
      expect(result).toBe(false);
    });
  });

  describe('状态属性访问器', () => {
    beforeEach(() => {
      licenseManager = LicenseManager.getInstance(mockContext);
    });

    it('应该返回正确的默认状态', () => {
      expect(licenseManager.isBusy).toBe(false);
      expect(licenseManager.isActivated).toBe(false);
      expect(licenseManager.canActivate).toBe(false);
      expect(licenseManager.seatLimit).toBe(-1);
      expect(licenseManager.seatUsage).toBe(-1);
      expect(licenseManager.appName).toBe('Serial Studio VSCode');
      expect(licenseManager.licenseKey).toBe('');
      expect(licenseManager.instanceId).toBe('');
      expect(licenseManager.variantName).toBe('');
      expect(licenseManager.instanceName).toBe('');
      expect(licenseManager.customerName).toBe('');
      expect(licenseManager.customerEmail).toBe('');
      expect(licenseManager.currentLicenseInfo).toBeNull();
    });

    it('应该在激活后返回正确的状态', async () => {
      licenseManager.setLicenseKey('12345678-1234-1234-1234-123456789012');
      await licenseManager.activate();
      
      expect(licenseManager.isActivated).toBe(true);
      expect(licenseManager.seatLimit).toBe(5);
      expect(licenseManager.seatUsage).toBe(2);
      expect(licenseManager.appName).toBe('Serial Studio VSCode Pro');
      expect(licenseManager.variantName).toBe('Pro Monthly');
      expect(licenseManager.instanceId).toBe('inst_789012');
      expect(licenseManager.customerName).toBe('Test Customer');
      expect(licenseManager.customerEmail).toBe('test@example.com');
      expect(licenseManager.currentLicenseInfo).not.toBeNull();
    });
  });
});
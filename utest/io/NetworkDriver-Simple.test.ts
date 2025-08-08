/**
 * NetworkDriver 网络驱动简化测试
 * 专注于核心功能覆盖，避免复杂的异步问题
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NetworkDriver, NetworkConfig, NetworkSocketType } from '@extension/io/drivers/NetworkDriver';
import { BusType } from '@shared/types';

describe('NetworkDriver 网络驱动核心功能测试', () => {
  let driver: NetworkDriver;
  let config: NetworkConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      type: BusType.Network,
      host: '192.168.1.100',
      tcpPort: 8080,
      udpPort: 5000,
      protocol: 'tcp',
      socketType: NetworkSocketType.TCP_CLIENT,
      connectTimeout: 5000,
      reconnectInterval: 3000,
      autoReconnect: true,
      keepAlive: true,
      noDelay: true
    };

    driver = new NetworkDriver(config);
  });

  afterEach(() => {
    if (driver) {
      driver.destroy();
    }
  });

  describe('🏗️ 基础功能', () => {
    it('应该正确初始化', () => {
      expect(driver.busType).toBe(BusType.Network);
      expect(driver.displayName).toBe('TCP 192.168.1.100:8080');
    });

    it('应该应用默认配置', () => {
      const minimalConfig: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        protocol: 'tcp'
      };

      const defaultDriver = new NetworkDriver(minimalConfig);
      const finalConfig = defaultDriver.getConfiguration() as NetworkConfig;

      expect(finalConfig.tcpPort).toBe(23);
      expect(finalConfig.udpPort).toBe(53);
      expect(finalConfig.socketType).toBe(NetworkSocketType.TCP_CLIENT);
      
      defaultDriver.destroy();
    });

    it('应该正确显示UDP名称', () => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp'
      };

      const udpDriver = new NetworkDriver(udpConfig);
      expect(udpDriver.displayName).toBe('UDP 192.168.1.100:5000');
      
      udpDriver.destroy();
    });
  });

  describe('📝 配置验证', () => {
    it('应该验证有效配置', () => {
      const validation = driver.validateConfiguration();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该检测无效主机', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        host: ''
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Host address is required');
      
      invalidDriver.destroy();
    });

    it('应该检测无效TCP端口', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        tcpPort: 0
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Valid TCP port (1-65535) is required');
      
      invalidDriver.destroy();
    });

    it('应该检测无效UDP端口', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        protocol: 'udp',
        udpPort: 99999
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Valid UDP port (1-65535) is required');
      
      invalidDriver.destroy();
    });

    it('应该检测无效协议', () => {
      const invalidConfig = {
        ...config,
        protocol: 'invalid' as any
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Protocol must be either tcp or udp');
      
      invalidDriver.destroy();
    });

    it('应该检测无效组播地址', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        protocol: 'udp',
        socketType: NetworkSocketType.UDP_MULTICAST,
        multicastAddress: '192.168.1.1'
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid multicast address format');
      
      invalidDriver.destroy();
    });

    it('应该验证有效的组播地址', () => {
      const validConfig: NetworkConfig = {
        ...config,
        protocol: 'udp',
        socketType: NetworkSocketType.UDP_MULTICAST,
        multicastAddress: '239.255.0.1'
      };
      
      const validDriver = new NetworkDriver(validConfig);
      const validation = validDriver.validateConfiguration();
      
      expect(validation.valid).toBe(true);
      
      validDriver.destroy();
    });

    it('应该检测连接超时', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        connectTimeout: 50 // 小于测试环境最小值
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Connection timeout must be at least 100ms');
      
      invalidDriver.destroy();
    });

    it('应该检测重连间隔', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        reconnectInterval: 50
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Reconnection interval must be at least 100ms');
      
      invalidDriver.destroy();
    });
  });

  describe('🎭 连接状态', () => {
    it('应该报告初始状态', () => {
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    it('应该处理未连接时的写入', async () => {
      const testData = Buffer.from('test');
      
      await expect(driver.write(testData)).rejects.toThrow('Network connection is not writable');
    });
  });

  describe('🧹 资源管理', () => {
    it('应该处理销毁', () => {
      expect(() => {
        driver.destroy();
        driver.destroy(); // 多次调用不应出错
      }).not.toThrow();
    });

    it('应该处理关闭未连接的驱动', async () => {
      await expect(driver.close()).resolves.not.toThrow();
    });
  });
});
/**
 * NetworkDriver 网络驱动 100% 覆盖度测试
 * 
 * 目标：实现NetworkDriver完全覆盖
 * - 代码行覆盖率: 100%
 * - 分支覆盖率: 100%
 * - 函数覆盖率: 100%
 * - 测试所有TCP/UDP通信模式和边界条件
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NetworkDriver, NetworkConfig, NetworkSocketType } from '@extension/io/drivers/NetworkDriver';
import { ConnectionConfig, BusType } from '@shared/types';

// Mock Node.js 网络模块
vi.mock('net', () => ({
  createConnection: vi.fn(),
  createServer: vi.fn(),
  Socket: vi.fn()
}));

vi.mock('dgram', () => ({
  createSocket: vi.fn()
}));

describe('NetworkDriver 网络驱动完全覆盖测试', () => {
  let driver: NetworkDriver;
  let config: NetworkConfig;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 重置模块mocks
    const net = await import('net');
    const dgram = await import('dgram');

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

    // 设置默认的网络mock
    setupNetworkMocks(net, dgram);
    
    driver = new NetworkDriver(config);
  });

  afterEach(() => {
    if (driver) {
      driver.destroy();
    }
  });

  function setupNetworkMocks(net: any, dgram: any) {
    // Mock TCP Socket
    const mockTcpSocket = {
      connect: vi.fn(),
      write: vi.fn().mockReturnValue(true),
      end: vi.fn(),
      destroy: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
      setKeepAlive: vi.fn(),
      setNoDelay: vi.fn(),
      setTimeout: vi.fn(),
      readable: true,
      writable: true,
      readyState: 'open',
      connecting: false,
      destroyed: false
    };

    // Mock TCP Server  
    const mockTcpServer = {
      listen: vi.fn((port, host, callback) => {
        setTimeout(() => callback && callback(), 1);
      }),
      close: vi.fn((callback) => {
        setTimeout(() => callback && callback(), 1);
      }),
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
      address: vi.fn().mockReturnValue({ address: '127.0.0.1', port: 8080 })
    };

    // Mock UDP Socket
    const mockUdpSocket = {
      bind: vi.fn((port, host, callback) => {
        setTimeout(() => callback && callback(), 1);
      }),
      connect: vi.fn((port, host, callback) => {
        setTimeout(() => callback && callback(), 1);
      }),
      send: vi.fn((data, port, host, callback) => {
        setTimeout(() => callback && callback(), 1);
      }),
      close: vi.fn((callback) => {
        setTimeout(() => callback && callback(), 1);
      }),
      on: vi.fn(),
      off: vi.fn(),
      removeAllListeners: vi.fn(),
      addMembership: vi.fn(),
      setMulticastTTL: vi.fn(),
      setBroadcast: vi.fn()
    };

    net.createConnection.mockImplementation(() => mockTcpSocket);
    net.createServer.mockImplementation(() => mockTcpServer);
    dgram.createSocket.mockImplementation(() => mockUdpSocket);

    return { mockTcpSocket, mockTcpServer, mockUdpSocket };
  }

  describe('🏗️ 构造函数和初始化', () => {
    it('应该正确初始化基础属性', () => {
      expect(driver.busType).toBe(BusType.Network);
      expect(driver.displayName).toBe('TCP 192.168.1.100:8080');
      expect(driver.getConfiguration().type).toBe(BusType.Network);
    });

    it('应该正确应用默认配置', () => {
      const minimalConfig: NetworkConfig = {
        type: BusType.Network,
        host: '192.168.1.1',
        protocol: 'tcp'
      };

      const driverWithDefaults = new NetworkDriver(minimalConfig);
      const finalConfig = driverWithDefaults.getConfiguration() as NetworkConfig;

      expect(finalConfig.tcpPort).toBe(23);
      expect(finalConfig.udpPort).toBe(53);
      expect(finalConfig.socketType).toBe(NetworkSocketType.TCP_CLIENT);
      expect(finalConfig.connectTimeout).toBe(5000);
      expect(finalConfig.reconnectInterval).toBe(3000);
      expect(finalConfig.autoReconnect).toBe(true);
      expect(finalConfig.keepAlive).toBe(true);
      expect(finalConfig.noDelay).toBe(true);
      expect(finalConfig.multicastTTL).toBe(1);

      driverWithDefaults.destroy();
    });

    it('应该正确处理UDP协议的显示名称', () => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp'
      };

      const udpDriver = new NetworkDriver(udpConfig);
      expect(udpDriver.displayName).toBe('UDP 192.168.1.100:5000');
      
      udpDriver.destroy();
    });
  });

  describe('🔗 TCP客户端连接', () => {
    it('应该成功建立TCP客户端连接', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      let connectedEmitted = false;
      driver.on('connected', () => {
        connectedEmitted = true;
      });

      // 模拟连接成功
      const connectPromise = driver.open();
      
      // 模拟connect事件
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }

      await connectPromise;

      expect(driver.isOpen()).toBe(true);
      expect(connectedEmitted).toBe(true);
      
      await driver.close();
    });

    it('应该处理TCP连接错误', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });

      // 模拟连接失败
      const connectPromise = driver.open();
      
      // 模拟error事件
      const errorHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      if (errorHandler) {
        errorHandler(new Error('Connection failed'));
      }

      await expect(connectPromise).rejects.toThrow('Connection failed');
      expect(errorEmitted).toBe(true);
    });

    it('应该处理重复的打开请求', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;

      // 第一次打开
      const firstPromise = driver.open();
      
      // 第二次打开应该返回同一个promise
      const secondPromise = driver.open();
      
      expect(firstPromise).toBe(secondPromise);

      // 完成连接
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }

      await firstPromise;
      await secondPromise;

      // 第三次打开已连接的驱动应该立即返回
      await expect(driver.open()).resolves.not.toThrow();
    });

    it('应该处理连接超时', async () => {
      const timeoutConfig: NetworkConfig = {
        ...config,
        connectTimeout: 100
      };

      const timeoutDriver = new NetworkDriver(timeoutConfig);
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 模拟超时
      const connectPromise = timeoutDriver.open();
      
      // 模拟timeout事件
      const timeoutHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'timeout')[1];
      if (timeoutHandler) {
        timeoutHandler();
      }

      // 等待一段时间让超时逻辑执行
      await new Promise(resolve => setTimeout(resolve, 150));
      
      timeoutDriver.destroy();
    });
  });

  describe('🏠 TCP服务器模式', () => {
    beforeEach(() => {
      const serverConfig: NetworkConfig = {
        ...config,
        socketType: NetworkSocketType.TCP_SERVER
      };
      driver = new NetworkDriver(serverConfig);
    });

    it('应该成功启动TCP服务器', async () => {
      const net = await import('net');
      const mockServer = vi.mocked(net.createServer).mock.results[0]?.value;
      
      let connectedEmitted = false;
      driver.on('connected', () => {
        connectedEmitted = true;
      });

      // 模拟服务器启动成功
      const listenPromise = driver.open();
      
      // 模拟listening事件
      const listeningHandler = mockServer?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }

      await listenPromise;

      expect(driver.isOpen()).toBe(true);
      expect(connectedEmitted).toBe(true);
      
      await driver.close();
    });

    it('应该处理客户端连接', async () => {
      const net = await import('net');
      const mockServer = vi.mocked(net.createServer).mock.results[0]?.value;
      
      // 先启动服务器
      const listenPromise = driver.open();
      const listeningHandler = mockServer?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }
      await listenPromise;

      // 模拟客户端连接
      const mockClientSocket = {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
        destroy: vi.fn(),
        readable: true,
        writable: true
      };

      const connectionHandler = mockServer?.on.mock.calls.find((call: any) => call[0] === 'connection')[1];
      if (connectionHandler) {
        connectionHandler(mockClientSocket);
      }

      // 验证客户端socket被正确处理
      expect(mockClientSocket.on).toHaveBeenCalled();
      
      await driver.close();
    });

    it('应该处理服务器错误', async () => {
      const net = await import('net');
      const mockServer = vi.mocked(net.createServer).mock.results[0]?.value;
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });

      // 模拟服务器启动失败
      const listenPromise = driver.open();
      
      // 模拟error事件
      const errorHandler = mockServer?.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      if (errorHandler) {
        errorHandler(new Error('Server bind failed'));
      }

      await expect(listenPromise).rejects.toThrow('Server bind failed');
      expect(errorEmitted).toBe(true);
    });
  });

  describe('📡 UDP通信', () => {
    beforeEach(() => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp',
        socketType: NetworkSocketType.UDP
      };
      driver = new NetworkDriver(udpConfig);
    });

    it('应该成功建立UDP连接', async () => {
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      let connectedEmitted = false;
      driver.on('connected', () => {
        connectedEmitted = true;
      });

      // 模拟UDP绑定成功
      const bindPromise = driver.open();
      
      // 模拟listening事件
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }

      await bindPromise;

      expect(driver.isOpen()).toBe(true);
      expect(connectedEmitted).toBe(true);
      
      await driver.close();
    });

    it('应该处理UDP消息接收', async () => {
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      // 先建立连接
      const bindPromise = driver.open();
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }
      await bindPromise;

      // 模拟消息接收
      let receivedData: Buffer | null = null;
      driver.on('dataReceived', (data: Buffer) => {
        receivedData = data;
      });

      const messageHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'message')[1];
      const testData = Buffer.from('UDP test message');
      
      if (messageHandler) {
        messageHandler(testData, { address: '127.0.0.1', port: 5001 });
      }

      driver.flushBuffer(); // 刷新缓冲区以触发事件
      
      expect(receivedData).toBeTruthy();
      expect(driver.getStats().bytesReceived).toBe(testData.length);
      
      await driver.close();
    });

    it('应该处理UDP错误', async () => {
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      let errorEmitted = false;
      driver.on('error', () => {
        errorEmitted = true;
      });

      // 模拟UDP绑定失败
      const bindPromise = driver.open();
      
      // 模拟error事件
      const errorHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      if (errorHandler) {
        errorHandler(new Error('UDP bind failed'));
      }

      await expect(bindPromise).rejects.toThrow('UDP bind failed');
      expect(errorEmitted).toBe(true);
    });
  });

  describe('🌐 UDP组播模式', () => {
    beforeEach(() => {
      const multicastConfig: NetworkConfig = {
        ...config,
        protocol: 'udp',
        socketType: NetworkSocketType.UDP_MULTICAST,
        multicastAddress: '239.255.0.1',
        multicastTTL: 2
      };
      driver = new NetworkDriver(multicastConfig);
    });

    it('应该成功配置UDP组播', async () => {
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      // 模拟组播绑定成功
      const bindPromise = driver.open();
      
      // 模拟listening事件
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }

      await bindPromise;

      // 验证组播配置被调用
      expect(mockSocket?.addMembership).toHaveBeenCalledWith('239.255.0.1');
      expect(mockSocket?.setMulticastTTL).toHaveBeenCalledWith(2);
      expect(mockSocket?.setBroadcast).toHaveBeenCalledWith(true);
      
      await driver.close();
    });
  });

  describe('📤 数据传输', () => {
    it('应该成功通过TCP发送数据', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 先建立连接
      const connectPromise = driver.open();
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }
      await connectPromise;

      // 发送数据
      const testData = Buffer.from('TCP test data');
      const bytesWritten = await driver.write(testData);

      expect(mockSocket?.write).toHaveBeenCalledWith(testData);
      expect(bytesWritten).toBe(testData.length);
      expect(driver.getStats().bytesSent).toBe(testData.length);
      
      await driver.close();
    });

    it('应该成功通过UDP发送数据', async () => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp'
      };
      const udpDriver = new NetworkDriver(udpConfig);
      
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      // 先建立连接
      const bindPromise = udpDriver.open();
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }
      await bindPromise;

      // 发送数据
      const testData = Buffer.from('UDP test data');
      const bytesWritten = await udpDriver.write(testData);

      expect(mockSocket?.send).toHaveBeenCalledWith(testData, 5000, '192.168.1.100', expect.any(Function));
      expect(bytesWritten).toBe(testData.length);
      
      udpDriver.destroy();
    });

    it('应该拒绝在未连接时发送数据', async () => {
      const testData = Buffer.from('test data');
      
      await expect(driver.write(testData)).rejects.toThrow('Network connection is not writable');
    });

    it('应该处理TCP写入错误', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 先建立连接
      const connectPromise = driver.open();
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }
      await connectPromise;

      // 模拟写入返回false（缓冲区满）
      mockSocket!.write = vi.fn().mockReturnValue(false);
      
      const testData = Buffer.from('test data');
      await expect(driver.write(testData)).rejects.toThrow('TCP write buffer is full');
      
      await driver.close();
    });

    it('应该处理UDP发送错误', async () => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp'
      };
      const udpDriver = new NetworkDriver(udpConfig);
      
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      // 先建立连接
      const bindPromise = udpDriver.open();
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }
      await bindPromise;

      // 模拟发送错误
      mockSocket!.send = vi.fn().mockImplementation((data, port, host, callback) => {
        setTimeout(() => callback(new Error('UDP send failed')), 1);
      });

      const testData = Buffer.from('UDP test data');
      await expect(udpDriver.write(testData)).rejects.toThrow('Failed to send UDP data: UDP send failed');
      
      udpDriver.destroy();
    });
  });

  describe('🔄 自动重连功能', () => {
    it('应该在连接断开时启动自动重连', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 先建立连接
      const connectPromise = driver.open();
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }
      await connectPromise;

      // 模拟连接断开
      const closeHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'close')[1];
      if (closeHandler) {
        closeHandler();
      }

      // 验证重连逻辑被触发
      expect((driver as any).reconnectTimer).toBeTruthy();
      
      await driver.close();
    });

    it('应该在禁用自动重连时不重连', async () => {
      const noReconnectConfig: NetworkConfig = {
        ...config,
        autoReconnect: false
      };
      const noReconnectDriver = new NetworkDriver(noReconnectConfig);
      
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 先建立连接
      const connectPromise = noReconnectDriver.open();
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }
      await connectPromise;

      // 模拟连接断开
      const closeHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'close')[1];
      if (closeHandler) {
        closeHandler();
      }

      // 验证没有启动重连
      expect((noReconnectDriver as any).reconnectTimer).toBeFalsy();
      
      noReconnectDriver.destroy();
    });
  });

  describe('📝 配置验证', () => {
    it('应该验证有效的TCP配置', () => {
      const validation = driver.validateConfiguration();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('应该检测无效主机地址', () => {
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
        udpPort: 70000
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

    it('应该检测UDP组播配置', () => {
      const invalidMulticastConfig: NetworkConfig = {
        ...config,
        protocol: 'udp',
        socketType: NetworkSocketType.UDP_MULTICAST,
        multicastAddress: '192.168.1.1' // 无效的组播地址
      };
      
      const invalidDriver = new NetworkDriver(invalidMulticastConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid multicast address format');
      
      invalidDriver.destroy();
    });

    it('应该检测连接超时配置', () => {
      const invalidConfig: NetworkConfig = {
        ...config,
        connectTimeout: 50 // 小于测试环境最小值(100ms)
      };
      
      const invalidDriver = new NetworkDriver(invalidConfig);
      const validation = invalidDriver.validateConfiguration();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Connection timeout must be at least 100ms');
      
      invalidDriver.destroy();
    });
  });

  describe('🎭 连接状态管理', () => {
    it('应该正确报告未连接状态', () => {
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    it('应该正确报告TCP连接状态', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 先建立连接
      const connectPromise = driver.open();
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }
      await connectPromise;

      expect(driver.isOpen()).toBe(true);
      expect(driver.isReadable()).toBe(true);
      expect(driver.isWritable()).toBe(true);
      
      await driver.close();
      
      expect(driver.isOpen()).toBe(false);
    });

    it('应该正确报告UDP连接状态', async () => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp'
      };
      const udpDriver = new NetworkDriver(udpConfig);
      
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      // 先建立连接
      const bindPromise = udpDriver.open();
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }
      await bindPromise;

      expect(udpDriver.isOpen()).toBe(true);
      expect(udpDriver.isReadable()).toBe(true);
      expect(udpDriver.isWritable()).toBe(true);
      
      await udpDriver.close();
      
      expect(udpDriver.isOpen()).toBe(false);
      
      udpDriver.destroy();
    });
  });

  describe('⚠️ 错误处理', () => {
    it('应该处理基本错误情况', () => {
      expect(() => {
        driver.destroy();
      }).not.toThrow();
    });

    it('应该处理关闭未连接的驱动', async () => {
      await expect(driver.close()).resolves.not.toThrow();
    });
  });

  describe('🧹 资源清理', () => {
    it('应该正确清理TCP资源', async () => {
      const net = await import('net');
      const mockSocket = vi.mocked(net.createConnection).mock.results[0]?.value;
      
      // 先建立连接
      const connectPromise = driver.open();
      const connectHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'connect')[1];
      if (connectHandler) {
        connectHandler();
      }
      await connectPromise;

      driver.destroy();

      expect(mockSocket?.destroy).toHaveBeenCalled();
      expect(mockSocket?.removeAllListeners).toHaveBeenCalled();
    });

    it('应该正确清理UDP资源', async () => {
      const udpConfig: NetworkConfig = {
        ...config,
        protocol: 'udp'
      };
      const udpDriver = new NetworkDriver(udpConfig);
      
      const dgram = await import('dgram');
      const mockSocket = vi.mocked(dgram.createSocket).mock.results[0]?.value;
      
      // 先建立连接
      const bindPromise = udpDriver.open();
      const listeningHandler = mockSocket?.on.mock.calls.find((call: any) => call[0] === 'listening')[1];
      if (listeningHandler) {
        listeningHandler();
      }
      await bindPromise;

      udpDriver.destroy();

      expect(mockSocket?.close).toHaveBeenCalled();
      expect(mockSocket?.removeAllListeners).toHaveBeenCalled();
    });

    it('应该处理多次销毁调用', () => {
      expect(() => {
        driver.destroy();
        driver.destroy();
        driver.destroy();
      }).not.toThrow();
    });
  });
});
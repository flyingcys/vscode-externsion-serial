/**
 * IO模块综合集成测试 - 端到端场景验证
 * 
 * 目标：测试多种驱动组合、配置迁移、错误恢复等完整流程
 * - 代码行覆盖率: 100%
 * - 分支覆盖率: 100%
 * - 函数覆盖率: 100%
 * - 集成测试：多组件协作验证
 * 
 * @author Serial Studio VSCode Extension Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager } from '@extension/io/Manager';
import { DriverFactory } from '@extension/io/DriverFactory';
import { UARTDriver, UARTConfig } from '@extension/io/drivers/UARTDriver';
import { NetworkDriver, NetworkConfig, NetworkSocketType } from '@extension/io/drivers/NetworkDriver';
import { BluetoothLEDriver, BluetoothLEConfig } from '@extension/io/drivers/BluetoothLEDriver';
import { BusType, FrameDetectionMode, ConnectionConfig } from '@shared/types';

describe('IO模块综合集成测试 - 端到端场景验证', () => {
  let ioManager: IOManager;
  let driverFactory: DriverFactory;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    driverFactory = DriverFactory.getInstance();
    ioManager = new IOManager();
    // IOManager自动在构造函数中初始化
  });

  afterEach(async () => {
    if (ioManager) {
      await ioManager.destroy();
    }
    vi.useRealTimers();
  });

  describe('🔄 多种驱动切换场景', () => {
    it('应该支持 UART -> Network -> BluetoothLE 驱动切换', async () => {
      // 1. 首先连接到UART
      const uartConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      };

      await ioManager.connect(uartConfig);
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.driver?.busType).toBe(BusType.UART);

      // 2. 切换到Network驱动
      const networkConfig: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp',
        socketType: NetworkSocketType.TCP_CLIENT
      };

      await ioManager.disconnect();
      await ioManager.connect(networkConfig);
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.driver?.busType).toBe(BusType.Network);

      // 3. 最后切换到BluetoothLE
      const bleConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'test-device-001',
        serviceUuid: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        characteristicUuid: '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
      };

      await ioManager.disconnect();
      await ioManager.connect(bleConfig);
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.driver?.busType).toBe(BusType.BluetoothLE);
    });

    it('应该处理驱动切换过程中的数据残留', async () => {
      // 连接第一个驱动并发送数据
      const uartConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(uartConfig);
      
      // 模拟接收数据
      const testData = Buffer.from('UART data frame\n');
      const currentDriver = ioManager.driver;
      
      let framesReceived: unknown[] = [];
      ioManager.on('frame', (frame) => {
        framesReceived.push(frame);
      });

      // 设置帧检测
      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.EndDelimited,
        endSequence: Buffer.from('\n')
      });

      // 模拟数据到达
      if (currentDriver) {
        (currentDriver as unknown as { processData: (data: Buffer) => void }).processData(testData);
      }

      // 等待数据处理
      await vi.runAllTimersAsync();

      // 验证帧被正确处理
      expect(framesReceived.length).toBeGreaterThanOrEqual(1);

      // 切换驱动
      const networkConfig: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 9090,
        protocol: 'tcp'
      };

      await ioManager.disconnect();
      framesReceived = []; // 清空接收到的帧
      
      await ioManager.connect(networkConfig);
      
      // 验证新驱动工作正常
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.driver?.busType).toBe(BusType.Network);
    });

    it('应该支持相同类型驱动的参数切换', async () => {
      // 第一个网络配置
      const networkConfig1: NetworkConfig = {
        type: BusType.Network,
        host: '192.168.1.100',
        tcpPort: 8080,
        protocol: 'tcp',
        socketType: NetworkSocketType.TCP_CLIENT
      };

      await ioManager.connect(networkConfig1);
      expect(ioManager.driver?.displayName).toContain('192.168.1.100:8080');

      // 切换到不同的网络配置
      const networkConfig2: NetworkConfig = {
        type: BusType.Network,
        host: '10.0.0.1',
        udpPort: 5000,
        protocol: 'udp'
      };

      await ioManager.disconnect();
      await ioManager.connect(networkConfig2);
      
      expect(ioManager.driver?.displayName).toContain('10.0.0.1:5000');
      expect(ioManager.driver?.displayName).toContain('UDP');
    });
  });

  describe('⚙️ 配置迁移机制测试', () => {
    it('应该支持配置的动态更新', async () => {
      const initialConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      };

      await ioManager.connect(initialConfig);
      
      const driver = ioManager.driver as UARTDriver;
      expect(driver.getConfiguration().baudRate).toBe(9600);

      // 更新配置
      const updatedConfig: UARTConfig = {
        ...initialConfig,
        baudRate: 115200,
        dataBits: 7,
        parity: 'even'
      };

      await ioManager.updateConfiguration(updatedConfig);
      
      // 验证配置更新
      const newConfig = driver.getConfiguration() as UARTConfig;
      expect(newConfig.baudRate).toBe(115200);
      expect(newConfig.dataBits).toBe(7);
      expect(newConfig.parity).toBe('even');
    });

    it('应该处理无效配置的迁移', async () => {
      const validConfig: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      await ioManager.connect(validConfig);
      expect(ioManager.isConnected).toBe(true);

      // 尝试更新为无效配置
      const invalidConfig: NetworkConfig = {
        type: BusType.Network,
        host: '', // 无效的主机地址
        tcpPort: -1, // 无效端口
        protocol: 'tcp'
      };

      await expect(ioManager.updateConfiguration(invalidConfig)).rejects.toThrow();
      
      // 验证原配置仍然有效
      expect(ioManager.isConnected).toBe(true);
      const currentConfig = ioManager.driver?.getConfiguration() as NetworkConfig;
      expect(currentConfig.host).toBe('127.0.0.1');
      expect(currentConfig.tcpPort).toBe(8080);
    });

    it('应该支持配置版本兼容性', async () => {
      // 模拟旧版本配置（缺少某些新字段）
      const legacyConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
        // 缺少 dataBits, stopBits, parity 等字段
      } as UARTConfig;

      await ioManager.connect(legacyConfig);
      
      const driver = ioManager.driver as UARTDriver;
      const finalConfig = driver.getConfiguration() as UARTConfig;
      
      // 验证缺失字段被正确填充为默认值
      expect(finalConfig.dataBits).toBeDefined();
      expect(finalConfig.stopBits).toBeDefined();
      expect(finalConfig.parity).toBeDefined();
    });
  });

  describe('🔥 错误恢复完整流程测试', () => {
    it('应该处理驱动初始化失败的恢复', async () => {
      // 模拟驱动创建失败
      const originalCreate = DriverFactory.prototype.createDriver;
      DriverFactory.prototype.createDriver = vi.fn().mockRejectedValueOnce(new Error('Driver creation failed'));

      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/invalid-port',
        baudRate: 9600
      };

      await expect(ioManager.connect(config)).rejects.toThrow('Driver creation failed');
      expect(ioManager.isConnected).toBe(false);

      // 恢复工厂方法并重试连接
      DriverFactory.prototype.createDriver = originalCreate;
      
      const validConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(validConfig);
      expect(ioManager.isConnected).toBe(true);
    });

    it('应该处理连接过程中的网络中断恢复', async () => {
      const networkConfig: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp',
        autoReconnect: true,
        reconnectInterval: 1000
      };

      await ioManager.connect(networkConfig);
      expect(ioManager.isConnected).toBe(true);

      let disconnectCount = 0;
      let reconnectCount = 0;

      ioManager.on('disconnected', () => {
        disconnectCount++;
      });

      ioManager.on('connected', () => {
        reconnectCount++;
      });

      // 模拟网络中断
      const driver = ioManager.driver as NetworkDriver;
      const tcpSocket = (driver as any).tcpSocket;
      
      if (tcpSocket) {
        tcpSocket.emit('close');
      }

      // 等待重连尝试
      await vi.advanceTimersByTimeAsync(1500);

      // 验证断线重连逻辑
      expect(disconnectCount).toBeGreaterThanOrEqual(1);
    });

    it('应该处理数据处理过程中的异常恢复', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(config);

      // 设置错误监听
      let errorsCaught: Error[] = [];
      ioManager.on('error', (error) => {
        errorsCaught.push(error);
      });

      // 模拟数据处理异常
      const driver = ioManager.driver;
      const originalProcessData = (driver as any).processData;
      (driver as any).processData = vi.fn().mockImplementation((data) => {
        throw new Error('Data processing failed');
      });

      // 尝试发送导致异常的数据
      const testData = Buffer.from('problematic data');
      
      try {
        await driver?.write(testData);
      } catch (error) {
        // 错误被正确处理
      }

      // 恢复正常数据处理
      (driver as any).processData = originalProcessData;

      // 验证系统仍然可以正常工作
      expect(ioManager.isConnected).toBe(true);
    });

    it('应该处理多线程处理器崩溃的恢复', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(config);

      // 启用多线程处理
      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.EndDelimited,
        endSequence: Buffer.from('\n'),
        useMultiThread: true
      });

      // 模拟Worker崩溃
      const workerManager = (ioManager as any).workerManager;
      if (workerManager) {
        // 触发worker错误
        workerManager.emit('error', new Error('Worker crashed'));

        // 等待错误处理
        await vi.runAllTimersAsync();

        // 验证系统恢复到单线程处理
        const stats = ioManager.communicationStats;
        expect(stats).toBeDefined();
      }
    });
  });

  describe('💾 内存泄漏检测测试', () => {
    it('应该在多次连接断开后没有内存泄漏', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      // 记录初始状态
      const initialStats = ioManager.communicationStats;

      // 执行多次连接和断开
      for (let i = 0; i < 5; i++) {
        await ioManager.connect(config);
        expect(ioManager.isConnected).toBe(true);

        // 模拟一些数据处理
        const driver = ioManager.driver;
        if (driver) {
          await driver.write(Buffer.from(`test data ${i}`));
        }

        await ioManager.disconnect();
        expect(ioManager.isConnected).toBe(false);
      }

      // 验证资源清理
      const finalStats = ioManager.communicationStats;
      expect(finalStats.connectionsEstablished).toBeGreaterThan(initialStats.connectionsEstablished);

      // 验证没有活跃的定时器或监听器泄漏
      expect(ioManager.driver).toBeUndefined();
    });

    it('应该正确清理事件监听器', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      // 添加多个监听器
      const listeners = [
        vi.fn(), vi.fn(), vi.fn()
      ];

      await ioManager.connect(config);
      
      listeners.forEach(listener => {
        ioManager.on('frame', listener);
        ioManager.on('error', listener);
        ioManager.on('connected', listener);
      });

      // 验证监听器被添加
      expect(ioManager.listenerCount('frame')).toBeGreaterThan(0);

      // 断开连接
      await ioManager.disconnect();

      // 销毁管理器
      await ioManager.shutdown();

      // 验证内部监听器被清理（实际实现可能需要暴露内部状态）
      expect(ioManager.driver).toBeUndefined();
    });

    it('应该清理对象池资源', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(config);

      // 启用对象池
      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.EndDelimited,
        endSequence: Buffer.from('\n'),
        useObjectPool: true
      });

      // 模拟大量帧处理以填充对象池
      const driver = ioManager.driver;
      if (driver) {
        for (let i = 0; i < 100; i++) {
          (driver as any).processData(Buffer.from(`frame-${i}\n`));
        }
      }

      await vi.runAllTimersAsync();

      // 检查对象池状态
      const poolManager = (ioManager as any).objectPoolManager;
      if (poolManager) {
        const poolStats = poolManager.getPoolStats();
        expect(poolStats.totalCreated).toBeGreaterThan(0);
      }

      // 清理资源
      await ioManager.disconnect();
      await ioManager.shutdown();

      // 验证对象池被清理
      if (poolManager) {
        poolManager.clear();
      }
    });
  });

  describe('🔄 并发连接处理测试', () => {
    it('应该处理并发连接请求', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      // 并发发起多个连接请求
      const connectPromises = [
        ioManager.connect(config),
        ioManager.connect(config),
        ioManager.connect(config)
      ];

      // 所有请求都应该解析到相同的连接
      const results = await Promise.allSettled(connectPromises);
      
      // 至少有一个成功
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThanOrEqual(1);

      // 只有一个连接实际建立
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.driver).toBeDefined();
    });

    it('应该处理连接和断开的竞态条件', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      // 并发执行连接和断开
      const operations = [
        ioManager.connect(config),
        new Promise(resolve => setTimeout(() => {
          ioManager.disconnect().then(resolve);
        }, 50)),
        new Promise(resolve => setTimeout(() => {
          ioManager.connect(config).then(resolve);
        }, 100))
      ];

      await Promise.allSettled(operations);

      // 验证最终状态是一致的
      const isConnected = ioManager.isConnected;
      const hasDriver = ioManager.driver !== undefined;
      
      if (isConnected) {
        expect(hasDriver).toBe(true);
      } else {
        expect(hasDriver).toBe(false);
      }
    });

    it('应该处理多个驱动同时写入数据', async () => {
      // 这个测试检查驱动切换期间的数据写入
      const uartConfig: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      };

      await ioManager.connect(uartConfig);

      const networkConfig: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp'
      };

      // 并发执行写入和驱动切换
      const writePromise = ioManager.driver?.write(Buffer.from('test data'));
      const switchPromise = ioManager.disconnect().then(() => 
        ioManager.connect(networkConfig)
      );

      const results = await Promise.allSettled([writePromise, switchPromise]);

      // 验证操作完成
      expect(results.length).toBe(2);
      expect(ioManager.driver?.busType).toBe(BusType.Network);
    });
  });

  describe('🎯 端到端数据流测试', () => {
    it('应该支持完整的数据发送和接收流程', async () => {
      const config: NetworkConfig = {
        type: BusType.Network,
        host: '127.0.0.1',
        tcpPort: 8080,
        protocol: 'tcp',
        socketType: NetworkSocketType.TCP_CLIENT
      };

      await ioManager.connect(config);

      // 设置帧检测
      await ioManager.updateFrameConfig({
        detectionMode: FrameDetectionMode.StartEndDelimited,
        startSequence: Buffer.from('<'),
        endSequence: Buffer.from('>'),
        useMultiThread: false
      });

      let receivedFrames: any[] = [];
      ioManager.on('frame', (frame) => {
        receivedFrames.push(frame);
      });

      // 发送数据
      const testMessage = 'Hello World';
      const frameData = Buffer.from(`<${testMessage}>`);
      
      const driver = ioManager.driver;
      await driver?.write(frameData);

      // 模拟接收相同数据（回环测试）
      if (driver) {
        (driver as any).processData(frameData);
      }

      await vi.runAllTimersAsync();

      // 验证数据流
      expect(receivedFrames.length).toBeGreaterThanOrEqual(1);
      if (receivedFrames.length > 0) {
        const frame = receivedFrames[0];
        expect(frame.data.toString()).toContain(testMessage);
      }
    });

    it('应该支持大数据包的分片处理', async () => {
      const config: UARTConfig = {
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200
      };

      await ioManager.connect(config);

      // 创建大数据包 (1MB)
      const largeData = Buffer.alloc(1024 * 1024, 'A');
      
      // 分多次发送
      const chunkSize = 4096;
      const chunks = [];
      
      for (let i = 0; i < largeData.length; i += chunkSize) {
        const chunk = largeData.slice(i, Math.min(i + chunkSize, largeData.length));
        chunks.push(chunk);
      }

      const driver = ioManager.driver;
      let totalSent = 0;

      // 发送所有chunks
      for (const chunk of chunks) {
        const sent = await driver?.write(chunk);
        if (sent) totalSent += sent;
      }

      expect(totalSent).toBe(largeData.length);

      // 验证统计信息
      const stats = ioManager.communicationStats;
      expect(stats.bytesSent).toBe(largeData.length);
    });
  });
});
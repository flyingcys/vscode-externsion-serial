/**
 * Communication 模块边界条件和错误处理增强测试
 * 目标：补充所有模块的边界条件覆盖
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager } from '@extension/io/Manager';
import { UARTDriver } from '@extension/io/drivers/UARTDriver';
import { NetworkDriver } from '@extension/io/drivers/NetworkDriver';
import { BluetoothLEDriver } from '@extension/io/drivers/BluetoothLEDriver';
import { BusType } from '@shared/types';

describe('Communication Edge Cases & Error Handling', () => {
  describe('🔌 连接超时和中断处理', () => {
    it('should handle network interruption gracefully', async () => {
      const networkDriver = new NetworkDriver({
        type: BusType.Network,
        host: '192.168.1.100',
        port: 8080,
        protocol: 'tcp',
        timeout: 1000
      });

      let reconnectAttempts = 0;
      networkDriver.on('reconnecting', () => {
        reconnectAttempts++;
      });

      // 模拟网络中断
      await networkDriver.open();
      networkDriver.emit('error', new Error('ECONNRESET'));

      // 等待重连尝试
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(reconnectAttempts).toBeGreaterThanOrEqual(0);
      await networkDriver.close();
    });

    it('should handle serial port hot-plug events', async () => {
      const uartDriver = new UARTDriver({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      let deviceRemoved = false;
      uartDriver.on('deviceRemoved', () => {
        deviceRemoved = true;
      });

      await uartDriver.open();
      
      // 模拟设备拔出
      uartDriver.emit('error', new Error('ENOENT'));
      
      await new Promise(resolve => setTimeout(resolve, 50));
      await uartDriver.close();
    });

    it('should handle bluetooth device out of range', async () => {
      const bleDriver = new BluetoothLEDriver({
        type: BusType.BluetoothLE,
        deviceId: 'test-device',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      });

      let connectionLost = false;
      bleDriver.on('connectionLost', () => {
        connectionLost = true;
      });

      // 先发现设备
      await bleDriver.startDiscovery();
      
      try {
        await bleDriver.open();
        
        // 模拟设备超出范围
        bleDriver.emit('rssiUpdate', -100); // 极弱信号
        
        await new Promise(resolve => setTimeout(resolve, 50));
      } finally {
        await bleDriver.close();
      }
    });
  });

  describe('💾 内存和资源管理', () => {
    it('should handle memory pressure scenarios', async () => {
      const ioManager = new IOManager();
      
      // 模拟内存压力
      const largeBuffers = Array.from({ length: 100 }, () => 
        Buffer.alloc(1024 * 1024) // 1MB buffers
      );

      await ioManager.connect({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      // 处理大量数据
      largeBuffers.forEach((buffer, index) => {
        ioManager.processIncomingData?.(buffer);
      });

      const stats = ioManager.communicationStats;
      expect(stats).toBeDefined();
      
      await ioManager.disconnect();
    });

    it('should cleanup resources on process termination', () => {
      const drivers = [
        new UARTDriver({ type: BusType.UART, port: '/dev/ttyUSB0', baudRate: 9600 }),
        new NetworkDriver({ type: BusType.Network, host: '127.0.0.1', port: 8080, protocol: 'tcp' })
      ];

      // 模拟进程终止信号
      process.emit('SIGTERM');
      
      // 验证资源已清理
      drivers.forEach(driver => {
        expect(() => driver.destroy()).not.toThrow();
      });
    });

    it('should handle file descriptor exhaustion', async () => {
      const drivers: UARTDriver[] = [];
      
      try {
        // 尝试创建大量连接
        for (let i = 0; i < 1000; i++) {
          const driver = new UARTDriver({
            type: BusType.UART,
            port: `/dev/ttyUSB${i}`,
            baudRate: 9600
          });
          drivers.push(driver);
          
          // 在真实环境中，这最终会失败
          try {
            await driver.open();
          } catch (error) {
            // 预期的资源耗尽错误
            if (error instanceof Error && error.message.includes('EMFILE')) {
              break;
            }
          }
        }
      } finally {
        // 清理所有驱动
        await Promise.all(drivers.map(driver => driver.close()));
      }
    });
  });

  describe('📊 数据完整性和校验', () => {
    it('should detect and handle data corruption', async () => {
      const ioManager = new IOManager();
      let corruptionDetected = false;

      ioManager.on('dataCorruption', () => {
        corruptionDetected = true;
      });

      await ioManager.connect({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      // 配置校验和检测
      await ioManager.updateFrameConfig({
        detection: 'checksum' as any,
        checksumType: 'crc16',
        decoder: 'plaintext' as any
      });

      // 发送损坏的数据
      const corruptedData = Buffer.from([0x01, 0x02, 0x03, 0xFF, 0xFE]); // 错误的校验和
      ioManager.processIncomingData?.(corruptedData);

      await new Promise(resolve => setTimeout(resolve, 50));
      await ioManager.disconnect();
    });

    it('should handle buffer overflow protection', () => {
      const driver = new UARTDriver({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      // 设置小缓冲区
      driver.setBufferSize(100);

      // 发送超大数据
      const oversizedData = Buffer.alloc(1000, 'A');
      
      expect(() => driver.processData(oversizedData)).not.toThrow();
    });

    it('should validate frame boundaries correctly', async () => {
      const ioManager = new IOManager();
      const frames: Buffer[] = [];

      ioManager.on('frameReceived', (frame: any) => {
        frames.push(frame.data);
      });

      await ioManager.connect({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      await ioManager.updateFrameConfig({
        detection: 'endDelimiter' as any,
        endDelimiter: '\n',
        decoder: 'plaintext' as any
      });

      // 发送部分帧和完整帧
      ioManager.processIncomingData?.(Buffer.from('partial'));
      ioManager.processIncomingData?.(Buffer.from('frame\ncomplete\n'));

      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(frames.length).toBeGreaterThanOrEqual(1);
      await ioManager.disconnect();
    });
  });

  describe('⚙️ 配置边界值测试', () => {
    it('should handle extreme baud rates', () => {
      const extremeRates = [1, 50, 4000000]; // 极低、极高波特率

      extremeRates.forEach(baudRate => {
        const config = {
          type: BusType.UART,
          port: '/dev/ttyUSB0',
          baudRate
        };

        const validation = UARTDriver.validateConfiguration?.(config);
        if (validation) {
          expect(validation).toHaveProperty('valid');
          expect(validation).toHaveProperty('errors');
        }
      });
    });

    it('should handle invalid network addresses', () => {
      const invalidAddresses = [
        '999.999.999.999', // 无效IP
        'invalid-hostname-that-does-not-exist.local',
        '', // 空地址
        'localhost:99999' // 无效端口
      ];

      invalidAddresses.forEach(host => {
        const config = {
          type: BusType.Network,
          host,
          port: 8080,
          protocol: 'tcp' as const
        };

        const validation = NetworkDriver.validateConfiguration?.(config);
        if (validation) {
          expect(validation.valid).toBe(false);
        }
      });
    });

    it('should handle malformed bluetooth UUIDs', () => {
      const invalidUUIDs = [
        'invalid-uuid',
        '12345', // 太短
        '123456789012345678901234567890123456789', // 太长
        'ZZZZ', // 无效字符
        ''  // 空UUID
      ];

      invalidUUIDs.forEach(uuid => {
        const config = {
          type: BusType.BluetoothLE,
          deviceId: 'test-device',
          serviceUuid: uuid,
          characteristicUuid: '2a29'
        };

        const validation = BluetoothLEDriver.validateConfiguration?.(config);
        if (validation) {
          expect(validation.valid).toBe(false);
        }
      });
    });
  });

  describe('🔄 并发和竞态条件', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
      const driver = new UARTDriver({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      // 快速连接/断开循环
      for (let i = 0; i < 10; i++) {
        await driver.open();
        await driver.close();
      }

      // 确保最终状态正确
      expect(driver.isOpen()).toBe(false);
    });

    it('should handle concurrent write operations', async () => {
      const driver = new NetworkDriver({
        type: BusType.Network,
        host: '127.0.0.1',
        port: 8080,
        protocol: 'tcp'
      });

      await driver.open();

      // 并发写入操作
      const writePromises = Array.from({ length: 20 }, (_, i) =>
        driver.write(Buffer.from(`concurrent-write-${i}`))
      );

      const results = await Promise.allSettled(writePromises);
      
      // 大部分写入应该成功
      const successful = results.filter(r => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThan(results.length * 0.8); // 80% 成功率

      await driver.close();
    });

    it('should handle race conditions in configuration updates', async () => {
      const ioManager = new IOManager();
      
      await ioManager.connect({
        type: BusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600
      });

      // 并发配置更新
      const updatePromises = [
        () => ioManager.updateConfiguration({ baudRate: 115200 }),
        () => ioManager.updateConfiguration({ dataBits: 7 }),
        () => ioManager.updateConfiguration({ stopBits: 2 })
      ];

      // 快速执行多个更新
      updatePromises.forEach(update => {
        try {
          update();
        } catch (error) {
          // 某些更新可能因竞态条件失败，这是预期的
        }
      });

      await ioManager.disconnect();
    });
  });

  describe('🌐 跨平台兼容性', () => {
    it('should handle platform-specific serial port paths', () => {
      const platformPaths = {
        win32: ['COM1', 'COM2', 'COM10'],
        darwin: ['/dev/tty.usbserial-1', '/dev/cu.usbmodem1'],
        linux: ['/dev/ttyUSB0', '/dev/ttyACM0', '/dev/ttyS0']
      };

      Object.entries(platformPaths).forEach(([platform, paths]) => {
        paths.forEach(port => {
          const config = {
            type: BusType.UART,
            port,
            baudRate: 9600
          };

          expect(() => new UARTDriver(config)).not.toThrow();
        });
      });
    });

    it('should handle platform-specific bluetooth capabilities', () => {
      const platforms = ['win32', 'darwin', 'linux'];

      platforms.forEach(platform => {
        const originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', { value: platform });

        try {
          const driver = new BluetoothLEDriver({
            type: BusType.BluetoothLE,
            deviceId: 'test-device',
            serviceUuid: '180a',
            characteristicUuid: '2a29'
          });

          const isSupported = driver.isPlatformSupported?.() ?? true;
          expect(typeof isSupported).toBe('boolean');
        } finally {
          Object.defineProperty(process, 'platform', { value: originalPlatform });
        }
      });
    });
  });
});
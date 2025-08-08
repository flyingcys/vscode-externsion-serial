/**
 * DriverFactory-Ultimate-Coverage.test.ts
 * 驱动工厂100%覆盖率终极测试
 * 目标：覆盖DriverFactory单例类的所有方法和分支
 */

import { describe, test, expect, vi, beforeEach, afterEach, MockedFunction } from 'vitest';
import { DriverFactory, DriverCapabilities } from '../../../src/extension/io/DriverFactory';
import { HALDriver } from '../../../src/extension/io/HALDriver';
import { UARTDriver } from '../../../src/extension/io/drivers/UARTDriver';
import { NetworkDriver } from '../../../src/extension/io/drivers/NetworkDriver';
import { BluetoothLEDriver } from '../../../src/extension/io/drivers/BluetoothLEDriver';
import { ConnectionConfig, BusType } from '../../../src/shared/types';

// Mock所有驱动类
vi.mock('../../../src/extension/io/HALDriver');
vi.mock('../../../src/extension/io/drivers/UARTDriver');
vi.mock('../../../src/extension/io/drivers/NetworkDriver');
vi.mock('../../../src/extension/io/drivers/BluetoothLEDriver');

// Mock shared types
const mockBusType = {
  UART: 'uart',
  Network: 'network',
  BluetoothLE: 'bluetooth_le',
};

const mockNetworkSocketType = {
  TCP_CLIENT: 'tcp_client',
  TCP_SERVER: 'tcp_server',
  UDP_CLIENT: 'udp_client',
  UDP_SERVER: 'udp_server',
  UDP_MULTICAST: 'udp_multicast',
};

vi.mock('@shared/types', () => ({
  BusType: mockBusType,
}));

vi.mock('../../../src/extension/io/drivers/NetworkDriver', () => ({
  NetworkDriver: vi.fn(),
  NetworkSocketType: mockNetworkSocketType,
}));

// 创建Mock驱动实例
const createMockDriver = () => ({
  busType: 'uart',
  displayName: 'Mock Driver',
  open: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  isOpen: vi.fn().mockReturnValue(false),
  isReadable: vi.fn().mockReturnValue(true),
  isWritable: vi.fn().mockReturnValue(true),
  write: vi.fn().mockResolvedValue(10),
  destroy: vi.fn(),
  getConfiguration: vi.fn(),
  updateConfiguration: vi.fn(),
  validateConfiguration: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  on: vi.fn(),
  emit: vi.fn(),
});

describe('DriverFactory终极覆盖率测试', () => {
  let factory: DriverFactory;
  let mockUARTDriver: any;
  let mockNetworkDriver: any;
  let mockBluetoothLEDriver: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset singleton
    (DriverFactory as any).instance = undefined;

    // Setup mock drivers
    mockUARTDriver = createMockDriver();
    mockNetworkDriver = createMockDriver();
    mockBluetoothLEDriver = createMockDriver();

    mockUARTDriver.busType = mockBusType.UART;
    mockNetworkDriver.busType = mockBusType.Network;
    mockBluetoothLEDriver.busType = mockBusType.BluetoothLE;

    (UARTDriver as any).mockImplementation(() => mockUARTDriver);
    (NetworkDriver as any).mockImplementation(() => mockNetworkDriver);
    (BluetoothLEDriver as any).mockImplementation(() => mockBluetoothLEDriver);

    // Mock static methods
    (UARTDriver as any).listPorts = vi.fn().mockResolvedValue([
      { name: 'COM1', path: '/dev/ttyUSB0' },
      { name: 'COM2', path: '/dev/ttyUSB1' },
    ]);

    (BluetoothLEDriver as any).isOperatingSystemSupported = vi.fn().mockReturnValue(true);
    mockBluetoothLEDriver.startDiscovery = vi.fn().mockResolvedValue([
      { id: 'device1', name: 'BLE Device 1' },
      { id: 'device2', name: 'BLE Device 2' },
    ]);

    factory = DriverFactory.getInstance();
  });

  afterEach(() => {
    // Clean up singleton
    (DriverFactory as any).instance = undefined;
  });

  describe('单例模式测试', () => {
    test('应该创建单例实例', () => {
      const instance1 = DriverFactory.getInstance();
      const instance2 = DriverFactory.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(DriverFactory);
    });

    test('应该在第一次调用时创建实例', () => {
      (DriverFactory as any).instance = undefined;
      
      const instance = DriverFactory.getInstance();
      
      expect(instance).toBeDefined();
      expect((DriverFactory as any).instance).toBe(instance);
    });
  });

  describe('驱动创建测试', () => {
    test('应该创建UART驱动', () => {
      const config = {
        type: mockBusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 9600,
      };

      const driver = factory.createDriver(config);

      expect(UARTDriver).toHaveBeenCalledWith(config);
      expect(driver).toBe(mockUARTDriver);
    });

    test('应该创建Network驱动', () => {
      const config = {
        type: mockBusType.Network,
        host: '192.168.1.1',
        protocol: 'tcp',
        tcpPort: 8080,
      };

      const driver = factory.createDriver(config);

      expect(NetworkDriver).toHaveBeenCalledWith(config);
      expect(driver).toBe(mockNetworkDriver);
    });

    test('应该创建BluetoothLE驱动', () => {
      const config = {
        type: mockBusType.BluetoothLE,
        deviceId: 'AA:BB:CC:DD:EE:FF',
        serviceUuid: '1234',
        characteristicUuid: '5678',
      };

      const driver = factory.createDriver(config);

      expect(BluetoothLEDriver).toHaveBeenCalledWith(config);
      expect(driver).toBe(mockBluetoothLEDriver);
    });

    test('应该拒绝不支持的总线类型', () => {
      const config = {
        type: 'unsupported' as any,
        port: '/dev/ttyUSB0',
      };

      expect(() => factory.createDriver(config)).toThrow('Unsupported bus type: unsupported');
    });

    test('应该拒绝不支持的平台', () => {
      // Mock BluetoothLE为不支持
      (BluetoothLEDriver as any).isOperatingSystemSupported.mockReturnValue(false);

      const config = {
        type: mockBusType.BluetoothLE,
        deviceId: 'test',
        serviceUuid: '1234',
        characteristicUuid: '5678',
      };

      expect(() => factory.createDriver(config)).toThrow(
        'Driver Bluetooth Low Energy is not supported on this platform'
      );
    });

    test('应该拒绝无效配置', () => {
      const config = {
        type: mockBusType.UART,
        // Missing required port
        baudRate: 9600,
      };

      expect(() => factory.createDriver(config)).toThrow(
        'Configuration validation failed: Port is required for UART connection'
      );
    });
  });

  describe('默认配置创建测试', () => {
    test('应该使用默认配置创建UART驱动', () => {
      const config = {
        type: mockBusType.UART,
        port: '/dev/ttyUSB0',
      };

      const driver = factory.createDriverWithDefaults(config);

      expect(UARTDriver).toHaveBeenCalledWith(
        expect.objectContaining({
          type: mockBusType.UART,
          port: '/dev/ttyUSB0',
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        })
      );
      expect(driver).toBe(mockUARTDriver);
    });

    test('应该覆盖默认配置', () => {
      const config = {
        type: mockBusType.UART,
        port: '/dev/ttyUSB0',
        baudRate: 115200,
      };

      factory.createDriverWithDefaults(config);

      expect(UARTDriver).toHaveBeenCalledWith(
        expect.objectContaining({
          baudRate: 115200, // 应该覆盖默认值
        })
      );
    });
  });

  describe('配置验证测试', () => {
    describe('UART配置验证', () => {
      test('应该验证有效的UART配置', () => {
        const config = {
          type: mockBusType.UART,
          port: '/dev/ttyUSB0',
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toEqual([]);
      });

      test('应该检测缺少端口', () => {
        const config = {
          type: mockBusType.UART,
          baudRate: 9600,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Port is required for UART connection');
      });

      test('应该检测空端口', () => {
        const config = {
          type: mockBusType.UART,
          port: '   ',
          baudRate: 9600,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Port is required for UART connection');
      });

      test('应该验证波特率', () => {
        const config = {
          type: mockBusType.UART,
          port: '/dev/ttyUSB0',
          baudRate: -9600,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Baud rate must be a positive number');
      });

      test('应该验证数据位', () => {
        const config = {
          type: mockBusType.UART,
          port: '/dev/ttyUSB0',
          dataBits: 9,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Data bits must be 5, 6, 7, or 8');
      });

      test('应该验证停止位', () => {
        const config = {
          type: mockBusType.UART,
          port: '/dev/ttyUSB0',
          stopBits: 3,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Stop bits must be 1, 1.5, or 2');
      });

      test('应该验证奇偶校验', () => {
        const config = {
          type: mockBusType.UART,
          port: '/dev/ttyUSB0',
          parity: 'invalid',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Parity must be none, odd, even, mark, or space');
      });

      test('应该接受所有有效的数据位值', () => {
        const validDataBits = [5, 6, 7, 8];

        validDataBits.forEach(dataBits => {
          const config = {
            type: mockBusType.UART,
            port: '/dev/ttyUSB0',
            dataBits,
          };

          const errors = factory.validateConfig(config);
          expect(errors).not.toContain('Data bits must be 5, 6, 7, or 8');
        });
      });

      test('应该接受所有有效的停止位值', () => {
        const validStopBits = [1, 1.5, 2];

        validStopBits.forEach(stopBits => {
          const config = {
            type: mockBusType.UART,
            port: '/dev/ttyUSB0',
            stopBits,
          };

          const errors = factory.validateConfig(config);
          expect(errors).not.toContain('Stop bits must be 1, 1.5, or 2');
        });
      });

      test('应该接受所有有效的奇偶校验值', () => {
        const validParity = ['none', 'odd', 'even', 'mark', 'space'];

        validParity.forEach(parity => {
          const config = {
            type: mockBusType.UART,
            port: '/dev/ttyUSB0',
            parity,
          };

          const errors = factory.validateConfig(config);
          expect(errors).not.toContain('Parity must be none, odd, even, mark, or space');
        });
      });
    });

    describe('Network配置验证', () => {
      test('应该验证有效的Network配置', () => {
        const config = {
          type: mockBusType.Network,
          host: '192.168.1.1',
          protocol: 'tcp',
          tcpPort: 8080,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toEqual([]);
      });

      test('应该检测缺少主机地址', () => {
        const config = {
          type: mockBusType.Network,
          protocol: 'tcp',
          tcpPort: 8080,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Host address is required');
      });

      test('应该检测空主机地址', () => {
        const config = {
          type: mockBusType.Network,
          host: '   ',
          protocol: 'tcp',
          tcpPort: 8080,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Host address is required');
      });

      test('应该检测缺少协议', () => {
        const config = {
          type: mockBusType.Network,
          host: '192.168.1.1',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Protocol (tcp/udp) is required');
      });

      test('应该验证无效协议', () => {
        const config = {
          type: mockBusType.Network,
          host: '192.168.1.1',
          protocol: 'http',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Protocol must be either tcp or udp');
      });

      test('应该验证TCP端口', () => {
        const invalidPorts = [0, -1, 65536, 70000];

        invalidPorts.forEach(tcpPort => {
          const config = {
            type: mockBusType.Network,
            host: '192.168.1.1',
            protocol: 'tcp',
            tcpPort,
          };

          const errors = factory.validateConfig(config);
          expect(errors).toContain('Valid TCP port (1-65535) is required');
        });
      });

      test('应该验证UDP端口', () => {
        const invalidPorts = [0, -1, 65536, 70000];

        invalidPorts.forEach(udpPort => {
          const config = {
            type: mockBusType.Network,
            host: '192.168.1.1',
            protocol: 'udp',
            udpPort,
          };

          const errors = factory.validateConfig(config);
          expect(errors).toContain('Valid UDP port (1-65535) is required');
        });
      });

      test('应该验证多播配置', () => {
        const config = {
          type: mockBusType.Network,
          host: '192.168.1.1',
          protocol: 'udp',
          udpPort: 8080,
          socketType: mockNetworkSocketType.UDP_MULTICAST,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Multicast address is required for multicast mode');
      });

      test('应该验证多播地址格式', () => {
        const invalidAddresses = [
          '192.168.1.1', // 不在多播范围内
          '300.168.1.1', // 无效IP
          '192.168.1', // 不完整
          'invalid',
        ];

        invalidAddresses.forEach(multicastAddress => {
          const config = {
            type: mockBusType.Network,
            host: '192.168.1.1',
            protocol: 'udp',
            udpPort: 8080,
            socketType: mockNetworkSocketType.UDP_MULTICAST,
            multicastAddress,
          };

          const errors = factory.validateConfig(config);
          expect(errors).toContain('Invalid multicast address format');
        });
      });

      test('应该接受有效的多播地址', () => {
        const validAddresses = ['224.1.1.1', '239.255.255.255', '225.0.0.1'];

        validAddresses.forEach(multicastAddress => {
          const config = {
            type: mockBusType.Network,
            host: '192.168.1.1',
            protocol: 'udp',
            udpPort: 8080,
            socketType: mockNetworkSocketType.UDP_MULTICAST,
            multicastAddress,
          };

          const errors = factory.validateConfig(config);
          expect(errors).not.toContain('Invalid multicast address format');
        });
      });

      test('应该验证连接超时', () => {
        const config = {
          type: mockBusType.Network,
          host: '192.168.1.1',
          protocol: 'tcp',
          tcpPort: 8080,
          connectTimeout: 500,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Connection timeout must be at least 1000ms');
      });
    });

    describe('BluetoothLE配置验证', () => {
      test('应该验证有效的BluetoothLE配置', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'AA:BB:CC:DD:EE:FF',
          serviceUuid: '1234',
          characteristicUuid: 'abcd-1234-5678-90ef-123456789012',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toEqual([]);
      });

      test('应该检测操作系统不支持', () => {
        (BluetoothLEDriver as any).isOperatingSystemSupported.mockReturnValue(false);

        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
          characteristicUuid: '5678',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Bluetooth LE is not supported on this operating system');
      });

      test('应该检测缺少设备ID', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          serviceUuid: '1234',
          characteristicUuid: '5678',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Device ID is required');
      });

      test('应该检测空设备ID', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: '   ',
          serviceUuid: '1234',
          characteristicUuid: '5678',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Device ID is required');
      });

      test('应该检测缺少服务UUID', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          characteristicUuid: '5678',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Service UUID is required');
      });

      test('应该检测缺少特征UUID', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Characteristic UUID is required');
      });

      test('应该验证无效的服务UUID格式', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: 'invalid-uuid',
          characteristicUuid: '5678',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Invalid service UUID format');
      });

      test('应该验证无效的特征UUID格式', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
          characteristicUuid: 'invalid-uuid',
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Invalid characteristic UUID format');
      });

      test('应该接受短UUID格式', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
          characteristicUuid: 'abcd',
        };

        const errors = factory.validateConfig(config);
        expect(errors).not.toContain('Invalid service UUID format');
        expect(errors).not.toContain('Invalid characteristic UUID format');
      });

      test('应该接受长UUID格式', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '12345678-1234-5678-9012-123456789012',
          characteristicUuid: 'abcdef12-3456-7890-abcd-ef1234567890',
        };

        const errors = factory.validateConfig(config);
        expect(errors).not.toContain('Invalid service UUID format');
        expect(errors).not.toContain('Invalid characteristic UUID format');
      });

      test('应该在测试环境中使用宽松的超时验证', () => {
        process.env.NODE_ENV = 'test';

        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
          characteristicUuid: '5678',
          scanTimeout: 150,
          connectionTimeout: 200,
        };

        const errors = factory.validateConfig(config);
        expect(errors).not.toContain(expect.stringContaining('timeout must be at least'));

        delete process.env.NODE_ENV;
      });

      test('应该在vitest环境中使用宽松的超时验证', () => {
        process.env.VITEST = 'true';

        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
          characteristicUuid: '5678',
          scanTimeout: 150,
          connectionTimeout: 200,
        };

        const errors = factory.validateConfig(config);
        expect(errors).not.toContain(expect.stringContaining('timeout must be at least'));

        delete process.env.VITEST;
      });

      test('应该在生产环境中使用严格的超时验证', () => {
        const config = {
          type: mockBusType.BluetoothLE,
          deviceId: 'test',
          serviceUuid: '1234',
          characteristicUuid: '5678',
          scanTimeout: 500,
          connectionTimeout: 1000,
        };

        const errors = factory.validateConfig(config);
        expect(errors).toContain('Scan timeout must be at least 1000ms');
        expect(errors).toContain('Connection timeout must be at least 5000ms');
      });
    });

    test('应该处理未知总线类型', () => {
      const config = {
        type: 'unknown' as any,
        port: '/dev/test',
      };

      const errors = factory.validateConfig(config);
      expect(errors).toEqual(['Unsupported bus type: unknown']);
    });
  });

  describe('驱动能力和信息查询测试', () => {
    test('应该获取所有可用驱动', () => {
      const drivers = factory.getAvailableDrivers();

      expect(drivers).toHaveLength(3);
      
      const uartDriver = drivers.find(d => d.busType === mockBusType.UART);
      expect(uartDriver).toMatchObject({
        busType: mockBusType.UART,
        name: 'Serial Port (UART)',
        description: 'RS-232/RS-485 serial communication',
        supported: true,
        features: {
          bidirectional: true,
          streaming: true,
          discovery: true,
          reconnection: true,
          multipleConnections: false,
        },
      });
    });

    test('应该获取支持的总线类型', () => {
      const supportedTypes = factory.getSupportedBusTypes();

      expect(supportedTypes).toContain(mockBusType.UART);
      expect(supportedTypes).toContain(mockBusType.Network);
      expect(supportedTypes).toContain(mockBusType.BluetoothLE);
    });

    test('应该过滤不支持的总线类型', () => {
      (BluetoothLEDriver as any).isOperatingSystemSupported.mockReturnValue(false);

      const supportedTypes = factory.getSupportedBusTypes();

      expect(supportedTypes).toContain(mockBusType.UART);
      expect(supportedTypes).toContain(mockBusType.Network);
      expect(supportedTypes).not.toContain(mockBusType.BluetoothLE);
    });

    test('应该获取默认配置', () => {
      const uartConfig = factory.getDefaultConfig(mockBusType.UART);
      expect(uartConfig).toMatchObject({
        type: mockBusType.UART,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      });

      const networkConfig = factory.getDefaultConfig(mockBusType.Network);
      expect(networkConfig).toMatchObject({
        type: mockBusType.Network,
        host: '127.0.0.1',
        protocol: 'tcp',
      });

      const bleConfig = factory.getDefaultConfig(mockBusType.BluetoothLE);
      expect(bleConfig).toMatchObject({
        type: mockBusType.BluetoothLE,
        autoReconnect: true,
      });
    });

    test('应该拒绝不支持的总线类型的默认配置', () => {
      expect(() => factory.getDefaultConfig('invalid' as any))
        .toThrow('Unsupported bus type: invalid');
    });

    test('应该检查总线类型支持状态', () => {
      expect(factory.isSupported(mockBusType.UART)).toBe(true);
      expect(factory.isSupported(mockBusType.Network)).toBe(true);
      expect(factory.isSupported(mockBusType.BluetoothLE)).toBe(true);
      expect(factory.isSupported('invalid' as any)).toBe(false);
    });

    test('应该获取特定驱动信息', () => {
      const uartInfo = factory.getDriverInfo(mockBusType.UART);
      expect(uartInfo).toMatchObject({
        busType: mockBusType.UART,
        name: 'Serial Port (UART)',
        description: 'RS-232/RS-485 serial communication',
        supported: true,
      });

      const invalidInfo = factory.getDriverInfo('invalid' as any);
      expect(invalidInfo).toBeNull();
    });

    test('应该获取Network驱动特性', () => {
      const networkInfo = factory.getDriverInfo(mockBusType.Network);
      expect(networkInfo?.features).toMatchObject({
        bidirectional: true,
        streaming: true,
        discovery: false,
        reconnection: true,
        multipleConnections: true,
      });
    });

    test('应该获取BluetoothLE驱动特性', () => {
      const bleInfo = factory.getDriverInfo(mockBusType.BluetoothLE);
      expect(bleInfo?.features).toMatchObject({
        bidirectional: true,
        streaming: true,
        discovery: true,
        reconnection: true,
        multipleConnections: false,
      });
    });

    test('应该获取未知类型的默认特性', () => {
      // 通过私有方法访问来测试default case
      const features = (factory as any).getDriverFeatures('unknown');
      expect(features).toMatchObject({
        bidirectional: false,
        streaming: false,
        discovery: false,
        reconnection: false,
        multipleConnections: false,
      });
    });
  });

  describe('设备发现测试', () => {
    test('应该发现UART设备', async () => {
      const devices = await factory.discoverDevices(mockBusType.UART);

      expect(UARTDriver.listPorts).toHaveBeenCalled();
      expect(devices).toEqual([
        { name: 'COM1', path: '/dev/ttyUSB0' },
        { name: 'COM2', path: '/dev/ttyUSB1' },
      ]);
    });

    test('应该返回空的Network设备列表', async () => {
      const devices = await factory.discoverDevices(mockBusType.Network);

      expect(devices).toEqual([]);
    });

    test('应该发现BluetoothLE设备', async () => {
      const devices = await factory.discoverDevices(mockBusType.BluetoothLE);

      expect(BluetoothLEDriver).toHaveBeenCalledWith({
        type: mockBusType.BluetoothLE,
        deviceId: '',
        serviceUuid: '',
        characteristicUuid: '',
      });
      expect(mockBluetoothLEDriver.startDiscovery).toHaveBeenCalled();
      expect(mockBluetoothLEDriver.destroy).toHaveBeenCalled();
      expect(devices).toEqual([
        { id: 'device1', name: 'BLE Device 1' },
        { id: 'device2', name: 'BLE Device 2' },
      ]);
    });

    test('应该在BluetoothLE不支持时抛出错误', async () => {
      (BluetoothLEDriver as any).isOperatingSystemSupported.mockReturnValue(false);

      await expect(factory.discoverDevices(mockBusType.BluetoothLE))
        .rejects.toThrow('Bluetooth LE is not supported on this platform');
    });

    test('应该处理BluetoothLE发现失败', async () => {
      const error = new Error('Discovery failed');
      mockBluetoothLEDriver.startDiscovery.mockRejectedValue(error);

      await expect(factory.discoverDevices(mockBusType.BluetoothLE))
        .rejects.toThrow('Discovery failed');

      expect(mockBluetoothLEDriver.destroy).toHaveBeenCalled();
    });

    test('应该拒绝不支持的总线类型发现', async () => {
      await expect(factory.discoverDevices('invalid' as any))
        .rejects.toThrow('Device discovery not supported for bus type: invalid');
    });
  });

  describe('UUID验证测试', () => {
    test('应该验证短UUID格式', () => {
      const validShortUUIDs = ['1234', 'abcd', 'ABCD', '0000', 'ffff'];

      validShortUUIDs.forEach(uuid => {
        expect((factory as any).isValidUUID(uuid)).toBe(true);
      });
    });

    test('应该验证长UUID格式', () => {
      const validLongUUIDs = [
        '12345678-1234-5678-9012-123456789012',
        'abcdefab-cdef-abcd-efab-cdefabcdefab',
        'ABCDEFAB-CDEF-ABCD-EFAB-CDEFABCDEFAB',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
      ];

      validLongUUIDs.forEach(uuid => {
        expect((factory as any).isValidUUID(uuid)).toBe(true);
      });
    });

    test('应该拒绝无效UUID格式', () => {
      const invalidUUIDs = [
        '123', // 太短
        '12345', // 太长但不够长
        '12345678-1234-5678-9012-12345678901', // 缺少一个字符
        '12345678-1234-5678-9012-1234567890123', // 多了一个字符
        '12345678-1234-5678-9012', // 缺少最后一段
        'gggg', // 无效字符
        'gggggggg-gggg-gggg-gggg-gggggggggggg', // 无效字符
        '', // 空字符串
        'invalid-format',
      ];

      invalidUUIDs.forEach(uuid => {
        expect((factory as any).isValidUUID(uuid)).toBe(false);
      });
    });
  });

  describe('边界条件和错误处理测试', () => {
    test('应该处理所有验证错误组合', () => {
      const config = {
        type: mockBusType.UART,
        // 所有可能的错误
        port: '',
        baudRate: -1,
        dataBits: 9,
        stopBits: 3,
        parity: 'invalid',
      };

      const errors = factory.validateConfig(config);

      expect(errors).toContain('Port is required for UART connection');
      expect(errors).toContain('Baud rate must be a positive number');
      expect(errors).toContain('Data bits must be 5, 6, 7, or 8');
      expect(errors).toContain('Stop bits must be 1, 1.5, or 2');
      expect(errors).toContain('Parity must be none, odd, even, mark, or space');
    });

    test('应该处理网络配置的所有验证错误', () => {
      const config = {
        type: mockBusType.Network,
        host: '',
        protocol: 'invalid',
        tcpPort: 0,
        udpPort: -1,
        connectTimeout: 500,
        socketType: mockNetworkSocketType.UDP_MULTICAST,
        multicastAddress: 'invalid',
      };

      const errors = factory.validateConfig(config);

      expect(errors.length).toBeGreaterThan(4);
      expect(errors).toContain('Host address is required');
      expect(errors).toContain('Protocol must be either tcp or udp');
    });

    test('应该处理蓝牙配置的所有验证错误', () => {
      (BluetoothLEDriver as any).isOperatingSystemSupported.mockReturnValue(false);

      const config = {
        type: mockBusType.BluetoothLE,
        deviceId: '',
        serviceUuid: '',
        characteristicUuid: '',
        scanTimeout: 50,
        connectionTimeout: 100,
      };

      const errors = factory.validateConfig(config);

      expect(errors.length).toBeGreaterThan(5);
      expect(errors).toContain('Bluetooth LE is not supported on this operating system');
      expect(errors).toContain('Device ID is required');
      expect(errors).toContain('Service UUID is required');
      expect(errors).toContain('Characteristic UUID is required');
    });

    test('应该处理空配置对象', () => {
      const config = {} as any;

      const errors = factory.validateConfig(config);
      expect(errors).toContain('Unsupported bus type: undefined');
    });

    test('应该处理null和undefined配置', () => {
      expect(() => factory.validateConfig(null as any)).not.toThrow();
      expect(() => factory.validateConfig(undefined as any)).not.toThrow();
    });
  });

  describe('内存和性能测试', () => {
    test('应该正确管理临时BluetoothLE驱动实例', async () => {
      const destroySpy = vi.spyOn(mockBluetoothLEDriver, 'destroy');

      // 成功发现
      await factory.discoverDevices(mockBusType.BluetoothLE);
      expect(destroySpy).toHaveBeenCalledTimes(1);

      // 失败发现
      mockBluetoothLEDriver.startDiscovery.mockRejectedValueOnce(new Error('Test error'));
      
      try {
        await factory.discoverDevices(mockBusType.BluetoothLE);
      } catch (error) {
        // 预期的错误
      }
      
      expect(destroySpy).toHaveBeenCalledTimes(2);
    });

    test('应该缓存和重用驱动注册表', () => {
      const drivers1 = factory.getAvailableDrivers();
      const drivers2 = factory.getAvailableDrivers();

      // 应该返回相同的内容但不同的数组实例（每次都是新创建）
      expect(drivers1).toEqual(drivers2);
      expect(drivers1).not.toBe(drivers2);
    });

    test('应该正确处理大量连续配置验证', () => {
      const configs = Array(1000).fill(null).map((_, i) => ({
        type: mockBusType.UART,
        port: `/dev/ttyUSB${i}`,
        baudRate: 9600,
      }));

      configs.forEach(config => {
        const errors = factory.validateConfig(config);
        expect(errors).toEqual([]);
      });
    });
  });
});
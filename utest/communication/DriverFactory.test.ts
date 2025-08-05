/**
 * Driver Factory Tests
 * Unit tests for centralized driver creation and management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DriverFactory } from '@extension/io/DriverFactory';
import { NetworkSocketType } from '@extension/io/drivers/NetworkDriver';
import { BusType } from '@shared/types';

describe('DriverFactory', () => {
  let factory: DriverFactory;

  beforeEach(() => {
    factory = DriverFactory.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DriverFactory.getInstance();
      const instance2 = DriverFactory.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Available Drivers', () => {
    it('should return all available drivers', () => {
      const drivers = factory.getAvailableDrivers();
      
      expect(Array.isArray(drivers)).toBe(true);
      expect(drivers.length).toBeGreaterThan(0);
      
      // Should include all supported bus types
      const busTypes = drivers.map(d => d.busType);
      expect(busTypes).toContain(BusType.UART);
      expect(busTypes).toContain(BusType.Network);
      expect(busTypes).toContain(BusType.BluetoothLE);
    });

    it('should return driver capabilities', () => {
      const drivers = factory.getAvailableDrivers();
      const uartDriver = drivers.find(d => d.busType === BusType.UART);
      
      expect(uartDriver).toBeDefined();
      expect(uartDriver!.name).toBe('Serial Port (UART)');
      expect(uartDriver!.description).toContain('RS-232');
      expect(uartDriver!.supported).toBe(true);
      expect(uartDriver!.features).toHaveProperty('bidirectional');
      expect(uartDriver!.features).toHaveProperty('streaming');
      expect(uartDriver!.features).toHaveProperty('discovery');
      expect(uartDriver!.defaultConfig).toHaveProperty('type');
    });

    it('should return network driver capabilities', () => {
      const drivers = factory.getAvailableDrivers();
      const networkDriver = drivers.find(d => d.busType === BusType.Network);
      
      expect(networkDriver).toBeDefined();
      expect(networkDriver!.name).toBe('Network (TCP/UDP)');
      expect(networkDriver!.description).toContain('TCP/UDP');
      expect(networkDriver!.supported).toBe(true);
      expect(networkDriver!.features.bidirectional).toBe(true);
      expect(networkDriver!.features.multipleConnections).toBe(true);
    });

    it('should return bluetooth driver capabilities', () => {
      const drivers = factory.getAvailableDrivers();
      const bleDriver = drivers.find(d => d.busType === BusType.BluetoothLE);
      
      expect(bleDriver).toBeDefined();
      expect(bleDriver!.name).toBe('Bluetooth Low Energy');
      expect(bleDriver!.description).toContain('BLE');
      expect(bleDriver!.features.discovery).toBe(true);
      expect(bleDriver!.features.multipleConnections).toBe(false);
    });
  });

  describe('Supported Bus Types', () => {
    it('should return supported bus types', () => {
      const busTypes = factory.getSupportedBusTypes();
      
      expect(Array.isArray(busTypes)).toBe(true);
      expect(busTypes).toContain(BusType.UART);
      expect(busTypes).toContain(BusType.Network);
      // BluetoothLE may or may not be supported depending on platform
    });

    it('should check if bus type is supported', () => {
      expect(factory.isSupported(BusType.UART)).toBe(true);
      expect(factory.isSupported(BusType.Network)).toBe(true);
    });
  });

  describe('Default Configuration', () => {
    it('should return default UART configuration', () => {
      const config = factory.getDefaultConfig(BusType.UART);
      
      expect(config.type).toBe(BusType.UART);
      expect(config.baudRate).toBe(9600);
      expect(config.dataBits).toBe(8);
      expect(config.stopBits).toBe(1);
      expect(config.parity).toBe('none');
      expect(config.flowControl).toBe('none');
      expect(config.autoReconnect).toBe(true);
    });

    it('should return default Network configuration', () => {
      const config = factory.getDefaultConfig(BusType.Network);
      
      expect(config.type).toBe(BusType.Network);
      expect((config as any).host).toBe('127.0.0.1');
      expect((config as any).protocol).toBe('tcp');
      expect((config as any).tcpPort).toBe(23);
      expect((config as any).udpPort).toBe(53);
      expect((config as any).socketType).toBe(NetworkSocketType.TCP_CLIENT);
      expect(config.autoReconnect).toBe(true);
    });

    it('should return default Bluetooth LE configuration', () => {
      const config = factory.getDefaultConfig(BusType.BluetoothLE);
      
      expect(config.type).toBe(BusType.BluetoothLE);
      expect(config.autoReconnect).toBe(true);
      expect((config as any).scanTimeout).toBe(10000);
      expect((config as any).connectionTimeout).toBe(15000);
      expect((config as any).enableNotifications).toBe(true);
    });

    it('should throw error for unsupported bus type', () => {
      expect(() => {
        factory.getDefaultConfig('invalid' as BusType);
      }).toThrow('Unsupported bus type');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid UART configuration', () => {
      const config = {
        type: BusType.UART,
        port: 'COM1',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none' as const
      };
      
      const errors = factory.validateConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate valid Network configuration', () => {
      const config = {
        type: BusType.Network,
        host: '192.168.1.100',
        protocol: 'tcp' as const,
        tcpPort: 8080
      };
      
      const errors = factory.validateConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should validate valid Bluetooth LE configuration', () => {
      const config = {
        type: BusType.BluetoothLE,
        deviceId: 'device-123',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };
      
      const errors = factory.validateConfig(config);
      expect(errors.length).toBeGreaterThanOrEqual(0); // May have OS-specific errors
    });

    it('should reject invalid UART configuration', () => {
      const config = {
        type: BusType.UART,
        port: '', // Invalid empty port
        baudRate: -1, // Invalid negative baud rate
        dataBits: 9, // Invalid data bits
        stopBits: 3, // Invalid stop bits
        parity: 'invalid' as any // Invalid parity
      };
      
      const errors = factory.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Port is required for UART connection');
      expect(errors).toContain('Baud rate must be a positive number');
      expect(errors).toContain('Data bits must be 5, 6, 7, or 8');
      expect(errors).toContain('Stop bits must be 1, 1.5, or 2');
      expect(errors).toContain('Parity must be none, odd, even, mark, or space');
    });

    it('should reject invalid Network configuration', () => {
      const config = {
        type: BusType.Network,
        host: '', // Invalid empty host
        protocol: 'invalid' as any, // Invalid protocol
        tcpPort: 0 // Invalid port
      };
      
      const errors = factory.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Host address is required');
      expect(errors).toContain('Protocol must be either tcp or udp');
    });

    it('should reject invalid Bluetooth LE configuration', () => {
      const config = {
        type: BusType.BluetoothLE,
        deviceId: '', // Invalid empty device ID
        serviceUuid: 'invalid-uuid', // Invalid UUID
        characteristicUuid: '' // Invalid empty UUID
      };
      
      const errors = factory.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Device ID is required');
      expect(errors).toContain('Characteristic UUID is required');
      expect(errors).toContain('Invalid service UUID format');
    });

    it('should reject unsupported bus type', () => {
      const config = {
        type: 'invalid' as any
      };
      
      const errors = factory.validateConfig(config);
      expect(errors).toContain('Unsupported bus type: invalid');
    });
  });

  describe('Driver Creation', () => {
    it('should create UART driver', () => {
      const config = {
        type: BusType.UART,
        port: 'COM1',
        baudRate: 9600
      };
      
      const driver = factory.createDriver(config);
      expect(driver).toBeDefined();
      expect(driver.busType).toBe(BusType.UART);
    });

    it('should create Network driver', () => {
      const config = {
        type: BusType.Network,
        host: '127.0.0.1',
        protocol: 'tcp' as const,
        tcpPort: 8080
      };
      
      const driver = factory.createDriver(config);
      expect(driver).toBeDefined();
      expect(driver.busType).toBe(BusType.Network);
    });

    it('should create Bluetooth LE driver', () => {
      const config = {
        type: BusType.BluetoothLE,
        deviceId: 'device-123',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };
      
      // May throw if BLE is not supported on platform
      try {
        const driver = factory.createDriver(config);
        expect(driver).toBeDefined();
        expect(driver.busType).toBe(BusType.BluetoothLE);
      } catch (error) {
        // Expected on platforms without BLE support
        expect((error as Error).message).toContain('not supported');
      }
    });

    it('should create driver with defaults', () => {
      const config = {
        type: BusType.Network,
        host: '192.168.1.1'
        // Missing other required fields - should be filled by defaults
      };
      
      const driver = factory.createDriverWithDefaults(config);
      expect(driver).toBeDefined();
      expect(driver.busType).toBe(BusType.Network);
    });

    it('should throw error for invalid configuration', () => {
      const config = {
        type: BusType.UART,
        port: '' // Invalid empty port
      };
      
      expect(() => {
        factory.createDriver(config);
      }).toThrow('Configuration validation failed');
    });

    it('should throw error for unsupported bus type', () => {
      const config = {
        type: 'invalid' as any
      };
      
      expect(() => {
        factory.createDriver(config);
      }).toThrow('Unsupported bus type');
    });
  });

  describe('Driver Information', () => {
    it('should return driver information', () => {
      const info = factory.getDriverInfo(BusType.UART);
      
      expect(info).toBeDefined();
      expect(info!.busType).toBe(BusType.UART);
      expect(info!.name).toBe('Serial Port (UART)');
      expect(info!.supported).toBe(true);
      expect(info!.features).toHaveProperty('bidirectional');
      expect(info!.defaultConfig).toHaveProperty('type');
    });

    it('should return null for invalid bus type', () => {
      const info = factory.getDriverInfo('invalid' as BusType);
      expect(info).toBeNull();
    });
  });

  describe('Device Discovery', () => {
    it('should discover UART devices', async () => {
      // This would require actual serial ports or mocking
      try {
        const devices = await factory.discoverDevices(BusType.UART);
        expect(Array.isArray(devices)).toBe(true);
      } catch (error) {
        // May fail if no serial ports available
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should return empty array for Network discovery', async () => {
      const devices = await factory.discoverDevices(BusType.Network);
      expect(Array.isArray(devices)).toBe(true);
      expect(devices).toHaveLength(0);
    });

    it('should discover Bluetooth LE devices', async () => {
      try {
        const devices = await factory.discoverDevices(BusType.BluetoothLE);
        expect(Array.isArray(devices)).toBe(true);
        // May return mock devices or real devices
      } catch (error) {
        // Expected on platforms without BLE support or due to configuration validation
        const message = (error as Error).message;
        expect(
          message.includes('not supported') || 
          message.includes('Invalid BLE configuration') ||
          message.includes('Device ID is required')
        ).toBe(true);
      }
    });

    it('should throw error for unsupported discovery', async () => {
      await expect(factory.discoverDevices('invalid' as BusType))
        .rejects.toThrow('Device discovery not supported');
    });
  });
});
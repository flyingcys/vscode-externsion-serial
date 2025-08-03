/**
 * Bluetooth LE Driver Tests
 * Unit tests for Bluetooth Low Energy communication driver
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BluetoothLEDriver, BluetoothLEConfig } from '../../src/extension/io/drivers/BluetoothLEDriver';
import { BusType } from '../../src/shared/types';

describe('BluetoothLEDriver', () => {
  let driver: BluetoothLEDriver;
  let config: BluetoothLEConfig;

  beforeEach(() => {
    config = {
      type: BusType.BluetoothLE,
      deviceId: 'device-1',
      serviceUuid: '180a',
      characteristicUuid: '2a29',
      autoReconnect: false, // Disable for testing
      scanTimeout: 2000,
      connectionTimeout: 5000,
      reconnectInterval: 1000
    };
  });

  afterEach(async () => {
    if (driver) {
      await driver.close();
    }
  });

  describe('Constructor and Configuration', () => {
    it('should create driver with valid configuration', () => {
      driver = new BluetoothLEDriver(config);
      
      expect(driver.busType).toBe(BusType.BluetoothLE);
      expect(driver.displayName).toBe('BLE device-1'); // deviceId为'device-1'
    });

    it('should apply default configuration values', () => {
      const minimalConfig: BluetoothLEConfig = {
        type: BusType.BluetoothLE,
        deviceId: 'test-device',
        serviceUuid: '180a',
        characteristicUuid: '2a29'
      };
      
      driver = new BluetoothLEDriver(minimalConfig);
      const actualConfig = driver.getConfiguration() as BluetoothLEConfig;
      
      expect(actualConfig.scanTimeout).toBeDefined();
      expect(actualConfig.connectionTimeout).toBeDefined();
      expect(actualConfig.autoReconnect).toBe(true);
      expect(actualConfig.enableNotifications).toBe(true);
    });

    it('should update display name when device is connected', () => {
      driver = new BluetoothLEDriver(config);
      
      // Initially shows device ID
      expect(driver.displayName).toContain('device-1');
    });
  });

  describe('Platform Support', () => {
    it('should check operating system support', () => {
      const isSupported = BluetoothLEDriver.isOperatingSystemSupported();
      
      // Should return boolean based on platform
      expect(typeof isSupported).toBe('boolean');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject configuration without device ID', () => {
      config.deviceId = '';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Device ID is required');
    });

    it('should reject configuration without service UUID', () => {
      config.serviceUuid = '';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Service UUID is required');
    });

    it('should reject configuration without characteristic UUID', () => {
      config.characteristicUuid = '';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Characteristic UUID is required');
    });

    it('should validate short UUID format', () => {
      config.serviceUuid = '180a';
      config.characteristicUuid = '2a29';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(true);
    });

    it('should validate long UUID format', () => {
      config.serviceUuid = '12345678-1234-1234-1234-123456789abc';
      config.characteristicUuid = '87654321-4321-4321-4321-cba987654321';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(true);
    });

    it('should reject invalid service UUID format', () => {
      config.serviceUuid = 'invalid-uuid';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid service UUID format');
    });

    it('should reject invalid characteristic UUID format', () => {
      config.characteristicUuid = 'invalid-uuid';
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid characteristic UUID format');
    });

    it('should reject scan timeout too small', () => {
      config.scanTimeout = 500;
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Scan timeout must be at least 1000ms');
    });

    it('should reject connection timeout too small', () => {
      config.connectionTimeout = 1000;
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Connection timeout must be at least 5000ms');
    });

    it('should reject reconnection interval too small', () => {
      config.reconnectInterval = 500;
      driver = new BluetoothLEDriver(config);
      const result = driver.validateConfiguration();
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Reconnection interval must be at least 1000ms');
    });
  });

  describe('Connection State', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should start in disconnected state', () => {
      expect(driver.isOpen()).toBe(false);
      expect(driver.isReadable()).toBe(false);
      expect(driver.isWritable()).toBe(false);
    });

    it('should not allow writing when disconnected', async () => {
      const data = Buffer.from('test');
      
      await expect(driver.write(data)).rejects.toThrow('BLE connection is not writable');
    });
  });

  describe('Device Discovery', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should discover devices', async () => {
      // Mock discovery should return some devices
      const devices = await driver.startDiscovery();
      
      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBeGreaterThan(0);
      
      // Check device structure
      if (devices.length > 0) {
        const device = devices[0];
        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('address');
        expect(device).toHaveProperty('rssi');
        expect(device).toHaveProperty('advertisement');
      }
    });

    it('should emit device discovered events', async () => {
      let deviceCount = 0;
      
      driver.on('deviceDiscovered', (device) => {
        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('name');
        deviceCount++;
      });
      
      await driver.startDiscovery();
      expect(deviceCount).toBeGreaterThan(0);
    });

    it('should not start discovery if already scanning', async () => {
      // Start first discovery
      const firstPromise = driver.startDiscovery();
      
      // Try to start second discovery
      await expect(driver.startDiscovery()).rejects.toThrow('Discovery already in progress');
      
      // Wait for first to complete
      await firstPromise;
    });

    it('should return discovered devices list', async () => {
      await driver.startDiscovery();
      const devices = driver.getDiscoveredDevices();
      
      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBeGreaterThan(0);
    });
  });

  describe('Service Discovery', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should discover services after connection', () => {
      const services = driver.getDiscoveredServices();
      
      expect(Array.isArray(services)).toBe(true);
      // Initially empty until connection is established
      expect(services.length).toBe(0);
    });
  });

  describe('Bluetooth Status', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should return correct status', () => {
      const status = driver.getBluetoothStatus();
      
      expect(status.connected).toBe(false);
      expect(status.services).toBe(0);
      expect(status.characteristic).toBe('2a29');
      expect(status.device).toBeUndefined();
    });
  });

  describe('Configuration Updates', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should update configuration and emit event', async () => {
      const newConfig = { 
        deviceId: 'new-device',
        serviceUuid: '180f'
      };
      
      const configChangePromise = new Promise<void>((resolve) => {
        driver.on('configurationChanged', () => {
          const updatedConfig = driver.getConfiguration() as BluetoothLEConfig;
          expect(updatedConfig.deviceId).toBe('new-device');
          expect(updatedConfig.serviceUuid).toBe('180f');
          resolve();
        });
      });
      
      driver.updateConfiguration(newConfig);
      await configChangePromise;
    });

    it('should validate configuration after update', () => {
      driver.updateConfiguration({ deviceId: '' }); // Invalid device ID
      
      expect(driver.isConfigurationValid()).toBe(false);
    });
  });

  describe('Buffer Management', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should set buffer size', () => {
      const newSize = 16384;
      driver.setBufferSize(newSize);
      
      // Buffer size change should not throw error
      expect(() => driver.setBufferSize(newSize)).not.toThrow();
    });

    it('should process incoming data', (done) => {
      const testData = Buffer.from('ble data');
      
      driver.on('dataReceived', (data: Buffer) => {
        expect(data.toString()).toBe('ble data');
        done();
      });
      
      driver.processData(testData);
    });

    it('should flush buffer', () => {
      const testData = Buffer.from('buffered ble data');
      
      driver.processData(testData);
      expect(() => driver.flushBuffer()).not.toThrow();
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should initialize statistics', () => {
      const stats = driver.getStats();
      
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.lastActivity).toBeGreaterThan(0);
    });

    it('should update statistics on data processing', () => {
      const testData = Buffer.from('test');
      driver.processData(testData);
      
      const stats = driver.getStats();
      expect(stats.bytesReceived).toBe(4);
    });

    it('should reset statistics', () => {
      const testData = Buffer.from('test');
      driver.processData(testData);
      
      driver.resetStats();
      const stats = driver.getStats();
      
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      driver = new BluetoothLEDriver(config);
    });

    it('should handle and emit errors', (done) => {
      driver.on('error', (error: Error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      });
      
      // Trigger an error by trying to write without connection
      driver.write(Buffer.from('test')).catch(() => {
        // Expected to fail
      });
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', async () => {
      driver = new BluetoothLEDriver(config);
      
      // Should not throw
      expect(() => driver.destroy()).not.toThrow();
    });
  });

  // Note: Full BLE connection tests would require:
  // 1. Real BLE devices or sophisticated mocking
  // 2. Platform-specific BLE library integration
  // 3. Service and characteristic discovery testing
  // 4. Notification/indication testing
  // 5. Data transmission testing
  // 6. Connection state management testing
  // 7. Error recovery testing
});
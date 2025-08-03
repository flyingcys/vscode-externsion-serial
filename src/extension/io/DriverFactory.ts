/**
 * Driver Factory - Centralized driver creation and management
 * Based on Serial Studio's modular driver architecture
 */

import { HALDriver } from './HALDriver';
import { UARTDriver } from './drivers/UARTDriver';
import { NetworkDriver, NetworkConfig, NetworkSocketType } from './drivers/NetworkDriver';
import { BluetoothLEDriver, BluetoothLEConfig } from './drivers/BluetoothLEDriver';
import { ConnectionConfig, BusType } from '@shared/types';

/**
 * Driver registry entry
 */
interface DriverRegistryEntry {
  busType: BusType;
  name: string;
  description: string;
  factory: (config: ConnectionConfig) => HALDriver;
  configValidator: (config: ConnectionConfig) => string[];
  isSupported: () => boolean;
  getDefaultConfig: () => Partial<ConnectionConfig>;
}

/**
 * Driver capabilities information
 */
export interface DriverCapabilities {
  busType: BusType;
  name: string;
  description: string;
  supported: boolean;
  features: {
    bidirectional: boolean;
    streaming: boolean;
    discovery: boolean;
    reconnection: boolean;
    multipleConnections: boolean;
  };
  defaultConfig: Partial<ConnectionConfig>;
}

/**
 * Driver Factory Class
 * 
 * Provides centralized driver creation, validation, and management.
 * Maintains a registry of available drivers and their capabilities.
 * 
 * Features:
 * - Driver registration and discovery
 * - Configuration validation
 * - Platform capability detection
 * - Default configuration management
 * - Driver lifecycle management
 */
export class DriverFactory {
  private static instance: DriverFactory;
  private drivers: Map<BusType, DriverRegistryEntry> = new Map();

  private constructor() {
    this.initializeDriverRegistry();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DriverFactory {
    if (!DriverFactory.instance) {
      DriverFactory.instance = new DriverFactory();
    }
    return DriverFactory.instance;
  }

  /**
   * Initialize driver registry with all available drivers
   */
  private initializeDriverRegistry(): void {
    // Register UART Driver
    this.drivers.set(BusType.UART, {
      busType: BusType.UART,
      name: 'Serial Port (UART)',
      description: 'RS-232/RS-485 serial communication',
      factory: (config) => new UARTDriver(config as any),
      configValidator: this.validateUARTConfig.bind(this),
      isSupported: () => true, // Always supported in Node.js
      getDefaultConfig: () => ({
        type: BusType.UART,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
        autoReconnect: true,
        timeout: 5000
      })
    });

    // Register Network Driver
    this.drivers.set(BusType.Network, {
      busType: BusType.Network,
      name: 'Network (TCP/UDP)',
      description: 'TCP/UDP network communication',
      factory: (config) => new NetworkDriver(config as NetworkConfig),
      configValidator: this.validateNetworkConfig.bind(this),
      isSupported: () => true, // Always supported in Node.js
      getDefaultConfig: () => ({
        type: BusType.Network,
        host: '127.0.0.1',
        protocol: 'tcp',
        tcpPort: 23,
        udpPort: 53,
        socketType: NetworkSocketType.TCP_CLIENT,
        autoReconnect: true,
        connectTimeout: 5000,
        reconnectInterval: 3000,
        keepAlive: true,
        noDelay: true
      })
    });

    // Register Bluetooth LE Driver
    this.drivers.set(BusType.BluetoothLE, {
      busType: BusType.BluetoothLE,
      name: 'Bluetooth Low Energy',
      description: 'Bluetooth Low Energy (BLE) communication',
      factory: (config) => new BluetoothLEDriver(config as BluetoothLEConfig),
      configValidator: this.validateBluetoothLEConfig.bind(this),
      isSupported: () => BluetoothLEDriver.isOperatingSystemSupported(),
      getDefaultConfig: () => ({
        type: BusType.BluetoothLE,
        autoReconnect: true,
        scanTimeout: 10000,
        connectionTimeout: 15000,
        reconnectInterval: 5000,
        autoDiscoverServices: true,
        enableNotifications: true,
        powerMode: 'balanced'
      })
    });
  }

  /**
   * Create a driver instance based on configuration
   */
  createDriver(config: ConnectionConfig): HALDriver {
    const driverEntry = this.drivers.get(config.type);
    
    if (!driverEntry) {
      throw new Error(`Unsupported bus type: ${config.type}`);
    }

    if (!driverEntry.isSupported()) {
      throw new Error(`Driver ${driverEntry.name} is not supported on this platform`);
    }

    // Validate configuration
    const errors = driverEntry.configValidator(config);
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    // Create driver instance
    return driverEntry.factory(config);
  }

  /**
   * Get all available driver capabilities
   */
  getAvailableDrivers(): DriverCapabilities[] {
    return Array.from(this.drivers.values()).map(entry => ({
      busType: entry.busType,
      name: entry.name,
      description: entry.description,
      supported: entry.isSupported(),
      features: this.getDriverFeatures(entry.busType),
      defaultConfig: entry.getDefaultConfig()
    }));
  }

  /**
   * Get supported bus types
   */
  getSupportedBusTypes(): BusType[] {
    return Array.from(this.drivers.values())
      .filter(entry => entry.isSupported())
      .map(entry => entry.busType);
  }

  /**
   * Get default configuration for a bus type
   */
  getDefaultConfig(busType: BusType): Partial<ConnectionConfig> {
    const driverEntry = this.drivers.get(busType);
    
    if (!driverEntry) {
      throw new Error(`Unsupported bus type: ${busType}`);
    }

    return driverEntry.getDefaultConfig();
  }

  /**
   * Validate configuration for a specific bus type
   */
  validateConfig(config: ConnectionConfig): string[] {
    const driverEntry = this.drivers.get(config.type);
    
    if (!driverEntry) {
      return [`Unsupported bus type: ${config.type}`];
    }

    return driverEntry.configValidator(config);
  }

  /**
   * Check if a bus type is supported
   */
  isSupported(busType: BusType): boolean {
    const driverEntry = this.drivers.get(busType);
    return driverEntry ? driverEntry.isSupported() : false;
  }

  /**
   * Get driver features for a bus type
   */
  private getDriverFeatures(busType: BusType): DriverCapabilities['features'] {
    switch (busType) {
      case BusType.UART:
        return {
          bidirectional: true,
          streaming: true,
          discovery: true,
          reconnection: true,
          multipleConnections: false
        };

      case BusType.Network:
        return {
          bidirectional: true,
          streaming: true,
          discovery: false,
          reconnection: true,
          multipleConnections: true
        };

      case BusType.BluetoothLE:
        return {
          bidirectional: true,
          streaming: true,
          discovery: true,
          reconnection: true,
          multipleConnections: false
        };

      default:
        return {
          bidirectional: false,
          streaming: false,
          discovery: false,
          reconnection: false,
          multipleConnections: false
        };
    }
  }

  /**
   * Validate UART configuration
   */
  private validateUARTConfig(config: ConnectionConfig): string[] {
    const errors: string[] = [];

    if (!config.port || config.port.trim() === '') {
      errors.push('Port is required for UART connection');
    }

    if (config.baudRate && config.baudRate <= 0) {
      errors.push('Baud rate must be a positive number');
    }

    if (config.dataBits && ![5, 6, 7, 8].includes(config.dataBits)) {
      errors.push('Data bits must be 5, 6, 7, or 8');
    }

    if (config.stopBits && ![1, 1.5, 2].includes(config.stopBits)) {
      errors.push('Stop bits must be 1, 1.5, or 2');
    }

    if (config.parity && !['none', 'odd', 'even', 'mark', 'space'].includes(config.parity)) {
      errors.push('Parity must be none, odd, even, mark, or space');
    }

    return errors;
  }

  /**
   * Validate Network configuration
   */
  private validateNetworkConfig(config: ConnectionConfig): string[] {
    const networkConfig = config as NetworkConfig;
    const errors: string[] = [];

    if (!networkConfig.host || networkConfig.host.trim() === '') {
      errors.push('Host address is required');
    }

    if (!networkConfig.protocol) {
      errors.push('Protocol (tcp/udp) is required');
    } else if (!['tcp', 'udp'].includes(networkConfig.protocol)) {
      errors.push('Protocol must be either tcp or udp');
    }

    // Validate ports
    if (networkConfig.protocol === 'tcp') {
      if (!networkConfig.tcpPort || networkConfig.tcpPort < 1 || networkConfig.tcpPort > 65535) {
        errors.push('Valid TCP port (1-65535) is required');
      }
    } else if (networkConfig.protocol === 'udp') {
      if (!networkConfig.udpPort || networkConfig.udpPort < 1 || networkConfig.udpPort > 65535) {
        errors.push('Valid UDP port (1-65535) is required');
      }
    }

    // Validate multicast configuration
    if (networkConfig.socketType === NetworkSocketType.UDP_MULTICAST) {
      if (!networkConfig.multicastAddress) {
        errors.push('Multicast address is required for multicast mode');
      } else {
        // Basic multicast address validation
        const parts = networkConfig.multicastAddress.split('.');
        if (parts.length !== 4 || parseInt(parts[0]) < 224 || parseInt(parts[0]) > 239) {
          errors.push('Invalid multicast address format');
        }
      }
    }

    // Validate timeouts
    if (networkConfig.connectTimeout && networkConfig.connectTimeout < 1000) {
      errors.push('Connection timeout must be at least 1000ms');
    }

    return errors;
  }

  /**
   * Validate Bluetooth LE configuration
   */
  private validateBluetoothLEConfig(config: ConnectionConfig): string[] {
    const bleConfig = config as BluetoothLEConfig;
    const errors: string[] = [];

    // Check OS support
    if (!BluetoothLEDriver.isOperatingSystemSupported()) {
      errors.push('Bluetooth LE is not supported on this operating system');
    }

    // Validate required fields
    if (!bleConfig.deviceId || bleConfig.deviceId.trim() === '') {
      errors.push('Device ID is required');
    }

    if (!bleConfig.serviceUuid || bleConfig.serviceUuid.trim() === '') {
      errors.push('Service UUID is required');
    }

    if (!bleConfig.characteristicUuid || bleConfig.characteristicUuid.trim() === '') {
      errors.push('Characteristic UUID is required');
    }

    // Validate UUIDs format
    if (bleConfig.serviceUuid && !this.isValidUUID(bleConfig.serviceUuid)) {
      errors.push('Invalid service UUID format');
    }

    if (bleConfig.characteristicUuid && !this.isValidUUID(bleConfig.characteristicUuid)) {
      errors.push('Invalid characteristic UUID format');
    }

    // Validate timeouts
    if (bleConfig.scanTimeout && bleConfig.scanTimeout < 1000) {
      errors.push('Scan timeout must be at least 1000ms');
    }

    if (bleConfig.connectionTimeout && bleConfig.connectionTimeout < 5000) {
      errors.push('Connection timeout must be at least 5000ms');
    }

    return errors;
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    // Basic UUID validation (supports both short and long formats)
    const shortUuidRegex = /^[0-9a-f]{4}$/i;
    const longUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    return shortUuidRegex.test(uuid) || longUuidRegex.test(uuid);
  }

  /**
   * Get device discovery functions for each bus type
   */
  async discoverDevices(busType: BusType): Promise<any[]> {
    switch (busType) {
      case BusType.UART:
        return await UARTDriver.listPorts();

      case BusType.Network:
        // Network devices don't have discovery
        return [];

      case BusType.BluetoothLE:
        if (!this.isSupported(BusType.BluetoothLE)) {
          throw new Error('Bluetooth LE is not supported on this platform');
        }
        
        // Create temporary driver for discovery
        const tempConfig: BluetoothLEConfig = {
          type: BusType.BluetoothLE,
          deviceId: '',
          serviceUuid: '',
          characteristicUuid: ''
        };
        
        const bleDriver = new BluetoothLEDriver(tempConfig);
        try {
          const devices = await bleDriver.startDiscovery();
          bleDriver.destroy();
          return devices;
        } catch (error) {
          bleDriver.destroy();
          throw error;
        }

      default:
        throw new Error(`Device discovery not supported for bus type: ${busType}`);
    }
  }

  /**
   * Create driver with merged default configuration
   */
  createDriverWithDefaults(config: Partial<ConnectionConfig> & { type: BusType }): HALDriver {
    const defaultConfig = this.getDefaultConfig(config.type);
    const mergedConfig = { ...defaultConfig, ...config } as ConnectionConfig;
    
    return this.createDriver(mergedConfig);
  }

  /**
   * Get driver information
   */
  getDriverInfo(busType: BusType): DriverCapabilities | null {
    const driverEntry = this.drivers.get(busType);
    
    if (!driverEntry) {
      return null;
    }

    return {
      busType: driverEntry.busType,
      name: driverEntry.name,
      description: driverEntry.description,
      supported: driverEntry.isSupported(),
      features: this.getDriverFeatures(driverEntry.busType),
      defaultConfig: driverEntry.getDefaultConfig()
    };
  }
}
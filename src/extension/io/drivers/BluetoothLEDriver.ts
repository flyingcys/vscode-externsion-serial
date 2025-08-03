/**
 * Bluetooth Low Energy (BLE) Driver
 * Based on Serial Studio's IO::Drivers::BluetoothLE design
 * Provides BLE device discovery, connection, and data communication
 */

import { EventEmitter } from 'events';
import { HALDriver, ConfigValidationResult } from '../HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';

// Note: In a real implementation, you would use a library like 'noble' for BLE support
// For now, we'll create interfaces that match the expected API

/**
 * Bluetooth device information
 */
export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  address: string;
  rssi: number;
  advertisement: {
    localName?: string;
    txPowerLevel?: number;
    manufacturerData?: Buffer;
    serviceUuids?: string[];
  };
}

/**
 * Bluetooth service information
 */
export interface BluetoothServiceInfo {
  uuid: string;
  name: string;
  type: 'primary' | 'secondary';
  characteristics: BluetoothCharacteristicInfo[];
}

/**
 * Bluetooth characteristic information
 */
export interface BluetoothCharacteristicInfo {
  uuid: string;
  name: string;
  properties: {
    read: boolean;
    write: boolean;
    writeWithoutResponse: boolean;
    notify: boolean;
    indicate: boolean;
  };
  descriptors?: BluetoothDescriptorInfo[];
}

/**
 * Bluetooth descriptor information
 */
export interface BluetoothDescriptorInfo {
  uuid: string;
  name: string;
}

/**
 * BLE-specific configuration extending base ConnectionConfig
 */
export interface BluetoothLEConfig extends ConnectionConfig {
  type: BusType.BluetoothLE;
  deviceId: string;
  serviceUuid: string;
  characteristicUuid: string;
  
  // Connection options
  scanTimeout?: number;
  connectionTimeout?: number;
  reconnectInterval?: number;
  
  // Service discovery options
  autoDiscoverServices?: boolean;
  filterServices?: string[];
  
  // Notification options
  enableNotifications?: boolean;
  enableIndications?: boolean;
  
  // Power management
  powerMode?: 'low' | 'balanced' | 'high';
}

/**
 * Mock BLE peripheral interface (would be replaced with actual noble peripheral)
 */
interface MockBLEPeripheral {
  id: string;
  address: string;
  addressType: string;
  connectable: boolean;
  advertisement: any;
  rssi: number;
  state: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
  
  connect(callback?: (error?: Error) => void): void;
  disconnect(callback?: (error?: Error) => void): void;
  discoverServices(serviceUUIDs?: string[], callback?: (error?: Error, services?: any[]) => void): void;
  discoverAllServicesAndCharacteristics(callback?: (error?: Error, services?: any[], characteristics?: any[]) => void): void;
  
  on(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Mock BLE characteristic interface
 */
interface MockBLECharacteristic {
  uuid: string;
  name: string;
  type: string;
  properties: string[];
  
  read(callback?: (error?: Error, data?: Buffer) => void): void;
  write(data: Buffer, withoutResponse?: boolean, callback?: (error?: Error) => void): void;
  subscribe(callback?: (error?: Error) => void): void;
  unsubscribe(callback?: (error?: Error) => void): void;
  
  on(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Bluetooth LE Driver Implementation
 * 
 * Provides Bluetooth Low Energy communication capabilities following Serial Studio's
 * BLE driver architecture. Supports device discovery, service exploration,
 * and data communication through characteristics.
 * 
 * Features:
 * - Device discovery and filtering
 * - Service and characteristic discovery
 * - Read/Write/Notify operations
 * - Automatic reconnection
 * - Connection state management
 * - Error handling and recovery
 * 
 * Note: This implementation uses mock interfaces. In a real deployment,
 * you would integrate with a BLE library like 'noble' or '@abandonware/noble'
 */
export class BluetoothLEDriver extends HALDriver {
  private discoveredDevices: Map<string, BluetoothDeviceInfo> = new Map();
  private connectedDevice?: BluetoothDeviceInfo;
  private currentPeripheral?: MockBLEPeripheral;
  private currentCharacteristic?: MockBLECharacteristic;
  private services: Map<string, BluetoothServiceInfo> = new Map();
  private isScanning = false;
  private isConnecting = false;
  private reconnectTimer?: NodeJS.Timeout;
  
  // Default configuration values
  private static readonly DEFAULT_SCAN_TIMEOUT = 10000;
  private static readonly DEFAULT_CONNECTION_TIMEOUT = 15000;
  private static readonly DEFAULT_RECONNECT_INTERVAL = 5000;

  constructor(config: BluetoothLEConfig) {
    super(config);
    
    // Apply BLE-specific defaults
    this.config = {
      scanTimeout: BluetoothLEDriver.DEFAULT_SCAN_TIMEOUT,
      connectionTimeout: BluetoothLEDriver.DEFAULT_CONNECTION_TIMEOUT,
      reconnectInterval: BluetoothLEDriver.DEFAULT_RECONNECT_INTERVAL,
      autoReconnect: true,
      autoDiscoverServices: true,
      enableNotifications: true,
      powerMode: 'balanced',
      ...config
    } as BluetoothLEConfig;
  }

  get busType(): BusType {
    return BusType.BluetoothLE;
  }

  get displayName(): string {
    const config = this.config as BluetoothLEConfig;
    const deviceName = this.connectedDevice?.name || config.deviceId || 'Unknown';
    return `BLE ${deviceName}`;
  }

  /**
   * Check if the operating system supports Bluetooth LE
   */
  static isOperatingSystemSupported(): boolean {
    // In a real implementation, you would check platform capabilities
    const platform = process.platform;
    return platform === 'darwin' || platform === 'linux' || platform === 'win32';
  }

  /**
   * Start device discovery
   */
  async startDiscovery(): Promise<BluetoothDeviceInfo[]> {
    if (this.isScanning) {
      throw new Error('Discovery already in progress');
    }

    if (!BluetoothLEDriver.isOperatingSystemSupported()) {
      throw new Error('Bluetooth LE is not supported on this operating system');
    }

    const config = this.config as BluetoothLEConfig;
    this.isScanning = true;
    this.discoveredDevices.clear();

    try {
      console.log('Starting BLE device discovery...');
      
      // Mock device discovery - in real implementation, use noble.startScanning()
      await this.mockDeviceDiscovery(config);
      
      const devices = Array.from(this.discoveredDevices.values());
      console.log(`Discovery completed. Found ${devices.length} devices`);
      
      return devices;
      
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Mock device discovery for demonstration
   */
  private async mockDeviceDiscovery(config: BluetoothLEConfig): Promise<void> {
    return new Promise((resolve) => {
      // Simulate discovery delay
      setTimeout(() => {
        // Add some mock devices
        const mockDevices: BluetoothDeviceInfo[] = [
          {
            id: 'device-1',
            name: 'Arduino Nano 33 BLE',
            address: '00:11:22:33:44:55',
            rssi: -45,
            advertisement: {
              localName: 'Arduino Nano 33 BLE',
              serviceUuids: ['180a', '180f'],
              manufacturerData: Buffer.from([0x01, 0x02, 0x03])
            }
          },
          {
            id: 'device-2', 
            name: 'ESP32 BLE',
            address: 'aa:bb:cc:dd:ee:ff',
            rssi: -67,
            advertisement: {
              localName: 'ESP32 BLE',
              serviceUuids: ['12345678-1234-1234-1234-123456789abc'],
              txPowerLevel: 4
            }
          }
        ];

        mockDevices.forEach(device => {
          this.discoveredDevices.set(device.id, device);
          // Emit as generic event since it's not in HALDriverEvents
          (this as any).emit('deviceDiscovered', device);
        });

        resolve();
      }, config.scanTimeout! / 2);
    });
  }

  /**
   * Open connection to BLE device
   */
  async open(): Promise<void> {
    if (this.isOpen()) {
      return;
    }

    if (this.isConnecting) {
      throw new Error('Connection attempt already in progress');
    }

    const config = this.config as BluetoothLEConfig;
    
    if (!config.deviceId) {
      throw new Error('Device ID is required for BLE connection');
    }

    this.isConnecting = true;

    try {
      // Find device in discovered devices or discover it
      let device = this.discoveredDevices.get(config.deviceId);
      if (!device) {
        console.log('Device not in cache, starting discovery...');
        const devices = await this.startDiscovery();
        device = devices.find(d => d.id === config.deviceId);
        
        if (!device) {
          throw new Error(`Device ${config.deviceId} not found`);
        }
      }

      // Connect to device
      await this.connectToDevice(device);
      
      // Discover services and characteristics
      if (config.autoDiscoverServices) {
        await this.discoverServices();
      }

      // Set up characteristic for communication
      await this.setupCharacteristic(config);

      this.connectedDevice = device;
      this.emit('connected');
      console.log(`BLE driver connected to: ${device.name} (${device.address})`);
      
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Connect to a specific BLE device
   */
  private async connectToDevice(device: BluetoothDeviceInfo): Promise<void> {
    const config = this.config as BluetoothLEConfig;
    
    return new Promise((resolve, reject) => {
      // Mock peripheral connection - in real implementation, use noble.peripheral
      this.currentPeripheral = this.createMockPeripheral(device);
      
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout after ${config.connectionTimeout}ms`));
      }, config.connectionTimeout);

      this.currentPeripheral.on('connect', () => {
        clearTimeout(timeout);
        console.log(`Connected to BLE device: ${device.name}`);
        resolve();
      });

      this.currentPeripheral.on('disconnect', () => {
        console.log('BLE device disconnected');
        this.currentPeripheral = undefined;
        this.currentCharacteristic = undefined;
        this.emit('disconnected');
        this.scheduleReconnect();
      });

      this.currentPeripheral.on('error', (error: Error) => {
        clearTimeout(timeout);
        this.handleError(error);
        reject(error);
      });

      // Initiate connection
      this.currentPeripheral.connect();
    });
  }

  /**
   * Discover services on connected device
   */
  private async discoverServices(): Promise<void> {
    if (!this.currentPeripheral) {
      throw new Error('No connected peripheral');
    }
    
    return new Promise((resolve, reject) => {
      this.currentPeripheral!.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        if (error) {
          reject(error);
          return;
        }

        // Process discovered services
        if (services) {
          services.forEach((service: any) => {
            const serviceInfo: BluetoothServiceInfo = {
              uuid: service.uuid,
              name: service.name || service.uuid,
              type: service.type || 'primary',
              characteristics: []
            };

            // Process characteristics for this service
            if (characteristics) {
              const serviceCharacteristics = characteristics.filter((char: any) => 
                char.serviceUuid === service.uuid
              );
              
              serviceCharacteristics.forEach((char: any) => {
                const charInfo: BluetoothCharacteristicInfo = {
                  uuid: char.uuid,
                  name: char.name || char.uuid,
                  properties: {
                    read: char.properties.includes('read'),
                    write: char.properties.includes('write'),
                    writeWithoutResponse: char.properties.includes('writeWithoutResponse'),
                    notify: char.properties.includes('notify'),
                    indicate: char.properties.includes('indicate')
                  }
                };
                
                serviceInfo.characteristics.push(charInfo);
              });
            }

            this.services.set(service.uuid, serviceInfo);
          });
        }

        console.log(`Discovered ${this.services.size} services`);
        // Emit as generic event since it's not in HALDriverEvents
        (this as any).emit('servicesDiscovered', Array.from(this.services.values()));
        resolve();
      });
    });
  }

  /**
   * Set up communication characteristic
   */
  private async setupCharacteristic(config: BluetoothLEConfig): Promise<void> {
    if (!config.characteristicUuid) {
      throw new Error('Characteristic UUID is required');
    }

    // Find the characteristic
    let targetCharacteristic: BluetoothCharacteristicInfo | undefined;
    for (const service of this.services.values()) {
      targetCharacteristic = service.characteristics.find(
        char => char.uuid === config.characteristicUuid
      );
      if (targetCharacteristic) {
        break;
      }
    }

    if (!targetCharacteristic) {
      throw new Error(`Characteristic ${config.characteristicUuid} not found`);
    }

    // Mock characteristic setup
    this.currentCharacteristic = this.createMockCharacteristic(targetCharacteristic);

    // Enable notifications if supported and requested
    if (targetCharacteristic.properties.notify && config.enableNotifications) {
      await this.enableNotifications();
    }

    console.log(`Set up characteristic: ${targetCharacteristic.name} (${targetCharacteristic.uuid})`);
  }

  /**
   * Enable notifications on current characteristic
   */
  private async enableNotifications(): Promise<void> {
    if (!this.currentCharacteristic) {
      throw new Error('No characteristic available');
    }

    return new Promise((resolve, reject) => {
      this.currentCharacteristic!.on('data', (data: Buffer) => {
        console.log(`BLE notification received: ${data.length} bytes`);
        this.processData(data);
      });

      this.currentCharacteristic!.subscribe((error) => {
        if (error) {
          reject(error);
        } else {
          console.log('BLE notifications enabled');
          resolve();
        }
      });
    });
  }

  /**
   * Close BLE connection
   */
  async close(): Promise<void> {
    // Clear reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    // Disconnect from peripheral
    if (this.currentPeripheral) {
      return new Promise((resolve) => {
        this.currentPeripheral!.disconnect(() => {
          this.currentPeripheral = undefined;
          this.currentCharacteristic = undefined;
          this.connectedDevice = undefined;
          this.services.clear();
          
          this.emit('disconnected');
          console.log('BLE driver disconnected');
          resolve();
        });
      });
    }
  }

  /**
   * Check if BLE connection is open
   */
  isOpen(): boolean {
    return this.currentPeripheral?.state === 'connected' && 
           this.currentCharacteristic !== undefined;
  }

  /**
   * Check if BLE connection is readable
   */
  isReadable(): boolean {
    return this.isOpen() && 
           this.currentCharacteristic !== undefined;
  }

  /**
   * Check if BLE connection is writable
   */
  isWritable(): boolean {
    return this.isOpen() && 
           this.currentCharacteristic !== undefined;
  }

  /**
   * Validate BLE configuration
   */
  validateConfiguration(): ConfigValidationResult {
    const config = this.config as BluetoothLEConfig;
    const errors: string[] = [];

    // Check OS support
    if (!BluetoothLEDriver.isOperatingSystemSupported()) {
      errors.push('Bluetooth LE is not supported on this operating system');
    }

    // Validate required fields
    if (!config.deviceId || config.deviceId.trim() === '') {
      errors.push('Device ID is required');
    }

    if (!config.serviceUuid || config.serviceUuid.trim() === '') {
      errors.push('Service UUID is required');
    }

    if (!config.characteristicUuid || config.characteristicUuid.trim() === '') {
      errors.push('Characteristic UUID is required');
    }

    // Validate UUIDs format (basic validation)
    if (config.serviceUuid && !this.isValidUUID(config.serviceUuid)) {
      errors.push('Invalid service UUID format');
    }

    if (config.characteristicUuid && !this.isValidUUID(config.characteristicUuid)) {
      errors.push('Invalid characteristic UUID format');
    }

    // Validate timeouts
    if (config.scanTimeout && config.scanTimeout < 1000) {
      errors.push('Scan timeout must be at least 1000ms');
    }

    if (config.connectionTimeout && config.connectionTimeout < 5000) {
      errors.push('Connection timeout must be at least 5000ms');
    }

    if (config.reconnectInterval && config.reconnectInterval < 1000) {
      errors.push('Reconnection interval must be at least 1000ms');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Write data to BLE characteristic
   */
  async write(data: Buffer): Promise<number> {
    if (!this.isWritable()) {
      throw new Error('BLE connection is not writable');
    }

    if (!this.currentCharacteristic) {
      throw new Error('No characteristic available for writing');
    }

    try {
      return new Promise((resolve, reject) => {
        this.currentCharacteristic!.write(data, false, (error) => {
          if (error) {
            this.handleError(error);
            reject(error);
          } else {
            this.updateSentStats(data.length);
            console.log(`BLE data sent: ${data.length} bytes`);
            resolve(data.length);
          }
        });
      });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Read data from BLE characteristic
   */
  async readCharacteristic(): Promise<Buffer> {
    if (!this.isReadable()) {
      throw new Error('BLE connection is not readable');
    }

    if (!this.currentCharacteristic) {
      throw new Error('No characteristic available for reading');
    }

    return new Promise((resolve, reject) => {
      this.currentCharacteristic!.read((error, data) => {
        if (error) {
          this.handleError(error);
          reject(error);
        } else if (data) {
          console.log(`BLE data read: ${data.length} bytes`);
          resolve(data);
        } else {
          reject(new Error('No data received'));
        }
      });
    });
  }

  /**
   * Get list of discovered devices
   */
  getDiscoveredDevices(): BluetoothDeviceInfo[] {
    return Array.from(this.discoveredDevices.values());
  }

  /**
   * Get list of discovered services
   */
  getDiscoveredServices(): BluetoothServiceInfo[] {
    return Array.from(this.services.values());
  }

  /**
   * Get BLE-specific status information
   */
  getBluetoothStatus(): {
    connected: boolean;
    device?: BluetoothDeviceInfo;
    services: number;
    characteristic?: string;
    rssi?: number;
  } {
    return {
      connected: this.isOpen(),
      device: this.connectedDevice,
      services: this.services.size,
      characteristic: (this.config as BluetoothLEConfig).characteristicUuid,
      rssi: this.connectedDevice?.rssi
    };
  }

  /**
   * Schedule automatic reconnection if enabled
   */
  private scheduleReconnect(): void {
    const config = this.config as BluetoothLEConfig;
    
    if (config.autoReconnect && !this.reconnectTimer) {
      console.log(`Scheduling BLE reconnection in ${config.reconnectInterval}ms`);
      
      this.reconnectTimer = setTimeout(async () => {
        this.reconnectTimer = undefined;
        
        if (!this.isOpen()) {
          try {
            console.log('Attempting BLE automatic reconnection...');
            await this.open();
          } catch (error) {
            console.error('BLE automatic reconnection failed:', error);
            this.scheduleReconnect(); // Schedule next attempt
          }
        }
      }, config.reconnectInterval);
    }
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
   * Create mock peripheral for demonstration
   */
  private createMockPeripheral(device: BluetoothDeviceInfo): MockBLEPeripheral {
    const peripheral = new EventEmitter() as any;
    
    peripheral.id = device.id;
    peripheral.address = device.address;
    peripheral.addressType = 'public';
    peripheral.connectable = true;
    peripheral.advertisement = device.advertisement;
    peripheral.rssi = device.rssi;
    peripheral.state = 'disconnected';

    peripheral.connect = (callback?: (error?: Error) => void): void => {
      setTimeout(() => {
        peripheral.state = 'connected';
        peripheral.emit('connect');
        if (callback) {
          callback();
        }
      }, 1000);
    };

    peripheral.disconnect = (callback?: (error?: Error) => void): void => {
      setTimeout(() => {
        peripheral.state = 'disconnected';
        peripheral.emit('disconnect');
        if (callback) {
          callback();
        }
      }, 500);
    };

    peripheral.discoverAllServicesAndCharacteristics = (callback?: (error?: Error, services?: any[], characteristics?: any[]) => void): void => {
      setTimeout(() => {
        const mockServices = [
          { uuid: '180a', name: 'Device Information', type: 'primary' },
          { uuid: '180f', name: 'Battery Service', type: 'primary' }
        ];
        
        const mockCharacteristics = [
          { 
            uuid: '2a29', 
            name: 'Manufacturer Name', 
            serviceUuid: '180a',
            properties: ['read']
          },
          { 
            uuid: '2a19', 
            name: 'Battery Level', 
            serviceUuid: '180f',
            properties: ['read', 'notify']
          }
        ];
        
        if (callback) {callback(undefined, mockServices, mockCharacteristics);}
      }, 1500);
    };

    return peripheral;
  }

  /**
   * Create mock characteristic for demonstration
   */
  private createMockCharacteristic(charInfo: BluetoothCharacteristicInfo): MockBLECharacteristic {
    const characteristic = new EventEmitter() as any;
    
    characteristic.uuid = charInfo.uuid;
    characteristic.name = charInfo.name;
    characteristic.type = 'org.bluetooth.characteristic';
    characteristic.properties = Object.keys(charInfo.properties).filter(
      prop => charInfo.properties[prop as keyof typeof charInfo.properties]
    );

    characteristic.read = (callback?: (error?: Error, data?: Buffer) => void): void => {
      setTimeout(() => {
        const mockData = Buffer.from('Hello from BLE device!');
        if (callback) {callback(undefined, mockData);}
      }, 100);
    };

    characteristic.write = (data: Buffer, withoutResponse?: boolean, callback?: (error?: Error) => void): void => {
      setTimeout(() => {
        console.log(`Mock BLE write: ${data.toString()}`);
        if (callback) {
          callback();
        }
      }, 100);
    };

    characteristic.subscribe = (callback?: (error?: Error) => void): void => {
      setTimeout(() => {
        console.log('Mock BLE notifications subscribed');
        if (callback) {
          callback();
        }
        
        // Simulate periodic notifications
        setInterval(() => {
          const mockData = Buffer.from([Math.floor(Math.random() * 100)]);
          characteristic.emit('data', mockData);
        }, 2000);
      }, 200);
    };

    characteristic.unsubscribe = (callback?: (error?: Error) => void): void => {
      setTimeout(() => {
        console.log('Mock BLE notifications unsubscribed');
        if (callback) {
          callback();
        }
      }, 100);
    };

    return characteristic;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.close();
    super.destroy();
  }
}

/**
 * BLE Driver Events
 */
export interface BluetoothLEDriverEvents {
  'deviceDiscovered': (device: BluetoothDeviceInfo) => void;
  'servicesDiscovered': (services: BluetoothServiceInfo[]) => void;
  'characteristicChanged': (characteristic: BluetoothCharacteristicInfo, data: Buffer) => void;
}
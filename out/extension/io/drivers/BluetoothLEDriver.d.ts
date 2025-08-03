/**
 * Bluetooth Low Energy (BLE) Driver
 * Based on Serial Studio's IO::Drivers::BluetoothLE design
 * Provides BLE device discovery, connection, and data communication
 */
/// <reference types="node" />
/// <reference types="node" />
import { HALDriver, ConfigValidationResult } from '../HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';
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
    scanTimeout?: number;
    connectionTimeout?: number;
    reconnectInterval?: number;
    autoDiscoverServices?: boolean;
    filterServices?: string[];
    enableNotifications?: boolean;
    enableIndications?: boolean;
    powerMode?: 'low' | 'balanced' | 'high';
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
export declare class BluetoothLEDriver extends HALDriver {
    private discoveredDevices;
    private connectedDevice?;
    private currentPeripheral?;
    private currentCharacteristic?;
    private services;
    private isScanning;
    private isConnecting;
    private reconnectTimer?;
    private static readonly DEFAULT_SCAN_TIMEOUT;
    private static readonly DEFAULT_CONNECTION_TIMEOUT;
    private static readonly DEFAULT_RECONNECT_INTERVAL;
    constructor(config: BluetoothLEConfig);
    get busType(): BusType;
    get displayName(): string;
    /**
     * Check if the operating system supports Bluetooth LE
     */
    static isOperatingSystemSupported(): boolean;
    /**
     * Start device discovery
     */
    startDiscovery(): Promise<BluetoothDeviceInfo[]>;
    /**
     * Mock device discovery for demonstration
     */
    private mockDeviceDiscovery;
    /**
     * Open connection to BLE device
     */
    open(): Promise<void>;
    /**
     * Connect to a specific BLE device
     */
    private connectToDevice;
    /**
     * Discover services on connected device
     */
    private discoverServices;
    /**
     * Set up communication characteristic
     */
    private setupCharacteristic;
    /**
     * Enable notifications on current characteristic
     */
    private enableNotifications;
    /**
     * Close BLE connection
     */
    close(): Promise<void>;
    /**
     * Check if BLE connection is open
     */
    isOpen(): boolean;
    /**
     * Check if BLE connection is readable
     */
    isReadable(): boolean;
    /**
     * Check if BLE connection is writable
     */
    isWritable(): boolean;
    /**
     * Validate BLE configuration
     */
    validateConfiguration(): ConfigValidationResult;
    /**
     * Write data to BLE characteristic
     */
    write(data: Buffer): Promise<number>;
    /**
     * Read data from BLE characteristic
     */
    readCharacteristic(): Promise<Buffer>;
    /**
     * Get list of discovered devices
     */
    getDiscoveredDevices(): BluetoothDeviceInfo[];
    /**
     * Get list of discovered services
     */
    getDiscoveredServices(): BluetoothServiceInfo[];
    /**
     * Get BLE-specific status information
     */
    getBluetoothStatus(): {
        connected: boolean;
        device?: BluetoothDeviceInfo;
        services: number;
        characteristic?: string;
        rssi?: number;
    };
    /**
     * Schedule automatic reconnection if enabled
     */
    private scheduleReconnect;
    /**
     * Validate UUID format
     */
    private isValidUUID;
    /**
     * Create mock peripheral for demonstration
     */
    private createMockPeripheral;
    /**
     * Create mock characteristic for demonstration
     */
    private createMockCharacteristic;
    /**
     * Clean up resources
     */
    destroy(): void;
}
/**
 * BLE Driver Events
 */
export interface BluetoothLEDriverEvents {
    'deviceDiscovered': (device: BluetoothDeviceInfo) => void;
    'servicesDiscovered': (services: BluetoothServiceInfo[]) => void;
    'characteristicChanged': (characteristic: BluetoothCharacteristicInfo, data: Buffer) => void;
}
//# sourceMappingURL=BluetoothLEDriver.d.ts.map
/**
 * Driver Factory - Centralized driver creation and management
 * Based on Serial Studio's modular driver architecture
 */
import { HALDriver } from './HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';
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
export declare class DriverFactory {
    private static instance;
    private drivers;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): DriverFactory;
    /**
     * Initialize driver registry with all available drivers
     */
    private initializeDriverRegistry;
    /**
     * Create a driver instance based on configuration
     */
    createDriver(config: ConnectionConfig): HALDriver;
    /**
     * Get all available driver capabilities
     */
    getAvailableDrivers(): DriverCapabilities[];
    /**
     * Get supported bus types
     */
    getSupportedBusTypes(): BusType[];
    /**
     * Get default configuration for a bus type
     */
    getDefaultConfig(busType: BusType): Partial<ConnectionConfig>;
    /**
     * Validate configuration for a specific bus type
     */
    validateConfig(config: ConnectionConfig): string[];
    /**
     * Check if a bus type is supported
     */
    isSupported(busType: BusType): boolean;
    /**
     * Get driver features for a bus type
     */
    private getDriverFeatures;
    /**
     * Validate UART configuration
     */
    private validateUARTConfig;
    /**
     * Validate Network configuration
     */
    private validateNetworkConfig;
    /**
     * Validate Bluetooth LE configuration
     */
    private validateBluetoothLEConfig;
    /**
     * Validate UUID format
     */
    private isValidUUID;
    /**
     * Get device discovery functions for each bus type
     */
    discoverDevices(busType: BusType): Promise<any[]>;
    /**
     * Create driver with merged default configuration
     */
    createDriverWithDefaults(config: Partial<ConnectionConfig> & {
        type: BusType;
    }): HALDriver;
    /**
     * Get driver information
     */
    getDriverInfo(busType: BusType): DriverCapabilities | null;
}
//# sourceMappingURL=DriverFactory.d.ts.map
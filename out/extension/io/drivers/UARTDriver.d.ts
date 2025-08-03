/**
 * UART (Serial Port) Driver Implementation
 * Based on Serial Studio's IO::Drivers::UART implementation
 */
/// <reference types="node" />
/// <reference types="node" />
import { SerialPort } from 'serialport';
import { HALDriver, ConfigValidationResult } from '../HALDriver';
import { ConnectionConfig, BusType } from '@shared/types';
/**
 * Available parity options
 */
export type ParityType = 'none' | 'odd' | 'even' | 'mark' | 'space';
/**
 * Available flow control options
 */
export type FlowControlType = 'none' | 'xon' | 'rts' | 'xonrts';
/**
 * UART-specific configuration interface
 */
export interface UARTConfig extends ConnectionConfig {
    port: string;
    baudRate: number;
    dataBits: 5 | 6 | 7 | 8;
    stopBits: 1 | 1.5 | 2;
    parity: ParityType;
    flowControl: FlowControlType;
    dtrEnabled?: boolean;
    rtsEnabled?: boolean;
}
/**
 * Serial port information
 */
export interface SerialPortInfo {
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    pnpId?: string;
    locationId?: string;
    productId?: string;
    vendorId?: string;
}
/**
 * UART Driver for serial port communication
 *
 * Implements the HAL driver interface for serial port devices,
 * providing configuration, connection management, and data transfer
 * capabilities with comprehensive error handling and auto-reconnection.
 */
export declare class UARTDriver extends HALDriver {
    private serialPort;
    private reconnectTimer;
    private isReconnecting;
    constructor(config: UARTConfig);
    /**
     * Get the bus type for this driver
     */
    get busType(): BusType;
    /**
     * Get display name for this driver instance
     */
    get displayName(): string;
    /**
     * Get the underlying SerialPort instance
     */
    get port(): SerialPort | null;
    /**
     * Get current UART-specific configuration
     */
    get uartConfig(): UARTConfig;
    /**
     * Validate configuration and set defaults
     */
    private validateAndSetDefaults;
    /**
     * List available serial ports
     */
    static listPorts(): Promise<SerialPortInfo[]>;
    /**
     * Open the serial port connection
     */
    open(): Promise<void>;
    /**
     * Close the serial port connection
     */
    close(): Promise<void>;
    /**
     * Check if the serial port is open
     */
    isOpen(): boolean;
    /**
     * Check if the port is readable
     */
    isReadable(): boolean;
    /**
     * Check if the port is writable
     */
    isWritable(): boolean;
    /**
     * Validate the current configuration
     */
    validateConfiguration(): ConfigValidationResult;
    /**
     * Write data to the serial port
     */
    write(data: Buffer): Promise<number>;
    /**
     * Set DTR (Data Terminal Ready) signal
     */
    setDTR(enabled: boolean): Promise<void>;
    /**
     * Set RTS (Request To Send) signal
     */
    setRTS(enabled: boolean): Promise<void>;
    /**
     * Flush the serial port buffers
     */
    flush(): Promise<void>;
    /**
     * Set up event handlers for the serial port
     */
    private setupEventHandlers;
    /**
     * Start automatic reconnection timer
     */
    private startReconnectTimer;
    /**
     * Stop automatic reconnection timer
     */
    private stopReconnectTimer;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=UARTDriver.d.ts.map
"use strict";
/**
 * UART (Serial Port) Driver Implementation
 * Based on Serial Studio's IO::Drivers::UART implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UARTDriver = void 0;
const serialport_1 = require("serialport");
const HALDriver_1 = require("../HALDriver");
const types_1 = require("@shared/types");
/**
 * UART Driver for serial port communication
 *
 * Implements the HAL driver interface for serial port devices,
 * providing configuration, connection management, and data transfer
 * capabilities with comprehensive error handling and auto-reconnection.
 */
class UARTDriver extends HALDriver_1.HALDriver {
    serialPort = null;
    reconnectTimer = null;
    isReconnecting = false;
    constructor(config) {
        super(config);
        this.validateAndSetDefaults();
    }
    /**
     * Get the bus type for this driver
     */
    get busType() {
        return types_1.BusType.UART;
    }
    /**
     * Get display name for this driver instance
     */
    get displayName() {
        const uartConfig = this.config;
        return `Serial Port ${uartConfig.port} (${uartConfig.baudRate} baud)`;
    }
    /**
     * Get the underlying SerialPort instance
     */
    get port() {
        return this.serialPort;
    }
    /**
     * Get current UART-specific configuration
     */
    get uartConfig() {
        return this.config;
    }
    /**
     * Validate configuration and set defaults
     */
    validateAndSetDefaults() {
        const config = this.config;
        // Set defaults if not provided
        config.baudRate = config.baudRate || 9600;
        config.dataBits = config.dataBits || 8;
        config.stopBits = config.stopBits || 1;
        config.parity = config.parity || 'none';
        config.flowControl = config.flowControl || 'none';
        config.autoReconnect = config.autoReconnect ?? true;
        config.timeout = config.timeout || 1000;
    }
    /**
     * List available serial ports
     */
    static async listPorts() {
        try {
            const ports = await serialport_1.SerialPort.list();
            return ports.map(port => ({
                path: port.path,
                manufacturer: port.manufacturer,
                serialNumber: port.serialNumber,
                pnpId: port.pnpId,
                locationId: port.locationId,
                productId: port.productId,
                vendorId: port.vendorId
            }));
        }
        catch (error) {
            throw new Error(`Failed to list serial ports: ${error}`);
        }
    }
    /**
     * Open the serial port connection
     */
    async open() {
        const config = this.uartConfig;
        if (this.serialPort && this.serialPort.isOpen) {
            throw new Error('Serial port is already open');
        }
        const validation = this.validateConfiguration();
        if (!validation.valid) {
            throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
        }
        try {
            // Create and open serial port
            this.serialPort = new serialport_1.SerialPort({
                path: config.port,
                baudRate: config.baudRate,
                dataBits: config.dataBits,
                stopBits: config.stopBits,
                parity: config.parity,
                autoOpen: false
            });
            // Set up event handlers
            this.setupEventHandlers();
            // Open the port
            await new Promise((resolve, reject) => {
                this.serialPort.open((error) => {
                    if (error) {
                        reject(new Error(`Failed to open serial port: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
            // Configure DTR/RTS if specified
            if (config.dtrEnabled !== undefined) {
                await this.setDTR(config.dtrEnabled);
            }
            if (config.rtsEnabled !== undefined) {
                await this.setRTS(config.rtsEnabled);
            }
            this.emit('connected');
            this.resetStats();
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Close the serial port connection
     */
    async close() {
        // Stop reconnection attempts
        this.stopReconnectTimer();
        if (this.serialPort && this.serialPort.isOpen) {
            try {
                await new Promise((resolve, reject) => {
                    this.serialPort.close((error) => {
                        if (error) {
                            reject(new Error(`Failed to close serial port: ${error.message}`));
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            catch (error) {
                this.handleError(error);
                throw error;
            }
        }
        this.serialPort = null;
        this.emit('disconnected');
    }
    /**
     * Check if the serial port is open
     */
    isOpen() {
        return this.serialPort ? this.serialPort.isOpen : false;
    }
    /**
     * Check if the port is readable
     */
    isReadable() {
        return this.isOpen() && this.serialPort.readable;
    }
    /**
     * Check if the port is writable
     */
    isWritable() {
        return this.isOpen() && this.serialPort.writable;
    }
    /**
     * Validate the current configuration
     */
    validateConfiguration() {
        const config = this.uartConfig;
        const errors = [];
        // Validate port
        if (!config.port || config.port.trim() === '') {
            errors.push('Port is required');
        }
        // Validate baud rate
        const validBaudRates = [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 230400, 256000, 460800, 921600];
        if (!validBaudRates.includes(config.baudRate)) {
            errors.push(`Invalid baud rate: ${config.baudRate}`);
        }
        // Validate data bits
        if (![5, 6, 7, 8].includes(config.dataBits)) {
            errors.push(`Invalid data bits: ${config.dataBits}`);
        }
        // Validate stop bits
        if (![1, 1.5, 2].includes(config.stopBits)) {
            errors.push(`Invalid stop bits: ${config.stopBits}`);
        }
        // Validate parity
        const validParity = ['none', 'odd', 'even', 'mark', 'space'];
        if (!validParity.includes(config.parity)) {
            errors.push(`Invalid parity: ${config.parity}`);
        }
        // Validate flow control
        const validFlowControl = ['none', 'xon', 'rts', 'xonrts'];
        if (!validFlowControl.includes(config.flowControl)) {
            errors.push(`Invalid flow control: ${config.flowControl}`);
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Write data to the serial port
     */
    async write(data) {
        if (!this.isWritable()) {
            throw new Error('Serial port is not writable');
        }
        try {
            const bytesWritten = await new Promise((resolve, reject) => {
                this.serialPort.write(data, (error) => {
                    if (error) {
                        reject(new Error(`Failed to write to serial port: ${error.message}`));
                    }
                    else {
                        resolve(data.length); // SerialPort doesn't return bytesWritten in callback
                    }
                });
            });
            this.updateSentStats(bytesWritten);
            return bytesWritten;
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Set DTR (Data Terminal Ready) signal
     */
    async setDTR(enabled) {
        if (!this.serialPort || !this.serialPort.isOpen) {
            throw new Error('Serial port is not open');
        }
        try {
            await new Promise((resolve, reject) => {
                this.serialPort.set({ dtr: enabled }, (error) => {
                    if (error) {
                        reject(new Error(`Failed to set DTR: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Set RTS (Request To Send) signal
     */
    async setRTS(enabled) {
        if (!this.serialPort || !this.serialPort.isOpen) {
            throw new Error('Serial port is not open');
        }
        try {
            await new Promise((resolve, reject) => {
                this.serialPort.set({ rts: enabled }, (error) => {
                    if (error) {
                        reject(new Error(`Failed to set RTS: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Flush the serial port buffers
     */
    async flush() {
        if (!this.serialPort || !this.serialPort.isOpen) {
            throw new Error('Serial port is not open');
        }
        try {
            await new Promise((resolve, reject) => {
                this.serialPort.flush((error) => {
                    if (error) {
                        reject(new Error(`Failed to flush serial port: ${error.message}`));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Set up event handlers for the serial port
     */
    setupEventHandlers() {
        if (!this.serialPort) {
            return;
        }
        // Handle incoming data
        this.serialPort.on('data', (data) => {
            this.processData(data);
        });
        // Handle errors
        this.serialPort.on('error', (error) => {
            this.handleError(error);
            // Attempt reconnection if enabled
            if (this.uartConfig.autoReconnect && !this.isReconnecting) {
                this.startReconnectTimer();
            }
        });
        // Handle close events
        this.serialPort.on('close', () => {
            this.emit('disconnected');
            // Attempt reconnection if enabled and not manually closed
            if (this.uartConfig.autoReconnect && !this.isReconnecting) {
                this.startReconnectTimer();
            }
        });
    }
    /**
     * Start automatic reconnection timer
     */
    startReconnectTimer() {
        if (this.reconnectTimer) {
            return;
        }
        this.isReconnecting = true;
        this.reconnectTimer = setInterval(async () => {
            try {
                // Ensure port is closed before attempting reconnection
                if (this.serialPort && this.serialPort.isOpen) {
                    await this.close();
                }
                await this.open();
                this.stopReconnectTimer();
            }
            catch (error) {
                // Reconnection failed, will try again on next timer
                console.warn(`Reconnection attempt failed: ${error}`);
            }
        }, 5000); // Try every 5 seconds
    }
    /**
     * Stop automatic reconnection timer
     */
    stopReconnectTimer() {
        if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.isReconnecting = false;
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.stopReconnectTimer();
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.close();
        }
        super.destroy();
    }
}
exports.UARTDriver = UARTDriver;
//# sourceMappingURL=UARTDriver.js.map
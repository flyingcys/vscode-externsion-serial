"use strict";
/**
 * Network Driver for TCP/UDP communication
 * Based on Serial Studio's IO::Drivers::Network design
 * Supports both TCP client/server and UDP communication modes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkDriver = exports.NetworkSocketType = void 0;
const net = __importStar(require("net"));
const dgram = __importStar(require("dgram"));
const HALDriver_1 = require("../HALDriver");
const types_1 = require("@shared/types");
/**
 * Network socket types supported by the driver
 */
var NetworkSocketType;
(function (NetworkSocketType) {
    NetworkSocketType["TCP_CLIENT"] = "tcp_client";
    NetworkSocketType["TCP_SERVER"] = "tcp_server";
    NetworkSocketType["UDP"] = "udp";
    NetworkSocketType["UDP_MULTICAST"] = "udp_multicast";
})(NetworkSocketType = exports.NetworkSocketType || (exports.NetworkSocketType = {}));
/**
 * Network Driver Implementation
 *
 * Provides TCP and UDP communication capabilities following Serial Studio's
 * network driver architecture. Supports both client and server modes for TCP,
 * and unicast/multicast for UDP.
 *
 * Features:
 * - TCP client/server connections
 * - UDP unicast/multicast communication
 * - Automatic reconnection
 * - Connection pooling
 * - Error handling and recovery
 */
class NetworkDriver extends HALDriver_1.HALDriver {
    tcpSocket;
    tcpServer;
    udpSocket;
    reconnectTimer;
    connectionPromise;
    isConnecting = false;
    // Default configuration values
    static DEFAULT_TCP_PORT = 23;
    static DEFAULT_UDP_PORT = 53;
    static DEFAULT_HOST = '127.0.0.1';
    static DEFAULT_TIMEOUT = 5000;
    static DEFAULT_RECONNECT_INTERVAL = 3000;
    constructor(config) {
        super(config);
        // Apply network-specific defaults
        const defaultConfig = {
            host: NetworkDriver.DEFAULT_HOST,
            tcpPort: NetworkDriver.DEFAULT_TCP_PORT,
            udpPort: NetworkDriver.DEFAULT_UDP_PORT,
            protocol: 'tcp',
            socketType: NetworkSocketType.TCP_CLIENT,
            connectTimeout: NetworkDriver.DEFAULT_TIMEOUT,
            reconnectInterval: NetworkDriver.DEFAULT_RECONNECT_INTERVAL,
            autoReconnect: true,
            keepAlive: true,
            noDelay: true,
            multicastTTL: 1
        };
        this.config = { ...defaultConfig, ...config };
    }
    get busType() {
        return types_1.BusType.Network;
    }
    get displayName() {
        const config = this.config;
        const protocol = config.protocol.toUpperCase();
        const port = config.protocol === 'tcp' ? config.tcpPort : config.udpPort;
        return `${protocol} ${config.host}:${port}`;
    }
    /**
     * Open network connection based on configuration
     */
    async open() {
        if (this.isOpen()) {
            return;
        }
        if (this.isConnecting) {
            return this.connectionPromise;
        }
        this.isConnecting = true;
        const config = this.config;
        try {
            this.connectionPromise = this.establishConnection(config);
            await this.connectionPromise;
            this.emit('connected');
            console.log(`Network driver connected: ${this.displayName}`);
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
        finally {
            this.isConnecting = false;
            this.connectionPromise = undefined;
        }
    }
    /**
     * Establish connection based on protocol and socket type
     */
    async establishConnection(config) {
        if (config.protocol === 'tcp') {
            if (config.socketType === NetworkSocketType.TCP_SERVER) {
                await this.createTcpServer(config);
            }
            else {
                await this.createTcpClient(config);
            }
        }
        else if (config.protocol === 'udp') {
            await this.createUdpSocket(config);
        }
        else {
            throw new Error(`Unsupported protocol: ${config.protocol}`);
        }
    }
    /**
     * Create TCP client connection
     */
    async createTcpClient(config) {
        return new Promise((resolve, reject) => {
            this.tcpSocket = new net.Socket();
            // Configure socket options
            if (config.keepAlive) {
                this.tcpSocket.setKeepAlive(true);
            }
            if (config.noDelay) {
                this.tcpSocket.setNoDelay(true);
            }
            // Set up event handlers
            this.tcpSocket.on('connect', () => {
                console.log(`TCP client connected to ${config.host}:${config.tcpPort}`);
                resolve();
            });
            this.tcpSocket.on('data', (data) => {
                this.processData(data);
            });
            this.tcpSocket.on('error', (error) => {
                this.handleError(error);
                reject(error);
            });
            this.tcpSocket.on('close', () => {
                console.log('TCP client connection closed');
                this.emit('disconnected');
                this.scheduleReconnect();
            });
            // Connect with timeout
            const timeout = setTimeout(() => {
                this.tcpSocket?.destroy();
                reject(new Error(`Connection timeout after ${config.connectTimeout}ms`));
            }, config.connectTimeout);
            this.tcpSocket.connect(config.tcpPort, config.host, () => {
                clearTimeout(timeout);
            });
        });
    }
    /**
     * Create TCP server
     */
    async createTcpServer(config) {
        return new Promise((resolve, reject) => {
            this.tcpServer = net.createServer();
            this.tcpServer.on('connection', (socket) => {
                console.log(`TCP server received connection from ${socket.remoteAddress}:${socket.remotePort}`);
                this.tcpSocket = socket;
                // Configure connected socket
                if (config.keepAlive) {
                    socket.setKeepAlive(true);
                }
                if (config.noDelay) {
                    socket.setNoDelay(true);
                }
                socket.on('data', (data) => {
                    this.processData(data);
                });
                socket.on('error', (error) => {
                    this.handleError(error);
                });
                socket.on('close', () => {
                    console.log('TCP server client disconnected');
                    this.tcpSocket = undefined;
                });
                this.emit('connected');
            });
            this.tcpServer.on('error', (error) => {
                this.handleError(error);
                reject(error);
            });
            this.tcpServer.listen(config.tcpPort, config.host, () => {
                console.log(`TCP server listening on ${config.host}:${config.tcpPort}`);
                resolve();
            });
        });
    }
    /**
     * Create UDP socket
     */
    async createUdpSocket(config) {
        return new Promise((resolve, reject) => {
            this.udpSocket = dgram.createSocket('udp4');
            this.udpSocket.on('message', (data, rinfo) => {
                console.log(`UDP received ${data.length} bytes from ${rinfo.address}:${rinfo.port}`);
                this.processData(data);
            });
            this.udpSocket.on('error', (error) => {
                this.handleError(error);
                reject(error);
            });
            this.udpSocket.on('listening', () => {
                const address = this.udpSocket.address();
                console.log(`UDP socket listening on ${address.address}:${address.port}`);
                // Join multicast group if specified
                if (config.socketType === NetworkSocketType.UDP_MULTICAST && config.multicastAddress) {
                    try {
                        this.udpSocket.addMembership(config.multicastAddress);
                        if (config.multicastTTL) {
                            this.udpSocket.setMulticastTTL(config.multicastTTL);
                        }
                        console.log(`Joined multicast group: ${config.multicastAddress}`);
                    }
                    catch (error) {
                        this.handleError(error);
                    }
                }
                resolve();
            });
            // Bind to specified port and host
            this.udpSocket.bind(config.udpPort, config.host);
        });
    }
    /**
     * Close network connection
     */
    async close() {
        // Clear reconnection timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        // Close TCP connections
        if (this.tcpSocket) {
            this.tcpSocket.destroy();
            this.tcpSocket = undefined;
        }
        if (this.tcpServer) {
            this.tcpServer.close();
            this.tcpServer = undefined;
        }
        // Close UDP socket
        if (this.udpSocket) {
            this.udpSocket.close();
            this.udpSocket = undefined;
        }
        this.emit('disconnected');
        console.log('Network driver disconnected');
    }
    /**
     * Check if connection is open
     */
    isOpen() {
        const config = this.config;
        if (config.protocol === 'tcp') {
            if (config.socketType === NetworkSocketType.TCP_SERVER) {
                return this.tcpServer?.listening === true;
            }
            else {
                return this.tcpSocket?.readyState === 'open';
            }
        }
        else if (config.protocol === 'udp') {
            return this.udpSocket !== undefined;
        }
        return false;
    }
    /**
     * Check if connection is readable
     */
    isReadable() {
        return this.isOpen();
    }
    /**
     * Check if connection is writable
     */
    isWritable() {
        const config = this.config;
        if (config.protocol === 'tcp') {
            return this.tcpSocket?.writable === true;
        }
        else if (config.protocol === 'udp') {
            return this.udpSocket !== undefined;
        }
        return false;
    }
    /**
     * Validate network configuration
     */
    validateConfiguration() {
        const config = this.config;
        const errors = [];
        // Validate required fields
        if (!config.host || config.host.trim() === '') {
            errors.push('Host address is required');
        }
        if (!config.protocol) {
            errors.push('Protocol (tcp/udp) is required');
        }
        else if (!['tcp', 'udp'].includes(config.protocol)) {
            errors.push('Protocol must be either tcp or udp');
        }
        // Validate ports
        if (config.protocol === 'tcp') {
            if (!config.tcpPort || config.tcpPort < 1 || config.tcpPort > 65535) {
                errors.push('Valid TCP port (1-65535) is required');
            }
        }
        else if (config.protocol === 'udp') {
            if (!config.udpPort || config.udpPort < 1 || config.udpPort > 65535) {
                errors.push('Valid UDP port (1-65535) is required');
            }
        }
        // Validate multicast configuration
        if (config.socketType === NetworkSocketType.UDP_MULTICAST) {
            if (!config.multicastAddress) {
                errors.push('Multicast address is required for multicast mode');
            }
            else {
                // Basic multicast address validation (224.0.0.0 to 239.255.255.255)
                const parts = config.multicastAddress.split('.');
                if (parts.length !== 4 || parseInt(parts[0]) < 224 || parseInt(parts[0]) > 239) {
                    errors.push('Invalid multicast address format');
                }
            }
        }
        // Validate timeouts
        if (config.connectTimeout && config.connectTimeout < 1000) {
            errors.push('Connection timeout must be at least 1000ms');
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
     * Write data to network connection
     */
    async write(data) {
        if (!this.isWritable()) {
            throw new Error('Network connection is not writable');
        }
        const config = this.config;
        try {
            if (config.protocol === 'tcp' && this.tcpSocket) {
                return new Promise((resolve, reject) => {
                    this.tcpSocket.write(data, (error) => {
                        if (error) {
                            this.handleError(error);
                            reject(error);
                        }
                        else {
                            this.updateSentStats(data.length);
                            resolve(data.length);
                        }
                    });
                });
            }
            else if (config.protocol === 'udp' && this.udpSocket) {
                return new Promise((resolve, reject) => {
                    const port = config.udpPort;
                    const host = config.multicastAddress || config.host;
                    this.udpSocket.send(data, port, host, (error) => {
                        if (error) {
                            this.handleError(error);
                            reject(error);
                        }
                        else {
                            this.updateSentStats(data.length);
                            resolve(data.length);
                        }
                    });
                });
            }
            else {
                throw new Error('No valid connection available for writing');
            }
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    /**
     * Schedule automatic reconnection if enabled
     */
    scheduleReconnect() {
        const config = this.config;
        if (config.autoReconnect && !this.reconnectTimer) {
            console.log(`Scheduling reconnection in ${config.reconnectInterval}ms`);
            this.reconnectTimer = setTimeout(async () => {
                this.reconnectTimer = undefined;
                if (!this.isOpen()) {
                    try {
                        console.log('Attempting automatic reconnection...');
                        await this.open();
                    }
                    catch (error) {
                        console.error('Automatic reconnection failed:', error);
                        this.scheduleReconnect(); // Schedule next attempt
                    }
                }
            }, config.reconnectInterval);
        }
    }
    /**
     * Get network-specific status information
     */
    getNetworkStatus() {
        const config = this.config;
        const status = {
            protocol: config.protocol,
            host: config.host,
            port: config.protocol === 'tcp' ? config.tcpPort : config.udpPort,
            socketType: config.socketType || 'unknown',
            connected: this.isOpen(),
            remoteAddress: undefined,
            remotePort: undefined
        };
        // Add remote connection info for TCP
        if (this.tcpSocket && config.protocol === 'tcp') {
            status.remoteAddress = this.tcpSocket.remoteAddress;
            status.remotePort = this.tcpSocket.remotePort;
        }
        return status;
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.close();
        super.destroy();
    }
}
exports.NetworkDriver = NetworkDriver;
//# sourceMappingURL=NetworkDriver.js.map
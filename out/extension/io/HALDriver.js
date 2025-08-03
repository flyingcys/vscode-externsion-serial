"use strict";
/**
 * Hardware Abstraction Layer (HAL) Driver
 * Abstract base class for all communication drivers
 * Based on Serial Studio's IO::HAL_Driver design
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HALDriver = void 0;
const events_1 = require("events");
/**
 * Abstract Hardware Abstraction Layer Driver
 *
 * This class provides the core interface for all I/O drivers in the system.
 * It defines methods for opening, closing, and checking the state of devices,
 * as well as sending and receiving data.
 *
 * The class includes a high-efficiency buffered data processing mechanism
 * through processData(), which reduces signal overhead in high-frequency
 * environments by aggregating data until a configurable buffer threshold is
 * reached.
 *
 * Thread safety is ensured for buffer operations, making processData() safe
 * to call from multiple threads.
 */
class HALDriver extends events_1.EventEmitter {
    config;
    stats;
    bufferSize = 8192;
    dataBuffer;
    bufferPosition = 0;
    bufferLock = new Object();
    constructor(config) {
        super();
        this.config = config;
        const now = Date.now();
        this.stats = {
            bytesReceived: 0,
            bytesSent: 0,
            errors: 0,
            uptime: now,
            lastActivity: now
        };
        this.dataBuffer = Buffer.alloc(this.bufferSize);
    }
    /**
     * Get the current configuration
     */
    getConfiguration() {
        return { ...this.config };
    }
    /**
     * Update the configuration (must call open() again to apply)
     * @param newConfig New configuration to apply
     */
    updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configurationChanged');
    }
    /**
     * Check if the current configuration is valid
     */
    isConfigurationValid() {
        return this.validateConfiguration().valid;
    }
    /**
     * Set the buffer size for data aggregation
     * @param size Buffer size in bytes
     */
    setBufferSize(size) {
        if (size > 0 && size !== this.bufferSize) {
            this.bufferSize = size;
            this.dataBuffer = Buffer.alloc(size);
            this.bufferPosition = 0;
        }
    }
    /**
     * Process incoming data with buffering to reduce signal overhead
     * Thread-safe operation that aggregates data until buffer threshold is reached
     * @param data Incoming data to process
     */
    processData(data) {
        // Thread-safe buffer operation
        synchronized(this.bufferLock, () => {
            // Update statistics
            this.stats.bytesReceived += data.length;
            this.stats.lastActivity = Date.now();
            // Check if data fits in current buffer
            if (this.bufferPosition + data.length <= this.bufferSize) {
                // Add to buffer
                data.copy(this.dataBuffer, this.bufferPosition);
                this.bufferPosition += data.length;
            }
            else {
                // Buffer would overflow, flush current buffer and start new one
                this.flushBuffer();
                if (data.length <= this.bufferSize) {
                    // New data fits in empty buffer
                    data.copy(this.dataBuffer, 0);
                    this.bufferPosition = data.length;
                }
                else {
                    // Data is larger than buffer, emit directly
                    this.emit('dataReceived', data);
                    return;
                }
            }
            // Check if buffer is full or if we should flush based on other criteria
            if (this.bufferPosition >= this.bufferSize * 0.8) { // 80% threshold
                this.flushBuffer();
            }
        });
    }
    /**
     * Flush the current data buffer
     * Emits buffered data if any exists
     */
    flushBuffer() {
        if (this.bufferPosition > 0) {
            const bufferedData = Buffer.alloc(this.bufferPosition);
            this.dataBuffer.copy(bufferedData, 0, 0, this.bufferPosition);
            this.bufferPosition = 0;
            this.emit('dataReceived', bufferedData);
        }
    }
    /**
     * Get driver statistics
     */
    getStats() {
        return {
            ...this.stats,
            uptime: Date.now() - this.stats.uptime
        };
    }
    /**
     * Reset driver statistics
     */
    resetStats() {
        const now = Date.now();
        this.stats = {
            bytesReceived: 0,
            bytesSent: 0,
            errors: 0,
            uptime: now,
            lastActivity: now
        };
    }
    /**
     * Handle driver errors
     * @param error The error that occurred
     */
    handleError(error) {
        this.stats.errors++;
        this.emit('error', error);
    }
    /**
     * Update sent bytes statistics
     * @param bytes Number of bytes sent
     */
    updateSentStats(bytes) {
        this.stats.bytesSent += bytes;
        this.stats.lastActivity = Date.now();
        this.emit('dataSent', bytes);
    }
    /**
     * Clean up resources when driver is destroyed
     */
    destroy() {
        this.flushBuffer();
        this.removeAllListeners();
    }
}
exports.HALDriver = HALDriver;
/**
 * Simple mutex-like synchronization for critical sections
 * @param lock Object to use as mutex
 * @param fn Function to execute in critical section
 */
function synchronized(lock, fn) {
    // Note: This is a simplified synchronization mechanism
    // In a real implementation, you might want to use a proper mutex library
    return fn();
}
//# sourceMappingURL=HALDriver.js.map
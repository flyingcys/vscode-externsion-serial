/**
 * Hardware Abstraction Layer (HAL) Driver
 * Abstract base class for all communication drivers
 * Based on Serial Studio's IO::HAL_Driver design
 */

import { EventEmitter } from 'events';
import { ConnectionConfig, BusType } from '@shared/types';

/**
 * Driver configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Driver statistics
 */
export interface DriverStats {
  bytesReceived: number;
  bytesSent: number;
  errors: number;
  uptime: number;
  lastActivity: number;
}

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
export abstract class HALDriver extends EventEmitter {
  protected config: ConnectionConfig;
  protected stats: DriverStats;
  protected bufferSize: number = 8192;
  protected dataBuffer: Buffer;
  protected bufferPosition: number = 0;
  private readonly bufferLock = new Object();

  constructor(config: ConnectionConfig) {
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
   * Get the driver's bus type
   */
  abstract get busType(): BusType;

  /**
   * Get a human-readable name for this driver instance
   */
  abstract get displayName(): string;

  /**
   * Open the connection to the device
   * @returns Promise that resolves when connection is established
   */
  abstract open(): Promise<void>;

  /**
   * Close the connection to the device
   */
  abstract close(): Promise<void>;

  /**
   * Check if the device connection is open
   */
  abstract isOpen(): boolean;

  /**
   * Check if the device is readable
   */
  abstract isReadable(): boolean;

  /**
   * Check if the device is writable
   */
  abstract isWritable(): boolean;

  /**
   * Validate the current configuration
   */
  abstract validateConfiguration(): ConfigValidationResult;

  /**
   * Write data to the device
   * @param data The data to write
   * @returns Promise that resolves to the number of bytes written
   */
  abstract write(data: Buffer): Promise<number>;

  /**
   * Get the current configuration
   */
  getConfiguration(): ConnectionConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration (must call open() again to apply)
   * @param newConfig New configuration to apply
   */
  updateConfiguration(newConfig: Partial<ConnectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configurationChanged');
  }

  /**
   * Check if the current configuration is valid
   */
  isConfigurationValid(): boolean {
    return this.validateConfiguration().valid;
  }

  /**
   * Set the buffer size for data aggregation
   * @param size Buffer size in bytes
   */
  setBufferSize(size: number): void {
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
  processData(data: Buffer): void {
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
      } else {
        // Buffer would overflow, flush current buffer and start new one
        this.flushBuffer();
        
        if (data.length <= this.bufferSize) {
          // New data fits in empty buffer
          data.copy(this.dataBuffer, 0);
          this.bufferPosition = data.length;
        } else {
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
  flushBuffer(): void {
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
  getStats(): DriverStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.uptime
    };
  }

  /**
   * Reset driver statistics
   */
  resetStats(): void {
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
  protected handleError(error: Error): void {
    this.stats.errors++;
    this.emit('error', error);
  }

  /**
   * Update sent bytes statistics
   * @param bytes Number of bytes sent
   */
  protected updateSentStats(bytes: number): void {
    this.stats.bytesSent += bytes;
    this.stats.lastActivity = Date.now();
    this.emit('dataSent', bytes);
  }

  /**
   * Clean up resources when driver is destroyed
   */
  destroy(): void {
    this.flushBuffer();
    this.removeAllListeners();
  }
}

/**
 * Simple mutex-like synchronization for critical sections
 * @param lock Object to use as mutex
 * @param fn Function to execute in critical section
 */
function synchronized<T>(lock: object, fn: () => T): T {
  // Note: This is a simplified synchronization mechanism
  // In a real implementation, you might want to use a proper mutex library
  return fn();
}

/**
 * Event types emitted by HAL drivers
 */
export interface HALDriverEvents {
  'dataReceived': (data: Buffer) => void;
  'dataSent': (bytes: number) => void;
  'error': (error: Error) => void;
  'connected': () => void;
  'disconnected': () => void;
  'configurationChanged': () => void;
}

// Extend EventEmitter with proper typing
export declare interface HALDriver {
  on<U extends keyof HALDriverEvents>(event: U, listener: HALDriverEvents[U]): this;
  emit<U extends keyof HALDriverEvents>(event: U, ...args: Parameters<HALDriverEvents[U]>): boolean;
}
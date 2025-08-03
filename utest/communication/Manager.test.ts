/**
 * Tests for IO Manager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IOManager, ConnectionState } from '@extension/io/Manager';
import { ConnectionConfig, BusType, FrameDetection, DecoderMethod } from '@shared/types';

// Mock the UARTDriver to avoid actual hardware dependencies
vi.mock('@extension/io/drivers/UARTDriver', () => ({
  UARTDriver: vi.fn().mockImplementation((config) => ({
    busType: BusType.UART,
    displayName: `Mock UART ${config.port}`,
    isOpen: vi.fn().mockReturnValue(false),
    isReadable: vi.fn().mockReturnValue(false),
    isWritable: vi.fn().mockReturnValue(false),
    validateConfiguration: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    open: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(10),
    destroy: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    // Mock EventEmitter methods
    addListener: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    setMaxListeners: vi.fn(),
    getMaxListeners: vi.fn(),
    listeners: vi.fn(),
    rawListeners: vi.fn(),
    listenerCount: vi.fn(),
    prependListener: vi.fn(),
    prependOnceListener: vi.fn(),
    eventNames: vi.fn()
  }))
}));

describe('IOManager', () => {
  let ioManager: IOManager;
  let config: ConnectionConfig;

  beforeEach(() => {
    ioManager = new IOManager();
    config = {
      type: BusType.UART,
      port: '/dev/ttyUSB0',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none'
    };
  });

  afterEach(async () => {
    await ioManager.destroy();
  });

  describe('Initialization', () => {
    it('should start in disconnected state', () => {
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
      expect(ioManager.driver).toBeNull();
    });

    it('should have default frame configuration', () => {
      const frameConfig = ioManager.frameConfiguration;
      expect(frameConfig.frameDetection).toBe(FrameDetection.EndDelimiterOnly);
      expect(frameConfig.decoderMethod).toBe(DecoderMethod.PlainText);
      expect(frameConfig.checksumAlgorithm).toBe('none');
    });

    it('should have initialized statistics', () => {
      const stats = ioManager.communicationStats;
      expect(stats.bytesReceived).toBe(0);
      expect(stats.bytesSent).toBe(0);
      expect(stats.framesReceived).toBe(0);
      expect(stats.framesSent).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.reconnections).toBe(0);
    });
  });

  describe('Connection Management', () => {
    it('should connect to UART device', async () => {
      const stateChangedSpy = vi.fn();
      ioManager.on('stateChanged', stateChangedSpy);

      await ioManager.connect(config);

      expect(ioManager.state).toBe(ConnectionState.Connected);
      expect(ioManager.isConnected).toBe(true);
      expect(ioManager.driver).not.toBeNull();
      expect(stateChangedSpy).toHaveBeenCalledWith(ConnectionState.Connecting);
      expect(stateChangedSpy).toHaveBeenCalledWith(ConnectionState.Connected);
    });

    it('should disconnect from device', async () => {
      await ioManager.connect(config);
      
      const stateChangedSpy = vi.fn();
      ioManager.on('stateChanged', stateChangedSpy);

      await ioManager.disconnect();

      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(ioManager.isConnected).toBe(false);
      expect(ioManager.driver).toBeNull();
      expect(stateChangedSpy).toHaveBeenCalledWith(ConnectionState.Disconnected);
    });

    it('should handle connection errors', async () => {
      // Mock the driver factory to return a failing driver
      const originalCreateDriver = (ioManager as any).driverFactory.createDriver;
      const mockDriver = {
        open: vi.fn().mockRejectedValue(new Error('Connection failed')),
        close: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn(),
        on: vi.fn(),
        isOpen: vi.fn().mockReturnValue(false),
        isReadable: vi.fn().mockReturnValue(false),
        isWritable: vi.fn().mockReturnValue(false)
      };
      
      (ioManager as any).driverFactory.createDriver = vi.fn().mockReturnValue(mockDriver);

      const errorSpy = vi.fn();
      ioManager.on('error', errorSpy);

      await expect(ioManager.connect(config)).rejects.toThrow('Connection failed');
      expect(ioManager.state).toBe(ConnectionState.Error);
      expect(errorSpy).toHaveBeenCalled();

      // Restore original method
      (ioManager as any).driverFactory.createDriver = originalCreateDriver;
    });

    it('should disconnect existing connection before new connection', async () => {
      await ioManager.connect(config);
      const firstDriver = ioManager.driver;

      // Connect to a different device
      const newConfig = { ...config, port: '/dev/ttyUSB1' };
      await ioManager.connect(newConfig);

      expect(ioManager.driver).not.toBe(firstDriver);
      expect(ioManager.isConnected).toBe(true);
    });
  });

  describe('Data Operations', () => {
    beforeEach(async () => {
      await ioManager.connect(config);
    });

    it('should write data to device', async () => {
      const testData = Buffer.from('test data');
      const mockDriver = ioManager.driver as any;
      
      // Mock the driver methods
      mockDriver.isWritable = vi.fn().mockReturnValue(true);
      mockDriver.write = vi.fn().mockResolvedValue(testData.length);

      const bytesWritten = await ioManager.writeData(testData);

      expect(bytesWritten).toBe(testData.length);
      expect(mockDriver.write).toHaveBeenCalledWith(testData);
    });

    it('should throw error when writing to disconnected device', async () => {
      await ioManager.disconnect();
      
      const testData = Buffer.from('test data');
      await expect(ioManager.writeData(testData)).rejects.toThrow('No device connected');
    });

    it('should throw error when writing to non-writable device', async () => {
      const mockDriver = ioManager.driver as any;
      mockDriver.isWritable = vi.fn().mockReturnValue(false);

      const testData = Buffer.from('test data');
      await expect(ioManager.writeData(testData)).rejects.toThrow('Device is not writable');
    });
  });

  describe('Frame Configuration', () => {
    it('should update frame configuration', () => {
      const newConfig = {
        frameDetection: FrameDetection.StartAndEndDelimiter,
        startSequence: new Uint8Array([0x02]),
        finishSequence: new Uint8Array([0x03])
      };

      ioManager.updateFrameConfig(newConfig);

      const frameConfig = ioManager.frameConfiguration;
      expect(frameConfig.frameDetection).toBe(FrameDetection.StartAndEndDelimiter);
      expect(frameConfig.startSequence).toEqual(new Uint8Array([0x02]));
      expect(frameConfig.finishSequence).toEqual(new Uint8Array([0x03]));
    });

    it('should preserve existing configuration when partially updating', () => {
      const originalConfig = ioManager.frameConfiguration;
      
      ioManager.updateFrameConfig({
        frameDetection: FrameDetection.StartAndEndDelimiter
      });

      const newConfig = ioManager.frameConfiguration;
      expect(newConfig.frameDetection).toBe(FrameDetection.StartAndEndDelimiter);
      expect(newConfig.decoderMethod).toBe(originalConfig.decoderMethod);
      expect(newConfig.checksumAlgorithm).toBe(originalConfig.checksumAlgorithm);
    });
  });

  describe('Pause/Resume Functionality', () => {
    it('should start unpaused', () => {
      expect(ioManager.isPaused).toBe(false);
    });

    it('should pause and resume data processing', () => {
      const warningSpy = vi.fn();
      ioManager.on('warning', warningSpy);

      ioManager.setPaused(true);
      expect(ioManager.isPaused).toBe(true);
      expect(warningSpy).toHaveBeenCalledWith('Data processing paused');

      ioManager.setPaused(false);
      expect(ioManager.isPaused).toBe(false);
      expect(warningSpy).toHaveBeenCalledWith('Data processing resumed');
    });

    it('should not emit warning when setting same pause state', () => {
      const warningSpy = vi.fn();
      ioManager.on('warning', warningSpy);

      ioManager.setPaused(false); // Already false
      expect(warningSpy).not.toHaveBeenCalled();
    });
  });

  describe('Device Discovery', () => {
    it('should get available UART devices', async () => {
      // Mock the driver factory's discoverDevices method
      const mockDevices = [
        { path: '/dev/ttyUSB0', manufacturer: 'Test Manufacturer' },
        { path: '/dev/ttyUSB1', manufacturer: 'Another Manufacturer' }
      ];
      
      const originalDiscoverDevices = (ioManager as any).driverFactory.discoverDevices;
      (ioManager as any).driverFactory.discoverDevices = vi.fn().mockResolvedValue(mockDevices);

      const devices = await ioManager.getAvailableDevices(BusType.UART);
      
      expect(devices).toHaveLength(2);
      expect(devices[0].path).toBe('/dev/ttyUSB0');
      expect((ioManager as any).driverFactory.discoverDevices).toHaveBeenCalledWith(BusType.UART);

      // Restore original method
      (ioManager as any).driverFactory.discoverDevices = originalDiscoverDevices;
    });

    it('should return empty array for network devices', async () => {
      const devices = await ioManager.getAvailableDevices(BusType.Network);
      expect(devices).toEqual([]);
    });

    it('should throw error for unsupported bus types', async () => {
      await expect(ioManager.getAvailableDevices('unsupported' as BusType))
        .rejects.toThrow('Device discovery not supported for bus type');
    });
  });

  describe('State Management', () => {
    it('should track connection state changes', async () => {
      const stateChanges: ConnectionState[] = [];
      ioManager.on('stateChanged', (state) => stateChanges.push(state));

      await ioManager.connect(config);
      await ioManager.disconnect();

      expect(stateChanges).toContain(ConnectionState.Connecting);
      expect(stateChanges).toContain(ConnectionState.Connected);
      expect(stateChanges).toContain(ConnectionState.Disconnected);
    });

    it('should provide read-only and read-write status', async () => {
      expect(ioManager.isReadOnly).toBe(false);
      expect(ioManager.isReadWrite).toBe(false);

      await ioManager.connect(config);
      
      const mockDriver = ioManager.driver as any;
      mockDriver.isReadable = vi.fn().mockReturnValue(true);
      mockDriver.isWritable = vi.fn().mockReturnValue(false);

      expect(ioManager.isReadOnly).toBe(true);
      expect(ioManager.isReadWrite).toBe(false);

      mockDriver.isWritable = vi.fn().mockReturnValue(true);
      expect(ioManager.isReadOnly).toBe(false);
      expect(ioManager.isReadWrite).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should update statistics on data operations', async () => {
      await ioManager.connect(config);
      
      const mockDriver = ioManager.driver as any;
      mockDriver.isWritable = vi.fn().mockReturnValue(true);
      mockDriver.write = vi.fn().mockResolvedValue(10);

      const initialStats = ioManager.communicationStats;
      expect(initialStats.bytesSent).toBe(0);
      expect(initialStats.framesSent).toBe(0);

      await ioManager.writeData(Buffer.from('test data'));

      const updatedStats = ioManager.communicationStats;
      expect(updatedStats.bytesSent).toBe(10);
      expect(updatedStats.framesSent).toBe(1);
    });

    it('should emit statistics updates', (done) => {
      ioManager.on('statisticsUpdated', (stats) => {
        expect(stats).toBeDefined();
        expect(typeof stats.bytesReceived).toBe('number');
        expect(typeof stats.bytesSent).toBe('number');
        done();
      });

      // Statistics should be emitted periodically
      // We'll wait for the first emission
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', async () => {
      await ioManager.connect(config);
      const driver = ioManager.driver as any;
      
      await ioManager.destroy();

      expect(ioManager.driver).toBeNull();
      expect(ioManager.state).toBe(ConnectionState.Disconnected);
      expect(driver.destroy).toHaveBeenCalled();
    });

    it('should remove all listeners on destroy', async () => {
      const testListener = vi.fn();
      ioManager.on('stateChanged', testListener);

      await ioManager.destroy();

      expect(ioManager.listenerCount('stateChanged')).toBe(0);
    });
  });
});
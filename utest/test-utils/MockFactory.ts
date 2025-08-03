/**
 * Mock工厂类 - 提供统一的测试数据和Mock对象创建
 */

import { vi } from 'vitest';

/**
 * HAL驱动Mock工厂
 */
export class HALDriverMockFactory {
  static createMockHALDriver() {
    return {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(10),
      isOpen: vi.fn().mockReturnValue(false),
      isReadable: vi.fn().mockReturnValue(true),
      isWritable: vi.fn().mockReturnValue(true),
      configurationOk: vi.fn().mockReturnValue(true),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllListeners: vi.fn(),
      type: 'mock',
      id: 'mock-driver-001'
    };
  }
}

/**
 * 数据Mock工厂
 */
export class DataMockFactory {
  static createMockDataset(overrides = {}) {
    return {
      id: 'test-dataset',
      title: 'Test Dataset',
      value: 42,
      timestamp: Date.now(),
      units: 'V',
      graph: true,
      fftPlot: false,
      ledPanel: false,
      ...overrides
    };
  }

  static createMockFrame() {
    return {
      timestamp: Date.now(),
      raw: 'test data',
      parsed: {
        temperature: 25.5,
        humidity: 60.0
      },
      groups: []
    };
  }
}

/**
 * 连接Mock工厂
 */
export class ConnectionMockFactory {
  static createMockConnection(type = 'serial') {
    return {
      type,
      id: `mock-${type}-connection`,
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(10),
      on: vi.fn(),
      emit: vi.fn(),
      isConnected: true
    };
  }
}

/**
 * Vue组件Mock工厂
 */
export class VueComponentMockFactory {
  static createMockProps(componentType: string, overrides = {}) {
    const baseProps = {
      widgetType: componentType,
      title: `Mock ${componentType}`,
      isEnabled: true,
      isSelected: false,
      hasData: true
    };
    
    return { ...baseProps, ...overrides };
  }
}

/**
 * 性能测试工具
 */
export class PerformanceTestUtils {
  static measureExecutionTime<T>(fn: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, duration: end - start };
  }

  static createLargeDataset(size: number) {
    return Array.from({ length: size }, (_, i) => ({
      id: `data-${i}`,
      value: Math.random() * 100,
      timestamp: Date.now() + i
    }));
  }
}

/**
 * 测试断言工具
 */
export class TestAssertionUtils {
  static assertRealtimePerformance(updateInterval: number) {
    const maxInterval = 1000 / 20; // 50ms for 20Hz
    if (updateInterval > maxInterval) {
      throw new Error(
        `Realtime performance assertion failed: update interval ${updateInterval}ms exceeds maximum ${maxInterval}ms (20Hz requirement)`
      );
    }
  }
}
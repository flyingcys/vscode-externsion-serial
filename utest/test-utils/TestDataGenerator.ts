/**
 * 测试数据生成器 - 为单元测试提供各种类型的测试数据
 */

/**
 * 串口数据生成器
 */
export class SerialDataGenerator {
  static generateSerialFrame(format: string = 'plaintext'): string {
    switch (format) {
      case 'hex':
        return '48656C6C6F20576F726C64'; // "Hello World" in hex
      case 'base64':
        return 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      case 'binary':
        return '0100100001100101011011000110110001101111';
      default:
        return 'Hello World';
    }
  }

  static generateSensorData() {
    return {
      temperature: 25.5 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      pressure: 1013.25 + Math.random() * 50,
      timestamp: Date.now()
    };
  }
}

/**
 * 网络数据生成器
 */
export class NetworkDataGenerator {
  static generateNetworkPacket() {
    return {
      source: '192.168.1.100',
      destination: '192.168.1.200', 
      port: 8080,
      data: 'test network data',
      timestamp: Date.now()
    };
  }
}

/**
 * 蓝牙数据生成器
 */
export class BluetoothDataGenerator {
  static generateBluetoothData() {
    return {
      deviceId: 'BT-DEVICE-001',
      serviceUUID: '12345678-1234-1234-1234-123456789abc',
      characteristicUUID: 'abcdefgh-1234-1234-1234-123456789abc',
      value: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
      timestamp: Date.now()
    };
  }
}

/**
 * 性能测试数据生成器
 */
export class PerformanceDataGenerator {
  static generateLargeDataset(size: number) {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      timestamp: Date.now() + i
    }));
  }

  static generateRealtimeData(count: number = 1000) {
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      data.push({
        timestamp: now + i * 50, // 20Hz (50ms intervals)
        value: Math.sin(i * 0.1) * 100 + Math.random() * 10
      });
    }
    
    return data;
  }
}

/**
 * 错误场景生成器
 */
export class ErrorScenarioGenerator {
  static generateCorruptedData() {
    return {
      malformed: '{"incomplete": json',
      invalid: 'INVALID_HEX_ZZ',
      empty: '',
      null: null,
      undefined: undefined
    };
  }

  static generateConnectionErrors() {
    return [
      new Error('Connection timeout'),
      new Error('Device not found'),
      new Error('Permission denied'),
      new Error('Invalid configuration')
    ];
  }
}
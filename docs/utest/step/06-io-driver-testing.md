# Phase 2-3: I/O驱动测试建立

**优先级**: 🟡 中优先级  
**预计工期**: 3天  
**负责模块**: 硬件通信驱动系统

## 🎯 目标

为3个I/O驱动建立完整测试体系，将覆盖率从<5%提升至60%+，确保硬件通信的稳定性和可靠性。

## 🔍 当前状态分析

### 低覆盖模块
```
I/O驱动文件 (3个):
- src/extension/io/drivers/UARTDriver.ts (串口驱动) - <5%覆盖
- src/extension/io/drivers/NetworkDriver.ts (网络驱动) - <5%覆盖  
- src/extension/io/drivers/BluetoothLEDriver.ts (蓝牙驱动) - <5%覆盖

支持文件:
- src/extension/io/HALDriver.ts (硬件抽象层)
- src/extension/io/Manager.ts (IO管理器)  
- src/extension/io/DriverFactory.ts (驱动工厂)

当前覆盖率: <5%
目标覆盖率: 60%+
```

### 技术挑战
- 硬件设备Mock复杂度高
- 异步通信时序测试
- 错误恢复机制验证
- 多设备并发连接测试
- 驱动性能基准测试

## 📋 详细任务清单

### Task 6.1: 硬件Mock基础设施 (1天)

**目标**: 建立完整的硬件设备模拟框架

**SerialPort Mock增强**:
```typescript
// utest/mocks/hardware-devices.ts
export class MockSerialPort {
  private isConnected = false;
  private dataBuffer: Buffer[] = [];
  private eventHandlers = new Map<string, Function[]>();
  
  constructor(private path: string, private options: any) {}
  
  open(callback?: (error: Error | null) => void): void {
    setTimeout(() => {
      this.isConnected = true;
      callback?.(null);
      this.emit('open');
    }, 10);
  }
  
  close(callback?: (error: Error | null) => void): void {
    setTimeout(() => {
      this.isConnected = false;
      callback?.(null);
      this.emit('close');
    }, 10);
  }
  
  write(data: Buffer | string, callback?: (error: Error | null) => void): boolean {
    if (!this.isConnected) {
      callback?.(new Error('Port not open'));
      return false;
    }
    
    // 模拟写入延迟
    setTimeout(() => {
      callback?.(null);
      // 模拟设备响应
      this.simulateDeviceResponse(data);
    }, 5);
    
    return true;
  }
  
  on(event: string, callback: Function): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
    return this;
  }
  
  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(...args));
  }
  
  private simulateDeviceResponse(input: Buffer | string): void {
    // 根据输入模拟相应的设备响应
    const response = this.generateMockResponse(input);
    setTimeout(() => {
      this.emit('data', response);
    }, Math.random() * 20 + 5);
  }
  
  private generateMockResponse(input: Buffer | string): Buffer {
    // 简单的回显 + 时间戳
    const timestamp = Date.now();
    const response = `ACK:${input.toString()}:${timestamp}\n`;
    return Buffer.from(response);
  }
  
  // 模拟设备故障
  simulateError(error: string): void {
    setTimeout(() => {
      this.emit('error', new Error(error));
    }, 0);
  }
  
  // 模拟连接断开
  simulateDisconnect(): void {
    this.isConnected = false;
    this.emit('close');
  }
}

// SerialPort模块Mock
vi.mock('serialport', () => ({
  SerialPort: MockSerialPort,
  SerialPortMock: {
    list: vi.fn().mockResolvedValue([
      { path: '/dev/ttyUSB0', manufacturer: 'FTDI', productId: '6001' },
      { path: '/dev/ttyUSB1', manufacturer: 'Arduino', productId: '0043' },
      { path: '/dev/ttyACM0', manufacturer: 'ST-LINK', productId: '374e' }
    ])
  }
}));
```

**网络设备Mock**:
```typescript
// Mock网络连接
export class MockNetworkSocket {
  private connected = false;
  private eventHandlers = new Map<string, Function[]>();
  
  connect(port: number, host: string, callback?: () => void): this {
    setTimeout(() => {
      this.connected = true;
      callback?.();
      this.emit('connect');
    }, 20);
    return this;
  }
  
  write(data: Buffer | string): boolean {
    if (!this.connected) return false;
    
    setTimeout(() => {
      this.emit('data', `ECHO:${data.toString()}`);
    }, 10);
    
    return true;
  }
  
  end(): void {
    this.connected = false;
    this.emit('close');
  }
  
  on(event: string, callback: Function): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
    return this;
  }
  
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}

vi.mock('net', () => ({
  Socket: MockNetworkSocket,
  createConnection: (options: any) => new MockNetworkSocket()
}));
```

### Task 6.2: UART驱动测试实现 (1天)

**目标**: 为串口驱动建立全面测试覆盖

**核心测试实现**:
```typescript
// utest/extension/io/drivers/UARTDriver.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UARTDriver, UARTConfig } from '@extension/io/drivers/UARTDriver';
import { BusType } from '@shared/types';
import { MockSerialPort } from '../../../mocks/hardware-devices';

describe('UARTDriver串口驱动测试', () => {
  let driver: UARTDriver;
  let mockConfig: UARTConfig;
  
  beforeEach(() => {
    mockConfig = {
      device: '/dev/ttyUSB0',
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: false
    };
    
    driver = new UARTDriver();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('设备连接管理', () => {
    it('应该成功连接串口设备', async () => {
      const result = await driver.open(mockConfig);
      
      expect(result.success).toBe(true);
      expect(driver.isConnected()).toBe(true);
      expect(driver.getConnectionInfo().device).toBe('/dev/ttyUSB0');
    });

    it('应该处理连接失败情况', async () => {
      const invalidConfig = { ...mockConfig, device: '/dev/nonexistent' };
      
      // Mock连接失败
      vi.mocked(MockSerialPort.prototype.open).mockImplementation((callback) => {
        callback?.(new Error('ENOENT: no such file or directory'));
      });
      
      const result = await driver.open(invalidConfig);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('ENOENT');
      expect(driver.isConnected()).toBe(false);
    });

    it('应该正确关闭连接', async () => {
      await driver.open(mockConfig);
      expect(driver.isConnected()).toBe(true);
      
      const result = await driver.close();
      
      expect(result.success).toBe(true);
      expect(driver.isConnected()).toBe(false);
    });
  });

  describe('数据传输测试', () => {
    beforeEach(async () => {
      await driver.open(mockConfig);
    });

    it('应该成功发送数据', async () => {
      const testData = Buffer.from('AT+VERSION\r\n');
      
      const result = await driver.write(testData);
      
      expect(result.success).toBe(true);
      expect(result.bytesWritten).toBe(testData.length);
    });

    it('应该接收数据并触发事件', (done) => {
      const testResponse = Buffer.from('OK\r\n');
      
      driver.on('data', (data: Buffer) => {
        expect(data.toString()).toContain('ACK:AT+VERSION');
        done();
      });
      
      // 发送数据触发响应
      driver.write(Buffer.from('AT+VERSION\r\n'));
    });

    it('应该处理大数据传输', async () => {
      const largeData = Buffer.alloc(1024 * 10, 'A'); // 10KB数据
      
      const result = await driver.write(largeData);
      
      expect(result.success).toBe(true);
      expect(result.bytesWritten).toBe(largeData.length);
    });
  });

  describe('错误处理和恢复', () => {
    beforeEach(async () => {
      await driver.open(mockConfig);
    });

    it('应该处理设备断开连接', (done) => {
      driver.on('disconnect', () => {
        expect(driver.isConnected()).toBe(false);
        done();
      });
      
      // 模拟设备断开
      const mockPort = driver['serialPort'] as MockSerialPort;
      mockPort.simulateDisconnect();
    });

    it('应该自动重连断开的设备', async () => {
      driver.setAutoReconnect(true);
      
      let reconnectCount = 0;
      driver.on('reconnect', () => {
        reconnectCount++;
      });
      
      // 模拟设备断开
      const mockPort = driver['serialPort'] as MockSerialPort;
      mockPort.simulateDisconnect();
      
      // 等待自动重连
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(reconnectCount).toBeGreaterThan(0);
      expect(driver.isConnected()).toBe(true);
    });

    it('应该处理数据传输错误', async () => {
      // Mock写入错误
      vi.mocked(MockSerialPort.prototype.write).mockImplementation((data, callback) => {
        callback?.(new Error('Write failed'));
        return false;
      });
      
      const result = await driver.write(Buffer.from('test'));
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Write failed');
    });
  });

  describe('配置和状态管理', () => {
    it('应该验证连接配置', () => {
      const validConfig = { ...mockConfig };
      const invalidConfig = { ...mockConfig, baudRate: -1 };
      
      expect(driver.validateConfig(validConfig).isValid).toBe(true);
      expect(driver.validateConfig(invalidConfig).isValid).toBe(false);
      expect(driver.validateConfig(invalidConfig).errors).toContain('Invalid baud rate');
    });

    it('应该提供详细的连接状态', async () => {
      await driver.open(mockConfig);
      
      const status = driver.getStatus();
      
      expect(status.connected).toBe(true);
      expect(status.device).toBe('/dev/ttyUSB0');
      expect(status.baudRate).toBe(115200);
      expect(status.bytesReceived).toBe(0);
      expect(status.bytesSent).toBe(0);
    });

    it('应该支持运行时配置更新', async () => {
      await driver.open(mockConfig);
      
      const newConfig = { ...mockConfig, baudRate: 9600 };
      const result = await driver.updateConfig(newConfig);
      
      expect(result.success).toBe(true);
      expect(driver.getStatus().baudRate).toBe(9600);
    });
  });
});
```

### Task 6.3: 网络和蓝牙驱动测试 (1天)

**目标**: 为网络驱动和蓝牙驱动建立测试覆盖

**网络驱动测试**:
```typescript
// utest/extension/io/drivers/NetworkDriver.test.ts
describe('NetworkDriver网络驱动测试', () => {
  describe('TCP连接管理', () => {
    it('应该建立TCP连接', async () => {
      const config = { host: '192.168.1.100', port: 8080, protocol: 'tcp' };
      
      const result = await driver.open(config);
      
      expect(result.success).toBe(true);
      expect(driver.isConnected()).toBe(true);
    });

    it('应该处理连接超时', async () => {
      const config = { host: '192.168.1.999', port: 8080, protocol: 'tcp', timeout: 100 };
      
      const result = await driver.open(config);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('UDP通信测试', () => {
    it('应该发送UDP数据包', async () => {
      const config = { host: '192.168.1.100', port: 8080, protocol: 'udp' };
      await driver.open(config);
      
      const result = await driver.write(Buffer.from('UDP test data'));
      
      expect(result.success).toBe(true);
    });
  });
});
```

**蓝牙驱动测试**:
```typescript
// utest/extension/io/drivers/BluetoothLEDriver.test.ts
describe('BluetoothLEDriver蓝牙驱动测试', () => {
  describe('设备发现和配对', () => {
    it('应该扫描附近的BLE设备', async () => {
      const devices = await driver.scanDevices();
      
      expect(devices).toBeInstanceOf(Array);
      expect(devices.length).toBeGreaterThan(0);
      expect(devices[0]).toHaveProperty('name');
      expect(devices[0]).toHaveProperty('address');
    });

    it('应该连接到指定BLE设备', async () => {
      const config = { 
        deviceAddress: '00:11:22:33:44:55',
        serviceUUID: '12345678-1234-1234-1234-123456789abc'
      };
      
      const result = await driver.open(config);
      
      expect(result.success).toBe(true);
      expect(driver.isConnected()).toBe(true);
    });
  });

  describe('特征值读写', () => {
    it('应该读取BLE特征值', async () => {
      // 实现特征值读取测试
    });

    it('应该写入BLE特征值', async () => {
      // 实现特征值写入测试
    });
  });
});
```

## 🧪 测试验证计划

### 验证步骤

**Stage 1: 单驱动验证**
```bash
# UART驱动测试
npm test utest/extension/io/drivers/UARTDriver.test.ts

# 网络驱动测试  
npm test utest/extension/io/drivers/NetworkDriver.test.ts

# 蓝牙驱动测试
npm test utest/extension/io/drivers/BluetoothLEDriver.test.ts
```

**Stage 2: 集成测试验证**
```bash
# IO管理器测试
npm test utest/extension/io/Manager.test.ts

# 驱动工厂测试
npm test utest/extension/io/DriverFactory.test.ts
```

**Stage 3: 性能和稳定性验证**
```bash
# 并发连接测试
npm test utest/extension/io/ -t "并发|性能"

# 长时间运行测试
npm test utest/extension/io/ -t "稳定性|长时间"
```

### 成功标准
- [x] 3个驱动文件覆盖率 > 60%
- [x] 连接管理功能100%测试
- [x] 数据传输可靠性验证
- [x] 错误处理和恢复机制完整
- [x] 并发连接支持验证

## 📊 预期收益

### 硬件通信可靠性
- 设备连接稳定性保证
- 数据传输完整性验证
- 错误恢复机制测试

### 兼容性保证
- 多种硬件设备支持
- 不同协议兼容性验证
- 跨平台驱动测试

## ⚠️ 技术风险

1. **硬件依赖**: Mock可能无法完全模拟真实硬件行为
2. **时序问题**: 异步通信时序测试复杂
3. **平台差异**: 不同操作系统的驱动差异

## 🔧 实施策略

### 测试环境分层
1. **Unit层**: 纯Mock测试，快速反馈
2. **Integration层**: 半真实环境测试
3. **E2E层**: 真实硬件环境测试

### 渐进实施
- Day 1: Mock基础设施 + UART驱动测试
- Day 2: 网络驱动测试 + 基础集成测试
- Day 3: 蓝牙驱动测试 + 性能稳定性测试

---
**文件状态**: ✅ 计划制定完成  
**执行状状态**: 📋 等待执行  
**预计完成**: 3天内
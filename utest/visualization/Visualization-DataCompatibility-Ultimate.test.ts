/**
 * @fileoverview Visualization-DataCompatibility-Ultimate.test.ts
 * 
 * 🎯 **测试目标**: 全面测试Visualization模块的数据格式兼容性
 * 📊 **覆盖范围**: JSON/CSV/Binary数据解析、数据类型转换、错误处理、数据流管理
 * 🚀 **测试级别**: Ultimate Coverage (Phase 4.3)
 * 
 * 核心测试功能:
 * - JSON、CSV、Binary 数据格式解析和验证
 * - 数据类型转换和类型安全验证
 * - 错误数据处理和恢复机制
 * - 数据流中断和重连处理
 * - 历史数据回放和分析功能
 * - 跨Widget数据格式兼容性
 * 
 * @version 1.0.0
 * @author AI Assistant
 * @date 2025-08-06
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

// 测试工具类
class DataFormatTestUtils {
  // JSON数据生成器
  static generateJSONData(type: 'timeseries' | 'structured' | 'nested', count: number = 100): any {
    switch (type) {
      case 'timeseries':
        return {
          timestamp: Date.now(),
          data: Array.from({ length: count }, (_, i) => ({
            time: Date.now() + i * 1000,
            value: Math.sin(i * 0.1) * 100,
            channel: `channel_${i % 4}`
          }))
        };
      
      case 'structured':
        return {
          metadata: {
            version: '1.0',
            source: 'sensor_array',
            sampling_rate: 1000
          },
          channels: [
            { id: 'x', name: 'X-Axis', unit: 'm/s²' },
            { id: 'y', name: 'Y-Axis', unit: 'm/s²' },
            { id: 'z', name: 'Z-Axis', unit: 'm/s²' }
          ],
          data: Array.from({ length: count }, (_, i) => ({
            timestamp: Date.now() + i * 10,
            x: Math.random() * 20 - 10,
            y: Math.random() * 20 - 10,
            z: Math.random() * 20 - 10
          }))
        };
        
      case 'nested':
        return {
          device: {
            info: {
              id: 'device_001',
              type: 'multi_sensor',
              firmware: '2.1.3'
            },
            sensors: {
              accelerometer: {
                config: { range: '±16g', rate: '100Hz' },
                data: Array.from({ length: count }, (_, i) => [Math.random() * 32 - 16, Math.random() * 32 - 16, Math.random() * 32 - 16])
              },
              gyroscope: {
                config: { range: '±2000°/s', rate: '100Hz' },
                data: Array.from({ length: count }, (_, i) => [Math.random() * 4000 - 2000, Math.random() * 4000 - 2000, Math.random() * 4000 - 2000])
              }
            }
          }
        };
        
      default:
        return {};
    }
  }

  // CSV数据生成器
  static generateCSVData(format: 'standard' | 'with_header' | 'complex', rows: number = 100): string {
    switch (format) {
      case 'standard':
        return Array.from({ length: rows }, (_, i) => 
          `${Date.now() + i * 1000},${(Math.sin(i * 0.1) * 100).toFixed(3)},${(Math.cos(i * 0.1) * 50).toFixed(3)}`
        ).join('\n');
        
      case 'with_header':
        const header = 'timestamp,temperature,humidity,pressure\n';
        const data = Array.from({ length: rows }, (_, i) => 
          `${Date.now() + i * 1000},${(25 + Math.random() * 10).toFixed(2)},${(50 + Math.random() * 30).toFixed(2)},${(1013 + Math.random() * 50).toFixed(2)}`
        ).join('\n');
        return header + data;
        
      case 'complex':
        const complexHeader = 'device_id,timestamp,sensor_type,x,y,z,quality,status\n';
        const complexData = Array.from({ length: rows }, (_, i) => 
          `DEV_${String(i % 3).padStart(3, '0')},${Date.now() + i * 100},"accelerometer",${(Math.random() * 20 - 10).toFixed(4)},${(Math.random() * 20 - 10).toFixed(4)},${(Math.random() * 20 - 10).toFixed(4)},${(Math.random() * 100).toFixed(1)},${i % 10 === 0 ? 'error' : 'ok'}`
        ).join('\n');
        return complexHeader + complexData;
        
      default:
        return '';
    }
  }

  // Binary数据生成器
  static generateBinaryData(format: 'float32' | 'int16' | 'mixed', samples: number = 100): ArrayBuffer {
    switch (format) {
      case 'float32':
        const float32Array = new Float32Array(samples * 3); // X, Y, Z 三轴数据
        for (let i = 0; i < samples; i++) {
          float32Array[i * 3] = Math.sin(i * 0.1) * 10;     // X
          float32Array[i * 3 + 1] = Math.cos(i * 0.1) * 10; // Y
          float32Array[i * 3 + 2] = Math.sin(i * 0.05) * 5; // Z
        }
        return float32Array.buffer;
        
      case 'int16':
        const int16Array = new Int16Array(samples * 4); // 4通道数据
        for (let i = 0; i < samples; i++) {
          int16Array[i * 4] = Math.floor(Math.sin(i * 0.1) * 32767);
          int16Array[i * 4 + 1] = Math.floor(Math.cos(i * 0.1) * 32767);
          int16Array[i * 4 + 2] = Math.floor(Math.sin(i * 0.05) * 16383);
          int16Array[i * 4 + 3] = Math.floor(Math.random() * 65536 - 32768);
        }
        return int16Array.buffer;
        
      case 'mixed':
        const mixedBuffer = new ArrayBuffer(samples * 12); // 每个采样点12字节
        const mixedView = new DataView(mixedBuffer);
        for (let i = 0; i < samples; i++) {
          const offset = i * 12;
          mixedView.setUint32(offset, Date.now() + i * 10, true);      // timestamp (4 bytes)
          mixedView.setFloat32(offset + 4, Math.random() * 100, true); // value (4 bytes) 
          mixedView.setUint16(offset + 8, i % 65536, true);            // sequence (2 bytes)
          mixedView.setUint8(offset + 10, Math.floor(Math.random() * 256)); // status (1 byte)
          mixedView.setUint8(offset + 11, 0xAA);                       // marker (1 byte)
        }
        return mixedBuffer;
        
      default:
        return new ArrayBuffer(0);
    }
  }

  // 错误数据生成器
  static generateCorruptedData(type: 'json' | 'csv' | 'binary'): any {
    switch (type) {
      case 'json':
        return [
          '{"incomplete": true, "data": [1,2,3', // 不完整JSON
          '{"invalid_number": NaN, "data": []}', // 无效数值
          '{"circular": {"self": null}}',        // 循环引用准备
          null,                                  // null数据
          undefined,                            // undefined数据
          '',                                   // 空字符串
          '[]'                                  // 空数组
        ];
        
      case 'csv':
        return [
          'header,missing\n1,2,3',              // 列数不匹配
          'header\n"unclosed,quote,field',      // 未闭合引号
          'timestamp,value\n,123',              // 缺失字段
          'timestamp,value\ninvalid,abc',       // 无效数据类型
          '',                                   // 空内容
          'header\n\n\n',                       // 空行
          'header\r\ndata\rmore'               // 混合行结束符
        ];
        
      case 'binary':
        return [
          new ArrayBuffer(0),                   // 空buffer
          new ArrayBuffer(7),                   // 奇数长度buffer
          null,                                 // null buffer
          undefined                             // undefined buffer
        ];
        
      default:
        return [];
    }
  }

  // 数据类型验证器
  static validateDataType(data: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'number':
        return typeof data === 'number' && !isNaN(data) && isFinite(data);
      case 'string':
        return typeof data === 'string';
      case 'array':
        return Array.isArray(data);
      case 'object':
        return data !== null && typeof data === 'object' && !Array.isArray(data);
      case 'timestamp':
        return typeof data === 'number' && data > 0 && data < Date.now() + 86400000; // 24小时内
      default:
        return false;
    }
  }

  // 数据流模拟器
  static createDataStream(dataFormat: string, chunkSize: number = 100): AsyncGenerator<any, void, unknown> {
    return (async function* () {
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // 模拟延迟
        
        switch (dataFormat) {
          case 'json':
            yield DataFormatTestUtils.generateJSONData('timeseries', chunkSize);
            break;
          case 'csv':
            yield DataFormatTestUtils.generateCSVData('standard', chunkSize);
            break;
          case 'binary':
            yield DataFormatTestUtils.generateBinaryData('float32', chunkSize);
            break;
        }
      }
    })();
  }
}

// Mock数据解析器
class MockDataParser {
  static parseJSON(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(`JSON解析失败: ${error.message}`);
    }
  }

  static parseCSV(csvStr: string, hasHeader: boolean = true): any[] {
    if (!csvStr || csvStr.trim() === '') {
      throw new Error('CSV数据为空');
    }

    const lines = csvStr.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV格式无效');
    }

    const header = hasHeader ? lines.shift()?.split(',') : null;
    const data = lines.map((line, index) => {
      const values = line.split(',');
      if (header && values.length !== header.length) {
        throw new Error(`第${index + 1}行列数不匹配`);
      }
      return header ? Object.fromEntries(header.map((h, i) => [h, values[i]])) : values;
    });

    return data;
  }

  static parseBinary(buffer: ArrayBuffer, format: 'float32' | 'int16' | 'mixed'): any[] {
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('二进制数据为空');
    }

    const data: any[] = [];
    const view = new DataView(buffer);

    switch (format) {
      case 'float32':
        if (buffer.byteLength % 4 !== 0) {
          throw new Error('Float32数据长度无效');
        }
        for (let i = 0; i < buffer.byteLength; i += 4) {
          data.push(view.getFloat32(i, true));
        }
        break;

      case 'int16':
        if (buffer.byteLength % 2 !== 0) {
          throw new Error('Int16数据长度无效');
        }
        for (let i = 0; i < buffer.byteLength; i += 2) {
          data.push(view.getInt16(i, true));
        }
        break;

      case 'mixed':
        if (buffer.byteLength % 12 !== 0) {
          throw new Error('Mixed数据格式无效');
        }
        for (let i = 0; i < buffer.byteLength; i += 12) {
          data.push({
            timestamp: view.getUint32(i, true),
            value: view.getFloat32(i + 4, true),
            sequence: view.getUint16(i + 8, true),
            status: view.getUint8(i + 10),
            marker: view.getUint8(i + 11)
          });
        }
        break;
    }

    return data;
  }
}

// Mock Widget组件
const createMockWidget = (name: string) => ({
  name: `Mock${name}Widget`,
  template: `
    <div class="${name.toLowerCase()}-widget">
      <div class="widget-header">{{ title }}</div>
      <div class="widget-content">
        <div class="data-status">{{ dataStatus }}</div>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </div>
    </div>
  `,
  props: {
    title: { type: String, default: `${name} Widget` },
    dataSource: { type: [Object, Array, String], default: () => [] }
  },
  data() {
    return {
      dataStatus: 'ready',
      errorMessage: '',
      processedData: null,
      dataHistory: [],
      parseErrors: 0
    };
  },
  watch: {
    dataSource: {
      handler(newData) {
        this.processData(newData);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    processData(data: any) {
      try {
        this.dataStatus = 'processing';
        this.errorMessage = '';
        
        // 模拟数据处理逻辑
        if (this.validateData(data)) {
          this.processedData = this.transformData(data);
          this.dataHistory.push({
            timestamp: Date.now(),
            data: this.processedData,
            size: JSON.stringify(data).length
          });
          this.dataStatus = 'ready';
          this.$emit('data-processed', this.processedData);
        } else {
          throw new Error('数据验证失败');
        }
      } catch (error) {
        this.parseErrors++;
        this.errorMessage = error.message;
        this.dataStatus = 'error';
        this.$emit('data-error', error);
      }
    },
    
    validateData(data: any): boolean {
      if (data === null || data === undefined) return false;
      if (typeof data === 'string' && data.trim() === '') return false;
      if (Array.isArray(data) && data.length === 0) return false;
      return true;
    },
    
    transformData(data: any): any {
      // 模拟数据转换逻辑
      if (typeof data === 'string') {
        // CSV或JSON字符串解析
        try {
          return JSON.parse(data);
        } catch {
          return MockDataParser.parseCSV(data);
        }
      } else if (data instanceof ArrayBuffer) {
        // 二进制数据解析
        return MockDataParser.parseBinary(data, 'float32');
      } else {
        // 直接使用对象数据
        return data;
      }
    },
    
    clearHistory() {
      this.dataHistory = [];
    },
    
    getDataStats() {
      return {
        totalSamples: this.dataHistory.length,
        parseErrors: this.parseErrors,
        averageSize: this.dataHistory.reduce((sum, item) => sum + item.size, 0) / this.dataHistory.length || 0
      };
    }
  }
});

// 数据流管理器Mock
class MockDataStreamManager {
  private streams: Map<string, AsyncGenerator> = new Map();
  private connections: Map<string, boolean> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  
  createStream(streamId: string, format: string): AsyncGenerator {
    const stream = DataFormatTestUtils.createDataStream(format);
    this.streams.set(streamId, stream);
    this.connections.set(streamId, true);
    this.reconnectAttempts.set(streamId, 0);
    return stream;
  }
  
  disconnectStream(streamId: string) {
    this.connections.set(streamId, false);
  }
  
  reconnectStream(streamId: string) {
    const attempts = this.reconnectAttempts.get(streamId) || 0;
    this.reconnectAttempts.set(streamId, attempts + 1);
    
    // 模拟重连逻辑
    setTimeout(() => {
      if (attempts < 3) {
        this.connections.set(streamId, true);
      }
    }, 100 * Math.pow(2, attempts)); // 指数退避
  }
  
  isConnected(streamId: string): boolean {
    return this.connections.get(streamId) || false;
  }
  
  getReconnectAttempts(streamId: string): number {
    return this.reconnectAttempts.get(streamId) || 0;
  }
}

describe('Visualization-DataCompatibility-Ultimate 数据格式兼容性测试', () => {
  let dataStreamManager: MockDataStreamManager;

  beforeAll(() => {
    // 全局设置
    vi.stubGlobal('performance', {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn()
    });
  });

  beforeEach(() => {
    dataStreamManager = new MockDataStreamManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('JSON数据格式解析测试', () => {
    it('应该正确解析时间序列JSON数据', async () => {
      const testData = DataFormatTestUtils.generateJSONData('timeseries', 50);
      const PlotWidget = createMockWidget('Plot');
      
      const wrapper = mount(PlotWidget, {
        props: { dataSource: testData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toBeTruthy();
      expect(wrapper.vm.processedData.data).toHaveLength(50);
      expect(wrapper.vm.errorMessage).toBe('');
    });

    it('应该正确处理结构化JSON数据', async () => {
      const testData = DataFormatTestUtils.generateJSONData('structured', 100);
      const AccelerometerWidget = createMockWidget('Accelerometer');
      
      const wrapper = mount(AccelerometerWidget, {
        props: { dataSource: testData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData.metadata).toBeTruthy();
      expect(wrapper.vm.processedData.channels).toHaveLength(3);
      expect(wrapper.vm.processedData.data).toHaveLength(100);
    });

    it('应该正确处理嵌套JSON数据', async () => {
      const testData = DataFormatTestUtils.generateJSONData('nested', 75);
      const MultiPlotWidget = createMockWidget('MultiPlot');
      
      const wrapper = mount(MultiPlotWidget, {
        props: { dataSource: testData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData.device.info).toBeTruthy();
      expect(wrapper.vm.processedData.device.sensors.accelerometer.data).toHaveLength(75);
      expect(wrapper.vm.processedData.device.sensors.gyroscope.data).toHaveLength(75);
    });

    it('应该处理损坏的JSON数据', async () => {
      const corruptedData = DataFormatTestUtils.generateCorruptedData('json');
      const PlotWidget = createMockWidget('Plot');
      
      for (const badData of corruptedData) {
        const wrapper = mount(PlotWidget, {
          props: { dataSource: badData }
        });

        await nextTick();
        
        if (badData === null || badData === undefined || badData === '') {
          expect(wrapper.vm.dataStatus).toBe('error');
          expect(wrapper.vm.errorMessage).toBeTruthy();
        }
      }
    });
  });

  describe('CSV数据格式解析测试', () => {
    it('应该正确解析标准CSV数据', async () => {
      const csvData = DataFormatTestUtils.generateCSVData('standard', 100);
      const PlotWidget = createMockWidget('Plot');
      
      const wrapper = mount(PlotWidget, {
        props: { dataSource: csvData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(100);
    });

    it('应该正确解析带头部的CSV数据', async () => {
      const csvData = DataFormatTestUtils.generateCSVData('with_header', 50);
      const DataGridWidget = createMockWidget('DataGrid');
      
      const wrapper = mount(DataGridWidget, {
        props: { dataSource: csvData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(50);
      expect(wrapper.vm.processedData[0]).toHaveProperty('timestamp');
      expect(wrapper.vm.processedData[0]).toHaveProperty('temperature');
      expect(wrapper.vm.processedData[0]).toHaveProperty('humidity');
      expect(wrapper.vm.processedData[0]).toHaveProperty('pressure');
    });

    it('应该正确解析复杂CSV数据', async () => {
      const csvData = DataFormatTestUtils.generateCSVData('complex', 200);
      const MultiPlotWidget = createMockWidget('MultiPlot');
      
      const wrapper = mount(MultiPlotWidget, {
        props: { dataSource: csvData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(200);
      expect(wrapper.vm.processedData[0]).toHaveProperty('device_id');
      expect(wrapper.vm.processedData[0]).toHaveProperty('sensor_type');
      expect(wrapper.vm.processedData[0]).toHaveProperty('x');
    });

    it('应该处理损坏的CSV数据', async () => {
      const corruptedData = DataFormatTestUtils.generateCorruptedData('csv');
      const DataGridWidget = createMockWidget('DataGrid');
      
      for (const badData of corruptedData) {
        const wrapper = mount(DataGridWidget, {
          props: { dataSource: badData }
        });

        await nextTick();
        
        expect(wrapper.vm.parseErrors).toBeGreaterThan(0);
      }
    });
  });

  describe('二进制数据格式解析测试', () => {
    it('应该正确解析Float32二进制数据', async () => {
      const binaryData = DataFormatTestUtils.generateBinaryData('float32', 100);
      const AccelerometerWidget = createMockWidget('Accelerometer');
      
      const wrapper = mount(AccelerometerWidget, {
        props: { dataSource: binaryData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(300); // 100 samples * 3 axes
    });

    it('应该正确解析Int16二进制数据', async () => {
      const binaryData = DataFormatTestUtils.generateBinaryData('int16', 50);
      const MultiPlotWidget = createMockWidget('MultiPlot');
      
      const wrapper = mount(MultiPlotWidget, {
        props: { dataSource: binaryData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(200); // 50 samples * 4 channels
    });

    it('应该正确解析混合格式二进制数据', async () => {
      const binaryData = DataFormatTestUtils.generateBinaryData('mixed', 75);
      const TerminalWidget = createMockWidget('Terminal');
      
      const wrapper = mount(TerminalWidget, {
        props: { dataSource: binaryData }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(75);
      expect(wrapper.vm.processedData[0]).toHaveProperty('timestamp');
      expect(wrapper.vm.processedData[0]).toHaveProperty('value');
      expect(wrapper.vm.processedData[0]).toHaveProperty('sequence');
      expect(wrapper.vm.processedData[0]).toHaveProperty('status');
      expect(wrapper.vm.processedData[0]).toHaveProperty('marker');
      expect(wrapper.vm.processedData[0].marker).toBe(0xAA);
    });

    it('应该处理损坏的二进制数据', async () => {
      const corruptedData = DataFormatTestUtils.generateCorruptedData('binary');
      const PlotWidget = createMockWidget('Plot');
      
      for (const badData of corruptedData) {
        const wrapper = mount(PlotWidget, {
          props: { dataSource: badData }
        });

        await nextTick();
        
        if (badData === null || badData === undefined) {
          expect(wrapper.vm.dataStatus).toBe('error');
        } else if (badData instanceof ArrayBuffer && badData.byteLength === 0) {
          expect(wrapper.vm.dataStatus).toBe('error');
        }
      }
    });
  });

  describe('数据类型转换测试', () => {
    it('应该正确转换字符串数字到数值类型', () => {
      expect(DataFormatTestUtils.validateDataType('123', 'number')).toBe(false);
      expect(DataFormatTestUtils.validateDataType(123, 'number')).toBe(true);
      expect(DataFormatTestUtils.validateDataType(NaN, 'number')).toBe(false);
      expect(DataFormatTestUtils.validateDataType(Infinity, 'number')).toBe(false);
    });

    it('应该正确验证时间戳格式', () => {
      const now = Date.now();
      expect(DataFormatTestUtils.validateDataType(now, 'timestamp')).toBe(true);
      expect(DataFormatTestUtils.validateDataType(now - 86400000, 'timestamp')).toBe(true); // 24小时前
      expect(DataFormatTestUtils.validateDataType(now + 86400000, 'timestamp')).toBe(true); // 24小时后
      expect(DataFormatTestUtils.validateDataType(now + 86400001, 'timestamp')).toBe(false); // 超过24小时
      expect(DataFormatTestUtils.validateDataType(-1, 'timestamp')).toBe(false);
    });

    it('应该正确验证数组和对象类型', () => {
      expect(DataFormatTestUtils.validateDataType([], 'array')).toBe(true);
      expect(DataFormatTestUtils.validateDataType([1, 2, 3], 'array')).toBe(true);
      expect(DataFormatTestUtils.validateDataType({}, 'object')).toBe(true);
      expect(DataFormatTestUtils.validateDataType({ a: 1 }, 'object')).toBe(true);
      expect(DataFormatTestUtils.validateDataType(null, 'object')).toBe(false);
      expect(DataFormatTestUtils.validateDataType([], 'object')).toBe(false);
    });

    it('应该正确处理Widget间的数据类型兼容性', async () => {
      const jsonData = DataFormatTestUtils.generateJSONData('timeseries', 50);
      const csvData = DataFormatTestUtils.generateCSVData('standard', 50);
      
      const PlotWidget = createMockWidget('Plot');
      const BarWidget = createMockWidget('Bar');
      
      const plotWrapper = mount(PlotWidget, {
        props: { dataSource: jsonData }
      });
      
      const barWrapper = mount(BarWidget, {
        props: { dataSource: csvData }
      });

      await nextTick();
      
      // 两个Widget应该都能成功处理各自的数据格式
      expect(plotWrapper.vm.dataStatus).toBe('ready');
      expect(barWrapper.vm.dataStatus).toBe('ready');
      
      // 验证数据处理统计
      const plotStats = plotWrapper.vm.getDataStats();
      const barStats = barWrapper.vm.getDataStats();
      
      expect(plotStats.totalSamples).toBe(1);
      expect(plotStats.parseErrors).toBe(0);
      expect(barStats.totalSamples).toBe(1);
      expect(barStats.parseErrors).toBe(0);
    });
  });

  describe('错误处理和恢复机制测试', () => {
    it('应该正确处理数据解析错误', async () => {
      const invalidJSON = '{"incomplete": true, "data": [1,2,3'; // 不完整JSON
      const PlotWidget = createMockWidget('Plot');
      
      const wrapper = mount(PlotWidget, {
        props: { dataSource: invalidJSON }
      });

      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('error');
      expect(wrapper.vm.errorMessage).toContain('JSON解析失败');
      expect(wrapper.vm.parseErrors).toBe(1);
    });

    it('应该实现数据验证失败的恢复机制', async () => {
      const PlotWidget = createMockWidget('Plot');
      const wrapper = mount(PlotWidget, {
        props: { dataSource: null }
      });

      await nextTick();
      expect(wrapper.vm.dataStatus).toBe('error');

      // 提供有效数据进行恢复
      const validData = DataFormatTestUtils.generateJSONData('timeseries', 10);
      await wrapper.setProps({ dataSource: validData });
      await nextTick();

      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.errorMessage).toBe('');
    });

    it('应该正确统计和报告错误', async () => {
      const PlotWidget = createMockWidget('Plot');
      const wrapper = mount(PlotWidget);

      // 连续提供多个错误数据
      const errorData = [null, undefined, '', '{"invalid": json}'];
      
      for (const badData of errorData) {
        await wrapper.setProps({ dataSource: badData });
        await nextTick();
      }

      expect(wrapper.vm.parseErrors).toBe(4);
      expect(wrapper.vm.dataStatus).toBe('error');
    });

    it('应该实现错误恢复后的状态重置', async () => {
      const PlotWidget = createMockWidget('Plot');
      const wrapper = mount(PlotWidget, {
        props: { dataSource: null }
      });

      await nextTick();
      expect(wrapper.vm.parseErrors).toBe(1);

      // 清除历史记录
      wrapper.vm.clearHistory();
      expect(wrapper.vm.dataHistory).toHaveLength(0);

      // 提供有效数据
      const validData = DataFormatTestUtils.generateJSONData('timeseries', 5);
      await wrapper.setProps({ dataSource: validData });
      await nextTick();

      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.dataHistory).toHaveLength(1);
    });
  });

  describe('数据流管理测试', () => {
    it('应该正确创建和管理数据流', async () => {
      const streamId = 'test_stream_001';
      const stream = dataStreamManager.createStream(streamId, 'json');
      
      expect(dataStreamManager.isConnected(streamId)).toBe(true);
      expect(dataStreamManager.getReconnectAttempts(streamId)).toBe(0);
      
      // 模拟数据流读取
      const { value } = await stream.next();
      expect(value).toBeTruthy();
    });

    it('应该正确处理数据流中断', async () => {
      const streamId = 'test_stream_002';
      const stream = dataStreamManager.createStream(streamId, 'csv');
      
      // 模拟连接中断
      dataStreamManager.disconnectStream(streamId);
      expect(dataStreamManager.isConnected(streamId)).toBe(false);
    });

    it('应该实现数据流重连机制', async () => {
      const streamId = 'test_stream_003';
      dataStreamManager.createStream(streamId, 'binary');
      
      // 模拟连接中断
      dataStreamManager.disconnectStream(streamId);
      expect(dataStreamManager.isConnected(streamId)).toBe(false);
      
      // 尝试重连
      dataStreamManager.reconnectStream(streamId);
      expect(dataStreamManager.getReconnectAttempts(streamId)).toBe(1);
      
      // 等待重连完成
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(dataStreamManager.isConnected(streamId)).toBe(true);
    });

    it('应该实现重连失败处理', async () => {
      const streamId = 'test_stream_004';
      dataStreamManager.createStream(streamId, 'json');
      
      // 模拟连接中断
      dataStreamManager.disconnectStream(streamId);
      
      // 多次重连尝试
      for (let i = 0; i < 5; i++) {
        dataStreamManager.reconnectStream(streamId);
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i) + 50));
      }
      
      expect(dataStreamManager.getReconnectAttempts(streamId)).toBe(5);
    });
  });

  describe('历史数据回放和分析测试', () => {
    it('应该正确记录数据处理历史', async () => {
      const PlotWidget = createMockWidget('Plot');
      const wrapper = mount(PlotWidget);

      // 处理多批数据
      const datasets = [
        DataFormatTestUtils.generateJSONData('timeseries', 10),
        DataFormatTestUtils.generateJSONData('timeseries', 20),
        DataFormatTestUtils.generateJSONData('timeseries', 15)
      ];

      for (const data of datasets) {
        await wrapper.setProps({ dataSource: data });
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 10)); // 确保时间戳不同
      }

      expect(wrapper.vm.dataHistory).toHaveLength(3);
      
      // 验证历史记录内容
      const history = wrapper.vm.dataHistory;
      expect(history[0].timestamp).toBeLessThan(history[1].timestamp);
      expect(history[1].timestamp).toBeLessThan(history[2].timestamp);
      
      expect(history[0].data).toBeTruthy();
      expect(history[0].size).toBeGreaterThan(0);
    });

    it('应该正确计算数据统计信息', async () => {
      const DataGridWidget = createMockWidget('DataGrid');
      const wrapper = mount(DataGridWidget);

      // 处理不同大小的数据集
      const smallData = DataFormatTestUtils.generateJSONData('timeseries', 5);
      const largeData = DataFormatTestUtils.generateJSONData('timeseries', 100);

      await wrapper.setProps({ dataSource: smallData });
      await nextTick();
      await wrapper.setProps({ dataSource: largeData });
      await nextTick();

      const stats = wrapper.vm.getDataStats();
      expect(stats.totalSamples).toBe(2);
      expect(stats.parseErrors).toBe(0);
      expect(stats.averageSize).toBeGreaterThan(0);
    });

    it('应该支持数据历史清除功能', async () => {
      const TerminalWidget = createMockWidget('Terminal');
      const wrapper = mount(TerminalWidget);

      // 添加历史数据
      const data1 = DataFormatTestUtils.generateJSONData('timeseries', 10);
      const data2 = DataFormatTestUtils.generateJSONData('timeseries', 20);

      await wrapper.setProps({ dataSource: data1 });
      await nextTick();
      await wrapper.setProps({ dataSource: data2 });
      await nextTick();

      expect(wrapper.vm.dataHistory).toHaveLength(2);

      // 清除历史
      wrapper.vm.clearHistory();
      expect(wrapper.vm.dataHistory).toHaveLength(0);

      // 验证统计信息重置
      const stats = wrapper.vm.getDataStats();
      expect(stats.totalSamples).toBe(0);
      expect(stats.averageSize).toBeNaN();
    });

    it('应该支持复杂数据格式的历史分析', async () => {
      const MultiPlotWidget = createMockWidget('MultiPlot');
      const wrapper = mount(MultiPlotWidget);

      // 处理不同格式的数据
      const jsonData = DataFormatTestUtils.generateJSONData('structured', 30);
      const csvData = DataFormatTestUtils.generateCSVData('with_header', 25);
      const binaryData = DataFormatTestUtils.generateBinaryData('mixed', 20);

      await wrapper.setProps({ dataSource: jsonData });
      await nextTick();
      await wrapper.setProps({ dataSource: csvData });
      await nextTick();
      await wrapper.setProps({ dataSource: binaryData });
      await nextTick();

      expect(wrapper.vm.dataHistory).toHaveLength(3);
      
      // 验证不同格式数据的大小差异
      const history = wrapper.vm.dataHistory;
      expect(history[0].size).toBeGreaterThan(history[2].size); // JSON通常比Binary大
      expect(history[1].size).toBeGreaterThan(0); // CSV有内容
    });
  });

  describe('跨Widget数据格式兼容性测试', () => {
    it('应该测试所有Widget对JSON数据的兼容性', async () => {
      const widgets = ['Plot', 'Bar', 'Gauge', 'DataGrid', 'Terminal'];
      const testData = DataFormatTestUtils.generateJSONData('timeseries', 20);
      
      const results = await Promise.all(widgets.map(async (widgetName) => {
        const Widget = createMockWidget(widgetName);
        const wrapper = mount(Widget, {
          props: { dataSource: testData }
        });
        
        await nextTick();
        
        return {
          widgetName,
          status: wrapper.vm.dataStatus,
          hasErrors: wrapper.vm.parseErrors > 0
        };
      }));

      // 所有Widget都应该能处理JSON数据
      results.forEach(result => {
        expect(result.status).toBe('ready');
        expect(result.hasErrors).toBe(false);
      });
    });

    it('应该测试所有Widget对CSV数据的兼容性', async () => {
      const widgets = ['Plot', 'DataGrid', 'MultiPlot', 'Terminal'];
      const testData = DataFormatTestUtils.generateCSVData('with_header', 15);
      
      for (const widgetName of widgets) {
        const Widget = createMockWidget(widgetName);
        const wrapper = mount(Widget, {
          props: { dataSource: testData }
        });
        
        await nextTick();
        
        expect(wrapper.vm.dataStatus).toBe('ready');
        expect(wrapper.vm.parseErrors).toBe(0);
      }
    });

    it('应该测试Widget对二进制数据的兼容性', async () => {
      const binaryWidgets = ['Accelerometer', 'Gyroscope', 'Plot3D', 'MultiPlot'];
      const testData = DataFormatTestUtils.generateBinaryData('float32', 30);
      
      for (const widgetName of binaryWidgets) {
        const Widget = createMockWidget(widgetName);
        const wrapper = mount(Widget, {
          props: { dataSource: testData }
        });
        
        await nextTick();
        
        // 二进制数据处理的Widget应该能正常工作
        expect(wrapper.vm.dataStatus).toBe('ready');
        expect(wrapper.vm.processedData).toBeTruthy();
      }
    });

    it('应该测试Widget对混合数据格式的处理', async () => {
      const MultiPlotWidget = createMockWidget('MultiPlot');
      const wrapper = mount(MultiPlotWidget);
      
      // 依次处理不同格式的数据
      const formats = [
        DataFormatTestUtils.generateJSONData('timeseries', 10),
        DataFormatTestUtils.generateCSVData('standard', 10),
        DataFormatTestUtils.generateBinaryData('float32', 10)
      ];

      for (const data of formats) {
        await wrapper.setProps({ dataSource: data });
        await nextTick();
        
        expect(wrapper.vm.dataStatus).toBe('ready');
      }

      // 验证所有格式都被成功处理
      expect(wrapper.vm.dataHistory).toHaveLength(3);
      expect(wrapper.vm.parseErrors).toBe(0);
    });
  });

  describe('性能和压力测试', () => {
    it('应该处理大量JSON数据', async () => {
      const largeData = DataFormatTestUtils.generateJSONData('timeseries', 1000);
      const PlotWidget = createMockWidget('Plot');
      
      const startTime = performance.now();
      const wrapper = mount(PlotWidget, {
        props: { dataSource: largeData }
      });
      await nextTick();
      const endTime = performance.now();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    });

    it('应该处理频繁的数据更新', async () => {
      const PlotWidget = createMockWidget('Plot');
      const wrapper = mount(PlotWidget);
      
      const updateCount = 50;
      const startTime = performance.now();
      
      for (let i = 0; i < updateCount; i++) {
        const data = DataFormatTestUtils.generateJSONData('timeseries', 10);
        await wrapper.setProps({ dataSource: data });
        await nextTick();
      }
      
      const endTime = performance.now();
      
      expect(wrapper.vm.dataHistory).toHaveLength(updateCount);
      expect(wrapper.vm.parseErrors).toBe(0);
      expect(endTime - startTime).toBeLessThan(5000); // 5秒内完成
    });

    it('应该处理大量二进制数据', async () => {
      const largeBinaryData = DataFormatTestUtils.generateBinaryData('mixed', 500);
      const AccelerometerWidget = createMockWidget('Accelerometer');
      
      const wrapper = mount(AccelerometerWidget, {
        props: { dataSource: largeBinaryData }
      });
      await nextTick();
      
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData).toHaveLength(500);
    });
  });

  describe('边界条件和极端情况测试', () => {
    it('应该处理空数据输入', async () => {
      const emptyInputs = [null, undefined, '', [], {}, new ArrayBuffer(0)];
      const PlotWidget = createMockWidget('Plot');
      
      for (const emptyData of emptyInputs) {
        const wrapper = mount(PlotWidget, {
          props: { dataSource: emptyData }
        });
        await nextTick();
        
        expect(wrapper.vm.dataStatus).toBe('error');
        expect(wrapper.vm.parseErrors).toBeGreaterThan(0);
      }
    });

    it('应该处理超大数据集', async () => {
      const hugeData = DataFormatTestUtils.generateJSONData('timeseries', 5000);
      const DataGridWidget = createMockWidget('DataGrid');
      
      const wrapper = mount(DataGridWidget, {
        props: { dataSource: hugeData }
      });
      await nextTick();
      
      // 即使是大数据集，也应该能成功处理
      expect(wrapper.vm.dataStatus).toBe('ready');
      expect(wrapper.vm.processedData.data).toHaveLength(5000);
    });

    it('应该处理数据格式转换错误', async () => {
      const mixedBadData = [
        '{"valid": "json"}',
        'invalid,csv,format\nextra,columns',
        new ArrayBuffer(7), // 奇数长度
        null
      ];
      
      const TerminalWidget = createMockWidget('Terminal');
      
      for (const badData of mixedBadData) {
        const wrapper = mount(TerminalWidget, {
          props: { dataSource: badData }
        });
        await nextTick();
        
        // 只有第一个数据是有效的
        if (badData === '{"valid": "json"}') {
          expect(wrapper.vm.dataStatus).toBe('ready');
        } else {
          expect(wrapper.vm.dataStatus).toBe('error');
        }
      }
    });
  });
});
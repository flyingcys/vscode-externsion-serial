/**
 * DataTransformer.test.ts
 * 数据转换器单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DataTransformer } from '../../src/extension/export/DataTransformer';
import { DataTransformation, TransformationType } from '../../src/extension/export/types';

describe('DataTransformer', () => {
  let transformer: DataTransformer;
  let testData: any[][];

  beforeEach(() => {
    transformer = new DataTransformer();
    testData = [
      ['2022-01-01T10:00:00.000Z', 25.123456, 100, 'celsius'],
      ['2022-01-01T10:01:00.000Z', 30.987654, 200, 'fahrenheit'],
      ['2022-01-01T10:02:00.000Z', 18.555555, 150, 'kelvin'],
      ['2022-01-01T10:03:00.000Z', 35.777777, 300, 'celsius']
    ];
  });

  describe('构造函数和初始化测试', () => {
    test('应该能创建空的转换器', () => {
      const emptyTransformer = new DataTransformer();
      expect(emptyTransformer.getTransformationCount()).toBe(0);
    });

    test('应该能创建带初始转换配置的转换器', () => {
      const transformations: DataTransformation[] = [
        { type: 'precision_round', config: { columnIndex: 1, precision: 2 } }
      ];
      const transformerWithConfig = new DataTransformer(transformations);
      expect(transformerWithConfig.getTransformationCount()).toBe(1);
    });

    test('应该正确初始化转换配置数组', () => {
      const transformations: DataTransformation[] = [
        { type: 'precision_round', config: { columnIndex: 1, precision: 2 } },
        { type: 'unit_conversion', config: { columnIndex: 2, conversionFactor: 2.5 } }
      ];
      transformer = new DataTransformer(transformations);
      
      const retrievedTransformations = transformer.getTransformations();
      expect(retrievedTransformations).toHaveLength(2);
      expect(retrievedTransformations[0]).toEqual(transformations[0]);
      expect(retrievedTransformations[1]).toEqual(transformations[1]);
    });
  });

  describe('基本转换操作测试', () => {
    test('应该在没有转换配置时返回原始数据', () => {
      const result = transformer.transform(testData);
      expect(result).toEqual(testData);
      expect(result).toHaveLength(4);
    });

    test('应该正确应用精度舍入转换', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      expect(result[0][1]).toBe(25.12);
      expect(result[1][1]).toBe(30.99);
      expect(result[2][1]).toBe(18.56);
      expect(result[3][1]).toBe(35.78);
    });

    test('应该正确应用单位转换', () => {
      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 2, conversionFactor: 2.0 }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      expect(result[0][2]).toBe(200);
      expect(result[1][2]).toBe(400);
      expect(result[2][2]).toBe(300);
      expect(result[3][2]).toBe(600);
    });

    test('应该正确应用日期格式化转换', () => {
      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY-MM-DD HH:mm:ss' }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      // 由于日期格式化使用本地时区，我们需要检查格式是否正确而不是具体时间
      expect(result[0][0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result[1][0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result[2][0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result[3][0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('应该正确应用自定义函数转换', () => {
      const customFunction = (value: any) => `transformed_${value}`;
      transformer.addTransformation({
        type: 'custom_function',
        config: { columnIndex: 3, customFunction }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      expect(result[0][3]).toBe('transformed_celsius');
      expect(result[1][3]).toBe('transformed_fahrenheit');
      expect(result[2][3]).toBe('transformed_kelvin');
      expect(result[3][3]).toBe('transformed_celsius');
    });
  });

  describe('多重转换测试', () => {
    test('应该按顺序应用多个转换', () => {
      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 1, conversionFactor: 2.0 }
      });
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 1 }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      expect(result[0][1]).toBe(50.2); // 25.123456 * 2 = 50.246912 -> 50.2
      expect(result[1][1]).toBe(62.0); // 30.987654 * 2 = 61.975308 -> 62.0
    });

    test('应该正确处理复杂的多列转换', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });
      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 2, conversionFactor: 0.5 }
      });
      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY-MM-DD' }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      expect(result[0][0]).toBe('2022-01-01');
      expect(result[0][1]).toBe(25.12);
      expect(result[0][2]).toBe(50);
    });
  });

  describe('异步转换测试', () => {
    async function* createAsyncData(): AsyncIterable<any[]> {
      for (const record of testData) {
        yield record;
      }
    }

    test('应该正确处理异步数据转换', async () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      const results: any[][] = [];
      for await (const record of transformer.transformAsync(createAsyncData())) {
        results.push(record);
      }

      expect(results).toHaveLength(4);
      expect(results[0][1]).toBe(25.12);
      expect(results[1][1]).toBe(30.99);
    });

    test('应该在没有转换配置时返回所有异步数据', async () => {
      const results: any[][] = [];
      for await (const record of transformer.transformAsync(createAsyncData())) {
        results.push(record);
      }

      expect(results).toHaveLength(4);
      expect(results).toEqual(testData);
    });

    test('应该正确处理空的异步数据', async () => {
      async function* emptyAsyncData(): AsyncIterable<any[]> {
        return;
        yield; // 永远不会执行
      }

      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      const results: any[][] = [];
      for await (const record of transformer.transformAsync(emptyAsyncData())) {
        results.push(record);
      }

      expect(results).toHaveLength(0);
    });
  });

  describe('单位转换详细测试', () => {
    test('应该处理非数字值的单位转换', () => {
      const invalidData = [
        ['2022-01-01T10:00:00.000Z', 'not-a-number', 100],
        ['2022-01-01T10:01:00.000Z', null, 200],
        ['2022-01-01T10:02:00.000Z', undefined, 300]
      ];

      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 1, conversionFactor: 2.0 }
      });

      const result = transformer.transform(invalidData);
      expect(result).toHaveLength(3);
      expect(result[0][1]).toBe(0); // parseNumber returns 0 for invalid values
      expect(result[1][1]).toBe(0);
      expect(result[2][1]).toBe(0);
    });

    test('应该正确处理Date对象的单位转换', () => {
      const dateData = [
        [new Date('2022-01-01T10:00:00.000Z'), new Date('2022-01-01T10:00:00.000Z'), 100]
      ];

      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 1, conversionFactor: 2.0 }
      });

      const result = transformer.transform(dateData);
      expect(result).toHaveLength(1);
      expect(typeof result[0][1]).toBe('number');
      expect(result[0][1]).toBeGreaterThan(0);
    });

    test('应该处理超出范围的列索引', () => {
      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 10, conversionFactor: 2.0 }
      });

      const originalData = testData.map(record => [...record]); // 深拷贝原始数据
      const result = transformer.transform(testData);
      
      // 检查原始列的数据没有改变
      expect(result).toHaveLength(4);
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < originalData[i].length; j++) {
          expect(result[i][j]).toEqual(originalData[i][j]);
        }
      }
    });
  });

  describe('精度舍入详细测试', () => {
    test('应该处理零精度的舍入', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 0 }
      });

      const result = transformer.transform(testData);
      expect(result[0][1]).toBe(25);
      expect(result[1][1]).toBe(31);
      expect(result[2][1]).toBe(19);
      expect(result[3][1]).toBe(36);
    });

    test('应该处理高精度的舍入', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 4 }
      });

      const result = transformer.transform(testData);
      expect(result[0][1]).toBe(25.1235);
      expect(result[1][1]).toBe(30.9877);
      expect(result[2][1]).toBe(18.5556);
      expect(result[3][1]).toBe(35.7778);
    });

    test('应该处理非数字值的精度舍入', () => {
      const invalidData = [
        ['2022-01-01T10:00:00.000Z', 'not-a-number', 100],
        ['2022-01-01T10:01:00.000Z', null, 200]
      ];

      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      const result = transformer.transform(invalidData);
      expect(result[0][1]).toBe(0);
      expect(result[1][1]).toBe(0);
    });
  });

  describe('日期格式化详细测试', () => {
    test('应该使用默认ISO格式化无格式字符串的日期', () => {
      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: '' }
      });

      const result = transformer.transform(testData);
      expect(result[0][0]).toBe('2022-01-01T10:00:00.000Z');
    });

    test('应该处理各种日期格式标记', () => {
      const formatTests = [
        { format: 'YYYY', expected: '2022' },
        { format: 'YY', expected: '22' },
        { format: 'MM', expected: '01' },
        { format: 'M', expected: '1' },
        { format: 'DD', expected: '01' },
        { format: 'D', expected: '1' },
        { format: 'HH', expected: '10' },
        { format: 'H', expected: '10' },
        { format: 'mm', expected: '00' },
        { format: 'm', expected: '0' },
        { format: 'ss', expected: '00' },
        { format: 's', expected: '0' },
        { format: 'SSS', expected: '000' }
      ];

      formatTests.forEach(({ format, expected }) => {
        const testTransformer = new DataTransformer();
        testTransformer.addTransformation({
          type: 'date_format',
          config: { columnIndex: 0, format }
        });

        const result = testTransformer.transform([testData[0]]);
        // 验证格式化结果的格式和内容，忽略时区差异
        if (format === 'YYYY') {
          expect(result[0][0]).toBe('2022');
        } else if (format === 'YY') {
          expect(result[0][0]).toBe('22');
        } else if (format === 'MM') {
          expect(result[0][0]).toBe('01');
        } else if (format === 'M') {
          expect(result[0][0]).toBe('1');
        } else if (format === 'DD') {
          expect(result[0][0]).toBe('01');
        } else if (format === 'D') {
          expect(result[0][0]).toBe('1');
        } else if (format === 'SSS') {
          expect(result[0][0]).toBe('000');
        } else {
          // 对于时间相关的格式，只验证格式正确性
          expect(result[0][0]).toMatch(/^\d+$/);
        }
      });
    });

    test('应该处理复合日期格式', () => {
      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY/MM/DD HH:mm:ss.SSS' }
      });

      const result = transformer.transform(testData);
      // 验证日期格式正确性，忽略具体时间（时区问题）
      expect(result[0][0]).toMatch(/^2022\/01\/01 \d{2}:\d{2}:\d{2}\.\d{3}$/);
    });

    test('应该处理无效日期值', () => {
      const invalidDateData = [
        ['invalid-date', 25.123456, 100],
        [null, 30.987654, 200],
        [undefined, 18.555555, 150]
      ];

      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY-MM-DD' }
      });

      const result = transformer.transform(invalidDateData);
      expect(result[0][0]).toBe('invalid-date'); // 保持原值
      expect(result[1][0]).toBeNull();
      expect(result[2][0]).toBeUndefined();
    });

    test('应该处理数字时间戳', () => {
      const timestampData = [
        [1640995200000, 25.123456, 100] // 2022-01-01T00:00:00.000Z
      ];

      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY-MM-DD HH:mm:ss' }
      });

      const result = transformer.transform(timestampData);
      // 验证日期格式，使用宽松的日期匹配（可能是2022-01-01或前一天由于时区）
      expect(result[0][0]).toMatch(/^202[12]-[01][12]-[03][01] \d{2}:\d{2}:\d{2}$/);
    });

    test('应该处理Date对象', () => {
      const dateObjectData = [
        [new Date('2022-01-01T10:00:00.000Z'), 25.123456, 100]
      ];

      transformer.addTransformation({
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY-MM-DD HH:mm:ss' }
      });

      const result = transformer.transform(dateObjectData);
      // 验证日期格式，忽略具体时间（时区问题）
      expect(result[0][0]).toMatch(/^2022-01-01 \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('自定义函数转换详细测试', () => {
    test('应该处理自定义函数的错误', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const errorFunction = () => {
        throw new Error('Custom function error');
      };

      transformer.addTransformation({
        type: 'custom_function',
        config: { columnIndex: 1, customFunction: errorFunction }
      });

      const result = transformer.transform(testData);
      expect(result).toHaveLength(4);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
      
      consoleErrorSpy.mockRestore();
    });

    test('应该处理非函数的自定义函数配置', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      transformer.addTransformation({
        type: 'custom_function',
        config: { columnIndex: 1, customFunction: 'not-a-function' as any }
      });

      const result = transformer.transform(testData);
      expect(result).toEqual(testData); // 没有改变
      expect(consoleWarnSpy).toHaveBeenCalledWith('Custom function is not a valid function');
      
      consoleWarnSpy.mockRestore();
    });

    test('应该提供完整的参数给自定义函数', () => {
      const mockFunction = vi.fn((value, record, index) => `${value}_${record.length}_${index}`);

      transformer.addTransformation({
        type: 'custom_function',
        config: { columnIndex: 1, customFunction: mockFunction }
      });

      transformer.transform(testData);

      expect(mockFunction).toHaveBeenCalledTimes(4);
      expect(mockFunction).toHaveBeenCalledWith(25.123456, testData[0], 1);
    });
  });

  describe('配置管理测试', () => {
    test('应该能添加转换配置', () => {
      const transformation: DataTransformation = {
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      };
      transformer.addTransformation(transformation);

      expect(transformer.getTransformationCount()).toBe(1);
      expect(transformer.getTransformations()[0]).toEqual(transformation);
    });

    test('应该能移除转换配置', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });
      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 2, conversionFactor: 2.0 }
      });

      transformer.removeTransformation(0);

      expect(transformer.getTransformationCount()).toBe(1);
      expect(transformer.getTransformations()[0].type).toBe('unit_conversion');
    });

    test('应该处理无效的移除索引', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      transformer.removeTransformation(-1);
      transformer.removeTransformation(10);

      expect(transformer.getTransformationCount()).toBe(1);
    });

    test('应该能清空所有转换配置', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });
      transformer.addTransformation({
        type: 'unit_conversion',
        config: { columnIndex: 2, conversionFactor: 2.0 }
      });

      transformer.clearTransformations();

      expect(transformer.getTransformationCount()).toBe(0);
    });

    test('应该返回转换配置数组的副本', () => {
      const transformation = {
        type: 'precision_round' as TransformationType,
        config: { columnIndex: 1, precision: 2 }
      };
      transformer.addTransformation(transformation);

      const transformations = transformer.getTransformations();
      transformations[0] = { ...transformations[0], type: 'unit_conversion' };

      expect(transformer.getTransformations()[0].type).toBe('precision_round');
    });
  });

  describe('未知转换类型处理测试', () => {
    test('应该处理未知的转换类型', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      transformer.addTransformation({
        type: 'unknown_type' as TransformationType,
        config: { columnIndex: 1 }
      });

      const result = transformer.transform(testData);
      expect(result).toEqual(testData); // 没有改变
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown transformation type: unknown_type');
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('静态工厂方法测试', () => {
    test('应该创建单位转换配置', () => {
      const transformation = DataTransformer.createUnitConversion(1, 'celsius', 'fahrenheit', 1.8);

      expect(transformation.type).toBe('unit_conversion');
      expect(transformation.config.columnIndex).toBe(1);
      expect(transformation.config.fromUnit).toBe('celsius');
      expect(transformation.config.toUnit).toBe('fahrenheit');
      expect(transformation.config.conversionFactor).toBe(1.8);
    });

    test('应该创建精度舍入配置', () => {
      const transformation = DataTransformer.createPrecisionRound(2, 3);

      expect(transformation.type).toBe('precision_round');
      expect(transformation.config.columnIndex).toBe(2);
      expect(transformation.config.precision).toBe(3);
    });

    test('应该创建日期格式化配置', () => {
      const transformation = DataTransformer.createDateFormat(0, 'YYYY-MM-DD');

      expect(transformation.type).toBe('date_format');
      expect(transformation.config.columnIndex).toBe(0);
      expect(transformation.config.format).toBe('YYYY-MM-DD');
    });

    test('应该创建自定义函数转换配置', () => {
      const customFunction = (value: any) => value * 2;
      const transformation = DataTransformer.createCustomFunction(1, customFunction);

      expect(transformation.type).toBe('custom_function');
      expect(transformation.config.columnIndex).toBe(1);
      expect(transformation.config.customFunction).toBe(customFunction);
    });
  });

  describe('常用转换因子测试', () => {
    test('应该提供温度转换因子', () => {
      expect(DataTransformer.CONVERSION_FACTORS.CELSIUS_TO_FAHRENHEIT(0)).toBe(32);
      expect(DataTransformer.CONVERSION_FACTORS.FAHRENHEIT_TO_CELSIUS(32)).toBe(0);
      expect(DataTransformer.CONVERSION_FACTORS.CELSIUS_TO_KELVIN(0)).toBe(273.15);
      expect(DataTransformer.CONVERSION_FACTORS.KELVIN_TO_CELSIUS(273.15)).toBe(0);
    });

    test('应该提供长度转换因子', () => {
      expect(DataTransformer.CONVERSION_FACTORS.METER_TO_FEET).toBeCloseTo(3.28084);
      expect(DataTransformer.CONVERSION_FACTORS.FEET_TO_METER).toBeCloseTo(0.3048);
      expect(DataTransformer.CONVERSION_FACTORS.METER_TO_INCH).toBeCloseTo(39.3701);
      expect(DataTransformer.CONVERSION_FACTORS.INCH_TO_METER).toBeCloseTo(0.0254);
    });

    test('应该提供重量转换因子', () => {
      expect(DataTransformer.CONVERSION_FACTORS.KG_TO_POUND).toBeCloseTo(2.20462);
      expect(DataTransformer.CONVERSION_FACTORS.POUND_TO_KG).toBeCloseTo(0.453592);
    });

    test('应该提供压力转换因子', () => {
      expect(DataTransformer.CONVERSION_FACTORS.PA_TO_PSI).toBeCloseTo(0.000145038);
      expect(DataTransformer.CONVERSION_FACTORS.PSI_TO_PA).toBeCloseTo(6894.76);
    });

    test('应该提供速度转换因子', () => {
      expect(DataTransformer.CONVERSION_FACTORS.MS_TO_KMH).toBe(3.6);
      expect(DataTransformer.CONVERSION_FACTORS.KMH_TO_MS).toBeCloseTo(0.277778);
      expect(DataTransformer.CONVERSION_FACTORS.MS_TO_MPH).toBeCloseTo(2.23694);
      expect(DataTransformer.CONVERSION_FACTORS.MPH_TO_MS).toBeCloseTo(0.44704);
    });
  });

  describe('实际转换因子应用测试', () => {
    test('应该正确使用温度转换因子', () => {
      transformer.addTransformation({
        type: 'unit_conversion',
        config: {
          columnIndex: 1,
          conversionFactor: DataTransformer.CONVERSION_FACTORS.METER_TO_FEET
        }
      });

      const meterData = [['timestamp', 1, 'meters']];
      const result = transformer.transform(meterData);
      
      expect(result[0][1]).toBeCloseTo(3.28084);
    });

    test('应该正确使用自定义温度转换函数', () => {
      transformer.addTransformation({
        type: 'custom_function',
        config: {
          columnIndex: 1,
          customFunction: DataTransformer.CONVERSION_FACTORS.CELSIUS_TO_FAHRENHEIT
        }
      });

      const celsiusData = [['timestamp', 100, 'celsius']];
      const result = transformer.transform(celsiusData);
      
      expect(result[0][1]).toBe(212); // 100°C = 212°F
    });
  });

  describe('边界条件和错误处理测试', () => {
    test('应该处理空数据数组', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      const result = transformer.transform([]);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    test('应该处理包含空记录的数据', () => {
      const dataWithEmptyRecords = [
        ['2022-01-01T10:00:00.000Z', 25.123456, 100],
        [],
        ['2022-01-01T10:02:00.000Z', 18.555555, 150]
      ];

      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      });

      const result = transformer.transform(dataWithEmptyRecords);
      expect(result).toHaveLength(3);
      expect(result[0][1]).toBe(25.12);
      // 空记录可能被转换器处理，我们只验证它仍然是数组
      expect(Array.isArray(result[1])).toBe(true);
      expect(result[2][1]).toBe(18.56);
    });

    test('应该处理列索引超出记录长度的情况', () => {
      transformer.addTransformation({
        type: 'precision_round',
        config: { columnIndex: 10, precision: 2 }
      });

      const originalData = testData.map(record => [...record]); // 深拷贝原始数据
      const result = transformer.transform(testData);
      
      // 检查原始列的数据没有改变
      expect(result).toHaveLength(4);
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < originalData[i].length; j++) {
          expect(result[i][j]).toEqual(originalData[i][j]);
        }
      }
    });
  });
});
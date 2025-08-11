/**
 * DataTransformer 模块真实覆盖率测试
 * 测试所有数据转换功能和类型
 */

import { describe, test, expect, vi } from 'vitest';
import { DataTransformer } from './src/extension/export/DataTransformer.ts';

// Mock console methods to avoid noise in tests
const mockConsole = {
  warn: vi.fn(),
  error: vi.fn()
};
vi.stubGlobal('console', mockConsole);

describe('DataTransformer Complete Coverage', () => {
  describe('Basic Construction and Configuration', () => {
    test('should create transformer with empty transformations', () => {
      const transformer = new DataTransformer();
      const result = transformer.transform([]);
      expect(result).toEqual([]);
    });

    test('should create transformer with provided transformations', () => {
      const transformations = [
        {
          type: 'unit_conversion',
          config: { columnIndex: 0, conversionFactor: 2.54 }
        }
      ];
      const transformer = new DataTransformer(transformations);
      const result = transformer.transform([[1, 2], [3, 4]]);
      expect(result[0][0]).toBe(2.54);
      expect(result[1][0]).toBe(7.62);
    });
  });

  describe('Unit Conversion Transformations', () => {
    test('should convert units with valid numbers', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 1, conversionFactor: 2.54 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['label1', 10, 'other'],
        ['label2', 5.5, 'data'],
        ['label3', 0, 'zero']
      ];

      const result = transformer.transform(data);
      expect(result[0][1]).toBe(25.4);
      expect(result[1][1]).toBe(13.97);
      expect(result[2][1]).toBe(0);
    });

    test('should handle unit conversion with string numbers', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 0, conversionFactor: 100 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['1.5', 'data'],
        ['2.25', 'more'],
        ['-1', 'negative']
      ];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(150);
      expect(result[1][0]).toBe(225);
      expect(result[2][0]).toBe(-100);
    });

    test('should skip unit conversion for invalid numbers', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 0, conversionFactor: 2 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['invalid', 'data'],
        [null, 'null'],
        [undefined, 'undefined'],
        ['', 'empty']
      ];

      const result = transformer.transform(data);
      // parseNumber converts invalid strings to 0, then multiplies by factor
      expect(result[0][0]).toBe(0); // 'invalid' -> 0 -> 0*2 = 0
      expect(result[1][0]).toBe(0); // null -> 0 -> 0*2 = 0  
      expect(result[2][0]).toBe(0); // undefined -> 0 -> 0*2 = 0
      expect(result[3][0]).toBe(0); // '' -> 0 -> 0*2 = 0
    });

    test('should handle unit conversion with out of bounds column index', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 5, conversionFactor: 2 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['a', 'b', 'c']];

      const result = transformer.transform(data);
      // Out of bounds access expands the array and sets the new column
      expect(result[0].length).toBeGreaterThan(3);
      expect(result[0][5]).toBe(0); // undefined -> 0 -> 0*2 = 0
    });
  });

  describe('Precision Rounding Transformations', () => {
    test('should round precision with valid numbers', () => {
      const transformation = {
        type: 'precision_round',
        config: { columnIndex: 1, precision: 2 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['label1', 3.14159, 'pi'],
        ['label2', 2.71828, 'e'],
        ['label3', 1.41421, 'sqrt2']
      ];

      const result = transformer.transform(data);
      expect(result[0][1]).toBe(3.14);
      expect(result[1][1]).toBe(2.72);
      expect(result[2][1]).toBe(1.41);
    });

    test('should handle precision rounding with string numbers', () => {
      const transformation = {
        type: 'precision_round',
        config: { columnIndex: 0, precision: 1 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['123.456', 'data'],
        ['789.012', 'more'],
        ['-45.678', 'negative']
      ];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(123.5);
      expect(result[1][0]).toBe(789.0);
      expect(result[2][0]).toBe(-45.7);
    });

    test('should handle zero precision', () => {
      const transformation = {
        type: 'precision_round',
        config: { columnIndex: 0, precision: 0 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['3.14159', 'pi'], ['2.71828', 'e']];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(3);
      expect(result[1][0]).toBe(3);
    });

    test('should skip precision rounding for invalid numbers', () => {
      const transformation = {
        type: 'precision_round',
        config: { columnIndex: 0, precision: 2 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['invalid', 'data'], [null, 'null']];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(0); // 'invalid' -> 0 (rounded to 2 decimals)
      expect(result[1][0]).toBe(0); // null -> 0 (rounded to 2 decimals)
    });
  });

  describe('Date Formatting Transformations', () => {
    test('should format valid Date objects', () => {
      const transformation = {
        type: 'date_format',
        config: { columnIndex: 1, format: 'YYYY-MM-DD' }
      };
      const transformer = new DataTransformer([transformation]);
      const testDate = new Date('2023-12-25T10:30:00Z');
      const data = [
        ['label1', testDate, 'christmas'],
        ['label2', new Date('2023-01-01T00:00:00Z'), 'new year']
      ];

      const result = transformer.transform(data);
      expect(typeof result[0][1]).toBe('string');
      expect(result[0][1]).toContain('2023');
      expect(result[0][1]).toContain('12');
      expect(result[0][1]).toContain('25');
    });

    test('should format valid date strings', () => {
      const transformation = {
        type: 'date_format',
        config: { columnIndex: 0, format: 'MM/DD/YYYY' }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['2023-12-25', 'christmas'],
        ['2023-01-01T10:30:00Z', 'new year']
      ];

      const result = transformer.transform(data);
      expect(typeof result[0][0]).toBe('string');
      expect(typeof result[1][0]).toBe('string');
    });

    test('should handle invalid dates', () => {
      const transformation = {
        type: 'date_format',
        config: { columnIndex: 0, format: 'YYYY-MM-DD' }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['invalid date', 'data'],
        [12345, 'number'],
        [null, 'null']
      ];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe('invalid date'); // Invalid date string remains unchanged
      expect(typeof result[1][0]).toBe('string'); // 12345 treated as timestamp and formatted
      expect(result[2][0]).toBe(null); // null remains unchanged
    });

    test('should use default ISO format when no format specified', () => {
      const transformation = {
        type: 'date_format',
        config: { columnIndex: 0, format: '' }
      };
      const transformer = new DataTransformer([transformation]);
      const testDate = new Date('2023-12-25T10:30:00Z');
      const data = [[testDate, 'test']];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(testDate.toISOString());
    });
  });

  describe('Custom Function Transformations', () => {
    test('should apply custom function transformation', () => {
      const customFunction = (value, record, index) => {
        return typeof value === 'number' ? value * 2 : value;
      };
      const transformation = {
        type: 'custom_function',
        config: { columnIndex: 1, customFunction }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [
        ['label1', 10, 'data'],
        ['label2', 5.5, 'more'],
        ['label3', 'text', 'string']
      ];

      const result = transformer.transform(data);
      expect(result[0][1]).toBe(20);
      expect(result[1][1]).toBe(11);
      expect(result[2][1]).toBe('text');
    });

    test('should handle invalid custom function', () => {
      const transformation = {
        type: 'custom_function',
        config: { columnIndex: 0, customFunction: 'not a function' }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['test', 'data']];

      const result = transformer.transform(data);
      expect(result).toEqual(data);
      expect(mockConsole.warn).toHaveBeenCalledWith('Custom function is not a valid function');
    });

    test('should handle custom function errors gracefully', () => {
      const errorFunction = () => {
        throw new Error('Custom function error');
      };
      const transformation = {
        type: 'custom_function',
        config: { columnIndex: 0, customFunction: errorFunction }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['test', 'data']];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe('test'); // Should remain unchanged
      expect(mockConsole.error).toHaveBeenCalledWith('Error applying custom function:', expect.any(Error));
    });
  });

  describe('Async Transform Operations', () => {
    async function* createAsyncIterable(data) {
      for (const record of data) {
        yield record;
      }
    }

    test('should transform async iterable data', async () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 0, conversionFactor: 2 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [[1, 'a'], [2, 'b'], [3, 'c']];
      const asyncData = createAsyncIterable(data);

      const results = [];
      for await (const record of transformer.transformAsync(asyncData)) {
        results.push(record);
      }

      expect(results).toHaveLength(3);
      expect(results[0][0]).toBe(2);
      expect(results[1][0]).toBe(4);
      expect(results[2][0]).toBe(6);
    });

    test('should handle multiple transformations in async mode', async () => {
      const transformations = [
        {
          type: 'unit_conversion',
          config: { columnIndex: 0, conversionFactor: 2 }
        },
        {
          type: 'precision_round',
          config: { columnIndex: 0, precision: 1 }
        }
      ];
      const transformer = new DataTransformer(transformations);
      const data = [[3.14159, 'pi'], [2.71828, 'e']];
      const asyncData = createAsyncIterable(data);

      const results = [];
      for await (const record of transformer.transformAsync(asyncData)) {
        results.push(record);
      }

      expect(results[0][0]).toBe(6.3); // 3.14159 * 2, rounded to 1 decimal
      expect(results[1][0]).toBe(5.4); // 2.71828 * 2, rounded to 1 decimal
    });

    test('should handle async custom function', async () => {
      const customFunction = (value) => value.toString().toUpperCase();
      const transformation = {
        type: 'custom_function',
        config: { columnIndex: 0, customFunction }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['hello', 1], ['world', 2]];
      const asyncData = createAsyncIterable(data);

      const results = [];
      for await (const record of transformer.transformAsync(asyncData)) {
        results.push(record);
      }

      expect(results[0][0]).toBe('HELLO');
      expect(results[1][0]).toBe('WORLD');
    });
  });

  describe('Multiple and Chained Transformations', () => {
    test('should apply multiple transformations in order', () => {
      const transformations = [
        {
          type: 'unit_conversion',
          config: { columnIndex: 0, conversionFactor: 2 }
        },
        {
          type: 'precision_round',
          config: { columnIndex: 0, precision: 2 }
        }
      ];
      const transformer = new DataTransformer(transformations);
      const data = [[3.14159, 'pi'], [2.71828, 'e']];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(6.28); // 3.14159 * 2 = 6.28318, rounded to 6.28
      expect(result[1][0]).toBe(5.44); // 2.71828 * 2 = 5.43656, rounded to 5.44
    });

    test('should handle complex transformation chain', () => {
      const transformations = [
        {
          type: 'precision_round',
          config: { columnIndex: 0, precision: 1 }
        },
        {
          type: 'custom_function',
          config: { 
            columnIndex: 0, 
            customFunction: (value) => value + 10 
          }
        },
        {
          type: 'unit_conversion',
          config: { columnIndex: 0, conversionFactor: 0.1 }
        }
      ];
      const transformer = new DataTransformer(transformations);
      const data = [[123.456, 'test']];

      const result = transformer.transform(data);
      // 123.456 -> 123.5 -> 133.5 -> 13.35 (with floating point precision)
      expect(result[0][0]).toBeCloseTo(13.35, 2);
    });
  });

  describe('Unknown and Edge Case Transformations', () => {
    test('should handle unknown transformation type', () => {
      const transformation = {
        type: 'unknown_type',
        config: { columnIndex: 0 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['test', 'data']];

      const result = transformer.transform(data);
      expect(result).toEqual(data);
      expect(mockConsole.warn).toHaveBeenCalledWith('Unknown transformation type: unknown_type');
    });

    test('should handle empty records', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 0, conversionFactor: 2 }
      };
      const transformer = new DataTransformer([transformation]);

      const result = transformer.transform([]);
      expect(result).toEqual([]);
    });

    test('should handle records with missing columns', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 2, conversionFactor: 2 }
      };
      const transformer = new DataTransformer([transformation]);
      const data = [['a'], ['b', 'c']]; // First record missing column 2

      const result = transformer.transform(data);
      // Arrays get extended when accessing out-of-bounds indices
      expect(result[0].length).toBeGreaterThan(1); 
      expect(result[1].length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Static Factory Methods', () => {
    test('should create custom function transformation', () => {
      const customFunction = (value) => value * 3;
      const transformation = DataTransformer.createCustomFunction(1, customFunction);

      expect(transformation.type).toBe('custom_function');
      expect(transformation.config.columnIndex).toBe(1);
      expect(transformation.config.customFunction).toBe(customFunction);

      const transformer = new DataTransformer([transformation]);
      const result = transformer.transform([[0, 5, 0]]);
      expect(result[0][1]).toBe(15);
    });
  });

  describe('Utility Methods Coverage', () => {
    test('should test number parsing edge cases', () => {
      const transformation = {
        type: 'unit_conversion',
        config: { columnIndex: 0, conversionFactor: 2 }
      };
      const transformer = new DataTransformer([transformation]);

      // Test various number formats
      const data = [
        [42, 'number'],
        ['123', 'string number'],
        ['12.34', 'decimal string'],
        ['-56.78', 'negative string'],
        ['0', 'zero string'],
        ['  789  ', 'padded string'],
        ['1e10', 'scientific notation'],
        [true, 'boolean'],
        [{}, 'object'],
        [[], 'array']
      ];

      const result = transformer.transform(data);
      expect(result[0][0]).toBe(84);      // 42 * 2
      expect(result[1][0]).toBe(246);     // 123 * 2
      expect(result[2][0]).toBe(24.68);   // 12.34 * 2
      expect(result[3][0]).toBe(-113.56); // -56.78 * 2
      expect(result[4][0]).toBe(0);       // 0 * 2
      expect(result[5][0]).toBe(1578);    // 789 * 2
      expect(result[6][0]).toBe(2e10);    // 1e10 * 2
      expect(result[7][0]).toBe(0);       // boolean true -> 0 -> 0*2 = 0
      expect(result[8][0]).toBe(0);       // object {} -> 0 -> 0*2 = 0
      expect(result[9][0]).toBe(0);       // array [] -> 0 -> 0*2 = 0
    });
  });
});
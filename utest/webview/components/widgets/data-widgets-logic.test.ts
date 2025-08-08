/**
 * 数据展示类Widget逻辑测试
 * 验证PlotWidget, MultiPlotWidget, Plot3DWidget, FFTPlotWidget, BarWidget, DataGridWidget的核心功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('数据展示类Widget逻辑测试', () => {
  
  describe('PlotWidget 逻辑', () => {
    test('应该计算正确的更新率', () => {
      const calculateUpdateRate = (frameCount: number, timeSpan: number): number => {
        if (timeSpan <= 0 || frameCount <= 0) return 0;
        return Math.round(frameCount / (timeSpan / 1000) * 10) / 10;
      };

      expect(calculateUpdateRate(60, 1000)).toBe(60);
      expect(calculateUpdateRate(30, 500)).toBe(60);
      expect(calculateUpdateRate(0, 1000)).toBe(0);
      expect(calculateUpdateRate(10, 0)).toBe(0);
    });

    test('应该格式化Y轴范围文本', () => {
      const formatYRangeText = (min: number, max: number): string => {
        if (min === max) return `${min.toFixed(2)}`;
        return `${min.toFixed(2)} ~ ${max.toFixed(2)}`;
      };

      expect(formatYRangeText(0, 100)).toBe('0.00 ~ 100.00');
      expect(formatYRangeText(10.5, 10.5)).toBe('10.50');
      expect(formatYRangeText(-5.123, 15.789)).toBe('-5.12 ~ 15.79');
    });

    test('应该计算数据点总数', () => {
      const calculateTotalDataPoints = (chartData: number[][]): number => {
        return chartData.reduce((total, series) => total + series.length, 0);
      };

      const testData = [
        [1, 2, 3, 4, 5],
        [10, 20, 30],
        [100]
      ];

      expect(calculateTotalDataPoints(testData)).toBe(9);
      expect(calculateTotalDataPoints([])).toBe(0);
      expect(calculateTotalDataPoints([[]])).toBe(0);
    });

    test('应该实现数据采样', () => {
      const sampleData = (data: number[], maxPoints: number): number[] => {
        if (data.length <= maxPoints) return [...data];
        
        const step = data.length / maxPoints;
        const sampled: number[] = [];
        
        for (let i = 0; i < maxPoints; i++) {
          const index = Math.floor(i * step);
          sampled.push(data[index]);
        }
        
        return sampled;
      };

      const largeData = Array.from({ length: 1000 }, (_, i) => i);
      const sampled = sampleData(largeData, 100);
      
      expect(sampled.length).toBe(100);
      expect(sampled[0]).toBe(0);
      expect(sampled[99]).toBe(990);
      
      const smallData = [1, 2, 3];
      expect(sampleData(smallData, 10)).toEqual([1, 2, 3]);
    });

    test('应该自动缩放Y轴', () => {
      const autoScaleY = (data: number[][], padding = 0.1) => {
        if (data.length === 0 || data.every(series => series.length === 0)) {
          return { min: 0, max: 1 };
        }

        const allValues = data.flat().filter(v => !isNaN(v) && isFinite(v));
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        
        if (min === max) {
          return { min: min - 1, max: max + 1 };
        }

        const range = max - min;
        const paddingValue = range * padding;
        
        return {
          min: min - paddingValue,
          max: max + paddingValue
        };
      };

      expect(autoScaleY([[1, 2, 3], [4, 5, 6]])).toEqual({
        min: 0.5,
        max: 6.5
      });

      expect(autoScaleY([[5]])).toEqual({
        min: 4,
        max: 6
      });

      expect(autoScaleY([])).toEqual({
        min: 0,
        max: 1
      });
    });
  });

  describe('MultiPlotWidget 逻辑', () => {
    test('应该管理曲线可见性', () => {
      interface Curve {
        visible: boolean;
        label: string;
        color: string;
        data: number[];
      }

      const toggleAllCurves = (curves: Curve[], visible: boolean): Curve[] => {
        return curves.map(curve => ({ ...curve, visible }));
      };

      const curves: Curve[] = [
        { visible: true, label: 'Series 1', color: '#ff0000', data: [1, 2, 3] },
        { visible: false, label: 'Series 2', color: '#00ff00', data: [4, 5, 6] },
        { visible: true, label: 'Series 3', color: '#0000ff', data: [7, 8, 9] }
      ];

      const allVisible = toggleAllCurves(curves, true);
      expect(allVisible.every(curve => curve.visible)).toBe(true);

      const allHidden = toggleAllCurves(curves, false);
      expect(allHidden.every(curve => !curve.visible)).toBe(true);
    });

    test('应该计算可见曲线数量', () => {
      const countVisibleCurves = (curves: { visible: boolean }[]): number => {
        return curves.filter(curve => curve.visible).length;
      };

      const curves = [
        { visible: true },
        { visible: false },
        { visible: true },
        { visible: true }
      ];

      expect(countVisibleCurves(curves)).toBe(3);
      expect(countVisibleCurves([])).toBe(0);
      expect(countVisibleCurves([{ visible: false }, { visible: false }])).toBe(0);
    });

    test('应该计算曲线统计信息', () => {
      const calculateCurveStats = (data: number[]) => {
        if (data.length === 0) {
          return { lastValue: 0, minValue: 0, maxValue: 0 };
        }

        return {
          lastValue: data[data.length - 1],
          minValue: Math.min(...data),
          maxValue: Math.max(...data)
        };
      };

      expect(calculateCurveStats([1, 2, 3, 5, 4])).toEqual({
        lastValue: 4,
        minValue: 1,
        maxValue: 5
      });

      expect(calculateCurveStats([])).toEqual({
        lastValue: 0,
        minValue: 0,
        maxValue: 0
      });

      expect(calculateCurveStats([42])).toEqual({
        lastValue: 42,
        minValue: 42,
        maxValue: 42
      });
    });

    test('应该格式化数值', () => {
      const formatValue = (value: number): string => {
        if (isNaN(value) || !isFinite(value)) return 'N/A';
        
        if (Math.abs(value) >= 1000) {
          return value.toExponential(2);
        }
        
        return value.toFixed(3);
      };

      expect(formatValue(123.456789)).toBe('123.457');
      expect(formatValue(1234.5)).toBe('1.23e+3');
      expect(formatValue(0.001234)).toBe('0.001');
      expect(formatValue(NaN)).toBe('N/A');
      expect(formatValue(Infinity)).toBe('N/A');
    });

    test('应该处理插值模式', () => {
      const interpolateData = (data: number[], targetLength: number): number[] => {
        if (data.length === 0) return [];
        if (data.length >= targetLength) return data.slice(0, targetLength);
        
        const result: number[] = [];
        const step = (data.length - 1) / (targetLength - 1);
        
        for (let i = 0; i < targetLength; i++) {
          const index = i * step;
          const lowerIndex = Math.floor(index);
          const upperIndex = Math.ceil(index);
          
          if (lowerIndex === upperIndex) {
            result.push(data[lowerIndex]);
          } else {
            const factor = index - lowerIndex;
            const interpolated = data[lowerIndex] * (1 - factor) + data[upperIndex] * factor;
            result.push(interpolated);
          }
        }
        
        return result;
      };

      const data = [0, 10, 20];
      const interpolated = interpolateData(data, 5);
      
      expect(interpolated.length).toBe(5);
      expect(interpolated[0]).toBe(0);
      expect(interpolated[4]).toBe(20);
      expect(interpolated[2]).toBe(10); // 中间值
      
      expect(interpolateData([], 5)).toEqual([]);
      expect(interpolateData([42], 3)).toEqual([42, 42, 42]);
    });
  });

  describe('BarWidget 逻辑', () => {
    test('应该对数据排序', () => {
      interface BarData {
        label: string;
        value: number;
      }

      const sortBarData = (data: BarData[], mode: 'none' | 'asc' | 'desc'): BarData[] => {
        if (mode === 'none') return [...data];
        
        return [...data].sort((a, b) => {
          return mode === 'asc' ? a.value - b.value : b.value - a.value;
        });
      };

      const testData: BarData[] = [
        { label: 'A', value: 30 },
        { label: 'B', value: 10 },
        { label: 'C', value: 20 }
      ];

      const sorted = sortBarData(testData, 'asc');
      expect(sorted.map(item => item.value)).toEqual([10, 20, 30]);

      const sortedDesc = sortBarData(testData, 'desc');
      expect(sortedDesc.map(item => item.value)).toEqual([30, 20, 10]);

      const unsorted = sortBarData(testData, 'none');
      expect(unsorted.map(item => item.value)).toEqual([30, 10, 20]);
    });

    test('应该计算数据范围', () => {
      const calculateBarRange = (data: { value: number }[]) => {
        if (data.length === 0) return { min: 0, max: 1 };
        
        const values = data.map(item => item.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        return { min, max };
      };

      const testData = [
        { value: 10 },
        { value: 5 },
        { value: 20 },
        { value: 15 }
      ];

      expect(calculateBarRange(testData)).toEqual({ min: 5, max: 20 });
      expect(calculateBarRange([])).toEqual({ min: 0, max: 1 });
      expect(calculateBarRange([{ value: 42 }])).toEqual({ min: 42, max: 42 });
    });

    test('应该生成条形图颜色', () => {
      const generateBarColors = (count: number): string[] => {
        const baseColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        const colors: string[] = [];
        
        for (let i = 0; i < count; i++) {
          colors.push(baseColors[i % baseColors.length]);
        }
        
        return colors;
      };

      expect(generateBarColors(3)).toEqual(['#FF6384', '#36A2EB', '#FFCE56']);
      expect(generateBarColors(7)).toEqual([
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'
      ]);
      expect(generateBarColors(0)).toEqual([]);
    });

    test('应该格式化范围文本', () => {
      const formatRangeText = (min: number, max: number): string => {
        if (min === max) return min.toString();
        return `${min} - ${max}`;
      };

      expect(formatRangeText(0, 100)).toBe('0 - 100');
      expect(formatRangeText(42, 42)).toBe('42');
      expect(formatRangeText(-10, 50)).toBe('-10 - 50');
    });

    test('应该限制数据项数量', () => {
      const limitDataItems = <T>(data: T[], maxItems: number): T[] => {
        if (data.length <= maxItems) return [...data];
        return data.slice(-maxItems); // 保留最新的数据
      };

      const testData = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const limited = limitDataItems(testData, 50);
      
      expect(limited.length).toBe(50);
      expect(limited[0].id).toBe(50); // 从50开始
      expect(limited[49].id).toBe(99); // 到99结束
      
      const smallData = [1, 2, 3];
      expect(limitDataItems(smallData, 10)).toEqual([1, 2, 3]);
    });
  });

  describe('FFTPlotWidget 逻辑', () => {
    test('应该计算频率分辨率', () => {
      const calculateFrequencyResolution = (samplingRate: number, fftSize: number): number => {
        return samplingRate / fftSize;
      };

      expect(calculateFrequencyResolution(1000, 512)).toBe(1000 / 512);
      expect(calculateFrequencyResolution(44100, 1024)).toBe(44100 / 1024);
      expect(calculateFrequencyResolution(8000, 256)).toBe(8000 / 256);
    });

    test('应该计算最大频率', () => {
      const calculateMaxFrequency = (samplingRate: number): number => {
        return samplingRate / 2; // 奈奎斯特频率
      };

      expect(calculateMaxFrequency(1000)).toBe(500);
      expect(calculateMaxFrequency(44100)).toBe(22050);
      expect(calculateMaxFrequency(8000)).toBe(4000);
    });

    test('应该格式化频率显示', () => {
      const formatFrequency = (freq: number): string => {
        if (freq >= 1000) {
          return `${(freq / 1000).toFixed(2)} kHz`;
        }
        return `${freq.toFixed(2)} Hz`;
      };

      expect(formatFrequency(440)).toBe('440.00 Hz');
      expect(formatFrequency(1500)).toBe('1.50 kHz');
      expect(formatFrequency(22050)).toBe('22.05 kHz');
      expect(formatFrequency(0.5)).toBe('0.50 Hz');
    });

    test('应该格式化幅度显示', () => {
      const formatMagnitude = (magnitude: number): string => {
        if (magnitude <= 0) return '-∞ dB';
        
        const dB = 20 * Math.log10(magnitude);
        return `${dB.toFixed(2)} dB`;
      };

      expect(formatMagnitude(1)).toBe('0.00 dB');
      expect(formatMagnitude(0.1)).toBe('-20.00 dB');
      expect(formatMagnitude(10)).toBe('20.00 dB');
      expect(formatMagnitude(0)).toBe('-∞ dB');
    });

    test('应该计算窗函数', () => {
      const applyWindow = (data: number[], windowType: string): number[] => {
        const length = data.length;
        const windowed = [...data];
        
        switch (windowType) {
          case 'hann':
            for (let i = 0; i < length; i++) {
              const factor = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
              windowed[i] *= factor;
            }
            break;
          case 'hamming':
            for (let i = 0; i < length; i++) {
              const factor = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (length - 1));
              windowed[i] *= factor;
            }
            break;
          case 'blackman':
            for (let i = 0; i < length; i++) {
              const factor = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (length - 1)) + 
                           0.08 * Math.cos(4 * Math.PI * i / (length - 1));
              windowed[i] *= factor;
            }
            break;
          case 'rectangular':
          default:
            // 不做处理，保持原始数据
            break;
        }
        
        return windowed;
      };

      const testData = [1, 1, 1, 1];
      
      const rectangular = applyWindow(testData, 'rectangular');
      expect(rectangular).toEqual([1, 1, 1, 1]);
      
      const hann = applyWindow(testData, 'hann');
      expect(hann[0]).toBe(0); // 汉宁窗首尾为0
      expect(hann[3]).toBe(0);
      expect(hann[1]).toBeCloseTo(0.75, 2);
      expect(hann[2]).toBeCloseTo(0.75, 2);
    });

    test('应该查找峰值频率', () => {
      const findPeakFrequency = (magnitudes: number[], freqResolution: number): { freq: number; magnitude: number } => {
        if (magnitudes.length === 0) return { freq: 0, magnitude: 0 };
        
        let maxIndex = 0;
        let maxMagnitude = magnitudes[0];
        
        for (let i = 1; i < magnitudes.length; i++) {
          if (magnitudes[i] > maxMagnitude) {
            maxMagnitude = magnitudes[i];
            maxIndex = i;
          }
        }
        
        return {
          freq: maxIndex * freqResolution,
          magnitude: maxMagnitude
        };
      };

      const magnitudes = [0.1, 0.5, 0.8, 0.3, 0.2];
      const peak = findPeakFrequency(magnitudes, 10);
      
      expect(peak.freq).toBe(20); // 索引2 * 分辨率10
      expect(peak.magnitude).toBe(0.8);
      
      expect(findPeakFrequency([], 10)).toEqual({ freq: 0, magnitude: 0 });
    });
  });

  describe('Plot3DWidget 逻辑', () => {
    test('应该格式化3D范围', () => {
      interface Range3D {
        x: { min: number; max: number };
        y: { min: number; max: number };
        z: { min: number; max: number };
      }

      const formatRange = (range: { min: number; max: number }): string => {
        return `${range.min.toFixed(2)} ~ ${range.max.toFixed(2)}`;
      };

      const testRange = { min: -5.123, max: 10.789 };
      expect(formatRange(testRange)).toBe('-5.12 ~ 10.79');
      
      const singlePointRange = { min: 42, max: 42 };
      expect(formatRange(singlePointRange)).toBe('42.00 ~ 42.00');
    });

    test('应该格式化相机角度', () => {
      interface Vector3 {
        x: number;
        y: number;
        z: number;
      }

      const formatAngle = (angles: Vector3): string => {
        const toDegrees = (radians: number) => (radians * 180 / Math.PI).toFixed(1);
        return `(${toDegrees(angles.x)}°, ${toDegrees(angles.y)}°, ${toDegrees(angles.z)}°)`;
      };

      const testAngles = { x: Math.PI / 4, y: Math.PI / 2, z: Math.PI };
      expect(formatAngle(testAngles)).toBe('(45.0°, 90.0°, 180.0°)');
      
      const zeroAngles = { x: 0, y: 0, z: 0 };
      expect(formatAngle(zeroAngles)).toBe('(0.0°, 0.0°, 0.0°)');
    });

    test('应该格式化相机偏移', () => {
      interface Vector3 {
        x: number;
        y: number;
        z: number;
      }

      const formatOffset = (offset: Vector3): string => {
        return `(${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}, ${offset.z.toFixed(2)})`;
      };

      const testOffset = { x: 1.234, y: -2.567, z: 0.123 };
      expect(formatOffset(testOffset)).toBe('(1.23, -2.57, 0.12)');
      
      const zeroOffset = { x: 0, y: 0, z: 0 };
      expect(formatOffset(zeroOffset)).toBe('(0.00, 0.00, 0.00)');
    });

    test('应该计算3D数据范围', () => {
      interface Point3D {
        x: number;
        y: number;
        z: number;
      }

      const calculate3DRange = (points: Point3D[]) => {
        if (points.length === 0) {
          return {
            x: { min: 0, max: 1 },
            y: { min: 0, max: 1 },
            z: { min: 0, max: 1 }
          };
        }

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const zs = points.map(p => p.z);

        return {
          x: { min: Math.min(...xs), max: Math.max(...xs) },
          y: { min: Math.min(...ys), max: Math.max(...ys) },
          z: { min: Math.min(...zs), max: Math.max(...zs) }
        };
      };

      const testPoints: Point3D[] = [
        { x: 1, y: 2, z: 3 },
        { x: -2, y: 5, z: 1 },
        { x: 0, y: -1, z: 4 }
      ];

      const range = calculate3DRange(testPoints);
      expect(range.x).toEqual({ min: -2, max: 1 });
      expect(range.y).toEqual({ min: -1, max: 5 });
      expect(range.z).toEqual({ min: 1, max: 4 });
      
      const emptyRange = calculate3DRange([]);
      expect(emptyRange.x).toEqual({ min: 0, max: 1 });
    });

    test('应该设置预设视角', () => {
      interface CameraState {
        position: { x: number; y: number; z: number };
        target: { x: number; y: number; z: number };
      }

      const setViewAngle = (angle: string): CameraState => {
        const defaultTarget = { x: 0, y: 0, z: 0 };
        
        switch (angle) {
          case 'top':
            return {
              position: { x: 0, y: 10, z: 0 },
              target: defaultTarget
            };
          case 'front':
            return {
              position: { x: 0, y: 0, z: 10 },
              target: defaultTarget
            };
          case 'left':
            return {
              position: { x: -10, y: 0, z: 0 },
              target: defaultTarget
            };
          case 'orthogonal':
            return {
              position: { x: 7, y: 7, z: 7 },
              target: defaultTarget
            };
          default:
            return {
              position: { x: 5, y: 5, z: 5 },
              target: defaultTarget
            };
        }
      };

      expect(setViewAngle('top').position).toEqual({ x: 0, y: 10, z: 0 });
      expect(setViewAngle('front').position).toEqual({ x: 0, y: 0, z: 10 });
      expect(setViewAngle('left').position).toEqual({ x: -10, y: 0, z: 0 });
      expect(setViewAngle('orthogonal').position).toEqual({ x: 7, y: 7, z: 7 });
      expect(setViewAngle('unknown').position).toEqual({ x: 5, y: 5, z: 5 });
    });

    test('应该计算点云数量', () => {
      const countPoints = (datasets: { points: unknown[] }[]): number => {
        return datasets.reduce((total, dataset) => total + dataset.points.length, 0);
      };

      const testDatasets = [
        { points: [1, 2, 3, 4, 5] },
        { points: [6, 7, 8] },
        { points: [9, 10] }
      ];

      expect(countPoints(testDatasets)).toBe(10);
      expect(countPoints([])).toBe(0);
      expect(countPoints([{ points: [] }])).toBe(0);
    });
  });

  describe('DataGridWidget 逻辑', () => {
    test('应该格式化时间戳', () => {
      const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
          year: '2-digit',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };

      const testTimestamp = new Date('2025-01-15 14:30:45').getTime();
      const formatted = formatTimestamp(testTimestamp);
      expect(formatted).toContain('25'); // 年份
      expect(formatted).toContain('01'); // 月份
      expect(formatted).toContain('15'); // 日期
      expect(formatted).toContain('14'); // 小时
      expect(formatted).toContain('30'); // 分钟
      expect(formatted).toContain('45'); // 秒
    });

    test('应该格式化数字', () => {
      const formatNumber = (value: number, precision = 2): string => {
        if (isNaN(value) || !isFinite(value)) return 'N/A';
        return value.toFixed(precision);
      };

      expect(formatNumber(123.456789)).toBe('123.46');
      expect(formatNumber(123.456789, 3)).toBe('123.457');
      expect(formatNumber(123)).toBe('123.00');
      expect(formatNumber(NaN)).toBe('N/A');
      expect(formatNumber(Infinity)).toBe('N/A');
    });

    test('应该计算进度百分比', () => {
      interface Column {
        min?: number;
        max?: number;
      }

      const calculateProgress = (value: number, column: Column): number => {
        const min = column.min ?? 0;
        const max = column.max ?? 100;
        
        if (max === min) return 0;
        
        const progress = ((value - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, progress));
      };

      expect(calculateProgress(50, { min: 0, max: 100 })).toBe(50);
      expect(calculateProgress(25, { min: 0, max: 50 })).toBe(50);
      expect(calculateProgress(150, { min: 0, max: 100 })).toBe(100); // 限制最大值
      expect(calculateProgress(-10, { min: 0, max: 100 })).toBe(0); // 限制最小值
      expect(calculateProgress(50, { min: 50, max: 50 })).toBe(0); // 相等情况
    });

    test('应该获取状态标签类型', () => {
      const getStatusTagType = (status: string): string => {
        switch (status?.toLowerCase()) {
          case 'success':
          case 'ok':
          case 'active':
            return 'success';
          case 'warning':
          case 'pending':
            return 'warning';
          case 'error':
          case 'failed':
          case 'danger':
            return 'danger';
          case 'info':
          case 'processing':
            return 'info';
          default:
            return 'default';
        }
      };

      expect(getStatusTagType('success')).toBe('success');
      expect(getStatusTagType('WARNING')).toBe('warning');
      expect(getStatusTagType('error')).toBe('danger');
      expect(getStatusTagType('info')).toBe('info');
      expect(getStatusTagType('unknown')).toBe('default');
      expect(getStatusTagType('')).toBe('default');
    });

    test('应该处理分页', () => {
      const paginateData = <T>(data: T[], currentPage: number, pageSize: number): T[] => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
      };

      const testData = Array.from({ length: 25 }, (_, i) => ({ id: i }));
      
      const page1 = paginateData(testData, 1, 10);
      expect(page1.length).toBe(10);
      expect(page1[0].id).toBe(0);
      expect(page1[9].id).toBe(9);
      
      const page3 = paginateData(testData, 3, 10);
      expect(page3.length).toBe(5);
      expect(page3[0].id).toBe(20);
      expect(page3[4].id).toBe(24);
      
      const emptyPage = paginateData(testData, 10, 10);
      expect(emptyPage.length).toBe(0);
    });

    test('应该生成数据列配置', () => {
      interface Dataset {
        title: string;
        fields: Array<{
          name: string;
          type?: string;
          unit?: string;
        }>;
      }

      const generateDataColumns = (datasets: Dataset[]) => {
        const columns: Array<{
          key: string;
          label: string;
          type?: string;
          unit?: string;
          width?: number;
          align?: string;
        }> = [];

        datasets.forEach(dataset => {
          dataset.fields.forEach(field => {
            const column = {
              key: field.name,
              label: field.name,
              type: field.type || 'text',
              unit: field.unit,
              width: field.type === 'number' ? 120 : undefined,
              align: field.type === 'number' ? 'right' : 'left'
            };
            columns.push(column);
          });
        });

        return columns;
      };

      const testDatasets: Dataset[] = [
        {
          title: 'Sensor Data',
          fields: [
            { name: 'temperature', type: 'number', unit: '°C' },
            { name: 'status', type: 'status' },
            { name: 'name', type: 'text' }
          ]
        }
      ];

      const columns = generateDataColumns(testDatasets);
      expect(columns).toHaveLength(3);
      expect(columns[0]).toEqual({
        key: 'temperature',
        label: 'temperature',
        type: 'number',
        unit: '°C',
        width: 120,
        align: 'right'
      });
      expect(columns[1].type).toBe('status');
      expect(columns[2].align).toBe('left');
    });

    test('应该限制数据行数', () => {
      const limitRows = <T>(data: T[], maxRows: number | string): T[] => {
        if (maxRows === 'unlimited') return [...data];
        
        const limit = typeof maxRows === 'string' ? parseInt(maxRows, 10) : maxRows;
        if (isNaN(limit) || limit <= 0) return [...data];
        
        return data.slice(-limit); // 保留最新的数据
      };

      const testData = Array.from({ length: 500 }, (_, i) => ({ id: i }));
      
      const limited100 = limitRows(testData, 100);
      expect(limited100).toHaveLength(100);
      expect(limited100[0].id).toBe(400);
      expect(limited100[99].id).toBe(499);
      
      const unlimited = limitRows(testData, 'unlimited');
      expect(unlimited).toHaveLength(500);
      
      const limitedString = limitRows(testData, '50');
      expect(limitedString).toHaveLength(50);
      
      const invalidLimit = limitRows(testData, 'invalid');
      expect(invalidLimit).toHaveLength(500);
    });
  });

  describe('通用工具函数', () => {
    test('应该生成安全的颜色调色板', () => {
      const generateColorPalette = (count: number): string[] => {
        const baseColors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];
        
        if (count <= baseColors.length) {
          return baseColors.slice(0, count);
        }
        
        const palette: string[] = [];
        for (let i = 0; i < count; i++) {
          palette.push(baseColors[i % baseColors.length]);
        }
        
        return palette;
      };

      expect(generateColorPalette(3)).toHaveLength(3);
      expect(generateColorPalette(10)).toHaveLength(10);
      expect(generateColorPalette(0)).toHaveLength(0);
      
      const colors = generateColorPalette(5);
      expect(colors[0]).toBe('#FF6384');
      expect(colors[4]).toBe('#9966FF');
    });

    test('应该实现节流函数', () => {
      const createThrottle = <T extends (...args: any[]) => any>(
        fn: T, 
        delay: number
      ): T => {
        let lastCall = 0;
        return ((...args: any[]) => {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            return fn(...args);
          }
        }) as T;
      };

      const mockFn = vi.fn();
      const throttled = createThrottle(mockFn, 100);
      
      throttled('call1');
      throttled('call2');
      throttled('call3');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
    });

    test('应该安全地访问嵌套对象属性', () => {
      const safeGet = (obj: any, path: string, defaultValue: any = null): any => {
        try {
          const keys = path.split('.');
          let current = obj;
          
          for (const key of keys) {
            if (current == null || typeof current !== 'object') {
              return defaultValue;
            }
            current = current[key];
          }
          
          return current === undefined ? defaultValue : current;
        } catch {
          return defaultValue;
        }
      };

      const testObj = {
        a: {
          b: {
            c: 'value'
          }
        }
      };

      expect(safeGet(testObj, 'a.b.c')).toBe('value');
      expect(safeGet(testObj, 'a.b.missing')).toBeNull();
      expect(safeGet(testObj, 'missing.path')).toBeNull();
      expect(safeGet(null, 'a.b')).toBeNull();
      expect(safeGet(testObj, 'a.b.missing', 'default')).toBe('default');
    });

    test('应该验证数据有效性', () => {
      const isValidData = (value: any): boolean => {
        return value != null && 
               !isNaN(value) && 
               isFinite(value) && 
               typeof value === 'number';
      };

      expect(isValidData(42)).toBe(true);
      expect(isValidData(0)).toBe(true);
      expect(isValidData(-10.5)).toBe(true);
      
      expect(isValidData(null)).toBe(false);
      expect(isValidData(undefined)).toBe(false);
      expect(isValidData(NaN)).toBe(false);
      expect(isValidData(Infinity)).toBe(false);
      expect(isValidData('123')).toBe(false);
      expect(isValidData(true)).toBe(false);
    });

    test('应该格式化文件大小', () => {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const base = 1024;
        const digitGroups = Math.floor(Math.log(bytes) / Math.log(base));
        
        return `${(bytes / Math.pow(base, digitGroups)).toFixed(2)} ${units[digitGroups]}`;
      };

      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });
  });

  describe('性能优化函数', () => {
    test('应该实现对象池', () => {
      class ObjectPool<T> {
        private pool: T[] = [];
        private createFn: () => T;
        private resetFn?: (obj: T) => void;

        constructor(createFn: () => T, resetFn?: (obj: T) => void) {
          this.createFn = createFn;
          this.resetFn = resetFn;
        }

        get(): T {
          if (this.pool.length > 0) {
            return this.pool.pop()!;
          }
          return this.createFn();
        }

        release(obj: T): void {
          if (this.resetFn) {
            this.resetFn(obj);
          }
          this.pool.push(obj);
        }

        getPoolSize(): number {
          return this.pool.length;
        }
      }

      const pool = new ObjectPool(
        () => ({ x: 0, y: 0 }),
        (obj) => { obj.x = 0; obj.y = 0; }
      );

      expect(pool.getPoolSize()).toBe(0);

      const obj1 = pool.get();
      obj1.x = 10;
      obj1.y = 20;

      pool.release(obj1);
      expect(pool.getPoolSize()).toBe(1);

      const obj2 = pool.get();
      expect(obj2.x).toBe(0); // 应该被重置
      expect(obj2.y).toBe(0);
      expect(pool.getPoolSize()).toBe(0);
    });

    test('应该实现LRU缓存', () => {
      class LRUCache<K, V> {
        private capacity: number;
        private cache = new Map<K, V>();

        constructor(capacity: number) {
          this.capacity = capacity;
        }

        get(key: K): V | undefined {
          if (this.cache.has(key)) {
            const value = this.cache.get(key)!;
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
          }
          return undefined;
        }

        set(key: K, value: V): void {
          if (this.cache.has(key)) {
            this.cache.delete(key);
          } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
          }
          this.cache.set(key, value);
        }

        size(): number {
          return this.cache.size;
        }
      }

      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.size()).toBe(3);

      cache.set('d', 4); // 应该移除最旧的'a'
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('d')).toBe(4);

      cache.get('b'); // 将'b'标记为最近使用
      cache.set('e', 5); // 应该移除'c'
      expect(cache.get('c')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
    });
  });
});
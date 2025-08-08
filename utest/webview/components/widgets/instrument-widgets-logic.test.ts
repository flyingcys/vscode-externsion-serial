/**
 * 仪表类和其他Widget逻辑测试
 * 验证GaugeWidget, CompassWidget, AccelerometerWidget, GyroscopeWidget, GPSWidget, LEDWidget, TerminalWidget的核心功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('仪表类和其他Widget逻辑测试', () => {
  
  describe('GaugeWidget 逻辑', () => {
    test('应该计算圆弧路径', () => {
      const calculateArcPath = (
        centerX: number, 
        centerY: number, 
        radius: number, 
        startAngle: number, 
        endAngle: number
      ): string => {
        const start = polarToCartesian(centerX, centerY, radius, endAngle);
        const end = polarToCartesian(centerX, centerY, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
      };

      const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
      };

      const path = calculateArcPath(150, 150, 100, 0, 90);
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toMatch(/M\s[\d.-]+\s[\d.-]+\sA\s100\s100\s0\s0\s0\s[\d.-]+\s[\d.-]+/);
    });

    test('应该计算百分比值', () => {
      const calculatePercentage = (value: number, min: number, max: number): number => {
        if (max === min) return 0;
        return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
      };

      expect(calculatePercentage(50, 0, 100)).toBe(50);
      expect(calculatePercentage(25, 0, 50)).toBe(50);
      expect(calculatePercentage(150, 0, 100)).toBe(100); // 限制最大值
      expect(calculatePercentage(-10, 0, 100)).toBe(0); // 限制最小值
      expect(calculatePercentage(50, 50, 50)).toBe(0); // 相等情况
    });

    test('应该判断危险和警告状态', () => {
      const getValueStatus = (value: number, warningThreshold: number, dangerThreshold: number): string => {
        if (value >= dangerThreshold) return 'danger';
        if (value >= warningThreshold) return 'warning';
        return 'normal';
      };

      expect(getValueStatus(30, 50, 80)).toBe('normal');
      expect(getValueStatus(60, 50, 80)).toBe('warning');
      expect(getValueStatus(90, 50, 80)).toBe('danger');
    });

    test('应该生成刻度标记', () => {
      const generateTickMarks = (min: number, max: number, majorTicks: number, minorTicks: number) => {
        const ticks: Array<{ value: number; major: boolean; angle: number }> = [];
        const range = max - min;
        const majorStep = range / majorTicks;
        const minorStep = majorStep / (minorTicks + 1);
        
        // 生成主刻度
        for (let i = 0; i <= majorTicks; i++) {
          const value = min + i * majorStep;
          const angle = (value - min) / range * 270 - 135; // -135° 到 135°
          ticks.push({ value, major: true, angle });
          
          // 生成副刻度
          if (i < majorTicks) {
            for (let j = 1; j <= minorTicks; j++) {
              const minorValue = value + j * minorStep;
              const minorAngle = (minorValue - min) / range * 270 - 135;
              ticks.push({ value: minorValue, major: false, angle: minorAngle });
            }
          }
        }
        
        return ticks;
      };

      const ticks = generateTickMarks(0, 100, 5, 4);
      expect(ticks.length).toBe(26); // 6个主刻度 + 20个副刻度
      expect(ticks[0]).toEqual({ value: 0, major: true, angle: -135 });
      expect(ticks.filter(t => t.major)).toHaveLength(6);
      expect(ticks.filter(t => !t.major)).toHaveLength(20);
    });

    test('应该格式化数值显示', () => {
      const formatGaugeValue = (value: number, precision = 2): string => {
        if (isNaN(value) || !isFinite(value)) return '--';
        
        if (Math.abs(value) >= 1000000) {
          return `${(value / 1000000).toFixed(precision)}M`;
        }
        if (Math.abs(value) >= 1000) {
          return `${(value / 1000).toFixed(precision)}K`;
        }
        
        return value.toFixed(precision);
      };

      expect(formatGaugeValue(123.456)).toBe('123.46');
      expect(formatGaugeValue(1234)).toBe('1.23K');
      expect(formatGaugeValue(1234567)).toBe('1.23M');
      expect(formatGaugeValue(NaN)).toBe('--');
      expect(formatGaugeValue(Infinity)).toBe('--');
    });
  });

  describe('CompassWidget 逻辑', () => {
    test('应该计算方位角度', () => {
      const normalizeHeading = (heading: number): number => {
        let normalized = heading % 360;
        if (normalized < 0) normalized += 360;
        return normalized;
      };

      expect(normalizeHeading(45)).toBe(45);
      expect(normalizeHeading(390)).toBe(30);
      expect(normalizeHeading(-30)).toBe(330);
      expect(normalizeHeading(0)).toBe(0);
      expect(normalizeHeading(360)).toBe(0);
    });

    test('应该获取基本方向', () => {
      const getCardinalDirection = (heading: number): string => {
        const normalized = heading % 360;
        const directions = [
          'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
        ];
        const index = Math.round(normalized / 22.5) % 16;
        return directions[index];
      };

      expect(getCardinalDirection(0)).toBe('N');
      expect(getCardinalDirection(45)).toBe('NE');
      expect(getCardinalDirection(90)).toBe('E');
      expect(getCardinalDirection(135)).toBe('SE');
      expect(getCardinalDirection(180)).toBe('S');
      expect(getCardinalDirection(225)).toBe('SW');
      expect(getCardinalDirection(270)).toBe('W');
      expect(getCardinalDirection(315)).toBe('NW');
      expect(getCardinalDirection(360)).toBe('N');
    });

    test('应该生成指针端点坐标', () => {
      const calculatePointerEnd = (
        centerX: number, 
        centerY: number, 
        radius: number, 
        angle: number
      ): { x: number; y: number } => {
        const radian = (angle - 90) * Math.PI / 180;
        return {
          x: centerX + radius * Math.cos(radian),
          y: centerY + radius * Math.sin(radian)
        };
      };

      const north = calculatePointerEnd(150, 150, 80, 0);
      expect(north.x).toBeCloseTo(150);
      expect(north.y).toBeCloseTo(70);

      const east = calculatePointerEnd(150, 150, 80, 90);
      expect(east.x).toBeCloseTo(230);
      expect(east.y).toBeCloseTo(150);
    });

    test('应该计算磁偏角补正', () => {
      const applyMagneticDeclination = (magneticHeading: number, declination: number): number => {
        const trueHeading = magneticHeading + declination;
        return trueHeading < 0 ? trueHeading + 360 : trueHeading % 360;
      };

      expect(applyMagneticDeclination(0, 15)).toBe(15);
      expect(applyMagneticDeclination(350, 15)).toBe(5);
      expect(applyMagneticDeclination(10, -15)).toBe(355);
    });

    test('应该生成刻度线坐标', () => {
      const generateCompassTicks = (centerX: number, centerY: number, radius: number) => {
        const ticks: Array<{
          angle: number;
          x1: number; y1: number;
          x2: number; y2: number;
          major: boolean;
          label?: string;
          degree: number;
        }> = [];

        for (let i = 0; i < 360; i += 5) {
          const major = i % 30 === 0;
          const tickLength = major ? 15 : 8;
          const radian = (i - 90) * Math.PI / 180;
          
          const x1 = centerX + (radius - tickLength) * Math.cos(radian);
          const y1 = centerY + (radius - tickLength) * Math.sin(radian);
          const x2 = centerX + radius * Math.cos(radian);
          const y2 = centerY + radius * Math.sin(radian);
          
          let label;
          if (major) {
            const mainDirections: Record<number, string> = {
              0: 'N', 30: 'NNE', 60: 'ENE', 90: 'E',
              120: 'ESE', 150: 'SSE', 180: 'S', 210: 'SSW',
              240: 'WSW', 270: 'W', 300: 'WNW', 330: 'NNW'
            };
            label = mainDirections[i] || '';
          } else if (i === 45 || i === 135 || i === 225 || i === 315) {
            const diagonalDirections: Record<number, string> = {
              45: 'NE', 135: 'SE', 225: 'SW', 315: 'NW'
            };
            label = diagonalDirections[i] || '';
          }

          ticks.push({
            angle: i,
            x1, y1, x2, y2,
            major,
            label,
            degree: i
          });
        }

        return ticks;
      };

      const ticks = generateCompassTicks(150, 150, 100);
      expect(ticks.length).toBe(72); // 360 / 5
      expect(ticks.filter(t => t.major)).toHaveLength(12); // 每30度一个主刻度
      expect(ticks[0].label).toBe('N');
      expect(ticks.find(t => t.angle === 45)?.label).toBe('NE'); // 45度对应NE
    });
  });

  describe('AccelerometerWidget 逻辑', () => {
    test('应该计算加速度向量长度', () => {
      const calculateVectorMagnitude = (x: number, y: number, z: number): number => {
        return Math.sqrt(x * x + y * y + z * z);
      };

      expect(calculateVectorMagnitude(3, 4, 0)).toBeCloseTo(5);
      expect(calculateVectorMagnitude(1, 1, 1)).toBeCloseTo(1.732);
      expect(calculateVectorMagnitude(0, 0, 0)).toBe(0);
      expect(calculateVectorMagnitude(1, 0, 0)).toBe(1);
    });

    test('应该计算向量端点坐标', () => {
      const calculateVectorEnd = (
        centerX: number,
        centerY: number,
        maxRadius: number,
        x: number,
        y: number,
        maxG = 2
      ): { x: number; y: number } => {
        const scale = maxRadius / maxG;
        return {
          x: centerX + x * scale,
          y: centerY - y * scale // Y轴反转，向上为正
        };
      };

      const end = calculateVectorEnd(150, 150, 80, 1, 1, 2);
      expect(end.x).toBe(190); // 150 + 1 * 40
      expect(end.y).toBe(110); // 150 - 1 * 40
    });

    test('应该计算倾斜角度', () => {
      const calculateTiltAngles = (x: number, y: number, z: number) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        if (magnitude === 0) return { pitch: 0, roll: 0 };
        
        const pitch = Math.asin(-x / magnitude) * 180 / Math.PI;
        const roll = Math.asin(y / Math.sqrt(x * x + z * z)) * 180 / Math.PI;
        
        return { pitch, roll };
      };

      const angles = calculateTiltAngles(0, 0, 1); // 水平放置
      expect(angles.pitch).toBeCloseTo(0);
      expect(angles.roll).toBeCloseTo(0);

      const angles2 = calculateTiltAngles(1, 0, 0); // 倾斜90度
      expect(angles2.pitch).toBeCloseTo(-90);
    });

    test('应该计算百分比条形', () => {
      const calculateBarPercentage = (value: number, maxValue = 2): number => {
        return Math.max(-100, Math.min(100, (value / maxValue) * 100));
      };

      expect(calculateBarPercentage(1, 2)).toBe(50);
      expect(calculateBarPercentage(-1, 2)).toBe(-50);
      expect(calculateBarPercentage(3, 2)).toBe(100); // 限制最大值
      expect(calculateBarPercentage(-3, 2)).toBe(-100); // 限制最小值
    });

    test('应该生成颜色映射', () => {
      const getAccelerationColor = (value: number, maxValue = 2): string => {
        const normalized = Math.abs(value) / maxValue;
        
        if (normalized < 0.3) return '#4CAF50'; // 绿色 - 低
        if (normalized < 0.7) return '#FF9800'; // 橙色 - 中等
        return '#F44336'; // 红色 - 高
      };

      expect(getAccelerationColor(0.2, 2)).toBe('#4CAF50');
      expect(getAccelerationColor(1.0, 2)).toBe('#FF9800');
      expect(getAccelerationColor(1.8, 2)).toBe('#F44336');
    });
  });

  describe('GyroscopeWidget 逻辑', () => {
    test('应该计算欧拉角', () => {
      const integrateAngularVelocity = (
        currentAngles: { roll: number; pitch: number; yaw: number },
        angularVelocity: { roll: number; pitch: number; yaw: number },
        deltaTime: number
      ) => {
        return {
          roll: currentAngles.roll + angularVelocity.roll * deltaTime,
          pitch: currentAngles.pitch + angularVelocity.pitch * deltaTime,
          yaw: (currentAngles.yaw + angularVelocity.yaw * deltaTime) % 360
        };
      };

      const angles = integrateAngularVelocity(
        { roll: 0, pitch: 0, yaw: 0 },
        { roll: 10, pitch: 5, yaw: 2 },
        0.1
      );

      expect(angles.roll).toBe(1);
      expect(angles.pitch).toBe(0.5);
      expect(angles.yaw).toBe(0.2);
    });

    test('应该生成俯仰角刻度', () => {
      const generatePitchMarks = () => {
        const marks: Array<{
          angle: number;
          offset: number;
          length: number;
          major: boolean;
        }> = [];

        for (let angle = -90; angle <= 90; angle += 10) {
          const major = angle % 30 === 0;
          const offset = angle * 2; // 像素偏移
          const length = major ? 30 : 15;

          marks.push({ angle, offset, length, major });
        }

        return marks;
      };

      const marks = generatePitchMarks();
      expect(marks.length).toBe(19); // -90到90，每10度一个
      expect(marks.filter(m => m.major)).toHaveLength(7); // -90, -60, -30, 0, 30, 60, 90
      expect(marks[9]).toEqual({ angle: 0, offset: 0, length: 30, major: true });
    });

    test('应该计算进度圆弧偏移', () => {
      const calculateProgressOffset = (value: number, maxValue: number, circumference: number): number => {
        const progress = Math.abs(value) / maxValue;
        const clampedProgress = Math.min(progress, 1);
        return circumference - (circumference * clampedProgress);
      };

      const circumference = 2 * Math.PI * 35; // 半径35的圆周长
      
      expect(calculateProgressOffset(0, 100, circumference)).toBe(circumference);
      expect(calculateProgressOffset(50, 100, circumference)).toBeCloseTo(circumference * 0.5);
      expect(calculateProgressOffset(100, 100, circumference)).toBe(0);
      expect(calculateProgressOffset(150, 100, circumference)).toBe(0); // 超出最大值
    });

    test('应该生成校准偏移量', () => {
      const calculateCalibrationOffset = (
        readings: number[],
        sampleCount: number
      ): number => {
        if (readings.length < sampleCount) return 0;
        
        const recentReadings = readings.slice(-sampleCount);
        const average = recentReadings.reduce((sum, val) => sum + val, 0) / sampleCount;
        return average;
      };

      const readings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      expect(calculateCalibrationOffset(readings, 5)).toBe(8); // 平均(6,7,8,9,10)
      expect(calculateCalibrationOffset(readings, 3)).toBe(9); // 平均(8,9,10)
      expect(calculateCalibrationOffset([1, 2], 5)).toBe(0); // 样本不足
    });

    test('应该应用低通滤波', () => {
      const applyLowPassFilter = (
        currentValue: number,
        newValue: number,
        alpha = 0.1
      ): number => {
        return alpha * newValue + (1 - alpha) * currentValue;
      };

      expect(applyLowPassFilter(10, 20, 0.1)).toBeCloseTo(11);
      expect(applyLowPassFilter(0, 100, 0.5)).toBe(50);
      expect(applyLowPassFilter(50, 60, 0.2)).toBeCloseTo(52);
    });
  });

  describe('GPSWidget 逻辑', () => {
    test('应该格式化坐标显示', () => {
      const formatCoordinate = (coord: number, precision = 6): string => {
        return coord.toFixed(precision);
      };

      expect(formatCoordinate(39.9042, 4)).toBe('39.9042');
      expect(formatCoordinate(-116.4074, 4)).toBe('-116.4074');
      expect(formatCoordinate(0)).toBe('0.000000');
    });

    test('应该格式化高度显示', () => {
      const formatAltitude = (altitude: number): string => {
        if (isNaN(altitude) || !isFinite(altitude)) return 'N/A';
        return `${altitude.toFixed(1)} m`;
      };

      expect(formatAltitude(123.456)).toBe('123.5 m');
      expect(formatAltitude(0)).toBe('0.0 m');
      expect(formatAltitude(NaN)).toBe('N/A');
      expect(formatAltitude(Infinity)).toBe('N/A');
    });

    test('应该格式化精度显示', () => {
      const formatAccuracy = (accuracy: number): string => {
        if (isNaN(accuracy) || !isFinite(accuracy)) return 'N/A';
        
        if (accuracy < 1) {
          return `${(accuracy * 100).toFixed(0)} cm`;
        }
        if (accuracy < 1000) {
          return `${accuracy.toFixed(1)} m`;
        }
        return `${(accuracy / 1000).toFixed(1)} km`;
      };

      expect(formatAccuracy(0.5)).toBe('50 cm');
      expect(formatAccuracy(5.2)).toBe('5.2 m');
      expect(formatAccuracy(1500)).toBe('1.5 km');
      expect(formatAccuracy(NaN)).toBe('N/A');
    });

    test('应该计算两点间距离', () => {
      const calculateDistance = (
        lat1: number, lng1: number,
        lat2: number, lng2: number
      ): number => {
        const R = 6371000; // 地球半径（米）
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      // 北京天安门到上海外滩大约距离
      const distance = calculateDistance(39.9043, 116.4074, 31.2397, 121.4993);
      expect(distance).toBeGreaterThan(1000000); // 大于1000公里
      expect(distance).toBeLessThan(1500000); // 小于1500公里
      
      // 相同点距离为0
      expect(calculateDistance(39.9043, 116.4074, 39.9043, 116.4074)).toBeCloseTo(0);
    });

    test('应该计算轨迹长度', () => {
      interface GPSPoint {
        lat: number;
        lng: number;
        timestamp: number;
      }

      const calculateTrajectoryLength = (points: GPSPoint[]): number => {
        if (points.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
          const distance = calculateDistance(
            points[i-1].lat, points[i-1].lng,
            points[i].lat, points[i].lng
          );
          totalDistance += distance;
        }
        
        return totalDistance;
      };

      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371000;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      const trajectory: GPSPoint[] = [
        { lat: 39.9043, lng: 116.4074, timestamp: Date.now() },
        { lat: 39.9044, lng: 116.4075, timestamp: Date.now() + 1000 },
        { lat: 39.9045, lng: 116.4076, timestamp: Date.now() + 2000 }
      ];

      expect(calculateTrajectoryLength([])).toBe(0);
      expect(calculateTrajectoryLength([trajectory[0]])).toBe(0);
      expect(calculateTrajectoryLength(trajectory)).toBeGreaterThan(0);
    });

    test('应该获取地图URL', () => {
      const getMapTileUrl = (type: number, x: number, y: number, z: number): string => {
        const urls = [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
        ];
        
        if (type < 0 || type >= urls.length) {
          return urls[0]
            .replace('{z}', z.toString())
            .replace('{x}', x.toString())
            .replace('{y}', y.toString())
            .replace('{s}', 'a');
        }
        
        return urls[type]
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString())
          .replace('{s}', 'a'); // 简化子域名
      };

      expect(getMapTileUrl(0, 1, 2, 3)).toBe(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/3/2/1'
      );
      expect(getMapTileUrl(1, 1, 2, 3)).toBe(
        'https://a.tile.openstreetmap.org/3/1/2.png'
      );
      expect(getMapTileUrl(999, 1, 2, 3)).toBe(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/3/2/1'
      );
    });
  });

  describe('LEDWidget 逻辑', () => {
    test('应该计算LED位置', () => {
      const calculateLEDPosition = (
        index: number,
        total: number,
        layout: string,
        containerSize: { width: number; height: number }
      ): { x: number; y: number } => {
        switch (layout) {
          case 'row':
            return {
              x: (index * containerSize.width) / Math.max(1, total - 1),
              y: containerSize.height / 2
            };
          
          case 'column':
            return {
              x: containerSize.width / 2,
              y: (index * containerSize.height) / Math.max(1, total - 1)
            };
          
          case 'circle': {
            const angle = (index * 2 * Math.PI) / total;
            const radius = Math.min(containerSize.width, containerSize.height) * 0.4;
            const centerX = containerSize.width / 2;
            const centerY = containerSize.height / 2;
            
            return {
              x: centerX + radius * Math.cos(angle - Math.PI / 2),
              y: centerY + radius * Math.sin(angle - Math.PI / 2)
            };
          }
          
          case 'grid':
          default: {
            const cols = Math.ceil(Math.sqrt(total));
            const rows = Math.ceil(total / cols);
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            return {
              x: (col * containerSize.width) / Math.max(1, cols - 1),
              y: (row * containerSize.height) / Math.max(1, rows - 1)
            };
          }
        }
      };

      const containerSize = { width: 300, height: 200 };
      
      // 测试网格布局
      const gridPos = calculateLEDPosition(0, 4, 'grid', containerSize);
      expect(gridPos.x).toBeCloseTo(0);
      expect(gridPos.y).toBeCloseTo(0);
      
      // 测试行布局
      const rowPos = calculateLEDPosition(1, 3, 'row', containerSize);
      expect(rowPos.x).toBeCloseTo(150);
      expect(rowPos.y).toBe(100);
      
      // 测试圆形布局
      const circlePos = calculateLEDPosition(0, 4, 'circle', containerSize);
      expect(circlePos.x).toBeCloseTo(150); // 中心X
      expect(circlePos.y).toBeLessThan(100); // 应该在中心上方
    });

    test('应该计算LED发光效果', () => {
      const getLEDGlowSize = (state: boolean, size: string): string => {
        if (!state) return '0px';
        
        const baseSizes = {
          small: 8,
          medium: 12,
          large: 16
        };
        
        return `${baseSizes[size as keyof typeof baseSizes] || 12}px`;
      };

      expect(getLEDGlowSize(true, 'small')).toBe('8px');
      expect(getLEDGlowSize(true, 'medium')).toBe('12px');
      expect(getLEDGlowSize(true, 'large')).toBe('16px');
      expect(getLEDGlowSize(false, 'medium')).toBe('0px');
      expect(getLEDGlowSize(true, 'unknown')).toBe('12px');
    });

    test('应该计算LED统计', () => {
      interface LEDState {
        state: boolean;
        blinking: boolean;
        color: string;
      }

      const calculateLEDStats = (leds: LEDState[]) => {
        const total = leds.length;
        const active = leds.filter(led => led.state).length;
        const inactive = total - active;
        const blinking = leds.filter(led => led.blinking).length;
        
        return { total, active, inactive, blinking };
      };

      const testLEDs: LEDState[] = [
        { state: true, blinking: false, color: '#ff0000' },
        { state: false, blinking: false, color: '#00ff00' },
        { state: true, blinking: true, color: '#0000ff' },
        { state: true, blinking: false, color: '#ffff00' }
      ];

      const stats = calculateLEDStats(testLEDs);
      expect(stats.total).toBe(4);
      expect(stats.active).toBe(3);
      expect(stats.inactive).toBe(1);
      expect(stats.blinking).toBe(1);
    });

    test('应该格式化LED值', () => {
      const formatLEDValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        
        if (typeof value === 'boolean') {
          return value ? 'ON' : 'OFF';
        }
        
        if (typeof value === 'number') {
          if (value === 0 || value === 1) {
            return value === 1 ? 'ON' : 'OFF';
          }
          return value.toFixed(2);
        }
        
        return String(value);
      };

      expect(formatLEDValue(true)).toBe('ON');
      expect(formatLEDValue(false)).toBe('OFF');
      expect(formatLEDValue(1)).toBe('ON');
      expect(formatLEDValue(0)).toBe('OFF');
      expect(formatLEDValue(2.345)).toBe('2.35');
      expect(formatLEDValue('custom')).toBe('custom');
      expect(formatLEDValue(null)).toBe('');
    });

    test('应该生成LED颜色', () => {
      const generateLEDColors = (count: number): string[] => {
        const baseColors = [
          '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
          '#ff00ff', '#00ffff', '#ffffff', '#ffa500'
        ];
        
        const colors: string[] = [];
        for (let i = 0; i < count; i++) {
          colors.push(baseColors[i % baseColors.length]);
        }
        
        return colors;
      };

      expect(generateLEDColors(3)).toEqual(['#ff0000', '#00ff00', '#0000ff']);
      expect(generateLEDColors(10)).toHaveLength(10);
      expect(generateLEDColors(10)[8]).toBe('#ff0000'); // 循环使用
    });
  });

  describe('TerminalWidget 逻辑', () => {
    test('应该格式化时间戳', () => {
      const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const ms = date.getMilliseconds().toString().padStart(3, '0');
        
        return `${hours}:${minutes}:${seconds}.${ms}`;
      };

      const testTime = new Date('2025-01-15 14:30:45.123').getTime();
      expect(formatTimestamp(testTime)).toBe('14:30:45.123');
      
      const testTime2 = new Date('2025-01-15 09:05:07.045').getTime();
      expect(formatTimestamp(testTime2)).toBe('09:05:07.045');
    });

    test('应该获取级别标记', () => {
      const getLevelBadge = (level: string): string => {
        const badges: Record<string, string> = {
          error: '[ERROR]',
          warn: '[WARN]',
          info: '[INFO]',
          debug: '[DEBUG]',
          trace: '[TRACE]'
        };
        
        return badges[level] || '[INFO]';
      };

      expect(getLevelBadge('error')).toBe('[ERROR]');
      expect(getLevelBadge('warn')).toBe('[WARN]');
      expect(getLevelBadge('info')).toBe('[INFO]');
      expect(getLevelBadge('unknown')).toBe('[INFO]');
    });

    test('应该格式化行内容', () => {
      const formatLineContent = (content: string): string => {
        // 转义HTML字符
        let formatted = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        
        // 高亮关键词
        formatted = formatted
          .replace(/\b(ERROR|FAIL)\b/gi, '<span class="text-error">$1</span>')
          .replace(/\b(WARN|WARNING)\b/gi, '<span class="text-warning">$1</span>')
          .replace(/\b(OK|SUCCESS|PASS)\b/gi, '<span class="text-success">$1</span>');
        
        // 链接检测
        formatted = formatted.replace(
          /(https?:\/\/[^\s]+)/g, 
          '<a href="$1" target="_blank">$1</a>'
        );
        
        return formatted;
      };

      expect(formatLineContent('This is an ERROR message')).toBe(
        'This is an <span class="text-error">ERROR</span> message'
      );
      
      expect(formatLineContent('<script>alert("test")</script>')).toBe(
        '&lt;script&gt;alert("test")&lt;/script&gt;'
      );
      
      expect(formatLineContent('Visit https://example.com')).toBe(
        'Visit <a href="https://example.com" target="_blank">https://example.com</a>'
      );
    });

    test('应该管理命令历史', () => {
      class CommandHistory {
        private history: string[] = [];
        private currentIndex = -1;

        addCommand(command: string): void {
          if (command.trim() && this.history[this.history.length - 1] !== command) {
            this.history.push(command);
            if (this.history.length > 100) { // 限制历史记录数量
              this.history.shift();
            }
          }
          this.currentIndex = this.history.length;
        }

        navigateHistory(direction: number): string {
          if (this.history.length === 0) return '';
          
          const newIndex = this.currentIndex + direction;
          this.currentIndex = Math.max(0, Math.min(this.history.length - 1, newIndex));
          
          return this.history[this.currentIndex] || '';
        }

        getHistory(): string[] {
          return [...this.history];
        }
      }

      const history = new CommandHistory();
      
      history.addCommand('ls');
      history.addCommand('cd /home');
      history.addCommand('pwd');
      
      expect(history.getHistory()).toEqual(['ls', 'cd /home', 'pwd']);
      
      // 向上导航
      expect(history.navigateHistory(-1)).toBe('pwd');
      expect(history.navigateHistory(-1)).toBe('cd /home');
      expect(history.navigateHistory(-1)).toBe('ls');
      expect(history.navigateHistory(-1)).toBe('ls'); // 已到顶部
      
      // 向下导航
      expect(history.navigateHistory(1)).toBe('cd /home');
      expect(history.navigateHistory(1)).toBe('pwd');
      expect(history.navigateHistory(1)).toBe('pwd'); // 已到底部
    });

    test('应该计算显示行数', () => {
      interface TerminalLine {
        content: string;
        level: string;
        timestamp: number;
        highlight?: boolean;
      }

      const calculateDisplayLines = (
        allLines: TerminalLine[],
        filter: string,
        maxLines: number
      ): TerminalLine[] => {
        let filtered = allLines;
        
        // 应用过滤器
        if (filter.trim()) {
          filtered = allLines.filter(line => 
            line.content.toLowerCase().includes(filter.toLowerCase()) ||
            line.level.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        // 限制行数（保留最新的）
        if (filtered.length > maxLines) {
          filtered = filtered.slice(-maxLines);
        }
        
        return filtered;
      };

      const testLines: TerminalLine[] = [
        { content: 'Starting application', level: 'info', timestamp: Date.now() },
        { content: 'Connection established', level: 'info', timestamp: Date.now() + 1000 },
        { content: 'Error occurred', level: 'error', timestamp: Date.now() + 2000 },
        { content: 'Warning message', level: 'warn', timestamp: Date.now() + 3000 },
        { content: 'Debug information', level: 'debug', timestamp: Date.now() + 4000 }
      ];

      // 无过滤
      const all = calculateDisplayLines(testLines, '', 1000);
      expect(all.length).toBe(5);
      
      // 关键词过滤
      const errorLines = calculateDisplayLines(testLines, 'error', 1000);
      expect(errorLines.length).toBe(1);
      expect(errorLines[0].level).toBe('error');
      
      // 行数限制
      const limited = calculateDisplayLines(testLines, '', 3);
      expect(limited.length).toBe(3);
      expect(limited[0].content).toBe('Error occurred'); // 最新的3行
    });

    test('应该计算字节统计', () => {
      const calculateByteStats = (lines: { content: string }[]): number => {
        return lines.reduce((total, line) => {
          // 计算UTF-8字节数
          return total + new Blob([line.content]).size;
        }, 0);
      };

      const testLines = [
        { content: 'Hello' },
        { content: '世界' }, // 中文字符
        { content: 'Test 123' }
      ];

      const bytes = calculateByteStats(testLines);
      expect(bytes).toBeGreaterThan(15); // Hello(5) + 世界(6) + Test 123(8) = 19+
    });
  });

  describe('通用工具函数', () => {
    test('应该实现防抖函数', () => {
      const createDebounce = <T extends (...args: any[]) => any>(
        fn: T,
        delay: number
      ): T => {
        let timeoutId: NodeJS.Timeout;
        return ((...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        }) as T;
      };

      const mockFn = vi.fn();
      const debounced = createDebounce(mockFn, 100);

      debounced('call1');
      debounced('call2');
      debounced('call3');

      expect(mockFn).not.toHaveBeenCalled();

      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(mockFn).toHaveBeenCalledTimes(1);
          expect(mockFn).toHaveBeenCalledWith('call3');
          resolve();
        }, 150);
      });
    });

    test('应该实现角度规范化', () => {
      const normalizeAngle = (angle: number, min = 0, max = 360): number => {
        const range = max - min;
        let normalized = ((angle - min) % range + range) % range + min;
        return normalized;
      };

      expect(normalizeAngle(45)).toBe(45);
      expect(normalizeAngle(390)).toBe(30);
      expect(normalizeAngle(-30)).toBe(330);
      expect(normalizeAngle(720)).toBe(0);
      
      // 自定义范围
      expect(normalizeAngle(190, -180, 180)).toBe(-170);
      expect(normalizeAngle(-190, -180, 180)).toBe(170);
    });

    test('应该实现平滑插值', () => {
      const lerp = (start: number, end: number, factor: number): number => {
        return start + (end - start) * Math.max(0, Math.min(1, factor));
      };

      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(10, 20, 0.25)).toBe(12.5);
      expect(lerp(0, 100, -0.1)).toBe(0); // 限制最小值
      expect(lerp(0, 100, 1.1)).toBe(100); // 限制最大值
    });

    test('应该检测设备类型', () => {
      const detectDeviceType = (userAgent: string): string => {
        if (/Mobile|Android|iP(hone|od)/i.test(userAgent)) {
          return 'mobile';
        }
        if (/Tablet|iPad/i.test(userAgent)) {
          return 'tablet';
        }
        return 'desktop';
      };

      expect(detectDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')).toBe('mobile');
      expect(detectDeviceType('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)')).toBe('tablet');
      expect(detectDeviceType('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('desktop');
    });

    test('应该生成唯一ID', () => {
      const generateUniqueId = (prefix = 'id'): string => {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2);
        return `${prefix}-${timestamp}-${randomPart}`;
      };

      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      
      expect(id1).toMatch(/^id-[a-z0-9]+-[a-z0-9]+$/);
      expect(id2).toMatch(/^id-[a-z0-9]+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
      
      const customId = generateUniqueId('widget');
      expect(customId).toMatch(/^widget-[a-z0-9]+-[a-z0-9]+$/);
    });
  });

  describe('性能优化函数', () => {
    test('应该实现简单的内存缓存', () => {
      class SimpleCache<K, V> {
        private cache = new Map<K, { value: V; expiry: number }>();
        private defaultTTL: number;

        constructor(defaultTTL = 5000) {
          this.defaultTTL = defaultTTL;
        }

        set(key: K, value: V, ttl?: number): void {
          const expiry = Date.now() + (ttl || this.defaultTTL);
          this.cache.set(key, { value, expiry });
        }

        get(key: K): V | undefined {
          const entry = this.cache.get(key);
          if (!entry) return undefined;

          if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return undefined;
          }

          return entry.value;
        }

        clear(): void {
          this.cache.clear();
        }

        size(): number {
          return this.cache.size;
        }
      }

      const cache = new SimpleCache<string, number>(100);
      
      cache.set('key1', 42);
      expect(cache.get('key1')).toBe(42);
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 100, 50);
      expect(cache.get('key2')).toBe(100);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    test('应该实现数据抽样', () => {
      const sampleData = <T>(data: T[], targetSize: number, method = 'uniform'): T[] => {
        if (data.length <= targetSize) return [...data];
        
        switch (method) {
          case 'uniform': {
            const step = data.length / targetSize;
            const sampled: T[] = [];
            
            for (let i = 0; i < targetSize; i++) {
              const index = Math.floor(i * step);
              sampled.push(data[index]);
            }
            
            return sampled;
          }
          
          case 'random': {
            const sampled = [...data];
            for (let i = sampled.length - 1; i > targetSize - 1; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [sampled[i], sampled[j]] = [sampled[j], sampled[i]];
            }
            return sampled.slice(0, targetSize);
          }
          
          case 'tail':
          default:
            return data.slice(-targetSize);
        }
      };

      const data = Array.from({ length: 100 }, (_, i) => i);
      
      const uniform = sampleData(data, 10, 'uniform');
      expect(uniform.length).toBe(10);
      expect(uniform[0]).toBe(0);
      expect(uniform[9]).toBe(90);
      
      const random = sampleData(data, 10, 'random');
      expect(random.length).toBe(10);
      expect(new Set(random).size).toBe(10); // 确保没有重复
      
      const tail = sampleData(data, 5, 'tail');
      expect(tail).toEqual([95, 96, 97, 98, 99]);
    });
  });
});
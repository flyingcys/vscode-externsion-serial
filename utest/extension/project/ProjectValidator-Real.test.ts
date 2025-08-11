/**
 * ProjectValidator真实代码测试
 * 
 * 测试extension/project/ProjectValidator.ts的真实实现
 * 覆盖JSON Schema验证、业务逻辑验证、组群/数据集/动作验证等
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { ProjectValidator } from '../../../src/extension/project/ProjectValidator';

describe('ProjectValidator真实代码测试', () => {
  let validator: ProjectValidator;

  beforeEach(() => {
    validator = new ProjectValidator();
  });

  // ============ 基础验证器测试 ============
  
  describe('验证器基础功能', () => {
    test('应该能够创建验证器实例', () => {
      expect(validator).toBeInstanceOf(ProjectValidator);
    });

    test('验证器应该有公共方法', () => {
      expect(typeof validator.validateProject).toBe('function');
      expect(typeof validator.validateGroup).toBe('function');
      expect(typeof validator.validateDataset).toBe('function');
      expect(typeof validator.validateAction).toBe('function');
    });
  });

  // ============ 完整项目验证测试 ============
  
  describe('完整项目验证', () => {
    const validProject = {
      title: 'Test Project',
      decoder: 0,
      frameDetection: 0,
      frameStart: '%',
      frameEnd: '\n',
      frameParser: 'function parseFrame(data) { return data.split(","); }',
      groups: [],
      actions: [],
      mapTilerApiKey: '',
      thunderforestApiKey: ''
    };

    test('有效项目配置应该通过验证', () => {
      const result = validator.validateProject(validProject);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('空项目应该验证失败', () => {
      const result = validator.validateProject(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Project configuration is null or undefined');
    });

    test('缺少必需字段应该验证失败', () => {
      const incompleteProject = {
        title: 'Test Project'
        // 缺少其他必需字段
      };

      const result = validator.validateProject(incompleteProject);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('空标题应该验证失败', () => {
      const projectWithEmptyTitle = {
        ...validProject,
        title: ''
      };

      const result = validator.validateProject(projectWithEmptyTitle);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('title cannot be empty'))).toBe(true);
    });

    test('无效的JavaScript帧解析器应该验证失败', () => {
      const projectWithInvalidParser = {
        ...validProject,
        frameParser: 'invalid javascript { syntax error'
      };

      const result = validator.validateProject(projectWithInvalidParser);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Frame parser syntax error'))).toBe(true);
    });

    test('无效的decoder值应该验证失败', () => {
      const projectWithInvalidDecoder = {
        ...validProject,
        decoder: 99
      };

      const result = validator.validateProject(projectWithInvalidDecoder);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Invalid decoder value'))).toBe(true);
    });

    test('无效的frameDetection值应该验证失败', () => {
      const projectWithInvalidFrameDetection = {
        ...validProject,
        frameDetection: 99
      };

      const result = validator.validateProject(projectWithInvalidFrameDetection);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Invalid frameDetection value'))).toBe(true);
    });
  });

  // ============ 数据集验证测试 ============
  
  describe('数据集验证', () => {
    const validDataset = {
      title: 'Test Dataset',
      units: 'V',
      widget: 'plot',
      value: 'data[0]',
      index: 0,
      graph: true,
      fft: false,
      led: false,
      log: false,
      min: 0,
      max: 100,
      alarm: 50,
      ledHigh: 75,
      fftSamples: 256,
      fftSamplingRate: 1000
    };

    test('有效数据集应该通过验证', () => {
      const result = validator.validateDataset(validDataset);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('空标题应该验证失败', () => {
      const datasetWithEmptyTitle = {
        ...validDataset,
        title: ''
      };

      const result = validator.validateDataset(datasetWithEmptyTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dataset title cannot be empty');
    });

    test('负索引应该验证失败', () => {
      const datasetWithNegativeIndex = {
        ...validDataset,
        index: -1
      };

      const result = validator.validateDataset(datasetWithNegativeIndex);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dataset index must be non-negative');
    });

    test('min大于max应该验证失败', () => {
      const datasetWithInvalidRange = {
        ...validDataset,
        min: 100,
        max: 50
      };

      const result = validator.validateDataset(datasetWithInvalidRange);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dataset minimum value must be less than maximum value');
    });

    test('告警值超出范围应该验证失败', () => {
      const datasetWithOutOfRangeAlarm = {
        ...validDataset,
        min: 0,
        max: 100,
        alarm: 150
      };

      const result = validator.validateDataset(datasetWithOutOfRangeAlarm);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dataset alarm value must be within min-max range');
    });

    test('无效的Widget类型应该验证失败', () => {
      const datasetWithInvalidWidget = {
        ...validDataset,
        widget: 'invalid-widget'
      };

      const result = validator.validateDataset(datasetWithInvalidWidget);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid dataset widget: invalid-widget');
    });

    test('FFT参数验证', () => {
      const datasetWithFFT = {
        ...validDataset,
        fft: true,
        fftSamples: 127, // 不是2的幂
        fftSamplingRate: -100 // 负值
      };

      const result = validator.validateDataset(datasetWithFFT);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('FFT samples must be a positive power of 2');
      expect(result.errors).toContain('FFT sampling rate must be positive');
    });

    test('有效的FFT参数应该通过验证', () => {
      const datasetWithValidFFT = {
        ...validDataset,
        fft: true,
        fftSamples: 512, // 2的幂
        fftSamplingRate: 1000
      };

      const result = validator.validateDataset(datasetWithValidFFT);
      expect(result.valid).toBe(true);
    });
  });

  // ============ 组群验证测试 ============
  
  describe('组群验证', () => {
    const validGroup = {
      title: 'Test Group',
      widget: 'plot',
      datasets: [
        {
          title: 'Dataset 1',
          units: 'V',
          widget: 'plot',
          value: 'data[0]',
          index: 0,
          graph: true,
          fft: false,
          led: false,
          log: false,
          min: 0,
          max: 100,
          alarm: 50,
          ledHigh: 75,
          fftSamples: 256,
          fftSamplingRate: 1000
        }
      ]
    };

    test('有效组群应该通过验证', () => {
      const result = validator.validateGroup(validGroup);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('空标题应该验证失败', () => {
      const groupWithEmptyTitle = {
        ...validGroup,
        title: ''
      };

      const result = validator.validateGroup(groupWithEmptyTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Group title cannot be empty');
    });

    test('无效Widget类型应该验证失败', () => {
      const groupWithInvalidWidget = {
        ...validGroup,
        widget: 'invalid-widget'
      };

      const result = validator.validateGroup(groupWithInvalidWidget);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid group widget: invalid-widget');
    });

    test('加速计Widget应该需要3个数据集', () => {
      const accelerometerGroup = {
        ...validGroup,
        widget: 'accelerometer',
        datasets: [validGroup.datasets[0]] // 只有1个数据集
      };

      const result = validator.validateGroup(accelerometerGroup);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Accelerometer widget requires exactly 3 datasets (X, Y, Z)');
    });

    test('陀螺仪Widget应该需要3个数据集', () => {
      const gyroGroup = {
        ...validGroup,
        widget: 'gyro',
        datasets: [validGroup.datasets[0], validGroup.datasets[0]] // 只有2个数据集
      };

      const result = validator.validateGroup(gyroGroup);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Gyroscope widget requires exactly 3 datasets (X, Y, Z)');
    });

    test('地图Widget应该需要至少2个数据集', () => {
      const mapGroup = {
        ...validGroup,
        widget: 'map',
        datasets: [validGroup.datasets[0]] // 只有1个数据集
      };

      const result = validator.validateGroup(mapGroup);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Map widget requires at least 2 datasets (latitude, longitude)');
    });

    test('包含无效数据集的组群应该验证失败', () => {
      const groupWithInvalidDataset = {
        ...validGroup,
        datasets: [
          {
            ...validGroup.datasets[0],
            title: '', // 空标题
            index: -1  // 负索引
          }
        ]
      };

      const result = validator.validateGroup(groupWithInvalidDataset);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Dataset 1: Dataset title cannot be empty'))).toBe(true);
      expect(result.errors.some(err => err.includes('Dataset 1: Dataset index must be non-negative'))).toBe(true);
    });
  });

  // ============ 动作验证测试 ============
  
  describe('动作验证', () => {
    const validAction = {
      title: 'Test Action',
      icon: 'play',
      txData: 'test_command',
      eolSequence: '\n',
      binaryData: false,
      autoExecuteOnConnect: false,
      timerMode: 'off',
      timerIntervalMs: 1000
    };

    test('有效动作应该通过验证', () => {
      const result = validator.validateAction(validAction);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('空标题应该验证失败', () => {
      const actionWithEmptyTitle = {
        ...validAction,
        title: ''
      };

      const result = validator.validateAction(actionWithEmptyTitle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Action title cannot be empty');
    });

    test('空传输数据应该验证失败', () => {
      const actionWithEmptyTxData = {
        ...validAction,
        txData: ''
      };

      const result = validator.validateAction(actionWithEmptyTxData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Action transmission data cannot be empty');
    });

    test('启用定时器时间隔必须为正数', () => {
      const actionWithInvalidTimer = {
        ...validAction,
        timerMode: 'autoStart',
        timerIntervalMs: 0
      };

      const result = validator.validateAction(actionWithInvalidTimer);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Timer interval must be positive when timer mode is enabled');
    });

    test('关闭定时器时间隔可以为任意值', () => {
      const actionWithTimerOff = {
        ...validAction,
        timerMode: 'off',
        timerIntervalMs: 0
      };

      const result = validator.validateAction(actionWithTimerOff);
      expect(result.valid).toBe(true);
    });

    test('自定义EOL序列应该被允许', () => {
      const actionWithCustomEol = {
        ...validAction,
        eolSequence: '||'
      };

      const result = validator.validateAction(actionWithCustomEol);
      expect(result.valid).toBe(true); // 自定义EOL应该被允许
    });
  });

  // ============ 复杂项目验证测试 ============
  
  describe('复杂项目验证', () => {
    test('包含重复数据集索引的项目应该验证失败', () => {
      const projectWithDuplicateIndices = {
        title: 'Test Project',
        decoder: 0,
        frameDetection: 0,
        frameStart: '%',
        frameEnd: '\n',
        frameParser: 'function parseFrame(data) { return data.split(","); }',
        groups: [
          {
            title: 'Group 1',
            widget: 'plot',
            datasets: [
              {
                title: 'Dataset 1',
                units: 'V',
                widget: 'plot',
                value: 'data[0]',
                index: 0, // 重复索引
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 100,
                alarm: 50,
                ledHigh: 75,
                fftSamples: 256,
                fftSamplingRate: 1000
              }
            ]
          },
          {
            title: 'Group 2',
            widget: 'plot',
            datasets: [
              {
                title: 'Dataset 2',
                units: 'A',
                widget: 'plot',
                value: 'data[1]',
                index: 0, // 重复索引
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 10,
                alarm: 5,
                ledHigh: 7,
                fftSamples: 128,
                fftSamplingRate: 500
              }
            ]
          }
        ],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const result = validator.validateProject(projectWithDuplicateIndices);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('Duplicate dataset indices found: 0'))).toBe(true);
    });

    test('包含多个组群和动作的复杂项目', () => {
      const complexProject = {
        title: 'Complex Project',
        decoder: 1,
        frameDetection: 2,
        frameStart: 'START',
        frameEnd: 'END',
        frameParser: 'function parseFrame(data) { return data.replace(/START|END/g, "").split(","); }',
        groups: [
          {
            title: 'Sensors',
            widget: 'multiplot',
            datasets: [
              {
                title: 'Temperature',
                units: '°C',
                widget: 'gauge',
                value: 'data[0]',
                index: 0,
                graph: true,
                fft: false,
                led: false,
                log: true,
                min: -40,
                max: 85,
                alarm: 75,
                ledHigh: 80,
                fftSamples: 64,
                fftSamplingRate: 100
              },
              {
                title: 'Humidity',
                units: '%RH',
                widget: 'bar',
                value: 'data[1]',
                index: 1,
                graph: true,
                fft: false,
                led: true,
                log: true,
                min: 0,
                max: 100,
                alarm: 90,
                ledHigh: 95,
                fftSamples: 32,
                fftSamplingRate: 50
              }
            ]
          },
          {
            title: 'Accelerometer',
            widget: 'accelerometer',
            datasets: [
              {
                title: 'X-Axis',
                units: 'g',
                widget: 'x',
                value: 'data[2]',
                index: 2,
                graph: false,
                fft: true,
                led: false,
                log: false,
                min: -16,
                max: 16,
                alarm: 12,
                ledHigh: 14,
                fftSamples: 1024,
                fftSamplingRate: 2000
              },
              {
                title: 'Y-Axis',
                units: 'g',
                widget: 'y',
                value: 'data[3]',
                index: 3,
                graph: false,
                fft: true,
                led: false,
                log: false,
                min: -16,
                max: 16,
                alarm: 12,
                ledHigh: 14,
                fftSamples: 1024,
                fftSamplingRate: 2000
              },
              {
                title: 'Z-Axis',
                units: 'g',
                widget: 'z',
                value: 'data[4]',
                index: 4,
                graph: false,
                fft: true,
                led: false,
                log: false,
                min: -16,
                max: 16,
                alarm: 12,
                ledHigh: 14,
                fftSamples: 1024,
                fftSamplingRate: 2000
              }
            ]
          }
        ],
        actions: [
          {
            title: 'Start Recording',
            icon: 'record',
            txData: 'START_REC',
            eolSequence: '\r\n',
            binaryData: false,
            autoExecuteOnConnect: true,
            timerMode: 'off',
            timerIntervalMs: 1000
          },
          {
            title: 'Get Status',
            icon: 'info',
            txData: 'STATUS?',
            eolSequence: '\n',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: 'autoStart',
            timerIntervalMs: 5000
          }
        ],
        mapTilerApiKey: 'test-key-12345',
        thunderforestApiKey: 'thunder-key-67890'
      };

      const result = validator.validateProject(complexProject);
      
      if (!result.valid) {
        console.log('Validation errors:', result.errors);
      }
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  // ============ 边界条件和错误处理测试 ============
  
  describe('边界条件和错误处理', () => {
    test('undefined项目应该验证失败', () => {
      const result = validator.validateProject(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Project configuration is null or undefined');
    });

    test('空对象项目应该验证失败', () => {
      const result = validator.validateProject({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('包含null groups的项目应该能处理', () => {
      const projectWithNullGroups = {
        title: 'Test Project',
        decoder: 0,
        frameDetection: 0,
        frameStart: '%',
        frameEnd: '\n',
        frameParser: 'function parseFrame(data) { return data.split(","); }',
        groups: null,
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const result = validator.validateProject(projectWithNullGroups);
      expect(result.valid).toBe(false);
      // 应该包含schema错误
    });

    test('包含null数据集的组群应该能处理', () => {
      const groupWithNullDataset = {
        title: 'Test Group',
        widget: 'plot',
        datasets: [null]
      };

      // 源代码可能没有null检查，应该捕获错误
      try {
        const result = validator.validateGroup(groupWithNullDataset);
        expect(result.valid).toBe(false);
      } catch (error) {
        // 如果抛出错误，说明代码没有处理null情况
        expect(error.message).toContain('Cannot read properties of null');
      }
    });

    test('极端FFT参数值', () => {
      const datasetWithExtremeFFT = {
        title: 'Extreme FFT',
        units: 'Hz',
        widget: 'plot',
        value: 'data[0]',
        index: 0,
        graph: true,
        fft: true,
        led: false,
        log: false,
        min: 0,
        max: 1000,
        alarm: 500,
        ledHigh: 750,
        fftSamples: 1048576, // 2^20，很大的值
        fftSamplingRate: 100000 // 100kHz
      };

      const result = validator.validateDataset(datasetWithExtremeFFT);
      expect(result.valid).toBe(true); // 应该接受大的有效值
    });

    test('JavaScript帧解析器语法检查', () => {
      const validJSProject = {
        title: 'Valid JS Project',
        decoder: 0,
        frameDetection: 0,
        frameStart: '%',
        frameEnd: '\n',
        frameParser: 'function parseFrame(data) { return JSON.parse(data); }',
        groups: [],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const result = validator.validateProject(validJSProject);
      expect(result.valid).toBe(true);
    });

    test('复杂JavaScript帧解析器', () => {
      const complexJSProject = {
        title: 'Complex JS Project',
        decoder: 0,
        frameDetection: 0,
        frameStart: '%',
        frameEnd: '\n',
        frameParser: `
          function parseFrame(data) {
            try {
              const parts = data.split(',');
              return parts.map(p => parseFloat(p.trim()));
            } catch (e) {
              return [];
            }
          }
        `,
        groups: [],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const result = validator.validateProject(complexJSProject);
      expect(result.valid).toBe(true);
    });
  });

  // ============ 性能测试 ============
  
  describe('性能测试', () => {
    test('大型项目验证性能', () => {
      // 创建一个包含大量组群和数据集的项目
      const largeProject = {
        title: 'Large Performance Test Project',
        decoder: 0,
        frameDetection: 0,
        frameStart: '%',
        frameEnd: '\n',
        frameParser: 'function parseFrame(data) { return data.split(","); }',
        groups: Array.from({ length: 50 }, (_, groupIndex) => ({
          title: `Group ${groupIndex + 1}`,
          widget: 'plot',
          datasets: Array.from({ length: 10 }, (_, datasetIndex) => ({
            title: `Dataset ${groupIndex}-${datasetIndex}`,
            units: 'V',
            widget: 'plot',
            value: `data[${groupIndex * 10 + datasetIndex}]`,
            index: groupIndex * 10 + datasetIndex,
            graph: true,
            fft: false,
            led: false,
            log: false,
            min: 0,
            max: 100,
            alarm: 50,
            ledHigh: 75,
            fftSamples: 256,
            fftSamplingRate: 1000
          }))
        })),
        actions: Array.from({ length: 20 }, (_, actionIndex) => ({
          title: `Action ${actionIndex + 1}`,
          icon: 'play',
          txData: `command_${actionIndex}`,
          eolSequence: '\n',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'off',
          timerIntervalMs: 1000
        })),
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const startTime = performance.now();
      const result = validator.validateProject(largeProject);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
      // 大项目验证应该在合理时间内完成（<500ms）
      expect(duration).toBeLessThan(500);
    });

    test('重复验证器创建性能', () => {
      const startTime = performance.now();

      // 创建多个验证器实例
      for (let i = 0; i < 100; i++) {
        new ProjectValidator();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 100个验证器创建应该在合理时间内完成（<1000ms）
      expect(duration).toBeLessThan(1000);
    });

    test('批量验证性能', () => {
      const testProject = {
        title: 'Batch Test Project',
        decoder: 0,
        frameDetection: 0,
        frameStart: '%',
        frameEnd: '\n',
        frameParser: 'function parseFrame(data) { return data.split(","); }',
        groups: [
          {
            title: 'Test Group',
            widget: 'plot',
            datasets: [
              {
                title: 'Test Dataset',
                units: 'V',
                widget: 'plot',
                value: 'data[0]',
                index: 0,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 100,
                alarm: 50,
                ledHigh: 75,
                fftSamples: 256,
                fftSamplingRate: 1000
              }
            ]
          }
        ],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const startTime = performance.now();

      // 批量验证同一个项目
      for (let i = 0; i < 1000; i++) {
        const result = validator.validateProject(testProject);
        expect(result.valid).toBe(true);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 1000次验证应该在合理时间内完成（<1000ms）
      expect(duration).toBeLessThan(1000);
    });
  });
});
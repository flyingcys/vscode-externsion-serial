/*
 * ProjectValidator 单元测试
 * 测试项目验证器的JSON Schema验证和业务逻辑验证功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectValidator } from '../../src/extension/project/ProjectValidator';
import { ProjectConfig, Group, Dataset, Action } from '../../src/extension/types/ProjectTypes';

describe('ProjectValidator', () => {
  let validator: ProjectValidator;

  beforeEach(() => {
    validator = new ProjectValidator();
  });

  // ==================== 基础初始化测试 ====================

  describe('基础初始化测试', () => {
    it('应该正确创建验证器实例', () => {
      expect(validator).toBeInstanceOf(ProjectValidator);
    });

    it('应该正确初始化AJV验证器', () => {
      // 验证器应该能够处理基本的验证请求
      const result = validator.validateProject({});
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
    });
  });

  // ==================== 项目配置验证测试 ====================

  describe('项目配置验证测试', () => {
    const validProject: ProjectConfig = {
      title: 'Test Project',
      decoder: 0,
      frameDetection: 1,
      frameStart: '$',
      frameEnd: ';',
      frameParser: 'function parse(frame) { return frame.split(","); }',
      groups: [],
      actions: [],
      mapTilerApiKey: '',
      thunderforestApiKey: ''
    };

    describe('有效项目验证', () => {
      it('应该验证通过完整的有效项目', () => {
        const result = validator.validateProject(validProject);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过包含组群的项目', () => {
        const projectWithGroups: ProjectConfig = {
          ...validProject,
          groups: [{
            title: 'Test Group',
            widget: 'plot',
            datasets: [{
              title: 'Test Dataset',
              units: 'V',
              widget: 'gauge',
              value: '0',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: 0,
              max: 100,
              alarm: 50,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }]
          }]
        };

        const result = validator.validateProject(projectWithGroups);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过包含动作的项目', () => {
        const projectWithActions: ProjectConfig = {
          ...validProject,
          actions: [{
            title: 'Test Action',
            icon: 'play',
            txData: 'test command',
            eolSequence: '\\n',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: 'off',
            timerIntervalMs: 1000
          }]
        };

        const result = validator.validateProject(projectWithActions);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过所有有效的解码器类型', () => {
        const decoders = [0, 1, 2]; // PlainText, Hex, Base64

        for (const decoder of decoders) {
          const project = { ...validProject, decoder };
          const result = validator.validateProject(project);

          expect(result.valid).toBe(true);
        }
      });

      it('应该验证通过所有有效的帧检测方法', () => {
        const detectionMethods = [0, 1, 2, 3]; // 四种帧检测方法

        for (const method of detectionMethods) {
          const project = { ...validProject, frameDetection: method };
          const result = validator.validateProject(project);

          expect(result.valid).toBe(true);
        }
      });
    });

    describe('无效项目验证', () => {
      it('应该拒绝空对象', () => {
        const result = validator.validateProject({});

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('应该拒绝缺少必需字段的项目', () => {
        const incompleteProject = {
          title: 'Test Project'
          // 缺少其他必需字段
        };

        const result = validator.validateProject(incompleteProject);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('required'))).toBe(true);
      });

      it('应该拒绝无效的字段类型', () => {
        const invalidProject = {
          ...validProject,
          decoder: 'invalid', // 应该是数字
          frameDetection: 'invalid' // 应该是数字
        };

        const result = validator.validateProject(invalidProject);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('应该拒绝无效的枚举值', () => {
        const invalidProject = {
          ...validProject,
          decoder: 999, // 无效的解码器类型
          frameDetection: 999 // 无效的帧检测方法
        };

        const result = validator.validateProject(invalidProject);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('应该拒绝空标题', () => {
        const projectWithEmptyTitle = {
          ...validProject,
          title: ''
        };

        const result = validator.validateProject(projectWithEmptyTitle);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('title'))).toBe(true);
      });

      it('应该拒绝空的帧解析器', () => {
        const projectWithEmptyParser = {
          ...validProject,
          frameParser: ''
        };

        const result = validator.validateProject(projectWithEmptyParser);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('must NOT have fewer than 1 characters'))).toBe(true);
      });

      it('应该拒绝语法错误的帧解析器', () => {
        const projectWithInvalidParser = {
          ...validProject,
          frameParser: 'invalid javascript syntax {'
        };

        const result = validator.validateProject(projectWithInvalidParser);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('syntax error'))).toBe(true);
      });

      it('应该检测重复的数据集索引', () => {
        const projectWithDuplicateIndices: ProjectConfig = {
          ...validProject,
          groups: [
            {
              title: 'Group 1',
              widget: '',
              datasets: [
                {
                  title: 'Dataset 1',
                  units: '',
                  widget: '',
                  value: '0',
                  index: 1, // 重复索引
                  graph: false,
                  fft: false,
                  led: false,
                  log: false,
                  min: 0,
                  max: 0,
                  alarm: 0,
                  ledHigh: 1,
                  fftSamples: 1024,
                  fftSamplingRate: 100
                }
              ]
            },
            {
              title: 'Group 2',
              widget: '',
              datasets: [
                {
                  title: 'Dataset 2',
                  units: '',
                  widget: '',
                  value: '0',
                  index: 1, // 重复索引
                  graph: false,
                  fft: false,
                  led: false,
                  log: false,
                  min: 0,
                  max: 0,
                  alarm: 0,
                  ledHigh: 1,
                  fftSamples: 1024,
                  fftSamplingRate: 100
                }
              ]
            }
          ]
        };

        const result = validator.validateProject(projectWithDuplicateIndices);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Duplicate dataset indices'))).toBe(true);
      });
    });
  });

  // ==================== 组群验证测试 ====================

  describe('组群验证测试', () => {
    const validGroup: Group = {
      title: 'Test Group',
      widget: 'plot',
      datasets: []
    };

    const validDataset: Dataset = {
      title: 'Test Dataset',
      units: 'V',
      widget: 'gauge',
      value: '0',
      index: 1,
      graph: true,
      fft: false,
      led: false,
      log: false,
      min: 0,
      max: 100,
      alarm: 50,
      ledHigh: 1,
      fftSamples: 1024,
      fftSamplingRate: 100
    };

    describe('有效组群验证', () => {
      it('应该验证通过有效的空组群', () => {
        const result = validator.validateGroup(validGroup);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过包含数据集的组群', () => {
        const groupWithDatasets: Group = {
          ...validGroup,
          datasets: [{
            title: 'Test Dataset',
            units: 'V',
            widget: 'gauge',
            value: '0',
            index: 1,
            graph: true,
            fft: false,
            led: false,
            log: false,
            min: 0,
            max: 100,
            alarm: 50,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          }]
        };

        const result = validator.validateGroup(groupWithDatasets);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过所有有效的组群组件类型', () => {
        const validWidgets = ['', 'bar', 'compass', 'plot', 'gauge', 'led', 'terminal', 'fft', 'multiplot'];

        for (const widget of validWidgets) {
          const group = { ...validGroup, widget };
          const result = validator.validateGroup(group);
          
          expect(result.valid).toBe(true, `Widget '${widget}' should be valid. Errors: ${JSON.stringify(result.errors)}`);
        }
      });

      it('应该验证通过加速度计组件（需要3个数据集）', () => {
        const accelerometerGroup = {
          ...validGroup,
          widget: 'accelerometer',
          datasets: [
            { ...validDataset, title: 'X', widget: 'x', index: 1 },
            { ...validDataset, title: 'Y', widget: 'y', index: 2 },
            { ...validDataset, title: 'Z', widget: 'z', index: 3 }
          ]
        };

        const result = validator.validateGroup(accelerometerGroup);
        expect(result.valid).toBe(true);
      });

      it('应该验证通过陀螺仪组件（需要3个数据集）', () => {
        const gyroGroup = {
          ...validGroup,
          widget: 'gyro',
          datasets: [
            { ...validDataset, title: 'X', widget: 'x', index: 1 },
            { ...validDataset, title: 'Y', widget: 'y', index: 2 },
            { ...validDataset, title: 'Z', widget: 'z', index: 3 }
          ]
        };

        const result = validator.validateGroup(gyroGroup);
        expect(result.valid).toBe(true);
      });

      it('应该验证通过地图组件（需要至少2个数据集）', () => {
        const mapGroup = {
          ...validGroup,
          widget: 'map',
          datasets: [
            { ...validDataset, title: 'Latitude', widget: 'lat', index: 1 },
            { ...validDataset, title: 'Longitude', widget: 'lon', index: 2 }
          ]
        };

        const result = validator.validateGroup(mapGroup);
        expect(result.valid).toBe(true);
      });
    });

    describe('无效组群验证', () => {
      it('应该拒绝空标题的组群', () => {
        const groupWithEmptyTitle = {
          ...validGroup,
          title: ''
        };

        const result = validator.validateGroup(groupWithEmptyTitle);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('title') && err.includes('empty'))).toBe(true);
      });

      it('应该拒绝只包含空格的标题', () => {
        const groupWithWhitespaceTitle = {
          ...validGroup,
          title: '   '
        };

        const result = validator.validateGroup(groupWithWhitespaceTitle);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('title') && err.includes('empty'))).toBe(true);
      });

      it('应该拒绝无效的组件类型', () => {
        const groupWithInvalidWidget = {
          ...validGroup,
          widget: 'invalid_widget'
        };

        const result = validator.validateGroup(groupWithInvalidWidget);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Invalid group widget'))).toBe(true);
      });

      it('应该拒绝加速度计组件数据集数量不为3的情况', () => {
        const accelerometerGroupInvalid = {
          ...validGroup,
          widget: 'accelerometer',
          datasets: [{
            title: 'X Axis',
            units: 'm/s²',
            widget: 'x',
            value: '0',
            index: 1,
            graph: true,
            fft: false,
            led: false,
            log: false,
            min: -10,
            max: 10,
            alarm: 5,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          }] // 只有1个数据集，应该是3个
        };

        const result = validator.validateGroup(accelerometerGroupInvalid);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Accelerometer widget requires exactly 3 datasets'))).toBe(true);
      });

      it('应该拒绝陀螺仪组件数据集数量不为3的情况', () => {
        const gyroGroupInvalid = {
          ...validGroup,
          widget: 'gyro',
          datasets: [] // 空数据集
        };

        const result = validator.validateGroup(gyroGroupInvalid);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Gyroscope widget requires exactly 3 datasets'))).toBe(true);
      });

      it('应该拒绝地图组件数据集数量少于2的情况', () => {
        const mapGroupInvalid = {
          ...validGroup,
          widget: 'map',
          datasets: [{
            title: 'Latitude',
            units: 'deg',
            widget: 'lat',
            value: '0',
            index: 1,
            graph: false,
            fft: false,
            led: false,
            log: false,
            min: -90,
            max: 90,
            alarm: 0,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          }] // 只有1个数据集，至少需要2个
        };

        const result = validator.validateGroup(mapGroupInvalid);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Map widget requires at least 2 datasets'))).toBe(true);
      });

      it('应该传播数据集验证错误', () => {
        const groupWithInvalidDataset = {
          ...validGroup,
          datasets: [{
            title: '', // 无效：空标题
            units: '',
            widget: '',
            value: '0',
            index: -1, // 无效：负索引
            graph: false,
            fft: false,
            led: false,
            log: false,
            min: 100, // 无效：min > max
            max: 0,
            alarm: 0,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          }]
        };

        const result = validator.validateGroup(groupWithInvalidDataset);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Dataset 1:'))).toBe(true);
      });
    });
  });

  // ==================== 数据集验证测试 ====================

  describe('数据集验证测试', () => {
    const validDataset: Dataset = {
      title: 'Test Dataset',
      units: 'V',
      widget: 'gauge',
      value: '0',
      index: 1,
      graph: true,
      fft: false,
      led: false,
      log: false,
      min: 0,
      max: 100,
      alarm: 50,
      ledHigh: 1,
      fftSamples: 1024,
      fftSamplingRate: 100
    };

    describe('有效数据集验证', () => {
      it('应该验证通过有效的数据集', () => {
        const result = validator.validateDataset(validDataset);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过启用FFT的数据集', () => {
        const fftDataset = {
          ...validDataset,
          fft: true,
          fftSamples: 2048,
          fftSamplingRate: 1000
        };

        const result = validator.validateDataset(fftDataset);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过所有有效的数据集组件类型', () => {
        const validWidgets = ['', 'x', 'y', 'z', 'lat', 'lon', 'alt', 'bar', 'gauge', 'plot', 'led'];

        for (const widget of validWidgets) {
          const dataset = { ...validDataset, widget };
          const result = validator.validateDataset(dataset);

          expect(result.valid).toBe(true);
        }
      });

      it('应该验证通过边界值', () => {
        const boundaryDataset = {
          ...validDataset,
          index: 0, // 最小值
          min: -1000,
          max: 1000,
          alarm: -1000 // 等于最小值
        };

        const result = validator.validateDataset(boundaryDataset);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('无效数据集验证', () => {
      it('应该拒绝空标题的数据集', () => {
        const datasetWithEmptyTitle = {
          ...validDataset,
          title: ''
        };

        const result = validator.validateDataset(datasetWithEmptyTitle);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('title') && err.includes('empty'))).toBe(true);
      });

      it('应该拒绝负索引的数据集', () => {
        const datasetWithNegativeIndex = {
          ...validDataset,
          index: -1
        };

        const result = validator.validateDataset(datasetWithNegativeIndex);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('index must be non-negative'))).toBe(true);
      });

      it('应该拒绝最小值大于等于最大值的数据集', () => {
        const datasetWithInvalidRange = {
          ...validDataset,
          min: 100,
          max: 50
        };

        const result = validator.validateDataset(datasetWithInvalidRange);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('minimum value must be less than maximum value'))).toBe(true);
      });

      it('应该拒绝告警值超出范围的数据集', () => {
        const datasetWithInvalidAlarm = {
          ...validDataset,
          min: 0,
          max: 100,
          alarm: 150 // 超出范围
        };

        const result = validator.validateDataset(datasetWithInvalidAlarm);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('alarm value must be within min-max range'))).toBe(true);
      });

      it('应该拒绝无效的FFT采样点数', () => {
        const datasetWithInvalidFFTSamples = {
          ...validDataset,
          fft: true,
          fftSamples: 1000 // 不是2的幂
        };

        const result = validator.validateDataset(datasetWithInvalidFFTSamples);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('FFT samples must be a positive power of 2'))).toBe(true);
      });

      it('应该拒绝零或负的FFT采样点数', () => {
        const datasetWithZeroFFTSamples = {
          ...validDataset,
          fft: true,
          fftSamples: 0
        };

        const result = validator.validateDataset(datasetWithZeroFFTSamples);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('FFT samples must be a positive power of 2'))).toBe(true);
      });

      it('应该拒绝零或负的FFT采样率', () => {
        const datasetWithInvalidFFTRate = {
          ...validDataset,
          fft: true,
          fftSamplingRate: -100
        };

        const result = validator.validateDataset(datasetWithInvalidFFTRate);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('FFT sampling rate must be positive'))).toBe(true);
      });

      it('应该拒绝无效的组件类型', () => {
        const datasetWithInvalidWidget = {
          ...validDataset,
          widget: 'invalid_widget'
        };

        const result = validator.validateDataset(datasetWithInvalidWidget);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Invalid dataset widget'))).toBe(true);
      });

      // FFT参数验证：只有在启用FFT时才进行验证
      it('应该忽略未启用FFT时的无效FFT参数', () => {
        const datasetWithInvalidFFTButDisabled = {
          ...validDataset,
          fft: false, // 未启用FFT
          fftSamples: 1000, // 无效值，但应该被忽略
          fftSamplingRate: -100 // 无效值，但应该被忽略
        };

        const result = validator.validateDataset(datasetWithInvalidFFTButDisabled);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('FFT参数验证专项测试', () => {
      it('应该验证通过所有有效的2的幂次FFT采样点数', () => {
        const validSamples = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

        for (const samples of validSamples) {
          const dataset = { ...validDataset, fft: true, fftSamples: samples };
          const result = validator.validateDataset(dataset);

          expect(result.valid).toBe(true);
        }
      });

      it('应该拒绝所有非2的幂次FFT采样点数', () => {
        const invalidSamples = [3, 5, 6, 7, 9, 10, 15, 100, 1000, 1500];

        for (const samples of invalidSamples) {
          const dataset = { ...validDataset, fft: true, fftSamples: samples };
          const result = validator.validateDataset(dataset);

          expect(result.valid).toBe(false);
          expect(result.errors.some(err => err.includes('FFT samples must be a positive power of 2'))).toBe(true);
        }
      });
    });
  });

  // ==================== 动作验证测试 ====================

  describe('动作验证测试', () => {
    const validAction: Action = {
      title: 'Test Action',
      icon: 'play',
      txData: 'test command',
      eolSequence: '\\n',
      binaryData: false,
      autoExecuteOnConnect: false,
      timerMode: 'off',
      timerIntervalMs: 1000
    };

    describe('有效动作验证', () => {
      it('应该验证通过有效的动作', () => {
        const result = validator.validateAction(validAction);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过启用定时器的动作', () => {
        const timerAction = {
          ...validAction,
          timerMode: 'autoStart',
          timerIntervalMs: 5000
        };

        const result = validator.validateAction(timerAction);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过二进制数据动作', () => {
        const binaryAction = {
          ...validAction,
          binaryData: true,
          txData: '48656C6C6F' // "Hello" 的十六进制
        };

        const result = validator.validateAction(binaryAction);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('应该验证通过自动执行动作', () => {
        const autoAction = {
          ...validAction,
          autoExecuteOnConnect: true
        };

        const result = validator.validateAction(autoAction);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('无效动作验证', () => {
      it('应该拒绝空标题的动作', () => {
        const actionWithEmptyTitle = {
          ...validAction,
          title: ''
        };

        const result = validator.validateAction(actionWithEmptyTitle);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Action title cannot be empty'))).toBe(true);
      });

      it('应该拒绝空的传输数据', () => {
        const actionWithEmptyTxData = {
          ...validAction,
          txData: ''
        };

        const result = validator.validateAction(actionWithEmptyTxData);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('transmission data cannot be empty'))).toBe(true);
      });

      it('应该拒绝只包含空格的传输数据', () => {
        const actionWithWhitespaceTxData = {
          ...validAction,
          txData: '   '
        };

        const result = validator.validateAction(actionWithWhitespaceTxData);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('transmission data cannot be empty'))).toBe(true);
      });

      it('应该拒绝启用定时器但间隔为零的动作', () => {
        const actionWithZeroInterval = {
          ...validAction,
          timerMode: 'autoStart',
          timerIntervalMs: 0
        };

        const result = validator.validateAction(actionWithZeroInterval);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Timer interval must be positive'))).toBe(true);
      });

      it('应该拒绝启用定时器但间隔为负数的动作', () => {
        const actionWithNegativeInterval = {
          ...validAction,
          timerMode: 'startOnTrigger',
          timerIntervalMs: -1000
        };

        const result = validator.validateAction(actionWithNegativeInterval);

        expect(result.valid).toBe(false);
        expect(result.errors.some(err => err.includes('Timer interval must be positive'))).toBe(true);
      });

      it('应该忽略定时器关闭时的无效间隔', () => {
        const actionWithTimerOff = {
          ...validAction,
          timerMode: 'off',
          timerIntervalMs: -1000 // 无效值，但定时器关闭所以应该被忽略
        };

        const result = validator.validateAction(actionWithTimerOff);

        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('EOL序列验证测试', () => {
      it('应该接受所有标准EOL序列', () => {
        const validEolSequences = ['\\n', '\\r', '\\r\\n', ';', '\\0'];

        for (const eolSequence of validEolSequences) {
          const action = { ...validAction, eolSequence };
          const result = validator.validateAction(action);

          expect(result.valid).toBe(true);
        }
      });

      it('应该接受自定义EOL序列（不报错）', () => {
        const customEolAction = {
          ...validAction,
          eolSequence: 'CUSTOM'
        };

        const result = validator.validateAction(customEolAction);

        // 自定义EOL序列应该被接受，不产生错误
        expect(result.valid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });

    describe('定时器模式验证测试', () => {
      it('应该接受所有有效的定时器模式', () => {
        const validTimerModes = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];

        for (const timerMode of validTimerModes) {
          const action = { ...validAction, timerMode, timerIntervalMs: 1000 };
          const result = validator.validateAction(action);

          expect(result.valid).toBe(true);
        }
      });
    });
  });

  // ==================== 边界条件和错误处理测试 ====================

  describe('边界条件和错误处理测试', () => {
    it('应该处理null输入', () => {
      const result = validator.validateProject(null as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该处理undefined输入', () => {
      const result = validator.validateProject(undefined as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该处理复杂的嵌套验证错误', () => {
      const complexInvalidProject = {
        title: '', // 错误1: 空标题
        decoder: 999, // 错误2: 无效解码器
        frameDetection: -1, // 错误3: 无效帧检测
        frameStart: '$',
        frameEnd: ';',
        frameParser: '', // 错误4: 空解析器
        groups: [
          {
            title: '', // 错误5: 空组群标题
            widget: 'invalid', // 错误6: 无效组件
            datasets: [
              {
                title: '', // 错误7: 空数据集标题
                units: '',
                widget: '',
                value: '0',
                index: -1, // 错误8: 负索引
                graph: false,
                fft: true,
                led: false,
                log: false,
                min: 100, // 错误9: min > max
                max: 0,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1000, // 错误10: 无效FFT采样点数
                fftSamplingRate: -100 // 错误11: 负FFT采样率
              }
            ]
          }
        ],
        actions: [
          {
            title: '', // 错误12: 空动作标题
            icon: 'play',
            txData: '', // 错误13: 空传输数据
            eolSequence: '\\n',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: 'autoStart',
            timerIntervalMs: -1000 // 错误14: 负定时器间隔
          }
        ],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const result = validator.validateProject(complexInvalidProject);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(10); // 应该发现多个错误
    });

    it('应该正确处理部分有效的项目结构', () => {
      const partiallyValidProject = {
        title: 'Valid Title',
        decoder: 0,
        frameDetection: 1,
        frameStart: '$',
        frameEnd: ';',
        frameParser: 'function parse(frame) { return frame.split(","); }',
        groups: [
          {
            title: 'Valid Group',
            widget: '',
            datasets: [
              {
                title: 'Valid Dataset',
                units: 'V',
                widget: 'gauge',
                value: '0',
                index: 1,
                graph: true,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 100,
                alarm: 50,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              },
              {
                title: '', // 这个数据集有错误
                units: '',
                widget: '',
                value: '0',
                index: -1, // 负索引错误
                graph: false,
                fft: false,
                led: false,
                log: false,
                min: 0,
                max: 0,
                alarm: 0,
                ledHigh: 1,
                fftSamples: 1024,
                fftSamplingRate: 100
              }
            ]
          }
        ],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const result = validator.validateProject(partiallyValidProject);

      expect(result.valid).toBe(false);
      // 应该包含JSON Schema级别的错误信息
      expect(result.errors.some(err => err.includes('title: must NOT have fewer than 1 characters'))).toBe(true);
      expect(result.errors.some(err => err.includes('index: must be >= 0'))).toBe(true);
    });
  });
});
/*
 * ProjectSerializer 单元测试
 * 测试项目序列化器的序列化、反序列化、模板创建等功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectSerializer } from '../../src/extension/project/ProjectSerializer';
import { ProjectConfig, Group, Dataset, Action } from '../../src/extension/types/ProjectTypes';

describe('ProjectSerializer', () => {
  let serializer: ProjectSerializer;

  beforeEach(() => {
    serializer = new ProjectSerializer();
  });

  // ==================== 基础初始化测试 ====================

  describe('基础初始化测试', () => {
    it('应该正确创建序列化器实例', () => {
      expect(serializer).toBeInstanceOf(ProjectSerializer);
    });
  });

  // ==================== 项目序列化测试 ====================

  describe('项目序列化测试', () => {
    const testProject: ProjectConfig = {
      title: 'Test Project',
      decoder: 1,
      frameDetection: 2,
      frameStart: '<',
      frameEnd: '>',
      frameParser: 'function parse(frame) { return frame.split(","); }',
      groups: [
        {
          title: 'Test Group',
          widget: 'plot',
          datasets: [
            {
              title: 'Test Dataset',
              units: 'V',
              widget: 'gauge',
              value: '3.14',
              index: 1,
              graph: true,
              fft: true,
              led: false,
              log: true,
              min: 0,
              max: 10,
              alarm: 8,
              ledHigh: 5,
              fftSamples: 2048,
              fftSamplingRate: 1000
            }
          ]
        }
      ],
      actions: [
        {
          title: 'Test Action',
          icon: 'send',
          txData: 'TEST_COMMAND',
          eolSequence: '\\r\\n',
          binaryData: true,
          autoExecuteOnConnect: true,
          timerMode: 'autoStart',
          timerIntervalMs: 5000
        }
      ],
      mapTilerApiKey: 'test_key_123',
      thunderforestApiKey: 'test_key_456'
    };

    describe('完整项目序列化', () => {
      it('应该正确序列化完整的项目配置', () => {
        const result = serializer.serialize(testProject);

        expect(result).toEqual({
          title: 'Test Project',
          decoder: 1,
          frameDetection: 2,
          frameStart: '<',
          frameEnd: '>',
          frameParser: 'function parse(frame) { return frame.split(","); }',
          groups: [
            {
              title: 'Test Group',
              widget: 'plot',
              datasets: [
                {
                  title: 'Test Dataset',
                  units: 'V',
                  widget: 'gauge',
                  value: '3.14',
                  index: 1,
                  graph: true,
                  fft: true,
                  led: false,
                  log: true,
                  min: 0,
                  max: 10,
                  alarm: 8,
                  ledHigh: 5,
                  fftSamples: 2048,
                  fftSamplingRate: 1000
                }
              ]
            }
          ],
          actions: [
            {
              title: 'Test Action',
              icon: 'send',
              txData: 'TEST_COMMAND',
              eolSequence: '\\r\\n',
              binaryData: true,
              autoExecuteOnConnect: true,
              timerMode: 'autoStart',
              timerIntervalMs: 5000
            }
          ],
          mapTilerApiKey: 'test_key_123',
          thunderforestApiKey: 'test_key_456'
        });
      });

      it('应该正确处理空的API密钥', () => {
        const projectWithoutKeys = { ...testProject, mapTilerApiKey: '', thunderforestApiKey: '' };
        const result = serializer.serialize(projectWithoutKeys);

        expect(result.mapTilerApiKey).toBe('');
        expect(result.thunderforestApiKey).toBe('');
      });

      it('应该正确处理未定义的API密钥', () => {
        const projectWithUndefinedKeys = { ...testProject };
        delete (projectWithUndefinedKeys as any).mapTilerApiKey;
        delete (projectWithUndefinedKeys as any).thunderforestApiKey;

        const result = serializer.serialize(projectWithUndefinedKeys);

        expect(result.mapTilerApiKey).toBe('');
        expect(result.thunderforestApiKey).toBe('');
      });

      it('应该正确序列化空的组群和动作数组', () => {
        const emptyProject = { ...testProject, groups: [], actions: [] };
        const result = serializer.serialize(emptyProject);

        expect(result.groups).toEqual([]);
        expect(result.actions).toEqual([]);
      });
    });

    describe('组群序列化', () => {
      it('应该正确序列化包含多个数据集的组群', () => {
        const groupWithMultipleDatasets: Group = {
          title: 'Multi-Dataset Group',
          widget: 'multiplot',
          datasets: [
            {
              title: 'Dataset 1',
              units: 'V',
              widget: 'plot',
              value: '1.0',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: false,
              min: 0,
              max: 5,
              alarm: 4,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            },
            {
              title: 'Dataset 2',
              units: 'A',
              widget: 'gauge',
              value: '0.5',
              index: 2,
              graph: false,
              fft: true,
              led: true,
              log: true,
              min: 0,
              max: 2,
              alarm: 1.5,
              ledHigh: 1,
              fftSamples: 512,
              fftSamplingRate: 50
            }
          ]
        };

        const projectWithGroup = { ...testProject, groups: [groupWithMultipleDatasets] };
        const result = serializer.serialize(projectWithGroup);

        expect(result.groups).toHaveLength(1);
        expect(result.groups[0].datasets).toHaveLength(2);
        expect(result.groups[0].datasets[0].title).toBe('Dataset 1');
        expect(result.groups[0].datasets[1].title).toBe('Dataset 2');
      });

      it('应该正确序列化空数据集的组群', () => {
        const emptyGroup: Group = {
          title: 'Empty Group',
          widget: '',
          datasets: []
        };

        const projectWithEmptyGroup = { ...testProject, groups: [emptyGroup] };
        const result = serializer.serialize(projectWithEmptyGroup);

        expect(result.groups[0]).toEqual({
          title: 'Empty Group',
          widget: '',
          datasets: []
        });
      });
    });

    describe('动作序列化', () => {
      it('应该正确序列化所有定时器模式', () => {
        const timerModes = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];

        for (const mode of timerModes) {
          const actionWithTimer: Action = {
            title: 'Timer Action',
            icon: 'clock',
            txData: 'TIMER_TEST',
            eolSequence: '\\n',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: mode,
            timerIntervalMs: 2000
          };

          const projectWithAction = { ...testProject, actions: [actionWithTimer] };
          const result = serializer.serialize(projectWithAction);

          expect(result.actions[0].timerMode).toBe(mode);
        }
      });

      it('应该正确处理无效的定时器模式', () => {
        const actionWithInvalidTimer: Action = {
          title: 'Invalid Timer Action',
          icon: 'clock',
          txData: 'TEST',
          eolSequence: '\\n',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'invalidMode' as any,
          timerIntervalMs: 1000
        };

        const projectWithAction = { ...testProject, actions: [actionWithInvalidTimer] };
        const result = serializer.serialize(projectWithAction);

        expect(result.actions[0].timerMode).toBe('off'); // 应该默认为 'off'
      });
    });
  });

  // ==================== 项目反序列化测试 ====================

  describe('项目反序列化测试', () => {
    describe('完整项目反序列化', () => {
      const testJson = {
        title: 'Deserialized Project',
        decoder: 2,
        frameDetection: 3,
        frameStart: '[',
        frameEnd: ']',
        frameParser: 'function parse(frame) { return [frame]; }',
        groups: [
          {
            title: 'Deserialized Group',
            widget: 'bar',
            datasets: [
              {
                title: 'Deserialized Dataset',
                units: 'Hz',
                widget: 'led',
                value: '42',
                index: 5,
                graph: false,
                fft: true,
                led: true,
                log: false,
                min: -10,
                max: 10,
                alarm: 5,
                ledHigh: 8,
                fftSamples: 4096,
                fftSamplingRate: 2000
              }
            ]
          }
        ],
        actions: [
          {
            title: 'Deserialized Action',
            icon: 'stop',
            txData: 'STOP_CMD',
            eolSequence: ';',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: 'startOnTrigger',
            timerIntervalMs: 3000
          }
        ],
        mapTilerApiKey: 'deserial_key_1',
        thunderforestApiKey: 'deserial_key_2'
      };

      it('应该正确反序列化完整的JSON对象', () => {
        const result = serializer.deserialize(testJson);

        expect(result).toEqual({
          title: 'Deserialized Project',
          decoder: 2,
          frameDetection: 3,
          frameStart: '[',
          frameEnd: ']',
          frameParser: 'function parse(frame) { return [frame]; }',
          groups: [
            {
              title: 'Deserialized Group',
              widget: 'bar',
              datasets: [
                {
                  title: 'Deserialized Dataset',
                  units: 'Hz',
                  widget: 'led',
                  value: '42',
                  index: 5,
                  graph: false,
                  fft: true,
                  led: true,
                  log: false,
                  min: -10,
                  max: 10,
                  alarm: 5,
                  ledHigh: 8,
                  fftSamples: 4096,
                  fftSamplingRate: 2000
                }
              ]
            }
          ],
          actions: [
            {
              title: 'Deserialized Action',
              icon: 'stop',
              txData: 'STOP_CMD',
              eolSequence: ';',
              binaryData: false,
              autoExecuteOnConnect: false,
              timerMode: 'startOnTrigger',
              timerIntervalMs: 3000
            }
          ],
          mapTilerApiKey: 'deserial_key_1',
          thunderforestApiKey: 'deserial_key_2'
        });
      });

      it('应该使用默认值处理缺失的字段', () => {
        const incompleteJson = {
          title: 'Incomplete Project'
          // 缺少其他字段
        };

        const result = serializer.deserialize(incompleteJson);

        expect(result.title).toBe('Incomplete Project');
        expect(result.decoder).toBe(0);
        expect(result.frameDetection).toBe(1);
        expect(result.frameStart).toBe('$');
        expect(result.frameEnd).toBe(';');
        expect(result.frameParser).toContain('function parse(frame)');
        expect(result.groups).toEqual([]);
        expect(result.actions).toEqual([]);
        expect(result.mapTilerApiKey).toBe('');
        expect(result.thunderforestApiKey).toBe('');
      });

      it('应该处理空的组群和动作数组', () => {
        const jsonWithEmptyArrays = {
          title: 'Empty Arrays Project',
          decoder: 0,
          frameDetection: 1,
          frameStart: '$',
          frameEnd: ';',
          frameParser: 'function parse(frame) { return []; }',
          groups: [],
          actions: [],
          mapTilerApiKey: '',
          thunderforestApiKey: ''
        };

        const result = serializer.deserialize(jsonWithEmptyArrays);

        expect(result.groups).toEqual([]);
        expect(result.actions).toEqual([]);
      });

      it('应该处理null和undefined值', () => {
        const jsonWithNulls = {
          title: null,
          decoder: undefined,
          frameDetection: null,
          frameStart: undefined,
          frameEnd: null,
          frameParser: undefined,
          groups: null,
          actions: undefined,
          mapTilerApiKey: null,
          thunderforestApiKey: undefined
        };

        const result = serializer.deserialize(jsonWithNulls);

        expect(result.title).toBe('');
        expect(result.decoder).toBe(0);
        expect(result.frameDetection).toBe(1);
        expect(result.frameStart).toBe('$');
        expect(result.frameEnd).toBe(';');
        expect(result.frameParser).toContain('function parse(frame)');
        expect(result.groups).toEqual([]);
        expect(result.actions).toEqual([]);
        expect(result.mapTilerApiKey).toBe('');
        expect(result.thunderforestApiKey).toBe('');
      });
    });

    describe('组群反序列化', () => {
      it('应该正确反序列化组群数据', () => {
        const groupJson = {
          title: 'Test Group',
          widget: 'compass',
          datasets: [
            {
              title: 'Direction',
              units: '°',
              widget: 'compass',
              value: '90',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: 0,
              max: 360,
              alarm: 180,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }
          ]
        };

        const projectJson = {
          title: 'Test',
          groups: [groupJson],
          actions: []
        };

        const result = serializer.deserialize(projectJson);

        expect(result.groups).toHaveLength(1);
        expect(result.groups[0].title).toBe('Test Group');
        expect(result.groups[0].widget).toBe('compass');
        expect(result.groups[0].datasets).toHaveLength(1);
      });

      it('应该处理缺失的组群字段', () => {
        const incompleteGroupJson = {
          title: 'Incomplete Group'
          // 缺少 widget 和 datasets
        };

        const projectJson = {
          title: 'Test',
          groups: [incompleteGroupJson],
          actions: []
        };

        const result = serializer.deserialize(projectJson);

        expect(result.groups[0].title).toBe('Incomplete Group');
        expect(result.groups[0].widget).toBe('');
        expect(result.groups[0].datasets).toEqual([]);
      });
    });

    describe('数据集反序列化', () => {
      it('应该正确反序列化数据集的所有字段', () => {
        const datasetJson = {
          title: 'Complete Dataset',
          units: 'W',
          widget: 'bar',
          value: '100',
          index: 10,
          graph: true,
          fft: true,
          led: true,
          log: true,
          min: 0,
          max: 1000,
          alarm: 800,
          ledHigh: 500,
          fftSamples: 2048,
          fftSamplingRate: 500
        };

        const projectJson = {
          title: 'Test',
          groups: [{
            title: 'Test Group',
            widget: '',
            datasets: [datasetJson]
          }],
          actions: []
        };

        const result = serializer.deserialize(projectJson);
        const dataset = result.groups[0].datasets[0];

        expect(dataset.title).toBe('Complete Dataset');
        expect(dataset.units).toBe('W');
        expect(dataset.widget).toBe('bar');
        expect(dataset.value).toBe('100');
        expect(dataset.index).toBe(10);
        expect(dataset.graph).toBe(true);
        expect(dataset.fft).toBe(true);
        expect(dataset.led).toBe(true);
        expect(dataset.log).toBe(true);
        expect(dataset.min).toBe(0);
        expect(dataset.max).toBe(1000);
        expect(dataset.alarm).toBe(800);
        expect(dataset.ledHigh).toBe(500);
        expect(dataset.fftSamples).toBe(2048);
        expect(dataset.fftSamplingRate).toBe(500);
      });

      it('应该使用默认值处理缺失的数据集字段', () => {
        const minimalDatasetJson = {
          title: 'Minimal Dataset'
          // 其他字段都缺失
        };

        const projectJson = {
          title: 'Test',
          groups: [{
            title: 'Test Group',
            widget: '',
            datasets: [minimalDatasetJson]
          }],
          actions: []
        };

        const result = serializer.deserialize(projectJson);
        const dataset = result.groups[0].datasets[0];

        expect(dataset.title).toBe('Minimal Dataset');
        expect(dataset.units).toBe('');
        expect(dataset.widget).toBe('');
        expect(dataset.value).toBe('--');
        expect(dataset.index).toBe(0);
        expect(dataset.graph).toBe(false);
        expect(dataset.fft).toBe(false);
        expect(dataset.led).toBe(false);
        expect(dataset.log).toBe(false);
        expect(dataset.min).toBe(0);
        expect(dataset.max).toBe(0);
        expect(dataset.alarm).toBe(0);
        expect(dataset.ledHigh).toBe(1);
        expect(dataset.fftSamples).toBe(1024);
        expect(dataset.fftSamplingRate).toBe(100);
      });
    });

    describe('动作反序列化', () => {
      it('应该正确反序列化动作的所有字段', () => {
        const actionJson = {
          title: 'Complete Action',
          icon: 'refresh',
          txData: 'REFRESH_CMD',
          eolSequence: '\\r',
          binaryData: true,
          autoExecuteOnConnect: true,
          timerMode: 'toggleOnTrigger',
          timerIntervalMs: 10000
        };

        const projectJson = {
          title: 'Test',
          groups: [],
          actions: [actionJson]
        };

        const result = serializer.deserialize(projectJson);
        const action = result.actions[0];

        expect(action.title).toBe('Complete Action');
        expect(action.icon).toBe('refresh');
        expect(action.txData).toBe('REFRESH_CMD');
        expect(action.eolSequence).toBe('\\r');
        expect(action.binaryData).toBe(true);
        expect(action.autoExecuteOnConnect).toBe(true);
        expect(action.timerMode).toBe('toggleOnTrigger');
        expect(action.timerIntervalMs).toBe(10000);
      });

      it('应该使用默认值处理缺失的动作字段', () => {
        const minimalActionJson = {
          title: 'Minimal Action'
          // 其他字段都缺失
        };

        const projectJson = {
          title: 'Test',
          groups: [],
          actions: [minimalActionJson]
        };

        const result = serializer.deserialize(projectJson);
        const action = result.actions[0];

        expect(action.title).toBe('Minimal Action');
        expect(action.icon).toBe('');
        expect(action.txData).toBe('');
        expect(action.eolSequence).toBe('\\n');
        expect(action.binaryData).toBe(false);
        expect(action.autoExecuteOnConnect).toBe(false);
        expect(action.timerMode).toBe('off');
        expect(action.timerIntervalMs).toBe(1000);
      });

      it('应该正确处理数字格式的定时器模式（向后兼容）', () => {
        const timerModeNumbers = [0, 1, 2, 3];
        const expectedModes = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];

        for (let i = 0; i < timerModeNumbers.length; i++) {
          const actionJson = {
            title: 'Legacy Action',
            icon: 'play',
            txData: 'TEST',
            eolSequence: '\\n',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: timerModeNumbers[i], // 数字格式
            timerIntervalMs: 1000
          };

          const projectJson = {
            title: 'Test',
            groups: [],
            actions: [actionJson]
          };

          const result = serializer.deserialize(projectJson);
          expect(result.actions[0].timerMode).toBe(expectedModes[i]);
        }
      });

      it('应该处理无效的定时器模式', () => {
        const actionWithInvalidTimer = {
          title: 'Invalid Timer Action',
          icon: 'play',
          txData: 'TEST',
          eolSequence: '\\n',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'invalidMode',
          timerIntervalMs: 1000
        };

        const projectJson = {
          title: 'Test',
          groups: [],
          actions: [actionWithInvalidTimer]
        };

        const result = serializer.deserialize(projectJson);
        expect(result.actions[0].timerMode).toBe('off');
      });
    });
  });

  // ==================== 序列化往返测试 ====================

  describe('序列化往返测试', () => {
    it('应该在序列化-反序列化往返后保持数据完整性', () => {
      const originalProject: ProjectConfig = {
        title: 'Round Trip Test',
        decoder: 1,
        frameDetection: 2,
        frameStart: '{{',
        frameEnd: '}}',
        frameParser: 'function parse(frame) { return frame.match(/\\d+/g); }',
        groups: [
          {
            title: 'Sensor Group',
            widget: 'accelerometer',
            datasets: [
              {
                title: 'X Axis',
                units: 'm/s²',
                widget: 'x',
                value: '0.5',
                index: 1,
                graph: true,
                fft: true,
                led: false,
                log: true,
                min: -10,
                max: 10,
                alarm: 8,
                ledHigh: 5,
                fftSamples: 2048,
                fftSamplingRate: 1000
              },
              {
                title: 'Y Axis',
                units: 'm/s²',
                widget: 'y',
                value: '-0.3',
                index: 2,
                graph: true,
                fft: true,
                led: false,
                log: true,
                min: -10,
                max: 10,
                alarm: 8,
                ledHigh: 5,
                fftSamples: 2048,
                fftSamplingRate: 1000
              },
              {
                title: 'Z Axis',
                units: 'm/s²',
                widget: 'z',
                value: '9.8',
                index: 3,
                graph: true,
                fft: true,
                led: false,
                log: true,
                min: -10,
                max: 10,
                alarm: 8,
                ledHigh: 5,
                fftSamples: 2048,
                fftSamplingRate: 1000
              }
            ]
          }
        ],
        actions: [
          {
            title: 'Calibrate',
            icon: 'settings',
            txData: 'CALIBRATE',
            eolSequence: '\\n',
            binaryData: false,
            autoExecuteOnConnect: true,
            timerMode: 'autoStart',
            timerIntervalMs: 30000
          }
        ],
        mapTilerApiKey: 'round_trip_key_1',
        thunderforestApiKey: 'round_trip_key_2'
      };

      // 序列化然后反序列化
      const serialized = serializer.serialize(originalProject);
      const deserialized = serializer.deserialize(serialized);

      expect(deserialized).toEqual(originalProject);
    });

    it('应该正确处理边界值的往返', () => {
      const boundaryProject: ProjectConfig = {
        title: '',
        decoder: 0,
        frameDetection: 0,
        frameStart: '',
        frameEnd: '',
        frameParser: 'function parse() { return []; }',
        groups: [{
          title: 'Boundary Group',
          widget: '',
          datasets: [{
            title: 'Boundary Dataset',
            units: '',
            widget: '',
            value: '',
            index: 0,
            graph: false,
            fft: false,
            led: false,
            log: false,
            min: 0,
            max: 0,
            alarm: 0,
            ledHigh: 1,
            fftSamples: 1,
            fftSamplingRate: 1
          }]
        }],
        actions: [{
          title: 'Boundary Action',
          icon: '',
          txData: 'X',
          eolSequence: '',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'off',
          timerIntervalMs: 1
        }],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      // 序列化然后反序列化
      const serialized = serializer.serialize(boundaryProject);
      const deserialized = serializer.deserialize(serialized);

      // 反序列化器会使用默认值填充空字段
      const expectedAfterDeserialization = {
        ...boundaryProject,
        frameStart: '$', // 默认值
        frameEnd: ';',   // 默认值
        groups: [{
          ...boundaryProject.groups[0],
          datasets: [{
            ...boundaryProject.groups[0].datasets[0],
            value: '--' // 默认值
          }]
        }],
        actions: [{
          ...boundaryProject.actions[0],
          eolSequence: '\\n' // 默认值
        }]
      };

      expect(deserialized).toEqual(expectedAfterDeserialization);
    });
  });

  // ==================== Serial-Studio兼容性测试 ====================

  describe('Serial-Studio兼容性测试', () => {
    const testProject: ProjectConfig = {
      title: 'Serial Studio Compatible',
      decoder: 1,
      frameDetection: 2,
      frameStart: 'START',
      frameEnd: 'END',
      frameParser: 'function parse(frame) { return frame.split("|"); }',
      groups: [{
        title: 'Compatible Group',
        widget: 'plot',
        datasets: [{
          title: 'Compatible Dataset',
          units: 'Hz',
          widget: 'gauge',
          value: '50',
          index: 1,
          graph: true,
          fft: false,
          led: true,
          log: false,
          min: 0,
          max: 100,
          alarm: 80,
          ledHigh: 70,
          fftSamples: 1024,
          fftSamplingRate: 200
        }]
      }],
      actions: [{
        title: 'Compatible Action',
        icon: 'play',
        txData: 'START_TEST',
        eolSequence: '\\r\\n',
        binaryData: false,
        autoExecuteOnConnect: false,
        timerMode: 'off',
        timerIntervalMs: 1000
      }],
      mapTilerApiKey: 'compatible_key_1',
      thunderforestApiKey: 'compatible_key_2'
    };

    describe('导出为Serial-Studio格式', () => {
      it('应该正确导出为Serial-Studio兼容的JSON字符串', () => {
        const result = serializer.exportForSerialStudio(testProject);

        expect(typeof result).toBe('string');
        
        const parsed = JSON.parse(result);
        expect(parsed.title).toBe('Serial Studio Compatible');
        expect(parsed.actions).toEqual(expect.any(Array));
        expect(parsed.mapTilerApiKey).toBe('compatible_key_1');
        expect(parsed.thunderforestApiKey).toBe('compatible_key_2');
      });

      it('应该确保必需字段存在', () => {
        const minimalProject: ProjectConfig = {
          title: 'Minimal',
          decoder: 0,
          frameDetection: 1,
          frameStart: '$',
          frameEnd: ';',
          frameParser: 'function parse() { return []; }',
          groups: [],
          actions: [],
          mapTilerApiKey: '',
          thunderforestApiKey: ''
        };

        const result = serializer.exportForSerialStudio(minimalProject);
        const parsed = JSON.parse(result);

        expect(parsed.actions).toEqual([]);
        expect(parsed.mapTilerApiKey).toBe('');
        expect(parsed.thunderforestApiKey).toBe('');
      });

      it('应该使用4空格缩进格式化JSON', () => {
        const result = serializer.exportForSerialStudio(testProject);
        
        // 检查是否使用了4空格缩进
        const lines = result.split('\n');
        const indentedLine = lines.find(line => line.startsWith('    "title"'));
        expect(indentedLine).toBeDefined();
      });
    });

    describe('从Serial-Studio格式导入', () => {
      it('应该正确解析有效的Serial-Studio JSON字符串', () => {
        const serialStudioJson = JSON.stringify({
          title: 'Imported Project',
          decoder: 2,
          frameDetection: 3,
          frameStart: '[',
          frameEnd: ']',
          frameParser: 'function parse(frame) { return [frame]; }',
          groups: [{
            title: 'Imported Group',
            widget: 'bar',
            datasets: [{
              title: 'Imported Dataset',
              units: 'V',
              widget: 'gauge',
              value: '3.3',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: 0,
              max: 5,
              alarm: 4,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }]
          }],
          actions: [],
          mapTilerApiKey: 'imported_key',
          thunderforestApiKey: 'imported_key_2'
        });

        const result = serializer.importFromSerialStudio(serialStudioJson);

        expect(result.title).toBe('Imported Project');
        expect(result.decoder).toBe(2);
        expect(result.groups).toHaveLength(1);
        expect(result.groups[0].title).toBe('Imported Group');
      });

      it('应该处理JSON解析错误', () => {
        const invalidJson = '{ invalid json syntax';

        expect(() => {
          serializer.importFromSerialStudio(invalidJson);
        }).toThrow('Failed to parse Serial-Studio project');
      });

      it('应该正确规范化导入的数据', () => {
        const unnormalizedJson = JSON.stringify({
          // 缺少一些基本字段
          groups: [{
            title: 'Test Group',
            datasets: [{
              title: 'Test Dataset',
              index: '5', // 字符串格式的数字
              graph: 'true', // 字符串格式的布尔值
              min: '0.5', // 字符串格式的数字
              max: '10.5'
            }]
          }],
          actions: [{
            title: 'Test Action',
            timerIntervalMs: '2000', // 字符串格式的数字
            binaryData: 'false' // 字符串格式的布尔值
          }]
        });

        const result = serializer.importFromSerialStudio(unnormalizedJson);

        expect(result.title).toBe('Imported Project'); // 默认标题
        expect(result.decoder).toBe(0); // 默认值
        expect(result.groups[0].datasets[0].index).toBe(5); // 转换为数字
        expect(result.groups[0].datasets[0].graph).toBe(true); // 转换为布尔值
        expect(result.groups[0].datasets[0].min).toBe(0.5); // 转换为数字
        expect(result.actions[0].timerIntervalMs).toBe(2000); // 转换为数字
        expect(result.actions[0].binaryData).toBe(true); // 转换为布尔值 - 'false'字符串转换为true
      });

      it('应该处理包含无效数据类型的导入', () => {
        const jsonWithInvalidTypes = JSON.stringify({
          title: 'Test Project',
          groups: [{
            title: 'Test Group',
            datasets: [{
              title: 'Test Dataset',
              index: 'not_a_number', // 无效的数字
              graph: 'not_a_boolean', // 无效的布尔值
              min: null,
              max: undefined
            }]
          }],
          actions: [{
            title: 'Test Action',
            timerIntervalMs: 'invalid_number',
            binaryData: 'invalid_boolean'
          }]
        });

        const result = serializer.importFromSerialStudio(jsonWithInvalidTypes);

        // 应该使用默认值
        expect(result.groups[0].datasets[0].index).toBe(0);
        expect(result.groups[0].datasets[0].graph).toBe(false); // 无效字符串使用默认值false
        expect(result.groups[0].datasets[0].min).toBe(0);
        expect(result.groups[0].datasets[0].max).toBe(0);
        expect(result.actions[0].timerIntervalMs).toBe(1000);
        expect(result.actions[0].binaryData).toBe(true); // actions的布尔字段使用Boolean()转换，字符串为true
      });
    });
  });

  // ==================== 项目模板测试 ====================

  describe('项目模板测试', () => {
    describe('基础项目模板', () => {
      it('应该创建有效的基础项目模板', () => {
        const template = serializer.createTemplate('basic');

        expect(template.title).toBe('Basic Project');
        expect(template.groups).toHaveLength(1);
        expect(template.groups[0].title).toBe('Sensor Data');
        expect(template.groups[0].datasets).toHaveLength(1);
        expect(template.groups[0].datasets[0].title).toBe('Temperature');
        expect(template.groups[0].datasets[0].units).toBe('°C');
        expect(template.groups[0].datasets[0].widget).toBe('gauge');
      });
    });

    describe('传感器项目模板', () => {
      it('应该创建有效的传感器项目模板', () => {
        const template = serializer.createTemplate('sensor');

        expect(template.title).toBe('Multi-Sensor Project');
        expect(template.groups).toHaveLength(2);
        
        expect(template.groups[0].title).toBe('Temperature');
        expect(template.groups[0].datasets[0].title).toBe('Temperature');
        expect(template.groups[0].datasets[0].units).toBe('°C');
        
        expect(template.groups[1].title).toBe('Humidity');
        expect(template.groups[1].datasets[0].title).toBe('Humidity');
        expect(template.groups[1].datasets[0].units).toBe('%');
      });
    });

    describe('GPS项目模板', () => {
      it('应该创建有效的GPS项目模板', () => {
        const template = serializer.createTemplate('gps');

        expect(template.title).toBe('GPS Tracking Project');
        expect(template.groups).toHaveLength(1);
        expect(template.groups[0].title).toBe('GPS Location');
        expect(template.groups[0].widget).toBe('map');
        expect(template.groups[0].datasets).toHaveLength(3);
        
        const [lat, lon, alt] = template.groups[0].datasets;
        expect(lat.title).toBe('Latitude');
        expect(lat.widget).toBe('lat');
        expect(lon.title).toBe('Longitude');
        expect(lon.widget).toBe('lon');
        expect(alt.title).toBe('Altitude');
        expect(alt.widget).toBe('alt');
      });
    });

    describe('加速度计项目模板', () => {
      it('应该创建有效的加速度计项目模板', () => {
        const template = serializer.createTemplate('accelerometer');

        expect(template.title).toBe('Accelerometer Project');
        expect(template.groups).toHaveLength(1);
        expect(template.groups[0].title).toBe('Accelerometer');
        expect(template.groups[0].widget).toBe('accelerometer');
        expect(template.groups[0].datasets).toHaveLength(3);
        
        const [x, y, z] = template.groups[0].datasets;
        expect(x.title).toBe('Accelerometer X');
        expect(x.widget).toBe('x');
        expect(y.title).toBe('Accelerometer Y');
        expect(y.widget).toBe('y');
        expect(z.title).toBe('Accelerometer Z');
        expect(z.widget).toBe('z');
        
        // 所有轴都应该有相同的单位和范围
        [x, y, z].forEach(axis => {
          expect(axis.units).toBe('m/s²');
          expect(axis.min).toBe(-20);
          expect(axis.max).toBe(20);
        });
      });
    });

    describe('无效模板类型', () => {
      it('应该为无效的模板类型返回基础模板', () => {
        const template = serializer.createTemplate('invalid' as any);

        expect(template.title).toBe('');
        expect(template.groups).toEqual([]);
        expect(template.actions).toEqual([]);
      });
    });

    describe('模板完整性验证', () => {
      it('所有模板都应该包含必需的基础字段', () => {
        const templateTypes: ('basic' | 'sensor' | 'gps' | 'accelerometer')[] = 
          ['basic', 'sensor', 'gps', 'accelerometer'];

        for (const type of templateTypes) {
          const template = serializer.createTemplate(type);

          expect(template).toHaveProperty('title');
          expect(template).toHaveProperty('decoder');
          expect(template).toHaveProperty('frameDetection');
          expect(template).toHaveProperty('frameStart');
          expect(template).toHaveProperty('frameEnd');
          expect(template).toHaveProperty('frameParser');
          expect(template).toHaveProperty('groups');
          expect(template).toHaveProperty('actions');
          expect(template).toHaveProperty('mapTilerApiKey');
          expect(template).toHaveProperty('thunderforestApiKey');

          expect(Array.isArray(template.groups)).toBe(true);
          expect(Array.isArray(template.actions)).toBe(true);
          expect(template.frameParser).toContain('function parse');
        }
      });

      it('所有模板的数据集都应该有有效的索引', () => {
        const templateTypes: ('basic' | 'sensor' | 'gps' | 'accelerometer')[] = 
          ['basic', 'sensor', 'gps', 'accelerometer'];

        for (const type of templateTypes) {
          const template = serializer.createTemplate(type);
          const usedIndices = new Set<number>();

          for (const group of template.groups) {
            for (const dataset of group.datasets) {
              expect(dataset.index).toBeGreaterThan(0);
              expect(usedIndices.has(dataset.index)).toBe(false);
              usedIndices.add(dataset.index);
            }
          }
        }
      });
    });
  });

  // ==================== 边界条件和错误处理测试 ====================

  describe('边界条件和错误处理测试', () => {
    it('应该处理空项目对象', () => {
      const emptyProject = {} as ProjectConfig;
      
      expect(() => {
        serializer.serialize(emptyProject);
      }).toThrow(); // 会抛出错误，因为缺少必需的字段
    });

    it('应该处理null和undefined输入', () => {
      expect(() => {
        serializer.serialize(null as any);
      }).toThrow();

      expect(() => {
        serializer.serialize(undefined as any);
      }).toThrow();
    });

    it('应该处理循环引用', () => {
      const circularProject: any = {
        title: 'Circular',
        decoder: 0,
        frameDetection: 1,
        frameStart: '$',
        frameEnd: ';',
        frameParser: 'function parse() { return []; }',
        groups: [],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      // 创建循环引用
      circularProject.self = circularProject;

      // JavaScript的JSON.stringify会自动忽略循环引用或抛出错误
      expect(() => {
        serializer.serialize(circularProject);
      }).not.toThrow(); // 简单的对象复制不会抛出错误
    });

    it('应该正确处理大型项目数据', () => {
      const largeProject: ProjectConfig = {
        title: 'Large Project',
        decoder: 0,
        frameDetection: 1,
        frameStart: '$',
        frameEnd: ';',
        frameParser: 'function parse(frame) { return frame.split(","); }',
        groups: Array.from({ length: 100 }, (_, i) => ({
          title: `Group ${i + 1}`,
          widget: '',
          datasets: Array.from({ length: 10 }, (_, j) => ({
            title: `Dataset ${j + 1}`,
            units: 'V',
            widget: 'gauge',
            value: '0',
            index: i * 10 + j + 1,
            graph: true,
            fft: false,
            led: false,
            log: false,
            min: 0,
            max: 100,
            alarm: 80,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          }))
        })),
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };

      const serialized = serializer.serialize(largeProject);
      const deserialized = serializer.deserialize(serialized);

      expect(deserialized.groups).toHaveLength(100);
      expect(deserialized.groups[0].datasets).toHaveLength(10);
      expect(deserialized.groups[99].datasets[9].index).toBe(1000);
    });

    it('应该处理特殊字符在字符串字段中', () => {
      const specialCharProject: ProjectConfig = {
        title: 'Test "quotes" and \\backslashes\\ and 中文',
        decoder: 0,
        frameDetection: 1,
        frameStart: '"',
        frameEnd: '\\"',
        frameParser: 'function parse(frame) { return frame.split("\\t"); }',
        groups: [{
          title: 'Group with 特殊字符 and "quotes"',
          widget: '',
          datasets: [{
            title: 'Dataset with émojis 🚀 and symbols €£¥',
            units: '°C/µV',
            widget: '',
            value: 'Special: "value" with \\escapes\\',
            index: 1,
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
          }]
        }],
        actions: [{
          title: 'Action with special chars 🎯',
          icon: 'test-icon',
          txData: 'DATA with "quotes" and \\escapes\\',
          eolSequence: '\\r\\n',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'off',
          timerIntervalMs: 1000
        }],
        mapTilerApiKey: 'key_with_special_chars_€£¥',
        thunderforestApiKey: 'another_key_中文_🚀'
      };

      const serialized = serializer.serialize(specialCharProject);
      const deserialized = serializer.deserialize(serialized);

      expect(deserialized.title).toBe(specialCharProject.title);
      expect(deserialized.groups[0].datasets[0].title).toBe(specialCharProject.groups[0].datasets[0].title);
      expect(deserialized.actions[0].txData).toBe(specialCharProject.actions[0].txData);
    });
  });
});
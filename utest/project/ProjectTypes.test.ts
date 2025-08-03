/*
 * ProjectTypes 单元测试
 * 测试项目类型定义、类型守卫函数和常量枚举
 */

import { describe, it, expect } from 'vitest';
import {
  ProjectConfig,
  Group,
  Dataset,
  Action,
  isValidProjectConfig,
  isValidGroup,
  isValidDataset,
  isValidAction,
  WIDGET_TYPES,
  TIMER_MODES,
  EOL_SEQUENCES,
  FrameDetectionMethod,
  DecoderMethod,
  ProjectViewType,
  EditorWidgetType
} from '../../src/extension/types/ProjectTypes';

describe('ProjectTypes', () => {

  // ==================== 类型守卫函数测试 ====================

  describe('isValidProjectConfig 类型守卫测试', () => {
    const validProject: ProjectConfig = {
      title: 'Valid Project',
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

    describe('有效项目配置', () => {
      it('应该验证通过完整的有效项目配置', () => {
        expect(isValidProjectConfig(validProject)).toBe(true);
      });

      it('应该验证通过包含组群和动作的项目配置', () => {
        const projectWithContent = {
          ...validProject,
          groups: [{
            title: 'Test Group',
            widget: 'plot',
            datasets: []
          }],
          actions: [{
            title: 'Test Action',
            icon: 'play',
            txData: 'TEST',
            eolSequence: '\\n',
            binaryData: false,
            autoExecuteOnConnect: false,
            timerMode: 'off',
            timerIntervalMs: 1000
          }]
        };

        expect(isValidProjectConfig(projectWithContent)).toBe(true);
      });

      it('应该验证通过不同的解码器和帧检测方法', () => {
        const variations = [
          { decoder: 0, frameDetection: 0 },
          { decoder: 1, frameDetection: 1 },
          { decoder: 2, frameDetection: 2 }
        ];

        for (const variation of variations) {
          const project = { ...validProject, ...variation };
          expect(isValidProjectConfig(project)).toBe(true);
        }
      });
    });

    describe('无效项目配置', () => {
      it('应该拒绝null和undefined', () => {
        expect(() => isValidProjectConfig(null)).not.toThrow();
        expect(() => isValidProjectConfig(undefined)).not.toThrow();
        expect(isValidProjectConfig(null)).toBe(false);
        expect(isValidProjectConfig(undefined)).toBe(false);
      });

      it('应该拒绝非对象类型', () => {
        expect(isValidProjectConfig('string')).toBe(false);
        expect(isValidProjectConfig(123)).toBe(false);
        expect(isValidProjectConfig(true)).toBe(false);
        expect(isValidProjectConfig([])).toBe(false);
      });

      it('应该拒绝缺少必需字段的对象', () => {
        const missingTitleProject = { ...validProject };
        delete (missingTitleProject as any).title;
        expect(isValidProjectConfig(missingTitleProject)).toBe(false);

        const missingDecoderProject = { ...validProject };
        delete (missingDecoderProject as any).decoder;
        expect(isValidProjectConfig(missingDecoderProject)).toBe(false);

        const missingGroupsProject = { ...validProject };
        delete (missingGroupsProject as any).groups;
        expect(isValidProjectConfig(missingGroupsProject)).toBe(false);

        const missingActionsProject = { ...validProject };
        delete (missingActionsProject as any).actions;
        expect(isValidProjectConfig(missingActionsProject)).toBe(false);
      });

      it('应该拒绝错误类型的字段', () => {
        const wrongTitleType = { ...validProject, title: 123 };
        expect(isValidProjectConfig(wrongTitleType)).toBe(false);

        const wrongDecoderType = { ...validProject, decoder: 'invalid' };
        expect(isValidProjectConfig(wrongDecoderType)).toBe(false);

        const wrongFrameDetectionType = { ...validProject, frameDetection: 'invalid' };
        expect(isValidProjectConfig(wrongFrameDetectionType)).toBe(false);

        const wrongGroupsType = { ...validProject, groups: 'invalid' };
        expect(isValidProjectConfig(wrongGroupsType)).toBe(false);

        const wrongActionsType = { ...validProject, actions: 'invalid' };
        expect(isValidProjectConfig(wrongActionsType)).toBe(false);
      });

      it('应该接受空字符串标题（类型守卫只检查类型）', () => {
        const emptyTitleProject = { ...validProject, title: '' };
        expect(isValidProjectConfig(emptyTitleProject)).toBe(true);
      });
    });

    describe('边界条件', () => {
      it('应该处理额外的属性', () => {
        const projectWithExtraProps = {
          ...validProject,
          extraProperty: 'should be ignored'
        };
        expect(isValidProjectConfig(projectWithExtraProps)).toBe(true);
      });

      it('应该处理空的组群和动作数组', () => {
        const projectWithEmptyArrays = {
          ...validProject,
          groups: [],
          actions: []
        };
        expect(isValidProjectConfig(projectWithEmptyArrays)).toBe(true);
      });
    });
  });

  describe('isValidGroup 类型守卫测试', () => {
    const validGroup: Group = {
      title: 'Valid Group',
      widget: 'plot',
      datasets: []
    };

    describe('有效组群配置', () => {
      it('应该验证通过有效的空组群', () => {
        expect(isValidGroup(validGroup)).toBe(true);
      });

      it('应该验证通过包含数据集的组群', () => {
        const groupWithDatasets = {
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
            log: false
          }]
        };
        expect(isValidGroup(groupWithDatasets)).toBe(true);
      });

      it('应该验证通过空字符串组件', () => {
        const groupWithEmptyWidget = { ...validGroup, widget: '' };
        expect(isValidGroup(groupWithEmptyWidget)).toBe(true);
      });
    });

    describe('无效组群配置', () => {
      it('应该拒绝null和undefined', () => {
        expect(() => isValidGroup(null)).not.toThrow();
        expect(() => isValidGroup(undefined)).not.toThrow();
        expect(isValidGroup(null)).toBe(false);
        expect(isValidGroup(undefined)).toBe(false);
      });

      it('应该拒绝非对象类型', () => {
        expect(isValidGroup('string')).toBe(false);
        expect(isValidGroup(123)).toBe(false);
        expect(isValidGroup([])).toBe(false);
      });

      it('应该拒绝缺少必需字段的对象', () => {
        const missingTitleGroup = { ...validGroup };
        delete (missingTitleGroup as any).title;
        expect(isValidGroup(missingTitleGroup)).toBe(false);

        const missingWidgetGroup = { ...validGroup };
        delete (missingWidgetGroup as any).widget;
        expect(isValidGroup(missingWidgetGroup)).toBe(false);

        const missingDatasetsGroup = { ...validGroup };
        delete (missingDatasetsGroup as any).datasets;
        expect(isValidGroup(missingDatasetsGroup)).toBe(false);
      });

      it('应该拒绝错误类型的字段', () => {
        const wrongTitleType = { ...validGroup, title: 123 };
        expect(isValidGroup(wrongTitleType)).toBe(false);

        const wrongWidgetType = { ...validGroup, widget: 123 };
        expect(isValidGroup(wrongWidgetType)).toBe(false);

        const wrongDatasetsType = { ...validGroup, datasets: 'invalid' };
        expect(isValidGroup(wrongDatasetsType)).toBe(false);
      });
    });
  });

  describe('isValidDataset 类型守卫测试', () => {
    const validDataset: Dataset = {
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
      max: 10,
      alarm: 5,
      ledHigh: 1,
      fftSamples: 1024,
      fftSamplingRate: 100
    };

    describe('有效数据集配置', () => {
      it('应该验证通过完整的有效数据集', () => {
        expect(isValidDataset(validDataset)).toBe(true);
      });

      it('应该验证通过不同的数据集配置', () => {
        const variations = [
          { graph: false, fft: true, led: true, log: false },
          { graph: true, fft: false, led: false, log: true },
          { graph: false, fft: false, led: false, log: false },
          { graph: true, fft: true, led: true, log: true }
        ];

        for (const variation of variations) {
          const dataset = { ...validDataset, ...variation };
          expect(isValidDataset(dataset)).toBe(true);
        }
      });

      it('应该验证通过零索引数据集', () => {
        const zeroIndexDataset = { ...validDataset, index: 0 };
        expect(isValidDataset(zeroIndexDataset)).toBe(true);
      });

      it('应该验证通过空字符串字段', () => {
        const emptyStringFields = {
          ...validDataset,
          units: '',
          widget: '',
          value: ''
        };
        expect(isValidDataset(emptyStringFields)).toBe(true);
      });
    });

    describe('无效数据集配置', () => {
      it('应该拒绝null和undefined', () => {
        expect(() => isValidDataset(null)).not.toThrow();
        expect(() => isValidDataset(undefined)).not.toThrow();
        expect(isValidDataset(null)).toBe(false);
        expect(isValidDataset(undefined)).toBe(false);
      });

      it('应该拒绝非对象类型', () => {
        expect(isValidDataset('string')).toBe(false);
        expect(isValidDataset(123)).toBe(false);
        expect(isValidDataset([])).toBe(false);
      });

      it('应该拒绝缺少必需字段的对象', () => {
        const requiredFields = ['title', 'units', 'widget', 'value', 'index', 'graph', 'fft', 'led', 'log'];
        
        for (const field of requiredFields) {
          const missingFieldDataset = { ...validDataset };
          delete (missingFieldDataset as any)[field];
          expect(isValidDataset(missingFieldDataset)).toBe(false);
        }
      });

      it('应该拒绝错误类型的字段', () => {
        const wrongTypes = [
          { title: 123 },
          { units: 123 },
          { widget: 123 },
          { value: 123 },
          { index: 'invalid' },
          { graph: 'invalid' },
          { fft: 'invalid' },
          { led: 'invalid' },
          { log: 'invalid' }
        ];

        for (const wrongType of wrongTypes) {
          const invalidDataset = { ...validDataset, ...wrongType };
          expect(isValidDataset(invalidDataset)).toBe(false);
        }
      });
    });
  });

  describe('isValidAction 类型守卫测试', () => {
    const validAction: Action = {
      title: 'Valid Action',
      icon: 'play',
      txData: 'TEST_COMMAND',
      eolSequence: '\\n',
      binaryData: false,
      autoExecuteOnConnect: false,
      timerMode: 'off',
      timerIntervalMs: 1000
    };

    describe('有效动作配置', () => {
      it('应该验证通过完整的有效动作', () => {
        expect(isValidAction(validAction)).toBe(true);
      });

      it('应该验证通过不同的动作配置', () => {
        const variations = [
          { binaryData: true, autoExecuteOnConnect: true },
          { binaryData: false, autoExecuteOnConnect: false },
          { timerMode: 'autoStart', timerIntervalMs: 5000 },
          { timerMode: 'startOnTrigger', timerIntervalMs: 2000 }
        ];

        for (const variation of variations) {
          const action = { ...validAction, ...variation };
          expect(isValidAction(action)).toBe(true);
        }
      });

      it('应该验证通过不同的EOL序列', () => {
        const eolSequences = ['\\n', '\\r', '\\r\\n', ';', '\\0'];
        
        for (const eolSequence of eolSequences) {
          const action = { ...validAction, eolSequence };
          expect(isValidAction(action)).toBe(true);
        }
      });

      it('应该验证通过空字符串字段', () => {
        const emptyStringFields = {
          ...validAction,
          icon: '',
          eolSequence: ''
        };
        expect(isValidAction(emptyStringFields)).toBe(true);
      });
    });

    describe('无效动作配置', () => {
      it('应该拒绝null和undefined', () => {
        expect(() => isValidAction(null)).not.toThrow();
        expect(() => isValidAction(undefined)).not.toThrow();
        expect(isValidAction(null)).toBe(false);
        expect(isValidAction(undefined)).toBe(false);
      });

      it('应该拒绝非对象类型', () => {
        expect(isValidAction('string')).toBe(false);
        expect(isValidAction(123)).toBe(false);
        expect(isValidAction([])).toBe(false);
      });

      it('应该拒绝缺少必需字段的对象', () => {
        const requiredFields = ['title', 'icon', 'txData', 'eolSequence', 'binaryData', 'autoExecuteOnConnect', 'timerMode', 'timerIntervalMs'];
        
        for (const field of requiredFields) {
          const missingFieldAction = { ...validAction };
          delete (missingFieldAction as any)[field];
          expect(isValidAction(missingFieldAction)).toBe(false);
        }
      });

      it('应该拒绝错误类型的字段', () => {
        const wrongTypes = [
          { title: 123 },
          { icon: 123 },
          { txData: 123 },
          { eolSequence: 123 },
          { binaryData: 'invalid' },
          { autoExecuteOnConnect: 'invalid' },
          { timerMode: 123 },
          { timerIntervalMs: 'invalid' }
        ];

        for (const wrongType of wrongTypes) {
          const invalidAction = { ...validAction, ...wrongType };
          expect(isValidAction(invalidAction)).toBe(false);
        }
      });
    });
  });

  // ==================== 常量和枚举测试 ====================

  describe('WIDGET_TYPES 常量测试', () => {
    describe('组群级别组件', () => {
      it('应该定义所有组群级别组件类型', () => {
        expect(WIDGET_TYPES.GROUP.NONE).toBe('');
        expect(WIDGET_TYPES.GROUP.ACCELEROMETER).toBe('accelerometer');
        expect(WIDGET_TYPES.GROUP.GYROSCOPE).toBe('gyro');
        expect(WIDGET_TYPES.GROUP.GPS_MAP).toBe('map');
        expect(WIDGET_TYPES.GROUP.COMPASS).toBe('compass');
      });

      it('应该包含所有预期的组群组件', () => {
        const groupWidgets = Object.values(WIDGET_TYPES.GROUP);
        const expectedWidgets = ['', 'accelerometer', 'gyro', 'map', 'compass'];
        
        expect(groupWidgets).toEqual(expect.arrayContaining(expectedWidgets));
        expect(groupWidgets).toHaveLength(expectedWidgets.length);
      });
    });

    describe('数据集级别组件', () => {
      it('应该定义所有数据集级别组件类型', () => {
        expect(WIDGET_TYPES.DATASET.NONE).toBe('');
        expect(WIDGET_TYPES.DATASET.PLOT).toBe('plot');
        expect(WIDGET_TYPES.DATASET.BAR).toBe('bar');
        expect(WIDGET_TYPES.DATASET.GAUGE).toBe('gauge');
        expect(WIDGET_TYPES.DATASET.LED).toBe('led');
      });

      it('应该定义3D组件轴', () => {
        expect(WIDGET_TYPES.DATASET.X_AXIS).toBe('x');
        expect(WIDGET_TYPES.DATASET.Y_AXIS).toBe('y');
        expect(WIDGET_TYPES.DATASET.Z_AXIS).toBe('z');
      });

      it('应该定义GPS组件', () => {
        expect(WIDGET_TYPES.DATASET.LATITUDE).toBe('lat');
        expect(WIDGET_TYPES.DATASET.LONGITUDE).toBe('lon');
        expect(WIDGET_TYPES.DATASET.ALTITUDE).toBe('alt');
      });

      it('应该包含所有预期的数据集组件', () => {
        const datasetWidgets = Object.values(WIDGET_TYPES.DATASET);
        const expectedWidgets = ['', 'plot', 'bar', 'gauge', 'led', 'x', 'y', 'z', 'lat', 'lon', 'alt'];
        
        expect(datasetWidgets).toEqual(expect.arrayContaining(expectedWidgets));
        expect(datasetWidgets).toHaveLength(expectedWidgets.length);
      });
    });
  });

  describe('TIMER_MODES 常量测试', () => {
    it('应该定义所有定时器模式', () => {
      expect(TIMER_MODES.OFF).toBe('off');
      expect(TIMER_MODES.AUTO_START).toBe('autoStart');
      expect(TIMER_MODES.START_ON_TRIGGER).toBe('startOnTrigger');
      expect(TIMER_MODES.TOGGLE_ON_TRIGGER).toBe('toggleOnTrigger');
    });

    it('应该包含所有预期的定时器模式', () => {
      const timerModes = Object.values(TIMER_MODES);
      const expectedModes = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];
      
      expect(timerModes).toEqual(expect.arrayContaining(expectedModes));
      expect(timerModes).toHaveLength(expectedModes.length);
    });
  });

  describe('EOL_SEQUENCES 常量测试', () => {
    it('应该定义所有EOL序列', () => {
      expect(EOL_SEQUENCES.LF).toBe('\\n');
      expect(EOL_SEQUENCES.CR).toBe('\\r');
      expect(EOL_SEQUENCES.CRLF).toBe('\\r\\n');
      expect(EOL_SEQUENCES.SEMICOLON).toBe(';');
      expect(EOL_SEQUENCES.NULL).toBe('\\0');
    });

    it('应该包含所有预期的EOL序列', () => {
      const eolSequences = Object.values(EOL_SEQUENCES);
      const expectedSequences = ['\\n', '\\r', '\\r\\n', ';', '\\0'];
      
      expect(eolSequences).toEqual(expect.arrayContaining(expectedSequences));
      expect(eolSequences).toHaveLength(expectedSequences.length);
    });
  });

  describe('枚举类型测试', () => {
    describe('FrameDetectionMethod 枚举', () => {
      it('应该定义所有帧检测方法', () => {
        expect(FrameDetectionMethod.NoDelimiters).toBe(0);
        expect(FrameDetectionMethod.EndDelimiterOnly).toBe(1);
        expect(FrameDetectionMethod.StartDelimiterOnly).toBe(2);
        expect(FrameDetectionMethod.StartAndEndDelimiter).toBe(3);
      });

      it('应该按预期顺序排列', () => {
        const methods = [
          FrameDetectionMethod.NoDelimiters,
          FrameDetectionMethod.EndDelimiterOnly,
          FrameDetectionMethod.StartDelimiterOnly,
          FrameDetectionMethod.StartAndEndDelimiter
        ];
        
        expect(methods).toEqual([0, 1, 2, 3]);
      });
    });

    describe('DecoderMethod 枚举', () => {
      it('应该定义所有解码方法', () => {
        expect(DecoderMethod.PlainText).toBe(0);
        expect(DecoderMethod.Hexadecimal).toBe(1);
        expect(DecoderMethod.Base64).toBe(2);
      });

      it('应该按预期顺序排列', () => {
        const methods = [
          DecoderMethod.PlainText,
          DecoderMethod.Hexadecimal,
          DecoderMethod.Base64
        ];
        
        expect(methods).toEqual([0, 1, 2]);
      });
    });

    describe('ProjectViewType 枚举', () => {
      it('应该定义所有项目视图类型', () => {
        expect(ProjectViewType.ProjectView).toBe('project');
        expect(ProjectViewType.GroupView).toBe('group');
        expect(ProjectViewType.DatasetView).toBe('dataset');
        expect(ProjectViewType.ActionView).toBe('action');
        expect(ProjectViewType.FrameParserView).toBe('frameParser');
      });

      it('应该包含所有预期的视图类型', () => {
        const viewTypes = Object.values(ProjectViewType);
        const expectedTypes = ['project', 'group', 'dataset', 'action', 'frameParser'];
        
        expect(viewTypes).toEqual(expect.arrayContaining(expectedTypes));
        expect(viewTypes).toHaveLength(expectedTypes.length);
      });
    });

    describe('EditorWidgetType 枚举', () => {
      it('应该定义所有编辑器组件类型', () => {
        expect(EditorWidgetType.TextField).toBe('textField');
        expect(EditorWidgetType.HexTextField).toBe('hexTextField');
        expect(EditorWidgetType.IntField).toBe('intField');
        expect(EditorWidgetType.FloatField).toBe('floatField');
        expect(EditorWidgetType.CheckBox).toBe('checkBox');
        expect(EditorWidgetType.ComboBox).toBe('comboBox');
        expect(EditorWidgetType.IconPicker).toBe('iconPicker');
      });

      it('应该包含所有预期的编辑器组件', () => {
        const editorTypes = Object.values(EditorWidgetType);
        const expectedTypes = ['textField', 'hexTextField', 'intField', 'floatField', 'checkBox', 'comboBox', 'iconPicker'];
        
        expect(editorTypes).toEqual(expect.arrayContaining(expectedTypes));
        expect(editorTypes).toHaveLength(expectedTypes.length);
      });
    });
  });

  // ==================== 类型一致性测试 ====================

  describe('类型一致性测试', () => {
    it('WIDGET_TYPES组群组件应该与验证器兼容', () => {
      // 验证器中定义的有效组件类型
      const validGroupWidgets = ['', 'accelerometer', 'bar', 'compass', 'gyro', 'map', 'plot', 'gauge', 'led', 'terminal', 'fft', 'multiplot'];
      const widgetGroupValues = Object.values(WIDGET_TYPES.GROUP);
      
      // WIDGET_TYPES.GROUP中的所有值都应该在验证器的有效列表中
      for (const widget of widgetGroupValues) {
        expect(validGroupWidgets).toContain(widget);
      }
    });

    it('WIDGET_TYPES数据集组件应该与验证器兼容', () => {
      // 验证器中定义的有效数据集组件类型
      const validDatasetWidgets = ['', 'x', 'y', 'z', 'lat', 'lon', 'alt', 'bar', 'gauge', 'plot', 'led'];
      const widgetDatasetValues = Object.values(WIDGET_TYPES.DATASET);
      
      // WIDGET_TYPES.DATASET中的所有值都应该在验证器的有效列表中
      for (const widget of widgetDatasetValues) {
        expect(validDatasetWidgets).toContain(widget);
      }
    });

    it('TIMER_MODES应该与验证器兼容', () => {
      // 验证器中定义的有效定时器模式
      const validTimerModes = ['off', 'autoStart', 'startOnTrigger', 'toggleOnTrigger'];
      const timerModeValues = Object.values(TIMER_MODES);
      
      // TIMER_MODES中的所有值都应该在验证器的有效列表中
      for (const mode of timerModeValues) {
        expect(validTimerModes).toContain(mode);
      }
    });

    it('FrameDetectionMethod应该与项目配置兼容', () => {
      // 确保枚举值与项目配置中使用的值一致
      const methods = [
        FrameDetectionMethod.NoDelimiters,
        FrameDetectionMethod.EndDelimiterOnly,
        FrameDetectionMethod.StartDelimiterOnly,
        FrameDetectionMethod.StartAndEndDelimiter
      ];
      
      // 应该是连续的整数序列
      expect(methods).toEqual([0, 1, 2, 3]);
    });

    it('DecoderMethod应该与项目配置兼容', () => {
      // 确保枚举值与项目配置中使用的值一致
      const methods = [
        DecoderMethod.PlainText,
        DecoderMethod.Hexadecimal,
        DecoderMethod.Base64
      ];
      
      // 应该是连续的整数序列
      expect(methods).toEqual([0, 1, 2]);
    });
  });

  // ==================== 常量不变性测试 ====================

  describe('常量不变性测试', () => {
    it('WIDGET_TYPES应该定义为const对象', () => {
      // const对象在TypeScript中是可以修改的，但我们可以验证对象存在
      expect(WIDGET_TYPES).toBeDefined();
      expect(WIDGET_TYPES.GROUP).toBeDefined();
      expect(WIDGET_TYPES.DATASET).toBeDefined();
    });

    it('TIMER_MODES应该定义为const对象', () => {
      expect(TIMER_MODES).toBeDefined();
      expect(typeof TIMER_MODES.OFF).toBe('string');
    });

    it('EOL_SEQUENCES应该定义为const对象', () => {
      expect(EOL_SEQUENCES).toBeDefined();
      expect(typeof EOL_SEQUENCES.LF).toBe('string');
    });
  });

  // ==================== 边界条件测试 ====================

  describe('边界条件测试', () => {
    describe('类型守卫边界条件', () => {
      it('应该处理嵌套null/undefined值', () => {
        const projectWithNulls = {
          title: 'Test',
          decoder: 0,
          frameDetection: 1,
          frameStart: '$',
          frameEnd: ';',
          frameParser: 'function parse() {}',
          groups: null, // null值
          actions: [undefined], // 包含undefined的数组
          mapTilerApiKey: '',
          thunderforestApiKey: ''
        };

        expect(isValidProjectConfig(projectWithNulls)).toBe(false);
      });

      it('应该处理循环引用对象', () => {
        const circularObj: any = {
          title: 'Circular',
          decoder: 0,
          frameDetection: 1,
          frameStart: '$',
          frameEnd: ';',
          frameParser: 'function parse() {}',
          groups: [],
          actions: [],
          mapTilerApiKey: '',
          thunderforestApiKey: ''
        };
        
        circularObj.self = circularObj;

        // 类型守卫应该能处理循环引用而不崩溃
        expect(() => {
          isValidProjectConfig(circularObj);
        }).not.toThrow();
      });

      it('应该处理非常深的嵌套对象', () => {
        let deepObj: any = { value: 'base' };
        
        // 创建深度嵌套对象
        for (let i = 0; i < 1000; i++) {
          deepObj = { nested: deepObj };
        }
        
        expect(() => {
          isValidProjectConfig(deepObj);
        }).not.toThrow();
        
        expect(isValidProjectConfig(deepObj)).toBe(false);
      });

      it('应该处理非常大的数组', () => {
        const projectWithLargeArray = {
          title: 'Large Array Test',
          decoder: 0,
          frameDetection: 1,
          frameStart: '$',
          frameEnd: ';',
          frameParser: 'function parse() {}',
          groups: new Array(10000).fill({
            title: 'Group',
            widget: '',
            datasets: []
          }),
          actions: [],
          mapTilerApiKey: '',
          thunderforestApiKey: ''
        };

        expect(() => {
          isValidProjectConfig(projectWithLargeArray);
        }).not.toThrow();
        
        expect(isValidProjectConfig(projectWithLargeArray)).toBe(true);
      });
    });

    describe('特殊值处理', () => {
      it('应该处理NaN和Infinity', () => {
        const datasetWithSpecialNumbers = {
          title: 'Special Numbers',
          units: 'V',
          widget: 'gauge',
          value: '0',
          index: NaN, // NaN
          graph: true,
          fft: false,
          led: false,
          log: false,
          min: -Infinity, // -Infinity
          max: Infinity, // Infinity
          alarm: 0,
          ledHigh: 1,
          fftSamples: 1024,
          fftSamplingRate: 100
        };

        // 类型守卫会通过，因为NaN的typeof是'number'
        expect(isValidDataset(datasetWithSpecialNumbers)).toBe(true);
      });

      it('应该处理空字符串和whitespace', () => {
        const projectWithWhitespace = {
          title: '   ', // 只包含空格
          decoder: 0,
          frameDetection: 1,
          frameStart: '\t', // tab字符
          frameEnd: '\n', // 换行符
          frameParser: '   function parse() {}   ', // 两端有空格
          groups: [],
          actions: [],
          mapTilerApiKey: '',
          thunderforestApiKey: ''
        };

        // 类型守卫只检查类型，不检查内容
        expect(isValidProjectConfig(projectWithWhitespace)).toBe(true);
      });
    });
  });
});
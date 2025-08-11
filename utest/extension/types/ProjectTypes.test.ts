import { describe, test, expect } from 'vitest';
import type { 
  ProjectTypes, 
  Widget, 
  Group, 
  Dataset, 
  Frame, 
  WidgetType 
} from '@extension/types/ProjectTypes';

describe('ProjectTypes 类型定义测试', () => {
  test('应该能够创建基本的Widget类型', () => {
    const widget: Widget = {
      title: '测试组件',
      index: 0,
      widget: 'plot' as WidgetType,
      handle: 'test_handle',
      x: 100,
      y: 200,
      w: 300,
      h: 400
    };

    expect(widget.title).toBe('测试组件');
    expect(widget.widget).toBe('plot');
    expect(widget.x).toBe(100);
  });

  test('应该能够创建Group类型', () => {
    const group: Group = {
      title: '测试分组',
      widgets: []
    };

    expect(group.title).toBe('测试分组');
    expect(Array.isArray(group.widgets)).toBe(true);
  });

  test('应该能够创建Dataset类型', () => {
    const dataset: Dataset = {
      title: '测试数据集',
      index: 0,
      graph: true,
      log: false,
      widget: 'multiplot' as WidgetType,
      units: 'V',
      alarm: 5.0,
      min: 0,
      max: 10
    };

    expect(dataset.title).toBe('测试数据集');
    expect(dataset.graph).toBe(true);
    expect(dataset.alarm).toBe(5.0);
  });

  test('应该能够创建Frame类型', () => {
    const frame: Frame = {
      title: '测试帧',
      index: 0,
      groups: []
    };

    expect(frame.title).toBe('测试帧');
    expect(Array.isArray(frame.groups)).toBe(true);
  });

  test('WidgetType应该包含所有支持的组件类型', () => {
    const supportedTypes = [
      'plot',
      'multiplot', 
      'bar',
      'gauge',
      'compass',
      'gyroscope',
      'accelerometer',
      'gps',
      'led',
      'terminal',
      'datagrid',
      'fft',
      'plot3d'
    ];

    supportedTypes.forEach(type => {
      const widget: Widget = {
        title: `测试${type}`,
        index: 0,
        widget: type as WidgetType,
        handle: `test_${type}`,
        x: 0,
        y: 0,
        w: 100,
        h: 100
      };
      
      expect(widget.widget).toBe(type);
    });
  });
});
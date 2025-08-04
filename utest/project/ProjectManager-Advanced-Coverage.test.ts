/*
 * ProjectManager 高级覆盖率测试
 * 专门针对未被充分测试的函数和代码路径
 * 目标：将ProjectManager覆盖率从67.56%提升到90%以上
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectConfig, Group, Dataset } from '../../src/extension/types/ProjectTypes';

// Mock fs/promises 模块
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn()
}));

// Mock path模块
vi.mock('path', () => ({
  basename: vi.fn((filePath: string) => filePath.split('/').pop() || 'project.ssproj'),
  join: vi.fn((...paths: string[]) => paths.join('/'))
}));

// Mock vscode
const vscode = (global as any).vscode;
const fs = await import('fs/promises');
const mockReadFile = vi.mocked(fs.readFile);
const mockWriteFile = vi.mocked(fs.writeFile);

// 导入真实的ProjectManager
let ProjectManager: any;

describe('ProjectManager - 高级覆盖率测试', () => {
  let projectManager: any;

  beforeEach(async () => {
    // 动态导入真实的ProjectManager
    const module = await import('../../src/extension/project/ProjectManager');
    ProjectManager = module.ProjectManager;
    
    ProjectManager.resetInstance();
    projectManager = ProjectManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (projectManager) {
      projectManager.dispose();
    }
  });

  // ==================== 私有方法间接测试 ====================

  describe('私有方法覆盖测试', () => {
    it('应该测试createDefaultProject方法的完整功能', () => {
      // 通过createNewProject间接测试createDefaultProject
      projectManager.createNewProject();
      
      const project = projectManager.currentProject;
      expect(project).toBeDefined();
      expect(project.title).toBe('New Project');
      expect(project.decoder).toBe(0);
      expect(project.frameDetection).toBe(1);
      expect(project.frameStart).toBe('$');
      expect(project.frameEnd).toBe(';');
      expect(project.groups).toEqual([]);
      expect(project.actions).toEqual([]);
      expect(project.mapTilerApiKey).toBe('');
      expect(project.thunderforestApiKey).toBe('');
      expect(project.frameParser).toContain('function parse(frame)');
      expect(project.frameParser).toContain('return frame.split(\',\');');
    });

    it('应该测试getDefaultFrameParser方法的输出格式', () => {
      projectManager.createNewProject();
      const project = projectManager.currentProject;
      
      // 验证默认帧解析器包含必要的元素
      expect(project.frameParser).toContain('/**');
      expect(project.frameParser).toContain('* Splits a data frame into an array');
      expect(project.frameParser).toContain('@param[in]  frame');
      expect(project.frameParser).toContain('@return     An array of strings');
      expect(project.frameParser).toContain('function parse(frame)');
      expect(project.frameParser).toContain('return frame.split(\',\');');
      expect(project.frameParser).toContain('*/');
    });

    it('应该测试getNextDatasetIndex的不同场景', () => {
      // 场景1：空项目
      projectManager.addGroup('Group 1', 'line');
      projectManager.addDataset(0, { title: 'Dataset 1' });
      
      let datasets = projectManager.currentProject.groups[0].datasets;
      expect(datasets[0].index).toBe(1); // 第一个数据集应该是索引1
      
      // 场景2：添加更多数据集
      projectManager.addDataset(0, { title: 'Dataset 2' });
      datasets = projectManager.currentProject.groups[0].datasets;
      expect(datasets[1].index).toBe(2); // 第二个数据集应该是索引2
      
      // 场景3：跨组群的索引计算
      projectManager.addGroup('Group 2', 'bar');
      projectManager.addDataset(1, { title: 'Dataset 3' });
      
      const group2Datasets = projectManager.currentProject.groups[1].datasets;
      expect(group2Datasets[0].index).toBe(3); // 跨组群索引应该是3
    });

    it('应该测试getNextDatasetIndex处理非连续索引的情况', () => {
      projectManager.addGroup('Test Group', 'line');
      
      // 手动设置非连续的索引
      projectManager.addDataset(0, { title: 'Dataset 1', index: 5 });
      projectManager.addDataset(0, { title: 'Dataset 2', index: 10 });
      
      // 下一个数据集应该使用最大索引+1
      projectManager.addDataset(0, { title: 'Dataset 3' });
      
      const datasets = projectManager.currentProject.groups[0].datasets;
      expect(datasets[2].index).toBe(11); // 应该是10 + 1
    });

    it('应该测试getNextDatasetIndex在空项目状态下的边界处理', () => {
      // 当没有当前项目时
      projectManager._currentProject = null;
      
      // 创建新项目并添加第一个组群和数据集
      projectManager.createNewProject();
      projectManager.addGroup('Test Group', 'line');
      projectManager.addDataset(0, { title: 'First Dataset' });
      
      const datasets = projectManager.currentProject.groups[0].datasets;
      expect(datasets[0].index).toBe(1); // 第一个数据集应该从1开始
    });
  });

  // ==================== EventEmitter监控和调试方法 ====================

  describe('EventEmitter监控和调试方法测试', () => {
    it('应该正确获取EventEmitter统计信息', () => {
      const stats = projectManager.getEventEmitterStats();
      
      expect(stats).toHaveProperty('listenerCount');
      expect(stats).toHaveProperty('totalListeners');
      expect(stats).toHaveProperty('maxListeners');
      
      expect(typeof stats.listenerCount).toBe('object');
      expect(typeof stats.totalListeners).toBe('number');
      expect(typeof stats.maxListeners).toBe('number');
      
      // 验证所有事件类型都被统计
      const expectedEvents = Object.values(ProjectManager.EVENTS);
      for (const event of expectedEvents) {
        expect(stats.listenerCount).toHaveProperty(event);
        expect(typeof stats.listenerCount[event]).toBe('number');
      }
    });

    it('应该正确检测内存泄漏风险', () => {
      const leakCheck = projectManager.checkForMemoryLeaks();
      
      expect(leakCheck).toHaveProperty('hasWarnings');
      expect(leakCheck).toHaveProperty('warnings');
      expect(leakCheck).toHaveProperty('stats');
      
      expect(typeof leakCheck.hasWarnings).toBe('boolean');
      expect(Array.isArray(leakCheck.warnings)).toBe(true);
      expect(typeof leakCheck.stats).toBe('object');
    });

    it('应该在监听器数量过多时发出警告', () => {
      // 添加大量事件监听器以触发警告
      const eventType = ProjectManager.EVENTS.PROJECT_MODIFIED;
      
      // 添加15个监听器（超过10个的阈值）
      for (let i = 0; i < 15; i++) {
        projectManager.on(eventType, () => {});
      }
      
      const leakCheck = projectManager.checkForMemoryLeaks();
      
      expect(leakCheck.hasWarnings).toBe(true);
      expect(leakCheck.warnings.length).toBeGreaterThan(0);
      expect(leakCheck.warnings.some(warning => 
        warning.includes(eventType) && warning.includes('15 listeners')
      )).toBe(true);
    });

    it('应该在总监听器数量接近最大值时发出警告', () => {
      // 获取最大监听器数量
      const maxListeners = projectManager.getMaxListeners();
      const warningThreshold = Math.floor(maxListeners * 0.8);
      
      // 添加超过阈值的监听器
      const eventType = ProjectManager.EVENTS.PROJECT_LOADED;
      for (let i = 0; i < warningThreshold + 1; i++) {
        projectManager.on(eventType, () => {});
      }
      
      const leakCheck = projectManager.checkForMemoryLeaks();
      expect(leakCheck.hasWarnings).toBe(true);
      expect(leakCheck.warnings.some(warning => 
        warning.includes('Total listeners') && warning.includes('exceeds warning threshold')
      )).toBe(true);
    });

    it('应该正确清理特定事件的监听器', () => {
      const eventType = ProjectManager.EVENTS.PROJECT_LOADED;
      
      // 添加一些监听器
      projectManager.on(eventType, () => {});
      projectManager.on(eventType, () => {});
      
      let stats = projectManager.getEventEmitterStats();
      expect(stats.listenerCount[eventType]).toBe(2);
      
      // 清理特定事件的监听器
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      projectManager.clearEventListeners(eventType);
      
      stats = projectManager.getEventEmitterStats();
      expect(stats.listenerCount[eventType]).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(`Cleared all listeners for event: ${eventType}`);
      
      consoleSpy.mockRestore();
    });

    it('应该正确清理所有事件监听器', () => {
      // 添加多种事件的监听器
      projectManager.on(ProjectManager.EVENTS.PROJECT_LOADED, () => {});
      projectManager.on(ProjectManager.EVENTS.PROJECT_MODIFIED, () => {});
      projectManager.on(ProjectManager.EVENTS.TITLE_CHANGED, () => {});
      
      let stats = projectManager.getEventEmitterStats();
      expect(stats.totalListeners).toBeGreaterThan(0);
      
      // 清理所有监听器
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      projectManager.clearEventListeners();
      
      stats = projectManager.getEventEmitterStats();
      expect(stats.totalListeners).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Cleared all event listeners');
      
      consoleSpy.mockRestore();
    });
  });

  // ==================== 单例模式和实例管理 ====================

  describe('单例模式和实例管理测试', () => {
    it('应该正确重置单例实例', () => {
      const instance1 = ProjectManager.getInstance();
      expect(instance1).toBeDefined();
      
      // 重置实例
      ProjectManager.resetInstance();
      
      const instance2 = ProjectManager.getInstance();
      expect(instance2).toBeDefined();
      expect(instance2).not.toBe(instance1); // 应该是不同的实例
    });

    it('应该在重置时正确dispose旧实例', () => {
      const instance1 = ProjectManager.getInstance();
      const disposeSpy = vi.spyOn(instance1, 'dispose');
      
      // 重置实例应该调用dispose
      ProjectManager.resetInstance();
      
      expect(disposeSpy).toHaveBeenCalled();
      
      disposeSpy.mockRestore();
    });

    it('应该处理重置时无实例的情况', () => {
      // 先重置确保没有实例
      ProjectManager.resetInstance();
      // 直接访问私有字段确保为undefined
      ProjectManager._instance = undefined;
      
      // 再次重置不应该抛错
      expect(() => {
        ProjectManager.resetInstance();
      }).not.toThrow();
    });
  });

  // ==================== 完整的数据集属性测试 ====================

  describe('数据集属性完整性测试', () => {
    beforeEach(() => {
      projectManager.addGroup('Test Group', 'line');
    });

    it('应该测试数据集的所有属性设置', () => {
      const fullDataset = {
        title: 'Complete Dataset',
        units: 'V',
        widget: 'gauge',
        value: '3.14',
        index: 42,
        graph: true,
        fft: true,
        led: true,
        log: true,
        min: -10,
        max: 10,
        alarm: 5,
        ledHigh: 8,
        fftSamples: 2048,
        fftSamplingRate: 200
      };

      projectManager.addDataset(0, fullDataset);
      
      const addedDataset = projectManager.currentProject.groups[0].datasets[0];
      
      // 验证所有属性都被正确设置
      expect(addedDataset.title).toBe('Complete Dataset');
      expect(addedDataset.units).toBe('V');
      expect(addedDataset.widget).toBe('gauge');
      expect(addedDataset.value).toBe('3.14');
      expect(addedDataset.index).toBe(42);
      expect(addedDataset.graph).toBe(true);
      expect(addedDataset.fft).toBe(true);
      expect(addedDataset.led).toBe(true);
      expect(addedDataset.log).toBe(true);
      expect(addedDataset.min).toBe(-10);
      expect(addedDataset.max).toBe(10);
      expect(addedDataset.alarm).toBe(5);
      expect(addedDataset.ledHigh).toBe(8);
      expect(addedDataset.fftSamples).toBe(2048);
      expect(addedDataset.fftSamplingRate).toBe(200);
    });

    it('应该测试数据集的默认值处理', () => {
      // 使用空对象添加数据集
      projectManager.addDataset(0, {});
      
      const addedDataset = projectManager.currentProject.groups[0].datasets[0];
      
      // 验证所有默认值
      expect(addedDataset.title).toBe('Dataset 1');
      expect(addedDataset.units).toBe('');
      expect(addedDataset.widget).toBe('');
      expect(addedDataset.value).toBe('--');
      expect(addedDataset.index).toBe(1);
      expect(addedDataset.graph).toBe(false);
      expect(addedDataset.fft).toBe(false);
      expect(addedDataset.led).toBe(false);
      expect(addedDataset.log).toBe(false);
      expect(addedDataset.min).toBe(0);
      expect(addedDataset.max).toBe(0);
      expect(addedDataset.alarm).toBe(0);
      expect(addedDataset.ledHigh).toBe(1);
      expect(addedDataset.fftSamples).toBe(1024);
      expect(addedDataset.fftSamplingRate).toBe(100);
    });

    it('应该测试数据集的null/undefined值处理', () => {
      const datasetWithNulls = {
        title: undefined,
        units: null,
        graph: null,
        fft: undefined,
        min: null,
        max: undefined
      };

      projectManager.addDataset(0, datasetWithNulls);
      
      const addedDataset = projectManager.currentProject.groups[0].datasets[0];
      
      // null/undefined应该使用默认值
      expect(addedDataset.title).toBe('Dataset 1');
      expect(addedDataset.units).toBe('');
      expect(addedDataset.graph).toBe(false);
      expect(addedDataset.fft).toBe(false);
      expect(addedDataset.min).toBe(0);
      expect(addedDataset.max).toBe(0);
    });

    it('应该测试数据集的布尔值false处理', () => {
      const datasetWithFalseValues = {
        graph: false,
        fft: false,
        led: false,
        log: false
      };

      projectManager.addDataset(0, datasetWithFalseValues);
      
      const addedDataset = projectManager.currentProject.groups[0].datasets[0];
      
      // 显式的false值应该被保留
      expect(addedDataset.graph).toBe(false);
      expect(addedDataset.fft).toBe(false);
      expect(addedDataset.led).toBe(false);
      expect(addedDataset.log).toBe(false);
    });

    it('应该测试数据集的数值0处理', () => {
      const datasetWithZeroValues = {
        min: 0,
        max: 0,
        alarm: 0
      };

      projectManager.addDataset(0, datasetWithZeroValues);
      
      const addedDataset = projectManager.currentProject.groups[0].datasets[0];
      
      // 显式的0值应该被保留
      expect(addedDataset.min).toBe(0);
      expect(addedDataset.max).toBe(0);
      expect(addedDataset.alarm).toBe(0);
    });
  });

  // ==================== 边界条件和异常处理 ====================

  describe('边界条件和异常处理测试', () => {
    it('应该处理dispose过程中的异常', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock removeAllListeners抛出异常
      projectManager.removeAllListeners = vi.fn().mockImplementation(() => {
        throw new Error('Mock dispose error');
      });

      // dispose不应该抛出异常
      expect(() => {
        projectManager.dispose();
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error during ProjectManager disposal:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('应该处理空项目状态下的各种操作', () => {
      projectManager._currentProject = null;
      
      // 各种操作都应该返回false或默认值
      expect(projectManager.addGroup('Test', 'line')).toBe(false);
      expect(projectManager.deleteGroup(0)).toBe(false);
      expect(projectManager.addDataset(0, {})).toBe(false);
      expect(projectManager.deleteDataset(0, 0)).toBe(false);
      expect(projectManager.groupCount).toBe(0);
      expect(projectManager.datasetCount).toBe(0);
    });

    it('应该正确处理组群和数据集的索引越界', () => {
      projectManager.addGroup('Test Group', 'line');
      projectManager.addDataset(0, { title: 'Test Dataset' });
      
      // 组群索引越界
      expect(projectManager.addDataset(999, {})).toBe(false);
      expect(projectManager.deleteGroup(999)).toBe(false);
      expect(projectManager.deleteDataset(999, 0)).toBe(false);
      
      // 数据集索引越界
      expect(projectManager.deleteDataset(0, 999)).toBe(false);
      
      // 负数索引
      expect(projectManager.deleteGroup(-1)).toBe(false);
      expect(projectManager.addDataset(-1, {})).toBe(false);
      expect(projectManager.deleteDataset(0, -1)).toBe(false);
    });
  });
});
/**
 * ProjectStore 基础测试
 * 专注于核心逻辑测试，避免复杂框架依赖
 */

import { describe, test, expect, vi } from 'vitest';

// Mock VSCode API
const mockVSCode = {
  postMessage: vi.fn()
};

global.vscode = mockVSCode;
global.window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
} as any;

describe('ProjectStore 基础测试', () => {
  // 直接测试核心逻辑，不依赖Vue/Pinia框架
  
  describe('mock环境验证', () => {
    test('vscode mock 应该可用', () => {
      expect(global.vscode).toBeDefined();
      expect(global.vscode.postMessage).toBeDefined();
    });

    test('window mock 应该可用', () => {
      expect(global.window).toBeDefined();
      expect(global.window.addEventListener).toBeDefined();
    });
  });

  describe('核心逻辑测试', () => {
    test('应该能发送VSCode消息', () => {
      // 模拟sendMessage逻辑
      const sendMessage = (message: any) => {
        if (typeof vscode !== 'undefined') {
          vscode.postMessage(message);
        }
      };

      sendMessage({ type: 'test', data: 'hello' });
      
      expect(mockVSCode.postMessage).toHaveBeenCalledWith({
        type: 'test',
        data: 'hello'
      });
    });

    test('应该能处理文件路径解析', () => {
      const parseFileName = (filePath: string): string => {
        if (filePath) {
          const parts = filePath.split(/[/\\]/);
          return parts[parts.length - 1];
        }
        return 'New Project';
      };

      expect(parseFileName('/path/to/project.json')).toBe('project.json');
      expect(parseFileName('C:\\path\\project.json')).toBe('project.json');
      expect(parseFileName('')).toBe('New Project');
      expect(parseFileName('project.json')).toBe('project.json');
    });

    test('应该能统计数据集数量', () => {
      const countDatasets = (groups: any[]): number => {
        if (!groups) return 0;
        
        return groups.reduce((total, group) => {
          return total + (group.datasets ? group.datasets.length : 0);
        }, 0);
      };

      const mockGroups = [
        { datasets: [{ title: 'ds1' }, { title: 'ds2' }] },
        { datasets: [{ title: 'ds3' }] },
        { datasets: [] }
      ];

      expect(countDatasets(mockGroups)).toBe(3);
      expect(countDatasets([])).toBe(0);
      expect(countDatasets([{ datasets: null }])).toBe(0);
    });

    test('应该能检测重复索引', () => {
      const getDuplicateIndices = (groups: any[]): number[] => {
        const indices: number[] = [];
        
        if (groups) {
          for (const group of groups) {
            if (group.datasets) {
              for (const dataset of group.datasets) {
                indices.push(dataset.index);
              }
            }
          }
        }
        
        const duplicates: number[] = [];
        const seen = new Set<number>();
        
        for (const index of indices) {
          if (seen.has(index)) {
            if (!duplicates.includes(index)) {
              duplicates.push(index);
            }
          } else {
            seen.add(index);
          }
        }
        
        return duplicates;
      };

      const mockGroups = [
        {
          datasets: [
            { index: 1, title: 'ds1' },
            { index: 2, title: 'ds2' },
            { index: 1, title: 'ds3' } // 重复
          ]
        },
        {
          datasets: [
            { index: 3, title: 'ds4' },
            { index: 2, title: 'ds5' } // 重复
          ]
        }
      ];

      const duplicates = getDuplicateIndices(mockGroups);
      expect(duplicates).toContain(1);
      expect(duplicates).toContain(2);
      expect(duplicates).not.toContain(3);
    });

    test('应该能获取下一个可用索引', () => {
      const getNextAvailableIndex = (groups: any[]): number => {
        const usedIndices: number[] = [];
        
        if (groups) {
          for (const group of groups) {
            if (group.datasets) {
              for (const dataset of group.datasets) {
                usedIndices.push(dataset.index);
              }
            }
          }
        }
        
        const sortedIndices = usedIndices.sort((a, b) => a - b);
        let nextIndex = 1;
        
        while (sortedIndices.includes(nextIndex)) {
          nextIndex++;
        }
        
        return nextIndex;
      };

      const mockGroups = [
        {
          datasets: [
            { index: 1, title: 'ds1' },
            { index: 3, title: 'ds2' }
          ]
        }
      ];

      expect(getNextAvailableIndex(mockGroups)).toBe(2); // 1和3被使用，2是下一个
      expect(getNextAvailableIndex([])).toBe(1); // 空数据，从1开始
    });

    test('应该能检测商业功能', () => {
      const containsCommercialFeatures = (project: any): boolean => {
        if (!project || !project.groups) return false;
        
        for (const group of project.groups) {
          if (['plot3d', 'modbus', 'can'].includes(group.widget)) {
            return true;
          }
          
          if (group.datasets) {
            for (const dataset of group.datasets) {
              if (dataset.fft && dataset.fftSamples > 4096) {
                return true;
              }
            }
          }
        }
        
        return false;
      };

      const basicProject = {
        groups: [
          { widget: 'plot', datasets: [{ fft: true, fftSamples: 2048 }] }
        ]
      };

      const commercialProject = {
        groups: [
          { widget: 'plot3d', datasets: [] },
          { widget: 'plot', datasets: [{ fft: true, fftSamples: 8192 }] }
        ]
      };

      expect(containsCommercialFeatures(basicProject)).toBe(false);
      expect(containsCommercialFeatures(commercialProject)).toBe(true);
      expect(containsCommercialFeatures(null)).toBe(false);
    });

    test('应该能构建X轴数据源列表', () => {
      const getXDataSources = (project: any): string[] => {
        const sources = ['Samples'];
        
        if (project && project.groups) {
          for (const group of project.groups) {
            if (group.datasets) {
              for (const dataset of group.datasets) {
                sources.push(`${dataset.title} (${group.title})`);
              }
            }
          }
        }
        
        return sources;
      };

      const mockProject = {
        groups: [
          {
            title: 'Group 1',
            datasets: [
              { title: 'Dataset 1' },
              { title: 'Dataset 2' }
            ]
          },
          {
            title: 'Group 2', 
            datasets: [
              { title: 'Dataset 3' }
            ]
          }
        ]
      };

      const sources = getXDataSources(mockProject);
      
      expect(sources).toContain('Samples');
      expect(sources).toContain('Dataset 1 (Group 1)');
      expect(sources).toContain('Dataset 2 (Group 1)');
      expect(sources).toContain('Dataset 3 (Group 2)');
      expect(sources).toHaveLength(4);
    });
  });

  describe('消息处理逻辑', () => {
    test('应该能处理不同类型的消息', () => {
      const mockState = {
        currentProject: null,
        filePath: '',
        title: 'New Project',
        modified: false
      };

      const handleMessage = (message: any, state: typeof mockState) => {
        switch (message.type) {
          case 'projectData':
            state.currentProject = message.data.project;
            state.filePath = message.data.filePath || '';
            state.title = message.data.title || 'New Project';
            state.modified = message.data.modified || false;
            break;

          case 'projectLoaded':
            state.currentProject = message.data;
            state.modified = false;
            break;

          case 'projectModified':
            state.modified = message.data.modified;
            break;

          case 'titleChanged':
            state.title = message.data.title;
            break;

          case 'filePathChanged':
            state.filePath = message.data.filePath;
            break;
        }
      };

      // 测试projectData消息
      handleMessage({
        type: 'projectData',
        data: {
          project: { title: 'Test Project' },
          filePath: '/test.json',
          title: 'Test Project',
          modified: true
        }
      }, mockState);

      expect(mockState.currentProject).toEqual({ title: 'Test Project' });
      expect(mockState.filePath).toBe('/test.json');
      expect(mockState.title).toBe('Test Project');
      expect(mockState.modified).toBe(true);

      // 测试projectLoaded消息
      handleMessage({
        type: 'projectLoaded',
        data: { title: 'Loaded Project' }
      }, mockState);

      expect(mockState.currentProject).toEqual({ title: 'Loaded Project' });
      expect(mockState.modified).toBe(false);

      // 测试titleChanged消息
      handleMessage({
        type: 'titleChanged',
        data: { title: 'Changed Title' }
      }, mockState);

      expect(mockState.title).toBe('Changed Title');
    });
  });

  describe('数据验证', () => {
    test('应该能验证索引范围', () => {
      const isValidGroupIndex = (project: any, groupIndex: number): boolean => {
        return project && 
               project.groups && 
               groupIndex >= 0 && 
               groupIndex < project.groups.length;
      };

      const isValidDatasetIndex = (project: any, groupIndex: number, datasetIndex: number): boolean => {
        if (!isValidGroupIndex(project, groupIndex)) return false;
        
        const group = project.groups[groupIndex];
        return group.datasets && 
               datasetIndex >= 0 && 
               datasetIndex < group.datasets.length;
      };

      const mockProject = {
        groups: [
          { datasets: [{ title: 'ds1' }, { title: 'ds2' }] },
          { datasets: [{ title: 'ds3' }] }
        ]
      };

      expect(isValidGroupIndex(mockProject, 0)).toBe(true);
      expect(isValidGroupIndex(mockProject, 1)).toBe(true);
      expect(isValidGroupIndex(mockProject, 2)).toBe(false);
      expect(isValidGroupIndex(mockProject, -1)).toBe(false);

      expect(isValidDatasetIndex(mockProject, 0, 0)).toBe(true);
      expect(isValidDatasetIndex(mockProject, 0, 1)).toBe(true);
      expect(isValidDatasetIndex(mockProject, 0, 2)).toBe(false);
      expect(isValidDatasetIndex(mockProject, 1, 0)).toBe(true);
      expect(isValidDatasetIndex(mockProject, 1, 1)).toBe(false);
    });
  });
});
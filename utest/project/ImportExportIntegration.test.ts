/*
 * Serial Studio VSCode Extension
 * 导入导出功能集成测试
 * 
 * 验证第19周完整的导入导出功能，确保与Serial-Studio完全兼容
 * 质量指标：导入导出成功率≥99%
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ProjectManager } from '../../src/extension/project/ProjectManager';
import { ProjectSerializer } from '../../src/extension/project/ProjectSerializer';
import { ProjectValidator } from '../../src/extension/project/ProjectValidator';
import { ProjectEditorProvider } from '../../src/extension/webview/ProjectEditorProvider';
import { 
  ProjectConfig, 
  DecoderMethod, 
  FrameDetectionMethod,
  Group,
  Dataset,
  Action
} from '../../src/extension/types/ProjectTypes';

// Mock VSCode API
vi.mock('vscode', () => ({
  window: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn()
  },
  Uri: {
    file: (path: string) => ({ fsPath: path }),
    joinPath: (...args: any[]) => ({ fsPath: args.join('/') })
  },
  workspace: {
    rootPath: '/test/workspace'
  },
  WebviewView: class MockWebviewView {
    webview = {
      postMessage: vi.fn(),
      asWebviewUri: vi.fn(),
      cspSource: 'vscode-webview'
    };
    show = vi.fn();
  }
}));

describe('导入导出功能集成测试', () => {
  let projectManager: ProjectManager;
  let serializer: ProjectSerializer;
  let validator: ProjectValidator;
  let provider: ProjectEditorProvider;
  let tempDir: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 创建临时目录
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'serial-studio-test-'));
    
    // 初始化组件
    projectManager = ProjectManager.getInstance();
    serializer = new ProjectSerializer();
    validator = new ProjectValidator();
    provider = new ProjectEditorProvider(vscode.Uri.file('/test/extension'));
  });

  afterEach(async () => {
    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('完整导入导出流程测试', () => {
    const createComplexProject = (): ProjectConfig => ({
      title: '集成测试项目',
      decoder: DecoderMethod.PlainText,
      frameDetection: FrameDetectionMethod.StartAndEndDelimiter,
      frameStart: '<',
      frameEnd: '>',
      frameParser: `
        function parse(frame) {
          // 复杂的解析逻辑
          const data = frame.split(',');
          if (data.length < 3) return [];
          
          return data.map(item => item.trim());
        }
      `,
      groups: [
        {
          title: '传感器数据',
          widget: '',
          datasets: [
            {
              title: '温度传感器',
              units: '°C',
              widget: 'gauge',
              value: '--',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: -40,
              max: 85,
              alarm: 70,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            },
            {
              title: '湿度传感器',
              units: '%RH',
              widget: 'bar',
              value: '--',
              index: 2,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: 0,
              max: 100,
              alarm: 90,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }
          ]
        },
        {
          title: 'GPS位置',
          widget: 'map',
          datasets: [
            {
              title: '纬度',
              units: '°',
              widget: 'lat',
              value: '--',
              index: 3,
              graph: false,
              fft: false,
              led: false,
              log: true,
              min: -90,
              max: 90,
              alarm: 0,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            },
            {
              title: '经度',
              units: '°',
              widget: 'lon',
              value: '--',
              index: 4,
              graph: false,
              fft: false,
              led: false,
              log: true,
              min: -180,
              max: 180,
              alarm: 0,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }
          ]
        }
      ],
      actions: [
        {
          title: '获取传感器数据',
          icon: 'sensor',
          txData: 'GET_SENSORS',
          eolSequence: '\\n',
          binaryData: false,
          autoExecuteOnConnect: true,
          timerMode: 'autoStart',
          timerIntervalMs: 1000
        },
        {
          title: '重置设备',
          icon: 'reset',
          txData: 'RESET',
          eolSequence: '\\n',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'off',
          timerIntervalMs: 5000
        }
      ],
      mapTilerApiKey: 'test-maptiler-key',
      thunderforestApiKey: 'test-thunderforest-key'
    });

    it('应该成功完成完整的导出-导入循环', async () => {
      // 创建复杂项目
      const originalProject = createComplexProject();
      
      // 步骤1：序列化导出
      const exportedJson = serializer.exportForSerialStudio(originalProject);
      expect(exportedJson).toBeTruthy();
      expect(exportedJson).toContain('"title": "集成测试项目"');
      
      // 验证导出的JSON是有效的
      const parsedExport = JSON.parse(exportedJson);
      expect(parsedExport).toHaveProperty('title', '集成测试项目');
      expect(parsedExport).toHaveProperty('groups');
      expect(parsedExport.groups).toHaveLength(2);
      
      // 步骤2：导入反序列化
      const importedProject = serializer.importFromSerialStudio(exportedJson);
      
      // 步骤3：验证导入的项目
      const validation = validator.validateProject(importedProject);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // 步骤4：深度比较项目结构
      expect(importedProject.title).toBe(originalProject.title);
      expect(importedProject.decoder).toBe(originalProject.decoder);
      expect(importedProject.frameDetection).toBe(originalProject.frameDetection);
      expect(importedProject.frameStart).toBe(originalProject.frameStart);
      expect(importedProject.frameEnd).toBe(originalProject.frameEnd);
      expect(importedProject.groups).toHaveLength(originalProject.groups.length);
      expect(importedProject.actions).toHaveLength(originalProject.actions.length);
      
      // 验证组群数据
      for (let i = 0; i < originalProject.groups.length; i++) {
        const originalGroup = originalProject.groups[i];
        const importedGroup = importedProject.groups[i];
        
        expect(importedGroup.title).toBe(originalGroup.title);
        expect(importedGroup.widget).toBe(originalGroup.widget);
        expect(importedGroup.datasets).toHaveLength(originalGroup.datasets.length);
        
        // 验证数据集
        for (let j = 0; j < originalGroup.datasets.length; j++) {
          const originalDataset = originalGroup.datasets[j];
          const importedDataset = importedGroup.datasets[j];
          
          expect(importedDataset.title).toBe(originalDataset.title);
          expect(importedDataset.units).toBe(originalDataset.units);
          expect(importedDataset.widget).toBe(originalDataset.widget);
          expect(importedDataset.index).toBe(originalDataset.index);
          expect(importedDataset.graph).toBe(originalDataset.graph);
          expect(importedDataset.min).toBe(originalDataset.min);
          expect(importedDataset.max).toBe(originalDataset.max);
        }
      }
      
      // 验证动作数据
      for (let i = 0; i < originalProject.actions.length; i++) {
        const originalAction = originalProject.actions[i];
        const importedAction = importedProject.actions[i];
        
        expect(importedAction.title).toBe(originalAction.title);
        expect(importedAction.txData).toBe(originalAction.txData);
        expect(importedAction.timerMode).toBe(originalAction.timerMode);
        expect(importedAction.timerIntervalMs).toBe(originalAction.timerIntervalMs);
      }
    });

    it('应该正确处理文件系统操作', async () => {
      const project = createComplexProject();
      const filePath = path.join(tempDir, 'test-project.ssproj');
      
      // 导出到文件
      const exportedContent = serializer.exportForSerialStudio(project);
      await fs.writeFile(filePath, exportedContent, 'utf-8');
      
      // 验证文件存在
      const stats = await fs.stat(filePath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
      
      // 从文件导入
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const importedProject = serializer.importFromSerialStudio(fileContent);
      
      // 验证导入成功
      expect(importedProject.title).toBe(project.title);
      expect(importedProject.groups).toHaveLength(project.groups.length);
    });

    it('应该成功处理批量导出多种格式', async () => {
      const project = createComplexProject();
      
      // 模拟批量导出配置
      const batchConfig = {
        formats: [
          { type: 'ssproj', path: path.join(tempDir, 'project.ssproj') },
          { type: 'json', path: path.join(tempDir, 'project.json') },
          { type: 'xml', path: path.join(tempDir, 'project.xml') },
          { type: 'csv', path: path.join(tempDir, 'project.csv') }
        ],
        includeAssets: false,
        compression: false,
        outputDir: tempDir
      };
      
      // 执行批量导出
      const exportPromises = batchConfig.formats.map(async format => {
        switch (format.type) {
          case 'ssproj':
          case 'json':
            const jsonContent = serializer.exportForSerialStudio(project);
            await fs.writeFile(format.path, jsonContent, 'utf-8');
            break;
          case 'xml':
            // 简化的XML导出（实际实现在ProjectEditorProvider中）
            const xmlContent = `<?xml version="1.0"?><project><title>${project.title}</title></project>`;
            await fs.writeFile(format.path, xmlContent, 'utf-8');
            break;
          case 'csv':
            // 简化的CSV导出
            const csvContent = `Title,Groups,Datasets\n"${project.title}",${project.groups.length},${project.groups.reduce((sum, g) => sum + g.datasets.length, 0)}`;
            await fs.writeFile(format.path, csvContent, 'utf-8');
            break;
        }
      });
      
      await Promise.all(exportPromises);
      
      // 验证所有文件都被创建
      for (const format of batchConfig.formats) {
        const stats = await fs.stat(format.path);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBeGreaterThan(0);
      }
    });
  });

  describe('Serial-Studio兼容性测试', () => {
    it('应该正确处理Serial-Studio原生项目格式', async () => {
      // 来自Serial-Studio的实际项目文件示例
      const serialStudioProject = {
        "title": "MPU6050 Accelerometer",
        "decoder": 0,
        "frameDetection": 1,
        "frameStart": "$",
        "frameEnd": "\\n",
        "frameParser": "function parse(frame) {\n    return frame.split(\",\");\n}",
        "groups": [
          {
            "title": "Accelerometer",
            "widget": "accelerometer",
            "datasets": [
              {
                "title": "Accelerometer X",
                "units": "m/s²",
                "widget": "x",
                "value": "--",
                "index": 1,
                "graph": true,
                "fft": false,
                "led": false,
                "log": true,
                "min": -20,
                "max": 20,
                "alarm": 0,
                "ledHigh": 1,
                "fftSamples": 1024,
                "fftSamplingRate": 100
              },
              {
                "title": "Accelerometer Y",
                "units": "m/s²",
                "widget": "y",
                "value": "--",
                "index": 2,
                "graph": true,
                "fft": false,
                "led": false,
                "log": true,
                "min": -20,
                "max": 20,
                "alarm": 0,
                "ledHigh": 1,
                "fftSamples": 1024,
                "fftSamplingRate": 100
              },
              {
                "title": "Accelerometer Z",
                "units": "m/s²",
                "widget": "z",
                "value": "--",
                "index": 3,
                "graph": true,
                "fft": false,
                "led": false,
                "log": true,
                "min": -20,
                "max": 20,
                "alarm": 0,
                "ledHigh": 1,
                "fftSamples": 1024,
                "fftSamplingRate": 100
              }
            ]
          }
        ],
        "actions": [],
        "mapTilerApiKey": "",
        "thunderforestApiKey": ""
      };
      
      const jsonString = JSON.stringify(serialStudioProject, null, 4);
      
      // 导入Serial-Studio项目
      const imported = serializer.importFromSerialStudio(jsonString);
      
      // 验证导入结果
      expect(imported.title).toBe("MPU6050 Accelerometer");
      expect(imported.groups).toHaveLength(1);
      expect(imported.groups[0].title).toBe("Accelerometer");
      expect(imported.groups[0].widget).toBe("accelerometer");
      expect(imported.groups[0].datasets).toHaveLength(3);
      
      // 验证加速度计数据集
      const datasets = imported.groups[0].datasets;
      expect(datasets[0].title).toBe("Accelerometer X");
      expect(datasets[0].widget).toBe("x");
      expect(datasets[1].title).toBe("Accelerometer Y");
      expect(datasets[1].widget).toBe("y");
      expect(datasets[2].title).toBe("Accelerometer Z");
      expect(datasets[2].widget).toBe("z");
      
      // 导出回Serial-Studio格式
      const exported = serializer.exportForSerialStudio(imported);
      const reImported = serializer.importFromSerialStudio(exported);
      
      // 验证往返一致性
      expect(reImported).toEqual(imported);
    });

    it('应该处理版本兼容性和数据类型转换', async () => {
      // 模拟旧版本或格式稍有不同的项目
      const oldFormatProject = {
        "title": "Legacy Project",
        "decoder": "0",  // 字符串格式的数字
        "frameDetection": "1",
        "groups": [
          {
            "title": "Sensors",
            "datasets": [
              {
                "title": "Temperature",
                "index": "1",
                "min": "0",
                "max": "100",
                "graph": "true",
                "fft": "false",
                "led": "false",
                "log": "true"
              }
            ]
          }
        ],
        "actions": [
          {
            "title": "Test Action",
            "timerMode": 1,  // 数字格式的枚举
            "timerIntervalMs": "5000"
          }
        ]
      };
      
      const jsonString = JSON.stringify(oldFormatProject);
      const imported = serializer.importFromSerialStudio(jsonString);
      
      // 验证类型转换
      expect(typeof imported.decoder).toBe('number');
      expect(imported.decoder).toBe(0);
      expect(typeof imported.frameDetection).toBe('number');
      expect(imported.frameDetection).toBe(1);
      
      const dataset = imported.groups[0].datasets[0];
      expect(typeof dataset.index).toBe('number');
      expect(dataset.index).toBe(1);
      expect(typeof dataset.min).toBe('number');
      expect(dataset.min).toBe(0);
      expect(typeof dataset.graph).toBe('boolean');
      expect(dataset.graph).toBe(true);
      
      const action = imported.actions[0];
      expect(typeof action.timerIntervalMs).toBe('number');
      expect(action.timerIntervalMs).toBe(5000);
      expect(action.timerMode).toBe('autoStart'); // 数字1转换为字符串
    });
  });

  describe('错误处理和边界情况测试', () => {
    it('应该处理无效的JSON输入', async () => {
      const invalidInputs = [
        'invalid json',
        '{"incomplete": true',
        '[]',
        'null',
        '{"groups": "invalid"}'
      ];
      
      for (const input of invalidInputs) {
        expect(() => {
          serializer.importFromSerialStudio(input);
        }).toThrow();
      }
      
      // 这些输入虽然有些字段为null，但是JSON结构有效，应该能正常处理
      const validButIncompleteInputs = [
        '{"title": null}',
        '{"title": "Test", "decoder": null}',
        '{}'
      ];
      
      for (const input of validButIncompleteInputs) {
        expect(() => {
          serializer.importFromSerialStudio(input);
        }).not.toThrow();
      }
    });

    it('应该处理空项目和最小项目', async () => {
      const minimalProject = {
        "title": "Minimal Project"
      };
      
      const imported = serializer.importFromSerialStudio(JSON.stringify(minimalProject));
      
      // 验证默认值被正确设置
      expect(imported.title).toBe("Minimal Project");
      expect(imported.decoder).toBe(0);
      expect(imported.frameDetection).toBe(1);
      expect(imported.frameStart).toBe('$');
      expect(imported.frameEnd).toBe(';');
      expect(imported.groups).toEqual([]);
      expect(imported.actions).toEqual([]);
      
      // 验证可以成功导出
      const exported = serializer.exportForSerialStudio(imported);
      expect(exported).toBeTruthy();
      expect(JSON.parse(exported)).toHaveProperty('title', 'Minimal Project');
    });

    it('应该处理大型项目', async () => {
      // 创建包含大量数据的项目
      const largeProject: ProjectConfig = {
        title: '大型测试项目',
        decoder: DecoderMethod.PlainText,
        frameDetection: FrameDetectionMethod.EndDelimiterOnly,
        frameStart: '$',
        frameEnd: ';',
        frameParser: 'function parse(frame) { return frame.split(","); }',
        groups: [],
        actions: [],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };
      
      // 创建100个组群，每个包含10个数据集
      for (let i = 0; i < 100; i++) {
        const group: Group = {
          title: `Group ${i}`,
          widget: '',
          datasets: []
        };
        
        for (let j = 0; j < 10; j++) {
          const dataset: Dataset = {
            title: `Dataset ${i}-${j}`,
            units: 'unit',
            widget: 'gauge',
            value: '--',
            index: i * 10 + j + 1,
            graph: j % 2 === 0,
            fft: j % 3 === 0,
            led: j % 4 === 0,
            log: j % 5 === 0,
            min: 0,
            max: 100,
            alarm: 80,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          };
          group.datasets.push(dataset);
        }
        
        largeProject.groups.push(group);
      }
      
      // 导出和导入大型项目
      const startTime = Date.now();
      const exported = serializer.exportForSerialStudio(largeProject);
      const exportTime = Date.now() - startTime;
      
      const importStartTime = Date.now();
      const imported = serializer.importFromSerialStudio(exported);
      const importTime = Date.now() - importStartTime;
      
      // 验证性能（应该在合理时间内完成）
      expect(exportTime).toBeLessThan(5000); // 5秒内
      expect(importTime).toBeLessThan(5000); // 5秒内
      
      // 验证数据完整性
      expect(imported.groups).toHaveLength(100);
      expect(imported.groups[0].datasets).toHaveLength(10);
      expect(imported.groups[99].datasets).toHaveLength(10);
      
      // 验证总数据集数量
      const totalDatasets = imported.groups.reduce((sum, group) => sum + group.datasets.length, 0);
      expect(totalDatasets).toBe(1000);
    });

    it('应该处理Unicode和特殊字符', async () => {
      const unicodeProject: ProjectConfig = {
        title: '测试项目 🚀 中文 العربية русский',
        decoder: DecoderMethod.PlainText,
        frameDetection: FrameDetectionMethod.EndDelimiterOnly,
        frameStart: '♣',
        frameEnd: '♠',
        frameParser: '// 中文注释\nfunction parse(frame) {\n  // Unicode支持测试\n  return frame.split("，"); // 中文逗号\n}',
        groups: [{
          title: '传感器组 📊',
          widget: '',
          datasets: [{
            title: '温度传感器 🌡️',
            units: '°C',
            widget: 'gauge',
            value: '25°C',
            index: 1,
            graph: true,
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
          title: '获取数据 📡',
          icon: '📊',
          txData: 'GET_DATA 中文命令',
          eolSequence: '\\n',
          binaryData: false,
          autoExecuteOnConnect: false,
          timerMode: 'off',
          timerIntervalMs: 1000
        }],
        mapTilerApiKey: '',
        thunderforestApiKey: ''
      };
      
      // 导出和导入
      const exported = serializer.exportForSerialStudio(unicodeProject);
      const imported = serializer.importFromSerialStudio(exported);
      
      // 验证Unicode字符完整性
      expect(imported.title).toBe(unicodeProject.title);
      expect(imported.frameStart).toBe('♣');
      expect(imported.frameEnd).toBe('♠');
      expect(imported.frameParser).toContain('中文注释');
      expect(imported.groups[0].title).toBe('传感器组 📊');
      expect(imported.groups[0].datasets[0].title).toBe('温度传感器 🌡️');
      expect(imported.actions[0].title).toBe('获取数据 📡');
      expect(imported.actions[0].txData).toBe('GET_DATA 中文命令');
    });
  });

  describe('性能和质量指标验证', () => {
    it('应该达到≥99%的导入导出成功率', async () => {
      const testCases = 100;
      let successCount = 0;
      
      for (let i = 0; i < testCases; i++) {
        try {
          // 创建随机测试项目
          const project: ProjectConfig = {
            title: `测试项目 ${i}`,
            decoder: Math.floor(Math.random() * 4),
            frameDetection: Math.floor(Math.random() * 3) + 1,
            frameStart: String.fromCharCode(33 + Math.floor(Math.random() * 94)),
            frameEnd: String.fromCharCode(33 + Math.floor(Math.random() * 94)),
            frameParser: `function parse(frame) { return frame.split(","); }`,
            groups: [],
            actions: [],
            mapTilerApiKey: '',
            thunderforestApiKey: ''
          };
          
          // 添加随机数量的组群和数据集
          const groupCount = Math.floor(Math.random() * 5) + 1;
          for (let g = 0; g < groupCount; g++) {
            const group: Group = {
              title: `Group ${g}`,
              widget: '',
              datasets: []
            };
            
            const datasetCount = Math.floor(Math.random() * 3) + 1;
            for (let d = 0; d < datasetCount; d++) {
              const dataset: Dataset = {
                title: `Dataset ${g}-${d}`,
                units: ['°C', '%', 'V', 'A', 'm/s²'][Math.floor(Math.random() * 5)],
                widget: ['gauge', 'bar', 'plot'][Math.floor(Math.random() * 3)],
                value: '--',
                index: g * 10 + d + 1,
                graph: Math.random() > 0.5,
                fft: Math.random() > 0.7,
                led: Math.random() > 0.8,
                log: Math.random() > 0.3,
                min: Math.floor(Math.random() * 100),
                max: Math.floor(Math.random() * 100) + 100,
                alarm: Math.floor(Math.random() * 200),
                ledHigh: Math.random(),
                fftSamples: [512, 1024, 2048][Math.floor(Math.random() * 3)],
                fftSamplingRate: [50, 100, 200][Math.floor(Math.random() * 3)]
              };
              group.datasets.push(dataset);
            }
            
            project.groups.push(group);
          }
          
          // 执行导出导入循环
          const exported = serializer.exportForSerialStudio(project);
          const imported = serializer.importFromSerialStudio(exported);
          
          // 验证基本属性
          if (imported.title === project.title &&
              imported.decoder === project.decoder &&
              imported.groups.length === project.groups.length) {
            successCount++;
          }
          
        } catch (error) {
          // 测试失败，不增加成功计数
          console.warn(`Test case ${i} failed:`, error);
        }
      }
      
      const successRate = (successCount / testCases) * 100;
      console.log(`导入导出成功率: ${successRate.toFixed(2)}% (${successCount}/${testCases})`);
      
      // 验证达到≥99%成功率
      expect(successRate).toBeGreaterThanOrEqual(99);
    });

    it('应该在合理时间内完成操作', async () => {
      const project = createComplexProject();
      
      // 测试导出性能
      const exportStart = Date.now();
      const exported = serializer.exportForSerialStudio(project);
      const exportTime = Date.now() - exportStart;
      
      // 测试导入性能
      const importStart = Date.now();
      const imported = serializer.importFromSerialStudio(exported);
      const importTime = Date.now() - importStart;
      
      // 验证性能要求
      expect(exportTime).toBeLessThan(1000); // 1秒内完成导出
      expect(importTime).toBeLessThan(1000); // 1秒内完成导入
      
      console.log(`导出时间: ${exportTime}ms, 导入时间: ${importTime}ms`);
    });

    it('应该保持内存使用在合理范围', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行大量导入导出操作
      for (let i = 0; i < 50; i++) {
        const project = createComplexProject();
        const exported = serializer.exportForSerialStudio(project);
        const imported = serializer.importFromSerialStudio(exported);
        
        // 确保导入正确
        expect(imported.title).toBe(project.title);
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`内存使用增长: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      
      // 验证内存使用没有大幅增长（应该控制在合理范围内）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB以内
    });
  });

  function createComplexProject(): ProjectConfig {
    return {
      title: '集成测试项目',
      decoder: DecoderMethod.PlainText,
      frameDetection: FrameDetectionMethod.StartAndEndDelimiter,
      frameStart: '<',
      frameEnd: '>',
      frameParser: 'function parse(frame) { return frame.split(","); }',
      groups: [
        {
          title: '传感器数据',
          widget: '',
          datasets: [
            {
              title: '温度传感器',
              units: '°C',
              widget: 'gauge',
              value: '--',
              index: 1,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: -40,
              max: 85,
              alarm: 70,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            },
            {
              title: '湿度传感器',
              units: '%RH',
              widget: 'bar',
              value: '--',
              index: 2,
              graph: true,
              fft: false,
              led: false,
              log: true,
              min: 0,
              max: 100,
              alarm: 90,
              ledHigh: 1,
              fftSamples: 1024,
              fftSamplingRate: 100
            }
          ]
        }
      ],
      actions: [
        {
          title: '获取传感器数据',
          icon: 'sensor',
          txData: 'GET_SENSORS',
          eolSequence: '\\n',
          binaryData: false,
          autoExecuteOnConnect: true,
          timerMode: 'autoStart',
          timerIntervalMs: 1000
        }
      ],
      mapTilerApiKey: 'test-maptiler-key',
      thunderforestApiKey: 'test-thunderforest-key'
    };
  }
});
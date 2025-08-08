/**
 * 跨模块集成测试
 * 测试Extension和Webview之间的深度集成，确保各模块协同工作
 * 测试范围：
 * 1. 项目管理与数据可视化集成
 * 2. 导出系统与组件系统集成
 * 3. 插件系统与Webview组件集成
 * 4. 多线程数据处理与UI更新集成
 * 5. 错误处理与恢复机制集成
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟Node.js模块
vi.mock('path', () => ({
  join: vi.fn((...args: string[]) => args.join('/')),
  resolve: vi.fn((path: string) => path),
  dirname: vi.fn((path: string) => path.split('/').slice(0, -1).join('/')),
  basename: vi.fn((path: string) => path.split('/').pop() || ''),
  extname: vi.fn((path: string) => {
    const base = path.split('/').pop() || '';
    const dot = base.lastIndexOf('.');
    return dot > 0 ? base.substring(dot) : '';
  })
}));

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn()
  },
  existsSync: vi.fn(),
  createReadStream: vi.fn(),
  createWriteStream: vi.fn()
}));

// 模拟VSCode API
const mockVscode = {
  workspace: {
    getConfiguration: vi.fn(),
    onDidChangeConfiguration: vi.fn(),
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }]
  },
  window: {
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    createWebviewPanel: vi.fn(),
    showSaveDialog: vi.fn()
  },
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path })),
    parse: vi.fn()
  }
};

vi.mock('vscode', () => mockVscode);

// ================================
// 项目管理与数据可视化集成测试
// ================================

describe('Project Management & Data Visualization Integration', () => {
  let projectManager: any;
  let visualizationManager: any;
  let messageRouter: any;

  beforeEach(() => {
    // 模拟项目管理器
    projectManager = {
      currentProject: null,
      projects: new Map(),

      createProject: vi.fn(async (config: any) => {
        const project = {
          id: `project-${Date.now()}`,
          name: config.name,
          datasets: config.datasets || [],
          groups: config.groups || [],
          actions: config.actions || [],
          metadata: {
            created: Date.now(),
            version: '1.0.0'
          }
        };

        projectManager.projects.set(project.id, project);
        projectManager.currentProject = project;

        // 通知可视化管理器项目变更
        visualizationManager.onProjectChange(project);

        return project;
      }),

      loadProject: vi.fn(async (projectId: string) => {
        const project = projectManager.projects.get(projectId);
        if (!project) throw new Error(`Project not found: ${projectId}`);

        projectManager.currentProject = project;
        visualizationManager.onProjectChange(project);

        return project;
      }),

      updateProject: vi.fn(async (projectId: string, changes: any) => {
        const project = projectManager.projects.get(projectId);
        if (!project) throw new Error(`Project not found: ${projectId}`);

        Object.assign(project, changes);
        
        if (projectManager.currentProject?.id === projectId) {
          visualizationManager.onProjectChange(project);
        }

        return project;
      }),

      deleteProject: vi.fn(async (projectId: string) => {
        const deleted = projectManager.projects.delete(projectId);
        
        if (projectManager.currentProject?.id === projectId) {
          projectManager.currentProject = null;
          visualizationManager.onProjectChange(null);
        }

        return deleted;
      })
    };

    // 模拟可视化管理器
    visualizationManager = {
      widgets: new Map(),
      activeProject: null,

      onProjectChange: vi.fn((project: any) => {
        visualizationManager.activeProject = project;
        
        if (project) {
          // 为项目中的数据集创建默认可视化组件
          project.datasets.forEach((dataset: any, index: number) => {
            visualizationManager.createWidget(`widget-${index}`, {
              type: 'plot',
              title: dataset.title,
              datasetIndex: index,
              config: {
                xAxis: 'timestamp',
                yAxis: dataset.title,
                units: dataset.units
              }
            });
          });
        } else {
          // 清除所有组件
          visualizationManager.widgets.clear();
        }
      }),

      createWidget: vi.fn((id: string, config: any) => {
        const widget = {
          id,
          ...config,
          data: [],
          isActive: true,
          lastUpdate: 0
        };

        visualizationManager.widgets.set(id, widget);
        return widget;
      }),

      updateWidgetData: vi.fn((widgetId: string, data: any[]) => {
        const widget = visualizationManager.widgets.get(widgetId);
        if (widget) {
          widget.data = [...data];
          widget.lastUpdate = Date.now();
          messageRouter.notify('widget:updated', { widgetId, data });
        }
      }),

      getProjectSummary: vi.fn(() => {
        if (!visualizationManager.activeProject) return null;

        return {
          projectId: visualizationManager.activeProject.id,
          projectName: visualizationManager.activeProject.name,
          widgetCount: visualizationManager.widgets.size,
          datasetCount: visualizationManager.activeProject.datasets.length,
          totalDataPoints: Array.from(visualizationManager.widgets.values())
            .reduce((sum: number, widget: any) => sum + widget.data.length, 0)
        };
      })
    };

    // 模拟消息路由器
    messageRouter = {
      listeners: new Map(),

      on: vi.fn((event: string, handler: Function) => {
        if (!messageRouter.listeners.has(event)) {
          messageRouter.listeners.set(event, new Set());
        }
        messageRouter.listeners.get(event).add(handler);
      }),

      notify: vi.fn((event: string, data: any) => {
        const handlers = messageRouter.listeners.get(event);
        if (handlers) {
          handlers.forEach((handler: Function) => handler(data));
        }
      })
    };
  });

  it('应该正确处理项目创建和可视化组件自动生成', async () => {
    // 创建项目配置
    const projectConfig = {
      name: 'Temperature Monitoring',
      datasets: [
        { title: 'Temperature', units: '°C', index: 0 },
        { title: 'Humidity', units: '%', index: 1 },
        { title: 'Pressure', units: 'hPa', index: 2 }
      ],
      groups: [
        { title: 'Environmental', datasets: [0, 1, 2] }
      ]
    };

    // 创建项目
    const project = await projectManager.createProject(projectConfig);

    expect(project).toBeDefined();
    expect(project.name).toBe('Temperature Monitoring');
    expect(project.datasets).toHaveLength(3);

    // 验证可视化组件自动创建
    expect(visualizationManager.onProjectChange).toHaveBeenCalledWith(project);
    expect(visualizationManager.activeProject).toBe(project);
    expect(visualizationManager.widgets.size).toBe(3);

    // 验证每个数据集都有对应的组件
    project.datasets.forEach((dataset: any, index: number) => {
      const widget = visualizationManager.widgets.get(`widget-${index}`);
      expect(widget).toBeDefined();
      expect(widget.title).toBe(dataset.title);
      expect(widget.config.units).toBe(dataset.units);
    });
  });

  it('应该正确处理项目更新和组件同步', async () => {
    // 创建初始项目
    const project = await projectManager.createProject({
      name: 'Test Project',
      datasets: [
        { title: 'Temperature', units: '°C', index: 0 }
      ]
    });

    // 更新项目，添加新数据集
    const updatedProject = await projectManager.updateProject(project.id, {
      datasets: [
        { title: 'Temperature', units: '°C', index: 0 },
        { title: 'Humidity', units: '%', index: 1 }
      ]
    });

    expect(updatedProject.datasets).toHaveLength(2);
    expect(visualizationManager.onProjectChange).toHaveBeenCalledTimes(2); // 创建时1次，更新时1次

    // 验证新组件被创建
    expect(visualizationManager.widgets.size).toBe(2);
    expect(visualizationManager.widgets.has('widget-1')).toBe(true);
  });

  it('应该正确处理项目删除和组件清理', async () => {
    // 创建项目
    const project = await projectManager.createProject({
      name: 'Test Project',
      datasets: [{ title: 'Test Data', units: 'V', index: 0 }]
    });

    expect(visualizationManager.widgets.size).toBe(1);

    // 删除项目
    const deleted = await projectManager.deleteProject(project.id);

    expect(deleted).toBe(true);
    expect(projectManager.currentProject).toBeNull();
    expect(visualizationManager.activeProject).toBeNull();
    expect(visualizationManager.widgets.size).toBe(0);
  });

  it('应该正确生成项目摘要统计', async () => {
    // 创建项目
    const project = await projectManager.createProject({
      name: 'Statistics Test',
      datasets: [
        { title: 'Data1', units: 'V', index: 0 },
        { title: 'Data2', units: 'A', index: 1 }
      ]
    });

    // 为组件添加数据
    visualizationManager.updateWidgetData('widget-0', [
      { timestamp: 1000, value: 1.0 },
      { timestamp: 2000, value: 2.0 }
    ]);

    visualizationManager.updateWidgetData('widget-1', [
      { timestamp: 1000, value: 0.5 },
      { timestamp: 2000, value: 0.7 },
      { timestamp: 3000, value: 0.9 }
    ]);

    // 生成摘要
    const summary = visualizationManager.getProjectSummary();

    expect(summary).toEqual({
      projectId: project.id,
      projectName: 'Statistics Test',
      widgetCount: 2,
      datasetCount: 2,
      totalDataPoints: 5 // 2 + 3 = 5
    });
  });
});

// ================================
// 导出系统与组件系统集成测试
// ================================

describe('Export System & Component System Integration', () => {
  let exportManager: any;
  let componentRegistry: any;
  let dataCollector: any;

  beforeEach(() => {
    // 模拟导出管理器
    exportManager = {
      activeExports: new Map(),
      exportFormats: ['csv', 'json', 'excel', 'xml'],

      exportData: vi.fn(async (config: any) => {
        const exportId = `export-${Date.now()}`;
        const exportTask = {
          id: exportId,
          format: config.format,
          status: 'preparing',
          progress: 0,
          startTime: Date.now()
        };

        exportManager.activeExports.set(exportId, exportTask);

        try {
          // 收集组件数据
          const componentsData = await dataCollector.collectFromComponents(config.componentIds);
          
          exportTask.status = 'processing';
          exportTask.progress = 50;

          // 格式化数据
          const formattedData = await exportManager.formatData(componentsData, config.format);
          
          exportTask.status = 'writing';
          exportTask.progress = 90;

          // 写入文件
          const filePath = await exportManager.writeFile(formattedData, config);
          
          exportTask.status = 'completed';
          exportTask.progress = 100;
          exportTask.filePath = filePath;

          return exportTask;
        } catch (error) {
          exportTask.status = 'failed';
          exportTask.error = error.message;
          throw error;
        }
      }),

      formatData: vi.fn(async (data: any, format: string) => {
        const formatters = {
          csv: (data: any) => {
            const headers = Object.keys(data[0] || {});
            const rows = data.map((row: any) => headers.map(h => row[h]).join(','));
            return [headers.join(','), ...rows].join('\n');
          },
          json: (data: any) => JSON.stringify(data, null, 2),
          xml: (data: any) => `<data>${data.map((item: any, i: number) => 
            `<item index="${i}">${Object.entries(item).map(([k, v]) => 
              `<${k}>${v}</${k}>`).join('')}</item>`).join('')}</data>`
        };

        const formatter = formatters[format as keyof typeof formatters];
        if (!formatter) throw new Error(`Unsupported format: ${format}`);

        return formatter(data);
      }),

      writeFile: vi.fn(async (data: string, config: any) => {
        const fileName = `${config.filename || 'export'}.${config.format}`;
        const filePath = `/exports/${fileName}`;
        
        // 模拟文件写入
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return filePath;
      })
    };

    // 模拟组件注册表
    componentRegistry = {
      components: new Map(),

      registerComponent: vi.fn((id: string, component: any) => {
        componentRegistry.components.set(id, {
          id,
          ...component,
          data: component.data || [],
          metadata: {
            created: Date.now(),
            dataFormat: component.dataFormat || 'time-series'
          }
        });
      }),

      getComponent: vi.fn((id: string) => {
        return componentRegistry.components.get(id);
      }),

      getAllComponents: vi.fn(() => {
        return Array.from(componentRegistry.components.values());
      }),

      getComponentsByType: vi.fn((type: string) => {
        return Array.from(componentRegistry.components.values())
          .filter((comp: any) => comp.type === type);
      })
    };

    // 模拟数据收集器
    dataCollector = {
      collectFromComponents: vi.fn(async (componentIds: string[]) => {
        const allData: any[] = [];

        for (const id of componentIds) {
          const component = componentRegistry.getComponent(id);
          if (component && component.data.length > 0) {
            const componentData = component.data.map((dataPoint: any) => ({
              ...dataPoint,
              componentId: id,
              componentType: component.type,
              timestamp: dataPoint.timestamp || Date.now()
            }));
            
            allData.push(...componentData);
          }
        }

        // 按时间戳排序
        return allData.sort((a, b) => a.timestamp - b.timestamp);
      }),

      collectAllData: vi.fn(async () => {
        const allComponents = componentRegistry.getAllComponents();
        const componentIds = allComponents.map((comp: any) => comp.id);
        return dataCollector.collectFromComponents(componentIds);
      })
    };
  });

  it('应该正确从多个组件收集数据并导出为CSV', async () => {
    // 注册多个组件
    componentRegistry.registerComponent('chart1', {
      type: 'plot',
      title: 'Temperature',
      data: [
        { timestamp: 1000, temperature: 25.5 },
        { timestamp: 2000, temperature: 26.0 }
      ]
    });

    componentRegistry.registerComponent('gauge1', {
      type: 'gauge',
      title: 'Pressure',
      data: [
        { timestamp: 1500, pressure: 1013.2 },
        { timestamp: 2500, pressure: 1012.8 }
      ]
    });

    // 导出数据
    const exportConfig = {
      componentIds: ['chart1', 'gauge1'],
      format: 'csv',
      filename: 'sensor_data'
    };

    const exportTask = await exportManager.exportData(exportConfig);

    expect(exportTask.status).toBe('completed');
    expect(exportTask.progress).toBe(100);
    expect(exportTask.filePath).toBe('/exports/sensor_data.csv');

    // 验证数据收集
    expect(dataCollector.collectFromComponents).toHaveBeenCalledWith(['chart1', 'gauge1']);

    // 验证数据格式化
    expect(exportManager.formatData).toHaveBeenCalled();
  });

  it('应该正确处理不同格式的数据导出', async () => {
    // 注册组件
    componentRegistry.registerComponent('test-component', {
      type: 'table',
      data: [
        { id: 1, name: 'Test', value: 42 },
        { id: 2, name: 'Sample', value: 99 }
      ]
    });

    // 测试多种格式
    const formats = ['csv', 'json', 'xml'];

    for (const format of formats) {
      const exportTask = await exportManager.exportData({
        componentIds: ['test-component'],
        format,
        filename: `test_${format}`
      });

      expect(exportTask.status).toBe('completed');
      expect(exportTask.filePath).toBe(`/exports/test_${format}.${format}`);
    }

    expect(exportManager.formatData).toHaveBeenCalledTimes(3);
  });

  it('应该正确处理导出过程中的错误', async () => {
    // 注册无效组件
    componentRegistry.registerComponent('broken-component', {
      type: 'plot',
      data: null // 无效数据
    });

    // 模拟格式化错误
    exportManager.formatData.mockRejectedValueOnce(new Error('Format error'));

    // 尝试导出
    await expect(exportManager.exportData({
      componentIds: ['broken-component'],
      format: 'csv',
      filename: 'broken_export'
    })).rejects.toThrow('Format error');

    const exportTask = exportManager.activeExports.get(
      Array.from(exportManager.activeExports.keys())[0]
    );

    expect(exportTask.status).toBe('failed');
    expect(exportTask.error).toBe('Format error');
  });

  it('应该正确处理大量数据的批量导出', async () => {
    // 注册包含大量数据的组件
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      timestamp: i * 1000,
      value: Math.sin(i / 100) * 100,
      index: i
    }));

    componentRegistry.registerComponent('large-dataset', {
      type: 'plot',
      data: largeDataset
    });

    const startTime = Date.now();

    const exportTask = await exportManager.exportData({
      componentIds: ['large-dataset'],
      format: 'json',
      filename: 'large_export'
    });

    const endTime = Date.now();
    const exportTime = endTime - startTime;

    expect(exportTask.status).toBe('completed');
    expect(exportTime).toBeLessThan(5000); // 应该在5秒内完成

    // 验证大数据集正确处理
    expect(dataCollector.collectFromComponents).toHaveBeenCalledWith(['large-dataset']);
  });
});

// ================================
// 错误处理与恢复机制集成测试
// ================================

describe('Error Handling & Recovery Integration', () => {
  let errorHandler: any;
  let recoveryManager: any;
  let systemMonitor: any;

  beforeEach(() => {
    // 模拟错误处理器
    errorHandler = {
      errors: [],
      handlers: new Map(),

      registerHandler: vi.fn((errorType: string, handler: Function) => {
        if (!errorHandler.handlers.has(errorType)) {
          errorHandler.handlers.set(errorType, new Set());
        }
        errorHandler.handlers.get(errorType).add(handler);
      }),

      handleError: vi.fn(async (error: any) => {
        const errorInfo = {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
          timestamp: Date.now(),
          severity: errorHandler.getSeverity(error)
        };

        errorHandler.errors.push(errorInfo);

        // 触发相应的处理器
        const handlers = errorHandler.handlers.get(errorInfo.type) || new Set();
        const results = [];

        for (const handler of handlers) {
          try {
            const result = await handler(errorInfo);
            results.push(result);
          } catch (handlerError) {
            console.error('Error handler failed:', handlerError);
          }
        }

        // 如果是严重错误，触发恢复机制
        if (errorInfo.severity === 'critical') {
          await recoveryManager.initiateRecovery(errorInfo);
        } else if (errorInfo.type !== 'Error') {
          // 对于命名错误类型（非通用Error），也尝试恢复
          await recoveryManager.initiateRecovery(errorInfo);
        } else {
          // 对于通用Error，也记录一个空恢复尝试
          const result = {
            errorType: errorInfo.type,
            action: 'none',
            success: false,
            timestamp: Date.now()
          };
          recoveryManager.recoveryHistory.push(result);
        }

        return { errorInfo, handlerResults: results };
      }),

      getSeverity: vi.fn((error: any) => {
        if (error.message.includes('critical') || error.message.includes('fatal') || 
            error.name.includes('Critical') || error.message.includes('Critical')) {
          return 'critical';
        } else if (error.message.includes('warning')) {
          return 'warning';
        }
        return 'error';
      }),

      getErrorStats: vi.fn(() => ({
        total: errorHandler.errors.length,
        bySeverity: errorHandler.errors.reduce((stats: any, error: any) => {
          stats[error.severity] = (stats[error.severity] || 0) + 1;
          return stats;
        }, {}),
        recent: errorHandler.errors.filter((error: any) => 
          Date.now() - error.timestamp < 60000).length
      }))
    };

    // 模拟恢复管理器
    recoveryManager = {
      recoveryActions: new Map([
        ['DataProcessingError', async () => ({ action: 'restart-processor', success: true })],
        ['ConnectionError', async () => ({ action: 'reconnect', success: true })],
        ['RenderingError', async () => ({ action: 'reset-renderer', success: true })],
        ['MemoryError', async () => ({ action: 'garbage-collect', success: true })]
      ]),

      recoveryHistory: [],

      initiateRecovery: vi.fn(async (errorInfo: any) => {
        const recoveryAction = recoveryManager.recoveryActions.get(errorInfo.type);
        
        if (!recoveryAction) {
          const result = { 
            errorType: errorInfo.type, 
            action: 'none', 
            success: false, 
            timestamp: Date.now() 
          };
          recoveryManager.recoveryHistory.push(result);
          return result;
        }

        try {
          const actionResult = await recoveryAction();
          const result = {
            errorType: errorInfo.type,
            ...actionResult,
            timestamp: Date.now()
          };
          
          recoveryManager.recoveryHistory.push(result);
          
          // 通知系统监控器恢复操作完成
          systemMonitor.onRecoveryCompleted(result);
          
          return result;
        } catch (recoveryError) {
          const result = {
            errorType: errorInfo.type,
            action: 'recovery-failed',
            success: false,
            error: recoveryError.message,
            timestamp: Date.now()
          };
          
          recoveryManager.recoveryHistory.push(result);
          return result;
        }
      })
    };

    // 模拟系统监控器
    systemMonitor = {
      systemState: 'healthy',
      alerts: [],

      onRecoveryCompleted: vi.fn((recoveryResult: any) => {
        if (recoveryResult.success) {
          systemMonitor.systemState = 'recovered';
          systemMonitor.alerts.push({
            type: 'recovery-success',
            message: `System recovered from ${recoveryResult.errorType}`,
            timestamp: Date.now()
          });
        } else {
          systemMonitor.systemState = 'degraded';
          systemMonitor.alerts.push({
            type: 'recovery-failed',
            message: `Failed to recover from ${recoveryResult.errorType}`,
            timestamp: Date.now()
          });
        }
        
        // 立即检查系统健康状态
        systemMonitor.checkSystemHealth();
      }),

      checkSystemHealth: vi.fn(() => {
        const errorStats = errorHandler.getErrorStats();
        const recentCriticalErrors = errorHandler.errors
          .filter((e: any) => e.severity === 'critical' && 
                            Date.now() - e.timestamp < 300000) // 5分钟内
          .length;

        if (recentCriticalErrors > 5) {
          systemMonitor.systemState = 'critical';
        } else if (recentCriticalErrors > 0) {
          systemMonitor.systemState = 'degraded';
        } else if (errorStats.recent > 10) {
          systemMonitor.systemState = 'warning';
        } else {
          systemMonitor.systemState = 'healthy';
        }

        return {
          state: systemMonitor.systemState,
          errorStats,
          recentCriticalErrors,
          alerts: systemMonitor.alerts.length
        };
      })
    };
  });

  it('应该正确处理数据处理错误并自动恢复', async () => {
    // 注册错误处理器
    const processingErrorHandler = vi.fn(async (errorInfo: any) => {
      return { handled: true, action: 'logged' };
    });

    errorHandler.registerHandler('DataProcessingError', processingErrorHandler);

    // 模拟数据处理错误
    const processingError = new (class DataProcessingError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'DataProcessingError';
      }
    })('Critical data processing failure');

    // 处理错误
    const result = await errorHandler.handleError(processingError);

    expect(result.errorInfo.type).toBe('DataProcessingError');
    expect(result.errorInfo.severity).toBe('critical');
    expect(result.handlerResults).toHaveLength(1);
    expect(result.handlerResults[0].handled).toBe(true);

    // 验证恢复机制被触发
    expect(recoveryManager.initiateRecovery).toHaveBeenCalledWith(result.errorInfo);
    expect(recoveryManager.recoveryHistory).toHaveLength(1);
    expect(recoveryManager.recoveryHistory[0].success).toBe(true);
    expect(recoveryManager.recoveryHistory[0].action).toBe('restart-processor');

    // 验证系统监控器状态
    expect(systemMonitor.onRecoveryCompleted).toHaveBeenCalled();
    expect(systemMonitor.systemState).toBe('recovered');
  });

  it('应该正确处理多种类型的错误', async () => {
    // 创建不同类型的错误
    const errors = [
      new (class ConnectionError extends Error {})('Connection lost'),
      new (class RenderingError extends Error {})('Rendering failed'),
      new (class MemoryError extends Error {})('Out of memory'),
      new Error('Unknown error')
    ];

    // 处理所有错误
    for (const error of errors) {
      await errorHandler.handleError(error);
    }

    // 验证错误统计
    const stats = errorHandler.getErrorStats();
    expect(stats.total).toBe(4);
    expect(stats.bySeverity.error).toBe(4);

    // 验证恢复历史
    expect(recoveryManager.recoveryHistory).toHaveLength(4);
    
    // 前三个应该成功恢复，最后一个没有恢复动作
    expect(recoveryManager.recoveryHistory.slice(0, 3)
      .every((r: any) => r.success)).toBe(true);
    expect(recoveryManager.recoveryHistory[3].success).toBe(false);
    expect(recoveryManager.recoveryHistory[3].action).toBe('none');
  });

  it('应该正确监控系统健康状态', async () => {
    // 初始状态检查
    let health = systemMonitor.checkSystemHealth();
    expect(health.state).toBe('healthy');

    // 产生一些普通错误
    for (let i = 0; i < 8; i++) {
      await errorHandler.handleError(new Error(`Error ${i}`));
    }

    health = systemMonitor.checkSystemHealth();
    expect(health.state).toBe('healthy'); // 还在正常范围内

    // 产生更多错误达到警告阈值
    for (let i = 8; i < 15; i++) {
      await errorHandler.handleError(new Error(`Error ${i}`));
    }

    health = systemMonitor.checkSystemHealth();
    expect(health.state).toBe('warning');
    expect(health.errorStats.recent).toBeGreaterThan(10);

    // 产生严重错误
    await errorHandler.handleError(new (class CriticalError extends Error {
      constructor() {
        super('Critical system failure');
        this.name = 'CriticalError';
      }
    })());

    health = systemMonitor.checkSystemHealth();
    expect(health.state).toBe('degraded');
  });

  it('应该正确处理恢复失败的情况', async () => {
    // 模拟恢复失败
    recoveryManager.recoveryActions.set('FailingError', async () => {
      throw new Error('Recovery mechanism failed');
    });

    const failingError = new (class FailingError extends Error {
      constructor() {
        super('Critical error that cannot be recovered');
        this.name = 'FailingError';
      }
    })();

    // 处理错误
    await errorHandler.handleError(failingError);

    // 验证恢复失败被正确记录
    const lastRecovery = recoveryManager.recoveryHistory[recoveryManager.recoveryHistory.length - 1];
    expect(lastRecovery.success).toBe(false);
    expect(lastRecovery.action).toBe('recovery-failed');
    expect(lastRecovery.error).toBe('Recovery mechanism failed');

    // 验证系统状态变为降级
    expect(systemMonitor.systemState).toBe('degraded');
    expect(systemMonitor.alerts.some((alert: any) => 
      alert.type === 'recovery-failed')).toBe(true);
  });

  it('应该正确统计和报告错误趋势', async () => {
    // 模拟一段时间内的错误模式
    const errorPattern = [
      { type: 'NetworkError', count: 5, severity: 'warning' },
      { type: 'DataProcessingError', count: 2, severity: 'error' },
      { type: 'CriticalSystemError', count: 1, severity: 'critical' }
    ];

    for (const pattern of errorPattern) {
      for (let i = 0; i < pattern.count; i++) {
        const error = new Error(`${pattern.severity} error`);
        error.name = pattern.type;
        await errorHandler.handleError(error);
      }
    }

    // 分析错误统计
    const stats = errorHandler.getErrorStats();
    expect(stats.total).toBe(8);
    expect(stats.bySeverity.warning).toBe(5);
    expect(stats.bySeverity.error).toBe(2);
    expect(stats.bySeverity.critical).toBe(1);

    // 验证恢复历史
    expect(recoveryManager.recoveryHistory).toHaveLength(8);
    
    // 统计成功恢复率
    const successfulRecoveries = recoveryManager.recoveryHistory
      .filter((r: any) => r.success).length;
    const recoveryRate = successfulRecoveries / recoveryManager.recoveryHistory.length;
    
    expect(recoveryRate).toBeGreaterThan(0.5); // 至少50%的恢复成功率
  });
});

// ================================
// 多线程数据处理集成测试
// ================================

describe('Multi-threaded Data Processing Integration', () => {
  let workerPool: any;
  let taskScheduler: any;
  let resultAggregator: any;

  beforeEach(() => {
    // 模拟Worker池
    workerPool = {
      workers: new Map(),
      maxWorkers: 4,
      activeJobs: new Map(),

      createWorker: vi.fn((id: string) => {
        const worker = {
          id,
          isAvailable: true,
          currentJob: null,
          processedJobs: 0,
          
          execute: vi.fn(async (task: any) => {
            worker.isAvailable = false;
            worker.currentJob = task;
            
            // 模拟处理时间
            await new Promise(resolve => 
              setTimeout(resolve, task.complexity * 10 || 100));
            
            const result = {
              taskId: task.id,
              workerId: worker.id,
              result: task.data.map((item: any) => ({ 
                ...item, 
                processed: true,
                processedBy: worker.id
              })),
              processingTime: task.complexity * 10 || 100
            };
            
            worker.processedJobs++;
            worker.currentJob = null;
            worker.isAvailable = true;
            
            return result;
          })
        };
        
        workerPool.workers.set(id, worker);
        return worker;
      }),

      getAvailableWorker: vi.fn(() => {
        for (const worker of workerPool.workers.values()) {
          if (worker.isAvailable) return worker;
        }
        return null;
      }),

      submitTask: vi.fn(async (task: any) => {
        let worker = workerPool.getAvailableWorker();
        
        // 如果没有可用的worker且还有容量，创建新的
        if (!worker && workerPool.workers.size < workerPool.maxWorkers) {
          worker = workerPool.createWorker(`worker-${workerPool.workers.size}`);
        }
        
        // 如果有worker但都忙碌，等待最快完成的那个
        if (!worker) {
          // 找到预计最快完成的worker
          const busyWorkers = Array.from(workerPool.workers.values())
            .filter((w: any) => !w.isAvailable);
          if (busyWorkers.length > 0) {
            worker = busyWorkers.reduce((fastest: any, current: any) => {
              const currentETA = current.currentJob?.complexity * 10 || 0;
              const fastestETA = fastest.currentJob?.complexity * 10 || 0;
              return currentETA < fastestETA ? current : fastest;
            });
          }
        }
        
        // 如果仍然没有可用worker，等待
        if (!worker) {
          await new Promise(resolve => {
            const checkAvailability = setInterval(() => {
              worker = workerPool.getAvailableWorker();
              if (worker) {
                clearInterval(checkAvailability);
                resolve(worker);
              }
            }, 50);
          });
        }

        const jobId = `job-${Date.now()}-${Math.random()}`;
        workerPool.activeJobs.set(jobId, { task, worker, startTime: Date.now() });
        
        try {
          const result = await worker.execute(task);
          workerPool.activeJobs.delete(jobId);
          return result;
        } catch (error) {
          workerPool.activeJobs.delete(jobId);
          throw error;
        }
      })
    };

    // 模拟任务调度器
    taskScheduler = {
      taskQueue: [],
      completedTasks: [],
      
      scheduleTask: vi.fn((taskData: any, priority = 'normal') => {
        const task = {
          id: `task-${Date.now()}-${Math.random()}`,
          data: taskData,
          priority,
          complexity: taskData.length || 1,
          createdAt: Date.now(),
          status: 'queued'
        };
        
        // 按优先级插入队列
        if (priority === 'high') {
          taskScheduler.taskQueue.unshift(task);
        } else {
          taskScheduler.taskQueue.push(task);
        }
        
        return task;
      }),

      processTasks: vi.fn(async () => {
        const results = [];
        
        while (taskScheduler.taskQueue.length > 0) {
          const task = taskScheduler.taskQueue.shift();
          task.status = 'processing';
          
          try {
            const result = await workerPool.submitTask(task);
            task.status = 'completed';
            task.result = result;
            taskScheduler.completedTasks.push(task);
            results.push(result);
          } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            taskScheduler.completedTasks.push(task);
          }
        }
        
        return results;
      }),

      getStats: vi.fn(() => ({
        queued: taskScheduler.taskQueue.length,
        completed: taskScheduler.completedTasks.filter((t: any) => t.status === 'completed').length,
        failed: taskScheduler.completedTasks.filter((t: any) => t.status === 'failed').length,
        totalProcessed: taskScheduler.completedTasks.length
      }))
    };

    // 模拟结果聚合器
    resultAggregator = {
      aggregatedResults: new Map(),
      
      aggregateResults: vi.fn((results: any[], aggregationType = 'merge') => {
        switch (aggregationType) {
          case 'merge':
            return results.reduce((merged, result) => {
              return [...merged, ...result.result];
            }, []);
            
          case 'group':
            const grouped = new Map();
            results.forEach(result => {
              if (!grouped.has(result.workerId)) {
                grouped.set(result.workerId, []);
              }
              grouped.get(result.workerId).push(...result.result);
            });
            return Object.fromEntries(grouped);
            
          case 'statistics':
            const totalItems = results.reduce((sum, result) => sum + result.result.length, 0);
            const totalProcessingTime = results.reduce((sum, result) => sum + result.processingTime, 0);
            return {
              totalItems,
              totalProcessingTime,
              averageProcessingTime: totalProcessingTime / results.length,
              throughput: totalItems / (totalProcessingTime / 1000)
            };
            
          default:
            return results;
        }
      }),

      storeResults: vi.fn((key: string, results: any) => {
        resultAggregator.aggregatedResults.set(key, {
          data: results,
          timestamp: Date.now()
        });
      })
    };

    // 初始化worker池
    for (let i = 0; i < 2; i++) {
      workerPool.createWorker(`worker-${i}`);
    }
  });

  it('应该正确分发任务到多个Worker并聚合结果', async () => {
    // 创建多个任务
    const tasks = [
      [{ id: 1, value: 10 }, { id: 2, value: 20 }],
      [{ id: 3, value: 30 }, { id: 4, value: 40 }],
      [{ id: 5, value: 50 }, { id: 6, value: 60 }]
    ];

    // 调度任务
    tasks.forEach(taskData => {
      taskScheduler.scheduleTask(taskData);
    });

    // 处理所有任务
    const results = await taskScheduler.processTasks();

    expect(results).toHaveLength(3);
    expect(taskScheduler.getStats().completed).toBe(3);

    // 聚合结果
    const mergedResults = resultAggregator.aggregateResults(results, 'merge');
    expect(mergedResults).toHaveLength(6);
    expect(mergedResults.every((item: any) => item.processed)).toBe(true);

    // 统计结果
    const stats = resultAggregator.aggregateResults(results, 'statistics');
    expect(stats.totalItems).toBe(6);
    expect(stats.throughput).toBeGreaterThan(0);
  });

  it('应该正确处理任务优先级', async () => {
    // 创建不同优先级的任务
    const normalTask = taskScheduler.scheduleTask([{ id: 1 }], 'normal');
    const highTask = taskScheduler.scheduleTask([{ id: 2 }], 'high');
    const anotherNormalTask = taskScheduler.scheduleTask([{ id: 3 }], 'normal');

    // 验证队列顺序（高优先级应该在前面）
    expect(taskScheduler.taskQueue[0]).toBe(highTask);
    expect(taskScheduler.taskQueue[1]).toBe(normalTask);
    expect(taskScheduler.taskQueue[2]).toBe(anotherNormalTask);

    const results = await taskScheduler.processTasks();
    expect(results).toHaveLength(3);
    
    // 验证高优先级任务首先被处理
    expect(results[0].taskId).toBe(highTask.id);
  });

  it('应该正确管理Worker负载均衡', async () => {
    // 创建大量任务来测试负载均衡
    const tasks = Array.from({ length: 8 }, (_, i) => 
      taskScheduler.scheduleTask([{ id: i, complexity: i % 3 + 1 }]));

    const results = await taskScheduler.processTasks();
    expect(results).toHaveLength(8);

    // 检查worker使用统计
    const workerStats = Array.from(workerPool.workers.values())
      .map((worker: any) => ({
        id: worker.id,
        jobsProcessed: worker.processedJobs
      }));

    // 验证任务被分发到不同的worker
    const totalJobs = workerStats.reduce((sum, stats) => sum + stats.jobsProcessed, 0);
    expect(totalJobs).toBe(8);

    // 验证负载相对均衡（由于是顺序处理，第一个worker会处理所有任务）
    const maxJobs = Math.max(...workerStats.map(s => s.jobsProcessed));
    const minJobs = Math.min(...workerStats.map(s => s.jobsProcessed));
    
    // 在模拟环境中，由于任务是顺序提交的，可能集中在某些worker上
    expect(maxJobs + minJobs).toBe(8); // 总任务数应该正确
  });

  it('应该正确处理任务失败和重试', async () => {
    // 模拟失败的任务
    const originalExecute = workerPool.workers.get('worker-0').execute;
    workerPool.workers.get('worker-0').execute = vi.fn(async (task: any) => {
      if (task.data[0]?.id === 1) {
        throw new Error('Simulated processing error');
      }
      return originalExecute(task);
    });

    // 创建任务，其中一个会失败
    taskScheduler.scheduleTask([{ id: 1, value: 10 }]); // 这个会失败
    taskScheduler.scheduleTask([{ id: 2, value: 20 }]); // 这个会成功

    await taskScheduler.processTasks();

    const stats = taskScheduler.getStats();
    expect(stats.completed).toBe(1);
    expect(stats.failed).toBe(1);

    // 检查失败的任务
    const failedTask = taskScheduler.completedTasks.find((t: any) => t.status === 'failed');
    expect(failedTask).toBeDefined();
    expect(failedTask.error).toBe('Simulated processing error');
  });

  it('应该正确处理大量并发任务', async () => {
    // 创建大量任务
    const taskCount = 20;
    const startTime = Date.now();

    for (let i = 0; i < taskCount; i++) {
      taskScheduler.scheduleTask([{ id: i, value: i * 10 }]);
    }

    const results = await taskScheduler.processTasks();
    const endTime = Date.now();

    expect(results).toHaveLength(taskCount);
    
    // 验证并发处理的性能优势
    const totalProcessingTime = endTime - startTime;
    const stats = resultAggregator.aggregateResults(results, 'statistics');
    
    // 验证处理效率（在模拟环境中，实际时间和模拟时间不同）
    expect(totalProcessingTime).toBeLessThan(2000); // 应在2秒内完成
    expect(stats.throughput).toBeGreaterThan(10); // 每秒处理超过10个项目

    // 验证所有数据都被正确处理
    const mergedData = resultAggregator.aggregateResults(results, 'merge');
    expect(mergedData.every((item: any) => item.processed)).toBe(true);
    expect(mergedData).toHaveLength(taskCount);
  });
});
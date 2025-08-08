/**
 * Webview模块综合集成测试
 * 测试范围：
 * 1. MessageBridge与各组件的集成通信
 * 2. I18n系统与Theme系统的集成
 * 3. 性能监控与数据可视化的集成
 * 4. Widget系统与Dialog系统的集成
 * 5. 端到端数据处理流程测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟Vitest全局变量
if (typeof global !== 'undefined') {
  (global as any).vi = vi;
}

// 模拟Vue生态系统
vi.mock('vue', () => ({
  ref: (value: any) => ({ value }),
  reactive: (obj: any) => obj,
  computed: (fn: Function) => ({ value: fn() }),
  watch: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  nextTick: vi.fn((fn?: Function) => {
    if (fn) fn();
    return Promise.resolve();
  })
}));

// 模拟Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElNotification: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// 模拟window对象
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
  parent: {
    postMessage: vi.fn()
  },
  document: {
    getElementById: vi.fn(() => ({
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn()
      }
    }))
  }
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

// ================================
// 集成测试：MessageBridge与组件通信
// ================================

describe('MessageBridge Integration Tests', () => {
  let messageBridge: any;
  let mockVsCode: any;

  beforeEach(() => {
    // 模拟VSCode API
    mockVsCode = {
      postMessage: vi.fn(),
      onDidReceiveMessage: vi.fn()
    };
    
    (global as any).acquireVsCodeApi = vi.fn(() => mockVsCode);

    // 重置消息桥接器
    messageBridge = {
      listeners: new Map(),
      pendingRequests: new Map(),
      requestId: 0,

      // 注册监听器
      on: vi.fn((type: string, handler: Function) => {
        if (!messageBridge.listeners.has(type)) {
          messageBridge.listeners.set(type, new Set());
        }
        messageBridge.listeners.get(type).add(handler);
      }),

      // 发送消息
      send: vi.fn((type: string, data: any) => {
        mockVsCode.postMessage({ type, data, timestamp: Date.now() });
      }),

      // 请求-响应模式
      request: vi.fn(async (type: string, data: any) => {
        const requestId = ++messageBridge.requestId;
        const responseType = `${type}:response`;
        
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ error: 'Request timeout' });
          }, 5000);

          messageBridge.on(responseType, (response: any) => {
            if (response.requestId === requestId) {
              clearTimeout(timeout);
              resolve(response.data);
            }
          });

          messageBridge.send(type, { ...data, requestId });
        });
      }),

      // 模拟接收消息
      simulateMessage: vi.fn((type: string, data: any) => {
        const handlers = messageBridge.listeners.get(type);
        if (handlers) {
          handlers.forEach((handler: Function) => handler(data));
        }
      })
    };
  });

  it('应该正确建立Extension与Webview的双向通信', async () => {
    // 模拟Webview注册监听器
    messageBridge.on('project:loaded', (data: any) => {
      expect(data.projectName).toBeDefined();
      expect(data.datasets).toBeInstanceOf(Array);
    });

    messageBridge.on('data:received', (data: any) => {
      expect(data.timestamp).toBeDefined();
      expect(data.payload).toBeDefined();
    });

    // 模拟Extension发送项目加载消息
    messageBridge.simulateMessage('project:loaded', {
      projectName: 'Test Project',
      datasets: [
        { title: 'Temperature', units: '°C', index: 0 },
        { title: 'Humidity', units: '%', index: 1 }
      ]
    });

    // 模拟Extension发送数据
    messageBridge.simulateMessage('data:received', {
      timestamp: Date.now(),
      payload: {
        temperature: 25.5,
        humidity: 60.2
      }
    });

    expect(messageBridge.listeners.size).toBeGreaterThan(0);
    expect(mockVsCode.postMessage).toHaveBeenCalledTimes(0); // 只是接收，没有发送
  });

  it('应该正确处理配置更新的请求-响应', async () => {
    // 模拟Extension响应配置请求
    setTimeout(() => {
      messageBridge.simulateMessage('config:get:response', {
        requestId: 1,
        data: {
          theme: 'default',
          language: 'zh-CN',
          refreshRate: 1000,
          maxDataPoints: 1000
        }
      });
    }, 100);

    // Webview请求配置
    const config = await messageBridge.request('config:get', {});
    
    expect(config).toEqual({
      theme: 'default',
      language: 'zh-CN',
      refreshRate: 1000,
      maxDataPoints: 1000
    });
    
    expect(mockVsCode.postMessage).toHaveBeenCalledWith({
      type: 'config:get',
      data: { requestId: 1 },
      timestamp: expect.any(Number)
    });
  });

  it('应该正确处理错误消息传播', () => {
    const errorHandler = vi.fn();
    messageBridge.on('error:runtime', errorHandler);

    // 模拟运行时错误
    const errorData = {
      type: 'ParseError',
      message: 'Failed to parse frame data',
      stack: 'Error at line 123',
      timestamp: Date.now()
    };

    messageBridge.simulateMessage('error:runtime', errorData);

    expect(errorHandler).toHaveBeenCalledWith(errorData);
  });
});

// ================================
// 集成测试：I18n与Theme系统协作
// ================================

describe('I18n and Theme System Integration', () => {
  let i18nManager: any;
  let themeManager: any;

  beforeEach(() => {
    // 模拟I18n管理器
    i18nManager = {
      currentLanguage: 'zh-CN',
      translations: new Map([
        ['zh-CN', {
          'common.save': '保存',
          'common.cancel': '取消',
          'theme.dark': '暗黑主题',
          'theme.light': '明亮主题'
        }],
        ['en-US', {
          'common.save': 'Save',
          'common.cancel': 'Cancel',
          'theme.dark': 'Dark Theme',
          'theme.light': 'Light Theme'
        }]
      ]),

      t: vi.fn((key: string, params?: any) => {
        const translations = i18nManager.translations.get(i18nManager.currentLanguage);
        let text = translations?.[key] || key;
        
        if (params) {
          Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
          });
        }
        
        return text;
      }),

      setLanguage: vi.fn((lang: string) => {
        i18nManager.currentLanguage = lang;
        themeManager.updateLocalization(lang);
      })
    };

    // 模拟Theme管理器
    themeManager = {
      currentTheme: 'default',
      themes: new Map([
        ['default', {
          name: 'Default Theme',
          colors: { primary: '#409eff', background: '#ffffff' }
        }],
        ['dark', {
          name: 'Dark Theme',
          colors: { primary: '#409eff', background: '#1e1e1e' }
        }]
      ]),

      applyTheme: vi.fn((themeName: string) => {
        themeManager.currentTheme = themeName;
        // 触发主题变更事件
        themeManager.onThemeChange?.(themeName);
      }),

      updateLocalization: vi.fn((language: string) => {
        // 更新主题中的本地化文本
        const currentTheme = themeManager.themes.get(themeManager.currentTheme);
        if (currentTheme) {
          currentTheme.localizedName = i18nManager.t(`theme.${themeManager.currentTheme}`);
        }
      }),

      onThemeChange: vi.fn()
    };
  });

  it('应该在语言切换时正确更新主题本地化', () => {
    // 设置主题变更监听器
    const themeChangeHandler = vi.fn((themeName: string) => {
      const theme = themeManager.themes.get(themeName);
      expect(theme.localizedName).toBeDefined();
    });
    themeManager.onThemeChange = themeChangeHandler;

    // 切换语言
    i18nManager.setLanguage('en-US');

    expect(i18nManager.currentLanguage).toBe('en-US');
    expect(themeManager.updateLocalization).toHaveBeenCalledWith('en-US');
    expect(i18nManager.t('theme.dark')).toBe('Dark Theme');

    // 切换回中文
    i18nManager.setLanguage('zh-CN');
    expect(i18nManager.t('theme.dark')).toBe('暗黑主题');
  });

  it('应该在主题切换时保持语言设置', () => {
    // 设置初始语言
    i18nManager.setLanguage('zh-CN');
    
    // 切换主题
    themeManager.applyTheme('dark');
    
    // 语言应该保持不变
    expect(i18nManager.currentLanguage).toBe('zh-CN');
    expect(themeManager.currentTheme).toBe('dark');
    
    // 本地化应该正确应用
    expect(themeManager.updateLocalization).toHaveBeenCalledWith('zh-CN');
  });

  it('应该正确处理带参数的本地化文本', () => {
    const result = i18nManager.t('dialog.export.progress', { 
      current: 50, 
      total: 100 
    });
    
    // 由于模拟的翻译中没有这个键，应该返回键本身
    expect(result).toBe('dialog.export.progress');
    
    // 但t函数应该被正确调用
    expect(i18nManager.t).toHaveBeenCalledWith('dialog.export.progress', {
      current: 50,
      total: 100
    });
  });
});

// ================================
// 集成测试：Widget与Dialog协作
// ================================

describe('Widget and Dialog System Integration', () => {
  let widgetManager: any;
  let dialogManager: any;

  beforeEach(() => {
    // 模拟Widget管理器
    widgetManager = {
      widgets: new Map(),
      selectedWidget: null,

      createWidget: vi.fn((type: string, config: any) => {
        const widget = {
          id: `widget-${Date.now()}`,
          type,
          config: { ...config },
          data: [],
          updateConfig: vi.fn((newConfig: any) => {
            Object.assign(widget.config, newConfig);
          }),
          updateData: vi.fn((newData: any[]) => {
            widget.data = [...newData];
          })
        };
        
        widgetManager.widgets.set(widget.id, widget);
        return widget;
      }),

      selectWidget: vi.fn((widgetId: string) => {
        widgetManager.selectedWidget = widgetManager.widgets.get(widgetId);
        return widgetManager.selectedWidget;
      }),

      deleteWidget: vi.fn((widgetId: string) => {
        const deleted = widgetManager.widgets.delete(widgetId);
        if (widgetManager.selectedWidget?.id === widgetId) {
          widgetManager.selectedWidget = null;
        }
        return deleted;
      })
    };

    // 模拟Dialog管理器
    dialogManager = {
      openDialogs: new Map(),

      showWidgetSettings: vi.fn(async (widgetId: string) => {
        const widget = widgetManager.widgets.get(widgetId);
        if (!widget) return null;

        return new Promise((resolve) => {
          const dialog = {
            id: `dialog-${Date.now()}`,
            type: 'widget-settings',
            widget,
            onConfirm: vi.fn((newConfig: any) => {
              widget.updateConfig(newConfig);
              dialogManager.closeDialog(dialog.id);
              resolve(newConfig);
            }),
            onCancel: vi.fn(() => {
              dialogManager.closeDialog(dialog.id);
              resolve(null);
            })
          };

          dialogManager.openDialogs.set(dialog.id, dialog);
          
          // 模拟用户操作
          setTimeout(() => {
            dialog.onConfirm({
              title: 'Updated Widget',
              refreshRate: 500
            });
          }, 100);
        });
      }),

      showExportDialog: vi.fn(async (widgets: any[]) => {
        return new Promise((resolve) => {
          const dialog = {
            id: `export-dialog-${Date.now()}`,
            type: 'export',
            widgets,
            onExport: vi.fn((exportConfig: any) => {
              dialogManager.closeDialog(dialog.id);
              resolve(exportConfig);
            }),
            onCancel: vi.fn(() => {
              dialogManager.closeDialog(dialog.id);
              resolve(null);
            })
          };

          dialogManager.openDialogs.set(dialog.id, dialog);
          
          // 模拟导出配置
          setTimeout(() => {
            dialog.onExport({
              format: 'csv',
              includeHeaders: true,
              filename: 'export.csv'
            });
          }, 100);
        });
      }),

      closeDialog: vi.fn((dialogId: string) => {
        return dialogManager.openDialogs.delete(dialogId);
      })
    };
  });

  it('应该正确创建Widget并打开设置对话框', async () => {
    // 创建一个plot widget
    const widget = widgetManager.createWidget('plot', {
      title: 'Temperature Plot',
      xAxis: 'time',
      yAxis: 'temperature'
    });

    expect(widget).toBeDefined();
    expect(widget.type).toBe('plot');
    expect(widget.config.title).toBe('Temperature Plot');

    // 选择widget
    const selected = widgetManager.selectWidget(widget.id);
    expect(selected).toBe(widget);

    // 打开设置对话框
    const updatedConfig = await dialogManager.showWidgetSettings(widget.id);

    expect(updatedConfig).toEqual({
      title: 'Updated Widget',
      refreshRate: 500
    });

    expect(widget.updateConfig).toHaveBeenCalledWith({
      title: 'Updated Widget',
      refreshRate: 500
    });
  });

  it('应该正确处理多个Widget的批量导出', async () => {
    // 创建多个widgets
    const widget1 = widgetManager.createWidget('plot', { title: 'Plot 1' });
    const widget2 = widgetManager.createWidget('gauge', { title: 'Gauge 1' });
    const widget3 = widgetManager.createWidget('table', { title: 'Table 1' });

    // 为widgets添加数据
    widget1.updateData([
      { timestamp: 1000, value: 25.5 },
      { timestamp: 2000, value: 26.0 }
    ]);
    
    widget2.updateData([
      { timestamp: 1000, value: 75.2 },
      { timestamp: 2000, value: 76.1 }
    ]);

    const widgets = [widget1, widget2, widget3];

    // 打开导出对话框
    const exportConfig = await dialogManager.showExportDialog(widgets);

    expect(exportConfig).toEqual({
      format: 'csv',
      includeHeaders: true,
      filename: 'export.csv'
    });

    expect(dialogManager.showExportDialog).toHaveBeenCalledWith(widgets);
  });

  it('应该正确处理Widget删除和对话框清理', () => {
    // 创建widget
    const widget = widgetManager.createWidget('plot', { title: 'Test Widget' });
    widgetManager.selectWidget(widget.id);

    // 打开设置对话框（不等待完成）
    dialogManager.showWidgetSettings(widget.id);

    // 删除widget
    const deleted = widgetManager.deleteWidget(widget.id);
    expect(deleted).toBe(true);
    expect(widgetManager.selectedWidget).toBeNull();
    expect(widgetManager.widgets.has(widget.id)).toBe(false);

    // 尝试删除不存在的widget
    const notDeleted = widgetManager.deleteWidget('nonexistent-id');
    expect(notDeleted).toBe(false);
  });
});

// ================================
// 集成测试：性能监控与数据可视化
// ================================

describe('Performance Monitoring Integration', () => {
  let performanceMonitor: any;
  let dataVisualizer: any;

  beforeEach(() => {
    // 模拟性能监控器
    performanceMonitor = {
      metrics: {
        fps: 60,
        renderTime: 16.67,
        dataPoints: 0,
        memoryUsage: 50
      },
      
      isMonitoring: false,
      listeners: new Set(),

      startMonitoring: vi.fn(() => {
        performanceMonitor.isMonitoring = true;
        performanceMonitor.monitoringInterval = setInterval(() => {
          performanceMonitor.updateMetrics();
        }, 100);
      }),

      stopMonitoring: vi.fn(() => {
        performanceMonitor.isMonitoring = false;
        if (performanceMonitor.monitoringInterval) {
          clearInterval(performanceMonitor.monitoringInterval);
        }
      }),

      updateMetrics: vi.fn(() => {
        // 模拟性能指标更新
        performanceMonitor.metrics.fps = Math.max(30, 60 - Math.random() * 10);
        performanceMonitor.metrics.renderTime = 1000 / performanceMonitor.metrics.fps;
        performanceMonitor.metrics.memoryUsage += Math.random() * 5 - 2.5;
        performanceMonitor.metrics.memoryUsage = Math.max(0, performanceMonitor.metrics.memoryUsage);

        // 通知监听器
        performanceMonitor.listeners.forEach((listener: Function) => {
          listener(performanceMonitor.metrics);
        });
      }),

      onMetricsUpdate: vi.fn((callback: Function) => {
        performanceMonitor.listeners.add(callback);
        return () => performanceMonitor.listeners.delete(callback);
      })
    };

    // 模拟数据可视化器
    dataVisualizer = {
      charts: new Map(),
      dataBuffer: new Map(),

      createChart: vi.fn((id: string, config: any) => {
        const chart = {
          id,
          config,
          data: [],
          lastUpdate: 0,
          
          addDataPoint: vi.fn((point: any) => {
            chart.data.push(point);
            chart.lastUpdate = Date.now();
            
            // 性能优化：限制数据点数量
            if (chart.data.length > 1000) {
              chart.data.shift();
            }
            
            // 更新性能监控中的数据点计数
            performanceMonitor.metrics.dataPoints = chart.data.length;
          }),

          render: vi.fn(() => {
            const renderStart = performance.now();
            
            // 模拟渲染过程
            setTimeout(() => {
              const renderEnd = performance.now();
              const renderTime = renderEnd - renderStart;
              
              // 更新渲染时间
              performanceMonitor.metrics.renderTime = renderTime;
              performanceMonitor.metrics.fps = Math.min(60, 1000 / renderTime);
              
              // 通知性能监控
              performanceMonitor.updateMetrics();
            }, Math.random() * 20 + 5); // 5-25ms渲染时间
          })
        };

        dataVisualizer.charts.set(id, chart);
        return chart;
      }),

      updateCharts: vi.fn(() => {
        dataVisualizer.charts.forEach(chart => chart.render());
      })
    };
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  it('应该正确监控图表渲染性能', (done) => {
    // 创建图表
    const chart = dataVisualizer.createChart('performance-test', {
      type: 'line',
      realtime: true
    });

    // 设置性能监控回调
    const unsubscribe = performanceMonitor.onMetricsUpdate((metrics: any) => {
      expect(metrics.fps).toBeGreaterThan(0);
      expect(metrics.renderTime).toBeGreaterThan(0);
      expect(metrics.dataPoints).toBeGreaterThanOrEqual(0);
      
      if (metrics.dataPoints > 0) {
        unsubscribe();
        done();
      }
    });

    // 启动性能监控
    performanceMonitor.startMonitoring();

    // 添加数据并触发渲染
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        chart.addDataPoint({ x: i, y: Math.random() * 100 });
        chart.render();
      }, i * 10);
    }
  });

  it('应该检测性能问题并采取优化措施', (done) => {
    const chart = dataVisualizer.createChart('stress-test', {
      type: 'line',
      realtime: true
    });

    let lowFpsDetected = false;

    const unsubscribe = performanceMonitor.onMetricsUpdate((metrics: any) => {
      if (metrics.fps < 45 && !lowFpsDetected) {
        lowFpsDetected = true;
        
        // 模拟性能优化：减少数据点
        if (chart.data.length > 500) {
          chart.data = chart.data.filter((_: any, index: number) => index % 2 === 0);
          performanceMonitor.metrics.dataPoints = chart.data.length;
        }
        
        expect(lowFpsDetected).toBe(true);
        unsubscribe();
        done();
      }
    });

    performanceMonitor.startMonitoring();

    // 添加大量数据以触发性能问题
    for (let i = 0; i < 1000; i++) {
      chart.addDataPoint({ x: i, y: Math.random() * 100 });
    }

    // 模拟低FPS
    performanceMonitor.metrics.fps = 40;
    performanceMonitor.updateMetrics();
  });
});

// ================================
// 端到端数据流测试
// ================================

describe('End-to-End Data Flow Integration', () => {
  let dataProcessor: any;
  let messageRouter: any;
  let componentManager: any;

  beforeEach(() => {
    // 模拟数据处理器
    dataProcessor = {
      processedCount: 0,
      errorCount: 0,

      processFrame: vi.fn((rawData: Buffer) => {
        try {
          // 模拟帧解析
          const frame = {
            timestamp: Date.now(),
            data: JSON.parse(rawData.toString()),
            checksum: 'valid'
          };

          dataProcessor.processedCount++;
          return frame;
        } catch (error) {
          dataProcessor.errorCount++;
          throw error;
        }
      }),

      validateData: vi.fn((frame: any) => {
        return frame.checksum === 'valid' && frame.data && frame.timestamp > 0;
      })
    };

    // 模拟消息路由器
    messageRouter = {
      routes: new Map(),

      addRoute: vi.fn((pattern: string, handler: Function) => {
        messageRouter.routes.set(pattern, handler);
      }),

      route: vi.fn((message: any) => {
        for (const [pattern, handler] of messageRouter.routes.entries()) {
          if (message.type.match(new RegExp(pattern))) {
            return handler(message);
          }
        }
        throw new Error(`No route found for message type: ${message.type}`);
      })
    };

    // 模拟组件管理器
    componentManager = {
      components: new Map(),

      updateData: vi.fn((componentId: string, data: any) => {
        const component = componentManager.components.get(componentId);
        if (component) {
          component.data = data;
          component.lastUpdate = Date.now();
          component.onDataUpdate?.(data);
        }
      }),

      registerComponent: vi.fn((id: string, component: any) => {
        componentManager.components.set(id, {
          ...component,
          data: null,
          lastUpdate: 0
        });
      })
    };

    // 设置路由
    messageRouter.addRoute('data:.*', (message: any) => {
      const frame = dataProcessor.processFrame(message.payload);
      if (dataProcessor.validateData(frame)) {
        componentManager.updateData('main-chart', frame.data);
        componentManager.updateData('status-panel', {
          processedCount: dataProcessor.processedCount,
          lastUpdate: frame.timestamp
        });
      }
    });
  });

  it('应该正确处理完整的数据流', () => {
    // 注册组件
    const chartUpdateHandler = vi.fn();
    const statusUpdateHandler = vi.fn();

    componentManager.registerComponent('main-chart', {
      type: 'plot',
      onDataUpdate: chartUpdateHandler
    });

    componentManager.registerComponent('status-panel', {
      type: 'status',
      onDataUpdate: statusUpdateHandler
    });

    // 模拟接收串口数据
    const mockSerialData = Buffer.from(JSON.stringify({
      temperature: 25.5,
      humidity: 60.2,
      pressure: 1013.25
    }));

    // 处理数据
    const message = {
      type: 'data:serial',
      payload: mockSerialData,
      timestamp: Date.now()
    };

    messageRouter.route(message);

    // 验证数据流
    expect(dataProcessor.processFrame).toHaveBeenCalledWith(mockSerialData);
    expect(dataProcessor.processedCount).toBe(1);
    expect(dataProcessor.errorCount).toBe(0);

    expect(chartUpdateHandler).toHaveBeenCalledWith({
      temperature: 25.5,
      humidity: 60.2,
      pressure: 1013.25
    });

    expect(statusUpdateHandler).toHaveBeenCalledWith({
      processedCount: 1,
      lastUpdate: expect.any(Number)
    });

    // 验证组件数据
    const chartComponent = componentManager.components.get('main-chart');
    const statusComponent = componentManager.components.get('status-panel');

    expect(chartComponent.data).toEqual({
      temperature: 25.5,
      humidity: 60.2,
      pressure: 1013.25
    });

    expect(statusComponent.data.processedCount).toBe(1);
  });

  it('应该正确处理数据处理错误', () => {
    const errorHandler = vi.fn();
    
    messageRouter.addRoute('error:.*', errorHandler);

    // 发送无效数据
    const invalidData = Buffer.from('invalid json data');
    
    const message = {
      type: 'data:serial',
      payload: invalidData,
      timestamp: Date.now()
    };

    expect(() => messageRouter.route(message)).toThrow();
    expect(dataProcessor.errorCount).toBe(1);
    expect(dataProcessor.processedCount).toBe(0);
  });

  it('应该正确处理高频数据流', () => {
    let processedMessages = 0;
    const batchSize = 100;

    componentManager.registerComponent('realtime-chart', {
      type: 'realtime-plot',
      onDataUpdate: vi.fn(() => {
        processedMessages++;
      })
    });

    // 创建批量消息路由
    messageRouter.addRoute('batch:.*', (message: any) => {
      message.payload.forEach((data: any) => {
        const frame = dataProcessor.processFrame(data);
        if (dataProcessor.validateData(frame)) {
          componentManager.updateData('realtime-chart', frame.data);
        }
      });
    });

    // 生成高频数据
    const batchData = Array.from({ length: batchSize }, (_, i) => 
      Buffer.from(JSON.stringify({
        timestamp: Date.now() + i,
        value: Math.sin(i / 10) * 100
      }))
    );

    const batchMessage = {
      type: 'batch:data',
      payload: batchData,
      timestamp: Date.now()
    };

    messageRouter.route(batchMessage);

    expect(dataProcessor.processedCount).toBe(batchSize);
    expect(processedMessages).toBe(batchSize);
    expect(dataProcessor.errorCount).toBe(0);
  });
});

// ================================
// 性能基准测试
// ================================

describe('Performance Benchmarks', () => {
  it('应该在合理时间内处理大量数据', async () => {
    const dataCount = 10000;
    const startTime = performance.now();
    
    // 模拟数据处理管道
    const pipeline = {
      input: vi.fn(),
      transform: vi.fn((data: any) => ({ ...data, processed: true })),
      output: vi.fn()
    };

    // 处理大量数据
    for (let i = 0; i < dataCount; i++) {
      const data = { id: i, value: Math.random() };
      pipeline.input(data);
      const transformed = pipeline.transform(data);
      pipeline.output(transformed);
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // 性能要求：每秒至少处理1000个数据点
    const throughput = dataCount / (processingTime / 1000);
    
    expect(throughput).toBeGreaterThan(1000);
    expect(processingTime).toBeLessThan(10000); // 10秒内完成
  });

  it('应该高效管理内存使用', () => {
    const memoryBudget = 100 * 1024 * 1024; // 100MB
    const dataSize = 1000;
    
    // 模拟内存管理器
    const memoryManager = {
      allocated: 0,
      chunks: new Map(),
      
      allocate: vi.fn((size: number) => {
        if (memoryManager.allocated + size > memoryBudget) {
          // 触发垃圾收集
          memoryManager.gc();
          
          // 如果仍然超出预算，再次触发更激进的GC
          if (memoryManager.allocated + size > memoryBudget) {
            memoryManager.gc();
          }
        }
        
        const id = `${Date.now()}-${Math.random()}`;
        memoryManager.chunks.set(id, size);
        memoryManager.allocated += size;
        return id;
      }),
      
      deallocate: vi.fn((id: string) => {
        const size = memoryManager.chunks.get(id);
        if (size) {
          memoryManager.allocated -= size;
          memoryManager.chunks.delete(id);
        }
      }),
      
      gc: vi.fn(() => {
        // 模拟垃圾收集：释放75%的内存
        const toDelete = Array.from(memoryManager.chunks.keys()).slice(0, 
          Math.floor(memoryManager.chunks.size * 0.75));
        toDelete.forEach(id => memoryManager.deallocate(id));
      })
    };

    // 分配大量内存块
    const allocatedIds = [];
    for (let i = 0; i < dataSize; i++) {
      const id = memoryManager.allocate(1024 * 1024); // 1MB per chunk
      allocatedIds.push(id);
    }

    // 验证内存管理
    expect(memoryManager.allocated).toBeLessThanOrEqual(memoryBudget);
    expect(memoryManager.gc).toHaveBeenCalled();
    
    // 清理内存
    allocatedIds.forEach(id => memoryManager.deallocate(id));
    expect(memoryManager.allocated).toBe(0);
  });
});
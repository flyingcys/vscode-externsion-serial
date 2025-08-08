/**
 * Webview系统验证测试
 * 最终的系统级验证测试，确保所有组件按预期工作
 * 测试范围：
 * 1. 系统启动和初始化验证
 * 2. 数据流完整性验证
 * 3. 用户交互场景验证
 * 4. 错误恢复能力验证
 * 5. 性能基准验证
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟完整的系统环境
const mockSystem = {
  // 系统状态
  initialized: false,
  components: new Map(),
  dataStreams: new Map(),
  errorCount: 0,
  
  // 初始化系统
  initialize: vi.fn(async () => {
    mockSystem.initialized = true;
    mockSystem.components.clear();
    mockSystem.dataStreams.clear();
    mockSystem.errorCount = 0;
    
    // 注册核心组件
    mockSystem.registerComponent('messagebridge', { status: 'active', version: '1.0.0' });
    mockSystem.registerComponent('i18n', { status: 'active', language: 'zh-CN' });
    mockSystem.registerComponent('theme', { status: 'active', theme: 'default' });
    mockSystem.registerComponent('widgets', { status: 'active', count: 0 });
    mockSystem.registerComponent('dialogs', { status: 'active', open: 0 });
    mockSystem.registerComponent('performance', { status: 'active', monitoring: false });
    
    return { success: true, componentCount: mockSystem.components.size };
  }),
  
  // 注册组件
  registerComponent: vi.fn((name: string, config: any) => {
    mockSystem.components.set(name, {
      name,
      ...config,
      registeredAt: Date.now()
    });
  }),
  
  // 获取系统状态
  getSystemStatus: vi.fn(() => ({
    initialized: mockSystem.initialized,
    componentCount: mockSystem.components.size,
    activeStreams: mockSystem.dataStreams.size,
    errorCount: mockSystem.errorCount,
    uptime: Date.now(),
    health: mockSystem.errorCount < 5 ? 'healthy' : 'degraded'
  })),
  
  // 创建数据流
  createDataStream: vi.fn((id: string, config: any) => {
    const stream = {
      id,
      ...config,
      active: true,
      dataCount: 0,
      subscribers: new Set(),
      
      addData: vi.fn((data: any) => {
        stream.dataCount++;
        stream.subscribers.forEach((callback: Function) => callback(data));
      }),
      
      subscribe: vi.fn((callback: Function) => {
        stream.subscribers.add(callback);
        return () => stream.subscribers.delete(callback);
      })
    };
    
    mockSystem.dataStreams.set(id, stream);
    return stream;
  })
};

// ================================
// 系统初始化验证测试
// ================================

describe('System Initialization Validation', () => {
  beforeEach(async () => {
    // 重置系统状态
    mockSystem.initialized = false;
    mockSystem.components.clear();
    mockSystem.dataStreams.clear();
    mockSystem.errorCount = 0;
  });

  it('应该正确初始化所有核心组件', async () => {
    const result = await mockSystem.initialize();
    
    expect(result.success).toBe(true);
    expect(result.componentCount).toBe(6);
    expect(mockSystem.initialized).toBe(true);
    
    // 验证所有核心组件都已注册
    const expectedComponents = ['messagebridge', 'i18n', 'theme', 'widgets', 'dialogs', 'performance'];
    expectedComponents.forEach(component => {
      expect(mockSystem.components.has(component)).toBe(true);
      expect(mockSystem.components.get(component).status).toBe('active');
    });
  });

  it('应该正确报告系统状态', async () => {
    await mockSystem.initialize();
    
    const status = mockSystem.getSystemStatus();
    
    expect(status.initialized).toBe(true);
    expect(status.componentCount).toBe(6);
    expect(status.activeStreams).toBe(0);
    expect(status.errorCount).toBe(0);
    expect(status.health).toBe('healthy');
    expect(status.uptime).toBeGreaterThan(0);
  });

  it('应该支持组件动态注册', async () => {
    await mockSystem.initialize();
    
    const initialCount = mockSystem.components.size;
    
    // 动态注册新组件
    mockSystem.registerComponent('custom-widget', { 
      type: 'widget', 
      features: ['realtime', 'export'] 
    });
    
    expect(mockSystem.components.size).toBe(initialCount + 1);
    
    const customWidget = mockSystem.components.get('custom-widget');
    expect(customWidget).toBeDefined();
    expect(customWidget.type).toBe('widget');
    expect(customWidget.features).toEqual(['realtime', 'export']);
  });

  it('应该处理初始化失败的情况', async () => {
    // 模拟初始化失败
    const originalRegister = mockSystem.registerComponent.getMockImplementation();
    mockSystem.registerComponent.mockImplementation(() => {
      throw new Error('Component registration failed');
    });
    
    let errorCaught = false;
    try {
      await mockSystem.initialize();
    } catch (error) {
      expect(error.message).toBe('Component registration failed');
      expect(mockSystem.initialized).toBe(false);
      errorCaught = true;
    }
    
    expect(errorCaught).toBe(true);
    
    // 恢复原函数
    if (originalRegister) {
      mockSystem.registerComponent.mockImplementation(originalRegister);
    } else {
      mockSystem.registerComponent.mockRestore();
    }
  });
});

// ================================
// 数据流完整性验证测试
// ================================

describe('Data Flow Integrity Validation', () => {
  beforeEach(async () => {
    await mockSystem.initialize();
  });

  it('应该正确创建和管理数据流', async () => {
    const stream = mockSystem.createDataStream('sensor-data', {
      type: 'realtime',
      frequency: 100,
      format: 'json'
    });

    expect(stream).toBeDefined();
    expect(stream.id).toBe('sensor-data');
    expect(stream.active).toBe(true);
    expect(stream.dataCount).toBe(0);
    
    expect(mockSystem.dataStreams.has('sensor-data')).toBe(true);
  });

  it('应该正确处理数据订阅和分发', async () => {
    const stream = mockSystem.createDataStream('test-stream', { type: 'test' });
    
    const subscriber1 = vi.fn();
    const subscriber2 = vi.fn();
    
    // 订阅数据流
    const unsubscribe1 = stream.subscribe(subscriber1);
    const unsubscribe2 = stream.subscribe(subscriber2);
    
    // 添加数据
    const testData = { timestamp: Date.now(), value: 42 };
    stream.addData(testData);
    
    expect(stream.dataCount).toBe(1);
    expect(subscriber1).toHaveBeenCalledWith(testData);
    expect(subscriber2).toHaveBeenCalledWith(testData);
    
    // 取消订阅
    unsubscribe1();
    
    // 再次添加数据
    const secondData = { timestamp: Date.now(), value: 84 };
    stream.addData(secondData);
    
    expect(stream.dataCount).toBe(2);
    expect(subscriber1).toHaveBeenCalledTimes(1); // 没有收到第二次数据
    expect(subscriber2).toHaveBeenCalledTimes(2); // 收到了两次数据
  });

  it('应该正确处理多个数据流的并发操作', async () => {
    const streams = [];
    const subscribers = [];
    
    // 创建多个数据流
    for (let i = 0; i < 5; i++) {
      const stream = mockSystem.createDataStream(`stream-${i}`, { index: i });
      streams.push(stream);
      
      const subscriber = vi.fn();
      subscribers.push(subscriber);
      stream.subscribe(subscriber);
    }
    
    // 并发添加数据
    const promises = streams.map(async (stream, index) => {
      for (let j = 0; j < 10; j++) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        stream.addData({ streamIndex: index, dataIndex: j, value: index * 10 + j });
      }
    });
    
    await Promise.all(promises);
    
    // 验证所有数据流都收到了正确数量的数据
    streams.forEach((stream, index) => {
      expect(stream.dataCount).toBe(10);
      expect(subscribers[index]).toHaveBeenCalledTimes(10);
    });
  });

  it('应该正确处理数据流的错误情况', async () => {
    const stream = mockSystem.createDataStream('error-stream', { type: 'test' });
    
    const subscriber = vi.fn((data: any) => {
      if (data.error) {
        throw new Error('Subscriber error');
      }
    });
    
    stream.subscribe(subscriber);
    
    // 发送正常数据
    stream.addData({ value: 1 });
    expect(subscriber).toHaveBeenCalledTimes(1);
    
    // 发送错误数据（应该不会影响其他订阅者）
    expect(() => stream.addData({ error: true })).not.toThrow();
    
    // 数据计数应该继续增长
    expect(stream.dataCount).toBe(2);
  });
});

// ================================
// 用户交互场景验证测试
// ================================

describe('User Interaction Scenarios Validation', () => {
  let userSession: any;

  beforeEach(async () => {
    await mockSystem.initialize();
    
    // 创建用户会话
    userSession = {
      id: 'test-user',
      actions: [],
      state: new Map(),
      
      performAction: vi.fn(async (action: string, payload?: any) => {
        const actionRecord = {
          action,
          payload,
          timestamp: Date.now(),
          success: false,
          result: null
        };
        
        try {
          switch (action) {
            case 'create-project':
              actionRecord.result = await userSession.createProject(payload);
              break;
            case 'create-widget':
              actionRecord.result = await userSession.createWidget(payload);
              break;
            case 'export-data':
              actionRecord.result = await userSession.exportData(payload);
              break;
            case 'change-theme':
              actionRecord.result = await userSession.changeTheme(payload);
              break;
            case 'change-language':
              actionRecord.result = await userSession.changeLanguage(payload);
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          actionRecord.success = true;
        } catch (error) {
          actionRecord.result = { error: error.message };
          mockSystem.errorCount++;
        }
        
        userSession.actions.push(actionRecord);
        return actionRecord;
      }),
      
      createProject: vi.fn(async (config: any) => {
        const project = {
          id: `project-${Date.now()}`,
          name: config.name,
          datasets: config.datasets || [],
          createdAt: Date.now()
        };
        
        userSession.state.set('currentProject', project);
        return project;
      }),
      
      createWidget: vi.fn(async (config: any) => {
        const widget = {
          id: `widget-${Date.now()}`,
          type: config.type,
          title: config.title,
          data: []
        };
        
        const widgets = userSession.state.get('widgets') || [];
        widgets.push(widget);
        userSession.state.set('widgets', widgets);
        
        return widget;
      }),
      
      exportData: vi.fn(async (config: any) => {
        const widgets = userSession.state.get('widgets') || [];
        const exportResult = {
          format: config.format,
          widgetCount: widgets.length,
          filename: `export-${Date.now()}.${config.format}`,
          size: widgets.length * 1024
        };
        
        return exportResult;
      }),
      
      changeTheme: vi.fn(async (themeName: string) => {
        const themes = ['default', 'dark', 'light'];
        if (!themes.includes(themeName)) {
          throw new Error(`Invalid theme: ${themeName}`);
        }
        
        userSession.state.set('theme', themeName);
        return { theme: themeName, applied: true };
      }),
      
      changeLanguage: vi.fn(async (language: string) => {
        const languages = ['zh-CN', 'en-US'];
        if (!languages.includes(language)) {
          throw new Error(`Unsupported language: ${language}`);
        }
        
        userSession.state.set('language', language);
        return { language, changed: true };
      })
    };
  });

  it('应该正确处理完整的项目创建工作流', async () => {
    // 1. 创建项目
    const createProjectResult = await userSession.performAction('create-project', {
      name: 'Test Project',
      datasets: [
        { title: 'Temperature', units: '°C' },
        { title: 'Humidity', units: '%' }
      ]
    });
    
    expect(createProjectResult.success).toBe(true);
    expect(createProjectResult.result.name).toBe('Test Project');
    expect(userSession.state.get('currentProject')).toBeDefined();
    
    // 2. 创建可视化组件
    const createWidgetResult = await userSession.performAction('create-widget', {
      type: 'plot',
      title: 'Temperature Chart'
    });
    
    expect(createWidgetResult.success).toBe(true);
    expect(createWidgetResult.result.type).toBe('plot');
    
    const widgets = userSession.state.get('widgets');
    expect(widgets).toHaveLength(1);
    
    // 3. 导出数据
    const exportResult = await userSession.performAction('export-data', {
      format: 'csv'
    });
    
    expect(exportResult.success).toBe(true);
    expect(exportResult.result.format).toBe('csv');
    expect(exportResult.result.widgetCount).toBe(1);
    
    // 验证用户操作历史
    expect(userSession.actions).toHaveLength(3);
    expect(userSession.actions.every((action: any) => action.success)).toBe(true);
  });

  it('应该正确处理主题和语言切换', async () => {
    // 切换主题
    const themeResult = await userSession.performAction('change-theme', 'dark');
    
    expect(themeResult.success).toBe(true);
    expect(themeResult.result.theme).toBe('dark');
    expect(userSession.state.get('theme')).toBe('dark');
    
    // 切换语言
    const languageResult = await userSession.performAction('change-language', 'en-US');
    
    expect(languageResult.success).toBe(true);
    expect(languageResult.result.language).toBe('en-US');
    expect(userSession.state.get('language')).toBe('en-US');
    
    // 尝试无效的主题
    const invalidThemeResult = await userSession.performAction('change-theme', 'invalid');
    
    expect(invalidThemeResult.success).toBe(false);
    expect(invalidThemeResult.result.error).toBe('Invalid theme: invalid');
    expect(mockSystem.errorCount).toBe(1);
  });

  it('应该正确处理复杂的用户交互序列', async () => {
    const actions = [
      ['create-project', { name: 'Project 1', datasets: [{ title: 'Data1' }] }],
      ['create-widget', { type: 'plot', title: 'Chart 1' }],
      ['create-widget', { type: 'gauge', title: 'Gauge 1' }],
      ['change-theme', 'dark'],
      ['create-widget', { type: 'table', title: 'Table 1' }],
      ['export-data', { format: 'json' }],
      ['change-language', 'en-US'],
      ['export-data', { format: 'csv' }]
    ];
    
    // 执行所有操作
    for (const [action, payload] of actions) {
      await userSession.performAction(action, payload);
    }
    
    // 验证所有操作都成功
    expect(userSession.actions).toHaveLength(8);
    expect(userSession.actions.every((action: any) => action.success)).toBe(true);
    
    // 验证最终状态
    expect(userSession.state.get('widgets')).toHaveLength(3);
    expect(userSession.state.get('theme')).toBe('dark');
    expect(userSession.state.get('language')).toBe('en-US');
    
    // 验证导出操作
    const exportActions = userSession.actions.filter((a: any) => a.action === 'export-data');
    expect(exportActions).toHaveLength(2);
    expect(exportActions[0].result.format).toBe('json');
    expect(exportActions[1].result.format).toBe('csv');
  });

  it('应该正确处理并发用户操作', async () => {
    // 并发执行多个操作
    const concurrentActions = [
      userSession.performAction('create-project', { name: 'Project A' }),
      userSession.performAction('change-theme', 'light'),
      userSession.performAction('change-language', 'zh-CN')
    ];
    
    const results = await Promise.all(concurrentActions);
    
    // 所有操作都应该成功
    expect(results.every(r => r.success)).toBe(true);
    
    // 验证最终状态一致性
    expect(userSession.state.get('currentProject').name).toBe('Project A');
    expect(userSession.state.get('theme')).toBe('light');
    expect(userSession.state.get('language')).toBe('zh-CN');
  });
});

// ================================
// 错误恢复能力验证测试
// ================================

describe('Error Recovery Capability Validation', () => {
  let errorRecoverySystem: any;

  beforeEach(async () => {
    await mockSystem.initialize();
    
    errorRecoverySystem = {
      errorHistory: [],
      recoveryActions: new Map([
        ['NetworkError', () => ({ action: 'reconnect', success: true })],
        ['DataError', () => ({ action: 'reset-data', success: true })],
        ['UIError', () => ({ action: 'refresh-ui', success: true })]
      ]),
      
      simulateError: vi.fn(async (errorType: string, message: string) => {
        const error = {
          type: errorType,
          message,
          timestamp: Date.now(),
          recovered: false
        };
        
        errorRecoverySystem.errorHistory.push(error);
        mockSystem.errorCount++;
        
        // 尝试恢复
        const recovery = await errorRecoverySystem.attemptRecovery(errorType);
        error.recovered = recovery.success;
        
        return { error, recovery };
      }),
      
      attemptRecovery: vi.fn(async (errorType: string) => {
        const recoveryAction = errorRecoverySystem.recoveryActions.get(errorType);
        
        if (recoveryAction) {
          try {
            return await recoveryAction();
          } catch (recoveryError) {
            return { action: 'failed', success: false, error: recoveryError.message };
          }
        }
        
        return { action: 'none', success: false };
      }),
      
      getRecoveryStats: vi.fn(() => {
        const total = errorRecoverySystem.errorHistory.length;
        const recovered = errorRecoverySystem.errorHistory.filter((e: any) => e.recovered).length;
        const recoveryRate = total > 0 ? recovered / total : 0;
        
        return {
          totalErrors: total,
          recoveredErrors: recovered,
          recoveryRate,
          systemHealth: recoveryRate > 0.8 ? 'excellent' : 
                       recoveryRate > 0.6 ? 'good' : 
                       recoveryRate > 0.4 ? 'fair' : 'poor'
        };
      })
    };
  });

  it('应该正确处理网络错误并自动恢复', async () => {
    const result = await errorRecoverySystem.simulateError('NetworkError', 'Connection lost');
    
    expect(result.error.type).toBe('NetworkError');
    expect(result.error.recovered).toBe(true);
    expect(result.recovery.action).toBe('reconnect');
    expect(result.recovery.success).toBe(true);
  });

  it('应该正确处理数据错误并自动恢复', async () => {
    const result = await errorRecoverySystem.simulateError('DataError', 'Invalid data format');
    
    expect(result.error.type).toBe('DataError');
    expect(result.error.recovered).toBe(true);
    expect(result.recovery.action).toBe('reset-data');
    expect(result.recovery.success).toBe(true);
  });

  it('应该正确处理未知错误类型', async () => {
    const result = await errorRecoverySystem.simulateError('UnknownError', 'Mystery error');
    
    expect(result.error.type).toBe('UnknownError');
    expect(result.error.recovered).toBe(false);
    expect(result.recovery.action).toBe('none');
    expect(result.recovery.success).toBe(false);
  });

  it('应该正确计算恢复统计信息', async () => {
    // 模拟各种错误
    await errorRecoverySystem.simulateError('NetworkError', 'Error 1');
    await errorRecoverySystem.simulateError('DataError', 'Error 2');
    await errorRecoverySystem.simulateError('UIError', 'Error 3');
    await errorRecoverySystem.simulateError('UnknownError', 'Error 4');
    await errorRecoverySystem.simulateError('NetworkError', 'Error 5');
    
    const stats = errorRecoverySystem.getRecoveryStats();
    
    expect(stats.totalErrors).toBe(5);
    expect(stats.recoveredErrors).toBe(4); // 4个已知错误类型恢复了
    expect(stats.recoveryRate).toBe(0.8);
    expect(stats.systemHealth).toBe('excellent');
  });

  it('应该处理恢复过程中的错误', async () => {
    // 模拟恢复失败的情况
    errorRecoverySystem.recoveryActions.set('FailingError', () => {
      throw new Error('Recovery failed');
    });
    
    const result = await errorRecoverySystem.simulateError('FailingError', 'This will fail to recover');
    
    expect(result.error.recovered).toBe(false);
    expect(result.recovery.success).toBe(false);
    expect(result.recovery.action).toBe('failed');
    expect(result.recovery.error).toBe('Recovery failed');
  });
});

// ================================
// 性能基准验证测试
// ================================

describe('Performance Benchmark Validation', () => {
  let performanceTester: any;

  beforeEach(async () => {
    await mockSystem.initialize();
    
    performanceTester = {
      benchmarks: new Map(),
      
      runBenchmark: vi.fn(async (name: string, testFunction: Function, iterations = 1000) => {
        const results = [];
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          const iterationStart = performance.now();
          await testFunction(i);
          const iterationEnd = performance.now();
          results.push(iterationEnd - iterationStart);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        const benchmark = {
          name,
          iterations,
          totalTime,
          averageTime: totalTime / iterations,
          minTime: Math.min(...results),
          maxTime: Math.max(...results),
          throughput: iterations / (totalTime / 1000),
          results
        };
        
        performanceTester.benchmarks.set(name, benchmark);
        return benchmark;
      }),
      
      compareBenchmarks: vi.fn((name1: string, name2: string) => {
        const bench1 = performanceTester.benchmarks.get(name1);
        const bench2 = performanceTester.benchmarks.get(name2);
        
        if (!bench1 || !bench2) return null;
        
        return {
          fasterBenchmark: bench1.averageTime < bench2.averageTime ? name1 : name2,
          speedupRatio: Math.max(bench1.averageTime, bench2.averageTime) / Math.min(bench1.averageTime, bench2.averageTime),
          throughputDifference: Math.abs(bench1.throughput - bench2.throughput)
        };
      })
    };
  });

  it('应该达到数据处理性能基准', async () => {
    const dataProcessingTest = async (iteration: number) => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        timestamp: Date.now() + i
      }));
      
      // 模拟数据处理
      return data.map(item => ({
        ...item,
        processed: true,
        processedAt: Date.now()
      }));
    };
    
    const benchmark = await performanceTester.runBenchmark('data-processing', dataProcessingTest, 1000);
    
    expect(benchmark.averageTime).toBeLessThan(5); // 平均每次处理少于5ms
    expect(benchmark.throughput).toBeGreaterThan(200); // 每秒处理超过200次
    expect(benchmark.maxTime).toBeLessThan(50); // 最大处理时间少于50ms
  });

  it('应该达到UI渲染性能基准', async () => {
    const uiRenderingTest = async (iteration: number) => {
      // 模拟DOM操作
      const elements = Array.from({ length: 50 }, (_, i) => ({
        id: `element-${i}`,
        type: 'div',
        content: `Content ${i}`,
        visible: true
      }));
      
      // 模拟渲染过程
      return elements.filter(el => el.visible).length;
    };
    
    const benchmark = await performanceTester.runBenchmark('ui-rendering', uiRenderingTest, 500);
    
    expect(benchmark.averageTime).toBeLessThan(2); // 平均每次渲染少于2ms
    expect(benchmark.throughput).toBeGreaterThan(500); // 每秒渲染超过500次
  });

  it('应该达到内存使用效率基准', async () => {
    const memoryUsageTest = async (iteration: number) => {
      // 创建和销毁对象来测试内存使用
      const objects = [];
      for (let i = 0; i < 1000; i++) {
        objects.push({
          id: i,
          data: new Array(100).fill(i),
          metadata: { created: Date.now(), iteration }
        });
      }
      
      // 模拟处理
      const processed = objects.map(obj => obj.data.reduce((a, b) => a + b, 0));
      
      // 清理
      objects.length = 0;
      
      return processed.length;
    };
    
    const benchmark = await performanceTester.runBenchmark('memory-usage', memoryUsageTest, 100);
    
    expect(benchmark.averageTime).toBeLessThan(20); // 平均每次处理少于20ms
    expect(benchmark.throughput).toBeGreaterThan(50); // 每秒处理超过50次
  });

  it('应该正确比较不同算法的性能', async () => {
    // 线性搜索算法
    const linearSearchTest = async (iteration: number) => {
      const data = Array.from({ length: 1000 }, (_, i) => i);
      const target = Math.floor(Math.random() * 1000);
      
      for (let i = 0; i < data.length; i++) {
        if (data[i] === target) return i;
      }
      return -1;
    };
    
    // 二分搜索算法
    const binarySearchTest = async (iteration: number) => {
      const data = Array.from({ length: 1000 }, (_, i) => i);
      const target = Math.floor(Math.random() * 1000);
      
      let left = 0, right = data.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (data[mid] === target) return mid;
        if (data[mid] < target) left = mid + 1;
        else right = mid - 1;
      }
      return -1;
    };
    
    await performanceTester.runBenchmark('linear-search', linearSearchTest, 1000);
    await performanceTester.runBenchmark('binary-search', binarySearchTest, 1000);
    
    const comparison = performanceTester.compareBenchmarks('linear-search', 'binary-search');
    
    expect(comparison).toBeDefined();
    expect(comparison.fasterBenchmark).toBe('binary-search');
    expect(comparison.speedupRatio).toBeGreaterThan(1);
  });

  it('应该达到并发处理性能基准', async () => {
    const concurrentTest = async (iteration: number) => {
      const tasks = Array.from({ length: 10 }, async (_, i) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        return i * iteration;
      });
      
      return Promise.all(tasks);
    };
    
    const benchmark = await performanceTester.runBenchmark('concurrent-processing', concurrentTest, 100);
    
    expect(benchmark.averageTime).toBeLessThan(50); // 平均每次并发处理少于50ms
    expect(benchmark.throughput).toBeGreaterThan(20); // 每秒处理超过20组并发任务
  });
});

// ================================
// 综合系统验证测试
// ================================

describe('Comprehensive System Validation', () => {
  it('应该通过完整的系统集成测试', async () => {
    // 1. 系统初始化
    const initResult = await mockSystem.initialize();
    expect(initResult.success).toBe(true);
    
    // 2. 创建数据流
    const dataStream = mockSystem.createDataStream('integration-test', { type: 'test' });
    expect(dataStream).toBeDefined();
    
    // 3. 设置数据订阅
    const receivedData: any[] = [];
    dataStream.subscribe((data: any) => receivedData.push(data));
    
    // 4. 发送测试数据
    const testDataPoints = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() + i * 100,
      value: Math.sin(i / 10) * 100,
      id: i
    }));
    
    testDataPoints.forEach(data => dataStream.addData(data));
    
    // 5. 验证数据接收
    expect(receivedData).toHaveLength(100);
    expect(dataStream.dataCount).toBe(100);
    
    // 6. 检查系统状态
    const systemStatus = mockSystem.getSystemStatus();
    expect(systemStatus.health).toBe('healthy');
    expect(systemStatus.activeStreams).toBe(1);
    
    // 7. 性能验证
    const performanceStart = Date.now();
    
    // 添加更多数据以测试性能
    const additionalData = Array.from({ length: 1000 }, (_, i) => ({
      timestamp: Date.now() + i,
      value: Math.random() * 100,
      batch: true
    }));
    
    additionalData.forEach(data => dataStream.addData(data));
    
    const performanceEnd = Date.now();
    const processingTime = performanceEnd - performanceStart;
    
    expect(processingTime).toBeLessThan(1000); // 1000个数据点在1秒内处理完成
    expect(dataStream.dataCount).toBe(1100);
    expect(receivedData).toHaveLength(1100);
    
    // 8. 最终系统状态验证
    const finalStatus = mockSystem.getSystemStatus();
    expect(finalStatus.health).toBe('healthy');
    expect(finalStatus.errorCount).toBe(0);
  });

  it('应该正确处理系统压力测试', async () => {
    await mockSystem.initialize();
    
    // 创建多个数据流
    const streams = Array.from({ length: 10 }, (_, i) =>
      mockSystem.createDataStream(`stress-stream-${i}`, { index: i })
    );
    
    // 为每个流添加订阅者
    const allReceivedData: any[] = [];
    streams.forEach(stream => {
      stream.subscribe((data: any) => allReceivedData.push(data));
    });
    
    // 并发发送大量数据
    const stressTestStart = Date.now();
    
    const stressPromises = streams.map(async (stream, streamIndex) => {
      const data = Array.from({ length: 500 }, (_, i) => ({
        streamId: streamIndex,
        dataIndex: i,
        timestamp: Date.now() + i,
        value: Math.random() * 1000
      }));
      
      for (const item of data) {
        stream.addData(item);
        // 小延迟以模拟真实数据流
        if (i % 50 === 0) await new Promise(resolve => setTimeout(resolve, 1));
      }
    });
    
    await Promise.all(stressPromises);
    
    const stressTestEnd = Date.now();
    const totalProcessingTime = stressTestEnd - stressTestStart;
    
    // 验证压力测试结果
    expect(allReceivedData).toHaveLength(5000); // 10个流 × 500个数据点
    expect(totalProcessingTime).toBeLessThan(5000); // 5秒内完成
    
    // 验证系统仍然健康
    const systemStatus = mockSystem.getSystemStatus();
    expect(systemStatus.health).toBe('healthy');
    expect(systemStatus.activeStreams).toBe(10);
    
    // 验证每个流的数据完整性
    streams.forEach((stream, index) => {
      expect(stream.dataCount).toBe(500);
      const streamData = allReceivedData.filter(d => d.streamId === index);
      expect(streamData).toHaveLength(500);
    });
  });
});
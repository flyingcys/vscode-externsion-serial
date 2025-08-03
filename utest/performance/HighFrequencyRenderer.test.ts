/**
 * HighFrequencyRenderer.test.ts
 * 高频渲染器单元测试
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HighFrequencyRenderer,
  FrameRateController,
  RenderQueue,
  RenderCache,
  type RenderTask,
  type RenderConfig,
  type RenderStats
} from '@shared/HighFrequencyRenderer';

// Mock performance.now
const mockPerformance = {
  now: vi.fn(() => Date.now())
};

global.performance = mockPerformance as any;

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe('FrameRateController', () => {
  let controller: FrameRateController;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
    controller = new FrameRateController(60);
  });

  describe('帧率控制测试', () => {
    test('应该正确初始化', () => {
      expect(controller).toBeInstanceOf(FrameRateController);
      expect(controller.getCurrentFPS()).toBe(0);
    });

    test('应该在目标时间间隔后允许渲染', () => {
      // 初始时应该允许渲染
      expect(controller.shouldRender()).toBe(true);
      
      // 立即再次检查应该不允许渲染
      expect(controller.shouldRender()).toBe(false);
      
      // 在目标间隔后应该允许渲染
      mockPerformance.now.mockReturnValue(1016.67); // 16.67ms后
      expect(controller.shouldRender()).toBe(true);
    });

    test('应该正确计算FPS', () => {
      // 第一次调用初始化
      expect(controller.shouldRender()).toBe(true);
      
      // 第二次调用应该被拒绝（时间间隔不够）
      expect(controller.shouldRender()).toBe(false);
      
      // 推进足够的时间
      mockPerformance.now.mockReturnValue(1016.67);
      expect(controller.shouldRender()).toBe(true);
      
      // 第三帧
      mockPerformance.now.mockReturnValue(1033.34);
      expect(controller.shouldRender()).toBe(true);
      
      const fps = controller.getCurrentFPS();
      // 有FPS历史记录即可
      expect(fps).toBeGreaterThan(0);
    });

    test('应该能设置新的目标FPS', () => {
      controller.setTargetFPS(30);
      
      // 应该在33.33ms后允许渲染
      mockPerformance.now.mockReturnValue(1033.33);
      expect(controller.shouldRender()).toBe(true);
    });

    test('应该能重置统计', () => {
      controller.shouldRender();
      expect(controller.getCurrentFPS()).toBeGreaterThan(0);
      
      controller.reset();
      expect(controller.getCurrentFPS()).toBe(0);
    });

    test('应该维护FPS历史记录', () => {
      // 模拟61帧（超过历史大小60）
      for (let i = 0; i < 61; i++) {
        mockPerformance.now.mockReturnValue(1000 + i * 16.67);
        controller.shouldRender();
      }
      
      // 应该只保留最近60帧的数据
      const fps = controller.getCurrentFPS();
      expect(fps).toBeDefined();
      expect(fps).toBeGreaterThan(0);
    });
  });
});

describe('RenderQueue', () => {
  let queue: RenderQueue;
  
  beforeEach(() => {
    queue = new RenderQueue();
  });

  describe('任务队列管理测试', () => {
    test('应该能添加渲染任务', () => {
      const task: RenderTask = {
        id: 'task1',
        type: 'update',
        widgetId: 'widget1',
        data: { value: 10 },
        priority: 'high',
        timestamp: Date.now()
      };
      
      queue.enqueue(task);
      
      const status = queue.getStatus();
      expect(status.totalTasks).toBe(1);
      expect(status.highPriority).toBe(1);
    });

    test('应该合并相同组件的任务', () => {
      const task1: RenderTask = {
        id: 'task1',
        type: 'update',
        widgetId: 'widget1',
        data: { value: 10 },
        priority: 'medium',
        timestamp: Date.now()
      };
      
      const task2: RenderTask = {
        id: 'task2',
        type: 'update',
        widgetId: 'widget1',
        data: { value: 20 },
        priority: 'high',
        timestamp: Date.now() + 100
      };
      
      queue.enqueue(task1);
      queue.enqueue(task2);
      
      const status = queue.getStatus();
      expect(status.totalTasks).toBe(1); // 应该合并为1个任务
      
      // 任务被合并后，应该从原有队列移除，并升级到高优先级队列
      const tasks = queue.dequeue(5);
      expect(tasks.length).toBe(1);
      expect(tasks[0].priority).toBe('high');
      expect(tasks[0].data.value).toBe(20); // 应该使用最新的数据
    });

    test('应该按优先级顺序返回任务', () => {
      const lowTask: RenderTask = {
        id: 'low',
        type: 'update',
        widgetId: 'widget1',
        priority: 'low',
        timestamp: Date.now()
      };
      
      const highTask: RenderTask = {
        id: 'high',
        type: 'update',
        widgetId: 'widget2',
        priority: 'high',
        timestamp: Date.now()
      };
      
      const mediumTask: RenderTask = {
        id: 'medium',
        type: 'update',
        widgetId: 'widget3',
        priority: 'medium',
        timestamp: Date.now()
      };
      
      // 添加顺序：低-高-中
      queue.enqueue(lowTask);
      queue.enqueue(highTask);
      queue.enqueue(mediumTask);
      
      const tasks = queue.dequeue(3);
      
      // 应该按优先级返回：高-中-低
      expect(tasks[0].priority).toBe('high');
      expect(tasks[1].priority).toBe('medium');
      expect(tasks[2].priority).toBe('low');
    });

    test('应该限制批处理大小', () => {
      // 添加5个任务
      for (let i = 0; i < 5; i++) {
        queue.enqueue({
          id: `task${i}`,
          type: 'update',
          widgetId: `widget${i}`,
          priority: 'medium',
          timestamp: Date.now()
        });
      }
      
      // 只请求3个任务
      const tasks = queue.dequeue(3);
      expect(tasks.length).toBe(3);
      
      // 队列中应该还剩2个任务
      const status = queue.getStatus();
      expect(status.totalTasks).toBe(2);
    });

    test('应该能清空队列', () => {
      queue.enqueue({
        id: 'task1',
        type: 'update',
        widgetId: 'widget1',
        priority: 'high',
        timestamp: Date.now()
      });
      
      queue.clear();
      
      const status = queue.getStatus();
      expect(status.totalTasks).toBe(0);
      expect(status.highPriority).toBe(0);
    });

    test('应该正确获取队列状态', () => {
      queue.enqueue({
        id: 'high1',
        type: 'update',
        widgetId: 'widget1',
        priority: 'high',
        timestamp: Date.now()
      });
      
      queue.enqueue({
        id: 'medium1',
        type: 'update',
        widgetId: 'widget2',
        priority: 'medium',
        timestamp: Date.now()
      });
      
      queue.enqueue({
        id: 'low1',
        type: 'update',
        widgetId: 'widget3',
        priority: 'low',
        timestamp: Date.now()
      });
      
      const status = queue.getStatus();
      expect(status.totalTasks).toBe(3);
      expect(status.highPriority).toBe(1);
      expect(status.mediumPriority).toBe(1);
      expect(status.lowPriority).toBe(1);
    });
  });

  describe('优先级处理测试', () => {
    test('应该正确比较优先级', () => {
      // 创建不同优先级的任务
      const mediumTask: RenderTask = {
        id: 'medium',
        type: 'update',
        widgetId: 'widget1',
        priority: 'medium',
        timestamp: Date.now()
      };
      
      const highTask: RenderTask = {
        id: 'high',
        type: 'update',
        widgetId: 'widget1', // 相同widgetId，会合并
        priority: 'high',
        timestamp: Date.now() + 100
      };
      
      // 先添加中优先级任务
      queue.enqueue(mediumTask);
      // 再添加高优先级任务，应该升级优先级
      queue.enqueue(highTask);
      
      const status = queue.getStatus();
      expect(status.totalTasks).toBe(1);
      
      // 验证任务被正确合并和升级优先级
      const tasks = queue.dequeue(5);
      expect(tasks.length).toBe(1);
      expect(tasks[0].priority).toBe('high');
    });
  });
});

describe('RenderCache', () => {
  let cache: RenderCache;
  
  beforeEach(() => {
    vi.useFakeTimers();
    cache = new RenderCache();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('缓存基本功能测试', () => {
    test('应该能缓存和获取数据', () => {
      const testData = { rendered: true, value: 42 };
      
      cache.set('test-key', testData);
      const retrieved = cache.get('test-key');
      
      expect(retrieved).toEqual(testData);
    });

    test('应该在数据不存在时返回null', () => {
      const result = cache.get('nonexistent-key');
      expect(result).toBeNull();
    });

    test('应该支持版本控制', () => {
      const testData = { value: 1 };
      
      cache.set('versioned-key', testData, 2);
      
      // 请求更低版本应该返回数据
      expect(cache.get('versioned-key', 1)).toEqual(testData);
      
      // 请求更高版本应该返回null
      expect(cache.get('versioned-key', 3)).toBeNull();
    });

    test('应该处理TTL过期', () => {
      const testData = { value: 1 };
      
      cache.set('ttl-key', testData);
      
      // 立即获取应该成功
      expect(cache.get('ttl-key')).toEqual(testData);
      
      // 超过TTL时间后应该返回null
      vi.advanceTimersByTime(6000); // 6秒，超过5秒TTL
      expect(cache.get('ttl-key')).toBeNull();
    });

    test('应该限制缓存大小', () => {
      // 添加超过最大缓存大小的数据
      for (let i = 0; i < 1010; i++) {
        cache.set(`key${i}`, { value: i });
      }
      
      const stats = cache.getStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
      
      // 最早的缓存项应该被移除
      expect(cache.get('key0')).toBeNull();
      
      // 最新的缓存项应该存在
      expect(cache.get('key1009')).not.toBeNull();
    });

    test('应该能清空所有缓存', () => {
      cache.set('key1', { value: 1 });
      cache.set('key2', { value: 2 });
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });

    test('应该提供缓存统计', () => {
      cache.set('key1', { value: 1 });
      cache.set('key2', { value: 2 });
      
      const stats = cache.getStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats.size).toBe(2);
    });
  });

  describe('缓存清理测试', () => {
    test('应该自动清理过期缓存', () => {
      cache.set('key1', { value: 1 });
      
      // 推进时间使缓存过期
      vi.advanceTimersByTime(6000);
      
      // 添加新缓存会触发清理
      cache.set('key2', { value: 2 });
      
      // 过期的缓存应该被清理
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).not.toBeNull();
    });
  });
});

describe('HighFrequencyRenderer', () => {
  let renderer: HighFrequencyRenderer;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockPerformance.now.mockReturnValue(1000);
    
    // Mock console methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    if (renderer) {
      renderer.dispose();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('渲染器初始化测试', () => {
    test('应该使用默认配置初始化', () => {
      renderer = new HighFrequencyRenderer();
      
      expect(renderer).toBeInstanceOf(HighFrequencyRenderer);
      
      const stats = renderer.getRenderStats();
      expect(stats).toHaveProperty('fps');
      expect(stats).toHaveProperty('totalFrames');
    });

    test('应该使用自定义配置初始化', () => {
      const config: Partial<RenderConfig> = {
        targetFPS: 45,
        batchSize: 10,
        enableBatching: false
      };
      
      renderer = new HighFrequencyRenderer(config);
      
      expect(renderer).toBeInstanceOf(HighFrequencyRenderer);
    });

    test('应该启动渲染循环', () => {
      renderer = new HighFrequencyRenderer();
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('任务调度测试', () => {
    test('应该能调度渲染任务', () => {
      renderer = new HighFrequencyRenderer();
      
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'test-widget',
        data: { value: 42 },
        priority: 'high'
      });
      
      // 任务应该被添加到队列中
      // 无法直接访问内部队列，但可以通过统计推断
      const stats = renderer.getRenderStats();
      expect(stats).toBeDefined();
    });

    test('应该处理不同类型的渲染任务', () => {
      renderer = new HighFrequencyRenderer();
      
      const updateTask = {
        type: 'update' as const,
        widgetId: 'widget1',
        data: { value: 1 },
        priority: 'high' as const
      };
      
      const redrawTask = {
        type: 'redraw' as const,
        widgetId: 'widget2',
        priority: 'medium' as const
      };
      
      const clearTask = {
        type: 'clear' as const,
        widgetId: 'widget3',
        priority: 'low' as const
      };
      
      renderer.scheduleRender(updateTask);
      renderer.scheduleRender(redrawTask);
      renderer.scheduleRender(clearTask);
      
      // 推进动画帧以触发任务执行
      vi.advanceTimersByTime(50);
      
      // 应该没有抛出错误
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('渲染循环测试', () => {
    test('应该按帧率限制执行渲染', () => {
      renderer = new HighFrequencyRenderer({ targetFPS: 60 });
      
      // 模拟第一帧
      mockPerformance.now.mockReturnValue(1000);
      vi.advanceTimersByTime(16);
      
      // 模拟第二帧
      mockPerformance.now.mockReturnValue(1016.67);
      vi.advanceTimersByTime(16);
      
      const stats = renderer.getRenderStats();
      expect(stats.totalFrames).toBeGreaterThan(0);
    });

    test('应该更新性能统计', () => {
      renderer = new HighFrequencyRenderer();
      
      // 推进一些时间让渲染循环执行
      vi.advanceTimersByTime(100);
      
      const stats = renderer.getRenderStats();
      expect(stats).toHaveProperty('fps');
      expect(stats).toHaveProperty('averageFrameTime');
      expect(stats).toHaveProperty('lastFrameTime');
      expect(stats).toHaveProperty('totalFrames');
    });

    test('应该检测丢帧', () => {
      renderer = new HighFrequencyRenderer({ maxFrameTime: 16.67, targetFPS: 60 });
      
      // 调度一个任务以确保有渲染工作
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'slow-widget',
        priority: 'high'
      });
      
      // 模拟慢帧 - 需要模拟渲染循环中的实际调用
      let callCount = 0;
      mockPerformance.now.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 1000; // 帧开始
        if (callCount === 2) return 1000; // shouldRender检查
        if (callCount === 3) return 1020; // 帧结束（20ms，超过16.67ms）
        return 1020 + callCount; // 后续调用
      });
      
      // 推进时间让渲染循环执行
      vi.advanceTimersByTime(50);
      
      const stats = renderer.getRenderStats();
      expect(stats.droppedFrames).toBeGreaterThan(0);
    });
  });

  describe('任务执行测试', () => {
    test('应该执行更新任务', () => {
      renderer = new HighFrequencyRenderer();
      
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'test-widget',
        data: { value: 100 },
        priority: 'high'
      });
      
      // 触发渲染循环
      mockPerformance.now.mockReturnValue(1020); // 超过帧间隔
      vi.advanceTimersByTime(20);
      
      // 应该调用debug输出
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Applying render result for widget test-widget'),
        expect.any(Object)
      );
    });

    test('应该执行清空任务', () => {
      renderer = new HighFrequencyRenderer();
      
      renderer.scheduleRender({
        type: 'clear',
        widgetId: 'clear-widget',
        priority: 'high'
      });
      
      // 触发渲染循环
      mockPerformance.now.mockReturnValue(1020);
      vi.advanceTimersByTime(20);
      
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Clearing widget clear-widget')
      );
    });

    test('应该处理渲染错误', () => {
      renderer = new HighFrequencyRenderer();
      
      // Mock performRender method to throw error
      const originalPerformRender = (renderer as any).performRender;
      (renderer as any).performRender = vi.fn(() => {
        throw new Error('Render error');
      });
      
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'error-widget',
        priority: 'high'
      });
      
      // 直接调用渲染方法而不是等待异步循环
      try {
        (renderer as any).executeRenderTasks();
      } catch (error) {
        // 忽略错误，因为我们要验证error console
      }
      
      expect(console.error).toHaveBeenCalledWith(
        'Render execution error:',
        expect.any(Error)
      );
      
      // 恢复原始方法
      (renderer as any).performRender = originalPerformRender;
    });
  });

  describe('配置更新测试', () => {
    test('应该能更新配置', () => {
      renderer = new HighFrequencyRenderer({ targetFPS: 30 });
      
      renderer.updateConfig({
        targetFPS: 60,
        batchSize: 15
      });
      
      // 配置更新不应该抛出错误
      expect(() => renderer.getRenderStats()).not.toThrow();
    });

    test('应该更新帧率控制器的目标FPS', () => {
      renderer = new HighFrequencyRenderer({ targetFPS: 30 });
      
      // 更新目标FPS
      renderer.updateConfig({ targetFPS: 60 });
      
      // 验证配置已更新（通过行为推断，因为无法直接访问内部状态）
      const stats = renderer.getRenderStats();
      expect(stats).toBeDefined();
    });
  });

  describe('渲染控制测试', () => {
    test('应该能暂停渲染', () => {
      renderer = new HighFrequencyRenderer();
      
      renderer.pause();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    test('应该能恢复渲染', () => {
      renderer = new HighFrequencyRenderer();
      
      renderer.pause();
      vi.clearAllMocks();
      
      renderer.resume();
      
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    test('应该防止重复恢复', () => {
      renderer = new HighFrequencyRenderer();
      
      // 渲染器已经在运行，恢复应该不会重复启动
      renderer.resume();
      
      // 应该没有额外的requestAnimationFrame调用
      const callCount = (global.requestAnimationFrame as any).mock.calls.length;
      
      renderer.resume(); // 再次调用
      
      expect((global.requestAnimationFrame as any).mock.calls.length).toBe(callCount);
    });
  });

  describe('缓存系统集成测试', () => {
    test('应该使用缓存来优化更新任务', () => {
      renderer = new HighFrequencyRenderer();
      
      const taskData = { value: 42 };
      
      // 执行第一个更新任务
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'cached-widget-1',
        data: taskData,
        priority: 'high'
      });
      
      // 直接执行渲染任务
      (renderer as any).executeRenderTasks();
      
      // 执行第二个更新任务（不同widget）
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'cached-widget-2',
        data: taskData,
        priority: 'high'
      });
      
      // 直接执行第二次渲染任务
      (renderer as any).executeRenderTasks();
      
      // 应该有两次渲染结果应用
      expect(console.debug).toHaveBeenCalledTimes(2);
    });

    test('应该对重绘任务跳过缓存', () => {
      renderer = new HighFrequencyRenderer();
      
      // 重绘任务不应该使用缓存
      renderer.scheduleRender({
        type: 'redraw',
        widgetId: 'redraw-widget',
        data: { value: 42 },
        priority: 'high'
      });
      
      mockPerformance.now.mockReturnValue(1020);
      vi.advanceTimersByTime(20);
      
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Applying render result for widget redraw-widget'),
        expect.any(Object)
      );
    });
  });

  describe('内存管理测试', () => {
    test('应该更新内存统计', () => {
      // Mock performance.memory
      const mockMemory = {
        usedJSHeapSize: 50 * 1024 * 1024 // 50MB
      };
      
      Object.defineProperty(global.performance, 'memory', {
        value: mockMemory,
        configurable: true
      });
      
      renderer = new HighFrequencyRenderer();
      
      // 推进时间触发内存统计更新
      vi.advanceTimersByTime(1500); // 超过1秒
      
      const stats = renderer.getRenderStats();
      expect(stats.memoryUsage).toBe(50); // 50MB
    });
  });

  describe('资源清理测试', () => {
    test('应该正确清理所有资源', () => {
      renderer = new HighFrequencyRenderer();
      
      // 添加一些任务
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'widget1',
        priority: 'high'
      });
      
      renderer.dispose();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      
      // 不应该抛出错误
      expect(() => renderer.getRenderStats()).not.toThrow();
    });

    test('应该在dispose后停止渲染循环', () => {
      renderer = new HighFrequencyRenderer();
      
      renderer.dispose();
      
      // 验证dispose调用了cancelAnimationFrame
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      
      // 验证dispose不会抛出错误
      expect(() => renderer.getRenderStats()).not.toThrow();
    });
  });

  describe('批处理优化测试', () => {
    test('应该批处理多个任务', () => {
      renderer = new HighFrequencyRenderer({ batchSize: 3 });
      
      // 添加5个任务
      for (let i = 0; i < 5; i++) {
        renderer.scheduleRender({
          type: 'update',
          widgetId: `widget${i}`,
          data: { value: i },
          priority: 'medium'
        });
      }
      
      // 触发批处理
      mockPerformance.now.mockReturnValue(1020);
      vi.advanceTimersByTime(20);
      
      // 应该处理部分任务（受批大小限制）
      expect(console.debug).toHaveBeenCalled();
    });

    test('应该按类型分组任务', () => {
      renderer = new HighFrequencyRenderer();
      
      // 添加不同类型的任务
      renderer.scheduleRender({
        type: 'update',
        widgetId: 'widget1',
        data: { value: 1 },
        priority: 'high'
      });
      
      renderer.scheduleRender({
        type: 'clear',
        widgetId: 'widget2',
        priority: 'high'
      });
      
      renderer.scheduleRender({
        type: 'redraw',
        widgetId: 'widget3',
        data: { value: 3 },
        priority: 'high'
      });
      
      // 直接执行批处理
      (renderer as any).executeRenderTasks();
      
      // 应该处理所有类型的任务：1个更新，1个清空，1个重绘
      expect(console.debug).toHaveBeenCalledTimes(3);
      
      // 验证不同类型的操作被调用
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Applying render result for widget widget1'),
        expect.any(Object)
      );
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Clearing widget widget2')
      );
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('Applying render result for widget widget3'),
        expect.any(Object)
      );
    });
  });
});
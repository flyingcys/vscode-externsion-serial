/**
 * HighFrequencyRenderer - 高频渲染优化系统
 * 实现20Hz+实时更新性能，基于Serial-Studio的高性能渲染设计
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * 渲染任务接口
 */
export interface RenderTask {
    id: string;
    type: 'update' | 'redraw' | 'clear';
    widgetId: string;
    data?: any;
    priority: 'high' | 'medium' | 'low';
    timestamp: number;
}
/**
 * 渲染性能统计
 */
export interface RenderStats {
    fps: number;
    averageFrameTime: number;
    lastFrameTime: number;
    droppedFrames: number;
    totalFrames: number;
    cpuUsage: number;
    memoryUsage: number;
}
/**
 * 渲染配置
 */
export interface RenderConfig {
    targetFPS: number;
    maxFrameTime: number;
    enableVSync: boolean;
    enableBatching: boolean;
    batchSize: number;
    cullingEnabled: boolean;
    lodEnabled: boolean;
}
/**
 * 离屏Canvas渲染上下文
 */
export interface OffscreenRenderContext {
    widgetId: string;
    mainCanvas: HTMLCanvasElement;
    mainCtx: CanvasRenderingContext2D;
    offscreenCanvas: OffscreenCanvas;
    offscreenCtx: OffscreenCanvasRenderingContext2D;
    lastRenderState?: {
        lastUpdateTime: number;
        totalPoints: number;
        lastFullRender?: number;
        lastClear?: number;
    };
}
/**
 * 渲染区域接口
 */
export interface RenderArea {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * 数据点接口
 */
export interface RenderDataPoint {
    x: number;
    y: number;
    value: number;
    timestamp: number;
}
/**
 * 高性能帧率控制器
 * 精确控制渲染帧率，避免过度渲染
 */
export declare class FrameRateController {
    private targetInterval;
    private lastFrameTime;
    private frameCount;
    private fpsHistory;
    private readonly historySize;
    constructor(targetFPS?: number);
    /**
     * 检查是否应该渲染新帧
     */
    shouldRender(): boolean;
    /**
     * 获取当前FPS
     */
    getCurrentFPS(): number;
    /**
     * 设置目标FPS
     */
    setTargetFPS(fps: number): void;
    /**
     * 重置统计
     */
    reset(): void;
}
/**
 * 渲染任务队列
 * 优先级队列，支持任务合并和批处理
 */
export declare class RenderQueue {
    private tasks;
    private priorityQueues;
    private batchingEnabled;
    private maxBatchSize;
    /**
     * 添加渲染任务
     */
    enqueue(task: RenderTask): void;
    /**
     * 获取下一批任务
     */
    dequeue(maxCount?: number): RenderTask[];
    /**
     * 获取优先级更高的值
     */
    private getHigherPriority;
    /**
     * 清空队列
     */
    clear(): void;
    /**
     * 获取队列状态
     */
    getStatus(): {
        totalTasks: number;
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
    };
}
/**
 * 渲染缓存系统
 * 缓存常用的渲染结果，减少重复计算
 */
export declare class RenderCache {
    private cache;
    private maxCacheSize;
    private cacheTTL;
    /**
     * 缓存渲染数据
     */
    set(key: string, data: any, version?: number): void;
    /**
     * 获取缓存数据
     */
    get(key: string, minVersion?: number): any | null;
    /**
     * 清理过期缓存
     */
    private cleanup;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 获取缓存统计
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    };
}
/**
 * 高频渲染器主类
 * 协调所有渲染优化组件
 */
export declare class HighFrequencyRenderer extends EventEmitter {
    private frameController;
    private renderQueue;
    private renderCache;
    private config;
    private isRendering;
    private animationFrameId;
    private renderStats;
    private lastStatsUpdate;
    private frameTimeHistory;
    private renderContexts;
    constructor(config?: Partial<RenderConfig>);
    /**
     * 添加渲染任务
     */
    scheduleRender(task: Omit<RenderTask, 'id' | 'timestamp'>): void;
    /**
     * 开始渲染循环
     */
    private startRenderLoop;
    /**
     * 执行渲染任务
     */
    private executeRenderTasks;
    /**
     * 处理渲染任务
     */
    private processTasks;
    /**
     * 按类型分组任务
     */
    private groupTasksByType;
    /**
     * 执行任务组
     */
    private executeTaskGroup;
    /**
     * 执行更新任务
     */
    private executeUpdateTasks;
    /**
     * 执行重绘任务
     */
    private executeRedrawTasks;
    /**
     * 执行清空任务
     */
    private executeClearTasks;
    /**
     * 执行实际渲染 - 使用离屏Canvas优化
     */
    private performRender;
    /**
     * 增量渲染 - 只更新变化的部分
     */
    private performIncrementalRender;
    /**
     * 完整重绘
     */
    private performFullRender;
    /**
     * 清除渲染
     */
    private performClearRender;
    /**
     * 应用渲染结果
     */
    private applyRenderResult;
    /**
     * 清空组件
     */
    private clearWidget;
    /**
     * 更新性能统计
     */
    private updateRenderStats;
    /**
     * 更新内存统计
     */
    private updateMemoryStats;
    /**
     * 获取渲染统计
     */
    getRenderStats(): RenderStats;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<RenderConfig>): void;
    /**
     * 暂停渲染
     */
    pause(): void;
    /**
     * 恢复渲染
     */
    resume(): void;
    /**
     * 创建渲染上下文
     */
    createRenderContext(widgetId: string, canvas: HTMLCanvasElement): OffscreenRenderContext;
    /**
     * 获取渲染上下文
     */
    private getRenderContext;
    /**
     * 移除渲染上下文
     */
    removeRenderContext(widgetId: string): void;
    /**
     * 渲染数据点到指定区域
     */
    private renderDataPoints;
    /**
     * 渲染完整图表
     */
    private renderCompleteChart;
    /**
     * 渲染背景
     */
    private renderBackground;
    /**
     * 渲染网格
     */
    private renderGrid;
    /**
     * 渲染数据集
     */
    private renderDataset;
    /**
     * 渲染坐标轴
     */
    private renderAxes;
    /**
     * 转换X坐标
     */
    private transformX;
    /**
     * 转换Y坐标
     */
    private transformY;
    /**
     * 更新渲染统计
     */
    private updateRenderingStats;
    /**
     * 调整Canvas大小
     */
    resizeCanvas(widgetId: string, width: number, height: number): void;
    /**
     * 获取渲染统计信息
     */
    getRenderContextStats(): {
        [widgetId: string]: any;
    };
    /**
     * 创建模拟渲染上下文（用于测试环境）
     */
    private createMockRenderContext;
    /**
     * 清理资源
     */
    dispose(): void;
}
export default HighFrequencyRenderer;
//# sourceMappingURL=HighFrequencyRenderer.d.ts.map
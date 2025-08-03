/**
 * Performance Store for Serial Studio VSCode Extension
 * 性能监控存储
 */
/// <reference types="@/types/vue" />
/**
 * 性能采样点接口
 */
export interface PerformanceSample {
    timestamp: number;
    fps: number;
    latency: number;
    memory: number;
    cpu?: number;
    frameTime: number;
    droppedFrames: number;
}
/**
 * 性能警告接口
 */
export interface PerformanceAlert {
    id: string;
    type: 'fps' | 'memory' | 'latency' | 'cpu';
    level: 'warning' | 'critical';
    message: string;
    timestamp: number;
    value: number;
    threshold: number;
}
/**
 * 性能阈值配置
 */
export interface PerformanceThresholds {
    fps: {
        warning: number;
        critical: number;
    };
    memory: {
        warning: number;
        critical: number;
    };
    latency: {
        warning: number;
        critical: number;
    };
    cpu: {
        warning: number;
        critical: number;
    };
}
export declare const usePerformanceStore: import("pinia").StoreDefinition<"performance", any, any, any>;
export default usePerformanceStore;
//# sourceMappingURL=performance.d.ts.map
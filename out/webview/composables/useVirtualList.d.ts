/**
 * useVirtualList - 虚拟化渲染组合式函数
 * 基于Serial-Studio的高性能数据渲染设计，实现大数据集的高效显示
 * 适用于数据网格、终端输出等大量数据的渲染场景
 */
/// <reference types="@/types/vue" />
import { type Ref } from 'vue';
/**
 * 虚拟化列表项接口
 */
export interface VirtualListItem {
    id: string | number;
    [key: string]: any;
}
/**
 * 虚拟化列表配置
 */
export interface VirtualListOptions {
    /** 预加载的缓冲区大小（项目数） */
    bufferSize?: number;
    /** 滚动防抖延迟（毫秒） */
    scrollDebounce?: number;
    /** 动态高度模式 */
    dynamicHeight?: boolean;
    /** 是否启用滚动优化 */
    optimizeScrolling?: boolean;
}
/**
 * 虚拟化列表状态
 */
export interface VirtualListState {
    /** 可见的项目列表 */
    visibleItems: Ref<any[]>;
    /** 容器总高度 */
    totalHeight: Ref<number>;
    /** 当前滚动位置 */
    scrollTop: Ref<number>;
    /** 可见区域的起始索引 */
    startIndex: Ref<number>;
    /** 可见区域的结束索引 */
    endIndex: Ref<number>;
    /** 设置滚动位置 */
    setScrollTop: (value: number) => void;
    /** 滚动到指定项目 */
    scrollToItem: (index: number) => void;
    /** 滚动到顶部 */
    scrollToTop: () => void;
    /** 滚动到底部 */
    scrollToBottom: () => void;
    /** 获取性能统计 */
    getPerformanceStats: () => VirtualListPerformanceStats;
}
/**
 * 性能统计接口
 */
export interface VirtualListPerformanceStats {
    totalItems: number;
    visibleItems: number;
    renderRatio: number;
    memoryUsage: number;
    scrollSpeed: number;
    frameRate: number;
}
/**
 * 虚拟化列表 Composable
 *
 * @param items 数据项目列表
 * @param itemHeight 每个项目的高度（像素）
 * @param containerHeight 容器高度
 * @param options 配置选项
 * @returns 虚拟化列表状态和方法
 */
export declare function useVirtualList<T extends VirtualListItem>(items: Ref<T[]>, itemHeight: number | Ref<number>, containerHeight: Ref<number>, options?: VirtualListOptions): VirtualListState;
/**
 * 虚拟化网格 Composable
 * 用于二维数据的虚拟化渲染
 *
 * @param items 数据项目列表
 * @param rowHeight 行高
 * @param colWidth 列宽
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param options 配置选项
 */
export declare function useVirtualGrid<T extends VirtualListItem>(items: Ref<T[]>, rowHeight: number, colWidth: number, containerWidth: Ref<number>, containerHeight: Ref<number>, options?: VirtualListOptions): {
    visibleItems: import("vue").ComputedRef<T[]>;
    totalHeight: import("vue").ComputedRef<number>;
    scrollTop: Ref<number>;
    colCount: import("vue").ComputedRef<number>;
    rowCount: import("vue").ComputedRef<number>;
    visibleRowStart: import("vue").ComputedRef<number>;
    visibleRowEnd: import("vue").ComputedRef<number>;
    setScrollTop: (value: number) => void;
};
/**
 * 动态高度虚拟化列表 Composable
 * 适用于项目高度不一致的场景
 *
 * @param items 数据项目列表
 * @param getItemHeight 获取项目高度的函数
 * @param containerHeight 容器高度
 * @param options 配置选项
 */
export declare function useDynamicVirtualList<T extends VirtualListItem>(items: Ref<T[]>, getItemHeight: (item: T, index: number) => number, containerHeight: Ref<number>, options?: VirtualListOptions): {
    visibleItems: import("vue").ComputedRef<T[]>;
    totalHeight: import("vue").ComputedRef<number>;
    scrollTop: Ref<number>;
    setScrollTop: (value: number) => void;
    updateItemHeight: (index: number, height: number) => void;
    getItemHeight: (index: number) => number;
};
export default useVirtualList;
//# sourceMappingURL=useVirtualList.d.ts.map
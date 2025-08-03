/**
 * useVirtualList - 虚拟化渲染组合式函数
 * 基于Serial-Studio的高性能数据渲染设计，实现大数据集的高效显示
 * 适用于数据网格、终端输出等大量数据的渲染场景
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';

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
export function useVirtualList<T extends VirtualListItem>(
  items: Ref<T[]>,
  itemHeight: number | Ref<number>,
  containerHeight: Ref<number>,
  options: VirtualListOptions = {}
): VirtualListState {
  // 配置默认值
  const {
    bufferSize = 5,
    scrollDebounce = 16,
    dynamicHeight = false,
    optimizeScrolling = true
  } = options;

  // 响应式状态
  const scrollTop = ref(0);
  const scrollSpeed = ref(0);
  const lastScrollTime = ref(0);
  const frameCount = ref(0);
  const lastFrameTime = ref(performance.now());

  // 高度处理
  const itemHeightValue = computed(() => {
    return typeof itemHeight === 'number' ? itemHeight : itemHeight.value;
  });

  // 计算起始和结束索引
  const startIndex = computed(() => {
    if (itemHeightValue.value <= 0) {return 0;}
    
    const start = Math.floor(scrollTop.value / itemHeightValue.value);
    return Math.max(0, start - bufferSize);
  });

  const endIndex = computed(() => {
    if (itemHeightValue.value <= 0) {return items.value.length;}
    
    const visibleCount = Math.ceil(containerHeight.value / itemHeightValue.value);
    const end = startIndex.value + visibleCount + bufferSize * 2;
    return Math.min(items.value.length, end);
  });

  // 可见项目
  const visibleItems = computed(() => {
    const start = startIndex.value;
    const end = endIndex.value;
    
    // 性能优化：避免不必要的数组切片
    if (start === 0 && end >= items.value.length) {
      return items.value;
    }
    
    return items.value.slice(start, end);
  });

  // 总高度
  const totalHeight = computed(() => {
    return items.value.length * itemHeightValue.value;
  });

  // 滚动防抖处理
  let scrollTimer: number | null = null;

  const setScrollTop = (value: number) => {
    const now = performance.now();
    scrollSpeed.value = Math.abs(value - scrollTop.value) / (now - lastScrollTime.value || 1);
    lastScrollTime.value = now;
    
    scrollTop.value = Math.max(0, Math.min(value, totalHeight.value - containerHeight.value));
    
    // 防抖处理
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    
    if (optimizeScrolling) {
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
      }, scrollDebounce) as any;
    }
  };

  // 滚动到指定项目
  const scrollToItem = (index: number) => {
    const targetIndex = Math.max(0, Math.min(index, items.value.length - 1));
    const targetScrollTop = targetIndex * itemHeightValue.value;
    setScrollTop(targetScrollTop);
  };

  // 滚动到顶部
  const scrollToTop = () => {
    setScrollTop(0);
  };

  // 滚动到底部
  const scrollToBottom = () => {
    setScrollTop(totalHeight.value - containerHeight.value);
  };

  // 性能监控
  const updateFrameRate = () => {
    const now = performance.now();
    frameCount.value++;
    
    if (now - lastFrameTime.value >= 1000) {
      lastFrameTime.value = now;
      frameCount.value = 0;
    }
  };

  // 获取性能统计
  const getPerformanceStats = (): VirtualListPerformanceStats => {
    const totalItems = items.value.length;
    const visibleCount = visibleItems.value.length;
    const renderRatio = totalItems > 0 ? visibleCount / totalItems : 0;
    
    // 估算内存使用（假设每个项目平均100字节）
    const memoryUsage = visibleCount * 100;
    
    return {
      totalItems,
      visibleItems: visibleCount,
      renderRatio,
      memoryUsage,
      scrollSpeed: scrollSpeed.value,
      frameRate: frameCount.value
    };
  };

  // 生命周期管理
  let rafId: number | null = null;

  const animate = () => {
    updateFrameRate();
    rafId = requestAnimationFrame(animate);
  };

  onMounted(() => {
    if (optimizeScrolling) {
      rafId = requestAnimationFrame(animate);
    }
  });

  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
  });

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    startIndex,
    endIndex,
    setScrollTop,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    getPerformanceStats
  };
}

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
export function useVirtualGrid<T extends VirtualListItem>(
  items: Ref<T[]>,
  rowHeight: number,
  colWidth: number,
  containerWidth: Ref<number>,
  containerHeight: Ref<number>,
  options: VirtualListOptions = {}
) {
  const {
    bufferSize = 2
  } = options;

  // 计算列数
  const colCount = computed(() => {
    return Math.floor(containerWidth.value / colWidth);
  });

  // 计算行数
  const rowCount = computed(() => {
    return Math.ceil(items.value.length / colCount.value);
  });

  // 滚动状态
  const scrollTop = ref(0);

  // 可见行范围
  const visibleRowStart = computed(() => {
    const start = Math.floor(scrollTop.value / rowHeight);
    return Math.max(0, start - bufferSize);
  });

  const visibleRowEnd = computed(() => {
    const visibleRows = Math.ceil(containerHeight.value / rowHeight);
    const end = visibleRowStart.value + visibleRows + bufferSize * 2;
    return Math.min(rowCount.value, end);
  });

  // 可见项目
  const visibleItems = computed(() => {
    const startIndex = visibleRowStart.value * colCount.value;
    const endIndex = visibleRowEnd.value * colCount.value;
    return items.value.slice(startIndex, endIndex);
  });

  // 总高度
  const totalHeight = computed(() => {
    return rowCount.value * rowHeight;
  });

  const setScrollTop = (value: number) => {
    scrollTop.value = Math.max(0, Math.min(value, totalHeight.value - containerHeight.value));
  };

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    colCount,
    rowCount,
    visibleRowStart,
    visibleRowEnd,
    setScrollTop
  };
}

/**
 * 动态高度虚拟化列表 Composable
 * 适用于项目高度不一致的场景
 * 
 * @param items 数据项目列表
 * @param getItemHeight 获取项目高度的函数
 * @param containerHeight 容器高度
 * @param options 配置选项
 */
export function useDynamicVirtualList<T extends VirtualListItem>(
  items: Ref<T[]>,
  getItemHeight: (item: T, index: number) => number,
  containerHeight: Ref<number>,
  options: VirtualListOptions = {}
) {
  const {
    bufferSize = 5
  } = options;

  // 高度缓存
  const heightCache = ref(new Map<number, number>());
  const positionCache = ref(new Map<number, number>());

  // 滚动状态
  const scrollTop = ref(0);

  // 计算项目位置
  const calculatePositions = () => {
    let totalHeight = 0;
    
    for (let i = 0; i < items.value.length; i++) {
      positionCache.value.set(i, totalHeight);
      
      const height = heightCache.value.get(i) || getItemHeight(items.value[i], i);
      heightCache.value.set(i, height);
      totalHeight += height;
    }
    
    return totalHeight;
  };

  // 总高度
  const totalHeight = computed(() => {
    return calculatePositions();
  });

  // 查找可见项目范围
  const findVisibleRange = () => {
    const viewportTop = scrollTop.value;
    const viewportBottom = viewportTop + containerHeight.value;
    
    let startIndex = 0;
    let endIndex = items.value.length;
    
    // 二分查找起始索引
    let left = 0;
    let right = items.value.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const position = positionCache.value.get(mid) || 0;
      
      if (position < viewportTop) {
        left = mid + 1;
      } else {
        right = mid - 1;
        startIndex = mid;
      }
    }
    
    // 查找结束索引
    for (let i = startIndex; i < items.value.length; i++) {
      const position = positionCache.value.get(i) || 0;
      if (position > viewportBottom) {
        endIndex = i;
        break;
      }
    }
    
    return {
      start: Math.max(0, startIndex - bufferSize),
      end: Math.min(items.value.length, endIndex + bufferSize)
    };
  };

  // 可见项目
  const visibleItems = computed(() => {
    const range = findVisibleRange();
    return items.value.slice(range.start, range.end);
  });

  const setScrollTop = (value: number) => {
    scrollTop.value = Math.max(0, Math.min(value, totalHeight.value - containerHeight.value));
  };

  // 更新项目高度
  const updateItemHeight = (index: number, height: number) => {
    heightCache.value.set(index, height);
    // 清除位置缓存，强制重新计算
    positionCache.value.clear();
  };

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    updateItemHeight,
    getItemHeight: (index: number) => heightCache.value.get(index) || 0
  };
}

export default useVirtualList;
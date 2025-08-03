<!--
  VirtualList - 虚拟化长列表组件
  基于Serial-Studio的高效列表渲染实现，支持大数据量实时更新
-->

<template>
  <div 
    ref="containerRef"
    class="virtual-list-container"
    :style="containerStyle"
    @scroll="handleScroll"
  >
    <!-- 占位空间，用于模拟总高度 -->
    <div 
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    />
    
    <!-- 可见区域内容 -->
    <div 
      ref="contentRef"
      class="virtual-list-content"
      :style="contentStyle"
    >
      <div
        v-for="(item, index) in visibleItems"
        :key="getItemKey(item, startIndex + index)"
        :class="[
          'virtual-list-item',
          { 'virtual-list-item-even': (startIndex + index) % 2 === 0 }
        ]"
        :style="getItemStyle(startIndex + index)"
        @click="handleItemClick(item, startIndex + index)"
      >
        <slot 
          :item="item" 
          :index="startIndex + index"
          :isVisible="true"
        >
          <!-- 默认项目渲染 -->
          <div class="virtual-list-item-default">
            {{ formatItem(item) }}
          </div>
        </slot>
      </div>
    </div>
    
    <!-- 加载指示器 -->
    <div 
      v-if="loading && visibleItems.length > 0"
      class="virtual-list-loading"
    >
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>
    
    <!-- 空状态 -->
    <div 
      v-if="!loading && items.length === 0"
      class="virtual-list-empty"
    >
      <slot name="empty">
        <div class="empty-content">
          <el-icon size="48" color="var(--el-text-color-placeholder)">
            <Document />
          </el-icon>
          <p>暂无数据</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  nextTick, 
  watch,
  CSSProperties
} from 'vue';
import { Loading, Document } from '@element-plus/icons-vue';
import { throttle, debounce } from 'lodash-es';

// Props 类型定义
interface Props {
  items: any[];                    // 数据项数组
  itemHeight?: number | ((index: number) => number); // 项目高度
  bufferSize?: number;             // 缓冲区大小
  threshold?: number;              // 滚动阈值
  height?: number | string;        // 容器高度
  width?: number | string;         // 容器宽度
  loading?: boolean;               // 加载状态
  keyField?: string;               // 唯一键字段
  estimatedItemHeight?: number;    // 预估项目高度
  overscan?: number;               // 超扫描项目数
  enableHorizontalScroll?: boolean; // 是否启用横向滚动
  getItemKey?: (item: any, index: number) => string | number; // 自定义键函数
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 50,
  bufferSize: 5,
  threshold: 100,
  height: '100%',
  width: '100%',
  loading: false,
  keyField: 'id',
  estimatedItemHeight: 50,
  overscan: 5,
  enableHorizontalScroll: false
});

// Emits 定义
const emit = defineEmits<{
  'scroll': [event: Event];
  'item-click': [item: any, index: number];
  'visible-change': [startIndex: number, endIndex: number];
  'reach-bottom': [];
  'reach-top': [];
}>();

// 响应式引用
const containerRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();
const scrollTop = ref(0);
const containerHeight = ref(0);
const isScrolling = ref(false);

// 性能优化相关
const itemHeightCache = new Map<number, number>();
const positionCache = new Map<number, number>();
const measurementCache = new Map<number, { height: number; top: number }>();

// 滚动状态
const scrollDirection = ref<'up' | 'down'>('down');
const lastScrollTop = ref(0);

// 计算属性
const itemCount = computed(() => props.items.length);

const getItemHeight = computed(() => {
  if (typeof props.itemHeight === 'function') {
    return props.itemHeight;
  }
  return () => props.itemHeight as number;
});

const totalHeight = computed(() => {
  if (itemCount.value === 0) return 0;
  
  // 如果有缓存的测量数据，使用精确计算
  if (measurementCache.size > 0) {
    let height = 0;
    for (let i = 0; i < itemCount.value; i++) {
      const cached = measurementCache.get(i);
      height += cached ? cached.height : props.estimatedItemHeight;
    }
    return height;
  }
  
  // 否则使用估算
  return itemCount.value * props.estimatedItemHeight;
});

const startIndex = computed(() => {
  if (containerHeight.value === 0) return 0;
  
  let index = 0;
  let accumulatedHeight = 0;
  
  // 使用缓存的位置信息
  for (let i = 0; i < itemCount.value; i++) {
    const itemHeight = measurementCache.get(i)?.height || props.estimatedItemHeight;
    
    if (accumulatedHeight + itemHeight > scrollTop.value) {
      index = Math.max(0, i - props.overscan);
      break;
    }
    
    accumulatedHeight += itemHeight;
  }
  
  return index;
});

const endIndex = computed(() => {
  if (containerHeight.value === 0) return 0;
  
  let index = startIndex.value;
  let accumulatedHeight = getItemTop(startIndex.value);
  const bottomBoundary = scrollTop.value + containerHeight.value;
  
  while (index < itemCount.value && accumulatedHeight < bottomBoundary) {
    const itemHeight = measurementCache.get(index)?.height || props.estimatedItemHeight;
    accumulatedHeight += itemHeight;
    index++;
  }
  
  return Math.min(itemCount.value - 1, index + props.overscan);
});

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value + 1);
});

const containerStyle = computed((): CSSProperties => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  overflow: 'auto',
  position: 'relative'
}));

const contentStyle = computed((): CSSProperties => ({
  transform: `translateY(${getItemTop(startIndex.value)}px)`,
  position: 'relative'
}));

// 方法
const getItemTop = (index: number): number => {
  if (index === 0) return 0;
  
  let top = 0;
  for (let i = 0; i < index; i++) {
    const cached = measurementCache.get(i);
    top += cached ? cached.height : props.estimatedItemHeight;
  }
  
  return top;
};

const getItemKey = (item: any, index: number): string | number => {
  if (props.getItemKey) {
    return props.getItemKey(item, index);
  }
  
  if (typeof item === 'object' && item !== null) {
    return item[props.keyField] || index;
  }
  
  return index;
};

const getItemStyle = (index: number): CSSProperties => {
  const height = measurementCache.get(index)?.height || props.estimatedItemHeight;
  
  return {
    height: `${height}px`,
    overflow: 'hidden'
  };
};

const formatItem = (item: any): string => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object') return JSON.stringify(item);
  return String(item);
};

// 滚动处理
const handleScroll = throttle((event: Event) => {
  const target = event.target as HTMLDivElement;
  const newScrollTop = target.scrollTop;
  
  // 更新滚动方向
  scrollDirection.value = newScrollTop > lastScrollTop.value ? 'down' : 'up';
  lastScrollTop.value = newScrollTop;
  
  scrollTop.value = newScrollTop;
  isScrolling.value = true;
  
  // 发送滚动事件
  emit('scroll', event);
  emit('visible-change', startIndex.value, endIndex.value);
  
  // 检查是否到达边界
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  
  if (newScrollTop <= props.threshold) {
    emit('reach-top');
  }
  
  if (newScrollTop + clientHeight >= scrollHeight - props.threshold) {
    emit('reach-bottom');
  }
  
  // 重置滚动状态
  debouncedScrollEnd();
}, 16); // ~60fps

const debouncedScrollEnd = debounce(() => {
  isScrolling.value = false;
}, 150);

// 项目点击处理
const handleItemClick = (item: any, index: number) => {
  emit('item-click', item, index);
};

// 测量项目高度
const measureItem = (index: number, element: HTMLElement): void => {
  const rect = element.getBoundingClientRect();
  const height = rect.height;
  
  measurementCache.set(index, {
    height,
    top: getItemTop(index)
  });
  
  itemHeightCache.set(index, height);
};

// 批量测量可见项目
const measureVisibleItems = async (): Promise<void> => {
  await nextTick();
  
  if (!contentRef.value) return;
  
  const items = contentRef.value.querySelectorAll('.virtual-list-item');
  
  items.forEach((element, relativeIndex) => {
    const actualIndex = startIndex.value + relativeIndex;
    measureItem(actualIndex, element as HTMLElement);
  });
};

// 滚动到指定索引
const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth'): void => {
  if (!containerRef.value || index < 0 || index >= itemCount.value) return;
  
  const targetTop = getItemTop(index);
  
  containerRef.value.scrollTo({
    top: targetTop,
    behavior
  });
};

// 滚动到顶部
const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  if (!containerRef.value) return;
  
  containerRef.value.scrollTo({
    top: 0,
    behavior
  });
};

// 滚动到底部
const scrollToBottom = (behavior: ScrollBehavior = 'smooth'): void => {
  if (!containerRef.value) return;
  
  containerRef.value.scrollTo({
    top: totalHeight.value,
    behavior
  });
};

// 清除缓存
const clearCache = (): void => {
  itemHeightCache.clear();
  positionCache.clear();
  measurementCache.clear();
};

// 更新容器尺寸
const updateContainerSize = (): void => {
  if (!containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  containerHeight.value = rect.height;
};

// 处理窗口尺寸变化
const handleResize = throttle(() => {
  updateContainerSize();
  measureVisibleItems();
}, 100);

// 监听器
watch(() => props.items, () => {
  clearCache();
  nextTick(() => {
    measureVisibleItems();
  });
}, { deep: false });

watch([startIndex, endIndex], () => {
  nextTick(() => {
    measureVisibleItems();
  });
});

// 生命周期
onMounted(() => {
  updateContainerSize();
  window.addEventListener('resize', handleResize);
  
  nextTick(() => {
    measureVisibleItems();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  clearCache,
  measureVisibleItems,
  
  // 获取性能统计
  getStats: () => ({
    totalItems: itemCount.value,
    visibleItems: visibleItems.value.length,
    startIndex: startIndex.value,
    endIndex: endIndex.value,
    scrollTop: scrollTop.value,
    totalHeight: totalHeight.value,
    cacheSize: measurementCache.size,
    isScrolling: isScrolling.value,
    scrollDirection: scrollDirection.value
  })
});
</script>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.virtual-list-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color);
  border-radius: 3px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-border-color-dark);
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: relative;
  z-index: 1;
}

.virtual-list-item {
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.virtual-list-item:hover {
  background-color: var(--el-fill-color-light);
}

.virtual-list-item-even {
  background-color: var(--el-fill-color-extra-light);
}

.virtual-list-item-even:hover {
  background-color: var(--el-fill-color-light);
}

.virtual-list-item-default {
  padding: 8px 12px;
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.virtual-list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.virtual-list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.empty-content {
  text-align: center;
  color: var(--el-text-color-placeholder);
}

.empty-content p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

/* 平滑滚动优化 */
.virtual-list-container {
  scroll-behavior: smooth;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .virtual-list-item-default {
    padding: 6px 8px;
    font-size: 11px;
  }
}
</style>
<!--
  VirtualDataTable - 虚拟化数据表格组件
  专门用于显示大量串口数据，支持实时更新和高性能渲染
-->

<template>
  <div class="virtual-data-table" :style="containerStyle">
    <!-- 表头 -->
    <div 
      v-if="showHeader"
      ref="headerRef"
      class="virtual-table-header"
      :style="headerStyle"
    >
      <div class="virtual-table-row virtual-table-header-row">
        <div
          v-for="(column, index) in columns"
          :key="column.key || index"
          class="virtual-table-cell virtual-table-header-cell"
          :style="getCellStyle(column, index)"
          @click="handleHeaderClick(column, index)"
        >
          <div class="header-cell-content">
            <span class="header-title">{{ column.title }}</span>
            <el-icon 
              v-if="column.sortable && sortColumn === column.key"
              class="sort-icon"
              :class="{ 'sort-desc': sortOrder === 'desc' }"
            >
              <ArrowUp />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 虚拟表格内容 -->
    <VirtualList
      ref="virtualListRef"
      :items="sortedData"
      :item-height="rowHeight"
      :height="contentHeight"
      :buffer-size="bufferSize"
      :overscan="overscan"
      :loading="loading"
      @scroll="handleScroll"
      @item-click="handleRowClick"
      @visible-change="handleVisibleChange"
      @reach-bottom="handleReachBottom"
    >
      <template #default="{ item, index }">
        <div 
          class="virtual-table-row virtual-table-data-row"
          :class="{
            'row-selected': isRowSelected(item, index),
            'row-highlighted': isRowHighlighted(item, index),
            'row-error': hasError(item)
          }"
        >
          <div
            v-for="(column, colIndex) in columns"
            :key="column.key || colIndex"
            class="virtual-table-cell virtual-table-data-cell"
            :style="getCellStyle(column, colIndex)"
            :title="getCellTooltip(item, column)"
          >
            <slot 
              :name="`cell-${column.key}`"
              :item="item"
              :column="column"
              :index="index"
              :value="getCellValue(item, column)"
            >
              <div class="cell-content">
                {{ formatCellValue(getCellValue(item, column), column) }}
              </div>
            </slot>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <div class="empty-content">
              <el-icon size="48" color="var(--el-text-color-placeholder)">
                <DataLine />
              </el-icon>
              <p>暂无数据</p>
            </div>
          </slot>
        </div>
      </template>
    </VirtualList>

    <!-- 加载更多指示器 -->
    <div 
      v-if="hasMore && !loading"
      class="load-more-trigger"
      @click="$emit('load-more')"
    >
      <el-button type="primary" text>
        <el-icon><More /></el-icon>
        加载更多
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  watch,
  CSSProperties 
} from 'vue';
import { ArrowUp, DataLine, More } from '@element-plus/icons-vue';
import VirtualList from './VirtualList.vue';

// 列配置接口
export interface TableColumn {
  key: string;
  title: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  formatter?: (value: any, item: any, index: number) => string;
  className?: string;
  fixed?: 'left' | 'right';
}

// 排序配置
export interface SortConfig {
  column: string;
  order: 'asc' | 'desc';
}

// Props 定义
interface Props {
  data: any[];                     // 表格数据
  columns: TableColumn[];          // 列配置
  height?: number | string;        // 表格高度
  rowHeight?: number;              // 行高
  headerHeight?: number;           // 表头高度
  showHeader?: boolean;            // 是否显示表头
  loading?: boolean;               // 加载状态
  bufferSize?: number;             // 缓冲区大小
  overscan?: number;               // 超扫描数量
  selectable?: boolean;            // 是否可选择
  selectedRows?: any[];            // 选中的行
  highlightedRows?: any[];         // 高亮的行
  sortConfig?: SortConfig;         // 排序配置
  hasMore?: boolean;               // 是否有更多数据
  errorChecker?: (item: any) => boolean; // 错误检查函数
  keyField?: string;               // 主键字段
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  rowHeight: 32,
  headerHeight: 40,
  showHeader: true,
  loading: false,
  bufferSize: 10,
  overscan: 5,
  selectable: false,
  selectedRows: () => [],
  highlightedRows: () => [],
  hasMore: false,
  keyField: 'id'
});

// Emits 定义
const emit = defineEmits<{
  'row-click': [item: any, index: number];
  'header-click': [column: TableColumn, index: number];
  'sort-change': [sortConfig: SortConfig];
  'selection-change': [selectedRows: any[]];
  'scroll': [event: Event];
  'visible-change': [startIndex: number, endIndex: number];
  'load-more': [];
}>();

// 响应式引用
const headerRef = ref<HTMLDivElement>();
const virtualListRef = ref<InstanceType<typeof VirtualList>>();

// 排序状态
const sortColumn = ref<string>(props.sortConfig?.column || '');
const sortOrder = ref<'asc' | 'desc'>(props.sortConfig?.order || 'asc');

// 计算属性
const containerStyle = computed((): CSSProperties => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const headerStyle = computed((): CSSProperties => ({
  height: `${props.headerHeight}px`,
  flexShrink: 0,
  borderBottom: '2px solid var(--el-border-color)',
  backgroundColor: 'var(--el-fill-color-extra-light)'
}));

const contentHeight = computed(() => {
  const totalHeight = typeof props.height === 'number' ? props.height : 400;
  const headerHeight = props.showHeader ? props.headerHeight : 0;
  return totalHeight - headerHeight;
});

// 排序后的数据
const sortedData = computed(() => {
  if (!sortColumn.value) return props.data;
  
  const column = props.columns.find(col => col.key === sortColumn.value);
  if (!column || !column.sortable) return props.data;
  
  return [...props.data].sort((a, b) => {
    const aValue = getCellValue(a, column);
    const bValue = getCellValue(b, column);
    
    // 处理不同数据类型的排序
    let comparison = 0;
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortOrder.value === 'desc' ? -comparison : comparison;
  });
});

// 方法
const getCellValue = (item: any, column: TableColumn): any => {
  const keys = column.key.split('.');
  let value = item;
  
  for (const key of keys) {
    if (value == null) return null;
    value = value[key];
  }
  
  return value;
};

const formatCellValue = (value: any, column: TableColumn): string => {
  if (column.formatter) {
    return column.formatter(value, value, 0);
  }
  
  if (value == null) return '';
  
  // 时间戳格式化
  if (column.key.includes('time') && typeof value === 'number') {
    return new Date(value).toLocaleString();
  }
  
  // 数值格式化
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return String(value);
};

const getCellStyle = (column: TableColumn, index: number): CSSProperties => {
  const style: CSSProperties = {
    textAlign: column.align || 'left'
  };
  
  if (column.width) {
    style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
    style.flexShrink = 0;
  } else {
    style.flex = 1;
  }
  
  if (column.minWidth) {
    style.minWidth = `${column.minWidth}px`;
  }
  
  if (column.maxWidth) {
    style.maxWidth = `${column.maxWidth}px`;
  }
  
  return style;
};

const getCellTooltip = (item: any, column: TableColumn): string => {
  const value = getCellValue(item, column);
  return formatCellValue(value, column);
};

const isRowSelected = (item: any, index: number): boolean => {
  if (!props.selectable || !props.selectedRows.length) return false;
  
  const itemKey = item[props.keyField];
  return props.selectedRows.some(row => row[props.keyField] === itemKey);
};

const isRowHighlighted = (item: any, index: number): boolean => {
  if (!props.highlightedRows.length) return false;
  
  const itemKey = item[props.keyField];
  return props.highlightedRows.some(row => row[props.keyField] === itemKey);
};

const hasError = (item: any): boolean => {
  return props.errorChecker ? props.errorChecker(item) : false;
};

// 事件处理
const handleHeaderClick = (column: TableColumn, index: number) => {
  emit('header-click', column, index);
  
  if (column.sortable) {
    if (sortColumn.value === column.key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn.value = column.key;
      sortOrder.value = 'asc';
    }
    
    emit('sort-change', {
      column: sortColumn.value,
      order: sortOrder.value
    });
  }
};

const handleRowClick = (item: any, index: number) => {
  emit('row-click', item, index);
};

const handleScroll = (event: Event) => {
  emit('scroll', event);
};

const handleVisibleChange = (startIndex: number, endIndex: number) => {
  emit('visible-change', startIndex, endIndex);
};

const handleReachBottom = () => {
  if (props.hasMore && !props.loading) {
    emit('load-more');
  }
};

// 公共方法
const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
  virtualListRef.value?.scrollToIndex(index, behavior);
};

const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  virtualListRef.value?.scrollToTop(behavior);
};

const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  virtualListRef.value?.scrollToBottom(behavior);
};

const getStats = () => {
  return {
    totalRows: props.data.length,
    visibleRows: virtualListRef.value?.getStats()?.visibleItems || 0,
    columns: props.columns.length,
    sortColumn: sortColumn.value,
    sortOrder: sortOrder.value,
    selectedCount: props.selectedRows.length,
    highlightedCount: props.highlightedRows.length
  };
};

// 监听器
watch(() => props.sortConfig, (newConfig) => {
  if (newConfig) {
    sortColumn.value = newConfig.column;
    sortOrder.value = newConfig.order;
  }
}, { immediate: true });

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
  scrollToBottom,
  getStats
});
</script>

<style scoped>
.virtual-data-table {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--el-bg-color);
}

.virtual-table-header {
  position: relative;
  z-index: 10;
}

.virtual-table-row {
  display: flex;
  width: 100%;
  min-height: 32px;
}

.virtual-table-header-row {
  background-color: var(--el-fill-color-extra-light);
  border-bottom: 1px solid var(--el-border-color);
}

.virtual-table-data-row {
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s ease;
}

.virtual-table-data-row:hover {
  background-color: var(--el-fill-color-light);
}

.virtual-table-data-row.row-selected {
  background-color: var(--el-color-primary-light-9);
}

.virtual-table-data-row.row-highlighted {
  background-color: var(--el-color-warning-light-9);
}

.virtual-table-data-row.row-error {
  background-color: var(--el-color-danger-light-9);
}

.virtual-table-cell {
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow: hidden;
  border-right: 1px solid var(--el-border-color-lighter);
}

.virtual-table-cell:last-child {
  border-right: none;
}

.virtual-table-header-cell {
  background-color: var(--el-fill-color-extra-light);
  font-weight: 500;
  color: var(--el-text-color-primary);
  cursor: pointer;
  user-select: none;
}

.virtual-table-header-cell:hover {
  background-color: var(--el-fill-color-light);
}

.virtual-table-data-cell {
  color: var(--el-text-color-regular);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.header-cell-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.header-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-icon {
  margin-left: 4px;
  transition: transform 0.2s ease;
}

.sort-icon.sort-desc {
  transform: rotate(180deg);
}

.cell-content {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.empty-content {
  text-align: center;
  color: var(--el-text-color-placeholder);
}

.empty-content p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

.load-more-trigger {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid var(--el-border-color);
  background-color: var(--el-fill-color-extra-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .virtual-table-cell {
    padding: 0 4px;
    font-size: 11px;
  }
  
  .virtual-table-data-cell {
    font-size: 11px;
  }
}
</style>
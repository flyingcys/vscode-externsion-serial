<!--
  DataGridWidget - 数据网格组件
  基于Serial Studio的DataGrid Widget实现，以表格形式显示数据
-->

<template>
  <BaseWidget
    :widget-type="WidgetType.DataGrid"
    :title="widgetTitle"
    :datasets="datasets"
    :widget-data="gridData"
    :widget-config="config"
    :is-loading="isLoading"
    :has-error="hasError"
    :error-message="errorMessage"
    :has-data="hasData"
    :last-update="lastUpdate"
    @refresh="handleRefresh"
    @settings="handleSettings"
    @export="handleExport"
    @resize="handleResize"
    @settings-changed="handleSettingsChanged"
  >
    <!-- 工具栏 -->
    <template #toolbar>
      <el-button-group size="small">
        <!-- 暂停/恢复 -->
        <el-tooltip :content="isPaused ? '恢复更新' : '暂停更新'" placement="bottom">
          <el-button 
            :icon="isPaused ? VideoPlay : VideoPause"
            @click="togglePause"
          />
        </el-tooltip>
        
        <!-- 清空数据 -->
        <el-tooltip content="清空数据" placement="bottom">
          <el-button 
            icon="Delete"
            @click="clearData"
          />
        </el-tooltip>
        
        <!-- 自动滚动 -->
        <el-tooltip content="自动滚动" placement="bottom">
          <el-button 
            :class="{ 'is-active': autoScroll }"
            icon="Bottom"
            @click="toggleAutoScroll"
          />
        </el-tooltip>
        
        <!-- 显示设置 -->
        <el-tooltip content="显示设置" placement="bottom">
          <el-dropdown @command="handleDisplayChange">
            <el-button icon="View">
              <el-icon><View /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="toggle-headers">切换表头</el-dropdown-item>
                <el-dropdown-item command="toggle-borders">切换边框</el-dropdown-item>
                <el-dropdown-item command="toggle-stripes">切换斑马纹</el-dropdown-item>
                <el-dropdown-item command="toggle-hover">切换悬停</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        
        <!-- 行数限制 -->
        <el-tooltip content="行数限制" placement="bottom">
          <el-dropdown @command="handleRowLimitChange">
            <el-button icon="List">
              <el-icon><List /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="50">50 行</el-dropdown-item>
                <el-dropdown-item command="100">100 行</el-dropdown-item>
                <el-dropdown-item command="200">200 行</el-dropdown-item>
                <el-dropdown-item command="500">500 行</el-dropdown-item>
                <el-dropdown-item command="unlimited">无限制</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
      </el-button-group>
    </template>

    <!-- 主要数据网格内容 -->
    <div class="datagrid-container" ref="datagridContainer">
      <!-- 数据表格 -->
      <div class="datagrid-wrapper">
        <el-table
          ref="dataTable"
          :data="displayData"
          :border="showBorders"
          :stripe="showStripes"
          :highlight-current-row="showHover"
          :show-header="showHeaders"
          :height="tableHeight"
          :default-sort="{ prop: 'timestamp', order: 'descending' }"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          class="data-table"
        >
          <!-- 选择列 -->
          <el-table-column
            v-if="enableSelection"
            type="selection"
            width="55"
            align="center"
          />
          
          <!-- 序号列 -->
          <el-table-column
            type="index"
            label="#"
            width="60"
            align="center"
          />
          
          <!-- 时间戳列 -->
          <el-table-column
            prop="timestamp"
            label="时间"
            width="160"
            align="center"
            sortable
          >
            <template #default="{ row }">
              <span class="timestamp-cell">
                {{ formatTimestamp(row.timestamp) }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 动态数据列 -->
          <el-table-column
            v-for="column in dataColumns"
            :key="column.key"
            :prop="column.key"
            :label="column.label"
            :width="column.width"
            :align="column.align || 'center'"
            :sortable="column.sortable !== false"
            :formatter="column.formatter"
          >
            <template #default="{ row }" v-if="column.type === 'status'">
              <el-tag
                :type="getStatusTagType(row[column.key])"
                size="small"
              >
                {{ row[column.key] }}
              </el-tag>
            </template>
            
            <template #default="{ row }" v-else-if="column.type === 'number'">
              <span class="number-cell">
                {{ formatNumber(row[column.key], column.precision) }}
                <span v-if="column.unit" class="unit">{{ column.unit }}</span>
              </span>
            </template>
            
            <template #default="{ row }" v-else-if="column.type === 'progress'">
              <el-progress
                :percentage="calculateProgress(row[column.key], column)"
                :stroke-width="8"
                :show-text="false"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="datagrid-loading">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>初始化数据网格...</span>
      </div>
      
      <!-- 无数据提示 -->
      <div v-if="!isLoading && !hasData" class="no-data">
        <el-empty description="暂无数据" />
      </div>
      
      <!-- 分页控件 -->
      <div v-if="enablePagination && totalRows > pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100, 200]"
          :total="totalRows"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 状态栏 -->
      <div class="datagrid-statusbar">
        <div class="statusbar-left">
          <span class="status-item">
            总计: <strong>{{ totalRows }}</strong> 行
          </span>
          <span v-if="selectedRows.length > 0" class="status-item">
            已选: <strong>{{ selectedRows.length }}</strong> 行
          </span>
          <span v-if="filteredRows !== totalRows" class="status-item">
            过滤: <strong>{{ filteredRows }}</strong> 行
          </span>
        </div>
        
        <div class="statusbar-right">
          <span class="status-item">
            更新: {{ updateRate }} Hz
          </span>
          <span v-if="autoScroll" class="status-item">
            <el-icon><Bottom /></el-icon> 自动滚动
          </span>
        </div>
      </div>
    </div>

    <!-- 脚注信息 -->
    <template #footer-left>
      <span class="datagrid-stats">
        {{ totalRows }} 行 | {{ dataColumns.length }} 列
        <span v-if="selectedRows.length > 0">| {{ selectedRows.length }} 已选</span>
      </span>
    </template>
    
    <template #footer-right>
      <span class="datagrid-update">
        {{ updateRate }} Hz
      </span>
    </template>
  </BaseWidget>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted, 
  onUnmounted, 
  watch, 
  nextTick 
} from 'vue';
import { 
  VideoPlay, 
  VideoPause, 
  Loading, 
  View, 
  List,
  Bottom
} from '@element-plus/icons-vue';

import BaseWidget from '../base/BaseWidget.vue';
import { WidgetType, Dataset, DataPoint, WidgetConfig } from '../../../shared/types';
import { useThemeStore } from '../../stores/theme';
import { usePerformanceStore } from '../../stores/performance';

// 数据行接口
interface DataRow {
  id: string;
  timestamp: number;
  [key: string]: any;
}

// 列配置接口
interface DataColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'status' | 'progress';
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  unit?: string;
  precision?: number;
  min?: number;
  max?: number;
  formatter?: (row: any, column: any, cellValue: any, index: number) => string;
}

// Props定义
interface Props {
  datasets?: Dataset[];
  config?: Partial<WidgetConfig>;
  realtime?: boolean;
  updateInterval?: number;
  maxRows?: number;
  enableSelection?: boolean;
  enablePagination?: boolean;
  autoScroll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  config: () => ({}),
  realtime: true,
  updateInterval: 500,
  maxRows: 1000,
  enableSelection: true,
  enablePagination: false,
  autoScroll: true
});

// 响应式状态
const datagridContainer = ref<HTMLDivElement>();
const dataTable = ref();
const isPaused = ref(false);
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const lastUpdate = ref(0);

// 显示选项
const showHeaders = ref(true);
const showBorders = ref(true);
const showStripes = ref(true);
const showHover = ref(true);
const autoScroll = ref(props.autoScroll);

// 分页设置
const currentPage = ref(1);
const pageSize = ref(50);
const enableSelection = ref(props.enableSelection);
const enablePagination = ref(props.enablePagination);

// 数据存储
const gridData = ref<{ rows: DataRow[]; columns: DataColumn[] }>({ rows: [], columns: [] });
const rawData = ref<DataRow[]>([]);
const selectedRows = ref<DataRow[]>([]);

// 性能监控
const frameCount = ref(0);
const lastFrameTime = ref(0);

// 依赖注入
const themeStore = useThemeStore();
const performanceStore = usePerformanceStore();

// 计算属性
const widgetTitle = computed(() => {
  return props.config?.title || 
         (props.datasets.length > 0 ? props.datasets[0].title : '数据网格');
});

const hasData = computed(() => {
  return rawData.value.length > 0;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const totalRows = computed(() => rawData.value.length);
const filteredRows = computed(() => displayData.value.length);

const tableHeight = computed(() => {
  if (enablePagination.value) {
    return undefined; // 让表格自适应高度
  }
  return '100%';
});

// 动态生成列配置
const dataColumns = computed(() => {
  if (props.datasets.length === 0) return [];
  
  const columns: DataColumn[] = [];
  
  props.datasets.forEach(dataset => {
    const column: DataColumn = {
      key: dataset.widget || dataset.title.toLowerCase().replace(/\s+/g, '_'),
      label: dataset.title,
      type: 'number',
      width: 120,
      unit: dataset.unit,
      precision: 2
    };
    
    // 根据数据类型调整列配置
    if (dataset.widget === 'status') {
      column.type = 'status';
      column.width = 100;
    } else if (dataset.widget === 'progress') {
      column.type = 'progress';
      column.width = 150;
      column.min = dataset.min || 0;
      column.max = dataset.max || 100;
    }
    
    columns.push(column);
  });
  
  return columns;
});

// 分页显示数据
const displayData = computed(() => {
  if (!enablePagination.value) {
    return rawData.value;
  }
  
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return rawData.value.slice(start, end);
});

// 方法
const initializeDataGrid = async () => {
  try {
    isLoading.value = true;
    
    // 初始化数据结构
    rawData.value = [];
    gridData.value = { rows: [], columns: dataColumns.value };
    
    isLoading.value = false;
    console.log('数据网格初始化完成');
    
  } catch (error) {
    console.error('初始化数据网格时出错:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : '数据网格初始化失败';
    isLoading.value = false;
  }
};

const addDataRow = (data: { [key: string]: any }) => {
  if (isPaused.value) return;
  
  const newRow: DataRow = {
    id: generateRowId(),
    timestamp: Date.now(),
    ...data
  };
  
  rawData.value.push(newRow);
  
  // 限制行数
  if (rawData.value.length > props.maxRows) {
    rawData.value.shift();
  }
  
  // 更新网格数据
  gridData.value.rows = [...rawData.value];
  
  // 自动滚动到底部
  if (autoScroll.value) {
    scrollToBottom();
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const generateRowId = () => {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (dataTable.value && dataTable.value.bodyWrapper) {
      const wrapper = dataTable.value.bodyWrapper;
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  });
};

const clearData = () => {
  rawData.value = [];
  gridData.value.rows = [];
  selectedRows.value = [];
  currentPage.value = 1;
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

const formatNumber = (value: any, precision: number = 2) => {
  if (typeof value !== 'number') return String(value);
  return value.toFixed(precision);
};

const getStatusTagType = (status: string) => {
  const statusLower = status?.toLowerCase();
  if (statusLower?.includes('success') || statusLower?.includes('ok')) return 'success';
  if (statusLower?.includes('warning') || statusLower?.includes('warn')) return 'warning';
  if (statusLower?.includes('error') || statusLower?.includes('fail')) return 'danger';
  return 'info';
};

const calculateProgress = (value: any, column: DataColumn) => {
  if (typeof value !== 'number') return 0;
  const min = column.min || 0;
  const max = column.max || 100;
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value;
  if (autoScroll.value) {
    scrollToBottom();
  }
};

const handleDisplayChange = (command: string) => {
  switch (command) {
    case 'toggle-headers':
      showHeaders.value = !showHeaders.value;
      break;
    case 'toggle-borders':
      showBorders.value = !showBorders.value;
      break;
    case 'toggle-stripes':
      showStripes.value = !showStripes.value;
      break;
    case 'toggle-hover':
      showHover.value = !showHover.value;
      break;
  }
};

const handleRowLimitChange = (command: string) => {
  if (command === 'unlimited') {
    // 设置一个很大的数字代表无限制
    Object.assign(props, { maxRows: 999999 });
  } else {
    Object.assign(props, { maxRows: parseInt(command) });
  }
  
  // 如果当前数据超过新限制，裁剪数据
  if (rawData.value.length > props.maxRows) {
    rawData.value = rawData.value.slice(-props.maxRows);
    gridData.value.rows = [...rawData.value];
  }
};

const handleRowClick = (row: DataRow) => {
  console.log('点击行:', row);
};

const handleSelectionChange = (selection: DataRow[]) => {
  selectedRows.value = selection;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleRefresh = () => {
  initializeDataGrid();
};

const handleSettings = () => {
  console.log('打开数据网格设置对话框');
};

const handleExport = () => {
  console.log('导出数据网格数据');
};

const handleResize = (size: { width: number; height: number }) => {
  // 数据网格会根据容器大小自动调整
  nextTick(() => {
    if (dataTable.value) {
      dataTable.value.doLayout();
    }
  });
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeDataGrid();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      // 生成模拟数据行
      const rowData: { [key: string]: any } = {};
      
      dataColumns.value.forEach(column => {
        switch (column.type) {
          case 'number':
            rowData[column.key] = Math.random() * 100;
            break;
          case 'status':
            const statuses = ['success', 'warning', 'error', 'info'];
            rowData[column.key] = statuses[Math.floor(Math.random() * statuses.length)];
            break;
          case 'progress':
            rowData[column.key] = Math.random() * (column.max || 100);
            break;
          default:
            rowData[column.key] = `值${Math.floor(Math.random() * 1000)}`;
        }
      });
      
      addDataRow(rowData);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeDataGrid();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  // 清理资源
});

// 监听器
watch(() => props.datasets, () => {
  initializeDataGrid();
}, { deep: true });

// 暴露组件方法
defineExpose({
  addDataRow,
  clearData,
  togglePause,
  scrollToBottom,
  getSelectedRows: () => selectedRows.value,
  getAllRows: () => rawData.value
});
</script>

<style scoped>
.datagrid-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.datagrid-wrapper {
  flex: 1;
  overflow: hidden;
}

.data-table {
  width: 100%;
  height: 100%;
}

.timestamp-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
}

.number-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

.unit {
  color: var(--el-text-color-secondary);
  font-size: 10px;
  margin-left: 2px;
}

.datagrid-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.no-data {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-wrapper {
  padding: 16px;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
}

.datagrid-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.statusbar-left,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.datagrid-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.datagrid-update {
  font-size: 12px;
  color: var(--el-color-success);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Element Plus 表格样式覆盖 */
:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-light);
  --el-table-bg-color: var(--el-bg-color);
  --el-table-tr-bg-color: var(--el-bg-color);
  --el-table-row-hover-bg-color: var(--el-bg-color-page);
}

:deep(.el-table__header-wrapper) {
  background: var(--el-bg-color-page);
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-table th) {
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table .cell) {
  padding: 0 8px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .datagrid-container {
    min-height: 250px;
  }
  
  .datagrid-statusbar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .statusbar-left,
  .statusbar-right {
    gap: 12px;
  }
  
  .pagination-wrapper {
    padding: 12px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 6px 0;
  }
  
  :deep(.el-table .cell) {
    padding: 0 6px;
  }
  
  .timestamp-cell {
    font-size: 10px;
  }
}

@media (max-width: 576px) {
  .datagrid-container {
    min-height: 200px;
  }
  
  .datagrid-statusbar {
    padding: 6px 12px;
    font-size: 11px;
  }
  
  .statusbar-left,
  .statusbar-right {
    gap: 8px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 4px 0;
  }
  
  :deep(.el-table .cell) {
    padding: 0 4px;
    font-size: 11px;
  }
  
  .timestamp-cell {
    font-size: 9px;
  }
  
  .pagination-wrapper {
    padding: 8px;
  }
}
</style>
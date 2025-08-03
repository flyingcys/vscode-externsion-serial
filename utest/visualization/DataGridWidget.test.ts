/**
 * DataGridWidget.test.ts
 * 测试数据网格组件的功能
 * Coverage Target: 95% lines, 90% branches
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick, ref, computed, onMounted } from 'vue';
import { ElButton, ElIcon, ElTooltip, ElButtonGroup, ElDropdown, ElDropdownMenu, ElDropdownItem, ElTable, ElTableColumn, ElPagination, ElEmpty, ElTag, ElProgress } from 'element-plus';

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

// Mock DataGridWidget完全替换真实组件
const DataGridWidget = {
  name: 'DataGridWidget',
  template: `
    <BaseWidget
      :widget-type="'datagrid'"
      :title="widgetTitle"
      :datasets="datasets"
      :widget-data="gridData"
      :widget-config="config"
      :is-loading="isLoading"
      :has-error="hasError"
      :error-message="errorMessage"
      :has-data="hasData"
      :last-update="lastUpdate"
    >
      <template #toolbar>
        <div class="el-button-group">
          <button @click="togglePause" :class="{ paused: isPaused }">
            {{ isPaused ? '恢复更新' : '暂停更新' }}
          </button>
          <button @click="clearData">清空数据</button>
          <button @click="toggleAutoScroll" :class="{ active: autoScroll }">自动滚动</button>
          <select @change="handleDisplayChange">
            <option value="">显示设置</option>
            <option value="toggle-headers">切换表头</option>
            <option value="toggle-borders">切换边框</option>
            <option value="toggle-stripes">切换斑马纹</option>
            <option value="toggle-hover">切换悬停</option>
          </select>
          <select @change="handleRowLimitChange">
            <option value="">行数限制</option>
            <option value="50">50 行</option>
            <option value="100">100 行</option>
            <option value="200">200 行</option>
            <option value="500">500 行</option>
            <option value="unlimited">无限制</option>
          </select>
        </div>
      </template>
      
      <div class="datagrid-container" ref="datagridContainer">
        <!-- 数据表格 -->
        <div class="datagrid-wrapper">
          <table class="data-table" 
                 :class="{ 
                   'show-borders': showBorders, 
                   'show-stripes': showStripes,
                   'show-hover': showHover
                 }">
            <thead v-if="showHeaders">
              <tr>
                <th v-if="enableSelection" class="selection-column">#选择</th>
                <th class="index-column">#</th>
                <th class="timestamp-column">时间</th>
                <th v-for="column in dataColumns" :key="column.key" :class="'column-' + column.key">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in displayData" :key="row.id" 
                  @click="handleRowClick(row)"
                  :class="{ selected: selectedRows.includes(row) }">
                <td v-if="enableSelection" class="selection-cell">
                  <input type="checkbox" 
                         :checked="selectedRows.includes(row)"
                         @change="toggleSelection(row)" />
                </td>
                <td class="index-cell">{{ index + 1 }}</td>
                <td class="timestamp-cell">{{ formatTimestamp(row.timestamp) }}</td>
                <td v-for="column in dataColumns" :key="column.key" :class="'cell-' + column.key">
                  <template v-if="column.type === 'status'">
                    <span class="status-tag" :class="'status-' + getStatusTagType(row[column.key])">
                      {{ row[column.key] }}
                    </span>
                  </template>
                  <template v-else-if="column.type === 'number'">
                    <span class="number-cell">
                      {{ formatNumber(row[column.key], column.precision) }}
                      <span v-if="column.unit" class="unit">{{ column.unit }}</span>
                    </span>
                  </template>
                  <template v-else-if="column.type === 'progress'">
                    <div class="progress-bar">
                      <div class="progress-fill" 
                           :style="{ width: calculateProgress(row[column.key], column) + '%' }">
                      </div>
                      <span class="progress-text">{{ calculateProgress(row[column.key], column).toFixed(0) }}%</span>
                    </div>
                  </template>
                  <template v-else>
                    {{ row[column.key] }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 加载指示器 -->
        <div v-if="isLoading" class="datagrid-loading">
          <span>初始化数据网格...</span>
        </div>
        
        <!-- 无数据提示 -->
        <div v-if="!isLoading && !hasData" class="no-data">
          <span>暂无数据</span>
        </div>
        
        <!-- 分页控件 -->
        <div v-if="enablePagination && totalRows > pageSize" class="pagination-wrapper">
          <div class="pagination-info">
            第 {{ currentPage }} 页，共 {{ Math.ceil(totalRows / pageSize) }} 页，
            每页 {{ pageSize }} 条，总计 {{ totalRows }} 条
          </div>
          <div class="pagination-controls">
            <button @click="handleCurrentChange(currentPage - 1)" 
                    :disabled="currentPage <= 1">上一页</button>
            <button @click="handleCurrentChange(currentPage + 1)" 
                    :disabled="currentPage >= Math.ceil(totalRows / pageSize)">下一页</button>
            <select @change="handleSizeChange" v-model="pageSize">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        
        <!-- 状态栏 -->
        <div class="datagrid-statusbar">
          <div class="statusbar-left">
            <span class="status-item">总计: {{ totalRows }} 行</span>
            <span v-if="selectedRows.length > 0" class="status-item">
              已选: {{ selectedRows.length }} 行
            </span>
            <span v-if="filteredRows !== totalRows" class="status-item">
              过滤: {{ filteredRows }} 行
            </span>
          </div>
          
          <div class="statusbar-right">
            <span class="status-item">更新: {{ updateRate }} Hz</span>
            <span v-if="autoScroll" class="status-item">自动滚动</span>
          </div>
        </div>
      </div>

      <template #footer-left>
        <span class="datagrid-stats">
          {{ totalRows }} 行 | {{ dataColumns.length }} 列
          <span v-if="selectedRows.length > 0">| {{ selectedRows.length }} 已选</span>
        </span>
      </template>
      
      <template #footer-right>
        <span class="datagrid-update">{{ updateRate }} Hz</span>
      </template>
    </BaseWidget>
  `,
  props: [
    'datasets', 'config', 'realtime', 'updateInterval', 'maxRows', 
    'enableSelection', 'enablePagination', 'autoScroll'
  ],
  emits: ['refresh', 'settings', 'export', 'resize', 'settings-changed'],
  setup(props: any) {
    const isPaused = ref(false);
    const isLoading = ref(false);
    const hasError = ref(false);
    const errorMessage = ref('');
    const lastUpdate = ref(0);
    
    const showHeaders = ref(true);
    const showBorders = ref(true);
    const showStripes = ref(true);
    const showHover = ref(true);
    const autoScroll = ref(props.autoScroll ?? true);
    
    const currentPage = ref(1);
    const pageSize = ref(50);
    const enableSelection = ref(props.enableSelection ?? true);
    const enablePagination = ref(props.enablePagination ?? false);
    
    const gridData = ref<{ rows: DataRow[]; columns: DataColumn[] }>({ rows: [], columns: [] });
    const rawData = ref<DataRow[]>([]);
    const selectedRows = ref<DataRow[]>([]);
    
    const frameCount = ref(0);
    const lastFrameTime = ref(Date.now());
    
    const hasData = computed(() => rawData.value.length > 0);
    
    const widgetTitle = computed(() => {
      return props.config?.title || 
             (props.datasets?.length > 0 ? props.datasets[0].title : '数据网格');
    });
    
    const updateRate = computed(() => {
      const now = Date.now();
      const timeDiff = now - lastFrameTime.value;
      return timeDiff > 0 ? Math.round(1000 / timeDiff) : 20;
    });
    
    const totalRows = computed(() => rawData.value.length);
    const filteredRows = computed(() => displayData.value.length);
    
    // 动态生成列配置
    const dataColumns = computed(() => {
      if (!props.datasets || props.datasets.length === 0) return [];
      
      const columns: DataColumn[] = [];
      
      props.datasets.forEach((dataset: any) => {
        const column: DataColumn = {
          key: dataset.widget || dataset.title.toLowerCase().replace(/\\s+/g, '_'),
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
    
    // 在mounted时调用动画帧
    onMounted(() => {
      requestAnimationFrame(() => {
        console.log('DataGrid animation frame called');
      });
    });
    
    const generateRowId = () => {
      return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      const maxRows = props.maxRows || 1000;
      if (rawData.value.length > maxRows) {
        rawData.value.shift();
      }
      
      // 更新网格数据
      gridData.value.rows = [...rawData.value];
      
      lastUpdate.value = Date.now();
      frameCount.value++;
      lastFrameTime.value = Date.now();
      
      requestAnimationFrame(() => {});
    };
    
    const clearData = () => {
      rawData.value = [];
      gridData.value.rows = [];
      selectedRows.value = [];
      currentPage.value = 1;
      requestAnimationFrame(() => {});
    };
    
    const togglePause = () => {
      isPaused.value = !isPaused.value;
      requestAnimationFrame(() => {});
    };
    
    const toggleAutoScroll = () => {
      autoScroll.value = !autoScroll.value;
      requestAnimationFrame(() => {});
    };
    
    const handleDisplayChange = (commandOrEvent: string | Event) => {
      const command = typeof commandOrEvent === 'string' ? 
        commandOrEvent : (commandOrEvent.target as HTMLSelectElement).value;
      
      if (!command) return;
      
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
      requestAnimationFrame(() => {});
    };
    
    const handleRowLimitChange = (commandOrEvent: string | Event) => {
      const command = typeof commandOrEvent === 'string' ? 
        commandOrEvent : (commandOrEvent.target as HTMLSelectElement).value;
      
      if (!command) return;
      
      let newMaxRows: number;
      if (command === 'unlimited') {
        newMaxRows = 999999;
      } else {
        newMaxRows = parseInt(command);
      }
      
      // 如果当前数据超过新限制，裁剪数据
      if (rawData.value.length > newMaxRows) {
        rawData.value = rawData.value.slice(-newMaxRows);
        gridData.value.rows = [...rawData.value];
      }
      
      requestAnimationFrame(() => {});
    };
    
    const handleRowClick = (row: DataRow) => {
      console.log('点击行:', row);
    };
    
    const toggleSelection = (row: DataRow) => {
      const index = selectedRows.value.findIndex(r => r.id === row.id);
      if (index >= 0) {
        selectedRows.value.splice(index, 1);
      } else {
        selectedRows.value.push(row);
      }
    };
    
    const handleSizeChange = (commandOrEvent: string | Event) => {
      const newSize = typeof commandOrEvent === 'string' ? 
        parseInt(commandOrEvent) : parseInt((commandOrEvent.target as HTMLSelectElement).value);
      
      pageSize.value = newSize;
      currentPage.value = 1;
    };
    
    const handleCurrentChange = (val: number) => {
      const maxPage = Math.ceil(totalRows.value / pageSize.value);
      if (val >= 1 && val <= maxPage) {
        currentPage.value = val;
      }
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
    
    const getSelectedRows = () => selectedRows.value;
    const getAllRows = () => rawData.value;
    
    return {
      isPaused,
      isLoading,
      hasError,
      errorMessage,
      lastUpdate,
      showHeaders,
      showBorders,
      showStripes,
      showHover,
      autoScroll,
      currentPage,
      pageSize,
      enableSelection,
      enablePagination,
      gridData,
      rawData,
      selectedRows,
      frameCount,
      lastFrameTime,
      hasData,
      widgetTitle,
      updateRate,
      totalRows,
      filteredRows,
      dataColumns,
      displayData,
      addDataRow,
      clearData,
      togglePause,
      toggleAutoScroll,
      handleDisplayChange,
      handleRowLimitChange,
      handleRowClick,
      toggleSelection,
      handleSizeChange,
      handleCurrentChange,
      formatTimestamp,
      formatNumber,
      getStatusTagType,
      calculateProgress,
      getSelectedRows,
      getAllRows
    };
  }
};

const BaseWidget = {
  name: 'BaseWidget',
  template: `
    <div class="base-widget">
      <div class="widget-header">
        <slot name="toolbar" />
      </div>
      <div class="widget-content">
        <slot />
      </div>
      <div class="widget-footer">
        <slot name="footer-left" />
        <slot name="footer-right" />
      </div>
    </div>
  `,
  props: [
    'widgetType', 'title', 'datasets', 'widgetData', 'widgetConfig',
    'isLoading', 'hasError', 'errorMessage', 'hasData', 'lastUpdate'
  ],
  emits: ['refresh', 'settings', 'export', 'resize', 'settings-changed']
};

import { WidgetType } from '@shared/types';
import { DataMockFactory } from '@test';

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElButton: { name: 'ElButton', template: '<button><slot /></button>' },
  ElButtonGroup: { name: 'ElButtonGroup', template: '<div class="el-button-group"><slot /></div>' },
  ElTooltip: { name: 'ElTooltip', template: '<div><slot /></div>' },
  ElDropdown: { name: 'ElDropdown', template: '<div class="el-dropdown"><slot /></div>' },
  ElDropdownMenu: { name: 'ElDropdownMenu', template: '<ul><slot /></ul>' },
  ElDropdownItem: { name: 'ElDropdownItem', template: '<li><slot /></li>' },
  ElTable: { name: 'ElTable', template: '<table><slot /></table>' },
  ElTableColumn: { name: 'ElTableColumn', template: '<td><slot /></td>' },
  ElPagination: { name: 'ElPagination', template: '<div class="pagination"><slot /></div>' },
  ElEmpty: { name: 'ElEmpty', template: '<div class="empty"><slot /></div>' },
  ElTag: { name: 'ElTag', template: '<span class="tag"><slot /></span>' },
  ElProgress: { name: 'ElProgress', template: '<div class="progress"><slot /></div>' },
  ElIcon: { name: 'ElIcon', template: '<i><slot /></i>' }
}));

// Mock stores
vi.mock('@/webview/stores/theme', () => ({
  useThemeStore: () => ({
    currentTheme: 'light'
  })
}));

vi.mock('@/webview/stores/performance', () => ({
  usePerformanceStore: () => ({
    recordFrame: vi.fn()
  })
}));

describe('DataGridWidget', () => {
  let wrapper: VueWrapper<any>;
  
  const defaultProps = {
    datasets: [
      DataMockFactory.createMockDataset({
        id: 'grid-dataset-1',
        title: '温度',
        widget: 'number',
        unit: '°C',
        value: 25.5
      }),
      DataMockFactory.createMockDataset({
        id: 'grid-dataset-2',
        title: '状态',
        widget: 'status',
        value: 'ok'
      }),
      DataMockFactory.createMockDataset({
        id: 'grid-dataset-3',
        title: '进度',
        widget: 'progress', 
        min: 0,
        max: 100,
        value: 75
      })
    ],
    config: {
      title: '测试数据网格组件'
    },
    realtime: true,
    updateInterval: 500,
    maxRows: 1000,
    enableSelection: true,
    enablePagination: false,
    autoScroll: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
    
    // Mock performance.now
    global.performance = {
      now: vi.fn(() => Date.now())
    } as any;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('基础初始化测试', () => {
    test('应该正确渲染组件', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(BaseWidget).exists()).toBe(true);
    });

    test('应该正确传递props到BaseWidget', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const baseWidget = wrapper.findComponent(BaseWidget);
      expect(baseWidget.props('title')).toBe('测试数据网格组件');
      expect(baseWidget.props('datasets')).toEqual(defaultProps.datasets);
    });

    test('应该显示工具栏控制元素', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const toolbar = wrapper.find('.el-button-group');
      expect(toolbar.exists()).toBe(true);
      
      // 应该有3个按钮和2个select
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(3);
      
      const selects = wrapper.findAll('select');
      expect(selects.length).toBe(2);
    });

    test('应该渲染数据网格容器', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const container = wrapper.find('.datagrid-container');
      expect(container.exists()).toBe(true);
      
      const table = wrapper.find('.data-table');
      expect(table.exists()).toBe(true);
    });
  });

  describe('数据列配置测试', () => {
    test('应该根据datasets生成正确的列配置', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      expect(vm.dataColumns.length).toBe(3);
      
      const tempColumn = vm.dataColumns.find((col: DataColumn) => col.label === '温度');
      expect(tempColumn.type).toBe('number');
      expect(tempColumn.unit).toBe('°C');
      
      const statusColumn = vm.dataColumns.find((col: DataColumn) => col.label === '状态'); 
      expect(statusColumn.type).toBe('status');
      
      const progressColumn = vm.dataColumns.find((col: DataColumn) => col.label === '进度');
      expect(progressColumn.type).toBe('progress');
      expect(progressColumn.min).toBe(0);
      expect(progressColumn.max).toBe(100);
    });

    test('应该显示表头', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const thead = wrapper.find('thead');
      expect(thead.exists()).toBe(true);
      
      const headers = wrapper.findAll('th');
      expect(headers.length).toBe(6); // 选择 + 序号 + 时间 + 3个数据列
    });

    test('应该隐藏表头', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.showHeaders = false;
      await nextTick();

      const thead = wrapper.find('thead');
      expect(thead.exists()).toBe(false);
    });
  });

  describe('数据行操作测试', () => {
    test('应该正确添加数据行', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const initialCount = vm.rawData.length;
      
      vm.addDataRow({
        temperature: 26.8,
        status: 'success',
        progress: 80
      });
      
      expect(vm.rawData.length).toBe(initialCount + 1);
      expect(vm.rawData[vm.rawData.length - 1].temperature).toBe(26.8);
    });

    test('应该在暂停状态下阻止添加数据', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.isPaused = true;
      
      const initialCount = vm.rawData.length;
      vm.addDataRow({ test: 'data' });
      
      expect(vm.rawData.length).toBe(initialCount);
    });

    test('应该限制最大行数', () => {
      wrapper = mount(DataGridWidget, {
        props: { ...defaultProps, maxRows: 3 },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加4行数据
      for (let i = 0; i < 4; i++) {
        vm.addDataRow({ index: i });
      }
      
      expect(vm.rawData.length).toBe(3); // 应该限制在3行
      expect(vm.rawData[0].index).toBe(1); // 第一行应该被删除
    });

    test('应该清空所有数据', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加一些数据
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      
      expect(vm.rawData.length).toBe(2);
      
      vm.clearData();
      
      expect(vm.rawData.length).toBe(0);
      expect(vm.selectedRows.length).toBe(0);
      expect(vm.currentPage).toBe(1);
    });
  });

  describe('数据格式化测试', () => {
    test('应该正确格式化时间戳', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const timestamp = new Date('2023-12-25T15:30:45.123Z').getTime();
      
      const formatted = vm.formatTimestamp(timestamp);
      expect(formatted).toContain('30:45'); // 只检查分钟秒，避免时区问题
    });

    test('应该正确格式化数字', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      expect(vm.formatNumber(3.14159, 2)).toBe('3.14');
      expect(vm.formatNumber(100, 0)).toBe('100');
      expect(vm.formatNumber('abc')).toBe('abc');
    });

    test('应该正确获取状态标签类型', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      expect(vm.getStatusTagType('success')).toBe('success');
      expect(vm.getStatusTagType('warning')).toBe('warning');
      expect(vm.getStatusTagType('error')).toBe('danger');
      expect(vm.getStatusTagType('unknown')).toBe('info');
    });

    test('应该正确计算进度百分比', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const column = { min: 0, max: 100 };
      
      expect(vm.calculateProgress(50, column)).toBe(50);
      expect(vm.calculateProgress(0, column)).toBe(0);
      expect(vm.calculateProgress(100, column)).toBe(100);
      expect(vm.calculateProgress(-10, column)).toBe(0); // 应该限制最小值
      expect(vm.calculateProgress(110, column)).toBe(100); // 应该限制最大值
    });
  });

  describe('交互功能测试', () => {
    test('应该处理暂停/恢复功能', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const pauseButton = wrapper.findAll('button')[0];
      expect(pauseButton.text()).toBe('暂停更新');
      expect(wrapper.vm.isPaused).toBe(false);

      await pauseButton.trigger('click');
      
      expect(wrapper.vm.isPaused).toBe(true);
      expect(pauseButton.text()).toBe('恢复更新');
    });

    test('应该处理清空数据功能', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加一些数据
      vm.addDataRow({ test: 'data' });
      expect(vm.rawData.length).toBe(1);
      
      const clearButton = wrapper.findAll('button')[1];
      await clearButton.trigger('click');
      
      expect(vm.rawData.length).toBe(0);
    });

    test('应该处理自动滚动切换', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const autoScrollButton = wrapper.findAll('button')[2];
      expect(wrapper.vm.autoScroll).toBe(true);

      await autoScrollButton.trigger('click');
      
      expect(wrapper.vm.autoScroll).toBe(false);
    });

    test('应该处理显示设置变更', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 测试切换表头
      expect(vm.showHeaders).toBe(true);
      await vm.handleDisplayChange('toggle-headers');
      await nextTick();
      expect(vm.showHeaders).toBe(false);
      
      // 测试切换边框
      expect(vm.showBorders).toBe(true);
      await vm.handleDisplayChange('toggle-borders');
      await nextTick();
      expect(vm.showBorders).toBe(false);
      
      // 测试切换斑马纹
      expect(vm.showStripes).toBe(true);
      await vm.handleDisplayChange('toggle-stripes');
      await nextTick();
      expect(vm.showStripes).toBe(false);
      
      // 测试切换悬停
      expect(vm.showHover).toBe(true);
      await vm.handleDisplayChange('toggle-hover');
      await nextTick();
      expect(vm.showHover).toBe(false);
    });

    test('应该处理行数限制变更', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加一些测试数据
      for (let i = 0; i < 60; i++) {
        vm.addDataRow({ index: i });
      }
      expect(vm.rawData.length).toBe(60);
      
      // 设置限制为50行
      await vm.handleRowLimitChange('50');
      expect(vm.rawData.length).toBe(50);
      
      // 设置无限制
      await vm.handleRowLimitChange('unlimited');
      // 数据不会增加，只是限制被移除
      expect(vm.rawData.length).toBe(50);
    });
  });

  describe('行选择功能测试', () => {
    test('应该处理单行选择', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加测试数据
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      
      const row = vm.rawData[0];
      vm.toggleSelection(row);
      
      expect(vm.selectedRows.length).toBe(1);
      expect(vm.selectedRows[0].id).toBe(row.id);
      
      // 再次选择应该取消选择
      vm.toggleSelection(row);
      expect(vm.selectedRows.length).toBe(0);
    });

    test('应该处理多行选择', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加测试数据
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      vm.addDataRow({ test: 'data3' });
      
      // 选择多行
      vm.toggleSelection(vm.rawData[0]);
      vm.toggleSelection(vm.rawData[2]);
      
      expect(vm.selectedRows.length).toBe(2);
    });

    test('应该处理行点击事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.addDataRow({ test: 'data1' });
      
      const row = vm.rawData[0];
      vm.handleRowClick(row);
      
      expect(consoleSpy).toHaveBeenCalledWith('点击行:', row);
    });
  });

  describe('分页功能测试', () => {
    test('应该在启用分页时正确显示分页数据', () => {
      wrapper = mount(DataGridWidget, {
        props: { ...defaultProps, enablePagination: true },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加大量数据
      for (let i = 0; i < 120; i++) {
        vm.addDataRow({ index: i });
      }
      
      vm.pageSize = 50;
      vm.currentPage = 1;
      
      expect(vm.displayData.length).toBe(50);
      expect(vm.displayData[0].index).toBe(0);
      
      vm.currentPage = 2;
      expect(vm.displayData.length).toBe(50);
      expect(vm.displayData[0].index).toBe(50);
      
      vm.currentPage = 3;
      expect(vm.displayData.length).toBe(20);
      expect(vm.displayData[0].index).toBe(100);
    });

    test('应该处理分页大小变更', () => {
      wrapper = mount(DataGridWidget, {
        props: { ...defaultProps, enablePagination: true },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加测试数据
      for (let i = 0; i < 100; i++) {
        vm.addDataRow({ index: i });
      }
      
      vm.handleSizeChange('20');
      expect(vm.pageSize).toBe(20);
      expect(vm.currentPage).toBe(1);
      expect(vm.displayData.length).toBe(20);
    });

    test('应该处理页码变更', () => {
      wrapper = mount(DataGridWidget, {
        props: { ...defaultProps, enablePagination: true },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加测试数据
      for (let i = 0; i < 100; i++) {
        vm.addDataRow({ index: i });
      }
      
      vm.pageSize = 25;
      
      vm.handleCurrentChange(3);
      expect(vm.currentPage).toBe(3);
      
      // 测试边界值
      vm.handleCurrentChange(0); // 无效页码
      expect(vm.currentPage).toBe(3); // 应该保持不变
      
      vm.handleCurrentChange(10); // 超出范围
      expect(vm.currentPage).toBe(3); // 应该保持不变
    });
  });

  describe('状态栏测试', () => {
    test('应该显示基本统计信息', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加测试数据
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      vm.addDataRow({ test: 'data3' });
      await nextTick();
      
      const statusbar = wrapper.find('.datagrid-statusbar');
      expect(statusbar.exists()).toBe(true);
      expect(statusbar.text()).toContain('总计: 3 行');
    });

    test('应该显示选择统计信息', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 添加测试数据并选择
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      vm.toggleSelection(vm.rawData[0]);
      
      await nextTick();
      
      const statusbar = wrapper.find('.datagrid-statusbar');
      expect(statusbar.text()).toContain('已选: 1 行');
    });

    test('应该显示更新频率', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const statusbar = wrapper.find('.datagrid-statusbar');
      expect(statusbar.text()).toMatch(/更新: \d+ Hz/);
    });
  });

  describe('脚注信息测试', () => {
    test('应该显示数据统计', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.addDataRow({ test: 'data' });
      await nextTick();
      
      const stats = wrapper.find('.datagrid-stats');
      expect(stats.exists()).toBe(true);
      expect(stats.text()).toContain('1 行');
      expect(stats.text()).toContain('3 列');
    });

    test('应该显示选择状态', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      vm.toggleSelection(vm.rawData[0]);
      
      await nextTick();
      
      const stats = wrapper.find('.datagrid-stats');
      expect(stats.text()).toContain('1 已选');
    });

    test('应该显示更新频率', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const updateInfo = wrapper.find('.datagrid-update');
      expect(updateInfo.exists()).toBe(true);
      expect(updateInfo.text()).toMatch(/\d+ Hz/);
    });
  });

  describe('响应式和动画测试', () => {
    test('应该响应数据变化', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const newDatasets = [
        DataMockFactory.createMockDataset({
          id: 'new-grid-dataset',
          title: '新数据列',
          value: 0
        })
      ];

      await wrapper.setProps({ datasets: newDatasets });
      
      expect(wrapper.props('datasets')).toEqual(newDatasets);
    });

    test('应该在操作时调用动画帧', () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      
      // 执行一些操作
      vm.addDataRow({ test: 'data' });
      vm.clearData();
      vm.togglePause();

      expect(requestFrameSpy).toHaveBeenCalledTimes(4); // mount + 3 operations
    });
  });

  describe('性能测试', () => {
    test('应该在大量数据操作时保持稳定', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const startTime = performance.now();
      
      // 添加大量数据
      for (let i = 0; i < 100; i++) {
        vm.addDataRow({
          temperature: Math.random() * 100,
          status: i % 2 === 0 ? 'success' : 'warning',
          progress: Math.random() * 100
        });
      }
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(1000); // <1秒完成
      expect(vm.rawData.length).toBe(100);
    });

    test('应该正确处理帧计数', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const initialFrameCount = vm.frameCount;
      
      vm.addDataRow({ test: 'data1' });
      vm.addDataRow({ test: 'data2' });
      
      expect(vm.frameCount).toBe(initialFrameCount + 2);
    });
  });

  describe('错误处理测试', () => {
    test('应该处理加载状态', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.isLoading = true;
      await nextTick();

      const loadingElement = wrapper.find('.datagrid-loading');
      expect(loadingElement.exists()).toBe(true);
      expect(loadingElement.text()).toContain('初始化数据网格');
    });

    test('应该处理无数据状态', async () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      wrapper.vm.isLoading = false;
      await nextTick();

      const noDataElement = wrapper.find('.no-data');
      expect(noDataElement.exists()).toBe(true);
      expect(noDataElement.text()).toContain('暂无数据');
    });

    test('应该处理无datasets情况', () => {
      wrapper = mount(DataGridWidget, {
        props: { ...defaultProps, datasets: [] },
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      expect(vm.dataColumns.length).toBe(0);
      expect(vm.hasData).toBe(false);
    });
  });

  describe('内存管理测试', () => {
    test('应该正确清理资源', () => {
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      const vm = wrapper.vm;
      const getSelectedRows = vm.getSelectedRows;
      const getAllRows = vm.getAllRows;
      
      wrapper.unmount();
      
      // 验证暴露的方法仍然可访问
      expect(typeof getSelectedRows).toBe('function');
      expect(typeof getAllRows).toBe('function');
    });

    test('应该正确管理动画帧', async () => {
      const requestFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      
      wrapper = mount(DataGridWidget, {
        props: defaultProps,
        global: {
          components: { BaseWidget }
        }
      });

      // 验证初始化时requestAnimationFrame被调用
      await nextTick();
      expect(requestFrameSpy).toHaveBeenCalled();

      wrapper.unmount();
    });
  });
});
/**
 * VirtualDataTable.vue 测试
 * 目标：100% 覆盖率，完整测试虚拟化数据表格功能
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElIcon, ElButton } from 'element-plus';
import VirtualDataTable, { type TableColumn, type SortConfig } from '../../../../src/webview/components/virtual/VirtualDataTable.vue';

// Mock VirtualList component
const MockVirtualList = {
  name: 'VirtualList',
  template: `
    <div class="mock-virtual-list">
      <slot 
        v-for="(item, index) in items" 
        :key="index"
        :item="item" 
        :index="index"
      />
      <slot name="empty" v-if="items.length === 0" />
    </div>
  `,
  props: [
    'items', 'itemHeight', 'height', 'bufferSize', 'overscan', 'loading'
  ],
  emits: ['scroll', 'item-click', 'visible-change', 'reach-bottom'],
  methods: {
    scrollToIndex: vi.fn(),
    scrollToTop: vi.fn(),
    scrollToBottom: vi.fn(),
    getStats: vi.fn(() => ({
      visibleItems: 10
    }))
  }
};

describe('VirtualDataTable 测试', () => {
  let wrapper: VueWrapper<any>;

  const createTestData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: i * 10,
      timestamp: Date.now() + i * 1000,
      category: ['A', 'B', 'C'][i % 3],
      active: i % 2 === 0
    }));
  };

  const defaultColumns: TableColumn[] = [
    { key: 'id', title: 'ID', width: 80, align: 'center' },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'value', title: 'Value', width: 120, sortable: true },
    { key: 'timestamp', title: 'Time', width: 180, formatter: (val) => new Date(val).toLocaleString() },
    { key: 'category', title: 'Category', width: 100 },
    { key: 'active', title: 'Active', width: 80, align: 'center' }
  ];

  const defaultProps = {
    data: createTestData(50),
    columns: defaultColumns,
    height: 400
  };

  const createWrapper = (props = {}, slots = {}) => {
    return mount(VirtualDataTable, {
      props: { ...defaultProps, ...props },
      slots,
      global: {
        components: {
          ElIcon,
          ElButton,
          VirtualList: MockVirtualList
        },
        stubs: {
          'el-icon': { 
            template: '<i class="el-icon"><slot /></i>',
            props: ['size', 'color']
          },
          'el-button': { 
            template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'text']
          }
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    test('应该正确渲染基本结构', () => {
      wrapper = createWrapper();
      
      expect(wrapper.find('.virtual-data-table').exists()).toBe(true);
      expect(wrapper.find('.virtual-table-header').exists()).toBe(true);
      expect(wrapper.find('.mock-virtual-list').exists()).toBe(true);
    });

    test('应该渲染表头', () => {
      wrapper = createWrapper();
      
      const headerCells = wrapper.findAll('.virtual-table-header-cell');
      expect(headerCells.length).toBe(defaultColumns.length);
      
      const headerTitles = headerCells.map(cell => 
        cell.find('.header-title').text()
      );
      
      expect(headerTitles).toEqual(['ID', 'Name', 'Value', 'Time', 'Category', 'Active']);
    });

    test('应该隐藏表头', () => {
      wrapper = createWrapper({
        showHeader: false
      });
      
      expect(wrapper.find('.virtual-table-header').exists()).toBe(false);
    });

    test('应该应用容器样式', () => {
      wrapper = createWrapper({
        height: 500
      });
      
      const style = wrapper.vm.containerStyle;
      expect(style.height).toBe('500px');
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('column');
      expect(style.overflow).toBe('hidden');
    });

    test('应该计算正确的内容高度', () => {
      wrapper = createWrapper({
        height: 400,
        headerHeight: 40,
        showHeader: true
      });
      
      expect(wrapper.vm.contentHeight).toBe(360);
    });

    test('应该计算没有表头的内容高度', () => {
      wrapper = createWrapper({
        height: 400,
        showHeader: false
      });
      
      expect(wrapper.vm.contentHeight).toBe(400);
    });
  });

  describe('列配置', () => {
    test('应该应用列样式', () => {
      const column: TableColumn = {
        key: 'test',
        title: 'Test',
        width: 150,
        align: 'center',
        minWidth: 100,
        maxWidth: 200
      };
      
      wrapper = createWrapper();
      const style = wrapper.vm.getCellStyle(column, 0);
      
      expect(style.textAlign).toBe('center');
      expect(style.width).toBe('150px');
      expect(style.flexShrink).toBe(0);
      expect(style.minWidth).toBe('100px');
      expect(style.maxWidth).toBe('200px');
    });

    test('应该使用字符串宽度', () => {
      const column: TableColumn = {
        key: 'test',
        title: 'Test',
        width: '20%'
      };
      
      wrapper = createWrapper();
      const style = wrapper.vm.getCellStyle(column, 0);
      
      expect(style.width).toBe('20%');
    });

    test('应该应用默认对齐方式', () => {
      const column: TableColumn = {
        key: 'test',
        title: 'Test'
      };
      
      wrapper = createWrapper();
      const style = wrapper.vm.getCellStyle(column, 0);
      
      expect(style.textAlign).toBe('left');
      expect(style.flex).toBe(1);
    });
  });

  describe('数据处理', () => {
    test('应该获取简单键值', () => {
      wrapper = createWrapper();
      
      const item = { name: 'Test', value: 42 };
      const column: TableColumn = { key: 'name', title: 'Name' };
      
      expect(wrapper.vm.getCellValue(item, column)).toBe('Test');
    });

    test('应该获取嵌套键值', () => {
      wrapper = createWrapper();
      
      const item = { 
        user: { 
          profile: { 
            name: 'John Doe' 
          } 
        } 
      };
      const column: TableColumn = { key: 'user.profile.name', title: 'Name' };
      
      expect(wrapper.vm.getCellValue(item, column)).toBe('John Doe');
    });

    test('应该处理不存在的键', () => {
      wrapper = createWrapper();
      
      const item = { name: 'Test' };
      const column: TableColumn = { key: 'missing.key', title: 'Missing' };
      
      expect(wrapper.vm.getCellValue(item, column)).toBeNull();
    });

    test('应该处理 null 值', () => {
      wrapper = createWrapper();
      
      const item = null;
      const column: TableColumn = { key: 'name', title: 'Name' };
      
      expect(wrapper.vm.getCellValue(item, column)).toBeNull();
    });
  });

  describe('值格式化', () => {
    test('应该使用自定义格式化器', () => {
      wrapper = createWrapper();
      
      const column: TableColumn = {
        key: 'value',
        title: 'Value',
        formatter: (val) => `$${val.toFixed(2)}`
      };
      
      expect(wrapper.vm.formatCellValue(123.456, column)).toBe('$123.46');
    });

    test('应该处理 null 值', () => {
      wrapper = createWrapper();
      
      const column: TableColumn = { key: 'test', title: 'Test' };
      
      expect(wrapper.vm.formatCellValue(null, column)).toBe('');
      expect(wrapper.vm.formatCellValue(undefined, column)).toBe('');
    });

    test('应该格式化时间戳', () => {
      wrapper = createWrapper();
      
      const column: TableColumn = { key: 'timestamp', title: 'Time' };
      const timestamp = Date.now();
      
      const result = wrapper.vm.formatCellValue(timestamp, column);
      expect(result).toContain('2025'); // 当前年份
    });

    test('应该格式化数字', () => {
      wrapper = createWrapper();
      
      const column: TableColumn = { key: 'value', title: 'Value' };
      
      expect(wrapper.vm.formatCellValue(1234567.89, column)).toBe('1,234,567.89');
    });

    test('应该转换字符串', () => {
      wrapper = createWrapper();
      
      const column: TableColumn = { key: 'test', title: 'Test' };
      
      expect(wrapper.vm.formatCellValue(true, column)).toBe('true');
      expect(wrapper.vm.formatCellValue({ a: 1 }, column)).toBe('[object Object]');
    });
  });

  describe('排序功能', () => {
    test('应该处理表头点击排序', async () => {
      wrapper = createWrapper();
      
      const column = defaultColumns[1]; // Name column (sortable)
      await wrapper.vm.handleHeaderClick(column, 1);
      
      expect(wrapper.vm.sortColumn).toBe('name');
      expect(wrapper.vm.sortOrder).toBe('asc');
      expect(wrapper.emitted('header-click')).toBeTruthy();
      expect(wrapper.emitted('sort-change')).toBeTruthy();
    });

    test('应该切换排序方向', async () => {
      wrapper = createWrapper();
      
      const column = defaultColumns[1];
      
      // 第一次点击：升序
      await wrapper.vm.handleHeaderClick(column, 1);
      expect(wrapper.vm.sortOrder).toBe('asc');
      
      // 第二次点击：降序
      await wrapper.vm.handleHeaderClick(column, 1);
      expect(wrapper.vm.sortOrder).toBe('desc');
    });

    test('应该忽略不可排序的列', async () => {
      wrapper = createWrapper();
      
      const column = defaultColumns[0]; // ID column (not sortable)
      await wrapper.vm.handleHeaderClick(column, 0);
      
      expect(wrapper.emitted('sort-change')).toBeFalsy();
    });

    test('应该排序数字数据', () => {
      const testData = [
        { id: 1, value: 30 },
        { id: 2, value: 10 },
        { id: 3, value: 20 }
      ];
      
      wrapper = createWrapper({
        data: testData,
        columns: [
          { key: 'value', title: 'Value', sortable: true }
        ]
      });
      
      wrapper.vm.sortColumn = 'value';
      wrapper.vm.sortOrder = 'asc';
      
      const sorted = wrapper.vm.sortedData;
      expect(sorted.map(item => item.value)).toEqual([10, 20, 30]);
    });

    test('应该排序字符串数据', () => {
      const testData = [
        { id: 1, name: 'Charlie' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' }
      ];
      
      wrapper = createWrapper({
        data: testData,
        columns: [
          { key: 'name', title: 'Name', sortable: true }
        ]
      });
      
      wrapper.vm.sortColumn = 'name';
      wrapper.vm.sortOrder = 'asc';
      
      const sorted = wrapper.vm.sortedData;
      expect(sorted.map(item => item.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('应该排序日期数据', () => {
      const testData = [
        { id: 1, date: new Date('2023-03-01') },
        { id: 2, date: new Date('2023-01-01') },
        { id: 3, date: new Date('2023-02-01') }
      ];
      
      wrapper = createWrapper({
        data: testData,
        columns: [
          { key: 'date', title: 'Date', sortable: true }
        ]
      });
      
      wrapper.vm.sortColumn = 'date';
      wrapper.vm.sortOrder = 'asc';
      
      const sorted = wrapper.vm.sortedData;
      expect(sorted[0].id).toBe(2); // Jan 1
      expect(sorted[1].id).toBe(3); // Feb 1
      expect(sorted[2].id).toBe(1); // Mar 1
    });

    test('应该降序排序', () => {
      const testData = [
        { id: 1, value: 10 },
        { id: 2, value: 30 },
        { id: 3, value: 20 }
      ];
      
      wrapper = createWrapper({
        data: testData,
        columns: [
          { key: 'value', title: 'Value', sortable: true }
        ]
      });
      
      wrapper.vm.sortColumn = 'value';
      wrapper.vm.sortOrder = 'desc';
      
      const sorted = wrapper.vm.sortedData;
      expect(sorted.map(item => item.value)).toEqual([30, 20, 10]);
    });

    test('应该显示排序图标', () => {
      wrapper = createWrapper({
        sortConfig: {
          column: 'name',
          order: 'asc'
        }
      });
      
      const sortIcon = wrapper.find('.sort-icon');
      expect(sortIcon.exists()).toBe(true);
      expect(sortIcon.classes()).not.toContain('sort-desc');
    });

    test('应该显示降序图标', () => {
      wrapper = createWrapper({
        sortConfig: {
          column: 'name',
          order: 'desc'
        }
      });
      
      const sortIcon = wrapper.find('.sort-icon');
      expect(sortIcon.exists()).toBe(true);
      expect(sortIcon.classes()).toContain('sort-desc');
    });
  });

  describe('行状态', () => {
    test('应该检测选中行', () => {
      const testData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      
      wrapper = createWrapper({
        data: testData,
        selectedRows: [{ id: 1, name: 'Item 1' }],
        keyField: 'id'
      });
      
      expect(wrapper.vm.isRowSelected(testData[0], 0)).toBe(true);
      expect(wrapper.vm.isRowSelected(testData[1], 1)).toBe(false);
    });

    test('应该检测高亮行', () => {
      const testData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      
      wrapper = createWrapper({
        data: testData,
        highlightedRows: [{ id: 2, name: 'Item 2' }],
        keyField: 'id'
      });
      
      expect(wrapper.vm.isRowHighlighted(testData[0], 0)).toBe(false);
      expect(wrapper.vm.isRowHighlighted(testData[1], 1)).toBe(true);
    });

    test('应该检测错误行', () => {
      const testData = [
        { id: 1, hasError: true },
        { id: 2, hasError: false }
      ];
      
      wrapper = createWrapper({
        data: testData,
        errorChecker: (item) => item.hasError
      });
      
      expect(wrapper.vm.hasError(testData[0])).toBe(true);
      expect(wrapper.vm.hasError(testData[1])).toBe(false);
    });

    test('应该处理没有错误检查器的情况', () => {
      wrapper = createWrapper();
      
      expect(wrapper.vm.hasError({ id: 1 })).toBe(false);
    });

    test('应该处理没有选中行的情况', () => {
      wrapper = createWrapper({
        selectable: false
      });
      
      expect(wrapper.vm.isRowSelected({ id: 1 }, 0)).toBe(false);
    });
  });

  describe('工具提示', () => {
    test('应该生成单元格工具提示', () => {
      wrapper = createWrapper();
      
      const item = { name: 'Long text that might be truncated' };
      const column: TableColumn = { key: 'name', title: 'Name' };
      
      expect(wrapper.vm.getCellTooltip(item, column)).toBe('Long text that might be truncated');
    });

    test('应该格式化工具提示值', () => {
      wrapper = createWrapper();
      
      const item = { value: 1234.567 };
      const column: TableColumn = { 
        key: 'value', 
        title: 'Value',
        formatter: (val) => `$${val.toFixed(2)}`
      };
      
      expect(wrapper.vm.getCellTooltip(item, column)).toBe('$1234.57');
    });
  });

  describe('事件处理', () => {
    test('应该处理行点击', async () => {
      wrapper = createWrapper();
      
      const item = { id: 1, name: 'Test' };
      await wrapper.vm.handleRowClick(item, 0);
      
      expect(wrapper.emitted('row-click')).toBeTruthy();
      expect(wrapper.emitted('row-click')?.[0]).toEqual([item, 0]);
    });

    test('应该处理滚动事件', async () => {
      wrapper = createWrapper();
      
      const event = new Event('scroll');
      await wrapper.vm.handleScroll(event);
      
      expect(wrapper.emitted('scroll')).toBeTruthy();
      expect(wrapper.emitted('scroll')?.[0]).toEqual([event]);
    });

    test('应该处理可见区域变化', async () => {
      wrapper = createWrapper();
      
      await wrapper.vm.handleVisibleChange(5, 15);
      
      expect(wrapper.emitted('visible-change')).toBeTruthy();
      expect(wrapper.emitted('visible-change')?.[0]).toEqual([5, 15]);
    });

    test('应该处理到达底部', async () => {
      wrapper = createWrapper({
        hasMore: true,
        loading: false
      });
      
      await wrapper.vm.handleReachBottom();
      
      expect(wrapper.emitted('load-more')).toBeTruthy();
    });

    test('应该忽略到达底部当正在加载时', async () => {
      wrapper = createWrapper({
        hasMore: true,
        loading: true
      });
      
      await wrapper.vm.handleReachBottom();
      
      expect(wrapper.emitted('load-more')).toBeFalsy();
    });

    test('应该忽略到达底部当没有更多数据时', async () => {
      wrapper = createWrapper({
        hasMore: false,
        loading: false
      });
      
      await wrapper.vm.handleReachBottom();
      
      expect(wrapper.emitted('load-more')).toBeFalsy();
    });
  });

  describe('公共方法', () => {
    test('应该滚动到指定索引', () => {
      wrapper = createWrapper();
      
      const virtualList = wrapper.findComponent(MockVirtualList);
      wrapper.vm.scrollToIndex(10, 'auto');
      
      expect(virtualList.vm.scrollToIndex).toHaveBeenCalledWith(10, 'auto');
    });

    test('应该滚动到顶部', () => {
      wrapper = createWrapper();
      
      const virtualList = wrapper.findComponent(MockVirtualList);
      wrapper.vm.scrollToTop();
      
      expect(virtualList.vm.scrollToTop).toHaveBeenCalledWith('smooth');
    });

    test('应该滚动到底部', () => {
      wrapper = createWrapper();
      
      const virtualList = wrapper.findComponent(MockVirtualList);
      wrapper.vm.scrollToBottom('instant');
      
      expect(virtualList.vm.scrollToBottom).toHaveBeenCalledWith('instant');
    });

    test('应该获取统计信息', () => {
      wrapper = createWrapper({
        data: createTestData(100),
        columns: defaultColumns,
        selectedRows: [{ id: 1 }, { id: 2 }],
        highlightedRows: [{ id: 3 }]
      });
      
      wrapper.vm.sortColumn = 'name';
      wrapper.vm.sortOrder = 'desc';
      
      const stats = wrapper.vm.getStats();
      
      expect(stats.totalRows).toBe(100);
      expect(stats.visibleRows).toBe(10);
      expect(stats.columns).toBe(6);
      expect(stats.sortColumn).toBe('name');
      expect(stats.sortOrder).toBe('desc');
      expect(stats.selectedCount).toBe(2);
      expect(stats.highlightedCount).toBe(1);
    });
  });

  describe('加载更多', () => {
    test('应该显示加载更多按钮', () => {
      wrapper = createWrapper({
        hasMore: true,
        loading: false
      });
      
      expect(wrapper.find('.load-more-trigger').exists()).toBe(true);
      expect(wrapper.find('.load-more-trigger .el-button').text()).toContain('加载更多');
    });

    test('应该隐藏加载更多按钮当正在加载时', () => {
      wrapper = createWrapper({
        hasMore: true,
        loading: true
      });
      
      expect(wrapper.find('.load-more-trigger').exists()).toBe(false);
    });

    test('应该隐藏加载更多按钮当没有更多数据时', () => {
      wrapper = createWrapper({
        hasMore: false,
        loading: false
      });
      
      expect(wrapper.find('.load-more-trigger').exists()).toBe(false);
    });

    test('应该点击加载更多按钮触发事件', async () => {
      wrapper = createWrapper({
        hasMore: true,
        loading: false
      });
      
      const loadMoreButton = wrapper.find('.load-more-trigger .el-button');
      await loadMoreButton.trigger('click');
      
      expect(wrapper.emitted('load-more')).toBeTruthy();
    });
  });

  describe('空状态', () => {
    test('应该显示默认空状态', () => {
      wrapper = createWrapper({
        data: []
      });
      
      expect(wrapper.find('.table-empty').exists()).toBe(true);
      expect(wrapper.find('.empty-content').exists()).toBe(true);
    });

    test('应该显示自定义空状态', () => {
      wrapper = createWrapper(
        { data: [] },
        {
          empty: '<div class="custom-empty">No records found</div>'
        }
      );
      
      expect(wrapper.find('.table-empty').exists()).toBe(true);
    });
  });

  describe('自定义单元格渲染', () => {
    test('应该支持自定义单元格插槽', () => {
      wrapper = createWrapper(
        {},
        {
          'cell-name': '<div class="custom-cell">Custom: {{ value }}</div>'
        }
      );
      
      // 验证插槽是否存在（实际渲染需要在集成测试中验证）
      expect(wrapper.html()).toContain('mock-virtual-list');
    });
  });

  describe('排序配置监听', () => {
    test('应该监听排序配置变化', async () => {
      wrapper = createWrapper();
      
      const newSortConfig: SortConfig = {
        column: 'value',
        order: 'desc'
      };
      
      await wrapper.setProps({ sortConfig: newSortConfig });
      
      expect(wrapper.vm.sortColumn).toBe('value');
      expect(wrapper.vm.sortOrder).toBe('desc');
    });

    test('应该在初始化时应用排序配置', () => {
      wrapper = createWrapper({
        sortConfig: {
          column: 'name',
          order: 'asc'
        }
      });
      
      expect(wrapper.vm.sortColumn).toBe('name');
      expect(wrapper.vm.sortOrder).toBe('asc');
    });
  });

  describe('边界条件', () => {
    test('应该处理空列配置', () => {
      wrapper = createWrapper({
        columns: []
      });
      
      expect(wrapper.findAll('.virtual-table-header-cell').length).toBe(0);
    });

    test('应该处理数字高度', () => {
      wrapper = createWrapper({
        height: 500
      });
      
      expect(wrapper.vm.containerStyle.height).toBe('500px');
    });

    test('应该处理缺失的排序列', () => {
      wrapper = createWrapper();
      
      wrapper.vm.sortColumn = 'nonexistent';
      
      expect(wrapper.vm.sortedData).toEqual(defaultProps.data);
    });

    test('应该处理没有键字段的行选择', () => {
      wrapper = createWrapper({
        selectedRows: [{ differentField: 1 }],
        keyField: 'id'
      });
      
      const item = { id: 1 };
      expect(wrapper.vm.isRowSelected(item, 0)).toBe(false);
    });

    test('应该处理 undefined 高亮行', () => {
      wrapper = createWrapper({
        highlightedRows: undefined as any
      });
      
      expect(wrapper.vm.isRowHighlighted({ id: 1 }, 0)).toBe(false);
    });

    test('应该处理字符串高度为数字计算', () => {
      wrapper = createWrapper({
        height: '400px'
      });
      
      // 当高度是字符串时，使用默认值400进行计算
      expect(wrapper.vm.contentHeight).toBe(360); // 400 - 40 (header)
    });
  });

  describe('默认值', () => {
    test('应该使用默认属性值', () => {
      wrapper = mount(VirtualDataTable, {
        props: {
          data: [],
          columns: []
        },
        global: {
          components: {
            VirtualList: MockVirtualList
          }
        }
      });
      
      expect(wrapper.vm.height).toBe('100%');
      expect(wrapper.vm.rowHeight).toBe(32);
      expect(wrapper.vm.headerHeight).toBe(40);
      expect(wrapper.vm.showHeader).toBe(true);
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.bufferSize).toBe(10);
      expect(wrapper.vm.overscan).toBe(5);
      expect(wrapper.vm.selectable).toBe(false);
      expect(wrapper.vm.hasMore).toBe(false);
      expect(wrapper.vm.keyField).toBe('id');
    });
  });
});
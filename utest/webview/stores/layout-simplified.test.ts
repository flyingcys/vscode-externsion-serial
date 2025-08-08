/**
 * Layout Store 简化单元测试
 * 专注于布局管理逻辑测试
 * 目标：100% 测试覆盖率
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// 布局类型定义
interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isVisible: boolean;
  config?: any;
}

interface LayoutGrid {
  columns: number;
  rows: number;
  gap: number;
  cellWidth: number;
  cellHeight: number;
}

interface Layout {
  id: string;
  name: string;
  type: 'grid' | 'free' | 'auto';
  widgets: Widget[];
  grid?: LayoutGrid;
  settings: {
    autoResize: boolean;
    snapToGrid: boolean;
    showGrid: boolean;
    lockWidgets: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

// 模拟布局存储的核心逻辑
const createLayoutStore = () => {
  let layouts: Layout[] = [];
  let currentLayoutId = '';
  let viewport = { width: 1200, height: 800 };
  let isDragging = false;
  let selectedWidgets: string[] = [];

  // 默认布局设置
  const defaultLayout: Omit<Layout, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '默认布局',
    type: 'grid',
    widgets: [],
    grid: {
      columns: 12,
      rows: 8,
      gap: 10,
      cellWidth: 100,
      cellHeight: 80
    },
    settings: {
      autoResize: true,
      snapToGrid: true,
      showGrid: false,
      lockWidgets: false
    }
  };

  return {
    // 状态属性
    get layouts() { return layouts; },
    get currentLayoutId() { return currentLayoutId; },
    get viewport() { return viewport; },
    get isDragging() { return isDragging; },
    get selectedWidgets() { return selectedWidgets; },

    // 计算属性
    get currentLayout() {
      return layouts.find(l => l.id === currentLayoutId) || null;
    },

    get currentWidgets() {
      return this.currentLayout?.widgets || [];
    },

    get visibleWidgets() {
      return this.currentWidgets.filter(w => w.isVisible);
    },

    get selectedWidgetObjects() {
      return this.currentWidgets.filter(w => selectedWidgets.includes(w.id));
    },

    // 布局管理
    createLayout(name: string, type: 'grid' | 'free' | 'auto' = 'grid') {
      const now = Date.now();
      const layout: Layout = {
        id: `layout-${now}`,
        name,
        type,
        widgets: [],
        grid: type === 'grid' ? { ...defaultLayout.grid! } : undefined,
        settings: { ...defaultLayout.settings },
        createdAt: now,
        updatedAt: now
      };

      layouts.push(layout);
      return layout;
    },

    removeLayout(id: string) {
      const index = layouts.findIndex(l => l.id === id);
      if (index === -1) return false;

      layouts.splice(index, 1);

      // 如果删除的是当前布局，清除当前布局ID
      if (currentLayoutId === id) {
        currentLayoutId = '';
      }

      return true;
    },

    duplicateLayout(id: string, newName: string) {
      const original = layouts.find(l => l.id === id);
      if (!original) return null;

      const now = Date.now();
      const duplicate: Layout = {
        ...original,
        id: `layout-${now}`,
        name: newName,
        widgets: original.widgets.map(w => ({ ...w })), // 深拷贝 widgets
        createdAt: now,
        updatedAt: now
      };

      layouts.push(duplicate);
      return duplicate;
    },

    renameLayout(id: string, name: string) {
      const layout = layouts.find(l => l.id === id);
      if (!layout) return false;

      layout.name = name;
      layout.updatedAt = Date.now();
      return true;
    },

    // 当前布局切换
    setCurrentLayout(id: string) {
      const layout = layouts.find(l => l.id === id);
      if (!layout) return false;

      currentLayoutId = id;
      selectedWidgets = []; // 清除选择
      return true;
    },

    // Widget 管理
    addWidget(widget: Omit<Widget, 'id' | 'zIndex'>) {
      if (!this.currentLayout) return null;

      const newWidget: Widget = {
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zIndex: this.getNextZIndex(),
        ...widget
      };

      this.currentLayout.widgets.push(newWidget);
      this.currentLayout.updatedAt = Date.now();

      return newWidget;
    },

    removeWidget(widgetId: string) {
      const layout = this.currentLayout;
      if (!layout) return false;

      const index = layout.widgets.findIndex(w => w.id === widgetId);
      if (index === -1) return false;

      layout.widgets.splice(index, 1);
      layout.updatedAt = Date.now();

      // 从选择中移除
      selectedWidgets = selectedWidgets.filter(id => id !== widgetId);

      return true;
    },

    updateWidget(widgetId: string, updates: Partial<Widget>) {
      const layout = this.currentLayout;
      if (!layout) return null;

      const widget = layout.widgets.find(w => w.id === widgetId);
      if (!widget) return null;

      Object.assign(widget, updates);
      layout.updatedAt = Date.now();

      return widget;
    },

    updateWidgetPosition(widgetId: string, position: { x: number; y: number }) {
      const widget = this.updateWidget(widgetId, { position });
      if (widget && this.currentLayout?.settings.snapToGrid) {
        this.snapWidgetToGrid(widget);
      }
      return widget;
    },

    updateWidgetSize(widgetId: string, size: { width: number; height: number }) {
      const widget = this.updateWidget(widgetId, { size });
      if (widget && this.currentLayout?.settings.snapToGrid) {
        this.snapWidgetToGrid(widget);
      }
      return widget;
    },

    // Widget 层级管理
    getNextZIndex() {
      const maxZ = Math.max(0, ...this.currentWidgets.map(w => w.zIndex));
      return maxZ + 1;
    },

    bringToFront(widgetId: string) {
      const widget = this.currentWidgets.find(w => w.id === widgetId);
      if (!widget) return false;

      widget.zIndex = this.getNextZIndex();
      this.currentLayout!.updatedAt = Date.now();
      return true;
    },

    sendToBack(widgetId: string) {
      const widget = this.currentWidgets.find(w => w.id === widgetId);
      if (!widget) return false;

      const minZ = Math.min(1, ...this.currentWidgets.map(w => w.zIndex));
      widget.zIndex = minZ - 1;
      this.currentLayout!.updatedAt = Date.now();
      return true;
    },

    // 网格对齐
    snapWidgetToGrid(widget: Widget) {
      const layout = this.currentLayout;
      if (!layout || !layout.grid) return;

      const { cellWidth, cellHeight, gap } = layout.grid;
      const cellTotalWidth = cellWidth + gap;
      const cellTotalHeight = cellHeight + gap;

      // 对齐位置到网格
      widget.position.x = Math.round(widget.position.x / cellTotalWidth) * cellTotalWidth;
      widget.position.y = Math.round(widget.position.y / cellTotalHeight) * cellTotalHeight;

      // 对齐尺寸到网格
      widget.size.width = Math.max(cellWidth, Math.round(widget.size.width / cellTotalWidth) * cellTotalWidth - gap);
      widget.size.height = Math.max(cellHeight, Math.round(widget.size.height / cellTotalHeight) * cellTotalHeight - gap);
    },

    snapAllWidgetsToGrid() {
      if (!this.currentLayout?.settings.snapToGrid) return;

      this.currentWidgets.forEach(widget => {
        this.snapWidgetToGrid(widget);
      });

      this.currentLayout!.updatedAt = Date.now();
    },

    // 网格设置
    updateGridSettings(grid: Partial<LayoutGrid>) {
      const layout = this.currentLayout;
      if (!layout || layout.type !== 'grid') return false;

      Object.assign(layout.grid!, grid);
      layout.updatedAt = Date.now();

      if (layout.settings.snapToGrid) {
        this.snapAllWidgetsToGrid();
      }

      return true;
    },

    // 布局设置
    updateLayoutSettings(settings: Partial<Layout['settings']>) {
      const layout = this.currentLayout;
      if (!layout) return false;

      Object.assign(layout.settings, settings);
      layout.updatedAt = Date.now();

      // 如果启用了网格对齐，立即应用
      if (settings.snapToGrid && layout.settings.snapToGrid) {
        this.snapAllWidgetsToGrid();
      }

      return true;
    },

    // 视口管理
    setViewport(width: number, height: number) {
      viewport = { width, height };

      // 如果启用自动调整大小，重新计算网格
      if (this.currentLayout?.settings.autoResize) {
        this.recalculateGrid();
      }
    },

    recalculateGrid() {
      const layout = this.currentLayout;
      if (!layout || layout.type !== 'grid' || !layout.grid) return;

      const { columns, gap } = layout.grid;
      const availableWidth = viewport.width - (columns + 1) * gap;
      const cellWidth = Math.floor(availableWidth / columns);

      layout.grid.cellWidth = Math.max(50, cellWidth);
      layout.updatedAt = Date.now();
    },

    // Widget 选择
    selectWidget(widgetId: string) {
      if (!selectedWidgets.includes(widgetId)) {
        selectedWidgets.push(widgetId);
      }
    },

    deselectWidget(widgetId: string) {
      selectedWidgets = selectedWidgets.filter(id => id !== widgetId);
    },

    selectMultiple(widgetIds: string[]) {
      selectedWidgets = [...new Set([...selectedWidgets, ...widgetIds])];
    },

    clearSelection() {
      selectedWidgets = [];
    },

    selectAll() {
      selectedWidgets = this.currentWidgets.map(w => w.id);
    },

    // 拖拽状态
    setDragging(dragging: boolean) {
      isDragging = dragging;
    },

    // 自动布局
    autoArrangeWidgets(type: 'grid' | 'cascade' | 'tile' = 'grid') {
      const layout = this.currentLayout;
      if (!layout) return;

      const widgets = this.visibleWidgets;
      if (widgets.length === 0) return;

      switch (type) {
        case 'grid':
          this.arrangeInGrid(widgets);
          break;
        case 'cascade':
          this.arrangeInCascade(widgets);
          break;
        case 'tile':
          this.arrangeInTiles(widgets);
          break;
      }

      layout.updatedAt = Date.now();
    },

    arrangeInGrid(widgets: Widget[]) {
      const layout = this.currentLayout;
      if (!layout?.grid) return;

      const { columns, cellWidth, cellHeight, gap } = layout.grid;
      const cellTotalWidth = cellWidth + gap;
      const cellTotalHeight = cellHeight + gap;

      widgets.forEach((widget, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        widget.position = {
          x: col * cellTotalWidth + gap,
          y: row * cellTotalHeight + gap
        };

        widget.size = {
          width: cellWidth,
          height: cellHeight
        };
      });
    },

    arrangeInCascade(widgets: Widget[]) {
      const offset = 30;
      let x = 20;
      let y = 20;

      widgets.forEach(widget => {
        widget.position = { x, y };
        x += offset;
        y += offset;

        // 防止超出视口
        if (x + widget.size.width > viewport.width) {
          x = 20;
        }
        if (y + widget.size.height > viewport.height) {
          y = 20;
        }
      });
    },

    arrangeInTiles(widgets: Widget[]) {
      if (widgets.length === 0) return;

      const cols = Math.ceil(Math.sqrt(widgets.length));
      const rows = Math.ceil(widgets.length / cols);
      
      const tileWidth = Math.floor(viewport.width / cols) - 20;
      const tileHeight = Math.floor(viewport.height / rows) - 20;

      widgets.forEach((widget, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        widget.position = {
          x: col * (tileWidth + 20) + 10,
          y: row * (tileHeight + 20) + 10
        };

        widget.size = {
          width: tileWidth,
          height: tileHeight
        };
      });
    },

    // 碰撞检测
    checkCollision(widget: Widget, excludeIds: string[] = []) {
      return this.visibleWidgets.some(other => {
        if (other.id === widget.id || excludeIds.includes(other.id)) {
          return false;
        }

        return !(
          widget.position.x + widget.size.width <= other.position.x ||
          other.position.x + other.size.width <= widget.position.x ||
          widget.position.y + widget.size.height <= other.position.y ||
          other.position.y + other.size.height <= widget.position.y
        );
      });
    },

    // 布局验证和修复
    validateLayout() {
      const layout = this.currentLayout;
      if (!layout) return { isValid: true, issues: [] };

      const issues: string[] = [];
      
      // 检查 Widget 是否超出视口
      layout.widgets.forEach(widget => {
        if (widget.position.x + widget.size.width > viewport.width) {
          issues.push(`Widget ${widget.id} 超出视口宽度`);
        }
        if (widget.position.y + widget.size.height > viewport.height) {
          issues.push(`Widget ${widget.id} 超出视口高度`);
        }
        if (widget.position.x < 0 || widget.position.y < 0) {
          issues.push(`Widget ${widget.id} 位置为负数`);
        }
        if (widget.size.width <= 0 || widget.size.height <= 0) {
          issues.push(`Widget ${widget.id} 尺寸无效`);
        }
      });

      return {
        isValid: issues.length === 0,
        issues
      };
    },

    fixLayout() {
      const layout = this.currentLayout;
      if (!layout) return;

      layout.widgets.forEach(widget => {
        // 修正位置
        widget.position.x = Math.max(0, Math.min(widget.position.x, viewport.width - widget.size.width));
        widget.position.y = Math.max(0, Math.min(widget.position.y, viewport.height - widget.size.height));

        // 修正尺寸
        widget.size.width = Math.max(50, Math.min(widget.size.width, viewport.width - widget.position.x));
        widget.size.height = Math.max(50, Math.min(widget.size.height, viewport.height - widget.position.y));
      });

      layout.updatedAt = Date.now();
    },

    // 布局导入导出
    exportLayout(id: string) {
      const layout = layouts.find(l => l.id === id);
      return layout ? JSON.stringify(layout, null, 2) : null;
    },

    importLayout(layoutJson: string) {
      try {
        const layout = JSON.parse(layoutJson) as Layout;
        
        // 验证布局格式
        if (!this.validateLayoutFormat(layout)) {
          throw new Error('无效的布局格式');
        }

        // 生成新的 ID
        layout.id = `layout-${Date.now()}`;
        layout.createdAt = Date.now();
        layout.updatedAt = Date.now();

        layouts.push(layout);
        return layout;
      } catch (error) {
        throw new Error('布局导入失败: ' + (error as Error).message);
      }
    },

    validateLayoutFormat(layout: any): layout is Layout {
      return (
        typeof layout === 'object' &&
        typeof layout.name === 'string' &&
        ['grid', 'free', 'auto'].includes(layout.type) &&
        Array.isArray(layout.widgets) &&
        typeof layout.settings === 'object'
      );
    },

    // 重置和初始化
    reset() {
      layouts = [];
      currentLayoutId = '';
      selectedWidgets = [];
      isDragging = false;
    },

    initialize() {
      this.reset();
      
      // 创建默认布局
      const defaultLayoutInstance = this.createLayout('默认布局');
      this.setCurrentLayout(defaultLayoutInstance.id);
    }
  };
};

describe('Layout Store 逻辑测试', () => {
  let store: ReturnType<typeof createLayoutStore>;

  beforeEach(() => {
    store = createLayoutStore();
    store.initialize();
  });

  describe('初始状态', () => {
    test('应该有正确的初始状态', () => {
      expect(store.layouts).toHaveLength(1);
      expect(store.currentLayout).toBeTruthy();
      expect(store.currentWidgets).toHaveLength(0);
      expect(store.selectedWidgets).toHaveLength(0);
      expect(store.isDragging).toBe(false);
    });

    test('应该有正确的视口设置', () => {
      expect(store.viewport).toEqual({ width: 1200, height: 800 });
    });
  });

  describe('布局管理', () => {
    test('createLayout 应该创建新布局', () => {
      const layout = store.createLayout('测试布局', 'free');
      
      expect(layout.name).toBe('测试布局');
      expect(layout.type).toBe('free');
      expect(layout.widgets).toHaveLength(0);
      expect(store.layouts).toHaveLength(2);
    });

    test('removeLayout 应该删除布局', () => {
      const layout = store.createLayout('删除测试');
      const result = store.removeLayout(layout.id);
      
      expect(result).toBe(true);
      expect(store.layouts).toHaveLength(1);
    });

    test('removeLayout 删除当前布局应该清除当前布局ID', () => {
      const currentId = store.currentLayoutId;
      store.removeLayout(currentId);
      
      expect(store.currentLayoutId).toBe('');
      expect(store.currentLayout).toBeNull();
    });

    test('duplicateLayout 应该复制布局', async () => {
      const original = store.currentLayout!;
      store.addWidget({
        type: 'plot',
        title: '测试组件',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        isVisible: true
      });
      
      // 添加小延迟确保 ID 不同
      await new Promise(resolve => setTimeout(resolve, 1));
      const duplicate = store.duplicateLayout(original.id, '复制布局');
      
      expect(duplicate?.name).toBe('复制布局');
      expect(duplicate?.widgets).toHaveLength(1);
      expect(duplicate?.id).not.toBe(original.id);
    });

    test('renameLayout 应该重命名布局', () => {
      const layout = store.currentLayout!;
      const result = store.renameLayout(layout.id, '新名称');
      
      expect(result).toBe(true);
      expect(layout.name).toBe('新名称');
    });

    test('setCurrentLayout 应该切换当前布局', () => {
      const newLayout = store.createLayout('新布局');
      const result = store.setCurrentLayout(newLayout.id);
      
      expect(result).toBe(true);
      expect(store.currentLayoutId).toBe(newLayout.id);
      expect(store.selectedWidgets).toHaveLength(0);
    });
  });

  describe('Widget 管理', () => {
    test('addWidget 应该添加组件', () => {
      const widget = store.addWidget({
        type: 'gauge',
        title: '仪表盘',
        position: { x: 50, y: 50 },
        size: { width: 150, height: 150 },
        isVisible: true
      });
      
      expect(widget).toBeTruthy();
      expect(widget?.type).toBe('gauge');
      expect(widget?.zIndex).toBeGreaterThan(0);
      expect(store.currentWidgets).toHaveLength(1);
    });

    test('removeWidget 应该删除组件', () => {
      const widget = store.addWidget({
        type: 'plot',
        title: '绘图',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const result = store.removeWidget(widget!.id);
      
      expect(result).toBe(true);
      expect(store.currentWidgets).toHaveLength(0);
    });

    test('updateWidget 应该更新组件', () => {
      const widget = store.addWidget({
        type: 'plot',
        title: '绘图',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const updated = store.updateWidget(widget!.id, { title: '更新标题' });
      
      expect(updated?.title).toBe('更新标题');
    });

    test('updateWidgetPosition 应该更新组件位置', () => {
      const widget = store.addWidget({
        type: 'plot',
        title: '绘图',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      // 禁用网格对齐以防止位置被修改
      store.updateLayoutSettings({ snapToGrid: false });
      const updated = store.updateWidgetPosition(widget!.id, { x: 200, y: 300 });
      
      expect(updated?.position).toEqual({ x: 200, y: 300 });
    });

    test('updateWidgetSize 应该更新组件尺寸', () => {
      const widget = store.addWidget({
        type: 'plot',
        title: '绘图',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      // 禁用网格对齐以防止尺寸被修改
      store.updateLayoutSettings({ snapToGrid: false });
      const updated = store.updateWidgetSize(widget!.id, { width: 300, height: 250 });
      
      expect(updated?.size).toEqual({ width: 300, height: 250 });
    });
  });

  describe('层级管理', () => {
    test('getNextZIndex 应该返回下一个 z-index', () => {
      store.addWidget({
        type: 'plot',
        title: '绘图1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const nextZ = store.getNextZIndex();
      
      expect(nextZ).toBeGreaterThan(1);
    });

    test('bringToFront 应该将组件置于前端', () => {
      const widget1 = store.addWidget({
        type: 'plot',
        title: '绘图1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const widget2 = store.addWidget({
        type: 'gauge',
        title: '仪表2',
        position: { x: 50, y: 50 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const originalZ = widget1!.zIndex;
      store.bringToFront(widget1!.id);
      
      expect(widget1!.zIndex).toBeGreaterThan(originalZ);
      expect(widget1!.zIndex).toBeGreaterThan(widget2!.zIndex);
    });

    test('sendToBack 应该将组件置于后端', () => {
      const widget1 = store.addWidget({
        type: 'plot',
        title: '绘图1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const widget2 = store.addWidget({
        type: 'gauge',
        title: '仪表2',
        position: { x: 50, y: 50 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      store.sendToBack(widget2!.id);
      
      expect(widget2!.zIndex).toBeLessThan(widget1!.zIndex);
    });
  });

  describe('网格对齐', () => {
    test('snapWidgetToGrid 应该对齐组件到网格', () => {
      const widget = store.addWidget({
        type: 'plot',
        title: '绘图',
        position: { x: 157, y: 143 },
        size: { width: 123, height: 97 },
        isVisible: true
      });
      
      store.snapWidgetToGrid(widget!);
      
      // 检查位置是否对齐到网格
      expect(widget!.position.x % 110).toBe(0); // cellWidth + gap = 110
      expect(widget!.position.y % 90).toBe(0);  // cellHeight + gap = 90
    });

    test('updateGridSettings 应该更新网格设置', () => {
      const result = store.updateGridSettings({ columns: 16, cellWidth: 80 });
      
      expect(result).toBe(true);
      expect(store.currentLayout?.grid?.columns).toBe(16);
      expect(store.currentLayout?.grid?.cellWidth).toBe(80);
    });
  });

  describe('视口管理', () => {
    test('setViewport 应该更新视口尺寸', () => {
      store.setViewport(1600, 900);
      
      expect(store.viewport).toEqual({ width: 1600, height: 900 });
    });

    test('recalculateGrid 应该重新计算网格', () => {
      const originalCellWidth = store.currentLayout?.grid?.cellWidth;
      
      store.setViewport(800, 600);
      store.updateLayoutSettings({ autoResize: true });
      store.recalculateGrid();
      
      expect(store.currentLayout?.grid?.cellWidth).not.toBe(originalCellWidth);
    });
  });

  describe('组件选择', () => {
    beforeEach(() => {
      store.addWidget({
        type: 'plot',
        title: '绘图1',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      store.addWidget({
        type: 'gauge',
        title: '仪表2',
        position: { x: 200, y: 0 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
    });

    test('selectWidget 应该选择组件', () => {
      const widgetId = store.currentWidgets[0].id;
      
      store.selectWidget(widgetId);
      
      expect(store.selectedWidgets).toContain(widgetId);
    });

    test('deselectWidget 应该取消选择组件', () => {
      const widgetId = store.currentWidgets[0].id;
      
      store.selectWidget(widgetId);
      store.deselectWidget(widgetId);
      
      expect(store.selectedWidgets).not.toContain(widgetId);
    });

    test('selectAll 应该选择所有组件', () => {
      store.selectAll();
      
      expect(store.selectedWidgets).toHaveLength(2);
    });

    test('clearSelection 应该清除所有选择', () => {
      store.selectAll();
      store.clearSelection();
      
      expect(store.selectedWidgets).toHaveLength(0);
    });

    test('selectMultiple 应该选择多个组件', () => {
      const widgetIds = store.currentWidgets.map(w => w.id);
      
      store.selectMultiple(widgetIds);
      
      expect(store.selectedWidgets).toHaveLength(2);
    });
  });

  describe('自动布局', () => {
    beforeEach(() => {
      // 添加多个组件用于测试自动布局
      for (let i = 0; i < 4; i++) {
        store.addWidget({
          type: 'plot',
          title: `组件${i + 1}`,
          position: { x: i * 50, y: i * 50 },
          size: { width: 100, height: 100 },
          isVisible: true
        });
      }
    });

    test('autoArrangeWidgets 网格模式应该正确排列', () => {
      store.autoArrangeWidgets('grid');
      
      const widgets = store.visibleWidgets;
      expect(widgets[0].position.x).toBe(10); // gap
      expect(widgets[1].position.x).toBe(120); // gap + cellWidth + gap
    });

    test('autoArrangeWidgets 层叠模式应该正确排列', () => {
      store.autoArrangeWidgets('cascade');
      
      const widgets = store.visibleWidgets;
      expect(widgets[1].position.x).toBe(widgets[0].position.x + 30);
      expect(widgets[1].position.y).toBe(widgets[0].position.y + 30);
    });

    test('autoArrangeWidgets 平铺模式应该正确排列', () => {
      store.autoArrangeWidgets('tile');
      
      const widgets = store.visibleWidgets;
      expect(widgets[0].position.x).toBe(10);
      expect(widgets[0].position.y).toBe(10);
      
      // 第二个组件应该在右边
      expect(widgets[1].position.x).toBeGreaterThan(widgets[0].position.x);
    });
  });

  describe('碰撞检测', () => {
    test('checkCollision 应该检测组件碰撞', () => {
      store.addWidget({
        type: 'plot',
        title: '绘图1',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 100 },
        isVisible: true
      });
      
      const collidingWidget = {
        id: 'test',
        type: 'gauge',
        title: '仪表',
        position: { x: 150, y: 150 },
        size: { width: 100, height: 100 },
        zIndex: 1,
        isVisible: true
      };
      
      const result = store.checkCollision(collidingWidget);
      expect(result).toBe(true);
      
      const nonCollidingWidget = {
        id: 'test2',
        type: 'gauge',
        title: '仪表2',
        position: { x: 300, y: 300 },
        size: { width: 100, height: 100 },
        zIndex: 1,
        isVisible: true
      };
      
      const result2 = store.checkCollision(nonCollidingWidget);
      expect(result2).toBe(false);
    });
  });

  describe('布局验证', () => {
    test('validateLayout 应该验证布局有效性', () => {
      // 添加正常组件
      store.addWidget({
        type: 'plot',
        title: '正常组件',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        isVisible: true
      });
      
      const result = store.validateLayout();
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('validateLayout 应该检测问题', () => {
      // 添加超出视口的组件
      const widget = store.addWidget({
        type: 'plot',
        title: '超出组件',
        position: { x: 1300, y: 100 }, // 超出视口宽度
        size: { width: 200, height: 150 },
        isVisible: true
      });
      
      const result = store.validateLayout();
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toContain(`Widget ${widget!.id}`);
      expect(result.issues[0]).toContain('超出视口宽度');
    });

    test('fixLayout 应该修复布局问题', () => {
      const widget = store.addWidget({
        type: 'plot',
        title: '问题组件',
        position: { x: 1300, y: -50 },
        size: { width: 200, height: 150 },
        isVisible: true
      });
      
      store.fixLayout();
      
      expect(widget!.position.x).toBeLessThan(store.viewport.width);
      expect(widget!.position.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('布局导入导出', () => {
    test('exportLayout 应该导出布局为 JSON', () => {
      const layout = store.currentLayout!;
      const exported = store.exportLayout(layout.id);
      
      expect(exported).toBeTruthy();
      
      const parsed = JSON.parse(exported!);
      expect(parsed.id).toBe(layout.id);
      expect(parsed.name).toBe(layout.name);
    });

    test('importLayout 应该导入有效布局', () => {
      const layoutData = {
        id: 'test-import',
        name: '导入布局',
        type: 'free',
        widgets: [],
        settings: {
          autoResize: false,
          snapToGrid: false,
          showGrid: true,
          lockWidgets: false
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const result = store.importLayout(JSON.stringify(layoutData));
      
      expect(result.name).toBe('导入布局');
      expect(result.id).not.toBe('test-import'); // 应该生成新ID
      expect(store.layouts).toHaveLength(2);
    });

    test('importLayout 应该拒绝无效布局', () => {
      const invalidLayout = { name: 'test' }; // 缺少必需字段
      
      expect(() => store.importLayout(JSON.stringify(invalidLayout)))
        .toThrow('无效的布局格式');
    });
  });

  describe('边界条件', () => {
    test('应该处理空布局操作', () => {
      store.reset(); // 清除所有布局
      
      expect(store.currentLayout).toBeNull();
      expect(store.addWidget({ type: 'plot', title: 'test', position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, isVisible: true })).toBeNull();
    });

    test('应该处理不存在的组件操作', () => {
      expect(store.removeWidget('not-exist')).toBe(false);
      expect(store.updateWidget('not-exist', { title: 'test' })).toBeNull();
      expect(store.bringToFront('not-exist')).toBe(false);
    });

    test('应该处理不存在的布局操作', () => {
      expect(store.removeLayout('not-exist')).toBe(false);
      expect(store.setCurrentLayout('not-exist')).toBe(false);
      expect(store.duplicateLayout('not-exist', 'test')).toBeNull();
      expect(store.renameLayout('not-exist', 'test')).toBe(false);
    });
  });
});
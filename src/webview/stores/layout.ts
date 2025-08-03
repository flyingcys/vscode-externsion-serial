/**
 * Layout Store for Serial Studio VSCode Extension
 * 布局管理存储
 */

import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';

/**
 * Widget位置信息
 */
export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

/**
 * 布局项接口
 */
export interface LayoutItem {
  id: string;
  widgetId: string;
  position: WidgetPosition;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  id: string;
  name: string;
  description?: string;
  items: LayoutItem[];
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  backgroundColor?: string;
  created: number;
  modified: number;
}

/**
 * 预定义布局模板
 */
const LAYOUT_TEMPLATES: Omit<LayoutConfig, 'id' | 'created' | 'modified'>[] = [
  {
    name: '单面板布局',
    description: '适合单一数据源的简单布局',
    items: [
      {
        id: 'item-1',
        widgetId: 'widget-1',
        position: { x: 0, y: 0, width: 800, height: 600 },
        isVisible: true,
        isResizable: true,
        isDraggable: true
      }
    ],
    gridSize: 20,
    snapToGrid: true,
    showGrid: false
  },
  {
    name: '双面板布局',
    description: '上下或左右分布的双面板布局',
    items: [
      {
        id: 'item-1', 
        widgetId: 'widget-1',
        position: { x: 0, y: 0, width: 400, height: 600 },
        isVisible: true,
        isResizable: true,
        isDraggable: true
      },
      {
        id: 'item-2',
        widgetId: 'widget-2', 
        position: { x: 420, y: 0, width: 400, height: 600 },
        isVisible: true,
        isResizable: true,
        isDraggable: true
      }
    ],
    gridSize: 20,
    snapToGrid: true,
    showGrid: false
  },
  {
    name: '仪表盘布局',
    description: '多个小Widget组成的仪表盘布局',
    items: [
      {
        id: 'item-1',
        widgetId: 'gauge-1',
        position: { x: 0, y: 0, width: 200, height: 200 },
        isVisible: true,
        isResizable: true, 
        isDraggable: true
      },
      {
        id: 'item-2',
        widgetId: 'gauge-2',
        position: { x: 220, y: 0, width: 200, height: 200 },
        isVisible: true,
        isResizable: true,
        isDraggable: true
      },
      {
        id: 'item-3',
        widgetId: 'plot-1',
        position: { x: 0, y: 220, width: 420, height: 300 },
        isVisible: true,
        isResizable: true,
        isDraggable: true
      }
    ],
    gridSize: 20,
    snapToGrid: true,
    showGrid: true
  }
];

export const useLayoutStore = defineStore('layout', () => {
  // === 状态 ===
  const currentLayoutId = ref<string>('');
  const layouts = ref<LayoutConfig[]>([]);
  const isEditMode = ref(false);
  const selectedItems = ref<string[]>([]);
  const clipboard = ref<LayoutItem[]>([]);
  
  // 拖拽状态
  const dragState = reactive({
    isDragging: false,
    draggedItemId: '',
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  });

  // 缩放和网格设置
  const viewSettings = reactive({
    zoom: 1,
    gridSize: 20,
    snapToGrid: true,
    showGrid: false,
    showRulers: false
  });

  // === 计算属性 ===
  const currentLayout = computed(() => {
    return layouts.value.find(layout => layout.id === currentLayoutId.value) || null;
  });

  const visibleItems = computed(() => {
    if (!currentLayout.value) {return [];}
    return currentLayout.value.items.filter(item => item.isVisible);
  });

  const selectedLayout = computed(() => currentLayout.value);

  const canUndo = computed(() => {
    // 实现撤销功能需要历史记录
    return false;
  });

  const canRedo = computed(() => {
    // 实现重做功能需要历史记录  
    return false;
  });

  // === 方法 ===

  /**
   * 初始化布局系统
   */
  const initialize = () => {
    loadLayoutsFromStorage();
    
    // 如果没有布局，创建默认布局
    if (layouts.value.length === 0) {
      createDefaultLayouts();
    }

    // 设置当前布局
    if (!currentLayoutId.value && layouts.value.length > 0) {
      currentLayoutId.value = layouts.value[0].id;
    }

    console.log('布局系统已初始化');
  };

  /**
   * 创建默认布局
   */
  const createDefaultLayouts = () => {
    const now = Date.now();
    
    const defaultLayouts = LAYOUT_TEMPLATES.map((template, index) => ({
      ...template,
      id: `layout-${index + 1}`,
      created: now,
      modified: now
    }));

    layouts.value = defaultLayouts;
    saveLayoutsToStorage();
  };

  /**
   * 创建新布局
   * @param name 布局名称
   * @param template 模板（可选）
   * @returns 新布局ID
   */
  const createLayout = (name: string, template?: Partial<LayoutConfig>): string => {
    const now = Date.now();
    const id = `layout-${now}`;
    
    const newLayout: LayoutConfig = {
      id,
      name,
      description: template?.description || '',
      items: template?.items || [],
      gridSize: template?.gridSize || 20,
      snapToGrid: template?.snapToGrid ?? true,
      showGrid: template?.showGrid ?? false,
      backgroundColor: template?.backgroundColor,
      created: now,
      modified: now
    };

    layouts.value.push(newLayout);
    saveLayoutsToStorage();
    
    return id;
  };

  /**
   * 复制布局
   * @param layoutId 要复制的布局ID
   * @param newName 新布局名称
   * @returns 新布局ID
   */
  const duplicateLayout = (layoutId: string, newName: string): string => {
    const sourceLayout = layouts.value.find(layout => layout.id === layoutId);
    if (!sourceLayout) {
      throw new Error(`布局 ${layoutId} 不存在`);
    }

    const now = Date.now();
    const newId = `layout-${now}`;
    
    const duplicatedLayout: LayoutConfig = {
      ...sourceLayout,
      id: newId,
      name: newName,
      items: sourceLayout.items.map(item => ({
        ...item,
        id: `item-${now}-${Math.random().toString(36).substr(2, 9)}`
      })),
      created: now,
      modified: now
    };

    layouts.value.push(duplicatedLayout);
    saveLayoutsToStorage();
    
    return newId;
  };

  /**
   * 删除布局
   * @param layoutId 布局ID
   */
  const deleteLayout = (layoutId: string) => {
    const index = layouts.value.findIndex(layout => layout.id === layoutId);
    if (index === -1) {
      throw new Error(`布局 ${layoutId} 不存在`);
    }

    layouts.value.splice(index, 1);
    
    // 如果删除的是当前布局，切换到第一个可用布局
    if (currentLayoutId.value === layoutId) {
      currentLayoutId.value = layouts.value.length > 0 ? layouts.value[0].id : '';
    }

    saveLayoutsToStorage();
  };

  /**
   * 设置当前布局
   * @param layoutId 布局ID
   */
  const setLayout = (layoutId: string) => {
    const layout = layouts.value.find(l => l.id === layoutId);
    if (!layout) {
      throw new Error(`布局 ${layoutId} 不存在`);
    }

    currentLayoutId.value = layoutId;
    saveCurrentLayoutId();
  };

  /**
   * 添加Widget到当前布局
   * @param widgetId Widget ID
   * @param position 位置信息
   * @returns 布局项ID
   */
  const addWidget = (widgetId: string, position: WidgetPosition): string => {
    if (!currentLayout.value) {
      throw new Error('没有活动的布局');
    }

    const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem: LayoutItem = {
      id: itemId,
      widgetId,
      position: { ...position },
      isVisible: true,
      isResizable: true,
      isDraggable: true
    };

    currentLayout.value.items.push(newItem);
    updateLayoutModified();
    saveLayoutsToStorage();
    
    return itemId;
  };

  /**
   * 移除布局项
   * @param itemId 布局项ID
   */
  const removeItem = (itemId: string) => {
    if (!currentLayout.value) {return;}

    const index = currentLayout.value.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      currentLayout.value.items.splice(index, 1);
      
      // 从选中项中移除
      const selectedIndex = selectedItems.value.indexOf(itemId);
      if (selectedIndex !== -1) {
        selectedItems.value.splice(selectedIndex, 1);
      }

      updateLayoutModified();
      saveLayoutsToStorage();
    }
  };

  /**
   * 更新Widget位置
   * @param itemId 布局项ID  
   * @param position 新位置
   */
  const updateItemPosition = (itemId: string, position: Partial<WidgetPosition>) => {
    if (!currentLayout.value) {return;}

    const item = currentLayout.value.items.find(item => item.id === itemId);
    if (item) {
      Object.assign(item.position, position);
      
      // 对齐到网格
      if (currentLayout.value.snapToGrid) {
        snapToGrid(item.position);
      }

      updateLayoutModified();
      saveLayoutsToStorage();
    }
  };

  /**
   * 更新Widget大小
   * @param itemId 布局项ID
   * @param size 新大小
   */
  const updateItemSize = (itemId: string, size: { width: number; height: number }) => {
    updateItemPosition(itemId, size);
  };

  /**
   * 对齐到网格
   * @param position 位置信息
   */
  const snapToGrid = (position: WidgetPosition) => {
    const gridSize = currentLayout.value?.gridSize || viewSettings.gridSize;
    
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    position.width = Math.round(position.width / gridSize) * gridSize;
    position.height = Math.round(position.height / gridSize) * gridSize;
  };

  /**
   * 选择布局项
   * @param itemIds 布局项ID数组
   * @param addToSelection 是否添加到当前选择（默认false，即替换选择）
   */
  const selectItems = (itemIds: string[], addToSelection = false) => {
    if (addToSelection) {
      selectedItems.value = [...new Set([...selectedItems.value, ...itemIds])];
    } else {
      selectedItems.value = [...itemIds];
    }
  };

  /**
   * 清除选择
   */
  const clearSelection = () => {
    selectedItems.value = [];
  };

  /**
   * 复制选中的项到剪贴板
   */
  const copySelected = () => {
    if (!currentLayout.value) {return;}

    clipboard.value = selectedItems.value
      .map(itemId => currentLayout.value!.items.find(item => item.id === itemId))
      .filter(item => item !== undefined) as LayoutItem[];
  };

  /**
   * 粘贴剪贴板中的项
   */
  const paste = () => {
    if (!currentLayout.value || clipboard.value.length === 0) {return;}

    const now = Date.now();
    const offset = 20; // 粘贴偏移量

    const newItems = clipboard.value.map(item => ({
      ...item,
      id: `item-${now}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        ...item.position,
        x: item.position.x + offset,
        y: item.position.y + offset
      }
    }));

    currentLayout.value.items.push(...newItems);
    selectItems(newItems.map(item => item.id));
    
    updateLayoutModified();
    saveLayoutsToStorage();
  };

  /**
   * 删除选中的项
   */
  const deleteSelected = () => {
    selectedItems.value.forEach(itemId => {
      removeItem(itemId);
    });
    clearSelection();
  };

  /**
   * 设置编辑模式
   * @param enabled 是否启用编辑模式
   */
  const setEditMode = (enabled: boolean) => {
    isEditMode.value = enabled;
    
    if (!enabled) {
      clearSelection();
    }
  };

  /**
   * 自动布局
   * @param type 布局类型
   */
  const autoLayout = (type: 'grid' | 'stack' | 'flow') => {
    if (!currentLayout.value || currentLayout.value.items.length === 0) {return;}

    const items = currentLayout.value.items;
    const containerWidth = 1200; // 假设容器宽度
    const containerHeight = 800; // 假设容器高度
    const padding = 20;

    switch (type) {
      case 'grid':
        layoutAsGrid(items, containerWidth, containerHeight, padding);
        break;
      case 'stack':
        layoutAsStack(items, containerWidth, padding);
        break;
      case 'flow':
        layoutAsFlow(items, containerWidth, padding);
        break;
    }

    updateLayoutModified();
    saveLayoutsToStorage();
  };

  /**
   * 网格布局
   */
  const layoutAsGrid = (items: LayoutItem[], containerWidth: number, containerHeight: number, padding: number) => {
    const cols = Math.ceil(Math.sqrt(items.length));
    const rows = Math.ceil(items.length / cols);
    
    const itemWidth = (containerWidth - padding * (cols + 1)) / cols;
    const itemHeight = (containerHeight - padding * (rows + 1)) / rows;

    items.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      item.position.x = padding + col * (itemWidth + padding);
      item.position.y = padding + row * (itemHeight + padding);
      item.position.width = itemWidth;
      item.position.height = itemHeight;
    });
  };

  /**
   * 堆叠布局
   */
  const layoutAsStack = (items: LayoutItem[], containerWidth: number, padding: number) => {
    const itemWidth = containerWidth - padding * 2;
    const itemHeight = 200; // 固定高度

    items.forEach((item, index) => {
      item.position.x = padding;
      item.position.y = padding + index * (itemHeight + padding);
      item.position.width = itemWidth;
      item.position.height = itemHeight;
    });
  };

  /**
   * 流式布局
   */
  const layoutAsFlow = (items: LayoutItem[], containerWidth: number, padding: number) => {
    let currentX = padding;
    let currentY = padding;
    let rowHeight = 0;

    items.forEach(item => {
      const itemWidth = Math.max(item.position.width, 200);
      const itemHeight = Math.max(item.position.height, 200);

      // 如果当前行放不下，换行
      if (currentX + itemWidth > containerWidth - padding) {
        currentX = padding;
        currentY += rowHeight + padding;
        rowHeight = 0;
      }

      item.position.x = currentX;
      item.position.y = currentY;
      item.position.width = itemWidth;
      item.position.height = itemHeight;

      currentX += itemWidth + padding;
      rowHeight = Math.max(rowHeight, itemHeight);
    });
  };

  /**
   * 更新布局修改时间
   */
  const updateLayoutModified = () => {
    if (currentLayout.value) {
      currentLayout.value.modified = Date.now();
    }
  };

  // === 本地存储方法 ===

  /**
   * 保存布局到本地存储
   */
  const saveLayoutsToStorage = () => {
    localStorage.setItem('serial-studio-layouts', JSON.stringify(layouts.value));
  };

  /**
   * 从本地存储加载布局
   */
  const loadLayoutsFromStorage = () => {
    try {
      const stored = localStorage.getItem('serial-studio-layouts');
      if (stored) {
        layouts.value = JSON.parse(stored);
      }

      const currentId = localStorage.getItem('serial-studio-current-layout');
      if (currentId) {
        currentLayoutId.value = currentId;
      }
    } catch (error) {
      console.warn('加载布局失败:', error);
    }
  };

  /**
   * 保存当前布局ID
   */
  const saveCurrentLayoutId = () => {
    localStorage.setItem('serial-studio-current-layout', currentLayoutId.value);
  };

  // 返回store API
  return {
    // 状态
    currentLayoutId: computed(() => currentLayoutId.value),
    layouts: computed(() => layouts.value),
    isEditMode: computed(() => isEditMode.value),
    selectedItems: computed(() => selectedItems.value),
    dragState: computed(() => dragState),
    viewSettings: computed(() => viewSettings),
    
    // 计算属性
    currentLayout,
    visibleItems,
    selectedLayout,
    canUndo,
    canRedo,
    
    // 方法
    initialize,
    createLayout,
    duplicateLayout,
    deleteLayout,
    setLayout,
    addWidget,
    removeItem,
    updateItemPosition,
    updateItemSize,
    selectItems,
    clearSelection,
    copySelected,
    paste,
    deleteSelected,
    setEditMode,
    autoLayout
  };
});

export default useLayoutStore;
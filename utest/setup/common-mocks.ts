/**
 * 通用Mock设置
 * 为所有测试提供一致的Mock配置
 */

import { vi } from 'vitest';

// Vue 3 Core Mock - 必须在最开始就Mock
vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    defineComponent: vi.fn().mockImplementation((options) => {
      if (typeof options === 'function') {
        return options;
      }
      return {
        ...options,
        __isVue: true,
        setup: options.setup || (() => ({}))
      };
    }),
    defineProps: vi.fn(),
    defineEmits: vi.fn(),
    ref: actual.ref || vi.fn().mockImplementation((value) => ({ value })),
    reactive: actual.reactive || vi.fn().mockImplementation((value) => value),
    computed: actual.computed || vi.fn().mockImplementation((fn) => ({ value: fn() })),
    watch: actual.watch || vi.fn(),
    watchEffect: actual.watchEffect || vi.fn(),
    nextTick: actual.nextTick || vi.fn().mockImplementation(async (fn?: () => void) => {
      if (fn) {
        await new Promise(resolve => setTimeout(resolve, 0));
        return fn();
      }
      return Promise.resolve();
    }),
    onMounted: actual.onMounted || vi.fn(),
    onUnmounted: actual.onUnmounted || vi.fn(),
    onBeforeUnmount: actual.onBeforeUnmount || vi.fn(),
    onUpdated: actual.onUpdated || vi.fn(),
    getCurrentInstance: actual.getCurrentInstance || vi.fn().mockReturnValue(null),
    inject: actual.inject || vi.fn().mockReturnValue(undefined),
    provide: actual.provide || vi.fn(),
    resolveComponent: actual.resolveComponent || vi.fn().mockImplementation((name) => {
      // 返回基础的组件Mock结构
      return {
        name,
        template: `<div class="${name.toLowerCase()}"><slot /></div>`,
        props: {},
        emits: []
      };
    }),
    resolveDirective: actual.resolveDirective || vi.fn().mockReturnValue({}),
    withDirectives: actual.withDirectives || vi.fn().mockImplementation((vnode) => vnode),
    createVNode: actual.createVNode || vi.fn(),
    Fragment: actual.Fragment || 'Fragment',
    Text: actual.Text || 'Text',
    Comment: actual.Comment || 'Comment',
  };
});

// Element Plus图标Mock配置
const createMockIcons = () => {
  const iconTemplate = '<span class="mock-icon"></span>';
  return {
    // 基础图标
    Refresh: { name: 'Refresh', template: iconTemplate },
    Setting: { name: 'Setting', template: iconTemplate },
    Download: { name: 'Download', template: iconTemplate },
    Document: { name: 'Document', template: iconTemplate },
    DocumentRemove: { name: 'DocumentRemove', template: iconTemplate },
    
    // 状态图标
    WarningFilled: { name: 'WarningFilled', template: iconTemplate },
    Loading: { name: 'Loading', template: iconTemplate },
    QuestionFilled: { name: 'QuestionFilled', template: iconTemplate },
    
    // 布局图标
    FullScreen: { name: 'FullScreen', template: iconTemplate },
    Grid: { name: 'Grid', template: iconTemplate },
    Box: { name: 'Box', template: iconTemplate },
    
    // Widget图标
    TrendCharts: { name: 'TrendCharts', template: iconTemplate },
    DataAnalysis: { name: 'DataAnalysis', template: iconTemplate },
    DataLine: { name: 'DataLine', template: iconTemplate },
    Timer: { name: 'Timer', template: iconTemplate },
    Histogram: { name: 'Histogram', template: iconTemplate },
    Monitor: { name: 'Monitor', template: iconTemplate },
    
    // 导航图标
    Compass: { name: 'Compass', template: iconTemplate },
    Position: { name: 'Position', template: iconTemplate },
    Location: { name: 'Location', template: iconTemplate },
    Lightning: { name: 'Lightning', template: iconTemplate },
    
    // 播放控制图标
    VideoPlay: { name: 'VideoPlay', template: iconTemplate },
    VideoPause: { name: 'VideoPause', template: iconTemplate },
    
    // 缩放和导航图标
    ZoomIn: { name: 'ZoomIn', template: iconTemplate },
    ZoomOut: { name: 'ZoomOut', template: iconTemplate },
    Aim: { name: 'Aim', template: iconTemplate },
    Connection: { name: 'Connection', template: iconTemplate },
    
    // 天气图标
    Cloudy: { name: 'Cloudy', template: iconTemplate },
    
    // 视图和方向图标
    View: { name: 'View', template: iconTemplate },
    Top: { name: 'Top', template: iconTemplate },
    Bottom: { name: 'Bottom', template: iconTemplate },
    Back: { name: 'Back', template: iconTemplate },
    Right: { name: 'Right', template: iconTemplate },
    RefreshLeft: { name: 'RefreshLeft', template: iconTemplate },
    RefreshRight: { name: 'RefreshRight', template: iconTemplate },
    
    // 图表图标
    List: { name: 'List', template: iconTemplate },
    Rank: { name: 'Rank', template: iconTemplate },
    Sort: { name: 'Sort', template: iconTemplate },
    ArrowDown: { name: 'ArrowDown', template: iconTemplate },
    
    // 操作图标
    Operation: { name: 'Operation', template: iconTemplate },
    
    // 其他常用图标
    Close: { name: 'Close', template: iconTemplate },
    Plus: { name: 'Plus', template: iconTemplate },
    Minus: { name: 'Minus', template: iconTemplate },
    Edit: { name: 'Edit', template: iconTemplate },
    Delete: { name: 'Delete', template: iconTemplate },
    Search: { name: 'Search', template: iconTemplate },
    Filter: { name: 'Filter', template: iconTemplate },
    Sort: { name: 'Sort', template: iconTemplate },
    Upload: { name: 'Upload', template: iconTemplate },
    Export: { name: 'Export', template: iconTemplate },
    Import: { name: 'Import', template: iconTemplate },
    Play: { name: 'Play', template: iconTemplate },
    Pause: { name: 'Pause', template: iconTemplate },
    Stop: { name: 'Stop', template: iconTemplate },
    More: { name: 'More', template: iconTemplate },
    ArrowLeft: { name: 'ArrowLeft', template: iconTemplate },
    ArrowRight: { name: 'ArrowRight', template: iconTemplate },
    ArrowUp: { name: 'ArrowUp', template: iconTemplate },
    ArrowDown: { name: 'ArrowDown', template: iconTemplate },
    Check: { name: 'Check', template: iconTemplate },
    CircleCheck: { name: 'CircleCheck', template: iconTemplate },
    CircleClose: { name: 'CircleClose', template: iconTemplate },
    InfoFilled: { name: 'InfoFilled', template: iconTemplate },
    SuccessFilled: { name: 'SuccessFilled', template: iconTemplate },
    Warning: { name: 'Warning', template: iconTemplate },
    Error: { name: 'Error', template: iconTemplate }
  };
};

// Element Plus图标Mock - 确保正确导出，每个图标都是独立的命名导出
vi.mock('@element-plus/icons-vue', () => {
  const iconTemplate = { template: '<span class="mock-icon"></span>' };
  
  // 直接返回每个图标作为命名导出
  return {
    // 基础图标
    Refresh: iconTemplate,
    Setting: iconTemplate,
    Download: iconTemplate,
    Document: iconTemplate,
    DocumentRemove: iconTemplate,
    
    // 状态图标
    WarningFilled: iconTemplate,
    Loading: iconTemplate,
    QuestionFilled: iconTemplate,
    
    // 布局图标
    FullScreen: iconTemplate,
    Grid: iconTemplate,
    Box: iconTemplate,
    
    // Widget图标
    TrendCharts: iconTemplate,
    DataAnalysis: iconTemplate,
    DataLine: iconTemplate,
    Timer: iconTemplate,
    Histogram: iconTemplate,
    Monitor: iconTemplate,
    
    // 导航图标
    Compass: iconTemplate,
    Position: iconTemplate,
    Location: iconTemplate,
    Lightning: iconTemplate,
    
    // 播放控制图标
    VideoPlay: iconTemplate,
    VideoPause: iconTemplate,
    
    // 缩放和导航图标
    ZoomIn: iconTemplate,
    ZoomOut: iconTemplate,
    Aim: iconTemplate,
    Connection: iconTemplate,
    
    // 天气图标
    Cloudy: iconTemplate,
    
    // 视图和方向图标
    View: iconTemplate,
    Top: iconTemplate,
    Bottom: iconTemplate,
    Back: iconTemplate,
    Right: iconTemplate,
    RefreshLeft: iconTemplate,
    RefreshRight: iconTemplate,
    
    // 图表图标
    List: iconTemplate,
    Rank: iconTemplate,
    Sort: iconTemplate,
    ArrowDown: iconTemplate,
    
    // 操作图标
    Operation: iconTemplate,
    
    // 其他常用图标
    Close: iconTemplate,
    Plus: iconTemplate,
    Minus: iconTemplate,
    Edit: iconTemplate,
    Delete: iconTemplate,
    Search: iconTemplate,
    Filter: iconTemplate,
    Sort: iconTemplate,
    Upload: iconTemplate,
    Export: iconTemplate,
    Import: iconTemplate,
    Play: iconTemplate,
    Pause: iconTemplate,
    Stop: iconTemplate,
    More: iconTemplate,
    ArrowLeft: iconTemplate,
    ArrowRight: iconTemplate,
    ArrowUp: iconTemplate,
    ArrowDown: iconTemplate,
    Check: iconTemplate,
    CircleCheck: iconTemplate,
    CircleClose: iconTemplate,
    InfoFilled: iconTemplate,
    SuccessFilled: iconTemplate,
    Warning: iconTemplate,
    Error: iconTemplate
  };
});

export const mockElementPlusIcons = () => {
  return createMockIcons();
};

// Element Plus组件Mock配置
const createMockComponents = () => ({
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
    props: ['disabled', 'icon', 'type', 'size']
  },
  ElButtonGroup: {
    name: 'ElButtonGroup',
    template: '<div class="el-button-group"><slot /></div>',
    props: ['size']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot /></i>',
    props: ['class']
  },
  ElTag: {
    name: 'ElTag',
    template: '<span class="el-tag" :class="`el-tag--${type}`"><slot /></span>',
    props: ['type', 'size', 'effect']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot /></div>',
    props: ['content', 'placement']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    emits: ['update:modelValue'],
    props: ['modelValue', 'placeholder', 'disabled']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select class="el-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    emits: ['update:modelValue'],
    props: ['modelValue', 'placeholder', 'disabled']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option class="el-option" :value="value"><slot /></option>',
    props: ['value', 'label']
  },
  ElDialog: {
    name: 'ElDialog',
    template: '<div class="el-dialog" v-if="modelValue"><slot /></div>',
    emits: ['update:modelValue'],
    props: ['modelValue', 'title', 'width']
  },
  ElForm: {
    name: 'ElForm',
    template: '<form class="el-form"><slot /></form>',
    props: ['model', 'rules']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><slot /></div>',
    props: ['label', 'prop']
  },
  ElSwitch: {
    name: 'ElSwitch',
    template: '<div class="el-switch" :class="{ \'is-checked\': modelValue }" @click="$emit(\'update:modelValue\', !modelValue)"></div>',
    emits: ['update:modelValue'],
    props: ['modelValue']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<div class="el-slider"><input type="range" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
    emits: ['update:modelValue'],
    props: ['modelValue', 'min', 'max', 'step']
  },
  ElColorPicker: {
    name: 'ElColorPicker',
    template: '<input type="color" class="el-color-picker" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" />',
    emits: ['update:modelValue'],
    props: ['modelValue']
  },
  ElTable: {
    name: 'ElTable',
    template: '<table class="el-table"><slot /></table>',
    props: ['data', 'columns']
  },
  ElTableColumn: {
    name: 'ElTableColumn',
    template: '<td class="el-table-column"><slot /></td>',
    props: ['prop', 'label', 'width']
  },
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot /></div>',
    props: ['header', 'shadow']
  },
  ElRow: {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>',
    props: ['gutter', 'type', 'justify', 'align']
  },
  ElCol: {
    name: 'ElCol',
    template: '<div class="el-col"><slot /></div>',
    props: ['span', 'offset', 'push', 'pull']
  },
  ElAlert: {
    name: 'ElAlert',
    template: '<div class="el-alert"><slot /></div>',
    props: ['type', 'title', 'description', 'closable']
  },
  ElProgress: {
    name: 'ElProgress',
    template: '<div class="el-progress"></div>',
    props: ['percentage', 'type', 'status']
  },
  ElLoading: {
    name: 'ElLoading',
    template: '<div class="el-loading"><slot /></div>',
    props: ['loading']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    emits: ['update:modelValue'],
    props: ['modelValue', 'min', 'max', 'step', 'precision']
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    emits: ['update:modelValue'],
    props: ['modelValue', 'label']
  },
  ElRadio: {
    name: 'ElRadio',
    template: '<input type="radio" class="el-radio" :checked="modelValue === label" @change="$emit(\'update:modelValue\', label)" />',
    emits: ['update:modelValue'],
    props: ['modelValue', 'label']
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot /></div>',
    emits: ['update:modelValue'],
    props: ['modelValue']
  },
  ElDatePicker: {
    name: 'ElDatePicker',
    template: '<input type="date" class="el-date-picker" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" />',
    emits: ['update:modelValue'],
    props: ['modelValue', 'type', 'format']
  },
  ElDivider: {
    name: 'ElDivider',
    template: '<div class="el-divider" :class="`el-divider--${direction}`"></div>',
    props: ['direction', 'contentPosition']
  },
  ElPopover: {
    name: 'ElPopover',
    template: '<div class="el-popover"><slot /></div>',
    props: ['placement', 'title', 'width', 'trigger']
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot /></div>',
    props: ['trigger', 'placement']
  },
  ElDropdownMenu: {
    name: 'ElDropdownMenu',
    template: '<div class="el-dropdown-menu"><slot /></div>'
  },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<div class="el-dropdown-item"><slot /></div>',
    props: ['command', 'disabled', 'divided']
  }
});

// Element Plus组件Mock - 确保正确导出
vi.mock('element-plus', () => {
  const components = createMockComponents();
  return {
    ...components,
    default: components
  };
});

export const mockElementPlusComponents = () => {
  return createMockComponents();
};

// MessageBridge Mock
export const mockMessageBridge = () => {
  const mockMessageBridge = {
    send: vi.fn(),
    request: vi.fn().mockResolvedValue({}),
    sendBatch: vi.fn(),
    setOnline: vi.fn(),
    destroy: vi.fn(),
    getStats: vi.fn().mockReturnValue({
      messagesSent: 0,
      messagesReceived: 0,
      averageLatency: 0
    }),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  };
  
  return mockMessageBridge;
};

// ResizeObserver Mock
export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
};

// Pinia Stores Mock
export const mockPiniaStores = () => {
  // Mock useThemeStore - 绝对路径
  vi.mock('@/webview/stores/theme', () => ({
    useThemeStore: () => ({
      currentTheme: 'default',
      isDark: false,
      setTheme: vi.fn(),
      toggleDark: vi.fn(),
      getChartColors: () => ({
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399'
      })
    })
  }));

  // Mock useThemeStore - 相对路径（用于Widget组件）
  vi.mock('../../stores/theme', () => ({
    useThemeStore: () => ({
      currentTheme: 'default',
      isDark: false,
      setTheme: vi.fn(),
      toggleDark: vi.fn(),
      getChartColors: () => ({
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399'
      })
    })
  }));

  // Mock useThemeStore - 另一种绝对路径
  vi.mock('@/stores/theme', () => ({
    useThemeStore: () => ({
      currentTheme: 'default',
      isDark: false,
      setTheme: vi.fn(),
      toggleDark: vi.fn(),
      getChartColors: () => ({
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399'
      })
    })
  }));

  // Mock usePerformanceStore - 绝对路径
  vi.mock('@/webview/stores/performance', () => ({
    usePerformanceStore: () => ({
      metrics: {},
      updateMetrics: vi.fn(),
      clearMetrics: vi.fn(),
      recordFrame: vi.fn()
    })
  }));

  // Mock usePerformanceStore - 相对路径
  vi.mock('../../stores/performance', () => ({
    usePerformanceStore: () => ({
      metrics: {},
      updateMetrics: vi.fn(),
      clearMetrics: vi.fn(),
      recordFrame: vi.fn()
    })
  }));

  // Mock useDataStore - 绝对路径
  vi.mock('@/webview/stores/data', () => ({
    useDataStore: () => ({
      currentFrame: null,
      datasets: [],
      widgets: new Map(),
      addDataset: vi.fn(),
      updateDataset: vi.fn(),
      processFrame: vi.fn(),
      clearData: vi.fn(),
      getDataset: vi.fn().mockReturnValue(null),
    })
  }));

  // Mock useDataStore - 另一种绝对路径
  vi.mock('@/stores/data', () => ({
    useDataStore: () => ({
      currentFrame: null,
      datasets: [],
      widgets: new Map(),
      addDataset: vi.fn(),
      updateDataset: vi.fn(),
      processFrame: vi.fn(),
      clearData: vi.fn(),
      getDataset: vi.fn().mockReturnValue(null),
    })
  }));

  // Mock useDataStore - 相对路径
  vi.mock('../../stores/data', () => ({
    useDataStore: () => ({
      currentFrame: null,
      datasets: [],
      widgets: new Map(),
      addDataset: vi.fn(),
      updateDataset: vi.fn(),
      processFrame: vi.fn(),
      clearData: vi.fn(),
      getDataset: vi.fn().mockReturnValue(null),
    })
  }));

  // Mock useConnectionStore - 绝对路径
  vi.mock('@/webview/stores/connection', () => ({
    useConnectionStore: () => ({
      isConnected: false,
      status: 'disconnected',
      connect: vi.fn(),
      disconnect: vi.fn()
    })
  }));
};

// Window APIs Mock
export const mockWindowAPIs = () => {
  // Mock window.matchMedia
  global.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
    return setTimeout(callback, 16);
  });

  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
    clearTimeout(id);
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock MutationObserver
  global.MutationObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  }));

  // Mock HTMLCanvasElement and 2D context
  const mockContext2D = {
    // 绘制方法
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    
    // 路径方法
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    
    // 线条样式
    setLineDash: vi.fn(),
    getLineDash: vi.fn().mockReturnValue([]),
    lineDashOffset: 0,
    
    // 测量方法
    measureText: vi.fn().mockReturnValue({ width: 50, height: 12 }),
    
    // 渐变方法
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn()
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn()
    }),
    
    // 样式属性
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    
    // 变换方法
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    transform: vi.fn(),
    
    // 图像数据
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    })
  };

  // Mock canvas element
  const mockCanvas = {
    getContext: vi.fn().mockImplementation((type) => {
      if (type === '2d') return mockContext2D;
      return null;
    }),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockCanvas'),
    toBlob: vi.fn().mockImplementation((callback) => {
      callback(new Blob(['mock'], { type: 'image/png' }));
    }),
    width: 800,
    height: 400,
    style: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    
    // DOM Element方法
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    hasAttribute: vi.fn().mockReturnValue(false),
    removeAttribute: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    replaceChild: vi.fn(),
    insertBefore: vi.fn(),
    cloneNode: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnValue(false),
    
    // DOM Element属性
    tagName: 'CANVAS',
    nodeName: 'CANVAS',
    nodeType: 1,
    id: '',
    className: '',
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn().mockReturnValue(false)
    },
    
    // Canvas特定属性
    offsetWidth: 800,
    offsetHeight: 400,
    clientWidth: 800,
    clientHeight: 400,
    scrollWidth: 800,
    scrollHeight: 400,
    
    // 父节点相关
    parentNode: null,
    parentElement: null,
    childNodes: [],
    children: [],
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null
  };

  // Mock HTMLCanvasElement.prototype方法，而不是createElement
  if (typeof HTMLCanvasElement !== 'undefined') {
    // 保存原始方法
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    
    // Mock getContext方法
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(function(this: HTMLCanvasElement, contextType: string) {
      if (contextType === '2d') {
        return mockContext2D;
      }
      return originalGetContext?.call(this, contextType) || null;
    });
    
    // Mock toDataURL方法
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockImplementation(function(this: HTMLCanvasElement, type?: string, quality?: any) {
      return 'data:image/png;base64,mockCanvas';
    });
    
    // Mock toBlob方法
    HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation(function(this: HTMLCanvasElement, callback: BlobCallback, type?: string, quality?: any) {
      const blob = new Blob(['mock'], { type: type || 'image/png' });
      callback(blob);
    });
    
    // 设置默认Canvas尺寸
    Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
      get() { return this._mockWidth || 800; },
      set(value) { this._mockWidth = value; },
      configurable: true
    });
    
    Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
      get() { return this._mockHeight || 400; },
      set(value) { this._mockHeight = value; },
      configurable: true
    });
  }
};

// BaseWidget Mock
export const mockBaseWidget = () => {
  vi.mock('@/webview/components/base/BaseWidget.vue', () => ({
    default: {
      name: 'BaseWidget',
      template: `
        <div class="base-widget" :data-widget-type="widgetType">
          <div class="widget-header">
            <h3>{{ title }}</h3>
            <div class="widget-toolbar">
              <slot name="toolbar" />
            </div>
            <div class="widget-actions">
              <button @click="$emit('refresh')" class="refresh-btn">刷新</button>
              <button @click="$emit('settings')" class="settings-btn">设置</button>
              <button @click="$emit('export', {})" class="export-btn">导出</button>
            </div>
          </div>
          <div class="widget-content">
            <slot />
          </div>
        </div>
      `,
      props: ['widgetType', 'title', 'datasets'],
      emits: ['refresh', 'settings', 'export']
    }
  }));
};

// Vue 3 Event System Mock
export const mockVue3EventSystem = () => {
  // Mock Vue 3 event system for components that still use Vue 2 patterns
  const createMockEventSystem = () => ({
    $on: vi.fn(),
    $off: vi.fn(),
    $emit: vi.fn(),
    $once: vi.fn(),
  });

  return createMockEventSystem();
};

// Leaflet Mock for GPSWidget
export const mockLeaflet = () => {
  const mockLayer = {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    getLatLng: vi.fn().mockReturnValue({ lat: 0, lng: 0 }),
    bindPopup: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
  };

  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    getZoom: vi.fn().mockReturnValue(13),
    setZoom: vi.fn().mockReturnThis(),
    panTo: vi.fn().mockReturnThis(),
    flyTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    invalidateSize: vi.fn().mockReturnThis(),
    eachLayer: vi.fn(),
    hasLayer: vi.fn().mockReturnValue(false),
  };

  global.L = {
    map: vi.fn().mockReturnValue(mockMap),
    tileLayer: vi.fn().mockReturnValue(mockLayer),
    marker: vi.fn().mockReturnValue(mockLayer),
    polyline: vi.fn().mockReturnValue(mockLayer),
    circle: vi.fn().mockReturnValue(mockLayer),
    layerGroup: vi.fn().mockReturnValue(mockLayer),
    icon: vi.fn().mockReturnValue({}),
    divIcon: vi.fn().mockReturnValue({}),
    latLng: vi.fn().mockImplementation((lat, lng) => ({ lat, lng })),
    latLngBounds: vi.fn().mockReturnValue({
      extend: vi.fn().mockReturnThis(),
      isValid: vi.fn().mockReturnValue(true),
    }),
  };

  return { mockMap, mockLayer };
};

// Three.js Mock for Plot3DWidget
export const mockThreeJS = () => {
  const mockObject3D = {
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    position: { set: vi.fn(), copy: vi.fn(), clone: vi.fn() },
    rotation: { set: vi.fn() },
    scale: { set: vi.fn() },
    lookAt: vi.fn(),
    traverse: vi.fn(),
  };

  const mockGeometry = {
    setAttribute: vi.fn(),
    dispose: vi.fn(),
  };

  const mockMaterial = {
    dispose: vi.fn(),
  };

  const mockScene = Object.assign({}, mockObject3D, {
    background: null,
  });

  const mockCamera = Object.assign({}, mockObject3D, {
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
    getWorldDirection: vi.fn().mockReturnValue({ cross: vi.fn().mockReturnThis(), normalize: vi.fn().mockReturnThis() }),
    up: { copy: vi.fn() },
  });

  const mockRenderer = {
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    setClearColor: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    setRenderTarget: vi.fn(),
    domElement: {
      width: 800,
      height: 600,
      appendChild: vi.fn(),
    },
  };

  vi.mock('three', () => ({
    Scene: vi.fn().mockImplementation(() => mockScene),
    PerspectiveCamera: vi.fn().mockImplementation(() => mockCamera),
    WebGLRenderer: vi.fn().mockImplementation(() => mockRenderer),
    Group: vi.fn().mockImplementation(() => mockObject3D),
    Mesh: vi.fn().mockImplementation(() => mockObject3D),
    Line: vi.fn().mockImplementation(() => mockObject3D),
    BufferGeometry: vi.fn().mockImplementation(() => mockGeometry),
    SphereGeometry: vi.fn().mockImplementation(() => mockGeometry),
    LineBasicMaterial: vi.fn().mockImplementation(() => mockMaterial),
    MeshBasicMaterial: vi.fn().mockImplementation(() => mockMaterial),
    GridHelper: vi.fn().mockImplementation(() => mockObject3D),
    AxesHelper: vi.fn().mockImplementation(() => mockObject3D),
    BufferAttribute: vi.fn(),
    Float32BufferAttribute: vi.fn(),
    Color: vi.fn().mockImplementation(() => ({ setHex: vi.fn() })),
    Vector3: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockReturnThis(),
      copy: vi.fn().mockReturnThis(),
      clone: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      multiplyScalar: vi.fn().mockReturnThis(),
      setFromSpherical: vi.fn().mockReturnThis(),
      cross: vi.fn().mockReturnThis(),
      normalize: vi.fn().mockReturnThis(),
      x: 0, y: 0, z: 0,
    })),
    Spherical: vi.fn().mockImplementation(() => ({
      setFromVector3: vi.fn(),
      phi: 0,
      theta: 0,
      radius: 1,
    })),
    WebGLRenderTarget: vi.fn().mockImplementation(() => ({})),
  }));

  return { mockScene, mockCamera, mockRenderer };
};

// Chart.js Mock for BarWidget
export const mockChartJS = () => {
  const mockChart = {
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    },
    options: {}
  };

  return { mockChart };
};

// Chart.js Global Mock
vi.mock('chart.js', () => {
  const mockChart = {
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    },
    options: {}
  };

  // 创建Chart构造函数Mock
  const ChartConstructor = vi.fn().mockImplementation(() => mockChart);
  ChartConstructor.register = vi.fn(); // Chart静态方法

  return {
    Chart: ChartConstructor,
    BarElement: vi.fn(),
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn()
  };
});

// 完整的设置函数
export const setupCommonMocks = () => {
  const icons = mockElementPlusIcons();
  const components = mockElementPlusComponents();
  mockResizeObserver();
  mockPiniaStores();
  mockWindowAPIs();
  mockBaseWidget();
  const leafletMocks = mockLeaflet();
  const threejsMocks = mockThreeJS();
  const chartjsMocks = mockChartJS();
  
  // 返回所有Mock对象以供测试使用
  return {
    messageBridge: mockMessageBridge(),
    eventSystem: mockVue3EventSystem(),
    leaflet: leafletMocks,
    threejs: threejsMocks,
    chartjs: chartjsMocks,
    components,
    icons
  };
};
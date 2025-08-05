import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// 确保DOM环境完全就绪（宽松检查）
if (typeof document === 'undefined') {
  console.warn('jsdom environment not available, some tests may fail');
}

// 添加额外的DOM API支持
if (!global.Document) {
  global.Document = document.constructor;
}

if (!global.Element) {
  global.Element = document.createElement('div').constructor;
}

// 确保createElement函数可用
global.createElement = document.createElement.bind(document);

// 全局Element Plus组件Mock
vi.mock('element-plus', () => ({
  ElButton: { 
    name: 'ElButton', 
    template: '<button @click="$emit(\'click\')" :class="$attrs.class"><slot /></button>',
    emits: ['click']
  },
  ElButtonGroup: { 
    name: 'ElButtonGroup', 
    template: '<div class="el-button-group"><slot /></div>' 
  },
  ElIcon: { 
    name: 'ElIcon', 
    template: '<i class="el-icon"><slot /></i>' 
  },
  ElTooltip: { 
    name: 'ElTooltip', 
    template: '<span><slot /></span>',
    props: ['content', 'placement']
  },
  ElDropdown: { 
    name: 'ElDropdown', 
    template: '<div class="el-dropdown" @click="$emit(\'command\', \'test\')"><slot /><slot name="dropdown" /></div>',
    emits: ['command']
  },
  ElDropdownMenu: { 
    name: 'ElDropdownMenu', 
    template: '<div class="el-dropdown-menu"><slot /></div>' 
  },
  ElDropdownItem: { 
    name: 'ElDropdownItem', 
    template: '<div class="el-dropdown-item" @click="$emit(\'click\')"><slot /></div>',
    props: ['command'],
    emits: ['click']
  },
  ElProgress: { 
    name: 'ElProgress', 
    template: '<div class="el-progress"><slot /></div>',
    props: ['percentage', 'status', 'strokeWidth']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<select @change="$emit(\'change\', $event.target.value)"><slot /></select>',
    emits: ['change'],
    props: ['modelValue']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value"><slot /></option>',
    props: ['value', 'label']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<input type="range" @input="$emit(\'input\', $event.target.value)" />',
    emits: ['input'],
    props: ['modelValue', 'min', 'max', 'step']
  }
}));

// Mock Element Plus图标
vi.mock('@element-plus/icons-vue', () => ({
  VideoPlay: 'VideoPlay',
  VideoPause: 'VideoPause',
  Operation: 'Operation',
  Compass: 'Compass',
  RefreshRight: 'RefreshRight'
}));

// 全局DOM元素Mock
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    canvas: {
      width: 800,
      height: 600
    }
  })
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// 全局Mock VSCode API
Object.defineProperty(global, 'vscode', {
  value: {
    window: {
      showOpenDialog: vi.fn(),
      showSaveDialog: vi.fn(),
      showInformationMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      showWarningMessage: vi.fn(),
      withProgress: vi.fn(),
      createWebviewPanel: vi.fn().mockReturnValue({
        webview: {
          postMessage: vi.fn(),
          onDidReceiveMessage: vi.fn(),
          html: '',
          options: {},
          cspSource: 'self'
        },
        onDidDispose: vi.fn(),
        dispose: vi.fn(),
        reveal: vi.fn(),
        title: 'Test Panel'
      })
    },
    workspace: {
      getConfiguration: vi.fn().mockReturnValue({
        get: vi.fn().mockReturnValue({}),
        update: vi.fn().mockResolvedValue(undefined),
        has: vi.fn().mockReturnValue(true)
      }),
      onDidChangeConfiguration: vi.fn(),
      workspaceFolders: [{
        uri: { fsPath: '/test/workspace' },
        name: 'test-workspace',
        index: 0
      }]
    },
    commands: {
      registerCommand: vi.fn(),
      executeCommand: vi.fn()
    },
    Uri: {
      file: vi.fn().mockImplementation((path: string) => ({
        scheme: 'file',
        path,
        fsPath: path
      })),
      parse: vi.fn()
    },
    ViewColumn: {
      One: 1,
      Two: 2,
      Three: 3
    }
  },
  writable: true
});

// Mock Node.js modules
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  mkdtempSync: vi.fn().mockReturnValue('/tmp/mock-temp-dir'),
  statSync: vi.fn().mockReturnValue({
    isFile: () => true,
    isDirectory: () => false,
    size: 1024
  }),
  unlinkSync: vi.fn(),
  rmdirSync: vi.fn(),
  readdirSync: vi.fn().mockReturnValue([]),
  createReadStream: vi.fn().mockReturnValue({
    pipe: vi.fn(),
    on: vi.fn(),
    read: vi.fn()
  }),
  createWriteStream: vi.fn().mockReturnValue({
    write: vi.fn(),
    end: vi.fn(),
    on: vi.fn()
  }),
  promises: {
    readFile: vi.fn().mockResolvedValue('mock file content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false,
      size: 1024
    }),
    unlink: vi.fn().mockResolvedValue(undefined),
    rmdir: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    join: vi.fn().mockImplementation((...args: string[]) => {
      // Filter out undefined/null values and ensure all are strings
      const validArgs = args.filter(arg => arg != null && typeof arg === 'string');
      if (validArgs.length === 0) {
        return '.';  // Default behavior like Node.js path.join
      }
      return validArgs.join('/');
    }),
    resolve: vi.fn().mockImplementation((...args: string[]) => {
      const validArgs = args.filter(arg => arg != null && typeof arg === 'string');
      if (validArgs.length === 0) {
        return '/';
      }
      return validArgs.join('/');
    })
  };
});

// Mock worker_threads
vi.mock('worker_threads', () => {
  const WorkerMock = vi.fn().mockImplementation(() => {
    const workerInstance = {
      postMessage: vi.fn(),
      terminate: vi.fn().mockImplementation(() => Promise.resolve()),
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'message') {
          // 模拟worker的响应
          setTimeout(() => {
            callback({
              type: 'configured',
              id: 'test-id'
            });
          }, 10);
        } else if (event === 'error') {
          // 不立即触发错误
        } else if (event === 'exit') {
          // 模拟正常退出
          setTimeout(() => callback(0), 20);
        }
        return workerInstance;
      }),
      off: vi.fn(),
      removeAllListeners: vi.fn()
    };
    return workerInstance;
  });

  return {
    default: {
      Worker: WorkerMock,
      isMainThread: true,
      threadId: 0
    },
    Worker: WorkerMock,
    isMainThread: true,
    threadId: 0
  };
});

// Mock serialport
vi.mock('serialport', () => ({
  SerialPort: vi.fn().mockImplementation(() => ({
    open: vi.fn().mockImplementation((callback) => callback?.()),
    close: vi.fn().mockImplementation((callback) => callback?.()),
    write: vi.fn().mockImplementation((data, callback) => {
      callback?.(null, data.length);
      return true;
    }),
    on: vi.fn(),
    isOpen: vi.fn().mockReturnValue(false),
    readable: true,
    writable: true
  })),
  SerialPortMock: vi.fn()
}));

// Mock noble (Bluetooth)
vi.mock('noble', () => ({
  state: 'poweredOn',
  startScanning: vi.fn(),
  stopScanning: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn()
}));

// Mock vm2 - 增强Mock以支持真实测试
vi.mock('vm2', () => ({
  VM: vi.fn().mockImplementation(() => {
    let globalScope: any = {};
    
    return {
      run: vi.fn().mockImplementation((code: string) => {
        try {
          // 对于真实测试，提供一个基本的JavaScript执行环境
          if (code.includes('function parse')) {
            // 如果是加载parse函数的代码，执行并存储在全局作用域
            eval(`${code}; if (typeof parse !== 'undefined') globalScope.parse = parse;`);
            return undefined;
          } else if (code === 'typeof parse === "function" ? parse : null') {
            // 检查parse函数是否存在
            return globalScope.parse || null;
          } else if (code.startsWith('parse(')) {
            // 执行parse函数调用
            if (globalScope.parse) {
              const match = code.match(/parse\((.+)\)/);
              if (match) {
                const arg = JSON.parse(match[1]);
                return globalScope.parse(arg);
              }
            }
            return [];
          }
          
          // 默认情况下尝试eval执行
          return eval(code);
        } catch (error) {
          // 如果执行失败，返回合理的默认值
          if (code === 'typeof parse === "function" ? parse : null') {
            return null;
          }
          throw error;
        }
      }),
      freeze: vi.fn(),
      timeout: 5000,
      sandbox: {}
    };
  })
}));

// Mock Chart.js
vi.mock('chart.js', () => {
  const MockChart = vi.fn().mockImplementation((ctx, config) => {
    const instance = {
      id: `chart_${Math.random().toString(36).substr(2, 9)}`,
      config: config || {},
      canvas: ctx || { 
        width: 800, 
        height: 600,
        getContext: vi.fn().mockReturnValue({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          drawImage: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          strokeText: vi.fn(),
          fillText: vi.fn(),
          measureText: vi.fn().mockReturnValue({ width: 100 }),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn()
        }),
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock')
      },
      ctx: ctx ? (ctx.getContext ? ctx.getContext('2d') : ctx) : {
        clearRect: vi.fn(),
        fillRect: vi.fn(), 
        drawImage: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn()
      },
      data: config?.data || { datasets: [] },
      options: config?.options || {},
      scales: {
        x: {
          min: 0,
          max: 100,
          type: 'linear',
          display: true,
          ticks: { callback: vi.fn() }
        },
        y: {
          min: 0,
          max: 100,
          type: 'linear',
          display: true,
          ticks: { callback: vi.fn() }
        }
      },
      // 确保所有方法都存在并且是Mock函数
      update: vi.fn().mockReturnValue(Promise.resolve()),
      destroy: vi.fn().mockImplementation(function() {
        // 清理实例引用
        const index = MockChart._instances.indexOf(instance);
        if (index > -1) {
          MockChart._instances.splice(index, 1);
        }
        // console.log('Chart.js实例已销毁, ID:', instance.id);
        return undefined; // destroy方法应该返回undefined
      }),
      resetZoom: vi.fn(),
      resize: vi.fn().mockImplementation((width, height) => {
        if (width !== undefined) instance.canvas.width = width;
        if (height !== undefined) instance.canvas.height = height;
      }),
      render: vi.fn().mockReturnValue(Promise.resolve()),
      stop: vi.fn(),
      clear: vi.fn(),
      toBase64Image: vi.fn().mockReturnValue('data:image/png;base64,mock'),
      getDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
      getDatasetMeta: vi.fn().mockReturnValue({
        data: [],
        dataset: {},
        hidden: false,
        type: 'line'
      }),
      getElementsAtEventForMode: vi.fn().mockReturnValue([]),
      getActiveElements: vi.fn().mockReturnValue([]),
      setActiveElements: vi.fn(),
      isPointInArea: vi.fn().mockReturnValue(true),
      getDatasetAtEvent: vi.fn().mockReturnValue([]),
      getElementAtEvent: vi.fn().mockReturnValue([]),
      // 添加常用的Chart.js方法
      isDatasetVisible: vi.fn().mockReturnValue(true),
      setDatasetVisibility: vi.fn(),
      toggleDataVisibility: vi.fn(),
      hide: vi.fn(),
      show: vi.fn(),
      getVisibleDatasetCount: vi.fn().mockReturnValue(1)
    };

    // 记录实例
    MockChart._instances = MockChart._instances || [];
    MockChart._instances.push(instance);
    
    // console.log('Plot图表初始化完成');
    
    return instance;
  });

  // 添加静态方法
  MockChart.register = vi.fn();
  MockChart.getChart = vi.fn();
  MockChart.destroyAll = vi.fn().mockImplementation(() => {
    if (MockChart._instances) {
      MockChart._instances.forEach(instance => instance.destroy());
      MockChart._instances = [];
    }
  });
  MockChart._instances = [];

  return {
    Chart: MockChart,
    LineElement: { id: 'line', defaults: {} },
    PointElement: { id: 'point', defaults: {} },
    BarElement: { id: 'bar', defaults: {} },
    CategoryScale: { id: 'category', defaults: {} },
    LinearScale: { id: 'linear', defaults: {} },
    TimeScale: { id: 'time', defaults: {} },
    LogarithmicScale: { id: 'logarithmic', defaults: {} },
    RadialLinearScale: { id: 'radialLinear', defaults: {} },
    Title: { id: 'title', defaults: {} },
    Tooltip: { id: 'tooltip', defaults: {} },
    Legend: { id: 'legend', defaults: {} },
    Filler: { id: 'filler', defaults: {} },
    SubTitle: { id: 'subtitle', defaults: {} },
    registerables: [],
    // Mock 工具函数
    helpers: {
      color: vi.fn((color) => ({
        alpha: vi.fn().mockReturnThis(),
        rgbString: vi.fn().mockReturnValue('rgb(255, 255, 255)'),
        hexString: vi.fn().mockReturnValue('#ffffff')
      })),
      isNullOrUndef: vi.fn((value) => value === null || value === undefined),
      isArray: vi.fn((value) => Array.isArray(value))
    }
  };
});

// Mock Chart.js adapter
vi.mock('chartjs-adapter-date-fns', () => ({}));

// Mock MQTT
vi.mock('mqtt', async () => {
  const mqttMock = await import('./mocks/mqtt');
  return {
    ...mqttMock,
    default: mqttMock.default
  };
});

// Mock Three.js with safe DOM element creation
vi.mock('three', () => ({
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: []
  })),
  PerspectiveCamera: vi.fn().mockImplementation(() => ({
    position: { set: vi.fn() },
    lookAt: vi.fn()
  })),
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: (() => {
      try {
        return document.createElement('canvas');
      } catch (e) {
        // Fallback for early initialization before jsdom is ready
        return {
          width: 800,
          height: 600,
          getContext: vi.fn().mockReturnValue({
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            drawImage: vi.fn()
          }),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        };
      }
    })()
  }))
}));

// Mock ExcelJS
vi.mock('exceljs', () => ({
  Workbook: vi.fn().mockImplementation(() => ({
    addWorksheet: vi.fn().mockReturnValue({
      addRow: vi.fn(),
      columns: [],
      getRow: vi.fn(),
      getCell: vi.fn()
    }),
    xlsx: {
      writeBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-excel-data'))
    }
  }))
}));

// Mock Pinia stores
vi.mock('pinia', () => ({
  createPinia: vi.fn(),
  defineStore: vi.fn(() => vi.fn()),
  getActivePinia: vi.fn(),
  setActivePinia: vi.fn()
}));

// Mock performance store specifically
vi.mock('@/webview/stores/performance', () => ({
  usePerformanceStore: () => ({
    recordFrame: vi.fn(),
    trackWidgetPerformance: vi.fn(),
    reportMetrics: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 1024
    }),
    resetMetrics: vi.fn()
  })
}));

// 全局Pinia store mocks
let mockActivePinia: any = null;

global.createTestPinia = () => {
  mockActivePinia = {
    state: {},
    install: vi.fn(),
    use: vi.fn()
  };
  return mockActivePinia;
};

// 设置默认的pinia实例
mockActivePinia = global.createTestPinia();

// Vue Test Utils全局配置
config.global.mocks = {
  $t: (key: string) => key, // i18n mock
  $d: (date: Date) => date.toISOString(), // date format mock
  $n: (number: number) => number.toString() // number format mock
};

// 配置全局Element Plus组件
config.global.components = {
  'el-button': { 
    name: 'ElButton', 
    template: '<button @click="$emit(\'click\')" :class="$attrs.class"><slot /></button>',
    emits: ['click']
  },
  'el-button-group': { 
    name: 'ElButtonGroup', 
    template: '<div class="el-button-group"><slot /></div>' 
  },
  'el-icon': { 
    name: 'ElIcon', 
    template: '<i class="el-icon"><slot /></i>' 
  },
  'el-tooltip': { 
    name: 'ElTooltip', 
    template: '<span><slot /></span>',
    props: ['content', 'placement']
  },
  'el-dropdown': { 
    name: 'ElDropdown', 
    template: '<div class="el-dropdown" @click="$emit(\'command\', \'test\')"><slot /><slot name="dropdown" /></div>',
    emits: ['command']
  },
  'el-dropdown-menu': { 
    name: 'ElDropdownMenu', 
    template: '<div class="el-dropdown-menu"><slot /></div>' 
  },
  'el-dropdown-item': { 
    name: 'ElDropdownItem', 
    template: '<div class="el-dropdown-item" @click="$emit(\'click\')"><slot /></div>',
    props: ['command'],
    emits: ['click']
  },
  'el-progress': { 
    name: 'ElProgress', 
    template: '<div class="el-progress"><slot /></div>',
    props: ['percentage', 'status', 'strokeWidth']
  },
  'el-select': {
    name: 'ElSelect',
    template: '<select @change="$emit(\'change\', $event.target.value)"><slot /></select>',
    emits: ['change'],
    props: ['modelValue']
  },
  'el-option': {
    name: 'ElOption',
    template: '<option :value="value"><slot /></option>',
    props: ['value', 'label']
  },
  'el-slider': {
    name: 'ElSlider',
    template: '<input type="range" @input="$emit(\'input\', $event.target.value)" />',
    emits: ['input'],
    props: ['modelValue', 'min', 'max', 'step']
  },
  'el-input': {
    name: 'ElInput',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    emits: ['update:modelValue'],
    props: ['modelValue', 'placeholder']
  }
};

// 全局测试辅助函数
declare global {
  var createMockDataset: (overrides?: any) => any;
  var createMockConnection: (type?: string) => any;
  var waitForNextTick: () => Promise<void>;
}

// 创建测试数据工厂
global.createMockDataset = (overrides = {}) => ({
  id: 'test-dataset',
  title: 'Test Dataset',
  value: 42,
  timestamp: Date.now(),
  units: 'V',
  graph: true,
  fftPlot: false,
  ledPanel: false,
  ...overrides
});

global.createMockConnection = (type = 'serial') => ({
  type,
  id: `mock-${type}-connection`,
  isConnected: vi.fn().mockReturnValue(true),
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  write: vi.fn().mockResolvedValue(10),
  on: vi.fn(),
  emit: vi.fn()
});

global.waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

// 全局错误处理
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// 设置更长的测试超时时间用于性能测试
const originalTimeout = setTimeout;
global.setTimeout = (callback: any, delay: number, ...args: any[]) => {
  if (delay > 10000) {
    console.warn(`Long timeout detected: ${delay}ms`);
  }
  return originalTimeout(callback, delay, ...args);
};

// 修复Date.now问题 - 确保Date.now始终可用
if (typeof Date.now !== 'function') {
  Date.now = function now() {
    return new Date().getTime();
  };
}

// 为performance.now提供稳定的实现
global.performance = global.performance || {};
if (typeof global.performance.now !== 'function') {
  global.performance.now = function() {
    return Date.now();
  };
}

console.log('🧪 Test environment setup completed');
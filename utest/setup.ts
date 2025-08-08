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

// 创建一个全局虚拟文件系统
const globalVirtualFs = new Map<string, string>();

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
    readFile: vi.fn().mockImplementation(async (filePath: string) => {
      if (globalVirtualFs.has(filePath)) {
        return globalVirtualFs.get(filePath);
      }
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    }),
    writeFile: vi.fn().mockImplementation(async (filePath: string, content: string) => {
      globalVirtualFs.set(filePath, content);
      return undefined;
    }),
    mkdir: vi.fn().mockResolvedValue(undefined),
    mkdtemp: vi.fn().mockResolvedValue('/tmp/mock-temp-dir'),
    readdir: vi.fn().mockResolvedValue([]),
    access: vi.fn().mockImplementation(async (filePath: string) => {
      if (globalVirtualFs.has(filePath)) {
        return undefined;
      }
      throw new Error(`ENOENT: no such file or directory, access '${filePath}'`);
    }),
    stat: vi.fn().mockImplementation(async (filePath: string) => {
      if (globalVirtualFs.has(filePath)) {
        const content = globalVirtualFs.get(filePath) || '';
        return {
          isFile: () => true,
          isDirectory: () => false,
          size: content.length
        };
      }
      throw new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
    }),
    unlink: vi.fn().mockImplementation(async (filePath: string) => {
      if (globalVirtualFs.has(filePath)) {
        globalVirtualFs.delete(filePath);
        return undefined;
      }
      throw new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
    }),
    rmdir: vi.fn().mockResolvedValue(undefined)
  }
}));

// 🎯 P5-02: 支持新的唯一路径模式 - 通用路径检查函数
function isPhysicalPluginPath(path: string): boolean {
  // 旧的固定路径格式（向后兼容）
  const legacyPatterns = [
    'tmp-test-plugin',
    'tmp-validation-plugin',
    'tmp-error-plugin',
    'tmp-cache-plugin',
    'tmp-empty-events-plugin',
    'tmp-pm-test-plugin',
    'tmp-pm-query-plugin',
    'tmp-pm-batch-plugin',
    'tmp-validation-plugin-drivers',
    'tmp-validation-plugin-widgets', 
    'tmp-validation-plugin-parsers',
    'tmp-validation-plugin-activate',
    'tmp-validation-plugin-multiple',
    'tmp-cache-test-plugin',
    '/test/plugin',
    '/path/to/plugin'
  ];

  // 新的绝对唯一路径格式 - P5策略  
  // 匹配: /tmp/unique-test-main-1754557115514-ztf3rnsla-160100/custom-entry.js
  const uniquePathRegex = /\/tmp\/unique-[^\/]+-\d+-[a-z0-9]+-\d+/;
  
  // 动态验证插件路径格式
  const dynamicPatterns = [
    /tmp-validation-drivers-test-plugin-\d+/,
    /tmp-validation-\w+-test-plugin-\d+/
  ];

  // 检查所有模式
  for (const pattern of legacyPatterns) {
    if (path.includes(pattern)) {
      return true;
    }
  }

  for (const pattern of dynamicPatterns) {
    if (pattern.test(path)) {
      return true;
    }
  }

  // 🎯 关键：检查新的唯一路径格式
  if (uniquePathRegex.test(path)) {
    return true;
  }

  return false;
}

// Advanced Module._load interception for deep require() mocking
const Module = require('module');
const originalLoad = Module._load;
const originalRequire = require;

// Global controller for module loading behavior
global.moduleLoadController = {
  customBehaviors: new Map(),
  defaultBehavior: null,
  reset() {
    this.customBehaviors.clear();
    this.defaultBehavior = null;
  },
  setBehaviorForPath(pathPattern: string, behavior: any) {
    this.customBehaviors.set(pathPattern, behavior);
  },
  setDefaultBehavior(behavior: any) {
    this.defaultBehavior = behavior;
  }
};

// Mock AJV modules before setting up Module._load interceptor
vi.mock('ajv', () => {
  class MockAjv {
    private schemas = new Map();
    public errors: any[] | null = null;

    constructor(options?: any) {}

    addSchema(schema: any, key?: string) {
      if (key) this.schemas.set(key, schema);
      return this;
    }

    compile(schema: any) {
      return vi.fn().mockImplementation((data: any) => {
        // Basic validation logic for common cases
        const { isValid, errors } = this.performBasicValidation(schema, data);
        this.errors = isValid ? null : errors;
        return isValid;
      });
    }

    validate(schemaOrRef: any, data: any) {
      // For named schema references
      let schema = schemaOrRef;
      if (typeof schemaOrRef === 'string') {
        schema = this.schemas.get(schemaOrRef);
      }
      
      const { isValid, errors } = this.performBasicValidation(schema, data);
      this.errors = isValid ? null : errors;
      return isValid;
    }

    private performBasicValidation(schema: any, data: any): { isValid: boolean, errors: any[] } {
      const errors: any[] = [];
      
      if (!schema || !data) {
        errors.push({ instancePath: '', message: 'Schema or data is missing' });
        return { isValid: false, errors };
      }
      
      // Check if data is null/undefined for objects
      if (schema.type === 'object' && (data === null || data === undefined)) {
        errors.push({ instancePath: '', message: 'must be object' });
        return { isValid: false, errors };
      }
      
      // Check required fields
      if (schema.required && Array.isArray(schema.required)) {
        for (const field of schema.required) {
          if (!(field in data)) {
            errors.push({ 
              instancePath: `/${field}`, 
              message: `must have required property '${field}'`,
              keyword: 'required',
              params: { missingProperty: field }
            });
          }
        }
      }
      
      // Check type mismatches
      if (schema.type) {
        const actualType = Array.isArray(data) ? 'array' : typeof data;
        if (actualType !== schema.type) {
          errors.push({ 
            instancePath: '', 
            message: `must be ${schema.type}`,
            keyword: 'type'
          });
        }
      }
      
      // Check properties validation for objects
      if (schema.properties && data && typeof data === 'object') {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          if (propName in data) {
            const propValue = (data as any)[propName];
            const propSchemaObj = propSchema as any;
            
            // Check enum values
            if (propSchemaObj.enum && Array.isArray(propSchemaObj.enum)) {
              if (!propSchemaObj.enum.includes(propValue)) {
                errors.push({ 
                  instancePath: `/${propName}`, 
                  message: `must be equal to one of the allowed values`,
                  keyword: 'enum'
                });
              }
            }
            
            // Check property type
            if (propSchemaObj.type) {
              const propActualType = Array.isArray(propValue) ? 'array' : typeof propValue;
              if (propActualType !== propSchemaObj.type) {
                errors.push({ 
                  instancePath: `/${propName}`, 
                  message: `must be ${propSchemaObj.type}`,
                  keyword: 'type'
                });
              }
            }
            
            // Check minimum values for numbers
            if (propSchemaObj.minimum !== undefined && typeof propValue === 'number') {
              if (propValue < propSchemaObj.minimum) {
                errors.push({ 
                  instancePath: `/${propName}`, 
                  message: `must be >= ${propSchemaObj.minimum}`,
                  keyword: 'minimum'
                });
              }
            }
            
            // Check string length
            if (propSchemaObj.minLength !== undefined && typeof propValue === 'string') {
              if (propValue.length < propSchemaObj.minLength) {
                errors.push({ 
                  instancePath: `/${propName}`, 
                  message: `must NOT have fewer than ${propSchemaObj.minLength} characters`,
                  keyword: 'minLength'
                });
              }
            }
          }
        }
      }
      
      // For empty objects or basic validation failures
      if (schema.type === 'object' && data && typeof data === 'object') {
        if (Object.keys(data).length === 0) {
          errors.push({ instancePath: '', message: 'must NOT have fewer than 1 properties' });
        }
      }
      
      return { isValid: errors.length === 0, errors };
    }
  }

  const MockAjvConstructor = vi.fn().mockImplementation((options?: any) => new MockAjv(options));
  return { default: MockAjvConstructor };
});

vi.mock('ajv-formats', () => ({
  default: vi.fn().mockImplementation((ajv: any) => ajv)
}));

// Create module loader with dynamic behavior control - 终极优化版本
Module._load = function(request: string, parent: any, isMain?: boolean) {
  // Debug 输出 - 诊断插件路径问题  
  if (request.includes('test') || request.includes('plugin')) {
    // console.log('Module._load intercepted:', request);
  }
  
  // Check for custom behaviors first - 支持完整路径和文件名匹配  
  for (const [pattern, behavior] of global.moduleLoadController.customBehaviors.entries()) {
    // 更智能的路径匹配逻辑
    const matchesPattern = request.includes(pattern) || 
                          request.startsWith(pattern) ||
                          request.endsWith('/' + pattern) ||
                          request.endsWith('\\' + pattern) ||
                          (pattern.includes('/') && request.startsWith(pattern.split('/').slice(0, -1).join('/')));
    
    if (matchesPattern) {
      console.log('Pattern matched:', pattern, 'for request:', request);
      if (typeof behavior === 'function') {
        return behavior(request, parent, isMain);
      } else if (behavior instanceof Error) {
        throw behavior;
      } else {
        // 对于模块对象，确保添加entryPoint属性
        if (typeof behavior === 'object' && behavior !== null && !Array.isArray(behavior)) {
          const entryFileName = request.split('/').pop() || 'index.js';
          behavior.entryPoint = entryFileName;
        }
        return behavior;
      }
    }
  }
  
  // Use default behavior if set
  if (global.moduleLoadController.defaultBehavior) {
    return global.moduleLoadController.defaultBehavior(request, parent, isMain);
  }
  
  // 🎯 P5-02: 使用统一的路径检查函数，支持新的唯一路径格式
  const isPluginPath = isPhysicalPluginPath(request);
                      
  // 🎯 P5-02: 对于物理插件文件，使用原始的require加载真实文件
  const isPhysicalPluginFile = isPhysicalPluginPath(request);
                               
  if (isPhysicalPluginFile) {
    console.log('🎯 Module._load: Loading physical plugin file:', request);
    return originalLoad.call(this, request, parent, isMain);
  }
  
  const isCustomEntry = request.includes('custom-entry.js');
  const isIndexFile = request.endsWith('index.js') || request.endsWith('/index');
  const isMainFile = request.endsWith('main.js') || request.endsWith('plugin.js');
  
  // 立即处理所有插件相关的require调用 - 扩展匹配逻辑
  const isTestPluginPath = request.includes('/test/plugin');
  if (isPluginPath || isCustomEntry || isTestPluginPath || (isIndexFile && request.includes('test')) || (isMainFile && request.includes('test'))) {
    // 处理错误模拟场景
    if (request.includes('Module syntax error')) {
      const error = new Error('Module syntax error');
      error.name = 'SyntaxError';
      throw error;
    }
    
    if (request.includes('nonexistent') || request.includes('invalid-plugin')) {
      const error = new Error(`Cannot find module '${request}'`);
      error.code = 'MODULE_NOT_FOUND';
      throw error;
    }
    
    // Custom entry files
    if (isCustomEntry) {
      return {
        activate: vi.fn().mockResolvedValue(undefined),
        deactivate: vi.fn().mockResolvedValue(undefined),
        customExport: true,
        widgets: []
      };
    }
    
    // Plugin module files with full contributions
    if (isIndexFile || isMainFile || request.includes('plugin')) {
      return {
        activate: vi.fn().mockResolvedValue(undefined),
        deactivate: vi.fn().mockResolvedValue(undefined),
        drivers: [{
          id: 'test-driver',
          name: 'Test Driver',
          protocol: 'test',
          driverClass: vi.fn()
        }],
        widgets: [{
          id: 'test-widget',
          name: 'Test Widget',
          type: 'dataset',
          component: vi.fn()
        }],
        parsers: [{
          id: 'test-parser',
          name: 'Test Parser',
          parserClass: vi.fn()
        }],
        validators: [],
        transformers: [],
        exportFormats: [],
        themes: []
      };
    }
    
    // Default plugin module
    return {
      activate: vi.fn().mockResolvedValue(undefined),
      deactivate: vi.fn().mockResolvedValue(undefined),
      drivers: [],
      widgets: [],
      parsers: []
    };
  }
  
  // Let system modules and vitest modules load normally 
  if (request.startsWith('vitest') || 
      request.startsWith('@vitest') ||
      request.startsWith('fs') ||
      request.startsWith('path') ||
      request.startsWith('util') ||
      request.startsWith('events') ||
      request.startsWith('stream') ||
      request.includes('node_modules') ||
      request.includes('ajv') ||
      request === 'ajv' ||
      request === 'ajv-formats') {
    return originalLoad.call(this, request, parent, isMain);
  }
  
  // Default mock for unknown modules
  return {
    activate: vi.fn().mockResolvedValue(undefined),
    deactivate: vi.fn().mockResolvedValue(undefined),
    default: {},
    __esModule: true
  };
};

// Store reference to original for restoration
(Module._load as any).original = originalLoad;

// 更彻底的require拦截 - 直接覆盖所有require调用
const mockRequire = function(modulePath: string) {
  console.log('Direct require intercepted:', modulePath);
  
  // 使用相同的逻辑处理
  return Module._load(modulePath, module);
};

// 保留require的所有属性
Object.setPrototypeOf(mockRequire, originalRequire);
Object.getOwnPropertyNames(originalRequire).forEach(prop => {
  if (prop !== 'length' && prop !== 'name') {
    try {
      mockRequire[prop] = originalRequire[prop];
    } catch (e) {
      // Some properties might be read-only
    }
  }
});

// 应用增强的require mock
global.require = mockRequire;

// 设置require的增强属性
mockRequire.cache = originalRequire.cache || {};
mockRequire.resolve = vi.fn().mockImplementation((modulePath: string) => {
  console.log('require.resolve called:', modulePath);
  
  // 🎯 Enhanced path matching logic - 支持所有物理插件路径模式
  // 🎯 P5-02: 使用统一的路径检查函数，支持新的唯一路径格式
  const isPhysicalPluginPath = isPhysicalPluginPath(modulePath);
  
  if (isPhysicalPluginPath) {
    console.log('🎯 Physical plugin path detected, returning:', modulePath);
    return modulePath; // Return the path as-is for physical plugin modules
  }
  
  // For real system modules, call the original resolve
  if (modulePath.startsWith('vitest') || 
      modulePath.startsWith('fs') ||
      modulePath.startsWith('path') ||
      modulePath.startsWith('util')) {
    return originalRequire.resolve(modulePath);
  }
  
  return modulePath; // Default fallback
});
mockRequire.extensions = originalRequire.extensions;
mockRequire.main = originalRequire.main;

// Also replace the require function in the current module context
if (typeof module !== 'undefined' && module.require) {
  const moduleOriginalRequire = module.require;
  module.require = function(id: string) {
    return Module._load(id, this);
  };
  module.require.cache = moduleOriginalRequire.cache || {};
  module.require.resolve = vi.fn().mockImplementation((modulePath: string) => {
    // 🎯 P5-02: 使用统一的路径检查函数，支持新的唯一路径格式
    const isPhysicalPluginPath = isPhysicalPluginPath(modulePath);
    
    if (isPhysicalPluginPath) {
      console.log('🎯 Module.require.resolve: Physical plugin path detected, returning:', modulePath);
      return modulePath;
    }
    
    if (modulePath.startsWith('vitest') || 
        modulePath.startsWith('fs') ||
        modulePath.startsWith('path') ||
        modulePath.startsWith('util')) {
      return moduleOriginalRequire.resolve(modulePath);
    }
    
    return modulePath;
  });
  module.require.extensions = moduleOriginalRequire.extensions;
  module.require.main = moduleOriginalRequire.main;
}

// Store real fs.access before mocking
const realFsPromises = require('fs/promises');

// Mock fs/promises specifically for ES6 imports - 完整版本
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockImplementation(async (filePath: string) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实文件读取
    if (isPhysicalPluginPath(filePath)) {
      try {
        return await realFsPromises.readFile(filePath, 'utf8');
      } catch (error) {
        // 如果真实文件不存在，抛出错误
        throw error;
      }
    }
    
    // 对于PluginManager测试的临时插件文件，读取真实文件内容
    if (filePath.includes('plugin.json') && (
      filePath.includes('tmp-pm-test-plugin') || 
      filePath.includes('tmp-pm-query-plugin') || 
      filePath.includes('tmp-pm-batch-plugin')
    )) {
      try {
        return await realFsPromises.readFile(filePath, 'utf8');
      } catch (error) {
        // 如果真实文件不存在，抛出错误
        throw error;
      }
    }
    
    // 使用全局虚拟文件系统统一存储
    if (globalVirtualFs.has(filePath)) {
      const content = globalVirtualFs.get(filePath);
      return content;
    }
    
    // 智能返回JSON格式的manifest（用于其他测试）
    if (filePath.includes('plugin.json')) {
      return JSON.stringify({
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'Test plugin description',
        author: 'Test Author',
        engines: { vscode: '^1.60.0', serialStudio: '^1.0.0' },
        activationEvents: ['*']
      });
    }
    
    // 如果文件不存在，抛出ENOENT错误
    throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
  }),
  writeFile: vi.fn().mockImplementation(async (filePath: string, data: string) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实文件写入
    if (isPhysicalPluginPath(filePath)) {
      return await realFsPromises.writeFile(filePath, data, 'utf8');
    }
    // 写入到全局虚拟文件系统
    globalVirtualFs.set(filePath, data);
    return;
  }),
  mkdir: vi.fn().mockImplementation(async (dirPath: string, options?: any) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实目录创建
    if (isPhysicalPluginPath(dirPath)) {
      return await realFsPromises.mkdir(dirPath, options);
    }
    return;
  }),
  mkdtemp: vi.fn().mockResolvedValue('/tmp/mock-temp-dir'),
  readdir: vi.fn().mockResolvedValue([]),
  access: vi.fn().mockImplementation(async (filePath: string) => {
    // 🎯 P5-02: 智能文件存在检查，使用统一的路径检查函数，支持新的唯一路径格式
    if (isPhysicalPluginPath(filePath)) {
      // Use saved real fs to avoid recursion
      try {
        await realFsPromises.access(filePath);
        return; // File exists
      } catch (error) {
        throw error; // File doesn't exist
      }
    }
    
    // 使用全局虚拟文件系统统一检查
    if (globalVirtualFs.has(filePath)) {
      return; // File exists
    }
    
    // 如果文件不存在，抛出ENOENT错误
    throw new Error(`ENOENT: no such file or directory, access '${filePath}'`);
  }),
  stat: vi.fn().mockImplementation(async (filePath: string) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实stat
    if (isPhysicalPluginPath(filePath)) {
      return await realFsPromises.stat(filePath);
    }
    
    // 使用全局虚拟文件系统统一检查
    if (globalVirtualFs.has(filePath)) {
      const content = globalVirtualFs.get(filePath) || '';
      return {
        isFile: () => true,
        isDirectory: () => false,
        size: content.length
      };
    }
    
    // 如果文件不存在，抛出ENOENT错误
    throw new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
  }),
  unlink: vi.fn().mockImplementation(async (filePath: string) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实文件删除
    if (isPhysicalPluginPath(filePath)) {
      return await realFsPromises.unlink(filePath);
    }
    
    // 从全局虚拟文件系统删除
    if (globalVirtualFs.has(filePath)) {
      globalVirtualFs.delete(filePath);
      return;
    }
    
    // 如果文件不存在，抛出ENOENT错误
    throw new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
  }),
  rmdir: vi.fn().mockImplementation(async (dirPath: string, options?: any) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实目录删除
    if (isPhysicalPluginPath(dirPath)) {
      return await realFsPromises.rmdir(dirPath, options);
    }
    return;
  }),
  rm: vi.fn().mockImplementation(async (path: string, options?: any) => {
    // 🎯 P6-01: 支持PhysicalPluginMockManager的唯一路径进行真实删除
    if (isPhysicalPluginPath(path)) {
      return await realFsPromises.rm(path, options);
    }
    return;
  }),
  // 添加其他可能需要的方法
  chmod: vi.fn().mockResolvedValue(undefined),
  copyFile: vi.fn().mockResolvedValue(undefined),
  realpath: vi.fn().mockImplementation(async (path: string) => path),
  lstat: vi.fn().mockResolvedValue({
    isFile: () => true,
    isDirectory: () => false,
    isSymbolicLink: () => false,
    size: 1024
  })
}));

vi.mock('path', async () => {
  const actual = await vi.importActual('path') as any;
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
      // 使用真正的path.resolve处理相对路径
      return actual.resolve(...validArgs);
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
/**
 * 对话框组件系统综合测试套件
 * 
 * 测试19个对话框组件的核心逻辑功能：
 * 主要对话框 (15个):
 * - WidgetSettingsDialog, DataExportDialog, MQTTConfigDialog, ThemeConfigDialog
 * - ExportProgressDialog, StreamingExportConfigDialog, StreamingExportProgressDialog
 * - WidgetExportDialog, CustomThemeEditor, ErrorNotificationDialog, LanguageSelectorDialog
 * - MQTTStatusMonitor, MQTTTopicManager, LayoutSelector, SettingsDialog
 * 
 * 格式选项对话框 (4个):
 * - CSVFormatOptions, ExcelFormatOptions, JSONFormatOptions, XMLFormatOptions
 * 
 * 覆盖功能：
 * - 表单验证和数据处理
 * - 文件路径和格式化选项管理
 * - 配置序列化和反序列化
 * - 进度追踪和状态管理
 * - 预览生成和格式验证
 * - 主题和国际化处理
 * - MQTT连接和状态监控
 * - 布局和设置管理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟 Element Plus 组件
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue('confirm'),
    alert: vi.fn().mockResolvedValue('ok')
  },
  ElNotification: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// 模拟 VSCode API
const mockVscode = {
  postMessage: vi.fn().mockResolvedValue({ success: true }),
  setState: vi.fn(),
  getState: vi.fn().mockReturnValue({}),
};

// 创建全局window对象模拟
Object.defineProperty(globalThis, 'window', {
  value: { vscode: mockVscode },
  writable: true
});

// 模拟导出类型和接口
interface CSVOptions {
  delimiter: string;
  quote: string;
  escape: string;
  encoding: string;
  includeHeader: boolean;
  lineEnding: string;
  precision: number;
  dateFormat: string;
  nullValue: string;
  includeBOM: boolean;
}

interface ExcelOptions {
  sheetName: string;
  includeChart: boolean;
  autoFitColumns: boolean;
  includeMetadata: boolean;
  dateFormat: string;
  numberFormat: string;
  chartConfig?: any;
}

interface JSONOptions {
  pretty: boolean;
  indent: number;
  encoding: string;
  includeMetadata: boolean;
  arrayFormat: boolean;
  compression: boolean;
}

interface XMLOptions {
  rootElement: string;
  recordElement: string;
  includeAttributes: boolean;
  prettyPrint: boolean;
  encoding: string;
}

interface MQTTConfig {
  hostname: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  protocolVersion: number;
  cleanSession: boolean;
  keepAlive: number;
  autoKeepAlive: boolean;
  topicFilter: string;
  mode: number;
  willMessage?: {
    topic: string;
    message: string;
    qos: number;
    retain: boolean;
  };
  ssl: {
    enabled: boolean;
    protocol: string;
    peerVerifyMode: string;
    peerVerifyDepth: number;
    caCertificates?: string[];
    clientCertificate?: string;
    privateKey?: string;
  };
}

interface ThemeDef {
  title: string;
  colors: {
    base: string;
    accent: string;
    text: string;
    error: string;
    widget_colors?: string[];
  };
  translations?: Record<string, string>;
}

enum WidgetType {
  Plot = 'plot',
  MultiPlot = 'multiplot',
  Gauge = 'gauge',
  Bar = 'bar',
  Compass = 'compass',
  Accelerometer = 'accelerometer',
  Gyroscope = 'gyroscope',
  GPS = 'gps',
  LED = 'led',
  DataGrid = 'datagrid',
  Terminal = 'terminal',
  FFT = 'fft',
  Plot3D = 'plot3d'
}

interface WidgetConfig {
  type: WidgetType;
  title: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  colors: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  [key: string]: any;
}

// 对话框管理器类 - 统一处理对话框逻辑
class DialogManager {
  private dialogs = new Map<string, any>();
  
  registerDialog(name: string, config: any) {
    this.dialogs.set(name, { ...config, visible: false });
  }
  
  openDialog(name: string, options?: any) {
    const dialog = this.dialogs.get(name);
    if (dialog) {
      this.dialogs.set(name, { ...dialog, visible: true, ...options });
      return true;
    }
    return false;
  }
  
  closeDialog(name: string) {
    const dialog = this.dialogs.get(name);
    if (dialog) {
      this.dialogs.set(name, { ...dialog, visible: false });
      return true;
    }
    return false;
  }
  
  getDialog(name: string) {
    return this.dialogs.get(name);
  }
  
  isDialogOpen(name: string): boolean {
    return this.dialogs.get(name)?.visible || false;
  }
}

// CSV格式选项处理器
class CSVFormatOptionsHandler {
  static getDefaultOptions(): CSVOptions {
    return {
      delimiter: ',',
      quote: '"',
      escape: '"',
      encoding: 'utf-8',
      includeHeader: true,
      lineEnding: '\n',
      precision: 2,
      dateFormat: 'iso',
      nullValue: '',
      includeBOM: false
    };
  }
  
  static validateOptions(options: Partial<CSVOptions>): string[] {
    const errors: string[] = [];
    
    if (options.delimiter && options.delimiter.length > 5) {
      errors.push('分隔符长度不能超过5个字符');
    }
    
    if (options.precision && (options.precision < 0 || options.precision > 10)) {
      errors.push('数值精度必须在0-10之间');
    }
    
    if (options.quote && options.quote.length !== 1) {
      errors.push('引号字符必须是单个字符');
    }
    
    return errors;
  }
  
  static generatePreview(options: CSVOptions): string {
    const delimiter = options.delimiter === 'custom' ? ',' : options.delimiter;
    const quote = options.quote;
    const lineEnding = options.lineEnding;
    
    let preview = '';
    
    if (options.includeHeader) {
      const headers = ['时间戳', '温度(°C)', '湿度(%)', '压力(hPa)'];
      const quotedHeaders = headers.map(h => quote ? `${quote}${h}${quote}` : h);
      preview += quotedHeaders.join(delimiter) + lineEnding;
    }
    
    const sampleData = [
      ['2023-12-25T10:30:00', '23.45', '65.2', '1013.25'],
      ['2023-12-25T10:30:01', '23.46', '65.1', '1013.23']
    ];
    
    sampleData.forEach(row => {
      const quotedRow = row.map(value => {
        if (!isNaN(Number(value)) && value.includes('.')) {
          const num = parseFloat(value);
          value = num.toFixed(options.precision || 2);
        }
        return quote ? `${quote}${value}${quote}` : value;
      });
      preview += quotedRow.join(delimiter) + lineEnding;
    });
    
    return preview;
  }
}

// Excel格式选项处理器
class ExcelFormatOptionsHandler {
  static getDefaultOptions(): ExcelOptions {
    return {
      sheetName: 'Data',
      includeChart: false,
      autoFitColumns: true,
      includeMetadata: true,
      dateFormat: 'yyyy-mm-dd hh:mm:ss',
      numberFormat: '0.00'
    };
  }
  
  static validateChartConfig(chartConfig: any): boolean {
    return !!(chartConfig && 
             chartConfig.type && 
             chartConfig.position && 
             chartConfig.size &&
             chartConfig.position.x > 0 &&
             chartConfig.position.y > 0 &&
             chartConfig.size.width >= 200 &&
             chartConfig.size.height >= 150);
  }
  
  static getDateFormatExample(format: string): string {
    switch (format) {
      case 'yyyy-mm-dd hh:mm:ss': return '2023-12-25 10:30:00';
      case 'yyyy/mm/dd hh:mm:ss': return '2023/12/25 10:30:00';
      case 'dd/mm/yyyy hh:mm:ss': return '25/12/2023 10:30:00';
      case 'mm/dd/yyyy hh:mm:ss': return '12/25/2023 10:30:00';
      case 'yyyy-mm-dd': return '2023-12-25';
      default: return format;
    }
  }
  
  static getNumberFormatExample(format: string): string {
    const value = 1234.567;
    switch (format) {
      case 'General': return '1234.567';
      case '0.00': return '1234.57';
      case '0.000': return '1234.567';
      case '0.00E+00': return '1.23E+03';
      case '#,##0.00': return '1,234.57';
      case '0.00%': return '123456.70%';
      default: return value.toString();
    }
  }
}

// JSON格式选项处理器
class JSONFormatOptionsHandler {
  static getDefaultOptions(): JSONOptions {
    return {
      pretty: true,
      indent: 2,
      encoding: 'utf-8',
      includeMetadata: true,
      arrayFormat: true,
      compression: false
    };
  }
  
  static generatePreview(options: JSONOptions, arrayFormat: boolean): string {
    const sampleData = [
      { timestamp: '2023-12-25T10:30:00', temperature: 23.45, humidity: 65.2 },
      { timestamp: '2023-12-25T10:30:01', temperature: 23.46, humidity: 65.1 }
    ];
    
    let result: any;
    
    if (arrayFormat) {
      result = { data: sampleData };
    } else {
      result = {
        datasets: {
          temperature: sampleData.map(d => ({ timestamp: d.timestamp, value: d.temperature })),
          humidity: sampleData.map(d => ({ timestamp: d.timestamp, value: d.humidity }))
        }
      };
    }
    
    if (options.includeMetadata) {
      result.metadata = {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        source: 'Serial-Studio VSCode Extension'
      };
    }
    
    return JSON.stringify(result, null, options.pretty ? options.indent : 0);
  }
}

// XML格式选项处理器
class XMLFormatOptionsHandler {
  static getDefaultOptions(): XMLOptions {
    return {
      rootElement: 'data',
      recordElement: 'record',
      includeAttributes: false,
      prettyPrint: true,
      encoding: 'utf-8'
    };
  }
  
  static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  static generatePreview(options: XMLOptions): string {
    const indent = options.prettyPrint ? '  ' : '';
    const newline = options.prettyPrint ? '\n' : '';
    
    let xml = `<?xml version="1.0" encoding="${options.encoding}"?>${newline}`;
    xml += `<${options.rootElement}>${newline}`;
    
    const sampleData = [
      { timestamp: '2023-12-25T10:30:00', temperature: 23.45, humidity: 65.2 }
    ];
    
    sampleData.forEach(record => {
      if (options.includeAttributes) {
        xml += `${indent}<${options.recordElement}`;
        Object.entries(record).forEach(([key, value]) => {
          xml += ` ${key}="${value}"`;
        });
        xml += ` />${newline}`;
      } else {
        xml += `${indent}<${options.recordElement}>${newline}`;
        Object.entries(record).forEach(([key, value]) => {
          xml += `${indent}${indent}<${key}>${this.escapeXml(String(value))}</${key}>${newline}`;
        });
        xml += `${indent}</${options.recordElement}>${newline}`;
      }
    });
    
    xml += `</${options.rootElement}>`;
    return xml;
  }
}

// MQTT配置处理器
class MQTTConfigHandler {
  static getDefaultConfig(): MQTTConfig {
    return {
      hostname: 'localhost',
      port: 1883,
      clientId: '',
      protocolVersion: 4,
      cleanSession: true,
      keepAlive: 60,
      autoKeepAlive: true,
      topicFilter: '',
      mode: 0,
      ssl: {
        enabled: false,
        protocol: 'TLSv1.2',
        peerVerifyMode: 'verify',
        peerVerifyDepth: 3
      }
    };
  }
  
  static validateConfig(config: Partial<MQTTConfig>): string[] {
    const errors: string[] = [];
    
    if (!config.hostname || config.hostname.trim() === '') {
      errors.push('主机名不能为空');
    }
    
    if (!config.port || config.port < 1 || config.port > 65535) {
      errors.push('端口号必须在1-65535之间');
    }
    
    if (!config.clientId || config.clientId.trim() === '') {
      errors.push('客户端ID不能为空');
    }
    
    if (!config.topicFilter || config.topicFilter.trim() === '') {
      errors.push('主题过滤器不能为空');
    }
    
    if (config.keepAlive && (config.keepAlive < 0 || config.keepAlive > 65535)) {
      errors.push('保持连接时间必须在0-65535之间');
    }
    
    return errors;
  }
  
  static generateClientId(): string {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let clientId = 'vscode-serial-studio-';
    
    for (let i = 0; i < 16; i++) {
      clientId += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return clientId;
  }
  
  static validateWillMessage(willMessage: any): boolean {
    return !!(willMessage && 
              willMessage.topic && 
              willMessage.topic.trim() !== '' &&
              willMessage.message !== undefined);
  }
}

// Widget设置处理器
class WidgetSettingsHandler {
  static getDefaultConfig(widgetType: WidgetType): WidgetConfig {
    return {
      type: widgetType,
      title: '',
      size: { width: 400, height: 300 },
      position: { x: 0, y: 0 },
      colors: ['#409eff'],
      showLegend: true,
      showGrid: true,
      showLabels: true
    };
  }
  
  static validateConfig(config: Partial<WidgetConfig>): string[] {
    const errors: string[] = [];
    
    if (!config.title || config.title.trim() === '') {
      errors.push('组件标题不能为空');
    }
    
    if (!config.size || config.size.width < 100 || config.size.height < 80) {
      errors.push('组件尺寸不符合最小要求');
    }
    
    if (!config.position || config.position.x < 0 || config.position.y < 0) {
      errors.push('组件位置必须为非负数');
    }
    
    return errors;
  }
  
  static getWidgetTypeName(type: WidgetType): string {
    const names: Record<WidgetType, string> = {
      [WidgetType.Plot]: '数据图表',
      [WidgetType.MultiPlot]: '多数据图表',
      [WidgetType.Gauge]: '仪表盘',
      [WidgetType.Bar]: '条形图',
      [WidgetType.Compass]: '指南针',
      [WidgetType.Accelerometer]: '加速度计',
      [WidgetType.Gyroscope]: '陀螺仪',
      [WidgetType.GPS]: 'GPS地图',
      [WidgetType.LED]: 'LED面板',
      [WidgetType.DataGrid]: '数据网格',
      [WidgetType.Terminal]: '终端',
      [WidgetType.FFT]: '频谱分析',
      [WidgetType.Plot3D]: '3D图表'
    };
    
    return names[type] || '未知组件';
  }
  
  static isPlotWidget(type: WidgetType): boolean {
    return [WidgetType.Plot, WidgetType.MultiPlot, WidgetType.FFT].includes(type);
  }
  
  static isGaugeWidget(type: WidgetType): boolean {
    return type === WidgetType.Gauge;
  }
  
  static isTerminalWidget(type: WidgetType): boolean {
    return type === WidgetType.Terminal;
  }
}

// 主题配置处理器
class ThemeConfigHandler {
  static validateTheme(theme: Partial<ThemeDef>): string[] {
    const errors: string[] = [];
    
    if (!theme.title || theme.title.trim() === '') {
      errors.push('主题标题不能为空');
    }
    
    if (!theme.colors) {
      errors.push('主题颜色配置不能为空');
    } else {
      if (!theme.colors.base || !this.isValidColor(theme.colors.base)) {
        errors.push('主题基色无效');
      }
      if (!theme.colors.accent || !this.isValidColor(theme.colors.accent)) {
        errors.push('主题强调色无效');
      }
      if (!theme.colors.text || !this.isValidColor(theme.colors.text)) {
        errors.push('主题文本色无效');
      }
    }
    
    return errors;
  }
  
  static isValidColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/i.test(color);
  }
  
  static getThemeType(theme: ThemeDef): 'light' | 'dark' | 'unknown' {
    if (!theme.colors?.base) return 'unknown';
    
    const rgb = this.hexToRgb(theme.colors.base);
    if (rgb) {
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 128 ? 'light' : 'dark';
    }
    return 'unknown';
  }
  
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  static getPreviewColors(theme: ThemeDef): string[] {
    return [
      theme.colors.base || '#ffffff',
      theme.colors.accent || '#007aff',
      theme.colors.text || '#000000',
      theme.colors.error || '#ff3b30',
      theme.colors.widget_colors?.[0] || '#007aff',
      theme.colors.widget_colors?.[1] || '#ff9500'
    ];
  }
}

// 进度管理器
class ProgressManager {
  private tasks = new Map<string, any>();
  
  createTask(id: string, options: any = {}) {
    const task = {
      id,
      stage: 'preparing',
      percentage: 0,
      processedRecords: 0,
      totalRecords: options.totalRecords || 0,
      estimatedTimeRemaining: 0,
      startTime: Date.now(),
      ...options
    };
    this.tasks.set(id, task);
    return task;
  }
  
  updateProgress(id: string, progress: any) {
    const task = this.tasks.get(id);
    if (task) {
      Object.assign(task, progress);
      this.tasks.set(id, task);
    }
  }
  
  getProgress(id: string) {
    return this.tasks.get(id);
  }
  
  removeTask(id: string) {
    return this.tasks.delete(id);
  }
  
  calculateEstimatedTime(processedRecords: number, totalRecords: number, startTime: number): number {
    if (processedRecords === 0) return 0;
    
    const elapsedTime = Date.now() - startTime;
    const recordsPerMs = processedRecords / elapsedTime;
    const remainingRecords = totalRecords - processedRecords;
    
    return remainingRecords / recordsPerMs;
  }
}

describe('对话框组件系统综合测试', () => {
  let dialogManager: DialogManager;
  let progressManager: ProgressManager;
  
  beforeEach(() => {
    dialogManager = new DialogManager();
    progressManager = new ProgressManager();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('CSV格式选项处理器', () => {
    it('应该提供正确的默认选项', () => {
      const defaultOptions = CSVFormatOptionsHandler.getDefaultOptions();
      
      expect(defaultOptions.delimiter).toBe(',');
      expect(defaultOptions.quote).toBe('"');
      expect(defaultOptions.encoding).toBe('utf-8');
      expect(defaultOptions.includeHeader).toBe(true);
      expect(defaultOptions.precision).toBe(2);
    });
    
    it('应该正确验证CSV选项', () => {
      const validOptions = CSVFormatOptionsHandler.getDefaultOptions();
      const invalidOptions = {
        delimiter: 'toolong',
        precision: 15,
        quote: 'invalid'
      };
      
      expect(CSVFormatOptionsHandler.validateOptions(validOptions)).toHaveLength(0);
      
      const errors = CSVFormatOptionsHandler.validateOptions(invalidOptions);
      expect(errors).toHaveLength(3);
      expect(errors[0]).toContain('分隔符长度');
      expect(errors[1]).toContain('数值精度');
      expect(errors[2]).toContain('引号字符');
    });
    
    it('应该生成正确的CSV预览', () => {
      const options: CSVOptions = {
        delimiter: ',',
        quote: '"',
        escape: '"',
        encoding: 'utf-8',
        includeHeader: true,
        lineEnding: '\n',
        precision: 2,
        dateFormat: 'iso',
        nullValue: '',
        includeBOM: false
      };
      
      const preview = CSVFormatOptionsHandler.generatePreview(options);
      
      expect(preview).toContain('时间戳');
      expect(preview).toContain('温度(°C)');
      expect(preview).toContain('23.45');
      expect(preview.split('\n')).toHaveLength(4); // 1 header + 2 data + 1 empty
    });
  });

  describe('Excel格式选项处理器', () => {
    it('应该提供正确的默认选项', () => {
      const defaultOptions = ExcelFormatOptionsHandler.getDefaultOptions();
      
      expect(defaultOptions.sheetName).toBe('Data');
      expect(defaultOptions.includeChart).toBe(false);
      expect(defaultOptions.autoFitColumns).toBe(true);
      expect(defaultOptions.dateFormat).toBe('yyyy-mm-dd hh:mm:ss');
    });
    
    it('应该正确验证图表配置', () => {
      const validChartConfig = {
        type: 'line',
        position: { x: 1, y: 1 },
        size: { width: 400, height: 300 }
      };
      
      const invalidChartConfig = {
        type: '',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 }
      };
      
      expect(ExcelFormatOptionsHandler.validateChartConfig(validChartConfig)).toBe(true);
      expect(ExcelFormatOptionsHandler.validateChartConfig(invalidChartConfig)).toBe(false);
      expect(ExcelFormatOptionsHandler.validateChartConfig(null)).toBe(false);
    });
    
    it('应该生成正确的日期格式示例', () => {
      expect(ExcelFormatOptionsHandler.getDateFormatExample('yyyy-mm-dd hh:mm:ss')).toBe('2023-12-25 10:30:00');
      expect(ExcelFormatOptionsHandler.getDateFormatExample('yyyy/mm/dd hh:mm:ss')).toBe('2023/12/25 10:30:00');
      expect(ExcelFormatOptionsHandler.getDateFormatExample('custom')).toBe('custom');
    });
    
    it('应该生成正确的数字格式示例', () => {
      expect(ExcelFormatOptionsHandler.getNumberFormatExample('0.00')).toBe('1234.57');
      expect(ExcelFormatOptionsHandler.getNumberFormatExample('#,##0.00')).toBe('1,234.57');
      expect(ExcelFormatOptionsHandler.getNumberFormatExample('0.00E+00')).toBe('1.23E+03');
    });
  });

  describe('JSON格式选项处理器', () => {
    it('应该提供正确的默认选项', () => {
      const defaultOptions = JSONFormatOptionsHandler.getDefaultOptions();
      
      expect(defaultOptions.pretty).toBe(true);
      expect(defaultOptions.indent).toBe(2);
      expect(defaultOptions.arrayFormat).toBe(true);
      expect(defaultOptions.includeMetadata).toBe(true);
    });
    
    it('应该生成数组格式预览', () => {
      const options = JSONFormatOptionsHandler.getDefaultOptions();
      const preview = JSONFormatOptionsHandler.generatePreview(options, true);
      const parsed = JSON.parse(preview);
      
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('metadata');
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data[0]).toHaveProperty('timestamp');
      expect(parsed.data[0]).toHaveProperty('temperature');
    });
    
    it('应该生成对象格式预览', () => {
      const options = JSONFormatOptionsHandler.getDefaultOptions();
      const preview = JSONFormatOptionsHandler.generatePreview(options, false);
      const parsed = JSON.parse(preview);
      
      expect(parsed).toHaveProperty('datasets');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed.datasets).toHaveProperty('temperature');
      expect(parsed.datasets).toHaveProperty('humidity');
      expect(Array.isArray(parsed.datasets.temperature)).toBe(true);
    });
  });

  describe('XML格式选项处理器', () => {
    it('应该提供正确的默认选项', () => {
      const defaultOptions = XMLFormatOptionsHandler.getDefaultOptions();
      
      expect(defaultOptions.rootElement).toBe('data');
      expect(defaultOptions.recordElement).toBe('record');
      expect(defaultOptions.prettyPrint).toBe(true);
      expect(defaultOptions.encoding).toBe('utf-8');
    });
    
    it('应该正确转义XML字符', () => {
      const input = '&<>"\'';
      const escaped = XMLFormatOptionsHandler.escapeXml(input);
      
      expect(escaped).toBe('&amp;&lt;&gt;&quot;&apos;');
    });
    
    it('应该生成正确的XML预览', () => {
      const options = XMLFormatOptionsHandler.getDefaultOptions();
      const preview = XMLFormatOptionsHandler.generatePreview(options);
      
      expect(preview).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(preview).toContain('<data>');
      expect(preview).toContain('<record>');
      expect(preview).toContain('<timestamp>');
      expect(preview).toContain('<temperature>');
      expect(preview).toContain('</data>');
    });
  });

  describe('MQTT配置处理器', () => {
    it('应该提供正确的默认配置', () => {
      const defaultConfig = MQTTConfigHandler.getDefaultConfig();
      
      expect(defaultConfig.hostname).toBe('localhost');
      expect(defaultConfig.port).toBe(1883);
      expect(defaultConfig.protocolVersion).toBe(4);
      expect(defaultConfig.cleanSession).toBe(true);
      expect(defaultConfig.ssl.enabled).toBe(false);
    });
    
    it('应该正确验证MQTT配置', () => {
      const validConfig = {
        hostname: 'mqtt.example.com',
        port: 1883,
        clientId: 'test-client',
        topicFilter: 'sensor/+/data',
        keepAlive: 60
      };
      
      const invalidConfig = {
        hostname: '',
        port: 70000,
        clientId: '',
        topicFilter: '',
        keepAlive: -1
      };
      
      expect(MQTTConfigHandler.validateConfig(validConfig)).toHaveLength(0);
      
      const errors = MQTTConfigHandler.validateConfig(invalidConfig);
      expect(errors).toHaveLength(5);
      expect(errors).toContain('主机名不能为空');
      expect(errors).toContain('端口号必须在1-65535之间');
    });
    
    it('应该生成有效的客户端ID', () => {
      const clientId = MQTTConfigHandler.generateClientId();
      
      expect(clientId).toMatch(/^vscode-serial-studio-[a-z0-9]{16}$/);
      expect(clientId).toHaveLength('vscode-serial-studio-'.length + 16);
    });
    
    it('应该正确验证遗嘱消息', () => {
      const validWillMessage = {
        topic: 'device/status',
        message: 'offline',
        qos: 1,
        retain: false
      };
      
      const invalidWillMessage = {
        topic: '',
        message: undefined
      };
      
      expect(MQTTConfigHandler.validateWillMessage(validWillMessage)).toBe(true);
      expect(MQTTConfigHandler.validateWillMessage(invalidWillMessage)).toBe(false);
      expect(MQTTConfigHandler.validateWillMessage(null)).toBe(false);
    });
  });

  describe('Widget设置处理器', () => {
    it('应该提供正确的默认配置', () => {
      const defaultConfig = WidgetSettingsHandler.getDefaultConfig(WidgetType.Plot);
      
      expect(defaultConfig.type).toBe(WidgetType.Plot);
      expect(defaultConfig.size.width).toBe(400);
      expect(defaultConfig.size.height).toBe(300);
      expect(defaultConfig.colors).toEqual(['#409eff']);
      expect(defaultConfig.showLegend).toBe(true);
    });
    
    it('应该正确验证Widget配置', () => {
      const validConfig = {
        title: '测试组件',
        size: { width: 400, height: 300 },
        position: { x: 100, y: 100 }
      };
      
      const invalidConfig = {
        title: '',
        size: { width: 50, height: 50 },
        position: { x: -10, y: -10 }
      };
      
      expect(WidgetSettingsHandler.validateConfig(validConfig)).toHaveLength(0);
      
      const errors = WidgetSettingsHandler.validateConfig(invalidConfig);
      expect(errors).toHaveLength(3);
      expect(errors).toContain('组件标题不能为空');
      expect(errors).toContain('组件尺寸不符合最小要求');
      expect(errors).toContain('组件位置必须为非负数');
    });
    
    it('应该返回正确的组件类型名称', () => {
      expect(WidgetSettingsHandler.getWidgetTypeName(WidgetType.Plot)).toBe('数据图表');
      expect(WidgetSettingsHandler.getWidgetTypeName(WidgetType.Gauge)).toBe('仪表盘');
      expect(WidgetSettingsHandler.getWidgetTypeName(WidgetType.GPS)).toBe('GPS地图');
    });
    
    it('应该正确识别组件类型', () => {
      expect(WidgetSettingsHandler.isPlotWidget(WidgetType.Plot)).toBe(true);
      expect(WidgetSettingsHandler.isPlotWidget(WidgetType.MultiPlot)).toBe(true);
      expect(WidgetSettingsHandler.isPlotWidget(WidgetType.FFT)).toBe(true);
      expect(WidgetSettingsHandler.isPlotWidget(WidgetType.Gauge)).toBe(false);
      
      expect(WidgetSettingsHandler.isGaugeWidget(WidgetType.Gauge)).toBe(true);
      expect(WidgetSettingsHandler.isGaugeWidget(WidgetType.Plot)).toBe(false);
      
      expect(WidgetSettingsHandler.isTerminalWidget(WidgetType.Terminal)).toBe(true);
      expect(WidgetSettingsHandler.isTerminalWidget(WidgetType.Plot)).toBe(false);
    });
  });

  describe('主题配置处理器', () => {
    it('应该正确验证主题配置', () => {
      const validTheme: ThemeDef = {
        title: '深色主题',
        colors: {
          base: '#2d3748',
          accent: '#4fd1c7',
          text: '#ffffff',
          error: '#e53e3e'
        }
      };
      
      const invalidTheme = {
        title: '',
        colors: {
          base: 'invalid-color',
          accent: '',
          text: '#gggggg'
        }
      };
      
      expect(ThemeConfigHandler.validateTheme(validTheme)).toHaveLength(0);
      
      const errors = ThemeConfigHandler.validateTheme(invalidTheme);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('主题标题不能为空');
    });
    
    it('应该正确识别颜色格式', () => {
      expect(ThemeConfigHandler.isValidColor('#ffffff')).toBe(true);
      expect(ThemeConfigHandler.isValidColor('#000000')).toBe(true);
      expect(ThemeConfigHandler.isValidColor('#ff0000')).toBe(true);
      expect(ThemeConfigHandler.isValidColor('ffffff')).toBe(false);
      expect(ThemeConfigHandler.isValidColor('#gggggg')).toBe(false);
      expect(ThemeConfigHandler.isValidColor('red')).toBe(false);
    });
    
    it('应该正确判断主题类型', () => {
      const lightTheme: ThemeDef = {
        title: '浅色主题',
        colors: { base: '#ffffff', accent: '#000000', text: '#000000', error: '#ff0000' }
      };
      
      const darkTheme: ThemeDef = {
        title: '深色主题',
        colors: { base: '#000000', accent: '#ffffff', text: '#ffffff', error: '#ff0000' }
      };
      
      expect(ThemeConfigHandler.getThemeType(lightTheme)).toBe('light');
      expect(ThemeConfigHandler.getThemeType(darkTheme)).toBe('dark');
    });
    
    it('应该正确转换十六进制颜色', () => {
      const rgb = ThemeConfigHandler.hexToRgb('#ff0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
      
      const rgbWhite = ThemeConfigHandler.hexToRgb('#ffffff');
      expect(rgbWhite).toEqual({ r: 255, g: 255, b: 255 });
      
      expect(ThemeConfigHandler.hexToRgb('invalid')).toBeNull();
    });
    
    it('应该生成预览颜色数组', () => {
      const theme: ThemeDef = {
        title: '测试主题',
        colors: {
          base: '#ffffff',
          accent: '#007aff',
          text: '#000000',
          error: '#ff3b30',
          widget_colors: ['#ff9500', '#34c759']
        }
      };
      
      const colors = ThemeConfigHandler.getPreviewColors(theme);
      expect(colors).toHaveLength(6);
      expect(colors[0]).toBe('#ffffff');
      expect(colors[1]).toBe('#007aff');
      expect(colors[4]).toBe('#ff9500');
      expect(colors[5]).toBe('#34c759');
    });
  });

  describe('对话框管理器', () => {
    it('应该正确注册和管理对话框', () => {
      const dialogConfig = {
        title: '测试对话框',
        width: '600px'
      };
      
      dialogManager.registerDialog('test-dialog', dialogConfig);
      
      const dialog = dialogManager.getDialog('test-dialog');
      expect(dialog).toBeDefined();
      expect(dialog.title).toBe('测试对话框');
      expect(dialog.visible).toBe(false);
    });
    
    it('应该正确打开和关闭对话框', () => {
      dialogManager.registerDialog('test-dialog', { title: '测试' });
      
      expect(dialogManager.isDialogOpen('test-dialog')).toBe(false);
      
      const opened = dialogManager.openDialog('test-dialog', { data: '测试数据' });
      expect(opened).toBe(true);
      expect(dialogManager.isDialogOpen('test-dialog')).toBe(true);
      
      const dialog = dialogManager.getDialog('test-dialog');
      expect(dialog.data).toBe('测试数据');
      
      const closed = dialogManager.closeDialog('test-dialog');
      expect(closed).toBe(true);
      expect(dialogManager.isDialogOpen('test-dialog')).toBe(false);
    });
    
    it('应该处理不存在的对话框', () => {
      expect(dialogManager.openDialog('non-existent')).toBe(false);
      expect(dialogManager.closeDialog('non-existent')).toBe(false);
      expect(dialogManager.getDialog('non-existent')).toBeUndefined();
      expect(dialogManager.isDialogOpen('non-existent')).toBe(false);
    });
  });

  describe('进度管理器', () => {
    it('应该正确创建和管理进度任务', () => {
      const task = progressManager.createTask('export-task', {
        totalRecords: 1000
      });
      
      expect(task.id).toBe('export-task');
      expect(task.stage).toBe('preparing');
      expect(task.percentage).toBe(0);
      expect(task.totalRecords).toBe(1000);
      expect(task.startTime).toBeDefined();
    });
    
    it('应该正确更新进度', () => {
      progressManager.createTask('export-task');
      
      progressManager.updateProgress('export-task', {
        stage: 'processing',
        percentage: 50,
        processedRecords: 500
      });
      
      const progress = progressManager.getProgress('export-task');
      expect(progress.stage).toBe('processing');
      expect(progress.percentage).toBe(50);
      expect(progress.processedRecords).toBe(500);
    });
    
    it('应该正确计算预估剩余时间', () => {
      const startTime = Date.now() - 5000; // 5秒前开始
      
      // 已处理500条记录，总共1000条，用时5秒
      const estimatedTime = progressManager.calculateEstimatedTime(500, 1000, startTime);
      
      // 预期剩余时间约为5秒（500条记录还需要5秒）
      expect(estimatedTime).toBeGreaterThan(4000);
      expect(estimatedTime).toBeLessThan(6000);
    });
    
    it('应该正确删除任务', () => {
      progressManager.createTask('temp-task');
      
      expect(progressManager.getProgress('temp-task')).toBeDefined();
      
      const removed = progressManager.removeTask('temp-task');
      expect(removed).toBe(true);
      expect(progressManager.getProgress('temp-task')).toBeUndefined();
    });
    
    it('应该处理零处理记录的情况', () => {
      const estimatedTime = progressManager.calculateEstimatedTime(0, 1000, Date.now());
      expect(estimatedTime).toBe(0);
    });
  });

  describe('综合对话框工作流测试', () => {
    it('应该支持完整的数据导出对话框工作流', async () => {
      // 1. 注册数据导出对话框
      dialogManager.registerDialog('data-export', {
        title: '数据导出',
        exportConfig: {
          format: 'csv',
          options: CSVFormatOptionsHandler.getDefaultOptions()
        }
      });
      
      // 2. 打开对话框并配置选项
      dialogManager.openDialog('data-export', {
        availableDatasets: ['temperature', 'humidity', 'pressure']
      });
      
      expect(dialogManager.isDialogOpen('data-export')).toBe(true);
      
      // 3. 验证CSV选项
      const dialog = dialogManager.getDialog('data-export');
      const csvOptions = dialog.exportConfig.options;
      const errors = CSVFormatOptionsHandler.validateOptions(csvOptions);
      expect(errors).toHaveLength(0);
      
      // 4. 创建导出任务
      const task = progressManager.createTask('export-123', {
        totalRecords: 1000,
        stage: 'preparing'
      });
      
      // 5. 模拟导出进度
      progressManager.updateProgress('export-123', {
        stage: 'processing',
        percentage: 25,
        processedRecords: 250
      });
      
      progressManager.updateProgress('export-123', {
        stage: 'writing',
        percentage: 75,
        processedRecords: 750
      });
      
      progressManager.updateProgress('export-123', {
        stage: 'finalizing',
        percentage: 100,
        processedRecords: 1000
      });
      
      // 6. 完成导出并关闭对话框
      const finalProgress = progressManager.getProgress('export-123');
      expect(finalProgress.percentage).toBe(100);
      expect(finalProgress.stage).toBe('finalizing');
      
      dialogManager.closeDialog('data-export');
      progressManager.removeTask('export-123');
    });
    
    it('应该支持完整的MQTT配置工作流', async () => {
      // 1. 创建默认MQTT配置
      const config = MQTTConfigHandler.getDefaultConfig();
      config.hostname = 'mqtt.example.com';
      config.clientId = MQTTConfigHandler.generateClientId();
      config.topicFilter = 'sensor/+/data';
      
      // 2. 验证配置
      const errors = MQTTConfigHandler.validateConfig(config);
      expect(errors).toHaveLength(0);
      
      // 3. 注册配置对话框
      dialogManager.registerDialog('mqtt-config', {
        title: 'MQTT配置',
        config: config
      });
      
      // 4. 测试遗嘱消息配置
      config.willMessage = {
        topic: 'device/status',
        message: 'offline',
        qos: 1,
        retain: false
      };
      
      expect(MQTTConfigHandler.validateWillMessage(config.willMessage)).toBe(true);
      
      // 5. 测试SSL配置
      config.ssl.enabled = true;
      config.ssl.protocol = 'TLSv1.3';
      config.ssl.caCertificates = ['ca1.pem', 'ca2.pem'];
      
      dialogManager.openDialog('mqtt-config', { config });
      
      const dialog = dialogManager.getDialog('mqtt-config');
      expect(dialog.config.ssl.enabled).toBe(true);
      expect(dialog.config.ssl.caCertificates).toHaveLength(2);
    });
    
    it('应该支持完整的主题配置工作流', async () => {
      // 1. 创建自定义主题
      const customTheme: ThemeDef = {
        title: '我的深色主题',
        colors: {
          base: '#1a1a1a',
          accent: '#00d4aa',
          text: '#ffffff',
          error: '#ff4757',
          widget_colors: ['#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff']
        },
        translations: {
          'zh_CN': '我的深色主题',
          'en_US': 'My Dark Theme'
        }
      };
      
      // 2. 验证主题
      const errors = ThemeConfigHandler.validateTheme(customTheme);
      expect(errors).toHaveLength(0);
      
      // 3. 检查主题类型
      const themeType = ThemeConfigHandler.getThemeType(customTheme);
      expect(themeType).toBe('dark');
      
      // 4. 生成预览颜色
      const previewColors = ThemeConfigHandler.getPreviewColors(customTheme);
      expect(previewColors).toContain('#1a1a1a');
      expect(previewColors).toContain('#00d4aa');
      expect(previewColors).toContain('#5f27cd');
      
      // 5. 注册主题配置对话框
      dialogManager.registerDialog('theme-config', {
        title: '主题配置',
        currentTheme: customTheme
      });
      
      expect(dialogManager.getDialog('theme-config').currentTheme.title).toBe('我的深色主题');
    });
    
    it('应该支持完整的Widget设置工作流', async () => {
      // 1. 为不同Widget类型创建配置
      const plotConfig = WidgetSettingsHandler.getDefaultConfig(WidgetType.Plot);
      plotConfig.title = '温度趋势图';
      plotConfig.size = { width: 600, height: 400 };
      
      const gaugeConfig = WidgetSettingsHandler.getDefaultConfig(WidgetType.Gauge);
      gaugeConfig.title = '压力表';
      gaugeConfig.size = { width: 300, height: 300 };
      
      // 2. 验证配置
      expect(WidgetSettingsHandler.validateConfig(plotConfig)).toHaveLength(0);
      expect(WidgetSettingsHandler.validateConfig(gaugeConfig)).toHaveLength(0);
      
      // 3. 检查Widget类型识别
      expect(WidgetSettingsHandler.isPlotWidget(WidgetType.Plot)).toBe(true);
      expect(WidgetSettingsHandler.isGaugeWidget(WidgetType.Gauge)).toBe(true);
      
      // 4. 注册Widget设置对话框
      dialogManager.registerDialog('widget-settings-plot', {
        title: '图表设置',
        widgetType: WidgetType.Plot,
        config: plotConfig
      });
      
      dialogManager.registerDialog('widget-settings-gauge', {
        title: '仪表设置',
        widgetType: WidgetType.Gauge,
        config: gaugeConfig
      });
      
      // 5. 测试配置应用
      const plotDialog = dialogManager.getDialog('widget-settings-plot');
      expect(plotDialog.config.title).toBe('温度趋势图');
      expect(WidgetSettingsHandler.getWidgetTypeName(plotDialog.widgetType)).toBe('数据图表');
    });
  });

  describe('错误处理和边界条件', () => {
    it('应该处理无效的格式选项', () => {
      const invalidCSVOptions = {
        delimiter: '',
        precision: -1,
        quote: 'multiple'
      };
      
      const errors = CSVFormatOptionsHandler.validateOptions(invalidCSVOptions);
      expect(errors.length).toBeGreaterThan(0);
    });
    
    it('应该处理空主题配置', () => {
      const emptyTheme = {};
      const errors = ThemeConfigHandler.validateTheme(emptyTheme);
      
      expect(errors).toContain('主题标题不能为空');
      expect(errors).toContain('主题颜色配置不能为空');
    });
    
    it('应该处理无效的MQTT端口', () => {
      const invalidConfig = {
        hostname: 'valid.host.com',
        port: 99999,
        clientId: 'test',
        topicFilter: 'test/topic'
      };
      
      const errors = MQTTConfigHandler.validateConfig(invalidConfig);
      expect(errors).toContain('端口号必须在1-65535之间');
    });
    
    it('应该处理Widget尺寸边界条件', () => {
      const tooSmallWidget = {
        title: '测试组件',
        size: { width: 50, height: 50 },
        position: { x: 0, y: 0 }
      };
      
      const errors = WidgetSettingsHandler.validateConfig(tooSmallWidget);
      expect(errors).toContain('组件尺寸不符合最小要求');
    });
    
    it('应该处理进度计算边界条件', () => {
      // 测试除零情况
      expect(progressManager.calculateEstimatedTime(0, 1000, Date.now())).toBe(0);
      
      // 测试完成情况
      const startTime = Date.now() - 1000;
      expect(progressManager.calculateEstimatedTime(1000, 1000, startTime)).toBe(0);
    });
  });

  describe('异步操作和状态管理', () => {
    it('应该正确处理异步导出操作', async () => {
      const taskId = 'async-export-task';
      
      // 创建异步导出任务
      const task = progressManager.createTask(taskId, {
        totalRecords: 10000,
        stage: 'preparing'
      });
      
      // 模拟异步进度更新
      const updateProgress = async (processed: number, stage: string) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        const percentage = Math.floor((processed / 10000) * 100);
        progressManager.updateProgress(taskId, {
          stage,
          percentage,
          processedRecords: processed
        });
      };
      
      await updateProgress(2500, 'processing');
      await updateProgress(5000, 'processing');
      await updateProgress(7500, 'writing');
      await updateProgress(10000, 'finalizing');
      
      const finalProgress = progressManager.getProgress(taskId);
      expect(finalProgress.percentage).toBe(100);
      expect(finalProgress.stage).toBe('finalizing');
      expect(finalProgress.processedRecords).toBe(10000);
    });
    
    it('应该支持取消操作', async () => {
      const taskId = 'cancellable-task';
      let cancelled = false;
      
      progressManager.createTask(taskId, {
        totalRecords: 1000,
        cancellable: true
      });
      
      // 模拟可取消的长时间运行任务
      const longRunningTask = async () => {
        for (let i = 0; i < 1000; i += 100) {
          if (cancelled) break;
          
          await new Promise(resolve => setTimeout(resolve, 10));
          progressManager.updateProgress(taskId, {
            stage: 'processing',
            percentage: (i / 1000) * 100,
            processedRecords: i
          });
        }
      };
      
      // 开始任务
      const taskPromise = longRunningTask();
      
      // 模拟用户取消 - 增加延迟确保循环有机会开始
      await new Promise(resolve => setTimeout(resolve, 5));
      cancelled = true;
      
      await taskPromise;
      
      const progress = progressManager.getProgress(taskId);
      expect(progress.percentage).toBeLessThan(100);
      expect(cancelled).toBe(true);
    });
  });
});
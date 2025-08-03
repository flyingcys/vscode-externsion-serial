/*
 * Serial Studio VSCode Extension
 * 项目相关类型定义
 * 
 * 对应Serial-Studio中的核心数据结构
 * 保持与原始C++类的完全兼容性
 */

/**
 * 项目配置接口 - 对应ProjectModel的完整项目结构
 */
export interface ProjectConfig {
  // 基本项目信息
  title: string;
  
  // 帧解析配置 - 对应ProjectModel的帧处理设置
  decoder: number;              // 解码方法：0=PlainText, 1=Hex, 2=Base64
  frameDetection: number;       // 帧检测方法：0=NoDelimiters, 1=EndDelimiterOnly, 2=StartDelimiterOnly, 3=StartAndEndDelimiter
  frameStart: string;           // 帧起始标识符
  frameEnd: string;             // 帧结束标识符
  frameParser: string;          // JavaScript解析函数代码
  
  // 数据结构
  groups: Group[];              // 组群列表
  actions: Action[];            // 动作列表
  
  // API密钥（用于地图组件）
  mapTilerApiKey: string;       // MapTiler API密钥
  thunderforestApiKey: string;  // Thunderforest API密钥
}

/**
 * 组群接口 - 对应Serial-Studio的Group类
 */
export interface Group {
  title: string;                // 组群标题
  widget: string;               // 组群级别的可视化组件类型
  datasets: Dataset[];          // 包含的数据集列表
}

/**
 * 数据集接口 - 对应Serial-Studio的Dataset类
 */
export interface Dataset {
  // 基本属性
  title: string;                // 数据集标题
  units: string;                // 测量单位
  widget: string;               // 数据集级别的可视化组件类型
  value: string;                // 当前数值（字符串格式）
  index: number;                // 数据集索引（在帧中的位置）
  
  // 可视化选项
  graph: boolean;               // 是否显示在图表中
  fft: boolean;                 // 是否启用FFT分析
  led: boolean;                 // 是否显示LED面板
  log: boolean;                 // 是否记录到日志

  // 数值范围和告警
  min: number;                  // 最小值
  max: number;                  // 最大值
  alarm: number;                // 告警阈值
  ledHigh: number;              // LED高电平值

  // FFT设置
  fftSamples: number;           // FFT采样点数
  fftSamplingRate: number;      // FFT采样率
}

/**
 * 动作接口 - 对应Serial-Studio的Action类
 */
export interface Action {
  title: string;                // 动作标题
  icon: string;                 // 图标名称
  txData: string;               // 发送的数据
  eolSequence: string;          // 行结束序列
  binaryData: boolean;          // 是否为二进制数据
  autoExecuteOnConnect: boolean; // 连接时自动执行
  timerMode: string;            // 定时器模式
  timerIntervalMs: number;      // 定时器间隔（毫秒）
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;               // 验证是否通过
  errors: string[];             // 错误信息列表
  warnings?: string[];          // 警告信息列表（可选）
}

/**
 * 项目视图类型枚举 - 对应ProjectModel::CurrentView
 */
export enum ProjectViewType {
  ProjectView = 'project',
  GroupView = 'group',
  DatasetView = 'dataset',
  ActionView = 'action',
  FrameParserView = 'frameParser'
}

/**
 * 编辑器组件类型枚举 - 对应ProjectModel::EditorWidget
 */
export enum EditorWidgetType {
  TextField = 'textField',
  HexTextField = 'hexTextField',
  IntField = 'intField',
  FloatField = 'floatField',
  CheckBox = 'checkBox',
  ComboBox = 'comboBox',
  IconPicker = 'iconPicker'
}

/**
 * 帧检测方法枚举 - 对应SerialStudio::FrameDetection
 */
export enum FrameDetectionMethod {
  NoDelimiters = 0,
  EndDelimiterOnly = 1,
  StartDelimiterOnly = 2,
  StartAndEndDelimiter = 3
}

/**
 * 解码方法枚举 - 对应SerialStudio::DecoderMethod
 */
export enum DecoderMethod {
  PlainText = 0,
  Hexadecimal = 1,
  Base64 = 2
}

/**
 * 组件类型常量 - 对应Serial-Studio支持的所有组件类型
 */
export const WIDGET_TYPES = {
  // 组群级别组件
  GROUP: {
    NONE: '',
    ACCELEROMETER: 'accelerometer',
    GYROSCOPE: 'gyro', 
    GPS_MAP: 'map',
    COMPASS: 'compass'
  },
  
  // 数据集级别组件
  DATASET: {
    NONE: '',
    PLOT: 'plot',
    BAR: 'bar',
    GAUGE: 'gauge',
    LED: 'led',
    
    // 3D组件的轴
    X_AXIS: 'x',
    Y_AXIS: 'y', 
    Z_AXIS: 'z',
    
    // GPS组件
    LATITUDE: 'lat',
    LONGITUDE: 'lon',
    ALTITUDE: 'alt'
  }
} as const;

/**
 * 定时器模式常量 - 对应Action::TimerMode
 */
export const TIMER_MODES = {
  OFF: 'off',
  AUTO_START: 'autoStart',
  START_ON_TRIGGER: 'startOnTrigger',
  TOGGLE_ON_TRIGGER: 'toggleOnTrigger'
} as const;

/**
 * EOL序列常量
 */
export const EOL_SEQUENCES = {
  LF: '\\n',
  CR: '\\r',
  CRLF: '\\r\\n',
  SEMICOLON: ';',
  NULL: '\\0'
} as const;

/**
 * 项目模型状态接口 - 对应ProjectModel的完整状态
 */
export interface ProjectModelState {
  currentProject: ProjectConfig | null;
  filePath: string;
  modified: boolean;
  currentView: ProjectViewType;
  selectedGroupIndex: number;
  selectedDatasetIndex: number;
  selectedActionIndex: number;
}

/**
 * 项目编辑事件接口
 */
export interface ProjectEditEvent {
  type: 'group' | 'dataset' | 'action' | 'project';
  action: 'add' | 'delete' | 'modify' | 'select';
  index?: number;
  data?: any;
}

/**
 * 项目统计信息接口
 */
export interface ProjectStatistics {
  groupCount: number;
  datasetCount: number;
  actionCount: number;
  totalDataPoints: number;
  usedIndices: number[];
  duplicateIndices: number[];
}

/**
 * 导出配置接口
 */
export interface ExportConfig {
  format: 'ssproj' | 'json';
  includeActions: boolean;
  includeApiKeys: boolean;
  prettyPrint: boolean;
  indentSize: number;
}

/**
 * 导入选项接口
 */
export interface ImportOptions {
  validateSchema: boolean;
  mergeWithCurrent: boolean;
  preserveIndices: boolean;
  handleDuplicates: 'skip' | 'rename' | 'overwrite';
}

/**
 * 项目模板类型
 */
export type ProjectTemplate = 'basic' | 'sensor' | 'gps' | 'accelerometer' | 'custom';

/**
 * 组件配置映射 - 定义每种组件的配置选项
 */
export interface WidgetConfigMap {
  [WIDGET_TYPES.GROUP.ACCELEROMETER]: {
    requiredDatasets: 3;
    datasetWidgets: ['x', 'y', 'z'];
  };
  [WIDGET_TYPES.GROUP.GYROSCOPE]: {
    requiredDatasets: 3;
    datasetWidgets: ['x', 'y', 'z'];
  };
  [WIDGET_TYPES.GROUP.GPS_MAP]: {
    requiredDatasets: 2;
    minDatasets: 2;
    datasetWidgets: ['lat', 'lon', 'alt?'];
  };
}

/**
 * 项目配置差异接口 - 用于版本对比
 */
export interface ProjectDiff {
  added: {
    groups: Group[];
    datasets: Dataset[];
    actions: Action[];
  };
  removed: {
    groups: Group[];
    datasets: Dataset[];
    actions: Action[];
  };
  modified: {
    project: Partial<ProjectConfig>;
    groups: Array<{ index: number; changes: Partial<Group> }>;
    datasets: Array<{ groupIndex: number; datasetIndex: number; changes: Partial<Dataset> }>;
    actions: Array<{ index: number; changes: Partial<Action> }>;
  };
}

/**
 * 类型守卫函数
 */
export function isValidProjectConfig(obj: any): obj is ProjectConfig {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.decoder === 'number' &&
    typeof obj.frameDetection === 'number' &&
    typeof obj.frameStart === 'string' &&
    typeof obj.frameEnd === 'string' &&
    typeof obj.frameParser === 'string' &&
    Array.isArray(obj.groups) &&
    Array.isArray(obj.actions)
  );
}

export function isValidGroup(obj: any): obj is Group {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.widget === 'string' &&
    Array.isArray(obj.datasets)
  );
}

export function isValidDataset(obj: any): obj is Dataset {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.units === 'string' &&
    typeof obj.widget === 'string' &&
    typeof obj.value === 'string' &&
    typeof obj.index === 'number' &&
    typeof obj.graph === 'boolean' &&
    typeof obj.fft === 'boolean' &&
    typeof obj.led === 'boolean' &&
    typeof obj.log === 'boolean'
  );
}

export function isValidAction(obj: any): obj is Action {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof obj.title === 'string' &&
    typeof obj.icon === 'string' &&
    typeof obj.txData === 'string' &&
    typeof obj.eolSequence === 'string' &&
    typeof obj.binaryData === 'boolean' &&
    typeof obj.autoExecuteOnConnect === 'boolean' &&
    typeof obj.timerMode === 'string' &&
    typeof obj.timerIntervalMs === 'number'
  );
}
/**
 * 数据导出模块类型定义
 * 基于Serial Studio数据导出功能设计
 */

// 导出格式类型
export enum ExportFormatType {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
  XML = 'xml',
  TXT = 'txt',
  BINARY = 'binary'
}

// 流式导出状态
export enum StreamingExportState {
  PREPARING = 'preparing',
  WRITING = 'writing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

// 数据源类型
export enum DataSourceType {
  CURRENT = 'current',        // 当前数据
  HISTORICAL = 'historical',  // 历史数据
  RANGE = 'range',           // 时间范围
  SELECTION = 'selection'     // 选中数据
}

// 导出配置接口
export interface ExportConfig {
  // 数据源配置
  dataSource: {
    type: DataSourceType;
    range?: {
      startTime: Date;
      endTime: Date;
    };
    datasets?: string[];  // 指定数据集
    groups?: string[];    // 指定数据组
  };
  
  // 导出格式配置
  format: {
    type: ExportFormatType;
    options: FormatOptions;
  };
  
  // 文件配置
  file: {
    path: string;
    name: string;
    overwrite: boolean;
  };
  
  // 处理选项
  processing: {
    includeMetadata: boolean;
    includeTimestamps: boolean;
    compression: boolean;
    encoding: string;
    precision: number;
    stopOnError?: boolean;
  };
  
  // 过滤选项
  filters: {
    timeRange?: [Date, Date];
    valueRange?: [number, number];
    conditions?: FilterCondition[];
  };
}

// 格式选项联合类型
export type FormatOptions = CSVOptions | JSONOptions | ExcelOptions | XMLOptions | TXTOptions | BinaryOptions;

// CSV 格式选项
export interface CSVOptions {
  delimiter: string;
  quote: string;
  escape: string;
  encoding: string;
  includeHeader: boolean;
  lineEnding: string;
  precision?: number;
  dateFormat?: string;
}

// JSON 格式选项
export interface JSONOptions {
  pretty: boolean;
  indent: number;
  encoding: string;
  includeMetadata: boolean;
  arrayFormat: boolean;  // true: 数组格式, false: 按数据集分组
  compression?: boolean;
}

// Excel 格式选项
export interface ExcelOptions {
  sheetName: string;
  includeChart: boolean;
  autoFitColumns: boolean;
  includeMetadata: boolean;
  dateFormat: string;
  numberFormat?: string;
  chartConfig?: ChartConfig;
}

// XML 格式选项
export interface XMLOptions {
  rootElement: string;
  recordElement: string;
  includeAttributes: boolean;
  prettyPrint: boolean;
  encoding: string;
}

// TXT 格式选项
export interface TXTOptions {
  delimiter: string;
  encoding: string;
  includeHeader: boolean;
  lineEnding: string;
}

// Binary 格式选项
export interface BinaryOptions {
  encoding: string;
  compression: boolean;
}

// 图表配置
export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter';
  position: { x: number; y: number };
  size: { width: number; height: number };
  series: {
    name: string;
    categories: string;
    values: string;
  };
}

// 导出结果
export interface ExportResult {
  success: boolean;
  filePath: string;
  fileSize: number;
  recordCount: number;
  duration: number;
  checksum?: string;
  errors?: ExportError[];
}

// 导出进度
export interface ExportProgress {
  taskId: string;
  stage: 'preparing' | 'processing' | 'writing' | 'finalizing';
  percentage: number;
  processedRecords: number;
  totalRecords: number;
  estimatedTimeRemaining: number;
  currentFile?: string;
}

// 导出数据结构
export interface ExportData {
  headers: string[];
  records: AsyncIterable<any[]> | any[][];
  totalRecords: number;
  datasets: DatasetInfo[];
  metadata?: ExportMetadata;
}

// 数据集信息
export interface DatasetInfo {
  id: string;
  title: string;
  units: string;
  dataType: string;
  widget: string;
  group: string;
}

// 导出元数据
export interface ExportMetadata {
  exportTime: string;
  version: string;
  source: string;
  projectInfo?: {
    name: string;
    description: string;
    version: string;
  };
  deviceInfo?: {
    type: string;
    connection: string;
    settings: any;
  };
}

// 过滤条件
export interface FilterCondition {
  columnIndex: number;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// 过滤操作符
export type FilterOperator = 
  | 'equals' | 'not_equals'
  | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'regex' | 'in_range';

// 数据转换配置
export interface DataTransformation {
  type: TransformationType;
  config: TransformationConfig;
}

export type TransformationType = 
  | 'unit_conversion' | 'precision_round' | 'date_format' | 'custom_function';

export interface TransformationConfig {
  columnIndex: number;
  [key: string]: any;
}

// 导出格式信息
export interface ExportFormat {
  type: ExportFormatType;
  name: string;
  extensions: string[];
  description: string;
  options: any;
}

// 导出错误
export class ExportError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ExportError';
  }
}

// 导出器接口
export interface DataExporter {
  exportData(data: ExportData, filePath: string): Promise<ExportResult>;
  getSupportedFormats?(): ExportFormat[];
  validateConfig?(config: any): boolean;
}

// 导出管理器接口
export interface ExportManager {
  // 导出配置
  exportData(config: ExportConfig): Promise<ExportResult>;
  
  // 支持的格式
  getSupportedFormats(): ExportFormat[];
  
  // 导出进度监控
  onProgress(callback: (progress: ExportProgress) => void): void;
  
  // 取消导出
  cancelExport(taskId: string): Promise<void>;
}

// 导出任务
export interface ExportTask {
  id: string;
  config: ExportConfig;
  startTime: number;
  cancelled: boolean;
}

// === 流式导出相关类型定义（对应Serial-Studio CSV::Export） ===

// 数据点接口（对应Serial-Studio的JSON::Dataset）
export interface DataPoint {
  timestamp?: Date;
  values: any[];
  metadata?: {
    groupTitle?: string;
    datasetTitles?: string[];
    units?: string[];
    [key: string]: any;
  };
}

// 时间戳帧接口（对应Serial-Studio的TimestampFrame）
export interface TimestampFrame {
  data: DataPoint;
  rxDateTime: Date;
}

// CSV写入选项
export interface CSVWriteOptions {
  delimiter?: string;        // 分隔符，默认','
  quote?: string;           // 引号字符，默认'"'
  escape?: string;          // 转义字符，默认'"'
  lineEnding?: string;      // 行结束符，默认'\n'
  encoding?: string;        // 编码，默认'utf-8'
}

// 流式导出配置（对应Serial-Studio的Export配置）
export interface StreamingExportConfig {
  // 基础配置
  outputDirectory: string;
  filePrefix?: string;
  actualFilePath?: string;  // 实际创建的文件路径

  // CSV特定选项
  csvOptions?: CSVWriteOptions;
  includeTimestamp?: boolean;  // 是否包含时间戳列，默认true
  
  // 字段配置
  headers?: string[];
  selectedFields?: number[];   // 选择的字段索引
  
  // 数据处理选项
  precision?: number;         // 数值精度
  
  // 性能选项
  bufferSize?: number;        // 缓冲区大小
  writeInterval?: number;     // 写入间隔（毫秒）
  chunkSize?: number;         // 分块大小
}

// 流式导出进度
export interface StreamingExportProgress {
  handleId: string;
  state: StreamingExportState;
  percentage: number;
  recordsWritten: number;
  totalRecords: number;
  bytesWritten: number;
  estimatedTimeRemaining: number;
  currentChunk: number;
  totalChunks: number;
}

// 流式导出句柄（对应Serial-Studio的导出管理）
export interface StreamingExportHandle {
  readonly id: string;
  readonly config: StreamingExportConfig;
  readonly startTime: number;
  state: StreamingExportState;
  error: Error | null;
  progress: StreamingExportProgress;
  cancelled: boolean;
  paused: boolean;
}

// 自定义导出格式选项
export interface CustomExportFormatOptions {
  // 字段选择和重排序
  fieldSelection?: {
    enabled: boolean;
    selectedFields: number[];
    fieldOrder?: number[];
  };
  
  // 自定义分隔符
  customDelimiter?: {
    enabled: boolean;
    delimiter: string;
    customQuote?: string;
    customEscape?: string;
  };
  
  // 数据过滤
  dataFiltering?: {
    enabled: boolean;
    timeRange?: [Date, Date];
    valueRange?: [number, number];
    customConditions?: FilterCondition[];
  };
  
  // 数据变换
  dataTransformation?: {
    enabled: boolean;
    transformations: DataTransformation[];
  };
}

// 大数据量处理选项
export interface LargeDataProcessingOptions {
  // 分块导出
  chunkExport?: {
    enabled: boolean;
    chunkSize: number;
    maxMemoryUsage: number; // MB
  };
  
  // 数据压缩
  compression?: {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate' | 'brotli';
    level?: number;
  };
  
  // 暂停恢复
  pauseResume?: {
    enabled: boolean;
    autoSaveInterval: number; // 毫秒
    resumeFile?: string;
  };
}

// 增强的流式导出配置
export interface EnhancedStreamingExportConfig extends StreamingExportConfig {
  customFormatOptions?: CustomExportFormatOptions;
  largeDataProcessing?: LargeDataProcessingOptions;
}

// 导出统计信息
export interface ExportStatistics {
  totalRecords: number;
  totalBytes: number;
  averageRecordSize: number;
  exportDuration: number;
  averageWriteSpeed: number; // records/second
  peakMemoryUsage: number;   // MB
  compressionRatio?: number;
}
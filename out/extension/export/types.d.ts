/**
 * 数据导出模块类型定义
 * 基于Serial Studio数据导出功能设计
 */
export declare enum ExportFormatType {
    CSV = "csv",
    JSON = "json",
    EXCEL = "excel",
    XML = "xml",
    TXT = "txt",
    BINARY = "binary"
}
export declare enum StreamingExportState {
    PREPARING = "preparing",
    WRITING = "writing",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ERROR = "error"
}
export declare enum DataSourceType {
    CURRENT = "current",
    HISTORICAL = "historical",
    RANGE = "range",
    SELECTION = "selection"
}
export interface ExportConfig {
    dataSource: {
        type: DataSourceType;
        range?: {
            startTime: Date;
            endTime: Date;
        };
        datasets?: string[];
        groups?: string[];
    };
    format: {
        type: ExportFormatType;
        options: FormatOptions;
    };
    file: {
        path: string;
        name: string;
        overwrite: boolean;
    };
    processing: {
        includeMetadata: boolean;
        includeTimestamps: boolean;
        compression: boolean;
        encoding: string;
        precision: number;
        stopOnError?: boolean;
    };
    filters: {
        timeRange?: [Date, Date];
        valueRange?: [number, number];
        conditions?: FilterCondition[];
    };
}
export type FormatOptions = CSVOptions | JSONOptions | ExcelOptions | XMLOptions | TXTOptions | BinaryOptions;
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
export interface JSONOptions {
    pretty: boolean;
    indent: number;
    encoding: string;
    includeMetadata: boolean;
    arrayFormat: boolean;
    compression?: boolean;
}
export interface ExcelOptions {
    sheetName: string;
    includeChart: boolean;
    autoFitColumns: boolean;
    includeMetadata: boolean;
    dateFormat: string;
    numberFormat?: string;
    chartConfig?: ChartConfig;
}
export interface XMLOptions {
    rootElement: string;
    recordElement: string;
    includeAttributes: boolean;
    prettyPrint: boolean;
    encoding: string;
}
export interface TXTOptions {
    delimiter: string;
    encoding: string;
    includeHeader: boolean;
    lineEnding: string;
}
export interface BinaryOptions {
    encoding: string;
    compression: boolean;
}
export interface ChartConfig {
    type: 'line' | 'bar' | 'scatter';
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    series: {
        name: string;
        categories: string;
        values: string;
    };
}
export interface ExportResult {
    success: boolean;
    filePath: string;
    fileSize: number;
    recordCount: number;
    duration: number;
    checksum?: string;
    errors?: ExportError[];
}
export interface ExportProgress {
    taskId: string;
    stage: 'preparing' | 'processing' | 'writing' | 'finalizing';
    percentage: number;
    processedRecords: number;
    totalRecords: number;
    estimatedTimeRemaining: number;
    currentFile?: string;
}
export interface ExportData {
    headers: string[];
    records: AsyncIterable<any[]> | any[][];
    totalRecords: number;
    datasets: DatasetInfo[];
    metadata?: ExportMetadata;
}
export interface DatasetInfo {
    id: string;
    title: string;
    units: string;
    dataType: string;
    widget: string;
    group: string;
}
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
export interface FilterCondition {
    columnIndex: number;
    operator: FilterOperator;
    value: any;
    logicalOperator?: 'AND' | 'OR';
}
export type FilterOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'in_range';
export interface DataTransformation {
    type: TransformationType;
    config: TransformationConfig;
}
export type TransformationType = 'unit_conversion' | 'precision_round' | 'date_format' | 'custom_function';
export interface TransformationConfig {
    columnIndex: number;
    [key: string]: any;
}
export interface ExportFormat {
    type: ExportFormatType;
    name: string;
    extensions: string[];
    description: string;
    options: any;
}
export declare class ExportError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export interface DataExporter {
    exportData(data: ExportData, filePath: string): Promise<ExportResult>;
    getSupportedFormats?(): ExportFormat[];
    validateConfig?(config: any): boolean;
}
export interface ExportManager {
    exportData(config: ExportConfig): Promise<ExportResult>;
    getSupportedFormats(): ExportFormat[];
    onProgress(callback: (progress: ExportProgress) => void): void;
    cancelExport(taskId: string): Promise<void>;
}
export interface ExportTask {
    id: string;
    config: ExportConfig;
    startTime: number;
    cancelled: boolean;
}
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
export interface TimestampFrame {
    data: DataPoint;
    rxDateTime: Date;
}
export interface CSVWriteOptions {
    delimiter?: string;
    quote?: string;
    escape?: string;
    lineEnding?: string;
    encoding?: string;
}
export interface StreamingExportConfig {
    outputDirectory: string;
    filePrefix?: string;
    actualFilePath?: string;
    csvOptions?: CSVWriteOptions;
    includeTimestamp?: boolean;
    headers?: string[];
    selectedFields?: number[];
    precision?: number;
    bufferSize?: number;
    writeInterval?: number;
    chunkSize?: number;
}
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
export interface CustomExportFormatOptions {
    fieldSelection?: {
        enabled: boolean;
        selectedFields: number[];
        fieldOrder?: number[];
    };
    customDelimiter?: {
        enabled: boolean;
        delimiter: string;
        customQuote?: string;
        customEscape?: string;
    };
    dataFiltering?: {
        enabled: boolean;
        timeRange?: [Date, Date];
        valueRange?: [number, number];
        customConditions?: FilterCondition[];
    };
    dataTransformation?: {
        enabled: boolean;
        transformations: DataTransformation[];
    };
}
export interface LargeDataProcessingOptions {
    chunkExport?: {
        enabled: boolean;
        chunkSize: number;
        maxMemoryUsage: number;
    };
    compression?: {
        enabled: boolean;
        algorithm: 'gzip' | 'deflate' | 'brotli';
        level?: number;
    };
    pauseResume?: {
        enabled: boolean;
        autoSaveInterval: number;
        resumeFile?: string;
    };
}
export interface EnhancedStreamingExportConfig extends StreamingExportConfig {
    customFormatOptions?: CustomExportFormatOptions;
    largeDataProcessing?: LargeDataProcessingOptions;
}
export interface ExportStatistics {
    totalRecords: number;
    totalBytes: number;
    averageRecordSize: number;
    exportDuration: number;
    averageWriteSpeed: number;
    peakMemoryUsage: number;
    compressionRatio?: number;
}
//# sourceMappingURL=types.d.ts.map
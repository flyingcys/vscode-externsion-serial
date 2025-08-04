/**
 * Shared types for Serial Studio VSCode Extension
 * Based on Serial Studio's architecture and design patterns
 */
/**
 * Decoder methods for processing incoming data streams
 * Mirrors SerialStudio::DecoderMethod enum
 */
export declare enum DecoderMethod {
    PlainText = 0,
    Hexadecimal = 1,
    Base64 = 2,
    Binary = 3
}
/**
 * Frame detection methods for identifying data frames in streams
 * Mirrors SerialStudio::FrameDetection enum
 */
export declare enum FrameDetection {
    EndDelimiterOnly = 0,
    StartAndEndDelimiter = 1,
    NoDelimiters = 2,
    StartDelimiterOnly = 3
}
/**
 * Operation modes for dashboard construction
 * Mirrors SerialStudio::OperationMode enum
 */
export declare enum OperationMode {
    ProjectFile = 0,
    DeviceSendsJSON = 1,
    QuickPlot = 2
}
/**
 * Communication bus types
 * Mirrors SerialStudio::BusType enum
 */
export declare enum BusType {
    UART = "uart",
    Network = "network",
    BluetoothLE = "bluetooth-le",
    Audio = "audio",
    ModBus = "modbus",
    CanBus = "can"
}
/**
 * Widget types for different visualizations
 * Mirrors Serial Studio's widget system
 */
export declare enum WidgetType {
    Plot = "plot",
    MultiPlot = "multiplot",
    Gauge = "gauge",
    Bar = "bar",
    Compass = "compass",
    Accelerometer = "accelerometer",
    Gyroscope = "gyroscope",
    GPS = "gps",
    LED = "led",
    DataGrid = "datagrid",
    Terminal = "terminal",
    FFT = "fft",
    Plot3D = "plot3d"
}
/**
 * Data validation status for frame processing
 * Mirrors IO::ValidationStatus enum
 */
export declare enum ValidationStatus {
    FrameOk = "frame_ok",
    ChecksumError = "checksum_error",
    ChecksumIncomplete = "checksum_incomplete"
}
/**
 * Connection configuration interface
 */
export interface ConnectionConfig {
    type: BusType;
    name?: string;
    port?: string;
    baudRate?: number;
    dataBits?: number;
    stopBits?: number;
    parity?: 'none' | 'odd' | 'even' | 'mark' | 'space';
    flowControl?: 'none' | 'xon' | 'rts' | 'xonrts';
    host?: string;
    tcpPort?: number;
    udpPort?: number;
    protocol?: 'tcp' | 'udp';
    deviceId?: string;
    serviceUuid?: string;
    characteristicUuid?: string;
    autoReconnect?: boolean;
    timeout?: number;
}
/**
 * Frame processing configuration
 */
export interface FrameConfig {
    startSequence: Uint8Array;
    finishSequence: Uint8Array;
    checksumAlgorithm: string;
    frameDetection: FrameDetection;
    decoderMethod: DecoderMethod;
}
/**
 * Raw data frame received from device
 */
export interface RawFrame {
    data: Uint8Array;
    timestamp: number;
    sequence: number;
    checksumValid?: boolean;
}
/**
 * Processed data frame ready for visualization
 */
export interface ProcessedFrame {
    groups: Group[];
    timestamp: number;
    sequence: number;
    frameId: string;
}
/**
 * Data group containing related datasets
 */
export interface Group {
    id: string;
    title: string;
    widget: WidgetType;
    datasets: Dataset[];
}
/**
 * Individual dataset with values and metadata
 */
export interface Dataset {
    id: string;
    title: string;
    value: any;
    unit?: string;
    widget: WidgetType;
    alarm?: boolean;
    led?: boolean;
    log?: boolean;
    graph?: boolean;
    fft?: boolean;
    min?: number;
    max?: number;
    units?: string[];
}
/**
 * Chart data point
 */
export interface DataPoint {
    x: number;
    y: number;
    timestamp: number;
}
/**
 * Plot data series
 */
export interface PlotSeries {
    x: number[];
    y: number[];
    label: string;
    color?: string;
}
/**
 * GPS coordinate data
 */
export interface GpsData {
    latitude: number;
    longitude: number;
    altitude: number;
    timestamp: number;
}
/**
 * GPS position interface for GPS widget
 */
export interface GPSPosition {
    lat: number;
    lng: number;
    alt: number;
    accuracy?: number;
    timestamp?: number;
}
/**
 * GPS trajectory point for path tracking
 */
export interface GPSTrajectoryPoint extends GPSPosition {
    timestamp: number;
}
/**
 * GPS series data from dashboard
 */
export interface GPSSeries {
    latitudes: number[];
    longitudes: number[];
    altitudes: number[];
    timestamps?: number[];
}
/**
 * GPS widget configuration
 */
export interface GPSWidgetConfig extends WidgetConfig {
    autoCenter: boolean;
    plotTrajectory: boolean;
    showWeather: boolean;
    showNasaWeather: boolean;
    mapType: number;
    zoomLevel: number;
}
/**
 * Map layer types
 */
export declare enum MapLayerType {
    Satellite = 0,
    SatelliteLabels = 1,
    Street = 2,
    Topographic = 3,
    Terrain = 4,
    LightGray = 5,
    DarkGray = 6,
    NationalGeographic = 7
}
/**
 * Weather layer configuration
 */
export interface WeatherLayerConfig {
    enabled: boolean;
    layerType: 'clouds' | 'precipitation' | 'temperature';
    opacity: number;
    apiKey?: string;
}
/**
 * 3D point data
 */
export interface Point3D {
    x: number;
    y: number;
    z: number;
}
/**
 * 3D plot data series
 */
export interface PlotData3D extends Array<Point3D> {
}
/**
 * 3D plot widget configuration
 */
export interface Plot3DWidgetConfig extends WidgetConfig {
    worldScale: number;
    cameraAngleX: number;
    cameraAngleY: number;
    cameraAngleZ: number;
    cameraOffsetX: number;
    cameraOffsetY: number;
    cameraOffsetZ: number;
    anaglyphEnabled: boolean;
    orbitNavigation: boolean;
    interpolationEnabled: boolean;
    eyeSeparation: number;
    invertEyePositions: boolean;
}
/**
 * 3D data range for each axis
 */
export interface DataRange3D {
    x: {
        min: number;
        max: number;
    };
    y: {
        min: number;
        max: number;
    };
    z: {
        min: number;
        max: number;
    };
}
/**
 * 3D camera configuration
 */
export interface Camera3DConfig {
    position: Point3D;
    target: Point3D;
    up: Point3D;
    fov: number;
    aspect: number;
    near: number;
    far: number;
}
/**
 * Widget configuration
 */
export interface WidgetConfig {
    type: WidgetType;
    title: string;
    size?: {
        width: number;
        height: number;
    };
    position?: {
        x: number;
        y: number;
    };
    xAxis?: {
        label: string;
        min?: number;
        max?: number;
    };
    yAxis?: {
        label: string;
        min?: number;
        max?: number;
    };
    minValue?: number;
    maxValue?: number;
    units?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
}
/**
 * Project configuration
 */
export interface ProjectConfig {
    title: string;
    version: string;
    frameEndSequence: string;
    frameStartSequence: string;
    frameParser: string;
    groups: GroupConfig[];
}
/**
 * Group configuration in project
 */
export interface GroupConfig {
    title: string;
    widget: WidgetType;
    datasets: DatasetConfig[];
}
/**
 * Dataset configuration in project
 */
export interface DatasetConfig {
    title: string;
    index: number;
    graph: boolean;
    fft: boolean;
    log: boolean;
    led: boolean;
    widget: WidgetType;
    min?: number;
    max?: number;
    alarm?: number;
    units?: string;
}
/**
 * Export configuration
 */
export interface ExportConfig {
    format: {
        type: ExportFormatType;
        options?: any;
    };
    dataSource: {
        type: 'current' | 'historical' | 'range';
        range?: {
            start: number;
            end: number;
        };
    };
    file: {
        path: string;
        name: string;
    };
    datasets?: string[];
}
/**
 * Export format types
 */
export declare enum ExportFormatType {
    CSV = "csv",
    JSON = "json",
    EXCEL = "excel",
    XML = "xml",
    TXT = "txt",
    BINARY = "binary"
}
/**
 * Export result
 */
export interface ExportResult {
    success: boolean;
    filePath?: string;
    error?: string;
    recordCount?: number;
    fileSize?: number;
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    updateFrequency: number;
    processingLatency: number;
    memoryUsage: number;
    droppedFrames: number;
    cpuUsage?: number;
}
/**
 * Communication statistics
 */
export interface CommunicationStats {
    bytesReceived: number;
    bytesSent: number;
    framesReceived: number;
    framesSent: number;
    framesProcessed: number;
    errors: number;
    reconnections: number;
    uptime: number;
    memoryUsage?: number;
}
/**
 * Extension state
 */
export interface ExtensionState {
    connected: boolean;
    device?: ConnectionConfig;
    project?: ProjectConfig;
    performance: PerformanceMetrics;
    communication: CommunicationStats;
}
/**
 * Message types for communication between extension and webview
 */
export declare enum MessageType {
    CONNECT_DEVICE = "connect_device",
    DISCONNECT_DEVICE = "disconnect_device",
    CONNECTION_STATUS = "connection_status",
    FRAME_DATA = "frame_data",
    RAW_DATA = "raw_data",
    LOAD_PROJECT = "load_project",
    SAVE_PROJECT = "save_project",
    PROJECT_LOADED = "project_loaded",
    UPDATE_CONFIG = "update_config",
    GET_CONFIG = "get_config",
    EXPORT_DATA = "export_data",
    EXPORT_COMPLETE = "export_complete",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
/**
 * Message interface for extension-webview communication
 */
export interface Message {
    type: MessageType;
    payload?: any;
    id?: string;
    timestamp?: number;
}
//# sourceMappingURL=types.d.ts.map
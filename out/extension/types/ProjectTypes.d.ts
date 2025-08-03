/**
 * 项目配置接口 - 对应ProjectModel的完整项目结构
 */
export interface ProjectConfig {
    title: string;
    decoder: number;
    frameDetection: number;
    frameStart: string;
    frameEnd: string;
    frameParser: string;
    groups: Group[];
    actions: Action[];
    mapTilerApiKey: string;
    thunderforestApiKey: string;
}
/**
 * 组群接口 - 对应Serial-Studio的Group类
 */
export interface Group {
    title: string;
    widget: string;
    datasets: Dataset[];
}
/**
 * 数据集接口 - 对应Serial-Studio的Dataset类
 */
export interface Dataset {
    title: string;
    units: string;
    widget: string;
    value: string;
    index: number;
    graph: boolean;
    fft: boolean;
    led: boolean;
    log: boolean;
    min: number;
    max: number;
    alarm: number;
    ledHigh: number;
    fftSamples: number;
    fftSamplingRate: number;
}
/**
 * 动作接口 - 对应Serial-Studio的Action类
 */
export interface Action {
    title: string;
    icon: string;
    txData: string;
    eolSequence: string;
    binaryData: boolean;
    autoExecuteOnConnect: boolean;
    timerMode: string;
    timerIntervalMs: number;
}
/**
 * 验证结果接口
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}
/**
 * 项目视图类型枚举 - 对应ProjectModel::CurrentView
 */
export declare enum ProjectViewType {
    ProjectView = "project",
    GroupView = "group",
    DatasetView = "dataset",
    ActionView = "action",
    FrameParserView = "frameParser"
}
/**
 * 编辑器组件类型枚举 - 对应ProjectModel::EditorWidget
 */
export declare enum EditorWidgetType {
    TextField = "textField",
    HexTextField = "hexTextField",
    IntField = "intField",
    FloatField = "floatField",
    CheckBox = "checkBox",
    ComboBox = "comboBox",
    IconPicker = "iconPicker"
}
/**
 * 帧检测方法枚举 - 对应SerialStudio::FrameDetection
 */
export declare enum FrameDetectionMethod {
    NoDelimiters = 0,
    EndDelimiterOnly = 1,
    StartDelimiterOnly = 2,
    StartAndEndDelimiter = 3
}
/**
 * 解码方法枚举 - 对应SerialStudio::DecoderMethod
 */
export declare enum DecoderMethod {
    PlainText = 0,
    Hexadecimal = 1,
    Base64 = 2
}
/**
 * 组件类型常量 - 对应Serial-Studio支持的所有组件类型
 */
export declare const WIDGET_TYPES: {
    readonly GROUP: {
        readonly NONE: "";
        readonly ACCELEROMETER: "accelerometer";
        readonly GYROSCOPE: "gyro";
        readonly GPS_MAP: "map";
        readonly COMPASS: "compass";
    };
    readonly DATASET: {
        readonly NONE: "";
        readonly PLOT: "plot";
        readonly BAR: "bar";
        readonly GAUGE: "gauge";
        readonly LED: "led";
        readonly X_AXIS: "x";
        readonly Y_AXIS: "y";
        readonly Z_AXIS: "z";
        readonly LATITUDE: "lat";
        readonly LONGITUDE: "lon";
        readonly ALTITUDE: "alt";
    };
};
/**
 * 定时器模式常量 - 对应Action::TimerMode
 */
export declare const TIMER_MODES: {
    readonly OFF: "off";
    readonly AUTO_START: "autoStart";
    readonly START_ON_TRIGGER: "startOnTrigger";
    readonly TOGGLE_ON_TRIGGER: "toggleOnTrigger";
};
/**
 * EOL序列常量
 */
export declare const EOL_SEQUENCES: {
    readonly LF: "\\n";
    readonly CR: "\\r";
    readonly CRLF: "\\r\\n";
    readonly SEMICOLON: ";";
    readonly NULL: "\\0";
};
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
        groups: Array<{
            index: number;
            changes: Partial<Group>;
        }>;
        datasets: Array<{
            groupIndex: number;
            datasetIndex: number;
            changes: Partial<Dataset>;
        }>;
        actions: Array<{
            index: number;
            changes: Partial<Action>;
        }>;
    };
}
/**
 * 类型守卫函数
 */
export declare function isValidProjectConfig(obj: any): obj is ProjectConfig;
export declare function isValidGroup(obj: any): obj is Group;
export declare function isValidDataset(obj: any): obj is Dataset;
export declare function isValidAction(obj: any): obj is Action;
//# sourceMappingURL=ProjectTypes.d.ts.map
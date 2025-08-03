"use strict";
/*
 * Serial Studio VSCode Extension
 * 项目相关类型定义
 *
 * 对应Serial-Studio中的核心数据结构
 * 保持与原始C++类的完全兼容性
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAction = exports.isValidDataset = exports.isValidGroup = exports.isValidProjectConfig = exports.EOL_SEQUENCES = exports.TIMER_MODES = exports.WIDGET_TYPES = exports.DecoderMethod = exports.FrameDetectionMethod = exports.EditorWidgetType = exports.ProjectViewType = void 0;
/**
 * 项目视图类型枚举 - 对应ProjectModel::CurrentView
 */
var ProjectViewType;
(function (ProjectViewType) {
    ProjectViewType["ProjectView"] = "project";
    ProjectViewType["GroupView"] = "group";
    ProjectViewType["DatasetView"] = "dataset";
    ProjectViewType["ActionView"] = "action";
    ProjectViewType["FrameParserView"] = "frameParser";
})(ProjectViewType = exports.ProjectViewType || (exports.ProjectViewType = {}));
/**
 * 编辑器组件类型枚举 - 对应ProjectModel::EditorWidget
 */
var EditorWidgetType;
(function (EditorWidgetType) {
    EditorWidgetType["TextField"] = "textField";
    EditorWidgetType["HexTextField"] = "hexTextField";
    EditorWidgetType["IntField"] = "intField";
    EditorWidgetType["FloatField"] = "floatField";
    EditorWidgetType["CheckBox"] = "checkBox";
    EditorWidgetType["ComboBox"] = "comboBox";
    EditorWidgetType["IconPicker"] = "iconPicker";
})(EditorWidgetType = exports.EditorWidgetType || (exports.EditorWidgetType = {}));
/**
 * 帧检测方法枚举 - 对应SerialStudio::FrameDetection
 */
var FrameDetectionMethod;
(function (FrameDetectionMethod) {
    FrameDetectionMethod[FrameDetectionMethod["NoDelimiters"] = 0] = "NoDelimiters";
    FrameDetectionMethod[FrameDetectionMethod["EndDelimiterOnly"] = 1] = "EndDelimiterOnly";
    FrameDetectionMethod[FrameDetectionMethod["StartDelimiterOnly"] = 2] = "StartDelimiterOnly";
    FrameDetectionMethod[FrameDetectionMethod["StartAndEndDelimiter"] = 3] = "StartAndEndDelimiter";
})(FrameDetectionMethod = exports.FrameDetectionMethod || (exports.FrameDetectionMethod = {}));
/**
 * 解码方法枚举 - 对应SerialStudio::DecoderMethod
 */
var DecoderMethod;
(function (DecoderMethod) {
    DecoderMethod[DecoderMethod["PlainText"] = 0] = "PlainText";
    DecoderMethod[DecoderMethod["Hexadecimal"] = 1] = "Hexadecimal";
    DecoderMethod[DecoderMethod["Base64"] = 2] = "Base64";
})(DecoderMethod = exports.DecoderMethod || (exports.DecoderMethod = {}));
/**
 * 组件类型常量 - 对应Serial-Studio支持的所有组件类型
 */
exports.WIDGET_TYPES = {
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
};
/**
 * 定时器模式常量 - 对应Action::TimerMode
 */
exports.TIMER_MODES = {
    OFF: 'off',
    AUTO_START: 'autoStart',
    START_ON_TRIGGER: 'startOnTrigger',
    TOGGLE_ON_TRIGGER: 'toggleOnTrigger'
};
/**
 * EOL序列常量
 */
exports.EOL_SEQUENCES = {
    LF: '\\n',
    CR: '\\r',
    CRLF: '\\r\\n',
    SEMICOLON: ';',
    NULL: '\\0'
};
/**
 * 类型守卫函数
 */
function isValidProjectConfig(obj) {
    return (obj !== null &&
        obj !== undefined &&
        typeof obj === 'object' &&
        typeof obj.title === 'string' &&
        typeof obj.decoder === 'number' &&
        typeof obj.frameDetection === 'number' &&
        typeof obj.frameStart === 'string' &&
        typeof obj.frameEnd === 'string' &&
        typeof obj.frameParser === 'string' &&
        Array.isArray(obj.groups) &&
        Array.isArray(obj.actions));
}
exports.isValidProjectConfig = isValidProjectConfig;
function isValidGroup(obj) {
    return (obj !== null &&
        obj !== undefined &&
        typeof obj === 'object' &&
        typeof obj.title === 'string' &&
        typeof obj.widget === 'string' &&
        Array.isArray(obj.datasets));
}
exports.isValidGroup = isValidGroup;
function isValidDataset(obj) {
    return (obj !== null &&
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
        typeof obj.log === 'boolean');
}
exports.isValidDataset = isValidDataset;
function isValidAction(obj) {
    return (obj !== null &&
        obj !== undefined &&
        typeof obj === 'object' &&
        typeof obj.title === 'string' &&
        typeof obj.icon === 'string' &&
        typeof obj.txData === 'string' &&
        typeof obj.eolSequence === 'string' &&
        typeof obj.binaryData === 'boolean' &&
        typeof obj.autoExecuteOnConnect === 'boolean' &&
        typeof obj.timerMode === 'string' &&
        typeof obj.timerIntervalMs === 'number');
}
exports.isValidAction = isValidAction;
//# sourceMappingURL=ProjectTypes.js.map
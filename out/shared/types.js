"use strict";
/**
 * Shared types for Serial Studio VSCode Extension
 * Based on Serial Studio's architecture and design patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.ExportFormatType = exports.MapLayerType = exports.ValidationStatus = exports.WidgetType = exports.BusType = exports.OperationMode = exports.FrameDetection = exports.DecoderMethod = void 0;
/**
 * Decoder methods for processing incoming data streams
 * Mirrors SerialStudio::DecoderMethod enum
 */
var DecoderMethod;
(function (DecoderMethod) {
    DecoderMethod[DecoderMethod["PlainText"] = 0] = "PlainText";
    DecoderMethod[DecoderMethod["Hexadecimal"] = 1] = "Hexadecimal";
    DecoderMethod[DecoderMethod["Base64"] = 2] = "Base64";
    DecoderMethod[DecoderMethod["Binary"] = 3] = "Binary";
})(DecoderMethod = exports.DecoderMethod || (exports.DecoderMethod = {}));
/**
 * Frame detection methods for identifying data frames in streams
 * Mirrors SerialStudio::FrameDetection enum
 */
var FrameDetection;
(function (FrameDetection) {
    FrameDetection[FrameDetection["EndDelimiterOnly"] = 0] = "EndDelimiterOnly";
    FrameDetection[FrameDetection["StartAndEndDelimiter"] = 1] = "StartAndEndDelimiter";
    FrameDetection[FrameDetection["NoDelimiters"] = 2] = "NoDelimiters";
    FrameDetection[FrameDetection["StartDelimiterOnly"] = 3] = "StartDelimiterOnly";
})(FrameDetection = exports.FrameDetection || (exports.FrameDetection = {}));
/**
 * Operation modes for dashboard construction
 * Mirrors SerialStudio::OperationMode enum
 */
var OperationMode;
(function (OperationMode) {
    OperationMode[OperationMode["ProjectFile"] = 0] = "ProjectFile";
    OperationMode[OperationMode["DeviceSendsJSON"] = 1] = "DeviceSendsJSON";
    OperationMode[OperationMode["QuickPlot"] = 2] = "QuickPlot";
})(OperationMode = exports.OperationMode || (exports.OperationMode = {}));
/**
 * Communication bus types
 * Mirrors SerialStudio::BusType enum
 */
var BusType;
(function (BusType) {
    BusType["UART"] = "uart";
    BusType["Network"] = "network";
    BusType["BluetoothLE"] = "bluetooth-le";
    BusType["Audio"] = "audio";
    BusType["ModBus"] = "modbus";
    BusType["CanBus"] = "can"; // Commercial feature
})(BusType = exports.BusType || (exports.BusType = {}));
/**
 * Widget types for different visualizations
 * Mirrors Serial Studio's widget system
 */
var WidgetType;
(function (WidgetType) {
    WidgetType["Plot"] = "plot";
    WidgetType["MultiPlot"] = "multiplot";
    WidgetType["Gauge"] = "gauge";
    WidgetType["Bar"] = "bar";
    WidgetType["Compass"] = "compass";
    WidgetType["Accelerometer"] = "accelerometer";
    WidgetType["Gyroscope"] = "gyroscope";
    WidgetType["GPS"] = "gps";
    WidgetType["LED"] = "led";
    WidgetType["DataGrid"] = "datagrid";
    WidgetType["Terminal"] = "terminal";
    WidgetType["FFT"] = "fft";
    WidgetType["Plot3D"] = "plot3d";
})(WidgetType = exports.WidgetType || (exports.WidgetType = {}));
/**
 * Data validation status for frame processing
 * Mirrors IO::ValidationStatus enum
 */
var ValidationStatus;
(function (ValidationStatus) {
    ValidationStatus["FrameOk"] = "frame_ok";
    ValidationStatus["ChecksumError"] = "checksum_error";
    ValidationStatus["ChecksumIncomplete"] = "checksum_incomplete";
})(ValidationStatus = exports.ValidationStatus || (exports.ValidationStatus = {}));
/**
 * Map layer types
 */
var MapLayerType;
(function (MapLayerType) {
    MapLayerType[MapLayerType["Satellite"] = 0] = "Satellite";
    MapLayerType[MapLayerType["SatelliteLabels"] = 1] = "SatelliteLabels";
    MapLayerType[MapLayerType["Street"] = 2] = "Street";
    MapLayerType[MapLayerType["Topographic"] = 3] = "Topographic";
    MapLayerType[MapLayerType["Terrain"] = 4] = "Terrain";
    MapLayerType[MapLayerType["LightGray"] = 5] = "LightGray";
    MapLayerType[MapLayerType["DarkGray"] = 6] = "DarkGray";
    MapLayerType[MapLayerType["NationalGeographic"] = 7] = "NationalGeographic";
})(MapLayerType = exports.MapLayerType || (exports.MapLayerType = {}));
/**
 * Export format types
 */
var ExportFormatType;
(function (ExportFormatType) {
    ExportFormatType["CSV"] = "csv";
    ExportFormatType["JSON"] = "json";
    ExportFormatType["EXCEL"] = "excel";
    ExportFormatType["XML"] = "xml";
    ExportFormatType["TXT"] = "txt";
    ExportFormatType["BINARY"] = "binary";
})(ExportFormatType = exports.ExportFormatType || (exports.ExportFormatType = {}));
/**
 * Message types for communication between extension and webview
 */
var MessageType;
(function (MessageType) {
    // Connection management
    MessageType["CONNECT_DEVICE"] = "connect_device";
    MessageType["DISCONNECT_DEVICE"] = "disconnect_device";
    MessageType["CONNECTION_STATUS"] = "connection_status";
    // Data flow
    MessageType["FRAME_DATA"] = "frame_data";
    MessageType["RAW_DATA"] = "raw_data";
    // Project management
    MessageType["LOAD_PROJECT"] = "load_project";
    MessageType["SAVE_PROJECT"] = "save_project";
    MessageType["PROJECT_LOADED"] = "project_loaded";
    // Configuration
    MessageType["UPDATE_CONFIG"] = "update_config";
    MessageType["GET_CONFIG"] = "get_config";
    // Export
    MessageType["EXPORT_DATA"] = "export_data";
    MessageType["EXPORT_COMPLETE"] = "export_complete";
    // Error handling
    MessageType["ERROR"] = "error";
    MessageType["WARNING"] = "warning";
    MessageType["INFO"] = "info";
    // Batch operations
    MessageType["BATCH"] = "batch";
    MessageType["RESPONSE"] = "response";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
//# sourceMappingURL=types.js.map
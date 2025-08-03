"use strict";
/**
 * 数据导出模块类型定义
 * 基于Serial Studio数据导出功能设计
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportError = exports.DataSourceType = exports.StreamingExportState = exports.ExportFormatType = void 0;
// 导出格式类型
var ExportFormatType;
(function (ExportFormatType) {
    ExportFormatType["CSV"] = "csv";
    ExportFormatType["JSON"] = "json";
    ExportFormatType["EXCEL"] = "excel";
    ExportFormatType["XML"] = "xml";
    ExportFormatType["TXT"] = "txt";
    ExportFormatType["BINARY"] = "binary";
})(ExportFormatType = exports.ExportFormatType || (exports.ExportFormatType = {}));
// 流式导出状态
var StreamingExportState;
(function (StreamingExportState) {
    StreamingExportState["PREPARING"] = "preparing";
    StreamingExportState["WRITING"] = "writing";
    StreamingExportState["PAUSED"] = "paused";
    StreamingExportState["COMPLETED"] = "completed";
    StreamingExportState["CANCELLED"] = "cancelled";
    StreamingExportState["ERROR"] = "error";
})(StreamingExportState = exports.StreamingExportState || (exports.StreamingExportState = {}));
// 数据源类型
var DataSourceType;
(function (DataSourceType) {
    DataSourceType["CURRENT"] = "current";
    DataSourceType["HISTORICAL"] = "historical";
    DataSourceType["RANGE"] = "range";
    DataSourceType["SELECTION"] = "selection"; // 选中数据
})(DataSourceType = exports.DataSourceType || (exports.DataSourceType = {}));
// 导出错误
class ExportError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ExportError';
    }
}
exports.ExportError = ExportError;
//# sourceMappingURL=types.js.map
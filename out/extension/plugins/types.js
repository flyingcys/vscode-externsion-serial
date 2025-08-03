"use strict";
/**
 * Serial-Studio VSCode Plugin System - Core Types
 *
 * This module defines the core types and interfaces for the plugin system,
 * implementing the 15 extension points defined in the architecture specification.
 *
 * Based on Serial-Studio's modular architecture and VSCode extension patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginEvent = exports.ExtensionPoint = void 0;
/**
 * 15 Core Extension Points
 *
 * These extension points define where plugins can contribute functionality,
 * following Serial-Studio's modular architecture principles.
 */
var ExtensionPoint;
(function (ExtensionPoint) {
    ExtensionPoint["COMMUNICATION_DRIVERS"] = "communication.drivers";
    ExtensionPoint["DATA_PARSERS"] = "data.parsers";
    ExtensionPoint["DATA_VALIDATORS"] = "data.validators";
    ExtensionPoint["DATA_TRANSFORMERS"] = "data.transformers";
    ExtensionPoint["VISUALIZATION_WIDGETS"] = "visualization.widgets";
    ExtensionPoint["CHART_RENDERERS"] = "visualization.renderers";
    ExtensionPoint["EXPORT_FORMATS"] = "export.formats";
    ExtensionPoint["EXPORT_PROCESSORS"] = "export.processors";
    ExtensionPoint["MENU_CONTRIBUTIONS"] = "ui.menus";
    ExtensionPoint["TOOLBAR_CONTRIBUTIONS"] = "ui.toolbars";
    ExtensionPoint["SETTINGS_PAGES"] = "ui.settings";
    ExtensionPoint["THEMES"] = "ui.themes";
    ExtensionPoint["ICON_THEMES"] = "ui.iconThemes";
    ExtensionPoint["DEBUG_TOOLS"] = "tools.debug";
    ExtensionPoint["ANALYSIS_TOOLS"] = "tools.analysis";
})(ExtensionPoint = exports.ExtensionPoint || (exports.ExtensionPoint = {}));
/**
 * Plugin Events
 */
var PluginEvent;
(function (PluginEvent) {
    PluginEvent["LOADED"] = "plugin:loaded";
    PluginEvent["ACTIVATED"] = "plugin:activated";
    PluginEvent["DEACTIVATED"] = "plugin:deactivated";
    PluginEvent["UNLOADED"] = "plugin:unloaded";
    PluginEvent["ERROR"] = "plugin:error";
})(PluginEvent = exports.PluginEvent || (exports.PluginEvent = {}));
//# sourceMappingURL=types.js.map
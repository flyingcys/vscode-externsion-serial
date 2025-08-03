"use strict";
/**
 * Webview Main Entry Point for Serial Studio VSCode Extension
 * Vue 3 + Element Plus + Pinia architecture
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = require("vue");
const pinia_1 = require("pinia");
const element_plus_1 = __importDefault(require("element-plus"));
require("element-plus/dist/index.css");
require("element-plus/theme-chalk/dark/css-vars.css");
const App_vue_1 = __importDefault(require("./App.vue"));
const theme_1 = require("./stores/theme");
const data_1 = require("./stores/data");
const MessageBridge_1 = require("./utils/MessageBridge");
const types_1 = require("../shared/types");
// 创建Vue应用实例
const app = (0, vue_1.createApp)(App_vue_1.default);
// 配置Pinia状态管理
const pinia = (0, pinia_1.createPinia)();
app.use(pinia);
// 配置Element Plus UI库
app.use(element_plus_1.default);
// 初始化消息桥梁
const vscode = window.acquireVsCodeApi?.();
if (vscode) {
    const messageBridge = new MessageBridge_1.MessageBridge(vscode);
    app.provide('messageBridge', messageBridge);
    // 全局错误处理
    app.config.errorHandler = (error, instance, info) => {
        console.error('Vue应用错误:', error, info);
        messageBridge.sendMessage({
            type: types_1.MessageType.ERROR,
            payload: {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                info
            }
        });
    };
}
// 挂载应用
app.mount('#app');
// 初始化主题
const themeStore = (0, theme_1.useThemeStore)();
themeStore.initializeTheme();
// 初始化数据存储
const dataStore = (0, data_1.useDataStore)();
dataStore.initialize();
console.log('Serial Studio VSCode Extension Webview 已启动');
//# sourceMappingURL=main.js.map
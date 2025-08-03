/**
 * Webview Main Entry Point for Serial Studio VSCode Extension
 * Vue 3 + Element Plus + Pinia architecture
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import App from './App.vue';
import { useThemeStore } from './stores/theme';
import { useDataStore } from './stores/data';
import { MessageBridge } from './utils/MessageBridge';
import { MessageType } from '../shared/types';

// 创建Vue应用实例
const app = createApp(App);

// 配置Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 配置Element Plus UI库
app.use(ElementPlus);

// 获取VSCode API
declare global {
  interface Window {
    acquireVsCodeApi: () => any;
  }
}

// 初始化消息桥梁
const vscode = window.acquireVsCodeApi?.();
if (vscode) {
  const messageBridge = new MessageBridge(vscode);
  app.provide('messageBridge', messageBridge);
  
  // 全局错误处理
  app.config.errorHandler = (error: any, instance: any, info: string) => {
    console.error('Vue应用错误:', error, info);
    messageBridge.sendMessage({
      type: MessageType.ERROR,
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
const themeStore = useThemeStore();
themeStore.initializeTheme();

// 初始化数据存储
const dataStore = useDataStore();
dataStore.initialize();

console.log('Serial Studio VSCode Extension Webview 已启动');
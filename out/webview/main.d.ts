/**
 * Webview Main Entry Point for Serial Studio VSCode Extension
 * Vue 3 + Element Plus + Pinia architecture
 */
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
declare global {
    interface Window {
        acquireVsCodeApi: () => any;
    }
}
//# sourceMappingURL=main.d.ts.map
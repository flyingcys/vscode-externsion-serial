import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'setup.ts')],
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // 使用一致的相对路径格式
      include: ['../src/**/*.ts', '../src/**/*.vue'],
      exclude: [
        '../src/**/__tests__/**',
        '../src/**/*.test.ts', 
        '../src/**/*.spec.ts',
        '../src/**/*.d.ts',
        '../src/webview/translations/**',
        '../src/webview/themes/**',
        '../src/webview/styles/**',
        'node_modules/**',
        'dist/**',
        'out/**',
        'coverage/**'
      ],
      // 简化阈值配置用于测试
      thresholds: {
        global: {
          lines: 5,
          branches: 5,
          functions: 5,
          statements: 5
        }
      }
    },
    testTimeout: 30000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@extension': path.resolve(__dirname, '../src/extension'),
      'vscode': path.resolve(__dirname, 'mocks/vscode.ts')
    }
  }
});
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🎯 AUTO-4: C8覆盖率提供器测试配置
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'setup.ts')],
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov', 'cobertura'],
      include: [
        '../src/**/*.ts',
        '../src/**/*.vue'
      ],
      exclude: [
        '../src/**/*.test.ts',
        '../src/**/*.spec.ts',
        '../src/**/types/**',
        '../src/**/*.d.ts',
        '../src/tests/**',
        'node_modules/',
        'utest/'
      ],
      reportsDirectory: './coverage-c8',
      all: true,
      clean: true,
      reportOnFailure: true
    },
    testTimeout: 60000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@extension': path.resolve(__dirname, '../src/extension'),
      '@webview': path.resolve(__dirname, '../src/webview'),
      'vscode': path.resolve(__dirname, 'mocks/vscode.ts'),
      'chart.js': path.resolve(__dirname, 'mocks/chart.js.ts'),
      'mqtt': path.resolve(__dirname, 'mocks/mqtt.ts'),
      'ajv': path.resolve(__dirname, 'mocks/ajv.ts'),
      'ajv-formats': path.resolve(__dirname, 'mocks/ajv-formats.ts')
    }
  }
});
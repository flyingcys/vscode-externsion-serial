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
      reporter: ['text', 'html', 'lcov', 'cobertura'],
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/types/**',
        'src/**/*.d.ts',
        'src/webview/translations/**',
        'src/webview/themes/**',
        'src/webview/styles/**',
        'src/tests/**',
        'src/**/test-*.ts',
        'src/**/simple-test.ts',
        'src/extension/test-licensing.ts',
        'node_modules/',
        'dist/',
        'out/',
        'coverage/',
        'test-runner.js',
        'verify-implementation.js'
      ],
      thresholds: {
        global: {
          lines: 95,
          branches: 90,
          functions: 98,
          statements: 95
        },
        // P0模块需要更高的覆盖率
        'src/communication/**': {
          lines: 98,
          branches: 95
        },
        'src/parsing/**': {
          lines: 97,
          branches: 93
        },
        'src/visualization/**': {
          lines: 95,
          branches: 88
        },
        // P1模块
        'src/extensions/**': {
          lines: 90,
          branches: 80
        },
        // Plugins模块 - 100%覆盖度目标
        'src/extension/plugins/**': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        'src/performance/**': {
          lines: 95,
          branches: 90
        },
        // P2模块
        'src/export/**': {
          lines: 92,
          branches: 85
        }
      },
      watermarks: {
        lines: [80, 95],
        branches: [75, 90],
        functions: [85, 98],
        statements: [80, 95]
      }
    },
    testTimeout: 60000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1
      }
    },
    sequence: {
      concurrent: false,
      shuffle: false
    },
    // 性能测试配置
    benchmark: {
      include: ['**/*.bench.ts'],
      exclude: ['node_modules/**']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@extension': path.resolve(__dirname, '../src/extension'),
      '@webview': path.resolve(__dirname, '../src/webview'),
      '@test': path.resolve(__dirname, './test-utils'),
      'vscode': path.resolve(__dirname, 'mocks/vscode.ts'),
      'chart.js': path.resolve(__dirname, 'mocks/chart.js.ts'),
      'mqtt': path.resolve(__dirname, 'mocks/mqtt.ts'),
      'ajv': path.resolve(__dirname, 'mocks/ajv.ts'),
      'ajv-formats': path.resolve(__dirname, 'mocks/ajv-formats.ts')
    }
  },
  define: {
    'process.env.NODE_ENV': '"test"'
  }
});
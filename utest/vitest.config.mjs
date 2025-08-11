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
      // 🎯 AUTO-3: 修复覆盖率路径映射问题
      include: [
        '../src/**/*.ts',           // 使用相对路径
        '../src/**/*.vue',
        path.resolve(__dirname, '../src/**/*.ts'),  // 同时使用绝对路径
        path.resolve(__dirname, '../src/**/*.vue')
      ],
      exclude: [
        '../src/**/__tests__/**',
        '../src/**/*.test.ts',
        '../src/**/*.spec.ts',
        '../src/**/types/**',
        '../src/**/*.d.ts',
        '../src/webview/translations/**',
        '../src/webview/themes/**',
        '../src/webview/styles/**',
        '../src/tests/**',
        '../src/**/test-*.ts',
        '../src/**/simple-test.ts',
        '../src/extension/test-licensing.ts',
        'node_modules/',
        'dist/',
        'out/',
        'coverage/',
        'utest/',
        'test-runner.js',
        'verify-implementation.js'
      ],
      // 增加覆盖率配置选项
      reportsDirectory: './coverage',
      all: true,                  // 包含所有匹配的文件
      skipFull: false,           // 不跳过完全覆盖的文件
      clean: true,               // 清理旧的覆盖率报告
      cleanOnRerun: true,        // 重新运行时清理
      reportOnFailure: true,     // 测试失败时仍生成报告
      thresholds: {
        global: {
          lines: 30,
          branches: 25,
          functions: 35,
          statements: 30
        },
        // P0模块需要更高的覆盖率
        'src/extension/parsing/**': {
          lines: 60,
          branches: 50
        },
        'src/webview/components/widgets/**': {
          lines: 50,
          branches: 40
        },
        // P1模块
        'src/extension/**': {
          lines: 40,
          branches: 30
        },
        // Plugins模块
        'src/extension/plugins/**': {
          lines: 50,
          branches: 40,
          functions: 50,
          statements: 50
        },
        'src/shared/**': {
          lines: 40,
          branches: 30
        },
        // P2模块
        'src/extension/export/**': {
          lines: 40,
          branches: 30
        }
      },
      watermarks: {
        lines: [80, 95],
        branches: [75, 90],
        functions: [85, 98],
        statements: [80, 95]
      }
    },
    // 🎯 AUTO-5: 优化测试稳定性配置
    testTimeout: 15000,        // 增加单个测试超时时间
    hookTimeout: 10000,        // 增加钩子超时时间
    retry: 2,                  // 测试失败时重试2次
    bail: 0,                   // 不设置失败阈值，运行所有测试
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,      // 使用单个fork，避免并发问题
        maxForks: 1,           // 最大fork数为1
        isolate: true          // 隔离测试环境
      }
    },
    sequence: {
      concurrent: false,       // 禁用并发测试
      shuffle: false,          // 不打乱测试顺序
      setupFiles: 'serial'    // 串行执行setup文件
    },
    // 增加错误处理和重试逻辑
    onConsoleLog: () => false,   // 减少控制台噪音
    outputFile: {
      html: './coverage/test-results.html'
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
/**
 * Plugins 模块专用测试配置
 * 
 * 针对 Plugins 模块的专项测试配置，确保 100% 覆盖率和通过率
 */

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
    setupFiles: [path.resolve(__dirname, '../setup.ts')],
    
    // 仅运行 Plugins 模块相关测试
    include: [
      '**/plugins/**/*.test.ts',
      '**/plugins/**/*.spec.ts'
    ],
    
    // 排除其他模块的测试
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      '**/coverage/**',
      '**/communication/**/*.test.ts',
      '**/parsing/**/*.test.ts',
      '**/visualization/**/*.test.ts',
      '**/export/**/*.test.ts',
      '**/mqtt/**/*.test.ts',
      '**/io/**/*.test.ts'
    ],
    
    // 覆盖率配置 - Plugins 模块专项
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'cobertura', 'json'],
      
      // 仅包含 Plugins 模块源代码
      include: [
        'src/extension/plugins/**/*.ts'
      ],
      
      // 排除类型定义和测试文件
      exclude: [
        'src/extension/plugins/**/*.d.ts',
        'src/extension/plugins/**/__tests__/**',
        'src/extension/plugins/**/*.test.ts',
        'src/extension/plugins/**/*.spec.ts'
      ],
      
      // Plugins 模块 100% 覆盖率要求
      thresholds: {
        global: {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        
        // 每个文件都必须达到 100%
        'src/extension/plugins/index.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        'src/extension/plugins/types.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        'src/extension/plugins/PluginManager.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        'src/extension/plugins/PluginLoader.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        'src/extension/plugins/ContributionRegistry.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        },
        'src/extension/plugins/PluginContext.ts': {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100
        }
      },
      
      // 覆盖率水印
      watermarks: {
        lines: [95, 100],
        branches: [95, 100],
        functions: [95, 100],
        statements: [95, 100]
      },
      
      // 报告配置
      reportOnFailure: true,
      skipFull: false,
      all: true
    },
    
    // 测试超时配置
    testTimeout: 30000,      // 单个测试30秒超时
    hookTimeout: 15000,      // 钩子函数15秒超时
    teardownTimeout: 10000,  // 清理阶段10秒超时
    
    // 并发配置 - 单进程执行确保稳定性
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,    // 单进程执行
        maxForks: 1,         // 最多1个进程
        minForks: 1          // 最少1个进程
      }
    },
    
    // 测试执行顺序
    sequence: {
      concurrent: false,     // 不并发执行
      shuffle: false,        // 不随机顺序
      hooks: 'stack'         // 钩子函数栈式执行
    },
    
    // 重试配置
    retry: 2,                // 失败时重试2次
    
    // 监听模式配置
    watch: false,            // 不开启监听模式
    
    // 报告配置
    reporter: [
      'verbose',             // 详细输出
      'json',                // JSON 格式报告
      'html',                // HTML 报告
      'junit'                // JUnit 格式报告
    ],
    
    outputFile: {
      json: './utest/results/plugins-test-results.json',
      html: './utest/results/plugins-test-report.html',
      junit: './utest/results/plugins-test-junit.xml'
    },
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITEST_PLUGINS_MODULE: 'true',
      VITEST_COVERAGE_TARGET: '100'
    },
    
    // Mock 配置
    clearMocks: true,        // 每个测试后清理 Mock
    restoreMocks: true,      // 恢复原始实现
    mockReset: true,         // 重置 Mock 状态
    
    // 内存和性能配置
    isolate: true,           // 隔离测试环境
    passWithNoTests: false,  // 没有测试时失败
    allowOnly: false,        // 不允许 .only
    
    // 全局配置
    globals: {
      __PLUGINS_TEST_MODE__: true,
      __COVERAGE_TARGET__: 100
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
      '@shared': path.resolve(__dirname, '../../src/shared'),
      '@extension': path.resolve(__dirname, '../../src/extension'),
      '@webview': path.resolve(__dirname, '../../src/webview'),
      '@test': path.resolve(__dirname, '../test-utils'),
      '@plugins': path.resolve(__dirname, '../../src/extension/plugins'),
      
      // Mock 路径
      'vscode': path.resolve(__dirname, '../mocks/vscode.ts'),
      'chart.js': path.resolve(__dirname, '../mocks/chart.js.ts'),
      'mqtt': path.resolve(__dirname, '../mocks/mqtt.ts')
    }
  },
  
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.VITEST_PLUGINS_MODULE': 'true'
  },
  
  // 构建优化
  optimizeDeps: {
    include: [
      'vitest/globals',
      '@vue/test-utils'
    ]
  },
  
  // Esbuild 配置
  esbuild: {
    target: 'node16'
  }
});
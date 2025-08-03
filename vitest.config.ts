import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(async () => {
  // 动态导入ESM模块
  const { default: vue } = await import('@vitejs/plugin-vue');
  
  return {
    plugins: [vue()],
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'utest/**/*.test.ts'],
      setupFiles: ['utest/setup.ts'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          'out/',
          '**/*.d.ts',
          '**/*.test.ts'
        ]
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@extension': path.resolve(__dirname, 'src/extension'),
        '@webview': path.resolve(__dirname, 'src/webview'),
        '@test': path.resolve(__dirname, 'utest/test-utils'),
        'vscode': path.resolve(__dirname, 'utest/mocks/vscode.ts')
      }
    }
  };
});
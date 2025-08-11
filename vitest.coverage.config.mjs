import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/**/*.ts',
        'src/**/*.js'
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts', 
        'src/**/*.d.ts',
        'src/webview/**',
        'node_modules/**',
        'dist/**',
        'out/**'
      ],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 1,
        branches: 1,
        functions: 1,
        statements: 1
      }
    }
  }
});
/**
 * ErrorHandling 模块真实覆盖率测试
 * 测试错误处理系统的所有功能
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler, ErrorSeverity, ErrorCategory } from './src/shared/ErrorHandling.ts';

// Mock console methods
const mockConsole = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
vi.stubGlobal('console', mockConsole);

// Mock setInterval and clearInterval for cleanup tasks
const intervalMocks = new Set();
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

vi.stubGlobal('setInterval', (fn, delay) => {
  const id = originalSetInterval(fn, delay);
  intervalMocks.add(id);
  return id;
});

vi.stubGlobal('clearInterval', (id) => {
  intervalMocks.delete(id);
  return originalClearInterval(id);
});

describe('ErrorHandling Complete Coverage', () => {
  let errorHandler;

  beforeEach(() => {
    // Reset singleton instance
    ErrorHandler.instance = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (errorHandler) {
      errorHandler.dispose();
    }
    // Clean up any remaining intervals
    for (const id of intervalMocks) {
      originalClearInterval(id);
    }
    intervalMocks.clear();
  });

  describe('Singleton Pattern and Initialization', () => {
    test('should create singleton instance with default options', () => {
      const handler1 = ErrorHandler.getInstance();
      const handler2 = ErrorHandler.getInstance();
      
      expect(handler1).toBe(handler2);
      expect(handler1).toBeInstanceOf(ErrorHandler);
      
      errorHandler = handler1;
    });

    test('should initialize with custom options', () => {
      const options = {
        enableAutoRecovery: false,
        enableUserNotification: false,
        enableLogging: true,
        maxRetryAttempts: 5,
        retryDelayMs: 2000,
        suppressDuplicates: true,
        duplicateTimeWindowMs: 10000
      };
      
      errorHandler = ErrorHandler.getInstance(options);
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
    });

    test('should maintain singleton instance across different option calls', () => {
      const handler1 = ErrorHandler.getInstance({ enableAutoRecovery: true });
      const handler2 = ErrorHandler.getInstance({ enableAutoRecovery: false });
      
      expect(handler1).toBe(handler2);
      errorHandler = handler1;
    });
  });

  describe('Basic Error Handling', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance();
    });

    test('should handle basic Error objects', async () => {
      const basicError = new Error('Test error message');
      const result = await errorHandler.handleError(basicError);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('code');
      expect(result.message).toBe('Test error message');
      expect(result.severity).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
    });

    test('should handle Error objects with context', async () => {
      const error = new Error('Context error');
      const context = { userId: '123', action: 'save_file' };
      const result = await errorHandler.handleError(error, context);

      expect(result.context).toEqual(context);
      expect(result.message).toBe('Context error');
    });

    test('should handle StructuredError objects directly', async () => {
      const structuredError = {
        id: 'test_error_1',
        code: 'TEST_ERROR',
        severity: ErrorSeverity.WARNING,
        category: ErrorCategory.USER_INPUT,
        title: 'Test Error',
        message: 'This is a test error',
        timestamp: Date.now()
      };

      const result = await errorHandler.handleError(structuredError);
      expect(result).toEqual(structuredError);
    });

    test('should analyze and categorize different error types', async () => {
      const networkError = new Error('ENOTFOUND host');
      const result1 = await errorHandler.handleError(networkError);
      expect(result1.category).toBe(ErrorCategory.NETWORK);

      const permissionError = new Error('EACCES permission denied');
      const result2 = await errorHandler.handleError(permissionError);
      expect(result2.category).toBe(ErrorCategory.FILE_SYSTEM);

      const syntaxError = new SyntaxError('Invalid JSON');
      const result3 = await errorHandler.handleError(syntaxError);
      expect(result3.category).toBe(ErrorCategory.DATA_PROCESSING);
    });
  });

  describe('Recovery Strategy System', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance({ enableAutoRecovery: true });
    });

    test('should register recovery strategies', () => {
      const mockStrategy = {
        name: 'TestRecovery',
        description: 'Test recovery strategy',
        canHandle: (error) => error.category === ErrorCategory.NETWORK,
        recover: async (error) => true,
        priority: 1
      };

      errorHandler.registerRecoveryStrategy(mockStrategy);
      
      // Test that strategy was registered by checking internal state
      expect(errorHandler.recoveryStrategies).toContain(mockStrategy);
    });

    test('should attempt auto recovery when enabled', async () => {
      const recoveryStrategy = {
        name: 'TestRecovery',
        description: 'Test recovery',
        canHandle: (error) => error.category === ErrorCategory.NETWORK,
        recover: vi.fn().mockResolvedValue(true),
        priority: 1
      };

      errorHandler.registerRecoveryStrategy(recoveryStrategy);

      const networkError = new Error('Connection refused');
      await errorHandler.handleError(networkError);

      expect(recoveryStrategy.recover).toHaveBeenCalled();
    });

    test('should handle recovery strategy failures gracefully', async () => {
      const failingStrategy = {
        name: 'FailingRecovery',
        description: 'Failing recovery',
        canHandle: (error) => true,
        recover: vi.fn().mockRejectedValue(new Error('Recovery failed')),
        priority: 1
      };

      errorHandler.registerRecoveryStrategy(failingStrategy);

      const error = new Error('Test error');
      const result = await errorHandler.handleError(error);

      expect(result.autoRecoveryAttempted).toBe(true);
      expect(failingStrategy.recover).toHaveBeenCalled();
    });

    test('should sort recovery strategies by priority', () => {
      const strategy1 = {
        name: 'Strategy1',
        description: 'Strategy 1',
        canHandle: () => true,
        recover: async () => true,
        priority: 3
      };

      const strategy2 = {
        name: 'Strategy2', 
        description: 'Strategy 2',
        canHandle: () => true,
        recover: async () => true,
        priority: 1
      };

      const strategy3 = {
        name: 'Strategy3',
        description: 'Strategy 3', 
        canHandle: () => true,
        recover: async () => true,
        priority: 2
      };

      errorHandler.registerRecoveryStrategy(strategy1);
      errorHandler.registerRecoveryStrategy(strategy2);
      errorHandler.registerRecoveryStrategy(strategy3);

      // Check that strategies are sorted by priority
      expect(errorHandler.recoveryStrategies[0].priority).toBe(1);
      expect(errorHandler.recoveryStrategies[1].priority).toBe(2);
      expect(errorHandler.recoveryStrategies[2].priority).toBe(3);
    });
  });

  describe('Error Statistics and Tracking', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance();
    });

    test('should track error statistics', async () => {
      const initialStats = errorHandler.getStats();
      expect(initialStats.totalErrors).toBe(0);

      await errorHandler.handleError(new Error('Test error 1'));
      await errorHandler.handleError(new Error('Test error 2'));

      const updatedStats = errorHandler.getStats();
      expect(updatedStats.totalErrors).toBe(2);
      expect(updatedStats.recentErrors).toHaveLength(2);
    });

    test('should categorize error statistics', async () => {
      await errorHandler.handleError(new Error('ENOTFOUND'));
      await errorHandler.handleError(new SyntaxError('Invalid'));
      await errorHandler.handleError(new Error('EACCES'));

      const stats = errorHandler.getStats();
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(stats.errorsByCategory[ErrorCategory.DATA_PROCESSING]).toBe(1);  
      expect(stats.errorsByCategory[ErrorCategory.FILE_SYSTEM]).toBe(1);
    });

    test('should get recent errors with limit', async () => {
      // Add more errors than the limit
      for (let i = 0; i < 15; i++) {
        await errorHandler.handleError(new Error(`Test error ${i}`));
      }

      const recent5 = errorHandler.getRecentErrors(5);
      expect(recent5).toHaveLength(5);

      const recent10 = errorHandler.getRecentErrors(10);
      expect(recent10).toHaveLength(10);

      const recentDefault = errorHandler.getRecentErrors();
      expect(recentDefault).toHaveLength(10); // Default limit
    });

    test('should clear error history', async () => {
      await errorHandler.handleError(new Error('Test error'));
      
      let stats = errorHandler.getStats();
      expect(stats.totalErrors).toBe(1);

      errorHandler.clearErrorHistory();
      
      stats = errorHandler.getStats();
      expect(stats.totalErrors).toBe(1); // totalErrors counter doesn't reset
      expect(stats.recentErrors).toHaveLength(0);
    });
  });

  describe('Duplicate Error Suppression', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance({
        suppressDuplicates: true,
        duplicateTimeWindowMs: 5000
      });
    });

    test('should suppress duplicate errors within time window', async () => {
      const error1 = new Error('Duplicate test error');
      const error2 = new Error('Duplicate test error');

      const result1 = await errorHandler.handleError(error1);
      const result2 = await errorHandler.handleError(error2);

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();

      const stats = errorHandler.getStats();
      // Both errors are recorded but duplicates are noted
      expect(stats.totalErrors).toBe(2);
    });

    test('should allow duplicate errors after time window', async () => {
      vi.useFakeTimers();
      
      const error1 = new Error('Time window test error');
      await errorHandler.handleError(error1);

      // Advance time beyond the duplicate window
      vi.advanceTimersByTime(6000);

      const error2 = new Error('Time window test error');
      await errorHandler.handleError(error2);

      const stats = errorHandler.getStats();
      expect(stats.totalErrors).toBe(2);

      vi.useRealTimers();
    });
  });

  describe('Event Emission', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance({ 
        enableUserNotification: true 
      });
    });

    test('should emit error notification events', async () => {
      const notificationSpy = vi.fn();
      errorHandler.on('error:notification', notificationSpy);

      await errorHandler.handleError(new Error('Notification test'));

      expect(notificationSpy).toHaveBeenCalled();
      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Notification test'
        })
      );
    });

    test('should emit recovery events', async () => {
      const recoverySuccessSpy = vi.fn();
      const recoveryFailureSpy = vi.fn();
      
      errorHandler.on('recovery:success', recoverySuccessSpy);
      errorHandler.on('recovery:failure', recoveryFailureSpy);

      const successStrategy = {
        name: 'SuccessStrategy',
        description: 'Always succeeds',
        canHandle: () => true,
        recover: async () => true,
        priority: 1
      };

      errorHandler.registerRecoveryStrategy(successStrategy);
      await errorHandler.handleError(new Error('Recovery test'));

      expect(recoverySuccessSpy).toHaveBeenCalled();
    });
  });

  describe('Logging System', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance({ enableLogging: true });
    });

    test('should log errors with appropriate levels', async () => {
      const infoError = {
        id: 'info_1',
        code: 'INFO_TEST',
        severity: ErrorSeverity.INFO,
        category: ErrorCategory.SYSTEM,
        title: 'Info Error',
        message: 'This is an info message',
        timestamp: Date.now()
      };

      const criticalError = {
        id: 'critical_1',
        code: 'CRITICAL_TEST', 
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.SYSTEM,
        title: 'Critical Error',
        message: 'This is a critical error',
        timestamp: Date.now()
      };

      await errorHandler.handleError(infoError);
      await errorHandler.handleError(criticalError);

      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    test('should include technical details in logs when available', async () => {
      const errorWithDetails = {
        id: 'detailed_1',
        code: 'DETAILED_TEST',
        severity: ErrorSeverity.ERROR,
        category: ErrorCategory.DATA_PROCESSING,
        title: 'Detailed Error',
        message: 'Error with technical details',
        technicalDetails: 'Stack trace and debug info',
        timestamp: Date.now()
      };

      await errorHandler.handleError(errorWithDetails);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Stack trace and debug info')
      );
    });
  });

  describe('Error Analysis and Categorization', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance();
    });

    test('should analyze network errors correctly', async () => {
      const networkErrors = [
        new Error('ENOTFOUND example.com'),
        new Error('ECONNREFUSED'),
        new Error('ETIMEDOUT'),
        new Error('DNS lookup failed'),
        new Error('Connection reset by peer')
      ];

      for (const error of networkErrors) {
        const result = await errorHandler.handleError(error);
        expect(result.category).toBe(ErrorCategory.NETWORK);
        expect(result.canRetry).toBe(true);
      }
    });

    test('should analyze file system errors correctly', async () => {
      const fsErrors = [
        new Error('EACCES: permission denied'),
        new Error('ENOENT: no such file'),
        new Error('EMFILE: too many open files'),
        new Error('ENOSPC: no space left')
      ];

      for (const error of fsErrors) {
        const result = await errorHandler.handleError(error);
        expect(result.category).toBe(ErrorCategory.FILE_SYSTEM);
      }
    });

    test('should analyze data processing errors correctly', async () => {
      const dataErrors = [
        new SyntaxError('Unexpected token'),
        new TypeError('Cannot read property'),
        new ReferenceError('Variable not defined'),
        new Error('Invalid JSON format')
      ];

      for (const error of dataErrors) {
        const result = await errorHandler.handleError(error);
        expect(result.category).toBe(ErrorCategory.DATA_PROCESSING);
      }
    });

    test('should provide appropriate suggestions for different error types', async () => {
      const networkError = new Error('ENOTFOUND');
      const result = await errorHandler.handleError(networkError);
      
      expect(result.suggestions).toContain('Check internet connection');
      expect(result.userAction).toBe('Please check your network connection and try again');
    });

    test('should set appropriate severity levels', async () => {
      const warningError = new Error('Deprecated API usage');
      const result1 = await errorHandler.handleError(warningError);
      expect(result1.severity).toBe(ErrorSeverity.WARNING);

      const criticalError = new Error('ENOSPC: no space left on device');
      const result2 = await errorHandler.handleError(criticalError);
      expect(result2.severity).toBe(ErrorSeverity.ERROR);
    });
  });

  describe('Utility Functions and Edge Cases', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance();
    });

    test('should generate unique error IDs', async () => {
      const error1 = await errorHandler.handleError(new Error('Test 1'));
      const error2 = await errorHandler.handleError(new Error('Test 2'));

      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(error2.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    test('should handle null and undefined errors gracefully', async () => {
      const result1 = await errorHandler.handleError(null);
      expect(result1).toBeDefined();
      expect(result1.message).toContain('Unknown error');

      const result2 = await errorHandler.handleError(undefined);
      expect(result2).toBeDefined();
      expect(result2.message).toContain('Unknown error');
    });

    test('should handle errors with circular references', async () => {
      const circularError = new Error('Circular test');
      circularError.circular = circularError;

      const result = await errorHandler.handleError(circularError);
      expect(result).toBeDefined();
      expect(result.message).toBe('Circular test');
    });

    test('should dispose properly', () => {
      const handler = ErrorHandler.getInstance();
      
      expect(() => handler.dispose()).not.toThrow();
      expect(ErrorHandler.instance).toBe(null);
      
      // Should be able to create new instance after dispose
      const newHandler = ErrorHandler.getInstance();
      expect(newHandler).toBeInstanceOf(ErrorHandler);
      
      errorHandler = newHandler;
    });
  });

  describe('Default Recovery Strategies', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance({ 
        enableAutoRecovery: true,
        maxRetryAttempts: 2,
        retryDelayMs: 100
      });
    });

    test('should have default network reconnection strategy', async () => {
      const networkError = new Error('ENOTFOUND example.com');
      const result = await errorHandler.handleError(networkError);

      expect(result.autoRecoveryAttempted).toBe(true);
      expect(result.canRetry).toBe(true);
    });

    test('should have file system retry strategy', async () => {
      const fsError = new Error('EMFILE: too many open files');
      const result = await errorHandler.handleError(fsError);

      expect(result.category).toBe(ErrorCategory.FILE_SYSTEM);
      expect(result.canRetry).toBeTruthy();
    });
  });

  describe('Performance and Memory Management', () => {
    beforeEach(() => {
      errorHandler = ErrorHandler.getInstance({
        suppressDuplicates: true,
        duplicateTimeWindowMs: 1000
      });
    });

    test('should handle large numbers of errors efficiently', async () => {
      const startTime = Date.now();

      // Generate many errors quickly
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(errorHandler.handleError(new Error(`Bulk error ${i}`)));
      }

      await Promise.all(promises);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process 100 errors reasonably quickly (less than 1 second)
      expect(processingTime).toBeLessThan(1000);

      const stats = errorHandler.getStats();
      expect(stats.totalErrors).toBe(100);
    });

    test('should clean up expired duplicate tracking entries', async () => {
      vi.useFakeTimers();

      await errorHandler.handleError(new Error('Cleanup test'));
      
      // Fast-forward time to trigger cleanup
      vi.advanceTimersByTime(60000); // Advance by 1 minute

      // The cleanup should have run (interval is set up in constructor)
      expect(intervalMocks.size).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });
});
/**
 * 简单的覆盖率调试测试
 */

import { describe, test, expect } from 'vitest';
import { MemoryManager } from '../src/shared/MemoryManager';

describe('Debug Coverage Test', () => {
  test('should import and instantiate MemoryManager', () => {
    const manager = new MemoryManager();
    expect(manager).toBeDefined();
    
    // 调用一些方法来触发覆盖率
    const stats = manager.getMemoryStats();
    expect(stats).toBeDefined();
    
    manager.dispose();
  });
});
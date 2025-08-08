/**
 * 翻译文件测试
 * 目标：验证翻译文件的完整性和一致性
 */

import { describe, test, expect } from 'vitest';

// 导入翻译文件
import { messages as enMessages } from '../../../src/webview/translations/en_US';
import { messages as zhMessages } from '../../../src/webview/translations/zh_CN';

describe('翻译文件测试', () => {

  describe('英语翻译文件 (en_US.ts)', () => {
    test('应该导出 messages 对象', () => {
      expect(enMessages).toBeDefined();
      expect(typeof enMessages).toBe('object');
    });

    test('应该包含必需的顶级键', () => {
      const requiredKeys = [
        'common', 'app', 'error', 'loading', 'theme', 'language', 
        'connection', 'data', 'project', 'dashboard', 'console', 
        'settings', 'export', 'errorMessages', 'success', 'units', 'license'
      ];

      requiredKeys.forEach(key => {
        expect(enMessages).toHaveProperty(key);
        expect(typeof enMessages[key]).toBe('object');
      });
    });

    test('common 模块应该包含基础UI文本', () => {
      const commonKeys = [
        'ok', 'cancel', 'save', 'close', 'delete', 'edit', 'add', 'remove',
        'clear', 'reset', 'refresh', 'loading', 'error', 'warning', 'info',
        'success', 'confirm', 'yes', 'no', 'apply', 'import', 'export'
      ];

      commonKeys.forEach(key => {
        expect(enMessages.common).toHaveProperty(key);
        expect(typeof enMessages.common[key]).toBe('string');
        expect(enMessages.common[key]).not.toBe('');
      });
    });

    test('app 模块应该包含应用程序信息', () => {
      const appKeys = ['name', 'version', 'copyright', 'allRightsReserved'];

      appKeys.forEach(key => {
        expect(enMessages.app).toHaveProperty(key);
        expect(typeof enMessages.app[key]).toBe('string');
      });

      expect(enMessages.app.name).toBe('Serial Studio');
      expect(enMessages.app.version).toContain('{version}');
    });

    test('theme 模块应该包含主题相关文本', () => {
      const themeKeys = ['title', 'light', 'dark', 'auto', 'custom', 'default'];

      themeKeys.forEach(key => {
        expect(enMessages.theme).toHaveProperty(key);
        expect(typeof enMessages.theme[key]).toBe('string');
      });
    });

    test('error 模块应该有完整的错误处理结构', () => {
      expect(enMessages.error).toHaveProperty('dialog');
      expect(enMessages.error).toHaveProperty('severity');
      expect(enMessages.error).toHaveProperty('category');
      expect(enMessages.error).toHaveProperty('history');

      expect(typeof enMessages.error.dialog).toBe('object');
      expect(typeof enMessages.error.severity).toBe('object');
      expect(typeof enMessages.error.category).toBe('object');
    });

    test('loading 模块应该有完整的加载状态结构', () => {
      expect(enMessages.loading).toHaveProperty('types');
      expect(enMessages.loading).toHaveProperty('status');
      expect(enMessages.loading).toHaveProperty('priority');
      expect(enMessages.loading).toHaveProperty('messages');
      expect(enMessages.loading).toHaveProperty('progress');
    });

    test('units 模块应该包含所有单位', () => {
      const unitKeys = [
        'bytes', 'kb', 'mb', 'gb', 'bps', 'kbps', 'mbps',
        'hz', 'khz', 'mhz', 'ghz', 'ms', 'sec', 'min', 'hour', 'day',
        'volt', 'ampere', 'watt', 'celsius', 'fahrenheit', 'kelvin',
        'meter', 'kilometer', 'inch', 'foot', 'gram', 'kilogram', 'pound'
      ];

      unitKeys.forEach(key => {
        expect(enMessages.units).toHaveProperty(key);
        expect(typeof enMessages.units[key]).toBe('string');
        expect(enMessages.units[key]).not.toBe('');
      });
    });

    test('dashboard.widget 应该包含所有组件类型', () => {
      const widgetKeys = [
        'plot', 'multiplot', 'gauge', 'bar', 'compass', 'accelerometer',
        'gyroscope', 'gps', 'led', 'dataGrid', 'terminal', 'fft', 'plot3d'
      ];

      widgetKeys.forEach(key => {
        expect(enMessages.dashboard.widget).toHaveProperty(key);
        expect(typeof enMessages.dashboard.widget[key]).toBe('string');
      });
    });
  });

  describe('中文翻译文件 (zh_CN.ts)', () => {
    test('应该导出 messages 对象', () => {
      expect(zhMessages).toBeDefined();
      expect(typeof zhMessages).toBe('object');
    });

    test('应该包含与英语相同的顶级键', () => {
      const enKeys = Object.keys(enMessages);
      const zhKeys = Object.keys(zhMessages);

      expect(zhKeys).toEqual(enKeys);
    });

    test('common 模块应该有正确的中文翻译', () => {
      expect(zhMessages.common.ok).toBe('确定');
      expect(zhMessages.common.cancel).toBe('取消');
      expect(zhMessages.common.save).toBe('保存');
      expect(zhMessages.common.delete).toBe('删除');
      expect(zhMessages.common.error).toBe('错误');
      expect(zhMessages.common.success).toBe('成功');
    });

    test('app 模块应该有正确的中文翻译', () => {
      expect(zhMessages.app.name).toBe('Serial Studio');
      expect(zhMessages.app.version).toBe('版本 {version}');
      expect(zhMessages.app.copyright).toContain('版权所有');
    });

    test('theme 模块应该有正确的中文翻译', () => {
      expect(zhMessages.theme.title).toBe('主题');
      expect(zhMessages.theme.light).toBe('浅色');
      expect(zhMessages.theme.dark).toBe('深色');
      expect(zhMessages.theme.auto).toBe('自动');
    });

    test('units 应该包含中文单位', () => {
      expect(zhMessages.units.bytes).toBe('字节');
      expect(zhMessages.units.ms).toBe('毫秒');
      expect(zhMessages.units.sec).toBe('秒');
      expect(zhMessages.units.celsius).toBe('摄氏度');
      expect(zhMessages.units.meter).toBe('米');
    });
  });

  describe('翻译文件一致性检查', () => {
    // 递归获取对象的所有键路径
    function getKeyPaths(obj: any, prefix = ''): string[] {
      let paths: string[] = [];
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const currentPath = prefix ? `${prefix}.${key}` : key;
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            paths = paths.concat(getKeyPaths(obj[key], currentPath));
          } else if (typeof obj[key] === 'string') {
            paths.push(currentPath);
          }
        }
      }
      
      return paths;
    }

    test('中英文翻译应该有相同的键结构', () => {
      const enPaths = getKeyPaths(enMessages);
      const zhPaths = getKeyPaths(zhMessages);
      
      // 排序以便比较
      enPaths.sort();
      zhPaths.sort();
      
      expect(zhPaths).toEqual(enPaths);
    });

    test('所有翻译键都应该有非空值', () => {
      const enPaths = getKeyPaths(enMessages);
      const zhPaths = getKeyPaths(zhMessages);
      
      [...enPaths, ...zhPaths].forEach(path => {
        const enValue = getValueByPath(enMessages, path);
        const zhValue = getValueByPath(zhMessages, path);
        
        expect(typeof enValue).toBe('string');
        expect(typeof zhValue).toBe('string');
        expect(enValue.trim()).not.toBe('');
        expect(zhValue.trim()).not.toBe('');
      });
    });

    test('插值参数应该保持一致', () => {
      const enPaths = getKeyPaths(enMessages);
      
      enPaths.forEach(path => {
        const enValue = getValueByPath(enMessages, path);
        const zhValue = getValueByPath(zhMessages, path);
        
        if (typeof enValue === 'string' && typeof zhValue === 'string') {
          const enParams = extractInterpolationParams(enValue);
          const zhParams = extractInterpolationParams(zhValue);
          
          if (enParams.length > 0 || zhParams.length > 0) {
            expect(zhParams.sort()).toEqual(enParams.sort());
          }
        }
      });
    });

    // 辅助函数：根据路径获取对象的值
    function getValueByPath(obj: any, path: string): any {
      return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    // 辅助函数：提取插值参数
    function extractInterpolationParams(str: string): string[] {
      const matches = str.match(/\{([^}]+)\}/g);
      return matches ? matches.map(match => match.slice(1, -1)) : [];
    }

    test('特定插值参数应该正确使用', () => {
      expect(enMessages.app.version).toContain('{version}');
      expect(zhMessages.app.version).toContain('{version}');
      
      expect(enMessages.app.copyright).toContain('{year}');
      expect(enMessages.app.copyright).toContain('{author}');
      expect(zhMessages.app.copyright).toContain('{year}');
      expect(zhMessages.app.copyright).toContain('{author}');
    });
  });

  describe('翻译质量检查', () => {
    test('中文翻译不应该包含英文单词（除品牌名外）', () => {
      const allowedEnglishWords = [
        'Serial Studio', 'VSCode', 'USB', 'UART', 'GPS', 'LED', 'FFT', '3D',
        'JSON', 'CSV', 'XML', 'Excel', 'Base64', 'GNU', 'GPL', 'OK', 'USB',
        'MQTT', 'TCP', 'UDP', 'HTTP', 'API', 'SDK', 'ID'
      ];
      
      const zhPaths = getKeyPaths(zhMessages);
      
      zhPaths.forEach(path => {
        const value = getValueByPath(zhMessages, path) as string;
        
        if (typeof value === 'string') {
          // 检查是否包含连续的英文字母（排除允许的词汇和插值参数）
          const withoutInterpolation = value.replace(/\{[^}]+\}/g, '');
          const withoutAllowed = allowedEnglishWords.reduce((str, word) => 
            str.replace(new RegExp(word, 'gi'), ''), withoutInterpolation
          );
          
          const englishMatch = withoutAllowed.match(/[a-zA-Z]{3,}/);
          if (englishMatch) {
            // 某些技术术语是可以接受的，这里只是警告性检查
            console.warn(`可能包含英文单词的中文翻译 ${path}: "${value}"`);
          }
        }
      });
    });

    test('英文翻译应该符合基本语法规范', () => {
      const enPaths = getKeyPaths(enMessages);
      
      enPaths.forEach(path => {
        const value = getValueByPath(enMessages, path) as string;
        
        if (typeof value === 'string' && value.length > 0) {
          // 检查句子结构（如果以大写字母开头且长度超过10，应该有适当的标点）
          if (value.length > 10 && /^[A-Z]/.test(value) && !value.includes('{')) {
            const hasProperEnding = /[.!?]$/.test(value) || 
                                   value.endsWith('...') || 
                                   path.includes('title') ||
                                   path.includes('name') ||
                                   path.includes('label');
            
            if (!hasProperEnding && value.split(' ').length > 3) {
              console.warn(`可能缺少标点的英文翻译 ${path}: "${value}"`);
            }
          }
        }
      });
    });
  });

  describe('模块特定检查', () => {
    test('error 模块应该有完整的错误分类', () => {
      const expectedCategories = [
        'network', 'data', 'filesystem', 'device', 'user_input', 
        'system', 'config', 'performance', 'security', 'unknown'
      ];
      
      expectedCategories.forEach(category => {
        expect(enMessages.error.category).toHaveProperty(category);
        expect(zhMessages.error.category).toHaveProperty(category);
      });
    });

    test('severity 级别应该完整', () => {
      const severityLevels = ['info', 'warning', 'error', 'critical', 'fatal'];
      
      severityLevels.forEach(level => {
        expect(enMessages.error.severity).toHaveProperty(level);
        expect(zhMessages.error.severity).toHaveProperty(level);
      });
    });

    test('export 格式应该包含所有支持的格式', () => {
      const exportFormats = ['csv', 'json', 'xml', 'excel', 'binary'];
      
      exportFormats.forEach(format => {
        expect(enMessages.export).toHaveProperty(format);
        expect(zhMessages.export).toHaveProperty(format);
      });
    });

    test('license 模块应该包含许可证类型', () => {
      const licenseTypes = ['gpl', 'commercial', 'trial'];
      
      licenseTypes.forEach(type => {
        expect(enMessages.license).toHaveProperty(type);
        expect(zhMessages.license).toHaveProperty(type);
      });
    });
  });

  describe('特殊字符和格式化', () => {
    test('应该正确处理特殊字符', () => {
      // 检查是否有正确的引号使用
      const enPaths = getKeyPaths(enMessages);
      
      enPaths.forEach(path => {
        const enValue = getValueByPath(enMessages, path) as string;
        const zhValue = getValueByPath(zhMessages, path) as string;
        
        if (typeof enValue === 'string' && typeof zhValue === 'string') {
          // 检查中文引号的使用
          if (zhValue.includes('"') || zhValue.includes("'")) {
            // 中文应该使用中文引号
            const hasChineseQuotes = zhValue.includes('"') || zhValue.includes('"') ||
                                    zhValue.includes(''') || zhValue.includes(''');
            
            if (!hasChineseQuotes && zhValue.match(/[\u4e00-\u9fa5]/)) {
              console.warn(`中文翻译建议使用中文引号 ${path}: "${zhValue}"`);
            }
          }
        }
      });
    });

    test('版权符号应该正确使用', () => {
      expect(enMessages.app.copyright).toContain('©');
      expect(zhMessages.app.copyright).toContain('©');
    });

    test('温度单位应该使用正确的符号', () => {
      expect(enMessages.units.celsius).toContain('°C');
      expect(enMessages.units.fahrenheit).toContain('°F');
      expect(zhMessages.units.celsius).toContain('摄氏度');
      expect(zhMessages.units.fahrenheit).toContain('华氏度');
    });
  });
});
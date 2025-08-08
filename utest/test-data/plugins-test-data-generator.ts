/**
 * Plugins模块测试数据生成器
 * 
 * 提供各种测试场景所需的完整数据集
 * 支持边界条件、错误场景、性能测试等多种用途
 */

import { 
  PluginManifest,
  ExtensionPoint,
  PluginCategory,
  DriverContribution,
  ParserContribution,
  WidgetContribution,
  ValidationResult,
  JSONSchema
} from '../../src/extension/plugins/types';
import { 
  PluginManifestFactory,
  ContributionFactory,
  ExtensionContextFactory,
  PluginModuleFactory
} from '../mocks/plugins-mock-factory';

/**
 * 完整测试场景数据生成器
 */
export class PluginTestDataGenerator {
  private static seed = 12345;

  /**
   * 生成随机数（可重复）
   */
  private static random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * 生成随机字符串
   */
  private static randomString(length: number = 8, prefix: string = ''): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(this.random() * chars.length));
    }
    return result;
  }

  /**
   * 重置随机种子
   */
  static resetSeed(): void {
    this.seed = 12345;
  }

  /**
   * 生成测试插件生态系统
   */
  static generatePluginEcosystem(): PluginTestEcosystem {
    this.resetSeed();

    // 核心插件（基础功能）
    const corePlugins = [
      this.generateCommunicationPlugin(),
      this.generateVisualizationPlugin(),
      this.generateDataProcessingPlugin(),
      this.generateExportPlugin()
    ];

    // 扩展插件（特殊功能）
    const extensionPlugins = [
      this.generateThemePlugin(),
      this.generateDebugPlugin(),
      this.generateAnalysisPlugin()
    ];

    // 测试插件（各种边界情况）
    const testPlugins = [
      this.generateMinimalPlugin(),
      this.generateMaximalPlugin(),
      this.generateInvalidPlugin(),
      this.generateCorruptedPlugin()
    ];

    return {
      core: corePlugins,
      extensions: extensionPlugins,
      tests: testPlugins,
      all: [...corePlugins, ...extensionPlugins, ...testPlugins]
    };
  }

  /**
   * 生成通信插件
   */
  static generateCommunicationPlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.communication-advanced',
      name: 'Advanced Communication Plugin',
      description: 'Enhanced communication protocols and drivers',
      category: 'communication',
      keywords: ['serial', 'communication', 'driver', 'protocol'],
      contributes: {
        drivers: [
          ContributionFactory.createDriver({
            id: 'advanced-uart',
            name: 'Advanced UART Driver',
            protocol: 'uart-advanced',
            platforms: ['linux', 'win32', 'darwin']
          }),
          ContributionFactory.createDriver({
            id: 'custom-ethernet',
            name: 'Custom Ethernet Driver',
            protocol: 'ethernet-custom'
          })
        ],
        parsers: [
          ContributionFactory.createParser({
            id: 'binary-parser',
            name: 'Binary Protocol Parser',
            supportedFormats: ['binary', 'hex']
          })
        ]
      }
    });
  }

  /**
   * 生成可视化插件
   */
  static generateVisualizationPlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.visualization-charts',
      name: 'Advanced Chart Widgets',
      description: 'Advanced visualization components and chart types',
      category: 'visualization',
      keywords: ['chart', 'graph', 'visualization', 'widget'],
      contributes: {
        widgets: [
          ContributionFactory.createWidget({
            id: 'heatmap-widget',
            name: 'Heatmap Widget',
            type: 'dataset',
            supportedDataTypes: ['number'],
            category: 'advanced'
          }),
          ContributionFactory.createWidget({
            id: 'waterfall-widget',
            name: 'Waterfall Chart Widget',
            type: 'dataset',
            supportedDataTypes: ['number', 'array']
          })
        ],
        renderers: [
          ContributionFactory.createRenderer({
            id: 'webgl-renderer',
            name: 'WebGL High Performance Renderer',
            supportedTypes: ['line', 'scatter', 'surface']
          })
        ]
      }
    });
  }

  /**
   * 生成数据处理插件
   */
  static generateDataProcessingPlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.data-processing',
      name: 'Data Processing Suite',
      description: 'Advanced data validation and transformation tools',
      category: 'data-processing',
      keywords: ['data', 'validation', 'transform', 'filter'],
      contributes: {
        validators: [
          ContributionFactory.createValidator({
            id: 'range-validator',
            name: 'Range Validator',
            validate: (data: any) => ({
              valid: typeof data === 'number' && data >= 0 && data <= 100,
              errors: typeof data !== 'number' || data < 0 || data > 100 ? ['Value out of range'] : []
            })
          })
        ],
        transformers: [
          ContributionFactory.createTransformer({
            id: 'unit-converter',
            name: 'Unit Converter',
            inputType: 'number',
            outputType: 'number',
            transform: (value: number) => value * 1000 // Convert to milli units
          }),
          ContributionFactory.createTransformer({
            id: 'json-flattener',
            name: 'JSON Flattener',
            inputType: 'object',
            outputType: 'object'
          })
        ]
      }
    });
  }

  /**
   * 生成导出插件
   */
  static generateExportPlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.export-formats',
      name: 'Export Format Extensions',
      description: 'Additional export formats and processors',
      category: 'export',
      keywords: ['export', 'format', 'save', 'data'],
      contributes: {
        exportFormats: [
          ContributionFactory.createExportFormat({
            id: 'parquet-format',
            name: 'Apache Parquet Format',
            extension: 'parquet',
            mimeType: 'application/octet-stream',
            description: 'Columnar storage format for analytics'
          }),
          ContributionFactory.createExportFormat({
            id: 'protobuf-format',
            name: 'Protocol Buffers Format',
            extension: 'pb',
            mimeType: 'application/x-protobuf'
          })
        ],
        exportProcessors: [
          ContributionFactory.createExportProcessor({
            id: 'compression-processor',
            name: 'Data Compression Processor',
            supportedFormats: ['csv', 'json', 'xml']
          })
        ]
      }
    });
  }

  /**
   * 生成主题插件
   */
  static generateThemePlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.dark-theme-pro',
      name: 'Dark Theme Pro',
      description: 'Professional dark theme with multiple variants',
      category: 'themes',
      keywords: ['theme', 'dark', 'ui', 'appearance'],
      contributes: {
        themes: [
          ContributionFactory.createTheme({
            id: 'dark-pro',
            name: 'Dark Pro',
            type: 'dark',
            path: 'themes/dark-pro.css'
          }),
          ContributionFactory.createTheme({
            id: 'dark-pro-blue',
            name: 'Dark Pro Blue',
            type: 'dark',
            path: 'themes/dark-pro-blue.css'
          })
        ],
        iconThemes: [
          ContributionFactory.createIconTheme({
            id: 'dark-icons',
            name: 'Dark Theme Icons',
            iconDefinitions: {
              'file': { iconPath: 'icons/file-dark.svg' },
              'folder': { iconPath: 'icons/folder-dark.svg' }
            }
          })
        ]
      }
    });
  }

  /**
   * 生成调试插件
   */
  static generateDebugPlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.debug-tools',
      name: 'Debug Tools Suite',
      description: 'Comprehensive debugging and analysis tools',
      category: 'tools',
      keywords: ['debug', 'analyze', 'monitor', 'profile'],
      contributes: {
        debugTools: [
          ContributionFactory.createDebugTool({
            id: 'protocol-analyzer',
            name: 'Protocol Analyzer',
            when: 'connected'
          }),
          ContributionFactory.createDebugTool({
            id: 'data-inspector',
            name: 'Data Inspector'
          })
        ],
        menus: [
          ContributionFactory.createMenu({
            id: 'debug-menu-analyze',
            label: 'Analyze Data',
            command: 'serialStudio.debug.analyze',
            group: 'debug'
          })
        ],
        toolbars: [
          ContributionFactory.createToolbar({
            id: 'debug-toolbar-monitor',
            label: 'Monitor',
            icon: 'monitor',
            command: 'serialStudio.debug.monitor',
            group: 'debug'
          })
        ]
      }
    });
  }

  /**
   * 生成分析插件
   */
  static generateAnalysisPlugin(): PluginManifest {
    return PluginManifestFactory.createValid({
      id: 'serial-studio.data-analysis',
      name: 'Data Analysis Toolkit',
      description: 'Statistical analysis and machine learning tools',
      category: 'tools',
      keywords: ['analysis', 'statistics', 'ml', 'ai'],
      contributes: {
        analysisTools: [
          ContributionFactory.createAnalysisTool({
            id: 'statistical-analyzer',
            name: 'Statistical Analyzer',
            supportedDataTypes: ['number', 'array']
          }),
          ContributionFactory.createAnalysisTool({
            id: 'pattern-detector',
            name: 'Pattern Detector',
            supportedDataTypes: ['array', 'timeseries']
          })
        ],
        settings: [
          ContributionFactory.createSettings({
            id: 'analysis-settings',
            title: 'Data Analysis Settings',
            properties: {
              'analysis.sampleSize': {
                type: 'number',
                default: 1000,
                description: 'Default sample size for analysis'
              },
              'analysis.confidence': {
                type: 'number',
                default: 0.95,
                description: 'Confidence level for statistical tests'
              }
            }
          })
        ]
      }
    });
  }

  /**
   * 生成最小插件（只包含必需字段）
   */
  static generateMinimalPlugin(): PluginManifest {
    return {
      id: 'minimal-plugin',
      name: 'Minimal Plugin',
      version: '1.0.0',
      description: 'Minimal plugin for testing',
      author: 'Test Author',
      license: 'MIT',
      engines: {
        vscode: '^1.60.0',
        serialStudio: '^1.0.0'
      },
      activationEvents: []
    };
  }

  /**
   * 生成最大插件（包含所有可能字段）
   */
  static generateMaximalPlugin(): PluginManifest {
    return PluginManifestFactory.createWithAllContributions();
  }

  /**
   * 生成无效插件（用于错误测试）
   */
  static generateInvalidPlugin(): Partial<PluginManifest> {
    return PluginManifestFactory.createInvalid(['id', 'name']);
  }

  /**
   * 生成损坏插件（字段类型错误）
   */
  static generateCorruptedPlugin(): any {
    return {
      id: 123, // 应该是字符串
      name: null, // 应该是字符串
      version: ['1', '0', '0'], // 应该是字符串
      description: true, // 应该是字符串
      author: { name: 'Test' }, // 应该是字符串
      license: 'MIT',
      engines: 'invalid', // 应该是对象
      activationEvents: 'not-an-array', // 应该是数组
      contributes: null // 应该是对象或undefined
    };
  }

  /**
   * 生成依赖关系测试数据
   */
  static generateDependencyTestData(): PluginDependencyTestData {
    const pluginA = PluginManifestFactory.createValid({
      id: 'plugin-a',
      name: 'Plugin A',
      dependencies: {}
    });

    const pluginB = PluginManifestFactory.createValid({
      id: 'plugin-b',
      name: 'Plugin B',
      dependencies: {
        'plugin-a': '1.0.0'
      }
    });

    const pluginC = PluginManifestFactory.createValid({
      id: 'plugin-c',
      name: 'Plugin C',
      dependencies: {
        'plugin-a': '1.0.0',
        'plugin-b': '1.0.0'
      }
    });

    const circularA = PluginManifestFactory.createValid({
      id: 'circular-a',
      name: 'Circular A',
      dependencies: {
        'circular-b': '1.0.0'
      }
    });

    const circularB = PluginManifestFactory.createValid({
      id: 'circular-b',
      name: 'Circular B',
      dependencies: {
        'circular-a': '1.0.0'
      }
    });

    return {
      simple: [pluginA],
      singleDep: [pluginA, pluginB],
      multipleDeps: [pluginA, pluginB, pluginC],
      circular: [circularA, circularB]
    };
  }

  /**
   * 生成版本兼容性测试数据
   */
  static generateVersionCompatibilityData(): VersionCompatibilityTestData {
    return {
      valid: [
        { version: '1.0.0', expected: true },
        { version: '1.0.0-alpha', expected: true },
        { version: '1.0.0-beta.1', expected: true },
        { version: '1.0.0+build.123', expected: true },
        { version: '1.0.0-alpha+build.123', expected: true },
        { version: '0.1.0', expected: true },
        { version: '10.20.30', expected: true }
      ],
      invalid: [
        { version: '1.0', expected: false },
        { version: 'v1.0.0', expected: false },
        { version: '1.0.0.0', expected: false },
        { version: '1.0.0-', expected: false },
        { version: '1.0.0+', expected: false },
        { version: '', expected: false },
        { version: 'latest', expected: false }
      ]
    };
  }

  /**
   * 生成ID格式测试数据
   */
  static generateIdFormatTestData(): IdFormatTestData {
    return {
      valid: [
        { id: 'simple', expected: true },
        { id: 'plugin-name', expected: true },
        { id: 'plugin.name', expected: true },
        { id: 'namespace.plugin-name', expected: true },
        { id: 'a', expected: true },
        { id: 'plugin123', expected: true },
        { id: 'PLUGIN', expected: true },
        { id: 'Plugin-Name.123', expected: true }
      ],
      invalid: [
        { id: '', expected: false },
        { id: 'plugin name', expected: false },
        { id: 'plugin@name', expected: false },
        { id: 'plugin#name', expected: false },
        { id: 'plugin/name', expected: false },
        { id: 'plugin\\name', expected: false },
        { id: 'a'.repeat(101), expected: false },
        { id: '123plugin', expected: true }, // Actually valid
        { id: '-plugin', expected: true }, // Actually valid
        { id: 'plugin-', expected: true } // Actually valid
      ]
    };
  }

  /**
   * 生成贡献验证测试数据
   */
  static generateContributionValidationData(): ContributionValidationTestData {
    return {
      drivers: {
        valid: [
          ContributionFactory.createDriver(),
          ContributionFactory.createDriver({
            platforms: ['linux']
          }),
          ContributionFactory.createDriver({
            icon: undefined
          })
        ],
        invalid: [
          { name: 'Missing ID', protocol: 'test' }, // Missing id
          { id: 'test', protocol: 'test' }, // Missing name
          { id: 'test', name: 'Test' }, // Missing protocol
          {} // Missing all required fields
        ]
      },
      widgets: {
        valid: [
          ContributionFactory.createWidget(),
          ContributionFactory.createWidget({
            type: 'group'
          }),
          ContributionFactory.createWidget({
            supportedDataTypes: []
          })
        ],
        invalid: [
          { name: 'Missing ID', type: 'dataset' }, // Missing id
          { id: 'test', type: 'dataset' }, // Missing name
          { id: 'test', name: 'Test' }, // Missing type
          { id: 'test', name: 'Test', type: 'invalid' } // Invalid type
        ]
      },
      parsers: {
        valid: [
          ContributionFactory.createParser(),
          ContributionFactory.createParser({
            description: undefined
          })
        ],
        invalid: [
          { name: 'Missing ID' }, // Missing id
          { id: 'test' }, // Missing name
          {} // Missing all required fields
        ]
      }
    };
  }

  /**
   * 生成性能测试数据
   */
  static generatePerformanceTestData(): PerformanceTestData {
    const smallDataset = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random() * 100
    }));

    const mediumDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random() * 100
    }));

    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random() * 100
    }));

    return {
      small: {
        size: smallDataset.length,
        data: smallDataset
      },
      medium: {
        size: mediumDataset.length,
        data: mediumDataset
      },
      large: {
        size: largeDataset.length,
        data: largeDataset
      }
    };
  }
}

/**
 * 类型定义
 */
export interface PluginTestEcosystem {
  core: PluginManifest[];
  extensions: PluginManifest[];
  tests: PluginManifest[];
  all: PluginManifest[];
}

export interface PluginDependencyTestData {
  simple: PluginManifest[];
  singleDep: PluginManifest[];
  multipleDeps: PluginManifest[];
  circular: PluginManifest[];
}

export interface VersionCompatibilityTestData {
  valid: Array<{ version: string; expected: boolean }>;
  invalid: Array<{ version: string; expected: boolean }>;
}

export interface IdFormatTestData {
  valid: Array<{ id: string; expected: boolean }>;
  invalid: Array<{ id: string; expected: boolean }>;
}

export interface ContributionValidationTestData {
  drivers: {
    valid: DriverContribution[];
    invalid: any[];
  };
  widgets: {
    valid: WidgetContribution[];
    invalid: any[];
  };
  parsers: {
    valid: ParserContribution[];
    invalid: any[];
  };
}

export interface PerformanceTestData {
  small: { size: number; data: any[] };
  medium: { size: number; data: any[] };
  large: { size: number; data: any[] };
}

/**
 * 便利导出函数
 */
export function generateTestEcosystem(): PluginTestEcosystem {
  return PluginTestDataGenerator.generatePluginEcosystem();
}

export function generateDependencyData(): PluginDependencyTestData {
  return PluginTestDataGenerator.generateDependencyTestData();
}

export function generateVersionData(): VersionCompatibilityTestData {
  return PluginTestDataGenerator.generateVersionCompatibilityData();
}

export function generateIdData(): IdFormatTestData {
  return PluginTestDataGenerator.generateIdFormatTestData();
}

export function generateContributionData(): ContributionValidationTestData {
  return PluginTestDataGenerator.generateContributionValidationData();
}

export function generatePerformanceData(): PerformanceTestData {
  return PluginTestDataGenerator.generatePerformanceTestData();
}
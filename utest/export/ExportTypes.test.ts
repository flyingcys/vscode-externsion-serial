/**
 * ExportTypes.test.ts
 * Export模块类型系统完整测试
 * Coverage Target: 100% lines, 100% branches, 100% functions
 */

import { describe, test, expect } from 'vitest';
import {
  // 枚举类型
  ExportFormatType,
  StreamingExportState,
  DataSourceType,
  
  // 接口类型
  ExportConfig,
  ExportResult,
  ExportProgress,
  ExportData,
  ExportMetadata,
  DatasetInfo,
  FilterCondition,
  DataTransformation,
  ExportFormat,
  ExportTask,
  DataPoint,
  TimestampFrame,
  StreamingExportConfig,
  StreamingExportProgress,
  StreamingExportHandle,
  CustomExportFormatOptions,
  LargeDataProcessingOptions,
  EnhancedStreamingExportConfig,
  ExportStatistics,
  
  // 格式选项类型
  CSVOptions,
  JSONOptions,
  ExcelOptions,
  XMLOptions,
  TXTOptions,
  BinaryOptions,
  CSVWriteOptions,
  ChartConfig,
  
  // 错误类和接口
  ExportError,
  DataExporter,
  ExportManager
} from '../../src/extension/export/types';

describe('Export Types 完整测试', () => {
  
  describe('1. 枚举类型测试', () => {
    test('ExportFormatType - 应该包含所有6种格式', () => {
      expect(ExportFormatType.CSV).toBe('csv');
      expect(ExportFormatType.JSON).toBe('json');
      expect(ExportFormatType.EXCEL).toBe('excel');
      expect(ExportFormatType.XML).toBe('xml');
      expect(ExportFormatType.TXT).toBe('txt');
      expect(ExportFormatType.BINARY).toBe('binary');
      
      // 验证枚举值数量
      const values = Object.values(ExportFormatType);
      expect(values).toHaveLength(6);
    });

    test('StreamingExportState - 应该包含所有6种状态', () => {
      expect(StreamingExportState.PREPARING).toBe('preparing');
      expect(StreamingExportState.WRITING).toBe('writing');
      expect(StreamingExportState.PAUSED).toBe('paused');
      expect(StreamingExportState.COMPLETED).toBe('completed');
      expect(StreamingExportState.CANCELLED).toBe('cancelled');
      expect(StreamingExportState.ERROR).toBe('error');
      
      // 验证枚举值数量
      const values = Object.values(StreamingExportState);
      expect(values).toHaveLength(6);
    });

    test('DataSourceType - 应该包含所有4种数据源类型', () => {
      expect(DataSourceType.CURRENT).toBe('current');
      expect(DataSourceType.HISTORICAL).toBe('historical');
      expect(DataSourceType.RANGE).toBe('range');
      expect(DataSourceType.SELECTION).toBe('selection');
      
      // 验证枚举值数量
      const values = Object.values(DataSourceType);
      expect(values).toHaveLength(4);
    });
  });

  describe('2. 核心配置接口测试', () => {
    test('ExportConfig - 应该支持完整的导出配置', () => {
      const config: ExportConfig = {
        dataSource: {
          type: DataSourceType.RANGE,
          range: {
            startTime: new Date('2023-01-01'),
            endTime: new Date('2023-01-31')
          },
          datasets: ['temp', 'humidity'],
          groups: ['sensors', 'environmental']
        },
        format: {
          type: ExportFormatType.CSV,
          options: {
            delimiter: ',',
            quote: '"',
            escape: '"',
            encoding: 'utf-8',
            includeHeader: true,
            lineEnding: '\n'
          } as CSVOptions
        },
        file: {
          path: '/test/export.csv',
          name: 'export.csv',
          overwrite: true
        },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2,
          stopOnError: true
        },
        filters: {
          timeRange: [new Date('2023-01-01'), new Date('2023-01-31')],
          valueRange: [0, 100],
          conditions: [{
            columnIndex: 0,
            operator: 'greater_than',
            value: 50,
            logicalOperator: 'AND'
          }]
        }
      };

      expect(config.dataSource.type).toBe(DataSourceType.RANGE);
      expect(config.format.type).toBe(ExportFormatType.CSV);
      expect(config.file.path).toBe('/test/export.csv');
      expect(config.processing.precision).toBe(2);
      expect(config.filters.valueRange).toEqual([0, 100]);
    });

    test('ExportResult - 应该包含导出结果信息', () => {
      const result: ExportResult = {
        success: true,
        filePath: '/test/result.csv',
        fileSize: 2048,
        recordCount: 100,
        duration: 1500,
        checksum: 'abc123def456',
        errors: [new ExportError('Warning: Large dataset', 'WARN_LARGE_DATA')]
      };

      expect(result.success).toBe(true);
      expect(result.filePath).toBe('/test/result.csv');
      expect(result.fileSize).toBe(2048);
      expect(result.recordCount).toBe(100);
      expect(result.duration).toBe(1500);
      expect(result.checksum).toBe('abc123def456');
      expect(result.errors).toHaveLength(1);
    });

    test('ExportProgress - 应该跟踪导出进度', () => {
      const progress: ExportProgress = {
        taskId: 'export_123',
        stage: 'writing',
        percentage: 75.5,
        processedRecords: 750,
        totalRecords: 1000,
        estimatedTimeRemaining: 5000,
        currentFile: '/test/chunk_3.csv'
      };

      expect(progress.taskId).toBe('export_123');
      expect(progress.stage).toBe('writing');
      expect(progress.percentage).toBe(75.5);
      expect(progress.processedRecords).toBe(750);
      expect(progress.totalRecords).toBe(1000);
      expect(progress.estimatedTimeRemaining).toBe(5000);
      expect(progress.currentFile).toBe('/test/chunk_3.csv');
    });
  });

  describe('3. 数据结构接口测试', () => {
    test('ExportData - 应该支持同步和异步数据', () => {
      // 同步数据结构
      const syncData: ExportData = {
        headers: ['timestamp', 'value1', 'value2'],
        records: [
          ['2023-01-01T00:00:00Z', '10.5', '20.3'],
          ['2023-01-01T00:01:00Z', '11.2', '21.1']
        ],
        totalRecords: 2,
        datasets: [{
          id: 'value1',
          title: 'Temperature',
          units: '°C',
          dataType: 'number',
          widget: 'gauge',
          group: 'sensors'
        }],
        metadata: {
          exportTime: '2023-01-01T12:00:00Z',
          version: '1.0.0',
          source: 'Test Suite'
        }
      };

      expect(syncData.headers).toHaveLength(3);
      expect(Array.isArray(syncData.records)).toBe(true);
      expect(syncData.totalRecords).toBe(2);
      expect(syncData.datasets).toHaveLength(1);
      expect(syncData.metadata?.version).toBe('1.0.0');
    });

    test('DatasetInfo - 应该包含完整的数据集描述', () => {
      const dataset: DatasetInfo = {
        id: 'sensor_01',
        title: 'Temperature Sensor',
        units: '°C',
        dataType: 'float',
        widget: 'line_chart',
        group: 'environmental'
      };

      expect(dataset.id).toBe('sensor_01');
      expect(dataset.title).toBe('Temperature Sensor');
      expect(dataset.units).toBe('°C');
      expect(dataset.dataType).toBe('float');
      expect(dataset.widget).toBe('line_chart');
      expect(dataset.group).toBe('environmental');
    });

    test('ExportMetadata - 应该包含导出元数据', () => {
      const metadata: ExportMetadata = {
        exportTime: '2023-01-01T12:00:00Z',
        version: '2.1.0',
        source: 'Serial-Studio VSCode Extension',
        projectInfo: {
          name: 'Environmental Monitoring',
          description: 'Temperature and humidity monitoring project',
          version: '1.5.0'
        },
        deviceInfo: {
          type: 'Arduino Uno',
          connection: 'USB Serial',
          settings: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
          }
        }
      };

      expect(metadata.exportTime).toBe('2023-01-01T12:00:00Z');
      expect(metadata.version).toBe('2.1.0');
      expect(metadata.source).toBe('Serial-Studio VSCode Extension');
      expect(metadata.projectInfo?.name).toBe('Environmental Monitoring');
      expect(metadata.deviceInfo?.type).toBe('Arduino Uno');
    });
  });

  describe('4. 过滤和转换类型测试', () => {
    test('FilterCondition - 应该支持所有过滤操作符', () => {
      const conditions: FilterCondition[] = [
        {
          columnIndex: 0,
          operator: 'equals',
          value: 'test_value',
          logicalOperator: 'AND'
        },
        {
          columnIndex: 1,
          operator: 'greater_than',
          value: 10.5
        },
        {
          columnIndex: 2,
          operator: 'in_range',
          value: [0, 100],
          logicalOperator: 'OR'
        },
        {
          columnIndex: 3,
          operator: 'regex',
          value: '^[A-Z]+$'
        }
      ];

      expect(conditions[0].operator).toBe('equals');
      expect(conditions[1].operator).toBe('greater_than');
      expect(conditions[2].operator).toBe('in_range');
      expect(conditions[3].operator).toBe('regex');
      expect(conditions[0].logicalOperator).toBe('AND');
      expect(conditions[2].logicalOperator).toBe('OR');
    });

    test('DataTransformation - 应该支持所有转换类型', () => {
      const transformations: DataTransformation[] = [
        {
          type: 'unit_conversion',
          config: {
            columnIndex: 1,
            fromUnit: 'fahrenheit',
            toUnit: 'celsius'
          }
        },
        {
          type: 'precision_round',
          config: {
            columnIndex: 2,
            precision: 3
          }
        },
        {
          type: 'date_format',
          config: {
            columnIndex: 0,
            fromFormat: 'YYYY-MM-DD',
            toFormat: 'MM/DD/YYYY'
          }
        },
        {
          type: 'custom_function',
          config: {
            columnIndex: 3,
            function: 'Math.sqrt'
          }
        }
      ];

      expect(transformations[0].type).toBe('unit_conversion');
      expect(transformations[1].type).toBe('precision_round');
      expect(transformations[2].type).toBe('date_format');
      expect(transformations[3].type).toBe('custom_function');
    });
  });

  describe('5. 格式选项类型测试', () => {
    test('CSVOptions - 应该支持完整的CSV配置', () => {
      const csvOptions: CSVOptions = {
        delimiter: '|',
        quote: "'",
        escape: '\\',
        encoding: 'iso-8859-1',
        includeHeader: true,
        lineEnding: '\r\n',
        precision: 4,
        dateFormat: 'YYYY-MM-DD HH:mm:ss'
      };

      expect(csvOptions.delimiter).toBe('|');
      expect(csvOptions.quote).toBe("'");
      expect(csvOptions.escape).toBe('\\');
      expect(csvOptions.encoding).toBe('iso-8859-1');
      expect(csvOptions.includeHeader).toBe(true);
      expect(csvOptions.lineEnding).toBe('\r\n');
      expect(csvOptions.precision).toBe(4);
      expect(csvOptions.dateFormat).toBe('YYYY-MM-DD HH:mm:ss');
    });

    test('JSONOptions - 应该支持JSON格式配置', () => {
      const jsonOptions: JSONOptions = {
        pretty: true,
        indent: 4,
        encoding: 'utf-8',
        includeMetadata: true,
        arrayFormat: false,
        compression: true
      };

      expect(jsonOptions.pretty).toBe(true);
      expect(jsonOptions.indent).toBe(4);
      expect(jsonOptions.encoding).toBe('utf-8');
      expect(jsonOptions.includeMetadata).toBe(true);
      expect(jsonOptions.arrayFormat).toBe(false);
      expect(jsonOptions.compression).toBe(true);
    });

    test('ExcelOptions - 应该支持Excel格式配置', () => {
      const chartConfig: ChartConfig = {
        type: 'line',
        position: { x: 100, y: 50 },
        size: { width: 400, height: 300 },
        series: {
          name: 'Temperature',
          categories: 'A2:A100',
          values: 'B2:B100'
        }
      };

      const excelOptions: ExcelOptions = {
        sheetName: 'SensorData',
        includeChart: true,
        autoFitColumns: true,
        includeMetadata: true,
        dateFormat: 'dd/mm/yyyy hh:mm:ss',
        numberFormat: '#,##0.00',
        chartConfig
      };

      expect(excelOptions.sheetName).toBe('SensorData');
      expect(excelOptions.includeChart).toBe(true);
      expect(excelOptions.autoFitColumns).toBe(true);
      expect(excelOptions.chartConfig?.type).toBe('line');
      expect(excelOptions.chartConfig?.position.x).toBe(100);
    });

    test('XMLOptions - 应该支持XML格式配置', () => {
      const xmlOptions: XMLOptions = {
        rootElement: 'sensorData',
        recordElement: 'measurement',
        includeAttributes: true,
        prettyPrint: true,
        encoding: 'utf-8'
      };

      expect(xmlOptions.rootElement).toBe('sensorData');
      expect(xmlOptions.recordElement).toBe('measurement');
      expect(xmlOptions.includeAttributes).toBe(true);
      expect(xmlOptions.prettyPrint).toBe(true);
      expect(xmlOptions.encoding).toBe('utf-8');
    });

    test('TXTOptions - 应该支持文本格式配置', () => {
      const txtOptions: TXTOptions = {
        delimiter: '\t',
        encoding: 'ascii',
        includeHeader: false,
        lineEnding: '\n'
      };

      expect(txtOptions.delimiter).toBe('\t');
      expect(txtOptions.encoding).toBe('ascii');
      expect(txtOptions.includeHeader).toBe(false);
      expect(txtOptions.lineEnding).toBe('\n');
    });

    test('BinaryOptions - 应该支持二进制格式配置', () => {
      const binaryOptions: BinaryOptions = {
        encoding: 'binary',
        compression: true
      };

      expect(binaryOptions.encoding).toBe('binary');
      expect(binaryOptions.compression).toBe(true);
    });
  });

  describe('6. 流式导出类型测试', () => {
    test('DataPoint - 应该支持数据点结构', () => {
      const dataPoint: DataPoint = {
        timestamp: new Date('2023-01-01T12:00:00Z'),
        values: [25.3, 65.8, 1013.2],
        metadata: {
          groupTitle: 'Environmental Sensors',
          datasetTitles: ['Temperature', 'Humidity', 'Pressure'],
          units: ['°C', '%', 'hPa'],
          sensorId: 'ENV_001',
          location: 'Lab Room A'
        }
      };

      expect(dataPoint.timestamp).toBeInstanceOf(Date);
      expect(dataPoint.values).toHaveLength(3);
      expect(dataPoint.metadata?.groupTitle).toBe('Environmental Sensors');
      expect(dataPoint.metadata?.datasetTitles).toHaveLength(3);
      expect(dataPoint.metadata?.units).toHaveLength(3);
    });

    test('TimestampFrame - 应该支持时间戳帧结构', () => {
      const frame: TimestampFrame = {
        data: {
          timestamp: new Date('2023-01-01T12:00:00Z'),
          values: [10.5, 20.3],
          metadata: {
            groupTitle: 'Test Group'
          }
        },
        rxDateTime: new Date('2023-01-01T12:00:01Z')
      };

      expect(frame.data.timestamp).toBeInstanceOf(Date);
      expect(frame.data.values).toEqual([10.5, 20.3]);
      expect(frame.rxDateTime).toBeInstanceOf(Date);
    });

    test('StreamingExportConfig - 应该支持流式导出配置', () => {
      const streamConfig: StreamingExportConfig = {
        outputDirectory: '/test/streaming',
        filePrefix: 'sensor_data_',
        actualFilePath: '/test/streaming/sensor_data_20230101_120000.csv',
        csvOptions: {
          delimiter: ',',
          quote: '"',
          escape: '"',
          lineEnding: '\n',
          encoding: 'utf-8'
        },
        includeTimestamp: true,
        headers: ['timestamp', 'temp', 'humidity'],
        selectedFields: [0, 1, 2],
        precision: 2,
        bufferSize: 8192,
        writeInterval: 1000,
        chunkSize: 1000
      };

      expect(streamConfig.outputDirectory).toBe('/test/streaming');
      expect(streamConfig.filePrefix).toBe('sensor_data_');
      expect(streamConfig.actualFilePath).toContain('sensor_data_20230101');
      expect(streamConfig.includeTimestamp).toBe(true);
      expect(streamConfig.headers).toHaveLength(3);
      expect(streamConfig.selectedFields).toEqual([0, 1, 2]);
    });

    test('StreamingExportProgress - 应该跟踪流式导出进度', () => {
      const streamProgress: StreamingExportProgress = {
        handleId: 'stream_123',
        state: StreamingExportState.WRITING,
        percentage: 85.7,
        recordsWritten: 8570,
        totalRecords: 10000,
        bytesWritten: 524288,
        estimatedTimeRemaining: 15000,
        currentChunk: 9,
        totalChunks: 10
      };

      expect(streamProgress.handleId).toBe('stream_123');
      expect(streamProgress.state).toBe(StreamingExportState.WRITING);
      expect(streamProgress.percentage).toBe(85.7);
      expect(streamProgress.recordsWritten).toBe(8570);
      expect(streamProgress.totalRecords).toBe(10000);
      expect(streamProgress.bytesWritten).toBe(524288);
      expect(streamProgress.estimatedTimeRemaining).toBe(15000);
      expect(streamProgress.currentChunk).toBe(9);
      expect(streamProgress.totalChunks).toBe(10);
    });

    test('StreamingExportHandle - 应该管理导出句柄状态', () => {
      const handle: StreamingExportHandle = {
        id: 'handle_456',
        config: {
          outputDirectory: '/test',
          headers: ['time', 'value'],
          selectedFields: [0, 1],
          includeTimestamp: true
        },
        startTime: Date.now(),
        state: StreamingExportState.WRITING,
        error: null,
        progress: {
          handleId: 'handle_456',
          state: StreamingExportState.WRITING,
          percentage: 50,
          recordsWritten: 500,
          totalRecords: 1000,
          bytesWritten: 32768,
          estimatedTimeRemaining: 10000,
          currentChunk: 5,
          totalChunks: 10
        },
        cancelled: false,
        paused: false
      };

      expect(handle.id).toBe('handle_456');
      expect(handle.config.outputDirectory).toBe('/test');
      expect(handle.state).toBe(StreamingExportState.WRITING);
      expect(handle.error).toBeNull();
      expect(handle.progress.percentage).toBe(50);
      expect(handle.cancelled).toBe(false);
      expect(handle.paused).toBe(false);
    });
  });

  describe('7. 高级配置类型测试', () => {
    test('CustomExportFormatOptions - 应该支持自定义格式选项', () => {
      const customOptions: CustomExportFormatOptions = {
        fieldSelection: {
          enabled: true,
          selectedFields: [0, 2, 4],
          fieldOrder: [2, 0, 4]
        },
        customDelimiter: {
          enabled: true,
          delimiter: '|',
          customQuote: "'",
          customEscape: '\\'
        },
        dataFiltering: {
          enabled: true,
          timeRange: [new Date('2023-01-01'), new Date('2023-01-31')],
          valueRange: [0, 100],
          customConditions: [{
            columnIndex: 1,
            operator: 'greater_than',
            value: 50
          }]
        },
        dataTransformation: {
          enabled: true,
          transformations: [{
            type: 'precision_round',
            config: {
              columnIndex: 2,
              precision: 3
            }
          }]
        }
      };

      expect(customOptions.fieldSelection?.enabled).toBe(true);
      expect(customOptions.fieldSelection?.selectedFields).toEqual([0, 2, 4]);
      expect(customOptions.customDelimiter?.delimiter).toBe('|');
      expect(customOptions.dataFiltering?.enabled).toBe(true);
      expect(customOptions.dataTransformation?.enabled).toBe(true);
    });

    test('LargeDataProcessingOptions - 应该支持大数据处理选项', () => {
      const largeDataOptions: LargeDataProcessingOptions = {
        chunkExport: {
          enabled: true,
          chunkSize: 10000,
          maxMemoryUsage: 512
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          level: 6
        },
        pauseResume: {
          enabled: true,
          autoSaveInterval: 5000,
          resumeFile: '/tmp/export_resume.json'
        }
      };

      expect(largeDataOptions.chunkExport?.enabled).toBe(true);
      expect(largeDataOptions.chunkExport?.chunkSize).toBe(10000);
      expect(largeDataOptions.compression?.algorithm).toBe('gzip');
      expect(largeDataOptions.pauseResume?.autoSaveInterval).toBe(5000);
    });

    test('EnhancedStreamingExportConfig - 应该扩展基础流式配置', () => {
      const enhancedConfig: EnhancedStreamingExportConfig = {
        // 基础配置
        outputDirectory: '/test/enhanced',
        headers: ['timestamp', 'sensor1', 'sensor2'],
        selectedFields: [0, 1, 2],
        includeTimestamp: true,
        bufferSize: 16384,
        writeInterval: 500,
        chunkSize: 2000,
        
        // 增强配置
        customFormatOptions: {
          fieldSelection: {
            enabled: true,
            selectedFields: [0, 1, 2],
            fieldOrder: [0, 1, 2]
          },
          customDelimiter: {
            enabled: false,
            delimiter: ','
          },
          dataFiltering: {
            enabled: false
          },
          dataTransformation: {
            enabled: false,
            transformations: []
          }
        },
        largeDataProcessing: {
          chunkExport: {
            enabled: true,
            chunkSize: 2000,
            maxMemoryUsage: 256
          },
          compression: {
            enabled: false,
            algorithm: 'gzip'
          },
          pauseResume: {
            enabled: true,
            autoSaveInterval: 10000
          }
        }
      };

      expect(enhancedConfig.outputDirectory).toBe('/test/enhanced');
      expect(enhancedConfig.customFormatOptions?.fieldSelection?.enabled).toBe(true);
      expect(enhancedConfig.largeDataProcessing?.chunkExport?.enabled).toBe(true);
    });

    test('ExportStatistics - 应该收集导出统计信息', () => {
      const stats: ExportStatistics = {
        totalRecords: 50000,
        totalBytes: 2048576,
        averageRecordSize: 40.97,
        exportDuration: 15750,
        averageWriteSpeed: 3174.6,
        peakMemoryUsage: 128.5,
        compressionRatio: 0.75
      };

      expect(stats.totalRecords).toBe(50000);
      expect(stats.totalBytes).toBe(2048576);
      expect(stats.averageRecordSize).toBeCloseTo(40.97, 2);
      expect(stats.exportDuration).toBe(15750);
      expect(stats.averageWriteSpeed).toBeCloseTo(3174.6, 1);
      expect(stats.peakMemoryUsage).toBe(128.5);
      expect(stats.compressionRatio).toBe(0.75);
    });
  });

  describe('8. 错误和接口类型测试', () => {
    test('ExportError - 应该正确创建导出错误', () => {
      const error1 = new ExportError('Test error message');
      expect(error1.message).toBe('Test error message');
      expect(error1.name).toBe('ExportError');
      expect(error1.code).toBeUndefined();

      const error2 = new ExportError('Coded error', 'ERR_INVALID_FORMAT');
      expect(error2.message).toBe('Coded error');
      expect(error2.code).toBe('ERR_INVALID_FORMAT');
      expect(error2.name).toBe('ExportError');
    });

    test('ExportFormat - 应该描述导出格式信息', () => {
      const format: ExportFormat = {
        type: ExportFormatType.CSV,
        name: 'CSV (Comma Separated Values)',
        extensions: ['.csv'],
        description: 'Comma-separated values format',
        options: {
          delimiter: ',',
          quote: '"',
          encoding: 'utf-8'
        }
      };

      expect(format.type).toBe(ExportFormatType.CSV);
      expect(format.name).toBe('CSV (Comma Separated Values)');
      expect(format.extensions).toEqual(['.csv']);
      expect(format.description).toContain('Comma-separated');
      expect(format.options.delimiter).toBe(',');
    });

    test('ExportTask - 应该跟踪导出任务', () => {
      const task: ExportTask = {
        id: 'task_789',
        config: {
          dataSource: { type: DataSourceType.CURRENT },
          format: { type: ExportFormatType.JSON, options: {} },
          file: { path: '/test/task.json', name: 'task.json', overwrite: true },
          processing: {
            includeMetadata: true,
            includeTimestamps: true,
            compression: false,
            encoding: 'utf-8',
            precision: 2
          },
          filters: {}
        },
        startTime: Date.now(),
        cancelled: false
      };

      expect(task.id).toBe('task_789');
      expect(task.config.format.type).toBe(ExportFormatType.JSON);
      expect(task.cancelled).toBe(false);
      expect(typeof task.startTime).toBe('number');
    });
  });

  describe('9. 接口兼容性测试', () => {
    test('DataExporter接口 - 应该定义正确的方法签名', () => {
      // 这里测试接口结构，确保类型定义正确
      const mockExporter: DataExporter = {
        exportData: async (data, filePath) => ({
          success: true,
          filePath,
          fileSize: 1024,
          recordCount: data.totalRecords,
          duration: 1000
        }),
        getSupportedFormats: () => [{
          type: ExportFormatType.CSV,
          name: 'CSV',
          extensions: ['.csv'],
          description: 'CSV format',
          options: {}
        }],
        validateConfig: (config) => config !== null
      };

      expect(typeof mockExporter.exportData).toBe('function');
      expect(typeof mockExporter.getSupportedFormats).toBe('function');
      expect(typeof mockExporter.validateConfig).toBe('function');
    });

    test('ExportManager接口 - 应该定义正确的管理器方法', () => {
      const mockManager: ExportManager = {
        exportData: async (config) => ({
          success: true,
          filePath: config.file.path,
          fileSize: 1024,
          recordCount: 100,
          duration: 1000
        }),
        getSupportedFormats: () => [{
          type: ExportFormatType.CSV,
          name: 'CSV',
          extensions: ['.csv'],
          description: 'CSV format',
          options: {}
        }],
        onProgress: (callback) => {
          // Mock implementation
        },
        cancelExport: async (taskId) => {
          // Mock implementation
        }
      };

      expect(typeof mockManager.exportData).toBe('function');
      expect(typeof mockManager.getSupportedFormats).toBe('function');
      expect(typeof mockManager.onProgress).toBe('function');
      expect(typeof mockManager.cancelExport).toBe('function');
    });
  });

  describe('10. 类型联合和复杂类型测试', () => {
    test('FormatOptions联合类型 - 应该支持所有格式选项', () => {
      const csvOptions: CSVOptions = {
        delimiter: ',',
        quote: '"',
        escape: '"',
        encoding: 'utf-8',
        includeHeader: true,
        lineEnding: '\n'
      };

      const jsonOptions: JSONOptions = {
        pretty: true,
        indent: 2,
        encoding: 'utf-8',
        includeMetadata: true,
        arrayFormat: true
      };

      // 测试联合类型赋值
      let formatOption: CSVOptions | JSONOptions;
      formatOption = csvOptions;
      expect('delimiter' in formatOption).toBe(true);
      
      formatOption = jsonOptions;
      expect('pretty' in formatOption).toBe(true);
    });

    test('TransformationType和FilterOperator - 应该支持所有操作类型', () => {
      // 测试所有转换类型
      const transformTypes: ('unit_conversion' | 'precision_round' | 'date_format' | 'custom_function')[] = [
        'unit_conversion',
        'precision_round', 
        'date_format',
        'custom_function'
      ];
      
      expect(transformTypes).toHaveLength(4);

      // 测试所有过滤操作符
      const filterOps: ('equals' | 'not_equals' | 'greater_than' | 'less_than' | 
                       'greater_equal' | 'less_equal' | 'contains' | 'starts_with' | 
                       'ends_with' | 'regex' | 'in_range')[] = [
        'equals', 'not_equals', 'greater_than', 'less_than', 
        'greater_equal', 'less_equal', 'contains', 'starts_with',
        'ends_with', 'regex', 'in_range'
      ];

      expect(filterOps).toHaveLength(11);
    });

    test('CSVWriteOptions - 应该是CSVOptions的子集', () => {
      const writeOptions: CSVWriteOptions = {
        delimiter: '|',
        quote: "'",
        escape: '\\',
        lineEnding: '\r\n',
        encoding: 'utf-8'
      };

      expect(writeOptions.delimiter).toBe('|');
      expect(writeOptions.quote).toBe("'");
      expect(writeOptions.escape).toBe('\\');
      expect(writeOptions.lineEnding).toBe('\r\n');
      expect(writeOptions.encoding).toBe('utf-8');
    });
  });

  describe('11. 边界条件和空值处理', () => {
    test('可选字段 - 应该正确处理未定义的可选字段', () => {
      // 最小化的ExportConfig
      const minimalConfig: ExportConfig = {
        dataSource: { type: DataSourceType.CURRENT },
        format: { type: ExportFormatType.CSV, options: {} as CSVOptions },
        file: { path: '/test.csv', name: 'test.csv', overwrite: true },
        processing: {
          includeMetadata: true,
          includeTimestamps: true,
          compression: false,
          encoding: 'utf-8',
          precision: 2
        },
        filters: {}
      };

      expect(minimalConfig.dataSource.range).toBeUndefined();
      expect(minimalConfig.dataSource.datasets).toBeUndefined();
      expect(minimalConfig.processing.stopOnError).toBeUndefined();
    });

    test('空数组和对象 - 应该正确处理空值', () => {
      const emptyData: ExportData = {
        headers: [],
        records: [],
        totalRecords: 0,
        datasets: []
      };

      expect(emptyData.headers).toHaveLength(0);
      expect(Array.isArray(emptyData.records)).toBe(true);
      expect(emptyData.totalRecords).toBe(0);
      expect(emptyData.datasets).toHaveLength(0);
      expect(emptyData.metadata).toBeUndefined();
    });

    test('错误状态处理 - 应该支持各种错误状态', () => {
      const errorHandle: StreamingExportHandle = {
        id: 'error_handle',
        config: {
          outputDirectory: '/test',
          headers: ['time'],
          selectedFields: [0],
          includeTimestamp: true
        },
        startTime: Date.now(),
        state: StreamingExportState.ERROR,
        error: new ExportError('Disk full', 'ERR_DISK_FULL'),
        progress: {
          handleId: 'error_handle',
          state: StreamingExportState.ERROR,
          percentage: 0,
          recordsWritten: 0,
          totalRecords: 1000,
          bytesWritten: 0,
          estimatedTimeRemaining: 0,
          currentChunk: 0,
          totalChunks: 10
        },
        cancelled: false,
        paused: false
      };

      expect(errorHandle.state).toBe(StreamingExportState.ERROR);
      expect(errorHandle.error).toBeInstanceOf(ExportError);
      expect(errorHandle.error?.code).toBe('ERR_DISK_FULL');
      expect(errorHandle.progress.percentage).toBe(0);
    });
  });
});
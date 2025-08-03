# CSV 导出功能使用说明

## 概述

Serial-Studio VSCode 插件提供了强大的 CSV 数据导出功能，支持实时数据流导出、批量数据处理、多种数据格式和高性能流式处理。本指南将详细介绍如何配置和使用 CSV 导出功能。

## 1. CSV 导出功能特点

### 1.1 核心特性

- **流式导出**：支持大数据量的实时流式导出，不受内存限制
- **批量处理**：高效的批量数据处理，提升导出性能
- **多格式支持**：支持标准 CSV、TSV、自定义分隔符格式
- **数据压缩**：支持 GZIP 压缩，减少文件大小
- **增量导出**：支持增量数据导出，避免重复处理
- **并行处理**：多线程并行导出，提升处理速度

### 1.2 支持的数据类型

- 原始串口数据
- 解析后的结构化数据
- 统计和聚合数据
- 时间序列数据
- 自定义计算字段

## 2. 基本配置

### 2.1 导出配置

在项目配置文件中设置 CSV 导出参数：

```json
{
  "csv": {
    "export": {
      "enabled": true,
      "outputPath": "./exports",
      "fileNameTemplate": "data_{{timestamp}}_{{deviceId}}.csv",
      "delimiter": ",",
      "encoding": "utf8",
      "includeHeaders": true,
      "enableCompression": false,
      "enableStreaming": true
    }
  }
}
```

### 2.2 基本配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 是否启用 CSV 导出 |
| `outputPath` | string | "./exports" | 导出文件目录 |
| `fileNameTemplate` | string | 自动生成 | 文件名模板 |
| `delimiter` | string | "," | 字段分隔符 |
| `encoding` | string | "utf8" | 文件编码 |
| `includeHeaders` | boolean | true | 是否包含列标题 |
| `enableCompression` | boolean | false | 是否启用压缩 |
| `enableStreaming` | boolean | true | 是否启用流式导出 |

## 3. 高级配置

### 3.1 流式导出配置

```json
{
  "csv": {
    "streaming": {
      "enabled": true,
      "bufferSize": 1048576,
      "flushInterval": 1000,
      "chunkSize": 10000,
      "enableBackpressure": true,
      "maxMemoryUsage": "256MB",
      "writeTimeout": 5000
    }
  }
}
```

#### 流式导出参数说明

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| `bufferSize` | 1MB | 缓冲区大小 |
| `flushInterval` | 500-2000ms | 缓冲区刷新间隔 |
| `chunkSize` | 5000-20000 | 数据块大小 |
| `enableBackpressure` | true | 启用背压控制 |
| `maxMemoryUsage` | 256MB | 最大内存使用量 |

### 3.2 批量处理配置

```json
{
  "csv": {
    "batch": {
      "enabled": true,
      "batchSize": 5000,
      "maxBatches": 10,
      "processingTimeout": 30000,
      "enableParallelProcessing": true,
      "workerThreads": 2,
      "retryAttempts": 3
    }
  }
}
```

### 3.3 数据格式配置

```json
{
  "csv": {
    "format": {
      "dateFormat": "YYYY-MM-DD HH:mm:ss.SSS",
      "numberFormat": {
        "precision": 6,
        "useExponential": false,
        "decimalSeparator": ".",
        "thousandsSeparator": ""
      },
      "booleanFormat": {
        "trueValue": "true",
        "falseValue": "false"
      },
      "nullValue": "",
      "quoteStrings": true,
      "escapeQuotes": true
    }
  }
}
```

## 4. 使用方法

### 4.1 基本导出操作

#### 通过命令面板导出

1. 打开命令面板 (`Ctrl+Shift+P`)
2. 搜索并执行 "Serial Studio: Export to CSV"
3. 选择数据范围和导出选项
4. 指定输出文件路径

#### 通过代码导出

```typescript
import { CSVExporter } from '../shared/CSVExporter';

// 创建导出器实例
const exporter = new CSVExporter({
  outputPath: './exports/data.csv',
  includeHeaders: true,
  enableStreaming: true
});

// 导出数据
await exporter.export(dataArray);
```

### 4.2 实时数据导出

```typescript
import { StreamingCSVExporter } from '../shared/StreamingCSVExporter';

// 创建流式导出器
const streamExporter = new StreamingCSVExporter({
  outputPath: './exports/streaming_data.csv',
  flushInterval: 1000,
  chunkSize: 1000
});

// 开始流式导出
await streamExporter.start();

// 添加数据（可持续调用）
streamExporter.addData({
  timestamp: new Date(),
  temperature: 25.6,
  humidity: 60.2
});

// 结束导出
await streamExporter.finish();
```

### 4.3 批量数据导出

```typescript
import { BatchCSVExporter } from '../shared/BatchCSVExporter';

// 创建批量导出器
const batchExporter = new BatchCSVExporter({
  outputPath: './exports/batch_data.csv',
  batchSize: 5000,
  enableParallelProcessing: true
});

// 批量导出大数据集
const largeDataset = await loadLargeDataset();
await batchExporter.exportBatch(largeDataset);
```

## 5. 数据选择和过滤

### 5.1 时间范围选择

```json
{
  "csv": {
    "export": {
      "dataRange": {
        "type": "timeRange",
        "startTime": "2023-12-01T00:00:00Z",
        "endTime": "2023-12-01T23:59:59Z"
      }
    }
  }
}
```

### 5.2 数据组和数据集选择

```json
{
  "csv": {
    "export": {
      "dataSelection": {
        "includeGroups": ["sensors", "actuators"],
        "excludeGroups": ["debug"],
        "includeDatasets": ["temperature", "humidity", "pressure"],
        "excludeDatasets": ["raw_data"]
      }
    }
  }
}
```

### 5.3 数据过滤条件

```json
{
  "csv": {
    "export": {
      "filters": [
        {
          "field": "temperature",
          "operator": ">",
          "value": 20
        },
        {
          "field": "quality",
          "operator": ">=",
          "value": 0.8
        },
        {
          "field": "status",
          "operator": "in",
          "value": ["active", "running"]
        }
      ]
    }
  }
}
```

## 6. 文件命名和组织

### 6.1 文件名模板

支持的模板变量：

| 变量 | 示例 | 说明 |
|------|------|------|
| `{{timestamp}}` | 20231201_143022 | 当前时间戳 |
| `{{date}}` | 2023-12-01 | 当前日期 |
| `{{time}}` | 14:30:22 | 当前时间 |
| `{{deviceId}}` | device001 | 设备标识 |
| `{{groupId}}` | sensors | 数据组名称 |
| `{{datasetId}}` | temperature | 数据集名称 |
| `{{recordCount}}` | 10000 | 记录数量 |

#### 示例文件名模板

```json
{
  "csv": {
    "export": {
      "fileNameTemplates": {
        "daily": "{{deviceId}}_{{date}}.csv",
        "hourly": "{{deviceId}}_{{date}}_{{hour}}.csv",
        "dataset": "{{groupId}}_{{datasetId}}_{{timestamp}}.csv",
        "compressed": "{{deviceId}}_{{date}}.csv.gz"
      }
    }
  }
}
```

### 6.2 目录结构

```json
{
  "csv": {
    "export": {
      "directoryStructure": {
        "enabled": true,
        "template": "{{year}}/{{month}}/{{day}}/{{deviceId}}",
        "createDirectories": true
      }
    }
  }
}
```

生成的目录结构：
```
exports/
├── 2023/
│   ├── 12/
│   │   ├── 01/
│   │   │   ├── device001/
│   │   │   │   ├── data_143022.csv
│   │   │   │   └── data_143522.csv
│   │   │   └── device002/
│   │   │       └── data_143022.csv
│   │   └── 02/
│   └── 11/
```

## 7. 数据格式示例

### 7.1 基本 CSV 格式

```csv
timestamp,deviceId,groupId,datasetId,value,unit,quality
2023-12-01 14:30:22.123,device001,sensors,temperature,25.6,celsius,1.0
2023-12-01 14:30:23.124,device001,sensors,humidity,60.2,percent,1.0
2023-12-01 14:30:24.125,device001,sensors,pressure,1013.2,hPa,0.9
```

### 7.2 分组格式

```csv
timestamp,device001_temperature,device001_humidity,device002_temperature,device002_humidity
2023-12-01 14:30:22.123,25.6,60.2,24.8,58.5
2023-12-01 14:30:23.124,25.7,60.3,24.9,58.6
2023-12-01 14:30:24.125,25.8,60.1,25.0,58.4
```

### 7.3 扩展格式（包含元数据）

```csv
timestamp,deviceId,frameId,groupId,datasetId,value,unit,quality,flags,checksum
2023-12-01 14:30:22.123,device001,12345,sensors,temperature,25.6,celsius,1.0,0x01,0xAB12
2023-12-01 14:30:23.124,device001,12346,sensors,humidity,60.2,percent,1.0,0x01,0xCD34
```

## 8. 性能优化

### 8.1 大数据量导出优化

```json
{
  "csv": {
    "performance": {
      "enableStreaming": true,
      "chunkSize": 20000,
      "bufferSize": 2097152,
      "enableParallelWrite": true,
      "workerThreads": 4,
      "enableCompression": true,
      "compressionLevel": 6
    }
  }
}
```

### 8.2 内存使用优化

```json
{
  "csv": {
    "memory": {
      "maxMemoryUsage": "512MB",
      "enableMemoryMonitoring": true,
      "gcInterval": 30000,
      "enableDataCaching": false,
      "flushOnLowMemory": true
    }
  }
}
```

### 8.3 磁盘 I/O 优化

```json
{
  "csv": {
    "io": {
      "enableAsyncWrite": true,
      "writeBufferSize": 65536,
      "enableDirectIO": false,
      "fsyncInterval": 5000,
      "enableWriteCoalescing": true
    }
  }
}
```

## 9. 监控和进度反馈

### 9.1 导出进度监控

```typescript
import { CSVExporter } from '../shared/CSVExporter';

const exporter = new CSVExporter(config);

// 监听导出进度
exporter.on('progress', (progress) => {
  console.log(`导出进度: ${progress.percentage}%`);
  console.log(`已处理: ${progress.processed} / ${progress.total}`);
  console.log(`剩余时间: ${progress.estimatedTimeRemaining}ms`);
});

// 监听导出完成
exporter.on('completed', (result) => {
  console.log(`导出完成: ${result.filePath}`);
  console.log(`文件大小: ${result.fileSize} bytes`);
  console.log(`导出耗时: ${result.duration}ms`);
});

// 监听导出错误
exporter.on('error', (error) => {
  console.error('导出失败:', error);
});
```

### 9.2 性能统计

```typescript
// 获取导出性能统计
const stats = exporter.getStats();

console.log('导出统计信息:');
console.log(`总记录数: ${stats.totalRecords}`);
console.log(`处理速度: ${stats.recordsPerSecond} records/s`);
console.log(`平均写入速度: ${stats.avgWriteSpeed} MB/s`);
console.log(`内存使用峰值: ${stats.peakMemoryUsage} MB`);
console.log(`压缩比例: ${stats.compressionRatio}`);
```

## 10. 错误处理和恢复

### 10.1 错误处理配置

```json
{
  "csv": {
    "errorHandling": {
      "enableRetry": true,
      "maxRetryAttempts": 3,
      "retryDelay": 1000,
      "enablePartialRecovery": true,
      "logErrors": true,
      "errorLogPath": "./logs/csv-export-errors.log"
    }
  }
}
```

### 10.2 数据验证

```json
{
  "csv": {
    "validation": {
      "enabled": true,
      "validateHeaders": true,
      "validateDataTypes": true,
      "validateRange": true,
      "skipInvalidRecords": false,
      "maxErrorRate": 0.01
    }
  }
}
```

### 10.3 断点续传

```typescript
// 启用断点续传
const exporter = new CSVExporter({
  outputPath: './exports/data.csv',
  enableResume: true,
  resumeCheckpointInterval: 10000
});

// 从断点恢复导出
if (await exporter.hasCheckpoint()) {
  console.log('发现导出断点，从断点继续...');
  await exporter.resumeFromCheckpoint();
} else {
  await exporter.export(dataArray);
}
```

## 11. 实际应用场景

### 11.1 传感器数据定期导出

```typescript
// 定时导出传感器数据
class SensorDataExporter {
  private exporter: CSVExporter;
  private exportInterval: NodeJS.Timeout;

  constructor() {
    this.exporter = new CSVExporter({
      outputPath: './exports/sensors',
      fileNameTemplate: 'sensors_{{date}}.csv',
      enableStreaming: true
    });

    // 每小时导出一次
    this.exportInterval = setInterval(() => {
      this.exportHourlyData();
    }, 3600000);
  }

  private async exportHourlyData() {
    const hourlyData = await this.getSensorDataForLastHour();
    await this.exporter.export(hourlyData);
  }
}
```

### 11.2 实时数据流导出

```typescript
// 实时数据流导出
class RealTimeDataExporter {
  private streamExporter: StreamingCSVExporter;

  constructor() {
    this.streamExporter = new StreamingCSVExporter({
      outputPath: './exports/realtime_data.csv',
      flushInterval: 5000,
      enableCompression: true
    });
  }

  async start() {
    await this.streamExporter.start();
    
    // 监听串口数据
    serialPort.on('data', (data) => {
      const parsedData = this.parseData(data);
      this.streamExporter.addData(parsedData);
    });
  }
}
```

### 11.3 批量历史数据导出

```typescript
// 批量历史数据导出
class HistoricalDataExporter {
  private batchExporter: BatchCSVExporter;

  constructor() {
    this.batchExporter = new BatchCSVExporter({
      outputPath: './exports/historical',
      batchSize: 50000,
      enableParallelProcessing: true,
      workerThreads: 4
    });
  }

  async exportDateRange(startDate: Date, endDate: Date) {
    const data = await this.getHistoricalData(startDate, endDate);
    
    // 按日期分批导出
    const dailyBatches = this.groupByDate(data);
    
    for (const [date, dailyData] of dailyBatches) {
      const fileName = `historical_${date}.csv`;
      await this.batchExporter.exportBatch(dailyData, fileName);
    }
  }
}
```

## 12. 故障排除

### 12.1 常见问题

#### 问题1：导出文件为空
**原因：** 数据过滤条件过于严格或数据范围选择错误
**解决方案：**
```typescript
// 检查数据选择条件
const dataCount = await dataService.countRecords(exportConfig.filters);
if (dataCount === 0) {
  console.warn('没有匹配的数据记录，请检查过滤条件');
}
```

#### 问题2：导出性能低
**原因：** 缓冲区设置不当或磁盘 I/O 性能限制
**解决方案：**
```json
{
  "csv": {
    "performance": {
      "chunkSize": 10000,
      "bufferSize": 1048576,
      "enableParallelWrite": true
    }
  }
}
```

#### 问题3：内存使用过高
**原因：** 大数据量一次性加载到内存
**解决方案：**
```json
{
  "csv": {
    "streaming": {
      "enabled": true,
      "maxMemoryUsage": "256MB",
      "enableBackpressure": true
    }
  }
}
```

#### 问题4：文件编码问题
**原因：** 字符编码设置不正确
**解决方案：**
```json
{
  "csv": {
    "export": {
      "encoding": "utf8",
      "addBOM": true
    }
  }
}
```

### 12.2 调试和日志

```json
{
  "csv": {
    "debug": {
      "enabled": true,
      "logLevel": "debug",
      "logFile": "./logs/csv-export.log",
      "enablePerformanceLogging": true,
      "logDataSamples": false
    }
  }
}
```

## 13. 配置模板

### 13.1 实时数据导出配置

```json
{
  "csv": {
    "export": {
      "enabled": true,
      "outputPath": "./exports/realtime",
      "fileNameTemplate": "realtime_{{timestamp}}.csv"
    },
    "streaming": {
      "enabled": true,
      "flushInterval": 1000,
      "chunkSize": 1000,
      "enableBackpressure": true
    },
    "format": {
      "includeHeaders": true,
      "dateFormat": "YYYY-MM-DD HH:mm:ss.SSS"
    }
  }
}
```

### 13.2 批量数据导出配置

```json
{
  "csv": {
    "export": {
      "enabled": true,
      "outputPath": "./exports/batch",
      "fileNameTemplate": "batch_{{date}}.csv"
    },
    "batch": {
      "enabled": true,
      "batchSize": 10000,
      "enableParallelProcessing": true,
      "workerThreads": 2
    },
    "performance": {
      "enableCompression": true,
      "compressionLevel": 6
    }
  }
}
```

### 13.3 高性能导出配置

```json
{
  "csv": {
    "export": {
      "enabled": true,
      "outputPath": "./exports/highperf",
      "enableCompression": false
    },
    "performance": {
      "chunkSize": 50000,
      "bufferSize": 4194304,
      "enableParallelWrite": true,
      "workerThreads": 4
    },
    "io": {
      "enableAsyncWrite": true,
      "writeBufferSize": 131072
    },
    "memory": {
      "maxMemoryUsage": "1GB",
      "enableMemoryMonitoring": true
    }
  }
}
```

---

通过以上详细的 CSV 导出功能使用说明，您可以充分利用 Serial-Studio VSCode 插件的强大导出能力，高效地处理和导出串口数据。根据不同的使用场景选择合适的配置选项，获得最佳的导出性能和用户体验。